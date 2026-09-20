import { useState, useEffect } from "react";

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
}

const STORAGE_USERS_KEY = "pvcs_registered_users";
const STORAGE_CURRENT_USER_KEY = "pvcs_current_user";
const AUTH_EVENT_NAME = "pvcs_auth_change";

// Initial demo user so testing login is immediately possible if desired
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
  return { success: true, user };
}

export function updateUserProfile(
  id: string,
  updates: Partial<UserProfile>,
): { success: boolean; error?: string; user?: UserProfile } {
  const users = getStoredUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) {
    return { success: false, error: "Usuário não encontrado." };
  }

  const current = users[index];
  const updated: UserProfile = {
    ...current,
    ...updates,
    id: current.id,
    createdAt: current.createdAt,
  };

  users[index] = updated;
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error("Error updating users:", err);
  }

  saveCurrentUser(updated);
  return { success: true, user: updated };
}

export function logoutUser(): void {
  saveCurrentUser(null);
}

/**
 * React hook to listen for active user changes across components
 */
export function useCurrentUser() {
  const [user, setUser] = useState<UserProfile | null>(() => getCurrentUser());

  useEffect(() => {
    // Initial sync
    setUser(getCurrentUser());

    const handleAuthChange = () => {
      setUser(getCurrentUser());
    };

    window.addEventListener(AUTH_EVENT_NAME, handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener(AUTH_EVENT_NAME, handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  return {
    user,
    isLoggedIn: !!user,
    logout: logoutUser,
  };
}
