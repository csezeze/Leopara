import unittest

from fastapi import HTTPException

from app import analyze
from models.schemas import AnalyzeRequest
from services.job_analyzer import analyze_posting
from services.interview import BEHAVIORAL_QUESTIONS
from services.skills import find_skills


class AnalyzeApiTests(unittest.TestCase):
    def test_posting_requirements_include_priority_levels(self) -> None:
        details = {
            item["skill"]: item
            for item in analyze_posting(
                "Python zorunludur. Docker tercih sebebidir. Git bilgisi ek avantajdır."
            )["requirement_details"]
        }

        self.assertEqual(details["Python"]["priority"], "required")
        self.assertEqual(details["Docker"]["priority"], "preferred")
        self.assertEqual(details["Git"]["priority"], "bonus")

    def test_unmarked_requirement_is_not_labeled_required(self) -> None:
        details = analyze_posting("Ekibimiz React ve TypeScript kullanıyor.")[
            "requirement_details"
        ]

        self.assertTrue(details)
        self.assertTrue(all(item["priority"] == "unspecified" for item in details))

    def test_repeated_skill_uses_highest_priority_once(self) -> None:
        details = analyze_posting(
            "Docker tercih sebebidir. Üretim ortamı için Docker zorunludur."
        )["requirement_details"]

        docker_details = [item for item in details if item["skill"] == "Docker"]
        self.assertEqual(len(docker_details), 1)
        self.assertEqual(docker_details[0]["priority"], "required")

    def test_required_skill_has_more_score_weight_than_preferred_skill(self) -> None:
        posting_text = "Python zorunludur. Docker tercih sebebidir."

        required_match = analyze(
            AnalyzeRequest(
                cv_text=(
                    "Bilgisayar muhendisligi ogrencisiyim. "
                    "Python ile ders projesi gelistirdim ve GitHub uzerinde yayinladim."
                ),
                posting_text=posting_text,
                application_type="job",
            )
        ).model_dump()
        preferred_match = analyze(
            AnalyzeRequest(
                cv_text=(
                    "Bilgisayar muhendisligi ogrencisiyim. "
                    "Docker ile temel bir ders projesi gelistirdim ve sonucu portfolyoma ekledim."
                ),
                posting_text=posting_text,
                application_type="job",
            )
        ).model_dump()

        self.assertGreater(required_match["match_score"], preferred_match["match_score"])
        self.assertIn("Docker", required_match["missing_skills"])
        self.assertNotIn("Docker", required_match["critical_missing_skills"])
        self.assertIn("Python", preferred_match["critical_missing_skills"])

    def test_analysis_does_not_log_cv_content(self) -> None:
        cv_text = (
            "Bilgisayar muhendisligi ogrencisiyim. "
            "Python ile REST API projesi gelistirdim ve GitHub uzerinde yayinladim."
        )

        with self.assertNoLogs(level="INFO"):
            analyze(
                AnalyzeRequest(
                    cv_text=cv_text,
                    posting_text="Python ve REST API bilgisi olan junior developer ariyoruz.",
                    application_type="job",
                )
            )

    def test_analyze_returns_score_explanation(self) -> None:
        payload = analyze(
            AnalyzeRequest(
                cv_text="Python ve Flask ile REST API gelistirdim. GitHub uzerinde projelerim var. SQL kullandim.",
                posting_text="Junior backend developer icin Python, FastAPI, PostgreSQL, REST API ve Git bilgisi beklenir.",
                application_type="job",
            )
        ).model_dump()

        self.assertIn("score_explanation", payload)
        self.assertTrue(payload["score_explanation"])
        self.assertIn("Python", payload["score_explanation"])
        self.assertIn("FastAPI", payload["score_explanation"])

    def test_internship_explanation_mentions_mode_specific_logic(self) -> None:
        payload = analyze(
            AnalyzeRequest(
                cv_text="Bilgisayar muhendisligi ogrencisiyim. Python ile veri analizi projesi gelistirdim. Veri bilimi dersi aldim.",
                posting_text="Veri bilimi stajyeri ariyoruz. Python, SQL, Machine Learning ve GitHub portfolyosu beklenir.",
                application_type="internship",
            )
        ).model_dump()

        self.assertIn("Staj modu", payload["score_explanation"])

    def test_short_ml_keyword_does_not_match_inside_programlama(self) -> None:
        skills = find_skills(
            "Backend geliştirme, sistem programlama ve performans odaklı yazılım konularına ilgi duyuyorum."
        )

        self.assertNotIn("Machine Learning", skills)

    def test_incompatible_cv_is_not_analyzed(self) -> None:
        with self.assertRaises(HTTPException) as context:
            analyze(
                AnalyzeRequest(
                    cv_text=(
                        "Gebze Teknik Üniversitesi Bilgisayar Mühendisliği öğrencisiyim. "
                        "Backend geliştirme, sistem programlama ve performans odaklı yazılım konularına ilgi duyuyorum."
                    ),
                    posting_text="Stajyer adayında Machine Learning bilgisi ve ML proje deneyimi beklenir.",
                    application_type="internship",
                )
            )

        self.assertEqual(context.exception.status_code, 422)
        self.assertIn("ortak bir beceri bulunamadı", context.exception.detail)

    def test_keyword_list_is_not_accepted_as_cv(self) -> None:
        with self.assertRaises(HTTPException) as context:
            analyze(
                AnalyzeRequest(
                    cv_text="Python Git Machine Learning NLP FastAPI React PostgreSQL REST API Docker SQL",
                    posting_text="Python, Git, Machine Learning ve NLP bilen stajyer aday arıyoruz.",
                    application_type="internship",
                )
            )

        self.assertEqual(context.exception.status_code, 422)
        self.assertIn("geçerli bir CV gibi görünmüyor", context.exception.detail)

    def test_listed_skills_without_usage_evidence_are_not_analyzed(self) -> None:
        posting_text = "Python, Git, Machine Learning ve NLP bilen stajyer aday ariyoruz."

        with self.assertRaises(HTTPException) as context:
            analyze(
                AnalyzeRequest(
                    cv_text=(
                        "Gebze Teknik Universitesi Bilgisayar Muhendisligi ogrencisiyim. "
                        "Teknik beceriler: Python, Git, Machine Learning, NLP."
                    ),
                    posting_text=posting_text,
                    application_type="internship",
                )
            )

        evidence_backed_payload = analyze(
            AnalyzeRequest(
                cv_text=(
                    "Gebze Teknik Universitesi Bilgisayar Muhendisligi ogrencisiyim. "
                    "Python ile Machine Learning projesi gelistirdim. "
                    "NLP modelini egittim ve GitHub uzerinde yayinladim."
                ),
                posting_text=posting_text,
                application_type="internship",
            )
        ).model_dump()

        self.assertEqual(context.exception.status_code, 422)
        self.assertIn("somut bir kullanım kanıtı", context.exception.detail)
        self.assertGreater(evidence_backed_payload["match_score"], 0)

    def test_negated_skill_statement_is_not_counted_as_evidence(self) -> None:
        payload = analyze(
            AnalyzeRequest(
                cv_text=(
                    "Bilgisayar muhendisligi ogrencisiyim. "
                    "React ile bir ders projesi gelistirdim ve GitHub uzerinde yayinladim. "
                    "JavaScript, API entegrasyonu ve yayinlama deneyimim bulunmuyor."
                ),
                posting_text="React ve JavaScript bilgisi zorunludur.",
                application_type="internship",
            )
        ).model_dump()

        self.assertIn("React", payload["matched_skills"])
        self.assertIn("JavaScript", payload["missing_skills"])
        javascript_row = next(
            row for row in payload["evidence_table"] if row["requirement"] == "JavaScript"
        )
        self.assertEqual(javascript_row["status"], "missing")
        self.assertIsNone(javascript_row["evidence"])

    def test_document_test_label_is_not_counted_as_testing_skill(self) -> None:
        payload = analyze(
            AnalyzeRequest(
                cv_text=(
                    "Test amaciyla hazirlanmis kurgusal ornek CV. "
                    "Yonetim Bilisim Sistemleri ogrencisiyim. "
                    "Python ile kisisel bir veri analizi projesi gelistirdim ve GitHub'a ekledim."
                ),
                posting_text="Python ve Testing bilgisi zorunludur.",
                application_type="internship",
            )
        ).model_dump()

        self.assertIn("Python", payload["matched_skills"])
        self.assertIn("Testing", payload["missing_skills"])

    def test_project_and_cv_suggestions_follow_posting_technologies(self) -> None:
        payload = analyze(
            AnalyzeRequest(
                cv_text=(
                    "Bilgisayar muhendisligi ogrencisiyim. "
                    "Python ile ders projesi gelistirdim ve GitHub uzerinde yayinladim."
                ),
                posting_text=(
                    "Python zorunludur. FastAPI ve PostgreSQL tercih edilir. "
                    "REST API bilgisi ek avantajdir."
                ),
                application_type="internship",
            )
        ).model_dump()

        self.assertIn("FastAPI", payload["mini_project_recommendation"])
        self.assertIn("PostgreSQL", payload["mini_project_recommendation"])
        self.assertIn("aday başvuru servisi", payload["mini_project_recommendation"])
        self.assertTrue(
            any(
                "FastAPI" in suggestion["improved"]
                for suggestion in payload["cv_improvement_suggestions"]
            )
        )

    def test_interview_questions_include_one_behavioral_question(self) -> None:
        payload = analyze(
            AnalyzeRequest(
                cv_text=(
                    "Bilgisayar muhendisligi ogrencisiyim. "
                    "Python ile veri analizi projesi gelistirdim ve GitHub uzerinde yayinladim."
                ),
                posting_text="Python zorunludur. SQL ve Git tercih edilir.",
                application_type="internship",
            )
        ).model_dump()

        behavioral_count = sum(
            question in BEHAVIORAL_QUESTIONS
            for question in payload["interview_questions"]
        )
        self.assertEqual(len(payload["interview_questions"]), 5)
        self.assertEqual(behavioral_count, 1)

    def test_real_ml_abbreviation_still_matches(self) -> None:
        skills = find_skills("Python ile ML modeli eğittim ve sonuçları değerlendirdim.")

        self.assertIn("Machine Learning", skills)


if __name__ == "__main__":
    unittest.main()
