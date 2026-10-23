// Contagem para a festa de Santa Luzia, 13 de dezembro, no calendario de
// Sao Paulo (recebe o resultado de agoraEmSaoPaulo).

const MES_DA_FESTA = 12;
const DIA_DA_FESTA = 13;
const UM_DIA_EM_MS = 24 * 60 * 60 * 1000;

/** Quantos dias faltam para o proximo 13 de dezembro (0 no proprio dia). */
export function diasAteAFesta({ ano, mes, dia }) {
  // Datas ao meio-dia UTC: a conta fica imune a horario de verao e fuso.
  const hoje = Date.UTC(ano, mes - 1, dia, 12);
  let festa = Date.UTC(ano, MES_DA_FESTA - 1, DIA_DA_FESTA, 12);
  if (festa < hoje) festa = Date.UTC(ano + 1, MES_DA_FESTA - 1, DIA_DA_FESTA, 12);
  return Math.round((festa - hoje) / UM_DIA_EM_MS);
}

export function textoDaContagem(dias) {
  if (dias === 0) return "Hoje é dia de Santa Luzia!";
  if (dias === 1) return "Falta 1 dia para a festa";
  return `Faltam ${dias} dias para a festa`;
}
