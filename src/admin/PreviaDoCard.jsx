import { rotuloDoTipo } from "../lib/api.js";
import { SeloDeData } from "../components/Eventos.jsx";

/**
 * Como o card vai aparecer em "Próximos Eventos", enquanto o evento ainda e
 * preenchido. Usa as MESMAS classes do site (as folhas de estilo sao globais),
 * entao o que se ve aqui e o que o visitante vera -- sem uma segunda copia do
 * visual para manter em dia.
 *
 * O campo de data entrega "2026-12-13T19:30", sem fuso; o selo espera um ISO.
 * O -03:00 e o mesmo carimbo que o servidor aplica (evento.schema.ts).
 */
export default function PreviaDoCard({ titulo, tipo, resumo, comecaEm, capa }) {
  const iso = comecaEm ? `${comecaEm}:00-03:00` : null;
  const dataValida = iso && !Number.isNaN(new Date(iso).getTime());

  return (
    <div className="adm-previa-card-moldura">
      <p className="adm-dica" style={{ marginBottom: "0.6rem" }}>
        Prévia do card no site
      </p>
      <div className="evento-card adm-previa-card" aria-hidden="true">
        {dataValida && <SeloDeData iso={iso} />}

        <div className="evento-card-overlay">
          <div className="evento-card-texto">
            <span className="evento-card-badge">{rotuloDoTipo(tipo)}</span>
            <h3>{titulo || "Título do evento"}</h3>
            {resumo && <p>{resumo}</p>}
          </div>
        </div>

        {capa ? (
          <img src={capa} alt="" className="evento-imagem" />
        ) : (
          <div className="adm-previa-sem-capa">Escolha a capa</div>
        )}
      </div>
    </div>
  );
}
