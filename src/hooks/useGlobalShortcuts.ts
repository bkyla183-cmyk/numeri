import { useEffect, useRef } from 'react';

export interface ShortcutDefinition {
  id: string;
  keys: string[];
  arKeys?: string[];
  label: string;
  arLabel: string;
  group: 'search' | 'navigation' | 'workspace';
}

export const GLOBAL_SHORTCUTS: ShortcutDefinition[] = [
  {
    id: 'search-alt',
    keys: ['Alt', 'S'],
    label: 'Open & focus global search',
    arLabel: 'فتح والتركيز على البحث الشامل',
    group: 'search',
  },
  {
    id: 'search-mod',
    keys: ['Ctrl / ⌘', 'K'],
    label: 'Toggle quick search palette',
    arLabel: 'فتح أو إغلاق نافذة البحث السريع',
    group: 'search',
  },
  {
    id: 'search-slash',
    keys: ['/'],
    label: 'Quick search (outside text fields)',
    arLabel: 'بحث سريع (خارج حقول الإدخال)',
    group: 'search',
  },
  {
    id: 'nav-calculators',
    keys: ['Alt', 'C'],
    label: 'Go to Calculators directory',
    arLabel: 'الانتقال إلى دليل الحاسبات',
    group: 'navigation',
  },
  {
    id: 'nav-home',
    keys: ['Alt', 'H'],
    label: 'Go to Home page',
    arLabel: 'الانتقال إلى الصفحة الرئيسية',
    group: 'navigation',
  },
  {
    id: 'nav-categories',
    keys: ['Alt', 'K'],
    label: 'Browse Categories',
    arLabel: 'تصفح التصنيفات',
    group: 'navigation',
  },
  {
    id: 'nav-guides',
    keys: ['Alt', 'G'],
    label: 'Open Knowledge Hub guides',
    arLabel: 'فتح مركز المعرفة والمقالات',
    group: 'navigation',
  },
  {
    id: 'nav-saved',
    keys: ['Alt', 'B'],
    label: 'Open Saved bookmarks',
    arLabel: 'فتح الحاسبات والمقالات المحفوظة',
    group: 'navigation',
  },
  {
    id: 'workspace-theme',
    keys: ['Alt', 'D'],
    label: 'Toggle light / dark theme',
    arLabel: 'تبديل الوضع الفاتح / الداكن',
    group: 'workspace',
  },
  {
    id: 'workspace-help',
    keys: ['?'],
    label: 'Show keyboard shortcuts guide',
    arLabel: 'عرض دليل اختصارات لوحة المفاتيح',
    group: 'workspace',
  },
  {
    id: 'workspace-esc',
    keys: ['Esc'],
    label: 'Close open search or dialog',
    arLabel: 'إغلاق نافذة البحث أو الحوار',
    group: 'workspace',
  },
];

interface GlobalShortcutHandlers {
  onOpenSearch: () => void;
  onToggleSearch: () => void;
  onNavigateHome: () => void;
  onNavigateCalculators: () => void;
  onNavigateCategories: () => void;
  onNavigateBlog: () => void;
  onNavigateSaved: () => void;
  onToggleTheme: () => void;
  onToggleShortcutsHelp: () => void;
  onEscape: () => void;
}

function isEditableElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
    return true;
  }
  return target.isContentEditable;
}

export function useGlobalShortcuts(handlers: GlobalShortcutHandlers): void {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      const current = handlersRef.current;
      const key = e.key.toLowerCase();
      const code = e.code;

      // Close active overlays cleanly on Escape
      if (e.key === 'Escape') {
        current.onEscape();
        return;
      }

      // Ctrl+K or Cmd+K toggles quick search anywhere
      if ((e.metaKey || e.ctrlKey) && !e.altKey && (key === 'k' || code === 'KeyK')) {
        e.preventDefault();
        current.onToggleSearch();
        return;
      }

      // Alt + key shortcuts (using both e.code and e.key for macOS Option compatibility)
      if (e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        if (code === 'KeyS' || key === 's') {
          e.preventDefault();
          current.onOpenSearch();
          return;
        }
        if (code === 'KeyC' || key === 'c') {
          e.preventDefault();
          current.onNavigateCalculators();
          return;
        }
        if (code === 'KeyH' || key === 'h') {
          e.preventDefault();
          current.onNavigateHome();
          return;
        }
        if (code === 'KeyK' || key === 'k') {
          e.preventDefault();
          current.onNavigateCategories();
          return;
        }
        if (code === 'KeyG' || key === 'g') {
          e.preventDefault();
          current.onNavigateBlog();
          return;
        }
        if (code === 'KeyB' || key === 'b') {
          e.preventDefault();
          current.onNavigateSaved();
          return;
        }
        if (code === 'KeyD' || key === 'd') {
          e.preventDefault();
          current.onToggleTheme();
          return;
        }
        if (code === 'Slash' || key === '/') {
          e.preventDefault();
          current.onToggleShortcutsHelp();
          return;
        }
      }

      // Unmodified single-character shortcuts only outside form inputs/editable targets
      if (!e.altKey && !e.ctrlKey && !e.metaKey && !isEditableElement(e.target)) {
        if (e.key === '/') {
          e.preventDefault();
          current.onOpenSearch();
          return;
        }
        if (e.key === '?') {
          e.preventDefault();
          current.onToggleShortcutsHelp();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
