import {
  DayWorkoutConfig,
  ExerciseDefinition,
  PhysicalLimitation,
  UserProfile,
  WorkoutStep,
  WorkoutZone,
} from '../types';
import { EXERCISES } from './exercises';

export interface LevelConfig {
  level: number;
  name: string;
  effortSeconds: number;
  restSeconds: number;
  circuitRounds: number;
  exercisesPerCircuit: number;
  description: string;
}

// 10 levels progression crescendo
// Level 1: 20s effort, 30s rest, 1 round, 4 ex (Warmup 60s + 4*(20+30)s=200s + Cooldown 60s = 320s = 5m20s)
// Level 5: 30s effort, 20s rest, 2 rounds, 4 ex (Warmup 60s + 2*4*(30+20)s=400s + Cooldown 60s = 520s = 8m40s)
// Level 10: 40s effort, 12s rest, 2 rounds, 5 ex (Warmup 60s + 2*5*(40+12)s=520s + Cooldown 60s = 640s = ~9m45s < 10 min max!)
export const LEVEL_CONFIGS: Record<number, LevelConfig> = {
  1: {
    level: 1,
    name: 'Éveil & Fondations',
    effortSeconds: 25,
    restSeconds: 25,
    circuitRounds: 1,
    exercisesPerCircuit: 5,
    description: 'Prise de contact douce, apprentissage des mouvements de base (5 min 45 s).',
  },
  2: {
    level: 2,
    name: 'Initiation Tonus',
    effortSeconds: 30,
    restSeconds: 25,
    circuitRounds: 1,
    exercisesPerCircuit: 5,
    description: 'Renforcement progressif, consolidation de la posture (6 min 10 s).',
  },
  3: {
    level: 3,
    name: 'Stabilité & Contrôle',
    effortSeconds: 35,
    restSeconds: 20,
    circuitRounds: 1,
    exercisesPerCircuit: 5,
    description: 'Endurance de base, travail de gainage et d’équilibre (6 min 15 s).',
  },
  4: {
    level: 4,
    name: 'Rythme & Résistance',
    effortSeconds: 25,
    restSeconds: 20,
    circuitRounds: 2,
    exercisesPerCircuit: 4,
    description: 'Passage à 2 tours courts pour stimuler le métabolisme (7 min 40 s).',
  },
  5: {
    level: 5,
    name: 'Puissance Harmonieuse',
    effortSeconds: 30,
    restSeconds: 18,
    circuitRounds: 2,
    exercisesPerCircuit: 4,
    description: 'Tonification globale équilibrée sur 2 tours (8 min 06 s).',
  },
  6: {
    level: 6,
    name: 'Force & Densité',
    effortSeconds: 32,
    restSeconds: 16,
    circuitRounds: 2,
    exercisesPerCircuit: 4,
    description: 'Augmentation du temps sous tension, développement musculaire (8 min 08 s).',
  },
  7: {
    level: 7,
    name: 'Dynamique Athletic',
    effortSeconds: 35,
    restSeconds: 15,
    circuitRounds: 2,
    exercisesPerCircuit: 4,
    description: 'Intervalles resserrés, souffle et puissance combinés (8 min 25 s).',
  },
  8: {
    level: 8,
    name: 'Endurance Forte',
    effortSeconds: 30,
    restSeconds: 12,
    circuitRounds: 2,
    exercisesPerCircuit: 5,
    description: 'Dépassement de soi, haute intensité sous contrôle total (8 min 48 s).',
  },
  9: {
    level: 9,
    name: 'Sculpt & Définition',
    effortSeconds: 34,
    restSeconds: 10,
    circuitRounds: 2,
    exercisesPerCircuit: 5,
    description: 'Volume optimisé, travail musculaire profond et continu (9 min 10 s).',
  },
  10: {
    level: 10,
    name: 'Maîtrise Suprême FitDuo',
    effortSeconds: 38,
    restSeconds: 10,
    circuitRounds: 2,
    exercisesPerCircuit: 5,
    description: 'Le sommet du programme au poids de corps : explosivité et maîtrise absolue (9 min 50 s).',
  },
};

