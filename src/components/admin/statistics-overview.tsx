import { useState, useEffect } from "react";
import { Clock, ExternalLink, Info, MoreVertical, Cloud } from "lucide-react";
import {
  SaleOrder,
  getCachedOrders,
  subscribeAdminOrders,
  AbandonedCartItem,
  getCachedAbandonedCarts,
  subscribeAbandonedCarts,
} from "@/data/admin-orders-data";
import {
  AdminCustomerItem,
  getCachedAdminCustomers,
  subscribeAdminCustomers,
} from "@/data/admin-customers-data";

// SVG Smooth Wave Generator for sparklines matching Nuvemshop exactly
function SparklineWave({ type = "wave" }: { type?: "wave" | "peak" }) {
  if (type === "peak") {
    return (
      <div className="h-16 w-full pt-2">
        <svg
          viewBox="0 0 200 60"
          className="h-full w-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="peakGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0066d6" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#0066d6" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path
            d="M 0 55 L 40 55 C 55 55 60 5 75 5 C 90 5 95 55 110 55 L 200 55"
            fill="none"
            stroke="#0066d6"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M 0 55 L 40 55 C 55 55 60 5 75 5 C 90 5 95 55 110 55 L 200 55 L 200 60 L 0 60 Z"
            fill="url(#peakGradient)"
          />
        </svg>
      </div>
    );
  }

  // Wave style for visits
  return (
    <div className="h-16 w-full pt-2">
      <svg
        viewBox="0 0 200 60"
        className="h-full w-full overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0066d6" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0066d6" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path
          d="M 0 20 C 30 25 50 35 70 42 C 90 48 110 45 125 30 C 140 15 150 18 160 45 L 200 48"
          fill="none"
          stroke="#0066d6"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M 0 20 C 30 25 50 35 70 42 C 90 48 110 45 125 30 C 140 15 150 18 160 45 L 200 48 L 200 60 L 0 60 Z"
          fill="url(#waveGradient)"
        />
      </svg>
    </div>
  );
}

