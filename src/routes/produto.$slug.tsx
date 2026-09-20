import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ChevronDown,
  Copy,
  Facebook,
  Heart,
  Leaf,
  Link2,
  Maximize2,
  Menu,
  MessageCircle,
  Minus,
  PackageCheck,
  Plus,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Tag,
  Star,
  Truck,
} from "lucide-react";

import productsImage from "@/assets/viva-products.jpg";
import { SiteFooter, SiteHeader, TopBar, WhatsAppFab } from "@/components/site-chrome";
import { Button } from "@/components/ui/button";
import { formatPrice, products } from "@/data/products";
import { findStoreProductBySlug, getAllStoreProducts } from "@/data/all-store-products";
import { useStoreSettings } from "@/hooks/use-store-settings";
import { ProductFavoriteButton } from "@/components/products/product-favorite-button";
import { useFavorites } from "@/data/favorites";
import { useCurrentUser } from "@/data/user-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/produto/$slug")({
  ssr: false,
  loader: ({ params }) => {
    const product = findStoreProductBySlug(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Produto não encontrado | Viva com Saúde" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { product } = loaderData;
    const title = `${product.name} | Projeto Viva com Saúde`;
    return {
      meta: [
        { title },
        { name: "description", content: product.shortDescription },
        { property: "og:title", content: title },
        { property: "og:description", content: product.shortDescription },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  errorComponent: ({ error }) => (
    <div role="alert" className="p-10 text-center">
      {error.message}
    </div>
  ),
  notFoundComponent: () => (
    <div className="grid min-h-[60vh] place-items-center p-10 text-center">
      <div>
        <h1 className="font-display text-4xl">Produto não encontrado</h1>
        <Button asChild className="mt-6 rounded-full">
          <Link to="/" hash="produtos">
            Ver todos os produtos
          </Link>
        </Button>
      </div>
    </div>
  ),
  component: ProductPage,
});

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`Nota ${rating} de 5`}>
      {[1, 2, 3, 4, 5].map((index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${index <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-border"}`}
        />
      ))}
    </span>
  );
}

function ProductPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useCurrentUser();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { product: initialProduct } = Route.useLoaderData();
  const params = Route.useParams();
  const [product, setProduct] = useState<Product>(initialProduct);
  const settings = useStoreSettings();
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setProduct(initialProduct);
  }, [initialProduct]);

  useEffect(() => {
    const handleUpdate = () => {
      const refreshed = findStoreProductBySlug(params.slug);
      if (refreshed) {
        setProduct(refreshed);
      }
    };
    window.addEventListener("viva_admin_products_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("viva_admin_products_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [params.slug]);

  const isFav = isFavorite(product.id);

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      toast.info("Faça login para adicionar produtos ao carrinho!");
      navigate({ to: "/conta", search: { tab: "entrar" } });
      return;
    }
    toast.success(`${quantity}x "${product.name}" adicionado ao carrinho!`);
  };

  const handleToggleFavorite = () => {
    if (!isLoggedIn) {
      toast.info("Faça login em sua conta para favoritar produtos!");
      navigate({ to: "/conta", search: { tab: "entrar" } });
      return;
    }
    const res = toggleFavorite(product.id);
    if (res.added) {
      toast.success(`"${product.name}" adicionado aos seus favoritos!`);
    } else {
      toast.info(`"${product.name}" removido dos favoritos.`);
    }
  };

  const allProds = getAllStoreProducts();
  const related = allProds.filter((item) => item.slug !== product.slug).slice(0, 5);
  const customImages =
    product.images && product.images.length > 0
      ? product.images
      : product.imageUrl
        ? [product.imageUrl]
        : [];
  const gallery = product.galleryPositions || ["0%"];
  const hasCustomImages = customImages.length > 0;
  const activeCustomImage = hasCustomImages
    ? customImages[activeImage % customImages.length]
    : null;

  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <TopBar />
      <SiteHeader cartCount={0} />

      <nav aria-label="Você está em" className="mx-auto max-w-7xl px-4 pb-2 pt-5 lg:px-8">
        <ol className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <li>
            <Link to="/" className="hover:text-primary">
              Início
            </Link>
          </li>
          <li aria-hidden="true">›</li>
          <li>
            <Link to="/" hash="produtos" className="hover:text-primary">
              {product.category}
            </Link>
          </li>
          <li aria-hidden="true">›</li>
          <li className="font-semibold text-foreground">{product.name}</li>
        </ol>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:px-8">
        {/* Galeria */}
        <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-3 sm:grid-cols-[5.5rem_minmax(0,1fr)]">
          <div className="flex flex-col gap-3">
            {hasCustomImages
              ? customImages.map((imgUrl, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    aria-label={`Ver imagem ${index + 1} de ${product.name}`}
                    aria-pressed={activeImage === index}
                    className={`aspect-square w-full overflow-hidden rounded-md border transition-colors bg-gray-50 flex items-center justify-center ${
                      activeImage === index
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Miniatura ${index + 1}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))
              : gallery.map((position, index) => (
                  <button
                    key={position + index}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    aria-label={`Ver imagem ${index + 1} de ${product.name}`}
                    aria-pressed={activeImage === index}
                    className={`product-crop aspect-square w-full overflow-hidden rounded-md border transition-colors ${
                      activeImage === index
                        ? "border-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                    style={{
                      backgroundImage: `url(${productsImage})`,
                      backgroundPosition: position,
                    }}
                  />
                ))}
            <span className="mx-auto grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground">
              <ChevronDown className="h-4 w-4" />
            </span>
          </div>
          <div className="relative overflow-hidden rounded-lg border border-border bg-card shadow-card flex items-center justify-center">
            {product.discount > 0 && (
              <span className="absolute right-3 top-3 z-10 rounded-full bg-primary px-3 py-1 text-[0.7rem] font-bold text-primary-foreground">
                {product.discount}% OFF
              </span>
            )}
            {hasCustomImages && activeCustomImage ? (
              <img
                src={activeCustomImage}
                alt={product.name}
                className="aspect-[4/5] w-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div
                role="img"
                aria-label={`Pote de ${product.name}`}
                className="product-crop aspect-[4/5] w-full"
                style={{
                  backgroundImage: `url(${productsImage})`,
                  backgroundPosition: gallery[activeImage] || "0%",
                }}
              />
            )}
            <span className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-background/85 text-primary shadow-card">
              <Maximize2 className="h-4 w-4" />
            </span>
          </div>
        </div>

        {/* Informações */}
        <div className="min-w-0">
          <h1 className="font-display text-3xl leading-tight sm:text-4xl lg:text-5xl">
            {product.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{product.subtitle}</p>

          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Stars rating={product.rating} />
            <span>({product.reviews} avaliações)</span>
          </div>

          <p className="mt-4 max-w-xl text-sm leading-relaxed text-foreground/80">
            {product.shortDescription}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="text-base text-muted-foreground line-through">
              {formatPrice(product.oldPrice)}
            </span>
            <strong className="text-4xl font-extrabold text-primary">
              {formatPrice(product.price)}
            </strong>
            <span className="rounded-full bg-primary px-3 py-1 text-[0.7rem] font-bold text-primary-foreground">
              {product.discount}% OFF
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            ou {product.installments}x de {formatPrice(product.price / product.installments)} sem
            juros no cartão
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-md border border-border bg-card">
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-md"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                aria-label="Diminuir quantidade"
              >
                <Minus />
              </Button>
              <span className="w-10 text-center text-sm font-semibold" aria-live="polite">
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-md"
                onClick={() => setQuantity((value) => value + 1)}
                aria-label="Aumentar quantidade"
              >
                <Plus />
              </Button>
            </div>
            <Button className="h-12 min-w-60 flex-1 rounded-md text-sm" onClick={handleAddToCart}>
              <ShoppingCart /> Adicionar ao carrinho
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleToggleFavorite}
              aria-pressed={isFav}
              aria-label={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              className="h-12 w-12 rounded-full"
            >
              <Heart className={isFav ? "fill-red-500 text-red-500" : ""} />
            </Button>
          </div>

          <div className="mt-3">
            <a
              href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(`Olá! Gostaria de comprar ou tirar dúvidas sobre o produto *${product.name}* (Quantidade: ${quantity}) no valor de ${formatPrice(product.price * quantity)} pelo WhatsApp.`)}`}
              target="_blank"
              rel="noreferrer"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-whatsapp px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
            >
              <MessageCircle className="h-5 w-5" />
              Comprar ou tirar dúvidas pelo WhatsApp
            </a>
          </div>

          <div className="mt-6 grid gap-4 border-t border-border pt-6 sm:grid-cols-3">
            {[
              {
                icon: PackageCheck,
                title: "Estoque",
                copy: "disponível",
              },
              {
                icon: Truck,
                title: settings.trustDeliveryTitle || "Entrega para",
                copy: settings.trustDeliverySubtitle || "todo o Brasil",
              },
              {
                icon: ShieldCheck,
                title: settings.trustSecurityTitle || "Compra 100%",
                copy: settings.trustSecuritySubtitle || "segura",
              },
            ].map(({ icon: Icon, title, copy }) => (
              <div key={title} className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-soft text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-xs leading-snug text-muted-foreground">
                  {title}
                  <br />
                  {copy}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-4 rounded-lg border border-border bg-brand-soft/45 p-5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-background text-primary">
              <Leaf className="h-6 w-6" />
            </span>
            <span>
              <strong className="block text-sm text-primary">Produto 100% natural</strong>
              <small className="text-xs text-muted-foreground">
                Qualidade e segurança para a sua saúde.
              </small>
            </span>
          </div>
        </div>
      </section>

      {/* Descrição do Produto */}
      <section className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="rounded-lg border border-border bg-card shadow-card p-5 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
            <div className="min-w-0">
              <h2 className="font-display text-2xl sm:text-3xl text-foreground">
                Descrição do produto
              </h2>
              {product.description && product.description.length > 0 ? (
                product.description.map((paragraph, idx) => (
                  <p
                    key={idx}
                    className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground"
                  >
                    {paragraph}
                  </p>
                ))
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">Sem descrição detalhada.</p>
              )}

              {product.reviews > 0 && (
                <div className="mt-8 border-t border-border pt-6">
                  <h3 className="font-display text-lg font-bold text-foreground">
                    Avaliações dos clientes
                  </h3>
                  <div className="mt-2 flex items-center gap-3">
                    <Stars rating={product.rating} />
                    <span className="text-sm text-muted-foreground">
                      {product.rating.toLocaleString("pt-BR")} de 5 · {product.reviews} avaliações
                    </span>
                  </div>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    Clientes destacam a qualidade natural da fórmula, a entrega rápida e os
                    resultados percebidos com o uso contínuo.
                  </p>
                </div>
              )}
            </div>

            <aside className="min-w-0 rounded-lg border border-border">
              <dl className="divide-y divide-border text-xs">
                {[
                  { icon: PackageCheck, term: "Categoria", value: product.category },
                  { icon: Tag, term: "SKU", value: product.sku },
                  { icon: ShieldCheck, term: "Disponibilidade", value: "Em estoque" },
                  { icon: Truck, term: "Entrega", value: "Para todo o Brasil" },
                  { icon: Leaf, term: "Formas de pagamento", value: "Cartão, Pix e Boleto" },
                ].map(({ icon: Icon, term, value }) => (
                  <div key={term} className="flex items-center justify-between gap-3 px-4 py-3.5">
                    <dt className="flex min-w-0 items-center gap-2 text-muted-foreground">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-soft text-primary">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="truncate">{term}</span>
                    </dt>
                    <dd
                      className={`shrink-0 font-semibold ${term === "Disponibilidade" ? "text-primary" : ""}`}
                    >
                      {value}
                    </dd>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                  <dt className="flex items-center gap-2 text-muted-foreground">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-soft text-primary">
                      <Share2 className="h-3.5 w-3.5" />
                    </span>
                    Compartilhar
                  </dt>
                  <dd className="flex gap-2">
                    {[Copy, Facebook, Link2].map((Icon, index) => (
                      <span
                        key={index}
                        className="grid h-8 w-8 place-items-center rounded-full border border-border text-primary"
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                    ))}
                  </dd>
                </div>
              </dl>
            </aside>
          </div>
        </div>
      </section>

      {/* Relacionados */}
      <section className="mx-auto max-w-7xl px-4 pb-14 lg:px-8">
        <h2 className="mb-5 font-display text-3xl sm:text-4xl">Produtos relacionados</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {related.map((item) => (
            <article
              key={item.id}
              className="group flex min-w-0 flex-col rounded-md border border-border bg-card p-2.5 shadow-card transition-transform hover:-translate-y-1"
            >
              <div className="relative overflow-hidden rounded-md bg-muted">
                <ProductFavoriteButton productId={item.id} productName={item.name} />
                <span className="absolute right-1.5 top-1.5 z-10 rounded-full bg-primary px-2 py-1 text-[0.62rem] font-bold text-primary-foreground">
                  {item.discount}% OFF
                </span>
                <div
                  role="img"
                  aria-label={`Pote de ${item.name}`}
                  className="product-crop aspect-[4/5] w-full transition-transform duration-500 group-hover:scale-105"
                  style={{
                    backgroundImage: `url(${productsImage})`,
                    backgroundPosition: item.imagePosition,
                  }}
                />
              </div>
              <h3 className="mt-3 min-h-10 text-xs font-semibold leading-snug sm:text-sm">
                {item.name}
              </h3>
              <p className="mt-2 text-xs text-muted-foreground line-through">
                {formatPrice(item.oldPrice)}
              </p>
              <p className="text-lg font-extrabold text-sale">{formatPrice(item.price)}</p>
              <p className="mb-3 text-[0.68rem] text-muted-foreground">
                {item.installments}x de {formatPrice(item.price / item.installments)}
              </p>
              <Button
                asChild
                size="sm"
                className="mt-auto h-auto min-h-9 w-full whitespace-normal px-2 py-2 text-[0.68rem] sm:text-xs"
              >
                <Link to="/produto/$slug" params={{ slug: item.slug }}>
                  Ver detalhes
                </Link>
              </Button>
            </article>
          ))}
        </div>
      </section>

      <SiteFooter />
      <WhatsAppFab />
    </main>
  );
}
