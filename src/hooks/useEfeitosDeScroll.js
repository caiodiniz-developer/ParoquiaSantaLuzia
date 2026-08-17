import { useEffect, useState } from "react";

/**
 * Junta num unico listener de scroll tudo o que o main.js antigo fazia em
 * quatro listeners separados: navbar encolhendo, barra de progresso, botao
 * de voltar ao topo, link ativo no menu e parallax do hero.
 *
 * Motivo de juntar: cada listener separado dispara seu proprio reflow. Com um
 * so, lemos a posicao uma vez por frame via requestAnimationFrame.
 */
export function useEfeitosDeScroll(idsDasSecoes) {
  const [rolou, setRolou] = useState(false);
  const [mostrarTopo, setMostrarTopo] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [secaoAtiva, setSecaoAtiva] = useState("inicio");

  useEffect(() => {
    let aguardandoFrame = false;

    const menosMovimento = window.matchMedia("(prefers-reduced-motion: reduce)");

    // As camadas do hero sao buscadas uma unica vez. Procurar no DOM dentro de
    // medir() custaria cinco querySelector por quadro de scroll.
    const heroFundo = document.querySelector(".hero-bg");
    // Pode nao existir: o <video> so entra no DOM quando a paroquia tiver
    // colocado o arquivo E o aparelho/conexao/preferencia permitirem. Nos casos
    // em que existe, ele esta no DOM desde a primeira renderizacao do Hero
    // (nasce sem `src`, quem carrega e um efeito depois) -- por isso esta busca
    // unica no inicio o encontra, sem precisar procurar de novo a cada quadro.
    const heroVideo = document.querySelector(".hero-video");
    const heroLuz = document.querySelector(".hero-luz");
    const heroParticulas = document.querySelector(".hero-particles");
    const heroConteudo = document.querySelector(".hero-content");

    function medir() {
      const y = window.scrollY;

      setRolou(y > 100);
      setMostrarTopo(y > 500);

      const alturaRolavel =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgresso(alturaRolavel > 0 ? (y / alturaRolavel) * 100 : 0);

      // O +200 compensa a navbar fixa: a secao so conta como ativa quando ja
      // passou de baixo dela, senao o link acende cedo demais.
      const marca = y + 200;
      for (const id of idsDasSecoes) {
        const secao = document.getElementById(id);
        if (!secao) continue;
        if (marca >= secao.offsetTop && marca < secao.offsetTop + secao.offsetHeight) {
          setSecaoAtiva(id);
          break;
        }
      }

      // Profundidade do hero: quatro camadas com velocidades diferentes.
      // O fundo desfocado e o mais lento (parece o mais distante), a luz vem
      // logo depois, as particulas sao as mais rapidas (parecem estar na
      // frente do observador) e o texto sobe devagar enquanto se apaga, como
      // quem se afasta de uma vela. So mexe enquanto o hero esta em tela.
      const alturaDaTela = window.innerHeight;
      if (!menosMovimento.matches && y < alturaDaTela) {
        const fundo = `scale(1.05) translateY(${y * 0.3}px)`;
        if (heroFundo) heroFundo.style.transform = fundo;
        // Exatamente o mesmo deslocamento da foto, e nao um proprio: os dois
        // ocupam a mesma profundidade da cena. Qualquer diferenca apareceria
        // como um deslizamento entre a foto e o video durante a transicao de
        // opacidade entre eles.
        if (heroVideo) heroVideo.style.transform = fundo;
        if (heroLuz) heroLuz.style.transform = `translate3d(0, ${y * 0.14}px, 0)`;
        if (heroParticulas) {
          heroParticulas.style.transform = `translate3d(0, ${y * 0.45}px, 0)`;
        }
        if (heroConteudo) {
          heroConteudo.style.transform = `translate3d(0, ${y * 0.18}px, 0)`;
          // Divisor generoso: o texto continua legivel durante quase toda a
          // primeira tela e so some quando ja saiu de vista.
          heroConteudo.style.opacity = String(Math.max(0, 1 - y / (alturaDaTela * 0.9)));
        }
      }

      aguardandoFrame = false;
    }

    function aoRolar() {
      if (aguardandoFrame) return;
      aguardandoFrame = true;
      requestAnimationFrame(medir);
    }

    medir();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, [idsDasSecoes]);

  return { rolou, mostrarTopo, progresso, secaoAtiva };
}
