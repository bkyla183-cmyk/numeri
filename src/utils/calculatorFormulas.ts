export type WeightUnitSystem = 'metric' | 'imperial';

export interface BodyFatInput {
  gender: 'male' | 'female';
  heightCm: number;
  weightKg: number;
  neckCm: number;
  waistCm: number;
  hipCm?: number;
}

export interface BodyFatResult {
  bodyFatPct: number;
  fatMassKg: number;
  leanMassKg: number;
  whtr: number;
  ffmi: number;
  normalizedFfmi: number;
  category: string;
}

export function calculateUsNavyBodyFat(input: BodyFatInput): BodyFatResult | { error: string } {
  const { gender, heightCm, weightKg, neckCm, waistCm, hipCm = 0 } = input;
  if (!Number.isFinite(heightCm) || heightCm <= 0) {
    return { error: 'Height must be greater than zero.' };
  }
  if (!Number.isFinite(weightKg) || weightKg <= 0) {
    return { error: 'Weight must be greater than zero.' };
  }
  if (!Number.isFinite(neckCm) || neckCm <= 0) {
    return { error: 'Neck circumference must be greater than zero.' };
  }
  if (!Number.isFinite(waistCm) || waistCm <= 0) {
    return { error: 'Waist circumference must be greater than zero.' };
  }

  const heightIn = heightCm / 2.54;
  const neckIn = neckCm / 2.54;
  const waistIn = waistCm / 2.54;
  const hipIn = hipCm / 2.54;

  let rawBf: number;
  if (gender === 'male') {
    const diff = waistIn - neckIn;
    if (diff <= 0) {
      return { error: 'Waist circumference must be greater than neck circumference for the US Navy male equation.' };
    }
    rawBf = 86.01 * Math.log10(diff) - 70.041 * Math.log10(heightIn) + 36.76;
  } else {
    if (!Number.isFinite(hipCm) || hipCm <= 0) {
      return { error: 'Hip circumference must be greater than zero for females.' };
    }
    const circ = waistIn + hipIn - neckIn;
    if (circ <= 0) {
      return { error: 'Waist plus hip circumference must exceed neck circumference.' };
    }
    rawBf = 163.205 * Math.log10(circ) - 97.684 * Math.log10(heightIn) - 78.387;
  }

  const bodyFatPct = Math.max(2, Math.min(60, rawBf));
  const fatMassKg = weightKg * (bodyFatPct / 100);
  const leanMassKg = weightKg - fatMassKg;
  const heightM = heightCm / 100;
  const whtr = waistCm / heightCm;
  const ffmi = leanMassKg / (heightM * heightM);
  const normalizedFfmi = ffmi + 6.1 * (1.8 - heightM);

  let category: string;
  if (gender === 'male') {
    if (bodyFatPct < 6) category = 'Essential Fat';
    else if (bodyFatPct < 14) category = 'Athletes';
    else if (bodyFatPct < 18) category = 'Fitness';
    else if (bodyFatPct < 25) category = 'Acceptable';
    else category = 'Obese';
  } else {
    if (bodyFatPct < 14) category = 'Essential Fat';
    else if (bodyFatPct < 21) category = 'Athletes';
    else if (bodyFatPct < 25) category = 'Fitness';
    else if (bodyFatPct < 32) category = 'Acceptable';
    else category = 'Obese';
  }

  return {
    bodyFatPct,
    fatMassKg,
    leanMassKg,
    whtr,
    ffmi,
    normalizedFfmi,
    category,
  };
}

export interface CompoundInterestInput {
  principal: number;
  monthlyContribution: number;
  annualRatePct: number;
  years: number;
  compoundingFreq: number;
  timing?: 'end' | 'beginning';
  inflationRatePct?: number;
}

export interface CompoundScheduleRow {
  year: number;
  principal: number;
  interest: number;
  balance: number;
  realBalance: number;
}

