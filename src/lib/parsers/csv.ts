import { SurveyPoint } from './witsml';

export async function parseCsv(csvContent: string): Promise<SurveyPoint[]> {
    const lines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) throw new Error("CSV file is empty or missing header");

    const header = lines[0].toLowerCase().split(',').map(h => h.trim());

    // Identify column indices
    const mdIdx = header.findIndex(h => h.includes('md') || h.includes('depth') || h.includes('measure'));
    const incIdx = header.findIndex(h => h.includes('inc') || h.includes('dip') || h.includes('pitch'));
    const aziIdx = header.findIndex(h => h.includes('az') || h.includes('dir'));

    if (mdIdx === -1 || incIdx === -1 || aziIdx === -1) {
        throw new Error("CSV missing required columns: MD, Inc/Pitch, Azimuth");
    }

    const points: SurveyPoint[] = [];

    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim());
        if (cols.length < 3) continue;

        const md = parseFloat(cols[mdIdx]);
        const inc = parseFloat(cols[incIdx]);
        const azi = parseFloat(cols[aziIdx]);

        if (!isNaN(md) && !isNaN(inc) && !isNaN(azi)) {
            points.push({ md, inc, azi });
        }
    }

    return points.sort((a, b) => a.md - b.md);
}
