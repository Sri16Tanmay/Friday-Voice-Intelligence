import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Repeat,
} from 'lucide-react';
import { TemporalFlaw } from '../types/speech';

interface DualAudioPlayerProps {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  playbackMode: 'ideal' | 'flawed';
  onChangePlaybackMode: (mode: 'ideal' | 'flawed') => void;
  loopRange: [number, number] | null;
  onClearLoop: () => void;
  activeFlaw: TemporalFlaw | null;
}

export const DualAudioPlayer: React.FC<DualAudioPlayerProps> = ({
  isPlaying,
  onPlay,
  onPause,
  onReset,
  currentTime,
  duration,
  onSeek,
  playbackMode,
  onChangePlaybackMode,
  loopRange,
  onClearLoop,
  activeFlaw,
}) => {
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1);
    return `${mins.toString().padStart(2, '0')}:${secs.padStart(4, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-xl p-4 mb-6 shadow-xs transition-colors duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Transport Controls & Scrubber */}
        <div className="flex items-center gap-4 flex-1">
          {/* Play/Pause Button */}
          <button
            onClick={isPlaying ? onPause : onPlay}
            className="w-10 h-10 rounded-lg bg-[#173F30] hover:bg-[#244A36] text-white border border-[#173F30] flex items-center justify-center shadow-xs transition-all shrink-0 cursor-pointer"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          {/* Reset */}
          <button
            onClick={onReset}
            className="w-8 h-8 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center justify-center transition-colors shrink-0 cursor-pointer hover:bg-[var(--surface-hover)]"
            aria-label="Restart playback"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Time Scrubber */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex justify-between items-center text-xs font-mono tabular-nums text-[var(--text-muted)] mb-1.5">
              <span className="text-[var(--text-primary)] font-semibold">
                {formatTime(currentTime)}
              </span>
              <span>{formatTime(duration)}</span>
            </div>
            <div
              className="relative w-full h-1.5 bg-[var(--chart-grid)] rounded-full cursor-pointer group"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                onSeek(pos * duration);
              }}
            >
              <div
                className="absolute top-0 left-0 h-full bg-[var(--accent-primary)] rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[var(--forest-deep)] dark:bg-[var(--text-primary)] border border-[var(--accent-primary)] rounded-full shadow-xs -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Center: A/B Contrastive Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-subtle)] shrink-0">
          <button
            onClick={() => onChangePlaybackMode('flawed')}
            className={`px-3 py-1.5 text-xs font-sans font-medium rounded-md transition-all cursor-pointer whitespace-nowrap ${
              playbackMode === 'flawed'
                ? 'bg-[#C6A66A] text-[#173F30] font-semibold shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Audition Participant (Champagne)
          </button>
          <button
            onClick={() => onChangePlaybackMode('ideal')}
            className={`px-3 py-1.5 text-xs font-sans font-medium rounded-md transition-all cursor-pointer whitespace-nowrap ${
              playbackMode === 'ideal'
                ? 'bg-[#315A43] text-white font-semibold shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Audition Reference (Emerald)
          </button>
        </div>

        {/* Right: Loop Indicator & Volume */}
        <div className="flex items-center gap-3 shrink-0">
          {loopRange && (
            <button
              onClick={onClearLoop}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-[var(--accent-primary)] bg-[var(--accent-soft)] border border-[var(--accent-primary)]/30 rounded-lg hover:opacity-85 transition-colors cursor-pointer"
            >
              <Repeat className="w-3 h-3 animate-spin" />
              <span>Loop: {loopRange[0].toFixed(1)}s–{loopRange[1].toFixed(1)}s</span>
              <span className="text-[var(--text-muted)] hover:text-[var(--text-primary)] ml-1">×</span>
            </button>
          )}

          <div className="flex items-center gap-2 text-[var(--text-muted)]">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-[var(--text-muted)]" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                if (isMuted) setIsMuted(false);
              }}
              className="w-16 h-1 bg-[var(--border-subtle)] rounded-lg accent-[var(--accent-primary)] cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
