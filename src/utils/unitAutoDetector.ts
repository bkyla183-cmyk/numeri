export type UnitDimension =
  | 'currency'
  | 'length'
  | 'weight'
  | 'temperature'
  | 'volume'
  | 'area'
  | 'speed'
  | 'energy'
  | 'power';

export interface AutoDetectCandidate {
  source: 'output' | 'input';
  label: string;
  value: string | number;
  unit?: string;
  prefix?: string;
}

export interface ConvertedUnitTarget {
  unitId: string;
  shortLabel: string;
  fullLabel: string;
  formattedValue: string;
  numericValue: number;
}

export interface DetectedUnitSuggestion {
  id: string;
  source: 'output' | 'input';
  sourceLabel: string;
  dimension: UnitDimension;
  dimensionLabel: string;
  originalValueFormatted: string;
  originalUnitShort: string;
  periodSuffix: string;
  isApproximateFx: boolean;
  targets: ConvertedUnitTarget[];
}

interface UnitDef {
  id: string;
  shortLabel: string;
  fullLabel: string;
  dimension: UnitDimension;
  toBase: (v: number) => number;
  fromBase: (v: number) => number;
  preferredTargets: string[];
}

const DIMENSION_LABELS: Record<UnitDimension, string> = {
  currency: 'Currency (Indicative Ref FX)',
  length: 'Length & Distance',
  weight: 'Weight & Mass',
  temperature: 'Temperature',
  volume: 'Volume & Capacity',
  area: 'Area',
  speed: 'Speed & Velocity',
  energy: 'Energy',
  power: 'Power',
};

