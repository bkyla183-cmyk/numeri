import React, { useState } from 'react';
import { Copy, Check, RotateCcw } from 'lucide-react';
import { calculateCalorieTdee } from '../../utils/calculatorFormulas';
import { FormulaHoverHighlight } from './FormulaHoverHighlight';
import { AutoUnitConversionSuggestions } from './AutoUnitConversionSuggestions';
import { useRoundingPrecision } from '../../context/RoundingPrecisionContext';
import { formatNumberWithPrecision } from '../../utils/roundingPrecision';

export const CalorieTDEECalculator: React.FC = () => {
  const { precision } = useRoundingPrecision();
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [formula, setFormula] = useState<'mifflin' | 'katch'>('mifflin');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState<string>('30');
  const [weightKg, setWeightKg] = useState<string>('75');
  const [heightCm, setHeightCm] = useState<string>('178');
  const [weightLbs, setWeightLbs] = useState<string>('165');
  const [heightFt, setHeightFt] = useState<string>('5');
  const [heightIn, setHeightIn] = useState<string>('10');
  const [bodyFatPct, setBodyFatPct] = useState<string>('18');
  const [activityMultiplier, setActivityMultiplier] = useState<number>(1.55);
  const [copied, setCopied] = useState<boolean>(false);

  const result = (() => {
    const a = parseFloat(age);
    if (formula === 'mifflin' && (!Number.isFinite(a) || a < 10 || a > 120)) {
      return { ok: false as const, error: 'Enter an age between 10 and 120 years.' };
    }

    let wKg = 0;
    let hCm = 0;

    if (unitSystem === 'metric') {
      const w = parseFloat(weightKg);
      const h = parseFloat(heightCm);
      if (!Number.isFinite(w) || w <= 0 || w > 500) {
        return { ok: false as const, error: 'Enter a valid weight between 1 and 500 kg.' };
      }
      if (!Number.isFinite(h) || h < 50 || h > 280) {
        return { ok: false as const, error: 'Enter a valid height between 50 and 280 cm.' };
      }
      wKg = w;
      hCm = h;
    } else {
      const w = parseFloat(weightLbs);
      const ft = parseFloat(heightFt);
      const inc = heightIn.trim() === '' ? 0 : parseFloat(heightIn);
      if (!Number.isFinite(w) || w <= 0 || w > 1100) {
        return { ok: false as const, error: 'Enter a valid weight between 1 and 1,100 lbs.' };
      }
      if (!Number.isFinite(ft) || ft < 0 || !Number.isFinite(inc) || inc < 0) {
        return { ok: false as const, error: 'Height values cannot be negative.' };
      }
      const totalInches = ft * 12 + inc;
      if (totalInches < 20 || totalInches > 110) {
        return { ok: false as const, error: 'Enter a valid height.' };
      }
      wKg = w * 0.45359237;
      hCm = totalInches * 2.54;
    }

    const bf = parseFloat(bodyFatPct);
    const res = calculateCalorieTdee({
      formula,
      gender,
      age: Number.isFinite(a) ? a : 30,
      weightKg: wKg,
      heightCm: hCm,
      activityMultiplier,
      bodyFatPct: formula === 'katch' ? bf : undefined,
    });

    if ('error' in res) {
      return { ok: false as const, error: res.error };
    }

    const clinicalFloor = gender === 'male' ? 1500 : 1200;
    const floorApplied = res.tdee - 500 < clinicalFloor;
    const muscleGainRaw = res.tdee + 350;

    const pGrams = (res.weightLoss * 0.3) / 4;
    const fGrams = (res.weightLoss * 0.3) / 9;
    const cGrams = (res.weightLoss * 0.4) / 4;

    const fmtKcal = (val: number) =>
      formatNumberWithPrecision(val, precision, { autoDecimals: 0, minAutoDecimals: 0 });
    const fmtDecimal = (val: number, autoDec = 1) =>
      formatNumberWithPrecision(val, precision, {
        autoDecimals: autoDec,
        minAutoDecimals: autoDec,
        useGrouping: false,
      });

    return {
      ok: true as const,
      tdeeNum: Math.round(res.tdee),
      bmrNum: Math.round(res.bmr),
      bmrDisplay: fmtKcal(res.bmr),
      tdeeDisplay: fmtKcal(res.tdee),
      mildDeficitDisplay: fmtKcal(res.mildLoss),
      moderateDeficitDisplay: fmtKcal(res.weightLoss),
      aggressiveDeficitDisplay: fmtKcal(res.extremeLoss),
      muscleGainDisplay: fmtKcal(muscleGainRaw),
      leanMassKg: res.leanMassKg ? fmtDecimal(res.leanMassKg, 1) : null,
      wKgVal: parseFloat(wKg.toFixed(1)),
      hCmVal: parseFloat(hCm.toFixed(1)),
      ageVal: Number.isFinite(a) ? a : 30,
      bfVal: Number.isFinite(bf) ? bf : 18,
      floorApplied,
      clinicalFloor,
      macros: {
        protein: fmtKcal(pGrams),
        fat: fmtKcal(fGrams),
        carbs: fmtKcal(cGrams),
      },
    };
  })();

  const calc = result.ok ? result : null;
  const errorMsg = !result.ok ? result.error : null;

  const handleCopy = () => {
    if (!calc) return;
    navigator.clipboard?.writeText(
      `Daily TDEE Maintenance: ${calc.tdeeDisplay} kcal/day (BMR: ${calc.bmrDisplay} kcal/day, Moderate Weight Loss: ${calc.moderateDeficitDisplay} kcal/day)`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setUnitSystem('metric');
    setFormula('mifflin');
    setGender('male');
    setAge('30');
    setWeightKg('75');
    setHeightCm('178');
    setWeightLbs('165');
    setHeightFt('5');
    setHeightIn('10');
    setBodyFatPct('18');
    setActivityMultiplier(1.55);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
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

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="tdee-formula" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              BMR Equation
            </label>
            <select
              id="tdee-formula"
              value={formula}
              onChange={(e) => setFormula(e.target.value as 'mifflin' | 'katch')}
              className="w-full px-3 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="mifflin">Mifflin-St Jeor (General)</option>
              <option value="katch">Katch-McArdle (Lean Mass)</option>
            </select>
          </div>

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

          {formula === 'mifflin' ? (
            <div>
              <label htmlFor="tdee-age" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Age (Years)
              </label>
              <input
                id="tdee-age"
                type="number"
                min="10"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          ) : (
            <div>
              <label htmlFor="tdee-bf" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Body Fat (%)
              </label>
              <div className="relative">
                <input
                  id="tdee-bf"
                  type="number"
                  min="2"
                  max="65"
                  step="0.5"
                  value={bodyFatPct}
                  onChange={(e) => setBodyFatPct(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
                <span className="absolute right-4 top-3.5 text-slate-400 font-mono text-sm">%</span>
              </div>
            </div>
          )}

          {unitSystem === 'metric' ? (
            <>
              <div>
                <label htmlFor="tdee-weight-kg" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Weight (kg)
                </label>
                <div className="relative">
                  <input
                    id="tdee-weight-kg"
                    type="number"
                    min="1"
                    step="0.5"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                  <span className="absolute right-4 top-3.5 text-slate-400 font-mono text-sm">kg</span>
                </div>
              </div>
              <div>
                <label htmlFor="tdee-height-cm" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Height (cm)
                </label>
                <div className="relative">
                  <input
                    id="tdee-height-cm"
                    type="number"
                    min="50"
                    step="0.5"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                  <span className="absolute right-4 top-3.5 text-slate-400 font-mono text-sm">cm</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label htmlFor="tdee-weight-lbs" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Weight (lbs)
                </label>
                <div className="relative">
                  <input
                    id="tdee-weight-lbs"
                    type="number"
                    min="1"
                    step="0.5"
                    value={weightLbs}
                    onChange={(e) => setWeightLbs(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                  <span className="absolute right-4 top-3.5 text-slate-400 font-mono text-sm">lbs</span>
                </div>
              </div>
              <div>
                <label htmlFor="tdee-height-ft" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Height (ft / in)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    id="tdee-height-ft"
                    type="number"
                    min="1"
                    max="8"
                    value={heightFt}
                    onChange={(e) => setHeightFt(e.target.value)}
                    aria-label="Height in feet"
                    className="w-full px-3 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-base"
                    placeholder="ft"
                  />
                  <input
                    id="tdee-height-in"
                    type="number"
                    min="0"
                    max="11"
                    value={heightIn}
                    onChange={(e) => setHeightIn(e.target.value)}
                    aria-label="Height in inches"
                    className="w-full px-3 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-base"
                    placeholder="in"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <div>
          <label htmlFor="tdee-activity" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Daily Physical Activity Level
          </label>
          <select
            id="tdee-activity"
            value={activityMultiplier}
            onChange={(e) => setActivityMultiplier(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
          >
            <option value="1.2">Sedentary (1.20) — Desk job, little to no regular exercise</option>
            <option value="1.375">Lightly Active (1.375) — Light exercise / walking 1–3 days per week</option>
            <option value="1.55">Moderately Active (1.55) — Moderate workouts / sports 3–5 days per week</option>
            <option value="1.725">Very Active (1.725) — Intense training / workouts 6–7 days per week</option>
            <option value="1.9">Extra Active (1.90) — Very heavy physical labor or twice-daily athlete training</option>
          </select>
        </div>

        {errorMsg && (
          <div role="alert" className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-sm font-medium text-rose-700 dark:text-rose-300">
            {errorMsg}
          </div>
        )}

        {calc && (
          <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
            <FormulaHoverHighlight
              accent="indigo"
              formulaLabel={
                formula === 'mifflin'
                  ? `Mifflin-St Jeor (${gender === 'male' ? 'Male' : 'Female'}) × Activity Factor`
                  : 'Katch-McArdle (Lean Body Mass) × Activity Factor'
              }
              formula={
                formula === 'mifflin'
                  ? gender === 'male'
                    ? 'TDEE = (10 × W + 6.25 × H − 5 × A + 5) × AF'
                    : 'TDEE = (10 × W + 6.25 × H − 5 × A − 161) × AF'
                  : 'TDEE = (370 + 21.6 × LBM) × AF'
              }
              variables={
                formula === 'mifflin'
                  ? [
                      { symbol: 'W', name: 'Weight', value: calc.wKgVal, unit: 'kg' },
                      { symbol: 'H', name: 'Height', value: calc.hCmVal, unit: 'cm' },
                      { symbol: 'A', name: 'Age', value: calc.ageVal, unit: 'yrs' },
                      { symbol: 'AF', name: 'Activity Multiplier', value: activityMultiplier },
                    ]
                  : [
                      { symbol: 'LBM', name: 'Lean Body Mass', value: calc.leanMassKg ?? (calc.wKgVal * (1 - calc.bfVal / 100)).toFixed(1), unit: 'kg' },
                      { symbol: 'AF', name: 'Activity Multiplier', value: activityMultiplier },
                    ]
              }
              activeStep={`BMR (${calc.bmrDisplay} kcal/day) × ${activityMultiplier} = ${calc.tdeeDisplay} kcal/day`}
            >
              <div className="p-6 rounded-2xl bg-slate-900 text-white dark:bg-slate-950 dark:border dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 shadow-md">
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-400 block mb-1">
                    Daily Energy Maintenance (TDEE)
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white tabular-nums">
                      {calc.tdeeDisplay}
                    </span>
                    <span className="text-sm font-medium text-slate-300">calories / day</span>
                  </div>
                  <span className="text-xs text-slate-400 block mt-1">
                    Basal Metabolic Rate (BMR): <strong className="text-indigo-300 font-mono">{calc.bmrDisplay} kcal</strong>
                    {calc.leanMassKg && <> · Lean Body Mass: <strong className="text-emerald-300 font-mono">{calc.leanMassKg} kg</strong></>}
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

            {calc.floorApplied && (
              <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-900 dark:text-amber-200">
                Weight-loss targets are floored at {calc.clinicalFloor} kcal/day for baseline nutritional adequacy. Consult a clinician for lower-calorie plans.
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Mild Weight Loss (-0.5 lb/wk)
                </span>
                <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {calc.mildDeficitDisplay}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">-250 kcal/day target</span>
              </div>

              <div className="p-4 rounded-xl border-2 border-indigo-600/30 dark:border-indigo-500/40 bg-indigo-50/50 dark:bg-indigo-950/20">
                <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider block">
                  Recommended Loss (~1 lb/wk)
                </span>
                <span className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 tabular-nums">
                  {calc.moderateDeficitDisplay}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">-500 kcal/day target</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Aggressive Loss (~2 lb/wk max)
                </span>
                <span className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 tabular-nums">
                  {calc.aggressiveDeficitDisplay}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">-1000 kcal / clinical floor</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Lean Muscle Gain (+0.7 lb/wk)
                </span>
                <span className="text-2xl font-bold font-mono text-slate-800 dark:text-slate-200 tabular-nums">
                  {calc.muscleGainDisplay}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">+350 kcal/day surplus</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 space-y-3">
              <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Sample Macronutrient Split for {calc.moderateDeficitDisplay} kcal/day Goal
              </h4>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <span className="text-xs text-slate-500 block">Protein (30%)</span>
                  <span className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
                    {calc.macros.protein}g
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <span className="text-xs text-slate-500 block">Carbs (40%)</span>
                  <span className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
                    {calc.macros.carbs}g
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <span className="text-xs text-slate-500 block">Fats (30%)</span>
                  <span className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
                    {calc.macros.fat}g
                  </span>
                </div>
              </div>
            </div>
            <AutoUnitConversionSuggestions
              candidates={[
                { source: 'output', label: 'Daily TDEE', value: calc.tdeeNum, unit: 'kcal' },
                { source: 'output', label: 'Basal Metabolic Rate', value: calc.bmrNum, unit: 'kcal' },
                { source: 'input', label: 'Weight', value: calc.wKgVal, unit: 'kg' },
                { source: 'input', label: 'Height', value: calc.hCmVal, unit: 'cm' },
              ]}
            />
          </div>
        )}
      </div>
    </div>
  );
};
