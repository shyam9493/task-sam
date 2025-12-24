'use client';

import { useEffect, useRef } from 'react';
import { useChatStore } from '@/store/chatStore';
import { createStreamConnection } from '@/lib/api';
import { StreamEvent } from '@/types/chat';

export function useStreamingChat(jobId: string | null) {
    const eventSourceRef = useRef<EventSource | null>(null);
    const setStreamingMessage = useChatStore((state) => state.setStreamingMessage);
    const updateStreamingMessage = useChatStore((state) => state.updateStreamingMessage);
    const addCitationToCurrentMessage = useChatStore((state) => state.addCitationToCurrentMessage);
    const addSourceToCurrentMessage = useChatStore((state) => state.addSourceToCurrentMessage);
    const addToolCallToCurrentMessage = useChatStore((state) => state.addToolCallToCurrentMessage);
    const upsertToolCallToCurrentMessage = useChatStore((state) => state.upsertToolCallToCurrentMessage);
    const updateToolCallStatus = useChatStore((state) => state.updateToolCallStatus);
    const finalizeStreamingMessage = useChatStore((state) => state.finalizeStreamingMessage);

    useEffect(() => {
        if (!jobId) return;

        // Initialize streaming message
        setStreamingMessage({
            id: `msg-${Date.now()}`,
            role: 'assistant',
            content: '',
            timestamp: new Date(),
            isStreaming: true,
            citations: [],
            sources: [],
            toolCalls: [],
        });

        // Create SSE connection
        const eventSource = createStreamConnection(jobId);
        eventSourceRef.current = eventSource;

        eventSource.onmessage = (event) => {
            try {
                const streamEvent: StreamEvent = JSON.parse(event.data);

                switch (streamEvent.event) {
                    case 'text': {
                        const data = streamEvent.data as { text?: string; delta?: string };
                        if (data.delta) {
                            updateStreamingMessage(data.delta);
                        } else if (data.text) {
                            updateStreamingMessage(data.text);
                        }
                        break;
                    }

                    case 'citation': {
                        const data = streamEvent.data as { citation: any };
                        addCitationToCurrentMessage(data.citation);
                        break;
                    }

                    case 'source': {
                        const data = streamEvent.data as { source: any };
                        addSourceToCurrentMessage(data.source);
                        break;
                    }

                    case 'tool_call': {
                        const data = streamEvent.data as { toolCall: any };
                        upsertToolCallToCurrentMessage(data.toolCall);
                        break;
                    }

                    case 'done': {
                        finalizeStreamingMessage();
                        eventSource.close();
                        break;
                    }

                    case 'error': {
                        const data = streamEvent.data as { error: string; message: string };
                        console.error('Streaming error:', data);
                        finalizeStreamingMessage();
                        eventSource.close();
                        break;
                    }
                }
            } catch (error) {
                console.error('Failed to parse stream event:', error);
            }
        };

        eventSource.onerror = (error) => {
            console.error('SSE connection error:', error);
            finalizeStreamingMessage();
            eventSource.close();
        };

        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, [
        jobId,
        setStreamingMessage,
        updateStreamingMessage,
        addCitationToCurrentMessage,
        addSourceToCurrentMessage,
        addToolCallToCurrentMessage,
        upsertToolCallToCurrentMessage,
        updateToolCallStatus,
        finalizeStreamingMessage,
    ]);
}
