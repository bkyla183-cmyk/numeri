import React, { useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import { AngleMode } from '../../utils/scientificParser';
import { buildScientificPlotSeries } from '../../utils/chartBuilder';
import { formatNumberWithPrecision } from '../../utils/roundingPrecision';
import { useRoundingPrecision } from '../../context/RoundingPrecisionContext';

/* ============================================================================
 * 1. MORTGAGE INTERACTIVE CHART
 * ============================================================================ */

interface MortgageChartProps {
  principal: number;
  totalMonthlyPayment: number;
  totalInterest: number;
  monthlyPI: number;
  monthlyTax: number;
  monthlyIns: number;
  monthlyPMI: number;
  monthlyHoa: number;
  schedule: {
    year: number;
    principalPaid: number;
    interestPaid: number;
    remainingBalance: number;
  }[];
  formatCurrency: (val: number) => string;
}

export const MortgageChartView: React.FC<MortgageChartProps> = ({
  principal,
  totalMonthlyPayment,
  totalInterest,
  monthlyPI,
  monthlyTax,
  monthlyIns,
  monthlyPMI,
  monthlyHoa,
  schedule,
  formatCurrency,
}) => {
  const [subMode, setSubMode] = useState<'amortization' | 'piti'>('amortization');

  const amortizationData = useMemo(() => {
    let cumPrincipal = 0;
    let cumInterest = 0;
    const rows = [
      {
        label: 'Yr 0',
        year: 0,
        remainingBalance: principal,
        cumulativePrincipal: 0,
        cumulativeInterest: 0,
      },
    ];
    for (const r of schedule) {
      cumPrincipal += r.principalPaid;
      cumInterest += r.interestPaid;
      rows.push({
        label: `Yr ${r.year}`,
        year: r.year,
        remainingBalance: r.remainingBalance,
        cumulativePrincipal: cumPrincipal,
        cumulativeInterest: cumInterest,
      });
    }
    return rows;
  }, [schedule, principal]);

  const pitiData = useMemo(() => {
    const items = [
      { name: 'Principal & Interest', value: monthlyPI, color: '#4f46e5' },
      { name: 'Property Tax', value: monthlyTax, color: '#0d9488' },
      { name: 'Home Insurance', value: monthlyIns, color: '#0284c7' },
      { name: 'PMI', value: monthlyPMI, color: '#d97706' },
      { name: 'HOA Dues', value: monthlyHoa, color: '#64748b' },
    ];
    return items.map((item) => ({
      ...item,
      sharePct: totalMonthlyPayment > 0 ? (item.value / totalMonthlyPayment) * 100 : 0,
    }));
  }, [monthlyPI, monthlyTax, monthlyIns, monthlyPMI, monthlyHoa, totalMonthlyPayment]);

  const formatAxisDollar = (v: number) => {
    const num = Number(v);
    if (Math.abs(num) >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
    if (Math.abs(num) >= 1_000) return `$${(num / 1_000).toFixed(0)}k`;
    return `$${Math.round(num)}`;
  };

  return (
    <div
      data-mortgage-chart-view
      className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-700/80">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400 block">
            Total Monthly Payment
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
            {formatCurrency(totalMonthlyPayment)}
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-2">
              Lifetime Interest: {formatCurrency(totalInterest)}
            </span>
          </div>
        </div>

        <div
          role="group"
          aria-label="Mortgage chart type"
          className="inline-flex items-center gap-0.5 p-1 rounded-lg bg-slate-200/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 self-start sm:self-center"
        >
          <button
            type="button"
            aria-pressed={subMode === 'amortization'}
            onClick={() => setSubMode('amortization')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              subMode === 'amortization'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Amortization Curve
          </button>
          <button
            type="button"
            aria-pressed={subMode === 'piti'}
            onClick={() => setSubMode('piti')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              subMode === 'piti'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Monthly PITI Split
          </button>
        </div>
      </div>

      {subMode === 'amortization' ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-300">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-indigo-600 inline-block" aria-hidden="true" />
              Remaining Loan Balance
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-teal-600 inline-block" aria-hidden="true" />
              Cumulative Principal Paid
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-rose-500 inline-block" aria-hidden="true" />
              Cumulative Interest Paid
            </span>
          </div>

          <div
            className="w-full h-[290px] sm:h-[320px]"
            role="img"
            aria-label="Mortgage remaining balance vs cumulative principal and interest chart"
          >
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart
                data={amortizationData}
                margin={{ top: 10, right: 16, left: 6, bottom: 8 }}
              >
                <defs>
                  <linearGradient id="mtgBalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="mtgPrinGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.22)" />
                <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={68}
                  tickFormatter={formatAxisDollar}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const row = payload[0].payload as {
                      label: string;
                      remainingBalance: number;
                      cumulativePrincipal: number;
                      cumulativeInterest: number;
                    };
                    return (
                      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 shadow-lg text-xs space-y-1">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{row.label}</div>
                        <div className="font-mono tabular-nums text-indigo-600 dark:text-indigo-400">
                          Balance: {formatCurrency(row.remainingBalance)}
                        </div>
                        <div className="font-mono tabular-nums text-teal-600 dark:text-teal-400">
                          Principal Paid: {formatCurrency(row.cumulativePrincipal)}
                        </div>
                        <div className="font-mono tabular-nums text-rose-600 dark:text-rose-400">
                          Interest Paid: {formatCurrency(row.cumulativeInterest)}
                        </div>
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="remainingBalance"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  fill="url(#mtgBalGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="cumulativePrincipal"
                  stroke="#0d9488"
                  strokeWidth={2}
                  fill="url(#mtgPrinGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="cumulativeInterest"
                  stroke="#e11d48"
                  strokeWidth={2}
                  fillOpacity={0}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div
          className="w-full h-[270px] sm:h-[300px]"
          role="img"
          aria-label="Monthly mortgage PITI payment breakdown bar chart"
        >
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart
              data={pitiData}
              layout="vertical"
              margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(148, 163, 184, 0.22)" />
              <XAxis
                type="number"
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={formatAxisDollar}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={132}
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: 'rgba(13, 148, 136, 0.08)' }}
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const item = payload[0].payload as { name: string; value: number; sharePct: number };
                  return (
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 shadow-lg text-xs space-y-1">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{item.name}</div>
                      <div className="font-mono tabular-nums font-bold text-teal-600 dark:text-teal-400">
                        {formatCurrency(item.value)}/mo ({item.sharePct.toFixed(1)}%)
                      </div>
                    </div>
                  );
                }}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={28}>
                {pitiData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

/* ============================================================================
 * 2. COMPOUND INTEREST INTERACTIVE CHART
 * ============================================================================ */

interface CompoundChartProps {
  initialPrincipal: number;
  futureValue: number;
  realFutureValue: number;
  totalDeposited: number;
  totalInterest: number;
  hasInflation: boolean;
  schedule: {
    year: number;
    principal: number;
    interest: number;
    balance: number;
    realBalance: number;
  }[];
  formatCurrency: (val: number) => string;
}

export const CompoundInterestChartView: React.FC<CompoundChartProps> = ({
  initialPrincipal,
  futureValue,
  realFutureValue,
  totalDeposited,
  totalInterest,
  hasInflation,
  schedule,
  formatCurrency,
}) => {
  const chartData = useMemo(() => {
    const rows = [
      {
        label: 'Yr 0',
        year: 0,
        principal: initialPrincipal,
        interest: 0,
        balance: initialPrincipal,
        realBalance: initialPrincipal,
      },
      ...schedule.map((r) => ({
        label: `Yr ${r.year}`,
        year: r.year,
        principal: r.principal,
        interest: r.interest,
        balance: r.balance,
        realBalance: r.realBalance,
      })),
    ];
    return rows;
  }, [schedule, initialPrincipal]);

  const formatAxisDollar = (v: number) => {
    const num = Number(v);
    if (Math.abs(num) >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
    if (Math.abs(num) >= 1_000) return `$${(num / 1_000).toFixed(0)}k`;
    return `$${Math.round(num)}`;
  };

  return (
    <div
      data-compound-chart-view
      className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-700/80">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 block">
            Projected Portfolio Growth Trajectory
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
            {formatCurrency(futureValue)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums mt-0.5">
            Principal: {formatCurrency(totalDeposited)} · Interest: {formatCurrency(totalInterest)}
            {hasInflation ? ` · Real: ${formatCurrency(realFutureValue)}` : ''}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-indigo-600 inline-block" aria-hidden="true" />
            Contributed
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block" aria-hidden="true" />
            Compound Interest
          </span>
          {hasInflation && (
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-amber-500 inline-block" aria-hidden="true" />
              Real Value
            </span>
          )}
        </div>
      </div>

      <div
        className="w-full h-[290px] sm:h-[320px]"
        role="img"
        aria-label="Stacked compound interest growth trajectory over time"
      >
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 16, left: 6, bottom: 8 }}
          >
            <defs>
              <linearGradient id="ciPrincipalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="ciInterestGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.38} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.06} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.22)" />
            <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={68}
              tickFormatter={formatAxisDollar}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const row = payload[0].payload as {
                  label: string;
                  principal: number;
                  interest: number;
                  balance: number;
                  realBalance: number;
                };
                return (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 shadow-lg text-xs space-y-1">
                    <div className="font-bold text-slate-900 dark:text-slate-100">{row.label}</div>
                    <div className="font-mono tabular-nums text-slate-900 dark:text-slate-100 font-semibold">
                      Total: {formatCurrency(row.balance)}
                    </div>
                    <div className="font-mono tabular-nums text-indigo-600 dark:text-indigo-400">
                      Principal: {formatCurrency(row.principal)}
                    </div>
                    <div className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                      Interest: +{formatCurrency(row.interest)}
                    </div>
                    {hasInflation && (
                      <div className="font-mono tabular-nums text-amber-600 dark:text-amber-400">
                        Real Value: {formatCurrency(row.realBalance)}
                      </div>
                    )}
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="principal"
              stackId="1"
              stroke="#4f46e5"
              strokeWidth={2}
              fill="url(#ciPrincipalGrad)"
            />
            <Area
              type="monotone"
              dataKey="interest"
              stackId="1"
              stroke="#10b981"
              strokeWidth={2.5}
              fill="url(#ciInterestGrad)"
            />
            {hasInflation && (
              <Line
                type="monotone"
                dataKey="realBalance"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

/* ============================================================================
 * 3. SCIENTIFIC CALCULATOR INTERACTIVE CHART
 * ============================================================================ */

interface ScientificChartProps {
  expression: string;
  displayedResult: string;
  angleMode: AngleMode;
  ans: number;
  history: { expr: string; res: string; numericVal?: number }[];
  onSelectPreset: (expr: string) => void;
}

const SCIENTIFIC_PRESETS = ['sin(45)', 'cos(60)', 'log(100)', 'sqrt(25)', 'exp(2)'];

export const ScientificChartView: React.FC<ScientificChartProps> = ({
  expression,
  displayedResult,
  angleMode,
  ans,
  history,
  onSelectPreset,
}) => {
  const { precision } = useRoundingPrecision();
  const [subMode, setSubMode] = useState<'curve' | 'history'>('curve');

  const activeExpression = expression.trim() || history[0]?.expr || '';
  const plotData = useMemo(
    () => buildScientificPlotSeries(activeExpression, angleMode, ans),
    [activeExpression, angleMode, ans]
  );

  const historyBars = useMemo(() => {
    return history
      .filter((h) => h.numericVal !== undefined && Number.isFinite(h.numericVal))
      .slice(0, 6)
      .reverse()
      .map((h, idx) => ({
        index: idx + 1,
        label: h.expr.length > 16 ? `${h.expr.slice(0, 14)}…` : h.expr,
        fullExpr: h.expr,
        value: h.numericVal as number,
      }));
  }, [history]);

  const fmtVal = (v: number) =>
    formatNumberWithPrecision(v, precision, { autoDecimals: 5, trimTrailingZeros: true, useGrouping: false });

  const currentPoint = plotData?.points.find((p) => p.isCurrent);

  return (
    <div
      data-scientific-chart-view
      className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="min-w-0">
          <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-400 block">
            {plotData ? plotData.sweepLabel : 'Live Function & Evaluation Plot'} ({angleMode.toUpperCase()})
          </span>
          <div className="text-xl sm:text-2xl font-extrabold font-mono text-white tabular-nums truncate">
            {activeExpression ? `${activeExpression} = ${displayedResult}` : 'Select or enter an expression'}
          </div>
        </div>

        {historyBars.length >= 2 && (
          <div
            role="group"
            aria-label="Scientific chart mode"
            className="inline-flex items-center gap-0.5 p-1 rounded-lg bg-slate-900 border border-slate-700 self-start sm:self-center"
          >
            <button
              type="button"
              aria-pressed={subMode === 'curve'}
              onClick={() => setSubMode('curve')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                subMode === 'curve' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              Function Curve
            </button>
            <button
              type="button"
              aria-pressed={subMode === 'history'}
              onClick={() => setSubMode('history')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                subMode === 'history' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              History ({historyBars.length})
            </button>
          </div>
        )}
      </div>

      {subMode === 'history' && historyBars.length >= 2 ? (
        <div
          className="w-full h-[250px]"
          role="img"
          aria-label="Bar chart of evaluated scientific calculation history"
        >
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={historyBars} margin={{ top: 10, right: 16, left: 6, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.16)" />
              <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={56} />
              <Tooltip
                cursor={{ fill: 'rgba(99, 102, 241, 0.12)' }}
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const item = payload[0].payload as { fullExpr: string; value: number };
                  return (
                    <div className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 shadow-lg text-xs space-y-1">
                      <div className="font-mono text-slate-300">{item.fullExpr}</div>
                      <div className="font-mono font-bold text-teal-400 tabular-nums">= {fmtVal(item.value)}</div>
                    </div>
                  );
                }}
              />
              <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : plotData ? (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
            <span>Template: f(x) = {plotData.sweptExprTemplate}</span>
            <span className="tabular-nums text-teal-400">
              Point: x = {fmtVal(plotData.currentX)} → y = {fmtVal(plotData.currentY)}
            </span>
          </div>

          <div
            className="w-full h-[250px]"
            role="img"
            aria-label={`Live plot for ${plotData.sweptExprTemplate}`}
          >
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={plotData.points} margin={{ top: 12, right: 16, left: 4, bottom: 8 }}>
                <defs>
                  <linearGradient id="sciPlotGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.16)" />
                <XAxis
                  dataKey="xLabel"
                  interval="preserveStartEnd"
                  minTickGap={24}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={56}
                  tickFormatter={(v) => Number(Number(v).toFixed(2)).toString()}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const pt = payload[0].payload as { x: number; y: number; isCurrent: boolean };
                    return (
                      <div className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 shadow-lg text-xs space-y-1">
                        <div className="font-mono text-indigo-300 tabular-nums">
                          x = {fmtVal(pt.x)}{angleMode === 'deg' && /\b(sin|cos|tan)\b/i.test(activeExpression) ? '°' : ''}
                        </div>
                        <div className="font-mono font-bold text-teal-400 tabular-nums">
                          f(x) = {fmtVal(pt.y)}
                        </div>
                        {pt.isCurrent && (
                          <div className="text-[11px] text-emerald-400">Evaluated input</div>
                        )}
                      </div>
                    );
                  }}
                />
                {currentPoint && (
                  <ReferenceLine
                    x={currentPoint.xLabel}
                    stroke="#818cf8"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="y"
                  stroke="#14b8a6"
                  strokeWidth={2.5}
                  fill="url(#sciPlotGrad)"
                  dot={(props) => {
                    const { cx, cy, payload } = props as {
                      cx?: number;
                      cy?: number;
                      payload?: { isCurrent?: boolean };
                    };
                    if (cx === undefined || cy === undefined || !payload?.isCurrent) return <g />;
                    return (
                      <circle
                        key={`sci-active-${cx}-${cy}`}
                        cx={cx}
                        cy={cy}
                        r={5}
                        fill="#818cf8"
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    );
                  }}
                  activeDot={{ r: 5, fill: '#14b8a6', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="py-8 px-4 text-center space-y-3">
          <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
            Type a scientific expression (or select an example below) to plot a live function curve around your input value.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {SCIENTIFIC_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onSelectPreset(preset)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono font-semibold text-teal-300 transition-colors cursor-pointer"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
