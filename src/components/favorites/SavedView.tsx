import React from 'react';
import { Bookmark, Calculator, BookOpen, Trash2 } from 'lucide-react';
import { CalculatorItem, BlogPost } from '../../types';

interface Props {
  savedCalculatorSlugs: string[];
  savedPostSlugs: string[];
  allCalculators: CalculatorItem[];
  allPosts: BlogPost[];
  onSelectCalculator: (slug: string) => void;
  onSelectPost: (slug: string) => void;
  onRemoveCalculator: (slug: string) => void;
  onRemovePost: (slug: string) => void;
  onClearAll: () => void;
}

export const SavedView: React.FC<Props> = ({
  savedCalculatorSlugs,
  savedPostSlugs,
  allCalculators,
  allPosts,
  onSelectCalculator,
  onSelectPost,
  onRemoveCalculator,
  onRemovePost,
  onClearAll,
}) => {
  const savedCalculators = allCalculators.filter((c) => savedCalculatorSlugs.includes(c.slug));
  const savedPosts = allPosts.filter((p) => savedPostSlugs.includes(p.slug));

  const totalSaved = savedCalculators.length + savedPosts.length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Saved Tools &amp; Reading List</span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Fast local browser access to your bookmarked calculators and reference guides.
          </p>
        </div>

        {totalSaved > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer self-start sm:self-center"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Saved</span>
          </button>
        )}
      </div>

      {totalSaved === 0 ? (
        <div className="p-16 text-center border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl space-y-3">
          <Bookmark className="w-10 h-10 mx-auto text-slate-400" />
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">
            You haven&apos;t saved any items yet
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click the &quot;Save&quot; bookmark button on any calculator or article page to pin it here for quick access.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {savedCalculators.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-indigo-600" />
                <span>Saved Calculators ({savedCalculators.length})</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedCalculators.map((calc) => (
                  <div
                    key={calc.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start justify-between gap-3 shadow-xs"
                  >
                    <a
                      href={`/calculator/${calc.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onSelectCalculator(calc.slug);
                      }}
                      className="cursor-pointer flex-1 group"
                    >
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600">
                        {calc.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {calc.description}
                      </p>
                    </a>

                    <button
                      type="button"
                      onClick={() => onRemoveCalculator(calc.slug)}
                      aria-label={`Remove ${calc.name} from saved`}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors cursor-pointer"
                      title="Remove bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {savedPosts.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>Reading List ({savedPosts.length})</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedPosts.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start justify-between gap-3 shadow-xs"
                  >
                    <a
                      href={`/guide/${post.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onSelectPost(post.slug);
                      }}
                      className="cursor-pointer flex-1 group"
                    >
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                        <span>{post.categories}</span>
                        <span aria-hidden="true">·</span>
                        <span>{post.read_time} min read</span>
                      </div>
                    </a>

                    <button
                      type="button"
                      onClick={() => onRemovePost(post.slug)}
                      aria-label={`Remove ${post.title} from reading list`}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors cursor-pointer"
                      title="Remove from reading list"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
