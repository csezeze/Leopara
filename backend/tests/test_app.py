import unittest

from fastapi import HTTPException

from app import analyze
from models.schemas import AnalyzeRequest
from services.skills import find_skills


class AnalyzeApiTests(unittest.TestCase):
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

    def test_listed_skills_score_lower_than_evidence_backed_skills(self) -> None:
        posting_text = "Python, Git, Machine Learning ve NLP bilen stajyer aday ariyoruz."

        listed_payload = analyze(
            AnalyzeRequest(
                cv_text=(
                    "Gebze Teknik Universitesi Bilgisayar Muhendisligi ogrencisiyim. "
                    "Teknik beceriler: Python, Git, Machine Learning, NLP."
                ),
                posting_text=posting_text,
                application_type="internship",
            )
        ).model_dump()

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

        self.assertLess(listed_payload["match_score"], 70)
        self.assertGreater(
            evidence_backed_payload["match_score"],
            listed_payload["match_score"],
        )

    def test_real_ml_abbreviation_still_matches(self) -> None:
        skills = find_skills("Python ile ML modeli eğittim ve sonuçları değerlendirdim.")

        self.assertIn("Machine Learning", skills)


if __name__ == "__main__":
    unittest.main()
