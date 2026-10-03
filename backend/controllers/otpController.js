const otpService = require("../services/otpService");

// Les erreurs portent un `code` (invalid_code, expired, cooldown…) que le frontend traduit
function sendError(res, error) {
  res.status(error.status || 500).json({ error: error.message, code: error.code || "server_error" });
}

async function sendCode(req, res) {
  try {
    await otpService.sendCode(req.uid);
    res.json({ message: "Code envoyé" });
  } catch (error) {
    sendError(res, error);
  }
}

async function verifyCode(req, res) {
  const { code } = req.body;
  if (!code || !/^\d{6}$/.test(code)) {
    return res.status(400).json({ error: "Le code doit contenir 6 chiffres", code: "invalid_format" });
  }
  try {
    await otpService.verifyCode(req.uid, code);
    res.json({ message: "Email vérifié" });
  } catch (error) {
    sendError(res, error);
  }
}

module.exports = { sendCode, verifyCode, sendError };
