import { useState } from "react";
import { autenticacao, salvarToken } from "../lib/api.js";

export default function Login({ aoEntrar, aviso = "" }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function entrar(evento) {
    evento.preventDefault();
    setErro("");
    setEnviando(true);

    try {
      const resposta = await autenticacao.entrar(email, senha);
      salvarToken(resposta.token);
      aoEntrar({ email: resposta.email, expiraEm: resposta.expiraEm });
    } catch (falha) {
      // A API responde a mesma mensagem para e-mail errado e senha errada,
      // de proposito. Aqui so repassamos.
      setErro(
        falha.status === 0
          ? "Servidor fora do ar. Se acabou de abrir o site, espere alguns segundos e tente de novo."
          : falha.message,
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="adm-login">
      <form className="adm-login-caixa" onSubmit={entrar}>
        <img src="/assets/logo.png" alt="Paróquia Santa Luzia" />
        <h1>Painel da Paróquia</h1>
        <p className="sub">Entre para gerenciar os eventos do site</p>

        {/* O aviso de sessao expirada some assim que aparece um erro novo:
            os dois juntos na tela confundem mais do que explicam. */}
        {aviso && !erro && <div className="adm-aviso atencao">{aviso}</div>}
        {erro && <div className="adm-aviso erro">{erro}</div>}

        <div className="adm-campo">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="adm-campo">
          <label htmlFor="senha">Senha</label>
          <input
            id="senha"
            type="password"
            required
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </div>

        <button type="submit" className="adm-botao" style={{ width: "100%" }} disabled={enviando}>
          {enviando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
