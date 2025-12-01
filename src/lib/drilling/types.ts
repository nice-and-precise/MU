export interface SurveyStation {
  md: number; // Measured Depth
  inc: number; // Inclination (degrees)
  azi: number; // Azimuth (degrees)
  tvd: number; // True Vertical Depth
  north: number; // North displacement
  east: number; // East displacement
  dls?: number; // Dogleg Severity (deg/100ft or deg/30m)
  vs?: number; // Vertical Section
  cd?: number; // Closure Distance
  ca?: number; // Closure Azimuth
  rf?: number; // Ratio Factor (debug/internal)
}

export interface Trajectory {
  id: string;
  name: string;
  stations: SurveyStation[];
  units: 'feet' | 'meters';
}

export interface Wellbore {
  id: string;
  name: string;
  trajectories: Trajectory[];
  targetDepth?: number;
  kickOffPoint?: number;
}

export interface RodPlanInput {
  targetDepth: number;
  targetDistance: number;
  entryAngle: number;
  rodLength: number;
  maxBend: number; // degrees per rod or % pitch change
}

export interface RodPlanStep {
  rodNumber: number;
  md: number;
  pitch: number;
  depth: number;
  distance: number;
  action: string; // e.g., "Push", "Steer Up"
}

// WITSML-like intermediate types (simplified for internal use)
export interface WitsmlTrajectoryStation {
  md: number;
  tvd: number;
  incl: number;
  azi: number;
  dls?: number;
}

export interface Obstacle {
  id: string;
  name: string;
  type: string; // 'gas', 'water', etc.
  startX: number;
  startY: number; // Depth (TVD)
  startZ: number; // North/South
  endX?: number | null;
  endY?: number | null;
  endZ?: number | null;
  diameter?: number | null;
  safetyBuffer?: number;
}
