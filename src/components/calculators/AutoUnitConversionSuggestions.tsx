import React, { useMemo, useState } from 'react';
import { ArrowRightLeft, Check, Copy } from 'lucide-react';
import {
  AutoDetectCandidate,
  DetectedUnitSuggestion,
  detectUnitConversions,
} from '../../utils/unitAutoDetector';
import { useRoundingPrecision } from '../../context/RoundingPrecisionContext';
import { formatNumberWithPrecision } from '../../utils/roundingPrecision';

interface Props {
  candidates: AutoDetectCandidate[];
  title?: string;
}

export const AutoUnitConversionSuggestions: React.FC<Props> = ({
  candidates,
  title = 'Auto-Detected Unit Conversions',
}) => {
  const { precision } = useRoundingPrecision();
  const suggestions: DetectedUnitSuggestion[] = useMemo(
    () => detectUnitConversions(candidates, 5),
    [candidates]
  );

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [copiedTargetKey, setCopiedTargetKey] = useState<string | null>(null);

  if (suggestions.length === 0) {
    return null;
  }

  const safeIdx = selectedIdx < suggestions.length ? selectedIdx : 0;
  const active = suggestions[safeIdx];

  const handleCopy = (targetKey: string, text: string) => {
    if (!navigator?.clipboard?.writeText) return;
    navigator.clipboard.writeText(text);
    setCopiedTargetKey(targetKey);
    setTimeout(() => setCopiedTargetKey(null), 1800);
  };

  return (
    <section
      aria-label="Suggested unit conversions"
      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-4 space-y-3"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2 text-xs">
          <ArrowRightLeft className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
          <span className="font-semibold text-slate-800 dark:text-slate-200">{title}</span>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {active.dimensionLabel}
          </span>
        </div>

        <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
          Based on {active.source}: {active.originalValueFormatted} {active.originalUnitShort}
          {active.periodSuffix}
        </span>
      </div>

      {/* Selector bar when multiple convertible quantities exist */}
      {suggestions.length > 1 && (
        <div
          className="flex flex-wrap items-center gap-1.5"
          role="group"
          aria-label="Detected convertible quantities"
        >
          {suggestions.map((sug, idx) => {
            const isSelected = idx === safeIdx;
            return (
              <button
                key={sug.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedIdx(idx)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-teal-600 border-teal-600 text-white'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-teal-400 dark:hover:border-teal-600'
                }`}
              >
                <span className="truncate max-w-[150px]">{sug.sourceLabel}</span>
                <span className={`font-mono tabular-nums ${isSelected ? 'text-teal-100' : 'text-slate-400 dark:text-slate-500'}`}>
                  {sug.originalValueFormatted} {sug.originalUnitShort}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Converted Target Unit Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {active.targets.map((target) => {
          const targetKey = `${active.id}:${target.unitId}`;
          const isCopied = copiedTargetKey === targetKey;
          const formattedVal =
            precision === 'auto'
              ? target.formattedValue
              : formatNumberWithPrecision(target.numericValue, precision);
          const displayString = `${formattedVal} ${target.shortLabel}${active.periodSuffix}`;

          return (
            <button
              key={target.unitId}
              type="button"
              onClick={() => handleCopy(targetKey, displayString)}
              title={`Copy ${displayString} (${target.fullLabel})`}
              className="group p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-400 dark:hover:border-teal-600 text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="truncate">{target.fullLabel}</span>
                {isCopied ? (
                  <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-300 dark:text-slate-600 group-hover:text-teal-500 shrink-0 transition-colors" />
                )}
              </div>
              <div className="mt-1 text-xs sm:text-sm font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 truncate">
                {displayString}
              </div>
            </button>
          );
        })}
      </div>

      {active.isApproximateFx && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Indicative static reference FX rates shown for quick cross-currency orientation (not live interbank spot quotes).
        </p>
      )}
    </section>
  );
};
