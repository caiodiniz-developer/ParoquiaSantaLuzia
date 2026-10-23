import { useState } from "react";
import { comunidades } from "../data/comunidades.js";
import { usePrefereMenosMovimento } from "../hooks/usePrefereMenosMovimento.js";
import TituloDeSecao from "./TituloDeSecao.jsx";
import { CruzDoCard, Local } from "./Icones.jsx";
import { useRelogio } from "../hooks/useRelogio.js";
import { statusDaSecretaria } from "../lib/secretaria.js";

/** "Aberta agora · fecha as 18h" ou "Fechada · abre amanha as 9h". */
function StatusDaSecretaria() {
  const { aberta, texto } = statusDaSecretaria(useRelogio());
  return (
    <p className={`secretaria-status${aberta ? " aberta" : ""}`} role="status">
      <span className="secretaria-status-ponto" aria-hidden="true" />
      {texto}
    </p>
  );
}

function CartaoDaComunidade({ comunidade, expandido, aoClicar, copia = false }) {
  const { nome, endereco, destaque, horarios, extra } = comunidade;

  return (
    <div
      className={`community-card${destaque ? " featured" : ""}${expandido ? " expanded" : ""}`}
      // Clicar em qualquer parte do cartao abre e fecha (atalho do mouse). Para
      // teclado e leitor de tela, quem faz isso e o botao do rodape: o cartao
      // nao e um botao inteiro porque tem link dentro (o "Como chegar"), e link
      // dentro de botao fica inalcancavel para o leitor de tela.
      onClick={aoClicar}
      // A segunda volta da esteira e so efeito visual: escondida do leitor de
      // tela e do Tab, senao cada comunidade seria lida e visitada duas vezes.
      aria-hidden={copia || undefined}
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

      <button
        type="button"
        className="card-footer"
        aria-expanded={expandido}
        tabIndex={copia ? -1 : undefined}
        onClick={(evento) => {
          // O clique ja abre pelo cartao; sem isto, ele abriria e fecharia na
          // mesma hora (botao + cartao).
          evento.stopPropagation();
          aoClicar();
        }}
      >
        {expandido ? "Clique para recolher" : "Clique para ver todos os horarios"}
      </button>
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
              copia={indice >= comunidades.length}
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
          <StatusDaSecretaria />
          <div className="gold-divider" />
          <div className="secretaria-grid">
            <div>
              <p className="label">Atendimento (Murilo ou Lurdinha)</p>
              <p>Rua René Fernandes, n. 71</p>
              <p>Bairro: Jardim dos Oliveiras</p>
              {/* No celular, um toque liga. O texto na tela continua o mesmo. */}
              <p>
                Tel.:{" "}
                <a className="secretaria-telefone" href="tel:+551932714495">
                  (19) 3271-4495
                </a>{" "}
                /{" "}
                <a className="secretaria-telefone" href="tel:+5519992410546">
                  (19) 99241-0546
                </a>
              </p>
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
