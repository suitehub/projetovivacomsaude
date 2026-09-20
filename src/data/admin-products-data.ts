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
