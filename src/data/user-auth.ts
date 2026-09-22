import { useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  updatePassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

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

const STORAGE_CURRENT_USER_KEY = "pvcs_current_user";
const AUTH_EVENT_NAME = "pvcs_auth_change";

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
 * Traduz erros comuns do Firebase Auth para mensagens amigáveis em português
 */
export function mapFirebaseAuthError(err: unknown): string {
  if (!err) return "Ocorreu um erro inesperado.";
  const error = err as { code?: string; message?: string };
  const code = error.code || "";

  switch (code) {
    case "auth/email-already-in-use":
      return "Este e-mail já está cadastrado. Faça login ou recupere sua senha.";
    case "auth/invalid-email":
      return "O endereço de e-mail informado é inválido.";
    case "auth/operation-not-allowed":
      return "O método de autenticação por e-mail e senha não está ativado no Firebase.";
    case "auth/weak-password":
      return "A senha é muito fraca. Digite pelo menos 6 caracteres.";
    case "auth/user-disabled":
      return "Esta conta foi desativada pelo administrador.";
    case "auth/user-not-found":
      return "Nenhuma conta encontrada com este e-mail.";
    case "auth/wrong-password":
      return "Senha incorreta. Verifique e tente novamente.";
    case "auth/invalid-credential":
      return "E-mail ou senha incorretos. Verifique suas credenciais.";
    case "auth/too-many-requests":
      return "Muitas tentativas malsucedidas. Por segurança, tente novamente em alguns minutos.";
    case "auth/network-request-failed":
      return "Falha de conexão com o servidor. Verifique sua conexão com a internet.";
    case "auth/popup-closed-by-user":
      return "A janela de login com Google foi fechada antes de concluir.";
    case "auth/popup-blocked":
      return "A janela pop-up foi bloqueada pelo navegador. Permita pop-ups para fazer login.";
    case "auth/requires-recent-login":
      return "Por segurança, esta operação requer login recente. Saia e entre novamente.";
    default:
      if (error.message && !error.message.includes("Firebase:")) {
        return error.message;
      }
      return "Não foi possível completar a operação. Tente novamente.";
  }
}

/**
 * Helper to build a UserProfile directly from Firebase Auth User
 */
function buildUserProfileFromFirebase(
  fbUser: FirebaseUser,
  extra?: Partial<UserProfile>,
): UserProfile {
  const current = getCurrentUser();
  const email = fbUser.email || extra?.email || "";
  const fallbackName = email.split("@")[0] || "Cliente";

  return {
    id: fbUser.uid,
    fullName: extra?.fullName || fbUser.displayName || current?.fullName || fallbackName,
    email: email,
    phone: extra?.phone || fbUser.phoneNumber || current?.phone || "",
    createdAt:
      current?.id === fbUser.uid && current.createdAt
        ? current.createdAt
        : new Date().toISOString(),
    city: extra?.city || (current?.id === fbUser.uid ? current.city : "") || "",
    state: extra?.state || (current?.id === fbUser.uid ? current.state : "") || "",
    address: extra?.address || (current?.id === fbUser.uid ? current.address : "") || "",
    isFirebaseUser: true,
  };
}

/**
 * Cadastra novo usuário exclusivamente no Firebase Authentication
 */
export async function registerUser(data: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}): Promise<{ success: boolean; error?: string; user?: UserProfile }> {
  const normalizedEmail = data.email.trim().toLowerCase();
  const trimmedName = data.fullName.trim();
  const trimmedPhone = data.phone.trim();

  try {
    const cred = await createUserWithEmailAndPassword(auth, normalizedEmail, data.password);
    const fbUser = cred.user;

    try {
      await updateProfile(fbUser, { displayName: trimmedName });
    } catch {
      // non-blocking
    }

    const now = new Date().toISOString();
    const newProfile: UserProfile = {
      id: fbUser.uid,
      fullName: trimmedName,
      email: normalizedEmail,
      phone: trimmedPhone,
      createdAt: now,
      isFirebaseUser: true,
    };

    saveCurrentUser(newProfile);
    return { success: true, user: newProfile };
  } catch (err: unknown) {
    const errorMsg = mapFirebaseAuthError(err);
    console.error("Firebase Registration Error:", err);
    return { success: false, error: errorMsg };
  }
}

/**
 * Autentica usuário com e-mail e senha via Firebase Authentication
 */
export async function loginUser(
  email: string,
  password: string,
): Promise<{ success: boolean; error?: string; user?: UserProfile }> {
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const cred = await signInWithEmailAndPassword(auth, normalizedEmail, password);
    const fbUser = cred.user;

    const profile = buildUserProfileFromFirebase(fbUser, { email: normalizedEmail });
    saveCurrentUser(profile);
    return { success: true, user: profile };
  } catch (err: unknown) {
    const errorMsg = mapFirebaseAuthError(err);
    console.error("Firebase Login Error:", err);
    return { success: false, error: errorMsg };
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

    const profile = buildUserProfileFromFirebase(fbUser);
    saveCurrentUser(profile);
    return { success: true, user: profile };
  } catch (err: unknown) {
    const msg = mapFirebaseAuthError(err);
    console.error("Google sign in error:", err);
    return { success: false, error: msg };
  }
}

/**
 * Envia e-mail de redefinição de senha via Firebase Authentication
 */
export async function resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    await sendPasswordResetEmail(auth, email.trim().toLowerCase());
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: mapFirebaseAuthError(err) };
  }
}

export async function updateUserProfile(
  id: string,
  updates: Partial<UserProfile>,
): Promise<{ success: boolean; error?: string; user?: UserProfile }> {
  const current = getCurrentUser();
  if (!current || current.id !== id) {
    return { success: false, error: "Usuário não autenticado ou sessão expirada." };
  }

  if (updates.password && auth.currentUser) {
    try {
      await updatePassword(auth.currentUser, updates.password);
    } catch (err: unknown) {
      return { success: false, error: mapFirebaseAuthError(err) };
    }
  }

  if (updates.fullName && auth.currentUser) {
    try {
      await updateProfile(auth.currentUser, { displayName: updates.fullName });
    } catch {
      // non-blocking
    }
  }

  const updated: UserProfile = {
    ...current,
    ...updates,
    id: current.id,
    createdAt: current.createdAt,
  };
  delete updated.password;

  saveCurrentUser(updated);
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

    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setIsLoadingAuth(false);
      if (fbUser) {
        const loadedUser = buildUserProfileFromFirebase(fbUser);
        saveCurrentUser(loadedUser);
        setUser(loadedUser);
      } else {
        saveCurrentUser(null);
        setUser(null);
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
    resetPassword,
    logout: logoutUser,
  };
}
