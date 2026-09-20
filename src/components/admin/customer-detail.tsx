import { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Check,
  CreditCard,
  Edit2,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  MoreVertical,
  Phone,
  Plus,
  ShoppingBag,
  Trash2,
  Truck,
  User,
  X,
} from "lucide-react";
import { AdminCustomerItem } from "@/data/admin-customers-data";

interface CustomerDetailProps {
  customer: AdminCustomerItem;
  onBack: () => void;
  onSave: (updated: AdminCustomerItem) => void;
  onDelete?: (id: string) => void;
}

export function CustomerDetail({ customer, onBack, onSave, onDelete }: CustomerDetailProps) {
  const [data, setData] = useState<AdminCustomerItem>({ ...customer });
  const [isEditingData, setIsEditingData] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesInput, setNotesInput] = useState(customer.notes || "");
  const [editingPriceTable, setEditingPriceTable] = useState(false);
  const [priceTableInput, setPriceTableInput] = useState(customer.priceTable || "");
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSaveNotes = () => {
    const updated = { ...data, notes: notesInput };
    setData(updated);
    onSave(updated);
    setEditingNotes(false);
  };

  const handleSavePriceTable = () => {
    const updated = { ...data, priceTable: priceTableInput };
    setData(updated);
    onSave(updated);
    setEditingPriceTable(false);
  };

  const handleSaveGeneral = () => {
    onSave(data);
    setIsEditingData(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#f7f9fa] pb-16 font-sans">
      {/* Top Header matching Nuvemshop screenshot */}
      <div className="border-b border-gray-200 bg-white px-6 py-4 shadow-xs">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              title="Voltar para lista de clientes"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <p className="text-xs text-gray-500">Detalhes do cliente</p>
              <h1 className="text-2xl font-bold text-gray-900 line-clamp-1">{data.fullName}</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Primeira interação em {data.registrationDate || data.lastPurchaseDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-xs"
              >
                <span>Mais opções</span>
                <MoreVertical className="h-3.5 w-3.5 text-gray-500" />
              </button>
              {showMoreMenu && (
                <div className="absolute right-0 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg z-30">
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowMoreMenu(false);
                        setShowDeleteModal(true);
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Eliminar dados do cliente
                    </button>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsEditingData(true)}
              className="flex items-center gap-1.5 rounded-lg bg-[#0066d6] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#0052ad] transition-colors"
            >
              <Edit2 className="h-3.5 w-3.5" />
              <span>Editar</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column: Vendas (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
              <h2 className="text-base font-bold text-gray-900 mb-4">
                {data.purchasesCount} {data.purchasesCount === 1 ? "venda" : "vendas"}
              </h2>

              {data.purchasesCount > 0 ? (
                <div className="rounded-xl border border-gray-200 p-4.5 hover:border-gray-300 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#0066d6] text-sm">
                          {data.lastOrderNumber || "#109"}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">{data.fullName}</span>
                      </div>
                      <p className="text-xs text-[#0066d6] hover:underline cursor-pointer mt-1">
                        1 unidade ▾
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-gray-400 block">{data.lastPurchaseDate}</span>
                      <span className="text-sm font-bold text-gray-900 block mt-0.5">
                        R$ {data.totalSpent.toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                  </div>

                  {/* Badges: Recebido & Enviada */}
                  <div className="mt-3.5 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
                      <span className="font-bold">$</span> Recebido
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-[#0066d6] border border-blue-200">
                      <Truck className="h-3 w-3" /> Enviada
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-gray-500">Mercado Pago - Cartão de crédito</p>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-gray-500">
                  Este cliente ainda não realizou compras.
                </div>
              )}
            </div>

            {/* Newsletter and Marketing Status */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Comunicações e Marketing</h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-400 block">Inscrição para newsletter:</span>
                  <span className="font-semibold text-gray-800">
                    {data.newsletter ? "SIM" : "NÃO"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block">Status de Marketing:</span>
                  <span className="font-semibold text-gray-800">{data.marketing}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Data de cadastro:</span>
                  <span className="font-semibold text-gray-800">
                    {data.registrationDate || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block">Total consumido:</span>
                  <span className="font-semibold text-gray-800">
                    R$ {data.totalSpent.toFixed(2).replace(".", ",")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Dados do cliente, Anotações, Tabelas de preços (1 col) */}
          <div className="space-y-6">
            {/* Card: Dados do cliente */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900">Dados do cliente</h3>
                <div className="flex items-center gap-1 text-gray-400">
                  <a
                    href={`mailto:${data.email}`}
                    className="rounded p-1.5 hover:bg-gray-100 hover:text-[#0066d6]"
                    title="Enviar e-mail"
                  >
                    <Mail className="h-4 w-4" />
                  </a>
                  {data.phone && (
                    <a
                      href={`https://wa.me/${data.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded p-1.5 hover:bg-emerald-50 hover:text-emerald-600"
                      title="Chamar no WhatsApp"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-gray-700 leading-relaxed">
                <p className="font-semibold text-gray-900">{data.fullName}</p>
                <p className="text-gray-600">{data.email}</p>
                {data.cpfCnpj && <p className="text-gray-600">CPF/CNPJ: {data.cpfCnpj}</p>}
                {data.phone && <p className="text-gray-600">Telefone: {data.phone}</p>}

                <div className="pt-2 border-t border-gray-100 mt-2 text-gray-600">
                  <p>
                    {data.address || "Sem endereço cadastrado"}{" "}
                    {data.number ? `, ${data.number}` : ""}
                  </p>
                  {data.complement && <p>{data.complement}</p>}
                  {data.neighborhood && <p>{data.neighborhood}</p>}
                  <p>
                    {data.city ? `${data.city}, ` : ""}
                    {data.state ? `${data.state}, ` : ""}
                    {data.country || "BR"}
                  </p>
                  {data.cep && <p className="text-gray-400">CEP: {data.cep}</p>}
                </div>

                <div className="pt-3 border-t border-gray-100 mt-3">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#0066d6] hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Eliminar dados do cliente</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Card: Anotações */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-gray-900">Anotações</h3>
                <button
                  type="button"
                  onClick={() => setEditingNotes(!editingNotes)}
                  className="rounded p-1 text-gray-400 hover:text-gray-700"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {editingNotes ? (
                <div className="space-y-2 mt-2">
                  <textarea
                    rows={3}
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    placeholder="Inclua anotações específicas com base nos detalhes de cada cliente."
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-xs text-gray-800 focus:border-[#0066d6] focus:outline-hidden"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingNotes(false)}
                      className="rounded px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-100"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveNotes}
                      className="rounded bg-[#0066d6] px-3 py-1 text-xs font-semibold text-white hover:bg-[#0052ad]"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {data.notes ||
                    "Inclua anotações específicas com base nos detalhes de cada cliente."}
                </p>
              )}
            </div>

            {/* Card: Tabelas de preços */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-gray-900">Tabelas de preços</h3>
                <button
                  type="button"
                  onClick={() => setEditingPriceTable(!editingPriceTable)}
                  className="rounded p-1 text-gray-400 hover:text-gray-700"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {editingPriceTable ? (
                <div className="space-y-2 mt-2">
                  <input
                    type="text"
                    value={priceTableInput}
                    onChange={(e) => setPriceTableInput(e.target.value)}
                    placeholder="Ex: Tabela Especial de Revenda"
                    className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-800 focus:border-[#0066d6] focus:outline-hidden"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingPriceTable(false)}
                      className="rounded px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-100"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSavePriceTable}
                      className="rounded bg-[#0066d6] px-3 py-1 text-xs font-semibold text-white hover:bg-[#0052ad]"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {data.priceTable ||
                    "Adicione uma tabela na edição do cliente para incluir preço e regras diferenciadas."}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Edit Modal for Customer Data */}
        {isEditingData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900">Editar dados do cliente</h3>
                <button
                  type="button"
                  onClick={() => setIsEditingData(false)}
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">Nome completo</label>
                  <input
                    type="text"
                    value={data.fullName}
                    onChange={(e) => setData({ ...data, fullName: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-[#0066d6] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={data.email}
                    onChange={(e) => setData({ ...data, email: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-[#0066d6] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">CPF/CNPJ</label>
                  <input
                    type="text"
                    value={data.cpfCnpj}
                    onChange={(e) => setData({ ...data, cpfCnpj: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-[#0066d6] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={data.phone}
                    onChange={(e) => setData({ ...data, phone: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-[#0066d6] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">CEP</label>
                  <input
                    type="text"
                    value={data.cep}
                    onChange={(e) => setData({ ...data, cep: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-[#0066d6] focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">Endereço</label>
                  <input
                    type="text"
                    value={data.address}
                    onChange={(e) => setData({ ...data, address: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-[#0066d6] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Número</label>
                  <input
                    type="text"
                    value={data.number}
                    onChange={(e) => setData({ ...data, number: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-[#0066d6] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Complemento</label>
                  <input
                    type="text"
                    value={data.complement}
                    onChange={(e) => setData({ ...data, complement: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-[#0066d6] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Bairro</label>
                  <input
                    type="text"
                    value={data.neighborhood}
                    onChange={(e) => setData({ ...data, neighborhood: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-[#0066d6] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Cidade</label>
                  <input
                    type="text"
                    value={data.city}
                    onChange={(e) => setData({ ...data, city: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-[#0066d6] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Estado</label>
                  <input
                    type="text"
                    value={data.state}
                    onChange={(e) => setData({ ...data, state: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-[#0066d6] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Marketing</label>
                  <select
                    value={data.marketing}
                    onChange={(e) =>
                      setData({ ...data, marketing: e.target.value as "Aceita" | "Não aceita" })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-[#0066d6] focus:outline-hidden"
                  >
                    <option value="Aceita">Aceita</option>
                    <option value="Não aceita">Não aceita</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditingData(false)}
                  className="rounded-lg px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveGeneral}
                  className="rounded-lg bg-[#0066d6] px-4 py-2 text-xs font-bold text-white hover:bg-[#0052ad] shadow-xs"
                >
                  Salvar alterações
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Delete Customer Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95">
              <div className="flex items-start gap-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red-100 text-red-600">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Eliminar dados do cliente</h3>
                  <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                    Tem certeza de que deseja eliminar os dados de{" "}
                    <strong className="text-gray-800 font-semibold">"{data.fullName}"</strong>? Esta
                    ação removerá o histórico e cadastro do cliente permanentemente.
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
                    onDelete?.(data.id);
                    onBack();
                  }}
                  className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 shadow-xs transition-colors"
                >
                  Sim, eliminar dados
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
