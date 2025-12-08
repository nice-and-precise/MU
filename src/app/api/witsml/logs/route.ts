
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const boreId = searchParams.get('boreId');

        if (!boreId) {
            return NextResponse.json({ success: false, error: 'Bore ID required' }, { status: 400 });
        }

        const bore = await prisma.bore.findUnique({
            where: { id: boreId },
            select: { projectId: true }
        });

        if (!bore) {
            return NextResponse.json({ success: false, error: 'Bore not found' }, { status: 404 });
        }

        // Fetch today's report
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const logs = await prisma.telemetryLog.findMany({
            where: {
                boreId: boreId,
                timestamp: {
                    gte: today,
                    lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                }
            },
            orderBy: { timestamp: 'asc' }
        });

        return NextResponse.json({ success: true, logs });

    } catch (error) {
        return NextResponse.json({ success: false, error: 'Internal Error' }, { status: 500 });
    }
}
