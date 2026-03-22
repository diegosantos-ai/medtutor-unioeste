import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROMA_DIR = os.path.join(BASE_DIR, "app", "chroma_data")
CHROMA_URL = os.environ.get("CHROMA_URL")
BASE_CONHECIMENTO_DIR = os.path.join(BASE_DIR, "..", "base_conhecimento")

CHROMA_COLLECTION_NAME = "medtutor_docs"

CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200

EMBEDDING_MODEL = "gemini-embedding-001"
