'use client';
import { Heart, User } from 'lucide-react';
import type { ViewMode, ListingTab } from './types';

function Logo() {
  return (
    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 19, letterSpacing: '-0.02em', color: '#111111' }}>
      GoNest
    </span>
  );
}

type Props = {
  currentView: ViewMode;
  activeTab: ListingTab;
  savedCount: number;
  isAuthed: boolean;
  onTabChange: (tab: ListingTab) => void;
  onViewChange: (view: ViewMode) => void;
};

const tabs: { id: ListingTab; label: string }[] = [
  { id: 'buy', label: 'Buy' },
  { id: 'rent', label: 'Rent' },
  { id: 'resale', label: 'Resale' },
  { id: 'new-projects', label: 'New Projects' },
];

export function GnHeader({ currentView, activeTab, savedCount, isAuthed, onTabChange, onViewChange }: Props) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b" style={{ borderColor: '#E5E5E5' }}>
      <div className="mx-auto px-6 lg:px-10 flex items-center justify-between h-16" style={{ maxWidth: 1200 }}>
        <button onClick={() => onViewChange('home')}>
          <Logo />
        </button>

        <nav className="hidden md:flex items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="px-3.5 py-2 rounded-full text-sm transition-colors"
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: currentView === 'search' && activeTab === tab.id ? 600 : 400,
                color: currentView === 'search' && activeTab === tab.id ? '#111111' : '#6B6B6B',
                background: currentView === 'search' && activeTab === tab.id ? '#F7F7F7' : 'transparent',
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewChange('saved')}
            className="relative flex items-center gap-1.5 px-3 py-2 rounded-full text-sm transition-colors"
            style={{
              fontFamily: 'var(--font-body)',
              color: currentView === 'saved' ? '#111111' : '#6B6B6B',
              background: currentView === 'saved' ? '#F7F7F7' : 'transparent',
            }}
          >
            <Heart className="h-4 w-4" fill={currentView === 'saved' ? '#111111' : 'none'} />
            <span className="hidden sm:inline">Saved</span>
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white flex items-center justify-center"
                style={{ background: '#111111', fontSize: 10, fontFamily: 'var(--font-body)' }}>
                {savedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onViewChange(isAuthed ? 'dashboard' : ('auth' as ViewMode))}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium"
            style={{
              fontFamily: 'var(--font-body)',
              border: '1px solid #111111',
              color: '#111111',
            }}
          >
            <User className="h-3.5 w-3.5" />
            {isAuthed ? 'Account' : 'Sign In'}
          </button>
        </div>
      </div>
    </header>
  );
}
