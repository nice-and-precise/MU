
/**
 * Mock Edge Device Script (J1939 Simulation)
 * 
 * Simulates a drilling rig sending telemetry data to the MU API.
 * Usage: npx ts-node scripts/mock-rig-edge.ts --boreId <ID> --apiUrl http://localhost:3000
 */

import fetch from 'node-fetch';

const args = process.argv.slice(2);
const boreIdArg = args.find(a => a.startsWith('--boreId='));
const apiUrlArg = args.find(a => a.startsWith('--apiUrl='));

const BORE_ID = boreIdArg ? boreIdArg.split('=')[1] : null;
const API_URL = apiUrlArg ? apiUrlArg.split('=')[1] : 'http://localhost:3000';
const INGEST_ENDPOINT = `${API_URL}/api/telemetry/ingest`;

if (!BORE_ID) {
    console.error('Please provide a boreId: --boreId=<ID>');
    process.exit(1);
}

console.log(`Starting Virtual Rig Simulation for Bore: ${BORE_ID}`);
console.log(`Target API: ${INGEST_ENDPOINT}`);

// Simulation State
let depth = 0;
let pitch = 0;
let azimuth = 0;
let isDrilling = true;

// Physics Constants
const DRILL_RATE_FPM = 2.0; // Feet per minute
const UPDATE_HZ = 1; // 1 update per second
const BATCH_SIZE = 1; // Send every X updates

// Current Buffer
let batch: any[] = [];

setInterval(async () => {
    // 1. Update Physics
    if (isDrilling) {
        depth += (DRILL_RATE_FPM / 60) * (1 / UPDATE_HZ);

        // Random walk
        pitch += (Math.random() - 0.5) * 0.1;
        azimuth += (Math.random() - 0.5) * 0.1;
    }

    // 2. Generate Sensor Data
    const log = {
        timestamp: new Date().toISOString(),
        depth: parseFloat(depth.toFixed(2)),
        pitch: parseFloat(pitch.toFixed(2)),
        azimuth: parseFloat(azimuth.toFixed(2)),
        toolFace: Math.random() * 360,
        rpm: isDrilling ? 120 + (Math.random() * 10) : 0,
        wob: isDrilling ? 15000 + (Math.random() * 1000) : 0,
        torque: isDrilling ? 2500 + (Math.random() * 200) : 0,
        pumpPressure: isDrilling ? 800 + (Math.random() * 50) : 0,
        flowRate: isDrilling ? 50 + (Math.random() * 5) : 0,
    };

    batch.push(log);

    process.stdout.write(`\rDepth: ${log.depth.toFixed(1)}ft | RPM: ${log.rpm.toFixed(0)} | P: ${log.pumpPressure.toFixed(0)}psi | Batch: ${batch.length}`);

    // 3. Send Batch
    if (batch.length >= BATCH_SIZE) {
        try {
            const payload = {
                boreId: BORE_ID,
                logs: batch
            };

            const res = await fetch(INGEST_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                console.error(`\nFailed to send batch: ${res.status} ${res.statusText}`);
                const text = await res.text();
                console.error(text);
            } else {
                // Success, clear buffer
            }
        } catch (err) {
            console.error('\nNetwork Error:', err);
        }
        batch = [];
    }

}, 1000 / UPDATE_HZ);

// Handle exit
process.on('SIGINT', () => {
    console.log('\nStopping simulation...');
    process.exit();
});
