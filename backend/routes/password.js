const express = require("express");
const router = express.Router();

const controller = require("../controllers/passwordController");

// Public : l'utilisateur n'est pas connecté quand il a oublié son mot de passe
router.post("/forgot", controller.forgot);
router.post("/verify", controller.verify);
router.post("/reset", controller.reset);

module.exports = router;
