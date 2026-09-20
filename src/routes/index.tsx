import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  CircleUserRound,
  CreditCard,
  Flower2,
  Heart,
  HeartPulse,
  Leaf,
  Mail,
  Menu,
  MessageCircle,
  Minus,
  PackageCheck,
  Plus,
  Search,
  ShieldCheck,
  ShoppingCart,
  Activity,
  Sprout,
  Truck,
  X,
} from "lucide-react";

import heroImage from "@/assets/hero.png";
import benefitsImage from "@/assets/viva-benefits.jpg";
import productsImage from "@/assets/viva-products.jpg";
import { Button } from "@/components/ui/button";
import { formatPrice, products } from "@/data/products";
import { getAllStoreProducts } from "@/data/all-store-products";
import { Input } from "@/components/ui/input";
import { ContactMessageForm } from "@/components/contact-message-form";
import { UserAccountDropdown } from "@/components/auth/user-account-dropdown";
import { FavoritesHeaderButton } from "@/components/products/favorites-sheet";
import { ProductFavoriteButton } from "@/components/products/product-favorite-button";
import { useCurrentUser } from "@/data/user-auth";
import { toast } from "sonner";
import { CustomerMessageItem, INITIAL_ADMIN_MESSAGES } from "@/data/admin-customers-data";
import { useStoreSettings } from "@/hooks/use-store-settings";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Projeto Viva com Saúde | Produtos Naturais" },
      {
        name: "description",
        content:
          "Suplementos, fitoterápicos e produtos naturais para sua saúde, equilíbrio e bem-estar.",
      },
      { property: "og:title", content: "Projeto Viva com Saúde | Produtos Naturais" },
      {
        property: "og:description",
        content: "Mais saúde para o seu dia a dia com produtos naturais selecionados.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const categories = [
  { label: "Emagrecedores", icon: Leaf },
  { label: "Coluna", icon: Activity },
  { label: "Beleza e Bem Estar", icon: Flower2 },
  { label: "Vitaminas", icon: BadgeCheck },
  { label: "Detox", icon: Sprout },
  { label: "Digestivo", icon: Leaf },
  { label: "Sistema Circulatório", icon: HeartPulse },
  { label: "Imunidade", icon: ShieldCheck },
  { label: "Cabelos", icon: Heart },
  { label: "Saúde da Mulher", icon: Flower2 },
  { label: "Todas", icon: Plus },
];

const benefits = [
  { icon: Truck, title: "Entrega para todo o Brasil", copy: "com segurança e agilidade" },
  { icon: CreditCard, title: "Parcele em até 6x", copy: "nos principais cartões" },
  { icon: ShieldCheck, title: "Compra 100% segura", copy: "seus dados protegidos" },
  { icon: Leaf, title: "Produtos originais", copy: "e de alta qualidade" },
];

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <a
      href="#inicio"
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
    </a>
  );
}