// 7 days weekly rotation
export const DAYS_SCHEDULE: { dayIndex: number; dayLabel: string; zone: WorkoutZone; title: string; subtitle: string }[] = [
  {
    dayIndex: 0,
    dayLabel: 'J1',
    zone: 'pectoraux_triceps',
    title: 'Pectoraux & Triceps',
    subtitle: 'Poussée du haut du corps & ouverture',
  },
  {
    dayIndex: 1,
    dayLabel: 'J2',
    zone: 'jambes_fessiers',
    title: 'Jambes & Fessiers',
    subtitle: 'Ancrage, cuisses fermes & galbe fessier',
  },
  {
    dayIndex: 2,
    dayLabel: 'J3',
    zone: 'abdos_gainage',
    title: 'Abdos & Gainage',
    subtitle: 'Ceinture gainée, ventre plat & lombaires solides',
  },
  {
    dayIndex: 3,
    dayLabel: 'J4',
    zone: 'dos_epaules',
    title: 'Dos & Épaules',
    subtitle: 'Posture altière, tirage & carrure',
  },
  {
    dayIndex: 4,
    dayLabel: 'J5',
    zone: 'bras',
    title: 'Bras Ciblés',
    subtitle: 'Biceps, triceps & avant-bras sculptés',
  },
  {
    dayIndex: 5,
    dayLabel: 'J6',
    zone: 'cardio',
    title: 'Full Body Cardio',
    subtitle: 'Brûle-graisses dynamique, souffle & cœur',
  },
  {
    dayIndex: 6,
    dayLabel: 'J7',
    zone: 'mobilite',
    title: 'Mobilité & Étirements',
    subtitle: 'Décompression vertébrale & souplesse régénératrice',
  },
];

// Calculate BMI helper
export function calculateBMI(weightKg: number, heightCm: number): number {
  if (!weightKg || !heightCm || heightCm <= 0) return 22;
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
}

export function getBMICategory(bmi: number): { label: string; color: string; isHigh: boolean } {
  if (bmi < 18.5) return { label: 'Poids insuffisant', color: 'text-amber-400', isHigh: false };
  if (bmi < 25) return { label: 'Corpulence normale', color: 'text-emerald-400', isHigh: false };
  if (bmi < 30) return { label: 'Surpoids modéré', color: 'text-yellow-400', isHigh: false };
  return { label: 'Adaptation basse intensité recommandée', color: 'text-orange-400', isHigh: true };
}

// Low impact rule:
// If BMI >= 30 OR any joint limitation is checked OR sedentary with high BMI / endomorph
// -> strictly pick low impact / safe variations with wall/chair/knee adaptations
export function shouldEnforceLowImpact(profile: UserProfile): boolean {
  const bmi = calculateBMI(profile.weightKg, profile.heightCm);
  const hasJointLimitation = profile.limitations.length > 0;
  const isSedentaryRisk =
    profile.activityLevel === 'sedentaire' && (bmi >= 26 || profile.morphology === 'endomorphe');
  return bmi >= 30 || hasJointLimitation || isSedentaryRisk;
}

// Find adapted exercise for a profile
export function getAdaptedExercise(
  baseExercise: ExerciseDefinition,
  profile: UserProfile
): ExerciseDefinition {
  const needsLowImpact = shouldEnforceLowImpact(profile);

  // Check if exercise causes issues with user limitations
  const hasConflict = baseExercise.affectsLimitation?.some((lim) =>
    profile.limitations.includes(lim)
  );

  if (!needsLowImpact && !hasConflict) {
    return baseExercise;
  }

  // Find a safer exercise in same zone
  const safeAlternatives = EXERCISES.filter(
    (ex) =>
      ex.zone === baseExercise.zone &&
      ex.isLowImpact &&
      (!ex.affectsLimitation ||
        !ex.affectsLimitation.some((lim) => profile.limitations.includes(lim)))
  );

  if (safeAlternatives.length > 0) {
    // pick one that matches closely or first safe
    return safeAlternatives[0];
  }

  return baseExercise;
}

