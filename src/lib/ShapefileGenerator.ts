import { zip } from 'shp-write';
import proj4 from 'proj4';
import JSZip from 'jszip';

// Define projections
const WGS84 = 'EPSG:4326';
const UTM15N = 'EPSG:26915';
const UTM15N_WKT = `PROJCS["NAD83 / UTM zone 15N",GEOGCS["NAD83",DATUM["North_American_Datum_1983",SPHEROID["GRS 1980",6378137,298.257222101,AUTHORITY["EPSG","7019"]],AUTHORITY["EPSG","6269"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4269"]],PROJECTION["Transverse_Mercator"],PARAMETER["latitude_of_origin",0],PARAMETER["central_meridian",-93],PARAMETER["scale_factor",0.9996],PARAMETER["false_easting",500000],PARAMETER["false_northing",0],UNIT["metre",1,AUTHORITY["EPSG","9001"]],AXIS["Easting",EAST],AXIS["Northing",NORTH],AUTHORITY["EPSG","26915"]]`;

// Register UTM15N
proj4.defs(UTM15N, "+proj=utm +zone=15 +ellps=GRS80 +datum=NAD83 +units=m +no_defs");

export async function generateShapefile(geoJson: any, filename: string = 'excavation') {
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

    const options = {
        folder: filename,
        types: {
            polygon: filename,
            point: filename + '_points'
        }
    };

    try {
        // Generate the standard zip from shp-write
        // @ts-ignore
        const standardZipData = zip(reprojectedGeoJson, options);

        // Load into JSZip to manipulate
        const zipContainer = new JSZip();
        // shp-write returns a base64 string or binary string usually.
        await zipContainer.loadAsync(standardZipData, { base64: true });

        // 3. Inject the PRJ file
        // We need to add it to the folder created inside the zip
        // Check if folder exists
        const folder = zipContainer.folder(filename);
        if (folder) {
            folder.file(`${filename}.prj`, UTM15N_WKT);
            // Also add for points if they exist
            if (zipContainer.file(`${filename}/${filename}_points.shp`)) {
                folder.file(`${filename}_points.prj`, UTM15N_WKT);
            }
        } else {
            // If structure is flat
            zipContainer.file(`${filename}.prj`, UTM15N_WKT);
        }

        // 4. Generate Blob and Download
        const content = await zipContainer.generateAsync({ type: 'blob' });

        // Trigger download
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

    } catch (error) {
        console.error("Failed to generate shapefile:", error);
        alert("Error generating shapefile. Please check console.");
    }
}
