import { NextResponse } from 'next/server';
import { seedFullDemoData } from '@/actions/seed-demo-data';

export async function GET() {
    const result = await seedFullDemoData();
    return NextResponse.json(result);
}
