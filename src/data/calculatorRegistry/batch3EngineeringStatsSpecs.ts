import { CalculatorSpec } from './types';
import { parseNum, calcError } from './validation';

const fmt = (n: number, d = 2): number => {
  if (!Number.isFinite(n)) return 0;
  const rounded = Number(n.toFixed(d));
  return Object.is(rounded, -0) ? 0 : rounded;
};

// Normal CDF using Abramowitz & Stegun 7.1.26 erf approximation (< 1.5e-7 max error)
const normalCdf = (z: number): number => {
  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * x);
  const y =
    1 -
    (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t) *
      Math.exp(-x * x);
  return 0.5 * (1 + sign * y);
};

// Inverse Normal CDF (Acklam rational approximation, relative error < 1.15e-9)
const inverseNormalCdf = (p: number): number => {
  if (p <= 0 || p >= 1) return 0;
  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
    1.38357751867269e2, -3.066479806614716e1, 2.506628277459239,
  ];
  const b = [
    -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
    6.680131188771972e1, -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838,
    -2.549732539343734, 4.374664141464968, 2.938163982698783,
  ];
  const d = [
    7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416,
  ];
  const pLow = 0.02425;
  const pHigh = 1 - pLow;
  let q = 0;
  let r = 0;
  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }
  if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return (
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
    );
  }
  q = Math.sqrt(-2 * Math.log(1 - p));
  return -(
    (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
    ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
  );
};

const parseNumberList = (raw: string): number[] => {
  if (!raw || typeof raw !== 'string') return [];
  return raw
    .split(/[\s,;]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => Number(s))
    .filter((n) => Number.isFinite(n));
};

const gcdTwo = (a: number, b: number): number => {
  let x = Math.abs(Math.trunc(a));
  let y = Math.abs(Math.trunc(b));
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
};

const factorizeInt = (n: number): string => {
  if (n <= 1) return String(n);
  let num = n;
  const parts: string[] = [];
  let div = 2;
  while (div * div <= num && div <= 1000000) {
    let count = 0;
    while (num % div === 0) {
      count++;
      num = Math.floor(num / div);
    }
    if (count > 0) {
      parts.push(count === 1 ? `${div}` : `${div}^${count}`);
    }
    div = div === 2 ? 3 : div + 2;
  }
  if (num > 1) parts.push(`${num}`);
  return parts.join(' × ');
};

