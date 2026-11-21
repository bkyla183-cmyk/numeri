import { getCalculatorSpec } from '../src/data/calculatorRegistry/index.ts';

interface BenchmarkCase {
  slug: string;
  category: string;
  name: string;
  inputs: Record<string, any>;
  expectedOutput: number | string;
  tolerance: number;
  governingStandard: string;
  validator?: (actual: any, expected: any) => boolean;
}

export const extendedBenchmarks: BenchmarkCase[] = [
  // ----------------------------------------------------
  // 1. FINANCE & INVESTMENT (10)
  // ----------------------------------------------------
  {
    slug: 'simple-interest-calculator',
    category: 'Finance',
    name: 'Simple Interest',
    inputs: { principal: 5000, rate: 5, time: 3 },
    expectedOutput: 750,
    tolerance: 0.01,
    governingStandard: 'Classical simple interest formula I = P * r * t',
  },
  {
    slug: 'roi-calculator',
    category: 'Finance',
    name: 'Return on Investment (ROI)',
    inputs: { cost: 1000, finalVal: 1500, years: 1 },
    expectedOutput: 50,
    tolerance: 0.01,
    governingStandard: 'Standard corporate finance ROI percentage ratio',
  },
  {
    slug: 'profit-margin-calculator',
    category: 'Finance',
    name: 'Profit Margin',
    inputs: { rev: 200, cost: 150 },
    expectedOutput: 25,
    tolerance: 0.01,
    governingStandard: 'GAAP Gross Profit Margin: (Revenue - COGS) / Revenue',
  },
  {
    slug: 'future-value-calculator',
    category: 'Finance',
    name: 'Future Value',
    inputs: { pv: 1000, rate: 5, periods: 5 },
    expectedOutput: 1276.28,
    tolerance: 0.05,
    governingStandard: 'Lump-sum compounding FV = PV * (1 + r)^n',
  },
  {
    slug: 'present-value-calculator',
    category: 'Finance',
    name: 'Present Value',
    inputs: { fv: 1000, rate: 5, periods: 5 },
    expectedOutput: 783.53,
    tolerance: 0.05,
    governingStandard: 'Discounted cash flow PV = FV / (1 + r)^n',
  },
  {
    slug: 'apr-to-apy-converter',
    category: 'Finance',
    name: 'APR to APY Converter',
    inputs: { apr: 6, compounding: '12' },
    expectedOutput: 6.17,
    tolerance: 0.02,
    governingStandard: 'Truth in Lending Act (Reg Z) compounding APY formula',
  },
  {
    slug: 'home-equity-calculator',
    category: 'Finance',
    name: 'Home Equity',
    inputs: { marketVal: 500000, loanBal: 300000 },
    expectedOutput: 200000,
    tolerance: 1.0,
    governingStandard: 'Real estate loan-to-value (LTV) and net equity basis',
  },
  {
    slug: 'credit-card-payoff-calculator',
    category: 'Finance',
    name: 'Credit Card Payoff',
    inputs: { balance: 5000, apr: 18, monthly: 200 },
    expectedOutput: 32,
    tolerance: 1.0,
    governingStandard: 'Consumer Credit Disclosure monthly compounding schedule',
  },
  {
    slug: 'down-payment-calculator',
    category: 'Finance',
    name: 'Down Payment Sizer',
    inputs: { price: 300000, pct: 20, savings: 50000, monthlySave: 1000 },
    expectedOutput: 60000,
    tolerance: 1.0,
    governingStandard: 'Mortgage purchase underwriting minimum down payment guidelines',
  },
  {
    slug: 'amortization-calculator',
    category: 'Finance',
    name: 'Loan Amortization',
    inputs: { p: 10000, rate: 5, years: 3 },
    expectedOutput: 299.71,
    tolerance: 0.05,
    governingStandard: 'Standard French amortization fixed monthly installment formula',
  },

  // ----------------------------------------------------
  // 2. BUSINESS, TAX & SALARY (8)
  // ----------------------------------------------------
  {
    slug: 'sales-tax-calculator',
    category: 'Tax',
    name: 'Sales Tax',
    inputs: { price: 100, rate: 8.25 },
    expectedOutput: 108.25,
    tolerance: 0.01,
    governingStandard: 'US State & Local Sales Tax calculation',
  },
  {
    slug: 'vat-calculator',
    category: 'Tax',
    name: 'Value Added Tax (VAT)',
    inputs: { netPrice: 100, vatRate: 20 },
    expectedOutput: 120,
    tolerance: 0.01,
    governingStandard: 'EU / UK HMRC Standard VAT forward calculation',
  },
  {
    slug: 'reverse-vat-calculator',
    category: 'Tax',
    name: 'Reverse VAT',
    inputs: { grossPrice: 120, vatRate: 20 },
    expectedOutput: 100,
    tolerance: 0.01,
    governingStandard: 'HMRC de-vatting formula Net = Gross / (1 + r)',
  },
  {
    slug: 'hourly-to-salary-calculator',
    category: 'Salary',
    name: 'Hourly to Salary Converter',
    inputs: { hourly: 25, hoursWeek: 40, weeksYear: 52 },
    expectedOutput: 52000,
    tolerance: 1.0,
    governingStandard: 'Fair Labor Standards Act (FLSA) standard 2,080 annual hour baseline',
  },
  {
    slug: 'salary-to-hourly-calculator',
    category: 'Salary',
    name: 'Salary to Hourly Converter',
    inputs: { salary: 52000, hoursWeek: 40 },
    expectedOutput: 25,
    tolerance: 0.01,
    governingStandard: 'FLSA regular rate equivalent over 52 working weeks',
  },
  {
    slug: 'overtime-calculator',
    category: 'Salary',
    name: 'Overtime Pay',
    inputs: { baseRate: 20, regHours: 40, otHours: 10, otMultiplier: 1.5 },
    expectedOutput: 1100,
    tolerance: 0.01,
    governingStandard: 'US Department of Labor Time-and-a-Half 29 U.S.C. § 207',
  },
  {
    slug: 'discount-calculator',
    category: 'Business',
    name: 'Retail Discount',
    inputs: { original_price: 100, discount_pct: 25 },
    expectedOutput: 75,
    tolerance: 0.01,
    governingStandard: 'Standard commercial retail mark-down formula',
  },
  {
    slug: 'commission-calculator',
    category: 'Business',
    name: 'Sales Commission',
    inputs: { salesVolume: 50000, commissionRate: 6, baseSalary: 0 },
    expectedOutput: 3000,
    tolerance: 0.01,
    governingStandard: 'Straight commercial sales percentage agreement',
  },

  // ----------------------------------------------------
  // 3. HEALTH, FITNESS & SPORTS (7)
  // ----------------------------------------------------
  {
    slug: 'target-heart-rate-calculator',
    category: 'Health',
    name: 'Target Heart Rate',
    inputs: { age: 30, restHr: 60 },
    expectedOutput: '136 - 149',
    tolerance: 0,
    governingStandard: 'Tanaka & Karvonen clinical aerobic heart rate reserve zone (60-70%)',
    validator: (actual) => String(actual).includes('136') && String(actual).includes('149'),
  },
  {
    slug: 'water-intake-calculator',
    category: 'Health',
    name: 'Daily Water Intake',
    inputs: { weightKg: 70, exerciseMin: 30 },
    expectedOutput: 2.8,
    tolerance: 0.3,
    governingStandard: 'EFSA / US National Academies Dietary Reference Intakes for Water',
  },
  {
    slug: 'ideal-weight-calculator',
    category: 'Health',
    name: 'Ideal Body Weight',
    inputs: { heightCm: 175, gender: 'male' },
    expectedOutput: 70.5,
    tolerance: 2.0,
    governingStandard: 'Dr. B.J. Devine Clinical Pharmacology Ideal Body Weight Equation',
  },
  {
    slug: 'running-pace-calculator',
    category: 'Sports',
    name: 'Running Pace',
    inputs: { distanceKm: 10, hours: 0, minutes: 50, seconds: 0 },
    expectedOutput: '5:00',
    tolerance: 0,
    governingStandard: 'IAAF / World Athletics official race pace timing metric',
    validator: (actual) => String(actual).includes('5:00'),
  },
  {
    slug: 'maximum-heart-rate-calculator',
    category: 'Health',
    name: 'Maximum Heart Rate',
    inputs: { age: 40 },
    expectedOutput: 180,
    tolerance: 1.0,
    governingStandard: 'Haskell & Fox / Tanaka clinical age-predicted HRmax',
  },
  {
    slug: 'heart-rate-reserve-calculator',
    category: 'Health',
    name: 'Heart Rate Reserve',
    inputs: { maxHr: 190, restHr: 60 },
    expectedOutput: 130,
    tolerance: 1.0,
    governingStandard: 'ACSM cardiovascular functional reserve capacity (HRR = HRmax - HRrest)',
  },
  {
    slug: 'waist-to-hip-ratio-calculator',
    category: 'Health',
    name: 'Waist-to-Hip Ratio',
    inputs: { waist: 80, hip: 100, gender: 'female' },
    expectedOutput: 0.80,
    tolerance: 0.01,
    governingStandard: 'WHO 2008 Expert Consultation on Waist Circumference and WHR',
  },

  // ----------------------------------------------------
  // 4. SCIENCE - PHYSICS & CHEMISTRY (9)
  // ----------------------------------------------------
  {
    slug: 'force-calculator',
    category: 'Physics',
    name: 'Newton Second Law (Force)',
    inputs: { mass: 5, accel: 4 },
    expectedOutput: 20,
    tolerance: 0.01,
    governingStandard: 'Newton Second Law of Motion F = m · a (SI units)',
  },
  {
    slug: 'work-power-calculator',
    category: 'Physics',
    name: 'Work and Power',
    inputs: { force: 50, distance: 10, time: 5 },
    expectedOutput: 100, // Power = (50 * 10) / 5 = 100 W (Work = 500 J)
    tolerance: 0.1,
    governingStandard: 'Mechanical power theorem P = (F · d) / t in Watts',
  },
  {
    slug: 'density-calculator',
    category: 'Physics',
    name: 'Density Calculator',
    inputs: { mass: 500, vol: 250 },
    expectedOutput: 2,
    tolerance: 0.01,
    governingStandard: 'Fundamental volumetric density ρ = m / V',
  },
  {
    slug: 'acceleration-calculator',
    category: 'Physics',
    name: 'Kinematic Acceleration',
    inputs: { vi: 0, vf: 20, t: 5 },
    expectedOutput: 4,
    tolerance: 0.01,
    governingStandard: 'Galilean linear kinematics a = Δv / Δt',
  },
  {
    slug: 'momentum-calculator',
    category: 'Physics',
    name: 'Linear Momentum',
    inputs: { mass: 1500, velocity: 20 },
    expectedOutput: 30000,
    tolerance: 0.1,
    governingStandard: 'Newtonian classical linear momentum p = m · v',
  },
  {
    slug: 'free-fall-calculator',
    category: 'Physics',
    name: 'Free Fall Distance',
    inputs: { time: 3, g: 9.80665 },
    expectedOutput: 44.13, // d = 0.5 * g * t^2 = 0.5 * 9.80665 * 9 = 44.1299 m
    tolerance: 0.05,
    governingStandard: 'Uniform gravitational acceleration under vacuum d = 0.5 · g · t²',
  },
  {
    slug: 'wave-speed-calculator',
    category: 'Physics',
    name: 'Wave Speed',
    inputs: { wavelength: 2, freq: 440 },
    expectedOutput: 880,
    tolerance: 0.1,
    governingStandard: 'Fundamental wave propagation relation v = λ · f',
  },
  {
    slug: 'dilution-calculator',
    category: 'Chemistry',
    name: 'Solution Dilution (M1V1 = M2V2)',
    inputs: { m1: 10, m2: 2, v2: 1 },
    expectedOutput: 0.2,
    tolerance: 0.01,
    governingStandard: 'Conservation of solute mass in chemical dilution C₁V₁ = C₂V₂',
  },
  {
    slug: 'carnot-efficiency-calculator',
    category: 'Physics',
    name: 'Carnot Heat Engine Efficiency',
    inputs: { thCelsius: 326.85, tcCelsius: 26.85 }, // T_H = 600K, T_C = 300K -> (1 - 300/600)*100 = 50%
    expectedOutput: 50,
    tolerance: 0.1,
    governingStandard: 'Second Law of Thermodynamics maximum theoretical Carnot efficiency η = 1 - (Tc/Th)',
  },

  // ----------------------------------------------------
  // 5. GEOMETRY & ALGEBRA (8)
  // ----------------------------------------------------
  {
    slug: 'triangle-area-calculator',
    category: 'Geometry',
    name: 'Triangle Area',
    inputs: { base: 10, height: 6 },
    expectedOutput: 30,
    tolerance: 0.01,
    governingStandard: 'Euclidean plane geometry triangle area A = 0.5 · b · h',
  },
  {
    slug: 'trapezoid-calculator',
    category: 'Geometry',
    name: 'Trapezoid Area',
    inputs: { baseA: 5, baseB: 9, height: 4 },
    expectedOutput: 28,
    tolerance: 0.01,
    governingStandard: 'Trapezoid quadrature formula A = 0.5 · (a + b) · h',
  },
  {
    slug: 'cylinder-calculator',
    category: 'Geometry',
    name: 'Cylinder Volume',
    inputs: { radius: 3, height: 10 },
    expectedOutput: 282.74,
    tolerance: 0.1,
    governingStandard: 'Solid Euclidean geometry circular cylinder volume V = π · r² · h',
  },
  {
    slug: 'sphere-calculator',
    category: 'Geometry',
    name: 'Sphere Volume',
    inputs: { radius: 3 },
    expectedOutput: 113.10,
    tolerance: 0.1,
    governingStandard: 'Archimedean sphere volume formula V = (4/3) · π · r³',
  },
  {
    slug: 'cone-calculator',
    category: 'Geometry',
    name: 'Cone Volume',
    inputs: { radius: 3, height: 9 },
    expectedOutput: 84.82,
    tolerance: 0.1,
    governingStandard: 'Right circular cone volume V = (1/3) · π · r² · h',
  },
  {
    slug: 'slope-calculator',
    category: 'Algebra',
    name: 'Coordinate Line Slope',
    inputs: { x1: 2, y1: 3, x2: 6, y2: 11 },
    expectedOutput: 2,
    tolerance: 0.01,
    governingStandard: 'Cartesian coordinate geometry slope gradient m = Δy / Δx',
  },
  {
    slug: 'midpoint-calculator',
    category: 'Algebra',
    name: 'Midpoint of Segment',
    inputs: { x1: 2, y1: 4, x2: 6, y2: 8 },
    expectedOutput: '(4, 6)',
    tolerance: 0,
    governingStandard: 'Affine midpoint theorem M = ((x1+x2)/2, (y1+y2)/2)',
    validator: (actual) => String(actual).includes('(4, 6)'),
  },
  {
    slug: 'distance-formula-calculator',
    category: 'Algebra',
    name: '2D Euclidean Distance',
    inputs: { x1: 0, y1: 0, x2: 3, y2: 4 },
    expectedOutput: 5,
    tolerance: 0.01,
    governingStandard: 'Pythagorean metric distance on ℝ² d = √((Δx)² + (Δy)²)',
  },

  // ----------------------------------------------------
  // 6. STATISTICS & PROBABILITY (4)
  // ----------------------------------------------------
  {
    slug: 'z-score-calculator',
    category: 'Statistics',
    name: 'Standard Normal Z-Score',
    inputs: { rawScore: 85, mean: 70, sd: 10 },
    expectedOutput: 1.5,
    tolerance: 0.01,
    governingStandard: 'Standardized normal deviate z = (X - μ) / σ',
  },
  {
    slug: 'combinations-calculator',
    category: 'Statistics',
    name: 'Combinations (nCr)',
    inputs: { n: 5, r: 2 },
    expectedOutput: 10,
    tolerance: 0.01,
    governingStandard: 'Binomial coefficient combinatorics n! / (r!(n-r)!)',
  },
  {
    slug: 'permutations-calculator',
    category: 'Statistics',
    name: 'Permutations (nPr)',
    inputs: { n: 5, r: 2 },
    expectedOutput: 20,
    tolerance: 0.01,
    governingStandard: 'Order-dependent permutations n! / (n-r)!',
  },
  {
    slug: 'binomial-distribution-calculator',
    category: 'Statistics',
    name: 'Binomial Probability (PMF)',
    inputs: { n: 10, k: 5, p: 0.5 },
    expectedOutput: 0.2461,
    tolerance: 0.005,
    governingStandard: 'Bernoulli trial sequence probability mass function P(X=k)',
  },

  // ----------------------------------------------------
  // 7. ENGINEERING & CONSTRUCTION (4)
  // ----------------------------------------------------
  {
    slug: 'stress-strain-calculator',
    category: 'Engineering',
    name: 'Mechanical Stress',
    inputs: { force: 10000, areaMm2: 100, youngsE: 200 },
    expectedOutput: 100,
    tolerance: 1.0,
    governingStandard: 'Continuum solid mechanics Cauchy stress σ = F / A',
  },
  {
    slug: 'concrete-calculator',
    category: 'Construction',
    name: 'Concrete Volume (Cubic Yards)',
    inputs: { lengthFt: 20, widthFt: 10, depthIn: 4 },
    expectedOutput: 2.47,
    tolerance: 0.05,
    governingStandard: 'ACI 318 Standard building code slab volume estimation',
  },
  {
    slug: 'fuel-cost-calculator',
    category: 'Automotive',
    name: 'Trip Fuel Cost',
    inputs: { distance: 300, mpg: 30, pricePerGal: 3.5 },
    expectedOutput: 35,
    tolerance: 0.01,
    governingStandard: 'US EIA Consumer fuel economy expense model',
  },
  {
    slug: 'electricity-cost-calculator',
    category: 'Energy',
    name: 'Appliance Electricity Cost (30-Day Billing Cycle)',
    inputs: { watts: 1000, hoursPerDay: 5, rateKwh: 0.15, daysInMonth: 30 },
    expectedOutput: 22.50,
    tolerance: 0.01,
    governingStandard: 'DOE standard 30-day billing cycle: (1 kW × 5h/day × 30 days) × $0.15 = $22.50',
  },
];

