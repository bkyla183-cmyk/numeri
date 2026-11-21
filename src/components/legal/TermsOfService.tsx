import React from 'react';
import { FileText, ArrowLeft } from 'lucide-react';

interface Props {
  onBack: () => void;
}

export const TermsOfService: React.FC<Props> = ({ onBack }) => {
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
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          <FileText className="w-4 h-4" />
          <span>User Agreement</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          Terms of Service
        </h1>
        <p className="text-xs text-slate-500 font-mono">
          Effective Date: November 20, 2026
        </p>
      </div>

      <div className="prose-slate max-w-none text-sm text-slate-700 dark:text-slate-300 space-y-6 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">1. Acceptance of Terms</h2>
          <p>
            By accessing and utilizing the computational tools, educational guides, and services provided by <strong>Numeriq</strong>, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">2. Use License &amp; Intellectual Property</h2>
          <p>
            Permission is granted to temporarily view and utilize the calculation software and educational guides on Numeriq for personal, non-commercial, and educational evaluation purposes. You may not modify, distribute, or reverse-engineer the proprietary code algorithms without written consent.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">3. Disclaimer of Mathematical &amp; Advisory Accuracy</h2>
          <p>
            The materials and calculation outputs on Numeriq are provided on an &apos;as is&apos; basis. Numeriq makes no warranties, expressed or implied, regarding mathematical fitness for a specific commercial, legal, medical, or financial purpose. Calculations represent estimations based on standard formulas. Users must verify numbers independently before entering binding contracts.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">4. Limitations of Liability</h2>
          <p>
            In no event shall Numeriq or its contributors be liable for any damages (including, without limitation, damages for loss of profit, business interruption, or personal health consequences) arising out of the use or inability to use the tools.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">5. Modifications to Service</h2>
          <p>
            Numeriq reserves the right to revise or discontinue any calculation tool or knowledge article at any time without notice.
          </p>
        </section>
      </div>
    </div>
  );
};
