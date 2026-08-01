def match_cv_to_posting(cv_profile: dict, posting_analysis: dict) -> dict:
    requirements = posting_analysis["requirements"]
    cv_skills = set(cv_profile["skills"])
    evidence_by_skill = cv_profile["evidence_by_skill"]
    evidence_weight_by_skill = cv_profile.get("evidence_weight_by_skill", {})

    evidence_table = []
    matched_skills = []
    missing_skills = []
    matched_weight = 0.0

    for requirement in requirements:
        if requirement in cv_skills:
            matched_skills.append(requirement)
            matched_weight += evidence_weight_by_skill.get(requirement, 0.35)
            evidence_table.append({
                "requirement": requirement,
                "status": "matched",
                "evidence": evidence_by_skill.get(requirement),
            })
        else:
            missing_skills.append(requirement)
            evidence_table.append({
                "requirement": requirement,
                "status": "missing",
                "evidence": None,
            })

    match_score = calculate_match_score(matched_weight, len(requirements))

    return {
        "match_score": match_score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "evidence_table": evidence_table,
    }


def calculate_match_score(matched_weight: float, requirement_count: int) -> int:
    if requirement_count == 0:
        return 0
    return round((matched_weight / requirement_count) * 100)
