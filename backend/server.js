const express = require("express");
const cors = require("cors");
require("dotenv").config();
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

// Initialisation Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const app = express();
app.use(cors());
app.use(express.json());

// Route de test
app.get("/", (req, res) => {
  res.json({ message: "API Cooking.Ib en ligne 🍰" });
});

// Route de test Firestore : liste les produits
app.get("/api/products", async (req, res) => {
  try {
    const snapshot = await db.collection("products").get();
    const products = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur backend lancé sur http://localhost:${PORT}`);
});