export interface CompoundInterestResult {
  futureValue: number;
  realFutureValue: number;
  totalPrincipal: number;
  totalInterest: number;
  effectiveAnnualRatePct: number;
  effectiveMonthlyRate: number;
  schedule: CompoundScheduleRow[];
}

export function calculateCompoundInterest(input: CompoundInterestInput): CompoundInterestResult | { error: string } {
  const {
    principal,
    monthlyContribution,
    annualRatePct,
    years,
    compoundingFreq,
    timing = 'end',
    inflationRatePct = 0,
  } = input;

  if (!Number.isFinite(principal) || principal < 0) return { error: 'Initial principal cannot be negative.' };
  if (!Number.isFinite(monthlyContribution) || monthlyContribution < 0) return { error: 'Monthly contribution cannot be negative.' };
  if (!Number.isFinite(annualRatePct) || annualRatePct < 0 || annualRatePct > 100) return { error: 'Annual rate must be between 0% and 100%.' };
  if (!Number.isFinite(years) || years <= 0 || years > 100) return { error: 'Investment duration must be between 0 and 100 years.' };
  if (!Number.isFinite(compoundingFreq) || compoundingFreq <= 0) return { error: 'Compounding frequency must be positive.' };
  if (!Number.isFinite(inflationRatePct) || inflationRatePct < -20 || inflationRatePct > 100) return { error: 'Inflation rate is out of bounds.' };

  const r = annualRatePct / 100;
  const n = compoundingFreq;
  const inf = inflationRatePct / 100;
  const totalMonths = years * 12;

  const effectiveMonthlyRate = r === 0 ? 0 : Math.pow(1 + r / n, n / 12) - 1;
  const effectiveAnnualRatePct = (Math.pow(1 + r / n, n) - 1) * 100;

  const fvAtMonths = (months: number): { balance: number; contributed: number; interest: number } => {
    const yrs = months / 12;
    const fvPrincipal = principal * Math.pow(1 + r / n, n * yrs);
    const timingMult = timing === 'beginning' ? 1 + effectiveMonthlyRate : 1;
    const fvContribs =
      effectiveMonthlyRate === 0
        ? monthlyContribution * months
        : monthlyContribution * ((Math.pow(1 + effectiveMonthlyRate, months) - 1) / effectiveMonthlyRate) * timingMult;
    const balance = fvPrincipal + fvContribs;
    const contributed = principal + monthlyContribution * months;
    return {
      balance,
      contributed,
      interest: Math.max(0, balance - contributed),
    };
  };

  const final = fvAtMonths(totalMonths);
  const realFutureValue = final.balance / Math.pow(1 + inf, years);

  const schedule: CompoundScheduleRow[] = [];
  const wholeYears = Math.floor(years);
  for (let y = 1; y <= wholeYears; y++) {
    const row = fvAtMonths(y * 12);
    schedule.push({
      year: y,
      principal: row.contributed,
      interest: row.interest,
      balance: row.balance,
      realBalance: row.balance / Math.pow(1 + inf, y),
    });
  }
  if (years - wholeYears > 1e-6) {
    schedule.push({
      year: Number(years.toFixed(2)),
      principal: final.contributed,
      interest: final.interest,
      balance: final.balance,
      realBalance: realFutureValue,
    });
  }

  return {
    futureValue: final.balance,
    realFutureValue,
    totalPrincipal: final.contributed,
    totalInterest: final.interest,
    effectiveAnnualRatePct,
    effectiveMonthlyRate,
    schedule,
  };
}

export interface MortgageInput {
  homePrice: number;
  downPayment: number;
  annualRatePct: number;
  termYears: number;
  annualPropertyTax?: number;
  annualHomeInsurance?: number;
  monthlyHoa?: number;
  pmiMode?: 'auto' | 'none' | 'custom';
  customPmiRatePct?: number;
  extraMonthly?: number;
}

export interface MortgageScheduleRow {
  year: number;
  principalPaid: number;
  interestPaid: number;
  remainingBalance: number;
}

