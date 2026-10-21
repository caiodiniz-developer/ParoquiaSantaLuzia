import fs from "node:fs";
import path from "node:path";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { criarApp } from "../src/app.js";
import { env } from "../src/env.js";
import { prisma } from "../src/prisma.js";

/**
 * Apoio dos testes: sobe o app numa porta livre e oferece um cliente HTTP
 * pequeno. Os testes rodam contra o banco de desenvolvimento (SQLite) e cada
 * um apaga o que criou -- nada de banco de testes separado para manter.
 */

const LOGO = fs.readFileSync(path.resolve(import.meta.dirname, "../../public/assets/logo.png"));

export function imagem(nome = "foto.png") {
  return { blob: new Blob([LOGO], { type: "image/png" }), nome };
}

export type Resposta = { status: number; json: any };

export async function subirServidor() {
  const servidor: Server = await new Promise((resolver) => {
    const s = criarApp().listen(0, () => resolver(s));
  });
  const { port } = servidor.address() as AddressInfo;
  const base = `http://127.0.0.1:${port}/api`;

  async function chamar(
    metodo: string,
    caminho: string,
    opcoes: { token?: string; corpo?: unknown; form?: FormData } = {},
  ): Promise<Resposta> {
    const headers: Record<string, string> = {};
    if (opcoes.token) headers.Authorization = `Bearer ${opcoes.token}`;
    let body: BodyInit | undefined;
    if (opcoes.form) body = opcoes.form;
    else if (opcoes.corpo !== undefined) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(opcoes.corpo);
    }
    const resposta = await fetch(base + caminho, { method: metodo, headers, body });
    const texto = await resposta.text();
    let json: unknown = null;
    try {
      json = texto ? JSON.parse(texto) : null;
    } catch {
      json = texto;
    }
    return { status: resposta.status, json };
  }

  async function entrar() {
    const r = await chamar("POST", "/auth/login", {
      corpo: { email: env.ADMIN_EMAIL, senha: env.ADMIN_PASSWORD },
    });
    if (r.status !== 200) throw new Error(`login falhou: ${r.status}`);
    return r.json.token as string;
  }

  async function fechar() {
    await new Promise((resolver) => servidor.close(resolver));
  }

  return { chamar, entrar, fechar, base };
}

/** Formulario minimo de um evento valido, com capa. */
export function formularioDeEvento(campos: Record<string, string> = {}) {
  const form = new FormData();
  const padrao = {
    titulo: "Evento de teste",
    tipo: "FESTA",
    comecaEm: "2099-12-13T19:30",
    ...campos,
  };
  for (const [nome, valor] of Object.entries(padrao)) form.append(nome, valor);
  const { blob, nome } = imagem("capa.png");
  form.append("capa", blob, nome);
  return form;
}

export async function desconectar() {
  await prisma.$disconnect();
}
