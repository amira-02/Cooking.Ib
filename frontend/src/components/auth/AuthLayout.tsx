import { Link, useLocation, useOutlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { ToastProvider } from "../ui/Toast";
import { EASE_SOFT } from "../ui/motion";
import { useHomepageImages } from "../../hooks/useHomepageImages";

function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className={`font-serif text-[1.4rem] tracking-wide ${light ? "text-cream" : "text-ink"}`}>
      Cooking <em className={`font-light ${light ? "text-cream/85" : "text-rose-dark"}`}>Ib</em>
    </Link>
  );
}

// Structure commune des pages d'authentification : image immersive à gauche (desktop),
// formulaire à droite. Les pages s'affichent dans l'Outlet avec une transition douce.
function AuthLayout() {
  const { pathname } = useLocation();
  const outlet = useOutlet();
  // Même photo que l'en-tête de la page d'accueil (modifiable depuis l'admin)
  const { images } = useHomepageImages();

  return (
    <ToastProvider>
      <div className="flex min-h-[100dvh] bg-cream">
        {/* Visuel (masqué sous 1024px). Le panneau entier reste collé en haut et garde la hauteur
            de l'écran : la photo occupe toujours toute la hauteur, même quand le formulaire est long
            et défile (un enfant sticky ne fonctionnerait pas à cause de overflow-hidden). */}
        <aside className="sticky top-0 hidden h-[100dvh] w-[46%] shrink-0 self-start overflow-hidden bg-[#F4E9DE] lg:block xl:w-1/2">
          <div className="relative h-full">
            {images.hero && (
              <motion.img
                src={images.hero}
                alt=""
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.6, ease: EASE_SOFT }}
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
            {/* Voile : texte lisible en bas, logo lisible en haut, quelle que soit la photo */}
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/15 to-transparent" />
            <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-ink/45 to-transparent" />
            <div className="absolute left-10 top-9">
              <Logo light />
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: EASE_SOFT, delay: 0.3 }}
              className="absolute inset-x-10 bottom-12 max-w-md"
            >
              <span className="mb-5 block h-px w-12 bg-gold" aria-hidden />
              <p className="font-serif text-4xl font-light leading-tight text-cream xl:text-5xl">L'art de créer l'illusion.</p>
              <p className="mt-4 text-[15px] text-cream/80">Des créations uniques imaginées avec passion.</p>
            </motion.div>
          </div>
        </aside>

        {/* Formulaire */}
        <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Halo décoratif léger : garde l'identité visuelle sur mobile sans image */}
          <div aria-hidden className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[#F4E9DE] opacity-70 blur-3xl lg:hidden" />

          <header className="relative flex items-center justify-between px-5 pt-6 sm:px-10 sm:pt-8">
            <div className="lg:invisible">
              <Logo />
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] text-ink-light transition-colors hover:bg-white hover:text-ink"
            >
              <ArrowLeft size={15} />
            <span className="min-[380px]:hidden">Boutique</span>
            <span className="hidden min-[380px]:inline">Retour à la boutique</span>
            </Link>
          </header>

          <div className="relative flex flex-1 items-center justify-center px-5 py-10 sm:px-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: EASE_SOFT }}
                className="w-full max-w-[26rem]"
              >
                {outlet}
              </motion.div>
            </AnimatePresence>
          </div>

          <footer className="relative px-5 pb-6 text-center text-xs text-ink-light/80 sm:px-10">
            © 2026 Cooking Ib — Tous droits réservés
          </footer>
        </main>
      </div>
    </ToastProvider>
  );
}

export default AuthLayout;
