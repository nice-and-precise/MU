use axum::{
    routing::{get, post},
    Router,
    Json,
};
use serde::{Deserialize, Serialize};
use std::net::SocketAddr;
use tower_http::cors::CorsLayer;
use engine::{calculate_path, SurveyPoint};

#[tokio::main]
async fn main() {
    // Define routes
    let app = Router::new()
        .route("/health", get(health_check))
        .route("/api/calculate/mcm", post(calculate_mcm))
        .layer(CorsLayer::permissive());

    // Run server
    let addr = SocketAddr::from(([127, 0, 0, 1], 8080));
    println!("Rust Engine listening on {}", addr);
    
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn health_check() -> &'static str {
    "Rust Engine is running!"
}

#[derive(Deserialize)]
struct McmRequest {
    surveys: Vec<SurveyInput>,
}

#[derive(Deserialize)]
struct SurveyInput {
    md: f64,
    pitch: f64,
    az: f64,
}

#[derive(Serialize)]
struct McmResponse {
    path: Vec<PathPoint>,
}

#[derive(Serialize)]
struct PathPoint {
    north: f64,
    east: f64,
    tvd: f64,
}

async fn calculate_mcm(Json(payload): Json<McmRequest>) -> Json<McmResponse> {
    // Convert input to SurveyPoint
    let points: Vec<SurveyPoint> = payload.surveys.iter().map(|s| SurveyPoint {
        measured_depth: s.md,
        inclination: s.pitch, // Note: lib.rs expects Pitch (0=Horizontal) based on comments? 
                              // Let's check lib.rs again.
                              // Line 34: let i1 = (90.0 - p1.inclination).to_radians();
                              // If p1.inclination is Pitch (0), then i1 = 90 (Vertical).
                              // If p1.inclination is 90 (Vertical down), i1 = 0.
                              // The formula uses sin(i1).
                              // If i1=90 (Horizontal in formula view?), sin(90)=1.
                              // Wait, standard MCM uses Inclination where 0=Vertical.
                              // If lib.rs does (90 - input), it assumes input is Pitch (0=Horizontal).
                              // So we pass Pitch directly.
        azimuth: s.az,
    }).collect();

    let result = calculate_path(&points);

    let path_response: Vec<PathPoint> = result.iter().map(|p| PathPoint {
        north: p.north,
        east: p.east,
        tvd: p.tvd,
    }).collect();

    Json(McmResponse {
        path: path_response,
    })
}
