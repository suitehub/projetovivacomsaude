import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminLayout, type StatSubTab } from "@/components/admin/admin-layout";
import { StatisticsOverview } from "@/components/admin/statistics-overview";
import { StatisticsProducts } from "@/components/admin/statistics-products";
import { StatisticsOthers } from "@/components/admin/statistics-others";
import { SalesList } from "@/components/admin/sales-list";
import { AbandonedCarts } from "@/components/admin/abandoned-carts";
import { ProductsList } from "@/components/admin/products-list";
import { CustomersList } from "@/components/admin/customers-list";
import { CustomerMessages } from "@/components/admin/customer-messages";
import { OnlineStoreCustomizer } from "@/components/admin/online-store-customizer";
import { DiscountsList } from "@/components/admin/discounts-list";

export const Route = createFileRoute("/admin")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): { tab?: StatSubTab } => {
    return {
      tab: (search.tab as StatSubTab) || undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Painel do Administrador | Projeto Viva com Saúde" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const search = Route.useSearch();
  const [activeSubTab, setActiveSubTab] = useState<StatSubTab>(search.tab || "lista-de-clientes");

  return (
    <AdminLayout activeSubTab={activeSubTab} onSelectSubTab={setActiveSubTab}>
      {activeSubTab === "lista-de-clientes" && <CustomersList />}
      {activeSubTab === "mensagens-clientes" && <CustomerMessages />}
      {activeSubTab === "lista-de-produtos" && <ProductsList />}
      {activeSubTab === "categorias-produtos" && <ProductsList />}
      {activeSubTab === "lista-de-vendas" && <SalesList />}
      {activeSubTab === "carrinhos-abandonados" && <AbandonedCarts />}
      {activeSubTab === "descontos" && <DiscountsList />}
      {activeSubTab === "loja-online" && <OnlineStoreCustomizer />}
      {activeSubTab === "visao-geral" && <StatisticsOverview />}
      {activeSubTab === "produtos" && <StatisticsProducts />}
      {(activeSubTab === "vendas-e-clientes" ||
        activeSubTab === "visitas" ||
        activeSubTab === "tempo-real" ||
        activeSubTab === "relatorio-de-cupons") && <StatisticsOthers tab={activeSubTab} />}
    </AdminLayout>
  );
}
