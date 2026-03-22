import re

with open('backend/app/ai_service.py', 'r') as f:
    content = f.read()

import_str = """import os
import google.generativeai as genai
import json
import random
import logging
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from google.api_core.exceptions import GoogleAPIError

logger = logging.getLogger("ai_service")
"""

content = re.sub(
    r'import os\nimport google\.generativeai as genai\nimport json\nimport random',
    import_str,
    content
)

# Replace the direct generate_content and send_message with a retry wrapper
retry_decorator = "@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10), retry=retry_if_exception_type(GoogleAPIError), reraise=True)\n"

# In get_tutor_response:
# `response = chat.send_message(context_prompt)`
content = content.replace("response = chat.send_message(context_prompt)", f"""
    try:
        @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10), retry=retry_if_exception_type(GoogleAPIError), reraise=True)
        def _send():
            return chat.send_message(context_prompt)
        response = _send()
    except Exception as e:
        logger.error(f"Falha critica no Gemini (tutor): {{e}}")
        raise RuntimeError("Serviço de IA indisponível no momento. Tente novamente mais tarde.") from e
""")

def safe_gen(replace_str):
    return f"""
    try:
        @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10), retry=retry_if_exception_type(GoogleAPIError), reraise=True)
        def _gen():
            return model.generate_content(prompt)
        response = _gen()
    except Exception as e:
        logger.error(f"Falha critica no Gemini (generation): {{e}}")
        raise RuntimeError("Serviço de IA indisponível no momento.") from e
"""

content = content.replace("response = model.generate_content(prompt)", safe_gen("response = model.generate_content(prompt)"))

with open('backend/app/ai_service.py', 'w') as f:
    f.write(content)
