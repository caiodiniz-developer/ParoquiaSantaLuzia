import { useEffect, useRef, useState } from "react";
import { usePrefereMenosMovimento } from "../hooks/usePrefereMenosMovimento.js";

/* eslint-disable no-undef */
/**
 * Lista das fontes que EXISTEM em public/assets, resolvida pelo vite.config.js
 * em tempo de build. Hoje a paroquia nao tem filmagem nenhuma, entao isto e um
 * array vazio e o componente inteiro devolve null: nenhum <video> no DOM,
 * nenhuma requisicao, nenhum erro no console. Ver o comentario longo no
 * vite.config.js para o porque de decidir isso na build e nao no navegador.
 */
const FONTES = __FONTES_DO_VIDEO_DO_HERO__;
/* eslint-enable no-undef */

/**
 * Acima de 768px, e so acima. A decisao de nao baixar video no celular nao e
 * economia preguicosa, sao tres motivos somados:
 *
 * 1. Dados. Boa parte da comunidade usa plano pre-pago; um fundo decorativo nao
 *    pode custar o que custaria assistir a um video que a pessoa escolheu ver.
 * 2. Enquadramento. Um video filmado em paisagem, cortado para uma tela em pe,
 *    mostra uma faixa estreita do meio da cena -- costuma virar uma parede
 *    borrada. A foto de fundo, essa sim, foi enquadrada para isso.
 * 3. Bateria e fluidez. Decodificar video em laco num Android de entrada
 *    concorre com a primeira pintura da pagina, que e o que a pessoa veio ver.
 *
 * 769px e nao 768px de proposito: a navbar antiga usava `max-width: 768px` para
 * trocar a navbar. Se os dois numeros fossem 768, os dois casariam ao mesmo
 * tempo numa tela de exatamente 768px.
 */
const TELA_GRANDE = "(min-width: 769px)";

/** Espera ate 2,5s por um momento ocioso -- mas nunca atrapalha a primeira
 *  pintura. O video e enfeite; o titulo e o conteudo. */
const ESPERA_MAXIMA_ATE_CARREGAR = 2500;

function useConsultaDeMidia(consulta) {
  const [casa, setCasa] = useState(
    () => typeof window !== "undefined" && window.matchMedia(consulta).matches,
  );

  useEffect(() => {
    const media = window.matchMedia(consulta);
    const aoMudar = (evento) => setCasa(evento.matches);

    // Mesmo desvio de usePrefereMenosMovimento: MediaQueryList so ganhou
    // addEventListener no Safari 14, e ha muito aparelho antigo no publico.
    if (media.addEventListener) media.addEventListener("change", aoMudar);
    else media.addListener(aoMudar);

    return () => {
      if (media.removeEventListener) media.removeEventListener("change", aoMudar);
      else media.removeListener(aoMudar);
    };
  }, [consulta]);

  return casa;
}

/**
 * Respeita quem esta contando megabyte. `saveData` e o botao "economia de
 * dados" do Android/Chrome; `effectiveType` mede a velocidade real, e nao a
 * tecnologia declarada -- um 4G lotado no fim de semana da festa da padroeira
 * aparece aqui como "2g".
 *
 * Sem a API (Safari e Firefox nao a tem), assumimos que pode. Presumir o pior
 * tiraria o video de todo iPhone e de todo Firefox para sempre.
 */
function conexaoPermiteVideo() {
  const conexao =
    navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!conexao) return true;
  if (conexao.saveData) return false;
  // Casa com "2g" e com "slow-2g", nao com "3g"/"4g".
  return !/(^|-)2g$/.test(conexao.effectiveType || "");
}

/**
 * Video de fundo do hero.
 *
 * Fica ENTRE a foto de fundo (.hero-bg) e o veu escuro (.hero-overlay), os dois
 * sem z-index proprio -- entao a ordem no DOM ja resolve o empilhamento, sem
 * precisar inventar numero novo. A foto continua atras o tempo todo e faz o
 * papel de poster: o video nasce com opacidade 0 e so aparece, em um segundo e
 * meio, depois que o navegador confirma que esta de fato desenhando quadros.
 * Se o arquivo estiver corrompido, se o codec nao existir naquele navegador ou
 * se o autoplay for recusado, ele nunca aparece e o visitante ve exatamente o
 * hero de hoje.
 */
