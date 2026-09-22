import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cleanFirestorePayload } from "@/lib/firestore-utils";

export interface CustomProductTab {
  id: string;
  title: string;
  content: string;
}

export interface AdminProductItem {
  id: string;
  urlSlug: string;
  name: string;
  categories: string;
  price: number;
  promotionalPrice: number;
  weightKg: number;
  heightCm: number;
  widthCm: number;
  lengthCm: number;
  stock: string | number; // 'Infinito' or number
  sku: string;
  barcode: string;
  displayInStore: boolean;
  freeShipping: boolean;
  description: string;
  tags: string;
  seoTitle: string;
  seoDescription: string;
  brand: string;
  isPhysical: boolean;
  mpn: string;
  gender: string;
  ageGroup: string;
  cost: number;
  visibility: "Visível" | "Não listado" | "Oculto";
  imagePositionIndex: number;
  imageUrl?: string;
  images?: string[];
  benefits?: string;
  composition?: string;
  usage?: string;
  customTabs?: CustomProductTab[];
  createdAt?: string;
  updatedAt?: string;
}

export const CSV_HEADER = `"Identificador URL";Nome;Categorias;"Nome da variação 1";"Valor da variação 1";"Nome da variação 2";"Valor da variação 2";"Nome da variação 3";"Valor da variação 3";Preço;"Preço promocional";"Peso (kg)";"Altura (cm)";"Largura (cm)";"Comprimento (cm)";Estoque;SKU;"Código de barras";"Exibir na loja";"Frete gratis";Descrição;Tags;"Título para SEO";"Descrição para SEO";Marca;"Produto Físico";"MPN (Cód. Exclusivo Modelo Fabricante)";Sexo;"Faixa etária";Custo;Visibilidade`;

export const PRESET_STORE_CATEGORIES: string[] = [
  "Emagrecedores",
  "Coluna",
  "Beleza e Bem Estar",
  "Vitaminas",
  "Detox",
  "Digestivo",
  "Visão/Olhos",
  "Coração/Sistema Circulatório",
  "Sistema Respiratório",
  "Calmante",
  "Saúde da Mulher",
  "Imunidade",
  "Dor de Cabeça",
  "Depressão",
  "Energético",
  "Cereais",
  "KIT CAPILAR E DIVERSOS",
  "Sistema Circulatório",
  "Diabete",
];

export const INITIAL_ADMIN_PRODUCTS: AdminProductItem[] = [];

const LOCAL_STORAGE_KEY = "viva_admin_products";

export function getCachedAdminProducts(): AdminProductItem[] {
  if (typeof window === "undefined") return INITIAL_ADMIN_PRODUCTS;
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // fallback
  }
  return INITIAL_ADMIN_PRODUCTS;
}

export function cacheAdminProducts(products: AdminProductItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
    window.dispatchEvent(new Event("viva_admin_products_updated"));
  } catch {
    // fallback
  }
}

/**
 * Escuta produtos em tempo real do Firestore
 */
export function subscribeAdminProducts(
  callback: (products: AdminProductItem[]) => void,
): () => void {
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
      callback(loaded);
    },
    (err) => {
      console.warn("Aviso ao sincronizar produtos do Firestore, usando cache local:", err);
      callback(getCachedAdminProducts());
    },
  );

  return unsubscribe;
}

/**
 * Salva ou atualiza um produto no Firestore
 */
export async function saveAdminProductToFirestore(product: AdminProductItem): Promise<void> {
  const docRef = doc(db, "products", product.id);
  const payload = cleanFirestorePayload({
    ...product,
    updatedAt: new Date().toISOString(),
    createdAt: product.createdAt || new Date().toISOString(),
  });

  await setDoc(docRef, payload, { merge: true });

  // Update local cache immediately for ultra-responsive UI
  const current = getCachedAdminProducts();
  const index = current.findIndex((p) => p.id === product.id);
  let updated: AdminProductItem[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = product;
  } else {
    updated = [product, ...current];
  }
  cacheAdminProducts(updated);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("viva_admin_products_updated"));
  }
}

/**
 * Exclui um produto do Firestore
 */
export async function deleteAdminProductFromFirestore(productId: string): Promise<void> {
  const docRef = doc(db, "products", productId);
  await deleteDoc(docRef);

  // Update cache
  const current = getCachedAdminProducts();
  const updated = current.filter((p) => p.id !== productId);
  cacheAdminProducts(updated);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("viva_admin_products_updated"));
  }
}

/**
 * Salva múltiplos produtos no Firestore em lotes (ex: importação CSV)
 */
export async function saveAllAdminProductsToFirestore(products: AdminProductItem[]): Promise<void> {
  // Batch limit in Firestore is 500 operations
  const BATCH_SIZE = 400;
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const chunk = products.slice(i, i + BATCH_SIZE);
    const batch = writeBatch(db);

    for (const prod of chunk) {
      const docRef = doc(db, "products", prod.id);
      const payload = cleanFirestorePayload({
        ...prod,
        updatedAt: new Date().toISOString(),
        createdAt: prod.createdAt || new Date().toISOString(),
      });
      batch.set(docRef, payload, { merge: true });
    }

    await batch.commit();
  }

  cacheAdminProducts(products);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("viva_admin_products_updated"));
  }
}
