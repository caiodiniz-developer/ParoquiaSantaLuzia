import { after, describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { conteudoConfereComTipo } from "../src/assinaturas.js";

/** Grava os bytes num temporario e confere contra o tipo declarado. */
const criados: string[] = [];
async function confere(bytes: number[] | string, tipo: string) {
  const arquivo = path.join(os.tmpdir(), `assinatura-${criados.length}-${Date.now()}`);
  fs.writeFileSync(arquivo, typeof bytes === "string" ? Buffer.from(bytes, "latin1") : Buffer.from(bytes));
  criados.push(arquivo);
  return conteudoConfereComTipo(arquivo, tipo);
}

describe("assinatura binaria dos uploads", () => {
  after(() => criados.forEach((arquivo) => fs.rmSync(arquivo, { force: true })));

  it("reconhece JPEG, PNG e GIF", async () => {
    assert.equal(await confere([0xff, 0xd8, 0xff, 0xe0, 0, 0], "image/jpeg"), true);
    assert.equal(await confere([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], "image/png"), true);
    assert.equal(await confere("GIF89a....", "image/gif"), true);
  });

  it("reconhece WEBP e AVIF", async () => {
    assert.equal(await confere("RIFF\x00\x00\x00\x00WEBPVP8 ", "image/webp"), true);
    assert.equal(await confere("\x00\x00\x00\x1cftypavif\x00\x00", "image/avif"), true);
  });

  it("reconhece MP4 e WEBM", async () => {
    assert.equal(await confere("\x00\x00\x00\x18ftypmp42\x00\x00", "video/mp4"), true);
    assert.equal(await confere([0x1a, 0x45, 0xdf, 0xa3, 0, 0], "video/webm"), true);
  });

  it("recusa conteudo que nao bate com o tipo", async () => {
    assert.equal(await confere("<html><script>", "image/png"), false);
    assert.equal(await confere([0x89, 0x50, 0x4e, 0x47], "image/jpeg"), false);
    assert.equal(await confere("MZ\x90\x00", "video/mp4"), false);
  });

  it("recusa tipo fora da lista e arquivo vazio", async () => {
    assert.equal(await confere("qualquer", "application/pdf"), false);
    assert.equal(await confere([], "image/png"), false);
  });
});
