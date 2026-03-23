import logging
from logging.config import dictConfig

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from prometheus_fastapi_instrumentator import Instrumentator
from pythonjsonlogger import jsonlogger

dictConfig(
    {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "json": {
                "()": jsonlogger.JsonFormatter,
                "fmt": "%(asctime)s %(levelname)s %(name)s %(module)s %(message)s",
            }
        },
        "handlers": {
            "default": {
                "class": "logging.StreamHandler",
                "formatter": "json",
                "stream": "ext://sys.stdout",
            }
        },
        "root": {
            "level": "INFO",
            "handlers": ["default"],
        },
        "loggers": {
            "uvicorn": {
                "level": "INFO",
                "handlers": ["default"],
                "propagate": False,
            },
            "uvicorn.error": {
                "level": "INFO",
                "handlers": ["default"],
                "propagate": False,
            },
            "uvicorn.access": {
                "level": "INFO",
                "handlers": ["default"],
                "propagate": False,
            },
        },
    }
)

logger = logging.getLogger(__name__)


def create_app() -> FastAPI:
    from app.routes import router

    # In a real scenario with Alembic, we don't strictly need create_all here,
    # but it's good for a quick start if migrations aren't fully set up yet.
    # Base.metadata.create_all(bind=engine)
    app = FastAPI(title="MedTutor API UNIOESTE", version="1.0.0")

    # Setup Prometheus instrumentation early so the endpoint is always exposed.
    Instrumentator().instrument(app).expose(app, endpoint="/metrics")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:5173",
            "http://localhost:5174",
            "http://127.0.0.1:5173",
            "https://medtutor-unioeste.vercel.app",
            "https://medtutor-unioeste-santosdiegoj86-6571s-projects.vercel.app",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(RuntimeError)
    async def runtime_exception_handler(request: Request, exc: RuntimeError):
        logger.error(
            "RuntimeError global capturado",
            extra={
                "path": str(request.url.path),
                "method": request.method,
                "error": str(exc),
            },
        )
        return JSONResponse(
            status_code=503,
            content={"error": str(exc)},
        )

    @app.get("/api/health")
    def health_check():
        return {"status": "ok", "message": "MedTutor API is running securely."}

    app.include_router(router)
    return app


app = create_app()
