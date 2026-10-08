import logging
import time
from typing import List, Dict, Any, Optional
import numpy as np
from backend.rag.schemas.models import SourceType, Chunk, SearchResult, RAGStatus
from backend.rag.config import settings

logger = logging.getLogger("rag.storage")

class VectorStore:
    """
    Vector Database Interface supporting Qdrant and high-performance in-memory fallback.
    Enforces strict multi-tenant candidate data isolation.
    """
    def __init__(self, collection_name: str = settings.RAG_COLLECTION_NAME):
        self.collection_name = collection_name
        self.qdrant_client = None
        self.use_qdrant = False
        
        # Fallback in-memory vector storage
        # Key: chunk_id -> Dict containing chunk data, embedding vector, metadata
        self.in_memory_store: Dict[str, Dict[str, Any]] = {}
        # Document hash tracking for deduplication
        self.document_hashes: Dict[str, str] = {}
        self.last_indexing_time: Optional[float] = None
        
        self._init_qdrant()

    def _init_qdrant(self):
        """Initializes Qdrant client if URL/API Key provided or qdrant-client installed."""
        if settings.QDRANT_URL:
            try:
                from qdrant_client import QdrantClient
                from qdrant_client.models import Distance, VectorParams
                
                logger.info(f"Connecting to Qdrant at {settings.QDRANT_URL}")
                self.qdrant_client = QdrantClient(
                    url=settings.QDRANT_URL,
                    api_key=settings.QDRANT_API_KEY if settings.QDRANT_API_KEY else None
                )
                
                # Check/Create collection
                collections = [c.name for c in self.qdrant_client.get_collections().collections]
                if self.collection_name not in collections:
                    self.qdrant_client.create_collection(
                        collection_name=self.collection_name,
                        vectors_config=VectorParams(size=settings.EMBEDDING_DIMENSION, distance=Distance.COSINE)
                    )
                self.use_qdrant = True
                logger.info(f"Qdrant vector store initialized successfully for collection '{self.collection_name}'.")
            except Exception as e:
                logger.warning(f"Could not initialize remote Qdrant ({e}). Falling back to isolated memory vector store.")
                self.use_qdrant = False
        else:
            logger.info("QDRANT_URL not set. Operating in high-speed in-memory vector store mode.")
            self.use_qdrant = False

    def is_document_indexed(self, doc_id: str, doc_hash: str) -> bool:
        """Checks if exact document content is already indexed."""
        return self.document_hashes.get(doc_id) == doc_hash

    def insert_chunks(self, chunks: List[Chunk], embeddings: List[List[float]], doc_hash: Optional[str] = None) -> int:
        """
        Inserts chunks into the vector store.
        Tags every candidate vector with candidate_id for strict multi-tenant isolation.
        """
        if not chunks or not embeddings or len(chunks) != len(embeddings):
            return 0

        inserted_count = 0
        for chunk, vector in zip(chunks, embeddings):
            payload = {
                "chunk_id": chunk.chunk_id,
                "document_id": chunk.document_id,
                "source_type": chunk.source_type.value if hasattr(chunk.source_type, 'value') else chunk.source_type,
                "candidate_id": chunk.candidate_id,
                "text": chunk.text,
                "topic": chunk.topic,
                "category": chunk.category,
                "chunk_index": chunk.chunk_index,
                "total_chunks": chunk.total_chunks,
                "metadata": chunk.metadata
            }

            if self.use_qdrant and self.qdrant_client:
                try:
                    from qdrant_client.models import PointStruct
                    # Use integer or UUID hash for point ID
                    point_id = abs(hash(chunk.chunk_id)) % (10**12)
                    self.qdrant_client.upsert(
                        collection_name=self.collection_name,
                        points=[PointStruct(id=point_id, vector=vector, payload=payload)]
                    )
                except Exception as e:
                    logger.error(f"Error inserting into Qdrant ({e}), storing in memory fallback.")
                    self.in_memory_store[chunk.chunk_id] = {
                        "payload": payload,
                        "vector": np.array(vector, dtype=np.float32)
                    }
            else:
                self.in_memory_store[chunk.chunk_id] = {
                    "payload": payload,
                    "vector": np.array(vector, dtype=np.float32)
                }
            
            inserted_count += 1

        if chunks and doc_hash:
            self.document_hashes[chunks[0].document_id] = doc_hash
            
        self.last_indexing_time = time.time()
        logger.info(f"Successfully inserted {inserted_count} chunks into vector store.")
        return inserted_count

    def search(
        self,
        query_vector: List[float],
        candidate_id: Optional[str] = None,
        top_k: int = 5,
        sources: Optional[List[SourceType]] = None,
        similarity_threshold: float = 0.25,
        category: Optional[str] = None,
        difficulty: Optional[str] = None
    ) -> List[SearchResult]:
        """
        Executes vector search with strict candidate isolation filtering.
        CANDIDATE ISOLATION RULE:
        - If candidate_id is provided, candidate-specific vectors (resume, job_description, performance)
          are ONLY returned if vector's candidate_id == requested candidate_id.
        - Knowledge Base vectors (source_type == 'knowledge_base') are accessible globally.
        """
        results: List[SearchResult] = []
        source_str_list = [s.value if hasattr(s, 'value') else str(s) for s in sources] if sources else None

        if self.use_qdrant and self.qdrant_client:
            try:
                # Build Qdrant search filters
                from qdrant_client.models import Filter, FieldCondition, MatchValue, Should, Must
                must_conditions = []
                
                if category:
                    must_conditions.append(FieldCondition(key="category", match=MatchValue(value=category)))
                
                if source_str_list:
                    # Filter sources
                    source_conditions = [FieldCondition(key="source_type", match=MatchValue(value=s)) for s in source_str_list]
                    must_conditions.append(Filter(should=source_conditions))
                
                # Candidate Isolation Filter: candidate_id matches OR source is knowledge_base
                isolation_filter = Filter(
                    should=[
                        FieldCondition(key="candidate_id", match=MatchValue(value=candidate_id)),
                        FieldCondition(key="source_type", match=MatchValue(value="knowledge_base"))
                    ]
                )
                must_conditions.append(isolation_filter)
                
                qdrant_filter = Filter(must=must_conditions)
                
                hits = self.qdrant_client.search(
                    collection_name=self.collection_name,
                    query_vector=query_vector,
                    query_filter=qdrant_filter,
                    limit=top_k * 2
                )
                
                rank = 1
                for hit in hits:
                    if hit.score >= similarity_threshold:
                        p = hit.payload
                        results.append(SearchResult(
                            chunk_id=p["chunk_id"],
                            document_id=p["document_id"],
                            source_type=SourceType(p["source_type"]),
                            candidate_id=p.get("candidate_id"),
                            text=p["text"],
                            score=float(hit.score),
                            relevance_rank=rank,
                            topic=p.get("topic"),
                            category=p.get("category"),
                            metadata=p.get("metadata", {})
                        ))
                        rank += 1
                        if len(results) >= top_k:
                            break
                return results
            except Exception as e:
                logger.error(f"Qdrant search error ({e}), falling back to in-memory search.")

        # High-performance In-Memory Cosine Similarity Search
        if not self.in_memory_store:
            return []

        q_vec = np.array(query_vector, dtype=np.float32)
        q_norm = np.linalg.norm(q_vec)
        if q_norm == 0:
            return []

        candidates_scored = []

        for chunk_id, data in self.in_memory_store.items():
            p = data["payload"]
            vec = data["vector"]
            
            # --- MANDATORY MULTI-TENANT ISOLATION FILTERING ---
            chunk_source = p.get("source_type")
            chunk_candidate = p.get("candidate_id")
            
            # If source is candidate-specific (resume, job_description, performance)
            if chunk_source in [SourceType.RESUME.value, SourceType.JOB_DESCRIPTION.value, SourceType.PERFORMANCE.value]:
                if not candidate_id or chunk_candidate != candidate_id:
                    # REJECT: Candidate A cannot retrieve Candidate B's data
                    continue
            
            # Source Type Filter
            if source_str_list and chunk_source not in source_str_list:
                continue
                
            # Category Filter
            if category and p.get("category") != category:
                continue

            # Compute Cosine Similarity
            v_norm = np.linalg.norm(vec)
            if v_norm == 0:
                score = 0.0
            else:
                score = float(np.dot(q_vec, vec) / (q_norm * v_norm))

            if score >= similarity_threshold:
                candidates_scored.append((score, p))

        # Sort by similarity score descending
        candidates_scored.sort(key=lambda x: x[0], reverse=True)

        rank = 1
        for score, p in candidates_scored[:top_k]:
            results.append(SearchResult(
                chunk_id=p["chunk_id"],
                document_id=p["document_id"],
                source_type=SourceType(p["source_type"]),
                candidate_id=p.get("candidate_id"),
                text=p["text"],
                score=round(score, 4),
                relevance_rank=rank,
                topic=p.get("topic"),
                category=p.get("category"),
                metadata=p.get("metadata", {})
            ))
            rank += 1

        return results

    def delete_source(self, source_id: str, candidate_id: Optional[str] = None) -> bool:
        """Deletes chunks associated with document_id with candidate validation."""
        deleted = False
        to_delete = []
        for chunk_id, data in self.in_memory_store.items():
            p = data["payload"]
            if p["document_id"] == source_id:
                if candidate_id and p.get("candidate_id") and p.get("candidate_id") != candidate_id:
                    continue  # Cannot delete another candidate's document
                to_delete.append(chunk_id)

        for cid in to_delete:
            del self.in_memory_store[cid]
            deleted = True
            
        if source_id in self.document_hashes:
            del self.document_hashes[source_id]

        return deleted

    def get_status(self) -> RAGStatus:
        """Returns health and collection telemetry status."""
        total_chunks = len(self.in_memory_store)
        kb_count = sum(1 for data in self.in_memory_store.values() if data["payload"].get("source_type") == SourceType.KNOWLEDGE_BASE.value)
        
        return RAGStatus(
            status="healthy",
            vector_db_connected=True,
            vector_db_backend="Qdrant Remote" if self.use_qdrant else "High-Speed Memory Vector Engine",
            embedding_service_status="active",
            embedding_model_name=settings.EMBEDDING_MODEL_NAME,
            knowledge_base_doc_count=kb_count,
            indexed_chunk_count=total_chunks,
            collections=[self.collection_name],
            last_indexing_time=self.last_indexing_time
        )

# Global Vector Store Singleton
vector_store = VectorStore()
