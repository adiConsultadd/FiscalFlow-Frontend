import { useState, useEffect, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, FileText, Loader2, Search, ExternalLink } from 'lucide-react';
import { clsx } from 'clsx';
import type { SourceChunk } from '../../types';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Import react-pdf styles
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

interface PDFViewerProps {
    source: SourceChunk;
    isOpen: boolean;
    onClose: () => void;
}

// Helper to construct PDF path from source metadata
function constructPdfPath(source: SourceChunk): string | null {
    const { fiscal_year, fiscal_quarter, provenance, company_ticker } = source;
    const company = company_ticker?.toLowerCase() || 'one97';

    if (!fiscal_year || !fiscal_quarter || !provenance.file_name) {
        return null;
    }

    // Construct path: /documents/{company}/{FY}/{Q}/{filename}
    return `/documents/${company}/${fiscal_year}/${fiscal_quarter}/${provenance.file_name}`;
}

export function PDFViewer({ source, isOpen, onClose }: PDFViewerProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.2);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const pdfPath = constructPdfPath(source);
    const targetPage = source.provenance.page_index
        ? source.provenance.page_index + 1
        : parseInt(source.provenance.page_label || '1');

    // Initialize to target page when opened
    useEffect(() => {
        if (isOpen && targetPage) {
            setPageNumber(targetPage);
        }
    }, [isOpen, targetPage]);

    const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setLoading(false);
        setError(null);
    }, []);

    const onDocumentLoadError = useCallback((error: Error) => {
        console.error('PDF load error:', error);
        setError('Failed to load PDF document');
        setLoading(false);
    }, []);

    const goToPrevPage = () => setPageNumber(prev => Math.max(1, prev - 1));
    const goToNextPage = () => setPageNumber(prev => Math.min(numPages, prev + 1));
    const zoomIn = () => setScale(prev => Math.min(2.5, prev + 0.2));
    const zoomOut = () => setScale(prev => Math.max(0.5, prev - 0.2));

    // Handle keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') goToPrevPage();
            if (e.key === 'ArrowRight') goToNextPage();
            if (e.key === '+' || e.key === '=') zoomIn();
            if (e.key === '-') zoomOut();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, numPages, onClose]);

    if (!pdfPath) {
        return null;
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex flex-col bg-black/90 backdrop-blur-sm"
                    onClick={onClose}
                >
                    {/* Header */}
                    <div
                        className="flex items-center justify-between px-4 py-3 bg-[var(--bg-secondary)] border-b border-[var(--border-default)]"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--error)] to-[var(--error)]/70 flex items-center justify-center">
                                <FileText className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h3 className="font-medium text-[var(--text-primary)] text-sm truncate max-w-[300px]">
                                    {source.provenance.file_name}
                                </h3>
                                <p className="text-xs text-[var(--text-muted)]">
                                    {source.fiscal_year} • {source.fiscal_quarter} • Page {pageNumber} of {numPages || '...'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Page Navigation */}
                            <div className="flex items-center gap-1 px-2 py-1 bg-[var(--bg-tertiary)] rounded-lg">
                                <button
                                    onClick={goToPrevPage}
                                    disabled={pageNumber <= 1}
                                    className="p-1 rounded hover:bg-[var(--bg-elevated)] disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-4 h-4 text-[var(--text-secondary)]" />
                                </button>
                                <input
                                    type="number"
                                    min={1}
                                    max={numPages || 1}
                                    value={pageNumber}
                                    onChange={(e) => setPageNumber(Math.max(1, Math.min(numPages, parseInt(e.target.value) || 1)))}
                                    className="w-12 text-center text-sm bg-transparent text-[var(--text-primary)] focus:outline-none"
                                />
                                <span className="text-xs text-[var(--text-muted)]">/ {numPages || '?'}</span>
                                <button
                                    onClick={goToNextPage}
                                    disabled={pageNumber >= numPages}
                                    className="p-1 rounded hover:bg-[var(--bg-elevated)] disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" />
                                </button>
                            </div>

                            {/* Zoom Controls */}
                            <div className="flex items-center gap-1 px-2 py-1 bg-[var(--bg-tertiary)] rounded-lg">
                                <button onClick={zoomOut} className="p-1 rounded hover:bg-[var(--bg-elevated)]">
                                    <ZoomOut className="w-4 h-4 text-[var(--text-secondary)]" />
                                </button>
                                <span className="text-xs text-[var(--text-muted)] w-12 text-center">{Math.round(scale * 100)}%</span>
                                <button onClick={zoomIn} className="p-1 rounded hover:bg-[var(--bg-elevated)]">
                                    <ZoomIn className="w-4 h-4 text-[var(--text-secondary)]" />
                                </button>
                            </div>

                            {/* Go to Citation Page */}
                            {targetPage && targetPage !== pageNumber && (
                                <button
                                    onClick={() => setPageNumber(targetPage)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--primary-500)]/20 text-[var(--primary-400)] text-xs font-medium rounded-lg hover:bg-[var(--primary-500)]/30"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    Go to page {targetPage}
                                </button>
                            )}

                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Citation Context */}
                    <div
                        className="px-4 py-3 bg-[var(--primary-500)]/10 border-b border-[var(--primary-500)]/20"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-start gap-3 max-w-4xl mx-auto">
                            <Search className="w-4 h-4 text-[var(--primary-400)] mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-xs font-medium text-[var(--primary-400)] mb-1">
                                    Looking for this text on page {targetPage}:
                                </p>
                                <p className="text-sm text-[var(--text-secondary)] line-clamp-2 italic">
                                    "{source.text_content.slice(0, 200)}..."
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* PDF Content */}
                    <div
                        className="flex-1 overflow-auto flex items-start justify-center py-6 px-4"
                        onClick={e => e.stopPropagation()}
                    >
                        {loading && (
                            <div className="flex flex-col items-center justify-center gap-3 py-20">
                                <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin" />
                                <p className="text-sm text-[var(--text-muted)]">Loading document...</p>
                            </div>
                        )}

                        {error && (
                            <div className="flex flex-col items-center justify-center gap-3 py-20">
                                <FileText className="w-12 h-12 text-[var(--error)] opacity-50" />
                                <p className="text-sm text-[var(--error)]">{error}</p>
                                <p className="text-xs text-[var(--text-muted)]">Path: {pdfPath}</p>
                            </div>
                        )}

                        <Document
                            file={pdfPath}
                            onLoadSuccess={onDocumentLoadSuccess}
                            onLoadError={onDocumentLoadError}
                            loading={null}
                            className="shadow-2xl"
                        >
                            <Page
                                pageNumber={pageNumber}
                                scale={scale}
                                className={clsx(
                                    'bg-white rounded-lg overflow-hidden',
                                    loading && 'opacity-0'
                                )}
                                renderTextLayer={true}
                                renderAnnotationLayer={true}
                            />
                        </Document>
                    </div>

                    {/* Footer hint */}
                    <div className="px-4 py-2 bg-[var(--bg-secondary)] border-t border-[var(--border-default)] text-center">
                        <p className="text-xs text-[var(--text-muted)]">
                            Press <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] rounded text-[10px]">←</kbd> <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] rounded text-[10px]">→</kbd> to navigate • <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] rounded text-[10px]">+</kbd> <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] rounded text-[10px]">-</kbd> to zoom • <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] rounded text-[10px]">Esc</kbd> to close
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
