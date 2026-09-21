import { useState, useEffect } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";
import { handleFirestoreError, OperationType } from "@/lib/firebase-errors";

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  createdAt: string;
  password?: string;
  city?: string;
  state?: string;
  address?: string;
  isFirebaseUser?: boolean;
}

const STORAGE_USERS_KEY = "pvcs_registered_users";
const STORAGE_CURRENT_USER_KEY = "pvcs_current_user";
const AUTH_EVENT_NAME = "pvcs_auth_change";

const DEFAULT_DEMO_USERS: UserProfile[] = [
  {
    id: "user-demo-1",
    fullName: "Maria Clara Silva",
    email: "maria.silva@exemplo.com",
    phone: "(11) 98765-4321",
    createdAt: "2025-01-15T10:00:00.000Z",
    password: "123456",
  },
];

export function getStoredUsers(): UserProfile[] {
  if (typeof window === "undefined") return DEFAULT_DEMO_USERS;
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(DEFAULT_DEMO_USERS));
      return DEFAULT_DEMO_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_DEMO_USERS;
  }
}

export function getCurrentUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveCurrentUser(user: UserProfile | null): void {
  if (typeof window === "undefined") return;
  try {
    if (user) {
      localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
    }
    window.dispatchEvent(new CustomEvent(AUTH_EVENT_NAME, { detail: user }));
  } catch (err) {
    console.error("Error saving current user:", err);
  }
}

/**
 * Synchronizes user profile to Firestore document /users/{userId}
 */
export async function syncUserProfileToFirestore(profile: UserProfile): Promise<void> {
  const path = `users/${profile.id}`;
  try {
    const userDocRef = doc(db, "users", profile.id);
    const existingSnap = await getDoc(userDocRef);

    const dataToSave: Record<string, string> = {
      id: profile.id,
      fullName: profile.fullName || "Cliente",
      email: profile.email,
      createdAt: profile.createdAt || new Date().toISOString(),
    };
    if (profile.phone) dataToSave.phone = profile.phone;
    if (profile.city) dataToSave.city = profile.city;
    if (profile.state) dataToSave.state = profile.state;
    if (profile.address) dataToSave.address = profile.address;
    dataToSave.updatedAt = new Date().toISOString();

    if (existingSnap.exists()) {
      await updateDoc(userDocRef, dataToSave);
    } else {
      await setDoc(userDocRef, dataToSave);
    }
  } catch (error) {
    // If permission or network issue, report via error handler
    try {
      handleFirestoreError(error, OperationType.WRITE, path);
    } catch {
      // Local fallback remains available for resilient UI
    }
  }
}

/**
 * Sign in using Google Auth via Firebase popup
 */
export async function loginWithGoogle(): Promise<{
  success: boolean;
  error?: string;
  user?: UserProfile;
}> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const fbUser: FirebaseUser = result.user;

    const email = fbUser.email || "";
    const fullName = fbUser.displayName || email.split("@")[0] || "Cliente";
    const phone = fbUser.phoneNumber || "";

    // Check if profile exists in Firestore
    let profile: UserProfile;
    const userDocRef = doc(db, "users", fbUser.uid);
    try {
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        const data = snap.data();
        profile = {
          id: fbUser.uid,
          fullName: data.fullName || fullName,
          email: data.email || email,
          phone: data.phone || phone,
          createdAt: data.createdAt || new Date().toISOString(),
          city: data.city || "",
          state: data.state || "",
          address: data.address || "",
          isFirebaseUser: true,
        };
      } else {
        profile = {
          id: fbUser.uid,
          fullName,
          email,
          phone,
          createdAt: new Date().toISOString(),
          isFirebaseUser: true,
        };
        await syncUserProfileToFirestore(profile);
      }
    } catch {
      profile = {
        id: fbUser.uid,
        fullName,
        email,
        phone,
        createdAt: new Date().toISOString(),
        isFirebaseUser: true,
      };
    }

    saveCurrentUser(profile);
    return { success: true, user: profile };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Google sign in error:", err);
    return { success: false, error: msg };
  }
}

export function registerUser(data: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}): { success: boolean; error?: string; user?: UserProfile } {
  const users = getStoredUsers();
  const normalizedEmail = data.email.trim().toLowerCase();

  const existing = users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    return { success: false, error: "Este e-mail já está cadastrado. Tente entrar." };
  }

  const newUser: UserProfile = {
    id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    fullName: data.fullName.trim(),
    email: normalizedEmail,
    phone: data.phone.trim(),
    createdAt: new Date().toISOString(),
    password: data.password,
  };

  const updatedUsers = [...users, newUser];
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(updatedUsers));
  } catch (err) {
    console.error("Error saving users:", err);
  }

  saveCurrentUser(newUser);
  // Async firestore sync
  syncUserProfileToFirestore(newUser).catch(() => {});

  return { success: true, user: newUser };
}

export function loginUser(
  email: string,
  password: string,
): { success: boolean; error?: string; user?: UserProfile } {
  const users = getStoredUsers();
  const normalizedEmail = email.trim().toLowerCase();

  const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (!user) {
    return { success: false, error: "Nenhuma conta encontrada com este e-mail." };
  }

  if (user.password && user.password !== password) {
    return { success: false, error: "Senha incorreta. Verifique e tente novamente." };
  }

  saveCurrentUser(user);
  syncUserProfileToFirestore(user).catch(() => {});
  return { success: true, user };
}

export async function updateUserProfile(
  id: string,
  updates: Partial<UserProfile>,
): Promise<{ success: boolean; error?: string; user?: UserProfile }> {
  const current = getCurrentUser();
  if (!current || current.id !== id) {
    return { success: false, error: "Usuário não encontrado ou sessão expirada." };
  }

  const updated: UserProfile = {
    ...current,
    ...updates,
    id: current.id,
    createdAt: current.createdAt,
  };

  const users = getStoredUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index !== -1) {
    users[index] = updated;
    try {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
    } catch (err) {
      console.error("Error updating users:", err);
    }
  }

  saveCurrentUser(updated);
  await syncUserProfileToFirestore(updated);
  return { success: true, user: updated };
}

export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch {
    // Non-blocking
  }
  saveCurrentUser(null);
}

/**
 * React hook to listen for active user changes and Firebase Auth
 */
export function useCurrentUser() {
  const [user, setUser] = useState<UserProfile | null>(() => getCurrentUser());
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    setUser(getCurrentUser());

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setIsLoadingAuth(false);
      if (fbUser) {
        // Load latest profile from Firestore if available
        try {
          const snap = await getDoc(doc(db, "users", fbUser.uid));
          if (snap.exists()) {
            const data = snap.data();
            const loadedUser: UserProfile = {
              id: fbUser.uid,
              fullName: data.fullName || fbUser.displayName || "Cliente",
              email: data.email || fbUser.email || "",
              phone: data.phone || fbUser.phoneNumber || "",
              createdAt: data.createdAt || new Date().toISOString(),
              city: data.city || "",
              state: data.state || "",
              address: data.address || "",
              isFirebaseUser: true,
            };
            saveCurrentUser(loadedUser);
            setUser(loadedUser);
            return;
          }
        } catch {
          // If offline or permission check, fall back to current local state
        }
      }
    });

    const handleAuthChange = () => {
      setUser(getCurrentUser());
    };

    window.addEventListener(AUTH_EVENT_NAME, handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      unsubscribe();
      window.removeEventListener(AUTH_EVENT_NAME, handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  return {
    user,
    isLoggedIn: !!user,
    isLoadingAuth,
    loginWithGoogle,
    logout: logoutUser,
  };
}
