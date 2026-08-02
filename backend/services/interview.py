import random


BEHAVIORAL_QUESTIONS = [
    "Bir ekip çalışmasında fikir ayrılığı yaşadığınız bir durumu, yaklaşımınızı ve sonucu anlatır mısınız?",
    "Beklenmedik bir sorunla karşılaştığınızda önceliklerinizi nasıl belirlediğinize örnek verir misiniz?",
    "Kısa sürede yeni bir konu öğrenmeniz gereken bir deneyimi ve kullandığınız yöntemi anlatır mısınız?",
    "Geri bildirim aldığınız ve çalışma biçiminizi değiştirdiğiniz bir durumu paylaşır mısınız?",
    "Sorumluluğunu üstlendiğiniz bir işte hata yaptığınızda durumu nasıl yönettiğinizi anlatır mısınız?",
]

FALLBACK_TECHNICAL_QUESTIONS = [
    "CV'nizdeki en somut proje çıktısını ve bu projedeki kişisel katkınızı anlatır mısınız?",
    "İlandaki teknik gereksinimlerden hangisinde en güçlü olduğunuzu düşünüyorsunuz ve neden?",
    "Bir teknik problemi analiz ederken hangi adımları izlersiniz?",
    "Eksik gördüğünüz bir beceriyi geliştirmek için nasıl ölçülebilir bir plan hazırlarsınız?",
]


def generate_interview_questions(
    matched_skills: list[str],
    missing_skills: list[str],
    application_type: str,
) -> list[str]:
    technical_questions: list[str] = []

    for skill in matched_skills[:2]:
        technical_questions.append(
            f"{skill} ile yaptığınız bir projeyi, sorumluluğunuzu ve elde ettiğiniz çıktıyı anlatır mısınız?"
        )

    for skill in missing_skills[:2]:
        technical_questions.append(
            f"{skill} konusunda kendinizi geliştirmek için nasıl bir öğrenme ve uygulama planı izlersiniz?"
        )

    mode_question = (
        "Bu stajın ilk ayında hangi teknik kazanımı somut bir çıktıya dönüştürmek istersiniz?"
        if application_type == "internship"
        else "Bu role başladıktan sonraki ilk ayda hangi teknik çıktıyla değer üretmeyi planlarsınız?"
    )
    technical_questions.append(mode_question)

    for question in FALLBACK_TECHNICAL_QUESTIONS:
        if len(technical_questions) >= 4:
            break
        if question not in technical_questions:
            technical_questions.append(question)

    selected_questions = technical_questions[:4]
    behavioral_question = random.choice(BEHAVIORAL_QUESTIONS)
    selected_questions.insert(random.randrange(0, 5), behavioral_question)

    return selected_questions
