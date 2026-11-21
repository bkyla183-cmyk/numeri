import React from 'react';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

interface Props {
  onBack: () => void;
}

export const Disclaimer: React.FC<Props> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Home</span>
      </button>

      <div className="space-y-3 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
          <AlertTriangle className="w-4 h-4" />
          <span>Statutory Disclosures</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          Financial, Medical &amp; Legal Disclaimer
        </h1>
        <p className="text-xs text-slate-500 font-mono">
          Last Updated: November 20, 2026
        </p>
      </div>

      <div className="prose-slate max-w-none text-sm text-slate-700 dark:text-slate-300 space-y-6 leading-relaxed">
        <section className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 space-y-2">
          <h2 className="text-base font-bold text-amber-900 dark:text-amber-200">
            Important General Advisory
          </h2>
          <p className="text-xs text-amber-800 dark:text-amber-300">
            The content, interactive calculators, and analytical estimates published on Numeriq are provided exclusively for general informational and educational purposes. Nothing on this website constitutes professional financial, investment, tax, legal, architectural, or medical advice.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            1. Financial &amp; Investment Disclaimer
          </h2>
          <p>
            Calculators relating to mortgages, loans, compound interest, stock returns, taxes, and retirement numbers are based on mathematical assumptions that may not reflect individual lending terms, local property tax variations, insurance underwriting guidelines, or fluctuating market interest rates.
          </p>
          <p>
            Always consult a licensed Certified Financial Planner (CFP®), Certified Public Accountant (CPA), or accredited mortgage broker before executing real estate transactions or significant financial contracts.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            2. Health &amp; Medical Disclaimer
          </h2>
          <p>
            Health-related calculators (such as Body Mass Index, Total Daily Energy Expenditure, Target Heart Rate, Body Fat Percentage, and Pregnancy Due Date) rely on broad demographic population formulas. They do not diagnose conditions, prescribe caloric intake for eating disorders, or replace individualized clinical evaluations by licensed medical doctors (MD) or registered dietitians (RD).
          </p>
          <p>
            Never disregard professional medical advice or delay seeking it because of something you have calculated on this website.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            3. Engineering &amp; Construction Disclaimer
          </h2>
          <p>
            Calculations for structural beams, concrete volume, electrical loads, and material estimations are preliminary planning approximations. They must not replace certified blueprints or stamped professional engineering (PE) approvals required by municipal building codes.
          </p>
        </section>
      </div>
    </div>
  );
};
