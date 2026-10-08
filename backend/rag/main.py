import logging
import time
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Query, Path, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.rag.config import settings
from backend.rag.schemas.models import (
    SourceType,
    IngestionRequest,
    IngestionResponse,
    SearchQuery,
    SearchResult,
    ContextResponse,
    RAGStatus
)
from backend.rag.ingestion.pipeline import ingestion_pipeline
from backend.rag.storage.vector_store import vector_store
from backend.rag.retrieval.retriever import rag_retriever
from backend.rag.generation.context_builder import context_builder

# Configure Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("rag.main")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Production-Ready RAG Engine for InterviewIQ AI"
)

# Enable CORS for frontend applications
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Startup lifecycle hook: Auto-indexes local Knowledge Base directory."""
    logger.info("Starting InterviewIQ RAG Backend Service...")
    try:
        kb_count = ingestion_pipeline.ingest_knowledge_base_directory("backend/rag/data")
        logger.info(f"Knowledge Base initialized with {kb_count} records.")
    except Exception as e:
        logger.error(f"Failed to auto-index knowledge base on startup: {e}")

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs_url": "/docs"
    }

@app.get("/api/rag/status", response_model=RAGStatus)
def get_rag_status():
    """Returns status telemetry for Vector Database, Embedding model, and Knowledge Base."""
    try:
        return vector_store.get_status()
    except Exception as e:
        logger.error(f"Error fetching RAG status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/rag/ingest", response_model=IngestionResponse)
def ingest_general_document(req: IngestionRequest):
    """General text ingestion endpoint."""
    if not req.text:
        raise HTTPException(status_code=400, detail="Field 'text' is required for ingestion.")
    try:
        return ingestion_pipeline.ingest_text(
            text=req.text,
            source_type=req.source_type,
            candidate_id=req.candidate_id,
            document_id=req.document_id,
            filename=req.filename,
            topic=req.topic,
            category=req.category,
            custom_metadata=req.metadata
        )
    except Exception as e:
        logger.error(f"Ingestion error: {e}")
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(e)}")

@app.post("/api/rag/ingest/resume", response_model=IngestionResponse)
def ingest_resume(req: IngestionRequest):
    """Ingests candidate resume text with candidate_id metadata isolation."""
    if not req.candidate_id:
        raise HTTPException(status_code=400, detail="Field 'candidate_id' is required for candidate resume ingestion.")
    if not req.text:
        raise HTTPException(status_code=400, detail="Field 'text' is required.")
    
    req.source_type = SourceType.RESUME
    req.document_id = req.document_id or f"resume_{req.candidate_id}"
    req.category = req.category or "candidate_resume"
    
    return ingest_general_document(req)

@app.post("/api/rag/ingest/job-description", response_model=IngestionResponse)
def ingest_job_description(req: IngestionRequest):
    """Ingests target job description text for candidate role matching."""
    if not req.candidate_id:
        raise HTTPException(status_code=400, detail="Field 'candidate_id' is required for job description ingestion.")
    if not req.text:
        raise HTTPException(status_code=400, detail="Field 'text' is required.")
    
    req.source_type = SourceType.JOB_DESCRIPTION
    req.document_id = req.document_id or f"jd_{req.candidate_id}"
    req.category = req.category or "job_description"
    
    return ingest_general_document(req)

@app.post("/api/rag/ingest/knowledge-base", response_model=IngestionResponse)
def ingest_knowledge_base_record(req: IngestionRequest):
    """Ingests global InterviewIQ knowledge base item."""
    if not req.text:
        raise HTTPException(status_code=400, detail="Field 'text' is required.")
    
    req.source_type = SourceType.KNOWLEDGE_BASE
    req.candidate_id = None  # Global access
    
    return ingest_general_document(req)

@app.post("/api/rag/ingest/performance", response_model=IngestionResponse)
def ingest_performance_report(req: IngestionRequest):
    """Ingests past candidate interview performance reports."""
    if not req.candidate_id:
        raise HTTPException(status_code=400, detail="Field 'candidate_id' is required for performance report ingestion.")
    if not req.text:
        raise HTTPException(status_code=400, detail="Field 'text' is required.")
    
    req.source_type = SourceType.PERFORMANCE
    req.document_id = req.document_id or f"perf_{req.candidate_id}_{int(time.time())}"
    req.category = req.category or "past_performance"
    
    return ingest_general_document(req)

@app.post("/api/rag/search", response_model=List[SearchResult])
def search_vectors(query: SearchQuery):
    """Performs semantic vector search with candidate data isolation."""
    try:
        return rag_retriever.retrieve(query)
    except Exception as e:
        logger.error(f"Search query error: {e}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@app.post("/api/rag/context", response_model=ContextResponse)
def build_grounded_context(query: SearchQuery):
    """Constructs ranked, formatted context for Gemini prompt injection."""
    try:
        return context_builder.build_context(query)
    except Exception as e:
        logger.error(f"Context builder error: {e}")
        raise HTTPException(status_code=500, detail=f"Context generation failed: {str(e)}")

@app.get("/api/rag/sources")
def get_indexed_sources(candidate_id: Optional[str] = None):
    """Returns metadata summary of indexed documents."""
    sources_map = {}
    for cid, data in vector_store.in_memory_store.items():
        p = data["payload"]
        cand = p.get("candidate_id")
        doc_id = p.get("document_id")
        src_type = p.get("source_type")
        
        # Filter if candidate_id requested
        if candidate_id and src_type != SourceType.KNOWLEDGE_BASE.value and cand != candidate_id:
            continue
            
        if doc_id not in sources_map:
            sources_map[doc_id] = {
                "document_id": doc_id,
                "source_type": src_type,
                "candidate_id": cand,
                "topic": p.get("topic"),
                "category": p.get("category"),
                "chunks_count": 0
            }
        sources_map[doc_id]["chunks_count"] += 1
        
    return list(sources_map.values())

@app.delete("/api/rag/source/{source_id}")
def delete_source(source_id: str, candidate_id: Optional[str] = None):
    """Deletes an indexed source document."""
    success = vector_store.delete_source(source_id, candidate_id=candidate_id)
    if not success:
        raise HTTPException(status_code=444, detail="Source not found or permission denied.")
    return {"status": "deleted", "document_id": source_id}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.rag.main:app", host=settings.HOST, port=settings.API_PORT, reload=True)
