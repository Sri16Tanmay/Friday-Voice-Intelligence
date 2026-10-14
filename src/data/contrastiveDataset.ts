import {
  SpeechBenchmark,
  AlignedWord,
  AcousticTrajectory,
  AcousticFrame,
  TemporalFlaw,
  FlawLevelId,
  FlawVariant,
} from '../types/speech';
import { generateRubricEvaluation } from '../services/acousticEngine';

/**
 * Synthesizes a deterministic, high-resolution acoustic trajectory
 * for reproducible benchmark evaluation.
 */
function createSyntheticTrajectory(
  duration: number,
  baseF0: number,
  f0Variation: number,
  baseRms: number,
  rmsVariation: number,
  hopSec = 0.05,
  modifier?: (t: number, frameIdx: number) => { f0Mult?: number; rmsDelta?: number; isPause?: boolean }
): AcousticTrajectory {
  const frameCount = Math.floor(duration / hopSec);
  const frames: AcousticFrame[] = [];
  const voicedF0s: number[] = [];
  const rmsVals: number[] = [];
  let totalPauses = 0;
  let inPause = false;

  for (let i = 0; i < frameCount; i++) {
    const t = Math.round(i * hopSec * 100) / 100;
    const progress = t / duration;

    // Natural undulating intonation curve with micro-tremors
    let f0 =
      baseF0 +
      Math.sin(progress * Math.PI * 4) * f0Variation +
      Math.cos(progress * Math.PI * 1.5) * (f0Variation * 0.4);

    let rms =
      baseRms +
      Math.sin(progress * Math.PI * 6) * rmsVariation +
      Math.cos(progress * Math.PI * 2.2) * (rmsVariation * 0.5);

    let isPause = false;

    // Periodic breath pauses at natural clause junctures (every ~4-6 seconds)
    const clauseCycle = (t % 5.5) / 5.5;
    if (clauseCycle > 0.88) {
      rms = -45;
      f0 = 0;
      isPause = true;
    }

    if (modifier) {
      const mod = modifier(t, i);
      if (mod.f0Mult !== undefined) f0 *= mod.f0Mult;
      if (mod.rmsDelta !== undefined) rms += mod.rmsDelta;
      if (mod.isPause !== undefined) isPause = mod.isPause;
      if (isPause) {
        f0 = 0;
        rms = -48;
      }
    }

    const actualF0 = isPause || f0 < 60 ? null : Math.round(f0 * 10) / 10;
    if (actualF0 !== null) voicedF0s.push(actualF0);
    rmsVals.push(rms);

    if (isPause) {
      if (!inPause) {
        totalPauses++;
        inPause = true;
      }
    } else {
      inPause = false;
    }

    const centroid = isPause ? 400 : Math.round(1400 + Math.sin(t * 3) * 350);
    const speechRate = isPause ? 0 : Math.round((3.8 + Math.cos(t * 2) * 0.8) * 10) / 10;

    frames.push({
      time: t,
      f0: actualF0,
      f0Normalized: 0, // Populated after stats
      rmsDb: Math.round(rms * 10) / 10,
      rmsNormalized: 0,
      spectralCentroid: centroid,
      speechRate,
      isPause,
    });
  }

  // Calculate statistics
  const meanF0 = voicedF0s.length > 0 ? voicedF0s.reduce((a, b) => a + b, 0) / voicedF0s.length : baseF0;
  const stdF0 =
    voicedF0s.length > 1
      ? Math.sqrt(voicedF0s.reduce((a, b) => a + Math.pow(b - meanF0, 2), 0) / (voicedF0s.length - 1))
      : 15;
  const minF0 = voicedF0s.length > 0 ? Math.min(...voicedF0s) : baseF0 - 20;
  const maxF0 = voicedF0s.length > 0 ? Math.max(...voicedF0s) : baseF0 + 30;
  const f0DynamicRangeSemitones =
    minF0 > 0 && maxF0 > minF0 ? Math.round(12 * Math.log2(maxF0 / minF0) * 10) / 10 : 8.5;

  const meanRmsDb = rmsVals.reduce((a, b) => a + b, 0) / (rmsVals.length || 1);
  const stdRmsDb =
    rmsVals.length > 1
      ? Math.sqrt(rmsVals.reduce((a, b) => a + Math.pow(b - meanRmsDb, 2), 0) / (rmsVals.length - 1))
      : 5;

  const pauseFrames = frames.filter((f) => f.isPause).length;
  const pauseRatio = Math.round((pauseFrames / Math.max(1, frames.length)) * 100) / 100;
  const nonPauseSeconds = duration * (1 - pauseRatio);
  const avgRate = nonPauseSeconds > 0 ? Math.round(((duration * 3.6) / nonPauseSeconds) * 10) / 10 : 3.8;

  // Normalize frames
  frames.forEach((f) => {
    f.f0Normalized = f.f0 !== null ? Math.round(((f.f0 - meanF0) / stdF0) * 100) / 100 : null;
    f.rmsNormalized = Math.round(((f.rmsDb - meanRmsDb) / stdRmsDb) * 100) / 100;
  });

  return {
    duration,
    sampleRate: 44100,
    hopSizeSeconds: hopSec,
    frames,
    stats: {
      meanF0: Math.round(meanF0 * 10) / 10,
      stdF0: Math.round(stdF0 * 10) / 10,
      minF0: Math.round(minF0 * 10) / 10,
      maxF0: Math.round(maxF0 * 10) / 10,
      f0DynamicRangeSemitones,
      meanRmsDb: Math.round(meanRmsDb * 10) / 10,
      stdRmsDb: Math.round(stdRmsDb * 10) / 10,
      averageSyllableRate: avgRate,
      pauseRatio,
      totalPauses,
    },
  };
}

