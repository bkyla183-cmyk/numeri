import { CalculatorSpec } from './types';

export const healthFitnessSportsSpecs: CalculatorSpec[] = [
  // HEALTH & FITNESS
  {
    slug: 'bmi-calculator',
    title: 'Body Mass Index (BMI) Calculator',
    category: 'health-fitness',
    formulaDisplay: 'BMI = weight (kg) / [height (m)]²',
    inputs: [
      { id: 'weightKg', label: 'Weight (kg)', defaultValue: 72, type: 'number', min: 20, max: 300, step: 0.5, unit: 'kg' },
      { id: 'heightCm', label: 'Height (cm)', defaultValue: 175, type: 'number', min: 50, max: 250, step: 1, unit: 'cm' },
    ],
    calculate: (v) => {
      const w = Number(v.weightKg) || 70;
      const hCm = Number(v.heightCm) || 170;
      const hM = hCm / 100;
      const bmi = w / (hM * hM);
      let cat = 'Normal Weight';
      if (bmi < 18.5) cat = 'Underweight';
      else if (bmi < 25) cat = 'Normal / Healthy Weight';
      else if (bmi < 30) cat = 'Overweight';
      else cat = 'Obese Class';
      return {
        primaryValue: parseFloat(bmi.toFixed(1)),
        primaryUnit: 'kg/m²',
        primaryLabel: `BMI Index (${cat})`,
        secondaryOutputs: [
          { label: 'WHO Category', value: cat },
          { label: 'Healthy Weight Range (BMI 18.5 - 24.9)', value: `${(18.5 * hM * hM).toFixed(1)} - ${(24.9 * hM * hM).toFixed(1)} kg` },
        ],
        steps: [`BMI = ${w} kg / (${hM} m)² = ${w} / ${(hM * hM).toFixed(4)} = ${bmi.toFixed(2)}`],
        formulaUsed: 'Quetelet Body Mass Index (WHO Standard)',
      };
    },
  },
  {
    slug: 'calorie-calculator',
    title: 'Daily Calorie & TDEE Calculator',
    category: 'health-fitness',
    formulaDisplay: 'TDEE = BMR (Mifflin-St Jeor) × Activity Multiplier',
    inputs: [
      { id: 'weightKg', label: 'Weight (kg)', defaultValue: 75, type: 'number', step: 0.5, unit: 'kg' },
      { id: 'heightCm', label: 'Height (cm)', defaultValue: 178, type: 'number', step: 1, unit: 'cm' },
      { id: 'age', label: 'Age (Years)', defaultValue: 30, type: 'number', step: 1, unit: 'yrs' },
      {
        id: 'gender',
        label: 'Biological Sex',
        type: 'select',
        defaultValue: 'male',
        options: [{ label: 'Male (+5)', value: 'male' }, { label: 'Female (-161)', value: 'female' }],
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
        ],
      },
    ],
    calculate: (v) => {
      const w = Number(v.weightKg) || 70;
      const h = Number(v.heightCm) || 170;
      const age = Number(v.age) || 25;
      const isMale = v.gender !== 'female';
      const bmr = 10 * w + 6.25 * h - 5 * age + (isMale ? 5 : -161);
      const mult = Number(v.activity) || 1.375;
      const tdee = bmr * mult;
      return {
        primaryValue: Math.round(tdee),
        primaryUnit: 'kcal / day',
        primaryLabel: 'Maintenance Calories (TDEE)',
        secondaryOutputs: [
          { label: 'Basal Metabolic Rate (BMR)', value: `${Math.round(bmr)} kcal/day` },
          { label: 'Mild Weight Loss (-500 kcal)', value: `${Math.round(tdee - 500)} kcal/day` },
          { label: 'Clean Muscle Gain (+300 kcal)', value: `${Math.round(tdee + 300)} kcal/day` },
        ],
        steps: [`BMR = 10(${w}) + 6.25(${h}) - 5(${age}) ${isMale ? '+ 5' : '- 161'} = ${Math.round(bmr)} kcal`, `TDEE = ${Math.round(bmr)} × ${mult} = ${Math.round(tdee)} kcal`],
        formulaUsed: 'Mifflin-St Jeor TDEE Equation',
      };
    },
  },
  {
    slug: 'body-fat-calculator',
    title: 'US Navy Body Fat Percentage Calculator',
    category: 'health-fitness',
    formulaDisplay: 'US Navy Body Circumference Anthropometric Equation',
    inputs: [
      { id: 'waistCm', label: 'Waist Circumference (at navel, cm)', defaultValue: 84, type: 'number', step: 0.5, unit: 'cm' },
      { id: 'neckCm', label: 'Neck Circumference (cm)', defaultValue: 38, type: 'number', step: 0.5, unit: 'cm' },
      { id: 'heightCm', label: 'Height (cm)', defaultValue: 178, type: 'number', step: 1, unit: 'cm' },
      {
        id: 'gender',
        label: 'Gender',
        type: 'select',
        defaultValue: 'male',
        options: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }],
      },
      { id: 'hipCm', label: 'Hip Circumference (Females only, cm)', defaultValue: 96, type: 'number', step: 0.5, unit: 'cm' },
    ],
    calculate: (v) => {
      const waist = Number(v.waistCm) || 80;
      const neck = Number(v.neckCm) || 38;
      const h = Number(v.heightCm) || 175;
      const isMale = v.gender !== 'female';
      const hip = Number(v.hipCm) || 95;
      let bf = 0;
      if (isMale) {
        bf = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(h)) - 450;
      } else {
        bf = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(h)) - 450;
      }
      bf = Math.max(3, Math.min(60, bf));
      return {
        primaryValue: parseFloat(bf.toFixed(1)),
        primaryUnit: '%',
        primaryLabel: 'Estimated Body Fat Percentage',
        secondaryOutputs: [
          { label: 'Category', value: bf < 14 ? 'Athletic / Essential' : (bf < 21 ? 'Fitness' : (bf < 25 ? 'Average' : 'High')) },
        ],
        steps: [`Calculated using DoD / US Navy circumference regression algorithm.`],
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
      { id: 'age', label: 'Age (Years)', defaultValue: 30, type: 'number', min: 10, max: 99, step: 1, unit: 'yrs' },
      { id: 'restHr', label: 'Resting Heart Rate (bpm)', defaultValue: 65, type: 'number', min: 40, max: 120, step: 1, unit: 'bpm' },
    ],
    calculate: (v) => {
      const age = Number(v.age) || 30;
      const rest = Number(v.restHr) || 60;
      const maxHr = 208 - 0.7 * age; // Tanaka
      const hrr = maxHr - rest;
      const aerobic = rest + hrr * 0.70;
      const fatBurn = rest + hrr * 0.60;
      const anaerobic = rest + hrr * 0.85;
      return {
        primaryValue: `${Math.round(fatBurn)} - ${Math.round(aerobic)}`,
        primaryUnit: 'bpm',
        primaryLabel: 'Aerobic Target Heart Rate Zone (60% - 70%)',
        secondaryOutputs: [
          { label: 'Max Heart Rate (Tanaka)', value: `${Math.round(maxHr)} bpm` },
          { label: 'Heart Rate Reserve (HRR)', value: `${Math.round(hrr)} bpm` },
          { label: 'Anaerobic Threshold (85%)', value: `${Math.round(anaerobic)} bpm` },
        ],
        steps: [`Max HR = 208 - 0.7(${age}) = ${Math.round(maxHr)} bpm`, `Karvonen zone = ${rest} + ${Math.round(hrr)} × (60% to 70%)`],
        formulaUsed: 'Karvonen Heart Rate Reserve Formula',
      };
    },
  },
  {
    slug: 'ideal-weight-calculator',
    title: 'Ideal Body Weight (IBW) Calculator',
    category: 'health-fitness',
    formulaDisplay: 'Devine Formula: Men 50kg + 2.3kg/inch > 5ft, Women 45.5kg + 2.3kg/inch',
    inputs: [
      { id: 'heightCm', label: 'Height (cm)', defaultValue: 175, type: 'number', min: 120, max: 230, step: 1, unit: 'cm' },
      {
        id: 'gender',
        label: 'Gender',
        type: 'select',
        defaultValue: 'male',
        options: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }],
      },
    ],
    calculate: (v) => {
      const hCm = Number(v.heightCm) || 170;
      const hInches = hCm / 2.54;
      const inchesOver5Ft = Math.max(0, hInches - 60);
      const isMale = v.gender !== 'female';
      const devine = isMale ? 50 + 2.3 * inchesOver5Ft : 45.5 + 2.3 * inchesOver5Ft;
      const robinson = isMale ? 52 + 1.9 * inchesOver5Ft : 49 + 1.7 * inchesOver5Ft;
      return {
        primaryValue: parseFloat(devine.toFixed(1)),
        primaryUnit: 'kg',
        primaryLabel: 'Ideal Body Weight (Devine Formula)',
        secondaryOutputs: [
          { label: 'In Pounds (lbs)', value: `${(devine * 2.20462).toFixed(1)} lbs` },
          { label: 'Robinson Formula IBW', value: `${robinson.toFixed(1)} kg` },
        ],
        steps: [`Height: ${hInches.toFixed(1)} inches (${inchesOver5Ft.toFixed(1)} inches over 5 feet).`],
        formulaUsed: 'Devine & Robinson Clinical IBW Standard',
      };
    },
  },
  {
    slug: 'water-intake-calculator',
    title: 'Daily Water Hydration Calculator',
    category: 'health-fitness',
    formulaDisplay: 'Daily Water = Weight (kg) × 35 mL + Exercise Bonus',
    inputs: [
      { id: 'weightKg', label: 'Body Weight (kg)', defaultValue: 75, type: 'number', step: 1, unit: 'kg' },
      { id: 'exerciseMin', label: 'Daily Exercise / Activity (Minutes)', defaultValue: 45, type: 'number', step: 15, unit: 'min' },
    ],
    calculate: (v) => {
      const w = Number(v.weightKg) || 70;
      const ex = Number(v.exerciseMin) || 0;
      const baseMl = w * 35;
      const exerciseMl = (ex / 30) * 350; // ~350ml per 30 mins
      const totalMl = baseMl + exerciseMl;
      const totalLiters = totalMl / 1000;
      const cups = totalMl / 240;
      return {
        primaryValue: parseFloat(totalLiters.toFixed(2)),
        primaryUnit: 'liters / day',
        primaryLabel: 'Recommended Water Intake',
        secondaryOutputs: [
          { label: 'Standard 8 oz Glasses', value: `${Math.round(cups)} cups` },
          { label: 'Base Hydration Need', value: `${(baseMl / 1000).toFixed(2)} L` },
          { label: 'Exercise Sweat Replacement', value: `${(exerciseMl / 1000).toFixed(2)} L` },
        ],
        steps: [`Base: ${w} kg × 35 mL = ${baseMl} mL`, `Exercise adjustment: +${Math.round(exerciseMl)} mL`],
        formulaUsed: 'Clinical Hydration Requirement Standard',
      };
    },
  },
  {
    slug: 'macronutrient-calculator',
    title: 'Macronutrient Split (Carbs, Protein, Fats) Calculator',
    category: 'health-fitness',
    formulaDisplay: 'Protein (4 kcal/g), Carbs (4 kcal/g), Fats (9 kcal/g)',
    inputs: [
      { id: 'calories', label: 'Daily Calorie Target (kcal)', defaultValue: 2200, type: 'number', step: 50, unit: 'kcal' },
      { id: 'proteinPct', label: 'Protein %', defaultValue: 30, type: 'number', step: 5, unit: '%' },
      { id: 'carbsPct', label: 'Carbohydrates %', defaultValue: 40, type: 'number', step: 5, unit: '%' },
      { id: 'fatsPct', label: 'Fats %', defaultValue: 30, type: 'number', step: 5, unit: '%' },
    ],
    calculate: (v) => {
      const cal = Number(v.calories) || 2000;
      const pPct = (Number(v.proteinPct) || 30) / 100;
      const cPct = (Number(v.carbsPct) || 40) / 100;
      const fPct = (Number(v.fatsPct) || 30) / 100;
      const proteinG = (cal * pPct) / 4;
      const carbsG = (cal * cPct) / 4;
      const fatsG = (cal * fPct) / 9;
      return {
        primaryValue: `${Math.round(proteinG)}g P / ${Math.round(carbsG)}g C / ${Math.round(fatsG)}g F`,
        primaryLabel: 'Daily Macronutrient Targets',
        secondaryOutputs: [
          { label: 'Protein Grams (4 kcal/g)', value: `${Math.round(proteinG)}g (${Math.round(cal * pPct)} kcal)` },
          { label: 'Carbohydrates Grams (4 kcal/g)', value: `${Math.round(carbsG)}g (${Math.round(cal * cPct)} kcal)` },
          { label: 'Healthy Fats Grams (9 kcal/g)', value: `${Math.round(fatsG)}g (${Math.round(cal * fPct)} kcal)` },
        ],
        steps: [`Protein: (${cal} × ${pPct * 100}%) / 4 = ${Math.round(proteinG)}g`, `Carbs: (${cal} × ${cPct * 100}%) / 4 = ${Math.round(carbsG)}g`, `Fats: (${cal} × ${fPct * 100}%) / 9 = ${Math.round(fatsG)}g`],
        formulaUsed: '4-4-9 Atwater Factor Caloric Breakdown',
      };
    },
  },
  {
    slug: 'bmr-calculator',
    title: 'BMR (Basal Metabolic Rate) Calculator',
    category: 'health-fitness',
    formulaDisplay: 'Mifflin-St Jeor: 10w + 6.25h - 5a + s',
    inputs: [
      { id: 'w', label: 'Weight (kg)', defaultValue: 70, type: 'number', step: 0.5, unit: 'kg' },
      { id: 'h', label: 'Height (cm)', defaultValue: 175, type: 'number', step: 1, unit: 'cm' },
      { id: 'age', label: 'Age (Years)', defaultValue: 28, type: 'number', step: 1, unit: 'yrs' },
      { id: 'gender', label: 'Sex', type: 'select', defaultValue: 'male', options: [{ label: 'Male (+5)', value: 'male' }, { label: 'Female (-161)', value: 'female' }] },
    ],
    calculate: (v) => {
      const w = Number(v.w) || 70;
      const h = Number(v.h) || 170;
      const age = Number(v.age) || 25;
      const isMale = v.gender !== 'female';
      const bmr = 10 * w + 6.25 * h - 5 * age + (isMale ? 5 : -161);
      return {
        primaryValue: Math.round(bmr),
        primaryUnit: 'kcal / day',
        primaryLabel: 'Basal Metabolic Rate (BMR)',
        secondaryOutputs: [
          { label: 'Hourly Caloric Burn at Rest', value: `${(bmr / 24).toFixed(1)} kcal/hr` },
        ],
        steps: [`BMR represents bare minimum energy consumed at complete comatose rest for vital organ functioning.`],
        formulaUsed: 'Mifflin-St Jeor Equation',
      };
    },
  },
  {
    slug: 'lean-body-mass-calculator',
    title: 'Lean Body Mass (Boer Formula) Calculator',
    category: 'health-fitness',
    formulaDisplay: 'Boer LBM Equation based on weight and height',
    inputs: [
      { id: 'weightKg', label: 'Total Body Weight (kg)', defaultValue: 78, type: 'number', step: 0.5, unit: 'kg' },
      { id: 'heightCm', label: 'Height (cm)', defaultValue: 180, type: 'number', step: 1, unit: 'cm' },
      { id: 'gender', label: 'Sex', type: 'select', defaultValue: 'male', options: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }] },
    ],
    calculate: (v) => {
      const w = Number(v.weightKg) || 70;
      const h = Number(v.heightCm) || 170;
      const isMale = v.gender !== 'female';
      const lbm = isMale ? 0.407 * w + 0.267 * h - 19.2 : 0.252 * w + 0.473 * h - 48.3;
      const fatMass = Math.max(0, w - lbm);
      const fatPct = (fatMass / w) * 100;
      return {
        primaryValue: parseFloat(lbm.toFixed(1)),
        primaryUnit: 'kg',
        primaryLabel: 'Lean Body Mass (LBM)',
        secondaryOutputs: [
          { label: 'Fat Mass', value: `${fatMass.toFixed(1)} kg` },
          { label: 'Calculated Body Fat %', value: `${fatPct.toFixed(1)}%` },
        ],
        steps: [`LBM calculated using clinical Boer anthropometric regression.`],
        formulaUsed: 'Boer Lean Body Mass Formula',
      };
    },
  },
  {
    slug: 'calorie-burn-calculator',
    title: 'Calorie Burn (MET Activity) Calculator',
    category: 'health-fitness',
    formulaDisplay: 'Burn = Duration (hours) × MET × Weight (kg)',
    inputs: [
      { id: 'met', label: 'MET Value of Activity (e.g. Running=8, Walking=3.5, Cycling=7)', defaultValue: 8.0, type: 'number', step: 0.5, unit: 'MET' },
      { id: 'weightKg', label: 'Body Weight (kg)', defaultValue: 75, type: 'number', step: 1, unit: 'kg' },
      { id: 'durationMin', label: 'Duration (Minutes)', defaultValue: 45, type: 'number', step: 5, unit: 'min' },
    ],
    calculate: (v) => {
      const met = Number(v.met) || 1;
      const w = Number(v.weightKg) || 70;
      const durHours = (Number(v.durationMin) || 0) / 60;
      const calories = met * w * durHours;
      return {
        primaryValue: Math.round(calories),
        primaryUnit: 'kcal',
        primaryLabel: 'Total Calories Burned',
        secondaryOutputs: [
          { label: 'Calorie Burn Rate', value: `${Math.round(calories / (durHours || 1))} kcal/hr` },
        ],
        steps: [`Burn = ${met} MET × ${w} kg × ${durHours.toFixed(2)} hrs = ${Math.round(calories)} kcal`],
        formulaUsed: 'Compendium of Physical Activities MET Formula',
      };
    },
  },
  {
    slug: 'one-rep-max-calculator',
    title: 'One-Rep Max (1RM) Weightlifting Calculator',
    category: 'health-fitness',
    formulaDisplay: '1RM = Weight / (1.0278 - 0.0278 × Reps) (Brzycki Formula)',
    inputs: [
      { id: 'weight', label: 'Weight Lifted', defaultValue: 100, type: 'number', min: 1, step: 2.5, unit: 'kg/lbs' },
      { id: 'reps', label: 'Repetitions Completed (1-12 reps)', defaultValue: 5, type: 'number', min: 1, max: 15, step: 1, unit: 'reps' },
    ],
    calculate: (v) => {
      const w = Number(v.weight) || 100;
      const r = Math.max(1, Math.min(15, Number(v.reps) || 1));
      const brzycki = w / (1.0278 - 0.0278 * r);
      const epley = w * (1 + r / 30);
      return {
        primaryValue: parseFloat(brzycki.toFixed(1)),
        primaryUnit: 'kg/lbs',
        primaryLabel: 'Estimated One-Rep Max (1RM)',
        secondaryOutputs: [
          { label: 'Epley Formula Estimate', value: epley.toFixed(1) },
          { label: '90% of 1RM (approx 3-rep weight)', value: (brzycki * 0.9).toFixed(1) },
          { label: '80% of 1RM (approx 8-rep weight)', value: (brzycki * 0.8).toFixed(1) },
          { label: '70% of 1RM (approx 12-rep weight)', value: (brzycki * 0.7).toFixed(1) },
        ],
        steps: [`Brzycki equation: ${w} / (1.0278 - 0.0278 × ${r}) = ${brzycki.toFixed(1)}`],
        formulaUsed: 'Brzycki and Epley 1RM Equations',
      };
    },
  },
  {
    slug: 'walking-calorie-calculator',
    title: 'Walking Calorie Burn Calculator',
    category: 'health-fitness',
    formulaDisplay: 'Calories = Distance (miles) × Weight (lbs) × 0.53',
    inputs: [
      { id: 'distanceMiles', label: 'Distance Walked (Miles)', defaultValue: 3.5, type: 'number', step: 0.5, unit: 'miles' },
      { id: 'weightLbs', label: 'Body Weight (lbs)', defaultValue: 165, type: 'number', step: 5, unit: 'lbs' },
    ],
    calculate: (v) => {
      const d = Number(v.distanceMiles) || 0;
      const w = Number(v.weightLbs) || 150;
      const cals = d * w * 0.53;
      return {
        primaryValue: Math.round(cals),
        primaryUnit: 'kcal',
        primaryLabel: 'Calories Burned Walking',
        secondaryOutputs: [
          { label: 'Calories per Mile', value: `${Math.round(w * 0.53)} kcal/mile` },
        ],
        steps: [`Burn = ${d} miles × ${w} lbs × 0.53 = ${Math.round(cals)} kcal`],
        formulaUsed: 'ACSM Walking Energy Expenditure',
      };
    },
  },
  {
    slug: 'steps-to-distance-calculator',
    title: 'Steps to Distance & Miles Converter',
    category: 'health-fitness',
    formulaDisplay: 'Distance = Steps × Stride Length (~2.2 ft/step)',
    inputs: [
      { id: 'steps', label: 'Step Count', defaultValue: 10000, type: 'number', step: 500, unit: 'steps' },
      { id: 'heightCm', label: 'Your Height (cm)', defaultValue: 175, type: 'number', step: 1, unit: 'cm' },
    ],
    calculate: (v) => {
      const steps = Number(v.steps) || 0;
      const hCm = Number(v.heightCm) || 170;
      const strideM = hCm * 0.01 * 0.415; // avg stride factor 0.415 of height
      const totalM = steps * strideM;
      const totalKm = totalM / 1000;
      const totalMiles = totalKm * 0.621371;
      return {
        primaryValue: parseFloat(totalMiles.toFixed(2)),
        primaryUnit: 'miles',
        primaryLabel: 'Walking Distance',
        secondaryOutputs: [
          { label: 'Kilometers', value: `${totalKm.toFixed(2)} km` },
          { label: 'Estimated Stride Length', value: `${(strideM * 100).toFixed(1)} cm` },
        ],
        steps: [`Stride ≈ ${(strideM * 100).toFixed(1)} cm`, `Total = ${steps} × ${strideM.toFixed(2)} m = ${totalMiles.toFixed(2)} miles`],
        formulaUsed: 'Biometric Stride Factor Equation',
      };
    },
  },
  {
    slug: 'absi-calculator',
    title: 'ABSI (A Body Shape Index) Calculator',
    category: 'health-fitness',
    formulaDisplay: 'ABSI = WC / (BMI^(2/3) × Height^(1/2))',
    inputs: [
      { id: 'wcCm', label: 'Waist Circumference (cm)', defaultValue: 86, type: 'number', step: 0.5, unit: 'cm' },
      { id: 'wKg', label: 'Weight (kg)', defaultValue: 75, type: 'number', step: 0.5, unit: 'kg' },
      { id: 'hCm', label: 'Height (cm)', defaultValue: 178, type: 'number', step: 1, unit: 'cm' },
    ],
    calculate: (v) => {
      const wcM = (Number(v.wcCm) || 80) / 100;
      const w = Number(v.wKg) || 70;
      const hM = (Number(v.hCm) || 170) / 100;
      const bmi = w / (hM * hM);
      const absi = wcM / (Math.pow(bmi, 2 / 3) * Math.sqrt(hM));
      return {
        primaryValue: parseFloat(absi.toFixed(4)),
        primaryLabel: 'A Body Shape Index (ABSI)',
        secondaryOutputs: [
          { label: 'BMI Equivalent', value: parseFloat(bmi.toFixed(1)) },
          { label: 'Mortality Risk Category', value: absi < 0.08 ? 'Average / Low Risk' : 'Elevated Abdominal Adiposity Risk' },
        ],
        steps: [`Krakauer & Krakauer ABSI visceral mortality formula.`],
        formulaUsed: 'ABSI Krakauer Equation',
      };
    },
  },
  {
    slug: 'waist-to-hip-ratio-calculator',
    title: 'Waist-to-Hip Ratio (WHR) Calculator',
    category: 'health-fitness',
    formulaDisplay: 'WHR = Waist Circumference / Hip Circumference',
    inputs: [
      { id: 'waist', label: 'Waist Circumference (cm/in)', defaultValue: 80, type: 'number', step: 0.5 },
      { id: 'hip', label: 'Hip Circumference (cm/in)', defaultValue: 98, type: 'number', step: 0.5 },
      { id: 'gender', label: 'Sex', type: 'select', defaultValue: 'male', options: [{ label: 'Male (Healthy < 0.90)', value: 'male' }, { label: 'Female (Healthy < 0.85)', value: 'female' }] },
    ],
    calculate: (v) => {
      const w = Number(v.waist) || 1;
      const h = Number(v.hip) || 1;
      const whr = w / h;
      const isMale = v.gender !== 'female';
      const isHealthy = isMale ? whr < 0.90 : whr < 0.85;
      return {
        primaryValue: parseFloat(whr.toFixed(2)),
        primaryLabel: 'Waist-to-Hip Ratio',
        secondaryOutputs: [
          { label: 'Cardiovascular Risk Profile', value: isHealthy ? 'Low Health Risk' : 'Elevated Cardiovascular Risk' },
        ],
        steps: [`WHR = ${w} / ${h} = ${whr.toFixed(2)}`],
        formulaUsed: 'WHO Waist-to-Hip Ratio Cutoffs',
      };
    },
  },
  {
    slug: 'waist-to-height-ratio-calculator',
    title: 'Waist-to-Height Ratio (WHtR) Calculator',
    category: 'health-fitness',
    formulaDisplay: 'WHtR = Waist Circumference / Height',
    inputs: [
      { id: 'waist', label: 'Waist Circumference (cm)', defaultValue: 82, type: 'number', step: 0.5, unit: 'cm' },
      { id: 'height', label: 'Height (cm)', defaultValue: 175, type: 'number', step: 1, unit: 'cm' },
    ],
    calculate: (v) => {
      const w = Number(v.waist) || 80;
      const h = Number(v.height) || 170;
      const ratio = w / h;
      return {
        primaryValue: parseFloat(ratio.toFixed(2)),
        primaryLabel: 'Waist-to-Height Ratio',
        secondaryOutputs: [
          { label: 'General Health Rule', value: ratio <= 0.5 ? 'Healthy (Keep waist < half height)' : 'Increased Health Risk (> 0.5)' },
        ],
        steps: [`WHtR = ${w} / ${h} = ${ratio.toFixed(2)}`],
        formulaUsed: 'Ashwell Waist-to-Height Metric',
      };
    },
  },
  {
    slug: 'intermittent-fasting-calculator',
    title: 'Intermittent Fasting Schedule Calculator',
    category: 'health-fitness',
    formulaDisplay: 'Fasting Window + Eating Window = 24 Hours',
    inputs: [
      {
        id: 'protocol',
        label: 'Fasting Protocol',
        type: 'select',
        defaultValue: '16',
        options: [
          { label: '16/8 Method (16h fast, 8h eating)', value: '16' },
          { label: '18/6 Method (18h fast, 6h eating)', value: '18' },
          { label: '20/4 Warrior Diet (20h fast, 4h eating)', value: '20' },
          { label: '14/10 Gentle Fast (14h fast, 10h eating)', value: '14' },
        ],
      },
      { id: 'startTime', label: 'Last Meal Time (e.g. 20:00 for 8 PM)', defaultValue: '20:00', type: 'text' },
    ],
    calculate: (v) => {
      const fastHours = parseInt(v.protocol || '16', 10);
      const eatHours = 24 - fastHours;
      const startParts = String(v.startTime || '20:00').split(':').map(Number);
      const startH = isNaN(startParts[0]) ? 20 : startParts[0];
      const startM = isNaN(startParts[1]) ? 0 : startParts[1];
      const endH = (startH + fastHours) % 24;
      const endStr = `${endH.toString().padStart(2, '0')}:${startM.toString().padStart(2, '0')}`;
      return {
        primaryValue: endStr,
        primaryLabel: `Fast Breaks At (${fastHours}h Fast Complete)`,
        secondaryOutputs: [
          { label: 'Eating Window Duration', value: `${eatHours} hours` },
          { label: 'Fasting Duration', value: `${fastHours} hours` },
        ],
        steps: [`Last bite at ${v.startTime}. Fast concludes at ${endStr}.`],
        formulaUsed: 'Intermittent Fasting Circadian Windows',
      };
    },
  },
  {
    slug: 'protein-intake-calculator',
    title: 'Daily Protein Requirement Calculator',
    category: 'health-fitness',
    formulaDisplay: 'Target = Body Weight (kg) × Goal Coefficient (0.8 - 2.2 g/kg)',
    inputs: [
      { id: 'weightKg', label: 'Body Weight (kg)', defaultValue: 75, type: 'number', step: 1, unit: 'kg' },
      {
        id: 'goal',
        label: 'Fitness Goal / Activity Level',
        type: 'select',
        defaultValue: 'hypertrophy',
        options: [
          { label: 'Sedentary Maintenance (RDA: 0.8 g/kg)', value: '0.8' },
          { label: 'Endurance Athlete (1.4 g/kg)', value: '1.4' },
          { label: 'Muscle Hypertrophy & Strength (1.8 g/kg)', value: '1.8' },
          { label: 'Aggressive Fat Loss Cut (2.2 g/kg)', value: '2.2' },
        ],
      },
    ],
    calculate: (v) => {
      const w = Number(v.weightKg) || 70;
      const factor = Number(v.goal) || 1.8;
      const totalG = w * factor;
      return {
        primaryValue: Math.round(totalG),
        primaryUnit: 'grams / day',
        primaryLabel: 'Optimal Daily Protein Target',
        secondaryOutputs: [
          { label: 'Per Meal Target (4 meals/day)', value: `${Math.round(totalG / 4)}g / meal` },
          { label: 'Total Calories from Protein', value: `${Math.round(totalG * 4)} kcal` },
        ],
        steps: [`${w} kg × ${factor} g/kg = ${Math.round(totalG)} grams`],
        formulaUsed: 'ISSN Protein Nutrition Guidelines',
      };
    },
  },
  {
    slug: 'daily-fiber-calculator',
    title: 'Daily Dietary Fiber Intake Calculator',
    category: 'health-fitness',
    formulaDisplay: 'Fiber = 14 grams per 1,000 kcal consumed',
    inputs: [
      { id: 'dailyCalories', label: 'Daily Calorie Consumption (kcal)', defaultValue: 2400, type: 'number', step: 100, unit: 'kcal' },
    ],
    calculate: (v) => {
      const cal = Number(v.dailyCalories) || 2000;
      const fiber = (cal / 1000) * 14;
      return {
        primaryValue: parseFloat(fiber.toFixed(1)),
        primaryUnit: 'grams / day',
        primaryLabel: 'Recommended Fiber Intake',
        secondaryOutputs: [
          { label: 'Soluble Fiber (~25%)', value: `${(fiber * 0.25).toFixed(1)}g` },
          { label: 'Insoluble Fiber (~75%)', value: `${(fiber * 0.75).toFixed(1)}g` },
        ],
        steps: [`Standard USDA guideline: 14g fiber per 1,000 calories consumed.`],
        formulaUsed: 'Dietary Reference Intake (DRI) Fiber Equation',
      };
    },
  },
  {
    slug: 'vo2-max-calculator',
    title: 'VO2 Max (Cooper 12-Min Run) Calculator',
    category: 'health-fitness',
    formulaDisplay: 'VO2 Max = (Distance in meters - 504.9) / 44.73',
    inputs: [
      { id: 'meters', label: '12-Minute Run Distance (Meters)', defaultValue: 2600, type: 'number', min: 550, max: 5000, step: 50, unit: 'm' },
    ],
    calculate: (v) => {
      const d = Number(v.meters) || 2000;
      const vo2 = (d - 504.9) / 44.73;
      return {
        primaryValue: parseFloat(vo2.toFixed(1)),
        primaryUnit: 'mL/kg/min',
        primaryLabel: 'Estimated VO2 Max',
        secondaryOutputs: [
          { label: 'Fitness Rating', value: vo2 > 50 ? 'Superior / Excellent' : (vo2 > 42 ? 'Good / Above Average' : 'Fair / Average') },
        ],
        steps: [`VO2 Max = (${d} - 504.9) / 44.73 = ${vo2.toFixed(1)}`],
        formulaUsed: 'Cooper 12-Minute Aerobic Test Formula',
      };
    },
  },
  {
    slug: 'blood-alcohol-content-calculator',
    title: 'Blood Alcohol Content (BAC Widmark) Calculator',
    category: 'health-fitness',
    formulaDisplay: 'BAC = [Alcohol consumed (g) / (Body Weight (g) × r)] × 100 - (β × Hours)',
    inputs: [
      { id: 'drinks', label: 'Standard Drinks Consumed (12 oz beer / 5 oz wine)', defaultValue: 3, type: 'number', step: 1 },
      { id: 'weightLbs', label: 'Body Weight (lbs)', defaultValue: 170, type: 'number', step: 5, unit: 'lbs' },
      { id: 'gender', label: 'Sex', type: 'select', defaultValue: 'male', options: [{ label: 'Male (r = 0.68)', value: '0.68' }, { label: 'Female (r = 0.55)', value: '0.55' }] },
      { id: 'hours', label: 'Hours Since First Drink', defaultValue: 2, type: 'number', step: 0.5, unit: 'hrs' },
    ],
    calculate: (v) => {
      const drinks = Number(v.drinks) || 0;
      const gramsAlcohol = drinks * 14; // 14g per standard US drink
      const wGrams = (Number(v.weightLbs) || 150) * 453.592;
      const r = Number(v.gender) || 0.68;
      const t = Number(v.hours) || 0;
      const rawBac = (gramsAlcohol / (wGrams * r)) * 100;
      const metabolicElimination = 0.015 * t; // 0.015% per hour
      const bac = Math.max(0, rawBac - metabolicElimination);
      return {
        primaryValue: parseFloat(bac.toFixed(3)),
        primaryUnit: '% BAC',
        primaryLabel: 'Estimated Blood Alcohol Level',
        secondaryOutputs: [
          { label: 'Legal Driving Limit', value: '0.08% BAC (US / UK)' },
          { label: 'Hours to Full Sobriety (0.00%)', value: `${(bac / 0.015).toFixed(1)} hours` },
        ],
        steps: [`Widmark forensic equation with 0.015% hourly liver metabolic clearance.`],
        formulaUsed: 'Widmark Forensic BAC Equation',
      };
    },
  },
  {
    slug: 'smoking-cost-calculator',
    title: 'Smoking Financial & Health Cost Calculator',
    category: 'health-fitness',
    formulaDisplay: 'Annual Cost = Packs per Day × Price per Pack × 365',
    inputs: [
      { id: 'packsPerDay', label: 'Packs Smoked per Day', defaultValue: 1, type: 'number', step: 0.5, unit: 'packs' },
      { id: 'packPrice', label: 'Price per Pack ($)', defaultValue: 11.50, type: 'number', step: 0.5, unit: '$' },
    ],
    calculate: (v) => {
      const p = Number(v.packsPerDay) || 0;
      const cost = Number(v.packPrice) || 0;
      const annual = p * cost * 365;
      const tenYear = annual * 10;
      const investedTenYear = annual * ((Math.pow(1.08, 10) - 1) / 0.08); // 8% compound investment
      return {
        primaryValue: parseFloat(annual.toFixed(2)),
        primaryUnit: '$ / yr',
        primaryLabel: 'Annual Direct Cost of Smoking',
        secondaryOutputs: [
          { label: '10-Year Out-of-Pocket Cost', value: `$${tenYear.toFixed(2)}` },
          { label: '10-Year Opportunity Cost (if invested at 8%)', value: `$${investedTenYear.toFixed(2)}` },
        ],
        steps: [`Annual = ${p} packs × $${cost} × 365 days = $${annual.toFixed(2)}`],
        formulaUsed: 'Smoking Cost Accumulator',
      };
    },
  },
  {
    slug: 'sleep-cycle-calculator',
    title: 'Sleep Cycle (90-Minute REM) Calculator',
    category: 'health-fitness',
    formulaDisplay: 'Optimal Wake Time = Bedtime + (N × 90 min) + 15 min to fall asleep',
    inputs: [
      { id: 'bedHour', label: 'Bedtime Hour (24h format, e.g. 23 for 11 PM)', defaultValue: 23, type: 'number', min: 0, max: 23, step: 1 },
      { id: 'bedMinute', label: 'Bedtime Minute', defaultValue: 0, type: 'number', min: 0, max: 59, step: 5 },
    ],
    calculate: (v) => {
      const bh = Number(v.bedHour) || 23;
      const bm = Number(v.bedMinute) || 0;
      const startMin = bh * 60 + bm + 15; // 15 mins to sleep
      const formatTime = (totalMin: number) => {
        const h = Math.floor((totalMin / 60) % 24);
        const m = totalMin % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      };
      const cycle5 = formatTime(startMin + 5 * 90); // 7.5 hrs
      const cycle6 = formatTime(startMin + 6 * 90); // 9 hrs
      return {
        primaryValue: `${cycle5} or ${cycle6}`,
        primaryLabel: 'Optimal Alarm Times (5 or 6 Cycles)',
        secondaryOutputs: [
          { label: '5 Sleep Cycles (7.5 hrs sleep)', value: cycle5 },
          { label: '6 Sleep Cycles (9.0 hrs sleep)', value: cycle6 },
        ],
        steps: [`90-minute ultradian sleep architecture to avoid waking in deep slow-wave stage 3/4.`],
        formulaUsed: 'Ultradian 90-Minute Sleep Architecture Cycle',
      };
    },
  },
  {
    slug: 'glycemic-load-calculator',
    title: 'Glycemic Load (GL) Calculator',
    category: 'health-fitness',
    formulaDisplay: 'GL = (Glycemic Index × Available Net Carbs) / 100',
    inputs: [
      { id: 'gi', label: 'Glycemic Index (GI)', defaultValue: 65, type: 'number', min: 1, max: 100, step: 1 },
      { id: 'carbs', label: 'Net Available Carbohydrates per Serving (g)', defaultValue: 30, type: 'number', min: 1, step: 1, unit: 'g' },
    ],
    calculate: (v) => {
      const gi = Number(v.gi) || 50;
      const carbs = Number(v.carbs) || 20;
      const gl = (gi * carbs) / 100;
      let rating = 'Low (≤ 10)';
      if (gl > 20) rating = 'High (≥ 20)';
      else if (gl > 10) rating = 'Medium (11-19)';
      return {
        primaryValue: parseFloat(gl.toFixed(1)),
        primaryLabel: `Glycemic Load (${rating})`,
        secondaryOutputs: [
          { label: 'Impact Category', value: rating },
        ],
        steps: [`GL = (${gi} × ${carbs}g) / 100 = ${gl.toFixed(1)}`],
        formulaUsed: 'Glycemic Load Formulation',
      };
    },
  },
  {
    slug: 'heart-rate-reserve-calculator',
    title: 'Heart Rate Reserve (HRR) Calculator',
    category: 'health-fitness',
    formulaDisplay: 'HRR = Maximum Heart Rate - Resting Heart Rate',
    inputs: [
      { id: 'maxHr', label: 'Max Heart Rate (bpm)', defaultValue: 185, type: 'number', step: 1, unit: 'bpm' },
      { id: 'restHr', label: 'Resting Heart Rate (bpm)', defaultValue: 60, type: 'number', step: 1, unit: 'bpm' },
    ],
    calculate: (v) => {
      const m = Number(v.maxHr) || 180;
      const r = Number(v.restHr) || 60;
      const hrr = Math.max(0, m - r);
      return {
        primaryValue: hrr,
        primaryUnit: 'bpm',
        primaryLabel: 'Heart Rate Reserve',
        secondaryOutputs: [
          { label: 'Zone 2 Floor (60% HRR + Rest)', value: `${Math.round(r + hrr * 0.60)} bpm` },
          { label: 'Zone 4 Threshold (80% HRR + Rest)', value: `${Math.round(r + hrr * 0.80)} bpm` },
        ],
        steps: [`HRR = ${m} - ${r} = ${hrr} bpm`],
        formulaUsed: 'HRR = HR_max - HR_rest',
      };
    },
  },
  {
    slug: 'calorie-deficit-calculator',
    title: 'Calorie Deficit for Weight Loss Calculator',
    category: 'health-fitness',
    formulaDisplay: 'Target = TDEE - Deficit (3,500 kcal ≈ 1 lb Fat)',
    inputs: [
      { id: 'tdee', label: 'Current Maintenance Calories (TDEE)', defaultValue: 2400, type: 'number', step: 50, unit: 'kcal' },
      { id: 'lbsPerWeek', label: 'Target Fat Loss Rate (lbs / week)', defaultValue: 1.0, type: 'number', min: 0.5, max: 2.5, step: 0.25, unit: 'lbs/wk' },
    ],
    calculate: (v) => {
      const tdee = Number(v.tdee) || 2000;
      const rate = Number(v.lbsPerWeek) || 1;
      const dailyDeficit = (rate * 3500) / 7;
      const targetCalories = Math.max(1200, tdee - dailyDeficit);
      return {
        primaryValue: Math.round(targetCalories),
        primaryUnit: 'kcal / day',
        primaryLabel: 'Prescribed Daily Caloric Target',
        secondaryOutputs: [
          { label: 'Daily Energy Deficit', value: `-${Math.round(dailyDeficit)} kcal/day` },
          { label: 'Projected Monthly Weight Loss', value: `${(rate * 4.3).toFixed(1)} lbs / month` },
        ],
        steps: [`${rate} lb fat loss = ${rate * 3500} kcal/week = ${dailyDeficit} kcal/day deficit.`],
        formulaUsed: 'Wishnofsky 3,500 kcal Rule of Energy Balance',
      };
    },
  },
  {
    slug: 'electrolyte-calculator',
    title: 'Daily Electrolyte Requirements Calculator',
    category: 'health-fitness',
    formulaDisplay: 'Sodium (2300mg - 5000mg active), Potassium (3400mg), Magnesium (400mg)',
    inputs: [
      { id: 'sweatHours', label: 'Daily Intense Sweating / Workout (Hours)', defaultValue: 1.5, type: 'number', step: 0.5, unit: 'hrs' },
    ],
    calculate: (v) => {
      const h = Number(v.sweatHours) || 0;
      const sodium = 2300 + h * 800;
      const potassium = 3400 + h * 300;
      const magnesium = 400 + h * 50;
      return {
        primaryValue: `${Math.round(sodium)}mg Na / ${Math.round(potassium)}mg K / ${Math.round(magnesium)}mg Mg`,
        primaryLabel: 'Daily Electrolyte Balance Target',
        secondaryOutputs: [
          { label: 'Sodium (Na)', value: `${Math.round(sodium)} mg` },
          { label: 'Potassium (K)', value: `${Math.round(potassium)} mg` },
          { label: 'Magnesium (Mg)', value: `${Math.round(magnesium)} mg` },
        ],
        steps: [`Electrolyte sweat replenishment factoring ${h} hours of athletic perspiration.`],
        formulaUsed: 'Electrolyte Balance Replacement Formulation',
      };
    },
  },
  {
    slug: 'pregnancy-weight-gain-calculator',
    title: 'Pregnancy Weight Gain Guideline (IOM) Calculator',
    category: 'health-fitness',
    formulaDisplay: 'Institute of Medicine (IOM) Gestational BMI Targets',
    inputs: [
      { id: 'prePregnancyBmi', label: 'Pre-Pregnancy BMI', defaultValue: 22.5, type: 'number', step: 0.5 },
      { id: 'gestationWeeks', label: 'Current Gestation (Weeks)', defaultValue: 24, type: 'number', min: 1, max: 40, step: 1, unit: 'weeks' },
    ],
    calculate: (v) => {
      const bmi = Number(v.prePregnancyBmi) || 22;
      const wks = Number(v.gestationWeeks) || 12;
      let totalMin = 25, totalMax = 35; // normal BMI 18.5-24.9
      if (bmi < 18.5) { totalMin = 28; totalMax = 40; }
      else if (bmi >= 25 && bmi < 30) { totalMin = 15; totalMax = 25; }
      else if (bmi >= 30) { totalMin = 11; totalMax = 20; }
      const prog = Math.min(1, Math.max(0, (wks - 12) / 28));
      const expMin = wks <= 12 ? 2 : 2 + prog * (totalMin - 2);
      const expMax = wks <= 12 ? 5 : 5 + prog * (totalMax - 5);
      return {
        primaryValue: `${expMin.toFixed(1)} - ${expMax.toFixed(1)} lbs`,
        primaryLabel: `Expected Weight Gain at Week ${wks}`,
        secondaryOutputs: [
          { label: 'Total Recommended 40-Week Range', value: `${totalMin} - ${totalMax} lbs` },
        ],
        steps: [`Institute of Medicine guidelines tailored to pre-pregnancy BMI = ${bmi}`],
        formulaUsed: 'IOM Gestational Weight Guidelines',
      };
    },
  },
  {
    slug: 'keto-macro-calculator',
    title: 'Ketogenic Diet Macro Calculator',
    category: 'health-fitness',
    formulaDisplay: 'Fats (70-75%), Protein (20-25%), Net Carbs (< 5%)',
    inputs: [
      { id: 'calories', label: 'Daily Calorie Target (kcal)', defaultValue: 2000, type: 'number', step: 50, unit: 'kcal' },
    ],
    calculate: (v) => {
      const cal = Number(v.calories) || 2000;
      const fatG = (cal * 0.75) / 9;
      const proG = (cal * 0.20) / 4;
      const carbG = (cal * 0.05) / 4;
      return {
        primaryValue: `${Math.round(carbG)}g Carbs | ${Math.round(proG)}g Protein | ${Math.round(fatG)}g Fat`,
        primaryLabel: 'Keto Macro Targets',
        secondaryOutputs: [
          { label: 'Net Carbs Max (5%)', value: `${Math.round(carbG)}g` },
          { label: 'Moderate Protein (20%)', value: `${Math.round(proG)}g` },
          { label: 'Healthy Fats (75%)', value: `${Math.round(fatG)}g` },
        ],
        steps: [`Strict carbohydrate restriction below 50g/day to induce nutritional ketosis.`],
        formulaUsed: 'Ketogenic Macro Ratio (75/20/5)',
      };
    },
  },
  {
    slug: 'maximum-heart-rate-calculator',
    title: 'Maximum Heart Rate (MHR) Calculator',
    category: 'health-fitness',
    formulaDisplay: 'MHR = 208 - (0.7 × Age) (Tanaka Formula)',
    inputs: [
      { id: 'age', label: 'Age (Years)', defaultValue: 35, type: 'number', min: 10, max: 99, step: 1, unit: 'yrs' },
    ],
    calculate: (v) => {
      const a = Number(v.age) || 30;
      const tanaka = 208 - 0.7 * a;
      const traditional = 220 - a;
      return {
        primaryValue: Math.round(tanaka),
        primaryUnit: 'bpm',
        primaryLabel: 'Max Heart Rate (Tanaka Formula)',
        secondaryOutputs: [
          { label: 'Traditional Fox Formula (220 - Age)', value: `${traditional} bpm` },
          { label: 'Zone 5 VO2 Max Peak (90-100%)', value: `${Math.round(tanaka * 0.9)} - ${Math.round(tanaka)} bpm` },
        ],
        steps: [`Tanaka: 208 - (0.7 × ${a}) = ${tanaka.toFixed(1)} bpm`],
        formulaUsed: 'Tanaka, Monahan, & Seals MHR Meta-Analysis',
      };
    },
  },

  // SPORTS
  {
    slug: 'running-pace-calculator',
    title: 'Running Pace Calculator',
    category: 'sports',
    formulaDisplay: 'Pace = Time / Distance',
    inputs: [
      { id: 'distanceKm', label: 'Distance (Kilometers)', defaultValue: 10, type: 'number', min: 0.1, step: 0.5, unit: 'km' },
      { id: 'hours', label: 'Hours', defaultValue: 0, type: 'number', min: 0, step: 1 },
      { id: 'minutes', label: 'Minutes', defaultValue: 50, type: 'number', min: 0, max: 59, step: 1 },
      { id: 'seconds', label: 'Seconds', defaultValue: 0, type: 'number', min: 0, max: 59, step: 5 },
    ],
    calculate: (v) => {
      const d = Number(v.distanceKm) || 1;
      const totalSec = (Number(v.hours) || 0) * 3600 + (Number(v.minutes) || 0) * 60 + (Number(v.seconds) || 0);
      if (totalSec <= 0) return { primaryValue: 'Error', primaryLabel: 'Invalid Time', error: 'Time must be > 0.' };
      const secPerKm = totalSec / d;
      const minPerKm = Math.floor(secPerKm / 60);
      const remSecPerKm = Math.round(secPerKm % 60);
      const distMiles = d * 0.621371;
      const secPerMile = totalSec / distMiles;
      const minPerMile = Math.floor(secPerMile / 60);
      const remSecPerMile = Math.round(secPerMile % 60);
      const speedKmh = d / (totalSec / 3600);
      return {
        primaryValue: `${minPerKm}:${remSecPerKm.toString().padStart(2, '0')}`,
        primaryUnit: 'min / km',
        primaryLabel: 'Pace per Kilometer',
        secondaryOutputs: [
          { label: 'Pace per Mile', value: `${minPerMile}:${remSecPerMile.toString().padStart(2, '0')} / mi` },
          { label: 'Running Speed', value: `${speedKmh.toFixed(2)} km/h (${(speedKmh * 0.621371).toFixed(2)} mph)` },
        ],
        steps: [`Total time: ${totalSec} seconds for ${d} km.`],
        formulaUsed: 'Pace = Time / Distance',
      };
    },
  },
  {
    slug: 'cycling-power-calculator',
    title: 'Cycling Power (Watts) Estimator',
    category: 'sports',
    formulaDisplay: 'Power = P_rolling + P_gravity + P_aero',
    inputs: [
      { id: 'speedKmh', label: 'Speed (km/h)', defaultValue: 32, type: 'number', step: 1, unit: 'km/h' },
      { id: 'gradePct', label: 'Road Gradient (%)', defaultValue: 3, type: 'number', step: 0.5, unit: '%' },
      { id: 'riderWeight', label: 'Rider + Bike Weight (kg)', defaultValue: 82, type: 'number', step: 1, unit: 'kg' },
    ],
    calculate: (v) => {
      const vMs = (Number(v.speedKmh) || 20) / 3.6;
      const grade = (Number(v.gradePct) || 0) / 100;
      const m = Number(v.riderWeight) || 80;
      const g = 9.81;
      const crr = 0.005; // rolling resistance
      const cda = 0.32; // aerodynamic drag
      const rho = 1.225; // air density
      const fRoll = m * g * crr;
      const fGrav = m * g * grade;
      const fAero = 0.5 * cda * rho * vMs * vMs;
      const totalWatts = (fRoll + fGrav + fAero) * vMs;
      return {
        primaryValue: Math.round(totalWatts),
        primaryUnit: 'Watts',
        primaryLabel: 'Cycling Mechanical Power',
        secondaryOutputs: [
          { label: 'Power-to-Weight Ratio', value: `${(totalWatts / m).toFixed(2)} W/kg` },
          { label: 'Aerodynamic Drag Portion', value: `${Math.round(fAero * vMs)} W` },
          { label: 'Climbing Gravity Portion', value: `${Math.round(fGrav * vMs)} W` },
        ],
        steps: [`Sum of mechanical rolling, aerodynamic drag, and gravitational climbing resistances.`],
        formulaUsed: 'Cycling Physical Power Resistance Model',
      };
    },
  },
  {
    slug: 'swimming-pace-calculator',
    title: 'Swimming Pace (per 100m) Calculator',
    category: 'sports',
    formulaDisplay: 'Pace = (Time in Seconds / Total Meters) × 100',
    inputs: [
      { id: 'meters', label: 'Total Distance (Meters)', defaultValue: 1500, type: 'number', step: 100, unit: 'm' },
      { id: 'minutes', label: 'Total Time (Minutes)', defaultValue: 28, type: 'number', step: 1, unit: 'min' },
      { id: 'seconds', label: 'Total Time (Seconds)', defaultValue: 30, type: 'number', step: 1, unit: 'sec' },
    ],
    calculate: (v) => {
      const d = Number(v.meters) || 100;
      const totalSec = (Number(v.minutes) || 0) * 60 + (Number(v.seconds) || 0);
      const secPer100m = (totalSec / d) * 100;
      const m = Math.floor(secPer100m / 60);
      const s = Math.round(secPer100m % 60);
      return {
        primaryValue: `${m}:${s.toString().padStart(2, '0')}`,
        primaryUnit: '/ 100m',
        primaryLabel: 'Pace per 100 Meters',
        secondaryOutputs: [
          { label: 'Velocity', value: `${(d / totalSec).toFixed(2)} m/s` },
        ],
        steps: [`Total seconds: ${totalSec}s for ${d}m = ${secPer100m.toFixed(1)}s per 100m.`],
        formulaUsed: 'Pace = (Time / Distance) × 100',
      };
    },
  },
  {
    slug: 'baseball-calculator',
    title: 'Baseball ERA & Batting Average Calculator',
    category: 'sports',
    formulaDisplay: 'ERA = (Earned Runs × 9) / Innings Pitched',
    inputs: [
      { id: 'earnedRuns', label: 'Earned Runs (ER)', defaultValue: 18, type: 'number', step: 1 },
      { id: 'innings', label: 'Innings Pitched (IP)', defaultValue: 54, type: 'number', min: 1, step: 0.1 },
    ],
    calculate: (v) => {
      const er = Number(v.earnedRuns) || 0;
      const ip = Number(v.innings) || 1;
      const era = (er * 9) / ip;
      return {
        primaryValue: parseFloat(era.toFixed(2)),
        primaryLabel: 'Earned Run Average (ERA)',
        secondaryOutputs: [
          { label: 'Earned Runs Allowed', value: er },
          { label: 'Innings Pitched', value: ip },
        ],
        steps: [`ERA = (${er} × 9) / ${ip} = ${era.toFixed(2)}`],
        formulaUsed: 'MLB Standard ERA Formula',
      };
    },
  },
  {
    slug: 'golf-handicap-calculator',
    title: 'Golf Handicap Differential Calculator',
    category: 'sports',
    formulaDisplay: 'Score Differential = (113 / Slope Rating) × (Score - Course Rating)',
    inputs: [
      { id: 'score', label: 'Adjusted Gross Score', defaultValue: 82, type: 'number', step: 1 },
      { id: 'courseRating', label: 'Course Rating', defaultValue: 71.4, type: 'number', step: 0.1 },
      { id: 'slopeRating', label: 'Slope Rating (Standard: 113)', defaultValue: 125, type: 'number', min: 55, max: 155, step: 1 },
    ],
    calculate: (v) => {
      const score = Number(v.score) || 72;
      const cr = Number(v.courseRating) || 72;
      const slope = Number(v.slopeRating) || 113;
      const diff = (113 / slope) * (score - cr);
      return {
        primaryValue: parseFloat(diff.toFixed(1)),
        primaryLabel: 'Score Differential',
        secondaryOutputs: [
          { label: 'Strokes Over Course Rating', value: parseFloat((score - cr).toFixed(1)) },
        ],
        steps: [`Differential = (113 / ${slope}) × (${score} - ${cr}) = ${diff.toFixed(1)}`],
        formulaUsed: 'USGA World Handicap System (WHS) Differential',
      };
    },
  },
  {
    slug: 'basketball-true-shooting-calculator',
    title: 'Basketball True Shooting % (TS%) Calculator',
    category: 'sports',
    formulaDisplay: 'TS% = Points / [2 × (FGA + 0.44 × FTA)] × 100',
    inputs: [
      { id: 'points', label: 'Total Points Scored (PTS)', defaultValue: 28, type: 'number', step: 1 },
      { id: 'fga', label: 'Field Goal Attempts (FGA)', defaultValue: 18, type: 'number', step: 1 },
      { id: 'fta', label: 'Free Throw Attempts (FTA)', defaultValue: 8, type: 'number', step: 1 },
    ],
    calculate: (v) => {
      const pts = Number(v.points) || 0;
      const fga = Number(v.fga) || 1;
      const fta = Number(v.fta) || 0;
      const denom = 2 * (fga + 0.44 * fta);
      const ts = (pts / denom) * 100;
      return {
        primaryValue: parseFloat(ts.toFixed(1)),
        primaryUnit: '%',
        primaryLabel: 'True Shooting Percentage (TS%)',
        secondaryOutputs: [
          { label: 'Points per True Shot Attempt', value: (pts / (fga + 0.44 * fta)).toFixed(2) },
          { label: 'NBA Elite Benchmark', value: ts > 60 ? 'Elite Scoring Efficiency (> 60%)' : 'Standard Efficiency' },
        ],
        steps: [`TS% = ${pts} / [2 × (${fga} + 0.44 × ${fta})] × 100 = ${ts.toFixed(1)}%`],
        formulaUsed: 'NBA Advanced Analytics TS% Equation',
      };
    },
  },
  {
    slug: 'passer-rating-calculator',
    title: 'NFL Quarterback Passer Rating Calculator',
    category: 'sports',
    formulaDisplay: 'NFL Passer Rating Formula (Four Stat Components capped 0 to 2.375)',
    inputs: [
      { id: 'att', label: 'Pass Attempts (ATT)', defaultValue: 35, type: 'number', min: 1, step: 1 },
      { id: 'comp', label: 'Completions (CMP)', defaultValue: 24, type: 'number', step: 1 },
      { id: 'yds', label: 'Passing Yards (YDS)', defaultValue: 285, type: 'number', step: 5 },
      { id: 'td', label: 'Touchdowns (TD)', defaultValue: 3, type: 'number', step: 1 },
      { id: 'int', label: 'Interceptions (INT)', defaultValue: 1, type: 'number', step: 1 },
    ],
    calculate: (v) => {
      const att = Number(v.att) || 1;
      const cmp = Number(v.comp) || 0;
      const yds = Number(v.yds) || 0;
      const td = Number(v.td) || 0;
      const int = Number(v.int) || 0;
      const a = Math.max(0, Math.min(2.375, (cmp / att - 0.3) * 5));
      const b = Math.max(0, Math.min(2.375, (yds / att - 3) * 0.25));
      const c = Math.max(0, Math.min(2.375, (td / att) * 20));
      const d = Math.max(0, Math.min(2.375, 2.375 - (int / att) * 25));
      const rating = ((a + b + c + d) / 6) * 100;
      return {
        primaryValue: parseFloat(rating.toFixed(1)),
        primaryLabel: 'NFL Passer Rating',
        secondaryOutputs: [
          { label: 'Completion %', value: `${((cmp / att) * 100).toFixed(1)}%` },
          { label: 'Yards per Attempt', value: (yds / att).toFixed(1) },
          { label: 'Perfect Rating Cap', value: '158.3 maximum' },
        ],
        steps: [`Standard NFL 4-factor formula: ((a + b + c + d) / 6) × 100 = ${rating.toFixed(1)}`],
        formulaUsed: 'Official NFL Passer Rating System',
      };
    },
  },
  {
    slug: 'cricket-calculator',
    title: 'Cricket Net Run Rate (NRR) Calculator',
    category: 'sports',
    formulaDisplay: 'NRR = (Total Runs Scored / Total Overs Faced) - (Total Runs Conceded / Total Overs Bowled)',
    inputs: [
      { id: 'runsFor', label: 'Total Runs Scored', defaultValue: 320, type: 'number', step: 1 },
      { id: 'oversFor', label: 'Total Overs Faced', defaultValue: 50, type: 'number', min: 1, step: 1 },
      { id: 'runsAgainst', label: 'Total Runs Conceded', defaultValue: 280, type: 'number', step: 1 },
      { id: 'oversAgainst', label: 'Total Overs Bowled', defaultValue: 50, type: 'number', min: 1, step: 1 },
    ],
    calculate: (v) => {
      const rf = Number(v.runsFor) || 0;
      const of = Number(v.oversFor) || 1;
      const ra = Number(v.runsAgainst) || 0;
      const oa = Number(v.oversAgainst) || 1;
      const nrr = rf / of - ra / oa;
      return {
        primaryValue: (nrr >= 0 ? '+' : '') + nrr.toFixed(3),
        primaryLabel: 'Net Run Rate (NRR)',
        secondaryOutputs: [
          { label: 'Batting Run Rate', value: (rf / of).toFixed(3) },
          { label: 'Bowling Economy Run Rate', value: (ra / oa).toFixed(3) },
        ],
        steps: [`NRR = (${rf}/${of}) - (${ra}/${oa}) = ${nrr.toFixed(3)}`],
        formulaUsed: 'ICC Official Net Run Rate Calculation',
      };
    },
  },
  {
    slug: 'sport-calorie-calculator',
    title: 'Sport-Specific Calorie Burn Calculator',
    category: 'sports',
    formulaDisplay: 'Burn = Duration (hrs) × MET × Weight (kg)',
    inputs: [
      {
        id: 'sport',
        label: 'Sport Discipline',
        type: 'select',
        defaultValue: '8',
        options: [
          { label: 'Soccer / Football (MET 8.0)', value: '8.0' },
          { label: 'Basketball (MET 7.5)', value: '7.5' },
          { label: 'Tennis (MET 7.3)', value: '7.3' },
          { label: 'Boxing Sparring (MET 9.0)', value: '9.0' },
          { label: 'Martial Arts / Judo (MET 10.0)', value: '10.0' },
        ],
      },
      { id: 'weightKg', label: 'Body Weight (kg)', defaultValue: 75, type: 'number', step: 1, unit: 'kg' },
      { id: 'durationMin', label: 'Match / Session Duration (Minutes)', defaultValue: 60, type: 'number', step: 5, unit: 'min' },
    ],
    calculate: (v) => {
      const met = Number(v.sport) || 8.0;
      const w = Number(v.weightKg) || 70;
      const hrs = (Number(v.durationMin) || 60) / 60;
      const calories = met * w * hrs;
      return {
        primaryValue: Math.round(calories),
        primaryUnit: 'kcal',
        primaryLabel: 'Total Sports Energy Expended',
        secondaryOutputs: [
          { label: 'Average MET Intensity', value: met },
        ],
        steps: [`Burn = ${met} MET × ${w} kg × ${hrs.toFixed(1)} hrs = ${Math.round(calories)} kcal`],
        formulaUsed: 'Compendium of Sports MET Formula',
      };
    },
  },
  {
    slug: 'negative-splits-calculator',
    title: 'Negative Splits Running Strategy Calculator',
    category: 'sports',
    formulaDisplay: 'Second half run 2% - 3% faster than first half',
    inputs: [
      { id: 'totalDistance', label: 'Total Race Distance (km)', defaultValue: 42.195, type: 'number', step: 1, unit: 'km' },
      { id: 'targetTimeMin', label: 'Target Total Time (Minutes)', defaultValue: 210, type: 'number', step: 5, unit: 'min' },
      { id: 'splitDiffPct', label: 'Negative Split Delta (%)', defaultValue: 2.5, type: 'number', step: 0.5, unit: '%' },
    ],
    calculate: (v) => {
      const d = Number(v.totalDistance) || 10;
      const halfD = d / 2;
      const totalMin = Number(v.targetTimeMin) || 60;
      const delta = (Number(v.splitDiffPct) || 2) / 100;
      // firstHalf = x, secondHalf = x * (1 - delta)
      // x + x(1 - delta) = totalMin -> x(2 - delta) = totalMin
      const firstHalfMin = totalMin / (2 - delta);
      const secondHalfMin = totalMin - firstHalfMin;
      const pace1 = firstHalfMin / halfD;
      const pace2 = secondHalfMin / halfD;
      const formatPace = (p: number) => `${Math.floor(p)}:${Math.round((p % 1) * 60).toString().padStart(2, '0')}/km`;
      return {
        primaryValue: `1st Half: ${formatPace(pace1)} | 2nd Half: ${formatPace(pace2)}`,
        primaryLabel: 'Pace Strategy Plan',
        secondaryOutputs: [
          { label: 'First Half Time', value: `${firstHalfMin.toFixed(1)} min` },
          { label: 'Second Half Time', value: `${secondHalfMin.toFixed(1)} min` },
        ],
        steps: [`Paced to finish second half ${delta * 100}% faster, conserving glycogen reserves.`],
        formulaUsed: 'Marathon Negative Split Energy Pacing',
      };
    },
  },
];
