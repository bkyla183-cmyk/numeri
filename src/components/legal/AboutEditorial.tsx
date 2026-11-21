import React from 'react';
import { Award, ArrowLeft } from 'lucide-react';

interface Props {
  onBack: () => void;
  onNavigate: (view: 'home' | 'calculators' | 'categories' | 'blog' | 'contact') => void;
}

export const AboutEditorial: React.FC<Props> = ({ onBack, onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Home</span>
      </button>

      {/* Header */}
      <div className="space-y-3 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          <Award className="w-4 h-4" />
          <span>Editorial Integrity &amp; Standards</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          About Numeriq &amp; Our Editorial Policy
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
          Numeriq was built to connect standard mathematical formulas with practical everyday decisions — offering focused, client-side tools with transparent equations and worked examples.
        </p>
      </div>

      {/* Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
            01
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Published Equations
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Calculators implement published mathematical standards and current 2026 / 2026–27 statutory schedules (IRS Pub 590-B &amp; Notice 2025-67, HMRC LSA &amp; State Pension, CRA RRSP/TFSA &amp; OAS recovery, ATO FY 2026–27 Super, and clinical/engineering references).
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
            02
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Independent Cross-Checks
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            We avoid black-box outputs. Every tool states its compounding and timing conventions, intermediate arithmetic steps, primary authoritative sources, and explicit model limitations.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
            03
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Client-Side Privacy
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            All user inputs and calculation results execute locally inside your browser using IEEE 754 double-precision JavaScript arithmetic without transmitting personal financial or health inputs to a server.
          </p>
        </div>
      </div>

      {/* Editorial Methodology */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Verification &amp; Multi-Jurisdiction Quality Assurance
        </h2>
        <div className="text-sm text-slate-700 dark:text-slate-300 space-y-3 leading-relaxed">
          <p>
            Every calculator specification and companion guide on Numeriq is audited against four editorial and engineering checkpoints before release:
          </p>
          <ul className="space-y-2 pl-4 list-disc">
            <li>
              <strong>Primary Source Grounding &amp; Effective Dates:</strong> Tax brackets, contribution ceilings, and benefit rules are checked directly against official revenue publications (IRS, HMRC, CRA, ATO, FDIC, SEC Investor.gov) and stamped with their applicable tax year and verification date.
            </li>
            <li>
              <strong>Independent Mathematical Verification:</strong> Worked examples are recalculated independently to the cent using arbitrary-precision arithmetic to catch fee-compounding, contribution-timing, and rounding discrepancies before publishing.
            </li>
            <li>
              <strong>Automated Boundary &amp; Sanity Testing:</strong> Calculators are stress-tested across normal inputs, zero divisors, negative bounds, empty strings, and extreme magnitudes to eliminate uncaught runtime errors or <code className="font-mono text-xs">NaN</code>/<code className="font-mono text-xs">Infinity</code> leaks.
            </li>
            <li>
              <strong>Explicit Limitations &amp; YMYL Non-Advice Policy:</strong> Financial, tax, retirement, and health tools clearly separate deterministic math from individualized licensed advisory decisions.
            </li>
          </ul>
        </div>
      </section>

      {/* Contact CTA */}
      <div className="p-6 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Spotted a Mathematical Edge Case or Typo?
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Help us improve accuracy by reporting any unexpected outputs or edge-case behavior.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('contact')}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors"
        >
          Report an Issue
        </button>
      </div>
    </div>
  );
};
