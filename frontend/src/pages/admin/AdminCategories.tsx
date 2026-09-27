import { useEffect, useState } from "react";
import axios from "axios";
import { Pencil, Trash2, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import AdminLayout from "../../components/AdminLayout";
import { API_URL } from "../../config/api";

const CATEGORIES_ENDPOINT = `${API_URL}/api/categories`;

interface Category {
  id: string;
  name: string;
  description: string;
  order: number;
  isActive: boolean;
}

function AdminCategories() {
  const { currentUser } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);

  async function getAuthHeader() {
    const token = await currentUser?.getIdToken();
    return { Authorization: `Bearer ${token}` };
  }

  async function loadCategories() {
    setLoading(true);
    try {
      const res = await axios.get(CATEGORIES_ENDPOINT);
      setCategories(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function resetForm() {
    setEditingId(null);
    setName("");
    setDescription("");
    setOrder(1);
    setIsActive(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    try {
      const headers = await getAuthHeader();
      const payload = { name, description, order, isActive };

      if (editingId) {
        await axios.put(`${CATEGORIES_ENDPOINT}/${editingId}`, payload, { headers });
      } else {
        await axios.post(CATEGORIES_ENDPOINT, payload, { headers });
      }
      resetForm();
      loadCategories();
    } catch (error: any) {
      setErrorMsg(error.response?.data?.error || "Erreur lors de l'enregistrement");
    }
  }

  function handleEdit(cat: Category) {
    setEditingId(cat.id);
    setName(cat.name);
    setDescription(cat.description);
    setOrder(cat.order);
    setIsActive(cat.isActive);
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette catégorie ?")) return;
    try {
      const headers = await getAuthHeader();
      await axios.delete(`${CATEGORIES_ENDPOINT}/${id}`, { headers });
      loadCategories();
    } catch (error: any) {
      setErrorMsg(error.response?.data?.error || "Erreur lors de la suppression");
    }
  }

  return (
    <AdminLayout>
      <h1 className="font-serif text-3xl text-ink mb-1">Catégories</h1>
      <p className="text-ink-light text-sm mb-8">
        Organise tes gâteaux par famille — anniversaire, mariage, etc.
      </p>

      {errorMsg && (
        <p className="text-sm text-rose-dark bg-rose/10 border border-rose/30 rounded-lg px-4 py-2 mb-6">
          {errorMsg}
        </p>
      )}

      <div className="bg-white border border-beige rounded-2xl p-6 mb-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-ink font-medium">
            {editingId ? "Modifier la catégorie" : "Nouvelle catégorie"}
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
            placeholder="Nom de la catégorie"
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
            placeholder="Ordre d'affichage"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
          />
          <label className="flex items-center gap-2 text-sm text-ink-light">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="accent-rose"
            />
            Catégorie active
          </label>

          <button
            type="submit"
            className="sm:col-span-2 mt-1 rounded-lg bg-ink text-cream py-2.5 text-sm hover:bg-rose-dark transition-colors"
          >
            {editingId ? "Enregistrer les modifications" : "Ajouter la catégorie"}
          </button>
        </form>
      </div>

      <h2 className="text-ink font-medium mb-4">
        {categories.length} catégorie{categories.length > 1 ? "s" : ""}
      </h2>

      {loading ? (
        <p className="text-ink-light text-sm">Chargement...</p>
      ) : (
        <div className="bg-white border border-beige rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-light border-b border-beige">
                <th className="px-5 py-3 font-normal">Nom</th>
                <th className="px-5 py-3 font-normal">Ordre</th>
                <th className="px-5 py-3 font-normal">Statut</th>
                <th className="px-5 py-3 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b border-beige last:border-0">
                  <td className="px-5 py-3 text-ink">{cat.name}</td>
                  <td className="px-5 py-3 text-ink-light">{cat.order}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full ${
                        cat.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-beige text-ink-light"
                      }`}
                    >
                      {cat.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="p-2 rounded-lg hover:bg-beige/60 text-ink-light hover:text-ink transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
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

export default AdminCategories;