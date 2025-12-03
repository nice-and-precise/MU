use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[derive(Serialize, Deserialize, Clone, Copy, Debug)]
pub struct SurveyInput {
    pub md: f64,
    pub inc: f64,
    pub azi: f64,
}

#[derive(Serialize, Deserialize, Clone, Copy, Debug)]
pub struct SurveyStation {
    pub md: f64,
    pub inc: f64,
    pub azi: f64,
    pub tvd: f64,
    pub north: f64,
    pub east: f64,
    pub dls: f64,
    pub closure_dist: f64,
    pub closure_azi: f64,
}

// Pure Rust implementation
pub fn calculate_survey_points_pure(inputs: Vec<SurveyInput>) -> Vec<SurveyStation> {
    let mut stations = Vec::new();

    if inputs.is_empty() {
        return stations;
    }

    let mut current = SurveyStation {
        md: inputs[0].md,
        inc: inputs[0].inc,
        azi: inputs[0].azi,
        tvd: 0.0,
        north: 0.0,
        east: 0.0,
        dls: 0.0,
        closure_dist: 0.0,
        closure_azi: 0.0,
    };
    stations.push(current.clone());

    for i in 1..inputs.len() {
        let prev_input = &inputs[i - 1];
        let curr_input = &inputs[i];

        // Convert to radians
        let i1 = prev_input.inc.to_radians();
        let a1 = prev_input.azi.to_radians();
        let i2 = curr_input.inc.to_radians();
        let a2 = curr_input.azi.to_radians();

        let delta_md = curr_input.md - prev_input.md;

        // Dogleg Angle (beta)
        let cos_beta = i1.sin() * i2.sin() * (a2 - a1).cos() + i1.cos() * i2.cos();
        // Clamp to avoid NaN
        let beta = cos_beta.clamp(-1.0, 1.0).acos();

        // Ratio Factor (RF)
        let rf = if beta.abs() < 1e-6 {
            1.0
        } else {
            (2.0 / beta) * (beta / 2.0).tan()
        };

        let delta_north = (delta_md / 2.0) * (i1.sin() * a1.cos() + i2.sin() * a2.cos()) * rf;
        let delta_east = (delta_md / 2.0) * (i1.sin() * a1.sin() + i2.sin() * a2.sin()) * rf;
        let delta_tvd = (delta_md / 2.0) * (i1.cos() + i2.cos()) * rf;

        current.md = curr_input.md;
        current.inc = curr_input.inc;
        current.azi = curr_input.azi;
        current.north += delta_north;
        current.east += delta_east;
        current.tvd += delta_tvd;

        // DLS (deg/100ft)
        current.dls = if delta_md > 0.0 {
            (beta.to_degrees() / delta_md) * 100.0
        } else {
            0.0
        };

        current.closure_dist = (current.north.powi(2) + current.east.powi(2)).sqrt();
        current.closure_azi = current.east.atan2(current.north).to_degrees();
        if current.closure_azi < 0.0 {
            current.closure_azi += 360.0;
        }

        stations.push(current.clone());
    }

    stations
}

#[wasm_bindgen]
pub fn calculate_survey_points(val: JsValue) -> JsValue {
    let inputs: Vec<SurveyInput> = serde_wasm_bindgen::from_value(val).unwrap();
    let stations = calculate_survey_points_pure(inputs);
    serde_wasm_bindgen::to_value(&stations).unwrap()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_calculate_survey_points() {
        let inputs = vec![
            SurveyInput {
                md: 0.0,
                inc: 0.0,
                azi: 0.0,
            },
            SurveyInput {
                md: 100.0,
                inc: 10.0,
                azi: 10.0,
            },
        ];

        let stations = calculate_survey_points_pure(inputs);
        assert_eq!(stations.len(), 2);
        assert!(stations[1].tvd < 100.0); // Should be less than MD due to inclination
    }
}
