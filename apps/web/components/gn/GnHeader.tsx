'use client';
import { Heart, LayoutDashboard, Shield, Home } from 'lucide-react';
import type { ViewMode, ListingTab } from './types';

function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="#0057FF" />
      <path d="M16 6L6 14v12h7v-7h6v7h7V14L16 6z" fill="white" />
      <circle cx="16" cy="13" r="2.5" fill="#FF5A5F" />
    </svg>
  );
}

type Props = {
  currentView: ViewMode;
  activeTab: ListingTab;
  savedCount: number;
  onTabChange: (tab: ListingTab) => void;
  onViewChange: (view: ViewMode) => void;
};

export function GnHeader({ currentView, activeTab, savedCount, onTabChange, onViewChange }: Props) {
  const tabs: ListingTab[] = ['buy', 'rent', 'resale'];

  return (
    <header className="sticky top-0 z-50 bg-white border-b" style={{ borderColor: 'rgba(0,0,0,0.07)', backdropFilter: 'blur(12px)' }}>
      <div className="mx-auto px-6 lg:px-20 flex items-center justify-between h-16" style={{ maxWidth: 1440 }}>

        {/* Logo */}
        <button onClick={() => onViewChange('home')} className="flex items-center gap-2.5">
          <Logo size={30} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20 }}>
            <span style={{ color: '#0057FF' }}>Go</span><span style={{ color: '#FF5A5F' }}>Nest</span>
          </span>
        </button>

        {/* Tabs */}
        <nav className="hidden md:flex items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className="px-4 py-2 rounded-xl text-sm capitalize transition-colors"
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: currentView === 'search' && activeTab === tab ? 600 : 400,
                background: currentView === 'search' && activeTab === tab ? '#f0f4ff' : 'transparent',
                color: currentView === 'search' && activeTab === tab ? '#0057FF' : '#6b7280',
              }}
            >
              {tab}
            </button>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewChange('saved')}
            className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-colors"
            style={{
              fontFamily: 'var(--font-body)',
              background: currentView === 'saved' ? '#f0f4ff' : 'transparent',
              color: currentView === 'saved' ? '#0057FF' : '#6b7280',
            }}
          >
            <Heart className="h-4 w-4" fill={currentView === 'saved' ? '#0057FF' : 'none'} />
            <span className="hidden sm:inline">Saved</span>
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-xs flex items-center justify-center"
                style={{ background: '#FF5A5F', fontFamily: 'var(--font-body)', fontSize: 10 }}>
                {savedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onViewChange('dashboard')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-colors"
            style={{
              fontFamily: 'var(--font-body)',
              background: currentView === 'dashboard' ? '#f0f4ff' : 'transparent',
              color: currentView === 'dashboard' ? '#0057FF' : '#6b7280',
            }}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>

          <button
            onClick={() => onViewChange('admin')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-colors"
            style={{
              fontFamily: 'var(--font-body)',
              background: currentView === 'admin' ? '#f0f4ff' : 'transparent',
              color: currentView === 'admin' ? '#0057FF' : '#6b7280',
            }}
          >
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Admin</span>
          </button>

          <button
            onClick={() => onViewChange('home')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold ml-1"
            style={{ background: '#0057FF', fontFamily: 'var(--font-body)', boxShadow: '0 4px 12px rgba(0,87,255,0.3)' }}
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </button>
        </div>
      </div>
    </header>
  );
}
