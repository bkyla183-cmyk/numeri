import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowLeftRight,
  Columns2,
  ExternalLink,
  Share2,
  Check,
  BarChart3,
  Scale,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { calcCategories, calculators } from '../../data';
import { CalculatorItem } from '../../types';
import {
  COMPARISON_PRESETS,
  ComparisonHubProvider,
  ComparisonPaneId,
  ComparisonPaneScope,
  useComparisonHub,
} from '../../context/ComparisonContext';
import { CalculatorEngineRenderer } from './CalculatorEngineRenderer';
import { RoundingPrecisionBar } from './RoundingPrecisionBar';
import { useRoundingPrecision } from '../../context/RoundingPrecisionContext';
import { formatNumberWithPrecision } from '../../utils/roundingPrecision';
import { copyTextToClipboard } from '../../utils/clipboard';
import { NotificationToast } from '../ui/NotificationToast';

interface Props {
  initialLeftSlug?: string;
  initialRightSlug?: string;
  onBack: () => void;
  onOpenCalculator: (slug: string) => void;
  onSyncUrl?: (leftSlug: string, rightSlug: string) => void;
  lang?: 'en' | 'ar';
}

interface PaneSelectorProps {
  pane: ComparisonPaneId;
  title: string;
  accentClass: string;
  selectedSlug: string;
  onChangeSlug: (slug: string) => void;
  onOpenFullTool: (slug: string) => void;
}

