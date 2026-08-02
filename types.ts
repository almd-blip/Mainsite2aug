/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ScreenState = 'arrival' | 'choice' | 'home';

export type ActiveTab = 'wellbeing' | 'about' | 'workspace' | 'accessibility';

export interface WorkspaceModule {
  id: string;
  title: string;
  description: string;
}

export interface AppConfig {
  id: string;
  name: string;
  workspaceTitle: string;
  aboutDescription: string;
  capabilities: string[];
  modules: string[];
}

export type FontSizeOption = 'standard' | 'large' | 'extra-large';
export type DisplayModeOption = 'light' | 'dark' | 'high-contrast' | 'low-vision';
export type LetterSpacingOption = 'standard' | 'wide' | 'extra-wide';
export type LineHeightOption = 'standard' | 'double' | 'spacious';
export type ReadingWidthOption = 'narrow' | 'standard' | 'wide' | 'full';

export interface AccessibilitySettings {
  fontSize: FontSizeOption;
  displayMode: DisplayModeOption;
  contrast?: 'standard' | 'high' | 'warm';
  colorPreference?: 'slate' | 'grayscale' | 'amber' | 'cream';
  dyslexiaFont: boolean;
  letterSpacing: LetterSpacingOption;
  lineHeight: LineHeightOption;
  readingWidth: ReadingWidthOption;
  reducedMotion: boolean;
  enhancedFocus: boolean;
  soundEnabled: boolean;
  timeFormat: '12h' | '24h';
  interfaceDensity: 'spacious' | 'compact';
  activeModules: string[]; // Allows user to filter which workspace modules are visible
}

export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
  fontSize: 'standard',
  displayMode: 'light',
  contrast: 'standard',
  colorPreference: 'slate',
  dyslexiaFont: false,
  letterSpacing: 'standard',
  lineHeight: 'standard',
  readingWidth: 'standard',
  reducedMotion: false,
  enhancedFocus: true,
  soundEnabled: true,
  timeFormat: '12h',
  interfaceDensity: 'spacious',
  activeModules: []
};

export interface PracticeStep {
  id: 'notice' | 'pause' | 'question' | 'listen' | 'reconsider' | 'choose';
  title: string;
  instruction: string;
  placeholder: string;
}

export interface PracticeEntry {
  id: string;
  timestamp: string;
  noticeText: string;
  pauseCompleted: boolean;
  questionText: string;
  listenText: string;
  reconsiderText: string;
  chooseText: string;
}

export interface JournalEntry {
  id: string;
  timestamp: string;
  title: string;
  content: string;
  prompt?: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
}

export interface EventItem {
  id: string;
  title: string;
  time: string;
  duration: string;
  category: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  progress: number;
  tasks: { id: string; title: string; completed: boolean }[];
}

export interface DeadlineItem {
  id: string;
  title: string;
  date: string;
  daysLeft: number;
}
