import React from 'react';
import { Home, Calculator, Compass, Search } from 'lucide-react';
import { calculators, calcCategories } from '../../data';

interface Props {
  onNavigateHome: () => void;
  onNavigateCalculators: () => void;
  onNavigateCategories: () => void;
  onOpenSearch: () => void;
}

export const NotFound: React.FC<Props> = ({
  onNavigateHome,
  onNavigateCalculators,
  onNavigateCategories,
  onOpenSearch,
}) => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 md:py-24 text-center space-y-8">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400 font-mono text-3xl font-black shadow-xs">
        404
      </div>

      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          Page Not Found
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
          The calculator, guide, or computational resource you are trying to reach does not exist, has been relocated, or the URL was mistyped.
        </p>
      </div>

      {/* Quick Search Trigger */}
      <div className="max-w-md mx-auto">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:border-teal-400 dark:hover:border-teal-500 shadow-xs transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5 text-xs sm:text-sm">
            <Search className="w-4 h-4 text-slate-400" />
            <span>Search all {calculators.length} calculators...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Navigation Options */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onNavigateHome();
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </a>

        <a
          href="/calculators"
          onClick={(e) => {
            e.preventDefault();
            onNavigateCalculators();
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer"
        >
          <Calculator className="w-4 h-4" />
          <span>Browse {calculators.length} Calculators</span>
        </a>

        <a
          href="/categories"
          onClick={(e) => {
            e.preventDefault();
            onNavigateCategories();
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer"
        >
          <Compass className="w-4 h-4" />
          <span>Browse {calcCategories.length} Categories</span>
        </a>
      </div>
    </div>
  );
};
