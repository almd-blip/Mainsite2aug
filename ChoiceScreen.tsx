/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Wind, Compass, Sparkles, EyeOff, Sliders, RotateCcw } from 'lucide-react';
import { ActiveTab, AccessibilitySettings } from '../types';
import { useCmsText } from '../cms/CmsContentProvider';
import BrandLogo from './BrandLogo';

interface ChoiceScreenProps {
  onSelect: (tab: ActiveTab) => void;
  appName: string;
  reducedMotion: boolean;
  onResetToArrival?: () => void;
  settings?: AccessibilitySettings;
}

export default function ChoiceScreen({ onSelect, appName, reducedMotion, onResetToArrival, settings }: ChoiceScreenProps) {
  const cmsText = useCmsText();

  // Slower, elegant transition matching Page 1 settings
  const transitionHeader = { duration: reducedMotion ? 0 : 3.5, ease: 'easeInOut', delay: 0.5 };
  const transitionCards = (index: number) => ({
    duration: reducedMotion ? 0 : 2.5,
    ease: 'easeInOut',
    delay: reducedMotion ? 0 : 2.0 + index * 0.2
  });

  const choices = [
    {
      id: 'wellbeing' as ActiveTab,
      title: cmsText('choice.wellbeing.title', 'Pause & Breathe'),
      description: cmsText('choice.wellbeing.description', 'Breathing exercises and presence exercises to help you pause and ground before action.'),
      icon: Wind
    },
    {
      id: 'about' as ActiveTab,
      title: cmsText('choice.about.title', 'Explore'),
      description: cmsText('choice.about.description', 'Discover what Second Thought is, why it matters, and who it is for.'),
      icon: Compass
    },
    {
      id: 'workspace' as ActiveTab,
      title: cmsText('choice.workspace.title', 'I’m ready'),
      description: cmsText('choice.workspace.description', 'How to begin and put Second Thought into practice with guided reflective tools.'),
      icon: Sparkles
    }
  ];

  return (
    <div
      className="min-h-screen flex flex-col bg-transparent text-current select-none"
      id="choice-screen"
    >
      <div className="max-w-6xl w-full mx-auto px-6 sm:px-8 py-10 md:py-16 flex-1 flex flex-col" id="choice-outer-container">
        {/* Brand wordmark — small, calm, top-left, aligned with content below */}
        <div className="text-left shrink-0" id="choice-logo">
          <BrandLogo settings={settings} className="w-28 md:w-32" />
        </div>

        <div className="flex-1 flex items-center justify-center py-14 md:py-20">
        <div className="w-full space-y-16 text-left" id="choice-container">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={transitionHeader}
          className="space-y-3"
          id="choice-header"
        >
          {reducedMotion && (
            <div className="pb-1" id="choice-subtitle-row">
              <span
                id="choice-reduced-motion-indicator"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide border border-current/20 bg-current/[0.06] text-current select-none shrink-0"
                title="Reduced motion is active. Screen transitions are disabled for your accessibility preference."
              >
                <EyeOff className="w-3 h-3 text-[#1D9E75] shrink-0" />
                <span>Reduced Motion</span>
              </span>
            </div>
          )}
          <h1 className="text-4xl md:text-5xl font-light tracking-tight" id="choice-title">
            {cmsText('choice.title', 'Where would you like to begin?')}
          </h1>
        </motion.div>

        <div className="flex flex-col md:flex-row md:items-stretch" id="choice-cards-grid">
          {choices.map((choice, index) => {
            const Icon = choice.icon;
            return (
              <React.Fragment key={choice.id}>
                {index > 0 && (
                  <>
                    <div aria-hidden="true" className="hidden md:block w-[2px] bg-[#912A4A] self-stretch my-12" />
                    <div aria-hidden="true" className="md:hidden h-[2px] bg-[#912A4A] w-full my-10" />
                  </>
                )}
                <motion.button
                  id={`choice-card-${choice.id}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={transitionCards(index)}
                  onClick={() => onSelect(choice.id)}
                  className="group flex-1 px-5 md:px-10 py-4 text-left transition-all flex flex-col justify-between min-h-[12rem] md:min-h-[15rem] h-auto cursor-pointer focus:outline-none focus:ring-2 focus:ring-current/40 hover:opacity-80"
                >
                  <div className="flex-1 flex flex-col justify-start" id={`choice-card-top-${choice.id}`}>
                    <h2 className="text-sm sm:text-base md:text-lg font-medium tracking-tight group-hover:underline min-h-[1.75rem] flex items-center" id={`choice-card-title-${choice.id}`}>
                      {choice.title}
                    </h2>
                    <p className="text-[10px] sm:text-xs leading-relaxed opacity-70 mt-3 min-h-[3.25rem] flex items-start" id={`choice-card-desc-${choice.id}`}>
                      {choice.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-current/5 w-full shrink-0" id={`choice-card-bot-${choice.id}`}>
                    <Icon className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-all" id={`choice-card-icon-${choice.id}`} />
                    <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0" id={`choice-card-go-${choice.id}`}>
                      {cmsText('choice.enter', 'Enter')}
                    </span>
                  </div>
                </motion.button>
              </React.Fragment>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reducedMotion ? 0 : 2.0, ease: 'easeInOut', delay: 2.5 }}
          className="flex flex-wrap items-center justify-start gap-4 pt-2"
          id="choice-accessibility-container"
        >
          {onResetToArrival && (
            <button
              id="choice-back-arrival-btn"
              onClick={onResetToArrival}
              className="px-6 py-3 text-xs font-medium border border-current/15 hover:border-current/50 hover:bg-current/[0.03] rounded-full transition-all cursor-pointer flex items-center gap-2 opacity-80 hover:opacity-100"
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0 opacity-80" />
              <span>{cmsText('choice.backToArrival', 'Back to Arrival')}</span>
            </button>
          )}

          <div className="flex justify-start" id="choice-accessibility-col">
            <button
              id="choice-accessibility-btn"
              onClick={() => onSelect('accessibility')}
              className="px-6 py-3 text-xs font-medium border border-current/25 hover:border-current/60 hover:bg-current/[0.04] rounded-full transition-all cursor-pointer flex items-center gap-2"
            >
              <Sliders className="w-3.5 h-3.5 shrink-0 opacity-80" />
              <span>{cmsText('choice.accessibility', 'Accessibility Settings')}</span>
            </button>
          </div>
        </motion.div>
        </div>
        </div>
      </div>
    </div>
  );
}
