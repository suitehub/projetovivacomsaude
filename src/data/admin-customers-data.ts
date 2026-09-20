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
