# Demo 06: LangSmith Datasets & Automated Evaluation

Move beyond manual spot-checking — build a repeatable evaluation harness that scores your LLM pipeline on every example in a curated dataset.

## What You'll Learn

- Creating LangSmith datasets with input/reference output pairs
- Writing a **target function** — the pipeline under test
- Building three types of evaluators:
  - Heuristic evaluator (response length check)
  - Lightweight evaluator (keyword overlap with reference)
  - LLM-as-judge evaluator (semantic correctness via GPT)
- Running `evaluate()` to execute all examples and collect scores
- Fetching and interpreting results from an experiment run

## What's Inside

| File           | Purpose                                                              |
| -------------- | -------------------------------------------------------------------- |
| `main.py`      | Full evaluation pipeline: dataset → target fn → evaluators → results |
| `.env.example` | Template for credentials                                             |

## Quick Start

```bash
uv sync
cp .env.example .env   # add LANGSMITH_API_KEY and OPENAI_API_KEY
uv run python main.py
```

## Evaluation Flow

```
Dataset (input/reference pairs)
         ↓
   evaluate(target_fn, data, evaluators)
         ↓  (for each example)
   target_fn(inputs) → outputs
         ↓
   evaluator_1(run, example) → score
   evaluator_2(run, example) → score
   evaluator_3(run, example) → score
         ↓
   Experiment stored in LangSmith
```

## Evaluator Types

| Type                                   | Speed | Cost       | Use when                              |
| -------------------------------------- | ----- | ---------- | ------------------------------------- |
| Heuristic (e.g. length check)          | Fast  | Free       | Catch clearly bad outputs             |
| Reference comparison (keyword overlap) | Fast  | Free       | Factual coverage check                |
| LLM-as-judge                           | Slow  | LLM tokens | Semantic correctness, nuanced quality |

## LLM-as-Judge Pattern

```python
def evaluate_correctness(run, example) -> EvaluationResult:
    score_str = judge_chain.invoke({
        "question": example.inputs["question"],
        "reference": example.outputs["answer"],
        "generated": run.outputs["answer"],
    })
    return EvaluationResult(key="llm_correctness", score=float(score_str))
```

## Comparing Experiments

After your first run, change the system prompt and call `evaluate()` again with a different `experiment_prefix`. LangSmith lets you compare the two experiments side by side:

```
Experiment A (original prompt)  →  avg correctness: 0.72
Experiment B (improved prompt)  →  avg correctness: 0.85  ✅
```

## Scaling Up

- **Add examples from production:** Click any trace in LangSmith → "Add to dataset"
- **Run in CI:** Call `evaluate()` in your test suite after every prompt change
- **Custom metrics:** Add evaluators for hallucination rate, conciseness, safety, etc.
