import { NextRequest, NextResponse } from 'next/server';
import { askDrillingExpert, DrillingContext } from '@/lib/ai/copilot';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { query, context } = body;

        if (!query || !context) {
            return NextResponse.json({ error: 'Missing query or context' }, { status: 400 });
        }

        const answer = await askDrillingExpert(query, context as DrillingContext);
        return NextResponse.json({ answer });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
