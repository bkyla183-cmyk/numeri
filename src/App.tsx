import React, { useState, useEffect, useRef } from 'react';
import {
  calcCategories,
  calculators,
  blogCategories,
  posts,
  getRelatedPostsForCalculator,
  getRelatedCalculatorForPost,
} from './data';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HeroSection } from './components/home/HeroSection';
import { FeaturedTrendingSection } from './components/home/FeaturedTrendingSection';
import { TopUsedCalculatorsChart } from './components/home/TopUsedCalculatorsChart';
import { PopularCalculatorsGrid } from './components/home/PopularCalculatorsGrid';
import { CategoriesGrid } from './components/home/CategoriesGrid';
import { CalculatorWrapper } from './components/calculators/CalculatorWrapper';
import { GenericCalculatorEngine } from './components/calculators/GenericCalculatorEngine';
import { SEOHead } from './components/seo/SEOHead';
import { NotFound } from './components/legal/NotFound';
import { ArrowRight, BookOpen } from 'lucide-react';
import {
  CALC_USAGE_STORAGE_KEY,
  CalcUsageMap,
  clearUsageStats,
  getUsageStats,
  recordCalculatorUsage,
} from './utils/usageTracker';
import { useGlobalShortcuts } from './hooks/useGlobalShortcuts';
import { RoundingPrecisionProvider } from './context/RoundingPrecisionContext';
import { CalculatorEngineRenderer } from './components/calculators/CalculatorEngineRenderer';
import { getDefaultComparePair } from './context/ComparisonContext';

