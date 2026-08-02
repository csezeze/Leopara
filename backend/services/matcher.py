def match_cv_to_posting(cv_profile: dict, posting_analysis: dict) -> dict:
    requirement_details = posting_analysis.get("requirement_details") or [
        {"skill": skill, "priority": "unspecified", "weight": 0.8}
        for skill in posting_analysis["requirements"]
    ]
    cv_skills = set(cv_profile["skills"])
    evidence_by_skill = cv_profile["evidence_by_skill"]
    evidence_weight_by_skill = cv_profile.get("evidence_weight_by_skill", {})

    evidence_table = []
    matched_skills = []
    evidence_backed_skills = []
    missing_skills = []
    critical_missing_skills = []
    matched_weight = 0.0
    total_requirement_weight = sum(detail["weight"] for detail in requirement_details)

    for detail in requirement_details:
        requirement = detail["skill"]
        priority = detail["priority"]
        priority_weight = detail["weight"]

        if requirement in cv_skills:
            matched_skills.append(requirement)
            evidence_weight = evidence_weight_by_skill.get(requirement, 0.35)
            if evidence_weight >= 1.0:
                evidence_backed_skills.append(requirement)
            matched_weight += (
                evidence_weight * priority_weight
            )
            evidence_table.append({
                "requirement": requirement,
                "priority": priority,
                "priority_weight": priority_weight,
                "status": "matched",
                "evidence": evidence_by_skill.get(requirement),
            })
        else:
            missing_skills.append(requirement)
            if priority == "required":
                critical_missing_skills.append(requirement)
            evidence_table.append({
                "requirement": requirement,
                "priority": priority,
                "priority_weight": priority_weight,
                "status": "missing",
                "evidence": None,
            })

    match_score = calculate_match_score(matched_weight, total_requirement_weight)

    return {
        "match_score": match_score,
        "matched_skills": matched_skills,
        "evidence_backed_skills": evidence_backed_skills,
        "missing_skills": missing_skills,
        "critical_missing_skills": critical_missing_skills,
        "evidence_table": evidence_table,
    }


def calculate_match_score(matched_weight: float, total_requirement_weight: float) -> int:
    if total_requirement_weight == 0:
        return 0
    return round((matched_weight / total_requirement_weight) * 100)
