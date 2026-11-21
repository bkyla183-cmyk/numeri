import { getCalculatorSpec } from '../src/data/calculatorRegistry/index.ts';

console.log('================================================================');
console.log('📐 PHASE 4: INDEPENDENT MATHEMATICAL PRECISION & BENCHMARK AUDIT');
console.log('================================================================\n');

interface MathBenchmark {
  slug: string;
  name: string;
  category: string;
  inputs: Record<string, any>;
  expectedPrimary: number | string;
  tolerance: number; // acceptable absolute error
  assumptionsOrJurisdiction: string;
}

const benchmarks: MathBenchmark[] = [
  // 1. Finance - Loan Payment (PMT)
  {
    slug: 'loan-calculator',
    name: 'Loan Payment Calculator',
    category: 'Finance',
    inputs: { principal: 25000, rate: 6.5, term: 5 },
    expectedPrimary: 489.15,
    tolerance: 0.05,
    assumptionsOrJurisdiction: 'US / UK standard monthly compound amortization (PITI)',
  },
  // 2. Finance - Mortgage Payment
  {
    slug: 'mortgage-calculator',
    name: 'Mortgage Calculator',
    category: 'Finance',
    inputs: { homePrice: 400000, downPayment: 80000, rate: 6.75, term: 30, taxRate: 1.2, insurance: 1200 },
    expectedPrimary: 2575.51,
    tolerance: 0.2,
    assumptionsOrJurisdiction: 'US fixed-rate conforming loan (PITI escrow)',
  },
  // 3. Finance - Compound Interest
  {
    slug: 'compound-interest-calculator',
    name: 'Compound Interest Calculator',
    category: 'Finance',
    inputs: { principal: 10000, monthly: 500, rate: 8, years: 20 },
    expectedPrimary: 343778.24,
    tolerance: 1.0,
    assumptionsOrJurisdiction: 'Monthly compounding with regular contributions (FINRA benchmark)',
  },
  // 4. Finance - Auto Loan Payment
  {
    slug: 'auto-loan-calculator',
    name: 'Auto Loan Calculator',
    category: 'Finance',
    inputs: { price: 35000, down: 7000, apr: 6.2, months: 60 },
    expectedPrimary: 543.93,
    tolerance: 0.05,
    assumptionsOrJurisdiction: 'US auto loan amortization ($28k financed @ 6.2% APR)',
  },
  // 5. Finance - Debt Payoff
  {
    slug: 'debt-payoff-calculator',
    name: 'Debt Payoff Calculator',
    category: 'Finance',
    inputs: { balance: 8000, apr: 18.5, minPayment: 250, extraPayment: 50 },
    expectedPrimary: 35,
    tolerance: 0.1,
    assumptionsOrJurisdiction: 'Fixed monthly amortization with additional principal payment',
  },
  // 6. Tax - Capital Gains Tax (IRS Bracket)
  {
    slug: 'capital-gains-tax-calculator',
    name: 'Capital Gains Tax Calculator',
    category: 'Tax',
    inputs: { gain: 30000, otherIncome: 50000, term: 'long' },
    expectedPrimary: 4500.0,
    tolerance: 1.0,
    assumptionsOrJurisdiction: 'US Federal IRS Long-Term Capital Gains (15% rate tier)',
  },
  // 7. Health - BMI
  {
    slug: 'bmi-calculator',
    name: 'Body Mass Index Calculator',
    category: 'Health',
    inputs: { weightKg: 70, heightCm: 175 },
    expectedPrimary: 22.9,
    tolerance: 0.1,
    assumptionsOrJurisdiction: 'WHO / CDC Quetelet Index (kg/m²); non-pregnant adults',
  },
  // 8. Health - Calorie / TDEE
  {
    slug: 'calorie-calculator',
    name: 'Calorie / TDEE Calculator',
    category: 'Health',
    inputs: { gender: 'male', age: 32, heightCm: 180, weightKg: 80, activity: 1.55 },
    expectedPrimary: 2743,
    tolerance: 2.0,
    assumptionsOrJurisdiction: 'Mifflin-St Jeor Clinical Equation (ADA validated)',
  },
  // 9. Health - Body Fat Percentage (US Navy Method)
  {
    slug: 'body-fat-calculator',
    name: 'US Navy Body Fat Calculator',
    category: 'Health',
    inputs: { waistCm: 84, neckCm: 38, heightCm: 178, gender: 'male', hipCm: 96 },
    expectedPrimary: 15.7,
    tolerance: 0.2,
    assumptionsOrJurisdiction: 'US Department of Defense (DoD) circumference regression',
  },
  // 10. Science - Ohm\'s Law
  {
    slug: 'ohms-law-calculator',
    name: "Ohm's Law Calculator",
    category: 'Physics',
    inputs: { volts: 120, resistance: 10 },
    expectedPrimary: 12.0,
    tolerance: 0.01,
    assumptionsOrJurisdiction: 'Ideal DC circuit / ohmic conductor (V = I * R)',
  },
  // 11. Science - Kinetic Energy
  {
    slug: 'kinetic-energy-calculator',
    name: 'Kinetic Energy Calculator',
    category: 'Physics',
    inputs: { mass: 2, velocity: 3 },
    expectedPrimary: 9.0,
    tolerance: 0.01,
    assumptionsOrJurisdiction: 'Classical Newtonian mechanics (Ek = 0.5 * m * v²)',
  },
  // 12. Science - Aqueous pH
  {
    slug: 'ph-calculator',
    name: 'pH Calculator',
    category: 'Chemistry',
    inputs: { hConc: 0.0001 },
    expectedPrimary: 4.0,
    tolerance: 0.01,
    assumptionsOrJurisdiction: 'Dilute strong acid solution at 25°C (pH = -log10[H+])',
  },
  // 13. Science - Molarity
  {
    slug: 'molarity-calculator',
    name: 'Molarity Calculator',
    category: 'Chemistry',
    inputs: { moles: 0.5, volumeLiters: 2 },
    expectedPrimary: 0.25,
    tolerance: 0.001,
    assumptionsOrJurisdiction: 'Standard solution molarity (M = moles / volume L)',
  },
  // 14. Geometry - Circle Area
  {
    slug: 'circle-calculator',
    name: 'Circle Calculator',
    category: 'Geometry',
    inputs: { radius: 7 },
    expectedPrimary: 153.94,
    tolerance: 0.1,
    assumptionsOrJurisdiction: 'Euclidean plane geometry (A = pi * r²)',
  },
  // 15. Geometry - Pythagorean Theorem
  {
    slug: 'pythagorean-theorem-calculator',
    name: 'Pythagorean Theorem Calculator',
    category: 'Geometry',
    inputs: { a: 3, b: 4 },
    expectedPrimary: 5.0,
    tolerance: 0.01,
    assumptionsOrJurisdiction: 'Right-angled triangle in Euclidean space (c = √(a² + b²))',
  },
  // 16. Algebra - Quadratic Formula
  {
    slug: 'quadratic-formula-calculator',
    name: 'Quadratic Formula Calculator',
    category: 'Algebra',
    inputs: { a: 1, b: -5, c: 6 },
    expectedPrimary: '3, 2',
    tolerance: 0,
    assumptionsOrJurisdiction: 'Real roots of quadratic polynomial ax² + bx + c = 0',
  },
  // 17. Math - Greatest Common Divisor
  {
    slug: 'gcd-calculator',
    name: 'GCD Calculator',
    category: 'Math',
    inputs: { a: 48, b: 180 },
    expectedPrimary: 12,
    tolerance: 0,
    assumptionsOrJurisdiction: 'Euclidean GCD algorithm over positive integers',
  },
  // 18. Statistics - Standard Deviation
  {
    slug: 'standard-deviation-calculator',
    name: 'Standard Deviation Calculator',
    category: 'Statistics',
    inputs: { numbers: '10, 12, 23, 23, 16, 23, 21, 16' },
    expectedPrimary: 5.24,
    tolerance: 0.05,
    assumptionsOrJurisdiction: 'Bessel-corrected sample standard deviation (N - 1)',
  },
  // 19. Automotive - Fuel Economy (MPG)
  {
    slug: 'mpg-calculator',
    name: 'MPG Calculator',
    category: 'Automotive',
    inputs: { miles: 350, gallons: 10 },
    expectedPrimary: 35.0,
    tolerance: 0.01,
    assumptionsOrJurisdiction: 'US Liquid Gallons (1 US gal ≈ 3.78541 L)',
  },
  // 20. Engineering - Simply Supported Beam Deflection
  {
    slug: 'beam-deflection-calculator',
    name: 'Beam Deflection Calculator',
    category: 'Engineering',
    inputs: { loadW: 5000, spanL: 4.0, youngsE: 200, momentI: 2500 },
    expectedPrimary: 3.33,
    tolerance: 0.05,
    assumptionsOrJurisdiction: 'Euler-Bernoulli beam theory (simply supported, uniform load)',
  },
];