// Base units:
// currency -> USD (indicative reference rates)
// length -> meter (m)
// weight -> kilogram (kg)
// temperature -> Celsius (°C)
// volume -> liter (L)
// area -> square meter (m²)
// speed -> m/s
// energy -> kilocalorie (kcal)
// power -> watt (W)
const UNIT_DEFS: Record<string, UnitDef> = {
  // Currency (indicative static reference FX rates relative to USD)
  usd: {
    id: 'usd',
    shortLabel: 'USD',
    fullLabel: 'US Dollar ($)',
    dimension: 'currency',
    toBase: (v) => v,
    fromBase: (v) => v,
    preferredTargets: ['eur', 'gbp', 'cad', 'jpy'],
  },
  eur: {
    id: 'eur',
    shortLabel: 'EUR',
    fullLabel: 'Euro (€)',
    dimension: 'currency',
    toBase: (v) => v / 0.92,
    fromBase: (v) => v * 0.92,
    preferredTargets: ['usd', 'gbp', 'cad', 'jpy'],
  },
  gbp: {
    id: 'gbp',
    shortLabel: 'GBP',
    fullLabel: 'British Pound (£)',
    dimension: 'currency',
    toBase: (v) => v / 0.79,
    fromBase: (v) => v * 0.79,
    preferredTargets: ['usd', 'eur', 'cad', 'aud'],
  },
  cad: {
    id: 'cad',
    shortLabel: 'CAD',
    fullLabel: 'Canadian Dollar (C$)',
    dimension: 'currency',
    toBase: (v) => v / 1.38,
    fromBase: (v) => v * 1.38,
    preferredTargets: ['usd', 'eur', 'gbp', 'aud'],
  },
  aud: {
    id: 'aud',
    shortLabel: 'AUD',
    fullLabel: 'Australian Dollar (A$)',
    dimension: 'currency',
    toBase: (v) => v / 1.52,
    fromBase: (v) => v * 1.52,
    preferredTargets: ['usd', 'eur', 'gbp', 'cad'],
  },
  jpy: {
    id: 'jpy',
    shortLabel: 'JPY',
    fullLabel: 'Japanese Yen (¥)',
    dimension: 'currency',
    toBase: (v) => v / 154,
    fromBase: (v) => v * 154,
    preferredTargets: ['usd', 'eur', 'gbp', 'cad'],
  },
  aed: {
    id: 'aed',
    shortLabel: 'AED',
    fullLabel: 'UAE Dirham (AED)',
    dimension: 'currency',
    toBase: (v) => v / 3.6725,
    fromBase: (v) => v * 3.6725,
    preferredTargets: ['usd', 'eur', 'gbp', 'cad'],
  },

  // Length
  mm: {
    id: 'mm',
    shortLabel: 'mm',
    fullLabel: 'Millimeters',
    dimension: 'length',
    toBase: (v) => v / 1000,
    fromBase: (v) => v * 1000,
    preferredTargets: ['cm', 'in', 'm', 'ft'],
  },
  cm: {
    id: 'cm',
    shortLabel: 'cm',
    fullLabel: 'Centimeters',
    dimension: 'length',
    toBase: (v) => v / 100,
    fromBase: (v) => v * 100,
    preferredTargets: ['in', 'ft', 'm', 'mm'],
  },
  m: {
    id: 'm',
    shortLabel: 'm',
    fullLabel: 'Meters',
    dimension: 'length',
    toBase: (v) => v,
    fromBase: (v) => v,
    preferredTargets: ['ft', 'in', 'cm', 'yd'],
  },
  km: {
    id: 'km',
    shortLabel: 'km',
    fullLabel: 'Kilometers',
    dimension: 'length',
    toBase: (v) => v * 1000,
    fromBase: (v) => v / 1000,
    preferredTargets: ['mi', 'm', 'ft', 'yd'],
  },
  in: {
    id: 'in',
    shortLabel: 'in',
    fullLabel: 'Inches',
    dimension: 'length',
    toBase: (v) => v * 0.0254,
    fromBase: (v) => v / 0.0254,
    preferredTargets: ['cm', 'mm', 'ft', 'm'],
  },
  ft: {
    id: 'ft',
    shortLabel: 'ft',
    fullLabel: 'Feet',
    dimension: 'length',
    toBase: (v) => v * 0.3048,
    fromBase: (v) => v / 0.3048,
    preferredTargets: ['m', 'cm', 'in', 'yd'],
  },
  yd: {
    id: 'yd',
    shortLabel: 'yd',
    fullLabel: 'Yards',
    dimension: 'length',
    toBase: (v) => v * 0.9144,
    fromBase: (v) => v / 0.9144,
    preferredTargets: ['m', 'ft', 'km', 'mi'],
  },
  mi: {
    id: 'mi',
    shortLabel: 'mi',
    fullLabel: 'Miles',
    dimension: 'length',
    toBase: (v) => v * 1609.344,
    fromBase: (v) => v / 1609.344,
    preferredTargets: ['km', 'm', 'yd', 'ft'],
  },

  // Weight
  mg: {
    id: 'mg',
    shortLabel: 'mg',
    fullLabel: 'Milligrams',
    dimension: 'weight',
    toBase: (v) => v / 1_000_000,
    fromBase: (v) => v * 1_000_000,
    preferredTargets: ['g', 'oz', 'kg'],
  },
  g: {
    id: 'g',
    shortLabel: 'g',
    fullLabel: 'Grams',
    dimension: 'weight',
    toBase: (v) => v / 1000,
    fromBase: (v) => v * 1000,
    preferredTargets: ['oz', 'kg', 'lb', 'ozt'],
  },
  kg: {
    id: 'kg',
    shortLabel: 'kg',
    fullLabel: 'Kilograms',
    dimension: 'weight',
    toBase: (v) => v,
    fromBase: (v) => v,
    preferredTargets: ['lb', 'oz', 'g', 'st'],
  },
  oz: {
    id: 'oz',
    shortLabel: 'oz',
    fullLabel: 'Ounces',
    dimension: 'weight',
    toBase: (v) => v * 0.028349523125,
    fromBase: (v) => v / 0.028349523125,
    preferredTargets: ['g', 'kg', 'lb', 'ozt'],
  },
  lb: {
    id: 'lb',
    shortLabel: 'lbs',
    fullLabel: 'Pounds',
    dimension: 'weight',
    toBase: (v) => v * 0.45359237,
    fromBase: (v) => v / 0.45359237,
    preferredTargets: ['kg', 'g', 'oz', 'st'],
  },
  st: {
    id: 'st',
    shortLabel: 'st',
    fullLabel: 'Stone',
    dimension: 'weight',
    toBase: (v) => v * 6.35029318,
    fromBase: (v) => v / 6.35029318,
    preferredTargets: ['kg', 'lb', 'oz'],
  },
  ozt: {
    id: 'ozt',
    shortLabel: 'ozt',
    fullLabel: 'Troy Ounces',
    dimension: 'weight',
    toBase: (v) => v * 0.0311034768,
    fromBase: (v) => v / 0.0311034768,
    preferredTargets: ['g', 'oz', 'kg'],
  },

  // Temperature
  c: {
    id: 'c',
    shortLabel: '°C',
    fullLabel: 'Celsius',
    dimension: 'temperature',
    toBase: (v) => v,
    fromBase: (v) => v,
    preferredTargets: ['f', 'k'],
  },
  f: {
    id: 'f',
    shortLabel: '°F',
    fullLabel: 'Fahrenheit',
    dimension: 'temperature',
    toBase: (v) => ((v - 32) * 5) / 9,
    fromBase: (v) => (v * 9) / 5 + 32,
    preferredTargets: ['c', 'k'],
  },
  k: {
    id: 'k',
    shortLabel: 'K',
    fullLabel: 'Kelvin',
    dimension: 'temperature',
    toBase: (v) => v - 273.15,
    fromBase: (v) => v + 273.15,
    preferredTargets: ['c', 'f'],
  },

  // Volume
  ml: {
    id: 'ml',
    shortLabel: 'mL',
    fullLabel: 'Milliliters',
    dimension: 'volume',
    toBase: (v) => v / 1000,
    fromBase: (v) => v * 1000,
    preferredTargets: ['l', 'floz', 'cup'],
  },
  l: {
    id: 'l',
    shortLabel: 'L',
    fullLabel: 'Liters',
    dimension: 'volume',
    toBase: (v) => v,
    fromBase: (v) => v,
    preferredTargets: ['gal', 'ml', 'floz', 'm3'],
  },
  floz: {
    id: 'floz',
    shortLabel: 'fl oz',
    fullLabel: 'Fluid Ounces (US)',
    dimension: 'volume',
    toBase: (v) => v * 0.0295735296,
    fromBase: (v) => v / 0.0295735296,
    preferredTargets: ['ml', 'cup', 'l'],
  },
  cup: {
    id: 'cup',
    shortLabel: 'cup',
    fullLabel: 'US Cups',
    dimension: 'volume',
    toBase: (v) => v * 0.2365882365,
    fromBase: (v) => v / 0.2365882365,
    preferredTargets: ['ml', 'l', 'floz'],
  },
  gal: {
    id: 'gal',
    shortLabel: 'US gal',
    fullLabel: 'US Gallons',
    dimension: 'volume',
    toBase: (v) => v * 3.785411784,
    fromBase: (v) => v / 3.785411784,
    preferredTargets: ['l', 'ml', 'ft3'],
  },
  m3: {
    id: 'm3',
    shortLabel: 'm³',
    fullLabel: 'Cubic Meters',
    dimension: 'volume',
    toBase: (v) => v * 1000,
    fromBase: (v) => v / 1000,
    preferredTargets: ['ft3', 'l', 'gal'],
  },
  ft3: {
    id: 'ft3',
    shortLabel: 'ft³',
    fullLabel: 'Cubic Feet',
    dimension: 'volume',
    toBase: (v) => v * 28.3168466,
    fromBase: (v) => v / 28.3168466,
    preferredTargets: ['m3', 'l', 'gal'],
  },

  // Area
  sqm: {
    id: 'sqm',
    shortLabel: 'm²',
    fullLabel: 'Square Meters',
    dimension: 'area',
    toBase: (v) => v,
    fromBase: (v) => v,
    preferredTargets: ['sqft', 'acre', 'ha'],
  },
  sqft: {
    id: 'sqft',
    shortLabel: 'ft²',
    fullLabel: 'Square Feet',
    dimension: 'area',
    toBase: (v) => v * 0.09290304,
    fromBase: (v) => v / 0.09290304,
    preferredTargets: ['sqm', 'acre', 'ha'],
  },
  acre: {
    id: 'acre',
    shortLabel: 'acres',
    fullLabel: 'Acres',
    dimension: 'area',
    toBase: (v) => v * 4046.8564224,
    fromBase: (v) => v / 4046.8564224,
    preferredTargets: ['ha', 'sqft', 'sqm'],
  },
  ha: {
    id: 'ha',
    shortLabel: 'ha',
    fullLabel: 'Hectares',
    dimension: 'area',
    toBase: (v) => v * 10000,
    fromBase: (v) => v / 10000,
    preferredTargets: ['acre', 'sqm', 'sqft'],
  },

  // Speed
  mps: {
    id: 'mps',
    shortLabel: 'm/s',
    fullLabel: 'Meters/second',
    dimension: 'speed',
    toBase: (v) => v,
    fromBase: (v) => v,
    preferredTargets: ['kph', 'mph', 'knot'],
  },
  kph: {
    id: 'kph',
    shortLabel: 'km/h',
    fullLabel: 'Kilometers/hour',
    dimension: 'speed',
    toBase: (v) => v / 3.6,
    fromBase: (v) => v * 3.6,
    preferredTargets: ['mph', 'mps', 'knot'],
  },
  mph: {
    id: 'mph',
    shortLabel: 'mph',
    fullLabel: 'Miles/hour',
    dimension: 'speed',
    toBase: (v) => v * 0.44704,
    fromBase: (v) => v / 0.44704,
    preferredTargets: ['kph', 'mps', 'knot'],
  },
  knot: {
    id: 'knot',
    shortLabel: 'kn',
    fullLabel: 'Knots',
    dimension: 'speed',
    toBase: (v) => v * 0.514444,
    fromBase: (v) => v / 0.514444,
    preferredTargets: ['mph', 'kph', 'mps'],
  },

  // Energy
  kcal: {
    id: 'kcal',
    shortLabel: 'kcal',
    fullLabel: 'Kilocalories',
    dimension: 'energy',
    toBase: (v) => v,
    fromBase: (v) => v,
    preferredTargets: ['kj', 'wh', 'btu'],
  },
  kj: {
    id: 'kj',
    shortLabel: 'kJ',
    fullLabel: 'Kilojoules',
    dimension: 'energy',
    toBase: (v) => v / 4.184,
    fromBase: (v) => v * 4.184,
    preferredTargets: ['kcal', 'kwh', 'btu'],
  },
  wh: {
    id: 'wh',
    shortLabel: 'Wh',
    fullLabel: 'Watt-hours',
    dimension: 'energy',
    toBase: (v) => v * 0.86042065,
    fromBase: (v) => v / 0.86042065,
    preferredTargets: ['kwh', 'kj', 'btu'],
  },
  kwh: {
    id: 'kwh',
    shortLabel: 'kWh',
    fullLabel: 'Kilowatt-hours',
    dimension: 'energy',
    toBase: (v) => v * 860.42065,
    fromBase: (v) => v / 860.42065,
    preferredTargets: ['btu', 'kj', 'kcal'],
  },
  btu: {
    id: 'btu',
    shortLabel: 'BTU',
    fullLabel: 'British Thermal Units',
    dimension: 'energy',
    toBase: (v) => v * 0.2521644,
    fromBase: (v) => v / 0.2521644,
    preferredTargets: ['kwh', 'kj', 'kcal'],
  },

  // Power
  w: {
    id: 'w',
    shortLabel: 'W',
    fullLabel: 'Watts',
    dimension: 'power',
    toBase: (v) => v,
    fromBase: (v) => v,
    preferredTargets: ['kw', 'hp'],
  },
  kw: {
    id: 'kw',
    shortLabel: 'kW',
    fullLabel: 'Kilowatts',
    dimension: 'power',
    toBase: (v) => v * 1000,
    fromBase: (v) => v / 1000,
    preferredTargets: ['hp', 'w'],
  },
  hp: {
    id: 'hp',
    shortLabel: 'hp',
    fullLabel: 'Mechanical Horsepower',
    dimension: 'power',
    toBase: (v) => v * 745.699872,
    fromBase: (v) => v / 745.699872,
    preferredTargets: ['kw', 'w'],
  },
};

