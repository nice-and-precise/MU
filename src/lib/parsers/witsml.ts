import { XMLParser } from 'fast-xml-parser';

export interface SurveyPoint {
    md: number;
    inc: number;
    azi: number;
    tvd?: number;
    north?: number;
    east?: number;
}

export async function parseWitsml(xmlContent: string): Promise<SurveyPoint[]> {
    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_"
    });

    try {
        const jsonObj = parser.parse(xmlContent);

        // Handle different WITSML versions/structures
        // Usually trajectoryStation is inside trajectory
        let stations: any[] = [];

        if (jsonObj.trajectorys?.trajectory?.trajectoryStation) {
            stations = jsonObj.trajectorys.trajectory.trajectoryStation;
        } else if (jsonObj.trajectorys?.trajectory && Array.isArray(jsonObj.trajectorys.trajectory)) {
            // Handle multiple trajectories, take first for now
            stations = jsonObj.trajectorys.trajectory[0].trajectoryStation || [];
        }

        if (!Array.isArray(stations)) {
            stations = [stations];
        }

        return stations.map((s: any) => ({
            md: parseFloat(s.md?.['#text'] || s.md || 0),
            inc: parseFloat(s.incl?.['#text'] || s.incl || 0),
            azi: parseFloat(s.azi?.['#text'] || s.azi || 0),
            tvd: s.tvd?.['#text'] ? parseFloat(s.tvd['#text']) : undefined,
            north: s.dispNs?.['#text'] ? parseFloat(s.dispNs['#text']) : undefined,
            east: s.dispEw?.['#text'] ? parseFloat(s.dispEw['#text']) : undefined,
        })).sort((a, b) => a.md - b.md);

    } catch (error) {
        console.error("WITSML Parsing Error:", error);
        throw new Error("Failed to parse WITSML file");
    }
}
