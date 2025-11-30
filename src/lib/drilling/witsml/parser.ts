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
