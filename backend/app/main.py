from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator
import logging
from pythonjsonlogger import jsonlogger

from app.database import engine, Base
from app.routes import router

# Setup Structured JSON Logging for Loki/Promtail
logger = logging.getLogger()
logHandler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter(
    '%(asctime)s %(levelname)s %(name)s %(message)s'
)
logHandler.setFormatter(formatter)
logger.addHandler(logHandler)
logger.setLevel(logging.INFO)


# In a real scenario with Alembic, we don't strictly need create_all here,
# but it's good for a quick start if migrations aren't fully set up yet.
# Base.metadata.create_all(bind=engine)


app = FastAPI(title="MedTutor API UNIOESTE", version="1.0.0")

# Setup Prometheus Instrumentation
Instrumentator().instrument(app).expose(app, endpoint="/metrics")


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


from fastapi.responses import JSONResponse
from fastapi import Request

@app.exception_handler(RuntimeError)
async def runtime_exception_handler(request: Request, exc: RuntimeError):
    logger.error(f"RuntimeError global capturado: {str(exc)}")
    return JSONResponse(
        status_code=503,
        content={"error": str(exc)},
    )

app.include_router(router)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "MedTutor API is running securely."}
