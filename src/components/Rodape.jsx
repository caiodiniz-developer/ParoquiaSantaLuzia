import { Link } from "react-router-dom";

export default function Rodape() {
  return (
    <footer>
      <img src="/assets/logo.png" alt="Logo Paróquia Santa Luzia" />
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
    </footer>
  );
}
