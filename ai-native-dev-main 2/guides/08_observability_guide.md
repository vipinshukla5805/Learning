# Observability with LangSmith - Comprehensive Guide

## Table of Contents

1. [Introduction to AI Observability](#introduction-to-ai-observability)
2. [What is LangSmith?](#what-is-langsmith)
3. [Core Concepts](#core-concepts)
4. [Setup & Configuration](#setup--configuration)
5. [Tracing LLM Calls](#tracing-llm-calls)
6. [Tracing LangChain Applications](#tracing-langchain-applications)
7. [Tracing Custom & Non-LangChain Code](#tracing-custom--non-langchain-code)
8. [Datasets & Testing](#datasets--testing)
9. [Evaluation (Evals)](#evaluation-evals)
10. [Human Feedback & Annotation](#human-feedback--annotation)
11. [Prompt Management with LangSmith Hub](#prompt-management-with-langsmith-hub)
12. [Monitoring in Production](#monitoring-in-production)
13. [LangSmith with FastAPI](#langsmith-with-fastapi)
14. [Best Practices](#best-practices)
15. [Common Pitfalls & Solutions](#common-pitfalls--solutions)

---

## Introduction to AI Observability

### What is Observability?

In traditional software engineering, **observability** is the ability to understand the internal state of a system by examining its external outputs — logs, metrics, and distributed traces. For AI-powered applications, observability becomes significantly more complex and critical.

### Why Observability Matters in AI Applications

Unlike traditional software where bugs produce deterministic, reproducible errors, LLM-based applications exhibit unique failure modes:

| Traditional Software           | LLM-Based Applications                    |
|--------------------------------|--------------------------------------------|
| Deterministic outputs          | Probabilistic, non-deterministic outputs   |
| Clear error messages           | Silent quality degradation                 |
| Straightforward debugging      | Hard to reproduce failures                 |
| Performance = latency + CPU    | Performance = latency + cost + quality     |
| Unit tests catch regressions   | Tests miss prompt regressions              |

### The Four Pillars of AI Observability

```
┌──────────────────────────────────────────────────────────────────────┐
│                   AI Observability Pillars                            │
├─────────────────┬──────────────────┬──────────────┬──────────────────┤
│   TRACING       │   EVALUATION     │  MONITORING  │   FEEDBACK       │
│                 │                  │              │                  │
│ • Every LLM     │ • Automated      │ • Latency    │ • Human labels   │
│   call logged   │   quality checks │ • Token cost │ • Thumbs up/down │
│ • Input/output  │ • Dataset-driven │ • Error rate │ • Corrections    │
│   captured      │   testing        │ • Drift      │ • Annotations    │
│ • Chain steps   │ • Regression     │   detection  │                  │
│   visible       │   prevention     │              │                  │
└─────────────────┴──────────────────┴──────────────┴──────────────────┘
```

### Observability Challenges in Production AI

1. **Prompt Drift**: A prompt that worked perfectly in development may degrade over time as the model updates
2. **Cost Explosion**: Unmonitored token usage can lead to runaway API bills
3. **Latency Spikes**: Multi-step chains can have unpredictable latency characteristics
4. **Quality Regression**: Small prompt changes can silently break answer quality
5. **Data Privacy**: Sensitive input data flowing through LLM calls must be audited
6. **Chain Debugging**: In a 10-step RAG pipeline, knowing *which* step failed is non-trivial

---

## What is LangSmith?

### Overview

**LangSmith** is an all-in-one developer platform for debugging, testing, evaluating, and monitoring LLM applications. Built by LangChain, Inc., it integrates seamlessly with LangChain but supports *any* LLM framework or even raw API calls.

### History & Evolution

- **July 2023**: Closed beta launch alongside LangChain v0.0.232
- **September 2023**: Public beta — free tier introduced
- **Early 2024**: Datasets, Evals, and Annotation queues reach general availability
- **Mid 2024**: LangSmith SDK decoupled from LangChain — now works standalone
- **2025**: Online evaluation, guardrails integration, and playground v2 released
- **2026**: Native integration with OpenTelemetry (OTel) spans

### LangSmith vs Alternatives

| Feature                  | LangSmith | LangFuse | Helicone | Arize Phoenix |
|--------------------------|-----------|----------|----------|---------------|
| LangChain native         | ✅        | ✅       | Partial  | ✅            |
| Non-LangChain support    | ✅        | ✅       | ✅       | ✅            |
| Built-in evaluators      | ✅        | Partial  | ❌       | ✅            |
| Prompt versioning        | ✅        | ✅       | ❌       | ❌            |
| Annotation queues        | ✅        | ✅       | ❌       | Partial       |
| Self-hostable            | ✅ (paid) | ✅ (OSS) | ❌       | ✅ (OSS)      |
| Free tier                | ✅        | ✅       | ✅       | ✅            |

### LangSmith Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Your Application                              │
│                                                                      │
│  ┌──────────┐    ┌─────────────┐    ┌────────────┐                 │
│  │ LangChain│    │  OpenAI SDK │    │ Custom Code│                 │
│  │  Chain   │    │  Direct Call│    │ (decorated)│                 │
│  └────┬─────┘    └──────┬──────┘    └─────┬──────┘                 │
│       │                 │                  │                         │
│       └─────────────────┴──────────────────┘                        │
│                              │                                       │
│                    LangSmith SDK (tracer)                            │
└──────────────────────────────┼──────────────────────────────────────┘
                               │ HTTPS / async batching
                               ▼
                    ┌──────────────────────┐
                    │   LangSmith API      │
                    │   api.smith.langchain│
                    │   .com               │
                    └──────────┬───────────┘
                               │
           ┌───────────────────┼────────────────────┐
           ▼                   ▼                     ▼
    ┌─────────────┐   ┌──────────────┐   ┌──────────────────┐
    │   TRACES    │   │  DATASETS &  │   │   MONITORING     │
    │  (Runs)     │   │   EVALS      │   │   DASHBOARDS     │
    └─────────────┘   └──────────────┘   └──────────────────┘
```

---

## Core Concepts

### 1. Runs

A **Run** is the fundamental unit of tracing in LangSmith. Every LLM call, chain execution, retriever query, or tool invocation creates a Run.

**Run Types:**

| Run Type   | Description                                          | Example                            |
|------------|------------------------------------------------------|------------------------------------|
| `llm`      | Direct call to a language model                      | `ChatOpenAI.invoke()`              |
| `chain`    | Sequence of operations                               | `RunnableSequence`                 |
| `tool`     | Tool/function invocation                             | Calculator, web search             |
| `retriever`| Vector store retrieval                               | `vectorstore.as_retriever()`       |
| `embedding`| Embedding generation                                 | `OpenAIEmbeddings.embed_query()`   |
| `parser`   | Output parsing step                                  | `JsonOutputParser`                 |

### 2. Traces

A **Trace** is a tree of Runs representing one complete end-to-end request through your application:

```
Trace (root run)
  ├── Chain: RAG Pipeline
  │     ├── Retriever: VectorStore lookup
  │     │     └── Embedding: query embedding
  │     └── LLM: ChatOpenAI
  │           ├── Input: {question, context}
  │           └── Output: {answer}
  └── Parser: StrOutputParser
```

### 3. Projects

A **Project** (previously called a Dataset in some contexts) is a logical grouping of traces. Use separate projects for:
- Different applications (chatbot, code assistant, summarizer)
- Different environments (dev, staging, prod)
- Different experiments

### 4. Datasets

A **Dataset** is a collection of input/output pairs used for:
- Regression testing (did this change break quality?)
- Evaluation benchmarking
- Fine-tuning data preparation

### 5. Evaluators

**Evaluators** grade run outputs against ground truth or using LLM-as-judge:

| Evaluator Type     | How it works                                           |
|--------------------|--------------------------------------------------------|
| Exact match        | String equality check                                  |
| Embedding distance | Semantic similarity via cosine distance                |
| LLM-as-judge       | Uses another LLM to score correctness/relevance        |
| Custom Python      | Any Python function comparing outputs                  |
| Regex              | Pattern matching on output                             |

### 6. Feedback

**Feedback** attaches a score or annotation to a Run — either programmatically or from human reviewers.

---

## Setup & Configuration

### Installation

```bash
# With uv (recommended)
uv add langsmith

# With pip
pip install langsmith

# With LangChain (includes langsmith)
pip install langchain langchain-openai langsmith
```

### API Key Setup

1. Sign up at [https://smith.langchain.com](https://smith.langchain.com)
2. Navigate to **Settings → API Keys → Create API Key**
3. Copy the key (starts with `ls__`)

```bash
# .env file
LANGSMITH_API_KEY=ls__xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
LANGCHAIN_TRACING_V2=true                   # enable automatic LangChain tracing
LANGCHAIN_PROJECT=my-project-name           # project to send traces to
LANGCHAIN_ENDPOINT=https://api.smith.langchain.com   # default, can be self-hosted
```

### Loading Environment Variables

```python
from dotenv import load_dotenv
import os

load_dotenv()

# Verify configuration
from langsmith import Client

client = Client()
print("LangSmith connected:", client.list_projects())
```

### Environment-Specific Configuration

```python
import os

# Development
os.environ["LANGCHAIN_PROJECT"] = "my-app-development"
os.environ["LANGCHAIN_TRACING_V2"] = "true"

# Production — only trace a sample to save costs
os.environ["LANGCHAIN_PROJECT"] = "my-app-production"
os.environ["LANGSMITH_SAMPLING_RATE"] = "0.1"  # trace 10% of requests
```

---

## Tracing LLM Calls

### Automatic LangChain Tracing

With `LANGCHAIN_TRACING_V2=true` set, **all LangChain calls are automatically traced**. Zero code changes required.

```python
import os
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage

os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_PROJECT"] = "my-first-traces"

llm = ChatOpenAI(model="gpt-4o-mini")

# This is automatically traced — inputs, outputs, latency, tokens all captured
response = llm.invoke([HumanMessage(content="What is the capital of France?")])
print(response.content)
```

### What Gets Captured Automatically

```
Run: ChatOpenAI
├── run_id: "a1b2c3d4-..."
├── start_time: 2026-03-04T10:00:00.000Z
├── end_time: 2026-03-04T10:00:01.234Z
├── latency: 1234ms
├── inputs:
│   └── messages: [{"role": "user", "content": "What is the capital of France?"}]
├── outputs:
│   └── generations: [{"text": "Paris", "message": {...}}]
├── token_usage:
│   ├── prompt_tokens: 15
│   ├── completion_tokens: 1
│   └── total_tokens: 16
├── model_name: "gpt-4o-mini"
└── tags: []
```

### Adding Metadata and Tags

```python
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage

llm = ChatOpenAI(model="gpt-4o-mini")

# Attach metadata and tags to a specific call
response = llm.invoke(
    [HumanMessage(content="Summarize this article...")],
    config={
        "metadata": {
            "user_id": "user_42",
            "session_id": "sess_abc123",
            "feature_flag": "new_prompt_v2",
        },
        "tags": ["summarization", "production", "v2"],
        "run_name": "article-summarizer",   # custom name in UI
    }
)
```

### Naming Runs

```python
from langchain_core.runnables import RunnableConfig

config = RunnableConfig(
    run_name="Customer Support Query",
    tags=["support", "tier-1"],
    metadata={"customer_id": "cust_789"}
)

chain.invoke({"question": user_question}, config=config)
```

---

## Tracing LangChain Applications

### Tracing a Full RAG Chain

```python
import os
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_PROJECT"] = "rag-application"

# Setup (normally done once during app startup)
embeddings = OpenAIEmbeddings()
vectorstore = Chroma(embedding_function=embeddings, persist_directory="./chroma_db")
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

prompt = ChatPromptTemplate.from_template("""
Answer the question based on the context below.
Context: {context}
Question: {question}
""")

llm = ChatOpenAI(model="gpt-4o-mini")

# Build the RAG chain — each step becomes a child run in LangSmith
rag_chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

# One invoke creates a full trace with all child runs visible in LangSmith
answer = rag_chain.invoke("What are the main benefits of RAG?")
```

**LangSmith will capture the full trace tree:**
```
Trace: RunnableSequence
├── Retriever: Chroma
│     └── Embedding: query vectorization
├── Prompt: ChatPromptTemplate
│     └── Input: {context, question}
├── LLM: ChatOpenAI
│     ├── Tokens: 423 prompt, 87 completion
│     └── Latency: 1.8s
└── Parser: StrOutputParser
```

### Tracing LangGraph Agents

```python
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
import os

os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_PROJECT"] = "langgraph-agent"

@tool
def search_web(query: str) -> str:
    """Search the web for information."""
    return f"Results for: {query}"

@tool
def calculator(expression: str) -> str:
    """Evaluate a math expression."""
    return str(eval(expression))

llm = ChatOpenAI(model="gpt-4o").bind_tools([search_web, calculator])

# Build graph — all node executions appear as nested runs in LangSmith
from typing import TypedDict, Annotated
from langchain_core.messages import BaseMessage
import operator

class AgentState(TypedDict):
    messages: Annotated[list[BaseMessage], operator.add]

def agent_node(state: AgentState):
    response = llm.invoke(state["messages"])
    return {"messages": [response]}

graph = StateGraph(AgentState)
graph.add_node("agent", agent_node)
graph.set_entry_point("agent")
graph.add_edge("agent", END)

app = graph.compile()
result = app.invoke({"messages": [("user", "What is 25 * 4?")]})
```

---

## Tracing Custom & Non-LangChain Code

### Using the `@traceable` Decorator

The `@traceable` decorator is the primary way to trace any Python function, regardless of whether it uses LangChain.

```python
from langsmith import traceable
from openai import OpenAI
import os

os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_PROJECT"] = "custom-traced-app"

client = OpenAI()

@traceable(name="Direct OpenAI Call", run_type="llm")
def call_openai(prompt: str, model: str = "gpt-4o-mini") -> str:
    """Call OpenAI directly — fully traced."""
    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content

@traceable(name="Preprocess Input", run_type="chain")
def preprocess(user_input: str) -> str:
    """Clean and format user input."""
    return user_input.strip().lower()

@traceable(name="Full Pipeline", run_type="chain")
def full_pipeline(user_input: str) -> str:
    """Top-level traced function — child runs nest automatically."""
    cleaned = preprocess(user_input)
    answer = call_openai(f"Answer this question: {cleaned}")
    return answer

result = full_pipeline("  What is quantum computing?  ")
print(result)
```

### Tracing with Context Manager

```python
from langsmith import trace
from openai import OpenAI

client = OpenAI()

def process_document(doc: str) -> dict:
    with trace("process-document", run_type="chain") as run:
        # Attach metadata to the run
        run.metadata["doc_length"] = len(doc)
        run.metadata["doc_type"] = "pdf"

        # Step 1: Summarize
        with trace("summarize", run_type="llm", inputs={"document": doc}) as sub_run:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": f"Summarize: {doc}"}]
            )
            summary = response.choices[0].message.content
            sub_run.end(outputs={"summary": summary})

        # Step 2: Extract keywords
        with trace("extract-keywords", run_type="chain") as keyword_run:
            keywords = summary.split()[:5]  # simplified
            keyword_run.end(outputs={"keywords": keywords})

        return {"summary": summary, "keywords": keywords}
```

### Wrapping the OpenAI Client

```python
from langsmith import wrappers
from openai import OpenAI

# Wrap the client — all calls through this client are automatically traced
openai_client = wrappers.wrap_openai(OpenAI())

# This call is now fully traced in LangSmith
response = openai_client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "Hello, world!"}]
)
print(response.choices[0].message.content)
```

### Tracing Streaming Responses

```python
from langsmith import traceable
from openai import OpenAI

openai_client = OpenAI()

@traceable(run_type="llm")
def stream_response(prompt: str):
    """Trace a streaming LLM call — tokens captured when stream ends."""
    full_response = ""
    stream = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        stream=True
    )
    for chunk in stream:
        delta = chunk.choices[0].delta.content or ""
        full_response += delta
        print(delta, end="", flush=True)

    print()  # newline at end
    return full_response

stream_response("Write a haiku about observability.")
```

---

## Datasets & Testing

### Creating Datasets

**Datasets** are curated collections of inputs (and optionally expected outputs) used for automated testing and evaluation.

```python
from langsmith import Client

client = Client()

# Create a new dataset
dataset = client.create_dataset(
    dataset_name="customer-support-qa-v1",
    description="Customer support questions with expected responses",
)

# Add examples
examples = [
    {
        "inputs": {"question": "How do I reset my password?"},
        "outputs": {"answer": "Go to Settings > Security > Reset Password."},
    },
    {
        "inputs": {"question": "How do I cancel my subscription?"},
        "outputs": {"answer": "Visit Account > Billing > Cancel Subscription."},
    },
    {
        "inputs": {"question": "What payment methods do you accept?"},
        "outputs": {"answer": "We accept Visa, MasterCard, and PayPal."},
    },
]

client.create_examples(
    inputs=[e["inputs"] for e in examples],
    outputs=[e["outputs"] for e in examples],
    dataset_id=dataset.id,
)

print(f"Dataset created: {dataset.id}")
```

### Creating Datasets from Existing Traces

One of LangSmith's most powerful features is turning production traces directly into test cases:

```python
from langsmith import Client

client = Client()

# Create dataset from good production runs
dataset = client.create_dataset("production-golden-set")

# Find runs from a project that had positive feedback
runs = client.list_runs(
    project_name="my-app-production",
    filter='and(eq(feedback_key, "user_rating"), gt(feedback_score, 0.8))',
    limit=100
)

for run in runs:
    client.create_example_from_run(
        run_id=run.id,
        dataset_id=dataset.id
    )

print("Dataset populated from production traces")
```

### Listing and Managing Datasets

```python
from langsmith import Client

client = Client()

# List all datasets
for dataset in client.list_datasets():
    print(f"Dataset: {dataset.name} | Examples: {dataset.example_count}")

# Fetch examples from a dataset
examples = list(client.list_examples(dataset_name="customer-support-qa-v1"))
for example in examples[:3]:
    print(f"Input: {example.inputs}")
    print(f"Expected: {example.outputs}")
    print("---")
```

---

## Evaluation (Evals)

### Running Evaluations with `evaluate()`

```python
from langsmith import Client, evaluate
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

client = Client()

# Define the application under test
prompt = ChatPromptTemplate.from_template("Answer this question: {question}")
llm = ChatOpenAI(model="gpt-4o-mini")
chain = prompt | llm | StrOutputParser()

def app_under_test(inputs: dict) -> dict:
    """Wrap your application for evaluation."""
    answer = chain.invoke({"question": inputs["question"]})
    return {"answer": answer}

# Run evaluation against a dataset
results = evaluate(
    app_under_test,
    data="customer-support-qa-v1",         # dataset name or ID
    evaluators=["qa"],                      # built-in evaluators
    experiment_prefix="gpt-4o-mini-v1",
    metadata={"model": "gpt-4o-mini", "prompt_version": "v1"},
)

print(f"Experiment: {results.experiment_name}")
print(f"Results URL: {results.url}")
```

### Built-in Evaluators

```python
from langsmith.evaluation import LangChainStringEvaluator

# Correctness — LLM judges if output matches expected
correctness_evaluator = LangChainStringEvaluator(
    "qa",
    config={"llm": ChatOpenAI(model="gpt-4o", temperature=0)}
)

# Criteria-based — check for specific qualities
conciseness_evaluator = LangChainStringEvaluator(
    "criteria",
    config={
        "criteria": "conciseness",
        "llm": ChatOpenAI(model="gpt-4o", temperature=0)
    }
)

# Embedding similarity — semantic closeness to expected output
from langsmith.evaluation import EmbeddingDistanceEvaluator
similarity_evaluator = EmbeddingDistanceEvaluator()
```

### Custom Evaluators

```python
from langsmith.schemas import Run, Example

def length_check_evaluator(run: Run, example: Example) -> dict:
    """Custom evaluator: answer should be between 10 and 200 words."""
    output = run.outputs.get("answer", "")
    word_count = len(output.split())

    score = 1.0 if 10 <= word_count <= 200 else 0.0
    comment = f"Word count: {word_count}"

    return {
        "key": "length_check",
        "score": score,
        "comment": comment,
    }

def contains_apology_evaluator(run: Run, example: Example) -> dict:
    """Flag if response contains unnecessary apologies."""
    output = run.outputs.get("answer", "").lower()
    apology_words = ["sorry", "i apologize", "unfortunately"]
    contains = any(word in output for word in apology_words)

    return {
        "key": "no_apology",
        "score": 0.0 if contains else 1.0,
        "comment": "Response contained apology language" if contains else "Clean response",
    }

# Use custom evaluators in evaluate()
results = evaluate(
    app_under_test,
    data="customer-support-qa-v1",
    evaluators=[length_check_evaluator, contains_apology_evaluator],
    experiment_prefix="custom-evals",
)
```

### LLM-as-Judge Evaluator

```python
from langsmith.evaluation import LangChainStringEvaluator
from langchain_openai import ChatOpenAI

judge_llm = ChatOpenAI(model="gpt-4o", temperature=0)

helpfulness_evaluator = LangChainStringEvaluator(
    "labeled_criteria",
    config={
        "criteria": {
            "helpfulness": (
                "Is the answer helpful and directly addresses the customer's question? "
                "Score 1 if yes, 0 if the response is vague, irrelevant, or incomplete."
            )
        },
        "llm": judge_llm,
    }
)

# Compare two models side-by-side
from langchain_openai import ChatOpenAI

def gpt4o_app(inputs: dict) -> dict:
    llm = ChatOpenAI(model="gpt-4o")
    return {"answer": llm.invoke(inputs["question"]).content}

def gpt4o_mini_app(inputs: dict) -> dict:
    llm = ChatOpenAI(model="gpt-4o-mini")
    return {"answer": llm.invoke(inputs["question"]).content}

# Run both — compare in LangSmith UI
evaluate(gpt4o_app, data="customer-support-qa-v1",
         evaluators=[helpfulness_evaluator], experiment_prefix="gpt4o")
evaluate(gpt4o_mini_app, data="customer-support-qa-v1",
         evaluators=[helpfulness_evaluator], experiment_prefix="gpt4o-mini")
```

### Comparing Experiments

After running evaluations, use the LangSmith UI to compare experiments:

1. Go to **Datasets** → select your dataset
2. Click **Experiments** tab
3. Select two experiments to compare side-by-side
4. View per-example diffs, aggregate scores, and latency/cost breakdowns

---

## Human Feedback & Annotation

### Programmatic Feedback

```python
from langsmith import Client

client = Client()

# After running a chain, submit feedback on the run
run_id = "the-run-id-from-your-trace"  # get from run metadata

# Simple thumbs up/down
client.create_feedback(
    run_id=run_id,
    key="user_satisfaction",
    score=1,          # 1 = positive, 0 = negative
    comment="User clicked thumbs up",
)

# Numeric score (0.0 – 1.0)
client.create_feedback(
    run_id=run_id,
    key="relevance",
    score=0.85,
    comment="Response was mostly relevant but missed one key point",
)

# Categorical feedback
client.create_feedback(
    run_id=run_id,
    key="category",
    value="hallucination",   # string label
    comment="Response contained a made-up URL",
)
```

### Attaching Feedback in Application Code

```python
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
from langsmith import Client
import uuid

client = Client()

def run_with_feedback_support(user_question: str, user_id: str) -> dict:
    """Run chain and return run_id for later feedback submission."""
    llm = ChatOpenAI(model="gpt-4o-mini")

    run_id = str(uuid.uuid4())

    response = llm.invoke(
        [HumanMessage(content=user_question)],
        config={
            "run_id": run_id,   # set explicit run_id
            "metadata": {"user_id": user_id},
        }
    )

    return {
        "answer": response.content,
        "run_id": run_id,  # return to caller for feedback
    }

# In your API handler:
result = run_with_feedback_support("How do I reset my password?", "user_42")

# Later, when user clicks thumbs up in UI:
client.create_feedback(
    run_id=result["run_id"],
    key="user_rating",
    score=1,
)
```

### Annotation Queues

Annotation queues let human reviewers label traces in a structured workflow in the LangSmith UI.

```python
from langsmith import Client

client = Client()

# Create an annotation queue
queue = client.create_annotation_queue(
    name="Content Moderation Review",
    description="Review flagged responses for policy violations",
)

# Add runs to the queue programmatically
run_id = "run-id-that-needs-review"
client.add_runs_to_annotation_queue(
    queue_id=queue.id,
    run_ids=[run_id],
)
print(f"Queue URL: https://smith.langchain.com/o/{queue.tenant_id}/annotation-queues/{queue.id}")
```

---

## Prompt Management with LangSmith Hub

### What is LangSmith Hub?

LangSmith Hub is a version-controlled repository for prompts. It enables:
- Centralized prompt storage with full version history
- Sharing prompts across team members
- A/B testing different prompt versions
- Reverting to previous versions when quality drops

### Creating and Pushing a Prompt

```python
from langchain_core.prompts import ChatPromptTemplate
from langsmith import Client

client = Client()

# Define your prompt
customer_support_prompt = ChatPromptTemplate.from_messages([
    ("system", """You are a helpful customer support agent for {company_name}.
    You are professional, concise, and empathetic.
    Always end with: "Is there anything else I can help you with?"
    """),
    ("human", "{customer_question}")
])

# Push to LangSmith Hub
url = client.push_prompt(
    "customer-support-v1",         # prompt name
    object=customer_support_prompt,
    description="Initial customer support prompt",
    tags=["production", "v1"],
)
print(f"Prompt pushed: {url}")
```

### Pulling and Using a Prompt

```python
from langsmith import Client
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser

client = Client()

# Pull latest version
prompt = client.pull_prompt("customer-support-v1")

# Pull a specific version (for reproducibility)
prompt_v2 = client.pull_prompt("customer-support-v1:v2")

# Use it in a chain
llm = ChatOpenAI(model="gpt-4o-mini")
chain = prompt | llm | StrOutputParser()

response = chain.invoke({
    "company_name": "AcmeCorp",
    "customer_question": "How do I cancel my subscription?"
})
```

### Prompt Versioning Best Practices

```python
# Always pin to explicit version in production
PROMPT_VERSION = "abc123def456"  # commit hash from LangSmith UI

prompt = client.pull_prompt(f"customer-support-v1:{PROMPT_VERSION}")

# Use metadata to track which prompt version was used
chain.invoke(
    {"company_name": "AcmeCorp", "customer_question": question},
    config={
        "metadata": {
            "prompt_version": PROMPT_VERSION,
            "prompt_name": "customer-support-v1"
        }
    }
)
```

---

## Monitoring in Production

### Setting Up a Monitoring Dashboard

LangSmith's monitoring dashboards provide automatic charts for:
- **Latency**: P50, P95, P99 response times
- **Token Usage**: Costs per day/hour, tokens per call
- **Error Rate**: Failed runs over time
- **Run Volume**: Requests per minute/hour

Enable by going to **Projects** → select your project → **Monitor** tab.

### Sampling for High-Traffic Applications

```python
import os
import random
from langchain_core.runnables import RunnableConfig

# Global sampling — only trace 10% of production traffic
os.environ["LANGSMITH_SAMPLING_RATE"] = "0.1"

# Or control sampling per-request
def should_trace() -> bool:
    """Trace 10% of traffic, plus all error cases."""
    return random.random() < 0.1

def handle_request(user_input: str) -> str:
    config = RunnableConfig(
        tags=["production"],
        metadata={"sampling": "10pct"},
    ) if should_trace() else {}

    return chain.invoke({"question": user_input}, config=config)
```

### Alerting and Thresholds

LangSmith supports webhook-based alerts (configure in UI under **Monitor → Alerts**):

```python
# When setting up alerts programmatically via the API:
from langsmith import Client

client = Client()

# Create a rule that alerts when error rate exceeds 5%
# (Currently done via UI; Python SDK support varies by version)
# Navigate to: Projects → [Your Project] → Monitor → Add Alert Rule
```

### Tracking Costs

```python
from langsmith import Client
from datetime import datetime, timedelta

client = Client()

# Get run stats for cost analysis
runs = client.list_runs(
    project_name="my-app-production",
    start_time=datetime.now() - timedelta(days=7),
    run_type="llm",
)

total_tokens = 0
total_prompt_tokens = 0
total_completion_tokens = 0

for run in runs:
    if run.total_tokens:
        total_tokens += run.total_tokens
    if run.prompt_tokens:
        total_prompt_tokens += run.prompt_tokens
    if run.completion_tokens:
        total_completion_tokens += run.completion_tokens

# Estimate cost (GPT-4o-mini pricing as of 2026)
cost_per_1m_prompt = 0.15        # $0.15 per 1M prompt tokens
cost_per_1m_completion = 0.60    # $0.60 per 1M completion tokens

estimated_cost = (
    (total_prompt_tokens / 1_000_000) * cost_per_1m_prompt +
    (total_completion_tokens / 1_000_000) * cost_per_1m_completion
)

print(f"7-day token usage:")
print(f"  Prompt tokens:     {total_prompt_tokens:,}")
print(f"  Completion tokens: {total_completion_tokens:,}")
print(f"  Total tokens:      {total_tokens:,}")
print(f"  Estimated cost:    ${estimated_cost:.4f}")
```

### Querying Traces Programmatically

```python
from langsmith import Client
from datetime import datetime, timedelta

client = Client()

# Find all failed runs in the last 24 hours
failed_runs = client.list_runs(
    project_name="my-app-production",
    start_time=datetime.now() - timedelta(hours=24),
    error=True,
)

for run in failed_runs:
    print(f"Run ID: {run.id}")
    print(f"Error: {run.error}")
    print(f"Input: {run.inputs}")
    print("---")

# Find slow runs (latency > 10 seconds)
slow_runs = client.list_runs(
    project_name="my-app-production",
    filter='gt(latency, 10)',
    limit=50
)

# Find runs with low user feedback
bad_runs = client.list_runs(
    project_name="my-app-production",
    filter='and(eq(feedback_key, "user_rating"), eq(feedback_score, 0))',
)
```

---

## LangSmith with FastAPI

### Full Production-Ready Integration

```python
import os
import uuid
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langsmith import Client

# --- Configuration ---
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_PROJECT"] = "fastapi-production"

langsmith_client = Client()

# --- App Setup ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize chain
    app.state.llm = ChatOpenAI(model="gpt-4o-mini", streaming=False)
    app.state.prompt = ChatPromptTemplate.from_template(
        "You are a helpful assistant. Answer this: {question}"
    )
    app.state.chain = app.state.prompt | app.state.llm | StrOutputParser()
    yield
    # Shutdown: nothing to clean up for LangSmith (async flushing)

app = FastAPI(lifespan=lifespan)

# --- Models ---
class QuestionRequest(BaseModel):
    question: str
    user_id: Optional[str] = None
    session_id: Optional[str] = None

class AnswerResponse(BaseModel):
    answer: str
    run_id: str

class FeedbackRequest(BaseModel):
    run_id: str
    score: float    # 0.0 = bad, 1.0 = good
    comment: Optional[str] = None

# --- Endpoints ---
@app.post("/ask", response_model=AnswerResponse)
async def ask_question(request: QuestionRequest):
    run_id = str(uuid.uuid4())

    try:
        answer = app.state.chain.invoke(
            {"question": request.question},
            config={
                "run_id": run_id,
                "tags": ["api", "production"],
                "metadata": {
                    "user_id": request.user_id,
                    "session_id": request.session_id,
                    "endpoint": "/ask",
                },
                "run_name": "customer-question",
            }
        )
        return AnswerResponse(answer=answer, run_id=run_id)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/feedback")
async def submit_feedback(
    feedback: FeedbackRequest,
    background_tasks: BackgroundTasks
):
    """Submit user feedback for a run — done in background to not block response."""
    def _submit():
        langsmith_client.create_feedback(
            run_id=feedback.run_id,
            key="user_rating",
            score=feedback.score,
            comment=feedback.comment,
        )

    background_tasks.add_task(_submit)
    return {"status": "feedback queued"}


@app.get("/health")
async def health():
    return {"status": "ok", "tracing": bool(os.getenv("LANGCHAIN_TRACING_V2"))}
```

### Async Tracing with FastAPI

```python
from langsmith import traceable
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage

@traceable(name="async-llm-call", run_type="llm")
async def async_llm_call(question: str) -> str:
    llm = ChatOpenAI(model="gpt-4o-mini")
    response = await llm.ainvoke([HumanMessage(content=question)])
    return response.content

@app.post("/async-ask")
async def async_ask(request: QuestionRequest):
    answer = await async_llm_call(request.question)
    return {"answer": answer}
```

---

## Best Practices

### 1. Project Naming Strategy

```
my-app-development      ← exploration and debugging
my-app-staging          ← pre-production testing
my-app-production       ← live user traffic
my-app-evals            ← evaluation runs (keep separate)
my-app-experiments      ← A/B test runs
```

### 2. Metadata Standards

Define a consistent metadata schema across your team:

```python
STANDARD_METADATA = {
    "app_version": "2.1.0",
    "model": "gpt-4o-mini",
    "prompt_version": "v3",
    "environment": "production",
    "feature": "customer-support",
    "user_tier": "premium",
}

# Always include in config
config = {"metadata": STANDARD_METADATA, "tags": ["production"]}
chain.invoke(inputs, config=config)
```

### 3. Tagging Convention

```python
# Use consistent tag taxonomy
TAGS = [
    "env:production",       # environment
    "feature:rag",          # feature area
    "model:gpt-4o-mini",    # model used
    "prompt:v3",            # prompt version
]
```

### 4. Never Log PII

```python
import hashlib

def anonymize_user_id(user_id: str) -> str:
    """Hash user IDs before sending to LangSmith."""
    return hashlib.sha256(user_id.encode()).hexdigest()[:16]

config = {
    "metadata": {
        "user_id": anonymize_user_id(real_user_id),  # never raw PII
    }
}
```

### 5. Trace Only What Matters

```python
# Good: trace business-logic chains
@traceable(name="answer-customer-question")
def answer_question(question: str) -> str: ...

# Don't trace: trivial utility functions
def clean_whitespace(text: str) -> str:
    return " ".join(text.split())  # no @traceable needed here
```

### 6. Regression Testing on Every Deploy

```yaml
# .github/workflows/deploy.yml (example CI step)
- name: Run LangSmith Regression Tests
  run: |
    uv run python eval/run_evals.py \
      --dataset customer-support-qa-v1 \
      --experiment-prefix ci-${GITHUB_SHA::8} \
      --fail-threshold 0.85
```

```python
# eval/run_evals.py
from langsmith import evaluate, Client
import sys

client = Client()

results = evaluate(
    app_under_test,
    data="customer-support-qa-v1",
    evaluators=[correctness_evaluator, helpfulness_evaluator],
    experiment_prefix=f"ci-{git_sha}",
)

# Fail CI if average score drops below threshold
avg_score = results.to_pandas()["feedback.correctness"].mean()
if avg_score < 0.85:
    print(f"FAIL: Average correctness {avg_score:.2f} < threshold 0.85")
    sys.exit(1)

print(f"PASS: Average correctness {avg_score:.2f}")
```

### 7. Use Datasets from Production Traces

```
Development cycle:

Production traces
      │
      ▼  (curate good examples)
  Dataset
      │
      ▼  (run evals)
  Experiment Results
      │
      ▼  (compare before/after)
  Deployment Decision
```

---

## Common Pitfalls & Solutions

### Pitfall 1: Traces Not Appearing

**Symptom**: You set up tracing but see no traces in LangSmith.

**Solutions:**
```bash
# 1. Verify env vars are set
echo $LANGCHAIN_TRACING_V2     # should print "true"
echo $LANGSMITH_API_KEY        # should print "ls__..."
echo $LANGCHAIN_PROJECT        # should print your project name

# 2. Check API key validity
python -c "from langsmith import Client; c = Client(); list(c.list_projects())"

# 3. LangSmith sends traces asynchronously — add a small wait in scripts
```

```python
import time

# In short-lived scripts, flush before exit
chain.invoke(inputs)
time.sleep(1)   # allow async background flush to complete
```

### Pitfall 2: Missing Child Runs

**Symptom**: Only top-level run appears; nested steps are missing.

**Solution:** Ensure all nested calls are within the same context:

```python
# Wrong: creating child runs outside trace context
result = top_level_function()           # trace starts here
helper_function()                       # this won't be a child

# Correct: call helpers inside traced function
@traceable
def top_level_function():
    result = helper_function()          # now this is a child run
    return result
```

### Pitfall 3: High Costs from Over-Tracing

**Symptom**: LangSmith usage bill is high; massive trace volume.

**Solutions:**
```python
# 1. Sampling
os.environ["LANGSMITH_SAMPLING_RATE"] = "0.05"   # 5% sampling

# 2. Disable in development for local experimentation
os.environ["LANGCHAIN_TRACING_V2"] = "false"

# 3. Use filter to only trace slow or failed runs
# (done with OnErrorCallback or custom wrappers)
```

### Pitfall 4: Evaluation Flakiness

**Symptom**: LLM-as-judge evaluators give inconsistent scores.

**Solutions:**
```python
# Always use temperature=0 for judge LLMs
judge_llm = ChatOpenAI(model="gpt-4o", temperature=0)

# Provide very explicit, binary rubrics
criteria = {
    "correctness": (
        "Does the response correctly answer the question based only on the "
        "provided context? Answer only YES (score 1) or NO (score 0). "
        "Do not consider style, grammar, or length."
    )
}

# Run evals multiple times and average (reduces variance)
results_1 = evaluate(app, data=dataset, evaluators=[eval], experiment_prefix="run1")
results_2 = evaluate(app, data=dataset, evaluators=[eval], experiment_prefix="run2")
```

### Pitfall 5: Long-Running Traces Timing Out

**Symptom**: Traces for long-running tasks are cut off or missing.

**Solution:**
```python
from langsmith import traceable

@traceable(name="long-running-pipeline")
def long_pipeline(docs: list[str]) -> list[str]:
    results = []
    for doc in docs:
        # Each iteration creates a child run — helps partial recovery
        result = process_single_doc(doc)
        results.append(result)
    return results

@traceable(name="process-single-doc")
def process_single_doc(doc: str) -> str:
    return chain.invoke({"document": doc})
```

---

## Quick Reference

### Environment Variables

| Variable                     | Purpose                                    | Default                                    |
|------------------------------|--------------------------------------------|--------------------------------------------|
| `LANGSMITH_API_KEY`          | Authentication                             | Required                                   |
| `LANGCHAIN_TRACING_V2`       | Enable auto-tracing                        | `false`                                    |
| `LANGCHAIN_PROJECT`          | Project/bucket for traces                  | `default`                                  |
| `LANGCHAIN_ENDPOINT`         | LangSmith API URL                          | `https://api.smith.langchain.com`          |
| `LANGSMITH_SAMPLING_RATE`    | Fraction of runs to trace (0.0–1.0)        | `1.0`                                      |
| `LANGCHAIN_HIDE_INPUTS`      | Redact all run inputs                      | `false`                                    |
| `LANGCHAIN_HIDE_OUTPUTS`     | Redact all run outputs                     | `false`                                    |

### Key SDK Methods

```python
from langsmith import Client, traceable, evaluate, trace

client = Client()

# Projects
client.list_projects()
client.read_project(project_name="my-project")

# Runs
client.list_runs(project_name=..., filter=..., limit=...)
client.read_run(run_id=...)
client.update_run(run_id=..., end_time=..., outputs=...)

# Datasets
client.create_dataset(dataset_name=..., description=...)
client.list_datasets()
client.create_examples(inputs=[...], outputs=[...], dataset_id=...)
client.list_examples(dataset_name=...)

# Feedback
client.create_feedback(run_id=..., key=..., score=..., comment=...)
client.list_feedback(run_ids=[...])

# Prompts
client.push_prompt(name, object=prompt)
client.pull_prompt(name)

# Evaluation
evaluate(target_fn, data=dataset, evaluators=[...], experiment_prefix=...)
```

---

## Summary

LangSmith transforms AI application development from "deploy and hope" to a rigorous engineering discipline:

```
Without LangSmith                   With LangSmith
──────────────────────────────────────────────────────────
"Why is the bot giving bad answers?" → Inspect exact inputs/outputs
"Did my prompt change break things?" → Run eval suite against dataset
"How much are we spending on GPT?"  → Real-time token cost dashboard
"Users say it's slow sometimes"     → P95 latency charts, slow run filter
"Which version of the prompt works?"→ A/B test via experiments
"Was that response hallucinated?"   → Human annotation queue
```

**Key Takeaways:**
1. Enable `LANGCHAIN_TRACING_V2=true` — LangChain apps are traced with zero code changes
2. Use `@traceable` to trace any non-LangChain Python code
3. Build datasets from production traces to create realistic test sets
4. Run evaluations on every significant code or prompt change
5. Use structured metadata and tags for powerful filtering
6. Set up sampling in production to control observability costs
7. Attach human feedback via `client.create_feedback()` to close the loop
