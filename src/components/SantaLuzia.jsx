import TituloDeSecao from "./TituloDeSecao.jsx";
import TextoRevelado from "./TextoRevelado.jsx";

export default function SantaLuzia() {
  return (
    <section className="santa-section" id="santa-luzia">
      <div className="container">
        <TituloDeSecao titulo="Quem foi Santa Luzia" />

        <div className="santa-grid">
          <div className="santa-img-wrap reveal-left">
            <div className="img-frame">
              <img
                src="/assets/santa-luzia.png"
                alt="Santa Luzia segurando uma palma e um prato com olhos"
                width={500}
                height={500}
                // Fica abaixo da primeira tela: baixa so quando a pessoa chega
                // perto, sem disputar banda com o hero.
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>

          <div className="santa-text reveal-right cascata">
            <p>
              Santa Luzia, cujo nome de origem latina remete à luz, é uma das santas mais
              queridas da Igreja, sendo invocada como a protetora dos olhos. Nascida em uma
              família rica de Siracusa, na Itália, recebeu uma sólida formação cristã e fez
              um voto de virgindade perpétua. Após uma peregrinação ao túmulo de Santa
              Águeda, onde obteve a cura de sua mãe, Luzia recebeu permissão para manter sua
              castidade e distribuir seu dote milionário entre os pobres. No entanto, seu
              ex-noivo, inconformado com o cancelamento do matrimônio e com a doação da
              fortuna, denunciou-a às autoridades romanas durante a perseguição de
              Diocleciano.
            </p>

            <TextoRevelado como="div" className="highlight-verse reveal delay-2">
              "Pela luz da fé, Santa Luzia iluminou a vida de todos ao seu redor, mostrando
              que o verdadeiro tesouro não está nos bens materiais, mas no amor a Deus."
            </TextoRevelado>

            <p>
              Levada a julgamento em 303, Santa Luzia demonstrou uma resistência milagrosa:
              mesmo sob ordens para ser levada a um prostíbulo, seu corpo tornou-se tão
              pesado que dez homens não conseguiram movê-la. Ela sobreviveu a torturas com
              resina e azeite ferventes, vindo a falecer apenas em 304, após um golpe de
              espada na garganta. A tradição oral narra que ela teria arrancado os próprios
              olhos para não renegar sua fé, motivo pelo qual a arte e a literatura &mdash;
              incluindo "A Divina Comédia", de Dante Alighieri &mdash; a imortalizaram como a
              graça iluminadora. Sua existência histórica foi confirmada em 1894 por uma
              inscrição em grego antigo em seu sepulcro, e hoje suas relíquias repousam na
              Catedral de Veneza, com sua festa celebrada mundialmente no dia 13 de dezembro.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
