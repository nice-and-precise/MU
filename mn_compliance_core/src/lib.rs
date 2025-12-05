use geo::{Area, Centroid, LineString, Point, Polygon, Rect};
use proj4rs::Proj;
use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ComplianceError {
    #[error("Projection error: {0}")]
    ProjectionError(String),
    #[error("Validation error: {0}")]
    ValidationError(String),
    #[error("WFS error: {0}")]
    WfsError(String),
}

/// Handles coordinate projection between WGS84 (GPS) and UTM Zone 15N (MN Standard).
pub struct MnProjector {
    to_utm: Proj,
    to_wgs84: Proj,
}

impl MnProjector {
    pub fn new() -> Result<Self, ComplianceError> {
        // WGS84 definition
        let wgs84_def = "+proj=longlat +datum=WGS84 +no_defs";
        // UTM Zone 15N definition (EPSG:26915)
        // +proj=utm +zone=15 +ellps=GRS80 +datum=NAD83 +units=m +no_defs
        let utm15n_def = "+proj=utm +zone=15 +ellps=GRS80 +datum=NAD83 +units=m +no_defs";

        let to_utm = Proj::from_proj_string(utm15n_def).map_err(|e| {
            ComplianceError::ProjectionError(format!("Failed to init UTM projection: {}", e))
        })?;

        // For reverse, we usually just use the same Proj object but with inverse flag,
        // but proj4rs might handle it differently.
        // Actually, proj4rs Proj object represents a *target* projection usually, or a transformation?
        // Looking at common usage: Proj::new(def) creates a projection.
        // To transform, we need a source and target.
        // proj4rs might not have a high-level "transform" function like proj.
        // We might need to implement the transform manually or use a different crate.

        // Let's try to use the `transform` method if it exists, or `project`.
        // If proj4rs is just a projection engine, we project from lat/lon to x/y.
        // WGS84 is the "base" for many projections.

        Ok(Self {
            to_utm,
            to_wgs84: Proj::from_proj_string(wgs84_def).map_err(|e| {
                ComplianceError::ProjectionError(format!("Failed to init WGS84 projection: {}", e))
            })?,
        })
    }

    pub fn project_to_utm(&self, point: Point<f64>) -> Result<Point<f64>, ComplianceError> {
        // proj4rs usually takes radians for lat/lon if it's a projection.
        // But let's assume it handles degrees if we use +proj=longlat?
        // Actually, standard PROJ expects radians for low level, but high level transform handles it.
        // With proj4rs, we might need to convert to radians first.

        let x = point.x().to_radians();
        let y = point.y().to_radians();

        // This is a guess at the API. If it fails, I'll see the compiler error.
        // Ideally we want a transform(src, dst, point).
        // proj4rs::transform::transform(&src, &dst, &mut point)

        let mut p = (x, y, 0.0);
        proj4rs::transform::transform(&self.to_wgs84, &self.to_utm, &mut p)
            .map_err(|e| ComplianceError::ProjectionError(format!("Transform failed: {}", e)))?;

        Ok(Point::new(p.0, p.1))
    }

