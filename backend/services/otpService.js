const { auth } = require("../config/firebase");
const transporter = require("../config/mailer");
const { createCode, verifyCode: checkCode, httpError } = require("./codeStore");
const { codeEmail } = require("./emailTemplates");

// Vérification de l'adresse email après inscription (utilisateur connecté)
const COLLECTION = "emailOtps";

async function sendCode(uid) {
  const user = await auth.getUser(uid);
  if (user.emailVerified) throw httpError(400, "already_verified", "Email déjà vérifié");

  const code = await createCode(COLLECTION, uid);
  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: user.email,
    subject: "Votre code de vérification Cooking Ib",
    ...codeEmail({
      code,
      intro: "Voici votre code pour vérifier votre adresse email :",
    }),
  });
}

async function verifyCode(uid, code) {
  await checkCode(COLLECTION, uid, code);
  await auth.updateUser(uid, { emailVerified: true });
}

module.exports = { sendCode, verifyCode };
