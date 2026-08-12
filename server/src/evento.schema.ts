import { z } from "zod";

export const TIPOS_DE_EVENTO = [
  "MISSA",
  "ORACAO",
  "JOVENS",
  "CATEQUESE",
  "PEREGRINACAO",
  "ACAO_SOCIAL",
  "FESTA",
  "GERAL",
] as const;

/**
 * Converte texto em booleano.
 *
 * Isto existe por um detalhe que so aparece na pratica: multipart transmite
 * TUDO como texto. Um checkbox desmarcado chega como a string "false" -- que
 * em JavaScript e verdadeira. Sem esta conversao, todo evento nasceria em
 * destaque.
 */
const booleanoDeTexto = z
  .union([z.boolean(), z.string()])
  .transform((valor) =>
    typeof valor === "boolean" ? valor : ["true", "1", "on", "sim"].includes(valor.toLowerCase()),
  );

/** Campo de texto opcional: string vazia do formulario vira "". */
const textoOpcional = z
  .string()
  .transform((valor) => valor.trim())
  .optional()
  .default("");

/**
 * O <input type="datetime-local"> manda "2026-08-12T19:30" -- SEM fuso.
 *
 * `new Date("2026-08-12T19:30")` interpreta esse texto no fuso do processo.
 * Na maquina de quem desenvolve (Brasilia) parece certo; no Render, que roda
 * em UTC, o mesmo cadastro entraria como 16h30 de Brasilia. O evento das 19h30
 * apareceria as 16h30 no site, e o bug so seria notado depois do deploy.
 *
 * Por isso carimbamos -03:00 quando o texto nao traz fuso nenhum. O Brasil nao
 * tem mais horario de verao desde 2019, entao o deslocamento e fixo. Textos
 * que ja tragam fuso (um ISO com Z, por exemplo) passam intactos.
 */
const SEM_FUSO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;
const FUSO_DE_BRASILIA = "-03:00";

const dataHora = z.preprocess(
  (valor) => (typeof valor === "string" && SEM_FUSO.test(valor) ? valor + FUSO_DE_BRASILIA : valor),
  z.coerce.date({ errorMap: () => ({ message: "Data invalida." }) }),
);

/**
 * Campo de data que pode vir vazio.
 *
 * O `""` e artefato de formulario HTML, nao um valor do dominio: um evento ou
 * tem termino ou nao tem. Normalizando para `undefined` logo na entrada, o
 * resto do sistema lida com um tipo so (`Date | undefined`) em vez de carregar
 * a string vazia ate o banco.
 */
const dataHoraOpcional = z.preprocess(
  (valor) => (valor === "" || valor === null ? undefined : valor),
  dataHora.optional(),
);

const camposComuns = {
  titulo: z.string().trim().min(3, "O titulo precisa de pelo menos 3 caracteres.").max(160),
  tipo: z.enum(TIPOS_DE_EVENTO).default("GERAL"),
  resumo: z.string().trim().max(280, "O resumo do card cabe em 280 caracteres.").optional().default(""),
  descricao: textoOpcional,
  bencao: z.string().trim().max(300).optional().default(""),
  local: textoOpcional,
  inscricaoUrl: z
    .string()
    .trim()
    .url("O link de inscricao precisa comecar com http:// ou https://")
    .optional()
    .or(z.literal("")),
  destaque: booleanoDeTexto.optional().default(false),
  ativo: booleanoDeTexto.optional().default(true),
  comecaEm: dataHora,
  terminaEm: dataHoraOpcional,
};

export const esquemaDeCriacao = z
  .object(camposComuns)
  .refine((dados) => !dados.terminaEm || dados.terminaEm >= dados.comecaEm, {
    message: "O termino nao pode ser antes do inicio.",
    path: ["terminaEm"],
  });

// Na edicao todo campo e opcional: o formulario manda so o que mudou, e um
// PATCH sem a capa nao pode apagar a capa que ja existe.
export const esquemaDeEdicao = z
  .object(camposComuns)
  .partial()
  .refine(
    (dados) => !dados.comecaEm || !dados.terminaEm || dados.terminaEm >= dados.comecaEm,
    { message: "O termino nao pode ser antes do inicio.", path: ["terminaEm"] },
  );

export const esquemaDeAtivo = z.object({ ativo: z.boolean() });

export const esquemaDeLogin = z.object({
  email: z.string().trim().email("E-mail invalido."),
  senha: z.string().min(1, "Informe a senha."),
});

export const esquemaDeListagem = z.object({
  escopo: z.enum(["proximos", "realizados", "todos"]).default("proximos"),
  limite: z.coerce.number().int().min(1).max(60).optional(),
  incluirInativos: z
    .string()
    .optional()
    .transform((valor) => valor === "true"),
});

/** URLs da galeria que o formulario pediu para manter (as demais somem). */
export const esquemaDeGaleriaMantida = z
  .string()
  .optional()
  .transform((valor) => {
    if (!valor) return null;
    try {
      const analisado = JSON.parse(valor);
      return Array.isArray(analisado) ? analisado.filter((i) => typeof i === "string") : null;
    } catch {
      return null;
    }
  });
