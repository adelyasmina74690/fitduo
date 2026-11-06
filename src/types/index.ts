/**
 * FitDuo - TypeScript definitions
 */

export type Gender = 'homme' | 'femme' | 'autre';

export type Morphology = 'ectomorphe' | 'mesomorphe' | 'endomorphe';

export type ActivityLevel = 'sedentaire' | 'leger' | 'modere' | 'tres_actif';

export type Goal = 'tonifier' | 'prise_muscle' | 'perte_poids';

export type PhysicalLimitation = 'genoux' | 'dos' | 'epaules' | 'poignets';

export type WorkoutZone =
  | 'pectoraux_triceps'
  | 'jambes_fessiers'
  | 'abdos_gainage'
  | 'dos_epaules'
  | 'bras'
  | 'cardio'
  | 'mobilite';

export type WorkoutFeeling = 'trop_facile' | 'parfait' | 'trop_dur';

export type MusicVibe = 'energie' | 'chill' | 'focus';

export interface WeightEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  bmi: number;
}

export interface WorkoutHistoryItem {
  id: string;
  date: string; // ISO string
  level: number;
  dayIndex: number; // 0 to 6 (J1 to J7)
  zone: WorkoutZone;
  zoneLabel: string;
  durationSeconds: number;
  feeling: WorkoutFeeling;
  exercisesCount: number;
  wasDuo?: boolean;
}

export interface UserProfile {
  id: 'profile_1' | 'profile_2';
  name: string;
  isConfigured: boolean;
  gender: Gender;
  age: number;
  heightCm: number;
  weightKg: number;
  morphology: Morphology;
  activityLevel: ActivityLevel;
  goal: Goal;
  limitations: PhysicalLimitation[];
  currentLevel: number; // 1 to 10
  currentWeekDaysDone: boolean[]; // 7 elements boolean [J1..J7]
  streakDays: number;
  lastWorkoutDate: string | null; // YYYY-MM-DD
  totalMinutes: number;
  weightHistory: WeightEntry[];
  workoutHistory: WorkoutHistoryItem[];
  pendingLevelUp?: boolean;
  colorTheme: 'emerald' | 'cyan' | 'purple' | 'amber';
  avatarSeed: number;
}

export interface AppSettings {
  musicEnabled: boolean;
  musicVibe: MusicVibe;
  musicVolume: number; // 0 to 1
  voiceCoachEnabled: boolean;
  voiceCoachVolume: number; // 0 to 1
  soundEffectsEnabled: boolean;
  tvModeEnabled: boolean;
  externalMusicUrl?: string;
  hasAcceptedDisclaimer: boolean;
}

export type MannequinPoseType =
  | 'pushup'
  | 'pushup_knees'
  | 'pushup_wall'
  | 'pushup_incline'
  | 'pushup_diamond'
  | 'squat'
  | 'squat_deep'
  | 'squat_chair'
  | 'squat_jump'
  | 'wall_sit'
  | 'lunge'
  | 'lunge_reverse'
  | 'crunch'
  | 'crunch_bicycle'
  | 'plank'
  | 'plank_knees'
  | 'side_plank'
  | 'glute_bridge'
  | 'glute_bridge_single'
  | 'dips_chair'
  | 'dips_floor'
  | 'jumping_jacks'
  | 'step_jacks'
  | 'mountain_climbers'
  | 'burpees_slow'
  | 'superman'
  | 'bird_dog'
  | 'cat_cow'
  | 'arm_circles'
  | 'high_knees'
  | 'butt_kicks'
  | 'calf_raises'
  | 'shadow_boxing'
  | 'pike_pushup'
  | 'bear_crawl'
  | 'inchworm'
  | 'hip_hinge'
  | 'child_pose'
  | 'cobra_stretch'
  | 'forward_fold'
  | 'shoulder_taps'
  | 'russian_twists'
  | 'deadbug'
  | 'seated_bicep_isometric'
  | 'towel_row'
  | 'doorframe_row'
  | 'wrist_rotations'
  | 'torso_twist'
  | 'quad_stretch';

export interface ExerciseDefinition {
  id: string;
  name: string;
  zone: WorkoutZone;
  zoneLabel: string;
  muscles: string[];
  keyTips: [string, string, string];
  commonMistake: string;
  easyVariant: string;
  hardVariant: string;
  poseType: MannequinPoseType;
  requiresChair?: boolean;
  requiresWall?: boolean;
  isLowImpact: boolean; // safe for knees / high BMI
  affectsLimitation?: PhysicalLimitation[];
}

export interface WorkoutStep {
  type: 'warmup' | 'exercise' | 'rest' | 'cooldown';
  exercise?: ExerciseDefinition;
  exerciseForProfile2?: ExerciseDefinition; // For Duo mode tailored exercise
  name: string;
  durationSeconds: number;
  tips?: string[];
  roundNumber?: number;
  totalRounds?: number;
  stepIndex: number;
  totalSteps: number;
}

export interface DayWorkoutConfig {
  dayIndex: number; // 0 to 6
  dayLabel: string; // "J1", "J2", etc.
  zone: WorkoutZone;
  zoneTitle: string;
  description: string;
  baseExercises: ExerciseDefinition[];
}
