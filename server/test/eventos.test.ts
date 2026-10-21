import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { desconectar, formularioDeEvento, imagem, subirServidor } from "./apoio.js";
import { PASTA_LOCAL } from "../src/storage.js";

describe("eventos", () => {
  let api: Awaited<ReturnType<typeof subirServidor>>;
  let token: string;
  const criados: string[] = [];

  async function criar(campos: Record<string, string> = {}, extra?: (form: FormData) => void) {
    const form = formularioDeEvento(campos);
    extra?.(form);
    const r = await api.chamar("POST", "/eventos", { token, form });
    if (r.status === 201) criados.push(r.json.id);
    return r;
  }

  before(async () => {
    api = await subirServidor();
    token = await api.entrar();
  });

  after(async () => {
    // Limpa o que os testes deixaram, inclusive os arquivos no disco.
    for (const id of criados) await api.chamar("DELETE", `/eventos/${id}`, { token });
    await api.fechar();
    await desconectar();
  });

  it("cria evento com capa e carimba o fuso de Brasilia", async () => {
    const r = await criar({ comecaEm: "2099-12-13T19:30" });
    assert.equal(r.status, 201);
    assert.equal(r.json.comecaEm, "2099-12-13T22:30:00.000Z");
    assert.match(r.json.coverUrl, /\/uploads\//);
  });

  it("exige sessao para criar", async () => {
    const r = await api.chamar("POST", "/eventos", { form: formularioDeEvento() });
    assert.equal(r.status, 401);
  });

  it("exige capa", async () => {
    const form = new FormData();
    form.append("titulo", "Sem capa");
    form.append("comecaEm", "2099-01-01T10:00");
    const r = await api.chamar("POST", "/eventos", { token, form });
    assert.equal(r.status, 400);
  });

  it("recusa termino antes do inicio", async () => {
    const r = await criar({ comecaEm: "2099-05-10T10:00", terminaEm: "2099-05-09T10:00" });
    assert.equal(r.status, 400);
  });

  it("guarda o link do Instagram a partir do @", async () => {
    const r = await criar({ instagramUrl: "@santaluzia.paroquia" });
    assert.equal(r.status, 201);
    assert.equal(r.json.instagramUrl, "https://www.instagram.com/santaluzia.paroquia/");
  });

  it("recusa link que nao e do Instagram", async () => {
    const r = await criar({ instagramUrl: "https://golpe.example/instagram" });
    assert.equal(r.status, 400);
  });

  it("apagar o link do Instagram na edicao grava null", async () => {
    const criado = await criar({ instagramUrl: "https://www.instagram.com/p/ABC/" });
    const form = new FormData();
    form.append("instagramUrl", "");
    const r = await api.chamar("PATCH", `/eventos/${criado.json.id}`, { token, form });
    assert.equal(r.status, 200);
    assert.equal(r.json.instagramUrl, null);
  });

  it("recusa link de inscricao com javascript:", async () => {
    const r = await criar({ inscricaoUrl: "javascript:alert(1)" });
    assert.equal(r.status, 400);
  });

  it("aceita link de inscricao https", async () => {
    const r = await criar({ inscricaoUrl: "https://forms.gle/abc" });
    assert.equal(r.status, 201);
    assert.equal(r.json.inscricaoUrl, "https://forms.gle/abc");
  });

  it("evento oculto some do site e do detalhe publico, mas nao do painel", async () => {
    const criado = await criar();
    const id = criado.json.id;
    await api.chamar("PATCH", `/eventos/${id}/ativo`, { token, corpo: { ativo: false } });

    const publico = await api.chamar("GET", "/eventos?escopo=todos");
    assert.ok(!publico.json.some((e: { id: string }) => e.id === id));
    assert.equal((await api.chamar("GET", `/eventos/${id}`)).status, 404);

    const painel = await api.chamar("GET", "/eventos?escopo=todos&incluirInativos=true", { token });
    assert.ok(painel.json.some((e: { id: string }) => e.id === id));
    assert.equal((await api.chamar("GET", `/eventos/${id}`, { token })).status, 200);
  });

  it("pedir incluirInativos sem sessao nao revela nada", async () => {
    const criado = await criar({ ativo: "false" });
    const r = await api.chamar("GET", "/eventos?escopo=todos&incluirInativos=true");
    assert.ok(!r.json.some((e: { id: string }) => e.id === criado.json.id));
  });

  it("evento passado sai de proximos e vai para realizados", async () => {
    const criado = await criar({ comecaEm: "2001-01-01T10:00" });
    const proximos = await api.chamar("GET", "/eventos?escopo=proximos");
    const realizados = await api.chamar("GET", "/eventos?escopo=realizados");
    assert.ok(!proximos.json.some((e: { id: string }) => e.id === criado.json.id));
    assert.ok(realizados.json.some((e: { id: string }) => e.id === criado.json.id));
  });

  it("galeria mantida ignora URLs que nao eram do evento", async () => {
    const criado = await criar({}, (form) => {
      const { blob } = imagem();
      form.append("galeria", blob, "g1.png");
    });
    const original = criado.json.galeria[0];
    const form = new FormData();
    form.append("galeriaMantida", JSON.stringify([original, "https://golpe.example/x.png"]));
    const r = await api.chamar("PATCH", `/eventos/${criado.json.id}`, { token, form });
    assert.equal(r.status, 200);
    assert.deepEqual(r.json.galeria, [original]);
  });

  it("recusa galeria com mais de 6 fotos na edicao", async () => {
    const criado = await criar({}, (form) => {
      for (let i = 0; i < 6; i++) form.append("galeria", imagem().blob, `g${i}.png`);
    });
    const form = new FormData();
    form.append("galeria", imagem().blob, "a-mais.png");
    const r = await api.chamar("PATCH", `/eventos/${criado.json.id}`, { token, form });
    assert.equal(r.status, 400);
  });

  it("editar evento inexistente responde 404 sem deixar arquivo no disco", async () => {
    const antes = fs.existsSync(PASTA_LOCAL) ? fs.readdirSync(PASTA_LOCAL).length : 0;
    const form = new FormData();
    form.append("capa", imagem().blob, "capa.png");
    const r = await api.chamar("PATCH", "/eventos/nao-existe", { token, form });
    assert.equal(r.status, 404);
    const depois = fs.existsSync(PASTA_LOCAL) ? fs.readdirSync(PASTA_LOCAL).length : 0;
    assert.equal(depois, antes);
  });

  it("apagar remove o evento e os arquivos", async () => {
    const criado = await criar();
    const arquivo = path.join(PASTA_LOCAL, path.basename(new URL(criado.json.coverUrl).pathname));
    assert.ok(fs.existsSync(arquivo));

    const r = await api.chamar("DELETE", `/eventos/${criado.json.id}`, { token });
    assert.equal(r.status, 204);
    assert.equal((await api.chamar("GET", `/eventos/${criado.json.id}`, { token })).status, 404);
    assert.ok(!fs.existsSync(arquivo));
  });

  it("recusa arquivo que nao e imagem na capa", async () => {
    const form = formularioDeEvento();
    form.delete("capa");
    form.append("capa", new Blob(["<html>"], { type: "text/html" }), "x.html");
    const r = await api.chamar("POST", "/eventos", { token, form });
    assert.equal(r.status, 400);
  });
});
