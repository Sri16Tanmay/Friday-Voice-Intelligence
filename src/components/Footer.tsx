import React, { useState } from 'react';
import { BrandLogo } from './BrandLogo';
import { AppView } from './Navigation';
import { Volume2, ShieldCheck, Activity, ArrowUpRight } from 'lucide-react';

export interface FooterProps {
  onNavigate?: (view: AppView) => void;
  className?: string;
}

interface IntelligenceSpec {
  title: string;
  subtitle: string;
  summary: string;
  technicalDetails: string;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, className = '' }) => {
  const [activeSpec, setActiveSpec] = useState<IntelligenceSpec | null>(null);

  const handleLinkClick = (view: AppView) => {
    if (onNavigate) {
      onNavigate(view);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const platformLinks: { id: AppView; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'analysis', label: 'Speech Analysis' },
    { id: 'methodology', label: 'Methodology' },
    { id: 'library', label: 'Reference Library' },
    { id: 'results', label: 'Results Dossier' },
    { id: 'history', label: 'History' },
  ];

  const intelligenceItems: IntelligenceSpec[] = [
    {
      title: 'Temporal Flaw Grounding',
      subtitle: 'Dynamic Time Bounding (±10ms)',
      summary: 'Isolates and localizes the exact millisecond intervals where vocal delivery deviates from canonical oratorical benchmarks.',
      technicalDetails: 'Combines Dynamic Time Warping (DTW) with statistical z-score thresholds (-2.95σ) to identify critical cadence fractures and timing hesitations.',
    },
    {
      title: 'Acoustic Trajectory',
      subtitle: 'Multi-Band Time-Series DSP',
      summary: 'Traces fundamental pitch (F0), root-mean-square (RMS) energy, and harmonic spectral envelopes across continuous utterances.',
      technicalDetails: 'Processed via client-side YIN autocorrelation at 48kHz sampling, normalized across phonation frames with zero remote retention.',
    },
    {
      title: 'Speaker-Agnostic Calibration',
      subtitle: 'Relative Ratio & Formant Normalization',
      summary: 'Normalizes biological pitch baselines to evaluate delivery dynamics, pacing, and confidence objectively.',
      technicalDetails: 'Applies semitone scaling relative to speaker baseline mean, evaluating cadence dynamics rather than raw timbre.',
    },
    {
      title: 'Forced Alignment',
      subtitle: 'Phoneme-to-Acoustic Sync',
      summary: 'Maps orthographic transcript tokens directly to underlying audio waveforms and spectral energy boundaries.',
      technicalDetails: 'Synchronizes word-level and syllable-level timestamps to isolate precise verbal delivery deviations with causal explainability.',
    },
  ];

  return (
    <footer
      className={`relative w-full bg-[#073B2A] text-[#F7F3E9] border-t border-[rgba(201,164,92,0.22)] select-none ${className}`}
      style={{
        backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(12, 74, 54, 0.45) 0%, rgba(6, 44, 33, 0.98) 80%)',
      }}
    >
      {/* Subtle top gold glint hairline */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(201,164,92,0.35)] to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        {/* Main Concise Grid: 4 Balanced Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 pb-8 border-b border-[rgba(201,164,92,0.16)]">
          
          {/* Column 1: FRIDAY Brand & Statement (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <button
              onClick={() => handleLinkClick('overview')}
              className="text-left cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C9A45C] rounded-lg transition-transform duration-200 hover:scale-[1.01]"
              aria-label="FRIDAY — AI Speech Intelligence Home"
            >
              <BrandLogo size="sm" showWordmark={true} showSubtitle={true} onDark={true} />
            </button>

            <p className="text-xs text-[#96ACA0] leading-relaxed max-w-xs font-sans">
              <strong className="text-[#F7F3E9] font-medium block mb-0.5">Speech, understood deeper.</strong>
              Evidence-driven speech intelligence for analyzing delivery, cadence, and vocal deviation.
            </p>

            <div className="inline-flex items-center gap-1.5 text-[10px] font-mono text-[#96ACA0] bg-[#0C4A36]/60 px-2.5 py-1 rounded-md border border-[rgba(201,164,92,0.15)]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C9A45C] shrink-0" />
              <span>Zero-Retention Neural Pipeline</span>
            </div>
          </div>

          {/* Column 2: Platform Links (2 cols) */}
          <div className="lg:col-span-2 space-y-2.5">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A45C]" />
              <h4 className="text-[11px] font-mono font-semibold tracking-[0.18em] uppercase text-[#C9A45C]">
                Platform
              </h4>
            </div>

            <ul className="space-y-1.5 text-xs font-sans">
              {platformLinks.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => handleLinkClick(link.id)}
                    className="text-[#96ACA0] hover:text-[#F7F3E9] transition-colors duration-150 cursor-pointer text-left py-0.5 block"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Intelligence Capabilities (3 cols) */}
          <div className="lg:col-span-3 space-y-2.5">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A45C]" />
              <h4 className="text-[11px] font-mono font-semibold tracking-[0.18em] uppercase text-[#C9A45C]">
                Intelligence
              </h4>
            </div>

            <ul className="space-y-1.5 text-xs font-sans">
              {intelligenceItems.map((spec) => (
                <li key={spec.title}>
                  <button
                    onClick={() => setActiveSpec(spec)}
                    className="text-[#96ACA0] hover:text-[#F7F3E9] transition-colors duration-150 text-left flex items-center justify-between w-full group cursor-pointer py-0.5"
                  >
                    <span>{spec.title}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-[#C9A45C] transition-opacity shrink-0 ml-1" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Project & Developer (3 cols) */}
          <div className="lg:col-span-3 space-y-2.5">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A45C]" />
              <h4 className="text-[11px] font-mono font-semibold tracking-[0.18em] uppercase text-[#C9A45C]">
                Project
              </h4>
            </div>

            <div className="p-3 rounded-lg bg-[#0C4A36]/40 border border-[rgba(201,164,92,0.16)] space-y-2 text-xs font-sans">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-[#789487]">Developer</span>
                <span className="text-[#F7F3E9] font-medium">Tanmay Srivastava</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-[#789487]">Contact</span>
                <span className="text-[#C9A45C] font-mono text-xs">873XXXXX09</span>
              </div>
              <div className="flex items-center justify-between border-t border-[rgba(201,164,92,0.12)] pt-1.5">
                <span className="text-[10px] font-mono uppercase text-[#789487]">Project</span>
                <span className="text-[#F7F3E9] text-[11px]">FRIDAY · Speech AI</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Concise Status & Copyright Bar */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] font-mono text-[#96ACA0]">
          
          {/* Status Row */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="inline-flex items-center gap-1.5 text-[#4AAE82]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3E7D63] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4AAE82]" />
              </span>
              <span className="font-semibold uppercase tracking-wider">SYSTEM OPERATIONAL</span>
            </div>
            <span className="text-[rgba(201,164,92,0.3)]">·</span>
            <div className="flex items-center gap-1 text-[#C9A45C]">
              <Volume2 className="w-3 h-3" />
              <span>48kHz DSP</span>
            </div>
            <span className="text-[rgba(201,164,92,0.3)]">·</span>
            <span className="text-[#E9DFC9]">EVIDENCE-BASED</span>
          </div>

          {/* Copyright & Developer */}
          <div className="flex items-center gap-2 text-xs font-sans text-[#789487]">
            <span>© 2026 FRIDAY — AI Speech Intelligence</span>
            <span>·</span>
            <span>Developed by <strong className="text-[#F7F3E9] font-medium">Tanmay Srivastava</strong></span>
          </div>

        </div>

      </div>

      {/* Modal for Technical Intelligence Details */}
      {activeSpec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#073B2A] border border-[rgba(201,164,92,0.4)] shadow-[0_24px_48px_rgba(0,0,0,0.6)] p-6 text-[#F7F3E9]">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-[#0C4A36] border border-[rgba(201,164,92,0.3)] text-[#C9A45C]">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-lg font-serif font-bold text-[#F7F3E9]" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
                    {activeSpec.title}
                  </h4>
                  <span className="text-[10px] font-mono tracking-wider uppercase text-[#C9A45C]">
                    {activeSpec.subtitle}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveSpec(null)}
                className="text-[#96ACA0] hover:text-[#F7F3E9] p-1 rounded-lg hover:bg-[#0C4A36] transition-colors cursor-pointer text-lg leading-none"
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>

            <p className="text-xs sm:text-sm text-[#F7F3E9] mb-3 leading-relaxed">
              {activeSpec.summary}
            </p>

            <div className="p-3 rounded-lg bg-[#062C21] border border-[rgba(201,164,92,0.18)] text-xs font-mono text-[#96ACA0] leading-relaxed mb-5">
              {activeSpec.technicalDetails}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setActiveSpec(null);
                  handleLinkClick('methodology');
                }}
                className="px-3.5 py-1.5 rounded-lg bg-[#0C4A36] hover:bg-[#0E573F] text-[#C9A45C] border border-[#C9A45C]/40 text-xs font-sans font-medium transition-colors cursor-pointer"
              >
                Methodology Lab →
              </button>
              <button
                onClick={() => setActiveSpec(null)}
                className="px-3.5 py-1.5 rounded-lg bg-[#062C21] hover:bg-[#0C4A36] text-[#F7F3E9] border border-[rgba(201,164,92,0.2)] text-xs font-sans font-medium transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
