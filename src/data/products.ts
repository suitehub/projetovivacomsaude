export type Product = {
  id: number | string;
  slug: string;
  name: string;
  subtitle: string;
  category: string;
  categoriesList?: string[];
  sku: string;
  discount: number;
  oldPrice: number;
  price: number;
  installments: number;
  rating: number;
  reviews: number;
  shortDescription: string;
  description: string[];
  benefits?: string[];
  composition?: string[];
  usage?: string[];
  customTabs?: { id: string; title: string; content: string }[];
  imagePosition?: string;
  galleryPositions?: string[];
  imageUrl?: string;
  images?: string[];
  stock?: string | number;
  weightKg?: number;
  heightCm?: number;
  widthCm?: number;
  lengthCm?: number;
  freeShipping?: boolean;
  brand?: string;
};

export const products: Product[] = [];

export const getProductBySlug = (slug: string) => products.find((product) => product.slug === slug);

export const formatPrice = (price: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);
