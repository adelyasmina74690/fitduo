import React, { useRef, useState } from 'react';
import {
  AlertTriangle,
  Check,
  Download,
  ExternalLink,
  FileJson,
  FlaskConical,
  HelpCircle,
  Minus,
  Music,
  Plus,
  RotateCcw,
  Sliders,
  Trash2,
  Tv,
  Upload,
  UserMinus,
  Volume2,
  X,
} from 'lucide-react';
import { useSpatialNavigation } from '../hooks/useSpatialNavigation';
import { deleteProfile2, exportAllData, importAllData, resetAllData, simulateWeekCompleted } from '../lib/storage';
import { AppSettings, MusicVibe, UserProfile } from '../types';
import { openExternalUrl } from '../lib/native';

interface SettingsModalProps {
  settings: AppSettings;
  activeProfile: UserProfile;
  profile2: UserProfile;
  onUpdateSettings: (s: AppSettings) => void;
  onEditProfile: () => void;
  onShowDisclaimer: () => void;
  onClose: () => void;
  onReloadAll: () => void;
  onSimulateWeek: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  activeProfile,
  profile2,
  onUpdateSettings,
  onEditProfile,
  onShowDisclaimer,
  onClose,
  onReloadAll,
  onSimulateWeek,
}) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [showConfirmDeleteP2, setShowConfirmDeleteP2] = useState(false);
  const [externalUrl, setExternalUrl] = useState(settings.externalMusicUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useSpatialNavigation({
    autoFocusSelector: '#close-settings-btn',
    onBack: onClose,
    isModal: true,
  });

  const handleExport = () => {
    const jsonStr = exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitduo-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importAllData(content);
      if (success) {
        setImportStatus('Données importées avec succès !');
        setTimeout(() => onReloadAll(), 800);
      } else {
        setImportStatus('Erreur : fichier JSON invalide.');
      }
    };
    reader.readAsText(file);
  };

  const handleOpenExternalMusic = () => {
    const url = externalUrl.trim();
    if (url) {
      onUpdateSettings({ ...settings, externalMusicUrl: url });
      openExternalUrl(url);
    }
  };

  const handleResetConfirmed = () => {
    resetAllData();
    setShowConfirmReset(false);
    onReloadAll();
  };

  const handleDeleteProfile2Confirmed = () => {
    deleteProfile2();
    setShowConfirmDeleteP2(false);
    onReloadAll();
  };

  return (
    <div
      data-modal-active="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-150"
    >
      <div className="w-full max-w-xl max-h-[90vh] bg-slate-900 border-2 border-slate-800 rounded-3xl p-5 sm:p-7 flex flex-col text-slate-100 shadow-2xl overflow-y-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Réglages FitDuo</h2>
              <p className="text-xs text-slate-400">Audio, TV, sauvegarde & outils</p>
            </div>
          </div>
          <button
            id="close-settings-btn"
            onClick={onClose}
            className="tv-focus-target p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            title="Fermer (Échap)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Profile Shortcut */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              {activeProfile.name.charAt(0) || 'P'}
            </div>
            <div>
              <div className="font-bold text-sm text-white">{activeProfile.name || 'Profil'}</div>
              <div className="text-xs text-slate-400">
                {activeProfile.heightCm} cm • {activeProfile.weightKg} kg • Niveau {activeProfile.currentLevel}
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              onClose();
              onEditProfile();
            }}
            className="tv-focus-target px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition"
          >
            Modifier
          </button>
        </div>

        {/* 2. Volume Musique & Coach Vocal */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-emerald-400" />
            Volumes Sonores (Télécommande & Sliders)
          </h3>

          {/* Volume Musique */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-white">Volume de la musique</span>
              <span className="text-cyan-400 font-bold">{Math.round(settings.musicVolume * 100)}%</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  onUpdateSettings({
                    ...settings,
                    musicVolume: Math.max(0, Math.round((settings.musicVolume - 0.1) * 10) / 10),
                  })
                }
                className="tv-focus-target p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.musicVolume}
                onChange={(e) => onUpdateSettings({ ...settings, musicVolume: Number(e.target.value) })}
                className="tv-focus-target w-full accent-cyan-400 rounded-lg cursor-pointer"
              />
              <button
                onClick={() =>
                  onUpdateSettings({
                    ...settings,
                    musicVolume: Math.min(1, Math.round((settings.musicVolume + 0.1) * 10) / 10),
                  })
                }
                className="tv-focus-target p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Volume Coach Vocal */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-white">Volume du Coach vocal français</span>
              <span className="text-emerald-400 font-bold">
                {Math.round(settings.voiceCoachVolume * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  onUpdateSettings({
                    ...settings,
                    voiceCoachVolume: Math.max(0, Math.round((settings.voiceCoachVolume - 0.1) * 10) / 10),
                  })
                }
                className="tv-focus-target p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.voiceCoachVolume}
                onChange={(e) => onUpdateSettings({ ...settings, voiceCoachVolume: Number(e.target.value) })}
                className="tv-focus-target w-full accent-emerald-400 rounded-lg cursor-pointer"
              />
              <button
                onClick={() =>
                  onUpdateSettings({
                    ...settings,
                    voiceCoachVolume: Math.min(1, Math.round((settings.voiceCoachVolume + 0.1) * 10) / 10),
                  })
                }
                className="tv-focus-target p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 3. Option « Ma musique » */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Music className="w-4 h-4 text-cyan-400" />
            Option « Ma Musique » (Playlist Personnelle)
          </div>
          <p className="text-xs text-slate-400">
            Collez le lien de votre playlist (Spotify, Deezer, YouTube Music) pour l'ouvrir d'un clic.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="https://open.spotify.com/playlist/..."
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              className="tv-focus-target flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
            <button
              onClick={handleOpenExternalMusic}
              className="tv-focus-target px-4 py-2 rounded-xl bg-cyan-500 font-bold text-slate-950 text-xs hover:bg-cyan-400 flex items-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Ouvrir
            </button>
          </div>
        </div>

        {/* 4. Export / Import JSON */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <FileJson className="w-4 h-4 text-purple-400" />
            Sauvegarde & Restauration (JSON)
          </h3>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="tv-focus-target flex-1 py-3 px-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-bold text-white flex items-center justify-center gap-2 transition"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              Exporter (JSON)
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="tv-focus-target flex-1 py-3 px-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-bold text-white flex items-center justify-center gap-2 transition"
            >
              <Upload className="w-4 h-4 text-cyan-400" />
              Importer (JSON)
            </button>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </div>
          {importStatus && <p className="text-xs text-center font-bold text-emerald-400">{importStatus}</p>}
        </div>

        {/* 5. Section Outils de test (Requirement 8) */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <FlaskConical className="w-4 h-4" />
            Outils de Test & Démonstration
          </div>
          <p className="text-xs text-slate-400">
            Simule instantanément la réussite des 7 séances de la semaine pour tester l'écran de montée de niveau.
          </p>
          <button
            onClick={() => {
              onSimulateWeek();
              onClose();
            }}
            className="tv-focus-target w-full py-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-xs hover:bg-amber-500/25 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Simuler la semaine terminée (7/7 séances)
          </button>
        </div>

        {/* 6. Gestion & Suppression profil 2 */}
        {profile2.isConfigured && (
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => setShowConfirmDeleteP2(true)}
              className="tv-focus-target w-full py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-red-400 font-bold text-xs hover:bg-red-500/10 hover:border-red-500/30 flex items-center justify-center gap-2"
            >
              <UserMinus className="w-4 h-4" />
              Supprimer le Profil 2 ({profile2.name})
            </button>
          </div>
        )}

        {/* 7. Réinitialisation complète */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onShowDisclaimer}
            className="tv-focus-target text-xs text-slate-400 hover:text-white flex items-center gap-1.5"
          >
            <HelpCircle className="w-4 h-4" />
            Avertissement santé
          </button>

          <button
            onClick={() => setShowConfirmReset(true)}
            className="tv-focus-target text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5 font-bold"
          >
            <Trash2 className="w-4 h-4" />
            Réinitialiser l'application
          </button>
        </div>

        {/* CONFIRM RESET MODAL */}
        {showConfirmReset && (
          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/30 space-y-3">
            <p className="text-xs text-red-200">
              Êtes-vous sûr de vouloir réinitialiser toutes les données ? Cette action effacera vos profils et historiques.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="tv-focus-target flex-1 py-2 rounded-xl bg-slate-800 text-xs font-bold text-white"
              >
                Annuler
              </button>
              <button
                onClick={handleResetConfirmed}
                className="tv-focus-target flex-1 py-2 rounded-xl bg-red-500 text-xs font-bold text-white hover:bg-red-600"
              >
                Confirmer la réinitialisation
              </button>
            </div>
          </div>
        )}

        {/* CONFIRM DELETE P2 MODAL */}
        {showConfirmDeleteP2 && (
          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/30 space-y-3">
            <p className="text-xs text-red-200">
              Supprimer définitivement le profil de {profile2.name} ?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirmDeleteP2(false)}
                className="tv-focus-target flex-1 py-2 rounded-xl bg-slate-800 text-xs font-bold text-white"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteProfile2Confirmed}
                className="tv-focus-target flex-1 py-2 rounded-xl bg-red-500 text-xs font-bold text-white hover:bg-red-600"
              >
                Supprimer {profile2.name}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
