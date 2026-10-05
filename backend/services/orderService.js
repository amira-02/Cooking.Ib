const crypto = require("crypto");
const { db, admin } = require("../config/firebase");
const mailer = require("../config/mailer");
const { SHOP, parisDate } = require("../config/shop");
const emails = require("./orderEmails");
const paypal = require("./paypalService");

/*
 * Précommandes : collection « orders ».
 *
 * Statut de commande (status) :
 *   PENDING                      demande envoyée, en attente de validation
 *   AWAITING_CUSTOMER_SELECTION  validée par l'admin : le client choisit créneau + paiement
 *   CONFIRMED                    créneau et paiement choisis
 *   READY_FOR_PICKUP             préparée, prête à être retirée
 *   COMPLETED                    retirée (code vérifié)
 *   CANCELLED                    annulée par l'admin (avec motif)
 *
 * Statut de paiement (paymentStatus), indépendant :
 *   PENDING | CASH_ON_PICKUP | PAID | FAILED
 *
 * Document :
 *   orderNumber, pickupCode, userId, customer {firstName,lastName,email,phone},
 *   items [{productId, productName, image, category, quantity, unitPrice, totalPrice}],
 *   subtotal, totalAmount, status, paymentMethod (null|CASH|PAYPAL), paymentStatus,
 *   payment {method,status,transactionId,amount,paidAt}, paypal {orderId,createdAt},
 *   requestedPickupDate, proposedSlots [{id,date,startTime,endTime}], selectedSlot,
 *   customerNote, adminMessage, cancellationReason, stockReserved,
 *   createdAt, confirmedAt, slotSelectedAt, readyAt, completedAt, cancelledAt,
 *   confirmedBy / cancelledBy / completedBy {uid,email}, history [...]
 */

const STATUS = {
  PENDING: "PENDING",
  AWAITING: "AWAITING_CUSTOMER_SELECTION",
  CONFIRMED: "CONFIRMED",
  READY: "READY_FOR_PICKUP",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};
const PAYMENT = { PENDING: "PENDING", CASH: "CASH_ON_PICKUP", PAID: "PAID", FAILED: "FAILED" };

const FieldValue = admin.firestore.FieldValue;
const ordersCol = db.collection("orders");
const productsCol = db.collection("products");
const codesCol = db.collection("pickupCodes");

// Sans 0/O ni 1/I pour éviter les confusions à l'oral et à la saisie (32^6 ≈ 1 milliard de codes)
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;

function httpError(status, code, message, details) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  if (details) error.details = details;
  return error;
}

const round2 = (n) => Math.round(n * 100) / 100;
const now = () => new Date().toISOString();
const actorOf = (user) => ({ uid: user.uid, email: user.email || "" });

function historyEntry(type, message, { actor = "system", visibility = "all" } = {}) {
  return { at: now(), type, message, actor, visibility };
}

function randomPickupCode() {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) code += CODE_ALPHABET[crypto.randomInt(CODE_ALPHABET.length)];
  return code;
}

