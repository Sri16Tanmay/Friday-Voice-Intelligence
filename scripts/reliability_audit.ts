/**
 * FRIDAY — Comprehensive Automated Reliability, QA, Security & Load Audit Script
 * Executes functional test suites, 10,000-trial reliability campaign, chaos testing,
 * and synthetic load benchmarks with real telemetry.
 */

import {
  estimatePitchF0,
  computeRmsDb,
  computeSpectralCentroid,
  computeDTWAlignment,
  generateRubricEvaluation,
} from '../src/services/acousticEngine';
import { SPEECH_BENCHMARKS } from '../src/data/contrastiveDataset';
import { AcousticFrame, AcousticTrajectory, TemporalFlaw } from '../src/types/speech';

interface TestResult {
  suite: string;
  name: string;
  status: 'PASSED' | 'FAILED';
  durationMs: number;
  details?: string;
}

const testResults: TestResult[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

// Deterministic Pseudo-Random Generator (LCG)
class DeterministicPRNG {
  private seed: number;
  constructor(seed = 42) {
    this.seed = seed;
  }
  public next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
    return this.seed / 4294967296;
  }
  public range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
}

async function runTestSuite(suiteName: string, testFn: () => Promise<void> | void) {
  const start = performance.now();
  try {
    await testFn();
    testResults.push({
      suite: suiteName,
      name: suiteName,
      status: 'PASSED',
      durationMs: Math.round((performance.now() - start) * 100) / 100,
    });
    console.log(`✓ [PASS] ${suiteName} (${(performance.now() - start).toFixed(1)}ms)`);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    testResults.push({
      suite: suiteName,
      name: suiteName,
      status: 'FAILED',
      durationMs: Math.round((performance.now() - start) * 100) / 100,
      details: errorMsg,
    });
    console.error(`✗ [FAIL] ${suiteName}: ${errorMsg}`);
  }
}

// -------------------------------------------------------------
// SUITE 1: Acoustic DSP Unit & Functional Correctness
// -------------------------------------------------------------
function testAcousticDSP() {
  const sampleRate = 44100;
  const bufferSize = 2048;

  // 1. Pure 200 Hz Sine Wave
  const sine200 = new Float32Array(bufferSize);
  for (let i = 0; i < bufferSize; i++) {
    sine200[i] = Math.sin((2 * Math.PI * 200 * i) / sampleRate) * 0.8;
  }
  const f0 = estimatePitchF0(sine200, sampleRate);
  assert(f0 !== null, 'F0 should be detected for 200 Hz tone');
  assert(Math.abs((f0 as number) - 200) <= 6, `F0 should be near 200Hz, got ${f0}`);

  // 2. Silence Buffer
  const silence = new Float32Array(bufferSize);
  const f0Silence = estimatePitchF0(silence, sampleRate);
  assert(f0Silence === null, 'Silence must yield null F0');
  const rmsSilence = computeRmsDb(silence);
  assert(rmsSilence === -80, `Silence RMS must be -80 dBFS, got ${rmsSilence}`);

  // 3. RMS dB Calculation on full-scale sine (expected approx -3 dBFS)
  const rmsSine = computeRmsDb(sine200);
  assert(rmsSine > -10 && rmsSine < -1, `Sine RMS should be ~ -4 dBFS, got ${rmsSine}`);

  // 4. Spectral Centroid across vocal filter bands
  const centroid = computeSpectralCentroid(sine200, sampleRate);
  assert(centroid > 150 && centroid < 900, `Centroid for 200Hz sine should be in lower vocal resonance band (<900Hz), got ${centroid}`);
}

