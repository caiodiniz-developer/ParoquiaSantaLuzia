import { Link } from "react-router-dom";
import { SECOES } from "./Navbar.jsx";
import { Facebook, Instagram, WhatsApp } from "./Icones.jsx";

const ENDERECO = "Rua René Fernandes, 71 - Jardim dos Oliveiras";
const MAPA = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${ENDERECO}, Campinas - SP`,
)}`;

const REDES = [
  {
    rotulo: "Instagram",
    url: "https://www.instagram.com/santaluzia.paroquia?igsh=MWt1ZnVsazJxMW5uMQ==",
    icone: <Instagram />,
  },
  { rotulo: "WhatsApp", url: "https://wa.me/5519992410546", icone: <WhatsApp /> },
  {
    rotulo: "Facebook",
    url: "https://www.facebook.com/ParoquiaSantaLuziaJardimDasOliveiras",
    icone: <Facebook />,
  },
];

export default function Rodape() {
  return (
    <footer>
      {/* O que as pessoas procuram no fim da pagina: onde fica, como falar e
          um atalho para cada secao. Tudo ja estava no site, espalhado. */}
      <div className="rodape-grade">
        <div className="rodape-marca">
          <img
            src="/assets/logo.png"
            alt="Logo Paróquia Santa Luzia"
            width={474}
            height={526}
            loading="lazy"
            decoding="async"
          />
          <p className="rodape-nome">Paróquia Santa Luzia</p>
          <p className="rodape-lema">Arquidiocese de Campinas/SP</p>
          <div className="rodape-redes">
            {REDES.map((rede) => (
              <a
                key={rede.rotulo}
                href={rede.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={rede.rotulo}
              >
                {rede.icone}
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="rodape-titulo">Igreja Matriz</p>
          <address className="rodape-texto">
            {ENDERECO}
            <br />
            Campinas/SP
          </address>
          <a className="rodape-link" href={MAPA} target="_blank" rel="noopener noreferrer">
            Como chegar →
          </a>
        </div>

        <div>
          <p className="rodape-titulo">Secretaria</p>
          <p className="rodape-texto">
            <a href="tel:+551932714495">(19) 3271-4495</a>
            <br />
            <a href="https://wa.me/5519992410546" target="_blank" rel="noopener noreferrer">
              WhatsApp (19) 99241-0546
            </a>
          </p>
          <p className="rodape-texto rodape-pequeno">
            Seg 13h–18h · Ter a sex 9h–12h e 13h–18h · Sáb 8h–12h
          </p>
        </div>

        <nav aria-label="Atalhos do rodapé">
          <p className="rodape-titulo">Navegue</p>
          <ul className="rodape-atalhos">
            {SECOES.map((secao) => (
              <li key={secao.id}>
                <a href={`#${secao.id}`}>{secao.rotulo}</a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="rodape-base">
        <p className="rights">Todos os direitos reservados | Paróquia Santa Luzia</p>
        <p className="dev">
          Desenvolvido por{" "}
          <a href="https://caiodiniz.dev.br" target="_blank" rel="noopener noreferrer">
            Caio Diniz
          </a>
        </p>
        {/* Porta de entrada discreta do painel. Quem nao souber que existe nao
            vai procurar; quem cuida do site nao precisa decorar a URL. */}
        <p className="dev" style={{ marginTop: "0.75rem", opacity: 0.55 }}>
          <Link to="/admin">Área restrita</Link>
        </p>
      </div>
    </footer>
  );
}
