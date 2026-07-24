"""
Demo 05: RAG Pipeline Observability with LangSmith

This demo traces every stage of a Retrieval-Augmented Generation
(RAG) pipeline end-to-end, giving you full visibility into:

Ingestion Pipeline:
  • Document loading & text splitting
  • Embedding generation per chunk
  • Vector store insertion

Retrieval Pipeline:
  • Query embedding
  • Similarity search & retrieved chunk content
  • Context assembly

Generation Pipeline:
  • Prompt construction with context
  • LLM call with full prompt/completion
  • Answer extraction

With LangSmith you can diagnose:
  - "Why did the model give a wrong answer?" → inspect retrieved chunks
  - "Why is the pipeline slow?" → see latency per stage
  - "How many tokens does each query cost?" → token tracking per call
"""

import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.documents import Document
from langchain_core.runnables import RunnablePassthrough
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langsmith import traceable, Client

# ============================================================================
# SETUP
# ============================================================================

load_dotenv()

if not os.getenv("OPENAI_API_KEY"):
    raise EnvironmentError("OPENAI_API_KEY is not set. See .env.example.")

tracing_enabled = os.getenv("LANGSMITH_TRACING", "false").lower() == "true"
print(
    "✅ LangSmith tracing ENABLED"
    if tracing_enabled
    else "⚠️  LangSmith tracing DISABLED — set LANGSMITH_TRACING=true"
)
print()

MODEL = "gpt-4o-mini"
EMBED_MODEL = "text-embedding-3-small"

llm = ChatOpenAI(model=MODEL, temperature=0)
embeddings = OpenAIEmbeddings(model=EMBED_MODEL)

print("=" * 70)
print("DEMO 05: RAG PIPELINE OBSERVABILITY")
print("=" * 70)
print()

# ============================================================================
# KNOWLEDGE BASE — in-memory documents (no files needed)
# ============================================================================

DOCS = [
    Document(
        page_content=(
            "LangSmith is an observability platform built by LangChain for "
            "monitoring, debugging, and evaluating LLM applications in production. "
            "It captures traces, token usage, and latency for every run."
        ),
        metadata={"source": "langsmith-overview", "topic": "observability"},
    ),
    Document(
        page_content=(
            "A trace in LangSmith represents a single end-to-end execution of your "
            "application, from the first input to the final output. Each trace is made "
            "up of runs that form a parent-child hierarchy."
        ),
        metadata={"source": "langsmith-concepts", "topic": "tracing"},
    ),
    Document(
        page_content=(
            "LangSmith datasets are collections of input/output examples used for "
            "evaluating LLM applications. You can create datasets manually, from "
            "production traces, or by uploading CSV/JSON files."
        ),
        metadata={"source": "langsmith-datasets", "topic": "evaluation"},
    ),
    Document(
        page_content=(
            "Retrieval-Augmented Generation (RAG) combines a retrieval step with an "
            "LLM generation step. Documents are chunked, embedded, and stored in a "
            "vector database. At query time, semantically similar chunks are retrieved "
            "and injected into the prompt."
        ),
        metadata={"source": "rag-overview", "topic": "rag"},
    ),
    Document(
        page_content=(
            "Embeddings are dense vector representations of text that capture semantic "
            "meaning. Two texts with similar meanings have vectors that are close together "
            "in the embedding space, enabling semantic similarity search."
        ),
        metadata={"source": "embeddings-guide", "topic": "embeddings"},
    ),
    Document(
        page_content=(
            "ChromaDB is an open-source vector database optimised for AI applications. "
            "It supports in-memory and persistent storage and integrates natively with "
            "LangChain via the langchain-chroma package."
        ),
        metadata={"source": "chromadb-guide", "topic": "vector-db"},
    ),
]

# ============================================================================
# STAGE 1: INGESTION PIPELINE
# ============================================================================

print("── STAGE 1: Ingestion ───────────────────────────────────────────────")
print()


