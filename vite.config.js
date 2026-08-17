import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const RAIZ = path.dirname(fileURLToPath(import.meta.url));
const PASTA_DE_ASSETS = path.join(RAIZ, "public", "assets");

// Fontes aceitas para o video de fundo do hero, na ordem de preferencia.
// WEBM primeiro: com o mesmo peso ele entrega mais qualidade que o MP4. O MP4
// e a rede de seguranca do Safari, que ate hoje nao toca VP9/AV1 em WEBM.
const FONTES_POSSIVEIS = [
  { arquivo: "hero.webm", url: "/assets/hero.webm", tipo: "video/webm" },
  { arquivo: "hero.mp4", url: "/assets/hero.mp4", tipo: "video/mp4" },
];

/**
 * Descobre EM TEMPO DE BUILD quais arquivos de video existem em public/assets.
 *
 * Por que na build e nao no navegador: a alternativa seria o site pedir o
 * arquivo e ver se responde 404. Só que um 404 aparece em vermelho no console
 * do visitante e conta como requisicao falha em qualquer monitor de erro --
 * exatamente o "nada quebrado" que nao podemos ter enquanto a paroquia nao
 * filmar nada. Resolvendo aqui, quando o video nao existe o elemento <video>
 * simplesmente nao chega ao bundle: zero requisicao, zero erro, zero byte.
 *
 * Isso funciona porque public/ e conteudo estatico da Vercel: um arquivo novo
 * so aparece no ar junto com um deploy, e todo deploy roda uma build. Nao existe
 * o caso "o arquivo apareceu sem a build saber".
 */
function fontesDoVideoDoHero() {
  return FONTES_POSSIVEIS.filter(({ arquivo }) =>
    fs.existsSync(path.join(PASTA_DE_ASSETS, arquivo)),
  ).map(({ url, tipo }) => ({ url, tipo }));
}

/**
 * Em desenvolvimento a lista acima e calculada uma vez, quando o Vite sobe.
 * Sem isto, quem largasse o hero.mp4 na pasta com o servidor rodando nao veria
 * nada acontecer e concluiria que o recurso esta quebrado. O restart refaz a
 * conta. So no `vite dev` -- na build nao existe watcher.
 */
function recarregarAoTrocarOVideoDoHero() {
  return {
    name: "video-do-hero",
    apply: "serve",
    configureServer(servidor) {
      // public/ nao entra no grafo de modulos, entao o watcher nao a observa
      // por conta propria.
      servidor.watcher.add(PASTA_DE_ASSETS);

      const reavaliar = (caminho) => {
        if (/hero\.(webm|mp4)$/i.test(caminho)) servidor.restart();
      };

      servidor.watcher.on("add", reavaliar);
      servidor.watcher.on("unlink", reavaliar);
    },
  };
}

export default defineConfig({
  plugins: [react(), recarregarAoTrocarOVideoDoHero()],
  define: {
    // Vira um array literal dentro do bundle. Hoje: [].
    __FONTES_DO_VIDEO_DO_HERO__: JSON.stringify(fontesDoVideoDoHero()),
  },
  server: {
    port: 5173,
    // Em desenvolvimento o front chama /api no mesmo host e o Vite repassa
    // para o Express. Assim o codigo do cliente nao precisa saber a porta da
    // API e nao existe CORS no ambiente local.
    proxy: {
      "/api": {
        target: "http://localhost:3333",
        changeOrigin: true,
      },
    },
  },
});
