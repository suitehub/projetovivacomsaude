import React, { useState } from "react";
import { toast } from "sonner";
import {
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Mail,
  MessageCircle,
  MessageSquare,
  MoreVertical,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { CustomerMessageItem, INITIAL_ADMIN_MESSAGES } from "@/data/admin-customers-data";

export function CustomerMessages() {
  const [messages, setMessages] = useState<CustomerMessageItem[]>(() => {
    try {
      const saved = localStorage.getItem("viva_admin_customer_messages");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (
            parsed.some(
              (m: CustomerMessageItem) =>
                m.senderEmail === "mariana.silva@email.com" || m.id === "msg-1",
            )
          ) {
            localStorage.setItem("viva_admin_customer_messages", JSON.stringify([]));
            return [];
          }
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_ADMIN_MESSAGES;
  });

  const [selectedMessage, setSelectedMessage] = useState<CustomerMessageItem | null>(null);
  const [replyText, setReplyText] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const saveMessages = (updated: CustomerMessageItem[]) => {
    setMessages(updated);
    try {
      localStorage.setItem("viva_admin_customer_messages", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === messages.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(messages.map((m) => m.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    );
  };

  const handleDeleteSelected = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteSelected = () => {
    const count = selectedIds.length;
    const updated = messages.filter((m) => !selectedIds.includes(m.id));
    saveMessages(updated);
    setSelectedIds([]);
    setShowDeleteModal(false);
    toast.success(`${count} mensagem(ns) excluída(s) com sucesso!`);
  };

  const handleSendReply = () => {
    if (!selectedMessage || !replyText.trim()) return;

    const updated = messages.map((m) => {
      if (m.id === selectedMessage.id) {
        return {
          ...m,
          status: "Respondida" as const,
          replyContent: replyText,
          replyDate: new Date().toLocaleDateString("pt-BR"),
        };
      }
      return m;
    });

    saveMessages(updated);
    setSelectedMessage({
      ...selectedMessage,
      status: "Respondida",
      replyContent: replyText,
      replyDate: new Date().toLocaleDateString("pt-BR"),
    });
    setReplyText("");
  };

  const handleToggleStatus = (id: string) => {
    const updated = messages.map((m) => {
      if (m.id === id) {
        const nextStatus: "Não respondida" | "Respondida" =
          m.status === "Não respondida" ? "Respondida" : "Não respondida";
        return { ...m, status: nextStatus };
      }
      return m;
    });
    saveMessages(updated);
    setActiveMenuId(null);
  };

  const handleDeleteSingle = (id: string) => {
    const updated = messages.filter((m) => m.id !== id);
    saveMessages(updated);
    if (selectedMessage?.id === id) {
      setSelectedMessage(null);
    }
    setActiveMenuId(null);
  };

  return (
    <div className="min-h-screen bg-[#f7f9fa] pb-16 font-sans">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header matching screenshot 3 */}
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Mensagens</h1>
          <p className="mt-1 text-xs text-gray-600">
            Seus clientes sempre por perto! Confira suas mensagens, consultas e notificações feitas
            por eles.
          </p>
        </div>

        {/* Selected count action bar */}
        {selectedIds.length > 0 && (
          <div className="mb-4 flex items-center justify-between rounded-xl bg-blue-50 px-4 py-2.5 border border-blue-200">
            <span className="text-xs font-semibold text-[#0066d6]">
              {selectedIds.length} mensagem(ns) selecionada(s)
            </span>
            <button
              type="button"
              onClick={handleDeleteSelected}
              className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Excluir selecionadas
            </button>
          </div>
        )}

        {/* Messages Table matching screenshot 3 */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600 border-collapse">
              <thead className="border-b border-gray-200 bg-gray-50/70 text-[11px] font-bold text-gray-700">
                <tr>
                  <th className="w-10 px-4 py-3.5">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === messages.length && messages.length > 0}
                      onChange={handleToggleSelectAll}
                      className="h-4 w-4 rounded border-gray-300 text-[#0066d6] focus:ring-[#0066d6]"
                    />
                  </th>
                  <th className="px-5 py-3.5 min-w-[340px]">Mensagens</th>
                  <th className="px-5 py-3.5 min-w-[140px]">Data</th>
                  <th className="px-5 py-3.5 min-w-[180px]">Estado</th>
                  <th className="px-5 py-3.5 text-right w-16">Ações</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {messages.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-xs text-gray-500">
                      Nenhuma mensagem recebida até o momento.
                    </td>
                  </tr>
                ) : (
                  messages.map((item) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-blue-50/20 transition-colors ${
                        item.status === "Não respondida" ? "bg-amber-50/15" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="w-10 px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => handleToggleSelect(item.id)}
                          className="h-4 w-4 rounded border-gray-300 text-[#0066d6] focus:ring-[#0066d6]"
                        />
                      </td>

                      {/* Mensagem content & sender name in blue */}
                      <td
                        className="px-5 py-4 cursor-pointer"
                        onClick={() => setSelectedMessage(item)}
                      >
                        <span className="font-bold text-[#0066d6] hover:underline block text-xs">
                          {item.senderName}
                        </span>
                        <p className="mt-1 text-xs text-gray-700 leading-relaxed line-clamp-3">
                          {item.content}
                        </p>
                      </td>

                      {/* Data */}
                      <td
                        className="px-5 py-4 text-xs text-gray-600 cursor-pointer whitespace-nowrap"
                        onClick={() => setSelectedMessage(item)}
                      >
                        {item.date}
                      </td>

                      {/* Estado: Pill badges matching screenshot 3 */}
                      <td
                        className="px-5 py-4 cursor-pointer whitespace-nowrap"
                        onClick={() => setSelectedMessage(item)}
                      >
                        <div className="flex items-center gap-1.5">
                          {/* Type badge: Mensagem or Newsletter */}
                          <span className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-gray-50 px-2.5 py-0.5 text-[11px] font-medium text-gray-700">
                            {item.type === "Newsletter" ? (
                              <>
                                <Mail className="h-3 w-3 text-gray-500" />
                                Newsletter
                              </>
                            ) : (
                              <>
                                <MessageSquare className="h-3 w-3 text-gray-500" />
                                Mensagem
                              </>
                            )}
                          </span>

                          {/* Status badge: Não respondida or Respondida */}
                          {item.status === "Não respondida" ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
                              <Clock className="h-3 w-3 text-amber-600" />
                              Não respondida
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                              <Check className="h-3 w-3 text-emerald-600" />
                              Respondida
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Ações (3 dots menu) */}
                      <td className="px-5 py-4 text-right relative">
                        <button
                          type="button"
                          onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {activeMenuId === item.id && (
                          <div className="absolute right-4 top-10 w-44 rounded-xl border border-gray-200 bg-white py-1 shadow-xl z-20 text-left text-xs">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedMessage(item);
                                setActiveMenuId(null);
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50"
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                              Ver conversa
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(item.id)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Marcar como{" "}
                              {item.status === "Não respondida" ? "respondida" : "não respondida"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSingle(item.id)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Excluir mensagem
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-200 bg-white px-5 py-3.5 text-xs text-gray-500">
            Mostrando 1-{messages.length} mensagens de {messages.length}
          </div>
        </div>

        {/* Footer Link matching screenshot 3 */}
        <div className="mt-4 flex items-center gap-1.5 text-xs text-gray-600">
          <span className="text-gray-400">ⓘ</span>
          <a
            href="https://atendimento.nuvemshop.com.br"
            target="_blank"
            rel="noreferrer"
            className="text-[#0066d6] hover:underline inline-flex items-center gap-1"
          >
            Mais sobre mensagens
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Modal: Visualizar e Responder Mensagem */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <p className="text-[11px] font-bold uppercase text-gray-400">
                  {selectedMessage.type} • {selectedMessage.date}
                </p>
                <h3 className="text-base font-bold text-gray-900">{selectedMessage.senderName}</h3>
                <p className="text-xs text-gray-500">{selectedMessage.senderEmail}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Message details & contextual info */}
            {selectedMessage.orderNumber && (
              <div className="rounded-lg bg-blue-50 p-3 text-xs text-[#0066d6] font-medium border border-blue-200">
                Pedido vinculado: <strong>{selectedMessage.orderNumber}</strong>
                {selectedMessage.trackingCode && (
                  <span className="block mt-0.5">
                    Código de rastreio: <strong>{selectedMessage.trackingCode}</strong>
                  </span>
                )}
              </div>
            )}

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-800 leading-relaxed whitespace-pre-wrap">
              {selectedMessage.content}
            </div>

            {/* Previous reply if any */}
            {selectedMessage.replyContent && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Resposta enviada ({selectedMessage.replyDate}):
                </span>
                <p className="text-xs text-gray-800 whitespace-pre-wrap">
                  {selectedMessage.replyContent}
                </p>
              </div>
            )}

            {/* Reply Input Form */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-gray-700">
                Responder para {selectedMessage.senderEmail || selectedMessage.senderName}:
              </label>
              <textarea
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Escreva sua resposta para o cliente..."
                className="w-full rounded-xl border border-gray-300 p-3 text-xs text-gray-800 focus:border-[#0066d6] focus:outline-hidden"
              />

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  {selectedMessage.senderPhone && (
                    <a
                      href={`https://wa.me/${selectedMessage.senderPhone.replace(/\D/g, "")}?text=${encodeURIComponent("Olá " + selectedMessage.senderName + ", referente à sua mensagem no Projeto Viva com Saúde:")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
                    >
                      <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                      Responder no WhatsApp
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMessage(null)}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                  >
                    Fechar
                  </button>
                  <button
                    type="button"
                    onClick={handleSendReply}
                    disabled={!replyText.trim()}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#0066d6] px-4 py-2 text-xs font-bold text-white hover:bg-[#0052ad] disabled:opacity-50 transition-colors"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Enviar resposta
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Messages Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red-100 text-red-600">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Excluir {selectedIds.length} mensagem{selectedIds.length > 1 ? "s" : ""}
                </h3>
                <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                  Tem certeza de que deseja excluir as mensagens selecionadas? Esta ação não pode
                  ser desfeita.
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
                onClick={confirmDeleteSelected}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 shadow-xs transition-colors"
              >
                Sim, excluir mensagens
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
