import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Star } from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

function Home() {
  return (
    <div className="bg-cream text-ink overflow-hidden">
      {/* HERO */}
      <section className="relative bg-[#F3E9DD]">
        <div className="max-w-6xl mx-auto px-8 pt-16 pb-32 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
          <motion.div initial="hidden" animate="show" variants={stagger}>
            <motion.p variants={fadeUp} className="uppercase text-xs tracking-[0.2em] text-ink-light mb-6">
              Ne faites pas que goûter
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="font-serif text-5xl sm:text-7xl leading-[0.95] mb-8"
            >
              Vivez
              <br />
              un moment.
            </motion.h1>
            <motion.p variants={fadeUp} className="text-ink-light max-w-sm mb-10">
              Plus que des gâteaux — des instants gourmands façonnés avec soin,
              pour vos jours les plus précieux.
            </motion.p>
            <motion.div variants={fadeUp} className="flex items-center gap-3 text-sm text-ink-light">
              <span className="w-9 h-9 rounded-full border border-ink/30 flex items-center justify-center">
                ↓
              </span>
              Faites défiler pour explorer
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="relative flex justify-center"
          >
            <div className="w-full max-w-sm aspect-[4/5] rounded-t-[180px] rounded-b-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80"
                alt="Gâteau au chocolat signature"
                className="w-full h-full object-cover"
              />
            </div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="absolute right-0 top-6 bg-white rounded-full shadow-lg p-1.5 flex items-center gap-2 pr-4"
            >
              <span className="w-9 h-9 rounded-full bg-[#6B4226] block" />
              <span className="text-sm">Chocolat</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.85, duration: 0.6 }}
              className="absolute right-4 top-24 bg-white/90 rounded-full shadow p-1.5 flex items-center gap-2 pr-4"
            >
              <span className="w-9 h-9 rounded-full bg-[#F0E4C8] block" />
              <span className="text-sm">Vanille</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="absolute right-0 top-40 bg-white/80 rounded-full shadow p-1.5 flex items-center gap-2 pr-4"
            >
              <span className="w-9 h-9 rounded-full bg-rose block" />
              <span className="text-sm">Fraise</span>
            </motion.div>
          </motion.div>
        </div>

        {/* courbe de transition */}
        <svg
          className="absolute -bottom-1 left-0 w-full text-ink"
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M0,100 C480,0 960,0 1440,100 L1440,100 L0,100 Z"
          />
        </svg>
      </section>

      {/* MOOD */}
      <section className="bg-ink text-cream pt-20 pb-24">
        <div className="max-w-6xl mx-auto px-8">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
            className="mb-14"
          >
            <motion.p variants={fadeUp} className="uppercase text-xs tracking-[0.2em] text-cream/50 mb-3">
              Choisissez votre humeur
            </motion.p>
            <motion.h2 variants={fadeUp} className="font-serif text-4xl sm:text-5xl max-w-md">
              Chaque envie
              <br />
              mérite son gâteau.
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-5"
          >
            {[
              { title: "J'ai besoin de chocolat", featured: true },
              { title: "Je suis amoureux·se", featured: false },
              { title: "Je célèbre", featured: false },
              { title: "Je veux du raffinement", featured: false },
            ].map((mood) => (
              <motion.div
                key={mood.title}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                className={`rounded-t-[60px] rounded-b-2xl p-6 pt-10 h-56 flex flex-col justify-between cursor-pointer transition-colors ${
                  mood.featured
                    ? "bg-rose text-ink"
                    : "bg-cream/10 hover:bg-cream/15"
                }`}
              >
                <span className="text-sm leading-snug">{mood.title}</span>
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    mood.featured ? "bg-ink text-cream" : "bg-cream/15"
                  }`}
                >
                  <ArrowRight size={14} />
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FEATURED CAKE */}
      <section className="py-28">
        <div className="max-w-6xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-[0.9fr_1fr_0.7fr] gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="aspect-square rounded-full overflow-hidden bg-beige">
              <img
                src="https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=80"
                alt="Truffe au chocolat"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-xs px-3 py-1 rounded-full shadow">
              360°
            </span>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            variants={stagger}
          >
            <motion.p variants={fadeUp} className="uppercase text-xs tracking-[0.2em] text-ink-light mb-3">
              Création vedette
            </motion.p>
            <motion.h2 variants={fadeUp} className="font-serif text-4xl mb-4">
              Truffe au
              <br />
              chocolat
            </motion.h2>
            <motion.p variants={fadeUp} className="text-ink-light mb-6 max-w-xs">
              Riche. Fondante. Irrésistible. Génoise moelleuse, ganache soyeuse
              et copeaux de chocolat faits main.
            </motion.p>
            <motion.p variants={fadeUp} className="text-xl mb-6">
              65 DT et plus
            </motion.p>
            <motion.button
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full bg-ink text-cream px-6 py-3 hover:bg-rose-dark transition-colors"
            >
              Ajouter au panier <ArrowRight size={16} />
            </motion.button>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            variants={stagger}
            className="flex flex-col gap-6 text-sm text-ink-light border-l border-beige pl-8"
          >
            {["Ingrédients premium", "Préparé chaque jour", "Personnalisable pour chaque occasion"].map(
              (item) => (
                <motion.div key={item} variants={fadeUp}>
                  {item}
                </motion.div>
              )
            )}
          </motion.div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="bg-ink text-cream py-24">
        <div className="max-w-6xl mx-auto px-8">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
            className="mb-16"
          >
            <motion.p variants={fadeUp} className="uppercase text-xs tracking-[0.2em] text-cream/50 mb-3">
              Le gâteau prend vie
            </motion.p>
            <motion.h2 variants={fadeUp} className="font-serif text-4xl max-w-md">
              Chaque étape compte.
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 relative"
          >
            {[
              { n: "01", title: "La base", text: "Une génoise simple et aérienne." },
              { n: "02", title: "La crème", text: "Une couche de douceur." },
              { n: "03", title: "Le glaçage", text: "Lisse, riche, irrésistible." },
              { n: "04", title: "La décoration", text: "Ce n'est plus un gâteau, c'est une émotion." },
            ].map((item, i) => (
              <motion.div key={item.n} variants={fadeUp} className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-9 h-9 rounded-full border border-cream/30 flex items-center justify-center text-xs">
                    {item.n}
                  </span>
                  {i < 3 && <ArrowRight size={16} className="text-cream/30 hidden md:block" />}
                </div>
                <h3 className="font-serif text-lg mb-1">{item.title}</h3>
                <p className="text-cream/60 text-sm">{item.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CAKE DNA */}
      <section className="py-28">
        <div className="max-w-6xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7 }}
          >
            <p className="uppercase text-xs tracking-[0.2em] text-ink-light mb-3">
              À l'intérieur du gâteau
            </p>
            <h2 className="font-serif text-4xl mb-8">
              Des couches d'amour,
              <br />à chaque bouchée.
            </h2>
            <ol className="space-y-4">
              {[
                { n: "01", label: "Chocolat belge", text: "Ganache riche et onctueuse" },
                { n: "02", label: "Crème fouettée", text: "Légère et aérienne" },
                { n: "03", label: "Génoise cacao", text: "Moelleuse et tendre" },
                { n: "04", label: "Éclats de chocolat", text: "Pour le croquant parfait" },
              ].map((layer) => (
                <li key={layer.n} className="flex gap-4 items-baseline border-b border-beige pb-3">
                  <span className="text-ink-light text-sm w-6">{layer.n}</span>
                  <div>
                    <p className="text-ink">{layer.label}</p>
                    <p className="text-ink-light text-sm">{layer.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7 }}
            className="aspect-square rounded-3xl overflow-hidden bg-beige"
          >
            <img
              src="https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&q=80"
              alt="Coupe du gâteau en couches"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-[#F3E9DD]">
        <div className="max-w-6xl mx-auto px-8">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif text-4xl mb-12"
          >
            Paroles gourmandes
          </motion.h2>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              { name: "Amira T.", text: "Le gâteau était encore meilleur que ce à quoi je m'attendais." },
              { name: "Youssef B.", text: "Chaque part avait un goût de fête." },
              { name: "Salma K.", text: "Goût incroyable, présentation superbe, service au top." },
            ].map((review) => (
              <motion.div
                key={review.name}
                variants={fadeUp}
                className="bg-white rounded-2xl p-6"
              >
                <div className="flex gap-1 text-rose-dark mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <p className="text-ink mb-4">"{review.text}"</p>
                <p className="text-ink-light text-sm">— {review.name}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA FOOTER */}
      <section className="relative py-32 bg-ink text-cream text-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=1200&q=60"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <svg
          className="absolute top-0 left-0 w-full text-cream"
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
        >
          <path fill="currentColor" d="M0,0 C480,60 960,60 1440,0 L1440,0 L0,0 Z" />
        </svg>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative max-w-xl mx-auto px-8"
        >
          <p className="uppercase text-xs tracking-[0.2em] text-cream/50 mb-4">
            C'est plus qu'un gâteau
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl mb-8">
            Créez quelque chose
            <br />
            dont on se souviendra.
          </h2>
          <Link
            to="/produits"
            className="inline-flex items-center gap-2 rounded-full bg-cream text-ink px-7 py-3 hover:bg-rose transition-colors"
          >
            Personnaliser mon gâteau <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}

export default Home;