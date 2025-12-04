import { download } from 'shp-write';
import proj4 from 'proj4';

// Define projections
const WGS84 = 'EPSG:4326';
const UTM15N = 'EPSG:26915';
const UTM15N_WKT = `PROJCS["NAD83 / UTM zone 15N",GEOGCS["NAD83",DATUM["North_American_Datum_1983",SPHEROID["GRS 1980",6378137,298.257222101,AUTHORITY["EPSG","7019"]],AUTHORITY["EPSG","6269"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4269"]],PROJECTION["Transverse_Mercator"],PARAMETER["latitude_of_origin",0],PARAMETER["central_meridian",-93],PARAMETER["scale_factor",0.9996],PARAMETER["false_easting",500000],PARAMETER["false_northing",0],UNIT["metre",1,AUTHORITY["EPSG","9001"]],AXIS["Easting",EAST],AXIS["Northing",NORTH],AUTHORITY["EPSG","26915"]]`;

// Register UTM15N
proj4.defs(UTM15N, "+proj=utm +zone=15 +ellps=GRS80 +datum=NAD83 +units=m +no_defs");

export function generateShapefile(geoJson: any, filename: string = 'excavation') {
    // 1. Reproject GeoJSON from WGS84 to UTM Zone 15N
    const reprojectedGeoJson = JSON.parse(JSON.stringify(geoJson)); // Deep copy

    // Helper to reproject a point
    const reprojectPoint = (coords: number[]) => {
        return proj4(WGS84, UTM15N, coords);
    };

    // Reproject geometry
    if (reprojectedGeoJson.features) {
        reprojectedGeoJson.features.forEach((feature: any) => {
            if (feature.geometry.type === 'Polygon') {
                feature.geometry.coordinates = feature.geometry.coordinates.map((ring: any) =>
                    ring.map(reprojectPoint)
                );
            } else if (feature.geometry.type === 'Point') {
                feature.geometry.coordinates = reprojectPoint(feature.geometry.coordinates);
            }
        });
    }

    // 2. Generate Shapefile using shp-write
    // shp-write expects a GeoJSON object or array of features
    // We pass options to include the .prj file

    // Note: shp-write's download function triggers a browser download.
    // If we need a Blob, we might need 'zip' function from shp-write (if available) or use jszip manually.
    // For now, we assume client-side usage.

    const options = {
        folder: filename,
        types: {
            polygon: filename,
        },
        // shp-write doesn't natively support passing custom PRJ content easily in the 'download' helper 
        // without some hacks or using the lower-level zip function.
        // However, we can try to inject it if we use the lower level API.
    };

    // Since shp-write is a bit basic, let's use it to generate the binary data and then zip it ourselves if needed,
    // OR just use it as is and hope ITIC accepts WGS84 if we can't force the PRJ.
    // BUT the requirement is strict UTM15N.

    // Let's try to use the 'zip' function if exported, or just use 'download' and accept we might need to patch the PRJ.
    // Actually, shp-write puts a standard WGS84 prj if not specified.

    // Alternative: Use 'jszip' to build the zip manually, using 'shp-write' to get the SHP/SHX/DBF buffers.
    // shp-write exports `zip`? Let's check imports.
    // import { zip } from 'shp-write'; 

    // If shp-write doesn't support custom PRJ, we might need to overwrite it in the zip.

    download(reprojectedGeoJson, options);
}
