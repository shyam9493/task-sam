import { create } from 'zustand';
import { Message } from '@/types/chat';

interface ChatState {
    messages: Message[];
    currentStreamingMessage: Message | null;
    isStreaming: boolean;
    conversationId: string | null;

    // Actions
    addMessage: (message: Message) => void;
    updateStreamingMessage: (content: string) => void;
    setStreamingMessage: (message: Message | null) => void;
    addCitationToCurrentMessage: (citation: any) => void;
    addSourceToCurrentMessage: (source: any) => void;
    addToolCallToCurrentMessage: (toolCall: any) => void;
    updateToolCallStatus: (toolCallId: string, status: 'running' | 'completed' | 'failed') => void;
    finalizeStreamingMessage: () => void;
    clearChat: () => void;
    setConversationId: (id: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
    messages: [],
    currentStreamingMessage: null,
    isStreaming: false,
    conversationId: null,

    addMessage: (message) =>
        set((state) => ({
            messages: [...state.messages, message],
        })),

    updateStreamingMessage: (content) =>
        set((state) => {
            if (!state.currentStreamingMessage) return state;
            return {
                currentStreamingMessage: {
                    ...state.currentStreamingMessage,
                    content: state.currentStreamingMessage.content + content,
                },
            };
        }),

    setStreamingMessage: (message) =>
        set({
            currentStreamingMessage: message,
            isStreaming: message !== null,
        }),

    addCitationToCurrentMessage: (citation) =>
        set((state) => {
            if (!state.currentStreamingMessage) return state;
            return {
                currentStreamingMessage: {
                    ...state.currentStreamingMessage,
                    citations: [...(state.currentStreamingMessage.citations || []), citation],
                },
            };
        }),

    addSourceToCurrentMessage: (source) =>
        set((state) => {
            if (!state.currentStreamingMessage) return state;
            return {
                currentStreamingMessage: {
                    ...state.currentStreamingMessage,
                    sources: [...(state.currentStreamingMessage.sources || []), source],
                },
            };
        }),

    addToolCallToCurrentMessage: (toolCall) =>
        set((state) => {
            if (!state.currentStreamingMessage) return state;
            return {
                currentStreamingMessage: {
                    ...state.currentStreamingMessage,
                    toolCalls: [...(state.currentStreamingMessage.toolCalls || []), toolCall],
                },
            };
        }),

    updateToolCallStatus: (toolCallId, status) =>
        set((state) => {
            if (!state.currentStreamingMessage) return state;
            return {
                currentStreamingMessage: {
                    ...state.currentStreamingMessage,
                    toolCalls: state.currentStreamingMessage.toolCalls?.map((tc) =>
                        tc.id === toolCallId ? { ...tc, status } : tc
                    ),
                },
            };
        }),

    finalizeStreamingMessage: () =>
        set((state) => {
            if (!state.currentStreamingMessage) return state;
            return {
                messages: [...state.messages, state.currentStreamingMessage],
                currentStreamingMessage: null,
                isStreaming: false,
            };
        }),

    clearChat: () =>
        set({
            messages: [],
            currentStreamingMessage: null,
            isStreaming: false,
            conversationId: null,
        }),

    setConversationId: (id) =>
        set({
            conversationId: id,
        }),
}));
