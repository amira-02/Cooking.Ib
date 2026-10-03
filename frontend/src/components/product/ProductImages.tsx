import { useEffect, useState } from "react";

const SLIDE_INTERVAL_MS = 1200;

interface ProductImagesProps {
  images: string[];
  alt: string;
  hovered: boolean;
}

// Affiche la 1re image ; tant que `hovered` est vrai, fait défiler toutes les images en boucle
function ProductImages({ images, alt, hovered }: ProductImagesProps) {
  const [index, setIndex] = useState(0);
  const hasMany = images.length > 1;

  // À chaque début / fin de survol, on repart de la 1re image
  const [prevHovered, setPrevHovered] = useState(hovered);
  if (hovered !== prevHovered) {
    setPrevHovered(hovered);
    setIndex(0);
  }

  useEffect(() => {
    if (!hovered || !hasMany) return;
    const advance = () => setIndex((i) => (i + 1) % images.length);
    // Première image suivante presque tout de suite pour un retour immédiat au survol
    const first = setTimeout(advance, 150);
    const timer = setInterval(advance, SLIDE_INTERVAL_MS);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [hovered, hasMany, images.length]);

  if (images.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center text-sm text-ink-light">
        Photo à venir
      </div>
    );
  }

  return (
    <>
      {/* Toutes les images sont empilées : seule la courante est visible (fondu) */}
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={i === 0 ? alt : ""}
          aria-hidden={i !== index}
          loading="lazy"
          className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-700 ease-soft ${
            i === index ? "opacity-100" : "opacity-0"
          } ${hovered ? "scale-[1.04]" : "scale-100"}`}
        />
      ))}

      {hasMany && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          {images.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-4 bg-cream" : "w-1.5 bg-cream/60"
              }`}
            />
          ))}
        </div>
      )}
    </>
  );
}

export default ProductImages;
