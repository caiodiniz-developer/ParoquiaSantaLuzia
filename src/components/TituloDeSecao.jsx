/**
 * Cruz + titulo + divisor dourado: o cabecalho que se repetia identico em sete
 * secoes do HTML antigo. `classeDoTitulo` existe porque a secao de Horarios
 * usa uma variante de estilo propria.
 */
export default function TituloDeSecao({
  titulo,
  subtitulo,
  classeDoTitulo = "section-title",
  classeDoSubtitulo,
  comDivisor = true,
}) {
  return (
    // `cascata` escalona a entrada dos filhos: cruz, titulo, divisor e
    // subtitulo aparecem em sequencia em vez de todos de uma vez.
    <div className="reveal cascata" style={{ textAlign: "center" }}>
      <div className="section-cross">&#10016;</div>
      <h2 className={classeDoTitulo}>{titulo}</h2>
      {comDivisor && <div className="gold-divider" />}
      {subtitulo && <p className={classeDoSubtitulo}>{subtitulo}</p>}
    </div>
  );
}
