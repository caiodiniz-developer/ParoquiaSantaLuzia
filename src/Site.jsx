import { useMemo } from "react";
import { useEfeitosDeScroll } from "./hooks/useEfeitosDeScroll.js";
import { useRevelacaoScroll } from "./hooks/useRevelacaoScroll.js";
import { useParallaxDeCamadas } from "./hooks/useParallaxDeCamadas.js";
import { usePrefereMenosMovimento } from "./hooks/usePrefereMenosMovimento.js";
import { useInteracoesDoPonteiro } from "./hooks/useInteracoesDoPonteiro.js";

import Abertura from "./components/Abertura.jsx";
import Navbar, { SECOES } from "./components/Navbar.jsx";
import Hero from "./components/Hero.jsx";
import Estatisticas from "./components/Estatisticas.jsx";
import SantaLuzia from "./components/SantaLuzia.jsx";
import Comunidades from "./components/Comunidades.jsx";
import Liturgia from "./components/Liturgia.jsx";
import Eventos from "./components/Eventos.jsx";
import Horarios from "./components/Horarios.jsx";
import Doe from "./components/Doe.jsx";
import Contato from "./components/Contato.jsx";
import Padroeira from "./components/Padroeira.jsx";
import Redes from "./components/Redes.jsx";
import Rodape from "./components/Rodape.jsx";
import BotaoVoltarAoTopo from "./components/BotaoVoltarAoTopo.jsx";

export default function Site() {
  // useMemo porque o array vai como dependencia de um useEffect: recriado a
  // cada render, ele reinstalaria o listener de scroll sem parar.
  const idsDasSecoes = useMemo(() => SECOES.map((secao) => secao.id), []);
  const { rolou, mostrarTopo, progresso, secaoAtiva } = useEfeitosDeScroll(idsDasSecoes);

  // Revelacao do conteudo estatico. A secao de Eventos cuida da sua propria,
  // porque os cards dela so existem depois da resposta da API.
  useRevelacaoScroll([]);

  // Camadas de profundidade. Todos os alvos sao secoes e imagens fixas, entao
  // nao ha dependencia de conteudo assincrono aqui -- o que muda o hook e a
  // preferencia do sistema, que pode ser ligada com a pagina ja aberta.
  const menosMovimento = usePrefereMenosMovimento();
  useParallaxDeCamadas(!menosMovimento);

  // Luz do cursor, brilho nos cartoes e botoes magneticos. So com mouse; o
  // proprio hook confere isso.
  useInteracoesDoPonteiro(!menosMovimento);

  return (
    <>
      <Abertura />
      <div className="luz-do-cursor" aria-hidden="true" />
      <div className="cursor-anel" aria-hidden="true" />
      <div className="scroll-progress" style={{ width: `${progresso}%` }} />

      <Navbar rolou={rolou} secaoAtiva={secaoAtiva} />

      {/* A area principal: leitores de tela pulam direto para ca, e o Google
          entende o que e conteudo e o que e menu e rodape. */}
      <main id="conteudo" tabIndex={-1}>
        <Hero />
        <Estatisticas />
        <SantaLuzia />
        <Comunidades />
        <Liturgia />
        <Eventos />
        <Horarios />
        <Doe />
        <Contato />
        <Padroeira />
        <Redes />
      </main>
      <Rodape />

      <BotaoVoltarAoTopo visivel={mostrarTopo} progresso={progresso} />
    </>
  );
}