const EXACT_ALIAS_MAP: Record<string, string> = {
  // Currency
  '$': 'usd',
  'usd': 'usd',
  'us$': 'usd',
  '€': 'eur',
  'eur': 'eur',
  '£': 'gbp',
  'gbp': 'gbp',
  'cad': 'cad',
  'c$': 'cad',
  'aud': 'aud',
  'a$': 'aud',
  '¥': 'jpy',
  'jpy': 'jpy',
  'aed': 'aed',

  // Length
  'mm': 'mm',
  'millimeter': 'mm',
  'millimeters': 'mm',
  'cm': 'cm',
  'centimeter': 'cm',
  'centimeters': 'cm',
  'm': 'm',
  'meter': 'm',
  'meters': 'm',
  'metre': 'm',
  'metres': 'm',
  'km': 'km',
  'kilometer': 'km',
  'kilometers': 'km',
  'in': 'in',
  'inch': 'in',
  'inches': 'in',
  'ft': 'ft',
  'foot': 'ft',
  'feet': 'ft',
  'yd': 'yd',
  'yard': 'yd',
  'yards': 'yd',
  'mi': 'mi',
  'mile': 'mi',
  'miles': 'mi',

  // Weight
  'mg': 'mg',
  'milligram': 'mg',
  'milligrams': 'mg',
  'g': 'g',
  'gram': 'g',
  'grams': 'g',
  'kg': 'kg',
  'kilogram': 'kg',
  'kilograms': 'kg',
  'oz': 'oz',
  'ounce': 'oz',
  'ounces': 'oz',
  'lb': 'lb',
  'lbs': 'lb',
  'pound': 'lb',
  'pounds': 'lb',
  'st': 'st',
  'stone': 'st',
  'stones': 'st',
  'ozt': 'ozt',
  'troy oz': 'ozt',
  'troy ounce': 'ozt',
  'troy ounces': 'ozt',

  // Temperature
  '°c': 'c',
  'celsius': 'c',
  '°f': 'f',
  'fahrenheit': 'f',
  'kelvin': 'k',
  'k': 'k',

  // Volume
  'ml': 'ml',
  'milliliter': 'ml',
  'milliliters': 'ml',
  'l': 'l',
  'liter': 'l',
  'liters': 'l',
  'litre': 'l',
  'litres': 'l',
  'fl oz': 'floz',
  'fluid oz': 'floz',
  'fluid ounce': 'floz',
  'fluid ounces': 'floz',
  'cup': 'cup',
  'cups': 'cup',
  'us cup': 'cup',
  'gal': 'gal',
  'us gal': 'gal',
  'gallon': 'gal',
  'gallons': 'gal',
  'm³': 'm3',
  'm3': 'm3',
  'cubic meter': 'm3',
  'cubic meters': 'm3',
  'ft³': 'ft3',
  'ft3': 'ft3',
  'cu ft': 'ft3',
  'cubic foot': 'ft3',
  'cubic feet': 'ft3',

  // Area
  'm²': 'sqm',
  'sqm': 'sqm',
  'sq m': 'sqm',
  'square meter': 'sqm',
  'square meters': 'sqm',
  'ft²': 'sqft',
  'sqft': 'sqft',
  'sq ft': 'sqft',
  'square foot': 'sqft',
  'square feet': 'sqft',
  'acre': 'acre',
  'acres': 'acre',
  'ha': 'ha',
  'hectare': 'ha',
  'hectares': 'ha',

  // Speed
  'm/s': 'mps',
  'km/h': 'kph',
  'kph': 'kph',
  'mph': 'mph',
  'knot': 'knot',
  'knots': 'knot',
  'kn': 'knot',

  // Energy
  'kcal': 'kcal',
  'kcal/day': 'kcal',
  'calories': 'kcal',
  'calorie': 'kcal',
  'calories / day': 'kcal',
  'kj': 'kj',
  'kilojoule': 'kj',
  'kilojoules': 'kj',
  'wh': 'wh',
  'kwh': 'kwh',
  'btu': 'btu',

  // Power
  'w': 'w',
  'watt': 'w',
  'watts': 'w',
  'kw': 'kw',
  'kilowatt': 'kw',
  'kilowatts': 'kw',
  'hp': 'hp',
  'horsepower': 'hp',
};

