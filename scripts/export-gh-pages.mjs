import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const rootDir = process.cwd();
const distDir = path.join(rootDir, "dist");
const publicOutDir = path.join(rootDir, ".output", "public");
const serverEntry = path.join(rootDir, ".output", "server", "index.mjs");

console.log("🚀 Iniciando build e exportação para GitHub Pages...");

// 1. Determina a base URL correta para o GitHub Pages
let targetBaseUrl = process.env.BASE_URL;
if (!targetBaseUrl) {
  if (process.env.GITHUB_REPOSITORY) {
    const repoParts = process.env.GITHUB_REPOSITORY.split("/");
    const repoName = repoParts[1] || "";
    targetBaseUrl = repoName.endsWith(".github.io") ? "/" : `/${repoName}/`;
  } else {
    targetBaseUrl = "/projetovivacomsaude/";
  }
}
if (!targetBaseUrl.endsWith("/")) {
  targetBaseUrl += "/";
}
const urlPrefix = targetBaseUrl === "/" ? "" : targetBaseUrl.replace(/\/$/, "");
console.log(`🌐 Base URL configurada para: ${targetBaseUrl} (Prefixo: "${urlPrefix}")`);

// Executa o build de produção Vite / TanStack Start com a BASE_URL definida
console.log("📦 Compilando aplicação...");
execSync("npm run build", {
  stdio: "inherit",
  env: {
    ...process.env,
    NODE_ENV: "production",
    BASE_URL: targetBaseUrl,
  },
});

// 2. Limpa e cria a pasta dist
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// 3. Copia todos os assets estáticos gerados para dist
if (fs.existsSync(publicOutDir)) {
  console.log("📂 Copiando assets públicos para dist...");
  fs.cpSync(publicOutDir, distDir, { recursive: true });
}

// 4. Cria arquivo .nojekyll (essencial para que o GitHub Pages sirva todas as pastas e arquivos)
fs.writeFileSync(path.join(distDir, ".nojekyll"), "");
console.log("✅ Criado arquivo .nojekyll");

// 5. Renderiza as páginas via SSR para gerar HTMLs estáticos de cada rota
console.log("🌐 Gerando páginas HTML estáticas...");

let serverModule;
try {
  serverModule = await import(serverEntry);
} catch (err) {
  console.warn("⚠️ Aviso ao importar servidor SSR:", err.message);
}

const routesToRender = ["/", "/produtos", "/admin", "/conta"];

const spaDecodeScript = `<script>(function(l){if(l.search[1]==='/'){var p=l.search.slice(1).split('&').map(function(s){return s.replace(/~and~/g,'&')}).join('?');window.history.replaceState(null,null,l.pathname.slice(0,-1)+p+l.hash);}})(window.location);</script>`;

if (serverModule && serverModule.default && typeof serverModule.default.fetch === "function") {
  for (const route of routesToRender) {
    try {
      const requestPath = `${urlPrefix}${route === "/" ? "/" : route}`;
      let res = await serverModule.default.fetch(new Request(`http://localhost${requestPath}`), {});
      if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
        const redirectLoc = res.headers.get("location");
        res = await serverModule.default.fetch(
          new Request(new URL(redirectLoc, "http://localhost").href),
          {},
        );
      }

      if (res.status === 200) {
        let html = await res.text();

        // Injeta o script de decodificação SPA no <head> se ainda não existir
        if (!html.includes("l.search[1] === '/'") && html.includes("</head>")) {
          html = html.replace("</head>", `${spaDecodeScript}</head>`);
        }

        if (route === "/") {
          fs.writeFileSync(path.join(distDir, "index.html"), html, "utf8");
          console.log(`  ✓ Página / -> dist/index.html`);
        } else {
          const routeDir = path.join(distDir, route.slice(1));
          fs.mkdirSync(routeDir, { recursive: true });
          fs.writeFileSync(path.join(routeDir, "index.html"), html, "utf8");
          console.log(`  ✓ Página ${route} -> dist/${route.slice(1)}/index.html`);
        }
      } else {
        console.warn(`  ⚠️ Rota ${route} (caminho ${requestPath}) retornou status ${res.status}`);
      }
    } catch (err) {
      console.warn(`  ⚠️ Erro ao renderizar rota ${route}:`, err.message);
    }
  }
}

// Se não gerou index.html por algum motivo, gera fallback completo com os assets JS e CSS
if (!fs.existsSync(path.join(distDir, "index.html"))) {
  console.log("ℹ️ Gerando index.html fallback completo com scripts e estilos...");
  const assetsPath = path.join(distDir, "assets");
  const assetFiles = fs.existsSync(assetsPath) ? fs.readdirSync(assetsPath) : [];
  const mainJs = assetFiles.find((f) => f.startsWith("index-") && f.endsWith(".js"));
  const mainCss = assetFiles.find((f) => f.startsWith("styles-") && f.endsWith(".css"));

  const fallbackHtml = `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Projeto Viva com Saúde | Produtos Naturais</title>
    ${mainCss ? `<link rel="stylesheet" href="${targetBaseUrl}assets/${mainCss}" />` : ""}
    ${spaDecodeScript}
  </head>
  <body>
    <div id="root"></div>
    ${mainJs ? `<script type="module" src="${targetBaseUrl}assets/${mainJs}"></script>` : ""}
  </body>
</html>`;
  fs.writeFileSync(path.join(distDir, "index.html"), fallbackHtml, "utf8");
}

// 6. Cria o 404.html inteligente para o GitHub Pages (redirecionamento SPA)
const spa404Html = `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8">
    <title>Projeto Viva com Saúde</title>
    <script>
      // Single Page Apps for GitHub Pages
      // https://github.com/rafgraph/spa-github-pages
      (function() {
        var l = window.location;
        var pathSegmentsToKeep = (l.hostname.endsWith('.github.io') && l.pathname.split('/')[1]) ? 1 : 0;
        var repo = l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/');
        var path = l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~');
        var query = l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '';
        l.replace(
          l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
          repo + '/?/' + path + query + l.hash
        );
      })();
    </script>
  </head>
  <body>
    <div style="font-family: sans-serif; text-align: center; padding: 40px; color: #444;">
      <h2>Carregando página...</h2>
    </div>
  </body>
</html>`;

fs.writeFileSync(path.join(distDir, "404.html"), spa404Html, "utf8");
console.log("✅ Criado dist/404.html para redirecionamento SPA");

console.log("🎉 Build para GitHub Pages concluído com sucesso em ./dist!");
process.exit(0);
