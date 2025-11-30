import proj4 from 'proj4';
import { toRad, toDeg } from './mcm';

/**
 * Calculates the Vertical Section (VS) for a given point relative to a target azimuth.
 * VS is the projection of the closure distance onto the target direction.
 * @param north North coordinate
 * @param east East coordinate
 * @param targetAzimuth Target Azimuth (degrees)
 * @param originNorth Origin North (usually 0)
 * @param originEast Origin East (usually 0)
 */
export const calculateVerticalSection = (
    north: number,
    east: number,
    targetAzimuth: number,
    originNorth: number = 0,
    originEast: number = 0
): number => {
    const dNorth = north - originNorth;
    const dEast = east - originEast;

    const closureDistance = Math.sqrt(dNorth * dNorth + dEast * dEast);
    const closureAzimuthRad = Math.atan2(dEast, dNorth);
    const closureAzimuth = (toDeg(closureAzimuthRad) + 360) % 360;

    const directionalDifference = targetAzimuth - closureAzimuth;
    const directionalDifferenceRad = toRad(directionalDifference);

    return closureDistance * Math.cos(directionalDifferenceRad);
};

/**
 * Applies Grid Convergence to convert Magnetic/Grid Azimuth to True North Azimuth.
 * @param rawAzimuth Measured Azimuth
 * @param convergenceAngle Convergence Angle (degrees). Positive if Grid North is East of True North.
 * @returns True North Azimuth
 */
export const applyGridConvergence = (rawAzimuth: number, convergenceAngle: number): number => {
    return (rawAzimuth + convergenceAngle + 360) % 360;
};

// Define common projections (Example: WGS84 and NAD83 / UTM zones)
// In a real app, these would be loaded dynamically or configured per project
export const WGS84 = 'EPSG:4326';

/**
 * Converts Lat/Long to UTM Coordinates (North/East).
 * @param lat Latitude
 * @param lon Longitude
 * @param zone UTM Zone (e.g., 14)
 * @param hemisphere 'N' or 'S'
 */
export const latLonToUTM = (lat: number, lon: number, zone: number, hemisphere: 'N' | 'S' = 'N') => {
    const utmProj = `+proj=utm +zone=${zone} +${hemisphere === 'S' ? 'south ' : ''}+datum=WGS84 +units=m +no_defs`;
    return proj4(WGS84, utmProj, [lon, lat]);
};

/**
 * Converts UTM Coordinates (North/East) to Lat/Long.
 * @param easting UTM Easting
 * @param northing UTM Northing
 * @param zone UTM Zone
 * @param hemisphere 'N' or 'S'
 */
export const utmToLatLon = (easting: number, northing: number, zone: number, hemisphere: 'N' | 'S' = 'N') => {
    const utmProj = `+proj=utm +zone=${zone} +${hemisphere === 'S' ? 'south ' : ''}+datum=WGS84 +units=m +no_defs`;
    return proj4(utmProj, WGS84, [easting, northing]);
};
