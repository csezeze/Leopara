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
  Agile: ["agile", "scrum", "sprint"],
  Testing: ["test", "pytest", "unit test"],
  Deployment: ["deployment", "deploy", "vercel", "render", "railway"],
  Communication: ["iletişim", "communication"],
  Teamwork: ["takım", "ekip", "team", "teamwork"],
  "Problem Solving": ["problem solving", "problem çözme", "problem cozme"],
};

function normalizeText(text) {
  return text
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function keywordExists(normalizedText, keyword) {
  const normalizedKeyword = normalizeText(keyword);

  if (!normalizedKeyword) {
    return false;
  }

  const pattern = new RegExp(`(^|[^a-z0-9])${escapeRegExp(normalizedKeyword)}(?=$|[^a-z0-9])`);

  return pattern.test(normalizedText);
}

function findSkills(text) {
  const normalized = normalizeText(text);

  return Object.entries(skillKeywords)
    .filter(([, keywords]) => keywords.some((keyword) => keywordExists(normalized, keyword)))
    .map(([skill]) => skill);
}

function validateAnalysisPayload(payload) {
  const cvSkills = findSkills(payload.cv_text);
  const requirements = findSkills(payload.posting_text);
  const matchedSkills = requirements.filter((skill) => cvSkills.includes(skill));

  if (!requirements.length) {
    throw new Error("İlan metninde analiz edilebilir bir gereksinim bulunamadı. Lütfen daha net bir ilan metni girin.");
  }

  if (!matchedSkills.length) {
    throw new Error(
      "Bu CV ile seçilen ilan arasında analiz edilebilir ortak bir beceri bulunamadı. Lütfen doğru CV ve ilan eşleşmesini kontrol edin.",
    );
  }
}

function findEvidence(text, skill) {
  const keywords = skillKeywords[skill] || [skill.toLowerCase()];
  const sentences = text.split(/[.!?\n;]/).map((sentence) => sentence.trim()).filter(Boolean);

  return sentences.find((sentence) =>
    keywords.some((keyword) => keywordExists(normalizeText(sentence), keyword)),
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
  const hasProject = /(^|[^a-z0-9])(proje|project)(?=$|[^a-z0-9])/.test(normalizedCv);
  const hasGithub = /(^|[^a-z0-9])(github|portfolio|portfolyo)(?=$|[^a-z0-9])/.test(normalizedCv);
  const hasCoursework = /(^|[^a-z0-9])(ders|course)(?=$|[^a-z0-9])/.test(normalizedCv);
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
        : "İlanda sistemin tanıdığı teknik gereksinim bulunamadığı için skor 0 olarak hesaplandı.",
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
        hasProject ? "Akademik veya kişisel proje deneyimi bulunuyor." : "CV metni sınırlı teknik beceri sinyali içeriyor.",
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
  validateAnalysisPayload(payload);

  try {
    const response = await apiClient.post("/analyze", payload);

    return { ...response.data, isFallback: false };
  } catch (error) {
    if (error.response?.status === 422 || error.response?.status === 400) {
      throw new Error(error.response.data?.detail || "Analiz için gerekli bilgiler uygun değil.");
    }

    return { ...buildFallbackAnalysis(payload), isFallback: true };
  }
}
