import React from 'react';
import {
  Award,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Flame,
  RotateCcw,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { LEVEL_CONFIGS } from '../data/program';
import { useSpatialNavigation } from '../hooks/useSpatialNavigation';
import { UserProfile, WorkoutFeeling } from '../types';

interface LevelUpModalProps {
  profile: UserProfile;
  onAdvance: () => void;
  onRetry: () => void;
  onRestartAll?: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  profile,
  onAdvance,
  onRetry,
  onRestartAll,
}) => {
  useSpatialNavigation({
    isModal: true,
    autoFocusSelector: '#advance-level-primary-btn',
  });

  const currentLevel = profile.currentLevel;
  const isFinalLevel = currentLevel >= 10;
  const nextLevel = Math.min(10, currentLevel + 1);
  const nextConfig = LEVEL_CONFIGS[nextLevel] || LEVEL_CONFIGS[10];

  // Calculate average feeling on the current week
  const recentWorkouts = profile.workoutHistory.slice(0, 7);
  let hardCount = 0;
  let easyCount = 0;
  let perfectCount = 0;

  recentWorkouts.forEach((w) => {
    if (w.feeling === 'trop_dur') hardCount++;
    else if (w.feeling === 'trop_facile') easyCount++;
    else perfectCount++;
  });

  let averageFeelingLabel = 'Parfait 🔥';
  let averageFeelingColor = 'text-emerald-400';
  let averageFeelingAdvice = 'Progression idéale et régularité exemplaire !';

  if (hardCount >= 3) {
    averageFeelingLabel = 'Exigeant 💪';
    averageFeelingColor = 'text-amber-400';
    averageFeelingAdvice = 'Bravo pour cet effort intense ! Vous pouvez consolider vos acquis en refaisant ce niveau ou relever le défi suivant.';
  } else if (easyCount >= 4) {
    averageFeelingLabel = 'Très facile ⚡';
    averageFeelingColor = 'text-cyan-400';
    averageFeelingAdvice = 'Vous avez dominé cette semaine ! Vous êtes fin prêt pour le niveau supérieur.';
  }

  // 1. SCREEN FOR LEVEL 10 COMPLETED (PROGRAM ACCOMPLISHED)
  if (isFinalLevel) {
    return (
      <div
        data-modal-active="true"
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-200"
      >
        <div className="w-full max-w-xl bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
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
              Félicitations <strong>{profile.name}</strong> ! Vous avez conquis les 10 niveaux et 70 séances de FitDuo au poids de corps. Vous possédez désormais une condition physique, une tonicité et une régularité remarquables.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 grid grid-cols-2 gap-3 text-center">
            <div>
              <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Séances totales</div>
              <div className="text-2xl font-black text-white">{profile.workoutHistory.length || 70}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Minutes d'effort</div>
              <div className="text-2xl font-black text-emerald-400">{profile.totalMinutes} min</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              id="advance-level-primary-btn"
              onClick={onRetry}
              className="tv-focus-target flex-1 py-4 px-5 rounded-2xl bg-slate-800 border border-slate-700 text-white font-bold hover:bg-slate-700 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <RotateCcw className="w-5 h-5 text-cyan-400" />
              <span>Rester au Niveau 10</span>
            </button>

            {onRestartAll && (
              <button
                onClick={onRestartAll}
                className="tv-focus-target flex-1 py-4 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black text-base hover:brightness-110 flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 transition cursor-pointer"
              >
                <span>Recommencer au Niveau 1</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. STANDARD LEVEL UP (LEVEL 1 TO 9 COMPLETED)
  return (
    <div
      data-modal-active="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-xl bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-2xl relative overflow-hidden">
        {/* Animated Trophy badge */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-400 to-cyan-400 p-0.5 shadow-xl flex items-center justify-center">
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
            Niveau {currentLevel} validé 🎉
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            {averageFeelingAdvice}
          </p>
        </div>

        {/* Weekly recap card */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 text-left">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-900">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-400" />
              Bilan de la semaine
            </span>
            <span className="text-emerald-400 font-bold">7 / 7 séances validées</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-semibold">Ressenti moyen des séances :</span>
            <span className={`font-black ${averageFeelingColor}`}>{averageFeelingLabel}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
            <div>
              <span className="font-bold text-white block">Prochain palier : Niveau {nextLevel}</span>
              <span className="text-[11px] text-slate-400">
                Effort : {nextConfig.effortSeconds}s • Repos : {nextConfig.restSeconds}s • {nextConfig.circuitRounds} tours
              </span>
            </div>
            <Award className="w-5 h-5 text-cyan-400 shrink-0 ml-2" />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={onRetry}
            className="tv-focus-target flex-1 py-4 px-5 rounded-2xl bg-slate-800 border border-slate-700 text-white font-bold hover:bg-slate-700 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <RotateCcw className="w-5 h-5 text-amber-400" />
            <span>Refaire le Niveau {currentLevel}</span>
          </button>

          <button
            id="advance-level-primary-btn"
            onClick={onAdvance}
            className="tv-focus-target flex-1 py-4 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black text-base hover:brightness-110 flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 transition cursor-pointer"
          >
            <span>Passer au Niveau {nextLevel}</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
