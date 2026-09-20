export interface StoreSettings {
  // Contato & Localização
  whatsappNumber: string; // ex: "5511950300241"
  whatsappDisplay: string; // ex: "(11) 95030-0241"
  whatsappDefaultMessage: string;
  contactEmail: string; // ex: "mprojetovivacomsaude@gmail.com"
  locationDisplay: string; // ex: "Zona Sul de São Paulo"
  fullAddress: string; // ex: "Rua Exemplo, 123 - São Paulo - SP"

  // Banner Principal (Hero)
  heroImageUrl: string; // URL ou data-uri da imagem
  heroImageAlt: string;
  heroTagline: string; // ex: "Saúde natural para uma vida melhor"
  heroTitleLine1: string; // ex: "Mais saúde"
  heroTitleLine2: string; // ex: "para o seu dia a dia."
  heroSubtitle: string; // ex: "Produtos naturais, fitoterápicos e suplementos para o seu bem-estar físico e mental."
  heroButtonText: string; // ex: "Conheça nossos produtos"
  heroButtonLink: string; // ex: "#produtos"

  // Informações da Loja
  storeName: string;
  storeSlogan: string;
  announcementBarText: string;
  announcementActive: boolean;

  // Selos & Vantagens Hero
  heroBadge1: string;
  heroBadge2: string;

  // Blocos de Confiança e Vantagens (Entrega para todo o Brasil, Compra 100% segura, etc.)
  trustDeliveryTitle: string; // ex: "Entrega para todo o Brasil"
  trustDeliverySubtitle: string; // ex: "com segurança e agilidade"
  trustSecurityTitle: string; // ex: "Compra 100% segura"
  trustSecuritySubtitle: string; // ex: "seus dados protegidos"
  trustInstallmentsTitle: string; // ex: "Parcele em até 6x"
  trustInstallmentsSubtitle: string; // ex: "nos principais cartões"
  trustQualityTitle: string; // ex: "Produtos originais"
  trustQualitySubtitle: string; // ex: "e de alta qualidade"
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  whatsappNumber: "5511950300241",
  whatsappDisplay: "(11) 95030-0241",
  whatsappDefaultMessage: "Olá! Gostaria de falar com o atendimento.",
  contactEmail: "mprojetovivacomsaude@gmail.com",
  locationDisplay: "Zona Sul de São Paulo",
  fullAddress: "Zona Sul de São Paulo - Atendimento e envios para todo o Brasil",

  heroImageUrl: "", // vazia usa o asset local importado como padrão
  heroImageAlt: "Suplemento natural Viva entre folhas e flores sobre pedestal de pedra",
  heroTagline: "Saúde natural para uma vida melhor",
  heroTitleLine1: "Mais saúde",
  heroTitleLine2: "para o seu dia a dia.",
  heroSubtitle:
    "Produtos naturais, fitoterápicos e suplementos para o seu bem-estar físico e mental.",
  heroButtonText: "Conheça nossos produtos",
  heroButtonLink: "#produtos",

  storeName: "Projeto Viva com Saúde",
  storeSlogan: "Saúde natural para uma vida melhor.",
  announcementBarText: "",
  announcementActive: false,

  heroBadge1: "100% naturais",
  heroBadge2: "Qualidade comprovada",

  trustDeliveryTitle: "Entrega para todo o Brasil",
  trustDeliverySubtitle: "com segurança e agilidade",
  trustSecurityTitle: "Compra 100% segura",
  trustSecuritySubtitle: "seus dados protegidos",
  trustInstallmentsTitle: "Parcele em até 6x",
  trustInstallmentsSubtitle: "nos principais cartões",
  trustQualityTitle: "Produtos originais",
  trustQualitySubtitle: "e de alta qualidade",
};

const STORAGE_KEY = "viva_store_custom_settings";

export function getStoreSettings(): StoreSettings {
  if (typeof window === "undefined") return DEFAULT_STORE_SETTINGS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_STORE_SETTINGS, ...JSON.parse(saved) };
    }
  } catch {
    // fallback
  }
  return DEFAULT_STORE_SETTINGS;
}

export function saveStoreSettings(settings: StoreSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event("viva_store_settings_updated"));
  } catch {
    // fallback
  }
}
