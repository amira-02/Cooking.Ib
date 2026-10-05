const orderService = require("../services/orderService");
const cartService = require("../services/cartService");

// Erreur métier -> réponse JSON { error, code, details } ; erreur inattendue -> 500 générique
function handle(fn) {
  return async (req, res) => {
    try {
      const result = await fn(req, res);
      if (!res.headersSent) res.json(result);
    } catch (error) {
      if (!error.status) console.error(error);
      res.status(error.status || 500).json({
        error: error.status ? error.message : "Une erreur est survenue. Réessayez dans quelques instants.",
        code: error.code || "server_error",
        details: error.details,
      });
    }
  };
}

module.exports = {
  handle,
  // Public
  config: handle(() => orderService.getConfig()),
  // Client connecté
  create: handle(async (req, res) => {
    const order = await orderService.createOrder(req.user, req.body);
    res.status(201).json(order);
  }),
  listMine: handle((req) => orderService.listForUser(req.user)),
  getMine: handle((req) => orderService.getForUser(req.user, req.params.id)),
  select: handle((req) => orderService.selectOptions(req.user, req.params.id, req.body)),
  paypalCapture: handle((req) => orderService.capturePaypal(req.user, req.params.id, req.body.paypalOrderId)),
  paypalCancel: handle((req) => orderService.cancelPaypal(req.user, req.params.id)),
  // Panier
  getCart: handle(async (req) => ({ items: await cartService.getCart(req.uid) })),
  saveCart: handle(async (req) => ({ items: await cartService.saveCart(req.uid, req.body.items) })),
  // Administration
  adminConfirm: handle((req) => orderService.confirmOrder(req.user, req.params.id, req.body)),
  adminCancel: handle((req) => orderService.cancelOrder(req.user, req.params.id, req.body)),
  adminReady: handle((req) => orderService.markReady(req.user, req.params.id)),
  adminVerifyCode: handle((req) => orderService.verifyPickupCode(req.user, req.params.id, req.body.code)),
  adminComplete: handle((req) => orderService.completeOrder(req.user, req.params.id, req.body.code)),
};
