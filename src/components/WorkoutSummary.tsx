import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  ChevronRight,
  Flame,
  HeartHandshake,
  RotateCcw,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { useSpatialNavigation } from '../hooks/useSpatialNavigation';
import { UserProfile, WorkoutFeeling } from '../types';

interface WorkoutSummaryProps {
  profile1: UserProfile;
  profile2?: UserProfile | null;
  isDuoMode?: boolean;
  durationSeconds: number;
  level: number;
  dayIndex: number;
  zoneTitle: string;
  onSaveFeedback: (feeling1: WorkoutFeeling, feeling2?: WorkoutFeeling) => void;
  isWeekCompletedNow: boolean;
  onAdvanceLevel: () => void;
  onRetryLevel: () => void;
  onRestartAllLevels: () => void;
  onBackToDashboard: () => void;
}

export const WorkoutSummary: React.FC<WorkoutSummaryProps> = ({
  profile1,
  profile2,
  isDuoMode = false,
  durationSeconds,
  level,
  dayIndex,
  zoneTitle,
  onSaveFeedback,
  isWeekCompletedNow,
  onAdvanceLevel,
  onRetryLevel,
  onRestartAllLevels,
  onBackToDashboard,
}) => {
  const [feeling1, setFeeling1] = useState<WorkoutFeeling>('parfait');
  const [feeling2, setFeeling2] = useState<WorkoutFeeling>('parfait');
  const [hasSubmittedFeedback, setHasSubmittedFeedback] = useState(false);

  useSpatialNavigation({ autoFocusSelector: '#save-summary-feedback-btn' });

  const minutes = Math.max(1, Math.round(durationSeconds / 60));
  const estimatedCalories1 = Math.round(minutes * 7.5 * (profile1.weightKg / 70));

  const feelings = [
    {
      id: 'trop_facile' as WorkoutFeeling,
      label: 'Trop facile',
      emoji: '⚡',
      activeColor: 'bg-cyan-500/20 border-cyan-400 text-cyan-300',
    },
    {
      id: 'parfait' as WorkoutFeeling,
      label: 'Parfait',
      emoji: '🔥',
      activeColor: 'bg-emerald-500/20 border-emerald-400 text-emerald-300',
    },
    {
      id: 'trop_dur' as WorkoutFeeling,
      label: 'Trop dur',
      emoji: '💪',
      activeColor: 'bg-amber-500/20 border-amber-400 text-amber-300',
    },
  ];

  const handleFeedbackSubmit = () => {
    onSaveFeedback(feeling1, isDuoMode ? feeling2 : undefined);
    if (!isWeekCompletedNow) {
      onBackToDashboard();
    } else {
      setHasSubmittedFeedback(true);
    }
  };

  // 1. SCREEN FOR LEVEL 10 PROGRAM COMPLETED
  if (isWeekCompletedNow && hasSubmittedFeedback && level >= 10) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-xl bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-emerald-400 p-0.5 shadow-2xl flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-3xl flex items-center justify-center text-amber-400">
              <Trophy className="w-10 h-10" />
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/15 border border-amber-500/30 text-amber-300 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Programme FitDuo Accompli
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Programme Terminé ! 🏆
            </h2>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Félicitations monumentales ! Vous avez conquis les 10 niveaux et 70 séances de FitDuo au poids de corps. Vous possédez désormais une condition physique, une tonicité et une régularité remarquables.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={onAdvanceLevel}
              className="tv-focus-target flex-1 py-4 px-5 rounded-2xl bg-slate-800 border border-slate-700 text-white font-bold hover:bg-slate-700 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <RotateCcw className="w-5 h-5 text-cyan-400" />
              Rester au Niveau 10
            </button>

            <button
              id="restart-program-btn"
              onClick={onRestartAllLevels}
              className="tv-focus-target flex-1 py-4 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black text-base hover:brightness-110 flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 transition cursor-pointer"
            >
              <span>Recommencer au Niveau 1</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. SCREEN FOR LEVEL 1..9 WEEK COMPLETED (LEVEL UP MODAL)
  if (isWeekCompletedNow && hasSubmittedFeedback) {
    const isHard = feeling1 === 'trop_dur' || (isDuoMode && feeling2 === 'trop_dur');

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-xl bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-500 to-cyan-500 p-0.5 shadow-xl flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-3xl flex items-center justify-center text-emerald-400">
              <Trophy className="w-10 h-10" />
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Semaine Complète (7/7 Séances)
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Niveau {level} validé 🎉
            </h2>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              {isHard
                ? 'Bravo pour cet effort intense ! Comme votre ressenti était majoritairement exigeant, vous pouvez consolider vos acquis en refaisant ce niveau, ou passer au niveau supérieur.'
                : 'Performance remarquable ! Vos muscles et votre système cardiorespiratoire ont progressé.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={onRetryLevel}
              className="tv-focus-target flex-1 py-4 px-5 rounded-2xl bg-slate-800 border border-slate-700 text-white font-bold hover:bg-slate-700 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <RotateCcw className="w-5 h-5 text-amber-400" />
              Refaire le Niveau {level}
            </button>

            <button
              id="advance-level-btn"
              autoFocus
              onClick={onAdvanceLevel}
              className="tv-focus-target flex-1 py-4 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black text-base hover:brightness-110 flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 transition cursor-pointer"
            >
              <span>Passer au Niveau {Math.min(10, level + 1)}</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. REGULAR WORKOUT SUMMARY
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="text-center space-y-1">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2">
            <Award className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Séance Terminée ! 🎯
          </h2>
          <p className="text-sm text-slate-400">
            Jour {dayIndex + 1} • {zoneTitle}
          </p>
        </div>

        {/* Workout metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center">
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Durée réelle</div>
            <div className="text-2xl sm:text-3xl font-black text-white">{minutes} min</div>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center">
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Dépense estimée</div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 flex items-center justify-center gap-1">
              <Flame className="w-6 h-6 text-orange-400 fill-orange-400" />
              ~{estimatedCalories1} kcal
            </div>
          </div>
        </div>

        {/* FEELING PROMPT: Trop facile / Parfait / Trop dur */}
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Quel était votre ressenti ? ({profile1.name})
            </label>
            <div className="grid grid-cols-3 gap-2">
              {feelings.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFeeling1(f.id)}
                  className={`tv-focus-target p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1 ${
                    feeling1 === f.id
                      ? f.activeColor
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xl">{f.emoji}</span>
                  <span className="font-bold text-xs">{f.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* If Duo mode, prompt for partner 2 feeling */}
          {isDuoMode && profile2 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Ressenti de {profile2.name}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {feelings.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFeeling2(f.id)}
                    className={`tv-focus-target p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1 ${
                      feeling2 === f.id
                        ? f.activeColor
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xl">{f.emoji}</span>
                    <span className="font-bold text-xs">{f.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            id="save-summary-feedback-btn"
            onClick={handleFeedbackSubmit}
            className="tv-focus-target w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black text-base hover:brightness-110 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5" />
            Valider et enregistrer ma séance
          </button>
        </div>
      </div>
    </div>
  );
};
