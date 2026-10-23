import { Router, type Request } from "express";
import { credenciaisValidas, gerarToken, autenticar } from "../auth.js";
import { assincrono } from "../assincrono.js";
import { DadosInvalidos, NaoAutorizado } from "../erros.js";
import { esquemaDeLogin } from "../evento.schema.js";
import { barrarSeBloqueado, registrarFalha, registrarSucesso } from "../limitador.js";
import { env } from "../env.js";

/**
 * Trilha de auditoria no log do Render: toda tentativa de login, com IP. Se
 * alguem estiver tentando adivinhar a senha, aparece aqui -- e o e-mail
 * tentado ajuda a separar engano do padre de ataque. A senha nunca e
 * registrada. Nos testes fica em silencio.
 */
function registrarNoLog(evento: "login-ok" | "login-falhou", req: Request, email: string) {
  if (env.NODE_ENV === "test") return;
  const linha = `[auth] ${evento} ip=${req.ip ?? "?"} email=${JSON.stringify(email.slice(0, 120))}`;
  if (evento === "login-falhou") console.warn(linha);
  else console.info(linha);
}

export const rotasDeAutenticacao = Router();

/**
 * Pausa em toda senha errada. Para quem errou digitando, 0,4s nao se nota;
 * para um script testando senhas, junto com o limite de 8 por IP, e mais um
 * freio. Fixa, e nao aleatoria: o tempo da resposta continua sem dizer nada.
 */
const PAUSA_APOS_FALHA_EM_MS = 400;
const esperar = (ms: number) => new Promise((resolver) => setTimeout(resolver, ms));

rotasDeAutenticacao.post(
  "/login",
  barrarSeBloqueado,
  assincrono(async (req, res) => {
    const analise = esquemaDeLogin.safeParse(req.body);
    if (!analise.success) throw new DadosInvalidos("Informe e-mail e senha.");

    const { email, senha } = analise.data;
    if (!credenciaisValidas(email, senha)) {
      registrarFalha(req);
      registrarNoLog("login-falhou", req, email);
      await esperar(PAUSA_APOS_FALHA_EM_MS);
      // Mensagem unica para e-mail errado e senha errada: dizer qual dos dois
      // falhou entrega a quem tenta invadir que o e-mail existe.
      throw new NaoAutorizado("E-mail ou senha incorretos.");
    }

    registrarSucesso(req);
    registrarNoLog("login-ok", req, email);
    // `expiraEm` deixa o painel sair sozinho na hora certa, em vez de a pessoa
    // descobrir que a sessao acabou so ao tentar salvar um evento.
    const { token, expiraEm } = gerarToken(email);
    res.json({ token, email, expiraEm });
  }),
);

/** O painel chama isto ao abrir, para saber se o token guardado ainda vale. */
rotasDeAutenticacao.get("/eu", autenticar, (req, res) => {
  res.json({ email: req.admin!.email, expiraEm: req.admin!.expiraEm });
});
