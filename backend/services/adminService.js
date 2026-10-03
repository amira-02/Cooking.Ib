const { db } = require("../config/firebase");

// Seuil d'alerte de stock par défaut (un produit passe en « stock faible » à ce niveau)
const LOW_STOCK_THRESHOLD = 5;
const ANALYTICS_DAYS = 400;

const ORDER_STATUSES = ["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"];

// Timestamp Firestore / Date / chaîne -> chaîne ISO
function toIso(value) {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

/*
 * Forme attendue d'un document de la collection « orders » (à écrire par le futur
 * tunnel de commande) :
 * {
 *   number: "CMD-10001",
 *   customer: { id, name, email, phone },
 *   createdAt: Timestamp,
 *   items: [{ productId, name, image, quantity, unitPrice }],
 *   subtotal, shipping, total,           // en euros
 *   paymentMethod: "card" | "paypal" | "cash" | "transfer",
 *   status: "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled",
 *   delivery: { mode: "pickup" | "delivery", address?, date: Timestamp },
 *   note?: string
 * }
 */
function mapOrder(doc) {
  const o = doc.data();
  return {
    id: doc.id,
    number: o.number || doc.id,
    customer: {
      id: o.customer?.id || "",
      name: o.customer?.name || "Client",
      email: o.customer?.email || "",
      phone: o.customer?.phone || "",
    },
    createdAt: toIso(o.createdAt),
    items: (o.items || []).map((i) => ({
      productId: i.productId,
      name: i.name,
      image: i.image || "",
      quantity: Number(i.quantity) || 0,
      unitPrice: Number(i.unitPrice) || 0,
    })),
    subtotal: Number(o.subtotal) || 0,
    shipping: Number(o.shipping) || 0,
    total: Number(o.total) || 0,
    paymentMethod: o.paymentMethod || "card",
    status: ORDER_STATUSES.includes(o.status) ? o.status : "pending",
    delivery: {
      mode: o.delivery?.mode === "delivery" ? "delivery" : "pickup",
      address: o.delivery?.address || undefined,
      date: toIso(o.delivery?.date) || toIso(o.createdAt),
    },
    note: o.note || undefined,
  };
}

// Toutes les données réelles nécessaires au dashboard, en une seule requête
async function getSnapshot() {
  const since = new Date(Date.now() - ANALYTICS_DAYS * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [productsSnap, categoriesSnap, usersSnap, ordersSnap, analyticsSnap] = await Promise.all([
    db.collection("products").get(),
    db.collection("categories").get(),
    db.collection("users").get(),
    db.collection("orders").get(),
    db.collection("analytics_daily").where("date", ">=", since).get(),
  ]);

  const categories = categoriesSnap.docs.map((d) => ({ id: d.id, name: d.data().name, order: d.data().order ?? 0 }));
  const categoryName = new Map(categories.map((c) => [c.id, c.name]));

  const products = productsSnap.docs.map((d) => {
    const p = d.data();
    return {
      id: d.id,
      name: p.name,
      category: categoryName.get(p.categoryId) || "Sans catégorie",
      image: (p.images && p.images[0]) || "",
      price: Number(p.price) || 0,
      stock: typeof p.stock === "number" ? p.stock : null,
      lowStockThreshold: LOW_STOCK_THRESHOLD,
      isAvailable: p.isAvailable ?? true,
      createdAt: toIso(p.createdAt),
    };
  });

  // Les comptes administrateurs ne sont pas des clients
  const customers = usersSnap.docs
    .filter((d) => d.data().role !== "admin")
    .map((d) => {
      const u = d.data();
      return {
        id: d.id,
        name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email || "Client",
        email: u.email || "",
        phone: u.phone || "",
        createdAt: toIso(u.createdAt) || new Date(0).toISOString(),
      };
    });

  const analytics = analyticsSnap.docs.map((d) => {
    const a = d.data();
    return {
      date: a.date,
      visitors: a.visitors || 0,
      productViews: a.productViews || 0,
      addToCart: a.addToCart || 0,
      productViewsById: a.productViewsById || {},
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    categories,
    products,
    customers,
    orders: ordersSnap.docs.map(mapOrder),
    analytics,
  };
}

async function updateOrderStatus(id, status) {
  if (!ORDER_STATUSES.includes(status)) {
    const error = new Error("Statut invalide");
    error.status = 400;
    throw error;
  }
  const ref = db.collection("orders").doc(id);
  const doc = await ref.get();
  if (!doc.exists) {
    const error = new Error("Commande introuvable");
    error.status = 404;
    throw error;
  }
  await ref.update({ status });
  return mapOrder(await ref.get());
}

module.exports = { getSnapshot, updateOrderStatus };
