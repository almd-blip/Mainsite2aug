/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Eye, HelpCircle, Compass, Sparkles } from 'lucide-react';
import { STAGES_CONFIG } from '../../lib/secondThoughtPrompt';
import { MainStageId, SubStageId } from '../../types/practiceEngine';

interface FrameworkIndicatorProps {
  currentStageId: SubStageId;
  onSelectStage: (stageId: SubStageId) => void;
  playTick?: (freq: number, dur?: number) => void;
  className?: string;
}

export const FrameworkIndicator: React.FC<FrameworkIndicatorProps> = ({
  currentStageId,
  onSelectStage,
  playTick,
  className = ''
}) => {
  // State for collapsible main stages
  const [expandedMainStages, setExpandedMainStages] = useState<Record<MainStageId, boolean>>({
    look: true,
    ask: true,
    think_again: true
  });

  const toggleMainStage = (mainId: MainStageId) => {
    setExpandedMainStages((prev) => ({
      ...prev,
      [mainId]: !prev[mainId]
    }));
    if (playTick) playTick(380, 0.04);
  };

  const getMainIcon = (mainId: MainStageId) => {
    switch (mainId) {
      case 'look':
        return <Eye className="w-4 h-4 text-[#1D9E75] shrink-0" />;
      case 'ask':
        return <HelpCircle className="w-4 h-4 text-[#C68A2B] shrink-0" />;
      case 'think_again':
        return <Compass className="w-4 h-4 text-[#1D9E75] shrink-0" />;
    }
  };

  return (
    <div
      className={`border border-[#1B0A3B]/15 dark:border-slate-700 rounded-2xl p-4 bg-white/80 dark:bg-slate-900/90 backdrop-blur-xs space-y-3 text-left text-[#1B0A3B] dark:text-slate-100 ${className}`}
      id="st-framework-indicator-container"
      aria-label="Second Thought Framework Indicator"
    >
      <div className="flex items-center justify-between border-b border-[#1B0A3B]/10 dark:border-slate-700 pb-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#C68A2B] shrink-0" />
          <h4 className="text-xs font-bold text-[#1B0A3B] dark:text-slate-100">
            Second Thought Framework
          </h4>
        </div>
      </div>

      <p className="text-[10px] opacity-70 text-[#1B0A3B] dark:text-slate-400">
        Use <strong>←</strong> and <strong>→</strong> arrow keys to move between stages
      </p>

      <div className="space-y-2.5" id="st-framework-accordion-groups">
        {STAGES_CONFIG.map((group) => {
          const isExpanded = expandedMainStages[group.id];
          const containsCurrentStage = group.subStages.some((s) => s.id === currentStageId);

          return (
            <div
              key={group.id}
              className={`border rounded-xl transition-all ${
                containsCurrentStage
                  ? 'border-[#1B0A3B]/30 dark:border-amber-400/50 bg-[#1B0A3B]/[0.02] dark:bg-slate-800/60'
                  : 'border-[#1B0A3B]/15 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50'
              }`}
              id={`st-fw-group-${group.id}`}
            >
              {/* Collapsible Main Stage Header */}
              <button
                type="button"
                onClick={() => toggleMainStage(group.id)}
                className="w-full p-3 flex items-center justify-between text-left cursor-pointer hover:bg-[#1B0A3B]/5 dark:hover:bg-slate-800 rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-[#1B0A3B] dark:focus-visible:ring-amber-400"
                aria-expanded={isExpanded}
                aria-controls={`st-fw-subpanel-${group.id}`}
              >
                <div className="flex items-center gap-2.5">
                  {getMainIcon(group.id)}
                  <div>
                    <span className="text-xs font-bold text-[#1B0A3B] dark:text-slate-100 block">
                      {group.title}
                    </span>
                    <span className="text-[10px] opacity-85 text-[#1B0A3B] dark:text-slate-300 block">
                      {group.tagline}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 opacity-80 text-[#1B0A3B] dark:text-slate-200" />
                  ) : (
                    <ChevronRight className="w-4 h-4 opacity-80 text-[#1B0A3B] dark:text-slate-200" />
                  )}
                </div>
              </button>

              {/* Sub-stages list */}
              {isExpanded && (
                <div
                  id={`st-fw-subpanel-${group.id}`}
                  className="px-3 pb-3 pt-1 space-y-1.5 border-t border-[#1B0A3B]/10 dark:border-slate-700 ml-2"
                >
                  {group.subStages.map((sub, idx) => {
                    const isSelected = sub.id === currentStageId;
                    return (
                      <React.Fragment key={sub.id}>
                        <button
                          type="button"
                          onClick={() => {
                            onSelectStage(sub.id);
                            if (playTick) playTick(420, 0.04);
                          }}
                          className={`w-full p-2.5 rounded-lg text-left text-xs transition-all flex items-center justify-between cursor-pointer focus-visible:ring-2 focus-visible:ring-[#1B0A3B] dark:focus-visible:ring-amber-400 ${
                            isSelected
                              ? 'bg-[#1B0A3B] dark:bg-[#C68A2B] text-white dark:text-slate-950 font-bold shadow-xs'
                              : 'hover:bg-[#1B0A3B]/5 dark:hover:bg-slate-800 text-[#1B0A3B] dark:text-slate-200'
                          }`}
                          aria-current={isSelected ? 'step' : undefined}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-4 h-4 rounded-full text-[9px] font-mono flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? 'bg-white text-[#1B0A3B] dark:bg-slate-950 dark:text-[#C68A2B] font-bold'
                                  : 'bg-[#1B0A3B]/10 dark:bg-slate-800 text-[#1B0A3B] dark:text-slate-200'
                              }`}
                            >
                              {sub.stepNumber}
                            </span>
                            <div>
                              <span className="font-semibold block">{sub.name}</span>
                              <span
                                className={`text-[10px] block ${
                                  isSelected ? 'text-white/90 dark:text-slate-900' : 'opacity-80'
                                }`}
                              >
                                {sub.shortDesc}
                              </span>
                            </div>
                          </div>

                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-[#C68A2B] dark:bg-slate-950 shrink-0" />
                          )}
                        </button>

                        {/* Arrow indicator between sub-stages */}
                        {idx < group.subStages.length - 1 && (
                          <div className="flex justify-center my-0.5 opacity-40 text-xs">
                            ↓
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
