'use client';

import { usePDFStore } from '@/store/pdfStore';
import { cn } from '@/lib/utils';

interface CitationBadgeProps {
    citationNumber: number;
    documentId: string;
    documentTitle: string;
    pageNumber: number;
    text: string;
}

export function CitationBadge({
    citationNumber,
    documentId,
    documentTitle,
    pageNumber,
    text,
}: CitationBadgeProps) {
    const openPDF = usePDFStore((state) => state.openPDF);

    const handleClick = () => {
        openPDF(documentId, documentTitle, pageNumber, text);
    };

    return (
        <button
            onClick={handleClick}
            className={cn(
                'inline-flex items-center justify-center',
                'min-w-[20px] h-5 px-1.5',
                'text-xs font-medium',
                'bg-blue-100 text-blue-700',
                'border border-blue-300',
                'rounded',
                'hover:bg-blue-200 hover:border-blue-400',
                'transition-colors duration-150',
                'cursor-pointer',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1'
            )}
            aria-label={`View citation ${citationNumber} from ${documentTitle}`}
        >
            {citationNumber}
        </button>
    );
}
