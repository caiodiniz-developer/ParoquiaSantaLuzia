/**
 * Primeiro import dos testes: marca o processo como "test" ANTES de o env.ts
 * ler o .env. O dotenv nao sobrescreve variavel que ja existe, entao o
 * NODE_ENV=development do .env de quem desenvolve deixa de valer aqui -- e o
 * log de requisicoes do modo de desenvolvimento nao polui a saida dos testes.
 */
process.env.NODE_ENV = "test";
