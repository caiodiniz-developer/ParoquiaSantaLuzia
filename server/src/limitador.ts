import type { NextFunction, Request, Response } from "express";
import { ErroHttp } from "./erros.js";

/**
 * Limite de tentativas de login por IP, em memoria.
 *
 * Sem isto, a senha do painel pode ser testada sem parar: um script tenta
 * milhares de senhas por hora contra /api/auth/login. Com o limite, quem erra
 * MAXIMO_DE_FALHAS vezes seguidas espera JANELA_EM_MS para tentar de novo.
 *
 * Em memoria e nao no banco porque a API roda numa instancia so. Se um dia
 * houver mais de uma, cada uma tera o seu contador -- o limite fica mais
 * frouxo, mas nunca deixa de existir.
 *
 * So as FALHAS contam: quem acerta zera o contador, e o padre que errou a
 * senha duas vezes e acertou na terceira nao fica preso.
 */

const MAXIMO_DE_FALHAS = 8;
const JANELA_EM_MS = 15 * 60 * 1000;

type Registro = { falhas: number; liberaEm: number };

const registros = new Map<string, Registro>();

function chaveDe(req: Request) {
  return req.ip ?? "desconhecido";
}

/** Limpa registros vencidos, para o mapa nao crescer para sempre. */
function varrer(agora: number) {
  for (const [chave, registro] of registros) {
    if (registro.liberaEm <= agora) registros.delete(chave);
  }
}

export class MuitasTentativas extends ErroHttp {
  constructor(minutos: number) {
    super(
      429,
      `Muitas tentativas de login. Espere ${minutos} minuto${minutos === 1 ? "" : "s"} e tente de novo.`,
    );
  }
}

/** Barra a requisicao enquanto o IP estiver bloqueado. */
export function barrarSeBloqueado(req: Request, res: Response, next: NextFunction) {
  const agora = Date.now();
  if (registros.size > 1000) varrer(agora);

  const registro = registros.get(chaveDe(req));
  if (registro && registro.falhas >= MAXIMO_DE_FALHAS && registro.liberaEm > agora) {
    const segundos = Math.ceil((registro.liberaEm - agora) / 1000);
    res.setHeader("Retry-After", String(segundos));
    next(new MuitasTentativas(Math.ceil(segundos / 60)));
    return;
  }
  next();
}

export function registrarFalha(req: Request) {
  const agora = Date.now();
  const chave = chaveDe(req);
  const anterior = registros.get(chave);
  const vigente = anterior && anterior.liberaEm > agora ? anterior : { falhas: 0, liberaEm: 0 };
  registros.set(chave, { falhas: vigente.falhas + 1, liberaEm: agora + JANELA_EM_MS });
}

export function registrarSucesso(req: Request) {
  registros.delete(chaveDe(req));
}

/**
 * Limite geral de requisicoes por IP, numa janela fixa.
 *
 * Diferente do de login (que conta so FALHAS), este conta tudo. Os numeros
 * sao folgados para quem usa o site de verdade -- um visitante faz meia duzia
 * de chamadas por pagina -- e apertados para um robo martelando a API, que no
 * plano gratuito do Render tem pouca CPU e um disco temporario pequeno para os
 * uploads.
 */
type Janela = { contagem: number; terminaEm: number };
const janelasPorLimite: Map<string, Janela>[] = [];

export function limitarRequisicoes({
  maximo,
  janelaEmMs,
  mensagem = "Muitas requisicoes. Espere um minuto e tente de novo.",
}: {
  maximo: number;
  janelaEmMs: number;
  mensagem?: string;
}) {
  const janelas = new Map<string, Janela>();
  janelasPorLimite.push(janelas);

  return function (req: Request, res: Response, next: NextFunction) {
    const agora = Date.now();
    if (janelas.size > 5000) {
      for (const [chave, janela] of janelas) if (janela.terminaEm <= agora) janelas.delete(chave);
    }

    const chave = chaveDe(req);
    const atual = janelas.get(chave);
    const janela =
      atual && atual.terminaEm > agora ? atual : { contagem: 0, terminaEm: agora + janelaEmMs };
    janela.contagem += 1;
    janelas.set(chave, janela);

    if (janela.contagem > maximo) {
      res.setHeader("Retry-After", String(Math.ceil((janela.terminaEm - agora) / 1000)));
      next(new ErroHttp(429, mensagem));
      return;
    }
    next();
  };
}

/** So para os testes: cada teste comeca com os contadores zerados. */
export function zerarLimitador() {
  registros.clear();
  janelasPorLimite.forEach((janelas) => janelas.clear());
}
