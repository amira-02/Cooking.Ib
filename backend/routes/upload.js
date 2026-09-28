const express = require("express");
const multer = require("multer");

const router = express.Router();

const controller = require("../controllers/uploadController");
const verifyToken = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 6 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Seules les images sont acceptées"));
  },
});

function handleUpload(req, res, next) {
  upload.array("images", 6)(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}

router.post("/", verifyToken, isAdmin, handleUpload, controller.uploadImages);

module.exports = router;