'use client';

import { usePDFStore } from '@/store/pdfStore';
import { SourceCard as SourceCardType } from '@/types/chat';
import { cn } from '@/lib/utils';

interface SourceCardProps {
    source: SourceCardType;
}

export function SourceCard({ source }: SourceCardProps) {
    const openPDF = usePDFStore((state) => state.openPDF);

    const handleClick = () => {
        openPDF(source.documentId, source.title, source.pageNumber, source.excerpt);
    };

    return (
        <button
            onClick={handleClick}
            className={cn(
                'flex flex-col items-start gap-2 p-3',
                'bg-white border border-zinc-200 rounded-lg',
                'hover:border-zinc-300 hover:shadow-sm',
                'transition-all duration-200',
                'text-left w-full',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            )}
        >
            <div className="flex items-start justify-between w-full gap-2">
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-zinc-900 truncate">
                        {source.title}
                    </h4>
                    <p className="text-xs text-zinc-500 mt-0.5">
                        Page {source.pageNumber}
                    </p>
                </div>
                <svg
                    className="w-4 h-4 text-zinc-400 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                </svg>
            </div>
            <p className="text-xs text-zinc-600 line-clamp-2">
                {source.excerpt}
            </p>
        </button>
    );
}
