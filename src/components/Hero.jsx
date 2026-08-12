import { useEffect, useMemo, useState } from "react";
import { Seta } from "./Icones.jsx";

const QUANTIDADE_DE_PARTICULAS = 20;

/**
 * As particulas sao sorteadas uma unica vez com useMemo. Se fossem sorteadas
 * a cada render, elas saltariam de lugar sempre que qualquer estado da pagina
 * mudasse -- e o hero re-renderiza a cada scroll por causa da navbar.
 */
function useParticulas() {
  return useMemo(
    () =>
      Array.from({ length: QUANTIDADE_DE_PARTICULAS }, (_, indice) => {
        const tamanho = Math.random() * 6 + 3;
        return {
          id: indice,
          width: `${tamanho}px`,
          height: `${tamanho}px`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDuration: `${Math.random() * 4 + 4}s`,
          animationDelay: `${Math.random() * 3}s`,
          opacity: Math.random() * 0.4 + 0.1,
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
      <div className="hero-overlay" />
      {/* Camada de luz. Vem DEPOIS do overlay escuro de proposito: antes dele,
          o proprio overlay apagaria o brilho. Santa Luzia e a santa da luz --
          e a metafora que guia a animacao do site inteiro. */}
      <div className="hero-luz" />
      <div className="hero-particles">
        {particulas.map(({ id, ...estilo }) => (
          <div key={id} className="particle" style={estilo} />
        ))}
      </div>

      <div className="hero-content">
        <p className="hero-subtitle">Arquidiocese de Campinas/SP</p>
        <h1>
          Seja bem-vindo ao site da
          <br />
          <span>Paróquia Santa Luzia!</span>
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
