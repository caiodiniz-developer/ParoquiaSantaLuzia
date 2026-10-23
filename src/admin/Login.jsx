import { useState } from "react";
import { autenticacao, salvarToken } from "../lib/api.js";

export default function Login({ aoEntrar, aviso = "" }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  // Caps Lock ligado e a causa numero um de "senha errada" -- e agora cada
  // erro conta para o bloqueio de 15 minutos. Avisar antes poupa tentativas.
  const [capsLigado, setCapsLigado] = useState(false);
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
          <div className="adm-senha">
            <input
              id="senha"
              type={mostrarSenha ? "text" : "password"}
              required
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              onKeyUp={(e) => setCapsLigado(e.getModifierState?.("CapsLock") ?? false)}
              onBlur={() => setCapsLigado(false)}
            />
            <button
              type="button"
              className="adm-senha-olho"
              onClick={() => setMostrarSenha((atual) => !atual)}
              aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
              aria-pressed={mostrarSenha}
            >
              {mostrarSenha ? "Ocultar" : "Mostrar"}
            </button>
          </div>
          {capsLigado && (
            <p className="adm-dica" role="status" style={{ color: "#8a6d18" }}>
              Atenção: o Caps Lock está ligado.
            </p>
          )}
        </div>

        <button type="submit" className="adm-botao" style={{ width: "100%" }} disabled={enviando}>
          {enviando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
