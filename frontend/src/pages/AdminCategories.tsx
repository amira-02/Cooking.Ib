import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:5000/api/categories";

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

  // Récupère le token Firebase de l'utilisateur connecté, à envoyer au backend
  async function getAuthHeader() {
    const token = await currentUser?.getIdToken();
    return { Authorization: `Bearer ${token}` };
  }

  async function loadCategories() {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
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
        await axios.put(`${API_URL}/${editingId}`, payload, { headers });
      } else {
        await axios.post(API_URL, payload, { headers });
      }
      resetForm();
      loadCategories();
    } catch (error: any) {
      setErrorMsg(
        error.response?.data?.error || "Erreur lors de l'enregistrement"
      );
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
      await axios.delete(`${API_URL}/${id}`, { headers });
      loadCategories();
    } catch (error: any) {
      setErrorMsg(error.response?.data?.error || "Erreur lors de la suppression");
    }
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "700px" }}>
      <h1>Gestion des catégories</h1>
      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}
      >
        <h3>{editingId ? "Modifier la catégorie" : "Nouvelle catégorie"}</h3>
        <input placeholder="Nom" value={name} onChange={(e) => setName(e.target.value)} required />
        <input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="number"
          placeholder="Ordre d'affichage"
          value={order}
          onChange={(e) => setOrder(Number(e.target.value))}
        />
        <label>
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          {" "}Active
        </label>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button type="submit">{editingId ? "Enregistrer" : "Ajouter"}</button>
          {editingId && (
            <button type="button" onClick={resetForm}>
              Annuler
            </button>
          )}
        </div>
      </form>

      <h3>Liste des catégories</h3>
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Nom</th>
              <th>Ordre</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} style={{ borderTop: "1px solid #eee" }}>
                <td>{cat.name}</td>
                <td style={{ textAlign: "center" }}>{cat.order}</td>
                <td style={{ textAlign: "center" }}>{cat.isActive ? "✅" : "❌"}</td>
                <td style={{ display: "flex", gap: "0.5rem" }}>
                  <button onClick={() => handleEdit(cat)}>Modifier</button>
                  <button onClick={() => handleDelete(cat.id)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminCategories;