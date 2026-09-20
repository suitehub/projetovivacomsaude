import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const rootDir = process.cwd();
const distDir = path.join(rootDir, "dist");
const publicOutDir = path.join(rootDir, ".output", "public");
const serverEntry = path.join(rootDir, ".output", "server", "index.mjs");

console.log("🚀 Iniciando build e exportação para GitHub Pages...");

// 1. Executa o build de produção Vite / TanStack Start
console.log("📦 Compilando aplicação...");
const targetBaseUrl = process.env.BASE_URL || "./";
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

function fixPathsForDepth(html, depth = 0, baseUrl = "") {
  // Se baseUrl for um caminho absoluto como "/nome-do-repo/", mantém
  if (baseUrl && baseUrl !== "./" && baseUrl !== "/") {
    return html;
  }
  const prefix = depth === 0 ? "./" : "../".repeat(depth);

  let output = html
    .replaceAll('"/./assets/', `"${prefix}assets/`)
    .replaceAll("'/./assets/", `'${prefix}assets/`)
    .replaceAll('"/assets/', `"${prefix}assets/`)
    .replaceAll("'/assets/", `'${prefix}assets/`)
    .replaceAll('"/logoprojeto.png"', `"${prefix}logoprojeto.png"`)
    .replaceAll("'/logoprojeto.png'", `'${prefix}logoprojeto.png'`)
    .replaceAll('"/hero.png"', `"${prefix}hero.png"`)
    .replaceAll("'/hero.png'", `'${prefix}hero.png'`)
    .replaceAll('"/favicon.ico"', `"${prefix}favicon.ico"`)
    .replaceAll("'/favicon.ico'", `'${prefix}favicon.ico'`)
    .replaceAll('"/favicon.svg"', `"${prefix}favicon.svg"`)
    .replaceAll("'/favicon.svg'", `'${prefix}favicon.svg'`);

  if (depth > 0) {
    output = output
      .replaceAll('"./assets/', `"${prefix}assets/`)
      .replaceAll("'./assets/", `'${prefix}assets/`);
  }

  return output;
}

if (serverModule && serverModule.default && typeof serverModule.default.fetch === "function") {
  for (const route of routesToRender) {
    try {
      const res = await serverModule.default.fetch(new Request(`http://localhost${route}`), {});
      if (res.status === 200) {
        let html = await res.text();

        // Injeta o script de decodificação SPA no <head> se ainda não existir
        if (!html.includes("l.search[1] === '/'") && html.includes("</head>")) {
          html = html.replace("</head>", `${spaDecodeScript}</head>`);
        }

        if (route === "/") {
          const processedHtml = fixPathsForDepth(html, 0, targetBaseUrl);
          fs.writeFileSync(path.join(distDir, "index.html"), processedHtml, "utf8");
          console.log(`  ✓ Página / -> dist/index.html`);
        } else {
          const processedHtml = fixPathsForDepth(html, 1, targetBaseUrl);
          const routeDir = path.join(distDir, route.slice(1));
          fs.mkdirSync(routeDir, { recursive: true });
          fs.writeFileSync(path.join(routeDir, "index.html"), processedHtml, "utf8");
          console.log(`  ✓ Página ${route} -> dist/${route.slice(1)}/index.html`);
        }
      } else {
        console.warn(`  ⚠️ Rota ${route} retornou status ${res.status}`);
      }
    } catch (err) {
      console.warn(`  ⚠️ Erro ao renderizar rota ${route}:`, err.message);
    }
  }
}

// Se não gerou index.html por algum motivo, gera fallback
if (!fs.existsSync(path.join(distDir, "index.html"))) {
  console.log("ℹ️ Gerando index.html fallback...");
  const fallbackHtml = `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Projeto Viva com Saúde</title>
    ${spaDecodeScript}
  </head>
  <body>
    <div id="root"></div>
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
