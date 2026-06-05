/**
 * Cute Chiptune Synthesizer using Web Audio API
 */
class CuteAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private activeOscillators: { osc: OscillatorNode; gain: GainNode }[] = [];
  private musicInterval: any = null;

  constructor() {
    // Lazy initialize on first interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopMusic();
    }
    return this.isMuted;
  }

  public getMutedState(): boolean {
    return this.isMuted;
  }

  // Synthesize sound effects
  public playCollectStar() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    this.playTone(523.25, 'sine', now, 0.08, 0.1); // C5
    this.playTone(659.25, 'sine', now + 0.08, 0.08, 0.1); // E5
    this.playTone(783.99, 'sine', now + 0.16, 0.15, 0.12); // G5
    this.playTone(1046.50, 'sine', now + 0.24, 0.25, 0.15); // C6
  }

  public playCollectBook() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    this.playTone(440.00, 'triangle', now, 0.1, 0.15); // A4
    this.playTone(554.37, 'triangle', now + 0.06, 0.1, 0.15); // C#5
    this.playTone(659.25, 'triangle', now + 0.12, 0.25, 0.15); // E5
  }

  public playCollectCoffee() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    this.playTone(392.00, 'triangle', now, 0.08, 0.15); // G4
    this.playTone(587.33, 'triangle', now + 0.08, 0.08, 0.15); // D5
    this.playTone(783.99, 'triangle', now + 0.16, 0.2, 0.15); // G5
  }

  public playGetHit() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Slur slide-down effect
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(330, now); // E4
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.25); // A2

    gainNode.gain.setValueAtTime(0.12, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  public playShieldBreak() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const noiseGain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.linearRampToValueAtTime(220, now + 0.3);

    noiseGain.gain.setValueAtTime(0.1, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.32);
  }

  public playSupportClear() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Majestic spell chime
    for (let i = 0; i < 6; i++) {
      const pitch = 523.25 * Math.pow(1.25, i); // ascending major notes
      this.playTone(pitch, 'sine', now + i * 0.06, 0.2, 0.08);
    }
  }

  public playTeddyBear() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Sweet xylophone sound
    this.playTone(523.25, 'triangle', now, 0.12, 0.15); // C5
    this.playTone(587.33, 'triangle', now + 0.1, 0.12, 0.15); // D5
    this.playTone(659.25, 'triangle', now + 0.2, 0.12, 0.15); // E5
    this.playTone(783.99, 'triangle', now + 0.3, 0.3, 0.15); // G5
  }

  public playTypewriter() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    // Short wooden/plastic tick sound
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.linearRampToValueAtTime(400, now + 0.03);

    gainNode.gain.setValueAtTime(0.04, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  public playBossSpawn() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Dramatic descending synth sweep
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';

    osc1.frequency.setValueAtTime(220, now);
    osc1.frequency.linearRampToValueAtTime(80, now + 1.2);

    osc2.frequency.setValueAtTime(225, now);
    osc2.frequency.linearRampToValueAtTime(82, now + 1.2);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 1.2);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1.25);
    osc2.stop(now + 1.25);
  }

  // Play generic simple note helper
  private playTone(freq: number, type: OscillatorType, start: number, duration: number, volume: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);

    gainNode.gain.setValueAtTime(volume, start);
    gainNode.gain.exponentialRampToValueAtTime(0.001, start + duration);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start(start);
    osc.stop(start + duration + 0.05);
  }

  // Loop a gentle, beautiful lo-fi soundtrack in background
  public startMusic(mode: 'game' | 'boss' | 'victory') {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    this.stopMusic();

    let step = 0;
    const tempo = 150; // milliseconds per beat

    // Pure audio synth step sequencing sequence
    this.musicInterval = setInterval(() => {
      if (this.isMuted || !this.ctx) return;
      const now = this.ctx.currentTime;

      if (mode === 'game') {
        // Cute pentatonic scale chill chord progression
        // C Major: C (261.63), D (293.66), E (329.63), G (392.00), A (440.00), C (523.25)
        const notes = [261.63, 329.63, 392.00, 523.25, 440.00, 392.00, 329.63, 293.66];
        const bassLine = [130.81, 130.81, 196.00, 196.00, 146.83, 146.83, 164.81, 164.81];

        // 16 step sequence
        const currentBeat = step % 8;
        const currentBar = Math.floor(step / 8) % 4;

        // Play gentle bass note
        if (currentBeat === 0 || currentBeat === 4) {
          const bassNote = bassLine[currentBar * 2 + (currentBeat === 4 ? 1 : 0)];
          this.playTone(bassNote, 'triangle', now, 0.45, 0.08);
        }

        // Play gentle melody note on offbeats
        if (currentBeat % 3 === 0) {
          const noteIndex = (currentBeat * 5 + currentBar * 3) % notes.length;
          const rootNote = notes[noteIndex];
          this.playTone(rootNote, 'sine', now, 0.18, 0.04);
        }

      } else if (mode === 'boss') {
        // Intense rhythmic sequence
        const bassLine = [82.41, 82.41, 110.00, 110.00, 98.00, 82.41, 123.47, 82.41]; // E bass, slow and scary
        const melody = [329.63, 349.23, 392.00, 349.23, 329.63, 293.66, 329.63, 246.94]; // Intense theme

        const currentBeat = step % 8;

        // Thumping bass
        if (currentBeat % 2 === 0) {
          this.playTone(bassLine[currentBeat], 'sawtooth', now, 0.15, 0.05);
        }

        // Fast melody alert
        if (currentBeat % 4 === 1 || currentBeat % 4 === 3) {
          this.playTone(melody[currentBeat], 'triangle', now, 0.1, 0.04);
        }

      } else if (mode === 'victory') {
        // Sweet love song background melody
        // C Major romantic melody: E (329), G (392), C (523), B (493), A (440), G (392)
        const melody = [329.63, 392.00, 523.25, 493.88, 440.00, 392.00, 349.23, 392.00,
                        392.00, 440.00, 523.25, 587.33, 523.25, 493.88, 523.25, 523.25];
        const currentBeat = step % 16;

        // Arpeggiate
        if (currentBeat % 2 === 0) {
          const noteFreq = melody[currentBeat];
          this.playTone(noteFreq, 'sine', now, 0.28, 0.06);
          // Add a lower third harmony
          this.playTone(noteFreq * 0.75, 'sine', now, 0.28, 0.03);
        }

        // Beautiful bass block
        if (currentBeat % 4 === 0) {
          const bassFreqs = [130.81, 174.61, 196.00, 130.81]; // C -> F -> G -> C
          this.playTone(bassFreqs[Math.floor(currentBeat / 4)], 'triangle', now, 0.5, 0.07);
        }
      }

      step++;
    }, tempo);
  }

  public stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const soundEngine = new CuteAudioEngine();
