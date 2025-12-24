'use client';

import { Message } from '@/types/chat';
import { CitationBadge } from './CitationBadge';
import { SourceCard } from './SourceCard';
import { ToolCallIndicator } from './ToolCallIndicator';
import { StreamingCursor } from '../ui/StreamingCursor';
import { cn } from '@/lib/utils';

interface AIMessageProps {
    message: Message;
}

export function AIMessage({ message }: AIMessageProps) {
    // Parse content to insert citation badges
    const renderContentWithCitations = () => {
        if (!message.citations || message.citations.length === 0) {
            return (
                <>
                    {message.content}
                    {message.isStreaming && <StreamingCursor />}
                </>
            );
        }

        // Simple citation rendering - replace [1], [2], etc. with badge components
        const parts: (string | JSX.Element)[] = [];
        let lastIndex = 0;
        const citationRegex = /\[(\d+)\]/g;
        let match;

        while ((match = citationRegex.exec(message.content)) !== null) {
            const citationNum = parseInt(match[1]);
            const citation = message.citations.find((c) => c.id === citationNum);

            // Add text before citation
            if (match.index > lastIndex) {
                parts.push(message.content.slice(lastIndex, match.index));
            }

            // Add citation badge
            if (citation) {
                parts.push(
                    <CitationBadge
                        key={`citation-${citationNum}-${match.index}`}
                        citationNumber={citationNum}
                        documentId={citation.documentId}
                        documentTitle={citation.documentTitle}
                        pageNumber={citation.pageNumber}
                        text={citation.text}
                    />
                );
            } else {
                parts.push(match[0]); // Keep original if citation not found
            }

            lastIndex = match.index + match[0].length;
        }

        // Add remaining text
        if (lastIndex < message.content.length) {
            parts.push(message.content.slice(lastIndex));
        }

        return (
            <>
                {parts.map((part, idx) =>
                    typeof part === 'string' ? <span key={idx}>{part}</span> : part
                )}
                {message.isStreaming && <StreamingCursor />}
            </>
        );
    };

    return (
        <div className="flex flex-col gap-3 w-full">
            {/* Tool calls */}
            {message.toolCalls && message.toolCalls.length > 0 && (
                <div className="flex flex-col gap-2">
                    {message.toolCalls.map((toolCall) => (
                        <ToolCallIndicator key={toolCall.id} toolCall={toolCall} />
                    ))}
                </div>
            )}

            {/* AI response */}
            <div className="flex justify-start w-full">
                <div
                    className={cn(
                        'max-w-[85%] px-4 py-3',
                        'bg-white border border-zinc-200',
                        'rounded-2xl rounded-tl-sm',
                        'shadow-sm'
                    )}
                >
                    <div className="text-sm leading-relaxed text-zinc-800 whitespace-pre-wrap break-words">
                        {renderContentWithCitations()}
                    </div>
                </div>
            </div>

            {/* Source cards */}
            {message.sources && message.sources.length > 0 && (
                <div className="flex flex-col gap-2 ml-2">
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                        Sources
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {message.sources.map((source, idx) => (
                            <SourceCard key={`${source.documentId}-${idx}`} source={source} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
