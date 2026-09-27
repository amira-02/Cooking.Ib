const productsService = require("../services/productsService");

async function getAll(req, res) {
  try {
    const categoryId = req.query.categoryId;
    const products = await productsService.getAll(categoryId);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getById(req, res) {
  try {
    const product = await productsService.getById(req.params.id);
    if (!product) return res.status(404).json({ error: "Produit introuvable" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function create(req, res) {
  try {
    if (!req.body.name || !req.body.price) {
      return res.status(400).json({ error: "Le nom et le prix sont obligatoires" });
    }
    const result = await productsService.create(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function update(req, res) {
  try {
    await productsService.update(req.params.id, req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function remove(req, res) {
  try {
    await productsService.remove(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { getAll, getById, create, update, remove };