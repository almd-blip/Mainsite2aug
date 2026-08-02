/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppConfig, AccessibilitySettings, ActiveTab } from '../types';
import SecondThoughtWebsite from './SecondThoughtWebsite';

interface WorkspaceMenuProps {
  activeApp?: AppConfig;
  settings?: AccessibilitySettings;
  onSettingsChange?: (settings: AccessibilitySettings) => void;
  onSelectApp?: (appId: string) => void;
  onNavigateToTab?: (tab: ActiveTab) => void;
  playTick?: (freq: number, dur?: number) => void;
}

export default function WorkspaceMenu({ 
  activeApp,
  settings, 
  onSettingsChange, 
  onSelectApp, 
  onNavigateToTab, 
  playTick 
}: WorkspaceMenuProps) {
  return (
    <div className="w-full space-y-10 text-left" id="workspace-layer">
      <SecondThoughtWebsite
        activeApp={activeApp}
        fontSize={settings?.fontSize || 'standard'}
        settings={settings}
        onSettingsChange={onSettingsChange}
        onSelectApp={onSelectApp}
        initialCategory="ready"
        onNavigateToTab={onNavigateToTab}
        playTick={playTick}
      />
    </div>
  );
}
