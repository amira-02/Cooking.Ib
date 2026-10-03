const express = require("express");
const router = express.Router();

const controller = require("../controllers/homepageController");
const verifyToken = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");

// Public
router.get("/", controller.getHomepage);

// Admin uniquement
router.put("/images/:slot", verifyToken, isAdmin, controller.setImage);
router.delete("/images/:slot", verifyToken, isAdmin, controller.resetImage);

module.exports = router;