// Generate the complete sequential workout steps for a session
export function generateWorkoutSteps(
  profile1: UserProfile,
  dayIndex: number,
  levelOverride?: number,
  profile2?: UserProfile | null
): { steps: WorkoutStep[]; totalSeconds: number; formattedDuration: string } {
  const levelNum = Math.min(10, Math.max(1, levelOverride ?? profile1.currentLevel));
  const levelCfg = LEVEL_CONFIGS[levelNum] || LEVEL_CONFIGS[1];
  const daySchedule = DAYS_SCHEDULE[dayIndex % 7];

  // Filter exercises for this zone
  const zoneExercises = EXERCISES.filter((ex) => ex.zone === daySchedule.zone);

  // Order by difficulty according to level
  // Level 1-3 prefer simpler exercises (wall, knees, chair)
  // Level 7-10 prefer harder variants
  const sortedByLevel = [...zoneExercises].sort((a, b) => {
    if (levelNum <= 3) {
      if (a.isLowImpact && !b.isLowImpact) return -1;
      if (a.requiresWall && !b.requiresWall) return -1;
      return 0;
    } else if (levelNum >= 7) {
      if (!a.isLowImpact && b.isLowImpact) return -1;
      return 0;
    }
    return 0;
  });

  // Pick N exercises for circuit
  const pickedExercises = sortedByLevel.slice(0, levelCfg.exercisesPerCircuit);

  const steps: WorkoutStep[] = [];

  // 1. Échauffement (Warmup) - exactly 60 seconds (2 x 30s)
  steps.push({
    type: 'warmup',
    name: 'Échauffement articulaire dynamique',
    durationSeconds: 30,
    tips: [
      'Respirez profondément par le nez et soufflez par la bouche.',
      'Faites de doux cercles avec les épaules et les bras.',
      'Activez en douceur la circulation sanguine.',
    ],
    stepIndex: 0,
    totalSteps: 0,
  });

  steps.push({
    type: 'warmup',
    name: 'Activation cardio-pulmonaire douce',
    durationSeconds: 30,
    tips: [
      'Marchez sur place en levant légèrement les genoux.',
      'Engagez doucement la sangle abdominale.',
      'Préparez votre mental pour la séance.',
    ],
    stepIndex: 0,
    totalSteps: 0,
  });

  // 2. Circuit (Rounds)
  for (let r = 1; r <= levelCfg.circuitRounds; r++) {
    pickedExercises.forEach((baseEx, idx) => {
      // Tailor for profile 1
      const ex1 = getAdaptedExercise(baseEx, profile1);
      // Tailor for profile 2 if Duo mode
      const ex2 = profile2 ? getAdaptedExercise(baseEx, profile2) : undefined;

      // Exercise step
      steps.push({
        type: 'exercise',
        name: ex1.name,
        exercise: ex1,
        exerciseForProfile2: ex2,
        durationSeconds: levelCfg.effortSeconds,
        roundNumber: r,
        totalRounds: levelCfg.circuitRounds,
        tips: ex1.keyTips,
        stepIndex: 0,
        totalSteps: 0,
      });

      // Rest step (except possibly after very last exercise of last round, but rest is good)
      const isLastStepOfCircuit =
        r === levelCfg.circuitRounds && idx === pickedExercises.length - 1;

      if (!isLastStepOfCircuit) {
        steps.push({
          type: 'rest',
          name: 'Récupération active',
          durationSeconds: levelCfg.restSeconds,
          tips: ['Buvez une gorgée d’eau', 'Marchez lentement', 'Préparez-vous pour le suivant'],
          roundNumber: r,
          totalRounds: levelCfg.circuitRounds,
          stepIndex: 0,
          totalSteps: 0,
        });
      }
    });
  }

  // 3. Retour au calme (Cooldown) - exactly 60 seconds (2 x 30s)
  steps.push({
    type: 'cooldown',
    name: 'Retour au calme & respiration ventrale',
    durationSeconds: 30,
    tips: [
      'Posez les mains sur les hanches ou relâchez les bras.',
      'Grande inspiration en gonflant le ventre pendant 4 secondes.',
      'Expiration longue et lente par la bouche pendant 6 secondes.',
    ],
    stepIndex: 0,
    totalSteps: 0,
  });

  steps.push({
    type: 'cooldown',
    name: 'Décompression vertébrale & relâchement',
    durationSeconds: 30,
    tips: [
      'Enroulez la tête et les épaules vers le bas en douceur.',
      'Laissez pendre les bras sans forcer.',
      'Félicitations pour votre séance du jour !',
    ],
    stepIndex: 0,
    totalSteps: 0,
  });

  // Stamp indices
  steps.forEach((s, idx) => {
    s.stepIndex = idx + 1;
    s.totalSteps = steps.length;
  });

  // Calculate total seconds
  const totalSeconds = steps.reduce((sum, s) => sum + s.durationSeconds, 0);

  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const formattedDuration = `${mins} min ${secs > 0 ? `${secs} s` : ''}`.trim();

  return {
    steps,
    totalSeconds,
    formattedDuration,
  };
}

