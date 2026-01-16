import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, Check, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { uploadDocument } from '../../services/api';
import { clsx } from 'clsx';

export function FileUploader() {
    const [file, setFile] = useState<File | null>(null);
    const [company, setCompany] = useState('');
    const [year, setYear] = useState('');
    const [quarter, setQuarter] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile?.type === 'application/pdf') {
            setFile(droppedFile);
            setUploadStatus('idle');
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setUploadStatus('idle');
        }
    };

    const handleUpload = async () => {
        if (!file || !company || !year || !quarter) return;

        setUploadStatus('uploading');
        setUploadProgress(0);
        setErrorMessage('');

        try {
            await uploadDocument(company, year, quarter, file, (progress) => {
                setUploadProgress(progress);
            });
            setUploadStatus('success');
            // Reset form after success
            setTimeout(() => {
                setFile(null);
                setCompany('');
                setYear('');
                setQuarter('');
                setUploadStatus('idle');
                setUploadProgress(0);
            }, 3000);
        } catch (error) {
            setUploadStatus('error');
            setErrorMessage(error instanceof Error ? error.message : 'Upload failed');
        }
    };

    const removeFile = () => {
        setFile(null);
        setUploadStatus('idle');
        setUploadProgress(0);
    };

    const years = ['FY24', 'FY25', 'FY26', 'FY27'];
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];

    return (
        <div className="max-w-2xl mx-auto">
            {/* Drop Zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={clsx(
                    'relative rounded-2xl border-2 border-dashed transition-all duration-300 p-8',
                    isDragging
                        ? 'border-[var(--primary-500)] bg-[var(--primary-500)]/5'
                        : 'border-[var(--border-default)] hover:border-[var(--border-strong)]',
                    file && 'border-solid'
                )}
            >
                <AnimatePresence mode="wait">
                    {!file ? (
                        <motion.div
                            key="dropzone"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-8"
                        >
                            <motion.div
                                className={clsx(
                                    'w-16 h-16 rounded-2xl flex items-center justify-center mb-4',
                                    'bg-gradient-to-br from-[var(--primary-500)]/20 to-[var(--accent)]/20'
                                )}
                                animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
                            >
                                <Upload className={clsx(
                                    'w-8 h-8',
                                    isDragging ? 'text-[var(--primary-400)]' : 'text-[var(--text-muted)]'
                                )} />
                            </motion.div>
                            <p className="text-[var(--text-primary)] font-medium mb-1">
                                Drop your PDF here
                            </p>
                            <p className="text-sm text-[var(--text-muted)] mb-4">
                                or click to browse
                            </p>
                            <label>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <span className="btn btn-secondary cursor-pointer">
                                    Select File
                                </span>
                            </label>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="file-preview"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            {/* File Info */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--error)]/20 to-[var(--error)]/10 flex items-center justify-center">
                                    <FileText className="w-7 h-7 text-[var(--error)]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-[var(--text-primary)] truncate">
                                        {file.name}
                                    </p>
                                    <p className="text-sm text-[var(--text-muted)]">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                                {uploadStatus === 'idle' && (
                                    <button
                                        onClick={removeFile}
                                        className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
                                    >
                                        <X className="w-5 h-5 text-[var(--text-muted)]" />
                                    </button>
                                )}
                            </div>

                            {/* Metadata Inputs */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <Input
                                    label="Company Ticker"
                                    placeholder="e.g., PAYTM"
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value.toUpperCase())}
                                    disabled={uploadStatus === 'uploading'}
                                />
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                        Fiscal Year
                                    </label>
                                    <select
                                        value={year}
                                        onChange={(e) => setYear(e.target.value)}
                                        disabled={uploadStatus === 'uploading'}
                                        className="input w-full"
                                    >
                                        <option value="">Select...</option>
                                        {years.map((y) => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                        Quarter
                                    </label>
                                    <select
                                        value={quarter}
                                        onChange={(e) => setQuarter(e.target.value)}
                                        disabled={uploadStatus === 'uploading'}
                                        className="input w-full"
                                    >
                                        <option value="">Select...</option>
                                        {quarters.map((q) => (
                                            <option key={q} value={q}>{q}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Upload Progress */}
                            {uploadStatus === 'uploading' && (
                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-[var(--text-secondary)]">Uploading...</span>
                                        <span className="text-sm font-medium text-[var(--primary-400)]">{uploadProgress}%</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div
                                            className="progress-bar-fill"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Success/Error Messages */}
                            {uploadStatus === 'success' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-2 p-3 rounded-xl bg-[var(--success)]/10 border border-[var(--success)]/20 mb-4"
                                >
                                    <Check className="w-5 h-5 text-[var(--success)]" />
                                    <span className="text-sm text-[var(--success-light)]">
                                        Document uploaded successfully!
                                    </span>
                                </motion.div>
                            )}

                            {uploadStatus === 'error' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-2 p-3 rounded-xl bg-[var(--error)]/10 border border-[var(--error)]/20 mb-4"
                                >
                                    <AlertCircle className="w-5 h-5 text-[var(--error)]" />
                                    <span className="text-sm text-[var(--error-light)]">
                                        {errorMessage}
                                    </span>
                                </motion.div>
                            )}

                            {/* Upload Button */}
                            {uploadStatus !== 'success' && (
                                <Button
                                    variant="primary"
                                    size="lg"
                                    className="w-full"
                                    onClick={handleUpload}
                                    disabled={!company || !year || !quarter || uploadStatus === 'uploading'}
                                    isLoading={uploadStatus === 'uploading'}
                                    leftIcon={<Upload className="w-5 h-5" />}
                                >
                                    Upload Document
                                </Button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
