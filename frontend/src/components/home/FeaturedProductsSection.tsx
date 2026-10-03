import { ArrowRight } from "lucide-react";
import SectionHeading from "../ui/SectionHeading";
import ButtonLink from "../ui/ButtonLink";
import Reveal from "../ui/Reveal";
import ProductGrid from "../product/ProductGrid";
import type { Category, Product } from "../../types/catalog";

interface FeaturedProductsSectionProps {
  products: Product[];
  categories: Category[];
  loading: boolean;
}

function FeaturedProductsSection({ products, categories, loading }: FeaturedProductsSectionProps) {
  if (!loading && products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          eyebrow="Sélection"
          title="Les créations du moment"
          subtitle="Nos pâtisseries les plus récentes, préparées à la commande."
        />
        <Reveal className="shrink-0">
          <ButtonLink to="/produits" variant="ghost">
            Voir toute la boutique
            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </ButtonLink>
        </Reveal>
      </div>

      <div className="mt-12">
        <ProductGrid products={products} categories={categories} loading={loading} skeletonCount={8} />
      </div>
    </section>
  );
}

export default FeaturedProductsSection;
