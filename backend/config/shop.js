// Réglages de la boutique pour les précommandes.
// Les valeurs peuvent être surchargées par des variables d'environnement (Render).

const SHOP = {
  name: "Cooking Ib",
  currency: "EUR",
  // URL publique du site (liens dans les emails)
  siteUrl: (process.env.SITE_URL || "https://cookingib.web.app").replace(/\/$/, ""),
  // Quantité maximale par produit dans une précommande (si le stock n'est pas plus bas)
  maxQuantityPerItem: Number(process.env.MAX_QUANTITY_PER_ITEM) || 20,
  maxItemsPerOrder: 30,
  // Délai minimum (en jours) entre la précommande et la date de retrait souhaitée
  minLeadDays: Number(process.env.MIN_LEAD_DAYS) || 2,
  maxLeadDays: 90,
  // Nombre maximum de précommandes en attente par client (anti-abus)
  maxPendingOrdersPerUser: 5,
  // Créneaux proposés par défaut à l'administrateur lors de la confirmation
  defaultSlotTimes: [
    ["10:00", "10:30"],
    ["11:00", "11:30"],
    ["12:00", "12:30"],
    ["14:00", "14:30"],
    ["15:00", "15:30"],
    ["16:00", "16:30"],
    ["17:00", "17:30"],
  ],
  timeZone: "Europe/Paris",
};

// Date du jour (AAAA-MM-JJ) à l'heure de Paris, décalée de `days` jours
function parisDate(days = 0) {
  const date = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  return new Intl.DateTimeFormat("en-CA", { timeZone: SHOP.timeZone }).format(date);
}

module.exports = { SHOP, parisDate };
