# Demo 02: Tracing OpenAI API Calls with LangSmith

Capture every OpenAI call — including full prompts, completions, token counts, and latency — as structured runs in LangSmith with minimal code changes.

## What You'll Learn

- Two patterns for tracing OpenAI calls: `wrap_openai` vs `@traceable`
- Automatic capture of model name, temperature, token usage
- Building trace hierarchies for multi-step LLM pipelines
- Tracing multi-turn conversations as a single run

## What's Inside

| File           | Purpose                                                              |
| -------------- | -------------------------------------------------------------------- |
| `main.py`      | Three patterns: `wrap_openai`, `@traceable` wrapper, multi-turn chat |
| `.env.example` | Template for LangSmith + OpenAI credentials                          |

## Quick Start

### 1. Install Dependencies

```bash
uv sync
```

### 2. Configure Credentials

```bash
cp .env.example .env
# Fill in LANGSMITH_API_KEY and OPENAI_API_KEY
```

### 3. Run the Demo

```bash
uv run python main.py
```

### 4. View Traces

Open <https://smith.langchain.com> → **observability-demos** project.

## Tracing Patterns

### Pattern A — `wrap_openai` (zero-intrusion)

```python
from langsmith.wrappers import wrap_openai
from openai import OpenAI

client = wrap_openai(OpenAI())  # one-time setup

# All subsequent calls are automatically traced
response = client.chat.completions.create(...)
```

Best for: Drop-in tracing of existing code with **no other changes**.

### Pattern B — `@traceable` wrapper

```python
from langsmith import traceable

@traceable(name="summarize_text", tags=["summarization"])
def summarize(text: str) -> str:
    response = openai_client.chat.completions.create(...)
    return response.choices[0].message.content
```

Best for: Grouping **business-logic inputs/outputs** with the underlying LLM call.

### Trace Hierarchy

```
summarize_text          ← parent run (records `text` input + final summary)
  └── ChatOpenAI        ← child run (records full prompt, completion, tokens)
```

## What LangSmith Records Automatically

| Field                              | Captured? |
| ---------------------------------- | --------- |
| Full system + user messages        | ✅        |
| Model response text                | ✅        |
| Model name (`gpt-4o-mini`)         | ✅        |
| Temperature / max_tokens           | ✅        |
| Prompt / completion / total tokens | ✅        |
| Latency (ms)                       | ✅        |
| Errors & tracebacks                | ✅        |