console.log('================================================================');
console.log('📐 PHASE 6: EXTENDED INDEPENDENT MATHEMATICAL VERIFICATION (50 BENCHMARKS)');
console.log('================================================================\n');

interface TestResult {
  slug: string;
  category: string;
  name: string;
  expected: any;
  actual: any;
  absErr: number;
  relErr: number;
  tolerance: number;
  status: 'PASS' | 'FAIL';
  governingStandard: string;
}

const results: TestResult[] = [];
let passed = 0;
let failed = 0;

for (const b of extendedBenchmarks) {
  const spec = getCalculatorSpec(b.slug);
  if (!spec) {
    results.push({
      slug: b.slug,
      category: b.category,
      name: b.name,
      expected: b.expectedOutput,
      actual: 'SPEC_NOT_FOUND',
      absErr: 999,
      relErr: 1.0,
      tolerance: b.tolerance,
      status: 'FAIL',
      governingStandard: b.governingStandard,
    });
    failed++;
    continue;
  }

  const res = spec.calculate(b.inputs);
  const rawActual = res.primaryOutput ?? res.primaryValue;
  const numActual = typeof rawActual === 'number' ? rawActual : parseFloat(String(rawActual).replace(/[^0-9.-]/g, ''));
  const numExpected = typeof b.expectedOutput === 'number' ? b.expectedOutput : parseFloat(String(b.expectedOutput).replace(/[^0-9.-]/g, ''));

  let isPass = false;
  let absErr = 0;
  let relErr = 0;

  if (b.validator) {
    isPass = b.validator(rawActual, b.expectedOutput);
  } else if (!isNaN(numActual) && !isNaN(numExpected)) {
    absErr = Math.abs(numActual - numExpected);
    relErr = numExpected !== 0 ? absErr / Math.abs(numExpected) : absErr;
    isPass = absErr <= b.tolerance || relErr <= 0.05;
  } else {
    isPass = String(rawActual).includes(String(b.expectedOutput));
  }

  if (isPass) {
    passed++;
  } else {
    failed++;
  }

  results.push({
    slug: b.slug,
    category: b.category,
    name: b.name,
    expected: b.expectedOutput,
    actual: rawActual,
    absErr,
    relErr,
    tolerance: b.tolerance,
    status: isPass ? 'PASS' : 'FAIL',
    governingStandard: b.governingStandard,
  });
}

console.log('| # | Calculator | Category | Tested Inputs | Expected | Actual | Abs Err | Status | Governing Standard |');
console.log('|---|---|---|---|---|---|---|---|---|');
results.forEach((r, idx) => {
  const inp = JSON.stringify(extendedBenchmarks[idx].inputs);
  const statusStr = r.status === 'PASS' ? '✅ PASS' : '❌ FAIL';
  console.log(`| ${idx + 1} | \`${r.slug}\` | ${r.category} | \`${inp}\` | ${r.expected} | ${r.actual} | ${r.absErr.toFixed(4)} | ${statusStr} | ${r.governingStandard} |`);
});

console.log(`\n================================================================`);
console.log(`📊 Extended Math Verification Summary: ${passed} / ${results.length} PASSED (${((passed / results.length) * 100).toFixed(1)}%)`);
console.log(`================================================================\n`);
