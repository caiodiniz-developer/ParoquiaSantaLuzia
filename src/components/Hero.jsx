import { useEffect, useMemo, useState } from "react";
import { Seta } from "./Icones.jsx";
import VideoDeFundoDoHero from "./VideoDeFundoDoHero.jsx";

const QUANTIDADE_DE_PARTICULAS = 26;

/**
 * As particulas sao sorteadas uma unica vez com useMemo. Se fossem sorteadas
 * a cada render, elas saltariam de lugar sempre que qualquer estado da pagina
 * mudasse -- e o hero re-renderiza a cada scroll por causa da navbar.
 *
 * O sorteio virou poeira suspensa no ar, e nao mais bolhas subindo. Tres coisas
 * mudaram em relacao a versao anterior, e as tres tem o mesmo motivo -- ninguem
 * deve conseguir perceber o padrao:
 *
 * - Duracoes de 18 a 34s (eram de 4 a 8s). Poeira no ar nao tem pressa; o que
 *   subia em seis segundos parecia bolha de refrigerante.
 * - Atraso NEGATIVO. Com atraso positivo, todas as particulas comecam do zero
 *   ao carregar a pagina e sobem em bloco, como uma cortina. Com atraso
 *   negativo cada uma ja nasce no meio do proprio ciclo, e a nuvem esta em
 *   movimento desde o primeiro quadro.
 * - Quanto maior o grao, mais apagado. E o que o olho le como "fora de foco":
 *   o grao grande esta perto da lente, o pequeno esta la no fundo. Sai mais
 *   barato que desfoque de verdade, que custaria uma camada por particula.
 */
function useParticulas() {
  return useMemo(
    () =>
      Array.from({ length: QUANTIDADE_DE_PARTICULAS }, (_, indice) => {
        const tamanho = Math.random() * 3.5 + 1.5;
        // 1 no grao mais fino, 0 no mais grosso.
        const profundidade = 1 - (tamanho - 1.5) / 3.5;
        const brilho = 0.18 + profundidade * 0.45;
        const duracao = Math.random() * 16 + 18;

        return {
          id: indice,
          width: `${tamanho.toFixed(1)}px`,
          height: `${tamanho.toFixed(1)}px`,
          left: `${Math.random() * 100}%`,
          // De 25% para baixo: a poeira sobe, entao quem nasce no topo teria
          // meio segundo de vida antes de sair pela borda.
          top: `${Math.random() * 80 + 25}%`,
          animationDuration: `${duracao.toFixed(1)}s`,
          animationDelay: `-${(Math.random() * duracao).toFixed(1)}s`,
          // Deriva lateral: cada grao pega uma corrente de ar diferente. Sem
          // isto todos sobem em linha reta e paralela, que e o jeito mais
          // rapido de a animacao denunciar que e um laco de CSS.
          "--deriva-x": `${(Math.random() * 90 - 45).toFixed(0)}px`,
          "--brilho": brilho.toFixed(2),
          // Continua servindo de valor de repouso: quando o sistema pede menos
          // movimento a animacao para e sobra esta opacidade.
          opacity: brilho.toFixed(2),
        };
      }),
    [],
  );
}

export default function Hero() {
  const particulas = useParticulas();
  const [carregado, setCarregado] = useState(false);

  // A classe `loaded` dispara a animacao de entrada do titulo. Os 300ms sao os
  // mesmos do site antigo: dao tempo da fonte Cinzel chegar, senao o texto
  // anima com a fonte de sistema e troca no meio.
  useEffect(() => {
    const relogio = setTimeout(() => setCarregado(true), 300);
    return () => clearTimeout(relogio);
  }, []);

  return (
    <section className={`hero${carregado ? " loaded" : ""}`} id="inicio">
      <div className="hero-bg" />
      {/* Entra aqui, entre a foto e o veu escuro: os dois nao tem z-index, entao
          a ordem no DOM ja empilha certo e nao precisamos criar numero novo.
          Enquanto a paroquia nao filmar nada, este componente devolve null e
          nem um elemento vazio sobra no DOM. */}
      <VideoDeFundoDoHero />
      <div className="hero-overlay" />

      {/* As tres camadas de luz vem DEPOIS do veu escuro de proposito: antes
          dele, o proprio veu apagaria o brilho. Santa Luzia e a santa da luz --
          e a metafora que guia a animacao do site inteiro.

          vitral: as pocas de cor que a luz deixa ao atravessar o vidro.
          raios:  os feixes em si, varrendo devagar como o sol da manha.
          luz:    o halo central, que ja existia, e respira. */}
      <div className="hero-vitral" />
      <div className="hero-raios" />
      <div className="hero-luz" />

      <div className="hero-particles">
        {particulas.map(({ id, ...estilo }) => (
          <div key={id} className="particle" style={estilo} />
        ))}
      </div>

      <div className="hero-content">
        <p className="hero-subtitle">Arquidiocese de Campinas/SP</p>
        {/* Cada linha e uma mascara: o texto de dentro sobe por baixo dela na
            abertura. A quebra que antes era um <br /> agora e o proprio bloco. */}
        <h1>
          <span className="hero-linha">
            <span>Seja bem&#8209;vindo ao site da</span>
          </span>
          <span className="hero-linha">
            <span className="hero-nome">Paróquia Santa Luzia!</span>
          </span>
        </h1>
        <p className="hero-desc">
          Jardim dos Oliveiras - Campinas/SP
          <br />
          25 anos iluminando caminhos com fé e amor
        </p>
        <a href="#comunidades" className="hero-cta">
          Conheça nossas comunidades
          <Seta />
        </a>
      </div>

      <div className="hero-scroll">
        <span>EXPLORE</span>
        <Seta tamanho={30} />
      </div>
    </section>
  );
}
