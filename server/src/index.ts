import { env } from "./env.js";
import { criarApp } from "./app.js";
import { prisma } from "./prisma.js";

const app = criarApp();

const servidor = app.listen(env.PORT, () => {
  console.log(`API da Paroquia Santa Luzia em http://localhost:${env.PORT}`);
  console.log(`Ambiente: ${env.NODE_ENV}`);
  console.log(`Origens liberadas: ${env.origensPermitidas.join(", ")}`);
});

// O Render manda SIGTERM antes de trocar a instancia. Fechar o servidor e o
// banco evita requisicao cortada no meio e conexao pendurada no Postgres.
for (const sinal of ["SIGTERM", "SIGINT"] as const) {
  process.on(sinal, () => {
    console.log(`\n${sinal} recebido, encerrando...`);
    servidor.close(() => {
      prisma.$disconnect().finally(() => process.exit(0));
    });
  });
}