// ---------------------------------------------------------------------------
// 1. JFK: We Choose to Go to the Moon (Rice Stadium, 1962)
// ---------------------------------------------------------------------------
const JFK_TRANSCRIPT =
  "We choose to go to the moon in this decade and do the other things, not because they are easy, but because they are hard, because that goal will serve to organize and measure the best of our energies and skills.";

const JFK_WORDS_RAW = JFK_TRANSCRIPT.split(/\s+/);
const JFK_ALIGNED_WORDS: AlignedWord[] = [];
let jfkTime = 0.4;
const jfkWordDurations = [
  0.25, 0.45, 0.18, 0.22, 0.15, 0.42, 0.18, 0.35, 0.65, 0.22, 0.28, 0.18, 0.35, 0.55, // We choose to go to the moon in this decade and do the other things
  0.25, 0.45, 0.2, 0.22, 0.65, // not because they are easy
  0.22, 0.48, 0.2, 0.24, 0.85, // but because they are hard
  0.35, 0.22, 0.55, 0.22, 0.52, 0.2, 0.68, 0.22, 0.55, // because that goal will serve to organize and measure
  0.18, 0.42, 0.2, 0.22, 0.72, 0.22, 0.85, // the best of our energies and skills
];

JFK_WORDS_RAW.forEach((w, idx) => {
  const dur = jfkWordDurations[idx] || 0.35;
  const isHard = w.toLowerCase().includes('hard');
  const isChoose = w.toLowerCase().includes('choose');
  const isMoon = w.toLowerCase().includes('moon');
  const isEnergies = w.toLowerCase().includes('energies');

  JFK_ALIGNED_WORDS.push({
    id: `jfk_w_${idx}`,
    word: w,
    startTime: Math.round(jfkTime * 100) / 100,
    endTime: Math.round((jfkTime + dur) * 100) / 100,
    stressWeight: isHard ? 1.0 : isChoose || isMoon || isEnergies ? 0.85 : 0.4,
    pitchExpectedHz: isHard ? 195 : isChoose ? 180 : 145,
    rmsExpectedDb: isHard ? -12 : -18,
  });

  jfkTime += dur;
  // Natural pause after clauses
  if (w.endsWith(',')) jfkTime += 0.55;
  else if (w.endsWith('.')) jfkTime += 0.8;
});

const JFK_TOTAL_DURATION = Math.round(jfkTime * 100) / 100;

// Trajectories for JFK
const JFK_IDEAL_TRAJ = createSyntheticTrajectory(JFK_TOTAL_DURATION, 142, 38, -18, 7.5);

