import logging
import os
import glob
from typing import Any, Dict

import chromadb
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.vectorstores import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.config import (
    CHROMA_DIR,
    CHROMA_URL,
    CHROMA_COLLECTION_NAME,
    CHUNK_SIZE,
    CHUNK_OVERLAP,
    BASE_CONHECIMENTO_DIR,
)
from app.openrouter_embeddings import OpenRouterEmbeddings

load_dotenv()

os.makedirs(CHROMA_DIR, exist_ok=True)
logger = logging.getLogger(__name__)


class RAGService:
    def __init__(self):
        self.embeddings = None
        self.vectorstore = None
        self._init_embeddings()
        self._load_vectorstore()

    def _init_embeddings(self):
        # Try OpenRouter first (NVIDIA embeddings)
        api_key = os.environ.get("OPENROUTER_API_KEY")
        if api_key:
            try:
                self.embeddings = OpenRouterEmbeddings(
                    model="nvidia/llama-nemotron-embed-vl-1b-v2:free",
                    api_key=api_key,
                )
                logger.info("Using OpenRouter NVIDIA embeddings")
                return
            except Exception as e:
                logger.warning(f"Failed to init OpenRouter embeddings: {e}")

        # Fallback to Gemini if OpenRouter not configured
        try:
            from langchain_google_genai import GoogleGenerativeAIEmbeddings
            gemini_key = os.environ.get("GEMINI_API_KEY")
            if gemini_key:
                self.embeddings = GoogleGenerativeAIEmbeddings(
                    model="gemini-embedding-001",
                    google_api_key=gemini_key,
                )
                logger.info("Using Gemini embeddings as fallback")
                return
        except Exception as e:
            logger.warning(f"Failed to init Gemini embeddings: {e}")

        logger.warning("No embeddings configured. RAG will be disabled.")

    def _load_vectorstore(self):
        if self.embeddings is None:
            return
        if True:
            try:
                if CHROMA_URL:
                    client = chromadb.HttpClient(
                        host=CHROMA_URL.split("//")[-1].split(":")[0],
                        port=int(CHROMA_URL.split(":")[-1]),
                    )
                    self.vectorstore = Chroma(
                        client=client,
                        embedding_function=self.embeddings,
                        collection_name=CHROMA_COLLECTION_NAME,
                    )
                else:
                    self.vectorstore = Chroma(
                        persist_directory=CHROMA_DIR,
                        embedding_function=self.embeddings,
                        collection_name=CHROMA_COLLECTION_NAME,
                    )
                logger.info(
                    "Vectorstore loaded",
                    extra={"documents": self.vectorstore._collection.count()},
                )
            except Exception as e:
                logger.exception(
                    "Error loading vectorstore",
                    extra={"error": str(e)},
                )
                self.vectorstore = None

    def _create_vectorstore(self):
        if self.embeddings is None:
            raise RuntimeError("RAG embeddings unavailable. Configure GEMINI_API_KEY.")
        if CHROMA_URL:
            client = chromadb.HttpClient(
                host=CHROMA_URL.split("//")[-1].split(":")[0],
                port=int(CHROMA_URL.split(":")[-1]),
            )
            self.vectorstore = Chroma(
                client=client,
                embedding_function=self.embeddings,
                collection_name=CHROMA_COLLECTION_NAME,
            )
        else:
            self.vectorstore = Chroma(
                persist_directory=CHROMA_DIR,
                embedding_function=self.embeddings,
                collection_name=CHROMA_COLLECTION_NAME,
            )

    def ingest_document(
        self, file_path: str, context_metadata: dict = None
    ) -> Dict[str, Any]:
        if self.embeddings is None:
            return {"success": False, "error": "GEMINI_API_KEY not configured"}

        if not os.path.exists(file_path):
            return {"success": False, "error": "File not found"}

        try:
            loader = PyPDFLoader(file_path)
            documents = loader.load()

            if not documents:
                return {"success": False, "error": "No content extracted from PDF"}

            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=CHUNK_SIZE,
                chunk_overlap=CHUNK_OVERLAP,
                length_function=len,
            )

            chunks = text_splitter.split_documents(documents)

            for i, chunk in enumerate(chunks):
                chunk.metadata["source"] = os.path.basename(file_path)
                chunk.metadata["chunk_id"] = i
                if context_metadata:
                    chunk.metadata.update(context_metadata)

            if self.vectorstore is None:
                self._create_vectorstore()

            self.vectorstore.add_documents(chunks)

            return {
                "success": True,
                "file": os.path.basename(file_path),
                "chunks": len(chunks),
                "status": "indexed",
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "file": os.path.basename(file_path),
            }

    def query_context(self, question: str, max_results: int = 3) -> Dict[str, Any]:
        if self.embeddings is None:
            return {
                "context": "",
                "sources": [],
                "count": 0,
                "error": "GEMINI_API_KEY not configured",
            }

        if self.vectorstore is None:
            self._load_vectorstore()

        if self.vectorstore is None:
            return {"context": "", "sources": [], "count": 0}

        try:
            docs = self.vectorstore.similarity_search(question, k=max_results)

            context = "\n\n".join([doc.page_content for doc in docs])
            sources = [
                {
                    "title": doc.metadata.get("source", "Unknown"),
                    "chunk_id": doc.metadata.get("chunk_id", 0),
                }
                for doc in docs
            ]

            return {"context": context, "sources": sources, "count": len(docs)}

        except Exception as e:
            logger.exception("Query error", extra={"error": str(e)})
            return {"context": "", "sources": [], "count": 0, "error": str(e)}

    def ingest_folder(self, folder_path: str = None) -> Dict[str, Any]:
        if self.embeddings is None:
            return {
                "total": 0,
                "success": 0,
                "failed": 0,
                "files": [],
                "error": "GEMINI_API_KEY not configured",
            }

        if folder_path is None:
            folder_path = BASE_CONHECIMENTO_DIR

        pdf_files = glob.glob(os.path.join(folder_path, "**", "*.pdf"), recursive=True)

        results = {"total": len(pdf_files), "success": 0, "failed": 0, "files": []}

        for pdf_file in pdf_files:
            result = self.ingest_document(pdf_file)
            if result.get("success"):
                results["success"] += 1
            else:
                results["failed"] += 1

            results["files"].append(
                {
                    "file": os.path.basename(pdf_file),
                    "status": "success" if result.get("success") else "failed",
                    "error": result.get("error", ""),
                }
            )

        return results

    def get_status(self) -> Dict[str, Any]:
        if self.embeddings is None:
            return {
                "initialized": False,
                "documents": 0,
                "chroma_dir": CHROMA_DIR,
                "error": "GEMINI_API_KEY not configured",
            }

        if self.vectorstore is None:
            self._load_vectorstore()

        if self.vectorstore is None:
            return {"initialized": False, "documents": 0, "chroma_dir": CHROMA_DIR}

        return {
            "initialized": True,
            "documents": self.vectorstore._collection.count(),
            "chroma_dir": CHROMA_DIR,
        }


rag_db = RAGService()
