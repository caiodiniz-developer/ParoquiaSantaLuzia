import { useEffect, useState } from "react";
import { configuracoes as apiConfiguracoes } from "../lib/api.js";
import { CONFIGURACOES_PADRAO, useConfiguracoes } from "../hooks/useConfiguracoes.js";

/**
 * Ajustes do site que nao pedem mexer no codigo. Hoje e um so -- quantos
 * eventos aparecem em "Proximos Eventos" -- mas a tabela do servidor e de
 * chave/valor justamente para os proximos entrarem sem migracao de banco.
 */
export default function Configuracoes() {
  const { configuracoes, carregado } = useConfiguracoes();
  const [eventosNaHome, setEventosNaHome] = useState(CONFIGURACOES_PADRAO.eventosNaHome);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  // Quando a API responde, o campo passa a mostrar o valor salvo.
  useEffect(() => {
    setEventosNaHome(configuracoes.eventosNaHome);
  }, [configuracoes.eventosNaHome]);

  async function salvar(evento) {
    evento.preventDefault();
    setErro("");
    setSucesso("");
    setSalvando(true);
    try {
      await apiConfiguracoes.salvar({ eventosNaHome: Number(eventosNaHome) });
      setSucesso("Configurações salvas. O site já usa os valores novos.");
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setSalvando(false);
    }
  }

  if (!carregado) return <p className="adm-vazio">Carregando configurações...</p>;

  return (
    <>
      <div className="adm-cabecalho-pagina">
        <h2>Configurações do site</h2>
      </div>

      {sucesso && <div className="adm-aviso sucesso">{sucesso}</div>}
      {erro && <div className="adm-aviso erro">{erro}</div>}

      <form className="adm-cartao" onSubmit={salvar} style={{ maxWidth: 560 }}>
        <div className="adm-campo">
          <label htmlFor="eventosNaHome">Eventos em “Próximos Eventos”</label>
          <input
            id="eventosNaHome"
            type="number"
            min={1}
            max={24}
            required
            value={eventosNaHome}
            onChange={(e) => setEventosNaHome(e.target.value)}
          />
          <p className="adm-dica">
            Quantos cards aparecem no site, de 1 a 24. Os eventos em destaque vêm primeiro, depois
            os mais próximos. Os demais continuam cadastrados e entram sozinhos conforme as datas
            passam.
          </p>
        </div>

        <button type="submit" className="adm-botao" disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar configurações"}
        </button>
      </form>
    </>
  );
}
