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
