/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { STAGES_CONFIG } from '../../lib/secondThoughtPrompt';
import { SubStageId } from '../../types/practiceEngine';

interface StageProgressProps {
  currentStageId: SubStageId;
  onSelectStage?: (stageId: SubStageId) => void;
  className?: string;
}

/**
 * A minimal, single-row progress indicator for the 6-step Second Thought
 * framework (Notice → Pause → Question → Listen → Reconsider → Choose).
 * Used in "website" mode, where the full collapsible FrameworkIndicator
 * panel is intentionally not shown, so people don't lose track of where
 * they are in the framework.
 */
export const StageProgress: React.FC<StageProgressProps> = ({
  currentStageId,
  onSelectStage,
  className = ''
}) => {
  const allSubStages = STAGES_CONFIG.flatMap((group) => group.subStages);
  const currentIndex = allSubStages.findIndex((s) => s.id === currentStageId);
  const current = allSubStages[currentIndex] || allSubStages[0];

  return (
    <div
      className={`space-y-1.5 ${className}`}
      id="st-stage-progress-mini"
      aria-label="Second Thought Framework progress"
    >
      <div className="flex items-center gap-1">
        {allSubStages.map((s, idx) => {
          const isActive = s.id === currentStageId;
          const isPast = idx < currentIndex;
          return (
            <React.Fragment key={s.id}>
              <button
                type="button"
                onClick={onSelectStage ? () => onSelectStage(s.id) : undefined}
                disabled={!onSelectStage}
                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full text-[9px] sm:text-[10px] font-mono flex items-center justify-center shrink-0 transition-colors focus-visible:ring-2 focus-visible:ring-[#1B0A3B] dark:focus-visible:ring-amber-400 ${
                  isActive
                    ? 'bg-[#1B0A3B] text-white dark:bg-[#C68A2B] dark:text-slate-950 font-bold'
                    : isPast
                    ? 'bg-[#1B0A3B]/25 text-[#1B0A3B] dark:bg-slate-700 dark:text-slate-200'
                    : 'bg-[#1B0A3B]/10 text-[#1B0A3B]/60 dark:bg-slate-800 dark:text-slate-500'
                } ${onSelectStage ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                title={s.name}
                aria-current={isActive ? 'step' : undefined}
                aria-label={`Step ${s.stepNumber} of ${allSubStages.length}: ${s.name}`}
              >
                {s.stepNumber}
              </button>
              {idx < allSubStages.length - 1 && (
                <div
                  className={`flex-1 h-px ${
                    idx < currentIndex ? 'bg-[#1B0A3B]/30 dark:bg-slate-600' : 'bg-[#1B0A3B]/10 dark:bg-slate-800'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <p className="text-[11px] font-semibold text-left text-[#1B0A3B] dark:text-slate-200">
        Step {current.stepNumber} of {allSubStages.length} — {current.name}
      </p>

      <p className="text-[10px] text-left opacity-70 text-[#1B0A3B] dark:text-slate-400">
        Move between steps with the <strong>←</strong> and <strong>→</strong> arrow keys
      </p>
    </div>
  );
};
