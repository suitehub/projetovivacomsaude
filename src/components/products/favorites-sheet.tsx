import { useState, useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, ShoppingCart, Trash2, ArrowRight, Lock, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/data/favorites";
import { useCurrentUser } from "@/data/user-auth";
import { getAllStoreProducts, StoreProduct } from "@/data/all-store-products";
import productsImage from "@/assets/viva-products.jpg";

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface FavoritesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToCart?: (productId: number) => void;
}

export function FavoritesSheet({ open, onOpenChange, onAddToCart }: FavoritesSheetProps) {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useCurrentUser();
  const { favorites, removeFavorite } = useFavorites();

  const allProducts = useMemo(() => getAllStoreProducts(), []);

  const favoriteProducts = useMemo(() => {
    if (!isLoggedIn || !favorites.length) return [];
    return allProducts.filter((product) =>
      favorites.some((favId) => String(favId) === String(product.id)),
    );
  }, [allProducts, favorites, isLoggedIn]);

  const handleLoginClick = () => {
    onOpenChange(false);
    navigate({ to: "/conta", search: { tab: "entrar" } });
  };

  const handleProductAddToCart = (product: StoreProduct) => {
    if (!isLoggedIn) {
      toast.info("Faça login para adicionar produtos ao carrinho!");
      onOpenChange(false);
      navigate({ to: "/conta", search: { tab: "entrar" } });
      return;
    }

    if (onAddToCart) {
      onAddToCart(product.id);
    } else {
      toast.success(`${product.name} adicionado ao carrinho!`);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader className="border-b border-border pb-4 text-left">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-red-100 text-red-600">
              <Heart className="h-4 w-4 fill-red-600" />
            </span>
            <div>
              <SheetTitle className="font-display text-2xl">Seus Favoritos</SheetTitle>
              <SheetDescription className="text-xs">
                {isLoggedIn
                  ? favoriteProducts.length
                    ? `${favoriteProducts.length} ${favoriteProducts.length === 1 ? "produto salvo" : "produtos salvos"}`
                    : "Nenhum produto salvo ainda"
                  : "Entre na sua conta para acessar seus favoritos"}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto py-4">
          {!isLoggedIn ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-red-50 text-red-500 mb-4">
                <Lock className="h-8 w-8" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">Acesse sua conta</h3>
              <p className="mt-2 text-xs text-muted-foreground max-w-xs leading-relaxed">
                Você precisa estar conectado em uma conta para salvar e visualizar sua lista de
                produtos favoritos.
              </p>
              <Button
                onClick={handleLoginClick}
                className="mt-6 w-full max-w-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11"
              >
                Entrar ou Criar Conta
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ) : favoriteProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-red-50 text-red-400 mb-4">
                <Heart className="h-8 w-8" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">
                Nenhum favorito ainda
              </h3>
              <p className="mt-2 text-xs text-muted-foreground max-w-xs leading-relaxed">
                Olá, {user?.fullName.split(" ")[0]}! Clique no coraçãozinho no topo dos produtos
                para guardá-los aqui e encontrá-los facilmente.
              </p>
              <Button
                asChild
                onClick={() => onOpenChange(false)}
                variant="outline"
                className="mt-6 rounded-full font-semibold"
              >
                <Link to="/produtos">
                  Explorar catálogo de produtos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3 divide-y divide-border/60">
              {favoriteProducts.map((product) => (
                <div
                  key={product.id}
                  className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-3 pt-3 first:pt-0"
                >
                  <div
                    className="product-crop h-20 rounded-md border border-border/50 bg-muted"
                    style={{
                      backgroundImage: `url(${productsImage})`,
                      backgroundPosition: product.imagePosition,
                    }}
                  />
                  <div className="flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-[10px] uppercase font-semibold text-primary">
                          {product.category}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            removeFavorite(product.id);
                            toast.info(`"${product.name}" removido dos favoritos.`);
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          title="Remover dos favoritos"
                          aria-label={`Remover ${product.name} dos favoritos`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <h4 className="text-xs font-semibold leading-snug line-clamp-1">
                        {product.name}
                      </h4>
                      <p className="mt-0.5 text-sm font-bold text-sale">
                        {formatPrice(product.price)}
                      </p>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <Button
                        asChild
                        size="sm"
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="h-7 text-[11px] px-2 font-medium"
                      >
                        <Link to="/produto/$slug" params={{ slug: product.slug }}>
                          Ver
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleProductAddToCart(product)}
                        className="h-7 text-[11px] px-2.5 font-medium ml-auto"
                      >
                        <ShoppingCart className="mr-1 h-3 w-3" />
                        Adicionar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {isLoggedIn && favoriteProducts.length > 0 && (
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
              <span>Total de itens salvos:</span>
              <strong className="text-foreground">{favoriteProducts.length}</strong>
            </div>
            <Button
              asChild
              onClick={() => onOpenChange(false)}
              className="w-full h-10 font-semibold"
            >
              <Link to="/produtos">
                Continuar comprando
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

/**
 * Header button that triggers the Favorites Sheet and displays badge count
 */
export function FavoritesHeaderButton({
  className,
  onAddToCart,
}: {
  className?: string;
  onAddToCart?: (productId: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const { favoriteCount, isLoggedIn } = useFavorites();

  const count = isLoggedIn ? favoriteCount : 0;

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className={`relative rounded-full ${className || ""}`}
        aria-label={`Produtos favoritos (${count} itens)`}
      >
        <Heart className={count > 0 ? "fill-red-500 text-red-500" : ""} />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[0.6rem] font-bold text-white shadow-xs">
            {count}
          </span>
        )}
      </Button>

      <FavoritesSheet open={open} onOpenChange={setOpen} onAddToCart={onAddToCart} />
    </>
  );
}
