from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime
import re


class UserBase(BaseModel):
    email: EmailStr
    name: str


class UserCreate(UserBase):
    password: str

    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        if not v or len(v.strip()) < 2:
            raise ValueError('Nome deve ter pelo menos 2 caracteres')
        return v.strip()


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    user_id: str
    email: str
    name: str
    daily_hours: int
    difficulties: List[str]
    learning_style: str
    has_onboarded: bool
    streak: int
    last_study_date: Optional[datetime]
    is_active: bool
    created_at: datetime
    progress_data: Dict[str, Any] = {}
    chat_context: List[Any] = []

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    name: Optional[str] = None
    daily_hours: Optional[int] = None
    difficulties: Optional[List[str]] = None
    learning_style: Optional[str] = None
    academic_history: Optional[str] = None
    has_onboarded: Optional[bool] = None
    progress_data: Optional[Dict[str, Any]] = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[datetime] = None


class FlashcardCreate(BaseModel):
    front: str
    back: str
    topic: str


class FlashcardResponse(BaseModel):
    id: int
    front: str
    back: str
    topic: str
    next_review: datetime
    box: int

    class Config:
        from_attributes = True


class FlashcardReview(BaseModel):
    quality: int


class ErrorNotebookItem(BaseModel):
    question_id: str
    enunciado: str
    materia: str
    assunto: str
    resposta_correta: str
    sua_resposta: str
    explicacao: str
    data_erro: datetime


class ClinicalCase(BaseModel):
    id: str
    titulo: str
    descricao: str
    dificuldade: str
    etapas: List[dict]


class CaseAnswer(BaseModel):
    etapa_id: int
    resposta: str


class ProgressResponse(BaseModel):
    user_id: str
    current_day: int = 1
    total_days: int = 30
    progress_percent: int = 0
    days_completed: int = 0
    days_remaining: int = 30
    accuracy: float = 0.0
    streak: int = 0
    total_flashcards: int = 0
    flashcards_reviewed_today: int = 0
    total_questions: int = 0
    correct_answers: int = 0
    study_sessions_today: int = 0
    hours_studied_today: float = 0.0


class ChatHistoryItem(BaseModel):
    id: int
    role: str
    text: str
    timestamp: datetime
    sources: Optional[List[Any]] = None


class ChatHistoryResponse(BaseModel):
    session_id: str
    messages: List[ChatHistoryItem]
    created_at: datetime
    last_active: datetime


class SubjectProgress(BaseModel):
    id: str
    name: str
    icon: str
    total_questions: int
    answered_questions: int
    correct_answers: int
    accuracy: float
    progress: int


class TrailsResponse(BaseModel):
    subjects: List[SubjectProgress]
    focus_subject: Optional[str] = None
    focus_tip: Optional[str] = None


class QuestionResponse(BaseModel):
    id: str
    subject: str
    topic: str
    difficulty: str
    status: Optional[str] = None
    enunciado: str


class QuestionsResponse(BaseModel):
    questions: List[QuestionResponse]
    total: int
    by_status: Dict[str, int]
