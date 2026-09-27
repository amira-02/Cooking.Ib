const express = require("express");
const router = express.Router();

const controller = require("../controllers/productsController");
const verifyToken = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");

// Public
router.get("/", controller.getAll);
router.get("/:id", controller.getById);

// Admin uniquement
router.post("/", verifyToken, isAdmin, controller.create);
router.put("/:id", verifyToken, isAdmin, controller.update);
router.delete("/:id", verifyToken, isAdmin, controller.remove);

module.exports = router;