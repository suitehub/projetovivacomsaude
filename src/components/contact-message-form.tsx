import React, { useState } from "react";
import { MessageSquare, Send, CheckCircle2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CustomerMessageItem, INITIAL_ADMIN_MESSAGES } from "@/data/admin-customers-data";

interface ContactMessageFormProps {
  onSuccess?: () => void;
}

export function ContactMessageForm({ onSuccess }: ContactMessageFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [trackingCode, setTrackingCode] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    const newMessage: CustomerMessageItem = {
      id: `msg-${Date.now()}`,
      senderName: name,
      senderEmail: email,
      senderPhone: phone,
      type: orderNumber ? "Dúvida de Pedido" : "Mensagem",
      orderNumber: orderNumber
        ? orderNumber.startsWith("#")
          ? orderNumber
          : `#${orderNumber}`
        : undefined,
      trackingCode: trackingCode || undefined,
      content: message,
      date: new Date().toLocaleDateString("pt-BR"),
      status: "Não respondida",
    };

    try {
      const stored = localStorage.getItem("viva_admin_customer_messages");
      const currentList: CustomerMessageItem[] = stored
        ? JSON.parse(stored)
        : INITIAL_ADMIN_MESSAGES;
      const updated = [newMessage, ...currentList];
      localStorage.setItem("viva_admin_customer_messages", JSON.stringify(updated));
    } catch {
      // ignore
    }

    setSent(true);
    onSuccess?.();
  };

  if (sent) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-6 text-center space-y-3">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h4 className="font-display text-lg font-bold text-emerald-900">
          Mensagem enviada com sucesso!
        </h4>
        <p className="text-xs text-emerald-700 max-w-md mx-auto">
          Obrigado pelo contato, {name}! Sua mensagem foi registrada em nosso painel e nossa equipe
          responderá em breve através do e-mail informado.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSent(false);
            setName("");
            setEmail("");
            setPhone("");
            setOrderNumber("");
            setTrackingCode("");
            setMessage("");
          }}
          className="text-xs"
        >
          Enviar outra mensagem
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4"
    >
      <div className="flex items-center gap-2.5 pb-2 border-b border-border">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-soft text-primary">
          <MessageSquare className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-base font-bold text-foreground">Fale Conosco / Envie uma Mensagem</h3>
          <p className="text-xs text-muted-foreground">
            Dúvidas sobre produtos, pedidos, rastreamento ou orientações de saúde
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="block font-semibold text-foreground mb-1">
            Seu Nome <span className="text-destructive">*</span>
          </label>
          <Input
            required
            type="text"
            placeholder="Ex: Carlos Leite"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-10 text-xs"
          />
        </div>

        <div>
          <label className="block font-semibold text-foreground mb-1">
            Seu E-mail <span className="text-destructive">*</span>
          </label>
          <Input
            required
            type="email"
            placeholder="seuemail@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-10 text-xs"
          />
        </div>

        <div>
          <label className="block font-semibold text-foreground mb-1">
            Telefone / WhatsApp (opcional)
          </label>
          <Input
            type="text"
            placeholder="(11) 99999-9999"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-10 text-xs"
          />
        </div>

        <div>
          <label className="block font-semibold text-foreground mb-1">
            Número do Pedido (se houver)
          </label>
          <Input
            type="text"
            placeholder="Ex: #132"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            className="h-10 text-xs"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block font-semibold text-foreground mb-1">
            Código de Rastreamento (se houver)
          </label>
          <Input
            type="text"
            placeholder="Ex: AB 569 051 836 BR"
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
            className="h-10 text-xs"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block font-semibold text-foreground mb-1">
            Sua Mensagem ou Dúvida <span className="text-destructive">*</span>
          </label>
          <textarea
            required
            rows={4}
            placeholder="Descreva detalhadamente sua dúvida ou consulta sobre seu pedido ou produtos..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-md border border-input bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <Button type="submit" className="gap-2 px-6">
          <Send className="h-4 w-4" />
          <span>Enviar Mensagem</span>
        </Button>
      </div>
    </form>
  );
}