// JFK Level 1: Egregious Flaws (Dysfluent, Monotone, Chaotic Pauses, Rushed Delivery)
const JFK_L1_FLAWS: TemporalFlaw[] = [
  {
    id: 'jfk_flaw_l1_1',
    category: 'Hesitative & Unnatural Pauses',
    severity: 'critical',
    startTime: 2.8,
    endTime: 5.4,
    duration: 2.6,
    phraseExcerpt: 'decade and ... do the other',
    startWordIndex: 8,
    endWordIndex: 11,
    mathematicalRationale:
      'Mid-clause pause duration Δt = 2.60s exceeds baseline rhetorical window (0.15s) by 17.3× with energy collapse to -49.2 dBFS (Z = -3.42σ).',
    causalExplanation:
      'Injected an abrupt, hesitative dead-silence in the middle of a continuous coordinate clause, severing the oratorical propulsion before the predicate.',
    coachingDrill:
      'Practice continuous subglottic breath projection across coordinating conjunctions; eliminate halting pauses between "decade" and "and".',
    acousticDeltas: { f0DeltaHz: -110, f0ZScore: -3.1, rmsDeltaDb: -28.4, tempoRatio: 0.15, pauseExcessSec: 2.45 },
  },
  {
    id: 'jfk_flaw_l1_2',
    category: 'Vocal Fry & Energy Depletion',
    severity: 'critical',
    startTime: 8.6,
    endTime: 10.4,
    duration: 1.8,
    phraseExcerpt: 'but because they are hard',
    startWordIndex: 19,
    endWordIndex: 23,
    mathematicalRationale:
      'F0 collapse from expected +195 Hz climax to 78 Hz (sub-harmonic phonation) with pitch variance σ = 3.2 Hz and RMS drop Δ = -14.6 dBFS (Z = -2.95σ).',
    causalExplanation:
      'Instead of delivering the speech’s definitive thesis climax with an acoustic crescendo and elevated pitch, the speaker collapsed into monotone vocal fry, extinguishing rhetorical authority.',
    coachingDrill:
      'Execute the Diaphragmatic Climax Drill: anchor the core on "hard", expanding dynamic volume by +6 dB while projecting pitch upward by at least 4 semitones.',
    acousticDeltas: { f0DeltaHz: -117, f0ZScore: -2.95, rmsDeltaDb: -14.6, tempoRatio: 1.05 },
  },
  {
    id: 'jfk_flaw_l1_3',
    category: 'Cadence & Rushed Delivery',
    severity: 'critical',
    startTime: 11.8,
    endTime: 13.9,
    duration: 2.1,
    phraseExcerpt: 'organize and measure the best of our energies',
    startWordIndex: 29,
    endWordIndex: 37,
    mathematicalRationale:
      'DTW trajectory compression factor 2.24× (syllable rate surged from 3.8 to 8.5 syl/sec) causing 68% consonantal formant smear.',
    causalExplanation:
      'Extreme syllable rushing caused swallowed plosives in "organize" and "energies", robbing the audience of semantic digestion time on the programmatic vision.',
    coachingDrill:
      'Metronome Stride: recite the phrase at 90 BPM tapping every stressed foot ("OR-ganize ... MEAS-ure ... EN-ergies").',
    acousticDeltas: { f0DeltaHz: 12, f0ZScore: 0.35, rmsDeltaDb: 4.8, tempoRatio: 2.24 },
  },
];

const JFK_L1_TRAJ = createSyntheticTrajectory(
  JFK_TOTAL_DURATION,
  128,
  12, // extremely flat pitch
  -24,
  3.2, // flat volume
  0.05,
  (t) => {
    if (t >= 2.8 && t <= 5.4) return { isPause: true };
    if (t >= 8.6 && t <= 10.4) return { f0Mult: 0.52, rmsDelta: -12 }; // vocal fry
    if (t >= 11.8 && t <= 13.9) return { f0Mult: 1.15, rmsDelta: 5 }; // rushed
    return {};
  }
);

// JFK Level 2: Moderate Flaws (Misplaced Uptalk, Breathless Run-on, Muted Dynamic Contrast)
const JFK_L2_FLAWS: TemporalFlaw[] = [
  {
    id: 'jfk_flaw_l2_1',
    category: 'Declarative Uptalk & Inversion',
    severity: 'moderate',
    startTime: 2.1,
    endTime: 3.1,
    duration: 1.0,
    phraseExcerpt: 'in this decade',
    startWordIndex: 7,
    endWordIndex: 9,
    mathematicalRationale:
      'Terminal pitch inflection slope dF0/dt = +42.6 Hz/s (inverted high-rising terminal) where baseline specifies declarative cadence falling slope dF0/dt = -34.8 Hz/s.',
    causalExplanation:
      'Applied a question-like rising pitch contour (uptalk) to a firm national commitment, projecting tentative hesitation rather than presidential resolve.',
    coachingDrill:
      'Terminal Cadence Downward Slide: ensure "decade" descends by 3 semitones on the final syllable to signal unshakeable finality.',
    acousticDeltas: { f0DeltaHz: 48, f0ZScore: 1.85, rmsDeltaDb: -1.2, tempoRatio: 1.0 },
  },
  {
    id: 'jfk_flaw_l2_2',
    category: 'Dynamic Contrast & Volume Drop',
    severity: 'moderate',
    startTime: 8.4,
    endTime: 10.2,
    duration: 1.8,
    phraseExcerpt: 'but because they are hard',
    startWordIndex: 19,
    endWordIndex: 23,
    mathematicalRationale:
      'Peak RMS energy Δ = -6.8 dBFS below baseline expectation; failed to generate dynamic separation (ΔRMS between "easy" and "hard" was +0.4 dB vs ideal +7.2 dB).',
    causalExplanation:
      'Failed to produce the antithetical volume contrast between "easy" and "hard", flattening the core rhetorical juxtaposition of the speech.',
    coachingDrill:
      'Juxtaposition Dynamics: speak "easy" at piano (-22 dB) and explode "hard" at forte (-14 dB) with wide acoustic separation.',
    acousticDeltas: { f0DeltaHz: -18, f0ZScore: -0.72, rmsDeltaDb: -6.8, tempoRatio: 1.08 },
  },
];

