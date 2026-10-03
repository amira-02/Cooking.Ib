import SectionHeading from "../ui/SectionHeading";
import Reveal from "../ui/Reveal";
import { SAVOIR_FAIRE } from "../../data/homeContent";
import type { HomeImages } from "../../data/homeContent";

function SavoirFaireSection({ images }: { images: HomeImages }) {
  return (
    <section id="savoir-faire" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
      <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <Reveal className="relative">
          <div className="aspect-[4/5] overflow-hidden rounded-[2rem] bg-beige">
            {images.savoirFaire && (
              <img
                src={images.savoirFaire}
                alt="Notre atelier de pâtisserie"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            )}
          </div>
          {/* Citation flottante */}
          <div className="absolute -bottom-8 right-4 max-w-[15rem] rounded-2xl bg-ink p-6 text-cream shadow-xl lg:-right-8">
            <p className="font-serif text-lg font-light italic leading-snug">
              « Chaque détail compte, jusqu'au dernier reflet. »
            </p>
          </div>
        </Reveal>

        <div className="pt-6 lg:pt-0">
          <SectionHeading
            eyebrow="Notre savoir-faire"
            title="La passion du détail"
            subtitle="Chaque création naît d'heures de travail minutieux : moulages, inserts, glaçages et finitions au pinceau. Nous façonnons chaque pièce à la main, avec la précision d'un artisan et l'imagination d'un créateur."
          />

          <ol className="mt-12 divide-y divide-sand border-y border-sand">
            {SAVOIR_FAIRE.values.map((value, i) => (
              <li key={value.number}>
                <Reveal delay={i * 0.1} className="flex gap-6 py-6">
                  <span className="font-serif text-2xl font-light text-gold">{value.number}</span>
                  <div>
                    <h3 className="font-serif text-xl text-ink">{value.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-light">{value.text}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export default SavoirFaireSection;
