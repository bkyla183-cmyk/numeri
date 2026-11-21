import React, { useState, useEffect, useCallback } from 'react';
import { Delete, History } from 'lucide-react';
import { evaluateScientificExpression } from '../../utils/scientificParser';
import { FormulaHoverHighlight } from './FormulaHoverHighlight';
import { useRoundingPrecision } from '../../context/RoundingPrecisionContext';
import { formatNumberWithPrecision } from '../../utils/roundingPrecision';
import { ResultViewToggle, ResultViewMode } from './ResultViewToggle';
import { ScientificChartView } from './StandaloneInteractiveCharts';

export const ScientificCalculator: React.FC = () => {
  const { precision } = useRoundingPrecision();
  const [expression, setExpression] = useState<string>('');
  const [result, setResult] = useState<string>('0');
  const [numericResult, setNumericResult] = useState<number | null>(null);
  const [angleMode, setAngleMode] = useState<'deg' | 'rad'>('deg');
  const [memory, setMemory] = useState<number>(0);
  const [ans, setAns] = useState<number>(0);
  const [history, setHistory] = useState<{ expr: string; res: string; numericVal?: number }[]>([]);
  const [isSecond, setIsSecond] = useState<boolean>(false);
  const [resultViewMode, setResultViewMode] = useState<ResultViewMode>('text');

  const append = useCallback((val: string) => {
    setExpression((prev) => prev + val);
  }, []);

  const clear = useCallback(() => {
    setExpression('');
    setResult('0');
    setNumericResult(null);
  }, []);

  const backspace = useCallback(() => {
    setExpression((prev) => prev.slice(0, -1));
  }, []);

  const evaluateMath = useCallback(() => {
    try {
      if (!expression.trim()) return;
      const val = evaluateScientificExpression(expression, angleMode, ans);
      if (!Number.isFinite(val)) {
        setResult('Error');
        setNumericResult(null);
        return;
      }
      const formatted = Number.isInteger(val) ? val.toString() : parseFloat(val.toFixed(8)).toString();
      setResult(formatted);
      setNumericResult(val);
      setAns(val);
      setHistory((prev) => [{ expr: expression, res: formatted, numericVal: val }, ...prev.slice(0, 7)]);
    } catch {
      setResult('Error');
      setNumericResult(null);
    }
  }, [expression, angleMode, ans]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)
      ) {
        return;
      }

      if (/^[0-9.()]$/.test(e.key)) {
        e.preventDefault();
        append(e.key);
      } else if (e.key === '+') {
        e.preventDefault();
        append('+');
      } else if (e.key === '-') {
        e.preventDefault();
        append('-');
      } else if (e.key === '*') {
        e.preventDefault();
        append('×');
      } else if (e.key === '/') {
        e.preventDefault();
        append('÷');
      } else if (e.key === '^') {
        e.preventDefault();
        append('^');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        evaluateMath();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        backspace();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        clear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [append, backspace, clear, evaluateMath]);

  const formatSciDisplay = (val: number) => {
    if (precision === 'auto') {
      return Number.isInteger(val) ? val.toString() : parseFloat(val.toFixed(8)).toString();
    }
    return formatNumberWithPrecision(val, precision, { useGrouping: false });
  };

  const displayedResult =
    result === 'Error' || numericResult === null ? result : formatSciDisplay(numericResult);

  const currentNumericResult = (): number => {
    if (numericResult !== null && Number.isFinite(numericResult)) return numericResult;
    const parsed = parseFloat(result);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const evaluatedExpr = expression.trim() || history[0]?.expr || '';
  const hasTrig = /\b(a?sin|a?cos|a?tan)\b/i.test(evaluatedExpr);
  const hasLogExp = /\b(log|ln|exp|pow)\b/i.test(evaluatedExpr);
  const hasRootFact = /\b(sqrt|cbrt|fact)\b|\^/i.test(evaluatedExpr);
  const scientificFormulaLabel = hasTrig
    ? `Trigonometric Rule (${angleMode.toUpperCase()} Mode)`
    : hasLogExp
      ? 'Logarithmic & Exponential Evaluation'
      : hasRootFact
        ? 'Powers, Roots & Factorial Evaluation'
        : 'Scientific Expression Evaluation';
  const scientificActiveStep = !evaluatedExpr
    ? `Enter an expression and press "=" (current angle mode: ${angleMode.toUpperCase()}).`
    : hasTrig
      ? `${evaluatedExpr} = ${displayedResult} · ${angleMode === 'deg' ? 'DEG converts angles via θ × π/180.' : 'RAD evaluates inputs directly in radians.'}`
      : `${evaluatedExpr} = ${displayedResult} · Angle Mode: ${angleMode.toUpperCase()}`;

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-slate-900 dark:bg-slate-950 text-white shadow-xl border border-slate-800 max-w-2xl mx-auto">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Result Display ({angleMode.toUpperCase()})
          </span>
          <ResultViewToggle mode={resultViewMode} onChange={setResultViewMode} tone="dark" />
        </div>

        <div className="mb-5">
          {resultViewMode === 'chart' ? (
            <ScientificChartView
              expression={expression}
              displayedResult={displayedResult}
              angleMode={angleMode}
              ans={ans}
              history={history}
              onSelectPreset={(preset) => {
                setExpression(preset);
                try {
                  const val = evaluateScientificExpression(preset, angleMode, ans);
                  if (Number.isFinite(val)) {
                    const formatted = Number.isInteger(val) ? val.toString() : parseFloat(val.toFixed(8)).toString();
                    setResult(formatted);
                    setNumericResult(val);
                    setAns(val);
                    setHistory((prev) => [{ expr: preset, res: formatted, numericVal: val }, ...prev.slice(0, 7)]);
                  }
                } catch {
                  // Ignore evaluation error on preset
                }
              }}
            />
          ) : (
            <FormulaHoverHighlight
              tone="dark"
              accent="indigo"
              formulaLabel={scientificFormulaLabel}
              formula={evaluatedExpr ? `${evaluatedExpr} = ${displayedResult}` : 'Result = eval(Expr)'}
              variables={[
                { symbol: 'Expr', name: 'Evaluated expression', value: evaluatedExpr || 'Ready' },
                { symbol: 'ANS', name: 'Previous numeric answer', value: ans },
                ...(memory !== 0 ? [{ symbol: 'M', name: 'Stored memory register', value: memory }] : []),
              ]}
              activeStep={scientificActiveStep}
            >
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80">
                <div className="flex justify-between items-center text-xs text-slate-400 font-mono mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] uppercase font-semibold text-indigo-400">
                      {angleMode}
                    </span>
                    {memory !== 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-mono">
                        M = {memory}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] truncate max-w-[220px]">
                    {expression || 'Ready (keyboard enabled)'}
                  </span>
                </div>

                <div
                  aria-live="polite"
                  className="text-right font-mono text-3xl sm:text-4xl font-extrabold tracking-tight text-white overflow-x-auto whitespace-nowrap pb-1"
                >
                  {displayedResult}
                </div>
              </div>
            </FormulaHoverHighlight>
          )}
        </div>

        <div className="grid grid-cols-6 gap-2 mb-3">
          <button
            type="button"
            onClick={() => setAngleMode(angleMode === 'deg' ? 'rad' : 'deg')}
            aria-label={`Switch angle mode, currently ${angleMode.toUpperCase()}`}
            className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
          >
            {angleMode.toUpperCase()}
          </button>
          <button
            type="button"
            onClick={() => setIsSecond(!isSecond)}
            aria-pressed={isSecond}
            aria-label="Toggle secondary functions"
            className={`py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              isSecond ? 'bg-indigo-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            2nd
          </button>
          <button
            type="button"
            onClick={() => setMemory((m) => m + currentNumericResult())}
            aria-label="Memory Add"
            className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
          >
            M+
          </button>
          <button
            type="button"
            onClick={() => setMemory((m) => m - currentNumericResult())}
            aria-label="Memory Subtract"
            className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
          >
            M−
          </button>
          <button
            type="button"
            onClick={() => append(memory.toString())}
            aria-label="Memory Recall"
            className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
          >
            MR
          </button>
          <button
            type="button"
            onClick={() => setMemory(0)}
            aria-label="Memory Clear"
            className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-rose-400 transition-colors cursor-pointer"
          >
            MC
          </button>
        </div>

        {/* Hyperbolic + Constant Quick Bar */}
        <div className="grid grid-cols-5 gap-2 mb-2 text-xs font-semibold font-mono">
          <button type="button" onClick={() => append('sinh(')} className="py-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-300 cursor-pointer">
            sinh
          </button>
          <button type="button" onClick={() => append('cosh(')} className="py-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-300 cursor-pointer">
            cosh
          </button>
          <button type="button" onClick={() => append('tanh(')} className="py-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-300 cursor-pointer">
            tanh
          </button>
          <button type="button" onClick={() => append('exp(')} className="py-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-300 cursor-pointer">
            exp
          </button>
          <button type="button" onClick={() => append('e')} className="py-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-300 cursor-pointer">
            e
          </button>
        </div>

        <div className="grid grid-cols-5 gap-2 text-sm font-semibold font-mono">
          <button type="button" onClick={() => append(isSecond ? 'asin(' : 'sin(')} className="py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 cursor-pointer">
            {isSecond ? 'sin⁻¹' : 'sin'}
          </button>
          <button type="button" onClick={() => append(isSecond ? 'acos(' : 'cos(')} className="py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 cursor-pointer">
            {isSecond ? 'cos⁻¹' : 'cos'}
          </button>
          <button type="button" onClick={() => append(isSecond ? 'atan(' : 'tan(')} className="py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 cursor-pointer">
            {isSecond ? 'tan⁻¹' : 'tan'}
          </button>
          <button type="button" onClick={clear} aria-label="All Clear" className="py-3 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 cursor-pointer">
            AC
          </button>
          <button type="button" onClick={backspace} aria-label="Backspace" className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer">
            <Delete className="w-4 h-4" />
          </button>

          <button type="button" onClick={() => append(isSecond ? 'pow(10,' : 'log(')} className="py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 cursor-pointer">
            {isSecond ? '10ˣ' : 'log'}
          </button>
          <button type="button" onClick={() => append(isSecond ? 'exp(' : 'ln(')} className="py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 cursor-pointer">
            {isSecond ? 'eˣ' : 'ln'}
          </button>
          <button type="button" onClick={() => append('(')} className="py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 cursor-pointer">
            (
          </button>
          <button type="button" onClick={() => append(')')} className="py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 cursor-pointer">
            )
          </button>
          <button type="button" onClick={() => append('÷')} aria-label="Divide" className="py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer">
            ÷
          </button>

          <button type="button" onClick={() => append(isSecond ? 'cbrt(' : 'sqrt(')} aria-label={isSecond ? 'Cube root' : 'Square root'} className="py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 cursor-pointer">
            {isSecond ? '∛' : '√'}
          </button>
          <button type="button" onClick={() => append('7')} className="py-3 rounded-xl bg-slate-700/60 hover:bg-slate-600/70 text-white cursor-pointer">7</button>
          <button type="button" onClick={() => append('8')} className="py-3 rounded-xl bg-slate-700/60 hover:bg-slate-600/70 text-white cursor-pointer">8</button>
          <button type="button" onClick={() => append('9')} className="py-3 rounded-xl bg-slate-700/60 hover:bg-slate-600/70 text-white cursor-pointer">9</button>
          <button type="button" onClick={() => append('×')} aria-label="Multiply" className="py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer">×</button>

          <button type="button" onClick={() => append('^')} aria-label="Exponent" className="py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 cursor-pointer">xʸ</button>
          <button type="button" onClick={() => append('4')} className="py-3 rounded-xl bg-slate-700/60 hover:bg-slate-600/70 text-white cursor-pointer">4</button>
          <button type="button" onClick={() => append('5')} className="py-3 rounded-xl bg-slate-700/60 hover:bg-slate-600/70 text-white cursor-pointer">5</button>
          <button type="button" onClick={() => append('6')} className="py-3 rounded-xl bg-slate-700/60 hover:bg-slate-600/70 text-white cursor-pointer">6</button>
          <button type="button" onClick={() => append('-')} aria-label="Subtract" className="py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer">−</button>

          <button type="button" onClick={() => append('fact(')} aria-label="Factorial" className="py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 cursor-pointer">n!</button>
          <button type="button" onClick={() => append('1')} className="py-3 rounded-xl bg-slate-700/60 hover:bg-slate-600/70 text-white cursor-pointer">1</button>
          <button type="button" onClick={() => append('2')} className="py-3 rounded-xl bg-slate-700/60 hover:bg-slate-600/70 text-white cursor-pointer">2</button>
          <button type="button" onClick={() => append('3')} className="py-3 rounded-xl bg-slate-700/60 hover:bg-slate-600/70 text-white cursor-pointer">3</button>
          <button type="button" onClick={() => append('+')} aria-label="Add" className="py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer">+</button>

          <button type="button" onClick={() => append('π')} aria-label="Pi" className="py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 cursor-pointer">π</button>
          <button type="button" onClick={() => append('0')} className="py-3 rounded-xl bg-slate-700/60 hover:bg-slate-600/70 text-white cursor-pointer">0</button>
          <button type="button" onClick={() => append('.')} aria-label="Decimal point" className="py-3 rounded-xl bg-slate-700/60 hover:bg-slate-600/70 text-white cursor-pointer">.</button>
          <button type="button" onClick={() => append('ans')} aria-label="Previous Answer" className="py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer">ANS</button>
          <button type="button" onClick={evaluateMath} aria-label="Equals" className="py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg cursor-pointer">=</button>
        </div>

        {history.length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
              <History className="w-3.5 h-3.5" />
              <span>Calculation History</span>
            </div>
            <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
              {history.map((h, i) => {
                const histDisplay = h.numericVal !== undefined ? formatSciDisplay(h.numericVal) : h.res;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setExpression(h.expr);
                      setResult(h.res);
                      setNumericResult(h.numericVal ?? null);
                    }}
                    className="w-full flex justify-between items-center text-xs py-1 px-2 rounded hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 cursor-pointer transition-colors font-mono text-left"
                  >
                    <span className="truncate">{h.expr}</span>
                    <span className="font-bold text-white ml-2">= {histDisplay}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
