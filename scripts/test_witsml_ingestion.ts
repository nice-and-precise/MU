import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Starting WITSML Ingestion Test...");

    // 1. Get a Bore ID
    const bore = await prisma.bore.findFirst();
    if (!bore) {
        console.error("❌ No Bores found in database. Run seed first.");
        return;
    }
    console.log(`✅ Found Bore: ${bore.name} (${bore.id})`);

    // 2. Construct WITSML XML (Log)
    const witsmlLog = `
    <logs version="1.4.1.1">
        <log>
            <name>Test Log</name>
            <logCurveInfo>
                <mnemonic>MD</mnemonic>
            </logCurveInfo>
            <logCurveInfo>
                <mnemonic>INC</mnemonic>
            </logCurveInfo>
            <logCurveInfo>
                <mnemonic>AZI</mnemonic>
            </logCurveInfo>
            <logData>
                <data>100.0, 1.5, 45.0</data>
                <data>101.0, 1.6, 45.2</data>
                <data>102.0, 1.7, 45.4</data>
            </logData>
        </log>
    </logs>
    `;

    // 3. Send POST Request
    const url = `http://localhost:3000/api/witsml?boreId=${bore.id}`;
    console.log(`📡 Sending WITSML to ${url}...`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: witsmlLog,
            headers: { 'Content-Type': 'application/xml' }
        });

        const result = await response.json();
        console.log("📩 Response:", result);

        if (response.ok && result.success) {
            console.log("✅ WITSML Ingestion Successful!");
        } else {
            console.error("❌ WITSML Ingestion Failed:", result);
        }

    } catch (error) {
        console.error("❌ Request Error:", error);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
