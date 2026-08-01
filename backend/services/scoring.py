def calculate_readiness_score(
    match_score: int,
    cv_profile: dict,
    missing_skills: list[str],
    application_type: str,
) -> int:
    score = match_score

    if cv_profile["has_project"]:
        score += 8
    if cv_profile["has_github"] or cv_profile["has_portfolio"]:
        score += 8
    if cv_profile["has_certificate"]:
        score += 4

    score -= min(len(missing_skills) * 4, 20)

    if application_type == "internship":
        if cv_profile["has_coursework"]:
            score += 6
        if cv_profile["has_project"]:
            score += 6
        if not (cv_profile["has_github"] or cv_profile["has_portfolio"]):
            score -= 8

    return max(0, min(100, round(score)))


def build_score_explanation(
    match_score: int,
    readiness_score: int,
    matched_skills: list[str],
    missing_skills: list[str],
    application_type: str,
    critical_missing_skills: list[str] | None = None,
) -> str:
    if match_score >= 75:
        match_summary = "CV'niz ilandaki gereksinimlerle güçlü bir uyum gösteriyor."
    elif match_score >= 50:
        match_summary = "CV'niz ilandaki gereksinimlerle orta seviyede uyum gösteriyor."
    else:
        match_summary = "CV'niz ilandaki gereksinimlerle sınırlı seviyede uyum gösteriyor."

    readiness_gap = readiness_score - match_score
    if readiness_gap >= 10:
        readiness_summary = "Proje, portfolyo veya ek kanıtlar hazırlık skorunu yukarı taşıyor."
    elif readiness_gap <= -10:
        readiness_summary = "Eksik beceriler ve kanıt zayıflığı başvuru hazırlığını düşürüyor."
    else:
        readiness_summary = "Hazırlık skoru mevcut eşleşme düzeyiyle genel olarak paralel."

    matched_fragment = (
        f"Öne çıkan eşleşen beceriler: {', '.join(matched_skills[:3])}."
        if matched_skills
        else "Henüz öne çıkan eşleşen bir beceri tespit edilmedi."
    )
    critical_missing_skills = critical_missing_skills or []
    other_missing_skills = [
        skill for skill in missing_skills if skill not in critical_missing_skills
    ]
    critical_fragment = (
        f"Kritik eksikler: {', '.join(critical_missing_skills[:3])}."
        if critical_missing_skills
        else ""
    )
    missing_fragment = (
        f"Diğer geliştirilecek alanlar: {', '.join(other_missing_skills[:3])}."
        if other_missing_skills
        else "Belirgin bir eksik beceri görünmüyor."
        if not critical_missing_skills
        else ""
    )

    mode_fragment = (
        "Staj modu için ders, proje ve portfolyo kanıtları ayrıca dikkate alındı."
        if application_type == "internship"
        else "İş modu için teknik gereksinimlerin doğrudan karşılanma düzeyi dikkate alındı."
    )

    return " ".join(
        [
            match_summary,
            readiness_summary,
            matched_fragment,
            critical_fragment,
            missing_fragment,
            mode_fragment,
        ]
    ).replace("  ", " ").strip()
