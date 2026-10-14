import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp, Sparkles, BookOpen, BarChart3, ChevronRight, Activity, ArrowRight } from 'lucide-react';
import { AppView } from './Navigation';
import { ScrollState } from '../hooks/useScrollDirection';

export interface FloatingActionsProps {
  scrollState: ScrollState;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  hasActiveResults: boolean;
  onOpenReport?: () => void;
}

interface ActionConfig {
  key: string;
  label: string;
  sub: string;
  action: () => void;
  icon: React.ReactNode;
}

/**
 * ScrollAwareFloatingActions
 *
 * Implements the Apple-grade scroll-aware floating interaction system for FRIDAY:
 * - Weightless physical elevation above page content
 * - Intelligently enters viewport on downward/upward scrolls via transform + opacity
 * - Gracefully recedes at top of page so zero duplicate controls exist
 * - Section-aware contextual action with smooth cross-fade transition
 * - Single source of truth: 0 layout shift, GPU-accelerated, thumb-friendly
 */
export const ScrollAwareFloatingActions: React.FC<FloatingActionsProps> = ({
  scrollState,
  currentView,
  onNavigate,
  hasActiveResults,
  onOpenReport,
}) => {
  const { scrollY, isNearTop, activeSection } = scrollState;

  // Track active action with cross-fade animation state
  const [displayedAction, setDisplayedAction] = useState<ActionConfig | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const currentActionKey = useRef('');

  // Floating panel is visible when scrolled past top boundary
  const isVisible = !isNearTop;

  // Back to top button reveals when scrolled deep into content (> 350px)
  const showBackToTop = scrollY > 350;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Determine target contextual action based on current view and intersected section
  const getTargetAction = (): ActionConfig => {
    if (currentView === 'overview') {
      if (activeSection === 'features') {
        return {
          key: 'overview_features',
          label: 'Explore Methodology',
          sub: 'Forensic DSP',
          action: () => onNavigate('methodology'),
          icon: <BookOpen className="w-3.5 h-3.5 text-[#C6A66A] shrink-0" />,
        };
      }
      if (activeSection === 'demonstration') {
        return {
          key: 'overview_demonstration',
          label: 'Browse Benchmarks',
          sub: 'Canonical Corpus',
          action: () => onNavigate('library'),
          icon: <Activity className="w-3.5 h-3.5 text-[#C6A66A] shrink-0" />,
        };
      }
      if (activeSection === 'cta') {
        return {
          key: 'overview_cta',
          label: 'Start Speech Analysis',
          sub: 'Instant Evaluation',
          action: () => onNavigate('analysis'),
          icon: <Sparkles className="w-3.5 h-3.5 text-[#C6A66A] shrink-0" />,
        };
      }
      return {
        key: 'overview_hero',
        label: 'Analyze Your Speech',
        sub: 'Temporal Grounding',
        action: () => onNavigate('analysis'),
        icon: <Sparkles className="w-3.5 h-3.5 text-[#C6A66A] shrink-0" />,
      };
    }

    if (currentView === 'results') {
      return {
        key: 'results_dossier',
        label: 'Diagnostic Dossier',
        sub: 'Export & Share',
        action: () => (onOpenReport ? onOpenReport() : onNavigate('results')),
        icon: <BarChart3 className="w-3.5 h-3.5 text-[#C6A66A] shrink-0" />,
      };
    }

    if (currentView === 'analysis') {
      return {
        key: 'analysis_library',
        label: 'Reference Corpus',
        sub: 'Contrastive Benchmarks',
        action: () => onNavigate('library'),
        icon: <BookOpen className="w-3.5 h-3.5 text-[#C6A66A] shrink-0" />,
      };
    }

    return {
      key: 'general_analysis',
      label: 'Analyze Your Speech',
      sub: 'Speech Evaluation',
      action: () => onNavigate('analysis'),
      icon: <Sparkles className="w-3.5 h-3.5 text-[#C6A66A] shrink-0" />,
    };
  };

  const nextAction = getTargetAction();

  // Smooth label cross-fade transition when action changes
  useEffect(() => {
    if (!displayedAction) {
      setDisplayedAction(nextAction);
      currentActionKey.current = nextAction.key;
      return;
    }

    if (nextAction.key !== currentActionKey.current) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setDisplayedAction(nextAction);
        currentActionKey.current = nextAction.key;
        setIsTransitioning(false);
      }, 140);
      return () => clearTimeout(timer);
    }
  }, [nextAction.key, displayedAction]);

  const activeAction = displayedAction || nextAction;

  return (
    <aside
      className={`fixed bottom-4 right-4 sm:bottom-7 sm:right-7 z-40 flex items-center gap-2.5 select-none pointer-events-none transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] pb-[env(safe-area-inset-bottom)] motion-reduce:transition-none ${
        isVisible
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-3.5 scale-[0.97]'
      }`}
      aria-label="Floating Contextual Actions"
    >
      {/* Primary Floating Action Surface */}
      <div
        className={`flex items-center p-1.5 rounded-2xl bg-[#FFFFFF] dark:bg-[#152C22] border border-[rgba(198,166,106,0.35)] shadow-[0_12px_36px_rgba(0,0,0,0.12)] transition-all duration-300 hover:shadow-[0_16px_44px_rgba(0,0,0,0.16)] hover:-translate-y-0.5 ${
          isVisible ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        {/* Main Contextual Button with Min-Width Stability */}
        <button
          onClick={activeAction.action}
          className="inline-flex items-center gap-2.5 px-3.5 py-2 min-h-[44px] min-w-[170px] sm:min-w-[205px] rounded-xl bg-[#FAF8F5] hover:bg-[#F4EFE6] dark:bg-[#0D1C16] dark:hover:bg-[#132820] text-[var(--text-primary)] text-xs font-sans font-semibold tracking-wide border border-[rgba(198,166,106,0.35)] transition-all cursor-pointer shadow-xs group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A66A]"
          aria-label={activeAction.label}
        >
          {activeAction.icon}

          <div
            className={`flex flex-col text-left leading-tight transition-all duration-200 motion-reduce:transition-none ${
              isTransitioning
                ? 'opacity-0 -translate-y-1'
                : 'opacity-100 translate-y-0'
            }`}
          >
            <span className="font-semibold text-[var(--text-primary)] whitespace-nowrap">
              {activeAction.label}
            </span>
            <span className="text-[9px] text-[#8F6F2E] dark:text-[#DFBA76] hidden sm:inline font-mono uppercase tracking-wider">
              {activeAction.sub}
            </span>
          </div>

          <ChevronRight className="w-3.5 h-3.5 text-[#C6A66A] group-hover:translate-x-0.5 transition-transform ml-auto shrink-0" />
        </button>

        {/* Quick Cross-Link to Results (when user has analyzed audio and is currently elsewhere) */}
        {hasActiveResults && currentView !== 'results' && (
          <button
            onClick={() => onNavigate('results')}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-2 ml-1 min-h-[44px] text-xs font-sans font-medium text-[var(--text-primary)] hover:bg-[#F4EFE6] dark:hover:bg-[#1A382B] rounded-xl transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A66A]"
            title="Inspect active speech results dossier"
            aria-label="Inspect active speech results dossier"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#C6A66A] animate-pulse" />
            <span className="text-[11px] font-semibold text-[var(--text-primary)]">Results</span>
          </button>
        )}
      </div>

      {/* Graceful "Back to Top" Button */}
      <div
        className={`transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          showBackToTop && isVisible
            ? 'opacity-100 scale-100 translate-x-0 pointer-events-auto'
            : 'opacity-0 scale-90 translate-x-2 pointer-events-none w-0 overflow-hidden m-0 p-0'
        }`}
      >
        <button
          onClick={scrollToTop}
          className="w-11 h-11 rounded-full bg-[#FFFFFF] dark:bg-[#152C22] border border-[rgba(198,166,106,0.35)] text-[var(--text-primary)] hover:border-[#C6A66A] flex items-center justify-center shadow-[0_8px_25px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.14)] hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A66A]"
          title="Return to top of page"
          aria-label="Return to top of page"
        >
          <ArrowUp className="w-4 h-4 text-[#C6A66A]" />
        </button>
      </div>
    </aside>
  );
};

export const FloatingActions = ScrollAwareFloatingActions;