export interface MortgageResult {
  loanAmount: number;
  ltvPct: number;
  monthlyPI: number;
  monthlyTax: number;
  monthlyIns: number;
  monthlyPmi: number;
  monthlyHoa: number;
  totalMonthly: number;
  totalInterestStandard: number;
  totalInterestWithExtra: number;
  interestSaved: number;
  monthsStandard: number;
  monthsWithExtra: number;
  monthsSaved: number;
  monthly15YrPI: number;
  schedule: MortgageScheduleRow[];
}

export function calculateMortgageSchedule(input: MortgageInput): MortgageResult | { error: string } {
  const {
    homePrice,
    downPayment,
    annualRatePct,
    termYears,
    annualPropertyTax = 0,
    annualHomeInsurance = 0,
    monthlyHoa = 0,
    pmiMode = 'auto',
    customPmiRatePct = 0.5,
    extraMonthly = 0,
  } = input;

  if (!Number.isFinite(homePrice) || homePrice <= 0) return { error: 'Home price must be greater than zero.' };
  if (!Number.isFinite(downPayment) || downPayment < 0 || downPayment >= homePrice) {
    return { error: 'Down payment must be non-negative and less than the home price.' };
  }
  if (!Number.isFinite(annualRatePct) || annualRatePct < 0 || annualRatePct > 50) {
    return { error: 'Interest rate must be between 0% and 50%.' };
  }
  if (!Number.isFinite(termYears) || termYears <= 0 || termYears > 50) {
    return { error: 'Loan term must be between 0 and 50 years.' };
  }
  if (annualPropertyTax < 0 || annualHomeInsurance < 0 || monthlyHoa < 0 || extraMonthly < 0) {
    return { error: 'Taxes, insurance, HOA, and extra payment values cannot be negative.' };
  }

  const loanAmount = homePrice - downPayment;
  const ltvPct = (loanAmount / homePrice) * 100;
  const r = annualRatePct / 100 / 12;
  const n = Math.max(1, Math.round(termYears * 12));

  const monthlyPI =
    r === 0 ? loanAmount / n : (loanAmount * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);

  const monthlyTax = annualPropertyTax / 12;
  const monthlyIns = annualHomeInsurance / 12;

  let effectivePmiRate = 0;
  if (pmiMode === 'auto' && ltvPct > 80.01) {
    effectivePmiRate = 0.5;
  } else if (pmiMode === 'custom' && customPmiRatePct > 0) {
    effectivePmiRate = customPmiRatePct;
  }
  const monthlyPmi = (loanAmount * (effectivePmiRate / 100)) / 12;
  const totalMonthly = monthlyPI + monthlyTax + monthlyIns + monthlyPmi + monthlyHoa;

  const totalInterestStandard = monthlyPI * n - loanAmount;

  // Simulate amortization with extraMonthly
  let bal = loanAmount;
  let totalInterestWithExtra = 0;
  let monthsWithExtra = 0;
  const schedule: MortgageScheduleRow[] = [];
  let yrPrincipal = 0;
  let yrInterest = 0;

  while (bal > 0.005 && monthsWithExtra < n + 1) {
    monthsWithExtra++;
    const interest = bal * r;
    let principal = monthlyPI - interest + extraMonthly;
    if (principal > bal) {
      principal = bal;
    }
    bal = Math.max(0, bal - principal);
    totalInterestWithExtra += interest;
    yrPrincipal += principal;
    yrInterest += interest;

    if (monthsWithExtra % 12 === 0 || bal <= 0.005) {
      schedule.push({
        year: Math.ceil(monthsWithExtra / 12),
        principalPaid: yrPrincipal,
        interestPaid: yrInterest,
        remainingBalance: bal,
      });
      yrPrincipal = 0;
      yrInterest = 0;
    }
  }

  const n15 = 15 * 12;
  const monthly15YrPI =
    r === 0 ? loanAmount / n15 : (loanAmount * (r * Math.pow(1 + r, n15))) / (Math.pow(1 + r, n15) - 1);

  return {
    loanAmount,
    ltvPct,
    monthlyPI,
    monthlyTax,
    monthlyIns,
    monthlyPmi,
    monthlyHoa,
    totalMonthly,
    totalInterestStandard,
    totalInterestWithExtra,
    interestSaved: Math.max(0, totalInterestStandard - totalInterestWithExtra),
    monthsStandard: n,
    monthsWithExtra,
    monthsSaved: Math.max(0, n - monthsWithExtra),
    monthly15YrPI,
    schedule,
  };
}

