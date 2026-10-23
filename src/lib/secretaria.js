// Horario de atendimento da Secretaria Paroquial, em minutos desde a
// meia-noite. Precisa bater com o texto da caixa "Secretaria Paroquial" em
// Comunidades.jsx: mudou um, mude o outro.
//
// 0 = domingo ... 6 = sabado. Cada dia tem uma lista de turnos [abre, fecha].
const h = (hora, minuto = 0) => hora * 60 + minuto;

export const TURNOS_DA_SECRETARIA = {
  0: [],
  1: [[h(13), h(18)]],
  2: [[h(9), h(12)], [h(13), h(18)]],
  3: [[h(9), h(12)], [h(13), h(18)]],
  4: [[h(9), h(12)], [h(13), h(18)]],
  5: [[h(9), h(12)], [h(13), h(18)]],
  6: [[h(8), h(12)]],
};

const NOMES = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

/** 780 -> "13h", 570 -> "9h30" */
function formatarHora(minutos) {
  const hora = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return resto ? `${hora}h${String(resto).padStart(2, "0")}` : `${hora}h`;
}

/**
 * Diz se a secretaria esta aberta no instante dado e, se nao estiver, quando
 * abre. Recebe o resultado de agoraEmSaoPaulo().
 *
 * { aberta: true,  texto: "Aberta agora · fecha às 12h" }
 * { aberta: false, texto: "Fechada · abre amanhã às 9h" }
 */
export function statusDaSecretaria({ diaDaSemana, minutos }) {
  const turnoAtual = TURNOS_DA_SECRETARIA[diaDaSemana].find(
    ([abre, fecha]) => minutos >= abre && minutos < fecha,
  );
  if (turnoAtual) {
    return { aberta: true, texto: `Aberta agora · fecha às ${formatarHora(turnoAtual[1])}` };
  }

  // Procura o proximo turno: ainda hoje, depois nos proximos 7 dias.
  for (let adiante = 0; adiante < 8; adiante++) {
    const dia = (diaDaSemana + adiante) % 7;
    const proximo = TURNOS_DA_SECRETARIA[dia].find(([abre]) => adiante > 0 || abre > minutos);
    if (!proximo) continue;
    const quando = adiante === 0 ? "hoje" : adiante === 1 ? "amanhã" : NOMES[dia];
    return { aberta: false, texto: `Fechada · abre ${quando} às ${formatarHora(proximo[0])}` };
  }

  return { aberta: false, texto: "Fechada" };
}
