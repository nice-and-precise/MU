import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    const boreId = req.nextUrl.searchParams.get('boreId');

    if (!boreId) {
        return NextResponse.json({ error: 'boreId is required' }, { status: 400 });
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            let lastTimestamp = 0;

            // Initial fetch to get the latest timestamp
            const initialLog = await prisma.telemetryLog.findFirst({
                where: { boreId },
                orderBy: { timestamp: 'desc' },
            });

            if (initialLog) {
                lastTimestamp = initialLog.timestamp.getTime();
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialLog)}\n\n`));
            }

            // Loop to poll for updates
            while (true) {
                try {
                    const latestLog = await prisma.telemetryLog.findFirst({
                        where: { boreId },
                        orderBy: { timestamp: 'desc' },
                    });

                    if (latestLog && latestLog.timestamp.getTime() > lastTimestamp) {
                        lastTimestamp = latestLog.timestamp.getTime();
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify(latestLog)}\n\n`));
                    }

                    // Wait for 2 seconds before next poll
                    await new Promise((resolve) => setTimeout(resolve, 2000));
                } catch (error) {
                    console.error("Error in SSE stream:", error);
                    controller.error(error);
                    break;
                }
            }
        },
    });

    return new NextResponse(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}
