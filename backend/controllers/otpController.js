const otpService = require("../services/otpService");

async function sendCode(req, res) {
  try {
    await otpService.sendCode(req.uid);
    res.json({ message: "Code envoyé" });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
}

async function verifyCode(req, res) {
  const { code } = req.body;
  if (!code || !/^\d{6}$/.test(code)) {
    return res.status(400).json({ error: "Le code doit contenir 6 chiffres" });
  }
  try {
    await otpService.verifyCode(req.uid, code);
    res.json({ message: "Email vérifié" });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
}

module.exports = { sendCode, verifyCode };
