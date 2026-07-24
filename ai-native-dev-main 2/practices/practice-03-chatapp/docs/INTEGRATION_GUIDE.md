# Streamlit Frontend & FastAPI Backend Integration Guide

## Overview

This document provides a comprehensive guide to the integration between the Streamlit frontend and FastAPI backend for the AI Chat Application.

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                      CLIENT BROWSER                              │
│                   (localhost:8501)                               │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              STREAMLIT APPLICATION (Frontend)              │ │
│  │                                                            │ │
│  │  • Chat Interface (st.chat_input, st.chat_message)        │ │
│  │  • Session State Management                               │ │
│  │  • HTTP Client (requests library)                         │ │
│  │  • Configuration Panel (Sidebar)                          │ │
│  │  • Error Handling & Health Checks                         │ │
│  └────────────┬───────────────────────────────────┬──────────┘ │
└───────────────┼───────────────────────────────────┼──────────────┘
                │ HTTP POST/GET                     │
                │ JSON                              │
                ▼                                   ▼
┌──────────────────────────────────────────────────────────────────┐
│                    SERVER                                        │
│              (localhost:8000)                                    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │           FASTAPI APPLICATION (Backend)                    │ │
│  │                                                            │ │
│  │  • HTTP Endpoints:                                         │ │
│  │    - POST /query → Non-streaming responses                │ │
│  │    - POST /query/stream → Streaming responses (SSE)       │ │
│  │    - GET /health → Backend health check                   │ │
│  │                                                            │ │
│  │  • Pydantic Models:                                        │ │
│  │    - QueryRequest: Input validation                        │ │
│  │    - AnswerResponse: Output structure                      │ │
│  │                                                            │ │
│  │  • CORS Middleware:                                        │ │
│  │    - Allow cross-origin requests from Streamlit            │ │
│  │                                                            │ │
│  │  • Error Handling:                                         │ │
│  │    - HTTPException for errors                              │ │
│  │    - Detailed error messages                               │ │
│  └────────────┬───────────────────────────────────────────────┘ │
└───────────────┼──────────────────────────────────────────────────┘
                │ HTTP
                │ (OpenAI SDK)
                ▼
┌──────────────────────────────────────────────────────────────────┐
│                    OPENAI API                                    │
│              (api.openai.com/v1)                                 │
│                                                                  │
│  • GPT-4 / GPT-3.5 Models                                        │
│  • Chat Completions Endpoint                                    │
│  • Streaming Support                                            │
└──────────────────────────────────────────────────────────────────┘
```

---

## Communication Protocol

### 1. Health Check Flow

**Purpose**: Verify backend is running and accessible

```
Frontend (Streamlit)          Backend (FastAPI)
    │                              │
    ├─ GET /health ───────────────>│
    │                              │
    │<───────── 200 OK ────────────┤
    │     {"status": "healthy"}    │
    │                              │
```

**Frontend Code**:
```python
def check_backend_health() -> bool:
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=30)
        return response.status_code == 200
    except:
        return False
```

**Backend Code**:
```python
@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "llm-query-api", "version": "1.0.0"}
```

---

### 2. Regular Query Flow (Non-Streaming)

**Purpose**: Get complete response in single request

```
Frontend (Streamlit)          Backend (FastAPI)           OpenAI API
    │                              │                          │
    ├─ POST /query ──────────────>│                          │
    │  {"prompt": "..."}           │                          │
    │                              ├─ POST /v1/chat/... ─────>│
    │                              │  {"messages": [...]}     │
    │                              │                          │
    │                              │<─ 200 OK ────────────────┤
    │                              │  {"choices": [...]}      │
    │                              │                          │
    │<─────── 200 OK ──────────────┤                          │
    │  {"model": "...", "answer": "..."}                      │
    │                              │                          │
```

**Request Format**:
```json
POST /query
Content-Type: application/json

{
  "prompt": "Explain the theory of relativity"
}
```

**Response Format**:
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "model": "gpt-4o-mini",
  "answer": "The theory of relativity..."
}
```

**Frontend Implementation**:
```python
response = requests.post(
    f"{BACKEND_URL}/query",
    json={"prompt": user_prompt},
    timeout=30
)
data = response.json()
answer = data.get("answer")
```

---

### 3. Streaming Query Flow

**Purpose**: Real-time response using Server-Sent Events (SSE)

