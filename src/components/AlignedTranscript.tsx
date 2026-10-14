import React from 'react';
import { AlignedWord, TemporalFlaw } from '../types/speech';
import { AlignLeft } from 'lucide-react';

interface AlignedTranscriptProps {
  alignedWords: AlignedWord[];
  flaws: TemporalFlaw[];
  currentTime: number;
  onSeek: (time: number) => void;
  onSelectFlawByWord: (flaw: TemporalFlaw) => void;
}

export const AlignedTranscript: React.FC<AlignedTranscriptProps> = ({
  alignedWords,
  flaws,
  currentTime,
  onSeek,
  onSelectFlawByWord,
}) => {
  const getWordFlaw = (word: AlignedWord) => {
    return flaws.find(
      (f) => word.startTime >= f.startTime - 0.1 && word.endTime <= f.endTime + 0.1
    );
  };

  return (
    <div className="bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-xl p-5 mb-6 shadow-xs transition-colors duration-300">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2">
            <AlignLeft className="w-4 h-4 text-[var(--accent-primary)]" />
            <h2 className="text-sm font-sans font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Forced Alignment Karaoke Stream
            </h2>
          </div>
          <p className="text-xs font-sans text-[var(--text-muted)] mt-0.5">
            Phonetically aligned word tokens. Champagne gold indicators signify rhetorical stress; coral/amber flags denote grounded flaws. Click any token to jump audio.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-xs font-sans text-[var(--text-muted)]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)]" />
            <span>Active Word</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--waveform-participant)]" />
            <span>Rhetorical Stress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--status-error)]" />
            <span>Grounded Flaw</span>
          </div>
        </div>
      </div>

      {/* Word Stream */}
      <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl flex flex-wrap gap-x-2 gap-y-3 leading-relaxed text-sm">
        {alignedWords.map((w) => {
          const isActive = currentTime >= w.startTime && currentTime <= w.endTime;
          const flaw = getWordFlaw(w);
          const isHighStress = w.stressWeight >= 0.8;

          return (
            <span
              key={w.id}
              onClick={() => {
                onSeek(w.startTime);
                if (flaw) onSelectFlawByWord(flaw);
              }}
              title={`[${w.startTime.toFixed(2)}s – ${w.endTime.toFixed(2)}s] · Expected: ${w.pitchExpectedHz} Hz / ${w.rmsExpectedDb} dB${
                flaw ? ` · FLAW: ${flaw.category}` : ''
              }`}
              className={`relative group inline-flex items-center px-2 py-0.5 rounded-md font-sans text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#173F30] text-white font-semibold shadow-xs scale-105 z-10'
                  : flaw
                  ? flaw.severity === 'critical'
                    ? 'bg-[var(--status-error)]/12 text-[var(--status-error)] border-b-2 border-[var(--status-error)] hover:bg-[var(--status-error)]/20'
                    : 'bg-[var(--status-warning)]/12 text-[var(--status-warning)] border-b-2 border-[var(--status-warning)] hover:bg-[var(--status-warning)]/20'
                  : isHighStress
                  ? 'text-[var(--waveform-participant)] font-medium hover:bg-[var(--surface-hover)]'
                  : 'text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
              }`}
            >
              <span>{w.word}</span>

              {isHighStress && !isActive && (
                <span className="ml-1 w-1.5 h-1.5 rounded-full bg-[var(--waveform-participant)] inline-block align-middle" />
              )}

              {/* Hover Timestamp Tooltip */}
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-[var(--surface-elevated)] border border-[var(--border-strong)] text-[var(--text-primary)] text-[10px] font-mono px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-20">
                {w.startTime.toFixed(2)}s
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
};
