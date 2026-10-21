import os from "node:os";
import fs from "node:fs/promises";
import { Router, type NextFunction, type Request, type Response } from "express";
import multer from "multer";
import { autenticar, autenticacaoOpcional } from "../auth.js";
import { assincrono } from "../assincrono.js";
import { DadosInvalidos, NaoEncontrado } from "../erros.js";
import { armazenamento } from "../storage.js";
import * as servico from "../evento.service.js";
import {
  esquemaDeAtivo,
  esquemaDeCriacao,
  esquemaDeEdicao,
  esquemaDeGaleriaMantida,
  esquemaDeListagem,
} from "../evento.schema.js";

export const LIMITE_DE_IMAGEM = 8 * 1024 * 1024; // 8 MB
export const LIMITE_DE_VIDEO = 60 * 1024 * 1024; // 60 MB
const MAXIMO_NA_GALERIA = 6;

const IMAGENS_ACEITAS = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
// MP4 (H.264) e WebM cobrem todo navegador atual. MOV do iPhone fica de fora
// de proposito: o Safari toca, o Chrome no Android nao, e o padre nao teria
// como saber por que o video nao roda para metade das pessoas.
const VIDEOS_ACEITOS = ["video/mp4", "video/webm"];

const upload = multer({
  // Disco temporario, nao memoria: um video de 60 MB em `memoryStorage`, com
  // duas pessoas salvando ao mesmo tempo, derruba a instancia gratuita do
  // Render (512 MB).
  storage: multer.diskStorage({ destination: os.tmpdir() }),
  // O multer so aceita UM limite de tamanho para todos os campos, entao ele
  // fica no maior (video) e o tamanho das imagens e conferido logo depois,
  // em `conferirTamanhos`.
  limits: { fileSize: LIMITE_DE_VIDEO, files: MAXIMO_NA_GALERIA + 2 },
  fileFilter: (_req, arquivo, callback) => {
    const aceitos = arquivo.fieldname === "video" ? VIDEOS_ACEITOS : IMAGENS_ACEITAS;
    if (!aceitos.includes(arquivo.mimetype)) {
      callback(
        new DadosInvalidos(
          arquivo.fieldname === "video"
            ? "O video precisa ser MP4 ou WEBM."
            : "Envie imagens JPG, PNG, WEBP, AVIF ou GIF.",
        ),
      );
      return;
    }
    callback(null, true);
  },
});

/** O limite do multer vale pelo maior arquivo; as imagens tem um menor. */
function conferirTamanhos(req: Request, _res: Response, next: NextFunction) {
  const arquivos = (req.files ?? {}) as Record<string, Express.Multer.File[] | undefined>;
  const imagens = [...(arquivos.capa ?? []), ...(arquivos.galeria ?? [])];

  const grande = imagens.find((arquivo) => arquivo.size > LIMITE_DE_IMAGEM);
  if (grande) {
    next(new DadosInvalidos(`A imagem "${grande.originalname}" passa de 8 MB.`));
    return;
  }
  next();
}

/**
 * Apaga os temporarios do multer quando a resposta termina, de qualquer jeito.
 *
 * No caminho feliz o storage ja os removeu e este unlink falha calado. O que
 * ele pega e o resto: titulo invalido, imagem grande demais, evento que nao
 * existe. Sem isto cada formulario recusado deixava a capa e o video
 * esquecidos na pasta temporaria, e um disco de 512 MB enche rapido com videos
 * de 60 MB.
 */
function limparTemporariosAoTerminar(req: Request, res: Response, next: NextFunction) {
  let limpo = false;
  const limpar = () => {
    if (limpo) return;
    limpo = true;
    const arquivos = Object.values((req.files ?? {}) as ArquivosRecebidos).flat();
    for (const arquivo of arquivos) {
      if (arquivo?.path) fs.unlink(arquivo.path).catch(() => {});
    }
  };
  res.on("finish", limpar);
  res.on("close", limpar);
  next();
}

// `autenticar` vem ANTES do multer de proposito: sem sessao valida, o arquivo
// e recusado antes de ocupar disco e banda.
const receberArquivos = [
  autenticar,
  limparTemporariosAoTerminar,
  upload.fields([
    { name: "capa", maxCount: 1 },
    { name: "video", maxCount: 1 },
    { name: "galeria", maxCount: MAXIMO_NA_GALERIA },
  ]),
  conferirTamanhos,
];

type ArquivosRecebidos = Record<string, Express.Multer.File[] | undefined>;

/** Zod devolve varios erros; mostramos a primeira mensagem, que e a util. */
function primeiraMensagem(erro: { issues: { message: string; path: (string | number)[] }[] }) {
  const problema = erro.issues[0];
  return problema ? `${problema.message}` : "Dados invalidos.";
}

export const rotasDeEvento = Router();

/**
 * Listagem. Leitura e aberta -- quem consome e o site publico.
 *
 * A autenticacao e OPCIONAL: com token valido, o painel pode pedir
 * `incluirInativos` e ver o que esta escondido do site.
 */
