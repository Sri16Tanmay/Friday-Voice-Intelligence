import React from 'react';
import { Sun, Moon, PlusCircle, Award, Menu } from 'lucide-react';
import { AppView } from './Navigation';
import { BrandLogo } from './BrandLogo';
import { useScrollDirection } from '../hooks/useScrollDirection';

interface TopNavigationProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  sessionTitle?: string;
  onOpenReport?: () => void;
  hasActiveResults: boolean;
  onToggleMobileMenu?: () => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  currentView,
  onNavigate,
  theme,
  onToggleTheme,
  sessionTitle,
  onOpenReport,
  hasActiveResults,
  onToggleMobileMenu,
}) => {
  const { scrollY, scrollDirection } = useScrollDirection();
  const isHidden = scrollY > 60 && scrollDirection === 'down';

  const getBreadcrumb = () => {
    switch (currentView) {
      case 'analysis':
        return 'New Analysis Workspace';
      case 'results':
        return `Results Dossier ${sessionTitle ? `· ${sessionTitle}` : ''}`;
      case 'library':
        return 'Reference Speech Library & Ground Truth';
      case 'history':
        return 'Analysis History & Longitudinal Records';
      case 'methodology':
        return 'Acoustic DSP Methodology & Forensic Math';
      default:
        return 'Platform';
    }
  };

  return (
    <header className={`sticky top-0 z-30 bg-[#073B2A] border-b border-[rgba(201,164,92,0.2)] select-none shadow-[0_4px_20px_rgba(0,0,0,0.25)] will-change-transform transition-all duration-300 ease-in-out ${
      isHidden ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
    }`}>
      {/* Ambient subtle top hairline */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(201,164,92,0.3)] to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-4">
          
          {/* Left: Mobile Menu Toggle, Brand Logo & Breadcrumbs */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Mobile Menu Button */}
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-xl border border-[rgba(201,164,92,0.3)] bg-[#0C4A36]/80 text-[#F7F3E9] hover:bg-[#0E573F] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A45C]"
              aria-label="Toggle Navigation Menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Brand Anchor with Official Logo */}
            <button
              onClick={() => onNavigate('overview')}
              className="flex items-center cursor-pointer focus:outline-none hover:scale-[1.01] transition-transform rounded-lg focus-visible:ring-2 focus-visible:ring-[#C9A45C]"
              aria-label="FRIDAY — AI Speech Intelligence Home"
            >
              <BrandLogo size="sm" showWordmark={true} showSubtitle={true} onDark={true} />
            </button>

            <span className="text-[rgba(201,164,92,0.4)] hidden md:inline font-mono">/</span>

            {/* Breadcrumb path */}
            <div className="hidden md:flex items-center gap-1.5 text-xs font-sans">
              <span className="text-[#F7F3E9] font-medium truncate max-w-[140px] md:max-w-xs tracking-wide">
                {getBreadcrumb()}
              </span>
            </div>
          </div>

          {/* Center: Quick Platform Access Tabs */}
          <nav className="hidden xl:flex items-center gap-4 text-xs font-sans font-medium">
            {[
              { id: 'overview' as AppView, label: 'Overview' },
              { id: 'analysis' as AppView, label: 'Workspace' },
              { id: 'library' as AppView, label: 'Library' },
              { id: 'history' as AppView, label: 'History' },
              { id: 'methodology' as AppView, label: 'Methodology' },
            ].map((tab) => {
              const isActive = currentView === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onNavigate(tab.id)}
                  className={`group relative px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#0C4A36] text-[#F7F3E9] font-semibold border border-[#C9A45C]/40 shadow-xs'
                      : 'text-[#96ACA0] hover:text-[#F7F3E9] hover:bg-[#0C4A36]/40'
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: Contextual Action & Theme Toggle */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Quick Context Action */}
            {currentView === 'results' && onOpenReport ? (
              <button
                onClick={onOpenReport}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0C4A36] hover:bg-[#0E573F] text-[#F7F3E9] text-xs font-sans font-semibold border border-[#C9A45C]/45 transition-all duration-200 cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A45C]"
              >
                <Award className="w-3.5 h-3.5 text-[#C9A45C]" />
                <span className="hidden sm:inline">Export Dossier</span>
                <span className="sm:hidden">Export</span>
              </button>
            ) : currentView !== 'analysis' ? (
              <button
                onClick={() => onNavigate('analysis')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0C4A36] hover:bg-[#0E573F] text-[#F7F3E9] text-xs font-sans font-semibold border border-[#C9A45C]/45 transition-all duration-200 cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A45C]"
              >
                <PlusCircle className="w-3.5 h-3.5 text-[#C9A45C]" />
                <span className="hidden sm:inline">New Analysis</span>
                <span className="sm:hidden">Analyze</span>
              </button>
            ) : null}

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="w-9 h-9 rounded-xl border border-[rgba(201,164,92,0.3)] bg-[#0C4A36]/80 text-[#F7F3E9] hover:bg-[#0E573F] hover:border-[#C9A45C] flex items-center justify-center transition-colors duration-200 cursor-pointer shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A45C]"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-[#C9A45C]" />
              ) : (
                <Moon className="w-4 h-4 text-[#F7F3E9]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 1px low-opacity gold divider at bottom edge */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[rgba(201,164,92,0.22)] to-transparent" />
    </header>
  );
};
