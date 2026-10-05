const { db } = require("../config/firebase");

// Seuil d'alerte de stock par défaut (un produit passe en « stock faible » à ce niveau)
const LOW_STOCK_THRESHOLD = 5;
const ANALYTICS_DAYS = 400;

const { serialize } = require("./orderService");

// Timestamp Firestore / Date / chaîne -> chaîne ISO
function toIso(value) {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

// Les commandes sont écrites par orderService (voir le modèle détaillé dans ce fichier)
const mapOrder = (doc) => serialize(doc.id, doc.data(), { forAdmin: true });

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

module.exports = { getSnapshot };
