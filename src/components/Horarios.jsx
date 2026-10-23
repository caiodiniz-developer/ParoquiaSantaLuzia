import PalavrasMascaradas from "./PalavrasMascaradas.jsx";
import { useRelogio } from "../hooks/useRelogio.js";

const CARTOES = [
  { icone: "☩", dia: "Domingo", diaDaSemana: 0, linhas: ["7h: Missa", "10h: Missa"] },
  {
    icone: "☸",
    dia: "Quarta-feira",
    diaDaSemana: 3,
    linhas: ["7h30: Missa com Novena de N. Sra. do Perpétuo Socorro"],
  },
  {
    icone: "✠",
    dia: "Sexta-feira",
    diaDaSemana: 5,
    linhas: ["1ª sexta: 7h30 Missa do Sagrado Coração", "19h: Terço dos Homens"],
  },
  {
    icone: "☟",
    dia: "Sábado",
    diaDaSemana: 6,
    linhas: ["18h30: Missa", "9h: Aula de Violão", "10h: Técnica Vocal"],
  },
];

export default function Horarios() {
  const { diaDaSemana: hoje } = useRelogio();

  return (
    <section className="horarios-section" id="horarios">
      <div className="container">
        <div className="reveal cascata" style={{ textAlign: "center" }}>
          <div className="section-cross">&#10016;</div>
          <h2 className="horarios-title">
            <PalavrasMascaradas>Horários Rápidos - Igreja Matriz</PalavrasMascaradas>
          </h2>
          <p className="horarios-sub">Rua René Fernandes, n. 71 - Jardim dos Oliveiras</p>
        </div>

        <div className="horarios-grid">
          {CARTOES.map((cartao, indice) => (
            <div
              className={`horario-card reveal cascata delay-${indice + 1}`}
              key={cartao.dia}
              // Atributo, e nao classe: o className deste cartao nao pode mudar
              // depois de montado (ver useRevelacaoScroll), e o "hoje" vira a
              // meia-noite com a pagina aberta.
              data-hoje={cartao.diaDaSemana === hoje || undefined}
            >
              <div className="h-icon">{cartao.icone}</div>
              <h4>
                {cartao.dia}
                {cartao.diaDaSemana === hoje && <span className="h-hoje">Hoje</span>}
              </h4>
              <p>
                {cartao.linhas.map((linha, i) => (
                  <span key={linha}>
                    {i > 0 && <br />}
                    {linha}
                  </span>
                ))}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
