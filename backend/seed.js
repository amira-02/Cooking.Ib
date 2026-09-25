const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function seed() {
  console.log("Ajout des categories...");

  const cat1 = await db.collection("categories").add({
    name: "Gateaux anniversaire",
    description: "Nos creations pour petits et grands",
    imageUrl: "",
    order: 1,
    isActive: true,
  });

  const cat2 = await db.collection("categories").add({
    name: "Gateaux mariage",
    description: "Nos creations pour votre mariage",
    imageUrl: "",
    order: 2,
    isActive: true,
  });

  console.log("Categories creees:", cat1.id, cat2.id);

  console.log("Ajout des produits...");

  await db.collection("products").add({
    name: "Gateau Chocolat Fraise",
    description: "Gateau moelleux au chocolat, glacage fraise",
    price: 45,
    categoryId: cat1.id,
    images: [],
    isAvailable: true,
    options: {
      flavors: ["Chocolat", "Vanille"],
      sizes: [
        { label: "6 personnes", priceModifier: 0 },
        { label: "10 personnes", priceModifier: 15 },
      ],
    },
    servesCount: 8,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await db.collection("products").add({
    name: "Gateau Red Velvet",
    description: "Gateau red velvet, glacage cream cheese",
    price: 55,
    categoryId: cat2.id,
    images: [],
    isAvailable: true,
    options: {
      flavors: ["Red Velvet"],
      sizes: [
        { label: "8 personnes", priceModifier: 0 },
        { label: "12 personnes", priceModifier: 20 },
      ],
    },
    servesCount: 10,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log("Produits crees !");
  console.log("Termine. Tu peux fermer ce terminal.");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Erreur:", error);
  process.exit(1);
});