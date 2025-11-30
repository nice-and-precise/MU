pub mod witsml_parser;
pub mod hdd_physics;

pub struct SurveyPoint {
    pub measured_depth: f64,
    pub inclination: f64,
    pub azimuth: f64,
}

pub struct Coordinate3D {
    pub north: f64,
    pub east: f64,
    pub tvd: f64, // True Vertical Depth
}

/// Calculates the bore path using the Minimum Curvature Method.
pub fn calculate_path(surveys: &[SurveyPoint]) -> Vec<Coordinate3D> {
    let mut path = Vec::new();
    let mut current_n = 0.0;
    let mut current_e = 0.0;
    let mut current_tvd = 0.0;

    // Add start point (0,0,0)
    path.push(Coordinate3D { north: 0.0, east: 0.0, tvd: 0.0 });

    for i in 0..surveys.len() - 1 {
        let p1 = &surveys[i];
        let p2 = &surveys[i+1];

        let d_md = p2.measured_depth - p1.measured_depth;
        
        // Convert HDD Pitch (0=Horizontal) to Inclination (0=Vertical)
        // Inc = 90 - Pitch
        let i1 = (90.0 - p1.inclination).to_radians();
        let i2 = (90.0 - p2.inclination).to_radians();
        
        let a1 = p1.azimuth.to_radians();
        let a2 = p2.azimuth.to_radians();

        // Dogleg angle (beta)
        let beta = (i1.cos() * i2.cos() + i1.sin() * i2.sin() * (a2 - a1).cos()).acos();

        let rf = if beta.abs() < 1e-6 {
            1.0 // Straight line approximation for very small angles
        } else {
            (2.0 / beta) * (beta / 2.0).tan()
        };

        let delta_n = (d_md / 2.0) * (i1.sin() * a1.cos() + i2.sin() * a2.cos()) * rf;
        let delta_e = (d_md / 2.0) * (i1.sin() * a1.sin() + i2.sin() * a2.sin()) * rf;
        let delta_tvd = (d_md / 2.0) * (i1.cos() + i2.cos()) * rf;

        current_n += delta_n;
        current_e += delta_e;
        current_tvd += delta_tvd;

        path.push(Coordinate3D {
            north: current_n,
            east: current_e,
            tvd: current_tvd,
        });
    }

    path
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_straight_hole() {
        let surveys = vec![
            SurveyPoint { measured_depth: 0.0, inclination: 0.0, azimuth: 0.0 },
            SurveyPoint { measured_depth: 100.0, inclination: 0.0, azimuth: 0.0 },
        ];
        let path = calculate_path(&surveys);
        assert_eq!(path.len(), 2);
        assert!((path[1].north - 100.0).abs() < 1e-6); // Should go 100ft North (if Inc=0 is horizontal North? Wait, Inc=0 is usually vertical in drilling, but in HDD Inc=0 is usually horizontal level. Let's assume Inc=0 is Level, Az=0 is North).
        // Actually, standard drilling: Inc 0 = Vertical Down. Inc 90 = Horizontal.
        // HDD Convention: Pitch 0 = Horizontal.
        // The formulas used above:
        // Delta N = ... sin(I) * cos(A) ...
        // If I=0 (Vertical), sin(0)=0 -> No North change? That implies I=0 is Vertical.
        // If I=90 (Horizontal), sin(90)=1 -> Max North change.
        // So the formula assumes I=0 is Vertical, I=90 is Horizontal.
        // HDD inputs are usually Pitch (0 = Horizontal).
        // We need a conversion function: Inclination = 90 - Pitch.
    }
}
