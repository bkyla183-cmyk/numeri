export const CALC_NOTES_STORAGE_KEY = 'numeriq_calculator_notes';

export interface CalculatorNoteEntry {
  text: string;
  updatedAt: string;
}

export type CalculatorNotesMap = Record<string, CalculatorNoteEntry>;

function isValidNoteEntry(val: unknown): val is CalculatorNoteEntry {
  return (
    typeof val === 'object' &&
    val !== null &&
    typeof (val as CalculatorNoteEntry).text === 'string' &&
    typeof (val as CalculatorNoteEntry).updatedAt === 'string'
  );
}

export function getAllCalculatorNotes(): CalculatorNotesMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(CALC_NOTES_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return {};
    }
    const clean: CalculatorNotesMap = {};
    for (const [slug, val] of Object.entries(parsed)) {
      if (typeof val === 'string' && val.trim()) {
        clean[slug] = { text: val.trim(), updatedAt: new Date(0).toISOString() };
      } else if (isValidNoteEntry(val) && val.text.trim()) {
        clean[slug] = { text: val.text, updatedAt: val.updatedAt };
      }
    }
    return clean;
  } catch {
    return {};
  }
}

export function getCalculatorNote(slug: string): CalculatorNoteEntry | null {
  if (!slug) return null;
  const all = getAllCalculatorNotes();
  return all[slug] ?? null;
}

export function saveCalculatorNote(slug: string, rawText: string): CalculatorNoteEntry | null {
  if (typeof window === 'undefined' || !slug) return null;
  const trimmed = rawText.trim();
  const all = getAllCalculatorNotes();

  if (!trimmed) {
    delete all[slug];
    try {
      window.localStorage.setItem(CALC_NOTES_STORAGE_KEY, JSON.stringify(all));
    } catch {
      // Ignore storage quota or private-browsing errors
    }
    return null;
  }

  const entry: CalculatorNoteEntry = {
    text: trimmed,
    updatedAt: new Date().toISOString(),
  };
  all[slug] = entry;

  try {
    window.localStorage.setItem(CALC_NOTES_STORAGE_KEY, JSON.stringify(all));
  } catch {
    // Ignore storage quota or private-browsing errors
  }

  return entry;
}

export function deleteCalculatorNote(slug: string): void {
  if (typeof window === 'undefined' || !slug) return;
  const all = getAllCalculatorNotes();
  if (!(slug in all)) return;
  delete all[slug];
  try {
    window.localStorage.setItem(CALC_NOTES_STORAGE_KEY, JSON.stringify(all));
  } catch {
    // Ignore storage quota or private-browsing errors
  }
}
