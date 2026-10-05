const { db } = require("../config/firebase");

// Panier d'un utilisateur connecté : carts/{uid}.
// On garde un instantané d'affichage (nom, image, prix) ; les prix réels sont toujours
// recalculés par le serveur au moment de la précommande.
const cartsCol = db.collection("carts");
const MAX_LINES = 50;

function cleanItems(items) {
  if (!Array.isArray(items)) return [];
  return items
    .filter((i) => typeof i?.productId === "string" && /^[\w-]{1,80}$/.test(i.productId))
    .slice(0, MAX_LINES)
    .map((i) => ({
      productId: i.productId,
      name: String(i.name ?? "").slice(0, 120),
      image: String(i.image ?? "").slice(0, 500),
      category: String(i.category ?? "").slice(0, 80),
      price: Math.max(0, Number(i.price) || 0),
      quantity: Math.min(99, Math.max(1, Math.floor(Number(i.quantity) || 1))),
    }));
}

async function getCart(uid) {
  const snap = await cartsCol.doc(uid).get();
  return snap.exists ? snap.data().items || [] : [];
}

async function saveCart(uid, items) {
  const clean = cleanItems(items);
  await cartsCol.doc(uid).set({ items: clean, updatedAt: new Date().toISOString() });
  return clean;
}

module.exports = { getCart, saveCart };
