import React, { useState } from 'react';
import { Copy, Check, RotateCcw } from 'lucide-react';
import { calculateCompoundInterest } from '../../utils/calculatorFormulas';
import { FormulaHoverHighlight } from './FormulaHoverHighlight';
import { AutoUnitConversionSuggestions } from './AutoUnitConversionSuggestions';
import { useRoundingPrecision } from '../../context/RoundingPrecisionContext';
import { formatCurrencyWithPrecision, formatNumberWithPrecision } from '../../utils/roundingPrecision';
import { ResultViewToggle, ResultViewMode } from './ResultViewToggle';
import { CompoundInterestChartView } from './StandaloneInteractiveCharts';
import { useComparisonPaneReporter } from '../../context/ComparisonContext';

export const CompoundInterestCalculator: React.FC = () => {
  const { precision } = useRoundingPrecision();
  const [initialPrincipal, setInitialPrincipal] = useState<string>('10000');
  const [monthlyContribution, setMonthlyContribution] = useState<string>('300');
  const [annualRate, setAnnualRate] = useState<string>('7');
  const [years, setYears] = useState<string>('20');
  const [compoundingFreq, setCompoundingFreq] = useState<number>(12);
  const [timing, setTiming] = useState<'end' | 'beginning'>('end');
  const [inflationRate, setInflationRate] = useState<string>('0');
  const [copied, setCopied] = useState<boolean>(false);
  const [resultViewMode, setResultViewMode] = useState<ResultViewMode>('text');

  const result = (() => {
    const P = initialPrincipal.trim() === '' ? 0 : parseFloat(initialPrincipal);
    const PMT = monthlyContribution.trim() === '' ? 0 : parseFloat(monthlyContribution);
    const ratePct = annualRate.trim() === '' ? 0 : parseFloat(annualRate);
    const tRaw = parseFloat(years);
    const infPct = inflationRate.trim() === '' ? 0 : parseFloat(inflationRate);

    if (P === 0 && PMT === 0) {
      return { ok: false as const, error: 'Enter an initial principal or a monthly contribution above $0.' };
    }

    const res = calculateCompoundInterest({
      principal: P,
      monthlyContribution: PMT,
      annualRatePct: ratePct,
      years: tRaw,
      compoundingFreq,
      timing,
      inflationRatePct: infPct,
    });

    if ('error' in res) {
      return { ok: false as const, error: res.error };
    }
    if (!Number.isFinite(res.futureValue)) {
      return { ok: false as const, error: 'Projected portfolio value exceeds representable limits.' };
    }

    const stepYears = tRaw <= 10 ? 1 : Math.max(1, Math.round(res.schedule.length / 6));
    const milestones = res.schedule.filter(
      (_, idx) => idx === 0 || idx === res.schedule.length - 1 || (idx + 1) % stepYears === 0
    );

    const ruleOf72 = ratePct > 0 ? (72 / ratePct).toFixed(1) : 'N/A';
    const interestRatio =
      res.futureValue > 0 ? Math.min(100, Math.max(0, (res.totalInterest / res.futureValue) * 100)) : 0;

    return {
      ok: true as const,
      futureValue: res.futureValue,
      realFutureValue: res.realFutureValue,
      totalDeposited: res.totalPrincipal,
      totalInterest: res.totalInterest,
      effectiveAnnualRatePct: res.effectiveAnnualRatePct,
      ruleOf72,
      interestRatio,
      effectiveYears: tRaw,
      schedule: res.schedule,
      milestones,
      hasInflation: infPct > 0,
    };
  })();

  const calc = result.ok ? result : null;
  const errorMsg = !result.ok ? result.error : null;

  const formatCurrency = (val: number) => formatCurrencyWithPrecision(val, precision, 0, '$');
  const formatPct = (val: number, autoDecimals = 2) =>
    formatNumberWithPrecision(val, precision, {
      autoDecimals,
      minAutoDecimals: autoDecimals,
      useGrouping: false,
    });

  useComparisonPaneReporter(
    calc
      ? {
          slug: 'compound-interest-calculator',
          name: 'Compound Interest Calculator',
          categorySlug: 'finance',
          primaryLabel: 'Projected Future Value',
          primaryDisplay: formatCurrency(calc.futureValue),
          metrics: [
            { label: 'Total Principal', display: formatCurrency(calc.totalDeposited), numeric: calc.totalDeposited },
            { label: 'Total Interest Earned', display: formatCurrency(calc.totalInterest), numeric: calc.totalInterest },
            { label: 'Effective APY', display: `${formatPct(calc.effectiveAnnualRatePct, 2)}%`, numeric: calc.effectiveAnnualRatePct },
          ],
        }
      : null
  );

  const handleCopy = () => {
    if (!calc) return;
    navigator.clipboard?.writeText(
      `Compound Growth Projected Value: ${formatCurrency(calc.futureValue)} (Interest Earned: ${formatCurrency(calc.totalInterest)})`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setInitialPrincipal('10000');
    setMonthlyContribution('300');
    setAnnualRate('7');
    setYears('20');
    setCompoundingFreq(12);
    setTiming('end');
    setInflationRate('0');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">
          Investment &amp; Savings Growth
        </h2>
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="ci-principal"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2"
            >
              Initial Principal ($)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-slate-400 font-mono text-sm">$</span>
              <input
                id="ci-principal"
                type="number"
                min="0"
                step="500"
                value={initialPrincipal}
                onChange={(e) => setInitialPrincipal(e.target.value)}
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="ci-monthly"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2"
            >
              Monthly Contribution ($)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-slate-400 font-mono text-sm">$</span>
              <input
                id="ci-monthly"
                type="number"
                min="0"
                step="50"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(e.target.value)}
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="ci-rate"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2"
            >
              Estimated Return Rate (%)
            </label>
            <div className="relative">
              <input
                id="ci-rate"
                type="number"
                min="0"
                max="100"
                step="0.25"
                value={annualRate}
                onChange={(e) => setAnnualRate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <span className="absolute right-4 top-3.5 text-slate-400 font-mono text-sm">%</span>
            </div>
          </div>

          <div>
            <label
              htmlFor="ci-years"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2"
            >
              Time Horizon (Years)
            </label>
            <div className="relative">
              <input
                id="ci-years"
                type="number"
                step="0.5"
                min="0.5"
                max="100"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                className="w-full px-4 py-3 pr-16 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <span className="absolute right-4 top-3.5 text-slate-400 text-xs">Years</span>
            </div>
          </div>

          <div>
            <label
              htmlFor="ci-freq"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2"
            >
              Compounding Frequency
            </label>
            <select
              id="ci-freq"
              value={compoundingFreq}
              onChange={(e) => setCompoundingFreq(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
            >
              <option value="365">Daily (365/yr)</option>
              <option value="12">Monthly (12/yr)</option>
              <option value="4">Quarterly (4/yr)</option>
              <option value="1">Annually (1/yr)</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="ci-timing"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2"
            >
              Contribution Timing
            </label>
            <select
              id="ci-timing"
              value={timing}
              onChange={(e) => setTiming(e.target.value as 'end' | 'beginning')}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
            >
              <option value="end">End of Month (Ordinary)</option>
              <option value="beginning">Beginning of Month (Annuity Due)</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="ci-inflation"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2"
            >
              Expected Inflation (Optional)
            </label>
            <div className="relative">
              <input
                id="ci-inflation"
                type="number"
                min="0"
                max="30"
                step="0.25"
                value={inflationRate}
                onChange={(e) => setInflationRate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <span className="absolute right-4 top-3.5 text-slate-400 font-mono text-sm">%</span>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-sm font-medium text-rose-700 dark:text-rose-300"
          >
            {errorMsg}
          </div>
        )}

        {calc && (
          <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Result Representation
              </span>
              <ResultViewToggle mode={resultViewMode} onChange={setResultViewMode} />
            </div>

            {resultViewMode === 'chart' ? (
              <>
                <CompoundInterestChartView
                  initialPrincipal={initialPrincipal.trim() === '' ? 0 : parseFloat(initialPrincipal) || 0}
                  futureValue={calc.futureValue}
                  realFutureValue={calc.realFutureValue}
                  totalDeposited={calc.totalDeposited}
                  totalInterest={calc.totalInterest}
                  hasInflation={calc.hasInflation}
                  schedule={calc.schedule}
                  formatCurrency={formatCurrency}
                />

                <AutoUnitConversionSuggestions
                  candidates={[
                    { source: 'output', label: 'Projected Value', value: calc.futureValue, unit: 'USD' },
                    { source: 'output', label: 'Total Deposits', value: calc.totalDeposited, unit: 'USD' },
                    { source: 'output', label: 'Compound Interest', value: calc.totalInterest, unit: 'USD' },
                    { source: 'input', label: 'Initial Principal', value: Number(initialPrincipal) || 0, unit: 'USD' },
                  ]}
                />
              </>
            ) : (
              <>
            <FormulaHoverHighlight
              formula={
                timing === 'beginning'
                  ? 'A = P(1 + r/n)^(nt) + PMT × [((1 + r_eff)^m − 1) / r_eff] × (1 + r_eff)'
                  : 'A = P(1 + r/n)^(nt) + PMT × [((1 + r_eff)^m − 1) / r_eff]'
              }
              formulaLabel={
                timing === 'beginning'
                  ? 'Compound Growth Formula (Annuity Due — Beginning of Month)'
                  : 'Compound Growth Formula (Ordinary Annuity — End of Month)'
              }
              variables={[
                { symbol: 'P', name: 'Initial Principal', value: `$${Number(initialPrincipal || 0).toLocaleString('en-US')}` },
                { symbol: 'PMT', name: 'Monthly Deposit', value: `$${Number(monthlyContribution || 0).toLocaleString('en-US')}` },
                { symbol: 'r', name: 'Annual Interest Rate', value: `${annualRate || 0}%` },
                { symbol: 'n', name: 'Compounding / Year', value: compoundingFreq },
                { symbol: 't', name: 'Time Horizon', value: calc.effectiveYears, unit: 'yrs' },
              ]}
              activeStep={
                calc.hasInflation
                  ? `Nominal FV = ${formatCurrency(calc.futureValue)} · Real Inflation-Adjusted = ${formatCurrency(calc.realFutureValue)} (APY ${formatPct(calc.effectiveAnnualRatePct, 2)}%)`
                  : `Total Principal = ${formatCurrency(calc.totalDeposited)} + Compound Interest = ${formatCurrency(calc.totalInterest)} → ${formatCurrency(calc.futureValue)}`
              }
              accent="indigo"
            >
              <div className="p-6 rounded-2xl bg-indigo-950 text-white dark:border dark:border-indigo-900/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 shadow-md">
                <div>
                  <span className="text-xs uppercase tracking-wider text-indigo-300 block mb-1">
                    Projected Portfolio Value (After {calc.effectiveYears} {calc.effectiveYears === 1 ? 'Year' : 'Years'})
                  </span>
                  <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white tabular-nums">
                    {formatCurrency(calc.futureValue)}
                  </span>
                  <span className="text-xs text-indigo-200 block mt-1">
                    Total Deposits: {formatCurrency(calc.totalDeposited)} · Compound Interest:{' '}
                    <strong className="text-emerald-300">{formatCurrency(calc.totalInterest)}</strong> · APY:{' '}
                    <strong className="text-white">{formatPct(calc.effectiveAnnualRatePct, 2)}%</strong>
                  </span>
                  {calc.hasInflation && (
                    <span className="text-xs text-amber-300 block mt-1">
                      Inflation-Adjusted Purchasing Power: <strong>{formatCurrency(calc.realFutureValue)}</strong>
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors cursor-pointer self-start sm:self-center"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied' : 'Copy Result'}</span>
                </button>
              </div>
            </FormulaHoverHighlight>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
              <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                <span>Total Principal: {formatCurrency(calc.totalDeposited)} ({formatPct(100 - calc.interestRatio, 1)}%)</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  Compound Growth: {formatCurrency(calc.totalInterest)} ({formatPct(calc.interestRatio, 1)}%)
                </span>
              </div>
              <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                <div
                  className="bg-indigo-600 h-full transition-all duration-300"
                  style={{ width: `${100 - calc.interestRatio}%` }}
                />
                <div
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${calc.interestRatio}%` }}
                />
              </div>
            </div>

            <AutoUnitConversionSuggestions
              candidates={[
                { source: 'output', label: 'Projected Value', value: calc.futureValue, unit: 'USD' },
                { source: 'output', label: 'Total Deposits', value: calc.totalDeposited, unit: 'USD' },
                { source: 'output', label: 'Compound Interest', value: calc.totalInterest, unit: 'USD' },
                { source: 'input', label: 'Initial Principal', value: Number(initialPrincipal) || 0, unit: 'USD' },
              ]}
            />

            <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/50 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between">
              <span>
                <strong>The Rule of 72:</strong> At an annual return of {annualRate || 0}%, your money doubles approximately every{' '}
                <strong className="font-mono">{calc.ruleOf72} {calc.ruleOf72 === 'N/A' ? '' : 'years'}</strong> without any extra deposits.
              </span>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
                Accumulation Milestones
              </h4>
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold font-mono">
                    <tr>
                      <th className="py-2.5 px-3">Timeline</th>
                      <th className="py-2.5 px-3">Total Contributed</th>
                      <th className="py-2.5 px-3">Compound Interest</th>
                      <th className="py-2.5 px-3">Total Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400 font-mono tabular-nums">
                    {calc.milestones.map((m) => (
                      <tr key={m.year} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-2 px-3 font-medium text-slate-900 dark:text-slate-100">Year {m.year}</td>
                        <td className="py-2 px-3">{formatCurrency(m.principal)}</td>
                        <td className="py-2 px-3 text-emerald-600 dark:text-emerald-400">+{formatCurrency(m.interest)}</td>
                        <td className="py-2 px-3 font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(m.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
