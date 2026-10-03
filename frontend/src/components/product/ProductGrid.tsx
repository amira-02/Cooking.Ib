import { motion } from "framer-motion";
import ProductCard, { ProductCardSkeleton } from "./ProductCard";
import { EASE_SOFT } from "../ui/motion";
import type { Category, Product } from "../../types/catalog";

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  skeletonCount?: number;
  showDescription?: boolean;
  categories?: Category[];
  columns?: 3 | 4;
}

const columnClasses = {
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
};

function ProductGrid({
  products,
  loading = false,
  skeletonCount = 4,
  showDescription = false,
  categories,
  columns = 4,
}: ProductGridProps) {
  const grid = `grid grid-cols-1 gap-x-3 gap-y-10 min-[360px]:grid-cols-2 sm:gap-x-6 ${columnClasses[columns]}`;

  if (loading) {
    return (
      <div className={grid}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className={grid}>
      {products.map((product, i) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.7, ease: EASE_SOFT, delay: (i % columns) * 0.08 }}
        >
          <ProductCard
            product={product}
            showDescription={showDescription}
            categoryName={categories?.find((c) => c.id === product.categoryId)?.name}
          />
        </motion.div>
      ))}
    </div>
  );
}

export default ProductGrid;
