import React, { useState } from 'react';
import { Copy, Check, RotateCcw } from 'lucide-react';
import { calculateDueDateEstimate, DueDateMethod } from '../../utils/calculatorFormulas';
import { FormulaHoverHighlight } from './FormulaHoverHighlight';
import { useRoundingPrecision } from '../../context/RoundingPrecisionContext';
import { formatNumberWithPrecision } from '../../utils/roundingPrecision';

export const DueDateCalculator: React.FC = () => {
  const getDefaultLMP = () => {
    const d = new Date();
    d.setDate(d.getDate() - 84);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [method, setMethod] = useState<DueDateMethod>('lmp');
  const [referenceDate, setReferenceDate] = useState<string>(getDefaultLMP());
  const [cycleLength, setCycleLength] = useState<number>(28);
  const [copied, setCopied] = useState<boolean>(false);
  const { precision } = useRoundingPrecision();

  const result = (() => {
    if (!referenceDate) {
      return { ok: false as const, error: 'Please select a valid reference date.' };
    }

    const res = calculateDueDateEstimate(method, referenceDate, cycleLength);
    if ('error' in res) {
      return { ok: false as const, error: res.error };
    }

    if (res.gestationalDays < 0) {
      return { ok: false as const, error: 'Entered date yields a negative gestational age. Please verify the date.' };
    }
    if (res.gestationalDays > 294) {
      return { ok: false as const, error: 'Estimated gestation exceeds 42 weeks. Please verify the date or consult a clinician.' };
    }

    const formatIso = (iso: string) => {
      const [y, m, d] = iso.split('-').map(Number);
      const dt = new Date(Date.UTC(y, m - 1, d));
      return dt.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      });
    };

    const addDaysToLmpIso = (days: number) => {
      const [y, m, d] = res.lmpEquivalentIso.split('-').map(Number);
      const dt = new Date(Date.UTC(y, m - 1, d + days));
      return dt.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      });
    };

    let trimester = '1st Trimester (Weeks 1–13)';
    let trimesterStage = 'Early development & organogenesis';
    if (res.trimester === 3) {
      trimester = '3rd Trimester (Weeks 28–40)';
      trimesterStage = 'Final growth, lung maturation & birth prep';
    } else if (res.trimester === 2) {
      trimester = '2nd Trimester (Weeks 14–27)';
      trimesterStage = 'Rapid growth, movement & anatomy development';
    }

    return {
      ok: true as const,
      eddFormatted: formatIso(res.eddIso),
      weeksPregnant: res.gestationalWeeks,
      extraDays: res.remainingDaysOfWeek,
      daysRemaining: Math.max(0, res.daysUntilDue),
      progressPercent: res.progressPct,
      trimester,
      trimesterStage,
      milestones: [
        { label: 'Heartbeat detectable (Week 6)', date: addDaysToLmpIso(6 * 7) },
        { label: 'End of 1st Trimester (Week 13+6)', date: formatIso(res.firstTrimesterEndIso) },
        { label: 'Anatomy scan ultrasound (Week 20)', date: addDaysToLmpIso(20 * 7) },
        { label: '3rd Trimester begins (Week 28)', date: addDaysToLmpIso(28 * 7) },
        { label: 'Full term delivery window (Week 37+)', date: addDaysToLmpIso(37 * 7) },
      ],
    };
  })();

  const calc = result.ok ? result : null;
  const errorMsg = !result.ok ? result.error : null;

  const handleCopy = () => {
    if (!calc) return;
    navigator.clipboard?.writeText(
      `Estimated Due Date: ${calc.eddFormatted} (Currently ${calc.weeksPregnant} weeks, ${calc.extraDays} days)`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setMethod('lmp');
    setReferenceDate(getDefaultLMP());
    setCycleLength(28);
  };

  const dateLabel =
    method === 'lmp'
      ? 'First Day of Last Menstrual Period (LMP)'
      : method === 'conception'
        ? 'Conception / Ovulation Date'
        : method === 'ivf_day3'
          ? 'IVF Day-3 Embryo Transfer Date'
          : 'IVF Day-5 Blastocyst Transfer Date';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">
          Pregnancy Timeline &amp; ACOG Due Date Estimator
        </h2>
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="edd-method-select" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Calculation Method
            </label>
            <select
              id="edd-method-select"
              value={method}
              onChange={(e) => setMethod(e.target.value as DueDateMethod)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
            >
              <option value="lmp">Last Menstrual Period (LMP)</option>
              <option value="conception">Conception Date</option>
              <option value="ivf_day3">IVF 3-Day Transfer</option>
              <option value="ivf_day5">IVF 5-Day Transfer</option>
            </select>
          </div>

          <div>
            <label htmlFor="lmp-date-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              {dateLabel}
            </label>
            <input
              id="lmp-date-input"
              type="date"
              value={referenceDate}
              onChange={(e) => setReferenceDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
            />
          </div>

          {method === 'lmp' && (
            <div>
              <label htmlFor="cycle-length-select" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Average Cycle Length (Days)
              </label>
              <select
                id="cycle-length-select"
                value={cycleLength}
                onChange={(e) => setCycleLength(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
              >
                {[21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40].map((c) => (
                  <option key={c} value={c}>
                    {c} Days {c === 28 ? '(Standard 28-day cycle)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {errorMsg && (
          <div role="alert" className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-sm font-medium text-rose-700 dark:text-rose-300">
            {errorMsg}
          </div>
        )}

        {calc && (
          <div className="space-y-6 pt-2">
            <FormulaHoverHighlight
              accent="indigo"
              formulaLabel={
                method === 'lmp'
                  ? "ACOG Naegele's Rule (LMP + Cycle Adjustment)"
                  : method === 'conception'
                    ? 'Conception-Date Gestational Offset'
                    : method === 'ivf_day3'
                      ? 'IVF Day-3 Embryo Transfer Rule'
                      : 'IVF Day-5 Blastocyst Transfer Rule'
              }
              formula={
                method === 'lmp'
                  ? 'EDD = LMP + 280 + (CL − 28) days'
                  : method === 'conception'
                    ? 'EDD = CD + 266 days'
                    : method === 'ivf_day3'
                      ? 'EDD = TD + 263 days'
                      : 'EDD = TD + 261 days'
              }
              variables={
                method === 'lmp'
                  ? [
                      { symbol: 'LMP', name: 'Last Menstrual Period', value: referenceDate },
                      { symbol: 'CL', name: 'Average Cycle Length', value: cycleLength, unit: 'days' },
                    ]
                  : method === 'conception'
                    ? [{ symbol: 'CD', name: 'Conception / Ovulation Date', value: referenceDate }]
                    : [{ symbol: 'TD', name: 'IVF Transfer Date', value: referenceDate }]
              }
              activeStep={`EDD = ${calc.eddFormatted} · Gestational age: ${calc.weeksPregnant}w ${calc.extraDays}d (${formatNumberWithPrecision(calc.progressPercent, precision, { autoDecimals: 1, minAutoDecimals: 1, useGrouping: false })}%)`}
            >
              <div className="p-6 rounded-2xl bg-rose-950 text-white dark:border dark:border-rose-900/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 shadow-md">
                <div>
                  <span className="text-xs uppercase tracking-wider text-rose-300 block mb-1">
                    Estimated Due Date (EDD)
                  </span>
                  <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white tabular-nums">
                    {calc.eddFormatted}
                  </span>
                  <span className="text-xs text-rose-200 block mt-1">
                    Currently: <strong className="text-white font-mono">{calc.weeksPregnant} weeks, {calc.extraDays} days</strong> ·{' '}
                    {calc.daysRemaining} days remaining
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors cursor-pointer self-start sm:self-center"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied' : 'Copy EDD'}</span>
                </button>
              </div>
            </FormulaHoverHighlight>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {calc.trimester}
                </span>
                <span className="font-mono text-slate-500">
                  {formatNumberWithPrecision(calc.progressPercent, precision, { autoDecimals: 1, minAutoDecimals: 1, useGrouping: false })}% complete
                </span>
              </div>
              <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full transition-all duration-300"
                  style={{ width: `${calc.progressPercent}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {calc.trimesterStage}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
                Projected Developmental Milestones (ACOG Aligned)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {calc.milestones.map((m, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 flex items-center justify-between"
                  >
                    <span className="text-slate-700 dark:text-slate-300">{m.label}</span>
                    <strong className="font-mono text-slate-900 dark:text-slate-100">{m.date}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
