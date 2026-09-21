import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  DollarSign,
  Download,
  ExternalLink,
  HelpCircle,
  Info,
  Mail,
  Search,
  Settings,
  SlidersHorizontal,
  X,
  Zap,
  Cloud,
  Trash2,
} from "lucide-react";
import {
  AbandonedCartItem,
  getCachedAbandonedCarts,
  subscribeAbandonedCarts,
  deleteAbandonedCartFromFirestore,
} from "@/data/admin-orders-data";

export function AbandonedCarts() {
  const [carts, setCarts] = useState<AbandonedCartItem[]>(() => getCachedAbandonedCarts());

  useEffect(() => {
    const unsubscribe = subscribeAbandonedCarts((loaded) => {
      setCarts(loaded);
    });
    return () => unsubscribe();
  }, []);

  const [searchEmail, setSearchEmail] = useState("");
  const [showOpportunityBanner, setShowOpportunityBanner] = useState(true);
  const [selectedCart, setSelectedCart] = useState<AbandonedCartItem | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const handleDeleteCart = (cartId: string) => {
    deleteAbandonedCartFromFirestore(cartId)
      .then(() => {
        toast.success("Carrinho removido do Firestore com sucesso!");
        if (selectedCart && selectedCart.id === cartId) {
          setSelectedCart(null);
        }
      })
      .catch(() => toast.error("Erro ao remover carrinho do Firestore."));
  };

  const filteredCarts = carts.filter(
    (c) =>
      c.email.toLowerCase().includes(searchEmail.toLowerCase()) ||
      c.customer.toLowerCase().includes(searchEmail.toLowerCase()) ||
      c.cartNumber.toLowerCase().includes(searchEmail.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight sm:text-3xl">
            Carrinhos abandonados
          </h1>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Cloud className="w-3.5 h-3.5 text-emerald-600" />
            Firestore Ativo
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Exportar */}
          <button
            type="button"
            onClick={() => {
              const csv =
                "Carrinho,Data,Total,Cliente,E-mail,Tentativa Pagamento,Ação\n" +
                carts
                  .map(
                    (c) =>
                      `"${c.cartNumber}","${c.date}","${c.total}","${c.customer}","${c.email}","${c.hasPaymentAttempt ? "Sim" : "Não"}","${c.actionStatus}"`,
                  )
                  .join("\n");
              const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "carrinhos_abandonados.csv";
              a.click();
            }}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-xs hover:bg-gray-50 transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-gray-500" />
            <span>Exportar</span>
          </button>

          {/* Configurar */}
          <button
            type="button"
            onClick={() => setShowConfigModal(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#0066d6] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#0052b3] transition-colors"
          >
            <Settings className="h-3.5 w-3.5" />
            <span>Configurar</span>
          </button>
        </div>
      </div>

      {/* Subtitle Description */}
      <p className="text-xs text-gray-600 max-w-4xl leading-relaxed">
        Gerencie seus carrinhos dos últimos 30 dias. Eles aparecem nesta lista a partir de 60
        minutos após terem sido iniciados, assim que o cliente insere seus dados de contato.
      </p>

      {/* Badges row (Envio automático & E-mail ativado) */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-[#0066d6]">
          <Zap className="h-3 w-3 text-[#0066d6]" />
          <span>Envio automático</span>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
          <Mail className="h-3 w-3 text-emerald-600" />
          <span>E-mail ativado</span>
        </div>
      </div>

      {/* Opportunity Callout Banner */}
      {showOpportunityBanner && (
        <div className="flex items-start justify-between rounded-lg border border-[#cbe4fb] bg-[#eef6fe] p-4 text-xs text-[#0a4fa6]">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 grid h-4 w-4 place-items-center rounded-full border border-[#0a4fa6] text-[10px] font-bold">
              i
            </div>
            <div>
              <p className="font-bold text-gray-900">Oportunidade!</p>
              <p className="mt-0.5 text-gray-700">
                Carrinhos com{" "}
                <span className="inline-flex items-center justify-center rounded-sm bg-blue-100 px-1 py-0.2 text-[11px] font-bold text-[#0066d6]">
                  $
                </span>{" "}
                registram tentativas de pagamento e têm mais chances de virarem vendas.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowOpportunityBanner(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex items-center justify-between rounded-lg border border-[#e6e8ee] bg-white p-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por e-mail"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            className="h-8 w-full rounded-md border border-gray-200 bg-[#f9fafb] pl-9 pr-3 text-xs text-gray-700 placeholder-gray-400 focus:bg-white focus:border-[#0066d6] focus:outline-none"
          />
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-[#f9fafb] px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
        >
          <SlidersHorizontal className="h-3 w-3 text-gray-500" />
          <span>Filtrar</span>
        </button>
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-lg border border-[#e6e8ee] bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-[#f9fafb] text-[11px] font-semibold text-gray-600">
                <th className="py-3 px-4">Carrinho</th>
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">E-mail</th>
                <th className="py-3 px-4">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCarts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-gray-500">
                    Nenhum carrinho abandonado no momento.
                  </td>
                </tr>
              ) : (
                filteredCarts.map((item) => (
                  <tr key={item.id} className="hover:bg-[#f8fafd] transition-colors">
                    {/* Carrinho */}
                    <td className="py-3 px-4 font-semibold text-[#0066d6] whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedCart(item)}
                          className="hover:underline"
                        >
                          {item.cartNumber}
                        </button>
                        {item.hasPaymentAttempt && (
                          <span
                            className="inline-flex items-center justify-center rounded-sm bg-blue-100 px-1 py-0.2 text-[11px] font-bold text-[#0066d6]"
                            title="Tentativa de pagamento registrada"
                          >
                            $
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Data */}
                    <td className="py-3 px-4 text-gray-700 whitespace-nowrap">{item.date}</td>

                    {/* Total */}
                    <td className="py-3 px-4 font-bold text-gray-900 whitespace-nowrap">
                      {item.total}
                    </td>

                    {/* Cliente */}
                    <td className="py-3 px-4 text-gray-800 font-medium whitespace-nowrap">
                      {item.customer}
                    </td>

                    {/* E-mail */}
                    <td className="py-3 px-4 text-gray-600 whitespace-nowrap">{item.email}</td>

                    {/* Ação */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 font-semibold text-gray-800">
                        <span>{item.actionStatus}</span>
                        <HelpCircle
                          className="h-3.5 w-3.5 text-gray-400 cursor-pointer hover:text-gray-600"
                          title="E-mail de recuperação enviado automaticamente"
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info & Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs text-gray-500">
        <span>
          Mostrando 1-{filteredCarts.length} carrinhos de {carts.length}
        </span>

        <a
          href="#mais-sobre-carrinhos"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0066d6] hover:underline"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          <span>Mais sobre carrinhos abandonados</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Cart Details Modal */}
      {selectedCart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Carrinho {selectedCart.cartNumber}
                </h3>
                <p className="text-xs text-gray-500">Abandonado em {selectedCart.date}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCart(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="rounded-lg bg-gray-50 p-3 border border-gray-100">
                <p className="font-bold text-gray-800">{selectedCart.customer}</p>
                <p className="text-gray-600">{selectedCart.email}</p>
                {selectedCart.hasPaymentAttempt && (
                  <p className="mt-1 font-semibold text-[#0066d6]">
                    Tentativa de checkout iniciada
                  </p>
                )}
              </div>

              <div>
                <p className="font-semibold text-gray-700 mb-1">Itens no carrinho:</p>
                <div className="rounded-lg border border-gray-200 divide-y divide-gray-100">
                  {selectedCart.products.map((p, idx) => (
                    <div key={idx} className="flex justify-between p-2.5">
                      <span>
                        {p.quantity}x {p.name}
                      </span>
                      <span className="font-bold text-gray-900">{p.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 font-bold text-sm">
                <span>Total do carrinho:</span>
                <span className="text-[#0066d6] text-base">{selectedCart.total}</span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-3">
              <button
                type="button"
                onClick={() => {
                  if (confirm("Deseja realmente remover este carrinho abandonado do Firestore?")) {
                    handleDeleteCart(selectedCart.id);
                  }
                }}
                className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Excluir</span>
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCart(null)}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toast.success(
                      `E-mail de recuperação reenviado com sucesso para ${selectedCart.email}!`,
                    );
                    setSelectedCart(null);
                  }}
                  className="rounded-md bg-[#0066d6] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#0052b3]"
                >
                  Reenviar e-mail de recuperação
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Configurar Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Settings className="h-4 w-4 text-[#0066d6]" />
                Recuperação de Carrinhos
              </h3>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-gray-600">
              <p>
                Os e-mails automáticos de recuperação estão ativos com disparo 60 minutos após o
                abandono.
              </p>
              <div className="rounded-lg bg-gray-50 p-3 border border-gray-100 space-y-2">
                <label className="flex items-center gap-2 font-medium text-gray-700">
                  <input type="checkbox" defaultChecked className="rounded text-[#0066d6]" />
                  Enviar lembrete automático por e-mail
                </label>
                <label className="flex items-center gap-2 font-medium text-gray-700">
                  <input type="checkbox" defaultChecked className="rounded text-[#0066d6]" />
                  Incluir cupom de incentivo (5% OFF) no segundo lembrete
                </label>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="rounded-md bg-[#0066d6] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#0052b3]"
              >
                Salvar preferências
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
