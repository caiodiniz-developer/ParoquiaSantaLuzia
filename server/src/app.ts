import express from "express";
import cors from "cors";
import multer from "multer";
import { env } from "./env.js";
import { ErroHttp } from "./erros.js";
import { PASTA_LOCAL, usandoDiscoLocal } from "./storage.js";
import { rotasDeAutenticacao } from "./rotas/auth.rotas.js";
import { rotasDeEvento } from "./rotas/evento.rotas.js";
import { rotasDeConfig } from "./rotas/config.rotas.js";
import { limitarRequisicoes } from "./limitador.js";

export function criarApp() {
  const app = express();

  // Em producao o Render fica na frente como proxy. Sem confiar no primeiro
  // salto, `req.ip` seria sempre o IP do proxy: todo visitante dividiria o
  // mesmo contador de tentativas de login, e um so atacante bloquearia o
  // painel para o padre.
  if (env.emProducao) app.set("trust proxy", 1);

  // Nao anunciar "Express" no cabecalho: e informacao de graca para quem
  // procura servidor com versao vulneravel.
  app.disable("x-powered-by");

  /**
   * Cabecalhos de seguranca basicos, sem dependencia extra.
   *
   * - nosniff: o navegador nao "adivinha" que um upload .png e na verdade HTML.
   * - frame DENY: a API nao pode ser embutida num iframe de outro site.
   * - Referrer: o endereco da API nao vaza para links externos.
   * - CORP cross-origin: as fotos de /uploads continuam carregando no site,
   *   que mora em outra origem.
   */
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    // Em producao a API so fala HTTPS. O HSTS faz o navegador nunca mais
    // tentar HTTP com ela, nem no primeiro clique de um link antigo.
    if (env.emProducao) {
      res.setHeader("Strict-Transport-Security", "max-age=63072000; includeSubDomains");
    }
    next();
  });

  app.use(
    cors({
      /**
       * Lista fechada, com a barra final ja normalizada no env.ts.
       *
       * O `!origem` libera requisicao sem cabecalho Origin -- que e o caso do
       * curl e dos monitores de uptime que mantem o Render acordado. Isso nao
       * abre brecha: navegador sempre manda Origin.
       */
      origin(origem, callback) {
        if (!origem || env.origensPermitidas.includes(origem.replace(/\/+$/, ""))) {
          callback(null, true);
          return;
        }
        callback(new Error(`Origem nao permitida: ${origem}`));
      },
    }),
  );

  // Em desenvolvimento, uma linha por requisicao com status e tempo: ajuda a
  // ver o que o painel pediu quando algo nao aparece. Em producao o Render ja
  // registra o acesso, e repetir aqui so dobraria o log. Nos testes, silencio.
  if (env.NODE_ENV === "development") {
    app.use((req, res, next) => {
      const inicio = Date.now();
      res.on("finish", () => {
        console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - inicio}ms)`);
      });
      next();
    });
  }

  // O maior JSON legitimo e o login e a configuracao: poucas centenas de
  // bytes. Os eventos vao em multipart, com limites proprios. Aceitar 1 MB de
  // JSON so dava a quem quisesse um jeito barato de ocupar CPU parseando lixo.
  app.use(express.json({ limit: "100kb" }));

  // Só em desenvolvimento: em producao os arquivos moram no Supabase, porque
  // o disco do Render e apagado a cada deploy.
  if (usandoDiscoLocal) {
    // O nome de cada arquivo e unico e nunca reaproveitado (ver storage.ts),
    // entao o navegador pode guardar a foto por muito tempo sem risco de
    // mostrar uma versao velha.
    app.use("/uploads", express.static(PASTA_LOCAL, { maxAge: "30d", immutable: true }));
  }

  // O Render derruba a instancia gratuita depois de 15 minutos parada. Esta
  // rota e barata e serve para um monitor externo manter tudo acordado.
  app.get("/api/saude", (_req, res) => {
    res.json({ ok: true, ambiente: env.NODE_ENV, agora: new Date().toISOString() });
  });

  // Depois da rota de saude (o monitor de uptime nao gasta cota) e antes de
  // todo o resto. Fica depois do CORS para a resposta 429 tambem levar os
  // cabecalhos de CORS -- sem eles o navegador mostraria "erro de rede" em vez
  // da mensagem.
  app.use("/api", limitarRequisicoes({ maximo: 300, janelaEmMs: 60_000 }));

  app.use("/api/auth", rotasDeAutenticacao);
  app.use("/api/eventos", rotasDeEvento);
  app.use("/api/config", rotasDeConfig);

  app.use((_req, res) => {
    res.status(404).json({ erro: "Rota nao encontrada." });
  });

  // Tratador central. Tem que ter os quatro parametros: e a assinatura pela
  // qual o Express reconhece um middleware de erro.
  app.use(
    (
      erro: unknown,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      if (erro instanceof ErroHttp) {
        res.status(erro.status).json({ erro: erro.message });
        return;
      }

      // JSON malformado no corpo e erro de quem chamou, nao do servidor. Sem
      // isto ele caia no 500 generico e aparecia como "erro interno".
      if (
        typeof erro === "object" &&
        erro !== null &&
        (erro as { type?: string }).type === "entity.parse.failed"
      ) {
        res.status(400).json({ erro: "Corpo da requisicao invalido." });
        return;
      }

      if (
        typeof erro === "object" &&
        erro !== null &&
        (erro as { type?: string }).type === "entity.too.large"
      ) {
        res.status(413).json({ erro: "Dados grandes demais." });
        return;
      }

      if (erro instanceof multer.MulterError) {
        // O limite de tamanho do multer e o do video (o maior); imagem grande
        // demais e barrada depois, em `conferirTamanhos`, com mensagem propria.
        const mensagens: Partial<Record<string, string>> = {
          LIMIT_FILE_SIZE: "Arquivo muito grande. O video pode ter ate 60 MB e cada imagem ate 8 MB.",
          LIMIT_FILE_COUNT: "Arquivos demais. Envie a capa, um video e ate 6 fotos na galeria.",
          LIMIT_UNEXPECTED_FILE: "Envie no maximo uma capa, um video e 6 fotos na galeria.",
        };
        const mensagem = mensagens[erro.code] ?? "Nao foi possivel receber os arquivos.";
        res.status(400).json({ erro: mensagem });
        return;
      }

      if (erro instanceof Error && erro.message.startsWith("Origem nao permitida")) {
        res.status(403).json({ erro: erro.message });
        return;
      }

      // Erro inesperado: log completo no servidor, mensagem generica para
      // fora. Detalhe de stack em resposta HTTP e informacao de graca para
      // quem estiver sondando.
      console.error("Erro nao tratado:", erro);
      res.status(500).json({ erro: "Erro interno no servidor." });
    },
  );

  return app;
}
