import { WitsmlTrajectoryStation } from '../types';
import { parseTrajectorySync, parseLogSync } from './core';

// Helper to wrap worker communication in a Promise
const runWorker = (type: 'trajectory' | 'log', xml: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        if (typeof Worker === 'undefined') {
            // Fallback to sync parsing if Worker is not available (e.g. Server Side)
            if (type === 'trajectory') {
                resolve(parseTrajectorySync(xml));
            } else {
                resolve(parseLogSync(xml));
            }
            return;
        }

        const worker = new Worker(new URL('../../../workers/witsml.worker.ts', import.meta.url));

        worker.onmessage = (event) => {
            const { type, data, error } = event.data;
            if (type === 'success') {
                resolve(data);
            } else {
                reject(new Error(error));
            }
            worker.terminate();
        };

        worker.onerror = (error) => {
            reject(error);
            worker.terminate();
        };

        worker.postMessage({ type, xml });
    });
};

/**
 * Parses a WITSML 1.4.1.1 Trajectory XML string into a list of stations.
 * Uses a Web Worker if available, otherwise runs synchronously.
 * @param xml WITSML XML string
 */
export const parseWitsmlTrajectory = async (xml: string): Promise<WitsmlTrajectoryStation[]> => {
    try {
        return await runWorker('trajectory', xml);
    } catch (e) {
        console.error("Error parsing WITSML Trajectory:", e);
        return [];
    }
};

/**
 * Parses a WITSML 1.4.1.1 Log XML string into a list of data points.
 * Uses a Web Worker if available, otherwise runs synchronously.
 */
export const parseWitsmlLog = async (xml: string): Promise<any[]> => {
    try {
        return await runWorker('log', xml);
    } catch (e) {
        console.error("Error parsing WITSML Log:", e);
        return [];
    }
};