```
Frontend (Streamlit)          Backend (FastAPI)           OpenAI API
    │                              │                          │
    ├─ POST /query/stream ──────>│                          │
    │  {"prompt": "..."}           │                          │
    │                              ├─ POST /v1/chat/... ─────>│
    │                              │  {stream: true, ...}     │
    │                              │                          │
    │                              │<─ stream (200) ──────────┤
    │                              │  chunk 1, chunk 2, ...   │
    │                              │                          │
    │<─ SSE stream ────────────────┤                          │
    │  data: word1                 │                          │
    │  data: word2                 │                          │
    │  data: word3                 │                          │
    │  ...                         │                          │
    │                              │                          │
```

**Request Format**:
```
POST /query/stream
Content-Type: application/json

{
  "prompt": "Explain quantum computing"
}
```

**Response Format (SSE)**:
```
HTTP/1.1 200 OK
Content-Type: text/event-stream
Transfer-Encoding: chunked

data: Quantum
data: computing
data: is
data: a
data: ...

```

**Frontend Implementation**:
```python
response = requests.post(
    f"{BACKEND_URL}/query/stream",
    json={"prompt": user_prompt},
    stream=True,
    timeout=30
)

for line in response.iter_lines():
    if line.startswith(b"data: "):
        chunk = line[6:].decode("utf-8")
        # Display chunk in real-time
```

---

## Configuration

### Frontend Configuration

**File**: `frontend/.env`

```bash
# Backend connection URL
BACKEND_URL=http://localhost:8000

# Enable streaming responses (default: false)
USE_STREAMING=false

# Request timeout in seconds (default: 30)
REQUEST_TIMEOUT=30
```

### Backend Configuration

**File**: `backend/.env`

```bash
# OpenAI API Configuration
OPENAI_API_KEY=sk-...
BASE_URL=https://api.openai.com/v1
MODEL_NAME=gpt-4o-mini

# For local models (e.g., Ollama)
# BASE_URL=http://localhost:11434/v1
# MODEL_NAME=mistral
```

### CORS Configuration

**Backend** automatically configures CORS to allow requests from any origin:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Production: specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

⚠️ **Security Note**: In production, replace `["*"]` with specific allowed origins:
```python
allow_origins=[
    "http://localhost:3000",
    "https://yourdomain.com"
],
```

---

## Session Management

### Frontend Session State

```python
# Each session has unique ID and message history
st.session_state.session_id = str(uuid.uuid4())
st.session_state.messages = [
    {"role": "user", "content": "...", "timestamp": "HH:MM:SS"},
    {"role": "assistant", "content": "...", "timestamp": "HH:MM:SS"},
    ...
]
```

### Message History Structure

```json
{
  "role": "user|assistant",
  "content": "Message text",
  "timestamp": "14:30:45"
}
```

---

## Error Handling

### Frontend Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| Connection Error | Backend not running | Start backend: `uv run uvicorn main:app` |
| Timeout Error | Backend slow/unresponsive | Increase REQUEST_TIMEOUT |
| 500 Error | LLM processing failed | Check backend logs & API key |
| SSE Stream Error | Network interruption | Retry or disable streaming |
| Invalid JSON | Malformed response | Check backend response format |

### Backend Error Handling

```python
@app.post("/query")
def ask_study_buddy(request: QueryRequest):
    try:
        completion = client.chat.completions.create(...)
        return AnswerResponse(model=model, answer=answer)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"LLM processing failed: {str(e)}"
        )
```

---

## Starting the Application

### Terminal 1: Start Backend

```bash
cd backend
uv sync
uv run uvicorn main:app --reload --port 8000
```

**Expected Output**:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Press CTRL+C to quit
INFO:     Started server process
```

### Terminal 2: Start Frontend

```bash
cd frontend
uv sync
streamlit run main.py
```

**Expected Output**:
```
You can now view your Streamlit app in your browser.
URL: http://localhost:8501
```

---

## Testing the Integration

### 1. Verify Backend is Running

```bash
curl http://localhost:8000/health
```

**Response**:
```json
{
  "status": "healthy",
  "service": "llm-query-api",
  "version": "1.0.0"
}
```

### 2. Test Regular Query

```bash
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"prompt": "What is Python?"}'
```

### 3. Test Streaming Query

```bash
curl -X POST http://localhost:8000/query/stream \
  -H "Content-Type: application/json" \
  -d '{"prompt": "What is AI?"}' \
  --no-buffer
