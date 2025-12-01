import { describe, it, expect } from 'vitest';
import { parseWitsmlTrajectory, parseWitsmlLog } from './parser';

describe('WITSML Parser', () => {
    describe('parseWitsmlTrajectory', () => {
        it('should parse a valid trajectory XML', async () => {
            const xml = `
                <trajectorys xmlns="http://www.witsml.org/schemas/1series" version="1.4.1.1">
                    <trajectory uid="traj1">
                        <name>Test Trajectory</name>
                        <trajectoryStation uid="st1">
                            <md uom="ft">100.0</md>
                            <tvd uom="ft">99.8</tvd>
                            <incl uom="dega">1.5</incl>
                            <azi uom="dega">45.0</azi>
                        </trajectoryStation>
                        <trajectoryStation uid="st2">
                            <md uom="ft">200.0</md>
                            <tvd uom="ft">199.0</tvd>
                            <incl uom="dega">2.0</incl>
                            <azi uom="dega">46.0</azi>
                        </trajectoryStation>
                    </trajectory>
                </trajectorys>
            `;

            const stations = await parseWitsmlTrajectory(xml);
            expect(stations.length).toBe(2);
            expect(stations[0].md).toBe(100.0);
            expect(stations[0].tvd).toBe(99.8);
            expect(stations[0].incl).toBe(1.5);
            expect(stations[0].azi).toBe(45.0);
        });

        it('should return empty array for invalid XML', async () => {
            const xml = `<invalid>xml</invalid>`;
            const stations = await parseWitsmlTrajectory(xml);
            expect(stations).toEqual([]);
        });
    });

    describe('parseWitsmlLog', () => {
        it('should parse a valid log XML', async () => {
            const xml = `
                <logs xmlns="http://www.witsml.org/schemas/1series" version="1.4.1.1">
                    <log uid="log1">
                        <name>Test Log</name>
                        <logCurveInfo>
                            <mnemonic>MD</mnemonic>
                        </logCurveInfo>
                        <logCurveInfo>
                            <mnemonic>INC</mnemonic>
                        </logCurveInfo>
                        <logCurveInfo>
                            <mnemonic>AZI</mnemonic>
                        </logCurveInfo>
                        <logData>
                            <data>100, 1.5, 45</data>
                            <data>200, 2.0, 46</data>
                        </logData>
                    </log>
                </logs>
            `;

            const data = await parseWitsmlLog(xml);
            expect(data.length).toBe(2);
            expect(data[0].depth).toBe(100);
            expect(data[0].pitch).toBe(1.5);
            expect(data[0].azimuth).toBe(45);
        });
    });
});
