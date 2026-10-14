import React from 'react';
import {
  SpeechBenchmark,
  FlawLevelId,
  FlawVariant,
  TemporalFlaw,
  AcousticTrajectory,
} from '../types/speech';
import { DualAudioPlayer } from './DualAudioPlayer';
import { ComparativeTimeline } from './ComparativeTimeline';
import { AlignedTranscript } from './AlignedTranscript';
import { FlawInspector } from './FlawInspector';
import { RubricScorecard } from './RubricScorecard';
import { ArrowLeft, Download, Award, Sliders, CheckCircle, FileText } from 'lucide-react';
import { AppView } from './Navigation';

interface ResultsDashboardProps {
  sessionTitle: string;
  category: string;
  referenceBenchmark: SpeechBenchmark;
  activeVariant: FlawVariant;
  selectedLevel: FlawLevelId;
  onSelectLevel: (lvl: FlawLevelId) => void;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  playbackMode: 'ideal' | 'flawed';
  onChangePlaybackMode: (mode: 'ideal' | 'flawed') => void;
  selectedFlaw: TemporalFlaw | null;
  onSelectFlaw: (flaw: TemporalFlaw | null) => void;
  loopRange: [number, number] | null;
  onToggleLoopFlaw: (flaw: TemporalFlaw) => void;
  onClearLoop: () => void;
  onOpenReport: () => void;
  onNavigate: (view: AppView) => void;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  sessionTitle,
  category,
  referenceBenchmark,
  activeVariant,
  selectedLevel,
  onSelectLevel,
  isPlaying,
  onPlay,
  onPause,
  onReset,
  currentTime,
  duration,
  onSeek,
  playbackMode,
  onChangePlaybackMode,
  selectedFlaw,
  onSelectFlaw,
  loopRange,
  onToggleLoopFlaw,
  onClearLoop,
  onOpenReport,
  onNavigate,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Results Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('analysis')}
              className="text-xs font-sans text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-1 cursor-pointer transition-colors mr-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Workspace</span>
            </button>
            <span className="text-[var(--text-muted)]">·</span>
            <span className="text-xs font-mono uppercase tracking-wider text-[var(--accent-primary)] font-semibold">
              Analysis Results Dossier
            </span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl text-[var(--text-primary)] font-normal tracking-tight">
            {sessionTitle}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs font-sans text-[var(--text-muted)]">
            <span>Category: <strong className="text-[var(--text-primary)]">{category}</strong></span>
            <span>·</span>
            <span>Reference: <strong className="text-[var(--text-primary)]">{referenceBenchmark.title}</strong> ({referenceBenchmark.speaker})</span>
            <span>·</span>
            <span className="text-[var(--status-success)] flex items-center gap-1 font-semibold">
              <CheckCircle className="w-3.5 h-3.5" />
              Evaluation Verified
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenReport}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#173F30] hover:bg-[#244A36] text-white text-xs font-sans font-semibold border border-[#173F30] transition-all cursor-pointer shadow-xs"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Diagnostic Report & Export</span>
          </button>
        </div>
      </div>

      {/* Benchmark Variant Gradient Filter */}
      <div className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <span className="text-xs font-sans font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Comparison Baseline Tier
            </span>
            <p className="text-xs font-sans text-[var(--text-muted)] mt-0.5">
              Switch the reference contrastive model across the intentional gradient to inspect relative divergence.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'ideal', label: 'Ideal Benchmark', tier: '95–100 pts' },
            { id: 'level_3_subtle', label: 'Level 3: Subtle', tier: '85–92 pts' },
            { id: 'level_2_moderate', label: 'Level 2: Moderate', tier: '65–75 pts' },
            { id: 'level_1_egregious', label: 'Level 1: Egregious', tier: '<50 pts' },
          ].map((lvl) => (
            <button
              key={lvl.id}
              onClick={() => onSelectLevel(lvl.id as FlawLevelId)}
              className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                selectedLevel === lvl.id
                  ? 'border-[var(--accent-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] font-semibold ring-1 ring-[var(--accent-primary)]/30'
                  : 'border-[var(--border-subtle)] bg-transparent text-[var(--text-muted)] hover:border-[var(--border-strong)]'
              }`}
            >
              <div className="font-sans">{lvl.label}</div>
              <div className="text-[11px] font-mono text-[var(--accent-primary)] mt-0.5">{lvl.tier}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Synchronized Dual Audio Player Transport Bar */}
      <DualAudioPlayer
        isPlaying={isPlaying}
        onPlay={onPlay}
        onPause={onPause}
        onReset={onReset}
        currentTime={currentTime}
        duration={duration}
        onSeek={onSeek}
        playbackMode={playbackMode}
        onChangePlaybackMode={onChangePlaybackMode}
        loopRange={loopRange}
        onClearLoop={onClearLoop}
        activeFlaw={selectedFlaw}
      />

      {/* High-Resolution Comparative Time-Series Overlay (Waveform, Spectrogram, F0, RMS) */}
      <ComparativeTimeline
        idealTraj={referenceBenchmark.idealTrajectory}
        participantTraj={activeVariant.acousticTrajectory}
        flaws={activeVariant.flaws}
        alignedWords={referenceBenchmark.alignedWords}
        currentTime={currentTime}
        duration={duration}
        onSeek={onSeek}
        selectedFlaw={selectedFlaw}
        onSelectFlaw={onSelectFlaw}
        loopRange={loopRange}
        onToggleLoopFlaw={onToggleLoopFlaw}
        selectedLevel={selectedLevel}
      />

      {/* Forced Alignment Word Karaoke Stream */}
      <AlignedTranscript
        alignedWords={referenceBenchmark.alignedWords}
        flaws={activeVariant.flaws}
        currentTime={currentTime}
        onSeek={onSeek}
        onSelectFlawByWord={onSelectFlaw}
      />

      {/* Temporal Flaw Grounding & Evidence Panel */}
      <FlawInspector
        flaws={activeVariant.flaws}
        selectedFlaw={selectedFlaw}
        onSelectFlaw={onSelectFlaw}
        onSeek={onSeek}
        loopRange={loopRange}
        onToggleLoopFlaw={onToggleLoopFlaw}
      />

      {/* Evaluative Rubric Scorecard */}
      <RubricScorecard evaluation={activeVariant.evaluation} />
    </div>
  );
};
