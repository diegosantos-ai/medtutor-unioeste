# Base curada e real de aulas voltadas a estudantes de medicina e vestibular de alta concorrência.
# Esta lista serve como base contextual para a IA não alucinar links falsos e sempre apresentar bons conteúdos.

MEDICAL_VIDEOS = [
    {
        "subject": "Anatomia",
        "topic": "Sistema Nervoso Central",
        "title": "Anatomia do SNC - Aula Completa",
        "channel": "Anatomia Fácil com Rogério Gozzi",
        "url": "https://www.youtube.com/watch?v=kYIIf6gB-eI",
    },
    {
        "subject": "Anatomia",
        "topic": "Sistema Cardiovascular",
        "title": "Anatomia do Coração",
        "channel": "Anatomia Fácil com Rogério Gozzi",
        "url": "https://www.youtube.com/watch?v=-8L4N7U-vN0",
    },
    {
        "subject": "Fisiologia",
        "topic": "Potencial de Ação",
        "title": "Fisiologia - Potencial de Ação",
        "channel": "Medicina Resumida",
        "url": "https://www.youtube.com/watch?v=FjC21z2vHSE",
    },
    {
        "subject": "Fisiologia",
        "topic": "Fisiologia Cardíaca: Ciclo Cardíaco",
        "title": "Ciclo Cardíaco",
        "channel": "SanarFlix",
        "url": "https://www.youtube.com/watch?v=wXlsF4U-rB4",
    },
    {
        "subject": "Imunologia",
        "topic": "Imunidade Inata vs Adaptativa",
        "title": "Introdução à Imunologia",
        "channel": "Jaleko Acadêmicos",
        "url": "https://www.youtube.com/watch?v=zJg5nL0S_gM",
    },
    {
        "subject": "Bioquímica",
        "topic": "Ciclo de Krebs e Respiração Celular",
        "title": "Ciclo de Krebs Descomplicado",
        "channel": "Professor Kennedy Ramos",
        "url": "https://www.youtube.com/watch?v=LqUu07-B9tE",
    },
    {
        "subject": "Patologia",
        "topic": "Inflamação Aguda",
        "title": "Patologia Geral - Inflamação Aguda e Crônica",
        "channel": "Patologia Diária",
        "url": "https://www.youtube.com/watch?v=aG_jR9UovwI",
    },
    {
        "subject": "Farmacologia",
        "topic": "Farmacocinética",
        "title": "Introdução à Farmacocinética",
        "channel": "Sanar",
        "url": "https://www.youtube.com/watch?v=Yf1oHh5H8zQ",
    },
]


def get_recommended_videos(subject: str) -> list:
    """Retorna vídeos relacionados ao tema fornecido."""
    videos = [v for v in MEDICAL_VIDEOS if v["subject"].lower() == subject.lower()]
    return videos if videos else MEDICAL_VIDEOS
