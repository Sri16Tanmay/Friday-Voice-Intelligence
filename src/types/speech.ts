export type FlawSeverity = 'critical' | 'moderate' | 'subtle';

export type FlawCategory =
  | 'Pitch Monotony & Lack of Inflection'
  | 'Declarative Uptalk & Inversion'
  | 'Cadence & Rushed Delivery'
  | 'Hesitative & Unnatural Pauses'
  | 'Dynamic Contrast & Volume Drop'
  | 'Vocal Fry & Energy Depletion'
  | 'Swallowed Syllables & Articulation';

export interface AlignedWord {
  id: string;
  word: string;
  startTime: number;
  endTime: number;
  stressWeight: number; // 0.0 - 1.0 (expected rhetorical stress)
  pitchExpectedHz: number;
  rmsExpectedDb: number;
  isFlawed?: boolean;
  flawId?: string;
}

export interface TemporalFlaw {
  id: string;
  category: FlawCategory;
  severity: FlawSeverity;
  startTime: number;
  endTime: number;
  duration: number;
  phraseExcerpt: string;
  startWordIndex: number;
  endWordIndex: number;
  mathematicalRationale: string;
  causalExplanation: string;
  coachingDrill: string;
  acousticDeltas: {
    f0DeltaHz: number;
    f0ZScore: number;
    rmsDeltaDb: number;
    tempoRatio: number; // e.g. 1.8x faster than baseline
    pauseExcessSec?: number;
  };
}

export interface AcousticFrame {
  time: number; // in seconds
  f0: number | null; // pitch in Hz (null for unvoiced)
  f0Normalized: number | null; // Z-score normalized
  rmsDb: number; // RMS energy in dBFS
  rmsNormalized: number; // Z-score normalized
  spectralCentroid: number; // Hz
  speechRate: number; // syllables/sec
  isPause: boolean;
}

export interface AcousticTrajectory {
  duration: number;
  sampleRate: number;
  hopSizeSeconds: number;
  frames: AcousticFrame[];
  stats: {
    meanF0: number;
    stdF0: number;
    minF0: number;
    maxF0: number;
    f0DynamicRangeSemitones: number;
    meanRmsDb: number;
    stdRmsDb: number;
    averageSyllableRate: number;
    pauseRatio: number;
    totalPauses: number;
  };
}

export interface RubricCriterion {
  id: string;
  name: string;
  weight: number;
  score: number; // 0 - 20 (or scaled)
  maxScore: number;
  benchmarkValue: string;
  participantValue: string;
  deltaSummary: string;
  status: 'excellent' | 'proficient' | 'needs_work' | 'deficient';
  feedback: string;
}

export interface EvaluationResult {
  overallScore: number; // 0 - 100
  confidenceInterval: [number, number];
  rubricCriteria: RubricCriterion[];
  flaws: TemporalFlaw[];
  dtwWarpRatio: number;
  alignmentSimilarityScore: number; // 0 - 100%
  executiveSummary: string;
  strengthHighlights: string[];
  priorityFixes: string[];
}

export type FlawLevelId = 'ideal' | 'level_3_subtle' | 'level_2_moderate' | 'level_1_egregious';

export interface FlawVariant {
  levelId: FlawLevelId;
  label: string;
  subtitle: string;
  description: string;
  flawCount: number;
  targetOverallScore: number;
  acousticTrajectory: AcousticTrajectory;
  flaws: TemporalFlaw[];
  evaluation: EvaluationResult;
}

export interface SpeechBenchmark {
  id: string;
  title: string;
  speaker: string;
  historicalContext: string;
  category: 'Persuasive Oratory' | 'Declamation' | 'Commencement' | 'Crisis Address' | 'Advocacy';
  year: number;
  transcript: string;
  alignedWords: AlignedWord[];
  idealTrajectory: AcousticTrajectory;
  variants: Record<FlawLevelId, FlawVariant>;
}

export type SpeechCategory =
  | 'Persuasive Oratory'
  | 'Declamation'
  | 'Interpretive Reading'
  | 'Extemporaneous'
  | 'Commencement'
  | 'Crisis Address'
  | 'Advocacy';

export interface AnalysisSession {
  id: string;
  createdAt: string;
  speechTitle: string;
  category: SpeechCategory;
  referenceId: string;
  referenceTitle: string;
  referenceSpeaker: string;
  rubricPreset: 'balanced' | 'pacing_pauses' | 'vocal_expression';
  overallScore: number;
  confidenceInterval: [number, number];
  flawCount: number;
  duration: number;
  flaws: TemporalFlaw[];
  evaluation: EvaluationResult;
  trajectory: AcousticTrajectory;
}
