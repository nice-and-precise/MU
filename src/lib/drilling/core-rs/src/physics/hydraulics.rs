use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[derive(Serialize, Deserialize)]
pub struct HydraulicsInput {
    pub flow_rate: f64,         // gpm
    pub mud_density: f64,       // ppg
    pub plastic_viscosity: f64, // cP
    pub yield_point: f64,       // lb/100ft2
    pub hole_diam: f64,         // in
    pub pipe_od: f64,           // in
    pub depth: f64,             // ft
    pub fracture_gradient: f64, // psi/ft
}

#[derive(Serialize, Deserialize)]
pub struct HydraulicsResult {
    pub annular_velocity: f64, // ft/min
    pub pressure_loss: f64,    // psi
    pub ecd: f64,              // ppg
    pub frac_risk: bool,
    pub frac_risk_msg: String,
}

// Pure Rust implementation
pub fn calculate_hydraulics_pure(input: HydraulicsInput) -> HydraulicsResult {
    // Annular Velocity (ft/min) = (24.5 * Q) / (Dh^2 - Dp^2)
    let av = (24.5 * input.flow_rate) / (input.hole_diam.powi(2) - input.pipe_od.powi(2));

    // Bingham Plastic Model for Pressure Loss
    // PV is plastic viscosity, YP is yield point
    // This is a simplified approximation for annular flow

    // Critical Velocity?
    // For now, assume laminar/turbulent transition check or just use a standard formula
    // Pressure Loss (psi) = (L * YP) / (225 * (Dh - Dp)) + (L * PV * V) / (1500 * (Dh - Dp)^2)
    // L is length (depth here for vertical approximation, or MD)

    let term1 = (input.depth * input.yield_point) / (225.0 * (input.hole_diam - input.pipe_od));
    let term2 = (input.depth * input.plastic_viscosity * av)
        / (1500.0 * (input.hole_diam - input.pipe_od).powi(2));
    let pressure_loss = term1 + term2;

    // ECD (ppg) = MW + (P_loss / (0.052 * TVD))
    // Using depth as TVD for simplicity if not provided separately
    let ecd = input.mud_density + (pressure_loss / (0.052 * input.depth));

    // Frac-Out Risk
    // Formation Fracture Pressure = Fracture Gradient * Depth
    // Hydrostatic Pressure + Dynamic Pressure (ECD converted) vs Frac Pressure
    // Actually ECD is directly comparable to Frac Gradient if Frac Gradient is in ppg equivalent?
    // Usually Frac Gradient is psi/ft.
    // Frac Pressure (psi) = Frac Gradient * Depth
    // Bottom Hole Pressure (psi) = 0.052 * ECD * Depth

    let frac_pressure = input.fracture_gradient * input.depth;
    let bottom_hole_pressure = 0.052 * ecd * input.depth;

    let frac_risk = bottom_hole_pressure > frac_pressure;
    let frac_risk_msg = if frac_risk {
        format!("WARNING: ECD ({:.2} ppg) exceeds Frac Gradient!", ecd)
    } else {
        "Safe".to_string()
    };

    HydraulicsResult {
        annular_velocity: av,
        pressure_loss,
        ecd,
        frac_risk,
        frac_risk_msg,
    }
}

#[wasm_bindgen]
pub fn calculate_hydraulics(inputs: JsValue) -> JsValue {
    let input: HydraulicsInput = serde_wasm_bindgen::from_value(inputs).unwrap();
    let result = calculate_hydraulics_pure(input);
    serde_wasm_bindgen::to_value(&result).unwrap()
}
