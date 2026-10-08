import os
from dotenv import load_dotenv

# Load environment variables from .env file if available
load_dotenv()

class RAGSettings:
    PROJECT_NAME: str = "InterviewIQ AI - RAG Service"
    VERSION: str = "2.0.0"
    API_PORT: int = int(os.getenv("PORT", 8000))
    HOST: str = os.getenv("HOST", "0.0.0.0")

    # Embedding Configurations
    EMBEDDING_MODEL_NAME: str = os.getenv("EMBEDDING_MODEL_NAME", "sentence-transformers/all-MiniLM-L6-v2")
    EMBEDDING_DIMENSION: int = int(os.getenv("EMBEDDING_DIMENSION", 384))

    # Vector Store Configurations
    QDRANT_URL: str = os.getenv("QDRANT_URL", "")
    QDRANT_API_KEY: str = os.getenv("QDRANT_API_KEY", "")
    RAG_COLLECTION_NAME: str = os.getenv("RAG_COLLECTION_NAME", "interviewiq_vectors")

    # Chunking & Retrieval Parameters
    CHUNK_SIZE: int = int(os.getenv("CHUNK_SIZE", 500))
    CHUNK_OVERLAP: int = int(os.getenv("CHUNK_OVERLAP", 50))
    TOP_K_RESULTS: int = int(os.getenv("TOP_K_RESULTS", 5))
    SIMILARITY_THRESHOLD: float = float(os.getenv("SIMILARITY_THRESHOLD", 0.25))

    # Gemini API Key
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", os.getenv("GOOGLE_API_KEY", ""))

    # Allowed CORS Origins
    ALLOWED_ORIGINS: list = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*"
    ]

settings = RAGSettings()
