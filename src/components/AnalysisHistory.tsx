import React from 'react';
import { AnalysisSession } from '../types/speech';
import { Clock, Trash2, ArrowRight, Award, PlusCircle } from 'lucide-react';
import { AppView } from './Navigation';

interface AnalysisHistoryProps {
  sessions: AnalysisSession[];
  onOpenSession: (session: AnalysisSession) => void;
  onDeleteSession: (id: string) => void;
  onNavigate: (view: AppView) => void;
}

export const AnalysisHistory: React.FC<AnalysisHistoryProps> = ({
  sessions,
  onOpenSession,
  onDeleteSession,
  onNavigate,
}) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
        <div>
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--accent-primary)] font-semibold block mb-2">
            Archived Sessions
          </span>
          <h1 className="font-serif text-3xl text-[var(--text-primary)] font-normal tracking-tight">
            Analysis History & Longitudinal Records
          </h1>
          <p className="text-xs font-sans text-[var(--text-muted)] mt-1">
            Persisted records of your speech evaluations, temporal flaw bounds, and rubric progress over time.
          </p>
        </div>

        <button
          onClick={() => onNavigate('analysis')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#173F30] hover:bg-[#244A36] text-white text-xs font-sans font-semibold border border-[#173F30] transition-all cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Analysis</span>
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-[var(--border-subtle)] rounded-2xl bg-[var(--surface-elevated)] p-8 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--accent-soft)] border border-[var(--accent-primary)]/30 mx-auto flex items-center justify-center text-[var(--accent-primary)]">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif text-xl text-[var(--text-primary)] font-normal">
              No Analysis History Recorded Yet
            </h2>
            <p className="text-xs font-sans text-[var(--text-muted)] mt-1 max-w-sm mx-auto">
              Completed speech analyses will be logged here with acoustic metrics, grounded flaws, and score comparisons.
            </p>
          </div>
          <button
            onClick={() => onNavigate('analysis')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#173F30] hover:bg-[#244A36] text-white text-xs font-sans font-semibold border border-[#173F30] transition-colors cursor-pointer shadow-xs"
          >
            <span>Start Your First Analysis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-serif text-base text-[var(--text-primary)]">
                    {session.speechTitle}
                  </span>
                  <span className="text-[var(--text-muted)]">·</span>
                  <span className="text-xs font-sans text-[var(--text-muted)]">{session.category}</span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[var(--text-muted)]">
                  <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                  <span>·</span>
                  <span>Ref: {session.referenceTitle}</span>
                  <span>·</span>
                  <span>{session.duration}s duration</span>
                  <span>·</span>
                  <span className="text-[var(--status-error)]">{session.flawCount} flaws detected</span>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <div className="font-serif text-xl text-[var(--text-primary)] tabular-nums">
                    {session.overallScore} <span className="text-xs font-sans text-[var(--text-muted)]">/ 100</span>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">
                    95% CI: [{session.confidenceInterval[0]}–{session.confidenceInterval[1]}]
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenSession(session)}
                    className="px-3 py-1.5 rounded-lg bg-[#173F30] hover:bg-[#244A36] text-white text-xs font-sans font-semibold border border-[#173F30] transition-colors cursor-pointer shadow-xs"
                  >
                    Open Dossier
                  </button>

                  <button
                    onClick={() => onDeleteSession(session.id)}
                    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--status-error)] transition-colors cursor-pointer"
                    title="Delete session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
