/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { RefreshCw, RotateCcw, Sparkles, Download } from 'lucide-react';
import { ChatMessage } from '../../types/practiceEngine';
import { Message } from './Message';

interface ChatWindowProps {
  messages: ChatMessage[];
  isGenerating: boolean;
  onReset: () => void;
  onExport?: () => void;
  className?: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  isGenerating,
  onReset,
  onExport,
  className = ''
}) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  return (
    <div
      className={`border border-[#1B0A3B]/15 dark:border-slate-700 rounded-2xl p-4 bg-white/60 dark:bg-slate-900/90 backdrop-blur-xs space-y-4 flex flex-col justify-between text-left text-[#1B0A3B] dark:text-slate-100 ${className}`}
      id="st-chat-window-container"
    >
      {/* Header Bar */}
      <div className="flex justify-between items-center border-b border-[#1B0A3B]/10 dark:border-slate-700 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#C68A2B] shrink-0" />
          <h4 className="text-xs font-bold text-[#1B0A3B] dark:text-slate-100">
            Reflective Dialogue
          </h4>
        </div>

        {messages.length > 0 && (
          <div className="flex items-center gap-2">
            {onExport && (
              <button
                type="button"
                onClick={onExport}
                className="px-2.5 py-1 text-[11px] font-semibold border border-[#1B0A3B]/20 dark:border-slate-700 rounded-lg hover:bg-[#1B0A3B]/10 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1 text-[#1B0A3B] dark:text-slate-200"
                title="Export this conversation as a text file"
              >
                <Download className="w-3 h-3 opacity-80" />
                <span>Export conversation</span>
              </button>
            )}
            <button
              type="button"
              onClick={onReset}
              className="px-2.5 py-1 text-[11px] font-semibold border border-[#1B0A3B]/20 dark:border-slate-700 rounded-lg hover:bg-[#1B0A3B]/10 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1 text-[#1B0A3B] dark:text-slate-200"
              title="Reset conversation"
            >
              <RotateCcw className="w-3 h-3 opacity-80" />
              <span>Clear space</span>
            </button>
          </div>
        )}
      </div>

      {/* Message List */}
      <div
        className="space-y-3 min-h-[220px] max-h-[420px] overflow-y-auto p-1 pr-2"
        role="log"
        aria-live="polite"
        aria-label="Conversation thread"
      >
        {messages.length === 0 ? (
          <div className="p-6 border border-dashed border-[#1B0A3B]/20 dark:border-slate-700 rounded-xl text-left space-y-2 bg-[#1B0A3B]/[0.01] dark:bg-slate-800/40">
            <p className="text-xs font-semibold text-[#1B0A3B] dark:text-slate-100">
              Welcome to the Second Thought Practice Engine
            </p>
            <p className="text-[11px] font-normal opacity-90 text-[#1B0A3B] dark:text-slate-200 max-w-sm mx-auto leading-relaxed">
              Select a starter prompt below or type what you would like to reflect on. The Practice Engine will provide compassionate, unhurried feedback grounded in the Second Thought framework.
            </p>
          </div>
        ) : (
          messages.map((msg) => <Message key={msg.id} message={msg} />)
        )}

        {isGenerating && (
          <div className="p-4 border border-[#1B0A3B]/15 dark:border-slate-700 rounded-2xl bg-[#1B0A3B]/[0.02] dark:bg-slate-800/60 text-xs flex items-center gap-3 opacity-90 animate-pulse text-[#1B0A3B] dark:text-slate-200">
            <RefreshCw className="w-4 h-4 animate-spin text-[#C68A2B] shrink-0" />
            <span>The Practice Engine is reflecting on your input...</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
};
