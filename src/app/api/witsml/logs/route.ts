
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

        const report = await prisma.dailyReport.findUnique({
            where: {
                projectId_reportDate: {
                    projectId: bore.projectId,
                    reportDate: today
                }
            },
            select: { production: true }
        });

        let logs = [];
        if (report && report.production) {
            try {
                logs = JSON.parse(report.production as string);
                // Filter for this bore just in case
                logs = logs.filter((l: any) => l.boreId === boreId);
            } catch (e) {
                // ignore
            }
        }

        return NextResponse.json({ success: true, logs });

    } catch (error) {
        return NextResponse.json({ success: false, error: 'Internal Error' }, { status: 500 });
    }
}
