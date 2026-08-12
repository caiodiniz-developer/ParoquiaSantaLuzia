import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma.js";
import { armazenamento } from "./storage.js";
import { NaoEncontrado } from "./erros.js";

type EventoDoBanco = Prisma.EventoGetPayload<object>;

/**
 * O banco guarda a galeria como texto JSON (limitacao do SQLite do ambiente
 * de desenvolvimento). A conversao acontece so aqui, na fronteira: o resto do
 * sistema sempre ve um array.
 */
function paraResposta(evento: EventoDoBanco) {
  let galeria: string[] = [];
  try {
    const analisado = JSON.parse(evento.galeria);
    if (Array.isArray(analisado)) galeria = analisado;
  } catch {
    // Registro com JSON corrompido nao pode derrubar a listagem inteira.
  }
  return { ...evento, galeria };
}

type FiltroDeListagem = {
  escopo: "proximos" | "realizados" | "todos";
  limite?: number;
  incluirInativos: boolean;
};

/**
 * Meia-noite de hoje no horario de Brasilia.
 *
 * O corte NAO pode ser "agora": a missa das 7h sumiria do site as 7h01, com o
 * pessoal ainda a caminho da igreja. Um evento continua anunciado durante todo
 * o dia em que acontece.
 */
function inicioDeHoje() {
  // "en-CA" formata como AAAA-MM-DD, que e o que precisamos remontar.
  const hoje = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(
    new Date(),
  );
  return new Date(`${hoje}T00:00:00-03:00`);
}

export async function listar({ escopo, limite, incluirInativos }: FiltroDeListagem) {
  const where: Prisma.EventoWhereInput = {};

  // Só o painel autenticado enxerga eventos desativados.
  if (!incluirInativos) where.ativo = true;

  const corte = inicioDeHoje();

  if (escopo === "proximos") {
    // Evento de ontem nao e noticia. O corte e por DATA e nao por `ativo`,
    // senao alguem teria que desativar cada missa na mao toda semana.
    //
    // Quem manda e a data de TERMINO, quando existe: um triduo que comecou
    // ontem e acaba amanha ainda esta acontecendo e continua na lista.
    where.OR = [
      { terminaEm: { gte: corte } },
      { terminaEm: null, comecaEm: { gte: corte } },
    ];
  } else if (escopo === "realizados") {
    where.OR = [
      { terminaEm: { lt: corte } },
      { terminaEm: null, comecaEm: { lt: corte } },
    ];
  }

  const eventos = await prisma.evento.findMany({
    where,
    // Proximos: o que vem primeiro no topo. Realizados: o mais recente no
    // topo, que e a ordem util para uma galeria de fotos.
    orderBy:
      escopo === "realizados"
        ? [{ comecaEm: "desc" }]
        : [{ destaque: "desc" }, { comecaEm: "asc" }],
    take: limite,
  });

  return eventos.map(paraResposta);
}

export async function buscarPorId(id: string) {
  const evento = await prisma.evento.findUnique({ where: { id } });
  if (!evento) throw new NaoEncontrado("Evento nao encontrado.");
  return paraResposta(evento);
}

type DadosDeCriacao = {
  titulo: string;
  tipo: string;
  resumo: string;
  descricao: string;
  bencao: string;
  local: string;
  inscricaoUrl?: string;
  destaque: boolean;
  ativo: boolean;
  comecaEm: Date;
  terminaEm?: Date | null;
  coverUrl: string;
  videoUrl?: string | null;
  galeria: string[];
};

export async function criar(dados: DadosDeCriacao) {
  const evento = await prisma.evento.create({
    data: {
      ...dados,
      inscricaoUrl: dados.inscricaoUrl || null,
      terminaEm: dados.terminaEm ?? null,
      videoUrl: dados.videoUrl ?? null,
      galeria: JSON.stringify(dados.galeria),
    },
  });
  return paraResposta(evento);
}

type DadosDeEdicao = Partial<DadosDeCriacao>;

export async function atualizar(id: string, dados: DadosDeEdicao) {
  const existente = await prisma.evento.findUnique({ where: { id } });
  if (!existente) throw new NaoEncontrado("Evento nao encontrado.");

  const { coverUrl, videoUrl, galeria, ...resto } = dados;

  const evento = await prisma.evento.update({
    where: { id },
    data: {
      ...resto,
      ...(dados.inscricaoUrl !== undefined && { inscricaoUrl: dados.inscricaoUrl || null }),
      ...(dados.terminaEm !== undefined && { terminaEm: dados.terminaEm ?? null }),
      ...(coverUrl && { coverUrl }),
      // `undefined` aqui significa "nao mexeu" e por isso nem entra no update;
      // `null` significa "remover" e precisa entrar.
      ...(videoUrl !== undefined && { videoUrl }),
      ...(galeria && { galeria: JSON.stringify(galeria) }),
    },
  });

  // Os arquivos antigos so sao apagados DEPOIS que o banco confirmou os novos.
  // Se apagassemos antes e o update falhasse, o evento ficaria sem imagem.
  if (coverUrl && existente.coverUrl !== coverUrl) {
    await armazenamento.remover(existente.coverUrl).catch(() => {});
  }
  if (videoUrl !== undefined && existente.videoUrl && existente.videoUrl !== videoUrl) {
    await armazenamento.remover(existente.videoUrl).catch(() => {});
  }

  return paraResposta(evento);
}

export async function definirAtivo(id: string, ativo: boolean) {
  try {
    return paraResposta(await prisma.evento.update({ where: { id }, data: { ativo } }));
  } catch {
    throw new NaoEncontrado("Evento nao encontrado.");
  }
}

export async function remover(id: string) {
  const evento = await prisma.evento.findUnique({ where: { id } });
  if (!evento) throw new NaoEncontrado("Evento nao encontrado.");

  await prisma.evento.delete({ where: { id } });

  // Limpeza dos arquivos e best-effort: o registro ja foi apagado e o usuario
  // nao deve ver erro por causa de um arquivo orfao no bucket.
  const paraApagar = [evento.coverUrl, evento.videoUrl, ...paraResposta(evento).galeria];
  await Promise.allSettled(
    paraApagar.filter((url): url is string => Boolean(url)).map((url) => armazenamento.remover(url)),
  );
}
