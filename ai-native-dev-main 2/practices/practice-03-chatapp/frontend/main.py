"""
Streamlit Frontend for LLM Chat Application

This application provides a chat interface for querying an LLM backend powered by FastAPI and OpenAI.
It supports both regular and streaming responses, with session management and error handling.

Usage:
    streamlit run main.py

Configuration:
    - Update BACKEND_URL if running backend on a different host/port
    - Environment variables can override defaults
"""

import streamlit as st
import requests
import uuid
import os
from datetime import datetime
from typing import Optional

# ========================================
# Configuration
# ========================================
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
DEFAULT_STREAMING = os.getenv("USE_STREAMING", "false").lower() == "true"
REQUEST_TIMEOUT = int(os.getenv("REQUEST_TIMEOUT", "30"))

# ========================================
# Page Configuration
# ========================================
st.set_page_config(
    page_title="AI Chat Assistant",
    page_icon="🤖",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ========================================
# Custom Styling
# ========================================
st.markdown("""
    <style>
    .status-badge {
        display: inline-block;
        padding: 0.5rem 1rem;
        border-radius: 0.25rem;
        font-weight: bold;
    }
    .status-healthy {
        background-color: #d4edda;
        color: #155724;
    }
    .status-error {
        background-color: #f8d7da;
        color: #721c24;
    }
    </style>
    """, unsafe_allow_html=True)

# ========================================
# Helper Functions
# ========================================
def check_backend_health() -> bool:
    """
    Check if the FastAPI backend is running and healthy.
    
    Returns:
        bool: True if backend is healthy, False otherwise
    """
    try:
        response = requests.get(
            f"{BACKEND_URL}/health",
            timeout=REQUEST_TIMEOUT
        )
        return response.status_code == 200
    except Exception as e:
        st.error(f"Backend health check failed: {str(e)}")
        return False

def query_llm(prompt: str, use_streaming: bool = False) -> Optional[str]:
    """
    Send a query to the FastAPI backend and get an LLM response.
    
    Args:
        prompt: User's question or prompt
        use_streaming: Whether to use streaming response
        
    Returns:
        str: The LLM's response, or None if request failed
    """
    try:
        endpoint = "/query/stream" if use_streaming else "/query"
        url = f"{BACKEND_URL}{endpoint}"
        
        payload = {"prompt": prompt}
        
        if use_streaming:
            return query_llm_streaming(url, payload)
        else:
            return query_llm_regular(url, payload)
            
    except requests.exceptions.ConnectionError:
        st.error(f"❌ Cannot connect to backend at {BACKEND_URL}")
        st.info("Make sure the FastAPI backend is running: `uv run uvicorn main:app --reload --port 8000`")
        return None
    except requests.exceptions.Timeout:
        st.error(f"⏱️ Request timeout. The backend took longer than {REQUEST_TIMEOUT} seconds to respond.")
        return None
    except Exception as e:
        st.error(f"❌ Error communicating with backend: {str(e)}")
        return None

def query_llm_regular(url: str, payload: dict) -> Optional[str]:
    """
    Send a regular (non-streaming) query to the backend.
    
    Args:
        url: The backend endpoint URL
        payload: The request payload
        
    Returns:
        str: The response text, or None if failed
    """
    try:
        response = requests.post(url, json=payload, timeout=REQUEST_TIMEOUT)
        
        if response.status_code == 200:
            data = response.json()
            return data.get("answer", "No response received")
        else:
            error_detail = response.json().get("detail", "Unknown error")
            st.error(f"Backend error ({response.status_code}): {error_detail}")
            return None
    except Exception as e:
        st.error(f"Failed to parse response: {str(e)}")
        return None

def query_llm_streaming(url: str, payload: dict) -> Optional[str]:
    """
    Stream a query response from the backend using Server-Sent Events.
    
    Args:
        url: The backend endpoint URL
        payload: The request payload
        
    Returns:
        str: The complete streamed response
    """
    try:
        response = requests.post(url, json=payload, stream=True, timeout=REQUEST_TIMEOUT)
        
        if response.status_code == 200:
            result = ""
            placeholder = st.empty()
            
            for line in response.iter_lines():
                if line:
                    line_str = line.decode("utf-8") if isinstance(line, bytes) else line
                    if line_str.startswith("data: "):
                        chunk = line_str[6:]
                        result += chunk
                        placeholder.markdown(result + "▌")
            
            placeholder.markdown(result)
            return result
        else:
            st.error(f"Streaming error ({response.status_code})")
            return None
    except Exception as e:
        st.error(f"Streaming failed: {str(e)}")
        return None

# ========================================
# Sidebar Configuration
# ========================================
with st.sidebar:
    st.title("⚙️ Configuration")
    
    # Backend Status
    st.subheader("Backend Status")
    backend_healthy = check_backend_health()
    
    if backend_healthy:
        st.markdown(
            '<span class="status-badge status-healthy">✅ Backend Connected</span>',
            unsafe_allow_html=True
        )
    else:
        st.markdown(
            '<span class="status-badge status-error">❌ Backend Disconnected</span>',
            unsafe_allow_html=True
        )
    
    st.caption(f"URL: {BACKEND_URL}")
    
    # Response Settings
    st.subheader("Response Settings")
    use_streaming = st.checkbox(
        "Use Streaming Response",
        value=DEFAULT_STREAMING,
        help="Stream responses word-by-word for real-time feedback"
    )
    
    # Session Information
    st.subheader("Session Info")
    if "session_id" not in st.session_state:
        st.session_state.session_id = str(uuid.uuid4())
    
    st.caption(f"Session ID: `{st.session_state.session_id[:8]}...`")
    
    # Clear Chat History
    if st.button("🗑️ Clear Chat History", use_container_width=True):
        st.session_state.messages = []
        st.rerun()
    
    # Information
    st.subheader("ℹ️ About")
    st.markdown("""
        This application connects to a FastAPI backend 
        powered by OpenAI's language model.
        
        - **Streaming**: Real-time response generation
        - **Session Management**: Unique session tracking
        - **Error Handling**: Graceful error management
    """)

# ========================================
# Main Chat Interface
# ========================================
st.title("🤖 AI Chat Assistant")
st.markdown("Chat with an AI-powered assistant powered by FastAPI and OpenAI.")

# Initialize session state
if "messages" not in st.session_state:
    st.session_state.messages = []

# Display chat history
for message in st.session_state.messages:
    role_emoji = "👤" if message["role"] == "user" else "🤖"
    with st.chat_message(message["role"], avatar=role_emoji):
        st.markdown(message["content"])
        if "timestamp" in message:
            st.caption(f"__{message['timestamp']}__")

# Chat input area
if prompt := st.chat_input("Ask me anything..."):
    # Check backend before proceeding
    if not backend_healthy and not check_backend_health():
        st.error("⚠️ Cannot connect to backend. Please ensure it's running.")
    else:
        # Add user message to history
        user_message = {
            "role": "user",
            "content": prompt,
            "timestamp": datetime.now().strftime("%H:%M:%S")
        }
        st.session_state.messages.append(user_message)
        
        # Display user message
        with st.chat_message("user", avatar="👤"):
            st.markdown(prompt)
            st.caption(user_message["timestamp"])
        
        # Query the LLM
        with st.spinner("🔄 Getting response..."):
            response = query_llm(prompt, use_streaming=use_streaming)
        
        # Add assistant response to history
        if response:
            assistant_message = {
                "role": "assistant",
                "content": response,
                "timestamp": datetime.now().strftime("%H:%M:%S")
            }
            st.session_state.messages.append(assistant_message)
            
            # Display assistant message
            with st.chat_message("assistant", avatar="🤖"):
                st.markdown(response)
                st.caption(assistant_message["timestamp"])

# Footer
st.divider()
col1, col2, col3 = st.columns(3)
with col1:
    st.caption(f"💬 Messages: {len(st.session_state.messages)}")
with col2:
    st.caption(f"🔗 Backend: {BACKEND_URL}")
with col3:
    st.caption("Powered by FastAPI + OpenAI + Streamlit")
