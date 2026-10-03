import { ArrowRight } from "lucide-react";
import ButtonLink from "../ui/ButtonLink";
import Reveal from "../ui/Reveal";
import { Eyebrow } from "../ui/SectionHeading";
import type { HomeImages } from "../../data/homeContent";

function CTASection({ images }: { images: HomeImages }) {
  return (
    <section className="px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-ink">
        {images.cta && (
          <img
            src={images.cta}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-ink/70 sm:bg-transparent sm:bg-gradient-to-r sm:from-ink/85 sm:via-ink/60 sm:to-ink/20" />

        <Reveal className="relative px-6 py-20 sm:px-12 lg:px-20 lg:py-28">
          <Eyebrow light>Boutique en ligne</Eyebrow>
          <h2 className="mt-5 max-w-xl font-serif text-[2rem] font-light leading-[1.1] text-cream sm:text-5xl">
            Prêt à découvrir nos créations ?
          </h2>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-cream/80">
            Faites entrer un peu de magie dans votre prochaine occasion.
          </p>
          <ButtonLink to="/produits" variant="light" className="mt-9">
            Découvrir la boutique
            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}

export default CTASection;
