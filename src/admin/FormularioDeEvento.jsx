import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { eventos as apiEventos, TIPOS_DE_EVENTO } from "../lib/api.js";
import { paraCampoDataHora } from "../lib/datas.js";
import PreviaDoCard from "./PreviaDoCard.jsx";

// Precisa bater com o LIMITE_DE_VIDEO do servidor (evento.rotas.ts).
const LIMITE_DO_VIDEO = 60 * 1024 * 1024;
// Precisam bater com LIMITE_DE_IMAGEM, IMAGENS_ACEITAS e MAXIMO_NA_GALERIA do
// servidor. Conferir aqui poupa o upload inteiro so para ouvir um "nao" no fim.
const LIMITE_DA_IMAGEM = 8 * 1024 * 1024;
const IMAGENS_ACEITAS = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
const MAXIMO_NA_GALERIA = 6;

/** Devolve o motivo de recusa da imagem, ou "" quando ela serve. */
function problemaDaImagem(arquivo) {
  if (!IMAGENS_ACEITAS.includes(arquivo.type)) {
    return `"${arquivo.name}" não é uma imagem aceita. Use JPG, PNG, WEBP, AVIF ou GIF.`;
  }
  if (arquivo.size > LIMITE_DA_IMAGEM) {
    const mb = (arquivo.size / 1024 / 1024).toFixed(1);
    return `"${arquivo.name}" tem ${mb} MB e o limite é 8 MB. Reduza a foto antes de enviar.`;
  }
  return "";
}

const VAZIO = {
  titulo: "",
  tipo: "GERAL",
  comecaEm: "",
  terminaEm: "",
  local: "",
  resumo: "",
  descricao: "",
  bencao: "",
  inscricaoUrl: "",
  instagramUrl: "",
  destaque: false,
  ativo: true,
};

/** Meia-noite de hoje: o mesmo corte que o servidor usa para "Próximos". */
function meiaNoite() {
  const data = new Date();
  data.setHours(0, 0, 0, 0);
  return data;
}

