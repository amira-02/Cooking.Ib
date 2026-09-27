const { db } = require("../config/firebase");

const collection = db.collection("categories");

async function getAll() {
  const snapshot = await collection.orderBy("order").get();
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
    imageUrl: data.imageUrl || "",
    order: data.order ?? 0,
    isActive: data.isActive ?? true,
  });
  return { id: docRef.id };
}

async function update(id, data) {
  await collection.doc(id).update({
    name: data.name,
    description: data.description || "",
    order: data.order ?? 0,
    isActive: data.isActive ?? true,
  });
}

async function remove(id) {
  await collection.doc(id).delete();
}

module.exports = { getAll, getById, create, update, remove };