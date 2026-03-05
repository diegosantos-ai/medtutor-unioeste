from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime, timedelta, timezone
from app.database import get_db
import app.models as models
from app.ai_service import generate_study_plan, get_tutor_response, generate_summary
from app.auth import (
    AuthService,
    create_access_token,
    get_current_active_user,
    get_password_hash,
)
from app.schemas import (
    UserCreate,
    UserLogin,
    UserResponse,
    UserUpdate,
    Token,
    FlashcardCreate,
    FlashcardResponse,
    FlashcardReview,
    ErrorNotebookItem,
    ClinicalCase,
    CaseAnswer,
)
from app.rag_service import rag_db
from app.config import BASE_CONHECIMENTO_DIR
import uuid
import os
import tempfile

router = APIRouter(prefix="/api")


@router.post("/config-study-plan")
def config_study_plan(payload: dict, db: Session = Depends(get_db)):
    days = payload.get("days", 30)
    difficulties = payload.get("difficulties", [])
    name = payload.get("name", "Student")

    user = db.query(models.User).first()
    if not user:
        user = models.User(name=name)
        db.add(user)
        db.commit()
        db.refresh(user)

    user.difficulties = difficulties
    db.commit()

    return {
        "message": "Configuração salva com sucesso",
        "days": days,
        "difficulties": difficulties,
    }


@router.post("/study-plan")
def create_study_plan(payload: dict, db: Session = Depends(get_db)):
    # 1. Generate plan using AI
    profile = payload.get("profile", {})
    plan_data = generate_study_plan(profile)

    # 2. Save/Update user profile
    # For simplicity, we hardcode user 1 or create it
    user = db.query(models.User).first()
    if not user:
        user = models.User(name=profile.get("name", "Student"))
        db.add(user)
        db.commit()

    # 3. Save the plan to the DB
    new_plan = models.StudyPlan(
        user_id=user.id, week_id=plan_data.get("weekId", 1), schedule_data=plan_data
    )
    db.add(new_plan)
    db.commit()

    return {"text": plan_data}


@router.post("/chat/tutor")
def chat_with_tutor(payload: dict, db: Session = Depends(get_db)):
    query: str = str(payload.get("query", ""))
    profile = payload.get("profile", {})
    history = payload.get("history", [])

    if not query or not query.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Query é obrigatória"
        )

    response = get_tutor_response(query, profile, history)

    # Optional: Save message to DB for persistent memory (Caderno de Erros / Histórico)
    user = db.query(models.User).first()
    if user:
        # Simplistic implementation finding the first session or creating one
        session = (
            db.query(models.ChatSession)
            .filter(models.ChatSession.user_id == user.id)
            .first()
        )
        if not session:
            import uuid

            session = models.ChatSession(
                id=str(uuid.uuid4()), user_id=user.id, title="Estudos"
            )
            db.add(session)
            db.commit()

        # Log User Message
        user_msg = models.Message(session_id=session.id, role="user", text=query)
        db.add(user_msg)

        # Log Bot Message
        bot_msg = models.Message(
            session_id=session.id, role="bot", text=response["text"]
        )
        db.add(bot_msg)
        db.commit()

    return response


@router.post("/redacao/corrigir")
def correct_essay(payload: dict, db: Session = Depends(get_db)):
    # Futura integração com o GPT-4o Vision para avaliar fotos de redações
    # image_data = payload.get("image")
    # competences_score = ai_service.evaluate_essay_vision(image_data)

    return {
        "status": "Em desenvolvimento",
        "message": "A funcionalidade de correção por imagem será integrada em breve usando o GPT-4o Vision.",
        "nota": 800,
        "competencias": {"C1": 160, "C2": 160, "C3": 160, "C4": 160, "C5": 160},
    }


@router.post("/plano-estudo/update")
def update_study_plan(payload: dict, db: Session = Depends(get_db)):
    """
    Recalcula a rota do aluno com base nos acertos/erros do dia.
    Implementação futura de Spaced Repetition e direcionamento dinâmico.
    """
    erros = payload.get("erros_hoje", [])
    user_id = payload.get("user_id", 1)

    # Logic to fetch current plan and update based on `erros`
    return {
        "status": "Plano recalculado",
        "novas_tarefas": [
            {"subject": erro, "type": "revisao_focada", "duration": "20 min"}
            for erro in erros
        ],
    }


@router.post("/summary")
def get_study_resource(payload: dict, db: Session = Depends(get_db)):
    subject = payload.get("subject", "Geral")
    topic = payload.get("topic", "")
    data = generate_summary(subject, topic)
    return {"text": data}


# ============================================================================
# AUTH ENDPOINTS
# ============================================================================


@router.post("/auth/register", response_model=Token)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    try:
        user = auth_service.register(
            email=user_data.email, password=user_data.password, name=user_data.name
        )
        access_token = create_access_token(data={"sub": user.email})
        return {"access_token": access_token, "token_type": "bearer", "user": user}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar usuário: {str(e)}",
        )


