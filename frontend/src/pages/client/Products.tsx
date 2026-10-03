import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import ProductGrid from "../../components/product/ProductGrid";
import { useCatalog } from "../../hooks/useCatalog";
import { findCategoryByKeyword, normalize } from "../../utils/catalog";

// Les filtres vivent dans l'URL (?categorie=…&q=…) : on peut partager ou
// ouvrir directement /produits?categorie=trompe depuis la page d'accueil
function Products() {
  const { products, categories, loading } = useCatalog();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("categorie") ?? "";
  const search = searchParams.get("q") ?? "";

  // ?categorie= accepte un id ou un mot-clé ("trompe", "gateau"…)
  const selectedCategory = useMemo(() => {
    if (!categoryParam) return "all";
    if (categories.some((c) => c.id === categoryParam)) return categoryParam;
    return findCategoryByKeyword(categories, categoryParam)?.id ?? "all";
  }, [categoryParam, categories]);

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  }

  const filteredProducts = useMemo(() => {
    const term = normalize(search.trim());
    return products.filter((p) => {
      const matchCategory = selectedCategory === "all" || p.categoryId === selectedCategory;
      const matchSearch = !term || normalize(`${p.name} ${p.description}`).includes(term);
      return matchCategory && matchSearch;
    });
  }, [products, selectedCategory, search]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[240px_1fr]">
        {/* SIDEBAR */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="mb-6 flex items-center gap-3 border-b border-beige pb-3">
            <Search size={16} className="text-ink-light" />
            <input
              value={search}
              onChange={(e) => updateParam("q", e.target.value)}
              placeholder="Rechercher..."
              className="w-full bg-transparent text-sm text-ink placeholder:text-ink-light focus:outline-none"
            />
          </div>

          <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-2 lg:mx-0 lg:flex-col lg:px-0 lg:pb-0">
            <CategoryButton
              label="Tout"
              active={selectedCategory === "all"}
              onClick={() => updateParam("categorie", "")}
            />
            {categories.map((cat) => (
              <CategoryButton
                key={cat.id}
                label={cat.name}
                active={selectedCategory === cat.id}
                onClick={() => updateParam("categorie", cat.id)}
              />
            ))}
          </nav>
        </aside>

        {/* PRODUITS */}
        <section>
          {!loading && filteredProducts.length === 0 ? (
            <p className="text-sm text-ink-light">Aucun gâteau ne correspond à votre recherche.</p>
          ) : (
            <ProductGrid
              products={filteredProducts}
              loading={loading}
              skeletonCount={6}
              showDescription
              columns={3}
            />
          )}
        </section>
      </div>
    </div>
  );
}

function CategoryButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-4 py-3 text-left text-xs uppercase tracking-[0.15em] transition-colors lg:rounded-lg ${
        active ? "bg-ink text-cream" : "text-ink-light hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}

export default Products;
