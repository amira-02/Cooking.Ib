const { auth } = require("../config/firebase");

async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Non authentifié" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = await auth.verifyIdToken(token);
    req.uid = decoded.uid;
    req.user = { uid: decoded.uid, email: decoded.email || "", emailVerified: decoded.email_verified === true };
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token invalide" });
  }
}

module.exports = verifyToken;