export function StatisticsOverview() {
  const [period, setPeriod] = useState("30dias");
  const [orders, setOrders] = useState<SaleOrder[]>(() => getCachedOrders());
  const [customers, setCustomers] = useState<AdminCustomerItem[]>(() => getCachedAdminCustomers());
  const [carts, setCarts] = useState<AbandonedCartItem[]>(() => getCachedAbandonedCarts());

  useEffect(() => {
    const unsubOrders = subscribeAdminOrders(setOrders);
    const unsubCust = subscribeAdminCustomers(setCustomers);
    const unsubCarts = subscribeAbandonedCarts(setCarts);
    return () => {
      unsubOrders();
      unsubCust();
      unsubCarts();
    };
  }, []);

  // Compute live metrics
  const totalSalesCount = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const averageTicket = totalSalesCount > 0 ? totalRevenue / totalSalesCount : 0;
  const estimatedVisits = Math.max(
    customers.length * 3 + totalSalesCount * 4 + carts.length * 2,
    0,
  );

  // Visitor funnel data
  const visitorFunnel = [
    { label: "Total de visitas", count: estimatedVisits || 1, max: Math.max(estimatedVisits, 1) },
    {
      label: "Visualização de categoria",
      count: Math.round(estimatedVisits * 0.7),
      max: Math.max(estimatedVisits, 1),
    },
    {
      label: "Visualização de produto",
      count: Math.round(estimatedVisits * 0.5),
      max: Math.max(estimatedVisits, 1),
    },
    {
      label: "Carrinhos criados",
      count: carts.length + totalSalesCount,
      max: Math.max(estimatedVisits, 1),
    },
  ];

  // Checkout funnel data
  const checkoutBase = Math.max(carts.length + totalSalesCount, 1);
  const checkoutFunnel = [
    { label: "Checkout iniciado", count: carts.length + totalSalesCount, max: checkoutBase },
    { label: "Etapa de entrega", count: Math.round(totalSalesCount * 1.1), max: checkoutBase },
    { label: "Etapa de pagamento", count: Math.round(totalSalesCount * 1.05), max: checkoutBase },
    { label: "Pedidos criados", count: totalSalesCount, max: checkoutBase },
    {
      label: "Pedidos pagos",
      count: orders.filter((o) => o.paymentStatus === "Recebido").length,
      max: checkoutBase,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl tracking-tight">
              Visão geral
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Cloud className="w-3.5 h-3.5 text-emerald-600" />
              Firestore Tempo Real
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Exibindo dados sincronizados com o banco de dados{" "}
            <strong className="font-semibold text-gray-700">Firestore</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock className="h-4 w-4 text-gray-400" />
            <span>Tempo real ativo</span>
          </div>

          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-xs focus:border-[#0066d6] focus:outline-none"
          >
            <option value="hoje">Hoje</option>
            <option value="ontem">Ontem</option>
            <option value="7dias">Últimos 7 dias</option>
            <option value="30dias">Últimos 30 dias</option>
            <option value="este-mes">Este mês</option>
          </select>
        </div>
      </div>

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Visitas */}
        <div className="rounded-lg border border-[#e6e8ee] bg-white p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
              <span>Visitas</span>
              <Info className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600 cursor-pointer" />
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-gray-900">{estimatedVisits}</div>
          </div>
          <SparklineWave type="wave" />
        </div>

        {/* Card 2: Vendas */}
        <div className="rounded-lg border border-[#e6e8ee] bg-white p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
              <span>Vendas</span>
              <Info className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600 cursor-pointer" />
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-gray-900">{totalSalesCount}</div>
          </div>
          <SparklineWave type="peak" />
        </div>

        {/* Card 3: Receita */}
        <div className="rounded-lg border border-[#e6e8ee] bg-white p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
              <span>Receita</span>
              <Info className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600 cursor-pointer" />
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-gray-900">
              R$ {totalRevenue.toFixed(2).replace(".", ",")}
            </div>
          </div>
          <SparklineWave type="peak" />
        </div>

        {/* Card 4: Ticket médio */}
        <div className="rounded-lg border border-[#e6e8ee] bg-white p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
              <span>Ticket médio</span>
              <Info className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600 cursor-pointer" />
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-gray-900">
              R$ {averageTicket.toFixed(2).replace(".", ",")}
            </div>
          </div>
          <SparklineWave type="peak" />
        </div>
      </div>

      {/* Funnel and Conversion Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Horizontal Funnels (8 cols on lg) */}
        <div className="space-y-6 lg:col-span-8">
          {/* Card: Comportamento dos visitantes */}
          <div className="rounded-lg border border-[#e6e8ee] bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                <span>Comportamento dos visitantes</span>
                <Info className="h-3.5 w-3.5 text-gray-400" />
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {visitorFunnel.map((item) => {
                const percent = Math.round((item.count / item.max) * 100);
                return (
                  <div key={item.label} className="grid grid-cols-12 items-center gap-3 text-xs">
                    <div className="col-span-5 text-right text-gray-600 font-medium truncate">
                      {item.label}
                    </div>
                    <div className="col-span-6">
                      <div className="h-6 w-full rounded-xs bg-gray-100 relative overflow-hidden">
                        <div
                          className="h-full bg-[#0066d6] transition-all duration-500 rounded-xs"
                          style={{ width: `${Math.max(percent, 0)}%` }}
                        />
                      </div>
                    </div>
                    <div className="col-span-1 text-left font-bold text-gray-800">{item.count}</div>
                  </div>
                );
              })}

              {/* Chart X-axis scale */}
              <div className="grid grid-cols-12 items-center gap-3 pt-2 text-[10px] text-gray-400 border-t border-gray-100">
                <div className="col-span-5"></div>
                <div className="col-span-7 flex justify-between pr-4">
                  <span>0</span>
                  <span>10</span>
                  <span>20</span>
                  <span>30</span>
                  <span>40</span>
                  <span>50</span>
                  <span>60</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Comportamento no checkout */}
          <div className="rounded-lg border border-[#e6e8ee] bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                <span>Comportamento no checkout</span>
                <Info className="h-3.5 w-3.5 text-gray-400" />
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {checkoutFunnel.map((item) => {
                const percent = Math.round((item.count / item.max) * 100);
                return (
                  <div key={item.label} className="grid grid-cols-12 items-center gap-3 text-xs">
                    <div className="col-span-5 text-right text-gray-600 font-medium truncate">
                      {item.label}
                    </div>
                    <div className="col-span-6">
                      <div className="h-6 w-full rounded-xs bg-gray-100 relative overflow-hidden">
                        <div
                          className="h-full bg-[#0066d6] transition-all duration-500 rounded-xs"
                          style={{ width: `${Math.max(percent, 0)}%` }}
                        />
                      </div>
                    </div>
                    <div className="col-span-1 text-left font-bold text-gray-800">{item.count}</div>
                  </div>
                );
              })}

              {/* Chart X-axis scale */}
              <div className="grid grid-cols-12 items-center gap-3 pt-2 text-[10px] text-gray-400 border-t border-gray-100">
                <div className="col-span-5"></div>
                <div className="col-span-7 flex justify-between pr-4">
                  <span>0</span>
                  <span>1</span>
                  <span>1</span>
                  <span>2</span>
                  <span>2</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Conversion Metrics (4 cols on lg) */}
        <div className="space-y-6 lg:col-span-4">
          {/* Card: Visitas a vendas */}
          <div className="rounded-lg border border-[#e6e8ee] bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                <span>Visitas a vendas</span>
                <Info className="h-3.5 w-3.5 text-gray-400" />
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-2 text-2xl font-bold text-gray-900">0,00%</div>
            <SparklineWave type="peak" />
          </div>

          {/* Card: Visitas a carrinhos criados */}
          <div className="rounded-lg border border-[#e6e8ee] bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                <span>Visitas a carrinhos criados</span>
                <Info className="h-3.5 w-3.5 text-gray-400" />
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-2 text-2xl font-bold text-gray-900">0,00%</div>
            <SparklineWave type="peak" />
          </div>

          {/* Card: Checkouts iniciados vendas */}
          <div className="rounded-lg border border-[#e6e8ee] bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                <span>Checkouts iniciados vendas</span>
                <Info className="h-3.5 w-3.5 text-gray-400" />
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-2 text-2xl font-bold text-gray-900">0,00%</div>
            <SparklineWave type="peak" />
          </div>
        </div>
      </div>

      {/* Footer Link */}
      <div className="pt-4 flex justify-center">
        <a
          href="#estatisticas"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0066d6] hover:underline"
        >
          <Info className="h-4 w-4" />
          <span>Mais sobre estatísticas</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
