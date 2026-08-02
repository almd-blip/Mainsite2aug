import React from 'react';
import { useCmsText } from '../cms/CmsContentProvider';

interface EcosystemMapProps {
  onSelectNode?: (nodeId: string) => void;
  activeNodeId?: string;
  className?: string;
}

export const EcosystemMap: React.FC<EcosystemMapProps> = ({
  onSelectNode,
  activeNodeId,
  className = '',
}) => {
  const cmsText = useCmsText();

  return (
    <div className={`w-full text-left font-['Outfit',sans-serif] ${className}`}>
      <div className="flex items-center justify-end mb-3">
        <span className="text-[11px] opacity-80 hidden sm:inline">
          {cmsText('ecosystem.map.help', 'Click any area to explore 1st layer & details')}
        </span>
      </div>

      {/* SVG Canvas and Radial Layout for Desktop / Tablet */}
      <div className="block relative w-full aspect-square max-w-[660px] mx-auto select-none my-2">
        {/* SVG background rings & spokes */}
        <svg
          viewBox="0 0 1000 1000"
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
          aria-hidden="true"
        >
          {/* Soft water rings */}
          <g fill="none" stroke="currentColor" strokeWidth="2" className="text-[#1B0A3B] dark:text-slate-300">
            <circle cx="500" cy="500" r="215" opacity="0.46" />
            <circle cx="500" cy="500" r="295" opacity="0.46" />
            <circle cx="500" cy="500" r="375" opacity="0.46" />
            <circle cx="500" cy="500" r="450" opacity="0.46" />
          </g>
          {/* Radial spokes */}
          <g fill="none" stroke="#BBA9A2" strokeWidth="3" strokeLinecap="round" opacity="0.45">
            <line x1="500" y1="500" x2="500" y2="200" />
            <line x1="500" y1="500" x2="842" y2="303" />
            <line x1="500" y1="500" x2="500" y2="800" />
            <line x1="500" y1="500" x2="158" y2="303" />
          </g>
          {/* Anchor dots */}
          <g fill="#ECE0D8" opacity="0.6">
            <circle cx="500" cy="200" r="4" />
            <circle cx="842" cy="303" r="4" />
            <circle cx="500" cy="800" r="4" />
            <circle cx="158" cy="303" r="4" />
          </g>
        </svg>

        {/* Center Hub: Second Thought */}
        <button
          type="button"
          onClick={() => onSelectNode?.('st-what-is-it')}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[42%] min-h-[21%] bg-[#FBF1EC] rounded-[2.8cqw] border-t-[1cqw] border-[#912A4A] p-[2.2cqw_2.4cqw] shadow-[0_1.4cqw_3cqw_-1.4cqw_rgba(0,0,0,0.5)] transition-all hover:scale-[1.03] active:scale-[0.98] cursor-pointer text-left z-10 group"
          style={{ containerType: 'inline-size' }}
        >
          <p className="font-bold text-[clamp(0.9rem,1.35vw,1.25rem)] leading-tight mb-[0.9cqw] text-[#1B0A3B]">
            {cmsText('ecosystem.map.center.title', 'Second thought')}
          </p>
          <p className="text-[clamp(0.68rem,0.85vw,0.82rem)] leading-normal text-[#1B0A3B]">
            {cmsText('ecosystem.map.center.description', 'A reflective practice centred on human dignity')}
          </p>
        </button>

        {/* 12 o'clock: {cmsText('ecosystem.map.framework.title', 'Framework')} (Closer) */}
        <button
          type="button"
          onClick={() => onSelectNode?.('ip-framework')}
          className={`absolute left-1/2 top-[20%] -translate-x-1/2 -translate-y-1/2 w-[28%] min-h-[19%] bg-[#FBF1EC] text-[#1B0A3B] rounded-[1.8cqw] border-t-[1cqw] border-[#1D9E75] p-[1.6cqw_1.7cqw_1.5cqw] shadow-[0_1.4cqw_3cqw_-1.4cqw_rgba(0,0,0,0.5)] transition-all hover:scale-[1.04] active:scale-[0.98] cursor-pointer text-left z-10 flex flex-col justify-start group`}
          style={{ containerType: 'inline-size' }}
        >
          <h3 className="font-bold text-[clamp(0.75rem,0.95vw,0.9rem)] leading-tight mb-[0.9cqw] text-[#1B0A3B]">
            {cmsText('ecosystem.map.framework.title', 'Framework')}
          </h3>
          <p className="text-[clamp(0.625rem,0.75vw,0.72rem)] font-semibold text-[#1B0A3B]/80 mb-[0.8cqw] leading-snug">
            {cmsText('ecosystem.map.framework.subtitle', 'Reflective practice')}
          </p>
          <p className="text-[clamp(0.68rem,0.82vw,0.78rem)] leading-snug text-[#1B0A3B]/95">
            {cmsText('ecosystem.map.framework.line1', 'Notice → Pause → Question')}
          </p>
          <p className="text-[clamp(0.68rem,0.82vw,0.78rem)] leading-snug text-[#1B0A3B]/95 mt-[0.35cqw]">
            {cmsText('ecosystem.map.framework.line2', 'Listen → Reconsider → Choose')}
          </p>
        </button>

        {/* 10 o'clock: {cmsText('ecosystem.map.publications.title', 'Publications')} (Further left) */}
        <button
          type="button"
          onClick={() => onSelectNode?.('ip-publications')}
          className="absolute left-[15.8%] top-[30.25%] -translate-x-1/2 -translate-y-1/2 w-[28%] min-h-[19%] bg-[#FBF1EC] text-[#1B0A3B] rounded-[1.8cqw] border-t-[1cqw] border-[#C68A2B] p-[1.6cqw_1.7cqw_1.5cqw] shadow-[0_1.4cqw_3cqw_-1.4cqw_rgba(0,0,0,0.5)] transition-all hover:scale-[1.04] active:scale-[0.98] cursor-pointer text-left z-10 flex flex-col justify-start group"
          style={{ containerType: 'inline-size' }}
        >
          <h3 className="font-bold text-[clamp(0.75rem,0.95vw,0.9rem)] leading-tight mb-[0.9cqw] text-[#1B0A3B]">
            {cmsText('ecosystem.map.publications.title', 'Publications')}
          </h3>
          <p className="text-[clamp(0.625rem,0.75vw,0.72rem)] font-semibold text-[#1B0A3B]/80 mb-[0.8cqw] leading-snug">
            {cmsText('ecosystem.map.publications.subtitle', 'Reflective journals')}
          </p>
          <p className="text-[clamp(0.68rem,0.82vw,0.78rem)] leading-snug text-[#1B0A3B]/95">
            {cmsText('ecosystem.map.publications.description', 'For belonging and self-trust')}
          </p>
        </button>

        {/* 2 o'clock: {cmsText('ecosystem.map.apps.title', 'Apps')} (Further right) */}
        <button
          type="button"
          onClick={() => onSelectNode?.('ip-apps')}
          className="absolute left-[84.2%] top-[30.25%] -translate-x-1/2 -translate-y-1/2 w-[28%] min-h-[19%] bg-[#FBF1EC] text-[#1B0A3B] rounded-[1.8cqw] border-t-[1cqw] border-[#C68A2B] p-[1.6cqw_1.7cqw_1.5cqw] shadow-[0_1.4cqw_3cqw_-1.4cqw_rgba(0,0,0,0.5)] transition-all hover:scale-[1.04] active:scale-[0.98] cursor-pointer text-left z-10 flex flex-col justify-start group"
          style={{ containerType: 'inline-size' }}
        >
          <h3 className="font-bold text-[clamp(0.75rem,0.95vw,0.9rem)] leading-tight mb-[0.9cqw] text-[#1B0A3B]">
            {cmsText('ecosystem.map.apps.title', 'Apps')}
          </h3>
          <p className="text-[clamp(0.625rem,0.75vw,0.72rem)] font-semibold text-[#1B0A3B]/80 mb-[0.8cqw] leading-snug">
            {cmsText('ecosystem.map.apps.subtitle', 'Digital tools')}
          </p>
          <p className="text-[clamp(0.68rem,0.82vw,0.78rem)] leading-snug text-[#1B0A3B]/95">
            {cmsText('ecosystem.map.apps.description', 'Calm, accessible and privacy-conscious')}
          </p>
        </button>

        {/* 6 o'clock: {cmsText('ecosystem.map.research.title', 'Research')} (Bottom) */}
        <button
          type="button"
          onClick={() => onSelectNode?.('ip-research')}
          className="absolute left-1/2 top-[80%] -translate-x-1/2 -translate-y-1/2 w-[28%] min-h-[19%] bg-[#FBF1EC] text-[#1B0A3B] rounded-[1.8cqw] border-t-[1cqw] border-[#1B0A3B] p-[1.6cqw_1.7cqw_1.5cqw] shadow-[0_1.4cqw_3cqw_-1.4cqw_rgba(0,0,0,0.5)] transition-all hover:scale-[1.04] active:scale-[0.98] cursor-pointer text-left z-10 flex flex-col justify-start group"
          style={{ containerType: 'inline-size' }}
        >
          <h3 className="font-bold text-[clamp(0.75rem,0.95vw,0.9rem)] leading-tight mb-[0.9cqw] text-[#1B0A3B]">
            {cmsText('ecosystem.map.research.title', 'Research')}
          </h3>
          <p className="text-[clamp(0.625rem,0.75vw,0.72rem)] font-semibold text-[#1B0A3B]/80 mb-[0.8cqw] leading-snug">
            {cmsText('ecosystem.map.research.subtitle', 'Deep in thought')}
          </p>
          <p className="text-[clamp(0.68rem,0.82vw,0.78rem)] leading-snug text-[#1B0A3B]/95">
            {cmsText('ecosystem.map.research.description', 'Understanding dignity, trust and belonging')}
          </p>
        </button>
      </div>
    </div>
  );
};
