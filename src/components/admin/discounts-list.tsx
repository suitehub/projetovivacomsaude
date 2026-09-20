import { useState, useEffect, useMemo } from "react";
import {
  Copy,
  Download,
  Filter,
  MoreVertical,
  Percent,
  Plus,
  Search,
  Tag,
  Trash2,
  CheckCircle2,
  Edit2,
  CopyPlus,
  AlertCircle,
  Truck,
  Check,
} from "lucide-react";
import { DiscountCoupon, getAdminCoupons, saveAdminCoupons } from "@/data/admin-discounts-data";
import { CouponEditor } from "./coupon-editor";

export function DiscountsList() {
  const [coupons, setCoupons] = useState<DiscountCoupon[]>(() => getAdminCoupons());
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [editingCoupon, setEditingCoupon] = useState<DiscountCoupon | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "todos" | "ativos" | "pausados" | "porcentagem" | "valor_fixo" | "frete_gratis"
  >("todos");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // Sync listener
  useEffect(() => {
    const handleUpdate = () => {
      setCoupons(getAdminCoupons());
    };
    window.addEventListener("viva_admin_coupons_updated", handleUpdate);
    return () => window.removeEventListener("viva_admin_coupons_updated", handleUpdate);
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleToggleActive = (id: string) => {
    const updated = coupons.map((c) => {
      if (c.id === id) {
        const nextState = !c.active;
        showNotification(
          nextState
            ? `Cupom ${c.code} ativado com sucesso!`
            : `Cupom ${c.code} pausado com sucesso.`,
        );
        return { ...c, active: nextState };
      }
      return c;
    });
    setCoupons(updated);
    saveAdminCoupons(updated);
  };

  const handleDelete = (id: string) => {
    const updated = coupons.filter((c) => c.id !== id);
    setCoupons(updated);
    saveAdminCoupons(updated);
    setSelectedIds((prev) => prev.filter((item) => item !== id));
    setDeleteConfirmId(null);
    showNotification("Cupom excluído com sucesso.");
  };

  const handleDuplicate = (coupon: DiscountCoupon) => {
    const duplicate: DiscountCoupon = {
      ...coupon,
      id: `cupom-${Date.now()}`,
      code: `${coupon.code}_COPIA`,
      usedCount: 0,
      createdAt: new Date().toLocaleDateString("pt-BR"),
      active: true,
    };
    const updated = [duplicate, ...coupons];
    setCoupons(updated);
    saveAdminCoupons(updated);
    showNotification(`Cupom ${duplicate.code} duplicado com sucesso!`);
    setActiveDropdownId(null);
  };

  const handleSaveCoupon = (saved: DiscountCoupon) => {
    const exists = coupons.some((c) => c.id === saved.id);
    let updated: DiscountCoupon[];
    if (exists) {
      updated = coupons.map((c) => (c.id === saved.id ? saved : c));
      showNotification(`Cupom ${saved.code} atualizado com sucesso!`);
    } else {
      updated = [saved, ...coupons];
      showNotification(`Cupom ${saved.code} criado com sucesso!`);
    }
    setCoupons(updated);
    saveAdminCoupons(updated);
    setView("list");
    setEditingCoupon(null);
  };

  // Filtered list
  const filteredCoupons = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return coupons.filter((c) => {
      // Search
      const matchesSearch =
        !term ||
        c.code.toLowerCase().includes(term) ||
        c.type.toLowerCase().includes(term) ||
        c.appliesTo.toLowerCase().includes(term);

      if (!matchesSearch) return false;

      // Status pill filter
      if (statusFilter === "ativos") return c.active;
      if (statusFilter === "pausados") return !c.active;
      if (statusFilter === "porcentagem") return c.type === "porcentagem";
      if (statusFilter === "valor_fixo") return c.type === "valor_fixo";
      if (statusFilter === "frete_gratis") return c.type === "frete_gratis";

      return true;
    });
  }, [coupons, searchTerm, statusFilter]);

  // Bulk actions
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCoupons.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCoupons.map((c) => c.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleBulkToggle = (active: boolean) => {
    const updated = coupons.map((c) => (selectedIds.includes(c.id) ? { ...c, active } : c));
    setCoupons(updated);
    saveAdminCoupons(updated);
    showNotification(
      `${selectedIds.length} cupom(ns) ${active ? "ativados" : "pausados"} com sucesso.`,
    );
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    const updated = coupons.filter((c) => !selectedIds.includes(c.id));
    setCoupons(updated);
    saveAdminCoupons(updated);
    showNotification(`${selectedIds.length} cupom(ns) excluídos.`);
    setSelectedIds([]);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const header = "Código,Tipo,Valor,Aplicação,Status,Usos,Mínimo Carrinho,Criado em\n";
    const rows = coupons
      .map(
        (c) =>
          `"${c.code}","${c.type}","${c.value}","${c.appliesTo}","${c.active ? "Ativo" : "Pausado"}","${c.usedCount}","R$ ${c.minCartValue.toFixed(2)}","${c.createdAt}"`,
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cupons_nuvemshop_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  // Statistics
  const activeCount = coupons.filter((c) => c.active).length;
  const totalUses = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);
  const percentageCount = coupons.filter((c) => c.type === "porcentagem").length;
  const fixedCount = coupons.filter((c) => c.type === "valor_fixo").length;
  const freeShippingCount = coupons.filter((c) => c.type === "frete_gratis").length;

  if (view === "create" || view === "edit") {
    return (
      <CouponEditor
        coupon={editingCoupon}
        onSave={handleSaveCoupon}
        onCancel={() => {
          setView("list");
          setEditingCoupon(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-[#0066d6] px-4 py-3 text-xs font-semibold text-white shadow-lg animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-baseline gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Cupons de desconto
          </h1>
          <span className="text-xs font-medium text-gray-500">{activeCount} ativos</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Exportar lista */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-xs hover:bg-gray-50 transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-gray-500" />
            <span>Exportar lista</span>
          </button>

          {/* Criar cupom de desconto */}
          <button
            type="button"
            onClick={() => {
              setEditingCoupon(null);
              setView("create");
            }}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#0066d6] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#0052b3] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Criar cupom de desconto</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Nuvemshop Style */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-[#e6e8ee] bg-white p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Cupons ativos</span>
            <Tag className="h-4 w-4 text-[#0066d6]" />
          </div>
          <div className="mt-1 text-xl font-bold text-gray-900">
            {activeCount}{" "}
            <span className="text-xs font-normal text-gray-500">/ {coupons.length}</span>
          </div>
        </div>

        <div className="rounded-lg border border-[#e6e8ee] bg-white p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Total de utilizações</span>
            <Percent className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-1 text-xl font-bold text-gray-900">{totalUses} usos</div>
        </div>

        <div className="rounded-lg border border-[#e6e8ee] bg-white p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Porcentagem</span>
            <span className="rounded bg-blue-50 px-1 text-[10px] font-bold text-[#0066d6]">%</span>
          </div>
          <div className="mt-1 text-xl font-bold text-gray-900">{percentageCount} cupons</div>
        </div>

        <div className="rounded-lg border border-[#e6e8ee] bg-white p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Frete grátis</span>
            <Truck className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-1 text-xl font-bold text-gray-900">{freeShippingCount} cupons</div>
        </div>
      </div>

      {/* Filter and Status Pill Tabs */}
      <div className="flex flex-col gap-3 rounded-lg border border-[#e6e8ee] bg-white p-3 shadow-xs lg:flex-row lg:items-center lg:justify-between">
        {/* Search input */}
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por código ou tipo"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 w-full rounded-md border border-gray-200 bg-[#f9fafb] pl-9 pr-3 text-xs text-gray-700 placeholder-gray-400 focus:bg-white focus:border-[#0066d6] focus:outline-none"
          />
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setStatusFilter("todos")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-colors ${
              statusFilter === "todos"
                ? "bg-blue-100 text-[#0066d6] font-semibold"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium"
            }`}
          >
            <span>Todos</span>
            <span className="rounded-full bg-gray-200/80 px-1.5 py-0.2 text-[10px] font-bold text-gray-700">
              {coupons.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("ativos")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-colors ${
              statusFilter === "ativos"
                ? "bg-blue-100 text-[#0066d6] font-semibold"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium"
            }`}
          >
            <span>Ativos</span>
            <span className="rounded-full bg-gray-200/80 px-1.5 py-0.2 text-[10px] font-bold text-gray-700">
              {activeCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("pausados")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-colors ${
              statusFilter === "pausados"
                ? "bg-blue-100 text-[#0066d6] font-semibold"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium"
            }`}
          >
            <span>Pausados</span>
            <span className="rounded-full bg-gray-200/80 px-1.5 py-0.2 text-[10px] font-bold text-gray-700">
              {coupons.length - activeCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("porcentagem")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-colors ${
              statusFilter === "porcentagem"
                ? "bg-blue-100 text-[#0066d6] font-semibold"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium"
            }`}
          >
            <span>Porcentagem</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("valor_fixo")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-colors ${
              statusFilter === "valor_fixo"
                ? "bg-blue-100 text-[#0066d6] font-semibold"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium"
            }`}
          >
            <span>Valor fixo</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("frete_gratis")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-colors ${
              statusFilter === "frete_gratis"
                ? "bg-blue-100 text-[#0066d6] font-semibold"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium"
            }`}
          >
            <span>Frete grátis</span>
          </button>
        </div>
      </div>

      {/* Bulk action bar if items selected */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between rounded-lg bg-blue-50 border border-blue-200 px-4 py-2.5 text-xs text-[#0066d6]">
          <span className="font-semibold">{selectedIds.length} cupom(ns) selecionado(s)</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleBulkToggle(true)}
              className="rounded bg-white px-2.5 py-1 font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 border border-gray-200"
            >
              Ativar
            </button>
            <button
              type="button"
              onClick={() => handleBulkToggle(false)}
              className="rounded bg-white px-2.5 py-1 font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 border border-gray-200"
            >
              Pausar
            </button>
            <button
              type="button"
              onClick={handleBulkDelete}
              className="rounded bg-red-600 px-2.5 py-1 font-semibold text-white shadow-2xs hover:bg-red-700"
            >
              Excluir
            </button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="overflow-x-auto rounded-lg border border-[#e6e8ee] bg-white shadow-xs">
        <table className="w-full text-left text-xs text-gray-700">
          <thead className="border-b border-[#e6e8ee] bg-[#f9fafb] text-[11px] font-semibold text-gray-500">
            <tr>
              <th className="w-10 px-3 py-3">
                <input
                  type="checkbox"
                  checked={
                    filteredCoupons.length > 0 && selectedIds.length === filteredCoupons.length
                  }
                  onChange={toggleSelectAll}
                  className="h-3.5 w-3.5 rounded border-gray-300 text-[#0066d6] focus:ring-[#0066d6]"
                />
              </th>
              <th className="px-3 py-3">Código do cupom</th>
              <th className="px-3 py-3">Desconto</th>
              <th className="px-3 py-3">Aplicação</th>
              <th className="px-3 py-3">Condições</th>
              <th className="px-3 py-3">Usos</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0f2f5]">
            {filteredCoupons.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-gray-400">
                  <div className="flex flex-col items-center justify-center">
                    <Tag className="h-9 w-9 text-gray-300 mb-2" />
                    <p className="font-semibold text-gray-700">Nenhum cupom encontrado</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {searchTerm
                        ? "Tente buscar por outro termo ou limpe os filtros."
                        : "Clique em 'Criar cupom de desconto' para adicionar seu primeiro cupom."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredCoupons.map((coupon) => {
                const isSelected = selectedIds.includes(coupon.id);
                return (
                  <tr
                    key={coupon.id}
                    className={`transition-colors ${
                      isSelected ? "bg-blue-50/60" : "hover:bg-gray-50/80"
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(coupon.id)}
                        className="h-3.5 w-3.5 rounded border-gray-300 text-[#0066d6] focus:ring-[#0066d6]"
                      />
                    </td>

                    {/* Código do cupom */}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold tracking-wider text-gray-900 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                          {coupon.code}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(coupon.code)}
                          title="Copiar código"
                          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                        >
                          {copiedCode === coupon.code ? (
                            <Check className="h-3 w-3 text-emerald-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                      <span className="text-[10px] text-gray-400 mt-0.5 block">
                        Criado em {coupon.createdAt}
                      </span>
                    </td>

                    {/* Desconto */}
                    <td className="px-3 py-3">
                      <div className="font-semibold text-gray-900">
                        {coupon.type === "porcentagem" && (
                          <span className="inline-flex items-center gap-1 text-emerald-700">
                            <span className="rounded bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 font-bold">
                              {coupon.value}% OFF
                            </span>
                          </span>
                        )}
                        {coupon.type === "valor_fixo" && (
                          <span className="inline-flex items-center gap-1 text-blue-700">
                            <span className="rounded bg-blue-50 border border-blue-200 px-1.5 py-0.5 font-bold">
                              R$ {coupon.value.toFixed(2)} OFF
                            </span>
                          </span>
                        )}
                        {coupon.type === "frete_gratis" && (
                          <span className="inline-flex items-center gap-1 text-amber-700">
                            <span className="rounded bg-amber-50 border border-amber-200 px-1.5 py-0.5 font-bold flex items-center gap-1">
                              <Truck className="h-3 w-3" />
                              Frete Grátis
                            </span>
                          </span>
                        )}
                      </div>
                      {coupon.includeShippingInDiscount && (
                        <span className="text-[10px] text-gray-400 block mt-0.5">
                          Inclui custo de envio
                        </span>
                      )}
                    </td>

                    {/* Aplicação */}
                    <td className="px-3 py-3">
                      {coupon.appliesTo === "toda_loja" && (
                        <span className="text-xs text-gray-700">Toda a loja</span>
                      )}
                      {coupon.appliesTo === "categorias" && (
                        <div>
                          <span className="text-xs font-medium text-gray-700">Categorias</span>
                          <span className="text-[10px] text-gray-400 block truncate max-w-44">
                            {coupon.selectedCategories?.join(", ") || "Selecionadas"}
                          </span>
                        </div>
                      )}
                      {coupon.appliesTo === "produtos" && (
                        <div>
                          <span className="text-xs font-medium text-gray-700">Produtos</span>
                          <span className="text-[10px] text-gray-400 block">
                            {coupon.selectedProductIds?.length || 0} produto(s)
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Condições */}
                    <td className="px-3 py-3">
                      <div className="space-y-0.5 text-[11px] text-gray-600">
                        {coupon.minCartValue > 0 ? (
                          <div>Mínimo: R$ {coupon.minCartValue.toFixed(2)}</div>
                        ) : (
                          <div>Sem valor mínimo</div>
                        )}
                        {coupon.usageLimitPerCustomer === "primeira_compra" && (
                          <span className="inline-block rounded bg-purple-50 text-purple-700 font-semibold px-1 text-[9px] border border-purple-200">
                            1ª compra
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Usos */}
                    <td className="px-3 py-3">
                      <div className="font-semibold text-gray-900">
                        {coupon.usedCount}
                        {coupon.usageLimitPerCoupon === "limitado" && coupon.maxUsageTotal && (
                          <span className="text-[10px] font-normal text-gray-400">
                            {" "}
                            / {coupon.maxUsageTotal}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 block">
                        {coupon.dateLimit === "periodo" && coupon.endDate
                          ? `Até ${coupon.endDate.split("-").reverse().join("/")}`
                          : "Sem prazo"}
                      </span>
                    </td>

                    {/* Status Toggle Switch */}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={coupon.active}
                          onClick={() => handleToggleActive(coupon.id)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            coupon.active ? "bg-[#0066d6]" : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                              coupon.active ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                        <span
                          className={`text-[11px] font-semibold ${
                            coupon.active ? "text-emerald-700" : "text-gray-400"
                          }`}
                        >
                          {coupon.active ? "Ativo" : "Pausado"}
                        </span>
                      </div>
                    </td>

                    {/* Ações */}
                    <td className="px-3 py-3 text-right">
                      <div className="relative inline-block text-left">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCoupon(coupon);
                              setView("edit");
                            }}
                            title="Editar cupom"
                            className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-[#0066d6] transition-colors"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDuplicate(coupon)}
                            title="Duplicar cupom"
                            className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                          >
                            <CopyPlus className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(coupon.id)}
                            title="Excluir cupom"
                            className="rounded p-1 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-5 shadow-xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-gray-900">Excluir cupom?</h3>
            <p className="mt-2 text-xs text-gray-600">
              Esta ação não pode ser desfeita. Clientes que utilizarem este código não receberão
              mais o desconto.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-md border border-gray-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="rounded-md bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 shadow-xs"
              >
                Confirmar exclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
