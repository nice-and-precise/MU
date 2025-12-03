use crate::telemetry::DrillTelemetry;
use bevy::prelude::*;
use noise::{NoiseFn, Perlin};

pub struct VoxelPlugin;

impl Plugin for VoxelPlugin {
    fn build(&self, app: &mut App) {
        app.add_systems(Startup, setup_voxel_grid)
            .add_systems(Update, update_drill_visualization);
    }
}

#[derive(Component)]
struct Voxel;

#[derive(Component)]
struct DrillBit;

fn setup_voxel_grid(
    mut commands: Commands,
    mut meshes: ResMut<Assets<Mesh>>,
    mut materials: ResMut<Assets<StandardMaterial>>,
) {
    let perlin = Perlin::new(1);
    let grid_size = 20;
    let scale = 0.5;

    // Camera
    commands.spawn(Camera3dBundle {
        transform: Transform::from_xyz(10.0, 10.0, 10.0).looking_at(Vec3::ZERO, Vec3::Y),
        ..default()
    });

    // Light
    commands.spawn(PointLightBundle {
        point_light: PointLight {
            intensity: 1500.0,
            shadows_enabled: true,
            ..default()
        },
        transform: Transform::from_xyz(4.0, 8.0, 4.0),
        ..default()
    });

    // Generate Voxels
    for x in -grid_size..grid_size {
        for z in -grid_size..grid_size {
            for y in -5..0 {
                // Underground layers
                let noise_val = perlin.get([x as f64 * 0.1, y as f64 * 0.1, z as f64 * 0.1]);

                // Determine material based on noise (Soil vs Rock)
                let color = if noise_val > 0.2 {
                    Color::rgb(0.8, 0.2, 0.2) // Rock (Red)
                } else {
                    Color::rgba(0.4, 0.3, 0.2, 0.3) // Soil (Brown, Transparent)
                };

                commands.spawn((
                    PbrBundle {
                        mesh: meshes.add(Cuboid::new(scale, scale, scale)),
                        material: materials.add(StandardMaterial {
                            base_color: color,
                            alpha_mode: AlphaMode::Blend,
                            ..default()
                        }),
                        transform: Transform::from_xyz(
                            x as f32 * scale,
                            y as f32 * scale,
                            z as f32 * scale,
                        ),
                        ..default()
                    },
                    Voxel,
                ));
            }
        }
    }

    // Spawn Drill Bit (Ghost Bit)
    commands.spawn((
        PbrBundle {
            mesh: meshes.add(Sphere::new(0.3)),
            material: materials.add(StandardMaterial {
                base_color: Color::rgb(0.0, 1.0, 0.0), // Green glowing bit
                emissive: Color::rgb(0.0, 1.0, 0.0).into(),
                ..default()
            }),
            transform: Transform::from_xyz(0.0, 0.0, 0.0),
            ..default()
        },
        DrillBit,
    ));
}

fn update_drill_visualization(
    telemetry: Res<DrillTelemetry>,
    mut query: Query<&mut Transform, With<DrillBit>>,
    mut materials: ResMut<Assets<StandardMaterial>>,
    mut material_query: Query<&Handle<StandardMaterial>, With<DrillBit>>,
) {
    for mut transform in &mut query {
        // Move drill based on depth (simplified)
        // In a real app, we'd map 3D coordinates. Here we just move it along Z.
        transform.translation.z = -telemetry.depth % 10.0; // Loop for demo

        // Jitter based on torque/vibration
        let jitter = (telemetry.torque / 10000.0) * 0.05;
        transform.translation.x = rand::thread_rng().gen_range(-jitter..jitter);
        transform.translation.y = rand::thread_rng().gen_range(-jitter..jitter);
    }

    // Change color based on rock hardness (Feedback)
    if telemetry.rock_hardness > 0.5 {
        // Hard rock warning
        if let Ok(handle) = material_query.get_single_mut() {
            if let Some(mat) = materials.get_mut(handle) {
                mat.base_color = Color::rgb(1.0, 0.0, 0.0); // Red warning
                mat.emissive = LinearRgba::red().into();
            }
        }
    } else {
        if let Ok(handle) = material_query.get_single_mut() {
            if let Some(mat) = materials.get_mut(handle) {
                mat.base_color = Color::rgb(0.0, 1.0, 0.0); // Green ok
                mat.emissive = LinearRgba::green().into();
            }
        }
    }
}
