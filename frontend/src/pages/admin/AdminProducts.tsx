import { useEffect, useState } from "react";
import axios from "axios";
import { Pencil, Trash2, X, ImagePlus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import AdminLayout from "../../components/AdminLayout";
import { API_URL } from "../../config/api";

const PRODUCTS_ENDPOINT = `${API_URL}/api/products`;
const CATEGORIES_ENDPOINT = `${API_URL}/api/categories`;
const UPLOAD_ENDPOINT = `${API_URL}/api/upload`;

const MAX_IMAGES = 6;
const MAX_SIZE_MB = 5;

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
  images?: string[];
}

interface NewImage {
  file: File;
  preview: string;
}

function AdminProducts() {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [categoryId, setCategoryId] = useState("");
  const [servesCount, setServesCount] = useState(1);
  const [isAvailable, setIsAvailable] = useState(true);

  // images déjà enregistrées (URLs) + nouvelles images choisies (pas encore envoyées)
  const [images, setImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<NewImage[]>([]);

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
    newImages.forEach((img) => URL.revokeObjectURL(img.preview));
    setEditingId(null);
    setName("");
    setDescription("");
    setPrice(0);
    setCategoryId("");
    setServesCount(1);
    setIsAvailable(true);
    setImages([]);
    setNewImages([]);
  }

  function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || []);
    e.target.value = "";
    setErrorMsg("");

    if (images.length + newImages.length + selected.length > MAX_IMAGES) {
      setErrorMsg(`Maximum ${MAX_IMAGES} images par produit.`);
      return;
    }
    const tooBig = selected.find((f) => f.size > MAX_SIZE_MB * 1024 * 1024);
    if (tooBig) {
      setErrorMsg(`"${tooBig.name}" dépasse ${MAX_SIZE_MB} Mo.`);
      return;
    }

    setNewImages((prev) => [
      ...prev,
      ...selected.map((file) => ({ file, preview: URL.createObjectURL(file) })),
    ]);
  }

  function removeExistingImage(url: string) {
    setImages((prev) => prev.filter((u) => u !== url));
  }

  function removeNewImage(preview: string) {
    URL.revokeObjectURL(preview);
    setNewImages((prev) => prev.filter((img) => img.preview !== preview));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSaving(true);
    try {
      const headers = await getAuthHeader();

      // 1. Envoyer les nouvelles images au backend (qui les envoie à Cloudinary)
      let uploadedUrls: string[] = [];
      if (newImages.length > 0) {
        const formData = new FormData();
        newImages.forEach((img) => formData.append("images", img.file));
        const uploadRes = await axios.post(UPLOAD_ENDPOINT, formData, { headers });
        uploadedUrls = uploadRes.data.urls;
      }

      // 2. Enregistrer le produit avec toutes ses images
      const payload = {
        name,
        description,
        price,
        categoryId,
        servesCount,
        isAvailable,
        images: [...images, ...uploadedUrls],
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
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(product: Product) {
    newImages.forEach((img) => URL.revokeObjectURL(img.preview));
    setNewImages([]);
    setEditingId(product.id);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price);
    setCategoryId(product.categoryId);
    setServesCount(product.servesCount);
    setIsAvailable(product.isAvailable);
    setImages(product.images || []);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  const totalImages = images.length + newImages.length;

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

          {/* IMAGES */}
          <div className="sm:col-span-2">
            <p className="text-sm text-ink mb-2">
              Photos{" "}
              <span className="text-ink-light">
                ({totalImages}/{MAX_IMAGES} — la première est l'image principale)
              </span>
            </p>

            <div className="flex flex-wrap gap-3">
              {images.map((url, index) => (
                <div key={url} className="relative w-24 h-24 rounded-lg overflow-hidden border border-beige">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  {index === 0 && newImages.length >= 0 && (
                    <span className="absolute bottom-0 left-0 right-0 bg-ink/70 text-cream text-[10px] text-center py-0.5">
                      Principale
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeExistingImage(url)}
                    className="absolute top-1 right-1 bg-white/90 rounded-full p-1 text-ink hover:text-rose-dark"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {newImages.map((img) => (
                <div key={img.preview} className="relative w-24 h-24 rounded-lg overflow-hidden border border-rose">
                  <img src={img.preview} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeNewImage(img.preview)}
                    className="absolute top-1 right-1 bg-white/90 rounded-full p-1 text-ink hover:text-rose-dark"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {totalImages < MAX_IMAGES && (
                <label className="w-24 h-24 rounded-lg border border-dashed border-ink-light flex flex-col items-center justify-center gap-1 text-ink-light text-xs cursor-pointer hover:border-rose hover:text-rose-dark transition-colors">
                  <ImagePlus size={20} />
                  Ajouter
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFilesSelected}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-ink-light mt-2">
              Les nouvelles photos (bordure rose) sont envoyées quand tu enregistres le produit.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="sm:col-span-2 mt-1 rounded-lg bg-ink text-cream py-2.5 text-sm hover:bg-rose-dark transition-colors disabled:opacity-60"
          >
            {saving
              ? "Enregistrement..."
              : editingId
              ? "Enregistrer les modifications"
              : "Ajouter le produit"}
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
                <th className="px-5 py-3 font-normal">Produit</th>
                <th className="px-5 py-3 font-normal">Catégorie</th>
                <th className="px-5 py-3 font-normal">Prix</th>
                <th className="px-5 py-3 font-normal">Statut</th>
                <th className="px-5 py-3 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-beige last:border-0">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-beige overflow-hidden shrink-0">
                        {product.images && product.images.length > 0 && (
                          <img
                            src={product.images[0]}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <span className="text-ink">{product.name}</span>
                    </div>
                  </td>
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