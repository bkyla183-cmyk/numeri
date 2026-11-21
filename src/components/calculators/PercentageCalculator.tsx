import React, { useState } from 'react';
import { Copy, Check, RotateCcw } from 'lucide-react';
import { FormulaHoverHighlight } from './FormulaHoverHighlight';
import { useRoundingPrecision } from '../../context/RoundingPrecisionContext';
import { formatNumberWithPrecision } from '../../utils/roundingPrecision';

export const PercentageCalculator: React.FC = () => {
  const { precision } = useRoundingPrecision();
  const [m1Percent, setM1Percent] = useState<string>('15');
  const [m1Number, setM1Number] = useState<string>('240');

  const [m2Part, setM2Part] = useState<string>('45');
  const [m2Whole, setM2Whole] = useState<string>('180');

  const [m3Initial, setM3Initial] = useState<string>('50');
  const [m3Final, setM3Final] = useState<string>('65');

  const [activeTab, setActiveTab] = useState<'percentOf' | 'isWhatPercent' | 'change'>('percentOf');
  const [copied, setCopied] = useState<string | null>(null);

  const m1Result = (() => {
    const p = parseFloat(m1Percent);
    const n = parseFloat(m1Number);
    if (!Number.isFinite(p) || !Number.isFinite(n)) return null;
    const val = (p / 100) * n;
    return Number.isFinite(val) ? val : null;
  })();

  const m2Result = (() => {
    const part = parseFloat(m2Part);
    const whole = parseFloat(m2Whole);
    if (!Number.isFinite(part) || !Number.isFinite(whole)) return null;
    if (whole === 0) return { ok: false as const, error: 'Whole value (Y) cannot be zero.' };
    const val = (part / whole) * 100;
    return Number.isFinite(val) ? { ok: true as const, value: val } : { ok: false as const, error: 'Result exceeds numeric limits.' };
  })();

  const m3Result = (() => {
    const init = parseFloat(m3Initial);
    const fin = parseFloat(m3Final);
    if (!Number.isFinite(init) || !Number.isFinite(fin)) return null;
    if (init === 0) return { ok: false as const, error: 'Initial value cannot be zero for percentage change.' };
    const diff = fin - init;
    const pct = (diff / Math.abs(init)) * 100;
    if (!Number.isFinite(diff) || !Number.isFinite(pct)) {
      return { ok: false as const, error: 'Result exceeds numeric limits.' };
    }
    return {
      ok: true as const,
      difference: diff,
      percentage: pct,
      isIncrease: diff >= 0,
    };
  })();

  const copyValue = (val: string, key: string) => {
    navigator.clipboard?.writeText(val);
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  };

  const formatM1 = (val: number) =>
    precision === 'auto'
      ? Number.isInteger(val)
        ? String(val)
        : val.toFixed(4).replace(/\.?0+$/, '')
      : formatNumberWithPrecision(val, precision);

  const formatFixed = (val: number, autoDecimals = 2) =>
    formatNumberWithPrecision(val, precision, {
      autoDecimals,
      minAutoDecimals: autoDecimals,
      useGrouping: false,
    });

  const handleReset = () => {
    setM1Percent('15');
    setM1Number('240');
    setM2Part('45');
    setM2Whole('180');
    setM3Initial('50');
    setM3Final('65');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex p-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl max-w-full overflow-x-auto" role="tablist" aria-label="Percentage calculation mode">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'percentOf'}
            onClick={() => setActiveTab('percentOf')}
            className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'percentOf'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            What is X% of Y?
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'isWhatPercent'}
            onClick={() => setActiveTab('isWhatPercent')}
            className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'isWhatPercent'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            X is what % of Y?
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'change'}
            onClick={() => setActiveTab('change')}
            className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'change'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Percentage Change (% Increase/Decrease)
          </button>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {activeTab === 'percentOf' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pct-m1-percent" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Percentage (%)
              </label>
              <div className="relative">
                <input
                  id="pct-m1-percent"
                  type="number"
                  step="any"
                  value={m1Percent}
                  onChange={(e) => setM1Percent(e.target.value)}
                  className="w-full px-4 py-3 pr-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="e.g. 15"
                />
                <span className="absolute right-4 top-3.5 text-slate-400 font-mono text-sm">%</span>
              </div>
            </div>

            <div>
              <label htmlFor="pct-m1-number" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Total Value (Y)
              </label>
              <input
                id="pct-m1-number"
                type="number"
                step="any"
                value={m1Number}
                onChange={(e) => setM1Number(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="e.g. 240"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-500">Quick Rates:</span>
            {[5, 10, 15, 20, 25, 50, 75].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => setM1Percent(String(pct))}
                className="px-2.5 py-1 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                {pct}%
              </button>
            ))}
          </div>

          {m1Result !== null && (
            <>
              <FormulaHoverHighlight
                formula="Result = (P / 100) × Y"
                formulaLabel="Percentage of a Value Formula"
                variables={[
                  { symbol: 'P', name: 'Percentage Rate', value: m1Percent, unit: '%' },
                  { symbol: 'Y', name: 'Total Value', value: m1Number },
                ]}
                activeStep={`(${m1Percent} ÷ 100) × ${m1Number} = ${formatM1(m1Result)}`}
                accent="indigo"
              >
                <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                      Result: {m1Percent}% of {m1Number} is
                    </span>
                    <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono tabular-nums">
                      {formatM1(m1Result)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyValue(formatM1(m1Result), 'm1')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 cursor-pointer self-start sm:self-center"
                  >
                    {copied === 'm1' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied === 'm1' ? 'Copied' : 'Copy Result'}</span>
                  </button>
                </div>
              </FormulaHoverHighlight>

              <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 bg-slate-100/50 dark:bg-slate-800/30 p-3 rounded-lg font-mono">
                <div>Step 1: Convert percentage to decimal → {m1Percent} ÷ 100 = {(parseFloat(m1Percent) || 0) / 100}</div>
                <div>Step 2: Multiply by total value → {(parseFloat(m1Percent) || 0) / 100} × {m1Number} = {formatM1(m1Result)}</div>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'isWhatPercent' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pct-m2-part" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Part (X)
              </label>
              <input
                id="pct-m2-part"
                type="number"
                step="any"
                value={m2Part}
                onChange={(e) => setM2Part(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="e.g. 45"
              />
            </div>

            <div>
              <label htmlFor="pct-m2-whole" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Whole (Y)
              </label>
              <input
                id="pct-m2-whole"
                type="number"
                step="any"
                value={m2Whole}
                onChange={(e) => setM2Whole(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="e.g. 180"
              />
            </div>
          </div>

          {m2Result && !m2Result.ok && (
            <div role="alert" className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-sm font-medium text-rose-700 dark:text-rose-300">
              {m2Result.error}
            </div>
          )}

          {m2Result && m2Result.ok && (
            <>
              <FormulaHoverHighlight
                formula="Percentage = (X / Y) × 100"
                formulaLabel="Part-to-Whole Percentage Formula"
                variables={[
                  { symbol: 'X', name: 'Part Value', value: m2Part },
                  { symbol: 'Y', name: 'Whole Value', value: m2Whole },
                ]}
                activeStep={`(${m2Part} ÷ ${m2Whole}) × 100 = ${formatFixed(m2Result.value, 2)}%`}
                accent="indigo"
              >
                <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                      {m2Part} is what percentage of {m2Whole}:
                    </span>
                    <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono tabular-nums">
                      {formatFixed(m2Result.value, 2)}%
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyValue(`${formatFixed(m2Result.value, 2)}%`, 'm2')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 cursor-pointer self-start sm:self-center"
                  >
                    {copied === 'm2' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied === 'm2' ? 'Copied' : 'Copy Result'}</span>
                  </button>
                </div>
              </FormulaHoverHighlight>

              <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 bg-slate-100/50 dark:bg-slate-800/30 p-3 rounded-lg font-mono">
                <div>Step 1: Divide Part by Whole → {m2Part} ÷ {m2Whole} = {(parseFloat(m2Part) / parseFloat(m2Whole)).toFixed(4)}</div>
                <div>Step 2: Multiply by 100 → {(parseFloat(m2Part) / parseFloat(m2Whole)).toFixed(4)} × 100 = {formatFixed(m2Result.value, 2)}%</div>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'change' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pct-m3-initial" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Initial Value (Old)
              </label>
              <input
                id="pct-m3-initial"
                type="number"
                step="any"
                value={m3Initial}
                onChange={(e) => setM3Initial(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="e.g. 50"
              />
            </div>

            <div>
              <label htmlFor="pct-m3-final" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Final Value (New)
              </label>
              <input
                id="pct-m3-final"
                type="number"
                step="any"
                value={m3Final}
                onChange={(e) => setM3Final(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="e.g. 65"
              />
            </div>
          </div>

          {m3Result && !m3Result.ok && (
            <div role="alert" className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-sm font-medium text-rose-700 dark:text-rose-300">
              {m3Result.error}
            </div>
          )}

          {m3Result && m3Result.ok && (
            <>
              <FormulaHoverHighlight
                formula="% Change = ((New − Old) / |Old|) × 100"
                formulaLabel="Percentage Increase / Decrease Formula"
                variables={[
                  { symbol: 'Old', name: 'Initial Value', value: m3Initial },
                  { symbol: 'New', name: 'Final Value', value: m3Final },
                ]}
                activeStep={`((${m3Final} − ${m3Initial}) ÷ |${m3Initial}|) × 100 = ${formatFixed(m3Result.percentage, 2)}%`}
                accent="indigo"
              >
                <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                      {m3Result.isIncrease ? 'Increase from' : 'Decrease from'} {m3Initial} to {m3Final}:
                    </span>
                    <div className="flex items-baseline gap-3">
                      <span
                        className={`text-3xl font-extrabold font-mono tabular-nums ${
                          m3Result.isIncrease
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {m3Result.isIncrease ? '+' : ''}{formatFixed(m3Result.percentage, 2)}%
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        (Difference: {m3Result.difference > 0 ? '+' : ''}{formatFixed(m3Result.difference, 2)})
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyValue(`${formatFixed(m3Result.percentage, 2)}%`, 'm3')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 cursor-pointer self-start sm:self-center"
                  >
                    {copied === 'm3' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied === 'm3' ? 'Copied' : 'Copy Result'}</span>
                  </button>
                </div>
              </FormulaHoverHighlight>

              <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 bg-slate-100/50 dark:bg-slate-800/30 p-3 rounded-lg font-mono">
                <div>Step 1: Difference = {m3Final} − {m3Initial} = {m3Result.difference}</div>
                <div>Step 2: Percentage = (({m3Final} − {m3Initial}) ÷ |{m3Initial}|) × 100 = {formatFixed(m3Result.percentage, 2)}%</div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
