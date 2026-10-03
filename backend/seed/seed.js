// Remplit la base avec des produits de test.
//
//   node seed/seed.js          -> ajoute (ou met à jour) les produits de test
//   node seed/seed.js --clean  -> supprime tous les produits et catégories de test
//
// À lancer depuis le dossier backend. Les documents créés ont un id "seed-..."
// et isSeed: true, donc relancer le script ne crée pas de doublons et
// --clean ne touche jamais aux vrais produits.
require("dotenv").config();
const { db, admin } = require("../config/firebase");
const { EXISTING_CATEGORIES, categories, products } = require("./data");

async function seed() {
  const categoryIds = { ...EXISTING_CATEGORIES };
  const batch = db.batch();

  for (const cat of categories) {
    const id = `seed-${cat.key}`;
    categoryIds[cat.key] = id;
    batch.set(db.collection("categories").doc(id), {
      name: cat.name,
      description: cat.description,
      imageUrl: "",
      order: cat.order,
      isActive: true,
      isSeed: true,
    });
  }

  for (const p of products) {
    const categoryId = categoryIds[p.category];
    if (!categoryId) throw new Error(`Catégorie inconnue "${p.category}" pour ${p.name}`);
    batch.set(db.collection("products").doc(`seed-${p.key}`), {
      name: p.name,
      description: p.description,
      price: p.price,
      categoryId,
      images: p.images,
      ingredients: p.ingredients,
      isAvailable: p.isAvailable ?? true,
      options: { flavors: [], sizes: [] },
      servesCount: p.servesCount,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      isSeed: true,
    });
  }

  await batch.commit();
  console.log(`✔ ${products.length} produits et ${categories.length} catégories de test enregistrés`);
}

async function clean() {
  const batch = db.batch();
  let count = 0;
  for (const name of ["products", "categories"]) {
    const snapshot = await db.collection(name).where("isSeed", "==", true).get();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    count += snapshot.size;
  }
  await batch.commit();
  console.log(`✔ ${count} documents de test supprimés`);
}

(process.argv.includes("--clean") ? clean() : seed())
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("✘ Erreur :", error.message);
    process.exit(1);
  });
