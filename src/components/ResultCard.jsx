function getScoreClass(score) {
  if (score >= 75) {
    return "score-high";
  }

  if (score >= 50) {
    return "score-medium";
  }

  return "score-low";
}

function ResultCard({ result }) {
  const scoreClass = getScoreClass(result.match_score);
  const readinessClass = getScoreClass(result.readiness_score);

  return (
    <article className="result-card">
      <div className="score-summary">
        <div className={`score-panel ${scoreClass}`}>
          <span>Eşleşme Skoru</span>
          <strong>{result.match_score}/100</strong>
        </div>
        <div className={`score-panel ${readinessClass}`}>
          <span>Başvuruya Hazırlık</span>
          <strong>{result.readiness_score}/100</strong>
        </div>
      </div>

      <div className="progress-track">
        <div
          className={`progress-bar ${scoreClass}`}
          style={{ width: `${result.match_score}%` }}
        />
      </div>

      <div className="result-block">
        <strong>Skor Açıklaması</strong>
        <p className="helper-text">{result.score_explanation}</p>
      </div>

      <div className="result-block">
        <strong>Eşleşen Beceriler</strong>
        <div className="tag-list">
          {result.matched_skills.length ? (
            result.matched_skills.map((skill) => (
              <span key={skill} className="tag">
                {skill}
              </span>
            ))
          ) : (
            <span className="helper-text">Henüz eşleşen beceri bulunamadı.</span>
          )}
        </div>
      </div>

      <div className="result-block">
        <strong>Eksik Beceriler</strong>
        <div className="tag-list">
          {result.missing_skills.length ? (
            result.missing_skills.map((skill) => (
              <span key={skill} className="tag">
                {skill}
              </span>
            ))
          ) : (
            <span className="helper-text">Eksik beceri görünmüyor.</span>
          )}
        </div>
      </div>

      <div className="result-block">
        <strong>Kanıt Tabanlı Eşleşme</strong>
        {result.evidence_table.length ? (
          <div className="evidence-table-wrap">
            <table className="evidence-table">
              <thead>
                <tr>
                  <th>Gereksinim</th>
                  <th>Durum</th>
                  <th>CV Kanıtı</th>
                </tr>
              </thead>
              <tbody>
                {result.evidence_table.map((row) => (
                  <tr key={row.requirement}>
                    <td>{row.requirement}</td>
                    <td>
                      <span className={`status-pill ${row.status}`}>
                        {row.status === "matched" ? "Eşleşti" : "Eksik"}
                      </span>
                    </td>
                    <td>{row.evidence || "CV içinde kanıt bulunamadı."}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="helper-text">Kanıt tablosu için yeterli veri bulunamadı.</p>
        )}
      </div>

      {result.internship_analysis.enabled ? (
        <div className="result-block split-block">
          <div>
            <strong>Staj Modu Güçlü Yanlar</strong>
            <ul className="result-list">
              {result.internship_analysis.strengths.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <strong>Geliştirilecek Alanlar</strong>
            <ul className="result-list">
              {result.internship_analysis.weaknesses.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      <div className="result-block">
        <strong>Mini Portfolyo Projesi Önerisi</strong>
        <p className="helper-text">
          {result.mini_project_recommendation || "Mini proje önerisi bulunamadı."}
        </p>
      </div>

      <div className="result-block">
        <strong>Etik CV İyileştirme</strong>
        {result.cv_improvement_suggestions.length ? (
          <div className="suggestion-list">
            {result.cv_improvement_suggestions.map((suggestion) => (
              <div key={`${suggestion.original}-${suggestion.improved}`} className="suggestion-item">
                <span>{suggestion.original}</span>
                <p>{suggestion.improved}</p>
                <small>{suggestion.ethical_note}</small>
              </div>
            ))}
          </div>
        ) : (
          <p className="helper-text">CV iyileştirme önerisi bulunamadı.</p>
        )}
      </div>

      <div className="result-block">
        <strong>Mülakat Hazırlık Soruları</strong>
        {result.interview_questions.length ? (
          <ol className="result-list">
            {result.interview_questions.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ol>
        ) : (
          <p className="helper-text">Mülakat sorusu üretilemedi.</p>
        )}
      </div>
    </article>
  );
}

export default ResultCard;
