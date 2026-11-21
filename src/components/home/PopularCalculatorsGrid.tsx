import React from 'react';
import { CalculatorItem } from '../../types';
import { Calculator, ArrowRight, Sparkles } from 'lucide-react';

interface Props {
  calculators: CalculatorItem[];
  onSelectCalculator: (slug: string) => void;
  onViewAll?: () => void;
}

export const PopularCalculatorsGrid: React.FC<Props> = ({
  calculators,
  onSelectCalculator,
  onViewAll,
}) => {
  const popularList = calculators.filter((c) => c.is_popular || c.is_featured).slice(0, 12);

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Essential Workflows</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Most Popular Calculators
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Daily computational essentials verified by students, homeowners, and financial analysts
          </p>
        </div>

        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>View All {calculators.length} Calculators</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {popularList.map((calc) => (
          <a
            key={calc.id}
            href={`/calculator/${calc.slug}`}
            onClick={(e) => {
              e.preventDefault();
              onSelectCalculator(calc.slug);
            }}
            className="group p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-500/60 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              {/* Category & formula preview */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="capitalize font-medium">{calc.category_slug.replace('-', ' ')}</span>
                {calc.formula && (
                  <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/40 px-2 py-0.5 rounded max-w-[150px] truncate">
                    {calc.formula}
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {calc.name}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {calc.description}
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <span>Launch Calculator</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};
