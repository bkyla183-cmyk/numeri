import { CalculatorSpec } from './types';
import { parseNum, calcError, parseLocalDate } from './validation';

const fmt = (n: number, d = 2): number => {
  if (!Number.isFinite(n)) return 0;
  const r = Number(n.toFixed(d));
  return Object.is(r, -0) ? 0 : r;
};

const addDaysIso = (d: Date, days: number): string => {
  const out = new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
  return `${out.getFullYear()}-${String(out.getMonth() + 1).padStart(2, '0')}-${String(out.getDate()).padStart(2, '0')}`;
};

export const batch4HealthSpecs: CalculatorSpec[] = [
  // 766. BMR (Mifflin-St Jeor & Katch-McArdle)
  {
    slug: 'bmr-mifflin-katch-mcardle-calculator',
    title: 'Basal Metabolic Rate (BMR) Mifflin-St Jeor & Katch-McArdle Calculator',
    category: 'health-fitness',
    formulaDisplay: 'Mifflin: 10W + 6.25H − 5A (+5 M / −161 F)   |   Katch: 370 + 21.6×LBM',
    inputs: [
      { id: 'sex', label: 'Biological Sex', type: 'select', defaultValue: 'male', options: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }] },
      { id: 'weightKg', label: 'Body Weight', type: 'number', unit: 'kg', defaultValue: 78, min: 20, max: 350, step: 0.5 },
      { id: 'heightCm', label: 'Height', type: 'number', unit: 'cm', defaultValue: 178, min: 90, max: 260, step: 1 },
      { id: 'age', label: 'Age', type: 'number', unit: 'yrs', defaultValue: 32, min: 15, max: 110, step: 1 },
      { id: 'bodyFatPct', label: 'Optional Body Fat % (for Katch-McArdle)', type: 'number', unit: '%', defaultValue: 18, min: 3, max: 65, step: 1, advanced: true },
    ],
    calculate: (v) => {
      const sex = String(v.sex || 'male');
      const [w, h, age, bf] = [v.weightKg, v.heightCm, v.age, v.bodyFatPct ?? 0].map(parseNum);
      if ([w, h, age, bf].some(Number.isNaN) || w <= 0 || h <= 0 || age <= 0) return calcError('Enter positive weight, height, and age.');
      const mifflin = 10 * w + 6.25 * h - 5 * age + (sex === 'male' ? 5 : -161);
      const lbm = w * (1 - Math.min(0.65, Math.max(0.03, bf / 100)));
      const katch = 370 + 21.6 * lbm;
      return {
        primaryValue: Math.round(mifflin),
        primaryUnit: 'kcal / day',
        primaryLabel: 'Mifflin-St Jeor Resting BMR',
        secondaryOutputs: [
          { label: 'Katch-McArdle BMR (Lean Mass)', value: `${Math.round(katch)} kcal/day` },
          { label: 'Sedentary Maintenance TDEE (1.2×)', value: `${Math.round(mifflin * 1.2)} kcal/day` },
          { label: 'Moderate Training TDEE (1.55×)', value: `${Math.round(mifflin * 1.55)} kcal/day` },
        ],
        steps: [`Mifflin-St Jeor = 10(${w}) + 6.25(${h}) − 5(${age}) ${sex === 'male' ? '+ 5' : '− 161'} = ${Math.round(mifflin)} kcal/day.`],
      };
    },
  },

  // 767. Lean Body Mass (Boer, James & Hume)
  {
    slug: 'lean-muscle-mass-boer-hume-calculator',
    title: 'Lean Body Mass (Boer, James & Hume) Calculator',
    category: 'health-fitness',
    formulaDisplay: 'Boer Male = 0.407W + 0.267H − 19.2   |   Female = 0.252W + 0.473H − 48.3',
    inputs: [
      { id: 'sex', label: 'Biological Sex', type: 'select', defaultValue: 'male', options: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }] },
      { id: 'weightKg', label: 'Weight', type: 'number', unit: 'kg', defaultValue: 82, min: 25, max: 350, step: 0.5 },
      { id: 'heightCm', label: 'Height', type: 'number', unit: 'cm', defaultValue: 180, min: 100, max: 250, step: 1 },
    ],
    calculate: (v) => {
      const m = String(v.sex || 'male') === 'male';
      const w = parseNum(v.weightKg);
      const h = parseNum(v.heightCm);
      if (Number.isNaN(w) || Number.isNaN(h) || w <= 0 || h <= 0) return calcError('Weight and height must be positive.');
      const boer = Math.min(w, Math.max(10, m ? 0.407 * w + 0.267 * h - 19.2 : 0.252 * w + 0.473 * h - 48.3));
      const hume = Math.min(w, Math.max(10, m ? 0.3281 * w + 0.33929 * h - 29.5336 : 0.29569 * w + 0.41813 * h - 43.2933));
      const estBf = Math.max(0, ((w - boer) / w) * 100);
      return {
        primaryValue: fmt(boer, 1),
        primaryUnit: 'kg LBM',
        primaryLabel: 'Boer Lean Body Mass',
        secondaryOutputs: [
          { label: 'Hume Lean Body Mass', value: `${fmt(hume, 1)} kg` },
          { label: 'Implied Anthropometric Body Fat', value: `${fmt(estBf, 1)}% (${fmt(w - boer, 1)} kg fat)` },
        ],
        steps: [`Boer LBM = ${fmt(boer, 1)} kg (${fmt((boer / w) * 100, 1)}% of ${w} kg total mass).`],
      };
    },
  },

  // 768. Daily Protein Requirements by Sport & Goal
  {
    slug: 'daily-protein-requirements-sport-calculator',
    title: 'Daily Protein Requirements by Goal & Sport Calculator',
    category: 'health-fitness',
    formulaDisplay: 'ISSN / RDA Evidence Targets (0.8 to 2.4 g/kg Body Weight)',
    inputs: [
      { id: 'weightKg', label: 'Body Weight', type: 'number', unit: 'kg', defaultValue: 75, min: 25, max: 350, step: 1 },
      {
        id: 'goal',
        label: 'Training & Nutrition Goal',
        type: 'select',
        defaultValue: '1.8',
        options: [
          { label: 'Sedentary Adult RDA Baseline (0.8 g/kg)', value: '0.8' },
          { label: 'Endurance Athlete / Running (1.4 g/kg)', value: '1.4' },
          { label: 'Hypertrophy / Strength Gain (1.8 g/kg)', value: '1.8' },
          { label: 'Caloric Deficit Muscle Retention (2.2 g/kg)', value: '2.2' },
        ],
      },
      { id: 'mealsPerDay', label: 'Daily Protein Feedings', type: 'number', defaultValue: 4, min: 1, max: 8, step: 1 },
    ],
    calculate: (v) => {
      const w = parseNum(v.weightKg);
      const mult = parseNum(v.goal || 1.8);
      const meals = Math.max(1, Math.round(parseNum(v.mealsPerDay || 4)));
      if ([w, mult, meals].some(Number.isNaN) || w <= 0 || mult <= 0) return calcError('Enter positive weight and multiplier.');
      const grams = w * mult;
      return {
        primaryValue: Math.round(grams),
        primaryUnit: 'g / day',
        primaryLabel: `Recommended Daily Protein (${mult} g/kg)`,
        secondaryOutputs: [
          { label: `Per Meal Target (${meals} meals)`, value: `${Math.round(grams / meals)} g/meal` },
          { label: 'Protein Calories (4 kcal/g)', value: `${Math.round(grams * 4)} kcal/day` },
          { label: 'Per-Pound Equivalent', value: `${fmt(mult / 2.20462, 2)} g/lb` },
        ],
        steps: [`${w} kg × ${mult} g/kg = ${Math.round(grams)} g/day (${Math.round(grams / meals)} g across ${meals} meals).`],
      };
    },
  },

  // 769. Net Carbs & Ketogenic Ratio Calculator
  {
    slug: 'net-carbs-ketogenic-ratio-calculator',
    title: 'Net Carbs & Clinical Ketogenic Ratio Calculator',
    category: 'health-fitness',
    formulaDisplay: 'Net Carbs = Total Carbs − Fiber − (Sugar Alcohols × Absorption Factor)',
    inputs: [
      { id: 'totalCarbs', label: 'Total Carbohydrates', type: 'number', unit: 'g', defaultValue: 28, min: 0, max: 1000, step: 1 },
      { id: 'fiber', label: 'Dietary Fiber', type: 'number', unit: 'g', defaultValue: 9, min: 0, max: 500, step: 1 },
      { id: 'sugarAlcohol', label: 'Sugar Alcohols (Erythritol / Maltitol)', type: 'number', unit: 'g', defaultValue: 4, min: 0, max: 500, step: 1 },
      { id: 'fatGrams', label: 'Meal / Daily Fat Grams', type: 'number', unit: 'g', defaultValue: 135, min: 0, max: 1000, step: 5 },
      { id: 'proteinGrams', label: 'Meal / Daily Protein Grams', type: 'number', unit: 'g', defaultValue: 90, min: 0, max: 1000, step: 5 },
    ],
    calculate: (v) => {
      const [tc, fib, sa, fat, prot] = [v.totalCarbs, v.fiber, v.sugarAlcohol, v.fatGrams, v.proteinGrams].map(parseNum);
      if ([tc, fib, sa, fat, prot].some(Number.isNaN) || [tc, fib, sa, fat, prot].some((x) => x < 0)) return calcError('Macronutrient grams cannot be negative.');
      const netCarbs = Math.max(0, tc - fib - sa);
      const ketoRatio = prot + netCarbs > 0 ? fat / (prot + netCarbs) : 0;
      const kcal = fat * 9 + prot * 4 + netCarbs * 4;
      const fatPct = kcal > 0 ? ((fat * 9) / kcal) * 100 : 0;
      return {
        primaryValue: fmt(netCarbs, 1),
        primaryUnit: 'g Net Carbs',
        primaryLabel: 'Digestible Net Carbohydrates',
        secondaryOutputs: [
          { label: 'Ketogenic Mass Ratio (Fat : P+NC)', value: `${fmt(ketoRatio, 2)} : 1` },
          { label: 'Total Energy (Net)', value: `${Math.round(kcal)} kcal (${fmt(fatPct, 0)}% from fat)` },
        ],
        steps: [`Net carbs = max(0, ${tc} − ${fib} − ${sa}) = ${fmt(netCarbs, 1)} g; Keto ratio = ${fmt(ketoRatio, 2)}:1.`],
      };
    },
  },

  // 770. WHO Waist-to-Hip Ratio (WHR)
  {
    slug: 'waist-to-hip-ratio-whr-calculator',
    title: 'WHO Waist-to-Hip Ratio (WHR) Cardiometabolic Risk Calculator',
    category: 'health-fitness',
    formulaDisplay: 'WHR = Waist Circumference / Hip Circumference',
    inputs: [
      { id: 'sex', label: 'Biological Sex', type: 'select', defaultValue: 'female', options: [{ label: 'Female (WHO Cutoff ≥ 0.85)', value: 'female' }, { label: 'Male (WHO Cutoff ≥ 0.90)', value: 'male' }] },
      { id: 'waist', label: 'Waist Circumference (cm or in)', type: 'number', defaultValue: 78, min: 20, max: 300, step: 0.5 },
      { id: 'hip', label: 'Hip Circumference (matching unit)', type: 'number', defaultValue: 98, min: 30, max: 300, step: 0.5 },
    ],
    calculate: (v) => {
      const female = String(v.sex || 'female') === 'female';
      const w = parseNum(v.waist);
      const h = parseNum(v.hip);
      if (Number.isNaN(w) || Number.isNaN(h) || w <= 0 || h <= 0) return calcError('Waist and hip measurements must be positive.');
      const whr = w / h;
      const cutoff = female ? 0.85 : 0.9;
      const risk = whr >= cutoff ? 'Substantially Increased Metabolic Risk (WHO Cutoff)' : whr >= cutoff - 0.05 ? 'Moderate Borderline' : 'Low Cardiometabolic Risk';
      return {
        primaryValue: fmt(whr, 3),
        primaryUnit: 'WHR',
        primaryLabel: risk,
        secondaryOutputs: [
          { label: 'WHO Threshold', value: female ? '< 0.85 (Female)' : '< 0.90 (Male)' },
          { label: 'Max Waist at Current Hip', value: fmt(h * cutoff, 1) },
        ],
        steps: [`WHR = ${w} ÷ ${h} = ${fmt(whr, 3)} vs WHO threshold ${cutoff}.`],
      };
    },
  },

  // 771. HbA1c to Estimated Average Glucose (eAG)
  {
    slug: 'a1c-to-estimated-average-glucose-calculator',
    title: 'HbA1c (%) to Estimated Average Glucose (eAG mg/dL & mmol/L) Converter',
    category: 'health-fitness',
    formulaDisplay: 'ADAG Study: eAG (mg/dL) = 28.7 × A1c − 46.7   |   mmol/L = eAG / 18.016',
    inputs: [
      { id: 'a1cPct', label: 'Hemoglobin A1c (NGSP %)', type: 'number', unit: '%', defaultValue: 6.2, min: 3.5, max: 20, step: 0.1 },
    ],
    calculate: (v) => {
      const a1c = parseNum(v.a1cPct);
      if (Number.isNaN(a1c) || a1c < 3 || a1c > 25) return calcError('Enter HbA1c between 3.0% and 25.0%.');
      const mgdl = 28.7 * a1c - 46.7;
      const mmol = mgdl / 18.016;
      const ifcc = (a1c - 2.15) * 10.929;
      const band = a1c < 5.7 ? 'Normal (< 5.7%)' : a1c < 6.5 ? 'Prediabetes Range (5.7%–6.4%)' : 'Diabetes Diagnostic Range (≥ 6.5%)';
      return {
        primaryValue: Math.round(mgdl),
        primaryUnit: 'mg/dL eAG',
        primaryLabel: band,
        secondaryOutputs: [
          { label: 'SI Average Glucose (eAG)', value: `${fmt(mmol, 1)} mmol/L` },
          { label: 'IFCC A1c Equivalent', value: `${Math.round(ifcc)} mmol/mol` },
        ],
        steps: [`28.7 × ${a1c} − 46.7 = ${Math.round(mgdl)} mg/dL (${fmt(mmol, 1)} mmol/L).`],
      };
    },
  },

  // 772. HOMA-IR & QUICKI Insulin Sensitivity
  {
    slug: 'homa-ir-insulin-resistance-calculator',
    title: 'HOMA-IR & QUICKI Insulin Resistance Calculator',
    category: 'health-fitness',
    formulaDisplay: 'HOMA-IR = (Fasting Glucose mg/dL × Fasting Insulin µU/mL) / 405',
    inputs: [
      { id: 'glucoseMgDl', label: 'Fasting Blood Glucose', type: 'number', unit: 'mg/dL', defaultValue: 94, min: 30, max: 600, step: 1 },
      { id: 'insulinMuMl', label: 'Fasting Serum Insulin', type: 'number', unit: 'µU/mL', defaultValue: 8.5, min: 0.5, max: 300, step: 0.5 },
    ],
    calculate: (v) => {
      const g = parseNum(v.glucoseMgDl);
      const ins = parseNum(v.insulinMuMl);
      if (Number.isNaN(g) || Number.isNaN(ins) || g <= 0 || ins <= 0) return calcError('Glucose and insulin must be positive.');
      const homa = (g * ins) / 405;
      const quicki = 1 / (Math.log10(ins) + Math.log10(g));
      const tier = homa < 1.0 ? 'Optimal Insulin Sensitivity (<1.0)' : homa < 2.0 ? 'Normal Range (1.0–1.9)' : homa < 2.9 ? 'Early Insulin Resistance (2.0–2.9)' : 'Significant Insulin Resistance (≥2.9)';
      return {
        primaryValue: fmt(homa, 2),
        primaryUnit: 'HOMA-IR',
        primaryLabel: tier,
        secondaryOutputs: [
          { label: 'QUICKI Sensitivity Index', value: fmt(quicki, 3) },
          { label: 'Fasting Glucose in SI', value: `${fmt(g / 18.016, 2)} mmol/L` },
        ],
        steps: [`(${g} × ${ins}) ÷ 405 = ${fmt(homa, 2)} HOMA-IR (QUICKI = ${fmt(quicki, 3)}).`],
      };
    },
  },

  // 773. Lipid Ratios (Non-HDL, TG/HDL, TC/HDL)
  {
    slug: 'cholesterol-lipid-ratios-non-hdl-calculator',
    title: 'Cholesterol Non-HDL, TG/HDL & Atherogenic Lipid Ratios Calculator',
    category: 'health-fitness',
    formulaDisplay: 'Non-HDL = Total Chol − HDL   |   Calc LDL (Martin/Friedewald) = TC − HDL − TG/5',
    inputs: [
      { id: 'totalChol', label: 'Total Cholesterol', type: 'number', unit: 'mg/dL', defaultValue: 195, min: 50, max: 1000, step: 5 },
      { id: 'hdl', label: 'HDL Cholesterol', type: 'number', unit: 'mg/dL', defaultValue: 55, min: 10, max: 200, step: 1 },
      { id: 'triglycerides', label: 'Fasting Triglycerides', type: 'number', unit: 'mg/dL', defaultValue: 110, min: 20, max: 2000, step: 5 },
    ],
    calculate: (v) => {
      const [tc, hdl, tg] = [v.totalChol, v.hdl, v.triglycerides].map(parseNum);
      if ([tc, hdl, tg].some(Number.isNaN) || tc <= 0 || hdl <= 0 || tg <= 0) return calcError('Enter positive lipid panel values.');
      const nonHdl = Math.max(0, tc - hdl);
      const friedewaldLdl = Math.max(0, tc - hdl - tg / 5);
      const tcHdlRatio = tc / hdl;
      const tgHdlRatio = tg / hdl;
      return {
        primaryValue: fmt(nonHdl, 0),
        primaryUnit: 'mg/dL',
        primaryLabel: `Non-HDL Cholesterol (${nonHdl < 130 ? 'Optimal <130' : 'Elevated ≥130'})`,
        secondaryOutputs: [
          { label: 'Friedewald Estimated LDL', value: tg < 400 ? `${fmt(friedewaldLdl, 0)} mg/dL` : 'Invalid (TG ≥ 400)' },
          { label: 'TC / HDL Ratio (Goal < 4.5)', value: fmt(tcHdlRatio, 2) },
          { label: 'TG / HDL Ratio (Metabolic Marker)', value: fmt(tgHdlRatio, 2) },
        ],
        steps: [`Non-HDL = ${tc} − ${hdl} = ${nonHdl} mg/dL; TC/HDL = ${fmt(tcHdlRatio, 2)}; TG/HDL = ${fmt(tgHdlRatio, 2)}.`],
      };
    },
  },

  // 774. MELD-Na Liver Score Calculator
  {
    slug: 'meld-na-liver-score-calculator',
    title: 'MELD-Na Liver Disease Severity Score Calculator',
    category: 'health-fitness',
    formulaDisplay: 'MELD_i = 9.57·ln(Cr) + 3.78·ln(Bili) + 11.20·ln(INR) + 6.43',
    inputs: [
      { id: 'creatinine', label: 'Serum Creatinine (1.0–4.0 mg/dL cap)', type: 'number', unit: 'mg/dL', defaultValue: 1.4, min: 0.2, max: 15, step: 0.1 },
      { id: 'bilirubin', label: 'Total Bilirubin (min 1.0 mg/dL)', type: 'number', unit: 'mg/dL', defaultValue: 2.8, min: 0.1, max: 60, step: 0.2 },
      { id: 'inr', label: 'INR (min 1.0)', type: 'number', defaultValue: 1.6, min: 0.8, max: 15, step: 0.1 },
      { id: 'sodium', label: 'Serum Sodium (125–137 mEq/L)', type: 'number', unit: 'mEq/L', defaultValue: 132, min: 100, max: 165, step: 1 },
      { id: 'dialysis', label: 'Dialysis ≥2× in Past Week?', type: 'select', defaultValue: 'no', options: [{ label: 'No', value: 'no' }, { label: 'Yes (Cr set to 4.0)', value: 'yes' }] },
    ],
    calculate: (v) => {
      const [crIn, biliIn, inrIn, naIn] = [v.creatinine, v.bilirubin, v.inr, v.sodium].map(parseNum);
      const dial = String(v.dialysis || 'no') === 'yes';
      if ([crIn, biliIn, inrIn, naIn].some(Number.isNaN) || crIn <= 0 || biliIn <= 0 || inrIn <= 0 || naIn <= 0) return calcError('Enter positive lab values.');
      const cr = dial ? 4.0 : Math.min(4.0, Math.max(1.0, crIn));
      const bili = Math.max(1.0, biliIn);
      const inr = Math.max(1.0, inrIn);
      const na = Math.min(137, Math.max(125, naIn));
      const meldRaw = Math.round(9.57 * Math.log(cr) + 3.78 * Math.log(bili) + 11.2 * Math.log(inr) + 6.43);
      const meld = Math.min(40, Math.max(6, meldRaw));
      let meldNa = meld;
      if (meld > 11) {
        meldNa = Math.round(meld + 1.32 * (137 - na) - 0.033 * meld * (137 - na));
      }
      meldNa = Math.min(40, Math.max(6, meldNa));
      return {
        primaryValue: meldNa,
        primaryUnit: 'MELD-Na points',
        primaryLabel: `MELD-Na Score (Range 6–40)`,
        secondaryOutputs: [
          { label: 'Classic MELD (Pre-Sodium)', value: meld },
          { label: '90-Day Mortality Tier (Est.)', value: meldNa < 10 ? '~1.9%' : meldNa < 20 ? '~6.0%' : meldNa < 30 ? '~19.6%' : meldNa < 40 ? '~52.6%' : '>71%' },
        ],
        steps: [`Bounded labs (Cr=${cr}, Bili=${bili}, INR=${inr}, Na=${na}) → Classic MELD = ${meld}, MELD-Na = ${meldNa}.`],
      };
    },
  },

  // 775. Serum Anion Gap & Winter's Formula
  {
    slug: 'anion-gap-delta-ratio-calculator',
    title: 'Serum Anion Gap (Albumin-Corrected) & Winter’s Formula Calculator',
    category: 'health-fitness',
    formulaDisplay: 'AG = Na − (Cl + HCO₃⁻)   |   Winter pCO₂ = 1.5(HCO₃⁻) + 8 ± 2',
    inputs: [
      { id: 'sodium', label: 'Sodium (Na⁺)', type: 'number', unit: 'mEq/L', defaultValue: 138, min: 90, max: 190, step: 1 },
      { id: 'chloride', label: 'Chloride (Cl⁻)', type: 'number', unit: 'mEq/L', defaultValue: 100, min: 60, max: 150, step: 1 },
      { id: 'bicarb', label: 'Bicarbonate (HCO₃⁻)', type: 'number', unit: 'mEq/L', defaultValue: 16, min: 2, max: 60, step: 1 },
      { id: 'albumin', label: 'Serum Albumin (Ref 4.0 g/dL)', type: 'number', unit: 'g/dL', defaultValue: 3.0, min: 0.5, max: 6.5, step: 0.2 },
    ],
    calculate: (v) => {
      const [na, cl, hco3, alb] = [v.sodium, v.chloride, v.bicarb, v.albumin].map(parseNum);
      if ([na, cl, hco3, alb].some(Number.isNaN) || na <= 0 || cl <= 0 || hco3 <= 0 || alb <= 0) return calcError('Enter positive electrolyte and albumin values.');
      const ag = na - (cl + hco3);
      const figgeCorrAg = ag + 2.5 * (4.0 - alb);
      const wintersPco2 = 1.5 * hco3 + 8;
      const deltaAg = figgeCorrAg - 12;
      const deltaHco3 = 24 - hco3;
      const deltaRatio = deltaHco3 !== 0 ? deltaAg / deltaHco3 : 0;
      return {
        primaryValue: fmt(figgeCorrAg, 1),
        primaryUnit: 'mEq/L',
        primaryLabel: 'Albumin-Corrected Anion Gap',
        secondaryOutputs: [
          { label: 'Uncorrected Anion Gap', value: `${fmt(ag, 1)} mEq/L` },
          { label: 'Winter’s Expected PaCO₂', value: `${fmt(wintersPco2 - 2, 0)}–${fmt(wintersPco2 + 2, 0)} mmHg` },
          { label: 'Delta-Delta Ratio (ΔAG / ΔHCO₃)', value: deltaHco3 > 0 ? fmt(deltaRatio, 2) : 'N/A' },
        ],
        steps: [`AG = ${na} − (${cl} + ${hco3}) = ${ag}; Corrected for Albumin ${alb} = ${fmt(figgeCorrAg, 1)} mEq/L.`],
      };
    },
  },

  // 776. Serum Osmolality & Osmolar Gap
  {
    slug: 'osmolar-gap-serum-osmolality-calculator',
    title: 'Calculated Serum Osmolality & Osmolar Gap Calculator',
    category: 'health-fitness',
    formulaDisplay: 'Calc Osm = 2·Na + Glucose/18 + BUN/2.8',
    inputs: [
      { id: 'sodium', label: 'Sodium (Na⁺)', type: 'number', unit: 'mEq/L', defaultValue: 140, min: 90, max: 190, step: 1 },
      { id: 'glucose', label: 'Glucose', type: 'number', unit: 'mg/dL', defaultValue: 108, min: 10, max: 2000, step: 5 },
      { id: 'bun', label: 'BUN', type: 'number', unit: 'mg/dL', defaultValue: 14, min: 1, max: 200, step: 1 },
      { id: 'measuredOsm', label: 'Measured Lab Osmolality (Optional)', type: 'number', unit: 'mOsm/kg', defaultValue: 294, min: 150, max: 600, step: 1 },
    ],
    calculate: (v) => {
      const [na, glu, bun, meas] = [v.sodium, v.glucose, v.bun, v.measuredOsm ?? 0].map(parseNum);
      if ([na, glu, bun, meas].some(Number.isNaN) || na <= 0 || glu <= 0 || bun <= 0) return calcError('Enter positive Na, glucose, and BUN.');
      const calcOsm = 2 * na + glu / 18 + bun / 2.8;
      const gap = meas > 0 ? meas - calcOsm : 0;
      return {
        primaryValue: fmt(calcOsm, 1),
        primaryUnit: 'mOsm/kg',
        primaryLabel: 'Calculated Serum Osmolality',
        secondaryOutputs: [
          { label: 'Osmolar Gap (Measured − Calc)', value: meas > 0 ? `${fmt(gap, 1)} mOsm/kg (${gap > 10 ? 'Elevated >10' : 'Normal ≤10'})` : 'Enter Measured' },
        ],
        steps: [`2(${na}) + ${glu}/18 + ${bun}/2.8 = ${fmt(calcOsm, 1)} mOsm/kg.`],
      };
    },
  },

  // 777. FENa Fractional Excretion of Sodium
  {
    slug: 'fena-fractional-excretion-sodium-calculator',
    title: 'Fractional Excretion of Sodium (FENa) AKI Calculator',
    category: 'health-fitness',
    formulaDisplay: 'FENa (%) = (U_Na × P_Cr) / (P_Na × U_Cr) × 100',
    inputs: [
      { id: 'uNa', label: 'Urine Sodium (U_Na)', type: 'number', unit: 'mEq/L', defaultValue: 18, min: 1, max: 500, step: 1 },
      { id: 'pNa', label: 'Serum Sodium (P_Na)', type: 'number', unit: 'mEq/L', defaultValue: 138, min: 90, max: 190, step: 1 },
      { id: 'uCr', label: 'Urine Creatinine (U_Cr)', type: 'number', unit: 'mg/dL', defaultValue: 120, min: 1, max: 1000, step: 5 },
      { id: 'pCr', label: 'Serum Creatinine (P_Cr)', type: 'number', unit: 'mg/dL', defaultValue: 2.2, min: 0.1, max: 30, step: 0.1 },
    ],
    calculate: (v) => {
      const [uNa, pNa, uCr, pCr] = [v.uNa, v.pNa, v.uCr, v.pCr].map(parseNum);
      if ([uNa, pNa, uCr, pCr].some(Number.isNaN) || [uNa, pNa, uCr, pCr].some((x) => x <= 0)) return calcError('All urine and serum concentrations must be positive.');
      const fena = ((uNa * pCr) / (pNa * uCr)) * 100;
      const interp = fena < 1 ? 'Prerenal Azotemia Suggested (< 1%)' : fena > 2 ? 'Intrinsic Renal / ATN Suggested (> 2%)' : 'Indeterminate (1%–2%)';
      return {
        primaryValue: fmt(fena, 2),
        primaryUnit: '%',
        primaryLabel: interp,
        secondaryOutputs: [{ label: 'Clinical Cutoff Note', value: 'Use FEUrea if patient recently received loop diuretics' }],
        steps: [`FENa = (${uNa} × ${pCr}) ÷ (${pNa} × ${uCr}) × 100 = ${fmt(fena, 2)}%.`],
      };
    },
  },

  // 778. Free Water Deficit in Hypernatremia
  {
    slug: 'free-water-deficit-hypernatremia-calculator',
    title: 'Hypernatremia Free Water Deficit Calculator',
    category: 'health-fitness',
    formulaDisplay: 'Water Deficit (L) = TBW × ((Current Na / Desired Na) − 1)',
    inputs: [
      { id: 'weightKg', label: 'Body Weight', type: 'number', unit: 'kg', defaultValue: 70, min: 10, max: 300, step: 1 },
      { id: 'tbwFactor', label: 'Total Body Water Fraction', type: 'select', defaultValue: '0.6', options: [{ label: 'Adult Male (0.60)', value: '0.6' }, { label: 'Adult Female / Elderly Male (0.50)', value: '0.5' }, { label: 'Elderly Female (0.45)', value: '0.45' }] },
      { id: 'currentNa', label: 'Current Serum Sodium', type: 'number', unit: 'mEq/L', defaultValue: 156, min: 140, max: 200, step: 1 },
      { id: 'desiredNa', label: 'Target Serum Sodium', type: 'number', unit: 'mEq/L', defaultValue: 140, min: 130, max: 160, step: 1 },
    ],
    calculate: (v) => {
      const [w, f, cNa, dNa] = [v.weightKg, v.tbwFactor || 0.6, v.currentNa, v.desiredNa].map(parseNum);
      if ([w, f, cNa, dNa].some(Number.isNaN) || w <= 0 || f <= 0 || cNa <= dNa || dNa <= 0) return calcError('Current Na must exceed desired Na and weights positive.');
      const tbw = w * f;
      const deficit = tbw * (cNa / dNa - 1);
      return {
        primaryValue: fmt(deficit, 2),
        primaryUnit: 'Liters',
        primaryLabel: 'Estimated Free Water Deficit',
        secondaryOutputs: [
          { label: 'Estimated Total Body Water', value: `${fmt(tbw, 1)} L` },
          { label: 'Safe Correction Rate Limit', value: '≤ 10–12 mEq/L per 24h to prevent cerebral edema' },
        ],
        steps: [`TBW = ${w}×${f} = ${fmt(tbw, 1)} L × (${cNa}/${dNa} − 1) = ${fmt(deficit, 2)} L.`],
      };
    },
  },

  // 779. Corrected QT Interval (QTc: Bazett, Fridericia, Framingham)
  {
    slug: 'qt-interval-corrected-qtc-calculator',
    title: 'QTc Interval (Bazett, Fridericia & Framingham) Calculator',
    category: 'health-fitness',
    formulaDisplay: 'Bazett: QT / √RR   |   Fridericia: QT / ∛RR   (RR = 60 / HR)',
    inputs: [
      { id: 'qtMs', label: 'Measured QT Interval', type: 'number', unit: 'ms', defaultValue: 400, min: 150, max: 900, step: 10 },
      { id: 'heartRate', label: 'Heart Rate', type: 'number', unit: 'bpm', defaultValue: 75, min: 25, max: 250, step: 1 },
    ],
    calculate: (v) => {
      const qt = parseNum(v.qtMs);
      const hr = parseNum(v.heartRate);
      if (Number.isNaN(qt) || Number.isNaN(hr) || qt <= 0 || hr <= 0) return calcError('QT and heart rate must be positive.');
      const rr = 60 / hr;
      const bazett = qt / Math.sqrt(rr);
      const fridericia = qt / Math.cbrt(rr);
      const framingham = qt + 154 * (1 - rr);
      return {
        primaryValue: Math.round(bazett),
        primaryUnit: 'ms (Bazett)',
        primaryLabel: bazett > 500 ? 'Markedly Prolonged (>500 ms)' : bazett > 460 ? 'Borderline / Prolonged' : 'Normal QTc (<460 ms)',
        secondaryOutputs: [
          { label: 'Fridericia QTc (Preferred @ HR >90)', value: `${Math.round(fridericia)} ms` },
          { label: 'Framingham Linear QTc', value: `${Math.round(framingham)} ms` },
          { label: 'RR Interval', value: `${fmt(rr, 3)} sec` },
        ],
        steps: [`RR = 60/${hr} = ${fmt(rr, 3)}s → Bazett = ${Math.round(bazett)} ms; Fridericia = ${Math.round(fridericia)} ms.`],
      };
    },
  },

  // 780. Wells Criteria DVT Score
  {
    slug: 'wells-dvt-pulmonary-embolism-calculator',
    title: 'Wells Criteria DVT Clinical Probability Score Calculator',
    category: 'health-fitness',
    formulaDisplay: 'Sum of Clinical Criteria (−2 to +9 pts) for DVT Risk Stratification',
    inputs: [
      { id: 'activeCancer', label: 'Active Cancer (tx within 6 mo / palliative)', type: 'select', defaultValue: '0', options: [{ label: 'No (0)', value: '0' }, { label: 'Yes (+1)', value: '1' }] },
      { id: 'bedriddenOrSurgery', label: 'Bedridden ≥3d or Major Surgery ≤12w', type: 'select', defaultValue: '0', options: [{ label: 'No (0)', value: '0' }, { label: 'Yes (+1)', value: '1' }] },
      { id: 'calfSwelling', label: 'Calf Swelling >3 cm vs Asymptomatic Leg', type: 'select', defaultValue: '1', options: [{ label: 'No (0)', value: '0' }, { label: 'Yes (+1)', value: '1' }] },
      { id: 'pittingEdema', label: 'Pitting Edema Confined to Symptomatic Leg', type: 'select', defaultValue: '1', options: [{ label: 'No (0)', value: '0' }, { label: 'Yes (+1)', value: '1' }] },
      { id: 'localizedTenderness', label: 'Localized Deep Venous System Tenderness', type: 'select', defaultValue: '0', options: [{ label: 'No (0)', value: '0' }, { label: 'Yes (+1)', value: '1' }] },
      { id: 'altDx', label: 'Alternative Diagnosis At Least As Likely As DVT', type: 'select', defaultValue: '0', options: [{ label: 'No (0)', value: '0' }, { label: 'Yes (−2)', value: '-2' }] },
    ],
    calculate: (v) => {
      const pts = [v.activeCancer, v.bedriddenOrSurgery, v.calfSwelling, v.pittingEdema, v.localizedTenderness, v.altDx]
        .map((x) => parseNum(x || 0))
        .reduce((a, b) => a + (Number.isNaN(b) ? 0 : b), 0);
      const tier = pts >= 3 ? 'High Probability (≥3 pts; ~53%–75% prevalence)' : pts >= 1 ? 'Moderate Probability (1–2 pts; ~17%)' : 'Low Probability (≤0 pts; ~5%)';
      return {
        primaryValue: pts,
        primaryUnit: 'Wells pts',
        primaryLabel: tier,
        secondaryOutputs: [{ label: 'Two-Tier Rule', value: pts >= 2 ? 'DVT Likely (≥2) → Compression Ultrasound' : 'DVT Unlikely (<2) → High-Sensitivity D-dimer' }],
        steps: [`Summed Wells clinical predictors = ${pts} points (${tier}).`],
      };
    },
  },

  // 781. CHA2DS2-VASc AFib Stroke Score
  {
    slug: 'cha2ds2-vasc-stroke-risk-calculator',
    title: 'CHA₂DS₂-VASc Atrial Fibrillation Stroke Risk Calculator',
    category: 'health-fitness',
    formulaDisplay: 'CHF(+1), HTN(+1), Age ≥75(+2), DM(+1), Stroke/TIA(+2), Vasc(+1), Age 65–74(+1), Sex F(+1)',
    inputs: [
      { id: 'ageGroup', label: 'Age Bracket', type: 'select', defaultValue: '1', options: [{ label: 'Under 65 (0)', value: '0' }, { label: '65–74 (+1)', value: '1' }, { label: '≥ 75 (+2)', value: '2' }] },
      { id: 'sexFemale', label: 'Sex Category', type: 'select', defaultValue: '0', options: [{ label: 'Male (0)', value: '0' }, { label: 'Female (+1)', value: '1' }] },
      { id: 'htn', label: 'Hypertension', type: 'select', defaultValue: '1', options: [{ label: 'No (0)', value: '0' }, { label: 'Yes (+1)', value: '1' }] },
      { id: 'chf', label: 'Congestive Heart Failure / LV Dysfunction', type: 'select', defaultValue: '0', options: [{ label: 'No (0)', value: '0' }, { label: 'Yes (+1)', value: '1' }] },
      { id: 'diabetes', label: 'Diabetes Mellitus', type: 'select', defaultValue: '0', options: [{ label: 'No (0)', value: '0' }, { label: 'Yes (+1)', value: '1' }] },
      { id: 'stroke', label: 'Prior Stroke / TIA / Thromboembolism', type: 'select', defaultValue: '0', options: [{ label: 'No (0)', value: '0' }, { label: 'Yes (+2)', value: '2' }] },
      { id: 'vascular', label: 'Vascular Disease (Prior MI, PAD, Aortic Plaque)', type: 'select', defaultValue: '0', options: [{ label: 'No (0)', value: '0' }, { label: 'Yes (+1)', value: '1' }] },
    ],
    calculate: (v) => {
      const score = [v.ageGroup, v.sexFemale, v.htn, v.chf, v.diabetes, v.stroke, v.vascular]
        .map((x) => parseNum(x || 0))
        .reduce((a, b) => a + (Number.isNaN(b) ? 0 : b), 0);
      const riskTable = ['0.2%', '0.6%', '2.2%', '3.2%', '4.8%', '7.2%', '9.7%', '11.2%', '10.8%', '12.2%'];
      return {
        primaryValue: score,
        primaryUnit: '/ 9 pts',
        primaryLabel: `CHA₂DS₂-VASc Score (Est. Annual Ischemic Stroke Risk ~${riskTable[Math.min(9, Math.max(0, score))]})`,
        secondaryOutputs: [{ label: 'ACC/AHA Anticoagulation Guidance Note', value: score >= 2 ? 'Oral anticoagulation generally recommended (clinician review)' : 'Low / Intermediate risk — individualized discussion' }],
        steps: [`Total CHA₂DS₂-VASc score = ${score} points (Annual untreated stroke risk ~${riskTable[Math.min(9, Math.max(0, score))]}).`],
      };
    },
  },

  // 782. Glasgow Coma Scale (GCS)
  {
    slug: 'glasgow-coma-scale-gcs-calculator',
    title: 'Glasgow Coma Scale (GCS E/V/M) Neurological Calculator',
    category: 'health-fitness',
    formulaDisplay: 'GCS = Eye (1–4) + Verbal (1–5) + Motor (1–6) [Total 3–15]',
    inputs: [
      { id: 'eye', label: 'Eye Opening (E)', type: 'select', defaultValue: '4', options: [{ label: '4 — Spontaneous', value: '4' }, { label: '3 — To Sound / Speech', value: '3' }, { label: '2 — To Pressure / Pain', value: '2' }, { label: '1 — None', value: '1' }] },
      { id: 'verbal', label: 'Verbal Response (V)', type: 'select', defaultValue: '5', options: [{ label: '5 — Oriented', value: '5' }, { label: '4 — Confused Conversation', value: '4' }, { label: '3 — Inappropriate Words', value: '3' }, { label: '2 — Incomprehensible Sounds', value: '2' }, { label: '1 — None', value: '1' }] },
      { id: 'motor', label: 'Motor Response (M)', type: 'select', defaultValue: '6', options: [{ label: '6 — Obeys Commands', value: '6' }, { label: '5 — Localizes Pain', value: '5' }, { label: '4 — Normal Flexion / Withdrawal', value: '4' }, { label: '3 — Abnormal Flexion (Decorticate)', value: '3' }, { label: '2 — Extension (Decerebrate)', value: '2' }, { label: '1 — None', value: '1' }] },
    ],
    calculate: (v) => {
      const eRaw = parseNum(v.eye);
      const vRaw = parseNum(v.verbal);
      const mRaw = parseNum(v.motor);
      if ([eRaw, vRaw, mRaw].some(Number.isNaN)) return calcError('Select valid Eye, Verbal, and Motor GCS scores.');
      const e = Math.min(4, Math.max(1, eRaw));
      const vb = Math.min(5, Math.max(1, vRaw));
      const m = Math.min(6, Math.max(1, mRaw));
      const total = e + vb + m;
      const severity = total >= 13 ? 'Mild Brain Injury / Normal (13–15)' : total >= 9 ? 'Moderate Injury (9–12)' : 'Severe Coma / Airway Alert (≤ 8)';
      return {
        primaryValue: total,
        primaryUnit: `GCS (E${e}V${vb}M${m})`,
        primaryLabel: severity,
        secondaryOutputs: [{ label: 'Component Breakdown', value: `Eye ${e}/4 · Verbal ${vb}/5 · Motor ${m}/6` }],
        steps: [`E${e} + V${vb} + M${m} = ${total}/15 (${severity}).`],
      };
    },
  },

  // 783. Smoking Pack-Years & LDCT Screening Eligibility
  {
    slug: 'pack-years-smoking-exposure-calculator',
    title: 'Smoking Pack-Years & USPSTF Screening Eligibility Calculator',
    category: 'health-fitness',
    formulaDisplay: 'Pack-Years = (Cigarettes/Day ÷ 20) × Years Smoked',
    inputs: [
      { id: 'cigsPerDay', label: 'Average Cigarettes Smoked Per Day', type: 'number', defaultValue: 20, min: 1, max: 100, step: 1 },
      { id: 'yearsSmoked', label: 'Total Years Smoked', type: 'number', unit: 'years', defaultValue: 22, min: 0.5, max: 90, step: 1 },
      { id: 'currentAge', label: 'Current Age (for USPSTF 50–80 check)', type: 'number', unit: 'yrs', defaultValue: 55, min: 18, max: 105, step: 1 },
    ],
    calculate: (v) => {
      const [cigs, yrs, age] = [v.cigsPerDay, v.yearsSmoked, v.currentAge].map(parseNum);
      if ([cigs, yrs, age].some(Number.isNaN) || cigs <= 0 || yrs <= 0 || age < 12) return calcError('Enter positive smoking rate, years, and age.');
      const packYears = (cigs / 20) * yrs;
      const meetsUspstf = packYears >= 20 && age >= 50 && age <= 80;
      return {
        primaryValue: fmt(packYears, 1),
        primaryUnit: 'pack-years',
        primaryLabel: 'Cumulative Smoking Exposure',
        secondaryOutputs: [
          { label: 'Packs Per Day Equivalent', value: fmt(cigs / 20, 2) },
          { label: 'USPSTF Annual LDCT Lung Screening Criterion', value: meetsUspstf ? 'Meets ≥20 Pack-Year & Age 50–80 Criterion' : 'Below Threshold (Confirm Quit Time ≤15y)' },
        ],
        steps: [`(${cigs} ÷ 20) × ${yrs} yrs = ${fmt(packYears, 1)} pack-years.`],
      };
    },
  },

  // 784. Body Surface Area (Mosteller, Du Bois, Haycock)
  {
    slug: 'body-surface-area-bsa-mosteller-calculator',
    title: 'Body Surface Area (Mosteller, Du Bois & Haycock BSA) Calculator',
    category: 'health-fitness',
    formulaDisplay: 'Mosteller BSA (m²) = √((Height cm × Weight kg) / 3600)',
    inputs: [
      { id: 'weightKg', label: 'Body Weight', type: 'number', unit: 'kg', defaultValue: 72, min: 2, max: 350, step: 1 },
      { id: 'heightCm', label: 'Height', type: 'number', unit: 'cm', defaultValue: 175, min: 40, max: 260, step: 1 },
    ],
    calculate: (v) => {
      const w = parseNum(v.weightKg);
      const h = parseNum(v.heightCm);
      if (Number.isNaN(w) || Number.isNaN(h) || w <= 0 || h <= 0) return calcError('Weight and height must be positive.');
      const mosteller = Math.sqrt((h * w) / 3600);
      const dubois = 0.007184 * Math.pow(w, 0.425) * Math.pow(h, 0.725);
      const haycock = 0.024265 * Math.pow(w, 0.5378) * Math.pow(h, 0.3964);
      return {
        primaryValue: fmt(mosteller, 3),
        primaryUnit: 'm² (Mosteller)',
        primaryLabel: 'Body Surface Area (BSA)',
        secondaryOutputs: [
          { label: 'Du Bois Formula', value: `${fmt(dubois, 3)} m²` },
          { label: 'Haycock Formula (Pediatric/Oncology)', value: `${fmt(haycock, 3)} m²` },
        ],
        steps: [`Mosteller = √((${h} × ${w}) ÷ 3600) = ${fmt(mosteller, 3)} m².`],
      };
    },
  },

  // 785. Powerlifting DOTS Relative Strength Score
  {
    slug: 'wilks-dots-powerlifting-score-calculator',
    title: 'Powerlifting DOTS Relative Strength Score Calculator',
    category: 'health-fitness',
    formulaDisplay: 'DOTS = Total kg × (500 / Polynomial(Bodyweight kg))',
    inputs: [
      { id: 'sex', label: 'Division', type: 'select', defaultValue: 'male', options: [{ label: 'Men’s Division', value: 'male' }, { label: 'Women’s Division', value: 'female' }] },
      { id: 'bodyweightKg', label: 'Lifter Bodyweight (40–210 kg)', type: 'number', unit: 'kg', defaultValue: 83, min: 40, max: 210, step: 0.5 },
      { id: 'totalKg', label: '3-Lift Total (Squat + Bench + Deadlift)', type: 'number', unit: 'kg', defaultValue: 620, min: 20, max: 1500, step: 5 },
    ],
    calculate: (v) => {
      const male = String(v.sex || 'male') === 'male';
      const bw = Math.min(210, Math.max(40, parseNum(v.bodyweightKg)));
      const tot = parseNum(v.totalKg);
      if (Number.isNaN(bw) || Number.isNaN(tot) || tot <= 0) return calcError('Enter positive lift total and bodyweight 40–210 kg.');
      const coeffs = male
        ? [-0.000001093, 0.0007391293, -0.1918759221, 24.0900756, -307.75076]
        : [-0.0000010706, 0.0005158568, -0.1126655495, 13.6175032, -57.96288];
      const denom = coeffs[0] * bw ** 4 + coeffs[1] * bw ** 3 + coeffs[2] * bw ** 2 + coeffs[3] * bw + coeffs[4];
      const dots = tot * (500 / denom);
      return {
        primaryValue: fmt(dots, 2),
        primaryUnit: 'DOTS pts',
        primaryLabel: `${male ? 'Men’s' : 'Women’s'} DOTS Relative Strength Score`,
        secondaryOutputs: [
          { label: 'Bodyweight Ratio (Total ÷ BW)', value: `${fmt(tot / bw, 2)}× BW` },
          { label: 'Classification Benchmark', value: dots >= 500 ? 'National / International Elite' : dots >= 400 ? 'Competitive Class 1' : 'Intermediate / Novice' },
        ],
        steps: [`Total ${tot} kg at ${bw} kg BW yields ${fmt(dots, 2)} DOTS points.`],
      };
    },
  },

  // 786. Cycling FTP Power-to-Weight & 7 Coggan Zones
  {
    slug: 'cycling-ftp-watts-per-kg-zones-calculator',
    title: 'Cycling FTP (Watts/kg) & 7 Coggan Training Zones Calculator',
    category: 'health-fitness',
    formulaDisplay: 'FTP ≈ 0.95 × 20-Min Max Power   |   W/kg = FTP / Weight kg',
    inputs: [
      { id: 'twentyMinWatts', label: '20-Minute Max Test Avg Power', type: 'number', unit: 'W', defaultValue: 280, min: 50, max: 700, step: 5 },
      { id: 'riderWeightKg', label: 'Rider Weight', type: 'number', unit: 'kg', defaultValue: 72, min: 35, max: 200, step: 0.5 },
    ],
    calculate: (v) => {
      const w20 = parseNum(v.twentyMinWatts);
      const wt = parseNum(v.riderWeightKg);
      if (Number.isNaN(w20) || Number.isNaN(wt) || w20 <= 0 || wt <= 0) return calcError('Enter positive test wattage and rider weight.');
      const ftp = Math.round(w20 * 0.95);
      const wkg = ftp / wt;
      return {
        primaryValue: ftp,
        primaryUnit: 'Watts FTP',
        primaryLabel: `Power-to-Weight: ${fmt(wkg, 2)} W/kg`,
        secondaryOutputs: [
          { label: 'Zone 2 Endurance (56–75% FTP)', value: `${Math.round(ftp * 0.56)}–${Math.round(ftp * 0.75)} W` },
          { label: 'Zone 4 Threshold (91–105% FTP)', value: `${Math.round(ftp * 0.91)}–${Math.round(ftp * 1.05)} W` },
          { label: 'Zone 5 VO₂Max (106–120% FTP)', value: `${Math.round(ftp * 1.06)}–${Math.round(ftp * 1.2)} W` },
        ],
        steps: [`FTP = 0.95 × ${w20} W = ${ftp} W (${fmt(wkg, 2)} W/kg).`],
      };
    },
  },

  // 787. Critical Swim Speed (CSS) Calculator
  {
    slug: 'swimming-css-critical-swim-speed-calculator',
    title: 'Critical Swim Speed (CSS 400m / 200m) Threshold Pace Calculator',
    category: 'health-fitness',
    formulaDisplay: 'CSS Pace (s / 100m) = (T_400m − T_200m) / 2',
    inputs: [
      { id: 't400Sec', label: '400m Time Trial Total Seconds (e.g., 6m00s = 360)', type: 'number', unit: 'sec', defaultValue: 360, min: 180, max: 1200, step: 5 },
      { id: 't200Sec', label: '200m Time Trial Total Seconds (e.g., 2m50s = 170)', type: 'number', unit: 'sec', defaultValue: 170, min: 80, max: 600, step: 2 },
    ],
    calculate: (v) => {
      const t4 = parseNum(v.t400Sec);
      const t2 = parseNum(v.t200Sec);
      if (Number.isNaN(t4) || Number.isNaN(t2) || t4 <= t2 || t2 <= 0) return calcError('400m time must strictly exceed 200m time.');
      const cssPer100 = (t4 - t2) / 2;
      const m = Math.floor(cssPer100 / 60);
      const s = Math.round(cssPer100 % 60);
      return {
        primaryValue: `${m}:${String(s).padStart(2, '0')}`,
        primaryUnit: '/ 100m',
        primaryLabel: 'Critical Swim Speed (Threshold Pace)',
        secondaryOutputs: [
          { label: 'Est. 1,500m Threshold Swim Time', value: `${Math.floor((cssPer100 * 15) / 60)}m ${Math.round((cssPer100 * 15) % 60)}s` },
          { label: 'Aerobic Speed (m/s)', value: `${fmt(100 / cssPer100, 2)} m/s` },
        ],
        steps: [`(${t4}s − ${t2}s) ÷ 2 = ${fmt(cssPer100, 1)}s/100m (${m}:${String(s).padStart(2, '0')}/100m).`],
      };
    },
  },

  // 788. Marathon & Half Marathon Split Pacing Strategy
  {
    slug: 'marathon-half-split-pace-calculator',
    title: 'Marathon & Half-Marathon Negative Split Pace Calculator',
    category: 'health-fitness',
    formulaDisplay: 'Target Pace = Finish Seconds / Distance + Negative Split Delta',
    inputs: [
      { id: 'distanceKm', label: 'Race Distance', type: 'select', defaultValue: '42.195', options: [{ label: 'Marathon (42.195 km / 26.22 mi)', value: '42.195' }, { label: 'Half Marathon (21.0975 km / 13.11 mi)', value: '21.0975' }, { label: '10K (10.0 km)', value: '10' }] },
      { id: 'goalMinutes', label: 'Goal Finish Time (Minutes, e.g., 210 = 3h30m)', type: 'number', unit: 'min', defaultValue: 210, min: 25, max: 600, step: 5 },
      { id: 'negSplitPct', label: '2nd-Half Speedup (Negative Split %)', type: 'number', unit: '%', defaultValue: 2.0, min: 0, max: 10, step: 0.5 },
    ],
    calculate: (v) => {
      const dist = parseNum(v.distanceKm || 42.195);
      const mins = parseNum(v.goalMinutes);
      const neg = parseNum(v.negSplitPct ?? 2) / 100;
      if ([dist, mins, neg].some(Number.isNaN) || dist <= 0 || mins <= 0) return calcError('Enter positive race distance and goal minutes.');
      const totalSec = mins * 60;
      const avgSecPerKm = totalSec / dist;
      const firstHalfSecKm = (avgSecPerKm * (1 + neg / 2));
      const secondHalfSecKm = (avgSecPerKm * (1 - neg / 2));
      const fmtPace = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
      return {
        primaryValue: fmtPace(avgSecPerKm),
        primaryUnit: 'min / km',
        primaryLabel: `Even Goal Pace (${fmtPace(avgSecPerKm * 1.60934)} / mi)`,
        secondaryOutputs: [
          { label: '1st Half Conservative Split', value: `${fmtPace(firstHalfSecKm)} / km` },
          { label: '2nd Half Negative Split', value: `${fmtPace(secondHalfSecKm)} / km` },
        ],
        steps: [`Avg pace ${fmtPace(avgSecPerKm)}/km → Start at ${fmtPace(firstHalfSecKm)}/km, close at ${fmtPace(secondHalfSecKm)}/km.`],
      };
    },
  },

  // 789. Karvonen Heart Rate Reserve (HRR) Zone Calculator
  {
    slug: 'karvonen-heart-rate-reserve-calculator',
    title: 'Karvonen Heart Rate Reserve (HRR) Target Zone Calculator',
    category: 'health-fitness',
    formulaDisplay: 'Target HR = ((HR_max − HR_rest) × Intensity%) + HR_rest',
    inputs: [
      { id: 'age', label: 'Age (used if HRmax blank/0)', type: 'number', unit: 'yrs', defaultValue: 35, min: 12, max: 100, step: 1 },
      { id: 'restingHr', label: 'Resting Heart Rate (HR_rest)', type: 'number', unit: 'bpm', defaultValue: 58, min: 30, max: 120, step: 1 },
      { id: 'intensityPct', label: 'Target Exercise Intensity %', type: 'number', unit: '%', defaultValue: 75, min: 40, max: 100, step: 5 },
    ],
    calculate: (v) => {
      const [age, rhr, inten] = [v.age, v.restingHr, v.intensityPct].map(parseNum);
      if ([age, rhr, inten].some(Number.isNaN) || age <= 0 || rhr <= 0 || inten <= 0) return calcError('Enter positive age, resting HR, and intensity.');
      const hrMax = 208 - 0.7 * age; // Tanaka equation
      if (hrMax <= rhr) return calcError('Max HR must exceed resting HR.');
      const hrr = hrMax - rhr;
      const target = hrr * (inten / 100) + rhr;
      return {
        primaryValue: Math.round(target),
        primaryUnit: 'bpm',
        primaryLabel: `Karvonen Target Heart Rate (@ ${inten}% HRR)`,
        secondaryOutputs: [
          { label: 'Tanaka Estimated HR_max', value: `${Math.round(hrMax)} bpm` },
          { label: 'Heart Rate Reserve (HRR)', value: `${Math.round(hrr)} bpm` },
          { label: 'Zone 2 Aerobic Band (60–70%)', value: `${Math.round(hrr * 0.6 + rhr)}–${Math.round(hrr * 0.7 + rhr)} bpm` },
        ],
        steps: [`HR_max = 208 − 0.7×${age} = ${Math.round(hrMax)} bpm; Target = (${Math.round(hrr)} × ${inten}%) + ${rhr} = ${Math.round(target)} bpm.`],
      };
    },
  },

  // 790. Daily Steps to Distance & Active Calories
  {
    slug: 'step-count-calories-distance-calculator',
    title: 'Daily Steps to Distance & Calories Burned Calculator',
    category: 'health-fitness',
    formulaDisplay: 'Stride ≈ Height × 0.414   |   Kcal ≈ 0.04 × Weight_kg/70 × Steps',
    inputs: [
      { id: 'steps', label: 'Daily Step Count', type: 'number', defaultValue: 10000, min: 100, max: 150000, step: 500 },
      { id: 'heightCm', label: 'Height', type: 'number', unit: 'cm', defaultValue: 175, min: 100, max: 240, step: 1 },
      { id: 'weightKg', label: 'Weight', type: 'number', unit: 'kg', defaultValue: 75, min: 30, max: 300, step: 1 },
    ],
    calculate: (v) => {
      const [steps, h, w] = [v.steps, v.heightCm, v.weightKg].map(parseNum);
      if ([steps, h, w].some(Number.isNaN) || steps <= 0 || h <= 0 || w <= 0) return calcError('Steps, height, and weight must be positive.');
      const strideM = (h / 100) * 0.414;
      const distKm = (steps * strideM) / 1000;
      const distMi = distKm * 0.621371;
      const kcal = distKm * w * 0.65; // ~0.65 kcal/kg/km walking net
      return {
        primaryValue: fmt(distKm, 2),
        primaryUnit: 'km',
        primaryLabel: `Distance Walked (${fmt(distMi, 2)} miles)`,
        secondaryOutputs: [
          { label: 'Est. Walking Active Calories', value: `${Math.round(kcal)} kcal` },
          { label: 'Estimated Stride Length', value: `${fmt(strideM * 100, 1)} cm` },
        ],
        steps: [`Stride = ${fmt(strideM, 3)} m × ${steps.toLocaleString()} steps = ${fmt(distKm, 2)} km (~${Math.round(kcal)} kcal).`],
      };
    },
  },

  // 791. MET Activity Calorie Burn Calculator
  {
    slug: 'met-activity-calorie-burn-calculator',
    title: 'Exercise Calorie Burn by Compendium MET Value Calculator',
    category: 'health-fitness',
    formulaDisplay: 'Calories = (MET × 3.5 × Weight_kg / 200) × Minutes',
    inputs: [
      {
        id: 'metValue',
        label: 'Activity MET Intensity',
        type: 'select',
        defaultValue: '8.0',
        options: [
          { label: 'Brisk Walking 3.5 mph (4.3 MET)', value: '4.3' },
          { label: 'Moderate Cycling 12–14 mph (8.0 MET)', value: '8.0' },
          { label: 'Running 6 mph / 10:00 mi (9.8 MET)', value: '9.8' },
          { label: 'Lap Swimming Vigorous (9.8 MET)', value: '9.81' },
          { label: 'Heavy Weightlifting / HIIT (6.0 MET)', value: '6.0' },
        ],
      },
      { id: 'weightKg', label: 'Body Weight', type: 'number', unit: 'kg', defaultValue: 75, min: 25, max: 300, step: 1 },
      { id: 'minutes', label: 'Duration', type: 'number', unit: 'min', defaultValue: 45, min: 1, max: 720, step: 5 },
    ],
    calculate: (v) => {
      const met = parseNum(v.metValue || 8.0);
      const w = parseNum(v.weightKg);
      const mins = parseNum(v.minutes);
      if ([met, w, mins].some(Number.isNaN) || met <= 0 || w <= 0 || mins <= 0) return calcError('MET, weight, and minutes must be positive.');
      const kcalPerMin = (met * 3.5 * w) / 200;
      const totalKcal = kcalPerMin * mins;
      return {
        primaryValue: Math.round(totalKcal),
        primaryUnit: 'kcal',
        primaryLabel: `Gross Calories Burned (${mins} min)`,
        secondaryOutputs: [
          { label: 'Burn Rate', value: `${fmt(kcalPerMin, 1)} kcal/min` },
        ],
        steps: [`(${fmt(met, 1)} × 3.5 × ${w} ÷ 200) × ${mins} = ${Math.round(totalKcal)} kcal.`],
      };
    },
  },

  // 792. Caffeine Pharmacokinetic Half-Life Calculator
  {
    slug: 'caffeine-half-life-clearance-calculator',
    title: 'Caffeine Half-Life (5h) & Bedtime Clearance Calculator',
    category: 'health-fitness',
    formulaDisplay: 'C(t) = Dose × (0.5)^(t / t_half)',
    inputs: [
      { id: 'doseMg', label: 'Caffeine Consumed (1 shot espresso ≈ 63 mg; coffee ≈ 95 mg)', type: 'number', unit: 'mg', defaultValue: 200, min: 5, max: 1500, step: 25 },
      { id: 'hoursElapsed', label: 'Hours Between Intake and Bedtime', type: 'number', unit: 'hrs', defaultValue: 8, min: 0, max: 48, step: 1 },
      { id: 'halfLifeHrs', label: 'Individual Half-Life (Avg Adult = 5.0h)', type: 'number', unit: 'hrs', defaultValue: 5.0, min: 1.5, max: 12, step: 0.5 },
    ],
    calculate: (v) => {
      const [dose, hrs, hl] = [v.doseMg, v.hoursElapsed, v.halfLifeHrs].map(parseNum);
      if ([dose, hrs, hl].some(Number.isNaN) || dose <= 0 || hrs < 0 || hl <= 0) return calcError('Dose and half-life must be positive.');
      const remMg = dose * Math.pow(0.5, hrs / hl);
      const hrsTo25Mg = dose > 25 ? hl * Math.log2(dose / 25) : 0;
      return {
        primaryValue: fmt(remMg, 1),
        primaryUnit: 'mg active',
        primaryLabel: `Caffeine Remaining After ${hrs} Hours`,
        secondaryOutputs: [
          { label: 'Hours Until < 25 mg Threshold', value: `${fmt(hrsTo25Mg, 1)} hrs` },
          { label: '% Cleared', value: `${fmt((1 - remMg / dose) * 100, 1)}%` },
        ],
        steps: [`${dose} mg × (0.5)^(${hrs}/${hl}) = ${fmt(remMg, 1)} mg active at bedtime.`],
      };
    },
  },

  // 793. Creatine Monohydrate Loading & Maintenance
  {
    slug: 'creatine-loading-maintenance-dosage-calculator',
    title: 'Creatine Monohydrate Loading & Maintenance Dose Calculator',
    category: 'health-fitness',
    formulaDisplay: 'Loading (5–7d) = 0.3 g/kg/day   |   Maintenance = 0.03–0.05 g/kg/day',
    inputs: [
      { id: 'weightKg', label: 'Body Weight', type: 'number', unit: 'kg', defaultValue: 80, min: 35, max: 250, step: 1 },
    ],
    calculate: (v) => {
      const w = parseNum(v.weightKg);
      if (Number.isNaN(w) || w <= 0) return calcError('Weight must be positive.');
      const loadingDay = w * 0.3;
      const maintLow = Math.max(3, w * 0.03);
      const maintSport = Math.max(5, w * 0.05);
      return {
        primaryValue: fmt(maintSport, 1),
        primaryUnit: 'g / day',
        primaryLabel: 'Daily Saturation Maintenance Dose',
        secondaryOutputs: [
          { label: 'Optional 5–7 Day Loading Protocol', value: `${fmt(loadingDay, 1)} g/day (split 4 doses)` },
          { label: 'Minimum Clinical Maintenance', value: `${fmt(maintLow, 1)} g/day` },
        ],
        steps: [`ISSN standard: 0.3 g/kg loading (${fmt(loadingDay, 1)} g/d) or steady ${fmt(maintSport, 1)} g/day daily.`],
      };
    },
  },

  // 794. Ergogenic Sport Caffeine Dosage (3-6 mg/kg)
  {
    slug: 'caffeine-ergogenic-sport-dose-calculator',
    title: 'ISSN Athletic Caffeine Performance Dose (3–6 mg/kg) Calculator',
    category: 'health-fitness',
    formulaDisplay: 'Ergogenic Window = 3 to 6 mg/kg taken 45–60 Min Pre-Event (FDA Safe Daily Cap 400 mg)',
    inputs: [
      { id: 'weightKg', label: 'Athlete Weight', type: 'number', unit: 'kg', defaultValue: 70, min: 30, max: 200, step: 1 },
      { id: 'doseMgPerKg', label: 'Target Dose (3–6 mg/kg)', type: 'number', unit: 'mg/kg', defaultValue: 3.0, min: 1, max: 9, step: 0.5 },
    ],
    calculate: (v) => {
      const w = parseNum(v.weightKg);
      const d = parseNum(v.doseMgPerKg);
      if (Number.isNaN(w) || Number.isNaN(d) || w <= 0 || d <= 0) return calcError('Enter positive weight and dose.');
      const totalMg = w * d;
      const overFda = totalMg > 400;
      return {
        primaryValue: Math.round(totalMg),
        primaryUnit: 'mg caffeine',
        primaryLabel: overFda ? 'Exceeds 400 mg FDA General Daily Adult Limit' : 'Pre-Exercise Performance Dose',
        secondaryOutputs: [
          { label: 'ISSN Optimal Band (3–6 mg/kg)', value: `${Math.round(w * 3)}–${Math.round(w * 6)} mg` },
          { label: 'Equivalent Espresso Shots (~63mg)', value: fmt(totalMg / 63, 1) },
        ],
        steps: [`${w} kg × ${d} mg/kg = ${Math.round(totalMg)} mg 45–60 min pre-workout.`],
      };
    },
  },

  // 795. IOM/NAM Pregnancy Weight Gain Calculator
  {
    slug: 'pregnancy-weight-gain-iom-calculator',
    title: 'IOM/NAM Pregnancy Weight Gain Guidelines Calculator',
    category: 'health-fitness',
    formulaDisplay: '2009/2026 IOM Pre-Pregnancy BMI Stratified Target Bands',
    inputs: [
      { id: 'preBmi', label: 'Pre-Pregnancy BMI (kg/m²)', type: 'number', unit: 'kg/m²', defaultValue: 22.5, min: 12, max: 60, step: 0.5 },
      { id: 'gestWeeks', label: 'Current Gestational Week (1–42)', type: 'number', unit: 'weeks', defaultValue: 24, min: 1, max: 42, step: 1 },
    ],
    calculate: (v) => {
      const bmi = parseNum(v.preBmi);
      const wk = Math.round(parseNum(v.gestWeeks));
      if (Number.isNaN(bmi) || Number.isNaN(wk) || bmi <= 0 || wk < 1 || wk > 42) return calcError('Enter positive BMI and week 1–42.');
      const [loTot, hiTot, loWk, hiWk, cat] =
        bmi < 18.5
          ? [12.5, 18.0, 0.44, 0.58, 'Underweight (<18.5)']
          : bmi < 25
          ? [11.5, 16.0, 0.35, 0.5, 'Normal Weight (18.5–24.9)']
          : bmi < 30
          ? [7.0, 11.5, 0.23, 0.33, 'Overweight (25.0–29.9)']
          : [5.0, 9.0, 0.17, 0.27, 'Obesity (≥30.0)'];
      const tri1Lo = 0.5, tri1Hi = 2.0;
      const extraWks = Math.max(0, wk - 13);
      const curLo = wk <= 13 ? (tri1Lo * wk) / 13 : tri1Lo + extraWks * loWk;
      const curHi = wk <= 13 ? (tri1Hi * wk) / 13 : tri1Hi + extraWks * hiWk;
      return {
        primaryValue: `${loTot}–${hiTot} kg`,
        primaryUnit: `(${Math.round(loTot * 2.20462)}–${Math.round(hiTot * 2.20462)} lb)`,
        primaryLabel: `Full-Term Target Gain · ${cat}`,
        secondaryOutputs: [
          { label: `Expected Gain by Week ${wk}`, value: `${fmt(curLo, 1)}–${fmt(curHi, 1)} kg` },
          { label: '2nd/3rd Trimester Weekly Rate', value: `${loWk}–${hiWk} kg/wk` },
        ],
        steps: [`Pre-BMI ${bmi} (${cat}) recommends ${loTot}–${hiTot} kg total singleton pregnancy gain.`],
      };
    },
  },

  // 796. IVF & Embryo Transfer Due Date Calculator
  {
    slug: 'ivf-fet-due-date-gestational-age-calculator',
    title: 'IVF & FET Embryo Transfer Due Date Calculator',
    category: 'health-fitness',
    formulaDisplay: 'EDD = Transfer Date + (266 days − Embryo Age Days)',
    inputs: [
      { id: 'transferDate', label: 'Embryo Transfer Date', type: 'date', defaultValue: '2026-06-01' },
      { id: 'embryoDays', label: 'Embryo Stage at Transfer', type: 'select', defaultValue: '5', options: [{ label: 'Day-5 / Day-6 Blastocyst (subtract 5d)', value: '5' }, { label: 'Day-3 Cleavage Embryo (subtract 3d)', value: '3' }] },
    ],
    calculate: (v) => {
      const td = parseLocalDate(v.transferDate);
      const embDays = parseNum(v.embryoDays || 5);
      if (!td || Number.isNaN(embDays)) return calcError('Enter valid transfer date.');
      const edd = addDaysIso(td, 266 - embDays);
      return {
        primaryValue: edd,
        primaryUnit: 'Estimated Due Date',
        primaryLabel: `IVF Day-${embDays} Transfer EDD`,
        secondaryOutputs: [
          { label: 'Equivalent LMP Date (280d rule)', value: addDaysIso(td, -(14 + embDays)) },
          { label: '12-Week Nuchal Scan Milestone', value: addDaysIso(td, 84 - (14 + embDays)) },
        ],
        steps: [`${addDaysIso(td, 0)} + (266 − ${embDays}) days = ${edd}.`],
      };
    },
  },

  // 797. Infant Ponderal Index
  {
    slug: 'baby-growth-ponderal-index-calculator',
    title: 'Newborn Ponderal Index & Proportionality Calculator',
    category: 'health-fitness',
    formulaDisplay: 'PI (g/cm³×100) = (Birth Weight g × 100) / Length_cm³',
    inputs: [
      { id: 'weightGrams', label: 'Infant Birth Weight', type: 'number', unit: 'g', defaultValue: 3400, min: 400, max: 8000, step: 50 },
      { id: 'lengthCm', label: 'Crown-Heel Length', type: 'number', unit: 'cm', defaultValue: 50, min: 25, max: 75, step: 0.5 },
    ],
    calculate: (v) => {
      const [w, l] = [v.weightGrams, v.lengthCm].map(parseNum);
      if (Number.isNaN(w) || Number.isNaN(l) || w <= 0 || l <= 0) return calcError('Weight and length must be positive.');
      const pi = (w * 100) / Math.pow(l, 3);
      const status = pi < 2.25 ? 'Asymmetric / Thin (<2.25)' : pi <= 3.0 ? 'Proportionate Term Newborn (2.25–3.0)' : 'Elevated Proportionality (>3.0)';
      return {
        primaryValue: fmt(pi, 2),
        primaryUnit: 'g/cm³ × 100',
        primaryLabel: status,
        secondaryOutputs: [{ label: 'Weight in Pounds / Ounces', value: `${Math.floor(w / 453.592)} lb ${fmt((w % 453.592) / 28.3495, 1)} oz` }],
        steps: [`PI = (${w} × 100) ÷ ${l}³ = ${fmt(pi, 2)}.`],
      };
    },
  },

  // 798. Calorie Zig-Zag Cycling Planner
  {
    slug: 'calorie-zig-zag-refeed-planner-calculator',
    title: 'Weekly Calorie Cycling (Training & Rest Day Zig-Zag) Calculator',
    category: 'health-fitness',
    formulaDisplay: 'Weekly Budget = Target Daily × 7 = (High Days × H) + (Low Days × L)',
    inputs: [
      { id: 'targetDailyAvg', label: 'Target Average Daily Calories', type: 'number', unit: 'kcal', defaultValue: 2200, min: 800, max: 8000, step: 50 },
      { id: 'highDays', label: 'High-Calorie Training / Refeed Days / Wk', type: 'number', defaultValue: 2, min: 1, max: 6, step: 1 },
      { id: 'highSurplusPct', label: 'High Day Calorie Boost vs Avg', type: 'number', unit: '%', defaultValue: 20, min: 5, max: 60, step: 5 },
    ],
    calculate: (v) => {
      const [avg, hd, boost] = [v.targetDailyAvg, v.highDays, v.highSurplusPct].map(parseNum);
      if ([avg, hd, boost].some(Number.isNaN) || avg <= 0 || hd < 1 || hd > 6 || boost < 0) return calcError('Enter positive daily calories and 1–6 high days.');
      const weekly = avg * 7;
      const highKcal = avg * (1 + boost / 100);
      const lowDays = 7 - hd;
      const lowKcal = (weekly - hd * highKcal) / lowDays;
      return {
        primaryValue: Math.round(lowKcal),
        primaryUnit: 'kcal (Low Day)',
        primaryLabel: `${lowDays} Low Days & ${hd} High Days (${Math.round(highKcal)} kcal)`,
        secondaryOutputs: [
          { label: 'Total Weekly Calorie Budget', value: `${weekly.toLocaleString()} kcal/wk` },
          { label: 'High Refeed Day Calories', value: `${Math.round(highKcal)} kcal/day` },
        ],
        steps: [`Weekly=${weekly} kcal → ${hd}×${Math.round(highKcal)} + ${lowDays}×${Math.round(lowKcal)}.`],
      };
    },
  },

  // 799. Intermittent Fasting Schedule Window
  {
    slug: 'intermittent-fasting-eating-window-calculator',
    title: 'Intermittent Fasting (16:8, 18:6, 20:4) Eating Window Calculator',
    category: 'health-fitness',
    formulaDisplay: 'Eating Close = First Meal + (24 − Fast Hours)',
    inputs: [
      { id: 'protocolFast', label: 'Fasting Protocol', type: 'select', defaultValue: '16', options: [{ label: '16:8 LeanGains (16h fast)', value: '16' }, { label: '18:6 Metabolic (18h fast)', value: '18' }, { label: '20:4 Warrior (20h fast)', value: '20' }, { label: '14:10 Gentle (14h fast)', value: '14' }] },
      { id: 'firstMealTime', label: 'First Meal Time (HH:MM)', type: 'time', defaultValue: '12:00' },
    ],
    calculate: (v) => {
      const fastHrs = parseNum(v.protocolFast || 16);
      const m = String(v.firstMealTime || '12:00').match(/^(\d{1,2}):(\d{2})$/);
      if (Number.isNaN(fastHrs) || !m) return calcError('Enter valid protocol and HH:MM start time.');
      const eatHrs = 24 - fastHrs;
      const startMin = Number(m[1]) * 60 + Number(m[2]);
      const closeMin = (startMin + eatHrs * 60) % 1440;
      const closeStr = `${String(Math.floor(closeMin / 60)).padStart(2, '0')}:${String(closeMin % 60).padStart(2, '0')}`;
      return {
        primaryValue: closeStr,
        primaryUnit: `${eatHrs}h eating window`,
        primaryLabel: 'Last Bite / Fast Begins At',
        secondaryOutputs: [{ label: 'Active Fasting Duration', value: `${fastHrs} hours daily` }],
        steps: [`Start eating at ${v.firstMealTime} + ${eatHrs}h window → Fast begins at ${closeStr}.`],
      };
    },
  },

  // 800. Normalized FFMI (Fat-Free Mass Index)
  {
    slug: 'ffmi-fat-free-mass-index-calculator',
    title: 'Normalized Fat-Free Mass Index (FFMI) Muscle Potential Calculator',
    category: 'health-fitness',
    formulaDisplay: 'FFMI = LBM_kg / H_m²   |   Norm FFMI = FFMI + 6.1 × (1.80 − H_m)',
    inputs: [
      { id: 'weightKg', label: 'Body Weight', type: 'number', unit: 'kg', defaultValue: 80, min: 30, max: 250, step: 1 },
      { id: 'heightCm', label: 'Height', type: 'number', unit: 'cm', defaultValue: 180, min: 120, max: 240, step: 1 },
      { id: 'bodyFatPct', label: 'Body Fat %', type: 'number', unit: '%', defaultValue: 12, min: 3, max: 60, step: 0.5 },
    ],
    calculate: (v) => {
      const [w, hCm, bf] = [v.weightKg, v.heightCm, v.bodyFatPct].map(parseNum);
      if ([w, hCm, bf].some(Number.isNaN) || w <= 0 || hCm <= 0 || bf < 0 || bf >= 70) return calcError('Enter positive weight, height, and valid body fat %.');
      const lbm = w * (1 - bf / 100);
      const hm = hCm / 100;
      const ffmi = lbm / (hm * hm);
      const normFfmi = ffmi + 6.1 * (1.8 - hm);
      const tier = normFfmi > 25 ? 'Above Typical Natural Limit (~25)' : normFfmi >= 22 ? 'Highly Muscular / Advanced Lifter' : normFfmi >= 19 ? 'Fit / Athletic' : 'Average';
      return {
        primaryValue: fmt(normFfmi, 2),
        primaryUnit: 'kg/m² norm FFMI',
        primaryLabel: tier,
        secondaryOutputs: [
          { label: 'Unadjusted FFMI', value: `${fmt(ffmi, 2)} kg/m²` },
          { label: 'Fat-Free Mass (LBM)', value: `${fmt(lbm, 1)} kg` },
        ],
        steps: [`LBM=${fmt(lbm, 1)} kg ÷ ${fmt(hm * hm, 3)} m² = ${fmt(ffmi, 2)} (Normalized = ${fmt(normFfmi, 2)}).`],
      };
    },
  },

  // 801. Anthropometric Frame Size & Ponderal Index
  {
    slug: 'navy-tape-waist-neck-trend-calculator',
    title: 'Body Frame Size (Wrist Ratio) & Adult Ponderal Index Calculator',
    category: 'health-fitness',
    formulaDisplay: 'r = Height_cm / Wrist_cm   |   Adult Rohrer PI = Weight_kg / Height_m³',
    inputs: [
      { id: 'sex', label: 'Biological Sex', type: 'select', defaultValue: 'male', options: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }] },
      { id: 'heightCm', label: 'Height', type: 'number', unit: 'cm', defaultValue: 178, min: 100, max: 240, step: 1 },
      { id: 'wristCm', label: 'Wrist Circumference', type: 'number', unit: 'cm', defaultValue: 17.5, min: 10, max: 30, step: 0.25 },
      { id: 'weightKg', label: 'Body Weight', type: 'number', unit: 'kg', defaultValue: 76, min: 30, max: 300, step: 1 },
    ],
    calculate: (v) => {
      const male = String(v.sex || 'male') === 'male';
      const [h, wr, w] = [v.heightCm, v.wristCm, v.weightKg].map(parseNum);
      if ([h, wr, w].some(Number.isNaN) || h <= 0 || wr <= 0 || w <= 0) return calcError('Enter positive height, wrist, and weight.');
      const r = h / wr;
      const frame = male ? (r > 10.4 ? 'Small Frame' : r >= 9.6 ? 'Medium Frame' : 'Large Frame') : (r > 11.0 ? 'Small Frame' : r >= 10.1 ? 'Medium Frame' : 'Large Frame');
      const pi = w / Math.pow(h / 100, 3);
      return {
        primaryValue: frame,
        primaryUnit: `r = ${fmt(r, 2)}`,
        primaryLabel: 'Skeletal Body Frame Classification',
        secondaryOutputs: [{ label: 'Rohrer Adult Ponderal Index (11–14 norm)', value: `${fmt(pi, 2)} kg/m³` }],
        steps: [`Height/Wrist r = ${h}/${wr} = ${fmt(r, 2)} → ${frame}; Ponderal Index = ${fmt(pi, 2)}.`],
      };
    },
  },

  // 802. Endurance Sweat Rate & Electrolyte Replacement
  {
    slug: 'sodium-potassium-electrolyte-sweat-calculator',
    title: 'Endurance Sweat Rate & Hourly Sodium/Fluid Calculator',
    category: 'health-fitness',
    formulaDisplay: 'Sweat Rate (L/hr) = [(PreWt − PostWt) + Fluid_L − Urine_L] / Hours',
    inputs: [
      { id: 'preWeightKg', label: 'Pre-Workout Nude Weight', type: 'number', unit: 'kg', defaultValue: 72.0, min: 30, max: 200, step: 0.2 },
      { id: 'postWeightKg', label: 'Post-Workout Nude Weight', type: 'number', unit: 'kg', defaultValue: 71.0, min: 30, max: 200, step: 0.2 },
      { id: 'fluidConsumedL', label: 'Fluids Drunk During Exercise', type: 'number', unit: 'L', defaultValue: 0.5, min: 0, max: 10, step: 0.1 },
      { id: 'durationHours', label: 'Exercise Duration', type: 'number', unit: 'hrs', defaultValue: 1.5, min: 0.25, max: 24, step: 0.25 },
      { id: 'sweatSodiumMgL', label: 'Sweat Sodium Concentration (Avg ~900 mg/L)', type: 'number', unit: 'mg/L', defaultValue: 900, min: 200, max: 2500, step: 50 },
    ],
    calculate: (v) => {
      const [pre, post, fluid, hrs, naConc] = [v.preWeightKg, v.postWeightKg, v.fluidConsumedL, v.durationHours, v.sweatSodiumMgL].map(parseNum);
      if ([pre, post, fluid, hrs, naConc].some(Number.isNaN) || hrs <= 0 || pre <= 0 || post <= 0) return calcError('Enter positive weights and duration.');
      const totalLossL = Math.max(0, (pre - post) + fluid);
      const sweatRate = totalLossL / hrs;
      const naPerHr = sweatRate * naConc;
      const dehydPct = ((pre - post) / pre) * 100;
      return {
        primaryValue: fmt(sweatRate, 2),
        primaryUnit: 'L / hr',
        primaryLabel: 'Hourly Sweat Rate',
        secondaryOutputs: [
          { label: 'Hourly Sweat Sodium Loss', value: `${Math.round(naPerHr)} mg Na⁺/hr` },
          { label: 'Body Mass Dehydration %', value: `${fmt(dehydPct, 2)}%` },
          { label: 'Target Hourly Fluid Replacement (~75%)', value: `${Math.round(sweatRate * 750)} mL/hr` },
        ],
        steps: [`Total loss = (${pre} − ${post}) + ${fluid} = ${fmt(totalLossL, 2)} L ÷ ${hrs}h = ${fmt(sweatRate, 2)} L/hr.`],
      };
    },
  },

  // 803. Nadler Estimated Total Blood Volume (EBV) & Allowable Loss
  {
    slug: 'blood-volume-nadler-ebv-calculator',
    title: 'Nadler Total Blood Volume (EBV) & Allowable Blood Loss Calculator',
    category: 'health-fitness',
    formulaDisplay: 'Male EBV = 0.3669·H³ + 0.03219·W + 0.6041   |   Female = 0.3561·H³ + 0.03308·W + 0.1833',
    inputs: [
      { id: 'sex', label: 'Biological Sex', type: 'select', defaultValue: 'male', options: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }] },
      { id: 'heightCm', label: 'Height', type: 'number', unit: 'cm', defaultValue: 175, min: 100, max: 240, step: 1 },
      { id: 'weightKg', label: 'Weight', type: 'number', unit: 'kg', defaultValue: 75, min: 25, max: 250, step: 1 },
      { id: 'hctInitial', label: 'Starting Hematocrit (%)', type: 'number', unit: '%', defaultValue: 42, min: 20, max: 65, step: 1 },
      { id: 'hctTarget', label: 'Min Allowable Hematocrit (%)', type: 'number', unit: '%', defaultValue: 30, min: 15, max: 50, step: 1 },
    ],
    calculate: (v) => {
      const male = String(v.sex || 'male') === 'male';
      const [hCm, w, hi, hf] = [v.heightCm, v.weightKg, v.hctInitial, v.hctTarget].map(parseNum);
      if ([hCm, w, hi, hf].some(Number.isNaN) || hCm <= 0 || w <= 0 || hi <= hf || hf <= 0) return calcError('Height/weight positive and initial Hct > min Hct.');
      const hm = hCm / 100;
      const ebvL = male ? 0.3669 * hm ** 3 + 0.03219 * w + 0.6041 : 0.3561 * hm ** 3 + 0.03308 * w + 0.1833;
      const ablMl = (ebvL * 1000 * (hi - hf)) / ((hi + hf) / 2); // Gross formula
      return {
        primaryValue: fmt(ebvL, 2),
        primaryUnit: 'Liters',
        primaryLabel: 'Nadler Estimated Total Blood Volume',
        secondaryOutputs: [{ label: 'Max Allowable Surgical Blood Loss (ABL)', value: `${Math.round(ablMl)} mL` }],
        steps: [`Nadler EBV = ${fmt(ebvL, 2)} L; ABL (Hct ${hi}%→${hf}%) ≈ ${Math.round(ablMl)} mL.`],
      };
    },
  },

  // 804. Reticulocyte Production Index (RPI)
  {
    slug: 'reticulocyte-production-index-rpi-calculator',
    title: 'Reticulocyte Production Index (RPI) Anemia Calculator',
    category: 'health-fitness',
    formulaDisplay: 'RPI = (Retic% × (Patient Hct / 45)) / Maturation Factor',
    inputs: [
      { id: 'reticPct', label: 'Measured Reticulocyte %', type: 'number', unit: '%', defaultValue: 4.5, min: 0.1, max: 40, step: 0.2 },
      { id: 'patientHct', label: 'Patient Hematocrit %', type: 'number', unit: '%', defaultValue: 25, min: 10, max: 60, step: 1 },
    ],
    calculate: (v) => {
      const ret = parseNum(v.reticPct);
      const hct = parseNum(v.patientHct);
      if (Number.isNaN(ret) || Number.isNaN(hct) || ret <= 0 || hct <= 0) return calcError('Enter positive reticulocyte % and hematocrit.');
      const corrRetic = ret * (hct / 45);
      const matFactor = hct >= 40 ? 1.0 : hct >= 30 ? 1.5 : hct >= 20 ? 2.0 : 2.5;
      const rpi = corrRetic / matFactor;
      return {
        primaryValue: fmt(rpi, 2),
        primaryUnit: 'RPI',
        primaryLabel: rpi >= 2 ? 'Adequate Marrow Erythropoietic Response (≥ 2.0)' : 'Inadequate / Hypoproliferative Response (< 2.0)',
        secondaryOutputs: [
          { label: 'Corrected Reticulocyte Count', value: `${fmt(corrRetic, 2)}%` },
          { label: 'Marrow Shift Maturation Factor', value: `${matFactor} days` },
        ],
        steps: [`Corrected = ${ret}% × (${hct}/45) = ${fmt(corrRetic, 2)}% ÷ ${matFactor} = ${fmt(rpi, 2)} RPI.`],
      };
    },
  },

  // 805. CURB-65 Pneumonia Severity Score
  {
    slug: 'curb-65-pneumonia-severity-calculator',
    title: 'CURB-65 Community-Acquired Pneumonia Severity Calculator',
    category: 'health-fitness',
    formulaDisplay: 'Confusion(+1) + BUN >19 mg/dL(+1) + RR ≥30(+1) + BP <90/≤60(+1) + Age ≥65(+1)',
    inputs: [
      { id: 'confusion', label: 'New-Onset Confusion', type: 'select', defaultValue: '0', options: [{ label: 'No (0)', value: '0' }, { label: 'Yes (+1)', value: '1' }] },
      { id: 'bunOver19', label: 'BUN > 19 mg/dL (Urea > 7 mmol/L)', type: 'select', defaultValue: '1', options: [{ label: 'No (0)', value: '0' }, { label: 'Yes (+1)', value: '1' }] },
      { id: 'rrOver30', label: 'Respiratory Rate ≥ 30 breaths/min', type: 'select', defaultValue: '0', options: [{ label: 'No (0)', value: '0' }, { label: 'Yes (+1)', value: '1' }] },
      { id: 'lowBp', label: 'Systolic < 90 or Diastolic ≤ 60 mmHg', type: 'select', defaultValue: '0', options: [{ label: 'No (0)', value: '0' }, { label: 'Yes (+1)', value: '1' }] },
      { id: 'age65', label: 'Age ≥ 65 Years', type: 'select', defaultValue: '1', options: [{ label: 'No (0)', value: '0' }, { label: 'Yes (+1)', value: '1' }] },
    ],
    calculate: (v) => {
      const score = [v.confusion, v.bunOver19, v.rrOver30, v.lowBp, v.age65]
        .map((x) => parseNum(x || 0))
        .reduce((a, b) => a + (Number.isNaN(b) ? 0 : b), 0);
      const mort = ['0.6%', '2.7%', '6.8%', '14.0%', '27.8%', '27.8%'];
      const triage = score <= 1 ? 'Low Risk — Outpatient Care Generally Considered' : score === 2 ? 'Moderate Risk — Short Inpatient / Close Observation' : 'Severe Pneumonia (≥3) — Urgent Inpatient / Consider ICU';
      return {
        primaryValue: score,
        primaryUnit: '/ 5 CURB-65',
        primaryLabel: triage,
        secondaryOutputs: [{ label: 'Historical 30-Day Mortality', value: mort[Math.min(5, Math.max(0, score))] }],
        steps: [`CURB-65 total = ${score}/5 (${triage}).`],
      };
    },
  },
];
