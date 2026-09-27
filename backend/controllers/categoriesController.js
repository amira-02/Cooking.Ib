const categoriesService = require("../services/categoriesService");

async function getAll(req, res) {
  try {
    const categories = await categoriesService.getAll();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getById(req, res) {
  try {
    const category = await categoriesService.getById(req.params.id);
    if (!category) return res.status(404).json({ error: "Catégorie introuvable" });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function create(req, res) {
  try {
    if (!req.body.name) {
      return res.status(400).json({ error: "Le nom est obligatoire" });
    }
    const result = await categoriesService.create(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function update(req, res) {
  try {
    await categoriesService.update(req.params.id, req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function remove(req, res) {
  try {
    await categoriesService.remove(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { getAll, getById, create, update, remove };