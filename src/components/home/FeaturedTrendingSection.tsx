import React, { useMemo, useState } from 'react';
import { CalculatorItem } from '../../types';
import {
  CalcUsageMap,
  FeaturedTrendingEntry,
  getFeaturedAndTrendingEntries,
} from '../../utils/usageTracker';
import { ArrowRight, RotateCcw, TrendingUp } from 'lucide-react';

interface Props {
  calculators: CalculatorItem[];
  usageStats: CalcUsageMap;
  onSelectCalculator: (slug: string) => void;
  onClearUsage: () => void;
  lang?: 'en' | 'ar';
}

type FilterMode = 'all' | 'trending' | 'featured';

export const FeaturedTrendingSection: React.FC<Props> = ({
  calculators,
  usageStats,
  onSelectCalculator,
  onClearUsage,
  lang = 'en',
}) => {
  const [filterMode, setFilterMode] = useState<FilterMode>('all');

  const { entries, trendingEntries, featuredEntries, totalUses } = useMemo(
    () => getFeaturedAndTrendingEntries(calculators, usageStats, 6),
    [calculators, usageStats]
  );

  const hasPersonalHistory = trendingEntries.length > 0;
  const activeFilter: FilterMode = !hasPersonalHistory && filterMode === 'trending' ? 'all' : filterMode;

  const displayedEntries: FeaturedTrendingEntry[] = useMemo(() => {
    if (activeFilter === 'trending') return trendingEntries.slice(0, 6);
    if (activeFilter === 'featured') return featuredEntries.slice(0, 6);
    return entries;
  }, [activeFilter, entries, trendingEntries, featuredEntries]);

  return (
    <section className="space-y-6" aria-labelledby="featured-trending-heading">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>
              {lang === 'ar'
                ? 'نشاطك الشخصي وأبرز الأدوات المختارة'
                : hasPersonalHistory
                  ? 'Personalized Activity · Curated Picks'
                  : 'Curated Highlights · Local Activity Tracker'}
            </span>
          </div>
          <h2
            id="featured-trending-heading"
            className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100"
          >
            {lang === 'ar' ? 'المميزة والأكثر استخداماً' : 'Featured & Trending'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'ar'
              ? hasPersonalHistory
                ? `مرتبة حسب أكثر الحاسبات استخداماً على هذا المتصفح (${totalUses} عملية فتح مسجلة محلياً)`
                : 'أبرز الحاسبات المختارة — سيتم ترتيب الحاسبات التي تستخدمها تلقائياً هنا عبر التخزين المحلي'
              : hasPersonalHistory
                ? `Ranked by your most frequently used calculators on this device (${totalUses} local ${totalUses === 1 ? 'visit' : 'visits'} recorded)`
                : 'Curated flagship calculators — your most frequently used tools automatically rise to the top'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {hasPersonalHistory && (
            <div
              className="inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-0.5 text-xs"
              role="group"
              aria-label="Filter Featured & Trending calculators"
            >
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {lang === 'ar' ? 'الكل' : 'All'}
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('trending')}
                className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer tabular-nums ${
                  activeFilter === 'trending'
                    ? 'bg-teal-600 text-white dark:bg-teal-500 dark:text-slate-950'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {lang === 'ar' ? `الأكثر استخداماً (${trendingEntries.length})` : `Most Used (${trendingEntries.length})`}
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('featured')}
                className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  activeFilter === 'featured'
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {lang === 'ar' ? 'المميزة' : 'Featured'}
              </button>
            </div>
          )}

          {hasPersonalHistory && (
            <button
              type="button"
              onClick={() => {
                setFilterMode('all');
                onClearUsage();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-900/60 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              title="Clear locally stored usage history"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'إعادة ضبط السجل' : 'Reset activity'}</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayedEntries.map((entry, idx) => {
          const { calculator: calc, usageCount, source } = entry;
          const isUserTrending = usageCount > 0;

          return (
            <a
              key={calc.id}
              href={`/calculator/${calc.slug}`}
              onClick={(e) => {
                e.preventDefault();
                onSelectCalculator(calc.slug);
              }}
              className="group p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-400 dark:hover:border-teal-500/60 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-mono font-semibold text-slate-400 dark:text-slate-500 tabular-nums">
                      #{idx + 1}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize font-medium truncate">
                      {calc.category_slug.replace(/-/g, ' ')}
                    </span>
                  </div>

                  <span
                    className={`font-mono text-[11px] font-semibold whitespace-nowrap shrink-0 tabular-nums ${
                      isUserTrending
                        ? 'text-teal-600 dark:text-teal-400'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {isUserTrending
                      ? lang === 'ar'
                        ? `${usageCount} استخدام`
                        : `Used ${usageCount} ${usageCount === 1 ? 'time' : 'times'}`
                      : source === 'featured'
                        ? lang === 'ar'
                          ? 'أداة مميزة'
                          : 'Featured'
                        : 'Popular'}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {calc.name}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {calc.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-teal-600 dark:text-teal-400">
                <span>{lang === 'ar' ? 'فتح الحاسبة' : 'Open Calculator'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
};
