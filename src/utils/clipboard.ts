/**
 * Copies plain text to the system clipboard using the async Clipboard API
 * with a fallback `<textarea>` + `execCommand('copy')` for restricted contexts.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof window === 'undefined' || !text) return false;

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall back to legacy DOM selection copy if Clipboard API rejects
    }
  }

  if (typeof document === 'undefined' || !document.body) return false;

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '-9999px';
  textarea.style.left = '-9999px';
  textarea.style.opacity = '0';

  document.body.appendChild(textarea);
  const previousSelection = document.getSelection()?.rangeCount
    ? document.getSelection()?.getRangeAt(0)
    : null;

  try {
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
    if (previousSelection) {
      const sel = document.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(previousSelection);
    }
  }
}
