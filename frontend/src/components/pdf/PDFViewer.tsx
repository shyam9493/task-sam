'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Document, Page, pdfjs } from 'react-pdf';
import { usePDFStore } from '@/store/pdfStore';
import { getPDFUrl } from '@/lib/api';
import { cn } from '@/lib/utils';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export function PDFViewer() {
    const documentId = usePDFStore((state) => state.documentId);
    const documentTitle = usePDFStore((state) => state.documentTitle);
    const pageNumber = usePDFStore((state) => state.pageNumber);
    const setPageNumber = usePDFStore((state) => state.setPageNumber);
    const closePDF = usePDFStore((state) => state.closePDF);
    const highlightedText = usePDFStore((state) => state.highlightedText);

    const [numPages, setNumPages] = useState<number>(0);
    const [scale, setScale] = useState<number>(1.0);

    const pdfUrl: string | null = documentId ? getPDFUrl(documentId) : null;

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
    };

    const goToPrevPage = () => {
        setPageNumber(Math.max(1, pageNumber - 1));
    };

    const goToNextPage = () => {
        setPageNumber(Math.min(numPages, pageNumber + 1));
    };

    const zoomIn = () => {
        setScale((prev) => Math.min(2.0, prev + 0.2));
    };

    const zoomOut = () => {
        setScale((prev) => Math.max(0.5, prev - 0.2));
    };

    return (
        <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="w-[40%] h-full bg-white border-l border-zinc-200 flex flex-col"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 bg-white">
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-zinc-900 truncate">
                        {documentTitle || 'Document'}
                    </h3>
                    <p className="text-xs text-zinc-500">
                        Page {pageNumber} of {numPages}
                    </p>
                </div>
                <button
                    onClick={closePDF}
                    className={cn(
                        'p-2 rounded-lg',
                        'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100',
                        'transition-colors duration-150',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500'
                    )}
                    aria-label="Close PDF viewer"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-200 bg-zinc-50">
                <div className="flex items-center gap-2">
                    <button
                        onClick={goToPrevPage}
                        disabled={pageNumber <= 1}
                        className={cn(
                            'p-1.5 rounded',
                            'text-zinc-600 hover:bg-zinc-200',
                            'disabled:opacity-30 disabled:cursor-not-allowed',
                            'transition-colors duration-150'
                        )}
                        aria-label="Previous page"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={goToNextPage}
                        disabled={pageNumber >= numPages}
                        className={cn(
                            'p-1.5 rounded',
                            'text-zinc-600 hover:bg-zinc-200',
                            'disabled:opacity-30 disabled:cursor-not-allowed',
                            'transition-colors duration-150'
                        )}
                        aria-label="Next page"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={zoomOut}
                        className={cn(
                            'p-1.5 rounded',
                            'text-zinc-600 hover:bg-zinc-200',
                            'transition-colors duration-150'
                        )}
                        aria-label="Zoom out"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                    </button>
                    <span className="text-xs text-zinc-600 min-w-[3rem] text-center">
                        {Math.round(scale * 100)}%
                    </span>
                    <button
                        onClick={zoomIn}
                        className={cn(
                            'p-1.5 rounded',
                            'text-zinc-600 hover:bg-zinc-200',
                            'transition-colors duration-150'
                        )}
                        aria-label="Zoom in"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* PDF Content */}
            <div className="flex-1 overflow-auto bg-zinc-100 p-4">
                <div className="flex justify-center">
                    {pdfUrl && (
                        <Document
                            file={pdfUrl}
                            onLoadSuccess={onDocumentLoadSuccess}
                            loading={
                                <div className="flex items-center justify-center p-8">
                                    <div className="text-zinc-500">Loading PDF...</div>
                                </div>
                            }
                            error={
                                <div className="flex items-center justify-center p-8">
                                    <div className="text-red-500">Failed to load PDF</div>
                                </div>
                            }
                        >
                            <Page
                                pageNumber={pageNumber}
                                scale={scale}
                                renderTextLayer={true}
                                renderAnnotationLayer={true}
                            />
                        </Document>
                    )}
                </div>
            </div>

            {/* Highlighted text info */}
            {highlightedText && (
                <div className="px-4 py-3 border-t border-zinc-200 bg-yellow-50">
                    <p className="text-xs font-medium text-yellow-800 mb-1">Highlighted citation:</p>
                    <p className="text-xs text-yellow-700 line-clamp-2">{highlightedText}</p>
                </div>
            )}
        </motion.div>
    );
}
