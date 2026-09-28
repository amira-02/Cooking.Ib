const uploadService = require("../services/uploadService");

async function uploadImages(req, res) {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "Aucune image reçue" });
    }
    const urls = await uploadService.uploadImages(req.files);
    res.status(201).json({ urls });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { uploadImages };