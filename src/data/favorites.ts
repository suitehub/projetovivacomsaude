import { useState, useEffect, useCallback } from "react";
import { collection, doc, getDocs, setDoc, deleteDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { handleFirestoreError, OperationType } from "@/lib/firebase-errors";
import { useCurrentUser } from "./user-auth";

const STORAGE_KEY_PREFIX = "pvcs_user_favorites_";
const FAVORITES_EVENT_NAME = "pvcs_favorites_change";

function getStorageKey(userId?: string | null): string {
  if (!userId) return "";
  return `${STORAGE_KEY_PREFIX}${userId}`;
}

export function getUserFavorites(userId?: string | null): (number | string)[] {
  if (typeof window === "undefined" || !userId) return [];
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveUserFavorites(userId: string, favorites: (number | string)[]): void {
  if (typeof window === "undefined" || !userId) return;
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(favorites));
    window.dispatchEvent(
      new CustomEvent(FAVORITES_EVENT_NAME, {
        detail: { userId, favorites },
      }),
    );
  } catch (err) {
    console.error("Error saving favorites:", err);
  }
}

export function isProductFavorite(
  userId: string | null | undefined,
  productId: number | string,
): boolean {
  if (!userId) return false;
  const list = getUserFavorites(userId);
  return list.some((id) => String(id) === String(productId));
}

export async function syncFavoritesFromFirestore(userId: string): Promise<(number | string)[]> {
  const path = `users/${userId}/favorites`;
  try {
    if (!auth.currentUser || auth.currentUser.uid !== userId) {
      return getUserFavorites(userId);
    }
    const snap = await getDocs(collection(db, "users", userId, "favorites"));
    const ids = snap.docs.map((d) => d.id);
    saveUserFavorites(userId, ids);
    return ids;
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.LIST, path);
    } catch {
      // Return local cache on failure
    }
    return getUserFavorites(userId);
  }
}

export async function toggleProductFavoriteFirestore(
  userId: string,
  productId: number | string,
  isAdding: boolean,
): Promise<void> {
  const strId = String(productId);
  const path = `users/${userId}/favorites/${strId}`;
  try {
    if (auth.currentUser && auth.currentUser.uid === userId) {
      const docRef = doc(db, "users", userId, "favorites", strId);
      if (isAdding) {
        await setDoc(docRef, {
          productId: strId,
          userId,
          addedAt: new Date().toISOString(),
        });
      } else {
        await deleteDoc(docRef);
      }
    }
  } catch (err) {
    try {
      handleFirestoreError(err, isAdding ? OperationType.CREATE : OperationType.DELETE, path);
    } catch {
      // Resilient local state maintained
    }
  }
}

export function toggleProductFavorite(
  userId: string | null | undefined,
  productId: number | string,
): { added: boolean; favorites: (number | string)[]; requiresLogin?: boolean } {
  if (!userId) {
    return { added: false, favorites: [], requiresLogin: true };
  }

  const current = getUserFavorites(userId);
  const exists = current.some((id) => String(id) === String(productId));
  let updated: (number | string)[];

  if (exists) {
    updated = current.filter((id) => String(id) !== String(productId));
    toggleProductFavoriteFirestore(userId, productId, false).catch(() => {});
  } else {
    updated = [...current, productId];
    toggleProductFavoriteFirestore(userId, productId, true).catch(() => {});
  }

  saveUserFavorites(userId, updated);
  return { added: !exists, favorites: updated, requiresLogin: false };
}

export function removeProductFavorite(
  userId: string | null | undefined,
  productId: number | string,
): (number | string)[] {
  if (!userId) return [];
  const current = getUserFavorites(userId);
  const updated = current.filter((id) => String(id) !== String(productId));
  saveUserFavorites(userId, updated);
  toggleProductFavoriteFirestore(userId, productId, false).catch(() => {});
  return updated;
}

/**
 * React hook for accessing and mutating current user's favorites
 */
export function useFavorites() {
  const { user, isLoggedIn } = useCurrentUser();
  const userId = user?.id ?? null;

  const [favorites, setFavorites] = useState<(number | string)[]>(() => getUserFavorites(userId));

  useEffect(() => {
    setFavorites(getUserFavorites(userId));

    if (userId) {
      syncFavoritesFromFirestore(userId).then((items) => {
        if (items) setFavorites(items);
      });
    }

    const handleFavoritesChange = (e: Event) => {
      const customEvent = e as CustomEvent<{
        userId: string;
        favorites: (number | string)[];
      }>;
      if (!customEvent.detail || customEvent.detail.userId === userId) {
        setFavorites(getUserFavorites(userId));
      }
    };

    window.addEventListener(FAVORITES_EVENT_NAME, handleFavoritesChange);
    window.addEventListener("storage", handleFavoritesChange);

    return () => {
      window.removeEventListener(FAVORITES_EVENT_NAME, handleFavoritesChange);
      window.removeEventListener("storage", handleFavoritesChange);
    };
  }, [userId]);

  const checkIsFavorite = useCallback(
    (productId: number | string) => {
      if (!userId) return false;
      return favorites.some((id) => String(id) === String(productId));
    },
    [userId, favorites],
  );

  const toggle = useCallback(
    (productId: number | string) => {
      if (!userId) {
        return { added: false, requiresLogin: true };
      }
      const res = toggleProductFavorite(userId, productId);
      setFavorites(res.favorites);
      return res;
    },
    [userId],
  );

  const remove = useCallback(
    (productId: number | string) => {
      if (!userId) return;
      const updated = removeProductFavorite(userId, productId);
      setFavorites(updated);
    },
    [userId],
  );

  return {
    favorites,
    favoriteCount: favorites.length,
    isFavorite: checkIsFavorite,
    toggleFavorite: toggle,
    removeFavorite: remove,
    isLoggedIn,
    userId,
  };
}
