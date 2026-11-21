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
assert(allCalcs.length === 75, `Active catalog contains exactly 75 calculators (found ${allCalcs.length})`);
assert(allCalculatorSpecs.length === 75, `Calculator registry contains exactly 75 specs (found ${allCalculatorSpecs.length})`);

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
