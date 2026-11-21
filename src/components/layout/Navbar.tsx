import React from 'react';
import { Search, Sun, Moon, Bookmark, Globe, Columns2 } from 'lucide-react';

interface Props {
  currentView: string;
  onNavigate: (view: 'home' | 'calculators' | 'categories' | 'compare' | 'blog' | 'saved') => void;
  onOpenSearch: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  savedCount: number;
  lang: 'en' | 'ar';
  onToggleLang: () => void;
}

export const Navbar: React.FC<Props> = ({
  currentView,
  onNavigate,
  onOpenSearch,
  isDark,
  onToggleTheme,
  savedCount,
  lang,
  onToggleLang,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('home');
          }}
          className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-2"
        >
          <span className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white font-mono text-base font-black shadow-xs">
            N
          </span>
          <span className="tracking-tight">Numeriq</span>
        </a>

        {/* Zone 2: 4–5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-400">
          <a
            href="/calculators"
            aria-keyshortcuts="Alt+c"
            title={lang === 'ar' ? 'الحاسبات (Alt+C)' : 'Calculators directory (Alt+C)'}
            onClick={(e) => {
              e.preventDefault();
              onNavigate('calculators');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              currentView === 'calculators'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            {lang === 'ar' ? 'الحاسبات' : 'Calculators'}
          </a>
          <a
            href="/categories"
            aria-keyshortcuts="Alt+k"
            title={lang === 'ar' ? 'التصنيفات (Alt+K)' : 'Categories (Alt+K)'}
            onClick={(e) => {
              e.preventDefault();
              onNavigate('categories');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              currentView === 'categories'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            {lang === 'ar' ? 'التصنيفات' : 'Categories'}
          </a>
          <a
            href="/compare"
            title={lang === 'ar' ? 'مقارنة الحاسبات جنباً إلى جنب' : 'Side-by-Side Calculator Comparison'}
            onClick={(e) => {
              e.preventDefault();
              onNavigate('compare');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
              currentView === 'compare'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Columns2 className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'مقارنة' : 'Compare'}</span>
          </a>
          <a
            href="/blog"
            aria-keyshortcuts="Alt+g"
            title={lang === 'ar' ? 'مركز المعرفة (Alt+G)' : 'Knowledge Hub guides (Alt+G)'}
            onClick={(e) => {
              e.preventDefault();
              onNavigate('blog');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              currentView === 'blog'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            {lang === 'ar' ? 'مركز المعرفة' : 'Knowledge Hub'}
          </a>
          <a
            href="/saved"
            aria-keyshortcuts="Alt+b"
            title={lang === 'ar' ? 'المحفوظات (Alt+B)' : 'Saved bookmarks (Alt+B)'}
            onClick={(e) => {
              e.preventDefault();
              onNavigate('saved');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
              currentView === 'saved'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'المحفوظات' : 'Saved'}</span>
            {savedCount > 0 && (
              <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                ({savedCount})
              </span>
            )}
          </a>
        </nav>

        {/* Zone 3: 1 primary action with subtle utilities */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick Search Button */}
          <button
            type="button"
            onClick={onOpenSearch}
            aria-keyshortcuts="Alt+s Control+k"
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Search tools (Alt+S or Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>{lang === 'ar' ? 'بحث...' : 'Search tools...'}</span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-2xs">
              Alt+S
            </kbd>
          </button>

          {/* Search Icon for Mobile */}
          <button
            type="button"
            onClick={onOpenSearch}
            aria-keyshortcuts="Alt+s Control+k"
            className="sm:hidden p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Language Toggle */}
          <button
            type="button"
            onClick={onToggleLang}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1"
            title="Toggle Language (English / العربية)"
          >
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>{lang === 'en' ? 'عربي' : 'EN'}</span>
          </button>

          {/* Dark / Light Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-keyshortcuts="Alt+d"
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Toggle theme"
            title={isDark ? 'Switch to light mode (Alt+D)' : 'Switch to dark mode (Alt+D)'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