rotasDeEvento.get(
  "/",
  autenticacaoOpcional,
  assincrono(async (req, res) => {
    const analise = esquemaDeListagem.safeParse(req.query);
    if (!analise.success) throw new DadosInvalidos(primeiraMensagem(analise.error));

    const { escopo, limite, incluirInativos } = analise.data;

    res.json(
      await servico.listar({
        escopo,
        limite,
        // Pedir nao basta: sem sessao, o filtro continua valendo.
        incluirInativos: incluirInativos && Boolean(req.admin),
      }),
    );
  }),
);

/**
 * Detalhe de um evento. Sem sessao, evento oculto responde 404 -- igual a um
 * que nao existe. Responder 403 confirmaria que o id e valido, e "oculto"
 * costuma ser justamente o evento que ainda nao pode ser divulgado.
 */
rotasDeEvento.get(
  "/:id",
  autenticacaoOpcional,
  assincrono(async (req, res) => {
    const evento = await servico.buscarPorId(req.params.id);
    if (!evento.ativo && !req.admin) throw new NaoEncontrado("Evento nao encontrado.");
    res.json(evento);
  }),
);

rotasDeEvento.post(
  "/",
  receberArquivos,
  assincrono(async (req, res) => {
    const analise = esquemaDeCriacao.safeParse(req.body);
    if (!analise.success) throw new DadosInvalidos(primeiraMensagem(analise.error));

    const arquivos = (req.files ?? {}) as ArquivosRecebidos;
    const capa = arquivos.capa?.[0];
    if (!capa) throw new DadosInvalidos("Escolha uma imagem de capa para o evento.");

    const coverUrl = await armazenamento.salvar(capa);
    const video = arquivos.video?.[0];
    const videoUrl = video ? await armazenamento.salvar(video) : null;
    const galeria = await Promise.all(
      (arquivos.galeria ?? []).map((arquivo) => armazenamento.salvar(arquivo)),
    );

    res.status(201).json(
      await servico.criar({
        ...analise.data,
        terminaEm: analise.data.terminaEm ?? null,
        coverUrl,
        videoUrl,
        galeria,
      }),
    );
  }),
);

rotasDeEvento.patch(
  "/:id",
  receberArquivos,
  assincrono(async (req, res) => {
    const analise = esquemaDeEdicao.safeParse(req.body);
    if (!analise.success) throw new DadosInvalidos(primeiraMensagem(analise.error));

    const arquivos = (req.files ?? {}) as ArquivosRecebidos;
    const capa = arquivos.capa?.[0];
    const coverUrl = capa ? await armazenamento.salvar(capa) : undefined;

    /**
     * Video tem tres estados, nao dois: mandou um novo, nao mexeu, ou pediu
     * para remover. `undefined` significa "nao mexeu" e `null` "remover" --
     * por isso o formulario manda a bandeira `removerVideo` explicitamente.
     */
    const video = arquivos.video?.[0];
    const videoUrl = video
      ? await armazenamento.salvar(video)
      : req.body.removerVideo === "true"
        ? null
        : undefined;

    // O formulario manda quais fotos da galeria continuam. As que sumiram da
    // lista sao removidas do armazenamento depois que o banco confirmar.
    const mantidas = esquemaDeGaleriaMantida.parse(req.body.galeriaMantida);
    const novas = await Promise.all(
      (arquivos.galeria ?? []).map((arquivo) => armazenamento.salvar(arquivo)),
    );

    const anterior = await servico.buscarPorId(req.params.id);
    const galeria =
      mantidas === null && novas.length === 0 ? undefined : [...(mantidas ?? anterior.galeria), ...novas];

    /**
     * `terminaEm` precisa do corpo cru.
     *
     * O schema normaliza "" para undefined, o que apaga a diferenca entre
     * "o formulario nao mandou o campo" e "o usuario limpou a data". Para o
     * PATCH essa diferenca importa: no primeiro caso a data atual continua, no
     * segundo ela tem que virar null. A presenca da chave no corpo resolve.
     */
    const terminoFoiEnviado = "terminaEm" in req.body;

    const atualizado = await servico.atualizar(req.params.id, {
      ...analise.data,
      ...(terminoFoiEnviado && { terminaEm: analise.data.terminaEm ?? null }),
      coverUrl,
      videoUrl,
      galeria,
    });

    if (galeria) {
      const descartadas = anterior.galeria.filter((url) => !galeria.includes(url));
      await Promise.allSettled(descartadas.map((url) => armazenamento.remover(url)));
    }

    res.json(atualizado);
  }),
);

rotasDeEvento.patch(
  "/:id/ativo",
  autenticar,
  assincrono(async (req, res) => {
    const analise = esquemaDeAtivo.safeParse(req.body);
    if (!analise.success) throw new DadosInvalidos(primeiraMensagem(analise.error));

    res.json(await servico.definirAtivo(req.params.id, analise.data.ativo));
  }),
);

rotasDeEvento.delete(
  "/:id",
  autenticar,
  assincrono(async (req, res) => {
    await servico.remover(req.params.id);
    res.status(204).end();
  }),
);
