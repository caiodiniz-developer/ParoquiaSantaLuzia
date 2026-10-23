import fs from "node:fs/promises";

/**
 * Confere se o CONTEUDO do arquivo bate com o tipo que o navegador declarou.
 *
 * O `mimetype` do upload e so o que o cliente disse: qualquer um manda um
 * HTML, um script ou um executavel rotulado "image/png". O fileFilter das
 * rotas confere o rotulo; este modulo confere os primeiros bytes, que cada
 * formato de imagem e video tem fixos ("numeros magicos").
 */

const TAMANHO_LIDO = 16;

type Conferencia = (bytes: Buffer) => boolean;

const ascii = (bytes: Buffer, inicio: number, texto: string) =>
  bytes.subarray(inicio, inicio + texto.length).toString("latin1") === texto;

const comeca = (bytes: Buffer, ...valores: number[]) => valores.every((v, i) => bytes[i] === v);

/** Familia ISO (MP4, AVIF): os bytes 4 a 8 dizem "ftyp". */
const ftyp = (bytes: Buffer) => ascii(bytes, 4, "ftyp");

const CONFERENCIAS: Record<string, Conferencia> = {
  "image/jpeg": (b) => comeca(b, 0xff, 0xd8, 0xff),
  "image/png": (b) => comeca(b, 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a),
  "image/gif": (b) => ascii(b, 0, "GIF87a") || ascii(b, 0, "GIF89a"),
  "image/webp": (b) => ascii(b, 0, "RIFF") && ascii(b, 8, "WEBP"),
  "image/avif": (b) => ftyp(b) && (ascii(b, 8, "avif") || ascii(b, 8, "avis")),
  "video/mp4": (b) => ftyp(b),
  "video/webm": (b) => comeca(b, 0x1a, 0x45, 0xdf, 0xa3),
};

export async function conteudoConfereComTipo(caminho: string, tipo: string) {
  const conferir = CONFERENCIAS[tipo];
  if (!conferir) return false;

  const arquivo = await fs.open(caminho, "r");
  try {
    const bytes = Buffer.alloc(TAMANHO_LIDO);
    const { bytesRead } = await arquivo.read(bytes, 0, TAMANHO_LIDO, 0);
    return conferir(bytes.subarray(0, bytesRead));
  } finally {
    await arquivo.close();
  }
}
