# AI Chat Assistant - Streamlit Frontend

A modern, feature-rich Streamlit frontend for an AI chat application. This application connects to a FastAPI backend powered by OpenAI to provide intelligent conversational responses.

## Features

- **💬 Interactive Chat Interface**: Modern, real-time chat with avatars and timestamps
- **🔄 Streaming Support**: Real-time response streaming for immediate feedback
- **🔌 Backend Integration**: Seamless connection to FastAPI backend with health checks
- **⚙️ Configuration Panel**: Sidebar controls for settings and session management
- **📊 Session Management**: Unique session tracking and message history
- **❌ Error Handling**: Graceful error management with helpful troubleshooting tips
- **📱 Responsive Design**: Works on desktop and mobile devices
- **🎨 Beautiful UI**: Enhanced styling with status indicators and emojis

## Prerequisites

- Python 3.12 or higher
- pip or uv package manager
- **FastAPI Backend**: The backend must be running (see Backend Setup below)

## Installation

### Using uv (Recommended)

```bash
cd frontend
uv sync
```

### Using pip

```bash
cd frontend
pip install -e .
```

## Configuration

### Environment Variables

Create a `.env` file in the frontend directory or set environment variables:

```bash
# Backend connection
BACKEND_URL=http://localhost:8000

# Response settings
USE_STREAMING=false          # Set to 'true' for streaming responses
REQUEST_TIMEOUT=30           # Request timeout in seconds
```

### Default Configuration

If no environment variables are set, the application uses:

- **Backend URL**: `http://localhost:8000`
- **Streaming**: Disabled (can be toggled in sidebar)
- **Request Timeout**: 30 seconds

## Backend Setup

The application requires a running FastAPI backend. To set up and run the backend:

```bash
cd backend
uv sync
uv run uvicorn main:app --reload --port 8000
```

**Note**: Ensure the backend is running before starting the frontend, or use the health check feature in the sidebar to verify connectivity.

## Usage

1. **Start the Backend**:
   ```bash
   cd backend
   uv run uvicorn main:app --reload --port 8000
   ```

2. **Start the Frontend** (in another terminal):
   ```bash
   cd frontend
   streamlit run main.py
   ```

3. **Open in Browser**:
   - The application will automatically open at `http://localhost:8501`
   - If not, navigate to the URL shown in the terminal

4. **Chat**:
   - Type your question or prompt in the input field
   - Press Enter to send
   - View responses with timestamps

## How It Works

### Architecture

```
┌─────────────────────┐
│  Streamlit Frontend │
│  (This App)         │
└──────────┬──────────┘
           │ HTTP
           │ (requests)
           ▼
┌─────────────────────┐
│  FastAPI Backend    │
│  (main.py)          │
└──────────┬──────────┘
           │ HTTP
           │ (OpenAI SDK)
           ▼
┌─────────────────────┐
│  OpenAI API         │
│  (LLM Model)        │
└─────────────────────┘
```

### Key Components

#### Backend Health Check
- **Endpoint**: `/health`
- **Purpose**: Verify backend is running and accessible
- **Display**: Status badge in sidebar (green = connected, red = disconnected)

#### Query Endpoint
- **Endpoint**: `/query` (regular) or `/query/stream` (streaming)
- **Method**: POST
- **Payload**: `{"prompt": "your question"}`
- **Response**: JSON with `model` and `answer` fields

#### Session Management
- Each user gets a unique session ID
- Message history is maintained in `st.session_state`
- Sessions are cleared when the browser is refreshed or chat history is cleared

### Response Modes

1. **Regular Response**:
   - Single request-response cycle
   - Faster for short responses
   - Full response displayed at once

2. **Streaming Response**:
   - Real-time word-by-word streaming
   - Better UX for longer responses
   - Uses Server-Sent Events (SSE)

## Troubleshooting

### Backend Connection Error
```
Error: Cannot connect to backend at http://localhost:8000
```

**Solution**:
1. Verify the backend is running: `uv run uvicorn main:app --reload --port 8000`
2. Check the backend is on the correct port (default: 8000)
3. Update `BACKEND_URL` if running on a different host/port

### Request Timeout
```
Error: Request timeout. The backend took longer than 30 seconds to respond.
```

**Solution**:
1. Increase `REQUEST_TIMEOUT` in `.env` or environment variables
2. Check backend performance and LLM response time
3. Verify network connection stability

### Backend Error Response
```
Error: Backend error (500): LLM processing failed
```

**Solution**:
1. Check backend logs for detailed error messages
2. Verify OpenAI API key is configured in backend `.env`
3. Check API rate limits and quota

### Streaming Not Working
- Ensure `USE_STREAMING=true` is set in environment variables or toggled in sidebar
- Check network connection for interruptions
- Some proxies may block Server-Sent Events; verify network setup

## Project Structure

```
frontend/
├── main.py                    # Main Streamlit application
├── pyproject.toml             # Project dependencies and metadata
├── README.md                  # This file
├── .env                       # Environment variables (create manually)
├── .python-version            # Python version specification
├── .gitignore                 # Git ignore rules
└── .venv/                     # Virtual environment (if using uv)
```

## Dependencies

| Package | Purpose |
|---------|---------|
| **streamlit** | Web application framework |
| **requests** | HTTP client for backend communication |

## Development

### Adding New Features

1. **Add UI Elements**: Use Streamlit widgets in `main.py`
2. **Add Backend Calls**: Extend `query_llm()` or create new functions
3. **Update Configuration**: Add new environment variables
4. **Test Thoroughly**: Test with backend running and disconnected

### Code Style

- Follow PEP 8 style guidelines
- Add docstrings to all functions
- Use type hints where applicable
- Add helpful comments for complex logic

## Performance Tips

1. **Enable Streaming**: Use streaming for better UX on longer responses
2. **Connection Pooling**: Requests library automatically handles connection pooling
3. **Sidebar Caching**: Sidebar rebuilds on every script run; consider using `@st.cache_resource` for expensive operations
4. **Message Limit**: Consider implementing pagination for very long chat histories

## Security Considerations

- **Backend URL**: Ensure backend CORS is properly configured
- **API Keys**: Keep OpenAI API keys secure in backend `.env`
- **User Input**: Input is validated by Pydantic on the backend
- **Streaming**: Verify backend correctly implements SSE format

## Links

- [Streamlit Documentation](https://docs.streamlit.io/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [OpenAI API Documentation](https://platform.openai.com/docs/)
- [Python Requests Documentation](https://docs.python-requests.org/)

## License

This project is part of an AI-Native Development course.

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review backend logs
3. Verify environment configuration
4. Check network connectivity