function Index() {
  const navigate = useNavigate();
  const { isLoggedIn } = useCurrentUser();
  const settings = useStoreSettings();
  const [storeProducts, setStoreProducts] = useState(() => getAllStoreProducts());

  useEffect(() => {
    setStoreProducts(getAllStoreProducts());
    const handleUpdate = () => {
      setStoreProducts(getAllStoreProducts());
    };
    window.addEventListener("viva_admin_products_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("viva_admin_products_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");
  const [cart, setCart] = useState<Record<number, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [newsletterSent, setNewsletterSent] = useState(false);

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("pt-BR");
    return storeProducts.filter((product) => {
      const matchesCategory =
        category === "Todas" ||
        (product.category && product.category.toLowerCase().includes(category.toLowerCase()));
      const matchesSearch =
        !normalized ||
        `${product.name} ${product.category}`.toLocaleLowerCase("pt-BR").includes(normalized);
      return matchesCategory && matchesSearch;
    });
  }, [category, query, storeProducts]);

  const featuredProducts = useMemo(() => {
    return filteredProducts;
  }, [filteredProducts]);

  const cartCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  const subtotal = storeProducts.reduce(
    (sum, product) => sum + product.price * (cart[product.id] ?? 0),
    0,
  );

  const addToCart = (id: number) => {
    if (!isLoggedIn) {
      toast.info("Faça login para adicionar produtos ao carrinho!");
      navigate({ to: "/conta", search: { tab: "entrar" } });
      return;
    }
    setCart((current) => ({ ...current, [id]: (current[id] ?? 0) + 1 }));
    toast.success("Produto adicionado ao carrinho!");
    setCartOpen(true);
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((current) => {
      const next = (current[id] ?? 0) + delta;
      if (next <= 0) {
        const copy = { ...current };
        delete copy[id];
        return copy;
      }
      return { ...current, [id]: next };
    });
  };

  const [newsletterEmail, setNewsletterEmail] = useState("");

  const submitNewsletter = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newsletterEmail) return;

    // 1. Create a customer message for the newsletter subscription
    const newMsg: CustomerMessageItem = {
      id: `msg-${Date.now()}`,
      senderName: "Sem nome",
      senderEmail: newsletterEmail,
      type: "Newsletter",
      content: "Pedido de inscrição na newsletter",
      date: new Date().toLocaleDateString("pt-BR"),
      status: "Respondida",
    };

    try {
      const stored = localStorage.getItem("viva_admin_customer_messages");
      const currentList: CustomerMessageItem[] = stored
        ? JSON.parse(stored)
        : INITIAL_ADMIN_MESSAGES;
      localStorage.setItem(
        "viva_admin_customer_messages",
        JSON.stringify([newMsg, ...currentList]),
      );
    } catch {
      // ignore
    }

    setNewsletterSent(true);
  };

  const handleFinalizarCompraWhatsApp = () => {
    const selectedItems = products.filter((product) => cart[product.id]);
    if (!selectedItems.length) return;
    const itemsList = selectedItems
      .map((p) => `• ${p.name} (${cart[p.id]}x) - ${formatPrice(p.price * cart[p.id])}`)
      .join("\n");
    const text = `Olá! Gostaria de finalizar meu pedido pelo WhatsApp:\n\n${itemsList}\n\n*Total: ${formatPrice(subtotal)}*`;
    window.open(
      `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(text)}`,
      "_blank",
    );
  };

  const whatsappDirectUrl = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
    settings.whatsappDefaultMessage,
  )}`;

  const currentBenefits = [
    {
      icon: Truck,
      title: settings.trustDeliveryTitle || "Entrega para todo o Brasil",
      copy: settings.trustDeliverySubtitle || "com segurança e agilidade",
    },
    {
      icon: ShieldCheck,
      title: settings.trustSecurityTitle || "Compra 100%",
      copy: settings.trustSecuritySubtitle || "segura",
    },
    {
      icon: CreditCard,
      title: settings.trustInstallmentsTitle || "Parcele em até 6x",
      copy: settings.trustInstallmentsSubtitle || "nos principais cartões",
    },
    {
      icon: Leaf,
      title: settings.trustQualityTitle || "Produtos originais",
      copy: settings.trustQualitySubtitle || "e de alta qualidade",
    },
  ];

  return (
    <main id="inicio" className="min-h-screen overflow-x-hidden bg-background text-foreground">
      {settings.announcementActive && settings.announcementBarText?.trim() && (
        <div className="bg-primary text-primary-foreground text-center py-2 px-4 text-xs font-semibold tracking-wide border-b border-primary-foreground/10">
          <span>{settings.announcementBarText}</span>
        </div>
      )}
      <div className="bg-primary/95 text-primary-foreground">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-primary-foreground/15 px-4 sm:grid-cols-4 lg:px-8">
          {currentBenefits.map((benefit) => {
            const { icon: Icon, title } = benefit;
            return (
              <div
                key={title}
                className="flex h-9 items-center justify-center gap-2 px-2 text-center text-[0.65rem] font-medium sm:text-xs"
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{title}</span>
              </div>
            );
          })}
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur">
        <div className="mx-auto grid min-h-20 max-w-7xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 lg:px-8">
          <Brand compact />
          <nav
            className="hidden items-center justify-center gap-7 lg:flex"
            aria-label="Navegação principal"
          >
            <a className="nav-link" href="#inicio">
              Início
            </a>
            <a className="nav-link" href="#produtos">
              Produtos
            </a>
            <a className="nav-link inline-flex items-center gap-1" href="#categorias">
              Categorias <ChevronDown className="h-3 w-3" />
            </a>
            <a className="nav-link" href="#sobre">
              Sobre
            </a>
            <a className="nav-link" href="#contato">
              Contato
            </a>
          </nav>
          <div className="flex items-center justify-end gap-1 sm:gap-2">
            <label className="relative hidden w-64 xl:block">
              <span className="sr-only">Buscar produtos</span>
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="O que você está procurando?"
                className="h-10 rounded-full border-0 bg-muted pl-9 pr-8 shadow-none"
              />
              {query && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0.5 top-0.5 h-9 w-9 rounded-full"
                  onClick={() => setQuery("")}
                  aria-label="Limpar busca"
                >
                  <X />
                </Button>
              )}
            </label>
            <UserAccountDropdown className="hidden sm:inline-flex" />
            <FavoritesHeaderButton className="hidden sm:inline-flex" onAddToCart={addToCart} />
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full"
              aria-label={`Carrinho com ${cartCount} itens`}
              onClick={() => {
                if (!isLoggedIn) {
                  toast.info("Faça login para acessar o carrinho de compras!");
                  navigate({ to: "/conta", search: { tab: "entrar" } });
                  return;
                }
                setCartOpen(true);
              }}
            >
              <ShoppingCart />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[0.6rem] font-bold text-primary-foreground">
                  {cartCount}
                </span>
              )}
            </Button>
            <Sheet
              open={cartOpen}
              onOpenChange={(open) => {
                if (open && !isLoggedIn) {
                  toast.info("Faça login para acessar o carrinho de compras!");
                  navigate({ to: "/conta", search: { tab: "entrar" } });
                  return;
                }
                setCartOpen(open);
              }}
            >
              <SheetContent className="flex w-full flex-col sm:max-w-md">
                <SheetHeader className="border-b border-border pb-5 text-left">
                  <SheetTitle className="font-display text-3xl">Seu carrinho</SheetTitle>
                  <SheetDescription>
                    {cartCount
                      ? `${cartCount} ${cartCount === 1 ? "item selecionado" : "itens selecionados"}`
                      : "Seu carrinho está vazio."}
                  </SheetDescription>
                </SheetHeader>
                <div className="flex-1 space-y-4 overflow-y-auto py-5">
                  {storeProducts
                    .filter((product) => cart[product.id])
                    .map((product) => (
                      <div
                        key={product.id}
                        className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-3 border-b border-border pb-4"
                      >
                        <div
                          className="product-crop h-20 rounded-md"
                          style={{
                            backgroundImage: `url(${productsImage})`,
                            backgroundPosition: product.imagePosition,
                          }}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold leading-snug">{product.name}</p>
                          <p className="mt-1 font-bold text-primary">
                            {formatPrice(product.price)}
                          </p>
                          <div className="mt-2 flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateQuantity(product.id, -1)}
                              aria-label={`Diminuir ${product.name}`}
                            >
                              <Minus />
                            </Button>
                            <span className="w-7 text-center text-sm font-semibold">
                              {cart[product.id]}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => updateQuantity(product.id, 1)}
                              aria-label={`Aumentar ${product.name}`}
                            >
                              <Plus />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
                <div className="border-t border-border pt-5">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Subtotal</span>
                    <strong className="text-xl">{formatPrice(subtotal)}</strong>
                  </div>
                  <Button
                    className="h-12 w-full bg-whatsapp text-primary-foreground hover:bg-whatsapp/90 font-semibold gap-2"
                    disabled={!cartCount}
                    onClick={handleFinalizarCompraWhatsApp}
                  >
                    <MessageCircle className="h-5 w-5" />
                    Finalizar pedido pelo WhatsApp
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
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
                  {[
                    ["Início", "#inicio"],
                    ["Produtos", "#produtos"],
                    ["Categorias", "#categorias"],
                    ["Sobre", "#sobre"],
                    ["Contato", "#contato"],
                  ].map(([label, href]) => (
                    <a
                      key={href}
                      href={href}
                      onClick={() => setMenuOpen(false)}
                      className="border-b border-border py-4 text-base font-semibold"
                    >
                      {label}
                    </a>
                  ))}
                  <Link
                    to="/conta"
                    onClick={() => setMenuOpen(false)}
                    className="border-b border-border py-4 text-base font-semibold text-primary"
                  >
                    Minha Conta
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        <div className="border-t border-border px-4 py-2 xl:hidden">
          <label className="relative mx-auto block max-w-2xl">
            <span className="sr-only">Buscar produtos</span>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar produtos..."
              className="h-9 rounded-full bg-muted pl-9 shadow-none"
            />
          </label>
        </div>
      </header>

      <section className="relative min-h-[33rem] overflow-hidden sm:min-h-[36rem]">
        <img
          src={settings.heroImageUrl || heroImage}
          alt={
            settings.heroImageAlt ||
            "Suplemento natural Viva entre folhas e flores sobre pedestal de pedra"
          }
          width={1536}
          height={864}
          className="absolute inset-0 h-full w-full object-cover object-[62%_center] sm:object-center"
        />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="relative mx-auto flex min-h-[33rem] max-w-7xl items-center px-5 py-16 sm:min-h-[36rem] lg:px-8">
          <div className="max-w-xl">
            <p className="mb-4 text-xs font-bold uppercase text-primary">
              {settings.heroTagline || "Saúde natural para uma vida melhor"}
            </p>
            <h1 className="font-display text-5xl leading-[0.95] text-primary sm:text-6xl lg:text-7xl">
              {settings.heroTitleLine1 || "Mais saúde"}
              <br />
              {settings.heroTitleLine2 || "para o seu dia a dia."}
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-foreground/80">
              {settings.heroSubtitle ||
                "Produtos naturais, fitoterápicos e suplementos para o seu bem-estar físico e mental."}
            </p>
            <Button asChild size="lg" className="mt-7 h-12 rounded-full px-6">
              <a href={settings.heroButtonLink || "#produtos"}>
                {settings.heroButtonText || "Conheça nossos produtos"} <ArrowRight />
              </a>
            </Button>
            <div className="mt-10 grid max-w-lg grid-cols-3 gap-3 border-t border-primary/15 pt-5 text-xs font-semibold text-primary">
              <span className="flex items-center gap-2">
                <Leaf className="h-5 w-5" /> {settings.heroBadge1 || "100% naturais"}
              </span>
              <span className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5" /> {settings.heroBadge2 || "Qualidade comprovada"}
              </span>
              <span className="flex items-center gap-2">
                <Truck className="h-5 w-5" /> Entrega nacional
              </span>
            </div>
          </div>
        </div>
      </section>

      <section id="categorias" className="relative z-10 mx-auto -mt-5 max-w-7xl px-4 lg:px-8">
        <div className="rounded-lg border border-border bg-card p-5 shadow-soft sm:p-7">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl sm:text-3xl">Navegue por categorias</h2>
            <Link
              to="/produtos"
              className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
            >
              <span>Ver todas as categorias</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="category-scroll flex gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-11 lg:overflow-visible">
            {categories.map(({ label, icon: Icon }) => {
              return (
                <Link
                  key={label}
                  to="/produtos"
                  search={label === "Todas" ? {} : { categoria: label }}
                  className="group flex h-auto min-w-20 flex-col items-center gap-2 px-1 py-1 text-center hover:bg-transparent transition-transform hover:-translate-y-0.5"
                  title={`Ver produtos: ${label}`}
                >
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-soft text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all shadow-2xs">
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="whitespace-normal text-[0.68rem] font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section id="produtos" className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl">Produtos em destaque</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Os mais vendidos para sua saúde e bem-estar.
            </p>
          </div>
          {(query || category !== "Todas") && (
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => {
                setQuery("");
                setCategory("Todas");
              }}
            >
              Limpar filtros <X />
            </Button>
          )}
        </div>
        {featuredProducts.length ? (
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {featuredProducts.map((product) => (
              <article
                key={product.id}
                className="group flex min-w-0 flex-col rounded-md border border-border bg-card p-2.5 shadow-card transition-transform hover:-translate-y-1"
              >
                <div className="relative overflow-hidden rounded-md bg-muted">
                  <ProductFavoriteButton productId={product.id} productName={product.name} />
                  <span className="absolute right-1.5 top-1.5 z-10 rounded-full bg-sale px-2 py-1 text-[0.62rem] font-bold text-sale-foreground">
                    {product.discount}% OFF
                  </span>
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div
                      role="img"
                      aria-label={`Pote de ${product.name}`}
                      className="product-crop aspect-[4/5] w-full transition-transform duration-500 group-hover:scale-105"
                      style={{
                        backgroundImage: `url(${productsImage})`,
                        backgroundPosition: product.imagePosition,
                      }}
                    />
                  )}
                </div>
                <h3 className="mt-3 min-h-10 text-xs font-semibold leading-snug sm:text-sm">
                  {product.name}
                </h3>
                <p className="mt-2 text-xs text-muted-foreground line-through">
                  {formatPrice(product.oldPrice)}
                </p>
                <p className="text-lg font-extrabold text-sale">{formatPrice(product.price)}</p>
                <p className="mb-3 text-[0.68rem] text-muted-foreground">
                  6x de {formatPrice(product.price / 6)}
                </p>
                <div className="mt-auto grid gap-2">
                  <Button
                    asChild
                    size="sm"
                    className="h-auto min-h-9 w-full whitespace-normal px-2 py-2 text-[0.68rem] sm:text-xs"
                  >
                    <Link to="/produto/$slug" params={{ slug: product.slug }}>
                      Ver detalhes
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-auto min-h-9 w-full whitespace-normal px-2 py-2 text-[0.68rem] sm:text-xs"
                    onClick={() => addToCart(product.id)}
                  >
                    Adicionar ao carrinho
                  </Button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="border-y border-border py-16 text-center">
            <Search className="mx-auto mb-3 h-7 w-7 text-muted-foreground" />
            <p className="font-display text-2xl">Nenhum produto encontrado</p>
            <p className="mt-1 text-sm text-muted-foreground">Tente outro termo ou categoria.</p>
          </div>
        )}

        {/* Bloco Ver todos os produtos */}
        <div className="mt-10 flex justify-center">
          <Button
            asChild
            size="lg"
            className="h-12 px-8 rounded-full font-bold text-sm shadow-soft transition-all hover:scale-[1.02]"
          >
            <Link to="/produtos">
              Ver todos os produtos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="relative min-h-[28rem] overflow-hidden sm:min-h-[25rem]">
        <img
          src={benefitsImage}
          alt="Cápsulas fitoterápicas, ervas e pó natural"
          width={1536}
          height={640}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover object-[65%_center]"
        />
        <div className="absolute inset-0 bg-banner-overlay" />
        <div className="relative mx-auto grid min-h-[28rem] max-w-7xl items-center px-5 py-12 sm:min-h-[25rem] lg:grid-cols-2 lg:px-8">
          <div className="max-w-xl">
            <h2 className="font-display text-4xl leading-tight text-primary sm:text-5xl">
              Cuidado natural
              <br />
              do seu jeito.
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-foreground/75">
              Suplementos, fitoterápicos e muito mais para uma vida mais saudável e equilibrada.
            </p>
            <div className="mt-6 grid max-w-md grid-cols-2 gap-3 text-xs font-medium">
              {[
                "Mais disposição",
                "Sistema imunológico",
                "Equilíbrio e bem-estar",
                "Qualidade de vida",
              ].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-soft text-primary">
                    <Leaf className="h-4 w-4" />
                  </span>
                  {item}
                </span>
              ))}
            </div>
            <Button asChild className="mt-7 rounded-full">
              <a href="#produtos">
                Ver ofertas <ArrowRight />
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section aria-label="Vantagens" className="border-b border-border bg-muted/55">
        <div className="mx-auto grid max-w-7xl grid-cols-2 px-4 py-7 lg:grid-cols-4 lg:px-8">
          {benefits.map(({ icon: Icon, title, copy }, index) => (
            <div
              key={title}
              className={`flex items-center gap-3 px-2 py-3 sm:px-5 ${index > 0 ? "lg:border-l lg:border-border" : ""}`}
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-soft text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <span>
                <strong className="block text-xs">{title}</strong>
                <small className="text-[0.65rem] text-muted-foreground">{copy}</small>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section id="sobre" className="relative overflow-hidden py-14">
        <div className="leaf-decoration left-0" aria-hidden="true">
          <Leaf />
        </div>
        <div className="leaf-decoration right-0 scale-x-[-1]" aria-hidden="true">
          <Leaf />
        </div>
        <div className="mx-auto grid max-w-6xl gap-8 px-5 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl">
              Por que escolher o Projeto Viva com Saúde?
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Há anos oferecendo produtos naturais e fitoterápicos com qualidade, segurança e
              confiança. Nosso compromisso é com a sua saúde e bem-estar.
            </p>
            <Button asChild className="mt-6 rounded-full">
              <a href="#contato">
                Conheça nossa história <ArrowRight />
              </a>
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Leaf, label: "Saúde Natural" },
              { icon: CircleUserRound, label: "Clientes Satisfeitos" },
              { icon: BadgeCheck, label: "Qualidade Comprovada" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="text-center">
                <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-border bg-muted text-primary">
                  <Icon className="h-7 w-7" />
                </span>
                <span className="mt-2 block text-xs font-semibold">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Formulário de Mensagem / Contato vinculado à área de Mensagens do Administrador */}
      <section id="contato-formulario" className="mx-auto max-w-4xl px-4 pb-12 lg:px-8">
        <ContactMessageForm />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 lg:px-8">
        <div className="newsletter-grid overflow-hidden rounded-lg border border-border bg-muted/70 px-6 py-9 sm:px-10">
          <div className="flex items-start gap-4">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-brand-soft text-primary">
              <Mail className="h-7 w-7" />
            </span>
            <div>
              <h2 className="font-display text-2xl sm:text-3xl">Receba nossas ofertas</h2>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Cadastre seu e-mail e receba novidades, promoções e dicas de saúde e bem-estar.
              </p>
              {newsletterSent ? (
                <p className="mt-5 font-semibold text-primary">Cadastro realizado com sucesso!</p>
              ) : (
                <form onSubmit={submitNewsletter} className="mt-5 flex max-w-lg gap-2">
                  <Input
                    required
                    type="email"
                    aria-label="Seu melhor e-mail"
                    placeholder="Seu melhor e-mail"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="h-11 bg-background"
                  />
                  <Button type="submit" className="h-11 px-6">
                    Cadastrar
                  </Button>
                </form>
              )}
            </div>
          </div>
          <p className="font-script hidden max-w-sm rotate-[-5deg] text-center text-4xl leading-tight text-primary lg:block">
            Pequenas escolhas hoje,
            <br />
            grandes resultados amanhã.
          </p>
        </div>
      </section>

      <footer id="contato" className="border-t border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-9 px-5 py-12 sm:grid-cols-2 lg:grid-cols-[1.25fr_1fr_1fr_1.3fr_1.2fr] lg:px-8">
          <div>
            <Brand />
            <p className="mt-4 text-xs text-muted-foreground">{settings.storeSlogan}</p>
          </div>
          <FooterColumn
            title="Institucional"
            links={[
              "Início",
              "Produtos",
              "Categorias",
              "Sobre nós",
              { label: "Contato / Enviar mensagem", href: "/#contato-formulario" },
              { label: "Painel do Administrador", href: "/admin" },
            ]}
          />
          <FooterColumn
            title="Atendimento"
            links={[
              {
                label: "Fale conosco (WhatsApp)",
                href: whatsappDirectUrl,
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
                  href={whatsappDirectUrl}
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
            <h3 className="text-sm font-bold">Compra protegida</h3>
            <div className="mt-4 flex gap-2">
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

      <a
        href="https://wa.me/5511950300241?text=Ol%C3%A1!%20Vim%20pelo%20site%20Projeto%20Viva%20com%20Sa%C3%BAde%20e%20gostaria%20de%20informa%C3%A7%C3%B5es."
        target="_blank"
        rel="noreferrer"
        aria-label="Conversar pelo WhatsApp"
        className="fixed bottom-5 right-5 z-30 grid h-14 w-14 place-items-center rounded-full bg-whatsapp text-primary-foreground shadow-lg transition-transform hover:scale-110"
      >
        <MessageCircle className="h-7 w-7" />
      </a>
    </main>
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
              <a href="#inicio" className="hover:text-primary transition-colors">
                {item}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
