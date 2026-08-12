import { useCallback, useEffect, useState } from "react";
import { eventos as apiEventos } from "../lib/api.js";

/**
 * Carrega eventos da API.
 *
 * A API roda no plano gratuito do Render, que derruba a instancia depois de
 * 15 minutos parada. A primeira visita do dia espera ~30s pela subida. Por
 * isso existe `acordando`: passados 4 segundos sem resposta o site avisa que
 * esta acordando o servidor, em vez de parecer travado.
 */
export function useEventos({ escopo = "proximos", limite, incluirInativos = false } = {}) {
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [acordando, setAcordando] = useState(false);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(
    async (sinal) => {
      setCarregando(true);
      setErro(null);

      const avisoDeDemora = setTimeout(() => setAcordando(true), 4000);

      try {
        const dados = await apiEventos.listar({ escopo, limite, incluirInativos, sinal });
        setLista(Array.isArray(dados) ? dados : []);
      } catch (falha) {
        if (falha.name === "AbortError") return;
        setErro(falha);
      } finally {
        clearTimeout(avisoDeDemora);
        setAcordando(false);
        setCarregando(false);
      }
    },
    [escopo, limite, incluirInativos],
  );

  useEffect(() => {
    const controle = new AbortController();
    carregar(controle.signal);
    return () => controle.abort();
  }, [carregar]);

  /**
   * Recarrega quando a aba volta a ficar visivel.
   *
   * O fluxo real de quem cuida do site e: deixa o site aberto numa aba,
   * cadastra o evento na outra, volta para conferir. Sem isto a primeira aba
   * continua mostrando a lista de antes e parece que o cadastro nao funcionou.
   */
  useEffect(() => {
    function aoVoltar() {
      if (document.visibilityState === "visible") carregar();
    }
    document.addEventListener("visibilitychange", aoVoltar);
    return () => document.removeEventListener("visibilitychange", aoVoltar);
  }, [carregar]);

  return { eventos: lista, carregando, acordando, erro, recarregar: () => carregar() };
}
