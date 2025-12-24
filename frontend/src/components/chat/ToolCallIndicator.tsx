'use client';

import { motion } from 'framer-motion';
import { ToolCall as ToolCallType } from '@/types/chat';
import { cn } from '@/lib/utils';

interface ToolCallIndicatorProps {
    toolCall: ToolCallType;
}

const iconMap: Record<string, string> = {
    search_documents: '🔍',
    retrieve_pdf: '📄',
    analyze_content: '🤔',
    thinking: '💭',
    default: '⚙️',
};

export function ToolCallIndicator({ toolCall }: ToolCallIndicatorProps) {
    const icon = iconMap[toolCall.name] || iconMap.default;
    const isRunning = toolCall.status === 'running';

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn(
                'flex items-center gap-2 px-3 py-2',
                'bg-zinc-50 border border-zinc-200 rounded-lg',
                'text-sm text-zinc-700'
            )}
        >
            <span className={cn('text-base', isRunning && 'animate-pulse')}>
                {icon}
            </span>
            <span className="font-medium">{toolCall.description}</span>
            {isRunning && (
                <motion.div
                    className="ml-auto flex gap-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <span className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce" />
                </motion.div>
            )}
            {toolCall.status === 'completed' && (
                <span className="ml-auto text-green-600">✓</span>
            )}
            {toolCall.status === 'failed' && (
                <span className="ml-auto text-red-600">✗</span>
            )}
        </motion.div>
    );
}
