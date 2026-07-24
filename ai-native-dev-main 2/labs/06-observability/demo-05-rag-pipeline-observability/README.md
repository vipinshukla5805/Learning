# Demo 05: RAG Pipeline Observability with LangSmith

Gain full end-to-end visibility into a Retrieval-Augmented Generation pipeline — from document ingestion through retrieval and generation — using LangSmith tracing.

## What You'll Learn

- Tracing document ingestion: chunking, embedding, and vector store insertion
- Capturing retrieved chunks per query so you can audit what context was used
- Seeing the exact prompt (context + question) sent to the LLM
- Diagnosing retrieval quality: are the right chunks being returned?
- Identifying latency bottlenecks across ingestion vs retrieval vs generation

## What's Inside

| File           | Purpose                                                |
| -------------- | ------------------------------------------------------ |
| `main.py`      | Three-stage RAG pipeline: ingest → retrieve → generate |
| `.env.example` | Template for credentials                               |

## Quick Start

```bash
uv sync
cp .env.example .env   # add LANGSMITH_API_KEY and OPENAI_API_KEY
uv run python main.py
```

## Pipeline Architecture

```
Ingestion (once)
  Documents → TextSplitter → Embeddings → ChromaDB

Query (each question)
  Question
     ↓
  VectorStoreRetriever  (similarity search → top-k chunks)
     ↓
  ChatPromptTemplate    (inject chunks as context)
     ↓
  ChatOpenAI            (generates grounded answer)
     ↓
  StrOutputParser       (extract text)
```

## LangSmith Trace Hierarchy

```
rag_query                       ← @traceable parent run
  ├── RunnableParallel
  │     └── VectorStoreRetriever ← retrieved chunks logged here
  ├── ChatPromptTemplate          ← full prompt visible in LangSmith
  ├── ChatOpenAI                  ← tokens + latency
  └── StrOutputParser
```

## Debugging with LangSmith

| Problem             | What to look at in LangSmith                                    |
| ------------------- | --------------------------------------------------------------- |
| Wrong answer        | `VectorStoreRetriever` output — are the right chunks retrieved? |
| Answer not grounded | `ChatPromptTemplate` — is the context present in the prompt?    |
| Slow queries        | Latency breakdown — is retrieval or generation the bottleneck?  |
| High cost           | `ChatOpenAI` token counts — is the context too large?           |
