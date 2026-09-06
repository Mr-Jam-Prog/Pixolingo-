class SoundManager {
  private audioCtx: AudioContext | null = null;
  private soundEnabled = true;

  constructor() {
    // Lazy init audio context
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public toggleSound(enabled?: boolean) {
    if (typeof enabled === 'boolean') {
      this.soundEnabled = enabled;
    } else {
      this.soundEnabled = !this.soundEnabled;
    }
    return this.soundEnabled;
  }

  public isEnabled() {
    return this.soundEnabled;
  }

  public get isMutedState(): boolean {
    return !this.soundEnabled;
  }

  public toggleMute(): boolean {
    this.soundEnabled = !this.soundEnabled;
    return !this.soundEnabled;
  }

  public playWrong() {
    this.playError();
  }

  public speak(text: string, bcp47: string, rate: number = 0.95) {
    speakTargetLanguage(text, bcp47, rate);
  }

  // Pleasant ding chime with combo pitch progression
  public playSuccess(comboCount: number = 1) {
    if (!this.soundEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const pitchFactor = Math.min(1.5, 1 + (comboCount - 1) * 0.05);
    const baseNotes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio
    const notes = baseNotes.map((n) => n * pitchFactor);

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.05);

      gain.gain.setValueAtTime(0, now + index * 0.05);
      gain.gain.linearRampToValueAtTime(0.18, now + index * 0.05 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.05 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + index * 0.05);
      osc.stop(now + index * 0.05 + 0.4);
    });
  }

  // High-energy combo streak sound (3+, 5+, 10+ in a row)
  public playCombo(combo: number) {
    if (!this.soundEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const count = Math.min(6, Math.max(3, combo));
    const startFreq = 440; // A4

    for (let i = 0; i < count; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const freq = startFreq * Math.pow(1.12, i);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.06);

      gain.gain.setValueAtTime(0, now + i * 0.06);
      gain.gain.linearRampToValueAtTime(0.2, now + i * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.28);
    }
  }

  // Error buzz sound
  public playError() {
    if (!this.soundEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.3);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  // Pop sound for interactions
  public playPop() {
    if (!this.soundEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.08);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  // Gem clink sound
  public playGem() {
    if (!this.soundEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [987.77, 1318.51]; // B5, E6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0.15, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.22);
    });
  }

  // Level completion victory
  public playLevelUp() {
    if (!this.soundEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const chords = [
      [523.25, 659.25, 783.99],
      [659.25, 783.99, 1046.50],
      [783.99, 987.77, 1318.51],
      [1046.50, 1318.51, 1567.98, 2093.0],
    ];

    chords.forEach((chord, chordIdx) => {
      const startTime = now + chordIdx * 0.12;
      chord.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.12, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.5);
      });
    });
  }
}

export const soundManager = new SoundManager();

export function speakTargetLanguage(text: string, bcp47: string, rate: number = 0.95) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();

  // Clean prompt of any translation tags or parenthesis
  const cleanText = text.replace(/\(.*?\)/g, '').replace(/[🇫🇷🇪🇸🇬🇧🇩🇪🇮🇹🇯🇵]/g, '').trim();
  if (!cleanText) return;

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = bcp47;
  utterance.rate = rate;

  const voices = window.speechSynthesis.getVoices();
  const voice = voices.find((v) => v.lang.startsWith(bcp47.slice(0, 2))) || voices[0];
  if (voice) {
    utterance.voice = voice;
  }

  window.speechSynthesis.speak(utterance);
}

export function speakInstruction(text: string, rate: number = 0.9) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  // Strip emojis and punctuation that might confuse voice synthesis
  const cleanText = text.replace(/[\u{1F300}-\u{1FAFF}]/gu, '').replace(/[•·]/g, '').trim();
  if (!cleanText) return;
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'fr-FR';
  utterance.rate = rate;
  window.speechSynthesis.speak(utterance);
}
