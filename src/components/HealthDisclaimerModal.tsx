import React from 'react';
import { AlertTriangle, CheckCircle, ShieldCheck } from 'lucide-react';
import { useTVNavigation } from '../hooks/useTVNavigation';

interface HealthDisclaimerModalProps {
  onAccept: () => void;
}

export const HealthDisclaimerModal: React.FC<HealthDisclaimerModalProps> = ({ onAccept }) => {
  useTVNavigation({ autoFocusSelector: '#accept-disclaimer-btn' });

  return (
    <div
      data-modal-active="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-5 text-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Avertissement Médical & Santé
            </h2>
            <p className="text-sm text-slate-400">
              Bienvenue sur FitDuo. Votre sécurité physique est notre priorité absolue.
            </p>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-3 text-sm text-slate-300 leading-relaxed max-h-[50vh] overflow-y-auto">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <p>
              <strong>Avis médical préalable :</strong> Consultez un médecin avant d'entreprendre ce programme, en particulier en cas de pathologie cardiovasculaire, respiratoire, articulaire ou de grossesse.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <p>
              <strong>Écoute du corps & douleur :</strong> Aucun exercice ne doit provoquer de douleur articulaire aiguë. Si une gêne survient, stoppez immédiatement ou adoptez la variante douce proposée.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <p>
              <strong>Adaptation automatique :</strong> Renseignez précisément vos limitations physiques (genoux, dos, épaules, poignets) pour que FitDuo adapte automatiquement les mouvements sans impact.
            </p>
          </div>
        </div>

        <button
          id="accept-disclaimer-btn"
          onClick={onAccept}
          className="tv-focus-target w-full py-4 px-6 rounded-2xl font-bold text-base sm:text-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
        >
          <CheckCircle className="w-6 h-6" />
          J'ai compris, commencer mon entraînement
        </button>

        <p className="text-center text-xs text-slate-500">
          En continuant, vous certifiez être en condition physique d'effectuer des exercices de fitness au poids de corps.
        </p>
      </div>
    </div>
  );
};
