import { Fragment, useState } from "react";
import { useLiturgia, corLiturgica } from "../hooks/useLiturgia.js";
import TituloDeSecao from "./TituloDeSecao.jsx";
import { Biblia, Musica, Seta } from "./Icones.jsx";

/**
 * Marca os numeros de versiculo como sobrescrito.
 *
 * O site antigo fazia isso com replace + innerHTML. Aqui devolvemos elementos
 * React: o texto vem de uma API de terceiros, e injetar HTML de terceiro na
 * pagina e exatamente como um XSS entra.
 */
function comVersiculos(texto) {
  return texto.split(/(\d+)/).map((pedaco, indice) =>
    /^\d+$/.test(pedaco) ? <sup key={indice}>{pedaco}</sup> : <Fragment key={indice}>{pedaco}</Fragment>,
  );
}

function CartaoDaLiturgia({
  titulo,
  icone,
  variante,
  cabecalhoSalmo = false,
  referencia,
  paragrafos,
  refrao,
  erro,
}) {
  const [expandido, setExpandido] = useState(false);

  return (
    <div className={`liturgia-card ${variante}${expandido ? " expanded" : ""}`}>
      <div className={`liturgia-card-header${cabecalhoSalmo ? " salmo" : ""}`}>
        <div className="liturgia-icon">{icone}</div>
        <h3>{titulo}</h3>
      </div>

      <div className="liturgia-card-body">
        <p className="liturgia-reference">{referencia}</p>
        <div className="liturgia-text">
          {erro ? (
            <p style={{ color: "var(--muted-fg)", textAlign: "center" }}>
              Não foi possível carregar agora. Tente novamente mais tarde.
            </p>
          ) : paragrafos.length === 0 ? (
            <p>Carregando...</p>
          ) : (
            paragrafos.map((paragrafo, indice) => <p key={indice}>{comVersiculos(paragrafo)}</p>)
          )}
        </div>

        {refrao !== undefined && (
          <div className="salmo-refrao">
            <span className="refrao-label">Refrão:</span>
            <span className="refrao-text">{refrao || "Indisponível"}</span>
          </div>
        )}
      </div>

      <div className="liturgia-card-footer">
        <button type="button" className="liturgia-btn" onClick={() => setExpandido((v) => !v)}>
          <span>{expandido ? "Recolher" : "Ler mais"}</span>
          <Seta tamanho={16} />
        </button>
      </div>
    </div>
  );
}

export default function Liturgia() {
  const { liturgia, erro } = useLiturgia();

  return (
    <section className="liturgia-section" id="liturgia">
      <div className="container">
        <div className="reveal cascata" style={{ textAlign: "center" }}>
          <div className="section-cross">&#10016;</div>
          <h2 className="section-title">Liturgia do Dia</h2>
          <div className="gold-divider" />
          <p className="liturgia-date">
            {erro ? (
              "Liturgia indisponível no momento"
            ) : liturgia ? (
              <>
                <strong>{liturgia.data}</strong>
                {liturgia.nomeDaLiturgia && ` - ${liturgia.nomeDaLiturgia}`}
                {liturgia.cor && (
                  <span style={{ color: corLiturgica(liturgia.cor) }}> ({liturgia.cor})</span>
                )}
              </>
            ) : (
              "Carregando..."
            )}
          </p>
        </div>

        <div className="liturgia-grid">
          <CartaoDaLiturgia
            titulo="Evangelho do Dia"
            icone={<Biblia />}
            variante="reveal-left delay-1"
            referencia={erro ? "Indisponível" : liturgia?.evangelho.referencia || "Carregando..."}
            paragrafos={liturgia?.evangelho.paragrafos || []}
            erro={erro}
          />

          <CartaoDaLiturgia
            titulo="Salmo do Dia"
            icone={<Musica />}
            variante="reveal-right delay-2"
            cabecalhoSalmo
            referencia={erro ? "Indisponível" : liturgia?.salmo.referencia || "Carregando..."}
            paragrafos={liturgia?.salmo.paragrafos || []}
            refrao={liturgia?.salmo.refrao ?? ""}
            erro={erro}
          />
        </div>
      </div>
    </section>
  );
}
