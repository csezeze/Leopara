const features = [
  {
    title: "Kanıt Tabanlı Eşleşme",
    description: "Her ilan gereksinimi için CV'de hangi kanıtın bulunduğunu gör.",
  },
  {
    title: "Staj Modu",
    description: "Ders, proje, sertifika ve portfolyo sinyallerini staj adayları için ayrı değerlendir.",
  },
  {
    title: "Başvuru Koçluğu",
    description: "Eksikler için mini proje, etik CV önerisi ve mülakat soruları al.",
  },
];

function Hero() {
  return (
    <section id="anasayfa" className="hero">
      <div className="hero-panel">
        <span className="eyebrow">LEOPARA • Sprint 1 MVP</span>
        <h1>Akıllı CV - İş ve Staj İlanı Eşleştirme</h1>
        <p>
          CV'ni ilan gereksinimleriyle karşılaştır, başvuruya ne kadar hazır olduğunu ve neyi geliştirmen gerektiğini gör.
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