const JFK_L2_TRAJ = createSyntheticTrajectory(
  JFK_TOTAL_DURATION,
  138,
  24,
  -20,
  5.1,
  0.05,
  (t) => {
    if (t >= 2.1 && t <= 3.1) return { f0Mult: 1.35 }; // uptalk
    if (t >= 8.4 && t <= 10.2) return { rmsDelta: -6.8 }; // volume droop
    return {};
  }
);

// JFK Level 3: Near-Perfect Flaw (Subtle Premature Tempo Acceleration, Micro-Pause Clip)
const JFK_L3_FLAWS: TemporalFlaw[] = [
  {
    id: 'jfk_flaw_l3_1',
    category: 'Cadence & Rushed Delivery',
    severity: 'subtle',
    startTime: 12.4,
    endTime: 14.1,
    duration: 1.7,
    phraseExcerpt: 'best of our energies and skills',
    startWordIndex: 33,
    endWordIndex: 39,
    mathematicalRationale:
      'Slight DTW time compression of 1.28× on polysyllabic phrase with 140ms premature truncation of the rhetorical closure pause.',
    causalExplanation:
      'Delivery is 90% masterful, but rushed the final three syllables by 28%, cutting the resonance of "skills" before full audience internalization.',
    coachingDrill:
      'Sustain the final terminal sibilant in "skills" for an extra 200ms; hold a 1.2-second silent gaze before moving.',
    acousticDeltas: { f0DeltaHz: 6, f0ZScore: 0.22, rmsDeltaDb: -2.1, tempoRatio: 1.28 },
  },
];

const JFK_L3_TRAJ = createSyntheticTrajectory(
  JFK_TOTAL_DURATION,
  141,
  35,
  -18.5,
  7.0,
  0.05,
  (t) => {
    if (t >= 12.4 && t <= 14.1) return { rmsDelta: -2.1, f0Mult: 1.05 };
    return {};
  }
);

// ---------------------------------------------------------------------------
// 2. STEVE JOBS: Stanford Commencement Address (2005)
// ---------------------------------------------------------------------------
const JOBS_TRANSCRIPT =
  "Your time is limited, so don't waste it living someone else's life. Don't be trapped by dogma, which is living with the results of other people's thinking. And most importantly, have the courage to follow your heart and intuition.";

const JOBS_WORDS_RAW = JOBS_TRANSCRIPT.split(/\s+/);
const JOBS_ALIGNED_WORDS: AlignedWord[] = [];
let jobsTime = 0.5;
const jobsWordDurations = [
  0.3, 0.45, 0.2, 0.65, // Your time is limited
  0.25, 0.35, 0.45, 0.2, 0.45, 0.55, 0.58, 0.65, // so don't waste it living someone else's life
  0.35, 0.22, 0.55, 0.2, 0.65, // Don't be trapped by dogma
  0.28, 0.2, 0.45, 0.2, 0.22, 0.52, 0.22, 0.45, 0.52, 0.65, // which is living with the results of other people's thinking
  0.25, 0.38, 0.72, // And most importantly
  0.3, 0.2, 0.58, 0.2, 0.48, 0.3, 0.55, 0.25, 0.85, // have the courage to follow your heart and intuition
];

JOBS_WORDS_RAW.forEach((w, idx) => {
  const dur = jobsWordDurations[idx] || 0.36;
  const isHeart = w.toLowerCase().includes('heart');
  const isCourage = w.toLowerCase().includes('courage');
  const isLimited = w.toLowerCase().includes('limited');
  const isDogma = w.toLowerCase().includes('dogma');

  JOBS_ALIGNED_WORDS.push({
    id: `jobs_w_${idx}`,
    word: w,
    startTime: Math.round(jobsTime * 100) / 100,
    endTime: Math.round((jobsTime + dur) * 100) / 100,
    stressWeight: isHeart || isCourage ? 1.0 : isLimited || isDogma ? 0.8 : 0.45,
    pitchExpectedHz: isHeart ? 165 : isCourage ? 158 : 132,
    rmsExpectedDb: isHeart ? -15 : -20,
  });

  jobsTime += dur;
  if (w.endsWith(',')) jobsTime += 0.45;
  else if (w.endsWith('.')) jobsTime += 0.85;
});

const JOBS_TOTAL_DURATION = Math.round(jobsTime * 100) / 100;
const JOBS_IDEAL_TRAJ = createSyntheticTrajectory(JOBS_TOTAL_DURATION, 134, 30, -20, 6.8);

const JOBS_L1_FLAWS: TemporalFlaw[] = [
  {
    id: 'jobs_flaw_l1_1',
    category: 'Pitch Monotony & Lack of Inflection',
    severity: 'critical',
    startTime: 0.5,
    endTime: 4.2,
    duration: 3.7,
    phraseExcerpt: "Your time is limited, so don't waste it",
    startWordIndex: 0,
    endWordIndex: 7,
    mathematicalRationale:
      'F0 standard deviation collapsed to σ = 4.1 Hz (Z = -2.8σ vs baseline 28.4 Hz); zero semitone differentiation between subject and predicate.',
    causalExplanation:
      'Utterly robotic, flatline intonation on one of the most iconic memento-mori openings in modern public speaking, rendering existential urgency as routine boilerplate.',
    coachingDrill:
      'Pitch Step Exercise: raise the pitch on "time" by 4 semitones and drop into gravity on "limited" with a crisp 0.6s rhetorical stop.',
    acousticDeltas: { f0DeltaHz: -32, f0ZScore: -2.8, rmsDeltaDb: -5.4, tempoRatio: 0.95 },
  },
  {
    id: 'jobs_flaw_l1_2',
    category: 'Vocal Fry & Energy Depletion',
    severity: 'critical',
    startTime: 12.2,
    endTime: 15.4,
    duration: 3.2,
    phraseExcerpt: 'follow your heart and intuition',
    startWordIndex: 30,
    endWordIndex: 35,
    mathematicalRationale:
      'Glottal period jitter increased by 420%, with subglottic pressure drop causing fundamental frequency decay down to 68 Hz.',
    causalExplanation:
      'Breath supply ran dry before the sentence conclusion, causing the aspirational nouns "heart" and "intuition" to deteriorate into gravelly creaky voice.',
    coachingDrill:
      'Diaphragmatic Top-Up: take an intentional silent catch-breath immediately after "most importantly" to power the final 9 syllables.',
    acousticDeltas: { f0DeltaHz: -72, f0ZScore: -2.65, rmsDeltaDb: -12.1, tempoRatio: 1.12 },
  },
];

const JOBS_L1_TRAJ = createSyntheticTrajectory(
  JOBS_TOTAL_DURATION,
  122,
  8,
  -25,
  3.0,
  0.05,
  (t) => {
    if (t >= 0.5 && t <= 4.2) return { f0Mult: 0.92, rmsDelta: -3 };
    if (t >= 12.2 && t <= 15.4) return { f0Mult: 0.55, rmsDelta: -12 };
    return {};
  }
);

const JOBS_L2_FLAWS: TemporalFlaw[] = [
  {
    id: 'jobs_flaw_l2_1',
    category: 'Hesitative & Unnatural Pauses',
    severity: 'moderate',
    startTime: 5.6,
    endTime: 7.2,
    duration: 1.6,
    phraseExcerpt: 'Don\'t be trapped by ... dogma',
    startWordIndex: 12,
    endWordIndex: 16,
    mathematicalRationale:
      'Acoustic silence of 1.42s inserted across preposition-noun dependency without prosodic preparatory pitch reset.',
    causalExplanation:
      'Stumbled between the preposition "by" and the key noun "dogma", sounding like a memory lapse rather than an intentional pause.',
    coachingDrill:
      'Smooth Prepositional Binding: bind "trapped by" as a single rhythmic unit; place the dramatic suspension before "trapped" instead.',
    acousticDeltas: { f0DeltaHz: -14, f0ZScore: -0.65, rmsDeltaDb: -22, tempoRatio: 0.42, pauseExcessSec: 1.25 },
  },
];

const JOBS_L2_TRAJ = createSyntheticTrajectory(
  JOBS_TOTAL_DURATION,
  130,
  20,
  -21,
  4.8,
  0.05,
  (t) => {
    if (t >= 5.6 && t <= 7.2) return { isPause: true };
    return {};
  }
);

