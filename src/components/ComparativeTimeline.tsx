import React, { useRef, useState, useEffect } from 'react';
import {
  AcousticTrajectory,
  AlignedWord,
  TemporalFlaw,
  FlawLevelId,
} from '../types/speech';
import { Sliders, RefreshCw, Layers } from 'lucide-react';

interface ComparativeTimelineProps {
  idealTraj: AcousticTrajectory;
  participantTraj: AcousticTrajectory;
  flaws: TemporalFlaw[];
  alignedWords: AlignedWord[];
  currentTime: number;
  duration: number;
  onSeek: (timeSeconds: number) => void;
  selectedFlaw: TemporalFlaw | null;
  onSelectFlaw: (flaw: TemporalFlaw | null) => void;
  loopRange: [number, number] | null;
  onToggleLoopFlaw: (flaw: TemporalFlaw) => void;
  selectedLevel: FlawLevelId;
}

export const ComparativeTimeline: React.FC<ComparativeTimelineProps> = ({
  idealTraj,
  participantTraj,
  flaws,
  alignedWords,
  currentTime,
  duration,
  onSeek,
  selectedFlaw,
  onSelectFlaw,
  loopRange,
  onToggleLoopFlaw,
  selectedLevel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Layer Toggles
  const [showPitch, setShowPitch] = useState(true);
  const [showRms, setShowRms] = useState(true);
  const [showCadence, setShowCadence] = useState(false);
  const [showFlawZones, setShowFlawZones] = useState(true);
  const [showSpectrogram, setShowSpectrogram] = useState(true);

  // Hover telemetry state
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Detect theme for dynamic Sage & Sand canvas rendering
    const isDark = document.documentElement.classList.contains('dark');

    // Imperial Emerald Light Luxury Canvas Tokens
    const bgCanvas = isDark ? '#18382C' : '#FFFFFF';
    const gridColor = isDark ? 'rgba(36, 75, 59, 0.7)' : 'rgba(230, 224, 211, 0.85)';
    const textSecColor = isDark ? '#B9C8BF' : '#77796D';
    const refColor = isDark ? '#7EA887' : '#315A43'; // Primary Emerald for reference audio
    const partColor = isDark ? '#C6A66A' : '#C6A66A'; // Muted Champagne for participant
    const highlightColor = isDark ? '#DFB87A' : '#A7B9A3'; // Sage accent
    const playheadColor = isDark ? '#F8F6EF' : '#173F30'; // Deep Emerald
    const pauseBg = isDark ? 'rgba(11, 31, 23, 0.75)' : 'rgba(231, 238, 230, 0.65)';

    // Background Canvas
    ctx.fillStyle = bgCanvas;
    ctx.fillRect(0, 0, width, height);

    const timeToX = (t: number) => (t / Math.max(0.1, duration)) * width;

    // 1. Spectrogram Frequency Power Simulation (Soft Sage / Sand Tint)
    if (showSpectrogram) {
      const pFrames = participantTraj.frames;
      const numFrames = pFrames.length;
      if (numFrames > 0) {
        const frameW = width / numFrames;
        for (let i = 0; i < numFrames; i++) {
          const f = pFrames[i];
          const x = i * frameW;
          if (f.isPause) continue;

          const intensity = Math.max(0.08, Math.min(1.0, (f.rmsDb + 45) / 35));
          const centroidRatio = Math.min(1.0, f.spectralCentroid / 3200);

          const specGrad = ctx.createLinearGradient(0, height, 0, 0);
          if (isDark) {
            specGrad.addColorStop(0, `rgba(19, 45, 35, ${intensity * 0.45})`);
            specGrad.addColorStop(centroidRatio * 0.5, `rgba(126, 168, 135, ${intensity * 0.22})`);
            specGrad.addColorStop(centroidRatio, `rgba(198, 166, 106, ${intensity * 0.28})`);
            specGrad.addColorStop(1, 'rgba(11, 31, 23, 0)');
          } else {
            specGrad.addColorStop(0, `rgba(231, 238, 230, ${intensity * 0.5})`);
            specGrad.addColorStop(centroidRatio * 0.5, `rgba(49, 90, 67, ${intensity * 0.18})`);
            specGrad.addColorStop(centroidRatio, `rgba(198, 166, 106, ${intensity * 0.22})`);
            specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          }

          ctx.fillStyle = specGrad;
          ctx.fillRect(x, 0, Math.max(1, frameW + 0.5), height);
        }
      }
    }

    // Grid Second Marks
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.fillStyle = textSecColor;
    ctx.font = '10px JetBrains Mono, monospace';

    const secStep = duration > 20 ? 2 : 1;
    for (let s = 0; s <= duration; s += secStep) {
      const x = timeToX(s);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      ctx.fillText(`${s}s`, x + 4, 13);
    }

    // 2. Pause Intervals (Quiet natural stripes)
    participantTraj.frames.forEach((f, idx) => {
      if (f.isPause) {
        const x = timeToX(f.time);
        const nextTime = idx < participantTraj.frames.length - 1 ? participantTraj.frames[idx + 1].time : f.time + 0.05;
        const w = Math.max(1, timeToX(nextTime) - x);
        ctx.fillStyle = pauseBg;
        ctx.fillRect(x, 0, w, height);
      }
    });

    // 3. Highlighted Flaw Bounding Zones
    if (showFlawZones) {
      flaws.forEach((flaw) => {
        const startX = timeToX(flaw.startTime);
        const endX = timeToX(flaw.endTime);
        const boxW = Math.max(4, endX - startX);
        const isSelected = selectedFlaw?.id === flaw.id;

        const isCrit = flaw.severity === 'critical';
        const strokeColor = isCrit
          ? (isDark ? 'rgba(229, 130, 121, 0.9)' : 'rgba(194, 76, 68, 0.9)')
          : (isDark ? 'rgba(223, 184, 122, 0.9)' : 'rgba(198, 166, 106, 0.9)');
        const fillColor = isCrit
          ? isSelected
            ? (isDark ? 'rgba(229, 130, 121, 0.28)' : 'rgba(194, 76, 68, 0.20)')
            : (isDark ? 'rgba(229, 130, 121, 0.14)' : 'rgba(194, 76, 68, 0.08)')
          : isSelected
          ? (isDark ? 'rgba(223, 184, 122, 0.28)' : 'rgba(198, 166, 106, 0.18)')
          : (isDark ? 'rgba(223, 184, 122, 0.12)' : 'rgba(198, 166, 106, 0.08)');

        ctx.fillStyle = fillColor;
        ctx.fillRect(startX, 0, boxW, height);

        // Top border with label
        ctx.fillStyle = strokeColor;
        ctx.fillRect(startX, 0, boxW, 2.5);

        ctx.font = 'bold 9px Inter, sans-serif';
        ctx.fillText(
          `${flaw.severity === 'critical' ? 'CRIT' : 'WARN'}: ${flaw.category.slice(0, 16)}`,
          startX + 4,
          height - 18
        );
      });
    }

    // 4. RMS Energy Envelopes
    if (showRms) {
      // Participant RMS (Champagne Gold)
      ctx.beginPath();
      ctx.fillStyle = isDark ? 'rgba(198, 166, 106, 0.12)' : 'rgba(198, 166, 106, 0.15)';
      let firstRms = true;
      participantTraj.frames.forEach((f) => {
        const x = timeToX(f.time);
        const normRms = Math.max(0, Math.min(1, (f.rmsDb + 45) / 40));
        const y = height - normRms * (height * 0.45) - 10;
        if (firstRms) {
          ctx.moveTo(x, height);
          ctx.lineTo(x, y);
          firstRms = false;
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      // Reference RMS outline (Imperial Emerald)
      ctx.beginPath();
      ctx.strokeStyle = isDark ? 'rgba(126, 168, 135, 0.4)' : 'rgba(49, 90, 67, 0.45)';
      ctx.lineWidth = 1.25;
      ctx.setLineDash([3, 2]);
      idealTraj.frames.forEach((f, idx) => {
        const x = timeToX(f.time);
        const normRms = Math.max(0, Math.min(1, (f.rmsDb + 45) / 40));
        const y = height - normRms * (height * 0.45) - 10;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 5. Dual Pitch (F0) Curves
    if (showPitch) {
      const minF0 = 80;
      const maxF0 = 360;
      const f0ToY = (f0: number) => {
        const clamped = Math.max(minF0, Math.min(maxF0, f0));
        const ratio = (clamped - minF0) / (maxF0 - minF0);
        return height * 0.85 - ratio * (height * 0.65);
      };

      // Reference F0: Muted Sage (dashed or solid)
      ctx.beginPath();
      ctx.setLineDash([4, 2]);
      ctx.strokeStyle = refColor;
      ctx.lineWidth = 2.25;
      let idealStarted = false;

      idealTraj.frames.forEach((bf) => {
        if (bf.f0 !== null && !bf.isPause) {
          const x = timeToX(bf.time);
          const y = f0ToY(bf.f0);
          if (!idealStarted) {
            ctx.moveTo(x, y);
            idealStarted = true;
          } else {
            ctx.lineTo(x, y);
          }
        } else {
          idealStarted = false;
        }
      });
      ctx.stroke();

      // Participant F0: Warm Sand (solid)
      ctx.beginPath();
      ctx.setLineDash([]);
      ctx.strokeStyle = partColor;
      ctx.lineWidth = 2.25;
      let partStarted = false;

      participantTraj.frames.forEach((pf) => {
        if (pf.f0 !== null && !pf.isPause) {
          const x = timeToX(pf.time);
          const y = f0ToY(pf.f0);
          if (!partStarted) {
            ctx.moveTo(x, y);
            partStarted = true;
          } else {
            ctx.lineTo(x, y);
          }
        } else {
          partStarted = false;
        }
      });
      ctx.stroke();
    }

    // 6. Cadence / Speech Rate track (if toggled)
    if (showCadence) {
      ctx.beginPath();
      ctx.setLineDash([2, 2]);
      ctx.strokeStyle = isDark ? '#A6C39A' : '#426B4A';
      ctx.lineWidth = 1.5;
      participantTraj.frames.forEach((pf, idx) => {
        const x = timeToX(pf.time);
        const y = height - (pf.speechRate / 8) * (height * 0.3) - 15;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 7. Loop Region Highlight Bracket
    if (loopRange) {
      const [lStart, lEnd] = loopRange;
      const startX = timeToX(lStart);
      const endX = timeToX(lEnd);

      ctx.fillStyle = isDark ? 'rgba(208, 177, 123, 0.16)' : 'rgba(138, 118, 83, 0.14)';
      ctx.fillRect(startX, 0, endX - startX, height);

      ctx.strokeStyle = highlightColor;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 2]);
      ctx.strokeRect(startX, 0, endX - startX, height);
      ctx.setLineDash([]);

      ctx.fillStyle = highlightColor;
      ctx.font = 'bold 9px JetBrains Mono, monospace';
      ctx.fillText('LOOP ACTIVE', startX + 6, 24);
    }

    // 8. Hover Scrubber Line
    if (hoverX !== null) {
      ctx.beginPath();
      ctx.strokeStyle = isDark ? 'rgba(213, 188, 145, 0.5)' : 'rgba(107, 127, 97, 0.5)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.moveTo(hoverX, 0);
      ctx.lineTo(hoverX, height);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 9. Playhead Cursor Line
    const playheadX = timeToX(currentTime);
    ctx.beginPath();
    ctx.strokeStyle = playheadColor;
    ctx.lineWidth = 2;
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, height);
    ctx.stroke();

    // Playhead Pip
    ctx.fillStyle = playheadColor;
    ctx.beginPath();
    ctx.arc(playheadX, 6, 4, 0, Math.PI * 2);
    ctx.fill();
  }, [
    idealTraj,
    participantTraj,
    flaws,
    duration,
    currentTime,
    showPitch,
    showRms,
    showCadence,
    showFlawZones,
    showSpectrogram,
    hoverX,
    selectedFlaw,
    loopRange,
  ]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickRatio = x / rect.width;
    const targetTime = Math.max(0, Math.min(duration, clickRatio * duration));
    onSeek(targetTime);

    // If clicked inside a flaw region, select it
    const matchFlaw = flaws.find(
      (f) => targetTime >= f.startTime && targetTime <= f.endTime
    );
    if (matchFlaw) {
      onSelectFlaw(matchFlaw);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = (x / rect.width) * duration;
    setHoverX(x);
    setHoverTime(time);
  };

  const handleMouseLeave = () => {
    setHoverX(null);
    setHoverTime(null);
  };

  const currentFrameHover =
    hoverTime !== null
      ? participantTraj.frames.find((f) => Math.abs(f.time - hoverTime) < 0.06)
      : null;
  const idealFrameHover =
    hoverTime !== null
      ? idealTraj.frames.find((f) => Math.abs(f.time - hoverTime) < 0.06)
      : null;
  const currentWordHover =
    hoverTime !== null
      ? alignedWords.find((w) => hoverTime >= w.startTime && hoverTime <= w.endTime)
      : null;

  return (
    <div className="bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-xl overflow-hidden mb-6 shadow-xs transition-colors duration-300">
      {/* Header Toolbar */}
      <div className="px-5 py-3 bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-sans font-semibold text-[var(--text-primary)] tracking-wide uppercase">
            Acoustic Trajectory Overlay
          </span>
          <span className="text-[var(--text-muted)]">·</span>
          <span className="text-xs font-mono text-[var(--text-muted)]">
            {participantTraj.frames.length} frames (50ms hop)
          </span>
        </div>

        {/* Feature Layer Toggles */}
        <div className="flex items-center gap-1 p-1 bg-[var(--surface-elevated)] rounded-lg border border-[var(--border-subtle)]">
          <button
            onClick={() => setShowPitch(!showPitch)}
            className={`px-2.5 py-1 text-xs font-sans font-medium rounded-md transition-colors cursor-pointer ${
              showPitch
                ? 'bg-[var(--accent-soft)] text-[var(--accent-primary)] font-semibold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            F0 Pitch
          </button>

          <button
            onClick={() => setShowRms(!showRms)}
            className={`px-2.5 py-1 text-xs font-sans font-medium rounded-md transition-colors cursor-pointer ${
              showRms
                ? 'bg-[var(--accent-soft)] text-[var(--accent-primary)] font-semibold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            RMS Energy
          </button>

          <button
            onClick={() => setShowCadence(!showCadence)}
            className={`px-2.5 py-1 text-xs font-sans font-medium rounded-md transition-colors cursor-pointer ${
              showCadence
                ? 'bg-[var(--accent-soft)] text-[var(--accent-primary)] font-semibold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Cadence
          </button>

          <button
            onClick={() => setShowSpectrogram(!showSpectrogram)}
            className={`px-2.5 py-1 text-xs font-sans font-medium rounded-md transition-colors cursor-pointer ${
              showSpectrogram
                ? 'bg-[var(--accent-soft)] text-[var(--accent-primary)] font-semibold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Spectrogram
          </button>

          <button
            onClick={() => setShowFlawZones(!showFlawZones)}
            className={`px-2.5 py-1 text-xs font-sans font-medium rounded-md transition-colors cursor-pointer ${
              showFlawZones
                ? 'bg-[var(--status-error)]/15 text-[var(--status-error)] font-semibold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Flaws ({flaws.length})
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div
        ref={containerRef}
        className="relative w-full h-[250px] bg-[var(--surface-elevated)] overflow-hidden cursor-crosshair select-none"
      >
        <canvas
          ref={canvasRef}
          width={1200}
          height={250}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full h-full block"
        />

        {/* Hover Telemetry HUD */}
        {hoverTime !== null && hoverX !== null && (
          <div
            style={{
              left: Math.min(hoverX + 16, (containerRef.current?.clientWidth || 800) - 230),
              top: 14,
            }}
            className="absolute pointer-events-none z-30 bg-[var(--surface-elevated)]/95 border border-[var(--border-strong)] rounded-lg p-2.5 shadow-md text-[11px] font-mono text-[var(--text-primary)] w-[215px] backdrop-blur-md"
          >
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-1 mb-1.5">
              <span className="font-semibold text-[var(--accent-primary)]">t = {hoverTime.toFixed(2)}s</span>
              {currentWordHover && (
                <span className="text-[var(--text-secondary)] truncate max-w-[100px]">
                  "{currentWordHover.word}"
                </span>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-[var(--waveform-reference)]">
                <span>Reference F0:</span>
                <span className="tabular-nums">
                  {idealFrameHover?.f0 ? `${idealFrameHover.f0.toFixed(1)} Hz` : 'Unvoiced'}
                </span>
              </div>
              <div className="flex justify-between items-center text-[var(--waveform-participant)]">
                <span>Participant F0:</span>
                <span className="tabular-nums">
                  {currentFrameHover?.f0 ? `${currentFrameHover.f0.toFixed(1)} Hz` : 'Unvoiced'}
                </span>
              </div>
              <div className="flex justify-between items-center text-[var(--text-muted)]">
                <span>RMS Level:</span>
                <span className="tabular-nums">
                  {currentFrameHover ? `${currentFrameHover.rmsDb.toFixed(1)} dBFS` : '--'}
                </span>
              </div>
              <div className="flex justify-between items-center text-[var(--status-success)]">
                <span>Cadence:</span>
                <span className="tabular-nums">
                  {currentFrameHover ? `${currentFrameHover.speechRate.toFixed(1)} syl/s` : '--'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend & Selected Flaw Banner */}
      <div className="px-5 py-2.5 bg-[var(--bg-secondary)] border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-4 text-xs font-sans">
        <div className="flex items-center gap-5 text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-1 bg-[var(--waveform-reference)] rounded-xs" />
            <span className="text-[var(--text-primary)] font-medium">Reference F0 (Sage)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-1 bg-[var(--waveform-participant)] rounded-xs" />
            <span className="text-[var(--text-primary)] font-medium">Participant F0 (Sand)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-[var(--border-strong)] rounded-xs" />
            <span>RMS Energy Intensity</span>
          </div>
        </div>

        {selectedFlaw && (
          <div className="flex items-center gap-3 bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-md px-2.5 py-1">
            <span className="font-mono text-[11px] text-[var(--text-muted)]">
              [{selectedFlaw.startTime.toFixed(2)}s – {selectedFlaw.endTime.toFixed(2)}s]
            </span>
            <span className="font-medium text-[var(--text-primary)] truncate max-w-[200px]">
              {selectedFlaw.phraseExcerpt}
            </span>
            <button
              onClick={() => onToggleLoopFlaw(selectedFlaw)}
              className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded cursor-pointer transition-colors ${
                loopRange && loopRange[0] === selectedFlaw.startTime
                  ? 'bg-[var(--accent-primary)] text-[#FCFAF5] dark:text-[#18201A]'
                  : 'bg-[var(--surface-hover)] text-[var(--text-primary)]'
              }`}
            >
              <RefreshCw className="w-3 h-3" />
              {loopRange && loopRange[0] === selectedFlaw.startTime ? 'Looping' : 'Loop Flaw'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
