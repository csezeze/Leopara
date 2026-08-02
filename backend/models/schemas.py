from typing import Literal

from pydantic import BaseModel, Field


ApplicationType = Literal["job", "internship"]


class AnalyzeRequest(BaseModel):
    cv_text: str = Field(..., min_length=20)
    posting_text: str = Field(..., min_length=20)
    application_type: ApplicationType = "job"


class EvidenceItem(BaseModel):
    requirement: str
    priority: Literal["required", "unspecified", "preferred", "bonus"] = "unspecified"
    priority_weight: float = 0.8
    status: Literal["matched", "missing"]
    evidence: str | None = None


class InternshipAnalysis(BaseModel):
    enabled: bool
    strengths: list[str]
    weaknesses: list[str]


class CvImprovementSuggestion(BaseModel):
    original: str
    improved: str
    ethical_note: str


class AnalyzeResponse(BaseModel):
    match_score: int
    readiness_score: int
    score_explanation: str
    analysis_warnings: list[str] = Field(default_factory=list)
    matched_skills: list[str]
    missing_skills: list[str]
    critical_missing_skills: list[str] = Field(default_factory=list)
    evidence_table: list[EvidenceItem]
    internship_analysis: InternshipAnalysis
    mini_project_recommendation: str
    cv_improvement_suggestions: list[CvImprovementSuggestion]
    interview_questions: list[str]
