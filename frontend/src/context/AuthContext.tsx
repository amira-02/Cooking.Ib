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
import { auth, db } from "../firebase";

interface AuthContextType {
  currentUser: User | null;
  role: string | null;
  loading: boolean;
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone: string
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
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
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    await signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
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
    <AuthContext.Provider value={{ currentUser, role, loading, register, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth doit être utilisé dans un AuthProvider");
  return context;
}