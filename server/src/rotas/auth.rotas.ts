import { Router } from "express";
import { credenciaisValidas, gerarToken, autenticar } from "../auth.js";
import { assincrono } from "../assincrono.js";
import { DadosInvalidos, NaoAutorizado } from "../erros.js";
import { esquemaDeLogin } from "../evento.schema.js";

export const rotasDeAutenticacao = Router();

rotasDeAutenticacao.post(
  "/login",
  assincrono(async (req, res) => {
    const analise = esquemaDeLogin.safeParse(req.body);
    if (!analise.success) throw new DadosInvalidos("Informe e-mail e senha.");

    const { email, senha } = analise.data;
    if (!credenciaisValidas(email, senha)) {
      // Mensagem unica para e-mail errado e senha errada: dizer qual dos dois
      // falhou entrega a quem tenta invadir que o e-mail existe.
      throw new NaoAutorizado("E-mail ou senha incorretos.");
    }

    res.json({ token: gerarToken(email), email });
  }),
);

/** O painel chama isto ao abrir, para saber se o token guardado ainda vale. */
rotasDeAutenticacao.get("/eu", autenticar, (req, res) => {
  res.json({ email: req.admin!.email });
});
