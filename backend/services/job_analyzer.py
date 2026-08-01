from services.skills import find_skills, keyword_exists, normalize_text


def analyze_posting(posting_text: str) -> dict:
    requirements = find_skills(posting_text)
    normalized = normalize_text(posting_text)

    if not requirements:
        requirements = infer_requirements_from_common_terms(normalized)

    return {
        "requirements": requirements,
        "is_internship": keyword_exists(normalized, "staj") or keyword_exists(normalized, "intern"),
        "raw_text": posting_text,
    }


def infer_requirements_from_common_terms(normalized_text: str) -> list[str]:
    fallback_terms = {
        "Communication": ["iletişim", "communication"],
        "Teamwork": ["takım", "team"],
        "Problem Solving": ["problem solving", "problem çözme"],
    }
    inferred: list[str] = []
    for label, keywords in fallback_terms.items():
        if any(keyword_exists(normalized_text, keyword) for keyword in keywords):
            inferred.append(label)
    return inferred
