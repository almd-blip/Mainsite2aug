/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

export const BURGUNDY = '#912A4A';

interface ResearchInsightProps {
  /** The quoted line, exactly as it should appear (including its own quotation marks). */
  quote: string;
  /** A short paragraph connecting the quote back to Second Thought's practice. */
  paragraph: string;
  /** Full Harvard-style citation. */
  source: string;
  className?: string;
}

/**
 * A collapsed-by-default "Research Insight" box: a quote, a short
 * explanatory paragraph, and a Harvard-style source citation. Uses the
 * site's existing "Find out more" / "See less" convention rather than
 * introducing a new interaction pattern.
 */
export const ResearchInsight: React.FC<ResearchInsightProps> = ({
  quote,
  paragraph,
  source,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`border border-current/15 rounded-2xl p-5 sm:p-6 bg-current/[0.02] text-left space-y-3 ${className}`}
      id="st-research-insight"
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 shrink-0" style={{ color: BURGUNDY }} />
          <h4 className="text-sm sm:text-base font-bold">Research Insight</h4>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="st-action-burgundy inline-flex items-center gap-1.5 font-bold hover:underline cursor-pointer text-xs sm:text-sm shrink-0"
          style={{ color: BURGUNDY }}
          aria-expanded={isExpanded}
        >
          <span>{isExpanded ? 'See less' : 'Find out more'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-3 pt-1">
          <blockquote
            className="border-l-2 pl-4 text-sm sm:text-base opacity-90 leading-relaxed"
            style={{ borderColor: BURGUNDY }}
          >
            {quote}
          </blockquote>

          <p className="text-sm sm:text-base opacity-90 leading-relaxed">{paragraph}</p>

          <p className="text-xs opacity-70 leading-relaxed">{source}</p>
        </div>
      )}
    </div>
  );
};

export default ResearchInsight;
