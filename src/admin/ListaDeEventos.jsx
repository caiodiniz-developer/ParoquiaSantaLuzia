import { useState } from "react";
import { Link } from "react-router-dom";
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
  const [erro, setErro] = useState("");
  // Guarda o id em operacao para desabilitar so os botoes daquela linha, e nao
  // a lista inteira.
  const [emOperacao, setEmOperacao] = useState(null);

  const { eventos, carregando, acordando, recarregar } = useEventos({
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

      {erro && <div className="adm-aviso erro">{erro}</div>}

      {carregando && (
        <p className="adm-vazio">
          {acordando ? "Acordando o servidor, só um instante..." : "Carregando..."}
        </p>
      )}

      {!carregando && eventos.length === 0 && (
        <p className="adm-vazio">
          Nenhum evento nesta aba. Clique em "Novo evento" para cadastrar o primeiro.
        </p>
      )}

      <div className="adm-lista">
        {!carregando &&
          eventos.map((evento) => (
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
                </div>
              </div>

              <div className="adm-item-acoes">
                <Link to={`/admin/${evento.id}`} className="adm-botao secundario pequeno">
                  Editar
                </Link>
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
