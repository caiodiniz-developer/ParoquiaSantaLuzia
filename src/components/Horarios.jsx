import PalavrasMascaradas from "./PalavrasMascaradas.jsx";

const CARTOES = [
  { icone: "☩", dia: "Domingo", linhas: ["7h: Missa", "10h: Missa"] },
  {
    icone: "☸",
    dia: "Quarta-feira",
    linhas: ["7h30: Missa com Novena de N. Sra. do Perpétuo Socorro"],
  },
  {
    icone: "✠",
    dia: "Sexta-feira",
    linhas: ["1ª sexta: 7h30 Missa do Sagrado Coração", "19h: Terço dos Homens"],
  },
  {
    icone: "☟",
    dia: "Sábado",
    linhas: ["18h30: Missa", "9h: Aula de Violão", "10h: Técnica Vocal"],
  },
];

export default function Horarios() {
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
            <div className={`horario-card reveal cascata delay-${indice + 1}`} key={cartao.dia}>
              <div className="h-icon">{cartao.icone}</div>
              <h4>{cartao.dia}</h4>
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
