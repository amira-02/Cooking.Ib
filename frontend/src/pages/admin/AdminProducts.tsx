import { useEffect, useState } from "react";
import axios from "axios";
import { Pencil, Trash2, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import AdminLayout from "../../components/AdminLayout";
import { API_URL } from "../../config/api";

const PRODUCTS_ENDPOINT = `${API_URL}/api/products`;
const CATEGORIES_ENDPOINT = `${API_URL}/api/categories`;

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  isAvailable: boolean;
  servesCount: number;
}

function AdminProducts() {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [categoryId, setCategoryId] = useState("");
  const [servesCount, setServesCount] = useState(1);
  const [isAvailable, setIsAvailable] = useState(true);

  async function getAuthHeader() {
    const token = await currentUser?.getIdToken();
    return { Authorization: `Bearer ${token}` };
  }

  async function loadData() {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        axios.get(PRODUCTS_ENDPOINT),
        axios.get(CATEGORIES_ENDPOINT),
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function resetForm() {
    setEditingId(null);
    setName("");
    setDescription("");
    setPrice(0);
    setCategoryId("");
    setServesCount(1);
    setIsAvailable(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    try {
      const headers = await getAuthHeader();
      const payload = {
        name,
        description,
        price,
        categoryId,
        servesCount,
        isAvailable,
        images: [],
        options: { flavors: [], sizes: [] },
      };

      if (editingId) {
        await axios.put(`${PRODUCTS_ENDPOINT}/${editingId}`, payload, { headers });
      } else {
        await axios.post(PRODUCTS_ENDPOINT, payload, { headers });
      }
      resetForm();
      loadData();
    } catch (error: any) {
      setErrorMsg(error.response?.data?.error || "Erreur lors de l'enregistrement");
    }
  }

  function handleEdit(product: Product) {
    setEditingId(product.id);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price);
    setCategoryId(product.categoryId);
    setServesCount(product.servesCount);
    setIsAvailable(product.isAvailable);
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce produit ?")) return;
    try {
      const headers = await getAuthHeader();
      await axios.delete(`${PRODUCTS_ENDPOINT}/${id}`, { headers });
      loadData();
    } catch (error: any) {
      setErrorMsg(error.response?.data?.error || "Erreur lors de la suppression");
    }
  }

  function categoryName(id: string) {
    return categories.find((c) => c.id === id)?.name || "—";
  }

  return (
    <AdminLayout>
      <h1 className="font-serif text-3xl text-ink mb-1">Produits</h1>
      <p className="text-ink-light text-sm mb-8">Gère ton catalogue de gâteaux.</p>

      {errorMsg && (
        <p className="text-sm text-rose-dark bg-rose/10 border border-rose/30 rounded-lg px-4 py-2 mb-6">
          {errorMsg}
        </p>
      )}

      <div className="bg-white border border-beige rounded-2xl p-6 mb-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-ink font-medium">
            {editingId ? "Modifier le produit" : "Nouveau produit"}
          </h2>
          {editingId && (
            <button
              onClick={resetForm}
              className="text-ink-light hover:text-ink flex items-center gap-1 text-sm"
            >
              <X size={14} /> Annuler
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            className="border border-beige rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose sm:col-span-2"
            placeholder="Nom du produit"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            className="border border-beige rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose sm:col-span-2"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            className="border border-beige rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose"
            type="number"
            placeholder="Prix (DT)"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            required
          />
          <select
            className="border border-beige rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose bg-white"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
            <option value="">-- Choisir une catégorie --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <input
            className="border border-beige rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose"
            type="number"
            placeholder="Nombre de personnes"
            value={servesCount}
            onChange={(e) => setServesCount(Number(e.target.value))}
          />
          <label className="flex items-center gap-2 text-sm text-ink-light">
            <input
              type="checkbox"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
              className="accent-rose"
            />
            Produit disponible
          </label>

          <button
            type="submit"
            className="sm:col-span-2 mt-1 rounded-lg bg-ink text-cream py-2.5 text-sm hover:bg-rose-dark transition-colors"
          >
            {editingId ? "Enregistrer les modifications" : "Ajouter le produit"}
          </button>
        </form>
      </div>

      <h2 className="text-ink font-medium mb-4">
        {products.length} produit{products.length > 1 ? "s" : ""}
      </h2>

      {loading ? (
        <p className="text-ink-light text-sm">Chargement...</p>
      ) : (
        <div className="bg-white border border-beige rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-light border-b border-beige">
                <th className="px-5 py-3 font-normal">Nom</th>
                <th className="px-5 py-3 font-normal">Catégorie</th>
                <th className="px-5 py-3 font-normal">Prix</th>
                <th className="px-5 py-3 font-normal">Statut</th>
                <th className="px-5 py-3 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-beige last:border-0">
                  <td className="px-5 py-3 text-ink">{product.name}</td>
                  <td className="px-5 py-3 text-ink-light">{categoryName(product.categoryId)}</td>
                  <td className="px-5 py-3 text-ink-light">{product.price} DT</td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full ${
                        product.isAvailable
                          ? "bg-green-100 text-green-700"
                          : "bg-beige text-ink-light"
                      }`}
                    >
                      {product.isAvailable ? "Disponible" : "Indisponible"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-2 rounded-lg hover:bg-beige/60 text-ink-light hover:text-ink transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 rounded-lg hover:bg-rose/10 text-ink-light hover:text-rose-dark transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminProducts;