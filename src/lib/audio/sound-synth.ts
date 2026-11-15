/**
 * Reflex Arena - Web Audio Procedural Sound Synthesizer
 * High-performance, zero-asset-latency procedural sound generation.
 */

export type SoundEffect =
  | "countdown_tick"
  | "countdown_go"
  | "tap"
  | "hit"
  | "miss"
  | "success"
  | "combo_up"
  | "game_over"
  | "victory"
  | "bullseye"
  | "strike";

export type SoundPack = "cyber" | "retro" | "synthwave" | "minimal";

class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.5;
  private activePack: SoundPack = "cyber";

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.volume;
  }

  public setSoundPack(pack: SoundPack) {
    this.activePack = pack;
  }

  public play(sfx: SoundEffect) {
    if (this.isMuted || this.volume <= 0) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(this.volume, now);
      masterGain.connect(ctx.destination);

      switch (sfx) {
        case "countdown_tick":
          this.playTone(ctx, masterGain, 440, "sine", 0.08, now);
          break;

        case "countdown_go":
          this.playTone(ctx, masterGain, 880, "triangle", 0.25, now);
          this.playTone(ctx, masterGain, 1760, "sine", 0.25, now + 0.02);
          break;

        case "tap":
          this.playTap(ctx, masterGain, now);
          break;

        case "hit":
          this.playTone(ctx, masterGain, 620, "sine", 0.06, now);
          break;

        case "miss":
          this.playTone(ctx, masterGain, 130, "sawtooth", 0.18, now);
          break;

        case "strike":
          this.playTone(ctx, masterGain, 110, "sawtooth", 0.25, now);
          break;

        case "success":
          this.playArpeggio(ctx, masterGain, [523.25, 659.25, 783.99], now);
          break;

        case "combo_up":
          this.playTone(ctx, masterGain, 700 + Math.random() * 200, "sine", 0.1, now);
          break;

        case "bullseye":
          this.playArpeggio(ctx, masterGain, [523.25, 659.25, 783.99, 1046.5], now);
          break;

        case "victory":
          this.playVictoryFanfare(ctx, masterGain, now);
          break;

        case "game_over":
          this.playTone(ctx, masterGain, 260, "sawtooth", 0.15, now);
          this.playTone(ctx, masterGain, 195, "sawtooth", 0.25, now + 0.12);
          this.playTone(ctx, masterGain, 146, "sawtooth", 0.4, now + 0.24);
          break;
      }
    } catch {
      // Audio playback fails gracefully if browser policy blocks autoplay
    }
  }

  private playTone(
    ctx: AudioContext,
    destination: AudioNode,
    freq: number,
    type: OscillatorType,
    duration: number,
    startTime: number
  ) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.3, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  private playTap(ctx: AudioContext, destination: AudioNode, startTime: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(320, startTime);
    osc.frequency.exponentialRampToValueAtTime(80, startTime + 0.04);

    gain.gain.setValueAtTime(0.4, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.04);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(startTime);
    osc.stop(startTime + 0.04);
  }

  private playArpeggio(
    ctx: AudioContext,
    destination: AudioNode,
    notes: number[],
    startTime: number
  ) {
    notes.forEach((freq, idx) => {
      this.playTone(ctx, destination, freq, "sine", 0.12, startTime + idx * 0.06);
    });
  }

  private playVictoryFanfare(
    ctx: AudioContext,
    destination: AudioNode,
    startTime: number
  ) {
    const notes = [440, 554.37, 659.25, 880, 1108.73];
    notes.forEach((freq, idx) => {
      this.playTone(ctx, destination, freq, "triangle", 0.18, startTime + idx * 0.08);
    });
  }
}

export const sound = new AudioSynthesizer();
