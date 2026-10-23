import { Fragment, useEffect, useRef, useState } from "react";

const NUMEROS = [
  { alvo: 25, rotulo: "Anos de história" },
  { alvo: 9, rotulo: "Comunidades" },
  { alvo: 1000, sufixo: "+", rotulo: "Fiéis ativos" },
  { alvo: 365, rotulo: "Dias de missão" },
];

const DURACAO = 2000;

/**
 * Conta de 0 ate o alvo quando a barra entra na tela, uma vez so.
 *
 * A contagem usa requestAnimationFrame com easing cubico (desacelera no fim)
 * em vez de setInterval: assim o numero acompanha a taxa de quadros real da
 * tela e nao engasga em celular.
 */
function useContagem(numeros) {
  const [valores, setValores] = useState(() => numeros.map(() => 0));
  const referenciaDaBarra = useRef(null);

  useEffect(() => {
    const barra = referenciaDaBarra.current;
    if (!barra) return;

    let quadro = 0;
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;
        observador.disconnect();

        let inicio = null;
        function animar(agora) {
          if (inicio === null) inicio = agora;
          const progresso = Math.min((agora - inicio) / DURACAO, 1);
          const suavizado = 1 - Math.pow(1 - progresso, 3);

          setValores(
            numeros.map(({ alvo }) =>
              progresso < 1 ? Math.floor(suavizado * alvo) : alvo,
            ),
          );

          if (progresso < 1) quadro = requestAnimationFrame(animar);
        }
        quadro = requestAnimationFrame(animar);
      },
      { threshold: 0.5 },
    );

    observador.observe(barra);
    return () => {
      observador.disconnect();
      cancelAnimationFrame(quadro);
    };
  }, [numeros]);

  return { valores, referenciaDaBarra };
}

export default function Estatisticas() {
  const { valores, referenciaDaBarra } = useContagem(NUMEROS);

  return (
    <section className="stats-bar" ref={referenciaDaBarra}>
      <div className="container">
        <div className="stats-grid">
          {NUMEROS.map((numero, indice) => (
            // O divisor dourado vem antes de cada item, menos do primeiro.
            <Fragment key={numero.rotulo}>
              {indice > 0 && <div className={`stat-divider reveal delay-${indice * 2}`} />}
              <div className={`stat-item reveal cascata delay-${indice * 2 + 1}`}>
                {/* O numero que conta de 0 ate o alvo e so visual; o leitor de
                    tela le direto o valor final, sem a contagem. */}
                <div className="stat-number" aria-hidden="true">
                  {valores[indice]}
                  {numero.sufixo || ""}
                </div>
                <span className="sr-only">
                  {numero.alvo}
                  {numero.sufixo || ""}
                </span>
                <div className="stat-label">{numero.rotulo}</div>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
