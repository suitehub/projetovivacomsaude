import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import {
  ArrowUpDown,
  ChevronRight,
  RotateCcw,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  X,
} from "lucide-react";

import productsImage from "@/assets/viva-products.jpg";
import { SiteFooter, SiteHeader, TopBar, WhatsAppFab } from "@/components/site-chrome";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatPrice, Product } from "@/data/products";
import { getAllStoreProducts } from "@/data/all-store-products";
import { ProductFavoriteButton } from "@/components/products/product-favorite-button";
import { useCurrentUser } from "@/data/user-auth";
import { toast } from "sonner";

type SortOption = "destaques" | "menor-preco" | "maior-preco" | "desconto" | "nome" | "avaliacoes";

export const Route = createFileRoute("/produtos")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): { categoria?: string; busca?: string } => {
    return {
      categoria: (search.categoria as string) || undefined,
      busca: (search.busca as string) || undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Todos os Produtos | Projeto Viva com Saúde" },
      {
        name: "description",
        content:
          "Confira nosso catálogo completo de produtos naturais, fitoterápicos, vitaminas e suplementos com preços especiais.",
      },
      { property: "og:title", content: "Todos os Produtos | Projeto Viva com Saúde" },
      {
        property: "og:description",
        content: "Explore o catálogo completo com opções de filtros por categoria e preço.",
      },
    ],
  }),
  component: AllProductsPage,
});

