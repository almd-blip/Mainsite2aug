/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppConfig, AccessibilitySettings, ActiveTab } from '../types';
import { APP_CONFIGS } from '../data';
import PauseAndBreatheMenu from './PauseAndBreatheMenu';
import ExploreMenu from './ExploreMenu';
import WorkspaceMenu from './WorkspaceMenu';
import AccessibilityPanel from './AccessibilityPanel';
import CollapsibleAccessibilitySection from './CollapsibleAccessibilitySection';
import TrustFooter from './TrustFooter';
import { 
  ChevronDown, ChevronUp, Wind, Compass, Sparkles, Sliders, 
  RotateCcw, ExternalLink, HelpCircle, EyeOff, ArrowLeft, ChevronRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useThemeClasses } from '../hooks/useThemeClasses';
import BrandLogo from './BrandLogo';

interface HomeScreenProps {
  activeApp: AppConfig;
  onAppChange: (app: AppConfig) => void;
  settings: AccessibilitySettings;
  onSettingsChange: (settings: AccessibilitySettings) => void;
  initialExpandedTab: ActiveTab;
  onResetToArrival: () => void;
  onResetToChoice?: () => void;
  playTick: (freq: number, dur?: number) => void;
}

export default function HomeScreen({
  activeApp,
  onAppChange,
  settings,
  onSettingsChange,
  initialExpandedTab,
  onResetToArrival,
  onResetToChoice,
  playTick
}: HomeScreenProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>(initialExpandedTab);

  const handleAppChange = (appId: string) => {
    const matched = APP_CONFIGS.find(a => a.id === appId);
    if (matched) {
      onAppChange(matched);
      onSettingsChange({
        ...settings,
        activeModules: matched.modules
      });
      playTick(587, 0.15);
    }
  };

  // Shared theme classes (same logic as App and ArrivalScreen).
  const themeClasses = useThemeClasses(settings);

  const isHighContrast = settings.contrast === 'high';

  const getTabLabel = (tab: ActiveTab) => {
    switch (tab) {
      case 'wellbeing': return 'Pause & Breathe';
      case 'about': return 'Explore';
      case 'workspace': return 'I’m ready';
      case 'accessibility': return 'Accessibility';
      default: return '';
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${themeClasses}`} id="home-dashboard">
      <div className="max-w-7xl md:max-w-[1400px] mx-auto px-6 sm:px-8 py-8 md:py-14 space-y-12 text-left text-current" id="home-container">
        
        {/* Brand wordmark — small, calm, top-left */}
        <div className="text-left shrink-0" id="home-logo">
          <BrandLogo settings={settings} className="w-28 md:w-32" />
        </div>

        {/* Top Header: Navigation */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-current/10 text-left text-current" id="home-header">
          <nav aria-label="Breadcrumb navigation" id="home-breadcrumb-nav" className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-medium text-current">
            <button
              id="home-breadcrumb-arrival"
              onClick={onResetToArrival}
              className="hover:underline flex items-center gap-1.5 text-current/70 hover:text-current transition-colors cursor-pointer focus:outline-none"
              title="Return to Page 1: Arrival Experience"
            >
              <RotateCcw className="w-3.5 h-3.5 opacity-80 shrink-0" />
              <span>Arrival Experience</span>
            </button>

            <ChevronRight className="w-3.5 h-3.5 opacity-40 shrink-0" />

            {onResetToChoice ? (
              <button
                id="home-breadcrumb-choice"
                onClick={onResetToChoice}
                className="hover:underline text-current/70 hover:text-current transition-colors cursor-pointer focus:outline-none"
                title="Return to Page 2: Where would you like to begin?"
              >
                <span>Where would you like to begin?</span>
              </button>
            ) : (
              <span className="text-current/70">Where would you like to begin?</span>
            )}

            <ChevronRight className="w-3.5 h-3.5 opacity-40 shrink-0" />

            <span className="font-semibold text-current bg-current/5 px-2.5 py-0.5 rounded-md border border-current/15">
              {getTabLabel(activeTab)}
            </span>
          </nav>

          {settings.reducedMotion && (
            <span
              id="reduced-motion-active-indicator"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide border border-current/20 bg-current/[0.06] text-current select-none shrink-0"
              title="Reduced motion is active."
            >
              <EyeOff className="w-3 h-3 text-[#1D9E75] shrink-0" />
              <span>Reduced Motion</span>
            </span>
          )}
        </header>

        {/* --- VIEW CONTENT ACCORDING TO SELECTED CARD --- */}
        {activeTab === 'wellbeing' && (
          <div className="w-full text-left space-y-12" id="view-wellbeing">
            <ExploreMenu
              activeApp={activeApp}
              fontSize={settings.fontSize}
              settings={settings}
              onSettingsChange={onSettingsChange}
              onSelectApp={handleAppChange}
              initialCategory="pause-and-breathe"
              onNavigateToTab={(tab) => {
                setActiveTab(tab);
              }}
              playTick={playTick}
            />

            {/* Always Collapsible Accessibility Settings section */}
            <CollapsibleAccessibilitySection
              settings={settings}
              onChange={onSettingsChange}
              appModules={activeApp.modules}
            />
          </div>
        )}

        {activeTab === 'about' && (
          <div className="w-full text-left space-y-12" id="view-explore">
            <ExploreMenu
              activeApp={activeApp}
              fontSize={settings.fontSize}
              settings={settings}
              onSettingsChange={onSettingsChange}
              onSelectApp={handleAppChange}
              initialCategory="home"
              onNavigateToTab={(tab) => {
                setActiveTab(tab);
              }}
              playTick={playTick}
            />

            {/* Always Collapsible Accessibility Settings section */}
            <CollapsibleAccessibilitySection
              settings={settings}
              onChange={onSettingsChange}
              appModules={activeApp.modules}
            />
          </div>
        )}

        {activeTab === 'workspace' && (
          <div className="w-full text-left space-y-12" id="view-workspace">
            <WorkspaceMenu
              activeApp={activeApp}
              settings={settings}
              onSettingsChange={onSettingsChange}
              onSelectApp={handleAppChange}
              onNavigateToTab={(tab) => setActiveTab(tab)}
              playTick={playTick}
            />

            {/* Always Collapsible Accessibility Settings section */}
            <CollapsibleAccessibilitySection
              settings={settings}
              onChange={onSettingsChange}
              appModules={activeApp.modules}
            />
          </div>
        )}

        {activeTab === 'accessibility' && (
          <div className="w-full text-left space-y-10" id="view-accessibility">
            <div className="flex items-center gap-2 border-b border-current/10 pb-4 text-left" id="view-acc-hdr">
              <Sliders className="w-5 h-5 text-[#1B0A3B] shrink-0" />
              <h2 className="text-xl font-semibold text-left" id="view-acc-title">
                Accessibility settings
              </h2>
            </div>
            <div className="border border-current/10 rounded-2xl p-6 bg-current/[0.01]" id="view-acc-body">
              <AccessibilityPanel settings={settings} onChange={onSettingsChange} appModules={activeApp.modules} />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