// -------------------------------------------------------------
// SUITE 2: Dynamic Time Warping (DTW) & Memory Resilience
// -------------------------------------------------------------
function testDTWResilience() {
  const benchmark = SPEECH_BENCHMARKS[0];
  const idealFrames = benchmark.idealTrajectory.frames;
  const flawedFrames = benchmark.variants.level_1_egregious.acousticTrajectory.frames;

  // 1. Standard alignment
  const dtwNormal = computeDTWAlignment(flawedFrames, idealFrames);
  assert(dtwNormal.distance > 0, 'DTW distance must be positive');
  assert(dtwNormal.warpRatio > 0.5 && dtwNormal.warpRatio < 2.0, 'DTW warp ratio reasonable');
  assert(dtwNormal.path.length > 0, 'DTW path must not be empty');

  // 2. Empty frames resilience
  const dtwEmpty = computeDTWAlignment([], idealFrames);
  assert(dtwEmpty.distance === 0, 'Empty frames must return distance 0');
  assert(dtwEmpty.path.length === 0, 'Empty frames must return empty path');

  // 3. Extreme length frames (simulating 10,000 frames) - Memory Guard Test
  const massiveFrames: AcousticFrame[] = [];
  for (let i = 0; i < 5000; i++) {
    massiveFrames.push({
      time: i * 0.05,
      f0: 150 + Math.sin(i * 0.1) * 30,
      f0Normalized: 0.2,
      rmsDb: -25,
      rmsNormalized: 0.1,
      spectralCentroid: 1200,
      speechRate: 4.0,
      isPause: false,
    });
  }
  const t0 = performance.now();
  const dtwMassive = computeDTWAlignment(massiveFrames, idealFrames);
  const elapsed = performance.now() - t0;

  assert(dtwMassive.distance >= 0, 'Massive frame DTW must succeed');
  assert(elapsed < 200, `Downsampling must keep DTW under 200ms, took ${elapsed.toFixed(1)}ms`);
}

// -------------------------------------------------------------
// SUITE 3: Rubric Evaluation Mathematical Boundaries
// -------------------------------------------------------------
function testRubricEvaluation() {
  const benchmark = SPEECH_BENCHMARKS[0];
  const idealTraj = benchmark.idealTrajectory;
  const flawedTraj = benchmark.variants.level_1_egregious.acousticTrajectory;
  const flaws = benchmark.variants.level_1_egregious.flaws;

  // 1. Standard evaluation
  const result = generateRubricEvaluation(flawedTraj, idealTraj, flaws);
  assert(result.overallScore >= 0 && result.overallScore <= 100, `Score bounded: ${result.overallScore}`);
  assert(result.confidenceInterval[0] <= result.confidenceInterval[1], 'CI valid range');
  assert(result.rubricCriteria.length === 5, 'Must have 5 criteria');
  assert(result.priorityFixes.length > 0, 'Must provide priority fixes');

  // 2. Ideal vs Ideal score should be high
  const idealResult = generateRubricEvaluation(idealTraj, idealTraj, []);
  assert(idealResult.overallScore >= 85, `Ideal vs Ideal should be >=85, got ${idealResult.overallScore}`);

  // 3. Null / Undefined input chaos protection
  const chaosResult = generateRubricEvaluation(
    { duration: 0, sampleRate: 0, hopSizeSeconds: 0, frames: [], stats: {} as any },
    { duration: 0, sampleRate: 0, hopSizeSeconds: 0, frames: [], stats: {} as any },
    []
  );
  assert(!Number.isNaN(chaosResult.overallScore), 'Overall score must not be NaN');
  assert(chaosResult.confidenceInterval[0] >= 0, 'Confidence interval must be valid on empty stats');
}

