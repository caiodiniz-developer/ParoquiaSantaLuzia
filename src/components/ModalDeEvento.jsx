import { useEffect, useRef } from "react";
import { rotuloDoTipo } from "../lib/api.js";
import { dataComHora } from "../lib/datas.js";
import { Calendario, Fechar, Instagram, Local, Relogio } from "./Icones.jsx";

const FOCAVEIS =
  "a[href], button:not([disabled]), video[controls], [tabindex]:not([tabindex=\"-1\"])";

export default function ModalDeEvento({ evento, aoFechar }) {
  const caixa = useRef(null);

  /**
   * Foco de teclado dentro do modal enquanto ele esta aberto.
   *
   * Ao abrir, o foco vai para o botao de fechar; Tab e Shift+Tab giram so
   * entre os botoes e links do modal; ao fechar, o foco volta para o card que
   * abriu. Sem isto, quem usa teclado ou leitor de tela continuava navegando
   * pela pagina escondida atras do fundo escuro.
   */
  useEffect(() => {
    const anterior = document.activeElement;
    caixa.current?.querySelector(".evento-modal-close")?.focus();

    function prenderFoco(evento) {
      if (evento.key !== "Tab" || !caixa.current) return;
      const itens = [...caixa.current.querySelectorAll(FOCAVEIS)];
      if (itens.length === 0) return;
      const primeiro = itens[0];
      const ultimo = itens[itens.length - 1];
      if (evento.shiftKey && document.activeElement === primeiro) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primeiro.focus();
      }
    }

    document.addEventListener("keydown", prenderFoco);
    return () => {
      document.removeEventListener("keydown", prenderFoco);
      if (anterior instanceof HTMLElement) anterior.focus();
    };
  }, []);
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
      <div
        className="evento-modal-content"
        ref={caixa}
        onClick={(evt) => evt.stopPropagation()}
        // Leitor de tela anuncia "dialogo: <titulo do evento>" ao abrir.
        role="dialog"
        aria-modal="true"
        aria-labelledby="evento-modal-titulo"
      >
        <button type="button" className="evento-modal-close" onClick={aoFechar} aria-label="Fechar">
          <Fechar />
        </button>

        <div className="evento-modal-body">
          <div className="evento-modal-imagem">
            <img src={evento.coverUrl} alt={evento.titulo} />
          </div>

          <div className="evento-modal-info">
            <div className="evento-modal-badge">{rotuloDoTipo(evento.tipo)}</div>
            <h3 className="evento-modal-titulo" id="evento-modal-titulo">
              {evento.titulo}
            </h3>

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
                {/* Cada miniatura abre a foto inteira numa aba nova: com 90px
                    ninguem enxerga o rosto de quem estava no retiro. */}
                {evento.galeria.map((url, indice) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Abrir foto ${indice + 1} de ${evento.galeria.length} em tamanho real`}
                  >
                    <img src={url} alt="" loading="lazy" />
                  </a>
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
