const passwordService = require("../services/passwordService");
const { sendError } = require("./otpController");

const isEmail = (value) => typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

async function forgot(req, res) {
  if (!isEmail(req.body.email)) {
    return res.status(400).json({ error: "Veuillez saisir une adresse email valide.", code: "invalid_email" });
  }
  try {
    await passwordService.requestReset(req.body.email);
    // Même réponse qu'il existe un compte ou non
    res.json({ message: "Si un compte existe pour cette adresse, un code a été envoyé." });
  } catch (error) {
    sendError(res, error);
  }
}

async function verify(req, res) {
  const { email, code } = req.body;
  if (!isEmail(email) || !/^\d{6}$/.test(code || "")) {
    return res.status(400).json({ error: "Le code doit contenir 6 chiffres", code: "invalid_format" });
  }
  try {
    const resetToken = await passwordService.verifyResetCode(email, code);
    res.json({ resetToken });
  } catch (error) {
    sendError(res, error);
  }
}

async function reset(req, res) {
  const { email, resetToken, password } = req.body;
  try {
    await passwordService.resetPassword(email, resetToken, password);
    res.json({ message: "Mot de passe réinitialisé" });
  } catch (error) {
    sendError(res, error);
  }
}

module.exports = { forgot, verify, reset };
