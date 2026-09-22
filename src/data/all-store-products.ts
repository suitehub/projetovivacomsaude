import { useState, useEffect } from "react";
import { collection, query, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  AdminProductItem,
  INITIAL_ADMIN_PRODUCTS,
  getCachedAdminProducts,
  cacheAdminProducts,
} from "./admin-products-data";
import { Product, products as initialStaticProducts } from "./products";

const bgPositions = ["0%", "20%", "40%", "60%", "80%", "100%"];

export function getBgPositionForIndex(index: number): string {
  return bgPositions[index % bgPositions.length] || "0%";
}

export function slugify(text: string): string {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// In-memory cache for fast synchronous access
let cachedStoreProducts: Product[] | null = null;
let isFirestoreSubscribed = false;

export function convertAdminProductToStoreProduct(item: AdminProductItem, index: number): Product {
  const bgPos = getBgPositionForIndex(item.imagePositionIndex ?? index);
  const oldPrice =
    item.price > 0 ? item.price : item.promotionalPrice > 0 ? item.promotionalPrice : 0;
  const currentPrice =
    item.promotionalPrice > 0 ? item.promotionalPrice : item.price > 0 ? item.price : 0;
  const discount =
    oldPrice > currentPrice && oldPrice > 0
      ? Math.round(((oldPrice - currentPrice) / oldPrice) * 100)
      : 0;

  // Split categories
  const categoriesList = item.categories
    ? item.categories
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)
    : [];
  const firstCategory = categoriesList[0] || "Produtos";

  // Description paragraphs
  const descParagraphs = item.description
    ? item.description
        .split("\n")
        .map((p) => p.trim())
        .filter(Boolean)
    : [];

  // ONLY extract benefits if explicitly provided by the admin!
  const benefitsList = item.benefits
    ? item.benefits
        .split("\n")
        .map((b) => b.trim())
        .filter(Boolean)
    : undefined;

  // ONLY extract composition if explicitly provided by the admin!
  const compositionList = item.composition
    ? item.composition
        .split("\n")
        .map((c) => c.trim())
        .filter(Boolean)
    : undefined;

  // ONLY extract usage if explicitly provided by the admin!
  const usageList = item.usage
    ? item.usage
        .split("\n")
        .map((u) => u.trim())
        .filter(Boolean)
    : undefined;

  const resolvedImages =
    item.images && item.images.length > 0
      ? item.images
      : item.imageUrl
        ? [item.imageUrl]
        : undefined;

  const rawSlug = item.urlSlug || slugify(item.name) || item.id;
  const cleanSlug = slugify(rawSlug) || item.id;

  return {
    id: item.id || index + 100,
    slug: cleanSlug,
    name: item.name || "Produto",
    subtitle: item.brand || "",
    category: firstCategory,
    categoriesList,
    sku: item.sku || "",
    discount,
    oldPrice,
    price: currentPrice,
    installments: currentPrice > 0 ? 6 : 1,
    rating: 5.0,
    reviews: 0,
    shortDescription: descParagraphs[0]?.slice(0, 160) || item.seoDescription || item.name,
    description:
      descParagraphs.length > 0 ? descParagraphs : [item.description || ""].filter(Boolean),
    benefits: benefitsList && benefitsList.length > 0 ? benefitsList : undefined,
    composition: compositionList && compositionList.length > 0 ? compositionList : undefined,
    usage: usageList && usageList.length > 0 ? usageList : undefined,
    customTabs: item.customTabs && item.customTabs.length > 0 ? item.customTabs : undefined,
    imageUrl: (resolvedImages && resolvedImages[0]) || item.imageUrl || undefined,
    images: resolvedImages,
    imagePosition: bgPos,
    galleryPositions: [
      bgPos,
      getBgPositionForIndex((item.imagePositionIndex ?? index) + 1),
      getBgPositionForIndex((item.imagePositionIndex ?? index) + 2),
      getBgPositionForIndex((item.imagePositionIndex ?? index) + 3),
    ],
    stock: item.stock,
    weightKg: item.weightKg,
    heightCm: item.heightCm,
    widthCm: item.widthCm,
    lengthCm: item.lengthCm,
    freeShipping: item.freeShipping,
    brand: item.brand,
  };
}

export function initStoreProductsSubscription(): () => void {
  if (typeof window === "undefined" || isFirestoreSubscribed) {
    return () => {};
  }
  isFirestoreSubscribed = true;

  try {
    const productsCol = collection(db, "products");
    const q = query(productsCol);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loaded: AdminProductItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as AdminProductItem;
          loaded.push({
            ...data,
            id: docSnap.id,
          });
        });

        cacheAdminProducts(loaded);
        const visible = loaded.filter(
          (p) => p.displayInStore !== false && p.visibility !== "Oculto",
        );
        cachedStoreProducts = visible.map((item, idx) =>
          convertAdminProductToStoreProduct(item, idx),
        );
        window.dispatchEvent(new Event("viva_admin_products_updated"));
      },
      (err) => {
        console.warn("Aviso ao sincronizar catálogo do Firestore:", err);
      },
    );

    return unsubscribe;
  } catch (err) {
    console.warn("Erro ao inicializar subscription da loja:", err);
    return () => {};
  }
}

