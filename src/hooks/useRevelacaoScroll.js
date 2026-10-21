import { useEffect } from "react";

const SELETOR = ".reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-rotate";

/**
 * Porta o scroll reveal do main.js antigo. O CSS continua igual: os elementos
 * nascem transparentes e a classe `visible` dispara a transicao.
 *
 * A diferenca em relacao ao original e o `deps`: os cards de evento chegam da
 * API depois da primeira renderizacao, e o observer original so rodava uma vez
 * no DOMContentLoaded -- os cards ficariam invisiveis para sempre.
 *
 * REGRA para quem usar `.reveal*`: o className desse elemento nao pode mudar
 * depois de montado. O `.visible` e posto direto no DOM, fora do React; se o
 * className mudar (um `expanded`, um `ativo`), o React reescreve a lista
 * inteira, apaga o `.visible` e o elemento some. Estado que muda a classe vai
 * num elemento de dentro -- ver CartaoDaLiturgia, que caiu exatamente nisso.
 */
export function useRevelacaoScroll(deps = []) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            entrada.target.classList.add("visible");
            // Uma vez revelado, o elemento nao volta atras. Parar de observar
            // evita recalculo em cada scroll numa pagina com ~80 elementos.
            observer.unobserve(entrada.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );

    document.querySelectorAll(SELETOR).forEach((el) => {
      if (!el.classList.contains("visible")) observer.observe(el);
    });

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
