import { useRef, useState } from "react";
import { useEventos } from "../hooks/useEventos.js";
import { useRevelacaoScroll } from "../hooks/useRevelacaoScroll.js";
import { rotuloDoTipo } from "../lib/api.js";
import TituloDeSecao from "./TituloDeSecao.jsx";
import ModalDeEvento from "./ModalDeEvento.jsx";
import { IconePlay } from "./Icones.jsx";
import "./eventos.css";

const MESES = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

function SeloDeData({ iso }) {
  // Dia e mes lidos no fuso de Sao Paulo, e nao com getDate()/getMonth(), que
  // usam o fuso de quem esta olhando: uma missa das 20h de sabado apareceria
  // como domingo para um visitante na Europa.
  const [dia, mes] = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "numeric",
    timeZone: "America/Sao_Paulo",
  })
    .format(new Date(iso))
    .split("/");

  return (
    <div className="evento-date">
      <span className="evento-dia">{dia}</span>
      <span className="evento-mes">{MESES[Number(mes) - 1]}</span>
    </div>
  );
}

function CardDeEvento({ evento, indice, aoAbrir }) {
  const referenciaDoVideo = useRef(null);
  const [tocando, setTocando] = useState(false);

  function tocar() {
    const video = referenciaDoVideo.current;
    if (!video) return;

    const tentativa = video.play();

    // `play()` só devolve Promise a partir do Chrome 50 / Safari 10; antes
    // disso devolvia undefined. Sem esta checagem, um `.then` direto lançaria
    // TypeError e o hover pararia de funcionar por completo no aparelho antigo.
    if (!tentativa?.then) {
      setTocando(true);
      return;
    }

    // O navegador ainda pode recusar o play (economia de bateria, aba em
    // segundo plano). Se recusar, o card continua mostrando a capa.
    tentativa.then(() => setTocando(true)).catch(() => setTocando(false));
  }

  function parar() {
    const video = referenciaDoVideo.current;
    if (!video) return;
    video.pause();
    // Volta ao inicio: no proximo hover o video recomeca, em vez de continuar
    // do meio de onde parou.
    video.currentTime = 0;
    setTocando(false);
  }

  return (
    <div
      className={`evento-card evento-card-imagem reveal delay-${(indice % 3) + 1}`}
      onClick={() => aoAbrir(evento)}
      role="button"
      tabIndex={0}
      onMouseEnter={tocar}
      onMouseLeave={parar}
      // Teclado tambem dispara: quem navega por Tab ve o mesmo que quem usa
      // mouse.
      onFocus={tocar}
      onBlur={parar}
      onKeyDown={(evt) => {
        if (evt.key === "Enter" || evt.key === " ") {
          evt.preventDefault();
          aoAbrir(evento);
        }
      }}
    >
      <SeloDeData iso={evento.comecaEm} />

      <div className="evento-card-overlay">
        {/* `cascata` escalona badge, titulo e resumo. So mexe em opacidade e
            deslocamento dos filhos do overlay -- o z-index do overlay e o do
            video continuam intocados. */}
        <div className="evento-card-texto cascata">
          <span className="evento-card-badge">{rotuloDoTipo(evento.tipo)}</span>
          <h3>{evento.titulo}</h3>
          <p>{evento.resumo}</p>
        </div>
      </div>

      <img src={evento.coverUrl} alt={evento.titulo} className="evento-imagem" loading="lazy" />

      {evento.videoUrl && (
        <>
          <video
            ref={referenciaDoVideo}
            className={`evento-video${tocando ? " tocando" : ""}`}
            src={evento.videoUrl}
            poster={evento.coverUrl}
            // `muted` nao e opcional: sem ele o navegador bloqueia o play
            // automatico. `playsInline` impede o iPhone de abrir em tela cheia.
            muted
            loop
            playsInline
            preload="metadata"
            tabIndex={-1}
            aria-hidden="true"
          />
          {/* Some quando o video comeca -- ja e obvio que tem video tocando. */}
          <span className={`evento-selo-video${tocando ? " escondido" : ""}`} aria-hidden="true">
            <IconePlay />
            Vídeo
          </span>
        </>
      )}

      <div className="evento-glow" />
    </div>
  );
}

export default function Eventos() {
  const { eventos, carregando, acordando, erro } = useEventos({ escopo: "proximos" });
  const [eventoAberto, setEventoAberto] = useState(null);

  // Os cards chegam depois da primeira renderizacao, entao o observer de
  // revelacao precisa rodar de novo quando a lista muda.
  useRevelacaoScroll([eventos]);

  return (
    <section className="eventos-section" id="eventos">
      <div className="container">
        <TituloDeSecao
          titulo="Próximos Eventos"
          subtitulo="Acompanhe os eventos e celebrações especiais da nossa paróquia"
          classeDoSubtitulo="eventos-subtitle"
        />

        <div className="eventos-grid">
          {carregando &&
            [0, 1, 2].map((i) => <div className="evento-esqueleto" key={i} />)}

          {carregando && acordando && (
            <p className="eventos-estado">Acordando o servidor, só um instante...</p>
          )}

          {!carregando && erro && (
            <p className="eventos-estado">
              <strong>Não conseguimos carregar os eventos agora.</strong>
              Tente atualizar a página em alguns instantes.
            </p>
          )}

          {!carregando && !erro && eventos.length === 0 && (
            <p className="eventos-estado">
              <strong>Nenhum evento agendado no momento.</strong>
              Acompanhe nossas redes sociais para não perder as próximas celebrações.
            </p>
          )}

          {!carregando &&
            !erro &&
            eventos.map((evento, indice) => (
              <CardDeEvento
                key={evento.id}
                evento={evento}
                indice={indice}
                aoAbrir={setEventoAberto}
              />
            ))}
        </div>
      </div>

      {eventoAberto && (
        <ModalDeEvento evento={eventoAberto} aoFechar={() => setEventoAberto(null)} />
      )}
    </section>
  );
}