```

### 4. Test Frontend UI

1. Open browser to `http://localhost:8501`
2. Check sidebar status badge (should be green)
3. Type a question in chat input
4. Verify response appears

---

## Performance Optimization

### Frontend Optimization

1. **Enable Streaming**: Use streaming for longer responses
2. **Connection Pooling**: Requests automatically pools connections
3. **Caching**: Cache expensive computations with `@st.cache_resource`
4. **Message Pagination**: Limit chat history display for large conversations

### Backend Optimization

1. **Model Selection**: Use faster models (gpt-3.5-turbo vs gpt-4)
2. **Connection Pooling**: OpenAI SDK handles connection reuse
3. **Request Validation**: Pydantic validates before processing
4. **Error Handling**: Fail fast with meaningful errors

### Network Optimization

1. **Gzip Compression**: FastAPI automatically compresses responses
2. **Keep-Alive**: HTTP connections remain open for reuse
3. **Content Delivery**: Consider CDN for production

---

## Troubleshooting Integration

### Issue: Frontend can't connect to backend

**Symptoms**:
- "Cannot connect to backend" error in sidebar
- Connection refused

**Solutions**:
1. Verify backend is running
2. Check `BACKEND_URL` configuration
3. Verify firewall isn't blocking port 8000
4. Check if backend and frontend are on same network

### Issue: Streaming responses not working

**Symptoms**:
- Regular queries work, but streaming hangs
- Chunks not appearing

**Solutions**:
1. Verify `USE_STREAMING=true` in `.env`
2. Check network for interruptions
3. Disable proxies that might block SSE
4. Check backend logs for streaming errors

### Issue: LLM responses are slow

**Symptoms**:
- Long request timeout
- Request timeout errors

**Solutions**:
1. Check OpenAI API rate limits
2. Switch to faster model (gpt-3.5-turbo)
3. Enable streaming for better UX during wait
4. Check network latency

### Issue: Backend returns 500 errors

**Symptoms**:
- "Backend error (500)" message
- LLM processing failed

**Solutions**:
1. Check backend `.env` has valid OPENAI_API_KEY
2. Verify API key has proper permissions
3. Check OpenAI quota and billing
4. Review backend logs for detailed error

---

## Production Deployment

### Security Considerations

1. **CORS Configuration**: Set specific allowed origins
2. **Environment Variables**: Use secure secret management
3. **HTTPS**: Use SSL/TLS in production
4. **API Key Rotation**: Regularly rotate API keys
5. **Rate Limiting**: Add rate limiting to backend

### Deployment Options

1. **Local Network**: Both apps on same machine
2. **Separate Servers**: Backend on server, frontend on separate machine
3. **Cloud Platforms**: Deploy to AWS, Azure, GCP, Heroku
4. **Containerization**: Use Docker for reproducible deployments

### Example Docker Setup

```dockerfile
# Backend Dockerfile
FROM python:3.12
WORKDIR /app
COPY backend .
RUN uv sync
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0"]

# Frontend Dockerfile  
FROM python:3.12
WORKDIR /app
COPY frontend .
RUN uv sync
CMD ["streamlit", "run", "main.py", "--server.port=8501"]
```

---

## Monitoring and Logging

### Frontend Monitoring

- Check sidebar status badge for backend connectivity
- Monitor message count and session duration
- Log errors and timeouts

### Backend Monitoring

- Monitor API endpoint response times
- Track OpenAI API usage and costs
- Log errors and exceptions
- Monitor CORS issues

### Example Logging Setup

```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info(f"Query request: {request.prompt[:50]}...")
logger.error(f"LLM error: {str(e)}")
```

---

## Next Steps

1. ✅ Set up both frontend and backend locally
2. ✅ Verify connectivity using curl commands
3. ✅ Test all three endpoints (health, query, stream)
4. ✅ Configure environment variables
5. ✅ Add custom features/models
6. ✅ Deploy to production
7. ✅ Set up monitoring and logging

---

## References

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Streamlit Documentation](https://docs.streamlit.io/)
- [OpenAI API Documentation](https://platform.openai.com/docs/)
- [HTTP/REST API Best Practices](https://restfulapi.net/)
- [Server-Sent Events (SSE)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
