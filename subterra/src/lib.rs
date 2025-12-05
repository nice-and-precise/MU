mod telemetry;
mod voxel;

use bevy::prelude::*;
use telemetry::{TelemetryPlugin, CURRENT_SCENARIO};
use voxel::VoxelPlugin;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn set_scenario(id: u8) {
    if let Ok(mut scenario) = CURRENT_SCENARIO.write() {
        *scenario = id;
    }
}

#[wasm_bindgen]
pub fn run_app() {
    App::new()
        .add_plugins(DefaultPlugins.set(WindowPlugin {
            primary_window: Some(Window {
                title: "Subterra Cognitive Interface".into(),
                canvas: Some("#subterra-canvas".into()),
                fit_canvas_to_parent: true,
                prevent_default_event_handling: false,
                ..default()
            }),
            ..default()
        }))
        .add_plugins(TelemetryPlugin)
        .add_plugins(VoxelPlugin)
        .run();
}

// For native testing
pub fn main() {
    App::new()
        .add_plugins(DefaultPlugins)
        .add_plugins(TelemetryPlugin)
        .add_plugins(VoxelPlugin)
        .run();
}

use geo::{LineString, Point as GeoPoint, Polygon as GeoPolygon};
use mn_compliance_core::{generate_marking_instructions, validate_excavation_area, MnProjector};

#[wasm_bindgen]
pub fn validate_polygon_compliance(coords: &[f64]) -> String {
    // Expect coords as [x1, y1, x2, y2, ...]
    let mut points = Vec::new();
    for chunk in coords.chunks(2) {
        if chunk.len() == 2 {
            points.push(GeoPoint::new(chunk[0], chunk[1]));
        }
    }

    if points.is_empty() {
        return r#"[{"code":"INVALID_INPUT","message":"No coordinates provided"}]"#.to_string();
    }

    let line_string = LineString::from(points);
    let polygon = GeoPolygon::new(line_string, vec![]);

    let projector = match MnProjector::new() {
        Ok(p) => p,
        Err(e) => {
            return format!(
                r#"[{{ "code": "PROJECTION_INIT_ERROR", "message": "{}" }}]"#,
                e
            )
        }
    };

    let errors = validate_excavation_area(&polygon, &projector);

    serde_json::to_string(&errors).unwrap_or_else(|_| "[]".to_string())
}

#[wasm_bindgen]
pub fn get_marking_instructions(coords: &[f64]) -> String {
    let mut points = Vec::new();
    for chunk in coords.chunks(2) {
        if chunk.len() == 2 {
            points.push(GeoPoint::new(chunk[0], chunk[1]));
        }
    }

    let line_string = LineString::from(points);
    let polygon = GeoPolygon::new(line_string, vec![]);

    generate_marking_instructions(&polygon)
}

#[wasm_bindgen]
pub async fn get_parcel_at_point(lat: f64, lon: f64) -> String {
    match mn_compliance_core::fetch_parcel_at_point(lat, lon).await {
        Ok(Some((parcel, polygon))) => {
             let coords: Vec<[f64; 2]> = polygon.exterior().points().map(|p| [p.x(), p.y()]).collect();
             
             let result = serde_json::json!({
                 "pin": parcel.pin,
                 "address": parcel.address,
                 "owner": parcel.owner,
                 "geometry": coords 
             });
             result.to_string()
        },
        Ok(None) => "null".to_string(),
        Err(e) => format!(r#"{{"error": "{}"}}"#, e)
    }
}
