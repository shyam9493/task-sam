'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { useChatStore } from '@/store/chatStore';
import { cn } from '@/lib/utils';

interface InputBoxProps {
    onSendMessage: (message: string) => void;
}

export function InputBox({ onSendMessage }: InputBoxProps) {
    const [input, setInput] = useState('');
    const isStreaming = useChatStore((state) => state.isStreaming);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSend = () => {
        if (!input.trim() || isStreaming) return;
        onSendMessage(input.trim());
        setInput('');

        // Reset textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);

        // Auto-resize textarea
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    };

    return (
        <div className="border-t border-zinc-200 bg-white px-4 py-4">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-end gap-2">
                    <div className="flex-1 relative">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={handleInput}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask a question..."
                            disabled={isStreaming}
                            rows={1}
                            className={cn(
                                'w-full px-4 py-3 pr-12',
                                'bg-zinc-50 border border-zinc-300 rounded-2xl',
                                'text-sm text-zinc-900 placeholder-zinc-400',
                                'resize-none overflow-y-auto',
                                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                                'disabled:opacity-50 disabled:cursor-not-allowed',
                                'transition-all duration-150'
                            )}
                            style={{ maxHeight: '200px' }}
                        />
                    </div>
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isStreaming}
                        className={cn(
                            'flex items-center justify-center',
                            'w-10 h-10',
                            'bg-blue-600 text-white rounded-full',
                            'hover:bg-blue-700',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            'transition-colors duration-150',
                            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                        )}
                        aria-label="Send message"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                            />
                        </svg>
                    </button>
                </div>
                <p className="text-xs text-zinc-400 mt-2 text-center">
                    Press Enter to send, Shift+Enter for new line
                </p>
            </div>
        </div>
    );
}
