use bevy::prelude::*;
use rand::Rng;
use std::sync::RwLock;

pub static CURRENT_SCENARIO: RwLock<u8> = RwLock::new(0); // 0: Normal, 1: Hard Rock, 2: Void, 3: Deviation

#[derive(Resource, Default, Debug, Clone)]
pub struct DrillTelemetry {
    pub torque: f32,
    pub rpm: f32,
    pub thrust_pressure: f32,
    pub depth: f32,
    pub rock_hardness: f32, // 0.0 to 1.0
}

pub struct TelemetryPlugin;

impl Plugin for TelemetryPlugin {
    fn build(&self, app: &mut App) {
        app.init_resource::<DrillTelemetry>()
            .add_systems(Update, update_telemetry);
    }
}

fn update_telemetry(mut telemetry: ResMut<DrillTelemetry>, time: Res<Time>) {
    let mut rng = rand::thread_rng();
    let t = time.elapsed_seconds();

    let scenario = *CURRENT_SCENARIO.read().unwrap();

    // Base values
    let mut base_torque = 2000.0;
    let mut base_rpm = 120.0;
    let mut base_thrust = 1500.0;
    let mut hardness = 0.2; // Clay

    match scenario {
        1 => {
            // Hard Rock Strike
            base_torque = 4500.0;
            base_rpm = 80.0; // Bogging down
            base_thrust = 2500.0;
            hardness = 0.95;
        }
        2 => {
            // Void / Fluid Loss
            base_torque = 500.0; // Free spinning
            base_rpm = 180.0; // Racing
            base_thrust = 800.0; // Falling in
            hardness = 0.0;
        }
        3 => {
            // Deviation / Steering
            base_torque = 2800.0;
            hardness = 0.6;
            // In a real sim, we'd change vector. Here we just show stress.
        }
        _ => {} // Normal
    }

    // Apply noise and physics simulation
    let noise = rng.gen_range(-500.0..500.0);

    // Smooth transition (simple lerp could be better but immediate is fine for responsiveness)
    telemetry.torque = base_torque + (t.sin() * 500.0) + noise;
    telemetry.rpm = base_rpm + (t.cos() * 5.0);
    telemetry.thrust_pressure = base_thrust + rng.gen_range(-100.0..100.0);
    telemetry.rock_hardness = hardness;

    // Depth (simulating drilling progress)
    let progress_rate = if scenario == 1 { 0.002 } else { 0.01 };
    telemetry.depth += progress_rate;
}
