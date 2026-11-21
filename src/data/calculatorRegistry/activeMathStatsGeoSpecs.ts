import { CalculatorSpec } from './types';
import { parseNum, calcError } from './validation';
import {
  normalCdf,
  normalTwoTailedPValue,
  normalCriticalValue,
  studentTCriticalValue,
  calculateDescriptiveStats,
  calculateFractionOp,
} from '../../utils/calculatorFormulas';

function factorial(n: number): number {
  if (n <= 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

export const activeMathStatsGeoSpecs: CalculatorSpec[] = [
  {
    slug: 'scientific-calculator',
    title: 'Scientific Calculator',
    category: 'math',
    formulaDisplay: 'sin(x), cos(x), tan(x), sinh(x), exp(x), log₁₀(x), ln(x), x^y, √x',
    inputs: [
      { id: 'x', label: 'Primary Value (x)', defaultValue: 45, type: 'number', step: 'any' },
      { id: 'y', label: 'Exponent / Power (y)', defaultValue: 2, type: 'number', step: 'any' },
      {
        id: 'angleMode',
        label: 'Trigonometric Angle Mode',
        type: 'select',
        defaultValue: 'deg',
        advanced: true,
        options: [
          { label: 'Degrees (DEG)', value: 'deg' },
          { label: 'Radians (RAD)', value: 'rad' },
        ],
      },
    ],
    calculate: (v) => {
      const x = parseNum(v.x);
      const y = parseNum(v.y);
      if (isNaN(x) || isNaN(y)) return calcError('Please enter valid numbers for x and y.');
      const mode = v.angleMode === 'rad' ? 'rad' : 'deg';
      const rad = mode === 'deg' ? (x * Math.PI) / 180 : x;
      const pow = Math.pow(x, y);
      if (Number.isNaN(pow)) {
        return calcError('Power evaluation (x^y) has no real-number solution for this base and exponent.');
      }
      if (!Number.isFinite(pow)) {
        return calcError('Power evaluation (x^y) exceeds finite IEEE 754 limits (~1.8e308).');
      }
      const cosVal = Math.cos(rad);
      const tanStr = Math.abs(cosVal) < 1e-12 ? 'Undefined (asymptote)' : Math.tan(rad).toFixed(6);
      const sinhVal = Math.sinh(x);
      const coshVal = Math.cosh(x);
      const expVal = Math.exp(x);

      return {
        primaryValue: parseFloat(pow.toFixed(6)),
        primaryLabel: 'Power Evaluation (x^y)',
        secondaryOutputs: [
          { label: `sin(x) [${mode.toUpperCase()}]`, value: Math.sin(rad).toFixed(6) },
          { label: `cos(x) [${mode.toUpperCase()}]`, value: cosVal.toFixed(6) },
          { label: `tan(x) [${mode.toUpperCase()}]`, value: tanStr },
          { label: 'sinh(x) / cosh(x)', value: Number.isFinite(sinhVal) && Number.isFinite(coshVal) ? `${sinhVal.toFixed(4)} / ${coshVal.toFixed(4)}` : 'Overflow (> 1e308)' },
          { label: 'Exponential (e^x)', value: Number.isFinite(expVal) ? (expVal > 1e8 ? expVal.toExponential(4) : expVal.toFixed(6)) : 'Overflow (> 1e308)' },
          { label: 'Square Root (√x)', value: x >= 0 ? Math.sqrt(x).toFixed(6) : 'Undefined (x < 0)' },
          { label: 'Common Log (log₁₀ x)', value: x > 0 ? Math.log10(x).toFixed(6) : 'Undefined (x ≤ 0)' },
          { label: 'Natural Log (ln x)', value: x > 0 ? Math.log(x).toFixed(6) : 'Undefined (x ≤ 0)' },
        ],
        steps: [
          `Power: ${x}^${y} = ${pow.toFixed(6)}`,
          mode === 'deg'
            ? `Degrees to Radians: ${x}° × π/180 = ${rad.toFixed(6)} rad`
            : `Angle evaluated directly in Radians: ${x} rad`,
        ],
        formulaUsed: 'Scientific Algebraic, Hyperbolic & Trigonometric Functions',
      };
    },
  },
  {
    slug: 'percentage-calculator',
    title: 'Percentage Calculator',
    category: 'math',
    formulaDisplay: '(Part ÷ Whole) × 100 | (P% × Base) | % Change',
    inputs: [
      {
        id: 'mode',
        label: 'Calculation Mode',
        type: 'select',
        defaultValue: 'is_what_pct',
        options: [
          { label: 'X is what % of Y?', value: 'is_what_pct' },
          { label: 'What is P% of Base?', value: 'pct_of' },
          { label: 'Percentage Change (Initial → Final)', value: 'pct_change' },
        ],
      },
      {
        id: 'part',
        label: 'Part (Value)',
        defaultValue: 25,
        type: 'number',
        step: 'any',
        visibleWhen: (v) => !v.mode || v.mode === 'is_what_pct' || v.mode === 'invalid_option',
      },
      {
        id: 'whole',
        label: 'Whole (Total)',
        defaultValue: 200,
        type: 'number',
        step: 'any',
        visibleWhen: (v) => !v.mode || v.mode === 'is_what_pct' || v.mode === 'invalid_option',
      },
      {
        id: 'percent',
        label: 'Percentage (%)',
        defaultValue: 15,
        type: 'number',
        step: 'any',
        unit: '%',
        visibleWhen: (v) => v.mode === 'pct_of',
      },
      {
        id: 'base',
        label: 'Base Value',
        defaultValue: 200,
        type: 'number',
        step: 'any',
        visibleWhen: (v) => v.mode === 'pct_of',
      },
      {
        id: 'initialVal',
        label: 'Initial Value',
        defaultValue: 100,
        type: 'number',
        step: 'any',
        visibleWhen: (v) => v.mode === 'pct_change',
      },
      {
        id: 'finalVal',
        label: 'Final Value',
        defaultValue: 125,
        type: 'number',
        step: 'any',
        visibleWhen: (v) => v.mode === 'pct_change',
      },
    ],
    calculate: (vals) => {
      const mode = vals.mode === 'pct_of' || vals.mode === 'pct_change' ? vals.mode : 'is_what_pct';

      if (mode === 'pct_of') {
        const p = parseNum(vals.percent);
        const base = parseNum(vals.base);
        if (isNaN(p) || isNaN(base)) return calcError('Please enter valid numbers for percentage and base value.');
        const res = (p / 100) * base;
        return {
          primaryValue: Number.isInteger(res) ? res : parseFloat(res.toFixed(4)),
          primaryLabel: `${p}% of ${base}`,
          secondaryOutputs: [
            { label: 'Base + Percentage', value: parseFloat((base + res).toFixed(4)) },
            { label: 'Base - Percentage', value: parseFloat((base - res).toFixed(4)) },
            { label: 'Decimal Multiplier', value: (p / 100).toFixed(4) },
          ],
          steps: [`(${p} ÷ 100) × ${base} = ${res.toFixed(4)}`],
          formulaUsed: 'Result = (P / 100) × Base',
        };
      }

      if (mode === 'pct_change') {
        const init = parseNum(vals.initialVal);
        const fin = parseNum(vals.finalVal);
        if (isNaN(init) || isNaN(fin)) return calcError('Please enter valid initial and final values.');
        if (init === 0) return calcError('Initial value cannot be zero for percentage change.', 'Undefined');
        const diff = fin - init;
        const pctChange = (diff / Math.abs(init)) * 100;
        return {
          primaryValue: parseFloat(pctChange.toFixed(4)),
          primaryUnit: '%',
          primaryLabel: pctChange >= 0 ? 'Percentage Increase' : 'Percentage Decrease',
          secondaryOutputs: [
            { label: 'Absolute Difference', value: parseFloat(diff.toFixed(4)) },
            { label: 'Multiplier Factor', value: `${(fin / init).toFixed(4)}×` },
          ],
          steps: [`Change = (${fin} - ${init}) ÷ |${init}| × 100 = ${pctChange.toFixed(4)}%`],
          formulaUsed: '% Change = [(Final - Initial) / |Initial|] × 100',
        };
      }

      const part = parseNum(vals.part);
      const whole = parseNum(vals.whole);
      if (isNaN(part) || isNaN(whole)) return calcError('Please enter valid numbers for part and whole.');
      if (whole === 0) return calcError('Whole (denominator) cannot be zero.', 'Undefined');
      const pct = (part / whole) * 100;
      return {
        primaryValue: Number.isInteger(pct) ? pct : parseFloat(pct.toFixed(4)),
        primaryUnit: '%',
        primaryLabel: 'Percentage',
        secondaryOutputs: [
          { label: 'Decimal Equivalent', value: (part / whole).toFixed(4) },
          { label: 'Ratio', value: `${part} : ${whole}` },
          { label: 'Remaining Percentage', value: `${(100 - pct).toFixed(2)}%` },
        ],
        steps: [
          `Formula: (${part} ÷ ${whole}) × 100`,
          `Division: ${part / whole}`,
          `Multiply by 100: ${pct.toFixed(4)}%`,
        ],
        formulaUsed: 'P = (Part / Whole) × 100',
      };
    },
  },
  {
    slug: 'fraction-calculator',
    title: 'Fraction Calculator',
    category: 'math',
    formulaDisplay: 'a/b ± c/d = (ad ± bc)/bd (with Mixed Numbers)',
    inputs: [
      { id: 'whole1', label: 'Mixed Whole 1 (Optional)', defaultValue: 0, type: 'number', step: 1, advanced: true, helpText: 'Leave 0 for simple fractions' },
      { id: 'num1', label: 'Numerator 1 (a)', defaultValue: 1, type: 'number', step: 1 },
      { id: 'den1', label: 'Denominator 1 (b)', defaultValue: 2, type: 'number', step: 1 },
      {
        id: 'op',
        label: 'Operation',
        type: 'select',
        defaultValue: '+',
        options: [
          { label: 'Add (+)', value: '+' },
          { label: 'Subtract (-)', value: '-' },
          { label: 'Multiply (×)', value: '*' },
          { label: 'Divide (÷)', value: '/' },
        ],
      },
      { id: 'whole2', label: 'Mixed Whole 2 (Optional)', defaultValue: 0, type: 'number', step: 1, advanced: true, helpText: 'Leave 0 for simple fractions' },
      { id: 'num2', label: 'Numerator 2 (c)', defaultValue: 1, type: 'number', step: 1 },
      { id: 'den2', label: 'Denominator 2 (d)', defaultValue: 3, type: 'number', step: 1 },
    ],
    calculate: (vals) => {
      const w1Raw = vals.whole1 === undefined ? 0 : parseNum(vals.whole1);
      const n1Raw = parseNum(vals.num1);
      const d1Raw = parseNum(vals.den1);
      const w2Raw = vals.whole2 === undefined ? 0 : parseNum(vals.whole2);
      const n2Raw = parseNum(vals.num2);
      const d2Raw = parseNum(vals.den2);
      if ([w1Raw, n1Raw, d1Raw, w2Raw, n2Raw, d2Raw].some(isNaN)) {
        return calcError('Please enter valid integers for mixed wholes, numerators, and denominators.');
      }
      const op = vals.op === '-' || vals.op === '*' || vals.op === '/' ? vals.op : '+';
      const out = calculateFractionOp({
        whole1: Math.round(w1Raw),
        num1: Math.round(n1Raw),
        den1: Math.round(d1Raw),
        whole2: Math.round(w2Raw),
        num2: Math.round(n2Raw),
        den2: Math.round(d2Raw),
        op,
      });
      if ('error' in out) return calcError(out.error, 'Undefined');

      const simpStr = out.num === 0 ? '0' : out.den === 1 ? `${out.num}` : `${out.num}/${out.den}`;
      return {
        primaryValue: simpStr,
        primaryLabel: 'Simplified Fraction',
        secondaryOutputs: [
          { label: 'Decimal Value', value: out.decimal.toFixed(6) },
          { label: 'Mixed Number', value: out.mixedStr },
          { label: 'Reciprocal', value: out.reciprocalStr },
          { label: 'Unsimplified Fraction', value: `${out.rawNum}/${out.rawDen}` },
        ],
        steps: [
          `Unsimplified common fraction: ${out.rawNum}/${out.rawDen}`,
          `Reduced simplified fraction: ${simpStr}`,
          `Mixed number form: ${out.mixedStr} | Decimal: ${out.decimal.toFixed(6)}`,
        ],
        formulaUsed: 'Fraction & Mixed Number Arithmetic with Euclidean Simplification',
      };
    },
  },
  {
    slug: 'exponent-calculator',
    title: 'Exponent Calculator',
    category: 'math',
    formulaDisplay: 'x^y',
    inputs: [
      { id: 'base', label: 'Base (x)', defaultValue: 2, type: 'number', step: 'any' },
      { id: 'exp', label: 'Exponent (y)', defaultValue: 10, type: 'number', step: 'any' },
    ],
    calculate: (vals) => {
      const base = parseNum(vals.base);
      const exp = parseNum(vals.exp);
      if (isNaN(base) || isNaN(exp)) return calcError('Please enter valid numbers for base and exponent.');
      if (base === 0 && exp < 0) return calcError('Zero raised to a negative exponent is undefined (division by zero).');
      const res = Math.pow(base, exp);
      if (Number.isNaN(res)) {
        return calcError('Negative base raised to a non-integer exponent has no real-number solution.');
      }
      if (!Number.isFinite(res)) {
        return calcError('Result exceeds IEEE 754 finite double-precision range (~1.8e308). Reduce base or exponent.');
      }

      let rootLabel = 'Undefined (y = 0)';
      if (exp !== 0) {
        if (base >= 0) {
          const rootVal = Math.pow(base, 1 / exp);
          rootLabel = Number.isFinite(rootVal) ? rootVal.toFixed(6) : 'Overflow (> 1e308)';
        } else if (Number.isInteger(exp) && Math.abs(exp) % 2 === 1) {
          const rootVal = -Math.pow(Math.abs(base), 1 / exp);
          rootLabel = Number.isFinite(rootVal) ? rootVal.toFixed(6) : 'Overflow (> 1e308)';
        } else {
          rootLabel = 'Complex (Even root of negative)';
        }
      }

      return {
        primaryValue:
          Math.abs(res) > 1e12 || (Math.abs(res) < 1e-4 && res !== 0)
            ? res.toExponential(6)
            : Number.isInteger(res)
            ? res
            : parseFloat(res.toFixed(6)),
        primaryLabel: `${base}^${exp}`,
        secondaryOutputs: [
          { label: 'Scientific Notation', value: res.toExponential(4) },
          { label: 'Reciprocal (1/res)', value: res !== 0 ? (1 / res).toExponential(4) : 'Undefined' },
          { label: `y-th Root of x (x^(1/y))`, value: rootLabel },
        ],
        steps: [`${base} raised to the power of ${exp} = ${res}`],
        formulaUsed: 'x^y & Inverse Root Verification',
      };
    },
  },
  {
    slug: 'logarithm-calculator',
    title: 'Logarithm Calculator',
    category: 'math',
    formulaDisplay: 'log_b(x) = ln(x) ÷ ln(b)',
    inputs: [
      { id: 'x', label: 'Argument (x)', defaultValue: 100, type: 'number', min: 0.000001, step: 'any' },
      { id: 'base', label: 'Base (b)', defaultValue: 10, type: 'number', min: 0.000001, step: 'any' },
    ],
    calculate: (vals) => {
      const x = parseNum(vals.x);
      const b = parseNum(vals.base);
      if (isNaN(x) || isNaN(b)) return calcError('Please enter valid numbers for argument (x) and base (b).');
      if (x <= 0 || b <= 0 || b === 1) {
        return calcError('Logarithm requires x > 0, base > 0, and base ≠ 1.', 'Undefined');
      }
      const res = Math.log(x) / Math.log(b);
      const antilog = Math.pow(b, res);
      return {
        primaryValue: Number.isInteger(res) ? res : parseFloat(res.toFixed(6)),
        primaryLabel: `log_${b}(${x})`,
        secondaryOutputs: [
          { label: 'Natural Log ln(x)', value: Math.log(x).toFixed(6) },
          { label: 'Common Log log₁₀(x)', value: Math.log10(x).toFixed(6) },
          { label: 'Binary Log log₂(x)', value: Math.log2(x).toFixed(6) },
          { label: `Antilog Check (b^res)`, value: Number.isFinite(antilog) ? antilog.toFixed(4) : 'Overflow' },
        ],
        steps: [`ln(${x}) = ${Math.log(x).toFixed(6)}`, `ln(${b}) = ${Math.log(b).toFixed(6)}`, `log_${b}(${x}) = ${res.toFixed(6)}`],
        formulaUsed: 'log_b(x) = ln(x) / ln(b)',
      };
    },
  },
  {
    slug: 'quadratic-formula-calculator',
    title: 'Quadratic Formula Calculator',
    category: 'math',
    formulaDisplay: 'x = (-b ± √(b² - 4ac)) / (2a)',
    inputs: [
      { id: 'a', label: 'Coefficient a', defaultValue: 1, type: 'number', step: 'any' },
      { id: 'b', label: 'Coefficient b', defaultValue: -5, type: 'number', step: 'any' },
      { id: 'c', label: 'Coefficient c', defaultValue: 6, type: 'number', step: 'any' },
    ],
    calculate: (v) => {
      const a = parseNum(v.a);
      const b = parseNum(v.b);
      const c = parseNum(v.c);
      if (isNaN(a) || isNaN(b) || isNaN(c)) return calcError('Please enter valid coefficients a, b, and c.');
      if (a === 0) return calcError('Coefficient a cannot be 0 for a quadratic equation (equation is linear).', 'a cannot be 0');
      const disc = b * b - 4 * a * c;
      const axis = -b / (2 * a);
      const vertexY = c - (b * b) / (4 * a);
      const commonSec = [
        { label: 'Discriminant (Δ)', value: parseFloat(disc.toFixed(4)) },
        { label: 'Vertex (h, k)', value: `(${axis.toFixed(2)}, ${vertexY.toFixed(2)})` },
        { label: 'Axis of Symmetry', value: `x = ${axis.toFixed(2)}` },
        { label: 'Y-Intercept', value: `(0, ${c})` },
      ];

      if (disc > 0) {
        const x1 = (-b + Math.sqrt(disc)) / (2 * a);
        const x2 = (-b - Math.sqrt(disc)) / (2 * a);
        return {
          primaryValue: `x₁ = ${parseFloat(x1.toFixed(6))}, x₂ = ${parseFloat(x2.toFixed(6))}`,
          primaryLabel: 'Two Real Roots',
          secondaryOutputs: commonSec,
          steps: [`Discriminant Δ = ${b}² - 4(${a})(${c}) = ${disc} > 0`, `x₁ = ${x1.toFixed(6)}`, `x₂ = ${x2.toFixed(6)}`],
          formulaUsed: 'Quadratic Formula',
        };
      } else if (disc === 0) {
        const x = axis;
        return {
          primaryValue: `x = ${parseFloat(x.toFixed(6))}`,
          primaryLabel: 'One Repeated Real Root',
          secondaryOutputs: commonSec,
          steps: [`Δ = 0 → x = -${b} / ${2 * a} = ${x}`],
          formulaUsed: 'x = -b / 2a',
        };
      } else {
        const real = axis.toFixed(4);
        const imag = (Math.sqrt(-disc) / Math.abs(2 * a)).toFixed(4);
        return {
          primaryValue: `${real} ± ${imag}i`,
          primaryLabel: 'Two Complex Roots',
          secondaryOutputs: commonSec,
          steps: [`Δ = ${disc} < 0 → Complex conjugate roots`],
          formulaUsed: 'x = (-b ± i√|Δ|) / 2a',
        };
      }
    },
  },
  {
    slug: 'discount-calculator',
    title: 'Discount & Sale Price Calculator',
    description: 'Calculate final discounted price, stacked second markdowns, optional sales tax, and total money saved.',
    category: 'math',
    inputs: [
      { id: 'original_price', label: 'Original Price ($)', type: 'number', defaultValue: 89.99, min: 0, max: 10000000, step: 0.01, unit: '$' },
      { id: 'discount_pct', label: 'Discount Percentage (%)', type: 'number', defaultValue: 25, min: 0, max: 100, step: 0.5, unit: '%' },
      { id: 'second_discount_pct', label: 'Extra Stacked Discount (%)', type: 'number', defaultValue: 0, min: 0, max: 100, step: 0.5, unit: '%', advanced: true, helpText: 'Applied sequentially to already-discounted price' },
      { id: 'sales_tax_pct', label: 'Sales Tax Rate (%)', type: 'number', defaultValue: 0, min: 0, max: 50, step: 0.25, unit: '%', advanced: true },
    ],
    calculate: (inputs) => {
      const orig = parseNum(inputs.original_price);
      const discPct = parseNum(inputs.discount_pct);
      const secDiscPct = inputs.second_discount_pct === undefined ? 0 : parseNum(inputs.second_discount_pct);
      const taxPct = inputs.sales_tax_pct === undefined ? 0 : parseNum(inputs.sales_tax_pct);
      if ([orig, discPct, secDiscPct, taxPct].some(isNaN)) {
        return calcError('Please enter valid numbers for price, discount, and tax rates.');
      }
      if (orig < 0) return calcError('Original price cannot be negative.');
      if (discPct < 0 || discPct > 100 || secDiscPct < 0 || secDiscPct > 100) {
        return calcError('Discount percentages must be between 0% and 100%.');
      }
      if (taxPct < 0 || taxPct > 50) return calcError('Sales tax rate must be between 0% and 50%.');

      const afterFirst = orig * (1 - discPct / 100);
      const discountedPreTax = Math.max(0, afterFirst * (1 - secDiscPct / 100));
      const totalSaved = orig - discountedPreTax;
      const taxAmt = discountedPreTax * (taxPct / 100);
      const finalOutOfPocket = discountedPreTax + taxAmt;
      const effectivePct = orig > 0 ? (totalSaved / orig) * 100 : 0;

      return {
        primaryOutput: parseFloat(finalOutOfPocket.toFixed(2)),
        primaryUnit: taxPct > 0 ? '$ Final (After Tax)' : '$ Final Sale Price',
        secondaryOutputs: [
          { label: 'Total Money Saved', value: parseFloat(totalSaved.toFixed(2)), unit: '$' },
          { label: 'Sale Price (Pre-Tax)', value: parseFloat(discountedPreTax.toFixed(2)), unit: '$' },
          { label: 'Sales Tax Added', value: parseFloat(taxAmt.toFixed(2)), unit: '$' },
          { label: 'Combined Effective Discount', value: parseFloat(effectivePct.toFixed(2)), unit: '%' },
        ],
        steps: [
          `After First Discount (${discPct}%): $${afterFirst.toFixed(2)}`,
          secDiscPct > 0
            ? `After Extra ${secDiscPct}% Stacked Discount: $${discountedPreTax.toFixed(2)} (Saved $${totalSaved.toFixed(2)})`
            : `Pre-Tax Savings = $${totalSaved.toFixed(2)}`,
          taxPct > 0 ? `Plus ${taxPct}% Tax ($${taxAmt.toFixed(2)}) = $${finalOutOfPocket.toFixed(2)}` : `Final Sale Price = $${finalOutOfPocket.toFixed(2)}`,
        ],
      };
    },
  },
  {
    slug: 'tip-calculator',
    title: 'Tip & Bill Split Calculator',
    description: 'Calculate restaurant tip on pre-tax subtotal, optional tax add-on, and per-person bill split.',
    inputs: [
      { id: 'bill_amount', label: 'Pre-Tax Subtotal Bill ($)', type: 'number', defaultValue: 95, min: 0, max: 1000000, step: 1, unit: '$' },
      { id: 'tip_pct', label: 'Tip Percentage (%)', type: 'number', defaultValue: 20, min: 0, max: 200, step: 1, unit: '%' },
      { id: 'num_guests', label: 'Number of People Splitting', type: 'number', defaultValue: 3, min: 1, max: 500, step: 1 },
      { id: 'tax_amount', label: 'Sales Tax Amount ($)', type: 'number', defaultValue: 0, min: 0, max: 100000, step: 0.5, unit: '$', advanced: true, helpText: 'Added to total without tipping on top of tax' },
      {
        id: 'roundMode',
        label: 'Per-Person Rounding',
        type: 'select',
        defaultValue: 'exact',
        advanced: true,
        options: [
          { label: 'Exact Split (Cents)', value: 'exact' },
          { label: 'Round Up to Next Whole Dollar', value: 'round_up_dollar' },
        ],
      },
    ],
    calculate: (inputs) => {
      const bill = parseNum(inputs.bill_amount);
      const tipPct = parseNum(inputs.tip_pct);
      const guests = parseNum(inputs.num_guests);
      const taxAmt = inputs.tax_amount === undefined ? 0 : parseNum(inputs.tax_amount);
      if ([bill, tipPct, guests, taxAmt].some(isNaN)) return calcError('Please enter valid numeric values.');
      if (bill < 0 || tipPct < 0 || taxAmt < 0) return calcError('Bill amount, tip percentage, and tax cannot be negative.');
      if (guests < 1) return calcError('Number of people splitting must be at least 1.');

      const tipTotal = bill * (tipPct / 100);
      const grandTotal = bill + taxAmt + tipTotal;
      const exactPerPerson = grandTotal / guests;
      const roundMode = inputs.roundMode === 'round_up_dollar' ? 'round_up_dollar' : 'exact';
      const perPerson = roundMode === 'round_up_dollar' ? Math.ceil(exactPerPerson) : exactPerPerson;
      const tipPerPerson = tipTotal / guests;

      return {
        primaryOutput: parseFloat(perPerson.toFixed(2)),
        primaryUnit: '$/Person',
        secondaryOutputs: [
          { label: 'Total Bill with Tax & Tip', value: parseFloat((perPerson * guests).toFixed(2)), unit: '$' },
          { label: 'Total Tip Added (Pre-Tax)', value: parseFloat(tipTotal.toFixed(2)), unit: '$' },
          { label: 'Tip Share per Person', value: parseFloat(tipPerPerson.toFixed(2)), unit: '$' },
        ],
        steps: [
          `Tip Amount = $${bill} × ${tipPct}% = $${tipTotal.toFixed(2)}`,
          `Grand Total = $${bill} + $${taxAmt.toFixed(2)} tax + $${tipTotal.toFixed(2)} tip = $${grandTotal.toFixed(2)}`,
          `Per Person (${guests} ways) = $${exactPerPerson.toFixed(2)}${roundMode === 'round_up_dollar' ? ` → Rounded up to $${perPerson.toFixed(2)}` : ''}`,
        ],
      };
    },
  },
  {
    slug: 'linear-equation-calculator',
    title: 'Linear Equation Calculator',
    category: 'math',
    formulaDisplay: 'ax + b = c → x = (c - b) / a',
    inputs: [
      { id: 'a', label: 'Coefficient a', defaultValue: 3, type: 'number', step: 'any' },
      { id: 'b', label: 'Constant b', defaultValue: 5, type: 'number', step: 'any' },
      { id: 'c', label: 'Right Hand Side c', defaultValue: 20, type: 'number', step: 'any' },
    ],
    calculate: (v) => {
      const a = parseNum(v.a);
      const b = parseNum(v.b);
      const c = parseNum(v.c);
      if (isNaN(a) || isNaN(b) || isNaN(c)) return calcError('Please enter valid numeric coefficients.');
      if (a === 0) {
        if (Math.abs(b - c) < 1e-12) {
          return {
            primaryValue: 'All real numbers (∞ solutions)',
            primaryLabel: 'Identity Equation (0x + b = b)',
            secondaryOutputs: [
              { label: 'Equation', value: `0x + ${b} = ${c}` },
              { label: 'Classification', value: 'Dependent Identity' },
            ],
            steps: [`Since a = 0 and b = c (${b} = ${c}), every real value of x satisfies the equation.`],
            formulaUsed: 'Identity: 0x + b = b',
          };
        }
        return calcError(`Contradiction (${b} ≠ ${c}): no value of x satisfies the equation.`, 'No Solution');
      }
      const x = (c - b) / a;
      return {
        primaryValue: parseFloat(x.toFixed(4)),
        primaryLabel: 'Solution (x)',
        secondaryOutputs: [
          { label: 'Equation', value: `${a}x + ${b} = ${c}` },
          { label: 'Subtracted RHS (c - b)', value: parseFloat((c - b).toFixed(4)) },
        ],
        steps: [`${a}x = ${c} - ${b} = ${c - b}`, `x = ${c - b} / ${a} = ${x.toFixed(4)}`],
        formulaUsed: 'x = (c - b) / a',
      };
    },
  },
  {
    slug: 'system-of-equations-calculator',
    title: '2x2 System of Equations Calculator',
    category: 'math',
    formulaDisplay: 'a₁x + b₁y = c₁, a₂x + b₂y = c₂ (Cramer Rule)',
    inputs: [
      { id: 'a1', label: 'a₁', defaultValue: 2, type: 'number', step: 'any' },
      { id: 'b1', label: 'b₁', defaultValue: 3, type: 'number', step: 'any' },
      { id: 'c1', label: 'c₁', defaultValue: 13, type: 'number', step: 'any' },
      { id: 'a2', label: 'a₂', defaultValue: 4, type: 'number', step: 'any' },
      { id: 'b2', label: 'b₂', defaultValue: -1, type: 'number', step: 'any' },
      { id: 'c2', label: 'c₂', defaultValue: 5, type: 'number', step: 'any' },
    ],
    calculate: (v) => {
      const a1 = parseNum(v.a1), b1 = parseNum(v.b1), c1 = parseNum(v.c1);
      const a2 = parseNum(v.a2), b2 = parseNum(v.b2), c2 = parseNum(v.c2);
      if ([a1, b1, c1, a2, b2, c2].some(isNaN)) return calcError('Please enter valid numbers for all 6 system coefficients.');
      const det = a1 * b2 - a2 * b1;
      const dx = c1 * b2 - c2 * b1;
      const dy = a1 * c2 - a2 * c1;
      if (Math.abs(det) < 1e-12) {
        if (Math.abs(dx) < 1e-12 && Math.abs(dy) < 1e-12) {
          return {
            primaryValue: 'Infinite solutions (Coincident lines)',
            primaryLabel: 'Dependent Linear System',
            secondaryOutputs: [
              { label: 'System Determinant (D)', value: 0 },
              { label: 'Dx / Dy', value: '0 / 0' },
            ],
            steps: ['Determinant D = 0 and both Dx = 0, Dy = 0: the two equations describe the same line.'],
            formulaUsed: "Cramer's Rule (Dependent System)",
          };
        }
        return calcError('Lines are parallel (determinant = 0, inconsistent system with no intersection).', 'No Solution (Parallel)');
      }
      const x = dx / det;
      const y = dy / det;
      return {
        primaryValue: `x = ${parseFloat(x.toFixed(4))}, y = ${parseFloat(y.toFixed(4))}`,
        primaryLabel: 'Intersection Solution',
        secondaryOutputs: [
          { label: 'x value', value: parseFloat(x.toFixed(4)) },
          { label: 'y value', value: parseFloat(y.toFixed(4)) },
          { label: 'System Determinant (D)', value: parseFloat(det.toFixed(4)) },
        ],
        steps: [`Determinant D = (${a1})(${b2}) - (${a2})(${b1}) = ${det}`, `D_x = ${dx}`, `x = ${x.toFixed(4)}, y = ${y.toFixed(4)}`],
        formulaUsed: "Cramer's Rule for 2x2 Linear System",
      };
    },
  },
  {
    slug: 'standard-deviation-calculator',
    title: 'Standard Deviation Calculator',
    category: 'statistics-probability',
    formulaDisplay: 's = √[Σ(x-x̄)² ÷ (n-1)] | σ = √[Σ(x-μ)² ÷ N]',
    inputs: [
      { id: 'numbers', label: 'Comma- or Space-Separated Numbers', defaultValue: '10, 12, 23, 23, 16, 23, 21, 16', type: 'text' },
      {
        id: 'mode',
        label: 'Dataset Basis',
        type: 'select',
        defaultValue: 'sample',
        options: [
          { label: 'Sample (n - 1 Bessel Correction)', value: 'sample' },
          { label: 'Population (N)', value: 'population' },
        ],
      },
    ],
    calculate: (vals) => {
      const raw = String(vals.numbers || '').trim();
      if (!raw) return calcError('Enter valid comma- or space-separated numbers.');
      const list = raw
        .split(/[\s,;]+/)
        .filter(Boolean)
        .map(Number)
        .filter((n) => Number.isFinite(n));
      const mode = vals.mode === 'population' ? 'population' : 'sample';
      const stats = calculateDescriptiveStats(list, mode);
      if ('error' in stats) {
        return calcError(stats.error, mode === 'sample' ? 'Sample Size < 2' : 'Invalid Data');
      }

      const activeSd = mode === 'sample' ? stats.sampleSd : stats.popSd;
      const altSd = mode === 'sample' ? stats.popSd : stats.sampleSd;

      return {
        primaryValue: parseFloat(activeSd.toFixed(4)),
        primaryLabel: mode === 'sample' ? 'Sample Standard Deviation (s)' : 'Population Standard Deviation (σ)',
        secondaryOutputs: [
          { label: mode === 'sample' ? 'Population SD (σ)' : 'Sample SD (s)', value: altSd.toFixed(4) },
          { label: 'Sample / Pop Variance', value: `${stats.sampleVariance.toFixed(4)} / ${stats.popVariance.toFixed(4)}` },
          { label: 'Mean (x̄) & Median', value: `${stats.mean.toFixed(4)} / ${stats.median.toFixed(4)}` },
          { label: 'Mode(s)', value: stats.modeLabel },
          { label: 'Range & IQR (Q1–Q3)', value: `${stats.range.toFixed(2)} | IQR ${stats.iqr.toFixed(2)} (${stats.q1.toFixed(2)}–${stats.q3.toFixed(2)})` },
          { label: 'SEM & Coeff. of Variation', value: `±${stats.sem.toFixed(4)} | ${stats.cvPct !== null ? `${stats.cvPct.toFixed(2)}%` : 'N/A'}` },
          { label: 'Count (N)', value: stats.count },
        ],
        steps: [
          `Sorted dataset (n=${stats.count}): min = ${stats.min}, median = ${stats.median.toFixed(4)}, max = ${stats.max}`,
          `Mean (x̄) = ${stats.sum.toFixed(4)} ÷ ${stats.count} = ${stats.mean.toFixed(4)}`,
          `Sample SD (s) = ${stats.sampleSd.toFixed(4)} | Population SD (σ) = ${stats.popSd.toFixed(4)}`,
        ],
        formulaUsed: mode === 'sample' ? 's = √[Σ(x-x̄)² / (n-1)]' : 'σ = √[Σ(x-μ)² / N]',
      };
    },
  },
  {
    slug: 'z-score-calculator',
    title: 'Z-Score (Standard Score) Calculator',
    category: 'statistics-probability',
    formulaDisplay: 'Z = (X - μ) / (σ / √n)',
    inputs: [
      { id: 'rawScore', label: 'Raw Score or Sample Mean (X)', defaultValue: 85, type: 'number', step: 'any' },
      { id: 'mean', label: 'Population Mean (μ)', defaultValue: 70, type: 'number', step: 'any' },
      { id: 'sd', label: 'Population Standard Deviation (σ)', defaultValue: 10, type: 'number', min: 0.0001, step: 'any' },
      { id: 'sampleSize', label: 'Sample Size (n)', defaultValue: 1, type: 'number', min: 1, step: 1, advanced: true, helpText: 'Leave at 1 for an individual observation' },
    ],
    calculate: (v) => {
      const x = parseNum(v.rawScore);
      const mu = parseNum(v.mean);
      const sd = parseNum(v.sd);
      const n = v.sampleSize === undefined ? 1 : parseNum(v.sampleSize);
      if ([x, mu, sd, n].some(isNaN)) return calcError('Please enter valid numbers for X, μ, σ, and n.');
      if (sd <= 0) return calcError('Standard deviation (σ) must be greater than zero.');
      if (n < 1) return calcError('Sample size (n) must be at least 1.');

      const se = sd / Math.sqrt(n);
      const z = (x - mu) / se;
      const pLower = normalCdf(z);
      const pUpper = 1 - pLower;
      const pTwoTailed = normalTwoTailedPValue(z);

      return {
        primaryValue: parseFloat(z.toFixed(4)),
        primaryLabel: n > 1 ? 'Sample-Mean Z-Score (Standard Errors)' : 'Z-Score (Standard Deviations)',
        secondaryOutputs: [
          { label: 'Percentile Rank P(Z ≤ z)', value: `${(pLower * 100).toFixed(2)}th percentile` },
          { label: 'P(Z > z) Upper Tail', value: pUpper.toFixed(4) },
          { label: 'Two-Tailed p-Value', value: pTwoTailed < 0.0001 ? pTwoTailed.toExponential(3) : pTwoTailed.toFixed(4) },
          { label: 'Standard Error (σ/√n)', value: se.toFixed(4) },
        ],
        steps: [
          `Standard Error = ${sd} / √${n} = ${se.toFixed(4)}`,
          `Z = (${x} - ${mu}) / ${se.toFixed(4)} = ${z.toFixed(4)}`,
        ],
        formulaUsed: 'Z = (X - μ) / (σ / √n)',
      };
    },
  },
  {
    slug: 'confidence-interval-calculator',
    title: 'Confidence Interval (CI) Calculator',
    category: 'statistics-probability',
    formulaDisplay: 'CI = x̄ ± t*(df)·(s/√n) | p̂ ± Z*·√[p̂(1-p̂)/n]',
    inputs: [
      {
        id: 'ciType',
        label: 'Parameter Type',
        type: 'select',
        defaultValue: 'mean',
        options: [
          { label: 'Population Mean (x̄)', value: 'mean' },
          { label: 'Population Proportion (p̂ = x/n)', value: 'proportion' },
        ],
      },
      {
        id: 'sdType',
        label: 'Standard Deviation Basis',
        type: 'select',
        defaultValue: 'sample',
        visibleWhen: (v) => v.ciType !== 'proportion',
        options: [
          { label: "Sample SD Known (Student's t*)", value: 'sample' },
          { label: 'Population σ Known (Normal Z*)', value: 'population' },
        ],
      },
      {
        id: 'mean',
        label: 'Sample Mean (x̄)',
        defaultValue: 50,
        type: 'number',
        step: 'any',
        visibleWhen: (v) => v.ciType !== 'proportion',
      },
      {
        id: 'sd',
        label: 'Standard Deviation (s or σ)',
        defaultValue: 8,
        type: 'number',
        min: 0.0001,
        step: 'any',
        visibleWhen: (v) => v.ciType !== 'proportion',
      },
      {
        id: 'successes',
        label: 'Number of Successes (x)',
        defaultValue: 45,
        type: 'number',
        min: 0,
        step: 1,
        visibleWhen: (v) => v.ciType === 'proportion',
      },
      { id: 'n', label: 'Sample Size (n)', defaultValue: 64, type: 'number', min: 2, step: 1 },
      {
        id: 'level',
        label: 'Confidence Level',
        type: 'select',
        defaultValue: '95',
        options: [
          { label: '90% Confidence', value: '90' },
          { label: '95% Confidence', value: '95' },
          { label: '99% Confidence', value: '99' },
          { label: '99.9% Confidence', value: '99.9' },
        ],
      },
    ],
    calculate: (v) => {
      const nRaw = parseNum(v.n);
      if (isNaN(nRaw) || nRaw < 2) return calcError('Sample size (n) must be at least 2.');
      const n = Math.round(nRaw);

      // Backward-compatible support for legacy level Z-strings or percentage levels
      const lvlRaw = String(v.level || '95');
      let confPct = 95;
      if (lvlRaw === '90' || lvlRaw === '1.645') confPct = 90;
      else if (lvlRaw === '95' || lvlRaw === '1.960') confPct = 95;
      else if (lvlRaw === '99' || lvlRaw === '2.576') confPct = 99;
      else if (lvlRaw === '99.9') confPct = 99.9;

      const ciType = v.ciType === 'proportion' ? 'proportion' : 'mean';

      if (ciType === 'proportion') {
        const xRaw = v.successes === undefined ? Math.round(n * 0.5) : parseNum(v.successes);
        if (isNaN(xRaw) || xRaw < 0 || xRaw > n) {
          return calcError('Number of successes (x) must be between 0 and sample size (n).');
        }
        const phat = xRaw / n;
        const zCrit = normalCriticalValue(confPct);
        const se = Math.sqrt((phat * (1 - phat)) / n);
        const me = zCrit * se;
        const waldLower = Math.max(0, phat - me);
        const waldUpper = Math.min(1, phat + me);

        // Wilson Score interval (much cleaner near 0 or 1)
        const z2 = zCrit * zCrit;
        const denom = 1 + z2 / n;
        const center = (phat + z2 / (2 * n)) / denom;
        const halfW = (zCrit * Math.sqrt((phat * (1 - phat) + z2 / (4 * n)) / n)) / denom;

        return {
          primaryValue: `[${(waldLower * 100).toFixed(2)}%, ${(waldUpper * 100).toFixed(2)}%]`,
          primaryLabel: `${confPct}% Proportion CI (Wald)`,
          secondaryOutputs: [
            { label: 'Sample Proportion (p̂)', value: `${(phat * 100).toFixed(2)}%` },
            { label: 'Wilson Score CI (Recommended)', value: `[${((center - halfW) * 100).toFixed(2)}%, ${((center + halfW) * 100).toFixed(2)}%]` },
            { label: 'Critical Value (Z*)', value: zCrit.toFixed(4) },
            { label: 'Margin of Error (ME)', value: `±${(me * 100).toFixed(2)}%` },
          ],
          steps: [
            `p̂ = ${xRaw} / ${n} = ${phat.toFixed(4)}`,
            `SE = √[${phat.toFixed(4)}×(1-${phat.toFixed(4)}) / ${n}] = ${se.toFixed(4)}`,
            `ME = ${zCrit.toFixed(4)} × ${se.toFixed(4)} = ±${me.toFixed(4)}`,
          ],
          formulaUsed: 'p̂ ± Z* · √[p̂(1-p̂)/n] & Wilson Score Bounds',
        };
      }

      const mean = parseNum(v.mean);
      const sd = parseNum(v.sd);
      if (isNaN(mean) || isNaN(sd)) return calcError('Please enter valid numbers for mean and standard deviation.');
      if (sd <= 0) return calcError('Standard deviation must be greater than zero.');

      const usePopZ = v.sdType === 'population';
      const df = n - 1;
      const crit = usePopZ ? normalCriticalValue(confPct) : studentTCriticalValue(df, confPct);
      const se = sd / Math.sqrt(n);
      const me = crit * se;
      const lower = mean - me;
      const upper = mean + me;

      return {
        primaryValue: `[${lower.toFixed(3)}, ${upper.toFixed(3)}]`,
        primaryLabel: `${confPct}% Confidence Interval (${usePopZ ? 'Z*' : `t*, df=${df}`})`,
        secondaryOutputs: [
          { label: usePopZ ? 'Normal Critical Value (Z*)' : `Student t* (df=${df})`, value: crit.toFixed(4) },
          { label: 'Margin of Error (ME)', value: `±${me.toFixed(3)}` },
          { label: 'Standard Error (SE)', value: se.toFixed(3) },
        ],
        steps: [
          `SE = ${sd} / √${n} = ${se.toFixed(4)}`,
          `${usePopZ ? 'Z*' : `t* (df=${df})`} at ${confPct}% confidence = ${crit.toFixed(4)}`,
          `ME = ${crit.toFixed(4)} × ${se.toFixed(4)} = ${me.toFixed(3)}`,
        ],
        formulaUsed: usePopZ ? 'CI = x̄ ± Z* · (σ/√n)' : "CI = x̄ ± t*(df) · (s/√n)",
      };
    },
  },
  {
    slug: 'permutations-calculator',
    title: 'Permutations P(n, r) Calculator',
    category: 'statistics-probability',
    formulaDisplay: 'P(n, r) = n! / (n - r)! | With Repetition: n^r',
    inputs: [
      { id: 'n', label: 'Total Items (n)', defaultValue: 8, type: 'number', min: 0, max: 170, step: 1 },
      { id: 'r', label: 'Items Chosen (r)', defaultValue: 3, type: 'number', min: 0, max: 170, step: 1 },
      {
        id: 'withRepetition',
        label: 'Allow Replacement / Repetition?',
        type: 'select',
        defaultValue: 'no',
        advanced: true,
        options: [
          { label: 'No (Distinct Positions: n!/(n-r)!)', value: 'no' },
          { label: 'Yes (With Repetition: n^r)', value: 'yes' },
        ],
      },
    ],
    calculate: (v) => {
      const nRaw = parseNum(v.n);
      const rRaw = parseNum(v.r);
      if (isNaN(nRaw) || isNaN(rRaw)) return calcError('Please enter valid integers for n and r.');
      const n = Math.round(nRaw);
      const r = Math.round(rRaw);
      if (n < 0 || r < 0) return calcError('Both n and r must be non-negative integers.');
      const allowRep = v.withRepetition === 'yes';

      if (allowRep) {
        const res = Math.pow(n, r);
        if (!Number.isFinite(res)) return calcError('Permutation result with repetition (n^r) exceeds IEEE 754 limits.');
        return {
          primaryValue: res > 1e15 ? res.toExponential(6) : Math.round(res),
          primaryLabel: `Permutations with Repetition (${n}^${r})`,
          secondaryOutputs: [{ label: 'Formula Notation', value: `${n}^${r}` }],
          steps: [`Permutations with repetition: ${n}^${r} = ${res > 1e15 ? res.toExponential(6) : res}`],
          formulaUsed: 'P_rep(n, r) = n^r',
        };
      }

      if (n > 170) return calcError('Total items (n) cannot exceed 170 (IEEE 754 factorial limit).');
      if (r > n) return calcError('Items chosen (r) cannot exceed total items (n) without repetition.');
      let res = 1;
      for (let i = 0; i < r; i++) res *= n - i;
      if (!Number.isFinite(res)) return calcError('Permutation result exceeds floating-point precision limits.');
      const stepFactors =
        r === 0
          ? ['P(n, 0) = 1 (empty arrangement)']
          : r <= 12
          ? [`P(${n}, ${r}) = ${Array.from({ length: r }, (_, i) => n - i).join(' × ')} = ${res}`]
          : [`P(${n}, ${r}) = ${n}! / ${n - r}! = ${res.toExponential(6)}`];
      return {
        primaryValue: res > 1e15 ? res.toExponential(6) : res,
        primaryLabel: `P(${n}, ${r})`,
        secondaryOutputs: [{ label: 'Formula Notation', value: `${n}! / (${n} - ${r})!` }],
        steps: stepFactors,
        formulaUsed: 'P(n, r) = n! / (n - r)!',
      };
    },
  },
  {
    slug: 'combinations-calculator',
    title: 'Combinations C(n, r) / (n Choose r) Calculator',
    category: 'statistics-probability',
    formulaDisplay: 'C(n, r) = n! / [r! × (n - r)!] | With Rep: C(n+r-1, r)',
    inputs: [
      { id: 'n', label: 'Total Items (n)', defaultValue: 10, type: 'number', min: 0, max: 170, step: 1 },
      { id: 'r', label: 'Items Chosen (r)', defaultValue: 4, type: 'number', min: 0, max: 170, step: 1 },
      {
        id: 'withRepetition',
        label: 'Allow Repetition (Multiset)?',
        type: 'select',
        defaultValue: 'no',
        advanced: true,
        options: [
          { label: 'No (Standard C(n, r))', value: 'no' },
          { label: 'Yes (With Repetition C(n+r-1, r))', value: 'yes' },
        ],
      },
    ],
    calculate: (v) => {
      const nRaw = parseNum(v.n);
      const rRaw = parseNum(v.r);
      if (isNaN(nRaw) || isNaN(rRaw)) return calcError('Please enter valid integers for n and r.');
      const n = Math.round(nRaw);
      const r = Math.round(rRaw);
      if (n < 0 || r < 0) return calcError('Both n and r must be non-negative integers.');
      const allowRep = v.withRepetition === 'yes';

      if (allowRep) {
        if (n === 0 && r > 0) return calcError('Cannot choose r > 0 items from n = 0 available types.');
        if (n + r - 1 > 500) return calcError('Combination inputs exceed practical combinatorial range.');
        const top = n === 0 ? 0 : n + r - 1;
        const k = Math.min(r, top - r);
        let c = 1;
        for (let i = 1; i <= k; i++) {
          c = (c * (top - (k - i))) / i;
        }
        if (!Number.isFinite(c)) return calcError('Combination result exceeds floating-point precision limits.');
        const comb = Math.round(c);
        return {
          primaryValue: comb > 1e15 ? comb.toExponential(6) : comb,
          primaryLabel: `Multiset Combinations C(${top}, ${r})`,
          secondaryOutputs: [{ label: 'Formula Notation', value: `(${n} + ${r} - 1)! / [${r}! × (${n} - 1)!]` }],
          steps: [`C(${n} + ${r} - 1, ${r}) = C(${top}, ${r}) = ${comb}`],
          formulaUsed: 'C_rep(n, r) = C(n + r - 1, r)',
        };
      }

      if (n > 170) return calcError('Total items (n) cannot exceed 170.');
      if (r > n) return calcError('Items chosen (r) cannot exceed total items (n).');
      const k = Math.min(r, n - r);
      let c = 1;
      for (let i = 1; i <= k; i++) {
        c = (c * (n - (k - i))) / i;
      }
      if (!Number.isFinite(c)) return calcError('Combination result exceeds floating-point precision limits.');
      const comb = Math.round(c);
      const perm = r <= 170 ? c * factorial(r) : Infinity;
      return {
        primaryValue: comb > 1e15 ? comb.toExponential(6) : comb,
        primaryLabel: `C(${n}, ${r}) - "${n} Choose ${r}"`,
        secondaryOutputs: [
          {
            label: 'Permutations Equivalent',
            value: Number.isFinite(perm) ? (perm > 1e15 ? perm.toExponential(4) : Math.round(perm)) : 'Overflow',
          },
        ],
        steps: [`C(${n}, ${r}) = ${n}! / (${r}! × ${n - r}!) = ${comb}`],
        formulaUsed: 'C(n, r) = n! / [r!(n-r)!]',
      };
    },
  },
  {
    slug: 'triangle-area-calculator',
    title: 'Triangle Area Calculator',
    category: 'geometry',
    formulaDisplay: 'Heron: √[s(s-a)(s-b)(s-c)] | 0.5×b×h | 0.5×a×b×sin(C)',
    inputs: [
      {
        id: 'mode',
        label: 'Known Geometry Method',
        type: 'select',
        defaultValue: 'heron',
        options: [
          { label: "3 Sides (Heron's Formula)", value: 'heron' },
          { label: 'Base & Perpendicular Height', value: 'base_height' },
          { label: 'Two Sides & Included Angle (SAS)', value: 'sas' },
        ],
      },
      {
        id: 'side1',
        label: 'Side a',
        defaultValue: 5,
        type: 'number',
        min: 0.0001,
        step: 'any',
        unit: 'cm',
        visibleWhen: (v) => !v.mode || v.mode === 'heron' || v.mode === 'invalid_option',
      },
      {
        id: 'side2',
        label: 'Side b',
        defaultValue: 6,
        type: 'number',
        min: 0.0001,
        step: 'any',
        unit: 'cm',
        visibleWhen: (v) => !v.mode || v.mode === 'heron' || v.mode === 'invalid_option',
      },
      {
        id: 'side3',
        label: 'Side c',
        defaultValue: 7,
        type: 'number',
        min: 0.0001,
        step: 'any',
        unit: 'cm',
        visibleWhen: (v) => !v.mode || v.mode === 'heron' || v.mode === 'invalid_option',
      },
      {
        id: 'base',
        label: 'Base (b)',
        defaultValue: 10,
        type: 'number',
        min: 0.0001,
        step: 'any',
        unit: 'cm',
        visibleWhen: (v) => v.mode === 'base_height',
      },
      {
        id: 'height',
        label: 'Height (h)',
        defaultValue: 6,
        type: 'number',
        min: 0.0001,
        step: 'any',
        unit: 'cm',
        visibleWhen: (v) => v.mode === 'base_height',
      },
      {
        id: 'sideA',
        label: 'Side a',
        defaultValue: 7,
        type: 'number',
        min: 0.0001,
        step: 'any',
        unit: 'cm',
        visibleWhen: (v) => v.mode === 'sas',
      },
      {
        id: 'sideB',
        label: 'Side b',
        defaultValue: 10,
        type: 'number',
        min: 0.0001,
        step: 'any',
        unit: 'cm',
        visibleWhen: (v) => v.mode === 'sas',
      },
      {
        id: 'angleDeg',
        label: 'Included Angle γ (Degrees)',
        defaultValue: 60,
        type: 'number',
        min: 0.01,
        max: 179.99,
        step: 'any',
        unit: '°',
        visibleWhen: (v) => v.mode === 'sas',
      },
    ],
    calculate: (v) => {
      const mode = v.mode === 'base_height' || v.mode === 'sas' ? v.mode : 'heron';

      if (mode === 'base_height') {
        const b = parseNum(v.base);
        const h = parseNum(v.height);
        if (isNaN(b) || isNaN(h)) return calcError('Please enter valid numbers for base and height.');
        if (b <= 0 || h <= 0) return calcError('Base and height must be positive.');
        const area = 0.5 * b * h;
        return {
          primaryValue: parseFloat(area.toFixed(4)),
          primaryUnit: 'sq units',
          primaryLabel: 'Triangle Area (Base × Height)',
          secondaryOutputs: [
            { label: 'Base', value: b, unit: 'units' },
            { label: 'Height', value: h, unit: 'units' },
          ],
          steps: [`Area = 0.5 × ${b} × ${h} = ${area}`],
          formulaUsed: 'A = 0.5 · b · h',
        };
      }

      if (mode === 'sas') {
        const a = parseNum(v.sideA);
        const b = parseNum(v.sideB);
        const angle = parseNum(v.angleDeg);
        if ([a, b, angle].some(isNaN)) return calcError('Please enter valid numbers for sides and included angle.');
        if (a <= 0 || b <= 0) return calcError('Triangle sides must be positive.');
        if (angle <= 0 || angle >= 180) return calcError('Included angle must be strictly between 0° and 180°.');
        const rad = (angle * Math.PI) / 180;
        const area = 0.5 * a * b * Math.sin(rad);
        const sideC = Math.sqrt(Math.max(0, a * a + b * b - 2 * a * b * Math.cos(rad)));
        const perim = a + b + sideC;
        return {
          primaryValue: parseFloat(area.toFixed(4)),
          primaryUnit: 'sq units',
          primaryLabel: 'Triangle Area (SAS)',
          secondaryOutputs: [
            { label: 'Opposite Side c (Law of Cosines)', value: parseFloat(sideC.toFixed(4)), unit: 'units' },
            { label: 'Perimeter', value: parseFloat(perim.toFixed(4)), unit: 'units' },
            { label: 'Height onto Side b', value: parseFloat((a * Math.sin(rad)).toFixed(4)), unit: 'units' },
          ],
          steps: [`Area = 0.5 × ${a} × ${b} × sin(${angle}°) = ${area.toFixed(4)}`, `c = √(${a}² + ${b}² - 2·${a}·${b}·cos(${angle}°)) = ${sideC.toFixed(4)}`],
          formulaUsed: 'A = 0.5 · a · b · sin(γ)',
        };
      }

      const a = parseNum(v.side1);
      const b = parseNum(v.side2);
      const c = parseNum(v.side3);
      if ([a, b, c].some(isNaN)) return calcError('Please enter valid numbers for all three triangle sides.');
      if (a <= 0 || b <= 0 || c <= 0) return calcError('All triangle side lengths must be positive.');
      if (a + b <= c || a + c <= b || b + c <= a) {
        return calcError('Sides violate the Triangle Inequality Theorem (the sum of any two sides must exceed the third).');
      }
      const perim = a + b + c;
      const s = perim / 2;
      const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
      let kind = 'Scalene';
      if (Math.abs(a - b) < 1e-9 && Math.abs(b - c) < 1e-9) kind = 'Equilateral';
      else if (Math.abs(a - b) < 1e-9 || Math.abs(b - c) < 1e-9 || Math.abs(a - c) < 1e-9) kind = 'Isosceles';

      return {
        primaryValue: parseFloat(area.toFixed(4)),
        primaryUnit: 'sq units',
        primaryLabel: "Triangle Area (Heron's Formula)",
        secondaryOutputs: [
          { label: 'Perimeter', value: parseFloat(perim.toFixed(4)), unit: 'units' },
          { label: 'Semi-perimeter (s)', value: parseFloat(s.toFixed(4)), unit: 'units' },
          { label: 'Triangle Classification', value: kind },
        ],
        steps: [
          `Semi-perimeter s = (${a} + ${b} + ${c}) / 2 = ${s}`,
          `Area = √[${s}(${s - a})(${s - b})(${s - c})] = ${area.toFixed(4)}`,
        ],
        formulaUsed: "Heron's Formula: √[s(s-a)(s-b)(s-c)]",
      };
    },
  },
  {
    slug: 'circle-calculator',
    title: 'Circle Calculator',
    category: 'geometry',
    formulaDisplay: 'A = π r², C = 2 π r, d = 2 r',
    inputs: [
      {
        id: 'solveFrom',
        label: 'Known Measurement',
        type: 'select',
        defaultValue: 'radius',
        options: [
          { label: 'Radius (r)', value: 'radius' },
          { label: 'Diameter (d)', value: 'diameter' },
          { label: 'Circumference (C)', value: 'circumference' },
          { label: 'Area (A)', value: 'area' },
        ],
      },
      {
        id: 'radius',
        label: 'Radius (r)',
        defaultValue: 7,
        type: 'number',
        min: 0.0001,
        step: 'any',
        unit: 'cm',
        visibleWhen: (v) => !v.solveFrom || v.solveFrom === 'radius' || v.solveFrom === 'invalid_option',
      },
      {
        id: 'diameter',
        label: 'Diameter (d)',
        defaultValue: 14,
        type: 'number',
        min: 0.0001,
        step: 'any',
        unit: 'cm',
        visibleWhen: (v) => v.solveFrom === 'diameter',
      },
      {
        id: 'circumference',
        label: 'Circumference (C)',
        defaultValue: 43.98,
        type: 'number',
        min: 0.0001,
        step: 'any',
        unit: 'cm',
        visibleWhen: (v) => v.solveFrom === 'circumference',
      },
      {
        id: 'areaInput',
        label: 'Circle Area (A)',
        defaultValue: 153.94,
        type: 'number',
        min: 0.0001,
        step: 'any',
        unit: 'cm²',
        visibleWhen: (v) => v.solveFrom === 'area',
      },
    ],
    calculate: (v) => {
      const mode =
        v.solveFrom === 'diameter' || v.solveFrom === 'circumference' || v.solveFrom === 'area'
          ? v.solveFrom
          : 'radius';

      let r = 0;
      if (mode === 'radius') {
        r = parseNum(v.radius);
        if (isNaN(r) || r <= 0) return calcError('Radius must be a positive number.');
      } else if (mode === 'diameter') {
        const d = parseNum(v.diameter);
        if (isNaN(d) || d <= 0) return calcError('Diameter must be a positive number.');
        r = d / 2;
      } else if (mode === 'circumference') {
        const c = parseNum(v.circumference);
        if (isNaN(c) || c <= 0) return calcError('Circumference must be a positive number.');
        r = c / (2 * Math.PI);
      } else {
        const a = parseNum(v.areaInput);
        if (isNaN(a) || a <= 0) return calcError('Area must be a positive number.');
        r = Math.sqrt(a / Math.PI);
      }

      const area = Math.PI * r * r;
      const circ = 2 * Math.PI * r;
      const dia = 2 * r;
      return {
        primaryValue: parseFloat(area.toFixed(4)),
        primaryUnit: 'sq units',
        primaryLabel: 'Circle Area',
        secondaryOutputs: [
          { label: 'Circumference (Perimeter)', value: parseFloat(circ.toFixed(4)), unit: 'units' },
          { label: 'Diameter (d)', value: parseFloat(dia.toFixed(4)), unit: 'units' },
          { label: 'Radius (r)', value: parseFloat(r.toFixed(4)), unit: 'units' },
        ],
        steps: [
          `Derived Radius r = ${r.toFixed(4)}`,
          `Area = π × ${r.toFixed(4)}² = ${area.toFixed(4)}`,
          `Circumference = 2 × π × ${r.toFixed(4)} = ${circ.toFixed(4)}`,
        ],
        formulaUsed: 'A = π·r², C = 2·π·r',
      };
    },
  },
  {
    slug: 'pythagorean-theorem-calculator',
    title: 'Pythagorean Theorem Calculator',
    category: 'geometry',
    formulaDisplay: 'a² + b² = c² → c = √(a² + b²) | b = √(c² - a²)',
    inputs: [
      {
        id: 'solveFor',
        label: 'Solve For',
        type: 'select',
        defaultValue: 'hypotenuse',
        options: [
          { label: 'Hypotenuse (c) from Legs a & b', value: 'hypotenuse' },
          { label: 'Missing Leg (b) from Leg a & Hypotenuse c', value: 'leg' },
        ],
      },
      { id: 'a', label: 'Leg a', defaultValue: 3, type: 'number', min: 0.0001, step: 'any' },
      {
        id: 'b',
        label: 'Leg b',
        defaultValue: 4,
        type: 'number',
        min: 0.0001,
        step: 'any',
        visibleWhen: (v) => !v.solveFor || v.solveFor === 'hypotenuse' || v.solveFor === 'invalid_option',
      },
      {
        id: 'c',
        label: 'Hypotenuse c',
        defaultValue: 5,
        type: 'number',
        min: 0.0001,
        step: 'any',
        visibleWhen: (v) => v.solveFor === 'leg',
      },
    ],
    calculate: (v) => {
      const solveLeg = v.solveFor === 'leg';
      const a = parseNum(v.a);

      let b: number;
      let c: number;

      if (solveLeg) {
        c = parseNum(v.c);
        if (isNaN(a) || isNaN(c) || a <= 0 || c <= 0) {
          return calcError('Leg a and hypotenuse c must be positive numbers.');
        }
        if (c <= a) {
          return calcError('Hypotenuse c must be strictly greater than leg a.');
        }
        b = Math.sqrt(c * c - a * a);
      } else {
        b = parseNum(v.b);
        if (isNaN(a) || isNaN(b) || a <= 0 || b <= 0) {
          return calcError('Leg lengths a and b must be positive numbers.');
        }
        c = Math.hypot(a, b);
      }

      const area = 0.5 * a * b;
      const angleA = (Math.atan(a / b) * 180) / Math.PI;
      const angleB = 90 - angleA;

      return {
        primaryValue: parseFloat((solveLeg ? b : c).toFixed(4)),
        primaryUnit: 'units',
        primaryLabel: solveLeg ? 'Missing Leg (b)' : 'Hypotenuse (c)',
        secondaryOutputs: [
          { label: solveLeg ? 'Hypotenuse (c)' : 'Legs (a, b)', value: solveLeg ? c : `${a}, ${b}`, unit: 'units' },
          { label: 'Triangle Area', value: parseFloat(area.toFixed(4)), unit: 'sq units' },
          { label: 'Perimeter', value: parseFloat((a + b + c).toFixed(4)), unit: 'units' },
          { label: 'Angle α (opp a)', value: parseFloat(angleA.toFixed(2)), unit: '°' },
          { label: 'Angle β (opp b)', value: parseFloat(angleB.toFixed(2)), unit: '°' },
        ],
        steps: solveLeg
          ? [`b² = ${c}² - ${a}² = ${(c * c - a * a).toFixed(4)}`, `b = √${(c * c - a * a).toFixed(4)} = ${b.toFixed(4)}`]
          : [`c² = ${a}² + ${b}² = ${a * a + b * b}`, `c = √${a * a + b * b} = ${c.toFixed(4)}`],
        formulaUsed: solveLeg ? 'b = √(c² - a²)' : 'c = √(a² + b²)',
      };
    },
  },
  {
    slug: 'cylinder-calculator',
    title: 'Cylinder Calculator',
    category: 'geometry',
    formulaDisplay: 'V = π r² h, SA = 2 π r (r + h)',
    inputs: [
      {
        id: 'inputType',
        label: 'Circular Measurement Type',
        type: 'select',
        defaultValue: 'radius',
        advanced: true,
        options: [
          { label: 'Radius (r)', value: 'radius' },
          { label: 'Diameter (d = 2r)', value: 'diameter' },
        ],
      },
      { id: 'radius', label: 'Radius or Diameter', defaultValue: 4, type: 'number', min: 0.0001, step: 'any', unit: 'cm' },
      { id: 'height', label: 'Height (h)', defaultValue: 10, type: 'number', min: 0.0001, step: 'any', unit: 'cm' },
    ],
    calculate: (v) => {
      const rawR = parseNum(v.radius);
      const h = parseNum(v.height);
      if (isNaN(rawR) || isNaN(h) || rawR <= 0 || h <= 0) return calcError('Radius/Diameter and height must be positive numbers.');
      const r = v.inputType === 'diameter' ? rawR / 2 : rawR;
      const vol = Math.PI * r * r * h;
      const sa = 2 * Math.PI * r * (r + h);
      const lateral = 2 * Math.PI * r * h;
      return {
        primaryValue: parseFloat(vol.toFixed(4)),
        primaryUnit: 'cubic units (cm³)',
        primaryLabel: 'Cylinder Volume',
        secondaryOutputs: [
          { label: 'Total Surface Area', value: parseFloat(sa.toFixed(4)), unit: 'sq units' },
          { label: 'Lateral Surface Area', value: parseFloat(lateral.toFixed(4)), unit: 'sq units' },
          { label: 'Base Area', value: parseFloat((Math.PI * r * r).toFixed(4)), unit: 'sq units' },
          { label: 'Capacity (if input in cm)', value: parseFloat((vol / 1000).toFixed(4)), unit: 'Liters' },
        ],
        steps: [`Radius r = ${r}`, `Volume = π × ${r}² × ${h} = ${vol.toFixed(4)}`, `Surface Area = 2π·${r}(${r} + ${h}) = ${sa.toFixed(4)}`],
        formulaUsed: 'V = π·r²·h, SA = 2·π·r·(r+h)',
      };
    },
  },
  {
    slug: 'sphere-calculator',
    title: 'Sphere Calculator',
    category: 'geometry',
    formulaDisplay: 'V = (4/3) π r³, SA = 4 π r²',
    inputs: [
      {
        id: 'inputType',
        label: 'Measurement Type',
        type: 'select',
        defaultValue: 'radius',
        advanced: true,
        options: [
          { label: 'Radius (r)', value: 'radius' },
          { label: 'Diameter (d = 2r)', value: 'diameter' },
        ],
      },
      { id: 'radius', label: 'Radius or Diameter', defaultValue: 5, type: 'number', min: 0.0001, step: 'any', unit: 'cm' },
    ],
    calculate: (v) => {
      const rawR = parseNum(v.radius);
      if (isNaN(rawR) || rawR <= 0) return calcError('Radius/Diameter must be a positive number.');
      const r = v.inputType === 'diameter' ? rawR / 2 : rawR;
      const vol = (4 / 3) * Math.PI * Math.pow(r, 3);
      const sa = 4 * Math.PI * r * r;
      return {
        primaryValue: parseFloat(vol.toFixed(4)),
        primaryUnit: 'cubic units (cm³)',
        primaryLabel: 'Sphere Volume',
        secondaryOutputs: [
          { label: 'Surface Area', value: parseFloat(sa.toFixed(4)), unit: 'sq units' },
          { label: 'Diameter', value: parseFloat((2 * r).toFixed(4)), unit: 'units' },
          { label: 'Circumference (Great Circle)', value: parseFloat((2 * Math.PI * r).toFixed(4)), unit: 'units' },
          { label: 'Capacity (if input in cm)', value: parseFloat((vol / 1000).toFixed(4)), unit: 'Liters' },
        ],
        steps: [`Radius r = ${r}`, `Volume = (4/3) × π × ${r}³ = ${vol.toFixed(4)}`, `Surface Area = 4 × π × ${r}² = ${sa.toFixed(4)}`],
        formulaUsed: 'V = (4/3)·π·r³, SA = 4·π·r²',
      };
    },
  },
];
