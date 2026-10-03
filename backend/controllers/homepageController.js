const homepageService = require("../services/homepageService");

async function getHomepage(req, res) {
  try {
    const images = await homepageService.getImages();
    res.json({ images });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function setImage(req, res) {
  const { slot } = req.params;
  const { url } = req.body;
  if (!homepageService.isValidSlot(slot)) {
    return res.status(400).json({ error: "Emplacement inconnu" });
  }
  if (typeof url !== "string" || !url.startsWith("https://")) {
    return res.status(400).json({ error: "URL d'image invalide" });
  }
  try {
    await homepageService.setImage(slot, url);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function resetImage(req, res) {
  const { slot } = req.params;
  if (!homepageService.isValidSlot(slot)) {
    return res.status(400).json({ error: "Emplacement inconnu" });
  }
  try {
    await homepageService.resetImage(slot);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { getHomepage, setImage, resetImage };
