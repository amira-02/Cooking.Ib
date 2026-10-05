const express = require("express");
const router = express.Router();

const controller = require("../controllers/orderController");
const verifyToken = require("../middleware/auth");

// Panier synchronisé avec le compte de l'utilisateur
router.get("/", verifyToken, controller.getCart);
router.put("/", verifyToken, controller.saveCart);

module.exports = router;
