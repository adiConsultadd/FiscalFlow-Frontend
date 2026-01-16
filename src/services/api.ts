// API Configuration
export const API_BASE_URL = '/api';

// Helper for making API requests
export async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `HTTP error ${response.status}`);
    }

    return response.json();
}

// Health check
export async function checkHealth(): Promise<{ status: string }> {
    return apiRequest('/health');
}

// Upload document
export async function uploadDocument(
    company: string,
    year: string,
    quarter: string,
    file: File,
    onProgress?: (progress: number) => void
): Promise<{ message: string }> {
    const formData = new FormData();
    formData.append('company', company);
    formData.append('year', year);
    formData.append('quarter', quarter);
    formData.append('file', file);

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable && onProgress) {
                const progress = Math.round((event.loaded / event.total) * 100);
                onProgress(progress);
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    resolve(JSON.parse(xhr.responseText));
                } catch {
                    resolve({ message: 'Upload successful' });
                }
            } else {
                try {
                    const error = JSON.parse(xhr.responseText);
                    reject(new Error(error.message || 'Upload failed'));
                } catch {
                    reject(new Error(`Upload failed with status ${xhr.status}`));
                }
            }
        });

        xhr.addEventListener('error', () => {
            reject(new Error('Network error during upload'));
        });

        xhr.open('POST', `${API_BASE_URL}/upload`);
        xhr.send(formData);
    });
}
