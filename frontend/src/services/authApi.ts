import axios from "axios";
import { API_URL } from "../config/api";

const PASSWORD_ENDPOINT = `${API_URL}/api/password`;

// Erreur API avec le code machine renvoyé par le backend (invalid_code, expired, cooldown…)
export class ApiError extends Error {
  code: string;
  status: number;
  constructor(message: string, code: string, status: number, cause?: unknown) {
    super(message, { cause });
    this.code = code;
    this.status = status;
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (axios.isAxiosError(error)) {
    if (!error.response) return new ApiError("Connexion au serveur impossible. Vérifiez votre connexion internet.", "network", 0, error);
    const data = error.response.data ?? {};
    return new ApiError(data.error ?? "Une erreur est survenue.", data.code ?? "server_error", error.response.status, error);
  }
  return new ApiError("Une erreur est survenue.", "unknown", 0, error);
}

async function post<T>(path: string, body: unknown): Promise<T> {
  try {
    const res = await axios.post<T>(`${PASSWORD_ENDPOINT}${path}`, body);
    return res.data;
  } catch (error) {
    throw toApiError(error);
  }
}

// --- Mot de passe oublié ---
export function requestPasswordReset(email: string) {
  return post<{ message: string }>("/forgot", { email });
}

export async function verifyResetCode(email: string, code: string) {
  const data = await post<{ resetToken: string }>("/verify", { email, code });
  return data.resetToken;
}

export function resetPassword(email: string, resetToken: string, password: string) {
  return post<{ message: string }>("/reset", { email, resetToken, password });
}
