"""
Demo 01: LangSmith Basics - Setup & @traceable Decorator

This demo introduces:
- What is LangSmith and why observability matters
- Setting up LangSmith credentials (API key, project)
- Using the @traceable decorator to trace Python functions
- Viewing traces in the LangSmith UI
- Nesting traces to capture a full call hierarchy
- Adding run metadata and tags

Key Concepts:
- LangSmith tracing with @traceable
- Automatic parent/child run hierarchy
- Metadata and tags for filtering traces
- LangSmith Client for programmatic access
"""

import os
from dotenv import load_dotenv
from langsmith import traceable, Client

# ============================================================================
# ENVIRONMENT SETUP
# ============================================================================

load_dotenv()

# Verify required environment variables
required_vars = ["LANGSMITH_API_KEY"]
for var in required_vars:
    if not os.getenv(var):
        print(f"⚠️  WARNING: {var} is not set. Tracing will be disabled.")
        print("   Copy .env.example to .env and fill in your credentials.\n")

# LangSmith tracing is controlled by environment variables:
#   LANGSMITH_TRACING=true           → enables tracing
#   LANGSMITH_API_KEY=<your key>     → authenticates with LangSmith
#   LANGSMITH_PROJECT=<project name> → groups traces into a project

print("=" * 70)
print("DEMO 01: LANGSMITH BASICS — SETUP & @traceable")
print("=" * 70)
print()

# ============================================================================
# DEMO 1: SIMPLE @traceable FUNCTION
# ============================================================================

print("── DEMO 1: Simple @traceable function ──────────────────────────────")
print()


@traceable(name="add_numbers")
def add(a: float, b: float) -> float:
    """Add two numbers together.

    The @traceable decorator automatically:
    - Creates a run in LangSmith when this function is called
    - Records the inputs (a, b) and output (result)
    - Records start/end time and latency
    - Links to any parent run if called inside another @traceable function
    """
    result = a + b
    print(f"   add({a}, {b}) = {result}")
    return result


@traceable(name="multiply_numbers")
def multiply(a: float, b: float) -> float:
    """Multiply two numbers."""
    result = a * b
    print(f"   multiply({a}, {b}) = {result}")
    return result


result_add = add(3, 5)
result_mul = multiply(4, 7)
print()

# ============================================================================
# DEMO 2: NESTED TRACES (parent/child hierarchy)
# ============================================================================

print("── DEMO 2: Nested traces ────────────────────────────────────────────")
print()


@traceable(name="calculate_expression")
def calculate_expression(x: float, y: float, z: float) -> dict:
    """
    Compute (x + y) * z — calling two @traceable helpers.

    In LangSmith you will see:
      calculate_expression          ← parent run
        ├── add_numbers             ← child run
        └── multiply_numbers        ← child run

    This hierarchy is captured automatically because nested @traceable
    calls propagate the run context.
    """
    print(f"   Computing ({x} + {y}) * {z}")
    sum_result = add(x, y)           # child trace 1
    final = multiply(sum_result, z)  # child trace 2
    return {"input": (x, y, z), "result": final}


output = calculate_expression(2, 3, 10)
print(f"   Result: {output['result']}")
print()

# ============================================================================
# DEMO 3: TAGS AND METADATA
# ============================================================================

print("── DEMO 3: Tags & metadata ──────────────────────────────────────────")
print()


@traceable(
    name="classify_sentiment",
    tags=["nlp", "classification"],
    metadata={"version": "1.0", "model": "rule-based"},
)
def classify_sentiment(text: str) -> str:
    """
    A rule-based sentiment classifier.

    Tags allow you to filter traces in the LangSmith UI by category.
    Metadata stores key/value pairs attached to the run.
    """
    positive_words = {"great", "good", "excellent", "happy", "love", "wonderful"}
    negative_words = {"bad", "terrible", "hate", "awful", "horrible", "sad"}

    words = set(text.lower().split())
    pos_count = len(words & positive_words)
    neg_count = len(words & negative_words)

    if pos_count > neg_count:
        sentiment = "positive"
    elif neg_count > pos_count:
        sentiment = "negative"
    else:
        sentiment = "neutral"

    print(f"   Text: '{text}' → Sentiment: {sentiment}")
    return sentiment


classify_sentiment("This is a great and wonderful day!")
classify_sentiment("The weather is terrible and I feel sad.")
classify_sentiment("The meeting is at 3pm today.")
print()

# ============================================================================
# DEMO 4: LangSmith CLIENT — list recent runs
# ============================================================================

print("── DEMO 4: LangSmith Client ─────────────────────────────────────────")
print()

client = Client()

project_name = os.getenv("LANGSMITH_PROJECT", "observability-demos")

try:
    # List the 5 most recent runs in the project
    runs = list(
        client.list_runs(
            project_name=project_name,
            limit=5,
        )
    )
    if runs:
        print(f"   Last {len(runs)} runs in project '{project_name}':")
        for run in runs:
            status = "✅" if run.error is None else "❌"
            latency = (
                f"{run.end_time - run.start_time}" if run.end_time else "running…"
            )
            print(f"   {status} [{run.run_type}] {run.name}  — {latency}")
    else:
        print(f"   No runs found in project '{project_name}' yet.")
        print("   Traces appear in LangSmith UI within a few seconds.")
except Exception as exc:
    print(f"   Could not fetch runs: {exc}")
    print("   Make sure LANGSMITH_API_KEY and LANGSMITH_PROJECT are correct.")

print()
print("=" * 70)
print("DONE — open https://smith.langchain.com to view your traces!")
print("=" * 70)
