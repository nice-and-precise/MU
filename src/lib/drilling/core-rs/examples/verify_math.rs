use core_rs::mcm::{calculate_survey_points_pure, SurveyInput};
use core_rs::physics::hydraulics::{calculate_hydraulics_pure, HydraulicsInput};
use core_rs::physics::torque_drag::{calculate_torque_drag_pure, TnDInput};
use serde_json::to_string_pretty;

fn main() {
    println!("Running Verification for MU Core Physics...");

    // 1. Setup Dummy Survey Data (Standard Directional Well)
    let inputs = vec![
        SurveyInput {
            md: 0.0,
            inc: 0.0,
            azi: 0.0,
        },
        SurveyInput {
            md: 100.0,
            inc: 0.0,
            azi: 0.0,
        }, // Vertical section
        SurveyInput {
            md: 500.0,
            inc: 10.0,
            azi: 45.0,
        }, // Kickoff
        SurveyInput {
            md: 1000.0,
            inc: 30.0,
            azi: 45.0,
        }, // Build
        SurveyInput {
            md: 2000.0,
            inc: 30.0,
            azi: 45.0,
        }, // Hold
        SurveyInput {
            md: 2500.0,
            inc: 45.0,
            azi: 90.0,
        }, // Turn
    ];

    println!("\n--- 1. Minimum Curvature Method (MCM) ---");
    let stations = calculate_survey_points_pure(inputs);
    println!("Survey Stations (First 5):");
    for i in 0..5.min(stations.len()) {
        println!(
            "MD: {:.1}, Inc: {:.1}, Azi: {:.1}, TVD: {:.1}, North: {:.1}, East: {:.1}",
            stations[i].md,
            stations[i].inc,
            stations[i].azi,
            stations[i].tvd,
            stations[i].north,
            stations[i].east
        );
    }

    // 2. Torque & Drag
    println!("\n--- 2. Torque & Drag ---");
    let tnd_input = TnDInput {
        trajectory: stations.clone(),
        pipe_od: 5.0,
        pipe_id: 4.276,
        // pipe_weight: 19.5, // Not in struct? Checking Step 430... TnDInput has: trajectory, pipe_od, pipe_id, mud_density, friction_coeff.
        // Wait, Step 430 shows: trajectory, pipe_od, pipe_id, mud_density, friction_coeff.
        // NO pipe_weight, wob, tob.
        mud_density: 10.0,
        friction_coeff: 0.25,
    };

    let tnd_results = calculate_torque_drag_pure(tnd_input);
    println!("Torque & Drag Results (First 5):");
    for i in 0..5.min(tnd_results.md.len()) {
        println!(
            "MD: {:.1}, Tension: {:.1}, Torque: {:.1}",
            tnd_results.md[i], tnd_results.tension[i], tnd_results.torque[i]
        );
    }

    // 3. Hydraulics
    println!("\n--- 3. Hydraulics ---");
    let hydro_input = HydraulicsInput {
        flow_rate: 500.0,
        mud_density: 10.0,
        plastic_viscosity: 20.0,
        yield_point: 15.0,
        pipe_od: 5.0,
        // pipe_id: 4.276, // Not in struct? Checking Step 431... Yes, pipe_id is NOT in HydraulicsInput struct.
        // Wait, Step 431 shows: flow_rate, mud_density, plastic_viscosity, yield_point, hole_diam, pipe_od, depth, fracture_gradient.
        // NO pipe_id.
        hole_diam: 8.5,
        depth: 2500.0,          // length -> depth
        fracture_gradient: 0.8, // psi/ft
    };
    let hydro_results = calculate_hydraulics_pure(hydro_input);
    println!(
        "Hydraulics Results: {}",
        to_string_pretty(&hydro_results).unwrap()
    );
}
