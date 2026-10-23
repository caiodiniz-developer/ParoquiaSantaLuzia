import { useEffect, useRef, useState } from "react";
import TituloDeSecao from "./TituloDeSecao.jsx";
import TextoRevelado from "./TextoRevelado.jsx";
import { Confirmado, Copiar } from "./Icones.jsx";
import { codigoPix } from "../lib/pix.js";

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

// Montado uma vez: o codigo e o mesmo para todo mundo (sem valor fixo).
const CODIGO_PIX = codigoPix({
  chave: CHAVE_PIX,
  nome: "Paroquia Santa Luzia",
  cidade: "Campinas",
});

/**
 * PIX Copia e Cola + QR Code.
 *
 * No celular a pessoa copia o codigo e cola no app do banco, que ja preenche
 * a chave e o nome -- so falta o valor. No computador, mostra o QR para
 * escanear com o celular.
 *
 * A biblioteca do QR (~25 KB) so e baixada quando alguem pede o QR: quem
 * nunca abre nao paga por ela no carregamento do site.
 */
function PixCopiaECola() {
  const [qr, setQr] = useState("");
  const [gerando, setGerando] = useState(false);
  const [falhou, setFalhou] = useState(false);

  async function mostrarQr() {
    setGerando(true);
    setFalhou(false);
    try {
      const { toDataURL } = await import("qrcode");
      setQr(
        await toDataURL(CODIGO_PIX, {
          errorCorrectionLevel: "M",
          margin: 1,
          width: 280,
          color: { dark: "#0e2f1c", light: "#ffffff" },
        }),
      );
    } catch {
      setFalhou(true);
    } finally {
      setGerando(false);
    }
  }

  return (
    <div className="pix-copia-cola">
      <p className="label">PIX Copia e Cola</p>
      <p className="sub">
        Copie e cole no app do seu banco: a chave e o nome já vêm preenchidos, é só escolher o
        valor.
      </p>
      <div className="pix-copia-cola-acoes">
        <BotaoCopiar valor={CODIGO_PIX} />
        {!qr && (
          <button type="button" className="pix-qr-btn" onClick={mostrarQr} disabled={gerando}>
            {gerando ? "Gerando..." : "Mostrar QR Code"}
          </button>
        )}
      </div>
      {falhou && <p className="sub">Não foi possível gerar o QR agora. Use o Copia e Cola.</p>}
      {qr && (
        <figure className="pix-qr">
          <img src={qr} alt="QR Code do PIX da Paróquia Santa Luzia" width={220} height={220} />
          <figcaption>Aponte a câmera do app do banco para o código.</figcaption>
        </figure>
      )}
    </div>
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

            <PixCopiaECola />

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
