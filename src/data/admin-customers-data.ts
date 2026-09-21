import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  writeBatch,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cleanFirestorePayload } from "@/lib/firestore-utils";

export interface AdminCustomerItem {
  id: string;
  fullName: string;
  cpfCnpj: string;
  email: string;
  phone: string;
  gender: string;
  birthDate: string;
  address: string;
  number: string;
  complement: string;
  city: string;
  neighborhood: string;
  state: string;
  cep: string;
  country: string;
  totalSpent: number;
  purchasesCount: number;
  lastPurchaseDate: string;
  lastOrderNumber: string;
  registrationDate: string;
  registered: boolean;
  newsletter: boolean;
  marketing: "Aceita" | "Não aceita";
  marketingUpdateDate: string;
  tags: string;
  notes?: string;
  priceTable?: string;
}

export interface CustomerMessageItem {
  id: string;
  customerId?: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  type: "Mensagem" | "Newsletter" | "Contato" | "Dúvida de Pedido";
  subject?: string;
  content: string;
  date: string;
  status: "Não respondida" | "Respondida";
  replyContent?: string;
  replyDate?: string;
  orderNumber?: string;
  trackingCode?: string;
}

export const CUSTOMER_CSV_HEADER = `"Nome completo";CPF/CNPJ;E-mail;"Telefone de Contato";Gênero;"Data de nascimento";Endereço;Número;Complemento;Cidade;Bairro;Estado;CEP;País;"Total Consumido (BRL)";"Número de Compras";"Última Compra";Data;Cadastrado;"Inscrição para newsletter";Marketing;"Marketing (atualização)";Tags`;

export const INITIAL_ADMIN_CUSTOMERS: AdminCustomerItem[] = [];
export const INITIAL_ADMIN_MESSAGES: CustomerMessageItem[] = [];

const CUSTOMERS_STORAGE_KEY = "viva_admin_customers";
const MESSAGES_STORAGE_KEY = "viva_admin_customer_messages";

export function getCachedAdminCustomers(): AdminCustomerItem[] {
  if (typeof window === "undefined") return INITIAL_ADMIN_CUSTOMERS;
  try {
    const saved = localStorage.getItem(CUSTOMERS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // fallback
  }
  return INITIAL_ADMIN_CUSTOMERS;
}

export function cacheAdminCustomers(customers: AdminCustomerItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(customers));
  } catch {
    // fallback
  }
}

export function getCachedCustomerMessages(): CustomerMessageItem[] {
  if (typeof window === "undefined") return INITIAL_ADMIN_MESSAGES;
  try {
    const saved = localStorage.getItem(MESSAGES_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // fallback
  }
  return INITIAL_ADMIN_MESSAGES;
}

export function cacheCustomerMessages(messages: CustomerMessageItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
  } catch {
    // fallback
  }
}

/**
 * Escuta a lista de clientes em tempo real do Firestore
 */
export function subscribeAdminCustomers(
  callback: (customers: AdminCustomerItem[]) => void,
): () => void {
  const customersCol = collection(db, "customers");
  const q = query(customersCol);

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const loaded: AdminCustomerItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as AdminCustomerItem;
        loaded.push({
          ...data,
          id: docSnap.id,
        });
      });

      cacheAdminCustomers(loaded);
      callback(loaded);
    },
    (err) => {
      console.warn("Aviso ao carregar clientes do Firestore, usando cache local:", err);
      callback(getCachedAdminCustomers());
    },
  );

  return unsubscribe;
}

/**
 * Salva ou atualiza um cliente no Firestore
 */
export async function saveAdminCustomerToFirestore(customer: AdminCustomerItem): Promise<void> {
  const docRef = doc(db, "customers", customer.id);
  const payload = cleanFirestorePayload({
    ...customer,
    registrationDate: customer.registrationDate || new Date().toLocaleDateString("pt-BR"),
  });

  await setDoc(docRef, payload, { merge: true });

  const current = getCachedAdminCustomers();
  const exists = current.some((c) => c.id === customer.id);
  const updated = exists
    ? current.map((c) => (c.id === customer.id ? customer : c))
    : [customer, ...current];
  cacheAdminCustomers(updated);
}

