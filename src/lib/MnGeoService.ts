import { LatLng } from 'leaflet';

// MnGeo WFS Endpoint for Metro Regional Parcels
// This is a proxy or direct URL. For now using a likely WFS endpoint.
const PARCEL_WFS_URL = 'https://arcgis.metrocouncil.org/server/rest/services/Parcels/RegionalParcels/MapServer/0/query';

export interface ParcelData {
    pin: string;
    address: string;
    owner: string;
    geometry: any; // GeoJSON Polygon
}

export async function getParcelAtLocation(lat: number, lng: number): Promise<ParcelData | null> {
    try {
        // Construct query for ArcGIS REST API (easier than raw WFS for point-in-polygon)
        const params = new URLSearchParams({
            f: 'json',
            geometry: `${lng},${lat}`,
            geometryType: 'esriGeometryPoint',
            spatialRel: 'esriSpatialRelIntersects',
            outFields: 'PIN,SITEADDR,OWNER_NAME',
            inSR: '4326',
            outSR: '4326',
            returnGeometry: 'true'
        });

        const response = await fetch(`${PARCEL_WFS_URL}?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch parcel data');

        const data = await response.json();

        if (data.features && data.features.length > 0) {
            const feature = data.features[0];
            return {
                pin: feature.attributes.PIN,
                address: feature.attributes.SITEADDR,
                owner: feature.attributes.OWNER_NAME,
                geometry: convertEsriToGeoJSON(feature.geometry)
            };
        }

        return null;
    } catch (error) {
        console.error('Error fetching parcel:', error);
        return null;
    }
}

function convertEsriToGeoJSON(esriGeometry: any) {
    // Simple conversion for Polygon rings
    if (esriGeometry.rings) {
        return {
            type: 'Polygon',
            coordinates: esriGeometry.rings
        };
    }
    return null;
}
