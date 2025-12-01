import fs from 'fs';
import path from 'path';

async function main() {
    const boreId = process.argv[2];
    if (!boreId) {
        console.error("Please provide a Bore ID as an argument.");
        console.log("Usage: npx tsx scripts/test_witsml.ts <bore-id>");
        process.exit(1);
    }

    const filePath = path.join(process.cwd(), 'sample_survey.witsml');
    if (!fs.existsSync(filePath)) {
        console.error("sample_survey.witsml not found!");
        process.exit(1);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const apiUrl = 'http://localhost:3000/api/witsml';

    console.log(`Sending WITSML file to ${apiUrl}?boreId=${boreId}...`);

    try {
        const response = await fetch(`${apiUrl}?boreId=${boreId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/xml'
            },
            body: content
        });

        const result = await response.json();
        console.log("Response:", JSON.stringify(result, null, 2));

        if (result.success) {
            console.log("✅ WITSML Ingestion Successful!");
            console.log(`Processed ${result.count} records.`);
        } else {
            console.error("❌ WITSML Ingestion Failed:", result.error);
        }

    } catch (error) {
        console.error("❌ Request Failed:", error);
    }
}

main();
