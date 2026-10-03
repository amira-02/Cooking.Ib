const crypto = require("crypto");
const { db, auth } = require("../config/firebase");
const transporter = require("../config/mailer");
const { createCode, verifyCode, httpError, hash, safeEqual } = require("./codeStore");
const { codeEmail } = require("./emailTemplates");

// Mot de passe oublié : code par email -> jeton de réinitialisation (15 min) -> nouveau mot de passe
const COLLECTION = "passwordResets";
const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;
const MIN_PASSWORD_LENGTH = 8;

async function findUser(email) {
  try {
    return await auth.getUserByEmail(String(email).trim().toLowerCase());
  } catch {
    return null;
  }
}

// Ne révèle jamais si un compte existe : pour un email inconnu, on ne fait simplement rien
async function requestReset(email) {
  const user = await findUser(email);
  if (!user) return;
  const code = await createCode(COLLECTION, user.uid);
  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: user.email,
    subject: "Réinitialisation de votre mot de passe Cooking Ib",
    ...codeEmail({ code, intro: "Voici votre code pour réinitialiser votre mot de passe :" }),
  });
}

// Code correct -> renvoie un jeton à usage unique pour choisir le nouveau mot de passe
async function verifyResetCode(email, code) {
  const user = await findUser(email);
  if (!user) throw httpError(400, "invalid_code", "Le code est incorrect. Veuillez réessayer.");
  const token = crypto.randomBytes(32).toString("hex");
  await verifyCode(COLLECTION, user.uid, code, (tx, docRef) => {
    tx.set(docRef, { tokenHash: hash(user.uid, token), tokenExpiresAt: Date.now() + RESET_TOKEN_TTL_MS });
  });
  return token;
}

async function resetPassword(email, token, password) {
  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    throw httpError(400, "weak_password", `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`);
  }
  const user = await findUser(email);
  const invalid = httpError(400, "invalid_token", "Ce lien de réinitialisation n'est plus valide. Recommencez la procédure.");
  if (!user || typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) throw invalid;

  const docRef = db.collection(COLLECTION).doc(user.uid);
  const snap = await docRef.get();
  const data = snap.data();
  if (!snap.exists || !data.tokenHash || Date.now() > data.tokenExpiresAt || !safeEqual(data.tokenHash, hash(user.uid, token))) {
    throw invalid;
  }

  await auth.updateUser(user.uid, { password });
  // Déconnecte les autres sessions ouvertes avec l'ancien mot de passe
  await auth.revokeRefreshTokens(user.uid);
  await docRef.delete();
}

module.exports = { requestReset, verifyResetCode, resetPassword };
