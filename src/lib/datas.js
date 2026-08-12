// A API devolve datas em ISO (UTC). Todas as formatacoes fixam o fuso de
// Sao Paulo -- sem isso, um evento as 19h30 aparece como 22h30 para quem
// abrir o site com o relogio do computador em outro fuso.
const FUSO = "America/Sao_Paulo";

const DATA_LONGA = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  timeZone: FUSO,
});

const DATA_CURTA = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  timeZone: FUSO,
});

const HORA = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: FUSO,
});

export function dataLonga(iso) {
  if (!iso) return "";
  return DATA_LONGA.format(new Date(iso));
}

export function dataCurta(iso) {
  if (!iso) return "";
  return DATA_CURTA.format(new Date(iso));
}

export function hora(iso) {
  if (!iso) return "";
  return HORA.format(new Date(iso));
}

/** "sábado, 13 de dezembro • 19h30" — o formato usado nos cards e no modal. */
export function dataComHora(iso) {
  if (!iso) return "";
  return `${dataLonga(iso)} • ${hora(iso).replace(":", "h")}`;
}

/**
 * Converte ISO para o formato que o <input type="datetime-local"> aceita
 * (YYYY-MM-DDTHH:mm), ja no horario de Sao Paulo.
 *
 * `toISOString().slice(0,16)` seria mais curto e esta errado: devolve UTC, e o
 * padre veria 22h30 no formulario de um evento que ele marcou para 19h30.
 */
export function paraCampoDataHora(iso) {
  if (!iso) return "";
  const partes = new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: FUSO,
    hour12: false,
  }).format(new Date(iso));
  // O locale sueco ja entrega "2026-08-12 19:30"; so trocamos o espaco.
  return partes.replace(" ", "T");
}
