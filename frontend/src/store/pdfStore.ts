import { create } from 'zustand';

interface PDFViewerState {
    isOpen: boolean;
    documentId: string | null;
    documentTitle: string | null;
    pageNumber: number;
    highlightedText: string | null;
    highlightCoordinates: {
        pageNumber: number;
        x: number;
        y: number;
        width: number;
        height: number;
    } | null;

    // Actions
    openPDF: (documentId: string, documentTitle: string, pageNumber: number, highlightedText?: string) => void;
    closePDF: () => void;
    setPageNumber: (pageNumber: number) => void;
    setHighlight: (coordinates: PDFViewerState['highlightCoordinates']) => void;
}

export const usePDFStore = create<PDFViewerState>((set) => ({
    isOpen: false,
    documentId: null,
    documentTitle: null,
    pageNumber: 1,
    highlightedText: null,
    highlightCoordinates: null,

    openPDF: (documentId, documentTitle, pageNumber, highlightedText) =>
        set({
            isOpen: true,
            documentId,
            documentTitle,
            pageNumber,
            highlightedText: highlightedText || null,
        }),

    closePDF: () =>
        set({
            isOpen: false,
            documentId: null,
            documentTitle: null,
            pageNumber: 1,
            highlightedText: null,
            highlightCoordinates: null,
        }),

    setPageNumber: (pageNumber) =>
        set({
            pageNumber,
        }),

    setHighlight: (coordinates) =>
        set({
            highlightCoordinates: coordinates,
        }),
}));