const normalizeCode = (code) => String(code ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");

function sameCode(a, b) {
  const bufA = Buffer.from(normalizeCode(a));
  const bufB = Buffer.from(normalizeCode(b));
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

// ---------------------------------------------------------------------------
// Sérialisation : le client ne voit ni les infos internes ni l'historique réservé à l'admin
// ---------------------------------------------------------------------------
const INTERNAL_FIELDS = ["stockReserved", "confirmedBy", "cancelledBy", "completedBy", "paypal", "pendingSlotId"];

function serialize(id, data, { forAdmin = false } = {}) {
  const order = { id, ...data };
  if (forAdmin) return order;
  for (const field of INTERNAL_FIELDS) delete order[field];
  order.history = (order.history || []).filter((h) => h.visibility !== "admin");
  // Le code de retrait n'est communiqué qu'une fois la précommande validée
  if (order.status === STATUS.PENDING || order.status === STATUS.CANCELLED) delete order.pickupCode;
  return order;
}

// ---------------------------------------------------------------------------
// Emails (un échec d'envoi ne bloque jamais la commande : il est noté dans l'historique)
// ---------------------------------------------------------------------------
let adminEmailsCache = { at: 0, list: [] };
async function adminEmails() {
  if (Date.now() - adminEmailsCache.at < 5 * 60 * 1000) return adminEmailsCache.list;
  const snap = await db.collection("users").where("role", "==", "admin").get();
  const extra = (process.env.ADMIN_EMAIL || "").split(",").map((e) => e.trim()).filter(Boolean);
  const list = [...new Set([...snap.docs.map((d) => d.data().email).filter(Boolean), ...extra])];
  adminEmailsCache = { at: Date.now(), list };
  return list;
}

async function sendEmail(orderId, to, template, label) {
  const recipients = Array.isArray(to) ? to : [to];
  for (const recipient of recipients) {
    try {
      await mailer.sendMail({ from: process.env.MAIL_FROM || process.env.SMTP_USER, to: recipient, ...template });
      await ordersCol.doc(orderId).update({
        history: FieldValue.arrayUnion(historyEntry("email", `Email envoyé : ${label}`, { visibility: "admin" })),
      });
    } catch (error) {
      console.error(`Email « ${label} » non envoyé pour ${orderId} :`, error.message);
      await ordersCol
        .doc(orderId)
        .update({ history: FieldValue.arrayUnion(historyEntry("email_failed", `Échec de l'envoi de l'email : ${label}`, { visibility: "admin" })) })
        .catch(() => {});
    }
  }
}

async function notifyAdmins(order, template, label) {
  const recipients = await adminEmails();
  if (recipients.length) await sendEmail(order.id, recipients, template, label);
}

async function reload(id) {
  const snap = await ordersCol.doc(id).get();
  return { id, ...snap.data() };
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------
const isDate = (v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`));
const isTime = (v) => typeof v === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
const cleanText = (v, max) => String(v ?? "").trim().slice(0, max);

function validateCustomer(customer) {
  const firstName = cleanText(customer?.firstName, 60);
  const lastName = cleanText(customer?.lastName, 60);
  const phone = cleanText(customer?.phone, 30);
  if (!firstName || !lastName) throw httpError(400, "invalid_customer", "Veuillez indiquer votre prénom et votre nom.");
  if (phone.replace(/\D/g, "").length < 8) throw httpError(400, "invalid_phone", "Veuillez indiquer un numéro de téléphone valide.");
  return { firstName, lastName, phone };
}

function mergeItems(items) {
  if (!Array.isArray(items) || items.length === 0) throw httpError(400, "empty_cart", "Votre panier est vide.");
  const merged = new Map();
  for (const item of items) {
    const quantity = Number(item?.quantity);
    if (typeof item?.productId !== "string" || !/^[\w-]{1,80}$/.test(item.productId) || !Number.isInteger(quantity) || quantity < 1) {
      throw httpError(400, "invalid_item", "Un article du panier est invalide.");
    }
    merged.set(item.productId, (merged.get(item.productId) ?? 0) + quantity);
  }
  if (merged.size > SHOP.maxItemsPerOrder) throw httpError(400, "too_many_items", "Votre panier contient trop d'articles différents.");
  return [...merged.entries()].map(([productId, quantity]) => ({ productId, quantity }));
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------
function getConfig() {
  return {
    currency: SHOP.currency,
    maxQuantityPerItem: SHOP.maxQuantityPerItem,
    minLeadDays: SHOP.minLeadDays,
    maxLeadDays: SHOP.maxLeadDays,
    earliestPickupDate: parisDate(SHOP.minLeadDays),
    latestPickupDate: parisDate(SHOP.maxLeadDays),
    defaultSlotTimes: SHOP.defaultSlotTimes,
    paypalEnabled: paypal.isConfigured(),
    paypalMode: paypal.MODE,
  };
}

async function createOrder(user, body) {
  if (!user.emailVerified) {
    throw httpError(403, "email_not_verified", "Veuillez vérifier votre adresse email avant d'envoyer une précommande.");
  }
  const customer = { ...validateCustomer(body.customer), email: user.email };
  const items = mergeItems(body.items);
  const requestedPickupDate = body.requestedPickupDate;
  if (!isDate(requestedPickupDate) || requestedPickupDate < parisDate(SHOP.minLeadDays) || requestedPickupDate > parisDate(SHOP.maxLeadDays)) {
    throw httpError(400, "invalid_date", `Choisissez une date de retrait à partir du ${emails.longDate(parisDate(SHOP.minLeadDays))}.`);
  }
  const customerNote = cleanText(body.customerNote, 1000);

  const pending = await ordersCol.where("userId", "==", user.uid).where("status", "==", STATUS.PENDING).get();
  if (pending.size >= SHOP.maxPendingOrdersPerUser) {
    throw httpError(429, "too_many_pending", "Vous avez déjà plusieurs précommandes en attente. Patientez jusqu'à leur validation.");
  }

  const categories = new Map((await db.collection("categories").get()).docs.map((d) => [d.id, d.data().name]));

  const order = await db.runTransaction(async (tx) => {
    // Prix, disponibilité et stock relus côté serveur : jamais ceux envoyés par le navigateur
    const productSnaps = await tx.getAll(...items.map((i) => productsCol.doc(i.productId)));
    const lines = items.map(({ productId, quantity }, index) => {
      const snap = productSnaps[index];
      const product = snap.exists ? snap.data() : null;
      if (!product || product.isAvailable === false) {
        throw httpError(409, "product_unavailable", `« ${product?.name ?? "Un produit"} » n'est plus disponible.`, { productId });
      }
      const max = Math.min(SHOP.maxQuantityPerItem, typeof product.stock === "number" ? product.stock : Infinity);
      if (quantity > max) {
        throw httpError(409, "insufficient_stock", `Quantité maximale disponible pour « ${product.name} » : ${max}.`, { productId, available: max });
      }
      const unitPrice = round2(Number(product.price) || 0);
      return {
        productId,
        productName: product.name,
        image: (product.images && product.images[0]) || "",
        category: categories.get(product.categoryId) || "",
        quantity,
        unitPrice,
        totalPrice: round2(unitPrice * quantity),
      };
    });

    const year = parisDate().slice(0, 4);
    const counterRef = db.collection("counters").doc(`orders-${year}`);
    const counter = await tx.get(counterRef);
    const sequence = counter.exists ? counter.data().next : 1;

    // Code de retrait unique : réservé dans pickupCodes/{code}
    let pickupCode = null;
    for (let attempt = 0; attempt < 8 && !pickupCode; attempt++) {
      const candidate = randomPickupCode();
      if (!(await tx.get(codesCol.doc(candidate))).exists) pickupCode = candidate;
    }
    if (!pickupCode) throw httpError(500, "code_generation_failed", "Impossible de générer un code de retrait, réessayez.");

    const subtotal = round2(lines.reduce((s, l) => s + l.totalPrice, 0));
    const ref = ordersCol.doc();
    const data = {
      orderNumber: `CMD-${year}-${String(sequence).padStart(5, "0")}`,
      pickupCode,
      userId: user.uid,
      customer,
      items: lines,
      subtotal,
      totalAmount: subtotal,
      status: STATUS.PENDING,
      paymentMethod: null,
      paymentStatus: PAYMENT.PENDING,
      payment: null,
      requestedPickupDate,
      proposedSlots: [],
      selectedSlot: null,
      customerNote,
      adminMessage: "",
      cancellationReason: "",
      stockReserved: false,
      createdAt: now(),
      confirmedAt: null,
      slotSelectedAt: null,
      readyAt: null,
      completedAt: null,
      cancelledAt: null,
      history: [historyEntry("created", "Précommande envoyée", { actor: "client" })],
    };
    tx.set(counterRef, { next: sequence + 1 }, { merge: true });
    tx.set(ref, data);
    tx.set(codesCol.doc(pickupCode), { orderId: ref.id, used: false, createdAt: data.createdAt });
    return { id: ref.id, ...data };
  });

  await notifyAdmins(order, emails.newOrderAdmin(order), "nouvelle précommande (administrateur)");
  await sendEmail(order.id, order.customer.email, emails.orderReceivedClient(order), "accusé de réception (client)");
  return serialize(order.id, await reload(order.id));
}

