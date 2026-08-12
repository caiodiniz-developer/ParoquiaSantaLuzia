import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { env } from "./env.js";
import { NaoAutorizado } from "./erros.js";

/**
 * Token assinado com HMAC, feito a mao -- nao e JWT de biblioteca.
 *
 * Para um painel com um dono so, JWT traria um parser de algoritmos que nao
 * usamos e a classe inteira de bugs de `alg: none`. O token guarda
 * {email, expiraEm} e a assinatura prova que foi este servidor que o emitiu.
 */

const DURACAO_EM_MS = 1000 * 60 * 60 * 12; // 12 horas

type Conteudo = { email: string; expiraEm: number };

function base64url(dados: Buffer | string) {
  return Buffer.from(dados).toString("base64url");
}

function assinar(corpo: string) {
  return crypto.createHmac("sha256", env.AUTH_SECRET).update(corpo).digest();
}

/**
 * Compara em tempo constante.
 *
 * Com `===` o tempo de resposta denuncia quantos bytes iniciais bateram, e da
 * para descobrir a assinatura byte a byte. `timingSafeEqual` sempre percorre
 * os dois buffers inteiros. Ele exige tamanhos iguais, entao comparamos o
 * tamanho antes -- essa comparacao nao vaza nada util.
 */
function iguaisEmTempoConstante(a: Buffer, b: Buffer) {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function gerarToken(email: string) {
  const conteudo: Conteudo = { email, expiraEm: Date.now() + DURACAO_EM_MS };
  const corpo = base64url(JSON.stringify(conteudo));
  return `${corpo}.${base64url(assinar(corpo))}`;
}

export function lerToken(token: string): Conteudo | null {
  const [corpo, assinaturaRecebida] = token.split(".");
  if (!corpo || !assinaturaRecebida) return null;

  const esperada = assinar(corpo);
  const recebida = Buffer.from(assinaturaRecebida, "base64url");
  if (!iguaisEmTempoConstante(esperada, recebida)) return null;

  try {
    const conteudo = JSON.parse(Buffer.from(corpo, "base64url").toString()) as Conteudo;
    if (typeof conteudo.expiraEm !== "number" || conteudo.expiraEm < Date.now()) return null;
    return conteudo;
  } catch {
    return null;
  }
}

/** Confere e-mail e senha do administrador, os dois em tempo constante. */
export function credenciaisValidas(email: string, senha: string) {
  const emailOk = iguaisEmTempoConstante(
    Buffer.from(email.trim().toLowerCase()),
    Buffer.from(env.ADMIN_EMAIL.trim().toLowerCase()),
  );
  const senhaOk = iguaisEmTempoConstante(Buffer.from(senha), Buffer.from(env.ADMIN_PASSWORD));
  // Sem curto-circuito: avaliar os dois sempre mantem o tempo estavel.
  return emailOk && senhaOk;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      admin?: Conteudo;
    }
  }
}

function extrairToken(req: Request) {
  const cabecalho = req.headers.authorization;
  if (!cabecalho?.startsWith("Bearer ")) return null;
  return cabecalho.slice("Bearer ".length).trim() || null;
}

/** Barra a requisicao se nao houver sessao valida. */
export function autenticar(req: Request, _res: Response, next: NextFunction) {
  const token = extrairToken(req);
  const conteudo = token ? lerToken(token) : null;
  if (!conteudo) return next(new NaoAutorizado());

  req.admin = conteudo;
  next();
}

/**
 * Marca a requisicao como autenticada quando houver token valido, mas deixa
 * passar quem nao tem. E o que permite uma unica rota de listagem servir o
 * site publico (so eventos ativos) e o painel (todos).
 */
export function autenticacaoOpcional(req: Request, _res: Response, next: NextFunction) {
  const token = extrairToken(req);
  const conteudo = token ? lerToken(token) : null;
  if (conteudo) req.admin = conteudo;
  next();
}
