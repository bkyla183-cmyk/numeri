import { CalculatorSpec } from './types';
import { parseNum, calcError } from './validation';
import {
  calculateBmiMetrics,
  calculateCalorieTdee,
  calculateUsNavyBodyFat,
} from '../../utils/calculatorFormulas';

function formatDuration(totalMinutes: number): string {
  const totalSec = Math.round(totalMinutes * 60);
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export const activeHealthSpecs: CalculatorSpec[] = [
  {
    slug: 'bmi-calculator',
    title: 'Body Mass Index (BMI) Calculator',
    category: 'health-fitness',
    formulaDisplay: 'BMI = weight (kg) / [height (m)]²',
    inputs: [
      { id: 'weightKg', label: 'Weight (kg)', defaultValue: 72, type: 'number', min: 1, max: 500, step: 0.5, unit: 'kg' },
      { id: 'heightCm', label: 'Height (cm)', defaultValue: 175, type: 'number', min: 40, max: 270, step: 1, unit: 'cm' },
    ],
    calculate: (v) => {
      const w = parseNum(v.weightKg);
      const hCm = parseNum(v.heightCm);
      if (isNaN(w) || isNaN(hCm) || w <= 0 || hCm <= 0) {
        return calcError('Weight and height must be positive numbers.');
      }
      const res = calculateBmiMetrics(w, hCm);
      if ('error' in res) return calcError(res.error);
      return {
        primaryValue: parseFloat(res.bmi.toFixed(1)),
        primaryUnit: 'kg/m²',
        primaryLabel: `BMI Index (${res.category})`,
        secondaryOutputs: [
          { label: 'WHO Category', value: res.category },
          { label: 'Healthy Weight Range (BMI 18.5 - 24.9)', value: `${res.healthyMinKg.toFixed(1)} - ${res.healthyMaxKg.toFixed(1)} kg` },
          { label: 'BMI Prime (BMI / 25)', value: res.bmiPrime.toFixed(2) },
          { label: 'Ponderal Index (kg/m³)', value: res.ponderalIndex.toFixed(1) },
        ],
        steps: [`BMI = ${w} kg / (${(hCm / 100).toFixed(2)} m)² = ${res.bmi.toFixed(2)}`],
        formulaUsed: 'Quetelet Body Mass Index (WHO Standard)',
      };
    },
  },
  {
    slug: 'calorie-calculator',
    title: 'Daily Calorie & TDEE Calculator',
    category: 'health-fitness',
    formulaDisplay: 'TDEE = BMR (Mifflin-St Jeor or Katch-McArdle) × Activity Factor',
    inputs: [
      {
        id: 'formula',
        label: 'BMR Formula',
        type: 'select',
        defaultValue: 'mifflin',
        options: [
          { label: 'Mifflin-St Jeor (General Standard)', value: 'mifflin' },
          { label: 'Katch-McArdle (Requires Body Fat %)', value: 'katch' },
        ],
      },
      { id: 'weightKg', label: 'Weight (kg)', defaultValue: 75, type: 'number', min: 10, max: 500, step: 0.5, unit: 'kg' },
      { id: 'heightCm', label: 'Height (cm)', defaultValue: 178, type: 'number', min: 50, max: 270, step: 1, unit: 'cm' },
      { id: 'age', label: 'Age (Years)', defaultValue: 30, type: 'number', min: 5, max: 120, step: 1, unit: 'yrs', visibleWhen: (v) => v.formula !== 'katch' },
      {
        id: 'gender',
        label: 'Biological Sex',
        type: 'select',
        defaultValue: 'male',
        options: [{ label: 'Male (+5)', value: 'male' }, { label: 'Female (-161)', value: 'female' }],
      },
      {
        id: 'bodyFatPct',
        label: 'Body Fat Percentage (%)',
        defaultValue: 18,
        type: 'number',
        min: 3,
        max: 65,
        step: 0.5,
        unit: '%',
        visibleWhen: (v) => v.formula === 'katch',
      },
      {
        id: 'activity',
        label: 'Activity Level',
        type: 'select',
        defaultValue: '1.375',
        options: [
          { label: 'Sedentary (desk job, 1.2x)', value: '1.2' },
          { label: 'Light Exercise (1-3 days/wk, 1.375x)', value: '1.375' },
          { label: 'Moderate Exercise (3-5 days/wk, 1.55x)', value: '1.55' },
          { label: 'Heavy Exercise (6-7 days/wk, 1.725x)', value: '1.725' },
          { label: 'Extra Active (Athlete / 2x daily, 1.9x)', value: '1.9' },
        ],
      },
    ],
    calculate: (v) => {
      const formula = v.formula === 'katch' ? 'katch' : 'mifflin';
      const w = parseNum(v.weightKg);
      const h = parseNum(v.heightCm);
      const age = parseNum(v.age);
      const bf = v.bodyFatPct === undefined ? 18 : parseNum(v.bodyFatPct);
      const multRaw = parseNum(v.activity || '1.375');
      const mult = Number.isNaN(multRaw) && (v.activity === 'invalid_option' || v.activity === '') ? 1.375 : multRaw;
      const gender = v.gender === 'female' ? 'female' : 'male';

      if ([w, h, age, mult].some(isNaN) || (formula === 'katch' && isNaN(bf))) {
        return calcError('Please enter valid numeric biometric inputs.');
      }

      const res = calculateCalorieTdee({
        formula,
        gender,
        age,
        weightKg: w,
        heightCm: h,
        activityMultiplier: mult,
        bodyFatPct: bf,
      });
      if ('error' in res) return calcError(res.error);

      const secondaryOutputs = [
        { label: 'Basal Metabolic Rate (BMR)', value: `${Math.round(res.bmr)} kcal/day` },
        { label: 'Weight Loss (-500 kcal, floored)', value: `${Math.round(res.weightLoss)} kcal/day` },
        { label: 'Mild Loss (-250 kcal)', value: `${Math.round(res.mildLoss)} kcal/day` },
        { label: 'Clean Muscle Gain (+250 kcal)', value: `${Math.round(res.mildGain)} kcal/day` },
      ];
      if (res.leanMassKg !== null) {
        secondaryOutputs.push({ label: 'Lean Body Mass', value: `${res.leanMassKg.toFixed(1)} kg` });
      }

      return {
        primaryValue: Math.round(res.tdee),
        primaryUnit: 'kcal / day',
        primaryLabel: 'Maintenance Calories (TDEE)',
        secondaryOutputs,
        steps: [
          formula === 'katch'
            ? `Katch-McArdle BMR = 370 + 21.6 × ${res.leanMassKg?.toFixed(1)} kg = ${Math.round(res.bmr)} kcal`
            : `Mifflin-St Jeor BMR = 10(${w}) + 6.25(${h}) - 5(${age}) ${gender === 'male' ? '+ 5' : '- 161'} = ${Math.round(res.bmr)} kcal`,
          `TDEE = ${Math.round(res.bmr)} × ${mult} = ${Math.round(res.tdee)} kcal`,
        ],
        formulaUsed: formula === 'katch' ? 'Katch-McArdle Lean Mass Equation' : 'Mifflin-St Jeor TDEE Equation',
      };
    },
  },
  {
    slug: 'body-fat-calculator',
    title: 'US Navy Body Fat Percentage Calculator',
    category: 'health-fitness',
    formulaDisplay: 'Hodgdon & Beckett US Navy Circumference Model',
    inputs: [
      {
        id: 'gender',
        label: 'Gender',
        type: 'select',
        defaultValue: 'male',
        options: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }],
      },
      { id: 'weightKg', label: 'Body Weight (kg)', defaultValue: 75, type: 'number', min: 15, max: 400, step: 0.5, unit: 'kg' },
      { id: 'heightCm', label: 'Height (cm)', defaultValue: 178, type: 'number', min: 50, max: 270, step: 1, unit: 'cm' },
      { id: 'waistCm', label: 'Waist Circumference (at navel, cm)', defaultValue: 84, type: 'number', min: 30, max: 250, step: 0.5, unit: 'cm' },
      { id: 'neckCm', label: 'Neck Circumference (cm)', defaultValue: 38, type: 'number', min: 15, max: 100, step: 0.5, unit: 'cm' },
      { id: 'hipCm', label: 'Hip Circumference (Females only, cm)', defaultValue: 96, type: 'number', min: 30, max: 250, step: 0.5, unit: 'cm', visibleWhen: (v) => v.gender === 'female' },
    ],
    calculate: (v) => {
      const gender = v.gender === 'female' ? 'female' : 'male';
      const wKg = v.weightKg === undefined ? 75 : parseNum(v.weightKg);
      const waist = parseNum(v.waistCm);
      const neck = parseNum(v.neckCm);
      const h = parseNum(v.heightCm);
      const hip = v.hipCm === undefined ? 96 : parseNum(v.hipCm);
      if ([wKg, waist, neck, h].some(isNaN) || (gender === 'female' && isNaN(hip))) {
        return calcError('Please enter valid body weight, height, and circumference measurements.');
      }

      const res = calculateUsNavyBodyFat({
        gender,
        heightCm: h,
        weightKg: wKg,
        neckCm: neck,
        waistCm: waist,
        hipCm: hip,
      });
      if ('error' in res) return calcError(res.error);

      return {
        primaryValue: parseFloat(res.bodyFatPct.toFixed(1)),
        primaryUnit: '%',
        primaryLabel: 'Estimated Body Fat Percentage',
        secondaryOutputs: [
          { label: 'ACE Body Fat Category', value: res.category },
          { label: 'Fat Mass', value: `${res.fatMassKg.toFixed(1)} kg` },
          { label: 'Lean Body Mass', value: `${res.leanMassKg.toFixed(1)} kg` },
          { label: 'Waist-to-Height Ratio (WHtR)', value: res.whtr.toFixed(2) },
          { label: 'Normalized FFMI', value: res.normalizedFfmi.toFixed(1) },
        ],
        steps: [
          `Converted cm to inches (height=${(h / 2.54).toFixed(2)}", waist=${(waist / 2.54).toFixed(2)}", neck=${(neck / 2.54).toFixed(2)}").`,
          `US Navy BF% = ${res.bodyFatPct.toFixed(1)}% (${res.category}), Lean Mass = ${res.leanMassKg.toFixed(1)} kg.`,
        ],
        formulaUsed: 'Hodgdon & Beckett US Navy Body Fat Equations',
      };
    },
  },
  {
    slug: 'target-heart-rate-calculator',
    title: 'Target Heart Rate (Karvonen) Calculator',
    category: 'health-fitness',
    formulaDisplay: 'THR = Resting HR + (Max HR - Resting HR) × Intensity %',
    inputs: [
      { id: 'age', label: 'Age (Years)', defaultValue: 30, type: 'number', min: 5, max: 120, step: 1, unit: 'yrs', visibleWhen: (v) => v.maxHrMethod !== 'custom' },
      { id: 'restHr', label: 'Resting Heart Rate (bpm)', defaultValue: 65, type: 'number', min: 25, max: 150, step: 1, unit: 'bpm' },
      {
        id: 'maxHrMethod',
        label: 'Max Heart Rate Equation',
        type: 'select',
        defaultValue: 'tanaka',
        advanced: true,
        options: [
          { label: 'Tanaka (208 - 0.7 × Age)', value: 'tanaka' },
          { label: 'Classic Fox (220 - Age)', value: 'fox' },
          { label: 'Custom Tested Max HR', value: 'custom' },
        ],
      },
      { id: 'customMaxHr', label: 'Custom Max HR (bpm)', defaultValue: 190, type: 'number', min: 90, max: 230, step: 1, unit: 'bpm', advanced: true, visibleWhen: (v) => v.maxHrMethod === 'custom' },
    ],
    calculate: (v) => {
      const method = v.maxHrMethod === 'fox' ? 'fox' : v.maxHrMethod === 'custom' ? 'custom' : 'tanaka';
      const age = parseNum(v.age);
      const rest = parseNum(v.restHr);
      const customMax = v.customMaxHr === undefined ? 190 : parseNum(v.customMaxHr);

      if (isNaN(rest) || (method !== 'custom' && isNaN(age)) || (method === 'custom' && isNaN(customMax))) {
        return calcError('Please enter valid numeric age and heart rate values.');
      }
      if (method !== 'custom' && (age < 5 || age > 120)) return calcError('Age must be between 5 and 120 years.');
      if (method === 'custom' && (customMax < 90 || customMax > 230)) return calcError('Custom Max HR must be between 90 and 230 bpm.');

      const maxHr = method === 'custom' ? customMax : method === 'fox' ? 220 - age : 208 - 0.7 * age;
      if (rest < 25 || rest >= maxHr) {
        return calcError(`Resting heart rate must be between 25 bpm and ${Math.floor(maxHr - 1)} bpm.`);
      }
      const hrr = maxHr - rest;
      const z = (pct: number) => Math.round(rest + hrr * pct);

      return {
        primaryValue: `${z(0.60)} - ${z(0.70)}`,
        primaryUnit: 'bpm',
        primaryLabel: 'Aerobic Endurance Zone (60% - 70% HRR)',
        secondaryOutputs: [
          { label: 'Max Heart Rate', value: `${Math.round(maxHr)} bpm (HRR ${Math.round(hrr)} bpm)` },
          { label: 'Zone 1 Recovery (50–60%)', value: `${z(0.50)} - ${z(0.60)} bpm` },
          { label: 'Zone 3 Tempo (70–80%)', value: `${z(0.70)} - ${z(0.80)} bpm` },
          { label: 'Zone 4 Threshold (80–90%)', value: `${z(0.80)} - ${z(0.90)} bpm` },
          { label: 'Zone 5 VO₂ Max (90–100%)', value: `${z(0.90)} - ${Math.round(maxHr)} bpm` },
        ],
        steps: [
          `Max HR (${method}) = ${Math.round(maxHr)} bpm; HRR = ${Math.round(maxHr)} - ${rest} = ${Math.round(hrr)} bpm`,
          `Karvonen 60%–70% Zone = ${z(0.60)} - ${z(0.70)} bpm`,
        ],
        formulaUsed: 'Karvonen Heart Rate Reserve Formula',
      };
    },
  },
  {
    slug: 'macronutrient-calculator',
    title: 'Macronutrient Split (Carbs, Protein, Fats) Calculator',
    category: 'health-fitness',
    formulaDisplay: 'Protein (4 kcal/g), Carbs (4 kcal/g), Fats (9 kcal/g)',
    inputs: [
      { id: 'calories', label: 'Daily Calorie Target (kcal)', defaultValue: 2200, type: 'number', min: 100, step: 50, unit: 'kcal' },
      {
        id: 'dietPreset',
        label: 'Diet Profile',
        type: 'select',
        defaultValue: 'custom',
        options: [
          { label: 'Custom Macro Split (%)', value: 'custom' },
          { label: 'Balanced Zone (30P / 40C / 30F)', value: 'balanced' },
          { label: 'High-Protein Lean (40P / 35C / 25F)', value: 'high_protein' },
          { label: 'Ketogenic Low-Carb (25P / 5C / 70F)', value: 'keto' },
          { label: 'Endurance Athlete (20P / 55C / 25F)', value: 'endurance' },
        ],
      },
      { id: 'proteinPct', label: 'Protein %', defaultValue: 30, type: 'number', min: 0, max: 100, step: 5, unit: '%', visibleWhen: (v) => !v.dietPreset || v.dietPreset === 'custom' },
      { id: 'carbsPct', label: 'Carbohydrates %', defaultValue: 40, type: 'number', min: 0, max: 100, step: 5, unit: '%', visibleWhen: (v) => !v.dietPreset || v.dietPreset === 'custom' },
      { id: 'fatsPct', label: 'Fats %', defaultValue: 30, type: 'number', min: 0, max: 100, step: 5, unit: '%', visibleWhen: (v) => !v.dietPreset || v.dietPreset === 'custom' },
      { id: 'bodyWeightKg', label: 'Body Weight (optional, for g/kg check)', defaultValue: 0, type: 'number', min: 0, max: 350, step: 1, unit: 'kg', advanced: true },
    ],
    calculate: (v) => {
      const cal = parseNum(v.calories);
      const bw = v.bodyWeightKg === undefined ? 0 : parseNum(v.bodyWeightKg);
      if (isNaN(cal) || isNaN(bw) || cal <= 0 || bw < 0) {
        return calcError('Calories must be > 0 and body weight must be non-negative.');
      }

      const presets: Record<string, [number, number, number]> = {
        balanced: [30, 40, 30],
        high_protein: [40, 35, 25],
        keto: [25, 5, 70],
        endurance: [20, 55, 25],
      };
      const presetKey = String(v.dietPreset || 'custom');
      let pRaw: number;
      let cRaw: number;
      let fRaw: number;

      if (presetKey in presets) {
        [pRaw, cRaw, fRaw] = presets[presetKey];
      } else {
        pRaw = parseNum(v.proteinPct);
        cRaw = parseNum(v.carbsPct);
        fRaw = parseNum(v.fatsPct);
        if ([pRaw, cRaw, fRaw].some(isNaN)) return calcError('Please enter valid numeric macro percentages.');
        if (pRaw < 0 || cRaw < 0 || fRaw < 0) return calcError('Macronutrient percentages cannot be negative.');
        const sum = pRaw + cRaw + fRaw;
        if (Math.abs(sum - 100) > 0.5) {
          return calcError(`Macronutrient split percentages currently total ${sum.toFixed(1)}% — adjust them to sum to 100%.`);
        }
      }

      const proteinG = (cal * (pRaw / 100)) / 4;
      const carbsG = (cal * (cRaw / 100)) / 4;
      const fatsG = (cal * (fRaw / 100)) / 9;
      const fiberTarget = Math.round((cal / 1000) * 14);

      const secondaryOutputs = [
        { label: 'Protein Grams (4 kcal/g)', value: `${Math.round(proteinG)}g (${Math.round(cal * (pRaw / 100))} kcal)` },
        { label: 'Carbohydrates Grams (4 kcal/g)', value: `${Math.round(carbsG)}g (${Math.round(cal * (cRaw / 100))} kcal)` },
        { label: 'Healthy Fats Grams (9 kcal/g)', value: `${Math.round(fatsG)}g (${Math.round(cal * (fRaw / 100))} kcal)` },
        { label: 'Recommended Dietary Fiber', value: `~${fiberTarget}g / day (14g per 1,000 kcal)` },
      ];
      if (bw > 0) {
        secondaryOutputs.push({ label: 'Protein Intake Ratio', value: `${(proteinG / bw).toFixed(2)} g/kg body weight` });
      }

      return {
        primaryValue: `${Math.round(proteinG)}g P / ${Math.round(carbsG)}g C / ${Math.round(fatsG)}g F`,
        primaryLabel: 'Daily Macronutrient Targets',
        secondaryOutputs,
        steps: [
          `Protein: (${cal} × ${pRaw}%) / 4 = ${Math.round(proteinG)}g`,
          `Carbs: (${cal} × ${cRaw}%) / 4 = ${Math.round(carbsG)}g`,
          `Fats: (${cal} × ${fRaw}%) / 9 = ${Math.round(fatsG)}g`,
        ],
        formulaUsed: '4-4-9 Atwater Factor Caloric Breakdown',
      };
    },
  },
  {
    slug: 'running-pace-calculator',
    title: 'Running Pace Calculator',
    category: 'health-fitness',
    formulaDisplay: 'Pace = Time / Distance   |   Split Projections = Pace × Race Distance',
    inputs: [
      { id: 'distanceKm', label: 'Distance', defaultValue: 10, type: 'number', min: 0.01, step: 0.5, unit: 'km' },
      {
        id: 'distanceUnit',
        label: 'Distance Unit',
        type: 'select',
        defaultValue: 'km',
        advanced: true,
        options: [
          { label: 'Kilometers (km)', value: 'km' },
          { label: 'Miles (mi)', value: 'mi' },
        ],
      },
      { id: 'hours', label: 'Hours', defaultValue: 0, type: 'number', min: 0, step: 1 },
      { id: 'minutes', label: 'Minutes', defaultValue: 50, type: 'number', min: 0, max: 59, step: 1 },
      { id: 'seconds', label: 'Seconds', defaultValue: 0, type: 'number', min: 0, max: 59, step: 5 },
    ],
    calculate: (v) => {
      const distRaw = parseNum(v.distanceKm);
      const distUnit = v.distanceUnit === 'mi' ? 'mi' : 'km';
      const d = distUnit === 'mi' ? distRaw * 1.609344 : distRaw;
      const hrs = parseNum(v.hours);
      const mins = parseNum(v.minutes);
      const secs = parseNum(v.seconds);

      if ([distRaw, hrs, mins, secs].some(isNaN)) return calcError('Please enter valid numeric distance and time fields.');
      if (distRaw <= 0) return calcError('Distance must be greater than zero.');
      if (hrs < 0 || mins < 0 || secs < 0) return calcError('Time components cannot be negative.');
      const totalSec = hrs * 3600 + mins * 60 + secs;
      if (totalSec <= 0) return calcError('Total running time must be greater than zero.');

      const minPerKmExact = totalSec / 60 / d;
      const minPerMileExact = totalSec / 60 / (d * 0.62137119);
      const speedKmh = d / (totalSec / 3600);

      return {
        primaryValue: formatDuration(minPerKmExact),
        primaryUnit: 'min / km',
        primaryLabel: 'Pace per Kilometer',
        secondaryOutputs: [
          { label: 'Pace per Mile', value: `${formatDuration(minPerMileExact)} / mi` },
          { label: 'Running Speed', value: `${speedKmh.toFixed(2)} km/h (${(speedKmh * 0.621371).toFixed(2)} mph)` },
          { label: 'Projected 5K / 10K Finish', value: `${formatDuration(minPerKmExact * 5)} / ${formatDuration(minPerKmExact * 10)}` },
          { label: 'Half Marathon (21.1 km)', value: formatDuration(minPerKmExact * 21.0975) },
          { label: 'Full Marathon (42.2 km)', value: formatDuration(minPerKmExact * 42.195) },
        ],
        steps: [`Total time: ${totalSec} seconds for ${distRaw} ${distUnit} (${d.toFixed(2)} km).`],
        formulaUsed: 'Pace = Time / Distance',
      };
    },
  },
  {
    slug: 'due-date-calculator',
    title: 'Pregnancy Due Date Calculator',
    description: 'Calculate your estimated date of delivery (EDD) using Naegele rule based on last menstrual period or conception date.',
    category: 'health-fitness',
    inputs: [
      {
        id: 'method',
        label: 'Dating Reference Basis',
        type: 'select',
        defaultValue: 'lmp',
        options: [
          { label: 'Days Since Last Menstrual Period (LMP)', value: 'lmp' },
          { label: 'Days Since Known Conception Date', value: 'conception' },
        ],
      },
      { id: 'days_since_lmp', label: 'Days Elapsed Since Reference Date', type: 'number', defaultValue: 65, min: 0, max: 300, step: 1, unit: 'days' },
      { id: 'cycle_length', label: 'Average Menstrual Cycle Length (Days)', type: 'number', defaultValue: 28, min: 20, max: 45, step: 1, unit: 'days', visibleWhen: (v) => v.method !== 'conception' },
    ],
    calculate: (inputs) => {
      const method = inputs.method === 'conception' ? 'conception' : 'lmp';
      const elapsedRaw = parseNum(inputs.days_since_lmp);
      const cycle = inputs.cycle_length === undefined ? 28 : parseNum(inputs.cycle_length);
      if (isNaN(elapsedRaw) || (method === 'lmp' && isNaN(cycle))) {
        return calcError('Please enter valid numbers for elapsed days and cycle length.');
      }
      if (elapsedRaw < 0 || elapsedRaw > 300) return calcError('Elapsed days must be between 0 and 300.');
      if (method === 'lmp' && (cycle < 20 || cycle > 45)) return calcError('Cycle length must be between 20 and 45 days.');

      // Conception is ~14 gestational days post-LMP; gestational total span is 280d (+cycle adjustment)
      const gestationalDays = method === 'conception' ? elapsedRaw + 14 : elapsedRaw;
      const cycleAdjustment = method === 'conception' ? 0 : cycle - 28;
      const totalPregnancyDays = 280 + cycleAdjustment;
      const daysRemaining = Math.max(0, totalPregnancyDays - gestationalDays);
      const weeksElapsed = Math.floor(gestationalDays / 7);
      const daysExtra = Math.floor(gestationalDays % 7);

      // Standard ACOG convention: T1 = 0..13w, T2 = 14..27w, T3 = 28w+
      let trimester = 'First Trimester (Weeks 1–13)';
      if (weeksElapsed >= 28) trimester = 'Third Trimester (Weeks 28–40)';
      else if (weeksElapsed >= 14) trimester = 'Second Trimester (Weeks 14–27)';

      return {
        primaryOutput: daysRemaining,
        primaryUnit: 'Days Until Estimated Due Date',
        secondaryOutputs: [
          { label: 'Current Gestational Age', value: `${weeksElapsed} weeks, ${daysExtra} days` },
          { label: 'Trimester (ACOG)', value: trimester },
          { label: 'Pregnancy Progress', value: parseFloat(Math.min(100, (gestationalDays / totalPregnancyDays) * 100).toFixed(1)), unit: '%' },
        ],
        steps: [
          method === 'conception'
            ? 'Conception offset: Gestational Age = Days Since Conception + 14 days (EDD = Conception + 266 days).'
            : 'Naegele rule: Estimated Due Date = LMP + 280 days + (Cycle Length - 28 days)',
          `Gestational age: ${weeksElapsed} weeks ${daysExtra} days (${gestationalDays} days)`,
          `Remaining until due date: ${daysRemaining} days`,
        ],
      };
    },
  },
  {
    slug: 'ovulation-calculator',
    title: 'Ovulation & Fertility Window',
    description: 'Predict your most fertile days and estimated ovulation window based on cycle regularity.',
    inputs: [
      { id: 'cycle_length', label: 'Average Menstrual Cycle Length (Days)', type: 'number', defaultValue: 28, min: 20, max: 45, step: 1, unit: 'days' },
      { id: 'current_cycle_day', label: 'Current Day of Cycle (Day 1 = Period Starts)', type: 'number', defaultValue: 10, min: 1, max: 45, step: 1, unit: 'day' },
      { id: 'lutealLength', label: 'Luteal Phase Length (Days)', type: 'number', defaultValue: 14, min: 10, max: 18, step: 1, unit: 'days', advanced: true },
    ],
    calculate: (inputs) => {
      const cycle = parseNum(inputs.cycle_length);
      const current = parseNum(inputs.current_cycle_day);
      const luteal = inputs.lutealLength === undefined ? 14 : parseNum(inputs.lutealLength);
      if ([cycle, current, luteal].some(isNaN)) return calcError('Please enter valid cycle length, current day, and luteal phase.');
      if (cycle < 20 || cycle > 45) return calcError('Cycle length must be between 20 and 45 days.');
      if (luteal < 10 || luteal > 18) return calcError('Luteal phase length must be between 10 and 18 days.');
      if (current < 1 || current > cycle) return calcError(`Current cycle day must be between 1 and ${cycle}.`);

      const ovulationDay = cycle - luteal;
      if (ovulationDay < 6) return calcError('Estimated ovulation day falls too early in this cycle length / luteal combination.');
      const fertileStart = Math.max(1, ovulationDay - 5);
      const fertileEnd = Math.min(cycle, ovulationDay + 1);
      const daysToOvulation = ovulationDay - current;
      let status = 'Pre-Fertile Phase';
      if (current >= fertileStart && current <= fertileEnd) {
        status = current === ovulationDay ? 'PEAK FERTILITY (Ovulation Day)' : 'HIGH FERTILITY WINDOW';
      } else if (current > fertileEnd) {
        status = 'Post-Ovulatory / Luteal Phase';
      }
      return {
        primaryOutput: ovulationDay,
        primaryUnit: 'Cycle Day of Ovulation',
        secondaryOutputs: [
          { label: 'Fertile Window Span', value: `Days ${fertileStart} to ${fertileEnd}` },
          { label: 'Days Until Ovulation', value: daysToOvulation >= 0 ? daysToOvulation : 'Passed this cycle' },
          { label: 'Next Expected Period', value: `Cycle Day ${cycle + 1}` },
          { label: 'Current Fertility Status', value: status },
        ],
        steps: [
          `Luteal Phase = ${luteal} days before next cycle`,
          `Ovulation occurs on Cycle Day: ${cycle} - ${luteal} = Day ${ovulationDay}`,
          `Fertile window spans Days ${fertileStart} through ${fertileEnd}`,
        ],
      };
    },
  },
  {
    slug: 'ideal-weight-calculator',
    title: 'Ideal Body Weight (IBW) Calculator',
    category: 'health-fitness',
    formulaDisplay: 'Devine, Robinson, Miller & Hamwi Clinical IBW Equations',
    inputs: [
      { id: 'heightCm', label: 'Height (cm)', defaultValue: 175, type: 'number', min: 100, max: 260, step: 1, unit: 'cm' },
      {
        id: 'gender',
        label: 'Gender',
        type: 'select',
        defaultValue: 'male',
        options: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }],
      },
    ],
    calculate: (v) => {
      const hCm = parseNum(v.heightCm);
      if (isNaN(hCm) || hCm < 100 || hCm > 260) {
        return calcError('Height must be between 100 cm and 260 cm for adult IBW formulas.');
      }
      const hInches = hCm / 2.54;
      const inchesOver5Ft = Math.max(0, hInches - 60);
      const isMale = v.gender !== 'female';
      const devine = isMale ? 50 + 2.3 * inchesOver5Ft : 45.5 + 2.3 * inchesOver5Ft;
      const robinson = isMale ? 52 + 1.9 * inchesOver5Ft : 49 + 1.7 * inchesOver5Ft;
      const miller = isMale ? 56.2 + 1.41 * inchesOver5Ft : 53.1 + 1.36 * inchesOver5Ft;
      const hamwi = isMale ? 48.0 + 2.7 * inchesOver5Ft : 45.5 + 2.2 * inchesOver5Ft;
      const hM = hCm / 100;
      const bmiMin = 18.5 * hM * hM;
      const bmiMax = 24.9 * hM * hM;

      return {
        primaryValue: parseFloat(devine.toFixed(1)),
        primaryUnit: 'kg',
        primaryLabel: 'Ideal Body Weight (Devine Formula)',
        secondaryOutputs: [
          { label: 'In Pounds (lbs)', value: `${(devine * 2.20462).toFixed(1)} lbs` },
          { label: 'Robinson / Miller Formula', value: `${robinson.toFixed(1)} kg / ${miller.toFixed(1)} kg` },
          { label: 'Hamwi Formula IBW', value: `${hamwi.toFixed(1)} kg` },
          { label: 'Healthy WHO BMI Span (18.5–24.9)', value: `${bmiMin.toFixed(1)} – ${bmiMax.toFixed(1)} kg` },
        ],
        steps: [`Height: ${hInches.toFixed(1)} inches (${inchesOver5Ft.toFixed(1)} inches over 5 feet).`],
        formulaUsed: 'Devine, Robinson, Miller & Hamwi Clinical IBW Standard',
      };
    },
  },
  {
    slug: 'water-intake-calculator',
    title: 'Daily Water Hydration Calculator',
    category: 'health-fitness',
    formulaDisplay: 'Daily Water = Weight (kg) × 35 mL + Exercise + Climate Bonus',
    inputs: [
      { id: 'weightKg', label: 'Body Weight (kg)', defaultValue: 75, type: 'number', min: 5, max: 400, step: 1, unit: 'kg' },
      { id: 'exerciseMin', label: 'Daily Exercise / Activity (Minutes)', defaultValue: 45, type: 'number', min: 0, max: 720, step: 15, unit: 'min' },
      {
        id: 'climate',
        label: 'Ambient Climate',
        type: 'select',
        defaultValue: 'temperate',
        advanced: true,
        options: [
          { label: 'Temperate / Indoor Climate', value: 'temperate' },
          { label: 'Hot / Humid Weather (+15%)', value: 'hot_humid' },
        ],
      },
    ],
    calculate: (v) => {
      const w = parseNum(v.weightKg);
      const ex = parseNum(v.exerciseMin);
      const isHot = v.climate === 'hot_humid';
      if (isNaN(w) || isNaN(ex) || w <= 0 || ex < 0) {
        return calcError('Body weight must be > 0 and exercise minutes must be ≥ 0.');
      }
      const baseMl = w * 35;
      const exerciseMl = (ex / 30) * 350;
      const climateMult = isHot ? 1.15 : 1.0;
      const totalMl = (baseMl + exerciseMl) * climateMult;
      const totalLiters = totalMl / 1000;
      const flOz = totalMl / 29.5735;
      const cups = flOz / 8;

      return {
        primaryValue: parseFloat(totalLiters.toFixed(2)),
        primaryUnit: 'liters / day',
        primaryLabel: 'Recommended Water Intake',
        secondaryOutputs: [
          { label: 'Fluid Ounces (US fl oz)', value: `${Math.round(flOz)} fl oz (${Math.round(totalMl)} mL)` },
          { label: 'Standard 8 oz Glasses', value: `${Math.round(cups)} cups` },
          { label: 'Base Hydration Need', value: `${(baseMl / 1000).toFixed(2)} L` },
          { label: 'Exercise Sweat Replacement', value: `${(exerciseMl / 1000).toFixed(2)} L` },
        ],
        steps: [
          `Base: ${w} kg × 35 mL = ${baseMl} mL; Exercise: +${Math.round(exerciseMl)} mL${isHot ? '; Hot/humid +15%' : ''}.`,
        ],
        formulaUsed: 'Clinical Hydration Requirement Standard',
      };
    },
  },
];
