import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import QuantitySelector from "../../components/cart/QuantitySelector";
import { useShop } from "../../context/ShopContext";
import { API_URL } from "../../config/api";
import { formatPrice } from "../../utils/formatPrice";
import AddToCartButton from "../../components/product/AddToCartButton";
import { useAuth } from "../../context/AuthContext";
import { track } from "../../utils/track";
import type { Product } from "../../types/catalog";

interface Category {
  id: string;
  name: string;
}

function ProductDetail() {
  const { role } = useAuth();
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { maxQuantityFor } = useShop();

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      setNotFound(false);
      setActiveImage(0);
      setQuantity(1);
      try {
        const [prodRes, catRes] = await Promise.all([
          axios.get(`${API_URL}/api/products/${id}`),
          axios.get(`${API_URL}/api/categories`),
        ]);
        setProduct(prodRes.data);
        if (role !== "admin") track("product_view", prodRes.data.id);
        const category = catRes.data.find((c: Category) => c.id === prodRes.data.categoryId);
        setCategoryName(category?.name ?? "");
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) setNotFound(true);
        else console.error("Erreur de chargement du produit:", error);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
    // On ne recharge pas le produit quand le rôle change : il sert seulement à ignorer les vues admin
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return <p className="max-w-6xl mx-auto px-8 py-12 text-ink-light text-sm">Chargement...</p>;
  }

  if (notFound || !product) {
    return (
      <div className="max-w-6xl mx-auto px-8 py-12">
        <p className="text-ink-light text-sm">Ce produit n'existe pas ou n'est plus disponible.</p>
        <BackLink />
      </div>
    );
  }

  const maxQuantity = maxQuantityFor({ stock: product.stock });
  const images = product.images ?? [];
  // Chaque ligne vide dans la description devient un nouveau paragraphe
  const paragraphs = product.description.split(/\n\s*\n|\n/).filter((p) => p.trim());

  return (
    <div className="max-w-6xl mx-auto px-8 py-12">
      <BackLink />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14 mt-6">
        {/* GALERIE */}
        <div>
          <div className="aspect-square bg-beige overflow-hidden">
            {images.length > 0 ? (
              <img
                src={images[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-ink-light text-sm">
                Photo à venir
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-3 mt-3 overflow-x-auto">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  aria-label={`Voir l'image ${i + 1}`}
                  className={`w-20 h-20 shrink-0 overflow-hidden border transition-colors ${
                    i === activeImage ? "border-ink" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* INFORMATIONS */}
        <div>
          {categoryName && (
            <p className="text-xs uppercase tracking-[0.15em] text-rose-dark font-medium">
              {categoryName}
            </p>
          )}
          <h1 className="font-serif text-4xl text-ink mt-2">{product.name}</h1>
          <p className="text-lg text-ink mt-4">{formatPrice(product.price)}</p>

          <div className="space-y-3 mt-6 text-sm leading-relaxed text-ink-light">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {product.ingredients && product.ingredients.length > 0 && (
            <div className="border-t border-beige mt-6 pt-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-ink-light">Composition</p>
              <ul className="grid grid-cols-2 gap-x-6 gap-y-1.5 mt-3">
                {product.ingredients.map((ingredient, i) => (
                  <li key={i} className="flex items-baseline gap-2 text-sm text-ink">
                    <span className="text-rose-dark">•</span>
                    {ingredient}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {product.servesCount > 0 && (
            <div className="border-t border-beige mt-6 pt-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-ink-light">Portions</p>
              <p className="text-sm text-ink mt-2">Pour {product.servesCount} personnes</p>
            </div>
          )}

          {/* COMMANDE */}
          <div className="bg-white mt-8 p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-6">
              <QuantitySelector value={Math.min(quantity, Math.max(1, maxQuantity))} onChange={setQuantity} max={Math.max(1, maxQuantity)} />
              <span className="text-sm font-medium text-ink">{formatPrice(product.price * quantity)}</span>
            </div>
            {typeof product.stock === "number" && product.stock > 0 && product.stock <= 5 && (
              <p className="mt-3 text-xs text-amber-800">Plus que {product.stock} disponible{product.stock > 1 ? "s" : ""}</p>
            )}

            <AddToCartButton product={product} quantity={quantity} categoryName={categoryName} variant="solid" className="mt-5" />
            <p className="mt-3 text-center text-xs text-ink-light">Précommande sans paiement immédiat : nous confirmons avant le retrait.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      to="/produits"
      className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-ink-light hover:text-ink transition-colors"
    >
      <ArrowLeft size={14} /> Retour à la carte
    </Link>
  );
}

export default ProductDetail;
