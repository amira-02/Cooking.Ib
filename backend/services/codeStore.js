const crypto = require("crypto");
const { db } = require("../config/firebase");

// Gestion commune des codes à 6 chiffres (vérification d'email, mot de passe oublié).
// Les codes ne sont jamais stockés en clair et ne sont lus que par le backend.
const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const RESEND_DELAY_MS = 45 * 1000; // délai minimum entre deux envois
const MAX_ATTEMPTS = 5;

// Erreur HTTP avec un code machine que le frontend traduit en message
function httpError(status, code, message) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

function hash(key, value) {
  return crypto.createHash("sha256").update(`${key}:${value}`).digest("hex");
}

function safeEqual(a, b) {
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

// Crée un nouveau code (refusé si le précédent a été envoyé il y a moins de 45 s)
async function createCode(collectionName, key) {
  const docRef = db.collection(collectionName).doc(key);
  const existing = await docRef.get();
  if (existing.exists && Date.now() - existing.data().createdAt < RESEND_DELAY_MS) {
    throw httpError(429, "cooldown", "Veuillez patienter avant de redemander un code");
  }
  const code = crypto.randomInt(0, 1000000).toString().padStart(6, "0");
  const now = Date.now();
  await docRef.set({ codeHash: hash(key, code), createdAt: now, expiresAt: now + CODE_TTL_MS, attempts: 0 });
  return code;
}

// Annule un code dont l'email n'a pas pu partir (sinon le délai de renvoi bloquerait un nouvel essai)
async function discardCode(collectionName, key) {
  await db.collection(collectionName).doc(key).delete();
}

// Vérifie un code. Transaction : impossible de dépasser MAX_ATTEMPTS avec des requêtes parallèles.
// `onSuccess(tx, docRef)` remplace la suppression par défaut (ex : poser un jeton de réinitialisation).
async function verifyCode(collectionName, key, code, onSuccess) {
  const docRef = db.collection(collectionName).doc(key);
  const result = await db.runTransaction(async (tx) => {
    const snap = await tx.get(docRef);
    if (!snap.exists || !snap.data().codeHash) return "no_code";
    const data = snap.data();
    if (Date.now() > data.expiresAt) {
      tx.delete(docRef);
      return "expired";
    }
    if (data.attempts >= MAX_ATTEMPTS) {
      tx.delete(docRef);
      return "too_many_attempts";
    }
    if (!safeEqual(data.codeHash, hash(key, String(code)))) {
      tx.update(docRef, { attempts: data.attempts + 1 });
      return "invalid_code";
    }
    if (onSuccess) onSuccess(tx, docRef);
    else tx.delete(docRef);
    return "ok";
  });

  const errors = {
    no_code: [400, "Aucun code en attente, demandez un nouveau code"],
    expired: [400, "Ce code a expiré. Demandez un nouveau code."],
    too_many_attempts: [429, "Trop de tentatives, demandez un nouveau code"],
    invalid_code: [400, "Le code est incorrect. Veuillez réessayer."],
  };
  if (result !== "ok") throw httpError(errors[result][0], result, errors[result][1]);
}

module.exports = { CODE_TTL_MS, httpError, hash, safeEqual, createCode, discardCode, verifyCode };
