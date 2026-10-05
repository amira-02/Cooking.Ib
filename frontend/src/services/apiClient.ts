import axios from "axios";
import type { Method } from "axios";
import { auth } from "../firebase";
import { API_URL } from "../config/api";
import { toApiError } from "./authApi";

// Appel API avec le jeton de l'utilisateur connecté ; les erreurs remontent en ApiError
// (code machine du backend : insufficient_stock, invalid_status, payment_failed…)
export async function apiRequest<T>(method: Method, path: string, data?: unknown, { authenticated = true } = {}): Promise<T> {
  try {
    const headers: Record<string, string> = {};
    if (authenticated) {
      const token = await auth.currentUser?.getIdToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }
    const res = await axios.request<T>({ method, url: `${API_URL}${path}`, data, headers });
    return res.data;
  } catch (error) {
    throw toApiError(error);
  }
}
