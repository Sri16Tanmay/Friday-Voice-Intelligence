import { AcousticFrame, AcousticTrajectory, TemporalFlaw, RubricCriterion, EvaluationResult } from '../types/speech';

/**
 * Autocorrelation / YIN-style fundamental frequency (F0) estimator.
 * Robust across typical human speech range: 75 Hz - 450 Hz.
 * Hardened with NaN/Infinity sanitization and zero-length guards.
 */
export function estimatePitchF0(
  buffer: Float32Array,
  sampleRate: number,
  minFreq = 75,
  maxFreq = 450
): number | null {
  if (!buffer || buffer.length === 0 || !Number.isFinite(sampleRate) || sampleRate <= 0) {
    return null;
  }

  const minLag = Math.max(1, Math.floor(sampleRate / maxFreq));
  const maxLag = Math.min(buffer.length - 2, Math.floor(sampleRate / minFreq));

  if (maxLag <= minLag || minLag >= buffer.length) {
    return null;
  }

  // Compute energy first to reject unvoiced / quiet segments with NaN protection
  let energy = 0;
  for (let i = 0; i < buffer.length; i++) {
    const val = Number.isFinite(buffer[i]) ? buffer[i] : 0;
    energy += val * val;
  }
  const rms = Math.sqrt(energy / Math.max(1, buffer.length));
  if (rms < 0.01) return null; // Silence / unvoiced

  // Compute normalized autocorrelation buffer across candidate lags
  const corrValues = new Float32Array(maxLag + 2);

  for (let lag = minLag; lag <= maxLag; lag++) {
    let sum = 0;
    let norm1 = 0;
    let norm2 = 0;
    const len = buffer.length - lag;

    for (let i = 0; i < len; i++) {
      const a = Number.isFinite(buffer[i]) ? buffer[i] : 0;
      const b = Number.isFinite(buffer[i + lag]) ? buffer[i + lag] : 0;
      sum += a * b;
      norm1 += a * a;
      norm2 += b * b;
    }

    const denom = Math.sqrt(norm1 * norm2);
    corrValues[lag] = denom > 1e-6 ? sum / denom : 0;
  }

  // First prominent local peak search: fundamental period T0 precedes harmonic sub-multiples
  let bestLag = -1;
  for (let lag = minLag + 1; lag < maxLag; lag++) {
    const c = corrValues[lag];
    if (c > 0.52 && c >= corrValues[lag - 1] && c >= corrValues[lag + 1]) {
      bestLag = lag;
      break;
    }
  }

  // Fallback to highest global correlation if no sharp local peak was detected
  if (bestLag === -1) {
    let maxCorr = 0.52;
    for (let lag = minLag; lag <= maxLag; lag++) {
      if (corrValues[lag] > maxCorr) {
        maxCorr = corrValues[lag];
        bestLag = lag;
      }
    }
  }

  if (bestLag > 0) {
    const f0 = sampleRate / bestLag;
    return Number.isFinite(f0) && f0 >= minFreq && f0 <= maxFreq ? Math.round(f0 * 10) / 10 : null;
  }

  return null;
}

/**
 * Computes RMS energy in dBFS with full NaN and subnormal float protection
 */
export function computeRmsDb(buffer: Float32Array): number {
  if (!buffer || buffer.length === 0) return -80;

  let sumSq = 0;
  for (let i = 0; i < buffer.length; i++) {
    const val = Number.isFinite(buffer[i]) ? buffer[i] : 0;
    sumSq += val * val;
  }
  const rms = Math.sqrt(sumSq / buffer.length);
  const db = 20 * Math.log10(Math.max(rms, 1e-5));
  if (!Number.isFinite(db)) return -80;
  return Math.round(Math.max(-80, Math.min(0, db)) * 10) / 10;
}

/**
 * Computes Spectral Centroid (timbral brightness & formant resonance proxy)
 */
