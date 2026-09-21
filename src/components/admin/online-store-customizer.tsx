import React, { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  ExternalLink,
  Eye,
  Globe,
  ImageIcon,
  Info,
  Mail,
  MapPin,
  MessageCircle,
  RotateCcw,
  Save,
  ShieldCheck,
  Store,
  Truck,
  CreditCard,
  Leaf,
  Upload,
  Cloud,
} from "lucide-react";
import {
  DEFAULT_STORE_SETTINGS,
  getStoreSettings,
  saveStoreSettings,
  subscribeStoreSettings,
  StoreSettings,
} from "@/data/store-settings";
import heroImageDefault from "@/assets/hero.png";

export function OnlineStoreCustomizer() {
  const [settings, setSettings] = useState<StoreSettings>(() => getStoreSettings());
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeStoreSettings((loaded) => {
      setSettings(loaded);
    });
    return () => unsubscribe();
  }, []);
  const [activeSection, setActiveSection] = useState<"contato" | "banner" | "vantagens" | "geral">(
    "contato",
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showResetModal, setShowResetModal] = useState(false);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    saveStoreSettings(settings);
    setSavedSuccess(true);
    toast.success("Configurações da loja salvas com sucesso!");
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleConfirmReset = () => {
    setSettings(DEFAULT_STORE_SETTINGS);
    saveStoreSettings(DEFAULT_STORE_SETTINGS);
    setSavedSuccess(true);
    setShowResetModal(false);
    toast.success("Padrões de fábrica restaurados com sucesso!");
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Image Upload handler (converts to base64 data URL so it displays instantly in preview & site)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione um arquivo de imagem válido (JPG, PNG, WebP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setSettings((prev) => ({
          ...prev,
          heroImageUrl: dataUrl,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Quick formatted phone helper
  const handlePhoneChange = (val: string) => {
    // clean raw number for wa.me
    const rawDigits = val.replace(/\D/g, "");
    let display = val;
    // Auto-format standard Brazilian phone (11) 99999-9999
    if (rawDigits.length === 11) {
      display = `(${rawDigits.slice(0, 2)}) ${rawDigits.slice(2, 7)}-${rawDigits.slice(7)}`;
    } else if (rawDigits.length === 10) {
      display = `(${rawDigits.slice(0, 2)}) ${rawDigits.slice(2, 6)}-${rawDigits.slice(6)}`;
    }

    setSettings((prev) => ({
      ...prev,
      whatsappDisplay: display,
      whatsappNumber: rawDigits.startsWith("55") ? rawDigits : `55${rawDigits}`,
    }));
  };

  const previewHeroImage = settings.heroImageUrl || heroImageDefault;

  return (
    <div className="min-h-screen bg-[#f7f9fa] pb-20 font-sans">
      {/* Top Header matching Nuvemshop style */}
      <div className="border-b border-gray-200 bg-white px-6 py-4 shadow-2xs">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eaf1fb] text-[#0066d6]">
              <Store className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">Loja Online</h1>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                  Canal Ativo
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-[#0066d6] border border-blue-200">
                  <Cloud className="w-3 h-3 text-[#0066d6]" />
                  Firestore Sincronizado
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Personalize informações de contato, localização, banner principal e textos da sua
                loja.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs transition-colors"
            >
              <Eye className="h-3.5 w-3.5 text-gray-500" />
              <span>Ver loja ao vivo</span>
              <ExternalLink className="h-3 w-3 text-gray-400" />
            </a>

            <button
              type="button"
              onClick={() => handleSave()}
              className="flex items-center gap-1.5 rounded-lg bg-[#0066d6] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#0052ad] transition-colors"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Salvar alterações</span>
            </button>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="mx-auto max-w-6xl px-6 pt-4">
          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 shadow-2xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>
                Alterações salvas com sucesso! As novidades já estão ativas na sua loja online.
              </span>
            </div>
            <a
              href="/"
              target="_blank"
              className="font-bold underline text-emerald-900 hover:text-emerald-950"
            >
              Conferir no site ↗
            </a>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl px-6 py-6">
        {/* Navigation Tabs */}
        <div className="mb-6 flex border-b border-gray-200 bg-white px-4 rounded-xl shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveSection("contato")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-colors ${
              activeSection === "contato"
                ? "border-[#0066d6] text-[#0066d6]"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <MessageCircle className="h-4 w-4" />
            <span>Contato & Localização (WhatsApp, E-mail, Local)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("banner")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-colors ${
              activeSection === "banner"
                ? "border-[#0066d6] text-[#0066d6]"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <ImageIcon className="h-4 w-4" />
            <span>Banner Principal (Hero) & Dimensões</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("vantagens")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-colors ${
              activeSection === "vantagens"
                ? "border-[#0066d6] text-[#0066d6]"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Blocos de Vantagens (Entrega, Segurança, Parcelamento)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection("geral")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-colors ${
              activeSection === "geral"
                ? "border-[#0066d6] text-[#0066d6]"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <Globe className="h-4 w-4" />
            <span>Textos da Loja & Barra de Avisos</span>
          </button>
        </div>

        {/* SECTION 1: Contato, WhatsApp, E-mail e Localização */}
        {activeSection === "contato" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-2xs space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-base font-bold text-gray-900">
                  Canais de Atendimento e Localização da Loja
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Estes dados serão exibidos no rodapé, no menu de atendimento, no botão de compra
                  rápida pelo WhatsApp e nos links oficiais de contato.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                {/* WhatsApp */}
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold">
                    <MessageCircle className="h-4 w-4 text-emerald-600" />
                    <span>WhatsApp de Atendimento</span>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Número formatado (como o cliente vê)
                    </label>
                    <input
                      type="text"
                      value={settings.whatsappDisplay}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="(11) 95030-0241"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-[#0066d6] focus:outline-hidden"
                    />
                    <span className="text-[11px] text-gray-500 mt-1 block">
                      Exemplo: (11) 95030-0241
                    </span>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Número internacional com DDI (usado no link wa.me)
                    </label>
                    <input
                      type="text"
                      value={settings.whatsappNumber}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          whatsappNumber: e.target.value.replace(/\D/g, ""),
                        })
                      }
                      placeholder="5511950300241"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-[#0066d6] focus:outline-hidden"
                    />
                    <span className="text-[11px] text-gray-500 mt-1 block">
                      Apenas números: 55 + DDD + número. Ex: 5511950300241
                    </span>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Mensagem inicial automática no WhatsApp
                    </label>
                    <input
                      type="text"
                      value={settings.whatsappDefaultMessage}
                      onChange={(e) =>
                        setSettings({ ...settings, whatsappDefaultMessage: e.target.value })
                      }
                      placeholder="Olá! Gostaria de falar com o atendimento."
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-[#0066d6] focus:outline-hidden"
                    />
                  </div>

                  {/* WhatsApp Quick Test */}
                  <div className="pt-2">
                    <a
                      href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
                        settings.whatsappDefaultMessage,
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:underline"
                    >
                      <span>Testar link do WhatsApp</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                {/* E-mail e Local */}
                <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-[#0066d6] font-bold">
                    <Mail className="h-4 w-4" />
                    <span>E-mail & Localização Física</span>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      E-mail de Contato Principal
                    </label>
                    <input
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                      placeholder="mprojetovivacomsaude@gmail.com"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-[#0066d6] focus:outline-hidden"
                    />
                    <span className="text-[11px] text-gray-500 mt-1 block">
                      Recebe as dúvidas do rodapé e links "mailto".
                    </span>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Localização exibida no rodapé (Cidade / Região)
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
                      <input
                        type="text"
                        value={settings.locationDisplay}
                        onChange={(e) =>
                          setSettings({ ...settings, locationDisplay: e.target.value })
                        }
                        placeholder="Ex: Zona Sul de São Paulo"
                        className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 py-2 text-xs text-gray-900 focus:border-[#0066d6] focus:outline-hidden"
                      />
                    </div>
                    <span className="text-[11px] text-gray-500 mt-1 block">
                      Exibido diretamente no rodapé da loja.
                    </span>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Endereço ou Região completa (opcional)
                    </label>
                    <input
                      type="text"
                      value={settings.fullAddress}
                      onChange={(e) => setSettings({ ...settings, fullAddress: e.target.value })}
                      placeholder="Ex: Zona Sul de São Paulo - Atendimento e envios para todo o Brasil"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-[#0066d6] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: Banner Principal (Hero) com Informação de Tamanho */}
        {activeSection === "banner" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-2xs space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-base font-bold text-gray-900">
                  Banner Principal da Página Inicial (Hero Banner)
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Substitua a imagem de destaque do topo da loja e configure títulos, chamadas e
                  botões de ação.
                </p>
              </div>

              {/* Box de recomendação oficial de tamanho da imagem */}
              <div className="rounded-xl border-2 border-blue-200 bg-blue-50/70 p-5">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#0066d6] text-white">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-extrabold text-blue-950">
                      📐 Dimensões Recomendadas para o Banner Principal:
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-blue-900">
                      <div className="rounded-lg bg-white p-3 border border-blue-200">
                        <span className="font-bold block text-sm text-[#0066d6]">
                          1920 × 1080 px
                        </span>
                        <span className="text-[11px] text-gray-600">
                          Resolução Full HD (Proporção 16:9) para telas grandes
                        </span>
                      </div>
                      <div className="rounded-lg bg-white p-3 border border-blue-200">
                        <span className="font-bold block text-sm text-[#0066d6]">
                          1536 × 864 px
                        </span>
                        <span className="text-[11px] text-gray-600">
                          Resolução padrão ideal (otimizada para carregamento veloz)
                        </span>
                      </div>
                      <div className="rounded-lg bg-white p-3 border border-blue-200">
                        <span className="font-bold block text-sm text-[#0066d6]">JPG / WebP</span>
                        <span className="text-[11px] text-gray-600">
                          Peso recomendado: até 500 KB para manter o site rápido
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-blue-800 pt-2 leading-relaxed">
                      💡 <em>Dica de design:</em> Como os textos principais ("Mais saúde para o seu
                      dia a dia") ficam alinhados à esquerda, dê preferência a fotos com o produto
                      ou assunto principal centralizado ou posicionado à direita.
                    </p>
                  </div>
                </div>
              </div>

              {/* Upload e URL da Imagem */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      1. Enviar imagem do seu computador
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 rounded-lg bg-[#0066d6] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#0052ad] shadow-xs transition-colors"
                      >
                        <Upload className="h-4 w-4" />
                        <span>Escolher arquivo de imagem</span>
                      </button>

                      {settings.heroImageUrl && (
                        <button
                          type="button"
                          onClick={() => setSettings({ ...settings, heroImageUrl: "" })}
                          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                          title="Restaurar banner padrão da loja"
                        >
                          Restaurar padrão
                        </button>
                      )}
                    </div>
                    <span className="text-[11px] text-gray-500 mt-1 block">
                      Formatos aceitos: JPG, PNG, WebP (Ideal: 1920x1080px ou 1536x864px)
                    </span>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Ou insira a URL da imagem
                    </label>
                    <input
                      type="url"
                      value={settings.heroImageUrl.startsWith("data:") ? "" : settings.heroImageUrl}
                      onChange={(e) => setSettings({ ...settings, heroImageUrl: e.target.value })}
                      placeholder="https://sua-loja.com/imagem-banner.jpg"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-[#0066d6] focus:outline-hidden"
                    />
                    <span className="text-[11px] text-gray-500 mt-1 block">
                      Deixe em branco se preferir usar a imagem oficial do Projeto Viva com Saúde.
                    </span>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Texto Alternativo de Acessibilidade (Alt)
                    </label>
                    <input
                      type="text"
                      value={settings.heroImageAlt}
                      onChange={(e) => setSettings({ ...settings, heroImageAlt: e.target.value })}
                      placeholder="Descrição da imagem para leitores de tela"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-[#0066d6] focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Live Preview Box */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-2 text-xs">
                    Pré-visualização do Banner
                  </label>
                  <div className="relative overflow-hidden rounded-xl border border-gray-300 bg-gray-900 aspect-16/9 shadow-xs group">
                    <img
                      src={previewHeroImage}
                      alt={settings.heroImageAlt}
                      className="h-full w-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/80 via-emerald-950/40 to-transparent p-4 flex flex-col justify-center text-white">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-300">
                        {settings.heroTagline}
                      </span>
                      <h4 className="text-base font-bold leading-tight font-serif mt-1">
                        {settings.heroTitleLine1}
                        <br />
                        {settings.heroTitleLine2}
                      </h4>
                      <p className="text-[10px] text-gray-200 mt-1 max-w-[200px] line-clamp-2">
                        {settings.heroSubtitle}
                      </p>
                      <div className="mt-2.5">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-bold text-white">
                          {settings.heroButtonText}
                        </span>
                      </div>
                    </div>

                    <div className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-1 text-[9px] text-white">
                      Dimensão ideal: 1920×1080 (16:9)
                    </div>
                  </div>
                </div>
              </div>

              {/* Textos do Banner Hero */}
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 mb-3">
                  Textos sobre o Banner Principal
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Frase pequena superior (Tagline)
                    </label>
                    <input
                      type="text"
                      value={settings.heroTagline}
                      onChange={(e) => setSettings({ ...settings, heroTagline: e.target.value })}
                      placeholder="Ex: Saúde natural para uma vida melhor"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-[#0066d6] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Título Principal - Linha 1
                    </label>
                    <input
                      type="text"
                      value={settings.heroTitleLine1}
                      onChange={(e) => setSettings({ ...settings, heroTitleLine1: e.target.value })}
                      placeholder="Ex: Mais saúde"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-[#0066d6] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Título Principal - Linha 2
                    </label>
                    <input
                      type="text"
                      value={settings.heroTitleLine2}
                      onChange={(e) => setSettings({ ...settings, heroTitleLine2: e.target.value })}
                      placeholder="Ex: para o seu dia a dia."
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-[#0066d6] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Texto do Botão de Ação
                    </label>
                    <input
                      type="text"
                      value={settings.heroButtonText}
                      onChange={(e) => setSettings({ ...settings, heroButtonText: e.target.value })}
                      placeholder="Ex: Conheça nossos produtos"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-[#0066d6] focus:outline-hidden"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-semibold text-gray-700 mb-1">
                      Subtítulo / Descrição explicativa
                    </label>
                    <textarea
                      rows={2}
                      value={settings.heroSubtitle}
                      onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                      placeholder="Ex: Produtos naturais, fitoterápicos e suplementos para o seu bem-estar físico e mental."
                      className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-xs text-gray-900 focus:border-[#0066d6] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: Blocos de Vantagens e Confiança */}
        {activeSection === "vantagens" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-2xs space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-base font-bold text-gray-900">
                  Blocos de Confiança e Vantagens da Loja
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Personalize os títulos e subtítulos que aparecem no topo do site, na página de
                  detalhes de cada produto e nos selos de credibilidade.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                {/* Bloco 1: Entrega para todo o Brasil */}
                <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-blue-900 font-bold">
                    <Truck className="h-4 w-4 text-[#0066d6]" />
                    <span>Bloco de Entrega / Frete</span>
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Título do bloco
                    </label>
                    <input
                      type="text"
                      value={settings.trustDeliveryTitle}
                      onChange={(e) =>
                        setSettings({ ...settings, trustDeliveryTitle: e.target.value })
                      }
                      placeholder="Entrega para todo o Brasil"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-[#0066d6] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Subtítulo / Descrição rápida
                    </label>
                    <input
                      type="text"
                      value={settings.trustDeliverySubtitle}
                      onChange={(e) =>
                        setSettings({ ...settings, trustDeliverySubtitle: e.target.value })
                      }
                      placeholder="com segurança e agilidade"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-[#0066d6] focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Bloco 2: Compra 100% segura */}
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span>Bloco de Segurança / Compra Protegida</span>
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Título do bloco
                    </label>
                    <input
                      type="text"
                      value={settings.trustSecurityTitle}
                      onChange={(e) =>
                        setSettings({ ...settings, trustSecurityTitle: e.target.value })
                      }
                      placeholder="Compra 100% segura"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-[#0066d6] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Subtítulo / Descrição rápida
                    </label>
                    <input
                      type="text"
                      value={settings.trustSecuritySubtitle}
                      onChange={(e) =>
                        setSettings({ ...settings, trustSecuritySubtitle: e.target.value })
                      }
                      placeholder="seus dados protegidos"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-[#0066d6] focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Bloco 3: Parcelamento / Pagamento */}
                <div className="rounded-xl border border-purple-200 bg-purple-50/40 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-purple-900 font-bold">
                    <CreditCard className="h-4 w-4 text-purple-600" />
                    <span>Bloco de Pagamento & Parcelamento</span>
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Título do bloco
                    </label>
                    <input
                      type="text"
                      value={settings.trustInstallmentsTitle}
                      onChange={(e) =>
                        setSettings({ ...settings, trustInstallmentsTitle: e.target.value })
                      }
                      placeholder="Parcele em até 6x"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-[#0066d6] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Subtítulo / Descrição rápida
                    </label>
                    <input
                      type="text"
                      value={settings.trustInstallmentsSubtitle}
                      onChange={(e) =>
                        setSettings({ ...settings, trustInstallmentsSubtitle: e.target.value })
                      }
                      placeholder="nos principais cartões"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-[#0066d6] focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Bloco 4: Qualidade & Produtos Originais */}
                <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-amber-900 font-bold">
                    <Leaf className="h-4 w-4 text-amber-600" />
                    <span>Bloco de Qualidade / Procedência</span>
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Título do bloco
                    </label>
                    <input
                      type="text"
                      value={settings.trustQualityTitle}
                      onChange={(e) =>
                        setSettings({ ...settings, trustQualityTitle: e.target.value })
                      }
                      placeholder="Produtos originais"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-[#0066d6] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Subtítulo / Descrição rápida
                    </label>
                    <input
                      type="text"
                      value={settings.trustQualitySubtitle}
                      onChange={(e) =>
                        setSettings({ ...settings, trustQualitySubtitle: e.target.value })
                      }
                      placeholder="e de alta qualidade"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-[#0066d6] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Preview dos blocos */}
              <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4">
                <span className="text-[11px] font-bold text-gray-500 uppercase block mb-3">
                  Prévia de como os clientes verão no topo do site:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-200 rounded-lg border border-gray-200 bg-emerald-900 text-white p-2">
                  <div className="flex items-center justify-center gap-2 px-2 text-center text-[0.65rem] font-medium sm:text-xs">
                    <Truck className="h-3.5 w-3.5 shrink-0" />
                    <span>{settings.trustDeliveryTitle || "Entrega para todo o Brasil"}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 px-2 text-center text-[0.65rem] font-medium sm:text-xs">
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                    <span>{settings.trustSecurityTitle || "Compra 100% segura"}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 px-2 text-center text-[0.65rem] font-medium sm:text-xs">
                    <CreditCard className="h-3.5 w-3.5 shrink-0" />
                    <span>{settings.trustInstallmentsTitle || "Parcele em até 6x"}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 px-2 text-center text-[0.65rem] font-medium sm:text-xs">
                    <Leaf className="h-3.5 w-3.5 shrink-0" />
                    <span>{settings.trustQualityTitle || "Produtos originais"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: Textos Gerais e Barra de Avisos */}
        {activeSection === "geral" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-2xs space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-base font-bold text-gray-900">
                  Identidade e Mensagens Globais da Loja
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Ajuste o nome exibido no topo e rodapé, o slogan da marca e a barra de anúncios
                  superior.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Nome da Loja</label>
                  <input
                    type="text"
                    value={settings.storeName}
                    onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                    placeholder="Projeto Viva com Saúde"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-[#0066d6] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Slogan da Loja</label>
                  <input
                    type="text"
                    value={settings.storeSlogan}
                    onChange={(e) => setSettings({ ...settings, storeSlogan: e.target.value })}
                    placeholder="Saúde natural para uma vida melhor."
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-[#0066d6] focus:outline-hidden"
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-gray-700">
                      Barra de Anúncios no Topo do Site
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.announcementActive}
                        onChange={(e) =>
                          setSettings({ ...settings, announcementActive: e.target.checked })
                        }
                        className="h-3.5 w-3.5 rounded border-gray-300 text-[#0066d6]"
                      />
                      <span className="text-xs text-gray-600 font-medium">Exibir barra</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={settings.announcementBarText}
                    onChange={(e) =>
                      setSettings({ ...settings, announcementBarText: e.target.value })
                    }
                    placeholder="Ex: Frete grátis em compras acima de R$ 199 • Parcele em até 12x no cartão"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-[#0066d6] focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons Bar at bottom */}
        <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-5">
          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5 text-gray-500" />
            <span>Restaurar padrões de fábrica</span>
          </button>

          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              className="rounded-lg px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100"
            >
              Visualizar loja
            </a>
            <button
              type="button"
              onClick={() => handleSave()}
              className="flex items-center gap-2 rounded-lg bg-[#0066d6] px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#0052ad] transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>Salvar todas as alterações</span>
            </button>
          </div>
        </div>

        {/* Modal: Confirm Reset to Defaults */}
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95">
              <div className="flex items-start gap-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-600">
                  <RotateCcw className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Restaurar padrões de fábrica
                  </h3>
                  <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                    Tem certeza de que deseja restaurar todas as configurações para os padrões
                    originais da loja? Seus dados customizados serão redefinidos.
                  </p>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReset}
                  className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700 shadow-xs transition-colors"
                >
                  Sim, restaurar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
