import React from 'react';
import { Shield, ArrowLeft } from 'lucide-react';

interface Props {
  onBack: () => void;
  onNavigateContact?: () => void;
}

export const PrivacyPolicy: React.FC<Props> = ({ onBack, onNavigateContact }) => {
  const originDisplay =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'this Numeriq web property';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Home</span>
      </button>

      <div className="space-y-3 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          <Shield className="w-4 h-4" />
          <span>Legal &amp; Privacy</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          Privacy Policy
        </h1>
        <p className="text-xs text-slate-500 font-mono">
          Last Updated: November 20, 2026
        </p>
      </div>

      <div className="prose-slate max-w-none text-sm text-slate-700 dark:text-slate-300 space-y-6 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">1. Overview &amp; Client-Side Calculation Privacy</h2>
          <p>
            <strong>Numeriq</strong> (served via {originDisplay}) executes calculator computations entirely inside your web browser. Numerical figures you enter into mortgage, income tax, loan, BMI, calorie, or scientific calculators are not transmitted to or stored on an application backend database.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">2. Browser Local Storage (First-Party Preferences)</h2>
          <p>
            To support optional usability preferences without requiring user accounts, Numeriq stores limited non-personal settings strictly in your browser&apos;s <code className="font-mono text-xs px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800">localStorage</code>:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><code className="font-mono text-xs">calc_theme</code> — remembers your light or dark display preference.</li>
            <li><code className="font-mono text-xs">calc_saved_calcs</code> &amp; <code className="font-mono text-xs">calc_saved_posts</code> — stores bookmarked calculators and reading list guides locally.</li>
            <li><code className="font-mono text-xs">numeriq_calc_usage</code> — counts calculator opens locally in your browser to sort the &quot;Featured &amp; Trending&quot; panel (you may reset this anytime on the homepage).</li>
          </ul>
          <p>
            You can inspect or clear this data at any time through your browser settings or via the clear controls inside the Saved and Featured panels.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">3. Hosting Infrastructure Logs</h2>
          <p>
            Standard web hosting infrastructure may temporarily process routine HTTP request metadata (such as IP address, requested URL path, user-agent header, and timestamp) to deliver pages reliably, prevent abuse, and serve static assets securely over HTTPS.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">4. Advertising &amp; Third-Party Cookies</h2>
          <p>
            Numeriq is architected to support ethical, policy-compliant display advertising (such as Google AdSense) only after formal publisher approval, domain verification, and regional consent configuration are completed. No third-party advertising scripts or tracking pixels are activated without authorization. When active on a verified deployment, advertising partners may use cookies or local identifiers to serve contextual or personalized ads and measure performance.
          </p>
          <p>
            Visitors can learn about how Google uses information from partner sites and manage personalized advertising preferences at:{' '}
            <a
              href="https://policies.google.com/technologies/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 dark:text-indigo-400 underline font-mono break-all"
            >
              https://policies.google.com/technologies/ads
            </a>
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">5. International Privacy &amp; Consent Rights</h2>
          <p>
            Numeriq does not sell personal information and does not maintain user accounts containing calculator input histories. Where regional frameworks apply on a live deployment with advertising or analytics enabled, Numeriq respects applicable consent and privacy obligations across our primary markets:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>United Kingdom &amp; EEA (UK GDPR / GDPR / PECR):</strong> Non-essential advertising or analytics cookies require prior opt-in consent via a compliant Consent Management Platform (CMP) before activation.</li>
            <li><strong>United States (CCPA / CPRA &amp; State Privacy Laws):</strong> Residents retain rights to opt out of cross-context behavioral advertising and request information on third-party vendor disclosures.</li>
            <li><strong>Canada (PIPEDA), Australia (Privacy Act 1988 / APPs) &amp; New Zealand (Privacy Act 2020):</strong> Calculator processing remains strictly client-side, minimizing data collection and allowing full browser-level cookie/storage control.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">6. Children&apos;s Privacy</h2>
          <p>
            Numeriq is an educational and general utility reference site and does not knowingly collect personal information from children under 13 (or the applicable age of digital consent in the UK, EEA, Canada, Australia, or New Zealand).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">7. Contact &amp; Inquiries</h2>
          <p>
            Questions regarding this Privacy Policy or requests about formula or site compliance may be submitted via our{' '}
            <a
              href="/contact"
              onClick={(e) => {
                if (onNavigateContact) {
                  e.preventDefault();
                  onNavigateContact();
                }
              }}
              className="text-indigo-600 dark:text-indigo-400 underline font-medium"
            >
              Contact page
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
};
