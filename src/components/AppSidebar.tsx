import React from 'react';
import { BrandLogo } from './BrandLogo';
import {
  Compass,
  PlusCircle,
  BarChart3,
  BookOpen,
  Clock,
  FlaskConical,
  Sun,
  Moon,
  Database,
  SlidersHorizontal,
} from 'lucide-react';
import { AppView } from './Navigation';

interface AppSidebarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  hasActiveResults: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  className?: string;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentView,
  onNavigate,
  hasActiveResults,
  theme,
  onToggleTheme,
  className = 'w-[245px] shrink-0 bg-[var(--surface-elevated)] border-r border-[var(--border-subtle)] flex flex-col justify-between h-screen sticky top-0 transition-colors duration-300 z-30 select-none',
}) => {
  const navItems: { id: AppView; label: string; icon: React.ReactNode; requiresActive?: boolean }[] = [
    { id: 'overview', label: 'Overview', icon: <Compass className="w-4 h-4" /> },
    { id: 'analysis', label: 'New Analysis', icon: <PlusCircle className="w-4 h-4" /> },
    { id: 'results', label: 'Results Dossier', icon: <BarChart3 className="w-4 h-4" />, requiresActive: true },
    { id: 'library', label: 'Reference Library', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'history', label: 'Analysis History', icon: <Clock className="w-4 h-4" /> },
    { id: 'methodology', label: 'Methodology Lab', icon: <FlaskConical className="w-4 h-4" /> },
  ];

  return (
    <aside className={className}>
      <div className="p-5 space-y-6">
        {/* Brand Header */}
        <button
          onClick={() => onNavigate('overview')}
          className="text-left w-full cursor-pointer focus:outline-none group flex items-center justify-start py-0.5"
          aria-label="FRIDAY — AI Speech Intelligence Home"
        >
          <BrandLogo size="sm" showWordmark={true} showSubtitle={true} onDark={theme === 'dark'} />
        </button>

        {/* Sidebar Nav Links */}
        <nav className="space-y-1">
          <div className="text-[10px] uppercase font-mono tracking-[0.2em] text-[var(--text-muted)] px-3 mb-2 font-semibold">
            Platform Navigation
          </div>

          {navItems.map((item) => {
            if (item.requiresActive && !hasActiveResults) return null;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-sans font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[var(--accent-soft)] text-[var(--accent-primary)] font-semibold shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer Controls */}
      <div className="p-4 border-t border-[var(--border-subtle)] space-y-3 bg-[var(--bg-secondary)]/50">
        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-xs font-sans text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            )}
            <span>{theme === 'dark' ? 'Imperial Light Luxury' : 'Dark Emerald Mode'}</span>
          </div>
          <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">
            {theme}
          </span>
        </button>

        {/* System Footnote */}
        <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)] px-1">
          <span>FRIDAY v1.4</span>
          <span className="text-[var(--status-success)] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-success)]" />
            DSP Engine Ready
          </span>
        </div>
      </div>
    </aside>
  );
};
