const { db } = require("../config/firebase");

async function isAdmin(req, res, next) {
  try {
    const userDoc = await db.collection("users").doc(req.uid).get();
    if (!userDoc.exists || userDoc.data().role !== "admin") {
      return res.status(403).json({ error: "Accès réservé aux administrateurs" });
    }
    next();
  } catch (error) {
    return res.status(500).json({ error: "Erreur de vérification du rôle" });
  }
}

module.exports = isAdmin;