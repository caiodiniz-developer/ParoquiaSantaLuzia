import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { statusDaSecretaria } from "../src/lib/secretaria.js";

const em = (diaDaSemana, hora, minuto = 0) =>
  statusDaSecretaria({ diaDaSemana, minutos: hora * 60 + minuto }).texto;

describe("secretaria aberta agora", () => {
  it("segunda: abre so a tarde", () => {
    assert.equal(em(1, 10), "Fechada · abre hoje às 13h");
    assert.equal(em(1, 13), "Aberta agora · fecha às 18h");
  });

  it("fecha no minuto exato e respeita o almoco", () => {
    assert.equal(em(2, 11, 59), "Aberta agora · fecha às 12h");
    assert.equal(em(2, 12), "Fechada · abre hoje às 13h");
    assert.equal(em(2, 18), "Fechada · abre amanhã às 9h");
  });

  it("sabado de manha e depois so na segunda", () => {
    assert.equal(em(6, 8), "Aberta agora · fecha às 12h");
    assert.equal(em(6, 12), "Fechada · abre segunda às 13h");
  });

  it("domingo fechada, abre amanha a tarde", () => {
    assert.equal(em(0, 10), "Fechada · abre amanhã às 13h");
  });
});
