import React from 'react';
import { TemporalFlaw } from '../types/speech';
import {
  HelpCircle,
  RefreshCw,
  Target,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

interface FlawInspectorProps {
  flaws: TemporalFlaw[];
  selectedFlaw: TemporalFlaw | null;
  onSelectFlaw: (flaw: TemporalFlaw) => void;
  onSeek: (time: number) => void;
  loopRange: [number, number] | null;
  onToggleLoopFlaw: (flaw: TemporalFlaw) => void;
}

export const FlawInspector: React.FC<FlawInspectorProps> = ({
  flaws = [],
  selectedFlaw,
  onSelectFlaw,
  onSeek,
  loopRange,
  onToggleLoopFlaw,
}) => {
  const safeFlaws = Array.isArray(flaws) ? flaws : [];
  return (
    <div className="bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-xl p-5 mb-6 shadow-xs transition-colors duration-300">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--border-subtle)]">
        <div>
          <h2 className="text-sm font-sans font-semibold uppercase tracking-wider text-[var(--text-primary)]">
            Temporal Flaw Grounding & Evidence Panel
          </h2>
          <p className="text-xs font-sans text-[var(--text-muted)] mt-0.5">
            Acoustic deviations mapped to rhetorical failure modes and actionable vocal coaching drills.
          </p>
        </div>
        <div className="text-xs font-mono text-[var(--text-muted)]">
          <span className="text-[var(--text-primary)] font-semibold tabular-nums">
            {safeFlaws.length}
          </span>{' '}
          Detected Intervals
        </div>
      </div>

      {safeFlaws.length === 0 ? (
        <div className="py-8 text-center text-[var(--text-muted)]">
          <div className="w-10 h-10 rounded-full bg-[var(--status-success)]/10 border border-[var(--status-success)]/30 text-[var(--status-success)] mx-auto flex items-center justify-center mb-2">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-sm font-serif text-[var(--text-primary)]">
            No Delivery Deviations Detected
          </p>
          <p className="text-xs font-sans text-[var(--text-muted)] mt-1 max-w-md mx-auto">
            This delivery aligns with benchmark acoustic expectations across pitch contour modulation,
            dynamic contrast, and punctuation pauses.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {safeFlaws.map((flaw, idx) => {
            const isSelected = selectedFlaw?.id === flaw.id;
            const isLooping =
              loopRange && loopRange[0] === flaw.startTime && loopRange[1] === flaw.endTime;

            const isCrit = flaw.severity === 'critical';
            const severityColor = isCrit ? 'text-[var(--status-error)]' : 'text-[var(--status-warning)]';
            const borderHighlight = isSelected
              ? 'border-[var(--accent-primary)] ring-1 ring-[var(--accent-primary)]/40 shadow-xs'
              : 'border-[var(--border-subtle)]';

            return (
              <div
                key={flaw.id}
                onClick={() => onSelectFlaw(flaw)}
                className={`p-4 rounded-xl border bg-[var(--bg-secondary)] transition-all cursor-pointer ${borderHighlight} hover:border-[var(--border-strong)]`}
              >
                {/* Header row: Index, Category, Timestamps & Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-[var(--text-muted)]">
                      #{idx + 1}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold uppercase tracking-wider ${severityColor}`}
                    >
                      {flaw.severity}
                    </span>
                    <span className="text-[var(--text-muted)]">·</span>
                    <span className="text-sm font-serif font-normal text-[var(--text-primary)]">
                      {flaw.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Timestamp Bounds */}
                    <div className="px-2 py-0.5 rounded bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-[11px] font-mono tabular-nums text-[var(--text-muted)]">
                      [{flaw.startTime.toFixed(2)}s – {flaw.endTime.toFixed(2)}s] · Δ {flaw.duration.toFixed(2)}s
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSeek(flaw.startTime);
                      }}
                      className="px-2.5 py-1 text-xs font-sans font-medium bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-md transition-colors cursor-pointer"
                      title="Jump audio to start of flaw"
                    >
                      Jump
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleLoopFlaw(flaw);
                      }}
                      className={`flex items-center gap-1 px-2.5 py-1 text-xs font-sans font-medium rounded-md transition-colors cursor-pointer ${
                        isLooping
                          ? 'bg-[#173F30] text-white'
                          : 'bg-[var(--surface-elevated)] border border-[var(--accent-primary)]/40 text-[var(--accent-primary)] hover:bg-[var(--accent-soft)]'
                      }`}
                    >
                      <RefreshCw className={`w-3 h-3 ${isLooping ? 'animate-spin' : ''}`} />
                      {isLooping ? 'Looping' : 'Loop Snippet'}
                    </button>
                  </div>
                </div>

                {/* Phrase Excerpt Quote */}
                <div className="mb-3 px-3 py-1.5 bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-lg text-xs font-serif italic text-[var(--text-secondary)]">
                  "{flaw.phraseExcerpt}"
                </div>

                {/* Two-Column Grid: Mathematical Rationale vs Causal Rhetorical Impact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  {/* Left: Mathematical Delta */}
                  <div className="p-3 bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-lg">
                    <div className="flex items-center gap-1.5 text-xs font-sans font-semibold text-[var(--accent-primary)] mb-1">
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Mathematical Rationale</span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-mono">
                      {flaw.mathematicalRationale}
                    </p>
                    <div className="mt-2 pt-2 border-t border-[var(--border-subtle)] flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-mono text-[var(--text-muted)]">
                      <span>
                        ΔF0:{' '}
                        <strong className="text-[var(--text-primary)]">
                          {flaw.acousticDeltas.f0DeltaHz > 0 ? `+${flaw.acousticDeltas.f0DeltaHz}` : flaw.acousticDeltas.f0DeltaHz} Hz
                        </strong>
                      </span>
                      <span>
                        Z-Score:{' '}
                        <strong className="text-[var(--text-primary)]">
                          {flaw.acousticDeltas.f0ZScore.toFixed(2)}σ
                        </strong>
                      </span>
                      <span>
                        ΔRMS:{' '}
                        <strong className="text-[var(--text-primary)]">
                          {flaw.acousticDeltas.rmsDeltaDb} dB
                        </strong>
                      </span>
                      <span>
                        DTW Warp:{' '}
                        <strong className="text-[var(--text-primary)]">
                          {flaw.acousticDeltas.tempoRatio.toFixed(2)}×
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* Right: Causal Explainability */}
                  <div className="p-3 bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-lg">
                    <div className="flex items-center gap-1.5 text-xs font-sans font-semibold text-[var(--status-warning)] mb-1">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Causal Rhetorical Impact</span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans">
                      {flaw.causalExplanation}
                    </p>
                  </div>
                </div>

                {/* Coaching Drill Recommendation */}
                <div className="p-2.5 bg-[var(--surface-elevated)] border border-[var(--accent-primary)]/30 rounded-lg flex items-start gap-2.5">
                  <Target className="w-4 h-4 text-[var(--accent-primary)] shrink-0 mt-0.5" />
                  <div className="text-xs font-sans">
                    <span className="font-semibold text-[var(--text-primary)]">
                      Prescribed Rehearsal Drill:{' '}
                    </span>
                    <span className="text-[var(--text-secondary)]">{flaw.coachingDrill}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