const JOBS_L3_FLAWS: TemporalFlaw[] = [
  {
    id: 'jobs_flaw_l3_1',
    category: 'Dynamic Contrast & Volume Drop',
    severity: 'subtle',
    startTime: 10.4,
    endTime: 12.1,
    duration: 1.7,
    phraseExcerpt: 'And most importantly',
    startWordIndex: 26,
    endWordIndex: 29,
    mathematicalRationale:
      'RMS volume under-projected by -3.8 dBFS compared to baseline transition marker expectation.',
    causalExplanation:
      'The rhetorical signpost "And most importantly" did not receive the dynamic acoustic lift needed to alert listeners to the impending climactic directive.',
    coachingDrill:
      'Marker Elevation: project "And most importantly" with +4 dB dynamic increase and an intentional 0.5s silence before "have the courage".',
    acousticDeltas: { f0DeltaHz: 8, f0ZScore: 0.3, rmsDeltaDb: -3.8, tempoRatio: 1.05 },
  },
];

const JOBS_L3_TRAJ = createSyntheticTrajectory(
  JOBS_TOTAL_DURATION,
  133,
  28,
  -20.2,
  6.2,
  0.05,
  (t) => {
    if (t >= 10.4 && t <= 12.1) return { rmsDelta: -3.8 };
    return {};
  }
);

// ---------------------------------------------------------------------------
// 3. MARTIN LUTHER KING JR.: Lincoln Memorial (1963)
// ---------------------------------------------------------------------------
const MLK_TRANSCRIPT =
  "I have a dream that one day this nation will rise up and live out the true meaning of its creed: We hold these truths to be self-evident, that all men are created equal.";

const MLK_WORDS_RAW = MLK_TRANSCRIPT.split(/\s+/);
const MLK_ALIGNED_WORDS: AlignedWord[] = [];
let mlkTime = 0.5;
const mlkWordDurations = [
  0.25, 0.45, 0.2, 0.75, // I have a dream
  0.28, 0.35, 0.55, 0.3, 0.58, 0.35, 0.65, 0.45, // that one day this nation will rise up
  0.25, 0.42, 0.32, 0.22, 0.58, 0.72, 0.25, 0.32, 0.85, // and live out the true meaning of its creed
  0.35, 0.55, 0.38, 0.68, 0.25, 0.28, 0.95, // We hold these truths to be self-evident
  0.28, 0.45, 0.62, 0.35, 0.78, 1.1, // that all men are created equal
];

MLK_WORDS_RAW.forEach((w, idx) => {
  const dur = mlkWordDurations[idx] || 0.42;
  const isDream = w.toLowerCase().includes('dream');
  const isEqual = w.toLowerCase().includes('equal');
  const isEvident = w.toLowerCase().includes('self-evident');

  MLK_ALIGNED_WORDS.push({
    id: `mlk_w_${idx}`,
    word: w,
    startTime: Math.round(mlkTime * 100) / 100,
    endTime: Math.round((mlkTime + dur) * 100) / 100,
    stressWeight: isEqual ? 1.0 : isDream || isEvident ? 0.9 : 0.45,
    pitchExpectedHz: isEqual ? 210 : isDream ? 185 : 148,
    rmsExpectedDb: isEqual ? -11 : -16,
  });

  mlkTime += dur;
  if (w.endsWith(':') || w.endsWith(',')) mlkTime += 0.65;
  else if (w.endsWith('.')) mlkTime += 0.95;
});

const MLK_TOTAL_DURATION = Math.round(mlkTime * 100) / 100;
const MLK_IDEAL_TRAJ = createSyntheticTrajectory(MLK_TOTAL_DURATION, 155, 45, -16, 8.5);

