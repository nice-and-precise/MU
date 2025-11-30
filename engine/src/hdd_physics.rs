use std::f64::consts::E;

pub struct BoreParams {
    pub pipe_weight_per_ft: f64,
    pub fluid_density_ppg: f64,
    pub friction_coeff: f64,
    pub pipe_diameter_in: f64,
    pub hole_diameter_in: f64,
}

pub struct SoilParams {
    pub shear_strength: f64, // c
    pub friction_angle: f64, // phi (degrees)
    pub pore_pressure: f64,
    pub overburden_depth: f64,
}

/// Calculates the Capstan effect (exponential tension increase around curves).
/// T_out = T_in * e^(mu * alpha)
pub fn calculate_capstan(tension_in: f64, friction_coeff: f64, angle_radians: f64) -> f64 {
    tension_in * E.powf(friction_coeff * angle_radians)
}

/// Calculates Maximum Allowable Annular Pressure (MAAP) using Delft Cavity Expansion Model.
/// P_max = P_pore + sigma_radial * (1 + sin(phi)) + c * cos(phi) + P_viscous
pub fn calculate_maap(soil: &SoilParams, radial_stress: f64, viscous_shear: f64) -> f64 {
    let phi_rad = soil.friction_angle.to_radians();
    
    soil.pore_pressure 
        + radial_stress * (1.0 + phi_rad.sin()) 
        + soil.shear_strength * phi_rad.cos() 
        + viscous_shear
}

/// Estimates simple Pullback Force (ASTM F1962 simplified).
/// This is a basic summation; real ASTM F1962 is much more complex involving segments.
pub fn estimate_pullback(params: &BoreParams, length_ft: f64, cumulative_angle_rad: f64) -> f64 {
    // Buoyancy factor (simplified)
    // If fluid density > pipe density, pipe floats (drag against top).
    // We'll just use a basic drag coefficient for now.
    
    let drag_force = params.pipe_weight_per_ft * length_ft * params.friction_coeff;
    let capstan_factor = E.powf(params.friction_coeff * cumulative_angle_rad);
    
    drag_force * capstan_factor
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_capstan() {
        let t_in = 1000.0;
        let mu = 0.3;
        let angle = 1.57; // 90 degrees
        let t_out = calculate_capstan(t_in, mu, angle);
        assert!(t_out > t_in);
    }
}
