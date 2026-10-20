import { Fragment } from "react";

/**
 * Quebra um titulo em palavras, cada uma dentro de uma mascara. Quando o bloco
 * pai ganha `.visible`, as palavras sobem de baixo da mascara uma depois da
 * outra (a coreografia esta em src/estilos/tipografia.css).
 *
 * Diferente do TextoRevelado, que acende as citacoes devagar como quem reza,
 * aqui o ritmo e rapido: e um titulo, ele precisa estar inteiro em meio
 * segundo.
 *
 * Texto que nao for string passa intacto -- melhor perder a animacao que a
 * marcacao.
 */
export default function PalavrasMascaradas({ children }) {
  if (typeof children !== "string") return children;

  const palavras = children.split(/\s+/).filter(Boolean);

  return palavras.map((palavra, indice) => (
    <Fragment key={indice}>
      <span className="titulo-mascara">
        <span className="titulo-palavra" style={{ "--p": String(indice) }}>
          {palavra}
        </span>
      </span>
      {indice < palavras.length - 1 ? " " : ""}
    </Fragment>
  ));
}
