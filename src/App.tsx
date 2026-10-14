import React, { useState, useEffect, useCallback } from 'react';
import {
  SpeechBenchmark,
  FlawLevelId,
  FlawVariant,
  TemporalFlaw,
  AcousticTrajectory,
  AnalysisSession,
  SpeechCategory,
} from './types/speech';
import { SPEECH_BENCHMARKS } from './data/contrastiveDataset';
import { speechAudioEngine } from './services/speechSynthesizer';
import { Navigation, AppView } from './components/Navigation';
import { AppSidebar } from './components/AppSidebar';
import { TopNavigation } from './components/TopNavigation';
import { LandingPage } from './components/LandingPage';
import { NewAnalysisWorkspace } from './components/NewAnalysisWorkspace';
import { ResultsDashboard } from './components/ResultsDashboard';
import { ReferenceLibrary } from './components/ReferenceLibrary';
import { AnalysisHistory } from './components/AnalysisHistory';
import { MethodologyLab } from './components/MethodologyLab';
import { ExportReportModal } from './components/ExportReportModal';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useScrollDirection } from './hooks/useScrollDirection';
import { generateRubricEvaluation } from './services/acousticEngine';
import { X } from 'lucide-react';

export default function App() {
  const scrollState = useScrollDirection(12);
  const [benchmarks] = useState<SpeechBenchmark[]>(SPEECH_BENCHMARKS);
  const [currentView, setCurrentView] = useState<AppView>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Theme Management (Default to Imperial Emerald Light Luxury)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('friday_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'light';
  });

  useEffect(() => {
    localStorage.setItem('friday_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Active Analysis State
  const [selectedBenchmark, setSelectedBenchmark] = useState<SpeechBenchmark>(SPEECH_BENCHMARKS[0]);
  const [selectedLevel, setSelectedLevel] = useState<FlawLevelId>('level_1_egregious');
  const [customVariant, setCustomVariant] = useState<FlawVariant | null>(null);
  const [sessionTitle, setSessionTitle] = useState<string>('Rice University Stadium Address (1962)');
  const [sessionCategory, setSessionCategory] = useState<SpeechCategory>('Persuasive Oratory');
  const [hasActiveResults, setHasActiveResults] = useState<boolean>(true);

  // Analysis History Persistence
  const [historySessions, setHistorySessions] = useState<AnalysisSession[]>(() => {
    try {
      const saved = localStorage.getItem('friday_analysis_history');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    // Initial sample session
    const defaultEval = SPEECH_BENCHMARKS[0].variants.level_1_egregious.evaluation;
    return [
      {
        id: 'sample_session_1',
        createdAt: new Date().toISOString(),
        speechTitle: 'JFK Moonshot Recital Take 1',
        category: 'Persuasive Oratory',
        referenceId: SPEECH_BENCHMARKS[0].id,
        referenceTitle: SPEECH_BENCHMARKS[0].title,
        referenceSpeaker: SPEECH_BENCHMARKS[0].speaker,
        rubricPreset: 'balanced',
        overallScore: defaultEval.overallScore,
        confidenceInterval: defaultEval.confidenceInterval,
        flawCount: SPEECH_BENCHMARKS[0].variants.level_1_egregious.flaws.length,
        duration: SPEECH_BENCHMARKS[0].variants.level_1_egregious.acousticTrajectory.duration,
        flaws: SPEECH_BENCHMARKS[0].variants.level_1_egregious.flaws,
        evaluation: defaultEval,
        trajectory: SPEECH_BENCHMARKS[0].variants.level_1_egregious.acousticTrajectory,
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('friday_analysis_history', JSON.stringify(historySessions));
  }, [historySessions]);

  // Audio Transport State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackMode, setPlaybackMode] = useState<'ideal' | 'flawed'>('flawed');
  const [selectedFlaw, setSelectedFlaw] = useState<TemporalFlaw | null>(null);
  const [loopRange, setLoopRange] = useState<[number, number] | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const activeVariant: FlawVariant =
    customVariant || selectedBenchmark.variants[selectedLevel];
  const duration = activeVariant.acousticTrajectory.duration;

  // Audio Callbacks
  useEffect(() => {
    speechAudioEngine.setCallbacks(
      (time) => setCurrentTime(time),
      () => setIsPlaying(false)
    );
  }, []);

  // Sync Audio Engine on Variant/Benchmark/PlaybackMode Change
  useEffect(() => {
    speechAudioEngine.stop();
    setIsPlaying(false);
    setCurrentTime(0);
    setLoopRange(null);
    setSelectedFlaw(null);

    const traj =
      playbackMode === 'ideal'
        ? selectedBenchmark.idealTrajectory
        : activeVariant.acousticTrajectory;

    speechAudioEngine.loadSpeech(
      selectedBenchmark.transcript,
      selectedBenchmark.alignedWords,
      traj
    );
    speechAudioEngine.setPlaybackMode(
      playbackMode,
      selectedBenchmark.idealTrajectory,
      activeVariant.acousticTrajectory
    );
  }, [selectedBenchmark, selectedLevel, customVariant, playbackMode]);

  // Transport Handlers
  const handlePlay = useCallback(() => {
    speechAudioEngine.play();
    setIsPlaying(true);
  }, []);

  const handlePause = useCallback(() => {
    speechAudioEngine.pause();
    setIsPlaying(false);
  }, []);

  const handleReset = useCallback(() => {
    speechAudioEngine.stop();
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  const handleSeek = useCallback((time: number) => {
    speechAudioEngine.seek(time);
    setCurrentTime(time);
  }, []);

  const handleChangePlaybackMode = useCallback(
    (mode: 'ideal' | 'flawed') => {
      setPlaybackMode(mode);
      speechAudioEngine.setPlaybackMode(
        mode,
        selectedBenchmark.idealTrajectory,
        activeVariant.acousticTrajectory
      );
    },
    [selectedBenchmark, activeVariant]
  );

  const handleToggleLoopFlaw = useCallback(
    (flaw: TemporalFlaw) => {
      if (loopRange && loopRange[0] === flaw.startTime && loopRange[1] === flaw.endTime) {
        setLoopRange(null);
        speechAudioEngine.setLoopRange(null);
      } else {
        const range: [number, number] = [flaw.startTime, flaw.endTime];
        setLoopRange(range);
        setSelectedFlaw(flaw);
        speechAudioEngine.setLoopRange(range);
        handleSeek(flaw.startTime);
        if (!isPlaying) handlePlay();
      }
    },
    [loopRange, isPlaying, handleSeek, handlePlay]
  );

  const handleClearLoop = useCallback(() => {
    setLoopRange(null);
    speechAudioEngine.setLoopRange(null);
  }, []);

  // Handle Analysis Completion from NewAnalysisWorkspace
  const handleAnalysisComplete = (sessionData: {
    speechTitle: string;
    category: SpeechCategory;
    referenceBenchmark: SpeechBenchmark;
    referenceVariantId: FlawLevelId;
    rubricPreset: 'balanced' | 'pacing_pauses' | 'vocal_expression';
    trajectory: AcousticTrajectory;
    flaws: TemporalFlaw[];
    transcript: string;
    audioSourceLabel: string;
  }) => {
    setSelectedBenchmark(sessionData.referenceBenchmark);
    setSessionTitle(sessionData.speechTitle);
    setSessionCategory(sessionData.category);

    const evaluation = generateRubricEvaluation(
      sessionData.trajectory,
      sessionData.referenceBenchmark.idealTrajectory,
      sessionData.flaws
    );

    const variant: FlawVariant = {
      levelId: sessionData.referenceVariantId,
      label: sessionData.audioSourceLabel,
      subtitle: 'Participant Recital (Live Analysis)',
      description: 'Acoustic feature trajectory and DTW alignment against canonical benchmark.',
      flawCount: sessionData.flaws.length,
      targetOverallScore: evaluation.overallScore,
      acousticTrajectory: sessionData.trajectory,
      flaws: sessionData.flaws,
      evaluation,
    };

    setCustomVariant(variant);
    setSelectedLevel(sessionData.referenceVariantId);
    setPlaybackMode('flawed');
    setHasActiveResults(true);

    // Save to history
    const newSession: AnalysisSession = {
      id: `session_${Date.now()}`,
      createdAt: new Date().toISOString(),
      speechTitle: sessionData.speechTitle,
      category: sessionData.category,
      referenceId: sessionData.referenceBenchmark.id,
      referenceTitle: sessionData.referenceBenchmark.title,
      referenceSpeaker: sessionData.referenceBenchmark.speaker,
      rubricPreset: sessionData.rubricPreset,
      overallScore: evaluation.overallScore,
      confidenceInterval: evaluation.confidenceInterval,
      flawCount: sessionData.flaws.length,
      duration: sessionData.trajectory.duration,
      flaws: sessionData.flaws,
      evaluation,
      trajectory: sessionData.trajectory,
    };

    setHistorySessions((prev) => [newSession, ...prev]);
    setCurrentView('results');
  };

  // Open an archived session from History
  const handleOpenArchivedSession = (session: AnalysisSession) => {
    const matchBenchmark = benchmarks.find((b) => b.id === session.referenceId) || benchmarks[0];
    setSelectedBenchmark(matchBenchmark);
    setSessionTitle(session.speechTitle);
    setSessionCategory(session.category);

    const variant: FlawVariant = {
      levelId: 'level_2_moderate',
      label: session.speechTitle,
      subtitle: 'Archived Analysis Dossier',
      description: 'Loaded from session history.',
      flawCount: session.flawCount,
      targetOverallScore: session.overallScore,
      acousticTrajectory: session.trajectory,
      flaws: session.flaws,
      evaluation: session.evaluation,
    };

    setCustomVariant(variant);
    setSelectedLevel('level_2_moderate');
    setPlaybackMode('flawed');
    setHasActiveResults(true);
    setCurrentView('results');
  };

  const handleDeleteHistorySession = (id: string) => {
    setHistorySessions((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSelectReferenceAndAnalyze = (benchmark: SpeechBenchmark, levelId: FlawLevelId) => {
    setSelectedBenchmark(benchmark);
    setSelectedLevel(levelId);
    setCustomVariant(null);
    setSessionTitle(`${benchmark.title} (${benchmark.variants[levelId].label})`);
    setSessionCategory(benchmark.category);
    setPlaybackMode(levelId === 'ideal' ? 'ideal' : 'flawed');
    setHasActiveResults(true);
    setCurrentView('results');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col font-sans transition-colors duration-300">
      {/* 1. Landing Page View (Section 8 Minimal Header + Editorial Body) */}
      {currentView === 'overview' ? (
        <div className="flex flex-col min-h-screen">
          <Navigation
            currentView={currentView}
            onNavigate={setCurrentView}
            theme={theme}
            onToggleTheme={toggleTheme}
            hasActiveResults={hasActiveResults}
          />
          <main className="flex-1">
            <ErrorBoundary fallbackTitle="Overview Presentation">
              <LandingPage
                onNavigate={setCurrentView}
                onInspectBenchmark={() => {
                  setSelectedBenchmark(benchmarks[0]);
                  setSelectedLevel('level_1_egregious');
                  setCustomVariant(null);
                  setCurrentView('results');
                }}
              />
            </ErrorBoundary>
          </main>
        </div>
      ) : (
        /* 2. Global Application Shell (Section 7 Restrained 245px Sidebar + Top Navigation) */
        <div className="flex min-h-screen">
          {/* Desktop Restrained Sidebar */}
          <div className="hidden lg:block shrink-0">
            <AppSidebar
              currentView={currentView}
              onNavigate={(view) => {
                setCurrentView(view);
                setIsMobileMenuOpen(false);
              }}
              hasActiveResults={hasActiveResults}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          </div>

          {/* Mobile Overlay Drawer */}
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-50 lg:hidden flex">
              <div
                className="fixed inset-0 bg-black/40 backdrop-blur-xs"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <div className="relative z-10 w-[260px] bg-[var(--surface-elevated)] h-full shadow-2xl flex flex-col">
                <div className="p-4 flex items-center justify-between border-b border-[var(--border-subtle)]">
                  <span className="text-xs font-mono font-semibold text-[var(--accent-primary)] uppercase tracking-wider">
                    Navigation
                  </span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <AppSidebar
                    className="w-full bg-[var(--surface-elevated)] flex flex-col justify-between select-none min-h-full"
                    currentView={currentView}
                    onNavigate={(view) => {
                      setCurrentView(view);
                      setIsMobileMenuOpen(false);
                    }}
                    hasActiveResults={hasActiveResults}
                    theme={theme}
                    onToggleTheme={toggleTheme}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Right Main Application Area */}
          <div className="flex-1 flex flex-col min-w-0">
            <TopNavigation
              currentView={currentView}
              onNavigate={setCurrentView}
              theme={theme}
              onToggleTheme={toggleTheme}
              sessionTitle={sessionTitle}
              onOpenReport={() => setIsReportOpen(true)}
              hasActiveResults={hasActiveResults}
              onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />

            <main className="flex-1 p-4 sm:p-6 lg:p-8">
              <ErrorBoundary fallbackTitle="Speech Intelligence Workspace">
                {currentView === 'analysis' && (
                  <NewAnalysisWorkspace
                    benchmarks={benchmarks}
                    onAnalysisComplete={handleAnalysisComplete}
                  />
                )}

                {currentView === 'results' && (
                  <ResultsDashboard
                    sessionTitle={sessionTitle}
                    category={sessionCategory}
                    referenceBenchmark={selectedBenchmark}
                    activeVariant={activeVariant}
                    selectedLevel={selectedLevel}
                    onSelectLevel={(lvl) => {
                      setCustomVariant(null);
                      setSelectedLevel(lvl);
                      setPlaybackMode(lvl === 'ideal' ? 'ideal' : 'flawed');
                    }}
                    isPlaying={isPlaying}
                    onPlay={handlePlay}
                    onPause={handlePause}
                    onReset={handleReset}
                    currentTime={currentTime}
                    duration={duration}
                    onSeek={handleSeek}
                    playbackMode={playbackMode}
                    onChangePlaybackMode={handleChangePlaybackMode}
                    selectedFlaw={selectedFlaw}
                    onSelectFlaw={setSelectedFlaw}
                    loopRange={loopRange}
                    onToggleLoopFlaw={handleToggleLoopFlaw}
                    onClearLoop={handleClearLoop}
                    onOpenReport={() => setIsReportOpen(true)}
                    onNavigate={setCurrentView}
                  />
                )}

                {currentView === 'library' && (
                  <ReferenceLibrary
                    benchmarks={benchmarks}
                    onSelectAndAnalyze={handleSelectReferenceAndAnalyze}
                  />
                )}

                {currentView === 'history' && (
                  <AnalysisHistory
                    sessions={historySessions}
                    onOpenSession={handleOpenArchivedSession}
                    onDeleteSession={handleDeleteHistorySession}
                    onNavigate={setCurrentView}
                  />
                )}

                {currentView === 'methodology' && <MethodologyLab />}
              </ErrorBoundary>
            </main>
            <Footer onNavigate={setCurrentView} />
          </div>
        </div>
      )}

      {/* Export Report & Dossier Modal */}
      <ExportReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        benchmark={selectedBenchmark}
        activeVariant={activeVariant}
        sessionTitle={sessionTitle}
        category={sessionCategory}
      />
    </div>
  );
}
