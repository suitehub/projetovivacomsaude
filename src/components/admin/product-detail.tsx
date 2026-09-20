import { useState, useRef } from "react";
import {
  ArrowLeft,
  Check,
  ExternalLink,
  Info,
  MoreVertical,
  Plus,
  Trash2,
  Upload,
  X,
  Image as ImageIcon,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { AdminProductItem, PRESET_STORE_CATEGORIES } from "@/data/admin-products-data";
import { slugify } from "@/data/all-store-products";
import productsImage from "@/assets/viva-products.jpg";

interface ProductDetailProps {
  product: AdminProductItem;
  onBack: () => void;
  onSave: (updated: AdminProductItem, andExit?: boolean) => void;
  onDelete?: (id: string) => void;
}

export function ProductDetail({ product, onBack, onSave, onDelete }: ProductDetailProps) {
  const [formData, setFormData] = useState<AdminProductItem>(() => ({
    ...product,
    urlSlug: product.urlSlug || slugify(product.name) || product.id,
    displayInStore: product.displayInStore !== false,
    visibility: product.visibility || "Visível",
    images: product.images || (product.imageUrl ? [product.imageUrl] : []),
  }));
  const [priceStr, setPriceStr] = useState<string>(product.price ? String(product.price) : "");
  const [promotionalPriceStr, setPromotionalPriceStr] = useState<string>(
    product.promotionalPrice ? String(product.promotionalPrice) : "",
  );
  const [costStr, setCostStr] = useState<string>(product.cost ? String(product.cost) : "");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeCategoryInput, setActiveCategoryInput] = useState("");
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showInfoBanner, setShowInfoBanner] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Variations manager state
  const [variations, setVariations] = useState<
    { id: string; name: string; value: string; price: string; stock: string }[]
  >([]);
  const [showVariationForm, setShowVariationForm] = useState(false);
  const [varNameInput, setVarNameInput] = useState("");
  const [varValueInput, setVarValueInput] = useState("");

  const categoriesList = formData.categories
    ? formData.categories
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)
    : [];

  const handleToggleCategory = (catToToggle: string) => {
    let updated: string[];
    if (categoriesList.includes(catToToggle)) {
      updated = categoriesList.filter((c) => c !== catToToggle);
    } else {
      updated = [...categoriesList, catToToggle];
    }
    setFormData({ ...formData, categories: updated.join(", ") });
  };

  const handleRemoveCategory = (catToRemove: string) => {
    const updated = categoriesList.filter((c) => c !== catToRemove).join(", ");
    setFormData({ ...formData, categories: updated });
  };

  const handleAddCategory = () => {
    if (!activeCategoryInput.trim()) return;
    const cat = activeCategoryInput.trim();
    if (!categoriesList.includes(cat)) {
      const updated = [...categoriesList, cat].join(", ");
      setFormData({ ...formData, categories: updated });
    }
    setActiveCategoryInput("");
  };

  // Image Uploading & Drag and Drop Handlers
  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);

    fileArray.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          setFormData((prev) => {
            const currentImages = prev.images || [];
            const newImages = [...currentImages, result];
            return {
              ...prev,
              images: newImages,
              imageUrl: newImages[0] || prev.imageUrl,
            };
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setFormData((prev) => {
      const currentImages = prev.images || [];
      const updated = currentImages.filter((_, idx) => idx !== indexToRemove);
      return {
        ...prev,
        images: updated,
        imageUrl: updated[0] || "",
      };
    });
  };

  const handleSetMainImage = (indexToMain: number) => {
    setFormData((prev) => {
      const currentImages = [...(prev.images || [])];
      if (indexToMain >= 0 && indexToMain < currentImages.length) {
        const [chosen] = currentImages.splice(indexToMain, 1);
        currentImages.unshift(chosen);
      }
      return {
        ...prev,
        images: currentImages,
        imageUrl: currentImages[0] || "",
      };
    });
  };

  const resolvedSlug =
    slugify(formData.urlSlug) ||
    slugify(formData.name) ||
    formData.id ||
    `produto-${Date.now().toString().slice(-6)}`;

  const handleSave = (andExit = false) => {
    if (!formData.name || formData.name.trim() === "") {
      toast.error("Por favor, informe o nome do produto antes de salvar.");
      return;
    }

    const numericPrice = priceStr === "" ? 0 : parseFloat(priceStr.replace(",", ".")) || 0;
    const numericPromoPrice =
      promotionalPriceStr === "" ? 0 : parseFloat(promotionalPriceStr.replace(",", ".")) || 0;
    const numericCost = costStr === "" ? 0 : parseFloat(costStr.replace(",", ".")) || 0;

    const trimmedName = formData.name.trim();
    const cleanSlug =
      slugify(formData.urlSlug) ||
      slugify(trimmedName) ||
      formData.id ||
      `produto-${Date.now().toString().slice(-6)}`;

    const updatedProduct: AdminProductItem = {
      ...formData,
      name: trimmedName,
      urlSlug: cleanSlug,
      price: numericPrice,
      promotionalPrice: numericPromoPrice,
      cost: numericCost,
      imageUrl: (formData.images && formData.images[0]) || formData.imageUrl || "",
      displayInStore: formData.displayInStore !== false,
      visibility: formData.visibility || "Visível",
    };

    setFormData(updatedProduct);
    onSave(updatedProduct, andExit);
    setSavedSuccess(true);
    toast.success(
      andExit
        ? "Produto salvo com sucesso! Voltando para a lista de produtos..."
        : "Produto salvo com sucesso! Já está visível na loja.",
    );
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Image position styling
  const imgBgPositions = ["0%", "20%", "40%", "60%", "80%", "100%"];
  const imgBg = imgBgPositions[formData.imagePositionIndex % imgBgPositions.length];

  return (
    <div className="min-h-screen bg-[#f7f9fa] pb-16 font-sans">
      {/* Sticky top action bar */}
      <div className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 px-4 sm:px-6 py-3.5 backdrop-blur-sm shadow-xs">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={onBack}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors shrink-0"
              title="Voltar para a lista de produtos"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate max-w-[200px] sm:max-w-md">
                  {formData.name || "Novo produto"}
                </h1>
                <a
                  href={`/produto/${resolvedSlug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded p-1 text-gray-400 hover:text-[#0066d6] shrink-0"
                  title="Ver na loja"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-xs"
              >
                <span className="hidden sm:inline">Mais opções</span>
                <MoreVertical className="h-3.5 w-3.5" />
              </button>
              {showMoreMenu && (
                <div className="absolute right-0 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg z-30">
                  <a
                    href={`/produto/${resolvedSlug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex w-full items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50"
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
                    Ver produto na loja
                  </a>
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowMoreMenu(false);
                        setShowDeleteModal(true);
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      Excluir produto
                    </button>
                  )}
                </div>
              )}
            </div>

            <a
              href={`/produto/${resolvedSlug}`}
              target="_blank"
              rel="noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-xs transition-colors"
              title="Abrir página deste produto na loja em nova aba"
            >
              <Eye className="h-3.5 w-3.5 text-[#0066d6]" />
              <span>Ver na loja</span>
            </a>

            <button
              type="button"
              onClick={() => handleSave(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-xs transition-colors"
              title="Salvar produto e voltar para a lista de produtos"
            >
              <span>Salvar e voltar</span>
            </button>

            <button
              type="button"
              onClick={() => handleSave(false)}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold shadow-xs transition-all ${
                savedSuccess
                  ? "bg-emerald-600 text-white"
                  : "bg-[#0066d6] hover:bg-[#0052ad] text-white"
              }`}
            >
              <Check className="h-4 w-4" />
              <span>{savedSuccess ? "Produto salvo!" : "Salvar produto"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-6 space-y-6">
        {/* Banner: Crie campos personalizados */}
        {showInfoBanner && (
          <div className="flex items-start justify-between rounded-xl border border-blue-200 bg-blue-50/70 p-4 shadow-xs">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 shrink-0 text-[#0066d6] mt-0.5" />
              <div>
                <p className="text-sm font-bold text-gray-900">Crie campos personalizados</p>
                <p className="text-xs text-gray-600 mt-0.5">
                  Com eles você pode adicionar mais informações a seus produtos e variações.
                </p>
                <button
                  type="button"
                  className="mt-2 text-xs font-semibold text-[#0066d6] hover:underline"
                >
                  Criar campos
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowInfoBanner(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* 1. Nome e descrição */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
          <h2 className="text-base font-bold text-gray-900 mb-4">Nome e descrição</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Nome</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm font-medium text-gray-900 focus:border-[#0066d6] focus:outline-hidden focus:ring-1 focus:ring-[#0066d6]"
              />
            </div>

            <div>
              <div className="mb-1.5">
                <label className="text-xs font-semibold text-gray-700">Descrição</label>
              </div>

              {/* Rich text editor mock toolbar */}
              <div className="rounded-lg border border-gray-300 overflow-hidden">
                <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-600">
                  <span className="font-semibold text-gray-700 mr-2">Parágrafo</span>
                  <div className="h-4 w-px bg-gray-300 mx-1" />
                  <span className="cursor-pointer px-1 font-bold hover:text-black">B</span>
                  <span className="cursor-pointer px-1 italic hover:text-black">I</span>
                  <span className="cursor-pointer px-1 underline hover:text-black">U</span>
                  <div className="h-4 w-px bg-gray-300 mx-1" />
                  <span className="cursor-pointer px-1 hover:text-black">• Lista</span>
                  <span className="cursor-pointer px-1 hover:text-black">1. Lista</span>
                </div>
                <textarea
                  rows={5}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3.5 text-sm text-gray-800 focus:outline-hidden resize-y leading-relaxed"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 2. Fotos e vídeo */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-base font-bold text-gray-900">Fotos e vídeo</h2>
              <p className="text-xs text-gray-500">
                Selecione ou arraste mais de uma foto • Formatos: WEBP, PNG, JPEG ou GIF
              </p>
            </div>
            {formData.images && formData.images.length > 0 && (
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                {formData.images.length} {formData.images.length === 1 ? "foto" : "fotos"}
              </span>
            )}
          </div>

          {/* Hidden multi-file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              handleFilesSelected(e.target.files);
              e.target.value = ""; // Reset to allow selecting same file again if needed
            }}
          />

          <div className="mt-4 flex flex-wrap gap-4 items-start">
            {/* Display uploaded images */}
            {formData.images && formData.images.length > 0 ? (
              formData.images.map((imgSrc, idx) => (
                <div
                  key={idx}
                  className={`relative group w-32 h-32 rounded-lg border-2 overflow-hidden bg-gray-100 flex items-center justify-center shadow-xs transition-all ${
                    idx === 0
                      ? "border-[#0066d6] ring-2 ring-[#0066d6]/20"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <img
                    src={imgSrc}
                    alt={`Foto ${idx + 1}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {idx === 0 ? (
                    <span className="absolute bottom-1 left-1 bg-[#0066d6] text-[10px] text-white px-1.5 py-0.5 rounded-sm font-semibold shadow-xs">
                      Principal
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetMainImage(idx)}
                      className="absolute bottom-1 left-1 bg-black/70 hover:bg-[#0066d6] text-[10px] text-white px-1.5 py-0.5 rounded-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Definir principal
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-xs"
                    title="Remover foto"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            ) : (
              /* If no custom photos yet, display default preview */
              <div className="relative group w-32 h-32 rounded-lg border-2 border-[#0066d6] overflow-hidden bg-gray-100 flex items-center justify-center shadow-xs">
                <img
                  src={productsImage}
                  alt={formData.name}
                  className="w-full h-full object-cover"
                  style={{ objectPosition: imgBg }}
                  referrerPolicy="no-referrer"
                />
                <span className="absolute bottom-1 left-1 bg-black/70 text-[10px] text-white px-1.5 py-0.5 rounded-sm font-medium">
                  Padrão
                </span>
              </div>
            )}

            {/* Drag and drop upload box */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-56 h-32 rounded-lg border-2 border-dashed flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-[#0066d6] bg-blue-100/60 scale-[1.02]"
                  : "border-[#0066d6]/60 bg-blue-50/40 hover:bg-blue-50/80 hover:border-[#0066d6]"
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-[#0066d6] mb-1.5">
                <Upload className="h-4 w-4" />
              </div>
              <p className="text-xs font-semibold text-[#0066d6] leading-snug">
                Arraste e solte, ou selecione fotos do produto
              </p>
              <span className="mt-1 text-[10px] text-gray-500">Selecione 1 ou mais fotos</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5 text-gray-400" />
              <span>Você pode adicionar várias fotos e arranjar a principal</span>
            </div>
            <div>Link para vídeo externo (YouTube/Vimeo)</div>
          </div>
        </section>

        {/* 3. Preços */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
          <h2 className="text-base font-bold text-gray-900 mb-4">Preços</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Preço de venda
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm font-bold text-gray-500">R$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={priceStr}
                  onChange={(e) => setPriceStr(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 pl-10 pr-3.5 py-2 text-sm font-bold text-gray-900 focus:border-[#0066d6] focus:outline-hidden focus:ring-1 focus:ring-[#0066d6]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Preço promocional
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm font-bold text-gray-500">R$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={promotionalPriceStr}
                  onChange={(e) => setPromotionalPriceStr(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 pl-10 pr-3.5 py-2 text-sm font-bold text-gray-900 focus:border-[#0066d6] focus:outline-hidden focus:ring-1 focus:ring-[#0066d6]"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="exibir-preco"
              checked={formData.displayInStore}
              onChange={(e) => setFormData({ ...formData, displayInStore: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-[#0066d6] focus:ring-[#0066d6]"
            />
            <label htmlFor="exibir-preco" className="text-xs font-medium text-gray-700">
              Exibir o preço na loja
            </label>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 pt-4 border-t border-gray-100">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Custo</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-gray-500">R$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={costStr}
                  onChange={(e) => setCostStr(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-xs text-gray-900 focus:border-[#0066d6] focus:outline-hidden"
                />
              </div>
              <p className="mt-1 text-[11px] text-gray-400">
                É para uso interno, os seus clientes não o verão na loja.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Margem de lucro
              </label>
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2 text-xs font-semibold text-gray-500">
                {(() => {
                  const p = priceStr === "" ? 0 : parseFloat(priceStr.replace(",", ".")) || 0;
                  const promo =
                    promotionalPriceStr === ""
                      ? 0
                      : parseFloat(promotionalPriceStr.replace(",", ".")) || 0;
                  const c = costStr === "" ? 0 : parseFloat(costStr.replace(",", ".")) || 0;
                  const effective = promo > 0 ? promo : p;
                  if (c > 0 && effective > 0) {
                    return `${(((effective - c) / effective) * 100).toFixed(1)}%`;
                  }
                  return "—";
                })()}
              </div>
            </div>
          </div>
        </section>

        {/* 4. Tipo de produto */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
          <h2 className="text-base font-bold text-gray-900 mb-3">Tipo de produto</h2>
          <div className="space-y-2.5">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="radio"
                name="tipo-produto"
                checked={formData.isPhysical}
                onChange={() => setFormData({ ...formData, isPhysical: true })}
                className="h-4 w-4 text-[#0066d6] focus:ring-[#0066d6]"
              />
              <span className="text-sm font-medium text-gray-800">Físico</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="radio"
                name="tipo-produto"
                checked={!formData.isPhysical}
                onChange={() => setFormData({ ...formData, isPhysical: false })}
                className="h-4 w-4 text-[#0066d6] focus:ring-[#0066d6]"
              />
              <span className="text-sm font-medium text-gray-800">Digital / serviço</span>
            </label>
          </div>
        </section>

        {/* 5. Inventário */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
          <h2 className="text-base font-bold text-gray-900 mb-2">Inventário</h2>
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <span>{typeof formData.stock === "number" ? formData.stock : "∞ Infinito"}</span>
          </div>
          <button
            type="button"
            className="mt-2 text-xs font-semibold text-[#0066d6] hover:underline"
          >
            Ver histórico de estoque
          </button>
        </section>

        {/* 6. Códigos */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
          <h2 className="text-base font-bold text-gray-900 mb-4">Códigos</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">SKU</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="Ex: PROD-001"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-[#0066d6] focus:outline-hidden"
              />
              <p className="mt-1 text-[11px] text-gray-400">
                SKU é um código que você cria internamente para ter o controle dos seus produtos com
                variações.
              </p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Código de barras
              </label>
              <input
                type="text"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                placeholder="Ex: 7891234567890"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-[#0066d6] focus:outline-hidden"
              />
              <p className="mt-1 text-[11px] text-gray-400">
                O código de barras é composto por 13 números e serve para identificar um produto.
              </p>
            </div>
          </div>
        </section>

        {/* 7. Peso e dimensões */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
          <div className="mb-3">
            <h2 className="text-base font-bold text-gray-900">Peso e dimensões</h2>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Preencha os dados para calcular o custo de envio dos produtos e mostrar os meios de
            envio na sua loja.
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">Peso</label>
              <div className="flex items-center rounded-lg border border-gray-300 px-2.5 py-1.5 focus-within:border-[#0066d6]">
                <input
                  type="number"
                  step="0.001"
                  value={formData.weightKg}
                  onChange={(e) =>
                    setFormData({ ...formData, weightKg: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full text-xs font-semibold text-gray-900 focus:outline-hidden"
                />
                <span className="text-[11px] text-gray-400 ml-1">kg</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                Comprimento
              </label>
              <div className="flex items-center rounded-lg border border-gray-300 px-2.5 py-1.5 focus-within:border-[#0066d6]">
                <input
                  type="number"
                  step="1"
                  value={formData.lengthCm}
                  onChange={(e) =>
                    setFormData({ ...formData, lengthCm: parseFloat(e.target.value) || 1 })
                  }
                  className="w-full text-xs font-semibold text-gray-900 focus:outline-hidden"
                />
                <span className="text-[11px] text-gray-400 ml-1">cm</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">Largura</label>
              <div className="flex items-center rounded-lg border border-gray-300 px-2.5 py-1.5 focus-within:border-[#0066d6]">
                <input
                  type="number"
                  step="1"
                  value={formData.widthCm}
                  onChange={(e) =>
                    setFormData({ ...formData, widthCm: parseFloat(e.target.value) || 1 })
                  }
                  className="w-full text-xs font-semibold text-gray-900 focus:outline-hidden"
                />
                <span className="text-[11px] text-gray-400 ml-1">cm</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">Altura</label>
              <div className="flex items-center rounded-lg border border-gray-300 px-2.5 py-1.5 focus-within:border-[#0066d6]">
                <input
                  type="number"
                  step="1"
                  value={formData.heightCm}
                  onChange={(e) =>
                    setFormData({ ...formData, heightCm: parseFloat(e.target.value) || 1 })
                  }
                  className="w-full text-xs font-semibold text-gray-900 focus:outline-hidden"
                />
                <span className="text-[11px] text-gray-400 ml-1">cm</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="mt-3 text-xs font-semibold text-[#0066d6] hover:underline"
          >
            Mais sobre calcular peso e dimensões
          </button>
        </section>

        {/* 8. Categorias */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-bold text-gray-900">Categorias</h2>
              <p className="text-xs text-gray-500">
                Clique nas categorias abaixo para selecionar ou desmarcar para este produto.
              </p>
            </div>
            {categoriesList.length > 0 && (
              <span className="text-xs font-semibold text-[#641b7a] bg-[#f5e6fc] px-2.5 py-1 rounded-full">
                {categoriesList.length} selecionada{categoriesList.length > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Categorias pré-selecionáveis conforme imagem */}
          <div className="mb-4 rounded-xl border border-[#e8d5f3] bg-[#fdf9ff] p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-gray-700 mr-1.5 select-none">
                Categorias:
              </span>
              {PRESET_STORE_CATEGORIES.map((cat) => {
                const isSelected = categoriesList.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleToggleCategory(cat)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs transition-all cursor-pointer select-none ${
                      isSelected
                        ? "bg-[#8723a3] text-white shadow-xs font-semibold ring-2 ring-[#8723a3]/30"
                        : "bg-[#d8b4e2] text-[#4a155c] font-medium hover:bg-[#cfa4db] active:scale-95"
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Categorias ativas no produto */}
          {categoriesList.length > 0 && (
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Categorias selecionadas:
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {categoriesList.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-900 shadow-2xs"
                  >
                    {cat}
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(cat)}
                      className="text-purple-400 hover:text-red-500 rounded-full p-0.5"
                      title={`Remover ${cat}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Adicionar outra categoria personalizada */}
          <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
            <input
              type="text"
              placeholder="Adicionar outra categoria personalizada..."
              value={activeCategoryInput}
              onChange={(e) => setActiveCategoryInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCategory();
                }
              }}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-800 focus:border-[#0066d6] focus:outline-hidden w-64"
            />
            <button
              type="button"
              onClick={handleAddCategory}
              className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200"
            >
              <Plus className="h-3.5 w-3.5" /> Adicionar
            </button>
          </div>
        </section>

        {/* 9. Variações */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-bold text-gray-900">Variações</h2>
            <button
              type="button"
              onClick={() => setShowVariationForm(!showVariationForm)}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#0066d6] hover:underline"
            >
              <Plus className="h-4 w-4" />
              {showVariationForm ? "Fechar variações" : "Criar variações"}
            </button>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Combine diferentes propriedades do seu produto. Exemplo: quantidade de potes, tamanho ou
            dosagem.
          </p>

          {showVariationForm && (
            <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3.5 space-y-3">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    Propriedade (ex: Quantidade)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Kit, Tamanho, Sabor"
                    value={varNameInput}
                    onChange={(e) => setVarNameInput(e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-800 focus:border-[#0066d6] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    Opção (ex: 3 Frascos)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 1 Frasco, 3 Frascos, 5 Frascos"
                    value={varValueInput}
                    onChange={(e) => setVarValueInput(e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-800 focus:border-[#0066d6] focus:outline-hidden"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (!varNameInput.trim() || !varValueInput.trim()) {
                      toast.error("Preencha o nome da propriedade e a opção.");
                      return;
                    }
                    const newVar = {
                      id: `var-${Date.now()}`,
                      name: varNameInput.trim(),
                      value: varValueInput.trim(),
                      price: priceStr || "0",
                      stock: "Infinito",
                    };
                    setVariations([...variations, newVar]);
                    setVarValueInput("");
                    toast.success("Variação adicionada!");
                  }}
                  className="flex items-center gap-1 rounded-md bg-[#0066d6] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0052ad]"
                >
                  <Plus className="h-3.5 w-3.5" /> Adicionar opção
                </button>
              </div>

              {variations.length > 0 && (
                <div className="mt-2 space-y-1.5 border-t border-gray-200 pt-2">
                  <span className="block text-[11px] font-bold text-gray-600">
                    Variações cadastradas ({variations.length}):
                  </span>
                  <div className="space-y-1">
                    {variations.map((v) => (
                      <div
                        key={v.id}
                        className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs"
                      >
                        <span className="font-medium text-gray-800">
                          {v.name}: <strong className="text-[#0066d6]">{v.value}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => setVariations(variations.filter((x) => x.id !== v.id))}
                          className="text-gray-400 hover:text-red-500"
                          title="Remover variação"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* 10. SEO e busca na loja */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs space-y-4">
          <div className="mb-1">
            <h2 className="text-base font-bold text-gray-900">SEO e busca na loja</h2>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Tags</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="Adicione palavras-chave separadas por vírgula"
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-xs text-gray-900 focus:border-[#0066d6] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Marca</label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              placeholder="Ex: Projeto Viva com Saúde"
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-xs text-gray-900 focus:border-[#0066d6] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Título SEO</label>
            <input
              type="text"
              value={formData.seoTitle}
              onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
              placeholder="Ex: Mounjaro Cápsulas 100% Natural"
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-xs text-gray-900 focus:border-[#0066d6] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Descrição SEO</label>
            <textarea
              rows={2}
              value={formData.seoDescription}
              onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
              placeholder="Ex: Todo o site em promoção e frete rápido!"
              className="w-full rounded-lg border border-gray-300 p-3 text-xs text-gray-900 focus:border-[#0066d6] focus:outline-hidden"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-gray-700">
                URL / Link na loja (Slug)
              </label>
              <a
                href={`/produto/${resolvedSlug}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[0.68rem] text-[#0066d6] hover:underline"
              >
                <Eye className="h-3 w-3" />
                Visualizar link
              </a>
            </div>
            <div className="flex items-center rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-700">
              <span className="text-gray-400 select-none">/produto/</span>
              <input
                type="text"
                value={formData.urlSlug}
                onChange={(e) => setFormData({ ...formData, urlSlug: slugify(e.target.value) })}
                placeholder="nome-do-produto"
                className="w-full bg-transparent px-1 font-mono text-xs text-gray-900 focus:outline-hidden"
              />
            </div>
            <p className="mt-1 text-[0.68rem] text-gray-500">
              O produto é acessível na loja através deste endereço amigável.
            </p>
          </div>
        </section>

        {/* 11. Visibilidade */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
          <h2 className="text-base font-bold text-gray-900 mb-1">Visibilidade</h2>
          <p className="text-xs text-gray-500 mb-3">Defina como o produto aparece na loja.</p>
          <div className="inline-flex rounded-lg border border-gray-300 bg-gray-100 p-1">
            {(["Visível", "Não listado", "Oculto"] as const).map((vis) => (
              <button
                key={vis}
                type="button"
                onClick={() => setFormData({ ...formData, visibility: vis })}
                className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  formData.visibility === vis
                    ? "bg-[#0066d6] text-white shadow-xs"
                    : "text-gray-700 hover:text-black"
                }`}
              >
                {vis}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {formData.visibility === "Visível" &&
              "Aparece na loja, em buscadores e nos canais de venda conectados."}
            {formData.visibility === "Não listado" &&
              "Acessível apenas por link direto, oculto da busca da loja."}
            {formData.visibility === "Oculto" && "Totalmente invisível na loja e nos buscadores."}
          </p>
        </section>

        {/* 12. Frete */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
          <h2 className="text-base font-bold text-gray-900 mb-3">Frete</h2>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.freeShipping}
              onChange={(e) => setFormData({ ...formData, freeShipping: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-[#0066d6] focus:ring-[#0066d6]"
            />
            <span className="text-xs font-medium text-gray-800">
              Esse produto possui frete grátis
            </span>
          </label>
        </section>

        {/* Bottom actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-200">
          <div>
            {onDelete && (
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 hover:text-red-700 shadow-xs transition-colors"
              >
                <Trash2 className="h-4 w-4 text-red-600" />
                <span>Excluir produto</span>
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-xs transition-colors"
            >
              Voltar para lista
            </button>
            <a
              href={`/produto/${resolvedSlug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-xs transition-colors"
            >
              <Eye className="h-4 w-4 text-[#0066d6]" />
              Ver produto na loja
            </a>
            <button
              type="button"
              onClick={() => handleSave(true)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-xs transition-colors"
            >
              Salvar e voltar
            </button>
            <button
              type="button"
              onClick={() => handleSave(false)}
              className={`flex items-center gap-1.5 rounded-lg px-5 py-2 text-sm font-semibold shadow-xs transition-all ${
                savedSuccess
                  ? "bg-emerald-600 text-white"
                  : "bg-[#0066d6] hover:bg-[#0052ad] text-white"
              }`}
            >
              <Check className="h-4 w-4" />
              <span>{savedSuccess ? "Produto salvo!" : "Salvar produto"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red-100 text-red-600">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Excluir produto</h3>
                <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                  Tem certeza de que deseja excluir o produto{" "}
                  <strong className="text-gray-800 font-semibold">
                    "{formData.name || "Sem nome"}"
                  </strong>
                  ? Ele será removido permanentemente da loja e do catálogo.
                </p>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  if (onDelete) {
                    onDelete(formData.id);
                  }
                  toast.success("Produto excluído com sucesso!");
                  onBack();
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 shadow-xs transition-colors"
              >
                Sim, excluir produto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
