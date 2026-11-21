import React from 'react';
import { AlignLeft, LineChart } from 'lucide-react';

export type ResultViewMode = 'text' | 'chart';

interface Props {
  mode: ResultViewMode;
  onChange: (mode: ResultViewMode) => void;
  chartLabel?: string;
  tone?: 'light' | 'dark';
}

export const ResultViewToggle: React.FC<Props> = ({
  mode,
  onChange,
  chartLabel = 'Chart View',
  tone = 'light',
}) => {
  const isDarkSurface = tone === 'dark';

  return (
    <div
      role="group"
      aria-label="Result view mode"
      data-result-view-toggle
      className={`inline-flex items-center gap-0.5 p-1 rounded-lg border ${
        isDarkSurface
          ? 'bg-slate-800/90 border-slate-700'
          : 'bg-slate-100 dark:bg-slate-800 border-slate-200/80 dark:border-slate-700/80'
      }`}
    >
      <button
        type="button"
        data-view-mode="text"
        aria-pressed={mode === 'text'}
        onClick={() => onChange('text')}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
          mode === 'text'
            ? isDarkSurface
              ? 'bg-slate-950 text-white shadow-2xs'
              : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs'
            : isDarkSurface
              ? 'text-slate-300 hover:text-white'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
        }`}
      >
        <AlignLeft className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>Text View</span>
      </button>

      <button
        type="button"
        data-view-mode="chart"
        aria-pressed={mode === 'chart'}
        onClick={() => onChange('chart')}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
          mode === 'chart'
            ? isDarkSurface
              ? 'bg-teal-600 text-white shadow-2xs'
              : 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-2xs'
            : isDarkSurface
              ? 'text-slate-300 hover:text-white'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
        }`}
      >
        <LineChart className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>{chartLabel}</span>
      </button>
    </div>
  );
};
