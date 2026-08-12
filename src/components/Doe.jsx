import { useEffect, useRef, useState } from "react";
import TituloDeSecao from "./TituloDeSecao.jsx";
import TextoRevelado from "./TextoRevelado.jsx";
import { Confirmado, Copiar } from "./Icones.jsx";

const CNPJ = "44.588.960/0133-30";
const CHAVE_PIX = "44588960013330";

function BotaoCopiar({ valor }) {
  const [copiado, setCopiado] = useState(false);
  const relogio = useRef(null);

  // Limpa o timer se o componente sair da tela antes dos 2 segundos.
  useEffect(() => () => clearTimeout(relogio.current), []);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(valor);
      setCopiado(true);
      relogio.current = setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Navegador sem permissao de area de transferencia (http, iOS antigo):
      // o valor esta visivel na tela para copiar a mao, entao so nao damos o
      // retorno visual de sucesso.
      console.warn("Não foi possível copiar automaticamente.");
    }
  }

  return (
    <button type="button" className={`pix-copy-btn${copiado ? " copied" : ""}`} onClick={copiar}>
      {copiado ? <Confirmado /> : <Copiar />}
      {copiado ? "Copiado!" : "Copiar"}
    </button>
  );
}

export default function Doe() {
  return (
    <section className="doe-section" id="doe">
      <div className="container-sm">
        <TituloDeSecao
          titulo="Doe para Nossa Paróquia"
          subtitulo="Sua contribuição ajuda a manter nossa paróquia e suas comunidades. Deus abençoe sua generosidade!"
          classeDoSubtitulo="doe-subtitle"
        />

        <div className="reveal-scale">
          <div className="pix-box cascata">
            <div className="pix-icon">&#9769;</div>
            <h3>Chave PIX</h3>

            <div className="pix-info-card">
              <p className="label">CNPJ</p>
              <p className="value">{CNPJ}</p>
              <BotaoCopiar valor={CNPJ} />
            </div>

            <div className="pix-info-card">
              <p className="label">Nome</p>
              <p className="value" style={{ fontSize: "1.05rem" }}>
                Paróquia Santa Luzia
              </p>
              <p className="sub">Jardim dos Oliveiras - Campinas/SP</p>
            </div>

            <div className="pix-info-card">
              <p className="label">PIX</p>
              <p className="value" style={{ fontSize: "1.05rem" }}>
                {CHAVE_PIX}
              </p>
              <BotaoCopiar valor={CHAVE_PIX} />
            </div>

            <TextoRevelado className="pix-quote">
              "Cada um contribua segundo o propósito do seu coração, não com tristeza ou por
              necessidade; porque Deus ama a quem dá com alegria." &mdash; 2 Coríntios 9:7
            </TextoRevelado>
          </div>
        </div>
      </div>
    </section>
  );
}
