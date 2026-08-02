import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
  timeout: 9000,
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
  Testing: ["test", "testing", "software testing", "yazılım testi", "pytest", "unit test"],
  Deployment: ["deployment", "deploy", "vercel", "render", "railway"],
  Communication: ["iletişim", "communication"],
  Teamwork: ["takım", "ekip", "team", "teamwork"],
  "Problem Solving": ["problem solving", "problem çözme", "problem cozme"],
};

const cvContextKeywords = [
  "üniversite",
  "university",
  "lise",
  "okul",
  "bölüm",
  "bolum",
  "mühendisliği",
  "muhendisligi",
  "öğrenci",
  "ogrenci",
  "eğitim",
  "egitim",
  "deneyim",
  "experience",
  "proje",
  "project",
  "staj",
  "internship",
  "sertifika",
  "certificate",
  "github",
  "linkedin",
  "portfolio",
  "portfolyo",
  "geliştirdim",
  "gelistirdim",
  "kullandım",
  "kullandim",
  "çalıştım",
  "calistim",
];

const skillEvidenceKeywords = [
  "proje",
  "project",
  "gelistirdim",
  "gelistirildi",
  "kullandim",
  "kullanildi",
  "calistim",
  "deneyim",
  "experience",
  "staj",
  "internship",
  "sertifika",
  "certificate",
  "ders",
  "course",
  "github",
  "gitlab",
  "repo",
  "portfolio",
  "portfolyo",
  "uygulama",
  "application",
  "api",
  "model",
  "analiz",
  "analysis",
  "test",
  "deploy",
  "deployment",
  "tasarladim",
  "yonettim",
];

const softSkills = new Set(["Communication", "Teamwork", "Problem Solving"]);
const softSkillEvidenceKeywords = [
  "birlikte",
  "is birligi",
  "gorev",
  "sorumluluk",
  "koordine",
  "yonettim",
  "liderlik",
  "sundum",
  "cozdum",
];

const negationMarkers = [
  "bulunmuyor",
  "bulunmamaktadir",
  "bilmiyorum",
  "kullanmadim",
  "calismadim",
  "deneyimim yok",
  "tecrubem yok",
  "bilgim yok",
  "sahip degilim",
  "no experience",
  "do not know",
  "did not use",
  "without experience",
  "lack experience",
];

const testingMetaMarkers = [
  "test amaciyla",
  "test icin hazirlanmis",
  "kurgusal ornek",
  "ornek cv",
  "deneme amacli",
  "sample cv",
  "fictional cv",
];

const behavioralQuestions = [
  "Bir ekip çalışmasında fikir ayrılığı yaşadığınız bir durumu, yaklaşımınızı ve sonucu anlatır mısınız?",
  "Beklenmedik bir sorunla karşılaştığınızda önceliklerinizi nasıl belirlediğinize örnek verir misiniz?",
  "Kısa sürede yeni bir konu öğrenmeniz gereken bir deneyimi ve kullandığınız yöntemi anlatır mısınız?",
  "Geri bildirim aldığınız ve çalışma biçiminizi değiştirdiğiniz bir durumu paylaşır mısınız?",
  "Sorumluluğunu üstlendiğiniz bir işte hata yaptığınızda durumu nasıl yönettiğinizi anlatır mısınız?",
];

const requirementPriorityWeights = {
  required: 1,
  unspecified: 0.8,
  preferred: 0.6,
  bonus: 0.3,
};