export default function FormularioDeEvento() {
  const { id } = useParams();
  const editando = Boolean(id);
  const navegar = useNavigate();

  const [campos, setCampos] = useState(VAZIO);
  // Retrato do formulario como veio do banco, para saber se houve alteracao.
  const [iniciais, setIniciais] = useState({ campos: VAZIO, fotos: 0 });
  const [capaNova, setCapaNova] = useState(null);
  const [capaAtual, setCapaAtual] = useState("");
  const [videoNovo, setVideoNovo] = useState(null);
  const [videoAtual, setVideoAtual] = useState("");
  const [removerVideo, setRemoverVideo] = useState(false);
  const [galeriaMantida, setGaleriaMantida] = useState([]);
  const [galeriaNova, setGaleriaNova] = useState([]);

  const [carregando, setCarregando] = useState(editando);
  const [salvando, setSalvando] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [erro, setErro] = useState("");

  // As previas usam URL.createObjectURL. Cada URL criada segura o arquivo na
  // memoria ate ser revogada -- por isso guardamos a lista e limpamos no
  // desmonte e a cada troca de selecao.
  const urlsTemporarias = useRef([]);

  function criarPrevia(arquivo) {
    const url = URL.createObjectURL(arquivo);
    urlsTemporarias.current.push(url);
    return url;
  }

  useEffect(
    () => () => {
      urlsTemporarias.current.forEach(URL.revokeObjectURL);
      urlsTemporarias.current = [];
    },
    [],
  );

  useEffect(() => {
    if (!editando) return;

    let ativo = true;
    apiEventos
      .buscar(id)
      .then((evento) => {
        if (!ativo) return;
        const carregados = {
          titulo: evento.titulo,
          tipo: evento.tipo,
          comecaEm: paraCampoDataHora(evento.comecaEm),
          terminaEm: paraCampoDataHora(evento.terminaEm),
          local: evento.local || "",
          resumo: evento.resumo || "",
          descricao: evento.descricao || "",
          bencao: evento.bencao || "",
          inscricaoUrl: evento.inscricaoUrl || "",
          instagramUrl: evento.instagramUrl || "",
          destaque: evento.destaque,
          ativo: evento.ativo,
        };
        setCampos(carregados);
        setIniciais({ campos: carregados, fotos: (evento.galeria || []).length });
        setCapaAtual(evento.coverUrl);
        setVideoAtual(evento.videoUrl || "");
        setGaleriaMantida(evento.galeria || []);
      })
      .catch((falha) => ativo && setErro(falha.message))
      .finally(() => ativo && setCarregando(false));

    return () => {
      ativo = false;
    };
  }, [editando, id]);

  const temAlteracoes =
    JSON.stringify(campos) !== JSON.stringify(iniciais.campos) ||
    Boolean(capaNova || videoNovo || removerVideo) ||
    galeriaNova.length > 0 ||
    galeriaMantida.length !== iniciais.fotos;

  // Fechar a aba ou recarregar com o formulario pela metade pede confirmacao.
  // Um evento com texto longo e tres fotos escolhidas da trabalho para refazer.
  useEffect(() => {
    if (!temAlteracoes || salvando) return undefined;
    function aoSair(evento) {
      evento.preventDefault();
      // Exigido pelo Chrome antigo para mostrar o aviso.
      evento.returnValue = "";
    }
    window.addEventListener("beforeunload", aoSair);
    return () => window.removeEventListener("beforeunload", aoSair);
  }, [temAlteracoes, salvando]);

  function sairDoFormulario() {
    if (
      temAlteracoes &&
      !window.confirm("Há alterações que ainda não foram salvas. Sair mesmo assim?")
    ) {
      return;
    }
    navegar("/admin");
  }

  function alterar(nome, valor) {
    setCampos((atuais) => ({ ...atuais, [nome]: valor }));
  }

  function escolherCapa(evento) {
    const arquivo = evento.target.files?.[0];
    if (!arquivo) return;
    const problema = problemaDaImagem(arquivo);
    if (problema) {
      setErro(problema);
      evento.target.value = "";
      return;
    }
    setErro("");
    setCapaNova({ arquivo, previa: criarPrevia(arquivo) });
  }

  function escolherVideo(evento) {
    const arquivo = evento.target.files?.[0];
    if (!arquivo) return;

    // Conferimos o tamanho aqui para nao gastar 5 minutos de upload numa
    // conexao ruim so para o servidor recusar no fim.
    if (arquivo.size > LIMITE_DO_VIDEO) {
      setErro(
        `O vídeo tem ${(arquivo.size / 1024 / 1024).toFixed(0)} MB e o limite é 60 MB. ` +
          "Corte um trecho menor ou reduza a qualidade.",
      );
      evento.target.value = "";
      return;
    }

    setErro("");
    setVideoNovo({ arquivo, previa: criarPrevia(arquivo) });
    setRemoverVideo(false);
  }

  function adicionarNaGaleria(evento) {
    const escolhidos = Array.from(evento.target.files || []);
    const problemas = escolhidos.map(problemaDaImagem).filter(Boolean);
    const validos = escolhidos.filter((arquivo) => !problemaDaImagem(arquivo));

    // Cabe so o que falta para chegar a 6; o resto e avisado, nao descartado
    // em silencio.
    const vagas = MAXIMO_NA_GALERIA - galeriaMantida.length - galeriaNova.length;
    const aceitos = validos.slice(0, Math.max(0, vagas));
    if (validos.length > aceitos.length) {
      problemas.push(
        `A galeria aceita até ${MAXIMO_NA_GALERIA} fotos. ${validos.length - aceitos.length} ficaram de fora.`,
      );
    }

    setErro(problemas.join(" "));
    setGaleriaNova((atuais) => [
      ...atuais,
      ...aceitos.map((arquivo) => ({ arquivo, previa: criarPrevia(arquivo) })),
    ]);
    // Limpa o input para dar para escolher o mesmo arquivo de novo se a pessoa
    // remover e mudar de ideia.
    evento.target.value = "";
  }

  async function salvar(evento) {
    evento.preventDefault();
    setErro("");

    if (!editando && !capaNova) {
      setErro("Escolha uma imagem de capa para o evento.");
      return;
    }

    const dados = new FormData();
    Object.entries(campos).forEach(([nome, valor]) => {
      // Booleano vira texto no multipart; o servidor converte de volta com o
      // `booleanoDeTexto` do evento.schema.ts.
      dados.append(nome, typeof valor === "boolean" ? String(valor) : valor);
    });

    if (capaNova) dados.append("capa", capaNova.arquivo);
    if (videoNovo) dados.append("video", videoNovo.arquivo);
    // Sem esta bandeira o servidor nao teria como distinguir "nao mexi no
    // video" de "quero tirar o video".
    if (editando && removerVideo && !videoNovo) dados.append("removerVideo", "true");
    galeriaNova.forEach((item) => dados.append("galeria", item.arquivo));
    if (editando) dados.append("galeriaMantida", JSON.stringify(galeriaMantida));

    setSalvando(true);
    setProgresso(0);

    try {
      if (editando) {
        await apiEventos.atualizar(id, dados, setProgresso);
      } else {
        await apiEventos.criar(dados, setProgresso);
      }
      // A mensagem diz ONDE o evento foi parar: e a duvida de quem acabou de
      // salvar ("ja esta no site?").
      const passado =
        campos.comecaEm && new Date(campos.terminaEm || campos.comecaEm) < meiaNoite();
      const aviso = !campos.ativo
        ? "Evento salvo, mas oculto: ele não aparece no site até você clicar em “Mostrar”."
        : passado
          ? "Evento salvo em “Já realizados”, porque a data já passou."
          : editando
            ? "Alterações salvas. O site já mostra a versão nova."
            : "Evento publicado! Ele já aparece em “Próximos Eventos” no site.";
      navegar("/admin", { state: { aviso } });
    } catch (falha) {
      setErro(falha.message);
      setSalvando(false);
    }
  }

  if (carregando) return <p className="adm-vazio">Carregando evento...</p>;

  const previaDaCapa = capaNova?.previa || capaAtual;
  const previaDoVideo = videoNovo?.previa || (removerVideo ? "" : videoAtual);

  // Mesma regra do servidor: o corte e a meia-noite de hoje, nao o instante
  // atual -- um evento marcado para hoje mais cedo ainda vale o dia inteiro.
  const dataNoPassado = campos.comecaEm && new Date(campos.comecaEm) < meiaNoite();

  return (
    <>
      <div className="adm-cabecalho-pagina">
        <h2>{editando ? "Editar evento" : "Novo evento"}</h2>
        <button type="button" className="adm-botao secundario" onClick={sairDoFormulario}>
          Voltar
        </button>
      </div>

      {erro && <div className="adm-aviso erro">{erro}</div>}

      <div className="adm-formulario-grade">
        <form className="adm-cartao" onSubmit={salvar}>
          <div className="adm-campo">
            <label htmlFor="titulo">Título do evento *</label>
            <input
              id="titulo"
              type="text"
              required
              minLength={3}
              maxLength={160}
              value={campos.titulo}
              onChange={(e) => alterar("titulo", e.target.value)}
              placeholder="Ex.: Festa de Santa Luzia"
            />
          </div>

          <div className="adm-linha">
            <div className="adm-campo">
              <label htmlFor="tipo">Categoria</label>
              <select
                id="tipo"
                value={campos.tipo}
                onChange={(e) => alterar("tipo", e.target.value)}
              >
                {TIPOS_DE_EVENTO.map((tipo) => (
                  <option value={tipo.chave} key={tipo.chave}>
                    {tipo.rotulo}
                  </option>
                ))}
              </select>
              <p className="adm-dica">Aparece como etiqueta no card do site.</p>
            </div>

            <div className="adm-campo">
              <label htmlFor="local">Local</label>
              <input
                id="local"
                type="text"
                value={campos.local}
                onChange={(e) => alterar("local", e.target.value)}
                placeholder="Ex.: Igreja Matriz - Jd. dos Oliveiras"
              />
            </div>
          </div>

          <div className="adm-linha">
            <div className="adm-campo">
              <label htmlFor="comecaEm">Data e hora de início *</label>
              <input
                id="comecaEm"
                type="datetime-local"
                required
                value={campos.comecaEm}
                onChange={(e) => alterar("comecaEm", e.target.value)}
              />
              <p className="adm-dica">
                Passada esta data, o evento sai sozinho da lista "Próximos Eventos" do site.
              </p>
              {/* O motivo numero um de "cadastrei e nao apareceu no site" e uma
                data no passado -- em geral o ano errado. Avisamos na hora, em
                vez de deixar a pessoa procurar o evento no site. */}
              {dataNoPassado && (
                <p className="adm-aviso atencao" style={{ marginTop: "0.5rem", marginBottom: 0 }}>
                  Esta data já passou. O evento ficará guardado em "Já realizados" e{" "}
                  <strong>não aparecerá</strong> em "Próximos Eventos" no site.
                </p>
              )}
            </div>

            <div className="adm-campo">
              <label htmlFor="terminaEm">Término (opcional)</label>
              <input
                id="terminaEm"
                type="datetime-local"
                value={campos.terminaEm}
                onChange={(e) => alterar("terminaEm", e.target.value)}
              />
              <p className="adm-dica">Use em eventos de vários dias, como tríduos e festas.</p>
            </div>
          </div>

          <div className="adm-campo">
            <label htmlFor="resumo">Resumo do card</label>
            <input
              id="resumo"
              type="text"
              maxLength={280}
              value={campos.resumo}
              onChange={(e) => alterar("resumo", e.target.value)}
              placeholder="Uma ou duas frases que aparecem por cima da foto"
            />
            <p className="adm-dica">{campos.resumo.length}/280 caracteres.</p>
          </div>

          <div className="adm-campo">
            <label htmlFor="descricao">Descrição completa</label>
            <textarea
              id="descricao"
              value={campos.descricao}
              onChange={(e) => alterar("descricao", e.target.value)}
              placeholder={
                "Texto que aparece quando o visitante clica no card.\n\nDeixe uma linha em branco para separar parágrafos."
              }
            />
          </div>

          <div className="adm-campo">
            <label htmlFor="bencao">Frase de bênção (opcional)</label>
            <input
              id="bencao"
              type="text"
              maxLength={300}
              value={campos.bencao}
              onChange={(e) => alterar("bencao", e.target.value)}
              placeholder="Ex.: Que a oração transforme seu coração."
            />
          </div>

          <div className="adm-campo">
            <label htmlFor="inscricaoUrl">Link de inscrição (opcional)</label>
            <input
              id="inscricaoUrl"
              type="url"
              value={campos.inscricaoUrl}
              onChange={(e) => alterar("inscricaoUrl", e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="adm-campo">
            <label htmlFor="instagramUrl">Instagram (opcional)</label>
            {/* type="text" e nao "url": o campo aceita "@perfil", que o
              navegador recusaria num input de URL. Quem valida e normaliza e o
              servidor (linkDoInstagram, em evento.schema.ts). */}
            <input
              id="instagramUrl"
              type="text"
              inputMode="url"
              autoComplete="off"
              value={campos.instagramUrl}
              onChange={(e) => alterar("instagramUrl", e.target.value)}
              placeholder="https://www.instagram.com/p/... ou @santaluzia.paroquia"
            />
            <p className="adm-dica">
              Cole o link do post sobre o evento. No site aparece o botão “Ver no Instagram”.
            </p>
          </div>

          <div className="adm-campo">
            <label>Imagem de capa {editando ? "" : "*"}</label>
            <div className="adm-area-imagem">
              {previaDaCapa && (
                <img className="adm-previa" src={previaDaCapa} alt="Prévia da capa" />
              )}
              <input type="file" accept="image/*" onChange={escolherCapa} />
              <p className="adm-dica">
                JPG, PNG ou WEBP, até 8 MB. {editando && "Escolha um arquivo só se quiser trocar."}
              </p>
            </div>
          </div>

          <div className="adm-campo">
            <label>Vídeo (opcional)</label>
            <div className="adm-area-imagem">
              {previaDoVideo && (
                <video className="adm-previa" src={previaDoVideo} controls muted playsInline />
              )}
              <input type="file" accept="video/mp4,video/webm" onChange={escolherVideo} />
              <p className="adm-dica">
                MP4 ou WEBM, até 60 MB. No site, o vídeo toca sozinho quando o visitante passa o
                mouse sobre o card e para quando ele tira — sem som, como manda o navegador.
              </p>

              {previaDoVideo && (
                <button
                  type="button"
                  className="adm-botao perigo pequeno"
                  style={{ marginTop: "0.6rem" }}
                  onClick={() => {
                    setVideoNovo(null);
                    setRemoverVideo(true);
                  }}
                >
                  Remover vídeo
                </button>
              )}
            </div>
          </div>

          <div className="adm-campo">
            <label>Galeria de fotos (opcional)</label>
            <div className="adm-area-imagem">
              <input type="file" accept="image/*" multiple onChange={adicionarNaGaleria} />
              <p className="adm-dica">
                {galeriaMantida.length + galeriaNova.length} de {MAXIMO_NA_GALERIA} fotos. Aparecem
                dentro do evento, no site.
              </p>

              {(galeriaMantida.length > 0 || galeriaNova.length > 0) && (
                <div className="adm-galeria">
                  {galeriaMantida.map((url) => (
                    <div className="adm-galeria-item" key={url}>
                      <img src={url} alt="" />
                      <button
                        type="button"
                        className="adm-galeria-remover"
                        aria-label="Remover foto"
                        onClick={() =>
                          setGaleriaMantida((atuais) => atuais.filter((item) => item !== url))
                        }
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {galeriaNova.map((item, indice) => (
                    <div className="adm-galeria-item" key={item.previa}>
                      <img src={item.previa} alt="" />
                      <button
                        type="button"
                        className="adm-galeria-remover"
                        aria-label="Remover foto"
                        onClick={() =>
                          setGaleriaNova((atuais) => atuais.filter((_, i) => i !== indice))
                        }
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="adm-linha">
            <label className="adm-marcador">
              <input
                type="checkbox"
                checked={campos.destaque}
                onChange={(e) => alterar("destaque", e.target.checked)}
              />
              <span>
                <strong>Destacar</strong>
                Fica no topo da lista de próximos eventos.
              </span>
            </label>

            <label className="adm-marcador">
              <input
                type="checkbox"
                checked={campos.ativo}
                onChange={(e) => alterar("ativo", e.target.checked)}
              />
              <span>
                <strong>Visível no site</strong>
                Desmarque para esconder sem apagar o cadastro.
              </span>
            </label>
          </div>

          {salvando && progresso > 0 && (
            <div className="adm-progresso">
              <span style={{ width: `${progresso}%` }} />
            </div>
          )}

          <div style={{ display: "flex", gap: "0.6rem", marginTop: "1.5rem" }}>
            <button type="submit" className="adm-botao" disabled={salvando}>
              {salvando
                ? progresso > 0 && progresso < 100
                  ? `Enviando... ${progresso}%`
                  : "Salvando..."
                : editando
                  ? "Salvar alterações"
                  : "Publicar evento"}
            </button>
            <button
              type="button"
              className="adm-botao secundario"
              disabled={salvando}
              onClick={sairDoFormulario}
            >
              Cancelar
            </button>
          </div>
        </form>

        <aside>
          <PreviaDoCard
            titulo={campos.titulo}
            tipo={campos.tipo}
            resumo={campos.resumo}
            comecaEm={campos.comecaEm}
            capa={previaDaCapa}
          />
        </aside>
      </div>
    </>
  );
}
