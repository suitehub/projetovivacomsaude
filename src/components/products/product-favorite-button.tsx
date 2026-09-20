import React from "react";
import { Heart } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useFavorites } from "@/data/favorites";
import { useCurrentUser } from "@/data/user-auth";
import { cn } from "@/lib/utils";

interface ProductFavoriteButtonProps {
  productId: number | string;
  productName?: string;
  className?: string;
  size?: "sm" | "md";
}

export function ProductFavoriteButton({
  productId,
  productName,
  className,
  size = "sm",
}: ProductFavoriteButtonProps) {
  const navigate = useNavigate();
  const { isLoggedIn } = useCurrentUser();
  const { isFavorite, toggleFavorite } = useFavorites();

  const isFav = isFavorite(productId);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      toast.info("Faça login em sua conta para favoritar produtos!");
      navigate({ to: "/conta", search: { tab: "entrar" } });
      return;
    }

    const res = toggleFavorite(productId);
    if (res.added) {
      toast.success(
        productName
          ? `"${productName}" adicionado aos seus favoritos!`
          : "Produto adicionado aos seus favoritos!",
      );
    } else {
      toast.info(
        productName
          ? `"${productName}" removido dos favoritos.`
          : "Produto removido dos favoritos.",
      );
    }
  };

  const isSmall = size === "sm";

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      aria-pressed={isFav}
      className={cn(
        "absolute left-2 top-2 z-20 flex items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-xs transition-all duration-200 hover:scale-110 hover:bg-white active:scale-95",
        isSmall ? "h-7 w-7" : "h-8.5 w-8.5",
        isFav ? "text-red-500 hover:text-red-600" : "text-gray-600 hover:text-red-500",
        className,
      )}
    >
      <Heart
        className={cn(
          "transition-colors",
          isSmall ? "h-3.5 w-3.5" : "h-4 w-4",
          isFav && "fill-red-500 text-red-500",
        )}
      />
    </button>
  );
}
