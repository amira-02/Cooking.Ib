const express = require("express");
const router = express.Router();

const controller = require("../controllers/orderController");
const verifyToken = require("../middleware/auth");

// Public : réglages de la boutique (délai minimum, quantité max, PayPal activé…)
router.get("/config", controller.config);

// Client connecté
router.post("/", verifyToken, controller.create);
router.get("/mine", verifyToken, controller.listMine);
router.get("/:id", verifyToken, controller.getMine);
router.post("/:id/selection", verifyToken, controller.select);
router.post("/:id/paypal/capture", verifyToken, controller.paypalCapture);
router.post("/:id/paypal/cancel", verifyToken, controller.paypalCancel);

module.exports = router;
