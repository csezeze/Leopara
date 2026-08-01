const features = [
  {
    title: "Uyum Skoru",
    description: "CV'niz ile ilan beklentilerini karşılaştırır, güçlü ve eksik alanları anlaşılır skorlarla gösterir.",
  },
  {
    title: "Kanıtlı Değerlendirme",
    description: "Her gereksinim için CV'nizde bulunan somut ifadeleri ayrı ayrı listeler.",
  },
  {
    title: "Başvuru Rehberi",
    description: "Eksik beceriler için etik CV önerileri, mini portfolyo fikri ve mülakat soruları sunar.",
  },
];

function Hero() {
  return (
    <section id="anasayfa" className="hero">
      <div className="hero-panel">
        <span className="eyebrow">LEOPARA • Akıllı Kariyer Eşleştirme</span>
        <h1>CV ve İlan Uyumu Tek Ekranda</h1>
        <p>
          LEOPARA, CV'nizi iş ve staj ilanlarıyla karşılaştırır; güçlü yönlerinizi, eksik becerilerinizi ve başvuru hazırlığınızı netleştirir.
        </p>

        <div id="ozellikler" className="feature-grid">
          {features.map((feature) => (
            <article key={feature.title} className="feature-card">
              <strong>{feature.title}</strong>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Hero;
