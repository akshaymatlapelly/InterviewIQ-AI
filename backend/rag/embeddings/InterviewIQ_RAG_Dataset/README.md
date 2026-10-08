# InterviewIQ RAG Knowledge Dataset

This folder contains the initial global knowledge base for InterviewIQ AI.

## Use
Copy the `data` directory into:

backend/rag/data/

Then run the RAG knowledge-base ingestion/indexing flow created by the Part 1 Antigravity implementation.

## Important
These are GLOBAL interview-knowledge records. Do NOT put candidate-specific resumes, job descriptions, scores, transcripts, or private information into these files.

Candidate-specific sources should be indexed dynamically with:
- candidate_id
- source_type
- document_id
- metadata

## Format
Every line in each `.jsonl` file is one independent knowledge record.

Fields:
- id
- topic
- category
- difficulty
- content
- keywords
- skills
- interview_relevance
- common_mistakes
- follow_up_topics

## Categories
technical
dsa
databases
system-design
operating-systems
computer-networks
web-development
cloud-devops
testing
ai-ml
hr-behavioral
soft-skills

## Dataset size
This starter pack contains curated, interview-oriented records designed to validate the complete RAG pipeline. It is intentionally structured so it can be expanded later without changing the RAG architecture.
