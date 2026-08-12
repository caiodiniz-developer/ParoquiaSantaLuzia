import { useEffect, useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import { autenticacao, lerToken, limparToken } from "../lib/api.js";
import Login from "./Login.jsx";
import ListaDeEventos from "./ListaDeEventos.jsx";
import FormularioDeEvento from "./FormularioDeEvento.jsx";
import "./admin.css";

export default function Admin() {
  const [sessao, setSessao] = useState(null);
  const [verificando, setVerificando] = useState(true);

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
      .then((dados) => setSessao({ email: dados.email }))
      .catch((falha) => {
        if (falha.name !== "AbortError") limparToken();
      })
      .finally(() => setVerificando(false));

    return () => controle.abort();
  }, []);

  function sair() {
    limparToken();
    setSessao(null);
  }

  if (verificando) return <div className="adm-carregando">Verificando sessão...</div>;
  if (!sessao) return <Login aoEntrar={setSessao} />;

  return (
    <div className="adm-corpo">
      <header className="adm-topo">
        <div className="adm-topo-inner">
          <img src="/assets/logo.png" alt="" />
          <h1>Painel · Paróquia Santa Luzia</h1>
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
          <Route path=":id" element={<FormularioDeEvento />} />
        </Routes>
      </main>
    </div>
  );
}
