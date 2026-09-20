import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  LogIn,
  UserPlus,
  ShieldCheck,
  ChevronRight,
  LogOut,
  Edit3,
  Calendar,
  ShoppingBag,
  Heart,
  ArrowRight,
} from "lucide-react";

import { SiteFooter, SiteHeader, TopBar, WhatsAppFab } from "@/components/site-chrome";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPhoneNumber } from "@/components/auth/edit-profile-modal";
import { FavoritesSheet } from "@/components/products/favorites-sheet";
import { useFavorites } from "@/data/favorites";
import {
  useCurrentUser,
  loginUser,
  registerUser,
  updateUserProfile,
  logoutUser,
} from "@/data/user-auth";
import { toast } from "sonner";

type AuthTab = "entrar" | "registrar" | "perfil";

export const Route = createFileRoute("/conta")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): { tab?: string } => {
    return {
      tab: (search.tab as string) || undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Minha Conta | Projeto Viva com Saúde" },
      {
        name: "description",
        content:
          "Entre ou crie sua conta no Projeto Viva com Saúde para acompanhar pedidos, histórico e dados cadastrais.",
      },
      { property: "og:title", content: "Minha Conta | Projeto Viva com Saúde" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const search = Route.useSearch();
  const { user, isLoggedIn } = useCurrentUser();
  const { favoriteCount } = useFavorites();
  const [favoritesSheetOpen, setFavoritesSheetOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<AuthTab>(() => {
    if (search.tab === "registrar") return "registrar";
    if (search.tab === "perfil" || isLoggedIn) return "perfil";
    return "entrar";
  });

  // Sync with search or login status
  useEffect(() => {
    if (search.tab === "registrar") {
      setActiveTab("registrar");
    } else if (search.tab === "entrar") {
      setActiveTab("entrar");
    } else if (isLoggedIn) {
      setActiveTab("perfil");
    }
  }, [search.tab, isLoggedIn]);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Register form state
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  // Edit Profile mode within profile
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFullName, setEditFullName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editNewPassword, setEditNewPassword] = useState("");
  const [editConfirmPassword, setEditConfirmPassword] = useState("");
  const [editError, setEditError] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // When opening edit mode, populate data
  useEffect(() => {
    if (user) {
      setEditFullName(user.fullName || "");
      setEditEmail(user.email || "");
      setEditPhone(user.phone || "");
      setEditNewPassword("");
      setEditConfirmPassword("");
      setEditError("");
    }
  }, [user, isEditingProfile]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!loginEmail.trim() || !loginEmail.includes("@")) {
      setLoginError("Informe um endereço de e-mail válido.");
      return;
    }
    if (!loginPassword) {
      setLoginError("Informe sua senha de acesso.");
      return;
    }

    setIsLoggingIn(true);
    const result = loginUser(loginEmail, loginPassword);
    setIsLoggingIn(false);

    if (!result.success) {
      setLoginError(result.error || "Erro ao entrar.");
      return;
    }

    toast.success(`Bem-vindo(a) de volta, ${result.user?.fullName.split(" ")[0]}!`);
    setActiveTab("perfil");
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");

    if (!regFullName.trim()) {
      setRegError("Informe seu nome completo.");
      return;
    }
    if (!regEmail.trim() || !regEmail.includes("@")) {
      setRegError("Informe um e-mail válido.");
      return;
    }
    if (!regPhone.trim() || regPhone.replace(/\D/g, "").length < 10) {
      setRegError("Informe um telefone com DDD válido.");
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setRegError("A senha deve conter no mínimo 6 caracteres.");
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError("A confirmação de senha não confere com a senha digitada.");
      return;
    }

    setIsRegistering(true);
    const result = registerUser({
      fullName: regFullName,
      email: regEmail,
      phone: regPhone,
      password: regPassword,
    });
    setIsRegistering(false);

    if (!result.success) {
      setRegError(result.error || "Erro ao criar conta.");
      return;
    }

    toast.success("Conta criada com sucesso! Bem-vindo(a) ao Projeto Viva com Saúde.");
    setActiveTab("perfil");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setEditError("");

    if (!editFullName.trim()) {
      setEditError("Informe seu nome completo.");
      return;
    }
    if (!editEmail.trim() || !editEmail.includes("@")) {
      setEditError("Informe um e-mail válido.");
      return;
    }
    if (!editPhone.trim() || editPhone.replace(/\D/g, "").length < 10) {
      setEditError("Informe um telefone válido com DDD.");
      return;
    }

    if (editNewPassword) {
      if (editNewPassword.length < 6) {
        setEditError("A nova senha deve ter no mínimo 6 dígitos.");
        return;
      }
      if (editNewPassword !== editConfirmPassword) {
        setEditError("As senhas não coincidem.");
        return;
      }
    }

    setIsSavingEdit(true);
    const updates: Record<string, string> = {
      fullName: editFullName.trim(),
      email: editEmail.trim().toLowerCase(),
      phone: editPhone.trim(),
    };
    if (editNewPassword) {
      updates.password = editNewPassword;
    }

    const res = updateUserProfile(user.id, updates);
    setIsSavingEdit(false);

    if (!res.success) {
      setEditError(res.error || "Erro ao salvar.");
      return;
    }

    toast.success("Dados cadastrais atualizados com sucesso!");
    setIsEditingProfile(false);
  };

  const handleLogout = () => {
    logoutUser();
    toast.info("Você saiu da sua conta.");
    setActiveTab("entrar");
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "Recente";
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(date);
    } catch {
      return "Recente";
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#fafafc] text-foreground">
      <TopBar />
      <SiteHeader cartCount={0} />

      <main className="flex-1">
        {/* Breadcrumbs */}
        <div className="border-b border-border/40 bg-white">
          <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 text-xs text-muted-foreground sm:px-6">
            <Link to="/" className="hover:text-primary transition-colors">
              Início
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
            <span className="font-medium text-foreground">Minha Conta</span>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
          {isLoggedIn && user && activeTab === "perfil" ? (
            /* Logged-In User Profile Dashboard */
            <div className="space-y-6">
              {/* Welcome banner */}
              <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-r from-primary/10 via-primary/5 to-white p-6 shadow-xs sm:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground shadow-md">
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          Conta Ativa
                        </span>
                      </div>
                      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                        Olá, {user.fullName}!
                      </h1>
                      <p className="text-xs text-gray-500">
                        Gerencie suas informações cadastrais e dados de login.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                      variant={isEditingProfile ? "secondary" : "default"}
                      className="flex-1 sm:flex-none text-xs font-semibold gap-2"
                    >
                      <Edit3 className="h-4 w-4" />
                      {isEditingProfile ? "Fechar Edição" : "Editar Dados"}
                    </Button>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      className="text-xs font-semibold text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 gap-1.5"
                    >
                      <LogOut className="h-4 w-4" />
                      Sair
                    </Button>
                  </div>
                </div>
              </div>

              {/* Edit Mode Form or Details View */}
              {isEditingProfile ? (
                <div className="rounded-2xl border border-border bg-white p-6 shadow-xs sm:p-8">
                  <div className="border-b border-gray-100 pb-4 mb-6">
                    <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <Edit3 className="h-5 w-5 text-primary" />
                      Alterar Meus Dados Cadastrais
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                      Edite seus dados pessoais abaixo. Campos marcados com * são obrigatórios.
                    </p>
                  </div>

                  {editError && (
                    <div className="mb-5 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                      <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                      <span>{editError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveEdit} className="space-y-4 max-w-xl">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="page-edit-name"
                        className="text-xs font-semibold text-gray-700"
                      >
                        Nome Completo *
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="page-edit-name"
                          value={editFullName}
                          onChange={(e) => setEditFullName(e.target.value)}
                          className="pl-9 h-11 text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="page-edit-email"
                          className="text-xs font-semibold text-gray-700"
                        >
                          E-mail *
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          <Input
                            id="page-edit-email"
                            type="email"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            className="pl-9 h-11 text-sm"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label
                          htmlFor="page-edit-phone"
                          className="text-xs font-semibold text-gray-700"
                        >
                          Telefone / WhatsApp *
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          <Input
                            id="page-edit-phone"
                            type="tel"
                            value={editPhone}
                            onChange={(e) => setEditPhone(formatPhoneNumber(e.target.value))}
                            className="pl-9 h-11 text-sm"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 space-y-3">
                      <h4 className="text-xs font-bold text-gray-700">
                        Alterar senha de acesso (opcional)
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="page-edit-new-pass" className="text-[11px] text-gray-600">
                            Nova Senha
                          </Label>
                          <Input
                            id="page-edit-new-pass"
                            type="password"
                            value={editNewPassword}
                            onChange={(e) => setEditNewPassword(e.target.value)}
                            placeholder="Mínimo 6 dígitos"
                            className="h-10 text-xs bg-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label
                            htmlFor="page-edit-conf-pass"
                            className="text-[11px] text-gray-600"
                          >
                            Confirmar Nova Senha
                          </Label>
                          <Input
                            id="page-edit-conf-pass"
                            type="password"
                            value={editConfirmPassword}
                            onChange={(e) => setEditConfirmPassword(e.target.value)}
                            placeholder="Repita a nova senha"
                            className="h-10 text-xs bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <Button
                        type="submit"
                        disabled={isSavingEdit}
                        className="h-11 px-6 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Salvar Alterações
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditingProfile(false)}
                        className="h-11 text-xs"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </div>
              ) : (
                /* Information Cards */
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="rounded-2xl border border-border bg-white p-6 shadow-xs md:col-span-2 space-y-5">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                        Dados Cadastrais
                      </h2>
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(true)}
                        className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Editar
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="rounded-xl bg-gray-50/80 p-3.5 border border-gray-100">
                        <span className="text-[11px] font-medium text-gray-500 block mb-1">
                          Nome Completo
                        </span>
                        <span className="text-sm font-bold text-gray-900 flex items-center gap-2">
                          <User className="h-4 w-4 text-primary" />
                          {user.fullName}
                        </span>
                      </div>

                      <div className="rounded-xl bg-gray-50/80 p-3.5 border border-gray-100">
                        <span className="text-[11px] font-medium text-gray-500 block mb-1">
                          E-mail de Acesso
                        </span>
                        <span className="text-sm font-bold text-gray-900 flex items-center gap-2 truncate">
                          <Mail className="h-4 w-4 text-primary shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </span>
                      </div>

                      <div className="rounded-xl bg-gray-50/80 p-3.5 border border-gray-100">
                        <span className="text-[11px] font-medium text-gray-500 block mb-1">
                          Telefone / WhatsApp
                        </span>
                        <span className="text-sm font-bold text-gray-900 flex items-center gap-2">
                          <Phone className="h-4 w-4 text-primary" />
                          {user.phone || "Não informado"}
                        </span>
                      </div>

                      <div className="rounded-xl bg-gray-50/80 p-3.5 border border-gray-100">
                        <span className="text-[11px] font-medium text-gray-500 block mb-1">
                          Cliente desde
                        </span>
                        <span className="text-sm font-bold text-gray-900 flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          {formatDate(user.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 flex items-start gap-3">
                      <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="text-xs text-emerald-900">
                        <p className="font-semibold">Seus dados estão 100% seguros</p>
                        <p className="text-emerald-700/80 mt-0.5">
                          Suas informações são confidenciais e utilizadas exclusivamente para envio
                          de pedidos e suporte de compras.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quick actions sidebar */}
                  <div className="rounded-2xl border border-border bg-white p-6 shadow-xs space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-3">
                      Ações Rápidas
                    </h3>

                    <div className="space-y-2">
                      <Link
                        to="/produtos"
                        className="flex items-center justify-between rounded-xl border border-gray-200 p-3 text-xs font-semibold text-gray-700 hover:border-primary hover:text-primary transition-all group"
                      >
                        <span className="flex items-center gap-2">
                          <ShoppingBag className="h-4 w-4 text-gray-400 group-hover:text-primary" />
                          Comprar Produtos
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => setFavoritesSheetOpen(true)}
                        className="flex w-full items-center justify-between rounded-xl border border-gray-200 p-3 text-xs font-semibold text-gray-700 hover:border-red-400 hover:text-red-600 transition-all group text-left"
                      >
                        <span className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-red-500 group-hover:scale-110 transition-transform" />
                          Meus Produtos Favoritos ({favoriteCount})
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(true)}
                        className="flex w-full items-center justify-between rounded-xl border border-gray-200 p-3 text-xs font-semibold text-gray-700 hover:border-primary hover:text-primary transition-all group text-left"
                      >
                        <span className="flex items-center gap-2">
                          <Edit3 className="h-4 w-4 text-gray-400 group-hover:text-primary" />
                          Editar Dados Pessoais
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                      </button>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center justify-between rounded-xl border border-red-100 p-3 text-xs font-semibold text-red-600 hover:bg-red-50 transition-all group text-left"
                      >
                        <span className="flex items-center gap-2">
                          <LogOut className="h-4 w-4 text-red-500" />
                          Sair da Conta
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Auth Box (Tabs: Entrar / Registrar) */
            <div className="mx-auto max-w-lg">
              <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
                {/* Header Switch Tabs */}
                <div className="grid grid-cols-2 border-b border-border bg-gray-50/70 p-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("entrar");
                      setLoginError("");
                    }}
                    className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition-all ${
                      activeTab === "entrar"
                        ? "bg-white text-gray-900 shadow-xs"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    <LogIn className="h-4 w-4 text-primary" />
                    Entrar na Conta
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("registrar");
                      setRegError("");
                    }}
                    className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition-all ${
                      activeTab === "registrar"
                        ? "bg-white text-gray-900 shadow-xs"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    <UserPlus className="h-4 w-4 text-primary" />
                    Criar Conta / Registrar
                  </button>
                </div>

                <div className="p-6 sm:p-8">
                  {/* TAB: ENTRAR */}
                  {activeTab === "entrar" && (
                    <form id="login-form" onSubmit={handleLogin} className="space-y-4">
                      <div className="text-center pb-2">
                        <h2 className="text-xl font-bold text-gray-900">Acesse sua conta</h2>
                        <p className="text-xs text-gray-500 mt-1">
                          Digite seus dados de login para continuar
                        </p>
                      </div>

                      {loginError && (
                        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                          <span>{loginError}</span>
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <Label
                          htmlFor="login-email"
                          className="text-xs font-semibold text-gray-700"
                        >
                          E-mail
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          <Input
                            id="login-email"
                            type="email"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            placeholder="seuemail@exemplo.com"
                            className="pl-9 h-11 text-sm"
                            required
                            autoComplete="email"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label
                            htmlFor="login-password"
                            className="text-xs font-semibold text-gray-700"
                          >
                            Senha
                          </Label>
                          <button
                            type="button"
                            onClick={() =>
                              toast.info(
                                "Para recuperar sua senha, entre em contato via WhatsApp de suporte.",
                              )
                            }
                            className="text-[11px] font-medium text-primary hover:underline"
                          >
                            Esqueci a senha
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          <Input
                            id="login-password"
                            type={showLoginPassword ? "text" : "password"}
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            placeholder="Sua senha"
                            className="pl-9 pr-10 h-11 text-sm"
                            required
                            autoComplete="current-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                            tabIndex={-1}
                          >
                            {showLoginPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={isLoggingIn}
                        className="w-full h-11 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs mt-2"
                      >
                        <LogIn className="mr-2 h-4 w-4" />
                        {isLoggingIn ? "Entrando..." : "Entrar na Conta"}
                      </Button>

                      <div className="text-center pt-2">
                        <p className="text-xs text-gray-500">
                          Ainda não possui uma conta?{" "}
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab("registrar");
                              setRegError("");
                            }}
                            className="font-bold text-primary hover:underline"
                          >
                            Cadastre-se agora
                          </button>
                        </p>
                      </div>
                    </form>
                  )}

                  {/* TAB: REGISTRAR */}
                  {activeTab === "registrar" && (
                    <form id="register-form" onSubmit={handleRegister} className="space-y-4">
                      <div className="text-center pb-2">
                        <h2 className="text-xl font-bold text-gray-900">Crie sua conta</h2>
                        <p className="text-xs text-gray-500 mt-1">
                          Preencha as informações abaixo para se registrar
                        </p>
                      </div>

                      {regError && (
                        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                          <span>{regError}</span>
                        </div>
                      )}

                      {/* 1. Nome Completo */}
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="reg-fullname"
                          className="text-xs font-semibold text-gray-700"
                        >
                          Nome Completo *
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          <Input
                            id="reg-fullname"
                            value={regFullName}
                            onChange={(e) => setRegFullName(e.target.value)}
                            placeholder="Ex: João da Silva Santos"
                            className="pl-9 h-11 text-sm"
                            required
                          />
                        </div>
                      </div>

                      {/* 2. E-mail */}
                      <div className="space-y-1.5">
                        <Label htmlFor="reg-email" className="text-xs font-semibold text-gray-700">
                          E-mail *
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          <Input
                            id="reg-email"
                            type="email"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            placeholder="seuemail@exemplo.com"
                            className="pl-9 h-11 text-sm"
                            required
                            autoComplete="email"
                          />
                        </div>
                      </div>

                      {/* 3. Telefone */}
                      <div className="space-y-1.5">
                        <Label htmlFor="reg-phone" className="text-xs font-semibold text-gray-700">
                          Telefone / WhatsApp *
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          <Input
                            id="reg-phone"
                            type="tel"
                            value={regPhone}
                            onChange={(e) => setRegPhone(formatPhoneNumber(e.target.value))}
                            placeholder="(00) 00000-0000"
                            className="pl-9 h-11 text-sm"
                            required
                          />
                        </div>
                      </div>

                      {/* 4. Senha e 5. Confirmação de Senha */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="reg-password"
                            className="text-xs font-semibold text-gray-700"
                          >
                            Senha *
                          </Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                              id="reg-password"
                              type={showRegPassword ? "text" : "password"}
                              value={regPassword}
                              onChange={(e) => setRegPassword(e.target.value)}
                              placeholder="Mín. 6 caracteres"
                              className="pl-9 pr-9 h-11 text-xs"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowRegPassword(!showRegPassword)}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                              tabIndex={-1}
                            >
                              {showRegPassword ? (
                                <EyeOff className="h-3.5 w-3.5" />
                              ) : (
                                <Eye className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label
                            htmlFor="reg-confirmpassword"
                            className="text-xs font-semibold text-gray-700"
                          >
                            Confirmação de Senha *
                          </Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                              id="reg-confirmpassword"
                              type={showRegPassword ? "text" : "password"}
                              value={regConfirmPassword}
                              onChange={(e) => setRegConfirmPassword(e.target.value)}
                              placeholder="Repita a senha"
                              className="pl-9 h-11 text-xs"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={isRegistering}
                        className="w-full h-11 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs mt-3"
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        {isRegistering ? "Cadastrando..." : "Criar Minha Conta"}
                      </Button>

                      <div className="text-center pt-2">
                        <p className="text-xs text-gray-500">
                          Já tem uma conta cadastrada?{" "}
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab("entrar");
                              setLoginError("");
                            }}
                            className="font-bold text-primary hover:underline"
                          >
                            Clique para entrar
                          </button>
                        </p>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
      <WhatsAppFab />
      <FavoritesSheet open={favoritesSheetOpen} onOpenChange={setFavoritesSheetOpen} />
    </div>
  );
}
