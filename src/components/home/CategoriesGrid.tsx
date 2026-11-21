import React from 'react';
import { CalculatorCategory } from '../../types';
import { ArrowRight } from 'lucide-react';

interface Props {
  categories: CalculatorCategory[];
  onSelectCategory: (slug: string) => void;
  title?: string;
  subtitle?: string;
}

export const CategoriesGrid: React.FC<Props> = ({
  categories,
  onSelectCategory,
  title = 'Explore by Category',
  subtitle = 'Browse our complete library of specialized computational domains',
}) => {
  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {categories.map((cat) => (
          <a
            key={cat.id}
            href={`/category/${cat.slug}`}
            onClick={(e) => {
              e.preventDefault();
              onSelectCategory(cat.slug);
            }}
            className="group p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-500/60 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="text-2xl mb-2 select-none group-hover:scale-110 transition-transform origin-left">
                {cat.icon}
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                {cat.name}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-snug">
                {cat.description}
              </p>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
              <span className="font-mono">{cat.calculator_count} {cat.calculator_count === 1 ? 'tool' : 'tools'}</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};
