import { useState } from "react";
import axios from "axios";
import { ImageUp, RotateCcw, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config/api";
import { HOME_IMAGE_SLOTS } from "../../data/homeContent";
import type { HomeImageSlot } from "../../data/homeContent";
import { HOMEPAGE_ENDPOINT, useHomepageImages } from "../../hooks/useHomepageImages";

function errorMessage(error: unknown, fallback: string) {
  return axios.isAxiosError(error) && error.response?.data?.error ? error.response.data.error : fallback;
}

const UPLOAD_ENDPOINT = `${API_URL}/api/upload?dossier=homepage`;
const MAX_SIZE_MB = 5;

// Emplacements regroupés par section de la page d'accueil, dans l'ordre d'affichage
const SECTIONS = Object.entries(HOME_IMAGE_SLOTS).reduce<Record<string, HomeImageSlot[]>>(
  (groups, [slot, info]) => {
    (groups[info.section] ??= []).push(slot as HomeImageSlot);
    return groups;
  },
  {}
);

function AdminHomepage() {
  const { currentUser } = useAuth();
  const { customImages, loading, reload } = useHomepageImages();
  const [busySlot, setBusySlot] = useState<HomeImageSlot | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  async function getAuthHeader() {
    const token = await currentUser?.getIdToken();
    return { Authorization: `Bearer ${token}` };
  }

  async function handleFileSelected(slot: HomeImageSlot, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setErrorMsg("");
    setSuccessMsg("");

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Ce fichier n'est pas une image.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setErrorMsg(`"${file.name}" dépasse ${MAX_SIZE_MB} Mo.`);
      return;
    }

    setBusySlot(slot);
    try {
      const headers = await getAuthHeader();
      // 1. Envoi du fichier sur Cloudinary (via le backend)
      const formData = new FormData();
      formData.append("images", file);
      const uploadRes = await axios.post(UPLOAD_ENDPOINT, formData, { headers });
      // 2. Enregistrement de la photo pour cet emplacement
      await axios.put(`${HOMEPAGE_ENDPOINT}/images/${slot}`, { url: uploadRes.data.urls[0] }, { headers });
      await reload();
      setSuccessMsg(`Photo « ${HOME_IMAGE_SLOTS[slot].label} » mise à jour.`);
    } catch (error) {
      setErrorMsg(errorMessage(error, "Erreur lors de l'envoi de la photo"));
    } finally {
      setBusySlot(null);
    }
  }

  async function handleReset(slot: HomeImageSlot) {
    if (!confirm("Retirer votre photo et réafficher la photo d'exemple ?")) return;
    setErrorMsg("");
    setSuccessMsg("");
    setBusySlot(slot);
    try {
      const headers = await getAuthHeader();
      await axios.delete(`${HOMEPAGE_ENDPOINT}/images/${slot}`, { headers });
      await reload();
    } catch (error) {
      setErrorMsg(errorMessage(error, "Erreur lors de la réinitialisation"));
    } finally {
      setBusySlot(null);
    }
  }

  const customCount = Object.keys(customImages).length;
  const totalCount = Object.keys(HOME_IMAGE_SLOTS).length;

  return (
    <div>
      <p className="text-ink-light text-sm mb-2">
        Choisis les photos affichées sur la page d'accueil. Les changements sont visibles immédiatement sur le site.
      </p>
      <p className="text-ink-light text-sm mb-8">
        {customCount}/{totalCount} photos personnalisées — les autres affichent une photo d'exemple.
      </p>

      {errorMsg && (
        <p className="text-sm text-rose-dark bg-rose/10 border border-rose/30 rounded-lg px-4 py-2 mb-6">
          {errorMsg}
        </p>
      )}
      {successMsg && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2 mb-6">
          {successMsg}
        </p>
      )}

      {loading ? (
        <p className="text-ink-light text-sm">Chargement...</p>
      ) : (
        <div className="space-y-10">
          {Object.entries(SECTIONS).map(([section, slots]) => (
            <section key={section}>
              <h2 className="text-ink font-medium mb-4">{section}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {slots.map((slot) => {
                  const info = HOME_IMAGE_SLOTS[slot];
                  const custom = customImages[slot];
                  const busy = busySlot === slot;
                  return (
                    <div key={slot} className="bg-white border border-beige rounded-2xl overflow-hidden flex flex-col">
                      <div className="relative aspect-[4/3] bg-beige">
                        <img
                          src={custom ?? info.example}
                          alt=""
                          className={`w-full h-full object-cover ${custom ? "" : "opacity-60"}`}
                        />
                        <span
                          className={`absolute left-2 top-2 rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                            custom ? "bg-green-100 text-green-700" : "bg-white/90 text-ink-light"
                          }`}
                        >
                          {custom ? "Votre photo" : "Photo d'exemple"}
                        </span>
                        {busy && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                            <Loader2 size={22} className="animate-spin text-ink" />
                          </div>
                        )}
                      </div>

                      <div className="p-3 flex flex-col gap-2 flex-1">
                        <div>
                          <p className="text-sm text-ink">{info.label}</p>
                          <p className="text-xs text-ink-light">Format conseillé : {info.format}</p>
                        </div>
                        <div className="mt-auto flex gap-2">
                          <label
                            className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-ink text-cream text-xs py-2 transition-colors ${
                              busySlot ? "opacity-50 pointer-events-none" : "cursor-pointer hover:bg-rose-dark"
                            }`}
                          >
                            <ImageUp size={14} /> Changer
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={busySlot !== null}
                              onChange={(e) => handleFileSelected(slot, e)}
                            />
                          </label>
                          {custom && (
                            <button
                              type="button"
                              onClick={() => handleReset(slot)}
                              disabled={busySlot !== null}
                              title="Remettre la photo d'exemple"
                              aria-label="Remettre la photo d'exemple"
                              className="rounded-lg border border-beige px-2.5 text-ink-light hover:text-rose-dark hover:border-rose transition-colors disabled:opacity-50"
                            >
                              <RotateCcw size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminHomepage;
