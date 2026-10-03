import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface CategoryCardProps {
  title: string;
  description: string;
  image?: string;
  to: string;
}

function CategoryCard({ title, description, image, to }: CategoryCardProps) {
  return (
    <Link
      to={to}
      className="group relative block aspect-[4/3] overflow-hidden min-[480px]:aspect-[3/4] rounded-2xl bg-beige focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose-dark"
    >
      {image && (
        <img
          src={image}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] ease-soft group-hover:scale-[1.06]"
        />
      )}
      {/* Dégradé pour la lisibilité du texte, qui s'intensifie légèrement au survol */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/15 to-transparent transition-opacity duration-500 group-hover:opacity-90" />

      <div className="absolute inset-x-0 bottom-0 p-6">
        <h3 className="font-serif text-2xl text-cream">{title}</h3>
        <p className="mt-1.5 text-sm leading-snug text-cream/80">{description}</p>
        <span className="mt-4 inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-cream">
          Découvrir
          <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1.5" />
        </span>
      </div>
    </Link>
  );
}

export default CategoryCard;
