import React, { useState } from 'react';
import { Copy, Check, RotateCcw } from 'lucide-react';
import { FormulaHoverHighlight } from './FormulaHoverHighlight';
import { calculateDescriptiveStats } from '../../utils/calculatorFormulas';
import { useRoundingPrecision } from '../../context/RoundingPrecisionContext';
import { formatNumberWithPrecision } from '../../utils/roundingPrecision';

export const StandardDeviationCalculator: React.FC = () => {
  const [inputData, setInputData] = useState<string>('72, 85, 90, 68, 95');
  const [mode, setMode] = useState<'sample' | 'population'>('sample');
  const [copied, setCopied] = useState<boolean>(false);
  const { precision } = useRoundingPrecision();

  const calc = (() => {
    const tokens = inputData
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const invalidTokens = tokens.filter((t) => !Number.isFinite(Number(t)));
    if (invalidTokens.length > 0) {
      return { ok: false as const, error: `Invalid numeric token "${invalidTokens[0]}". Enter numbers separated by commas or spaces.` };
    }

    const numbers = tokens.map((t) => Number(t)).filter((n) => Number.isFinite(n));
    if (numbers.length < 2) return null;

    const stats = calculateDescriptiveStats(numbers, mode);
    if ('error' in stats) {
      return { ok: false as const, error: stats.error };
    }

    const deviations = numbers.map((x) => ({
      val: x,
      diff: x - stats.mean,
      sqDiff: Math.pow(x - stats.mean, 2),
    }));
    const sumSqDiff = deviations.reduce((acc, d) => acc + d.sqDiff, 0);

    const selectedSD = mode === 'sample' ? stats.sampleSd : stats.popSd;
    const selectedVar = mode === 'sample' ? stats.sampleVariance : stats.popVariance;

    return {
      ok: true as const,
      n: stats.count,
      sum: stats.sum,
      mean: stats.mean,
      median: stats.median,
      modeLabel: stats.modeLabel,
      min: stats.min,
      max: stats.max,
      range: stats.range,
      q1: stats.q1,
      q3: stats.q3,
      iqr: stats.iqr,
      sampleSD: stats.sampleSd,
      sampleVariance: stats.sampleVariance,
      popSD: stats.popSd,
      popVariance: stats.popVariance,
      selectedSD,
      selectedVar,
      sem: stats.sem,
      cvPct: stats.cvPct,
      sumSqDiff,
      deviations,
    };
  })();

  const validCalc = calc && calc.ok ? calc : null;
  const errorMsg = calc && !calc.ok ? calc.error : null;

  const fmtStat = (v: number) =>
    formatNumberWithPrecision(v, precision, { autoDecimals: 4, trimTrailingZeros: true });
  const fmtTable = (v: number) =>
    formatNumberWithPrecision(v, precision, { autoDecimals: 2, minAutoDecimals: 2 });
  const fmtCv = (v: number) =>
    formatNumberWithPrecision(v, precision, { autoDecimals: 2, trimTrailingZeros: true });

  const handleCopy = () => {
    if (!validCalc) return;
    navigator.clipboard?.writeText(
      `Standard Deviation (${mode}): ${fmtStat(validCalc.selectedSD)} (Mean: ${fmtStat(validCalc.mean)}, Variance: ${fmtStat(validCalc.selectedVar)}, IQR: ${fmtStat(validCalc.iqr)})`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setInputData('72, 85, 90, 68, 95');
    setMode('sample');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">
          Statistical Dispersion &amp; Summary Metrics
        </h2>
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Sample Data</span>
        </button>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div>
          <label htmlFor="sd-dataset-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Dataset Numbers (separated by commas or spaces)
          </label>
          <textarea
            id="sd-dataset-input"
            rows={3}
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            placeholder="e.g. 10, 15, 20, 25, 30"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
            <input
              type="radio"
              name="sd_mode"
              checked={mode === 'sample'}
              onChange={() => setMode('sample')}
              className="text-indigo-600 focus:ring-indigo-500"
            />
            <span>Sample Standard Deviation (s) — Divisor N − 1</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
            <input
              type="radio"
              name="sd_mode"
              checked={mode === 'population'}
              onChange={() => setMode('population')}
              className="text-indigo-600 focus:ring-indigo-500"
            />
            <span>Population Standard Deviation (σ) — Divisor N</span>
          </label>
        </div>

        {errorMsg ? (
          <div role="alert" className="text-xs text-rose-700 dark:text-rose-300 font-medium p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-lg">
            {errorMsg}
          </div>
        ) : validCalc ? (
          <div className="space-y-6 pt-2">
            <FormulaHoverHighlight
              formula={
                mode === 'sample'
                  ? 's = √[ Σ(x − x̄)² / (N − 1) ]'
                  : 'σ = √[ Σ(x − μ)² / N ]'
              }
              formulaLabel={
                mode === 'sample'
                  ? 'Sample Standard Deviation (Bessel N − 1)'
                  : 'Population Standard Deviation (Divisor N)'
              }
              variables={[
                { symbol: 'N', name: 'Sample Count', value: validCalc.n },
                { symbol: mode === 'sample' ? 'x̄' : 'μ', name: 'Arithmetic Mean', value: fmtStat(validCalc.mean) },
                { symbol: 'Σ(x − μ)²', name: 'Sum of Squared Deviations', value: fmtStat(validCalc.sumSqDiff) },
              ]}
              activeStep={`Variance = ${fmtStat(validCalc.selectedVar)} → √${fmtStat(validCalc.selectedVar)} = ${fmtStat(validCalc.selectedSD)} (SEM = ${fmtStat(validCalc.sem)})`}
              accent="teal"
            >
              <div className="p-6 rounded-2xl bg-slate-900 text-white dark:bg-slate-950 dark:border dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 shadow-md">
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-400 block mb-1">
                    {mode === 'sample' ? 'Sample Standard Deviation (s)' : 'Population Standard Deviation (σ)'}
                  </span>
                  <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white tabular-nums">
                    {fmtStat(validCalc.selectedSD)}
                  </span>
                  <span className="text-xs text-slate-400 block mt-1">
                    Mean: <strong className="text-white font-mono">{fmtStat(validCalc.mean)}</strong> · Variance:{' '}
                    <strong className="text-indigo-300 font-mono">{fmtStat(validCalc.selectedVar)}</strong> · SEM:{' '}
                    <strong className="text-emerald-300 font-mono">{fmtStat(validCalc.sem)}</strong>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors cursor-pointer self-start sm:self-center"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied' : 'Copy Stats'}</span>
                </button>
              </div>
            </FormulaHoverHighlight>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[11px] text-slate-500 block">Count (n) / Sum (Σx)</span>
                <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                  {validCalc.n} / {fmtStat(validCalc.sum)}
                </span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[11px] text-slate-500 block">Median / Mode</span>
                <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                  {fmtStat(validCalc.median)} · {validCalc.modeLabel}
                </span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[11px] text-slate-500 block">Min / Max (Range)</span>
                <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                  {validCalc.min} – {validCalc.max} ({fmtStat(validCalc.range)})
                </span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[11px] text-slate-500 block">Quartiles (Q1 / Q3 / IQR)</span>
                <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                  {fmtStat(validCalc.q1)} / {fmtStat(validCalc.q3)} ({fmtStat(validCalc.iqr)})
                </span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[11px] text-slate-500 block">Sample Var (s²)</span>
                <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                  {fmtStat(validCalc.sampleVariance)}
                </span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[11px] text-slate-500 block">Population Var (σ²)</span>
                <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                  {fmtStat(validCalc.popVariance)}
                </span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[11px] text-slate-500 block">Coeff. of Variation (CV)</span>
                <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                  {validCalc.cvPct !== null ? `${fmtCv(validCalc.cvPct)}%` : 'N/A'}
                </span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[11px] text-slate-500 block">Sum Squared Diff Σ(x−μ)²</span>
                <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                  {fmtStat(validCalc.sumSqDiff)}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
                Step-by-Step Deviation Table
              </h4>
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl max-h-56">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold font-mono sticky top-0">
                    <tr>
                      <th className="py-2 px-3">Item #</th>
                      <th className="py-2 px-3">Value (x)</th>
                      <th className="py-2 px-3">Deviation (x − μ)</th>
                      <th className="py-2 px-3">Squared (x − μ)²</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400 font-mono tabular-nums">
                    {validCalc.deviations.map((d, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-1.5 px-3">{i + 1}</td>
                        <td className="py-1.5 px-3 font-medium text-slate-900 dark:text-slate-100">{d.val}</td>
                        <td className="py-1.5 px-3">{fmtTable(d.diff)}</td>
                        <td className="py-1.5 px-3 text-indigo-600 dark:text-indigo-400">{fmtTable(d.sqDiff)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-500 italic p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
            Please enter at least 2 valid numbers to calculate standard deviation.
          </div>
        )}
      </div>
    </div>
  );
};
