import { PrismaClient } from "@prisma/client";
import { env } from "./env.js";

// Em desenvolvimento o tsx recarrega o modulo a cada save. Sem guardar a
// instancia no globalThis, cada recarga abriria um pool novo de conexoes ate
// o banco recusar.
const global_ = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  global_.prisma ??
  new PrismaClient({
    log: env.emProducao ? ["error"] : ["warn", "error"],
  });

if (!env.emProducao) global_.prisma = prisma;
