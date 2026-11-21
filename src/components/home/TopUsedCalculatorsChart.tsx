import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import { BarChart3, ArrowRight, Calculator } from 'lucide-react';
import { CalculatorItem } from '../../types';
import { CalcUsageMap, getFeaturedAndTrendingEntries } from '../../utils/usageTracker';

interface Props {
  calculators: CalculatorItem[];
  usageStats: CalcUsageMap;
  onSelectCalculator: (slug: string) => void;
  lang?: 'en' | 'ar';
}

interface ChartDatum {
  rank: number;
  slug: string;
  name: string;
  shortName: string;
  category: string;
  count: number;
  sharePct: number;
}

const BAR_COLORS = ['#0d9488', '#14b8a6', '#4f46e5', '#6366f1', '#64748b'];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ChartDatum }>;
  lang: 'en' | 'ar';
}

const ChartTooltip: React.FC<CustomTooltipProps> = ({ active, payload, lang }) => {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0].payload;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 shadow-lg text-xs space-y-1 max-w-[230px]">
      <div className="font-semibold text-slate-900 dark:text-slate-100 leading-snug">
        #{item.rank} {item.name}
      </div>
      <div className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">
        {item.category}
      </div>
      <div className="pt-1 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 font-mono tabular-nums">
        <span className="font-bold text-teal-600 dark:text-teal-400">
          {lang === 'ar'
            ? `${item.count} استخدام`
            : `${item.count} ${item.count === 1 ? 'use' : 'uses'}`}
        </span>
        <span className="text-slate-500 dark:text-slate-400">
          {item.sharePct}% {lang === 'ar' ? 'حصة' : 'share'}
        </span>
      </div>
    </div>
  );
};

export const TopUsedCalculatorsChart: React.FC<Props> = ({
  calculators,
  usageStats,
  onSelectCalculator,
  lang = 'en',
}) => {
  const { trendingEntries, totalUses } = useMemo(
    () => getFeaturedAndTrendingEntries(calculators, usageStats, 5),
    [calculators, usageStats]
  );

  const topFiveData: ChartDatum[] = useMemo(() => {
    return trendingEntries.slice(0, 5).map((entry, idx) => ({
      rank: idx + 1,
      slug: entry.calculator.slug,
      name: entry.calculator.name,
      shortName: entry.calculator.name.replace(/\s+Calculator$/i, ''),
      category: entry.calculator.category_slug.replace(/-/g, ' '),
      count: entry.usageCount,
      sharePct: totalUses > 0 ? Math.round((entry.usageCount / totalUses) * 100) : 0,
    }));
  }, [trendingEntries, totalUses]);

  const starterTools = useMemo(() => {
    const preferredSlugs = [
      'mortgage-calculator',
      'bmi-calculator',
      'percentage-calculator',
      'compound-interest-calculator',
    ];
    return preferredSlugs
      .map((slug) => calculators.find((c) => c.slug === slug))
      .filter((c): c is CalculatorItem => Boolean(c));
  }, [calculators]);

  const hasData = topFiveData.length > 0;
  const topShare = hasData ? topFiveData[0].sharePct : 0;

  return (
    <section
      className="space-y-5"
      aria-labelledby="top-used-chart-heading"
    >
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>
              {lang === 'ar' ? 'إحصائيات الاستخدام التفاعلية' : 'Live Local Activity Analytics'}
            </span>
          </div>
          <h2
            id="top-used-chart-heading"
            className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100"
          >
            {lang === 'ar' ? 'أكثر 5 حاسبات استخداماً' : 'Top 5 Most Used Calculators'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'ar'
              ? 'رسم بياني ديناميكي يعرض أكثر الأدوات استخداماً استناداً إلى سجل التصفح المحلي'
              : 'Dynamic frequency distribution computed from localStorage usage history across Numeriq tools'}
          </p>
        </div>

        {hasData && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
            <span>
              {lang === 'ar'
                ? `${totalUses} إجمالي الفتح`
                : `${totalUses.toLocaleString()} total ${totalUses === 1 ? 'run' : 'runs'}`}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {lang === 'ar'
                ? `${trendingEntries.length} أدوات متتبعة`
                : `${trendingEntries.length} tracked ${trendingEntries.length === 1 ? 'tool' : 'tools'}`}
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-teal-700 dark:text-teal-400 font-semibold">
              {lang === 'ar' ? `الحصة الأعلى ${topShare}%` : `Top share ${topShare}%`}
            </span>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs">
        {hasData ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            {/* Recharts Horizontal Bar Visualization */}
            <div className="lg:col-span-7">
              <div className="w-full h-[260px] sm:h-[280px]" role="img" aria-label="Bar chart of top 5 most used calculators">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart
                    data={topFiveData}
                    layout="vertical"
                    margin={{ top: 8, right: 42, left: 4, bottom: 8 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke="rgba(148, 163, 184, 0.25)"
                    />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="shortName"
                      width={136}
                      tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(13, 148, 136, 0.08)' }}
                      content={<ChartTooltip lang={lang} />}
                    />
                    <Bar
                      dataKey="count"
                      radius={[0, 6, 6, 0]}
                      maxBarSize={30}
                      className="cursor-pointer"
                      onClick={(data) => {
                        const slug = (data as unknown as { slug?: string })?.slug;
                        if (slug) onSelectCalculator(slug);
                      }}
                    >
                      {topFiveData.map((entry, idx) => (
                        <Cell
                          key={entry.slug}
                          fill={BAR_COLORS[idx % BAR_COLORS.length]}
                        />
                      ))}
                      <LabelList
                        dataKey="count"
                        position="right"
                        fill="#64748b"
                        fontSize={11}
                        fontWeight={600}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Clean Hairline-Separated Ranked Breakdown */}
            <div className="lg:col-span-5 divide-y divide-slate-100 dark:divide-slate-800 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 pt-4 lg:pt-0 lg:pl-6">
              {topFiveData.map((item) => (
                <a
                  key={item.slug}
                  href={`/calculator/${item.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectCalculator(item.slug);
                  }}
                  className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 group text-xs transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono font-semibold text-slate-400 dark:text-slate-500 tabular-nums w-5 shrink-0">
                      #{item.rank}
                    </span>
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 truncate transition-colors">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 capitalize truncate">
                        {item.category}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 font-mono tabular-nums">
                    <div className="text-right">
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {item.count}
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500">
                        {item.sharePct}%
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-8 px-4 text-center space-y-4">
            <div className="mx-auto w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {lang === 'ar'
                  ? 'لا توجد بيانات استخدام مسجلة بعد'
                  : 'No local usage activity recorded yet'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {lang === 'ar'
                  ? 'افتح أي حاسبة لبدء تتبع أكثر 5 أدوات استخداماً وعرضها في هذا الرسم البياني فوراً.'
                  : 'Open any calculator to start populating this live Recharts breakdown of your top 5 most used tools.'}
              </p>
            </div>
            {starterTools.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                {starterTools.map((tool) => (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => onSelectCalculator(tool.slug)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-teal-400 dark:hover:border-teal-500 hover:text-teal-700 dark:hover:text-teal-300 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <span>{tool.name}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
