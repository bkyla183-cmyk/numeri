import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getCalculatorSpec, allCalculatorSpecs } from '../src/data/calculatorRegistry/index.ts';
import { evaluateScientificExpression, factorial } from '../src/utils/scientificParser.ts';
import {
  calculateUsNavyBodyFat,
  calculateCompoundInterest,
  calculateMortgageSchedule,
  calculateCalorieTdee,
  calculateDueDateEstimate,
  calculateFractionOp,
  calculateDescriptiveStats,
  studentTCriticalValue,
  analyzeTextStats,
} from '../src/utils/calculatorFormulas.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allCalcsPath = path.resolve(__dirname, '../src/data/allCalculatorsData.json');
const allCalcs = JSON.parse(fs.readFileSync(allCalcsPath, 'utf8'));

console.log('====================================================');
console.log('🧪 NUMERIQ MATHEMATICAL VERIFICATION SUITE');
console.log('====================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string, details?: any) {
  if (condition) {
    passCount++;
    console.log(`  ✅ PASS: ${testName}`);
  } else {
    failCount++;
    console.error(`  ❌ FAIL: ${testName}`, details || '');
  }
}

// ----------------------------------------------------
// TEST GROUP 1: Database and Registry Completeness
// ----------------------------------------------------
console.log('📋 Test Group 1: Active Registry Coverage');
assert(allCalcs.length >= 75, `Active catalog preserves baseline >= 75 calculators (found ${allCalcs.length})`);
assert(allCalculatorSpecs.length === allCalcs.length, `Calculator registry matches catalog 1:1 (catalog: ${allCalcs.length}, specs: ${allCalculatorSpecs.length})`);

const slugOccurrences = new Set<string>();
let duplicateCatalogSlugs = 0;
for (const calc of allCalcs) {
  if (slugOccurrences.has(calc.slug)) duplicateCatalogSlugs++;
  slugOccurrences.add(calc.slug);
}
assert(duplicateCatalogSlugs === 0, `0 duplicate calculator slugs in catalog (found: ${duplicateCatalogSlugs})`);

let missingSpecs = 0;
for (const calc of allCalcs) {
  const spec = getCalculatorSpec(calc.slug);
  if (!spec) {
    missingSpecs++;
    console.error(`Missing spec for slug: ${calc.slug}`);
  }
}
assert(missingSpecs === 0, `All ${allCalcs.length} active calculators have registered calculation specs (missing: ${missingSpecs})`);

const calcSlugSet = new Set(allCalcs.map((c: any) => c.slug));
const extraSpecs = allCalculatorSpecs.filter((s) => !calcSlugSet.has(s.slug));
assert(extraSpecs.length === 0, `0 orphaned specs in active calculatorRegistry (found: ${extraSpecs.length})`);

// ----------------------------------------------------
// TEST GROUP 2: Math, Algebra, Statistics & Geometry Benchmarks
// ----------------------------------------------------
console.log('\n📐 Test Group 2: Math & Geometry Benchmarks');

{
  const spec = getCalculatorSpec('scientific-calculator')!;
  const res = spec.calculate({ x: 45, y: 2 });
  const val = Number(res.primaryOutput ?? res.primaryValue);
  assert(val === 2025, 'Scientific Calculator (default engine): 45^2 = 2025', { val });
}

{
  const spec = getCalculatorSpec('percentage-calculator')!;
  const res = spec.calculate({ part: 25, whole: 200 });
  const val = Number(res.primaryOutput ?? res.primaryValue);
  assert(val === 12.5, 'Percentage Calculator: 25 of 200 = 12.5%', { val });
}

{
  const spec = getCalculatorSpec('quadratic-formula-calculator')!;
  const res = spec.calculate({ a: 1, b: -5, c: 6 });
  const val = res.primaryOutput ?? res.primaryValue;
  assert(String(val).includes('3') && String(val).includes('2'), 'Quadratic Formula: x² - 5x + 6 = 0 gives roots 3 and 2', { val });
}

{
  const spec = getCalculatorSpec('circle-calculator')!;
  const res = spec.calculate({ radius: 7 });
  const val = Number(res.primaryOutput ?? res.primaryValue);
  assert(Math.abs(val - 153.94) < 0.1, 'Circle Area: r=7 gives 153.94', { val });
}

{
  const spec = getCalculatorSpec('pythagorean-theorem-calculator')!;
  const res = spec.calculate({ a: 3, b: 4 });
  const val = Number(res.primaryOutput ?? res.primaryValue);
  assert(val === 5, 'Pythagorean Theorem: 3² + 4² = 5²', { val });
}

{
  const spec = getCalculatorSpec('standard-deviation-calculator')!;
  const res = spec.calculate({ numbers: '10, 12, 23, 23, 16, 23, 21, 16' });
  const val = Number(res.primaryOutput ?? res.primaryValue);
  assert(Math.abs(val - 5.2372) < 0.01, 'Standard Deviation: benchmark sample set = 5.2372', { val });
}

// ----------------------------------------------------
// TEST GROUP 3: Finance & Business Tax Benchmarks
// ----------------------------------------------------
console.log('\n💰 Test Group 3: Finance & Business Tax Benchmarks');

{
  const spec = getCalculatorSpec('loan-calculator')!;
  const res = spec.calculate({ principal: 25000, rate: 6.5, term: 5 });
  const val = Number(res.primaryOutput ?? res.primaryValue);
  assert(Math.abs(val - 489.15) < 0.5, 'Loan payment: $25k @ 6.5% for 5y is ~$489.15/mo', { val });
}

{
  const spec = getCalculatorSpec('compound-interest-calculator')!;
  const res = spec.calculate({ principal: 10000, monthly: 0, rate: 8, years: 10 });
  const val = Number(res.primaryOutput ?? res.primaryValue);
  assert(Math.abs(val - 22196.4) < 1.0, 'Compound Interest: $10k @ 8% for 10y (monthly) gives ~$22,196.40', { val });
}

{
  const spec = getCalculatorSpec('mortgage-calculator')!;
  const res = spec.calculate({ homePrice: 400000, downPayment: 80000, rate: 6.75, term: 30, taxRate: 1.2, insurance: 1200 });
  const val = Number(res.primaryOutput ?? res.primaryValue);
  assert(Math.abs(val - 2575.51) < 1.0, 'Mortgage PITI: $400k home, 20% down @ 6.75% 30y = ~$2,575.51/mo', { val });
}

{
  const spec = getCalculatorSpec('credit-card-payoff-calculator')!;
  const res = spec.calculate({ balance: 6500, apr: 22.4, monthly: 250 });
  const val = Number(res.primaryOutput ?? res.primaryValue);
  assert(val === 36, 'Credit Card Payoff: $6,500 @ 22.4% ($250/mo) = 36 months', { val });
}

{
  const spec = getCalculatorSpec('tip-calculator')!;
  const res = spec.calculate({ bill_amount: 95, tip_pct: 20, num_guests: 3 });
  const val = Number(res.primaryOutput ?? res.primaryValue);
  assert(Math.abs(val - 38.0) < 0.05, 'Tip Split: $95 bill + 20% tip / 3 people = $38.00/person', { val });
}

{
  const spec = getCalculatorSpec('vat-calculator')!;
  const res = spec.calculate({ netPrice: 200, vatRate: 20 });
  const val = Number(res.primaryOutput ?? res.primaryValue);
  assert(val === 240, 'VAT Calculator: $200 net + 20% VAT = $240 gross', { val });
}

{
  const spec = getCalculatorSpec('discount-calculator')!;
  const res = spec.calculate({ original_price: 89.99, discount_pct: 25 });
  const val = Number(res.primaryOutput ?? res.primaryValue);
  assert(Math.abs(val - 67.49) < 0.02, 'Discount Calculator: $89.99 with 25% off = $67.49', { val });
}

// ----------------------------------------------------
// TEST GROUP 4: Scientific & Engineering Benchmarks
// ----------------------------------------------------
console.log('\n🔬 Test Group 4: Physics, Chemistry, Tech & Home Benchmarks');

{
  const spec = getCalculatorSpec('ohms-law-calculator')!;
  const res = spec.calculate({ volts: 120, resistance: 10 });
  const val = Number(res.primaryOutput ?? res.primaryValue);
  assert(val === 12, "Ohm's Law: 120V / 10Ω = 12A", { val });
}

{
  const spec = getCalculatorSpec('kinetic-energy-calculator')!;
  const res = spec.calculate({ mass: 2, velocity: 3 });
  const val = Number(res.primaryOutput ?? res.primaryValue);
  assert(val === 9, 'Kinetic Energy: 0.5 × 2kg × (3m/s)² = 9 Joules', { val });
}

{
  const spec = getCalculatorSpec('ph-calculator')!;
  const res = spec.calculate({ hConc: 0.0001 });
  const val = Number(res.primaryOutput ?? res.primaryValue);
  assert(Math.abs(val - 4.0) < 0.01, 'pH Calculator: [H+] = 10⁻⁴ gives pH 4.0', { val });
}

{
  const spec = getCalculatorSpec('molarity-calculator')!;
  const res = spec.calculate({ moles: 0.5, volumeLiters: 2 });
  const val = Number(res.primaryOutput ?? res.primaryValue);
  assert(val === 0.25, 'Molarity: 0.5 moles / 2 L = 0.25 M', { val });
}

{
  const spec = getCalculatorSpec('subnet-calculator')!;
  const res = spec.calculate({ ip: '192.168.1.50', cidr: 24 });
  const val = Number(res.primaryOutput ?? res.primaryValue);
  assert(val === 254, 'Subnet Calculator: /24 network yields 254 usable host IPs', { val });
}

{
  const spec = getCalculatorSpec('solar-panel-calculator')!;
  const res = spec.calculate({ monthlyKwh: 950, sunHours: 4.5, costPerKwh: 0.18 });
  const val = Number(res.primaryOutput ?? res.primaryValue);
  assert(Math.abs(val - 8.68) < 0.2, 'Solar Panel: 950 kWh/mo @ 4.5 sun hours ≈ 8.68 kW DC', { val });
}

// ----------------------------------------------------
// TEST GROUP 5: Health, Education & Converter Benchmarks
// ----------------------------------------------------
console.log('\n🥗 Test Group 5: Health, Education & Converter Benchmarks');

{
  const spec = getCalculatorSpec('bmi-calculator')!;
  const res = spec.calculate({ weightKg: 70, heightCm: 175 });
  const val = Number(res.primaryOutput ?? res.primaryValue);
  assert(Math.abs(val - 22.86) < 0.05, 'BMI: 70kg @ 175cm = 22.86 (Normal weight)', { val });
}

{
  const spec = getCalculatorSpec('gpa-calculator')!;
  const res = spec.calculate({
    course1_credits: 3,
    course1_grade: 4,
    course2_credits: 4,
    course2_grade: 3.3,
    course3_credits: 3,
    course3_grade: 3.7,
    prior_gpa: 3.4,
    prior_credits: 30,
  });
  const val = Number(res.primaryOutput ?? res.primaryValue);
  assert(Math.abs(val - 3.46) < 0.02, 'GPA Calculator: cumulative GPA benchmark ≈ 3.46', { val });
}

{
  const spec = getCalculatorSpec('fuel-economy-converter')!;
  const res = spec.calculate({ mpg: 30 });
  const val = Number(res.primaryOutput ?? res.primaryValue);
  assert(Math.abs(val - 7.84) < 0.05, 'Fuel Economy Converter: 30 MPG US = 7.84 L/100km', { val });
}

// ----------------------------------------------------
// TEST GROUP 6: Default-Input Stress Run (All 75 Specs)
// ----------------------------------------------------
console.log(`\n🚀 Test Group 6: Stress Testing All ${allCalculatorSpecs.length} Active Calculators with Default Inputs`);

