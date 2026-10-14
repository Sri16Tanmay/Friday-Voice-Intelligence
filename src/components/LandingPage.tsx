import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Sliders,
  Activity,
  Layers,
  Volume2,
  VolumeX,
  Repeat,
  CheckCircle,
  ShieldAlert,
  Clock,
  ChevronRight,
  Maximize2,
  Zap,
} from 'lucide-react';
import { AppView } from './Navigation';
import { BrandLogo } from './BrandLogo';
import { SPEECH_BENCHMARKS } from '../data/contrastiveDataset';
import { speechAudioEngine } from '../services/speechSynthesizer';
import { Footer } from './Footer';

interface LandingPageProps {
  onNavigate: (view: AppView) => void;
  onInspectBenchmark: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onInspectBenchmark }) => {
  // Hero Interactive Acoustic Dashboard Player State
  const benchmark = SPEECH_BENCHMARKS[0];
  const flawedVariant = benchmark.variants.level_1_egregious;
  const idealVariant = benchmark.variants.ideal;
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(2.4);
  const [playbackMode, setPlaybackMode] = useState<'ideal' | 'flawed'>('flawed');
  const [isLooping, setIsLooping] = useState(false);
  const duration = flawedVariant.acousticTrajectory.duration || 14.8;
  const [demoActiveInterval, setDemoActiveInterval] = useState<number>(0);

  // Initialize and load benchmark audio for direct playable hero
  useEffect(() => {
    speechAudioEngine.loadSpeech(
      benchmark.transcript,
      benchmark.alignedWords,
      flawedVariant.acousticTrajectory
    );

    speechAudioEngine.setCallbacks(
      (time) => {
        setCurrentTime(time);
        if (time >= duration) {
          setIsPlaying(false);
        }
      },
      () => setIsPlaying(false)
    );

    return () => {
      speechAudioEngine.stop();
    };
  }, []);

  const handlePlayToggle = () => {
    if (isPlaying) {
      speechAudioEngine.pause();
      setIsPlaying(false);
    } else {
      speechAudioEngine.setPlaybackMode(
        playbackMode,
        idealVariant.acousticTrajectory,
        flawedVariant.acousticTrajectory
      );
      speechAudioEngine.play();
      setIsPlaying(true);
    }
  };

  const handleReset = () => {
    speechAudioEngine.seek(0);
    setCurrentTime(0);
  };

  const handleSeek = (posFraction: number) => {
    const target = Math.max(0, Math.min(duration, posFraction * duration));
    setCurrentTime(target);
    speechAudioEngine.seek(target);
  };

  const handleModeSwitch = (mode: 'ideal' | 'flawed') => {
    setPlaybackMode(mode);
    speechAudioEngine.setPlaybackMode(
      mode,
      idealVariant.acousticTrajectory,
      flawedVariant.acousticTrajectory
    );
  };

  const demoIntervals = [
    {
      time: '02.40s – 03.10s',
      label: 'Declarative Uptalk',
      metric: 'ΔF0 = +42.6 Hz',
      severity: 'moderate',
      explanation: 'Inverted terminal pitch contour on declarative punchline weakens perceived conviction and authority.',
      delta: '+42.6 Hz pitch inflection on clause terminal',
      drill: 'Monotone anchor drills with descending terminal cadence',
    },
    {
      time: '08.60s – 10.40s',
      label: 'Vocal Fry Collapse',
      metric: 'RMS Δ = -14.6 dB',
      severity: 'critical',
      explanation: 'Sub-glottic pressure drop converts dramatic thesis climax ("because they are hard") into an inaudible sub-harmonic creak.',
      delta: 'F0 dropped from +195 Hz climax to 78 Hz · -14.6 dBFS amplitude collapse',
      drill: 'Continuous sub-glottic abdominal support pacing drills',
    },
    {
      time: '12.40s – 14.10s',
      label: 'Cadence Compression',
      metric: 'Rate = 8.5 syl/s',
      severity: 'moderate',
      explanation: 'Rushed syllable delivery robs listeners of rhetorical digestion window during oratorical summation.',
      delta: 'Syllabic density accelerated from 4.2 to 8.5 syllables/second',
      drill: 'Metronome articulation pacing with 450ms inter-phrase pauses',
    },
  ];

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = (secs % 60).toFixed(1);
    return `${m.toString().padStart(2, '0')}:${s.padStart(4, '0')}`;
  };

  return (
    <div className="flex flex-col min-h-full">
      <div className="space-y-20 md:space-y-28 flex-1">
      {/* ============================================================ */}
      {/* 1. ULTRA-PREMIUM HERO SECTION (Matches Uploaded Dashboard)   */}
      {/* ============================================================ */}
      <section data-section="hero" className="pt-10 md:pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          
          {/* Left Column: Editorial Copy & Million-Dollar Authority */}
          <div className="lg:col-span-5 space-y-7">
            {/* Top Badge: AI-Powered Intelligence Pill with Gold Star */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-[#C6A66A]/40 bg-[var(--surface-elevated)] text-xs font-sans shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#C6A66A] animate-pulse" />
              <span className="text-[var(--text-primary)] font-semibold tracking-wider uppercase text-[11px]">
                Temporal Flaw Grounding
              </span>
              <span className="text-[var(--border-strong)]">·</span>
              <span className="text-[var(--text-muted)] font-medium text-[11px]">
                Contrastive Speech Analytics
              </span>
            </div>

            {/* Main Title: Balanced Editorial Fraunces Serif */}
            <div className="space-y-4">
              <h1 className="hero-headline text-[var(--text-primary)] font-normal tracking-tight">
                Every word matters. <br />
                <span className="italic font-normal text-[#1E4E38] dark:text-[#DFBA76]">
                  Every second counts.
                </span>
              </h1>
              <p className="font-sans text-base text-[var(--text-secondary)] font-normal max-w-xl leading-relaxed">
                Understand the measurable acoustic physics behind your delivery. Compare your speech
                against calibrated oratorical benchmarks, discover exact vocal deviations, and refine
                your delivery with mathematical intelligence.
              </p>
            </div>

            {/* CTA Buttons: Deep Emerald & Champagne Gold Elevation */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button
                onClick={() => onNavigate('analysis')}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#1E4E38] hover:bg-[#153E2B] text-[#FAF8F5] text-xs font-sans font-semibold tracking-wider uppercase border border-[#C6A66A]/40 transition-all cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 group"
              >
                <span>Analyze Your Speech</span>
                <ArrowRight className="w-4 h-4 text-[#C6A66A] group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onNavigate('methodology')}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] text-xs font-sans font-medium tracking-wide transition-all cursor-pointer shadow-2xs hover:border-[#C6A66A]"
              >
                <span>Explore the Methodology</span>
              </button>
            </div>

            {/* Proof Metrics Strip: Balanced Normal Contrast */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[var(--border-subtle)]">
              <div className="p-3 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-subtle)] shadow-2xs">
                <span className="text-[var(--text-muted)] block font-sans text-[11px] font-medium uppercase tracking-wider">
                  Forced Alignment
                </span>
                <span className="font-mono text-sm sm:text-base font-semibold text-[var(--text-primary)] mt-1 block">
                  50ms Hop
                </span>
              </div>
              <div className="p-3 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-subtle)] shadow-2xs">
                <span className="text-[var(--text-muted)] block font-sans text-[11px] font-medium uppercase tracking-wider">
                  Calibration
                </span>
                <span className="font-mono text-sm sm:text-base font-semibold text-[var(--text-primary)] mt-1 block">
                  Agnostic
                </span>
              </div>
              <div className="p-3 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-subtle)] shadow-2xs">
                <span className="text-[var(--text-muted)] block font-sans text-[11px] font-medium uppercase tracking-wider">
                  Flaw Bounding
                </span>
                <span className="font-mono text-sm sm:text-base font-semibold text-[#1E4E38] dark:text-[#DFBA76] mt-1 block">
                  [t₁, t₂] Time
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Ultra-Realistic Luxury AI Speech Analysis Dashboard Card */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-[rgba(198,166,106,0.35)] bg-[var(--surface-elevated)] p-5 sm:p-6 shadow-xl relative overflow-hidden transition-all duration-300">
              
              {/* Top Bar of the Dashboard Card */}
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1E5C3E] dark:bg-[#82B38D] animate-pulse" />
                  <span className="text-xs font-sans font-semibold text-[var(--text-primary)] uppercase tracking-wider">
                    Acoustic Trajectory Overlay
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-md bg-[var(--bg-secondary)] border border-[#C6A66A]/40 text-[var(--text-primary)] dark:text-[#DFBA76] font-semibold">
                    JFK Moonshot (1962)
                  </span>
                  <button
                    onClick={() => onInspectBenchmark()}
                    className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                    title="Open Full Benchmark Workspace"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Dual Waveform & F0 Trajectory Sound Desk Container */}
              <div className="my-4 relative h-44 bg-[var(--surface-alt)] rounded-xl p-3 overflow-hidden border border-[var(--border-subtle)]">
                
                {/* Visualizer Gridlines */}
                <div className="absolute inset-0 grid grid-cols-6 grid-rows-3 pointer-events-none opacity-20">
                  {Array.from({ length: 18 }).map((_, i) => (
                    <div key={i} className="border-r border-b border-[var(--border-strong)]" />
                  ))}
                </div>

                {/* Simulated High-Res Dual Waveform Bars */}
                <div className="absolute inset-0 flex items-center justify-between px-4">
                  {Array.from({ length: 54 }).map((_, i) => {
                    const h1 = 18 + Math.sin(i * 0.38) * 44 + Math.cos(i * 0.75) * 22;
                    const isFlawed = (i >= 14 && i <= 21) || (i >= 34 && i <= 40);
                    const isCurrent = Math.abs((i / 54) * duration - currentTime) < 0.35;

                    return (
                      <div
                        key={i}
                        className={`w-1 sm:w-1.5 rounded-full transition-all duration-150 ${
                          isCurrent ? 'scale-y-110 shadow-sm' : ''
                        }`}
                        style={{
                          height: `${Math.max(8, Math.min(94, h1))}%`,
                          backgroundColor: isCurrent
                            ? '#C6A66A'
                            : isFlawed
                            ? '#B53229'
                            : i % 2 === 0
                            ? '#1E5C3E'
                            : '#C6A66A',
                          opacity: isFlawed ? 1 : i % 2 === 0 ? 0.95 : 0.85,
                        }}
                      />
                    );
                  })}
                </div>

                {/* Overlaid Pitch F0 Trajectory Paths (SVG) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                  {/* Ideal Benchmark F0 (Emerald Dashed Path) */}
                  <path
                    d="M 10 90 Q 140 25, 270 65 T 540 35"
                    fill="none"
                    stroke="#1E5C3E"
                    strokeWidth="3"
                    strokeDasharray="5 3"
                  />
                  {/* Participant Delivery F0 (Champagne Gold / Ruby Dip) */}
                  <path
                    d="M 10 95 Q 140 85, 230 70 C 270 120, 310 135, 360 85 T 540 100"
                    fill="none"
                    stroke="#C6A66A"
                    strokeWidth="2.5"
                  />
                  {/* Live Scrubber Playhead Line */}
                  <line
                    x1={`${(currentTime / duration) * 100}%`}
                    y1="0"
                    x2={`${(currentTime / duration) * 100}%`}
                    y2="100%"
                    stroke="var(--text-primary)"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                    className="opacity-60"
                  />
                </svg>

                {/* Floating Acoustic Labels on the Display */}
                <div className="absolute top-2 left-3 text-[10px] font-mono font-semibold text-[#1E5C3E] dark:text-[#82B38D] bg-[var(--surface-elevated)]/90 px-2 py-0.5 rounded border border-[#1E5C3E]/30 shadow-2xs">
                  Reference F0 (Emerald · 185 Hz Target)
                </div>
                <div className="absolute bottom-2 right-3 text-[10px] font-mono font-semibold text-[#B53229] bg-[var(--surface-elevated)]/90 px-2 py-0.5 rounded border border-[#B53229]/40 shadow-2xs">
                  Critical Flaw (-2.95σ Vocal Fry)
                </div>
              </div>

              {/* Real Interactive Audio Player Bar on the Card */}
              <div className="p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] mb-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  {/* Transport Buttons */}
                  <div className="flex items-center gap-2.5">
                    {/* Play/Pause Button */}
                    <button
                      onClick={handlePlayToggle}
                      className="w-10 h-10 rounded-full bg-[#1E4E38] hover:bg-[#153E2B] text-[#FAF8F5] border border-[#C6A66A]/60 flex items-center justify-center shadow-sm transition-all cursor-pointer group"
                      aria-label={isPlaying ? 'Pause Demo Audio' : 'Play Demo Audio'}
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4 text-[#C6A66A]" />
                      ) : (
                        <Play className="w-4 h-4 ml-0.5 text-[#C6A66A] group-hover:scale-110 transition-transform" />
                      )}
                    </button>

                    {/* Reset Button */}
                    <button
                      onClick={handleReset}
                      className="w-8 h-8 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center justify-center transition-colors cursor-pointer"
                      title="Reset playback to 00:00"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>

                    {/* Compare Mode Toggle */}
                    <div className="flex items-center rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-0.5 text-[11px] font-sans font-medium">
                      <button
                        onClick={() => handleModeSwitch('flawed')}
                        className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                          playbackMode === 'flawed'
                            ? 'bg-[#1E4E38] text-[#FAF8F5]'
                            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        Delivery Take
                      </button>
                      <button
                        onClick={() => handleModeSwitch('ideal')}
                        className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                          playbackMode === 'ideal'
                            ? 'bg-[#1E5C3E] text-[#FAF8F5]'
                            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        Benchmark (JFK)
                      </button>
                    </div>
                  </div>

                  {/* Timestamp Display */}
                  <div className="text-right font-mono text-xs font-semibold tabular-nums">
                    <span className="text-[var(--text-primary)]">
                      {formatTime(currentTime)}
                    </span>
                    <span className="text-[var(--border-strong)] mx-1">/</span>
                    <span className="text-[var(--text-muted)]">
                      {formatTime(duration)}
                    </span>
                  </div>
                </div>

                {/* Progress Scrubbing Bar */}
                <div
                  className="relative w-full h-2 bg-[var(--chart-grid)] rounded-full cursor-pointer group"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pos = (e.clientX - rect.left) / rect.width;
                    handleSeek(pos);
                  }}
                >
                  <div
                    className="absolute top-0 left-0 h-full bg-[#C6A66A] rounded-full transition-all"
                    style={{ width: `${Math.min(100, (currentTime / duration) * 100)}%` }}
                  />
                  {/* Flaw Interval Marker Highlight on the Bar */}
                  <div
                    className="absolute top-0 h-full bg-[#B53229]/60 rounded-full"
                    style={{
                      left: `${(8.6 / duration) * 100}%`,
                      width: `${((10.4 - 8.6) / duration) * 100}%`,
                    }}
                    title="Grounded Flaw Region: [08.60s – 10.40s]"
                  />
                </div>
              </div>

              {/* Sample Evidence Breakdown Callout */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between text-xs font-sans">
                  <div className="flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-[#B53229]" />
                    <span className="font-semibold text-[var(--text-primary)]">
                      Grounded Flaw Region [08.60s – 10.40s]
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-[#B53229] font-semibold uppercase tracking-wider bg-[#B53229]/10 px-2 py-0.5 rounded">
                    Critical Severity
                  </span>
                </div>
                
                <div className="p-3.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-secondary)] leading-relaxed">
                  <strong className="text-[var(--text-primary)] font-semibold">
                    "but because they are hard"
                  </strong>{' '}
                  — F0 dropped from expected +195 Hz climax to 78 Hz (sub-harmonic vocal fry) with
                  energy loss ΔRMS = -14.6 dBFS.
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3.5 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
                <span className="text-[var(--text-muted)] font-normal">
                  Calibrated benchmark data · JFK Stadium Address
                </span>
                <button
                  onClick={() => onNavigate('analysis')}
                  className="text-[var(--text-primary)] dark:text-[#DFBA76] font-semibold hover:underline cursor-pointer flex items-center gap-1 group"
                >
                  <span>Test with Your Audio</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C6A66A] group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. THE ANALYTICAL ARCHITECTURE (Feature Cards with Gold Box) */}
      {/* ============================================================ */}
      <section data-section="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[var(--border-subtle)] pt-20">
        <div className="max-w-2xl mb-14 space-y-2">
          <span className="text-xs font-mono uppercase tracking-[0.22em] text-[#1E4E38] dark:text-[#DFBA76] font-semibold block">
            The Analytical Architecture
          </span>
          <h2 className="section-heading text-[var(--text-primary)] font-normal">
            How FRIDAY transforms oratorical evaluation into mathematical certainty.
          </h2>
        </div>

        {/* 3 Luxury Feature Cards with Gold Icon Medallions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Feature Card 1: Acoustic Intelligence */}
          <div className="p-7 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] shadow-md hover:shadow-lg hover:border-[#C6A66A]/60 transition-all group flex flex-col justify-between">
            <div className="space-y-5">
              {/* Gold Medallion Box */}
              <div className="w-14 h-14 rounded-xl bg-[var(--bg-secondary)] border border-[#C6A66A]/50 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <Activity className="w-7 h-7 text-[#C6A66A]" />
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-[#C6A66A]">01 · DSP EXTRACTION</span>
                  <span className="text-[10px] font-mono font-semibold text-[#1E5C3E] dark:text-[#82B38D] uppercase tracking-wider bg-[#1E5C3E]/10 px-2 py-0.5 rounded">
                    YIN + RMS
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-normal text-[var(--text-primary)]">
                  Acoustic Intelligence
                </h3>
                <p className="font-sans text-sm text-[var(--text-secondary)] font-normal leading-relaxed">
                  Extract high-resolution Fundamental Frequency (F0) contours, frame-level RMS energy,
                  and vocal harmonic spectral envelopes without black-box vagueness.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-[var(--border-subtle)] flex flex-wrap gap-2 text-[11px] font-mono font-medium text-[var(--text-muted)]">
              <span className="px-2 py-1 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                · YIN Contour
              </span>
              <span className="px-2 py-1 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                · Z-Score Norm
              </span>
              <span className="px-2 py-1 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                · dBFS Energy
              </span>
            </div>
          </div>

          {/* Feature Card 2: Temporal Precision */}
          <div className="p-7 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] shadow-md hover:shadow-lg hover:border-[#C6A66A]/60 transition-all group flex flex-col justify-between">
            <div className="space-y-5">
              {/* Gold Medallion Box */}
              <div className="w-14 h-14 rounded-xl bg-[var(--bg-secondary)] border border-[#C6A66A]/50 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <Sliders className="w-7 h-7 text-[#C6A66A]" />
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-[#C6A66A]">02 · ALIGNMENT</span>
                  <span className="text-[10px] font-mono font-semibold text-[#1E5C3E] dark:text-[#82B38D] uppercase tracking-wider bg-[#1E5C3E]/10 px-2 py-0.5 rounded">
                    DTW WARPING
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-normal text-[var(--text-primary)]">
                  Temporal Precision
                </h3>
                <p className="font-sans text-sm text-[var(--text-secondary)] font-normal leading-relaxed">
                  Locate specific moments of delivery deviation through aligned audio and time-series
                  analysis. Dynamic Time Warping (DTW) bounds the exact milliseconds [t₁, t₂] of vocal fracture.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-[var(--border-subtle)] flex flex-wrap gap-2 text-[11px] font-mono font-medium text-[var(--text-muted)]">
              <span className="px-2 py-1 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                · DTW Warping
              </span>
              <span className="px-2 py-1 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                · Millisecond Bounding
              </span>
              <span className="px-2 py-1 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                · Pause Cadence
              </span>
            </div>
          </div>

          {/* Feature Card 3: Evidence-Based Feedback */}
          <div className="p-7 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] shadow-md hover:shadow-lg hover:border-[#C6A66A]/60 transition-all group flex flex-col justify-between">
            <div className="space-y-5">
              {/* Gold Medallion Box */}
              <div className="w-14 h-14 rounded-xl bg-[var(--bg-secondary)] border border-[#C6A66A]/50 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                <Layers className="w-7 h-7 text-[#C6A66A]" />
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-[#C6A66A]">03 · DIAGNOSTICS</span>
                  <span className="text-[10px] font-mono font-semibold text-[#1E5C3E] dark:text-[#82B38D] uppercase tracking-wider bg-[#1E5C3E]/10 px-2 py-0.5 rounded">
                    RUBRIC ENGINE
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-normal text-[var(--text-primary)]">
                  Evidence-Based Feedback
                </h3>
                <p className="font-sans text-sm text-[var(--text-secondary)] font-normal leading-relaxed">
                  Turn measured differences into transparent, practical recommendations. Each detected
                  flaw links the raw mathematical delta directly to rhetorical consequences and concrete drills.
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-[var(--border-subtle)] flex flex-wrap gap-2 text-[11px] font-mono font-medium text-[var(--text-muted)]">
              <span className="px-2 py-1 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                · Mathematical Delta
              </span>
              <span className="px-2 py-1 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                · Causal Impact
              </span>
              <span className="px-2 py-1 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                · Rehearsal Drills
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. FEATURE DEMONSTRATION: Clarity through careful analysis   */}
      {/* ============================================================ */}
      <section data-section="demonstration" className="bg-[var(--bg-secondary)] py-20 border-y border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-xs font-mono uppercase tracking-[0.22em] text-[#1E4E38] dark:text-[#DFBA76] font-semibold block mb-2">
                Feature Demonstration
              </span>
              <h2 className="section-heading text-[var(--text-primary)] font-normal">
                Clarity through careful analysis.
              </h2>
            </div>
            <p className="font-sans text-sm text-[var(--text-secondary)] font-normal max-w-md leading-relaxed">
              Explore detected flaw intervals across an aligned speech. Click any region to examine
              the mathematical delta and hear the rhetorical consequence.
            </p>
          </div>

          {/* Interactive Flaw Interval Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {demoIntervals.map((interval, idx) => {
              const isSelected = demoActiveInterval === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setDemoActiveInterval(idx)}
                  className={`text-left p-5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#C6A66A] bg-[var(--surface-elevated)] shadow-md ring-1 ring-[#C6A66A]/30 scale-[1.01]'
                      : 'border-[var(--border-subtle)] bg-[var(--surface-elevated)]/70 hover:border-[#CDC4B3] hover:bg-[var(--surface-elevated)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-[#1E4E38] dark:text-[#DFBA76] font-semibold">
                      {interval.time}
                    </span>
                    <span
                      className={`text-[10px] font-mono uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${
                        interval.severity === 'critical'
                          ? 'text-[#B53229] bg-[#B53229]/10'
                          : 'text-[#B88B35] bg-[#B88B35]/10'
                      }`}
                    >
                      {interval.severity}
                    </span>
                  </div>
                  <div className="font-serif font-normal text-lg text-[var(--text-primary)] mb-1">
                    {interval.label}
                  </div>
                  <div className="text-xs font-mono font-medium text-[var(--text-muted)]">
                    {interval.metric}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Flaw Detailed Diagnostic Box */}
          <div className="p-7 rounded-2xl bg-[var(--surface-elevated)] border border-[rgba(198,166,106,0.35)] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#1E4E38] dark:text-[#DFBA76] font-semibold uppercase tracking-wider">
                  Active Grounding · {demoIntervals[demoActiveInterval].label}
                </span>
                <span className="text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-secondary)] px-2.5 py-0.5 rounded font-medium border border-[var(--border-subtle)]">
                  Diagnostic Evidence
                </span>
              </div>
              <p className="text-base text-[var(--text-primary)] leading-relaxed font-sans font-normal">
                {demoIntervals[demoActiveInterval].explanation}
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-mono">
                <span className="text-[#B53229] font-semibold">
                  Δ: {demoIntervals[demoActiveInterval].delta}
                </span>
                <span className="text-[var(--border-strong)]">·</span>
                <span className="text-[#1E5C3E] dark:text-[#82B38D] font-semibold">
                  Drill: {demoIntervals[demoActiveInterval].drill}
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('analysis')}
              className="px-6 py-3.5 rounded-xl bg-[#1E4E38] hover:bg-[#153E2B] text-[#FAF8F5] text-xs font-sans font-semibold tracking-wider uppercase border border-[#C6A66A]/40 transition-all whitespace-nowrap cursor-pointer shadow-sm hover:shadow-md self-start md:self-auto group"
            >
              <span className="flex items-center gap-2">
                <span>Analyze Your Speech</span>
                <ArrowRight className="w-4 h-4 text-[#C6A66A] group-hover:translate-x-0.5 transition-transform" />
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. CLOSING EDITORIAL CTA                                     */}
      {/* ============================================================ */}
      <section data-section="cta" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8">
        <div className="p-10 md:p-14 rounded-3xl border border-[rgba(198,166,106,0.35)] bg-[var(--surface-elevated)] space-y-6 shadow-lg">
          <div className="w-16 h-16 rounded-2xl bg-[var(--bg-secondary)] border border-[#C6A66A]/50 mx-auto flex items-center justify-center shadow-2xs">
            <BrandLogo size="sm" />
          </div>
          <h2 className="page-heading text-[var(--text-primary)] font-normal">
            Your next performance starts with understanding.
          </h2>
          <p className="font-sans text-sm sm:text-base text-[var(--text-secondary)] font-normal max-w-lg mx-auto leading-relaxed">
            Eliminate subjective guesswork. Test your vocal delivery against oratorical benchmarks and
            discover exact moments of delivery fracture with evidence-backed intelligence.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('analysis')}
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-[#1E4E38] hover:bg-[#153E2B] text-[#FAF8F5] text-xs font-sans font-semibold tracking-wider uppercase border border-[#C6A66A]/45 transition-all cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <span>Begin Your Analysis</span>
              <ArrowRight className="w-4 h-4 text-[#C6A66A]" />
            </button>
          </div>
        </div>
      </section>
      </div>

      {/* ============================================================ */}
      {/* 5. MASTER FOOTER: Premium Dashboard Ending                   */}
      {/* ============================================================ */}
      <Footer onNavigate={onNavigate} className="mt-20 md:mt-24" />
    </div>
  );
};
