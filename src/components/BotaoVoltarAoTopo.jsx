import { SetaParaCima } from "./Icones.jsx";

export default function BotaoVoltarAoTopo({ visivel, progresso = 0 }) {
  return (
    <button
      type="button"
      className={`back-to-top${visivel ? " show" : ""}`}
      aria-label="Voltar ao topo"
      aria-hidden={!visivel}
      tabIndex={visivel ? 0 : -1}
      // O anel em volta do botao mostra quanto da pagina ja foi lido.
      style={{ "--progresso": progresso.toFixed(1) }}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <svg className="anel" viewBox="0 0 56 56" aria-hidden="true">
        <circle cx="28" cy="28" r="26" />
      </svg>
      <SetaParaCima />
    </button>
  );
}