export interface CalorieTdeeInput {
  formula?: 'mifflin' | 'katch';
  gender: 'male' | 'female';
  age: number;
  weightKg: number;
  heightCm: number;
  activityMultiplier: number;
  bodyFatPct?: number;
}

export interface CalorieTdeeResult {
  bmr: number;
  tdee: number;
  mildLoss: number;
  weightLoss: number;
  extremeLoss: number;
  mildGain: number;
  leanMassKg: number | null;
}

export function calculateCalorieTdee(input: CalorieTdeeInput): CalorieTdeeResult | { error: string } {
  const { formula = 'mifflin', gender, age, weightKg, heightCm, activityMultiplier, bodyFatPct } = input;
  if (!Number.isFinite(weightKg) || weightKg <= 0) return { error: 'Weight must be greater than zero.' };
  if (!Number.isFinite(heightCm) || heightCm <= 0) return { error: 'Height must be greater than zero.' };
  if (!Number.isFinite(activityMultiplier) || activityMultiplier <= 0) return { error: 'Activity multiplier must be positive.' };

  let bmr: number;
  let leanMassKg: number | null = null;

  if (formula === 'katch') {
    if (!Number.isFinite(bodyFatPct) || (bodyFatPct as number) <= 0 || (bodyFatPct as number) >= 75) {
      return { error: 'Body fat percentage must be between 1% and 74% for Katch-McArdle.' };
    }
    leanMassKg = weightKg * (1 - (bodyFatPct as number) / 100);
    bmr = 370 + 21.6 * leanMassKg;
  } else {
    if (!Number.isFinite(age) || age <= 0 || age > 120) return { error: 'Age must be between 1 and 120.' };
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + (gender === 'male' ? 5 : -161);
  }

  const tdee = bmr * activityMultiplier;
  const floor = gender === 'female' ? 1200 : 1500;

  return {
    bmr,
    tdee,
    mildLoss: Math.max(floor, tdee - 250),
    weightLoss: Math.max(floor, tdee - 500),
    extremeLoss: Math.max(floor, tdee - 1000),
    mildGain: tdee + 250,
    leanMassKg,
  };
}

export interface BmiResult {
  bmi: number;
  bmiPrime: number;
  ponderalIndex: number;
  category: string;
  healthyMinKg: number;
  healthyMaxKg: number;
}

export function calculateBmiMetrics(weightKg: number, heightCm: number): BmiResult | { error: string } {
  if (!Number.isFinite(weightKg) || weightKg <= 0) return { error: 'Weight must be greater than zero.' };
  if (!Number.isFinite(heightCm) || heightCm <= 0) return { error: 'Height must be greater than zero.' };
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  const bmiPrime = bmi / 25;
  const ponderalIndex = weightKg / Math.pow(heightM, 3);
  const healthyMinKg = 18.5 * heightM * heightM;
  const healthyMaxKg = 24.9 * heightM * heightM;

  let category: string;
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi < 25) category = 'Normal weight';
  else if (bmi < 30) category = 'Overweight';
  else category = 'Obese';

  return {
    bmi,
    bmiPrime,
    ponderalIndex,
    category,
    healthyMinKg,
    healthyMaxKg,
  };
}

export type DueDateMethod = 'lmp' | 'conception' | 'ivf_day3' | 'ivf_day5';

