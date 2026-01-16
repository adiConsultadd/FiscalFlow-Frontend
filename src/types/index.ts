// ===== API Types =====

export interface Provenance {
    page_index?: number;
    page_label?: string;
    file_name?: string;
    bbox?: number[];
    char_start?: number;
    char_end?: number;
}

export interface SourceChunk {
    evidence_id: number;
    text_content: string;
    similarity: number;
    fiscal_year?: string;
    fiscal_quarter?: string;
    company_ticker?: string;
    provenance: Provenance;
}

export interface QueryRequest {
    username: string;
    query: string;
    company_ticker?: string;
}

export interface QueryResponse {
    query: string;
    answer: string;
    target_years: string[];
    chunks_retrieved: number;
    sources: SourceChunk[];
    traversal_log: string[];
}

export interface UploadRequest {
    company: string;
    year: string;
    quarter: string;
    file: File;
}

// ===== Streaming Types =====

export type StreamEventType = 'status' | 'source' | 'answer' | 'complete' | 'error';

export type StreamStage =
    | 'started'
    | 'time_scoping'
    | 'years_identified'
    | 'retrieving_sources'
    | 'synthesizing'
    | 'complete';

export interface StreamStatusEvent {
    stage: StreamStage;
    message: string;
    timestamp: string;
    target_years?: string[];
}

export interface StreamSourceEvent extends SourceChunk { }

export interface StreamAnswerEvent {
    content: string;
    timestamp: string;
}

export interface StreamCompleteEvent {
    query: string;
    username: string;
    target_years: string[];
    chunks_retrieved: number;
    sources_count: number;
    traversal_log: string[];
    timestamp: string;
}

export interface StreamErrorEvent {
    message: string;
    stage: string;
    timestamp: string;
}

export type StreamEvent =
    | { type: 'status'; data: StreamStatusEvent }
    | { type: 'source'; data: StreamSourceEvent }
    | { type: 'answer'; data: StreamAnswerEvent }
    | { type: 'complete'; data: StreamCompleteEvent }
    | { type: 'error'; data: StreamErrorEvent };

// ===== UI State Types =====

export interface QueryState {
    isStreaming: boolean;
    currentStage: StreamStage | null;
    stageMessage: string;
    targetYears: string[];
    sources: SourceChunk[];
    answer: string;
    error: string | null;
    traversalLog: string[];
}

export interface QueryHistoryItem {
    id: string;
    query: string;
    company_ticker?: string;
    answer: string;
    sources: SourceChunk[];
    target_years: string[];
    timestamp: string;
}

// ===== Component Props =====

export interface ExampleQuery {
    text: string;
    icon: string;
    category: string;
}

export interface CompanyOption {
    ticker: string;
    name: string;
    logo?: string;
}

// ===== Utility Types =====

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface ApiError {
    message: string;
    code?: string;
    status?: number;
}
