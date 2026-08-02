/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SubStageId = 'notice' | 'pause' | 'question' | 'listen' | 'reconsider' | 'choose';
export type MainStageId = 'look' | 'ask' | 'think_again';

export interface SubStageInfo {
  id: SubStageId;
  stepNumber: number;
  name: string;
  shortDesc: string;
  guidance: string;
  promptQuestion: string;
  placeholder: string;
}

export interface MainStageGroup {
  id: MainStageId;
  title: string;
  tagline: string;
  subStages: SubStageInfo[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  stageId?: SubStageId;
  isError?: boolean;
}

export interface PracticeEngineState {
  messages: ChatMessage[];
  currentStageId: SubStageId;
  isGenerating: boolean;
  error: string | null;
  anchorValues: string[];
}

export interface PracticeEngineProps {
  version?: 'website' | 'full';
  embedded?: boolean;
  playTick?: (freq: number, dur?: number) => void;
  onLaunchFullApp?: () => void;
  onNavigateToFramework?: () => void;
  soundEnabled?: boolean;
  className?: string;
}

export interface KnowledgeItem {
  id: string;
  category: 'framework' | 'values' | 'publications' | 'journals' | 'research' | 'accessibility' | 'ethics';
  title: string;
  content: string;
  keywords: string[];
}
