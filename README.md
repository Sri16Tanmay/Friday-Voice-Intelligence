# FRIDAY — AI Speech Intelligence & Performance Analytics

> **“Every word matters. Every second counts.”**

**FRIDAY** is an AI-powered speech evaluation platform built for the **Multimodal AI Hackathon 2026, Track C: Contrastive Speech Analytics & Temporal Flaw Grounding**. It analyzes spoken performances, aligns them with authoritative reference recordings, detects vocal delivery deviations, pinpoints the exact timestamps $[t_1, t_2]$ where flaws occur, explains the measurable acoustic evidence behind each detection, and delivers actionable improvement drills.

---

## 1. Visual & Editorial Design Philosophy

FRIDAY embraces a quiet, confident, luxury editorial design language inspired by high-end typography, scientific laboratory instruments, and sophisticated financial terminals:

- **Warm Ivory (`#F5F1E8`) & Obsidian Black (`#171816`)**: Canvas foundations for complete Light and Dark theme modes with persisted user preference.
- **Deep Forest (`#233B32`)**: Used for primary action affordances and structural references.
- **Champagne Gold (`#C6AA78`)**: Restrained accents for reference pitch contours, active transport cursors, and fine dividers.
- **Muted Sage (`#A7B5A0`) & Warm Stone (`#D8D0C2`)**: Secondary metrics and hairline dividers.
- **Restrained Warning Amber (`#B78B4D`) & Accessible Error Red (`#B95F59`)**: Flaw severity highlights.
- **Editorial Typography Pairing**:
  - Headlines: *DM Serif Display* & *Instrument Serif*
  - Interface: *Plus Jakarta Sans*
  - Metrics & Telemetry: *JetBrains Mono* with `tabular-nums`

---

## 2. Track C Requirements & Architecture Mapping

| Hackathon Requirement | FRIDAY Implementation | Architectural Module |
| :--- | :--- | :--- |
| **1. Custom Contrastive Dataset & Stress Testing** | Curated oratorical corpus (JFK, Steve Jobs, MLK) paired against an intentional 4-tier gradient of bad deliveries (*Ideal*, *Level 3: Subtle*, *Level 2: Moderate*, *Level 1: Egregious*). Downloadable JSON dataset manifest. | `src/data/contrastiveDataset.ts`<br>`src/components/ReferenceLibrary.tsx` |
| **2. Acoustic Feature Extraction & Forced Alignment** | High-resolution DSP extracting Fundamental Frequency ($F_0$), RMS energy in dBFS, STFT Spectrogram, and silence intervals. Speaker-agnostic Z-score and semitone normalization. | `src/services/acousticEngine.ts`<br>`src/components/ComparativeTimeline.tsx` |
| **3. Temporal Grounding & Causal Explainability** | Dynamic Time Warping (DTW) with Sakoe-Chiba band alignment. Pinpoints exact temporal flaw bounds $[t_1, t_2]$, mathematical formulas, and causal rhetorical explainability with coaching drills. | `src/services/flawGroundingEngine.ts`<br>`src/components/FlawInspector.tsx` |
| **4. Visualization & Dashboarding** | Synchronized dual-track audio player with instant A/B contrastive auditioning, multi-track canvas overlay, word-level forced alignment karaoke, and reproducible rubric scoring. | `src/components/ResultsDashboard.tsx`<br>`src/components/DualAudioPlayer.tsx` |
| **5. Real Audio Ingestion & Recording** | Drag-and-drop WAV/MP3/M4A file upload with client-side decoding, validation, plus in-browser Live Microphone recording with real-time level meters. | `src/components/NewAnalysisWorkspace.tsx`<br>`src/services/speechSynthesizer.ts` |
| **6. Reproducible Rubric Scoring & Export** | Transparent 100-point composite rubric across 5 forensic dimensions with 95% confidence intervals. One-click PDF/Print, JSON Dossier, and CSV feature table exports. | `src/components/RubricScorecard.tsx`<br>`src/components/ExportReportModal.tsx` |

---

## 3. Acoustic Signal Processing Mathematics

### A. Fundamental Frequency ($F_0$) Extraction
Glottal periodicity is estimated using normalized autocorrelation with sub-bin parabolic interpolation across human vocal range ($75\text{ Hz} \le F_0 \le 450\text{ Hz}$):
$$R_{xx}(\tau) = \frac{\sum_{n=0}^{N-\tau-1} x[n]x[n+\tau]}{\sqrt{\sum x[n]^2 \cdot \sum x[n+\tau]^2}}$$
Voiced frames ($\text{corr} > 0.52$) are extracted at 50ms hop windows.

### B. Speaker-Agnostic Invariance
To eliminate biological bias (male vs. female anatomical pitch ranges), all pitch and energy contours are dynamically Z-score normalized against each speaker's baseline statistics $(\mu, \sigma)$ and converted to relative semitones:
$$F_{0,\text{norm}}(t) = \frac{F_0(t) - \mu_{F_0}}{\sigma_{F_0}}, \quad \Delta \text{st} = 12 \log_2\left(\frac{F_0(t)}{\mu_{F_0}}\right)$$

### C. Dynamic Time Warping (DTW) Alignment
Non-linear duration warping between participant audio and the canonical benchmark uses dynamic programming under a Sakoe-Chiba band constraint:
$$D(i, j) = \text{cost}(i, j) + \min\left\{ D(i-1, j), D(i, j-1), D(i-1, j-1) \right\}$$

### D. RMS Loudness Dynamics
$$RMS_{\text{dBFS}} = 20 \log_{10} \sqrt{\frac{1}{N}\sum_{n=0}^{N-1} x[n]^2}$$

---

## 4. Application Structure & Views

1. **Overview (`LandingPage.tsx`)**: Editorial presentation, interactive sample waveform demonstration, 3-pillar feature architecture, and entry CTA.
2. **New Analysis (`NewAnalysisWorkspace.tsx`)**: Speech category selector, audio upload / live mic recorder, transcript editor, reference benchmark matcher, evaluation rubric, and privacy consent.
3. **Results Dashboard (`ResultsDashboard.tsx`)**: Full acoustic dossier with A/B contrastive player, comparative time-series canvas, karaoke transcript, flaw evidence panel, and rubric scorecard.
4. **Reference Library (`ReferenceLibrary.tsx`)**: Sourced corpus explorer, 4-tier flawed mirror inspection, and JSON dataset download.
5. **Analysis History (`AnalysisHistory.tsx`)**: Persisted longitudinal records of previous speech evaluations stored in browser `localStorage`.
6. **Methodology Lab (`MethodologyLab.tsx`)**: Mathematical formulas and forensic rubric weights.

---

## 5. Development & Build Setup

### Prerequisites
- Node.js $\ge 18$
- npm $\ge 9$

### Commands
```bash
# Install dependencies
npm install

# Start development server on port 3000
npm run dev

# Run TypeScript linter
npm run lint

# Compile production build
npm run build
```

---

## 6. Privacy & Security Architecture
- **Client-Side Execution**: Audio decoding and feature extraction run locally in the browser via the Web Audio API without transmitting raw audio to external servers.
- **Zero API Key Leakage**: No client-side secret exposure; standalone client DSP engine ensures reliable offline and sandboxed evaluation.
- **Reproducible Evaluation**: Deterministic DSP calculations produce consistent scores and bounds across identical inputs.
