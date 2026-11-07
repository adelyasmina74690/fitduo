import React, { useState } from 'react';
import {
  Activity,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Dumbbell,
  Flame,
  LineChart,
  Play,
  Plus,
  RotateCcw,
  Scale,
  Settings,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';
import { DAYS_SCHEDULE, LEVEL_CONFIGS, calculateBMI, generateWorkoutSteps, getBMICategory } from '../data/program';
import { useSpatialNavigation } from '../hooks/useSpatialNavigation';
import { addWeightEntry, advanceOrRetryLevel } from '../lib/storage';
import { UserProfile, WorkoutZone } from '../types';
import { LevelUpModal } from './LevelUpModal';

interface DashboardProps {
  profile: UserProfile;
  partnerProfile?: UserProfile | null;
  onStartWorkout: (dayIndex: number) => void;
  onStartDuoWorkout: (dayIndex: number) => void;
  onSwitchProfile: () => void;
  onOpenSettings: () => void;
  onOpenLibrary: () => void;
  onUpdateProfile: (updated: UserProfile) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  profile,
  partnerProfile,
  onStartWorkout,
  onStartDuoWorkout,
  onSwitchProfile,
  onOpenSettings,
  onOpenLibrary,
  onUpdateProfile,
}) => {
  // Determine current recommended day: first undone day or 0
  const firstUndoneDay = profile.currentWeekDaysDone.findIndex((done) => !done);
  const defaultDayIndex = firstUndoneDay >= 0 ? firstUndoneDay : 0;
  const [selectedDayIndex, setSelectedDayIndex] = useState(defaultDayIndex);
  const [showWeightInput, setShowWeightInput] = useState(false);
  const [newWeight, setNewWeight] = useState(profile.weightKg.toString());

  useSpatialNavigation({ autoFocusSelector: '#start-workout-main-btn' });

  const handleAdvanceLevel = () => {
    const updated = advanceOrRetryLevel(profile, true);
    onUpdateProfile(updated);
    setSelectedDayIndex(0);
  };

  const handleRetryLevel = () => {
    const updated = advanceOrRetryLevel(profile, false);
    onUpdateProfile(updated);
    setSelectedDayIndex(0);
  };

  const currentLevelConfig = LEVEL_CONFIGS[profile.currentLevel] || LEVEL_CONFIGS[1];
  const selectedDayInfo = DAYS_SCHEDULE[selectedDayIndex];

  // Calculate exact duration for selected day
  const { formattedDuration, totalSeconds } = generateWorkoutSteps(
    profile,
    selectedDayIndex,
    profile.currentLevel
  );

  const bmi = calculateBMI(profile.weightKg, profile.heightCm);
  const bmiCat = getBMICategory(bmi);

  const handleAddWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newWeight);
    if (!isNaN(val) && val > 30 && val < 250) {
      const updated = addWeightEntry(profile, val);
      onUpdateProfile(updated);
      setShowWeightInput(false);
    }
  };

  // SVG weight chart coordinates
  const weightPoints = profile.weightHistory.slice(-8);
  const minW = Math.min(...weightPoints.map((w) => w.weightKg), profile.weightKg - 2);
  const maxW = Math.max(...weightPoints.map((w) => w.weightKg), profile.weightKg + 2);
  const rangeW = maxW - minW || 1;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto pb-24">
      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onSwitchProfile}
            className="tv-focus-target p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition flex items-center gap-2"
            title="Changer de profil (Échap)"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-xs font-bold hidden sm:inline">Profils</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center font-black text-xl text-emerald-400">
                {profile.name.charAt(0)}
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2 tracking-tight">
                {profile.name}
              </h1>
              <p className="text-xs text-slate-400">
                Niveau {profile.currentLevel} • {currentLevelConfig.name}
              </p>
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {partnerProfile && partnerProfile.isConfigured && (
            <button
              onClick={() => onStartDuoWorkout(selectedDayIndex)}
              className="tv-focus-target py-2 px-3.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-2 hover:bg-cyan-500/25 transition cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Mode Duo avec {partnerProfile.name}</span>
            </button>
          )}

          <button
            onClick={onOpenLibrary}
            className="tv-focus-target p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
            title="Bibliothèque des 50 exercices"
          >
            <Dumbbell className="w-5 h-5" />
          </button>

          <button
            onClick={onOpenSettings}
            className="tv-focus-target p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
            title="Réglages"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* STATS STRIP: Streak, Minutes, Weight */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {/* Streak */}
        <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
            <Flame className="w-6 h-6 fill-orange-400 text-orange-400" />
          </div>
          <div>
            <div className="text-xl font-black text-white">{profile.streakDays} jours</div>
            <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
              Série en cours
            </div>
          </div>
        </div>

        {/* Total Time */}
        <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl font-black text-white">{profile.totalMinutes} min</div>
            <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
              Temps total
            </div>
          </div>
        </div>

        {/* Level Gauge (1-10) */}
        <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl font-black text-cyan-400">{profile.currentLevel} / 10</div>
            <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
              Niveau actuel
            </div>
          </div>
        </div>

        {/* Current Weight & BMI */}
        <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl font-black text-white">{profile.weightKg} kg</div>
            <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
              IMC {bmi}
            </div>
          </div>
        </div>
      </div>

      {/* HERO SECTION: TODAY'S WORKOUT CALL TO ACTION */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl mb-8">

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              Séance {selectedDayInfo.dayLabel} • {selectedDayInfo.title}
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {selectedDayInfo.title}
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {selectedDayInfo.subtitle}. Format court condensé : 1 min d'échauffement, circuit tonique crescendo, 1 min de retour au calme.
            </p>

            <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-400 pt-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <Clock className="w-4 h-4" />
                Durée exacte : {formattedDuration} (≤ 10 min)
              </div>
              <div>•</div>
              <div>
                Effort : <strong>{currentLevelConfig.effortSeconds}s</strong> / Repos :{' '}
                <strong>{currentLevelConfig.restSeconds}s</strong>
              </div>
            </div>
          </div>

          {/* Primary Launch Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              id="start-workout-main-btn"
              onClick={() => onStartWorkout(selectedDayIndex)}
              className="tv-focus-target py-4 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black text-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/25 cursor-pointer"
            >
              <Play className="w-6 h-6 fill-current" />
              <span>Démarrer ({formattedDuration})</span>
            </button>

            {partnerProfile && partnerProfile.isConfigured && (
              <button
                onClick={() => onStartDuoWorkout(selectedDayIndex)}
                className="tv-focus-target py-3 px-6 rounded-2xl bg-slate-800 border border-slate-700 text-white font-bold text-sm hover:bg-slate-700 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Lancer en Duo ({profile.name} & {partnerProfile.name})</span>
              </button>
            )}
          </div>
        </div>

        {/* WEEKLY 7-DAY PILLS ROTATION */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-cyan-400" />
              Programme de la semaine (1 séance par jour)
            </div>
            <span className="text-xs text-slate-400">
              {profile.currentWeekDaysDone.filter(Boolean).length} / 7 validées
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 sm:gap-3">
            {DAYS_SCHEDULE.map((day) => {
              const isDone = profile.currentWeekDaysDone[day.dayIndex];
              const isSelected = selectedDayIndex === day.dayIndex;

              return (
                <button
                  key={day.dayIndex}
                  onClick={() => setSelectedDayIndex(day.dayIndex)}
                  className={`tv-focus-target p-2.5 sm:p-3 rounded-2xl border text-center transition flex flex-col items-center justify-between ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg'
                      : isDone
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-black">{day.dayLabel}</span>
                  <div className="my-1">
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-700 bg-slate-900" />
                    )}
                  </div>
                  <span className="text-[10px] truncate max-w-full hidden sm:inline text-slate-400">
                    {day.title.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: WEIGHT PROGRESSION CURVE & RECENT HISTORY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weight Tracking Curve */}
        <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LineChart className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-white text-base">Suivi du Poids & Tendance IMC</h3>
            </div>
            <button
              onClick={() => setShowWeightInput(!showWeightInput)}
              className="tv-focus-target text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Saisir pesée
            </button>
          </div>

          {showWeightInput && (
            <form onSubmit={handleAddWeight} className="flex gap-2 p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <input
                type="number"
                step="0.1"
                min="30"
                max="250"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                placeholder="Poids en kg"
                className="tv-focus-target px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-400 flex-1"
              />
              <button
                type="submit"
                className="tv-focus-target px-4 py-1.5 rounded-xl bg-cyan-500 font-bold text-slate-950 text-xs hover:bg-cyan-400 transition"
              >
                Enregistrer
              </button>
            </form>
          )}

          {/* SVG Weight Line Chart */}
          <div className="h-44 w-full bg-slate-950/60 rounded-2xl border border-slate-800/80 p-3 flex flex-col justify-between">
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>Évolution récente</span>
              <span>Actuel : {profile.weightKg} kg</span>
            </div>

            <div className="w-full h-28 relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100">
                {/* Horizontal reference grid lines */}
                <line x1="0" y1="20" x2="300" y2="20" stroke="#1E293B" strokeDasharray="4 4" />
                <line x1="0" y1="50" x2="300" y2="50" stroke="#1E293B" strokeDasharray="4 4" />
                <line x1="0" y1="80" x2="300" y2="80" stroke="#1E293B" strokeDasharray="4 4" />

                {weightPoints.length === 1 && (
                  <g>
                    <circle cx="150" cy="50" r="6" fill="#06B6D4" />
                    <text x="150" y="38" fill="#94A3B8" fontSize="10" textAnchor="middle" fontWeight="bold">
                      {weightPoints[0].weightKg} kg (Départ)
                    </text>
                  </g>
                )}

                {weightPoints.length > 1 && (
                  <>
                    <polyline
                      fill="none"
                      stroke="#06B6D4"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={weightPoints
                        .map((pt, i) => {
                          const x = (i / (weightPoints.length - 1)) * 280 + 10;
                          const y = 85 - ((pt.weightKg - minW) / rangeW) * 70;
                          return `${x},${y}`;
                        })
                        .join(' ')}
                    />

                    {weightPoints.map((pt, i) => {
                      const x = (i / (weightPoints.length - 1)) * 280 + 10;
                      const y = 85 - ((pt.weightKg - minW) / rangeW) * 70;
                      return (
                        <g key={pt.id || i}>
                          <circle cx={x} cy={y} r="4" fill="#06B6D4" />
                          <text
                            x={x}
                            y={y - 8}
                            fill="#94A3B8"
                            fontSize="8"
                            textAnchor="middle"
                            fontWeight="bold"
                          >
                            {pt.weightKg}
                          </text>
                        </g>
                      );
                    })}
                  </>
                )}
              </svg>
            </div>

            <div className="flex justify-between text-[10px] text-slate-500">
              <span>{weightPoints[0]?.date || 'Départ'}</span>
              <span>{weightPoints[weightPoints.length - 1]?.date || "Aujourd'hui"}</span>
            </div>
          </div>
        </div>

        {/* Workout History */}
        <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-white text-base">Historique des Séances</h3>
            </div>
            <span className="text-xs text-slate-400">
              {profile.workoutHistory.length} séance(s)
            </span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {profile.workoutHistory.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-500">
                Aucune séance terminée pour le moment. Lancez votre premier entraînement !
              </div>
            ) : (
              profile.workoutHistory.slice(0, 6).map((item) => {
                const mins = Math.round(item.durationSeconds / 60);
                const feelingLabel =
                  item.feeling === 'trop_facile'
                    ? 'Trop facile'
                    : item.feeling === 'trop_dur'
                    ? 'Trop dur'
                    : 'Parfait';
                const feelingColor =
                  item.feeling === 'trop_facile'
                    ? 'text-cyan-400 bg-cyan-500/10'
                    : item.feeling === 'trop_dur'
                    ? 'text-amber-400 bg-amber-500/10'
                    : 'text-emerald-400 bg-emerald-500/10';

                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>
                          J{item.dayIndex + 1} • {item.zoneLabel}
                        </span>
                        {item.wasDuo && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300">
                            Duo
                          </span>
                        )}
                      </div>
                      <div className="text-slate-400">
                        {item.date.split('T')[0]} • Niveau {item.level} • {mins} min
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-lg font-semibold ${feelingColor}`}>
                      {feelingLabel}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* LEVEL UP MODAL */}
      {profile.pendingLevelUp && (
        <LevelUpModal
          profile={profile}
          onAdvance={handleAdvanceLevel}
          onRetry={handleRetryLevel}
        />
      )}
    </div>
  );
};
