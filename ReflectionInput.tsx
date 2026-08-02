/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Send, ArrowRight } from 'lucide-react';
import { SubStageInfo } from '../../types/practiceEngine';

interface ReflectionInputProps {
  currentSubStage?: SubStageInfo;
  onSubmit: (text: string) => void;
  isGenerating: boolean;
  onSelectStarterPrompt?: (promptText: string) => void;
  onNavigateToFramework?: () => void;
  /** Care Moments Layer hook: called when the user opens this reflection (focuses the
   * textarea) and then leaves without writing anything. Non-AI, purely behavioral. */
  onEmptyReflectionExit?: () => void;
  /** Care Moments Layer hook: called alongside onSubmit when the entry is only a few
   * words long, so the caller can surface a small, encouraging acknowledgement. */
  onMinimalResponse?: (text: string) => void;
  version?: 'website' | 'full';
  className?: string;
}

export const STARTER_PROMPTS = [
  { label: 'Reflect on something that happened', text: 'I would like to reflect on a recent situation that triggered me at work or home...' },
  { label: 'Explore a difficult feeling', text: 'I am experiencing a persistent wave of tension or overwhelm, and I want to examine it...' },
  { label: 'Consider another perspective', text: 'I am caught in a disagreement and want to explore angles I might be missing...' },
  { label: 'Think through a decision', text: 'I have an important choice to make and want to align it with truth and humanity...' }
];

export const ReflectionInput: React.FC<ReflectionInputProps> = ({
  currentSubStage,
  onSubmit,
  isGenerating,
  onSelectStarterPrompt,
  onNavigateToFramework,
  onEmptyReflectionExit,
  onMinimalResponse,
  version = 'website',
  className = ''
}) => {
  const [inputValue, setInputValue] = useState('');
  // Tracks whether the user has opened (focused) this reflection during the
  // current stage, so we only report an "empty exit" if they actually
  // engaged with the field before leaving it blank. Care Moments Layer only —
  // does not affect submission logic.
  const [hasOpened, setHasOpened] = useState(false);

  const handleFocus = () => {
    setHasOpened(true);
  };

  const handleBlur = () => {
    if (hasOpened && !inputValue.trim()) {
      onEmptyReflectionExit?.();
      setHasOpened(false);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isGenerating) return;
    const text = inputValue.trim();
    setHasOpened(false);
    onSubmit(text);

    const wordCount = text.split(/\s+/).filter(Boolean).length;
    if (wordCount > 0 && wordCount <= 3) {
      onMinimalResponse?.(text);
    }

    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const promptText = version === 'website'
    ? 'What is the situation or event you noticed?'
    : (currentSubStage?.promptQuestion || 'What is the situation or event you noticed?');

  return (
    <div
      className={`border border-[#1B0A3B]/15 dark:border-slate-700 rounded-2xl p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs space-y-4 text-left text-[#1B0A3B] dark:text-slate-100 ${className}`}
      id="st-reflection-input-container"
    >
      {/* Starter Prompts (Show only in full app mode if handler passed) */}
      {version !== 'website' && onSelectStarterPrompt && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2" id="st-starter-prompts-list">
            {STARTER_PROMPTS.map((starter, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputValue(starter.text);
                  onSelectStarterPrompt(starter.text);
                }}
                className="px-3 py-1.5 rounded-xl text-xs border border-[#1B0A3B]/20 dark:border-slate-700 bg-[#1B0A3B]/[0.02] dark:bg-slate-800/80 hover:bg-[#1B0A3B]/10 dark:hover:bg-slate-700 hover:border-[#1B0A3B]/40 transition-all cursor-pointer font-medium text-[#1B0A3B] dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-[#1B0A3B] dark:focus-visible:ring-amber-400"
              >
                {starter.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <label
          htmlFor="st-practice-engine-textarea"
          className="text-sm font-bold block text-[#1B0A3B] dark:text-slate-100"
        >
          {promptText}
        </label>

        <p className="text-xs text-[#1B0A3B]/80 dark:text-slate-300 leading-relaxed font-normal">
          Type what event or situation you would like to reflect on. The Practice Engine will provide feedback grounded in the Second Thought framework.
        </p>

        <div className="relative">
          <textarea
            id="st-practice-engine-textarea"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Type here..."
            disabled={isGenerating}
            rows={3}
            className="w-full p-3.5 pr-12 text-xs bg-[#1B0A3B]/[0.02] dark:bg-slate-800 border border-[#1B0A3B]/25 dark:border-slate-600 rounded-xl focus:outline-none focus:border-[#1B0A3B] dark:focus:border-amber-400 focus:ring-1 focus:ring-[#1B0A3B] dark:focus:ring-amber-400 resize-none text-[#1B0A3B] dark:text-slate-100 placeholder:text-[#1B0A3B]/60 dark:placeholder:text-slate-400 transition-all"
            aria-label="Reflection input text area"
          />

          <button
            type="submit"
            disabled={isGenerating || !inputValue.trim()}
            className="absolute right-3 bottom-3 p-2 bg-[#1B0A3B] dark:bg-[#C68A2B] text-white dark:text-slate-950 rounded-lg hover:opacity-90 disabled:opacity-30 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1B0A3B] dark:focus-visible:ring-amber-400 flex items-center justify-center font-bold"
            title="Send reflection"
            aria-label="Send reflection message"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex justify-between items-center text-[10px] opacity-80 text-[#1B0A3B] dark:text-slate-300">
          <span>Press <strong>Enter</strong> to send, <strong>Shift+Enter</strong> for line break</span>
        </div>

        {/* Link to Framework Page under the text entry box */}
        {onNavigateToFramework && (
          <div className="pt-2 border-t border-[#1B0A3B]/10 dark:border-slate-800 flex items-center">
            <button
              type="button"
              onClick={onNavigateToFramework}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#912A4A] dark:text-[#D9A0B4] hover:underline cursor-pointer"
            >
              <span>The Second Thought Framework</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
