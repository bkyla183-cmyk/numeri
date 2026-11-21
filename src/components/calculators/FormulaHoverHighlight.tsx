import React, { useMemo, useState } from 'react';
import { Sigma, Pin, PinOff, ArrowUp } from 'lucide-react';

export interface FormulaVariableChip {
  symbol: string;
  name: string;
  value?: string | number;
  unit?: string;
}

interface FormulaHoverHighlightProps {
  /** Exact mathematical formula expression active for this result */
  formula: string;
  /** Descriptive title for the active formula branch or metric */
  formulaLabel?: string;
  /** Live variable symbols paired with descriptions and current user values */
  variables?: FormulaVariableChip[];
  /** Live substituted derivation or step line corresponding to current inputs */
  activeStep?: string;
  /** Semantic accent theme */
  accent?: 'teal' | 'indigo';
  /** Surface tone override for calculators embedded inside a permanently dark chassis */
  tone?: 'auto' | 'dark';
  /** The primary calculated result element that triggers formula highlighting on hover/focus */
  children: React.ReactNode;
}

interface FormulaSegment {
  text: string;
  matchedSymbol: string | null;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function tokenizeFormula(formula: string, symbols: string[]): FormulaSegment[] {
  const cleanFormula = (formula || '').trim();
  if (!cleanFormula) return [];

  const uniqueSymbols = Array.from(
    new Set(
      symbols
        .map((s) => s.trim())
        .filter((s) => s.length >= 1 && s.length <= 24)
    )
  ).sort((a, b) => b.length - a.length);

  if (uniqueSymbols.length === 0) {
    return [{ text: cleanFormula, matchedSymbol: null }];
  }

  const pattern = new RegExp(`(${uniqueSymbols.map(escapeRegExp).join('|')})`, 'g');
  const segments: FormulaSegment[] = [];
  let lastIdx = 0;

  for (const match of cleanFormula.matchAll(pattern)) {
    const idx = match.index ?? 0;
    const token = match[0];
    const prevChar = idx > 0 ? cleanFormula[idx - 1] : '';
    const nextChar = idx + token.length < cleanFormula.length ? cleanFormula[idx + token.length] : '';

    // Prevent highlighting single ASCII letters inside longer plain English words (e.g. "r" inside "Rate")
    const isAsciiWordToken = /^[A-Za-z0-9_]+$/.test(token);
    const touchesPrevLetter = isAsciiWordToken && /[A-Za-z]/.test(prevChar);
    const touchesNextLetter = isAsciiWordToken && /[A-Za-z]/.test(nextChar);

    if (touchesPrevLetter || touchesNextLetter) {
      continue;
    }

    if (idx > lastIdx) {
      segments.push({ text: cleanFormula.slice(lastIdx, idx), matchedSymbol: null });
    }
    segments.push({ text: token, matchedSymbol: token });
    lastIdx = idx + token.length;
  }

  if (lastIdx < cleanFormula.length) {
    segments.push({ text: cleanFormula.slice(lastIdx), matchedSymbol: null });
  }

  return segments.length > 0 ? segments : [{ text: cleanFormula, matchedSymbol: null }];
}

function formatVariableValue(val: string | number | undefined, unit?: string): string | null {
  if (val === undefined || val === null || val === '') return null;
  const formatted =
    typeof val === 'number'
      ? Number.isFinite(val)
        ? val.toLocaleString('en-US', { maximumFractionDigits: 4 })
        : String(val)
      : String(val);
  return unit ? `${formatted} ${unit}` : formatted;
}

export const FormulaHoverHighlight: React.FC<FormulaHoverHighlightProps> = ({
  formula,
  formulaLabel = 'Formula used for this result',
  variables = [],
  activeStep,
  accent = 'teal',
  tone = 'auto',
  children,
}) => {
  const [isHoveringResult, setIsHoveringResult] = useState(false);
  const [isFocusedResult, setIsFocusedResult] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [hoveredSymbol, setHoveredSymbol] = useState<string | null>(null);

  const isActive = isHoveringResult || isFocusedResult || isPinned || hoveredSymbol !== null;

  const symbols = useMemo(
    () => variables.map((v) => v.symbol).filter(Boolean),
    [variables]
  );

  const segments = useMemo(
    () => tokenizeFormula(formula, symbols),
    [formula, symbols]
  );

  const activeVariableInfo = useMemo(
    () => variables.find((v) => v.symbol === hoveredSymbol),
    [variables, hoveredSymbol]
  );

  const isDarkTone = tone === 'dark';

  const ringClass =
    accent === 'indigo'
      ? 'ring-2 ring-indigo-500/45 dark:ring-indigo-400/45'
      : 'ring-2 ring-teal-500/45 dark:ring-teal-400/45';

  const panelActiveClass = isDarkTone
    ? accent === 'indigo'
      ? 'border-indigo-500/80 bg-indigo-950/50 shadow-sm'
      : 'border-teal-500/80 bg-teal-950/50 shadow-sm'
    : accent === 'indigo'
      ? 'border-indigo-400 dark:border-indigo-500/80 bg-indigo-50/75 dark:bg-indigo-950/35 shadow-sm'
      : 'border-teal-400 dark:border-teal-500/80 bg-teal-50/75 dark:bg-teal-950/35 shadow-sm';

  const panelIdleClass = isDarkTone
    ? 'border-slate-800 bg-slate-950/70'
    : 'border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60';

  const tokenBaseHighlight = isDarkTone
    ? accent === 'indigo'
      ? 'bg-indigo-900/70 text-indigo-100 border-indigo-700'
      : 'bg-teal-900/70 text-teal-100 border-teal-700'
    : accent === 'indigo'
      ? 'bg-indigo-100/90 dark:bg-indigo-900/70 text-indigo-900 dark:text-indigo-100 border-indigo-300/80 dark:border-indigo-700'
      : 'bg-teal-100/90 dark:bg-teal-900/70 text-teal-900 dark:text-teal-100 border-teal-300/80 dark:border-teal-700';

  if (!formula || !formula.trim()) {
    return <>{children}</>;
  }

  return (
    <div className="space-y-2.5">
      {/* Hover/focus sensor wrapping the calculated result */}
      <div
        tabIndex={0}
        onMouseEnter={() => setIsHoveringResult(true)}
        onMouseLeave={() => setIsHoveringResult(false)}
        onFocusCapture={() => setIsFocusedResult(true)}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
            setIsFocusedResult(false);
          }
        }}
        aria-describedby="active-formula-highlight"
        className={`rounded-2xl transition-shadow duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
          isActive ? ringClass : ''
        }`}
      >
        {children}
      </div>

      {/* Connected Educational Formula Spotlight Panel */}
      <div
        id="active-formula-highlight"
        role="region"
        aria-label="Active calculation formula"
        className={`rounded-xl border px-4 py-3 transition-colors duration-150 ${
          isActive ? panelActiveClass : panelIdleClass
        }`}
      >
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs">
            <Sigma
              className={`w-3.5 h-3.5 shrink-0 transition-colors duration-150 ${
                isActive
                  ? accent === 'indigo'
                    ? isDarkTone ? 'text-indigo-400' : 'text-indigo-600 dark:text-indigo-400'
                    : isDarkTone ? 'text-teal-400' : 'text-teal-600 dark:text-teal-400'
                  : isDarkTone ? 'text-slate-400' : 'text-slate-400 dark:text-slate-500'
              }`}
            />
            <span
              className={`font-semibold transition-colors duration-150 ${
                isDarkTone
                  ? isActive ? 'text-slate-100' : 'text-slate-300'
                  : isActive ? 'text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {formulaLabel}
            </span>
            <span aria-hidden="true" className={isDarkTone ? 'text-slate-700' : 'text-slate-300 dark:text-slate-700'}>·</span>
            <span
              className={`inline-flex items-center gap-1 text-[11px] transition-opacity duration-150 ${
                isActive
                  ? accent === 'indigo'
                    ? isDarkTone ? 'text-indigo-300 font-medium' : 'text-indigo-700 dark:text-indigo-300 font-medium'
                    : isDarkTone ? 'text-teal-300 font-medium' : 'text-teal-700 dark:text-teal-300 font-medium'
                  : isDarkTone ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {isActive && <ArrowUp className="w-3 h-3 shrink-0" />}
              <span>{isActive ? 'Highlighted for active result' : 'Hover result to trace formula'}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsPinned((prev) => !prev)}
            aria-pressed={isPinned}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-medium whitespace-nowrap shrink-0 cursor-pointer transition-colors duration-150 ${
              isPinned
                ? accent === 'indigo'
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'bg-teal-600 border-teal-600 text-white'
                : isDarkTone
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {isPinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
            <span>{isPinned ? 'Pinned' : 'Pin Formula'}</span>
          </button>
        </div>

        {/* Tokenized Mathematical Equation Display */}
        <div
          className={`mt-2.5 px-3 py-2.5 rounded-lg border font-mono tabular-nums text-xs sm:text-sm leading-relaxed overflow-x-auto transition-colors duration-150 ${
            isDarkTone
              ? isActive
                ? 'bg-slate-950 border-indigo-700/80 text-slate-100'
                : 'bg-slate-950/90 border-slate-800 text-slate-300'
              : isActive
                ? 'bg-white dark:bg-slate-950 border-teal-200/90 dark:border-teal-800/80 text-slate-900 dark:text-slate-100'
                : 'bg-white/80 dark:bg-slate-950/70 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          {segments.map((seg, i) => {
            if (!seg.matchedSymbol) {
              return (
                <span
                  key={i}
                  className={
                    hoveredSymbol !== null
                      ? 'opacity-50 transition-opacity duration-150'
                      : 'transition-opacity duration-150'
                  }
                >
                  {seg.text}
                </span>
              );
            }

            const isSelectedSymbol = hoveredSymbol === seg.matchedSymbol;
            const hasOtherSelected = hoveredSymbol !== null && !isSelectedSymbol;

            return (
              <span
                key={i}
                onMouseEnter={() => setHoveredSymbol(seg.matchedSymbol)}
                onMouseLeave={() => setHoveredSymbol(null)}
                className={`inline-block rounded px-1 py-0.5 mx-0.5 border font-semibold transition-all duration-150 cursor-default ${
                  isSelectedSymbol
                    ? isDarkTone
                      ? 'bg-amber-500/30 text-amber-100 border-amber-400/80'
                      : 'bg-amber-200/90 dark:bg-amber-500/30 text-amber-950 dark:text-amber-100 border-amber-400 dark:border-amber-400/80'
                    : isActive
                      ? `${tokenBaseHighlight} ${hasOtherSelected ? 'opacity-45' : 'opacity-100'}`
                      : isDarkTone
                        ? 'border-transparent text-slate-100 font-semibold'
                        : 'border-transparent text-slate-900 dark:text-slate-100 font-semibold'
                }`}
              >
                {seg.text}
              </span>
            );
          })}
        </div>

        {/* Interactive Variable-to-Input Mapping */}
        {variables.length > 0 && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {variables.slice(0, 6).map((v, idx) => {
              const formattedVal = formatVariableValue(v.value, v.unit);
              const isSymActive = hoveredSymbol === v.symbol;
              return (
                <button
                  key={`${v.symbol}-${idx}`}
                  type="button"
                  onMouseEnter={() => setHoveredSymbol(v.symbol)}
                  onMouseLeave={() => setHoveredSymbol(null)}
                  onFocus={() => setHoveredSymbol(v.symbol)}
                  onBlur={() => setHoveredSymbol(null)}
                  title={v.name}
                  className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[11px] font-mono tabular-nums whitespace-nowrap transition-colors duration-150 cursor-pointer ${
                    isSymActive
                      ? isDarkTone
                        ? 'bg-amber-950/60 border-amber-500 text-amber-100'
                        : 'bg-amber-100 dark:bg-amber-950/60 border-amber-400 dark:border-amber-500 text-amber-950 dark:text-amber-100'
                      : isDarkTone
                        ? isActive
                          ? 'bg-slate-900 border-indigo-800/80 text-slate-200'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400'
                        : isActive
                          ? 'bg-white dark:bg-slate-900 border-teal-200 dark:border-teal-800/80 text-slate-800 dark:text-slate-200'
                          : 'bg-white/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="font-bold">{v.symbol}</span>
                  <span className={isDarkTone ? 'text-slate-500' : 'text-slate-400 dark:text-slate-500'}>=</span>
                  <span className="font-sans font-medium truncate max-w-[140px]">
                    {formattedVal ?? v.name}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Active Variable Definition or Live Substituted Step */}
        {(activeVariableInfo || (isActive && activeStep)) && (
          <div
            className={`mt-2 pt-2 border-t text-[11px] font-mono tabular-nums flex flex-wrap items-center gap-2 ${
              isDarkTone
                ? 'border-slate-800 text-slate-300'
                : 'border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-300'
            }`}
          >
            {activeVariableInfo ? (
              <span>
                <strong className={isDarkTone ? 'text-amber-300' : 'text-amber-800 dark:text-amber-300'}>
                  {activeVariableInfo.symbol}
                </strong>
                {': '}
                <span className="font-sans">{activeVariableInfo.name}</span>
                {formatVariableValue(activeVariableInfo.value, activeVariableInfo.unit) && (
                  <>
                    {' — Current input: '}
                    <strong>{formatVariableValue(activeVariableInfo.value, activeVariableInfo.unit)}</strong>
                  </>
                )}
              </span>
            ) : (
              <span>
                <span
                  className={`font-sans font-semibold mr-1.5 ${
                    isDarkTone ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Active step:
                </span>
                {activeStep}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
