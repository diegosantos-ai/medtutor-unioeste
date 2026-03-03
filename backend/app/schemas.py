from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    name: str


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
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

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    name: Optional[str] = None
    daily_hours: Optional[int] = None
    difficulties: Optional[List[str]] = None
    learning_style: Optional[str] = None
    academic_history: Optional[str] = None
    has_onboarded: Optional[bool] = None


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
