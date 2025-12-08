export interface QueuedRequest {
    id: string;
    type: 'ROD_PASS' | 'DAILY_REPORT' | 'TIME_CLOCK_IN' | 'TIME_CLOCK_OUT';
    payload: any;
    timestamp: number;
    status: 'PENDING' | 'SYNCED' | 'FAILED';
}

const QUEUE_KEY = 'mu_offline_queue';

export const OfflineQueue = {
    getAll: (): QueuedRequest[] => {
        if (typeof window === 'undefined') return [];
        const raw = localStorage.getItem(QUEUE_KEY);
        return raw ? JSON.parse(raw) : [];
    },

    add: (type: 'ROD_PASS' | 'DAILY_REPORT' | 'TIME_CLOCK_IN' | 'TIME_CLOCK_OUT', payload: any) => {
        const queue = OfflineQueue.getAll();
        const request: QueuedRequest = {
            id: crypto.randomUUID(),
            type,
            payload,
            timestamp: Date.now(),
            status: 'PENDING'
        };
        queue.push(request);
        localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
        return request;
    },

    remove: (id: string) => {
        const queue = OfflineQueue.getAll().filter(item => item.id !== id);
        localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    },

    clear: () => {
        localStorage.removeItem(QUEUE_KEY);
    },

    getPendingCount: () => {
        return OfflineQueue.getAll().filter(i => i.status === 'PENDING').length;
    },

    removeMany: (ids: string[]) => {
        const queue = OfflineQueue.getAll().filter(item => !ids.includes(item.id));
        localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    }
};
