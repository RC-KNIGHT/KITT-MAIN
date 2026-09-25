/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Haptic Vibration Feedback Engine for touchscreens, tablets, and mobile devices.
 * Uses the Web Vibration API with capability detection, error boundaries, and graceful fallbacks.
 */

class HapticsEngine {
  private hapticsEnabled: boolean = true;
  private isSupported: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.checkSupport();
      const saved = localStorage.getItem('digilogic_haptics_enabled');
      if (saved !== null) {
        this.hapticsEnabled = saved === 'true';
      }
    }
  }

  private checkSupport(): boolean {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      this.isSupported = false;
      return false;
    }
    this.isSupported = 'vibrate' in navigator && typeof navigator.vibrate === 'function';
    return this.isSupported;
  }

  public isEnabled(): boolean {
    return this.hapticsEnabled;
  }

  public isAvailable(): boolean {
    return this.checkSupport();
  }

  public setEnabled(enabled: boolean): void {
    this.hapticsEnabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('digilogic_haptics_enabled', String(enabled));
    }
  }

  public trigger(pattern: number | number[]): void {
    if (!this.hapticsEnabled) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(pattern);
      }
    } catch {
      // Ignore vibration permissions or iframe restrictions
    }
  }

  /** Subtle 8ms micro-tap (Switches, buttons, keypad presses) */
  public light(): void {
    this.trigger(8);
  }

  /** Medium 18ms crisp pulse (Component drop, wire connection snap) */
  public medium(): void {
    this.trigger(18);
  }

  /** Strong 35ms pulse (Delete gate, wire cut, reset canvas) */
  public heavy(): void {
    this.trigger(35);
  }

  /** Selection / boundary lock micro-pulse (6ms) */
  public selection(): void {
    this.trigger(6);
  }

  /** Celebratory rhythm for challenge victory & truth table verification */
  public success(): void {
    this.trigger([15, 30, 25, 40, 30]);
  }

  /** Warning double vibration for errors, loops, or invalid actions */
  public warning(): void {
    this.trigger([25, 35, 25]);
  }
}

export const hapticsEngine = new HapticsEngine();
