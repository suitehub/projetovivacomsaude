import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Menu,
  MessageCircle,
  MessageSquare,
  MoreVertical,
  PanelLeftClose,
  PanelLeftOpen,
  Percent,
  Search,
  Settings,
  Share2,
  ShoppingBag,
  Store,
  Tag,
  Truck,
  Users,
  X,
} from "lucide-react";

export type StatSubTab =
  | "visao-geral"
  | "produtos"
  | "vendas-e-clientes"
  | "visitas"
  | "tempo-real"
  | "relatorio-de-cupons"
  | "lista-de-vendas"
  | "carrinhos-abandonados"
  | "lista-de-produtos"
  | "categorias-produtos"
  | "lista-de-clientes"
  | "mensagens-clientes"
  | "descontos"
  | "loja-online";

interface AdminLayoutProps {
  children: ReactNode;
  activeSubTab: StatSubTab;
  onSelectSubTab: (tab: StatSubTab) => void;
}

export function AdminLayout({ children, activeSubTab, onSelectSubTab }: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [statsExpanded, setStatsExpanded] = useState(
    activeSubTab === "visao-geral" ||
      activeSubTab === "produtos" ||
      activeSubTab === "vendas-e-clientes" ||
      activeSubTab === "visitas" ||
      activeSubTab === "tempo-real" ||
      activeSubTab === "relatorio-de-cupons",
  );
  const [salesExpanded, setSalesExpanded] = useState(
    activeSubTab === "lista-de-vendas" || activeSubTab === "carrinhos-abandonados",
  );
  const [productsExpanded, setProductsExpanded] = useState(
    activeSubTab === "lista-de-produtos" || activeSubTab === "categorias-produtos",
  );
  const [customersExpanded, setCustomersExpanded] = useState(
    activeSubTab === "lista-de-clientes" || activeSubTab === "mensagens-clientes",
  );

  const statMenuItems: { id: StatSubTab; label: string }[] = [
    { id: "visao-geral", label: "Visão geral" },
    { id: "produtos", label: "Produtos" },
    { id: "vendas-e-clientes", label: "Vendas e clientes" },
    { id: "visitas", label: "Visitas" },
    { id: "tempo-real", label: "Tempo real" },
    { id: "relatorio-de-cupons", label: "Relatório de cupons" },
  ];

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#222b45] font-sans antialiased flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Sidebar Backdrop */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[#e6e8ee] bg-white transition-all duration-200 lg:static ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          } ${sidebarCollapsed ? "lg:w-16" : "lg:w-64"} w-72`}
        >
          {/* Sidebar Header with Project Logo */}
          <div className="flex h-16 items-center justify-between border-b border-[#f0f2f5] px-4">
            <Link to="/" className="flex items-center gap-2 overflow-hidden" title="Voltar à Loja">
              <img
                src="/logoprojeto.png"
                alt="Projeto Viva com Saúde"
                className="h-8 max-h-9 w-auto max-w-[170px] object-contain"
              />
            </Link>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:inline-flex h-8 w-8 items-center justify-center rounded text-gray-500 hover:bg-gray-100"
                title={sidebarCollapsed ? "Expandir menu" : "Recolher menu"}
              >
                {sidebarCollapsed ? (
                  <PanelLeftOpen className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="lg:hidden inline-flex h-8 w-8 items-center justify-center rounded text-gray-500 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4 text-xs font-medium scrollbar-thin">
            {/* Main Menu */}
            <div className="space-y-1">
              {/* Estatísticas Accordion */}
              <div>
                <button
                  type="button"
                  onClick={() => setStatsExpanded(!statsExpanded)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 transition-colors ${
                    activeSubTab === "visao-geral" ||
                    activeSubTab === "produtos" ||
                    activeSubTab === "vendas-e-clientes" ||
                    activeSubTab === "visitas" ||
                    activeSubTab === "tempo-real" ||
                    activeSubTab === "relatorio-de-cupons"
                      ? "bg-[#eaf1fb] text-[#0066d6] font-semibold"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <BarChart3
                      className={`h-4 w-4 shrink-0 ${
                        activeSubTab === "visao-geral" ||
                        activeSubTab === "produtos" ||
                        activeSubTab === "vendas-e-clientes" ||
                        activeSubTab === "visitas" ||
                        activeSubTab === "tempo-real" ||
                        activeSubTab === "relatorio-de-cupons"
                          ? "text-[#0066d6]"
                          : "text-gray-500"
                      }`}
                    />
                    {!sidebarCollapsed && <span>Estatísticas</span>}
                  </div>
                  {!sidebarCollapsed && (
                    <ChevronDown
                      className={`h-4 w-4 transition-transform text-gray-500 ${
                        statsExpanded ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>

                {/* Sub-items */}
                {!sidebarCollapsed && statsExpanded && (
                  <div className="mt-1 ml-4 border-l-2 border-[#d0e0fa] pl-3 space-y-0.5 py-1">
                    {statMenuItems.map((item) => {
                      const isActive = activeSubTab === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            onSelectSubTab(item.id);
                            setMobileMenuOpen(false);
                          }}
                          className={`flex w-full items-center rounded-md px-2.5 py-1.5 text-left text-xs transition-colors ${
                            isActive
                              ? "bg-[#0066d6] text-white font-semibold shadow-xs"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Gestão Section */}
            <div>
              {!sidebarCollapsed && (
                <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Gestão
                </p>
              )}
              <div className="space-y-1">
                {/* Vendas Accordion */}
                <div>
                  <button
                    type="button"
                    onClick={() => setSalesExpanded(!salesExpanded)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 transition-colors ${
                      activeSubTab === "lista-de-vendas" || activeSubTab === "carrinhos-abandonados"
                        ? "bg-[#eaf1fb] text-[#0066d6] font-semibold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ShoppingBag
                        className={`h-4 w-4 shrink-0 ${
                          activeSubTab === "lista-de-vendas" ||
                          activeSubTab === "carrinhos-abandonados"
                            ? "text-[#0066d6]"
                            : "text-gray-500"
                        }`}
                      />
                      {!sidebarCollapsed && <span>Vendas</span>}
                    </div>
                    {!sidebarCollapsed && (
                      <div className="flex items-center gap-1.5">
                        <ChevronDown
                          className={`h-3.5 w-3.5 text-gray-500 transition-transform ${
                            salesExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    )}
                  </button>

                  {/* Vendas Sub-items (Sem pedidos manuais) */}
                  {!sidebarCollapsed && salesExpanded && (
                    <div className="mt-1 ml-4 border-l-2 border-[#d0e0fa] pl-3 space-y-0.5 py-1">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectSubTab("lista-de-vendas");
                          setMobileMenuOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs transition-colors ${
                          activeSubTab === "lista-de-vendas"
                            ? "bg-[#0066d6] text-white font-semibold shadow-xs"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <span>Lista de vendas</span>
                        <span
                          className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                            activeSubTab === "lista-de-vendas"
                              ? "bg-white/20 text-white"
                              : "bg-[#0066d6] text-white"
                          }`}
                        >
                          40
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onSelectSubTab("carrinhos-abandonados");
                          setMobileMenuOpen(false);
                        }}
                        className={`flex w-full items-center rounded-md px-2.5 py-1.5 text-left text-xs transition-colors ${
                          activeSubTab === "carrinhos-abandonados"
                            ? "bg-[#0066d6] text-white font-semibold shadow-xs"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        Carrinhos abandonados
                      </button>
                    </div>
                  )}
                </div>

                {/* Produtos Accordion (Sem inventário conforme solicitado) */}
                <div>
                  <button
                    type="button"
                    onClick={() => setProductsExpanded(!productsExpanded)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 transition-colors ${
                      activeSubTab === "lista-de-produtos" || activeSubTab === "categorias-produtos"
                        ? "bg-[#eaf1fb] text-[#0066d6] font-semibold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Tag
                        className={`h-4 w-4 shrink-0 ${
                          activeSubTab === "lista-de-produtos" ||
                          activeSubTab === "categorias-produtos"
                            ? "text-[#0066d6]"
                            : "text-gray-500"
                        }`}
                      />
                      {!sidebarCollapsed && <span>Produtos</span>}
                    </div>
                    {!sidebarCollapsed && (
                      <ChevronDown
                        className={`h-3.5 w-3.5 text-gray-500 transition-transform ${
                          productsExpanded ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>

                  {!sidebarCollapsed && productsExpanded && (
                    <div className="mt-1 ml-4 border-l-2 border-[#d0e0fa] pl-3 space-y-0.5 py-1">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectSubTab("lista-de-produtos");
                          setMobileMenuOpen(false);
                        }}
                        className={`flex w-full items-center rounded-md px-2.5 py-1.5 text-left text-xs transition-colors ${
                          activeSubTab === "lista-de-produtos"
                            ? "bg-[#0066d6] text-white font-semibold shadow-xs"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        Lista de produtos
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onSelectSubTab("categorias-produtos");
                          setMobileMenuOpen(false);
                        }}
                        className={`flex w-full items-center rounded-md px-2.5 py-1.5 text-left text-xs transition-colors ${
                          activeSubTab === "categorias-produtos"
                            ? "bg-[#0066d6] text-white font-semibold shadow-xs"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        Categorias
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer">
                  <Truck className="h-4 w-4 shrink-0 text-gray-500" />
                  {!sidebarCollapsed && <span>Nuvem Envio</span>}
                </div>

                {/* Clientes Accordion matching Nuvemshop screenshot */}
                <div>
                  <button
                    type="button"
                    onClick={() => setCustomersExpanded(!customersExpanded)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 transition-colors ${
                      activeSubTab === "lista-de-clientes" || activeSubTab === "mensagens-clientes"
                        ? "bg-[#eaf1fb] text-[#0066d6] font-semibold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Users
                        className={`h-4 w-4 shrink-0 ${
                          activeSubTab === "lista-de-clientes" ||
                          activeSubTab === "mensagens-clientes"
                            ? "text-[#0066d6]"
                            : "text-gray-500"
                        }`}
                      />
                      {!sidebarCollapsed && <span>Clientes</span>}
                    </div>

                    {!sidebarCollapsed && (
                      <div className="flex items-center gap-1.5">
                        <span className="rounded-full bg-[#0066d6] px-1.5 py-0.2 text-[10px] font-bold text-white leading-none">
                          3
                        </span>
                        <ChevronDown
                          className={`h-3.5 w-3.5 text-gray-500 transition-transform ${
                            customersExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    )}
                  </button>

                  {!sidebarCollapsed && customersExpanded && (
                    <div className="mt-1 ml-4 border-l-2 border-[#d0e0fa] pl-3 space-y-0.5 py-1">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectSubTab("lista-de-clientes");
                          setMobileMenuOpen(false);
                        }}
                        className={`flex w-full items-center rounded-md px-2.5 py-1.5 text-left text-xs transition-colors ${
                          activeSubTab === "lista-de-clientes"
                            ? "bg-[#0066d6] text-white font-semibold shadow-xs"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        Lista de clientes
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onSelectSubTab("mensagens-clientes");
                          setMobileMenuOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs transition-colors ${
                          activeSubTab === "mensagens-clientes"
                            ? "bg-[#0066d6] text-white font-semibold shadow-xs"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <span>Mensagens</span>
                        <span
                          className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                            activeSubTab === "mensagens-clientes"
                              ? "bg-white text-[#0066d6]"
                              : "bg-[#0066d6] text-white"
                          }`}
                        >
                          3
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSelectSubTab("descontos");
                    setMobileMenuOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 transition-colors ${
                    activeSubTab === "descontos"
                      ? "bg-[#0066d6] text-white font-semibold shadow-xs"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  title={sidebarCollapsed ? "Descontos" : undefined}
                >
                  <div className="flex items-center gap-3">
                    <Percent
                      className={`h-4 w-4 shrink-0 ${
                        activeSubTab === "descontos" ? "text-white" : "text-gray-500"
                      }`}
                    />
                    {!sidebarCollapsed && <span>Descontos</span>}
                  </div>
                </button>
              </div>
            </div>

            {/* Canais de Venda Section (Apenas Loja Online conforme solicitado) */}
            <div>
              {!sidebarCollapsed && (
                <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Canais de venda
                </p>
              )}
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    onSelectSubTab("loja-online");
                    setMobileMenuOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 transition-colors ${
                    activeSubTab === "loja-online"
                      ? "bg-[#0066d6] text-white font-semibold shadow-xs"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Store
                      className={`h-4 w-4 shrink-0 ${
                        activeSubTab === "loja-online" ? "text-white" : "text-gray-500"
                      }`}
                    />
                    {!sidebarCollapsed && <span>Loja online</span>}
                  </div>
                  {!sidebarCollapsed && (
                    <a
                      href="/"
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className={`p-1 rounded hover:bg-black/10 transition-colors ${
                        activeSubTab === "loja-online" ? "text-white" : "text-gray-400"
                      }`}
                      title="Abrir loja em nova aba"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </button>
              </div>
            </div>

            {/* Configurações */}
            <div className="pt-2 border-t border-[#f0f2f5]">
              <button
                type="button"
                onClick={() => {
                  onSelectSubTab("loja-online");
                  setMobileMenuOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 transition-colors ${
                  activeSubTab === "loja-online"
                    ? "text-[#0066d6] font-semibold bg-blue-50"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Settings
                    className={`h-4 w-4 shrink-0 ${
                      activeSubTab === "loja-online" ? "text-[#0066d6]" : "text-gray-500"
                    }`}
                  />
                  {!sidebarCollapsed && <span>Configurações</span>}
                </div>
                {!sidebarCollapsed && <ChevronRight className="h-4 w-4 text-gray-400" />}
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Bar Header */}
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#e6e8ee] bg-white px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-1.5 rounded-md text-gray-600 hover:bg-gray-100"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="relative w-48 sm:w-72">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar no painel..."
                  className="h-8 w-full rounded-full bg-[#f4f5f8] pl-9 pr-3 text-xs text-gray-700 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0066d6]"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* Store Profile */}
              <Link
                to="/"
                className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-gray-100 transition-colors"
                title="Ver loja online"
              >
                <div className="grid h-7 w-7 place-items-center rounded-full bg-[#0066d6] text-xs font-bold text-white">
                  P
                </div>
                <span className="hidden sm:inline text-xs font-medium text-gray-700 max-w-[140px] truncate">
                  Projeto Viva com Saúde
                </span>
              </Link>
            </div>
          </header>

          {/* Page Body */}
          <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
