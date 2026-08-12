import { Fragment } from "react";

/**
 * Revela um texto palavra por palavra quando o bloco entra na tela.
 *
 * Reservado para as tres citacoes do site (o versiculo sobre Santa Luzia, a
 * oracao a padroeira e a passagem de Coríntios na doacao). Fora delas o efeito
 * viraria maneirismo: o que se quer aqui e o ritmo de quem le uma oracao em voz
 * alta, nao texto se montando na tela.
 *
 * O espaco fica FORA do <span> de proposito. Palavra em display:inline-block
 * com o espaco dentro nao quebra linha direito no fim da linha; com o espaco
 * como texto solto entre os spans, a quebra volta a ser a normal do navegador.
 */
export default function TextoRevelado({ children, className = "", como: Elemento = "p" }) {
  // Se vier qualquer coisa que nao seja texto puro (um <strong>, uma variavel),
  // devolvemos o conteudo intacto: e melhor perder a animacao do que quebrar a
  // marcacao de uma citacao.
  if (typeof children !== "string") {
    return <Elemento className={className}>{children}</Elemento>;
  }

  const palavras = children.split(/\s+/).filter(Boolean);

  return (
    <Elemento className={`${className} texto-revelado`.trim()}>
      {palavras.map((palavra, indice) => (
        <Fragment key={indice}>
          {/* O indice vira o atraso de cada palavra no CSS. Vai como texto
              para nao depender do React saber que variavel CSS nao leva "px". */}
          <span className="palavra" style={{ "--i": String(indice) }}>
            {palavra}
          </span>
          {indice < palavras.length - 1 ? " " : ""}
        </Fragment>
      ))}
    </Elemento>
  );
}
