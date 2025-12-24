'use client';

import { useRef, useEffect } from 'react';
import { useChatStore } from '@/store/chatStore';
import { UserMessage } from './UserMessage';
import { AIMessage } from './AIMessage';
import { LoadingDots } from '../ui/LoadingDots';
import { cn } from '@/lib/utils';

export function MessageList() {
    const messages = useChatStore((state) => state.messages);
    const currentStreamingMessage = useChatStore((state) => state.currentStreamingMessage);
    const isStreaming = useChatStore((state) => state.isStreaming);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, currentStreamingMessage]);

    return (
        <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="max-w-3xl mx-auto flex flex-col gap-6">
                {messages.length === 0 && !currentStreamingMessage && (
                    <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
                        <div className="text-4xl">💬</div>
                        <h2 className="text-2xl font-semibold text-zinc-800">
                            AI Search Chat
                        </h2>
                        <p className="text-zinc-500 text-center max-w-md">
                            Ask questions about documents and get AI-powered answers with citations
                        </p>
                    </div>
                )}

                {messages.map((message) => (
                    <div key={message.id}>
                        {message.role === 'user' ? (
                            <UserMessage message={message} />
                        ) : (
                            <AIMessage message={message} />
                        )}
                    </div>
                ))}

                {currentStreamingMessage && (
                    <AIMessage message={currentStreamingMessage} />
                )}

                {isStreaming && !currentStreamingMessage && (
                    <div className="flex justify-start">
                        <div className={cn(
                            'px-4 py-3',
                            'bg-white border border-zinc-200',
                            'rounded-2xl rounded-tl-sm',
                            'shadow-sm'
                        )}>
                            <LoadingDots />
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>
        </div>
    );
}
