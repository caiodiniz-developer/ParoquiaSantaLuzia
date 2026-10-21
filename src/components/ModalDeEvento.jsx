import { useEffect } from "react";
import { rotuloDoTipo } from "../lib/api.js";
import { dataComHora } from "../lib/datas.js";
import { Calendario, Fechar, Instagram, Local, Relogio } from "./Icones.jsx";

export default function ModalDeEvento({ evento, aoFechar }) {
  // ESC fecha e o fundo para de rolar. O listener e registrado so enquanto o
  // modal existe -- no site antigo ele ficava preso ao document para sempre.
  useEffect(() => {
    function aoTeclar(evt) {
      if (evt.key === "Escape") aoFechar();
    }
    document.addEventListener("keydown", aoTeclar);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = "";
    };
  }, [aoFechar]);

  // Com o modal aberto, a aba mostra o nome do evento. E o que aparece quando
  // alguem guarda nos favoritos ou compartilha o link direto (?evento=ID).
  useEffect(() => {
    if (!evento) return undefined;
    const tituloAnterior = document.title;
    document.title = `${evento.titulo} · Paróquia Santa Luzia`;
    return () => {
      document.title = tituloAnterior;
    };
  }, [evento]);

  if (!evento) return null;

  const paragrafos = (evento.descricao || "")
    .split(/\n+/)
    .map((linha) => linha.trim())
    .filter(Boolean);

  const destaques = [
    {
      icone: <Calendario />,
      titulo: evento.terminaEm ? "Início" : "Quando",
      valor: dataComHora(evento.comecaEm),
    },
    evento.terminaEm && {
      icone: <Relogio />,
      titulo: "Término",
      valor: dataComHora(evento.terminaEm),
    },
    evento.local && { icone: <Local />, titulo: "Onde", valor: evento.local },
  ].filter(Boolean);

  return (
    <div className="evento-modal active" onClick={aoFechar}>
      <div className="evento-modal-content" onClick={(evt) => evt.stopPropagation()}>
        <button type="button" className="evento-modal-close" onClick={aoFechar} aria-label="Fechar">
          <Fechar />
        </button>

        <div className="evento-modal-body">
          <div className="evento-modal-imagem">
            <img src={evento.coverUrl} alt={evento.titulo} />
          </div>

          <div className="evento-modal-info">
            <div className="evento-modal-badge">{rotuloDoTipo(evento.tipo)}</div>
            <h3 className="evento-modal-titulo">{evento.titulo}</h3>

            <div className="evento-modal-texto">
              {paragrafos.map((paragrafo, indice) => (
                <p key={indice}>{paragrafo}</p>
              ))}
              {evento.bencao && <p className="evento-modal-bencao">{evento.bencao}</p>}
            </div>

            <div className="evento-modal-destaques">
              {destaques.map((destaque) => (
                <div className="evento-modal-destaque" key={destaque.titulo}>
                  <div className="destaque-icon">{destaque.icone}</div>
                  <div>
                    <strong>{destaque.titulo}</strong>
                    <span>{destaque.valor}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* No modal o video ganha controles: aqui a pessoa escolheu ver o
                evento, entao ela manda no play, no som e no tempo. */}
            {evento.videoUrl && (
              <video
                className="evento-modal-video"
                src={evento.videoUrl}
                poster={evento.coverUrl}
                controls
                playsInline
                preload="metadata"
              />
            )}

            {evento.galeria?.length > 0 && (
              <div className="evento-modal-galeria">
                {evento.galeria.map((url) => (
                  <img key={url} src={url} alt="" loading="lazy" />
                ))}
              </div>
            )}

            {(evento.inscricaoUrl || evento.instagramUrl) && (
              <div className="evento-modal-acoes">
                {evento.inscricaoUrl && (
                  <a
                    className="evento-modal-inscricao"
                    href={evento.inscricaoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Fazer inscrição
                  </a>
                )}
                {evento.instagramUrl && (
                  <a
                    className="evento-modal-instagram"
                    href={evento.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Instagram />
                    Ver no Instagram
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
