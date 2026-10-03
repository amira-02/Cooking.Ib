const { db, admin } = require("../config/firebase");

// Un seul document contient les photos choisies pour la page d'accueil :
// settings/homepage -> { images: { hero: "https://…", gallery1: "https://…", … } }
const docRef = db.collection("settings").doc("homepage");

// Emplacements autorisés (doivent correspondre à HOME_IMAGE_SLOTS côté frontend)
const IMAGE_SLOTS = [
  "hero",
  "categoryTrompe",
  "categoryGateaux",
  "categoryEntremets",
  "categoryCoffrets",
  "savoirFaire",
  "customOrder",
  "gallery1",
  "gallery2",
  "gallery3",
  "gallery4",
  "gallery5",
  "cta",
];

function isValidSlot(slot) {
  return IMAGE_SLOTS.includes(slot);
}

async function getImages() {
  const doc = await docRef.get();
  return doc.exists ? doc.data().images || {} : {};
}

async function setImage(slot, url) {
  await docRef.set({ images: { [slot]: url } }, { merge: true });
}

// Supprime la photo personnalisée : le site réaffiche la photo d'exemple
async function resetImage(slot) {
  const doc = await docRef.get();
  if (!doc.exists) return;
  await docRef.update(new admin.firestore.FieldPath("images", slot), admin.firestore.FieldValue.delete());
}

module.exports = { isValidSlot, getImages, setImage, resetImage };
