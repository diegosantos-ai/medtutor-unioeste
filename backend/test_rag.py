import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

os.environ["PYTHONIOENCODING"] = "utf-8"

from app.rag_service import rag_db
from app.config import BASE_CONHECIMENTO_DIR
import glob

print("=" * 60)
print("RAG Service Test")
print("=" * 60)

print("\n1. Checking RAG status...")
status = rag_db.get_status()
print(f"   Status: {status}")

print("\n2. Listing some PDFs in base_conhecimento...")
pdfs = glob.glob(os.path.join(BASE_CONHECIMENTO_DIR, "**", "*.pdf"), recursive=True)[:5]
for pdf in pdfs:
    print(f"   - {os.path.basename(pdf)}")
print(
    f"   ... total: {len(glob.glob(os.path.join(BASE_CONHECIMENTO_DIR, '**', '*.pdf'), recursive=True))} PDFs"
)

print("\n3. Testing query (without indexed documents)...")
result = rag_db.query_context("o que e fotossintese?", max_results=2)
print(f"   Results: {result['count']} documents found")
print(f"   Context: {result.get('context', 'No context')[:200]}...")

print("\n" + "=" * 60)
print("Test completed!")
print("=" * 60)
