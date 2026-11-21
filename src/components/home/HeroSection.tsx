import React from 'react';
import { Search, Zap } from 'lucide-react';
import { calculators, calcCategories, posts } from '../../data';

interface Props {
  onOpenSearch: () => void;
  onSelectCalculator: (slug: string) => void;
  lang: 'en' | 'ar';
}

export const HeroSection: React.FC<Props> = ({ onOpenSearch, onSelectCalculator, lang }) => {
  const popularShortcuts = [
    { name: 'Percentage', slug: 'percentage-calculator' },
    { name: 'Mortgage', slug: 'mortgage-calculator' },
    { name: 'BMI & Health', slug: 'bmi-calculator' },
    { name: 'Compound Interest', slug: 'compound-interest-calculator' },
    { name: 'Calorie & TDEE', slug: 'calorie-calculator' },
    { name: 'Loan Payment', slug: 'loan-calculator' },
    { name: 'Scientific', slug: 'scientific-calculator' },
    { name: 'GPA', slug: 'gpa-calculator' },
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100/60 dark:from-slate-950 dark:via-slate-900/60 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-16 md:pt-16 md:pb-20 text-center space-y-6">
        {/* Editorial Subtitle / Trust Indicator */}
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-widest">
          <Zap className="w-3.5 h-3.5" />
          <span>{lang === 'ar' ? 'نوميريك · حاسبات دقيقة ونتائج واضحة' : 'Numeriq · Practical Calculators. Clear Answers.'}</span>
        </div>

        {/* Main Display Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.1] text-balance">
          {lang === 'ar' ? (
            <>حاسبات عملية دقيقة وإجابات واضحة لكل حساباتك اليومية والمهنية</>
          ) : (
            <>Practical Calculators. Clear Answers.</>
          )}
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          {lang === 'ar'
            ? `استكشف ${calculators.length} حاسبة تفاعلية مختارة بعناية في ${calcCategories.length} تصنيفات للتمويل والرياضيات والصحة والعلوم، مع ${posts.length} دليلاً تعليمياً وشرحاً للمعادلات.`
            : `Use ${calculators.length} curated, double-precision online calculators across ${calcCategories.length} focused domains — backed by transparent formulas, worked examples, and ${posts.length} step-by-step guides.`}
        </p>

        {/* Big Search Bar */}
        <div className="max-w-xl mx-auto pt-2">
          <button
            type="button"
            onClick={onOpenSearch}
            aria-keyshortcuts="Alt+s Control+k"
            title="Focus global search (Alt+S or Ctrl+K)"
            className="flex items-center gap-3 w-full px-5 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-lg hover:border-teal-500/80 dark:hover:border-teal-400/80 transition-all cursor-pointer group text-left"
          >
            <Search className="w-5 h-5 text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors shrink-0" />
            <span className="text-sm sm:text-base text-slate-400 dark:text-slate-500 flex-1 select-none">
              {lang === 'ar' ? 'ابحث عن أي حاسبة أو مقال (مثل: فائدة مركبة، مؤشر كتلة الجسم)...' : 'Search calculators or guides (e.g. Mortgage, BMI, ROI)...'}
            </span>
            <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-md shadow-2xs whitespace-nowrap">
              Alt+S
            </kbd>
          </button>
        </div>

        {/* Quick Popular Shortcuts */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-slate-600 dark:text-slate-400">
          <span className="font-medium text-slate-500">{lang === 'ar' ? 'الأكثر استخداماً:' : 'Popular:'}</span>
          {popularShortcuts.map((item) => (
            <a
              key={item.slug}
              href={`/calculator/${item.slug}`}
              onClick={(e) => {
                e.preventDefault();
                onSelectCalculator(item.slug);
              }}
              className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              {item.name}
            </a>
          ))}
        </div>
      </div>

      {/* 4-Column Metric Strip */}
      <div className="border-t border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/60 backdrop-blur-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white tabular-nums">
              {calculators.length}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Curated Calculators
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-teal-600 dark:text-teal-400 tabular-nums">
              {calcCategories.length}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Focused Categories
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white tabular-nums">
              {posts.length}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Knowledge Guides
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
              100%
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Client-Side Precision
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
