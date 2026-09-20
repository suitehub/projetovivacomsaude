import {
  Clock,
  ExternalLink,
  Info,
  MoreVertical,
  Radio,
  Tag,
  TrendingUp,
  UserCheck,
  Users,
  Percent,
} from "lucide-react";
import type { StatSubTab } from "./admin-layout";
import { getAdminCoupons } from "@/data/admin-discounts-data";

export function StatisticsOthers({ tab }: { tab: StatSubTab }) {
  if (tab === "vendas-e-clientes") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Vendas e clientes</h1>
          <p className="mt-1 text-xs text-gray-500">
            Acompanhe o comportamento de compras e a fidelização da sua base de clientes.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-[#e6e8ee] bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-700">Novos clientes</span>
              <Users className="h-4 w-4 text-[#0066d6]" />
            </div>
            <div className="mt-3 text-3xl font-bold text-gray-900">0</div>
            <p className="mt-2 text-[11px] text-gray-400 font-medium">
              Sem novos clientes no período
            </p>
          </div>

          <div className="rounded-lg border border-[#e6e8ee] bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-700">Clientes recorrentes</span>
              <UserCheck className="h-4 w-4 text-[#0066d6]" />
            </div>
            <div className="mt-3 text-3xl font-bold text-gray-900">0</div>
            <p className="mt-2 text-[11px] text-gray-400">Nenhum cliente recorrente</p>
          </div>

          <div className="rounded-lg border border-[#e6e8ee] bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-700">Ticket médio geral</span>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-3 text-3xl font-bold text-gray-900">R$ 0,00</div>
            <p className="mt-2 text-[11px] text-gray-500">Média por pedido aprovado</p>
          </div>
        </div>

        <div className="rounded-lg border border-[#e6e8ee] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <span className="text-sm font-semibold text-gray-800">
              Canais de pagamento utilizados
            </span>
            <MoreVertical className="h-4 w-4 text-gray-400" />
          </div>
          <div className="mt-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">Mercado Pago — Pix</span>
              <span className="font-bold text-gray-900">0%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full bg-[#0066d6] w-[0%]" />
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="font-medium text-gray-700">Mercado Pago — Cartão de Crédito</span>
              <span className="font-bold text-gray-900">0%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full bg-emerald-500 w-[0%]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tab === "visitas") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Visitas</h1>
          <p className="mt-1 text-xs text-gray-500">
            Fontes de tráfego, dispositivos e distribuição de acessos à sua loja.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-[#e6e8ee] bg-white p-5 shadow-xs">
            <h2 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-3">
              Origem de tráfego
            </h2>
            <div className="mt-4 space-y-3 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-700 font-medium">WhatsApp / Direto</span>
                  <span className="font-bold text-gray-900">0 visitas (0%)</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full bg-[#0066d6] w-[0%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-700 font-medium">
                    Redes Sociais (Instagram/Facebook)
                  </span>
                  <span className="font-bold text-gray-900">0 visitas (0%)</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full bg-purple-600 w-[0%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-700 font-medium">Busca Orgânica (Google)</span>
                  <span className="font-bold text-gray-900">0 visitas (0%)</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[0%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[#e6e8ee] bg-white p-5 shadow-xs">
            <h2 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-3">
              Dispositivos utilizados
            </h2>
            <div className="mt-4 space-y-3 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-700 font-medium">Celular (Mobile)</span>
                  <span className="font-bold text-gray-900">0 visitas (0%)</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full bg-[#0066d6] w-[0%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-700 font-medium">Computador (Desktop)</span>
                  <span className="font-bold text-gray-900">0 visitas (0%)</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full bg-gray-400 w-[0%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tab === "tempo-real") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              Tempo real
            </h1>
            <p className="mt-1 text-xs text-gray-500">
              Visitantes ativos navegando na sua loja neste exato momento.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-[#e6e8ee] bg-white p-5 shadow-xs">
            <span className="text-xs font-semibold text-gray-700">Usuários ativos agora</span>
            <div className="mt-3 text-4xl font-black text-gray-400">0</div>
            <p className="mt-1 text-[11px] text-gray-500">Nenhum visitante ativo agora</p>
          </div>
          <div className="rounded-lg border border-[#e6e8ee] bg-white p-5 shadow-xs">
            <span className="text-xs font-semibold text-gray-700">Páginas por minuto</span>
            <div className="mt-3 text-4xl font-black text-gray-400">0</div>
            <p className="mt-1 text-[11px] text-gray-500">Visualizações no último minuto</p>
          </div>
          <div className="rounded-lg border border-[#e6e8ee] bg-white p-5 shadow-xs">
            <span className="text-xs font-semibold text-gray-700">Carrinhos ativos</span>
            <div className="mt-3 text-4xl font-black text-gray-400">0</div>
            <p className="mt-1 text-[11px] text-gray-500">Itens aguardando finalização</p>
          </div>
        </div>
      </div>
    );
  }

  // Relatório de cupons
  const coupons = getAdminCoupons();
  const totalUses = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Relatório de cupons</h1>
          <p className="mt-1 text-xs text-gray-500">
            Acompanhe o uso e a efetividade dos cupons de desconto criados para a sua loja.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-[#e6e8ee] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700">Cupons cadastrados</span>
            <Tag className="h-4 w-4 text-[#0066d6]" />
          </div>
          <div className="mt-3 text-2xl font-bold text-gray-900">{coupons.length}</div>
          <p className="mt-1 text-xs text-emerald-600 font-medium">
            {coupons.filter((c) => c.active).length} ativos no momento
          </p>
        </div>

        <div className="rounded-lg border border-[#e6e8ee] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700">Total de resgates</span>
            <Percent className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-3 text-2xl font-bold text-gray-900">{totalUses} usos</div>
          <p className="mt-1 text-xs text-gray-500">Acumulado em pedidos finalizados</p>
        </div>

        <div className="rounded-lg border border-[#e6e8ee] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700">Cupom mais utilizado</span>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </div>
          <div className="mt-3 text-2xl font-bold text-gray-900">
            {coupons.slice().sort((a, b) => b.usedCount - a.usedCount)[0]?.code || "—"}
          </div>
          <p className="mt-1 text-xs text-gray-500">Maior taxa de conversão</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-[#e6e8ee] bg-white shadow-xs">
        <div className="border-b border-[#e6e8ee] bg-[#f9fafb] px-4 py-3">
          <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            Desempenho por cupom
          </h2>
        </div>
        <table className="w-full text-left text-xs text-gray-700">
          <thead className="border-b border-[#e6e8ee] bg-[#f9fafb] text-[11px] font-semibold text-gray-500">
            <tr>
              <th className="px-4 py-2.5">Código</th>
              <th className="px-4 py-2.5">Tipo</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5 text-right">Utilizações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0f2f5]">
            {coupons.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-xs text-gray-500">
                  Nenhum cupom cadastrado.
                </td>
              </tr>
            ) : (
              coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-bold text-gray-900">{coupon.code}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {coupon.type === "porcentagem" && `${coupon.value}% de desconto`}
                    {coupon.type === "valor_fixo" && `R$ ${coupon.value.toFixed(2)}`}
                    {coupon.type === "frete_gratis" && "Frete grátis"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        coupon.active
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {coupon.active ? "Ativo" : "Pausado"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">
                    {coupon.usedCount}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
