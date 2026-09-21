import { collection, doc, setDoc, deleteDoc, onSnapshot, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cleanFirestorePayload } from "@/lib/firestore-utils";

export type DiscountType = "porcentagem" | "valor_fixo" | "frete_gratis";
export type DiscountAppliesTo = "toda_loja" | "categorias" | "produtos";

export interface DiscountCoupon {
  id: string;
  code: string;
  type: DiscountType;
  value: number;
  includeShippingInDiscount: boolean;
  appliesTo: DiscountAppliesTo;
  selectedCategories?: string[];
  selectedProductIds?: (string | number)[];

  // Limites de uso
  allowCombineWithPromotions: boolean;
  usageLimitPerCoupon: "ilimitado" | "limitado";
  maxUsageTotal?: number;

  usageLimitPerCustomer: "ilimitado" | "limitado" | "primeira_compra";
  maxUsagePerCustomer?: number;

  dateLimit: "ilimitado" | "periodo";
  startDate?: string;
  endDate?: string;

  cartValueType: "ilimitado" | "acima_de";
  minCartValue: number;

  maxDiscountLimit: "nenhum" | "ate";
  maxDiscountValue?: number;

  active: boolean;
  usedCount: number;
  createdAt: string;
}

export const INITIAL_ADMIN_COUPONS: DiscountCoupon[] = [];

const STORAGE_KEY = "viva_admin_coupons";

export function getAdminCoupons(): DiscountCoupon[] {
  if (typeof window === "undefined") return INITIAL_ADMIN_COUPONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return INITIAL_ADMIN_COUPONS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Purge demo coupons
      if (parsed.some((c: DiscountCoupon) => c.code === "VIVA10" || c.code === "PRIMEIRACOMPRA")) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
        return [];
      }
      return parsed;
    }
    return INITIAL_ADMIN_COUPONS;
  } catch {
    return INITIAL_ADMIN_COUPONS;
  }
}

export function saveAdminCoupons(coupons: DiscountCoupon[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(coupons));
    window.dispatchEvent(new Event("viva_admin_coupons_updated"));
  } catch (err) {
    console.error("Erro ao salvar cupons:", err);
  }
}

/**
 * Escuta cupons de desconto em tempo real do Firestore
 */
export function subscribeAdminCoupons(callback: (coupons: DiscountCoupon[]) => void): () => void {
  const couponsCol = collection(db, "coupons");
  const q = query(couponsCol);

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const loaded: DiscountCoupon[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as DiscountCoupon;
        loaded.push({
          ...data,
          id: docSnap.id,
        });
      });

      saveAdminCoupons(loaded);
      callback(loaded);
    },
    (err) => {
      console.warn("Aviso ao carregar cupons do Firestore, usando cache local:", err);
      callback(getAdminCoupons());
    },
  );

  return unsubscribe;
}

/**
 * Salva ou atualiza um cupom no Firestore
 */
export async function saveAdminCouponToFirestore(coupon: DiscountCoupon): Promise<void> {
  const docRef = doc(db, "coupons", coupon.id);
  const payload = cleanFirestorePayload({
    ...coupon,
    code: coupon.code.toUpperCase().trim(),
    createdAt: coupon.createdAt || new Date().toISOString(),
  });

  await setDoc(docRef, payload, { merge: true });

  // Update local cache
  const current = getAdminCoupons();
  const exists = current.some((c) => c.id === coupon.id);
  const updated = exists
    ? current.map((c) => (c.id === coupon.id ? coupon : c))
    : [coupon, ...current];
  saveAdminCoupons(updated);
}

/**
 * Exclui um cupom do Firestore
 */
export async function deleteAdminCouponFromFirestore(couponId: string): Promise<void> {
  const docRef = doc(db, "coupons", couponId);
  await deleteDoc(docRef);

  const current = getAdminCoupons();
  const updated = current.filter((c) => c.id !== couponId);
  saveAdminCoupons(updated);
}

/**
 * Alterna status ativo/inativo de um cupom
 */
export async function toggleAdminCouponActiveInFirestore(
  couponId: string,
  active: boolean,
): Promise<void> {
  const docRef = doc(db, "coupons", couponId);
  await setDoc(docRef, { active }, { merge: true });

  const current = getAdminCoupons();
  const updated = current.map((c) => (c.id === couponId ? { ...c, active } : c));
  saveAdminCoupons(updated);
}
