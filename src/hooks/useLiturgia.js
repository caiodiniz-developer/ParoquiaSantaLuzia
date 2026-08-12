import { useEffect, useState } from "react";

const API_PRINCIPAL = "https://liturgia.up.railway.app/v2/";
const API_RESERVA = "https://api-liturgia-diaria.vercel.app/";

const CORES_LITURGICAS = {
  Roxo: "#8B008B",
  Verde: "#1a5c2a",
  Branco: "#888",
  Vermelho: "#8b1a1a",
  Rosa: "#DB7093",
};

export function corLiturgica(cor) {
  return CORES_LITURGICAS[cor] || "#666";
}

/** Quebra o texto corrido da API em paragrafos, descartando linhas vazias. */
function emParagrafos(texto) {
  if (!texto) return [];
  return texto
    .split("\n")
    .map((linha) => linha.trim().replace(/^[-—]\s*/, ""))
    .filter(Boolean);
}

function normalizarPrincipal(dados) {
  const evangelho = dados?.leituras?.evangelho?.[0];
  const salmo = dados?.leituras?.salmo?.[0];

  return {
    data: dados?.data || "",
    nomeDaLiturgia: dados?.liturgia || "",
    cor: dados?.cor || "",
    evangelho: {
      referencia: evangelho?.referencia || "Evangelho do dia",
      paragrafos: emParagrafos(evangelho?.texto),
    },
    salmo: {
      referencia: salmo?.referencia || "Salmo do dia",
      paragrafos: emParagrafos(salmo?.texto),
      refrao: salmo?.refrao || "",
    },
  };
}

function normalizarReserva(dados) {
  return {
    data: dados?.data || "Hoje",
    nomeDaLiturgia: "",
    cor: "",
    evangelho: {
      referencia: dados?.referencia_evangelho || "Evangelho do dia",
      paragrafos: emParagrafos(dados?.evangelho),
    },
    salmo: {
      referencia: dados?.referencia_salmo || "Salmo do dia",
      paragrafos: emParagrafos(dados?.salmo),
      refrao: dados?.refrao || "",
    },
  };
}

/**
 * Le a liturgia do dia. Sao duas APIs publicas de terceiros: se a principal
 * cair, tenta a reserva antes de desistir. O componente nunca fica sem estado
 * definido -- ou tem `liturgia`, ou `erro`.
 */
export function useLiturgia() {
  const [liturgia, setLiturgia] = useState(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    // Se o componente sair da tela antes da resposta, abortamos a requisicao
    // em vez de chamar setState num componente desmontado.
    const controle = new AbortController();

    async function buscar() {
      try {
        const resposta = await fetch(API_PRINCIPAL, { signal: controle.signal });
        if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
        setLiturgia(normalizarPrincipal(await resposta.json()));
        return;
      } catch (falhaPrincipal) {
        if (falhaPrincipal.name === "AbortError") return;
        console.warn("Liturgia: API principal falhou, tentando a reserva.", falhaPrincipal);
      }

      try {
        const hoje = new Date().toISOString().split("T")[0];
        const resposta = await fetch(`${API_RESERVA}?date=${hoje}`, {
          signal: controle.signal,
        });
        if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
        setLiturgia(normalizarReserva(await resposta.json()));
      } catch (falhaReserva) {
        if (falhaReserva.name === "AbortError") return;
        console.error("Liturgia indisponivel.", falhaReserva);
        setErro(true);
      }
    }

    buscar();
    return () => controle.abort();
  }, []);

  return { liturgia, erro, carregando: !liturgia && !erro };
}
