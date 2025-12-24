import { ChatRequest, ChatResponse } from '@/types/chat';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function sendMessage(query: string, conversationId?: string): Promise<ChatResponse> {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query,
            conversationId,
        } as ChatRequest),
    });

    if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
    }

    return response.json();
}

export function createStreamConnection(jobId: string): EventSource {
    return new EventSource(`${API_BASE_URL}/api/stream/${jobId}`);
}

export function getPDFUrl(documentId: string): string {
    return `${API_BASE_URL}/api/pdf/${documentId}`;
}