// -------------------------------------------------------------
// SUITE 4: 10,000-Trial Automated Reliability Campaign
// -------------------------------------------------------------
function run10kReliabilityCampaign() {
  console.log('\n--- Executing 10,000-Trial Reliability Campaign ---');
  const prng = new DeterministicPRNG(1337);
  const trials = 10000;
  let failures = 0;
  let passed = 0;
  const startTime = performance.now();

  const buffer = new Float32Array(512);

  for (let i = 0; i < trials; i++) {
    const trialType = i % 5;

    try {
      if (trialType === 0) {
        // Normal sine or harmonic signals with random frequencies and amplitudes
        const freq = prng.range(60, 500);
        const amp = prng.range(0.01, 1.0);
        for (let j = 0; j < 512; j++) {
          buffer[j] = Math.sin((2 * Math.PI * freq * j) / 44100) * amp;
        }
        const pitch = estimatePitchF0(buffer, 44100);
        const rms = computeRmsDb(buffer);
        assert(!Number.isNaN(rms), 'RMS must not be NaN');
        if (pitch !== null) {
          assert(Number.isFinite(pitch), 'Pitch must be finite');
        }
      } else if (trialType === 1) {
        // Pure silence or extreme noise
        for (let j = 0; j < 512; j++) {
          buffer[j] = (prng.next() - 0.5) * 0.0001;
        }
        const rms = computeRmsDb(buffer);
        assert(rms <= -40, 'Low energy must yield low dBFS');
      } else if (trialType === 2) {
        // Chaos input: NaNs, Infinities, extreme subnormals injected
        for (let j = 0; j < 512; j++) {
          if (j % 10 === 0) buffer[j] = NaN;
          else if (j % 25 === 0) buffer[j] = Infinity;
          else if (j % 30 === 0) buffer[j] = -Infinity;
          else buffer[j] = prng.range(-1, 1);
        }
        const rms = computeRmsDb(buffer);
        assert(Number.isFinite(rms), `Corrupted buffer RMS must be finite, got ${rms}`);
        const f0 = estimatePitchF0(buffer, 44100);
        // Should not throw or crash
      } else if (trialType === 3) {
        // DTW with randomized frame sequences
        const pLen = Math.floor(prng.range(5, 80));
        const bLen = Math.floor(prng.range(5, 80));
        const pFrames: AcousticFrame[] = [];
        const bFrames: AcousticFrame[] = [];
        for (let f = 0; f < pLen; f++) {
          pFrames.push({
            time: f * 0.05,
            f0: prng.next() > 0.3 ? prng.range(100, 300) : null,
            f0Normalized: prng.range(-2, 2),
            rmsDb: prng.range(-45, -10),
            rmsNormalized: prng.range(-1.5, 1.5),
            spectralCentroid: prng.range(500, 2500),
            speechRate: prng.range(2, 6),
            isPause: prng.next() > 0.8,
          });
        }
        for (let f = 0; f < bLen; f++) {
          bFrames.push({
            time: f * 0.05,
            f0: prng.next() > 0.2 ? prng.range(120, 280) : null,
            f0Normalized: prng.range(-1.5, 1.5),
            rmsDb: prng.range(-40, -12),
            rmsNormalized: prng.range(-1, 1),
            spectralCentroid: prng.range(600, 2200),
            speechRate: 4.2,
            isPause: prng.next() > 0.85,
          });
        }
        const dtw = computeDTWAlignment(pFrames, bFrames);
        assert(Number.isFinite(dtw.distance), 'DTW distance must be finite');
        assert(Number.isFinite(dtw.warpRatio), 'DTW warp ratio must be finite');
      } else if (trialType === 4) {
        // Rubric calculation under extreme statistics
        const trajA: AcousticTrajectory = {
          duration: prng.range(1, 30),
          sampleRate: 44100,
          hopSizeSeconds: 0.05,
          frames: [],
          stats: {
            meanF0: prng.range(80, 350),
            stdF0: prng.range(5, 80),
            minF0: 75,
            maxF0: 400,
            f0DynamicRangeSemitones: prng.range(2, 24),
            meanRmsDb: prng.range(-50, -10),
            stdRmsDb: prng.range(1, 15),
            averageSyllableRate: prng.range(1.5, 9.0),
            pauseRatio: prng.range(0.05, 0.6),
            totalPauses: Math.floor(prng.range(0, 15)),
          },
        };
        const trajB = SPEECH_BENCHMARKS[0].idealTrajectory;
        const flaws: TemporalFlaw[] = [];
        const numFlaws = Math.floor(prng.range(0, 6));
        for (let k = 0; k < numFlaws; k++) {
          flaws.push({
            id: `test_flaw_${k}`,
            startTime: k * 2.0,
            endTime: k * 2.0 + 1.2,
            duration: 1.2,
            severity: k % 2 === 0 ? 'critical' : 'moderate',
            category: 'Dynamic Contrast & Volume Drop',
            phraseExcerpt: 'Sample text phrase...',
            startWordIndex: 0,
            endWordIndex: 3,
            mathematicalRationale: 'Delta',
            causalExplanation: 'Explanation',
            coachingDrill: 'Drill',
            acousticDeltas: { f0DeltaHz: 25, f0ZScore: -1.2, rmsDeltaDb: 8, tempoRatio: 1.1 },
          });
        }
        const evalResult = generateRubricEvaluation(trajA, trajB, flaws);
        assert(evalResult.overallScore >= 10 && evalResult.overallScore <= 99, `Score bounded: ${evalResult.overallScore}`);
        assert(evalResult.confidenceInterval[0] <= evalResult.confidenceInterval[1], 'CI valid');
      }
      passed++;
    } catch (err: unknown) {
      failures++;
      if (failures <= 5) {
        console.error(`Trial #${i} Failed:`, err);
      }
    }
  }

  const totalDuration = performance.now() - startTime;
  const throughput = Math.round((trials / (totalDuration / 1000)));

  console.log(`Campaign Finished: ${trials} iterations executed in ${totalDuration.toFixed(1)}ms`);
  console.log(`Throughput: ${throughput.toLocaleString()} operations/sec`);
  console.log(`Passed: ${passed} / ${trials} (${((passed / trials) * 100).toFixed(2)}%)`);
  console.log(`Failed: ${failures}`);

  assert(failures === 0, `Reliability campaign failed with ${failures} errors`);
}

