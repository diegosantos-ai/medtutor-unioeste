"""
Custom embeddings using OpenRouter API with NVIDIA models.
"""
import os
import requests
import numpy as np
from typing import List, Optional
from langchain_core.embeddings import Embeddings


class OpenRouterEmbeddings(Embeddings):
    """Custom embeddings class for OpenRouter API with NVIDIA models."""

    def __init__(
        self,
        model: str = "nvidia/llama-nemotron-embed-vl-1b-v2:free",
        api_key: Optional[str] = None,
        base_url: str = "https://openrouter.ai/api/v1",
        truncate: str = "END",
        batch_size: int = 10,
    ):
        self.model = model
        self.api_key = api_key or os.environ.get("OPENROUTER_API_KEY", "")
        self.base_url = base_url
        self.truncate = truncate
        self.batch_size = batch_size

        if not self.api_key:
            raise ValueError("OPENROUTER_API_KEY is required")

    def _embed_text(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for a batch of texts."""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        
        data = {
            "model": self.model,
            "input": texts,
            "truncate": self.truncate,
        }

        response = requests.post(
            f"{self.base_url}/embeddings",
            headers=headers,
            json=data,
            timeout=60,
        )
        
        if response.status_code != 200:
            raise ValueError(f"OpenRouter API error: {response.status_code} - {response.text}")
        
        result = response.json()
        return [item["embedding"] for item in result["data"]]

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Embed a list of texts."""
        results = []
        for i in range(0, len(texts), self.batch_size):
            batch = texts[i : i + self.batch_size]
            results.extend(self._embed_text(batch))
        return results

    def embed_query(self, text: str) -> List[float]:
        """Embed a single text."""
        return self._embed_text([text])[0]
