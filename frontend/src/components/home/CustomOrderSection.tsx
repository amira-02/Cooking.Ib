import { ArrowRight } from "lucide-react";
import SectionHeading from "../ui/SectionHeading";
import ButtonLink from "../ui/ButtonLink";
import Reveal from "../ui/Reveal";
import { CUSTOM_ORDER } from "../../data/homeContent";
import type { HomeImages } from "../../data/homeContent";

function CustomOrderSection({ images }: { images: HomeImages }) {
  return (
    <section className="px-4 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] bg-ink lg:grid-cols-2">
        <div className="flex flex-col justify-center px-6 py-14 sm:px-12 lg:px-16 lg:py-20">
          <SectionHeading
            eyebrow="Sur mesure"
            title={
              <>
                Un gâteau imaginé <em className="font-normal text-rose">pour vous</em>
              </>
            }
            subtitle="Anniversaire, mariage, événement ou simple envie gourmande : créons ensemble une pâtisserie unique."
            light
          />

          <Reveal delay={0.1}>
            <ul className="mt-8 flex flex-wrap gap-2">
              {CUSTOM_ORDER.occasions.map((occasion) => (
                <li
                  key={occasion}
                  className="rounded-full border border-cream/20 px-4 py-1.5 text-xs tracking-wide text-cream/80"
                >
                  {occasion}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.2} className="mt-10">
            <ButtonLink to="/#contact" variant="light">
              Créer ma commande
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </ButtonLink>
          </Reveal>
        </div>

        <div className="relative bg-ink-light/30 min-h-[18rem] sm:min-h-[24rem] lg:min-h-full">
          {images.customOrder && (
            <img
              src={images.customOrder}
              alt="Gâteau personnalisé"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
        </div>
      </div>
    </section>
  );
}

export default CustomOrderSection;