async function getOwnedOrder(user, id) {
  const snap = await ordersCol.doc(id).get();
  // 404 aussi quand la commande appartient à quelqu'un d'autre : on ne révèle pas son existence
  if (!snap.exists || snap.data().userId !== user.uid) throw httpError(404, "not_found", "Commande introuvable.");
  return snap;
}

async function getForUser(user, id) {
  const snap = await getOwnedOrder(user, id);
  return serialize(snap.id, snap.data());
}

async function listForUser(user) {
  const snap = await ordersCol.where("userId", "==", user.uid).get();
  return snap.docs
    .map((d) => serialize(d.id, d.data()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// Choix du créneau + paiement par le client
async function selectOptions(user, id, { slotId, paymentMethod }) {
  const snap = await getOwnedOrder(user, id);
  const order = snap.data();
  if (order.status !== STATUS.AWAITING) {
    throw httpError(409, "invalid_status", "Cette commande n'attend plus de choix de votre part.");
  }
  if (order.paymentStatus === PAYMENT.PAID) throw httpError(409, "already_paid", "Cette commande est déjà payée.");
  const slot = (order.proposedSlots || []).find((s) => s.id === slotId);
  if (!slot) throw httpError(400, "invalid_slot", "Veuillez choisir l'un des créneaux proposés.");
  if (slot.date < parisDate()) throw httpError(400, "slot_expired", "Ce créneau est passé, choisissez-en un autre.");

  if (paymentMethod === "CASH") {
    await db.runTransaction(async (tx) => {
      const fresh = await tx.get(snap.ref);
      if (fresh.data().status !== STATUS.AWAITING) throw httpError(409, "invalid_status", "Cette commande n'attend plus de choix de votre part.");
      tx.update(snap.ref, {
        status: STATUS.CONFIRMED,
        selectedSlot: slot,
        paymentMethod: "CASH",
        paymentStatus: PAYMENT.CASH,
        slotSelectedAt: now(),
        history: FieldValue.arrayUnion(
          historyEntry("slot_selected", `Créneau choisi : ${emails.slotLabel(slot)}`, { actor: "client" }),
          historyEntry("payment_method", "Paiement : espèces lors du retrait", { actor: "client" })
        ),
      });
    });
    const updated = await reload(id);
    await sendEmail(id, updated.customer.email, emails.orderScheduledClient(updated), "retrait planifié (client)");
    await notifyAdmins(updated, emails.adminUpdate(updated, "Créneau choisi", `Le client a choisi son créneau et paiera en espèces au retrait.`), "créneau choisi (administrateur)");
    return { order: serialize(id, await reload(id)) };
  }

  if (paymentMethod === "PAYPAL") {
    if (!paypal.isConfigured()) throw httpError(400, "paypal_unavailable", "Le paiement PayPal n'est pas encore disponible.");
    const base = `${SHOP.siteUrl}/mes-commandes/${id}`;
    let payment;
    try {
      payment = await paypal.createPayment({
        orderId: id,
        orderNumber: order.orderNumber,
        amount: order.totalAmount,
        returnUrl: `${base}?paypal=success`,
        cancelUrl: `${base}?paypal=cancel`,
      });
    } catch (error) {
      console.error("PayPal :", error.message);
      throw httpError(502, "paypal_error", "PayPal est momentanément indisponible. Réessayez ou choisissez le paiement en espèces.");
    }
    await snap.ref.update({
      paymentMethod: "PAYPAL",
      paymentStatus: PAYMENT.PENDING,
      paypal: { orderId: payment.paypalOrderId, createdAt: now() },
      pendingSlotId: slot.id,
      history: FieldValue.arrayUnion(historyEntry("payment_started", "Paiement PayPal démarré", { actor: "client" })),
    });
    return { approveUrl: payment.approveUrl };
  }

  throw httpError(400, "invalid_payment_method", "Veuillez choisir un mode de paiement.");
}

// Retour de PayPal après validation du paiement par le client
async function capturePaypal(user, id, paypalOrderId) {
  const snap = await getOwnedOrder(user, id);
  const order = snap.data();
  if (order.paymentStatus === PAYMENT.PAID) return serialize(id, order); // déjà encaissé (rechargement de page)
  if (!order.paypal?.orderId || order.paypal.orderId !== paypalOrderId) {
    throw httpError(400, "invalid_payment", "Ce paiement ne correspond pas à votre commande.");
  }
  if (order.status !== STATUS.AWAITING) throw httpError(409, "invalid_status", "Cette commande ne peut plus être payée.");

  const result = await paypal.capturePayment(paypalOrderId);
  const amountOk = result.amount !== null && Math.abs(result.amount - order.totalAmount) < 0.01 && result.currency === "EUR";

  if (!result.completed || !amountOk) {
    await snap.ref.update({
      paymentStatus: PAYMENT.FAILED,
      history: FieldValue.arrayUnion(
        historyEntry("payment_failed", "Le paiement PayPal n'a pas abouti", { actor: "system" }),
        historyEntry("payment_failed_detail", `Détail PayPal : ${JSON.stringify(result.raw)}`, { visibility: "admin" })
      ),
    });
    throw httpError(402, "payment_failed", "Le paiement n'a pas abouti. Vous pouvez réessayer ou choisir le paiement en espèces.");
  }

  const slot = (order.proposedSlots || []).find((s) => s.id === order.pendingSlotId) || null;
  const paidAt = now();
  await snap.ref.update({
    status: STATUS.CONFIRMED,
    selectedSlot: slot,
    slotSelectedAt: paidAt,
    paymentStatus: PAYMENT.PAID,
    payment: { method: "PAYPAL", status: PAYMENT.PAID, transactionId: result.transactionId, amount: result.amount, paidAt },
    history: FieldValue.arrayUnion(
      historyEntry("slot_selected", `Créneau choisi : ${slot ? emails.slotLabel(slot) : "—"}`, { actor: "client" }),
      historyEntry("payment_paid", `Paiement PayPal reçu (${emails.money(result.amount)})`, { actor: "system" })
    ),
  });
  const updated = await reload(id);
  await sendEmail(id, updated.customer.email, emails.orderScheduledClient(updated), "paiement confirmé (client)");
  await notifyAdmins(updated, emails.adminUpdate(updated, "Paiement reçu", `Paiement PayPal de ${emails.money(result.amount)} reçu.`), "paiement reçu (administrateur)");
  return serialize(id, await reload(id));
}

// Le client est revenu de PayPal sans payer
async function cancelPaypal(user, id) {
  const snap = await getOwnedOrder(user, id);
  const order = snap.data();
  if (order.paymentMethod === "PAYPAL" && order.paymentStatus !== PAYMENT.PAID && order.status === STATUS.AWAITING) {
    await snap.ref.update({
      paymentMethod: null,
      paymentStatus: PAYMENT.PENDING,
      history: FieldValue.arrayUnion(historyEntry("payment_cancelled", "Paiement PayPal interrompu", { actor: "client" })),
    });
  }
  return serialize(id, await reload(id));
}

// ---------------------------------------------------------------------------
// Administration
// ---------------------------------------------------------------------------
async function adminGet(id) {
  const snap = await ordersCol.doc(id).get();
  if (!snap.exists) throw httpError(404, "not_found", "Commande introuvable.");
  return snap;
}

function validateSlots(slots) {
  if (!Array.isArray(slots) || slots.length === 0) throw httpError(400, "no_slots", "Proposez au moins un créneau de retrait.");
  if (slots.length > 20) throw httpError(400, "too_many_slots", "20 créneaux maximum.");
  const today = parisDate();
  const seen = new Set();
  return slots
    .map((s) => {
      if (!isDate(s?.date) || !isTime(s?.startTime) || !isTime(s?.endTime) || s.endTime <= s.startTime) {
        throw httpError(400, "invalid_slot", "Un créneau est invalide.");
      }
      if (s.date < today) throw httpError(400, "invalid_slot", "Un créneau est dans le passé.");
      return { date: s.date, startTime: s.startTime, endTime: s.endTime };
    })
    .filter((s) => {
      const key = `${s.date}|${s.startTime}|${s.endTime}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`))
    .map((s, i) => ({ id: `slot-${i + 1}`, ...s }));
}

async function confirmOrder(adminUser, id, { slots, message }) {
  const proposedSlots = validateSlots(slots);
  const adminMessage = cleanText(message, 500);
  const ref = ordersCol.doc(id);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw httpError(404, "not_found", "Commande introuvable.");
    const order = snap.data();
    if (order.status !== STATUS.PENDING) throw httpError(409, "invalid_status", "Seule une précommande en attente peut être confirmée.");

    // Réservation du stock des produits suivis
    const productSnaps = await tx.getAll(...order.items.map((i) => productsCol.doc(i.productId)));
    order.items.forEach((item, index) => {
      const product = productSnaps[index].exists ? productSnaps[index].data() : null;
      if (product && typeof product.stock === "number" && product.stock < item.quantity) {
        throw httpError(409, "insufficient_stock", `Stock insuffisant pour « ${item.productName} » : ${product.stock} disponible(s).`);
      }
    });
    order.items.forEach((item, index) => {
      const product = productSnaps[index].exists ? productSnaps[index].data() : null;
      if (product && typeof product.stock === "number") tx.update(productsCol.doc(item.productId), { stock: FieldValue.increment(-item.quantity) });
    });

    tx.update(ref, {
      status: STATUS.AWAITING,
      proposedSlots,
      adminMessage,
      stockReserved: true,
      confirmedAt: now(),
      confirmedBy: actorOf(adminUser),
      history: FieldValue.arrayUnion(
        historyEntry("confirmed", "Précommande confirmée par la pâtisserie", { actor: "admin" }),
        historyEntry("slots_proposed", `${proposedSlots.length} créneau(x) de retrait proposé(s)`, { actor: "admin" })
      ),
    });
  });

  const updated = await reload(id);
  await sendEmail(id, updated.customer.email, emails.orderConfirmedClient(updated, { paypalEnabled: paypal.isConfigured() }), "précommande confirmée (client)");
  return serialize(id, await reload(id), { forAdmin: true });
}

async function cancelOrder(adminUser, id, { reason }) {
  const cancellationReason = cleanText(reason, 500);
  if (cancellationReason.length < 3) throw httpError(400, "reason_required", "Indiquez le motif de l'annulation.");
  const ref = ordersCol.doc(id);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw httpError(404, "not_found", "Commande introuvable.");
    const order = snap.data();
    if (order.status === STATUS.COMPLETED || order.status === STATUS.CANCELLED) {
      throw httpError(409, "invalid_status", "Cette commande ne peut plus être annulée.");
    }
    // Remise en stock si le stock avait été réservé à la confirmation
    if (order.stockReserved) {
      const productSnaps = await tx.getAll(...order.items.map((i) => productsCol.doc(i.productId)));
      order.items.forEach((item, index) => {
        const product = productSnaps[index].exists ? productSnaps[index].data() : null;
        if (product && typeof product.stock === "number") tx.update(productsCol.doc(item.productId), { stock: FieldValue.increment(item.quantity) });
      });
    }
    const entries = [historyEntry("cancelled", `Précommande annulée — motif : ${cancellationReason}`, { actor: "admin" })];
    if (order.paymentStatus === PAYMENT.PAID) {
      entries.push(historyEntry("refund_needed", "Paiement PayPal à rembourser depuis votre compte PayPal", { actor: "system", visibility: "admin" }));
    }
    tx.update(ref, {
      status: STATUS.CANCELLED,
      cancellationReason,
      cancelledAt: now(),
      cancelledBy: actorOf(adminUser),
      stockReserved: false,
      history: FieldValue.arrayUnion(...entries),
    });
    tx.set(codesCol.doc(order.pickupCode), { used: true }, { merge: true });
  });

  const updated = await reload(id);
  await sendEmail(id, updated.customer.email, emails.orderCancelledClient(updated), "précommande annulée (client)");
  return serialize(id, await reload(id), { forAdmin: true });
}