/**
 * Exclui um cliente do Firestore
 */
export async function deleteAdminCustomerFromFirestore(customerId: string): Promise<void> {
  const docRef = doc(db, "customers", customerId);
  await deleteDoc(docRef);

  const current = getCachedAdminCustomers();
  const updated = current.filter((c) => c.id !== customerId);
  cacheAdminCustomers(updated);
}

/**
 * Salva múltiplos clientes no Firestore em lotes (ex: importação CSV)
 */
export async function saveAllAdminCustomersToFirestore(
  customers: AdminCustomerItem[],
): Promise<void> {
  const BATCH_SIZE = 400;
  for (let i = 0; i < customers.length; i += BATCH_SIZE) {
    const chunk = customers.slice(i, i + BATCH_SIZE);
    const batch = writeBatch(db);

    for (const item of chunk) {
      const docRef = doc(db, "customers", item.id);
      const payload = cleanFirestorePayload(item);
      batch.set(docRef, payload, { merge: true });
    }

    await batch.commit();
  }

  cacheAdminCustomers(customers);
}

// -------------------------------------------------------------
// Mensagens de Clientes
// -------------------------------------------------------------

/**
 * Escuta mensagens de clientes em tempo real do Firestore
 */
export function subscribeCustomerMessages(
  callback: (messages: CustomerMessageItem[]) => void,
): () => void {
  const messagesCol = collection(db, "messages");
  const q = query(messagesCol);

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const loaded: CustomerMessageItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as CustomerMessageItem;
        loaded.push({
          ...data,
          id: docSnap.id,
        });
      });

      cacheCustomerMessages(loaded);
      callback(loaded);
    },
    (err) => {
      console.warn("Aviso ao carregar mensagens do Firestore, usando cache local:", err);
      callback(getCachedCustomerMessages());
    },
  );

  return unsubscribe;
}

/**
 * Cria ou salva uma mensagem de cliente no Firestore
 */
export async function saveCustomerMessageToFirestore(message: CustomerMessageItem): Promise<void> {
  const docRef = doc(db, "messages", message.id);
  const payload = cleanFirestorePayload({
    ...message,
    date: message.date || new Date().toISOString(),
  });

  await setDoc(docRef, payload, { merge: true });

  const current = getCachedCustomerMessages();
  const exists = current.some((m) => m.id === message.id);
  const updated = exists
    ? current.map((m) => (m.id === message.id ? message : m))
    : [message, ...current];
  cacheCustomerMessages(updated);
}

/**
 * Responde uma mensagem no Firestore
 */
export async function updateCustomerMessageReplyInFirestore(
  messageId: string,
  replyContent: string,
): Promise<void> {
  const docRef = doc(db, "messages", messageId);
  await updateDoc(docRef, {
    status: "Respondida",
    replyContent,
    replyDate: new Date().toLocaleDateString("pt-BR"),
  });

  const current = getCachedCustomerMessages();
  const updated = current.map((m) =>
    m.id === messageId
      ? {
          ...m,
          status: "Respondida" as const,
          replyContent,
          replyDate: new Date().toLocaleDateString("pt-BR"),
        }
      : m,
  );
  cacheCustomerMessages(updated);
}

/**
 * Exclui uma mensagem de cliente do Firestore
 */
export async function deleteCustomerMessageFromFirestore(messageId: string): Promise<void> {
  const docRef = doc(db, "messages", messageId);
  await deleteDoc(docRef);

  const current = getCachedCustomerMessages();
  const updated = current.filter((m) => m.id !== messageId);
  cacheCustomerMessages(updated);
}
