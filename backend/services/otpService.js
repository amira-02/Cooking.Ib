const crypto = require("crypto");
const { db, auth } = require("../config/firebase");
const transporter = require("../config/mailer");

// Documents lus uniquement par le backend (Admin SDK), jamais exposés au client
const collection = db.collection("emailOtps");

const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const RESEND_DELAY_MS = 60 * 1000; // 1 minute entre deux envois
const MAX_ATTEMPTS = 5;

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

// On ne stocke jamais le code en clair
function hashCode(uid, code) {
  return crypto.createHash("sha256").update(`${uid}:${code}`).digest("hex");
}

async function sendCode(uid) {
  const user = await auth.getUser(uid);
  if (user.emailVerified) throw httpError(400, "Email déjà vérifié");

  const docRef = collection.doc(uid);
  const existing = await docRef.get();
  if (existing.exists && Date.now() - existing.data().createdAt < RESEND_DELAY_MS) {
    throw httpError(429, "Veuillez patienter une minute avant de redemander un code");
  }

  const code = crypto.randomInt(0, 1000000).toString().padStart(6, "0");
  const now = Date.now();
  await docRef.set({
    codeHash: hashCode(uid, code),
    createdAt: now,
    expiresAt: now + CODE_TTL_MS,
    attempts: 0,
  });

  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: user.email,
    subject: "Votre code de vérification Cooking.Ib",
    text: `Votre code de vérification est : ${code}\n\nIl expire dans 10 minutes.`,
    html: `<p>Votre code de vérification est :</p>
           <p style="font-size:28px;font-weight:bold;letter-spacing:6px">${code}</p>
           <p>Il expire dans 10 minutes.</p>`,
  });
}

async function verifyCode(uid, code) {
  const docRef = collection.doc(uid);

  // Transaction : empêche de dépasser MAX_ATTEMPTS avec des requêtes parallèles
  const valid = await db.runTransaction(async (tx) => {
    const snap = await tx.get(docRef);
    if (!snap.exists) throw httpError(400, "Aucun code en attente, demandez un nouveau code");

    const data = snap.data();
    if (Date.now() > data.expiresAt) {
      tx.delete(docRef);
      throw httpError(400, "Code expiré, demandez un nouveau code");
    }
    if (data.attempts >= MAX_ATTEMPTS) {
      tx.delete(docRef);
      throw httpError(429, "Trop de tentatives, demandez un nouveau code");
    }

    const expected = Buffer.from(data.codeHash, "hex");
    const received = Buffer.from(hashCode(uid, String(code)), "hex");
    if (!crypto.timingSafeEqual(expected, received)) {
      tx.update(docRef, { attempts: data.attempts + 1 });
      return false;
    }

    tx.delete(docRef);
    return true;
  });

  if (!valid) throw httpError(400, "Code incorrect");

  await auth.updateUser(uid, { emailVerified: true });
}

module.exports = { sendCode, verifyCode };