let crashCount = 0;
let nanCount = 0;
let dummyFormulaCount = 0;

for (const spec of allCalculatorSpecs) {
  try {
    const inputMap: Record<string, any> = {};
    for (const inp of spec.inputs) {
      inputMap[inp.id] = inp.defaultValue;
    }
    const result = spec.calculate(inputMap);
    const primary = result.primaryOutput ?? result.primaryValue;

    if (primary === undefined || primary === null) {
      crashCount++;
      console.error(`Spec ${spec.slug} returned undefined/null output`);
    } else if (typeof primary === 'number' && (isNaN(primary) || !isFinite(primary))) {
      nanCount++;
      console.error(`Spec ${spec.slug} returned NaN/Infinity output`);
    }

    if (result.steps && result.steps.some((s) => s.includes('x * (1 + y / 100)'))) {
      dummyFormulaCount++;
    }
  } catch (err: any) {
    crashCount++;
    console.error(`Spec ${spec.slug} threw an unhandled error:`, err?.message);
  }
}

assert(crashCount === 0, `0 calculators crashed or returned undefined on defaults`, { crashCount });
assert(nanCount === 0, `0 calculators produced NaN/Infinity on default inputs`, { nanCount });
assert(dummyFormulaCount === 0, `0 calculators use the generic dummy equation`, { dummyFormulaCount });

// ----------------------------------------------------
// TEST GROUP 7: Boundary & Adverse Input Stress Matrix (All 75 Specs)
// ----------------------------------------------------
console.log(`\n🛡️  Test Group 7: Boundary, Zero, Negative, Empty & Extreme Inputs (All ${allCalculatorSpecs.length} Specs)`);

let boundaryExceptions = 0;
let boundaryNanOrInf = 0;

const edgeStrategies: Array<{ label: string; valueFor: (inp: any) => any }> = [
  {
    label: 'zero',
    valueFor: (inp) => (inp.type === 'number' ? 0 : inp.type === 'text' ? '' : inp.defaultValue),
  },
  {
    label: 'negative',
    valueFor: (inp) => (inp.type === 'number' ? -100 : inp.defaultValue),
  },
  {
    label: 'empty',
    valueFor: () => '',
  },
  {
    label: 'extreme_large',
    valueFor: (inp) => (inp.type === 'number' ? 1e12 : inp.type === 'text' ? '999.999.999.999' : inp.defaultValue),
  },
  {
    label: 'non_numeric',
    valueFor: (inp) => (inp.type === 'select' ? 'invalid_option' : 'abc_invalid'),
  },
];

for (const spec of allCalculatorSpecs) {
  for (const strategy of edgeStrategies) {
    const inputMap: Record<string, any> = {};
    for (const inp of spec.inputs) {
      inputMap[inp.id] = strategy.valueFor(inp);
    }
    try {
      const result = spec.calculate(inputMap);
      const primary = result.primaryOutput ?? result.primaryValue;
      if (primary === undefined || primary === null) {
        boundaryExceptions++;
        console.error(`[${spec.slug} @ ${strategy.label}] returned undefined/null primary output`);
      } else if (typeof primary === 'number' && (Number.isNaN(primary) || !Number.isFinite(primary))) {
        boundaryNanOrInf++;
        console.error(`[${spec.slug} @ ${strategy.label}] produced NaN/Infinity:`, primary);
      }
      if (result.secondaryOutputs) {
        for (const sec of result.secondaryOutputs) {
          if (typeof sec.value === 'number' && (Number.isNaN(sec.value) || !Number.isFinite(sec.value))) {
            boundaryNanOrInf++;
            console.error(`[${spec.slug} @ ${strategy.label}] secondary "${sec.label}" was NaN/Infinity:`, sec.value);
          }
        }
      }
    } catch (err: any) {
      boundaryExceptions++;
      console.error(`[${spec.slug} @ ${strategy.label}] threw uncaught exception:`, err?.message);
    }
  }
}

assert(boundaryExceptions === 0, `0 uncaught exceptions or null outputs across ${allCalculatorSpecs.length * edgeStrategies.length} adverse boundary test runs`, { boundaryExceptions });
assert(boundaryNanOrInf === 0, `0 raw NaN/Infinity leaks across all primary and secondary outputs in boundary tests`, { boundaryNanOrInf });

// ----------------------------------------------------
// TEST GROUP 8: Safe Recursive-Descent Scientific Parser Unit Tests
// ----------------------------------------------------
console.log('\n🧪 Test Group 8: Safe Scientific Expression Parser Tests');

assert(evaluateScientificExpression('2 + 3 * 4', 'deg') === 14, 'Parser honors operator precedence (2 + 3 * 4 = 14)');
assert(evaluateScientificExpression('2 ^ 3 ^ 2', 'deg') === 512, 'Parser handles right-associative exponentiation (2^3^2 = 512)');
assert(Math.abs(evaluateScientificExpression('sin(30)', 'deg') - 0.5) < 1e-12, 'Parser computes sin(30°) = 0.5 in DEG mode');
assert(Math.abs(evaluateScientificExpression('sin(pi / 6)', 'rad') - 0.5) < 1e-12, 'Parser computes sin(π/6) = 0.5 in RAD mode');
assert(Number.isNaN(evaluateScientificExpression('tan(90)', 'deg')), 'Parser guards tan(90°) discontinuity -> NaN');
assert(Math.abs(evaluateScientificExpression('log(100) + ln(e)', 'deg') - 3) < 1e-12, 'Parser evaluates log(100) + ln(e) = 3');
assert(Number.isNaN(evaluateScientificExpression('sqrt(-4)', 'deg')), 'Parser returns NaN for negative square root');
assert(Number.isNaN(evaluateScientificExpression('log(0)', 'deg')), 'Parser returns NaN for log(0)');
assert(Number.isNaN(evaluateScientificExpression('10 / 0', 'deg')), 'Parser guards division by zero -> NaN');
assert(factorial(0) === 1 && factorial(5) === 120 && Number.isNaN(factorial(171)), 'Factorial handles 0!, 5!, and 171! overflow safely');

let blockedInjection = false;
try {
  evaluateScientificExpression('process.exit(1)', 'deg');
} catch {
  blockedInjection = true;
}
assert(blockedInjection, 'Parser rejects arbitrary non-math identifier injection safely');

assert(Math.abs(evaluateScientificExpression('sinh(1)', 'deg') - Math.sinh(1)) < 1e-12, 'Parser computes hyperbolic sinh(1)');
assert(Math.abs(evaluateScientificExpression('cosh(0) + tanh(0)', 'deg') - 1) < 1e-12, 'Parser computes cosh(0) + tanh(0) = 1');
assert(Math.abs(evaluateScientificExpression('exp(2)', 'deg') - Math.exp(2)) < 1e-12, 'Parser computes exp(2) = e²');

// ----------------------------------------------------
// TEST GROUP 9: Shared Formula Engine & Upgraded Modes
// ----------------------------------------------------
console.log('\n⚙️  Test Group 9: Shared Formula Engine & Upgraded Spec Modes');

{
  const bfMale = calculateUsNavyBodyFat({ gender: 'male', heightCm: 178, weightKg: 75, neckCm: 38, waistCm: 84 });
  assert(!('error' in bfMale) && Math.abs(bfMale.bodyFatPct - 15.7) < 0.15, 'US Navy Body Fat male default yields ~15.7%');

  const cmpDaily = calculateCompoundInterest({ principal: 10000, monthlyContribution: 100, annualRatePct: 8, years: 10.5, compoundingFreq: 365, timing: 'beginning', inflationRatePct: 2.5 });
  assert(!('error' in cmpDaily) && cmpDaily.futureValue > cmpDaily.realFutureValue && cmpDaily.schedule.length === 11, 'Compound Interest handles 10.5 fractional yrs, daily compounding, beginning timing & inflation');

  const mtgExtra = calculateMortgageSchedule({ homePrice: 400000, downPayment: 40000, annualRatePct: 6.5, termYears: 30, monthlyHoa: 150, pmiMode: 'auto', extraMonthly: 300 });
  assert(!('error' in mtgExtra) && mtgExtra.monthlyPmi > 0 && mtgExtra.interestSaved > 0 && mtgExtra.monthsSaved > 0, 'Mortgage engine computes LTV > 80% PMI, HOA & extra payment payoff savings');

  const katch = calculateCalorieTdee({ formula: 'katch', gender: 'male', age: 30, weightKg: 75, heightCm: 178, activityMultiplier: 1.55, bodyFatPct: 15 });
  assert(!('error' in katch) && Math.abs(katch.bmr - (370 + 21.6 * 63.75)) < 0.05, 'Katch-McArdle BMR computes 370 + 21.6 * LBM accurately');

  const eddIvf = calculateDueDateEstimate('ivf_day5', '2026-01-01', 28, '2026-07-02');
  assert(!('error' in eddIvf) && eddIvf.gestationalWeeks === 28 && eddIvf.trimester === 3, 'Due Date Engine aligns IVF Day-5 transfer & ACOG Week 28 Third Trimester');

  const mixedFrac = calculateFractionOp({ whole1: 1, num1: 1, den1: 2, whole2: 2, num2: 1, den2: 4, op: '+' });
  assert(!('error' in mixedFrac) && mixedFrac.num === 15 && mixedFrac.den === 4 && mixedFrac.mixedStr === '3 3/4', 'Mixed Fraction arithmetic: 1 1/2 + 2 1/4 = 3 3/4');

  const desc = calculateDescriptiveStats([10, 12, 23, 23, 16, 23, 21, 16], 'sample');
  assert(!('error' in desc) && desc.modes[0] === 23 && Math.abs(desc.iqr - 9) < 1e-6, 'Descriptive Stats computes Mode (23) and IQR (9)');

  const t9_95 = studentTCriticalValue(9, 95);
  assert(Math.abs(t9_95 - 2.262157) < 0.0005, 'Student t* inverse CDF: t*(df=9, 95%) ≈ 2.2622');

  const txtStats = analyzeTextStats('Hello world.\n\nSecond paragraph here!');
  assert(txtStats.words === 5 && txtStats.sentences === 2 && txtStats.paragraphs === 2, 'Text tokenizer accurately counts 5 words, 2 sentences, 2 paragraphs');
}

