import { CalculatorSpec } from './types';
import { parseNum, calcError } from './validation';

const fmt = (n: number, d = 2): number => {
  if (!Number.isFinite(n)) return 0;
  const rounded = Number(n.toFixed(d));
  return Object.is(rounded, -0) ? 0 : rounded;
};

const formatDurationHms = (totalSeconds: number): string => {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return '0:00';
  const rounded = Math.round(totalSeconds);
  const hrs = Math.floor(rounded / 3600);
  const mins = Math.floor((rounded % 3600) / 60);
  const secs = rounded % 60;
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${mins}:${String(secs).padStart(2, '0')}`;
};

const formatPaceMmSs = (secPerUnit: number): string => {
  if (!Number.isFinite(secPerUnit) || secPerUnit <= 0) return '0:00';
  const r = Math.round(secPerUnit);
  const m = Math.floor(r / 60);
  const s = r % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

const format12h = (totalMinutes: number): string => {
  const m = ((Math.round(totalMinutes) % 1440) + 1440) % 1440;
  const h24 = Math.floor(m / 60);
  const min = m % 60;
  const period = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(min).padStart(2, '0')} ${period}`;
};

export const batch3HealthSpecs: CalculatorSpec[] = [
  // 526. Corrected Calcium Calculator (Payne Equation: US mg/dL & SI mmol/L)
  {
    slug: 'corrected-calcium-calculator',
    title: 'Corrected Calcium Calculator (Payne)',
    category: 'health-fitness',
    formulaDisplay: 'US: Ca_corr = Ca_meas + 0.8 × (4.0 − Alb g/dL)  |  SI: Ca_corr = Ca_meas + 0.02 × (40 − Alb g/L)',
    inputs: [
      {
        id: 'unitSystem',
        label: 'Laboratory Unit Standard',
        type: 'select',
        defaultValue: 'us',
        options: [
          { label: 'US Conventional (mg/dL Calcium, g/dL Albumin)', value: 'us' },
          { label: 'UK / CA / AU / NZ SI (mmol/L Calcium, g/L Albumin)', value: 'si' },
        ],
      },
      {
        id: 'measuredCaUs',
        label: 'Measured Serum Calcium',
        defaultValue: 7.8,
        type: 'number',
        min: 1,
        max: 25,
        step: 0.1,
        unit: 'mg/dL',
        visibleWhen: (v) => String(v.unitSystem || 'us') === 'us',
      },
      {
        id: 'albuminUs',
        label: 'Serum Albumin Level',
        defaultValue: 2.5,
        type: 'number',
        min: 0.5,
        max: 7,
        step: 0.1,
        unit: 'g/dL',
        helpText: 'Normal adult reference albumin is typically 4.0 g/dL (40 g/L).',
        visibleWhen: (v) => String(v.unitSystem || 'us') === 'us',
      },
      {
        id: 'measuredCaSi',
        label: 'Measured Serum Calcium',
        defaultValue: 1.95,
        type: 'number',
        min: 0.2,
        max: 6.5,
        step: 0.05,
        unit: 'mmol/L',
        visibleWhen: (v) => String(v.unitSystem || 'us') === 'si',
      },
      {
        id: 'albuminSi',
        label: 'Serum Albumin Level',
        defaultValue: 25,
        type: 'number',
        min: 5,
        max: 70,
        step: 1,
        unit: 'g/L',
        visibleWhen: (v) => String(v.unitSystem || 'us') === 'si',
      },
      {
        id: 'normalAlbuminUs',
        label: 'Reference Normal Albumin Override (g/dL)',
        defaultValue: 4.0,
        type: 'number',
        min: 3.0,
        max: 5.0,
        step: 0.1,
        unit: 'g/dL',
        advanced: true,
      },
    ],
    calculate: (v) => {
      const mode = String(v.unitSystem || 'us');
      const refAlbUs = v.normalAlbuminUs === undefined ? 4.0 : parseNum(v.normalAlbuminUs);
      if (isNaN(refAlbUs) || refAlbUs < 2.5 || refAlbUs > 5.5) {
        return calcError('Reference albumin override must be between 2.5 and 5.5 g/dL.');
      }

      let measMgDl = 0;
      let albGDl = 0;

      if (mode === 'si') {
        const caSi = parseNum(v.measuredCaSi);
        const albSi = parseNum(v.albuminSi);
        if (isNaN(caSi) || isNaN(albSi) || caSi <= 0 || caSi > 10 || albSi <= 0 || albSi > 80) {
          return calcError('Enter valid SI calcium (0.1–10 mmol/L) and albumin (1–80 g/L).');
        }
        measMgDl = caSi * 4.008; // 1 mmol/L Ca = 4.008 mg/dL
        albGDl = albSi / 10;
      } else {
        measMgDl = parseNum(v.measuredCaUs);
        albGDl = parseNum(v.albuminUs);
        if (isNaN(measMgDl) || isNaN(albGDl) || measMgDl <= 0 || measMgDl > 30 || albGDl <= 0 || albGDl > 8) {
          return calcError('Enter valid serum calcium (0.1–30 mg/dL) and albumin (0.1–8.0 g/dL).');
        }
      }

      const deltaMgDl = 0.8 * (refAlbUs - albGDl);
      const corrMgDl = measMgDl + deltaMgDl;
      const corrMmolL = corrMgDl / 4.008;
      const measMmolL = measMgDl / 4.008;
      const estIonizedMmol = corrMmolL * 0.5; // ~50% free ionized fraction approximation

      let status = 'Normocalcemia (8.5–10.5 mg/dL)';
      if (corrMgDl < 8.5) status = 'Hypocalcemia (< 8.5 mg/dL / < 2.12 mmol/L)';
      else if (corrMgDl > 12.0) status = 'Severe Hypercalcemia Risk (> 12.0 mg/dL)';
      else if (corrMgDl > 10.5) status = 'Hypercalcemia (> 10.5 mg/dL / > 2.62 mmol/L)';

      return {
        primaryValue: mode === 'si' ? fmt(corrMmolL, 2) : fmt(corrMgDl, 2),
        primaryUnit: mode === 'si' ? 'mmol/L Corrected Calcium (Payne)' : 'mg/dL Corrected Calcium (Payne)',
        secondaryOutputs: [
          { label: mode === 'si' ? 'Corrected Calcium (US mg/dL)' : 'Corrected Calcium (SI mmol/L)', value: mode === 'si' ? fmt(corrMgDl, 2) : fmt(corrMmolL, 2), unit: mode === 'si' ? 'mg/dL' : 'mmol/L' },
          { label: 'Albumin Adjustment Applied', value: `${deltaMgDl >= 0 ? '+' : ''}${fmt(mode === 'si' ? deltaMgDl / 4.008 : deltaMgDl, 2)}`, unit: mode === 'si' ? 'mmol/L' : 'mg/dL' },
          { label: 'Measured Calcium (Both Units)', value: `${fmt(measMgDl, 2)} mg/dL`, unit: `(${fmt(measMmolL, 2)} mmol/L)` },
          { label: 'Clinical Reference Category', value: status },
          { label: 'Est. Free Ionized Fraction (~50%)', value: fmt(estIonizedMmol, 2), unit: 'mmol/L' },
        ],
        steps: [
          `Inputs normalized: Measured Ca = ${fmt(measMgDl, 2)} mg/dL (${fmt(measMmolL, 2)} mmol/L); Albumin = ${fmt(albGDl, 2)} g/dL (${fmt(albGDl * 10, 0)} g/L).`,
          `Payne Correction: 0.8 × (${fmt(refAlbUs, 1)} − ${fmt(albGDl, 2)}) = ${deltaMgDl >= 0 ? '+' : ''}${fmt(deltaMgDl, 2)} mg/dL (${fmt(deltaMgDl / 4.008, 2)} mmol/L).`,
          `Albumin-Corrected Total Calcium = ${fmt(corrMgDl, 2)} mg/dL (${fmt(corrMmolL, 2)} mmol/L) → ${status}. Note: Confirm directly with ionized calcium in critical care or severe CKD.`,
        ],
      };
    },
  },

  // 527. eGFR (CKD-EPI 2021) & Cockcroft-Gault Creatinine Clearance Calculator
  {
    slug: 'egfr-creatinine-clearance-calculator',
    title: 'eGFR (CKD-EPI 2021) & CrCl Calculator',
    category: 'health-fitness',
    formulaDisplay: 'CKD-EPI 2021: 142 × min(Scr/κ,1)^α × max(Scr/κ,1)^−1.200 × 0.9938^Age (×1.012 if Female)',
    inputs: [
      {
        id: 'sex',
        label: 'Biological Sex',
        type: 'select',
        defaultValue: 'female',
        options: [
          { label: 'Female', value: 'female' },
          { label: 'Male', value: 'male' },
        ],
      },
      { id: 'age', label: 'Patient Age', defaultValue: 58, type: 'number', min: 18, max: 120, step: 1, unit: 'yrs' },
      {
        id: 'crUnit',
        label: 'Serum Creatinine Units',
        type: 'select',
        defaultValue: 'mgdl',
        options: [
          { label: 'US Standard (mg/dL)', value: 'mgdl' },
          { label: 'International SI (µmol/L)', value: 'umol' },
        ],
      },
      {
        id: 'creatinineMgDl',
        label: 'Serum Creatinine (SCr)',
        defaultValue: 1.15,
        type: 'number',
        min: 0.1,
        max: 25,
        step: 0.05,
        unit: 'mg/dL',
        visibleWhen: (v) => String(v.crUnit || 'mgdl') === 'mgdl',
      },
      {
        id: 'creatinineUmol',
        label: 'Serum Creatinine (SCr)',
        defaultValue: 102,
        type: 'number',
        min: 10,
        max: 2500,
        step: 2,
        unit: 'µmol/L',
        visibleWhen: (v) => String(v.crUnit || 'mgdl') === 'umol',
      },
      { id: 'weightKg', label: 'Actual Body Weight (for Cockcroft-Gault)', defaultValue: 72, type: 'number', min: 25, max: 300, step: 1, unit: 'kg', advanced: true },
      { id: 'heightCm', label: 'Height (for IBW Dosing Check)', defaultValue: 168, type: 'number', min: 100, max: 250, step: 1, unit: 'cm', advanced: true },
    ],
    calculate: (v) => {
      const sex = String(v.sex || 'female');
      const age = parseNum(v.age);
      const unit = String(v.crUnit || 'mgdl');
      const wt = v.weightKg === undefined ? 72 : parseNum(v.weightKg);
      const ht = v.heightCm === undefined ? 168 : parseNum(v.heightCm);

      let scr = unit === 'umol' ? parseNum(v.creatinineUmol) / 88.42 : parseNum(v.creatinineMgDl);

      if ([age, scr, wt, ht].some(isNaN) || age < 18 || age > 120 || scr <= 0 || scr > 30 || wt <= 0 || ht <= 0) {
        return calcError('Age must be 18–120 years, serum creatinine positive (≤30 mg/dL), and weight/height positive.');
      }

      // 2021 Race-Free CKD-EPI Creatinine Equation (Inker et al., NEJM 2021)
      const kappa = sex === 'female' ? 0.7 : 0.9;
      const alpha = sex === 'female' ? -0.241 : -0.302;
      const sexFactor = sex === 'female' ? 1.012 : 1.0;

      const ratio = scr / kappa;
      const egfr =
        142 *
        Math.pow(Math.min(ratio, 1), alpha) *
        Math.pow(Math.max(ratio, 1), -1.2) *
        Math.pow(0.9938, age) *
        sexFactor;

      // Cockcroft-Gault CrCl (Actual weight vs Ideal/Adjusted dosing weight)
      const htIn = ht / 2.54;
      const ibw = (sex === 'female' ? 45.5 : 50.0) + 2.3 * Math.max(0, htIn - 60);
      const cgSexMult = sex === 'female' ? 0.85 : 1.0;
      const cgActual = (((140 - age) * wt) / (72 * scr)) * cgSexMult;
      const dosingWt = wt < ibw ? wt : wt > ibw * 1.2 ? ibw + 0.4 * (wt - ibw) : ibw;
      const cgDosing = (((140 - age) * dosingWt) / (72 * scr)) * cgSexMult;

      let stage = 'G1 — Normal or High (≥ 90)';
      if (egfr < 15) stage = 'G5 — Kidney Failure (< 15)';
      else if (egfr < 30) stage = 'G4 — Severely Decreased (15–29)';
      else if (egfr < 45) stage = 'G3b — Moderately to Severely Decreased (30–44)';
      else if (egfr < 60) stage = 'G3a — Mildly to Moderately Decreased (45–59)';
      else if (egfr < 90) stage = 'G2 — Mildly Decreased (60–89)';

      return {
        primaryValue: fmt(egfr, 1),
        primaryUnit: 'mL/min/1.73m² (2021 Race-Free CKD-EPI)',
        secondaryOutputs: [
          { label: 'KDIGO GFR Category', value: stage },
          { label: 'Cockcroft-Gault CrCl (Dosing Wt)', value: fmt(cgDosing, 1), unit: 'mL/min' },
          { label: 'Cockcroft-Gault CrCl (Actual Wt)', value: fmt(cgActual, 1), unit: 'mL/min' },
          { label: 'Devine Ideal Body Weight (IBW)', value: fmt(ibw, 1), unit: 'kg' },
          { label: 'SCr Normalized Value', value: fmt(scr, 2), unit: `mg/dL (${fmt(scr * 88.42, 0)} µmol/L)` },
        ],
        steps: [
          `2021 CKD-EPI (${sex}, age ${age}, SCr = ${fmt(scr, 2)} mg/dL): κ=${kappa}, α=${alpha}, factor=${sexFactor} → eGFR = ${fmt(egfr, 1)} mL/min/1.73m² (${stage}).`,
          `Cockcroft-Gault for drug dosing: IBW = ${fmt(ibw, 1)} kg (dosing weight ${fmt(dosingWt, 1)} kg) → CrCl = ${fmt(cgDosing, 1)} mL/min (${fmt(cgActual, 1)} mL/min using actual ${wt} kg).`,
        ],
      };
    },
  },

  // 528. Race Time Predictor (Riegel Fatigue & Cameron Model)
  {
    slug: 'race-time-predictor-calculator',
    title: 'Race Time Predictor Calculator (Riegel)',
    category: 'health-fitness',
    formulaDisplay: 'Riegel: T₂ = T₁ × (D₂ ÷ D₁)^k  (Default k = 1.06)',
    inputs: [
      {
        id: 'knownDistanceKm',
        label: 'Recent Race Distance',
        type: 'select',
        defaultValue: '10',
        options: [
          { label: '5K (5.0 km / 3.11 mi)', value: '5' },
          { label: '10K (10.0 km / 6.21 mi)', value: '10' },
          { label: '15K (15.0 km / 9.32 mi)', value: '15' },
          { label: '10 Mile (16.093 km)', value: '16.0934' },
          { label: 'Half Marathon (21.0975 km)', value: '21.0975' },
          { label: 'Marathon (42.195 km)', value: '42.195' },
        ],
      },
      { id: 'hours', label: 'Finish Hours', defaultValue: 0, type: 'number', min: 0, max: 24, step: 1, unit: 'hr' },
      { id: 'minutes', label: 'Finish Minutes', defaultValue: 48, type: 'number', min: 0, max: 59, step: 1, unit: 'min' },
      { id: 'seconds', label: 'Finish Seconds', defaultValue: 30, type: 'number', min: 0, max: 59, step: 1, unit: 'sec' },
      {
        id: 'targetDistanceKm',
        label: 'Target Goal Race Distance',
        type: 'select',
        defaultValue: '42.195',
        options: [
          { label: '5K (5.0 km)', value: '5' },
          { label: '10K (10.0 km)', value: '10' },
          { label: 'Half Marathon (21.1 km / 13.1 mi)', value: '21.0975' },
          { label: 'Marathon (42.2 km / 26.2 mi)', value: '42.195' },
          { label: '50K Ultra (50.0 km)', value: '50' },
        ],
      },
      {
        id: 'fatigueExponent',
        label: 'Riegel Fatigue Exponent (k)',
        defaultValue: 1.06,
        type: 'number',
        min: 1.02,
        max: 1.15,
        step: 0.01,
        advanced: true,
        helpText: '1.06 standard; 1.04 high-mileage aerobic endurance runners; 1.08 lower mileage.',
      },
    ],
    calculate: (v) => {
      const d1 = parseNum(v.knownDistanceKm);
      const hrs = parseNum(v.hours);
      const mins = parseNum(v.minutes);
      const secs = parseNum(v.seconds);
      const d2 = parseNum(v.targetDistanceKm);
      const exp = v.fatigueExponent === undefined ? 1.06 : parseNum(v.fatigueExponent);

      if ([d1, hrs, mins, secs, d2, exp].some(isNaN) || d1 <= 0 || d2 <= 0 || hrs < 0 || mins < 0 || secs < 0 || exp < 1 || exp > 1.25) {
        return calcError('Enter valid positive race distances, non-negative finish clock time, and fatigue exponent (1.00–1.25).');
      }

      const t1Sec = hrs * 3600 + mins * 60 + secs;
      if (t1Sec < 60) {
        return calcError('Known race finish time must be at least 60 seconds.');
      }

      const riegelPred = (targetKm: number) => t1Sec * Math.pow(targetKm / d1, exp);

      // Dave Cameron endurance model (distances in miles)
      const d1Mi = d1 / 1.609344;
      const d2Mi = d2 / 1.609344;
      const cameronFactor = (m: number) => 13.49681 - 0.048865 * m + 2.438936 / Math.pow(m, 0.7905);
      const t2Cameron = t1Sec * (d2Mi / d1Mi) * (cameronFactor(d1Mi) / cameronFactor(d2Mi));

      const t2Riegel = riegelPred(d2);
      const targetPaceKm = t2Riegel / d2;
      const targetPaceMi = t2Riegel / d2Mi;
      const avgSpeedKmh = (d2 / t2Riegel) * 3600;

      return {
        primaryValue: formatDurationHms(t2Riegel),
        primaryUnit: `Predicted Finish Time (Pace ${formatPaceMmSs(targetPaceKm)}/km · ${formatPaceMmSs(targetPaceMi)}/mi)`,
        secondaryOutputs: [
          { label: 'Required Race Pace (/km)', value: `${formatPaceMmSs(targetPaceKm)} /km` },
          { label: 'Required Race Pace (/mi)', value: `${formatPaceMmSs(targetPaceMi)} /mi` },
          { label: 'Cameron Model Estimate', value: formatDurationHms(t2Cameron) },
          { label: 'Predicted 5K Equivalent', value: formatDurationHms(riegelPred(5)) },
          { label: 'Predicted 10K Equivalent', value: formatDurationHms(riegelPred(10)) },
          { label: 'Predicted Half Marathon', value: formatDurationHms(riegelPred(21.0975)) },
          { label: 'Predicted Marathon (26.2m)', value: formatDurationHms(riegelPred(42.195)) },
          { label: 'Target Average Speed', value: fmt(avgSpeedKmh, 2), unit: 'km/h' },
        ],
        steps: [
          `Input Race: ${fmt(d1, 2)} km completed in ${formatDurationHms(t1Sec)} (${formatPaceMmSs(t1Sec / d1)}/km).`,
          `Riegel Equation: ${t1Sec}s × (${fmt(d2, 3)} ÷ ${fmt(d1, 3)})^${exp} = ${Math.round(t2Riegel)}s → ${formatDurationHms(t2Riegel)}.`,
          `Dave Cameron secondary check yields ${formatDurationHms(t2Cameron)}; target speed = ${fmt(avgSpeedKmh, 2)} km/h.`,
        ],
      };
    },
  },

  // 529. VO2 Max & Cardiovascular Fitness Estimator
  {
    slug: 'vo2-max-calculator',
    title: 'VO2 Max & Aerobic Fitness Calculator',
    category: 'health-fitness',
    formulaDisplay: 'Cooper: (Dist_m − 504.9) ÷ 44.73  |  Uth HR: 15.3 × (HR_max ÷ HR_rest)',
    inputs: [
      {
        id: 'protocol',
        label: 'Validated Testing Protocol',
        type: 'select',
        defaultValue: 'cooper',
        options: [
          { label: 'Cooper 12-Minute Run Test (Distance)', value: 'cooper' },
          { label: 'Rockport 1-Mile Fitness Walk Test', value: 'rockport' },
          { label: 'Uth–Sørensen Heart Rate Ratio (Resting HR)', value: 'uth' },
        ],
      },
      {
        id: 'cooperDistMeters',
        label: '12-Minute Run Distance Covered',
        defaultValue: 2650,
        type: 'number',
        min: 600,
        max: 5000,
        step: 50,
        unit: 'm',
        visibleWhen: (v) => String(v.protocol || 'cooper') === 'cooper',
      },
      {
        id: 'walkMinutes',
        label: '1-Mile Walk Time (Minutes)',
        defaultValue: 14.5,
        type: 'number',
        min: 6,
        max: 40,
        step: 0.25,
        unit: 'min',
        visibleWhen: (v) => String(v.protocol || 'cooper') === 'rockport',
      },
      {
        id: 'walkEndHr',
        label: 'Heart Rate Immediately at 1-Mile Finish',
        defaultValue: 132,
        type: 'number',
        min: 60,
        max: 220,
        step: 2,
        unit: 'bpm',
        visibleWhen: (v) => String(v.protocol || 'cooper') === 'rockport',
      },
      {
        id: 'weightLb',
        label: 'Body Weight (for Rockport Equation)',
        defaultValue: 165,
        type: 'number',
        min: 70,
        max: 500,
        step: 1,
        unit: 'lb',
        visibleWhen: (v) => String(v.protocol || 'cooper') === 'rockport',
      },
      {
        id: 'restingHr',
        label: 'True Morning Resting Heart Rate',
        defaultValue: 56,
        type: 'number',
        min: 30,
        max: 120,
        step: 1,
        unit: 'bpm',
        visibleWhen: (v) => String(v.protocol || 'cooper') === 'uth',
      },
      { id: 'age', label: 'Age', defaultValue: 32, type: 'number', min: 15, max: 95, step: 1, unit: 'yrs' },
      {
        id: 'sex',
        label: 'Biological Sex (ACSM Norms)',
        type: 'select',
        defaultValue: 'male',
        options: [
          { label: 'Male', value: 'male' },
          { label: 'Female', value: 'female' },
        ],
      },
    ],
    calculate: (v) => {
      const prot = String(v.protocol || 'cooper');
      const age = parseNum(v.age);
      const sex = String(v.sex || 'male');

      if (isNaN(age) || age < 15 || age > 100) {
        return calcError('Age must be between 15 and 100 years.');
      }

      let vo2 = 0;
      let detailStep = '';

      if (prot === 'cooper') {
        const d = parseNum(v.cooperDistMeters);
        if (isNaN(d) || d <= 510 || d > 6000) {
          return calcError('Cooper 12-minute distance must be between 520 and 6,000 meters.');
        }
        vo2 = (d - 504.9) / 44.73;
        detailStep = `Cooper 12-Min Test: (${d} m − 504.9) ÷ 44.73 = ${fmt(vo2, 2)} mL/kg/min.`;
      } else if (prot === 'rockport') {
        const t = parseNum(v.walkMinutes);
        const hr = parseNum(v.walkEndHr);
        const wtLb = parseNum(v.weightLb);
        if ([t, hr, wtLb].some(isNaN) || t <= 4 || hr < 50 || hr > 230 || wtLb < 50) {
          return calcError('Enter valid Rockport 1-mile walk time (>4 min), ending HR (50–230 bpm), and weight.');
        }
        const g = sex === 'male' ? 1 : 0;
        vo2 = 132.853 - 0.0769 * wtLb - 0.3877 * age + 6.315 * g - 3.2649 * t - 0.1565 * hr;
        detailStep = `Rockport 1-Mile Equation (${wtLb} lb, age ${age}, ${t} min, ${hr} bpm) = ${fmt(vo2, 2)} mL/kg/min.`;
      } else {
        const rhr = parseNum(v.restingHr);
        if (isNaN(rhr) || rhr < 28 || rhr > 130) {
          return calcError('Resting heart rate must be between 28 and 130 bpm.');
        }
        const tanakaMax = 208 - 0.7 * age;
        vo2 = 15.3 * (tanakaMax / rhr);
        detailStep = `Uth–Sørensen HR Ratio using Tanaka Max HR (${fmt(tanakaMax, 1)} bpm ÷ ${rhr} bpm × 15.3) = ${fmt(vo2, 2)} mL/kg/min.`;
      }

      vo2 = Math.max(10, vo2);
      const mets = vo2 / 3.5;

      // Simplified ACSM Fitness Category Band (age-adjusted roughly by 0.25/yr past 30)
      const adj = (age - 30) * 0.22;
      const baseCut = sex === 'male' ? [52, 46, 40, 34] : [45, 39, 34, 28];
      let tier = 'Poor / Needs Conditioning';
      if (vo2 >= baseCut[0] - adj) tier = 'Superior (Top ~10%)';
      else if (vo2 >= baseCut[1] - adj) tier = 'Excellent';
      else if (vo2 >= baseCut[2] - adj) tier = 'Good / Healthy Aerobic Base';
      else if (vo2 >= baseCut[3] - adj) tier = 'Fair';

      return {
        primaryValue: fmt(vo2, 1),
        primaryUnit: 'mL/kg/min Estimated VO2 Max',
        secondaryOutputs: [
          { label: 'ACSM Aerobic Fitness Tier', value: tier },
          { label: 'Peak Aerobic Capacity (METs)', value: fmt(mets, 2), unit: 'METs' },
          { label: 'Est. Maximal Heart Rate (Tanaka)', value: fmt(208 - 0.7 * age, 0), unit: 'bpm' },
          { label: 'Target Zone 2 Training Floor', value: '60–70%', unit: 'HRR / Easy Pace' },
        ],
        steps: [
          detailStep,
          `Peak Metabolic Equivalents (METs) = ${fmt(vo2, 1)} ÷ 3.5 = ${fmt(mets, 2)} METs.`,
          `ACSM age/sex benchmark classification (${sex}, age ${age}): ${tier}.`,
        ],
      };
    },
  },

  // 530. Blood Alcohol Content (BAC) & Widmark Elimination Calculator
  {
    slug: 'bac-calculator',
    title: 'Blood Alcohol Content (BAC) Calculator',
    category: 'health-fitness',
    formulaDisplay: 'Widmark: BAC% = [(Alcohol_g ÷ (Weight_g × r)) × 100] − (0.015 × Hours)',
    inputs: [
      {
        id: 'sex',
        label: 'Biological Sex (Widmark r Factor)',
        type: 'select',
        defaultValue: 'male',
        options: [
          { label: 'Male (r = 0.68 Average Body Water)', value: 'male' },
          { label: 'Female (r = 0.55 Average Body Water)', value: 'female' },
        ],
      },
      {
        id: 'weightUnit',
        label: 'Weight Units',
        type: 'select',
        defaultValue: 'lb',
        options: [
          { label: 'Pounds (lb)', value: 'lb' },
          { label: 'Kilograms (kg)', value: 'kg' },
        ],
      },
      {
        id: 'weightVal',
        label: 'Body Weight',
        defaultValue: 175,
        type: 'number',
        min: 60,
        max: 600,
        step: 5,
        unit: 'wt',
      },
      {
        id: 'drinkStandard',
        label: 'Standard Drink Definition',
        type: 'select',
        defaultValue: 'us',
        options: [
          { label: 'US Standard Drink (14g pure ethanol)', value: 'us' },
          { label: 'Australia / NZ Standard (10g pure ethanol)', value: 'au' },
          { label: 'UK Alcohol Unit (8g pure ethanol)', value: 'uk' },
        ],
      },
      { id: 'standardDrinks', label: 'Number of Standard Drinks Consumed', defaultValue: 3, type: 'number', min: 0, max: 30, step: 0.5, unit: 'drinks' },
      { id: 'hoursElapsed', label: 'Hours Since First Drink', defaultValue: 2.0, type: 'number', min: 0, max: 48, step: 0.25, unit: 'hrs' },
      { id: 'eliminationRate', label: 'Metabolic Clearance Rate (%/hr)', defaultValue: 0.015, type: 'number', min: 0.008, max: 0.025, step: 0.001, advanced: true, helpText: 'Average human hepatic clearance is ~0.015% per hour (range 0.010%–0.020%).' },
    ],
    calculate: (v) => {
      const sex = String(v.sex || 'male');
      const wUnit = String(v.weightUnit || 'lb');
      const wVal = parseNum(v.weightVal);
      const dStd = String(v.drinkStandard || 'us');
      const drinks = parseNum(v.standardDrinks);
      const hrs = parseNum(v.hoursElapsed);
      const beta = v.eliminationRate === undefined ? 0.015 : parseNum(v.eliminationRate);

      if ([wVal, drinks, hrs, beta].some(isNaN) || wVal <= 0 || drinks < 0 || hrs < 0 || beta <= 0) {
        return calcError('Body weight must be positive; drinks and elapsed hours cannot be negative.');
      }

      const wtKg = wUnit === 'lb' ? wVal * 0.45359237 : wVal;
      if (wtKg < 25 || wtKg > 350) {
        return calcError('Normalized body weight must be between 25 kg and 350 kg.');
      }

      const gramsPerDrink = dStd === 'uk' ? 8 : dStd === 'au' ? 10 : 14;
      const totalAlcoholGrams = drinks * gramsPerDrink;
      const r = sex === 'female' ? 0.55 : 0.68;

      const peakBacNoMetabolism = (totalAlcoholGrams / (wtKg * 1000 * r)) * 100;
      const currentBac = Math.max(0, peakBacNoMetabolism - beta * hrs);
      const hoursToZero = currentBac / beta;
      const mgPer100mL = currentBac * 1000; // UK/CA/AU scale (0.05% = 50 mg/100mL)

      let legalNote = 'Below 0.05% & 0.08% Thresholds';
      if (currentBac >= 0.08) legalNote = 'Exceeds 0.08% US/CA/UK Limit (Impaired)';
      else if (currentBac >= 0.05) legalNote = 'Exceeds 0.05% AU/NZ/Scotland Limit';
      else if (currentBac > 0.02) legalNote = 'Exceeds Commercial / Zero-Tolerance 0.02%';

      return {
        primaryValue: fmt(currentBac, 3),
        primaryUnit: `% Estimated Current BAC (${fmt(mgPer100mL, 0)} mg/100mL)`,
        secondaryOutputs: [
          { label: 'Theoretical Unmetabolized Peak', value: fmt(peakBacNoMetabolism, 3), unit: '%' },
          { label: 'Total Pure Alcohol Consumed', value: fmt(totalAlcoholGrams, 1), unit: 'grams' },
          { label: 'Estimated Time Remaining to 0.00%', value: fmt(hoursToZero, 1), unit: 'hours' },
          { label: 'Legal Driving Threshold Check', value: legalNote },
          { label: 'Notice', value: 'Educational estimate only — NEVER drive after drinking.' },
        ],
        steps: [
          `Total Pure Ethanol = ${drinks} ${dStd.toUpperCase()} drinks × ${gramsPerDrink} g = ${fmt(totalAlcoholGrams, 1)} g; Weight = ${fmt(wtKg, 1)} kg (r = ${r}).`,
          `Gross Peak BAC = [${fmt(totalAlcoholGrams, 1)} ÷ (${fmt(wtKg * 1000, 0)} × ${r})] × 100 = ${fmt(peakBacNoMetabolism, 3)}%.`,
          `Subtracting ${hrs} hrs × ${beta}%/hr clearance (${fmt(beta * hrs, 3)}%) yields Current BAC ≈ ${fmt(currentBac, 3)}% (${fmt(hoursToZero, 1)} hrs to 0.00%).`,
        ],
      };
    },
  },

  // 531. Waist-to-Height Ratio (WHtR) & Central Obesity Health Risk Calculator
  {
    slug: 'waist-to-height-ratio-calculator',
    title: 'Waist-to-Height & Central Risk Calculator',
    category: 'health-fitness',
    formulaDisplay: 'WHtR = Waist ÷ Height (NICE Target < 0.50)  |  WHR = Waist ÷ Hip',
    inputs: [
      {
        id: 'unitSystem',
        label: 'Measurement Units',
        type: 'select',
        defaultValue: 'imperial',
        options: [
          { label: 'Imperial (Inches)', value: 'imperial' },
          { label: 'Metric (Centimeters)', value: 'metric' },
        ],
      },
      { id: 'waist', label: 'Waist Circumference (at Navel)', defaultValue: 34, type: 'number', min: 15, max: 250, step: 0.5, unit: 'in/cm' },
      { id: 'hip', label: 'Hip Circumference (Widest Point)', defaultValue: 40, type: 'number', min: 20, max: 260, step: 0.5, unit: 'in/cm' },
      { id: 'height', label: 'Standing Height', defaultValue: 70, type: 'number', min: 36, max: 250, step: 0.5, unit: 'in/cm' },
      {
        id: 'sex',
        label: 'Biological Sex (WHO WHR Thresholds)',
        type: 'select',
        defaultValue: 'male',
        options: [
          { label: 'Male (WHO WHR Cutoff ≤ 0.90)', value: 'male' },
          { label: 'Female (WHO WHR Cutoff ≤ 0.85)', value: 'female' },
        ],
      },
    ],
    calculate: (v) => {
      const unit = String(v.unitSystem || 'imperial');
      const waist = parseNum(v.waist);
      const hip = parseNum(v.hip);
      const height = parseNum(v.height);
      const sex = String(v.sex || 'male');

      if ([waist, hip, height].some(isNaN) || waist <= 0 || hip <= 0 || height <= 0) {
        return calcError('Waist, hip, and height measurements must all be positive numbers.');
      }

      const whtr = waist / height;
      const whr = waist / hip;
      const targetMaxWaist = height * 0.5;
      const unitLabel = unit === 'metric' ? 'cm' : 'in';

      let niceClass = 'Healthy Central Adiposity (0.40–0.49)';
      if (whtr < 0.4) niceClass = 'Underweight / Low Central Fat (< 0.40)';
      else if (whtr < 0.5) niceClass = 'Healthy Central Adiposity (0.40–0.49)';
      else if (whtr < 0.6) niceClass = 'Increased Central Risk (0.50–0.59 · NICE NG246)';
      else niceClass = 'High Cardiometabolic Risk (≥ 0.60 · NICE NG246)';

      const whrCutoff = sex === 'male' ? 0.9 : 0.85;
      const whrStatus = whr > whrCutoff ? `Elevated (>${whrCutoff} WHO)` : `Low Risk (≤${whrCutoff} WHO)`;

      return {
        primaryValue: fmt(whtr, 3),
        primaryUnit: `Waist-to-Height Ratio (${niceClass.split(' (')[0]})`,
        secondaryOutputs: [
          { label: 'NICE NG246 Risk Classification', value: niceClass },
          { label: 'Waist-to-Hip Ratio (WHR)', value: fmt(whr, 3), unit: whrStatus },
          { label: 'Max Healthy Waist (Height ÷ 2)', value: fmt(targetMaxWaist, 1), unit: unitLabel },
          { label: 'Waist Margin vs 0.50 Rule', value: `${waist - targetMaxWaist >= 0 ? '+' : ''}${fmt(waist - targetMaxWaist, 1)}`, unit: unitLabel },
        ],
        steps: [
          `Waist-to-Height Ratio (WHtR) = ${waist} ÷ ${height} = ${fmt(whtr, 3)} → ${niceClass}.`,
          `Under NICE NG246, keeping waist below half your height (${fmt(targetMaxWaist, 1)} ${unitLabel}) minimizes visceral cardiometabolic risk across ethnic groups.`,
          `Waist-to-Hip Ratio (WHR) = ${waist} ÷ ${hip} = ${fmt(whr, 3)} (${whrStatus}).`,
        ],
      };
    },
  },

  // 532. One-Rep Max (1RM) & Training Percentage Table Calculator
  {
    slug: 'one-rep-max-calculator',
    title: 'One-Rep Max (1RM) & Load Calculator',
    category: 'health-fitness',
    formulaDisplay: 'Brzycki: W × 36 ÷ (37 − R)  |  Epley: W × (1 + R ÷ 30)  |  Lombardi: W × R^0.10',
    inputs: [
      { id: 'weightLifted', label: 'Weight Lifted', defaultValue: 225, type: 'number', min: 1, max: 2500, step: 5, unit: 'lb/kg' },
      { id: 'repsPerformed', label: 'Clean Repetitions Completed (1–15)', defaultValue: 5, type: 'number', min: 1, max: 15, step: 1, unit: 'reps' },
      {
        id: 'unitLabel',
        label: 'Display Weight Unit',
        type: 'select',
        defaultValue: 'lb',
        options: [
          { label: 'Pounds (lb)', value: 'lb' },
          { label: 'Kilograms (kg)', value: 'kg' },
        ],
      },
      { id: 'bodyWeight', label: 'Lifter Body Weight (Relative Strength)', defaultValue: 180, type: 'number', min: 50, max: 600, step: 5, unit: 'lb/kg', advanced: true },
    ],
    calculate: (v) => {
      const w = parseNum(v.weightLifted);
      const r = parseNum(v.repsPerformed);
      const unit = String(v.unitLabel || 'lb');
      const bw = v.bodyWeight === undefined ? 180 : parseNum(v.bodyWeight);

      if ([w, r, bw].some(isNaN) || w <= 0 || r < 1 || r > 15 || bw <= 0) {
        return calcError('Weight must be positive and repetitions between 1 and 15 (equations lose validity above 15 reps).');
      }

      const brzycki = r === 1 ? w : w * (36 / (37 - r));
      const epley = r === 1 ? w : w * (1 + r / 30);
      const lombardi = r === 1 ? w : w * Math.pow(r, 0.1);
      const compositeAvg = (brzycki + epley + lombardi) / 3;
      const bwMultiple = compositeAvg / bw;

      return {
        primaryValue: fmt(compositeAvg, 1),
        primaryUnit: `${unit} Composite 1RM (Avg of Brzycki/Epley/Lombardi)`,
        secondaryOutputs: [
          { label: 'Brzycki 1RM', value: fmt(brzycki, 1), unit: unit },
          { label: 'Epley 1RM', value: fmt(epley, 1), unit: unit },
          { label: 'Lombardi 1RM', value: fmt(lombardi, 1), unit: unit },
          { label: '90% Max Strength (~3–4 Reps)', value: fmt(compositeAvg * 0.9, 1), unit: unit },
          { label: '80% Power / Strength (~7–8 Reps)', value: fmt(compositeAvg * 0.8, 1), unit: unit },
          { label: '70% Hypertrophy (~11–12 Reps)', value: fmt(compositeAvg * 0.7, 1), unit: unit },
          { label: 'Relative Strength Ratio', value: `${fmt(bwMultiple, 2)}x BW` },
        ],
        steps: [
          `Lifted ${w} ${unit} for ${r} clean reps → Brzycki = ${fmt(brzycki, 1)} ${unit}; Epley = ${fmt(epley, 1)} ${unit}; Lombardi = ${fmt(lombardi, 1)} ${unit}.`,
          `Composite 1RM = ${fmt(compositeAvg, 1)} ${unit} (${fmt(bwMultiple, 2)}× ${bw} ${unit} bodyweight).`,
          `Training Load Prescriptions: 90% = ${fmt(compositeAvg * 0.9, 1)} ${unit}; 80% = ${fmt(compositeAvg * 0.8, 1)} ${unit}; 70% = ${fmt(compositeAvg * 0.7, 1)} ${unit}.`,
        ],
      };
    },
  },

  // 533. Mean Arterial Pressure (MAP) & Pulse Pressure Calculator
  {
    slug: 'mean-arterial-pressure-calculator',
    title: 'Mean Arterial Pressure (MAP) Calculator',
    category: 'health-fitness',
    formulaDisplay: 'Standard MAP = DBP + ⅓(SBP − DBP)  |  Pulse Pressure = SBP − DBP',
    inputs: [
      { id: 'systolic', label: 'Systolic Blood Pressure (SBP, Top)', defaultValue: 122, type: 'number', min: 40, max: 300, step: 2, unit: 'mmHg' },
      { id: 'diastolic', label: 'Diastolic Blood Pressure (DBP, Bottom)', defaultValue: 78, type: 'number', min: 20, max: 200, step: 2, unit: 'mmHg' },
      { id: 'heartRate', label: 'Heart Rate (Optional Razminia Check)', defaultValue: 72, type: 'number', min: 30, max: 240, step: 2, unit: 'bpm', advanced: true },
    ],
    calculate: (v) => {
      const sbp = parseNum(v.systolic);
      const dbp = parseNum(v.diastolic);
      const hr = v.heartRate === undefined ? 72 : parseNum(v.heartRate);

      if ([sbp, dbp, hr].some(isNaN) || sbp <= 0 || dbp <= 0 || sbp <= dbp || sbp > 320 || hr < 25 || hr > 260) {
        return calcError('Systolic pressure must exceed diastolic pressure within physiological bounds (SBP > DBP).');
      }

      const pp = sbp - dbp;
      const mapStd = dbp + pp / 3;
      const mapRazminia = dbp + (0.33 + 0.0012 * hr) * pp;

      let bpStage = 'Normal BP (< 120 / < 80)';
      if (sbp > 180 || dbp > 120) bpStage = 'Hypertensive Crisis Risk (>180 or >120)';
      else if (sbp >= 140 || dbp >= 90) bpStage = 'Stage 2 Hypertension (ACC/AHA ≥140/90)';
      else if (sbp >= 130 || dbp >= 80) bpStage = 'Stage 1 Hypertension (ACC/AHA 130–139 / 80–89)';
      else if (sbp >= 120 && dbp < 80) bpStage = 'Elevated Blood Pressure (120–129 / <80)';

      let perfusionNote = 'Adequate Organ Perfusion (70–100 mmHg)';
      if (mapStd < 60) perfusionNote = 'Critical Hypoperfusion Risk (MAP < 60 mmHg)';
      else if (mapStd < 65) perfusionNote = 'Borderline / Below 65 mmHg Surviving Sepsis Target';
      else if (mapStd > 105) perfusionNote = 'Elevated Arterial Load (MAP > 105 mmHg)';

      return {
        primaryValue: fmt(mapStd, 1),
        primaryUnit: `mmHg Mean Arterial Pressure (MAP)`,
        secondaryOutputs: [
          { label: 'Organ Perfusion Check', value: perfusionNote },
          { label: 'Pulse Pressure (SBP − DBP)', value: fmt(pp, 0), unit: 'mmHg' },
          { label: 'ACC / AHA Blood Pressure Tier', value: bpStage },
          { label: `HR-Adjusted Razminia MAP (${hr} bpm)`, value: fmt(mapRazminia, 1), unit: 'mmHg' },
        ],
        steps: [
          `Pulse Pressure = ${sbp} − ${dbp} = ${pp} mmHg (typical resting PP: 35–55 mmHg).`,
          `Standard MAP = ${dbp} + (${pp} ÷ 3) = ${fmt(mapStd, 1)} mmHg → ${perfusionNote}.`,
          `ACC/AHA Category for ${sbp}/${dbp} mmHg: ${bpStage}.`,
        ],
      };
    },
  },

  // 534. Pediatric Fluid Maintenance Calculator (Holliday-Segar 4-2-1 Rule)
  {
    slug: 'pediatric-fluid-calculator',
    title: 'Pediatric Fluid Maintenance Calculator',
    category: 'health-fitness',
    formulaDisplay: 'Holliday-Segar: 4 mL/kg/hr (0–10kg) + 2 mL/kg/hr (11–20kg) + 1 mL/kg/hr (>20kg)',
    inputs: [
      {
        id: 'wtUnit',
        label: 'Child Weight Unit',
        type: 'select',
        defaultValue: 'kg',
        options: [
          { label: 'Kilograms (kg)', value: 'kg' },
          { label: 'Pounds (lb)', value: 'lb' },
        ],
      },
      { id: 'weightVal', label: 'Patient Weight', defaultValue: 24, type: 'number', min: 1, max: 350, step: 0.5, unit: 'kg/lb' },
      {
        id: 'dehydrationPct',
        label: 'Estimated Dehydration Deficit Add-On',
        type: 'select',
        defaultValue: '0',
        options: [
          { label: '0% — Maintenance Only (Standard Euvolemic)', value: '0' },
          { label: '5% Mild Dehydration (+50 mL/kg over 24h)', value: '5' },
          { label: '10% Moderate Dehydration (+100 mL/kg over 24h)', value: '10' },
        ],
      },
    ],
    calculate: (v) => {
      const unit = String(v.wtUnit || 'kg');
      const rawW = parseNum(v.weightVal);
      const dehydPct = parseNum(v.dehydrationPct || 0);

      if (isNaN(rawW) || isNaN(dehydPct) || rawW <= 0) {
        return calcError('Patient weight must be a positive number.');
      }

      const kg = unit === 'lb' ? rawW * 0.45359237 : rawW;
      if (kg < 1 || kg > 200) {
        return calcError('Normalized pediatric/adolescent weight must be between 1 kg and 200 kg.');
      }

      // Holliday-Segar 4-2-1 hourly & 100-50-20 daily
      const tier1 = Math.min(kg, 10);
      const tier2 = Math.max(0, Math.min(kg, 20) - 10);
      const tier3 = Math.max(0, kg - 20);

      const maintHourly = tier1 * 4 + tier2 * 2 + tier3 * 1;
      const maintDaily = tier1 * 100 + tier2 * 50 + tier3 * 20;

      // Dehydration replacement: % * 10 mL/kg over 24h (e.g. 5% = 50 mL/kg)
      const deficitTotalMl = kg * dehydPct * 10;
      const deficitHourly = deficitTotalMl / 24;

      const totalHourly = maintHourly + deficitHourly;
      const totalDaily = maintDaily + deficitTotalMl;

      return {
        primaryValue: fmt(totalHourly, 1),
        primaryUnit: `mL / hour Total IV Maintenance Rate (${fmt(totalDaily, 0)} mL / 24h)`,
        secondaryOutputs: [
          { label: '24-Hour Total Fluid Volume', value: fmt(totalDaily, 0), unit: 'mL/day' },
          { label: 'Baseline Maintenance Hourly (4-2-1)', value: fmt(maintHourly, 1), unit: 'mL/hr' },
          { label: 'Baseline Maintenance Daily (100-50-20)', value: fmt(maintDaily, 0), unit: 'mL/day' },
          { label: `Dehydration Deficit Add-On (${dehydPct}%)`, value: fmt(deficitTotalMl, 0), unit: `mL (+${fmt(deficitHourly, 1)} mL/hr)` },
          { label: 'Normalized Body Weight', value: fmt(kg, 2), unit: 'kg' },
        ],
        steps: [
          `Normalized Weight = ${fmt(kg, 2)} kg (Tier 1: ${fmt(tier1, 2)} kg × 4, Tier 2: ${fmt(tier2, 2)} kg × 2, Tier 3: ${fmt(tier3, 2)} kg × 1).`,
          `Holliday-Segar 4-2-1 Maintenance Rate = ${fmt(maintHourly, 1)} mL/hr (${fmt(maintDaily, 0)} mL/day).`,
          dehydPct > 0
            ? `Adding ${dehydPct}% deficit (${fmt(deficitTotalMl, 0)} mL ÷ 24 hrs = +${fmt(deficitHourly, 1)} mL/hr) gives ${fmt(totalHourly, 1)} mL/hr total (${fmt(totalDaily, 0)} mL/24h).`
            : `No dehydration deficit added; confirm clinical urine output and isotonic fluid choice per pediatric orders.`,
        ],
      };
    },
  },

  // 535. Sleep Cycle & Circadian Bedtime Calculator (90-Min Architecture)
  {
    slug: 'sleep-cycle-calculator',
    title: 'Sleep Cycle & Circadian Bedtime Calculator',
    category: 'health-fitness',
    formulaDisplay: 'Bedtime / Wake = Target Time ± (N × 90 min Cycles + Sleep Onset Latency)',
    inputs: [
      {
        id: 'mode',
        label: 'Planning Direction',
        type: 'select',
        defaultValue: 'wake_at',
        options: [
          { label: 'I need to wake up at... (Find Best Bedtimes)', value: 'wake_at' },
          { label: 'I am going to bed at... (Find Best Wake Times)', value: 'bed_at' },
        ],
      },
      { id: 'targetTime', label: 'Target Alarm / Bedtime (24h HH:MM)', defaultValue: '06:30', type: 'time' },
      { id: 'sleepLatencyMin', label: 'Avg Time to Fall Asleep (Onset Latency)', defaultValue: 15, type: 'number', min: 0, max: 90, step: 5, unit: 'min' },
      { id: 'cycleMinutes', label: 'Individual Sleep Cycle Length (80–110m)', defaultValue: 90, type: 'number', min: 75, max: 115, step: 5, unit: 'min', advanced: true },
    ],
    calculate: (v) => {
      const mode = String(v.mode || 'wake_at');
      const timeStr = String(v.targetTime || '06:30').trim();
      const latency = parseNum(v.sleepLatencyMin);
      const cycleLen = v.cycleMinutes === undefined ? 90 : parseNum(v.cycleMinutes);

      const mMatch = timeStr.match(/^(\d{1,2}):(\d{2})$/);
      if (!mMatch || isNaN(latency) || isNaN(cycleLen) || latency < 0 || latency > 120 || cycleLen < 60 || cycleLen > 120) {
        return calcError('Provide a valid HH:MM time, sleep latency (0–120 min), and cycle length (60–120 min).');
      }

      const hh = Number(mMatch[1]);
      const mm = Number(mMatch[2]);
      if (hh < 0 || hh > 23 || mm < 0 || mm > 59) {
        return calcError('Clock hours must be 00–23 and minutes 00–59.');
      }

      const baseMinutes = hh * 60 + mm;
      const sign = mode === 'wake_at' ? -1 : 1;

      const calcSlot = (cycles: number) => {
        const totalDelta = cycles * cycleLen + latency;
        return format12h(baseMinutes + sign * totalDelta);
      };

      const slot5 = calcSlot(5); // Optimal adult 7.5 hrs sleep
      const slot6 = calcSlot(6); // Recovery 9.0 hrs sleep
      const slot4 = calcSlot(4); // Short 6.0 hrs sleep
      const caffeineCutoff = format12h((mode === 'wake_at' ? baseMinutes - 5 * cycleLen - latency : baseMinutes) - 8 * 60);

      return {
        primaryValue: slot5,
        primaryUnit: mode === 'wake_at' ? `Optimal Bedtime for 5 Cycles (${fmt((5 * cycleLen) / 60, 1)}h Sleep)` : `Optimal Wake Time After 5 Cycles (${fmt((5 * cycleLen) / 60, 1)}h Sleep)`,
        secondaryOutputs: [
          { label: `6 Full Cycles (${fmt((6 * cycleLen) / 60, 1)}h Recovery)`, value: slot6 },
          { label: `5 Full Cycles (${fmt((5 * cycleLen) / 60, 1)}h Optimal Adult)`, value: slot5 },
          { label: `4 Cycles (${fmt((4 * cycleLen) / 60, 1)}h Minimum)`, value: slot4 },
          { label: 'Recommended Caffeine Cut-Off (-8h)', value: caffeineCutoff },
          { label: 'Sleep Onset Latency Included', value: `${latency} min` },
        ],
        steps: [
          `Each complete human sleep architecture cycle averages ${cycleLen} minutes across NREM N1–N3 and REM stages, plus ${latency} minutes to fall asleep.`,
          mode === 'wake_at'
            ? `Counting backward from a ${format12h(baseMinutes)} alarm: 6 cycles (${slot6}), 5 cycles optimal (${slot5}), or 4 cycles minimum (${slot4}).`
            : `Starting in bed at ${format12h(baseMinutes)} (+${latency}m onset): wake after 4 cycles (${slot4}), 5 cycles (${slot5}), or 6 cycles (${slot6}).`,
          `Cut off caffeine roughly 8 hours prior (~${caffeineCutoff}) to protect deep slow-wave sleep.`,
        ],
      };
    },
  },
];
