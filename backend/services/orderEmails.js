const { SHOP } = require("../config/shop");

// Modèles d'emails des précommandes : une mise en page commune (tableaux + styles en ligne,
// seule méthode fiable dans les messageries), lisible sur mobile (largeur fluide, max 560 px).

const COLORS = { ink: "#4A3028", light: "#85695D", cream: "#FFF9F3", beige: "#F4E9DE", rose: "#B57A7A", border: "#EADBCB" };

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const money = (amount) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: SHOP.currency }).format(amount);

// "2026-10-15" -> "jeudi 15 octobre 2026"
function longDate(isoDate) {
  if (!isoDate) return "";
  return new Date(`${isoDate}T12:00:00Z`).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

const slotLabel = (slot) => `${longDate(slot.date)} · ${slot.startTime} – ${slot.endTime}`;

function layout({ preheader, title, intro, sections = [], button, footerNote }) {
  const sectionHtml = sections
    .filter(Boolean)
    .map(
      (s) => `<tr><td style="padding:0 32px 24px">
        ${s.title ? `<p style="margin:0 0 10px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:${COLORS.light}">${escapeHtml(s.title)}</p>` : ""}
        ${s.html}
      </td></tr>`
    )
    .join("");

  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${COLORS.cream};font-family:Arial,Helvetica,sans-serif;color:${COLORS.ink}">
<span style="display:none;max-height:0;overflow:hidden">${escapeHtml(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.cream};padding:24px 12px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid ${COLORS.border};border-radius:16px;overflow:hidden">
  <tr><td style="padding:28px 32px 8px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:${COLORS.ink}">Cooking <em style="color:${COLORS.rose}">Ib</em></td></tr>
  <tr><td style="padding:8px 32px 8px;font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:1.25;color:${COLORS.ink}">${escapeHtml(title)}</td></tr>
  <tr><td style="padding:8px 32px 24px;font-size:15px;line-height:1.6;color:${COLORS.light}">${intro}</td></tr>
  ${sectionHtml}
  ${
    button
      ? `<tr><td style="padding:4px 32px 32px"><a href="${button.url}" style="display:inline-block;background:${COLORS.ink};color:#ffffff;text-decoration:none;font-size:15px;font-weight:bold;padding:14px 26px;border-radius:12px">${escapeHtml(button.label)}</a></td></tr>`
      : ""
  }
  <tr><td style="padding:20px 32px;background:${COLORS.cream};font-size:12px;line-height:1.6;color:${COLORS.light}">
    ${footerNote ? `${footerNote}<br>` : ""}${SHOP.name} — Pâtisserie artisanale &amp; trompe-l'œil
  </td></tr>
</table></td></tr></table></body></html>`;
  return html;
}

function itemsTable(order) {
  const rows = order.items
    .map(
      (i) => `<tr>
        <td style="padding:8px 0;border-bottom:1px solid ${COLORS.beige};font-size:14px">${escapeHtml(i.productName)} <span style="color:${COLORS.light}">× ${i.quantity}</span></td>
        <td style="padding:8px 0;border-bottom:1px solid ${COLORS.beige};font-size:14px;text-align:right;white-space:nowrap">${money(i.totalPrice)}</td>
      </tr>`
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}
    <tr><td style="padding:12px 0 0;font-size:16px;font-weight:bold">Total</td>
    <td style="padding:12px 0 0;font-size:16px;font-weight:bold;text-align:right">${money(order.totalAmount)}</td></tr></table>`;
}

const itemsText = (order) =>
  order.items.map((i) => `- ${i.productName} × ${i.quantity} : ${money(i.totalPrice)}`).join("\n") + `\nTotal : ${money(order.totalAmount)}`;

function pickupCodeBox(code) {
  return `<div style="background:${COLORS.cream};border:1px dashed ${COLORS.rose};border-radius:12px;padding:18px;text-align:center">
    <div style="font-size:30px;font-weight:bold;letter-spacing:8px;color:${COLORS.ink}">${escapeHtml(code)}</div>
    <div style="margin-top:6px;font-size:13px;color:${COLORS.light}">Présentez ce code lors du retrait de votre commande.</div>
  </div>`;
}

const p = (text) => `<p style="margin:0;font-size:14px;line-height:1.6">${text}</p>`;
const orderUrl = (order) => `${SHOP.siteUrl}/mes-commandes/${order.id}`;
const adminUrl = (order) => `${SHOP.siteUrl}/admin/orders?commande=${order.id}`;
const firstName = (order) => escapeHtml(order.customer.firstName);

// --- 1. Nouvelle précommande -> administrateur ---
function newOrderAdmin(order) {
  const c = order.customer;
  return {
    subject: `Nouvelle précommande — ${order.orderNumber}`,
    text: `Nouvelle précommande ${order.orderNumber}\n\nClient : ${c.firstName} ${c.lastName}\nEmail : ${c.email}\nTéléphone : ${c.phone}\n\n${itemsText(order)}\n\nDate souhaitée : ${longDate(order.requestedPickupDate)}\nMessage : ${order.customerNote || "—"}\n\nVoir la commande : ${adminUrl(order)}`,
    html: layout({
      preheader: `${c.firstName} ${c.lastName} · ${money(order.totalAmount)}`,
      title: "Nouvelle précommande",
      intro: `La précommande <strong>${order.orderNumber}</strong> attend votre validation.`,
      sections: [
        {
          title: "Client",
          html: p(`${escapeHtml(c.firstName)} ${escapeHtml(c.lastName)}<br><a href="mailto:${escapeHtml(c.email)}" style="color:${COLORS.ink}">${escapeHtml(c.email)}</a><br>${escapeHtml(c.phone)}`),
        },
        { title: "Produits", html: itemsTable(order) },
        { title: "Date souhaitée", html: p(longDate(order.requestedPickupDate)) },
        order.customerNote && { title: "Message du client", html: p(`« ${escapeHtml(order.customerNote)} »`) },
      ],
      button: { label: "Voir la commande", url: adminUrl(order) },
    }),
  };
}

// --- 2. Accusé de réception -> client ---
function orderReceivedClient(order) {
  return {
    subject: `Nous avons bien reçu votre précommande ${order.orderNumber}`,
    text: `Bonjour ${order.customer.firstName},\n\nVotre demande de précommande ${order.orderNumber} a bien été envoyée. Elle est en attente de confirmation par notre équipe : nous revenons vers vous rapidement.\n\n${itemsText(order)}\n\nDate souhaitée : ${longDate(order.requestedPickupDate)}\n\nSuivre ma commande : ${orderUrl(order)}`,
    html: layout({
      preheader: "Votre demande est en attente de confirmation",
      title: "Votre demande est bien envoyée",
      intro: `Bonjour ${firstName(order)},<br>Nous avons bien reçu votre précommande <strong>${order.orderNumber}</strong>. Elle est <strong>en attente de confirmation</strong> par notre équipe : vous recevrez un email dès qu'elle sera validée.`,
      sections: [
        { title: "Votre demande", html: itemsTable(order) },
        { title: "Date souhaitée (à confirmer)", html: p(longDate(order.requestedPickupDate)) },
      ],
      button: { label: "Suivre ma commande", url: orderUrl(order) },
    }),
  };
}

// --- 3. Précommande confirmée -> client (choix du créneau et du paiement) ---
function orderConfirmedClient(order, { paypalEnabled }) {
  const slots = order.proposedSlots.map((s) => `<li style="margin:4px 0">${slotLabel(s)}</li>`).join("");
  const methods = [`<li style="margin:4px 0">Paiement en espèces lors du retrait</li>`, paypalEnabled && `<li style="margin:4px 0">PayPal (paiement en ligne sécurisé)</li>`]
    .filter(Boolean)
    .join("");
  return {
    subject: "Votre précommande est confirmée 🎉",
    text: `Bonjour ${order.customer.firstName},\n\nBonne nouvelle ! Votre précommande ${order.orderNumber} a été confirmée.\n\n${itemsText(order)}\n\nCréneaux proposés :\n${order.proposedSlots.map((s) => `- ${slotLabel(s)}`).join("\n")}\n\nVotre code de retrait : ${order.pickupCode}\n\nChoisissez votre créneau et votre paiement : ${orderUrl(order)}`,
    html: layout({
      preheader: "Choisissez votre créneau de retrait et votre paiement",
      title: "Votre précommande est confirmée",
      intro: `Bonjour ${firstName(order)},<br>Bonne nouvelle ! Votre précommande <strong>${order.orderNumber}</strong> a été confirmée. Il ne vous reste plus qu'à choisir votre créneau de retrait et votre mode de paiement.`,
      sections: [
        order.adminMessage && { title: "Message de la pâtisserie", html: p(`« ${escapeHtml(order.adminMessage)} »`) },
        { title: "Votre commande", html: itemsTable(order) },
        { title: "Créneaux de retrait proposés", html: `<ul style="margin:0;padding-left:18px;font-size:14px;line-height:1.5">${slots}</ul>` },
        { title: "Modes de paiement", html: `<ul style="margin:0;padding-left:18px;font-size:14px;line-height:1.5">${methods}</ul>` },
        { title: "Votre code de retrait", html: pickupCodeBox(order.pickupCode) },
      ],
      button: { label: "Choisir mon créneau et mon paiement", url: orderUrl(order) },
    }),
  };
}

// --- 4. Précommande annulée -> client ---
function orderCancelledClient(order) {
  return {
    subject: `Votre précommande ${order.orderNumber} a été annulée`,
    text: `Bonjour ${order.customer.firstName},\n\nNous sommes désolés : votre précommande ${order.orderNumber} a été annulée.\n\nMotif : ${order.cancellationReason}\n\n${order.paymentStatus === "PAID" ? "Votre paiement PayPal vous sera remboursé.\n\n" : ""}N'hésitez pas à nous contacter ou à passer une nouvelle précommande.`,
    html: layout({
      preheader: "Motif de l'annulation à l'intérieur",
      title: "Votre précommande a été annulée",
      intro: `Bonjour ${firstName(order)},<br>Nous sommes désolés : votre précommande <strong>${order.orderNumber}</strong> a été annulée.`,
      sections: [
        { title: "Motif", html: p(`« ${escapeHtml(order.cancellationReason)} »`) },
        order.paymentStatus === "PAID" && { html: p("Votre paiement PayPal vous sera intégralement remboursé.") },
        { title: "Votre demande", html: itemsTable(order) },
      ],
      button: { label: "Voir la boutique", url: `${SHOP.siteUrl}/produits` },
    }),
  };
}

// --- 5. Créneau choisi / paiement confirmé -> client ---
function orderScheduledClient(order) {
  const paid = order.paymentStatus === "PAID";
  return {
    subject: paid ? `Paiement confirmé — ${order.orderNumber}` : `Votre retrait est planifié — ${order.orderNumber}`,
    text: `Bonjour ${order.customer.firstName},\n\n${paid ? `Nous avons bien reçu votre paiement PayPal de ${money(order.totalAmount)}.` : "Votre choix est enregistré : paiement en espèces lors du retrait."}\n\nRetrait : ${slotLabel(order.selectedSlot)}\nCode de retrait : ${order.pickupCode}\n\n${itemsText(order)}`,
    html: layout({
      preheader: slotLabel(order.selectedSlot),
      title: paid ? "Paiement confirmé" : "Votre retrait est planifié",
      intro: `Bonjour ${firstName(order)},<br>${
        paid
          ? `Nous avons bien reçu votre paiement PayPal de <strong>${money(order.totalAmount)}</strong>.`
          : "Votre choix est enregistré : vous réglerez <strong>en espèces lors du retrait</strong>."
      }`,
      sections: [
        { title: "Votre retrait", html: p(`<strong>${slotLabel(order.selectedSlot)}</strong>`) },
        { title: "Votre code de retrait", html: pickupCodeBox(order.pickupCode) },
        { title: "Votre commande", html: itemsTable(order) },
      ],
      button: { label: "Voir ma commande", url: orderUrl(order) },
    }),
  };
}

// --- 6. Commande prête -> client ---
function orderReadyClient(order) {
  const cash = order.paymentStatus === "CASH_ON_PICKUP";
  return {
    subject: `Votre commande ${order.orderNumber} est prête`,
    text: `Bonjour ${order.customer.firstName},\n\nVotre commande ${order.orderNumber} est prête !\n\nRetrait : ${slotLabel(order.selectedSlot)}\nCode de retrait : ${order.pickupCode}${cash ? `\nÀ régler sur place : ${money(order.totalAmount)}` : ""}`,
    html: layout({
      preheader: `Retrait : ${slotLabel(order.selectedSlot)}`,
      title: "Votre commande est prête",
      intro: `Bonjour ${firstName(order)},<br>Votre commande <strong>${order.orderNumber}</strong> est prête et vous attend.`,
      sections: [
        { title: "Votre retrait", html: p(`<strong>${slotLabel(order.selectedSlot)}</strong>${cash ? `<br>À régler sur place : <strong>${money(order.totalAmount)}</strong>` : ""}`) },
        { title: "Votre code de retrait", html: pickupCodeBox(order.pickupCode) },
      ],
      button: { label: "Voir ma commande", url: orderUrl(order) },
    }),
  };
}

// --- 7. Commande récupérée -> client ---
function orderCompletedClient(order) {
  return {
    subject: `Merci pour votre commande ${order.orderNumber}`,
    text: `Bonjour ${order.customer.firstName},\n\nVotre commande ${order.orderNumber} a bien été récupérée. Merci pour votre confiance et bonne dégustation !`,
    html: layout({
      preheader: "Bonne dégustation !",
      title: "Merci et bonne dégustation !",
      intro: `Bonjour ${firstName(order)},<br>Votre commande <strong>${order.orderNumber}</strong> a bien été récupérée. Merci pour votre confiance, nous espérons vous revoir très vite.`,
      sections: [{ title: "Récapitulatif", html: itemsTable(order) }],
      button: { label: "Découvrir nos créations", url: `${SHOP.siteUrl}/produits` },
    }),
  };
}

// --- Notifications courtes -> administrateur ---
function adminUpdate(order, title, message) {
  return {
    subject: `${title} — ${order.orderNumber}`,
    text: `${message}\n\nVoir la commande : ${adminUrl(order)}`,
    html: layout({
      preheader: message,
      title,
      intro: `${escapeHtml(message)}<br>Commande <strong>${order.orderNumber}</strong> · ${escapeHtml(order.customer.firstName)} ${escapeHtml(order.customer.lastName)}`,
      sections: [order.selectedSlot && { title: "Retrait", html: p(slotLabel(order.selectedSlot)) }],
      button: { label: "Voir la commande", url: adminUrl(order) },
    }),
  };
}

module.exports = {
  newOrderAdmin,
  orderReceivedClient,
  orderConfirmedClient,
  orderCancelledClient,
  orderScheduledClient,
  orderReadyClient,
  orderCompletedClient,
  adminUpdate,
  slotLabel,
  longDate,
  money,
};
