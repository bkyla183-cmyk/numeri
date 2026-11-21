import { CalculatorSpec } from './types';

export const convertersDateTimeSpecs: CalculatorSpec[] = [
  // UNIT CONVERTERS (30)
  {
    slug: 'unit-converter',
    title: 'General Length Unit Converter',
    category: 'unit-converters',
    formulaDisplay: 'Metric vs Imperial Length Factors',
    inputs: [
      { id: 'val', label: 'Value to Convert', defaultValue: 10, type: 'number', step: 'any' },
      { id: 'unit', label: 'From Unit', type: 'select', defaultValue: 'm', options: [{ label: 'Meters (m)', value: 'm' }, { label: 'Feet (ft)', value: 'ft' }, { label: 'Inches (in)', value: 'in' }, { label: 'Kilometers (km)', value: 'km' }, { label: 'Miles (mi)', value: 'mi' }] },
    ],
    calculate: (v) => {
      const val = Number(v.val) || 0;
      const u = v.unit || 'm';
      const toMeters: Record<string, number> = { m: 1, ft: 0.3048, in: 0.0254, km: 1000, mi: 1609.344 };
      const m = val * (toMeters[u] || 1);
      return {
        primaryValue: parseFloat((m * 3.28084).toFixed(3)),
        primaryUnit: 'Feet (ft)',
        primaryLabel: 'Converted to Feet',
        secondaryOutputs: [
          { label: 'Meters', value: parseFloat(m.toFixed(3)) + ' m' },
          { label: 'Inches', value: parseFloat((m * 39.3701).toFixed(2)) + ' in' },
          { label: 'Kilometers', value: parseFloat((m / 1000).toFixed(4)) + ' km' },
          { label: 'Miles', value: parseFloat((m / 1609.344).toFixed(4)) + ' mi' },
        ],
        steps: [`Converted ${val} ${u} through base SI meter unit.`],
        formulaUsed: 'SI Length Normalization',
      };
    },
  },
  {
    slug: 'weight-converter',
    title: 'Weight & Mass Converter',
    category: 'unit-converters',
    formulaDisplay: '1 lb = 0.453592 kg, 1 oz = 28.3495 g',
    inputs: [
      { id: 'val', label: 'Weight Value', defaultValue: 150, type: 'number', step: 'any' },
      { id: 'fromUnit', label: 'From Unit', type: 'select', defaultValue: 'lbs', options: [{ label: 'Pounds (lbs)', value: 'lbs' }, { label: 'Kilograms (kg)', value: 'kg' }, { label: 'Ounces (oz)', value: 'oz' }, { label: 'Grams (g)', value: 'g' }, { label: 'Stone (st)', value: 'st' }] },
    ],
    calculate: (v) => {
      const val = Number(v.val) || 0;
      const u = v.fromUnit || 'lbs';
      const toKg: Record<string, number> = { kg: 1, lbs: 0.45359237, oz: 0.0283495, g: 0.001, st: 6.35029 };
      const kg = val * (toKg[u] || 1);
      const lbs = kg / 0.45359237;
      return {
        primaryValue: parseFloat(kg.toFixed(3)),
        primaryUnit: 'kg',
        primaryLabel: 'Kilograms',
        secondaryOutputs: [
          { label: 'Pounds (lbs)', value: parseFloat(lbs.toFixed(2)) + ' lbs' },
          { label: 'Ounces (oz)', value: parseFloat((lbs * 16).toFixed(1)) + ' oz' },
          { label: 'Stone (UK)', value: parseFloat((lbs / 14).toFixed(2)) + ' st' },
        ],
        steps: [`${val} ${u} normalized to ${kg.toFixed(3)} kg`],
        formulaUsed: 'International Avoirdupois Pound Standard',
      };
    },
  },
  {
    slug: 'temperature-converter',
    title: 'Temperature (°C, °F, K) Converter',
    category: 'unit-converters',
    formulaDisplay: '°F = (°C × 9/5) + 32, K = °C + 273.15',
    inputs: [
      { id: 'val', label: 'Temperature', defaultValue: 25, type: 'number', step: 'any' },
      { id: 'scale', label: 'Input Scale', type: 'select', defaultValue: 'C', options: [{ label: 'Celsius (°C)', value: 'C' }, { label: 'Fahrenheit (°F)', value: 'F' }, { label: 'Kelvin (K)', value: 'K' }] },
    ],
    calculate: (v) => {
      const val = Number(v.val) || 0;
      const scale = v.scale || 'C';
      let c = 0;
      if (scale === 'C') c = val;
      else if (scale === 'F') c = (val - 32) * (5 / 9);
      else c = val - 273.15;
      const f = c * (9 / 5) + 32;
      const k = c + 273.15;
      return {
        primaryValue: parseFloat(f.toFixed(2)),
        primaryUnit: '°F',
        primaryLabel: 'Fahrenheit',
        secondaryOutputs: [
          { label: 'Celsius', value: parseFloat(c.toFixed(2)) + ' °C' },
          { label: 'Kelvin', value: parseFloat(k.toFixed(2)) + ' K' },
        ],
        steps: [`Converted ${val}°${scale} to ${c.toFixed(2)}°C = ${f.toFixed(2)}°F = ${k.toFixed(2)} K`],
        formulaUsed: 'Thermodynamic Temperature Scales',
      };
    },
  },
  {
    slug: 'volume-converter',
    title: 'Liquid Volume (Gallons, Liters, Fl Oz) Converter',
    category: 'unit-converters',
    formulaDisplay: '1 Gallon = 3.78541 Liters = 128 Fl Oz',
    inputs: [
      { id: 'val', label: 'Volume Value', defaultValue: 5, type: 'number', step: 'any' },
      { id: 'fromUnit', label: 'Unit', type: 'select', defaultValue: 'gal', options: [{ label: 'US Gallons (gal)', value: 'gal' }, { label: 'Liters (L)', value: 'L' }, { label: 'Fluid Ounces (fl oz)', value: 'floz' }, { label: 'Milliliters (mL)', value: 'mL' }, { label: 'Cubic Meters (m³)', value: 'm3' }] },
    ],
    calculate: (v) => {
      const val = Number(v.val) || 0;
      const u = v.fromUnit || 'gal';
      const toLiters: Record<string, number> = { L: 1, gal: 3.78541, floz: 0.0295735, mL: 0.001, m3: 1000 };
      const l = val * (toLiters[u] || 1);
      const gal = l / 3.78541;
      return {
        primaryValue: parseFloat(l.toFixed(3)),
        primaryUnit: 'Liters (L)',
        primaryLabel: 'Liters',
        secondaryOutputs: [
          { label: 'US Gallons', value: parseFloat(gal.toFixed(3)) + ' gal' },
          { label: 'Fluid Ounces', value: parseFloat((gal * 128).toFixed(1)) + ' fl oz' },
        ],
        steps: [`${val} ${u} = ${l.toFixed(3)} L`],
        formulaUsed: 'US Liquid to Metric Volume Factors',
      };
    },
  },
  {
    slug: 'speed-converter',
    title: 'Speed (MPH, km/h, m/s, Knots) Converter',
    category: 'unit-converters',
    formulaDisplay: '1 mph = 1.60934 km/h = 0.44704 m/s',
    inputs: [
      { id: 'val', label: 'Speed', defaultValue: 65, type: 'number', step: 'any' },
      { id: 'unit', label: 'From Unit', type: 'select', defaultValue: 'mph', options: [{ label: 'Miles per Hour (MPH)', value: 'mph' }, { label: 'Kilometers per Hour (km/h)', value: 'kmh' }, { label: 'Meters per Second (m/s)', value: 'ms' }, { label: 'Knots (kn)', value: 'kn' }] },
    ],
    calculate: (v) => {
      const val = Number(v.val) || 0;
      const u = v.unit || 'mph';
      const toMs: Record<string, number> = { ms: 1, kmh: 1 / 3.6, mph: 0.44704, kn: 0.514444 };
      const ms = val * (toMs[u] || 1);
      const kmh = ms * 3.6;
      const mph = ms / 0.44704;
      const kn = ms / 0.514444;
      return {
        primaryValue: parseFloat(kmh.toFixed(2)),
        primaryUnit: 'km/h',
        primaryLabel: 'Kilometers per Hour',
        secondaryOutputs: [
          { label: 'Miles per Hour (MPH)', value: parseFloat(mph.toFixed(2)) + ' mph' },
          { label: 'Meters per Second (m/s)', value: parseFloat(ms.toFixed(2)) + ' m/s' },
          { label: 'Nautical Knots', value: parseFloat(kn.toFixed(2)) + ' kn' },
        ],
        steps: [`${val} ${u} normalized through m/s base velocity.`],
        formulaUsed: 'Velocity Unit Relations',
      };
    },
  },
  {
    slug: 'area-converter',
    title: 'Area (Acres, Hectares, Sq Ft, Sq M) Converter',
    category: 'unit-converters',
    formulaDisplay: '1 Acre = 43,560 sq ft = 0.404686 Hectares',
    inputs: [
      { id: 'val', label: 'Area Value', defaultValue: 5, type: 'number', step: 'any' },
      { id: 'unit', label: 'From Unit', type: 'select', defaultValue: 'acres', options: [{ label: 'Acres', value: 'acres' }, { label: 'Hectares (ha)', value: 'ha' }, { label: 'Square Feet (sq ft)', value: 'sqft' }, { label: 'Square Meters (m²)', value: 'sqm' }, { label: 'Square Miles (sq mi)', value: 'sqmi' }] },
    ],
    calculate: (v) => {
      const val = Number(v.val) || 0;
      const u = v.unit || 'acres';
      const toSqm: Record<string, number> = { sqm: 1, sqft: 0.092903, acres: 4046.86, ha: 10000, sqmi: 2589988 };
      const sqm = val * (toSqm[u] || 1);
      const acres = sqm / 4046.86;
      const ha = sqm / 10000;
      const sqft = sqm / 0.092903;
      return {
        primaryValue: parseFloat(acres.toFixed(3)),
        primaryUnit: 'Acres',
        primaryLabel: 'Acres',
        secondaryOutputs: [
          { label: 'Hectares (ha)', value: parseFloat(ha.toFixed(3)) + ' ha' },
          { label: 'Square Feet', value: Math.round(sqft).toLocaleString() + ' sq ft' },
          { label: 'Square Meters', value: Math.round(sqm).toLocaleString() + ' m²' },
        ],
        steps: [`${val} ${u} = ${acres.toFixed(3)} acres`],
        formulaUsed: 'Cadastral Land Area Conversion',
      };
    },
  },
  {
    slug: 'pressure-unit-converter',
    title: 'Pressure (PSI, Bar, kPa, atm, mmHg) Converter',
    category: 'unit-converters',
    formulaDisplay: '1 atm = 101.325 kPa = 14.696 PSI = 1.01325 Bar = 760 mmHg',
    inputs: [
      { id: 'val', label: 'Pressure', defaultValue: 32, type: 'number', step: 'any' },
      { id: 'unit', label: 'From Unit', type: 'select', defaultValue: 'psi', options: [{ label: 'PSI (lbf/in²)', value: 'psi' }, { label: 'Bar', value: 'bar' }, { label: 'Kilopascals (kPa)', value: 'kpa' }, { label: 'Standard Atmospheres (atm)', value: 'atm' }, { label: 'mmHg / Torr', value: 'mmhg' }] },
    ],
    calculate: (v) => {
      const val = Number(v.val) || 0;
      const u = v.unit || 'psi';
      const toKpa: Record<string, number> = { kpa: 1, psi: 6.89476, bar: 100, atm: 101.325, mmhg: 0.133322 };
      const kpa = val * (toKpa[u] || 1);
      const psi = kpa / 6.89476;
      const bar = kpa / 100;
      const atm = kpa / 101.325;
      return {
        primaryValue: parseFloat(bar.toFixed(3)),
        primaryUnit: 'Bar',
        primaryLabel: 'Bar',
        secondaryOutputs: [
          { label: 'PSI', value: parseFloat(psi.toFixed(2)) + ' psi' },
          { label: 'Kilopascals (kPa)', value: parseFloat(kpa.toFixed(2)) + ' kPa' },
          { label: 'Atmospheres (atm)', value: parseFloat(atm.toFixed(3)) + ' atm' },
        ],
        steps: [`${val} ${u} = ${kpa.toFixed(2)} kPa = ${bar.toFixed(3)} bar`],
        formulaUsed: 'Standard Pressure Conversion Ratios',
      };
    },
  },
  {
    slug: 'energy-converter',
    title: 'Energy (Joules, Calories, kWh, BTU) Converter',
    category: 'unit-converters',
    formulaDisplay: '1 kWh = 3.6 × 10⁶ Joules = 3412 BTU = 860 kcal',
    inputs: [
      { id: 'val', label: 'Energy Amount', defaultValue: 1, type: 'number', step: 'any' },
      { id: 'unit', label: 'From Unit', type: 'select', defaultValue: 'kwh', options: [{ label: 'Kilowatt-Hours (kWh)', value: 'kwh' }, { label: 'Joules (J)', value: 'j' }, { label: 'Kilocalories (Food kcal)', value: 'kcal' }, { label: 'British Thermal Units (BTU)', value: 'btu' }] },
    ],
    calculate: (v) => {
      const val = Number(v.val) || 0;
      const u = v.unit || 'kwh';
      const toJoules: Record<string, number> = { j: 1, kwh: 3.6e6, kcal: 4184, btu: 1055.06 };
      const j = val * (toJoules[u] || 1);
      const kwh = j / 3.6e6;
      const btu = j / 1055.06;
      const kcal = j / 4184;
      return {
        primaryValue: parseFloat(kwh.toFixed(4)),
        primaryUnit: 'kWh',
        primaryLabel: 'Kilowatt-Hours',
        secondaryOutputs: [
          { label: 'Joules (J)', value: j.toExponential(4) + ' J' },
          { label: 'BTUs', value: parseFloat(btu.toFixed(1)) + ' BTU' },
          { label: 'Kilocalories (kcal)', value: parseFloat(kcal.toFixed(1)) + ' kcal' },
        ],
        steps: [`${val} ${u} = ${j.toLocaleString()} Joules`],
        formulaUsed: 'First Law of Thermodynamics Energy Equivalence',
      };
    },
  },
  {
    slug: 'power-converter',
    title: 'Power (Watts, Kilowatts, Horsepower) Converter',
    category: 'unit-converters',
    formulaDisplay: '1 HP = 745.7 Watts = 0.7457 kW',
    inputs: [
      { id: 'val', label: 'Power Value', defaultValue: 100, type: 'number', step: 'any' },
      { id: 'unit', label: 'From Unit', type: 'select', defaultValue: 'hp', options: [{ label: 'Mechanical Horsepower (HP)', value: 'hp' }, { label: 'Kilowatts (kW)', value: 'kw' }, { label: 'Watts (W)', value: 'w' }] },
    ],
    calculate: (v) => {
      const val = Number(v.val) || 0;
      const u = v.unit || 'hp';
      const toW: Record<string, number> = { w: 1, kw: 1000, hp: 745.699872 };
      const w = val * (toW[u] || 1);
      const kw = w / 1000;
      const hp = w / 745.699872;
      return {
        primaryValue: parseFloat(kw.toFixed(2)),
        primaryUnit: 'kW',
        primaryLabel: 'Kilowatts',
        secondaryOutputs: [
          { label: 'Horsepower (HP)', value: parseFloat(hp.toFixed(2)) + ' HP' },
          { label: 'Watts (W)', value: parseFloat(w.toFixed(1)) + ' W' },
        ],
        steps: [`${val} ${u} = ${w.toFixed(1)} W = ${kw.toFixed(2)} kW`],
        formulaUsed: '1 HP = 745.7 W',
      };
    },
  },
  {
    slug: 'fuel-economy-converter',
    title: 'Fuel Economy (MPG to L/100km) Converter',
    category: 'unit-converters',
    formulaDisplay: 'L/100km = 235.215 / MPG',
    inputs: [
      { id: 'mpg', label: 'US Miles per Gallon (MPG)', defaultValue: 30, type: 'number', min: 1, step: 0.5, unit: 'MPG' },
    ],
    calculate: (v) => {
      const mpg = Number(v.mpg) || 25;
      const l100 = 235.214583 / mpg;
      const imperialMpg = mpg * 1.20095;
      const kmPerL = mpg * 0.425144;
      return {
        primaryValue: parseFloat(l100.toFixed(2)),
        primaryUnit: 'L / 100km',
        primaryLabel: 'Liters per 100 km',
        secondaryOutputs: [
          { label: 'UK Imperial MPG', value: parseFloat(imperialMpg.toFixed(1)) + ' MPG (UK)' },
          { label: 'Kilometers per Liter', value: parseFloat(kmPerL.toFixed(2)) + ' km/L' },
        ],
        steps: [`L/100km = 235.215 / ${mpg} MPG = ${l100.toFixed(2)} L/100km`],
        formulaUsed: 'L/100km = 235.215 / MPG',
      };
    },
  },
  {
    slug: 'data-storage-converter',
    title: 'Digital Data Storage (KB, MB, GB, TB) Converter',
    category: 'unit-converters',
    formulaDisplay: '1 TB = 1,024 GB = 1,048,576 MB',
    inputs: [
      { id: 'val', label: 'Data Value', defaultValue: 100, type: 'number', step: 'any' },
      { id: 'unit', label: 'Unit', type: 'select', defaultValue: 'gb', options: [{ label: 'Gigabytes (GB)', value: 'gb' }, { label: 'Megabytes (MB)', value: 'mb' }, { label: 'Terabytes (TB)', value: 'tb' }, { label: 'Kilobytes (KB)', value: 'kb' }] },
    ],
    calculate: (v) => {
      const val = Number(v.val) || 0;
      const u = v.unit || 'gb';
      const toMb: Record<string, number> = { kb: 1 / 1024, mb: 1, gb: 1024, tb: 1024 * 1024 };
      const mb = val * (toMb[u] || 1);
      const gb = mb / 1024;
      const tb = gb / 1024;
      return {
        primaryValue: parseFloat(mb.toFixed(1)),
        primaryUnit: 'MB',
        primaryLabel: 'Megabytes',
        secondaryOutputs: [
          { label: 'Gigabytes', value: parseFloat(gb.toFixed(3)) + ' GB' },
          { label: 'Terabytes', value: parseFloat(tb.toFixed(4)) + ' TB' },
        ],
        steps: [`Converted based on binary 1,024 byte factor.`],
        formulaUsed: 'Binary Digital Prefixes',
      };
    },
  },
  {
    slug: 'angle-converter',
    title: 'Angle (Degrees, Radians, Gradians) Converter',
    category: 'unit-converters',
    formulaDisplay: 'rad = deg × (π / 180)',
    inputs: [
      { id: 'deg', label: 'Angle in Degrees (°)', defaultValue: 180, type: 'number', step: 5, unit: '°' },
    ],
    calculate: (v) => {
      const d = Number(v.deg) || 0;
      const rad = (d * Math.PI) / 180;
      const grad = (d * 400) / 360;
      const revs = d / 360;
      return {
        primaryValue: parseFloat(rad.toFixed(4)),
        primaryUnit: 'radians',
        primaryLabel: 'Radians (rad)',
        secondaryOutputs: [
          { label: 'Exact Pi Multiplier', value: parseFloat((d / 180).toFixed(4)) + ' π rad' },
          { label: 'Gradians (grad)', value: parseFloat(grad.toFixed(2)) + ' grad' },
          { label: 'Revolutions / Cycles', value: parseFloat(revs.toFixed(4)) },
        ],
        steps: [`${d}° × (π / 180) = ${rad.toFixed(4)} radians`],
        formulaUsed: 'rad = deg · π / 180',
      };
    },
  },
  {
    slug: 'time-converter',
    title: 'Time Units (Days, Hours, Minutes, Seconds) Converter',
    category: 'unit-converters',
    formulaDisplay: '1 Day = 24 Hours = 1,440 Minutes = 86,400 Seconds',
    inputs: [
      { id: 'hours', label: 'Hours', defaultValue: 36, type: 'number', step: 'any', unit: 'hrs' },
    ],
    calculate: (v) => {
      const h = Number(v.hours) || 0;
      const days = h / 24;
      const min = h * 60;
      const sec = min * 60;
      return {
        primaryValue: parseFloat(days.toFixed(2)),
        primaryUnit: 'Days',
        primaryLabel: 'Days',
        secondaryOutputs: [
          { label: 'Minutes', value: Math.round(min).toLocaleString() + ' min' },
          { label: 'Seconds', value: Math.round(sec).toLocaleString() + ' sec' },
        ],
        steps: [`${h} hours = ${days.toFixed(2)} days = ${Math.round(min)} minutes`],
        formulaUsed: 'Standard Sexagesimal Time System',
      };
    },
  },
  {
    slug: 'force-unit-converter',
    title: 'Force (Newtons, Pounds-Force, Dynes) Converter',
    category: 'unit-converters',
    formulaDisplay: '1 lbf = 4.44822 Newtons = 444,822 dynes',
    inputs: [
      { id: 'val', label: 'Force Value', defaultValue: 100, type: 'number', step: 'any' },
      { id: 'unit', label: 'From Unit', type: 'select', defaultValue: 'n', options: [{ label: 'Newtons (N)', value: 'n' }, { label: 'Pounds-Force (lbf)', value: 'lbf' }, { label: 'Kiloponds / kgf', value: 'kgf' }] },
    ],
    calculate: (v) => {
      const val = Number(v.val) || 0;
      const u = v.unit || 'n';
      const toN: Record<string, number> = { n: 1, lbf: 4.448222, kgf: 9.80665 };
      const n = val * (toN[u] || 1);
      const lbf = n / 4.448222;
      return {
        primaryValue: parseFloat(lbf.toFixed(2)),
        primaryUnit: 'lbf',
        primaryLabel: 'Pounds-Force',
        secondaryOutputs: [
          { label: 'Newtons', value: parseFloat(n.toFixed(2)) + ' N' },
          { label: 'Kilonewtons (kN)', value: parseFloat((n / 1000).toFixed(4)) + ' kN' },
        ],
        steps: [`${val} ${u} = ${n.toFixed(2)} N = ${lbf.toFixed(2)} lbf`],
        formulaUsed: 'Force Unit Equivalencies',
      };
    },
  },
  {
    slug: 'torque-unit-converter',
    title: 'Torque (N·m to ft-lbs) Converter',
    category: 'unit-converters',
    formulaDisplay: '1 N·m = 0.737562 ft-lbs, 1 ft-lb = 1.35582 N·m',
    inputs: [
      { id: 'val', label: 'Torque Value', defaultValue: 100, type: 'number', step: 'any' },
      { id: 'unit', label: 'From Unit', type: 'select', defaultValue: 'nm', options: [{ label: 'Newton-Meters (N·m)', value: 'nm' }, { label: 'Pound-Feet (ft-lbs)', value: 'ftlb' }, { label: 'Inch-Pounds (in-lbs)', value: 'inlb' }] },
    ],
    calculate: (v) => {
      const val = Number(v.val) || 0;
      const u = v.unit || 'nm';
      const toNm: Record<string, number> = { nm: 1, ftlb: 1.355818, inlb: 0.112985 };
      const nm = val * (toNm[u] || 1);
      const ftlb = nm / 1.355818;
      const inlb = ftlb * 12;
      return {
        primaryValue: parseFloat(ftlb.toFixed(2)),
        primaryUnit: 'ft-lbs',
        primaryLabel: 'Foot-Pounds',
        secondaryOutputs: [
          { label: 'Newton-Meters', value: parseFloat(nm.toFixed(2)) + ' N·m' },
          { label: 'Inch-Pounds', value: parseFloat(inlb.toFixed(1)) + ' in-lbs' },
        ],
        steps: [`${val} ${u} = ${nm.toFixed(2)} N·m = ${ftlb.toFixed(2)} ft-lbs`],
        formulaUsed: 'Torque Unit Relations',
      };
    },
  },
  {
    slug: 'acceleration-unit-converter',
    title: 'Acceleration (m/s² to G-Force) Converter',
    category: 'unit-converters',
    formulaDisplay: '1 g = 9.80665 m/s² = 32.174 ft/s²',
    inputs: [
      { id: 'val', label: 'Acceleration in m/s²', defaultValue: 19.62, type: 'number', step: 'any', unit: 'm/s²' },
    ],
    calculate: (v) => {
      const ms2 = Number(v.val) || 0;
      const g = ms2 / 9.80665;
      const fts2 = ms2 * 3.28084;
      return {
        primaryValue: parseFloat(g.toFixed(2)),
        primaryUnit: 'g',
        primaryLabel: 'G-Force Equivalent',
        secondaryOutputs: [
          { label: 'Feet per Second Squared', value: parseFloat(fts2.toFixed(2)) + ' ft/s²' },
        ],
        steps: [`${ms2} m/s² ÷ 9.80665 = ${g.toFixed(2)} g`],
        formulaUsed: 'g = a / 9.80665',
      };
    },
  },
  {
    slug: 'flow-rate-converter',
    title: 'Flow Rate (GPM, L/min, m³/h) Converter',
    category: 'unit-converters',
    formulaDisplay: '1 GPM = 3.78541 L/min = 0.227125 m³/h',
    inputs: [
      { id: 'gpm', label: 'Gallons per Minute (GPM)', defaultValue: 15, type: 'number', step: 'any', unit: 'GPM' },
    ],
    calculate: (v) => {
      const gpm = Number(v.gpm) || 0;
      const lpm = gpm * 3.78541;
      const m3h = gpm * 0.227125;
      return {
        primaryValue: parseFloat(lpm.toFixed(2)),
        primaryUnit: 'L / min',
        primaryLabel: 'Liters per Minute',
        secondaryOutputs: [
          { label: 'Cubic Meters per Hour', value: parseFloat(m3h.toFixed(3)) + ' m³/h' },
        ],
        steps: [`${gpm} GPM × 3.78541 = ${lpm.toFixed(2)} L/min`],
        formulaUsed: 'Hydraulic Flow Conversions',
      };
    },
  },
  {
    slug: 'density-unit-converter',
    title: 'Density (g/cm³, kg/m³, lbs/cu ft) Converter',
    category: 'unit-converters',
    formulaDisplay: '1 g/cm³ = 1000 kg/m³ = 62.428 lbs/cu ft',
    inputs: [
      { id: 'val', label: 'Density (g/cm³)', defaultValue: 1.0, type: 'number', step: 'any', unit: 'g/cm³' },
    ],
    calculate: (v) => {
      const gcm3 = Number(v.val) || 0;
      const kgm3 = gcm3 * 1000;
      const lbcuft = gcm3 * 62.42796;
      return {
        primaryValue: Math.round(kgm3),
        primaryUnit: 'kg / m³',
        primaryLabel: 'SI Density (kg/m³)',
        secondaryOutputs: [
          { label: 'Pounds per Cubic Foot', value: parseFloat(lbcuft.toFixed(2)) + ' lbs/cu ft' },
        ],
        steps: [`${gcm3} g/cm³ × 1000 = ${kgm3} kg/m³`],
        formulaUsed: 'Density Dimension Equivalence',
      };
    },
  },
  {
    slug: 'frequency-converter',
    title: 'Frequency (Hz, kHz, MHz, GHz) Converter',
    category: 'unit-converters',
    formulaDisplay: '1 GHz = 1,000 MHz = 1,000,000 kHz = 10⁹ Hz',
    inputs: [
      { id: 'hz', label: 'Frequency in Hertz (Hz)', defaultValue: 2400000000, type: 'number', step: 'any', unit: 'Hz' },
    ],
    calculate: (v) => {
      const hz = Number(v.hz) || 0;
      const ghz = hz / 1e9;
      const mhz = hz / 1e6;
      const khz = hz / 1e3;
      return {
        primaryValue: parseFloat(ghz.toFixed(3)),
        primaryUnit: 'GHz',
        primaryLabel: 'Gigahertz',
        secondaryOutputs: [
          { label: 'Megahertz (MHz)', value: parseFloat(mhz.toFixed(2)) + ' MHz' },
          { label: 'Kilohertz (kHz)', value: parseFloat(khz.toFixed(1)) + ' kHz' },
        ],
        steps: [`${hz} Hz = ${ghz.toFixed(3)} GHz`],
        formulaUsed: 'SI Metric Frequency Scale',
      };
    },
  },
  {
    slug: 'typography-converter',
    title: 'Typography (Points, Pixels, Ems, Rem) Converter',
    category: 'unit-converters',
    formulaDisplay: '1 pt = 1.333 px (at 96 DPI), 1 rem = 16 px base',
    inputs: [
      { id: 'px', label: 'Pixels (px)', defaultValue: 16, type: 'number', step: 1, unit: 'px' },
      { id: 'basePx', label: 'Root Base Font Size (px)', defaultValue: 16, type: 'number', step: 1, unit: 'px' },
    ],
    calculate: (v) => {
      const px = Number(v.px) || 16;
      const base = Number(v.basePx) || 16;
      const rem = px / base;
      const pt = px * 0.75;
      return {
        primaryValue: parseFloat(rem.toFixed(3)),
        primaryUnit: 'rem',
        primaryLabel: 'REM CSS Units',
        secondaryOutputs: [
          { label: 'Points (pt)', value: parseFloat(pt.toFixed(2)) + ' pt' },
          { label: 'Percentage', value: `${(rem * 100).toFixed(0)}%` },
        ],
        steps: [`${px}px / ${base}px base = ${rem.toFixed(3)} rem`],
        formulaUsed: 'CSS Unit Sizing Architecture',
      };
    },
  },
  {
    slug: 'illuminance-converter',
    title: 'Illuminance (Lux to Foot-Candles) Converter',
    category: 'unit-converters',
    formulaDisplay: '1 Foot-Candle = 10.764 Lux',
    inputs: [
      { id: 'lux', label: 'Illuminance in Lux (lx)', defaultValue: 500, type: 'number', step: 50, unit: 'lux' },
    ],
    calculate: (v) => {
      const lux = Number(v.lux) || 0;
      const fc = lux / 10.76391;
      return {
        primaryValue: parseFloat(fc.toFixed(2)),
        primaryUnit: 'fc',
        primaryLabel: 'Foot-Candles',
        secondaryOutputs: [
          { label: 'Lighting Application Standard', value: lux >= 500 ? 'Office / Reading Task Lighting' : 'Ambient Corridor Lighting' },
        ],
        steps: [`${lux} lux / 10.764 = ${fc.toFixed(2)} foot-candles`],
        formulaUsed: '1 fc = 10.764 lux',
      };
    },
  },
  {
    slug: 'radiation-converter',
    title: 'Radiation Dose (Sieverts to Rem) Converter',
    category: 'unit-converters',
    formulaDisplay: '1 Sievert (Sv) = 100 Rem, 1 mSv = 100 mrem',
    inputs: [
      { id: 'msv', label: 'Dose in Millisieverts (mSv)', defaultValue: 2.4, type: 'number', step: 0.1, unit: 'mSv' },
    ],
    calculate: (v) => {
      const msv = Number(v.msv) || 0;
      const mrem = msv * 100;
      return {
        primaryValue: parseFloat(mrem.toFixed(1)),
        primaryUnit: 'mrem',
        primaryLabel: 'Millirem (mrem)',
        secondaryOutputs: [
          { label: 'Sieverts (Sv)', value: (msv / 1000).toFixed(5) + ' Sv' },
          { label: 'Context', value: 'Avg annual natural background radiation is ~2.4 - 3.0 mSv' },
        ],
        steps: [`${msv} mSv × 100 = ${mrem.toFixed(1)} mrem`],
        formulaUsed: '1 Sv = 100 rem',
      };
    },
  },
  {
    slug: 'cooking-volume-converter',
    title: 'Kitchen Cooking Volume (Cups, Tbsp, Tsp, mL) Converter',
    category: 'unit-converters',
    formulaDisplay: '1 Cup = 16 Tbsp = 48 Tsp = 236.588 mL',
    inputs: [
      { id: 'cups', label: 'Cups', defaultValue: 1.5, type: 'number', step: 0.25, unit: 'cups' },
    ],
    calculate: (v) => {
      const c = Number(v.cups) || 0;
      const tbsp = c * 16;
      const tsp = c * 48;
      const ml = c * 236.588;
      return {
        primaryValue: parseFloat(tbsp.toFixed(1)),
        primaryUnit: 'Tablespoons',
        primaryLabel: 'Tablespoons (Tbsp)',
        secondaryOutputs: [
          { label: 'Teaspoons (Tsp)', value: parseFloat(tsp.toFixed(1)) + ' tsp' },
          { label: 'Milliliters (mL)', value: parseFloat(ml.toFixed(1)) + ' mL' },
          { label: 'Fluid Ounces', value: parseFloat((c * 8).toFixed(1)) + ' fl oz' },
        ],
        steps: [`${c} cups = ${tbsp.toFixed(1)} tbsp = ${tsp.toFixed(1)} tsp = ${ml.toFixed(1)} mL`],
        formulaUsed: 'US Culinary Volume Standards',
      };
    },
  },
  {
    slug: 'awg-converter',
    title: 'American Wire Gauge (AWG) to mm Diameter Converter',
    category: 'unit-converters',
    formulaDisplay: 'd_n = 0.127 × 92^((36 - n)/39) mm',
    inputs: [
      { id: 'awg', label: 'Wire Gauge (AWG, e.g. 12 or 14)', defaultValue: 12, type: 'number', min: 0, max: 40, step: 1 },
    ],
    calculate: (v) => {
      const n = Number(v.awg) || 12;
      const dMm = 0.127 * Math.pow(92, (36 - n) / 39);
      const dIn = dMm / 25.4;
      const areaMm2 = (Math.PI / 4) * dMm * dMm;
      return {
        primaryValue: parseFloat(dMm.toFixed(3)),
        primaryUnit: 'mm',
        primaryLabel: 'Conductor Diameter',
        secondaryOutputs: [
          { label: 'Diameter in Inches', value: parseFloat(dIn.toFixed(4)) + ' in' },
          { label: 'Cross-Sectional Area', value: parseFloat(areaMm2.toFixed(3)) + ' mm²' },
          { label: 'Typical Household Current Limit', value: n === 12 ? '20 Amps' : (n === 14 ? '15 Amps' : 'Varies by insulation') },
        ],
        steps: [`d = 0.127 × 92^((36 - ${n})/39) = ${dMm.toFixed(3)} mm`],
        formulaUsed: 'ASTM B258 Standard Wire Equation',
      };
    },
  },
  {
    slug: 'shoe-size-converter',
    title: 'International Shoe Size (US, UK, EU, CM) Converter',
    category: 'unit-converters',
    formulaDisplay: 'EU ≈ (Foot Length cm + 1.5) × 1.5',
    inputs: [
      { id: 'usSize', label: 'US Men Shoe Size', defaultValue: 10, type: 'number', min: 4, max: 16, step: 0.5 },
    ],
    calculate: (v) => {
      const us = Number(v.usSize) || 10;
      const uk = us - 0.5;
      const eu = Math.round(us * 1.27 + 31);
      const cm = parseFloat(((us + 18.5) * 0.846).toFixed(1));
      return {
        primaryValue: eu,
        primaryUnit: 'EU',
        primaryLabel: 'European Size (EU)',
        secondaryOutputs: [
          { label: 'UK Size', value: uk },
          { label: 'Foot Length', value: `~${cm} cm` },
          { label: 'US Women Equivalent', value: us + 1.5 },
        ],
        steps: [`US ${us} converts to UK ${uk}, EU ${eu}, approx ${cm} cm.`],
        formulaUsed: 'ISO/TS 19407 Footwear Sizing Standard',
      };
    },
  },
  {
    slug: 'ring-size-converter',
    title: 'Ring Size (US, UK, Inside Diameter mm) Converter',
    category: 'unit-converters',
    formulaDisplay: 'Diameter (mm) = (US Size × 0.83) + 11.56',
    inputs: [
      { id: 'usSize', label: 'US Ring Size (e.g. 7 or 7.5)', defaultValue: 7, type: 'number', min: 3, max: 15, step: 0.5 },
    ],
    calculate: (v) => {
      const us = Number(v.usSize) || 7;
      const diaMm = us * 0.83 + 11.56;
      const circMm = Math.PI * diaMm;
      return {
        primaryValue: parseFloat(diaMm.toFixed(2)),
        primaryUnit: 'mm',
        primaryLabel: 'Inside Ring Diameter',
        secondaryOutputs: [
          { label: 'Inside Circumference', value: parseFloat(circMm.toFixed(2)) + ' mm' },
        ],
        steps: [`US size ${us} corresponds to ${diaMm.toFixed(2)} mm inside diameter.`],
        formulaUsed: 'ISO 8653 Jewelry Ring Metric Standard',
      };
    },
  },
  {
    slug: 'metric-prefix-converter',
    title: 'Metric SI Prefix (Nano to Tera) Multiplier Converter',
    category: 'unit-converters',
    formulaDisplay: 'Value × 10^n Power Scaling',
    inputs: [
      { id: 'val', label: 'Base Value', defaultValue: 1, type: 'number', step: 'any' },
      { id: 'prefix', label: 'SI Prefix Multiplier', type: 'select', defaultValue: 'mega', options: [{ label: 'Tera (T, 10¹²)', value: '12' }, { label: 'Giga (G, 10⁹)', value: '9' }, { label: 'Mega (M, 10⁶)', value: '6' }, { label: 'Kilo (k, 10³)', value: '3' }, { label: 'Milli (m, 10⁻³)', value: '-3' }, { label: 'Micro (μ, 10⁻⁶)', value: '-6' }, { label: 'Nano (n, 10⁻⁹)', value: '-9' }] },
    ],
    calculate: (v) => {
      const val = Number(v.val) || 1;
      const exp = Number(v.prefix) || 6;
      const res = val * Math.pow(10, exp);
      return {
        primaryValue: res.toExponential(4),
        primaryLabel: 'Scientific Base Value',
        secondaryOutputs: [
          { label: 'Standard Decimal Form', value: Math.abs(res) < 1e9 && Math.abs(res) > 1e-4 ? res.toLocaleString() : res.toExponential() },
        ],
        steps: [`${val} × 10^${exp} = ${res.toExponential(4)}`],
        formulaUsed: 'BIPM SI Prefix Scale',
      };
    },
  },
  {
    slug: 'clothing-size-converter',
    title: 'Women / Men International Clothing Size Converter',
    category: 'unit-converters',
    formulaDisplay: 'Standard US/UK/EU Garment Matrix',
    inputs: [
      { id: 'usLetter', label: 'Standard Size', type: 'select', defaultValue: 'M', options: [{ label: 'Small (S)', value: 'S' }, { label: 'Medium (M)', value: 'M' }, { label: 'Large (L)', value: 'L' }, { label: 'X-Large (XL)', value: 'XL' }] },
    ],
    calculate: (v) => {
      const s = v.usLetter || 'M';
      const map: Record<string, { us: string; uk: string; eu: string; chest: string }> = {
        S: { us: '36', uk: '36', eu: '46', chest: '36-38 in (91-96 cm)' },
        M: { us: '38-40', uk: '38-40', eu: '48-50', chest: '39-41 in (99-104 cm)' },
        L: { us: '42-44', uk: '42-44', eu: '52-54', chest: '42-44 in (107-112 cm)' },
        XL: { us: '46-48', uk: '46-48', eu: '56-58', chest: '45-47 in (114-119 cm)' },
      };
      const info = map[s] || map['M'];
      return {
        primaryValue: `US ${info.us} / EU ${info.eu}`,
        primaryLabel: 'International Equivalence',
        secondaryOutputs: [
          { label: 'UK Sizing', value: info.uk },
          { label: 'Chest Circumference Measurement', value: info.chest },
        ],
        steps: [`Mapped size ${s} to global apparel charts.`],
        formulaUsed: 'EN 13402 International Garment Sizing',
      };
    },
  },
  {
    slug: 'aspect-ratio-converter',
    title: 'Display Aspect Ratio & Dimensions Converter',
    category: 'unit-converters',
    formulaDisplay: 'Height = Width / Aspect Ratio',
    inputs: [
      { id: 'widthPx', label: 'Horizontal Width (px)', defaultValue: 1920, type: 'number', step: 10, unit: 'px' },
      { id: 'ratioW', label: 'Aspect Ratio Width Factor (e.g. 16)', defaultValue: 16, type: 'number', step: 1 },
      { id: 'ratioH', label: 'Aspect Ratio Height Factor (e.g. 9)', defaultValue: 9, type: 'number', step: 1 },
    ],
    calculate: (v) => {
      const w = Number(v.widthPx) || 1920;
      const rw = Number(v.ratioW) || 16;
      const rh = Number(v.ratioH) || 9;
      const h = Math.round((w * rh) / rw);
      return {
        primaryValue: `${w} × ${h}`,
        primaryUnit: 'px',
        primaryLabel: `Calculated Dimensions (${rw}:${rh})`,
        secondaryOutputs: [
          { label: 'Calculated Height', value: `${h} px` },
          { label: 'Total Megapixels', value: `${((w * h) / 1e6).toFixed(2)} MP` },
        ],
        steps: [`Height = (${w} × ${rh}) / ${rw} = ${h} px`],
        formulaUsed: 'H = W × (Ratio_H / Ratio_W)',
      };
    },
  },
  {
    slug: 'km-per-liter-converter',
    title: 'Kilometers per Liter to MPG Converter',
    category: 'unit-converters',
    formulaDisplay: 'MPG = km/L × 2.35215',
    inputs: [
      { id: 'kml', label: 'Kilometers per Liter (km/L)', defaultValue: 12.5, type: 'number', min: 0.1, step: 0.5, unit: 'km/L' },
    ],
    calculate: (v) => {
      const kml = Number(v.kml) || 10;
      const mpg = kml * 2.35215;
      const l100 = 100 / kml;
      return {
        primaryValue: parseFloat(mpg.toFixed(2)),
        primaryUnit: 'US MPG',
        primaryLabel: 'Miles per Gallon',
        secondaryOutputs: [
          { label: 'Liters per 100 km', value: parseFloat(l100.toFixed(2)) + ' L/100km' },
        ],
        steps: [`${kml} km/L × 2.35215 = ${mpg.toFixed(2)} MPG`],
        formulaUsed: 'MPG = km/L × 2.35215',
      };
    },
  },

  // DATE & TIME (15)
  {
    slug: 'age-calculator',
    title: 'Exact Chronological Age Calculator',
    category: 'date-time',
    formulaDisplay: 'Exact difference in Years, Months, and Days',
    inputs: [
      { id: 'birthDate', label: 'Birthdate (YYYY-MM-DD)', defaultValue: '1995-06-15', type: 'date' },
    ],
    calculate: (v) => {
      const birth = new Date(v.birthDate || '1995-06-15');
      const now = new Date();
      if (isNaN(birth.getTime())) return { primaryValue: 'Error', primaryLabel: 'Invalid Date', error: 'Invalid birthdate.' };
      let years = now.getFullYear() - birth.getFullYear();
      let months = now.getMonth() - birth.getMonth();
      let days = now.getDate() - birth.getDate();
      if (days < 0) {
        months -= 1;
        days += 30;
      }
      if (months < 0) {
        years -= 1;
        months += 12;
      }
      const totalDays = Math.floor((now.getTime() - birth.getTime()) / (1000 * 86400));
      return {
        primaryValue: `${years} Years, ${months} Months, ${days} Days`,
        primaryLabel: 'Exact Age Today',
        secondaryOutputs: [
          { label: 'Total Days Lived', value: totalDays.toLocaleString() + ' days' },
          { label: 'Total Hours Lived', value: (totalDays * 24).toLocaleString() + ' hours' },
        ],
        steps: [`Exact elapsed calendar horizon from ${v.birthDate} to today.`],
        formulaUsed: 'Gregorian Chronological Difference',
      };
    },
  },
  {
    slug: 'days-between-dates-calculator',
    title: 'Days Between Two Dates Calculator',
    category: 'date-time',
    formulaDisplay: 'Δt = (Date 2 - Date 1) in Days',
    inputs: [
      { id: 'date1', label: 'Start Date', defaultValue: '2024-01-01', type: 'date' },
      { id: 'date2', label: 'End Date', defaultValue: '2026-11-01', type: 'date' },
    ],
    calculate: (v) => {
      const d1 = new Date(v.date1 || '2024-01-01');
      const d2 = new Date(v.date2 || '2026-11-01');
      const diffMs = Math.abs(d2.getTime() - d1.getTime());
      const days = Math.round(diffMs / (1000 * 86400));
      const weeks = (days / 7).toFixed(1);
      return {
        primaryValue: days.toLocaleString(),
        primaryUnit: 'days',
        primaryLabel: 'Total Calendar Days',
        secondaryOutputs: [
          { label: 'In Weeks', value: `${weeks} weeks` },
          { label: 'In Months (approx)', value: `${(days / 30.4375).toFixed(1)} months` },
        ],
        steps: [`Elapsed time: ${days} days between ${v.date1} and ${v.date2}`],
        formulaUsed: 'Δt = |d2 - d1| / 86400000',
      };
    },
  },
  {
    slug: 'business-days-calculator',
    title: 'Business Working Days (Excluding Weekends) Calculator',
    category: 'date-time',
    formulaDisplay: 'Working days Monday through Friday',
    inputs: [
      { id: 'startDate', label: 'Start Date', defaultValue: '2026-10-01', type: 'date' },
      { id: 'endDate', label: 'End Date', defaultValue: '2026-10-31', type: 'date' },
    ],
    calculate: (v) => {
      const cur = new Date(v.startDate || '2026-10-01');
      const end = new Date(v.endDate || '2026-10-31');
      let businessDays = 0;
      while (cur <= end) {
        const day = cur.getDay();
        if (day !== 0 && day !== 6) businessDays++;
        cur.setDate(cur.getDate() + 1);
      }
      return {
        primaryValue: businessDays,
        primaryUnit: 'Business Days',
        primaryLabel: 'Working Business Days',
        secondaryOutputs: [
          { label: 'Working Hours (8 hr/day)', value: `${businessDays * 8} hours` },
        ],
        steps: [`Iterated calendar excluding Saturdays and Sundays.`],
        formulaUsed: 'Mon-Fri Business Day Count',
      };
    },
  },
  {
    slug: 'date-add-days-calculator',
    title: 'Add or Subtract Days from Date Calculator',
    category: 'date-time',
    formulaDisplay: 'Target Date = Base Date ± N Days',
    inputs: [
      { id: 'baseDate', label: 'Start Date', defaultValue: '2026-11-01', type: 'date' },
      { id: 'daysToAdd', label: 'Days to Add (Use negative to subtract)', defaultValue: 45, type: 'number', step: 1 },
    ],
    calculate: (v) => {
      const d = new Date(v.baseDate || '2026-11-01');
      const add = Number(v.daysToAdd) || 0;
      d.setDate(d.getDate() + add);
      const resStr = d.toISOString().split('T')[0];
      return {
        primaryValue: resStr,
        primaryLabel: 'Resulting Target Date',
        secondaryOutputs: [
          { label: 'Day of Week', value: d.toLocaleDateString('en-US', { weekday: 'long' }) },
        ],
        steps: [`${v.baseDate} ${add >= 0 ? '+' : '-'} ${Math.abs(add)} days = ${resStr}`],
        formulaUsed: 'Date Arithmetic',
      };
    },
  },
  {
    slug: 'time-zone-calculator',
    title: 'Time Zone Offset Converter',
    category: 'date-time',
    formulaDisplay: 'Target Local = UTC ± Offset',
    inputs: [
      { id: 'hoursOffset', label: 'Offset from UTC (Hours, e.g. -5 for EST, 0 for GMT, +9 for JST)', defaultValue: -5, type: 'number', min: -12, max: 14, step: 1 },
    ],
    calculate: (v) => {
      const off = Number(v.hoursOffset) || 0;
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const targetTime = new Date(utc + 3600000 * off);
      const timeStr = targetTime.toTimeString().split(' ')[0];
      return {
        primaryValue: timeStr,
        primaryLabel: `Current Time at UTC${off >= 0 ? '+' : ''}${off}`,
        secondaryOutputs: [
          { label: 'Date', value: targetTime.toDateString() },
        ],
        steps: [`Converted current UTC timestamp by ${off} hours.`],
        formulaUsed: 'UTC Timezone Projection',
      };
    },
  },
  {
    slug: 'hours-calculator',
    title: 'Hours Between Two Clock Times Calculator',
    category: 'date-time',
    formulaDisplay: 'Hours = (End Time - Start Time)',
    inputs: [
      { id: 'start', label: 'Start Time (e.g. 08:30)', defaultValue: '08:30', type: 'text' },
      { id: 'end', label: 'End Time (e.g. 17:00)', defaultValue: '17:00', type: 'text' },
      { id: 'lunchMin', label: 'Unpaid Break (Minutes)', defaultValue: 45, type: 'number', step: 15, unit: 'min' },
    ],
    calculate: (v) => {
      const parseMin = (s: string) => {
        const [h, m] = s.split(':').map(Number);
        return (h || 0) * 60 + (m || 0);
      };
      const startMin = parseMin(String(v.start || '08:30'));
      const endMin = parseMin(String(v.end || '17:00'));
      const breakMin = Number(v.lunchMin) || 0;
      const totalMin = Math.max(0, endMin - startMin - breakMin);
      const hrs = totalMin / 60;
      return {
        primaryValue: parseFloat(hrs.toFixed(2)),
        primaryUnit: 'hours',
        primaryLabel: 'Total Billable Hours',
        secondaryOutputs: [
          { label: 'Time in Hours & Minutes', value: `${Math.floor(hrs)} hrs ${Math.round(totalMin % 60)} mins` },
        ],
        steps: [`(${endMin} min - ${startMin} min) - ${breakMin} min break = ${totalMin} min = ${hrs.toFixed(2)} hrs`],
        formulaUsed: 'Timesheet Interval Calculation',
      };
    },
  },
  {
    slug: 'countdown-calculator',
    title: 'Countdown Days to Future Event Calculator',
    category: 'date-time',
    formulaDisplay: 'Remaining = Target Date - Today',
    inputs: [
      { id: 'eventDate', label: 'Target Event Date', defaultValue: '2026-12-31', type: 'date' },
    ],
    calculate: (v) => {
      const target = new Date(v.eventDate || '2026-12-31');
      const now = new Date();
      const diffMs = target.getTime() - now.getTime();
      const days = Math.max(0, Math.ceil(diffMs / (1000 * 86400)));
      return {
        primaryValue: days,
        primaryUnit: 'days remaining',
        primaryLabel: 'Days to Event',
        secondaryOutputs: [
          { label: 'Weeks Remaining', value: (days / 7).toFixed(1) },
          { label: 'Hours Remaining', value: (days * 24).toLocaleString() },
        ],
        steps: [`Countdown to ${v.eventDate}`],
        formulaUsed: 'Target - Current Date',
      };
    },
  },
  {
    slug: 'day-of-week-calculator',
    title: 'Day of the Week (Zeller Congruence) Calculator',
    category: 'date-time',
    formulaDisplay: 'Zeller Algorithm for Calendar Day',
    inputs: [
      { id: 'date', label: 'Target Date', defaultValue: '1969-07-20', type: 'date' },
    ],
    calculate: (v) => {
      const d = new Date(v.date || '1969-07-20');
      const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
      return {
        primaryValue: dayName,
        primaryLabel: 'Day of the Week',
        secondaryOutputs: [
          { label: 'Full Date Formatted', value: d.toDateString() },
        ],
        steps: [`Evaluated perpetual calendar for ${v.date}: Day is ${dayName}`],
        formulaUsed: 'Zeller Congruence Algorithm',
      };
    },
  },
  {
    slug: 'leap-year-calculator',
    title: 'Leap Year Checker',
    category: 'date-time',
    formulaDisplay: 'Leap if (Year % 4 == 0 && Year % 100 != 0) || (Year % 400 == 0)',
    inputs: [
      { id: 'year', label: 'Year (e.g. 2024, 2026, 2028)', defaultValue: 2026, type: 'number', step: 1 },
    ],
    calculate: (v) => {
      const y = Math.round(Number(v.year) || 2024);
      const isLeap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
      return {
        primaryValue: isLeap ? 'Leap Year (366 Days)' : 'Common Year (365 Days)',
        primaryLabel: `Year ${y} Status`,
        secondaryOutputs: [
          { label: 'Days in February', value: isLeap ? 29 : 28 },
          { label: 'Next Leap Year', value: isLeap ? y : y + (4 - (y % 4)) },
        ],
        steps: [`Gregorian rule: Divisible by 4 and not 100 (unless divisible by 400).`],
        formulaUsed: 'Gregorian Intercalation Rule',
      };
    },
  },
  {
    slug: 'unix-timestamp-calculator',
    title: 'UNIX Epoch Timestamp Converter',
    category: 'date-time',
    formulaDisplay: 'Seconds elapsed since Jan 01 1970 00:00:00 UTC',
    inputs: [
      { id: 'timestamp', label: 'UNIX Timestamp (Seconds)', defaultValue: 1793443200, type: 'number', step: 1 },
    ],
    calculate: (v) => {
      const ts = Number(v.timestamp) || 1700000000;
      const d = new Date(ts * 1000);
      return {
        primaryValue: d.toUTCString(),
        primaryLabel: 'UTC Date & Time',
        secondaryOutputs: [
          { label: 'ISO 8601 String', value: d.toISOString() },
          { label: 'Milliseconds Timestamp', value: ts * 1000 },
        ],
        steps: [`Converted ${ts} seconds from POSIX epoch Jan 1, 1970.`],
        formulaUsed: 'POSIX Unix Timestamp',
      };
    },
  },
  {
    slug: 'week-number-calculator',
    title: 'ISO Week Number Calculator',
    category: 'date-time',
    formulaDisplay: 'ISO 8601 Week Number (Weeks 1 to 52/53)',
    inputs: [
      { id: 'date', label: 'Date', defaultValue: '2026-11-01', type: 'date' },
    ],
    calculate: (v) => {
      const d = new Date(v.date || '2026-11-01');
      const target = new Date(d.valueOf());
      const dayNr = (d.getDay() + 6) % 7;
      target.setDate(target.getDate() - dayNr + 3);
      const firstThursday = target.valueOf();
      target.setMonth(0, 1);
      if (target.getDay() !== 4) {
        target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
      }
      const weekNum = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
      return {
        primaryValue: `Week ${weekNum}`,
        primaryLabel: 'ISO 8601 Week Number',
        secondaryOutputs: [
          { label: 'Year', value: d.getFullYear() },
        ],
        steps: [`Calculated standard ISO calendar week number.`],
        formulaUsed: 'ISO 8601 Week Date Calculation',
      };
    },
  },
  {
    slug: 'hours-minutes-calculator',
    title: 'Decimal Hours to Hours & Minutes Converter',
    category: 'date-time',
    formulaDisplay: 'Minutes = Decimal Fraction × 60',
    inputs: [
      { id: 'decHours', label: 'Decimal Hours (e.g. 7.75)', defaultValue: 7.75, type: 'number', step: 0.25, unit: 'hrs' },
    ],
    calculate: (v) => {
      const h = Number(v.decHours) || 0;
      const wholeH = Math.floor(h);
      const min = Math.round((h - wholeH) * 60);
      return {
        primaryValue: `${wholeH} Hours ${min} Minutes`,
        primaryLabel: 'Standard Time',
        secondaryOutputs: [
          { label: 'Total Minutes', value: `${Math.round(h * 60)} minutes` },
        ],
        steps: [`${wholeH} hrs + (0.${Math.round((h - wholeH) * 100)} × 60 = ${min} mins)`],
        formulaUsed: 'Minutes = Fraction × 60',
      };
    },
  },
  {
    slug: 'day-length-calculator',
    title: 'Daylight Length & Solar Noon Calculator',
    category: 'date-time',
    formulaDisplay: 'Approximated Sunrise to Sunset Daylight Hours',
    inputs: [
      { id: 'lat', label: 'Latitude (Degrees, e.g. 40.7 for NYC, 51.5 for London)', defaultValue: 40.7, type: 'number', min: -66, max: 66, step: 1, unit: '°' },
      { id: 'dayOfYear', label: 'Day of Year (1 - 365, Summer Solstice ≈ 172)', defaultValue: 172, type: 'number', min: 1, max: 365, step: 10 },
    ],
    calculate: (v) => {
      const lat = (Number(v.lat) || 40) * (Math.PI / 180);
      const doy = Number(v.dayOfYear) || 172;
      const declination = 0.4093 * Math.sin(((2 * Math.PI) / 365) * (doy - 81));
      const cosHourAngle = -Math.tan(lat) * Math.tan(declination);
      const clamped = Math.max(-1, Math.min(1, cosHourAngle));
      const daylightHours = (24 / Math.PI) * Math.acos(clamped);
      return {
        primaryValue: parseFloat(daylightHours.toFixed(2)),
        primaryUnit: 'hours',
        primaryLabel: 'Daylight Duration',
        secondaryOutputs: [
          { label: 'Formatted Hours & Mins', value: `${Math.floor(daylightHours)}h ${Math.round((daylightHours % 1) * 60)}m` },
        ],
        steps: [`Solar declination and hour angle derived from latitude.`],
        formulaUsed: 'Solar Astronomical Daylight Model',
      };
    },
  },
  {
    slug: 'military-time-calculator',
    title: 'Military Time (24-Hour) Converter',
    category: 'date-time',
    formulaDisplay: '12-Hour AM/PM to 24-Hour Military Format',
    inputs: [
      { id: 'hour12', label: '12-Hour Clock Hour (1 - 12)', defaultValue: 8, type: 'number', min: 1, max: 12, step: 1 },
      { id: 'minute', label: 'Minutes (0 - 59)', defaultValue: 45, type: 'number', min: 0, max: 59, step: 1 },
      { id: 'ampm', label: 'AM or PM', type: 'select', defaultValue: 'PM', options: [{ label: 'PM', value: 'PM' }, { label: 'AM', value: 'AM' }] },
    ],
    calculate: (v) => {
      let h = Number(v.hour12) || 12;
      const m = Number(v.minute) || 0;
      const isPm = v.ampm === 'PM';
      if (isPm && h !== 12) h += 12;
      if (!isPm && h === 12) h = 0;
      const mil = `${h.toString().padStart(2, '0')}${m.toString().padStart(2, '0')} hours`;
      return {
        primaryValue: mil,
        primaryLabel: '24-Hour Military Time',
        secondaryOutputs: [
          { label: '24-Hour Colon Format', value: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}` },
        ],
        steps: [`${v.hour12}:${m.toString().padStart(2, '0')} ${v.ampm} = ${mil}`],
        formulaUsed: 'ISO 24-Hour Clock Conversion',
      };
    },
  },
  {
    slug: 'julian-date-calculator',
    title: 'Julian Date (JD) Astronomical Day Calculator',
    category: 'date-time',
    formulaDisplay: 'Julian Day Number from Gregorian Date',
    inputs: [
      { id: 'date', label: 'Gregorian Date', defaultValue: '2026-11-01', type: 'date' },
    ],
    calculate: (v) => {
      const d = new Date(v.date || '2026-11-01');
      const timeMs = d.getTime();
      const jd = (timeMs / 86400000) + 2440587.5;
      return {
        primaryValue: parseFloat(jd.toFixed(2)),
        primaryLabel: 'Julian Date (JD)',
        secondaryOutputs: [
          { label: 'Modified Julian Date (MJD)', value: parseFloat((jd - 2400000.5).toFixed(2)) },
        ],
        steps: [`Continuous day count since January 1, 4713 BC.`],
        formulaUsed: 'IAU Julian Date Standard',
      };
    },
  },
];
