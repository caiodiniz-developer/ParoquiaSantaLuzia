import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { codigoPix, crc16 } from "../src/lib/pix.js";

describe("PIX Copia e Cola", () => {
  it("CRC16 bate com o exemplo oficial do manual do Banco Central", () => {
    const exemplo =
      "00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-426655440000" +
      "5204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***6304";
    assert.equal(crc16(exemplo), "1D3D");
  });

  it("monta o codigo da paroquia com chave, nome e cidade sem acento", () => {
    const codigo = codigoPix({ chave: "44588960013330", nome: "Paróquia Santa Luzia", cidade: "Campinas" });
    assert.ok(codigo.startsWith("000201"));
    assert.ok(codigo.includes("0014br.gov.bcb.pix011444588960013330"));
    assert.ok(codigo.includes("5920PAROQUIA SANTA LUZIA"));
    assert.ok(codigo.includes("6008CAMPINAS"));
  });

  it("termina com o CRC do proprio codigo", () => {
    const codigo = codigoPix({ chave: "44588960013330", nome: "Paroquia", cidade: "Campinas" });
    const semCrc = codigo.slice(0, -4);
    assert.ok(semCrc.endsWith("6304"));
    assert.equal(codigo.slice(-4), crc16(semCrc));
  });

  it("corta nome e cidade no tamanho maximo do padrao", () => {
    const codigo = codigoPix({
      chave: "x",
      nome: "Um nome de paroquia comprido demais para o padrao",
      cidade: "Uma cidade com nome enorme",
    });
    assert.ok(codigo.includes("5925UM NOME DE PAROQUIA COMPR"));
    // 15 caracteres terminariam num espaco: ele e aparado e sobram 14.
    assert.ok(codigo.includes("6014UMA CIDADE COM62"));
  });
});
