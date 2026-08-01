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
        <div className="leopara-rail-card">
          <h2>LEOPARA neyi inceler?</h2>
          <div className="leopara-chip-list">
            {analysisItems.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}

export default BrandSideMascots;