const MLK_L1_FLAWS: TemporalFlaw[] = [
  {
    id: 'mlk_flaw_l1_1',
    category: 'Cadence & Rushed Delivery',
    severity: 'critical',
    startTime: 0.5,
    endTime: 2.1,
    duration: 1.6,
    phraseExcerpt: 'I have a dream',
    startWordIndex: 0,
    endWordIndex: 3,
    mathematicalRationale:
      'Syllable duration of "dream" truncated to 0.28s vs ideal resonant duration of 0.82s (DTW warp compression ratio 2.9×).',
    causalExplanation:
      'Tossed off the central leitmotif of the century with conversational indifference, stripping the phrase of reverent acoustic mass.',
    coachingDrill:
      'Vocal Elongation Drill: expand "dream" across 3 full beats, applying vibrato on the open vowel and softening the closing bilabial.',
    acousticDeltas: { f0DeltaHz: -42, f0ZScore: -1.95, rmsDeltaDb: -9.5, tempoRatio: 2.9 },
  },
  {
    id: 'mlk_flaw_l1_2',
    category: 'Pitch Monotony & Lack of Inflection',
    severity: 'critical',
    startTime: 11.2,
    endTime: 14.8,
    duration: 3.6,
    phraseExcerpt: 'all men are created equal',
    startWordIndex: 26,
    endWordIndex: 31,
    mathematicalRationale:
      'Pitch trajectory variance σ = 2.4 Hz; total absence of liturgical cantillation or melodic fourth interval on "created equal".',
    causalExplanation:
      'The sacred quotation of the Declaration of Independence was recited in a flat, uninspired speaking register with zero harmonic overtone support.',
    coachingDrill:
      'Harmonic Arc: lift "created" by a perfect fourth (+5 semitones) and descend smoothly onto the tonic note of "equal".',
    acousticDeltas: { f0DeltaHz: -68, f0ZScore: -2.75, rmsDeltaDb: -11.2, tempoRatio: 1.1 },
  },
];

const MLK_L1_TRAJ = createSyntheticTrajectory(MLK_TOTAL_DURATION, 130, 9, -24, 3.1, 0.05, (t) => {
  if (t >= 0.5 && t <= 2.1) return { rmsDelta: -9.5, f0Mult: 0.8 };
  if (t >= 11.2 && t <= 14.8) return { rmsDelta: -11.2, f0Mult: 0.72 };
  return {};
});

const MLK_L2_FLAWS: TemporalFlaw[] = [
  {
    id: 'mlk_flaw_l2_1',
    category: 'Dynamic Contrast & Volume Drop',
    severity: 'moderate',
    startTime: 8.5,
    endTime: 11.0,
    duration: 2.5,
    phraseExcerpt: 'truths to be self-evident',
    startWordIndex: 20,
    endWordIndex: 25,
    mathematicalRationale:
      'RMS energy dropped -7.5 dBFS during the pre-climax build-up, dampening dynamic tension.',
    causalExplanation:
      'Inadvertent decrescendo right before the creedal thesis depleted the audience anticipation.',
    coachingDrill:
      'Ascending Dynamic Ladder: crescendo by +2 dB on each successive word from "truths" to "self-evident".',
    acousticDeltas: { f0DeltaHz: -15, f0ZScore: -0.6, rmsDeltaDb: -7.5, tempoRatio: 1.05 },
  },
];

const MLK_L2_TRAJ = createSyntheticTrajectory(MLK_TOTAL_DURATION, 148, 28, -19, 5.5, 0.05, (t) => {
  if (t >= 8.5 && t <= 11.0) return { rmsDelta: -7.5 };
  return {};
});

const MLK_L3_FLAWS: TemporalFlaw[] = [
  {
    id: 'mlk_flaw_l3_1',
    category: 'Hesitative & Unnatural Pauses',
    severity: 'subtle',
    startTime: 4.8,
    endTime: 5.4,
    duration: 0.6,
    phraseExcerpt: 'will rise up ... and live',
    startWordIndex: 8,
    endWordIndex: 12,
    mathematicalRationale:
      'Mid-stride hesitative micro-pause (600ms) interrupted momentum between compound verbs.',
    causalExplanation:
      'A minor breath catch between "rise up" and "and live" momentarily fractured rhythmic cadence.',
    coachingDrill:
      'Legato Phrasing: bind the "p" of "up" to the vowel of "and" in continuous phonation.',
    acousticDeltas: { f0DeltaHz: -8, f0ZScore: -0.3, rmsDeltaDb: -18, tempoRatio: 0.7, pauseExcessSec: 0.45 },
  },
];

const MLK_L3_TRAJ = createSyntheticTrajectory(MLK_TOTAL_DURATION, 153, 41, -16.8, 7.8, 0.05, (t) => {
  if (t >= 4.8 && t <= 5.4) return { isPause: true };
  return {};
});

