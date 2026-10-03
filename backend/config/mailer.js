const nodemailer = require("nodemailer");

// Envoi des emails (codes OTP, réinitialisation du mot de passe).
//
// - En ligne (Render) : API HTTP de Brevo, car Render bloque le SMTP sur le plan gratuit.
//   Activée dès que la variable BREVO_API_KEY est définie.
// - En local : SMTP classique (Gmail…) via SMTP_HOST / SMTP_USER / SMTP_PASS.
//
// Les deux exposent la même fonction sendMail({ from, to, subject, text, html }).

// "Cooking Ib <contact@exemple.fr>" -> { name: "Cooking Ib", email: "contact@exemple.fr" }
function parseAddress(address) {
  const match = /^\s*(.*?)\s*<([^>]+)>\s*$/.exec(address || "");
  return match ? { name: match[1].replace(/^"|"$/g, ""), email: match[2] } : { email: String(address).trim() };
}

function createBrevoMailer(apiKey) {
  return {
    async sendMail({ from, to, subject, text, html }) {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": apiKey, "Content-Type": "application/json", accept: "application/json" },
        body: JSON.stringify({
          sender: parseAddress(from),
          to: [{ email: to }],
          subject,
          textContent: text,
          htmlContent: html,
        }),
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) throw new Error(`Brevo ${res.status} : ${await res.text()}`);
    },
  };
}

function createSmtpMailer() {
  const port = Number(process.env.SMTP_PORT) || 587;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Échoue vite plutôt que de laisser l'utilisateur attendre 2 minutes
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
}

const transport = process.env.BREVO_API_KEY ? createBrevoMailer(process.env.BREVO_API_KEY) : createSmtpMailer();

// Le détail technique reste dans les logs du serveur ; le client reçoit un message clair
const mailer = {
  async sendMail(options) {
    try {
      await transport.sendMail(options);
    } catch (cause) {
      console.error("Échec de l'envoi de l'email :", cause.message);
      const error = new Error("L'email n'a pas pu être envoyé. Réessayez dans quelques instants.", { cause });
      error.status = 502;
      error.code = "email_failed";
      throw error;
    }
  },
};

console.log(`Envoi des emails via ${process.env.BREVO_API_KEY ? "l'API Brevo" : "SMTP"}`);

module.exports = mailer;
