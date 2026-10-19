import { useEffect } from "react";

/** Cartoes que ganham o foco de luz seguindo o ponteiro (--mx/--my no CSS). */
const SELETOR_DE_FOCO = ".liturgia-card, .horario-card, .evento-card";

/** Botoes que sao "puxados" de leve na direcao do ponteiro. */
const SELETOR_MAGNETICO = ".hero-cta, .btn-whatsapp, .redes-links a, .back-to-top, .liturgia-btn";

/** Fracao da distancia ate o centro que o botao acompanha. */
const FORCA_DO_IMA = 0.28;

/**
 * Tres efeitos de ponteiro num unico listener:
 *
 * 1. A luz do cursor (.luz-do-cursor) segue o mouse pela pagina.
 * 2. O cartao sob o ponteiro recebe a posicao relativa em --mx/--my, que o CSS
 *    usa para desenhar o brilho exatamente onde o mouse esta.
 * 3. Os botoes magneticos se deslocam alguns pixels na direcao do mouse.
 *
 * O ima usa a propriedade `translate`, e nao `transform`: assim ele soma com o
 * transform do hover e da revelacao em vez de apaga-los.
 *
 * So instala com mouse de verdade. Em tela de toque nao ha ponteiro pairando,
 * e o primeiro toque deixaria o botao preso fora do lugar.
 */
export function useInteracoesDoPonteiro(ativo = true) {
  useEffect(() => {
    const temMouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!ativo || !temMouse) return undefined;

    const luz = document.querySelector(".luz-do-cursor");
    const raiz = document.documentElement;
    let ultimoEvento = null;
    let aguardandoFrame = false;
    let imaAtual = null;

    function soltarIma() {
      if (imaAtual) imaAtual.style.translate = "";
      imaAtual = null;
    }

    function aplicar() {
      aguardandoFrame = false;
      const evento = ultimoEvento;
      if (!evento) return;
      const { clientX: x, clientY: y, target } = evento;

      raiz.style.setProperty("--cursor-x", `${x}px`);
      raiz.style.setProperty("--cursor-y", `${y}px`);
      if (luz) luz.classList.add("ativa");

      const alvo = target instanceof Element ? target : null;

      const cartao = alvo?.closest(SELETOR_DE_FOCO);
      if (cartao) {
        const area = cartao.getBoundingClientRect();
        cartao.style.setProperty("--mx", `${((x - area.left) / area.width) * 100}%`);
        cartao.style.setProperty("--my", `${((y - area.top) / area.height) * 100}%`);
      }

      const ima = alvo?.closest(SELETOR_MAGNETICO);
      if (ima !== imaAtual) soltarIma();
      if (ima) {
        const area = ima.getBoundingClientRect();
        const dx = (x - (area.left + area.width / 2)) * FORCA_DO_IMA;
        const dy = (y - (area.top + area.height / 2)) * FORCA_DO_IMA;
        ima.style.translate = `${dx.toFixed(1)}px ${dy.toFixed(1)}px`;
        imaAtual = ima;
      }
    }

    function aoMover(evento) {
      ultimoEvento = evento;
      if (aguardandoFrame) return;
      aguardandoFrame = true;
      requestAnimationFrame(aplicar);
    }

    function aoSair() {
      if (luz) luz.classList.remove("ativa");
      soltarIma();
    }

    window.addEventListener("pointermove", aoMover, { passive: true });
    document.addEventListener("pointerleave", aoSair);

    return () => {
      window.removeEventListener("pointermove", aoMover);
      document.removeEventListener("pointerleave", aoSair);
      soltarIma();
      if (luz) luz.classList.remove("ativa");
    };
  }, [ativo]);
}
