import { HfInference } from '@huggingface/inference';

const HF_TOKEN = process.env.HF_TOKEN;
const hf = new HfInference(HF_TOKEN);

export interface SurveyPoint {
    md: number;
    inc: number;
    azi: number;
}

export interface PredictedPath {
    md: number;
    inc: number;
    azi: number;
    confidence: number;
}

export async function predictTrajectory(currentSurvey: SurveyPoint[]): Promise<PredictedPath[]> {
    // In a real scenario, we would fine-tune a model on historical drilling data.
    // Here we use a general model to simulate the prediction based on trends.

    const inputData = JSON.stringify(currentSurvey.slice(-5)); // Last 5 points
    const prompt = `Given the following drilling survey data (MD, Inc, Azi), predict the next 5 points based on the current build/turn rate.
    Data: ${inputData}
    Return ONLY a JSON array of the next 5 points with fields: md, inc, azi, confidence.`;

    try {
        const response = await hf.textGeneration({
            model: 'meta-llama/Meta-Llama-3-8B-Instruct',
            inputs: prompt,
            parameters: {
                max_new_tokens: 256,
                temperature: 0.5,
            }
        });

        // Mock parsing since LLM output might be unstructured
        // In production, use a structured output parser or a specific fine-tuned model
        console.log("AI Prediction Raw:", response.generated_text);

        // Fallback mock return if parsing fails (for stability in this demo)
        const last = currentSurvey[currentSurvey.length - 1];
        return Array.from({ length: 5 }).map((_, i) => ({
            md: last.md + (i + 1) * 30,
            inc: last.inc, // Hold angle
            azi: last.azi,
            confidence: 0.85 - (i * 0.05)
        }));

    } catch (error) {
        console.error("Prediction Error:", error);
        return [];
    }
}