export default function VideoDeFundoDoHero() {
  const menosMovimento = usePrefereMenosMovimento();
  const telaGrande = useConsultaDeMidia(TELA_GRANDE);
  const referencia = useRef(null);
  const [tocando, setTocando] = useState(false);

  // Medido uma vez, na montagem. Reavaliar a cada mudanca de conexao so serviria
  // para comecar um download no meio da visita -- justamente o que quem ligou a
  // economia de dados nao quer.
  const [conexaoBoa] = useState(conexaoPermiteVideo);

  const podeTocar = FONTES.length > 0 && !menosMovimento && telaGrande && conexaoBoa;

  useEffect(() => {
    const video = referencia.current;
    if (!video || !podeTocar) return undefined;

    // O React nem sempre reflete `muted` do JSX como propriedade do elemento, e
    // video sem mudo tem o autoplay bloqueado por TODO navegador. Reforcamos.
    video.muted = true;

    let cancelado = false;

    function tentarTocar() {
      // Nada de tocar antes de existir fonte, e nada de insistir depois que o
      // elemento ja foi desmontado.
      if (cancelado || !video.src) return;
      // play() devolve uma Promise que REJEITA em silencio (modo de baixa
      // energia do iOS, autoplay negado). Sem o catch vira "unhandled rejection"
      // vermelho no console de quem so queria ver a missa de domingo.
      const promessa = video.play();
      if (promessa && promessa.catch) promessa.catch(() => {});
    }

    function comecarACarregar() {
      if (cancelado) return;
      // Escolhemos UMA fonte em vez de listar varios <source>. Com <source> o
      // Safari abre uma conexao para o WEBM antes de descobrir que nao sabe
      // toca-lo; aqui ele nem chega a pedir o arquivo.
      const fonte =
        FONTES.find((f) => video.canPlayType(f.tipo) !== "") || FONTES[FONTES.length - 1];
      video.preload = "auto";
      video.src = fonte.url;
      video.load();
      tentarTocar();
    }

    const temOcioso = typeof window.requestIdleCallback === "function";
    const agenda = temOcioso
      ? window.requestIdleCallback(comecarACarregar, {
          timeout: ESPERA_MAXIMA_ATE_CARREGAR,
        })
      : window.setTimeout(comecarACarregar, 600);

    // Video rodando fora da tela gasta bateria e decodificador para desenhar o
    // que ninguem esta olhando. O hero some da vista logo na primeira rolagem.
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) tentarTocar();
        else video.pause();
      },
      { threshold: 0.01 },
    );
    observador.observe(video);

    return () => {
      cancelado = true;
      if (temOcioso) window.cancelIdleCallback(agenda);
      else window.clearTimeout(agenda);
      observador.disconnect();
      video.pause();
      // Solta o download que estiver em curso. Sem isto, sair da pagina em
      // conexao ruim deixaria megabytes ainda descendo. removeAttribute + load()
      // e a forma que nao dispara evento de erro (src="" dispara).
      video.removeAttribute("src");
      video.load();
    };
  }, [podeTocar]);

  if (!podeTocar) return null;

  return (
    <video
      ref={referencia}
      className={`hero-video${tocando ? " tocando" : ""}`}
      // preload="none" e proposital: quem manda carregar e o efeito acima,
      // depois que a pagina respirou.
      preload="none"
      muted
      loop
      playsInline
      disablePictureInPicture
      // Enfeite nao entra na navegacao por teclado nem e anunciado por leitor
      // de tela: nao ha informacao nenhuma nele que o texto ao lado nao diga.
      tabIndex={-1}
      aria-hidden="true"
      // `playing` e nao `canplay`: garante que ha quadro desenhado antes de
      // revelar. Com canplay da para aparecer um retangulo preto por um instante.
      onPlaying={() => setTocando(true)}
      onError={() => setTocando(false)}
    />
  );
}
