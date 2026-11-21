import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { ROUNDING_PRECISION_OPTIONS, RoundingPrecision } from '../../utils/roundingPrecision';
import { useRoundingPrecision } from '../../context/RoundingPrecisionContext';

export const RoundingPrecisionBar: React.FC = () => {
  const { precision, setPrecision } = useRoundingPrecision();

  const optionLabel = (opt: RoundingPrecision) => (opt === 'auto' ? 'Auto' : String(opt));

  return (
    <div
      data-rounding-precision-bar
      className="mb-4 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-wrap items-center justify-between gap-3"
    >
      <div className="flex items-center gap-2 min-w-0">
        <SlidersHorizontal className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
          Rounding Precision
        </span>
        <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:inline" aria-hidden="true">
          ·
        </span>
        <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400 hidden sm:inline whitespace-nowrap">
          {precision === 'auto'
            ? 'Domain default'
            : `${precision} ${precision === 1 ? 'decimal place' : 'decimal places'}`}
        </span>
      </div>

      <div
        role="group"
        aria-label="Global output rounding precision in decimal places"
        className="inline-flex items-center gap-0.5 p-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70"
      >
        {ROUNDING_PRECISION_OPTIONS.map((opt) => {
          const isActive = precision === opt;
          return (
            <button
              key={String(opt)}
              type="button"
              aria-pressed={isActive}
              aria-label={
                opt === 'auto'
                  ? 'Automatic domain rounding precision'
                  : `Round outputs to ${opt} ${opt === 1 ? 'decimal place' : 'decimal places'}`
              }
              onClick={() => setPrecision(opt)}
              className={`px-2.5 py-1 text-xs font-mono tabular-nums rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 font-bold shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {optionLabel(opt)}
            </button>
          );
        })}
      </div>
    </div>
  );
};
