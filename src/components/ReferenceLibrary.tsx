import React, { useState } from 'react';
import { SpeechBenchmark, FlawLevelId } from '../types/speech';
import { Download, BookOpen, Play, CheckCircle, Volume2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { AppView } from './Navigation';

interface ReferenceLibraryProps {
  benchmarks: SpeechBenchmark[];
  onSelectAndAnalyze: (benchmark: SpeechBenchmark, levelId: FlawLevelId) => void;
}

export const ReferenceLibrary: React.FC<ReferenceLibraryProps> = ({
  benchmarks,
  onSelectAndAnalyze,
}) => {
  const [activeSpeechId, setActiveSpeechId] = useState<string>(benchmarks[0].id);

  const currentSpeech = benchmarks.find((b) => b.id === activeSpeechId) || benchmarks[0];

  const handleDownloadDatasetJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(benchmarks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'friday_contrastive_dataset_v1.0.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Overview Banner */}
      <div className="p-6 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[var(--accent-primary)]" />
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--accent-primary)] font-semibold">
                Contrastive Benchmark Dataset
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl text-[var(--text-primary)] font-normal tracking-tight">
              Reference Speech Library & Ground Truth Corpus
            </h1>
            <p className="text-xs font-sans text-[var(--text-secondary)] max-w-2xl leading-relaxed">
              Engineered oratorical dataset pairing canonical master deliveries against an intentional
              gradient of flaws across identical transcripts. Formally verified for reproducible temporal
              flaw grounding.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleDownloadDatasetJson}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-sans font-semibold text-[var(--text-primary)] bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)] rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              <span>Download Dataset JSON</span>
            </button>
          </div>
        </div>

        {/* Dataset Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-[var(--border-subtle)]">
          <div>
            <span className="text-[10px] uppercase font-sans font-semibold text-[var(--text-muted)]">
              Canonical Works
            </span>
            <div className="text-xl font-serif text-[var(--text-primary)] mt-0.5">
              {benchmarks.length} Oratorical Benchmarks
            </div>
            <span className="text-[11px] font-sans text-[var(--text-muted)]">JFK, Steve Jobs, MLK</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-sans font-semibold text-[var(--text-muted)]">
              Mirror Spectrum
            </span>
            <div className="text-xl font-serif text-[var(--accent-primary)] mt-0.5">
              4 Tiers per Text
            </div>
            <span className="text-[11px] font-sans text-[var(--text-muted)]">Ideal → Subtle → Moderate → Egregious</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-sans font-semibold text-[var(--text-muted)]">
              Forced Aligned Tokens
            </span>
            <div className="text-xl font-serif text-[var(--text-primary)] mt-0.5">
              {benchmarks.reduce((sum, b) => sum + b.alignedWords.length, 0)} Words
            </div>
            <span className="text-[11px] font-sans text-[var(--text-muted)]">Temporally Bounded</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-sans font-semibold text-[var(--text-muted)]">
              Ground-Truth Flaws
            </span>
            <div className="text-xl font-serif text-[var(--status-error)] mt-0.5">
              {benchmarks.reduce(
                (sum, b) =>
                  sum +
                  b.variants.level_1_egregious.flaws.length +
                  b.variants.level_2_moderate.flaws.length +
                  b.variants.level_3_subtle.flaws.length,
                0
              )}{' '}
              Labeled Bounds
            </div>
            <span className="text-[11px] font-sans text-[var(--text-muted)]">With Mathematical Rationales</span>
          </div>
        </div>
      </div>

      {/* Speech Selector Tabs */}
      <div className="flex border-b border-[var(--border-subtle)] gap-4 overflow-x-auto pb-1">
        {benchmarks.map((b) => (
          <button
            key={b.id}
            onClick={() => setActiveSpeechId(b.id)}
            className={`pb-2.5 text-xs font-sans font-semibold uppercase tracking-wider transition-colors whitespace-nowrap cursor-pointer border-b-2 ${
              activeSpeechId === b.id
                ? 'border-[var(--accent-primary)] text-[var(--text-primary)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            {b.title} ({b.speaker})
          </button>
        ))}
      </div>

      {/* Active Speech Deep-Dive */}
      <div className="p-6 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] space-y-6">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="font-serif text-2xl text-[var(--text-primary)] font-normal">
              {currentSpeech.title}
            </h2>
            <span className="text-xs font-mono text-[var(--accent-primary)] bg-[var(--accent-soft)] border border-[var(--accent-primary)]/30 px-2.5 py-1 rounded-md self-start sm:self-auto">
              {currentSpeech.category} · {currentSpeech.year}
            </span>
          </div>
          <p className="text-xs font-sans text-[var(--text-muted)] mt-1">{currentSpeech.historicalContext}</p>
          <div className="mt-3 p-3.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl text-xs font-serif italic text-[var(--text-secondary)] leading-relaxed">
            "{currentSpeech.transcript}"
          </div>
        </div>

        {/* 4 Contrastive Variants Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(['ideal', 'level_3_subtle', 'level_2_moderate', 'level_1_egregious'] as FlawLevelId[]).map((lvl) => {
            const v = currentSpeech.variants[lvl];
            return (
              <div
                key={lvl}
                className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl flex flex-col justify-between hover:border-[var(--border-strong)] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      {lvl === 'ideal' && <CheckCircle className="w-4 h-4 text-[var(--status-success)]" />}
                      {lvl === 'level_3_subtle' && <Volume2 className="w-4 h-4 text-[var(--accent-primary)]" />}
                      {lvl === 'level_2_moderate' && <AlertTriangle className="w-4 h-4 text-[var(--status-warning)]" />}
                      {lvl === 'level_1_egregious' && <ShieldAlert className="w-4 h-4 text-[var(--status-error)]" />}
                      <span className="text-sm font-sans font-semibold text-[var(--text-primary)]">
                        {v.label}
                      </span>
                    </div>

                    <span className="text-xs font-mono font-bold text-[var(--accent-primary)]">
                      Score: {v.targetOverallScore} / 100
                    </span>
                  </div>

                  <p className="text-xs font-sans text-[var(--text-secondary)] mb-3 leading-relaxed">
                    {v.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2 p-2 bg-[var(--surface-elevated)] rounded-lg font-mono text-[11px] text-[var(--text-muted)] mb-3">
                    <div>
                      <div className="text-[10px] uppercase">F0 Dynamic</div>
                      <div className="text-[var(--text-primary)] font-semibold">
                        {v.acousticTrajectory.stats.f0DynamicRangeSemitones} st
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase">RMS Std Dev</div>
                      <div className="text-[var(--text-primary)] font-semibold">
                        σ = {v.acousticTrajectory.stats.stdRmsDb} dB
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase">Syllable Rate</div>
                      <div className="text-[var(--text-primary)] font-semibold">
                        {v.acousticTrajectory.stats.averageSyllableRate} syl/s
                      </div>
                    </div>
                  </div>

                  {v.flaws.length > 0 && (
                    <div className="text-xs font-sans text-[var(--text-muted)] mb-3">
                      <span className="font-semibold text-[var(--text-primary)]">
                        {v.flaws.length} Ground-Truth Flaw Bounds:
                      </span>
                      <ul className="mt-1 space-y-1">
                        {v.flaws.map((flaw) => (
                          <li key={flaw.id} className="text-[11px] flex items-start gap-1">
                            <span className="text-[var(--accent-primary)] font-bold">›</span>
                            <span>
                              [{flaw.startTime.toFixed(2)}s–{flaw.endTime.toFixed(2)}s]{' '}
                              <strong className="text-[var(--text-primary)]">{flaw.category}</strong>:{' '}
                              {flaw.phraseExcerpt}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onSelectAndAnalyze(currentSpeech, lvl)}
                  className="w-full mt-2 py-2 px-3 text-xs font-sans font-semibold text-white bg-[#173F30] hover:bg-[#244A36] border border-[#173F30] rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Inspect in Diagnostic Dashboard</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
