import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import { FacebookIcon, InstagramIcon, TikTokIcon } from "./ui/SocialIcons";
import { BRAND, CATEGORY_CARDS, CONTACT } from "../data/homeContent";

const navigation = [
  { to: "/", label: "Accueil" },
  { to: "/produits", label: "Nos créations" },
  { to: "/#savoir-faire", label: "À propos" },
  { to: "/panier", label: "Panier" },
  { to: "/login", label: "Mon compte" },
];

const socials = [
  { href: CONTACT.instagramUrl, label: "Instagram", Icon: InstagramIcon },
  { href: CONTACT.facebookUrl, label: "Facebook", Icon: FacebookIcon },
  { href: CONTACT.tiktokUrl, label: "TikTok", Icon: TikTokIcon },
];

function FooterTitle({ children }: { children: string }) {
  return <h3 className="font-sans text-[11px] font-medium uppercase tracking-[0.25em] text-cream">{children}</h3>;
}

const linkClass = "text-sm text-cream/65 transition-colors hover:text-cream";

function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  // TODO : brancher sur un vrai service de newsletter (Brevo, Mailchimp…)
  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    setSubscribed(true);
    setEmail("");
  }

  return (
    <footer id="contact" className="bg-ink text-cream">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-12 lg:gap-8">
          {/* Marque */}
          <div className="col-span-2 lg:col-span-4">
            <Link to="/" className="font-serif text-2xl">
              Cooking <em className="font-light text-rose">Ib</em>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/65">{BRAND.tagline}</p>
            <div className="mt-6 flex gap-2">
              {socials.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-cream/20 text-cream/80 transition-colors hover:border-rose hover:bg-rose hover:text-ink"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Navigation" className="lg:col-span-2">
            <FooterTitle>Navigation</FooterTitle>
            <ul className="mt-5 space-y-3">
              {navigation.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Catégories" className="lg:col-span-2">
            <FooterTitle>Catégories</FooterTitle>
            <ul className="mt-5 space-y-3">
              {CATEGORY_CARDS.map((card) => (
                <li key={card.title}>
                  <Link to={`/produits?categorie=${card.keyword}`} className={linkClass}>
                    {card.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="col-span-2 lg:col-span-4">
            <FooterTitle>Contact</FooterTitle>
            <ul className="mt-5 space-y-3 text-sm text-cream/65">
              <li>
                <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 hover:text-cream">
                  <Phone size={15} strokeWidth={1.6} className="shrink-0 text-rose" /> {CONTACT.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-3 break-all hover:text-cream">
                  <Mail size={15} strokeWidth={1.6} className="shrink-0 text-rose" /> {CONTACT.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={15} strokeWidth={1.6} className="mt-0.5 shrink-0 text-rose" /> {CONTACT.address}
              </li>
            </ul>

            <div className="mt-8">
              <FooterTitle>Newsletter</FooterTitle>
              <p className="mt-3 text-sm text-cream/65">Nouveautés et créations de saison, une fois par mois.</p>
              {subscribed ? (
                <p className="mt-4 text-sm text-rose">Merci, à très vite dans votre boîte mail !</p>
              ) : (
                <form onSubmit={handleSubscribe} className="mt-4 flex rounded-full border border-cream/20 p-1 focus-within:border-rose">
                  <label htmlFor="newsletter-email" className="sr-only">
                    Adresse email
                  </label>
                  <input
                    id="newsletter-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Votre adresse email"
                    className="min-w-0 flex-1 bg-transparent px-4 text-sm text-cream placeholder:text-cream/40 focus:outline-none"
                  />
                  <button
                    type="submit"
                    aria-label="S'inscrire à la newsletter"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream text-ink transition-colors hover:bg-rose"
                  >
                    <ArrowRight size={16} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-cream/10 pt-8 text-xs text-cream/50 sm:flex-row sm:justify-between">
          <p>© 2026 {BRAND.name} — Tous droits réservés</p>
          <p>Fait main avec passion</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
