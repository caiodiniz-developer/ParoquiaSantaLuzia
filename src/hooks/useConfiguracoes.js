import { useEffect, useState } from "react";
import { configuracoes as apiConfiguracoes, apiConfigurada } from "../lib/api.js";

/** Os mesmos padroes do servidor (config.rotas.ts), usados ate a API responder. */
export const CONFIGURACOES_PADRAO = {
  eventosNaHome: 6,
  mostrarRealizados: false,
};

/**
 * Ajustes do site salvos pelo painel.
 *
 * Comeca com os padroes e troca quando a API responde. Se a API falhar, os
 * padroes continuam valendo: uma configuracao que nao carregou nao pode
 * esconder os eventos do site.
 */
export function useConfiguracoes() {
  const [valores, setValores] = useState(CONFIGURACOES_PADRAO);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    if (!apiConfigurada) {
      setCarregado(true);
      return undefined;
    }

    let ativo = true;
    apiConfiguracoes
      .ler()
      .then((dados) => ativo && setValores({ ...CONFIGURACOES_PADRAO, ...dados }))
      .catch(() => {})
      .finally(() => ativo && setCarregado(true));

    return () => {
      ativo = false;
    };
  }, []);

  return { configuracoes: valores, carregado, setConfiguracoes: setValores };
}
