import React, { useState } from 'react';
import { BrandLogo } from './BrandLogo';
import { Sun, Moon, ArrowRight, Menu, X } from 'lucide-react';
import { useScrollDirection } from '../hooks/useScrollDirection';

export type AppView = 'overview' | 'analysis' | 'results' | 'library' | 'history' | 'methodology';

interface NavigationProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  hasActiveResults: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onNavigate,
  theme,
  onToggleTheme,
  hasActiveResults,
}) => {
  const { scrollY, scrollDirection } = useScrollDirection();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isScrolled = scrollY > 24;
  const isHidden = !mobileMenuOpen && scrollY > 60 && scrollDirection === 'down';

  const navLinks: { id: AppView; label: string; requiresResults?: boolean }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'analysis', label: 'Speech Analysis' },
    { id: 'methodology', label: 'Methodology' },
    { id: 'library', label: 'Reference Library' },
    { id: 'history', label: 'History' },
    { id: 'results', label: 'Results Dossier', requiresResults: true },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 select-none will-change-transform transition-all duration-300 ease-in-out ${
          isHidden ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
        } ${
          isScrolled
            ? 'bg-[#052A20]/95 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.35)] border-b border-[rgba(201,164,92,0.24)]'
            : 'bg-[#073B2A] border-b border-[rgba(201,164,92,0.18)]'
        }`}
        style={{
          backgroundImage: isScrolled
            ? 'radial-gradient(circle at 50% 0%, rgba(12, 74, 54, 0.4) 0%, rgba(5, 42, 32, 0.98) 80%)'
            : 'radial-gradient(ellipse at 20% 0%, rgba(12, 74, 54, 0.6) 0%, rgba(7, 59, 42, 1) 70%)',
        }}
      >
        {/* Subtle Ambient Gold Glint Hairline at the very top */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(201,164,92,0.35)] to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 sm:h-22 gap-4">
            
            {/* Left: Official FRIDAY Brand Lockup + Subtle Acoustic Waveform Signal */}
            <div className="flex items-center gap-4 sm:gap-6 shrink-0">
              <button
                onClick={() => onNavigate('overview')}
                className="cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A45C] rounded-xl p-1 flex items-center group transition-transform duration-200 hover:scale-[1.01]"
                aria-label="FRIDAY — AI Speech Intelligence Home"
              >
                <BrandLogo
                  size="md"
                  showWordmark={true}
                  showSubtitle={true}
                  onDark={true}
                />
              </button>

              {/* Ultra-subtle audio intelligence frequency element */}
              <div
                className="hidden xl:flex items-center gap-1.5 pl-4 border-l border-[rgba(201,164,92,0.18)]"
                aria-hidden="true"
              >
                <div className="flex items-center gap-[3px] h-6 px-1">
                  {[10, 16, 8, 20, 14, 22, 11, 18, 9, 15, 12].map((height, i) => (
                    <span
                      key={i}
                      className="w-[2px] rounded-full transition-opacity duration-300"
                      style={{
                        height: `${height}px`,
                        backgroundColor: i % 3 === 0 ? '#C9A45C' : '#3E7D63',
                        opacity: i % 2 === 0 ? 0.65 : 0.4,
                      }}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-mono tracking-widest text-[#789487] uppercase">
                  Acoustic Core
                </span>
              </div>
            </div>

            {/* Center: Primary Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-xs font-sans font-medium tracking-wide">
              {navLinks.map((item) => {
                if (item.requiresResults && !hasActiveResults) return null;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`group relative py-2.5 px-1.5 cursor-pointer flex flex-col items-center transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C9A45C] rounded ${
                      isActive
                        ? 'text-[#F7F3E9] font-semibold'
                        : 'text-[#96ACA0] hover:text-[#F7F3E9]'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span>{item.label}</span>
                      {item.id === 'results' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C9A45C] animate-pulse" />
                      )}
                    </span>

                    {/* Active State: Refined antique-gold indicator line */}
                    {isActive ? (
                      <span className="absolute -bottom-1 w-6 h-[2px] bg-[#C9A45C] rounded-full shadow-[0_0_6px_rgba(201,164,92,0.4)] transition-all duration-200" />
                    ) : (
                      /* Hover State: Tiny gold underline appears subtly */
                      <span className="absolute -bottom-1 w-0 group-hover:w-4 h-[1.5px] bg-[rgba(201,164,92,0.6)] rounded-full transition-all duration-200" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right: Actions, Theme & Mobile Controls */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
              {/* START ANALYSIS CTA BUTTON */}
              <button
                onClick={() => onNavigate('analysis')}
                className="inline-flex items-center gap-2.5 px-4 sm:px-5 py-2.5 text-xs font-sans font-semibold tracking-wider uppercase rounded-xl bg-[#0C4A36] hover:bg-[#0E573F] text-[#F7F3E9] border border-[#C9A45C]/45 transition-all duration-200 cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.25)] hover:shadow-[0_4px_16px_rgba(201,164,92,0.18)] hover:-translate-y-0.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A45C]"
              >
                <span>Start Analysis</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#C9A45C] group-hover:translate-x-1 transition-transform duration-200" />
              </button>

              {/* Theme Toggle Button */}
              <button
                onClick={onToggleTheme}
                className="w-10 h-10 rounded-xl border border-[rgba(201,164,92,0.3)] bg-[#0C4A36]/80 text-[#F7F3E9] hover:bg-[#0E573F] hover:border-[#C9A45C] flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A45C]"
                aria-label={`Toggle visual theme`}
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-[#C9A45C]" />
                ) : (
                  <Moon className="w-4 h-4 text-[#F7F3E9]" />
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 rounded-xl border border-[rgba(201,164,92,0.3)] bg-[#0C4A36]/80 text-[#F7F3E9] hover:bg-[#0E573F] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A45C]"
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Mobile / Tablet Horizontal Navigation Strip */}
          <div className="lg:hidden flex items-center gap-2 overflow-x-auto py-2.5 border-t border-[rgba(201,164,92,0.18)] scrollbar-none text-xs font-sans">
            {navLinks.map((item) => {
              if (item.requiresResults && !hasActiveResults) return null;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`whitespace-nowrap px-3 py-1.5 min-h-[34px] rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-[#0C4A36] text-[#F7F3E9] font-semibold border border-[#C9A45C]/50 shadow-xs'
                      : 'text-[#96ACA0] hover:text-[#F7F3E9]'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.id === 'results' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9A45C] animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 1px Low-Opacity Antique-Gold/Ivory Divider along bottom edge */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[rgba(201,164,92,0.25)] to-transparent" />
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-full bg-[#073B2A] border-b border-[rgba(201,164,92,0.35)] shadow-2xl p-6 space-y-5 pt-[calc(1.25rem+env(safe-area-inset-top))]">
            <div className="flex items-center justify-between pb-4 border-b border-[rgba(201,164,92,0.2)]">
              <BrandLogo size="sm" showWordmark={true} showSubtitle={true} onDark={true} />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-[#96ACA0] hover:text-[#F7F3E9] rounded-lg hover:bg-[#0C4A36]"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="space-y-1.5">
              {[
                { id: 'overview' as AppView, label: 'Platform Overview' },
                { id: 'analysis' as AppView, label: 'Speech Analysis' },
                { id: 'results' as AppView, label: 'Results Dossier', requiresResults: true },
                { id: 'library' as AppView, label: 'Reference Speech Library' },
                { id: 'history' as AppView, label: 'Analysis History' },
                { id: 'methodology' as AppView, label: 'Acoustic DSP Methodology' },
              ].map((item) => {
                if (item.requiresResults && !hasActiveResults) return null;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-3 rounded-xl text-sm font-sans flex items-center justify-between min-h-[46px] cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-[#0C4A36] text-[#F7F3E9] font-semibold border border-[#C9A45C]/40'
                        : 'text-[#96ACA0] hover:text-[#F7F3E9] hover:bg-[#0C4A36]/50'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#C9A45C]" />}
                  </button>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-[rgba(201,164,92,0.2)] flex items-center justify-between">
              <span className="text-xs font-sans text-[#789487]">Visual Theme</span>
              <button
                onClick={onToggleTheme}
                className="px-3 py-1.5 rounded-lg border border-[rgba(201,164,92,0.3)] bg-[#0C4A36] text-xs font-sans text-[#F7F3E9] flex items-center gap-2"
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-[#C9A45C]" /> : <Moon className="w-3.5 h-3.5 text-[#F7F3E9]" />}
                <span>{theme === 'dark' ? 'Light Ivory' : 'Dark Emerald'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
