# Demo 01: LangSmith Basics — Setup & `@traceable`

Learn how to instrument any Python function with LangSmith observability in minutes — no LangChain required.

## What You'll Learn

- What LangSmith is and why AI observability matters in production
- How to set up a LangSmith account and obtain an API key
- Using the `@traceable` decorator to trace function calls automatically
- Building nested parent/child trace hierarchies
- Attaching tags and metadata to filter and organise traces
- Using the `Client` to query runs programmatically

## What's Inside

| File             | Purpose                                                                          |
| ---------------- | -------------------------------------------------------------------------------- |
| `main.py`        | Four progressive demos: simple trace → nested trace → tags/metadata → client API |
| `.env.example`   | Template for LangSmith credentials                                               |
| `pyproject.toml` | Project dependencies                                                             |

## Prerequisites

1. **LangSmith account** — sign up free at <https://smith.langchain.com>
2. **API key** — Settings → API Keys → Create API Key

## Quick Start

### 1. Install Dependencies

```bash
uv sync
```

### 2. Configure Credentials

```bash
cp .env.example .env
# Edit .env and add your LANGSMITH_API_KEY
```

### 3. Run the Demo

```bash
uv run python main.py
```

### 4. View Traces

Open <https://smith.langchain.com> → select the **observability-demos** project → explore runs.

## Key Concepts

### `@traceable` Decorator

```python
from langsmith import traceable

@traceable(name="my_function")
def my_function(x: int) -> int:
    return x * 2
```

Every call to `my_function` automatically creates a run in LangSmith that records:

- **Inputs & outputs** with full values
- **Latency** (start/end timestamps)
- **Errors** if the function raises
- **Parent run** link when called inside another `@traceable`

### Nesting

When one `@traceable` function calls another, LangSmith automatically builds a tree:

```
calculate_expression          ← parent
  ├── add_numbers             ← child
  └── multiply_numbers        ← child
```

### Tags & Metadata

```python
@traceable(tags=["nlp"], metadata={"model": "v1"})
def classify(text): ...
```

- **Tags** are searchable strings useful for filtering runs by category.
- **Metadata** are arbitrary key/value pairs stored with each run.

## Environment Variables

| Variable            | Required         | Description                       |
| ------------------- | ---------------- | --------------------------------- |
| `LANGSMITH_API_KEY` | Yes              | Authentication key from LangSmith |
| `LANGSMITH_TRACING` | Yes (set `true`) | Enables/disables tracing          |
| `LANGSMITH_PROJECT` | Recommended      | Project name in LangSmith UI      |