async function markReady(adminUser, id) {
  const snap = await adminGet(id);
  if (snap.data().status !== STATUS.CONFIRMED) {
    throw httpError(409, "invalid_status", "Seule une commande confirmée (créneau choisi) peut être marquée prête.");
  }
  await snap.ref.update({
    status: STATUS.READY,
    readyAt: now(),
    history: FieldValue.arrayUnion(historyEntry("ready", "Commande prête pour le retrait", { actor: "admin" })),
  });
  const updated = await reload(id);
  await sendEmail(id, updated.customer.email, emails.orderReadyClient(updated), "commande prête (client)");
  return serialize(id, await reload(id), { forAdmin: true });
}

function assertPickupAllowed(order) {
  if (order.status === STATUS.COMPLETED) throw httpError(409, "already_completed", "Cette commande a déjà été récupérée : le code n'est plus valable.");
  if (order.status === STATUS.CANCELLED) throw httpError(409, "invalid_status", "Cette commande est annulée.");
  if (order.status !== STATUS.CONFIRMED && order.status !== STATUS.READY) {
    throw httpError(409, "invalid_status", "Le client n'a pas encore choisi son créneau et son paiement.");
  }
}

async function verifyPickupCode(adminUser, id, code) {
  const snap = await adminGet(id);
  const order = snap.data();
  assertPickupAllowed(order);
  const valid = sameCode(code, order.pickupCode);
  await snap.ref.update({
    history: FieldValue.arrayUnion(
      historyEntry(valid ? "code_verified" : "code_rejected", valid ? "Code de retrait vérifié" : "Code de retrait incorrect saisi", {
        actor: "admin",
        visibility: "admin",
      })
    ),
  });
  if (!valid) throw httpError(400, "invalid_pickup_code", "Le code ne correspond pas à cette commande.");
  return { valid: true };
}

