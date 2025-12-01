import { XMLParser } from 'fast-xml-parser';
import { WitsmlTrajectoryStation } from '../types';

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
});

/**
 * Parses a WITSML 1.4.1.1 Trajectory XML string into a list of stations.
 * @param xml WITSML XML string
 */
export const parseWitsmlTrajectory = (xml: string): WitsmlTrajectoryStation[] => {
    try {
        const jsonObj = parser.parse(xml);

        // Navigate WITSML structure: trajectorys -> trajectory -> trajectoryStation
        // Note: WITSML root is plural (trajectorys), but sometimes singular depending on the query response.

        const root = jsonObj.trajectorys || jsonObj.trajectory;
        if (!root) throw new Error("Invalid WITSML: No trajectory root found");

        const traj = Array.isArray(root.trajectory) ? root.trajectory[0] : root.trajectory;
        if (!traj) throw new Error("Invalid WITSML: No trajectory object found");

        const stations = traj.trajectoryStation;
        if (!stations) return [];

        const stationList = Array.isArray(stations) ? stations : [stations];

        return stationList.map((st: any) => {
            // WITSML 1.4.1.1 structure:
            // <md uom="ft">100.0</md>
            // <tvd uom="ft">99.8</tvd>
            // <incl uom="dega">1.5</incl>
            // <azi uom="dega">45.0</azi>

            return {
                md: parseFloat(st.md),
                tvd: parseFloat(st.tvd),
                incl: parseFloat(st.incl),
                azi: parseFloat(st.azi),
                dls: st.dls ? parseFloat(st.dls) : undefined,
            };
        }).sort((a: WitsmlTrajectoryStation, b: WitsmlTrajectoryStation) => a.md - b.md);

    } catch (e) {
        console.error("Error parsing WITSML:", e);
        return [];
    }
};

/**
 * Parses a WITSML 1.4.1.1 Log XML string into a list of data points.
 * Handles 'log' objects with 'logData'.
 */
export const parseWitsmlLog = (xml: string): any[] => {
    try {
        const jsonObj = parser.parse(xml);
        const root = jsonObj.logs || jsonObj.log;
        if (!root) throw new Error("Invalid WITSML: No logs root found");

        const log = Array.isArray(root.log) ? root.log[0] : root.log;
        if (!log) throw new Error("Invalid WITSML: No log object found");

        // Parse mnemonics to find indices
        // <logCurveInfo><mnemonic>MD</mnemonic>...</logCurveInfo>
        const curveInfos = Array.isArray(log.logCurveInfo) ? log.logCurveInfo : [log.logCurveInfo];
        const mnemonics = curveInfos.map((c: any) => c.mnemonic);

        const mdIdx = mnemonics.findIndex((m: string) => ['MD', 'DEPTH'].includes(m.toUpperCase()));
        const incIdx = mnemonics.findIndex((m: string) => ['INC', 'INCL', 'PITCH'].includes(m.toUpperCase()));
        const aziIdx = mnemonics.findIndex((m: string) => ['AZI', 'AZIM', 'DIR'].includes(m.toUpperCase()));

        if (mdIdx === -1) return []; // MD is required

        const logData = log.logData;
        if (!logData || !logData.data) return [];

        const dataRows = Array.isArray(logData.data) ? logData.data : [logData.data];

        return dataRows.map((row: string) => {
            const parts = row.split(',').map(p => p.trim());
            return {
                depth: parseFloat(parts[mdIdx]),
                pitch: incIdx !== -1 ? parseFloat(parts[incIdx]) : 0,
                azimuth: aziIdx !== -1 ? parseFloat(parts[aziIdx]) : 0,
                // Add timestamp if available, or current time
                timestamp: new Date().toISOString()
            };
        }).filter((d: any) => !isNaN(d.depth));

    } catch (e) {
        console.error("Error parsing WITSML Log:", e);
        return [];
    }
};
