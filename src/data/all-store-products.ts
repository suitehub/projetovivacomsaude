import { AdminProductItem, INITIAL_ADMIN_PRODUCTS } from "./admin-products-data";
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

// Check if an array of admin products contains legacy demo data
export function purgeLegacyDemoData(): void {
  if (typeof window === "undefined") return;
  try {
    const purgeKey = "viva_admin_reset_empty_v4";
    if (!localStorage.getItem(purgeKey)) {
      // Only set initial keys if nothing exists yet
      if (!localStorage.getItem("viva_admin_products")) {
        localStorage.setItem("viva_admin_products", JSON.stringify([]));
      }
      localStorage.setItem(purgeKey, "true");
    }
  } catch {
    // ignore
  }
}

if (typeof window !== "undefined") {
  purgeLegacyDemoData();
}

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

export function getAllStoreProducts(): Product[] {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("viva_admin_products");
      if (saved) {
        const parsed: AdminProductItem[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Filter visible
          const visible = parsed.filter(
            (p) => p.displayInStore !== false && p.visibility !== "Oculto",
          );
          return visible.map((item, idx) => convertAdminProductToStoreProduct(item, idx));
        }
      }
    } catch {
      // fallback
    }
  }

  // Fallback to converting INITIAL_ADMIN_PRODUCTS
  if (INITIAL_ADMIN_PRODUCTS && INITIAL_ADMIN_PRODUCTS.length > 0) {
    const visible = INITIAL_ADMIN_PRODUCTS.filter(
      (p) => p.displayInStore !== false && p.visibility !== "Oculto",
    );
    return visible.map((item, idx) => convertAdminProductToStoreProduct(item, idx));
  }

  return initialStaticProducts;
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