async function completeOrder(adminUser, id, code) {
  const ref = ordersCol.doc(id);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw httpError(404, "not_found", "Commande introuvable.");
    const order = snap.data();
    assertPickupAllowed(order);
    if (!sameCode(code, order.pickupCode)) throw httpError(400, "invalid_pickup_code", "Le code ne correspond pas à cette commande.");

    const completedAt = now();
    const update = {
      status: STATUS.COMPLETED,
      completedAt,
      completedBy: actorOf(adminUser),
      history: FieldValue.arrayUnion(historyEntry("completed", "Commande récupérée", { actor: "admin" })),
    };
    // Paiement en espèces encaissé au moment du retrait
    if (order.paymentStatus === PAYMENT.CASH) {
      update.paymentStatus = PAYMENT.PAID;
      update.payment = { method: "CASH", status: PAYMENT.PAID, transactionId: null, amount: order.totalAmount, paidAt: completedAt };
    }
    tx.update(ref, update);
    // Le code ne pourra plus jamais être réutilisé
    tx.set(codesCol.doc(order.pickupCode), { used: true, usedAt: completedAt }, { merge: true });
  });

  const updated = await reload(id);
  await sendEmail(id, updated.customer.email, emails.orderCompletedClient(updated), "commande récupérée (client)");
  return serialize(id, await reload(id), { forAdmin: true });
}

module.exports = {
  STATUS,
  PAYMENT,
  getConfig,
  createOrder,
  getForUser,
  listForUser,
  selectOptions,
  capturePaypal,
  cancelPaypal,
  confirmOrder,
  cancelOrder,
  markReady,
  verifyPickupCode,
  completeOrder,
  serialize,
};