{
  // Upgraded Spec Modes Verification
  const takeHome = getCalculatorSpec('take-home-pay-calculator')!.calculate({ grossAnnual: 75000, fedTaxPct: 12, stateTaxPct: 5, ficaPct: 7.65, pretax: 300 });
  assert(Math.abs(Number(takeHome.primaryOutput ?? takeHome.primaryValue) - 4460.38) < 0.05, 'Take-Home Pay shelters pre-tax deductions from Fed/State ($4,460.38/mo)');

  const tax2025 = getCalculatorSpec('income-tax-calculator')!.calculate({ taxYear: '2025', grossIncome: 100000, filingStatus: 'mfj', pretaxDeductions: 10000 });
  assert(Math.abs(Number(tax2025.primaryOutput ?? tax2025.primaryValue) - 6723) < 1, 'Income Tax 2025 MFJ w/ $10k pre-tax ($30k std ded) computes exact progressive tax ($6,723)');

  const gmTarget = getCalculatorSpec('gross-margin-calculator')!.calculate({ mode: 'target_margin_price', cogs: 60, targetMarginPct: 40 });
  assert(Number(gmTarget.primaryOutput ?? gmTarget.primaryValue) === 100, 'Gross Margin reverse pricing: $60 COGS @ 40% target margin = $100 selling price');

  const ciMean = getCalculatorSpec('confidence-interval-calculator')!.calculate({ ciType: 'mean', sdType: 'sample', mean: 50, sd: 8, n: 64, level: '95' });
  assert(String(ciMean.primaryValue).includes('48.002') && String(ciMean.primaryValue).includes('51.998'), 'Confidence Interval default uses Student t*(df=63) => [48.002, 51.998]');

  const ciProp = getCalculatorSpec('confidence-interval-calculator')!.calculate({ ciType: 'proportion', successes: 45, n: 100, level: '95' });
  assert(ciProp.secondaryOutputs?.some((o) => o.label.includes('Wilson Score')), 'Confidence Interval proportion mode computes Wilson Score & Wald intervals');

  const triBase = getCalculatorSpec('triangle-area-calculator')!.calculate({ mode: 'base_height', base: 10, height: 6 });
  assert(Number(triBase.primaryOutput ?? triBase.primaryValue) === 30, 'Triangle Area Base×Height mode: 10 × 6 / 2 = 30');
  const triSas = getCalculatorSpec('triangle-area-calculator')!.calculate({ mode: 'sas', sideA: 7, sideB: 10, angleDeg: 60 });
  assert(Math.abs(Number(triSas.primaryOutput ?? triSas.primaryValue) - 30.3109) < 0.01, 'Triangle Area SAS mode: 0.5×7×10×sin(60°) = 30.3109');

  const bizHol = getCalculatorSpec('business-days-calculator')!.calculate({ mode: 'count', startDate: '2026-10-01', endDate: '2026-10-31', holidays: '2026-10-12' });
  assert(Number(bizHol.primaryOutput ?? bizHol.primaryValue) === 21, 'Business Days subtracts weekday holiday 2026-10-12 (22 → 21 days)');
  const bizAdd = getCalculatorSpec('business-days-calculator')!.calculate({ mode: 'add_days', startDate: '2026-10-01', businessDaysToAdd: 5 });
  assert(bizAdd.primaryValue === '2026-10-08', 'Business Days add-days mode: Thu Oct 1 + 5 biz days = Thu Oct 8');

  const wc = getCalculatorSpec('word-counter')!.calculate({ text: 'One two three. Four five!' });
  assert(Number(wc.primaryOutput ?? wc.primaryValue) === 5, 'Word Counter tokenizes real textarea string accurately (5 words)');

  const sub31 = getCalculatorSpec('subnet-calculator')!.calculate({ ip: '10.0.0.0', cidr: 31 });
  const sub32 = getCalculatorSpec('subnet-calculator')!.calculate({ ip: '10.0.0.1', cidr: 32 });
  const sub0 = getCalculatorSpec('subnet-calculator')!.calculate({ ip: '0.0.0.0', cidr: 0 });
  assert(Number(sub31.primaryValue) === 2 && Number(sub32.primaryValue) === 1 && String(sub0.secondaryOutputs?.[3]?.value) === '0.0.0.0', 'Subnet Calculator handles /31 (RFC 3021), /32 host route, and /0 cleanly');

  const vatExtract = getCalculatorSpec('vat-calculator')!.calculate({ mode: 'extract', netPrice: 240, vatRate: 20 });
  assert(Number(vatExtract.primaryOutput ?? vatExtract.primaryValue) === 200, 'VAT extract mode: $240 gross @ 20% = $200 net ($40 VAT)');

  const salesExtract = getCalculatorSpec('sales-tax-calculator')!.calculate({ mode: 'extract', price: 162.38, rate: 8.25 });
  assert(Math.abs(Number(salesExtract.primaryOutput ?? salesExtract.primaryValue) - 150) < 0.02, 'Sales Tax extract mode: $162.38 gross @ 8.25% = $150.00 pre-tax');

  const macroKeto = getCalculatorSpec('macronutrient-calculator')!.calculate({ calories: 2000, dietPreset: 'keto' });
  assert(String(macroKeto.primaryValue).includes('25g C') && String(macroKeto.primaryValue).includes('125g P'), 'Macronutrient Keto preset maps 2,000 kcal (25% P / 5% C / 70% F) => 125g P / 25g C / 156g F');
}

// ----------------------------------------------------
// TEST GROUP 10: Batch 1 Expansion (24 Finance & Retirement Calculators + Regulatory Edge Cases)
// ----------------------------------------------------
console.log('\n🌐 Test Group 10: Batch 1 Validated Financial & Multi-Jurisdiction Retirement Benchmarks');

