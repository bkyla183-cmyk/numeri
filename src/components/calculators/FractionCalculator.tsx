import React, { useState } from 'react';
import { Copy, Check, RotateCcw } from 'lucide-react';
import { calculateFractionOp } from '../../utils/calculatorFormulas';
import { FormulaHoverHighlight } from './FormulaHoverHighlight';
import { useRoundingPrecision } from '../../context/RoundingPrecisionContext';
import { formatNumberWithPrecision } from '../../utils/roundingPrecision';

export const FractionCalculator: React.FC = () => {
  const [whole1, setWhole1] = useState<string>('0');
  const [num1, setNum1] = useState<string>('3');
  const [den1, setDen1] = useState<string>('4');
  const [operator, setOperator] = useState<'+' | '−' | '×' | '÷'>('+');
  const [whole2, setWhole2] = useState<string>('0');
  const [num2, setNum2] = useState<string>('2');
  const [den2, setDen2] = useState<string>('5');
  const [copied, setCopied] = useState<boolean>(false);
  const { precision } = useRoundingPrecision();

  const calc = (() => {
    const w1 = whole1.trim() === '' ? 0 : Number(whole1);
    const p1 = Number(num1);
    const q1 = Number(den1);
    const w2 = whole2.trim() === '' ? 0 : Number(whole2);
    const p2 = Number(num2);
    const q2 = Number(den2);

    if (num1.trim() === '' || den1.trim() === '' || num2.trim() === '' || den2.trim() === '') {
      return { error: 'Enter whole integer values for numerators and denominators.' };
    }

    const opMap: Record<'+' | '−' | '×' | '÷', '+' | '-' | '*' | '/'> = {
      '+': '+',
      '−': '-',
      '×': '*',
      '÷': '/',
    };

    const res = calculateFractionOp({
      whole1: w1,
      num1: p1,
      den1: q1,
      whole2: w2,
      num2: p2,
      den2: q2,
      op: opMap[operator],
    });

    if ('error' in res) {
      return { error: res.error };
    }

    const decimalVal =
      precision === 'auto'
        ? (Math.abs(res.decimal) < 1e-12 ? 0 : res.decimal).toFixed(6).replace(/\.?0+$/, '')
        : formatNumberWithPrecision(res.decimal, precision, { useGrouping: true });
    const f1Label = w1 !== 0 ? `${w1} ${p1}/${q1}` : `${p1}/${q1}`;
    const f2Label = w2 !== 0 ? `${w2} ${p2}/${q2}` : `${p2}/${q2}`;
    const impA = w1 !== 0 ? (w1 > 0 ? w1 * q1 + p1 : w1 * q1 - p1) : p1;
    const impC = w2 !== 0 ? (w2 > 0 ? w2 * q2 + p2 : w2 * q2 - p2) : p2;

    return {
      simplified: res.den === 1 ? `${res.num}` : `${res.num}/${res.den}`,
      simpNum: res.num,
      simpDen: res.den,
      impA,
      impB: q1,
      impC,
      impD: q2,
      mixedStr: res.mixedStr,
      reciprocalStr: res.reciprocalStr,
      decimalVal,
      steps: [
        `Evaluate expression: (${f1Label}) ${operator} (${f2Label})`,
        `Unreduced result fraction: ${res.rawNum}/${res.rawDen}`,
        `Divide numerator and denominator by GCD: ${res.den === 1 ? res.num : `${res.num}/${res.den}`}`,
        `Mixed number: ${res.mixedStr} · Reciprocal: ${res.reciprocalStr} · Decimal ≈ ${decimalVal}`,
      ],
    };
  })();

  const handleCopy = () => {
    if (!calc || 'error' in calc) return;
    navigator.clipboard?.writeText(calc.simplified);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setWhole1('0');
    setNum1('3');
    setDen1('4');
    setOperator('+');
    setWhole2('0');
    setNum2('2');
    setDen2('5');
  };

  const operatorNames: Record<'+' | '−' | '×' | '÷', string> = {
    '+': 'Add',
    '−': 'Subtract',
    '×': 'Multiply',
    '÷': 'Divide',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">
          Fraction &amp; Mixed Number Operations
        </h2>
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 py-2">
          {/* Mixed Fraction 1 */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center w-16">
              <span className="text-[10px] text-slate-400 mb-1">Whole</span>
              <input
                type="number"
                step="1"
                value={whole1}
                onChange={(e) => setWhole1(e.target.value)}
                aria-label="First mixed whole number"
                className="w-full text-center px-2 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono font-bold text-base"
              />
            </div>
            <div className="flex flex-col items-center w-24">
              <input
                type="number"
                step="1"
                value={num1}
                onChange={(e) => setNum1(e.target.value)}
                aria-label="First fraction numerator"
                className="w-full text-center px-2 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono font-bold text-lg"
                placeholder="Num"
              />
              <div className="w-full h-0.5 bg-slate-400 dark:bg-slate-600 my-1.5" />
              <input
                type="number"
                step="1"
                value={den1}
                onChange={(e) => setDen1(e.target.value)}
                aria-label="First fraction denominator"
                className="w-full text-center px-2 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono font-bold text-lg"
                placeholder="Den"
              />
            </div>
          </div>

          {/* Operator selector */}
          <div className="flex sm:flex-col gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl" role="group" aria-label="Fraction operator">
            {(['+', '−', '×', '÷'] as const).map((op) => (
              <button
                key={op}
                type="button"
                aria-label={operatorNames[op]}
                aria-pressed={operator === op}
                onClick={() => setOperator(op)}
                className={`w-10 h-10 rounded-lg font-mono text-lg font-bold flex items-center justify-center transition-colors cursor-pointer ${
                  operator === op
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {op}
              </button>
            ))}
          </div>

          {/* Mixed Fraction 2 */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center w-16">
              <span className="text-[10px] text-slate-400 mb-1">Whole</span>
              <input
                type="number"
                step="1"
                value={whole2}
                onChange={(e) => setWhole2(e.target.value)}
                aria-label="Second mixed whole number"
                className="w-full text-center px-2 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono font-bold text-base"
              />
            </div>
            <div className="flex flex-col items-center w-24">
              <input
                type="number"
                step="1"
                value={num2}
                onChange={(e) => setNum2(e.target.value)}
                aria-label="Second fraction numerator"
                className="w-full text-center px-2 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono font-bold text-lg"
                placeholder="Num"
              />
              <div className="w-full h-0.5 bg-slate-400 dark:bg-slate-600 my-1.5" />
              <input
                type="number"
                step="1"
                value={den2}
                onChange={(e) => setDen2(e.target.value)}
                aria-label="Second fraction denominator"
                className="w-full text-center px-2 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono font-bold text-lg"
                placeholder="Den"
              />
            </div>
          </div>
        </div>

        {calc && !('error' in calc) ? (
          <div className="space-y-4 pt-2">
            <FormulaHoverHighlight
              accent="indigo"
              formulaLabel={`Fraction ${operatorNames[operator]} + GCD Reduction`}
              formula={
                operator === '+'
                  ? 'A/B + C/D = (A × D + C × B) / (B × D)'
                  : operator === '−'
                    ? 'A/B − C/D = (A × D − C × B) / (B × D)'
                    : operator === '×'
                      ? 'A/B × C/D = (A × C) / (B × D)'
                      : 'A/B ÷ C/D = (A × D) / (B × C)'
              }
              variables={[
                { symbol: 'A', name: '1st improper numerator', value: calc.impA },
                { symbol: 'B', name: '1st denominator', value: calc.impB },
                { symbol: 'C', name: '2nd improper numerator', value: calc.impC },
                { symbol: 'D', name: '2nd denominator', value: calc.impD },
              ]}
              activeStep={calc.steps[1] ? `${calc.steps[1]} → Reduced: ${calc.simplified}` : undefined}
            >
              <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                    Simplified Fraction Result
                  </span>
                  <div className="flex items-baseline gap-4 flex-wrap">
                    <span className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono tabular-nums">
                      {calc.simplified}
                    </span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 font-mono">
                      (Mixed: {calc.mixedStr})
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      Decimal: {calc.decimalVal} · Reciprocal: {calc.reciprocalStr}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 cursor-pointer self-start sm:self-center"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </FormulaHoverHighlight>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/30 space-y-1.5 text-xs text-slate-600 dark:text-slate-400 font-mono">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block text-xs uppercase tracking-wider mb-1">
                Step-by-Step Solution
              </span>
              {calc.steps.map((st, i) => (
                <div key={i}>{i + 1}. {st}</div>
              ))}
            </div>
          </div>
        ) : calc && 'error' in calc ? (
          <div role="alert" className="p-4 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-xs font-mono">
            {calc.error}
          </div>
        ) : null}
      </div>
    </div>
  );
};
