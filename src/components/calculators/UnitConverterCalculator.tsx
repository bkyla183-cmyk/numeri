import React, { useState } from 'react';
import { ArrowRightLeft, Copy, Check, RotateCcw } from 'lucide-react';
import { FormulaHoverHighlight } from './FormulaHoverHighlight';
import { useRoundingPrecision } from '../../context/RoundingPrecisionContext';
import { formatNumberWithPrecision } from '../../utils/roundingPrecision';

type UnitCategory = 'length' | 'weight' | 'temperature' | 'volume' | 'speed' | 'area';

interface UnitDefinition {
  label: string;
  shortLabel: string;
  toBase: (v: number) => number;
  fromBase: (v: number) => number;
}

const UNIT_DATA: Record<UnitCategory, Record<string, UnitDefinition>> = {
  length: {
    m: { label: 'Meter (m)', shortLabel: 'm', toBase: (v) => v, fromBase: (v) => v },
    km: { label: 'Kilometer (km)', shortLabel: 'km', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    cm: { label: 'Centimeter (cm)', shortLabel: 'cm', toBase: (v) => v / 100, fromBase: (v) => v * 100 },
    mm: { label: 'Millimeter (mm)', shortLabel: 'mm', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    in: { label: 'Inch (in)', shortLabel: 'in', toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
    ft: { label: 'Foot (ft)', shortLabel: 'ft', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
    yd: { label: 'Yard (yd)', shortLabel: 'yd', toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
    mi: { label: 'Mile (mi)', shortLabel: 'mi', toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
  },
  weight: {
    kg: { label: 'Kilogram (kg)', shortLabel: 'kg', toBase: (v) => v, fromBase: (v) => v },
    g: { label: 'Gram (g)', shortLabel: 'g', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    mg: { label: 'Milligram (mg)', shortLabel: 'mg', toBase: (v) => v / 1000000, fromBase: (v) => v * 1000000 },
    lb: { label: 'Pound (lb)', shortLabel: 'lb', toBase: (v) => v * 0.45359237, fromBase: (v) => v / 0.45359237 },
    oz: { label: 'Ounce (oz)', shortLabel: 'oz', toBase: (v) => v * 0.028349523125, fromBase: (v) => v / 0.028349523125 },
    st: { label: 'Stone (st)', shortLabel: 'st', toBase: (v) => v * 6.35029318, fromBase: (v) => v / 6.35029318 },
    ton_us: { label: 'US Short Ton (ton)', shortLabel: 'US ton', toBase: (v) => v * 907.18474, fromBase: (v) => v / 907.18474 },
    ton: { label: 'Metric Ton (t)', shortLabel: 't', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
  },
  temperature: {
    c: { label: 'Celsius (°C)', shortLabel: '°C', toBase: (v) => v, fromBase: (v) => v },
    f: { label: 'Fahrenheit (°F)', shortLabel: '°F', toBase: (v) => ((v - 32) * 5) / 9, fromBase: (v) => (v * 9) / 5 + 32 },
    k: { label: 'Kelvin (K)', shortLabel: 'K', toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
  },
  volume: {
    l: { label: 'Liter (L)', shortLabel: 'L', toBase: (v) => v, fromBase: (v) => v },
    ml: { label: 'Milliliter (mL)', shortLabel: 'mL', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    gal_us: { label: 'US Gallon (gal)', shortLabel: 'US gal', toBase: (v) => v * 3.785411784, fromBase: (v) => v / 3.785411784 },
    gal_uk: { label: 'UK Imperial Gallon (imp gal)', shortLabel: 'UK gal', toBase: (v) => v * 4.54609, fromBase: (v) => v / 4.54609 },
    qt_us: { label: 'US Quart (qt)', shortLabel: 'US qt', toBase: (v) => v * 0.946352946, fromBase: (v) => v / 0.946352946 },
    pt_us: { label: 'US Pint (pt)', shortLabel: 'US pt', toBase: (v) => v * 0.473176473, fromBase: (v) => v / 0.473176473 },
    pt_uk: { label: 'UK Imperial Pint (imp pt)', shortLabel: 'UK pt', toBase: (v) => v * 0.56826125, fromBase: (v) => v / 0.56826125 },
    cup_us: { label: 'US Cup', shortLabel: 'US cup', toBase: (v) => v * 0.2365882365, fromBase: (v) => v / 0.2365882365 },
    floz_us: { label: 'Fluid Ounce (fl oz)', shortLabel: 'fl oz', toBase: (v) => v * 0.0295735296, fromBase: (v) => v / 0.0295735296 },
  },
  speed: {
    mps: { label: 'Meters/second (m/s)', shortLabel: 'm/s', toBase: (v) => v, fromBase: (v) => v },
    kph: { label: 'Kilometers/hour (km/h)', shortLabel: 'km/h', toBase: (v) => v / 3.6, fromBase: (v) => v * 3.6 },
    mph: { label: 'Miles/hour (mph)', shortLabel: 'mph', toBase: (v) => v * 0.44704, fromBase: (v) => v / 0.44704 },
    knot: { label: 'Knots (kn)', shortLabel: 'kn', toBase: (v) => v * 0.514444, fromBase: (v) => v / 0.514444 },
  },
  area: {
    sqm: { label: 'Square Meter (m²)', shortLabel: 'm²', toBase: (v) => v, fromBase: (v) => v },
    sqkm: { label: 'Square Kilometer (km²)', shortLabel: 'km²', toBase: (v) => v * 1000000, fromBase: (v) => v / 1000000 },
    sqft: { label: 'Square Foot (ft²)', shortLabel: 'ft²', toBase: (v) => v * 0.09290304, fromBase: (v) => v / 0.09290304 },
    acre: { label: 'Acre', shortLabel: 'acres', toBase: (v) => v * 4046.8564224, fromBase: (v) => v / 4046.8564224 },
    ha: { label: 'Hectare (ha)', shortLabel: 'ha', toBase: (v) => v * 10000, fromBase: (v) => v / 10000 },
  },
};

export const UnitConverterCalculator: React.FC = () => {
  const [category, setCategory] = useState<UnitCategory>('length');
  const [fromUnit, setFromUnit] = useState<string>('m');
  const [toUnit, setToUnit] = useState<string>('ft');
  const [amount, setAmount] = useState<string>('10');
  const [copied, setCopied] = useState<boolean>(false);
  const { precision } = useRoundingPrecision();

  const units = UNIT_DATA[category];

  const handleCategoryChange = (newCat: UnitCategory) => {
    setCategory(newCat);
    const keys = Object.keys(UNIT_DATA[newCat]);
    setFromUnit(keys[0]);
    setToUnit(keys[1] || keys[0]);
  };

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const handleReset = () => {
    setCategory('length');
    setFromUnit('m');
    setToUnit('ft');
    setAmount('10');
  };

  const result = (() => {
    const val = parseFloat(amount);
    if (!Number.isFinite(val)) return { ok: false as const, error: 'Enter a valid numeric value.' };

    const fromDef = units[fromUnit];
    const toDef = units[toUnit];
    if (!fromDef || !toDef) return null;

    if (category !== 'temperature' && val < 0) {
      return { ok: false as const, error: `Negative values are not valid for ${category} measurements.` };
    }

    const baseVal = fromDef.toBase(val);
    if (category === 'temperature' && baseVal < -273.15) {
      return { ok: false as const, error: 'Temperature cannot be below absolute zero (-273.15 °C / 0 K).' };
    }

    const convertedVal = toDef.fromBase(baseVal);
    if (!Number.isFinite(convertedVal)) {
      return { ok: false as const, error: 'Converted value exceeds representable numeric range.' };
    }

    const formatted =
      precision === 'auto'
        ? Math.abs(convertedVal) >= 10000 || (Math.abs(convertedVal) > 0 && Math.abs(convertedVal) < 0.001)
          ? convertedVal.toExponential(4)
          : parseFloat(convertedVal.toFixed(6)).toString()
        : formatNumberWithPrecision(convertedVal, precision, { useGrouping: true });

    const linearFactor = category !== 'temperature' ? toDef.fromBase(fromDef.toBase(1)) : 1;
    const linearFactorFormatted =
      Math.abs(linearFactor) >= 10000 || (Math.abs(linearFactor) > 0 && Math.abs(linearFactor) < 0.001)
        ? linearFactor.toExponential(4)
        : parseFloat(linearFactor.toFixed(6)).toString();

    const tempFormulaMap: Record<string, string> = {
      'c->f': 'T_out = T_in × 9/5 + 32',
      'f->c': 'T_out = (T_in − 32) × 5/9',
      'c->k': 'T_out = T_in + 273.15',
      'k->c': 'T_out = T_in − 273.15',
      'f->k': 'T_out = (T_in − 32) × 5/9 + 273.15',
      'k->f': 'T_out = (T_in − 273.15) × 9/5 + 32',
    };

    const formulaText =
      category === 'temperature'
        ? fromUnit === toUnit
          ? 'T_out = T_in'
          : tempFormulaMap[`${fromUnit}->${toUnit}`] ?? 'T_out = T_in'
        : 'V_out = V_in × k';

    return {
      ok: true as const,
      convertedVal,
      formatted,
      linearFactorFormatted,
      formulaText,
      fromLabel: fromDef.label,
      toLabel: toDef.label,
      fromShort: fromDef.shortLabel,
      toShort: toDef.shortLabel,
    };
  })();

  const calc = result && result.ok ? result : null;
  const errorMsg = result && !result.ok ? result.error : null;

  const handleCopy = () => {
    if (!calc) return;
    navigator.clipboard?.writeText(`${amount} ${calc.fromShort} = ${calc.formatted} ${calc.toShort}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl" role="group" aria-label="Unit category">
          {(Object.keys(UNIT_DATA) as UnitCategory[]).map((cat) => (
            <button
              key={cat}
              type="button"
              aria-pressed={category === cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors cursor-pointer ${
                category === cat
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
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

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center">
          <div className="sm:col-span-2 space-y-2">
            <label htmlFor="uc-amount" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              From
            </label>
            <input
              id="uc-amount"
              type="number"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              placeholder="Amount"
            />
            <select
              aria-label="Source unit"
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 cursor-pointer"
            >
              {Object.entries(units).map(([key, def]) => (
                <option key={key} value={key}>
                  {def.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-1 flex justify-center py-2">
            <button
              type="button"
              onClick={swapUnits}
              aria-label="Swap units"
              className="p-3 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Swap units"
            >
              <ArrowRightLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </button>
          </div>

          <div className="sm:col-span-2 space-y-2">
            <label htmlFor="uc-to-unit" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              To
            </label>
            <div className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 font-mono font-bold text-base truncate">
              {calc ? calc.formatted : '—'}
            </div>
            <select
              id="uc-to-unit"
              aria-label="Target unit"
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 cursor-pointer"
            >
              {Object.entries(units).map(([key, def]) => (
                <option key={key} value={key}>
                  {def.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {errorMsg && (
          <div role="alert" className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-sm font-medium text-rose-700 dark:text-rose-300">
            {errorMsg}
          </div>
        )}

        {calc && (
          <FormulaHoverHighlight
            accent="indigo"
            formulaLabel={
              category === 'temperature'
                ? `Affine Temperature Conversion (${calc.fromShort} → ${calc.toShort})`
                : `Linear Scale Factor (${calc.fromShort} → ${calc.toShort})`
            }
            formula={calc.formulaText}
            variables={
              category === 'temperature'
                ? [{ symbol: 'T_in', name: `Input (${calc.fromLabel})`, value: amount, unit: calc.fromShort }]
                : [
                    { symbol: 'V_in', name: `Input (${calc.fromLabel})`, value: amount, unit: calc.fromShort },
                    {
                      symbol: 'k',
                      name: `Exact conversion factor (1 ${calc.fromShort} in ${calc.toShort})`,
                      value: calc.linearFactorFormatted,
                      unit: `${calc.toShort}/${calc.fromShort}`,
                    },
                  ]
            }
            activeStep={`${amount} ${calc.fromShort} = ${calc.formatted} ${calc.toShort}`}
          >
            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                  Conversion Result
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono tabular-nums">
                  {amount} {calc.fromShort} = {calc.formatted} {calc.toShort}
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 cursor-pointer self-start sm:self-center"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </FormulaHoverHighlight>
        )}
      </div>
    </div>
  );
};