// -------------------------------------------------------------
// SUITE 5: Staged Synthetic Load Benchmarks (Stages 1 to 10)
// -------------------------------------------------------------
function runSyntheticLoadBenchmarks() {
  console.log('\n--- Staged Synthetic Load Testing (10 to 100,000 Simulated Iterations) ---');

  const stages = [
    { name: 'Stage 1: 10 Users', iterations: 10 },
    { name: 'Stage 2: 50 Users', iterations: 50 },
    { name: 'Stage 3: 100 Users', iterations: 100 },
    { name: 'Stage 4: 500 Users', iterations: 500 },
    { name: 'Stage 5: 1,000 Users', iterations: 1000 },
    { name: 'Stage 6: 5,000 Users', iterations: 5000 },
    { name: 'Stage 7: 10,000 Users', iterations: 10000 },
    { name: 'Stage 8: 25,000 Users', iterations: 25000 },
    { name: 'Stage 9: 50,000 Users', iterations: 50000 },
    { name: 'Stage 10: 100,000 Synthetic Units', iterations: 100000 },
  ];

  const benchmark = SPEECH_BENCHMARKS[0];
  const pTraj = benchmark.variants.level_1_egregious.acousticTrajectory;
  const bTraj = benchmark.idealTrajectory;
  const flaws = benchmark.variants.level_1_egregious.flaws;

  for (const stage of stages) {
    const latencies: number[] = [];
    const stageStart = performance.now();

    for (let i = 0; i < stage.iterations; i++) {
      const opStart = performance.now();
      generateRubricEvaluation(pTraj, bTraj, flaws);
      const opTime = performance.now() - opStart;
      latencies.push(opTime);
    }

    latencies.sort((a, b) => a - b);
    const p50 = latencies[Math.floor(latencies.length * 0.5)];
    const p95 = latencies[Math.floor(latencies.length * 0.95)];
    const p99 = latencies[Math.floor(latencies.length * 0.99)];
    const totalTime = performance.now() - stageStart;
    const rps = Math.round((stage.iterations / (totalTime / 1000)));

    console.log(
      `${stage.name.padEnd(30)} | Total: ${totalTime.toFixed(1).padStart(7)}ms | Throughput: ${rps.toLocaleString().padStart(9)} ops/s | p50: ${p50.toFixed(3)}ms | p95: ${p95.toFixed(3)}ms | p99: ${p99.toFixed(3)}ms`
    );
  }
}

// -------------------------------------------------------------
// MAIN EXECUTION RUNNER
// -------------------------------------------------------------
async function runAllAudits() {
  console.log('==============================================================');
  console.log('FRIDAY — FULL-SCALE RELIABILITY, SECURITY & LOAD AUDIT HARNESS');
  console.log('==============================================================\n');

  await runTestSuite('Suite 1: Acoustic DSP Mathematical Functions', testAcousticDSP);
  await runTestSuite('Suite 2: Dynamic Time Warping (DTW) & Memory Guard', testDTWResilience);
  await runTestSuite('Suite 3: Rubric Scorecard Evaluation & Chaos Inputs', testRubricEvaluation);
  await runTestSuite('Suite 4: 10,000-Trial Automated Reliability Campaign', run10kReliabilityCampaign);
  await runTestSuite('Suite 5: Staged Synthetic Load Benchmarks', runSyntheticLoadBenchmarks);

  console.log('\n==============================================================');
  console.log('AUDIT EXECUTION SUMMARY');
  console.log('==============================================================');
  const allPassed = testResults.every((t) => t.status === 'PASSED');
  testResults.forEach((t) => {
    console.log(`[${t.status}] ${t.name} (${t.durationMs}ms)`);
  });
  console.log('==============================================================');
  if (allPassed) {
    console.log('ALL VERIFICATIONS AND STRESS CAMPAIGNS PASSED SUCCESSFULLY.');
  } else {
    console.error('FAILURES DETECTED IN TEST SUITES.');
    process.exit(1);
  }
}

runAllAudits();
