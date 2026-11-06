import React, { useEffect, useRef, useState } from 'react';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Heart,
  Minus,
  Plus,
  Scale,
  Shield,
  Sparkles,
  User,
  Users,
  Zap,
} from 'lucide-react';
import { calculateBMI, getBMICategory } from '../data/program';
import { useSpatialNavigation } from '../hooks/useSpatialNavigation';
import {
  ActivityLevel,
  Gender,
  Goal,
  Morphology,
  PhysicalLimitation,
  UserProfile,
} from '../types';

interface OnboardingProps {
  initialProfile: UserProfile;
  targetProfileId: 'profile_1' | 'profile_2';
  isFirstProfile: boolean;
  onSave: (updated: UserProfile, thenAddSecondProfile?: boolean) => void;
  onCancel?: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({
  initialProfile,
  targetProfileId,
  isFirstProfile,
  onSave,
  onCancel,
}) => {
  // Step index:
  // 0: Prénom, 1: Sexe, 2: Âge, 3: Taille, 4: Poids, 5: Morphologie,
  // 6: Niveau d'activité, 7: Objectif, 8: Limitations & Bilan,
  // 9: (Si first profile) Proposer 2e personne
  const [step, setStep] = useState(0);

  const [name, setName] = useState(initialProfile.name || '');
  const [gender, setGender] = useState<Gender>(initialProfile.gender || 'homme');
  const [age, setAge] = useState(initialProfile.age || 30);
  const [heightCm, setHeightCm] = useState(initialProfile.heightCm || 175);
  const [weightKg, setWeightKg] = useState(initialProfile.weightKg || 70);
  const [morphology, setMorphology] = useState<Morphology>(initialProfile.morphology || 'mesomorphe');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(initialProfile.activityLevel || 'modere');
  const [goal, setGoal] = useState<Goal>(initialProfile.goal || 'tonifier');
  const [limitations, setLimitations] = useState<PhysicalLimitation[]>(initialProfile.limitations || []);

  const nameInputRef = useRef<HTMLInputElement>(null);

  const bmi = calculateBMI(weightKg, heightCm);
  const bmiCat = getBMICategory(bmi);

  // Evaluate initial adaptation based on IMC + Activity + Morphology + Limitations
  const isSedentaryRisk = activityLevel === 'sedentaire' && (bmi >= 26 || morphology === 'endomorphe');
  const hasLowImpactTrigger = bmi >= 30 || limitations.length > 0 || isSedentaryRisk;
  const isDynamicAthletic = activityLevel === 'tres_actif' && bmi < 26 && morphology === 'mesomorphe' && limitations.length === 0;

  const totalSteps = isFirstProfile ? 10 : 9;

  // Initial focus management
  useSpatialNavigation({
    autoFocusSelector: step === 0 ? '#onboarding-name-input' : '#onboarding-primary-btn',
    onBack: () => {
      if (step > 0) setStep(step - 1);
      else if (onCancel) onCancel();
    },
  });

  useEffect(() => {
    if (step === 0 && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [step]);

  const toggleLimitation = (lim: PhysicalLimitation) => {
    if (limitations.includes(lim)) {
      setLimitations(limitations.filter((l) => l !== lim));
    } else {
      setLimitations([...limitations, lim]);
    }
  };

  const handleFinishProfile = (andAddSecond = false) => {
    const fallbackName = targetProfileId === 'profile_1' ? 'Moi' : 'Partenaire';
    const finalName = name.trim() || fallbackName;
    const todayStr = new Date().toISOString().split('T')[0];

    // Initial weight entry: first and only entry on the curve!
    const initialWeightEntry = {
      id: 'w_' + Date.now(),
      date: todayStr,
      weightKg,
      bmi,
    };

    const updated: UserProfile = {
      ...initialProfile,
      id: targetProfileId,
      name: finalName,
      isConfigured: true,
      gender,
      age,
      heightCm,
      weightKg,
      morphology,
      activityLevel,
      goal,
      limitations,
      currentLevel: 1,
      currentWeekDaysDone: [false, false, false, false, false, false, false],
      streakDays: 0,
      lastWorkoutDate: null,
      totalMinutes: 0,
      weightHistory: [initialWeightEntry],
      workoutHistory: [],
      pendingLevelUp: false,
    };

    onSave(updated, andAddSecond);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-10 max-w-2xl mx-auto">
      {/* Top progress header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {step > 0 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="tv-focus-target p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                title="Question précédente"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : onCancel ? (
              <button
                onClick={onCancel}
                className="tv-focus-target p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                title="Annuler"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : null}
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              {targetProfileId === 'profile_1' ? 'Profil 1' : 'Profil 2 (Duo)'}
            </span>
          </div>

          <span className="text-xs text-slate-400 font-semibold">
            Étape {step + 1} / {totalSteps}
          </span>
        </div>

        {/* Step progress bar */}
        <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-300"
            style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* QUESTION PANELS (1 question par écran) */}
      <div className="my-auto py-6">
        {/* Step 0: Prénom */}
        {step === 0 && (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Quel est votre prénom ?</h2>
              <p className="text-sm text-slate-400 mt-1">Pour personnaliser votre entraînement et vos bilans.</p>
            </div>
            <input
              ref={nameInputRef}
              id="onboarding-name-input"
              type="text"
              autoFocus
              placeholder="Votre prénom ou surnom"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && name.trim()) setStep(1);
              }}
              className="tv-focus-target w-full text-center py-4 px-6 rounded-2xl bg-slate-900 border-2 border-slate-800 text-xl font-bold text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        )}

        {/* Step 1: Sexe */}
        {step === 1 && (
          <div className="space-y-6 text-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Quel est votre sexe biologique ?</h2>
              <p className="text-sm text-slate-400 mt-1">Utilisé pour le calcul précis de l'IMC et des dépenses caloriques.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'homme' as Gender, label: 'Homme', icon: '♂' },
                { id: 'femme' as Gender, label: 'Femme', icon: '♀' },
                { id: 'autre' as Gender, label: 'Autre', icon: '✦' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setGender(item.id);
                    setStep(2);
                  }}
                  className={`tv-focus-target p-6 rounded-3xl border-2 transition flex flex-col items-center gap-2 ${
                    gender === item.id
                      ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-lg'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="text-3xl">{item.icon}</span>
                  <span className="text-lg font-bold">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Âge avec boutons - / + */}
        {step === 2 && (
          <div className="space-y-6 text-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Quel est votre âge ?</h2>
              <p className="text-sm text-slate-400 mt-1">Modifiable via la télécommande avec − et +.</p>
            </div>
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col items-center gap-6">
              <span className="text-6xl font-black text-white font-mono">{age} <span className="text-2xl text-slate-400 font-sans">ans</span></span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setAge((a) => Math.max(14, a - 5))}
                  className="tv-focus-target px-4 py-3 rounded-2xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  − 5
                </button>
                <button
                  onClick={() => setAge((a) => Math.max(14, a - 1))}
                  className="tv-focus-target p-4 rounded-2xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  <Minus className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setAge((a) => Math.min(99, a + 1))}
                  className="tv-focus-target p-4 rounded-2xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  <Plus className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setAge((a) => Math.min(99, a + 5))}
                  className="tv-focus-target px-4 py-3 rounded-2xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  + 5
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Taille en cm avec boutons - / + */}
        {step === 3 && (
          <div className="space-y-6 text-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Quelle est votre taille ?</h2>
              <p className="text-sm text-slate-400 mt-1">Utilisez les boutons − / + de la télécommande.</p>
            </div>
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col items-center gap-6">
              <span className="text-6xl font-black text-white font-mono">{heightCm} <span className="text-2xl text-slate-400 font-sans">cm</span></span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setHeightCm((h) => Math.max(120, h - 5))}
                  className="tv-focus-target px-4 py-3 rounded-2xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  − 5 cm
                </button>
                <button
                  onClick={() => setHeightCm((h) => Math.max(120, h - 1))}
                  className="tv-focus-target p-4 rounded-2xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  <Minus className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setHeightCm((h) => Math.min(230, h + 1))}
                  className="tv-focus-target p-4 rounded-2xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  <Plus className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setHeightCm((h) => Math.min(230, h + 5))}
                  className="tv-focus-target px-4 py-3 rounded-2xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  + 5 cm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Poids en kg avec boutons - / + */}
        {step === 4 && (
          <div className="space-y-6 text-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Quel est votre poids actuel ?</h2>
              <p className="text-sm text-slate-400 mt-1">Ce poids sera le 1er point de départ de votre courbe de suivi.</p>
            </div>
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col items-center gap-6">
              <span className="text-6xl font-black text-emerald-400 font-mono">{weightKg} <span className="text-2xl text-slate-400 font-sans">kg</span></span>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
                <button
                  onClick={() => setWeightKg((w) => Number(Math.max(35, w - 2).toFixed(1)))}
                  className="tv-focus-target px-3.5 py-3 rounded-2xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  − 2 kg
                </button>
                <button
                  onClick={() => setWeightKg((w) => Number(Math.max(35, w - 0.5).toFixed(1)))}
                  className="tv-focus-target p-4 rounded-2xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setWeightKg((w) => Number(Math.min(220, w + 0.5).toFixed(1)))}
                  className="tv-focus-target p-4 rounded-2xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  <Plus className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setWeightKg((w) => Number(Math.min(220, w + 2).toFixed(1)))}
                  className="tv-focus-target px-3.5 py-3 rounded-2xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  + 2 kg
                </button>
              </div>
              <div className="text-xs text-slate-400">
                IMC actuel : <strong>{bmi}</strong> • <span className={bmiCat.color}>{bmiCat.label}</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Morphologie */}
        {step === 5 && (
          <div className="space-y-5 text-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Votre type morphologique</h2>
              <p className="text-sm text-slate-400 mt-1">Permet d'adapter l'effort et la récupération.</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {[
                {
                  id: 'ectomorphe' as Morphology,
                  title: 'Ectomorphe',
                  desc: 'Ossature fine, silhouette élancée, métabolisme rapide, prise de masse progressive.',
                },
                {
                  id: 'mesomorphe' as Morphology,
                  title: 'Mésomorphe',
                  desc: 'Buste athlétique, carrure naturelle, développement musculaire et récupération rapides.',
                },
                {
                  id: 'endomorphe' as Morphology,
                  title: 'Endomorphe',
                  desc: 'Ossature plus large, métabolisme économe, force naturelle, prise de masse facile.',
                },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setMorphology(m.id);
                    setStep(6);
                  }}
                  className={`tv-focus-target p-5 rounded-2xl border-2 text-left transition ${
                    morphology === m.id
                      ? 'bg-cyan-500/15 border-cyan-400 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-lg text-white mb-0.5">{m.title}</div>
                  <div className="text-xs text-slate-400 leading-relaxed">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 6: Niveau d'activité physique (AUDIT 2 - Remis et relié) */}
        {step === 6 && (
          <div className="space-y-5 text-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Votre niveau d'activité actuel</h2>
              <p className="text-sm text-slate-400 mt-1">Détermine l'intensité de démarrage et la charge progressive.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: 'sedentaire' as ActivityLevel,
                  title: 'Sédentaire',
                  sub: 'Travail assis, peu ou pas d\'exercice régulier.',
                  badge: 'Reprise douce',
                },
                {
                  id: 'leger' as ActivityLevel,
                  title: 'Peu actif',
                  sub: 'Déplacements à pied légers, 1 séance occasionnelle par semaine.',
                  badge: 'Progressif',
                },
                {
                  id: 'modere' as ActivityLevel,
                  title: 'Actif',
                  sub: 'Sport ou marche active 2 à 3 fois par semaine.',
                  badge: 'Standard équilibré',
                },
                {
                  id: 'tres_actif' as ActivityLevel,
                  title: 'Très actif',
                  sub: 'Entraînements intensifs 4+ fois par semaine ou travail physique.',
                  badge: 'Dynamique',
                },
              ].map((act) => (
                <button
                  key={act.id}
                  onClick={() => {
                    setActivityLevel(act.id);
                    setStep(7);
                  }}
                  className={`tv-focus-target p-5 rounded-2xl border-2 text-left transition flex flex-col justify-between gap-2 ${
                    activityLevel === act.id
                      ? 'bg-emerald-500/15 border-emerald-400 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-lg text-white">{act.title}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700">
                        {act.badge}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 leading-relaxed">{act.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 7: Objectif principal */}
        {step === 7 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-black text-white">Votre objectif principal</h2>
              <p className="text-sm text-slate-400 mt-1">Quelle est votre priorité d'entraînement ?</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'tonifier' as Goal, title: 'Tonifier', sub: 'Gainage & fermeté' },
                { id: 'prise_muscle' as Goal, title: 'Muscle', sub: 'Force & volume' },
                { id: 'perte_poids' as Goal, title: 'Perte de poids', sub: 'Brûle-graisses' },
              ].map((g) => (
                <button
                  key={g.id}
                  onClick={() => {
                    setGoal(g.id);
                    setStep(8);
                  }}
                  className={`tv-focus-target p-5 rounded-2xl border-2 text-center transition ${
                    goal === g.id
                      ? 'bg-emerald-500/15 border-emerald-400 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-base text-white">{g.title}</div>
                  <div className="text-xs text-slate-400 mt-1">{g.sub}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 8: Limitations articulaires & Bilan adaptatif */}
        {step === 8 && (
          <div className="space-y-5">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-black text-white">Limitations physiques ou douleurs</h2>
              <p className="text-sm text-slate-400 mt-1">Cochez vos zones sensibles pour adapter automatiquement les exercices.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'genoux' as PhysicalLimitation, label: 'Genoux' },
                { id: 'dos' as PhysicalLimitation, label: 'Dos / Lombaires' },
                { id: 'epaules' as PhysicalLimitation, label: 'Épaules' },
                { id: 'poignets' as PhysicalLimitation, label: 'Poignets' },
              ].map((lim) => {
                const isChecked = limitations.includes(lim.id);
                return (
                  <button
                    key={lim.id}
                    onClick={() => toggleLimitation(lim.id)}
                    className={`tv-focus-target p-4 rounded-2xl border-2 text-left flex items-center justify-between transition ${
                      isChecked
                        ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                        : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <span className="font-bold text-sm">{lim.label}</span>
                    <div
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${
                        isChecked ? 'bg-amber-500 border-amber-500 text-slate-950 font-black' : 'border-slate-700'
                      }`}
                    >
                      {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Personalized starting variant assessment */}
            {hasLowImpactTrigger ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs sm:text-sm text-emerald-200 flex items-start gap-3">
                <Shield className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-300">Variante Basse Intensité & Protection Articulaire :</strong>
                  <p className="text-xs text-emerald-200/90 mt-0.5">
                    Sélectionnée automatiquement selon votre profil (IMC {bmi}, profil {activityLevel === 'sedentaire' ? 'sédentaire' : 'actif'}, morphologie {morphology}). Aucun impact au sol, appuis sécurisés (mur, chaise ou genoux).
                  </p>
                </div>
              </div>
            ) : isDynamicAthletic ? (
              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-xs sm:text-sm text-cyan-200 flex items-start gap-3">
                <Zap className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-cyan-300">Variante Dynamique & Tonique :</strong>
                  <p className="text-xs text-cyan-200/90 mt-0.5">
                    Votre profil sportif très actif et votre morphologie mésomorphe bénéficient d'enchaînements plus soutenus dès le départ.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Programme standard équilibré adapté à votre profil ({activityLevel}, IMC {bmi}).</span>
              </div>
            )}
          </div>
        )}

        {/* Step 9 (If First Profile): Ask to add second person */}
        {step === 9 && isFirstProfile && (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Profil de {name} enregistré ! 🎉</h2>
              <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto">
                Souhaitez-vous configurer la deuxième personne dès maintenant pour profiter du <strong>Mode Duo</strong> sur grand écran ?
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                id="onboarding-primary-btn"
                onClick={() => handleFinishProfile(true)}
                className="tv-focus-target w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black text-base hover:brightness-110 flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/20 cursor-pointer"
              >
                <Users className="w-5 h-5" />
                <span>Ajouter la 2e personne</span>
              </button>

              <button
                onClick={() => handleFinishProfile(false)}
                className="tv-focus-target w-full py-3.5 px-6 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 font-bold hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                Plus tard, commencer mes séances
              </button>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM ACTION BAR */}
      {step < (isFirstProfile ? 9 : 8) && (
        <div className="pt-4 border-t border-slate-900 flex items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            Navigation : <strong>Flèches / OK</strong> télécommande
          </div>

          <button
            id="onboarding-primary-btn"
            onClick={() => {
              if (step < 8) {
                setStep(step + 1);
              } else {
                if (isFirstProfile) {
                  setStep(9); // Ask to add second person
                } else {
                  handleFinishProfile(false);
                }
              }
            }}
            className="tv-focus-target py-4 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black text-base hover:brightness-110 flex items-center gap-2 shadow-xl shadow-emerald-500/20 cursor-pointer"
          >
            <span>{step === 8 && !isFirstProfile ? 'Terminer la configuration' : 'Continuer'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
