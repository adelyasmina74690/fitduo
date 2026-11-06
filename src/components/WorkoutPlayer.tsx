import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Flame,
  Info,
  Music,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Users,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { LEVEL_CONFIGS } from '../data/program';
import { useSpatialNavigation } from '../hooks/useSpatialNavigation';
import { soundEngine } from '../lib/audio';
import { speechCoach } from '../lib/speech';
import {
  AppSettings,
  ExerciseDefinition,
  MannequinPoseType,
  MusicVibe,
  UserProfile,
  WorkoutStep,
} from '../types';
import { Mannequin } from './Mannequin';

interface WorkoutPlayerProps {
  profile1: UserProfile;
  profile2?: UserProfile | null;
  isDuoMode?: boolean;
  steps: WorkoutStep[];
  dayIndex: number;
  level: number;
  settings: AppSettings;
  onUpdateSettings: (s: AppSettings) => void;
  onFinish: (durationSeconds: number) => void;
  onQuit: () => void;
}

export const WorkoutPlayer: React.FC<WorkoutPlayerProps> = ({
  profile1,
  profile2,
  isDuoMode = false,
  steps,
  dayIndex,
  level,
  settings,
  onUpdateSettings,
  onFinish,
  onQuit,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(steps[0]?.durationSeconds || 30);
  const [isPaused, setIsPaused] = useState(false);
  const [isConfirmQuitOpen, setIsConfirmQuitOpen] = useState(false);
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [elapsedTotalSeconds, setElapsedTotalSeconds] = useState(0);

  const [isLandscape, setIsLandscape] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth > window.innerHeight;
    }
    return false;
  });

  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  const wakeLockRef = useRef<any>(null);
  const timerIntervalRef = useRef<number | null>(null);

  const currentStep = steps[currentStepIndex];
  const nextStep = steps[currentStepIndex + 1] || null;

  // Spatial navigation hook
  const { isRemoteActive } = useSpatialNavigation({
    autoFocusSelector: isConfirmQuitOpen ? '#continue-workout-btn' : '#player-play-pause-btn',
    onBack: () => {
      if (isConfirmQuitOpen) {
        setIsConfirmQuitOpen(false);
        setIsPaused(false);
      } else if (showMusicModal) {
        setShowMusicModal(false);
      } else {
        setIsPaused(true);
        setIsConfirmQuitOpen(true);
      }
    },
  });

  // 1. Wake Lock API with re-acquisition on visibilitychange
  useEffect(() => {
    async function requestWakeLock() {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        }
      } catch (err) {
        console.warn('Wake Lock request error:', err);
      }
    }
    requestWakeLock();

    // Auto-pause if app goes into background, and re-acquire wake lock on resume
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPaused(true);
      } else {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
  }, []);

  // 2. Start procedural background music if enabled
  useEffect(() => {
    if (settings.musicEnabled) {
      soundEngine.startMusic(settings.musicVibe, settings.musicVolume);
    } else {
      soundEngine.stopMusic();
    }

    return () => {
      soundEngine.stopMusic();
      speechCoach.cancel();
    };
  }, [settings.musicEnabled, settings.musicVibe]);

  // Synchronize coach volume and enabled
  useEffect(() => {
    speechCoach.setEnabled(settings.voiceCoachEnabled);
  }, [settings.voiceCoachEnabled]);

  // 3. Step announcement via French voice coach
  useEffect(() => {
    if (!currentStep) return;

    setTimeRemaining(currentStep.durationSeconds);

    if (settings.voiceCoachEnabled) {
      if (currentStep.type === 'warmup') {
        speechCoach.speak(`Échauffement : ${currentStep.name}.`);
      } else if (currentStep.type === 'exercise') {
        const roundText = currentStep.roundNumber ? `Tour ${currentStep.roundNumber}. ` : '';
        const duoNote = isDuoMode && profile2 && currentStep.exerciseForProfile2 ? 'Séance Duo ! ' : '';
        speechCoach.speak(`${roundText}${duoNote}${currentStep.name}. C'est parti !`, 'urgent');
      } else if (currentStep.type === 'rest') {
        const nextName = nextStep ? nextStep.name : 'le retour au calme';
        speechCoach.speak(`Repos. Prochain exercice : ${nextName}. Regardez la démonstration.`);
      } else if (currentStep.type === 'cooldown') {
        speechCoach.speak(`Retour au calme : ${currentStep.name}. Relâchez.`);
      }
    }
  }, [currentStepIndex]);

  // 4. Timer tick
  useEffect(() => {
    if (isPaused || isConfirmQuitOpen) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }

    timerIntervalRef.current = window.setInterval(() => {
      setTimeRemaining((prev) => {
        if (settings.soundEffectsEnabled) {
          if (prev === 4) soundEngine.playCountdownBeep(false); // 3
          else if (prev === 3) soundEngine.playCountdownBeep(false); // 2
          else if (prev === 2) soundEngine.playCountdownBeep(false); // 1
          else if (prev === 1) soundEngine.playCountdownBeep(true); // Ding!
        }

        if (prev <= 1) {
          if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex((idx) => idx + 1);
            return 0;
          } else {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            soundEngine.playFinishChime();
            onFinish(elapsedTotalSeconds + 1);
            return 0;
          }
        }
        return prev - 1;
      });

      setElapsedTotalSeconds((sec) => sec + 1);
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [isPaused, isConfirmQuitOpen, currentStepIndex, steps.length, settings.soundEffectsEnabled, elapsedTotalSeconds, onFinish]);

  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((i) => i + 1);
    } else {
      onFinish(elapsedTotalSeconds);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((i) => i - 1);
    }
  };

  // Calculations for circular chrono
  const totalStepDuration = currentStep?.durationSeconds || 1;
  const progressRatio = Math.max(0, Math.min(1, timeRemaining / totalStepDuration));
  const strokeDashoffset = 2 * Math.PI * 72 * (1 - progressRatio);

  const globalProgressPercent = Math.round(
    ((currentStepIndex + (1 - progressRatio)) / steps.length) * 100
  );

  // During rest, the mannequin animates the NEXT exercise!
  const isRestMode = currentStep.type === 'rest';
  const displayExercise = isRestMode && nextStep?.exercise ? nextStep.exercise : currentStep.exercise;
  const displayExerciseP2 = isRestMode && nextStep?.exerciseForProfile2 ? nextStep.exerciseForProfile2 : currentStep.exerciseForProfile2;

  const getPoseType = (step: WorkoutStep, ex?: ExerciseDefinition): MannequinPoseType => {
    if (ex?.poseType) return ex.poseType;
    if (step.type === 'warmup') {
      return step.name.toLowerCase().includes('articulaire') ? 'arm_circles' : 'high_knees';
    }
    if (step.type === 'cooldown') {
      return 'child_pose';
    }
    return 'squat';
  };

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-2 sm:p-4 select-none overflow-hidden relative">
      {/* Remote mode on-screen toast */}
      {isRemoteActive && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-40 bg-emerald-500/90 text-slate-950 font-black text-[11px] px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 animate-in fade-in duration-150">
          <span>🎮 Mode Télécommande Actif</span>
        </div>
      )}

      {/* 1. COMPACT TOP BAR: Progress, Step x/y & Sound Toggles */}
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-1.5 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsPaused(true);
                setIsConfirmQuitOpen(true);
              }}
              className="tv-focus-target p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              title="Quitter la séance (Échap)"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <span className="font-bold text-white">Niveau {level}</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold text-[11px]">
                {currentStepIndex + 1} / {steps.length}
              </span>
              {isDuoMode && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold uppercase">
                  <Users className="w-3 h-3" />
                  Duo
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                const nextVal = !settings.voiceCoachEnabled;
                onUpdateSettings({ ...settings, voiceCoachEnabled: nextVal });
              }}
              className={`tv-focus-target p-1.5 sm:px-3 sm:py-1.5 rounded-xl border text-xs flex items-center gap-1.5 transition ${
                settings.voiceCoachEnabled
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
              title="Coach Vocal Français"
            >
              <Volume2 className="w-4 h-4" />
              <span className="hidden sm:inline">Coach</span>
            </button>

            <button
              onClick={() => setShowMusicModal(true)}
              className={`tv-focus-target p-1.5 sm:px-3 sm:py-1.5 rounded-xl border text-xs flex items-center gap-1.5 transition ${
                settings.musicEnabled
                  ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
              title="Musique & Playlist"
            >
              <Music className="w-4 h-4" />
              <span className="hidden sm:inline capitalize">{settings.musicVibe}</span>
            </button>
          </div>
        </div>

        {/* Global Progress Line */}
        <div className="w-full bg-slate-900 rounded-full h-1.5 sm:h-2 overflow-hidden border border-slate-800/80">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 transition-all duration-300 rounded-full"
            style={{ width: `${globalProgressPercent}%` }}
          />
        </div>
      </div>

      {/* 2. MAIN CENTER: STRICT NO SCROLL (h-[100dvh] fitted layout) */}
      <div
        className={`w-full max-w-7xl mx-auto flex-1 min-h-0 flex ${
          isLandscape ? 'flex-row items-stretch gap-4 lg:gap-6' : 'flex-col gap-2'
        } justify-center my-auto overflow-hidden`}
      >
        {/* MANNEQUIN CONTAINER: 60% width in Landscape, >= 40% height in Portrait */}
        <div
          className={`${
            isLandscape ? 'w-[60%] h-full' : 'w-full h-[44%] min-h-[40%]'
          } flex flex-col justify-center items-center min-h-0 shrink-0`}
        >
          <div className="w-full h-full bg-slate-900/60 border border-slate-800/80 rounded-3xl p-2.5 sm:p-4 backdrop-blur-md relative flex flex-col items-center justify-between shadow-2xl overflow-hidden">
            {/* Header pill of the exercise card */}
            <div className="w-full flex items-center justify-between shrink-0">
              <span
                className={`px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider ${
                  isRestMode
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    : currentStep.type === 'warmup'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : currentStep.type === 'cooldown'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {isRestMode
                  ? 'Repos • Démonstration Suivante'
                  : currentStep.type === 'warmup'
                  ? 'Échauffement'
                  : currentStep.type === 'cooldown'
                  ? 'Retour au Calme'
                  : currentStep.roundNumber
                  ? `Tour ${currentStep.roundNumber} / ${currentStep.totalRounds}`
                  : 'Exercice'}
              </span>

              <span className="text-[11px] sm:text-xs text-slate-400 font-semibold truncate max-w-[150px]">
                {displayExercise?.zoneLabel || 'Au poids de corps'}
              </span>
            </div>

            {/* ARTICULATED 2D MANNEQUIN (Takes at least 80% of container height) */}
            <div className="w-full flex-1 min-h-0 flex items-center justify-center relative my-0.5 overflow-hidden">
              {isDuoMode && profile2 && displayExerciseP2 ? (
                <div className="w-full h-full grid grid-cols-2 gap-2">
                  <div className="flex flex-col items-center justify-center bg-slate-950/40 rounded-2xl border border-slate-800/60 p-1 min-h-0 overflow-hidden">
                    <span className="text-[10px] font-bold text-emerald-400 mb-0.5 truncate max-w-full shrink-0">
                      {profile1.name} : {displayExercise?.name || currentStep.name}
                    </span>
                    <div className="w-full flex-1 min-h-0 flex items-center justify-center">
                      <Mannequin
                        poseType={getPoseType(currentStep, displayExercise)}
                        colorTheme="emerald"
                        isPaused={isPaused}
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center bg-slate-950/40 rounded-2xl border border-slate-800/60 p-1 min-h-0 overflow-hidden">
                    <span className="text-[10px] font-bold text-cyan-400 mb-0.5 truncate max-w-full shrink-0">
                      {profile2.name} : {displayExerciseP2.name}
                    </span>
                    <div className="w-full flex-1 min-h-0 flex items-center justify-center">
                      <Mannequin
                        poseType={getPoseType(currentStep, displayExerciseP2)}
                        colorTheme="cyan"
                        isPaused={isPaused}
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center min-h-0 overflow-hidden">
                  <Mannequin
                    poseType={getPoseType(currentStep, displayExercise)}
                    colorTheme={profile1.colorTheme || 'emerald'}
                    isPaused={isPaused}
                    className="w-full h-full"
                  />
                </div>
              )}
            </div>

            {/* Bottom key instruction only during active movements, never in rest mode */}
            {!isRestMode && (
              <div className="w-full pt-1 border-t border-slate-800/80 shrink-0 text-left">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Info className="w-3 h-3 text-cyan-400" />
                  Consigne clé :
                </div>
                <div className="text-[11px] sm:text-xs text-slate-300 truncate">
                  {currentStep.tips?.[0] || currentStep.exercise?.keyTips[0] || 'Mouvement continu et respiration fluide.'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT (Landscape 40%) OR BOTTOM (Portrait) INFOS + CHRONO + CONTROLS */}
        <div
          className={`${
            isLandscape ? 'w-[40%] h-full justify-around py-2' : 'w-full flex-1 justify-between py-1'
          } flex flex-col items-center shrink-0 min-h-0`}
        >
          {/* In Rest Mode: Card « Exercice suivant » placed cleanly UNDER the mannequin zone */}
          {isRestMode && nextStep?.exercise ? (
            <div className="w-full max-w-sm sm:max-w-md mx-auto p-2 sm:p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-center shrink-0 shadow-lg">
              <div className="text-[10px] sm:text-[11px] text-blue-300 uppercase font-black tracking-wider flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Exercice suivant :
              </div>
              <div className="text-sm sm:text-base font-black text-white truncate">{nextStep.exercise.name}</div>
              <div className="text-[10px] sm:text-xs text-slate-300 truncate">{nextStep.exercise.keyTips[0]}</div>
            </div>
          ) : (
            /* Active title */
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight line-clamp-1">
                {currentStep.name}
              </h2>
              <p className="text-xs text-slate-400">
                {currentStep.exercise?.muscles?.slice(0, 2).join(' • ') || 'Poids du corps'}
              </p>
            </div>
          )}

          {/* CIRCULAR CHRONO */}
          <div className={`relative ${isLandscape ? 'w-44 h-44 sm:w-52 sm:h-52 lg:w-56 lg:h-56' : 'w-36 h-36 sm:w-40 sm:h-40'} flex items-center justify-center shrink-0`}>
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="72" stroke="#1E293B" strokeWidth="10" fill="none" />
              <circle
                cx="80"
                cy="80"
                r="72"
                stroke={isRestMode ? '#06B6D4' : '#22C55E'}
                strokeWidth="10"
                strokeDasharray={2 * Math.PI * 72}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-mono">
                {timeRemaining}
              </span>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
                {isRestMode ? 'Repos (s)' : 'Secondes'}
              </span>
            </div>
          </div>

          {/* BIG PLAYBACK CONTROLS */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (currentStepIndex === 0) return;
                handlePrevStep();
              }}
              aria-disabled={currentStepIndex === 0}
              tabIndex={0}
              className={`tv-focus-target p-3 sm:p-4 rounded-2xl bg-slate-900 border border-slate-800 transition ${
                currentStepIndex === 0
                  ? 'opacity-30 text-slate-600 cursor-not-allowed'
                  : 'text-slate-300 hover:text-white cursor-pointer'
              }`}
              title="Précédent"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <button
              id="player-play-pause-btn"
              onClick={() => setIsPaused(!isPaused)}
              className={`tv-focus-target px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl font-black text-base sm:text-lg flex items-center gap-2.5 transition-all cursor-pointer shadow-xl ${
                isPaused
                  ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                  : 'bg-slate-800 border border-slate-700 text-white hover:bg-slate-700'
              }`}
            >
              {isPaused ? (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  Reprendre
                </>
              ) : (
                <>
                  <Pause className="w-5 h-5 fill-current" />
                  Pause
                </>
              )}
            </button>

            <button
              onClick={handleNextStep}
              className="tv-focus-target p-3 sm:p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
              title="Suivant"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. CONFIRM QUIT MODAL (With Focus Trap and Default on Continue) */}
      {isConfirmQuitOpen && (
        <div
          data-modal-active="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-150"
        >
          <div className="w-full max-w-md bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 text-slate-100 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Quitter la séance ?</h3>
                <p className="text-xs text-slate-400">Votre séance en cours ne sera pas enregistrée.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {/* Default action autofocus on Continue! */}
              <button
                id="continue-workout-btn"
                autoFocus
                onClick={() => {
                  setIsConfirmQuitOpen(false);
                  setIsPaused(false);
                }}
                className="tv-focus-target flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black text-sm hover:brightness-110 shadow-lg cursor-pointer"
              >
                Continuer la séance
              </button>

              <button
                onClick={onQuit}
                className="tv-focus-target flex-1 py-3 px-4 rounded-2xl bg-slate-800 border border-slate-700 text-red-400 font-bold text-sm hover:bg-red-500/10 hover:border-red-500/40 transition cursor-pointer"
              >
                Oui, quitter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MUSIC MODAL */}
      {showMusicModal && (
        <div
          data-modal-active="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-150"
        >
          <div className="w-full max-w-lg bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 text-slate-100 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Music className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-black text-white">Ambiance Musique</h3>
              </div>
              <button
                onClick={() => setShowMusicModal(false)}
                className="tv-focus-target p-2 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 3 Vibes */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'energie' as MusicVibe, label: 'Énergie', sub: '124 BPM' },
                { id: 'focus' as MusicVibe, label: 'Focus', sub: '110 BPM' },
                { id: 'chill' as MusicVibe, label: 'Chill', sub: '84 BPM' },
              ].map((v) => (
                <button
                  key={v.id}
                  onClick={() => {
                    onUpdateSettings({ ...settings, musicVibe: v.id, musicEnabled: true });
                    soundEngine.setVibe(v.id);
                  }}
                  className={`tv-focus-target p-3 rounded-2xl border text-center transition ${
                    settings.musicVibe === v.id
                      ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="font-bold text-sm">{v.label}</div>
                  <div className="text-[10px] text-slate-400">{v.sub}</div>
                </button>
              ))}
            </div>

            {/* Volume */}
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Volume musique</span>
                <span>{Math.round(settings.musicVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.musicVolume}
                onChange={(e) => {
                  const vol = Number(e.target.value);
                  onUpdateSettings({ ...settings, musicVolume: vol });
                  soundEngine.setVolume(vol);
                }}
                className="w-full accent-cyan-400"
              />
            </div>

            <button
              onClick={() => setShowMusicModal(false)}
              className="tv-focus-target w-full py-3 rounded-2xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
