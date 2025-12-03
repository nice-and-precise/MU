import { HfInference } from '@huggingface/inference';

const HF_TOKEN = process.env.HF_TOKEN;
const hf = new HfInference(HF_TOKEN);

export interface DrillingContext {
    depth: number;
    pressure: number;
    soilType: string;
    bhaConfig: string;
}

export async function askDrillingExpert(query: string, context: DrillingContext) {
    const systemPrompt = `You are a Senior Drilling Engineer and expert in HDD (Horizontal Directional Drilling).
    Use the following context to answer the user's question.
    
    Current Drilling Parameters:
    - Depth: ${context.depth} ft
    - Pressure: ${context.pressure} psi
    - Soil Type: ${context.soilType}
    - BHA: ${context.bhaConfig}
    
    Knowledge Base:
    - ASTM F1962 (Standard Guide for Use of Maxi-Horizontal Directional Drilling for Placement of Polyethylene Pipe or Conduit Under Obstacles, Including River Crossings)
    - API RP 13B-1 (Recommended Practice for Field Testing Water-based Drilling Fluids)
    
    Provide concise, technical, and safety-focused advice.`;

    const model = 'meta-llama/Meta-Llama-3-8B-Instruct'; // Fallback as OGAI-Reasoning might be private/unavailable

    try {
        const response = await hf.textGeneration({
            model: model,
            inputs: `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n${systemPrompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n${query}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n`,
            parameters: {
                max_new_tokens: 512,
                temperature: 0.7,
                top_p: 0.95,
            }
        });
        return response.generated_text;
    } catch (error) {
        console.error("AI Error:", error);
        throw new Error("Failed to consult drilling expert.");
    }
}
