import { useEffect, useState } from "react";

const CONSULTA = "(prefers-reduced-motion: reduce)";

/**
 * Le a preferencia de "menos movimento" do sistema operacional e reage quando
 * ela muda com a pagina aberta.
 *
 * Existe como hook, e nao apenas como @media no CSS, porque duas decisoes
 * dependem dela em JavaScript e nao dariam para resolver so com estilo:
 *
 * 1. O parallax escreve transform a cada quadro de scroll. Melhor nem instalar
 *    o listener do que instalar e depois anular no CSS.
 * 2. O carrossel de comunidades roda infinito. Simplesmente parar a animacao
 *    deixaria a maior parte das comunidades fora da tela, sem nenhuma forma de
 *    alcanca-las -- entao a lista precisa ser renderizada de outro jeito.
 */
export function usePrefereMenosMovimento() {
  const [prefere, setPrefere] = useState(
    () => typeof window !== "undefined" && window.matchMedia(CONSULTA).matches,
  );

  useEffect(() => {
    const consulta = window.matchMedia(CONSULTA);
    const aoMudar = (evento) => setPrefere(evento.matches);

    // Safari so ganhou addEventListener em MediaQueryList na versao 14. Sem
    // este desvio, um iPhone antigo lancaria TypeError aqui e derrubaria a
    // pagina inteira -- e o publico da paroquia tem muito aparelho antigo.
    if (consulta.addEventListener) consulta.addEventListener("change", aoMudar);
    else consulta.addListener(aoMudar);

    return () => {
      if (consulta.removeEventListener) consulta.removeEventListener("change", aoMudar);
      else consulta.removeListener(aoMudar);
    };
  }, []);

  return prefere;
}
