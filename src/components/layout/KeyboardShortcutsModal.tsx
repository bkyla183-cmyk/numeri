import React, { useEffect, useRef } from 'react';
import { Keyboard, X } from 'lucide-react';
import { GLOBAL_SHORTCUTS, ShortcutDefinition } from '../../hooks/useGlobalShortcuts';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'ar';
}

const GROUP_TITLES: Record<ShortcutDefinition['group'], { en: string; ar: string }> = {
  search: { en: 'Search & Discovery', ar: 'البحث والوصول السريع' },
  navigation: { en: 'Page Navigation', ar: 'التنقل بين الصفحات' },
  workspace: { en: 'Workspace & Accessibility', ar: 'بيئة العمل وإمكانية الوصول' },
};

export const KeyboardShortcutsModal: React.FC<Props> = ({ isOpen, onClose, lang }) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const timer = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 20);
    return () => {
      window.clearTimeout(timer);
      previouslyFocused?.focus?.();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const groups: ShortcutDefinition['group'][] = ['search', 'navigation', 'workspace'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="keyboard-shortcuts-title"
        className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <Keyboard className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
            <div>
              <h2
                id="keyboard-shortcuts-title"
                className="text-base font-bold text-slate-900 dark:text-slate-100"
              >
                {lang === 'ar' ? 'اختصارات لوحة المفاتيح' : 'Keyboard Shortcuts'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'ar'
                  ? 'تنقل أسرع عبر الحاسبات والأدلة بدون استخدام الفأرة'
                  : 'Navigate calculators, guides, and search without leaving the keyboard'}
              </p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label={lang === 'ar' ? 'إغلاق دليل الاختصارات' : 'Close keyboard shortcuts'}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcut List */}
        <div className="max-h-[65vh] overflow-y-auto p-5 space-y-6">
          {groups.map((group) => {
            const items = GLOBAL_SHORTCUTS.filter((item) => item.group === group);
            return (
              <section key={group} className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {GROUP_TITLES[group][lang]}
                </h3>
                <div className="divide-y divide-slate-100 dark:divide-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/40">
                  {items.map((shortcut) => (
                    <div
                      key={shortcut.id}
                      className="flex items-center justify-between gap-4 px-3.5 py-2.5 text-xs sm:text-sm"
                    >
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {lang === 'ar' ? shortcut.arLabel : shortcut.label}
                      </span>
                      <div className="flex items-center gap-1 shrink-0" dir="ltr">
                        {shortcut.keys.map((keyLabel, idx) => (
                          <React.Fragment key={keyLabel}>
                            {idx > 0 && (
                              <span className="text-[11px] text-slate-400 font-mono">+</span>
                            )}
                            <kbd className="px-2 py-0.5 text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-2xs whitespace-nowrap">
                              {keyLabel}
                            </kbd>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>
            {lang === 'ar'
              ? 'ملاحظة: على macOS استخدم Option بدلاً من Alt'
              : 'Tip: On macOS, Alt corresponds to the Option key'}
          </span>
          <span className="font-mono">Esc</span>
        </div>
      </div>
    </div>
  );
};