{
  // #1 50/30/20 Budget
  const b50 = getCalculatorSpec('budget-50-30-20-calculator')!.calculate({
    monthlyNetIncome: 6000, needsPercent: 50, wantsPercent: 30, savingsPercent: 20,
    actualNeeds: 3200, actualWants: 1650, actualSavings: 1150,
  });
  assert(Number(b50.primaryValue) === 1200, 'Batch 1 #1 50/30/20 Budget: $6,000 net => $1,200/mo savings target');
  const bErr = getCalculatorSpec('budget-50-30-20-calculator')!.calculate({
    monthlyNetIncome: 6000, needsPercent: 50, wantsPercent: 30, savingsPercent: 10,
  });
  assert(Boolean(bErr.error) && bErr.primaryValue === 'Error', 'Batch 1 #1 50/30/20 rejects percentages not summing to 100%');

  // #2 Emergency Fund
  const ef = getCalculatorSpec('emergency-fund-calculator')!.calculate({
    monthlyEssentialExpenses: 3500, targetMonths: 6, currentSavings: 7000, monthlyContribution: 600, annualApy: 4.0,
  });
  assert(Number(ef.primaryValue) === 21000 && Number(ef.secondaryOutputs?.[1]?.value) === 22, 'Batch 1 #2 Emergency Fund: $21k target reached in 22 months @ 4% APR');

  // #3 Net Worth
  const nw = getCalculatorSpec('net-worth-calculator')!.calculate({
    cashAndSavings: 18000, investmentsAndRetirement: 145000, realEstateValue: 420000, otherAssets: 17000,
    mortgageBalance: 285000, autoLoans: 18000, studentLoans: 12000, creditCardsAndOtherDebt: 5000,
  });
  assert(Number(nw.primaryValue) === 280000 && nw.secondaryOutputs?.[3]?.value === '$128,000.00', 'Batch 1 #3 Net Worth: $280k total & $128k liquid net worth');

  // #4 Savings Goal
  const sg = getCalculatorSpec('savings-goal-calculator')!.calculate({
    targetAmount: 50000, initialDeposit: 8000, years: 5, annualRate: 4.5, contributionFrequency: '12', compoundingFrequency: '12',
  });
  assert(Math.abs(Number(sg.primaryValue) - 595.51) < 0.02, 'Batch 1 #4 Savings Goal: $595.51/mo required ($8k → $50k in 5y @ 4.5%)');

  // #5 CD / Term Deposit
  const cdComp = getCalculatorSpec('cd-term-deposit-calculator')!.calculate({
    principal: 25000, nominalRate: 4.8, termMonths: 24, interestMethod: 'compound', compoundingFrequency: '12', marginalTaxRate: 22,
  });
  assert(Math.abs(Number(cdComp.primaryValue) - 27513.71) < 0.02 && cdComp.secondaryOutputs?.[4]?.value === '$27,400.00', 'Batch 1 #5 CD & Term Deposit: Compound $27,513.71 vs Simple $27,400.00');

  // #6 House Deposit
  const hd = getCalculatorSpec('house-deposit-savings-calculator')!.calculate({
    homePrice: 500000, depositPercent: 20, closingCostPercent: 3.0, currentSavings: 35000, monthlyContribution: 2000, annualRate: 4.2,
  });
  assert(Number(hd.primaryValue) === 115000 && String(hd.primaryUnit).includes('36 Months'), 'Batch 1 #6 House Deposit: $115k target in 36 months');

  // #7 Rent vs Buy
  const rvb = getCalculatorSpec('rent-vs-buy-calculator')!.calculate({
    homePrice: 450000, downPaymentPercent: 20, mortgageRate: 6.25, loanTermYears: 30, monthlyRent: 2400, horizonYears: 7, investmentReturnRate: 6.5,
  });
  assert(Math.abs(Number(rvb.primaryValue) - (-17598.93)) < 0.05 && rvb.secondaryOutputs?.[0]?.value === '$214,053.20', 'Batch 1 #7 Rent vs Buy Yr 7: Buy Equity $214,053.20 vs Renter $231,652.13 = -$17,598.93');

  // #8 Cost of Living Comparison
  const col = getCalculatorSpec('cost-of-living-comparison-calculator')!.calculate({
    currentSalary: 85000, comparisonMode: 'weighted_categories', housingIndex: 145, groceriesIndex: 120, transportIndex: 115, utilitiesIndex: 110, otherIndex: 115,
  });
  assert(Math.abs(Number(col.primaryValue) - 106887.5) < 0.05, 'Batch 1 #8 Cost of Living: Composite 125.75 => $106,887.50 equivalent salary');

  // #9 Subscription Audit
  const subAud = getCalculatorSpec('subscription-audit-calculator')!.calculate({
    streamingMonthly: 15.49, musicMonthly: 11.99, gymMonthly: 45.0, cloudMonthly: 9.99, annualSubscriptionsTotal: 238,
  });
  assert(Math.abs(Number(subAud.primaryValue) - 1227.64) < 0.05 && subAud.secondaryOutputs?.[2]?.value === '$7,324.19', 'Batch 1 #9 Subscription Audit: $1,227.64/yr spend & $7,324.19 5-yr opportunity cost');

  // #10 Sinking Fund
  const sf = getCalculatorSpec('sinking-fund-calculator')!.calculate({
    fund1Target: 1200, fund1Months: 8, fund2Target: 1800, fund2Months: 10, fund3Target: 1500, fund3Months: 6, fund4Target: 3000, fund4Months: 12, annualApy: 4.0,
  });
  assert(Math.abs(Number(sf.primaryValue) - 818.95) < 0.05 && sf.secondaryOutputs?.[1]?.value === '$830.00', 'Batch 1 #10 Sinking Fund: $818.95/mo @ 4% vs $830.00/mo @ 0%');

  // #11 Childcare Cost Impact
  const cc = getCalculatorSpec('childcare-cost-impact-calculator')!.calculate({
    grossSalary: 62000, effectiveTaxAndPayrollRate: 24, annualWorkExpenses: 3600, annualChildcareCost: 18000, annualChildcareSubsidyOrCredit: 2000,
  });
  assert(Number(cc.primaryValue) === 27520 && cc.secondaryOutputs?.[4]?.value === '$13.76', 'Batch 1 #11 Childcare Impact: $27,520/yr net gain ($13.76/hr)');

  // #12 Wedding Budget
  const wb = getCalculatorSpec('wedding-budget-calculator')!.calculate({
    totalBudget: 32000, guestCount: 120, currentSavings: 12000, familyContribution: 6000, monthsUntilWedding: 14,
  });
  assert(Number(wb.primaryValue) === 1000 && wb.secondaryOutputs?.[1]?.value === '$266.67', 'Batch 1 #12 Wedding Budget: $1,000/mo gap savings & $266.67/guest');

  // #13 Roth IRA vs Traditional IRA (2026 IRS Notice 2025-67 combined limit + phaseout)
  const iraDef = getCalculatorSpec('roth-ira-vs-traditional-ira-calculator')!.calculate({
    age: 35, retirementAge: 65, filingStatus: 'single', magi: 110000, earnedIncome: 110000, requestedContribution: 7500, workplacePlan: 'none', expectedReturnRate: 7.0, currentMarginalTaxRate: 22, retirementTaxRate: 15,
  });
  assert(Math.abs(Number(iraDef.primaryValue) - 742093.77) < 0.5 && iraDef.secondaryOutputs?.[1]?.value === '$708,455.90', 'Batch 1 #13 IRA 2026: Combined $7,500 cap => $742,093.77 Trad+Side vs $708,455.90 Roth');
  const iraPhased50 = getCalculatorSpec('roth-ira-vs-traditional-ira-calculator')!.calculate({
    age: 52, retirementAge: 65, filingStatus: 'single', magi: 170000, earnedIncome: 170000, requestedContribution: 8600, workplacePlan: 'covered', expectedReturnRate: 7.0, currentMarginalTaxRate: 24, retirementTaxRate: 22,
  });
  assert(iraPhased50.secondaryOutputs?.[0]?.value === '$8,600.00' && iraPhased50.secondaryOutputs?.[6]?.value === '$0.00', 'Batch 1 #13 IRA 2026 Age 50+ $8,600 cap & Single $170k Roth MAGI phase-out = $0');

  // #14 FIRE Retirement
  const fire = getCalculatorSpec('fire-retirement-calculator')!.calculate({
    currentAge: 32, currentPortfolio: 120000, annualExpenses: 55000, monthlySavings: 2500, nominalReturnRate: 8.0, feeAndTaxDragRate: 0.5, inflationRate: 2.5, safeWithdrawalRate: 4.0,
  });
  assert(Number(fire.primaryValue) === 1375000 && Number(fire.secondaryOutputs?.[0]?.value) === 20.91, 'Batch 1 #14 FIRE: $1,375,000 target in 20.91 years (Fisher real return)');

  // #15 Australian Superannuation (ATO FY 2026-27)
  const sup = getCalculatorSpec('superannuation-calculator')!.calculate({
    currentAge: 35, retirementAge: 67, currentBalance: 85000, annualSalary: 110000, sgRate: 12.0, salarySacrificeAnnual: 5000,
  });
  assert(Math.abs(Number(sup.primaryValue) - 1067014.79) < 1.0 && sup.secondaryOutputs?.[4]?.value === 'A$0.00', 'Batch 1 #15 AU Super FY 2026-27: A$1,067,014.79 real balance & $0 Div 293');
  const supDiv293 = getCalculatorSpec('superannuation-calculator')!.calculate({
    currentAge: 40, retirementAge: 67, currentBalance: 300000, annualSalary: 280000, sgRate: 12.0, salarySacrificeAnnual: 0,
  });
  assert(supDiv293.secondaryOutputs?.[1]?.value === 'A$32,499.60' && supDiv293.secondaryOutputs?.[4]?.value === 'A$4,874.94', 'Batch 1 #15 AU Super FY 2026-27 enforces Max Base A$270,830 & 15% Div 293 surcharge');

  // #16 UK Pension Drawdown (HMRC 2026-27)
  const ukp = getCalculatorSpec('uk-pension-drawdown-calculator')!.calculate({
    currentAge: 55, retirementAge: 65, currentPot: 280000, annualContribution: 12000, preRetirementReturn: 6.0, postRetirementReturn: 4.5, takeTaxFreeLumpSum: 'yes', annualSpendingTarget: 26000,
  });
  assert(Math.abs(Number(ukp.primaryValue) - 494705.17) < 0.5 && ukp.secondaryOutputs?.[1]?.value === '£164,901.72', 'Batch 1 #16 UK Pension 2026-27: £494,705.17 drawdown pot & £164,901.72 tax-free PCLS');
  const ukLsaCap = getCalculatorSpec('uk-pension-drawdown-calculator')!.calculate({
    currentAge: 65, retirementAge: 65, currentPot: 1500000, annualContribution: 0, preRetirementReturn: 5.0, postRetirementReturn: 4.0, takeTaxFreeLumpSum: 'yes', annualSpendingTarget: 50000,
  });
  assert(ukLsaCap.secondaryOutputs?.[1]?.value === '£268,275.00', 'Batch 1 #16 UK Pension caps PCLS strictly at £268,275 LSA on £1.5M pot');

  // #17 Canada RRSP vs TFSA (CRA 2026)
  const caReinv = getCalculatorSpec('canada-rrsp-tfsa-calculator')!.calculate({
    preTaxAllocation: 10000, years: 25, annualReturnRate: 6.5, currentMarginalTaxRate: 40, retirementMarginalTaxRate: 25, reinvestRrspRefund: 'yes',
  });
  assert(Math.abs(Number(caReinv.primaryValue) - 36207.74) < 0.5 && caReinv.secondaryOutputs?.[0]?.value === 'C$28,966.19', 'Batch 1 #17 Canada RRSP vs TFSA: C$36,207.74 RRSP (reinvested) vs C$28,966.19 TFSA');
  const caSpent = getCalculatorSpec('canada-rrsp-tfsa-calculator')!.calculate({
    preTaxAllocation: 10000, years: 25, annualReturnRate: 6.5, currentMarginalTaxRate: 40, retirementMarginalTaxRate: 25, reinvestRrspRefund: 'no',
  });
  assert(caSpent.secondaryOutputs?.[1]?.value === 'C$21,724.65', 'Batch 1 #17 Canada RRSP (spent refund) drops to C$21,724.65 behind TFSA');

  // #18 CAGR (Multiplicative fee verified)
  const cagr = getCalculatorSpec('cagr-calculator')!.calculate({
    initialValue: 10000, finalValue: 24500, years: 8, annualFeePercent: 0.75, capitalGainsTaxRate: 15,
  });
  assert(Math.abs(Number(cagr.primaryValue) - 11.8525) < 0.001 && cagr.secondaryOutputs?.[3]?.value === '$23,068.01' && cagr.secondaryOutputs?.[4]?.value === '$21,107.81', 'Batch 1 #18 CAGR: 11.8525% Gross & $24,500*(1-0.0075)^8 = $23,068.01 After-Fee');

  // #19 DRIP (Monthly buy + quarterly dividends)
  const drip = getCalculatorSpec('dividend-reinvestment-drip-calculator')!.calculate({
    initialShares: 200, sharePrice: 50, monthlyContribution: 250, annualDividendYield: 3.6, years: 15,
  });
  assert(Math.abs(Number(drip.primaryValue) - 116934.76) < 0.5 && drip.secondaryOutputs?.[0]?.value === '$105,434.75', 'Batch 1 #19 DRIP: $116,934.76 DRIP vs $105,434.75 No-DRIP (+$11,500.01)');

  // #20 DCA (+8% positive & -10% negative return stress test)
  const dca = getCalculatorSpec('dollar-cost-averaging-calculator')!.calculate({
    periodicAmount: 500, frequency: '12', months: 24, expectedAnnualReturn: 8.0, annualFeePercent: 0.25, capitalGainsTaxRate: 15,
  });
  assert(Math.abs(Number(dca.primaryValue) - 12899.45) < 0.05 && dca.secondaryOutputs?.[0]?.value === '$12,764.53', 'Batch 1 #20 DCA: $12,899.45 pre-tax / $12,764.53 after 15% tax');
  const dcaNeg = getCalculatorSpec('dollar-cost-averaging-calculator')!.calculate({
    periodicAmount: 500, frequency: '12', months: 12, expectedAnnualReturn: -10, annualFeePercent: 0, capitalGainsTaxRate: 15,
  });
  assert(Math.abs(Number(dcaNeg.primaryValue) - 5719.77) < 0.05 && dcaNeg.secondaryOutputs?.[0]?.value === '$5,719.77', 'Batch 1 #20 DCA (-10% loss stress test): $5,719.77 with $0 gain tax');

  // #21 Stock Position Size (Long & Short)
  const posLong = getCalculatorSpec('stock-position-size-risk-calculator')!.calculate({
    accountBalance: 50000, riskPercent: 1.5, entryPrice: 48, stopLossPrice: 44.5, targetPrice: 58.5, entryCommission: 5, exitCommission: 5,
  });
  assert(Number(posLong.primaryValue) === 211 && posLong.secondaryOutputs?.[5]?.value === '3R', 'Batch 1 #21 Position Size (Long): 211 shares after $10 round-trip fees (3.00R)');
  const posShort = getCalculatorSpec('stock-position-size-risk-calculator')!.calculate({
    accountBalance: 50000, riskPercent: 1.0, entryPrice: 40, stopLossPrice: 42.5, targetPrice: 35, entryCommission: 5, exitCommission: 5,
  });
  assert(Number(posShort.primaryValue) === 196 && String(posShort.primaryUnit).includes('Short'), 'Batch 1 #21 Position Size (Short): 196 shares cleanly handled');

  // #22 Real Rate of Return (Annual Drag vs Exit Realization)
  const realAnn = getCalculatorSpec('real-rate-of-return-calculator')!.calculate({
    nominalReturnRate: 8.0, inflationRate: 3.2, taxRate: 22, taxTimingMode: 'annual_drag', investmentAmount: 50000, years: 10,
  });
  const realExit = getCalculatorSpec('real-rate-of-return-calculator')!.calculate({
    nominalReturnRate: 8.0, inflationRate: 3.2, taxRate: 22, taxTimingMode: 'realization_exit', investmentAmount: 50000, years: 10,
  });
  assert(Math.abs(Number(realAnn.primaryValue) - 2.9457) < 0.005 && Math.abs(Number(realExit.primaryValue) - 3.3442) < 0.005, 'Batch 1 #22 Real Return: Annual Tax Drag 2.9457% ($66,842.65) vs Deferred Exit 3.3442% ($69,475.42)');

  // #23 RMD (IRS Pub 590-B Table III & Roth 401k Exemption)
  const rmdTrad = getCalculatorSpec('rmd-calculator')!.calculate({
    priorYearEndBalance: 650000, birthYear: 1952, distributionYear: 2026, accountType: 'traditional',
  });
  assert(Math.abs(Number(rmdTrad.primaryValue) - 25490.2) < 0.05 && Number(rmdTrad.secondaryOutputs?.[1]?.value) === 25.5, 'Batch 1 #23 RMD 2026 Age 74: $650,000 / 25.5 = $25,490.20');
  const rmdRoth401k = getCalculatorSpec('rmd-calculator')!.calculate({
    priorYearEndBalance: 650000, birthYear: 1952, distributionYear: 2026, accountType: 'roth_401k',
  });
  assert(Number(rmdRoth401k.primaryValue) === 0, 'Batch 1 #23 RMD Designated Roth 401(k) lifetime exempt = $0.00');

  // #24 Rental Property Cash Flow
  const rentCf = getCalculatorSpec('rental-property-cash-flow-calculator')!.calculate({
    purchasePrice: 360000, downPaymentPercent: 20, closingAndRehabCosts: 10800, mortgageRate: 6.5, loanTermYears: 30, monthlyGrossRent: 2850,
  });
  assert(Math.abs(Number(rentCf.primaryValue) - (-162.79)) < 0.05 && rentCf.secondaryOutputs?.[1]?.value === '$19,890.80' && rentCf.secondaryOutputs?.[4]?.value === '0.91x', 'Batch 1 #24 Rental Cash Flow: -$162.79/mo, NOI $19,890.80, DSCR 0.91x');
}

// ----------------------------------------------------
// TEST GROUP 11: Batch 2 Expansion (25 Debt/Mortgage & Multi-Country Tax/Business Calculators)
// ----------------------------------------------------
console.log('\n💼 Test Group 11: Batch 2 Debt, Mortgage, Multi-Jurisdiction Tax & Corporate Finance Benchmarks');

