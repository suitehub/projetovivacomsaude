import React, { useState, useRef } from "react";
import { toast } from "sonner";
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  Download,
  Edit2,
  FileSpreadsheet,
  Mail,
  MessageCircle,
  MoreVertical,
  Plus,
  Search,
  Trash2,
  Upload,
  User,
  UserPlus,
  X,
} from "lucide-react";
import { AdminCustomerItem, INITIAL_ADMIN_CUSTOMERS } from "@/data/admin-customers-data";
import { exportToCustomersCsv, parseCustomersCsv } from "@/lib/nuvemshop-customers-csv";
import { CustomerDetail } from "@/components/admin/customer-detail";

interface CustomersListProps {
  onSelectCustomer?: (customer: AdminCustomerItem) => void;
}

export function CustomersList({ onSelectCustomer }: CustomersListProps) {
  const [customers, setCustomers] = useState<AdminCustomerItem[]>(() => {
    try {
      const saved = localStorage.getItem("viva_admin_customers");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (
            parsed.some(
              (c: AdminCustomerItem) => c.email === "carlos.leite@email.com" || c.id === "cust-1",
            )
          ) {
            localStorage.setItem("viva_admin_customers", JSON.stringify([]));
            return [];
          }
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_ADMIN_CUSTOMERS;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showExportImportModal, setShowExportImportModal] = useState(false);
  const [importStatusMessage, setImportStatusMessage] = useState<string | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<AdminCustomerItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<AdminCustomerItem | null>(null);

  // New customer form state
  const [newCustomerData, setNewCustomerData] = useState<Partial<AdminCustomerItem>>({
    fullName: "",
    email: "",
    cpfCnpj: "",
    phone: "",
    address: "",
    number: "",
    city: "",
    state: "",
    cep: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const saveCustomers = (updated: AdminCustomerItem[]) => {
    setCustomers(updated);
    try {
      localStorage.setItem("viva_admin_customers", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // CSV Export
  const handleExportCsv = () => {
    const csvData = exportToCustomersCsv(customers);
    const blob = new Blob(["\uFEFF" + csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `clientes_nuvemshop_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportImportModal(false);
  };

  // CSV Import
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      try {
        const imported = parseCustomersCsv(text);
        if (imported.length === 0) {
          setImportStatusMessage("Nenhum cliente válido encontrado no arquivo CSV.");
          return;
        }

        const existingMap = new Map(customers.map((c) => [c.email.toLowerCase() || c.id, c]));
        for (const item of imported) {
          const key = item.email.toLowerCase() || item.id;
          existingMap.set(key, item);
        }

        const merged = Array.from(existingMap.values());
        saveCustomers(merged);
        setImportStatusMessage(
          `Sucesso! ${imported.length} clientes importados/atualizados com êxito.`,
        );
        setTimeout(() => {
          setImportStatusMessage(null);
          setShowExportImportModal(false);
        }, 2500);
      } catch {
        setImportStatusMessage(
          "Erro ao processar o arquivo. Verifique se o formato coincide com o modelo Nuvemshop.",
        );
      }
    };
    reader.readAsText(file, "UTF-8");
  };

  // Add customer
  const handleCreateCustomer = () => {
    if (!newCustomerData.fullName || !newCustomerData.email) {
      toast.error("Por favor, preencha ao menos o nome completo e o e-mail.");
      return;
    }

    const newId = (newCustomerData.email || newCustomerData.fullName)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .slice(0, 30);

    const created: AdminCustomerItem = {
      id: newId,
      fullName: newCustomerData.fullName,
      cpfCnpj: newCustomerData.cpfCnpj || "",
      email: newCustomerData.email,
      phone: newCustomerData.phone || "",
      gender: "",
      birthDate: "",
      address: newCustomerData.address || "",
      number: newCustomerData.number || "",
      complement: "",
      city: newCustomerData.city || "São Paulo",
      neighborhood: "",
      state: newCustomerData.state || "São Paulo",
      cep: newCustomerData.cep || "",
      country: "Brasil",
      totalSpent: 0,
      purchasesCount: 0,
      lastPurchaseDate: "—",
      lastOrderNumber: "",
      registrationDate: new Date().toLocaleDateString("pt-BR"),
      registered: true,
      newsletter: false,
      marketing: "Não aceita",
      marketingUpdateDate: new Date().toLocaleDateString("pt-BR"),
      tags: "",
      notes: "",
      priceTable: "",
    };

    const updated = [created, ...customers];
    saveCustomers(updated);
    setShowAddModal(false);
    toast.success("Cliente cadastrado com sucesso!");
    setNewCustomerData({
      fullName: "",
      email: "",
      cpfCnpj: "",
      phone: "",
      address: "",
      number: "",
      city: "",
      state: "",
      cep: "",
    });
  };

  // Delete customer
  const handleDeleteCustomer = (id: string) => {
    const updated = customers.filter((c) => c.id !== id);
    saveCustomers(updated);
    toast.success("Cliente removido com sucesso!");
  };

  // Filter
  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.fullName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.cpfCnpj.includes(q) ||
      c.city.toLowerCase().includes(q)
    );
  });

  if (viewingCustomer) {
    return (
      <CustomerDetail
        customer={viewingCustomer}
        onBack={() => setViewingCustomer(null)}
        onSave={(updated) => {
          const idx = customers.findIndex((c) => c.id === updated.id);
          let updatedList: AdminCustomerItem[];
          if (idx >= 0) {
            updatedList = [...customers];
            updatedList[idx] = updated;
          } else {
            updatedList = [updated, ...customers];
          }
          saveCustomers(updatedList);
          setViewingCustomer(updated);
        }}
        onDelete={(id) => {
          handleDeleteCustomer(id);
          setViewingCustomer(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fa] pb-16 font-sans">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Top Header matching Nuvemshop screenshot */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Clientes</h1>

          <div className="flex items-center gap-2.5">
            {/* Mais opções dropdown containing Exportar e Importar */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 transition-colors"
              >
                <span>Mais opções</span>
                <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
              </button>

              {showMoreMenu && (
                <div className="absolute right-0 mt-1 w-52 rounded-xl border border-gray-200 bg-white py-1.5 shadow-xl z-30">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMoreMenu(false);
                      setShowExportImportModal(true);
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-[#0066d6] transition-colors"
                  >
                    <FileSpreadsheet className="h-4 w-4 text-gray-500" />
                    <span>Exportar e Importar</span>
                  </button>
                </div>
              )}
            </div>

            {/* Adicionar novo cliente */}
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 rounded-lg bg-[#0066d6] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#0052ad] transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Adicionar novo cliente</span>
            </button>
          </div>
        </div>

        {/* Search bar matching screenshot */}
        <div className="mb-6 max-w-full">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, e-mail ou CPF"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-10 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#0066d6] focus:outline-hidden focus:ring-1 focus:ring-[#0066d6] shadow-2xs"
            />
            <div className="absolute right-3 top-2.5 text-gray-400">
              <span className="text-[11px] font-bold">☷</span>
            </div>
          </div>
        </div>

        {/* Customers Table matching screenshot */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600 border-collapse">
              <thead className="border-b border-gray-200 bg-gray-50/70 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-5 py-3.5 min-w-[280px]">Nome</th>
                  <th className="px-5 py-3.5 min-w-[180px]">Última compra</th>
                  <th className="px-5 py-3.5 min-w-[160px]">
                    <div className="flex items-center gap-1">
                      <span>✓ Total consumido</span>
                    </div>
                  </th>
                  <th className="px-5 py-3.5 text-right min-w-[140px]">Contato</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-sm text-gray-500">
                      Nenhum cliente cadastrado ainda.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                    >
                      {/* Nome (Clicável abre o detalhe do cliente) */}
                      <td
                        className="px-5 py-4 font-bold text-[#0066d6] hover:underline"
                        onClick={() => setViewingCustomer(customer)}
                      >
                        <span>{customer.fullName}</span>
                      </td>

                      {/* Última compra (#109 05/10/2023) */}
                      <td className="px-5 py-4" onClick={() => setViewingCustomer(customer)}>
                        <div className="flex items-center gap-2">
                          {customer.lastOrderNumber ? (
                            <>
                              <span className="font-bold text-[#0066d6]">
                                {customer.lastOrderNumber}
                              </span>
                              <span className="text-gray-700">{customer.lastPurchaseDate}</span>
                            </>
                          ) : (
                            <span className="text-gray-400">Sem compras</span>
                          )}
                        </div>
                      </td>

                      {/* Total consumido */}
                      <td
                        className="px-5 py-4 font-semibold text-gray-800"
                        onClick={() => setViewingCustomer(customer)}
                      >
                        R$ {customer.totalSpent.toFixed(2).replace(".", ",")}
                      </td>

                      {/* Contato (Mail icon & WhatsApp icon if present) */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 text-gray-600">
                          {customer.email && (
                            <a
                              href={`mailto:${customer.email}`}
                              className="rounded-md border border-gray-200 p-1.5 hover:bg-gray-100 hover:text-black transition-colors"
                              title={`Enviar e-mail para ${customer.email}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Mail className="h-3.5 w-3.5" />
                            </a>
                          )}

                          {customer.phone && (
                            <a
                              href={`https://wa.me/${customer.phone.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-md border border-gray-200 p-1.5 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                              title={`Chamar no WhatsApp (${customer.phone})`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCustomerToDelete(customer);
                            }}
                            className="rounded-md border border-gray-200 p-1.5 hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="Excluir cliente"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL: Exportar e Importar Clientes (Nuvemshop CSV format) */}
      {showExportImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-[#0066d6]" />
                <h3 className="text-base font-bold text-gray-900">Exportar e Importar Clientes</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowExportImportModal(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {importStatusMessage && (
              <div className="rounded-lg bg-blue-50 p-3 text-xs font-medium text-[#0066d6] border border-blue-200">
                {importStatusMessage}
              </div>
            )}

            {/* Export section */}
            <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600">
                1. Exportar lista de clientes
              </h4>
              <p className="text-xs text-gray-500">
                Baixe o arquivo CSV exatamente com as 23 colunas da planilha oficial da Nuvemshop
                (Nome completo, CPF/CNPJ, E-mail, Telefone, Endereço, Total consumido, etc.).
              </p>
              <button
                type="button"
                onClick={handleExportCsv}
                className="flex items-center gap-2 rounded-lg bg-white border border-gray-300 px-4 py-2 text-xs font-bold text-gray-800 shadow-2xs hover:bg-gray-100 transition-colors"
              >
                <Download className="h-4 w-4 text-[#0066d6]" />
                Baixar planilha de clientes ({customers.length} cadastros)
              </button>
            </div>

            {/* Import section */}
            <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600">
                2. Importar planilha de clientes
              </h4>
              <p className="text-xs text-gray-500">
                Selecione o arquivo CSV editado no Excel para sincronizar dados de contato,
                endereços e cadastros automaticamente.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileImport}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 rounded-lg bg-[#0066d6] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#0052ad] transition-colors"
              >
                <Upload className="h-4 w-4" />
                Selecionar arquivo CSV para importar
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowExportImportModal(false)}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Adicionar Novo Cliente */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-[#0066d6]" />
                <h3 className="text-base font-bold text-gray-900">Adicionar novo cliente</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Nome completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Carlos Eduardo Leite"
                  value={newCustomerData.fullName}
                  onChange={(e) =>
                    setNewCustomerData({ ...newCustomerData, fullName: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-[#0066d6] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    E-mail <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="carlos@exemplo.com"
                    value={newCustomerData.email}
                    onChange={(e) =>
                      setNewCustomerData({ ...newCustomerData, email: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-[#0066d6] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">CPF / CNPJ</label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={newCustomerData.cpfCnpj}
                    onChange={(e) =>
                      setNewCustomerData({ ...newCustomerData, cpfCnpj: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-[#0066d6] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="+55 11 99999-9999"
                    value={newCustomerData.phone}
                    onChange={(e) =>
                      setNewCustomerData({ ...newCustomerData, phone: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-[#0066d6] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Cidade</label>
                  <input
                    type="text"
                    placeholder="São Paulo"
                    value={newCustomerData.city}
                    onChange={(e) =>
                      setNewCustomerData({ ...newCustomerData, city: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-[#0066d6] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Endereço de entrega
                </label>
                <input
                  type="text"
                  placeholder="Rua, número, bairro"
                  value={newCustomerData.address}
                  onChange={(e) =>
                    setNewCustomerData({ ...newCustomerData, address: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-[#0066d6] focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateCustomer}
                className="rounded-lg bg-[#0066d6] px-4 py-2 text-xs font-bold text-white hover:bg-[#0052ad] shadow-xs"
              >
                Cadastrar cliente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Customer Confirmation Modal */}
      {customerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red-100 text-red-600">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Excluir cliente</h3>
                <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                  Tem certeza de que deseja excluir o cliente{" "}
                  <strong className="text-gray-800 font-semibold">
                    "{customerToDelete.fullName}"
                  </strong>
                  ? Esta ação removerá o histórico e cadastro do cliente.
                </p>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setCustomerToDelete(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDeleteCustomer(customerToDelete.id);
                  setCustomerToDelete(null);
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 shadow-xs transition-colors"
              >
                Sim, excluir cliente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
