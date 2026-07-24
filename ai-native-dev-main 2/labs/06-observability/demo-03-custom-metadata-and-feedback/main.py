"""
Demo 03: Custom Metadata, Run IDs & User Feedback

This demo covers production-focused LangSmith patterns:

1. Capturing custom run IDs so you can link LangSmith runs to your own
   database records (e.g., a chat session or ticket ID).
2. Attaching rich metadata — user ID, environment, feature flags — so
   you can slice and filter traces in the UI.
3. Creating user feedback (thumbs-up/down, numeric scores, free-text
   comments) and attaching it to runs after the fact.
4. Using get_current_run_tree() to obtain the live run object and
   attach extra data mid-execution.
5. Error tracing — how exceptions are captured and surfaced in LangSmith.

Run this script, then open https://smith.langchain.com to see:
- Runs labelled with custom IDs and metadata
- Feedback scores and comments attached to each run
- A failed run with the full traceback captured
"""

import os
import uuid
import time
from dotenv import load_dotenv
from openai import OpenAI
from langsmith import traceable, Client
from langsmith.run_helpers import get_current_run_tree
from langsmith.wrappers import wrap_openai

# ============================================================================
# SETUP
# ============================================================================

load_dotenv()

if not os.getenv("OPENAI_API_KEY"):
    raise EnvironmentError("OPENAI_API_KEY is not set. See .env.example.")
if not os.getenv("LANGSMITH_API_KEY"):
    print("⚠️  LANGSMITH_API_KEY not set — traces will NOT be sent.\n")

client = Client()
openai_client = wrap_openai(OpenAI())
MODEL = "gpt-4o-mini"
PROJECT = os.getenv("LANGSMITH_PROJECT", "observability-demos")

print("=" * 70)
print("DEMO 03: CUSTOM METADATA, RUN IDs & FEEDBACK")
print("=" * 70)
print()

# ============================================================================
# DEMO 1: Custom run_id — link LangSmith runs to your own records
# ============================================================================

print("── DEMO 1: Custom run_id ────────────────────────────────────────────")
print()


@traceable(name="answer_question")
def answer_question(question: str, session_id: str) -> str:
    """
    Answer a user question.

    By attaching session_id as metadata, every run is linked to the
    originating user session — making it trivial to filter all runs
    for a specific user in the LangSmith UI.
    """
    # Access the live run tree to add dynamic metadata mid-execution
    run_tree = get_current_run_tree()
    if run_tree:
        run_tree.add_metadata({
            "session_id": session_id,
            "user_tier": "free",
            "app_version": "2.1.0",
            "environment": "demo",
        })
        run_tree.tags = ["qa", "demo-03"]

    response = openai_client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": "Answer concisely in 1-2 sentences."},
            {"role": "user", "content": question},
        ],
        temperature=0.3,
        max_tokens=150,
    )
    answer = response.choices[0].message.content
    print(f"   Q: {question}")
    print(f"   A: {answer}")
    print()
    return answer


session_id = str(uuid.uuid4())
print(f"   Session ID: {session_id}\n")
answer_question("What is a trace in software observability?", session_id)
answer_question("Why is token tracking important for LLM apps?", session_id)

# ============================================================================
# DEMO 2: Attaching user feedback to a run
# ============================================================================

print("── DEMO 2: User feedback ────────────────────────────────────────────")
print()

run_ids = []


@traceable(name="generate_headline")
def generate_headline(topic: str) -> str:
    """Generate a news headline for a topic."""
    run_tree = get_current_run_tree()
    if run_tree:
        run_ids.append(str(run_tree.id))  # save for feedback submission

    response = openai_client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": "Write a short, catchy news headline. No quotes.",
            },
            {"role": "user", "content": f"Topic: {topic}"},
        ],
        temperature=0.7,
        max_tokens=50,
    )
    headline = response.choices[0].message.content
    print(f"   Topic: {topic}")
    print(f"   Headline: {headline}")
    return headline


topics = ["AI observability", "vector databases", "prompt engineering"]
headlines = [generate_headline(t) for t in topics]
print()

# Simulate user feedback — in production this comes from your UI
simulated_scores = [1, 0, 1]  # 1 = thumbs up, 0 = thumbs down
simulated_comments = [
    "Very relevant headline!",
    "Doesn't capture the topic well.",
    "Catchy and accurate.",
]

print("   Submitting feedback to LangSmith…")
for run_id, score, comment in zip(run_ids, simulated_scores, simulated_comments):
    try:
        client.create_feedback(
            run_id=run_id,
            key="user_rating",         # feedback dimension name
            score=score,               # numeric score (0-1 scale or custom)
            comment=comment,           # optional free-text comment
            feedback_source_type="api",
        )
        icon = "👍" if score == 1 else "👎"
        print(f"   {icon} Run {run_id[:8]}… → score={score}: '{comment}'")
    except Exception as exc:
        print(f"   Could not submit feedback (offline?): {exc}")
print()

# ============================================================================
# DEMO 3: Error tracing
# ============================================================================

print("── DEMO 3: Error tracing ────────────────────────────────────────────")
print()
print("   LangSmith captures exceptions automatically — even crashes.")
print()


@traceable(name="risky_operation", tags=["error-demo"])
def risky_operation(value: int) -> float:
    """Intentionally raises a ZeroDivisionError to demo error tracing."""
    print(f"   Attempting 100 / {value}…")
    result = 100 / value  # will raise when value == 0
    return result


# Successful call
try:
    r = risky_operation(4)
    print(f"   100 / 4 = {r}\n")
except ZeroDivisionError as e:
    print(f"   Error caught: {e}\n")

# Failing call — error is recorded in LangSmith with full traceback
try:
    r = risky_operation(0)
except ZeroDivisionError as e:
    print(f"   Error caught (as expected): {e}")
    print("   → Failed run is visible in LangSmith with the traceback.\n")

# ============================================================================
# DEMO 4: Batch metadata on multiple runs + filtering
# ============================================================================

print("── DEMO 4: Batch run metadata ───────────────────────────────────────")
print()

experiments = [
    {"temperature": 0.0, "max_tokens": 50},
    {"temperature": 0.5, "max_tokens": 100},
    {"temperature": 1.0, "max_tokens": 150},
]


@traceable(name="experiment_run", tags=["experiment", "demo-03"])
def run_experiment(prompt: str, temperature: float, max_tokens: int) -> str:
    """Run a prompt with specific hyperparameters — tagged for comparison."""
    run_tree = get_current_run_tree()
    if run_tree:
        run_tree.add_metadata({
            "temperature": temperature,
            "max_tokens": max_tokens,
            "experiment_batch": "batch-001",
        })

    response = openai_client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=temperature,
        max_tokens=max_tokens,
    )
    output = response.choices[0].message.content
    print(f"   temp={temperature}, max_tokens={max_tokens}: {output[:80]}…")
    return output


prompt = "Describe observability in AI systems in one sentence."
for exp in experiments:
    run_experiment(prompt, **exp)
    time.sleep(0.3)  # small delay between API calls

print()
print("=" * 70)
print("DONE — filter runs by metadata, tags, or feedback in LangSmith UI.")
print("   URL: https://smith.langchain.com")
print("=" * 70)
