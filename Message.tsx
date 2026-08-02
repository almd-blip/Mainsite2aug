/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, User, Copy, Check, AlertCircle } from 'lucide-react';
import { ChatMessage } from '../../types/practiceEngine';

interface MessageProps {
  message: ChatMessage;
}

export const Message: React.FC<MessageProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const isUser = message.role === 'user';
  const isError = message.isError;

  return (
    <div
      className={`p-4 rounded-2xl text-xs space-y-2 text-left transition-all ${
        isError
          ? 'bg-rose-500/10 border border-rose-500/30 text-rose-900 dark:text-rose-200'
          : isUser
          ? 'bg-[#1B0A3B]/10 dark:bg-[#C68A2B]/15 text-[#1B0A3B] dark:text-slate-100 ml-6 md:ml-12 border border-[#1B0A3B]/20 dark:border-[#C68A2B]/30'
          : 'bg-white dark:bg-slate-800 text-[#1B0A3B] dark:text-slate-100 mr-6 md:mr-12 border border-[#1B0A3B]/20 dark:border-slate-700 shadow-xs'
      }`}
      role="article"
      aria-label={`${isUser ? 'User reflection' : 'Practice Engine response'}`}
    >
      <div className="flex items-center justify-between border-b border-current/15 pb-1.5 text-[10px] font-semibold opacity-90">
        <div className="flex items-center gap-1.5">
          {isUser ? (
            <User className="w-3.5 h-3.5 shrink-0" />
          ) : isError ? (
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-[#C68A2B] shrink-0" />
          )}
          <span>{isUser ? 'Your Reflection' : 'Practice Engine'}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="opacity-60">{message.timestamp}</span>

          {!isUser && !isError && (
            <button
              type="button"
              onClick={handleCopy}
              className="p-1 rounded hover:bg-current/10 transition-colors cursor-pointer focus-visible:ring-1 focus-visible:ring-current"
              title="Copy response"
              aria-label="Copy message text"
            >
              {copied ? <Check className="w-3 h-3 text-[#1D9E75]" /> : <Copy className="w-3 h-3 opacity-60" />}
            </button>
          )}
        </div>
      </div>

      <div className="whitespace-pre-line leading-relaxed opacity-95 text-xs font-normal">
        {message.content}
      </div>
    </div>
  );
};
