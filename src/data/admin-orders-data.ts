import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cleanFirestorePayload } from "@/lib/firestore-utils";

export interface SaleOrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface SaleOrder {
  id: string;
  orderNumber: string;
  date: string;
  customer: string;
  email: string;
  phone: string;
  total: number;
  totalFormatted: string;
  itemsCount: number;
  products: SaleOrderItem[];
  paymentStatus: "Recebido" | "Recusado" | "Pendente";
  paymentMethod: string;
  shippingStatus: "Enviada" | "Pendente" | "Cancelada";
  shippingCarrier: string;
  trackingCode?: string;
  statusFilter: "arquivar" | "cobrar" | "embalar" | "enviar" | "retirar";
  userId?: string;
  notes?: string;
}

export interface AbandonedCartItem {
  id: string;
  cartNumber: string;
  date: string;
  total: string;
  customer: string;
  email: string;
  hasPaymentAttempt: boolean;
  actionStatus: string;
  products: { name: string; quantity: number; price: string }[];
}

export const INITIAL_SALES: SaleOrder[] = [];
export const INITIAL_CARTS: AbandonedCartItem[] = [];

const SALES_STORAGE_KEY = "viva_admin_sales";
const CARTS_STORAGE_KEY = "viva_admin_abandoned_carts";

export function getCachedOrders(): SaleOrder[] {
  if (typeof window === "undefined") return INITIAL_SALES;
  try {
    const saved = localStorage.getItem(SALES_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // fallback
  }
  return INITIAL_SALES;
}

export function cacheOrders(orders: SaleOrder[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(orders));
  } catch {
    // fallback
  }
}

export function getCachedAbandonedCarts(): AbandonedCartItem[] {
  if (typeof window === "undefined") return INITIAL_CARTS;
  try {
    const saved = localStorage.getItem(CARTS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // fallback
  }
  return INITIAL_CARTS;
}

export function cacheAbandonedCarts(carts: AbandonedCartItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CARTS_STORAGE_KEY, JSON.stringify(carts));
  } catch {
    // fallback
  }
}

// -------------------------------------------------------------
// Orders / Vendas
// -------------------------------------------------------------

/**
 * Escuta pedidos/vendas em tempo real do Firestore
 */
export function subscribeAdminOrders(callback: (orders: SaleOrder[]) => void): () => void {
  const ordersCol = collection(db, "orders");
  const q = query(ordersCol);

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const loaded: SaleOrder[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as SaleOrder;
        loaded.push({
          ...data,
          id: docSnap.id,
        });
      });

      cacheOrders(loaded);
      callback(loaded);
    },
    (err) => {
      console.warn("Aviso ao carregar pedidos do Firestore, usando cache local:", err);
      callback(getCachedOrders());
    },
  );

  return unsubscribe;
}

/**
 * Salva ou atualiza um pedido no Firestore
 */
export async function saveAdminOrderToFirestore(order: SaleOrder): Promise<void> {
  const docRef = doc(db, "orders", order.id);
  const payload = cleanFirestorePayload({
    ...order,
    date: order.date || new Date().toISOString(),
  });

  await setDoc(docRef, payload, { merge: true });

  const current = getCachedOrders();
  const exists = current.some((o) => o.id === order.id);
  const updated = exists
    ? current.map((o) => (o.id === order.id ? order : o))
    : [order, ...current];
  cacheOrders(updated);
}

/**
 * Atualiza status operacional ou financeiro de um pedido
 */
export async function updateAdminOrderStatusInFirestore(
  orderId: string,
  updates: Partial<SaleOrder>,
): Promise<void> {
  const docRef = doc(db, "orders", orderId);
  const payload = cleanFirestorePayload(updates);
  await updateDoc(docRef, payload);

  const current = getCachedOrders();
  const updated = current.map((o) => (o.id === orderId ? { ...o, ...updates } : o));
  cacheOrders(updated);
}

/**
 * Exclui um pedido do Firestore
 */
export async function deleteAdminOrderFromFirestore(orderId: string): Promise<void> {
  const docRef = doc(db, "orders", orderId);
  await deleteDoc(docRef);

  const current = getCachedOrders();
  const updated = current.filter((o) => o.id !== orderId);
  cacheOrders(updated);
}

// -------------------------------------------------------------
// Carrinhos Abandonados
// -------------------------------------------------------------

/**
 * Escuta carrinhos abandonados em tempo real do Firestore
 */
export function subscribeAbandonedCarts(
  callback: (carts: AbandonedCartItem[]) => void,
): () => void {
  const cartsCol = collection(db, "abandoned_carts");
  const q = query(cartsCol);

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const loaded: AbandonedCartItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as AbandonedCartItem;
        loaded.push({
          ...data,
          id: docSnap.id,
        });
      });

      cacheAbandonedCarts(loaded);
      callback(loaded);
    },
    (err) => {
      console.warn("Aviso ao carregar carrinhos do Firestore, usando cache local:", err);
      callback(getCachedAbandonedCarts());
    },
  );

  return unsubscribe;
}

/**
 * Salva um carrinho abandonado no Firestore
 */
export async function saveAbandonedCartToFirestore(cart: AbandonedCartItem): Promise<void> {
  const docRef = doc(db, "abandoned_carts", cart.id);
  const payload = cleanFirestorePayload({
    ...cart,
    date: cart.date || new Date().toISOString(),
  });

  await setDoc(docRef, payload, { merge: true });

  const current = getCachedAbandonedCarts();
  const exists = current.some((c) => c.id === cart.id);
  const updated = exists ? current.map((c) => (c.id === cart.id ? cart : c)) : [cart, ...current];
  cacheAbandonedCarts(updated);
}

/**
 * Exclui um carrinho abandonado do Firestore
 */
export async function deleteAbandonedCartFromFirestore(cartId: string): Promise<void> {
  const docRef = doc(db, "abandoned_carts", cartId);
  await deleteDoc(docRef);

  const current = getCachedAbandonedCarts();
  const updated = current.filter((c) => c.id !== cartId);
  cacheAbandonedCarts(updated);
}
