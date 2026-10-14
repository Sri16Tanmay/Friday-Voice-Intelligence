import React from 'react';
import { Calculator, CheckCircle2, Shield, Sliders, BookOpen, Layers } from 'lucide-react';

export const MethodologyLab: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Hero Header */}
      <div className="pb-6 border-b border-[var(--border-subtle)]">
        <span className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--accent-primary)] font-semibold block mb-2">
          Technical Architecture & Grounding
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[var(--text-primary)] font-normal tracking-tight">
          Acoustic DSP Methodology & Forensic Rubric Math
        </h1>
        <p className="text-xs sm:text-sm font-sans text-[var(--text-secondary)] mt-2 max-w-3xl leading-relaxed">
          FRIDAY formalizes speech delivery analytics by treating the human voice as a time-series acoustic
          signal. By performing speaker-agnostic normalization and Dynamic Time Warping (DTW) against canonical
          oratorical benchmarks, the platform isolates exact failure bounds with transparent mathematical rationales.
        </p>
      </div>

      {/* 4 Core DSP Mathematical Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Module 1: Pitch */}
        <div className="p-5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[var(--accent-primary)] font-semibold">
              Module 01 · Pitch DSP
            </span>
            <span className="text-xs font-mono text-[var(--text-muted)]">75 Hz – 450 Hz</span>
          </div>
          <h2 className="font-serif text-lg text-[var(--text-primary)]">
            Fundamental Frequency (F0) & Z-Score Normalization
          </h2>
          <p className="text-xs font-sans text-[var(--text-secondary)] leading-relaxed">
            Extracts glottal pulse periodicity via normalized autocorrelation with sub-bin parabolic
            interpolation. Voiced frames (corr &gt; 0.52) are mapped to speaker-agnostic Z-scores and relative
            semitone deviations from the speaker’s median.
          </p>
          <div className="p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)] font-mono text-xs text-[var(--accent-primary)]">
            F0_norm(t) = (F0(t) - μ_F0) / σ_F0, &nbsp; Δst = 12 · log2(F0(t) / μ_F0)
          </div>
        </div>

        {/* Module 2: DTW */}
        <div className="p-5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[var(--accent-primary)] font-semibold">
              Module 02 · Alignment
            </span>
            <span className="text-xs font-mono text-[var(--text-muted)]">Sakoe-Chiba Band</span>
          </div>
          <h2 className="font-serif text-lg text-[var(--text-primary)]">
            Dynamic Time Warping (DTW) Forced Alignment
          </h2>
          <p className="text-xs font-sans text-[var(--text-secondary)] leading-relaxed">
            Alleviates natural duration discrepancies between participant recitation and the canonical
            reference. Computes an accumulated distance matrix to find the optimal non-linear warp path,
            measuring local acceleration ratios.
          </p>
          <div className="p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)] font-mono text-xs text-[var(--accent-primary)]">
            D(i, j) = cost(i, j) + min&#123; D(i-1, j), D(i, j-1), D(i-1, j-1) &#125;
          </div>
        </div>

        {/* Module 3: RMS */}
        <div className="p-5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[var(--accent-primary)] font-semibold">
              Module 03 · Energy
            </span>
            <span className="text-xs font-mono text-[var(--text-muted)]">40ms Window / 50ms Hop</span>
          </div>
          <h2 className="font-serif text-lg text-[var(--text-primary)]">
            RMS Energy Envelope & Loudness Dynamics
          </h2>
          <p className="text-xs font-sans text-[var(--text-secondary)] leading-relaxed">
            Quantifies frame-level sound pressure in dBFS to evaluate dynamic contrast between thesis
            arguments and supporting context. Penalizes monotonic acoustic compression and rewards
            controlled crescendo.
          </p>
          <div className="p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)] font-mono text-xs text-[var(--accent-primary)]">
            RMS_dBFS = 20 · log10( sqrt( (1/N) · Σ x[n]² ) )
          </div>
        </div>

        {/* Module 4: Pauses */}
        <div className="p-5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[var(--accent-primary)] font-semibold">
              Module 04 · Pauses
            </span>
            <span className="text-xs font-mono text-[var(--text-muted)]">Adaptive Thresholding</span>
          </div>
          <h2 className="font-serif text-lg text-[var(--text-primary)]">
            Silence & Pause Interval Categorization
          </h2>
          <p className="text-xs font-sans text-[var(--text-secondary)] leading-relaxed">
            Distinguishes between punctuation-aligned rhetorical silences (allowing audience absorption)
            and hesitative mid-clause halts that fracture cadence. Flags anomalous silence durations
            exceeding baseline rhetorical windows.
          </p>
          <div className="p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)] font-mono text-xs text-[var(--accent-primary)]">
            Δt_pause = t_resume - t_silence, &nbsp; Pause_Ratio = (Σ Δt_pause) / T_total
          </div>
        </div>
      </div>

      {/* Speaker-Agnostic Normalization Guarantee */}
      <div className="p-6 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-strong)] space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent-primary)] uppercase tracking-wider font-semibold">
          <CheckCircle2 className="w-4 h-4" />
          <span>Biological Invariance Guarantee</span>
        </div>
        <h2 className="font-serif text-2xl font-normal text-[var(--text-primary)]">
          Speaker-Agnostic Mathematical Normalization
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-3xl">
          To prevent biological bias (male vs. female vocal anatomy, baritone vs. soprano registers), all
          pitch and energy contours are calibrated dynamically against each speaker’s individual voiced
          statistics $(\mu, \sigma)$. A speaker with a baseline median pitch of 240 Hz is evaluated along the
          exact same relative modulation dynamic scale as a speaker with a baseline of 115 Hz.
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-mono text-[var(--accent-primary)] pt-2 border-t border-[var(--border-subtle)]">
          <span>· Z-Score Semitone Invariant</span>
          <span>· Relative dBFS Crest Dynamics</span>
          <span>· Time-Warp Preserved Temporal Bounding</span>
        </div>
      </div>
    </div>
  );
};
