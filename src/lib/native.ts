/**
 * Pont natif Android (Capacitor).
 * Sur le web, toutes ces fonctions retombent sur les API navigateur.
 * Dans l'APK (téléphone + Android TV), elles utilisent les plugins natifs :
 *  - voix du coach : TextToSpeech (la Web Speech API n'existe pas dans la WebView Android)
 *  - écran allumé : KeepAwake
 *  - touche Retour de la télécommande / du téléphone : App.backButton
 *  - liens de playlist : AppLauncher (ouvre Spotify / Deezer / YouTube Music)
 */
import { Capacitor, registerPlugin } from '@capacitor/core';
import { App } from '@capacitor/app';
import { AppLauncher } from '@capacitor/app-launcher';
import { KeepAwake } from '@capacitor-community/keep-awake';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

export const isNativeApp = (): boolean => Capacitor.isNativePlatform();

/* ---------- Voix du coach ---------- */

export async function nativeSpeak(text: string, rate = 1.05): Promise<void> {
  await TextToSpeech.speak({
    text,
    lang: 'fr-FR',
    rate,
    pitch: 1.0,
    volume: 1.0,
    category: 'playback',
    queueStrategy: 0, // 0 = remplace la phrase en cours
  });
}

export async function nativeStopSpeaking(): Promise<void> {
  try {
    await TextToSpeech.stop();
  } catch {
    /* rien à arrêter */
  }
}

/* ---------- Écran allumé pendant la séance ---------- */

export async function keepScreenOn(): Promise<void> {
  if (!isNativeApp()) return;
  try {
    await KeepAwake.keepAwake();
  } catch (err) {
    console.warn('KeepAwake error:', err);
  }
}

export async function allowScreenSleep(): Promise<void> {
  if (!isNativeApp()) return;
  try {
    await KeepAwake.allowSleep();
  } catch {
    /* ignore */
  }
}

/* ---------- Liens externes (playlist) ---------- */

export async function openExternalUrl(url: string): Promise<void> {
  if (!isNativeApp()) {
    window.open(url, '_blank');
    return;
  }
  try {
    await AppLauncher.openUrl({ url });
  } catch {
    window.open(url, '_blank');
  }
}

/* ---------- Touche Retour ---------- */

/**
 * La touche Retour Android est convertie en touche « Escape » pour que la
 * navigation télécommande existante (useSpatialNavigation) la gère.
 * Si aucun écran ne la consomme (écran d'accueil), l'app passe en arrière-plan
 * au lieu de se fermer brutalement.
 */
export function initNativeBackButton(): void {
  if (!isNativeApp()) return;
  App.addListener('backButton', () => {
    const evt = new KeyboardEvent('keydown', {
      key: 'Escape',
      code: 'Escape',
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(evt);
    if (!evt.defaultPrevented) {
      App.minimizeApp().catch(() => App.exitApp());
    }
  });
}

/* ---------- Détection Android TV ---------- */

interface TvInfoPlugin {
  getInfo(): Promise<{ isTv: boolean; densityDpi: number }>;
}
const TvInfo = registerPlugin<TvInfoPlugin>('TvInfo');

/**
 * Vrai sur un décodeur / téléviseur Android TV (plugin natif TvInfo).
 * Forçable pour les tests web avec `?tv=1` (et désactivable avec `?tv=0`).
 */
export async function detectTvMode(): Promise<boolean> {
  try {
    const forced = new URLSearchParams(window.location.search).get('tv');
    if (forced === '1') return true;
    if (forced === '0') return false;
  } catch {
    /* ignore */
  }
  if (!isNativeApp()) return false;
  try {
    const info = await Promise.race([
      TvInfo.getInfo(),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500)),
    ]);
    return !!info.isTv;
  } catch (err) {
    console.warn('Détection TV impossible :', err);
    return false;
  }
}

export const isTvMode = (): boolean => document.documentElement.classList.contains('tv-mode');

/* ---------- Initialisation ---------- */

export async function initNativeShell(): Promise<void> {
  if (isNativeApp()) {
    document.documentElement.classList.add('native-app');
    initNativeBackButton();
  }
  if (await detectTvMode()) {
    document.documentElement.classList.add('tv-mode');
  }
}
