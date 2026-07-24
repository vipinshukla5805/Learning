# Advanced Features & Best Practices

This document covers advanced features, optimization techniques, and best practices for the AI Chat Application.

---

## Table of Contents

1. [Advanced Frontend Features](#advanced-frontend-features)
2. [Advanced Backend Features](#advanced-backend-features)
3. [Performance Optimization](#performance-optimization)
4. [Security Best Practices](#security-best-practices)
5. [Monitoring & Logging](#monitoring--logging)
6. [Deployment Strategies](#deployment-strategies)
7. [Code Examples](#code-examples)

---

## Advanced Frontend Features

### 1. Message Caching

Cache expensive computations to avoid redundant API calls:

```python
@st.cache_data(ttl=3600)
def get_cached_response(prompt: str) -> str:
    """Cache responses for 1 hour"""
    return query_llm(prompt)

# Usage
response = get_cached_response(user_prompt)
```

### 2. Export Chat History

Add ability to export conversations:

```python
def export_chat_history(format: str = "json") -> str:
    """Export chat history in various formats"""
    if format == "json":
        return json.dumps(st.session_state.messages, indent=2)
    elif format == "markdown":
        md = "# Chat History\n\n"
        for msg in st.session_state.messages:
            role = "**User**" if msg["role"] == "user" else "**Assistant**"
            md += f"{role}: {msg['content']}\n\n"
        return md
    elif format == "csv":
        df = pd.DataFrame(st.session_state.messages)
        return df.to_csv(index=False)

# Usage
if st.sidebar.button("📥 Export Chat"):
    format = st.sidebar.selectbox("Format", ["json", "markdown", "csv"])
    exported = export_chat_history(format)
    st.download_button("Download", exported, f"chat.{format}")
```

### 3. Conversation Analytics

Track conversation metrics:

```python
def get_conversation_stats() -> dict:
    """Analyze conversation statistics"""
    messages = st.session_state.messages
    
    return {
        "total_messages": len(messages),
        "user_messages": sum(1 for m in messages if m["role"] == "user"),
        "assistant_messages": sum(1 for m in messages if m["role"] == "assistant"),
        "total_characters": sum(len(m["content"]) for m in messages),
        "avg_message_length": sum(len(m["content"]) for m in messages) / len(messages) if messages else 0,
        "session_duration": (datetime.now() - st.session_state.session_start).total_seconds(),
    }

# Usage in sidebar
if st.session_state.messages:
    stats = get_conversation_stats()
    st.sidebar.metric("Total Messages", stats["total_messages"])
    st.sidebar.metric("User Messages", stats["user_messages"])
    st.sidebar.metric("Avg Length", f"{stats['avg_message_length']:.0f} chars")
```

### 4. Regenerate Response

Allow users to regenerate the last response:

```python
def regenerate_last_response():
    """Regenerate the last assistant response"""
    if len(st.session_state.messages) < 2:
        st.warning("No assistant response to regenerate")
        return
    
    # Get the last user prompt
    last_user_msg = None
    for msg in reversed(st.session_state.messages):
        if msg["role"] == "user":
            last_user_msg = msg["content"]
            break
    
    if not last_user_msg:
        return
    
    # Remove last assistant response
    st.session_state.messages = [
        m for m in st.session_state.messages 
        if m.get("timestamp") != st.session_state.messages[-1].get("timestamp")
    ]
    
    # Generate new response
    with st.spinner("Regenerating..."):
        response = query_llm(last_user_msg)
        if response:
            st.session_state.messages.append({
                "role": "assistant",
                "content": response,
                "timestamp": datetime.now().strftime("%H:%M:%S")
            })

# Usage
col1, col2 = st.columns(2)
with col1:
    if st.button("🔄 Regenerate"):
        regenerate_last_response()
```

### 5. Multi-Model Support

Support multiple LLM models:

```python
def get_available_models() -> list:
    """Fetch available models from backend"""
    try:
        response = requests.get(f"{BACKEND_URL}/models")
        return response.json().get("models", [])
    except:
        return ["gpt-4o-mini"]

# Usage in sidebar
available_models = get_available_models()
selected_model = st.sidebar.selectbox(
    "Model",
    available_models,
    help="Select which model to use"
)

# Pass to backend
response = query_llm(prompt, model=selected_model)
```

---

## Advanced Backend Features

### 1. Request/Response Logging

Track all API calls:

```python
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.post("/query")
def ask_study_buddy(request: QueryRequest):
    start_time = datetime.now()
    logger.info(f"Query received: {request.prompt[:100]}...")
    
    try:
        completion = client.chat.completions.create(...)
        answer = completion.choices[0].message.content
        
        elapsed = (datetime.now() - start_time).total_seconds()
        logger.info(f"Query completed in {elapsed:.2f}s")
        
        return AnswerResponse(model=model, answer=answer)
    except Exception as e:
        logger.error(f"Query failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
```

### 2. Rate Limiting

Prevent abuse with rate limiting:

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.post("/query")
@limiter.limit("10/minute")
def ask_study_buddy(request: QueryRequest, request_obj: Request):
    # Implementation
    pass
```

### 3. Response Caching

Cache popular questions:

```python
from functools import lru_cache
import hashlib

@lru_cache(maxsize=100)
def get_cached_answer(prompt_hash: str) -> str:
    # Return cached result if available
    pass

def hash_prompt(prompt: str) -> str:
    return hashlib.md5(prompt.encode()).hexdigest()

@app.post("/query")
def ask_study_buddy(request: QueryRequest):
    prompt_hash = hash_prompt(request.prompt)
    
    cached = get_cached_answer(prompt_hash)
    if cached:
        return AnswerResponse(model=model, answer=cached)
    
    # Otherwise make new API call
    completion = client.chat.completions.create(...)
    answer = completion.choices[0].message.content
    return AnswerResponse(model=model, answer=answer)
```

### 4. Session Management

Track user sessions:

```python
from datetime import datetime, timedelta

sessions = {}

@app.get("/session/{session_id}")
def get_session(session_id: str):
    if session_id not in sessions:
        sessions[session_id] = {
            "created": datetime.now(),
            "queries": 0,
            "total_tokens": 0
        }
    return sessions[session_id]

@app.post("/query")
def ask_study_buddy(request: QueryRequest, session_id: str = None):
    if session_id:
        if session_id not in sessions:
            sessions[session_id] = {"created": datetime.now(), "queries": 0}
        sessions[session_id]["queries"] += 1
    
    # Process query
    return response
```

### 5. Error Recovery

Implement retry logic:

```python
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
def call_openai_api(messages):
    return client.chat.completions.create(
        model=model,
        messages=messages
    )

@app.post("/query")
def ask_study_buddy(request: QueryRequest):
    try:
        completion = call_openai_api([{"role": "user", "content": request.prompt}])
        answer = completion.choices[0].message.content
        return AnswerResponse(model=model, answer=answer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed after retries: {str(e)}")
```

---

## Performance Optimization

### 1. Frontend Connection Pooling

```python
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

def create_session_with_retries():
    session = requests.Session()
    retry = Retry(connect=3, backoff_factor=0.5)
    adapter = HTTPAdapter(max_retries=retry)
    session.mount('http://', adapter)
    session.mount('https://', adapter)
    return session

@st.cache_resource
def get_session():
    return create_session_with_retries()

# Usage
session = get_session()
response = session.post(f"{BACKEND_URL}/query", json=payload)
```

### 2. Streaming Optimization

```python
def query_llm_optimized_streaming(url: str, payload: dict):
    """Optimized streaming with better chunk handling"""
    response = requests.post(url, json=payload, stream=True, timeout=30)
    
    if response.status_code == 200:
        placeholder = st.empty()
        result = ""
        
        for line in response.iter_lines(chunk_size=1024):
            if line and line.startswith(b"data: "):
                chunk = line[6:].decode("utf-8", errors="ignore")
                result += chunk
                # Update every 50 chars to balance UI updates
                if len(chunk) > 50 or line.startswith(b"data: "):
                    placeholder.markdown(result + "▌")
        
        placeholder.markdown(result)
        return result
```

### 3. Request Batching

Combine multiple queries:

```python
@app.post("/batch-query")
def batch_query(requests_list: List[QueryRequest]):
    """Process multiple queries efficiently"""
    results = []
    for req in requests_list:
        completion = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": req.prompt}]
        )
        results.append(completion.choices[0].message.content)
    return {"answers": results}
```

### 4. Response Compression

```python
from fastapi.middleware.gzip import GZipMiddleware

app.add_middleware(GZipMiddleware, minimum_size=1000)
```

---

## Security Best Practices

### 1. API Key Management

```python
# ❌ BAD: Hardcoded key
API_KEY = "sk-proj-1234567890abcdef"

# ✅ GOOD: Environment variable
import os
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("OPENAI_API_KEY")

if not API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable not set")
```

### 2. CORS Security

```python
# ❌ BAD: Allow all origins
CORSMiddleware(allow_origins=["*"])

# ✅ GOOD: Specific origins
CORSMiddleware(
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8501",
        "https://yourdomain.com"
    ],
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)
```

### 3. Input Validation

```python
from pydantic import BaseModel, Field

class QueryRequest(BaseModel):
    prompt: str = Field(
        ...,
        min_length=1,
        max_length=5000,
        description="User's question"
    )

# Validates:
# - prompt is required
# - length between 1-5000 characters
# - type is string
```

### 4. Rate Limiting

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/query")
@limiter.limit("20/minute")
def ask_study_buddy(request: QueryRequest, request_obj: Request):
    # Max 20 requests per minute per IP
    pass
```

### 5. Secrets Management

```bash
# ❌ DON'T commit .env to git
# .gitignore:
.env
.env.local
*.key
secrets.json

# ✅ USE:
# AWS Secrets Manager
# HashiCorp Vault
# Environment-specific .env files
# CI/CD secrets
```

---

## Monitoring & Logging

### 1. Structured Logging

```python
import logging
import json
from datetime import datetime

class StructuredLogger:
    def __init__(self, name):
        self.logger = logging.getLogger(name)
    
    def log(self, level, event, **kwargs):
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "level": level,
            "event": event,
            **kwargs
        }
        self.logger.log(
            getattr(logging, level),
            json.dumps(log_entry)
        )

logger = StructuredLogger(__name__)

# Usage
logger.log("INFO", "query_received", prompt_length=len(prompt), user_id="123")
logger.log("ERROR", "api_error", error="Connection timeout", retry_count=3)
```

### 2. Performance Metrics

```python
import time
from functools import wraps

def measure_performance(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        elapsed = time.time() - start
        st.session_state.metrics = {
            "function": func.__name__,
            "duration": elapsed,
            "timestamp": datetime.now()
        }
        return result
    return wrapper

@measure_performance
def query_llm(prompt):
    return query_llm(prompt)
```

### 3. Error Tracking

```python
import traceback

def log_error(error: Exception, context: dict = None):
    """Log error with context for debugging"""
    error_log = {
        "error_type": type(error).__name__,
        "message": str(error),
        "traceback": traceback.format_exc(),
        "context": context or {},
        "timestamp": datetime.now().isoformat()
    }
    
    # Send to monitoring service
    logger.error(json.dumps(error_log))

# Usage
try:
    response = query_llm(prompt)
except Exception as e:
    log_error(e, {"prompt": prompt, "user_id": session_id})
```

---

## Deployment Strategies

### 1. Docker Deployment

```dockerfile
# Dockerfile for backend
FROM python:3.12-slim

WORKDIR /app
COPY backend/ .

RUN pip install uv
RUN uv sync --no-dev

ENV PYTHONUNBUFFERED=1

CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```dockerfile
# Dockerfile for frontend
FROM python:3.12-slim

WORKDIR /app
COPY frontend/ .

RUN pip install uv
RUN uv sync --no-dev

ENV STREAMLIT_SERVER_HEADLESS=true
ENV STREAMLIT_SERVER_PORT=8501
ENV STREAMLIT_SERVER_ADDRESS=0.0.0.0

CMD ["streamlit", "run", "main.py"]
```

### 2. Docker Compose

```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "8000:8000"
    environment:
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      MODEL_NAME: gpt-4o-mini
    restart: unless-stopped

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "8501:8501"
    environment:
      BACKEND_URL: http://backend:8000
    depends_on:
      - backend
    restart: unless-stopped
```

Run with:
```bash
docker-compose up -d
```

### 3. Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: llm-backend

spec:
  replicas: 3
  selector:
    matchLabels:
      app: llm-backend
  template:
    metadata:
      labels:
        app: llm-backend
    spec:
      containers:
      - name: backend
        image: llm-backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: api-keys
              key: openai
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 10
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

---

## Code Examples

### Example 1: Advanced Error Handling

```python
@app.post("/query")
async def ask_study_buddy(request: QueryRequest):
    try:
        completion = client.chat.completions.create(...)
        return AnswerResponse(model=model, answer=answer)
        
    except openai.RateLimitError:
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
        
    except openai.APIAuthenticationError:
        raise HTTPException(status_code=401, detail="Invalid API key")
        
    except openai.APIConnectionError as e:
        raise HTTPException(status_code=503, detail="Service unavailable")
        
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
```

### Example 2: Frontend with Retry Logic

```python
def query_llm_with_retry(prompt: str, max_retries: int = 3) -> Optional[str]:
    """Query with automatic retry logic"""
    for attempt in range(max_retries):
        try:
            response = requests.post(
                f"{BACKEND_URL}/query",
                json={"prompt": prompt},
                timeout=30
            )
            if response.status_code == 200:
                return response.json()["answer"]
            elif response.status_code == 429:  # Rate limited
                st.warning(f"Rate limited. Retrying in {2**attempt}s...")
                time.sleep(2**attempt)
                continue
        except requests.Timeout:
            if attempt < max_retries - 1:
                st.info(f"Timeout. Retrying ({attempt+1}/{max_retries})...")
                continue
    
    st.error("Failed after all retries")
    return None
```

### Example 3: Custom Response Processing

```python
def process_response(raw_response: str) -> dict:
    """Process and enhance response"""
    return {
        "content": raw_response,
        "length": len(raw_response),
        "word_count": len(raw_response.split()),
        "sentiment": analyze_sentiment(raw_response),
        "key_phrases": extract_key_phrases(raw_response),
        "timestamp": datetime.now().isoformat()
    }

# Usage in frontend
response = query_llm(prompt)
processed = process_response(response)
st.write(f"**Response** ({processed['word_count']} words)")
st.write(response)
st.write(f"Sentiment: {processed['sentiment']}")
```

---

## Conclusion

These advanced features and best practices enable you to build a production-grade, scalable, and secure AI chat application. Start with the basics and gradually incorporate these features based on your needs.

**Recommended Implementation Order**:
1. ✅ Basic integration (already done)
2. 🔄 Connection pooling & streaming optimization
3. 🔒 Security (API key management, CORS, rate limiting)
4. 📊 Logging & monitoring
5. 📦 Docker & deployment
6. ⚙️ Advanced features (caching, batching, session management)

---

**Questions?** Refer to the main integration guide or explore the code examples provided.
