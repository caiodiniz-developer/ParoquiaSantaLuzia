import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { agoraEmSaoPaulo } from "../src/lib/agora.js";

describe("relogio de Sao Paulo", () => {
  it("converte UTC para o horario de Brasilia", () => {
    const r = agoraEmSaoPaulo(new Date("2026-12-13T22:30:00Z"));
    assert.deepEqual(r, { diaDaSemana: 0, minutos: 19 * 60 + 30, ano: 2026, mes: 12, dia: 13 });
  });

  it("meia-noite em SP ainda e o dia certo", () => {
    const r = agoraEmSaoPaulo(new Date("2026-10-24T03:00:00Z"));
    assert.equal(r.diaDaSemana, 6);
    assert.equal(r.minutos, 0);
    assert.equal(r.dia, 24);
  });
});
