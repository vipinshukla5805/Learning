"""
Demo 06: LangSmith Datasets & Automated Evaluation

This demo shows how to use LangSmith to systematically evaluate LLM
application quality — going beyond one-off manual testing.

Topics covered:
1. Creating a LangSmith dataset from example input/output pairs
2. Defining a target function (the LLM pipeline under test)
3. Writing custom evaluators that score each output
4. Using the built-in LLM-as-a-judge evaluator pattern
5. Running evaluate() to execute all examples and collect scores
6. Fetching and displaying experiment results

Why evaluation matters:
- Manual testing doesn't scale past a few examples
- Datasets let you regression-test after every model/prompt change
- Automated evaluators give you consistent, reproducible scores
- LangSmith stores results so you can compare experiments over time
"""

import os
import uuid
import statistics
from typing import Any
from dotenv import load_dotenv
from langsmith import Client, evaluate
from langsmith.evaluation import EvaluationResult
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# ============================================================================
# SETUP
# ============================================================================

load_dotenv()

if not os.getenv("OPENAI_API_KEY"):
    raise EnvironmentError("OPENAI_API_KEY is not set. See .env.example.")
if not os.getenv("LANGSMITH_API_KEY"):
    raise EnvironmentError(
        "LANGSMITH_API_KEY is not set. Evaluation requires LangSmith."
    )

client = Client()
MODEL = "gpt-4o-mini"
PROJECT = os.getenv("LANGSMITH_PROJECT", "observability-demos")

print("=" * 70)
print("DEMO 06: LANGSMITH DATASETS & AUTOMATED EVALUATION")
print("=" * 70)
print()

# ============================================================================
# STEP 1: CREATE A DATASET
# ============================================================================

print("── STEP 1: Create dataset ───────────────────────────────────────────")
print()

# Each example has inputs (what we send to the pipeline) and
# outputs (the expected / reference answer).
EXAMPLES = [
    {
        "inputs": {"question": "What does LangSmith do?"},
        "outputs": {
            "answer": (
                "LangSmith is an observability and evaluation platform for "
                "LLM applications that helps teams debug, test, and monitor "
                "their AI systems."
            )
        },
    },
    {
        "inputs": {"question": "What is RAG?"},
        "outputs": {
            "answer": (
                "RAG (Retrieval-Augmented Generation) is a technique that "
                "retrieves relevant documents from a knowledge base and "
                "injects them into the LLM prompt to ground its answers."
            )
        },
    },
    {
        "inputs": {"question": "What is a vector database?"},
        "outputs": {
            "answer": (
                "A vector database stores high-dimensional embeddings and "
                "supports efficient similarity search, enabling semantic "
                "retrieval in AI applications."
            )
        },
    },
    {
        "inputs": {"question": "What is prompt engineering?"},
        "outputs": {
            "answer": (
                "Prompt engineering is the practice of designing and refining "
                "prompts to elicit better, more accurate, and more reliable "
                "responses from language models."
            )
        },
    },
    {
        "inputs": {"question": "What are LLM hallucinations?"},
        "outputs": {
            "answer": (
                "LLM hallucinations are outputs where the model generates "
                "plausible-sounding but factually incorrect or fabricated "
                "information."
            )
        },
    },
]

# Use a unique dataset name so re-runs don't collide
DATASET_NAME = f"ai-concepts-qa-{uuid.uuid4().hex[:8]}"

print(f"   Creating dataset: '{DATASET_NAME}'")
dataset = client.create_dataset(
    dataset_name=DATASET_NAME,
    description="QA examples for AI/ML concepts — demo 06",
)

# Upload examples to the dataset
client.create_examples(
    dataset_id=dataset.id,
    examples=EXAMPLES,
)
print(f"   Uploaded {len(EXAMPLES)} examples")
print()

# ============================================================================
# STEP 2: DEFINE THE TARGET FUNCTION (pipeline under test)
# ============================================================================

print("── STEP 2: Define target function ──────────────────────────────────")
print()
print("   The target function is what we're evaluating.")
print("   evaluate() calls it once per dataset example.")
print()

llm = ChatOpenAI(model=MODEL, temperature=0)

qa_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a knowledgeable AI assistant. "
            "Answer questions about AI, ML, and software engineering "
            "concisely and accurately in 2-3 sentences.",
        ),
        ("human", "{question}"),
    ]
)
qa_chain = qa_prompt | llm | StrOutputParser()


def target(inputs: dict) -> dict:
    """
    The function under test.

    LangSmith evaluate() passes each example's 'inputs' dict here.
    The returned dict is passed to each evaluator alongside the
    reference 'outputs' from the dataset.
    """
    answer = qa_chain.invoke({"question": inputs["question"]})
    return {"answer": answer}


# ============================================================================
# STEP 3: DEFINE EVALUATORS
# ============================================================================

print("── STEP 3: Define evaluators ────────────────────────────────────────")
print()
print("   Three evaluators: length check · keyword overlap · LLM-as-judge")
print()


# --- Evaluator 1: Length check (heuristic) ---

