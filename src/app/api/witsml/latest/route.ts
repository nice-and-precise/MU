import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    const boreId = req.nextUrl.searchParams.get('boreId');

    if (!boreId) {
        return NextResponse.json({ error: 'boreId is required' }, { status: 400 });
    }

    try {
        const latestLog = await prisma.telemetryLog.findFirst({
            where: { boreId },
            orderBy: { timestamp: 'desc' },
        });

        return NextResponse.json(latestLog || null);
    } catch (error) {
        console.error("Error fetching latest telemetry:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