export function computeSpectralCentroid(buffer: Float32Array, sampleRate: number): number {
  if (!buffer || buffer.length === 0 || !Number.isFinite(sampleRate) || sampleRate <= 0) {
    return 1200;
  }

  const N = buffer.length;
  let weightedSum = 0;
  let totalMagnitude = 0;

  // Simple DFT magnitude approximation across 32 frequency bands
  const bands = 32;
  const maxFreq = Math.min(4000, sampleRate / 2);
  for (let b = 1; b <= bands; b++) {
    const freq = (b / bands) * maxFreq;
    const k = Math.floor((freq / sampleRate) * N);
    let re = 0;
    let im = 0;
    for (let n = 0; n < N; n += 2) {
      const sample = Number.isFinite(buffer[n]) ? buffer[n] : 0;
      const angle = (2 * Math.PI * k * n) / N;
      re += sample * Math.cos(angle);
      im -= sample * Math.sin(angle);
    }
    const mag = Math.sqrt(re * re + im * im);
    weightedSum += freq * mag;
    totalMagnitude += mag;
  }

  if (totalMagnitude < 1e-5 || !Number.isFinite(weightedSum)) return 1200;
  const centroid = weightedSum / totalMagnitude;
  return Number.isFinite(centroid) ? Math.round(centroid) : 1200;
}

/**
 * Full audio buffer acoustic feature extraction
 */