export interface DueDateResult {
  eddIso: string;
  lmpEquivalentIso: string;
  gestationalDays: number;
  gestationalWeeks: number;
  remainingDaysOfWeek: number;
  trimester: number;
  trimesterLabel: string;
  daysUntilDue: number;
  progressPct: number;
  firstTrimesterEndIso: string;
  secondTrimesterEndIso: string;
}

function parseIsoUtc(dateStr: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  return dt;
}

function addUtcDays(dt: Date, days: number): Date {
  return new Date(dt.getTime() + days * 86400000);
}

export function formatUtcIso(dt: Date): string {
  return dt.toISOString().slice(0, 10);
}

export function calculateDueDateEstimate(
  method: DueDateMethod,
  referenceDateStr: string,
  cycleLength = 28,
  asOfDateStr?: string
): DueDateResult | { error: string } {
  const ref = parseIsoUtc(referenceDateStr);
  if (!ref) return { error: 'Please provide a valid date in YYYY-MM-DD format.' };

  const today = asOfDateStr ? parseIsoUtc(asOfDateStr) : (() => {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  })();
  if (!today) return { error: 'Invalid reference current date.' };

  let edd: Date;
  if (method === 'lmp') {
    const safeCycle = Number.isFinite(cycleLength) ? Math.max(21, Math.min(45, cycleLength)) : 28;
    edd = addUtcDays(ref, 280 + (safeCycle - 28));
  } else if (method === 'conception') {
    edd = addUtcDays(ref, 266);
  } else if (method === 'ivf_day3') {
    edd = addUtcDays(ref, 263);
  } else {
    edd = addUtcDays(ref, 261);
  }

  const lmpEquivalent = addUtcDays(edd, -280);
  const gestationalDays = Math.floor((today.getTime() - lmpEquivalent.getTime()) / 86400000);
  const gestationalWeeks = Math.floor(gestationalDays / 7);
  const remainingDaysOfWeek = ((gestationalDays % 7) + 7) % 7;
  const daysUntilDue = Math.ceil((edd.getTime() - today.getTime()) / 86400000);

  let trimester = 1;
  let trimesterLabel = 'First Trimester';
  if (gestationalWeeks >= 28) {
    trimester = 3;
    trimesterLabel = 'Third Trimester';
  } else if (gestationalWeeks >= 14) {
    trimester = 2;
    trimesterLabel = 'Second Trimester';
  }

  const progressPct = Math.max(0, Math.min(100, (gestationalDays / 280) * 100));

  return {
    eddIso: formatUtcIso(edd),
    lmpEquivalentIso: formatUtcIso(lmpEquivalent),
    gestationalDays,
    gestationalWeeks,
    remainingDaysOfWeek,
    trimester,
    trimesterLabel,
    daysUntilDue,
    progressPct,
    firstTrimesterEndIso: formatUtcIso(addUtcDays(lmpEquivalent, 13 * 7 + 6)),
    secondTrimesterEndIso: formatUtcDaysSafe(lmpEquivalent, 27 * 7 + 6),
  };
}

function formatUtcDaysSafe(dt: Date, days: number): string {
  return formatUtcIso(addUtcDays(dt, days));
}

