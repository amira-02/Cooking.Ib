import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// React Router ne gère pas le scroll : on remonte en haut à chaque page,
// ou on descend jusqu'à l'ancre (#savoir-faire, #contact…) si l'URL en contient une
function ScrollManager() {
  const { pathname, search, hash } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    // Mises à jour silencieuses de l'URL (ex : filtres tapés dans la recherche) : on ne bouge pas
    if (navigationType === "REPLACE") return;

    if (hash) {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, search, hash, navigationType]);

  return null;
}

export default ScrollManager;
