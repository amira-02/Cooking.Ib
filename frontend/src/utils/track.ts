import { API_URL } from "../config/api";

type TrackEvent = "visit" | "product_view" | "add_to_cart";

const VISIT_KEY = "cookingib.lastVisit";

// Envoie un compteur d'audience anonyme (aucune donnée personnelle) au backend.
// « Fire and forget » : une erreur de suivi ne doit jamais gêner la navigation.
export function track(type: TrackEvent, productId?: string) {
  try {
    fetch(`${API_URL}/api/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, productId }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // ignoré
  }
}

// Un visiteur = un navigateur par jour (sans cookie, via localStorage)
export function trackDailyVisit() {
  const today = new Date().toLocaleDateString("en-CA");
  try {
    if (localStorage.getItem(VISIT_KEY) === today) return;
    localStorage.setItem(VISIT_KEY, today);
  } catch {
    // stockage indisponible : on compte quand même la visite
  }
  track("visit");
}
