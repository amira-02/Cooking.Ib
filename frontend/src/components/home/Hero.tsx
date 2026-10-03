import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import ButtonLink from "../ui/ButtonLink";
import { Eyebrow } from "../ui/SectionHeading";
import { EASE_SOFT } from "../ui/motion";
import type { HomeImages } from "../../data/homeContent";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE_SOFT } },
};

function Hero({ images }: { images: HomeImages }) {
  return (
    <section className="relative overflow-hidden">
      {/* Halo décoratif très léger */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-beige blur-3xl opacity-70"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-10 sm:px-6 sm:pt-14 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:px-8 lg:pb-28 lg:pt-20">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-xl">
          <motion.div variants={item}>
            <Eyebrow>L'art de la pâtisserie</Eyebrow>
          </motion.div>

          <motion.h1
            variants={item}
            className="mt-6 font-serif text-[2.4rem] font-light leading-[1.05] tracking-tight text-ink min-[400px]:text-5xl lg:text-[3.6rem] xl:text-[4rem]"
          >
            Des créations qui <em className="font-normal text-rose-dark">trompent les yeux</em> et émerveillent les papilles.
          </motion.h1>

          <motion.p variants={item} className="mt-6 max-w-md text-[15px] leading-relaxed text-ink-light sm:text-base">
            Découvrez nos trompe-l'œil et créations pâtissières imaginés avec passion, entre précision,
            créativité et gourmandise.
          </motion.p>

          <motion.div variants={item} className="mt-9 flex flex-col gap-3 min-[400px]:flex-row min-[400px]:flex-wrap">
            <ButtonLink to="/#creations">
              Découvrir nos créations
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </ButtonLink>
            <ButtonLink to="/produits" variant="outline">
              Commander maintenant
            </ButtonLink>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, ease: EASE_SOFT, delay: 0.2 }}
          className="relative mx-auto w-full max-w-[26rem] lg:max-w-[30rem]"
        >
          {/* Cercle doré décalé derrière l'image */}
          <div
            aria-hidden
            className="absolute -left-5 -top-5 h-full w-full rounded-t-full rounded-b-[2rem] border border-gold/50 sm:-left-7 sm:-top-7"
          />

          <div className="relative aspect-[4/5] overflow-hidden rounded-t-full rounded-b-[2rem] bg-beige shadow-[0_40px_80px_-40px_rgba(74,48,40,0.45)]">
            {images.hero && (
              <motion.img
                src={images.hero}
                alt="Création signature de la pâtisserie"
                fetchPriority="high"
                initial={{ scale: 1.12 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.8, ease: EASE_SOFT }}
                className="h-full w-full object-cover"
              />
            )}
          </div>

          {/* Étiquette flottante */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: EASE_SOFT, delay: 1 }}
            className="absolute -right-2 bottom-10 flex items-center gap-3 rounded-2xl bg-cream/95 px-4 py-3 shadow-lg backdrop-blur sm:-right-6 xl:-right-10"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-beige text-gold">
              <Sparkles size={16} strokeWidth={1.6} />
            </span>
            <span className="leading-tight">
              <span className="block font-serif text-[15px] text-ink">Plus vrai que nature</span>
              <span className="block text-[11px] uppercase tracking-[0.18em] text-ink-light">Fait main</span>
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;
