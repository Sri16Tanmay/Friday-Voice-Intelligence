import React from 'react';
import { EvaluationResult, RubricCriterion } from '../types/speech';
import { Award, ArrowUpRight } from 'lucide-react';

interface RubricScorecardProps {
  evaluation: EvaluationResult;
}

export const RubricScorecard: React.FC<RubricScorecardProps> = ({ evaluation }) => {
  const getStatusBadge = (status: RubricCriterion['status']) => {
    switch (status) {
      case 'excellent':
        return <span className="text-xs font-sans font-semibold text-[var(--status-success)]">Superior (18–20)</span>;
      case 'proficient':
        return <span className="text-xs font-sans font-semibold text-[var(--accent-primary)]">Proficient (14–17)</span>;
      case 'needs_work':
        return <span className="text-xs font-sans font-semibold text-[var(--status-warning)]">Developing (10–13)</span>;
      case 'deficient':
        return <span className="text-xs font-sans font-semibold text-[var(--status-error)]">Deficient (&lt;10)</span>;
    }
  };

  return (
    <div className="bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-xl p-5 mb-6 shadow-xs transition-colors duration-300">
      {/* Top Banner: Composite Score & Executive Summary */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-5 mb-5 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-5">
          {/* Overall Score Box */}
          <div className="w-24 h-24 rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-secondary)] flex flex-col items-center justify-center shrink-0 shadow-xs">
            <span className="text-3xl font-serif tabular-nums text-[var(--text-primary)]">
              {evaluation.overallScore}
            </span>
            <span className="text-[10px] uppercase font-sans tracking-widest text-[var(--text-muted)] mt-0.5">
              Score / 100
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-[var(--accent-primary)]" />
              <h2 className="text-base font-serif text-[var(--text-primary)] font-normal tracking-tight">
                Reproducible Forensic Rubric Scoring
              </h2>
            </div>
            <p className="text-xs font-sans text-[var(--text-secondary)] max-w-xl leading-relaxed">
              {evaluation.executiveSummary}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[var(--text-muted)] mt-2">
              <span>95% CI: [{evaluation?.confidenceInterval?.[0] ?? 60} – {evaluation?.confidenceInterval?.[1] ?? 85}]</span>
              <span>·</span>
              <span>DTW Warping Ratio: {evaluation?.dtwWarpRatio ?? 1.0}×</span>
              <span>·</span>
              <span>Acoustic Fidelity: {evaluation?.alignmentSimilarityScore ?? 80}%</span>
            </div>
          </div>
        </div>

        {/* Priority Coaching Drill */}
        <div className="lg:w-80 p-3.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg">
          <div className="text-xs font-sans font-semibold text-[var(--accent-primary)] uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Primary Coaching Focus</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
          <ul className="space-y-1.5">
            {(evaluation?.priorityFixes || ['Consistent breath support through phrase terminations.']).map((fix, idx) => (
              <li key={idx} className="text-xs font-sans text-[var(--text-secondary)] leading-snug flex items-start gap-1.5">
                <span className="text-[var(--accent-primary)] font-mono font-bold">›</span>
                <span>{fix}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 5-Criteria Rubric Breakdown */}
      <div className="space-y-3">
        <div className="text-xs font-sans font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
          Forensics & Oratory Dimensions (20 pts Each)
        </div>

        {evaluation.rubricCriteria.map((c) => {
          const scorePercent = (c.score / c.maxScore) * 100;
          return (
            <div
              key={c.id}
              className="p-3.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg hover:border-[var(--border-strong)] transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-sans font-semibold text-[var(--text-primary)]">
                    {c.name}
                  </span>
                  <span className="text-[var(--text-muted)]">·</span>
                  {getStatusBadge(c.status)}
                </div>

                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className="text-[var(--text-muted)]">{c.deltaSummary}</span>
                  <span className="text-[var(--text-primary)] font-bold tabular-nums">
                    {c.score} / {c.maxScore} pts
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1 bg-[var(--chart-grid)] rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    c.score >= 16
                      ? 'bg-[var(--status-success)]'
                      : c.score >= 13
                      ? 'bg-[var(--accent-primary)]'
                      : c.score >= 10
                      ? 'bg-[var(--status-warning)]'
                      : 'bg-[var(--status-error)]'
                  }`}
                  style={{ width: `${scorePercent}%` }}
                />
              </div>

              {/* Qualitative Diagnostics */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs font-sans text-[var(--text-muted)]">
                <p className="text-[var(--text-secondary)] leading-relaxed">{c.feedback}</p>
                <div className="shrink-0 font-mono text-[11px] text-[var(--text-muted)]">
                  Reference: <span className="text-[var(--accent-primary)]">{c.benchmarkValue}</span> · Participant: <span className="text-[var(--text-primary)]">{c.participantValue}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
