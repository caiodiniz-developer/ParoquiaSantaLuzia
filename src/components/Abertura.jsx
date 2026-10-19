import { useEffect, useState } from "react";
import { usePrefereMenosMovimento } from "../hooks/usePrefereMenosMovimento.js";

/** Tempo total da cortina no CSS (atraso de 1,05s + 1s de subida), com folga. */
const DURACAO = 2200;

/**
 * Cortina de abertura: o logo acende, um fio dourado se desenha e a cortina
 * sobe revelando o hero. Toda a coreografia esta no extras.css; aqui so
 * tiramos o elemento do DOM quando ela termina, para nao sobrar uma camada
 * invisivel por cima da pagina.
 *
 * Quem pediu menos movimento nao ve cortina nenhuma.
 */
export default function Abertura() {
  const menosMovimento = usePrefereMenosMovimento();
  const [ativa, setAtiva] = useState(true);

  useEffect(() => {
    const relogio = setTimeout(() => setAtiva(false), DURACAO);
    return () => clearTimeout(relogio);
  }, []);

  if (!ativa || menosMovimento) return null;

  return (
    <div className="abertura" aria-hidden="true">
      <div className="abertura-miolo">
        <img src="/assets/logo.png" alt="" />
        <div className="abertura-fio" />
      </div>
    </div>
  );
}
