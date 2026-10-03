const priceFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

// 8.9 -> "8,90 €"
export function formatPrice(price: number) {
  return priceFormatter.format(price);
}