// Route-based code-splitting via React.lazy
const CalculatorsDirectory = React.lazy(() => import('./components/calculators/CalculatorsDirectory').then(m => ({ default: m.CalculatorsDirectory })));
const BlogList = React.lazy(() => import('./components/blog/BlogList').then(m => ({ default: m.BlogList })));
const BlogPostView = React.lazy(() => import('./components/blog/BlogPostView').then(m => ({ default: m.BlogPostView })));
const SavedView = React.lazy(() => import('./components/favorites/SavedView').then(m => ({ default: m.SavedView })));
const SideBySideCompareView = React.lazy(() => import('./components/calculators/SideBySideCompareView').then(m => ({ default: m.SideBySideCompareView })));
const QuickSearchModal = React.lazy(() => import('./components/search/QuickSearchModal').then(m => ({ default: m.QuickSearchModal })));
const KeyboardShortcutsModal = React.lazy(() => import('./components/layout/KeyboardShortcutsModal').then(m => ({ default: m.KeyboardShortcutsModal })));
const PrivacyPolicy = React.lazy(() => import('./components/legal/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const TermsOfService = React.lazy(() => import('./components/legal/TermsOfService').then(m => ({ default: m.TermsOfService })));
const AboutEditorial = React.lazy(() => import('./components/legal/AboutEditorial').then(m => ({ default: m.AboutEditorial })));
const ContactUs = React.lazy(() => import('./components/legal/ContactUs').then(m => ({ default: m.ContactUs })));
const Disclaimer = React.lazy(() => import('./components/legal/Disclaimer').then(m => ({ default: m.Disclaimer })));

export type ViewMode =
  | 'home'
  | 'calculators'
  | 'categories'
  | 'blog'
  | 'calculator-detail'
  | 'compare'
  | 'blog-detail'
  | 'saved'
  | 'privacy'
  | 'terms'
  | 'about'
  | 'contact'
  | 'disclaimer'
  | 'not-found';

export default function App() {
  const [view, setView] = useState<ViewMode>('home');
  const [selectedCalcSlug, setSelectedCalcSlug] = useState<string>('percentage-calculator');
  const [compareLeftSlug, setCompareLeftSlug] = useState<string>('loan-calculator');
  const [compareRightSlug, setCompareRightSlug] = useState<string>('savings-goal-calculator');
  const [selectedPostSlug, setSelectedPostSlug] = useState<string>('');
  const [filterCategorySlug, setFilterCategorySlug] = useState<string>('all');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [shortcutAnnouncement, setShortcutAnnouncement] = useState<string>('');
  const [lang, setLang] = useState<'en' | 'ar'>('en');

  // Dark mode
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('calc_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('calc_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('calc_theme', 'light');
    }
  }, [isDark]);

  // Language & RTL
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Saved bookmarks
  const [savedCalcs, setSavedCalcs] = useState<string[]>(() => {
    try {
      const item = localStorage.getItem('calc_saved_calcs');
      return item ? JSON.parse(item) : ['percentage-calculator', 'bmi-calculator', 'mortgage-calculator'];
    } catch {
      return ['percentage-calculator', 'bmi-calculator', 'mortgage-calculator'];
    }
  });

  const [savedPosts, setSavedPosts] = useState<string[]>(() => {
    try {
      const item = localStorage.getItem('calc_saved_posts');
      return item ? JSON.parse(item) : [];
    } catch {
      return [];
    }
  });

  const toggleSaveCalc = (slug: string) => {
    setSavedCalcs((prev) => {
      const updated = prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug];
      localStorage.setItem('calc_saved_calcs', JSON.stringify(updated));
      return updated;
    });
  };

  const toggleSavePost = (slug: string) => {
    setSavedPosts((prev) => {
      const updated = prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug];
      localStorage.setItem('calc_saved_posts', JSON.stringify(updated));
      return updated;
    });
  };

  // Session-local tracking of last 5 calculators visited
  const [recentCalcSlugs, setRecentCalcSlugs] = useState<string[]>([]);

  useEffect(() => {
    if (view !== 'calculator-detail' || !selectedCalcSlug) return;
    if (!calculators.some((c) => c.slug === selectedCalcSlug)) return;
    setRecentCalcSlugs((prev) =>
      [selectedCalcSlug, ...prev.filter((s) => s !== selectedCalcSlug)].slice(0, 5)
    );
  }, [view, selectedCalcSlug]);

  // Calculator usage frequency tracking (localStorage)
  const [calcUsage, setCalcUsage] = useState<CalcUsageMap>(() => getUsageStats());
  const hasRecordedInitialUrlUsageRef = useRef<boolean>(false);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CALC_USAGE_STORAGE_KEY) {
        setCalcUsage(getUsageStats());
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const trackCalculatorUsage = (slug: string) => {
    setCalcUsage((prev) => recordCalculatorUsage(slug, prev));
  };

  const handleClearCalcUsage = () => {
    setCalcUsage(clearUsageStats());
  };

  // Comprehensive URL Parser supporting both clean HTML5 paths and hash fallbacks
  const parseCurrentUrl = (isInitialLoad = false) => {
    if (typeof window === 'undefined') return;

    const path = window.location.pathname.replace(/\/$/, '');
    const hash = window.location.hash.replace(/^#/, '');

    // 1. Check clean path
    if (path.startsWith('/calculator/')) {
      const slug = path.replace('/calculator/', '');
      if (calculators.some((c) => c.slug === slug)) {
        if (isInitialLoad && !hasRecordedInitialUrlUsageRef.current) {
          hasRecordedInitialUrlUsageRef.current = true;
          trackCalculatorUsage(slug);
        }
        setSelectedCalcSlug(slug);
        setView('calculator-detail');
        return;
      }
      setView('not-found');
      return;
    } else if (path.startsWith('/guide/') || path.startsWith('/post/')) {
      const slug = path.replace(/^\/(guide|post)\//, '');
      if (posts.some((p) => p.slug === slug)) {
        setSelectedPostSlug(slug);
        setView('blog-detail');
        return;
      }
      setView('not-found');
      return;
    } else if (path.startsWith('/category/')) {
      const catSlug = path.replace('/category/', '');
      if (calcCategories.some((cat) => cat.slug === catSlug)) {
        setFilterCategorySlug(catSlug);
        setView('calculators');
        return;
      }
      setView('not-found');
      return;
    } else if (path === '/calculators') {
      setFilterCategorySlug('all');
      setView('calculators');
      return;
    } else if (path === '/categories') {
      setView('categories');
      return;
    } else if (path === '/blog') {
      setView('blog');
      return;
    } else if (path === '/compare') {
      const params = new URLSearchParams(window.location.search);
      const qLeft = params.get('left');
      const qRight = params.get('right');
      const defaults = getDefaultComparePair(qLeft || undefined);
      setCompareLeftSlug(
        qLeft && calculators.some((c) => c.slug === qLeft) ? qLeft : defaults.leftSlug
      );
      setCompareRightSlug(
        qRight && calculators.some((c) => c.slug === qRight) ? qRight : defaults.rightSlug
      );
      setView('compare');
      return;
    } else if (
      path === '/privacy' ||
      path === '/terms' ||
      path === '/about' ||
      path === '/contact' ||
      path === '/disclaimer' ||
      path === '/saved'
    ) {
      setView(path.replace('/', '') as ViewMode);
      return;
    } else if (path === '/404') {
      setView('not-found');
      return;
    }

    // 2. Check hash fallback
    if (hash.startsWith('calc=')) {
      const slug = hash.replace('calc=', '');
      if (calculators.some((c) => c.slug === slug)) {
        if (isInitialLoad && !hasRecordedInitialUrlUsageRef.current) {
          hasRecordedInitialUrlUsageRef.current = true;
          trackCalculatorUsage(slug);
        }
        setSelectedCalcSlug(slug);
        setView('calculator-detail');
        return;
      }
      setView('not-found');
      return;
    } else if (hash.startsWith('post=')) {
      const slug = hash.replace('post=', '');
      if (posts.some((p) => p.slug === slug)) {
        setSelectedPostSlug(slug);
        setView('blog-detail');
        return;
      }
      setView('not-found');
      return;
    } else if (hash === 'compare') {
      setView('compare');
      return;
    } else if (
      ['calculators', 'categories', 'blog', 'saved', 'privacy', 'terms', 'about', 'contact', 'disclaimer'].includes(
        hash
      )
    ) {
      setView(hash as ViewMode);
      return;
    }

    // 3. Home or Unknown Route
    if (path === '' || path === '/') {
      setView('home');
      return;
    }

    // Any unrecognized path routes to 404
    setView('not-found');
  };

  useEffect(() => {
    parseCurrentUrl(true);

    const handlePop = () => parseCurrentUrl(false);
    window.addEventListener('popstate', handlePop);
    window.addEventListener('hashchange', handlePop);

    return () => {
      window.removeEventListener('popstate', handlePop);
      window.removeEventListener('hashchange', handlePop);
    };
  }, []);

  // Safe navigation with HTML5 pushState
  const navigateTo = (newView: ViewMode, path: string) => {
    if (path === '/calculators') {
      setFilterCategorySlug('all');
    }
    setView(newView);
    if (typeof window !== 'undefined') {
      try {
        window.history.pushState({}, '', path);
      } catch {
        window.location.hash = path.replace('/', '');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useGlobalShortcuts({
    onOpenSearch: () => {
      setIsShortcutsOpen(false);
      setIsSearchOpen(true);
      setShortcutAnnouncement('Global search opened');
    },
    onToggleSearch: () => {
      setIsShortcutsOpen(false);
      setIsSearchOpen((prev) => {
        const next = !prev;
        setShortcutAnnouncement(next ? 'Global search opened' : 'Global search closed');
        return next;
      });
    },
    onNavigateHome: () => {
      setIsSearchOpen(false);
      setIsShortcutsOpen(false);
      navigateTo('home', '/');
      setShortcutAnnouncement('Navigated to Home page');
    },
    onNavigateCalculators: () => {
      setIsSearchOpen(false);
      setIsShortcutsOpen(false);
      navigateTo('calculators', '/calculators');
      setShortcutAnnouncement('Navigated to Calculators directory');
    },
    onNavigateCategories: () => {
      setIsSearchOpen(false);
      setIsShortcutsOpen(false);
      navigateTo('categories', '/categories');
      setShortcutAnnouncement('Navigated to Categories');
    },
    onNavigateBlog: () => {
      setIsSearchOpen(false);
      setIsShortcutsOpen(false);
      navigateTo('blog', '/blog');
      setShortcutAnnouncement('Navigated to Knowledge Hub');
    },
    onNavigateSaved: () => {
      setIsSearchOpen(false);
      setIsShortcutsOpen(false);
      navigateTo('saved', '/saved');
      setShortcutAnnouncement('Navigated to Saved bookmarks');
    },
    onToggleTheme: () => {
      setIsDark((prev) => {
        const next = !prev;
        setShortcutAnnouncement(next ? 'Switched to dark theme' : 'Switched to light theme');
        return next;
      });
    },
    onToggleShortcutsHelp: () => {
      setIsSearchOpen(false);
      setIsShortcutsOpen((prev) => !prev);
    },
    onEscape: () => {
      setIsSearchOpen(false);
      setIsShortcutsOpen(false);
    },
  });

  // Navigation handlers
  const handleSelectCalculator = (slug: string) => {
    trackCalculatorUsage(slug);
    setSelectedCalcSlug(slug);
    navigateTo('calculator-detail', `/calculator/${slug}`);
  };

  const handleSelectPost = (slug: string) => {
    setSelectedPostSlug(slug);
    navigateTo('blog-detail', `/guide/${slug}`);
  };

  const handleSelectCategory = (catSlug: string) => {
    setFilterCategorySlug(catSlug);
    navigateTo('calculators', `/category/${catSlug}`);
  };

  const handleOpenCompare = (sourceSlug?: string, explicitRightSlug?: string) => {
    const pair = getDefaultComparePair(sourceSlug);
    const nextLeft = pair.leftSlug;
    const nextRight =
      explicitRightSlug && calculators.some((c) => c.slug === explicitRightSlug)
        ? explicitRightSlug
        : pair.rightSlug;
    setCompareLeftSlug(nextLeft);
    setCompareRightSlug(nextRight);
    navigateTo(
      'compare',
      `/compare?left=${encodeURIComponent(nextLeft)}&right=${encodeURIComponent(nextRight)}`
    );
  };

  const syncCompareUrl = (left: string, right: string) => {
    if (typeof window === 'undefined' || view !== 'compare') return;
    const nextUrl = `/compare?left=${encodeURIComponent(left)}&right=${encodeURIComponent(right)}`;
    const currentUrl = `${window.location.pathname}${window.location.search}`;
    if (currentUrl !== nextUrl) {
      try {
        window.history.replaceState({}, '', nextUrl);
      } catch {
        // Ignore restricted history updates
      }
    }
  };

  const currentCalculator = calculators.find((c) => c.slug === selectedCalcSlug) || calculators[0];
  const currentPost = posts.find((p) => p.slug === selectedPostSlug);
  const activeCategory = filterCategorySlug !== 'all'
    ? calcCategories.find((c) => c.slug === filterCategorySlug)
    : undefined;

  // Render specific interactive calculator body
  const renderCalculatorBody = () => {
    return <CalculatorEngineRenderer calculator={currentCalculator} />;
  };

  return (
    <RoundingPrecisionProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Dynamic SEO Head with OpenGraph and Schema.org Structured Data */}
      {view === 'calculator-detail' && currentCalculator ? (
        <SEOHead calculator={currentCalculator} type="calculator" canonicalPath={`/calculator/${currentCalculator.slug}`} />
      ) : view === 'blog-detail' && currentPost ? (
        <SEOHead post={currentPost} type="article" canonicalPath={`/guide/${currentPost.slug}`} />
      ) : view === 'calculators' && activeCategory ? (
        <SEOHead
          category={activeCategory}
          description={`Browse ${calculators.filter((c) => c.category_slug === activeCategory.slug).length} free verified ${activeCategory.name} calculators on Numeriq. Double-precision formulas and worked examples for ${activeCategory.description}`}
          canonicalPath={`/category/${activeCategory.slug}`}
        />
      ) : view === 'calculators' ? (
        <SEOHead
          title={`All ${calculators.length} Online Calculators Directory – Numeriq`}
          description={`Browse our curated directory of ${calculators.length} free verified online calculators for mortgage, loans, tax, math, statistics, unit conversions, and health.`}
          canonicalPath="/calculators"
        />
      ) : view === 'blog' ? (
        <SEOHead
          title={`Knowledge Hub – ${posts.length} Calculation Guides & Formulas | Numeriq`}
          description={`Understand the mathematics, scientific formulas, and financial strategies behind Numeriq calculators with ${posts.length} step-by-step guides.`}
          canonicalPath="/blog"
        />
      ) : view === 'categories' ? (
        <SEOHead
          title={`All ${calcCategories.length} Calculator Categories – Numeriq`}
          description={`Explore ${calcCategories.length} focused domains covering finance, business tax, algebra, statistics, geometry, health, science, and unit conversions.`}
          canonicalPath="/categories"
        />
      ) : view === 'privacy' ? (
        <SEOHead
          title="Privacy Policy – Numeriq"
          description="Numeriq privacy policy: client-side calculation privacy, local browser preferences, analytics/advertising disclosures, and user data rights."
          canonicalPath="/privacy"
        />
      ) : view === 'terms' ? (
        <SEOHead
          title="Terms of Service & Usage Agreement – Numeriq"
          description="Terms of service and mathematical calculation guidelines for Numeriq tools, intellectual property, and user warranties."
          canonicalPath="/terms"
        />
      ) : view === 'about' ? (
        <SEOHead
          title="About & Editorial Standards – Numeriq"
          description="Learn about Numeriq editorial principles, double-precision formulas, verification methodology, and mission."
          canonicalPath="/about"
        />
      ) : view === 'contact' ? (
        <SEOHead
          title="Contact Numeriq Support & Formula Editorial Team"
          description="Get in touch with Numeriq regarding calculator inquiries, formula corrections, and feedback."
          canonicalPath="/contact"
        />
      ) : view === 'disclaimer' ? (
        <SEOHead
          title="Mathematical, Financial & Medical Disclaimers – Numeriq"
          description="Statutory disclaimers for financial estimates, medical formulas (BMI, TDEE, pregnancy), and engineering calculators on Numeriq."
          canonicalPath="/disclaimer"
        />
      ) : view === 'compare' ? (
        <SEOHead
          title="Side-by-Side Calculator Comparison – Numeriq"
          description="Compare any two Numeriq calculators in a live split-pane workspace, including Loan vs. Savings and Mortgage vs. Compound Growth."
          canonicalPath="/compare"
          isNoindex
        />
      ) : view === 'saved' ? (
        <SEOHead
          title="Saved Calculators & Bookmarked Guides – Numeriq"
          description="Access your bookmarked formulas, saved calculation tools, and favorite editorial guides in one private workspace."
          canonicalPath="/saved"
          isNoindex
        />
      ) : view === 'not-found' ? (
        <SEOHead
          title="Page Not Found (404) – Numeriq"
          description="The requested calculator, computational tool, or educational guide could not be located on Numeriq."
          canonicalPath="/404"
          isNoindex
        />
      ) : (
        <SEOHead type="website" canonicalPath="/" />
      )}

      {/* Top Bar Header */}
      <Navbar
        currentView={view}
        onNavigate={(newView) => {
          if (newView === 'compare') {
            handleOpenCompare();
            return;
          }
          navigateTo(newView, newView === 'home' ? '/' : `/${newView}`);
        }}
        onOpenSearch={() => setIsSearchOpen(true)}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        savedCount={savedCalcs.length + savedPosts.length}
        lang={lang}
        onToggleLang={() => setLang(lang === 'en' ? 'ar' : 'en')}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        <React.Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center text-sm text-slate-500">Loading Numeriq workspace...</div>}>
        {/* VIEW 1: HOME */}
        {view === 'home' && (
          <div className="space-y-16 sm:space-y-20 pb-16">
            <HeroSection
              onOpenSearch={() => setIsSearchOpen(true)}
              onSelectCalculator={handleSelectCalculator}
              lang={lang}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16 sm:space-y-20">
              {/* Featured & Trending Calculators (localStorage usage tracking + curated featured) */}
              <FeaturedTrendingSection
                calculators={calculators}
                usageStats={calcUsage}
                onSelectCalculator={handleSelectCalculator}
                onClearUsage={handleClearCalcUsage}
                lang={lang}
              />

              {/* Recharts Top 5 Most Used Calculators Visualization */}
              <TopUsedCalculatorsChart
                calculators={calculators}
                usageStats={calcUsage}
                onSelectCalculator={handleSelectCalculator}
                lang={lang}
              />

              {/* Popular Calculators Showcase */}
              <PopularCalculatorsGrid
                calculators={calculators}
                onSelectCalculator={handleSelectCalculator}
                onViewAll={() => navigateTo('calculators', '/calculators')}
              />

              {/* Categories Grid */}
              <CategoriesGrid
                categories={calcCategories}
                onSelectCategory={handleSelectCategory}
              />

              {/* Knowledge Hub Spotlight on Home */}
              <section className="space-y-6 pt-4">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{lang === 'ar' ? 'أدلة إرشادية ومعادلات مفصلة' : 'Formula Guides & Deep Dives'}</span>
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                      {lang === 'ar' ? 'من مركز المعرفة التعليمي' : 'From the Knowledge Hub'}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Understand the principles and math behind every calculation
                    </p>
                  </div>

                  <button
                    onClick={() => navigateTo('blog', '/blog')}
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 inline-flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>{lang === 'ar' ? `عرض جميع المقالات (${posts.length})` : `Browse All ${posts.length} Guides`}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {posts.slice(0, 3).map((post) => (
                    <a
                      key={post.id}
                      href={`/guide/${post.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleSelectPost(post.slug);
                      }}
                      className="group p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer shadow-xs flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>{post.categories}</span>
                          <span aria-hidden="true">·</span>
                          <span>{post.read_time} min read</span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                          {post.excerpt}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <span>Read full guide</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}

        {/* VIEW 2: CALCULATORS DIRECTORY */}
        {view === 'calculators' && (
          <CalculatorsDirectory
            calculators={calculators}
            categories={calcCategories}
            onSelectCalculator={handleSelectCalculator}
            selectedCategorySlug={filterCategorySlug}
            onSelectCategory={(slug) => {
              setFilterCategorySlug(slug);
              if (slug === 'all') {
                navigateTo('calculators', '/calculators');
              } else {
                navigateTo('calculators', `/category/${slug}`);
              }
            }}
            onOpenCompare={() => handleOpenCompare()}
          />
        )}

        {/* VIEW 2B: SIDE-BY-SIDE COMPARISON */}
        {view === 'compare' && (
          <SideBySideCompareView
            initialLeftSlug={compareLeftSlug}
            initialRightSlug={compareRightSlug}
            onBack={() => navigateTo('calculators', '/calculators')}
            onOpenCalculator={handleSelectCalculator}
            onSyncUrl={syncCompareUrl}
            lang={lang}
          />
        )}

        {/* VIEW 3: ALL CATEGORIES */}
        {view === 'categories' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-8">
            <div className="max-w-2xl space-y-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
                Browse All {calcCategories.length} Computational Categories
              </h1>
              <p className="text-base text-slate-600 dark:text-slate-400">
                Explore specialized tools across science, engineering, business, statistics, health, and mathematics.
              </p>
            </div>

            <CategoriesGrid
              categories={calcCategories}
              onSelectCategory={handleSelectCategory}
              title="All Mathematical & Scientific Domains"
              subtitle="Select any category to view its complete collection of specialized calculators"
            />
          </div>
        )}

        {/* VIEW 4: CALCULATOR DETAIL */}
        {view === 'calculator-detail' && currentCalculator && (
          <CalculatorWrapper
            calculator={currentCalculator}
            relatedPosts={getRelatedPostsForCalculator(currentCalculator.slug)}
            recentCalculatorSlugs={recentCalcSlugs}
            onBack={() => navigateTo('calculators', '/calculators')}
            onNavigateHome={() => navigateTo('home', '/')}
            onSelectPost={handleSelectPost}
            onSelectCalculator={handleSelectCalculator}
            onSelectCategory={handleSelectCategory}
            isSaved={savedCalcs.includes(currentCalculator.slug)}
            onToggleSave={() => toggleSaveCalc(currentCalculator.slug)}
            onCompare={() => handleOpenCompare(currentCalculator.slug)}
          >
            {renderCalculatorBody()}
          </CalculatorWrapper>
        )}

        {/* VIEW 5: KNOWLEDGE HUB (BLOG LIST) */}
        {view === 'blog' && (
          <BlogList
            posts={posts}
            categories={blogCategories}
            onSelectPost={handleSelectPost}
          />
        )}

        {/* VIEW 6: BLOG DETAIL (POST READER) */}
        {view === 'blog-detail' && currentPost && (
          <BlogPostView
            post={currentPost}
            onBack={() => navigateTo('blog', '/blog')}
            onSelectCalculator={handleSelectCalculator}
            onSelectPost={handleSelectPost}
            relatedPosts={posts.filter((p) => p.categories === currentPost.categories && p.id !== currentPost.id)}
            isSaved={savedPosts.includes(currentPost.slug)}
            onToggleSave={() => toggleSavePost(currentPost.slug)}
          />
        )}

        {/* VIEW 7: SAVED BOOKMARKS */}
        {view === 'saved' && (
          <SavedView
            savedCalculatorSlugs={savedCalcs}
            savedPostSlugs={savedPosts}
            allCalculators={calculators}
            allPosts={posts}
            onSelectCalculator={handleSelectCalculator}
            onSelectPost={handleSelectPost}
            onRemoveCalculator={(slug) => toggleSaveCalc(slug)}
            onRemovePost={(slug) => toggleSavePost(slug)}
            onClearAll={() => {
              setSavedCalcs([]);
              setSavedPosts([]);
              localStorage.removeItem('calc_saved_calcs');
              localStorage.removeItem('calc_saved_posts');
            }}
          />
        )}

        {/* VIEW 8: PRIVACY POLICY */}
        {view === 'privacy' && (
          <PrivacyPolicy
            onBack={() => navigateTo('home', '/')}
            onNavigateContact={() => navigateTo('contact', '/contact')}
          />
        )}

        {/* VIEW 9: TERMS OF SERVICE */}
        {view === 'terms' && (
          <TermsOfService onBack={() => navigateTo('home', '/')} />
        )}

        {/* VIEW 10: ABOUT & EDITORIAL STANDARDS */}
        {view === 'about' && (
          <AboutEditorial
            onBack={() => navigateTo('home', '/')}
            onNavigate={(v) => navigateTo(v as ViewMode, v === 'home' ? '/' : `/${v}`)}
          />
        )}

        {/* VIEW 11: CONTACT US */}
        {view === 'contact' && (
          <ContactUs onBack={() => navigateTo('home', '/')} />
        )}

        {/* VIEW 12: STATUTORY DISCLAIMER */}
        {view === 'disclaimer' && (
          <Disclaimer onBack={() => navigateTo('home', '/')} />
        )}

        {/* VIEW 13: 404 NOT FOUND */}
        {view === 'not-found' && (
          <NotFound
            onNavigateHome={() => navigateTo('home', '/')}
            onNavigateCalculators={() => navigateTo('calculators', '/calculators')}
            onNavigateCategories={() => navigateTo('categories', '/categories')}
            onOpenSearch={() => setIsSearchOpen(true)}
          />
        )}
        </React.Suspense>
      </main>

      {/* Accessible screen-reader shortcut feedback */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {shortcutAnnouncement}
      </div>

      {/* Global Quick Search Modal */}
      {isSearchOpen && (
        <React.Suspense fallback={null}>
          <QuickSearchModal
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
            calculators={calculators}
            posts={posts}
            onSelectCalculator={handleSelectCalculator}
            onSelectPost={handleSelectPost}
            onOpenShortcuts={() => setIsShortcutsOpen(true)}
          />
        </React.Suspense>
      )}

      {/* Keyboard Shortcuts Reference Modal */}
      {isShortcutsOpen && (
        <React.Suspense fallback={null}>
          <KeyboardShortcutsModal
            isOpen={isShortcutsOpen}
            onClose={() => setIsShortcutsOpen(false)}
            lang={lang}
          />
        </React.Suspense>
      )}

      {/* Footer */}
      <Footer
        onSelectCalculator={handleSelectCalculator}
        onSelectCategory={handleSelectCategory}
        onNavigate={(newView) => navigateTo(newView, newView === 'home' ? '/' : `/${newView}`)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />
      </div>
    </RoundingPrecisionProvider>
  );
}
