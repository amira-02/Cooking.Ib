const express = require("express");

const router = express.Router();

const controller = require("../controllers/otpController");
const verifyToken = require("../middleware/auth");

router.post("/send", verifyToken, controller.sendCode);
router.post("/verify", verifyToken, controller.verifyCode);

module.exports = router;
