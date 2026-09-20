import { useState } from "react";
import {
  ArrowUpDown,
  Check,
  CheckCircle2,
  ChevronDown,
  Columns,
  Download,
  Filter,
  MoreVertical,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Truck,
  X,
  XCircle,
  Zap,
} from "lucide-react";

export interface SaleOrder {
  id: string;
  orderNumber: string;
  date: string;
  customer: string;
  email: string;
  phone: string;
  total: number;
  totalFormatted: string;
  itemsCount: number;
  products: {
    name: string;
    quantity: number;
    price: number;
  }[];
  paymentStatus: "Recebido" | "Recusado" | "Pendente";
  paymentMethod: string;
  shippingStatus: "Enviada" | "Pendente" | "Cancelada";
  shippingCarrier: string;
  trackingCode?: string;
  statusFilter: "arquivar" | "cobrar" | "embalar" | "enviar" | "retirar";
}

const INITIAL_SALES: SaleOrder[] = [];

export function SalesList() {
  const [sales] = useState<SaleOrder[]>(INITIAL_SALES);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>("todos");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [viewOrderModal, setViewOrderModal] = useState<SaleOrder | null>(null);
  const [showAutoCancelModal, setShowAutoCancelModal] = useState(false);
  const [showCreateOrderNotice, setShowCreateOrderNotice] = useState(false);

  // Status counters matching screenshot 1
  const countPorCobrar = sales.filter((s) => s.statusFilter === "cobrar").length;
  const countPorEmbalar = sales.filter((s) => s.statusFilter === "embalar").length;
  const countPorEnviar = sales.filter((s) => s.statusFilter === "enviar").length;
  const countPorRetirar = sales.filter((s) => s.statusFilter === "retirar").length;
  const countPorArquivar = 34; // exactly as in Nuvemshop screenshot

  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      sale.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.email.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedStatusTab === "cobrar") return sale.statusFilter === "cobrar";
    if (selectedStatusTab === "embalar") return sale.statusFilter === "embalar";
    if (selectedStatusTab === "enviar") return sale.statusFilter === "enviar";
    if (selectedStatusTab === "retirar") return sale.statusFilter === "retirar";
    if (selectedStatusTab === "arquivar") return sale.statusFilter === "arquivar";

    return true;
  });

  const toggleSelectAll = () => {
    if (selectedOrders.length === filteredSales.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredSales.map((s) => s.id));
    }
  };

  const toggleSelectOrder = (id: string) => {
    if (selectedOrders.includes(id)) {
      setSelectedOrders(selectedOrders.filter((item) => item !== id));
    } else {
      setSelectedOrders([...selectedOrders, id]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-baseline gap-2">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight sm:text-3xl">Vendas</h1>
          <span className="text-xs font-medium text-gray-500">40 ativas</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Cancelamento automático */}
          <button
            type="button"
            onClick={() => setShowAutoCancelModal(true)}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-xs hover:bg-gray-50 transition-colors"
          >
            <Settings className="h-3.5 w-3.5 text-gray-500" />
            <span>Cancelamento automático</span>
          </button>

          {/* Exportar lista */}
          <button
            type="button"
            onClick={() => {
              const csv =
                "Número,Data,Cliente,Total,Produtos,Pagamento,Envio\n" +
                sales
                  .map(
                    (s) =>
                      `"${s.orderNumber}","${s.date}","${s.customer}","${s.totalFormatted}","${s.itemsCount} unid.","${s.paymentStatus} - ${s.paymentMethod}","${s.shippingStatus} - ${s.shippingCarrier}"`,
                  )
                  .join("\n");
              const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "vendas_nuvemshop.csv";
              a.click();
            }}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-xs hover:bg-gray-50 transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-gray-500" />
            <span>Exportar lista</span>
          </button>

          {/* Criar um pedido */}
          <button
            type="button"
            onClick={() => setShowCreateOrderNotice(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#0066d6] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#0052b3] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Criar um pedido</span>
          </button>
        </div>
      </div>

      {/* Filter and Status Pill Tabs */}
      <div className="flex flex-col gap-3 rounded-lg border border-[#e6e8ee] bg-white p-3 shadow-xs lg:flex-row lg:items-center lg:justify-between">
        {/* Search input */}
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 w-full rounded-md border border-gray-200 bg-[#f9fafb] pl-9 pr-3 text-xs text-gray-700 placeholder-gray-400 focus:bg-white focus:border-[#0066d6] focus:outline-none"
          />
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() =>
              setSelectedStatusTab(selectedStatusTab === "cobrar" ? "todos" : "cobrar")
            }
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-colors ${
              selectedStatusTab === "cobrar"
                ? "bg-blue-100 text-[#0066d6] font-semibold"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium"
            }`}
          >
            <span>Por cobrar</span>
            <span className="rounded-full bg-gray-200/80 px-1.5 py-0.2 text-[10px] font-bold text-gray-700">
              {countPorCobrar}
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              setSelectedStatusTab(selectedStatusTab === "embalar" ? "todos" : "embalar")
            }
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-colors ${
              selectedStatusTab === "embalar"
                ? "bg-blue-100 text-[#0066d6] font-semibold"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium"
            }`}
          >
            <span>Por embalar</span>
            <span className="rounded-full bg-gray-200/80 px-1.5 py-0.2 text-[10px] font-bold text-gray-700">
              {countPorEmbalar}
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              setSelectedStatusTab(selectedStatusTab === "enviar" ? "todos" : "enviar")
            }
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-colors ${
              selectedStatusTab === "enviar"
                ? "bg-blue-100 text-[#0066d6] font-semibold"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium"
            }`}
          >
            <span>Por enviar</span>
            <span className="rounded-full bg-gray-200/80 px-1.5 py-0.2 text-[10px] font-bold text-gray-700">
              {countPorEnviar}
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              setSelectedStatusTab(selectedStatusTab === "retirar" ? "todos" : "retirar")
            }
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-colors ${
              selectedStatusTab === "retirar"
                ? "bg-blue-100 text-[#0066d6] font-semibold"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium"
            }`}
          >
            <span>Por retirar</span>
            <span className="rounded-full bg-gray-200/80 px-1.5 py-0.2 text-[10px] font-bold text-gray-700">
              {countPorRetirar}
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              setSelectedStatusTab(selectedStatusTab === "arquivar" ? "todos" : "arquivar")
            }
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-colors ${
              selectedStatusTab === "arquivar"
                ? "bg-blue-100 text-[#0066d6] font-semibold"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium"
            }`}
          >
            <span>Por arquivar</span>
            <span className="rounded-full bg-gray-700 px-1.5 py-0.2 text-[10px] font-bold text-white">
              {countPorArquivar}
            </span>
          </button>
        </div>

        {/* Right tools: Zap, Columns, Sort, Filter */}
        <div className="flex items-center gap-2 border-t border-gray-100 pt-2 lg:border-t-0 lg:pt-0">
          <button
            type="button"
            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
            title="Ações em massa"
          >
            <Zap className="h-4 w-4" />
          </button>

          <button
            type="button"
            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
            title="Colunas visíveis"
          >
            <Columns className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-1 text-xs font-medium text-gray-700 cursor-pointer hover:text-black">
            <ArrowUpDown className="h-3 w-3 text-gray-400" />
            <span>Mais novo</span>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-[#f9fafb] px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
          >
            <SlidersHorizontal className="h-3 w-3 text-gray-500" />
            <span>Filtrar</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-lg border border-[#e6e8ee] bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-[#f9fafb] text-[11px] font-semibold text-gray-600">
                <th className="w-10 py-3 pl-4 pr-1">
                  <input
                    type="checkbox"
                    checked={
                      filteredSales.length > 0 && selectedOrders.length === filteredSales.length
                    }
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-gray-300 text-[#0066d6] focus:ring-[#0066d6]"
                  />
                </th>
                <th className="py-3 px-3">Venda</th>
                <th className="py-3 px-3">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-gray-900">
                    <span>Data</span>
                    <ChevronDown className="h-3 w-3 text-gray-600" />
                  </div>
                </th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Produtos</th>
                <th className="py-3 px-4">Pagamento</th>
                <th className="py-3 px-4">Envio</th>
                <th className="w-10 py-3 pr-4 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-gray-500">
                    Nenhum pedido encontrado. Quando clientes realizarem compras na loja, os pedidos
                    aparecerão aqui.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => {
                  const isSelected = selectedOrders.includes(sale.id);
                  const isDropdownOpen = activeDropdownId === sale.id;

                  return (
                    <tr
                      key={sale.id}
                      className={`hover:bg-[#f8fafd] transition-colors ${
                        isSelected ? "bg-blue-50/40" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 pl-4 pr-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOrder(sale.id)}
                          className="h-4 w-4 rounded border-gray-300 text-[#0066d6] focus:ring-[#0066d6]"
                        />
                      </td>

                      {/* Venda / Order Number */}
                      <td className="py-3 px-3 font-semibold text-[#0066d6]">
                        <button
                          type="button"
                          onClick={() => setViewOrderModal(sale)}
                          className="hover:underline font-semibold"
                        >
                          {sale.orderNumber}
                        </button>
                      </td>

                      {/* Data */}
                      <td className="py-3 px-3 text-gray-600 whitespace-nowrap">{sale.date}</td>

                      {/* Cliente */}
                      <td className="py-3 px-4 font-medium text-[#0066d6]">
                        <button
                          type="button"
                          onClick={() => setViewOrderModal(sale)}
                          className="hover:underline text-left"
                        >
                          {sale.customer}
                        </button>
                      </td>

                      {/* Total */}
                      <td className="py-3 px-4 font-bold text-gray-900 whitespace-nowrap">
                        {sale.totalFormatted}
                      </td>

                      {/* Produtos */}
                      <td className="py-3 px-4 text-[#0066d6] whitespace-nowrap">
                        <div className="relative inline-block">
                          <button
                            type="button"
                            onClick={() => setActiveDropdownId(isDropdownOpen ? null : sale.id)}
                            className="inline-flex items-center gap-1 font-medium hover:underline text-xs"
                          >
                            <span>{sale.itemsCount} unid.</span>
                            <ChevronDown className="h-3 w-3" />
                          </button>

                          {/* Product list dropdown */}
                          {isDropdownOpen && (
                            <div className="absolute left-0 top-full z-20 mt-1 w-64 rounded-md border border-gray-200 bg-white p-2 shadow-lg">
                              <p className="border-b border-gray-100 pb-1 text-[11px] font-bold text-gray-700">
                                Itens do pedido
                              </p>
                              <div className="mt-1 space-y-1">
                                {sale.products.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between text-[11px] text-gray-600"
                                  >
                                    <span className="truncate max-w-[170px]">{item.name}</span>
                                    <span className="font-semibold text-gray-800">
                                      {item.quantity}x R$ {item.price.toFixed(2).replace(".", ",")}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Pagamento */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          {sale.paymentStatus === "Recebido" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f7ee] px-2 py-0.5 text-[11px] font-semibold text-[#137333]">
                              <span>$</span>
                              <span>Recebido</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#fce8e6] px-2 py-0.5 text-[11px] font-semibold text-[#c5221f]">
                              <span>$</span>
                              <span>Recusado</span>
                            </span>
                          )}
                          <p className="text-[11px] text-gray-500">{sale.paymentMethod}</p>
                        </div>
                      </td>

                      {/* Envio */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f7ee] px-2 py-0.5 text-[11px] font-semibold text-[#137333]">
                            <Truck className="h-3 w-3" />
                            <span>Enviada</span>
                          </span>
                          <p className="text-[11px] text-gray-500">{sale.shippingCarrier}</p>
                        </div>
                      </td>

                      {/* Actions Menu */}
                      <td className="py-3 pr-4 text-center">
                        <button
                          type="button"
                          onClick={() => setViewOrderModal(sale)}
                          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          title="Ver detalhes da venda"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {viewOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Pedido {viewOrderModal.orderNumber}
                </h3>
                <p className="text-xs text-gray-500">Realizado em {viewOrderModal.date}</p>
              </div>
              <button
                type="button"
                onClick={() => setViewOrderModal(null)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Customer Box */}
              <div className="rounded-lg bg-gray-50 p-3 border border-gray-100">
                <p className="font-bold text-gray-800 text-sm mb-1">{viewOrderModal.customer}</p>
                <p className="text-gray-600">E-mail: {viewOrderModal.email}</p>
                <p className="text-gray-600">Telefone: {viewOrderModal.phone}</p>
              </div>

              {/* Products Box */}
              <div>
                <p className="font-semibold text-gray-800 mb-2">Itens comprados:</p>
                <div className="divide-y divide-gray-100 rounded-lg border border-gray-200">
                  {viewOrderModal.products.map((item, idx) => (
                    <div key={idx} className="flex justify-between p-3">
                      <div>
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <p className="text-gray-500">Quantidade: {item.quantity}</p>
                      </div>
                      <span className="font-bold text-gray-900">
                        R$ {(item.quantity * item.price).toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment & Shipping Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <p className="font-semibold text-gray-700 mb-1">Status do Pagamento</p>
                  <p className="font-bold text-emerald-700">{viewOrderModal.paymentStatus}</p>
                  <p className="text-gray-500 mt-1">{viewOrderModal.paymentMethod}</p>
                </div>
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <p className="font-semibold text-gray-700 mb-1">Logística & Envio</p>
                  <p className="font-bold text-emerald-700">{viewOrderModal.shippingStatus}</p>
                  <p className="text-gray-500 mt-1">{viewOrderModal.shippingCarrier}</p>
                  {viewOrderModal.trackingCode && (
                    <p className="text-[#0066d6] font-mono font-semibold mt-1">
                      {viewOrderModal.trackingCode}
                    </p>
                  )}
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center border-t border-gray-100 pt-3 text-sm">
                <span className="font-semibold text-gray-700">Total pago:</span>
                <span className="text-lg font-black text-gray-900">
                  {viewOrderModal.totalFormatted}
                </span>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setViewOrderModal(null)}
                className="rounded-md bg-[#0066d6] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0052b3]"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auto Cancel Modal */}
      {showAutoCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Settings className="h-4 w-4 text-[#0066d6]" />
                Cancelamento automático
              </h3>
              <button
                type="button"
                onClick={() => setShowAutoCancelModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-3 text-xs text-gray-600 leading-relaxed">
              Configuração ativada: Pedidos que não tiverem o pagamento confirmado em até 7 dias são
              automaticamente cancelados e os itens retornam ao estoque da loja.
            </p>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAutoCancelModal(false)}
                className="rounded-md bg-[#0066d6] px-4 py-1.5 text-xs font-semibold text-white"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notice on Create Order */}
      {showCreateOrderNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Plus className="h-4 w-4 text-[#0066d6]" />
                Criar um pedido
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateOrderNotice(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-3 text-xs text-gray-600 leading-relaxed">
              Você pode registrar pedidos diretamente pelo painel administrativo para vendas
              realizadas pelo WhatsApp ou balcão.
            </p>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowCreateOrderNotice(false)}
                className="rounded-md bg-[#0066d6] px-4 py-1.5 text-xs font-semibold text-white"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