{
  // #501 Debt Snowball vs Avalanche
  const debtPlan = getCalculatorSpec('debt-snowball-avalanche-calculator')!.calculate({
    debt1Balance: 4500, debt1Apr: 22.9, debt1Min: 135,
    debt2Balance: 8200, debt2Apr: 11.5, debt2Min: 220,
    debt3Balance: 2100, debt3Apr: 16.5, debt3Min: 75,
    debt4Balance: 12000, debt4Apr: 6.2, debt4Min: 170,
    extraMonthlyPayment: 300,
  });
  assert(Math.abs(Number(debtPlan.primaryValue) - 4481.93) < 0.05 && debtPlan.secondaryOutputs?.[2]?.value === '34 mos' && debtPlan.secondaryOutputs?.[4]?.value === '35 mos', 'Batch 2 #501 Snowball vs Avalanche: $4,481.93 saved (34m Av vs 35m SB)');

  // #502 Mortgage Refinance
  const refi = getCalculatorSpec('mortgage-refinance-calculator')!.calculate({
    currentBalance: 320000, currentRate: 7.125, remainingMonths: 324, newRate: 5.75, newTermYears: 30, closingCosts: 6400, rollClosingCosts: 'upfront', expectedHoldYears: 7,
  });
  assert(Math.abs(Number(refi.primaryValue) - 359.72) < 0.05 && String(refi.secondaryOutputs?.[2]?.value).startsWith('18 mos') && refi.secondaryOutputs?.[3]?.value === '$22,772.32', 'Batch 2 #502 Mortgage Refinance: $359.72/mo saved, 18 mos break-even, +$22,772.32 7-yr benefit');

  // #503 HELOC Calculator
  const heloc = getCalculatorSpec('heloc-calculator')!.calculate({
    homeValue: 550000, existingMortgageBalance: 290000, helocDrawAmount: 85000, helocApr: 8.25, drawPeriodYears: 10, repaymentPeriodYears: 20, maxLenderCltvPct: 85,
  });
  assert(Math.abs(Number(heloc.primaryValue) - 724.26) < 0.05 && heloc.secondaryOutputs?.[0]?.value === '$584.38' && Number(heloc.secondaryOutputs?.[2]?.value) === 68.18, 'Batch 2 #503 HELOC: $724.26/mo repay vs $584.38/mo draw, 68.18% CLTV');

  // #504 Mortgage Payoff Extra Payment
  const payoff = getCalculatorSpec('mortgage-payoff-extra-payment-calculator')!.calculate({
    loanBalance: 350000, interestRate: 6.5, remainingYears: 25, extraMonthly: 350, annualLumpSum: 0, oneTimeLumpSum: 0, biweeklyMode: 'no',
  });
  assert(Math.abs(Number(payoff.primaryValue) - 106369.81) < 0.1 && payoff.secondaryOutputs?.[4]?.value === '6y 5m', 'Batch 2 #504 Mortgage Payoff: $106,369.81 interest saved, 6y 5m (77 mos) shaved');
  const payoffBw = getCalculatorSpec('mortgage-payoff-extra-payment-calculator')!.calculate({
    loanBalance: 350000, interestRate: 6.5, remainingYears: 25, extraMonthly: 0, annualLumpSum: 0, oneTimeLumpSum: 0, biweeklyMode: 'yes',
  });
  assert(Number(payoffBw.primaryValue) > 50000 && String(payoffBw.primaryUnit).includes('Months Shaved'), 'Batch 2 #504 Mortgage Payoff bi-weekly mode accelerates amortization');

  // #505 Home Affordability & DTI (Piecewise 80% LTV PMI Cliff Verification)
  const afford = getCalculatorSpec('home-affordability-dti-calculator')!.calculate({
    annualGrossIncome: 135000, monthlyDebts: 650, downPaymentCash: 90000, mortgageRate: 6.5, loanTermYears: 30, propertyTaxRate: 1.2, homeInsuranceAnnual: 1800, hoaMonthly: 150, frontDtiPct: 28, backDtiPct: 36,
  });
  assert(Math.abs(Number(afford.primaryValue) - 450000) < 0.05 && Number(afford.secondaryOutputs?.[5]?.value) === 80 && Number(afford.secondaryOutputs?.[6]?.value) === 32.7, 'Batch 2 #505 Home Affordability DTI: $450,000 max price @ exact 80.0% LTV (32.7% post-purchase DTI)');

  // #506 ARM Mortgage Calculator
  const arm = getCalculatorSpec('arm-mortgage-calculator')!.calculate({
    loanAmount: 400000, loanTermYears: 30, initialFixedYears: 5, initialRate: 5.5, expectedIndexPlusMargin: 7.25, initialResetCap: 2.0, periodicCap: 2.0, lifetimeCap: 5.0,
  });
  assert(Math.abs(Number(arm.primaryValue) - 2271.16) < 0.05 && arm.secondaryOutputs?.[0]?.value === '$2,673.25' && arm.secondaryOutputs?.[3]?.value === '$3,466.97', 'Batch 2 #506 ARM Mortgage: $2,271.16 initial → $2,673.25 Yr 6 expected → $3,466.97 max cap');

  // #507 UK Stamp Duty (SDLT 2026-27 + £500k vs £500,001 FTB Cliff & Additional + Non-Res Surcharge)
  const sdltStd = getCalculatorSpec('uk-stamp-duty-calculator')!.calculate({ propertyPrice: 425000, buyerType: 'standard', nonUkResident: 'no' });
  assert(Number(sdltStd.primaryValue) === 11250 && Number(sdltStd.secondaryOutputs?.[0]?.value) === 2.65, 'Batch 2 #507 UK SDLT Standard £425k = £11,250 (2.65%)');
  const sdltFtb500 = getCalculatorSpec('uk-stamp-duty-calculator')!.calculate({ propertyPrice: 500000, buyerType: 'ftb', nonUkResident: 'no' });
  const sdltFtb501 = getCalculatorSpec('uk-stamp-duty-calculator')!.calculate({ propertyPrice: 500001, buyerType: 'ftb', nonUkResident: 'no' });
  assert(Number(sdltFtb500.primaryValue) === 10000 && Number(sdltFtb501.primaryValue) > 15000, 'Batch 2 #507 UK SDLT enforces £500k FTB Relief cliff (£10,000 vs £15,000+)');
  const sdltNonResAdd = getCalculatorSpec('uk-stamp-duty-calculator')!.calculate({ propertyPrice: 400000, buyerType: 'additional', nonUkResident: 'yes' });
  assert(Number(sdltNonResAdd.primaryValue) === 10000 + 400000 * 0.07, 'Batch 2 #507 UK SDLT stacks +5% additional & +2% non-UK resident surcharge accurately');

  // #508 Debt Consolidation & TILA Effective APR
  const cons = getCalculatorSpec('debt-consolidation-calculator')!.calculate({
    debt1Balance: 9500, debt1Apr: 23.9, debt1Monthly: 295,
    debt2Balance: 6500, debt2Apr: 19.5, debt2Monthly: 190,
    debt3Balance: 4000, debt3Apr: 14.0, debt3Monthly: 115,
    newLoanApr: 10.5, newLoanTermMonths: 48, originationFeePct: 4.0,
  });
  assert(Math.abs(Number(cons.primaryValue) - 533.4) < 0.05 && Math.abs(Number(cons.secondaryOutputs?.[1]?.value) - 12.68) < 0.05 && cons.secondaryOutputs?.[6]?.value === '$4,466.31', 'Batch 2 #508 Debt Consolidation: $533.40/mo, 12.68% Eff APR, $4,466.31 savings');

  // #509 Lease vs Buy Car
  const lvb = getCalculatorSpec('lease-vs-buy-car-calculator')!.calculate({
    vehiclePrice: 40000, horizonMonths: 36, salesTaxRate: 7.0, residualPercent: 58, leaseDownPayment: 2500, leaseMoneyFactor: 0.0025, leaseFeesTotal: 1095, buyDownPayment: 5000, buyLoanApr: 6.25, buyLoanTermMonths: 60,
  });
  assert(Math.abs(Number(lvb.primaryValue) - 24812.28) < 0.05 && lvb.secondaryOutputs?.[3]?.value === '$24,916.41' && Number(lvb.secondaryOutputs?.[2]?.value) === 6.0, 'Batch 2 #509 Lease vs Buy: $24,812.28 Buy vs $24,916.41 Lease (6.00% MF APR)');

  // #510 Business Loan & SBA DSCR
  const biz = getCalculatorSpec('business-loan-calculator')!.calculate({
    loanAmount: 250000, interestRate: 8.75, loanTermMonths: 120, originationGuaranteeFeePct: 2.5, flatClosingFees: 1500, annualEbitda: 95000,
  });
  assert(Math.abs(Number(biz.primaryValue) - 3133.17) < 0.05 && biz.secondaryOutputs?.[0]?.value === '$242,250.00' && Number(biz.secondaryOutputs?.[1]?.value) === 9.49 && biz.secondaryOutputs?.[6]?.value === '2.53x', 'Batch 2 #510 Business Loan: $3,133.17/mo, $242,250 proceeds, 9.49% Eff APR, 2.53x DSCR');

  // #511 Loan Points & Effective APR
  const pts = getCalculatorSpec('loan-apr-points-calculator')!.calculate({
    loanAmount: 400000, loanTermYears: 30, baseInterestRate: 6.75, buydownRate: 6.125, discountPoints: 2.0, lenderOriginationFees: 1800,
  });
  assert(Math.abs(Number(pts.primaryValue) - 6.36) < 0.01 && Math.abs(Number(pts.secondaryOutputs?.[0]?.value) - 6.794) < 0.01 && String(pts.secondaryOutputs?.[5]?.value).startsWith('49 mos'), 'Batch 2 #511 Mortgage Points APR: 6.360% vs Par 6.794% (49 mos break-even)');

  // #512 Balloon Loan
  const balLoan = getCalculatorSpec('balloon-loan-calculator')!.calculate({
    loanAmount: 300000, interestRate: 6.75, amortizationYears: 30, balloonDueYears: 5, refinanceRateAssume: 7.5,
  });
  assert(Math.abs(Number(balLoan.primaryValue) - 281627.13) < 0.05 && balLoan.secondaryOutputs?.[0]?.value === '$1,945.79' && balLoan.secondaryOutputs?.[4]?.value === '$2,081.20', 'Batch 2 #512 Balloon Loan: $281,627.13 lump sum ($1,945.79/mo P&I, $2,081.20/mo refi)');

  // #513 US Capital Gains Tax & NIIT (2026 IRS Rev. Proc. 2025-32)
  const capG = getCalculatorSpec('capital-gains-tax-calculator')!.calculate({
    ordinaryIncome: 95000, shortTermGain: 5000, longTermGain: 65000, filingStatus: 'single', stateCapGainsRate: 5.0,
  });
  assert(Number(capG.primaryValue) === 14350 && capG.secondaryOutputs?.[2]?.value === '$9,750.00' && capG.secondaryOutputs?.[4]?.value === '$0.00', 'Batch 2 #513 Capital Gains 2026: $14,350 total ($9,750 LTCG + $1,100 STG + $0 NIIT + $3,500 state)');
  const capZeroNiit = getCalculatorSpec('capital-gains-tax-calculator')!.calculate({
    ordinaryIncome: 50000, shortTermGain: 0, longTermGain: 40000, filingStatus: 'mfj', stateCapGainsRate: 0,
  });
  assert(Number(capZeroNiit.primaryValue) === 0, 'Batch 2 #513 Capital Gains 2026 MFJ ($50k ord + $40k LTCG < $98.9k tier + $32.2k std ded) = $0 federal tax');
  const capHighNiit = getCalculatorSpec('capital-gains-tax-calculator')!.calculate({
    ordinaryIncome: 190000, shortTermGain: 0, longTermGain: 100000, filingStatus: 'single', stateCapGainsRate: 0,
  });
  assert(capHighNiit.secondaryOutputs?.[4]?.value === '$3,420.00', 'Batch 2 #513 Capital Gains 2026 Single $290k MAGI triggers 3.8% NIIT on $90k excess ($3,420.00)');

  // #514 UK Take-Home Pay (2026-27 HMRC + £100k PA Taper & Scotland)
  const ukPay = getCalculatorSpec('uk-take-home-pay-calculator')!.calculate({
    grossAnnualSalary: 55000, ukRegion: 'ewni', pensionContribPct: 5, studentLoanPlan: 'plan2',
  });
  assert(Math.abs(Number(ukPay.primaryValue) - 3233.71) < 0.05 && ukPay.secondaryOutputs?.[2]?.value === '£8,332.00' && ukPay.secondaryOutputs?.[3]?.value === '£3,055.60', 'Batch 2 #514 UK Take-Home 2026-27: £3,233.71/mo (PAYE £8,332, NI £3,055.60, SL £2,057.85)');
  const ukTaperScot = getCalculatorSpec('uk-take-home-pay-calculator')!.calculate({
    grossAnnualSalary: 115000, ukRegion: 'scotland', pensionContribPct: 0, studentLoanPlan: 'none',
  });
  assert(ukTaperScot.secondaryOutputs?.[6]?.value === '£5,070.00' && Number(ukTaperScot.primaryValue) > 0, 'Batch 2 #514 UK Take-Home £115k PA tapers by £7,500 to £5,070.00 & Scottish 6-band executes');

  // #515 Canada Income Tax (2026 CRA + QC Abatement + BPA Taper)
  const caPay = getCalculatorSpec('canada-income-tax-calculator')!.calculate({
    grossAnnualIncome: 95000, province: 'ON', rrspContribution: 5000,
  });
  assert(Math.abs(Number(caPay.primaryValue) - 67871.56) < 0.1 && caPay.secondaryOutputs?.[3]?.value === 'C$4,646.45' && caPay.secondaryOutputs?.[4]?.value === 'C$1,123.07', 'Batch 2 #515 Canada 2026 ON: C$67,871.56/yr net (CPP+CPP2 C$4,646.45, EI C$1,123.07)');
  const caQcHigh = getCalculatorSpec('canada-income-tax-calculator')!.calculate({
    grossAnnualIncome: 260000, province: 'QC', rrspContribution: 0,
  });
  assert(caQcHigh.secondaryOutputs?.[5]?.value === 'C$14,829.00', 'Batch 2 #515 Canada 2026 QC high earner floors Federal BPA at C$14,829.00 & applies 16.5% QC abatement');

  // #516 Australia Income Tax (FY 2026-27 ATO + Marginal HELP + MLS)
  const auPay = getCalculatorSpec('australia-income-tax-calculator')!.calculate({
    grossAnnualSalary: 115000, salarySacrificeSuper: 0, hasHelpDebt: 'yes', privateHospitalCover: 'yes',
  });
  assert(Math.abs(Number(auPay.primaryValue) - 80859.2) < 0.1 && auPay.secondaryOutputs?.[2]?.value === 'A$25,020.00' && auPay.secondaryOutputs?.[4]?.value === 'A$6,820.80', 'Batch 2 #516 Australia FY 2026-27: A$80,859.20/yr net (Tax A$25,020, Marginal HELP A$6,820.80)');
  const auMls = getCalculatorSpec('australia-income-tax-calculator')!.calculate({
    grossAnnualSalary: 150000, salarySacrificeSuper: 10000, hasHelpDebt: 'yes', privateHospitalCover: 'no',
  });
  assert(auMls.secondaryOutputs?.[3]?.value === 'A$4,675.00', 'Batch 2 #516 Australia FY 2026-27 adds back super sacrifice to assess 1.25% MLS (A$1,875) + 2% Medicare (A$2,800)');

  // #517 New Zealand PAYE (2026-27 IRD + ACC Max Cap NZ$156,641)
  const nzPay = getCalculatorSpec('nz-paye-calculator')!.calculate({
    grossAnnualSalary: 85000, kiwisaverRate: '3', hasStudentLoan: 'yes',
  });
  assert(Math.abs(Number(nzPay.primaryValue) - 55730.36) < 0.1 && nzPay.secondaryOutputs?.[3]?.value === 'NZ$1,487.50' && nzPay.secondaryOutputs?.[5]?.value === 'NZ$7,304.64', 'Batch 2 #517 NZ PAYE 2026-27: NZ$55,730.36/yr net (ACC NZ$1,487.50, SL NZ$7,304.64)');
  const nzAccCap = getCalculatorSpec('nz-paye-calculator')!.calculate({
    grossAnnualSalary: 220000, kiwisaverRate: '0', hasStudentLoan: 'no',
  });
  assert(nzAccCap.secondaryOutputs?.[3]?.value === 'NZ$2,741.22', 'Batch 2 #517 NZ PAYE 2026-27 enforces ACC Earners Levy max cap at NZ$2,741.22 (1.75% × NZ$156,641)');

  // #518 Self-Employment Tax (2026 $184,500 SS Cap + W-2 Coordination)
  const seTax = getCalculatorSpec('self-employment-tax-calculator')!.calculate({
    netBusinessProfit: 110000, w2Wages: 0, filingStatus: 'single', qbiEligible: 'yes', stateTaxRate: 4.5,
  });
  assert(Math.abs(Number(seTax.primaryValue) - 7503.36) < 0.05 && seTax.secondaryOutputs?.[2]?.value === '$15,542.51' && seTax.secondaryOutputs?.[4]?.value === '$17,225.75', 'Batch 2 #518 Self-Employment 2026: $7,503.36/qtr (SE $15,542.51, QBI $17,225.75)');
  const seW2Maxed = getCalculatorSpec('self-employment-tax-calculator')!.calculate({
    netBusinessProfit: 50000, w2Wages: 190000, filingStatus: 'single', qbiEligible: 'no', stateTaxRate: 0,
  });
  assert(seW2Maxed.secondaryOutputs?.[2]?.value === '$1,664.65', 'Batch 2 #518 Self-Employment coordinates W-2 > $184,500 cap (0% SS, 2.9% Med + 0.9% AddMed > $200k)');

  // #519 Freelance Hourly Rate
  const freeRate = getCalculatorSpec('freelance-rate-calculator')!.calculate({
    targetNetIncome: 90000, annualOverhead: 14000, effectiveTaxReservePct: 28, weeksOffPerYear: 4, hoursPerWeek: 40, billableUtilizationPct: 70,
  });
  assert(Math.abs(Number(freeRate.primaryValue) - 103.42) < 0.05 && freeRate.secondaryOutputs?.[0]?.value === '$827.38' && freeRate.secondaryOutputs?.[1]?.value === '$139,000.00', 'Batch 2 #519 Freelance Rate: $103.42/hr ($827.38/day, $139k rev / 1,344 billable hrs)');

  // #520 Overtime & Bonus Paycheck
  const otPay = getCalculatorSpec('overtime-bonus-paycheck-calculator')!.calculate({
    hourlyRate: 36, regularHours: 80, overtimeHours15x: 12, doubleTimeHours2x: 0, cashBonus: 1500, fedRegularTaxPct: 15, stateLocalTaxPct: 4.5,
  });
  assert(Math.abs(Number(otPay.primaryValue) - 3557.9) < 0.05 && otPay.secondaryOutputs?.[0]?.value === '$5,028.00' && otPay.secondaryOutputs?.[3]?.value === '$330.00', 'Batch 2 #520 Overtime & Bonus: $3,557.90 net ($5,028 gross, $330 IRS 22% flat bonus tax)');

  // #521 Employer Payroll Burden
  const empCost = getCalculatorSpec('employer-payroll-cost-calculator')!.calculate({
    baseAnnualSalary: 80000, employerMatchPct: 4.0, healthBenefitsAnnual: 7200, sutaRatePct: 2.7, sutaWageBase: 14000, workersCompAndOtherPct: 1.5,
  });
  assert(Math.abs(Number(empCost.primaryValue) - 98140) < 0.05 && empCost.secondaryOutputs?.[1]?.value === '1.227x' && empCost.secondaryOutputs?.[3]?.value === '$6,120.00', 'Batch 2 #521 Employer Burden 2026: $98,140.00/yr (1.227x multiplier, $6,120 Emp FICA)');

  // #522 SaaS LTV:CAC & Rule of 40
  const saas = getCalculatorSpec('saas-ltv-cac-calculator')!.calculate({
    arpaMonthly: 250, grossMarginPct: 80, monthlyChurnPct: 2.5, cac: 1800, revenueGrowthYoY: 35, ebitdaMarginPct: 10,
  });
  assert(Math.abs(Number(saas.primaryValue) - 4.44) < 0.02 && saas.secondaryOutputs?.[0]?.value === '$8,000.00' && Number(saas.secondaryOutputs?.[1]?.value) === 9 && saas.secondaryOutputs?.[5]?.value === '45%', 'Batch 2 #522 SaaS Unit Economics: 4.44x LTV:CAC ($8,000 LTV, 9m payback, 45% Rule of 40)');

  // #523 NPV, IRR & Payback
  const npv = getCalculatorSpec('npv-irr-calculator')!.calculate({
    initialInvestment: 100000, discountRatePct: 10, cf1: 28000, cf2: 34000, cf3: 38000, cf4: 40000, cf5: 42000,
  });
  assert(Math.abs(Number(npv.primaryValue) - 35502.92) < 0.1 && Math.abs(Number(npv.secondaryOutputs?.[0]?.value) - 22.14) < 0.05 && npv.secondaryOutputs?.[1]?.value === '1.355x', 'Batch 2 #523 NPV & IRR: $35,502.92 NPV, 22.14% IRR, 1.355x PI');

  // #524 Bond Yield to Maturity & Duration
  const bond = getCalculatorSpec('bond-yield-calculator')!.calculate({
    faceValue: 1000, currentPrice: 940, couponRatePct: 5.0, yearsToMaturity: 10, couponFrequency: '2', marginalTaxRatePct: 24,
  });
  assert(Math.abs(Number(bond.primaryValue) - 5.799) < 0.01 && Math.abs(Number(bond.secondaryOutputs?.[0]?.value) - 5.319) < 0.01 && Math.abs(Number(bond.secondaryOutputs?.[2]?.value) - 7.91) < 0.05, 'Batch 2 #524 Bond YTM: 5.799% YTM, 5.319% Current Yield, 7.91y MacDur');

  // #525 Tax-Loss Harvesting (IRS §1211 $3k / $1.5k MFS ordering)
  const tlh = getCalculatorSpec('tax-loss-harvesting-calculator')!.calculate({
    harvestedLoss: 18000, shortTermGains: 6000, longTermGains: 5000, ordinaryMarginalRate: 24, ltcgTaxRate: 15, isMarriedSeparate: 'no',
  });
  assert(Number(tlh.primaryValue) === 2910 && tlh.secondaryOutputs?.[3]?.value === '$4,000.00', 'Batch 2 #525 Tax-Loss Harvesting: $2,910.00 tax saved + $4,000.00 carryforward');
  const tlhMfs = getCalculatorSpec('tax-loss-harvesting-calculator')!.calculate({
    harvestedLoss: 18000, shortTermGains: 6000, longTermGains: 5000, ordinaryMarginalRate: 24, ltcgTaxRate: 15, isMarriedSeparate: 'yes',
  });
  assert(Number(tlhMfs.primaryValue) === 2550 && tlhMfs.secondaryOutputs?.[3]?.value === '$5,500.00', 'Batch 2 #525 Tax-Loss Harvesting MFS enforces $1,500 ordinary offset cap ($2,550 saved, $5,500 fwd)');
}

