"""
Demo 02: Tracing OpenAI API Calls with LangSmith

This demo shows two complementary patterns for capturing OpenAI calls
as structured runs in LangSmith:

Pattern A — wrap_openai
  Wraps the OpenAI client so every chat/completion call is
  automatically traced without any code changes to callers.

Pattern B — @traceable around OpenAI calls
  Traces a higher-level function that internally calls OpenAI,
  giving you one combined run that groups inputs/outputs cleanly.

What you will see in LangSmith:
- Model name, temperature, max_tokens recorded automatically
- Full prompt messages and completion text captured
- Token usage (prompt / completion / total) tracked per call
- Latency per call + error capture if a call fails
"""

import os
from dotenv import load_dotenv
from openai import OpenAI
from langsmith import traceable
from langsmith.wrappers import wrap_openai

# ============================================================================
# SETUP
# ============================================================================

load_dotenv()

if not os.getenv("OPENAI_API_KEY"):
    raise EnvironmentError(
        "OPENAI_API_KEY is not set. Copy .env.example → .env and fill it in."
    )
if not os.getenv("LANGSMITH_API_KEY"):
    print("⚠️  LANGSMITH_API_KEY not set — traces will NOT be sent to LangSmith.\n")

print("=" * 70)
print("DEMO 02: OPENAI CALL TRACING WITH LANGSMITH")
print("=" * 70)
print()

MODEL = "gpt-4o-mini"  # cheap, fast model for demos

# ============================================================================
# PATTERN A: wrap_openai
# ============================================================================

print("── PATTERN A: wrap_openai ───────────────────────────────────────────")
print()
print("   Wrap the OpenAI client once; every subsequent call is auto-traced.")
print()

# Wrapping the client patches all chat.completions.create calls so that
# inputs, outputs, and token counts are forwarded to LangSmith automatically.
raw_client = OpenAI()
client = wrap_openai(raw_client)


def ask_simple(question: str) -> str:
    """Send a single-turn question to the model."""
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": question},
        ],
        temperature=0.3,
        max_tokens=200,
    )
    answer = response.choices[0].message.content
    print(f"   Q: {question}")
    print(f"   A: {answer}")
    print()
    return answer


ask_simple("What is observability in software engineering?")
ask_simple("Name three benefits of tracing LLM calls.")

# ============================================================================
# PATTERN B: @traceable wrapping OpenAI calls
# ============================================================================

print("── PATTERN B: @traceable wrapping OpenAI calls ─────────────────────")
print()
print("   Use a plain (unwrapped) client; @traceable creates the parent run.")
print()

plain_client = OpenAI()  # NOT wrapped — we rely on @traceable context


@traceable(
    name="summarize_text",
    tags=["summarization"],
    metadata={"model": MODEL, "pattern": "traceable-wrapper"},
)
def summarize(text: str, max_words: int = 50) -> str:
    """
    Summarise the given text in at most `max_words` words.

    The @traceable decorator creates a parent run called 'summarize_text'.
    Inside it the OpenAI call appears as a child run, giving you:

      summarize_text              ← parent (captures text + max_words)
        └── ChatOpenAI            ← child (captures prompt, completion, tokens)
    """
    response = plain_client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": f"Summarise the following text in at most {max_words} words.",
            },
            {"role": "user", "content": text},
        ],
        temperature=0.0,
        max_tokens=150,
    )
    summary = response.choices[0].message.content
    print(f"   Original ({len(text.split())} words) → Summary: {summary}")
    print()
    return summary


sample_text = (
    "LangSmith is a platform for building production-grade LLM applications. "
    "It provides tools for debugging, testing, evaluating, and monitoring language "
    "model applications so that teams can ship reliable AI products faster. "
    "Key features include run tracing, dataset management, and automated evaluation."
)

summarize(sample_text, max_words=20)
summarize(sample_text, max_words=40)

# ============================================================================
# PATTERN C: Multi-turn conversation tracing
# ============================================================================

print("── PATTERN C: Multi-turn conversation ──────────────────────────────")
print()


@traceable(name="multi_turn_conversation", tags=["chat", "multi-turn"])
def chat_conversation(topic: str) -> list[dict]:
    """
    Simulate a 3-turn conversation and trace all turns as one run.

    The full conversation history is captured under a single
    'multi_turn_conversation' run, making it easy to review the entire
    dialogue in LangSmith without clicking through individual calls.
    """
    messages = [
        {
            "role": "system",
            "content": "You are a concise tutor. Keep each answer to 1-2 sentences.",
        },
        {"role": "user", "content": f"Explain {topic} in one sentence."},
    ]

    print(f"   Topic: {topic}")
    for turn in range(3):
        response = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            temperature=0.4,
            max_tokens=100,
        )
        assistant_msg = response.choices[0].message.content
        messages.append({"role": "assistant", "content": assistant_msg})
        print(f"   Turn {turn + 1}: {assistant_msg}")

        # Add a follow-up question for turns 0 and 1
        follow_ups = [
            f"Give one real-world example of {topic}.",
            f"What is the biggest challenge with {topic}?",
        ]
        if turn < 2:
            messages.append({"role": "user", "content": follow_ups[turn]})

    print()
    return messages


chat_conversation("vector databases")

print("=" * 70)
print("DONE — open https://smith.langchain.com to inspect token counts,")
print("       latency per call, and full prompt/completion text.")
print("=" * 70)
