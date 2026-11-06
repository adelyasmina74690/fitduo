import { MusicVibe } from '../types';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isMusicPlaying = false;
  private currentVibe: MusicVibe = 'energie';
  private timerId: number | null = null;
  private stepCounter = 0;
  private isDucked = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // ==========================================
  // SFX SOUNDS (Beeps, Chimes, Countdown)
  // ==========================================

  public playCountdownBeep(isFinal = false) {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = isFinal ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(isFinal ? 880 : 440, now); // A5 for final, A4 for 3-2-1
      if (isFinal) {
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.35); // pleasant chime rise
      }

      gain.gain.setValueAtTime(isFinal ? 0.4 : 0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (isFinal ? 0.45 : 0.15));

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + (isFinal ? 0.45 : 0.16));
    } catch (e) {
      console.warn('Audio playCountdownBeep error:', e);
    }
  }

  public playFinishChime() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;

      // Play major triad arpeggio: C5 -> E5 -> G5 -> C6
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, i) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = this.ctx.currentTime + i * 0.1;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(startTime);
        osc.stop(startTime + 0.65);
      });
    } catch (e) {
      console.warn('Audio playFinishChime error:', e);
    }
  }

  // ==========================================
  // PROCEDURAL MUSIC ENGINE (3 Vibes)
  // ==========================================

  public setVolume(vol: number) {
    if (this.musicGain && this.ctx) {
      const clamped = Math.max(0, Math.min(1, vol));
      this.musicGain.gain.setValueAtTime(this.isDucked ? clamped * 0.25 : clamped, this.ctx.currentTime);
    }
  }

  public duckMusic(duck: boolean) {
    this.isDucked = duck;
    if (this.musicGain && this.ctx) {
      const now = this.ctx.currentTime;
      const targetGain = duck ? 0.12 : 0.5;
      this.musicGain.gain.cancelScheduledValues(now);
      this.musicGain.gain.linearRampToValueAtTime(targetGain, now + 0.3);
    }
  }

  public setVibe(vibe: MusicVibe) {
    this.currentVibe = vibe;
  }

  public startMusic(vibe?: MusicVibe, volume = 0.5) {
    this.initContext();
    if (vibe) this.currentVibe = vibe;
    this.setVolume(volume);

    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;
    this.stepCounter = 0;

    // Tempo configuration per vibe
    // energie: 124 BPM (120ms per 16th note)
    // focus: 110 BPM (136ms per 16th note)
    // chill: 84 BPM (178ms per 16th note)
    const intervalMs =
      this.currentVibe === 'energie' ? 125 : this.currentVibe === 'focus' ? 140 : 180;

    this.timerId = window.setInterval(() => {
      this.playStep();
      this.stepCounter = (this.stepCounter + 1) % 16;
    }, intervalMs);
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private playStep() {
    if (!this.ctx || !this.musicGain || this.ctx.state === 'suspended') return;

    const step = this.stepCounter;
    const now = this.ctx.currentTime;

    switch (this.currentVibe) {
      case 'energie':
        this.playEnergieBeat(step, now);
        break;
      case 'chill':
        this.playChillBeat(step, now);
        break;
      case 'focus':
        this.playFocusBeat(step, now);
        break;
    }
  }

  // --- ÉNERGIE ATMOSPHERE (Dance / Synthwave Kick + Offbeat Hi-hat + Bass Arp) ---
  private playEnergieBeat(step: number, now: number) {
    if (!this.ctx || !this.musicGain) return;

    // 4-on-the-floor Kick (beats 0, 4, 8, 12)
    if (step % 4 === 0) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(38, now + 0.12);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.start(now);
      osc.stop(now + 0.16);
    }

    // Hi-hat on offbeats (2, 6, 10, 14)
    if (step % 4 === 2) {
      this.playSynthHiHat(now, 0.18, 0.04);
    }

    // Rolling bassline arpeggio (Minor scale F# - A - B - C#)
    const bassNotes = [92.5, 92.5, 110.0, 123.47, 92.5, 138.59, 110.0, 92.5];
    const freq = bassNotes[step % bassNotes.length];
    if (step % 2 === 0) {
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650, now);
      filter.frequency.exponentialRampToValueAtTime(200, now + 0.1);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(now);
      osc.stop(now + 0.13);
    }
  }

  // --- CHILL ATMOSPHERE (Lo-Fi Jazzy warm Rhodes chords & soft groove) ---
  private playChillBeat(step: number, now: number) {
    if (!this.ctx || !this.musicGain) return;

    // Soft thud kick (steps 0, 6, 10)
    if (step === 0 || step === 6 || step === 10) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(85, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.2);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.start(now);
      osc.stop(now + 0.26);
    }

    // Soft rim / tap on steps 4, 12
    if (step === 4 || step === 12) {
      this.playSynthHiHat(now, 0.12, 0.08);
    }

    // Warm chords progression (Ebmaj7 -> Cm7)
    if (step === 0 || step === 8) {
      const chord = step === 0 ? [311.13, 392.0, 466.16, 587.33] : [261.63, 311.13, 392.0, 466.16];
      chord.forEach((freq) => {
        if (!this.ctx || !this.musicGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        osc.connect(gain);
        gain.connect(this.musicGain);
        osc.start(now);
        osc.stop(now + 1.25);
      });
    }
  }

  // --- FOCUS ATMOSPHERE (Pulsing Ambient Trance / Hypnotic Sine Pulse) ---
  private playFocusBeat(step: number, now: number) {
    if (!this.ctx || !this.musicGain) return;

    // Steady rhythmic pulse every step with alternating frequency
    const focusPitches = [130.81, 164.81, 196.0, 261.63, 196.0, 164.81];
    const pitch = focusPitches[step % focusPitches.length];

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, now);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(now);
    osc.stop(now + 0.26);

    // Deep sub drone trigger on step 0
    if (step === 0) {
      const sub = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(65.41, now); // C2 sub
      subGain.gain.setValueAtTime(0.2, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);
      sub.connect(subGain);
      subGain.connect(this.musicGain);
      sub.start(now);
      sub.stop(now + 2.05);
    }
  }

  private playSynthHiHat(now: number, level: number, duration: number) {
    if (!this.ctx || !this.musicGain) return;
    // Generate filtered noise burst
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(level, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    noise.start(now);
    noise.stop(now + duration + 0.01);
  }
}

export const soundEngine = new SoundEngine();