// Helper to construct variants
function buildVariants(
  idealTraj: AcousticTrajectory,
  l1Traj: AcousticTrajectory,
  l1Flaws: TemporalFlaw[],
  l2Traj: AcousticTrajectory,
  l2Flaws: TemporalFlaw[],
  l3Traj: AcousticTrajectory,
  l3Flaws: TemporalFlaw[]
): Record<FlawLevelId, FlawVariant> {
  const idealEval = generateRubricEvaluation(idealTraj, idealTraj, []);
  const l3Eval = generateRubricEvaluation(l3Traj, idealTraj, l3Flaws);
  const l2Eval = generateRubricEvaluation(l2Traj, idealTraj, l2Flaws);
  const l1Eval = generateRubricEvaluation(l1Traj, idealTraj, l1Flaws);

  return {
    ideal: {
      levelId: 'ideal',
      label: 'Benchmark Ideal',
      subtitle: 'Canonical Master Delivery',
      description: 'Gold-standard reference featuring balanced dynamic range, deliberate dramatic pauses, and soaring climax inflection.',
      flawCount: 0,
      targetOverallScore: idealEval.overallScore,
      acousticTrajectory: idealTraj,
      flaws: [],
      evaluation: idealEval,
    },
    level_3_subtle: {
      levelId: 'level_3_subtle',
      label: 'Level 3: Subtle Imperfection',
      subtitle: 'Competitive / Near-Perfect (85-92)',
      description: 'Polished competition-grade delivery marred only by minor micro-pacing drift or premature decrescendo.',
      flawCount: l3Flaws.length,
      targetOverallScore: l3Eval.overallScore,
      acousticTrajectory: l3Traj,
      flaws: l3Flaws,
      evaluation: l3Eval,
    },
    level_2_moderate: {
      levelId: 'level_2_moderate',
      label: 'Level 2: Moderate Breakdown',
      subtitle: 'Intermediate / Rhetorical Flaws (65-75)',
      description: 'Obvious delivery faults including misplaced declarative uptalk, flat dynamics, and breathless mid-sentence cutoffs.',
      flawCount: l2Flaws.length,
      targetOverallScore: l2Eval.overallScore,
      acousticTrajectory: l2Traj,
      flaws: l2Flaws,
      evaluation: l2Eval,
    },
    level_1_egregious: {
      levelId: 'level_1_egregious',
      label: 'Level 1: Egregious / Dysfluent',
      subtitle: 'Severe Delivery Failure (<50)',
      description: 'Botched delivery with monotone vocal fry, chaotic pauses in mid-clause, and extreme rushed cadence.',
      flawCount: l1Flaws.length,
      targetOverallScore: l1Eval.overallScore,
      acousticTrajectory: l1Traj,
      flaws: l1Flaws,
      evaluation: l1Eval,
    },
  };
}

export const SPEECH_BENCHMARKS: SpeechBenchmark[] = [
  {
    id: 'jfk-moonshot',
    title: 'We Choose to Go to the Moon',
    speaker: 'John F. Kennedy',
    historicalContext: 'Rice University Stadium Address, Houston, Texas (September 12, 1962)',
    category: 'Persuasive Oratory',
    year: 1962,
    transcript: JFK_TRANSCRIPT,
    alignedWords: JFK_ALIGNED_WORDS,
    idealTrajectory: JFK_IDEAL_TRAJ,
    variants: buildVariants(
      JFK_IDEAL_TRAJ,
      JFK_L1_TRAJ,
      JFK_L1_FLAWS,
      JFK_L2_TRAJ,
      JFK_L2_FLAWS,
      JFK_L3_TRAJ,
      JFK_L3_FLAWS
    ),
  },
  {
    id: 'steve-jobs-stanford',
    title: 'Stay Hungry, Stay Foolish',
    speaker: 'Steve Jobs',
    historicalContext: 'Stanford University Commencement Address (June 12, 2005)',
    category: 'Commencement',
    year: 2005,
    transcript: JOBS_TRANSCRIPT,
    alignedWords: JOBS_ALIGNED_WORDS,
    idealTrajectory: JOBS_IDEAL_TRAJ,
    variants: buildVariants(
      JOBS_IDEAL_TRAJ,
      JOBS_L1_TRAJ,
      JOBS_L1_FLAWS,
      JOBS_L2_TRAJ,
      JOBS_L2_FLAWS,
      JOBS_L3_TRAJ,
      JOBS_L3_FLAWS
    ),
  },
  {
    id: 'mlk-dream',
    title: 'I Have a Dream',
    speaker: 'Dr. Martin Luther King Jr.',
    historicalContext: 'March on Washington for Jobs and Freedom, Lincoln Memorial (August 28, 1963)',
    category: 'Declamation',
    year: 1963,
    transcript: MLK_TRANSCRIPT,
    alignedWords: MLK_ALIGNED_WORDS,
    idealTrajectory: MLK_IDEAL_TRAJ,
    variants: buildVariants(
      MLK_IDEAL_TRAJ,
      MLK_L1_TRAJ,
      MLK_L1_FLAWS,
      MLK_L2_TRAJ,
      MLK_L2_FLAWS,
      MLK_L3_TRAJ,
      MLK_L3_FLAWS
    ),
  },
];
