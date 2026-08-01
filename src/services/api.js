import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
  timeout: 4000,
});

const skillKeywords = {
  Python: ["python"],
  FastAPI: ["fastapi"],
  Flask: ["flask"],
  React: ["react"],
  JavaScript: ["javascript", "js"],
  TypeScript: ["typescript", "ts"],
  SQL: ["sql", "mysql", "sqlite"],
  PostgreSQL: ["postgresql", "postgres"],
  "Machine Learning": ["machine learning", "makine öğrenmesi", "ml"],
  "Data Analysis": ["data analysis", "veri analizi", "pandas", "numpy"],
  NLP: ["nlp", "doğal dil işleme"],
  Git: ["git", "github"],
  Docker: ["docker"],
  "REST API": ["rest api", "api", "endpoint"],
  HTML: ["html"],
  CSS: ["css"],
};

function normalizeText(text) {
  return text.toLowerCase();
}

function findSkills(text) {
  const normalized = normalizeText(text);

  return Object.entries(skillKeywords)
    .filter(([, keywords]) => keywords.some((keyword) => normalized.includes(keyword)))
    .map(([skill]) => skill);
}

function findEvidence(text, skill) {
  const keywords = skillKeywords[skill] || [skill.toLowerCase()];
  const sentences = text.split(/[.!?\n;]/).map((sentence) => sentence.trim()).filter(Boolean);

  return sentences.find((sentence) =>
    keywords.some((keyword) => normalizeText(sentence).includes(keyword)),
  ) || null;
}

function buildFallbackAnalysis(payload) {
  const cvSkills = findSkills(payload.cv_text);
  const requirements = findSkills(payload.posting_text);
  const matchedSkills = requirements.filter((skill) => cvSkills.includes(skill));
  const missingSkills = requirements.filter((skill) => !cvSkills.includes(skill));
  const matchScore = requirements.length
    ? Math.round((matchedSkills.length / requirements.length) * 100)
    : 0;
  const normalizedCv = normalizeText(payload.cv_text);
  const hasProject = /proje|project/.test(normalizedCv);
  const hasGithub = /github|portfolio|portfolyo/.test(normalizedCv);
  const hasCoursework = /ders|course/.test(normalizedCv);
  const readinessScore = Math.max(
    0,
    Math.min(
      100,
      matchScore + (hasProject ? 10 : 0) + (hasGithub ? 8 : 0) + (hasCoursework ? 6 : 0) - missingSkills.length * 4,
    ),
  );

  return {
    match_score: matchScore,
    readiness_score: readinessScore,
    score_explanation:
      matchedSkills.length || missingSkills.length
        ? `CV metni ile ilan gereksinimleri karşılaştırıldı. Eşleşen alanlar: ${
            matchedSkills.slice(0, 3).join(", ") || "belirgin eşleşme yok"
          }. Geliştirilmesi gereken alanlar: ${
            missingSkills.slice(0, 3).join(", ") || "belirgin eksik yok"
          }.`
        : "Skorlar mevcut metinlere göre oluşturuldu.",
    matched_skills: matchedSkills,
    missing_skills: missingSkills,
    evidence_table: requirements.map((requirement) => ({
      requirement,
      status: matchedSkills.includes(requirement) ? "matched" : "missing",
      evidence: matchedSkills.includes(requirement) ? findEvidence(payload.cv_text, requirement) : null,
    })),
    internship_analysis: {
      enabled: payload.application_type === "internship",
      strengths: [
        hasProject ? "Akademik veya kişisel proje deneyimi bulunuyor." : "CV metni teknik beceri sinyalleri içeriyor.",
      ],
      weaknesses: [
        hasGithub ? "Portfolyo bağlantısı daha görünür yazılabilir." : "GitHub veya portfolyo bağlantısı eksik.",
      ],
    },
    mini_project_recommendation: missingSkills.length
      ? `${missingSkills.slice(0, 3).join(", ")} eksiklerini göstermek için küçük bir portfolyo projesi geliştirip GitHub'a ekle.`
      : "Mevcut becerilerin ilanla iyi örtüşüyor. CV'deki proje kanıtlarını daha ölçülebilir hale getirebilirsin.",
    cv_improvement_suggestions: [
      {
        original: "CV'deki proje ve beceri açıklamaları",
        improved: "Her beceri için proje, ders, sertifika veya iş deneyimi gibi somut bir kanıt ekleyin.",
        ethical_note: "Bu öneri yalnızca CV'deki mevcut bilgiyi daha açık ifade eder. Sahip olmadığınız deneyimi eklemeyin.",
      },
    ],
    interview_questions: [
      matchedSkills[0]
        ? `${matchedSkills[0]} ile yaptığınız bir projeyi anlatır mısınız?`
        : "Bu başvuru için en güçlü teknik yönünüz nedir?",
      missingSkills[0]
        ? `${missingSkills[0]} konusunda kendinizi geliştirmek için nasıl bir plan izlersiniz?`
        : "İlandaki gereksinimlerden hangisinde en güçlü olduğunuzu düşünüyorsunuz?",
      "CV'nizdeki en somut proje kanıtını nasıl açıklarsınız?",
      "Bu pozisyon için ilk ayda hangi konuda değer üretmeyi hedeflersiniz?",
      "Eksik gördüğünüz becerileri tamamlamak için hangi kaynakları kullanırsınız?",
    ],
  };
}

export async function analyzeApplication(payload) {
  try {
    const response = await apiClient.post("/analyze", payload);

    return { ...response.data, isFallback: false };
  } catch (error) {
    return { ...buildFallbackAnalysis(payload), isFallback: true };
  }
}
