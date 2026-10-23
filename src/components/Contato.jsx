import { useEffect, useRef, useState } from "react";
import TituloDeSecao from "./TituloDeSecao.jsx";
import { WhatsApp } from "./Icones.jsx";

const TELEFONE = "5519992410546";
const LIMITE_DA_MENSAGEM = 500;

const ASSUNTOS = [
  "Falar com o Padre",
  "Participar do Dízimo",
  "Confessar",
  "Participar da Paróquia",
  "Agendar Batizado",
  "Agendar Casamento",
  "Informações sobre Catequese",
  "Informações sobre Crisma",
  "Participar de Grupo de Oração",
  "Voluntariado",
  "Outro assunto",
];

export default function Contato() {
  const [nome, setNome] = useState("");
  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviado, setEnviado] = useState(false);
  const relogios = useRef([]);

  useEffect(() => {
    const pendentes = relogios.current;
    return () => pendentes.forEach(clearTimeout);
  }, []);

  function enviar(evento) {
    evento.preventDefault();
    if (!nome.trim() || !assunto) return;

    let texto = `Ola, meu nome e *${nome.trim()}*.\nGostaria de: *${assunto}*`;
    if (mensagem.trim()) texto += `\n\nMensagem: ${mensagem.trim()}`;

    setEnviado(true);

    // A pausa de 800ms deixa a confirmacao aparecer antes da aba do WhatsApp
    // roubar o foco; depois de 1,5s o formulario volta limpo para quem
    // fechar o WhatsApp e voltar ao site.
    relogios.current.push(
      setTimeout(() => {
        window.open(`https://wa.me/${TELEFONE}?text=${encodeURIComponent(texto)}`, "_blank");

        relogios.current.push(
          setTimeout(() => {
            setEnviado(false);
            setNome("");
            setAssunto("");
            setMensagem("");
          }, 1500),
        );
      }, 800),
    );
  }

  return (
    <section className="contato-section" id="contato">
      <div className="container-sm">
        <TituloDeSecao titulo="Fale com o Nosso Coordenador" />

        <div className="reveal-scale">
          <div className="form-box">
            <form
              className="cascata"
              onSubmit={enviar}
              style={{ display: enviado ? "none" : undefined }}
            >
              <div className="form-group">
                <label htmlFor="nome">Nome completo *</label>
                <input
                  type="text"
                  id="nome"
                  required
                  minLength={3}
                  maxLength={80}
                  autoComplete="name"
                  placeholder="Digite seu nome completo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="assunto">O que deseja fazer em nossa comunidade? *</label>
                <select
                  id="assunto"
                  required
                  value={assunto}
                  onChange={(e) => setAssunto(e.target.value)}
                >
                  <option value="" disabled>
                    Selecione uma opção...
                  </option>
                  {ASSUNTOS.map((opcao) => (
                    <option value={opcao} key={opcao}>
                      {opcao}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="mensagem">Mensagem adicional (opcional)</label>
                <textarea
                  id="mensagem"
                  placeholder="Escreva aqui sua mensagem..."
                  maxLength={LIMITE_DA_MENSAGEM}
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                />
                <div className="char-count">
                  <span>{mensagem.length}</span>/{LIMITE_DA_MENSAGEM}
                </div>
              </div>

              <button type="submit" className="btn-whatsapp">
                <WhatsApp />
                Enviar via WhatsApp
              </button>

              <p className="form-note">
                Ao clicar, você será redirecionado para o WhatsApp da paróquia com sua
                mensagem pronta.
              </p>
            </form>

            <div className={`form-success${enviado ? " show" : ""}`}>
              <div className="check">&#10004;</div>
              <p>Redirecionando para o WhatsApp...</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
