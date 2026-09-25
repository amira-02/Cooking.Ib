import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

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

  if (loading) {
    return <p>Chargement des produits...</p>;
  }

  if (products.length === 0) {
    return <p>Aucun produit trouvé.</p>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Nos gâteaux</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "1.5rem",
          marginTop: "1.5rem",
        }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            style={{
              border: "1px solid #e5d9d0",
              borderRadius: "12px",
              padding: "1rem",
            }}
          >
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p>
              <strong>{product.price} DT</strong> — {product.servesCount} personnes
            </p>
            <p>{product.isAvailable ? "✅ Disponible" : "❌ Indisponible"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Products;
