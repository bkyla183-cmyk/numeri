import React, { useEffect, useState } from 'react';
import {
  MessageSquarePlus,
  X,
  AlertTriangle,
  Lightbulb,
  Check,
  Copy,
  Send,
  Mail,
} from 'lucide-react';

type FeedbackType = 'incorrect_result' | 'missing_feature';

interface FeedbackSubmission {
  id: string;
  calculatorSlug: string;
  calculatorName: string;
  categorySlug: string;
  type: FeedbackType;
  details: string;
  contact?: string;
  submittedAt: string;
}

interface Props {
  calculatorSlug: string;
  calculatorName: string;
  categorySlug: string;
}

const FEEDBACK_STORAGE_KEY = 'numeriq_editorial_feedback';
const EDITORIAL_EMAIL = 'editorial@numeriq.app';

export const CalculatorFeedbackWidget: React.FC<Props> = ({
  calculatorSlug,
  calculatorName,
  categorySlug,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('incorrect_result');
  const [details, setDetails] = useState('');
  const [contact, setContact] = useState('');
  const [submittedReport, setSubmittedReport] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Reset form state cleanly when switching to a different calculator
  useEffect(() => {
    setSubmittedReport(null);
    setDetails('');
    setCopied(false);
  }, [calculatorSlug]);

  // Allow closing popover with Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedDetails = details.trim();
    if (!trimmedDetails) return;

    const timestamp = new Date().toISOString();
    const entry: FeedbackSubmission = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      calculatorSlug,
      calculatorName,
      categorySlug,
      type: feedbackType,
      details: trimmedDetails,
      contact: contact.trim() || undefined,
      submittedAt: timestamp,
    };

    try {
      const existingRaw = window.localStorage.getItem(FEEDBACK_STORAGE_KEY);
      const existingParsed = existingRaw ? (JSON.parse(existingRaw) as unknown) : [];
      const existingList = Array.isArray(existingParsed) ? existingParsed : [];
      const updated = [entry, ...existingList].slice(0, 25);
      window.localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore storage quota or private browsing limitations cleanly
    }

    const typeLabel =
      feedbackType === 'incorrect_result'
        ? 'Incorrect Calculation Result'
        : 'Missing Feature / Enhancement';

    const reportText = [
      `Numeriq Editorial Feedback Report`,
      `Type: ${typeLabel}`,
      `Calculator: ${calculatorName} (/calculator/${calculatorSlug})`,
      `Category: ${categorySlug}`,
      contact.trim() ? `Reply Contact: ${contact.trim()}` : null,
      `Timestamp: ${timestamp}`,
      `---`,
      trimmedDetails,
    ]
      .filter(Boolean)
      .join('\n');

    setSubmittedReport(reportText);
    setCopied(false);
  };

  const handleCopyReport = () => {
    if (!submittedReport || !navigator.clipboard?.writeText) return;
    navigator.clipboard.writeText(submittedReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const mailtoHref = submittedReport
    ? `mailto:${EDITORIAL_EMAIL}?subject=${encodeURIComponent(
        `[${feedbackType === 'incorrect_result' ? 'Result Audit' : 'Feature Idea'}] ${calculatorName}`
      )}&body=${encodeURIComponent(submittedReport)}`
    : undefined;

  return (
    <div
      data-feedback-widget
      className="fixed bottom-5 right-5 z-40"
    >
      {isOpen ? (
        <section
          role="dialog"
          aria-label={`Feedback for ${calculatorName}`}
          className="w-[min(calc(100vw-2.5rem),23rem)] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
                Calculator Feedback
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {calculatorName}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close feedback widget"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {submittedReport ? (
            <div className="p-4 space-y-3.5">
              <div className="flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl p-3">
                <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <span className="font-semibold block text-emerald-900 dark:text-emerald-200">
                    Feedback formatted for editorial review
                  </span>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 leading-relaxed block mt-0.5">
                    Saved locally on this device. Send it via your email app or copy the structured note below.
                  </span>
                </div>
              </div>

              <pre className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap max-h-36 overflow-y-auto leading-relaxed">
                {submittedReport}
              </pre>

              <div className="flex flex-wrap items-center gap-2">
                {mailtoHref && (
                  <a
                    href={mailtoHref}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors whitespace-nowrap"
                  >
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span>Email Editorial</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={handleCopyReport}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer whitespace-nowrap"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSubmittedReport(null);
                  setDetails('');
                }}
                className="w-full py-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                Submit another note
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
              {/* Issue Type Segmented Control */}
              <div
                className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800"
                role="group"
                aria-label="Feedback category"
              >
                <button
                  type="button"
                  aria-pressed={feedbackType === 'incorrect_result'}
                  onClick={() => setFeedbackType('incorrect_result')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    feedbackType === 'incorrect_result'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Incorrect Result</span>
                </button>
                <button
                  type="button"
                  aria-pressed={feedbackType === 'missing_feature'}
                  onClick={() => setFeedbackType('missing_feature')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    feedbackType === 'missing_feature'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Lightbulb className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span>Suggest Feature</span>
                </button>
              </div>

              <div>
                <label
                  htmlFor="calc-feedback-details"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  {feedbackType === 'incorrect_result'
                    ? 'Inputs & Expected Output'
                    : 'Requested Feature or Unit'}
                </label>
                <textarea
                  id="calc-feedback-details"
                  required
                  rows={3}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder={
                    feedbackType === 'incorrect_result'
                      ? 'Share the inputs entered, shown result, and expected value...'
                      : 'Describe the missing option, unit, or formula you would like added...'
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-teal-500/50 resize-none"
                />
              </div>

              <div>
                <label
                  htmlFor="calc-feedback-contact"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Email (Optional)
                </label>
                <input
                  id="calc-feedback-contact"
                  type="email"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <Send className="w-3.5 h-3.5 shrink-0" />
                <span>Send to Editorial Team</span>
              </button>
            </form>
          )}
        </section>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-expanded={false}
          aria-label="Open calculator feedback form"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 border border-slate-800 dark:border-slate-200 shadow-lg hover:bg-slate-800 dark:hover:bg-white transition-all cursor-pointer text-xs font-semibold whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
        >
          <MessageSquarePlus className="w-4 h-4 text-teal-400 dark:text-teal-600 shrink-0" />
          <span>Feedback</span>
        </button>
      )}
    </div>
  );
};