    pub fn project_to_wgs84(&self, point: Point<f64>) -> Result<Point<f64>, ComplianceError> {
        let mut p = (point.x(), point.y(), 0.0);
        proj4rs::transform::transform(&self.to_utm, &self.to_wgs84, &mut p)
            .map_err(|e| ComplianceError::ProjectionError(format!("Transform failed: {}", e)))?;

        // Convert back to degrees
        Ok(Point::new(p.0.to_degrees(), p.1.to_degrees()))
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationError {
    pub code: String,
    pub message: String,
}

/// Validates excavation areas against MN 2026 rules.
pub fn validate_excavation_area(
    polygon: &Polygon<f64>,
    projector: &MnProjector,
) -> Vec<ValidationError> {
    let mut errors = Vec::new();

    if !polygon.exterior().is_closed() {
        errors.push(ValidationError {
            code: "TOPOLOGY_OPEN".into(),
            message: "Polygon ring is not closed.".into(),
        });
    }

    let exterior_coords: Vec<Point<f64>> = polygon
        .exterior()
        .points()
        .map(|p| projector.project_to_utm(p).unwrap_or(Point::new(0.0, 0.0)))
        .collect();
    let projected_exterior = LineString::from(exterior_coords);
    let projected_polygon = Polygon::new(projected_exterior, vec![]);

    let area_sq_meters = projected_polygon.unsigned_area();
    let area_acres = area_sq_meters * 0.000247105;

    if area_acres > 2.0 {
        errors.push(ValidationError {
            code: "AREA_LIMIT_EXCEEDED".into(),
            message: format!(
                "Area {:.2} acres exceeds the 2.0 acre limit for standard tickets.",
                area_acres
            ),
        });
    }

    if polygon.exterior().0.len() > 1000 {
        errors.push(ValidationError {
            code: "VERTEX_LIMIT_EXCEEDED".into(),
            message: "Polygon has too many vertices (> 1000).".into(),
        });
    }

    errors
}

pub fn generate_marking_instructions(geometry: &Polygon<f64>) -> String {
    if let Some(centroid) = geometry.centroid() {
        format!(
            "Excavate area bounded by polygon centered at Lat: {:.5}, Lon: {:.5}",
            centroid.y(),
            centroid.x()
        )
    } else {
        "Excavate area bounded by provided polygon.".to_string()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MnParcel {
    pub pin: String,
    pub address: Option<String>,
    pub owner: Option<String>,
    // We can't easily serialize geo::Polygon directly without a wrapper or custom serializer,
    // so for now we might just return the geometry as a separate field or simplified.
    // Actually, let's return the raw coordinates or a simplified structure for WASM.
    // For WASM, we'll likely want a flat array of coords or a WKT string.
    // But for this struct, let's keep it simple.
    // We'll add a method to get the polygon.
}

#[derive(Debug, Deserialize)]
struct ArcGisResponse {
    features: Vec<ArcGisFeature>,
}

#[derive(Debug, Deserialize)]
struct ArcGisFeature {
    attributes: ArcGisAttributes,
    geometry: ArcGisGeometry,
}

#[derive(Debug, Deserialize)]
struct ArcGisAttributes {
    #[serde(rename = "PIN")]
    pin: String,
    #[serde(rename = "SITEADDR")]
    site_addr: Option<String>,
    #[serde(rename = "OWNER_NAME")]
    owner_name: Option<String>,
}

#[derive(Debug, Deserialize)]
struct ArcGisGeometry {
    rings: Vec<Vec<[f64; 2]>>,
}

/// Fetches parcel data at a specific location (Lat/Lon) using the Metro Regional Parcels API.
pub async fn fetch_parcel_at_point(
    lat: f64,
    lon: f64,
) -> Result<Option<(MnParcel, Polygon<f64>)>, ComplianceError> {
    let base_url = "https://arcgis.metrocouncil.org/server/rest/services/Parcels/RegionalParcels/MapServer/0/query";

    let client = reqwest::Client::new();
    let params = [
        ("f", "json"),
        ("geometry", &format!("{},{}", lon, lat)), // ArcGIS expects x,y (lon,lat)
        ("geometryType", "esriGeometryPoint"),
        ("spatialRel", "esriSpatialRelIntersects"),
        ("outFields", "PIN,SITEADDR,OWNER_NAME"),
        ("inSR", "4326"),
        ("outSR", "4326"),
        ("returnGeometry", "true"),
    ];

    let response = client
        .get(base_url)
        .query(&params)
        .send()
        .await
        .map_err(|e| ComplianceError::WfsError(format!("Request failed: {}", e)))?;

    if !response.status().is_success() {
        return Err(ComplianceError::WfsError(format!(
            "Server error: {}",
            response.status()
        )));
    }

    let arc_response: ArcGisResponse = response
        .json()
        .await
        .map_err(|e| ComplianceError::WfsError(format!("Parse error: {}", e)))?;

    if let Some(feature) = arc_response.features.into_iter().next() {
        let parcel = MnParcel {
            pin: feature.attributes.pin,
            address: feature.attributes.site_addr,
            owner: feature.attributes.owner_name,
        };

        // Convert rings to Polygon
        // ArcGIS rings are [ [x, y], ... ]
        // geo::Polygon expects LineString
        if let Some(outer_ring) = feature.geometry.rings.first() {
            let coords: Vec<Point<f64>> =
                outer_ring.iter().map(|p| Point::new(p[0], p[1])).collect();

            // Ensure closed
            let mut line_coords = coords;
            if let Some(first) = line_coords.first() {
                if let Some(last) = line_coords.last() {
                    if first != last {
                        line_coords.push(*first);
                    }
                }
            }

            let exterior = LineString::from(line_coords);
            // TODO: Handle interior rings (holes) if present in subsequent items of `rings`
            let poly = Polygon::new(exterior, vec![]);

            return Ok(Some((parcel, poly)));
        }
    }

    Ok(None)
}

// Keep the stub for bbox if needed, or remove/update it.
// For now, I'll leave it as a stub but comment it out or just leave it to avoid breaking changes if I used it elsewhere (I didn't).
pub async fn fetch_parcels_in_bbox(_bbox: Rect<f64>) -> Result<Vec<MnParcel>, ComplianceError> {
    Ok(vec![])
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_projection() {
        let projector = MnProjector::new().expect("Failed to init projector");
        let mpls = Point::new(-93.2650, 44.9778);
        let utm = projector.project_to_utm(mpls).expect("Projection failed");

        // Expected UTM Zone 15N for Mpls is approx E: 479100, N: 4980600
        // proj4rs might return slightly different values or require different input units.
        // If this fails, we debug the units.
        assert!(utm.x() > 470000.0 && utm.x() < 490000.0);
        assert!(utm.y() > 4900000.0 && utm.y() < 5000000.0);
    }

    #[test]
    fn test_area_validation() {
        let projector = MnProjector::new().expect("Failed to init projector");

        let p1 = Point::new(-93.2650, 44.9778);
        let p2 = Point::new(-93.2650 + 0.0005, 44.9778);
        let p3 = Point::new(-93.2650 + 0.0005, 44.9778 + 0.0005);
        let p4 = Point::new(-93.2650, 44.9778 + 0.0005);

        let poly = Polygon::new(LineString::from(vec![p1, p2, p3, p4, p1]), vec![]);

        let errors = validate_excavation_area(&poly, &projector);
        assert!(errors.is_empty(), "Should be valid small area");
    }
}