// Auto-initialize subscription in browser
if (typeof window !== "undefined") {
  initStoreProductsSubscription();
}

export function getAllStoreProducts(): Product[] {
  if (cachedStoreProducts && cachedStoreProducts.length > 0) {
    return cachedStoreProducts;
  }

  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("viva_admin_products");
      if (saved) {
        const parsed: AdminProductItem[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Filter visible
          const visible = parsed.filter(
            (p) => p.displayInStore !== false && p.visibility !== "Oculto",
          );
          const converted = visible.map((item, idx) =>
            convertAdminProductToStoreProduct(item, idx),
          );
          cachedStoreProducts = converted;
          return converted;
        }
      }
    } catch {
      // fallback
    }
  }

  // Fallback to converting INITIAL_ADMIN_PRODUCTS if present
  if (INITIAL_ADMIN_PRODUCTS && INITIAL_ADMIN_PRODUCTS.length > 0) {
    const visible = INITIAL_ADMIN_PRODUCTS.filter(
      (p) => p.displayInStore !== false && p.visibility !== "Oculto",
    );
    return visible.map((item, idx) => convertAdminProductToStoreProduct(item, idx));
  }

  return initialStaticProducts;
}

/**
 * React hook that subscribes to store products live from Firestore
 */
export function useStoreProducts(): Product[] {
  const [products, setProducts] = useState<Product[]>(() => getAllStoreProducts());

  useEffect(() => {
    // Ensure subscription is active
    initStoreProductsSubscription();

    const handleUpdate = () => {
      setProducts(getAllStoreProducts());
    };

    // Update immediately from current cache
    setProducts(getAllStoreProducts());

    window.addEventListener("viva_admin_products_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("viva_admin_products_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return products;
}

export async function fetchStoreProductBySlugFromFirestore(
  slug: string,
): Promise<Product | undefined> {
  if (!slug) return undefined;
  // First check synchronous cache
  const local = findStoreProductBySlug(slug);
  if (local) return local;

  // Otherwise query Firestore directly
  try {
    const productsCol = collection(db, "products");
    const snap = await getDocs(productsCol);
    const loaded: AdminProductItem[] = [];
    snap.forEach((d) => {
      loaded.push({ ...(d.data() as AdminProductItem), id: d.id });
    });
    if (loaded.length > 0) {
      cacheAdminProducts(loaded);
      const visible = loaded.filter((p) => p.displayInStore !== false && p.visibility !== "Oculto");
      cachedStoreProducts = visible.map((item, idx) =>
        convertAdminProductToStoreProduct(item, idx),
      );
      return findStoreProductBySlug(slug);
    }
  } catch (err) {
    console.warn("Erro ao buscar produto do Firestore:", err);
  }
  return findStoreProductBySlug(slug);
}

export function findStoreProductBySlug(slug: string): Product | undefined {
  if (!slug) return undefined;
  const decodedSlug = decodeURIComponent(slug).toLowerCase().trim();
  const normalizedSlug = slugify(decodedSlug);

  const all = getAllStoreProducts();
  const found = all.find((p) => {
    if (!p) return false;
    const pSlug = (p.slug || "").toLowerCase().trim();
    const pDecodedSlug = decodeURIComponent(pSlug);
    const pId = String(p.id).toLowerCase().trim();
    const pName = (p.name || "").toLowerCase().trim();

    return (
      pSlug === slug ||
      pSlug === decodedSlug ||
      pDecodedSlug === decodedSlug ||
      slugify(pSlug) === normalizedSlug ||
      pId === slug ||
      pId === decodedSlug ||
      pName === decodedSlug ||
      slugify(pName) === normalizedSlug
    );
  });
  if (found) return found;

  return initialStaticProducts.find((p) => {
    if (!p) return false;
    const pSlug = (p.slug || "").toLowerCase().trim();
    const pDecodedSlug = decodeURIComponent(pSlug);
    const pId = String(p.id).toLowerCase().trim();
    const pName = (p.name || "").toLowerCase().trim();

    return (
      pSlug === slug ||
      pSlug === decodedSlug ||
      pDecodedSlug === decodedSlug ||
      slugify(pSlug) === normalizedSlug ||
      pId === slug ||
      pId === decodedSlug ||
      pName === decodedSlug ||
      slugify(pName) === normalizedSlug
    );
  });
}
