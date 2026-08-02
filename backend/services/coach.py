from services.skills import split_sentences


ETHICAL_NOTE = "Bu öneri yalnızca CV'deki mevcut bilgiyi daha açık ifade eder. Sahip olmadığınız deneyimi eklemeyin."


def build_internship_analysis(cv_profile: dict, application_type: str) -> dict:
    if application_type != "internship":
        return {
            "enabled": False,
            "strengths": [],
            "weaknesses": [],
        }

    strengths: list[str] = []
    weaknesses: list[str] = []

    if cv_profile["has_project"]:
        strengths.append("Akademik veya kişisel proje deneyimi bulunuyor.")
    else:
        weaknesses.append("CV'de proje kanıtı zayıf görünüyor.")

    if cv_profile["has_coursework"]:
        strengths.append("Ders veya eğitim bilgisi staj değerlendirmesi için kullanılabilir.")
    else:
        weaknesses.append("İlgili ders veya eğitim bilgisi daha görünür yazılabilir.")

    if cv_profile["has_github"] or cv_profile["has_portfolio"]:
        strengths.append("GitHub veya portfolyo bağlantısı adayın üretimini destekliyor.")
    else:
        weaknesses.append("GitHub veya portfolyo bağlantısı eksik.")

    if cv_profile["has_certificate"]:
        strengths.append("Sertifika bilgisi öğrenme motivasyonunu destekliyor.")

    return {
        "enabled": True,
        "strengths": strengths,
        "weaknesses": weaknesses,
    }


def unique_skills(skills: list[str]) -> list[str]:
    return list(dict.fromkeys(skills))


def recommend_mini_project(
    missing_skills: list[str],
    matched_skills: list[str],
    application_type: str,
) -> str:
    relevant_skills = unique_skills(missing_skills[:3] + matched_skills[:2])
    skill_set = set(relevant_skills)
    technologies = ", ".join(relevant_skills) or "ilandaki temel teknolojiler"
    scope = "staj portfolyon için" if application_type == "internship" else "portfolyon için"

    if skill_set & {"Machine Learning", "NLP", "Data Analysis"}:
        idea = (
            "ilan metinlerinden beceri çıkaran, aday-ilan uyumunu açıklayan ve sonuçları "
            "ölçüm metrikleriyle gösteren bir analiz paneli"
        )
    elif skill_set & {"React", "JavaScript", "TypeScript", "HTML", "CSS"}:
        idea = (
            "rol bazlı giriş, form doğrulama, filtreleme, API entegrasyonu ve responsive "
            "ekranlar içeren bir başvuru takip paneli"
        )
    elif skill_set & {"Python", "FastAPI", "Flask", "REST API", "SQL", "PostgreSQL"}:
        idea = (
            "kimlik doğrulama, veri doğrulama, PostgreSQL kayıtları, testler ve API "
            "dokümantasyonu içeren bir aday başvuru servisi"
        )
    elif skill_set & {"Testing", "Deployment", "Docker", "Git"}:
        idea = (
            "otomatik test, Docker kurulumu, CI kontrolü, hata raporu ve canlı ortam "
            "dağıtımı içeren bir yayınlama hattı"
        )
    else:
        idea = (
            "kullanıcı girişi, veri kaydı, arama, raporlama ve hata yönetimi içeren uçtan "
            "uca bir iş takip uygulaması"
        )

    return (
        f"{scope} {technologies} kullanarak {idea} geliştir. Orta seviye kapsam için "
        "README'de mimariyi, kurulum adımlarını, test senaryolarını ve ölçülebilir çıktıları göster."
    )


def build_cv_improvement_suggestions(
    cv_text: str,
    relevant_skills: list[str],
    project_recommendation: str,
) -> list[dict]:
    suggestions: list[dict] = []
    for sentence in split_sentences(cv_text):
        lowered = sentence.lower()
        if "biliyorum" in lowered and len(sentence.split()) <= 5:
            topic = sentence.replace("biliyorum", "").replace("Biliyorum", "").strip()
            improved_topic = topic or "ilgili teknoloji"
            suggestions.append({
                "original": sentence,
                "improved": f"{improved_topic} kullanarak yaptığım çalışma veya projede hangi problemi çözdüğümü ve hangi çıktıyı ürettiğimi net şekilde belirttim.",
                "ethical_note": ETHICAL_NOTE,
            })

    technologies = ", ".join(unique_skills(relevant_skills)[:4]) or "ilandaki teknolojiler"
    suggestions.append({
        "original": f"{technologies} için CV'deki proje ve beceri kanıtları",
        "improved": (
            f"{project_recommendation} Projeyi gerçekten tamamladıktan sonra kullandığınız "
            "teknolojileri, sorumluluğunuzu ve ölçülebilir çıktıyı CV'nize ekleyin."
        ),
        "ethical_note": ETHICAL_NOTE,
    })

    return suggestions[:3]
