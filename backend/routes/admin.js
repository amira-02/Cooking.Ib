const express = require("express");
const router = express.Router();

const controller = require("../controllers/adminController");
const orders = require("../controllers/orderController");
const verifyToken = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");

// Toutes les routes du dashboard sont réservées aux administrateurs
router.use(verifyToken, isAdmin);

router.get("/data", controller.getData);

// Cycle de vie des précommandes
router.post("/orders/:id/confirm", orders.adminConfirm);
router.post("/orders/:id/cancel", orders.adminCancel);
router.post("/orders/:id/ready", orders.adminReady);
router.post("/orders/:id/verify-code", orders.adminVerifyCode);
router.post("/orders/:id/complete", orders.adminComplete);

module.exports = router;
