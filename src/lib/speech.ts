import { soundEngine } from './audio';

class SpeechCoach {
  private enabled = true;
  private voice: SpeechSynthesisVoice | null = null;
  private isSpeaking = false;

  constructor() {
    this.initVoice();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.initVoice();
      };
    }
  }

  private initVoice() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    // Find best French voice
    const frVoice =
      voices.find((v) => v.lang.startsWith('fr') && (v.name.includes('Google') || v.name.includes('Natural') || v.default)) ||
      voices.find((v) => v.lang.startsWith('fr')) ||
      null;
    this.voice = frVoice;
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    if (!val && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      soundEngine.duckMusic(false);
    }
  }

  public speak(text: string, priority: 'normal' | 'urgent' = 'normal') {
    if (!this.enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    if (priority === 'urgent') {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 1.05; // Slightly athletic energetic pace
    utterance.pitch = 1.0;

    if (this.voice) {
      utterance.voice = this.voice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      soundEngine.duckMusic(true);
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      soundEngine.duckMusic(false);
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      soundEngine.duckMusic(false);
    };

    window.speechSynthesis.speak(utterance);
  }

  public cancel() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
      soundEngine.duckMusic(false);
    }
  }
}

export const speechCoach = new SpeechCoach();