export function AllProductsPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useCurrentUser();
  const searchParams = Route.useSearch();

  // Load products list from storage or defaults
  const [allProducts, setAllProducts] = useState<Product[]>(() => getAllStoreProducts());

  useEffect(() => {
    setAllProducts(getAllStoreProducts());
    const handleUpdate = () => {
      setAllProducts(getAllStoreProducts());
    };
    window.addEventListener("viva_admin_products_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("viva_admin_products_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState(searchParams.busca || "");
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.categoria || "Todas",
  );
  const [sortOption, setSortOption] = useState<SortOption>("destaques");
  const [onlyDiscount, setOnlyDiscount] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    if (searchParams.categoria) {
      setSelectedCategory(searchParams.categoria);
    } else if (searchParams.categoria === undefined) {
      setSelectedCategory("Todas");
    }
    if (searchParams.busca !== undefined) {
      setSearchQuery(searchParams.busca);
    }
  }, [searchParams.categoria, searchParams.busca]);

  // Cart state
  const [cart, setCart] = useState<Record<number, number>>({});
  const cartCount = Object.values(cart).reduce((sum, q) => sum + q, 0);

  const addToCart = (id: number) => {
    if (!isLoggedIn) {
      toast.info("Faça login para adicionar produtos ao carrinho!");
      navigate({ to: "/conta", search: { tab: "entrar" } });
      return;
    }
    setCart((curr) => ({ ...curr, [id]: (curr[id] ?? 0) + 1 }));
    toast.success("Produto adicionado ao carrinho!");
  };

  // Extract all unique categories present in the products catalog
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    allProducts.forEach((p) => {
      if (p.category) {
        // can be comma separated
        p.category
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean)
          .forEach((cat) => set.add(cat));
      }
    });
    return ["Todas", ...Array.from(set).sort()];
  }, [allProducts]);

  // Max price among products for the range slider
  const maxProductPrice = useMemo(() => {
    if (!allProducts.length) return 100;
    return Math.max(...allProducts.map((p) => p.price), 80);
  }, [allProducts]);

  // Filtering & Sorting
  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return allProducts.filter((p) => {
      // Category match
      const pCats = p.category ? p.category.toLowerCase() : "";
      const matchesCategory =
        selectedCategory === "Todas" || pCats.includes(selectedCategory.toLowerCase());

      // Search match
      const matchesSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        (p.shortDescription && p.shortDescription.toLowerCase().includes(query)) ||
        (p.sku && p.sku.toLowerCase().includes(query));

      // Discount match
      const matchesDiscount = !onlyDiscount || p.discount > 0;

      // Price match
      const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];

      return matchesCategory && matchesSearch && matchesDiscount && matchesPrice;
    });
  }, [allProducts, searchQuery, selectedCategory, onlyDiscount, priceRange]);

  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    switch (sortOption) {
      case "menor-preco":
        return list.sort((a, b) => a.price - b.price);
      case "maior-preco":
        return list.sort((a, b) => b.price - a.price);
      case "desconto":
        return list.sort((a, b) => b.discount - a.discount);
      case "nome":
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case "avaliacoes":
        return list.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
      case "destaques":
      default:
        return list;
    }
  }, [filteredProducts, sortOption]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("Todas");
    setOnlyDiscount(false);
    setPriceRange([0, maxProductPrice + 20]);
    setSortOption("destaques");
  };

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedCategory !== "Todas" ||
    onlyDiscount ||
    priceRange[0] > 0 ||
    priceRange[1] < maxProductPrice;

  // Render Filter Sidebar content (shared between desktop and mobile sheet)
  const FilterControls = () => (
    <div className="space-y-6 text-sm">
      {/* Search Input */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
          Buscar no catálogo
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Nome, SKU ou ativo..."
            className="pl-9 h-10 rounded-lg bg-card text-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Categorias */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Categorias ({availableCategories.length - 1})
          </label>
          {selectedCategory !== "Todas" && (
            <button
              type="button"
              onClick={() => setSelectedCategory("Todas")}
              className="text-[11px] font-semibold text-primary hover:underline"
            >
              Limpar
            </button>
          )}
        </div>
        <div className="flex flex-col gap-1 max-h-72 overflow-y-auto pr-1">
          {availableCategories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count =
              cat === "Todas"
                ? allProducts.length
                : allProducts.filter((p) => p.category.toLowerCase().includes(cat.toLowerCase()))
                    .length;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-all ${
                  isSelected
                    ? "bg-primary font-semibold text-primary-foreground shadow-xs"
                    : "text-foreground/80 hover:bg-muted"
                }`}
              >
                <span className="truncate">{cat}</span>
                <span
                  className={`text-[10px] rounded-full px-2 py-0.5 font-bold ${
                    isSelected ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Promoção / Desconto */}
      <div className="pt-2 border-t border-border">
        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
          Ofertas especiais
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer py-1 text-xs font-medium text-foreground">
          <input
            type="checkbox"
            checked={onlyDiscount}
            onChange={(e) => setOnlyDiscount(e.target.checked)}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
          />
          <span>Somente produtos com desconto</span>
        </label>
      </div>

      {/* Faixa de Preço */}
      <div className="pt-2 border-t border-border">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Faixa de Preço
          </label>
          <span className="text-xs font-bold text-primary">até {formatPrice(priceRange[1])}</span>
        </div>
        <input
          type="range"
          min={0}
          max={maxProductPrice + 20}
          step={5}
          value={priceRange[1]}
          onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
          className="w-full accent-primary cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
          <span>R$ 0</span>
          <span>{formatPrice(maxProductPrice + 20)}</span>
        </div>
      </div>

      {/* Limpar tudo */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          onClick={resetFilters}
          className="w-full h-9 rounded-lg text-xs gap-1.5 font-semibold text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Redefinir todos os filtros
        </Button>
      )}
    </div>
  );

  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground flex flex-col">
      <TopBar />
      <SiteHeader cartCount={cartCount} />

      {/* Breadcrumb Header */}
      <div className="border-b border-border bg-card/60">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Você está em"
            className="flex items-center gap-2 text-xs text-muted-foreground mb-2"
          >
            <Link to="/" className="hover:text-primary transition-colors">
              Início
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-semibold text-foreground">Todos os produtos</span>
            {selectedCategory !== "Todas" && (
              <>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="text-primary font-medium">{selectedCategory}</span>
              </>
            )}
          </nav>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl text-foreground font-bold">
                Todos os produtos
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Explore nosso catálogo com fórmulas naturais, fitoterápicos e suplementos de alta
                qualidade.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
                Mostrando <strong className="text-foreground">{sortedProducts.length}</strong> de{" "}
                {allProducts.length} produtos
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Body */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1 w-full">
        {/* Mobile Filter and Sort Bar */}
        <div className="flex items-center justify-between gap-2.5 pb-5 lg:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileFiltersOpen(true)}
            className="flex-1 h-10 rounded-lg gap-2 text-xs font-semibold"
          >
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            Filtros {hasActiveFilters && "(Ativos)"}
          </Button>

          <div className="relative min-w-[140px]">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="w-full h-10 rounded-lg border border-border bg-card px-3 text-xs font-semibold text-foreground shadow-2xs focus:outline-hidden"
            >
              <option value="destaques">Destaques</option>
              <option value="menor-preco">Menor preço</option>
              <option value="maior-preco">Maior preço</option>
              <option value="desconto">Maior desconto</option>
              <option value="nome">Nome (A - Z)</option>
              <option value="avaliacoes">Mais bem avaliados</option>
            </select>
          </div>
        </div>

        {/* Mobile Filter Sheet */}
        <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
          <SheetContent side="left" className="w-[85vw] max-w-md overflow-y-auto">
            <SheetHeader className="text-left mb-4">
              <SheetTitle className="font-display text-xl">Filtros de Produtos</SheetTitle>
              <SheetDescription>Selecione as opções para refinar o catálogo.</SheetDescription>
            </SheetHeader>
            <FilterControls />
            <div className="mt-8">
              <Button
                className="w-full h-11 rounded-lg font-bold"
                onClick={() => setMobileFiltersOpen(false)}
              >
                Ver {sortedProducts.length} produtos
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop Grid Layout: Sidebar + Products */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          {/* Desktop Left Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
                <div className="flex items-center gap-2 font-display text-base font-bold text-foreground">
                  <SlidersHorizontal className="h-4 w-4 text-primary" />
                  <span>Filtrar produtos</span>
                </div>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-[11px] font-semibold text-primary hover:underline"
                  >
                    Limpar
                  </button>
                )}
              </div>
              <FilterControls />
            </div>
          </aside>

          {/* Right: Products Area */}
          <div>
            {/* Desktop Sort and Results Counter Bar */}
            <div className="hidden lg:flex items-center justify-between pb-6 mb-6 border-b border-border">
              <p className="text-xs text-muted-foreground">
                Exibindo <strong className="text-foreground">{sortedProducts.length}</strong>{" "}
                produtos
                {selectedCategory !== "Todas" && (
                  <span>
                    {" "}
                    em <span className="font-semibold text-primary">{selectedCategory}</span>
                  </span>
                )}
              </p>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                  <ArrowUpDown className="h-3.5 w-3.5" /> Ordenar por:
                </span>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                  className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-2xs focus:border-primary focus:outline-hidden cursor-pointer"
                >
                  <option value="destaques">Destaques</option>
                  <option value="menor-preco">Menor preço</option>
                  <option value="maior-preco">Maior preço</option>
                  <option value="desconto">Maior desconto</option>
                  <option value="nome">Nome (A - Z)</option>
                  <option value="avaliacoes">Mais bem avaliados</option>
                </select>
              </div>
            </div>

            {/* Quick Category Chips for Fast Access */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6">
              {availableCategories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground font-bold shadow-xs"
                        : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Products Grid */}
            {sortedProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 xl:grid-cols-4">
                {sortedProducts.map((product) => (
                  <article
                    key={product.id}
                    className="group flex min-w-0 flex-col rounded-lg border border-border bg-card p-3 shadow-card transition-all hover:-translate-y-1 hover:shadow-soft"
                  >
                    <div className="relative overflow-hidden rounded-md bg-muted">
                      <ProductFavoriteButton productId={product.id} productName={product.name} />
                      {product.discount > 0 && (
                        <span className="absolute right-2 top-2 z-10 rounded-full bg-sale px-2.5 py-1 text-[0.65rem] font-bold text-sale-foreground shadow-xs">
                          {product.discount}% OFF
                        </span>
                      )}
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

                    <div className="mt-2.5">
                      <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                        {product.category}
                      </span>
                      <h3 className="mt-0.5 min-h-10 text-xs font-semibold leading-snug sm:text-sm text-foreground line-clamp-2">
                        {product.name}
                      </h3>
                    </div>

                    <div className="mt-2">
                      {product.discount > 0 && (
                        <p className="text-xs text-muted-foreground line-through">
                          {formatPrice(product.oldPrice)}
                        </p>
                      )}
                      <p className="text-lg font-extrabold text-sale">
                        {formatPrice(product.price)}
                      </p>
                      <p className="text-[0.68rem] text-muted-foreground">
                        6x de {formatPrice(product.price / 6)}
                      </p>
                    </div>

                    <div className="mt-4 grid gap-2">
                      <Button
                        asChild
                        size="sm"
                        className="h-9 w-full whitespace-normal px-2 py-1.5 text-xs font-semibold"
                      >
                        <Link to="/produto/$slug" params={{ slug: product.slug }}>
                          Ver detalhes
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 w-full whitespace-normal px-2 py-1.5 text-xs font-semibold"
                        onClick={() => addToCart(product.id)}
                      >
                        <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                        Adicionar
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center my-8">
                <Search className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                <h3 className="font-display text-xl font-bold">Nenhum produto encontrado</h3>
                <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
                  Não encontramos nenhum produto com os filtros atuais. Tente ajustar os termos de
                  busca ou a categoria.
                </p>
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="mt-5 rounded-full text-xs font-semibold"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                  Ver todos os produtos
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <WhatsAppFab />
      <SiteFooter />
    </main>
  );
}
