import { Facebook, Instagram, WhatsApp } from "./Icones.jsx";

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

export default function Redes() {
  return (
    <section className="redes-section">
      <div className="container reveal">
        <h3>Siga-nos nas Redes Sociais</h3>
        <p className="sub">Acompanhe as novidades da nossa paróquia</p>

        <div className="redes-links cascata">
          {REDES.map((rede) => (
            <a
              key={rede.rotulo}
              href={rede.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={rede.rotulo}
            >
              {rede.icone}
              <span className="rede-label">{rede.rotulo}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
