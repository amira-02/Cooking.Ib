const express = require("express");
const router = express.Router();

const controller = require("../controllers/adminController");

// Public : la boutique y envoie les visites, vues produit et ajouts au panier
router.post("/", controller.track);

module.exports = router;
