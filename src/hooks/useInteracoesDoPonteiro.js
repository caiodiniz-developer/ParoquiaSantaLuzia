import { useEffect } from "react";

/** Cartoes que ganham o foco de luz seguindo o ponteiro (--mx/--my no CSS) e
 *  a inclinacao 3D (--rx/--ry). */
const SELETOR_DE_FOCO =
  ".liturgia-card, .horario-card, .evento-card, .community-card, .pix-info-card, .secretaria-grid > div";

/** Botoes que sao "puxados" de leve na direcao do ponteiro. */
const SELETOR_MAGNETICO = ".hero-cta, .btn-whatsapp, .redes-links a, .back-to-top, .liturgia-btn, .pix-copy-btn";

/** Tudo o que faz o anel do cursor crescer. */
const SELETOR_INTERATIVO = "a, button, select, input, textarea, [role='button'], .community-card";

/** Fracao da distancia ate o centro que o botao acompanha. */
const FORCA_DO_IMA = 0.28;

/** Inclinacao maxima dos cartoes, em graus. Pouca: e um respiro, nao um brinquedo. */
const INCLINACAO_MAXIMA = 6;

/** Quanto do caminho o anel percorre a cada quadro. Menor = mais preguicoso. */
const SUAVIDADE_DO_ANEL = 0.18;

/**
 * Efeitos de ponteiro num unico listener:
 *
 * 1. A luz do cursor (.luz-do-cursor) segue o mouse pela pagina, e o anel
 *    (.cursor-anel) vai atras dele com um pequeno atraso.
 * 2. A posicao normalizada do mouse (-1 a 1) vai para --cursor-nx/--cursor-ny,
 *    que as camadas de luz do hero usam para ganhar profundidade.
 * 3. O cartao sob o ponteiro recebe --mx/--my (brilho) e --rx/--ry (inclinacao).
 * 4. Os botoes magneticos se deslocam alguns pixels na direcao do mouse.
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
    const anel = document.querySelector(".cursor-anel");
    const raiz = document.documentElement;
    let ultimoEvento = null;
    let aguardandoFrame = false;
    let imaAtual = null;

    // O anel tem o seu proprio laco: ele continua andando ate alcancar o mouse
    // mesmo depois que o mouse para.
    const alvoDoAnel = { x: -100, y: -100 };
    const posicaoDoAnel = { x: -100, y: -100 };
    let quadroDoAnel = 0;

    function moverAnel() {
      posicaoDoAnel.x += (alvoDoAnel.x - posicaoDoAnel.x) * SUAVIDADE_DO_ANEL;
      posicaoDoAnel.y += (alvoDoAnel.y - posicaoDoAnel.y) * SUAVIDADE_DO_ANEL;
      if (anel) {
        anel.style.transform = `translate3d(${posicaoDoAnel.x.toFixed(1)}px, ${posicaoDoAnel.y.toFixed(1)}px, 0)`;
      }
      const longe =
        Math.abs(alvoDoAnel.x - posicaoDoAnel.x) > 0.1 || Math.abs(alvoDoAnel.y - posicaoDoAnel.y) > 0.1;
      quadroDoAnel = longe ? requestAnimationFrame(moverAnel) : 0;
    }

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
      raiz.style.setProperty("--cursor-nx", ((x / window.innerWidth) * 2 - 1).toFixed(3));
      raiz.style.setProperty("--cursor-ny", ((y / window.innerHeight) * 2 - 1).toFixed(3));
      if (luz) luz.classList.add("ativa");

      alvoDoAnel.x = x;
      alvoDoAnel.y = y;
      if (anel) anel.classList.add("ativa");
      if (!quadroDoAnel) quadroDoAnel = requestAnimationFrame(moverAnel);

      const alvo = target instanceof Element ? target : null;

      if (anel) anel.classList.toggle("sobre", Boolean(alvo?.closest(SELETOR_INTERATIVO)));

      const cartao = alvo?.closest(SELETOR_DE_FOCO);
      if (cartao) {
        const area = cartao.getBoundingClientRect();
        const px = (x - area.left) / area.width;
        const py = (y - area.top) / area.height;
        cartao.style.setProperty("--mx", `${px * 100}%`);
        cartao.style.setProperty("--my", `${py * 100}%`);
        // Mouse na direita inclina a borda direita para longe; embaixo, a de baixo.
        cartao.style.setProperty("--ry", `${((px - 0.5) * 2 * INCLINACAO_MAXIMA).toFixed(2)}deg`);
        cartao.style.setProperty("--rx", `${((0.5 - py) * 2 * INCLINACAO_MAXIMA).toFixed(2)}deg`);
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
      if (anel) anel.classList.remove("ativa");
      soltarIma();
    }

    function aoPressionar() {
      if (anel) anel.classList.add("pressionado");
    }

    function aoSoltar() {
      if (anel) anel.classList.remove("pressionado");
    }

    window.addEventListener("pointermove", aoMover, { passive: true });
    window.addEventListener("pointerdown", aoPressionar, { passive: true });
    window.addEventListener("pointerup", aoSoltar, { passive: true });
    document.addEventListener("pointerleave", aoSair);

    return () => {
      window.removeEventListener("pointermove", aoMover);
      window.removeEventListener("pointerdown", aoPressionar);
      window.removeEventListener("pointerup", aoSoltar);
      document.removeEventListener("pointerleave", aoSair);
      cancelAnimationFrame(quadroDoAnel);
      soltarIma();
      if (luz) luz.classList.remove("ativa");
      if (anel) anel.classList.remove("ativa", "sobre", "pressionado");
    };
  }, [ativo]);
}
