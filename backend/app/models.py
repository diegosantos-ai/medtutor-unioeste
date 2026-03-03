from sqlalchemy import (
    Boolean,
    Column,
    Integer,
    String,
    Text,
    JSON,
    ForeignKey,
    DateTime,
)
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, index=True)
    daily_hours = Column(Integer, default=2)
    difficulties = Column(JSON, default=list)  # e.g. ["Física", "Matemática"]
    learning_style = Column(String, default="visual")
    academic_history = Column(Text, nullable=True)
    has_onboarded = Column(Boolean, default=False)
    streak = Column(Integer, default=0)
    last_study_date = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    study_plans = relationship("StudyPlan", back_populates="user")
    chat_sessions = relationship("ChatSession", back_populates="user")
    flashcards = relationship("Flashcard", back_populates="user")


class StudyPlan(Base):
    __tablename__ = "study_plans"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    week_id = Column(Integer)
    schedule_data = Column(JSON)  # Stores the complex nested days/tasks structure
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="study_plans")


class ChatSession(Base):
    __tablename__ = "chat_sessions"
    id = Column(String, primary_key=True, index=True)  # UUID string
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    last_active = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="chat_sessions")
    messages = relationship("Message", back_populates="session")


class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("chat_sessions.id"))
    role = Column(String)  # 'user' or 'bot'
    text = Column(Text)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    sources = Column(JSON, nullable=True)

    session = relationship("ChatSession", back_populates="messages")


class Quiz(Base):
    __tablename__ = "quizzes"
    id = Column(String, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    topic = Column(String)
    score = Column(Integer)
    total = Column(Integer)
    date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    questions_data = Column(JSON)  # The generated questions and answers


class Flashcard(Base):
    __tablename__ = "flashcards"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    front = Column(Text)
    back = Column(Text)
    topic = Column(String)
    next_review = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    box = Column(Integer, default=0)  # SRS Box (Leitner System concept)

    user = relationship("User", back_populates="flashcards")


class Question(Base):
    __tablename__ = "questions"
    id = Column(String, primary_key=True, index=True)  # e.g. "BIO-001"
    vestibular = Column(String, index=True)
    ano = Column(Integer)
    materia = Column(String, index=True)
    assunto = Column(String, index=True)
    sub_assunto = Column(String)
    dificuldade = Column(String)
    enunciado = Column(Text)
    alternativas = Column(JSON)  # e.g. {"a": "...", "b": "..."}
    resposta_correta = Column(String)
    resolucao_base = Column(Text)
    tags_medicina = Column(JSON)

    interactions = relationship("UserInteraction", back_populates="question")


class UserInteraction(Base):
    __tablename__ = "user_interactions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    question_id = Column(String, ForeignKey("questions.id"))
    status = Column(String)  # 'acertou' or 'errou'
    tempo_resposta = Column(Integer)
    data = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User")
    question = relationship("Question", back_populates="interactions")