export function gcdInt(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

export interface FractionResult {
  rawNum: number;
  rawDen: number;
  num: number;
  den: number;
  whole: number;
  remNum: number;
  decimal: number;
  mixedStr: string;
  reciprocalStr: string;
}

export function calculateFractionOp(params: {
  whole1?: number;
  num1: number;
  den1: number;
  whole2?: number;
  num2: number;
  den2: number;
  op: '+' | '-' | '*' | '/';
}): FractionResult | { error: string } {
  const { whole1 = 0, num1, den1, whole2 = 0, num2, den2, op } = params;
  if (!Number.isInteger(whole1) || !Number.isInteger(num1) || !Number.isInteger(den1) || !Number.isInteger(whole2) || !Number.isInteger(num2) || !Number.isInteger(den2)) {
    return { error: 'Fraction components must be integers.' };
  }
  if (den1 === 0 || den2 === 0) {
    return { error: 'Denominator cannot be zero.' };
  }

  // Normalize denominator sign
  const normDen1 = Math.abs(den1);
  const normNum1 = (den1 < 0 ? -num1 : num1);
  const normDen2 = Math.abs(den2);
  const normNum2 = (den2 < 0 ? -num2 : num2);

  const toImproper = (w: number, n: number, d: number) => {
    if (w === 0) return n;
    const sign = w < 0 ? -1 : 1;
    return sign * (Math.abs(w) * d + Math.abs(n));
  };

  const a = toImproper(whole1, normNum1, normDen1);
  const b = normDen1;
  const c = toImproper(whole2, normNum2, normDen2);
  const d = normDen2;

  let rawNum: number;
  let rawDen: number;

  if (op === '+') {
    rawNum = a * d + c * b;
    rawDen = b * d;
  } else if (op === '-') {
    rawNum = a * d - c * b;
    rawDen = b * d;
  } else if (op === '*') {
    rawNum = a * c;
    rawDen = b * d;
  } else {
    if (c === 0) return { error: 'Cannot divide by zero.' };
    rawNum = a * d;
    rawDen = b * c;
  }

  if (rawDen < 0) {
    rawNum = -rawNum;
    rawDen = -rawDen;
  }

  const divisor = gcdInt(rawNum, rawDen);
  const num = rawNum === 0 ? 0 : rawNum / divisor;
  const den = rawNum === 0 ? 1 : rawDen / divisor;
  const decimal = num / den;

  const sign = num < 0 ? '-' : '';
  const absNum = Math.abs(num);
  const wholeAbs = Math.floor(absNum / den);
  const remNum = absNum % den;
  const whole = num < 0 && wholeAbs > 0 ? -wholeAbs : wholeAbs;

  let mixedStr: string;
  if (num === 0) mixedStr = '0';
  else if (remNum === 0) mixedStr = `${sign}${wholeAbs}`;
  else if (wholeAbs === 0) mixedStr = `${num}/${den}`;
  else mixedStr = `${sign}${wholeAbs} ${remNum}/${den}`;

  const reciprocalStr = num === 0 ? 'Undefined (0)' : num < 0 ? `${-den}/${Math.abs(num)}` : `${den}/${num}`;

  return {
    rawNum,
    rawDen,
    num,
    den,
    whole,
    remNum,
    decimal,
    mixedStr,
    reciprocalStr,
  };
}

export interface DescriptiveStatsResult {
  count: number;
  sum: number;
  mean: number;
  median: number;
  modes: number[];
  modeLabel: string;
  min: number;
  max: number;
  range: number;
  q1: number;
  q3: number;
  iqr: number;
  sampleVariance: number;
  popVariance: number;
  sampleSd: number;
  popSd: number;
  sem: number;
  cvPct: number | null;
  sorted: number[];
}

function medianOfSorted(arr: number[]): number {
  const n = arr.length;
  if (n === 0) return 0;
  const mid = Math.floor(n / 2);
  return n % 2 === 1 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
}

export function calculateDescriptiveStats(values: number[], mode: 'sample' | 'population' = 'sample'): DescriptiveStatsResult | { error: string } {
  if (!values.length || values.some((v) => !Number.isFinite(v))) {
    return { error: 'Please provide at least one valid number.' };
  }
  const n = values.length;
  if (mode === 'sample' && n < 2) {
    return { error: 'Sample standard deviation requires at least 2 values (n - 1 denominator).' };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, x) => acc + x, 0);
  const mean = sum / n;
  const median = medianOfSorted(sorted);
  const min = sorted[0];
  const max = sorted[n - 1];
  const range = max - min;

  let q1 = sorted[0];
  let q3 = sorted[n - 1];
  if (n >= 2) {
    const mid = Math.floor(n / 2);
    const lower = sorted.slice(0, mid);
    const upper = n % 2 === 0 ? sorted.slice(mid) : sorted.slice(mid + 1);
    q1 = medianOfSorted(lower);
    q3 = medianOfSorted(upper);
  }
  const iqr = q3 - q1;

  const ss = sorted.reduce((acc, x) => acc + Math.pow(x - mean, 2), 0);
  const popVariance = ss / n;
  const sampleVariance = n > 1 ? ss / (n - 1) : 0;
  const popSd = Math.sqrt(popVariance);
  const sampleSd = Math.sqrt(sampleVariance);

  const activeSd = mode === 'sample' ? sampleSd : popSd;
  const sem = activeSd / Math.sqrt(n);
  const cvPct = Math.abs(mean) > 1e-12 ? (activeSd / Math.abs(mean)) * 100 : null;

  const freq = new Map<number, number>();
  let maxFreq = 0;
  for (const x of sorted) {
    const c = (freq.get(x) ?? 0) + 1;
    freq.set(x, c);
    if (c > maxFreq) maxFreq = c;
  }
  const modes = maxFreq > 1 ? Array.from(freq.entries()).filter(([, c]) => c === maxFreq).map(([val]) => val) : [];
  const modeLabel = modes.length === 0 ? 'None (all unique)' : modes.join(', ');

  return {
    count: n,
    sum,
    mean,
    median,
    modes,
    modeLabel,
    min,
    max,
    range,
    q1,
    q3,
    iqr,
    sampleVariance,
    popVariance,
    sampleSd,
    popSd,
    sem,
    cvPct,
    sorted,
  };
}

