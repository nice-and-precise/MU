
import { parseTrajectorySync, parseLogSync } from '../lib/drilling/witsml/core';

self.onmessage = (e: MessageEvent) => {
    const { type, xml } = e.data;

    try {
        if (type === 'trajectory') {
            const result = parseTrajectorySync(xml);
            self.postMessage({ type: 'success', data: result });
        } else if (type === 'log') {
            const result = parseLogSync(xml);
            self.postMessage({ type: 'success', data: result });
        } else {
            throw new Error(`Unknown message type: ${type}`);
        }
    } catch (error: any) {
        self.postMessage({ type: 'error', error: error.message });
    }
};

