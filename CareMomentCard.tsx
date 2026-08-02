/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { X, Heart } from 'lucide-react';
import { CareTrigger, getCareMessage } from '../../lib/careMessages';

interface CareMomentCardProps {
  trigger: CareTrigger;
  onDismiss: () => void;
  autoDismissMs?: number;
  className?: string;
}

/**
 * Renders a small, quiet moment of care. This component only ever reads
 * static copy from `careMessages.ts` — it has no knowledge of, or
 * dependency on, the AI layer, so it works identically whether or not an
 * API key is configured.
 */
export const CareMomentCard: React.FC<CareMomentCardProps> = ({
  trigger,
  onDismiss,
  autoDismissMs = 9000,
  className = ''
}) => {
  const message = getCareMessage(trigger);

  useEffect(() => {
    if (!autoDismissMs) return;
    const timer = setTimeout(onDismiss, autoDismissMs);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`relative border border-[#912A4A]/20 dark:border-rose-400/20 rounded-2xl p-4 bg-[#912A4A]/[0.04] dark:bg-rose-400/[0.06] text-left text-[#1B0A3B] dark:text-slate-100 animate-in fade-in slide-in-from-bottom-1 duration-300 ${className}`}
      id={`st-care-moment-${trigger}`}
    >
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="absolute top-3 right-3 p-1 rounded-lg opacity-60 hover:opacity-100 hover:bg-[#1B0A3B]/10 dark:hover:bg-slate-800 transition-all cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <div className="flex items-start gap-2.5 pr-6">
        <Heart className="w-4 h-4 text-[#912A4A] dark:text-[#D9A0B4] shrink-0 mt-0.5" />
        <div className="space-y-1">
          {message.lines.map((line, idx) => (
            <p key={idx} className="text-xs leading-relaxed font-normal opacity-95">
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CareMomentCard;
