import { AcousticTrajectory, AlignedWord, TemporalFlaw } from '../types/speech';

class SpeechAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private startTime = 0;
  private pauseOffset = 0;
  private duration = 0;
  private animFrameId: number | null = null;
  private onTimeUpdateCallback: ((time: number) => void) | null = null;
  private onEndedCallback: (() => void) | null = null;
  private currentMode: 'ideal' | 'flawed' = 'flawed';

  // Nodes for Web Audio synthesis
  private masterGain: GainNode | null = null;
  private activeOscillator: OscillatorNode | null = null;
  private activeGain: GainNode | null = null;
  private activeFilter: BiquadFilterNode | null = null;
  private loopRange: [number, number] | null = null;

  private currentTrajectory: AcousticTrajectory | null = null;
  private currentWords: AlignedWord[] = [];
  private currentText = '';

  constructor() {
    // AudioContext created lazily on user interaction
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setCallbacks(
    onTimeUpdate: (time: number) => void,
    onEnded: () => void
  ) {
    this.onTimeUpdateCallback = onTimeUpdate;
    this.onEndedCallback = onEnded;
  }

  public setLoopRange(range: [number, number] | null) {
    this.loopRange = range;
    if (range && this.isPlaying) {
      this.seek(range[0]);
    }
  }

  public loadSpeech(
    text: string,
    words: AlignedWord[],
    trajectory: AcousticTrajectory
  ) {
    this.stop();
    this.currentText = text;
    this.currentWords = words;
    this.currentTrajectory = trajectory;
    this.duration = trajectory.duration;
    this.pauseOffset = 0;
  }

  public setPlaybackMode(mode: 'ideal' | 'flawed', idealTraj?: AcousticTrajectory, flawedTraj?: AcousticTrajectory) {
    this.currentMode = mode;
    if (mode === 'ideal' && idealTraj) {
      this.currentTrajectory = idealTraj;
    } else if (mode === 'flawed' && flawedTraj) {
      this.currentTrajectory = flawedTraj;
    }
  }

  public play() {
    if (this.isPlaying) return;
    const ctx = this.initContext();
    if (!ctx) return;

    this.isPlaying = true;
    this.startTime = ctx.currentTime - this.pauseOffset;

    this.startSynthesis(this.pauseOffset);
    this.startTickLoop();
  }

  public pause() {
    if (!this.isPlaying) return;
    const ctx = this.ctx;
    if (ctx) {
      this.pauseOffset = Math.min(this.duration, Math.max(0, ctx.currentTime - this.startTime));
    }
    this.stopSynthesis();
    this.isPlaying = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  public stop() {
    this.pause();
    this.pauseOffset = 0;
    if (this.onTimeUpdateCallback) {
      this.onTimeUpdateCallback(0);
    }
  }

  public seek(targetSeconds: number) {
    const wasPlaying = this.isPlaying;
    if (this.isPlaying) {
      this.pause();
    }
    this.pauseOffset = Math.max(0, Math.min(this.duration, targetSeconds));
    if (this.onTimeUpdateCallback) {
      this.onTimeUpdateCallback(this.pauseOffset);
    }
    if (wasPlaying) {
      this.play();
    }
  }

  private startTickLoop() {
    const tick = () => {
      if (!this.isPlaying || !this.ctx) return;
      const current = this.ctx.currentTime - this.startTime;

      // Handle loop region
      if (this.loopRange) {
        const [loopStart, loopEnd] = this.loopRange;
        if (current >= loopEnd) {
          this.seek(loopStart);
          return;
        }
      }

      if (current >= this.duration) {
        this.stop();
        if (this.onEndedCallback) {
          this.onEndedCallback();
        }
        return;
      }

      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(current);
      }

      this.animFrameId = requestAnimationFrame(tick);
    };

    this.animFrameId = requestAnimationFrame(tick);
  }

  /**
   * High-fidelity Web Audio Formant Synthesizer
   * Creates rich harmonic vocal simulation adhering to F0 trajectory and formant filters
   */
  private startSynthesis(startOffsetSec: number) {
    const ctx = this.initContext();
    if (!ctx) return;
    this.stopSynthesis();

    if (!this.currentTrajectory) return;

    const frames = this.currentTrajectory.frames;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.7, ctx.currentTime);
    masterGain.connect(ctx.destination);
    this.masterGain = masterGain;

    // Harmonic Sawtooth Oscillator simulating vocal fold glottal pulse
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';

    // Vocal tract Formant Filter (Bandpass centered on vocal resonance)
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(3.2, ctx.currentTime);

    // Dynamic Volume Envelope Gain
    const volGain = ctx.createGain();
    volGain.gain.setValueAtTime(0, ctx.currentTime);

    osc.connect(filter);
    filter.connect(volGain);
    volGain.connect(masterGain);

    const now = ctx.currentTime;
    const duration = this.duration - startOffsetSec;

    // Schedule pitch, energy, and formant sweeps from the acoustic trajectory
    frames.forEach((frame) => {
      const scheduleTime = now + (frame.time - startOffsetSec);
      if (scheduleTime < now || scheduleTime > now + duration) return;

      // Pitch (F0)
      if (frame.f0 && frame.f0 > 50 && !frame.isPause) {
        osc.frequency.setValueAtTime(frame.f0, scheduleTime);
      }

      // Energy (RMS)
      if (frame.isPause) {
        volGain.gain.setValueAtTime(0.001, scheduleTime);
      } else {
        // Convert dBFS (-40 to -10) to linear gain (0.05 to 0.45)
        const linearGain = Math.max(0.02, Math.min(0.55, Math.pow(10, frame.rmsDb / 20) * 1.8));
        volGain.gain.setValueAtTime(linearGain, scheduleTime);
      }

      // Spectral Formant Resonance
      if (frame.spectralCentroid > 300) {
        filter.frequency.setValueAtTime(frame.spectralCentroid, scheduleTime);
      }
    });

    osc.start(now);
    osc.stop(now + duration);

    this.activeOscillator = osc;
    this.activeGain = volGain;
    this.activeFilter = filter;

    // Trigger subtle, natural browser speech alongside formant harmonics if available
    this.triggerBrowserSpeechUtterance(startOffsetSec);
  }

  private triggerBrowserSpeechUtterance(startOffsetSec: number) {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      // If we are starting from the very beginning, invoke browser synthesis with pitch/rate tweaks
      if (startOffsetSec < 0.2) {
        const utt = new SpeechSynthesisUtterance(this.currentText);
        utt.rate = this.currentMode === 'ideal' ? 0.95 : 1.05;
        utt.pitch = this.currentMode === 'ideal' ? 1.05 : 0.88;
        utt.volume = 0.55;
        window.speechSynthesis.speak(utt);
      }
    } catch {
      // Audio engine fallback works automatically via Web Audio
    }
  }

  private stopSynthesis() {
    if (this.activeOscillator) {
      try {
        this.activeOscillator.stop();
        this.activeOscillator.disconnect();
      } catch {
        // already stopped
      }
      this.activeOscillator = null;
    }
    if (this.activeGain) {
      try {
        this.activeGain.disconnect();
      } catch {
        // ignored
      }
      this.activeGain = null;
    }
    if (this.activeFilter) {
      try {
        this.activeFilter.disconnect();
      } catch {
        // ignored
      }
      this.activeFilter = null;
    }
    if (this.masterGain) {
      try {
        this.masterGain.disconnect();
      } catch {
        // ignored
      }
      this.masterGain = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignored
      }
    }
  }
}

export const speechAudioEngine = new SpeechAudioEngine();
