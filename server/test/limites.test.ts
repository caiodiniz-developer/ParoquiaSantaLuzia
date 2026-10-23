import { after, before, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { desconectar, subirServidor } from "./apoio.js";
import { zerarLimitador } from "../src/limitador.js";

describe("limites de requisicao", () => {
  let api: Awaited<ReturnType<typeof subirServidor>>;

  before(async () => {
    api = await subirServidor();
  });
  after(async () => {
    zerarLimitador();
    await api.fechar();
    await desconectar();
  });
  beforeEach(() => zerarLimitador());

  it("escrita sem sessao para em 429 depois de 60 tentativas por minuto", async () => {
    const status: number[] = [];
    for (let i = 0; i < 61; i++) {
      status.push((await api.chamar("DELETE", "/eventos/qualquer")).status);
    }
    assert.ok(status.slice(0, 60).every((s) => s === 401));
    assert.equal(status[60], 429);
  });

  it("a resposta 429 diz quando tentar de novo", async () => {
    for (let i = 0; i < 60; i++) await api.chamar("DELETE", "/eventos/qualquer");
    const r = await fetch(`${api.base}/eventos/qualquer`, { method: "DELETE" });
    assert.equal(r.status, 429);
    assert.ok(Number(r.headers.get("retry-after")) > 0);
  });

  it("a rota de saude nao gasta a cota", async () => {
    for (let i = 0; i < 310; i++) await api.chamar("GET", "/saude");
    assert.equal((await api.chamar("GET", "/eventos?escopo=proximos")).status, 200);
  });

  it("leitura para em 429 depois de 300 por minuto", async () => {
    let ultimo = 0;
    for (let i = 0; i < 301; i++) ultimo = (await api.chamar("GET", "/config")).status;
    assert.equal(ultimo, 429);
  });
});
