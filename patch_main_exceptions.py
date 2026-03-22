import re

with open('backend/app/main.py', 'r') as f:
    content = f.read()

exception_handler = """
from fastapi.responses import JSONResponse
from fastapi import Request

@app.exception_handler(RuntimeError)
async def runtime_exception_handler(request: Request, exc: RuntimeError):
    logger.error(f"RuntimeError global capturado: {str(exc)}")
    return JSONResponse(
        status_code=503,
        content={"error": str(exc)},
    )
"""

if "runtime_exception_handler" not in content:
    content = content.replace('app.include_router(router)', exception_handler + '\napp.include_router(router)')
    with open('backend/app/main.py', 'w') as f:
        f.write(content)
