import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { env } from "./env.js";

/**
 * Guarda os arquivos enviados e devolve a URL PUBLICA COMPLETA.
 *
 * Devolver a URL completa (e nao so o nome do arquivo) e deliberado: guardar
 * so o nome obrigaria o front a remontar o endereco, e qualquer mudanca de
 * bucket ou de dominio quebraria toda imagem ja cadastrada.
 *
 * Sao dois drivers com a mesma assinatura -- Supabase em producao, disco local
 * em desenvolvimento -- escolhidos pela configuracao, nao por `if` espalhado
 * pelo codigo.
 */

export const PASTA_LOCAL = path.resolve(process.cwd(), "uploads");

/**
 * Extensao a partir do TIPO do arquivo, que o fileFilter das rotas ja conferiu
 * contra a lista de aceitos -- e nunca a partir do nome enviado.
 *
 * Com a extensao do nome, um "foto.html" mandado como image/png seria gravado
 * como .html, e o servidor de arquivos o entregaria como pagina da web, no
 * dominio da API. Aqui um tipo inesperado vira .bin, que nenhum navegador
 * executa.
 */
const EXTENSOES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "image/gif": ".gif",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
};

/** Nome unico e sem acento/espaco, com a extensao certa para o tipo. */
function nomeDeArquivo(tipo: string) {
  const extensao = EXTENSOES[tipo] ?? ".bin";
  return `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${extensao}`;
}

type ArquivoRecebido = {
  path: string;
  originalname: string;
  mimetype: string;
};

interface Armazenamento {
  salvar(arquivo: ArquivoRecebido): Promise<string>;
  remover(url: string): Promise<void>;
}

const armazenamentoLocal: Armazenamento = {
  async salvar(arquivo) {
    await fs.mkdir(PASTA_LOCAL, { recursive: true });
    const nome = nomeDeArquivo(arquivo.mimetype);
    // rename falha entre discos diferentes; copy+unlink funciona sempre.
    await fs.copyFile(arquivo.path, path.join(PASTA_LOCAL, nome));
    await fs.unlink(arquivo.path).catch(() => {});
    return `${env.PUBLIC_URL}/uploads/${nome}`;
  },

  async remover(url) {
    const nome = path.basename(new URL(url).pathname);
    await fs.unlink(path.join(PASTA_LOCAL, nome)).catch(() => {});
  },
};

function criarArmazenamentoSupabase(config: NonNullable<typeof env.supabase>): Armazenamento {
  const cliente = createClient(config.url, config.chave, {
    auth: { persistSession: false },
  });

  return {
    async salvar(arquivo) {
      const nome = nomeDeArquivo(arquivo.mimetype);
      // O multer gravou em disco temporario; lemos so na hora de subir e
      // liberamos em seguida.
      const conteudo = await fs.readFile(arquivo.path);

      const { error } = await cliente.storage
        .from(config.bucket)
        .upload(nome, conteudo, { contentType: arquivo.mimetype, upsert: false });

      await fs.unlink(arquivo.path).catch(() => {});

      if (error) throw new Error(`Falha ao enviar o arquivo: ${error.message}`);

      const { data } = cliente.storage.from(config.bucket).getPublicUrl(nome);
      return data.publicUrl;
    },

    async remover(url) {
      const nome = path.basename(new URL(url).pathname);
      // Se falhar, deixamos o arquivo orfao no bucket em vez de impedir o
      // usuario de apagar o evento -- lixo custa menos que uma tela travada.
      const { error } = await cliente.storage.from(config.bucket).remove([nome]);
      if (error) console.warn(`Nao foi possivel remover ${nome} do bucket:`, error.message);
    },
  };
}

export const armazenamento: Armazenamento = env.supabase
  ? criarArmazenamentoSupabase(env.supabase)
  : armazenamentoLocal;

export const usandoDiscoLocal = !env.supabase;