// --- Statistical Distributions (Inverse Normal, Normal CDF, Student's t critical value) ---

export function erfApprox(x: number): number {
  const sign = x >= 0 ? 1 : -1;
  const ax = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * ax);
  const y =
    1 -
    (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t) *
      Math.exp(-ax * ax);
  return sign * y;
}

export function normalCdf(z: number): number {
  return 0.5 * (1 + erfApprox(z / Math.SQRT2));
}

export function normalTwoTailedPValue(z: number): number {
  return Math.max(0, Math.min(1, 2 * (1 - normalCdf(Math.abs(z)))));
}

// Acklam's inverse normal CDF approximation (error < 1.15e-9)
export function inverseNormalCdf(p: number): number {
  if (p <= 0 || p >= 1) return NaN;
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
  const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
  const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];

  const pLow = 0.02425;
  const pHigh = 1 - pLow;

  if (p < pLow) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (p <= pHigh) {
    const q = p - 0.5;
    const r = q * q;
    return ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }
  const q = Math.sqrt(-2 * Math.log(1 - p));
  return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
}

function logGamma(z: number): number {
  const cof = [
    76.18009172947146,
    -86.50532032941677,
    24.01409824083091,
    -1.231739572450155,
    0.001208650973866179,
    -0.000005395239384953,
  ];
  let x = z;
  let y = z;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j < 6; j++) {
    y += 1;
    ser += cof[j] / y;
  }
  return -tmp + Math.log((2.5066282746310005 * ser) / x);
}

function betaContinuedFraction(a: number, b: number, x: number): number {
  const maxIter = 200;
  const eps = 3e-12;
  const fpmin = 1e-30;
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < fpmin) d = fpmin;
  d = 1 / d;
  let h = d;

  for (let m = 1; m <= maxIter; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < fpmin) d = fpmin;
    c = 1 + aa / c;
    if (Math.abs(c) < fpmin) c = fpmin;
    d = 1 / d;
    h *= d * c;

    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < fpmin) d = fpmin;
    c = 1 + aa / c;
    if (Math.abs(c) < fpmin) c = fpmin;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < eps) break;
  }
  return h;
}

