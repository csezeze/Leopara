import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models.schemas import AnalyzeRequest, AnalyzeResponse
from services.coach import (
    build_cv_improvement_suggestions,
    build_internship_analysis,
    recommend_mini_project,
)
from services.cv_parser import parse_cv
from services.interview import generate_interview_questions
from services.job_analyzer import analyze_posting
from services.matcher import match_cv_to_posting
from services.scoring import build_score_explanation, calculate_readiness_score


app = FastAPI(
    title="CareerMatch AI API",
    description="Evidence-based CV and job posting matching service.",
    version="0.1.0",
)

default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]
frontend_origins = [
    origin.strip()
    for origin in os.getenv("FRONTEND_ORIGINS", ",".join(default_origins)).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(request: AnalyzeRequest) -> AnalyzeResponse:
    cv_profile = parse_cv(request.cv_text)
    posting_analysis = analyze_posting(request.posting_text)
    match_result = match_cv_to_posting(cv_profile, posting_analysis)

    if not cv_profile["is_valid_cv"]:
        raise HTTPException(
            status_code=422,
            detail=(
                "Yüklenen metin geçerli bir CV gibi görünmüyor. "
                "Lütfen eğitim, proje, deneyim, iletişim veya portfolyo bilgisi içeren bir CV yükleyin."
            ),
        )

    if not posting_analysis["requirements"]:
        raise HTTPException(
            status_code=422,
            detail="İlan metninde analiz edilebilir bir gereksinim bulunamadı. Lütfen daha net bir ilan metni girin.",
        )

    if not match_result["matched_skills"]:
        raise HTTPException(
            status_code=422,
            detail=(
                "Bu CV ile seçilen ilan arasında analiz edilebilir ortak bir beceri bulunamadı. "
                "Lütfen doğru CV ve ilan eşleşmesini kontrol edin."
            ),
        )

    readiness_score = calculate_readiness_score(
        match_result["match_score"],
        cv_profile,
        match_result["missing_skills"],
        request.application_type,
    )
    score_explanation = build_score_explanation(
        match_result["match_score"],
        readiness_score,
        match_result["matched_skills"],
        match_result["missing_skills"],
        request.application_type,
    )

    return AnalyzeResponse(
        match_score=match_result["match_score"],
        readiness_score=readiness_score,
        score_explanation=score_explanation,
        matched_skills=match_result["matched_skills"],
        missing_skills=match_result["missing_skills"],
        evidence_table=match_result["evidence_table"],
        internship_analysis=build_internship_analysis(cv_profile, request.application_type),
        mini_project_recommendation=recommend_mini_project(
            match_result["missing_skills"],
            request.application_type,
        ),
        cv_improvement_suggestions=build_cv_improvement_suggestions(request.cv_text),
        interview_questions=generate_interview_questions(
            match_result["matched_skills"],
            match_result["missing_skills"],
            request.application_type,
        ),
    )
