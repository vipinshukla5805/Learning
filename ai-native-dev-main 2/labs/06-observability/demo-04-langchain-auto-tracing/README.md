# Demo 04: LangChain Auto-Tracing with LangSmith

LangChain has built-in LangSmith integration — set one environment variable and every chain, agent, and tool call is automatically traced with zero code changes.

## What You'll Learn

- How `LANGSMITH_TRACING=true` activates automatic tracing for all LangChain components
- What the trace hierarchy looks like for LCEL chains (`prompt | llm | parser`)
- Tracing multi-step sequential chains with intermediate outputs visible at each step
- Agent step-level tracing: thought → tool call → observation → final answer
- Combining `@traceable` with LangChain chains to add business-logic context

## What's Inside

| File           | Purpose                                                                           |
| -------------- | --------------------------------------------------------------------------------- |
| `main.py`      | Five demos: LLM call · LCEL chain · sequential chain · agent · mixed `@traceable` |
| `.env.example` | Template for credentials                                                          |

## Quick Start

```bash
uv sync
cp .env.example .env   # add LANGSMITH_API_KEY and OPENAI_API_KEY
uv run python main.py
```

## How Auto-Tracing Works

Setting `LANGSMITH_TRACING=true` causes LangChain to attach a `LangChainTracer` callback to every runnable. No imports or decorators required.

```
# .env
LANGSMITH_TRACING=true
LANGSMITH_API_KEY=ls__...
LANGSMITH_PROJECT=observability-demos
```

## LCEL Trace Hierarchy

For a chain `prompt | llm | parser`, LangSmith creates:

```
RunnableSequence          ← top-level chain run
  ├── ChatPromptTemplate  ← formats the prompt
  ├── ChatOpenAI          ← LLM call (tokens, latency recorded)
  └── StrOutputParser     ← parses the string output
```

## Agent Trace Hierarchy

```
AgentExecutor             ← overall task run
  ├── ChatOpenAI          ← planning (decides which tool to call)
  ├── get_word_count      ← tool execution
  ├── ChatOpenAI          ← planning (interprets result)
  └── ChatOpenAI          ← final answer generation
```

## Mixing `@traceable` with LangChain

```python
@traceable(name="my_pipeline", tags=["production"])
def my_pipeline(user_input: str) -> str:
    # LangChain chain inside @traceable
    return chain.invoke({"input": user_input})
```

Result in LangSmith:

```
my_pipeline               ← @traceable parent
  └── RunnableSequence    ← LangChain chain (auto-traced)
        ├── ChatPromptTemplate
        └── ChatOpenAI
```
