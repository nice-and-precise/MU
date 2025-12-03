mod telemetry;
mod voxel;

use bevy::prelude::*;
use telemetry::{CURRENT_SCENARIO, TelemetryPlugin};
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
