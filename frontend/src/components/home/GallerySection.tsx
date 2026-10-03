import SectionHeading from "../ui/SectionHeading";
import ButtonLink from "../ui/ButtonLink";
import Reveal from "../ui/Reveal";
import { InstagramIcon } from "../ui/SocialIcons";
import { CONTACT, GALLERY_SLOTS } from "../../data/homeContent";
import type { HomeImages } from "../../data/homeContent";

function GallerySection({ images }: { images: HomeImages }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          eyebrow={CONTACT.instagramHandle}
          title="Suivez notre univers gourmand"
          subtitle="Coulisses de l'atelier, nouvelles créations et commandes du moment."
        />
        <Reveal className="shrink-0">
          <ButtonLink to={CONTACT.instagramUrl} external variant="outline">
            <InstagramIcon size={16} /> Instagram
          </ButtonLink>
        </Reveal>
      </div>

      {/* La 1re photo occupe 2×2 cases sur grand écran */}
      <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {GALLERY_SLOTS.map((slot, i) => (
          <Reveal
            key={slot}
            delay={(i % 4) * 0.06}
            className={i === 0 ? "col-span-2 row-span-2" : ""}
          >
            <a
              href={CONTACT.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Voir sur Instagram"
              className="group relative block h-full overflow-hidden rounded-2xl bg-beige"
            >
              {images[slot] ? (
                <img
                  src={images[slot]}
                  alt=""
                  loading="lazy"
                  className="aspect-square h-full w-full object-cover transition-transform duration-[1.2s] ease-soft group-hover:scale-[1.06]"
                />
              ) : (
                <span className="block aspect-square" />
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-ink/0 text-cream opacity-0 transition-all duration-500 group-hover:bg-ink/35 group-hover:opacity-100">
                <InstagramIcon size={26} />
              </span>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export default GallerySection;
