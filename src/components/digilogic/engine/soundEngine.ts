/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Procedural Web Audio Synthesizer for DigiLogic Lab.
 * Generates realistic physical electronic laboratory sounds:
 * - SPDT mechanical toggle switch snaps
 * - Tactile membrane push-button clicks
 * - Jumper wire terminal & breadboard contact snaps
 * - IC DIP-14 breadboard socket seating
 * - Laboratory DC power supply & relay switching
 * - Quartz crystal logic clock pulses
 * - HP-style logic probe pitch tones (High 5V vs Low 0V)
 * - Circuit breaker overload & loop alarm buzzers
 * - Harmonious laboratory instrument test-pass chords
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private soundEnabled: boolean = true;
  private volume: number = 0.45; // 0 to 1
  private unlocked: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedEnabled = localStorage.getItem('digilogic_sound_enabled');
      if (savedEnabled !== null) {
        this.soundEnabled = savedEnabled === 'true';
      }
      const savedVol = localStorage.getItem('digilogic_sound_volume');
      if (savedVol !== null) {
        const v = parseFloat(savedVol);
        if (!isNaN(v) && v >= 0 && v <= 1) {
          this.volume = v;
        }
      }

      // Attach automatic user-interaction unlock listener
      this.attachUnlockListeners();
    }
  }

  /**
   * Attaches one-time event listeners on window to automatically unlock Web Audio
   * on the first touch, click, or keypress according to browser autoplay policies.
   */
  private attachUnlockListeners(): void {
    if (typeof window === 'undefined') return;

    const unlockHandler = () => {
      // Defer slightly so initial user gesture click paint occurs immediately
      setTimeout(() => {
        this.unlockAudio();
      }, 0);
      window.removeEventListener('pointerdown', unlockHandler);
      window.removeEventListener('touchstart', unlockHandler);
      window.removeEventListener('click', unlockHandler);
      window.removeEventListener('keydown', unlockHandler);
    };

    window.addEventListener('pointerdown', unlockHandler, { passive: true });
    window.addEventListener('touchstart', unlockHandler, { passive: true });
    window.addEventListener('click', unlockHandler, { passive: true });
    window.addEventListener('keydown', unlockHandler, { passive: true });
  }

  /**
   * Explicitly initializes and resumes AudioContext during user interaction
   */
  public unlockAudio(): void {
    const ctx = this.getOrInitContext();
    if (ctx) {
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      // Play a 1-sample silent buffer to unlock the audio hardware clock completely on iOS/Safari/Android
      try {
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
        this.unlocked = true;
      } catch {
        // Ignore
      }
    }
  }

  private getOrInitContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          this.ctx = new AudioContextClass();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      if (this.ctx && !this.masterGain) {
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    } catch {
      // AudioContext unavailable or blocked
    }
    return this.ctx;
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  public setEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('digilogic_sound_enabled', String(enabled));
    }
    if (enabled) {
      this.unlockAudio();
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('digilogic_sound_volume', String(this.volume));
    }
  }

  // =========================================================================
  // RELATABLE HARDWARE & LABORATORY SOUND EFFECTS
  // =========================================================================

  /**
   * 1. Authentic SPDT Mechanical Toggle Switch Snap.
   * Features a crisp metallic latch transient and spring bounce.
   * ON is slightly higher in pitch than OFF.
   */
  public playSwitch(on: boolean): void {
    if (!this.soundEnabled || this.volume <= 0) return;
    const ctx = this.getOrInitContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;

    // Layer A: Metallic contact friction & snap (Bandpass filtered noise burst)
    const snapOsc = ctx.createOscillator();
    const snapFilter = ctx.createBiquadFilter();
    const snapGain = ctx.createGain();

    snapFilter.type = 'bandpass';
    snapFilter.frequency.setValueAtTime(on ? 3400 : 2600, now);
    snapFilter.Q.setValueAtTime(4.0, now);

    snapOsc.type = 'triangle';
    snapOsc.frequency.setValueAtTime(on ? 1400 : 1000, now);
    snapOsc.frequency.exponentialRampToValueAtTime(on ? 3200 : 800, now + 0.025);

    snapGain.gain.setValueAtTime(0.001, now);
    snapGain.gain.linearRampToValueAtTime(0.4, now + 0.003);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    snapOsc.connect(snapFilter);
    snapFilter.connect(snapGain);
    snapGain.connect(this.masterGain);

    snapOsc.start(now);
    snapOsc.stop(now + 0.04);

    // Layer B: Spring latch mechanical resonance (Low-mid thump)
    const springOsc = ctx.createOscillator();
    const springGain = ctx.createGain();

    springOsc.type = 'sine';
    springOsc.frequency.setValueAtTime(on ? 420 : 340, now + 0.008);
    springOsc.frequency.exponentialRampToValueAtTime(120, now + 0.03);

    springGain.gain.setValueAtTime(0.001, now + 0.008);
    springGain.gain.linearRampToValueAtTime(0.25, now + 0.01);
    springGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    springOsc.connect(springGain);
    springGain.connect(this.masterGain);

    springOsc.start(now + 0.008);
    springOsc.stop(now + 0.04);
  }

  /**
   * 2. Tactile Membrane / Rubber Dome Push Button.
   * Dampened low-end press down + micro-click release.
   */
  public playButton(pressed: boolean): void {
    if (!this.soundEnabled || this.volume <= 0) return;
    const ctx = this.getOrInitContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(pressed ? 2200 : 3200, now);

    osc.type = 'triangle';
    const startFreq = pressed ? 520 : 1200;
    const endFreq = pressed ? 180 : 600;

    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.022);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.028);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.03);
  }

  /**
   * 3. Jumper Wire Terminal Plug / Breadboard Pin Insertion.
   * A metallic contact snap followed by a pleasant dual-harmonic continuity confirmation (880Hz / 1320Hz A5/E6).
   */
  public playWireSnap(): void {
    if (!this.soundEnabled || this.volume <= 0) return;
    const ctx = this.getOrInitContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;

    // Layer A: Metallic terminal contact click
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(2400, now);
    clickOsc.frequency.exponentialRampToValueAtTime(450, now + 0.015);

    clickGain.gain.setValueAtTime(0.001, now);
    clickGain.gain.linearRampToValueAtTime(0.35, now + 0.002);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    clickOsc.connect(clickGain);
    clickGain.connect(this.masterGain);
    clickOsc.start(now);
    clickOsc.stop(now + 0.025);

    // Layer B: Pleasant electrical continuity chime (A5 + E6 harmonic)
    const tones = [880, 1320]; // 880Hz (A5), 1320Hz (E6)
    tones.forEach((freq, idx) => {
      if (!ctx || !this.masterGain) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + 0.01 + idx * 0.015);

      gain.gain.setValueAtTime(0.001, now + 0.01 + idx * 0.015);
      gain.gain.linearRampToValueAtTime(0.18 / (idx + 1), now + 0.01 + idx * 0.015 + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.01 + idx * 0.015 + 0.12);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + 0.01 + idx * 0.015);
      osc.stop(now + 0.01 + idx * 0.015 + 0.14);
    });
  }

  /**
   * 4. Wire Snip / Terminal Unplug.
   * Sharp mechanical snip with fast damping.
   */
  public playWireCut(): void {
    if (!this.soundEnabled || this.volume <= 0) return;
    const ctx = this.getOrInitContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, now);
    filter.Q.setValueAtTime(3.0, now);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(900, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.035);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.045);
  }

  /**
   * 5. IC Chip / Breadboard Component Insertion.
   * Real dual-in-line IC package pins seating securely into breadboard socket.
   */
  public playGatePlace(): void {
    if (!this.soundEnabled || this.volume <= 0) return;
    const ctx = this.getOrInitContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;

    // Pin seating dual micro-click
    [0, 0.012].forEach((offset, idx) => {
      if (!ctx || !this.masterGain) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(idx === 0 ? 360 : 480, now + offset);
      osc.frequency.exponentialRampToValueAtTime(90, now + offset + 0.025);

      gain.gain.setValueAtTime(0.001, now + offset);
      gain.gain.linearRampToValueAtTime(0.3, now + offset + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.035);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + offset);
      osc.stop(now + offset + 0.04);
    });
  }

  /**
   * 6. Component Delete / Desolder Pump.
   * Solid mechanical desolder pump snap and suction.
   */
  public playDelete(): void {
    if (!this.soundEnabled || this.volume <= 0) return;
    const ctx = this.getOrInitContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(150, now + 0.06);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.065);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.32, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.075);
  }

  /**
   * 7. Laboratory DC Power Supply / Relay Solenoid Flip.
   * Real relay click + capacitive power rise/discharge sweep.
   */
  public playSimToggle(running: boolean): void {
    if (!this.soundEnabled || this.volume <= 0) return;
    const ctx = this.getOrInitContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;

    // Relay solenoid mechanical pop
    const relayOsc = ctx.createOscillator();
    const relayGain = ctx.createGain();
    relayOsc.type = 'triangle';
    relayOsc.frequency.setValueAtTime(1800, now);
    relayOsc.frequency.exponentialRampToValueAtTime(300, now + 0.02);

    relayGain.gain.setValueAtTime(0.001, now);
    relayGain.gain.linearRampToValueAtTime(0.35, now + 0.002);
    relayGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    relayOsc.connect(relayGain);
    relayGain.connect(this.masterGain);
    relayOsc.start(now);
    relayOsc.stop(now + 0.03);

    // Power sweep (capacitor charging vs discharging)
    const sweepOsc = ctx.createOscillator();
    const sweepGain = ctx.createGain();
    sweepOsc.type = 'sine';

    if (running) {
      sweepOsc.frequency.setValueAtTime(120, now + 0.01);
      sweepOsc.frequency.exponentialRampToValueAtTime(440, now + 0.1);
    } else {
      sweepOsc.frequency.setValueAtTime(440, now + 0.01);
      sweepOsc.frequency.exponentialRampToValueAtTime(100, now + 0.09);
    }

    sweepGain.gain.setValueAtTime(0.001, now + 0.01);
    sweepGain.gain.linearRampToValueAtTime(0.18, now + 0.025);
    sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

    sweepOsc.connect(sweepGain);
    sweepGain.connect(this.masterGain);
    sweepOsc.start(now + 0.01);
    sweepOsc.stop(now + 0.12);
  }

  /**
   * 8. Quartz Crystal Clock Generator / Logic Analyzer Tick.
   * Ultra-crisp, non-fatiguing 1.6kHz micro-tick.
   */
  public playClockStep(): void {
    if (!this.soundEnabled || this.volume <= 0) return;
    const ctx = this.getOrInitContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1600, now);
    osc.frequency.exponentialRampToValueAtTime(500, now + 0.012);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.02);
  }

  /**
   * 9. HP-Style Logic Probe Audio Tone.
   * High (5V): Clear 1200Hz crystal beep.
   * Low (0V): Warm 240Hz tone.
   */
  public playLogicProbe(isHigh: boolean): void {
    if (!this.soundEnabled || this.volume <= 0) return;
    const ctx = this.getOrInitContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(isHigh ? 1200 : 240, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.055);
  }

  /**
   * 10. Circuit Overload / Breaker Trip / Infinite Loop Alarm.
   * Dual square wave chatter (130Hz / 195Hz) mimicking real current overload buzzer.
   */
  public playError(): void {
    if (!this.soundEnabled || this.volume <= 0) return;
    const ctx = this.getOrInitContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const freqs = [130, 195];

    freqs.forEach((f) => {
      if (!ctx || !this.masterGain) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.13);
    });
  }

  /**
   * 11. Laboratory Test Passed / Challenge Cleared Chime.
   * Ascending C-Major harmonic chord sequence (C5 -> E5 -> G5 -> C6).
   */
  public playVictory(): void {
    if (!this.soundEnabled || this.volume <= 0) return;
    const ctx = this.getOrInitContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const melody = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

    melody.forEach((freq, i) => {
      if (!ctx || !this.masterGain) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const startTime = now + i * 0.085;
      const duration = i === 3 ? 0.4 : 0.18;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.28, startTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.02);
    });
  }

  /**
   * 12. Undo & Redo Tape Cue Blip
   */
  public playUndo(): void {
    if (!this.soundEnabled || this.volume <= 0) return;
    const ctx = this.getOrInitContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(750, now);
    osc.frequency.exponentialRampToValueAtTime(280, now + 0.045);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.055);
  }

  public playRedo(): void {
    if (!this.soundEnabled || this.volume <= 0) return;
    const ctx = this.getOrInitContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(750, now + 0.045);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.055);
  }
}

export const soundEngine = new SoundEngine();
