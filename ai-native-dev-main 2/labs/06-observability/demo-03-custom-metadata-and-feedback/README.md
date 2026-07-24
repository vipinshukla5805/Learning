# Demo 03: Custom Metadata, Run IDs & User Feedback

Production-ready patterns for enriching LangSmith traces with context that makes debugging, filtering, and evaluation practical at scale.

## What You'll Learn

- Attaching custom `run_id` values and metadata (session IDs, user tiers, versions)
- Using `get_current_run_tree()` to add metadata dynamically mid-execution
- Submitting user feedback (thumbs-up/down, scores, comments) to runs via the Client API
- How exceptions and tracebacks are automatically captured in failed runs
- Tagging multiple experiment runs for A/B comparison in the UI

## What's Inside

| File           | Purpose                                                                     |
| -------------- | --------------------------------------------------------------------------- |
| `main.py`      | Four demos: custom metadata · feedback · error tracing · experiment batches |
| `.env.example` | Template for credentials                                                    |

## Quick Start

```bash
uv sync
cp .env.example .env   # add your API keys
uv run python main.py
```

## Key Patterns

### Attach Metadata Mid-Execution

```python
from langsmith.run_helpers import get_current_run_tree

@traceable(name="my_function")
def my_function(user_id: str) -> str:
    run = get_current_run_tree()
    if run:
        run.metadata = {"user_id": user_id, "env": "prod"}
    # ... rest of function
```

### Submit Feedback After the Fact

```python
from langsmith import Client

client = Client()
client.create_feedback(
    run_id="<run-uuid>",
    key="user_rating",   # dimension name (any string)
    score=1,             # 0-1 scale (or any numeric range you choose)
    comment="Great answer!",
)
```

### Real-World Feedback Loop

```
User submits 👍/👎 in your UI
         ↓
POST /api/feedback → your backend
         ↓
client.create_feedback(run_id, score)
         ↓
LangSmith stores score attached to the run
         ↓
Filter / aggregate by score in LangSmith UI
```

## Metadata Filtering in LangSmith UI

Once metadata is attached you can filter runs in the UI by:

- `metadata.session_id = "abc-123"` — see all runs for a user session
- `metadata.environment = "prod"` — separate prod from staging runs
- `tags contains "experiment"` — compare experiment batches side by side
