// Chat message types
export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    citations?: Citation[];
    sources?: SourceCard[];
    toolCalls?: ToolCall[];
    timestamp: Date;
    isStreaming?: boolean;
}

// Citation metadata
export interface Citation {
    id: number;
    documentId: string;
    documentTitle: string;
    pageNumber: number;
    text: string;
    startIndex?: number;
    endIndex?: number;
}

// Source card for cited documents
export interface SourceCard {
    documentId: string;
    title: string;
    pageNumber: number;
    excerpt: string;
    url?: string;
}

// Tool call/reasoning steps
export interface ToolCall {
    id: string;
    name: string;
    status: 'running' | 'completed' | 'failed';
    description: string;
    timestamp: Date;
}

// SSE stream event types
export type StreamEventType = 'text' | 'citation' | 'tool_call' | 'source' | 'done' | 'error';

export interface StreamEvent {
    event: StreamEventType;
    data: StreamTextData | StreamCitationData | StreamToolCallData | StreamSourceData | StreamErrorData;
}

export interface StreamTextData {
    text: string;
    delta?: string;
}

export interface StreamCitationData {
    citation: Citation;
}

export interface StreamToolCallData {
    toolCall: ToolCall;
}

export interface StreamSourceData {
    source: SourceCard;
}

export interface StreamErrorData {
    error: string;
    message: string;
}

// API request/response types
export interface ChatRequest {
    query: string;
    conversationId?: string;
}

export interface ChatResponse {
    jobId: string;
    conversationId: string;
}
