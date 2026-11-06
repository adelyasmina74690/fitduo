import React, { useState } from 'react';
import {
  AlertCircle,
  Dumbbell,
  Filter,
  Info,
  Search,
  Shield,
  Sparkles,
  X,
} from 'lucide-react';
import { EXERCISES } from '../data/exercises';
import { useTVNavigation } from '../hooks/useTVNavigation';
import { ExerciseDefinition, WorkoutZone } from '../types';
import { Mannequin } from './Mannequin';

interface ExerciseLibraryModalProps {
  onClose: () => void;
}

export const ExerciseLibraryModal: React.FC<ExerciseLibraryModalProps> = ({ onClose }) => {
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<ExerciseDefinition>(EXERCISES[0]);

  useTVNavigation({
    autoFocusSelector: '#library-search-input',
    onBack: onClose,
  });

  const zones: { id: string; label: string }[] = [
    { id: 'all', label: 'Tous (50+)' },
    { id: 'pectoraux_triceps', label: 'Pectoraux & Triceps' },
    { id: 'jambes_fessiers', label: 'Jambes & Fessiers' },
    { id: 'abdos_gainage', label: 'Abdos & Gainage' },
    { id: 'dos_epaules', label: 'Dos & Épaules' },
    { id: 'bras', label: 'Bras Ciblés' },
    { id: 'cardio', label: 'Cardio' },
    { id: 'mobilite', label: 'Mobilité' },
  ];

  const filteredExercises = EXERCISES.filter((ex) => {
    const matchesZone = selectedZone === 'all' || ex.zone === selectedZone;
    const matchesSearch =
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.muscles.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesZone && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-6xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 flex flex-col text-slate-100 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Bibliothèque d'Exercices (50 Mouvements)
              </h2>
              <p className="text-xs text-slate-400">
                100% au poids du corps • Démonstrations animées anatomiques
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="tv-focus-target p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            title="Fermer (Échap)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Zone Filters */}
        <div className="py-3 space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              id="library-search-input"
              type="text"
              placeholder="Rechercher par exercice ou muscle (ex: pompes, squat, dos)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="tv-focus-target w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Zone Chips (scrollable) */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {zones.map((z) => (
              <button
                key={z.id}
                onClick={() => setSelectedZone(z.id)}
                className={`tv-focus-target px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedZone === z.id
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {z.label}
              </button>
            ))}
          </div>
        </div>

        {/* Two Columns: List & Detailed Preview with Animated Mannequin */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden pt-1">
          {/* Left Column: Exercises scrollable list */}
          <div className="lg:col-span-5 overflow-y-auto space-y-2 pr-1 max-h-[55vh] lg:max-h-none">
            {filteredExercises.map((ex) => {
              const isSelected = selectedExercise.id === ex.id;
              return (
                <button
                  key={ex.id}
                  onClick={() => setSelectedExercise(ex)}
                  className={`tv-focus-target w-full text-left p-3 rounded-2xl border transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-md'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-bold text-sm text-white">{ex.name}</div>
                    <div className="text-xs text-slate-400">{ex.zoneLabel}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {ex.isLowImpact && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-semibold">
                        Doux
                      </span>
                    )}
                    {ex.requiresChair && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-semibold">
                        Chaise
                      </span>
                    )}
                    {ex.requiresWall && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-semibold">
                        Mur
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Selected Exercise Full Details & Animated Mannequin */}
          <div className="lg:col-span-7 bg-slate-950/70 border border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col justify-between overflow-y-auto max-h-[55vh] lg:max-h-none">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  {selectedExercise.zoneLabel}
                </span>
                <span className="text-xs text-slate-400">
                  Muscles : {selectedExercise.muscles.join(', ')}
                </span>
              </div>

              <h3 className="text-2xl font-black text-white mb-2">{selectedExercise.name}</h3>

              {/* Animated Mannequin Preview */}
              <div className="w-full aspect-[16/9] max-h-[220px] bg-slate-900/60 rounded-2xl border border-slate-800/80 mb-3 flex items-center justify-center p-2">
                <Mannequin
                  poseType={selectedExercise.poseType}
                  colorTheme="emerald"
                  className="w-full h-full"
                />
              </div>

              {/* 3 Key Tips */}
              <div className="space-y-2 mb-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-cyan-400" />
                  3 Consignes Clés
                </div>
                <ul className="text-xs sm:text-sm text-slate-300 space-y-1">
                  {selectedExercise.keyTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Common Mistake */}
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 mb-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Erreur fréquente :</strong> {selectedExercise.commonMistake}
                </div>
              </div>

              {/* Variants */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 font-semibold mb-0.5">Variante plus facile :</div>
                  <div className="text-emerald-300 font-medium">{selectedExercise.easyVariant}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-slate-400 font-semibold mb-0.5">Variante plus dure :</div>
                  <div className="text-cyan-300 font-medium">{selectedExercise.hardVariant}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
