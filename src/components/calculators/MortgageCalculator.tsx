import React, { useState } from 'react';
import { Copy, Check, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { calculateMortgageSchedule } from '../../utils/calculatorFormulas';
import { FormulaHoverHighlight } from './FormulaHoverHighlight';
import { AutoUnitConversionSuggestions } from './AutoUnitConversionSuggestions';
import { useRoundingPrecision } from '../../context/RoundingPrecisionContext';
import { formatCurrencyWithPrecision } from '../../utils/roundingPrecision';
import { ResultViewToggle, ResultViewMode } from './ResultViewToggle';
import { MortgageChartView } from './StandaloneInteractiveCharts';
import { useComparisonPaneReporter } from '../../context/ComparisonContext';

export const MortgageCalculator: React.FC = () => {
  const { precision } = useRoundingPrecision();
  const [homePrice, setHomePrice] = useState<string>('350000');
  const [downPaymentPct, setDownPaymentPct] = useState<string>('20');
  const [interestRate, setInterestRate] = useState<string>('6.5');
  const [loanTermYears, setLoanTermYears] = useState<string>('30');
  const [annualPropertyTax, setAnnualPropertyTax] = useState<string>('4200');
  const [annualInsurance, setAnnualInsurance] = useState<string>('1500');
  const [monthlyHoa, setMonthlyHoa] = useState<string>('0');
  const [pmiMode, setPmiMode] = useState<'auto' | 'none' | 'custom'>('auto');
  const [customPmiRate, setCustomPmiRate] = useState<string>('0.5');
  const [extraMonthly, setExtraMonthly] = useState<string>('0');
  const [showAmortization, setShowAmortization] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [resultViewMode, setResultViewMode] = useState<ResultViewMode>('text');

  const result = (() => {
    const price = parseFloat(homePrice);
    const downPct = parseFloat(downPaymentPct);
    const rate = parseFloat(interestRate);
    const years = parseFloat(loanTermYears);
    const taxYear = annualPropertyTax.trim() === '' ? 0 : parseFloat(annualPropertyTax);
    const insYear = annualInsurance.trim() === '' ? 0 : parseFloat(annualInsurance);
    const hoa = monthlyHoa.trim() === '' ? 0 : parseFloat(monthlyHoa);
    const pmiRate = customPmiRate.trim() === '' ? 0 : parseFloat(customPmiRate);
    const extra = extraMonthly.trim() === '' ? 0 : parseFloat(extraMonthly);

    if (!Number.isFinite(downPct) || downPct < 0 || downPct >= 100) {
      return { ok: false as const, error: 'Down payment percentage must be between 0% and less than 100%.' };
    }

    const downAmount = Number.isFinite(price) ? (price * downPct) / 100 : NaN;
    const res = calculateMortgageSchedule({
      homePrice: price,
      downPayment: downAmount,
      annualRatePct: rate,
      termYears: years,
      annualPropertyTax: taxYear,
      annualHomeInsurance: insYear,
      monthlyHoa: hoa,
      pmiMode,
      customPmiRatePct: pmiRate,
      extraMonthly: extra,
    });

    if ('error' in res) {
      return { ok: false as const, error: res.error };
    }
    if (!Number.isFinite(res.monthlyPI)) {
      return { ok: false as const, error: 'Payment exceeds numeric limits. Check rate and purchase price.' };
    }

    const n15 = 15 * 12;
    const monthlyRate = rate / 100 / 12;
    const total15Interest = Math.max(0, res.monthly15YrPI * n15 - res.loanAmount);
    const interestSaved15 = Math.max(0, res.totalInterestStandard - total15Interest);

    return {
      ok: true as const,
      principal: res.loanAmount,
      downAmount,
      monthlyPI: res.monthlyPI,
      monthlyTax: res.monthlyTax,
      monthlyIns: res.monthlyIns,
      monthlyPMI: res.monthlyPmi,
      monthlyHoa: res.monthlyHoa,
      totalMonthlyPayment: res.totalMonthly,
      totalInterest: res.totalInterestWithExtra,
      interestSavedExtra: res.interestSaved,
      monthsSaved: res.monthsSaved,
      monthly15PI: res.monthly15YrPI,
      interestSaved15: monthlyRate >= 0 ? interestSaved15 : 0,
      schedule: res.schedule,
    };
  })();

  const calc = result.ok ? result : null;
  const errorMsg = !result.ok ? result.error : null;

  const formatCurrency = (val: number) => formatCurrencyWithPrecision(val, precision, 0, '$');

  useComparisonPaneReporter(
    calc
      ? {
          slug: 'mortgage-calculator',
          name: 'Mortgage Calculator',
          categorySlug: 'finance',
          primaryLabel: 'Total Monthly Payment',
          primaryDisplay: formatCurrency(calc.totalMonthlyPayment),
          primaryUnit: '/ mo',
          metrics: [
            { label: 'Principal & Interest', display: formatCurrency(calc.monthlyPI), numeric: calc.monthlyPI },
            { label: 'Loan Principal', display: formatCurrency(calc.principal), numeric: calc.principal },
            { label: 'Total Interest', display: formatCurrency(calc.totalInterest), numeric: calc.totalInterest },
          ],
        }
      : null
  );

  const handleCopy = () => {
    if (!calc) return;
    navigator.clipboard?.writeText(
      `Monthly Mortgage Payment: ${formatCurrency(calc.totalMonthlyPayment)} (Principal & Interest: ${formatCurrency(calc.monthlyPI)})`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setHomePrice('350000');
    setDownPaymentPct('20');
    setInterestRate('6.5');
    setLoanTermYears('30');
    setAnnualPropertyTax('4200');
    setAnnualInsurance('1500');
    setMonthlyHoa('0');
    setPmiMode('auto');
    setCustomPmiRate('0.5');
    setExtraMonthly('0');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">
          Mortgage Parameters (PITI + HOA / PMI)
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
            <label htmlFor="mtg-price" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Home Purchase Price
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-slate-400 font-mono text-sm">$</span>
              <input
                id="mtg-price"
                type="number"
                min="1"
                step="5000"
                value={homePrice}
                onChange={(e) => setHomePrice(e.target.value)}
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          <div>
            <label htmlFor="mtg-down" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Down Payment (%)
            </label>
            <div className="relative">
              <input
                id="mtg-down"
                type="number"
                step="1"
                min="0"
                max="99"
                value={downPaymentPct}
                onChange={(e) => setDownPaymentPct(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <span className="absolute right-4 top-3.5 text-slate-400 font-mono text-sm">%</span>
            </div>
          </div>

          <div>
            <label htmlFor="mtg-rate" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Interest Rate (Annual)
            </label>
            <div className="relative">
              <input
                id="mtg-rate"
                type="number"
                step="0.05"
                min="0"
                max="50"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <span className="absolute right-4 top-3.5 text-slate-400 font-mono text-sm">%</span>
            </div>
          </div>

          <div>
            <label htmlFor="mtg-term" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Loan Term
            </label>
            <select
              id="mtg-term"
              value={loanTermYears}
              onChange={(e) => setLoanTermYears(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
            >
              <option value="30">30 Years (Fixed)</option>
              <option value="20">20 Years (Fixed)</option>
              <option value="15">15 Years (Fixed)</option>
              <option value="10">10 Years (Fixed)</option>
            </select>
          </div>

          <div>
            <label htmlFor="mtg-tax" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Property Tax (Annual)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-slate-400 font-mono text-sm">$</span>
              <input
                id="mtg-tax"
                type="number"
                min="0"
                step="100"
                value={annualPropertyTax}
                onChange={(e) => setAnnualPropertyTax(e.target.value)}
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          <div>
            <label htmlFor="mtg-ins" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Home Insurance (Annual)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-slate-400 font-mono text-sm">$</span>
              <input
                id="mtg-ins"
                type="number"
                min="0"
                step="100"
                value={annualInsurance}
                onChange={(e) => setAnnualInsurance(e.target.value)}
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          <div>
            <label htmlFor="mtg-hoa" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Monthly HOA Dues
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-slate-400 font-mono text-sm">$</span>
              <input
                id="mtg-hoa"
                type="number"
                min="0"
                step="25"
                value={monthlyHoa}
                onChange={(e) => setMonthlyHoa(e.target.value)}
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          <div>
            <label htmlFor="mtg-pmi-mode" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              PMI Setting
            </label>
            <select
              id="mtg-pmi-mode"
              value={pmiMode}
              onChange={(e) => setPmiMode(e.target.value as 'auto' | 'none' | 'custom')}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
            >
              <option value="auto">Auto (0.5%/yr if &lt;20% down)</option>
              <option value="none">No PMI ($0)</option>
              <option value="custom">Custom Annual PMI Rate (%)</option>
            </select>
          </div>

          {pmiMode === 'custom' ? (
            <div>
              <label htmlFor="mtg-pmi-rate" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Custom PMI Rate (%/yr)
              </label>
              <input
                id="mtg-pmi-rate"
                type="number"
                min="0"
                max="5"
                step="0.05"
                value={customPmiRate}
                onChange={(e) => setCustomPmiRate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          ) : (
            <div>
              <label htmlFor="mtg-extra" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Extra Monthly Principal
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3.5 text-slate-400 font-mono text-sm">$</span>
                <input
                  id="mtg-extra"
                  type="number"
                  min="0"
                  step="50"
                  value={extraMonthly}
                  onChange={(e) => setExtraMonthly(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>
          )}

          {pmiMode === 'custom' && (
            <div>
              <label htmlFor="mtg-extra-2" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Extra Monthly Principal
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3.5 text-slate-400 font-mono text-sm">$</span>
                <input
                  id="mtg-extra-2"
                  type="number"
                  min="0"
                  step="50"
                  value={extraMonthly}
                  onChange={(e) => setExtraMonthly(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>
          )}
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
                <MortgageChartView
                  principal={calc.principal}
                  totalMonthlyPayment={calc.totalMonthlyPayment}
                  totalInterest={calc.totalInterest}
                  monthlyPI={calc.monthlyPI}
                  monthlyTax={calc.monthlyTax}
                  monthlyIns={calc.monthlyIns}
                  monthlyPMI={calc.monthlyPMI}
                  monthlyHoa={calc.monthlyHoa}
                  schedule={calc.schedule}
                  formatCurrency={formatCurrency}
                />

                <AutoUnitConversionSuggestions
                  candidates={[
                    { source: 'output', label: 'Monthly Payment', value: calc.totalMonthlyPayment, unit: 'USD/mo' },
                    { source: 'output', label: 'Loan Principal', value: calc.principal, unit: 'USD' },
                    { source: 'output', label: 'Monthly P&I', value: calc.monthlyPI, unit: 'USD/mo' },
                    { source: 'input', label: 'Home Price', value: Number(homePrice) || 0, unit: 'USD' },
                  ]}
                />
              </>
            ) : (
              <>
            <FormulaHoverHighlight
              formula="Total = P × [i(1 + i)^n] / [(1 + i)^n − 1] + Tax + Ins + PMI + HOA"
              formulaLabel="Monthly Mortgage & PITI Amortization Formula"
              variables={[
                { symbol: 'P', name: 'Financed Loan Principal', value: formatCurrency(calc.principal) },
                { symbol: 'i', name: 'Monthly Interest Rate', value: `${(Number(interestRate || 0) / 12).toFixed(4)}%` },
                { symbol: 'n', name: 'Total Monthly Payments', value: Number(loanTermYears || 30) * 12, unit: 'mos' },
                { symbol: 'Tax', name: 'Monthly Property Tax', value: formatCurrency(calc.monthlyTax) },
                { symbol: 'Ins', name: 'Monthly Insurance', value: formatCurrency(calc.monthlyIns) },
              ]}
              activeStep={`P&I = ${formatCurrency(calc.monthlyPI)} + Escrow/Dues (${formatCurrency(calc.monthlyTax + calc.monthlyIns + calc.monthlyPMI + calc.monthlyHoa)}) = ${formatCurrency(calc.totalMonthlyPayment)}/mo`}
              accent="teal"
            >
              <div className="p-6 rounded-2xl bg-slate-900 text-white dark:bg-slate-950 dark:border dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-400 block mb-1">
                    Estimated Total Monthly Payment
                  </span>
                  <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white tabular-nums">
                    {formatCurrency(calc.totalMonthlyPayment)}
                  </span>
                  <span className="text-xs text-slate-400 block mt-1">
                    Loan Principal: {formatCurrency(calc.principal)} · Down Payment: {formatCurrency(calc.downAmount)} · Lifetime Interest: {formatCurrency(calc.totalInterest)}
                  </span>
                  {calc.monthsSaved > 0 && (
                    <span className="text-xs text-emerald-300 block mt-1">
                      Extra payments save <strong>{formatCurrency(calc.interestSavedExtra)}</strong> and pay off{' '}
                      <strong>{calc.monthsSaved} months</strong> early.
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors cursor-pointer self-start sm:self-center"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied' : 'Copy Estimate'}</span>
                </button>
              </div>
            </FormulaHoverHighlight>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[11px] text-slate-500 block">Principal &amp; Interest</span>
                <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                  {formatCurrency(calc.monthlyPI)}
                </span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[11px] text-slate-500 block">Property Tax</span>
                <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                  {formatCurrency(calc.monthlyTax)}
                </span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[11px] text-slate-500 block">Home Insurance</span>
                <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                  {formatCurrency(calc.monthlyIns)}
                </span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[11px] text-slate-500 block">PMI</span>
                <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                  {calc.monthlyPMI > 0 ? formatCurrency(calc.monthlyPMI) : '$0'}
                </span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[11px] text-slate-500 block">HOA Dues</span>
                <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                  {calc.monthlyHoa > 0 ? formatCurrency(calc.monthlyHoa) : '$0'}
                </span>
              </div>
            </div>

            <AutoUnitConversionSuggestions
              candidates={[
                { source: 'output', label: 'Monthly Payment', value: calc.totalMonthlyPayment, unit: 'USD/mo' },
                { source: 'output', label: 'Loan Principal', value: calc.principal, unit: 'USD' },
                { source: 'output', label: 'Monthly P&I', value: calc.monthlyPI, unit: 'USD/mo' },
                { source: 'input', label: 'Home Price', value: Number(homePrice) || 0, unit: 'USD' },
              ]}
            />

            {loanTermYears === '30' && (
              <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                <div>
                  <strong className="text-indigo-950 dark:text-indigo-200 block text-sm">
                    Switch to a 15-Year Term Comparison:
                  </strong>
                  <span className="text-indigo-800 dark:text-indigo-300">
                    Payment would be {formatCurrency(calc.monthly15PI)}/mo, saving you{' '}
                    <strong className="font-mono">{formatCurrency(calc.interestSaved15)}</strong> in total interest!
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setLoanTermYears('15')}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium whitespace-nowrap cursor-pointer transition-colors"
                >
                  Select 15-Year
                </button>
              </div>
            )}

            <div>
              <button
                type="button"
                aria-expanded={showAmortization}
                onClick={() => setShowAmortization(!showAmortization)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <span>Annual Amortization Schedule</span>
                {showAmortization ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showAmortization && (
                <div className="mt-3 overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold font-mono">
                      <tr>
                        <th className="py-2.5 px-3">Year</th>
                        <th className="py-2.5 px-3">Principal Paid</th>
                        <th className="py-2.5 px-3">Interest Paid</th>
                        <th className="py-2.5 px-3">Ending Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400 font-mono tabular-nums">
                      {calc.schedule.map((row) => (
                        <tr key={row.year} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="py-2 px-3 font-medium text-slate-900 dark:text-slate-100">Year {row.year}</td>
                          <td className="py-2 px-3">{formatCurrency(row.principalPaid)}</td>
                          <td className="py-2 px-3 text-rose-600 dark:text-rose-400">{formatCurrency(row.interestPaid)}</td>
                          <td className="py-2 px-3 font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(row.remainingBalance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