function parseNumericValue(raw: string | number): number | null {
  if (typeof raw === 'number') {
    return Number.isFinite(raw) ? raw : null;
  }
  const str = String(raw || '').trim();
  if (!str) return null;

  // Reject compound multi-number strings like "12 ft 4 in" or fractions "3/4" or dates "2026-11-20"
  if (/^\d{4}-\d{2}-\d{2}/.test(str) || /\d\s*\/\s*\d/.test(str)) {
    return null;
  }

  const cleaned = str
    .replace(/[$€£¥,]/g, '')
    .replace(/\b(USD|EUR|GBP|CAD|AUD|JPY|AED)\b/gi, '')
    .replace(/\s*\/\s*(mo|month|yr|year|day|wk|week)\b/gi, '')
    .trim();

  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(cleaned)) {
    return null;
  }
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

function resolveUnitFromHint(
  rawUnit?: string,
  rawPrefix?: string,
  labelHint?: string,
  rawValue?: string | number
): { unitId: string; periodSuffix: string } | null {
  const candidates: string[] = [];

  if (rawPrefix && rawPrefix.trim()) {
    candidates.push(rawPrefix.trim());
  }

  if (rawUnit && rawUnit.trim()) {
    candidates.push(rawUnit.trim());
  }

  if (typeof rawValue === 'string') {
    const valStr = rawValue.trim();
    if (/^\$/.test(valStr)) candidates.push('$');
    else if (/^€/.test(valStr)) candidates.push('€');
    else if (/^£/.test(valStr)) candidates.push('£');
    else if (/^¥/.test(valStr)) candidates.push('¥');
  }

  if (labelHint) {
    const parenMatch = labelHint.match(/\(([^()]{1,20})\)\s*$/);
    if (parenMatch) {
      candidates.push(parenMatch[1].trim());
    }
  }

  for (const rawCandidate of candidates) {
    let normalized = rawCandidate.toLowerCase().trim();
    let periodSuffix = '';

    // Extract optional recurring period suffix for currency/energy/rate values
    const periodMatch = normalized.match(/^(.+?)\s*(\/\s*(?:mo|month|yr|year|day|wk|week))$/i);
    if (periodMatch) {
      normalized = periodMatch[1].trim();
      periodSuffix = periodMatch[2].replace(/\s+/g, '');
    }

    // Direct exact match
    if (EXACT_ALIAS_MAP[normalized]) {
      const unitId = EXACT_ALIAS_MAP[normalized];
      // Prevent matching lowercase 'c'/'f' unless explicit temperature degree or context
      if (unitId === 'k' && labelHint && !/temp|kelvin|heat|thermo|gas|boil|freeze/i.test(labelHint)) {
        continue;
      }
      return { unitId, periodSuffix };
    }

    // Check explicit currency phrase like "Monthly Principal & Interest ($/mo)" or "($)"
    const nestedParen = normalized.match(/\(([^()]{1,16})\)/);
    if (nestedParen) {
      const inner = nestedParen[1].trim();
      const innerPeriod = inner.match(/^(.+?)\s*(\/\s*(?:mo|month|yr|year|day|wk|week))$/i);
      const innerUnit = innerPeriod ? innerPeriod[1].trim() : inner;
      if (EXACT_ALIAS_MAP[innerUnit]) {
        return {
          unitId: EXACT_ALIAS_MAP[innerUnit],
          periodSuffix: innerPeriod ? innerPeriod[2].replace(/\s+/g, '') : periodSuffix,
        };
      }
    }
  }

  // Fallback: currency detected from explicit label keywords paired with currency prefix
  if (
    rawUnit &&
    /\b(usd|eur|gbp|cad|aud|jpy|aed)\b/i.test(rawUnit) &&
    !/\//.test(rawUnit.replace(/\/\s*(mo|month|yr|year|day|wk|week)/i, ''))
  ) {
    const curMatch = rawUnit.match(/\b(usd|eur|gbp|cad|aud|jpy|aed)\b/i);
    if (curMatch && EXACT_ALIAS_MAP[curMatch[1].toLowerCase()]) {
      const periodMatch = rawUnit.match(/\/\s*(mo|month|yr|year|day|wk|week)\b/i);
      return {
        unitId: EXACT_ALIAS_MAP[curMatch[1].toLowerCase()],
        periodSuffix: periodMatch ? periodMatch[0].replace(/\s+/g, '').toLowerCase() : '',
      };
    }
  }

  return null;
}

