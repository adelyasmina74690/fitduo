import React from 'react';
import {
  ArrowRight,
  Dumbbell,
  Flame,
  Plus,
  Settings,
  Shield,
  Sparkles,
  Tv,
  User,
  UserPlus,
  Users,
} from 'lucide-react';
import { calculateBMI } from '../data/program';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useSpatialNavigation } from '../hooks/useSpatialNavigation';
import { UserProfile } from '../types';

interface ProfileSelectProps {
  profile1: UserProfile;
  profile2: UserProfile;
  onSelectProfile: (id: 'profile_1' | 'profile_2') => void;
  onStartDuo: () => void;
  onEditProfile: (id: 'profile_1' | 'profile_2') => void;
  onOpenSettings: () => void;
  onOpenLibrary: () => void;
}

export const ProfileSelect: React.FC<ProfileSelectProps> = ({
  profile1,
  profile2,
  onSelectProfile,
  onStartDuo,
  onEditProfile,
  onOpenSettings,
  onOpenLibrary,
}) => {
  const { isInstallable, install } = usePWAInstall();

  useSpatialNavigation({ autoFocusSelector: '#select-p1-btn' });

  const hasTwoProfiles = profile1.isConfigured && profile2.isConfigured;

  const renderConfiguredCard = (
    profile: UserProfile,
    buttonId: string,
    accentGradient: string,
    badgeColor: string
  ) => {
    const bmi = calculateBMI(profile.weightKg, profile.heightCm);
    const completedDays = profile.currentWeekDaysDone.filter(Boolean).length;

    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-2xl relative overflow-hidden group hover:border-slate-700 transition">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${accentGradient} p-0.5 shadow-lg shadow-emerald-500/10`}
              >
                <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center font-black text-2xl text-white">
                  {profile.name.charAt(0) || 'P'}
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight">{profile.name}</h3>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${badgeColor}`}>
                  Niveau {profile.currentLevel} / 10
                </span>
              </div>
            </div>

            <button
              onClick={() => onEditProfile(profile.id)}
              className="tv-focus-target text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 transition"
              title="Modifier le profil"
            >
              Modifier
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-center">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Semaine</div>
              <div className="text-base font-black text-white">{completedDays}/7 j</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-center">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Série</div>
              <div className="text-base font-black text-orange-400 flex items-center justify-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-current" />
                {profile.streakDays} j
              </div>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-center">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">IMC</div>
              <div className="text-base font-black text-cyan-400">{bmi}</div>
            </div>
          </div>

          {/* Limitations */}
          {profile.limitations.length > 0 ? (
            <div className="text-xs text-amber-300/90 flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl">
              <Shield className="w-3.5 h-3.5 shrink-0 text-amber-400" />
              <span>Adapté : {profile.limitations.join(', ')}</span>
            </div>
          ) : (
            <div className="text-xs text-slate-400 flex items-center gap-1.5 px-3 py-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Objectif : {profile.goal.replace('_', ' ')}</span>
            </div>
          )}
        </div>

        <div className="pt-6">
          <button
            id={buttonId}
            onClick={() => onSelectProfile(profile.id)}
            className="tv-focus-target w-full py-4 px-6 rounded-2xl font-black text-base bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center gap-2 border border-slate-700 transition cursor-pointer"
          >
            <span>S'entraîner en solo</span>
            <ArrowRight className="w-5 h-5 text-emerald-400" />
          </button>
        </div>
      </div>
    );
  };

  const renderAddProfile2Card = () => (
    <div className="bg-slate-900/40 border-2 border-dashed border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-4 hover:border-cyan-500/50 transition">
      <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
        <UserPlus className="w-8 h-8" />
      </div>
      <div>
        <h3 className="text-xl font-black text-white">Ajouter la 2e personne</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
          Configurez un second profil pour débloquer le <strong>Mode Duo</strong> synchronisé sur grand écran !
        </p>
      </div>
      <button
        id="add-p2-btn"
        onClick={() => onEditProfile('profile_2')}
        className="tv-focus-target py-3 px-6 rounded-2xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 font-bold text-sm hover:bg-cyan-500/25 flex items-center gap-2 transition cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        <span>Configurer le Profil 2</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-10 max-w-6xl mx-auto pb-16">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
              FIT<span className="text-cyan-400">DUO</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Fitness & Musculation Maison • 5 à 10 min par jour • 100% Hors-ligne
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isInstallable && (
            <button
              onClick={install}
              className="tv-focus-target py-2 px-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold hover:bg-emerald-500/30 transition flex items-center gap-1.5"
            >
              <span>Installer PWA</span>
            </button>
          )}

          <button
            onClick={onOpenLibrary}
            className="tv-focus-target p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold"
            title="Bibliothèque d'exercices"
          >
            <Dumbbell className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">50 Exercices</span>
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

      {/* CENTER: MODE DUO HIGHLIGHT (Shown ONLY if 2 profiles are configured) & 2 PROFILE CARDS */}
      <div className="my-auto space-y-6">
        {/* Mode Duo is strictly hidden until 2 profiles exist! */}
        {hasTwoProfiles && (
          <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-cyan-950/60 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                  <Users className="w-3.5 h-3.5" />
                  Spécial Décodeur TV & Salon
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Mode « Duo » : {profile1.name} & {profile2.name}
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Entraînez-vous ensemble sur le même écran ! Chronomètre partagé et variantes adaptées au niveau de chacun.
                </p>
              </div>

              <button
                onClick={onStartDuo}
                className="tv-focus-target py-4 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black text-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-cyan-500/25 shrink-0 cursor-pointer"
              >
                <Users className="w-6 h-6" />
                <span>Lancer en Duo</span>
              </button>
            </div>
          </div>
        )}

        {/* 2 PROFILES CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderConfiguredCard(
            profile1,
            'select-p1-btn',
            'from-emerald-500 to-teal-500',
            'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
          )}
          {profile2.isConfigured
            ? renderConfiguredCard(
                profile2,
                'select-p2-btn',
                'from-cyan-500 to-blue-500',
                'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
              )
            : renderAddProfile2Card()}
        </div>
      </div>

      {/* FOOTER */}
      <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Tv className="w-4 h-4 text-cyan-400" />
          <span>
            Navigation télécommande : <strong>Flèches</strong> naviguer • <strong>OK</strong> valider • <strong>Retour</strong> fermer
          </span>
        </div>
        <div>FitDuo • 100% Hors-ligne • Sans compte</div>
      </div>
    </div>
  );
};
