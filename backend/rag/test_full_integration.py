import sys
import os
import unittest

sys.path.insert(0, os.getcwd())

from backend.rag.schemas.models import (
    SourceType,
    IngestionRequest,
    SearchQuery
)
from backend.rag.ingestion.pipeline import ingestion_pipeline
from backend.rag.storage.vector_store import vector_store
from backend.rag.retrieval.retriever import rag_retriever
from backend.rag.generation.context_builder import context_builder

class TestFullRAGIntegration(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Index dataset
        ingestion_pipeline.ingest_knowledge_base_directory("backend/rag/data")

    def test_01_rag_status(self):
        status = vector_store.get_status()
        self.assertIn(status.status, ["healthy", "online"])
        self.assertGreaterEqual(status.indexed_chunk_count, 130)
        self.assertGreaterEqual(status.knowledge_base_doc_count, 130)

    def test_02_resume_ingestion(self):
        res = ingestion_pipeline.ingest_text(
            text="Experienced Frontend Developer proficient in React, Redux, TailwindCSS and REST API integration.",
            source_type=SourceType.RESUME,
            candidate_id="test_candidate_1@example.com",
            document_id="resume_test_candidate_1@example.com",
            filename="test_resume.pdf",
            topic="Resume",
            category="candidate_resume"
        )
        self.assertEqual(res.status, "success")
        self.assertGreaterEqual(res.chunks_created, 1)

    def test_03_job_description_ingestion(self):
        res = ingestion_pipeline.ingest_text(
            text="Target Job: Senior React Engineer. Required Skills: React, TypeScript, State Management, Jest testing.",
            source_type=SourceType.JOB_DESCRIPTION,
            candidate_id="test_candidate_1@example.com",
            document_id="jd_test_candidate_1@example.com",
            filename="target_jd.txt",
            topic="Job Description",
            category="job_description"
        )
        self.assertEqual(res.status, "success")
        self.assertGreaterEqual(res.chunks_created, 1)

    def test_04_performance_ingestion(self):
        res = ingestion_pipeline.ingest_text(
            text="Candidate scored 78% overall. Technical strength: JavaScript closures. Weakness: SQL JOIN optimization.",
            source_type=SourceType.PERFORMANCE,
            candidate_id="test_candidate_1@example.com",
            document_id="session_perf_123",
            topic="React Engineer",
            category="past_performance"
        )
        self.assertEqual(res.status, "success")
        self.assertGreaterEqual(res.chunks_created, 1)

    def test_05_grounded_context_building(self):
        ctx = context_builder.build_context(
            SearchQuery(
                query="React Hooks state management and SQL JOIN optimization",
                candidate_id="test_candidate_1@example.com",
                top_k=5
            )
        )
        self.assertIsNotNone(ctx.formatted_context)
        self.assertGreater(len(ctx.formatted_context), 50)
        self.assertGreater(ctx.retrieved_count, 0)

    def test_06_candidate_isolation(self):
        # Candidate 1 search
        results_cand1 = rag_retriever.retrieve(
            SearchQuery(
                query="TailwindCSS",
                candidate_id="test_candidate_1@example.com",
                sources=[SourceType.RESUME]
            )
        )
        self.assertGreater(len(results_cand1), 0)

        # Candidate 2 search should NOT return Candidate 1's resume
        results_cand2 = rag_retriever.retrieve(
            SearchQuery(
                query="TailwindCSS",
                candidate_id="test_candidate_2@example.com",
                sources=[SourceType.RESUME]
            )
        )
        self.assertEqual(len(results_cand2), 0)

if __name__ == "__main__":
    unittest.main()
