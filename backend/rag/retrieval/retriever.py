import logging
import re
from typing import List, Optional
from backend.rag.schemas.models import SourceType, SearchQuery, SearchResult
from backend.rag.embeddings.embedding_service import embedding_service
from backend.rag.storage.vector_store import vector_store
from backend.rag.config import settings

logger = logging.getLogger("rag.retrieval")

class RAGRetriever:
    """
    Semantic & Hybrid Retrieval Engine.
    Combines vector similarity search with technical keyword matching and candidate data isolation.
    """
    def __init__(self):
        pass

    def retrieve(self, query: SearchQuery) -> List[SearchResult]:
        """
        Executes hybrid semantic vector search with candidate data isolation.
        """
        if not query.query or not query.query.strip():
            return []

        # 1. Embed Query
        query_vector = embedding_service.embed_text(query.query)

        # 2. Perform Vector Search with Isolation Filtering
        raw_results = vector_store.search(
            query_vector=query_vector,
            candidate_id=query.candidate_id,
            top_k=query.top_k * 2,  # Fetch additional candidates for hybrid re-ranking
            sources=query.sources,
            similarity_threshold=query.similarity_threshold,
            category=query.category,
            difficulty=query.difficulty
        )

        if not raw_results:
            return []

        # 3. Hybrid Re-ranking: Boost score if exact technical keywords match
        keywords = set(re.findall(r'\b\w{3,}\b', query.query.lower()))
        hybrid_results = []

        for res in raw_results:
            text_lower = res.text.lower()
            keyword_matches = sum(1 for kw in keywords if kw in text_lower)
            keyword_score = min(1.0, keyword_matches / max(1, len(keywords)))
            
            # Hybrid Score formula: 0.7 * vector_score + 0.3 * keyword_score
            hybrid_score = round(query.hybrid_weight * res.score + (1.0 - query.hybrid_weight) * keyword_score, 4)
            
            res.score = hybrid_score
            hybrid_results.append(res)

        # 4. Sort by final hybrid score descending
        hybrid_results.sort(key=lambda x: x.score, reverse=True)

        # Re-assign rank indices
        final_results = []
        for rank, res in enumerate(hybrid_results[:query.top_k], start=1):
            res.relevance_rank = rank
            final_results.append(res)

        logger.info(f"Retrieved {len(final_results)} items for query: '{query.query[:40]}...' (Candidate ID: {query.candidate_id})")
        return final_results

# Global Retriever Singleton
rag_retriever = RAGRetriever()
