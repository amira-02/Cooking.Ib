import { useMemo } from "react";
import Hero from "../../components/home/Hero";
import CategoriesSection from "../../components/home/CategoriesSection";
import TrompeLoeilSection from "../../components/home/TrompeLoeilSection";
import SavoirFaireSection from "../../components/home/SavoirFaireSection";
import FeaturedProductsSection from "../../components/home/FeaturedProductsSection";
import CustomOrderSection from "../../components/home/CustomOrderSection";
import TestimonialsSection from "../../components/home/TestimonialsSection";
import GallerySection from "../../components/home/GallerySection";
import CTASection from "../../components/home/CTASection";
import { useCatalog } from "../../hooks/useCatalog";
import { useHomepageImages } from "../../hooks/useHomepageImages";
import { findCategoryByKeyword, sortForShowcase } from "../../utils/catalog";

const TROMPE_COUNT = 4;
const FEATURED_COUNT = 8;

// Parcours : découverte (hero, univers) → produits → savoir-faire → sur-mesure → preuve sociale → boutique
function Home() {
  const { products, categories, loading } = useCatalog();
  const { images } = useHomepageImages();

  const { trompeProducts, featuredProducts } = useMemo(() => {
    const trompeCategory = findCategoryByKeyword(categories, "trompe");
    const sorted = sortForShowcase(products);
    const trompe = trompeCategory ? sorted.filter((p) => p.categoryId === trompeCategory.id) : [];
    // Les trompe-l'œil déjà mis en avant ne sont pas répétés dans la sélection
    const featured = sorted.filter((p) => !trompe.slice(0, TROMPE_COUNT).includes(p));
    return {
      trompeProducts: trompe.slice(0, TROMPE_COUNT),
      featuredProducts: featured.slice(0, FEATURED_COUNT),
    };
  }, [products, categories]);

  return (
    <>
      <Hero images={images} />
      <CategoriesSection images={images} />
      <TrompeLoeilSection products={trompeProducts} loading={loading} />
      <SavoirFaireSection images={images} />
      <FeaturedProductsSection products={featuredProducts} categories={categories} loading={loading} />
      <CustomOrderSection images={images} />
      <TestimonialsSection />
      <GallerySection images={images} />
      <CTASection images={images} />
    </>
  );
}

export default Home;
