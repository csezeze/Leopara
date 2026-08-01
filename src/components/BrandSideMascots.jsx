const processSteps = [
  {
    number: "01",
    title: "CV'ni ekle",
    description: "Metin olarak yapıştır veya dosya yükle.",
  },
  {
    number: "02",
    title: "İlanı seç",
    description: "İş veya staj ilanını ekle.",
  },
  {
    number: "03",
    title: "Eşleşmeni gör",
    description: "Güçlü ve gelişime açık alanları incele.",
  },
];

const analysisItems = [
  "Teknik beceriler",
  "Deneyim ve projeler",
  "Eğitim ve sertifikalar",
  "Portföy ve GitHub",
  "İlan anahtar kelimeleri",
];

function BrandSideMascots() {
  return (
    <>
      <aside className="leopara-side-rail leopara-left-rail">
        <img
          className="brand-side-mascot"
          src="/brand/leopara-mascot-left.png"
          alt=""
          width="500"
          height="665"
          aria-hidden="true"
          draggable={false}
        />
        <div className="leopara-rail-card">
          <h2>3 adımda LEOPARA</h2>
          <div className="leopara-step-list">
            {processSteps.map((step) => (
              <div className="leopara-step" key={step.number}>
                <span>{step.number}</span>
                <div>
                  <strong>{step.title}</strong>
                  <p>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="leopara-side-visual leopara-side-visual-left" aria-hidden="true">
          <img
            src="/brand/leopara-profile-visual.png"
            alt=""
            width="1536"
            height="1024"
            draggable={false}
          />
        </div>
      </aside>

      <aside className="leopara-side-rail leopara-right-rail">
        <img
          className="brand-side-mascot"
          src="/brand/leopara-mascot-right.png"
          alt=""
          width="500"
          height="665"
          aria-hidden="true"
          draggable={false}
        />
        <div className="leopara-speech-bubble" role="note">
          <p>
            Sevimli göründüğüme bakmayın; CV'nizi ilan gereksinimlerine göre kanıtlarıyla ve
            titizlikle analiz ederim.
          </p>
        </div>
        <div className="leopara-rail-card">
          <h2>LEOPARA neyi inceler?</h2>
          <div className="leopara-chip-list">
            {analysisItems.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
        <div className="leopara-side-visual leopara-side-visual-right" aria-hidden="true">
          <img
            src="/brand/leopara-insight-visual.png"
            alt=""
            width="1536"
            height="1024"
            draggable={false}
          />
        </div>
      </aside>
    </>
  );
}

export default BrandSideMascots;
