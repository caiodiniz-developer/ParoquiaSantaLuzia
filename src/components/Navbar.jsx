import { useEffect, useState } from "react";

export const SECOES = [
  { id: "inicio", rotulo: "Início" },
  { id: "santa-luzia", rotulo: "Santa Luzia" },
  { id: "comunidades", rotulo: "Comunidades" },
  { id: "liturgia", rotulo: "Liturgia" },
  { id: "eventos", rotulo: "Eventos" },
  { id: "horarios", rotulo: "Horários" },
  { id: "doe", rotulo: "Doe" },
  { id: "contato", rotulo: "Contato" },
];

export default function Navbar({ rolou, secaoAtiva }) {
  const [menuAberto, setMenuAberto] = useState(false);

  // Trava a rolagem do fundo enquanto o menu cobre a tela. O return desfaz a
  // trava mesmo se o componente sair da tela com o menu aberto -- sem isso a
  // pagina fica travada para sempre.
  useEffect(() => {
    document.body.style.overflow = menuAberto ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuAberto]);

  // Esc fecha o menu do celular, como todo menu que cobre a tela.
  useEffect(() => {
    if (!menuAberto) return undefined;
    function aoTeclar(evento) {
      if (evento.key === "Escape") setMenuAberto(false);
    }
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [menuAberto]);

  return (
    <>
      <nav className={`navbar${rolou ? " scrolled" : ""}`} aria-label="Menu principal">
        <div className="inner">
          <a href="#inicio" className="logo-link">
            <img src="/assets/logo.png" alt="Logo Paróquia Santa Luzia" />
            <span className="logo-text">Paróquia Santa Luzia</span>
          </a>

          <ul className="nav-links">
            {SECOES.map((secao) => (
              <li key={secao.id}>
                <a
                  href={`#${secao.id}`}
                  className={secaoAtiva === secao.id ? "active" : undefined}
                  // Leitor de tela anuncia "local atual" no link da secao em que
                  // a pessoa esta, o que o destaque visual sozinho nao faz.
                  aria-current={secaoAtiva === secao.id ? "location" : undefined}
                >
                  {secao.rotulo}
                </a>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className={`hamburger${menuAberto ? " open" : ""}`}
            aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuAberto}
            onClick={() => setMenuAberto((aberto) => !aberto)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      <div className={`mobile-menu${menuAberto ? " open" : ""}`}>
        <div className="menu-cross">&#10016;</div>
        {SECOES.map((secao) => (
          <a
            key={secao.id}
            href={`#${secao.id}`}
            className="mobile-link"
            onClick={() => setMenuAberto(false)}
          >
            {secao.rotulo}
          </a>
        ))}
      </div>
    </>
  );
}
