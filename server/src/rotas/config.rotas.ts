import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { autenticar } from "../auth.js";
import { assincrono } from "../assincrono.js";
import { DadosInvalidos } from "../erros.js";

/**
 * Configuracoes do site, sobre a tabela generica Setting (chave/valor com JSON).
 *
 * Cada ajuste novo vira uma linha, nao uma migracao de banco -- que e o ponto
 * de existir uma tabela generica em vez de colunas dedicadas.
 */

const PADROES = {
  eventosNaHome: 6,
  mostrarRealizados: false,
};

const esquema = z.object({
  eventosNaHome: z.coerce.number().int().min(1).max(24).optional(),
  mostrarRealizados: z.boolean().optional(),
});

/** Padroes com o que estiver salvo por cima. */
async function lerConfiguracoes() {
  const linhas = await prisma.setting.findMany();

  const salvas: Record<string, unknown> = {};
  for (const linha of linhas) {
    // So chaves conhecidas: uma linha antiga, de um ajuste que deixou de
    // existir, nao deve continuar vazando para o site.
    if (!(linha.chave in PADROES)) continue;
    try {
      salvas[linha.chave] = JSON.parse(linha.valor);
    } catch {
      // Linha corrompida cai no padrao em vez de derrubar a rota.
    }
  }

  return { ...PADROES, ...salvas };
}

export const rotasDeConfig = Router();

rotasDeConfig.get(
  "/",
  assincrono(async (_req, res) => {
    res.json(await lerConfiguracoes());
  }),
);

rotasDeConfig.put(
  "/",
  autenticar,
  assincrono(async (req, res) => {
    const analise = esquema.safeParse(req.body);
    if (!analise.success) throw new DadosInvalidos("Configuracao invalida.");

    const entradas = Object.entries(analise.data).filter(([, valor]) => valor !== undefined);

    // Tudo numa transacao: uma configuracao salva pela metade e pior que
    // nenhuma, porque ninguem percebe.
    await prisma.$transaction(
      entradas.map(([chave, valor]) =>
        prisma.setting.upsert({
          where: { chave },
          create: { chave, valor: JSON.stringify(valor) },
          update: { valor: JSON.stringify(valor) },
        }),
      ),
    );

    // Relido do banco: devolver so PADROES + o que veio no pedido apagaria da
    // resposta os ajustes salvos antes que nao vieram desta vez.
    res.json(await lerConfiguracoes());
  }),
);
