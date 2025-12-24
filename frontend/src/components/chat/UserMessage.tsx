'use client';

import { Message } from '@/types/chat';
import { cn } from '@/lib/utils';

interface UserMessageProps {
    message: Message;
}

export function UserMessage({ message }: UserMessageProps) {
    return (
        <div className="flex justify-end w-full">
            <div
                className={cn(
                    'max-w-[80%] px-4 py-3',
                    'bg-blue-600 text-white',
                    'rounded-2xl rounded-tr-sm',
                    'shadow-sm'
                )}
            >
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {message.content}
                </p>
            </div>
        </div>
    );
}
