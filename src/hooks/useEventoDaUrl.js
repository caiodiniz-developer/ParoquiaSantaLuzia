import { useCallback, useEffect, useState } from "react";
import { eventos as apiEventos, apiConfigurada } from "../lib/api.js";

const PARAMETRO = "evento";

function idNaUrl() {
  return new URLSearchParams(window.location.search).get(PARAMETRO);
}

/** Troca o ?evento= da barra de endereco sem recarregar nem criar historico. */
function escreverNaUrl(id) {
  const url = new URL(window.location.href);
  if (id) url.searchParams.set(PARAMETRO, id);
  else url.searchParams.delete(PARAMETRO);
  window.history.replaceState(window.history.state, "", url);
}

/**
 * Evento aberto no modal, espelhado na URL (`/?evento=ID`).
 *
 * E o que torna um evento compartilhavel: o link que vai no post do
 * Instagram ou no grupo do WhatsApp abre o site ja com aquele evento na tela,
 * em vez de jogar a pessoa no topo da pagina para procurar.
 *
 * O evento do link e buscado direto na API, e nao na lista carregada: ele
 * pode nem estar entre os "proximos" (um evento que ja passou e foi
 * compartilhado semana passada continua abrindo).
 */
export function useEventoDaUrl() {
  const [eventoAberto, setEventoAberto] = useState(null);

  useEffect(() => {
    const id = idNaUrl();
    if (!id || !apiConfigurada) return undefined;

    let ativo = true;
    apiEventos
      .buscar(id)
      .then((evento) => {
        if (!ativo) return;
        setEventoAberto(evento);
        document.getElementById("eventos")?.scrollIntoView();
      })
      // Link velho de evento apagado: limpa a URL em silencio. Mostrar erro a
      // quem so queria abrir o site seria pior que nao abrir o modal.
      .catch(() => ativo && escreverNaUrl(null));

    return () => {
      ativo = false;
    };
  }, []);

  const abrir = useCallback((evento) => {
    setEventoAberto(evento);
    escreverNaUrl(evento.id);
  }, []);

  const fechar = useCallback(() => {
    setEventoAberto(null);
    escreverNaUrl(null);
  }, []);

  return { eventoAberto, abrir, fechar };
}
