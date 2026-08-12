import TextoRevelado from "./TextoRevelado.jsx";

const IMAGEM_DA_PADROEIRA =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-m9RMsrbUIy6r3VS2TDmJavPZkGLCYJ.png";

export default function Padroeira() {
  return (
    <section className="padroeira-section">
      <div className="container">
        <div className="padroeira-grid">
          <div className="padroeira-img reveal-left">
            <div className="img-wrap">
              <img src={IMAGEM_DA_PADROEIRA} alt="Estátua de Santa Luzia na igreja" />
              <div className="overlay" />
            </div>
          </div>

          <div className="padroeira-text reveal-right cascata">
            <div className="section-cross" style={{ textAlign: "left" }}>
              &#10016;
            </div>
            <h2>
              Santa Luzia, padroeira dos olhos,
              <br />
              <span>rogai por nós.</span>
            </h2>
            <div className="gold-divider" style={{ margin: "0 0 2rem" }} />
            <TextoRevelado className="quote">
              "Pela intercessão de Santa Luzia, que a luz da fé ilumine nossos caminhos e que
              possamos enxergar a presença de Deus em todas as coisas."
            </TextoRevelado>
            <p className="festa">&#128197; Festa: 13 de dezembro</p>
          </div>
        </div>
      </div>
    </section>
  );
}
