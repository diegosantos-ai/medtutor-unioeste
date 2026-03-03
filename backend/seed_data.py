#!/usr/bin/env python3
"""
Script para popular o banco de dados com dados iniciais
Execute: python seed_data.py
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, timezone, timedelta
from app.database import SessionLocal, engine
from app.models import Base, User, Flashcard, Question
from app.auth import get_password_hash


def seed_data():
    db = SessionLocal()

    try:
        print("🌱 Iniciando seed do banco de dados...")

        # Criar usuário demo se não existir
        demo_user = db.query(User).filter(User.email == "demo@medtutor.com").first()
        if not demo_user:
            demo_user = User(
                email="demo@medtutor.com",
                password_hash=get_password_hash("demo123"),
                name="Estudante Demo",
                daily_hours=4,
                difficulties=["Física", "Matemática"],
                learning_style="visual",
                has_onboarded=True,
                streak=5,
                last_study_date=datetime.now(timezone.utc),
                is_active=True,
                created_at=datetime.now(timezone.utc),
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)
            print(f"✅ Usuário demo criado: {demo_user.email}")
        else:
            print(f"ℹ️ Usuário demo já existe: {demo_user.email}")

        # Criar flashcards de exemplo
        existing_flashcards = (
            db.query(Flashcard).filter(Flashcard.user_id == demo_user.id).count()
        )
        if existing_flashcards == 0:
            flashcards_data = [
                # Biologia
                {
                    "front": "Qual é a função das mitocôndrias?",
                    "back": "Produção de ATP (energia) através da respiração celular. São as 'usinas de energia' da célula.",
                    "topic": "Citologia",
                },
                {
                    "front": "O que é a homeostase?",
                    "back": "Manutenção do equilíbrio interno do organismo, mantendo parâmetros como temperatura, pH e concentração de glicose estáveis.",
                    "topic": "Fisiologia",
                },
                {
                    "front": "Quais são as bases nitrogenadas do DNA?",
                    "back": "Adenina (A), Timina (T), Guanina (G) e Citosina (C). A pareia com T, e G pareia com C.",
                    "topic": "Genética",
                },
                {
                    "front": "O que é o sistema imunológico inato?",
                    "back": "Primeira linha de defesa do organismo, composta por barreiras físicas (pele), químicas (lisoenzimas) e células (fagócitos).",
                    "topic": "Imunologia",
                },
                {
                    "front": "Qual a diferença entre mitose e meiose?",
                    "back": "Mitose: divisão celular que resulta em 2 células idênticas (2n). Meiose: divisão que resulta em 4 células com metade dos cromossomos (n), para gametas.",
                    "topic": "Citologia",
                },
                # Anatomia
                {
                    "front": "Quantos ossos tem o corpo humano adulto?",
                    "back": "206 ossos. Bebês nascem com aproximadamente 270, mas muitos se fundem durante o desenvolvimento.",
                    "topic": "Sistema Esquelético",
                },
                {
                    "front": "Qual é o maior órgão do corpo humano?",
                    "back": "A pele (integumento), com área média de 1,5-2m² e peso de 3,5-10kg.",
                    "topic": "Anatomia",
                },
                {
                    "front": "O que é o sistema nervoso autônomo?",
                    "back": "Divisão do SNP que controla funções involuntárias. Dividido em: Simpático (ação/régua) e Parassimpático (repouso/digestão).",
                    "topic": "Sistema Nervoso",
                },
                # Bioquímica
                {
                    "front": "O que é a glicólise?",
                    "back": "Quebra da glicose em ácido pirúvico, ocorrendo no citoplasma. Produz 2 ATP e 2 NADH (por glicose).",
                    "topic": "Metabolismo",
                },
                {
                    "front": "Qual a função das enzimas?",
                    "back": "Catalisar reações químicas, diminuindo a energia de ativação sem serem consumidas na reação.",
                    "topic": "Enzimas",
                },
                # Química
                {
                    "front": "O que é uma ligação covalente?",
                    "back": "Ligação química onde átomos compartilham pares de elétrons para atingir a estabilidade.",
                    "topic": "Química",
                },
                {
                    "front": "Qual a diferença entre isômeros?",
                    "back": "Compostos com mesma fórmula molecular mas diferentes arranjos estruturais (isômeros estruturais) ou espaciais (estereoisômeros).",
                    "topic": "Química Orgânica",
                },
                # Fisiologia
                {
                    "front": "Como funciona o ciclo cardíaco?",
                    "back": "Sequência de contração (sístole) e relaxamento (diástole) dos átrios e ventrículos. Coração bombeia sangue para pulmões (pequena circulação) e corpo (grande circulação).",
                    "topic": "Fisiologia Cardiovascular",
                },
                {
                    "front": "O que é a Lei do Coração de Starling?",
                    "back": "O coração bombeia todo sangue que recebe. Quanto mais esticado o músculo cardíaco, maior a força de contração (até um limite).",
                    "topic": "Fisiologia Cardiovascular",
                },
            ]

            for card_data in flashcards_data:
                flashcard = Flashcard(
                    user_id=demo_user.id,
                    front=card_data["front"],
                    back=card_data["back"],
                    topic=card_data["topic"],
                    next_review=datetime.now(timezone.utc),
                    box=0,
                )
                db.add(flashcard)

            db.commit()
            print(f"✅ {len(flashcards_data)} flashcards criados")
        else:
            print(f"ℹ️ Flashcards já existem: {existing_flashcards}")

        # Criar questões UNIOESTE de exemplo
        existing_questions = db.query(Question).count()
        if existing_questions == 0:
            questions_data = [
                {
                    "id": "BIO-001",
                    "vestibular": "UNIOESTE",
                    "ano": 2023,
                    "materia": "Biologia",
                    "assunto": "Genética",
                    "sub_assunto": "Hereditariedade",
                    "dificuldade": "Média",
                    "enunciado": "Em um cruzamento entre plantas de ervilha, uma planta de flores roxas homozigótica (PP) foi cruzada com uma de flores brancas homozigótica (pp). Qual será o fenótipo da F1?",
                    "alternativas": {
                        "a": "100% flores roxas",
                        "b": "100% flores brancas",
                        "c": "50% roxas e 50% brancas",
                        "d": "75% roxas e 25% brancas",
                        "e": "25% roxas e 75% brancas",
                    },
                    "resposta_correta": "A",
                    "resolucao_base": "O cruzamento PP x pp resulta em 100% Pp (heterozigotos). Como o alelo P (roxo) é dominante sobre p (branco), todos os descendentes terão flores roxas.",
                },
                {
                    "id": "BIO-002",
                    "vestibular": "UNIOESTE",
                    "ano": 2023,
                    "materia": "Biologia",
                    "assunto": "Citologia",
                    "sub_assunto": "Organelas",
                    "dificuldade": "Fácil",
                    "enunciado": "Qual organela celular é responsável pela síntese de proteínas?",
                    "alternativas": {
                        "a": "Mitocôndria",
                        "b": "Ribossomo",
                        "c": "Complexo de Golgi",
                        "d": "Lisossomo",
                        "e": "Peroxissomo",
                    },
                    "resposta_correta": "B",
                    "resolucao_base": "Os ribossomos são as organelas responsáveis pela síntese proteica, traduzindo o RNA mensageiro em cadeias polipeptídicas.",
                },
                {
                    "id": "QUI-001",
                    "vestibular": "UNIOESTE",
                    "ano": 2023,
                    "materia": "Química",
                    "assunto": "Química Orgânica",
                    "sub_assunto": "Funções Orgânicas",
                    "dificuldade": "Média",
                    "enunciado": "Qual função orgânica está presente na molécula de etanol?",
                    "alternativas": {
                        "a": "Aldeído",
                        "b": "Cetona",
                        "c": "Álcool",
                        "d": "Ácido carboxílico",
                        "e": "Éster",
                    },
                    "resposta_correta": "C",
                    "resolucao_base": "O etanol (C₂H₅OH) possui o grupo funcional hidroxila (-OH) ligado a carbono saturado, caracterizando a função álcool.",
                },
                {
                    "id": "FIS-001",
                    "vestibular": "UNIOESTE",
                    "ano": 2023,
                    "materia": "Física",
                    "assunto": "Eletrodinâmica",
                    "sub_assunto": "Lei de Ohm",
                    "dificuldade": "Média",
                    "enunciado": "Um resistor de 10Ω é percorrido por uma corrente de 2A. Qual a tensão aplicada?",
                    "alternativas": {
                        "a": "5V",
                        "b": "10V",
                        "c": "15V",
                        "d": "20V",
                        "e": "25V",
                    },
                    "resposta_correta": "D",
                    "resolucao_base": "Pela Lei de Ohm: V = R × i = 10Ω × 2A = 20V",
                },
                {
                    "id": "HIS-001",
                    "vestibular": "UNIOESTE",
                    "ano": 2023,
                    "materia": "História",
                    "assunto": "História do Brasil",
                    "sub_assunto": "Período Colonial",
                    "dificuldade": "Fácil",
                    "enunciado": "Qual foi o principal produto de exportação do Brasil Colônia durante o século XVIII?",
                    "alternativas": {
                        "a": "Açúcar",
                        "b": "Café",
                        "c": "Ouro",
                        "d": "Algodão",
                        "e": "Cacau",
                    },
                    "resposta_correta": "C",
                    "resolucao_base": "Durante o século XVIII, o ouro foi o principal produto de exportação brasileiro, impulsionando o ciclo minerador.",
                },
                {
                    "id": "BIO-003",
                    "vestibular": "UNIOESTE",
                    "ano": 2022,
                    "materia": "Biologia",
                    "assunto": "Evolução",
                    "sub_assunto": "Teoria da Evolução",
                    "dificuldade": "Difícil",
                    "enunciado": "Sobre a teoria da evolução por seleção natural de Darwin, é correto afirmar:",
                    "alternativas": {
                        "a": "Os indivíduos evoluem durante suas vidas para se adaptarem ao ambiente",
                        "b": "As mutações ocorrem direcionadas para benefício do organismo",
                        "c": "A seleção natural atua sobre variações preexistentes na população",
                        "d": "Características adquiridas são transmitidas aos descendentes",
                        "e": "A evolução ocorre apenas em populações isoladas",
                    },
                    "resposta_correta": "C",
                    "resolucao_base": "Darwin propôs que a seleção natural atua sobre as variações já existentes na população, favorecendo os indivíduos mais adaptados.",
                },
                {
                    "id": "POR-001",
                    "vestibular": "UNIOESTE",
                    "ano": 2023,
                    "materia": "Português",
                    "assunto": "Gramática",
                    "sub_assunto": "Sintaxe",
                    "dificuldade": "Média",
                    "enunciado": "Na frase 'Os alunos estudaram para a prova', o termo 'para a prova' expressa:",
                    "alternativas": {
                        "a": "Lugar",
                        "b": "Tempo",
                        "c": "Finalidade",
                        "d": "Causa",
                        "e": "Modo",
                    },
                    "resposta_correta": "C",
                    "resolucao_base": "A locução prepositiva 'para a prova' indica finalidade, respondendo à pergunta 'estudaram para quê?'.",
                },
                {
                    "id": "GEO-001",
                    "vestibular": "UNIOESTE",
                    "ano": 2023,
                    "materia": "Geografia",
                    "assunto": "Geografia do Brasil",
                    "sub_assunto": "Biomas",
                    "dificuldade": "Fácil",
                    "enunciado": "Qual é o maior bioma brasileiro em extensão territorial?",
                    "alternativas": {
                        "a": "Amazônia",
                        "b": "Cerrado",
                        "c": "Mata Atlântica",
                        "d": "Caatinga",
                        "e": "Pampa",
                    },
                    "resposta_correta": "A",
                    "resolucao_base": "A Amazônia é o maior bioma brasileiro, ocupando aproximadamente 49% do território nacional.",
                },
            ]

            for q_data in questions_data:
                question = Question(
                    id=q_data["id"],
                    vestibular=q_data["vestibular"],
                    ano=q_data["ano"],
                    materia=q_data["materia"],
                    assunto=q_data["assunto"],
                    sub_assunto=q_data["sub_assunto"],
                    dificuldade=q_data["dificuldade"],
                    enunciado=q_data["enunciado"],
                    alternativas=q_data["alternativas"],
                    resposta_correta=q_data["resposta_correta"],
                    resolucao_base=q_data["resolucao_base"],
                    tags_medicina=["vestibular", "unioeste"],
                )
                db.add(question)

            db.commit()
            print(f"✅ {len(questions_data)} questões criadas")
        else:
            print(f"ℹ️ Questões já existem: {existing_questions}")

        print("\n✨ Seed concluído com sucesso!")
        print(f"\n📧 Login demo: demo@medtutor.com / demo123")

    except Exception as e:
        db.rollback()
        print(f"❌ Erro durante seed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    # Criar tabelas se não existirem
    Base.metadata.create_all(bind=engine)
    seed_data()
