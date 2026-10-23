import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { diasAteAFesta, textoDaContagem } from "../src/lib/festa.js";

describe("contagem para a festa de Santa Luzia", () => {
  it("conta os dias ate 13 de dezembro", () => {
    assert.equal(diasAteAFesta({ ano: 2026, mes: 12, dia: 12 }), 1);
    assert.equal(diasAteAFesta({ ano: 2026, mes: 10, dia: 23 }), 51);
  });

  it("e zero no proprio dia", () => {
    assert.equal(diasAteAFesta({ ano: 2026, mes: 12, dia: 13 }), 0);
    assert.equal(textoDaContagem(0), "Hoje é dia de Santa Luzia!");
  });

  it("depois do dia 13 conta para a festa do ano seguinte", () => {
    assert.equal(diasAteAFesta({ ano: 2026, mes: 12, dia: 14 }), 364);
  });

  it("singular e plural", () => {
    assert.equal(textoDaContagem(1), "Falta 1 dia para a festa");
    assert.equal(textoDaContagem(2), "Faltam 2 dias para a festa");
  });
});