// ----------------------------------------------------
// TEST GROUP 12: Batch 3 Health, Engineering, Stats, Math & Science (#526–#550)
// ----------------------------------------------------
console.log('\n🔬 Test Group 12: Batch 3 Health, Engineering, Stats & Science (#526–#550)');
{
  // #526 Corrected Calcium (US + SI)
  const caUs = getCalculatorSpec('corrected-calcium-calculator')!.calculate({
    unitSystem: 'us', measuredCaUs: 7.8, albuminUs: 2.5, normalAlbuminUs: 4.0,
  });
  assert(Number(caUs.primaryValue) === 9 && Number(caUs.secondaryOutputs?.[0]?.value) === 2.25, 'Batch 3 #526 Corrected Calcium US: 9.00 mg/dL (2.25 mmol/L)');
  const caSi = getCalculatorSpec('corrected-calcium-calculator')!.calculate({
    unitSystem: 'si', measuredCaSi: 1.95, albuminSi: 25, normalAlbuminUs: 4.0,
  });
  assert(Math.abs(Number(caSi.primaryValue) - 2.25) < 0.02, 'Batch 3 #526 Corrected Calcium SI: 2.25 mmol/L matches US conversion');

  // #527 eGFR (CKD-EPI 2021) + Cockcroft-Gault (mg/dL + µmol/L)
  const egfrF = getCalculatorSpec('egfr-creatinine-clearance-calculator')!.calculate({
    sex: 'female', age: 58, crUnit: 'mgdl', creatinineMgDl: 1.15, weightKg: 72, heightCm: 168,
  });
  assert(Math.abs(Number(egfrF.primaryValue) - 55.2) < 0.2 && Math.abs(Number(egfrF.secondaryOutputs?.[1]?.value) - 54.4) < 0.2, 'Batch 3 #527 eGFR Female 58y 1.15 mg/dL: 55.2 mL/min/1.73m² (CrCl 54.4)');
  const egfrSi = getCalculatorSpec('egfr-creatinine-clearance-calculator')!.calculate({
    sex: 'male', age: 45, crUnit: 'umol', creatinineUmol: 88.42, weightKg: 75, heightCm: 178,
  });
  assert(Number(egfrSi.primaryValue) > 85 && Number(egfrSi.primaryValue) < 110, 'Batch 3 #527 eGFR SI µmol/L converts accurately to 1.0 mg/dL');

  // #528 Race Time Predictor
  const race = getCalculatorSpec('race-time-predictor-calculator')!.calculate({
    knownDistanceKm: '10', hours: 0, minutes: 48, seconds: 30, targetDistanceKm: '42.195', fatigueExponent: 1.06,
  });
  assert(race.primaryValue === '3:43:07' && race.secondaryOutputs?.[2]?.value === '3:47:14', 'Batch 3 #528 Race Time Predictor: 10K 48:30 → 3:43:07 Riegel / 3:47:14 Cameron');

  // #529 VO2 Max (Cooper, Rockport, Uth)
  const vo2C = getCalculatorSpec('vo2-max-calculator')!.calculate({ protocol: 'cooper', cooperDistMeters: 2650, age: 32, sex: 'male' });
  assert(Math.abs(Number(vo2C.primaryValue) - 48.0) < 0.2, 'Batch 3 #529 VO2 Max Cooper 2650m = 48.0 mL/kg/min');
  const vo2R = getCalculatorSpec('vo2-max-calculator')!.calculate({ protocol: 'rockport', walkMinutes: 14.5, walkEndHr: 132, weightLb: 165, age: 45, sex: 'female' });
  assert(Number(vo2R.primaryValue) > 30 && Number(vo2R.primaryValue) < 45, 'Batch 3 #529 VO2 Max Rockport walk evaluates validly');
  const vo2U = getCalculatorSpec('vo2-max-calculator')!.calculate({ protocol: 'uth', restingHr: 56, age: 32, sex: 'male' });
  assert(Number(vo2U.primaryValue) > 48 && Number(vo2U.primaryValue) < 53, 'Batch 3 #529 VO2 Max Uth HR Ratio evaluates validly');

  // #530 BAC (US vs UK)
  const bacUs = getCalculatorSpec('bac-calculator')!.calculate({
    sex: 'male', weightUnit: 'lb', weightVal: 175, drinkStandard: 'us', standardDrinks: 3, hoursElapsed: 2.0, eliminationRate: 0.015,
  });
  assert(Math.abs(Number(bacUs.primaryValue) - 0.048) < 0.002 && Number(bacUs.secondaryOutputs?.[1]?.value) === 42, 'Batch 3 #530 BAC US 3 drinks @ 175 lb / 2h = 0.048%');
  const bacUk = getCalculatorSpec('bac-calculator')!.calculate({
    sex: 'female', weightUnit: 'kg', weightVal: 65, drinkStandard: 'uk', standardDrinks: 4, hoursElapsed: 1.0, eliminationRate: 0.015,
  });
  assert(Number(bacUk.secondaryOutputs?.[1]?.value) === 32 && Number(bacUk.primaryValue) > 0.05, 'Batch 3 #530 BAC UK 8g units scales properly');

  // #531 Waist-to-Height Ratio
  const whtr = getCalculatorSpec('waist-to-height-ratio-calculator')!.calculate({
    unitSystem: 'imperial', waist: 34, hip: 40, height: 70, sex: 'male',
  });
  assert(Math.abs(Number(whtr.primaryValue) - 0.486) < 0.002 && Number(whtr.secondaryOutputs?.[2]?.value) === 35, 'Batch 3 #531 WHtR 34/70 = 0.486 (Max Healthy Waist 35 in)');

  // #532 One-Rep Max
  const orm = getCalculatorSpec('one-rep-max-calculator')!.calculate({
    weightLifted: 225, repsPerformed: 5, unitLabel: 'lb', bodyWeight: 180,
  });
  assert(Math.abs(Number(orm.primaryValue) - 260.0) < 0.2 && Number(orm.secondaryOutputs?.[0]?.value) === 253.1, 'Batch 3 #532 One-Rep Max 225×5 = 260.0 lb composite (Brzycki 253.1)');
  const orm1 = getCalculatorSpec('one-rep-max-calculator')!.calculate({ weightLifted: 315, repsPerformed: 1, unitLabel: 'lb', bodyWeight: 180 });
  assert(Number(orm1.primaryValue) === 315, 'Batch 3 #532 One-Rep Max 1-rep identity returns 315 directly');

  // #533 Mean Arterial Pressure
  const map = getCalculatorSpec('mean-arterial-pressure-calculator')!.calculate({ systolic: 122, diastolic: 78, heartRate: 72 });
  assert(Math.abs(Number(map.primaryValue) - 92.7) < 0.2 && Number(map.secondaryOutputs?.[1]?.value) === 44, 'Batch 3 #533 MAP 122/78 = 92.7 mmHg (PP 44)');

  // #534 Pediatric Fluid
  const ped = getCalculatorSpec('pediatric-fluid-calculator')!.calculate({ wtUnit: 'kg', weightVal: 24, dehydrationPct: '0' });
  assert(Number(ped.primaryValue) === 64 && Number(ped.secondaryOutputs?.[0]?.value) === 1580, 'Batch 3 #534 Pediatric Fluid 24 kg = 64 mL/hr (1,580 mL/day)');
  const pedDehyd = getCalculatorSpec('pediatric-fluid-calculator')!.calculate({ wtUnit: 'kg', weightVal: 24, dehydrationPct: '5' });
  assert(Number(pedDehyd.primaryValue) === 114 && Number(pedDehyd.secondaryOutputs?.[0]?.value) === 2780, 'Batch 3 #534 Pediatric Fluid 24 kg + 5% deficit = 114 mL/hr (2,780 mL/day)');

  // #535 Sleep Cycle
  const sleep = getCalculatorSpec('sleep-cycle-calculator')!.calculate({ mode: 'wake_at', targetTime: '06:30', sleepLatencyMin: 15, cycleMinutes: 90 });
  assert(sleep.primaryValue === '10:45 PM' && sleep.secondaryOutputs?.[0]?.value === '9:15 PM', 'Batch 3 #535 Sleep Cycle wake 6:30 AM → 10:45 PM (5 cycles)');

  // #536 BTU HVAC
  const btu = getCalculatorSpec('btu-hvac-calculator')!.calculate({
    areaUnit: 'sqft', floorArea: 1800, ceilingHeightFt: 9, climateZone: '1.05', insulationGrade: '1.0', occupants: 3, includeKitchen: 'yes', seer2: 16,
  });
  assert(Number(btu.primaryValue) === 47125 && Number(btu.secondaryOutputs?.[0]?.value) === 3.93, 'Batch 3 #536 BTU HVAC = 47,125 BTU/hr (3.93 Tons)');

  // #537 Wire Size & Voltage Drop
  const wire = getCalculatorSpec('wire-size-voltage-drop-calculator')!.calculate({
    conductor: 'cu', phase: 'single', voltage: 240, currentAmps: 32, oneWayFeet: 120, wireAwg: '10',
  });
  assert(Math.abs(Number(wire.primaryValue) - 3.98) < 0.02 && String(wire.secondaryOutputs?.[3]?.value).startsWith('8 AWG'), 'Batch 3 #537 Wire Drop 10 AWG = 3.98% (Rec 8 AWG)');
  const wire3p = getCalculatorSpec('wire-size-voltage-drop-calculator')!.calculate({
    conductor: 'al', phase: 'three', voltage: 480, currentAmps: 100, oneWayFeet: 250, wireAwg: '2',
  });
  assert(Math.abs(Number(wire3p.primaryValue) - 2.88) < 0.02, 'Batch 3 #537 Wire Drop 3-Phase Aluminum 2 AWG = 2.88%');

  // #538 Roof Pitch
  const roof = getCalculatorSpec('roof-pitch-rafter-calculator')!.calculate({
    pitchRise: 6, buildingWidthFt: 32, buildingLengthFt: 48, overhangFt: 1.5, wastePct: 10,
  });
  assert(Math.abs(Number(roof.primaryValue) - 19.57) < 0.02 && Number(roof.secondaryOutputs?.[3]?.value) === 21.95, 'Batch 3 #538 Roof Pitch 6:12 = 19.57 ft rafter (21.95 squares)');

  // #539 Stair Calculator
  const stair = getCalculatorSpec('stair-calculator')!.calculate({ totalRiseIn: 108, targetRiserIn: 7.25, treadDepthIn: 10.5 });
  assert(Number(stair.primaryValue) === 7.2 && Number(stair.secondaryOutputs?.[1]?.value) === 147, 'Batch 3 #539 Stair 108" rise = 7.2" × 15 risers (147" run)');

  // #540 Tile Flooring
  const tile = getCalculatorSpec('tile-flooring-calculator')!.calculate({
    roomLengthFt: 16, roomWidthFt: 12, tileLengthIn: 24, tileWidthIn: 12, patternWastePct: '10', boxCoverageSqFt: 15, groutJointIn: 0.125,
  });
  assert(Number(tile.primaryValue) === 15 && tile.secondaryOutputs?.[0]?.value === '106 tiles', 'Batch 3 #540 Tile 16×12 = 15 boxes (106 tiles)');

  // #541 Gravel & Mulch
  const mulch = getCalculatorSpec('gravel-mulch-calculator')!.calculate({ areaSqFt: 600, depthInches: 3, materialType: 'mulch', bagCuFt: 2.0 });
  assert(Math.abs(Number(mulch.primaryValue) - 5.56) < 0.02 && mulch.secondaryOutputs?.[3]?.value === '75 bags', 'Batch 3 #541 Mulch 600ft²×3" = 5.56 yd³ (75 bags)');

  // #542 EV Charging
  const ev = getCalculatorSpec('ev-charging-calculator')!.calculate({
    batteryKwh: 75, startSocPct: 20, targetSocPct: 80, chargerPowerKw: 9.6, electricityRate: 0.16, chargingEffPct: 90, evMiPerKwh: 3.5,
  });
  assert(Math.abs(Number(ev.primaryValue) - 5.21) < 0.02 && Number(ev.secondaryOutputs?.[1]?.value) === 50, 'Batch 3 #542 EV Charging 20→80% @ 9.6kW = 5.21 hrs (50 kWh wall)');

  // #543 A/B Test Sample Size
  const ab = getCalculatorSpec('ab-test-sample-size-calculator')!.calculate({
    baselineRatePct: 4.0, mdeRelativePct: 15, significanceLevel: '95', powerLevel: '80', dailyTraffic: 2500,
  });
  assert(Number(ab.primaryValue) === 17943 && ab.secondaryOutputs?.[0]?.value === '35,886', 'Batch 3 #543 A/B Test Sample Size = 17,943/variant (35,886 total)');

  // #544 Linear Regression
  const lin = getCalculatorSpec('linear-regression-calculator')!.calculate({
    xValues: '1, 2, 3, 4, 5, 6', yValues: '2.1, 3.9, 6.2, 7.8, 10.1, 11.9', predictX: 7,
  });
  assert(Math.abs(Number(lin.primaryValue) - 0.9984) < 0.0005 && Math.abs(Number(lin.secondaryOutputs?.[5]?.value) - 13.92) < 0.02, 'Batch 3 #544 Linear Regression R² = 0.9984 (ŷ(7) = 13.92)');

  // #545 Bayes' Theorem
  const bayes = getCalculatorSpec('bayes-theorem-calculator')!.calculate({ priorPct: 2.0, sensitivityPct: 95.0, specificityPct: 92.0 });
  assert(Math.abs(Number(bayes.primaryValue) - 19.51) < 0.02 && bayes.secondaryOutputs?.[4]?.value === '190 TP / 784 FP', 'Batch 3 #545 Bayes PPV = 19.51% (190 TP / 784 FP)');

  // #546 Normal Distribution (Single & Interval)
  const normS = getCalculatorSpec('normal-distribution-calculator')!.calculate({ mean: 100, sd: 15, mode: 'single', xVal: 120 });
  assert(Math.abs(Number(normS.primaryValue) - 90.879) < 0.01, 'Batch 3 #546 Normal Dist P(X<=120) = 90.879%');
  const normI = getCalculatorSpec('normal-distribution-calculator')!.calculate({ mean: 100, sd: 15, mode: 'interval', lowerA: 85, upperB: 115 });
  assert(Math.abs(Number(normI.primaryValue) - 68.269) < 0.02, 'Batch 3 #546 Normal Dist ±1 SD Empirical Rule = 68.269%');

  // #547 Matrix (3x3, 2x2, singular)
  const mat3 = getCalculatorSpec('matrix-calculator')!.calculate({ size: '3', a11: 4, a12: 7, a13: 2, a21: 2, a22: 6, a23: 1, a31: 1, a32: 0, a33: 3 });
  assert(Number(mat3.primaryValue) === 25 && Number(mat3.secondaryOutputs?.[3]?.value) === 13, 'Batch 3 #547 Matrix 3×3 det=25, tr=13');
  const mat2 = getCalculatorSpec('matrix-calculator')!.calculate({ size: '2', a11: 4, a12: 7, a21: 2, a22: 6 });
  assert(Number(mat2.primaryValue) === 10 && Number(mat2.secondaryOutputs?.[1]?.value) === 10, 'Batch 3 #547 Matrix 2×2 det=10, tr=10');

  // #548 GCD, LCM & Prime Factorization
  const gcd = getCalculatorSpec('gcd-lcm-prime-calculator')!.calculate({ numbersList: '24, 36, 60' });
  assert(Number(gcd.primaryValue) === 12 && gcd.secondaryOutputs?.[0]?.value === '360', 'Batch 3 #548 GCD(24,36,60)=12, LCM=360');

  // #549 Ideal Gas Law (P, V, n, T)
  const gasP = getCalculatorSpec('ideal-gas-law-calculator')!.calculate({ solveFor: 'P', volumeL: 22.414, molesN: 1.0, tempC: 25.0 });
  assert(Math.abs(Number(gasP.primaryValue) - 110.599) < 0.01, 'Batch 3 #549 Ideal Gas P = 110.599 kPa @ 25°C');
  const gasV = getCalculatorSpec('ideal-gas-law-calculator')!.calculate({ solveFor: 'V', pressureKpa: 101.325, molesN: 1.0, tempC: 0 });
  assert(Math.abs(Number(gasV.primaryValue) - 22.414) < 0.02, 'Batch 3 #549 Ideal Gas STP Molar Volume = 22.414 L');

  // #550 Decibel (Power, Voltage, Distance)
  const dbP = getCalculatorSpec('decibel-calculator')!.calculate({ mode: 'power', refPowerW: 0.001, measPowerW: 0.1 });
  assert(Number(dbP.primaryValue) === 20 && Number(dbP.secondaryOutputs?.[0]?.value) === 20, 'Batch 3 #550 Decibel Power 0.1W/0.001W = 20 dB (20 dBm)');
  const dbD = getCalculatorSpec('decibel-calculator')!.calculate({ mode: 'distance', splAtR1: 95, r1Meters: 2, r2Meters: 20 });
  assert(Number(dbD.primaryValue) === 75, 'Batch 3 #550 Decibel Distance 10× drop = −20 dB (95 → 75 dB)');
}

