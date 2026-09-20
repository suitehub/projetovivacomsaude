import { useState, type FormEvent } from "react";
import { ArrowLeft, Check, RefreshCw, AlertCircle } from "lucide-react";
import { DiscountCoupon, DiscountType, DiscountAppliesTo } from "@/data/admin-discounts-data";
import { getAllStoreProducts } from "@/data/all-store-products";

interface CouponEditorProps {
  coupon?: DiscountCoupon | null;
  onSave: (coupon: DiscountCoupon) => void;
  onCancel: () => void;
}

export function CouponEditor({ coupon, onSave, onCancel }: CouponEditorProps) {
  const isEditing = Boolean(coupon);
  const products = getAllStoreProducts();

  // Extract unique categories from store products
  const availableCategories = Array.from(
    new Set(
      products
        .flatMap((p) => (p.category ? p.category.split(",").map((c) => c.trim()) : []))
        .filter(Boolean),
    ),
  );

  // Form State
  const [code, setCode] = useState(coupon?.code || "");
  const [type, setType] = useState<DiscountType>(coupon?.type || "porcentagem");
  const [value, setValue] = useState<number>(coupon?.value ?? 0);
  const [includeShippingInDiscount, setIncludeShippingInDiscount] = useState(
    coupon?.includeShippingInDiscount || false,
  );

  // Aplicar a
  const [appliesTo, setAppliesTo] = useState<DiscountAppliesTo>(coupon?.appliesTo || "toda_loja");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    coupon?.selectedCategories || [],
  );
  const [selectedProductIds, setSelectedProductIds] = useState<(string | number)[]>(
    coupon?.selectedProductIds || [],
  );

  // Limites de uso
  const [allowCombineWithPromotions, setAllowCombineWithPromotions] = useState(
    coupon?.allowCombineWithPromotions ?? true,
  );

  // Por cupom
  const [usageLimitPerCoupon, setUsageLimitPerCoupon] = useState<"ilimitado" | "limitado">(
    coupon?.usageLimitPerCoupon || "ilimitado",
  );
  const [maxUsageTotal, setMaxUsageTotal] = useState<number>(coupon?.maxUsageTotal || 100);

  // Por cliente
  const [usageLimitPerCustomer, setUsageLimitPerCustomer] = useState<
    "ilimitado" | "limitado" | "primeira_compra"
  >(coupon?.usageLimitPerCustomer || "ilimitado");
  const [maxUsagePerCustomer, setMaxUsagePerCustomer] = useState<number>(
    coupon?.maxUsagePerCustomer || 1,
  );

  // Data
  const [dateLimit, setDateLimit] = useState<"ilimitado" | "periodo">(
    coupon?.dateLimit || "ilimitado",
  );
  const [startDate, setStartDate] = useState(
    coupon?.startDate || new Date().toISOString().split("T")[0],
  );
  const [endDate, setEndDate] = useState(
    coupon?.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  );

  // Valor do carrinho
  const [cartValueType, setCartValueType] = useState<"ilimitado" | "acima_de">(
    coupon?.cartValueType || "ilimitado",
  );
  const [minCartValue, setMinCartValue] = useState<number>(coupon?.minCartValue || 0);

  // Valor máximo de desconto
  const [maxDiscountLimit, setMaxDiscountLimit] = useState<"nenhum" | "ate">(
    coupon?.maxDiscountLimit || "nenhum",
  );
  const [maxDiscountValue, setMaxDiscountValue] = useState<number>(coupon?.maxDiscountValue || 50);

  // Error validation
  const [error, setError] = useState<string | null>(null);

  const handleGenerateRandomCode = () => {
    const prefixes = ["PROMO", "VIVA", "DESCONTO", "SAUDE", "ESPECIAL"];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomNum = Math.floor(10 + Math.random() * 90);
    setCode(`${randomPrefix}${randomNum}`);
    setError(null);
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const toggleProduct = (prodId: string | number) => {
    setSelectedProductIds((prev) =>
      prev.includes(prodId) ? prev.filter((id) => id !== prodId) : [...prev, prodId],
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();

    if (!cleanCode) {
      setError("Por favor, informe o código do cupom.");
      return;
    }

    if (type !== "frete_gratis" && (value <= 0 || isNaN(value))) {
      setError("Informe um valor de desconto válido maior que zero.");
      return;
    }

    if (appliesTo === "categorias" && selectedCategories.length === 0) {
      setError("Selecione pelo menos uma categoria para aplicar o cupom.");
      return;
    }

    if (appliesTo === "produtos" && selectedProductIds.length === 0) {
      setError("Selecione pelo menos um produto para aplicar o cupom.");
      return;
    }

    const savedCoupon: DiscountCoupon = {
      id: coupon?.id || `cupom-${Date.now()}`,
      code: cleanCode,
      type,
      value: type === "frete_gratis" ? 0 : Number(value),
      includeShippingInDiscount,
      appliesTo,
      selectedCategories: appliesTo === "categorias" ? selectedCategories : undefined,
      selectedProductIds: appliesTo === "produtos" ? selectedProductIds : undefined,
      allowCombineWithPromotions,
      usageLimitPerCoupon,
      maxUsageTotal: usageLimitPerCoupon === "limitado" ? Number(maxUsageTotal) : undefined,
      usageLimitPerCustomer,
      maxUsagePerCustomer:
        usageLimitPerCustomer === "limitado" ? Number(maxUsagePerCustomer) : undefined,
      dateLimit,
      startDate: dateLimit === "periodo" ? startDate : undefined,
      endDate: dateLimit === "periodo" ? endDate : undefined,
      cartValueType: minCartValue > 0 ? "acima_de" : cartValueType,
      minCartValue: Number(minCartValue) || 0,
      maxDiscountLimit,
      maxDiscountValue: maxDiscountLimit === "ate" ? Number(maxDiscountValue) : undefined,
      active: coupon?.active ?? true,
      usedCount: coupon?.usedCount || 0,
      createdAt: coupon?.createdAt || new Date().toLocaleDateString("pt-BR"),
    };

    onSave(savedCoupon);
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-6 pb-16">
      {/* Top Breadcrumb & Title */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors w-fit"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Voltar para Cupons de Desconto</span>
        </button>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {isEditing ? `Editar cupom: ${coupon?.code}` : "Criar cupom"}
          </h1>
          <button
            type="button"
            onClick={handleGenerateRandomCode}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-[#0066d6] hover:underline"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Gerar código aleatório</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Card 1: Código do cupom */}
      <div className="rounded-xl border border-[#e6e8ee] bg-white p-5 sm:p-6 shadow-xs">
        <label htmlFor="coupon-code" className="block text-base font-bold text-gray-900 mb-2">
          Código do cupom
        </label>
        <div className="relative">
          <input
            id="coupon-code"
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError(null);
            }}
            placeholder="Ex.: JANEIROPROMO"
            className="h-11 w-full rounded-md border border-gray-300 bg-white px-3.5 text-base font-bold tracking-wider text-gray-900 uppercase placeholder:normal-case placeholder:font-normal placeholder:text-gray-400 focus:border-[#0066d6] focus:outline-none focus:ring-1 focus:ring-[#0066d6]"
          />
        </div>
        <p className="mt-2 text-xs text-gray-500">
          este é o código que seu cliente deverá inserir no momento da compra.
        </p>
      </div>

      {/* Card 2: Tipo de desconto */}
      <div className="rounded-xl border border-[#e6e8ee] bg-white p-5 sm:p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-gray-900">Tipo de desconto</h2>

        {/* Segmented Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setType("porcentagem")}
            className={`rounded-md px-3.5 py-2 text-xs font-medium transition-colors ${
              type === "porcentagem"
                ? "bg-[#0066d6] text-white shadow-xs"
                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            porcentagem
          </button>
          <button
            type="button"
            onClick={() => setType("valor_fixo")}
            className={`rounded-md px-3.5 py-2 text-xs font-medium transition-colors ${
              type === "valor_fixo"
                ? "bg-[#0066d6] text-white shadow-xs"
                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            valor fixo
          </button>
          <button
            type="button"
            onClick={() => setType("frete_gratis")}
            className={`rounded-md px-3.5 py-2 text-xs font-medium transition-colors ${
              type === "frete_gratis"
                ? "bg-[#0066d6] text-white shadow-xs"
                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            frete grátis
          </button>
        </div>

        {/* Input depending on Type */}
        {type === "porcentagem" && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              qual a porcentagem de desconto?
            </label>
            <div className="relative w-full sm:w-64">
              <input
                type="number"
                min="1"
                max="100"
                value={value || ""}
                onChange={(e) => setValue(Number(e.target.value))}
                placeholder="0"
                className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 pr-8 text-sm font-semibold text-gray-900 focus:border-[#0066d6] focus:outline-none focus:ring-1 focus:ring-[#0066d6]"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">
                %
              </span>
            </div>
          </div>
        )}

        {type === "valor_fixo" && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              qual o valor do desconto?
            </label>
            <div className="relative w-full sm:w-64">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">
                R$
              </span>
              <input
                type="number"
                min="0.5"
                step="0.01"
                value={value || ""}
                onChange={(e) => setValue(Number(e.target.value))}
                placeholder="0,00"
                className="h-10 w-full rounded-md border border-gray-300 bg-white pl-10 pr-3 text-sm font-semibold text-gray-900 focus:border-[#0066d6] focus:outline-none focus:ring-1 focus:ring-[#0066d6]"
              />
            </div>
          </div>
        )}

        {type === "frete_gratis" && (
          <div className="rounded-md bg-blue-50 border border-blue-100 p-3 text-xs text-[#0066d6]">
            Este cupom concederá <strong>100% de desconto no valor do frete</strong> para os
            clientes.
          </div>
        )}

        {/* Checkbox: Incluir custo de envio */}
        <div className="pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-gray-700">
            <input
              type="checkbox"
              checked={includeShippingInDiscount}
              onChange={(e) => setIncludeShippingInDiscount(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-[#0066d6] focus:ring-[#0066d6]"
            />
            <span>Incluir o custo de envio no desconto</span>
          </label>
        </div>
      </div>

      {/* Card 3: Aplicar a */}
      <div className="rounded-xl border border-[#e6e8ee] bg-white p-5 sm:p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-gray-900">Aplicar a</h2>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setAppliesTo("toda_loja")}
            className={`rounded-md px-3.5 py-2 text-xs font-medium transition-colors ${
              appliesTo === "toda_loja"
                ? "bg-[#0066d6] text-white shadow-xs"
                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            toda a loja
          </button>
          <button
            type="button"
            onClick={() => setAppliesTo("categorias")}
            className={`rounded-md px-3.5 py-2 text-xs font-medium transition-colors ${
              appliesTo === "categorias"
                ? "bg-[#0066d6] text-white shadow-xs"
                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            categorias
          </button>
          <button
            type="button"
            onClick={() => setAppliesTo("produtos")}
            className={`rounded-md px-3.5 py-2 text-xs font-medium transition-colors ${
              appliesTo === "produtos"
                ? "bg-[#0066d6] text-white shadow-xs"
                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            produtos
          </button>
        </div>

        {appliesTo === "toda_loja" && (
          <p className="text-xs text-gray-500">
            o cupom poderá ser usado em todos os produtos de todas as categorias da loja.
          </p>
        )}

        {appliesTo === "categorias" && (
          <div className="space-y-2 pt-1">
            <p className="text-xs font-semibold text-gray-700">
              Selecione as categorias que recebem o desconto:
            </p>
            <div className="flex flex-wrap gap-2">
              {availableCategories.map((cat) => {
                const selected = selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-colors ${
                      selected
                        ? "bg-[#0066d6] text-white font-semibold"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {selected && <Check className="h-3 w-3" />}
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>
            {selectedCategories.length === 0 && (
              <p className="text-[11px] text-amber-600">
                Nenhuma categoria selecionada. Clique nas categorias acima.
              </p>
            )}
          </div>
        )}

        {appliesTo === "produtos" && (
          <div className="space-y-2 pt-1">
            <p className="text-xs font-semibold text-gray-700">
              Selecione os produtos que recebem o desconto:
            </p>
            <div className="max-h-56 overflow-y-auto space-y-1.5 rounded-md border border-gray-200 p-2">
              {products.map((prod) => {
                const selected = selectedProductIds.includes(prod.id);
                return (
                  <label
                    key={prod.id}
                    className={`flex items-center justify-between rounded p-2 text-xs cursor-pointer transition-colors ${
                      selected ? "bg-blue-50 text-blue-900" : "hover:bg-gray-50 text-gray-800"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleProduct(prod.id)}
                        className="h-4 w-4 rounded border-gray-300 text-[#0066d6] focus:ring-[#0066d6]"
                      />
                      <span className="font-medium line-clamp-1">{prod.name}</span>
                    </div>
                    <span className="font-semibold text-gray-600 shrink-0">
                      R$ {prod.price.toFixed(2)}
                    </span>
                  </label>
                );
              })}
            </div>
            <p className="text-[11px] text-gray-500">
              {selectedProductIds.length} produto(s) selecionado(s)
            </p>
          </div>
        )}
      </div>

      {/* Card 4: Limites de uso */}
      <div className="rounded-xl border border-[#e6e8ee] bg-white p-5 sm:p-6 shadow-xs space-y-5">
        <div>
          <h2 className="text-base font-bold text-gray-900">Limites de uso</h2>
          <p className="text-xs text-gray-500 mt-0.5">Defina as condições do seu cupom.</p>
        </div>

        {/* Checkbox: Permitir combinar com outras promoções */}
        <div className="pt-1">
          <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-gray-800 font-medium">
            <input
              type="checkbox"
              checked={allowCombineWithPromotions}
              onChange={(e) => setAllowCombineWithPromotions(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#0066d6] focus:ring-[#0066d6]"
            />
            <span>
              Permitir combinar com outras promoções. Ex.: preço promocional, frete grátis e outras.
            </span>
          </label>
        </div>

        {/* Sub-row: Por cupom */}
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <p className="text-xs font-bold text-gray-900">Por cupom</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setUsageLimitPerCoupon("ilimitado")}
              className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors ${
                usageLimitPerCoupon === "ilimitado"
                  ? "bg-[#0066d6] text-white shadow-xs"
                  : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              ilimitado
            </button>
            <button
              type="button"
              onClick={() => setUsageLimitPerCoupon("limitado")}
              className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors ${
                usageLimitPerCoupon === "limitado"
                  ? "bg-[#0066d6] text-white shadow-xs"
                  : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              limitado
            </button>
          </div>
          {usageLimitPerCoupon === "limitado" && (
            <div className="pt-1">
              <label className="block text-[11px] text-gray-600 mb-1">
                Quantidade máxima de utilizações totais do cupom:
              </label>
              <input
                type="number"
                min="1"
                value={maxUsageTotal}
                onChange={(e) => setMaxUsageTotal(Number(e.target.value))}
                className="h-9 w-40 rounded-md border border-gray-300 bg-white px-3 text-xs text-gray-900 focus:border-[#0066d6] focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Sub-row: Por cliente */}
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <p className="text-xs font-bold text-gray-900">Por cliente</p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setUsageLimitPerCustomer("ilimitado")}
              className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors ${
                usageLimitPerCustomer === "ilimitado"
                  ? "bg-[#0066d6] text-white shadow-xs"
                  : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              ilimitado
            </button>
            <button
              type="button"
              onClick={() => setUsageLimitPerCustomer("limitado")}
              className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors ${
                usageLimitPerCustomer === "limitado"
                  ? "bg-[#0066d6] text-white shadow-xs"
                  : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              limitado
            </button>
            <button
              type="button"
              onClick={() => setUsageLimitPerCustomer("primeira_compra")}
              className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors ${
                usageLimitPerCustomer === "primeira_compra"
                  ? "bg-[#0066d6] text-white shadow-xs"
                  : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              primeira compra
            </button>
          </div>
          {usageLimitPerCustomer === "limitado" && (
            <div className="pt-1">
              <label className="block text-[11px] text-gray-600 mb-1">
                Usos máximos por CPF/e-mail do cliente:
              </label>
              <input
                type="number"
                min="1"
                value={maxUsagePerCustomer}
                onChange={(e) => setMaxUsagePerCustomer(Number(e.target.value))}
                className="h-9 w-40 rounded-md border border-gray-300 bg-white px-3 text-xs text-gray-900 focus:border-[#0066d6] focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Sub-row: Data */}
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <p className="text-xs font-bold text-gray-900">Data</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDateLimit("ilimitado")}
              className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors ${
                dateLimit === "ilimitado"
                  ? "bg-[#0066d6] text-white shadow-xs"
                  : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              ilimitado
            </button>
            <button
              type="button"
              onClick={() => setDateLimit("periodo")}
              className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors ${
                dateLimit === "periodo"
                  ? "bg-[#0066d6] text-white shadow-xs"
                  : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              período
            </button>
          </div>
          {dateLimit === "periodo" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] text-gray-600 mb-1">Data de início:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-xs text-gray-900 focus:border-[#0066d6] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-600 mb-1">Data de término:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-xs text-gray-900 focus:border-[#0066d6] focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Sub-row: Valor do carrinho */}
        <div className="space-y-1.5 pt-2 border-t border-gray-100">
          <p className="text-xs font-bold text-gray-900">Valor do carrinho</p>
          <label className="block text-[11px] text-gray-600">Acima de</label>
          <div className="relative w-full sm:w-64">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
              R$
            </span>
            <input
              type="number"
              min="0"
              step="1"
              value={minCartValue}
              onChange={(e) => {
                const val = Number(e.target.value);
                setMinCartValue(val);
                setCartValueType(val > 0 ? "acima_de" : "ilimitado");
              }}
              placeholder="0"
              className="h-9 w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 text-xs font-semibold text-gray-900 focus:border-[#0066d6] focus:outline-none focus:ring-1 focus:ring-[#0066d6]"
            />
          </div>
          <p className="text-[11px] text-gray-500">não se aplica aos custos de envio</p>
        </div>

        {/* Sub-row: Valor máximo de desconto */}
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <p className="text-xs font-bold text-gray-900">Valor máximo de desconto</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMaxDiscountLimit("nenhum")}
              className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors ${
                maxDiscountLimit === "nenhum"
                  ? "bg-[#0066d6] text-white shadow-xs"
                  : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              nenhum
            </button>
            <button
              type="button"
              onClick={() => setMaxDiscountLimit("ate")}
              className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors ${
                maxDiscountLimit === "ate"
                  ? "bg-[#0066d6] text-white shadow-xs"
                  : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              até
            </button>
          </div>
          {maxDiscountLimit === "ate" && (
            <div className="relative w-full sm:w-64 pt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
                R$
              </span>
              <input
                type="number"
                min="1"
                step="0.5"
                value={maxDiscountValue}
                onChange={(e) => setMaxDiscountValue(Number(e.target.value))}
                placeholder="50,00"
                className="h-9 w-full rounded-md border border-gray-300 bg-white pl-9 pr-3 text-xs font-semibold text-gray-900 focus:border-[#0066d6] focus:outline-none focus:ring-1 focus:ring-[#0066d6]"
              />
            </div>
          )}
        </div>
      </div>

      {/* Bottom Footer Action Bar matching screenshot */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 bg-white px-5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-xs transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="rounded-md bg-[#0066d6] px-6 py-2 text-xs font-semibold text-white hover:bg-[#0052b3] shadow-xs transition-colors"
        >
          {isEditing ? "Salvar alterações" : "Criar"}
        </button>
      </div>
    </form>
  );
}
