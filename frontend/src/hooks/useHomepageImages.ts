import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config/api";
import { HOME_IMAGE_SLOTS } from "../data/homeContent";
import type { HomeImages, HomeImageSlot } from "../data/homeContent";

export const HOMEPAGE_ENDPOINT = `${API_URL}/api/homepage`;

const SLOT_KEYS = Object.keys(HOME_IMAGE_SLOTS) as HomeImageSlot[];

// Photos choisies depuis l'admin, complétées par les photos d'exemple.
// Pendant le chargement, `images` est vide : on n'affiche pas la photo d'exemple
// pour éviter qu'elle apparaisse une fraction de seconde avant la vôtre.
export function useHomepageImages() {
  const [customImages, setCustomImages] = useState<HomeImages>({});
  const [loading, setLoading] = useState(true);

  const fetchImages = useCallback(
    () =>
      axios
        .get(HOMEPAGE_ENDPOINT)
        .then((res) => setCustomImages(res.data.images ?? {}))
        .catch((error) => console.error("Erreur de chargement des photos de l'accueil:", error))
        .finally(() => setLoading(false)),
    []
  );

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  // Rechargement après une modification depuis l'admin
  const reload = fetchImages;

  const images: HomeImages = loading
    ? {}
    : Object.fromEntries(SLOT_KEYS.map((slot) => [slot, customImages[slot] ?? HOME_IMAGE_SLOTS[slot].example]));

  return { images, customImages, loading, reload };
}