const requirementPriorityMarkers = {
  required: [
    "zorunlu",
    "zorunludur",
    "şart",
    "şarttır",
    "gerekli",
    "gereklidir",
    "gerekmektedir",
    "aranmaktadır",
    "beklenir",
    "required",
    "must",
  ],
  preferred: [
    "tercihen",
    "tercih edilen",
    "tercih edilir",
    "tercih sebebi",
    "tercih sebebidir",
    "tercih nedeni",
    "tercih nedenidir",
    "preferred",
  ],
  bonus: [
    "ek avantaj",
    "ek avantajdır",
    "avantaj",
    "avantajdır",
    "artı",
    "artıdır",
    "plus",
    "nice to have",
  ],
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

function findKeywordPositions(normalizedText, keyword) {
  const normalizedKeyword = normalizeText(keyword);

  if (!normalizedKeyword) {
    return [];
  }

  const pattern = new RegExp(
    `(^|[^a-z0-9])(${escapeRegExp(normalizedKeyword)})(?=$|[^a-z0-9])`,
    "g",
  );
  const positions = [];
  let match = pattern.exec(normalizedText);

  while (match) {
    positions.push(match.index + match[1].length);
    match = pattern.exec(normalizedText);
  }

  return positions;
}

function splitSentences(text) {
  return text
    .split(/[.!?\n;]/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function findSkillPositions(normalizedSentence, skill) {
  return (skillKeywords[skill] || [skill]).flatMap((keyword) =>
    findKeywordPositions(normalizedSentence, keyword),
  );
}

function findNearestPriority(normalizedSentence, skillPositions) {
  const markerPositions = Object.entries(requirementPriorityMarkers).flatMap(
    ([priority, markers]) => markers.flatMap((marker) =>
      findKeywordPositions(normalizedSentence, marker).map((position) => ({
        priority,
        position,
      })),
    ),
  );

  if (!markerPositions.length) {
    return null;
  }

  return markerPositions.reduce((nearest, candidate) => {
    const distance = Math.min(
      ...skillPositions.map((skillPosition) => Math.abs(candidate.position - skillPosition)),
    );
    const nearestDistance = Math.min(
      ...skillPositions.map((skillPosition) => Math.abs(nearest.position - skillPosition)),
    );

    if (distance < nearestDistance) {
      return candidate;
    }

    if (
      distance === nearestDistance
      && requirementPriorityWeights[candidate.priority] > requirementPriorityWeights[nearest.priority]
    ) {
      return candidate;
    }

    return nearest;
  }).priority;
}

function buildRequirementDetails(postingText) {
  const requirements = findSkills(postingText);
  const sentences = splitSentences(postingText);

  return requirements.map((skill) => {
    const detectedPriorities = sentences.flatMap((sentence) => {
      const normalizedSentence = normalizeText(sentence);
      const skillPositions = findSkillPositions(normalizedSentence, skill);

      if (!skillPositions.length) {
        return [];
      }

      const priority = findNearestPriority(normalizedSentence, skillPositions);
      return priority ? [priority] : [];
    });
    const priority = detectedPriorities.length
      ? detectedPriorities.reduce((highest, candidate) =>
        requirementPriorityWeights[candidate] > requirementPriorityWeights[highest]
          ? candidate
          : highest,
      )
      : "unspecified";

    return {
      skill,
      priority,
      weight: requirementPriorityWeights[priority],
    };
  });
}

function findSkills(text) {
  const normalized = normalizeText(text);

  return Object.entries(skillKeywords)
    .filter(([, keywords]) => keywords.some((keyword) => keywordExists(normalized, keyword)))
    .map(([skill]) => skill);
}

function hasPositiveSkillMention(sentence, skill) {
  const keywords = skillKeywords[skill] || [skill.toLowerCase()];
  const clauses = sentence.split(/\b(?:ama|ancak|fakat|but|however)\b/i);

  return clauses.some((clause) => {
    const normalizedClause = normalizeText(clause);
    const containsSkill = keywords.some((keyword) => keywordExists(normalizedClause, keyword));

    if (!containsSkill) {
      return false;
    }

    if (negationMarkers.some((marker) => keywordExists(normalizedClause, marker))) {
      return false;
    }

    if (
      skill === "Testing"
      && testingMetaMarkers.some((marker) => keywordExists(normalizedClause, marker))
    ) {
      return false;
    }

    return true;
  });
}

function findCvSkills(text) {
  return Object.keys(skillKeywords).filter((skill) => findEvidence(text, skill));
}

function isValidCvText(text) {
  const normalized = normalizeText(text);
  const words = normalized.match(/[a-z0-9]+/g) || [];

  if (words.length < 12) {
    return false;
  }

  return cvContextKeywords.some((keyword) => keywordExists(normalized, keyword));
}

function validateAnalysisPayload(payload) {
  const requirements = findSkills(payload.posting_text);

  if (!requirements.length) {
    throw new Error("İlan metninde analiz edilebilir bir gereksinim bulunamadı. Lütfen daha net bir ilan metni girin.");
  }

  if (!isValidCvText(payload.cv_text)) {
    throw new Error(
      "Yüklenen metin geçerli bir CV gibi görünmüyor. Lütfen eğitim, proje, deneyim, iletişim veya portfolyo bilgisi içeren bir CV yükleyin.",
    );
  }

}

function findEvidence(text, skill) {
  const sentences = text.split(/[.!?\n;]/).map((sentence) => sentence.trim()).filter(Boolean);

  return sentences.find((sentence) => hasPositiveSkillMention(sentence, skill)) || null;
}

function getEvidenceWeight(text, skill) {
  const evidence = findEvidence(text, skill);

  if (!evidence) {
    return 0;
  }

  const normalizedEvidence = normalizeText(evidence);
  if (
    softSkills.has(skill)
    && !softSkillEvidenceKeywords.some((keyword) => keywordExists(normalizedEvidence, keyword))
  ) {
    return 0;
  }

  const hasStrongEvidence = skillEvidenceKeywords.some((keyword) =>
    keywordExists(normalizedEvidence, keyword),
  );

  return hasStrongEvidence ? 1 : 0.35;
}

function buildProjectRecommendation(missingSkills, matchedSkills, applicationType) {
  const relevantSkills = [...new Set([...missingSkills.slice(0, 3), ...matchedSkills.slice(0, 2)])];
  const technologies = relevantSkills.join(", ") || "ilandaki temel teknolojiler";
  const hasAny = (skills) => skills.some((skill) => relevantSkills.includes(skill));
  const scope = applicationType === "internship" ? "staj portfolyon için" : "portfolyon için";
  let idea;

  if (hasAny(["Machine Learning", "NLP", "Data Analysis"])) {
    idea = "ilan metinlerinden beceri çıkaran, aday-ilan uyumunu açıklayan ve sonuçları ölçüm metrikleriyle gösteren bir analiz paneli";
  } else if (hasAny(["React", "JavaScript", "TypeScript", "HTML", "CSS"])) {
    idea = "rol bazlı giriş, form doğrulama, filtreleme, API entegrasyonu ve responsive ekranlar içeren bir başvuru takip paneli";
  } else if (hasAny(["Python", "FastAPI", "Flask", "REST API", "SQL", "PostgreSQL"])) {
    idea = "kimlik doğrulama, veri doğrulama, PostgreSQL kayıtları, testler ve API dokümantasyonu içeren bir aday başvuru servisi";
  } else if (hasAny(["Testing", "Deployment", "Docker", "Git"])) {
    idea = "otomatik test, Docker kurulumu, CI kontrolü, hata raporu ve canlı ortam dağıtımı içeren bir yayınlama hattı";
  } else {
    idea = "kullanıcı girişi, veri kaydı, arama, raporlama ve hata yönetimi içeren uçtan uca bir iş takip uygulaması";
  }

  return `${scope} ${technologies} kullanarak ${idea} geliştir. Orta seviye kapsam için README'de mimariyi, kurulum adımlarını, test senaryolarını ve ölçülebilir çıktıları göster.`;
}

function buildInterviewQuestions(matchedSkills, missingSkills, applicationType) {
  const questions = [
    ...matchedSkills.slice(0, 2).map(
      (skill) => `${skill} ile yaptığınız bir projeyi, sorumluluğunuzu ve elde ettiğiniz çıktıyı anlatır mısınız?`,
    ),
    ...missingSkills.slice(0, 2).map(
      (skill) => `${skill} konusunda kendinizi geliştirmek için nasıl bir öğrenme ve uygulama planı izlersiniz?`,
    ),
    applicationType === "internship"
      ? "Bu stajın ilk ayında hangi teknik kazanımı somut bir çıktıya dönüştürmek istersiniz?"
      : "Bu role başladıktan sonraki ilk ayda hangi teknik çıktıyla değer üretmeyi planlarsınız?",
  ];
  const fallbackQuestions = [
    "CV'nizdeki en somut proje çıktısını ve bu projedeki kişisel katkınızı anlatır mısınız?",
    "İlandaki teknik gereksinimlerden hangisinde en güçlü olduğunuzu düşünüyorsunuz ve neden?",
    "Bir teknik problemi analiz ederken hangi adımları izlersiniz?",
    "Eksik gördüğünüz bir beceriyi geliştirmek için nasıl ölçülebilir bir plan hazırlarsınız?",
  ];

  fallbackQuestions.forEach((question) => {
    if (questions.length < 4 && !questions.includes(question)) {
      questions.push(question);
    }
  });

  const selectedQuestions = questions.slice(0, 4);
  const behavioralQuestion = behavioralQuestions[
    Math.floor(Math.random() * behavioralQuestions.length)
  ];
  selectedQuestions.splice(Math.floor(Math.random() * 5), 0, behavioralQuestion);

  return selectedQuestions;
}

function buildFallbackAnalysis(payload) {
  const cvSkills = findCvSkills(payload.cv_text);
  const requirementDetails = buildRequirementDetails(payload.posting_text);
  const requirements = requirementDetails.map((detail) => detail.skill);
  const matchedSkills = requirements.filter(
    (skill) => cvSkills.includes(skill) && getEvidenceWeight(payload.cv_text, skill) > 0,
  );
  const evidenceBackedSkills = matchedSkills.filter(
    (skill) => getEvidenceWeight(payload.cv_text, skill) >= 1,
  );
  const missingSkills = requirements.filter((skill) => !matchedSkills.includes(skill));
  const criticalMissingSkills = requirementDetails
    .filter((detail) => detail.priority === "required" && !matchedSkills.includes(detail.skill))
    .map((detail) => detail.skill);
  const matchedWeight = requirementDetails.reduce(
    (total, detail) => total + (
      cvSkills.includes(detail.skill)
        ? getEvidenceWeight(payload.cv_text, detail.skill) * detail.weight
        : 0
    ),
    0,
  );
  const totalRequirementWeight = requirementDetails.reduce(
    (total, detail) => total + detail.weight,
    0,
  );
  const matchScore = totalRequirementWeight
    ? Math.round((matchedWeight / totalRequirementWeight) * 100)
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
  const otherMissingSkills = missingSkills.filter(
    (skill) => !criticalMissingSkills.includes(skill),
  );
  const criticalSummary = criticalMissingSkills.length
    ? `Kritik eksikler: ${criticalMissingSkills.slice(0, 3).join(", ")}.`
    : "";
  const otherMissingSummary = otherMissingSkills.length
    ? `Diğer geliştirilecek alanlar: ${otherMissingSkills.slice(0, 3).join(", ")}.`
    : !criticalMissingSkills.length
      ? "Belirgin bir eksik beceri görünmüyor."
      : "";
  const projectRecommendation = buildProjectRecommendation(
    missingSkills,
    matchedSkills,
    payload.application_type,
  );
  const relevantTechnologies = [...new Set([...missingSkills, ...matchedSkills])]
    .slice(0, 4)
    .join(", ") || "İlandaki teknolojiler";

  return {
    match_score: matchScore,
    readiness_score: readinessScore,
    score_explanation:
      matchedSkills.length || missingSkills.length
        ? [
          "CV metni ile ilan gereksinimleri önceliklerine göre karşılaştırıldı.",
          `Eşleşen alanlar: ${matchedSkills.slice(0, 3).join(", ") || "belirgin eşleşme yok"}.`,
          criticalSummary,
          otherMissingSummary,
        ].filter(Boolean).join(" ")
        : "İlanda sistemin tanıdığı teknik gereksinim bulunamadığı için skor 0 olarak hesaplandı.",
    analysis_warnings: !matchedSkills.length
      ? [
        "CV geçerli bir belge olarak okundu; ancak ilandaki gereksinimlerle ortak bir beceri bulunamadı. Bu nedenle eşleşme skoru 0 olarak hesaplandı.",
      ]
      : !evidenceBackedSkills.length
        ? [
          "CV ile ilanda ortak beceri ifadeleri bulundu; ancak bu becerileri destekleyen proje, ders, sertifika veya somut kullanım kanıtı zayıf olduğu için skor sınırlı tutuldu.",
        ]
        : [],
    matched_skills: matchedSkills,
    missing_skills: missingSkills,
    critical_missing_skills: criticalMissingSkills,
    evidence_table: requirementDetails.map((detail) => ({
      requirement: detail.skill,
      priority: detail.priority,
      priority_weight: detail.weight,
      status: matchedSkills.includes(detail.skill) ? "matched" : "missing",
      evidence: matchedSkills.includes(detail.skill)
        ? findEvidence(payload.cv_text, detail.skill)
        : null,
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
    mini_project_recommendation: projectRecommendation,
    cv_improvement_suggestions: [
      {
        original: `${relevantTechnologies} için CV'deki proje ve beceri kanıtları`,
        improved: `${projectRecommendation} Projeyi gerçekten tamamladıktan sonra kullandığınız teknolojileri, sorumluluğunuzu ve ölçülebilir çıktıyı CV'nize ekleyin.`,
        ethical_note: "Bu öneri yalnızca CV'deki mevcut bilgiyi daha açık ifade eder. Sahip olmadığınız deneyimi eklemeyin.",
      },
    ],
    interview_questions: buildInterviewQuestions(
      matchedSkills,
      missingSkills,
      payload.application_type,
    ),
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
