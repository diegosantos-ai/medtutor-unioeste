from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import router

# In a real scenario with Alembic, we don't strictly need create_all here, 
# but it's good for a quick start if migrations aren't fully set up yet.
# Base.metadata.create_all(bind=engine)

app = FastAPI(title="MedTutor API UNIOESTE", version="1.0.0")

# Configure CORS to allow the Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "https://medtutor-unioeste.vercel.app",
        "https://medtutor-unioeste-santosdiegoj86-6571s-projects.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "MedTutor API is running securely."}
