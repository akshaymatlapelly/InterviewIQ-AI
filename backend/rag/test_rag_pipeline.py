import sys
import os
import time
import unittest
import logging

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.rag.schemas.models import (
    SourceType,
    IngestionRequest,
    SearchQuery,
    SearchResult,
    ContextResponse
)
from backend.rag.embeddings.embedding_service import embedding_service
from backend.rag.storage.vector_store import vector_store
from backend.rag.ingestion.pipeline import ingestion_pipeline
from backend.rag.retrieval.retriever import rag_retriever
from backend.rag.generation.context_builder import context_builder

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("rag.test")

class TestRAGPipeline(unittest.TestCase):
    """
    Comprehensive End-to-End Test Suite for InterviewIQ RAG Engine.
    Verifies all 11 required pipeline criteria including candidate isolation.
    """

    @classmethod
    def setUpClass(cls):
        logger.info("Initializing RAG Test Suite...")
        # Clear vector store for clean test run
        vector_store.in_memory_store.clear()
        vector_store.document_hashes.clear()
        
        # Ingest local knowledge base data
        ingestion_pipeline.ingest_knowledge_base_directory("backend/rag/data")

    def test_01_text_cleaning(self):
        """Test 1: Text extraction and cleaning."""
        raw_text = "  React   Hooks\n\n\n\r\nuseEffect  and   useState.  "
        cleaned = ingestion_pipeline.clean_text(raw_text)
        self.assertEqual(cleaned, "React Hooks\n\nuseEffect and useState.")
        logger.info("Test 1 Passed: Text cleaning normalizes whitespace.")

    def test_02_chunking_and_overlap(self):
        """Test 2: Semantic chunking with overlap."""
        sample_text = "First sentence about React DOM. Second sentence about state management. Third sentence about Virtual DOM rendering reconciliation algorithms."
        chunks = ingestion_pipeline.chunk_text(sample_text)
        self.assertGreater(len(chunks), 0)
        self.assertTrue(any("Virtual DOM" in c for c in chunks))
        logger.info(f"Test 2 Passed: Created {len(chunks)} semantic chunks.")

    def test_03_metadata_creation(self):
        """Test 3: Metadata generation and tagging."""
        res = ingestion_pipeline.ingest_text(
            text="Candidate John Doe has 5 years experience with React, Redux, Node.js, and System Design.",
            source_type=SourceType.RESUME,
            candidate_id="cand_alex_101",
            document_id="res_alex_101",
            filename="alex_resume.pdf",
            topic="Resume",
            category="candidate_resume"
        )
        self.assertEqual(res.status, "success")
        self.assertEqual(res.candidate_id, "cand_alex_101")
        logger.info("Test 3 Passed: Document metadata created successfully.")

    def test_04_embedding_generation(self):
        """Test 4: Real embedding vector generation."""
        vec = embedding_service.embed_text("React Virtual DOM reconciliation algorithm")
        self.assertIsInstance(vec, list)
        self.assertGreater(len(vec), 0)
        self.assertNotEqual(vec, [0.0] * len(vec))
        logger.info(f"Test 4 Passed: Embedded vector dimension = {len(vec)}.")

    def test_05_vector_insertion(self):
        """Test 5: Vector insertion into vector store."""
        status = vector_store.get_status()
        self.assertGreater(status.indexed_chunk_count, 0)
        logger.info(f"Test 5 Passed: Vector store contains {status.indexed_chunk_count} indexed chunks.")

    def test_06_semantic_and_hybrid_retrieval(self):
        """Test 6: Semantic vector search + keyword hybrid ranking."""
        query = SearchQuery(
            query="Virtual DOM Reconciliation diffing algorithm",
            top_k=3,
            sources=[SourceType.KNOWLEDGE_BASE]
        )
        results = rag_retriever.retrieve(query)
        self.assertGreater(len(results), 0)
        self.assertTrue(any("Virtual DOM" in r.text or "DOM" in r.text for r in results))
        logger.info(f"Test 6 Passed: Top result score = {results[0].score:.4f}.")

    def test_07_multi_tenant_candidate_isolation(self):
        """
        Test 7: CRITICAL MULTI-TENANT CANDIDATE DATA ISOLATION.
        Verifies Candidate A CANNOT retrieve Candidate B's private resume or performance data!
        """
        # Ingest Candidate A Resume
        ingestion_pipeline.ingest_text(
            text="Candidate A secret projects: Secret Project Alpha with Micro-frontends.",
            source_type=SourceType.RESUME,
            candidate_id="candidate_A",
            document_id="resume_A"
        )

        # Ingest Candidate B Resume
        ingestion_pipeline.ingest_text(
            text="Candidate B secret projects: Secret Project Beta with Quantum Algorithms.",
            source_type=SourceType.RESUME,
            candidate_id="candidate_B",
            document_id="resume_B"
        )

        # Candidate A searches for Quantum Algorithms
        search_A = SearchQuery(
            candidate_id="candidate_A",
            query="Quantum Algorithms Project Beta",
            sources=[SourceType.RESUME]
        )
        results_A = rag_retriever.retrieve(search_A)

        # ISOLATION ASSERTION: Candidate A must NOT see Candidate B's data
        for item in results_A:
            self.assertNotEqual(item.candidate_id, "candidate_B")
            self.assertNotIn("Project Beta", item.text)

        logger.info("Test 7 Passed: Multi-tenant candidate data isolation strictly enforced!")

    def test_08_duplicate_ingestion_hashing(self):
        """Test 8: Document hashing prevents duplicate re-embedding."""
        text = "Unique text for hashing test."
        res1 = ingestion_pipeline.ingest_text(text=text, source_type=SourceType.JOB_DESCRIPTION, candidate_id="cand_test", document_id="doc_hash_1")
        self.assertEqual(res1.status, "success")
        
        # Second ingestion with identical content
        res2 = ingestion_pipeline.ingest_text(text=text, source_type=SourceType.JOB_DESCRIPTION, candidate_id="cand_test", document_id="doc_hash_1")
        self.assertEqual(res2.status, "skipped")
        logger.info("Test 8 Passed: Duplicate ingestion correctly skipped.")

    def test_09_context_builder(self):
        """Test 9: Context Builder constructs grounded prompt context."""
        query = SearchQuery(
            query="Explain React useEffect dependency array and cleanup",
            top_k=2
        )
        ctx: ContextResponse = context_builder.build_context(query)
        self.assertGreater(ctx.retrieved_count, 0)
        self.assertIn("RETRIEVED GROUNDED CONTEXT", ctx.formatted_context)
        logger.info(f"Test 9 Passed: Formatted context constructed with {ctx.retrieved_count} blocks in {ctx.processing_time_ms}ms.")

    def test_10_rag_status(self):
        """Test 10: RAG Health check telemetry."""
        status = vector_store.get_status()
        self.assertTrue(status.vector_db_connected)
        self.assertEqual(status.status, "healthy")
        logger.info(f"Test 10 Passed: Status ok. Backend: {status.vector_db_backend}.")

    def test_11_error_handling(self):
        """Test 11: Empty/invalid input error handling."""
        with self.assertRaises(ValueError):
            ingestion_pipeline.ingest_text(text="", source_type=SourceType.KNOWLEDGE_BASE)
        logger.info("Test 11 Passed: Empty text raises ValueError gracefully.")

def run_tests():
    suite = unittest.TestLoader().loadTestsFromTestCase(TestRAGPipeline)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    return result.wasSuccessful()

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
