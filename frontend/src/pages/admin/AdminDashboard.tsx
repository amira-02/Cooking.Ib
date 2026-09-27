import { useEffect, useState } from "react";
import axios from "axios";
import { Tag, Cake, PackageX, Package } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config/api";

const PRODUCTS_ENDPOINT = `${API_URL}/api/products`;
const CATEGORIES_ENDPOINT = `${API_URL}/api/categories`;

interface Product {
  id: string;
  isAvailable: boolean;
}

function AdminDashboard() {
  const { currentUser } = useAuth();
  const [productsCount, setProductsCount] = useState(0);
  const [availableCount, setAvailableCount] = useState(0);
  const [categoriesCount, setCategoriesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          axios.get(PRODUCTS_ENDPOINT),
          axios.get(CATEGORIES_ENDPOINT),
        ]);
        const products: Product[] = productsRes.data;
        setProductsCount(products.length);
        setAvailableCount(products.filter((p) => p.isAvailable).length);
        setCategoriesCount(categoriesRes.data.length);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const stats = [
    { label: "Produits au catalogue", value: productsCount, icon: Cake },
    { label: "Produits disponibles", value: availableCount, icon: Package },
    { label: "Catégories", value: categoriesCount, icon: Tag },
    { label: "Produits indisponibles", value: productsCount - availableCount, icon: PackageX },
  ];

  return (
    <AdminLayout>
      <h1 className="font-serif text-3xl text-ink mb-1">Dashboard</h1>
      <p className="text-ink-light text-sm mb-8">
        Connectée en tant que {currentUser?.email}
      </p>

      {loading ? (
        <p className="text-ink-light text-sm">Chargement des statistiques...</p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white border border-beige rounded-2xl p-5">
              <Icon size={18} className="text-rose-dark mb-3" />
              <p className="text-2xl text-ink font-serif">{value}</p>
              <p className="text-ink-light text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white border border-beige rounded-2xl p-6">
        <h2 className="text-ink font-medium mb-2">Commandes</h2>
        <p className="text-ink-light text-sm">
          La gestion des commandes n'est pas encore branchée — on l'ajoutera dès
          que le système de panier et de checkout sera en place.
        </p>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;