// Paiement PayPal via l'API officielle « Orders v2 » (côté serveur uniquement).
// Le client paie sur le site de PayPal : aucune donnée bancaire ne transite par notre serveur
// ni n'est stockée chez nous. On conserve seulement les références PayPal.
//
// Variables d'environnement :
//   PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET  (application REST créée sur developer.paypal.com)
//   PAYPAL_MODE = "live" pour les vrais paiements, sinon « sandbox » (tests)

const MODE = process.env.PAYPAL_MODE === "live" ? "live" : "sandbox";
const BASE_URL = MODE === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

function isConfigured() {
  return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
}

async function accessToken() {
  const credentials = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64");
  const res = await fetch(`${BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${credentials}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`PayPal OAuth ${res.status} : ${await res.text()}`);
  return (await res.json()).access_token;
}

async function call(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${await accessToken()}`, "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
    signal: AbortSignal.timeout(20000),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

// Crée l'ordre de paiement PayPal et renvoie l'URL où rediriger le client
async function createPayment({ orderId, orderNumber, amount, returnUrl, cancelUrl }) {
  const { ok, status, data } = await call("/v2/checkout/orders", {
    intent: "CAPTURE",
    purchase_units: [
      {
        reference_id: orderId,
        custom_id: orderId,
        description: `Précommande ${orderNumber} — Cooking Ib`,
        amount: { currency_code: "EUR", value: amount.toFixed(2) },
      },
    ],
    payment_source: {
      paypal: {
        experience_context: {
          brand_name: "Cooking Ib",
          locale: "fr-FR",
          shipping_preference: "NO_SHIPPING",
          user_action: "PAY_NOW",
          return_url: returnUrl,
          cancel_url: cancelUrl,
        },
      },
    },
  });
  if (!ok) throw new Error(`PayPal création ${status} : ${JSON.stringify(data)}`);
  const approveUrl = (data.links || []).find((l) => l.rel === "payer-action" || l.rel === "approve")?.href;
  if (!approveUrl) throw new Error("PayPal n'a pas renvoyé de lien de paiement");
  return { paypalOrderId: data.id, approveUrl };
}

// Encaisse le paiement après validation par le client sur PayPal
async function capturePayment(paypalOrderId) {
  const { ok, data } = await call(`/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`);
  const capture = data?.purchase_units?.[0]?.payments?.captures?.[0];
  return {
    completed: ok && data.status === "COMPLETED" && capture?.status === "COMPLETED",
    transactionId: capture?.id ?? null,
    amount: capture ? Number(capture.amount?.value) : null,
    currency: capture?.amount?.currency_code ?? null,
    raw: { status: data?.status, name: data?.name, message: data?.message },
  };
}

module.exports = { isConfigured, createPayment, capturePayment, MODE };
