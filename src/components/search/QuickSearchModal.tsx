import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Calculator, BookOpen, X, ArrowRight } from 'lucide-react';
import { CalculatorItem, BlogPost } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  calculators: CalculatorItem[];
  posts: BlogPost[];
  onSelectCalculator: (slug: string) => void;
  onSelectPost: (slug: string) => void;
  onOpenShortcuts?: () => void;
}

export const QuickSearchModal: React.FC<Props> = ({
  isOpen,
  onClose,
  calculators,
  posts,
  onSelectCalculator,
  onSelectPost,
  onOpenShortcuts,
}) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const didNavigateRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setActiveIndex(0);
      return;
    }

    didNavigateRef.current = false;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 30);

    const handleRefocusAltS = (e: KeyboardEvent) => {
      if (e.altKey && !e.ctrlKey && !e.metaKey && (e.code === 'KeyS' || e.key.toLowerCase() === 's')) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };

    window.addEventListener('keydown', handleRefocusAltS);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleRefocusAltS);
      if (!didNavigateRef.current && previouslyFocused && document.contains(previouslyFocused)) {
        previouslyFocused.focus();
      }
    };
  }, [isOpen]);

  const q = query.trim().toLowerCase();

  const matchingCalcs = useMemo(
    () =>
      q
        ? calculators
            .filter(
              (c) =>
                c.name.toLowerCase().includes(q) ||
                c.description.toLowerCase().includes(q) ||
                c.category_slug.toLowerCase().includes(q)
            )
            .slice(0, 6)
        : calculators.filter((c) => c.is_popular).slice(0, 5),
    [q, calculators]
  );

  const matchingPosts = useMemo(
    () =>
      q
        ? posts
            .filter(
              (p) =>
                p.title.toLowerCase().includes(q) ||
                p.excerpt.toLowerCase().includes(q) ||
                p.tags?.toLowerCase().includes(q)
            )
            .slice(0, 5)
        : posts.slice(0, 3),
    [q, posts]
  );

  const combinedResults = useMemo(
    () => [
      ...matchingCalcs.map((c) => ({ type: 'calc' as const, slug: c.slug })),
      ...matchingPosts.map((p) => ({ type: 'post' as const, slug: p.slug })),
    ],
    [matchingCalcs, matchingPosts]
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [q]);

  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (combinedResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % combinedResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + combinedResults.length) % combinedResults.length);
    } else if (e.key === 'Enter') {
      const target = combinedResults[activeIndex];
      if (!target) return;
      e.preventDefault();
      didNavigateRef.current = true;
      if (target.type === 'calc') {
        onSelectCalculator(target.slug);
      } else {
        onSelectPost(target.slug);
      }
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/50 backdrop-blur-xs"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Global calculator and guide search"
        className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search all ${calculators.length} calculators and ${posts.length} guides...`}
            aria-label="Search calculators and guides"
            className="w-full bg-transparent text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-6">
          {/* Calculators section */}
          {matchingCalcs.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 px-2">
                <Calculator className="w-3.5 h-3.5" />
                <span>{q ? 'Matching Calculators' : 'Popular Calculators'}</span>
              </div>
              <div className="space-y-1">
                {matchingCalcs.map((calc, idx) => {
                  const isActive = activeIndex === idx;
                  return (
                    <a
                      key={calc.id}
                      href={`/calculator/${calc.slug}`}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={(e) => {
                        e.preventDefault();
                        didNavigateRef.current = true;
                        onSelectCalculator(calc.slug);
                        onClose();
                      }}
                      className={`group flex items-center justify-between p-3 rounded-xl transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-slate-100 dark:bg-slate-800/90'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800/80'
                      }`}
                    >
                      <div>
                        <h4
                          className={`text-sm font-semibold ${
                            isActive
                              ? 'text-indigo-600 dark:text-indigo-400'
                              : 'text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                          }`}
                        >
                          {calc.name}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                          {calc.description}
                        </p>
                      </div>
                      <ArrowRight
                        className={`w-4 h-4 shrink-0 ml-2 transition-all ${
                          isActive
                            ? 'text-indigo-600 dark:text-indigo-400 translate-x-0.5'
                            : 'text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5'
                        }`}
                      />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Guides section */}
          {matchingPosts.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 px-2">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{q ? 'Related Knowledge Guides' : 'Featured Guides'}</span>
              </div>
              <div className="space-y-1">
                {matchingPosts.map((post, idx) => {
                  const globalIdx = matchingCalcs.length + idx;
                  const isActive = activeIndex === globalIdx;
                  return (
                    <a
                      key={post.id}
                      href={`/guide/${post.slug}`}
                      onMouseEnter={() => setActiveIndex(globalIdx)}
                      onClick={(e) => {
                        e.preventDefault();
                        didNavigateRef.current = true;
                        onSelectPost(post.slug);
                        onClose();
                      }}
                      className={`group flex items-center justify-between p-3 rounded-xl transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-slate-100 dark:bg-slate-800/90'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800/80'
                      }`}
                    >
                      <div>
                        <h4
                          className={`text-sm font-semibold ${
                            isActive
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
                          }`}
                        >
                          {post.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span>{post.categories}</span>
                          <span aria-hidden="true">·</span>
                          <span>{post.read_time} min read</span>
                        </div>
                      </div>
                      <ArrowRight
                        className={`w-4 h-4 shrink-0 ml-2 transition-all ${
                          isActive
                            ? 'text-emerald-600 dark:text-emerald-400 translate-x-0.5'
                            : 'text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5'
                        }`}
                      />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {matchingCalcs.length === 0 && matchingPosts.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-500">
              No calculators or articles found for &quot;{query}&quot;. Try terms like BMI, loan, percent, or calorie.
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span aria-hidden="true">·</span>
            <span>Enter Open</span>
            <span aria-hidden="true">·</span>
            <span>Esc Close</span>
          </div>
          {onOpenShortcuts ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenShortcuts();
              }}
              className="font-mono hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
            >
              Shortcuts (?)
            </button>
          ) : (
            <span className="font-mono">Numeriq Directory</span>
          )}
        </div>
      </div>
    </div>
  );
};

