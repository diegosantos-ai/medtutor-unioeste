import json
import logging
import os
import random
import re
import warnings

from google.api_core.exceptions import GoogleAPIError
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

from app.rag_service import rag_db
from app.video_database import get_recommended_videos

with warnings.catch_warnings():
    warnings.simplefilter("ignore", FutureWarning)
    import google.generativeai as genai

logger = logging.getLogger("ai_service")


def extract_json_block(text: str) -> str:
    """Extract and clean JSON block from Gemini response text."""
    text = text.strip()

    # Remove markdown code blocks
    if text.startswith("```"):
        text = re.sub(r"^```json\s*", "", text)
        text = re.sub(r"^```\s*", "", text)
        text = re.sub(r"\s*```$", "", text)

    # Remove control characters that cause JSON parse errors
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)

    # Try to extract JSON object if text contains extra content
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        return match.group(0)

    return text


def safe_json_loads(text: str) -> dict:
    """Safely parse JSON from Gemini response with fallback."""
    try:
        cleaned = extract_json_block(text)
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        logger.warning(f"JSON parse error, attempting recovery: {e}")
        # Try to fix common issues
        cleaned = extract_json_block(text)
        # Replace newlines within strings
        cleaned = re.sub(r'(?<=\")\n(?=\")', '\\\\n', cleaned)
        # Try again
        return json.loads(cleaned)


def _get_model():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY nao configurada.")
    genai.configure(api_key=api_key)
    return genai.GenerativeModel("gemini-2.5-flash")


def generate_study_plan(profile: dict):
    model = _get_model()
    days = profile.get("days", 30)
    difficulties = profile.get("difficulties", [])
    learning_style = profile.get("learning_style", "visual")
    name = profile.get("name", "Student")
    profile_type = profile.get("profile", "Ciclo Básico")

    prompt = f"""
    Você é um tutor especialista em Medicina.
    Perfil do estudante: Nome: {name}, Perfil: {profile_type}, Estilo de aprendizagem: {learning_style}, Dias: {days}, Dificuldades: {json.dumps(difficulties)}

    Crie um plano de estudo de {days} dias, dividindo os conteúdos das matérias, priorizando as dificuldades informadas pelo aluno.
    Para cada dia, gere tarefas teóricas, indique o tópico e o subject. Não invente URLs de vídeos. Deixe "video_url" em branco no JSON, pois o backend preencherá.
    Retorne SOMENTE um JSON válido com esta estrutura:
    {{
      "days": {days},
      "schedule": [
        {{
          "day": "Dia 1",
          "tasks": [
            {{
              "id": "task_1",
              "subject": "Anatomia",
              "topic": "Sistema Nervoso Central",
              "duration": "45 min",
              "objective": "Compreender estruturas medulares e nervos",
              "type": "teoria|video|quiz|resumo",
              "video_url": "",
              "quiz": [{{"question": "...", "options": ["A", "B", "C"], "answer": "A"}}],
              "completed": false
            }}
          ],
          "summary": "Resumo do dia 1...",
          "mindmap_url": ""
        }}
      ]
    }}
    """

    try:

        @retry(
            stop=stop_after_attempt(3),
            wait=wait_exponential(multiplier=1, min=2, max=10),
            retry=retry_if_exception_type(GoogleAPIError),
            reraise=True,
        )
        def _gen():
            return model.generate_content(prompt)

        response = _gen()
    except Exception as e:
        logger.error(f"Falha critica no Gemini (generation): {e}")
        raise RuntimeError("Serviço de IA indisponível no momento.") from e

    try:
        data = safe_json_loads(response.text)

        # Inject real videos
        for day_schedule in data.get("schedule", []):
            for task in day_schedule.get("tasks", []):
                if task.get("type", "") == "video" or "video" in json.dumps(task):
                    recs = get_recommended_videos(task.get("subject", "Anatomia"))
                    if recs:
                        chosen = random.choice(recs)
                        task["video_url"] = chosen["url"]
                        task["video_title"] = chosen["title"]
                        task["video_channel"] = chosen["channel"]
        return data
    except Exception as e:
        logger.exception(
            "Falha ao interpretar resposta do Gemini", extra={"error": str(e)}
        )
        return {"ok": False, "error_code": "STUDY_PLAN_PARSE_ERROR", "weekId": 1, "schedule": []}


def get_tutor_response(query: str, profile: dict, history: list):
    model = _get_model()
    chat = model.start_chat()

    rag_result = rag_db.query_context(query, max_results=3)
    rag_context = rag_result.get("context", "")
    sources = rag_result.get("sources", [])

    context_prompt = f"""
Você é um Coordenador de Cursinho Elite para Medicina.
Regras de conduta rigorosas:
1. Se o aluno errar, NUNCA dê a resposta direta.
2. Aponte a lacuna teórica onde ele errou.
3. Use analogias clínicas ou casos médicos sempre que possível para explicar conceitos básicos.
4. Priorize temas de alta recorrência.
5. Use "Chain of Thought" internamente (pense passo a passo antes de responder) para evitar erros de Estequiometria ou Genética, por exemplo.

[CONTEXTO RECUPERADO DE MANUAIS/AULAS VIA RAG]:
{rag_context}

Perfil do aluno: {json.dumps(profile)}.
Pergunta atual do estudante: {query}
"""

    try:

        @retry(
            stop=stop_after_attempt(3),
            wait=wait_exponential(multiplier=1, min=2, max=10),
            retry=retry_if_exception_type(GoogleAPIError),
            reraise=True,
        )
        def _send():
            return chat.send_message(context_prompt)

        response = _send()
    except Exception as e:
        logger.error(f"Falha critica no Gemini (tutor): {e}")
        raise RuntimeError(
            "Serviço de IA indisponível no momento. Tente novamente mais tarde."
        ) from e

    formatted_sources = [
        {
            "title": s.get("title", "Unknown"),
            "url": "#",
            "chunk_id": s.get("chunk_id", 0),
        }
        for s in sources
    ]

    return {"text": response.text, "sources": formatted_sources}


def generate_summary(subject: str, topic: str):
    model = _get_model()
    prompt = f"""
    Create a detailed study guide for the UNIOESTE exam about {subject} - {topic}.
    Return ONLY a valid JSON matching this structure:
    {{
      "title": "String",
      "subject": "{subject}",
      "topic": "{topic}",
      "content": "Rich string with markdown formatting discussing {topic}",
      "prerequisites": ["List", "of", "strings"],
      "examples": ["List", "of", "strings"],
      "externalLinks": [
        {{"title": "Link name", "url": "https://..."}}
      ]
    }}
    """

    try:

        @retry(
            stop=stop_after_attempt(3),
            wait=wait_exponential(multiplier=1, min=2, max=10),
            retry=retry_if_exception_type(GoogleAPIError),
            reraise=True,
        )
        def _gen():
            return model.generate_content(prompt)

        response = _gen()
    except Exception as e:
        logger.error(f"Falha critica no Gemini (generation): {e}")
        raise RuntimeError("Serviço de IA indisponível no momento.") from e

    try:
        return safe_json_loads(response.text)
    except Exception as e:
        logger.exception(
            "Falha ao interpretar resumo do Gemini", extra={"error": str(e), "raw_response": response.text[:500]}
        )
        return {
            "ok": False,
            "error_code": "SUMMARY_PARSE_ERROR",
            "message": "Não foi possível estruturar o resumo gerado. Tente novamente.",
            "title": topic,
            "subject": subject,
            "topic": topic,
            "content": "Erro na geração do conteúdo.",
            "prerequisites": [],
            "examples": [],
            "externalLinks": [],
        }
