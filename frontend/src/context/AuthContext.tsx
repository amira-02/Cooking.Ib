import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import type { User } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import axios from "axios";
import { auth, db } from "../firebase";
import { API_URL } from "../config/api";

const OTP_ENDPOINT = `${API_URL}/api/otp`;

interface AuthContextType {
  currentUser: User | null;
  role: string | null;
  emailVerified: boolean;
  loading: boolean;
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone: string
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<import("firebase/auth").UserCredential>;
  logout: () => Promise<void>;
  sendVerificationCode: () => Promise<void>;
  verifyEmailCode: (code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  async function register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone: string
  ) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    // Crée le profil utilisateur dans Firestore, avec le rôle par défaut "client"
    await setDoc(doc(db, "users", result.user.uid), {
      firstName,
      lastName,
      phone,
      email,
      role: "client",
      createdAt: new Date(),
    });
  }

  async function login(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    await signOut(auth);
  }

  async function getAuthHeader() {
    const token = await auth.currentUser?.getIdToken();
    return { Authorization: `Bearer ${token}` };
  }

  async function sendVerificationCode() {
    await axios.post(`${OTP_ENDPOINT}/send`, {}, { headers: await getAuthHeader() });
  }

  async function verifyEmailCode(code: string) {
    await axios.post(`${OTP_ENDPOINT}/verify`, { code }, { headers: await getAuthHeader() });
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
        setRole(userDoc.exists() ? userDoc.data().role : "client");
      } else {
        setRole(null);
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
        emailVerified,
        loading,
        register,
        login,
        logout,
        sendVerificationCode,
        verifyEmailCode,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth doit être utilisé dans un AuthProvider");
  return context;
}