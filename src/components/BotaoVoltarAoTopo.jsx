import { SetaParaCima } from "./Icones.jsx";

export default function BotaoVoltarAoTopo({ visivel }) {
  return (
    <button
      type="button"
      className={`back-to-top${visivel ? " show" : ""}`}
      aria-label="Voltar ao topo"
      aria-hidden={!visivel}
      tabIndex={visivel ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <SetaParaCima />
    </button>
  );
}
