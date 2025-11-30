'use server';

import { extractDataFromText } from "@/lib/extraction/pipeline";
import pdf from "pdf-parse";

export async function processFile(formData: FormData) {
    const file = formData.get('file') as File;

    if (!file) {
        return { success: false, error: "No file provided" };
    }

    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        let text = "";

        if (file.type === "application/pdf") {
            const data = await pdf(buffer);
            text = data.text;
        } else {
            // Fallback for text/csv (basic)
            text = buffer.toString('utf-8');
        }

        // Extract structured data
        const extractedItems = await extractDataFromText(text);

        return { success: true, data: extractedItems };
    } catch (error) {
        console.error("Processing error:", error);
        return { success: false, error: "Failed to process file" };
    }
}