@traceable(name="ingest_documents", tags=["rag", "ingestion"])
def ingest_documents(documents: list[Document]) -> Chroma:
    """
    Split, embed, and store documents in ChromaDB.

    LangSmith captures:
    - Total documents ingested
    - Chunk sizes after splitting
    - Embedding model used
    - Time to insert into vector store
    """
    print(f"   Ingesting {len(documents)} documents…")

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=300,
        chunk_overlap=50,
        length_function=len,
    )
    chunks = splitter.split_documents(documents)
    print(f"   Split into {len(chunks)} chunks")

    # Build in-memory Chroma vector store
    vector_store = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        collection_name="rag-demo-05",
    )
    print(f"   Stored {len(chunks)} embeddings in ChromaDB")
    print()
    return vector_store


vector_store = ingest_documents(DOCS)
retriever = vector_store.as_retriever(search_kwargs={"k": 3})

# ============================================================================
# STAGE 2: RAG CHAIN
# ============================================================================

print("── STAGE 2: RAG Chain setup ────────────────────────────────────────")
print()

rag_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant. Answer the question using ONLY the "
            "provided context. If the answer is not in the context, say "
            "'I don't have that information.'\n\nContext:\n{context}",
        ),
        ("human", "{question}"),
    ]
)


def format_docs(docs: list[Document]) -> str:
    """Format retrieved documents into a context string."""
    formatted = []
    for i, doc in enumerate(docs, 1):
        formatted.append(f"[{i}] {doc.page_content} (source: {doc.metadata.get('source', 'unknown')})")
    return "\n\n".join(formatted)


rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | rag_prompt
    | llm
    | StrOutputParser()
)

# ============================================================================
# STAGE 3: RETRIEVAL & GENERATION with tracing
# ============================================================================

print("── STAGE 3: Query & answer ──────────────────────────────────────────")
print()


@traceable(
    name="rag_query",
    tags=["rag", "query"],
    metadata={"pipeline": "demo-05", "vector_db": "chroma"},
)
def rag_query(question: str) -> dict:
    """
    Run a RAG query: retrieve relevant chunks, then generate an answer.

    This @traceable wrapper adds a top-level 'rag_query' run.
    Inside it you will see:
      rag_query                        ← @traceable parent
        ├── RunnableParallel           ← builds context + passes question
        │     └── VectorStoreRetriever ← similarity search (chunks logged)
        ├── ChatPromptTemplate         ← injects context into prompt
        ├── ChatOpenAI                 ← generates answer
        └── StrOutputParser            ← extracts text
    """
    print(f"   Question: {question}")

    # Also retrieve and log chunks explicitly for debugging
    retrieved_docs = retriever.invoke(question)
    print(f"   Retrieved {len(retrieved_docs)} chunks:")
    for doc in retrieved_docs:
        print(f"     • {doc.page_content[:80]}…")

    answer = rag_chain.invoke(question)
    print(f"   Answer: {answer}")
    print()
    return {"question": question, "answer": answer, "num_chunks": len(retrieved_docs)}


queries = [
    "What is LangSmith used for?",
    "How does RAG work?",
    "What is a trace in LangSmith?",
    "What is the capital of France?",  # out-of-context query
]

results = []
for q in queries:
    result = rag_query(q)
    results.append(result)

# ============================================================================
# STAGE 4: PIPELINE SUMMARY
# ============================================================================

print("── STAGE 4: Summary ─────────────────────────────────────────────────")
print()
print(f"   Documents ingested : {len(DOCS)}")
print(f"   Queries answered   : {len(results)}")
print(
    f"   Avg chunks/query   : "
    f"{sum(r['num_chunks'] for r in results) / len(results):.1f}"
)
print()
print("=" * 70)
print("DONE — in LangSmith you can drill into each rag_query run and see:")
print("  • Which chunks were retrieved for each question")
print("  • The exact prompt sent to the LLM (context + question)")
print("  • Token usage and latency breakdown per stage")
print("  URL: https://smith.langchain.com")
print("=" * 70)