/**
 * Validates all 70 workouts (10 levels × 7 days) to ensure strict adherence
 * to the rule: 300s (5:00) <= duration <= 600s (10:00).
 */
export function validateProgram(): { valid: boolean; errors: string[] } {
  const dummyProfile: UserProfile = {
    id: 'profile_1',
    name: 'TestValidator',
    isConfigured: true,
    gender: 'homme',
    age: 25,
    heightCm: 175,
    weightKg: 70,
    morphology: 'mesomorphe',
    activityLevel: 'modere',
    goal: 'tonifier',
    limitations: [],
    currentLevel: 1,
    currentWeekDaysDone: [false, false, false, false, false, false, false],
    streakDays: 0,
    lastWorkoutDate: null,
    totalMinutes: 0,
    weightHistory: [],
    workoutHistory: [],
    colorTheme: 'emerald',
    avatarSeed: 1,
  };

  const errors: string[] = [];
  let checkedCount = 0;
  let minSec = Infinity;
  let maxSec = -Infinity;

  for (let lvl = 1; lvl <= 10; lvl++) {
    for (let day = 0; day < 7; day++) {
      const { totalSeconds } = generateWorkoutSteps(dummyProfile, day, lvl);
      checkedCount++;
      if (totalSeconds < minSec) minSec = totalSeconds;
      if (totalSeconds > maxSec) maxSec = totalSeconds;

      if (totalSeconds < 300) {
        errors.push(`ERREUR: Niveau ${lvl} Jour J${day + 1} trop court : ${totalSeconds}s (< 300s / 5:00)`);
      } else if (totalSeconds > 600) {
        errors.push(`ERREUR: Niveau ${lvl} Jour J${day + 1} trop long : ${totalSeconds}s (> 600s / 10:00)`);
      }
    }
  }

  const valid = errors.length === 0;
  if (valid) {
    const minMins = Math.floor(minSec / 60);
    const minRem = minSec % 60;
    const maxMins = Math.floor(maxSec / 60);
    const maxRem = maxSec % 60;
    console.log(
      `[FitDuo] Validation des ${checkedCount} séances réussie : toutes entre 5:00 et 10:00 (min: ${minMins}:${minRem < 10 ? '0' : ''}${minRem}, max: ${maxMins}:${maxRem < 10 ? '0' : ''}${maxRem})`
    );
  } else {
    console.error('[FitDuo] Erreurs de validation du programme :', errors);
  }

  return { valid, errors };
}

// Auto-run validation at module load
validateProgram();

