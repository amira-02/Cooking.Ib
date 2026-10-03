const adminService = require("../services/adminService");
const trackingService = require("../services/trackingService");

async function getData(req, res) {
  try {
    res.json(await adminService.getSnapshot());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateOrderStatus(req, res) {
  try {
    const order = await adminService.updateOrderStatus(req.params.id, req.body.status);
    res.json(order);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
}

async function track(req, res) {
  try {
    await trackingService.track(req.body.type, req.body.productId);
    res.status(204).end();
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
}

module.exports = { getData, updateOrderStatus, track };
