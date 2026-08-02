/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppConfig, AccessibilitySettings } from '../types';
import SecondThoughtWebsite from './SecondThoughtWebsite';

interface ExploreMenuProps {
  activeApp: AppConfig;
  fontSize: 'standard' | 'large' | 'extra-large';
  settings?: AccessibilitySettings;
  onSettingsChange?: (settings: AccessibilitySettings) => void;
  onSelectApp?: (appId: string) => void;
  initialCategory?: string;
  onNavigateToTab?: (tab: 'wellbeing' | 'about' | 'workspace' | 'accessibility') => void;
  playTick?: (freq: number, dur?: number) => void;
}

export default function ExploreMenu({
  activeApp,
  fontSize,
  settings,
  onSettingsChange,
  onSelectApp,
  initialCategory,
  onNavigateToTab,
  playTick
}: ExploreMenuProps) {
  return (
    <div className="w-full space-y-10 text-left" id="explore-layer">
      <SecondThoughtWebsite
        activeApp={activeApp}
        fontSize={fontSize}
        settings={settings}
        onSettingsChange={onSettingsChange}
        onSelectApp={onSelectApp}
        initialCategory={initialCategory}
        onNavigateToTab={onNavigateToTab}
        playTick={playTick}
      />
    </div>
  );
}
