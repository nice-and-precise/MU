import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const filePath = path.join(process.cwd(), 'bug_reports.json');

    let reports = [];
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      try {
        reports = JSON.parse(fileContent);
      } catch (e) {
        console.error('Error parsing bug_reports.json', e);
      }
    }

    const { screenshot, ...reportData } = data;

    let screenshotPath = null;
    if (screenshot) {
      const base64Data = screenshot.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      const fileName = `bug-${Date.now()}.png`;
      const publicDir = path.join(process.cwd(), 'public', 'bug_reports');

      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }

      fs.writeFileSync(path.join(publicDir, fileName), buffer);
      screenshotPath = `/bug_reports/${fileName}`;
    }

    const newReport = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...reportData,
      screenshot: screenshotPath,
    };

    reports.push(newReport);

    fs.writeFileSync(filePath, JSON.stringify(reports, null, 2));

    return NextResponse.json({ success: true, message: 'Feedback saved' });
  } catch (error) {
    console.error('Error saving feedback:', error);
    return NextResponse.json({ success: false, message: 'Failed to save feedback' }, { status: 500 });
  }
}
