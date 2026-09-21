import { useState, useEffect } from "react";
import { User, Mail, Phone, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserProfile, updateUserProfile } from "@/data/user-auth";
import { toast } from "sonner";

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserProfile | null;
}

export function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (!digits) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export function EditProfileModal({ open, onOpenChange, user }: EditProfileModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && open) {
      setFullName(user.fullName || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setNewPassword("");
      setConfirmPassword("");
      setError("");
    }
  }, [user, open]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhoneNumber(e.target.value));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError("");

    if (!fullName.trim()) {
      setError("Por favor, preencha seu nome completo.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Por favor, informe um e-mail válido.");
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) {
      setError("Por favor, informe um telefone com DDD válido.");
      return;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        setError("A nova senha deve ter no mínimo 6 caracteres.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("As senhas não coincidem.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const updates: Partial<UserProfile> = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
      };

      if (newPassword) {
        updates.password = newPassword;
      }

      const res = await updateUserProfile(user.id, updates);
      if (!res.success) {
        setError(res.error || "Erro ao salvar alterações.");
        return;
      }

      toast.success("Dados cadastrais atualizados com sucesso!");
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <User className="h-5 w-5 text-primary" />
            Editar Meus Dados
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Atualize suas informações de contato e preferências de login.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 py-2">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="edit-name" className="text-xs font-semibold text-gray-700">
              Nome Completo *
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="edit-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ex: Maria Clara Silva"
                className="pl-9 h-10 text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-email" className="text-xs font-semibold text-gray-700">
              E-mail *
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="edit-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                className="pl-9 h-10 text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-phone" className="text-xs font-semibold text-gray-700">
              Telefone / WhatsApp *
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="edit-phone"
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="(00) 00000-0000"
                className="pl-9 h-10 text-sm"
                required
              />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Alterar senha (opcional)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="edit-password" className="text-[11px] text-gray-600">
                  Nova Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="edit-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 dígitos"
                    className="pl-8 h-9 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="edit-confirm-password" className="text-[11px] text-gray-600">
                  Confirmar Nova Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="edit-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    className="pl-8 h-9 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10 text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-10 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
