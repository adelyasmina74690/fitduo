import { AppSettings, UserProfile, WeightEntry, WorkoutHistoryItem } from '../types';
import { calculateBMI } from '../data/program';

const STORAGE_KEY_P1 = 'fitduo_profile_1_clean_v2';
const STORAGE_KEY_P2 = 'fitduo_profile_2_clean_v2';
const STORAGE_KEY_SETTINGS = 'fitduo_settings_clean_v2';

export const DEFAULT_PROFILE_1: UserProfile = {
  id: 'profile_1',
  name: '',
  isConfigured: false,
  gender: 'homme',
  age: 30,
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
  pendingLevelUp: false,
  colorTheme: 'emerald',
  avatarSeed: 1,
};

export const DEFAULT_PROFILE_2: UserProfile = {
  id: 'profile_2',
  name: '',
  isConfigured: false,
  gender: 'femme',
  age: 30,
  heightCm: 165,
  weightKg: 60,
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
  pendingLevelUp: false,
  colorTheme: 'cyan',
  avatarSeed: 2,
};

export const DEFAULT_SETTINGS: AppSettings = {
  musicEnabled: true,
  musicVibe: 'energie',
  musicVolume: 0.5,
  voiceCoachEnabled: true,
  voiceCoachVolume: 0.9,
  soundEffectsEnabled: true,
  tvModeEnabled: false,
  externalMusicUrl: '',
  hasAcceptedDisclaimer: false,
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export function loadProfile(id: 'profile_1' | 'profile_2'): UserProfile {
  const key = id === 'profile_1' ? STORAGE_KEY_P1 : STORAGE_KEY_P2;
  const defaultProf = id === 'profile_1' ? DEFAULT_PROFILE_1 : DEFAULT_PROFILE_2;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      saveProfile(defaultProf);
      return defaultProf;
    }
    const parsed = JSON.parse(raw);
    return { ...defaultProf, ...parsed };
  } catch {
    return defaultProf;
  }
}

export function saveProfile(profile: UserProfile): void {
  const key = profile.id === 'profile_1' ? STORAGE_KEY_P1 : STORAGE_KEY_P2;
  try {
    localStorage.setItem(key, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile:', e);
  }
}

export function deleteProfile2(): void {
  saveProfile(DEFAULT_PROFILE_2);
}

export function resetAllData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_P1);
    localStorage.removeItem(STORAGE_KEY_P2);
    localStorage.removeItem(STORAGE_KEY_SETTINGS);
    // Also clear any legacy keys
    localStorage.removeItem('fitduo_profile_1_v1');
    localStorage.removeItem('fitduo_profile_2_v1');
    localStorage.removeItem('fitduo_settings_v1');
  } catch (e) {
    console.error('Failed to reset data:', e);
  }
}

export function addWeightEntry(profile: UserProfile, weightKg: number): UserProfile {
  const todayStr = new Date().toISOString().split('T')[0];
  const bmi = calculateBMI(weightKg, profile.heightCm);
  const newEntry: WeightEntry = {
    id: 'w_' + Date.now(),
    date: todayStr,
    weightKg,
    bmi,
  };

  const existingIdx = profile.weightHistory.findIndex((w) => w.date === todayStr);
  let updatedList = [...profile.weightHistory];
  if (existingIdx >= 0) {
    updatedList[existingIdx] = newEntry;
  } else {
    updatedList.push(newEntry);
  }
  updatedList.sort((a, b) => a.date.localeCompare(b.date));

  const updatedProfile: UserProfile = {
    ...profile,
    weightKg,
    weightHistory: updatedList,
  };
  saveProfile(updatedProfile);
  return updatedProfile;
}

export function checkWeekCompletion(profile: UserProfile): UserProfile {
  const isWeekDone =
    profile.currentWeekDaysDone.length === 7 &&
    profile.currentWeekDaysDone.every(Boolean);

  if (isWeekDone) {
    return {
      ...profile,
      pendingLevelUp: true,
    };
  }
  return {
    ...profile,
    pendingLevelUp: false,
  };
}

export function recordCompletedWorkout(
  profile: UserProfile,
  historyItem: WorkoutHistoryItem
): UserProfile {
  const todayStr = new Date().toISOString().split('T')[0];
  const minutes = Math.round(historyItem.durationSeconds / 60);

  let newStreak = profile.streakDays;
  if (!profile.lastWorkoutDate) {
    newStreak = 1;
  } else {
    const lastDate = new Date(profile.lastWorkoutDate);
    const today = new Date(todayStr);
    const diffDays = Math.round((today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
    if (diffDays === 1) {
      newStreak += 1;
    } else if (diffDays === 0) {
      // same day
    } else {
      newStreak = 1;
    }
  }

  const updatedDays = [...profile.currentWeekDaysDone];
  if (historyItem.dayIndex >= 0 && historyItem.dayIndex < 7) {
    updatedDays[historyItem.dayIndex] = true;
  }

  const updatedProfile: UserProfile = {
    ...profile,
    currentWeekDaysDone: updatedDays,
    streakDays: newStreak,
    lastWorkoutDate: todayStr,
    totalMinutes: profile.totalMinutes + minutes,
    workoutHistory: [historyItem, ...profile.workoutHistory],
  };

  const checkedProfile = checkWeekCompletion(updatedProfile);
  saveProfile(checkedProfile);
  return checkedProfile;
}

export function advanceOrRetryLevel(
  profile: UserProfile,
  advance: boolean
): UserProfile {
  const nextLevel = advance
    ? Math.min(10, profile.currentLevel + 1)
    : profile.currentLevel;

  const updated: UserProfile = {
    ...profile,
    currentLevel: nextLevel,
    currentWeekDaysDone: [false, false, false, false, false, false, false],
    pendingLevelUp: false,
  };
  saveProfile(updated);
  return updated;
}

// Test tool: Simulates the completion of all 7 days of the week
export function simulateWeekCompleted(profile: UserProfile): UserProfile {
  const updated: UserProfile = {
    ...profile,
    currentWeekDaysDone: [true, true, true, true, true, true, true],
    streakDays: Math.max(7, profile.streakDays + 1),
    totalMinutes: profile.totalMinutes + 45,
    pendingLevelUp: true,
  };
  saveProfile(updated);
  return updated;
}

export function exportAllData(): string {
  const p1 = loadProfile('profile_1');
  const p2 = loadProfile('profile_2');
  const settings = loadSettings();
  const backup = {
    app: 'FitDuo',
    version: 2,
    exportedAt: new Date().toISOString(),
    profile_1: p1,
    profile_2: p2,
    settings,
  };
  return JSON.stringify(backup, null, 2);
}

export function importAllData(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (!data || data.app !== 'FitDuo') {
      return false;
    }
    if (data.profile_1) saveProfile(data.profile_1);
    if (data.profile_2) saveProfile(data.profile_2);
    if (data.settings) saveSettings(data.settings);
    return true;
  } catch (e) {
    console.error('Import failed:', e);
    return false;
  }
}
