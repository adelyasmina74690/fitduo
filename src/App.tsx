import React, { useEffect, useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { ExerciseLibraryModal } from './components/ExerciseLibraryModal';
import { HealthDisclaimerModal } from './components/HealthDisclaimerModal';
import { Onboarding } from './components/Onboarding';
import { ProfileSelect } from './components/ProfileSelect';
import { SettingsModal } from './components/SettingsModal';
import { WorkoutPlayer } from './components/WorkoutPlayer';
import { WorkoutSummary } from './components/WorkoutSummary';
import { DAYS_SCHEDULE, generateWorkoutSteps } from './data/program';
import {
  advanceOrRetryLevel,
  loadProfile,
  loadSettings,
  recordCompletedWorkout,
  saveProfile,
  saveSettings,
  simulateWeekCompleted,
} from './lib/storage';
import {
  AppSettings,
  UserProfile,
  WorkoutFeeling,
  WorkoutHistoryItem,
  WorkoutStep,
} from './types';

type AppView = 'profile_select' | 'dashboard' | 'onboarding' | 'workout' | 'workout_summary';

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [profile1, setProfile1] = useState<UserProfile>(() => loadProfile('profile_1'));
  const [profile2, setProfile2] = useState<UserProfile>(() => loadProfile('profile_2'));

  const [activeProfileId, setActiveProfileId] = useState<'profile_1' | 'profile_2'>('profile_1');
  const [currentView, setCurrentView] = useState<AppView>(() =>
    !profile1.isConfigured ? 'onboarding' : 'profile_select'
  );

  // Modals
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(() => !settings.hasAcceptedDisclaimer);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  // Workout state
  const [isDuoSession, setIsDuoSession] = useState(false);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [activeSteps, setActiveSteps] = useState<WorkoutStep[]>([]);
  const [workoutDurationSeconds, setWorkoutDurationSeconds] = useState(0);
  const [onboardingTargetId, setOnboardingTargetId] = useState<'profile_1' | 'profile_2'>('profile_1');

  // Save settings when changed
  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleAcceptDisclaimer = () => {
    const updated = { ...settings, hasAcceptedDisclaimer: true };
    handleUpdateSettings(updated);
    setIsDisclaimerOpen(false);
    if (!profile1.isConfigured) {
      setOnboardingTargetId('profile_1');
      setCurrentView('onboarding');
    }
  };

  const activeProfile = activeProfileId === 'profile_1' ? profile1 : profile2;
  const partnerProfile = activeProfileId === 'profile_1' ? profile2 : profile1;

  // Reload all profiles & settings (after JSON import)
  const handleReloadAll = () => {
    setProfile1(loadProfile('profile_1'));
    setProfile2(loadProfile('profile_2'));
    setSettings(loadSettings());
    setIsSettingsOpen(false);
  };

  // Start Solo Workout
  const handleStartWorkout = (dayIndex: number) => {
    setIsDuoSession(false);
    setActiveDayIndex(dayIndex);
    const { steps } = generateWorkoutSteps(activeProfile, dayIndex, activeProfile.currentLevel);
    setActiveSteps(steps);
    setCurrentView('workout');
  };

  // Start Duo Workout
  const handleStartDuoWorkout = (dayIndex?: number) => {
    setIsDuoSession(true);
    const dIdx =
      dayIndex !== undefined
        ? dayIndex
        : (() => {
            const undone1 = profile1.currentWeekDaysDone.findIndex((done) => !done);
            return undone1 >= 0 ? undone1 : 0;
          })();

    setActiveDayIndex(dIdx);
    // Combined level: highest or profile1 level
    const maxLevel = Math.max(profile1.currentLevel, profile2.currentLevel);
    const { steps } = generateWorkoutSteps(profile1, dIdx, maxLevel, profile2);
    setActiveSteps(steps);
    setCurrentView('workout');
  };

  // Workout finished
  const handleFinishWorkout = (durationSecs: number) => {
    setWorkoutDurationSeconds(durationSecs);
    setCurrentView('workout_summary');
  };

  // Save feeling and record workout
  const handleSaveFeedback = (feeling1: WorkoutFeeling, feeling2?: WorkoutFeeling) => {
    const dayConfig = DAYS_SCHEDULE[activeDayIndex % 7];

    const historyItem1: WorkoutHistoryItem = {
      id: 'h_' + Date.now() + '_1',
      date: new Date().toISOString(),
      level: activeProfile.currentLevel,
      dayIndex: activeDayIndex,
      zone: dayConfig.zone,
      zoneLabel: dayConfig.title,
      durationSeconds: workoutDurationSeconds,
      feeling: feeling1,
      exercisesCount: activeSteps.filter((s) => s.type === 'exercise').length,
      wasDuo: isDuoSession,
    };

    if (isDuoSession) {
      // Record for profile 1
      const updatedP1 = recordCompletedWorkout(profile1, historyItem1);
      setProfile1(updatedP1);

      // Record for profile 2
      const historyItem2: WorkoutHistoryItem = {
        ...historyItem1,
        id: 'h_' + Date.now() + '_2',
        level: profile2.currentLevel,
        feeling: feeling2 || feeling1,
      };
      const updatedP2 = recordCompletedWorkout(profile2, historyItem2);
      setProfile2(updatedP2);
    } else {
      // Solo
      const updated = recordCompletedWorkout(activeProfile, historyItem1);
      if (activeProfileId === 'profile_1') {
        setProfile1(updated);
      } else {
        setProfile2(updated);
      }
    }
  };

  // Check if week is completed (7/7 days)
  const isWeekCompletedNow = isDuoSession
    ? profile1.currentWeekDaysDone.filter(Boolean).length >= 6 // After recording this one it will be 7
    : activeProfile.currentWeekDaysDone.filter(Boolean).length >= 6;

  // Level Up
  const handleAdvanceLevel = () => {
    if (isDuoSession) {
      const up1 = advanceOrRetryLevel(profile1, true);
      const up2 = advanceOrRetryLevel(profile2, true);
      setProfile1(up1);
      setProfile2(up2);
    } else {
      const up = advanceOrRetryLevel(activeProfile, true);
      if (activeProfileId === 'profile_1') setProfile1(up);
      else setProfile2(up);
    }
    setCurrentView('dashboard');
  };

  // Retry Level
  const handleRetryLevel = () => {
    if (isDuoSession) {
      const up1 = advanceOrRetryLevel(profile1, false);
      const up2 = advanceOrRetryLevel(profile2, false);
      setProfile1(up1);
      setProfile2(up2);
    } else {
      const up = advanceOrRetryLevel(activeProfile, false);
      if (activeProfileId === 'profile_1') setProfile1(up);
      else setProfile2(up);
    }
    setCurrentView('dashboard');
  };

  // Edit profile handler
  const handleOpenEditProfile = (id: 'profile_1' | 'profile_2') => {
    setOnboardingTargetId(id);
    setCurrentView('onboarding');
  };

  const handleSaveOnboarding = (updated: UserProfile, thenAddSecond?: boolean) => {
    saveProfile(updated);
    if (updated.id === 'profile_1') {
      setProfile1(updated);
      if (thenAddSecond) {
        setOnboardingTargetId('profile_2');
        setCurrentView('onboarding');
        return;
      }
    } else {
      setProfile2(updated);
    }
    setActiveProfileId(updated.id);
    setCurrentView('dashboard');
  };

  const handleSimulateWeek = () => {
    const up = simulateWeekCompleted(activeProfile);
    if (activeProfile.id === 'profile_1') {
      setProfile1(up);
    } else {
      setProfile2(up);
    }
  };

  const handleRestartAllLevels = () => {
    const restartProfile = (p: UserProfile): UserProfile => {
      const up = {
        ...p,
        currentLevel: 1,
        currentWeekDaysDone: [false, false, false, false, false, false, false],
      };
      saveProfile(up);
      return up;
    };
    if (isDuoSession) {
      setProfile1(restartProfile(profile1));
      setProfile2(restartProfile(profile2));
    } else {
      if (activeProfileId === 'profile_1') setProfile1(restartProfile(profile1));
      else setProfile2(restartProfile(profile2));
    }
    setCurrentView('dashboard');
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-emerald-500 selection:text-black">
      {/* 1. HEALTH DISCLAIMER MODAL */}
      {isDisclaimerOpen && <HealthDisclaimerModal onAccept={handleAcceptDisclaimer} />}

      {/* 2. EXERCISE LIBRARY MODAL */}
      {isLibraryOpen && <ExerciseLibraryModal onClose={() => setIsLibraryOpen(false)} />}

      {/* 3. SETTINGS MODAL */}
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          activeProfile={activeProfile}
          profile2={profile2}
          onUpdateSettings={handleUpdateSettings}
          onEditProfile={() => handleOpenEditProfile(activeProfileId)}
          onShowDisclaimer={() => setIsDisclaimerOpen(true)}
          onClose={() => setIsSettingsOpen(false)}
          onReloadAll={handleReloadAll}
          onSimulateWeek={handleSimulateWeek}
        />
      )}

      {/* 4. VIEW ROUTER */}
      {currentView === 'profile_select' && (
        <ProfileSelect
          profile1={profile1}
          profile2={profile2}
          onSelectProfile={(id) => {
            setActiveProfileId(id);
            setCurrentView('dashboard');
          }}
          onStartDuo={() => handleStartDuoWorkout()}
          onEditProfile={(id) => handleOpenEditProfile(id)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenLibrary={() => setIsLibraryOpen(true)}
        />
      )}

      {currentView === 'dashboard' && (
        <Dashboard
          profile={activeProfile}
          partnerProfile={partnerProfile}
          onStartWorkout={handleStartWorkout}
          onStartDuoWorkout={(dayIdx) => handleStartDuoWorkout(dayIdx)}
          onSwitchProfile={() => setCurrentView('profile_select')}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenLibrary={() => setIsLibraryOpen(true)}
          onUpdateProfile={(up) => {
            if (up.id === 'profile_1') setProfile1(up);
            else setProfile2(up);
          }}
        />
      )}

      {currentView === 'onboarding' && (
        <Onboarding
          initialProfile={onboardingTargetId === 'profile_1' ? profile1 : profile2}
          targetProfileId={onboardingTargetId}
          isFirstProfile={onboardingTargetId === 'profile_1' && !profile2.isConfigured}
          onSave={handleSaveOnboarding}
          onCancel={() => setCurrentView(profile1.isConfigured ? 'dashboard' : 'profile_select')}
        />
      )}

      {currentView === 'workout' && (
        <WorkoutPlayer
          profile1={activeProfile}
          profile2={isDuoSession ? partnerProfile : null}
          isDuoMode={isDuoSession}
          steps={activeSteps}
          dayIndex={activeDayIndex}
          level={activeProfile.currentLevel}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onFinish={handleFinishWorkout}
          onQuit={() => setCurrentView('dashboard')}
        />
      )}

      {currentView === 'workout_summary' && (
        <WorkoutSummary
          profile1={activeProfile}
          profile2={isDuoSession ? partnerProfile : null}
          isDuoMode={isDuoSession}
          durationSeconds={workoutDurationSeconds}
          level={activeProfile.currentLevel}
          dayIndex={activeDayIndex}
          zoneTitle={DAYS_SCHEDULE[activeDayIndex % 7]?.title || 'Entraînement'}
          onSaveFeedback={handleSaveFeedback}
          isWeekCompletedNow={isWeekCompletedNow}
          onAdvanceLevel={handleAdvanceLevel}
          onRetryLevel={handleRetryLevel}
          onRestartAllLevels={handleRestartAllLevels}
          onBackToDashboard={() => setCurrentView('dashboard')}
        />
      )}
    </main>
  );
}
