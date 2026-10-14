import React from 'react';
import { SpeechBenchmark, FlawVariant } from '../types/speech';
import { X, Printer, Download, Award, FileSpreadsheet } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  benchmark: SpeechBenchmark;
  activeVariant: FlawVariant;
  sessionTitle?: string;
  category?: string;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  benchmark,
  activeVariant,
  sessionTitle,
  category,
}) => {
  if (!isOpen) return null;

  const evalResult = activeVariant.evaluation;

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    const reportData = {
      product: 'FRIDAY — AI Speech Intelligence',
      generatedAt: new Date().toISOString(),
      speechTitle: sessionTitle || benchmark.title,
      category: category || benchmark.category,
      referenceBenchmark: {
        id: benchmark.id,
        title: benchmark.title,
        speaker: benchmark.speaker,
        year: benchmark.year,
      },
      evaluationTier: activeVariant.label,
      overallScore: evalResult.overallScore,
      confidenceInterval: evalResult.confidenceInterval,
      rubricCriteria: evalResult.rubricCriteria,
      flaws: activeVariant.flaws,
      acousticStats: activeVariant.acousticTrajectory.stats,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `friday_diagnostic_report_${benchmark.id}_${activeVariant.levelId}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleExportCsv = () => {
    const headers = 'TimeSec,F0_Hz,F0_Normalized,Rms_dBFS,Rms_Normalized,SpectralCentroid_Hz,SpeechRate_SylSec,IsPause\n';
    const rows = activeVariant.acousticTrajectory.frames
      .map(
        (f) =>
          `${f.time},${f.f0 || 0},${f.f0Normalized || 0},${f.rmsDb},${f.rmsNormalized},${f.spectralCentroid},${f.speechRate},${f.isPause ? 1 : 0}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `friday_acoustic_features_${benchmark.id}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[var(--forest-deep)]/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[var(--surface-elevated)] border border-[var(--border-strong)] rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-6 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" />
            <span className="text-[var(--text-muted)]">·</span>
            <span className="text-xs font-mono uppercase tracking-wider text-[var(--accent-primary)] font-semibold">
              Diagnostic Dossier
            </span>
          </div>

          <div className="flex items-center gap-2 mr-6">
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 text-xs font-sans font-medium text-[var(--text-primary)] bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[var(--status-success)]" />
              <span>CSV Features</span>
            </button>
            <button
              onClick={handleExportJson}
              className="px-3 py-1.5 text-xs font-sans font-medium text-[var(--text-primary)] bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              <span>JSON Dossier</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-sans font-semibold text-white bg-[#173F30] hover:bg-[#244A36] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div className="space-y-6 text-[var(--text-primary)]">
          {/* Header Info */}
          <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl flex justify-between items-start">
            <div className="space-y-1">
              <h1 className="font-serif text-xl sm:text-2xl text-[var(--text-primary)]">
                {sessionTitle || benchmark.title}
              </h1>
              <p className="text-xs font-sans text-[var(--text-muted)]">
                Category: <strong className="text-[var(--text-primary)]">{category || benchmark.category}</strong> · Reference: {benchmark.title} ({benchmark.speaker})
              </p>
              <p className="text-xs font-sans text-[var(--text-muted)]">Context: {benchmark.historicalContext}</p>
            </div>
            <div className="text-right">
              <div className="font-serif text-2xl text-[var(--accent-primary)]">
                {evalResult.overallScore} / 100
              </div>
              <span className="text-[11px] font-mono text-[var(--text-muted)]">
                Tier: {activeVariant.label}
              </span>
            </div>
          </div>

          {/* Executive Summary */}
          <div>
            <h3 className="text-xs font-sans font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
              Executive Evaluation Summary
            </h3>
            <p className="text-xs font-sans text-[var(--text-secondary)] leading-relaxed p-3.5 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)]">
              {evalResult.executiveSummary}
            </p>
          </div>

          {/* 5-Criteria Rubric Breakdown */}
          <div>
            <h3 className="text-xs font-sans font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
              Rubric Dimension Breakdown
            </h3>
            <div className="space-y-2">
              {evalResult.rubricCriteria.map((c) => (
                <div
                  key={c.id}
                  className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-[var(--text-primary)]">{c.name}</span>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{c.feedback}</p>
                  </div>
                  <div className="text-right shrink-0 ml-4 font-mono">
                    <span className="font-bold text-[var(--text-primary)]">{c.score} / {c.maxScore}</span>
                    <div className="text-[10px] text-[var(--text-muted)]">{c.deltaSummary}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Temporally Grounded Flaws */}
          <div>
            <h3 className="text-xs font-sans font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
              Grounded Temporal Flaws ({activeVariant.flaws.length})
            </h3>
            {activeVariant.flaws.length === 0 ? (
              <p className="text-xs text-[var(--status-success)]">Zero flaws detected. Flawless canonical baseline.</p>
            ) : (
              <div className="space-y-2">
                {activeVariant.flaws.map((f, idx) => (
                  <div
                    key={f.id}
                    className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg text-xs"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-[var(--status-error)]">
                        #{idx + 1} {f.category}
                      </span>
                      <span className="font-mono text-[11px] text-[var(--text-muted)]">
                        [{f.startTime.toFixed(2)}s – {f.endTime.toFixed(2)}s]
                      </span>
                    </div>
                    <p className="font-serif italic text-[var(--text-secondary)] mb-1.5">
                      "{f.phraseExcerpt}"
                    </p>
                    <div className="font-mono text-[11px] text-[var(--accent-primary)] mb-1">
                      {f.mathematicalRationale}
                    </div>
                    <div className="text-[var(--text-muted)] text-[11px]">
                      <strong>Coaching Drill:</strong> {f.coachingDrill}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
