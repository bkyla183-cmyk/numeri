import { CalculatorSpec } from './types';
import { parseNum, calcError } from './validation';

const fmt = (n: number, d = 4): number => {
  if (!Number.isFinite(n)) return 0;
  const r = Number(n.toFixed(d));
  return Object.is(r, -0) ? 0 : r;
};

const sci = (n: number): string => {
  if (!Number.isFinite(n)) return '0';
  if (n === 0) return '0';
  return Math.abs(n) >= 1e7 || Math.abs(n) < 1e-4 ? n.toExponential(4) : String(fmt(n, 5));
};

export const batch4UnitConverterSpecs: CalculatorSpec[] = [
  // 839. Length & Distance Precision Converter
  {
    slug: 'length-distance-precision-converter',
    title: 'Precision Length & Distance Converter (Metric, Imperial, Nautical, Astronomical)',
    category: 'unit-converters',
    formulaDisplay: '1 ft = 0.3048 m (exact) | 1 NM = 1,852 m | 1 ly = 9.46073×10¹⁵ m',
    inputs: [
      { id: 'value', label: 'Distance Value', type: 'number', defaultValue: 10, min: 0, max: 1e12, step: 0.5 },
      {
        id: 'fromUnit',
        label: 'From Unit',
        type: 'select',
        defaultValue: 'mi',
        options: [
          { label: 'Meters (m)', value: 'm' },
          { label: 'Kilometers (km)', value: 'km' },
          { label: 'Centimeters (cm)', value: 'cm' },
          { label: 'Millimeters (mm)', value: 'mm' },
          { label: 'Inches (in)', value: 'in' },
          { label: 'Feet (ft)', value: 'ft' },
          { label: 'Yards (yd)', value: 'yd' },
          { label: 'Statute Miles (mi)', value: 'mi' },
          { label: 'Nautical Miles (NM)', value: 'nm' },
        ],
      },
    ],
    calculate: (v) => {
      const val = parseNum(v.value);
      const factors: Record<string, number> = { m: 1, km: 1000, cm: 0.01, mm: 0.001, in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344, nm: 1852 };
      const mult = factors[v.fromUnit];
      if (Number.isNaN(val) || val < 0 || !mult) return calcError('Enter non-negative value and valid length unit.');
      const meters = val * mult;
      return {
        primaryValue: sci(meters / 1000),
        primaryUnit: 'km',
        primaryLabel: 'Kilometers Equivalent',
        secondaryOutputs: [
          { label: 'Meters (m)', value: sci(meters) },
          { label: 'Statute Miles (mi)', value: sci(meters / 1609.344) },
          { label: 'Nautical Miles (NM)', value: sci(meters / 1852) },
          { label: 'Feet (ft)', value: sci(meters / 0.3048) },
          { label: 'Inches (in)', value: sci(meters / 0.0254) },
        ],
        steps: [`${val} ${v.fromUnit} × ${mult} = ${sci(meters)} m = ${sci(meters / 1000)} km.`],
      };
    },
  },

  // 840. Mass, Weight & Troy Ounce Converter
  {
    slug: 'mass-weight-troy-ounce-converter',
    title: 'Mass, Weight & Precious Metals Troy Ounce Converter',
    category: 'unit-converters',
    formulaDisplay: '1 lb = 0.45359237 kg | 1 ozt (Troy) = 31.1034768 g vs 1 oz (Avoirdupois) = 28.349523 g',
    inputs: [
      { id: 'value', label: 'Mass Value', type: 'number', defaultValue: 5, min: 0, max: 1e12, step: 0.5 },
      {
        id: 'fromUnit',
        label: 'From Unit',
        type: 'select',
        defaultValue: 'ozt',
        options: [
          { label: 'Kilograms (kg)', value: 'kg' },
          { label: 'Grams (g)', value: 'g' },
          { label: 'Pounds Avoirdupois (lb)', value: 'lb' },
          { label: 'Ounces Avoirdupois (oz)', value: 'oz' },
          { label: 'Troy Ounces (ozt - Gold/Silver)', value: 'ozt' },
          { label: 'UK Stone (st = 14 lb)', value: 'st' },
          { label: 'Metric Tonnes (t)', value: 't' },
        ],
      },
    ],
    calculate: (v) => {
      const val = parseNum(v.value);
      const toGrams: Record<string, number> = {
        kg: 1000, g: 1, lb: 453.59237, oz: 28.349523125, ozt: 31.1034768, st: 6350.29318, t: 1e6,
      };
      const mult = toGrams[v.fromUnit];
      if (Number.isNaN(val) || val < 0 || !mult) return calcError('Enter non-negative mass and valid unit.');
      const grams = val * mult;
      return {
        primaryValue: sci(grams),
        primaryUnit: 'grams (g)',
        primaryLabel: 'Grams Equivalent',
        secondaryOutputs: [
          { label: 'Kilograms (kg)', value: sci(grams / 1000) },
          { label: 'Troy Ounces (ozt)', value: sci(grams / 31.1034768) },
          { label: 'Avoirdupois Ounces (oz)', value: sci(grams / 28.349523125) },
          { label: 'Pounds (lb)', value: sci(grams / 453.59237) },
          { label: 'UK Stone (st)', value: sci(grams / 6350.29318) },
        ],
        steps: [`${val} ${v.fromUnit} = ${sci(grams)} g (${sci(grams / 31.1034768)} ozt / ${sci(grams / 453.59237)} lb).`],
      };
    },
  },

  // 841. Thermodynamic Temperature Scale Converter
  {
    slug: 'thermodynamic-temperature-scale-converter',
    title: 'Thermodynamic Temperature Scale Converter (°C, °F, K, °R)',
    category: 'unit-converters',
    formulaDisplay: 'K = °C + 273.15   |   °F = °C × 9/5 + 32   |   °R = K × 9/5',
    inputs: [
      { id: 'tempVal', label: 'Temperature', type: 'number', defaultValue: 25, min: -500, max: 1e9, step: 1 },
      {
        id: 'scale',
        label: 'Input Scale',
        type: 'select',
        defaultValue: 'C',
        options: [
          { label: 'Celsius (°C)', value: 'C' },
          { label: 'Fahrenheit (°F)', value: 'F' },
          { label: 'Kelvin (K)', value: 'K' },
          { label: 'Rankine (°R)', value: 'R' },
        ],
      },
    ],
    calculate: (v) => {
      const val = parseNum(v.tempVal);
      if (Number.isNaN(val) || !['C', 'F', 'K', 'R'].includes(v.scale)) return calcError('Enter valid temperature and scale.');
      let c = val;
      if (v.scale === 'F') c = ((val - 32) * 5) / 9;
      else if (v.scale === 'K') c = val - 273.15;
      else if (v.scale === 'R') c = (val * 5) / 9 - 273.15;
      const k = c + 273.15;
      if (k < 0) return calcError('Temperature cannot be below Absolute Zero (0 K / −273.15 °C).');
      const f = (c * 9) / 5 + 32;
      const r = k * 1.8;
      return {
        primaryValue: fmt(f, 2),
        primaryUnit: '°F',
        primaryLabel: 'Fahrenheit Equivalent',
        secondaryOutputs: [
          { label: 'Celsius (°C)', value: `${fmt(c, 2)} °C` },
          { label: 'Kelvin (K)', value: `${fmt(k, 2)} K` },
          { label: 'Rankine (°R)', value: `${fmt(r, 2)} °R` },
        ],
        steps: [`${val} °${v.scale} = ${fmt(c, 2)} °C = ${fmt(f, 2)} °F = ${fmt(k, 2)} K.`],
      };
    },
  },

  // 842. Fluid & Liquid Volume Capacity Converter
  {
    slug: 'fluid-liquid-volume-capacity-converter',
    title: 'Fluid & Liquid Volume Capacity Converter (L, mL, US & UK Gallons, m³)',
    category: 'unit-converters',
    formulaDisplay: '1 US Gal = 3.785411784 L   |   1 UK Imperial Gal = 4.54609 L   |   1 m³ = 1,000 L',
    inputs: [
      { id: 'value', label: 'Volume', type: 'number', defaultValue: 10, min: 0, max: 1e12, step: 1 },
      {
        id: 'fromUnit',
        label: 'From Unit',
        type: 'select',
        defaultValue: 'us_gal',
        options: [
          { label: 'Liters (L)', value: 'L' },
          { label: 'Milliliters (mL)', value: 'mL' },
          { label: 'Cubic Meters (m³)', value: 'm3' },
          { label: 'US Gallons', value: 'us_gal' },
          { label: 'UK Imperial Gallons', value: 'uk_gal' },
          { label: 'US Fluid Ounces (fl oz)', value: 'us_floz' },
          { label: 'US Cups (240 mL/236.59)', value: 'us_cup' },
        ],
      },
    ],
    calculate: (v) => {
      const val = parseNum(v.value);
      const toLiters: Record<string, number> = {
        L: 1, mL: 0.001, m3: 1000, us_gal: 3.785411784, uk_gal: 4.54609, us_floz: 0.0295735295625, us_cup: 0.2365882365,
      };
      const mult = toLiters[v.fromUnit];
      if (Number.isNaN(val) || val < 0 || !mult) return calcError('Enter non-negative volume and valid unit.');
      const liters = val * mult;
      return {
        primaryValue: sci(liters),
        primaryUnit: 'Liters (L)',
        primaryLabel: 'Metric Liters',
        secondaryOutputs: [
          { label: 'US Gallons', value: sci(liters / 3.785411784) },
          { label: 'UK Imperial Gallons', value: sci(liters / 4.54609) },
          { label: 'Milliliters (mL)', value: sci(liters * 1000) },
          { label: 'US Fluid Ounces', value: sci(liters / 0.0295735295625) },
          { label: 'Cubic Meters (m³)', value: sci(liters / 1000) },
        ],
        steps: [`${val} ${v.fromUnit} = ${sci(liters)} L = ${sci(liters / 4.54609)} UK gal.`],
      };
    },
  },

  // 843. Land & Floor Area Hectare / Acre Converter
  {
    slug: 'land-floor-area-hectare-acre-converter',
    title: 'Land & Floor Area Converter (ft², m², Acres, Hectares, km², mi²)',
    category: 'unit-converters',
    formulaDisplay: '1 Acre = 43,560 ft² = 4,046.8564224 m²   |   1 Hectare = 10,000 m² = 2.4710538 Acres',
    inputs: [
      { id: 'value', label: 'Area Value', type: 'number', defaultValue: 5, min: 0, max: 1e12, step: 0.5 },
      {
        id: 'fromUnit',
        label: 'From Unit',
        type: 'select',
        defaultValue: 'acre',
        options: [
          { label: 'Acres', value: 'acre' },
          { label: 'Hectares (ha)', value: 'ha' },
          { label: 'Square Meters (m²)', value: 'sqm' },
          { label: 'Square Feet (ft²)', value: 'sqft' },
          { label: 'Square Kilometers (km²)', value: 'sqkm' },
          { label: 'Square Miles (mi²)', value: 'sqmi' },
        ],
      },
    ],
    calculate: (v) => {
      const val = parseNum(v.value);
      const toSqm: Record<string, number> = {
        sqm: 1, sqft: 0.09290304, acre: 4046.8564224, ha: 10000, sqkm: 1e6, sqmi: 2589988.110336,
      };
      const mult = toSqm[v.fromUnit];
      if (Number.isNaN(val) || val < 0 || !mult) return calcError('Enter non-negative area and valid unit.');
      const sqm = val * mult;
      return {
        primaryValue: sci(sqm / 10000),
        primaryUnit: 'Hectares (ha)',
        primaryLabel: 'Hectares Equivalent',
        secondaryOutputs: [
          { label: 'Acres', value: sci(sqm / 4046.8564224) },
          { label: 'Square Meters (m²)', value: sci(sqm) },
          { label: 'Square Feet (ft²)', value: sci(sqm / 0.09290304) },
          { label: 'Square Kilometers (km²)', value: sci(sqm / 1e6) },
        ],
        steps: [`${val} ${v.fromUnit} = ${sci(sqm)} m² = ${sci(sqm / 10000)} ha = ${sci(sqm / 4046.8564224)} acres.`],
      };
    },
  },

  // 844. Velocity, Knot & Mach Speed Converter
  {
    slug: 'velocity-knot-mach-speed-converter',
    title: 'Speed & Velocity Converter (mph, km/h, m/s, Knots, Sea-Level Mach)',
    category: 'unit-converters',
    formulaDisplay: '1 Knot = 1.852 km/h = 0.514444 m/s   |   Mach 1 (15°C ISA) = 340.29 m/s',
    inputs: [
      { id: 'speedVal', label: 'Speed', type: 'number', defaultValue: 450, min: 0, max: 1e9, step: 10 },
      {
        id: 'fromUnit',
        label: 'From Unit',
        type: 'select',
        defaultValue: 'knots',
        options: [
          { label: 'Meters per Second (m/s)', value: 'mps' },
          { label: 'Kilometers per Hour (km/h)', value: 'kph' },
          { label: 'Miles per Hour (mph)', value: 'mph' },
          { label: 'Knots (kt)', value: 'knots' },
          { label: 'Mach (ISA Sea Level 340.29 m/s)', value: 'mach' },
        ],
      },
    ],
    calculate: (v) => {
      const val = parseNum(v.speedVal);
      const toMps: Record<string, number> = { mps: 1, kph: 1 / 3.6, mph: 0.44704, knots: 1852 / 3600, mach: 340.29 };
      const mult = toMps[v.fromUnit];
      if (Number.isNaN(val) || val < 0 || !mult) return calcError('Enter non-negative speed and valid unit.');
      const mps = val * mult;
      return {
        primaryValue: fmt(mps * 3.6, 2),
        primaryUnit: 'km/h',
        primaryLabel: 'Kilometers per Hour',
        secondaryOutputs: [
          { label: 'Miles per Hour (mph)', value: fmt(mps / 0.44704, 2) },
          { label: 'Meters per Second (m/s)', value: fmt(mps, 3) },
          { label: 'Knots (kt)', value: fmt(mps / (1852 / 3600), 2) },
          { label: 'Mach (Sea Level ISA)', value: fmt(mps / 340.29, 4) },
        ],
        steps: [`${val} ${v.fromUnit} = ${fmt(mps, 3)} m/s = ${fmt(mps * 3.6, 2)} km/h (Mach ${fmt(mps / 340.29, 4)}).`],
      };
    },
  },

  // 845. Pressure Converter (bar, PSI, Pascal, atm, mmHg)
  {
    slug: 'pressure-bar-psi-pascal-converter',
    title: 'Pressure & Vacuum Converter (bar, PSI, kPa, atm, mmHg / Torr)',
    category: 'unit-converters',
    formulaDisplay: '1 atm = 101.325 kPa = 1.01325 bar = 14.6959 psi = 760 mmHg',
    inputs: [
      { id: 'value', label: 'Pressure', type: 'number', defaultValue: 35, min: 0, max: 1e12, step: 1 },
      {
        id: 'fromUnit',
        label: 'From Unit',
        type: 'select',
        defaultValue: 'psi',
        options: [
          { label: 'PSI (lbf/in²)', value: 'psi' },
          { label: 'Bar', value: 'bar' },
          { label: 'Kilopascals (kPa)', value: 'kpa' },
          { label: 'Pascals (Pa)', value: 'pa' },
          { label: 'Standard Atmospheres (atm)', value: 'atm' },
          { label: 'Millimeters of Mercury (mmHg)', value: 'mmhg' },
        ],
      },
    ],
    calculate: (v) => {
      const val = parseNum(v.value);
      const toPa: Record<string, number> = {
        pa: 1, kpa: 1000, bar: 100000, psi: 6894.757293168, atm: 101325, mmhg: 101325 / 760,
      };
      const mult = toPa[v.fromUnit];
      if (Number.isNaN(val) || val < 0 || !mult) return calcError('Enter non-negative pressure and valid unit.');
      const pa = val * mult;
      return {
        primaryValue: fmt(pa / 1000, 3),
        primaryUnit: 'kPa',
        primaryLabel: 'Kilopascals (kPa)',
        secondaryOutputs: [
          { label: 'Bar', value: fmt(pa / 1e5, 5) },
          { label: 'PSI', value: fmt(pa / 6894.757293168, 3) },
          { label: 'Atmospheres (atm)', value: fmt(pa / 101325, 5) },
          { label: 'mmHg / Torr', value: fmt(pa / (101325 / 760), 2) },
        ],
        steps: [`${val} ${v.fromUnit} = ${fmt(pa / 1000, 3)} kPa = ${fmt(pa / 1e5, 4)} bar.`],
      };
    },
  },

  // 846. Power Converter (Watt, kW, Horsepower, BTU/hr)
  {
    slug: 'power-watt-horsepower-btu-converter',
    title: 'Mechanical & Thermal Power Converter (W, kW, Mech/Metric HP, BTU/hr, Ton)',
    category: 'unit-converters',
    formulaDisplay: '1 Mechanical HP = 745.69987 W | 1 kW = 3,412.14 BTU/hr | 1 Cooling Ton = 12,000 BTU/hr',
    inputs: [
      { id: 'value', label: 'Power', type: 'number', defaultValue: 150, min: 0, max: 1e12, step: 5 },
      {
        id: 'fromUnit',
        label: 'From Unit',
        type: 'select',
        defaultValue: 'hp',
        options: [
          { label: 'Watts (W)', value: 'w' },
          { label: 'Kilowatts (kW)', value: 'kw' },
          { label: 'Mechanical Horsepower (hp)', value: 'hp' },
          { label: 'Metric Horsepower (PS / CV)', value: 'ps' },
          { label: 'BTU per Hour (BTU/hr)', value: 'btuh' },
        ],
      },
    ],
    calculate: (v) => {
      const val = parseNum(v.value);
      const toW: Record<string, number> = {
        w: 1, kw: 1000, hp: 745.699871582, ps: 735.49875, btuh: 1 / 3.412141633,
      };
      const mult = toW[v.fromUnit];
      if (Number.isNaN(val) || val < 0 || !mult) return calcError('Enter non-negative power and valid unit.');
      const w = val * mult;
      return {
        primaryValue: fmt(w / 1000, 3),
        primaryUnit: 'kW',
        primaryLabel: 'Kilowatts (kW)',
        secondaryOutputs: [
          { label: 'Watts (W)', value: sci(w) },
          { label: 'Mechanical HP', value: fmt(w / 745.699871582, 3) },
          { label: 'Metric HP (PS)', value: fmt(w / 735.49875, 3) },
          { label: 'BTU/hr', value: sci(w * 3.412141633) },
        ],
        steps: [`${val} ${v.fromUnit} = ${fmt(w / 1000, 3)} kW = ${sci(w * 3.412141633)} BTU/hr.`],
      };
    },
  },

  // 847. Torque Converter (N·m, ft·lb, in·lb, kgf·m)
  {
    slug: 'torque-newton-meter-ft-lb-converter',
    title: 'Torque & Moment Converter (N·m, lb-ft, lb-in, kgf·m)',
    category: 'unit-converters',
    formulaDisplay: '1 lb·ft = 1.35581795 N·m   |   1 N·m = 8.8507458 lb·in',
    inputs: [
      { id: 'value', label: 'Torque', type: 'number', defaultValue: 100, min: 0, max: 1e12, step: 5 },
      {
        id: 'fromUnit',
        label: 'From Unit',
        type: 'select',
        defaultValue: 'ftlb',
        options: [
          { label: 'Newton-Meters (N·m)', value: 'nm' },
          { label: 'Pound-Feet (lb·ft)', value: 'ftlb' },
          { label: 'Pound-Inches (lb·in)', value: 'inlb' },
          { label: 'Kilogram-Force Meters (kgf·m)', value: 'kgfm' },
        ],
      },
    ],
    calculate: (v) => {
      const val = parseNum(v.value);
      const toNm: Record<string, number> = { nm: 1, ftlb: 1.35581794833, inlb: 0.112984829, kgfm: 9.80665 };
      const mult = toNm[v.fromUnit];
      if (Number.isNaN(val) || val < 0 || !mult) return calcError('Enter non-negative torque and valid unit.');
      const nm = val * mult;
      return {
        primaryValue: fmt(nm, 3),
        primaryUnit: 'N·m',
        primaryLabel: 'Newton-Meters',
        secondaryOutputs: [
          { label: 'Pound-Feet (lb·ft)', value: fmt(nm / 1.35581794833, 3) },
          { label: 'Pound-Inches (lb·in)', value: fmt(nm / 0.112984829, 2) },
          { label: 'kgf·m', value: fmt(nm / 9.80665, 3) },
        ],
        steps: [`${val} ${v.fromUnit} = ${fmt(nm, 3)} N·m = ${fmt(nm / 1.35581794833, 3)} lb·ft.`],
      };
    },
  },

  // 848. Force Converter (Newton, lbf, kgf, dyne, kN)
  {
    slug: 'force-newton-lbf-dyne-converter',
    title: 'Force & Thrust Converter (Newtons, kN, Pound-Force lbf, kgf, Dynes)',
    category: 'unit-converters',
    formulaDisplay: '1 lbf = 4.4482216 N   |   1 kgf = 9.80665 N   |   1 N = 10⁵ dynes',
    inputs: [
      { id: 'value', label: 'Force', type: 'number', defaultValue: 500, min: 0, max: 1e12, step: 10 },
      {
        id: 'fromUnit',
        label: 'From Unit',
        type: 'select',
        defaultValue: 'lbf',
        options: [
          { label: 'Newtons (N)', value: 'n' },
          { label: 'Kilonewtons (kN)', value: 'kn' },
          { label: 'Pound-Force (lbf)', value: 'lbf' },
          { label: 'Kilogram-Force (kgf)', value: 'kgf' },
          { label: 'Dynes (dyn)', value: 'dyn' },
        ],
      },
    ],
    calculate: (v) => {
      const val = parseNum(v.value);
      const toN: Record<string, number> = { n: 1, kn: 1000, lbf: 4.448221615, kgf: 9.80665, dyn: 1e-5 };
      const mult = toN[v.fromUnit];
      if (Number.isNaN(val) || val < 0 || !mult) return calcError('Enter non-negative force and valid unit.');
      const n = val * mult;
      return {
        primaryValue: sci(n),
        primaryUnit: 'Newtons (N)',
        primaryLabel: 'SI Newtons',
        secondaryOutputs: [
          { label: 'Kilonewtons (kN)', value: fmt(n / 1000, 4) },
          { label: 'Pound-Force (lbf)', value: fmt(n / 4.448221615, 3) },
          { label: 'Kilogram-Force (kgf)', value: fmt(n / 9.80665, 3) },
          { label: 'Dynes', value: sci(n * 1e5) },
        ],
        steps: [`${val} ${v.fromUnit} = ${sci(n)} N = ${fmt(n / 4.448221615, 3)} lbf.`],
      };
    },
  },

  // 849. Angle Converter (Degrees, Radians, Gradians, NATO Mils, Arcseconds)
  {
    slug: 'angle-degree-radian-gradian-mil-converter',
    title: 'Angle Converter (Degrees, Radians, Gradians, NATO Mils, Arcminutes)',
    category: 'unit-converters',
    formulaDisplay: '180° = π rad = 200 gon = 3,200 NATO mils = 10,800′',
    inputs: [
      { id: 'value', label: 'Angle', type: 'number', defaultValue: 45, min: -1e9, max: 1e9, step: 5 },
      {
        id: 'fromUnit',
        label: 'From Unit',
        type: 'select',
        defaultValue: 'deg',
        options: [
          { label: 'Degrees (°)', value: 'deg' },
          { label: 'Radians (rad)', value: 'rad' },
          { label: 'Gradians (gon)', value: 'gon' },
          { label: 'NATO Mils (6400/circle)', value: 'mil' },
          { label: 'Turns / Revolutions', value: 'turn' },
        ],
      },
    ],
    calculate: (v) => {
      const val = parseNum(v.value);
      const toDeg: Record<string, number> = { deg: 1, rad: 180 / Math.PI, gon: 0.9, mil: 360 / 6400, turn: 360 };
      const mult = toDeg[v.fromUnit];
      if (Number.isNaN(val) || !mult) return calcError('Enter valid angle value and unit.');
      const deg = val * mult;
      return {
        primaryValue: fmt((deg * Math.PI) / 180, 6),
        primaryUnit: 'radians',
        primaryLabel: 'Radians Equivalent',
        secondaryOutputs: [
          { label: 'Degrees (°)', value: fmt(deg, 5) },
          { label: 'Gradians (gon)', value: fmt(deg / 0.9, 4) },
          { label: 'NATO Mils', value: fmt((deg * 6400) / 360, 2) },
          { label: 'Arcminutes (′)', value: fmt(deg * 60, 2) },
        ],
        steps: [`${val} ${v.fromUnit} = ${fmt(deg, 4)}° = ${fmt((deg * Math.PI) / 180, 6)} rad.`],
      };
    },
  },

  // 850. Frequency Converter (Hz, kHz, MHz, RPM, rad/s)
  {
    slug: 'frequency-hz-rpm-rad-per-sec-converter',
    title: 'Frequency & Angular Velocity Converter (Hz, kHz, MHz, GHz, RPM, rad/s)',
    category: 'unit-converters',
    formulaDisplay: '1 Hz = 60 RPM = 2π rad/s   |   Period T = 1 / f',
    inputs: [
      { id: 'value', label: 'Frequency / Speed', type: 'number', defaultValue: 1800, min: 0, max: 1e12, step: 60 },
      {
        id: 'fromUnit',
        label: 'From Unit',
        type: 'select',
        defaultValue: 'rpm',
        options: [
          { label: 'Hertz (Hz)', value: 'hz' },
          { label: 'Kilohertz (kHz)', value: 'khz' },
          { label: 'Megahertz (MHz)', value: 'mhz' },
          { label: 'Gigahertz (GHz)', value: 'ghz' },
          { label: 'Revolutions Per Minute (RPM)', value: 'rpm' },
          { label: 'Radians Per Second (rad/s)', value: 'rads' },
        ],
      },
    ],
    calculate: (v) => {
      const val = parseNum(v.value);
      const toHz: Record<string, number> = {
        hz: 1, khz: 1000, mhz: 1e6, ghz: 1e9, rpm: 1 / 60, rads: 1 / (2 * Math.PI),
      };
      const mult = toHz[v.fromUnit];
      if (Number.isNaN(val) || val < 0 || !mult) return calcError('Enter non-negative frequency and valid unit.');
      const hz = val * mult;
      return {
        primaryValue: sci(hz),
        primaryUnit: 'Hz',
        primaryLabel: 'Hertz (Cycles/sec)',
        secondaryOutputs: [
          { label: 'RPM', value: sci(hz * 60) },
          { label: 'Angular Velocity (rad/s)', value: sci(hz * 2 * Math.PI) },
          { label: 'Period (ms)', value: hz > 0 ? sci(1000 / hz) : 'Undefined (0 Hz)' },
        ],
        steps: [`${val} ${v.fromUnit} = ${sci(hz)} Hz = ${sci(hz * 2 * Math.PI)} rad/s.`],
      };
    },
  },

  // 851. Network Bandwidth & Data Rate Converter
  {
    slug: 'network-bandwidth-data-rate-converter',
    title: 'Network Bandwidth & Transfer Speed Converter (Mbps, Gbps, MB/s, MiB/s)',
    category: 'unit-converters',
    formulaDisplay: '1 Byte/s = 8 bits/s | Decimal SI 10³ vs Binary IEC MiB/s 2²⁰',
    inputs: [
      { id: 'speedVal', label: 'Speed', type: 'number', defaultValue: 1000, min: 0, max: 1e12, step: 50 },
      {
        id: 'fromUnit',
        label: 'From Unit',
        type: 'select',
        defaultValue: 'mbps',
        options: [
          { label: 'Megabits/sec (Mbps)', value: 'mbps' },
          { label: 'Gigabits/sec (Gbps)', value: 'gbps' },
          { label: 'Megabytes/sec (MB/s)', value: 'mbs' },
          { label: 'Mebibytes/sec (MiB/s)', value: 'mibs' },
          { label: 'Gigabytes/sec (GB/s)', value: 'gbs' },
        ],
      },
      { id: 'fileSizeGb', label: 'Reference File Size (for Transfer Time)', type: 'number', unit: 'GB', defaultValue: 50, min: 0, max: 1e9, step: 5 },
    ],
    calculate: (v) => {
      const s = parseNum(v.speedVal);
      const gb = parseNum(v.fileSizeGb);
      const toBps: Record<string, number> = {
        mbps: 1e6, gbps: 1e9, mbs: 8e6, mibs: 8 * 1024 * 1024, gbs: 8e9,
      };
      const mult = toBps[v.fromUnit];
      if (Number.isNaN(s) || Number.isNaN(gb) || s < 0 || gb < 0 || !mult) return calcError('Enter non-negative speed and file size.');
      const bps = s * mult;
      const mbs = bps / 8e6;
      const transferSec = mbs > 0 ? (gb * 1000) / mbs : 0;
      return {
        primaryValue: fmt(mbs, 2),
        primaryUnit: 'MB/s (Decimal)',
        primaryLabel: 'Real-World Download Speed',
        secondaryOutputs: [
          { label: 'Mebibytes/sec (MiB/s)', value: fmt(bps / (8 * 1024 * 1024), 2) },
          { label: 'Mbps', value: fmt(bps / 1e6, 2) },
          { label: 'Gbps', value: fmt(bps / 1e9, 4) },
          { label: `Time for ${gb} GB File`, value: mbs > 0 ? `${fmt(transferSec / 60, 2)} min (${fmt(transferSec, 1)} s)` : 'N/A (0 Mbps)' },
        ],
        steps: [`${s} ${v.fromUnit} = ${fmt(bps / 1e6, 2)} Mbps = ${fmt(mbs, 2)} MB/s.`],
      };
    },
  },

  // 852. Illuminance & Luminous Flux Converter (Lux, Footcandle, Lumens)
  {
    slug: 'luminance-lux-footcandle-lumen-converter',
    title: 'Illuminance Converter (Lux, Foot-Candles, Lumens/m² & Area Lumens)',
    category: 'unit-converters',
    formulaDisplay: '1 Foot-Candle (fc) = 10.76391 Lux (lm/m²)   |   Lumens = Lux × Area (m²)',
    inputs: [
      { id: 'value', label: 'Illuminance Level', type: 'number', defaultValue: 500, min: 0, max: 1e12, step: 25 },
      {
        id: 'fromUnit',
        label: 'From Unit',
        type: 'select',
        defaultValue: 'lux',
        options: [
          { label: 'Lux (lx = lm/m²)', value: 'lux' },
          { label: 'Foot-Candles (fc = lm/ft²)', value: 'fc' },
          { label: 'Phot (ph = 10,000 lx)', value: 'phot' },
        ],
      },
      { id: 'areaSqm', label: 'Target Surface Area', type: 'number', unit: 'm²', defaultValue: 20, min: 0.01, max: 1e9, step: 5 },
    ],
    calculate: (v) => {
      const val = parseNum(v.value);
      const area = parseNum(v.areaSqm);
      const toLux: Record<string, number> = { lux: 1, fc: 10.7639104167, phot: 10000 };
      const mult = toLux[v.fromUnit];
      if (Number.isNaN(val) || Number.isNaN(area) || val < 0 || area <= 0 || !mult) return calcError('Enter non-negative illuminance and positive area.');
      const lux = val * mult;
      const fc = lux / 10.7639104167;
      const totalLumens = lux * area;
      return {
        primaryValue: fmt(fc, 2),
        primaryUnit: 'foot-candles (fc)',
        primaryLabel: 'Foot-Candles Equivalent',
        secondaryOutputs: [
          { label: 'Lux (lm/m²)', value: fmt(lux, 2) },
          { label: 'Required Delivered Lumens', value: `${fmt(totalLumens, 0)} lm` },
        ],
        steps: [`${val} ${v.fromUnit} = ${fmt(lux, 2)} lx = ${fmt(fc, 2)} fc; across ${area} m² requires ${fmt(totalLumens, 0)} delivered lumens.`],
      };
    },
  },

  // 853. Ionizing Radiation Dose & Activity Converter
  {
    slug: 'radiation-sievert-rem-becquerel-converter',
    title: 'Ionizing Radiation Dose & Activity Converter (Sv, mSv, rem, Gy, Bq, Ci)',
    category: 'unit-converters',
    formulaDisplay: '1 Sv = 100 rem | 1 mSv = 100 mrem = 1,000 µSv | 1 Ci = 3.7×10¹⁰ Bq',
    inputs: [
      { id: 'value', label: 'Dose / Activity', type: 'number', defaultValue: 2.4, min: 0, max: 1e12, step: 0.5 },
      {
        id: 'fromUnit',
        label: 'From Unit',
        type: 'select',
        defaultValue: 'msv',
        options: [
          { label: 'Millisieverts (mSv - Equivalent Dose)', value: 'msv' },
          { label: 'Microsieverts (µSv)', value: 'usv' },
          { label: 'Sieverts (Sv)', value: 'sv' },
          { label: 'Rem', value: 'rem' },
          { label: 'Millirem (mrem)', value: 'mrem' },
          { label: 'Curie (Ci - Activity)', value: 'ci' },
          { label: 'Becquerel (Bq - Activity)', value: 'bq' },
        ],
      },
    ],
    calculate: (v) => {
      const val = parseNum(v.value);
      if (Number.isNaN(val) || val < 0 || !['msv', 'usv', 'sv', 'rem', 'mrem', 'ci', 'bq'].includes(v.fromUnit)) {
        return calcError('Enter non-negative radiation value and valid unit.');
      }
      if (v.fromUnit === 'ci' || v.fromUnit === 'bq') {
        const bq = v.fromUnit === 'ci' ? val * 3.7e10 : val;
        return {
          primaryValue: sci(bq),
          primaryUnit: 'Becquerels (Bq)',
          primaryLabel: 'Radioactive Disintegrations / sec',
          secondaryOutputs: [
            { label: 'Gigabecquerels (GBq)', value: sci(bq / 1e9) },
            { label: 'Curies (Ci)', value: sci(bq / 3.7e10) },
          ],
          steps: [`Activity conversion: 1 Ci = 3.7×10¹⁰ Bq.`],
        };
      }
      const toMsv: Record<string, number> = { msv: 1, usv: 0.001, sv: 1000, rem: 10, mrem: 0.01 };
      const msv = val * toMsv[v.fromUnit];
      return {
        primaryValue: fmt(msv * 100, 2),
        primaryUnit: 'mrem',
        primaryLabel: 'Millirem (mrem) Equivalent',
        secondaryOutputs: [
          { label: 'Millisieverts (mSv)', value: fmt(msv, 4) },
          { label: 'Microsieverts (µSv)', value: sci(msv * 1000) },
          { label: 'Sieverts (Sv)', value: fmt(msv / 1000, 6) },
        ],
        steps: [`${val} ${v.fromUnit} = ${fmt(msv, 4)} mSv = ${fmt(msv * 100, 2)} mrem.`],
      };
    },
  },

  // 854. Dynamic & Kinematic Viscosity Converter
  {
    slug: 'dynamic-kinematic-viscosity-converter',
    title: 'Dynamic & Kinematic Viscosity Converter (Pa·s, cP, cSt, St, m²/s)',
    category: 'unit-converters',
    formulaDisplay: '1 Pa·s = 1,000 cP   |   1 cSt = 1 mm²/s = 10⁻⁶ m²/s   |   ν = μ / ρ',
    inputs: [
      { id: 'value', label: 'Viscosity', type: 'number', defaultValue: 10, min: 0, max: 1e12, step: 1 },
      {
        id: 'fromUnit',
        label: 'From Unit',
        type: 'select',
        defaultValue: 'cp',
        options: [
          { label: 'Centipoise (cP = mPa·s Dynamic)', value: 'cp' },
          { label: 'Pascal-seconds (Pa·s Dynamic)', value: 'pas' },
          { label: 'Poise (P Dynamic)', value: 'p' },
          { label: 'Centistokes (cSt = mm²/s Kinematic)', value: 'cst' },
          { label: 'Stokes (St Kinematic)', value: 'st' },
        ],
      },
      { id: 'densityKgM3', label: 'Fluid Density (ρ for μ ↔ ν)', type: 'number', unit: 'kg/m³', defaultValue: 1000, min: 1, max: 30000, step: 50 },
    ],
    calculate: (v) => {
      const val = parseNum(v.value);
      const rho = parseNum(v.densityKgM3);
      if (Number.isNaN(val) || Number.isNaN(rho) || val < 0 || rho <= 0 || !['cp', 'pas', 'p', 'cst', 'st'].includes(v.fromUnit)) {
        return calcError('Enter non-negative viscosity and positive fluid density.');
      }
      let pas = 0;
      if (v.fromUnit === 'cp') pas = val * 0.001;
      else if (v.fromUnit === 'pas') pas = val;
      else if (v.fromUnit === 'p') pas = val * 0.1;
      else {
        const m2s = v.fromUnit === 'cst' ? val * 1e-6 : val * 1e-4;
        pas = m2s * rho;
      }
      const cp = pas * 1000;
      const m2s = pas / rho;
      const cst = m2s * 1e6;
      return {
        primaryValue: fmt(cp, 4),
        primaryUnit: 'cP (mPa·s)',
        primaryLabel: 'Dynamic Viscosity (cP)',
        secondaryOutputs: [
          { label: 'Pascal-seconds (Pa·s)', value: sci(pas) },
          { label: 'Centistokes (cSt)', value: fmt(cst, 4) },
          { label: 'Kinematic m²/s', value: sci(m2s) },
        ],
        steps: [`Dynamic: ${fmt(cp, 4)} cP = ${sci(pas)} Pa·s. With ρ=${rho} kg/m³ → ν = ${fmt(cst, 4)} cSt.`],
      };
    },
  },

  // 855. Density & API Gravity Converter
  {
    slug: 'density-kg-m3-lb-ft3-api-converter',
    title: 'Density, Specific Gravity & Petroleum °API Gravity Converter',
    category: 'unit-converters',
    formulaDisplay: 'SG = ρ / 1,000 kg/m³   |   °API = (141.5 / SG) − 131.5   |   1 g/cm³ = 62.42796 lb/ft³',
    inputs: [
      { id: 'value', label: 'Density / Gravity Value', type: 'number', defaultValue: 850, min: 0.01, max: 1e9, step: 10 },
      {
        id: 'fromUnit',
        label: 'Input Scale',
        type: 'select',
        defaultValue: 'kgm3',
        options: [
          { label: 'kg/m³', value: 'kgm3' },
          { label: 'g/cm³ (= kg/L = SG)', value: 'gcm3' },
          { label: 'lb/ft³', value: 'lbft3' },
          { label: 'lb/US gal', value: 'lbgal' },
          { label: '°API Gravity (Petroleum)', value: 'api' },
        ],
      },
    ],
    calculate: (v) => {
      const val = parseNum(v.value);
      if (Number.isNaN(val) || val <= 0 || !['kgm3', 'gcm3', 'lbft3', 'lbgal', 'api'].includes(v.fromUnit)) {
        return calcError('Enter positive density value and valid unit.');
      }
      let kgm3 = val;
      if (v.fromUnit === 'gcm3') kgm3 = val * 1000;
      else if (v.fromUnit === 'lbft3') kgm3 = val * 16.01846337;
      else if (v.fromUnit === 'lbgal') kgm3 = val * 119.8264273;
      else if (v.fromUnit === 'api') {
        const sg = 141.5 / (val + 131.5);
        kgm3 = sg * 1000;
      }
      const sg = kgm3 / 1000;
      const api = 141.5 / sg - 131.5;
      return {
        primaryValue: fmt(kgm3, 2),
        primaryUnit: 'kg/m³',
        primaryLabel: 'SI Density',
        secondaryOutputs: [
          { label: 'Specific Gravity (g/cm³)', value: fmt(sg, 4) },
          { label: 'lb/ft³', value: fmt(kgm3 / 16.01846337, 3) },
          { label: 'lb/US gal', value: fmt(kgm3 / 119.8264273, 3) },
          { label: '°API Gravity', value: fmt(api, 2) },
        ],
        steps: [`ρ = ${fmt(kgm3, 2)} kg/m³ (SG = ${fmt(sg, 4)}, °API = ${fmt(api, 2)}).`],
      };
    },
  },

  // 856. Volumetric Flow Rate Converter (L/min, GPM, CFM, m³/h)
  {
    slug: 'flow-rate-lpm-gpm-cfm-converter',
    title: 'Volumetric Flow Rate Converter (L/min, US GPM, CFM, m³/h, L/s)',
    category: 'unit-converters',
    formulaDisplay: '1 US GPM = 3.78541 L/min   |   1 CFM = 28.31685 L/min   |   1 m³/h = 16.6667 L/min',
    inputs: [
      { id: 'value', label: 'Flow Rate', type: 'number', defaultValue: 15, min: 0, max: 1e12, step: 1 },
      {
        id: 'fromUnit',
        label: 'From Unit',
        type: 'select',
        defaultValue: 'gpm',
        options: [
          { label: 'Liters per Minute (L/min)', value: 'lpm' },
          { label: 'Liters per Second (L/s)', value: 'lps' },
          { label: 'US Gallons per Minute (GPM)', value: 'gpm' },
          { label: 'Cubic Feet per Minute (CFM)', value: 'cfm' },
          { label: 'Cubic Meters per Hour (m³/h)', value: 'm3h' },
        ],
      },
    ],
    calculate: (v) => {
      const val = parseNum(v.value);
      const toLpm: Record<string, number> = {
        lpm: 1, lps: 60, gpm: 3.785411784, cfm: 28.316846592, m3h: 1000 / 60,
      };
      const mult = toLpm[v.fromUnit];
      if (Number.isNaN(val) || val < 0 || !mult) return calcError('Enter non-negative flow rate and valid unit.');
      const lpm = val * mult;
      return {
        primaryValue: fmt(lpm, 3),
        primaryUnit: 'L/min',
        primaryLabel: 'Liters per Minute',
        secondaryOutputs: [
          { label: 'US GPM', value: fmt(lpm / 3.785411784, 3) },
          { label: 'CFM (ft³/min)', value: fmt(lpm / 28.316846592, 3) },
          { label: 'm³/h', value: fmt((lpm * 60) / 1000, 3) },
          { label: 'Liters per Second (L/s)', value: fmt(lpm / 60, 4) },
        ],
        steps: [`${val} ${v.fromUnit} = ${fmt(lpm, 3)} L/min = ${fmt(lpm / 28.316846592, 3)} CFM.`],
      };
    },
  },

  // 857. Electric Charge & Battery Capacity Converter (Ah, mAh, Coulombs, Wh)
  {
    slug: 'electric-charge-ampere-hour-coulomb-converter',
    title: 'Electric Charge & Battery Capacity Converter (Ah, mAh, Coulombs, Wh)',
    category: 'unit-converters',
    formulaDisplay: '1 Ah = 3,600 Coulombs (A·s) = 1,000 mAh   |   Wh = Ah × Voltage',
    inputs: [
      { id: 'value', label: 'Charge / Capacity', type: 'number', defaultValue: 5000, min: 0, max: 1e12, step: 100 },
      {
        id: 'fromUnit',
        label: 'From Unit',
        type: 'select',
        defaultValue: 'mah',
        options: [
          { label: 'Milliampere-Hours (mAh)', value: 'mah' },
          { label: 'Ampere-Hours (Ah)', value: 'ah' },
          { label: 'Coulombs (C = A·s)', value: 'c' },
        ],
      },
      { id: 'voltage', label: 'Nominal Battery Voltage (for Wh)', type: 'number', unit: 'V', defaultValue: 3.7, min: 0.1, max: 10000, step: 0.1 },
    ],
    calculate: (v) => {
      const val = parseNum(v.value);
      const volts = parseNum(v.voltage);
      const toC: Record<string, number> = { c: 1, mah: 3.6, ah: 3600 };
      const mult = toC[v.fromUnit];
      if (Number.isNaN(val) || Number.isNaN(volts) || val < 0 || volts <= 0 || !mult) return calcError('Enter valid charge >= 0 and positive voltage.');
      const coulombs = val * mult;
      const ah = coulombs / 3600;
      const wh = ah * volts;
      return {
        primaryValue: sci(coulombs),
        primaryUnit: 'Coulombs (C)',
        primaryLabel: 'SI Electric Charge',
        secondaryOutputs: [
          { label: 'Ampere-Hours (Ah)', value: fmt(ah, 4) },
          { label: 'Milliampere-Hours (mAh)', value: fmt(ah * 1000, 1) },
          { label: `Energy @ ${volts} V`, value: `${fmt(wh, 2)} Wh` },
        ],
        steps: [`${val} ${v.fromUnit} = ${sci(coulombs)} C = ${fmt(ah, 3)} Ah = ${fmt(wh, 2)} Wh @ ${volts} V.`],
      };
    },
  },

  // 858. Magnetic Flux & Flux Density Converter (Tesla, Gauss, Weber, Maxwell)
  {
    slug: 'magnetic-flux-tesla-gauss-weber-converter',
    title: 'Magnetic Flux & Density Converter (Tesla, mT, Gauss, Weber, Maxwell)',
    category: 'unit-converters',
    formulaDisplay: '1 Tesla = 10,000 Gauss = 1 Wb/m²   |   1 Weber = 10⁸ Maxwells',
    inputs: [
      { id: 'value', label: 'Magnetic Field / Flux', type: 'number', defaultValue: 1.5, min: 0, max: 1e12, step: 0.1 },
      {
        id: 'fromUnit',
        label: 'From Unit',
        type: 'select',
        defaultValue: 'tesla',
        options: [
          { label: 'Tesla (T - Density)', value: 'tesla' },
          { label: 'Millitesla (mT - Density)', value: 'mt' },
          { label: 'Gauss (G - Density)', value: 'gauss' },
          { label: 'Weber (Wb - Total Flux)', value: 'weber' },
          { label: 'Maxwell (Mx - Total Flux)', value: 'maxwell' },
        ],
      },
    ],
    calculate: (v) => {
      const val = parseNum(v.value);
      if (Number.isNaN(val) || val < 0 || !['tesla', 'mt', 'gauss', 'weber', 'maxwell'].includes(v.fromUnit)) {
        return calcError('Enter non-negative magnetic value and valid unit.');
      }
      if (v.fromUnit === 'weber' || v.fromUnit === 'maxwell') {
        const wb = v.fromUnit === 'maxwell' ? val * 1e-8 : val;
        return {
          primaryValue: sci(wb),
          primaryUnit: 'Webers (Wb)',
          primaryLabel: 'Magnetic Flux (SI)',
          secondaryOutputs: [
            { label: 'Milliwebers (mWb)', value: sci(wb * 1000) },
            { label: 'Maxwells (Mx)', value: sci(wb * 1e8) },
          ],
          steps: [`Total flux: 1 Wb = 10⁸ Maxwells.`],
        };
      }
      const toT: Record<string, number> = { tesla: 1, mt: 0.001, gauss: 1e-4 };
      const t = val * toT[v.fromUnit];
      return {
        primaryValue: sci(t * 10000),
        primaryUnit: 'Gauss (G)',
        primaryLabel: 'Gauss (CGS Density)',
        secondaryOutputs: [
          { label: 'Tesla (T)', value: sci(t) },
          { label: 'Millitesla (mT)', value: sci(t * 1000) },
          { label: 'Microtesla (µT)', value: sci(t * 1e6) },
        ],
        steps: [`${val} ${v.fromUnit} = ${sci(t)} T = ${sci(t * 10000)} Gauss.`],
      };
    },
  },

  // 859. CSS Typography & Print Scale Converter (px, rem, em, pt, mm)
  {
    slug: 'typography-px-rem-pt-dpi-converter',
    title: 'CSS & Print Typography Converter (px, rem, em, pt, mm @ 96 CSS DPI)',
    category: 'unit-converters',
    formulaDisplay: 'rem = px / BaseFontPx   |   1 in = 96 CSS px = 72 Print pt (so 1 pt = 4/3 px)',
    inputs: [
      { id: 'value', label: 'Size Value', type: 'number', defaultValue: 24, min: 0.1, max: 1e6, step: 1 },
      {
        id: 'fromUnit',
        label: 'From Unit',
        type: 'select',
        defaultValue: 'px',
        options: [
          { label: 'CSS Pixels (px)', value: 'px' },
          { label: 'Root em (rem)', value: 'rem' },
          { label: 'Print Points (pt)', value: 'pt' },
          { label: 'Millimeters (mm)', value: 'mm' },
        ],
      },
      { id: 'basePx', label: 'Root HTML Font Size', type: 'number', unit: 'px', defaultValue: 16, min: 6, max: 100, step: 1 },
    ],
    calculate: (v) => {
      const val = parseNum(v.value);
      const base = parseNum(v.basePx);
      if (Number.isNaN(val) || Number.isNaN(base) || val <= 0 || base <= 0 || !['px', 'rem', 'pt', 'mm'].includes(v.fromUnit)) {
        return calcError('Size and root font size must be positive.');
      }
      let px = val;
      if (v.fromUnit === 'rem') px = val * base;
      else if (v.fromUnit === 'pt') px = (val * 96) / 72;
      else if (v.fromUnit === 'mm') px = (val * 96) / 25.4;
      return {
        primaryValue: fmt(px / base, 4),
        primaryUnit: 'rem',
        primaryLabel: `REM (vs ${base}px root)`,
        secondaryOutputs: [
          { label: 'CSS Pixels (px)', value: `${fmt(px, 2)} px` },
          { label: 'Print Points (pt)', value: `${fmt((px * 72) / 96, 2)} pt` },
          { label: 'Physical Millimeters', value: `${fmt((px * 25.4) / 96, 2)} mm` },
        ],
        steps: [`${val} ${v.fromUnit} = ${fmt(px, 2)} CSS px = ${fmt(px / base, 4)} rem.`],
      };
    },
  },

  // 860. International Footwear Size Converter (US, UK, EU, Mondopoint cm)
  {
    slug: 'clothing-shoe-size-us-uk-eu-converter',
    title: 'International Shoe Size Converter (US Men/Women, UK, EU, Foot Length cm/in)',
    category: 'unit-converters',
    formulaDisplay: 'EU ≈ (Foot_cm + 1.5 cm last allowance) × 1.5   |   UK ≈ 3 × Last_in − 25 (Adult)',
    inputs: [
      { id: 'footCm', label: 'Foot Length (Heel to Toe)', type: 'number', unit: 'cm', defaultValue: 26.5, min: 15, max: 36, step: 0.5 },
      {
        id: 'genderFit',
        label: 'US Sizing Track',
        type: 'select',
        defaultValue: 'mens',
        options: [
          { label: 'US Men’s Standard', value: 'mens' },
          { label: 'US Women’s Standard (+1.5 vs Men)', value: 'womens' },
        ],
      },
    ],
    calculate: (v) => {
      const cm = parseNum(v.footCm);
      if (Number.isNaN(cm) || cm < 15 || cm > 36 || !['mens', 'womens'].includes(v.genderFit)) {
        return calcError('Foot length must be between 15 and 36 cm.');
      }
      // ISO 9407 / Brannock approximation: Mondo mm = foot cm * 10
      const eu = Math.round(((cm + 1.5) * 1.5) * 2) / 2;
      const usMens = Math.round(((cm / 2.54) * 3 - 22) * 2) / 2;
      const usWomens = usMens + 1.5;
      const uk = usMens - 1;
      return {
        primaryValue: eu,
        primaryUnit: 'EU Size',
        primaryLabel: 'European Size (ISO Approx)',
        secondaryOutputs: [
          { label: 'US Men’s Size', value: usMens },
          { label: 'US Women’s Size', value: usWomens },
          { label: 'UK Size', value: uk },
          { label: 'Foot Length (Inches)', value: `${fmt(cm / 2.54, 2)} in (${Math.round(cm * 10)} mm Mondo)` },
        ],
        steps: [`${cm} cm foot → Mondopoint ${Math.round(cm * 10)} mm → EU ${eu} / US Men ${usMens} / US Women ${usWomens} / UK ${uk}.`],
      };
    },
  },

  // 861. Gold Karat, Millesimal Fineness & Pure Gold Weight Converter
  {
    slug: 'gold-karat-fineness-purity-converter',
    title: 'Gold Karat, Millesimal Fineness & Pure Melt Weight Converter',
    category: 'unit-converters',
    formulaDisplay: 'Purity % = (Karat / 24) × 100   |   Fineness = round((Karat / 24) × 1000)',
    inputs: [
      { id: 'karat', label: 'Gold Karat (0–24K)', type: 'number', unit: 'K', defaultValue: 18, min: 0.1, max: 24, step: 1 },
      { id: 'grossGrams', label: 'Gross Jewelry Weight', type: 'number', unit: 'g', defaultValue: 20, min: 0, max: 1e9, step: 1 },
      { id: 'spotPerOzt', label: '24K Gold Spot Price ($/troy oz)', type: 'number', prefix: '$', defaultValue: 2650, min: 0, max: 1e7, step: 25 },
    ],
    calculate: (v) => {
      const [k, g, spot] = [v.karat, v.grossGrams, v.spotPerOzt].map(parseNum);
      if ([k, g, spot].some(Number.isNaN) || k <= 0 || k > 24 || g < 0 || spot < 0) return calcError('Karat must be 0.1–24; weight and spot >= 0.');
      const purityFrac = k / 24;
      const fineness = Math.round(purityFrac * 1000);
      const pureGrams = g * purityFrac;
      const pureOzt = pureGrams / 31.1034768;
      const meltValue = pureOzt * spot;
      return {
        primaryValue: fmt(purityFrac * 100, 2),
        primaryUnit: '% Pure Gold',
        primaryLabel: `${k}K Gold Purity (Fineness ${fineness})`,
        secondaryOutputs: [
          { label: 'Millesimal Hallmark', value: `${fineness}` },
          { label: 'Fine Gold Mass', value: `${fmt(pureGrams, 3)} g (${fmt(pureOzt, 4)} ozt)` },
          { label: 'Pure Melt Bullion Value', value: `$${fmt(meltValue, 2)}` },
        ],
        steps: [`${k}/24 = ${fmt(purityFrac * 100, 2)}% pure (${fineness} fineness); ${g} g contains ${fmt(pureGrams, 3)} g pure Au worth $${fmt(meltValue, 2)}.`],
      };
    },
  },

  // 862. PPM, PPB, Percent & mg/L Concentration Converter
  {
    slug: 'parts-per-million-ppm-percent-converter',
    title: 'PPM, PPB, Percent & Water mg/L Concentration Converter',
    category: 'unit-converters',
    formulaDisplay: '1% = 10,000 ppm = 10,000,000 ppb   |   1 ppm ≈ 1 mg/L (dilute aqueous)',
    inputs: [
      { id: 'value', label: 'Concentration Value', type: 'number', defaultValue: 250, min: 0, max: 1e12, step: 10 },
      {
        id: 'fromUnit',
        label: 'From Unit',
        type: 'select',
        defaultValue: 'ppm',
        options: [
          { label: 'Parts per Million (ppm)', value: 'ppm' },
          { label: 'Parts per Billion (ppb)', value: 'ppb' },
          { label: 'Percent (%)', value: 'pct' },
          { label: 'Per Mille (‰)', value: 'permille' },
        ],
      },
    ],
    calculate: (v) => {
      const val = parseNum(v.value);
      const toPpm: Record<string, number> = { ppm: 1, ppb: 0.001, pct: 10000, permille: 1000 };
      const mult = toPpm[v.fromUnit];
      if (Number.isNaN(val) || val < 0 || !mult) return calcError('Enter non-negative concentration and valid unit.');
      const ppm = val * mult;
      return {
        primaryValue: fmt(ppm / 10000, 6),
        primaryUnit: '%',
        primaryLabel: 'Percentage (%)',
        secondaryOutputs: [
          { label: 'PPM (mg/L aqueous)', value: sci(ppm) },
          { label: 'PPB (µg/L aqueous)', value: sci(ppm * 1000) },
          { label: 'Per Mille (‰)', value: fmt(ppm / 1000, 5) },
        ],
        steps: [`${val} ${v.fromUnit} = ${sci(ppm)} ppm = ${fmt(ppm / 10000, 6)}%.`],
      };
    },
  },

  // 863. Clinical Blood Sugar & Lipid Panel Unit Converter (US mg/dL ↔ International mmol/L)
  {
    slug: 'blood-sugar-mgdl-mmol-lipid-converter',
    title: 'Blood Glucose & Lipid Panel Converter (mg/dL ↔ mmol/L)',
    category: 'unit-converters',
    formulaDisplay: 'Glucose: mmol/L = mg/dL ÷ 18.016   |   Cholesterol: ÷ 38.67   |   Triglycerides: ÷ 88.57',
    inputs: [
      {
        id: 'analyte',
        label: 'Lab Analyte',
        type: 'select',
        defaultValue: 'glucose',
        options: [
          { label: 'Blood Glucose (18.016)', value: 'glucose' },
          { label: 'Total / LDL / HDL Cholesterol (38.67)', value: 'chol' },
          { label: 'Triglycerides (88.57)', value: 'trig' },
          { label: 'Serum Creatinine (mg/dL ↔ µmol/L · 88.42)', value: 'creat' },
        ],
      },
      {
        id: 'direction',
        label: 'Conversion Direction',
        type: 'select',
        defaultValue: 'to_si',
        options: [
          { label: 'US Conventional (mg/dL) → International SI (mmol/L or µmol/L)', value: 'to_si' },
          { label: 'International SI (mmol/L or µmol/L) → US (mg/dL)', value: 'to_us' },
        ],
      },
      { id: 'value', label: 'Lab Value', type: 'number', defaultValue: 110, min: 0.01, max: 10000, step: 1 },
    ],
    calculate: (v) => {
      const val = parseNum(v.value);
      const divisors: Record<string, { f: number; siUnit: string; name: string }> = {
        glucose: { f: 18.016, siUnit: 'mmol/L', name: 'Glucose' },
        chol: { f: 38.67, siUnit: 'mmol/L', name: 'Cholesterol' },
        trig: { f: 88.57, siUnit: 'mmol/L', name: 'Triglycerides' },
        creat: { f: 88.42, siUnit: 'µmol/L', name: 'Creatinine' },
      };
      const cfg = divisors[v.analyte];
      if (Number.isNaN(val) || val <= 0 || !cfg || !['to_si', 'to_us'].includes(v.direction)) {
        return calcError('Enter positive lab value and valid analyte.');
      }
      // Note for Creatinine: 1 mg/dL = 88.42 umol/L (multiply, whereas glucose/lipids divide mg/dL by factor to get mmol/L)
      let out = 0;
      let outUnit = '';
      if (v.analyte === 'creat') {
        out = v.direction === 'to_si' ? val * cfg.f : val / cfg.f;
        outUnit = v.direction === 'to_si' ? 'µmol/L' : 'mg/dL';
      } else {
        out = v.direction === 'to_si' ? val / cfg.f : val * cfg.f;
        outUnit = v.direction === 'to_si' ? 'mmol/L' : 'mg/dL';
      }
      return {
        primaryValue: fmt(out, 2),
        primaryUnit: outUnit,
        primaryLabel: `Converted ${cfg.name}`,
        secondaryOutputs: [
          { label: 'Conversion Factor', value: `${cfg.f}` },
          { label: 'Direction', value: v.direction === 'to_si' ? 'US → SI' : 'SI → US' },
        ],
        steps: [`${cfg.name}: ${val} converted cleanly → ${fmt(out, 2)} ${outUnit}.`],
      };
    },
  },
];