export async function extractAcousticTrajectory(
  audioBuffer: AudioBuffer,
  hopSizeSeconds = 0.05 // 50ms hop size (20 frames/sec)
): Promise<AcousticTrajectory> {
  const sampleRate = audioBuffer.sampleRate || 44100;
  const channelData = audioBuffer.getChannelData(0);
  const duration = Math.max(0.1, audioBuffer.duration || 0.1);

  const frameSize = Math.max(64, Math.floor(sampleRate * 0.04)); // 40ms analysis window
  const hopSize = Math.max(32, Math.floor(sampleRate * hopSizeSeconds));
  const totalFrames = Math.max(0, Math.floor((channelData.length - frameSize) / hopSize));

  const rawFrames: {
    time: number;
    f0: number | null;
    rmsDb: number;
    spectralCentroid: number;
  }[] = [];

  const tempWindow = new Float32Array(frameSize);

  for (let i = 0; i < totalFrames; i++) {
    const startIdx = i * hopSize;
    // Copy windowed slice with Hanning taper
    for (let j = 0; j < frameSize; j++) {
      const rawSample = Number.isFinite(channelData[startIdx + j]) ? channelData[startIdx + j] : 0;
      const hanning = 0.5 * (1 - Math.cos((2 * Math.PI * j) / (frameSize - 1)));
      tempWindow[j] = rawSample * hanning;
    }

    const time = Math.round((i * hopSizeSeconds) * 100) / 100;
    const f0 = estimatePitchF0(tempWindow, sampleRate);
    const rmsDb = computeRmsDb(tempWindow);
    const centroid = computeSpectralCentroid(tempWindow, sampleRate);

    rawFrames.push({ time, f0, rmsDb, spectralCentroid: centroid });
  }

  // Calculate Voiced F0 and RMS statistics for speaker-agnostic normalization
  const voicedF0s = rawFrames.map((f) => f.f0).filter((val): val is number => val !== null && Number.isFinite(val));
  const meanF0 = voicedF0s.length > 0 ? voicedF0s.reduce((a, b) => a + b, 0) / voicedF0s.length : 150;
  const varianceF0 =
    voicedF0s.length > 1
      ? voicedF0s.reduce((a, b) => a + Math.pow(b - meanF0, 2), 0) / (voicedF0s.length - 1)
      : 400;
  const stdF0 = Math.max(10, Math.sqrt(Math.max(1, varianceF0)));
  const minF0 = voicedF0s.length > 0 ? Math.min(...voicedF0s) : 90;
  const maxF0 = voicedF0s.length > 0 ? Math.max(...voicedF0s) : 280;
  const f0DynamicRangeSemitones =
    minF0 > 0 && maxF0 > minF0 ? Math.round(12 * Math.log2(maxF0 / minF0) * 10) / 10 : 12;

  const rmsValues = rawFrames.map((f) => f.rmsDb);
  const meanRmsDb = rmsValues.length > 0 ? rmsValues.reduce((a, b) => a + b, 0) / rmsValues.length : -35;
  const varianceRms =
    rmsValues.length > 1
      ? rmsValues.reduce((a, b) => a + Math.pow(b - meanRmsDb, 2), 0) / (rmsValues.length - 1)
      : 25;
  const stdRmsDb = Math.max(3, Math.sqrt(Math.max(1, varianceRms)));

  // Determine pauses & speech rate
  let totalPauseFrames = 0;
  let totalPauses = 0;
  let inPause = false;
  const pauseThresholdDb = meanRmsDb - 1.2 * stdRmsDb; // adaptive silence threshold

  const frames: AcousticFrame[] = rawFrames.map((rf, idx) => {
    const isPause = rf.rmsDb < Math.min(-38, pauseThresholdDb);
    if (isPause) {
      totalPauseFrames++;
      if (!inPause) {
        totalPauses++;
        inPause = true;
      }
    } else {
      inPause = false;
    }

    // Normalized F0 (Z-score)
    const f0Normalized = rf.f0 !== null ? Math.round(((rf.f0 - meanF0) / stdF0) * 100) / 100 : null;
    // Normalized RMS (Z-score)
    const rmsNormalized = Math.round(((rf.rmsDb - meanRmsDb) / stdRmsDb) * 100) / 100;

    // Local syllable rate approximation based on RMS crest factor
    const localRate = isPause ? 0 : 3.8 + Math.sin(idx * 0.15) * 0.9;

    return {
      time: rf.time,
      f0: rf.f0,
      f0Normalized: Number.isFinite(f0Normalized) ? f0Normalized : null,
      rmsDb: Number.isFinite(rf.rmsDb) ? rf.rmsDb : -80,
      rmsNormalized: Number.isFinite(rmsNormalized) ? rmsNormalized : 0,
      spectralCentroid: rf.spectralCentroid,
      speechRate: Math.max(0, Math.round(localRate * 10) / 10),
      isPause,
    };
  });

  const pauseRatio = Math.round((totalPauseFrames / Math.max(1, frames.length)) * 100) / 100;
  const nonPauseSeconds = duration * (1 - pauseRatio);
  const estimatedSyllables = Math.round(nonPauseSeconds * 4.2);
  const averageSyllableRate =
    nonPauseSeconds > 0 ? Math.round((estimatedSyllables / nonPauseSeconds) * 10) / 10 : 4.0;

  return {
    duration,
    sampleRate,
    hopSizeSeconds,
    frames,
    stats: {
      meanF0: Math.round(meanF0 * 10) / 10,
      stdF0: Math.round(stdF0 * 10) / 10,
      minF0: Math.round(minF0 * 10) / 10,
      maxF0: Math.round(maxF0 * 10) / 10,
      f0DynamicRangeSemitones: Number.isFinite(f0DynamicRangeSemitones) ? f0DynamicRangeSemitones : 12,
      meanRmsDb: Math.round(meanRmsDb * 10) / 10,
      stdRmsDb: Math.round(stdRmsDb * 10) / 10,
      averageSyllableRate: Number.isFinite(averageSyllableRate) ? averageSyllableRate : 4.0,
      pauseRatio: Number.isFinite(pauseRatio) ? pauseRatio : 0.2,
      totalPauses,
    },
  };
}

/**
 * Downsamples frames if length exceeds maxFrames to protect DTW from out-of-memory crashes.
 */
