import React, { useState } from 'react';
import {
  Bookmark,
  BookmarkCheck,
  Share2,
  BookOpen,
  Calculator,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Check,
  Info,
  Link2,
  Sparkles,
  Award,
  Layers,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  FileText,
  ExternalLink,
  Globe,
} from 'lucide-react';
import { CalculatorItem, BlogPost } from '../../types';
import { getFaqsForCalculator } from '../../data/calculatorFaqs';
import { getCalculatorEditorial } from '../../data/calculatorEditorial';
import {
  getCalculatorsInCategory,
  getCompanionCalculators,
  getTopPopularCalculators,
  calcCategories,
  calculators,
} from '../../data';
import { AdSlot } from '../ads/AdSlot';

interface Props {
  calculator: CalculatorItem;
  relatedPosts?: BlogPost[];
  onBack?: () => void;
  onNavigateHome?: () => void;
  onSelectPost?: (slug: string) => void;
  onSelectCalculator?: (slug: string) => void;
  onSelectCategory?: (slug: string) => void;
  children: React.ReactNode;
  isSaved?: boolean;
  onToggleSave?: () => void;
}

export const CalculatorWrapper: React.FC<Props> = ({
  calculator,
  relatedPosts = [],
  onBack,
  onNavigateHome,
  onSelectPost,
  onSelectCalculator,
  onSelectCategory,
  children,
  isSaved,
  onToggleSave,
}) => {
  const [copied, setCopied] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const faqs = getFaqsForCalculator(
    calculator.slug,
    calculator.name,
    calculator.category_slug,
    calculator.formula
  );

  const editorial = getCalculatorEditorial(
    calculator.slug,
    calculator.name,
    calculator.category_slug,
    calculator.formula
  );

  const sameCategoryTools = getCalculatorsInCategory(
    calculator.category_slug,
    calculator.slug
  ).slice(0, 12);

  const companionTools = getCompanionCalculators(
    calculator.slug,
    calculator.category_slug,
    6
  );

  const popularTools = getTopPopularCalculators(8);

  const currentCategory = calcCategories.find((c) => c.slug === calculator.category_slug);

  const currentOrigin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : '';
  const dedicatedPath = `/calculator/${calculator.slug}`;
  const dedicatedUrl = currentOrigin ? `${currentOrigin}${dedicatedPath}` : dedicatedPath;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(dedicatedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLinkClick = (e: React.MouseEvent, slug: string) => {
    e.preventDefault();
    onSelectCalculator?.(slug);
  };

  return (
    <div data-calculator-page className="max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-8">
      {/* Breadcrumb Navigation for SEO Crawlers & Deep Internal Linking */}
      <nav
        aria-label="Breadcrumb"
        className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 flex-wrap"
      >
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            if (onNavigateHome) onNavigateHome();
            else onBack?.();
          }}
          className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
        >
          Home
        </a>
        <span aria-hidden="true">/</span>
        <a
          href="/calculators"
          onClick={(e) => {
            e.preventDefault();
            onBack?.();
          }}
          className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
        >
          All Calculators
        </a>
        <span aria-hidden="true">/</span>
        {currentCategory ? (
          <a
            href={`/category/${currentCategory.slug}`}
            onClick={(e) => {
              e.preventDefault();
              onSelectCategory?.(currentCategory.slug);
            }}
            className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors capitalize"
          >
            {currentCategory.name}
          </a>
        ) : (
          <span className="capitalize">{calculator.category_slug.replace('-', ' ')}</span>
        )}
        <span aria-hidden="true">/</span>
        <span className="font-semibold text-slate-900 dark:text-slate-100" aria-current="page">
          {calculator.name}
        </span>
      </nav>

      {/* Header & Dedicated URL Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <Calculator className="w-3.5 h-3.5" />
            <span>{currentCategory?.name || calculator.category_slug}</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-400 dark:text-slate-500 font-normal">Double-Precision Engine</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            {calculator.name}
          </h1>

          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            {calculator.description}
          </p>

          {/* Dedicated URL Chip */}
          <div className="pt-1 flex items-center gap-2 text-xs font-mono text-slate-400 dark:text-slate-500">
            <Link2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="truncate max-w-xs sm:max-w-md select-all">/calculator/{calculator.slug}</span>
          </div>
        </div>

        {/* Actions */}
        <div data-calculator-actions className="flex items-center gap-2 self-start sm:self-center shrink-0">
          {onToggleSave && (
            <button
              onClick={onToggleSave}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                isSaved
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
              title="Save to favorites"
            >
              {isSaved ? <BookmarkCheck className="w-3.5 h-3.5 text-amber-500" /> : <Bookmark className="w-3.5 h-3.5" />}
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>
          )}

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Copy permanent direct link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div data-calculator-grid className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div data-calculator-main className="lg:col-span-8 space-y-8">
          {/* Interactive Calculator Body */}
          <div data-calculator-tool>{children}</div>

          <div data-calculator-non-tool className="space-y-8">
          {/* Compliant Post-Results AdSense Zone (separated from interactive Calculate/Reset controls) */}
          <AdSlot format="leaderboard" placement="post-results" />

          {/* EDITORIAL SECTION 1: IN-DEPTH GUIDE & MATHEMATICAL FORMULATION */}
          <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
              <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                How It Works &amp; Mathematical Principles
              </h2>
            </div>

            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 space-y-4 leading-relaxed">
              <p>{editorial.overview}</p>
              <p>{editorial.detailedExplanation}</p>

              {/* Mathematical Formula Box */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-slate-400 dark:text-slate-500 block text-[11px] uppercase tracking-wider font-semibold">
                  Formal Mathematical Equation:
                </span>
                <div className="font-mono text-xs sm:text-sm text-indigo-900 dark:text-indigo-300 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 overflow-x-auto">
                  {editorial.formulaDisplay.formula}
                </div>
              </div>

              {/* Variable Definitions Table */}
              {editorial.formulaDisplay.variableDefinitions.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider">
                    Variable Definitions &amp; Measurement Units
                  </h3>
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs divide-y divide-slate-200 dark:divide-slate-800">
                      <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
                        <tr>
                          <th className="px-3.5 py-2 font-semibold">Variable</th>
                          <th className="px-3.5 py-2 font-semibold">Name</th>
                          <th className="px-3.5 py-2 font-semibold hidden sm:table-cell">Description</th>
                          <th className="px-3.5 py-2 font-semibold">Unit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                        {editorial.formulaDisplay.variableDefinitions.map((v, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                            <td className="px-3.5 py-2 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                              {v.symbol}
                            </td>
                            <td className="px-3.5 py-2 font-medium">{v.name}</td>
                            <td className="px-3.5 py-2 text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                              {v.description}
                            </td>
                            <td className="px-3.5 py-2 text-slate-500 dark:text-slate-400">{v.unit || 'Standard'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* EDITORIAL SECTION 2: STEP-BY-STEP WORKED EXAMPLE */}
          <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Step-by-Step Worked Calculation Example
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {editorial.workedExample.scenario}
            </p>

            {/* Input Parameters Table */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
              {editorial.workedExample.inputs.map((inp, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                >
                  <span className="text-[11px] text-slate-500 block">{inp.name}</span>
                  <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {inp.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Step-by-Step Arithmetic */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider block">
                Arithmetic Derivation Steps:
              </span>
              <ol className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 list-decimal list-inside leading-relaxed pl-1">
                {editorial.workedExample.steps.map((st, i) => (
                  <li key={i} className="pl-1">
                    {st}
                  </li>
                ))}
              </ol>
            </div>

            {/* Result Box */}
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Calculated Benchmark Result:</span>
              </div>
              <div className="text-sm sm:text-base font-bold text-emerald-900 dark:text-emerald-200">
                {editorial.workedExample.result}
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 pt-1">
                {editorial.workedExample.interpretation}
              </p>
            </div>
          </section>

          {/* EDITORIAL SECTION 3: DOMAIN STANDARDS, ASSUMPTIONS & BEST PRACTICES */}
          <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {editorial.regulatoryAndStandards.title}
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {editorial.regulatoryAndStandards.description}
            </p>

            <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {editorial.regulatoryAndStandards.points.map((pt, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>

            {/* Common Mistakes Box */}
            {editorial.commonMistakes && (
              <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 space-y-1.5 mt-4">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider block">
                  {Array.isArray(editorial.commonMistakes)
                    ? editorial.commonMistakes[0]?.title || 'Limitations & Common Mistakes'
                    : editorial.commonMistakes.title}
                </span>
                <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                  {Array.isArray(editorial.commonMistakes)
                    ? editorial.commonMistakes.map((m) => m.explanation).join(' ')
                    : editorial.commonMistakes.explanation}
                </p>
              </div>
            )}

            {/* Pro-Tips Box */}
            {editorial.proTips.length > 0 && (
              <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 space-y-2 mt-4">
                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider block">
                  Practical Guidance &amp; Verification Tips:
                </span>
                <ul className="space-y-1.5 text-xs text-indigo-800 dark:text-indigo-300">
                  {editorial.proTips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-indigo-500 font-bold">✓</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Regional & Country-Specific Rules / Units Matrix */}
          {editorial.countryContext && (
            <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
                <Globe className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Regional Standards, Markets &amp; Units
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {editorial.countryContext.summary}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {editorial.countryContext.markets.map((m, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{m.region}</span>
                      {m.effectiveDate && (
                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                          {m.effectiveDate}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{m.standard}</p>
                    {m.unitsOrCurrency && (
                      <span className="text-[11px] font-mono text-teal-700 dark:text-teal-400 block">
                        Units / Currency: {m.unitsOrCurrency}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Mid-Editorial Configurable Ad Zone */}
          <AdSlot format="responsive" placement="mid-editorial" />

          {/* EDITORIAL SECTION 4: FREQUENTLY ASKED QUESTIONS (FAQ) */}
          {faqs.length > 0 && (
            <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
                <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Frequently Asked Questions (FAQ)
                </h2>
              </div>

              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {faqs.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div key={idx} className="py-3.5">
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer gap-4"
                      >
                        <span>{faq.question}</span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 shrink-0 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 shrink-0 text-slate-400" />
                        )}
                      </button>
                      {isOpen && (
                        <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed pr-6">
                          {faq.answer}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* AUTHORITATIVE SOURCES & PRIMARY REFERENCES */}
          {editorial.references && editorial.references.length > 0 && (
            <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
                <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Authoritative Sources &amp; Official References
                </h2>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm">
                {editorial.references.map((ref, idx) => (
                  <li
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col gap-1"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                      >
                        <span>{ref.name}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        {ref.organization}{ref.effectiveDate ? ` · ${ref.effectiveDate}` : ''}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{ref.note}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* EDITORIAL ATTRIBUTION & REVIEW BADGE */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                {editorial.editorialReview.reviewedBy}
              </span>
              <span>
                {editorial.editorialReview.accuracyStandard} · Last reviewed: {editorial.editorialReview.reviewDate}
              </span>
            </div>
          </div>

          {/* Pre-Related-Resources Configurable Ad Zone */}
          <AdSlot format="responsive" placement="pre-related" />

          {/* ================================================================ */}
          {/* DEEP INTERNAL LINKING SECTION 1: SAME CATEGORY CALCULATORS */}
          {/* ================================================================ */}
          {sameCategoryTools.length > 0 && (
            <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                    More {currentCategory?.name || 'Related'} Calculators ({sameCategoryTools.length})
                  </h3>
                </div>
                <span className="text-xs text-slate-500">Explore sibling tools in this domain</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {sameCategoryTools.map((calc) => (
                  <a
                    key={calc.id}
                    href={`/calculator/${calc.slug}`}
                    onClick={(e) => handleLinkClick(e, calc.slug)}
                    className="group p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-850 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {calc.name}
                      </h4>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {calc.description}
                      </p>
                    </div>
                    <div className="mt-2.5 flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
                      <span>Launch Tool</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* ================================================================ */}
          {/* DEEP INTERNAL LINKING SECTION 2: COMPANION & CROSS-CATEGORY TOOLS */}
          {/* ================================================================ */}
          {companionTools.length > 0 && (
            <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                  Recommended Companion Calculators
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Frequently utilized alongside the {calculator.name} to conduct multi-variable analysis:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {companionTools.map((calc) => (
                  <a
                    key={calc.id}
                    href={`/calculator/${calc.slug}`}
                    onClick={(e) => handleLinkClick(e, calc.slug)}
                    className="group p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-850 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-emerald-600 dark:text-emerald-400 block mb-0.5">
                        {calc.category_slug}
                      </span>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {calc.name}
                      </h4>
                    </div>
                    <div className="mt-2 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span>Calculate</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* ================================================================ */}
          {/* DEEP INTERNAL LINKING SECTION 3: BROWSE ALL CATEGORIES DIRECTORY */}
          {/* ================================================================ */}
          <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                Explore All {calcCategories.length} Calculator Domains
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Direct access to our {calculators.length} curated calculators across finance, business tax, math, statistics, health, and unit conversions:
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {calcCategories.map((cat) => (
                <a
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectCategory?.(cat.slug);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    cat.slug === calculator.category_slug
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                  <span className="text-[10px] text-slate-400">({cat.calculator_count})</span>
                </a>
              ))}
            </div>
          </section>
          </div>
        </div>

        {/* ================================================================ */}
        {/* RIGHT SIDEBAR: FAST ACCESS, POPULAR TOOLS & RELATED GUIDES */}
        {/* ================================================================ */}
        <div data-calculator-sidebar className="lg:col-span-4 space-y-6">
          {/* Permanent URL Direct Access Card */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              <Link2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Dedicated Permanent URL</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Bookmark or cite this exact tool for reproducible calculations:
            </p>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs font-mono text-indigo-700 dark:text-indigo-300 break-all select-all">
              {dedicatedUrl}
            </div>
            <button
              onClick={handleShare}
              className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Permanent Link'}</span>
            </button>
          </div>

          {/* Top 8 Popular Calculators Quick Links */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Top 8 Popular Calculators</span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {popularTools.map((p) => (
                <a
                  key={p.id}
                  href={`/calculator/${p.slug}`}
                  onClick={(e) => handleLinkClick(e, p.slug)}
                  className="py-2.5 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
                >
                  <span className="font-medium truncate pr-2">{p.name}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                </a>
              ))}
            </div>
          </div>

          {/* Related In-depth Guides from Knowledge Hub */}
          {relatedPosts.length > 0 && (
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Related Knowledge Guides</span>
              </div>
              <div className="space-y-3">
                {relatedPosts.map((post) => (
                  <a
                    key={post.id}
                    href={`/guide/${post.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onSelectPost?.(post.slug);
                    }}
                    className="group block p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700/60"
                  >
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-2">
                      {post.title}
                    </h4>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
                      <span>{post.read_time} min read</span>
                      <span aria-hidden="true">·</span>
                      <span>By {post.author}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Compliant Sidebar Ad Slot */}
          <AdSlot format="rectangle" placement="sidebar-rectangle" />

          {/* Precision & Audit Notice */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-xs text-slate-600 dark:text-slate-400 space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
              <FileText className="w-3.5 h-3.5 text-indigo-500" />
              <span>Calculation Integrity</span>
            </div>
            <p>
              Numeriq executes calculations client-side with 64-bit IEEE 754 precision. Your confidential figures never leave your device.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
