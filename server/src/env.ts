import "dotenv/config";
import { z } from "zod";

/**
 * Validacao da configuracao NA PARTIDA do processo.
 *
 * O motivo e concreto: sem as chaves do Supabase, o servidor cairia para o
 * disco do Render -- que e efemero. O upload pareceria funcionar, o banco
 * guardaria a URL, e no deploy seguinte a imagem sumiria. Um erro assim so
 * aparece dias depois. Aqui ele aparece antes do processo subir.
 */

const esquema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3333),

  DATABASE_URL: z.string().min(1).optional(),

  // Nao existe tabela de usuarios: o painel tem um dono so, e uma tabela a
  // menos para manter.
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(1).optional(),
  AUTH_SECRET: z.string().min(16).optional(),

  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  SUPABASE_BUCKET: z.string().min(1).default("eventos"),

  // Lista fechada de origens permitidas, separadas por virgula.
  CORS_ORIGINS: z.string().optional(),

  // Endereco publico da propria API. So e usado pelo armazenamento local, para
  // montar a URL completa do arquivo.
  PUBLIC_URL: z.string().url().default("http://localhost:3333"),
});

const analise = esquema.safeParse(process.env);

if (!analise.success) {
  console.error("Configuracao invalida:");
  console.error(analise.error.flatten().fieldErrors);
  process.exit(1);
}

const bruto = analise.data;
const emProducao = bruto.NODE_ENV === "production";

/** Aborta a subida listando TUDO que falta, e nao so a primeira variavel. */
function exigirEmProducao(
  faltando: string[],
  titulo = "Faltam variaveis de ambiente obrigatorias em producao:",
) {
  if (faltando.length === 0) return;
  console.error(`${titulo}\n  - ${faltando.join("\n  - ")}`);
  process.exit(1);
}

if (emProducao) {
  exigirEmProducao(
    [
      !bruto.DATABASE_URL && "DATABASE_URL",
      !bruto.ADMIN_EMAIL && "ADMIN_EMAIL",
      !bruto.ADMIN_PASSWORD && "ADMIN_PASSWORD",
      !bruto.AUTH_SECRET && "AUTH_SECRET (minimo 16 caracteres)",
      !bruto.SUPABASE_URL && "SUPABASE_URL",
      !bruto.SUPABASE_SERVICE_ROLE_KEY && "SUPABASE_SERVICE_ROLE_KEY",
      !bruto.CORS_ORIGINS && "CORS_ORIGINS",
    ].filter((item): item is string => Boolean(item)),
  );
}

/**
 * Senha fraca em producao derruba a subida, do mesmo jeito que variavel
 * faltando. O painel fica exposto na internet com um unico usuario: com o
 * limite de tentativas (limitador.ts) uma senha de 10+ caracteres que nao seja
 * a do exemplo ja tira o ataque por adivinhacao do alcance pratico.
 */
const SENHAS_PROIBIDAS = ["admin123", "troque-esta-senha", "12345678910", "senha12345"];

if (emProducao && bruto.ADMIN_PASSWORD) {
  const senha = bruto.ADMIN_PASSWORD;
  const problemas = [
    senha.length < 10 && "ADMIN_PASSWORD precisa de pelo menos 10 caracteres",
    SENHAS_PROIBIDAS.includes(senha.toLowerCase()) &&
      "ADMIN_PASSWORD e uma senha de exemplo; troque por uma de verdade",
  ].filter((item): item is string => Boolean(item));
  exigirEmProducao(problemas, "Configuracao insegura em producao:");
}

// Em desenvolvimento os valores que faltam ganham padroes, com aviso na tela.
// Nunca em producao -- la o processo ja morreu acima.
function padraoDeDesenvolvimento(nome: string, valor: string) {
  console.warn(`[dev] ${nome} nao definida, usando valor padrao de desenvolvimento.`);
  return valor;
}

export const env = {
  NODE_ENV: bruto.NODE_ENV,
  emProducao,
  PORT: bruto.PORT,
  PUBLIC_URL: bruto.PUBLIC_URL.replace(/\/+$/, ""),

  ADMIN_EMAIL: bruto.ADMIN_EMAIL ?? padraoDeDesenvolvimento("ADMIN_EMAIL", "admin@paroquia.local"),
  ADMIN_PASSWORD: bruto.ADMIN_PASSWORD ?? padraoDeDesenvolvimento("ADMIN_PASSWORD", "admin123"),
  AUTH_SECRET:
    bruto.AUTH_SECRET ??
    padraoDeDesenvolvimento("AUTH_SECRET", "segredo-apenas-para-desenvolvimento-local"),

  supabase:
    bruto.SUPABASE_URL && bruto.SUPABASE_SERVICE_ROLE_KEY
      ? {
          url: bruto.SUPABASE_URL,
          // A service_role da acesso total ao banco. Ela so pode existir aqui
          // no servidor -- nunca no bundle do front.
          chave: bruto.SUPABASE_SERVICE_ROLE_KEY,
          bucket: bruto.SUPABASE_BUCKET,
        }
      : null,

  // Normalizamos a barra final: uma barra sobrando na variavel do Render
  // derruba o site inteiro por um caractere invisivel.
  origensPermitidas: (bruto.CORS_ORIGINS ?? "http://localhost:5173")
    .split(",")
    .map((origem) => origem.trim().replace(/\/+$/, ""))
    .filter(Boolean),
};

if (!env.supabase) {
  console.warn(
    "[dev] Supabase nao configurado: os arquivos vao para server/uploads/ no disco local.",
  );
}
