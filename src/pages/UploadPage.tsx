import { motion } from 'framer-motion';
import { Upload, FileText, Info } from 'lucide-react';
import { FileUploader } from '../components/upload/FileUploader';
import { Card } from '../components/ui/Card';

export function UploadPage() {
    return (
        <div className="min-h-full">
            {/* Header */}
            <div className="relative overflow-hidden border-b border-[var(--border-default)]">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-[var(--accent)]/10 via-transparent to-transparent rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent)]/20 to-[var(--primary-500)]/20 border border-[var(--accent)]/30 mb-6">
                            <Upload className="w-8 h-8 text-[var(--accent)]" />
                        </div>

                        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-3">
                            Upload Documents
                        </h1>

                        <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
                            Add SEC filings (10-K, 10-Q) to expand the knowledge base.
                            Documents are processed and indexed for AI analysis.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Upload Section */}
            <div className="max-w-4xl mx-auto px-6 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <FileUploader />
                </motion.div>

                {/* Info Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-8"
                >
                    <Card className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[var(--info)]/15 flex items-center justify-center flex-shrink-0">
                            <Info className="w-5 h-5 text-[var(--info)]" />
                        </div>
                        <div>
                            <h3 className="font-medium text-[var(--text-primary)] mb-1">
                                Supported Documents
                            </h3>
                            <p className="text-sm text-[var(--text-secondary)]">
                                Currently supports PDF files of SEC filings including 10-K (annual reports)
                                and 10-Q (quarterly reports). Each document is automatically parsed,
                                chunked, and indexed for semantic search and AI analysis.
                            </p>
                        </div>
                    </Card>
                </motion.div>

                {/* Features Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8 grid grid-cols-3 gap-4"
                >
                    {[
                        {
                            icon: FileText,
                            title: 'PDF Processing',
                            desc: 'Automatic text extraction with page tracking'
                        },
                        {
                            icon: Upload,
                            title: 'Smart Indexing',
                            desc: 'Vector embeddings for semantic search'
                        },
                        {
                            icon: Info,
                            title: 'Provenance Tracking',
                            desc: 'Every chunk linked to source page'
                        }
                    ].map((feature, i) => (
                        <Card key={i} variant="interactive" className="text-center">
                            <div className="w-10 h-10 rounded-xl bg-[var(--bg-elevated)] flex items-center justify-center mx-auto mb-3">
                                <feature.icon className="w-5 h-5 text-[var(--text-muted)]" />
                            </div>
                            <h4 className="font-medium text-[var(--text-primary)] text-sm mb-1">
                                {feature.title}
                            </h4>
                            <p className="text-xs text-[var(--text-muted)]">{feature.desc}</p>
                        </Card>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