export function regularizedBetaInc(a: number, b: number, x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  if (x < (a + 1) / (a + b + 2)) {
    return (bt * betaContinuedFraction(a, b, x)) / a;
  }
  return 1 - (bt * betaContinuedFraction(b, a, 1 - x)) / b;
}

export function studentTCdf(t: number, df: number): number {
  const x = df / (df + t * t);
  const pHalf = 0.5 * regularizedBetaInc(df / 2, 0.5, x);
  return t >= 0 ? 1 - pHalf : pHalf;
}

export function normalCriticalValue(confidencePct: number): number {
  const alpha = 1 - confidencePct / 100;
  return inverseNormalCdf(1 - alpha / 2);
}

export function studentTCriticalValue(df: number, confidencePct: number): number {
  if (df <= 0 || confidencePct <= 0 || confidencePct >= 100) return NaN;
  const targetP = 1 - (1 - confidencePct / 100) / 2;
  if (df === 1) {
    return Math.tan(Math.PI * (targetP - 0.5));
  }
  if (df === 2) {
    const u = 2 * targetP - 1;
    return Math.sqrt((2 * u * u) / (1 - u * u));
  }

  // Cornish-Fisher initial guess
  const z = inverseNormalCdf(targetP);
  const z3 = Math.pow(z, 3);
  const z5 = Math.pow(z, 5);
  let t = z + (z3 + z) / (4 * df) + (5 * z5 + 16 * z3 + 3 * z) / (96 * df * df);

  // Newton-Raphson refinement
  const logCoeff = logGamma((df + 1) / 2) - logGamma(df / 2) - 0.5 * Math.log(df * Math.PI);
  for (let i = 0; i < 12; i++) {
    const cdf = studentTCdf(t, df);
    const err = cdf - targetP;
    if (Math.abs(err) < 1e-10) break;
    const pdf = Math.exp(logCoeff - ((df + 1) / 2) * Math.log(1 + (t * t) / df));
    if (pdf <= 1e-18) break;
    t -= err / pdf;
  }
  return t;
}

export interface TextStatsResult {
  words: number;
  charsWithSpaces: number;
  charsNoSpaces: number;
  sentences: number;
  paragraphs: number;
  uniqueWords: number;
  avgWordLength: number;
  readingMin: number;
  speakingMin: number;
}

export function analyzeTextStats(text: string): TextStatsResult {
  const normalized = text ?? '';
  const charsWithSpaces = normalized.length;
  const charsNoSpaces = normalized.replace(/\s+/g, '').length;
  const trimmed = normalized.trim();

  if (!trimmed) {
    return {
      words: 0,
      charsWithSpaces: 0,
      charsNoSpaces: 0,
      sentences: 0,
      paragraphs: 0,
      uniqueWords: 0,
      avgWordLength: 0,
      readingMin: 0,
      speakingMin: 0,
    };
  }

  const wordTokens = trimmed.split(/\s+/).filter(Boolean);
  const words = wordTokens.length;
  const uniqueSet = new Set(
    wordTokens
      .map((w) => w.toLowerCase().replace(/^[^a-z0-9\u0600-\u06ff]+|[^a-z0-9\u0600-\u06ff]+$/gi, ''))
      .filter(Boolean)
  );
  const sentenceMatches = trimmed.match(/[^.!?؟\n]+[.!?؟]+(\s|$)|[^.!?؟\n]+$/g);
  const sentences = sentenceMatches ? sentenceMatches.filter((s) => s.trim().length > 0).length : 1;
  const paragraphs = trimmed.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length || 1;
  const totalWordChars = wordTokens.reduce((acc, w) => acc + w.replace(/[^\p{L}\p{N}]/gu, '').length, 0);
  const avgWordLength = words > 0 ? totalWordChars / words : 0;

  return {
    words,
    charsWithSpaces,
    charsNoSpaces,
    sentences,
    paragraphs,
    uniqueWords: uniqueSet.size || words,
    avgWordLength,
    readingMin: words / 225,
    speakingMin: words / 135,
  };
}
