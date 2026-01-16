import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Copy, Check, Sparkles } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Button } from '../ui/Button';
import { CitationMarker } from './CitationMarker';
import { SkeletonText } from '../ui/Skeleton';

interface AnswerPanelProps {
    answer: string;
    isLoading?: boolean;
}

export function AnswerPanel({ answer, isLoading }: AnswerPanelProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(answer);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Process markdown to handle citations
    const processedAnswer = useMemo(() => {
        // Replace [Evidence N] with a placeholder that won't be affected by markdown
        return answer.replace(/\[Evidence\s+(\d+)\]/gi, '{{CITATION:$1}}');
    }, [answer]);

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary-500)] to-[var(--accent)] flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white animate-pulse" />
                    </div>
                    <span className="text-sm text-[var(--text-muted)]">Generating analysis...</span>
                </div>
                <SkeletonText lines={5} />
            </div>
        );
    }

    if (!answer) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-default)]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary-500)] to-[var(--accent)] flex items-center justify-center shadow-lg">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-[var(--text-primary)]">AI Analysis</h3>
                        <p className="text-xs text-[var(--text-muted)]">Generated from source documents</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                >
                    {copied ? 'Copied!' : 'Copy'}
                </Button>
            </div>

            {/* Content */}
            <div className="p-6">
                <div className="markdown-content">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                            // Custom text renderer to handle citations
                            p: ({ children, ...props }) => {
                                return (
                                    <p {...props}>
                                        {processTextWithCitations(children)}
                                    </p>
                                );
                            },
                            li: ({ children, ...props }) => {
                                return (
                                    <li {...props}>
                                        {processTextWithCitations(children)}
                                    </li>
                                );
                            },
                            strong: ({ children, ...props }) => {
                                return (
                                    <strong {...props}>
                                        {processTextWithCitations(children)}
                                    </strong>
                                );
                            },
                        }}
                    >
                        {processedAnswer}
                    </ReactMarkdown>
                </div>
            </div>
        </motion.div>
    );
}

// Helper function to process text nodes and replace citation placeholders
function processTextWithCitations(children: React.ReactNode): React.ReactNode {
    if (typeof children === 'string') {
        const parts = children.split(/({{CITATION:\d+}})/g);
        return parts.map((part, index) => {
            const match = part.match(/{{CITATION:(\d+)}}/);
            if (match) {
                return <CitationMarker key={index} evidenceId={parseInt(match[1], 10)} />;
            }
            return part;
        });
    }

    if (Array.isArray(children)) {
        return children.map((child, index) => {
            if (typeof child === 'string') {
                const parts = child.split(/({{CITATION:\d+}})/g);
                return parts.map((part, partIndex) => {
                    const match = part.match(/{{CITATION:(\d+)}}/);
                    if (match) {
                        return <CitationMarker key={`${index}-${partIndex}`} evidenceId={parseInt(match[1], 10)} />;
                    }
                    return part;
                });
            }
            return child;
        });
    }

    return children;
}
