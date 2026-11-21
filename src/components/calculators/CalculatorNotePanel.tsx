import React, { useEffect, useRef, useState } from 'react';
import { StickyNote, Check, Pencil, Trash2 } from 'lucide-react';
import {
  CALC_NOTES_STORAGE_KEY,
  CalculatorNoteEntry,
  deleteCalculatorNote,
  getCalculatorNote,
  saveCalculatorNote,
} from '../../utils/calculatorNotes';

interface Props {
  calculatorSlug: string;
  calculatorName: string;
}

const MAX_NOTE_LENGTH = 1000;

function formatNoteTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime()) || date.getTime() === 0) return 'Saved locally';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export const CalculatorNotePanel: React.FC<Props> = ({
  calculatorSlug,
  calculatorName,
}) => {
  const [savedNote, setSavedNote] = useState<CalculatorNoteEntry | null>(() =>
    getCalculatorNote(calculatorSlug)
  );
  const [draft, setDraft] = useState<string>(() => getCalculatorNote(calculatorSlug)?.text ?? '');
  const [isEditing, setIsEditing] = useState<boolean>(() => !getCalculatorNote(calculatorSlug));
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const statusTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const existing = getCalculatorNote(calculatorSlug);
    setSavedNote(existing);
    setDraft(existing?.text ?? '');
    setIsEditing(!existing);
    setStatusMessage(null);
  }, [calculatorSlug]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key !== CALC_NOTES_STORAGE_KEY && e.key !== null) return;
      const synced = getCalculatorNote(calculatorSlug);
      setSavedNote(synced);
      setDraft(synced?.text ?? '');
      setIsEditing(!synced);
    };
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      if (statusTimerRef.current !== null) {
        window.clearTimeout(statusTimerRef.current);
      }
    };
  }, [calculatorSlug]);

  const showTransientStatus = (msg: string) => {
    if (statusTimerRef.current !== null) {
      window.clearTimeout(statusTimerRef.current);
    }
    setStatusMessage(msg);
    statusTimerRef.current = window.setTimeout(() => {
      setStatusMessage(null);
      statusTimerRef.current = null;
    }, 3000);
  };

  const handleSave = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) {
      if (savedNote) {
        deleteCalculatorNote(calculatorSlug);
        setSavedNote(null);
        setDraft('');
        setIsEditing(true);
        showTransientStatus('Note removed');
      }
      return;
    }

    const stored = saveCalculatorNote(calculatorSlug, trimmed);
    setSavedNote(stored);
    setDraft(stored?.text ?? trimmed);
    setIsEditing(false);
    showTransientStatus('Note saved to browser storage');
  };

  const handleDelete = () => {
    deleteCalculatorNote(calculatorSlug);
    setSavedNote(null);
    setDraft('');
    setIsEditing(true);
    showTransientStatus('Note deleted');
  };

  const handleCancel = () => {
    if (savedNote) {
      setDraft(savedNote.text);
      setIsEditing(false);
    } else {
      setDraft('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  const hasDraftText = draft.trim().length > 0;

  return (
    <section
      data-calculator-note-panel
      aria-label={`Personal note for ${calculatorName}`}
      className="mt-6 p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2 min-w-0">
          <StickyNote className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" aria-hidden="true" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
            Calculation Note
          </h2>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          {savedNote ? (
            <>
              <span className="font-mono tabular-nums">
                Saved {formatNoteTimestamp(savedNote.updatedAt)}
              </span>
              {!isEditing && (
                <>
                  <span aria-hidden="true">·</span>
                  <button
                    type="button"
                    onClick={() => {
                      setDraft(savedNote.text);
                      setIsEditing(true);
                    }}
                    className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Pencil className="w-3 h-3" aria-hidden="true" />
                    <span>Edit Note</span>
                  </button>
                  <span aria-hidden="true">·</span>
                  <button
                    type="button"
                    onClick={handleDelete}
                    aria-label="Delete saved calculation note"
                    className="inline-flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Trash2 className="w-3 h-3" aria-hidden="true" />
                    <span>Delete</span>
                  </button>
                </>
              )}
            </>
          ) : (
            <span>Stored privately in localStorage</span>
          )}
        </div>
      </div>

      {savedNote && !isEditing ? (
        <div
          data-saved-note-display
          className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap break-words"
        >
          {savedNote.text}
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label
              htmlFor="calc-personal-note-input"
              className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5"
            >
              Record why you ran this calculation, key assumptions, or comparison context:
            </label>
            <textarea
              id="calc-personal-note-input"
              rows={3}
              maxLength={MAX_NOTE_LENGTH}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`e.g., Scenario comparison for ${calculatorName} — comparing 15-year vs 30-year assumptions...`}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-teal-500/40 resize-y"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-[11px] font-mono tabular-nums text-slate-400 dark:text-slate-500">
              {draft.length} / {MAX_NOTE_LENGTH} chars
            </span>

            <div className="flex items-center gap-2">
              {savedNote && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                data-save-note-button
                disabled={!hasDraftText}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <StickyNote className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Save Note</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {statusMessage && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400"
        >
          <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{statusMessage}</span>
        </div>
      )}
    </section>
  );
};
