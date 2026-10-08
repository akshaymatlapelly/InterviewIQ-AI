import time
from typing import List, Optional, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field

class SourceType(str, Enum):
    RESUME = "resume"
    JOB_DESCRIPTION = "job_description"
    KNOWLEDGE_BASE = "knowledge_base"
    PERFORMANCE = "performance"

class DocumentMetadata(BaseModel):
    source_type: SourceType
    candidate_id: Optional[str] = None
    document_id: str
    filename: Optional[str] = None
    section: Optional[str] = "main"
    topic: Optional[str] = None
    category: Optional[str] = None
    difficulty: Optional[str] = None
    created_at: float = Field(default_factory=time.time)
    updated_at: float = Field(default_factory=time.time)
    custom_metadata: Dict[str, Any] = Field(default_factory=dict)

class Document(BaseModel):
    id: str
    text: str
    metadata: DocumentMetadata
    hash: Optional[str] = None

class Chunk(BaseModel):
    chunk_id: str
    document_id: str
    source_type: SourceType
    candidate_id: Optional[str] = None
    text: str
    topic: Optional[str] = None
    category: Optional[str] = None
    chunk_index: int = 0
    total_chunks: int = 1
    metadata: Dict[str, Any] = Field(default_factory=dict)

class IngestionRequest(BaseModel):
    candidate_id: Optional[str] = None
    source_type: SourceType
    text: Optional[str] = None
    document_id: Optional[str] = None
    filename: Optional[str] = None
    topic: Optional[str] = None
    category: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

class IngestionResponse(BaseModel):
    status: str
    document_id: str
    source_type: SourceType
    chunks_created: int
    candidate_id: Optional[str] = None
    message: str

class SearchQuery(BaseModel):
    candidate_id: Optional[str] = None
    query: str
    top_k: int = 5
    similarity_threshold: float = 0.25
    sources: Optional[List[SourceType]] = None
    category: Optional[str] = None
    difficulty: Optional[str] = None
    hybrid_weight: float = 0.7  # 0.7 vector + 0.3 keyword

class SearchResult(BaseModel):
    chunk_id: str
    document_id: str
    source_type: SourceType
    candidate_id: Optional[str] = None
    text: str
    score: float
    relevance_rank: int
    topic: Optional[str] = None
    category: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

class ContextBlock(BaseModel):
    source_type: SourceType
    score: float
    content: str
    topic: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

class ContextResponse(BaseModel):
    query: str
    candidate_id: Optional[str] = None
    formatted_context: str
    blocks: List[ContextBlock]
    retrieved_count: int
    processing_time_ms: float

class RAGStatus(BaseModel):
    status: str
    vector_db_connected: bool
    vector_db_backend: str
    embedding_service_status: str
    embedding_model_name: str
    knowledge_base_doc_count: int
    indexed_chunk_count: int
    collections: List[str]
    last_indexing_time: Optional[float] = None
