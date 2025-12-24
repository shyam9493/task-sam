from pydantic import BaseModel
from typing import List, Optional, Literal

# Request/Response models
class ChatRequest(BaseModel):
    query: str
    conversationId: Optional[str] = None

class ChatResponse(BaseModel):
    jobId: str
    conversationId: str

# Citation model
class Citation(BaseModel):
    id: int
    documentId: str
    documentTitle: str
    pageNumber: int
    text: str
    startIndex: Optional[int] = None
    endIndex: Optional[int] = None

# Source card model
class SourceCard(BaseModel):
    documentId: str
    title: str
    pageNumber: int
    excerpt: str
    url: Optional[str] = None

# Tool call model
class ToolCall(BaseModel):
    id: str
    name: str
    status: Literal['running', 'completed', 'failed']
    description: str

# Stream event models
StreamEventType = Literal['text', 'citation', 'tool_call', 'source', 'done', 'error']

class StreamTextData(BaseModel):
    text: Optional[str] = None
    delta: Optional[str] = None

class StreamCitationData(BaseModel):
    citation: Citation

class StreamToolCallData(BaseModel):
    toolCall: ToolCall

class StreamSourceData(BaseModel):
    source: SourceCard

class StreamErrorData(BaseModel):
    error: str
    message: str

class StreamEvent(BaseModel):
    event: StreamEventType
    data: dict  # Will be one of the above data models
