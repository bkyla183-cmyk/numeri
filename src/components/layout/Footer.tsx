import React from 'react';
import { calculators, calcCategories, posts } from '../../data';

interface Props {
  onSelectCalculator: (slug: string) => void;
  onSelectCategory: (slug: string) => void;
  onNavigate: (view: 'home' | 'calculators' | 'categories' | 'blog' | 'saved' | 'privacy' | 'terms' | 'about' | 'contact' | 'disclaimer') => void;
  onOpenShortcuts?: () => void;
}

export const Footer: React.FC<Props> = ({
  onSelectCalculator,
  onSelectCategory,
  onNavigate,
  onOpenShortcuts,
}) => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 mt-20 text-xs text-slate-500 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center text-white font-mono text-xs font-black">
                N
              </span>
              <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                Numeriq
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              Practical Calculators. Clear Answers. Numeriq provides {calculators.length} curated interactive calculators across {calcCategories.length} focused categories alongside {posts.length} educational formula guides.
            </p>
            <div className="pt-2 text-[11px] text-slate-400">
              Double-precision calculation engine · Client-side privacy first.
            </div>
          </div>

          {/* Core Categories */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3 text-[11px]">
              Categories
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/category/math"
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectCategory('math');
                  }}
                  className="hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer block"
                >
                  Math &amp; Algebra
                </a>
              </li>
              <li>
                <a
                  href="/category/finance"
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectCategory('finance');
                  }}
                  className="hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer block"
                >
                  Finance &amp; Banking
                </a>
              </li>
              <li>
                <a
                  href="/category/health-fitness"
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectCategory('health-fitness');
                  }}
                  className="hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer block"
                >
                  Health &amp; Fitness
                </a>
              </li>
              <li>
                <a
                  href="/category/unit-converters"
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectCategory('unit-converters');
                  }}
                  className="hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer block"
                >
                  Unit Converters
                </a>
              </li>
              <li>
                <a
                  href="/categories"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('categories');
                  }}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 font-medium cursor-pointer block"
                >
                  All {calcCategories.length} Categories →
                </a>
              </li>
            </ul>
          </div>

          {/* Popular Tools */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3 text-[11px]">
              Popular Calculators
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/calculator/percentage-calculator"
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectCalculator('percentage-calculator');
                  }}
                  className="hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer block"
                >
                  Percentage Calculator
                </a>
              </li>
              <li>
                <a
                  href="/calculator/mortgage-calculator"
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectCalculator('mortgage-calculator');
                  }}
                  className="hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer block"
                >
                  Mortgage Calculator
                </a>
              </li>
              <li>
                <a
                  href="/calculator/compound-interest-calculator"
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectCalculator('compound-interest-calculator');
                  }}
                  className="hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer block"
                >
                  Compound Interest
                </a>
              </li>
              <li>
                <a
                  href="/calculator/bmi-calculator"
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectCalculator('bmi-calculator');
                  }}
                  className="hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer block"
                >
                  BMI Calculator
                </a>
              </li>
              <li>
                <a
                  href="/calculator/calorie-calculator"
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectCalculator('calorie-calculator');
                  }}
                  className="hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer block"
                >
                  Calorie &amp; TDEE
                </a>
              </li>
              <li>
                <a
                  href="/calculator/scientific-calculator"
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectCalculator('scientific-calculator');
                  }}
                  className="hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer block"
                >
                  Scientific Calculator
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance (Mandatory for Google AdSense) */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3 text-[11px]">
              Trust &amp; Legal
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/about"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('about');
                  }}
                  className="hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer block"
                >
                  About Us &amp; Standards
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('privacy');
                  }}
                  className="hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer block"
                >
                  Privacy Policy (GDPR/CCPA)
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('terms');
                  }}
                  className="hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer block"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="/disclaimer"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('disclaimer');
                  }}
                  className="hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer block"
                >
                  Medical &amp; Financial Disclaimer
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('contact');
                  }}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 font-medium cursor-pointer block"
                >
                  Contact &amp; Support →
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            &copy; {new Date().getFullYear()} Numeriq. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/privacy"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('privacy');
              }}
              className="hover:underline"
            >
              Privacy
            </a>
            <a
              href="/terms"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('terms');
              }}
              className="hover:underline"
            >
              Terms
            </a>
            <a
              href="/about"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('about');
              }}
              className="hover:underline"
            >
              Editorial Policy
            </a>
            <a
              href="/contact"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('contact');
              }}
              className="hover:underline"
            >
              Support
            </a>
            {onOpenShortcuts && (
              <button
                type="button"
                onClick={onOpenShortcuts}
                aria-keyshortcuts="?"
                className="hover:underline cursor-pointer"
              >
                Shortcuts (?)
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
