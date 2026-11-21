import React, { useState } from 'react';
import { Mail, ArrowLeft, Check, Copy, Info, FileText } from 'lucide-react';

interface Props {
  onBack: () => void;
}

export const ContactUs: React.FC<Props> = ({ onBack }) => {
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('Calculation Error');
  const [calculatorSlug, setCalculatorSlug] = useState('');
  const [message, setMessage] = useState('');
  const [formattedReport, setFormattedReport] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateSummary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    const lines = [
      `Numeriq Feedback / Audit Summary`,
      `Topic: ${topic}`,
      `From: ${name.trim()}`,
      calculatorSlug.trim() ? `Calculator / Page: ${calculatorSlug.trim()}` : null,
      `Timestamp: ${new Date().toISOString()}`,
      `---`,
      message.trim(),
    ].filter(Boolean);

    setFormattedReport(lines.join('\n'));
  };

  const handleCopyReport = () => {
    if (formattedReport && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(formattedReport);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
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
          <Mail className="w-4 h-4" />
          <span>Feedback &amp; Formula Audits</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          Contact Numeriq
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl">
          Spot a formula edge case, rounding discrepancy, or editorial typo? Prepare a structured issue report below.
        </p>
      </div>

      {/* Honest Static Pre-Launch Channel Notice */}
      <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/60 dark:bg-indigo-950/30 flex items-start gap-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
        <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-900 dark:text-slate-100 block mb-0.5">
            Client-Side Static Mode (No Automated Mail Relay Attached)
          </strong>
          This build runs purely as a client-side static web application without a server-side mail endpoint. Submitting this form formats a local, copyable bug or feedback summary in your browser rather than transmitting your data externally. Configure your official support address when publishing on your live domain.
        </div>
      </div>

      {formattedReport ? (
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
              <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Formatted Inquiry Summary (Local Only)</span>
            </div>
            <button
              type="button"
              onClick={handleCopyReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Summary'}</span>
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap overflow-x-auto">
            {formattedReport}
          </pre>

          <button
            type="button"
            onClick={() => {
              setFormattedReport(null);
              setMessage('');
            }}
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
          >
            Prepare Another Note
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleGenerateSummary}
          className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="contact-name"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2"
              >
                Your Name *
              </label>
              <input
                id="contact-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <div>
              <label
                htmlFor="contact-calc"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2"
              >
                Calculator or Page (Optional)
              </label>
              <input
                id="contact-calc"
                type="text"
                value={calculatorSlug}
                onChange={(e) => setCalculatorSlug(e.target.value)}
                placeholder="e.g., /calculator/mortgage-calculator"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="contact-topic"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2"
            >
              Topic / Purpose of Inquiry
            </label>
            <select
              id="contact-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
            >
              <option value="Calculation Error">Report a Mathematical Error or Edge Case</option>
              <option value="General Feedback">General Feedback &amp; Suggestions</option>
              <option value="New Calculator Request">Request a New Calculator Feature</option>
              <option value="Privacy Concern">Privacy &amp; Compliance Inquiry</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="contact-message"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2"
            >
              Details &amp; Sample Inputs *
            </label>
            <textarea
              id="contact-message"
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Include the inputs used, the result displayed, and the expected mathematical output..."
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer w-full sm:w-auto"
          >
            <FileText className="w-4 h-4" />
            <span>Format Issue Summary</span>
          </button>
        </form>
      )}
    </div>
  );
};