const PaneCalculatorHeader: React.FC<PaneSelectorProps> = ({
  pane,
  title,
  accentClass,
  selectedSlug,
  onChangeSlug,
  onOpenFullTool,
}) => {
  const activeCalc = useMemo(
    () => calculators.find((c) => c.slug === selectedSlug) || calculators[0],
    [selectedSlug]
  );

  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const availableCalculators = useMemo(() => {
    const list =
      categoryFilter === 'all'
        ? calculators
        : calculators.filter((c) => c.category_slug === categoryFilter || c.slug === selectedSlug);
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [categoryFilter, selectedSlug]);

  const activeCategory = calcCategories.find((cat) => cat.slug === activeCalc.category_slug);

  return (
    <div className="p-4 sm:p-5 rounded-t-2xl bg-slate-50/90 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`inline-flex items-center px-2 py-0.5 text-[11px] font-mono font-bold uppercase tracking-wider rounded border ${accentClass}`}
          >
            {title}
          </span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
            {activeCategory?.name || activeCalc.category_slug}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onOpenFullTool(activeCalc.slug)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          title={`Open ${activeCalc.name} full page`}
        >
          <span>Full Tool</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
        <div className="sm:col-span-5">
          <label
            htmlFor={`compare-${pane}-category`}
            className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1"
          >
            Domain Filter
          </label>
          <select
            id={`compare-${pane}-category`}
            aria-label={`${title} category filter`}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer"
          >
            <option value="all">All Categories ({calculators.length})</option>
            {calcCategories.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-7">
          <label
            htmlFor={`compare-${pane}-calculator`}
            className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1"
          >
            Selected Calculator
          </label>
          <select
            id={`compare-${pane}-calculator`}
            aria-label={`${title} calculator selector`}
            value={activeCalc.slug}
            onChange={(e) => onChangeSlug(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer"
          >
            {availableCalculators.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

const ComparisonSummaryBoard: React.FC<{
  leftCalc: CalculatorItem;
  rightCalc: CalculatorItem;
}> = ({ leftCalc, rightCalc }) => {
  const hub = useComparisonHub();
  const { precision } = useRoundingPrecision();
  const [showVisualBar, setShowVisualBar] = useState<boolean>(true);

  const left = hub?.snapshots.left ?? null;
  const right = hub?.snapshots.right ?? null;

  const leftVal = left?.primaryNumeric ?? null;
  const rightVal = right?.primaryNumeric ?? null;
  const bothNumeric =
    leftVal !== null && rightVal !== null && Number.isFinite(leftVal) && Number.isFinite(rightVal);

  const diff = bothNumeric ? leftVal - rightVal : null;
  const absDiff = diff !== null ? Math.abs(diff) : null;
  const pctSpread =
    bothNumeric && Math.abs(rightVal) > 1e-9 ? ((leftVal - rightVal) / Math.abs(rightVal)) * 100 : null;
  const ratio =
    bothNumeric && Math.abs(rightVal) > 1e-9 ? leftVal / rightVal : null;

  const formatMetricValue = (n: number) =>
    formatNumberWithPrecision(n, precision, { autoDecimals: 2, useGrouping: true });

  const chartData = useMemo(() => {
    if (!bothNumeric) return [];
    return [
      {
        name: leftCalc.name.replace(/ Calculator$/i, ''),
        value: Number(leftVal.toFixed(6)),
        color: '#4f46e5',
      },
      {
        name: rightCalc.name.replace(/ Calculator$/i, ''),
        value: Number(rightVal.toFixed(6)),
        color: '#0d9488',
      },
    ];
  }, [bothNumeric, leftCalc.name, rightCalc.name, leftVal, rightVal]);

  return (
    <section
      data-comparison-summary
      aria-label="Live side-by-side result comparison"
      className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
            Live Comparison Summary
          </h2>
        </div>

        {bothNumeric && (
          <button
            type="button"
            onClick={() => setShowVisualBar((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer whitespace-nowrap shrink-0 self-start sm:self-auto"
          >
            <BarChart3 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>{showVisualBar ? 'Hide Bar Chart' : 'Show Bar Chart'}</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        {/* Scenario A */}
        <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/60 flex flex-col justify-between gap-2">
          <div className="space-y-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Scenario A · {leftCalc.name}
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {left?.primaryLabel || 'Live calculation inside Left Pane'}
            </p>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums break-words">
            {left ? `${left.primaryDisplay}${left.primaryUnit ? ` ${left.primaryUnit}` : ''}` : 'Active in pane'}
          </div>
        </div>

        {/* Delta / Spread */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between gap-2 text-center">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Net Spread (A vs. B)
          </span>

          {diff !== null && absDiff !== null ? (
            <>
              <div className="text-xl sm:text-2xl font-extrabold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                {diff > 0 ? '+' : diff < 0 ? '-' : ''}
                {formatMetricValue(absDiff)}
              </div>
              <div className="flex items-center justify-center gap-3 text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums flex-wrap">
                {pctSpread !== null && Number.isFinite(pctSpread) && (
                  <span>
                    Spread: {pctSpread > 0 ? '+' : ''}
                    {formatMetricValue(pctSpread)}%
                  </span>
                )}
                {ratio !== null && Number.isFinite(ratio) && (
                  <span>Ratio: {formatMetricValue(ratio)}x</span>
                )}
              </div>
            </>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400 my-auto">
              Review each calculator’s numeric result cards on the left and right panes.
            </p>
          )}
        </div>

        {/* Scenario B */}
        <div className="p-4 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-900/60 flex flex-col justify-between gap-2">
          <div className="space-y-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
              Scenario B · {rightCalc.name}
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {right?.primaryLabel || 'Live calculation inside Right Pane'}
            </p>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums break-words">
            {right ? `${right.primaryDisplay}${right.primaryUnit ? ` ${right.primaryUnit}` : ''}` : 'Active in pane'}
          </div>
        </div>
      </div>

      {/* Visual Side-by-Side Primary Bar Chart */}
      {showVisualBar && chartData.length === 2 && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Primary Output Magnitude Comparison</span>
            <span className="font-mono">Live updated from both panes</span>
          </div>
          <div className="h-[170px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 24, left: 16, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.35} horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(v) => formatMetricValue(Number(v))}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={150}
                  tick={{ fontSize: 12, fontWeight: 600, fill: '#475569' }}
                />
                <Tooltip
                  formatter={(value: any) => [formatMetricValue(Number(value)), 'Primary Output']}
                  contentStyle={{
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(148, 163, 184, 0.35)',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={28}>
                  {chartData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Key Metrics Side-by-Side Table */}
      {((left?.metrics.length ?? 0) > 0 || (right?.metrics.length ?? 0) > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Scenario A Key Breakdown
            </span>
            <div className="grid grid-cols-2 gap-2">
              {left?.metrics.slice(0, 4).map((m, idx) => (
                <div
                  key={idx}
                  className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60"
                >
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{m.label}</div>
                  <div className="text-xs font-bold font-mono text-slate-800 dark:text-slate-100 tabular-nums">
                    {m.display}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
              Scenario B Key Breakdown
            </span>
            <div className="grid grid-cols-2 gap-2">
              {right?.metrics.slice(0, 4).map((m, idx) => (
                <div
                  key={idx}
                  className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60"
                >
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{m.label}</div>
                  <div className="text-xs font-bold font-mono text-slate-800 dark:text-slate-100 tabular-nums">
                    {m.display}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

const SideBySideCompareInner: React.FC<Props> = ({
  initialLeftSlug = 'loan-calculator',
  initialRightSlug = 'savings-goal-calculator',
  onBack,
  onOpenCalculator,
  onSyncUrl,
  lang = 'en',
}) => {
  const [leftSlug, setLeftSlug] = useState<string>(() =>
    calculators.some((c) => c.slug === initialLeftSlug) ? initialLeftSlug : 'loan-calculator'
  );
  const [rightSlug, setRightSlug] = useState<string>(() =>
    calculators.some((c) => c.slug === initialRightSlug) ? initialRightSlug : 'savings-goal-calculator'
  );

  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; variant: 'success' | 'error'; title: string; description?: string }>({
    visible: false,
    variant: 'success',
    title: '',
  });
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (calculators.some((c) => c.slug === initialLeftSlug)) {
      setLeftSlug(initialLeftSlug);
    }
  }, [initialLeftSlug]);

  useEffect(() => {
    if (calculators.some((c) => c.slug === initialRightSlug)) {
      setRightSlug(initialRightSlug);
    }
  }, [initialRightSlug]);

  useEffect(() => {
    onSyncUrl?.(leftSlug, rightSlug);
  }, [leftSlug, rightSlug, onSyncUrl]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const leftCalc = useMemo(
    () => calculators.find((c) => c.slug === leftSlug) || calculators[0],
    [leftSlug]
  );
  const rightCalc = useMemo(
    () => calculators.find((c) => c.slug === rightSlug) || calculators[1] || calculators[0],
    [rightSlug]
  );

  const handleSwap = () => {
    setLeftSlug(rightSlug);
    setRightSlug(leftSlug);
  };

  const handleShareComparison = async () => {
    const origin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : '';
    const compareUrl = `${origin}/compare?left=${encodeURIComponent(leftCalc.slug)}&right=${encodeURIComponent(
      rightCalc.slug
    )}`;
    const ok = await copyTextToClipboard(compareUrl);
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);

    if (ok) {
      setCopied(true);
      setToast({
        visible: true,
        variant: 'success',
        title: `Comparison link copied (${leftCalc.name} vs ${rightCalc.name})`,
        description: compareUrl,
      });
    } else {
      setCopied(false);
      setToast({
        visible: true,
        variant: 'error',
        title: 'Clipboard access blocked',
        description: compareUrl,
      });
    }

    timerRef.current = window.setTimeout(() => {
      setCopied(false);
      setToast((prev) => ({ ...prev, visible: false }));
      timerRef.current = null;
    }, 3500);
  };

  return (
    <div data-compare-workspace className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-10 space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'العودة إلى الحاسبات' : 'Back to Calculators'}</span>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/10 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center shrink-0">
              <Columns2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
                {lang === 'ar' ? 'مقارنة الحاسبات جنباً إلى جنب' : 'Side-by-Side Calculator'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                {lang === 'ar'
                  ? 'اختر أي حاسبتين لمقارنة النتائج المالية والعلمية مباشرة في نافذة مقسّمة.'
                  : 'Run two calculators in parallel to compare outputs in real time — ideal for Loan vs. Savings or Mortgage vs. Investing.'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            data-swap-panes-button
            onClick={handleSwap}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-500" />
            <span>Swap Panes</span>
          </button>

          <button
            type="button"
            onClick={handleShareComparison}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              copied
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copied!' : 'Share Comparison'}</span>
          </button>
        </div>
      </div>

      {/* Finance & Multi-Domain Comparison Presets */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
          Quick Comparison Presets
        </span>
        <div className="flex flex-wrap gap-2">
          {COMPARISON_PRESETS.map((preset) => {
            const isActive = leftSlug === preset.leftSlug && rightSlug === preset.rightSlug;
            return (
              <button
                key={preset.id}
                type="button"
                data-preset-id={preset.id}
                onClick={() => {
                  setLeftSlug(preset.leftSlug);
                  setRightSlug(preset.rightSlug);
                }}
                title={preset.summary}
                className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Shared Rounding Precision Controls */}
      <RoundingPrecisionBar />

      {/* Live Comparison Summary Board */}
      <ComparisonSummaryBoard leftCalc={leftCalc} rightCalc={rightCalc} />

      {/* Split-Pane Calculators Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        {/* Left Pane (Scenario A) */}
        <section
          data-compare-pane="left"
          aria-label="Left calculator pane"
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs"
        >
          <PaneCalculatorHeader
            pane="left"
            title="Scenario A"
            accentClass="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
            selectedSlug={leftCalc.slug}
            onChangeSlug={setLeftSlug}
            onOpenFullTool={onOpenCalculator}
          />
          <div className="p-4 sm:p-5">
            <ComparisonPaneScope pane="left">
              <CalculatorEngineRenderer key={`left-${leftCalc.slug}`} calculator={leftCalc} />
            </ComparisonPaneScope>
          </div>
        </section>

        {/* Right Pane (Scenario B) */}
        <section
          data-compare-pane="right"
          aria-label="Right calculator pane"
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs"
        >
          <PaneCalculatorHeader
            pane="right"
            title="Scenario B"
            accentClass="bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800"
            selectedSlug={rightCalc.slug}
            onChangeSlug={setRightSlug}
            onOpenFullTool={onOpenCalculator}
          />
          <div className="p-4 sm:p-5">
            <ComparisonPaneScope pane="right">
              <CalculatorEngineRenderer key={`right-${rightCalc.slug}`} calculator={rightCalc} />
            </ComparisonPaneScope>
          </div>
        </section>
      </div>

      <NotificationToast
        visible={toast.visible}
        variant={toast.variant}
        title={toast.title}
        description={toast.description}
        onDismiss={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
    </div>
  );
};

export const SideBySideCompareView: React.FC<Props> = (props) => {
  return (
    <ComparisonHubProvider>
      <SideBySideCompareInner {...props} />
    </ComparisonHubProvider>
  );
};
