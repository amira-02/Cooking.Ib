const { db, admin } = require("../config/firebase");

// Compteurs d'audience agrégés par jour : analytics_daily/{AAAA-MM-JJ}
// (aucune donnée personnelle n'est stockée, seulement des totaux)
const EVENTS = {
  visit: "visitors",
  product_view: "productViews",
  add_to_cart: "addToCart",
};

// Date du jour à l'heure de Paris (la boutique vise le marché français)
function todayInParis() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" }).format(new Date());
}

async function track(type, productId) {
  const field = EVENTS[type];
  if (!field) {
    const error = new Error("Événement inconnu");
    error.status = 400;
    throw error;
  }
  const date = todayInParis();
  const increment = admin.firestore.FieldValue.increment(1);
  const update = { date, [field]: increment };

  if (type === "product_view" && typeof productId === "string" && /^[\w-]{1,80}$/.test(productId)) {
    update.productViewsById = { [productId]: increment };
  }
  await db.collection("analytics_daily").doc(date).set(update, { merge: true });
}

module.exports = { track };
