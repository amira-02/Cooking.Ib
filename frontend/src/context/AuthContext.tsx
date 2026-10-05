import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import type { User } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import axios from "axios";
import { auth, db } from "../firebase";
import { API_URL } from "../config/api";
import { toApiError } from "../services/authApi";

const OTP_ENDPOINT = `${API_URL}/api/otp`;

interface UserProfile {
  firstName: string;
  lastName: string;
  phone?: string;
}

interface AuthContextType {
  currentUser: User | null;
  role: string | null;
  profile: UserProfile | null;
  emailVerified: boolean;
  loading: boolean;
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone: string
  ) => Promise<User>;
  // Renvoie l'utilisateur et son rôle pour rediriger au bon endroit (admin ou boutique)
  login: (email: string, password: string) => Promise<{ user: User; role: string }>;
  loginWithGoogle: () => Promise<{ user: User; role: string }>;
  logout: () => Promise<void>;
  sendVerificationCode: () => Promise<void>;
  verifyEmailCode: (code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  async function register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone: string
  ) {
    const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
    // Crée le profil utilisateur dans Firestore, avec le rôle par défaut "client"
    await setDoc(doc(db, "users", result.user.uid), {
      firstName,
      lastName,
      phone,
      email: email.trim(),
      role: "client",
      createdAt: new Date(),
    });
    // Le profil vient d'être créé : on le met à jour sans attendre un nouveau chargement
    setRole("client");
    setProfile({ firstName, lastName, phone });
    return result.user;
  }

  async function roleOf(uid: string) {
    const userDoc = await getDoc(doc(db, "users", uid));
    return (userDoc.exists() && userDoc.data().role) || "client";
  }

  async function login(email: string, password: string) {
    const result = await signInWithEmailAndPassword(auth, email.trim(), password);
    return { user: result.user, role: await roleOf(result.user.uid) };
  }

  // Connexion Google : crée le profil client à la première connexion
  async function loginWithGoogle() {
    const result = await signInWithPopup(auth, new GoogleAuthProvider());
    const ref = doc(db, "users", result.user.uid);
    const existing = await getDoc(ref);
    if (!existing.exists()) {
      const [firstName = "", ...rest] = (result.user.displayName ?? "").split(" ");
      const lastName = rest.join(" ");
      await setDoc(ref, {
        firstName,
        lastName,
        phone: result.user.phoneNumber ?? "",
        email: result.user.email ?? "",
        role: "client",
        createdAt: new Date(),
      });
      setRole("client");
      setProfile({ firstName, lastName });
      return { user: result.user, role: "client" };
    }
    return { user: result.user, role: existing.data().role || "client" };
  }

  async function logout() {
    await signOut(auth);
  }

  async function getAuthHeader() {
    const token = await auth.currentUser?.getIdToken();
    return { Authorization: `Bearer ${token}` };
  }

  // Les erreurs remontent en ApiError (code : invalid_code, expired, cooldown…)
  async function sendVerificationCode() {
    try {
      await axios.post(`${OTP_ENDPOINT}/send`, {}, { headers: await getAuthHeader() });
    } catch (error) {
      throw toApiError(error);
    }
  }

  async function verifyEmailCode(code: string) {
    try {
      await axios.post(`${OTP_ENDPOINT}/verify`, { code }, { headers: await getAuthHeader() });
    } catch (error) {
      throw toApiError(error);
    }
    // Le backend a mis emailVerified à true : on recharge l'utilisateur et on
    // force un nouveau token pour qu'il contienne email_verified = true
    await auth.currentUser?.reload();
    await auth.currentUser?.getIdToken(true);
    setEmailVerified(auth.currentUser?.emailVerified ?? false);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setEmailVerified(user?.emailVerified ?? false);
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const data = userDoc.exists() ? userDoc.data() : null;
        setRole(data?.role ?? "client");
        setProfile(data ? { firstName: data.firstName ?? "", lastName: data.lastName ?? "", phone: data.phone ?? "" } : null);
      } else {
        setRole(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role,
        profile,
        emailVerified,
        loading,
        register,
        login,
        loginWithGoogle,
        logout,
        sendVerificationCode,
        verifyEmailCode,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth doit être utilisé dans un AuthProvider");
  return context;
}