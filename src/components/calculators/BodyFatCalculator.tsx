import React, { useState } from 'react';
import { Copy, Check, RotateCcw } from 'lucide-react';
import { calculateUsNavyBodyFat } from '../../utils/calculatorFormulas';
import { FormulaHoverHighlight } from './FormulaHoverHighlight';
import { AutoUnitConversionSuggestions } from './AutoUnitConversionSuggestions';
import { useRoundingPrecision } from '../../context/RoundingPrecisionContext';
import { formatNumberWithPrecision } from '../../utils/roundingPrecision';

export const BodyFatCalculator: React.FC = () => {
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [weightKg, setWeightKg] = useState<string>('75');
  const [heightCm, setHeightCm] = useState<string>('178');
  const [neckCm, setNeckCm] = useState<string>('38');
  const [waistCm, setWaistCm] = useState<string>('84');
  const [hipCm, setHipCm] = useState<string>('95');

  const [weightLbs, setWeightLbs] = useState<string>('165');
  const [heightIn, setHeightIn] = useState<string>('70');
  const [neckIn, setNeckIn] = useState<string>('15');
  const [waistIn, setWaistIn] = useState<string>('33');
  const [hipIn, setHipIn] = useState<string>('38');

  const [copied, setCopied] = useState<boolean>(false);
  const { precision } = useRoundingPrecision();

  const result = (() => {
    const hCm = unitSystem === 'metric' ? parseFloat(heightCm) : parseFloat(heightIn) * 2.54;
    const nCm = unitSystem === 'metric' ? parseFloat(neckCm) : parseFloat(neckIn) * 2.54;
    const wCm = unitSystem === 'metric' ? parseFloat(waistCm) : parseFloat(waistIn) * 2.54;
    const hpCm = unitSystem === 'metric' ? parseFloat(hipCm) : parseFloat(hipIn) * 2.54;
    const wtKg = unitSystem === 'metric' ? parseFloat(weightKg) : parseFloat(weightLbs) * 0.45359237;

    const res = calculateUsNavyBodyFat({
      gender,
      heightCm: hCm,
      weightKg: wtKg,
      neckCm: nCm,
      waistCm: wCm,
      hipCm: gender === 'female' ? hpCm : 0,
    });

    if ('error' in res) {
      return { ok: false as const, error: res.error };
    }

    let categoryColor = 'text-sky-400';
    if (res.category === 'Essential Fat') categoryColor = 'text-amber-400';
    else if (res.category === 'Athletes' || res.category === 'Fitness') categoryColor = 'text-emerald-400';
    else if (res.category === 'Obese') categoryColor = 'text-rose-400';

    return {
      ok: true as const,
      bodyFatPct: res.bodyFatPct,
      category: res.category,
      categoryColor,
      fatMassKg: res.fatMassKg,
      leanMassKg: res.leanMassKg,
      fatMassLbs: res.fatMassKg * 2.20462,
      leanMassLbs: res.leanMassKg * 2.20462,
      whtr: res.whtr,
      ffmi: res.ffmi,
      normalizedFfmi: res.normalizedFfmi,
    };
  })();

  const calc = result.ok ? result : null;
  const errorMsg = !result.ok ? result.error : null;

  const fmtOne = (v: number) =>
    formatNumberWithPrecision(v, precision, { autoDecimals: 1, minAutoDecimals: 1 });
  const fmtTwo = (v: number) =>
    formatNumberWithPrecision(v, precision, { autoDecimals: 2, minAutoDecimals: 2 });

  const handleCopy = () => {
    if (!calc) return;
    navigator.clipboard?.writeText(
      `Body Fat: ${fmtOne(calc.bodyFatPct)}% (${calc.category}) · WHtR: ${fmtTwo(calc.whtr)} · FFMI: ${fmtOne(calc.ffmi)}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setUnitSystem('metric');
    setGender('male');
    setWeightKg('75');
    setHeightCm('178');
    setNeckCm('38');
    setWaistCm('84');
    setHipCm('95');
    setWeightLbs('165');
    setHeightIn('70');
    setNeckIn('15');
    setWaistIn('33');
    setHipIn('38');
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
            Metric (cm / kg)
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
            Imperial (inches / lbs)
          </button>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Biological Sex
            </span>
            <div className="grid grid-cols-2 gap-2" role="group" aria-label="Biological sex">
              <button
                type="button"
                aria-pressed={gender === 'male'}
                onClick={() => setGender('male')}
                className={`py-3 px-3 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                  gender === 'male'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                    : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Male
              </button>
              <button
                type="button"
                aria-pressed={gender === 'female'}
                onClick={() => setGender('female')}
                className={`py-3 px-3 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                  gender === 'female'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                    : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Female
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="bf-weight"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2"
            >
              Weight ({unitSystem === 'metric' ? 'kg' : 'lbs'})
            </label>
            <input
              id="bf-weight"
              type="number"
              min="1"
              step="0.5"
              value={unitSystem === 'metric' ? weightKg : weightLbs}
              onChange={(e) =>
                unitSystem === 'metric' ? setWeightKg(e.target.value) : setWeightLbs(e.target.value)
              }
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div>
            <label
              htmlFor="bf-height"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2"
            >
              Height ({unitSystem === 'metric' ? 'cm' : 'in'})
            </label>
            <input
              id="bf-height"
              type="number"
              min="1"
              step="0.5"
              value={unitSystem === 'metric' ? heightCm : heightIn}
              onChange={(e) =>
                unitSystem === 'metric' ? setHeightCm(e.target.value) : setHeightIn(e.target.value)
              }
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div>
            <label
              htmlFor="bf-neck"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2"
            >
              Neck ({unitSystem === 'metric' ? 'cm' : 'in'})
            </label>
            <input
              id="bf-neck"
              type="number"
              min="1"
              step="0.5"
              value={unitSystem === 'metric' ? neckCm : neckIn}
              onChange={(e) =>
                unitSystem === 'metric' ? setNeckCm(e.target.value) : setNeckIn(e.target.value)
              }
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          <div>
            <label
              htmlFor="bf-waist"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2"
            >
              Waist at navel ({unitSystem === 'metric' ? 'cm' : 'in'})
            </label>
            <input
              id="bf-waist"
              type="number"
              min="1"
              step="0.5"
              value={unitSystem === 'metric' ? waistCm : waistIn}
              onChange={(e) =>
                unitSystem === 'metric' ? setWaistCm(e.target.value) : setWaistIn(e.target.value)
              }
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          {gender === 'female' && (
            <div>
              <label
                htmlFor="bf-hip"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2"
              >
                Hip at widest ({unitSystem === 'metric' ? 'cm' : 'in'})
              </label>
              <input
                id="bf-hip"
                type="number"
                min="1"
                step="0.5"
                value={unitSystem === 'metric' ? hipCm : hipIn}
                onChange={(e) =>
                  unitSystem === 'metric' ? setHipCm(e.target.value) : setHipIn(e.target.value)
                }
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          )}
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-sm font-medium text-rose-700 dark:text-rose-300"
          >
            {errorMsg}
          </div>
        )}

        {calc && (
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <FormulaHoverHighlight
              accent="indigo"
              formulaLabel={`US Navy Method (${gender === 'male' ? 'Male' : 'Female'}, ${unitSystem === 'metric' ? 'Metric' : 'Imperial'})`}
              formula={
                unitSystem === 'metric'
                  ? gender === 'male'
                    ? 'BF% = 495 / (1.0324 − 0.19077 × log10(W − N) + 0.15456 × log10(H)) − 450'
                    : 'BF% = 495 / (1.29579 − 0.35004 × log10(W + Hip − N) + 0.22100 × log10(H)) − 450'
                  : gender === 'male'
                    ? 'BF% = 86.010 × log10(W − N) − 70.041 × log10(H) + 36.76'
                    : 'BF% = 163.205 × log10(W + Hip − N) − 97.684 × log10(H) − 78.387'
              }
              variables={[
                {
                  symbol: 'W',
                  name: 'Waist circumference',
                  value: unitSystem === 'metric' ? waistCm : waistIn,
                  unit: unitSystem === 'metric' ? 'cm' : 'in',
                },
                ...(gender === 'female'
                  ? [
                      {
                        symbol: 'Hip',
                        name: 'Hip circumference',
                        value: unitSystem === 'metric' ? hipCm : hipIn,
                        unit: unitSystem === 'metric' ? 'cm' : 'in',
                      },
                    ]
                  : []),
                {
                  symbol: 'N',
                  name: 'Neck circumference',
                  value: unitSystem === 'metric' ? neckCm : neckIn,
                  unit: unitSystem === 'metric' ? 'cm' : 'in',
                },
                {
                  symbol: 'H',
                  name: 'Height',
                  value: unitSystem === 'metric' ? heightCm : heightIn,
                  unit: unitSystem === 'metric' ? 'cm' : 'in',
                },
              ]}
              activeStep={`BF% = ${fmtOne(calc.bodyFatPct)}% (${calc.category}) · Fat Mass = ${unitSystem === 'metric' ? `${fmtOne(calc.fatMassKg)} kg` : `${fmtOne(calc.fatMassLbs)} lbs`} · FFMI = ${fmtOne(calc.ffmi)}`}
            >
              <div className="p-6 rounded-2xl bg-slate-900 text-white dark:bg-slate-950 dark:border dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 shadow-md">
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-400 block mb-1">
                    Estimated Body Fat Percentage (US Navy Method)
                  </span>
                  <div className="flex items-baseline gap-4">
                    <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white tabular-nums">
                      {fmtOne(calc.bodyFatPct)}%
                    </span>
                    <span className={`text-base font-semibold ${calc.categoryColor}`}>
                      {calc.category}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 block mt-1">
                    Fat Mass: {unitSystem === 'metric' ? `${fmtOne(calc.fatMassKg)} kg` : `${fmtOne(calc.fatMassLbs)} lbs`} · Lean Mass:{' '}
                    {unitSystem === 'metric' ? `${fmtOne(calc.leanMassKg)} kg` : `${fmtOne(calc.leanMassLbs)} lbs`}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors cursor-pointer self-start sm:self-center"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied' : 'Copy Stats'}</span>
                </button>
              </div>
            </FormulaHoverHighlight>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[11px] text-slate-500 block">Waist-to-Height Ratio (WHtR)</span>
                <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                  {fmtTwo(calc.whtr)}
                </span>
                <span className="text-[10px] text-slate-400 block">Target &lt; 0.50 for metabolic health</span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[11px] text-slate-500 block">Fat-Free Mass Index (FFMI)</span>
                <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                  {fmtOne(calc.ffmi)} kg/m²
                </span>
                <span className="text-[10px] text-slate-400 block">Normalized (1.80m): {fmtOne(calc.normalizedFfmi)}</span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[11px] text-slate-500 block">Lean Body Mass</span>
                <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                  {unitSystem === 'metric' ? `${fmtOne(calc.leanMassKg)} kg` : `${fmtOne(calc.leanMassLbs)} lbs`}
                </span>
                <span className="text-[10px] text-slate-400 block">{fmtOne(100 - calc.bodyFatPct)}% of total weight</span>
              </div>
            </div>
            <AutoUnitConversionSuggestions
              candidates={
                unitSystem === 'metric'
                  ? [
                      { source: 'output', label: 'Lean Mass', value: calc.leanMassKg, unit: 'kg' },
                      { source: 'output', label: 'Fat Mass', value: calc.fatMassKg, unit: 'kg' },
                      { source: 'input', label: 'Waist', value: Number(waistCm) || 0, unit: 'cm' },
                      { source: 'input', label: 'Height', value: Number(heightCm) || 0, unit: 'cm' },
                    ]
                  : [
                      { source: 'output', label: 'Lean Mass', value: calc.leanMassLbs, unit: 'lbs' },
                      { source: 'output', label: 'Fat Mass', value: calc.fatMassLbs, unit: 'lbs' },
                      { source: 'input', label: 'Waist', value: Number(waistIn) || 0, unit: 'in' },
                      { source: 'input', label: 'Height', value: Number(heightIn) || 0, unit: 'in' },
                    ]
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};
