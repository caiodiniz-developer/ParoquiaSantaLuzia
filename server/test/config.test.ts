import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { desconectar, subirServidor } from "./apoio.js";
import { prisma } from "../src/prisma.js";

describe("configuracoes", () => {
  let api: Awaited<ReturnType<typeof subirServidor>>;
  let token: string;
  let anteriores: { chave: string; valor: string }[] = [];

  before(async () => {
    api = await subirServidor();
    token = await api.entrar();
    // Guarda o que ja estava salvo no banco de desenvolvimento para devolver
    // no fim: o teste nao pode apagar o ajuste de quem esta usando o painel.
    anteriores = await prisma.setting.findMany({ select: { chave: true, valor: true } });
  });

  after(async () => {
    await prisma.setting.deleteMany();
    for (const linha of anteriores) await prisma.setting.create({ data: linha });
    await api.fechar();
    await desconectar();
  });

  it("leitura e publica e traz os padroes", async () => {
    await prisma.setting.deleteMany();
    const r = await api.chamar("GET", "/config");
    assert.equal(r.status, 200);
    assert.equal(r.json.eventosNaHome, 6);
  });

  it("salvar exige sessao", async () => {
    const r = await api.chamar("PUT", "/config", { corpo: { eventosNaHome: 3 } });
    assert.equal(r.status, 401);
  });

  it("salva e devolve tambem o que ja estava salvo", async () => {
    await api.chamar("PUT", "/config", { token, corpo: { mostrarRealizados: true } });
    const r = await api.chamar("PUT", "/config", { token, corpo: { eventosNaHome: 3 } });
    assert.equal(r.status, 200);
    assert.equal(r.json.eventosNaHome, 3);
    assert.equal(r.json.mostrarRealizados, true);
  });

  it("recusa valor fora da faixa", async () => {
    const r = await api.chamar("PUT", "/config", { token, corpo: { eventosNaHome: 99 } });
    assert.equal(r.status, 400);
  });

  it("ignora chave antiga que nao existe mais", async () => {
    await prisma.setting.create({ data: { chave: "ajusteAntigo", valor: "true" } });
    const r = await api.chamar("GET", "/config");
    assert.equal("ajusteAntigo" in r.json, false);
  });
});
