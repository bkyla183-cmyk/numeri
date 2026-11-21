import React, { useState } from 'react';
import { Copy, Check, RotateCcw } from 'lucide-react';
import { calculateBmiMetrics } from '../../utils/calculatorFormulas';
import { FormulaHoverHighlight } from './FormulaHoverHighlight';
import { AutoUnitConversionSuggestions } from './AutoUnitConversionSuggestions';
import { useRoundingPrecision } from '../../context/RoundingPrecisionContext';
import { formatNumberWithPrecision } from '../../utils/roundingPrecision';

export const BMICalculator: React.FC = () => {
  const { precision } = useRoundingPrecision();
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');

  const [weightKg, setWeightKg] = useState<string>('70');
  const [heightCm, setHeightCm] = useState<string>('175');

  const [weightLbs, setWeightLbs] = useState<string>('154');
  const [heightFt, setHeightFt] = useState<string>('5');
  const [heightIn, setHeightIn] = useState<string>('9');

  const [copied, setCopied] = useState<boolean>(false);

  const result = (() => {
    let weightInKg = 0;
    let heightInCm = 0;

    if (unitSystem === 'metric') {
      const w = parseFloat(weightKg);
      const h = parseFloat(heightCm);
      if (!Number.isFinite(w) || w <= 0 || w > 600) {
        return { ok: false as const, error: 'Enter a valid weight between 1 and 600 kg.' };
      }
      if (!Number.isFinite(h) || h < 50 || h > 280) {
        return { ok: false as const, error: 'Enter a valid height between 50 and 280 cm.' };
      }
      weightInKg = w;
      heightInCm = h;
    } else {
      const w = parseFloat(weightLbs);
      const ft = parseFloat(heightFt);
      const inches = heightIn.trim() === '' ? 0 : parseFloat(heightIn);
      if (!Number.isFinite(w) || w <= 0 || w > 1300) {
        return { ok: false as const, error: 'Enter a valid weight between 1 and 1,300 lbs.' };
      }
      if (!Number.isFinite(ft) || ft < 0 || !Number.isFinite(inches) || inches < 0) {
        return { ok: false as const, error: 'Height values cannot be negative.' };
      }
      const totalInches = ft * 12 + inches;
      if (totalInches < 20 || totalInches > 110) {
        return { ok: false as const, error: 'Enter a valid height.' };
      }
      weightInKg = w * 0.45359237;
      heightInCm = totalInches * 2.54;
    }

    const res = calculateBmiMetrics(weightInKg, heightInCm);
    if ('error' in res) {
      return { ok: false as const, error: res.error };
    }

    const { bmi, bmiPrime, ponderalIndex, healthyMinKg, healthyMaxKg } = res;
    let category = '';
    let categoryColor = '';
    let risk = '';

    if (bmi < 18.5) {
      category = 'Underweight';
      categoryColor = 'text-sky-600 dark:text-sky-400';
      risk = 'Higher risk of nutritional deficiency and osteoporosis';
    } else if (bmi < 25.0) {
      category = 'Normal weight';
      categoryColor = 'text-emerald-600 dark:text-emerald-400';
      risk = 'Lowest health risk category for overall weight-related conditions';
    } else if (bmi < 30.0) {
      category = 'Overweight';
      categoryColor = 'text-amber-600 dark:text-amber-400';
      risk = 'Moderate increased risk of cardiovascular strain and hypertension';
    } else if (bmi < 35.0) {
      category = 'Obesity Class I';
      categoryColor = 'text-orange-600 dark:text-orange-400';
      risk = 'High risk of type 2 diabetes and heart disease';
    } else if (bmi < 40.0) {
      category = 'Obesity Class II';
      categoryColor = 'text-rose-600 dark:text-rose-400';
      risk = 'Very high risk of chronic metabolic and cardiovascular disease';
    } else {
      category = 'Obesity Class III (Severe)';
      categoryColor = 'text-red-700 dark:text-red-400';
      risk = 'Extremely high risk requiring clinical evaluation';
    }

    const minHealthyVal = unitSystem === 'metric' ? healthyMinKg : healthyMinKg * 2.20462;
    const maxHealthyVal = unitSystem === 'metric' ? healthyMaxKg : healthyMaxKg * 2.20462;
    const weightUnitLabel = unitSystem === 'metric' ? 'kg' : 'lbs';

    const bmiFormatted = formatNumberWithPrecision(bmi, precision, {
      autoDecimals: 1,
      minAutoDecimals: 1,
      useGrouping: false,
    });
    const bmiPrimeFormatted = formatNumberWithPrecision(bmiPrime, precision, {
      autoDecimals: 2,
      minAutoDecimals: 2,
      useGrouping: false,
    });
    const ponderalFormatted = formatNumberWithPrecision(ponderalIndex, precision, {
      autoDecimals: 1,
      minAutoDecimals: 1,
      useGrouping: false,
    });
    const minHealthyDisplay = `${formatNumberWithPrecision(minHealthyVal, precision, {
      autoDecimals: 1,
      minAutoDecimals: 1,
      useGrouping: false,
    })} ${weightUnitLabel}`;
    const maxHealthyDisplay = `${formatNumberWithPrecision(maxHealthyVal, precision, {
      autoDecimals: 1,
      minAutoDecimals: 1,
      useGrouping: false,
    })} ${weightUnitLabel}`;

    const gaugePercent = Math.min(Math.max(((bmi - 12) / (40 - 12)) * 100, 0), 100);

    return {
      ok: true as const,
      bmi: bmiFormatted,
      bmiPrime: bmiPrimeFormatted,
      ponderalIndex: ponderalFormatted,
      category,
      categoryColor,
      risk,
      minHealthyDisplay,
      maxHealthyDisplay,
      gaugePercent,
    };
  })();

  const calculation = result.ok ? result : null;
  const errorMsg = !result.ok ? result.error : null;

  const handleCopy = () => {
    if (!calculation) return;
    navigator.clipboard?.writeText(
      `BMI: ${calculation.bmi} (${calculation.category}) · BMI Prime: ${calculation.bmiPrime} · Ponderal Index: ${calculation.ponderalIndex} kg/m³`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    if (unitSystem === 'metric') {
      setWeightKg('70');
      setHeightCm('175');
    } else {
      setWeightLbs('154');
      setHeightFt('5');
      setHeightIn('9');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="inline-flex p-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl" role="group" aria-label="Unit system">
          <button
            type="button"
            aria-pressed={unitSystem === 'metric'}
            onClick={() => setUnitSystem('metric')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              unitSystem === 'metric'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Metric (kg / cm)
          </button>
          <button
            type="button"
            aria-pressed={unitSystem === 'imperial'}
            onClick={() => setUnitSystem('imperial')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              unitSystem === 'imperial'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Imperial (lbs / ft+in)
          </button>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        {unitSystem === 'metric' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="bmi-weight-kg" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Weight (kilograms)
              </label>
              <div className="relative">
                <input
                  id="bmi-weight-kg"
                  type="number"
                  step="0.1"
                  min="1"
                  max="600"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="e.g. 70"
                />
                <span className="absolute right-4 top-3.5 text-slate-400 font-mono text-sm">kg</span>
              </div>
            </div>

            <div>
              <label htmlFor="bmi-height-cm" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Height (centimeters)
              </label>
              <div className="relative">
                <input
                  id="bmi-height-cm"
                  type="number"
                  step="0.5"
                  min="50"
                  max="280"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="e.g. 175"
                />
                <span className="absolute right-4 top-3.5 text-slate-400 font-mono text-sm">cm</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="bmi-weight-lbs" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Weight (pounds)
              </label>
              <div className="relative">
                <input
                  id="bmi-weight-lbs"
                  type="number"
                  step="0.5"
                  min="1"
                  max="1300"
                  value={weightLbs}
                  onChange={(e) => setWeightLbs(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="e.g. 154"
                />
                <span className="absolute right-4 top-3.5 text-slate-400 font-mono text-sm">lbs</span>
              </div>
            </div>

            <div>
              <label htmlFor="bmi-height-ft" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Height (feet &amp; inches)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <input
                    id="bmi-height-ft"
                    type="number"
                    min="1"
                    max="8"
                    value={heightFt}
                    onChange={(e) => setHeightFt(e.target.value)}
                    aria-label="Height in feet"
                    className="w-full px-3 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    placeholder="ft"
                  />
                  <span className="absolute right-3 top-3.5 text-slate-400 font-mono text-sm">ft</span>
                </div>
                <div className="relative">
                  <input
                    id="bmi-height-in"
                    type="number"
                    min="0"
                    max="11"
                    value={heightIn}
                    onChange={(e) => setHeightIn(e.target.value)}
                    aria-label="Height in inches"
                    className="w-full px-3 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    placeholder="in"
                  />
                  <span className="absolute right-3 top-3.5 text-slate-400 font-mono text-sm">in</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {errorMsg && (
          <div role="alert" className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-sm font-medium text-rose-700 dark:text-rose-300">
            {errorMsg}
          </div>
        )}

        {calculation && (
          <div className="space-y-4 pt-2">
            <FormulaHoverHighlight
              formula={
                unitSystem === 'metric'
                  ? 'BMI = W / (H / 100)²'
                  : 'BMI = (W × 703) / H²'
              }
              formulaLabel={
                unitSystem === 'metric'
                  ? 'Body Mass Index Formula (Metric SI)'
                  : 'Body Mass Index Formula (US Imperial)'
              }
              variables={
                unitSystem === 'metric'
                  ? [
                      { symbol: 'W', name: 'Body Weight', value: weightKg, unit: 'kg' },
                      { symbol: 'H', name: 'Height', value: heightCm, unit: 'cm' },
                    ]
                  : [
                      { symbol: 'W', name: 'Body Weight', value: weightLbs, unit: 'lbs' },
                      {
                        symbol: 'H',
                        name: 'Total Height',
                        value: (parseFloat(heightFt) || 0) * 12 + (parseFloat(heightIn) || 0),
                        unit: 'in',
                      },
                    ]
              }
              activeStep={
                unitSystem === 'metric'
                  ? `${weightKg} / (${(Number(heightCm || 0) / 100).toFixed(2)})² = ${calculation.bmi} kg/m² (${calculation.category})`
                  : `(${weightLbs} × 703) / ${(parseFloat(heightFt) || 0) * 12 + (parseFloat(heightIn) || 0)}² = ${calculation.bmi} (${calculation.category})`
              }
              accent="teal"
            >
              <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">
                      Your Calculated Body Mass Index (BMI)
                    </span>
                    <div className="flex items-baseline gap-3">
                      <span className="text-4xl font-extrabold text-slate-900 dark:text-slate-50 font-mono tabular-nums">
                        {calculation.bmi}
                      </span>
                      <span className={`text-base font-semibold ${calculation.categoryColor}`}>
                        {calculation.category}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 cursor-pointer self-start sm:self-center"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Result'}</span>
                  </button>
                </div>

              <div className="mt-5 space-y-1.5">
                <div className="relative h-3 w-full rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 via-amber-400 via-orange-400 to-rose-600 overflow-hidden shadow-inner" />
                <div className="relative w-full h-4">
                  <div
                    className="absolute top-0 -ml-2 w-4 h-4 rounded-full bg-slate-900 dark:bg-white border-2 border-white dark:border-slate-900 shadow-md transition-all duration-300"
                    style={{ left: `${calculation.gaugePercent}%` }}
                    title={`BMI ${calculation.bmi}`}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-slate-400 pt-1">
                  <span>18.5</span>
                  <span>25.0</span>
                  <span>30.0</span>
                  <span>35.0+</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-400">
                <div>
                  Healthy Weight Range:{' '}
                  <strong className="text-slate-900 dark:text-slate-100 font-mono block">
                    {calculation.minHealthyDisplay} – {calculation.maxHealthyDisplay}
                  </strong>
                </div>
                <div>
                  BMI Prime (Target ≤ 1.00):{' '}
                  <strong className="text-slate-900 dark:text-slate-100 font-mono block">
                    {calculation.bmiPrime}
                  </strong>
                </div>
                <div>
                  Ponderal Index:{' '}
                  <strong className="text-slate-900 dark:text-slate-100 font-mono block">
                    {calculation.ponderalIndex} kg/m³
                  </strong>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">{calculation.risk}</p>
            </div>
            </FormulaHoverHighlight>

            <AutoUnitConversionSuggestions
              candidates={
                unitSystem === 'metric'
                  ? [
                      { source: 'input', label: 'Weight', value: Number(weightKg) || 0, unit: 'kg' },
                      { source: 'input', label: 'Height', value: Number(heightCm) || 0, unit: 'cm' },
                    ]
                  : [
                      { source: 'input', label: 'Weight', value: Number(weightLbs) || 0, unit: 'lbs' },
                      {
                        source: 'input',
                        label: 'Height',
                        value: (parseFloat(heightFt) || 0) * 12 + (parseFloat(heightIn) || 0),
                        unit: 'in',
                      },
                    ]
              }
            />

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  <tr>
                    <th className="py-2 px-3 font-semibold">Category</th>
                    <th className="py-2 px-3 font-semibold font-mono">BMI Range</th>
                    <th className="py-2 px-3 font-semibold">Risk Classification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-400">
                  <tr className={calculation.category === 'Underweight' ? 'bg-sky-50 dark:bg-sky-950/30 font-medium' : ''}>
                    <td className="py-2 px-3">Underweight</td>
                    <td className="py-2 px-3 font-mono">&lt; 18.5</td>
                    <td className="py-2 px-3">Malnutrition / Osteoporosis</td>
                  </tr>
                  <tr className={calculation.category === 'Normal weight' ? 'bg-emerald-50 dark:bg-emerald-950/30 font-medium' : ''}>
                    <td className="py-2 px-3">Normal weight</td>
                    <td className="py-2 px-3 font-mono">18.5 – 24.9</td>
                    <td className="py-2 px-3">Lowest health risk</td>
                  </tr>
                  <tr className={calculation.category === 'Overweight' ? 'bg-amber-50 dark:bg-amber-950/30 font-medium' : ''}>
                    <td className="py-2 px-3">Overweight</td>
                    <td className="py-2 px-3 font-mono">25.0 – 29.9</td>
                    <td className="py-2 px-3">Moderate increased risk</td>
                  </tr>
                  <tr className={calculation.category.includes('Obesity') ? 'bg-rose-50 dark:bg-rose-950/30 font-medium' : ''}>
                    <td className="py-2 px-3">Obese (Class I, II, III)</td>
                    <td className="py-2 px-3 font-mono">&ge; 30.0</td>
                    <td className="py-2 px-3">High to severe health risk</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