console.log('| # | Calculator | Category | Tested Inputs | Expected | Actual | Abs Err | Rel Err | Status | Assumptions & Standards |');
console.log('|---|---|---|---|---|---|---|---|---|---|');

let allPassed = true;

benchmarks.forEach((b, idx) => {
  const spec = getCalculatorSpec(b.slug);
  if (!spec) {
    console.log(`| ${idx + 1} | \`${b.slug}\` | ${b.category} | N/A | ${b.expectedPrimary} | MISSING SPEC | N/A | N/A | ❌ FAIL | Spec not registered |`);
    allPassed = false;
    return;
  }

  const res = spec.calculate(b.inputs);
  const actualVal = res.primaryOutput ?? res.primaryValue;

  let passed = false;
  let absErr = 0;
  let relErr = '0.00%';

  if (typeof b.expectedPrimary === 'number' && typeof actualVal === 'number') {
    absErr = Math.abs(actualVal - b.expectedPrimary);
    const relVal = b.expectedPrimary !== 0 ? (absErr / Math.abs(b.expectedPrimary)) * 100 : 0;
    relErr = `${relVal.toFixed(3)}%`;
    passed = absErr <= b.tolerance;
  } else {
    const actStr = String(actualVal);
    const expStr = String(b.expectedPrimary);
    passed = actStr.includes(expStr) || expStr.split(', ').every(p => actStr.includes(p));
    absErr = passed ? 0 : 1;
    relErr = passed ? '0.00%' : '100%';
  }

  if (!passed) allPassed = false;

  console.log(
    `| ${idx + 1} | \`${b.slug}\` | ${b.category} | \`${JSON.stringify(b.inputs)}\` | ${b.expectedPrimary} | ${actualVal} | ${typeof absErr === 'number' ? absErr.toFixed(4) : absErr} | ${relErr} | ${passed ? '✅ PASS' : '❌ FAIL'} | ${b.assumptionsOrJurisdiction} |`
  );
});

console.log(`\n📊 Benchmark Execution: ${benchmarks.length} Tested, All Passed: ${allPassed ? '✅ YES (100% Accuracy)' : '❌ NO'}\n`);
process.exit(allPassed ? 0 : 1);
