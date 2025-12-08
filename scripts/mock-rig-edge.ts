
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// J1939-ish PGNs (Parameter Group Numbers) - roughly mapped for realism
const PGNS = {
    ENGINE_SPEED: 61444, // EEC1 - Engine Speed (RPM)
    TORQUE: 61444,       // EEC1 - Actual Torque
    THRUST: 65280,       // Proprietary - Thrust/Pullback
    PRESSURE: 65281,     // Proprietary - Mud Pressure
    FLOW: 65282,         // Proprietary - Mud Flow
};

async function main() {
    const boreId = process.argv[2];
    if (!boreId) {
        console.error("Please provide a boreId (e.g. ts-node mock-rig-edge.ts <bore-id>)");
        process.exit(1);
    }

    const projectId = process.argv[3];

    console.log(`🚀 Starting MOCK RIG EDGE device for bore: ${boreId}`);
    console.log(`📡 Connecting to Cloud Ingestion API...`);

    // State simulation
    let rpm = 0;
    let torque = 0;
    let thrust = 0;
    let pressure = 0;
    let flow = 0;
    let depth = 0;
    let state = 'IDLE'; // IDLE, DRILLING, ADDING_ROD

    setInterval(async () => {
        // 1. Simulate Math (Physics Engine Lite)
        if (state === 'DRILLING') {
            rpm = 160 + (Math.random() * 20 - 10);
            torque = 1200 + (Math.random() * 100 - 50);
            thrust = 5000 + (Math.random() * 500 - 250);
            pressure = 450 + (Math.random() * 50 - 25);
            flow = 65 + (Math.random() * 5 - 2.5);
            depth += 0.05; // 0.05 ft per tick (approx 1 ft/sec scaled)

            // Randomly stop for "rod change"
            if (Math.random() > 0.98) {
                state = 'ADDING_ROD';
                console.log("🛑 Rig Output: ADDING ROD...");
            }
        } else if (state === 'ADDING_ROD') {
            rpm = 0;
            torque = 0;
            thrust = 0;
            if (Math.random() > 0.95) {
                state = 'DRILLING';
                console.log("🟢 Rig Output: DRILLING RESUMED");
            }
        } else {
            // IDLE -> Start
            if (Math.random() > 0.8) {
                state = 'DRILLING';
                console.log("🟢 Rig Output: DRILLING STARTED");
            }
        }

        // 2. Prepare Payload (Edge JSON)
        const payload = {
            boreId,
            timestamp: new Date().toISOString(),
            telemetry: {
                rpm: Math.round(rpm),
                torque: Math.round(torque),
                thrust: Math.round(thrust),
                pumpPressure: Math.round(pressure),
                flowRate: Math.round(flow),
                depth: parseFloat(depth.toFixed(2)),
                bitStatus: state === 'DRILLING' ? 1 : 0
            }
        };

        // 3. Send to API (Simulating Network Request)
        // For demo speed, we write directly to DB instead of hitting localhost:3000 API to avoid fetch overhead/cors in CLI
        // In production, this would be `fetch('https://api.mu-ops.com/ingest', ...)`

        try {
            await prisma.telemetryLog.create({
                data: {
                    boreId: boreId,
                    timestamp: payload.timestamp,
                    depth: payload.telemetry.depth,
                    rpm: payload.telemetry.rpm,
                    torque: payload.telemetry.torque,
                    wob: payload.telemetry.thrust, // Mapping thrust to WOB field for now
                    pumpPressure: payload.telemetry.pumpPressure,
                    flowRate: payload.telemetry.flowRate,
                }
            });

            // console.log(`📡 TX: D:${depth.toFixed(1)}ft | ${rpm} RPM | ${pressure} PSI`);
            process.stdout.write(`\r📡 TX: Depth:${depth.toFixed(1)}ft | ${rpm} RPM | ${pressure} PSI | Status: ${state}   `);
        } catch (e) {
            console.error("Transmission Error:", e);
        }

    }, 1000); // 1Hz update rate
}

main();
