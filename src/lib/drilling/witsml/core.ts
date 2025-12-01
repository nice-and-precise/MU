import { XMLParser } from 'fast-xml-parser';
import { WitsmlTrajectoryStation } from '../types';

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
});

const getValue = (node: any): any => {
    if (typeof node === 'object' && node !== null && '#text' in node) {
        return node['#text'];
    }
    return node;
};

export const parseTrajectorySync = (xml: string): WitsmlTrajectoryStation[] => {
    try {
        const jsonObj = parser.parse(xml);
        const root = jsonObj.trajectorys || jsonObj.trajectory;
        if (!root) throw new Error("Invalid WITSML: No trajectory root found");

        const traj = Array.isArray(root.trajectory) ? root.trajectory[0] : root.trajectory;
        if (!traj) throw new Error("Invalid WITSML: No trajectory object found");

        const stations = traj.trajectoryStation;
        if (!stations) return [];

        const stationList = Array.isArray(stations) ? stations : [stations];

        return stationList.map((st: any) => ({
            md: parseFloat(getValue(st.md)),
            tvd: parseFloat(getValue(st.tvd)),
            incl: parseFloat(getValue(st.incl)),
            azi: parseFloat(getValue(st.azi)),
            dls: st.dls ? parseFloat(getValue(st.dls)) : undefined,
        })).sort((a: any, b: any) => a.md - b.md);
    } catch (e) {
        console.error("Error parsing WITSML Trajectory:", e);
        return [];
    }
};

export const parseLogSync = (xml: string): any[] => {
    try {
        const jsonObj = parser.parse(xml);
        const root = jsonObj.logs || jsonObj.log;
        if (!root) throw new Error("Invalid WITSML: No logs root found");

        const log = Array.isArray(root.log) ? root.log[0] : root.log;
        if (!log) throw new Error("Invalid WITSML: No log object found");

        const curveInfos = Array.isArray(log.logCurveInfo) ? log.logCurveInfo : [log.logCurveInfo];
        const mnemonics = curveInfos.map((c: any) => c.mnemonic);

        const mdIdx = mnemonics.findIndex((m: string) => ['MD', 'DEPTH'].includes(m.toUpperCase()));
        const incIdx = mnemonics.findIndex((m: string) => ['INC', 'INCL', 'PITCH'].includes(m.toUpperCase()));
        const aziIdx = mnemonics.findIndex((m: string) => ['AZI', 'AZIM', 'DIR'].includes(m.toUpperCase()));

        if (mdIdx === -1) return [];

        const logData = log.logData;
        if (!logData || !logData.data) return [];

        const dataRows = Array.isArray(logData.data) ? logData.data : [logData.data];

        return dataRows.map((row: string) => {
            const parts = row.split(',').map(p => p.trim());
            return {
                depth: parseFloat(parts[mdIdx]),
                pitch: incIdx !== -1 ? parseFloat(parts[incIdx]) : 0,
                azimuth: aziIdx !== -1 ? parseFloat(parts[aziIdx]) : 0,
                timestamp: new Date().toISOString()
            };
        }).filter((d: any) => !isNaN(d.depth));
    } catch (e) {
        console.error("Error parsing WITSML Log:", e);
        return [];
    }
};
