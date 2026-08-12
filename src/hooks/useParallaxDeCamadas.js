import { useEffect } from "react";

/**
 * Camadas que se deslocam mais devagar que o scroll.
 *
 * A velocidade e a fracao do deslocamento: 0.10 quer dizer que a camada anda
 * 10% do que o resto da pagina anda. Valores baixos de proposito -- o efeito
 * aqui e de profundidade e serenidade, nao de movimento chamativo.
 *
 * `variavel` separa dois grupos que nao podem se misturar. Variaveis CSS sao
 * herdadas: se a secao e a imagem dentro dela usassem o mesmo nome, a imagem
 * herdaria o valor da secao nos instantes em que ainda nao tivesse o seu
 * proprio -- e daria um salto visivel.
 */
const CAMADAS = [
  // Imagens: sobem devagar enquanto o texto ao lado acompanha o scroll.
  { seletor: ".santa-img-wrap .img-frame", velocidade: 0.07, variavel: "--parallax-y" },
  { seletor: ".padroeira-img .img-wrap", velocidade: 0.06, variavel: "--parallax-y" },

  // Halos de luz das secoes (o ::after de cada uma, em animacoes.css).
  { seletor: ".santa-section", velocidade: 0.1, variavel: "--luz-y" },
  { seletor: ".comunidades-section", velocidade: 0.1, variavel: "--luz-y" },
  { seletor: ".liturgia-section", velocidade: 0.1, variavel: "--luz-y" },
  { seletor: ".horarios-section", velocidade: 0.13, variavel: "--luz-y" },
  { seletor: ".padroeira-section", velocidade: 0.1, variavel: "--luz-y" },
  { seletor: ".doe-section", velocidade: 0.09, variavel: "--luz-y" },
];

// Comeca a acompanhar a camada bem antes de ela aparecer: se so comecasse ao
// entrar na tela, ela entraria com deslocamento zero e "pularia" para o lugar
// certo no primeiro quadro.
const MARGEM_DE_ANTECEDENCIA = "40% 0px 40% 0px";

/**
 * Escreve o deslocamento de cada camada numa variavel CSS. O JavaScript so
 * calcula o numero; quem decide o que fazer com ele e o animacoes.css.
 *
 * A divisao importa por um motivo pratico: se este hook nao rodar (preferencia
 * de menos movimento, navegador antigo, erro de rede), a variavel cai no valor
 * padrao 0px e a pagina fica exatamente como sempre foi.
 *
 * Este listener de scroll e separado do de useEfeitosDeScroll de proposito:
 * aquele guarda estado do React e re-renderiza a pagina; este nunca toca em
 * estado, so escreve estilo. Juntar os dois obrigaria o parallax a passar pelo
 * ciclo de render do React a cada quadro.
 */
export function useParallaxDeCamadas(ativo = true, deps = []) {
  useEffect(() => {
    const camadas = new Map();
    CAMADAS.forEach(({ seletor, velocidade, variavel }) => {
      document.querySelectorAll(seletor).forEach((elemento) => {
        camadas.set(elemento, { velocidade, variavel });
      });
    });

    function limpar() {
      camadas.forEach(({ variavel }, elemento) => elemento.style.removeProperty(variavel));
    }

    // Quem liga "menos movimento" com a pagina ja aberta precisa ver as camadas
    // voltarem ao lugar, e nao congelarem no ultimo deslocamento.
    if (!ativo || camadas.size === 0) {
      limpar();
      return;
    }

    const naTela = new Set();
    let aguardandoFrame = false;

    function medir() {
      aguardandoFrame = false;
      const meioDaTela = window.innerHeight / 2;

      // Duas passadas: primeiro so leituras, depois so escritas. Intercalar
      // getBoundingClientRect com escrita de estilo obriga o navegador a
      // recalcular o layout a cada elemento (layout thrashing) e e a diferenca
      // entre 60fps e engasgo em celular simples.
      const medidas = [];
      naTela.forEach((elemento) => {
        const area = elemento.getBoundingClientRect();
        const distanciaDoCentro = area.top + area.height / 2 - meioDaTela;
        medidas.push([elemento, -distanciaDoCentro * camadas.get(elemento).velocidade]);
      });

      medidas.forEach(([elemento, deslocamento]) => {
        elemento.style.setProperty(
          camadas.get(elemento).variavel,
          `${deslocamento.toFixed(1)}px`,
        );
      });
    }

    function agendar() {
      if (aguardandoFrame) return;
      aguardandoFrame = true;
      requestAnimationFrame(medir);
    }

    // So mede o que esta perto da tela. Sem isto, cada quadro leria a posicao
    // de todas as camadas da pagina, inclusive as que ninguem esta vendo.
    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) naTela.add(entrada.target);
          else naTela.delete(entrada.target);
        });
        agendar();
      },
      { rootMargin: MARGEM_DE_ANTECEDENCIA },
    );

    camadas.forEach((_, elemento) => observador.observe(elemento));

    window.addEventListener("scroll", agendar, { passive: true });
    window.addEventListener("resize", agendar, { passive: true });
    agendar();

    return () => {
      observador.disconnect();
      window.removeEventListener("scroll", agendar);
      window.removeEventListener("resize", agendar);
      limpar();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ativo, ...deps]);
}
