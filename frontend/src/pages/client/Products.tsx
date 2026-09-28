import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Search } from "lucide-react";
import { API_URL } from "../../config/api";

interface Category {
  id: string;
  name: string;
  order: number;
  isActive: boolean;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  images?: string[];
  isAvailable: boolean;
  servesCount: number;
}

function Products() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, prodRes] = await Promise.all([
          axios.get(`${API_URL}/api/categories`),
          axios.get(`${API_URL}/api/products`),
        ]);
        setCategories(catRes.data.filter((c: Category) => c.isActive));
        setProducts(prodRes.data);
      } catch (error) {
        console.error("Erreur de chargement de la carte:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCategory =
        selectedCategory === "all" || p.categoryId === selectedCategory;
      const matchSearch = p.name.toLowerCase().includes(search.trim().toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [products, selectedCategory, search]);

  return (
    <div className="max-w-6xl mx-auto px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-10">
        {/* SIDEBAR */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="flex items-center gap-3 border-b border-beige pb-3 mb-6">
            <Search size={16} className="text-ink-light" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="w-full bg-transparent text-sm text-ink placeholder:text-ink-light focus:outline-none"
            />
          </div>

          <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
            <CategoryButton
              label="Tout"
              active={selectedCategory === "all"}
              onClick={() => setSelectedCategory("all")}
            />
            {categories.map((cat) => (
              <CategoryButton
                key={cat.id}
                label={cat.name}
                active={selectedCategory === cat.id}
                onClick={() => setSelectedCategory(cat.id)}
              />
            ))}
          </nav>
        </aside>

        {/* PRODUITS */}
        <section>
          {loading ? (
            <p className="text-ink-light text-sm">Chargement de la carte...</p>
          ) : filteredProducts.length === 0 ? (
            <p className="text-ink-light text-sm">
              Aucun gâteau ne correspond à votre recherche.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <article key={product.id} className="flex flex-col">
                  <div className="aspect-[4/5] bg-beige overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-ink-light text-sm">
                        Photo à venir
                      </div>
                    )}
                  </div>

                  <div className="flex items-baseline justify-between gap-4 mt-5">
                    <h3 className="font-serif text-xl text-ink">{product.name}</h3>
                    <span className="text-ink whitespace-nowrap">
                      {product.price} DT
                    </span>
                  </div>

                  <p className="text-sm text-ink-light mt-2 line-clamp-2">
                    {product.description}
                  </p>
                  <p className="text-xs text-ink-light mt-2">
                    {product.servesCount} pers.
                  </p>

                  <button
                    disabled={!product.isAvailable}
                    className="mt-5 w-full rounded-lg border border-ink py-3 text-xs uppercase tracking-[0.15em] text-ink transition-colors hover:bg-ink hover:text-cream disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink"
                  >
                    {product.isAvailable ? "Ajouter au panier" : "Indisponible"}
                  </button>
                </article>
              ))}
            </div>
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
      className={`whitespace-nowrap text-left px-4 py-3 text-xs uppercase tracking-[0.15em] transition-colors ${
        active ? "bg-ink text-cream" : "text-ink-light hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}

export default Products;