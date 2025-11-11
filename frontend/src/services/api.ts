const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface Election {
    _id: string;
    name: string;
    description?: string;
    startTime: string;
    endTime: string;
    candidates: string[];
    status: 'draft' | 'open' | 'closed' | 'tallied';
    ledgerElectionId?: string;
}

export interface TallyResult {
    candidate: string;
    candidateId: number;
    votes: number;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
}

export const electionsApi = {
    getAll: () => request<Election[]>('/api/elections'),
    get: (id: string) => request<Election>(`/api/elections/${id}`),
    create: (data: any) => request<Election>('/api/elections', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    close: (id: string) => request<any>(`/api/elections/${id}/close`, {
        method: 'POST'
    }),
    getTally: (id: string) => request<{ election: string; results: TallyResult[] }>(`/api/elections/${id}/tally`)
};

export const voteApi = {
    commit: (electionId: string, commit: string) => request<any>('/api/vote/commit', {
        method: 'POST',
        body: JSON.stringify({ electionId, commit })
    }),
    reveal: (electionId: string, candidateId: number, salt: string) => request<any>('/api/vote/reveal', {
        method: 'POST',
        body: JSON.stringify({ electionId, candidateId, salt })
    }),
    getReceipt: (txHash: string) => request<any>(`/api/vote/receipt/${txHash}`)
};

export const adminApi = {
    uploadEligibility: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const token = localStorage.getItem('token');
        return fetch(`${API_URL}/api/admin/eligibility`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        }).then(res => res.json());
    },
    getDashboard: () => request<any>('/api/admin/dashboard'),
    getAuditLogs: (electionId: string) => request<any[]>(`/api/admin/audit/${electionId}`)
};

export function commitVote(electionId: string, commit: string) {
    return voteApi.commit(electionId, commit);
}

export function revealVote(electionId: string, candidateId: number, salt: string) {
    return voteApi.reveal(electionId, candidateId, salt);
}

