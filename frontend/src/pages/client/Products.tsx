import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  isAvailable: boolean;
  servesCount: number;
}

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const snapshot = await getDocs(collection(db, "products"));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];
        setProducts(data);
      } catch (error) {
        console.error("Erreur lors du chargement des produits:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-8 py-16">
      <div className="mb-12 text-center max-w-xl mx-auto">
        <h1 className="text-4xl text-ink mb-3">Nos créations</h1>
        <p className="text-ink-light">
          Des gâteaux faits maison, pensés pour vos plus beaux moments.
        </p>
      </div>

      {loading ? (
        <p className="text-center text-ink-light">Chargement...</p>
      ) : products.length === 0 ? (
        <p className="text-center text-ink-light">
          Aucun produit disponible pour le moment.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white border border-beige rounded-2xl overflow-hidden flex flex-col"
            >
              <div className="aspect-square bg-beige flex items-center justify-center text-ink-light text-sm">
                Photo à venir
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-lg text-ink mb-1">{product.name}</h3>
                <p className="text-sm text-ink-light mb-4 flex-1">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-ink font-medium">{product.price} DT</span>
                  <span className="text-xs text-ink-light">
                    {product.servesCount} pers.
                  </span>
                </div>
                {!product.isAvailable && (
                  <p className="text-xs text-rose-dark mt-2">Indisponible actuellement</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Products;