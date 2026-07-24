# Quick Start Guide - AI Chat Application

Get up and running with the AI Chat Application in 5 minutes!

---

## Prerequisites

- Python 3.12 or higher
- `uv` package manager installed ([Install uv](https://docs.astral.sh/uv/))
- OpenAI API key (get from [platform.openai.com](https://platform.openai.com/api-keys))

---

## Step 1: Configure Backend (2 minutes)

### 1. Open `.env` file in backend directory

```bash
cd backend
```

### 2. Add your OpenAI API key

Edit `backend/.env` or create from `.envbackup`:

```bash
OPENAI_API_KEY=sk-your-api-key-here
BASE_URL=https://api.openai.com/v1
MODEL_NAME=gpt-4o-mini
```

### 3. Install dependencies

```bash
uv sync
```

---

## Step 2: Start Backend (1 minute)

```bash
uv run uvicorn main:app --reload --port 8000
```

**Expected output**:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

✅ **Backend is ready!** Leave this terminal running.

---

## Step 3: Configure Frontend (1 minute)

### 1. Open new terminal and navigate to frontend

```bash
cd frontend
```

### 2. Create `.env` file (optional)

Copy from template:
```bash
cp .env.example .env
```

Or manually create with:
```bash
BACKEND_URL=http://localhost:8000
USE_STREAMING=false
REQUEST_TIMEOUT=30
```

### 3. Install dependencies

```bash
uv sync
```

---

## Step 4: Start Frontend (1 minute)

```bash
streamlit run main.py
```

**Expected output**:
```
You can now view your Streamlit app in your browser.
URL: http://localhost:8501
```

✅ **Application is running!** Browser should open automatically.

---

## Step 5: Test It Out!

### 1. Check Backend Status

Look at the sidebar - you should see **✅ Backend Connected** in green.

### 2. Send Your First Query

Type a question in the chat box:
```
What is machine learning?
```

Press Enter and watch the response appear!

### 3. Try Different Features

- **Streaming Response**: Toggle "Use Streaming Response" in sidebar
- **Clear Chat**: Click "🗑️ Clear Chat History" button
- **Session ID**: See your unique session ID in sidebar

---

## Troubleshooting

### Backend connection fails?

**Error**: "❌ Backend Disconnected"

**Fix**:
1. Check backend is running in first terminal
2. Verify `BACKEND_URL=http://localhost:8000` in frontend
3. Check if port 8000 is free: `netstat -ano | findstr :8000` (Windows)

### API key error?

**Error**: "OPENAI_API_KEY not found in environment variables"

**Fix**:
1. Open `backend/.env`
2. Add your actual OpenAI API key
3. Restart backend with Ctrl+C and rerun

### Backend is slow?

**Solutions**:
1. First-time calls are slower - be patient
2. Enable streaming: Toggle in sidebar for real-time feedback
3. Check OpenAI API status
4. Use faster model in `.env`: `gpt-3.5-turbo` instead of `gpt-4`

### Port already in use?

**Error**: "Address already in use"

**Fix**:
```bash
# Kill process on port 8000 (Windows)
netstat -ano | findstr :8000
taskkill /PID <process_id> /F

# Or run on different port
uv run uvicorn main:app --reload --port 8001
# Then set BACKEND_URL=http://localhost:8001 in frontend
```

---

## What's Next?

### Explore the Application

- Try different types of questions
- Use streaming mode for long responses
- Check timestamps on messages
- Export conversation

### Customize

- Change `MODEL_NAME` to different OpenAI model
- Adjust `REQUEST_TIMEOUT` for slower connections
- Modify UI colors in `main.py` styling section

### Integrate

- Build custom UI components
- Add database for persistent chat history
- Implement user authentication
- Deploy to cloud

---

## File Locations

```
📁 practice-03-chatapp/
├── 📁 backend/
│   ├── main.py              ← Backend logic
│   ├── .env                 ← API key here ⭐
│   └── pyproject.toml       ← Backend deps
│
├── 📁 frontend/
│   ├── main.py              ← Streamlit UI
│   ├── .env                 ← Config here
│   └── pyproject.toml       ← Frontend deps
│
├── INTEGRATION_GUIDE.md     ← Deep dive guide
├── ANALYSIS.md              ← Technical analysis
└── README.md                ← This folder's docs
```

---

## Common Questions

**Q: Do I need to start backend first?**
> A: Yes, frontend needs backend running. Start backend in first terminal, frontend in second.

**Q: Can I use local LLM instead of OpenAI?**
> A: Yes! Set `BASE_URL=http://localhost:11434/v1` and `MODEL_NAME=mistral` (or your model) to use Ollama.

**Q: How do I stop the applications?**
> A: Press `Ctrl+C` in each terminal to stop backend and frontend.

**Q: Can I deploy this?**
> A: Yes! See INTEGRATION_GUIDE.md for deployment instructions.

**Q: Where are my chat messages saved?**
> A: Currently in browser session memory. Add database to backend to persist.

---

## Key Endpoints (Advanced)

If you want to test via curl:

### Health Check
```bash
curl http://localhost:8000/health
```

### Regular Query
```bash
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"prompt": "What is AI?"}'
```

### Streaming Query
```bash
curl -X POST http://localhost:8000/query/stream \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Explain quantum computing"}' \
  --no-buffer
```

---

## Support Resources

- 📚 [Streamlit Docs](https://docs.streamlit.io/)
- 🚀 [FastAPI Docs](https://fastapi.tiangolo.com/)
- 🔑 [OpenAI API Docs](https://platform.openai.com/docs/)
- 📦 [Python uv Docs](https://docs.astral.sh/uv/)

---

## Next: Read Full Guides

- 📖 `INTEGRATION_GUIDE.md` - Complete architecture & integration details
- 📊 `ANALYSIS.md` - Technical analysis and recommendations
- 📝 `frontend/README_NEW.md` - Feature-rich frontend documentation

---

**Ready to chat with AI?** 🤖

Start with Step 1 above or jump to the terminal commands:

```bash
# Terminal 1: Backend
cd backend && uv sync && uv run uvicorn main:app --reload --port 8000

# Terminal 2: Frontend  
cd frontend && uv sync && streamlit run main.py
```

Open http://localhost:8501 and start chatting! 💬
