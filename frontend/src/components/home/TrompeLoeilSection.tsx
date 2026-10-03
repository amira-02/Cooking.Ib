import { ArrowRight } from "lucide-react";
import SectionHeading from "../ui/SectionHeading";
import ButtonLink from "../ui/ButtonLink";
import Reveal from "../ui/Reveal";
import ProductGrid from "../product/ProductGrid";
import type { Product } from "../../types/catalog";

interface TrompeLoeilSectionProps {
  products: Product[];
  loading: boolean;
}

function TrompeLoeilSection({ products, loading }: TrompeLoeilSectionProps) {
  return (
    <section className="bg-beige/60">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Notre signature"
            title={
              <>
                Plus vrais <em className="font-normal text-rose-dark">que nature.</em>
              </>
            }
            subtitle="Des créations surprenantes où chaque détail est pensé pour transformer une pâtisserie en véritable illusion."
          />
          <Reveal className="shrink-0">
            <ButtonLink to="/produits?categorie=trompe" variant="ghost">
              Tous les trompe-l'œil
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </ButtonLink>
          </Reveal>
        </div>

        <div className="mt-12">
          {!loading && products.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-sand px-6 py-12 text-center text-sm text-ink-light">
              Nos trompe-l'œil arrivent très bientôt. En attendant, découvrez toute la boutique.
            </p>
          ) : (
            <ProductGrid products={products} loading={loading} showDescription />
          )}
        </div>
      </div>
    </section>
  );
}

export default TrompeLoeilSection;
