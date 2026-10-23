// Dia e hora de AGORA em Sao Paulo, seja qual for o fuso de quem visita.
//
// O "aberto agora" da secretaria e o "hoje" dos horarios sao sobre o relogio
// de Campinas: um paroquiano viajando em Portugal precisa ver a secretaria
// como fechada quando ela de fato esta fechada.

const PARTES = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Sao_Paulo",
  weekday: "short",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const DIAS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

/**
 * { diaDaSemana: 0 (domingo) a 6, minutos: minutos desde a meia-noite,
 *   ano, mes (1-12), dia }
 */
export function agoraEmSaoPaulo(data = new Date()) {
  const partes = Object.fromEntries(PARTES.formatToParts(data).map((p) => [p.type, p.value]));
  // Alguns navegadores formatam meia-noite como "24" com hour12: false.
  const hora = Number(partes.hour) % 24;
  return {
    diaDaSemana: DIAS[partes.weekday],
    minutos: hora * 60 + Number(partes.minute),
    ano: Number(partes.year),
    mes: Number(partes.month),
    dia: Number(partes.day),
  };
}
