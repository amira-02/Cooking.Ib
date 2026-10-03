import type { Category, Product } from "../types/catalog";

const NEW_PRODUCT_DAYS = 30;

// "Trompe-l'œil" -> "trompe-l'oeil" : comparaison sans accents ni majuscules
export function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/œ/g, "oe");
}

// Trouve la catégorie dont le nom contient le mot-clé (ex : "trompe", "gateau")
export function findCategoryByKeyword(categories: Category[], keyword: string) {
  const key = normalize(keyword);
  return categories.find((c) => normalize(c.name).includes(key));
}

export function createdAtMs(product: Product) {
  return product.createdAt ? product.createdAt._seconds * 1000 : 0;
}

export function isNewProduct(product: Product) {
  const ms = createdAtMs(product);
  return ms > 0 && Date.now() - ms < NEW_PRODUCT_DAYS * 24 * 60 * 60 * 1000;
}

// Disponibles d'abord, puis les plus récents
export function sortForShowcase(products: Product[]) {
  return [...products].sort(
    (a, b) => Number(b.isAvailable) - Number(a.isAvailable) || createdAtMs(b) - createdAtMs(a)
  );
}
