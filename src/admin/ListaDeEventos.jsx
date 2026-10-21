import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEventos } from "../hooks/useEventos.js";
import { eventos as apiEventos, rotuloDoTipo } from "../lib/api.js";
import { dataComHora } from "../lib/datas.js";

const ABAS = [
  { chave: "proximos", rotulo: "Próximos" },
  { chave: "realizados", rotulo: "Já realizados" },
  { chave: "todos", rotulo: "Todos" },
];

export default function ListaDeEventos() {
  const [escopo, setEscopo] = useState("proximos");
  const local = useLocation();
  const navegar = useNavigate();
  // Mensagem que o formulario deixou ao salvar ("Evento publicado!").
  const [sucesso, setSucesso] = useState(local.state?.aviso || "");

  useEffect(() => {
    // Tira a mensagem do historico: sem isto ela voltaria a cada F5.
    if (local.state?.aviso) navegar(local.pathname, { replace: true, state: null });
  }, [local.state, local.pathname, navegar]);

  // O timer mora no seu proprio efeito. No efeito de cima ele seria cancelado
  // logo em seguida: limpar o historico muda local.state e re-executa aquele
  // efeito, cuja limpeza apagaria o relogio antes de ele disparar.
  useEffect(() => {
    if (!sucesso) return undefined;
    const relogio = setTimeout(() => setSucesso(""), 8000);
    return () => clearTimeout(relogio);
  }, [sucesso]);
  const [erro, setErro] = useState("");
  // Guarda o id em operacao para desabilitar so os botoes daquela linha, e nao
  // a lista inteira.
  const [emOperacao, setEmOperacao] = useState(null);

  const { eventos, carregando, acordando, erro: erroAoCarregar, recarregar } = useEventos({
    escopo,
    incluirInativos: true,
  });

  async function comTratamento(id, acao) {
    setErro("");
    setEmOperacao(id);
    try {
      await acao();
      await recarregar();
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setEmOperacao(null);
    }
  }

  const [copiado, setCopiado] = useState(null);
  const [busca, setBusca] = useState("");

  // Busca sem acento e sem diferenca de maiuscula: "sao jose" acha "São José".
  const normalizar = (texto) =>
    (texto || "")
      .normalize("NFD")
      .replace(/[0300-036f]/g, "")
      .toLowerCase();
  const termo = normalizar(busca.trim());
  const visiveis = termo
    ? eventos.filter((evento) =>
        [evento.titulo, evento.local, evento.resumo].some((campo) => normalizar(campo).includes(termo)),
      )
    : eventos;

  /**
   * Copia o link publico do evento (/?evento=ID), pronto para colar na
   * legenda do Instagram ou no grupo do WhatsApp. O endereco sai da propria
   * janela: no ar e o dominio do site, em teste e o localhost.
   */
  async function copiarLink(evento) {
    const link = `${window.location.origin}/?evento=${evento.id}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiado(evento.id);
      setTimeout(() => setCopiado((atual) => (atual === evento.id ? null : atual)), 2500);
    } catch {
      // Sem permissao de area de transferencia: mostra o link para copiar a mao.
      window.prompt("Copie o link do evento:", link);
    }
  }

  function alternar(evento) {
    comTratamento(evento.id, () => apiEventos.alternarAtivo(evento.id, !evento.ativo));
  }

  function excluir(evento) {
    // Apagar tira a foto do armazenamento junto e nao tem volta -- por isso a
    // confirmacao pede o titulo na tela, e nao um "tem certeza?" generico.
    const confirmado = window.confirm(
      `Apagar "${evento.titulo}" definitivamente?\n\n` +
        "As fotos enviadas também serão removidas.\n" +
        'Se a intenção é só tirar do site por um tempo, use "Ocultar".',
    );
    if (!confirmado) return;
    comTratamento(evento.id, () => apiEventos.remover(evento.id));
  }

  return (
    <>
      <div className="adm-cabecalho-pagina">
        <h2>Eventos</h2>
        <Link to="/admin/novo" className="adm-botao">
          + Novo evento
        </Link>
      </div>

      <div className="adm-abas">
        {ABAS.map((aba) => (
          <button
            key={aba.chave}
            type="button"
            className={`adm-aba${escopo === aba.chave ? " ativa" : ""}`}
            onClick={() => setEscopo(aba.chave)}
          >
            {aba.rotulo}
          </button>
        ))}
      </div>

      <div className="adm-campo" style={{ marginBottom: "1rem" }}>
        <input
          type="search"
          className="adm-busca"
          placeholder="Buscar por título, local ou resumo..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          aria-label="Buscar eventos"
        />
      </div>

      {sucesso && <div className="adm-aviso sucesso">{sucesso}</div>}
      {erro && <div className="adm-aviso erro">{erro}</div>}

      {carregando && (
        <p className="adm-vazio">
          {acordando ? "Acordando o servidor, só um instante..." : "Carregando..."}
        </p>
      )}

      {/* Sem isto, a API fora do ar aparecia como "nenhum evento nesta aba" --
          e a pessoa achava que os eventos tinham sumido. */}
      {!carregando && erroAoCarregar && (
        <div className="adm-aviso erro">
          Não foi possível carregar os eventos: {erroAoCarregar.message}{" "}
          <button type="button" className="adm-botao secundario pequeno" onClick={() => recarregar()}>
            Tentar de novo
          </button>
        </div>
      )}

      {!carregando && termo && eventos.length > 0 && visiveis.length === 0 && (
        <p className="adm-vazio">Nenhum evento encontrado para “{busca.trim()}”.</p>
      )}

      {!carregando && !erroAoCarregar && eventos.length === 0 && (
        <p className="adm-vazio">
          Nenhum evento nesta aba. Clique em "Novo evento" para cadastrar o primeiro.
        </p>
      )}

      <div className="adm-lista">
        {!carregando &&
          visiveis.map((evento) => (
            <div className={`adm-item${evento.ativo ? "" : " inativo"}`} key={evento.id}>
              <img className="adm-item-capa" src={evento.coverUrl} alt="" loading="lazy" />

              <div>
                <p className="adm-item-titulo">{evento.titulo}</p>
                <p className="adm-item-meta">{dataComHora(evento.comecaEm)}</p>
                {evento.local && <p className="adm-item-meta">{evento.local}</p>}

                <div className="adm-etiquetas">
                  <span className="adm-etiqueta">{rotuloDoTipo(evento.tipo)}</span>
                  {evento.destaque && <span className="adm-etiqueta destaque">Destaque</span>}
                  {!evento.ativo && <span className="adm-etiqueta oculto">Oculto no site</span>}
                  {evento.instagramUrl && <span className="adm-etiqueta instagram">Instagram</span>}
                  {evento.videoUrl && <span className="adm-etiqueta">Vídeo</span>}
                  {evento.galeria?.length > 0 && (
                    <span className="adm-etiqueta">
                      {evento.galeria.length} foto{evento.galeria.length === 1 ? "" : "s"}
                    </span>
                  )}
                </div>
              </div>

              <div className="adm-item-acoes">
                <Link to={`/admin/${evento.id}`} className="adm-botao secundario pequeno">
                  Editar
                </Link>
                <button
                  type="button"
                  className="adm-botao secundario pequeno"
                  disabled={!evento.ativo}
                  title={evento.ativo ? "Link para colar no Instagram ou no WhatsApp" : "Evento oculto não abre no site"}
                  onClick={() => copiarLink(evento)}
                >
                  {copiado === evento.id ? "Link copiado!" : "Copiar link"}
                </button>
                <button
                  type="button"
                  className="adm-botao secundario pequeno"
                  disabled={emOperacao === evento.id}
                  onClick={() => alternar(evento)}
                >
                  {evento.ativo ? "Ocultar" : "Mostrar"}
                </button>
                <button
                  type="button"
                  className="adm-botao perigo pequeno"
                  disabled={emOperacao === evento.id}
                  onClick={() => excluir(evento)}
                >
                  Apagar
                </button>
              </div>
            </div>
          ))}
      </div>
    </>
  );
}