// ----------------------------------------------------
// TEST GROUP 13: Batch 4 Expansion Verification (500-Calculator Suite Across All 11 Categories)
// ----------------------------------------------------
console.log('\n🌐 Test Group 13: Batch 4 Expansion Benchmarks (All 11 Categories, 500 Active Calculators)');
{
  assert(allCalculatorSpecs.length === 500, `Registry exposes exact 500 active calculator specs (found ${allCalculatorSpecs.length})`);

  // Finance
  const ann = getCalculatorSpec('annuity-payout-calculator')!.calculate({ principal: 500000, annualRate: 5.5, years: 20, frequency: '12', timing: 'end' });
  assert(Math.abs(Number(ann.primaryValue) - 3439.44) < 0.05, 'Batch 4 Finance: Annuity Payout $500k @ 5.5% 20yr = $3,439.44/mo');
  const r72 = getCalculatorSpec('rule-of-72-calculator')!.calculate({ annualRate: 8, startingAmount: 10000, targetMultiple: '2' });
  assert(Math.abs(Number(r72.primaryValue) - 9.01) < 0.05, 'Batch 4 Finance: Exact Rule of 72 doubling @ 8% = 9.01 yrs');
  const tbill = getCalculatorSpec('treasury-bill-discount-yield-calculator')!.calculate({ parValue: 10000, purchasePrice: 9780, daysToMaturity: 182 });
  assert(Math.abs(Number(tbill.primaryValue) - 4.511) < 0.01, 'Batch 4 Finance: T-Bill Bond Equivalent Yield = 4.511%');

  // Business & Tax
  const wacc = getCalculatorSpec('wacc-cost-of-capital-calculator')!.calculate({ equityValue: 8000000, debtValue: 2000000, costOfEquityPct: 10.5, costOfDebtPct: 6, taxRatePct: 21 });
  assert(Math.abs(Number(wacc.primaryValue) - 9.35) < 0.02, 'Batch 4 Business: WACC 80/20 Equity/Debt = 9.35%');
  const ebitda = getCalculatorSpec('ebitda-margin-valuation-calculator')!.calculate({ revenue: 5000000, ebit: 850000, da: 250000, evMultiple: 8.5, netDebt: 600000 });
  assert(Number(ebitda.primaryValue) === 1100000 && ebitda.secondaryOutputs?.[0]?.value === '22%', 'Batch 4 Business: EBITDA $1.1M (22% margin)');

  // Math & Geometry
  const slope = getCalculatorSpec('slope-intercept-distance-calculator')!.calculate({ x1: 2, y1: 3, x2: 8, y2: 15 });
  assert(Number(slope.primaryValue) === 2 && Math.abs(Number(slope.secondaryOutputs?.[0]?.value) - 13.4164) < 0.001, 'Batch 4 Math: Slope=2, Distance=13.4164');
  const rect = getCalculatorSpec('rectangle-perimeter-diagonal-calculator')!.calculate({ length: 12, width: 5 });
  assert(Number(rect.primaryValue) === 60 && Number(rect.secondaryOutputs?.[0]?.value) === 34, 'Batch 4 Geometry: 12×5 Rectangle Area=60, Perimeter=34');

  // Statistics & Probability
  const stats = getCalculatorSpec('mean-median-mode-range-calculator')!.calculate({ dataset: '12, 15, 18, 18, 22, 27, 30' });
  assert(Math.abs(Number(stats.primaryValue) - 20.2857) < 0.001 && Number(stats.secondaryOutputs?.[0]?.value) === 18, 'Batch 4 Stats: Mean=20.2857, Median=18');

  // Date & Time + Education
  const dt = getCalculatorSpec('add-subtract-days-weeks-date-calculator')!.calculate({ startDate: '2026-11-20', operation: 'add', years: 0, months: 3, weeks: 0, days: 15 });
  assert(dt.primaryValue === '2027-03-07' && dt.secondaryOutputs?.[0]?.value === '107 days', 'Batch 4 Date-Time: 2026-11-20 + 3m15d = 2027-03-07 (107 days)');
  const gpa = getCalculatorSpec('cumulative-gpa-semester-planner-calculator')!.calculate({ priorGpa: 3.35, priorCredits: 60, semGpa: 3.8, semCredits: 15 });
  assert(Number(gpa.primaryValue) === 3.44, 'Batch 4 Education: Weighted Cumulative GPA 3.35(60) + 3.80(15) = 3.44');

  // Health & Science
  const bmr = getCalculatorSpec('bmr-mifflin-katch-mcardle-calculator')!.calculate({ sex: 'male', weightKg: 78, heightCm: 178, age: 32, bodyFatPct: 18 });
  assert(Number(bmr.primaryValue) === 1738, 'Batch 4 Health: Mifflin-St Jeor BMR = 1738 kcal/day');
  const fma = getCalculatorSpec('newtons-second-law-force-calculator')!.calculate({ massKg: 25, accel: 4.5 });
  assert(Number(fma.primaryValue) === 112.5, 'Batch 4 Science: F = 25kg × 4.5m/s² = 112.5 N');

  // Unit Converters & Home-Tech
  const troy = getCalculatorSpec('mass-weight-troy-ounce-converter')!.calculate({ value: 5, fromUnit: 'ozt' });
  assert(Math.abs(Number(troy.primaryValue) - 155.51738) < 0.001, 'Batch 4 Converters: 5 ozt = 155.51738 g');
  const conduit = getCalculatorSpec('conduit-fill-nec-wire-capacity-calculator')!.calculate({ conduitTrade: '0.75', wireAwg: '12', wireCount: 6 });
  assert(Number(conduit.primaryValue) === 15, 'Batch 4 Home-Tech: 6× #12 THHN in 3/4" EMT = 15% Fill (NEC Pass)');
}

console.log('\n====================================================');
console.log(`TOTAL TESTS: ${passCount + failCount}`);
console.log(`PASSED: ${passCount}`);
console.log(`FAILED: ${failCount}`);
console.log('====================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL NUMERIQ CALCULATOR FORMULAS, BOUNDARY CHECKS & PARSER TESTS PASSED!');
}
