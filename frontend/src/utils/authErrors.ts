import { FirebaseError } from "firebase/app";
import { toApiError } from "../services/authApi";

// Messages des codes OTP renvoyés par le backend
const OTP_MESSAGES: Record<string, string> = {
  invalid_code: "Le code est incorrect. Veuillez réessayer.",
  expired: "Ce code a expiré. Demandez un nouveau code.",
  no_code: "Ce code a expiré. Demandez un nouveau code.",
  too_many_attempts: "Trop de tentatives. Demandez un nouveau code.",
  cooldown: "Un code vient d'être envoyé. Patientez quelques secondes avant d'en redemander un.",
  invalid_format: "Le code doit contenir 6 chiffres.",
  invalid_token: "Ce lien de réinitialisation a expiré. Recommencez la procédure.",
  network: "Connexion au serveur impossible. Vérifiez votre connexion internet.",
};

export function otpErrorMessage(error: unknown) {
  const apiError = toApiError(error);
  return OTP_MESSAGES[apiError.code] ?? apiError.message;
}

// Traduction des erreurs Firebase Authentication
const FIREBASE_MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "Email ou mot de passe incorrect.",
  "auth/wrong-password": "Email ou mot de passe incorrect.",
  "auth/user-not-found": "Email ou mot de passe incorrect.",
  "auth/invalid-email": "Veuillez saisir une adresse email valide.",
  "auth/email-already-in-use": "Un compte existe déjà avec cette adresse email.",
  "auth/weak-password": "Ce mot de passe est trop faible.",
  "auth/too-many-requests": "Trop de tentatives. Réessayez dans quelques minutes.",
  "auth/network-request-failed": "Connexion impossible. Vérifiez votre connexion internet.",
  "auth/user-disabled": "Ce compte a été désactivé.",
  "auth/popup-blocked": "La fenêtre de connexion Google a été bloquée par votre navigateur.",
  "auth/operation-not-allowed": "Ce mode de connexion n'est pas encore activé.",
  "auth/account-exists-with-different-credential": "Un compte existe déjà avec cette adresse. Connectez-vous avec votre mot de passe.",
};

export function authErrorMessage(error: unknown) {
  if (error instanceof FirebaseError) return FIREBASE_MESSAGES[error.code] ?? "Une erreur est survenue. Veuillez réessayer.";
  return "Une erreur est survenue. Veuillez réessayer.";
}

// L'utilisateur a fermé la fenêtre Google : ce n'est pas une erreur à afficher
export function isCancelledPopup(error: unknown) {
  return error instanceof FirebaseError && (error.code === "auth/popup-closed-by-user" || error.code === "auth/cancelled-popup-request");
}
