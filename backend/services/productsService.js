const { db, admin } = require("../config/firebase");

const collection = db.collection("products");

// Stock : nombre entier >= 0, ou null quand le stock n'est pas suivi pour ce produit
function cleanStock(stock) {
  if (stock === null || stock === undefined || stock === "") return null;
  const n = Math.floor(Number(stock));
  return Number.isFinite(n) && n >= 0 ? n : null;
}

// Garde seulement les ingrédients non vides, sans espaces superflus
function cleanIngredients(ingredients) {
  if (!Array.isArray(ingredients)) return [];
  return ingredients.map((i) => String(i).trim()).filter(Boolean);
}

async function getAll(categoryId) {
  let query = collection;
  if (categoryId) {
    query = query.where("categoryId", "==", categoryId);
  }
  const snapshot = await query.get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function getById(id) {
  const doc = await collection.doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

async function create(data) {
  const docRef = await collection.add({
    name: data.name,
    description: data.description || "",
    price: Number(data.price) || 0,
    categoryId: data.categoryId || "",
    images: data.images || [],
    ingredients: cleanIngredients(data.ingredients),
    stock: cleanStock(data.stock),
    isAvailable: data.isAvailable ?? true,
    options: data.options || { flavors: [], sizes: [] },
    servesCount: Number(data.servesCount) || 0,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return { id: docRef.id };
}

async function update(id, data) {
  await collection.doc(id).update({
    name: data.name,
    description: data.description || "",
    price: Number(data.price) || 0,
    categoryId: data.categoryId || "",
    images: data.images || [],
    ingredients: cleanIngredients(data.ingredients),
    stock: cleanStock(data.stock),
    isAvailable: data.isAvailable ?? true,
    options: data.options || { flavors: [], sizes: [] },
    servesCount: Number(data.servesCount) || 0,
  });
}

async function remove(id) {
  await collection.doc(id).delete();
}

module.exports = { getAll, getById, create, update, remove };