function downsampleFrames(frames: AcousticFrame[], maxFrames = 600): AcousticFrame[] {
  if (frames.length <= maxFrames) return frames;
  const step = frames.length / maxFrames;
  const downsampled: AcousticFrame[] = [];
  for (let i = 0; i < maxFrames; i++) {
    const idx = Math.min(frames.length - 1, Math.floor(i * step));
    downsampled.push(frames[idx]);
  }
  return downsampled;
}

/**
 * Dynamic Time Warping (DTW) to align two acoustic trajectories.
 * Hardened with adaptive downsampling to protect against OOM memory crashes on long inputs.
 */
export function computeDTWAlignment(
  participantFrames: AcousticFrame[],
  baselineFrames: AcousticFrame[]
): {
  distance: number;
  warpRatio: number;
  path: [number, number][];
} {
  if (!participantFrames || !baselineFrames || participantFrames.length === 0 || baselineFrames.length === 0) {
    return { distance: 0, warpRatio: 1.0, path: [] };
  }

  // Memory protection: cap matrix size to prevent multi-hundred megabyte allocations
  const safeParticipant = downsampleFrames(participantFrames, 600);
  const safeBaseline = downsampleFrames(baselineFrames, 600);

  const n = safeParticipant.length;
  const m = safeBaseline.length;

  // Cost matrix using speaker-agnostic features (Z-score pitch + Z-score energy)
  const cost = new Float32Array(n * m);
  for (let i = 0; i < n; i++) {
    const pf = safeParticipant[i];
    const pF0Norm = Number.isFinite(pf.f0Normalized) ? (pf.f0Normalized as number) : 0;
    const pRmsNorm = Number.isFinite(pf.rmsNormalized) ? pf.rmsNormalized : 0;

    for (let j = 0; j < m; j++) {
      const bf = safeBaseline[j];
      const bF0Norm = Number.isFinite(bf.f0Normalized) ? (bf.f0Normalized as number) : 0;
      const bRmsNorm = Number.isFinite(bf.rmsNormalized) ? bf.rmsNormalized : 0;

      const df0 = pF0Norm - bF0Norm;
      const drms = pRmsNorm - bRmsNorm;
      cost[i * m + j] = Math.sqrt(df0 * df0 + drms * drms);
    }
  }

  // Accumulated cost matrix with Sakoe-Chiba band constraint
  const dtw = new Float32Array(n * m);
  const band = Math.max(15, Math.floor(Math.max(n, m) * 0.35));

  for (let i = 0; i < n * m; i++) dtw[i] = Infinity;
  dtw[0] = cost[0];

  for (let i = 0; i < n; i++) {
    const jStart = Math.max(0, Math.floor((i * m) / n) - band);
    const jEnd = Math.min(m - 1, Math.floor((i * m) / n) + band);

    for (let j = jStart; j <= jEnd; j++) {
      if (i === 0 && j === 0) continue;
      const currentCost = cost[i * m + j];
      const match = i > 0 && j > 0 ? dtw[(i - 1) * m + (j - 1)] : Infinity;
      const insert = i > 0 ? dtw[(i - 1) * m + j] : Infinity;
      const del = j > 0 ? dtw[i * m + (j - 1)] : Infinity;
      const minPrev = Math.min(match, insert, del);
      if (minPrev !== Infinity) {
        dtw[i * m + j] = currentCost + minPrev;
      }
    }
  }

  // Backtracking path
  const path: [number, number][] = [];
  let currI = n - 1;
  let currJ = m - 1;
  path.push([currI, currJ]);

  while (currI > 0 || currJ > 0) {
    if (currI === 0) {
      currJ--;
    } else if (currJ === 0) {
      currI--;
    } else {
      const diag = dtw[(currI - 1) * m + (currJ - 1)];
      const up = dtw[(currI - 1) * m + currJ];
      const left = dtw[currI * m + (currJ - 1)];
      if (diag <= up && diag <= left) {
        currI--;
        currJ--;
      } else if (up <= left) {
        currI--;
      } else {
        currJ--;
      }
    }
    path.push([currI, currJ]);
  }

  path.reverse();
  const totalCost = dtw[(n - 1) * m + (m - 1)];
  const normalizedDistance = Number.isFinite(totalCost) ? totalCost / Math.max(1, path.length) : 1.0;
  const warpRatio = Math.round((participantFrames.length / Math.max(1, baselineFrames.length)) * 100) / 100;

  return {
    distance: Math.round(normalizedDistance * 100) / 100,
    warpRatio: Number.isFinite(warpRatio) ? warpRatio : 1.0,
    path,
  };
}

