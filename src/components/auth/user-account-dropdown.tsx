import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  CircleUserRound,
  LogIn,
  UserPlus,
  User,
  Mail,
  Phone,
  Edit3,
  LogOut,
  ShoppingBag,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCurrentUser } from "@/data/user-auth";
import { EditProfileModal } from "./edit-profile-modal";
import { toast } from "sonner";

interface UserAccountDropdownProps {
  className?: string;
  sideOffset?: number;
}

export function UserAccountDropdown({ className, sideOffset = 8 }: UserAccountDropdownProps) {
  const { user, isLoggedIn, logout } = useCurrentUser();
  const [open, setOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setOpen(false);
    toast.info("Você saiu da sua conta.");
  };

  const handleOpenEdit = () => {
    setOpen(false);
    setEditModalOpen(true);
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={`relative rounded-full hover:bg-muted transition-colors ${className || ""}`}
            aria-label={isLoggedIn ? `Conta de ${user?.fullName}` : "Minha conta"}
            title={isLoggedIn ? user?.fullName : "Entrar ou cadastrar"}
          >
            {isLoggedIn ? (
              <div className="relative">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary border border-primary/20">
                  {getInitials(user?.fullName || "")}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
              </div>
            ) : (
              <CircleUserRound className="h-5 w-5 text-gray-700" />
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          sideOffset={sideOffset}
          className="w-80 p-0 shadow-xl border border-gray-200/80 rounded-xl bg-white overflow-hidden text-gray-900"
        >
          {isLoggedIn && user ? (
            /* Logged in state */
            <div className="divide-y divide-gray-100">
              {/* Header profile info */}
              <div className="p-4 bg-gradient-to-br from-gray-50 to-white">
                <div className="flex items-start gap-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground font-bold text-base shadow-xs">
                    {getInitials(user.fullName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="inline-block text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mb-1">
                      Conectado
                    </span>
                    <h4 className="text-sm font-bold text-gray-900 truncate leading-tight">
                      {user.fullName}
                    </h4>
                    <p className="text-xs text-gray-500 truncate flex items-center gap-1.5 mt-0.5">
                      <Mail className="h-3 w-3 text-gray-400 shrink-0" />
                      {user.email}
                    </p>
                    {user.phone && (
                      <p className="text-xs text-gray-500 truncate flex items-center gap-1.5 mt-0.5">
                        <Phone className="h-3 w-3 text-gray-400 shrink-0" />
                        {user.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions list */}
              <div className="p-2 space-y-1">
                <button
                  type="button"
                  onClick={handleOpenEdit}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors text-left"
                >
                  <Edit3 className="h-4 w-4 text-primary" />
                  <span>Editar dados</span>
                </button>

                <Link
                  to="/conta"
                  search={{ tab: "perfil" }}
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors text-left"
                >
                  <User className="h-4 w-4 text-gray-500" />
                  <span>Painel da Minha Conta</span>
                </Link>

                <Link
                  to="/produtos"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors text-left"
                >
                  <ShoppingBag className="h-4 w-4 text-gray-500" />
                  <span>Ver Catálogo da Loja</span>
                </Link>
              </div>

              {/* Footer logout */}
              <div className="p-2 bg-gray-50/50">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sair da conta</span>
                </button>
              </div>
            </div>
          ) : (
            /* Guest / Not logged in state */
            <div className="p-4 space-y-4">
              <div className="text-center space-y-1">
                <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
                  <CircleUserRound className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-bold text-gray-900">Acesse sua Conta</h4>
                <p className="text-xs text-gray-500">
                  Entre com seus dados para acompanhar pedidos ou crie seu cadastro em instantes.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                {/* Entrar button */}
                <Button
                  onClick={() => {
                    setOpen(false);
                    navigate({ to: "/conta", search: { tab: "entrar" } });
                  }}
                  className="w-full h-9 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2 shadow-xs"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  Entrar
                </Button>

                {/* Registrar button */}
                <Button
                  variant="outline"
                  onClick={() => {
                    setOpen(false);
                    navigate({ to: "/conta", search: { tab: "registrar" } });
                  }}
                  className="w-full h-9 text-xs font-semibold border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <UserPlus className="h-3.5 w-3.5 text-primary" />
                  Criar conta / Registrar
                </Button>
              </div>

              <div className="border-t border-gray-100 pt-2.5 text-center">
                <p className="text-[11px] text-gray-400 flex items-center justify-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-emerald-600" />
                  Compra segura e dados protegidos
                </p>
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Profile Edit Modal */}
      <EditProfileModal open={editModalOpen} onOpenChange={setEditModalOpen} user={user} />
    </>
  );
}