function formatConvertedNumber(val: number, dimension: UnitDimension, unitId: string): string {
  if (!Number.isFinite(val)) return '—';
  if (dimension === 'currency') {
    const maxFrac = unitId === 'jpy' ? 0 : Math.abs(val) >= 100 ? 2 : 2;
    return val.toLocaleString('en-US', {
      minimumFractionDigits: unitId === 'jpy' ? 0 : 2,
      maximumFractionDigits: maxFrac,
    });
  }
  const abs = Math.abs(val);
  if (abs > 0 && abs < 0.0001) return val.toExponential(3);
  if (abs >= 1_000_000) return val.toLocaleString('en-US', { maximumFractionDigits: 2 });
  if (abs >= 100) return val.toLocaleString('en-US', { maximumFractionDigits: 2 });
  if (abs >= 1) return val.toLocaleString('en-US', { maximumFractionDigits: 4 });
  return val.toLocaleString('en-US', { maximumFractionDigits: 5 });
}

export function detectUnitConversions(
  candidates: AutoDetectCandidate[],
  maxSuggestions = 5
): DetectedUnitSuggestion[] {
  const results: DetectedUnitSuggestion[] = [];
  const seenKeys = new Set<string>();

  // Sort outputs ahead of inputs so primary calculation results appear first
  const ordered = [
    ...candidates.filter((c) => c.source === 'output'),
    ...candidates.filter((c) => c.source === 'input'),
  ];

  for (const candidate of ordered) {
    if (results.length >= maxSuggestions) break;

    const numVal = parseNumericValue(candidate.value);
    if (numVal === null) continue;

    const resolved = resolveUnitFromHint(
      candidate.unit,
      candidate.prefix,
      candidate.label,
      candidate.value
    );
    if (!resolved) continue;

    const unitDef = UNIT_DEFS[resolved.unitId];
    if (!unitDef) continue;

    // Skip negative quantities for physical magnitudes other than temperature
    if (unitDef.dimension !== 'temperature' && numVal < 0) continue;
    if (unitDef.dimension !== 'temperature' && numVal === 0) continue;

    const baseVal = unitDef.toBase(numVal);
    if (unitDef.dimension === 'temperature' && baseVal < -273.15) continue;

    const dedupeKey = `${candidate.source}:${candidate.label.toLowerCase()}:${unitDef.id}:${numVal}`;
    if (seenKeys.has(dedupeKey)) continue;
    seenKeys.add(dedupeKey);

    const targets: ConvertedUnitTarget[] = unitDef.preferredTargets
      .map((targetId) => UNIT_DEFS[targetId])
      .filter((t): t is UnitDef => Boolean(t && t.id !== unitDef.id))
      .map((target) => {
        const converted = target.fromBase(baseVal);
        return {
          unitId: target.id,
          shortLabel: target.shortLabel,
          fullLabel: target.fullLabel,
          numericValue: converted,
          formattedValue: formatConvertedNumber(converted, target.dimension, target.id),
        };
      });

    if (targets.length === 0) continue;

    results.push({
      id: dedupeKey,
      source: candidate.source,
      sourceLabel: candidate.label,
      dimension: unitDef.dimension,
      dimensionLabel: DIMENSION_LABELS[unitDef.dimension],
      originalValueFormatted: formatConvertedNumber(numVal, unitDef.dimension, unitDef.id),
      originalUnitShort: unitDef.shortLabel,
      periodSuffix: resolved.periodSuffix,
      isApproximateFx: unitDef.dimension === 'currency',
      targets,
    });
  }

  return results;
}