export const batch3EngineeringStatsSpecs: CalculatorSpec[] = [
  // 536. HVAC Cooling Load & BTU Sizing Calculator
  {
    slug: 'btu-hvac-calculator',
    title: 'HVAC Cooling Load & BTU Size Calculator',
    category: 'home-tech',
    formulaDisplay: 'BTU/hr = (Area × BaseRate × HeightFactor × Climate × Insulation × Sun) + Occupant + Kitchen',
    inputs: [
      {
        id: 'areaUnit',
        label: 'Floor Area Units',
        type: 'select',
        defaultValue: 'sqft',
        options: [
          { label: 'Square Feet (ft²)', value: 'sqft' },
          { label: 'Square Meters (m²)', value: 'sqm' },
        ],
      },
      { id: 'floorArea', label: 'Conditioned Room / Home Area', defaultValue: 1800, type: 'number', min: 50, max: 100000, step: 50, unit: 'area' },
      { id: 'ceilingHeightFt', label: 'Ceiling Height (ft)', defaultValue: 9, type: 'number', min: 6, max: 30, step: 0.5, unit: 'ft' },
      {
        id: 'climateZone',
        label: 'Climate Zone Intensity',
        type: 'select',
        defaultValue: '1.05',
        options: [
          { label: 'Cool / Temperate (UK, Canada, Pacific NW)', value: '0.9' },
          { label: 'Moderate Mixed (Mid-Atlantic, Melbourne)', value: '1.0' },
          { label: 'Warm Humid (Southeast US, Sydney)', value: '1.05' },
          { label: 'Hot / Arid Desert (Arizona, Texas, Outback)', value: '1.2' },
        ],
      },
      {
        id: 'insulationGrade',
        label: 'Building Insulation & Window Seal',
        type: 'select',
        defaultValue: '1.0',
        options: [
          { label: 'Tight Modern / Double-Glazed (-12%)', value: '0.88' },
          { label: 'Average / Standard Insulation (1.0x)', value: '1.0' },
          { label: 'Older / Poorly Insulated / Single Pane (+18%)', value: '1.18' },
        ],
      },
      { id: 'occupants', label: 'Regular Occupants (+600 BTU above 2)', defaultValue: 3, type: 'number', min: 1, max: 100, step: 1, advanced: true },
      {
        id: 'includeKitchen',
        label: 'Includes Full Kitchen Heat Load?',
        type: 'select',
        defaultValue: 'yes',
        options: [
          { label: 'Yes (+4,000 BTU/hr Allowance)', value: 'yes' },
          { label: 'No (Bedroom / Office Zone Only)', value: 'no' },
        ],
        advanced: true,
      },
      { id: 'seer2', label: 'AC System Efficiency (SEER2)', defaultValue: 16, type: 'number', min: 10, max: 35, step: 1, advanced: true },
    ],
    calculate: (v) => {
      const unit = String(v.areaUnit || 'sqft');
      const rawArea = parseNum(v.floorArea);
      const ceilFt = parseNum(v.ceilingHeightFt);
      const climate = parseNum(v.climateZone || 1.05);
      const insul = parseNum(v.insulationGrade || 1.0);
      const occ = v.occupants === undefined ? 3 : parseNum(v.occupants);
      const kitchen = String(v.includeKitchen || 'yes') === 'yes';
      const seer2 = v.seer2 === undefined ? 16 : parseNum(v.seer2);

      if ([rawArea, ceilFt, climate, insul, occ, seer2].some(isNaN) || rawArea <= 0 || ceilFt < 5 || occ < 0 || seer2 <= 0) {
        return calcError('Floor area, ceiling height, occupants, and SEER2 rating must be valid positive numbers.');
      }

      const sqFt = unit === 'sqm' ? rawArea * 10.76391 : rawArea;
      const baseBtu = sqFt * 20; // ASHRAE/ENERGY STAR baseline 20 BTU per sq ft @ 8 ft ceiling
      const heightMult = ceilFt / 8;
      const envelopeBtu = baseBtu * heightMult * climate * insul;
      const occBtu = Math.max(0, occ - 2) * 600;
      const kitchenBtu = kitchen ? 4000 : 0;
      const totalBtu = envelopeBtu + occBtu + kitchenBtu;

      const tons = totalBtu / 12000;
      const kwThermal = totalBtu / 3412.142;
      const recStandardTons = Math.ceil(tons * 2) / 2; // round up to nearest 0.5 ton unit
      const estRunningWatts = totalBtu / seer2;

      return {
        primaryValue: fmt(totalBtu, 0),
        primaryUnit: `BTU/hr Recommended Cooling Capacity (${fmt(tons, 2)} Tons · ${fmt(kwThermal, 2)} kW)`,
        secondaryOutputs: [
          { label: 'Cooling Tonnage Required', value: fmt(tons, 2), unit: 'Tons (12k BTU/t)' },
          { label: 'Standard HVAC Unit Size', value: `${fmt(recStandardTons, 1)} Tons`, unit: `(${(recStandardTons * 12000).toLocaleString()} BTU)` },
          { label: 'Metric Thermal Output', value: fmt(kwThermal, 2), unit: 'kW' },
          { label: `Est. Electrical Draw (SEER2 ${seer2})`, value: fmt(estRunningWatts / 1000, 2), unit: 'kW peak' },
          { label: 'Conditioned Volume', value: Math.round(sqFt * ceilFt).toLocaleString(), unit: 'cu ft' },
        ],
        steps: [
          `Base Thermal Envelope: ${fmt(sqFt, 0)} ft² × 20 BTU/ft² × (${ceilFt}÷8 height) × ${climate} climate × ${insul} insulation = ${fmt(envelopeBtu, 0)} BTU/hr.`,
          `Internal Gains: Occupants (${occBtu} BTU/hr) + Kitchen (${kitchenBtu} BTU/hr) → Total Cooling Load = ${fmt(totalBtu, 0)} BTU/hr.`,
          `Unit Sizing: ${fmt(totalBtu, 0)} ÷ 12,000 = ${fmt(tons, 2)} Tons (nearest 0.5-Ton unit: ${fmt(recStandardTons, 1)} Tons; ${fmt(kwThermal, 2)} kW cooling).`,
        ],
      };
    },
  },

  // 537. Wire Size (AWG / mm²) & Voltage Drop Calculator (NEC Table 8)
  {
    slug: 'wire-size-voltage-drop-calculator',
    title: 'Wire Gauge (AWG) & Voltage Drop Calculator',
    category: 'home-tech',
    formulaDisplay: '1Φ Vd = 2 × K × I × L ÷ CM  |  3Φ Vd = √3 × K × I × L ÷ CM  |  NEC Limit ≤ 3%',
    inputs: [
      {
        id: 'conductor',
        label: 'Conductor Material',
        type: 'select',
        defaultValue: 'cu',
        options: [
          { label: 'Copper (K = 12.9 Ω·CM/ft)', value: 'cu' },
          { label: 'Aluminum (K = 21.2 Ω·CM/ft)', value: 'al' },
        ],
      },
      {
        id: 'phase',
        label: 'Circuit Phase',
        type: 'select',
        defaultValue: 'single',
        options: [
          { label: 'Single-Phase AC / DC (2-Wire)', value: 'single' },
          { label: 'Three-Phase AC (√3 Multiplier)', value: 'three' },
        ],
      },
      { id: 'voltage', label: 'Source Voltage (V)', defaultValue: 240, type: 'number', min: 5, max: 15000, step: 12, unit: 'V' },
      { id: 'currentAmps', label: 'Load Current (Amperes)', defaultValue: 32, type: 'number', min: 0.1, max: 1000, step: 1, unit: 'A' },
      { id: 'oneWayFeet', label: 'One-Way Cable Run Length (ft)', defaultValue: 120, type: 'number', min: 1, max: 20000, step: 5, unit: 'ft' },
      {
        id: 'wireAwg',
        label: 'Selected Wire Size (NEC Ch. 9 Table 8)',
        type: 'select',
        defaultValue: '10',
        options: [
          { label: '14 AWG (4,110 CM · 2.08 mm²)', value: '14' },
          { label: '12 AWG (6,530 CM · 3.31 mm²)', value: '12' },
          { label: '10 AWG (10,380 CM · 5.26 mm²)', value: '10' },
          { label: '8 AWG (16,510 CM · 8.37 mm²)', value: '8' },
          { label: '6 AWG (26,240 CM · 13.3 mm²)', value: '6' },
          { label: '4 AWG (41,740 CM · 21.2 mm²)', value: '4' },
          { label: '2 AWG (66,360 CM · 33.6 mm²)', value: '2' },
          { label: '1/0 AWG (105,600 CM · 53.5 mm²)', value: '1/0' },
          { label: '2/0 AWG (133,100 CM · 67.4 mm²)', value: '2/0' },
          { label: '4/0 AWG (211,600 CM · 107.2 mm²)', value: '4/0' },
        ],
      },
    ],
    calculate: (v) => {
      const cond = String(v.conductor || 'cu');
      const phase = String(v.phase || 'single');
      const volts = parseNum(v.voltage);
      const amps = parseNum(v.currentAmps);
      const lenFt = parseNum(v.oneWayFeet);
      const awg = String(v.wireAwg || '10');

      const awgTable: { gauge: string; cm: number; mm2: number }[] = [
        { gauge: '14 AWG', cm: 4110, mm2: 2.08 },
        { gauge: '12 AWG', cm: 6530, mm2: 3.31 },
        { gauge: '10 AWG', cm: 10380, mm2: 5.26 },
        { gauge: '8 AWG', cm: 16510, mm2: 8.37 },
        { gauge: '6 AWG', cm: 26240, mm2: 13.3 },
        { gauge: '4 AWG', cm: 41740, mm2: 21.2 },
        { gauge: '2 AWG', cm: 66360, mm2: 33.6 },
        { gauge: '1/0 AWG', cm: 105600, mm2: 53.5 },
        { gauge: '2/0 AWG', cm: 133100, mm2: 67.4 },
        { gauge: '4/0 AWG', cm: 211600, mm2: 107.2 },
      ];
      const mapCm: Record<string, number> = {
        '14': 4110, '12': 6530, '10': 10380, '8': 16510, '6': 26240,
        '4': 41740, '2': 66360, '1/0': 105600, '2/0': 133100, '4/0': 211600,
      };

      const cm = mapCm[awg];
      if ([volts, amps, lenFt].some(isNaN) || !cm || volts <= 0 || amps <= 0 || lenFt <= 0) {
        return calcError('Voltage, current, and one-way length must be positive numbers.');
      }

      const K = cond === 'al' ? 21.2 : 12.9;
      const mult = phase === 'three' ? Math.sqrt(3) : 2;
      const vDrop = (mult * K * amps * lenFt) / cm;
      const pctDrop = (vDrop / volts) * 100;
      const endVoltage = Math.max(0, volts - vDrop);
      const powerLossW = phase === 'three' ? Math.sqrt(3) * vDrop * amps : vDrop * amps;

      // Minimum CM needed to stay <= 3% NEC branch-circuit recommendation
      const reqCm3Pct = (mult * K * amps * lenFt) / (volts * 0.03);
      const recRow = awgTable.find((r) => r.cm >= reqCm3Pct);
      const recGauge = recRow ? `${recRow.gauge} (${recRow.mm2} mm²)` : 'Parallel / Larger than 4/0 AWG';
      const necStatus = pctDrop <= 3.0 ? 'PASS (≤ 3% NEC Branch Standard)' : pctDrop <= 5.0 ? 'CAUTION (3–5% Feeder Limit)' : 'FAIL (> 5% Excess Drop)';

      return {
        primaryValue: fmt(pctDrop, 2),
        primaryUnit: `% Voltage Drop (${fmt(vDrop, 2)} V lost · ${necStatus.split(' ')[0]})`,
        secondaryOutputs: [
          { label: 'NEC 210.19 Voltage Check', value: necStatus },
          { label: 'Voltage Drop (Volts)', value: fmt(vDrop, 2), unit: 'V' },
          { label: 'Voltage at Load End', value: fmt(endVoltage, 2), unit: 'V' },
          { label: 'Minimum AWG for ≤ 3% Drop', value: recGauge },
          { label: 'Cable Conductor Heat Loss', value: fmt(powerLossW, 1), unit: 'Watts' },
          { label: 'One-Way Run (Metric)', value: fmt(lenFt * 0.3048, 1), unit: 'm' },
        ],
        steps: [
          `Circuit: ${phase === 'three' ? 'Three-Phase (√3)' : 'Single-Phase (2×)'}, ${cond === 'al' ? 'Aluminum (K=21.2)' : 'Copper (K=12.9)'}, ${awg} AWG (${cm.toLocaleString()} CM).`,
          `Voltage Drop = (${fmt(mult, 3)} × ${K} × ${amps} A × ${lenFt} ft) ÷ ${cm.toLocaleString()} = ${fmt(vDrop, 2)} V (${fmt(pctDrop, 2)}% of ${volts} V).`,
          `To limit drop ≤ 3% (${fmt(volts * 0.03, 2)} V), minimum area = ${Math.round(reqCm3Pct).toLocaleString()} CM → Recommended: ${recGauge}.`,
        ],
      };
    },
  },

  // 538. Roof Pitch, Rafter Length & Shingle Area Calculator
  {
    slug: 'roof-pitch-rafter-calculator',
    title: 'Roof Pitch, Rafter & Shingle Area Calculator',
    category: 'home-tech',
    formulaDisplay: 'SlopeFactor = √(1 + (Pitch÷12)²)  |  Rafter = Run × SlopeFactor  |  Squares = SlopedArea ÷ 100',
    inputs: [
      { id: 'pitchRise', label: 'Roof Pitch Rise (X : 12 Inches)', defaultValue: 6, type: 'number', min: 0.5, max: 24, step: 0.5, unit: 'in/ft' },
      { id: 'buildingWidthFt', label: 'Building Span / Width (Gable)', defaultValue: 32, type: 'number', min: 4, max: 300, step: 1, unit: 'ft' },
      { id: 'buildingLengthFt', label: 'Building Length (Ridge Run)', defaultValue: 48, type: 'number', min: 4, max: 500, step: 1, unit: 'ft' },
      { id: 'overhangFt', label: 'Eave Overhang Each Side (Horizontal)', defaultValue: 1.5, type: 'number', min: 0, max: 6, step: 0.25, unit: 'ft' },
      { id: 'wastePct', label: 'Shingle Cutting Waste Allowance (%)', defaultValue: 10, type: 'number', min: 0, max: 30, step: 2, unit: '%', advanced: true },
    ],
    calculate: (v) => {
      const pitch = parseNum(v.pitchRise);
      const width = parseNum(v.buildingWidthFt);
      const length = parseNum(v.buildingLengthFt);
      const overhang = parseNum(v.overhangFt);
      const waste = v.wastePct === undefined ? 10 : parseNum(v.wastePct);

      if ([pitch, width, length, overhang, waste].some(isNaN) || pitch <= 0 || width <= 0 || length <= 0 || overhang < 0 || waste < 0) {
        return calcError('Pitch, building width, and length must be positive numbers.');
      }

      const slopeRad = Math.atan(pitch / 12);
      const slopeDeg = (slopeRad * 180) / Math.PI;
      const slopePct = (pitch / 12) * 100;
      const slopeFactor = Math.sqrt(1 + Math.pow(pitch / 12, 2));

      const horizontalRun = width / 2 + overhang;
      const rafterLengthFt = horizontalRun * slopeFactor;
      const ridgeHeightFt = (width / 2) * (pitch / 12);

      // Total gable sloped area (2 roof planes)
      const slopedAreaSqFt = 2 * rafterLengthFt * (length + 2 * overhang);
      const orderSqFt = slopedAreaSqFt * (1 + waste / 100);
      const roofingSquares = orderSqFt / 100;
      const shingleBundles = Math.ceil(roofingSquares * 3); // 3 bundles = 1 square

      return {
        primaryValue: fmt(rafterLengthFt, 2),
        primaryUnit: `ft True Common Rafter Length (${fmt(slopeDeg, 1)}° · ${fmt(slopePct, 1)}% Slope)`,
        secondaryOutputs: [
          { label: 'Roof Pitch Angle / Grade', value: `${fmt(slopeDeg, 2)}°`, unit: `(${fmt(slopePct, 1)}% grade)` },
          { label: 'Slope Multiplier Factor', value: fmt(slopeFactor, 4) },
          { label: 'Total Sloped Roof Area', value: Math.round(slopedAreaSqFt).toLocaleString(), unit: `ft² (${fmt(slopedAreaSqFt * 0.092903, 1)} m²)` },
          { label: `Roofing Squares (w/ ${waste}% Waste)`, value: fmt(roofingSquares, 2), unit: 'Squares (100 ft²)' },
          { label: '3-Bundle Asphalt Shingle Count', value: `${shingleBundles} bundles` },
          { label: 'Ridge Rise Above Wall Plate', value: fmt(ridgeHeightFt, 2), unit: 'ft' },
        ],
        steps: [
          `${pitch}:12 Pitch → Angle = arctan(${pitch}÷12) = ${fmt(slopeDeg, 2)}°; Slope Multiplier = √(1 + (${pitch}÷12)²) = ${fmt(slopeFactor, 4)}.`,
          `Horizontal Run = (${width}÷2) + ${overhang} overhang = ${fmt(horizontalRun, 2)} ft → True Rafter = ${fmt(rafterLengthFt, 2)} ft.`,
          `Total Sloped Area = ${Math.round(slopedAreaSqFt)} ft²; with ${waste}% waste = ${fmt(roofingSquares, 2)} roofing squares (${shingleBundles} standard bundles).`,
        ],
      };
    },
  },

  // 539. Stair Stringer & IRC Code Geometry Calculator
  {
    slug: 'stair-calculator',
    title: 'Stair Stringer & Step Geometry Calculator',
    category: 'home-tech',
    formulaDisplay: 'Risers = round(TotalRise ÷ 7.25")  |  Stringer = √(TotalRise² + TotalRun²)  |  2R + T ≈ 24–25"',
    inputs: [
      { id: 'totalRiseIn', label: 'Total Floor-to-Floor Rise (Inches)', defaultValue: 108, type: 'number', min: 12, max: 300, step: 0.5, unit: 'in', helpText: 'Measured from finished lower floor to finished upper floor.' },
      { id: 'targetRiserIn', label: 'Target Riser Height (Ideal ~7.25")', defaultValue: 7.25, type: 'number', min: 5, max: 8.5, step: 0.25, unit: 'in' },
      { id: 'treadDepthIn', label: 'Tread Depth / Going (Min 10" IRC)', defaultValue: 10.5, type: 'number', min: 8, max: 16, step: 0.25, unit: 'in' },
    ],
    calculate: (v) => {
      const rise = parseNum(v.totalRiseIn);
      const targetR = parseNum(v.targetRiserIn);
      const tread = parseNum(v.treadDepthIn);

      if ([rise, targetR, tread].some(isNaN) || rise < 10 || targetR < 4 || targetR > 10 || tread < 6) {
        return calcError('Total rise must be >= 10 in, target riser 4–10 in, and tread >= 6 in.');
      }

      const numRisers = Math.max(2, Math.round(rise / targetR));
      const actualRiser = rise / numRisers;
      const numTreads = numRisers - 1;
      const totalRunIn = numTreads * tread;
      const stringerLenIn = Math.sqrt(rise * rise + totalRunIn * totalRunIn);
      const angleDeg = (Math.atan2(actualRiser, tread) * 180) / Math.PI;
      const blondelRule = 2 * actualRiser + tread;

      const ircRiserOk = actualRiser <= 7.75;
      const ircTreadOk = tread >= 10.0;
      const codeStatus = ircRiserOk && ircTreadOk ? 'IRC Compliant (Riser ≤7.75", Tread ≥10")' : 'Check Local Building Code Limits';

      return {
        primaryValue: fmt(actualRiser, 3),
        primaryUnit: `in Exact Riser Height (${numRisers} Risers · ${numTreads} Treads)`,
        secondaryOutputs: [
          { label: 'IRC Residential Code Check', value: codeStatus },
          { label: 'Total Horizontal Stair Run', value: fmt(totalRunIn, 1), unit: `in (${fmt(totalRunIn / 12, 2)} ft)` },
          { label: 'Cut Stringer Diagonal Length', value: fmt(stringerLenIn, 1), unit: `in (${fmt(stringerLenIn / 12, 2)} ft)` },
          { label: 'Staircase Pitch Angle', value: fmt(angleDeg, 1), unit: 'degrees' },
          { label: '2R + T Blondel Comfort Rule', value: fmt(blondelRule, 2), unit: 'in (24–25" ideal)' },
          { label: 'Metric Equivalent (R × T)', value: `${fmt(actualRiser * 25.4, 0)} × ${fmt(tread * 25.4, 0)}`, unit: 'mm' },
        ],
        steps: [
          `${rise}" total rise ÷ ${targetR}" target → ${numRisers} equal risers of ${fmt(actualRiser, 3)}" (${fmt(actualRiser * 25.4, 1)} mm) each.`,
          `With ${numTreads} treads at ${tread}" depth, Total Horizontal Run = ${fmt(totalRunIn, 1)}" (${fmt(totalRunIn / 12, 2)} ft).`,
          `Stringer Diagonal = √(${rise}² + ${fmt(totalRunIn, 1)}²) = ${fmt(stringerLenIn, 1)}" (${fmt(angleDeg, 1)}°); 2R+T = ${fmt(blondelRule, 2)}" (${codeStatus}).`,
        ],
      };
    },
  },

  // 540. Tile, Flooring & Grout Coverage Calculator
  {
    slug: 'tile-flooring-calculator',
    title: 'Tile, Flooring & Grout Coverage Calculator',
    category: 'home-tech',
    formulaDisplay: 'Tiles = ceil[Area(1+Waste) ÷ (L×W)]  |  Boxes = ceil(OrderSqFt ÷ SqFtPerBox)',
    inputs: [
      { id: 'roomLengthFt', label: 'Room Length (ft)', defaultValue: 16, type: 'number', min: 1, max: 500, step: 0.5, unit: 'ft' },
      { id: 'roomWidthFt', label: 'Room Width (ft)', defaultValue: 12, type: 'number', min: 1, max: 500, step: 0.5, unit: 'ft' },
      { id: 'tileLengthIn', label: 'Tile Length (Inches)', defaultValue: 24, type: 'number', min: 1, max: 96, step: 1, unit: 'in' },
      { id: 'tileWidthIn', label: 'Tile Width (Inches)', defaultValue: 12, type: 'number', min: 1, max: 96, step: 1, unit: 'in' },
      {
        id: 'patternWastePct',
        label: 'Layout Pattern & Cut Waste',
        type: 'select',
        defaultValue: '10',
        options: [
          { label: 'Straight Grid (+10% Waste)', value: '10' },
          { label: 'Diagonal / Herringbone (+15% Waste)', value: '15' },
          { label: 'Complex Multi-Corner Cuts (+20% Waste)', value: '20' },
        ],
      },
      { id: 'boxCoverageSqFt', label: 'Box / Carton Coverage (ft²)', defaultValue: 15, type: 'number', min: 1, max: 100, step: 0.5, unit: 'ft²', advanced: true },
      { id: 'groutJointIn', label: 'Grout Joint Width (Inches)', defaultValue: 0.125, type: 'number', min: 0.06, max: 0.75, step: 0.0625, unit: 'in', advanced: true },
    ],
    calculate: (v) => {
      const rL = parseNum(v.roomLengthFt);
      const rW = parseNum(v.roomWidthFt);
      const tL = parseNum(v.tileLengthIn);
      const tW = parseNum(v.tileWidthIn);
      const wastePct = parseNum(v.patternWastePct || 10);
      const boxSqFt = v.boxCoverageSqFt === undefined ? 15 : parseNum(v.boxCoverageSqFt);
      const jW = v.groutJointIn === undefined ? 0.125 : parseNum(v.groutJointIn);

      if ([rL, rW, tL, tW, wastePct, boxSqFt, jW].some(isNaN) || rL <= 0 || rW <= 0 || tL <= 0 || tW <= 0 || boxSqFt <= 0 || jW < 0) {
        return calcError('Room, tile, and box coverage dimensions must all be positive numbers.');
      }

      const netAreaSqFt = rL * rW;
      const grossAreaSqFt = netAreaSqFt * (1 + wastePct / 100);
      const singleTileSqFt = (tL * tW) / 144;
      const tilesNeeded = Math.ceil(grossAreaSqFt / singleTileSqFt);
      const boxesNeeded = Math.ceil(grossAreaSqFt / boxSqFt);

      // Standard industry grout formula (assuming 3/8" = 0.375" depth, 100 lb/ft³ density)
      const groutLb = ((tL + tW) / (tL * tW)) * jW * 0.375 * (100 / 12) * grossAreaSqFt * 1.1;

      return {
        primaryValue: boxesNeeded,
        primaryUnit: `Boxes Needed (${tilesNeeded} Tiles · ${fmt(grossAreaSqFt, 1)} ft² w/ ${wastePct}% Waste)`,
        secondaryOutputs: [
          { label: 'Total Tiles to Order', value: `${tilesNeeded} tiles` },
          { label: 'Net Floor Area', value: fmt(netAreaSqFt, 1), unit: `ft² (${fmt(netAreaSqFt * 0.092903, 1)} m²)` },
          { label: `Gross Order Area (+${wastePct}%)`, value: fmt(grossAreaSqFt, 1), unit: 'ft²' },
          { label: 'Estimated Grout Weight', value: fmt(groutLb, 1), unit: `lb (${fmt(groutLb * 0.45359, 1)} kg)` },
          { label: 'Single Tile Coverage', value: fmt(singleTileSqFt, 2), unit: 'ft²/tile' },
        ],
        steps: [
          `Net Area = ${rL} ft × ${rW} ft = ${fmt(netAreaSqFt, 1)} ft²; with ${wastePct}% waste = ${fmt(grossAreaSqFt, 1)} ft².`,
          `Tile Size ${tL}"×${tW}" = ${fmt(singleTileSqFt, 2)} ft²/tile → ${tilesNeeded} tiles needed (${boxesNeeded} boxes at ${boxSqFt} ft²/box).`,
          `With ${jW}" grout joints at standard 3/8" tile thickness, order ~${fmt(groutLb, 1)} lb (${fmt(groutLb * 0.45359, 1)} kg) sanded/unsanded grout.`,
        ],
      };
    },
  },

  // 541. Mulch, Soil & Gravel Landscape Volume Calculator
  {
    slug: 'gravel-mulch-calculator',
    title: 'Mulch, Soil & Gravel Volume Calculator',
    category: 'home-tech',
    formulaDisplay: 'Cubic Yards = (Area_ft² × Depth_in ÷ 12) ÷ 27  |  Tons = yd³ × Density ÷ 2,000',
    inputs: [
      { id: 'areaSqFt', label: 'Bed / Driveway Coverage Area (ft²)', defaultValue: 600, type: 'number', min: 1, max: 1000000, step: 25, unit: 'ft²' },
      { id: 'depthInches', label: 'Material Layer Depth (Inches)', defaultValue: 3, type: 'number', min: 0.5, max: 48, step: 0.5, unit: 'in' },
      {
        id: 'materialType',
        label: 'Landscape Material Type',
        type: 'select',
        defaultValue: 'mulch',
        options: [
          { label: 'Hardwood / Bark Mulch (~800 lb/yd³)', value: 'mulch' },
          { label: 'Screened Topsoil / Compost (~2,200 lb/yd³)', value: 'topsoil' },
          { label: 'Crushed Gravel / Stone (~2,800 lb/yd³)', value: 'gravel' },
          { label: 'Masonry Sand / River Rock (~2,700 lb/yd³)', value: 'sand' },
        ],
      },
      { id: 'bagCuFt', label: 'Bag Size if Buying Bagged (cu ft)', defaultValue: 2.0, type: 'number', min: 0.5, max: 5, step: 0.5, unit: 'ft³', advanced: true },
    ],
    calculate: (v) => {
      const area = parseNum(v.areaSqFt);
      const depth = parseNum(v.depthInches);
      const mat = String(v.materialType || 'mulch');
      const bagSize = v.bagCuFt === undefined ? 2.0 : parseNum(v.bagCuFt);

      if ([area, depth, bagSize].some(isNaN) || area <= 0 || depth <= 0 || bagSize <= 0) {
        return calcError('Area, depth, and bag volume must be positive numbers.');
      }

      const cuFt = area * (depth / 12);
      const cuYd = cuFt / 27;
      const cuM = cuYd * 0.764555;

      const densitiesLbYd: Record<string, number> = { mulch: 800, topsoil: 2200, gravel: 2800, sand: 2700 };
      const lbPerYd = densitiesLbYd[mat] || 800;
      const totalLbs = cuYd * lbPerYd;
      const shortTons = totalLbs / 2000;
      const metricTonnes = totalLbs * 0.000453592;
      const bagsNeeded = Math.ceil(cuFt / bagSize);

      return {
        primaryValue: fmt(cuYd, 2),
        primaryUnit: `yd³ Bulk Volume (${fmt(shortTons, 2)} US Tons · ${fmt(cuM, 2)} m³)`,
        secondaryOutputs: [
          { label: 'Metric Volume (Cubic Meters)', value: fmt(cuM, 2), unit: 'm³' },
          { label: 'Cubic Feet Total', value: fmt(cuFt, 1), unit: 'ft³' },
          { label: 'Estimated Material Weight', value: `${fmt(shortTons, 2)} US Tons`, unit: `(${fmt(metricTonnes, 2)} t)` },
          { label: `Bagged Equivalent (${bagSize} ft³/bag)`, value: `${bagsNeeded} bags` },
          { label: 'Density Assumption', value: `${lbPerYd.toLocaleString()} lb/yd³` },
        ],
        steps: [
          `Volume = ${area} ft² × (${depth} in ÷ 12) = ${fmt(cuFt, 1)} ft³ = ${fmt(cuYd, 2)} cubic yards (${fmt(cuM, 2)} m³).`,
          `Estimated Weight at ${lbPerYd.toLocaleString()} lb/yd³ = ${Math.round(totalLbs).toLocaleString()} lb (${fmt(shortTons, 2)} US Tons / ${fmt(metricTonnes, 2)} metric tonnes).`,
          `Bagged alternative: ceil(${fmt(cuFt, 1)} ÷ ${bagSize}) = ${bagsNeeded} bags.`,
        ],
      };
    },
  },

  // 542. Electric Vehicle (EV) Charging Time & Cost Calculator
  {
    slug: 'ev-charging-calculator',
    title: 'EV Charging Time & Cost Calculator',
    category: 'home-tech',
    formulaDisplay: 'Charge Hrs = [(Target − Start)% × kWh] ÷ (Power_kW × η)  |  Cost = Grid_kWh × Rate',
    inputs: [
      { id: 'batteryKwh', label: 'Usable EV Battery Capacity (kWh)', defaultValue: 75, type: 'number', min: 10, max: 250, step: 5, unit: 'kWh' },
      { id: 'startSocPct', label: 'Starting State of Charge (%)', defaultValue: 20, type: 'number', min: 0, max: 99, step: 5, unit: '%' },
      { id: 'targetSocPct', label: 'Target State of Charge (%)', defaultValue: 80, type: 'number', min: 1, max: 100, step: 5, unit: '%' },
      { id: 'chargerPowerKw', label: 'Charger Power (L1: 1.4 · L2: 7.4–11.5 · DC: 150)', defaultValue: 9.6, type: 'number', min: 1, max: 350, step: 0.2, unit: 'kW' },
      { id: 'electricityRate', label: 'Electricity Utility Rate ($ / kWh)', defaultValue: 0.16, type: 'number', min: 0, max: 2, step: 0.01, unit: '$/kWh' },
      { id: 'chargingEffPct', label: 'Grid-to-Battery Efficiency (%)', defaultValue: 90, type: 'number', min: 65, max: 99, step: 1, unit: '%', advanced: true },
      { id: 'evMiPerKwh', label: 'Vehicle Efficiency (Miles / kWh)', defaultValue: 3.5, type: 'number', min: 1.2, max: 7.0, step: 0.1, unit: 'mi/kWh', advanced: true },
    ],
    calculate: (v) => {
      const cap = parseNum(v.batteryKwh);
      const sSoc = parseNum(v.startSocPct);
      const tSoc = parseNum(v.targetSocPct);
      const kw = parseNum(v.chargerPowerKw);
      const rate = parseNum(v.electricityRate);
      const effPct = v.chargingEffPct === undefined ? 90 : parseNum(v.chargingEffPct);
      const miPerKwh = v.evMiPerKwh === undefined ? 3.5 : parseNum(v.evMiPerKwh);

      if ([cap, sSoc, tSoc, kw, rate, effPct, miPerKwh].some(isNaN) || cap <= 0 || kw <= 0 || rate < 0 || sSoc < 0 || tSoc > 100 || sSoc >= tSoc || effPct <= 0 || miPerKwh <= 0) {
        return calcError('Target SOC must exceed starting SOC (0–100%) with positive battery capacity and charger power.');
      }

      const netKwhAdded = cap * ((tSoc - sSoc) / 100);
      const gridKwhConsumed = netKwhAdded / (effPct / 100);
      const chargeHours = gridKwhConsumed / kw;
      const sessionCost = gridKwhConsumed * rate;
      const rangeAddedMiles = netKwhAdded * miPerKwh;
      const costPer100Miles = (100 / (miPerKwh * (effPct / 100))) * rate;

      const hrs = Math.floor(chargeHours);
      const mins = Math.round((chargeHours - hrs) * 60);

      return {
        primaryValue: fmt(chargeHours, 2),
        primaryUnit: `Hours (${hrs}h ${mins}m · Session Cost $${fmt(sessionCost, 2)})`,
        secondaryOutputs: [
          { label: 'Estimated Electricity Cost', value: `$${fmt(sessionCost, 2)}` },
          { label: 'Energy Pulled From Wall/Grid', value: fmt(gridKwhConsumed, 2), unit: 'kWh' },
          { label: 'Net Energy Stored in Battery', value: fmt(netKwhAdded, 2), unit: 'kWh' },
          { label: 'Driving Range Added', value: fmt(rangeAddedMiles, 0), unit: `mi (${fmt(rangeAddedMiles * 1.609, 0)} km)` },
          { label: 'Energy Cost per 100 Miles', value: `$${fmt(costPer100Miles, 2)}` },
        ],
        steps: [
          `Battery Energy Needed (${sSoc}% → ${tSoc}% of ${cap} kWh) = ${fmt(netKwhAdded, 2)} kWh.`,
          `Accounting for ${effPct}% charging efficiency draws ${fmt(gridKwhConsumed, 2)} kWh from the grid at $${fmt(rate, 2)}/kWh = $${fmt(sessionCost, 2)}.`,
          `At ${kw} kW charge rate, session completes in ${fmt(chargeHours, 2)} hours (${hrs}h ${mins}m), adding ~${fmt(rangeAddedMiles, 0)} miles.`,
        ],
      };
    },
  },

  // 543. A/B Test Sample Size & Statistical Power Calculator
  {
    slug: 'ab-test-sample-size-calculator',
    title: 'A/B Test Sample Size & Power Calculator',
    category: 'statistics-probability',
    formulaDisplay: 'n = [Z_(1-α/2)√(2p̄q̄) + Z_(1-β)√(p₁q₁ + p₂q₂)]² ÷ (p₂ − p₁)²',
    inputs: [
      { id: 'baselineRatePct', label: 'Baseline Conversion Rate (%)', defaultValue: 4.0, type: 'number', min: 0.1, max: 99, step: 0.25, unit: '%' },
      { id: 'mdeRelativePct', label: 'Minimum Detectable Effect (Relative Lift %)', defaultValue: 15, type: 'number', min: 1, max: 500, step: 1, unit: '%', helpText: 'e.g., +15% relative lift on a 4.0% baseline tests detecting ≥ 4.6%.' },
      {
        id: 'significanceLevel',
        label: 'Confidence Level (1 − α)',
        type: 'select',
        defaultValue: '95',
        options: [
          { label: '90% Confidence (α = 0.10)', value: '90' },
          { label: '95% Standard Confidence (α = 0.05)', value: '95' },
          { label: '99% Strict Confidence (α = 0.01)', value: '99' },
        ],
      },
      {
        id: 'powerLevel',
        label: 'Statistical Power (1 − β)',
        type: 'select',
        defaultValue: '80',
        options: [
          { label: '80% Standard Power (β = 0.20)', value: '80' },
          { label: '90% High Power (β = 0.10)', value: '90' },
          { label: '95% Very High Power (β = 0.05)', value: '95' },
        ],
      },
      { id: 'dailyTraffic', label: 'Total Daily Test Visitors (Both Variants)', defaultValue: 2500, type: 'number', min: 10, max: 10000000, step: 100, advanced: true },
    ],
    calculate: (v) => {
      const basePct = parseNum(v.baselineRatePct);
      const liftPct = parseNum(v.mdeRelativePct);
      const confPct = parseNum(v.significanceLevel || 95);
      const pwrPct = parseNum(v.powerLevel || 80);
      const daily = v.dailyTraffic === undefined ? 2500 : parseNum(v.dailyTraffic);

      if ([basePct, liftPct, confPct, pwrPct, daily].some(isNaN) || basePct <= 0 || basePct >= 100 || liftPct <= 0 || daily <= 0) {
        return calcError('Baseline rate (0–100%), relative lift (>0%), and daily traffic must be positive.');
      }

      const p1 = basePct / 100;
      const p2 = p1 * (1 + liftPct / 100);
      if (p2 >= 1) {
        return calcError('Target variant conversion rate (baseline × (1 + lift)) must remain below 100%.');
      }

      const alpha = 1 - confPct / 100;
      const beta = 1 - pwrPct / 100;
      const zAlpha = inverseNormalCdf(1 - alpha / 2);
      const zBeta = inverseNormalCdf(1 - beta);

      const pBar = (p1 + p2) / 2;
      const seNull = Math.sqrt(2 * pBar * (1 - pBar));
      const seAlt = Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2));
      const nPerVariant = Math.ceil(Math.pow((zAlpha * seNull + zBeta * seAlt) / (p2 - p1), 2));
      const totalSample = nPerVariant * 2;
      const estDays = Math.ceil(totalSample / daily);

      return {
        primaryValue: nPerVariant,
        primaryUnit: `Users Per Variant (${totalSample.toLocaleString()} Total Across A & B)`,
        secondaryOutputs: [
          { label: 'Total Test Visitors (A + B)', value: totalSample.toLocaleString(), unit: 'users' },
          { label: 'Target Variant Rate (B)', value: fmt(p2 * 100, 2), unit: `%(+${fmt((p2 - p1) * 100, 2)} pp)` },
          { label: 'Estimated Test Duration', value: `${estDays} days`, unit: `(@ ${daily.toLocaleString()}/day)` },
          { label: 'Z-Criticals Used', value: `Z_α/2=${fmt(zAlpha, 3)}, Z_β=${fmt(zBeta, 3)}` },
        ],
        steps: [
          `Rates: Control p₁ = ${fmt(p1 * 100, 2)}% vs. Treatment p₂ = ${fmt(p2 * 100, 2)}% (Δ = ${fmt((p2 - p1) * 100, 2)} percentage points).`,
          `Two-tailed Z-Test critical values for ${confPct}% confidence / ${pwrPct}% power: Z_α/2 = ${fmt(zAlpha, 3)}, Z_β = ${fmt(zBeta, 3)}.`,
          `Required sample = ${nPerVariant.toLocaleString()} per variant (${totalSample.toLocaleString()} combined; ~${estDays} days at ${daily.toLocaleString()} daily visitors).`,
        ],
      };
    },
  },

  // 544. Pearson Correlation & Linear Regression Calculator
  {
    slug: 'linear-regression-calculator',
    title: 'Linear Regression & Correlation (r, R²) Calculator',
    category: 'statistics-probability',
    formulaDisplay: 'ŷ = b₁x + b₀  |  b₁ = Σ(x−x̄)(y−ȳ) ÷ Σ(x−x̄)²  |  R² = r²',
    inputs: [
      { id: 'xValues', label: 'Independent Variable (X, comma-separated)', defaultValue: '1, 2, 3, 4, 5, 6', type: 'text' },
      { id: 'yValues', label: 'Dependent Variable (Y, comma-separated)', defaultValue: '2.1, 3.9, 6.2, 7.8, 10.1, 11.9', type: 'text' },
      { id: 'predictX', label: 'Predict Y at New Value X =', defaultValue: 7, type: 'number', step: 'any' },
    ],
    calculate: (v) => {
      const xs = parseNumberList(String(v.xValues || ''));
      const ys = parseNumberList(String(v.yValues || ''));
      const xNew = parseNum(v.predictX);

      if (xs.length < 2 || ys.length < 2 || xs.length !== ys.length) {
        return calcError('Provide equal-length lists of at least 2 numeric X and Y observations.');
      }

      const n = xs.length;
      const meanX = xs.reduce((a, b) => a + b, 0) / n;
      const meanY = ys.reduce((a, b) => a + b, 0) / n;

      let sxx = 0;
      let syy = 0;
      let sxy = 0;
      for (let i = 0; i < n; i++) {
        const dx = xs[i] - meanX;
        const dy = ys[i] - meanY;
        sxx += dx * dx;
        syy += dy * dy;
        sxy += dx * dy;
      }

      if (sxx === 0) {
        return calcError('X values have zero variance (all X observations are identical); regression slope is undefined.');
      }

      const slope = sxy / sxx;
      const intercept = meanY - slope * meanX;
      const r = syy === 0 ? 1 : sxy / Math.sqrt(sxx * syy);
      const r2 = r * r;

      let sse = 0;
      for (let i = 0; i < n; i++) {
        const pred = slope * xs[i] + intercept;
        sse += Math.pow(ys[i] - pred, 2);
      }
      const see = n > 2 ? Math.sqrt(sse / (n - 2)) : 0;
      const predY = !isNaN(xNew) ? slope * xNew + intercept : NaN;

      return {
        primaryValue: fmt(r2, 4),
        primaryUnit: `R² Coefficient of Determination (r = ${fmt(r, 4)})`,
        secondaryOutputs: [
          { label: 'OLS Regression Equation', value: `ŷ = ${fmt(slope, 4)}x ${intercept >= 0 ? '+' : '−'} ${fmt(Math.abs(intercept), 4)}` },
          { label: 'Slope (b₁)', value: fmt(slope, 4) },
          { label: 'Y-Intercept (b₀)', value: fmt(intercept, 4) },
          { label: 'Pearson Correlation (r)', value: fmt(r, 4) },
          { label: 'Std Error of Estimate (SEE)', value: fmt(see, 4) },
          { label: `Predicted ŷ(x=${isNaN(xNew) ? '?' : xNew})`, value: isNaN(predY) ? 'N/A' : fmt(predY, 4) },
        ],
        steps: [
          `Parsed n = ${n} pairs: x̄ = ${fmt(meanX, 4)}, ȳ = ${fmt(meanY, 4)}.`,
          `Sum of Squares: Sxx = ${fmt(sxx, 4)}, Syy = ${fmt(syy, 4)}, Sxy = ${fmt(sxy, 4)} → Slope b₁ = ${fmt(slope, 4)}, Intercept b₀ = ${fmt(intercept, 4)}.`,
          `Pearson r = ${fmt(r, 4)} → R² = ${fmt(r2 * 100, 2)}% variance explained; SEE = ${fmt(see, 4)}.`,
        ],
      };
    },
  },

  // 545. Bayes' Theorem & Diagnostic Test Probability Calculator
  {
    slug: 'bayes-theorem-calculator',
    title: "Bayes' Theorem & Diagnostic Probability Calculator",
    category: 'statistics-probability',
    formulaDisplay: 'P(A|B) = [P(B|A)·P(A)] ÷ [P(B|A)·P(A) + P(B|¬A)·(1 − P(A))]',
    inputs: [
      { id: 'priorPct', label: 'Prior Prevalence P(A) (%)', defaultValue: 2.0, type: 'number', min: 0.01, max: 99.99, step: 0.5, unit: '%', helpText: 'Base disease prevalence or prior event probability before test/signal.' },
      { id: 'sensitivityPct', label: 'True Positive Rate / Sensitivity P(B|A) (%)', defaultValue: 95.0, type: 'number', min: 0.1, max: 100, step: 1, unit: '%' },
      { id: 'specificityPct', label: 'True Negative Rate / Specificity P(¬B|¬A) (%)', defaultValue: 92.0, type: 'number', min: 0.1, max: 100, step: 1, unit: '%', helpText: 'False Positive Rate = 100% − Specificity.' },
    ],
    calculate: (v) => {
      const prior = parseNum(v.priorPct) / 100;
      const sens = parseNum(v.sensitivityPct) / 100;
      const spec = parseNum(v.specificityPct) / 100;

      if ([prior, sens, spec].some(isNaN) || prior <= 0 || prior >= 1 || sens <= 0 || sens > 1 || spec <= 0 || spec > 1) {
        return calcError('Prior (0–100%), sensitivity (>0–100%), and specificity (>0–100%) must be valid probabilities.');
      }

      const fpRate = 1 - spec;
      const tp = sens * prior;
      const fp = fpRate * (1 - prior);
      const pPos = tp + fp;
      const ppv = pPos > 0 ? (tp / pPos) * 100 : 0;

      const fn = (1 - sens) * prior;
      const tn = spec * (1 - prior);
      const pNeg = fn + tn;
      const npv = pNeg > 0 ? (tn / pNeg) * 100 : 0;

      const lrPlus = fpRate > 0 ? sens / fpRate : Infinity;
      const lrMinus = spec > 0 ? (1 - sens) / spec : 0;

      return {
        primaryValue: fmt(ppv, 2),
        primaryUnit: `% Posterior Probability P(A|B) (Positive Predictive Value)`,
        secondaryOutputs: [
          { label: 'Negative Predictive Value (NPV)', value: fmt(npv, 2), unit: '%' },
          { label: 'False Positive Rate P(B|¬A)', value: fmt(fpRate * 100, 2), unit: '%' },
          { label: 'Positive Likelihood Ratio (LR+)', value: Number.isFinite(lrPlus) ? fmt(lrPlus, 2) : '∞' },
          { label: 'Negative Likelihood Ratio (LR−)', value: fmt(lrMinus, 3) },
          { label: 'Per 10,000 Tested (TP / FP)', value: `${Math.round(tp * 10000)} TP / ${Math.round(fp * 10000)} FP` },
        ],
        steps: [
          `True Positives P(A∩B) = ${fmt(sens * 100, 1)}% × ${fmt(prior * 100, 2)}% = ${fmt(tp * 100, 3)}%; False Positives = ${fmt(fpRate * 100, 1)}% × ${fmt((1 - prior) * 100, 2)}% = ${fmt(fp * 100, 3)}%.`,
          `Posterior PPV = ${fmt(tp * 100, 3)}% ÷ (${fmt(tp * 100, 3)}% + ${fmt(fp * 100, 3)}%) = ${fmt(ppv, 2)}% (NPV = ${fmt(npv, 2)}%).`,
          `Notice how low base prevalence (${fmt(prior * 100, 2)}%) yields ${Math.round(fp * 10000)} false positives vs ${Math.round(tp * 10000)} true positives per 10,000 cases.`,
        ],
      };
    },
  },

  // 546. Normal Distribution Probability & Percentile Calculator
  {
    slug: 'normal-distribution-calculator',
    title: 'Normal Distribution Probability & Z Calculator',
    category: 'statistics-probability',
    formulaDisplay: 'Z = (X − μ) ÷ σ   |   P(X ≤ x) = ½[1 + erf(Z ÷ √2)]',
    inputs: [
      { id: 'mean', label: 'Population Mean (μ)', defaultValue: 100, type: 'number', step: 'any' },
      { id: 'sd', label: 'Standard Deviation (σ > 0)', defaultValue: 15, type: 'number', min: 0.0001, step: 0.5 },
      {
        id: 'mode',
        label: 'Probability Interval Mode',
        type: 'select',
        defaultValue: 'single',
        options: [
          { label: 'Single Cutoff X (Left Tail, Right Tail, Percentile)', value: 'single' },
          { label: 'Range Interval P(a ≤ X ≤ b)', value: 'interval' },
        ],
      },
      {
        id: 'xVal',
        label: 'Observed Value (X)',
        defaultValue: 120,
        type: 'number',
        step: 'any',
        visibleWhen: (v) => String(v.mode || 'single') === 'single',
      },
      {
        id: 'lowerA',
        label: 'Lower Bound (a)',
        defaultValue: 85,
        type: 'number',
        step: 'any',
        visibleWhen: (v) => String(v.mode || 'single') === 'interval',
      },
      {
        id: 'upperB',
        label: 'Upper Bound (b)',
        defaultValue: 130,
        type: 'number',
        step: 'any',
        visibleWhen: (v) => String(v.mode || 'single') === 'interval',
      },
    ],
    calculate: (v) => {
      const mu = parseNum(v.mean);
      const sd = parseNum(v.sd);
      const mode = String(v.mode || 'single');

      if (isNaN(mu) || isNaN(sd) || sd <= 0) {
        return calcError('Mean must be numeric and Standard Deviation (σ) must be strictly positive.');
      }

      if (mode === 'interval') {
        const a = parseNum(v.lowerA);
        const b = parseNum(v.upperB);
        if (isNaN(a) || isNaN(b) || a > b) {
          return calcError('Ensure Lower Bound a ≤ Upper Bound b.');
        }
        const za = (a - mu) / sd;
        const zb = (b - mu) / sd;
        const probBetween = (normalCdf(zb) - normalCdf(za)) * 100;

        return {
          primaryValue: fmt(probBetween, 3),
          primaryUnit: `% Probability P(${a} ≤ X ≤ ${b})`,
          secondaryOutputs: [
            { label: 'Lower Z-Score (Z_a)', value: fmt(za, 4) },
            { label: 'Upper Z-Score (Z_b)', value: fmt(zb, 4) },
            { label: 'Outside Interval P(X<a or X>b)', value: fmt(100 - probBetween, 3), unit: '%' },
          ],
          steps: [
            `Standardize bounds: Z_a = (${a} − ${mu}) ÷ ${sd} = ${fmt(za, 4)}; Z_b = (${b} − ${mu}) ÷ ${sd} = ${fmt(zb, 4)}.`,
            `P(${a} ≤ X ≤ ${b}) = Φ(${fmt(zb, 3)}) − Φ(${fmt(za, 3)}) = ${fmt(probBetween, 3)}%.`,
          ],
        };
      }

      const x = parseNum(v.xVal);
      if (isNaN(x)) return calcError('Observed cutoff X must be numeric.');

      const z = (x - mu) / sd;
      const pLeft = normalCdf(z) * 100;
      const pRight = (1 - normalCdf(z)) * 100;
      const pTwoTail = 2 * Math.min(pLeft, pRight);

      return {
        primaryValue: fmt(pLeft, 3),
        primaryUnit: `% Cumulative P(X ≤ ${x}) · Z = ${fmt(z, 3)}`,
        secondaryOutputs: [
          { label: 'Standardized Z-Score', value: fmt(z, 4) },
          { label: `Left-Tail Probability P(X ≤ ${x})`, value: fmt(pLeft, 4), unit: '%' },
          { label: `Right-Tail Probability P(X > ${x})`, value: fmt(pRight, 4), unit: '%' },
          { label: 'Symmetric Two-Tail P(|Z| ≥ |z|)', value: fmt(pTwoTail, 4), unit: '%' },
        ],
        steps: [
          `Standardize X = ${x}: Z = (${x} − ${mu}) ÷ ${sd} = ${fmt(z, 4)}.`,
          `Standard Normal CDF Φ(${fmt(z, 4)}) = ${fmt(pLeft, 4)}% (Right tail = ${fmt(pRight, 4)}%; Two-tailed = ${fmt(pTwoTail, 4)}%).`,
        ],
      };
    },
  },

  // 547. Matrix Determinant & Inverse Calculator (2x2 & 3x3)
  {
    slug: 'matrix-calculator',
    title: 'Matrix Determinant & Inverse Calculator',
    category: 'math',
    formulaDisplay: 'A⁻¹ = (1 ÷ det(A)) × adj(A)   (Invertible iff det(A) ≠ 0)',
    inputs: [
      {
        id: 'size',
        label: 'Square Matrix Dimension',
        type: 'select',
        defaultValue: '3',
        options: [
          { label: '3 × 3 Matrix', value: '3' },
          { label: '2 × 2 Matrix', value: '2' },
        ],
      },
      { id: 'a11', label: 'Row 1, Col 1 (a₁₁)', defaultValue: 4, type: 'number', step: 'any' },
      { id: 'a12', label: 'Row 1, Col 2 (a₁₂)', defaultValue: 7, type: 'number', step: 'any' },
      { id: 'a13', label: 'Row 1, Col 3 (a₁₃)', defaultValue: 2, type: 'number', step: 'any', visibleWhen: (v) => String(v.size || '3') === '3' },
      { id: 'a21', label: 'Row 2, Col 1 (a₂₁)', defaultValue: 2, type: 'number', step: 'any' },
      { id: 'a22', label: 'Row 2, Col 2 (a₂₂)', defaultValue: 6, type: 'number', step: 'any' },
      { id: 'a23', label: 'Row 2, Col 3 (a₂₃)', defaultValue: 1, type: 'number', step: 'any', visibleWhen: (v) => String(v.size || '3') === '3' },
      { id: 'a31', label: 'Row 3, Col 1 (a₃₁)', defaultValue: 1, type: 'number', step: 'any', visibleWhen: (v) => String(v.size || '3') === '3' },
      { id: 'a32', label: 'Row 3, Col 2 (a₃₂)', defaultValue: 0, type: 'number', step: 'any', visibleWhen: (v) => String(v.size || '3') === '3' },
      { id: 'a33', label: 'Row 3, Col 3 (a₃₃)', defaultValue: 3, type: 'number', step: 'any', visibleWhen: (v) => String(v.size || '3') === '3' },
    ],
    calculate: (v) => {
      const sz = String(v.size || '3');
      const a11 = parseNum(v.a11), a12 = parseNum(v.a12);
      const a21 = parseNum(v.a21), a22 = parseNum(v.a22);

      if (sz === '2') {
        if ([a11, a12, a21, a22].some(isNaN)) return calcError('Enter valid numeric entries for all 2×2 cells.');
        const det = a11 * a22 - a12 * a21;
        const trace = a11 + a22;
        const invertible = Math.abs(det) > 1e-12;
        const invStr = invertible
          ? `[${fmt(a22 / det, 4)}, ${fmt(-a12 / det, 4)}] | [${fmt(-a21 / det, 4)}, ${fmt(a11 / det, 4)}]`
          : 'Singular Matrix (det = 0, No Inverse)';

        return {
          primaryValue: fmt(det, 4),
          primaryUnit: `Determinant det(A) (${invertible ? 'Invertible' : 'Singular'})`,
          secondaryOutputs: [
            { label: 'Inverse Matrix A⁻¹', value: invStr },
            { label: 'Matrix Trace tr(A)', value: fmt(trace, 4) },
            { label: 'Adjugate Matrix adj(A)', value: `[${a22}, ${-a12}] | [${-a21}, ${a11}]` },
          ],
          steps: [
            `2×2 Determinant: (${a11}×${a22}) − (${a12}×${a21}) = ${fmt(det, 4)}; Trace = ${a11} + ${a22} = ${fmt(trace, 4)}.`,
            `Inverse A⁻¹ = (1 ÷ ${fmt(det, 4)}) × adj(A) → ${invStr}.`,
          ],
        };
      }

      const a13 = parseNum(v.a13), a23 = parseNum(v.a23);
      const a31 = parseNum(v.a31), a32 = parseNum(v.a32), a33 = parseNum(v.a33);
      if ([a11, a12, a13, a21, a22, a23, a31, a32, a33].some(isNaN)) {
        return calcError('Enter valid numeric entries for all nine 3×3 matrix cells.');
      }

      const c11 = a22 * a33 - a23 * a32;
      const c12 = -(a21 * a33 - a23 * a31);
      const c13 = a21 * a32 - a22 * a31;
      const c21 = -(a12 * a33 - a13 * a32);
      const c22 = a11 * a33 - a13 * a31;
      const c23 = -(a11 * a32 - a12 * a31);
      const c31 = a12 * a23 - a13 * a22;
      const c32 = -(a11 * a23 - a13 * a21);
      const c33 = a11 * a22 - a12 * a21;

      const det = a11 * c11 + a12 * c12 + a13 * c13;
      const trace = a11 + a22 + a33;
      const invertible = Math.abs(det) > 1e-12;

      return {
        primaryValue: fmt(det, 4),
        primaryUnit: `Determinant det(A) (${invertible ? 'Invertible' : 'Singular'})`,
        secondaryOutputs: [
          { label: 'A⁻¹ Row 1', value: invertible ? `[${fmt(c11 / det, 4)}, ${fmt(c21 / det, 4)}, ${fmt(c31 / det, 4)}]` : 'Singular' },
          { label: 'A⁻¹ Row 2', value: invertible ? `[${fmt(c12 / det, 4)}, ${fmt(c22 / det, 4)}, ${fmt(c32 / det, 4)}]` : 'Singular' },
          { label: 'A⁻¹ Row 3', value: invertible ? `[${fmt(c13 / det, 4)}, ${fmt(c23 / det, 4)}, ${fmt(c33 / det, 4)}]` : 'Singular' },
          { label: 'Matrix Trace tr(A)', value: fmt(trace, 4) },
        ],
        steps: [
          `Cofactor Expansion Row 1: ${a11}(${fmt(c11, 2)}) + ${a12}(${fmt(c12, 2)}) + ${a13}(${fmt(c13, 2)}) = det(A) = ${fmt(det, 4)}.`,
          invertible
            ? `Transposing the 3×3 cofactor matrix into adj(A) and dividing by ${fmt(det, 4)} yields exact inverse A⁻¹.`
            : 'Determinant equals 0, so the matrix is singular and has no multiplicative inverse.',
        ],
      };
    },
  },

  // 548. Prime Factorization, GCD & LCM Calculator
  {
    slug: 'gcd-lcm-prime-calculator',
    title: 'GCD, LCM & Prime Factorization Calculator',
    category: 'math',
    formulaDisplay: 'LCM(a,b) = |a × b| ÷ GCD(a,b)   |   Fundamental Theorem of Arithmetic',
    inputs: [
      { id: 'numbersList', label: 'Positive Integers (comma-separated, e.g. 24, 36, 60)', defaultValue: '24, 36, 60', type: 'text' },
    ],
    calculate: (v) => {
      const nums = parseNumberList(String(v.numbersList || ''));
      if (nums.length < 2 || nums.some((n) => !Number.isInteger(n) || n < 1 || n > 1e12)) {
        return calcError('Provide at least two positive integers between 1 and 1,000,000,000,000.');
      }

      let curGcd = nums[0];
      let curLcm = nums[0];
      for (let i = 1; i < nums.length; i++) {
        curGcd = gcdTwo(curGcd, nums[i]);
        const nextG = gcdTwo(curLcm, nums[i]);
        curLcm = (curLcm / nextG) * nums[i];
      }

      const factorizations = nums.slice(0, 4).map((n) => `${n} = ${factorizeInt(n)}`).join('  |  ');
      const lcmDisplay = curLcm <= 1e15 ? curLcm : Number(curLcm.toExponential(6));

      return {
        primaryValue: curGcd,
        primaryUnit: `GCD (${curGcd === 1 ? 'Coprime Set' : 'Greatest Common Divisor'} · LCM = ${curLcm <= 1e12 ? curLcm.toLocaleString() : curLcm.toExponential(4)})`,
        secondaryOutputs: [
          { label: 'Least Common Multiple (LCM)', value: curLcm <= 1e12 ? curLcm.toLocaleString() : curLcm.toExponential(4) },
          { label: 'GCD Prime Breakdown', value: factorizeInt(curGcd) },
          { label: 'Coprime Check (GCD = 1?)', value: curGcd === 1 ? 'Yes — Relatively Prime' : `No (Common Factor ${curGcd})` },
          { label: 'Input Prime Factorizations', value: factorizations },
        ],
        steps: [
          `Applying Euclidean division pairwise across [${nums.join(', ')}] yields GCD = ${curGcd}.`,
          `Applying LCM(a,b) = (a ÷ GCD) × b yields LCM = ${curLcm <= 1e15 ? curLcm.toLocaleString() : lcmDisplay}.`,
          `Prime Factorizations: ${factorizations}.`,
        ],
      };
    },
  },

  // 549. Ideal Gas Law (PV = nRT) Calculator
  {
    slug: 'ideal-gas-law-calculator',
    title: 'Ideal Gas Law (PV = nRT) Calculator',
    category: 'science',
    formulaDisplay: 'PV = nRT   (R = 8.3144626 L·kPa·K⁻¹·mol⁻¹ = 0.0820573 L·atm·K⁻¹·mol⁻¹)',
    inputs: [
      {
        id: 'solveFor',
        label: 'Solve Unknown Variable',
        type: 'select',
        defaultValue: 'P',
        options: [
          { label: 'Solve Pressure (P)', value: 'P' },
          { label: 'Solve Volume (V)', value: 'V' },
          { label: 'Solve Moles of Gas (n)', value: 'n' },
          { label: 'Solve Temperature (T)', value: 'T' },
        ],
      },
      { id: 'pressureKpa', label: 'Pressure (kPa)', defaultValue: 101.325, type: 'number', min: 0.001, step: 1, unit: 'kPa', visibleWhen: (v) => String(v.solveFor || 'P') !== 'P' },
      { id: 'volumeL', label: 'Volume (Liters)', defaultValue: 22.414, type: 'number', min: 0.001, step: 0.5, unit: 'L', visibleWhen: (v) => String(v.solveFor || 'P') !== 'V' },
      { id: 'molesN', label: 'Amount of Gas (Moles)', defaultValue: 1.0, type: 'number', min: 0.0001, step: 0.1, unit: 'mol', visibleWhen: (v) => String(v.solveFor || 'P') !== 'n' },
      { id: 'tempC', label: 'Temperature (°C)', defaultValue: 25.0, type: 'number', min: -273, max: 10000, step: 1, unit: '°C', visibleWhen: (v) => String(v.solveFor || 'P') !== 'T' },
    ],
    calculate: (v) => {
      const solveFor = String(v.solveFor || 'P');
      const R = 8.314462618; // SI CODATA exact J / (mol * K) = kPa * L / (mol * K)
      const p = parseNum(v.pressureKpa);
      const vol = parseNum(v.volumeL);
      const n = parseNum(v.molesN);
      const tempK = parseNum(v.tempC) + 273.15;

      if (solveFor === 'P') {
        if ([vol, n, tempK].some(isNaN) || vol <= 0 || n <= 0 || tempK <= 0) {
          return calcError('Volume, moles, and absolute temperature (> −273.15 °C) must be positive.');
        }
        const calcP = (n * R * tempK) / vol;
        return {
          primaryValue: fmt(calcP, 3),
          primaryUnit: `kPa Absolute Pressure (${fmt(calcP / 101.325, 4)} atm · ${fmt(calcP * 0.145038, 2)} psi)`,
          secondaryOutputs: [
            { label: 'Atmospheres (atm)', value: fmt(calcP / 101.325, 4), unit: 'atm' },
            { label: 'Pounds per Sq Inch (psi)', value: fmt(calcP * 0.145038, 2), unit: 'psi' },
            { label: 'Absolute Temperature', value: fmt(tempK, 2), unit: 'K' },
          ],
          steps: [
            `T(K) = ${fmt(tempK - 273.15, 2)} °C + 273.15 = ${fmt(tempK, 2)} K.`,
            `P = (${n} mol × 8.3145 × ${fmt(tempK, 2)} K) ÷ ${vol} L = ${fmt(calcP, 3)} kPa (${fmt(calcP / 101.325, 4)} atm).`,
          ],
        };
      }

      if (solveFor === 'V') {
        if ([p, n, tempK].some(isNaN) || p <= 0 || n <= 0 || tempK <= 0) {
          return calcError('Pressure, moles, and absolute temperature (> −273.15 °C) must be positive.');
        }
        const calcV = (n * R * tempK) / p;
        return {
          primaryValue: fmt(calcV, 3),
          primaryUnit: `Liters Gas Volume (${fmt(calcV * 0.001, 4)} m³)`,
          secondaryOutputs: [
            { label: 'Cubic Meters (m³)', value: fmt(calcV * 0.001, 5), unit: 'm³' },
            { label: 'US Gallons', value: fmt(calcV * 0.264172, 3), unit: 'gal' },
            { label: 'Pressure in atm', value: fmt(p / 101.325, 4), unit: 'atm' },
          ],
          steps: [`V = (${n} mol × 8.3145 × ${fmt(tempK, 2)} K) ÷ ${p} kPa = ${fmt(calcV, 3)} L.`],
        };
      }

      if (solveFor === 'n') {
        if ([p, vol, tempK].some(isNaN) || p <= 0 || vol <= 0 || tempK <= 0) {
          return calcError('Pressure, volume, and absolute temperature (> −273.15 °C) must be positive.');
        }
        const calcN = (p * vol) / (R * tempK);
        return {
          primaryValue: fmt(calcN, 4),
          primaryUnit: `mol Moles of Gas`,
          secondaryOutputs: [
            { label: 'Approx Molecules (×10²³)', value: fmt(calcN * 6.02214, 3), unit: '× 10²³' },
            { label: 'Absolute Temperature', value: fmt(tempK, 2), unit: 'K' },
          ],
          steps: [`n = (${p} kPa × ${vol} L) ÷ (8.3145 × ${fmt(tempK, 2)} K) = ${fmt(calcN, 4)} mol.`],
        };
      }

      // Solve T
      if ([p, vol, n].some(isNaN) || p <= 0 || vol <= 0 || n <= 0) {
        return calcError('Pressure, volume, and moles must all be positive.');
      }
      const calcTk = (p * vol) / (n * R);
      const calcTc = calcTk - 273.15;
      return {
        primaryValue: fmt(calcTc, 2),
        primaryUnit: `°C Gas Temperature (${fmt(calcTk, 2)} K · ${fmt(calcTc * 1.8 + 32, 2)} °F)`,
        secondaryOutputs: [
          { label: 'Absolute Kelvin (K)', value: fmt(calcTk, 2), unit: 'K' },
          { label: 'Fahrenheit (°F)', value: fmt(calcTc * 1.8 + 32, 2), unit: '°F' },
        ],
        steps: [`T(K) = (${p} × ${vol}) ÷ (${n} × 8.3145) = ${fmt(calcTk, 2)} K → ${fmt(calcTc, 2)} °C.`],
      };
    },
  },

  // 550. Decibel (dB), dBm & Acoustic Attenuation Calculator
  {
    slug: 'decibel-calculator',
    title: 'Decibel (dB), dBm & Sound Attenuation Calculator',
    category: 'science',
    formulaDisplay: 'Power: 10·log₁₀(P₂/P₁)  |  SPL/Voltage: 20·log₁₀(V₂/V₁)  |  ΔdB = −20·log₁₀(r₂/r₁)',
    inputs: [
      {
        id: 'mode',
        label: 'Engineering Decibel Mode',
        type: 'select',
        defaultValue: 'power',
        options: [
          { label: 'Power Ratio Gain / Loss (10·log₁₀ P₂/P₁)', value: 'power' },
          { label: 'Voltage / Sound Pressure Ratio (20·log₁₀ V₂/V₁)', value: 'voltage' },
          { label: 'Free-Field Acoustic Distance Drop (-20·log₁₀ r₂/r₁)', value: 'distance' },
        ],
      },
      { id: 'refPowerW', label: 'Reference Input Power (P₁, Watts)', defaultValue: 0.001, type: 'number', min: 1e-12, step: 0.001, unit: 'W', visibleWhen: (v) => String(v.mode || 'power') === 'power' },
      { id: 'measPowerW', label: 'Measured Output Power (P₂, Watts)', defaultValue: 0.1, type: 'number', min: 1e-12, step: 0.01, unit: 'W', visibleWhen: (v) => String(v.mode || 'power') === 'power' },
      { id: 'refAmpV', label: 'Reference Amplitude / Voltage (V₁)', defaultValue: 1.0, type: 'number', min: 1e-9, step: 0.1, visibleWhen: (v) => String(v.mode || 'power') === 'voltage' },
      { id: 'measAmpV', label: 'Measured Amplitude / Voltage (V₂)', defaultValue: 10.0, type: 'number', min: 1e-9, step: 0.5, visibleWhen: (v) => String(v.mode || 'power') === 'voltage' },
      { id: 'splAtR1', label: 'Known Sound Level at Distance r₁ (dB SPL)', defaultValue: 95, type: 'number', min: 0, max: 200, step: 1, unit: 'dB', visibleWhen: (v) => String(v.mode || 'power') === 'distance' },
      { id: 'r1Meters', label: 'Reference Distance r₁ (m)', defaultValue: 2, type: 'number', min: 0.05, max: 10000, step: 0.5, unit: 'm', visibleWhen: (v) => String(v.mode || 'power') === 'distance' },
      { id: 'r2Meters', label: 'Listener Distance r₂ (m)', defaultValue: 20, type: 'number', min: 0.05, max: 100000, step: 1, unit: 'm', visibleWhen: (v) => String(v.mode || 'power') === 'distance' },
    ],
    calculate: (v) => {
      const mode = String(v.mode || 'power');

      if (mode === 'power') {
        const p1 = parseNum(v.refPowerW);
        const p2 = parseNum(v.measPowerW);
        if (isNaN(p1) || isNaN(p2) || p1 <= 0 || p2 <= 0) {
          return calcError('Reference power P₁ and measured power P₂ must both be strictly positive.');
        }
        const db = 10 * Math.log10(p2 / p1);
        const dbmOut = 10 * Math.log10(p2 * 1000);
        return {
          primaryValue: fmt(db, 2),
          primaryUnit: `dB Power Gain/Loss (${fmt(p2 / p1, 4)}x Ratio)`,
          secondaryOutputs: [
            { label: 'RF Power Level (P₂ in dBm)', value: fmt(dbmOut, 2), unit: 'dBm (re 1 mW)' },
            { label: 'Linear Power Ratio (P₂ / P₁)', value: `${fmt(p2 / p1, 4)}x` },
          ],
          steps: [
            `10 × log₁₀(${p2} ÷ ${p1}) = ${fmt(db, 2)} dB.`,
            `Relative to 1 mW (0.001 W), P₂ = ${fmt(dbmOut, 2)} dBm.`,
          ],
        };
      }

      if (mode === 'voltage') {
        const v1 = parseNum(v.refAmpV);
        const v2 = parseNum(v.measAmpV);
        if (isNaN(v1) || isNaN(v2) || v1 <= 0 || v2 <= 0) {
          return calcError('Reference and measured amplitudes must both be strictly positive.');
        }
        const db = 20 * Math.log10(v2 / v1);
        return {
          primaryValue: fmt(db, 2),
          primaryUnit: `dB Field / Voltage Gain (${fmt(v2 / v1, 4)}x Amplitude)`,
          secondaryOutputs: [
            { label: 'Amplitude Ratio (V₂ / V₁)', value: `${fmt(v2 / v1, 4)}x` },
            { label: 'Equivalent Power Ratio', value: `${fmt(Math.pow(v2 / v1, 2), 4)}x` },
          ],
          steps: [`20 × log₁₀(${v2} ÷ ${v1}) = ${fmt(db, 2)} dB.`],
        };
      }

      const spl1 = parseNum(v.splAtR1);
      const r1 = parseNum(v.r1Meters);
      const r2 = parseNum(v.r2Meters);
      if ([spl1, r1, r2].some(isNaN) || r1 <= 0 || r2 <= 0) {
        return calcError('Reference and target distances must be strictly positive.');
      }
      const deltaDb = -20 * Math.log10(r2 / r1);
      const spl2 = spl1 + deltaDb;
      return {
        primaryValue: fmt(spl2, 2),
        primaryUnit: `dB SPL at ${r2} m (${deltaDb >= 0 ? '+' : ''}${fmt(deltaDb, 2)} dB Change)`,
        secondaryOutputs: [
          { label: 'Acoustic Attenuation (ΔdB)', value: fmt(deltaDb, 2), unit: 'dB' },
          { label: 'Distance Ratio (r₂ / r₁)', value: `${fmt(r2 / r1, 2)}x` },
        ],
        steps: [
          `Inverse Square Law: ΔdB = −20 × log₁₀(${r2} ÷ ${r1}) = ${fmt(deltaDb, 2)} dB.`,
          `Predicted Sound Level at ${r2} m = ${spl1} + (${fmt(deltaDb, 2)}) = ${fmt(spl2, 2)} dB SPL.`,
        ],
      };
    },
  },
];
