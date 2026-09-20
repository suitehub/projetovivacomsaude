import { useState } from "react";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Info,
  MoreVertical,
  Search,
} from "lucide-react";

export function StatisticsProducts() {
  const [productSearch, setProductSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const productDetails: { name: string; sold: number; views: number; cvr: string }[] = [];

  const filteredProducts = productDetails.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Top 2 Cards: Produtos Vendidos & Produtos por Vendas */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Produtos vendidos */}
        <div className="rounded-lg border border-[#e6e8ee] bg-white p-5 shadow-xs lg:col-span-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                <span>Produtos vendidos</span>
                <Info className="h-3.5 w-3.5 text-gray-400" />
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 text-3xl font-bold text-gray-900">0</div>
          </div>

          <div className="h-24 w-full pt-4">
            <svg
              viewBox="0 0 200 60"
              className="h-full w-full overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="prodGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0066d6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#0066d6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 55 L 200 55"
                fill="none"
                stroke="#0066d6"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Produtos por vendas (Bar chart) */}
        <div className="rounded-lg border border-[#e6e8ee] bg-white p-5 shadow-xs lg:col-span-8">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
              <span>Produtos por vendas</span>
              <Info className="h-3.5 w-3.5 text-gray-400" />
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>

          {/* Bar Chart Nuvemshop Image 4 */}
          <div className="mt-4 h-36 flex flex-col justify-end">
            <div className="flex-1 flex items-end justify-between px-6 border-b border-gray-200">
              {/* Day 7 */}
              <div className="flex flex-col items-center flex-1">
                <div className="h-0 w-8 bg-[#0066d6]" />
              </div>
              {/* Day 8 */}
              <div className="flex flex-col items-center flex-1">
                <div className="h-0 w-8 bg-[#0066d6]" />
              </div>
              {/* Day 9 */}
              <div className="flex flex-col items-center flex-1">
                <div className="h-0 w-8 bg-[#0066d6]" />
              </div>
              {/* Day 10 */}
              <div className="flex flex-col items-center flex-1">
                <div className="h-0 w-8 bg-[#0066d6]" />
              </div>
              {/* Day 11 */}
              <div className="flex flex-col items-center flex-1">
                <div className="h-0 w-8 bg-[#0066d6]" />
              </div>
              {/* Day 12 */}
              <div className="flex flex-col items-center flex-1">
                <div className="h-0 w-8 bg-[#0066d6]" />
              </div>
              {/* Day 13 */}
              <div className="flex flex-col items-center flex-1">
                <div className="h-0 w-8 bg-[#0066d6]" />
              </div>
              {/* Day 14 */}
              <div className="flex flex-col items-center flex-1">
                <div className="h-0 w-8 bg-[#0066d6]" />
              </div>
            </div>

            {/* X Axis labels */}
            <div className="flex justify-between px-6 pt-2 text-[10px] text-gray-400">
              <span className="flex-1 text-center">7</span>
              <span className="flex-1 text-center font-semibold text-gray-700">8</span>
              <span className="flex-1 text-center">9</span>
              <span className="flex-1 text-center">10</span>
              <span className="flex-1 text-center">11</span>
              <span className="flex-1 text-center">12</span>
              <span className="flex-1 text-center">13</span>
              <span className="flex-1 text-center">14</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detalhe por produto Table (Image 4) */}
      <div className="rounded-lg border border-[#e6e8ee] bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
            <span>Detalhe por produto</span>
            <Info className="h-3.5 w-3.5 text-gray-400" />
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Pesquisar 12 registros..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="h-8 w-56 rounded-md border border-gray-200 bg-[#f9fafb] px-3 text-xs text-gray-700 placeholder-gray-400 focus:bg-white focus:border-[#0066d6] focus:outline-none"
              />
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-[11px] font-semibold text-gray-500">
                <th className="py-2.5 pr-4">
                  <div className="flex items-center gap-1 cursor-pointer">
                    <span>Produtos</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-2.5 px-4 text-center">
                  <div className="flex items-center justify-center gap-1 cursor-pointer">
                    <span>Unidades vendidas</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-2.5 px-4 text-center">
                  <div className="flex items-center justify-center gap-1 cursor-pointer">
                    <span>Visualizações</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-2.5 pl-4 text-right">
                  <div className="flex items-center justify-end gap-1 cursor-pointer">
                    <span>CVR</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-xs text-gray-500">
                    Nenhum produto vendido no período selecionado.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.name} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 pr-4 font-medium text-gray-800">
                      <span className="inline-flex items-center gap-1.5 hover:text-[#0066d6] cursor-pointer">
                        {p.name}
                        <ExternalLink className="h-3 w-3 text-gray-400" />
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-700 font-semibold">{p.sold}</td>
                    <td className="py-3 px-4 text-center text-gray-600">{p.views}</td>
                    <td className="py-3 pl-4 text-right font-medium text-gray-800">{p.cvr}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Nuvemshop Image 4 */}
        <div className="mt-4 flex items-center justify-end gap-1 text-xs text-gray-600 border-t border-gray-100 pt-3">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-40"
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCurrentPage(1)}
            className={`h-7 w-7 rounded text-xs font-semibold ${
              currentPage === 1 ? "bg-[#0066d6] text-white" : "hover:bg-gray-100"
            }`}
          >
            1
          </button>
          <button
            onClick={() => setCurrentPage(2)}
            className={`h-7 w-7 rounded text-xs font-semibold ${
              currentPage === 2 ? "bg-[#0066d6] text-white" : "hover:bg-gray-100"
            }`}
          >
            2
          </button>
          <button
            onClick={() => setCurrentPage(3)}
            className={`h-7 w-7 rounded text-xs font-semibold ${
              currentPage === 3 ? "bg-[#0066d6] text-white" : "hover:bg-gray-100"
            }`}
          >
            3
          </button>
          <button
            onClick={() => setCurrentPage(Math.min(3, currentPage + 1))}
            className="p-1 rounded hover:bg-gray-100"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Detalhe por variante de produto Table (Image 5) */}
      <div className="rounded-lg border border-[#e6e8ee] bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
            <span>Detalhe por variante de produto</span>
            <Info className="h-3.5 w-3.5 text-gray-400" />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Pesquisar 1 registro..."
              className="h-8 w-52 rounded-md border border-gray-200 bg-[#f9fafb] px-3 text-xs text-gray-700 placeholder-gray-400 focus:bg-white focus:border-[#0066d6] focus:outline-none"
            />
            <button className="text-gray-400 hover:text-gray-600">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-[11px] font-semibold text-gray-500">
                <th className="py-2.5 pr-4">
                  <div className="flex items-center gap-1 cursor-pointer">
                    <span>Produtos</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-2.5 px-3">
                  <div className="flex items-center gap-1 cursor-pointer">
                    <span>Variante</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-2.5 px-3 text-center">
                  <div className="flex items-center justify-center gap-1 cursor-pointer">
                    <span>Unidades vendidas</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-2.5 px-3 text-center">
                  <div className="flex items-center justify-center gap-1 cursor-pointer">
                    <span>Estoque atual</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-2.5 px-3 text-center">
                  <div className="flex items-center justify-center gap-1 cursor-pointer">
                    <span>Dias restantes de estoque</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-2.5 pl-4 text-right">
                  <div className="flex items-center justify-end gap-1 cursor-pointer">
                    <span>Receita</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6} className="py-8 text-center text-xs text-gray-500">
                  Nenhuma variante com vendas no período selecionado.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom 2 Cards (Image 5): Com estoque reservado & Dispersão */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Com estoque reservado */}
        <div className="rounded-lg border border-[#e6e8ee] bg-white p-5 shadow-xs lg:col-span-6 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
              <span>Com estoque reservado</span>
              <Info className="h-3.5 w-3.5 text-gray-400" />
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>

          <div className="py-16 flex flex-col items-center justify-center text-center text-gray-400">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-gray-50 mb-3 border border-gray-200">
              <Info className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-xs max-w-xs text-gray-500">
              Não há produtos com estoque reservado para esse período
            </p>
          </div>
        </div>

        {/* Dispersão de vendas vs estoque */}
        <div className="rounded-lg border border-[#e6e8ee] bg-white p-5 shadow-xs lg:col-span-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
              <span>Dispersão de vendas vs estoque</span>
              <Info className="h-3.5 w-3.5 text-gray-400" />
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>

          <div className="pt-6">
            <div className="relative h-44 w-full border-l border-b border-gray-300">
              {/* Y Axis labels */}
              <div className="absolute -left-6 inset-y-0 flex flex-col justify-between text-[10px] text-gray-400">
                <span>2</span>
                <span>1</span>
                <span>0</span>
              </div>

              {/* Y Axis Title */}
              <div className="absolute -left-12 top-1/2 -translate-y-1/2 -rotate-90 text-[9px] text-gray-400 font-medium">
                Quantidade vendida
              </div>

              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between border-t border-dashed border-gray-200 pointer-events-none">
                <div className="w-full border-b border-dashed border-gray-200" />
                <div className="w-full border-b border-dashed border-gray-200" />
              </div>

              {/* Scatter Points */}
              <div
                className="absolute h-2.5 w-2.5 rounded-full bg-[#0066d6] ring-2 ring-blue-200"
                style={{ left: "20%", bottom: "2px" }}
                title="Estoque: 5, Vendas: 0"
              />
              <div
                className="absolute h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200"
                style={{ left: "55%", bottom: "2px" }}
                title="Estoque: 8, Vendas: 0"
              />
              <div
                className="absolute h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-amber-200"
                style={{ left: "90%", bottom: "2px" }}
                title="Estoque: 10, Vendas: 0"
              />
            </div>

            {/* X Axis labels */}
            <div className="flex justify-between pl-4 pt-1 text-[10px] text-gray-400">
              <span>0</span>
              <span>5</span>
              <span>10</span>
            </div>
            <div className="text-center text-[9px] text-gray-400 font-medium mt-1">Estoque</div>
          </div>
        </div>
      </div>
    </div>
  );
}
