const express = require("express");
const router = express.Router();

const controller = require("../controllers/adminController");
const verifyToken = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");

// Toutes les routes du dashboard sont réservées aux administrateurs
router.use(verifyToken, isAdmin);

router.get("/data", controller.getData);
router.put("/orders/:id/status", controller.updateOrderStatus);

module.exports = router;
