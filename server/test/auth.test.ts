import { after, before, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { desconectar, subirServidor } from "./apoio.js";
import { zerarLimitador } from "../src/limitador.js";
import { env } from "../src/env.js";

describe("autenticacao", () => {
  let api: Awaited<ReturnType<typeof subirServidor>>;

  before(async () => {
    api = await subirServidor();
  });
  after(async () => {
    await api.fechar();
    await desconectar();
  });
  beforeEach(() => zerarLimitador());

  it("entra com as credenciais certas e devolve quando expira", async () => {
    const token = await api.entrar();
    const eu = await api.chamar("GET", "/auth/eu", { token });
    assert.equal(eu.status, 200);
    assert.ok(eu.json.expiraEm > Date.now());
  });

  it("recusa senha errada com a mesma mensagem de e-mail errado", async () => {
    const senha = await api.chamar("POST", "/auth/login", {
      corpo: { email: "admin@paroquia.local", senha: "errada" },
    });
    const email = await api.chamar("POST", "/auth/login", {
      corpo: { email: "outro@paroquia.local", senha: "errada" },
    });
    assert.equal(senha.status, 401);
    assert.equal(email.status, 401);
    assert.equal(senha.json.erro, email.json.erro);
  });

  it("bloqueia o IP depois de 8 senhas erradas", async () => {
    const status: number[] = [];
    for (let i = 0; i < 9; i++) {
      const r = await api.chamar("POST", "/auth/login", {
        corpo: { email: "admin@paroquia.local", senha: "errada" },
      });
      status.push(r.status);
    }
    assert.deepEqual(status.slice(0, 8), Array(8).fill(401));
    assert.equal(status[8], 429);
  });

  it("acertar a senha zera o contador de falhas", async () => {
    for (let i = 0; i < 7; i++) {
      await api.chamar("POST", "/auth/login", { corpo: { email: "a@b.co", senha: "x" } });
    }
    await api.entrar();
    const depois = await api.chamar("POST", "/auth/login", { corpo: { email: "a@b.co", senha: "x" } });
    assert.equal(depois.status, 401);
  });

  it("recusa token adulterado", async () => {
    const token = await api.entrar();
    const adulterado = token.slice(0, -2) + (token.endsWith("A") ? "BB" : "AA");
    const r = await api.chamar("GET", "/auth/eu", { token: adulterado });
    assert.equal(r.status, 401);
  });

  it("trocar a senha do admin derruba as sessoes abertas", async () => {
    const token = await api.entrar();
    const senhaOriginal = env.ADMIN_PASSWORD;
    try {
      env.ADMIN_PASSWORD = senhaOriginal + "-trocada";
      const r = await api.chamar("GET", "/auth/eu", { token });
      assert.equal(r.status, 401);
    } finally {
      env.ADMIN_PASSWORD = senhaOriginal;
    }
    // Com a senha de volta, o mesmo token volta a valer: a assinatura depende
    // so da configuracao atual, nada fica guardado.
    assert.equal((await api.chamar("GET", "/auth/eu", { token })).status, 200);
  });

  it("JSON malformado responde 400 e nao 500", async () => {
    const r = await fetch(`${api.base}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{nao e json",
    });
    assert.equal(r.status, 400);
  });
});
