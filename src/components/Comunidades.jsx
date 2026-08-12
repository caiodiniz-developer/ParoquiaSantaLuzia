import { useState } from "react";
import { comunidades } from "../data/comunidades.js";
import { usePrefereMenosMovimento } from "../hooks/usePrefereMenosMovimento.js";
import TituloDeSecao from "./TituloDeSecao.jsx";
import { CruzDoCard, Local } from "./Icones.jsx";

function CartaoDaComunidade({ comunidade, expandido, aoClicar }) {
  const { nome, endereco, destaque, horarios, extra } = comunidade;

  return (
    <div
      className={`community-card${destaque ? " featured" : ""}${expandido ? " expanded" : ""}`}
      onClick={aoClicar}
    >
      <div className="card-header">
        <div className="card-header-inner">
          <span className="card-cross">
            <CruzDoCard />
          </span>
          <div>
            <p className="card-name">{nome}</p>
            <p className="card-address">
              <Local />
              {endereco}
            </p>
          </div>
        </div>
        {destaque && <span className="card-badge">Sede da Paroquia</span>}
      </div>

      <div className="card-body">
        <p className="card-body-label">Horarios da Comunidade</p>
        {horarios.map((bloco) => (
          <div key={bloco.dia}>
            <p className="schedule-day">{bloco.dia}</p>
            {bloco.itens.map((item) => (
              <p className="schedule-item" key={item}>
                - {item}
              </p>
            ))}
          </div>
        ))}
        {extra && <div className="card-extra">{extra}</div>}
      </div>

      <div className="card-footer">
        {expandido ? "Clique para recolher" : "Clique para ver todos os horarios"}
      </div>
    </div>
  );
}

export default function Comunidades() {
  // Guardamos o indice da lista duplicada, nao o nome da comunidade: as duas
  // copias do mesmo cartao estao na tela ao mesmo tempo e so a clicada deve
  // abrir.
  const [indiceExpandido, setIndiceExpandido] = useState(null);
  const menosMovimento = usePrefereMenosMovimento();

  // A lista sai duplicada para a animacao de rolagem infinita do CSS: quando
  // a primeira copia termina de passar, a segunda ja esta na posicao inicial e
  // o corte fica invisivel.
  //
  // Com "menos movimento" ligado a esteira para, e ai a duplicacao so criaria
  // cartoes repetidos. Mostramos a lista uma vez so e liberamos a rolagem
  // lateral com o dedo ou o mouse -- do contrario, parar a animacao esconderia
  // seis das nove comunidades para sempre.
  const listaVisivel = menosMovimento ? comunidades : [...comunidades, ...comunidades];

  return (
    <section className="comunidades-section" id="comunidades">
      <div className="container">
        <TituloDeSecao
          titulo="Conheça Nossas Comunidades"
          subtitulo="Paróquia Santa Luzia - Jardim dos Oliveiras | Arquidiocese de Campinas/SP"
          classeDoSubtitulo="comunidades-subtitle"
        />
      </div>

      {/* A pausa no hover e feita pelo proprio CSS (.carousel-track:hover),
          entao aqui nao ha nenhum listener de mouse. */}
      <div className={`carousel-wrapper${menosMovimento ? " sem-esteira" : ""}`}>
        <div className="carousel-track">
          {listaVisivel.map((comunidade, indice) => (
            <CartaoDaComunidade
              key={`${comunidade.nome}-${indice}`}
              comunidade={comunidade}
              expandido={indiceExpandido === indice}
              aoClicar={() =>
                setIndiceExpandido((atual) => (atual === indice ? null : indice))
              }
            />
          ))}
        </div>
      </div>

      <div className="container">
        <div className="secretaria-box reveal">
          <h3>Secretaria Paroquial</h3>
          <div className="gold-divider" />
          <div className="secretaria-grid">
            <div>
              <p className="label">Atendimento (Murilo ou Lurdinha)</p>
              <p>Rua René Fernandes, n. 71</p>
              <p>Bairro: Jardim dos Oliveiras</p>
              <p>Tel.: (19) 3271-4495 / (19) 99241-0546</p>
              <p className="label" style={{ marginTop: "0.75rem" }}>
                Horários:
              </p>
              <p>Segunda: 13h às 18h</p>
              <p>Terça a sexta: 9h às 12h; 13h às 18h</p>
              <p>Sábado: 8h às 12h</p>
            </div>
            <div>
              <p className="label">Atendimento do padre / Confissões</p>
              <p>Terças e sextas-feiras: 15h às 17h</p>
              <p>Quartas-feiras: 15h às 17h</p>
              <p
                style={{
                  marginTop: "0.75rem",
                  fontSize: "0.85rem",
                  fontStyle: "italic",
                  color: "var(--muted-fg)",
                }}
              >
                Atendimento a enfermos e idosos nas casas (agendar na Secretaria Paroquial)
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
