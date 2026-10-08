import os
import json
import glob
import logging
import uuid
import re
from typing import List, Dict, Any, Optional
from backend.rag.schemas.models import SourceType, Document, Chunk, IngestionResponse
from backend.rag.embeddings.embedding_service import embedding_service
from backend.rag.storage.vector_store import vector_store
from backend.rag.config import settings

logger = logging.getLogger("rag.ingestion")

class IngestionPipeline:
    """
    Reusable Ingestion Pipeline.
    Handles Text Extraction, Cleaning, Section Detection, Chunking, Metadata Generation, Hashing & Vector Storage.
    """
    def __init__(self, chunk_size: int = settings.CHUNK_SIZE, chunk_overlap: int = settings.CHUNK_OVERLAP):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def clean_text(self, text: str) -> str:
        """Cleans and normalizes raw text."""
        if not text:
            return ""
        # Replace multiple spaces/newlines with single whitespace
        text = re.sub(r'\r\n|\r', '\n', text)
        text = re.sub(r'\n{3,}', '\n\n', text)
        text = re.sub(r'[ \t]+', ' ', text)
        return text.strip()

    def chunk_text(self, text: str) -> List[str]:
        """
        Splits text into semantic chunks respecting sentence boundaries.
        """
        text = self.clean_text(text)
        if not text:
            return []

        if len(text) <= self.chunk_size:
            return [text]

        sentences = re.split(r'(?<=[.!?])\s+', text)
        chunks = []
        current_chunk = []
        current_length = 0

        for sentence in sentences:
            sentence_len = len(sentence)
            if current_length + sentence_len > self.chunk_size and current_chunk:
                chunk_str = " ".join(current_chunk)
                chunks.append(chunk_str)
                
                # Maintain overlap
                overlap_chunk = []
                overlap_len = 0
                for prev_s in reversed(current_chunk):
                    if overlap_len + len(prev_s) <= self.chunk_overlap:
                        overlap_chunk.insert(0, prev_s)
                        overlap_len += len(prev_s)
                    else:
                        break
                current_chunk = overlap_chunk
                current_length = overlap_len

            current_chunk.append(sentence)
            current_length += sentence_len

        if current_chunk:
            chunks.append(" ".join(current_chunk))

        return chunks

    def ingest_text(
        self,
        text: str,
        source_type: SourceType,
        candidate_id: Optional[str] = None,
        document_id: Optional[str] = None,
        filename: Optional[str] = None,
        topic: Optional[str] = None,
        category: Optional[str] = None,
        custom_metadata: Optional[Dict[str, Any]] = None
    ) -> IngestionResponse:
        """
        Ingests a text document into vector storage.
        """
        if not text or not text.strip():
            raise ValueError("Ingestion failed: text content cannot be empty.")

        cleaned_text = self.clean_text(text)
        doc_hash = embedding_service.compute_hash(cleaned_text)
        doc_id = document_id or f"{source_type.value}_{uuid.uuid4().hex[:10]}"

        # Deduplication check
        if vector_store.is_document_indexed(doc_id, doc_hash):
            logger.info(f"Document '{doc_id}' unchanged. Skipping re-embedding.")
            return IngestionResponse(
                status="skipped",
                document_id=doc_id,
                source_type=source_type,
                chunks_created=0,
                candidate_id=candidate_id,
                message="Document unchanged; skipped duplicate ingestion."
            )

        text_chunks = self.chunk_text(cleaned_text)
        total_chunks = len(text_chunks)
        chunks_to_insert: List[Chunk] = []

        for idx, raw_chunk in enumerate(text_chunks):
            chunk_id = f"{doc_id}_chunk_{idx}"
            chunk_obj = Chunk(
                chunk_id=chunk_id,
                document_id=doc_id,
                source_type=source_type,
                candidate_id=candidate_id,
                text=raw_chunk,
                topic=topic,
                category=category,
                chunk_index=idx,
                total_chunks=total_chunks,
                metadata={
                    "filename": filename or "text_input",
                    "doc_hash": doc_hash,
                    **(custom_metadata or {})
                }
            )
            chunks_to_insert.append(chunk_obj)

        # Generate Embeddings
        embeddings = embedding_service.embed_batch([c.text for c in chunks_to_insert])

        # Insert into Vector Store
        vector_store.insert_chunks(chunks_to_insert, embeddings, doc_hash=doc_hash)

        return IngestionResponse(
            status="success",
            document_id=doc_id,
            source_type=source_type,
            chunks_created=total_chunks,
            candidate_id=candidate_id,
            message=f"Successfully ingested {total_chunks} chunks."
        )

    def ingest_knowledge_base_directory(self, data_dir: str = "backend/rag/data") -> int:
        """
        Recursively loads and ingests all JSON/JSONL knowledge base records in data directory.
        """
        if not os.path.exists(data_dir):
            logger.warning(f"Knowledge data directory '{data_dir}' not found.")
            return 0

        # Match both .jsonl and .json files
        kb_files = glob.glob(os.path.join(data_dir, "**", "*.jsonl"), recursive=True) + \
                   glob.glob(os.path.join(data_dir, "**", "*.json"), recursive=True)
        
        # Exclude metadata / manifest files
        kb_files = [f for f in kb_files if not os.path.basename(f).startswith("manifest")]
        total_kb_items = 0

        logger.info(f"Found {len(kb_files)} knowledge base data files in {data_dir}.")

        for filepath in kb_files:
            try:
                items = []
                filename = os.path.basename(filepath)
                file_prefix = os.path.splitext(filename)[0]

                if filepath.endswith(".jsonl"):
                    with open(filepath, "r", encoding="utf-8") as f:
                        for line in f:
                            line = line.strip()
                            if line:
                                items.append(json.loads(line))
                else:
                    with open(filepath, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        if isinstance(data, list):
                            items = data
                        elif isinstance(data, dict):
                            items = [data]

                for item in items:
                    raw_id = item.get("id") or f"kb_{uuid.uuid4().hex[:8]}"
                    # Ensure globally unique doc_id even across files with overlapping raw ids
                    doc_id = f"{file_prefix}_{raw_id}"
                    topic = item.get("topic", "General")
                    category = item.get("category", "technical")
                    difficulty = item.get("difficulty", "intermediate")
                    content = item.get("content", "")

                    if not content:
                        continue

                    # Rich Knowledge Text Combining topic, content, skills, and metadata
                    rich_text = f"Topic: {topic}\nCategory: {category} ({difficulty})\nContent: {content}"
                    if item.get("keywords"):
                        rich_text += f"\nKeywords: {', '.join(item.get('keywords'))}"
                    if item.get("skills"):
                        rich_text += f"\nSkills: {', '.join(item.get('skills'))}"
                    if item.get("interview_relevance"):
                        rich_text += f"\nInterview Relevance: {item.get('interview_relevance')}"
                    if item.get("common_mistakes"):
                        rich_text += f"\nCommon Mistakes: {', '.join(item.get('common_mistakes'))}"
                    if item.get("follow_up_topics"):
                        rich_text += f"\nFollow-up Topics: {', '.join(item.get('follow_up_topics'))}"

                    self.ingest_text(
                        text=rich_text,
                        source_type=SourceType.KNOWLEDGE_BASE,
                        candidate_id=None,  # Knowledge base is globally accessible
                        document_id=doc_id,
                        filename=filename,
                        topic=topic,
                        category=category,
                        custom_metadata={
                            "dataset": "InterviewIQ_RAG_Dataset",
                            "record_id": raw_id,
                            "difficulty": difficulty,
                            "keywords": item.get("keywords", []),
                            "skills": item.get("skills", []),
                            "interview_relevance": item.get("interview_relevance", ""),
                            "common_mistakes": item.get("common_mistakes", []),
                            "follow_up_topics": item.get("follow_up_topics", [])
                        }
                    )
                    total_kb_items += 1
            except Exception as e:
                logger.error(f"Error ingesting knowledge base file '{filepath}': {e}")

        logger.info(f"Completed knowledge base ingestion. Ingested {total_kb_items} knowledge records.")
        return total_kb_items

# Global Ingestion Pipeline Singleton
ingestion_pipeline = IngestionPipeline()
