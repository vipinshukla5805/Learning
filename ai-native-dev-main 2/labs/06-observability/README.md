# 06 — Observability with LangSmith

End-to-end observability for LLM applications — from basic function tracing to production-grade evaluation — using **LangSmith**.

## Why Observability Matters

LLMs are non-deterministic. Without observability you can't know:

- Why a model gave a wrong answer
- Which part of a pipeline is slow or expensive
- Whether a prompt change improved or regressed quality
- What a real user actually sent and received

LangSmith solves all of these by capturing structured traces for every run.

---

## Demo Progression

| Demo                                                                          | Topic                  | Key Skills                                                 |
| ----------------------------------------------------------------------------- | ---------------------- | ---------------------------------------------------------- |
| [demo-01-langsmith-basics](demo-01-langsmith-basics/)                         | Setup & `@traceable`   | Account setup, decorator usage, nested traces, metadata    |
| [demo-02-openai-tracing](demo-02-openai-tracing/)                             | OpenAI call tracing    | `wrap_openai`, `@traceable` + OpenAI, multi-turn chat      |
| [demo-03-custom-metadata-and-feedback](demo-03-custom-metadata-and-feedback/) | Metadata & feedback    | `get_current_run_tree()`, user feedback API, error tracing |
| [demo-04-langchain-auto-tracing](demo-04-langchain-auto-tracing/)             | LangChain auto-tracing | `LANGSMITH_TRACING=true`, LCEL chains, agents              |
| [demo-05-rag-pipeline-observability](demo-05-rag-pipeline-observability/)     | RAG observability      | Ingestion + retrieval + generation traces, debugging       |
| [demo-06-langsmith-evaluation](demo-06-langsmith-evaluation/)                 | Evaluation             | Datasets, custom evaluators, LLM-as-judge, experiments     |

---

## Prerequisites

### 1. LangSmith Account

Sign up free at <https://smith.langchain.com>.

### 2. LangSmith API Key

Settings → API Keys → Create API Key.

### 3. OpenAI API Key

Required for demos 02–06. Get one at <https://platform.openai.com>.

### 4. Python 3.12 + uv

```bash
# Install uv if not already installed
curl -LsSf https://astral.sh/uv/install.sh | sh
```

---

## Quick Start (any demo)

```bash
cd demo-01-langsmith-basics   # or any demo folder
uv sync                        # install dependencies
cp .env.example .env           # copy credentials template
# Edit .env — add LANGSMITH_API_KEY (and OPENAI_API_KEY for demos 02-06)
uv run python main.py          # run the demo
```

Then open <https://smith.langchain.com> to see your traces.

---

## Environment Variables

Every demo uses these variables (configured in `.env`):

| Variable            | Required     | Description                    |
| ------------------- | ------------ | ------------------------------ |
| `LANGSMITH_API_KEY` | Yes          | Authentication for LangSmith   |
| `LANGSMITH_TRACING` | Yes (`true`) | Enables/disables trace capture |
| `LANGSMITH_PROJECT` | Recommended  | Groups traces by project name  |
| `OPENAI_API_KEY`    | demos 02–06  | OpenAI API access              |

---

## Learning Path

```
demo-01  →  demo-02  →  demo-03         (no LangChain needed)
                              ↓
                         demo-04         (LangChain basics)
                              ↓
                         demo-05         (RAG with full tracing)
                              ↓
                         demo-06         (evaluation & CI)
```

Start from demo-01 if you are new to LangSmith. Jump directly to demo-04 or demo-05 if you are already using LangChain and want to add observability quickly.

---

## Key Concepts Quick Reference

| Concept              | How to use                                                                |
| -------------------- | ------------------------------------------------------------------------- |
| Trace a function     | `@traceable` decorator                                                    |
| Trace OpenAI calls   | `wrap_openai(OpenAI())`                                                   |
| Auto-trace LangChain | `LANGSMITH_TRACING=true` in env                                           |
| Add metadata         | `@traceable(metadata={...})` or `get_current_run_tree().metadata = {...}` |
| Add tags             | `@traceable(tags=["tag1", "tag2"])`                                       |
| Submit feedback      | `client.create_feedback(run_id, key, score)`                              |
| Create dataset       | `client.create_dataset(...)` + `client.create_examples(...)`              |
| Run evaluation       | `evaluate(target_fn, data=dataset_name, evaluators=[...])`                |
