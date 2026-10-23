// "PIX Copia e Cola" (BR Code estatico) no padrao EMV do Banco Central.
//
// O texto e uma sequencia de campos ID + TAMANHO (2 digitos) + VALOR, e
// termina com um CRC16 que o app do banco confere. Sem valor fixo: quem doa
// escolhe quanto, no proprio banco.
//
// Referencia: "Manual de Padroes para Iniciacao do Pix", Banco Central.

function campo(id, valor) {
  return `${id}${String(valor.length).padStart(2, "0")}${valor}`;
}

/**
 * Nome e cidade do recebedor: sem acento, em maiusculas e no tamanho maximo
 * do padrao (25 e 15). Acento quebra a leitura em varios apps de banco.
 */
function limpar(texto, maximo) {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .toUpperCase()
    .trim()
    .slice(0, maximo)
    // Aparar de novo: o corte pode parar logo depois de um espaco.
    .trimEnd();
}

/** CRC16-CCITT (polinomio 0x1021, inicio 0xFFFF), em 4 digitos hexadecimais. */
export function crc16(texto) {
  let crc = 0xffff;
  for (let i = 0; i < texto.length; i++) {
    crc ^= texto.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function codigoPix({ chave, nome, cidade, identificador = "***" }) {
  const conta = campo("26", campo("00", "br.gov.bcb.pix") + campo("01", chave));
  const semCrc =
    campo("00", "01") + // versao do formato
    conta +
    campo("52", "0000") + // categoria do comerciante: nao se aplica
    campo("53", "986") + // moeda: real
    campo("58", "BR") +
    campo("59", limpar(nome, 25)) +
    campo("60", limpar(cidade, 15)) +
    campo("62", campo("05", identificador)) +
    "6304"; // o CRC vem logo depois e entra no proprio calculo
  return semCrc + crc16(semCrc);
}
