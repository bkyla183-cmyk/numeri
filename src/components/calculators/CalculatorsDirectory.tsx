import React, { useState, useMemo, useEffect } from 'react';
import { Search, Calculator, ArrowRight, Filter, Columns2 } from 'lucide-react';
import { CalculatorItem, CalculatorCategory } from '../../types';

interface Props {
  calculators: CalculatorItem[];
  categories: CalculatorCategory[];
  onSelectCalculator: (slug: string) => void;
  selectedCategorySlug?: string;
  onSelectCategory?: (slug: string) => void;
  onOpenCompare?: () => void;
}

export const CalculatorsDirectory: React.FC<Props> = ({
  calculators,
  categories,
  onSelectCalculator,
  selectedCategorySlug = 'all',
  onSelectCategory,
  onOpenCompare,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>(selectedCategorySlug);
  const [searchQuery, setSearchQuery] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const q = new URLSearchParams(window.location.search).get('q');
      return q ? q.trim() : '';
    }
    return '';
  });
  const [sortBy, setSortBy] = useState<'popular' | 'alpha' | 'featured'>('popular');

  useEffect(() => {
    setActiveCategory(selectedCategorySlug || 'all');
  }, [selectedCategorySlug]);

  const currentCategory = useMemo(
    () => (activeCategory === 'all' ? undefined : categories.find((c) => c.slug === activeCategory)),
    [activeCategory, categories]
  );

  const filteredCalculators = useMemo(() => {
    return calculators
      .filter((c) => {
        const matchesCat = activeCategory === 'all' || c.category_slug === activeCategory;
        const matchesSearch =
          !searchQuery.trim() ||
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.category_slug.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'alpha') return a.name.localeCompare(b.name);
        if (sortBy === 'featured') return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
        return (b.is_popular ? 1 : 0) - (a.is_popular ? 1 : 0) || a.sort_order - b.sort_order;
      });
  }, [calculators, activeCategory, searchQuery, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="max-w-2xl space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            {currentCategory ? `${currentCategory.name} Calculators` : 'All Online Calculators Directory'}
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400">
            {currentCategory
              ? `${currentCategory.description} (${filteredCalculators.length} tools in this category).`
              : `Browse our curated suite of ${calculators.length} free, double-precision online calculators. Choose a category or search by topic.`}
          </p>
        </div>

        {onOpenCompare && (
          <button
            type="button"
            onClick={onOpenCompare}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors cursor-pointer whitespace-nowrap shrink-0 self-start md:self-auto"
          >
            <Columns2 className="w-4 h-4" />
            <span>Compare Side-by-Side (Loan vs. Savings)</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Category Dropdown */}
        <div className="flex flex-wrap items-center gap-2">
          <label
            htmlFor="directory-category-select"
            className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
          </label>
          <select
            id="directory-category-select"
            aria-label="Filter calculators by category"
            value={activeCategory}
            onChange={(e) => {
              setActiveCategory(e.target.value);
              onSelectCategory?.(e.target.value);
            }}
            className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 cursor-pointer"
          >
            <option value="all">All Categories ({calculators.length})</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>

          {/* Sort selector */}
          <select
            id="directory-sort-select"
            aria-label="Sort calculators"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'popular' | 'alpha' | 'featured')}
            className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 cursor-pointer"
          >
            <option value="popular">Sort: Most Popular</option>
            <option value="alpha">Sort: Alphabetical (A-Z)</option>
            <option value="featured">Sort: Featured</option>
          </select>
        </div>

        {/* Search input */}
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            id="directory-search-input"
            aria-label="Search calculators directory"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by name or keywords..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>
      </div>

      {/* Calculators Cards Grid */}
      {filteredCalculators.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCalculators.map((calc) => (
            <a
              key={calc.id}
              href={`/calculator/${calc.slug}`}
              onClick={(e) => {
                e.preventDefault();
                onSelectCalculator(calc.slug);
              }}
              className="group p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-500/60 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="capitalize font-medium">{calc.category_slug.replace('-', ' ')}</span>
                  {calc.formula && (
                    <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded truncate max-w-[130px]">
                      {calc.formula}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {calc.name}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {calc.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                <span>Calculate</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl">
          <Calculator className="w-8 h-8 mx-auto text-slate-400 mb-2" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No calculators found
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search query or choosing &quot;All Categories&quot;.
          </p>
        </div>
      )}
    </div>
  );
};
