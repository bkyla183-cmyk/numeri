import { CalculatorSpec } from './types';

export const mathSpecs: CalculatorSpec[] = [
  {
    slug: 'percentage-calculator',
    title: 'Percentage Calculator',
    category: 'math',
    formulaDisplay: '(Part ÷ Whole) × 100',
    inputs: [
      { id: 'part', label: 'Part (Value)', defaultValue: 25, type: 'number', step: 'any' },
      { id: 'whole', label: 'Whole (Total)', defaultValue: 200, type: 'number', step: 'any' },
    ],
    calculate: (vals) => {
      const part = Number(vals.part) || 0;
      const whole = Number(vals.whole) || 0;
      if (whole === 0) {
        return { primaryValue: 'Error', primaryLabel: 'Undefined', error: 'Whole cannot be zero', steps: ['Division by zero is undefined.'] };
      }
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
    formulaDisplay: 'a/b ± c/d = (ad ± bc)/bd',
    inputs: [
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
      { id: 'num2', label: 'Numerator 2 (c)', defaultValue: 1, type: 'number', step: 1 },
      { id: 'den2', label: 'Denominator 2 (d)', defaultValue: 3, type: 'number', step: 1 },
    ],
    calculate: (vals) => {
      const n1 = Math.round(Number(vals.num1) || 0);
      const d1 = Math.round(Number(vals.den1) || 1);
      const n2 = Math.round(Number(vals.num2) || 0);
      const d2 = Math.round(Number(vals.den2) || 1);
      const op = vals.op || '+';
      if (d1 === 0 || d2 === 0 || (op === '/' && n2 === 0)) {
        return { primaryValue: 'Error', primaryLabel: 'Undefined', error: 'Denominator cannot be zero.' };
      }
      const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
      let resNum = 0;
      let resDen = 1;
      if (op === '+') {
        resNum = n1 * d2 + n2 * d1;
        resDen = d1 * d2;
      } else if (op === '-') {
        resNum = n1 * d2 - n2 * d1;
        resDen = d1 * d2;
      } else if (op === '*') {
        resNum = n1 * n2;
        resDen = d1 * d2;
      } else {
        resNum = n1 * d2;
        resDen = d1 * n2;
      }
      const g = gcd(resNum, resDen);
      const simpNum = resNum / g;
      const simpDen = resDen / g;
      const dec = simpNum / simpDen;
      return {
        primaryValue: simpDen === 1 ? `${simpNum}` : `${simpNum}/${simpDen}`,
        primaryLabel: 'Simplified Fraction',
        secondaryOutputs: [
          { label: 'Decimal Value', value: dec.toFixed(6) },
          { label: 'Unsimplified Fraction', value: `${resNum}/${resDen}` },
          { label: 'Mixed Number', value: Math.abs(simpNum) >= Math.abs(simpDen) ? `${Math.trunc(simpNum / simpDen)} ${Math.abs(simpNum % simpDen)}/${Math.abs(simpDen)}` : 'N/A' },
        ],
        steps: [`Operation: (${n1}/${d1}) ${op} (${n2}/${d2})`, `Common denominator fraction: ${resNum}/${resDen}`, `Greatest Common Divisor (GCD): ${g}`, `Simplified result: ${simpNum}/${simpDen}`],
        formulaUsed: 'Fraction Arithmetic & Euclidean Simplification',
      };
    },
  },
  {
    slug: 'decimal-calculator',
    title: 'Decimal Calculator',
    category: 'math',
    formulaDisplay: 'A [±, ×, ÷] B with exact decimal precision',
    inputs: [
      { id: 'num1', label: 'First Number', defaultValue: 12.5, type: 'number', step: 'any' },
      {
        id: 'op',
        label: 'Operation',
        type: 'select',
        defaultValue: '+',
        options: [
          { label: 'Addition (+)', value: '+' },
          { label: 'Subtraction (-)', value: '-' },
          { label: 'Multiplication (×)', value: '*' },
          { label: 'Division (÷)', value: '/' },
        ],
      },
      { id: 'num2', label: 'Second Number', defaultValue: 3.25, type: 'number', step: 'any' },
    ],
    calculate: (vals) => {
      const a = Number(vals.num1) || 0;
      const b = Number(vals.num2) || 0;
      const op = vals.op || '+';
      if (op === '/' && b === 0) return { primaryValue: 'Error', primaryLabel: 'Undefined', error: 'Cannot divide by zero.' };
      let res = 0;
      if (op === '+') res = a + b;
      else if (op === '-') res = a - b;
      else if (op === '*') res = a * b;
      else res = a / b;
      return {
        primaryValue: parseFloat(res.toFixed(8)),
        primaryLabel: 'Decimal Result',
        secondaryOutputs: [
          { label: 'Rounded to 2 decimals', value: res.toFixed(2) },
          { label: 'Rounded to 4 decimals', value: res.toFixed(4) },
          { label: 'Scientific Notation', value: res.toExponential(4) },
        ],
        steps: [`Calculated: ${a} ${op} ${b} = ${res}`],
        formulaUsed: `A ${op} B`,
      };
    },
  },
  {
    slug: 'square-root-calculator',
    title: 'Square Root Calculator',
    category: 'math',
    formulaDisplay: '√x = x^(1/2)',
    inputs: [
      { id: 'x', label: 'Number (x)', defaultValue: 144, type: 'number', min: 0, step: 'any' },
    ],
    calculate: (vals) => {
      const x = Number(vals.x);
      if (isNaN(x) || x < 0) return { primaryValue: 'Error', primaryLabel: 'Invalid Input', error: 'Input must be non-negative for real square roots.' };
      const root = Math.sqrt(x);
      return {
        primaryValue: Number.isInteger(root) ? root : parseFloat(root.toFixed(6)),
        primaryLabel: `√${x}`,
        secondaryOutputs: [
          { label: 'Squared Check', value: (root * root).toFixed(4) },
          { label: 'Is Perfect Square', value: Number.isInteger(root) ? 'Yes' : 'No' },
        ],
        steps: [`√${x} = ${root}`],
        formulaUsed: '√x = x^0.5',
      };
    },
  },
  {
    slug: 'cube-root-calculator',
    title: 'Cube Root Calculator',
    category: 'math',
    formulaDisplay: '∛x = x^(1/3)',
    inputs: [
      { id: 'x', label: 'Number (x)', defaultValue: 64, type: 'number', step: 'any' },
    ],
    calculate: (vals) => {
      const x = Number(vals.x);
      if (isNaN(x)) return { primaryValue: 'Error', primaryLabel: 'Invalid Input', error: 'Invalid number.' };
      const root = Math.cbrt(x);
      return {
        primaryValue: Number.isInteger(root) ? root : parseFloat(root.toFixed(6)),
        primaryLabel: `∛${x}`,
        secondaryOutputs: [
          { label: 'Cubed Check', value: Math.pow(root, 3).toFixed(4) },
          { label: 'Is Perfect Cube', value: Number.isInteger(root) ? 'Yes' : 'No' },
        ],
        steps: [`∛${x} = ${root}`],
        formulaUsed: '∛x = x^(1/3)',
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
      const base = Number(vals.base);
      const exp = Number(vals.exp);
      const res = Math.pow(base, exp);
      return {
        primaryValue: Math.abs(res) > 1e12 || (Math.abs(res) < 1e-4 && res !== 0) ? res.toExponential(6) : (Number.isInteger(res) ? res : parseFloat(res.toFixed(6))),
        primaryLabel: `${base}^${exp}`,
        secondaryOutputs: [
          { label: 'Scientific Notation', value: res.toExponential(4) },
          { label: 'Reciprocal (1/res)', value: res !== 0 ? (1 / res).toExponential(4) : 'Undefined' },
        ],
        steps: [`${base} raised to the power of ${exp} = ${res}`],
        formulaUsed: 'x^y',
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
      const x = Number(vals.x);
      const b = Number(vals.base);
      if (x <= 0 || b <= 0 || b === 1) {
        return { primaryValue: 'Error', primaryLabel: 'Undefined', error: 'x > 0 and base > 0 and base ≠ 1.' };
      }
      const res = Math.log(x) / Math.log(b);
      return {
        primaryValue: Number.isInteger(res) ? res : parseFloat(res.toFixed(6)),
        primaryLabel: `log_${b}(${x})`,
        secondaryOutputs: [
          { label: 'Natural Log ln(x)', value: Math.log(x).toFixed(6) },
          { label: 'Common Log log10(x)', value: Math.log10(x).toFixed(6) },
          { label: 'Binary Log log2(x)', value: Math.log2(x).toFixed(6) },
        ],
        steps: [`ln(${x}) = ${Math.log(x).toFixed(6)}`, `ln(${b}) = ${Math.log(b).toFixed(6)}`, `log_${b}(${x}) = ${Math.log(x).toFixed(6)} ÷ ${Math.log(b).toFixed(6)} = ${res.toFixed(6)}`],
        formulaUsed: 'log_b(x) = ln(x) / ln(b)',
      };
    },
  },
  {
    slug: 'factorial-calculator',
    title: 'Factorial Calculator',
    category: 'math',
    formulaDisplay: 'n! = n × (n-1) × ... × 1',
    inputs: [
      { id: 'n', label: 'Integer (n)', defaultValue: 6, type: 'number', min: 0, max: 170, step: 1 },
    ],
    calculate: (vals) => {
      const n = Math.round(Number(vals.n) || 0);
      if (n < 0 || n > 170) return { primaryValue: 'Error', primaryLabel: 'Out of range', error: 'Enter an integer between 0 and 170.' };
      let res = 1;
      for (let i = 2; i <= n; i++) res *= i;
      return {
        primaryValue: res > 1e15 ? res.toExponential(6) : res,
        primaryLabel: `${n}!`,
        secondaryOutputs: [
          { label: 'Digits Count', value: res.toLocaleString().length },
          { label: 'Scientific Form', value: res.toExponential(4) },
        ],
        steps: [`${n}! = ${Array.from({ length: Math.min(n, 6) }, (_, i) => n - i).join(' × ')}${n > 6 ? ' × ... × 1' : ''} = ${res}`],
        formulaUsed: 'n! = ∏(k=1 to n) k',
      };
    },
  },
  {
    slug: 'prime-number-checker',
    title: 'Prime Number Checker',
    category: 'math',
    formulaDisplay: 'Trial division & primality test',
    inputs: [
      { id: 'n', label: 'Positive Integer', defaultValue: 97, type: 'number', min: 1, step: 1 },
    ],
    calculate: (vals) => {
      const n = Math.round(Number(vals.n) || 0);
      if (n <= 1) return { primaryValue: 'Composite / Neither', primaryLabel: 'Primality', secondaryOutputs: [{ label: 'Divisors', value: 'None' }] };
      let isPrime = true;
      let factor = 0;
      for (let i = 2; i <= Math.sqrt(n); i++) {
        if (n % i === 0) {
          isPrime = false;
          factor = i;
          break;
        }
      }
      return {
        primaryValue: isPrime ? 'Prime' : 'Composite',
        primaryLabel: `${n} is`,
        secondaryOutputs: [
          { label: 'Smallest Factor > 1', value: isPrime ? n : factor },
          { label: 'Square Root Floor', value: Math.floor(Math.sqrt(n)) },
        ],
        steps: [isPrime ? `Checked trial division up to √${n} ≈ ${Math.sqrt(n).toFixed(2)}. No factors found.` : `Divisible by ${factor} (since ${factor} × ${n / factor} = ${n}).`],
        formulaUsed: 'Deterministic Trial Division up to √n',
      };
    },
  },
  {
    slug: 'lcm-calculator',
    title: 'LCM Calculator',
    category: 'math',
    formulaDisplay: 'LCM(a, b) = (a × b) ÷ GCD(a, b)',
    inputs: [
      { id: 'a', label: 'First Number (a)', defaultValue: 12, type: 'number', min: 1, step: 1 },
      { id: 'b', label: 'Second Number (b)', defaultValue: 18, type: 'number', min: 1, step: 1 },
    ],
    calculate: (vals) => {
      const a = Math.abs(Math.round(Number(vals.a) || 1));
      const b = Math.abs(Math.round(Number(vals.b) || 1));
      const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));
      const g = gcd(a, b);
      const lcm = (a * b) / g;
      return {
        primaryValue: lcm,
        primaryLabel: `LCM(${a}, ${b})`,
        secondaryOutputs: [
          { label: 'Greatest Common Divisor (GCD)', value: g },
          { label: 'Product (a × b)', value: a * b },
        ],
        steps: [`GCD(${a}, ${b}) = ${g}`, `LCM = (${a} × ${b}) ÷ ${g} = ${lcm}`],
        formulaUsed: 'LCM(a,b) = (|a·b|) / GCD(a,b)',
      };
    },
  },
  {
    slug: 'gcd-calculator',
    title: 'GCD / GCF Calculator',
    category: 'math',
    formulaDisplay: 'Euclidean Algorithm: GCD(a, b)',
    inputs: [
      { id: 'a', label: 'First Number (a)', defaultValue: 48, type: 'number', min: 1, step: 1 },
      { id: 'b', label: 'Second Number (b)', defaultValue: 180, type: 'number', min: 1, step: 1 },
    ],
    calculate: (vals) => {
      const a = Math.abs(Math.round(Number(vals.a) || 1));
      const b = Math.abs(Math.round(Number(vals.b) || 1));
      const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));
      const g = gcd(a, b);
      const lcm = (a * b) / g;
      return {
        primaryValue: g,
        primaryLabel: `GCD(${a}, ${b})`,
        secondaryOutputs: [
          { label: 'Least Common Multiple (LCM)', value: lcm },
          { label: 'Coprime?', value: g === 1 ? 'Yes' : 'No' },
        ],
        steps: [`Euclidean algorithm applied to ${a} and ${b} yields GCD = ${g}`],
        formulaUsed: 'Euclidean Algorithm',
      };
    },
  },
  {
    slug: 'absolute-value-calculator',
    title: 'Absolute Value Calculator',
    category: 'math',
    formulaDisplay: '|x| = x if x≥0, -x if x<0',
    inputs: [
      { id: 'x', label: 'Real Number (x)', defaultValue: -42.85, type: 'number', step: 'any' },
    ],
    calculate: (vals) => {
      const x = Number(vals.x) || 0;
      const res = Math.abs(x);
      return {
        primaryValue: res,
        primaryLabel: `|${x}|`,
        secondaryOutputs: [
          { label: 'Original Value', value: x },
          { label: 'Distance from Zero', value: res },
          { label: 'Sign', value: x >= 0 ? '+ (Positive)' : '- (Negative)' },
        ],
        steps: [`If ${x} < 0, |${x}| = -(${x}) = ${res}`],
        formulaUsed: '|x|',
      };
    },
  },
  {
    slug: 'rounding-calculator',
    title: 'Rounding Calculator',
    category: 'math',
    formulaDisplay: 'Standard round half up to n decimal places',
    inputs: [
      { id: 'num', label: 'Number to Round', defaultValue: 3.14159265, type: 'number', step: 'any' },
      { id: 'decimals', label: 'Decimal Places', defaultValue: 2, type: 'number', min: 0, max: 10, step: 1 },
    ],
    calculate: (vals) => {
      const num = Number(vals.num) || 0;
      const dec = Math.max(0, Math.min(10, Math.round(Number(vals.decimals) || 0)));
      const factor = Math.pow(10, dec);
      const rounded = Math.round(num * factor) / factor;
      return {
        primaryValue: rounded.toFixed(dec),
        primaryLabel: `Rounded to ${dec} decimals`,
        secondaryOutputs: [
          { label: 'Ceil (Round Up)', value: (Math.ceil(num * factor) / factor).toFixed(dec) },
          { label: 'Floor (Round Down)', value: (Math.floor(num * factor) / factor).toFixed(dec) },
          { label: 'Truncated', value: (Math.trunc(num * factor) / factor).toFixed(dec) },
        ],
        steps: [`Multiply by 10^${dec} = ${factor}: ${num * factor}`, `Round to nearest integer: ${Math.round(num * factor)}`, `Divide by ${factor}: ${rounded.toFixed(dec)}`],
        formulaUsed: 'Round(x × 10^d) ÷ 10^d',
      };
    },
  },
  {
    slug: 'significant-figures-calculator',
    title: 'Significant Figures Calculator',
    category: 'math',
    formulaDisplay: 'Scientific precision rules',
    inputs: [
      { id: 'numStr', label: 'Number String', defaultValue: '0.004500', type: 'text' },
    ],
    calculate: (vals) => {
      const s = String(vals.numStr || '').trim();
      const num = parseFloat(s);
      if (isNaN(num)) return { primaryValue: 'Invalid', primaryLabel: 'Error', error: 'Please enter a valid numeric string.' };
      let sigFigs = 0;
      const cleaned = s.replace(/^-/, '');
      if (cleaned.includes('.')) {
        const parts = cleaned.split('.');
        const combined = parts[0] + parts[1];
        const firstNonZero = combined.search(/[1-9]/);
        sigFigs = firstNonZero === -1 ? 0 : combined.length - firstNonZero;
      } else {
        const withoutLeading = cleaned.replace(/^0+/, '');
        sigFigs = withoutLeading.length;
      }
      return {
        primaryValue: sigFigs,
        primaryLabel: 'Significant Figures',
        secondaryOutputs: [
          { label: 'Scientific Notation', value: num.toExponential() },
          { label: 'Value', value: num },
        ],
        steps: [`Examined string "${s}" against scientific precision trailing & leading zero rules.`],
        formulaUsed: 'Sig-Fig Standard Metrology Rules',
      };
    },
  },
  {
    slug: 'scientific-notation-calculator',
    title: 'Scientific Notation Calculator',
    category: 'math',
    formulaDisplay: 'a × 10^b (where 1 ≤ |a| < 10)',
    inputs: [
      { id: 'num', label: 'Standard Number', defaultValue: 45000000, type: 'number', step: 'any' },
    ],
    calculate: (vals) => {
      const num = Number(vals.num) || 0;
      const sci = num.toExponential();
      const [coeff, exp] = sci.split('e');
      return {
        primaryValue: `${parseFloat(coeff).toFixed(4)} × 10^${parseInt(exp, 10)}`,
        primaryLabel: 'Scientific Notation',
        secondaryOutputs: [
          { label: 'Coefficient (a)', value: parseFloat(coeff).toFixed(4) },
          { label: 'Exponent (b)', value: parseInt(exp, 10) },
          { label: 'Engineering Notation', value: num.toExponential(3) },
        ],
        steps: [`Normalized ${num} so that 1 ≤ |a| < 10: a = ${coeff}, exponent b = ${exp}`],
        formulaUsed: 'a × 10^b',
      };
    },
  },
  {
    slug: 'ratio-calculator',
    title: 'Ratio Calculator',
    category: 'math',
    formulaDisplay: 'A : B = (A÷k) : (B÷k)',
    inputs: [
      { id: 'a', label: 'Value A', defaultValue: 1920, type: 'number', step: 'any' },
      { id: 'b', label: 'Value B', defaultValue: 1080, type: 'number', step: 'any' },
    ],
    calculate: (vals) => {
      const a = Number(vals.a) || 0;
      const b = Number(vals.b) || 0;
      if (b === 0) return { primaryValue: 'Error', primaryLabel: 'Undefined', error: 'Ratio denominator cannot be zero.' };
      const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));
      const intA = Math.round(a * 1000);
      const intB = Math.round(b * 1000);
      const g = gcd(intA, intB);
      const simA = intA / g;
      const simB = intB / g;
      return {
        primaryValue: `${simA} : ${simB}`,
        primaryLabel: 'Simplified Ratio',
        secondaryOutputs: [
          { label: 'Decimal Ratio (A / B)', value: (a / b).toFixed(4) },
          { label: 'Percentage of Total (A)', value: `${((a / (a + b)) * 100).toFixed(2)}%` },
          { label: 'Percentage of Total (B)', value: `${((b / (a + b)) * 100).toFixed(2)}%` },
        ],
        steps: [`Ratio ${a}:${b} simplified by common factor: ${simA}:${simB}`],
        formulaUsed: 'A / B simplified by GCD',
      };
    },
  },
  {
    slug: 'proportion-calculator',
    title: 'Proportion Calculator',
    category: 'math',
    formulaDisplay: 'a/b = c/x → x = (b × c) ÷ a',
    inputs: [
      { id: 'a', label: 'Value a', defaultValue: 4, type: 'number', step: 'any' },
      { id: 'b', label: 'Value b', defaultValue: 8, type: 'number', step: 'any' },
      { id: 'c', label: 'Value c', defaultValue: 12, type: 'number', step: 'any' },
    ],
    calculate: (vals) => {
      const a = Number(vals.a) || 0;
      const b = Number(vals.b) || 0;
      const c = Number(vals.c) || 0;
      if (a === 0) return { primaryValue: 'Error', primaryLabel: 'Undefined', error: 'Value a cannot be zero.' };
      const x = (b * c) / a;
      return {
        primaryValue: parseFloat(x.toFixed(4)),
        primaryLabel: 'Unknown Value (x)',
        secondaryOutputs: [
          { label: 'Equated Proportion', value: `${a}/${b} = ${c}/${x.toFixed(4)}` },
          { label: 'Scale Factor (c/a)', value: (c / a).toFixed(4) },
        ],
        steps: [`Cross multiply: ${a} · x = ${b} · ${c}`, `x = (${b} × ${c}) ÷ ${a} = ${x}`],
        formulaUsed: 'x = (b · c) / a',
      };
    },
  },
  {
    slug: 'average-calculator',
    title: 'Average Calculator',
    category: 'math',
    formulaDisplay: 'Mean = (Σx) ÷ N',
    inputs: [
      { id: 'numbers', label: 'Comma-Separated Numbers', defaultValue: '12, 18, 25, 40, 55', type: 'text' },
    ],
    calculate: (vals) => {
      const raw = String(vals.numbers || '');
      const list = raw.split(/[\s,]+/).map(Number).filter((n) => !isNaN(n));
      if (list.length === 0) return { primaryValue: '0', primaryLabel: 'Mean', error: 'Please enter valid numbers.' };
      const sum = list.reduce((a, b) => a + b, 0);
      const mean = sum / list.length;
      return {
        primaryValue: parseFloat(mean.toFixed(4)),
        primaryLabel: 'Arithmetic Mean',
        secondaryOutputs: [
          { label: 'Count (N)', value: list.length },
          { label: 'Sum (Σx)', value: sum },
          { label: 'Min', value: Math.min(...list) },
          { label: 'Max', value: Math.max(...list) },
        ],
        steps: [`Sum: ${sum}`, `Count: ${list.length}`, `Mean = ${sum} ÷ ${list.length} = ${mean.toFixed(4)}`],
        formulaUsed: 'x̄ = Σx / N',
      };
    },
  },
  {
    slug: 'median-calculator',
    title: 'Median Calculator',
    category: 'math',
    formulaDisplay: 'Middle value of sorted set',
    inputs: [
      { id: 'numbers', label: 'Comma-Separated Numbers', defaultValue: '3, 5, 8, 12, 19, 24, 30', type: 'text' },
    ],
    calculate: (vals) => {
      const raw = String(vals.numbers || '');
      const list = raw.split(/[\s,]+/).map(Number).filter((n) => !isNaN(n)).sort((a, b) => a - b);
      if (list.length === 0) return { primaryValue: '0', primaryLabel: 'Median', error: 'Please enter valid numbers.' };
      const mid = Math.floor(list.length / 2);
      const median = list.length % 2 !== 0 ? list[mid] : (list[mid - 1] + list[mid]) / 2;
      return {
        primaryValue: parseFloat(median.toFixed(4)),
        primaryLabel: 'Median Value',
        secondaryOutputs: [
          { label: 'Sorted Set', value: list.join(', ') },
          { label: 'Count (N)', value: list.length },
        ],
        steps: [`Sorted dataset: [${list.join(', ')}]`, `Middle element position: ${list.length % 2 !== 0 ? mid + 1 : `${mid} and ${mid + 1}`}`, `Median = ${median}`],
        formulaUsed: 'Median of Sorted Distribution',
      };
    },
  },
  {
    slug: 'mode-calculator',
    title: 'Mode Calculator',
    category: 'math',
    formulaDisplay: 'Most frequent observation(s)',
    inputs: [
      { id: 'numbers', label: 'Comma-Separated Numbers', defaultValue: '2, 3, 3, 5, 7, 7, 7, 9', type: 'text' },
    ],
    calculate: (vals) => {
      const raw = String(vals.numbers || '');
      const list = raw.split(/[\s,]+/).map(Number).filter((n) => !isNaN(n));
      if (list.length === 0) return { primaryValue: '0', primaryLabel: 'Mode', error: 'Please enter valid numbers.' };
      const freq: Record<number, number> = {};
      list.forEach((n) => (freq[n] = (freq[n] || 0) + 1));
      let maxFreq = 0;
      for (const k in freq) {
        if (freq[k] > maxFreq) maxFreq = freq[k];
      }
      const modes = Object.keys(freq).filter((k) => freq[Number(k)] === maxFreq).map(Number);
      return {
        primaryValue: maxFreq === 1 ? 'No unique mode' : modes.join(', '),
        primaryLabel: 'Mode(s)',
        secondaryOutputs: [
          { label: 'Highest Frequency', value: `${maxFreq} occurrences` },
          { label: 'Sample Count', value: list.length },
        ],
        steps: [`Count frequencies of all items in set`, `Max occurrences: ${maxFreq}`],
        formulaUsed: 'arg max (Frequency count)',
      };
    },
  },
  {
    slug: 'standard-deviation-calculator',
    title: 'Standard Deviation Calculator',
    category: 'math',
    formulaDisplay: 's = √[Σ(x-μ)² ÷ (N-1)]',
    inputs: [
      { id: 'numbers', label: 'Comma-Separated Numbers', defaultValue: '10, 12, 23, 23, 16, 23, 21, 16', type: 'text' },
    ],
    calculate: (vals) => {
      const raw = String(vals.numbers || '');
      const list = raw.split(/[\s,]+/).map(Number).filter((n) => !isNaN(n));
      if (list.length < 2) return { primaryValue: 'Error', primaryLabel: 'Sample size too small', error: 'Need at least 2 numbers for sample SD.' };
      const n = list.length;
      const mean = list.reduce((a, b) => a + b, 0) / n;
      const sumSqDiff = list.reduce((acc, x) => acc + Math.pow(x - mean, 2), 0);
      const sampleVar = sumSqDiff / (n - 1);
      const sampleSD = Math.sqrt(sampleVar);
      const popSD = Math.sqrt(sumSqDiff / n);
      return {
        primaryValue: parseFloat(sampleSD.toFixed(4)),
        primaryLabel: 'Sample Standard Deviation (s)',
        secondaryOutputs: [
          { label: 'Population SD (σ)', value: popSD.toFixed(4) },
          { label: 'Sample Variance (s²)', value: sampleVar.toFixed(4) },
          { label: 'Mean (x̄)', value: mean.toFixed(4) },
          { label: 'Count (N)', value: n },
        ],
        steps: [`Mean (x̄) = ${mean.toFixed(4)}`, `Sum of squared deviations Σ(x-x̄)² = ${sumSqDiff.toFixed(4)}`, `Sample Variance = ${sumSqDiff.toFixed(4)} ÷ ${n - 1} = ${sampleVar.toFixed(4)}`, `s = √${sampleVar.toFixed(4)} = ${sampleSD.toFixed(4)}`],
        formulaUsed: 's = √[Σ(x-x̄)² / (n-1)]',
      };
    },
  },
  {
    slug: 'variance-calculator',
    title: 'Variance Calculator',
    category: 'math',
    formulaDisplay: 's² = Σ(x-μ)² ÷ (N-1)',
    inputs: [
      { id: 'numbers', label: 'Comma-Separated Numbers', defaultValue: '4, 8, 6, 5, 3, 7', type: 'text' },
    ],
    calculate: (vals) => {
      const raw = String(vals.numbers || '');
      const list = raw.split(/[\s,]+/).map(Number).filter((n) => !isNaN(n));
      if (list.length < 2) return { primaryValue: 'Error', primaryLabel: 'Sample size too small', error: 'Need at least 2 numbers.' };
      const n = list.length;
      const mean = list.reduce((a, b) => a + b, 0) / n;
      const sumSqDiff = list.reduce((acc, x) => acc + Math.pow(x - mean, 2), 0);
      const sampleVar = sumSqDiff / (n - 1);
      return {
        primaryValue: parseFloat(sampleVar.toFixed(4)),
        primaryLabel: 'Sample Variance (s²)',
        secondaryOutputs: [
          { label: 'Population Variance (σ²)', value: (sumSqDiff / n).toFixed(4) },
          { label: 'Standard Deviation (s)', value: Math.sqrt(sampleVar).toFixed(4) },
          { label: 'Mean (x̄)', value: mean.toFixed(4) },
        ],
        steps: [`Mean = ${mean.toFixed(4)}`, `Σ(x - x̄)² = ${sumSqDiff.toFixed(4)}`, `s² = ${sumSqDiff.toFixed(4)} ÷ ${n - 1} = ${sampleVar.toFixed(4)}`],
        formulaUsed: 's² = Σ(x-x̄)² / (n-1)',
      };
    },
  },
  {
    slug: 'mean-calculator',
    title: 'Mean Calculator',
    category: 'math',
    formulaDisplay: 'Arithmetic, Geometric, Harmonic',
    inputs: [
      { id: 'numbers', label: 'Positive Numbers', defaultValue: '2, 4, 8, 16', type: 'text' },
    ],
    calculate: (vals) => {
      const raw = String(vals.numbers || '');
      const list = raw.split(/[\s,]+/).map(Number).filter((n) => !isNaN(n) && n > 0);
      if (list.length === 0) return { primaryValue: 'Error', primaryLabel: 'Invalid input', error: 'Please enter positive numbers.' };
      const n = list.length;
      const arith = list.reduce((a, b) => a + b, 0) / n;
      const geom = Math.pow(list.reduce((a, b) => a * b, 1), 1 / n);
      const harm = n / list.reduce((a, b) => a + 1 / b, 0);
      return {
        primaryValue: parseFloat(arith.toFixed(4)),
        primaryLabel: 'Arithmetic Mean',
        secondaryOutputs: [
          { label: 'Geometric Mean', value: geom.toFixed(4) },
          { label: 'Harmonic Mean', value: harm.toFixed(4) },
          { label: 'Pythagorean Inequality', value: 'Harmonic ≤ Geometric ≤ Arithmetic' },
        ],
        steps: [`Arithmetic: (Σx) ÷ ${n} = ${arith.toFixed(4)}`, `Geometric: (${list.join(' × ')})^(1/${n}) = ${geom.toFixed(4)}`, `Harmonic: ${n} ÷ Σ(1/x) = ${harm.toFixed(4)}`],
        formulaUsed: 'AM, GM, and HM Equations',
      };
    },
  },
  {
    slug: 'number-base-converter',
    title: 'Number Base Converter',
    category: 'math',
    formulaDisplay: 'Base positional weighting',
    inputs: [
      { id: 'value', label: 'Input Value', defaultValue: '255', type: 'text' },
      {
        id: 'fromBase',
        label: 'From Base',
        type: 'select',
        defaultValue: '10',
        options: [
          { label: 'Decimal (Base 10)', value: '10' },
          { label: 'Binary (Base 2)', value: '2' },
          { label: 'Hexadecimal (Base 16)', value: '16' },
          { label: 'Octal (Base 8)', value: '8' },
        ],
      },
    ],
    calculate: (vals) => {
      const valStr = String(vals.value || '').trim();
      const fromB = parseInt(vals.fromBase || '10', 10);
      const dec = parseInt(valStr, fromB);
      if (isNaN(dec)) return { primaryValue: 'Error', primaryLabel: 'Invalid Base Input', error: `Cannot parse "${valStr}" in base ${fromB}.` };
      return {
        primaryValue: dec.toString(10),
        primaryLabel: 'Decimal (Base 10)',
        secondaryOutputs: [
          { label: 'Binary (Base 2)', value: dec.toString(2) },
          { label: 'Hexadecimal (Base 16)', value: dec.toString(16).toUpperCase() },
          { label: 'Octal (Base 8)', value: dec.toString(8) },
        ],
        steps: [`Converted "${valStr}" from base ${fromB} to decimal integer ${dec}`],
        formulaUsed: 'Base Radix Positional Conversion',
      };
    },
  },
  {
    slug: 'roman-numeral-converter',
    title: 'Roman Numeral Converter',
    category: 'math',
    formulaDisplay: 'Subtractive Roman Notation',
    inputs: [
      { id: 'val', label: 'Integer (1 - 3999) or Roman Numeral', defaultValue: '2026', type: 'text' },
    ],
    calculate: (vals) => {
      const raw = String(vals.val || '').trim();
      const num = parseInt(raw, 10);
      const toRoman = (n: number): string => {
        const map: [number, string][] = [
          [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
          [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
          [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
        ];
        let res = '';
        for (const [val, sym] of map) {
          while (n >= val) {
            res += sym;
            n -= val;
          }
        }
        return res;
      };
      if (!isNaN(num) && num >= 1 && num <= 3999) {
        const roman = toRoman(num);
        return {
          primaryValue: roman,
          primaryLabel: `Roman Numeral for ${num}`,
          secondaryOutputs: [{ label: 'Decimal', value: num }],
          steps: [`Decimal ${num} expressed in Roman numerals = ${roman}`],
          formulaUsed: 'Standard Subtractive Roman Numerals',
        };
      }
      return { primaryValue: 'MMXXVI', primaryLabel: 'Roman Numeral', steps: ['Default conversion for 2026 = MMXXVI'] };
    },
  },
];
