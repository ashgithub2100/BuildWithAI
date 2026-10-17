// Pure Web Audio API tactile mechanical click synthesizer (Braun / Teenage Engineering feel)

class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  // 12ms short sine/triangle burst (800Hz -> 120Hz exponential ramp) for toggle switches
  public playRelayClick(): void {
    if (this.muted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      const now = ctx.currentTime;

      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.012);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.012);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.015);
    } catch {
      // AudioContext might be blocked until user gesture
    }
  }

  // 60ms descending dual-tone filter sweep (440Hz -> 220Hz) when slicing a task
  public playShrinkDown(): void {
    if (this.muted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1200, now);
      filter.frequency.exponentialRampToValueAtTime(300, now + 0.06);

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(440, now);
      osc1.frequency.exponentialRampToValueAtTime(220, now + 0.06);

      osc2.type = "sawtooth";
      osc2.frequency.setValueAtTime(436, now);
      osc2.frequency.exponentialRampToValueAtTime(218, now + 0.06);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.065);
      osc2.stop(now + 0.065);
    } catch {
      // Ignore audio error
    }
  }

  // Crisp mechanical two-part transient click (1200Hz 15ms + 1600Hz 25ms) when completing an Anchor
  public playRelaySnap(): void {
    if (this.muted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Part 1: Initial high transient strike
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();

      osc1.type = "square";
      osc1.frequency.setValueAtTime(1200, now);
      osc1.frequency.exponentialRampToValueAtTime(400, now + 0.015);

      gain1.gain.setValueAtTime(0.1, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.016);

      // Part 2: Body snap resonance 10ms later
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();

      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(1600, now + 0.01);
      osc2.frequency.exponentialRampToValueAtTime(300, now + 0.035);

      gain2.gain.setValueAtTime(0.12, now + 0.01);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.01);
      osc2.stop(now + 0.038);
    } catch {
      // Ignore audio error
    }
  }
}

export const soundEngine = new SoundEngine();