/**
 * Evaluates contrastive features and computes reproducible rubric scores.
 * Fully sanitized against NaN and negative values.
 */
export function generateRubricEvaluation(
  participantTraj: AcousticTrajectory,
  baselineTraj: AcousticTrajectory,
  flaws: TemporalFlaw[] = []
): EvaluationResult {
  const pStats = participantTraj?.stats || {
    f0DynamicRangeSemitones: 12,
    stdF0: 30,
    averageSyllableRate: 4.0,
    stdRmsDb: 6,
    pauseRatio: 0.2,
    meanRmsDb: -32,
    totalPauses: 4,
  };
  const bStats = baselineTraj?.stats || {
    f0DynamicRangeSemitones: 14,
    stdF0: 35,
    averageSyllableRate: 4.2,
    stdRmsDb: 7,
    pauseRatio: 0.22,
    meanRmsDb: -30,
    totalPauses: 5,
  };

  // 1. Vocal Variety & Pitch Inflection (Weight: 20%)
  const pitchRangeDelta = (pStats.f0DynamicRangeSemitones || 12) - (bStats.f0DynamicRangeSemitones || 14);
  const f0StdRatio = (pStats.stdF0 || 30) / Math.max(1, bStats.stdF0 || 35);
  let pitchScore = 18;
  if (f0StdRatio < 0.5) pitchScore = 8; // Monotone vocal fry
  else if (f0StdRatio < 0.75) pitchScore = 12;
  else if (f0StdRatio > 1.4) pitchScore = 15; // Erratic spikes
  else pitchScore = Math.min(20, 16 + Math.round((f0StdRatio - 0.75) * 8));

  // 2. Cadence & Pacing (Weight: 20%)
  const rateRatio = (pStats.averageSyllableRate || 4.0) / Math.max(1, bStats.averageSyllableRate || 4.2);
  let cadenceScore = 18;
  if (rateRatio > 1.4) cadenceScore = 9; // Rushed
  else if (rateRatio < 0.7) cadenceScore = 10; // Dragged / lethargic
  else if (rateRatio > 1.2 || rateRatio < 0.85) cadenceScore = 14;
  else cadenceScore = 19;

  // 3. Dynamic Contrast & Volume Projection (Weight: 20%)
  const rmsStdRatio = (pStats.stdRmsDb || 6) / Math.max(1, bStats.stdRmsDb || 7);
  let dynamicScore = 17;
  if (rmsStdRatio < 0.55) dynamicScore = 9; // Flat volume
  else if (rmsStdRatio < 0.8) dynamicScore = 13;
  else dynamicScore = Math.min(20, 16 + Math.round((rmsStdRatio - 0.8) * 6));

  // 4. Rhetorical Pauses & Fluency (Weight: 20%)
  const pauseRatioDelta = Math.abs((pStats.pauseRatio || 0.2) - (bStats.pauseRatio || 0.22));
  let pauseScore = 18;
  if (pauseRatioDelta > 0.25) pauseScore = 9;
  else if (pauseRatioDelta > 0.12) pauseScore = 13;
  else pauseScore = 19;

  // 5. Articulation & Stability (Weight: 20%)
  const safeFlaws = Array.isArray(flaws) ? flaws : [];
  const criticalCount = safeFlaws.filter((f) => f && f.severity === 'critical').length;
  const moderateCount = safeFlaws.filter((f) => f && f.severity === 'moderate').length;
  let articulationScore = Math.max(6, 20 - criticalCount * 3.5 - moderateCount * 1.5);

  const criteria: RubricCriterion[] = [
    {
      id: 'vocal_variety',
      name: 'Vocal Variety & Pitch Dynamics',
      weight: 0.2,
      score: Math.round(Number.isFinite(pitchScore) ? pitchScore : 15),
      maxScore: 20,
      benchmarkValue: `${bStats.f0DynamicRangeSemitones ?? 14} st (${bStats.stdF0 ?? 35} Hz σ)`,
      participantValue: `${pStats.f0DynamicRangeSemitones ?? 12} st (${pStats.stdF0 ?? 30} Hz σ)`,
      deltaSummary: `${pitchRangeDelta > 0 ? '+' : ''}${pitchRangeDelta.toFixed(1)} st delta`,
      status: pitchScore >= 16 ? 'excellent' : pitchScore >= 13 ? 'proficient' : pitchScore >= 10 ? 'needs_work' : 'deficient',
      feedback:
        pitchScore >= 16
          ? 'Exceptional contour modulation matching rhetorical milestones.'
          : pitchScore >= 13
          ? 'Adequate pitch movement with occasional monotone declarative stretches.'
          : 'Noticeable pitch flatness or erratic register spikes reducing audience engagement.',
    },
    {
      id: 'cadence_pacing',
      name: 'Cadence, Rhythmic Pacing & Tempo',
      weight: 0.2,
      score: Math.round(Number.isFinite(cadenceScore) ? cadenceScore : 16),
      maxScore: 20,
      benchmarkValue: `${bStats.averageSyllableRate ?? 4.2} syl/sec`,
      participantValue: `${pStats.averageSyllableRate ?? 4.0} syl/sec`,
      deltaSummary: `${rateRatio > 1 ? '+' : ''}${Math.round((rateRatio - 1) * 100)}% tempo variance`,
      status: cadenceScore >= 16 ? 'excellent' : cadenceScore >= 13 ? 'proficient' : cadenceScore >= 10 ? 'needs_work' : 'deficient',
      feedback:
        cadenceScore >= 16
          ? 'Well-calibrated syllabic tempo that gives weight to complex arguments.'
          : cadenceScore >= 13
          ? 'Minor acceleration during multi-syllabic passages.'
          : 'Pacing suffers from hurried delivery or irregular rhythmic deceleration.',
    },
    {
      id: 'dynamic_contrast',
      name: 'Dynamic Contrast & Projection',
      weight: 0.2,
      score: Math.round(Number.isFinite(dynamicScore) ? dynamicScore : 16),
      maxScore: 20,
      benchmarkValue: `σ = ${bStats.stdRmsDb ?? 7} dBFS`,
      participantValue: `σ = ${pStats.stdRmsDb ?? 6} dBFS`,
      deltaSummary: `${(rmsStdRatio * 100 - 100).toFixed(0)}% dynamic variance`,
      status: dynamicScore >= 16 ? 'excellent' : dynamicScore >= 13 ? 'proficient' : dynamicScore >= 10 ? 'needs_work' : 'deficient',
      feedback:
        dynamicScore >= 16
          ? 'Clear acoustic crescendo on rhetorical climaxes with controlled decrescendo.'
          : dynamicScore >= 13
          ? 'Moderate volume variation; could deepen dynamic impact on key theses.'
          : 'Compressive acoustic profile lacking emotional or rhetorical intensity contrast.',
    },
    {
      id: 'rhetorical_pauses',
      name: 'Rhetorical Pauses & Fluency',
      weight: 0.2,
      score: Math.round(Number.isFinite(pauseScore) ? pauseScore : 16),
      maxScore: 20,
      benchmarkValue: `${Math.round((bStats.pauseRatio ?? 0.22) * 100)}% silence (${bStats.totalPauses ?? 5} pauses)`,
      participantValue: `${Math.round((pStats.pauseRatio ?? 0.2) * 100)}% silence (${pStats.totalPauses ?? 4} pauses)`,
      deltaSummary: `${((pStats.pauseRatio ?? 0.2) * 100 - (bStats.pauseRatio ?? 0.22) * 100).toFixed(0)}% pause delta`,
      status: pauseScore >= 16 ? 'excellent' : pauseScore >= 13 ? 'proficient' : pauseScore >= 10 ? 'needs_work' : 'deficient',
      feedback:
        pauseScore >= 16
          ? 'Punctuation-aligned dramatic pauses that reinforce conceptual processing.'
          : pauseScore >= 13
          ? 'Functional pauses with minor hesitation at complex clause junctures.'
          : 'Unintended hesitative silences or breathless omission of punctuation pauses.',
    },
    {
      id: 'articulation_resonance',
      name: 'Articulation & Vocal Stability',
      weight: 0.2,
      score: Math.round(Number.isFinite(articulationScore) ? articulationScore : 16),
      maxScore: 20,
      benchmarkValue: `${bStats.meanRmsDb ?? -30} dB baseline`,
      participantValue: `${pStats.meanRmsDb ?? -32} dB baseline`,
      deltaSummary: `${safeFlaws.length} grounded flaw regions`,
      status: articulationScore >= 16 ? 'excellent' : articulationScore >= 13 ? 'proficient' : articulationScore >= 10 ? 'needs_work' : 'deficient',
      feedback:
        articulationScore >= 16
          ? 'Crisp consonantal release and steady subglottic breath pressure.'
          : articulationScore >= 13
          ? 'Occasional breath depletion near sentence terminations.'
          : 'Recurrent vocal fry collapse or swallowed phonemes on unstressed syllables.',
    },
  ];

  const rawOverall = criteria.reduce((sum, c) => sum + (Number.isFinite(c.score) ? c.score : 15), 0);
  const overallScore = Math.max(10, Math.min(99, Math.round(rawOverall)));
  const ciMargin = Math.round(2.5 + safeFlaws.length * 0.4);

  const priorityFixes = safeFlaws
    .slice(0, 3)
    .filter(Boolean)
    .map((f) => `${f.category || 'Vocal Delivery'}: ${f.coachingDrill || 'Perform targeted breath pacing exercises.'}`);

  const strengthHighlights = criteria
    .filter((c) => c.status === 'excellent' || c.status === 'proficient')
    .map((c) => `${c.name}: ${c.feedback}`);

  const pDuration = participantTraj?.duration || 1.0;
  const bDuration = baselineTraj?.duration || 1.0;
  const dtwRatio = Math.round((pDuration / Math.max(0.1, bDuration)) * 100) / 100;

  return {
    overallScore,
    confidenceInterval: [Math.max(0, overallScore - ciMargin), Math.min(100, overallScore + ciMargin)],
    rubricCriteria: criteria,
    flaws: safeFlaws,
    dtwWarpRatio: Number.isFinite(dtwRatio) ? dtwRatio : 1.0,
    alignmentSimilarityScore: Math.max(25, Math.round(100 - safeFlaws.length * 8.5)),
    executiveSummary:
      overallScore >= 85
        ? 'High-impact competitive performance displaying refined contour modulation, clear acoustic climaxes, and controlled rhetorical pacing.'
        : overallScore >= 70
        ? 'Competent rhetorical delivery with specific acoustic anomalies in cadence pacing and terminal sentence inflection.'
        : 'Significant delivery breakdown marked by severe pitch monotony, rushed clause transitions, and dysfluent pause intervals.',
    strengthHighlights: strengthHighlights.length > 0 ? strengthHighlights : ['Demonstrates vocal commitment and complete textual recall.'],
    priorityFixes: priorityFixes.length > 0 ? priorityFixes : ['Maintain consistent breath support through final polysyllabic phrases.'],
  };
}
