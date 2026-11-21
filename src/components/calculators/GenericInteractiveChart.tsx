import React, { useMemo, useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import { CalculatorSpec, CalculationResult, InputDef } from '../../data/calculatorRegistry/types';
import {
  buildSpecSensitivitySeries,
  parseChartNumericValue,
} from '../../utils/chartBuilder';
import { useRoundingPrecision } from '../../context/RoundingPrecisionContext';
import { formatNumberWithPrecision } from '../../utils/roundingPrecision';

interface Props {
  spec?: CalculatorSpec;
  inputs: Record<string, unknown>;
  calculation: CalculationResult;
  calculatorName: string;
  formattedPrimaryValue: string;
  primaryUnitLabel: string;
}

const BAR_PALETTE = ['#0d9488', '#4f46e5', '#0284c7', '#10b981', '#6366f1', '#64748b'];

export const GenericInteractiveChart: React.FC<Props> = ({
  spec,
  inputs,
  calculation,
  calculatorName,
  formattedPrimaryValue,
  primaryUnitLabel,
}) => {
  const { precision } = useRoundingPrecision();

  const numericInputs: InputDef[] = useMemo(() => {
    if (!spec) return [];
    return spec.inputs.filter((inp) => {
      if (inp.type !== 'number') return false;
      if (inp.visibleWhen && !inp.visibleWhen(inputs)) return false;
      const raw = inputs[inp.id] !== undefined ? inputs[inp.id] : inp.defaultValue;
      return Number.isFinite(Number(raw));
    });
  }, [spec, inputs]);

  const [selectedInputId, setSelectedInputId] = useState<string>(() => numericInputs[0]?.id || '');
  const [chartType, setChartType] = useState<'curve' | 'metrics'>('curve');

  useEffect(() => {
    if (!numericInputs.some((i) => i.id === selectedInputId)) {
      setSelectedInputId(numericInputs[0]?.id || '');
    }
  }, [numericInputs, selectedInputId]);

  const sensitivity = useMemo(() => {
    if (!spec) return null;
    return buildSpecSensitivitySeries(spec, inputs, selectedInputId);
  }, [spec, inputs, selectedInputId]);

  const metricBars = useMemo(() => {
    if (!calculation.secondaryOutputs) return [];
    return calculation.secondaryOutputs
      .map((sec) => {
        const val = parseChartNumericValue(sec.value);
        if (val === null) return null;
        return {
          name: sec.label.length > 22 ? `${sec.label.slice(0, 20)}…` : sec.label,
          fullName: sec.label,
          value: val,
          unit: sec.unit || '',
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .slice(0, 8);
  }, [calculation.secondaryOutputs]);

  useEffect(() => {
    if (!sensitivity && metricBars.length > 0) {
      setChartType('metrics');
    } else if (sensitivity && chartType === 'metrics' && metricBars.length === 0) {
      setChartType('curve');
    }
  }, [sensitivity, metricBars.length, chartType]);

  const fmtVal = (n: number) =>
    formatNumberWithPrecision(n, precision, { autoDecimals: 4, trimTrailingZeros: true });

  const currentPoint = sensitivity?.points.find((p) => p.isCurrent);

  if (calculation.error) {
    return (
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-400">
        Correct the input validation notice above to render the interactive chart visualization.
      </div>
    );
  }

  return (
    <div
      data-generic-chart-view
      className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-5"
    >
      {/* Chart Header Summary & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-700/80">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400 block">
            {primaryUnitLabel}
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
            {formattedPrimaryValue}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {sensitivity && numericInputs.length > 1 && chartType === 'curve' && (
            <div className="flex items-center gap-1.5">
              <label
                htmlFor="chart-sweep-input-select"
                className="text-[11px] font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap"
              >
                Vary input:
              </label>
              <select
                id="chart-sweep-input-select"
                value={selectedInputId}
                onChange={(e) => setSelectedInputId(e.target.value)}
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                {numericInputs.map((inp) => (
                  <option key={inp.id} value={inp.id}>
                    {inp.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {sensitivity && metricBars.length >= 2 && (
            <div
              role="group"
              aria-label="Chart visualization type"
              className="inline-flex items-center gap-0.5 p-1 rounded-lg bg-slate-200/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
            >
              <button
                type="button"
                aria-pressed={chartType === 'curve'}
                onClick={() => setChartType('curve')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  chartType === 'curve'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Sensitivity Curve
              </button>
              <button
                type="button"
                aria-pressed={chartType === 'metrics'}
                onClick={() => setChartType('metrics')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  chartType === 'metrics'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Metrics Bar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Chart Viewport */}
      {chartType === 'curve' && sensitivity ? (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>
              Live sensitivity of <strong className="text-slate-800 dark:text-slate-200">{primaryUnitLabel}</strong> vs.{' '}
              <strong className="text-teal-700 dark:text-teal-400">{sensitivity.input.label}</strong>
            </span>
            <span className="font-mono tabular-nums">
              Current: {fmtVal(sensitivity.currentX)}{sensitivity.input.unit ? ` ${sensitivity.input.unit}` : ''} → {fmtVal(sensitivity.currentY)}
            </span>
          </div>

          <div
            className="w-full h-[270px] sm:h-[300px]"
            role="img"
            aria-label={`Interactive sensitivity chart for ${calculatorName}`}
          >
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart
                data={sensitivity.points}
                margin={{ top: 12, right: 16, left: 6, bottom: 8 }}
              >
                <defs>
                  <linearGradient id="numeriqTealGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.22)" />
                <XAxis
                  dataKey="xLabel"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={68}
                  tickFormatter={(v) => {
                    const num = Number(v);
                    if (Math.abs(num) >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
                    if (Math.abs(num) >= 10_000) return `${(num / 1_000).toFixed(0)}k`;
                    return Number(num.toFixed(2)).toString();
                  }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const pt = payload[0].payload as { x: number; y: number; isCurrent: boolean };
                    return (
                      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 shadow-lg text-xs space-y-1">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {sensitivity.input.label}:{' '}
                          <span className="font-mono tabular-nums text-indigo-600 dark:text-indigo-400">
                            {fmtVal(pt.x)}{sensitivity.input.unit ? ` ${sensitivity.input.unit}` : ''}
                          </span>
                        </div>
                        <div className="font-mono tabular-nums text-teal-700 dark:text-teal-400 font-bold">
                          Result: {fmtVal(pt.y)}
                        </div>
                        {pt.isCurrent && (
                          <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                            Active input point
                          </div>
                        )}
                      </div>
                    );
                  }}
                />
                {currentPoint && (
                  <ReferenceLine
                    x={currentPoint.xLabel}
                    stroke="#4f46e5"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="y"
                  stroke="#0d9488"
                  strokeWidth={2.5}
                  fill="url(#numeriqTealGrad)"
                  dot={(props) => {
                    const { cx, cy, payload } = props as {
                      cx?: number;
                      cy?: number;
                      payload?: { isCurrent?: boolean };
                    };
                    if (cx === undefined || cy === undefined) return <g />;
                    if (payload?.isCurrent) {
                      return (
                        <circle
                          key={`dot-${cx}-${cy}`}
                          cx={cx}
                          cy={cy}
                          r={5}
                          fill="#4f46e5"
                          stroke="#ffffff"
                          strokeWidth={2}
                        />
                      );
                    }
                    return (
                      <circle
                        key={`dot-${cx}-${cy}`}
                        cx={cx}
                        cy={cy}
                        r={2.5}
                        fill="#0d9488"
                      />
                    );
                  }}
                  activeDot={{ r: 5, fill: '#0d9488', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : metricBars.length >= 1 ? (
        <div className="space-y-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Live numeric comparison across calculated breakdown metrics
          </p>
          <div
            className="w-full h-[270px] sm:h-[300px]"
            role="img"
            aria-label={`Metrics comparison bar chart for ${calculatorName}`}
          >
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart
                data={metricBars}
                layout="vertical"
                margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(148, 163, 184, 0.22)" />
                <XAxis
                  type="number"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={130}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(13, 148, 136, 0.08)' }}
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const item = payload[0].payload as { fullName: string; value: number; unit: string };
                    return (
                      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 shadow-lg text-xs space-y-1">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{item.fullName}</div>
                        <div className="font-mono tabular-nums font-bold text-teal-700 dark:text-teal-400">
                          {fmtVal(item.value)} {item.unit}
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={28}>
                  {metricBars.map((_, idx) => (
                    <Cell key={idx} fill={BAR_PALETTE[idx % BAR_PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="py-10 text-center text-xs text-slate-500 dark:text-slate-400">
          Enter numeric input parameters above to render a live chart for {calculatorName}.
        </div>
      )}
    </div>
  );
};
