import { useEffect, useState } from "react";
import { agoraEmSaoPaulo } from "../lib/agora.js";

/**
 * O relogio de Sao Paulo, atualizado a cada minuto.
 *
 * O primeiro tique e acertado com a virada do minuto: assim "Aberta agora"
 * vira "Fechada" exatamente as 18h00, e nao ate 59 segundos depois.
 */
export function useRelogio() {
  const [agora, setAgora] = useState(() => agoraEmSaoPaulo());

  useEffect(() => {
    let intervalo;
    const ateAViradaDoMinuto = 60_000 - (Date.now() % 60_000);
    const primeiro = setTimeout(() => {
      setAgora(agoraEmSaoPaulo());
      intervalo = setInterval(() => setAgora(agoraEmSaoPaulo()), 60_000);
    }, ateAViradaDoMinuto);

    return () => {
      clearTimeout(primeiro);
      clearInterval(intervalo);
    };
  }, []);

  return agora;
}
