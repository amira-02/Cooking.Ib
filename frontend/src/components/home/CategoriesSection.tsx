import CategoryCard from "./CategoryCard";
import SectionHeading from "../ui/SectionHeading";
import Reveal from "../ui/Reveal";
import { CATEGORY_CARDS } from "../../data/homeContent";
import type { HomeImages } from "../../data/homeContent";

function CategoriesSection({ images }: { images: HomeImages }) {
  return (
    <section id="creations" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <SectionHeading
        eyebrow="Nos univers"
        title="Découvrez nos créations"
        subtitle="Du trompe-l'œil bluffant au gâteau de fête, chaque pièce est façonnée à la main dans notre atelier."
        align="center"
      />

      <div className="mt-14 grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-4">
        {CATEGORY_CARDS.map((card, i) => (
          <Reveal key={card.title} delay={i * 0.08}>
            <CategoryCard
              title={card.title}
              description={card.description}
              image={images[card.imageSlot]}
              to={`/produits?categorie=${card.keyword}`}
            />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export default CategoriesSection;
