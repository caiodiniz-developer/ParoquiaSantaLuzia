import { useEffect, useState } from "react";
import { Link, NavLink, Route, Routes } from "react-router-dom";
import { autenticacao, lerToken, limparToken, SESSAO_EXPIRADA } from "../lib/api.js";
import Login from "./Login.jsx";
import ListaDeEventos from "./ListaDeEventos.jsx";
import FormularioDeEvento from "./FormularioDeEvento.jsx";
import Configuracoes from "./Configuracoes.jsx";
import "./admin.css";

const AVISO_DE_EXPIRACAO = "Sua sessão expirou. Entre de novo para continuar.";

export default function Admin() {
  const [sessao, setSessao] = useState(null);
  const [verificando, setVerificando] = useState(true);
  const [aviso, setAviso] = useState("");

  /**
   * O token guardado no navegador pode ter expirado ou ter sido assinado com
   * um AUTH_SECRET antigo. Perguntamos ao servidor antes de mostrar o painel
   * -- senao a pessoa veria a tela montada e um erro em cada acao.
   */
  useEffect(() => {
    if (!lerToken()) {
      setVerificando(false);
      return;
    }

    const controle = new AbortController();

    autenticacao
      .eu(controle.signal)
      .then((dados) => setSessao({ email: dados.email, expiraEm: dados.expiraEm }))
      .catch((falha) => {
        if (falha.name !== "AbortError") limparToken();
      })
      .finally(() => setVerificando(false));

    return () => controle.abort();
  }, []);

  // O painel nao pode ir parar no Google. O robots.txt e o cabecalho da
  // Vercel ja pedem isso; a meta tag cobre buscador que ignore os dois e
  // hospedagem que nao seja a Vercel.
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    const tituloAnterior = document.title;
    document.title = "Painel · Paróquia Santa Luzia";
    return () => {
      meta.remove();
      document.title = tituloAnterior;
    };
  }, []);

  // Qualquer chamada recusada por token vencido traz a pessoa de volta ao
  // login, com o motivo escrito -- em vez de deixar o painel aberto e mudo.
  useEffect(() => {
    function aoExpirar() {
      setSessao(null);
      setAviso(AVISO_DE_EXPIRACAO);
    }
    window.addEventListener(SESSAO_EXPIRADA, aoExpirar);
    return () => window.removeEventListener(SESSAO_EXPIRADA, aoExpirar);
  }, []);

  // Clicou em "Sair" numa aba? As outras abas do painel saem junto. O evento
  // `storage` so dispara nas OUTRAS abas quando o localStorage muda, que e
  // exatamente o caso.
  useEffect(() => {
    function aoMudarArmazenamento() {
      if (!lerToken()) setSessao(null);
    }
    window.addEventListener("storage", aoMudarArmazenamento);
    return () => window.removeEventListener("storage", aoMudarArmazenamento);
  }, []);

  // Sai sozinho quando o token vence, para ninguem perder um formulario
  // inteiro descobrindo no "Publicar" que a sessao tinha acabado.
  useEffect(() => {
    if (!sessao?.expiraEm) return undefined;
    const restante = sessao.expiraEm - Date.now();
    // setTimeout estoura acima de ~24,8 dias; a sessao dura 12h, mas o limite
    // fica aqui para um AUTH de duracao maior nao virar disparo imediato.
    if (restante > 2 ** 31 - 1) return undefined;
    const relogio = setTimeout(() => {
      limparToken();
      setSessao(null);
      setAviso(AVISO_DE_EXPIRACAO);
    }, Math.max(0, restante));
    return () => clearTimeout(relogio);
  }, [sessao]);

  /**
   * Sai sozinho depois de 30 minutos sem nenhum clique ou tecla.
   *
   * O painel costuma ser aberto no computador da secretaria, que outras
   * pessoas usam. Quem esquece a aba aberta nao deixa o acesso da paroquia na
   * mao de quem sentar depois. Mexer o mouse ou digitar reinicia a contagem.
   */
  useEffect(() => {
    if (!sessao) return undefined;
    const LIMITE_PARADO_EM_MS = 30 * 60 * 1000;
    let relogio;

    function reiniciar() {
      clearTimeout(relogio);
      relogio = setTimeout(() => {
        limparToken();
        setSessao(null);
        setAviso("Você ficou 30 minutos sem usar o painel e saiu por segurança. Entre de novo.");
      }, LIMITE_PARADO_EM_MS);
    }

    const eventos = ["pointerdown", "keydown", "scroll", "touchstart"];
    eventos.forEach((nome) => window.addEventListener(nome, reiniciar, { passive: true }));
    reiniciar();

    return () => {
      clearTimeout(relogio);
      eventos.forEach((nome) => window.removeEventListener(nome, reiniciar));
    };
  }, [sessao]);

  function entrar(dados) {
    setAviso("");
    setSessao(dados);
  }

  function sair() {
    limparToken();
    setAviso("");
    setSessao(null);
  }

  if (verificando) return <div className="adm-carregando">Verificando sessão...</div>;
  if (!sessao) return <Login aoEntrar={entrar} aviso={aviso} />;

  return (
    <div className="adm-corpo">
      <header className="adm-topo">
        <div className="adm-topo-inner">
          <img src="/assets/logo.png" alt="" />
          <h1>Painel · Paróquia Santa Luzia</h1>
          <nav className="adm-menu">
            <NavLink to="/admin" end>
              Eventos
            </NavLink>
            <NavLink to="/admin/configuracoes">Configurações</NavLink>
          </nav>
          <span className="adm-topo-email">{sessao.email}</span>
          <Link to="/" className="adm-botao secundario pequeno" style={{ background: "#fff" }}>
            Ver site
          </Link>
          <button type="button" className="adm-botao secundario pequeno" style={{ background: "#fff" }} onClick={sair}>
            Sair
          </button>
        </div>
      </header>

      <main className="adm-conteudo">
        <Routes>
          <Route index element={<ListaDeEventos />} />
          <Route path="novo" element={<FormularioDeEvento />} />
          {/* Antes de ":id", senao "configuracoes" seria lido como id de evento. */}
          <Route path="configuracoes" element={<Configuracoes />} />
          <Route path=":id" element={<FormularioDeEvento />} />
        </Routes>
      </main>
    </div>
  );
}
