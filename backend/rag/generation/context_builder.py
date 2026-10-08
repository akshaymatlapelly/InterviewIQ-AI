import time
import logging
from typing import List, Optional
from backend.rag.schemas.models import SearchQuery, SearchResult, ContextResponse, ContextBlock
from backend.rag.retrieval.retriever import rag_retriever

logger = logging.getLogger("rag.context_builder")

class ContextBuilder:
    """
    Context-Building Layer.
    Ranks, deduplicates, filters, and formats retrieved blocks into a compact, grounded prompt context for Gemini AI.
    """
    def __init__(self):
        pass

    def build_context(self, query: SearchQuery) -> ContextResponse:
        """
        Executes retrieval and constructs a clean, inspectable context payload.
        """
        start_time = time.time()
        
        # 1. Retrieve Candidate Blocks
        retrieved_results: List[SearchResult] = rag_retriever.retrieve(query)

        if not retrieved_results:
            return ContextResponse(
                query=query.query,
                candidate_id=query.candidate_id,
                formatted_context="No relevant context retrieved.",
                blocks=[],
                retrieved_count=0,
                processing_time_ms=round((time.time() - start_time) * 1000, 2)
            )

        # 2. Deduplicate & Format Context Blocks
        seen_texts = set()
        blocks: List[ContextBlock] = []
        formatted_parts: List[str] = ["=== RETRIEVED GROUNDED CONTEXT ==="]

        for res in retrieved_results:
            text_snippet = res.text.strip()
            # Basic text deduplication check
            text_key = text_snippet[:100].lower()
            if text_key in seen_texts:
                continue
            seen_texts.add(text_key)

            block = ContextBlock(
                source_type=res.source_type,
                score=res.score,
                content=text_snippet,
                topic=res.topic,
                metadata=res.metadata
            )
            blocks.append(block)

            source_label = res.source_type.value.upper() if hasattr(res.source_type, 'value') else str(res.source_type).upper()
            topic_str = f" | TOPIC: {res.topic}" if res.topic else ""
            formatted_parts.append(
                f"[{source_label}{topic_str} | RELEVANCE SCORE: {res.score:.2f}]\n{text_snippet}\n"
            )

        formatted_parts.append("===================================")
        formatted_context = "\n".join(formatted_parts)
        processing_time = round((time.time() - start_time) * 1000, 2)

        return ContextResponse(
            query=query.query,
            candidate_id=query.candidate_id,
            formatted_context=formatted_context,
            blocks=blocks,
            retrieved_count=len(blocks),
            processing_time_ms=processing_time
        )

# Global Context Builder Singleton
context_builder = ContextBuilder()