def evaluate_response_length(run, example) -> EvaluationResult:
    """
    Score 1 if the answer is between 10 and 150 words, else 0.
    This is a simple heuristic to catch empty or runaway responses.
    """
    answer = (run.outputs or {}).get("answer", "")
    word_count = len(answer.split())
    score = 1 if 10 <= word_count <= 150 else 0
    return EvaluationResult(
        key="length_ok",
        score=score,
        comment=f"{word_count} words",
    )


# --- Evaluator 2: Keyword overlap (lightweight) ---

def evaluate_keyword_overlap(run, example) -> EvaluationResult:
    """
    Measure what fraction of 'important' words from the reference answer
    appear in the generated answer. Score in [0, 1].

    This is a lightweight proxy for factual coverage — not a replacement
    for semantic similarity, but fast and transparent.
    """
    reference = (example.outputs or {}).get("answer", "")
    generated = (run.outputs or {}).get("answer", "")

    # Filter to 'content' words (len > 4) from the reference
    ref_words = {w.lower().strip(".,;:") for w in reference.split() if len(w) > 4}
    gen_words = {w.lower().strip(".,;:") for w in generated.split() if len(w) > 4}

    if not ref_words:
        return EvaluationResult(key="keyword_overlap", score=1.0)

    overlap = len(ref_words & gen_words) / len(ref_words)
    return EvaluationResult(
        key="keyword_overlap",
        score=round(overlap, 3),
        comment=f"{len(ref_words & gen_words)}/{len(ref_words)} ref keywords matched",
    )


# --- Evaluator 3: LLM-as-judge (semantic) ---

judge_llm = ChatOpenAI(model=MODEL, temperature=0)
judge_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a strict but fair evaluator. "
            "Score the generated answer on a scale of 0 to 1 based on "
            "factual correctness and completeness compared to the reference.\n"
            "Reply with ONLY a number between 0 and 1 (e.g. 0.8). No explanation.",
        ),
        (
            "human",
            "Question: {question}\n\nReference answer: {reference}\n\nGenerated answer: {generated}",
        ),
    ]
)
judge_chain = judge_prompt | judge_llm | StrOutputParser()


def evaluate_correctness(run, example) -> EvaluationResult:
    """
    Use an LLM to judge factual correctness (0–1 scale).

    This 'LLM-as-judge' pattern is the most powerful evaluator
    but also the most expensive (an extra LLM call per example).
    """
    question = (example.inputs or {}).get("question", "")
    reference = (example.outputs or {}).get("answer", "")
    generated = (run.outputs or {}).get("answer", "")

    try:
        score_str = judge_chain.invoke(
            {"question": question, "reference": reference, "generated": generated}
        ).strip()
        score = float(score_str)
        score = max(0.0, min(1.0, score))  # clamp to [0, 1]
    except (ValueError, Exception) as exc:
        print(f"   Judge error: {exc}")
        score = 0.5  # fallback

    return EvaluationResult(
        key="llm_correctness",
        score=round(score, 3),
    )


# ============================================================================
# STEP 4: RUN EVALUATION
# ============================================================================

print("── STEP 4: Run evaluation ───────────────────────────────────────────")
print()
print(f"   Running {len(EXAMPLES)} examples × 3 evaluators…")
print()

EXPERIMENT_NAME = f"eval-run-{uuid.uuid4().hex[:6]}"

results = evaluate(
    target,
    data=DATASET_NAME,
    evaluators=[
        evaluate_response_length,
        evaluate_keyword_overlap,
        evaluate_correctness,
    ],
    experiment_prefix=EXPERIMENT_NAME,
    metadata={"model": MODEL, "demo": "demo-06"},
)

print()

# ============================================================================
# STEP 5: DISPLAY RESULTS
# ============================================================================

print("── STEP 5: Results ─────────────────────────────────────────────────")
print()

scores_by_key: dict[str, list[float]] = {}

for result in results:
    run = result.get("run")
    example = result.get("example")
    eval_results = result.get("evaluation_results", {}).get("results", [])

    question = (example.inputs or {}).get("question", "?") if example else "?"
    answer = (run.outputs or {}).get("answer", "") if run else ""

    print(f"   Q: {question}")
    print(f"   A: {answer[:100]}{'…' if len(answer) > 100 else ''}")

    for er in eval_results:
        key = er.key
        score = er.score
        comment = er.comment or ""
        scores_by_key.setdefault(key, []).append(score if score is not None else 0)
        print(f"      {key}: {score:.3f}  {comment}")
    print()

# Aggregate
print("   Aggregate scores:")
for key, scores in sorted(scores_by_key.items()):
    avg = statistics.mean(scores)
    print(f"      {key}: avg = {avg:.3f}  (n={len(scores)})")

print()
print("=" * 70)
print("DONE — view detailed experiment results in LangSmith:")
print(f"   Project : {PROJECT}")
print(f"   Experiment: {EXPERIMENT_NAME}")
print("   URL: https://smith.langchain.com")
print()
print("   Next steps:")
print("   1. Change the system prompt and re-run to compare experiments")
print("   2. Add more examples to the dataset from production traces")
print("   3. Set up CI to run evaluate() on every code change")
print("=" * 70)
