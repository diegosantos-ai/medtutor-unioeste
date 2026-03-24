#!/usr/bin/env python3
"""
Script para popular o banco de dados com dados massivos e ricos do vestibular da UNIOESTE.
Execute: PYTHONPATH=. python scripts/seed_rich_data.py
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, engine
from app.models import Base, Question
from sqlalchemy.exc import IntegrityError


def seed_rich_data():
    db = SessionLocal()

    try:
        print("🌱 Iniciando injeção massiva de conhecimento UNIOESTE...")

        questions_data = [
            # Biologia
            {
                "id": "UNIOESTE-BIO-001",
                "vestibular": "UNIOESTE",
                "ano": 2024,
                "materia": "Biologia",
                "assunto": "Fisiologia Humana",
                "sub_assunto": "Sistema Endócrino",
                "dificuldade": "Difícil",
                "enunciado": "A regulação da glicemia no sangue humano é coordenada por hormônios pancreáticos. Sobre a diabetes mellitus tipo 1, é correto afirmar que ocorre devido à:",
                "alternativas": {
                    "a": "resistência dos receptores periféricos à insulina, promovendo acúmulo de glicose.",
                    "b": "redução extrema de secreção de glucagon pelas células alfa do pâncreas.",
                    "c": "destruição autoimune das células beta das ilhotas de Langerhans no pâncreas.",
                    "d": "hiperprodução de insulina que exaure os receptores celulares.",
                    "e": "deficiência na produção de ADH pela neuro-hipófise."
                },
                "resposta_correta": "C",
                "resolucao_base": "A diabetes tipo 1 é uma doença autoimune caracterizada pela destruição das células beta pancreáticas, que são as produtoras de insulina."
            },
            {
                "id": "UNIOESTE-BIO-002",
                "vestibular": "UNIOESTE",
                "ano": 2023,
                "materia": "Biologia",
                "assunto": "Genética",
                "sub_assunto": "Biotecnologia",
                "dificuldade": "Média",
                "enunciado": "A técnica de CRISPR-Cas9 revolucionou a biologia molecular. Seu mecanismo de ação baseia-se em:",
                "alternativas": {
                    "a": "Amplificação em cadeia de fragmentos de RNA mensageiro.",
                    "b": "Edição genômica através de cortes direcionados por uma sequência guia de RNA.",
                    "c": "Clonagem de embriões humanos para substituição mitocondrial.",
                    "d": "Extração de plasmídeos bacterianos para fusão nuclear.",
                    "e": "Silenciamento de proteínas atuando diretamente nos ribossomos."
                },
                "resposta_correta": "B",
                "resolucao_base": "O sistema CRISPR-Cas9 utiliza um RNA guia para direcionar a endonuclease Cas9 a cortar regiões específicas do DNA, permitindo a edição precisa do genoma."
            },
            # Química
            {
                "id": "UNIOESTE-QUI-001",
                "vestibular": "UNIOESTE",
                "ano": 2024,
                "materia": "Química",
                "assunto": "Físico-Química",
                "sub_assunto": "Cinética Química",
                "dificuldade": "Difícil",
                "enunciado": "Em uma reação de decomposição da água oxigenada catalisada por iodeto, a adição do catalisador atua:",
                "alternativas": {
                    "a": "Aumentando a energia de ativação e o rendimento global da reação.",
                    "b": "Deslocando o equilíbrio químico para a formação dos produtos.",
                    "c": "Proporcionando um caminho alternativo para a reação com menor energia de ativação.",
                    "d": "Diminuindo a entalpia dos reagentes para acelerar a quebra das ligações.",
                    "e": "Tornando a reação endotérmica, absorvendo o calor do ambiente."
                },
                "resposta_correta": "C",
                "resolucao_base": "O papel fundamental de um catalisador é diminuir a energia de ativação criando um mecanismo reacional alternativo, sem ser consumido ou alterar o ΔH e a constante de equilíbrio da reação."
            },
            {
                "id": "UNIOESTE-QUI-002",
                "vestibular": "UNIOESTE",
                "ano": 2022,
                "materia": "Química",
                "assunto": "Química Orgânica",
                "sub_assunto": "Reações Orgânicas",
                "dificuldade": "Média",
                "enunciado": "A reação de saponificação para a produção de sabão envolve a hidrólise básica de um:",
                "alternativas": {
                    "a": "Éster",
                    "b": "Ácido Carboxílico",
                    "c": "Éter",
                    "d": "Aldeído",
                    "e": "Amina"
                },
                "resposta_correta": "A",
                "resolucao_base": "A saponificação ocorre pela reação de um éster (triglicerídeo) com uma base forte (como NaOH), gerando glicerol e sais de ácidos graxos (sabão)."
            },
            # Física
            {
                "id": "UNIOESTE-FIS-001",
                "vestibular": "UNIOESTE",
                "ano": 2023,
                "materia": "Física",
                "assunto": "Termologia",
                "sub_assunto": "Termodinâmica",
                "dificuldade": "Difícil",
                "enunciado": "Durante uma transformação adiabática, um gás ideal sofre uma compressão. O que ocorrerá com a sua temperatura e a troca de calor?",
                "alternativas": {
                    "a": "A temperatura diminui e há perda de calor para o ambiente.",
                    "b": "A temperatura permanece constante e o trabalho é nulo.",
                    "c": "A temperatura aumenta e não há troca de calor com o ambiente.",
                    "d": "A temperatura aumenta e o gás absorve calor do ambiente.",
                    "e": "A temperatura diminui e não há troca de calor."
                },
                "resposta_correta": "C",
                "resolucao_base": "Na transformação adiabática (Q=0), não há troca de calor. Quando o gás é comprimido (Trabalho negativo), a variação de energia interna é positiva (ΔU = -W), logo a temperatura aumenta."
            },
            {
                "id": "UNIOESTE-FIS-002",
                "vestibular": "UNIOESTE",
                "ano": 2024,
                "materia": "Física",
                "assunto": "Óptica",
                "sub_assunto": "Refração",
                "dificuldade": "Média",
                "enunciado": "A miopia é um defeito de visão provocado por um alongamento do globo ocular. Qual tipo de lente deve ser usada para correção?",
                "alternativas": {
                    "a": "Lente convergente.",
                    "b": "Lente divergente.",
                    "c": "Lente cilíndrica.",
                    "d": "Lente esférica opaca.",
                    "e": "Lente plano-convexa."
                },
                "resposta_correta": "B",
                "resolucao_base": "Em olhos míopes, a imagem se forma antes da retina. As lentes divergentes são utilizadas para 'espalhar' os raios luminosos, permitindo que a imagem seja formada mais para trás, exatamente na retina."
            },
            # Matemática
            {
                "id": "UNIOESTE-MAT-001",
                "vestibular": "UNIOESTE",
                "ano": 2023,
                "materia": "Matemática",
                "assunto": "Geometria Espacial",
                "sub_assunto": "Volumes",
                "dificuldade": "Média",
                "enunciado": "Aumentando-se o raio da base de um cilindro em 20% e mantendo-se sua altura constante, o volume do cilindro aumentará em:",
                "alternativas": {
                    "a": "20%",
                    "b": "40%",
                    "c": "44%",
                    "d": "144%",
                    "e": "120%"
                },
                "resposta_correta": "C",
                "resolucao_base": "O volume original é V = Pi*r²*h. O novo raio é 1,2r. O novo volume é V' = Pi*(1,2r)²*h = 1,44*Pi*r²*h = 1,44V. Ou seja, um aumento de 44%."
            },
            # Literatura
            {
                "id": "UNIOESTE-LIT-001",
                "vestibular": "UNIOESTE",
                "ano": 2022,
                "materia": "Português",
                "assunto": "Literatura Brasileira",
                "sub_assunto": "Modernismo",
                "dificuldade": "Média",
                "enunciado": "Sobre a primeira fase do Modernismo brasileiro (Fase Heroica), iniciada com a Semana de Arte Moderna de 1922, destaca-se:",
                "alternativas": {
                    "a": "O rigor formal e a busca pela rima rica e metrificação perfeita.",
                    "b": "A valorização excessiva da arte europeia clássica nos manifestos pau-brasil.",
                    "c": "A quebra com os padrões estéticos do parnasianismo e valorização do folclore e verso livre.",
                    "d": "A produção estritamente panfletária com cunho puramente político militar.",
                    "e": "O resgate ao bucolismo e arcadismo português."
                },
                "resposta_correta": "C",
                "resolucao_base": "A primeira fase (1922-1930) buscou o rompimento com o passadismo e o Parnasianismo, propondo a liberdade formal (verso livre, ausência de pontuação), o uso do coloquialismo e a revisitação de temas folclóricos e indígenas brasileiros em tom muitas vezes irônico ou crítico."
            }
        ]

        inserted = 0
        for q_data in questions_data:
            exists = db.query(Question).filter(Question.id == q_data["id"]).first()
            if not exists:
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
                    tags_medicina=["vestibular", "unioeste", "medicina"],
                )
                db.add(question)
                inserted += 1

        db.commit()
        print(f"✅ {inserted} novas questões avançadas da UNIOESTE criadas com sucesso!")

    except Exception as e:
        db.rollback()
        print(f"❌ Erro durante injeção de dados ricos: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    seed_rich_data()
