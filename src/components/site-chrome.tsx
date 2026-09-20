import { Link, useNavigate } from "@tanstack/react-router";
import {
  ChevronDown,
  CircleUserRound,
  CreditCard,
  Heart,
  Leaf,
  Menu,
  MessageCircle,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sprout,
  Truck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useStoreSettings } from "@/hooks/use-store-settings";
import { UserAccountDropdown } from "@/components/auth/user-account-dropdown";
import { FavoritesHeaderButton } from "@/components/products/favorites-sheet";
import { useCurrentUser } from "@/data/user-auth";
import { toast } from "sonner";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      to="/"
      className="group flex shrink-0 items-center"
      aria-label="Projeto Viva com Saúde — início"
    >
      <img
        src="/logoprojeto.png"
        alt="Projeto Viva com Saúde"
        className={
          compact
            ? "h-9 sm:h-11 w-auto max-h-12 object-contain transition-transform group-hover:scale-105"
            : "h-11 sm:h-14 w-auto max-h-16 object-contain transition-transform group-hover:scale-105"
        }
      />
    </Link>
  );
}

export function TopBar() {
  const settings = useStoreSettings();
  const items = [
    { icon: Truck, label: settings.trustDeliveryTitle || "Entrega para todo o Brasil" },
    { icon: ShieldCheck, label: settings.trustSecurityTitle || "Compra 100% segura" },
    { icon: CreditCard, label: settings.trustInstallmentsTitle || "Parcele em até 6x" },
    { icon: Leaf, label: settings.trustQualityTitle || "Produtos originais" },
  ];

  return (
    <div className="bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-primary-foreground/15 px-4 sm:grid-cols-4 lg:px-8">
        {items.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex h-9 items-center justify-center gap-2 px-2 text-center text-[0.65rem] font-medium sm:text-xs"
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SiteHeader({
  cartCount = 0,
  onCartClick,
}: {
  cartCount?: number;
  onCartClick?: () => void;
}) {
  const navigate = useNavigate();
  const { isLoggedIn } = useCurrentUser();

  const handleCartClick = () => {
    if (!isLoggedIn) {
      toast.info("Faça login para acessar o carrinho de compras!");
      navigate({ to: "/conta", search: { tab: "entrar" } });
      return;
    }
    if (onCartClick) {
      onCartClick();
    } else {
      navigate({ to: "/" });
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur">
      <div className="mx-auto grid min-h-20 max-w-7xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 lg:px-8">
        <Brand compact />
        <nav
          className="hidden items-center justify-center gap-7 lg:flex"
          aria-label="Navegação principal"
        >
          <Link to="/" className="nav-link">
            Início
          </Link>
          <Link to="/produtos" className="nav-link">
            Produtos
          </Link>
          <Link to="/produtos" className="nav-link">
            Categorias
          </Link>
          <Link to="/" hash="sobre" className="nav-link">
            Sobre
          </Link>
          <Link to="/" hash="contato" className="nav-link">
            Contato
          </Link>
        </nav>
        <div className="flex items-center justify-end gap-1 sm:gap-2">
          <label className="relative hidden w-64 xl:block">
            <span className="sr-only">Buscar produtos</span>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="O que você está procurando?"
              className="h-10 rounded-full border-0 bg-muted pl-9 pr-8 shadow-none"
            />
          </label>
          <UserAccountDropdown className="hidden sm:inline-flex" />
          <FavoritesHeaderButton className="hidden sm:inline-flex" />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCartClick}
            className="relative rounded-full"
            aria-label={`Carrinho com ${cartCount} itens`}
          >
            <ShoppingCart />
            <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[0.6rem] font-bold text-primary-foreground">
              {cartCount}
            </span>
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full lg:hidden"
                aria-label="Abrir menu"
              >
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[86%]">
              <SheetHeader className="text-left">
                <SheetTitle>
                  <Brand />
                </SheetTitle>
                <SheetDescription>Navegue pela loja.</SheetDescription>
              </SheetHeader>
              <nav className="mt-8 grid gap-1">
                <Link to="/" className="border-b border-border py-4 text-base font-semibold">
                  Início
                </Link>
                <Link
                  to="/produtos"
                  className="border-b border-border py-4 text-base font-semibold"
                >
                  Produtos
                </Link>
                <Link
                  to="/produtos"
                  className="border-b border-border py-4 text-base font-semibold"
                >
                  Categorias
                </Link>
                <Link
                  to="/"
                  hash="sobre"
                  className="border-b border-border py-4 text-base font-semibold"
                >
                  Sobre
                </Link>
                <Link
                  to="/"
                  hash="contato"
                  className="border-b border-border py-4 text-base font-semibold"
                >
                  Contato
                </Link>
                <Link
                  to="/conta"
                  className="border-b border-border py-4 text-base font-semibold text-primary"
                >
                  Minha Conta
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

type FooterLinkItem = string | { label: string; href: string; external?: boolean };

function FooterColumn({ title, links }: { title: string; links: FooterLinkItem[] }) {
  return (
    <div>
      <h3 className="text-sm font-bold">{title}</h3>
      <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
        {links.map((item) => {
          if (typeof item === "object") {
            if (item.href.startsWith("/")) {
              return (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className="hover:text-primary transition-colors inline-flex items-center gap-1.5"
                  >
                    {item.label}
                  </Link>
                </li>
              );
            }
            return (
              <li key={item.label}>
                <a
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noreferrer" : undefined}
                  className="hover:text-primary transition-colors inline-flex items-center gap-1.5"
                >
                  {item.label}
                </a>
              </li>
            );
          }
          return (
            <li key={item}>
              <Link to="/" className="hover:text-primary transition-colors">
                {item}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  const settings = useStoreSettings();
  const whatsappUrl = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
    settings.whatsappDefaultMessage,
  )}`;

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-9 px-5 py-12 sm:grid-cols-2 lg:grid-cols-[1.25fr_1fr_1fr_1.3fr_1.2fr] lg:px-8">
        <div>
          <Brand />
          <p className="mt-4 text-xs text-muted-foreground">{settings.storeSlogan}</p>
        </div>
        <FooterColumn
          title="Institucional"
          links={[
            { label: "Início", href: "/" },
            { label: "Produtos", href: "/produtos" },
            { label: "Categorias", href: "/produtos" },
            { label: "Sobre nós", href: "/#sobre" },
            { label: "Contato / Enviar mensagem", href: "/#contato-formulario" },
            { label: "Painel do Administrador", href: "/admin" },
          ]}
        />
        <FooterColumn
          title="Atendimento"
          links={[
            {
              label: "Fale conosco (WhatsApp)",
              href: whatsappUrl,
              external: true,
            },
            "Política de privacidade",
            "Trocas e devoluções",
            "Formas de pagamento",
            "Entrega",
          ]}
        />
        <div>
          <h3 className="text-sm font-bold">Contato</h3>
          <ul className="mt-4 space-y-3 text-xs text-muted-foreground">
            <li>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="hover:text-primary transition-colors inline-flex items-center gap-1.5 font-medium text-foreground"
              >
                <MessageCircle className="h-4 w-4 text-whatsapp" />
                {settings.whatsappDisplay}
              </a>
            </li>
            <li className="break-all">
              <a
                href={`mailto:${settings.contactEmail}`}
                className="hover:text-primary transition-colors"
              >
                {settings.contactEmail}
              </a>
            </li>
            <li>{settings.locationDisplay}</li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-bold">Formas de pagamento</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="payment-mark">VISA</span>
            <span className="payment-mark">MC</span>
            <span className="payment-mark">ELO</span>
            <span className="payment-mark">PIX</span>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-md bg-brand-soft p-3 text-primary">
            <ShieldCheck className="h-8 w-8" />
            <span className="text-[0.65rem] font-bold uppercase">
              Site protegido
              <br />
              SSL certificado
            </span>
          </div>
        </div>
      </div>
      <div className="border-t border-border bg-muted/60">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-[0.65rem] text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <span>© 2026 Projeto Viva com Saúde. Todos os direitos reservados.</span>
          <div className="flex items-center gap-4">
            <Link to="/admin" className="hover:text-foreground underline transition-colors">
              Painel do Administrador
            </Link>
            <span>•</span>
            <span>Feito com cuidado por quem acredita em uma vida mais saudável.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function WhatsAppFab() {
  const settings = useStoreSettings();
  const whatsappUrl = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
    settings.whatsappDefaultMessage,
  )}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noreferrer"
      aria-label="Conversar pelo WhatsApp"
      className="fixed bottom-5 right-5 z-30 grid h-14 w-14 place-items-center rounded-full bg-whatsapp text-primary-foreground shadow-lg transition-transform hover:scale-110"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