@router.post("/auth/login", response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    user = auth_service.login(email=user_data.email, password=user_data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Email ou senha incorretos"
        )

    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer", "user": user}


@router.get("/auth/me", response_model=UserResponse)
def get_me(current_user: models.User = Depends(get_current_active_user)):
    return current_user


@router.put("/auth/me", response_model=UserResponse)
def update_me(
    user_update: UserUpdate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    auth_service = AuthService(db)
    updated_user = auth_service.update_user(
        current_user, **user_update.model_dump(exclude_unset=True)
    )
    return updated_user


# ============================================================================
# FLASHCARDS ENDPOINTS
# ============================================================================


@router.get("/flashcards", response_model=List[FlashcardResponse])
def get_flashcards(
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    due_only: bool = True,
):
    query = db.query(models.Flashcard).filter(
        models.Flashcard.user_id == current_user.id
    )

    if due_only:
        now = datetime.now(timezone.utc)
        query = query.filter(models.Flashcard.next_review <= now)

    flashcards = query.order_by(models.Flashcard.next_review).all()
    return flashcards


@router.post("/flashcards", response_model=FlashcardResponse)
def create_flashcard(
    card_data: FlashcardCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    flashcard = models.Flashcard(
        user_id=current_user.id,
        front=card_data.front,
        back=card_data.back,
        topic=card_data.topic,
        next_review=datetime.now(timezone.utc),
        box=0,
    )
    db.add(flashcard)
    db.commit()
    db.refresh(flashcard)
    return flashcard


@router.post("/flashcards/{card_id}/review", response_model=FlashcardResponse)
def review_flashcard(
    card_id: int,
    review: FlashcardReview,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    flashcard = (
        db.query(models.Flashcard)
        .filter(
            models.Flashcard.id == card_id, models.Flashcard.user_id == current_user.id
        )
        .first()
    )

    if not flashcard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Flashcard não encontrado"
        )

    # Sistema Leitner simplificado
    # quality: 0=Errei, 1=Difícil, 2=Bom, 3=Fácil
    quality = review.quality
    current_box: int = int(flashcard.box)  # type: ignore

    if quality == 0:  # Errei - volta para caixa 0
        new_box = 0
        days_until_next = 1
    elif quality == 1:  # Difícil - mantém na caixa atual
        new_box = current_box
        days_until_next = max(1, current_box)
    elif quality == 2:  # Bom - avança uma caixa
        new_box = min(current_box + 1, 5)
        days_until_next = new_box * 2
    else:  # Fácil - avança duas caixas
        new_box = min(current_box + 2, 5)
        days_until_next = new_box * 3

    flashcard.box = new_box  # type: ignore
    next_review_date: datetime = datetime.now(timezone.utc) + timedelta(
        days=float(days_until_next)
    )
    flashcard.next_review = next_review_date  # type: ignore
    db.commit()
    db.refresh(flashcard)
    return flashcard


# ============================================================================
# ERROR NOTEBOOK ENDPOINTS
# ============================================================================


@router.get("/errors", response_model=List[ErrorNotebookItem])
def get_error_notebook(
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    materia: str = "",
):
    query = (
        db.query(models.UserInteraction, models.Question)
        .join(models.Question, models.UserInteraction.question_id == models.Question.id)
        .filter(
            models.UserInteraction.user_id == current_user.id,
            models.UserInteraction.status == "errou",
        )
    )

    if materia:
        query = query.filter(models.Question.materia == materia)

    results = query.order_by(models.UserInteraction.data.desc()).all()

    errors = []
    for interaction, question in results:
        error_item = ErrorNotebookItem(
            question_id=question.id,
            enunciado=question.enunciado,
            materia=question.materia,
            assunto=question.assunto,
            resposta_correta=question.resposta_correta,
            sua_resposta="N/A",
            explicacao=question.resolucao_base or "Sem explicação disponível",
            data_erro=interaction.data,
        )
        errors.append(error_item)

    return errors


@router.get("/errors/stats")
def get_error_stats(
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    stats = (
        db.query(
            models.Question.materia,
            func.count(models.UserInteraction.id).label("total_erros"),
        )
        .join(models.Question, models.UserInteraction.question_id == models.Question.id)
        .filter(
            models.UserInteraction.user_id == current_user.id,
            models.UserInteraction.status == "errou",
        )
        .group_by(models.Question.materia)
        .all()
    )

    return {"erros_por_materia": {materia: count for materia, count in stats}}


# ============================================================================
# CLINICAL CASES ENDPOINTS
# ============================================================================


@router.get("/cases", response_model=List[ClinicalCase])
def get_clinical_cases(
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    dificuldade: str = "",
):
    # Retorna casos clínicos baseados em questões complexas do banco
    query = db.query(models.Question).filter(
        models.Question.vestibular == "UNIOESTE",
        models.Question.dificuldade.in_(["Média", "Difícil"]),
    )

    if dificuldade:
        query = query.filter(models.Question.dificuldade == dificuldade)

    questions = query.limit(20).all()

    cases = []
    for idx, q in enumerate(questions):
        case = ClinicalCase(
            id=f"CASE-{str(q.id)}",
            titulo=f"Caso Clínico #{idx + 1}: {str(q.assunto)}",
            descricao=str(q.enunciado)[:200] + "...",
            dificuldade=str(q.dificuldade),
            etapas=[
                {
                    "id": 1,
                    "tipo": "diagnostico",
                    "pergunta": str(q.enunciado),
                    "alternativas": q.alternativas
                    if isinstance(q.alternativas, dict)
                    else {},
                    "resposta_correta": str(q.resposta_correta),
                }
            ],
        )
        cases.append(case)

    return cases


@router.get("/cases/{case_id}", response_model=ClinicalCase)
def get_case_detail(
    case_id: str,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    # Extrai ID da questão do case_id (CASE-QUESTION-ID -> QUESTION-ID)
    question_id = case_id.replace("CASE-", "")

    question = (
        db.query(models.Question).filter(models.Question.id == question_id).first()
    )

    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Caso clínico não encontrado"
        )

    # type: ignore[arg-type]
    case = ClinicalCase(
        id=case_id,
        titulo=f"Caso Clínico: {str(question.assunto)}",  # type: ignore[arg-type]
        descricao=str(question.enunciado),  # type: ignore[arg-type]
        dificuldade=str(question.dificuldade),  # type: ignore[arg-type]
        etapas=[
            {
                "id": 1,
                "tipo": "diagnostico",
                "pergunta": str(question.enunciado),
                "alternativas": question.alternativas
                if isinstance(question.alternativas, dict)
                else {},
                "resposta_correta": str(question.resposta_correta),
            }
        ],
    )
    return case


@router.post("/cases/{case_id}/answer")
def submit_case_answer(
    case_id: str,
    answer: CaseAnswer,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    question_id = case_id.replace("CASE-", "")

    question = (
        db.query(models.Question).filter(models.Question.id == question_id).first()
    )

    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Caso clínico não encontrado"
        )

    is_correct = answer.resposta.upper() == question.resposta_correta.upper()

    # Registrar interação do usuário
    interaction = models.UserInteraction(
        user_id=current_user.id,
        question_id=question.id,
        status="acertou" if is_correct else "errou",
        tempo_resposta=0,
    )
    db.add(interaction)
    db.commit()

    return {
        "correto": is_correct,
        "resposta_correta": question.resposta_correta,
        "explicacao": question.resolucao_base or "Sem explicação disponível",
        "proxima_etapa": None,  # Casos de etapa única por enquanto
    }


# ============================================================================
# USER STATS ENDPOINT
# ============================================================================


@router.get("/stats")
def get_user_stats(
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    # Total de questões respondidas
    total_questions = (
        db.query(models.UserInteraction)
        .filter(models.UserInteraction.user_id == current_user.id)
        .count()
    )

    # Acertos
    correct_answers = (
        db.query(models.UserInteraction)
        .filter(
            models.UserInteraction.user_id == current_user.id,
            models.UserInteraction.status == "acertou",
        )
        .count()
    )

    # Flashcards revisados hoje
    today_start = datetime.now(timezone.utc).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    flashcards_reviewed = (
        db.query(models.Flashcard)
        .filter(
            models.Flashcard.user_id == current_user.id,
            models.Flashcard.next_review > today_start,
        )
        .count()
    )

    # Total de flashcards
    total_flashcards = (
        db.query(models.Flashcard)
        .filter(models.Flashcard.user_id == current_user.id)
        .count()
    )

    # Taxa de acerto
    accuracy = (correct_answers / total_questions * 100) if total_questions > 0 else 0

    return {
        "total_questions": total_questions,
        "correct_answers": correct_answers,
        "accuracy": round(accuracy, 1),
        "flashcards_reviewed_today": flashcards_reviewed,
        "total_flashcards": total_flashcards,
        "streak": current_user.streak,
        "study_days": total_questions,  # Simplificação
    }


# ============================================================================
# RAG ENDPOINTS
# ============================================================================


@router.get("/rag/status")
def get_rag_status():
    status = rag_db.get_status()
    return status


@router.post("/rag/ingest")
async def ingest_single_pdf(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        result = rag_db.ingest_document(tmp_path)
        return result
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


@router.post("/rag/ingest-all")
def ingest_all_pdfs(payload: dict = None):
    folder = payload.get("folder") if payload else None
    results = rag_db.ingest_folder(folder)
    return results
