import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

function getBasepath(): string {
  if (typeof window !== "undefined") {
    // Se estiver hospedado no GitHub Pages (ex: suitehub.github.io/projetovivacomsaude/)
    if (window.location.hostname.endsWith("github.io")) {
      const segments = window.location.pathname.split("/").filter(Boolean);
      if (
        segments.length > 0 &&
        !["admin", "produtos", "conta", "produto"].includes(segments[0])
      ) {
        return `/${segments[0]}`;
      }
    }
  }

  const base = import.meta.env.BASE_URL;
  if (base && base !== "./" && base !== "/") {
    return base.replace(/\/$/, "");
  }

  return "";
}

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    basepath: getBasepath(),
  });

  return router;
};
