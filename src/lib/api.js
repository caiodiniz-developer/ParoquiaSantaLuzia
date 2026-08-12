// Cliente unico da API, usado pelo site publico e pelo painel.
//
// Em desenvolvimento VITE_API_URL fica vazia e o Vite repassa /api para o
// Express (ver vite.config.js). Em producao ela aponta para o Render, porque
// site e API vivem em dominios diferentes.
const RAIZ = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
const BASE = `${RAIZ}/api`;

const CHAVE_TOKEN = "paroquia.admin.token";

export function lerToken() {
  try {
    return localStorage.getItem(CHAVE_TOKEN);
  } catch {
    // Navegador com armazenamento bloqueado (aba anonima restrita).
    return null;
  }
}

export function salvarToken(token) {
  try {
    localStorage.setItem(CHAVE_TOKEN, token);
  } catch {
    /* sem persistencia: a sessao dura ate fechar a aba */
  }
}

export function limparToken() {
  try {
    localStorage.removeItem(CHAVE_TOKEN);
  } catch {
    /* nada a fazer */
  }
}

export class ErroDaApi extends Error {
  constructor(mensagem, status) {
    super(mensagem);
    this.name = "ErroDaApi";
    this.status = status;
  }
}

async function lerMensagemDeErro(resposta) {
  try {
    const corpo = await resposta.json();
    return corpo?.erro || corpo?.mensagem || `Erro ${resposta.status}`;
  } catch {
    return `Erro ${resposta.status}`;
  }
}

async function requisitar(caminho, opcoes = {}) {
  const { metodo = "GET", corpo, autenticado = false, sinal } = opcoes;

  const cabecalhos = {};
  if (autenticado) {
    const token = lerToken();
    // O token viaja no cabecalho, nunca em cookie: site e API estao em
    // dominios diferentes e cookie entre dominios depende do navegador
    // aceitar terceiros.
    if (token) cabecalhos.Authorization = `Bearer ${token}`;
  }

  let corpoFinal;
  if (corpo instanceof FormData) {
    // Sem Content-Type de proposito: o navegador precisa gerar o boundary.
    corpoFinal = corpo;
  } else if (corpo !== undefined) {
    cabecalhos["Content-Type"] = "application/json";
    corpoFinal = JSON.stringify(corpo);
  }

  const resposta = await fetch(`${BASE}${caminho}`, {
    method: metodo,
    headers: cabecalhos,
    body: corpoFinal,
    // Sem cache: um evento recem-cadastrado tem que aparecer na hora. Sem
    // isto, o navegador pode servir a listagem antiga de um GET anterior.
    cache: "no-store",
    signal: sinal,
  });

  if (resposta.status === 401 && autenticado) {
    limparToken();
    throw new ErroDaApi("Sessao expirada. Entre de novo.", 401);
  }

  if (!resposta.ok) {
    throw new ErroDaApi(await lerMensagemDeErro(resposta), resposta.status);
  }

  if (resposta.status === 204) return null;

  /**
   * Se veio HTML, quem respondeu foi a hospedagem do site e nao a API -- o
   * caso classico e o VITE_API_URL faltando em producao. Sem esta checagem o
   * erro apareceria como "Unexpected token <", que nao ajuda ninguem.
   */
  const tipo = resposta.headers.get("content-type") || "";
  if (!tipo.includes("application/json")) {
    throw new ErroDaApi(
      "A API nao respondeu. Verifique se VITE_API_URL aponta para o servidor.",
      resposta.status,
    );
  }

  return resposta.json();
}

/**
 * Envio com barra de progresso. Usa XMLHttpRequest porque `fetch` nao reporta
 * progresso de UPLOAD -- e um video de 100 MB numa conexao ruim sem barra
 * parece um site travado.
 */
function enviarComProgresso(caminho, { metodo, formData, aoProgredir }) {
  return new Promise((resolver, rejeitar) => {
    const xhr = new XMLHttpRequest();
    xhr.open(metodo, `${BASE}${caminho}`);

    const token = lerToken();
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.addEventListener("progress", (evento) => {
      if (evento.lengthComputable && aoProgredir) {
        aoProgredir(Math.round((evento.loaded / evento.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      let corpo = null;
      try {
        corpo = JSON.parse(xhr.responseText);
      } catch {
        /* resposta sem corpo JSON */
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolver(corpo);
        return;
      }
      if (xhr.status === 401) limparToken();
      rejeitar(new ErroDaApi(corpo?.erro || `Erro ${xhr.status}`, xhr.status));
    });

    xhr.addEventListener("error", () =>
      rejeitar(new ErroDaApi("Nao foi possivel falar com o servidor.", 0)),
    );
    xhr.addEventListener("timeout", () =>
      rejeitar(new ErroDaApi("O envio demorou demais.", 0)),
    );

    xhr.send(formData);
  });
}

/* ===== Eventos ===== */

export const eventos = {
  /** escopo: "proximos" | "realizados" | "todos" */
  listar: ({ escopo = "proximos", limite, incluirInativos = false, sinal } = {}) => {
    const busca = new URLSearchParams({ escopo });
    if (limite) busca.set("limite", String(limite));
    if (incluirInativos) busca.set("incluirInativos", "true");
    return requisitar(`/eventos?${busca}`, { autenticado: incluirInativos, sinal });
  },

  buscar: (id) => requisitar(`/eventos/${id}`),

  criar: (formData, aoProgredir) =>
    enviarComProgresso("/eventos", { metodo: "POST", formData, aoProgredir }),

  atualizar: (id, formData, aoProgredir) =>
    enviarComProgresso(`/eventos/${id}`, { metodo: "PATCH", formData, aoProgredir }),

  alternarAtivo: (id, ativo) =>
    requisitar(`/eventos/${id}/ativo`, {
      metodo: "PATCH",
      corpo: { ativo },
      autenticado: true,
    }),

  remover: (id) => requisitar(`/eventos/${id}`, { metodo: "DELETE", autenticado: true }),
};

/* ===== Autenticacao ===== */

export const autenticacao = {
  entrar: (email, senha) => requisitar("/auth/login", { metodo: "POST", corpo: { email, senha } }),
  eu: (sinal) => requisitar("/auth/eu", { autenticado: true, sinal }),
};

/* ===== Configuracoes ===== */

export const configuracoes = {
  ler: () => requisitar("/config"),
  salvar: (valores) => requisitar("/config", { metodo: "PUT", corpo: valores, autenticado: true }),
};

/* ===== Rotulos ===== */

// O banco guarda a chave (estavel); a interface mostra o rotulo (pode mudar
// sem migracao). Manter os dois juntos evita rotulo solto pelo codigo.
export const TIPOS_DE_EVENTO = [
  { chave: "MISSA", rotulo: "Missa e Celebração" },
  { chave: "ORACAO", rotulo: "Oração e Espiritualidade" },
  { chave: "JOVENS", rotulo: "Juventude" },
  { chave: "CATEQUESE", rotulo: "Catequese e Formação" },
  { chave: "PEREGRINACAO", rotulo: "Peregrinação" },
  { chave: "ACAO_SOCIAL", rotulo: "Ação Social" },
  { chave: "FESTA", rotulo: "Festa e Quermesse" },
  { chave: "GERAL", rotulo: "Comunidade" },
];

export function rotuloDoTipo(chave) {
  return TIPOS_DE_EVENTO.find((t) => t.chave === chave)?.rotulo || "Comunidade";
}
