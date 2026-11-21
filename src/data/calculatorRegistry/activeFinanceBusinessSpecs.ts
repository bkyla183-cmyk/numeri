import { CalculatorSpec } from './types';
import { parseNum, calcError } from './validation';
import { calculateCompoundInterest, calculateMortgageSchedule } from '../../utils/calculatorFormulas';

// Standard PMT formula: P * [r(1+r)^n] / [(1+r)^n - 1]
function calculatePMT(
  principal: number,
  annualRatePct: number,
  years: number,
  paymentsPerYear = 12
): { pmt: number; totalPayment: number; totalInterest: number } | null {
  const p = Math.max(0, principal);
  const r = annualRatePct / 100 / paymentsPerYear;
  const n = years * paymentsPerYear;
  if (!Number.isFinite(p) || !Number.isFinite(r) || !Number.isFinite(n) || n <= 0) return null;
  if (r === 0) {
    const pmt = p / n;
    return { pmt, totalPayment: p, totalInterest: 0 };
  }
  const factor = Math.pow(1 + r, n);
  if (!Number.isFinite(factor) || factor === 1) return null;
  const pmt = (p * r * factor) / (factor - 1);
  const totalPayment = pmt * n;
  const totalInterest = totalPayment - p;
  if (!Number.isFinite(pmt) || !Number.isFinite(totalPayment) || !Number.isFinite(totalInterest)) return null;
  return { pmt, totalPayment, totalInterest };
}

function estimateEffectiveApr(
  principal: number,
  periodicPayment: number,
  totalPeriods: number,
  periodsPerYear: number,
  originationFee: number
): number | null {
  const netDisbursed = principal - originationFee;
  if (netDisbursed <= 0 || periodicPayment <= 0 || totalPeriods <= 0) return null;
  if (originationFee === 0) return null;
  if (periodicPayment * totalPeriods <= netDisbursed) return 0;

  let low = 0;
  let high = 5 / periodsPerYear;
  for (let i = 0; i < 60; i++) {
    const mid = (low + high) / 2;
    const pv =
      mid === 0
        ? periodicPayment * totalPeriods
        : periodicPayment * ((1 - Math.pow(1 + mid, -totalPeriods)) / mid);
    if (pv > netDisbursed) low = mid;
    else high = mid;
  }
  return ((low + high) / 2) * periodsPerYear * 100;
}

export const activeFinanceBusinessSpecs: CalculatorSpec[] = [
  {
    slug: 'loan-calculator',
    title: 'Loan Payment Calculator',
    category: 'finance',
    formulaDisplay: 'M = P · [r(1+r)^n] / [(1+r)^n - 1]',
    inputs: [
      { id: 'principal', label: 'Loan Amount ($)', defaultValue: 25000, type: 'number', min: 0, max: 1000000000, step: 500, unit: '$' },
      { id: 'rate', label: 'Annual Interest Rate (%)', defaultValue: 6.5, type: 'number', min: 0, max: 100, step: 0.1, unit: '%' },
      { id: 'term', label: 'Loan Term (Years)', defaultValue: 5, type: 'number', min: 0.1, max: 100, step: 0.5, unit: 'years' },
      {
        id: 'paymentFreq',
        label: 'Payment Frequency',
        type: 'select',
        defaultValue: '12',
        advanced: true,
        options: [
          { label: 'Monthly (12/yr)', value: '12' },
          { label: 'Bi-Weekly (26/yr)', value: '26' },
          { label: 'Weekly (52/yr)', value: '52' },
        ],
      },
      { id: 'extraMonthly', label: 'Extra Principal Per Period ($)', defaultValue: 0, type: 'number', min: 0, step: 25, unit: '$', advanced: true },
      { id: 'originationFee', label: 'Origination Fee ($)', defaultValue: 0, type: 'number', min: 0, step: 50, unit: '$', advanced: true, helpText: 'Upfront fee deducted from proceeds for Effective APR.' },
    ],
    calculate: (v) => {
      const p = parseNum(v.principal);
      const r = parseNum(v.rate);
      const t = parseNum(v.term);
      const freqRaw = v.paymentFreq === undefined ? 12 : parseNum(v.paymentFreq);
      const freq = [12, 26, 52].includes(freqRaw) ? freqRaw : 12;
      const extra = v.extraMonthly === undefined ? 0 : parseNum(v.extraMonthly);
      const fee = v.originationFee === undefined ? 0 : parseNum(v.originationFee);

      if ([p, r, t, extra, fee].some(isNaN)) return calcError('Please enter valid numbers for loan amount, rate, and term.');
      if (p < 0 || p > 1e12) return calcError('Loan amount must be between $0 and $1,000,000,000,000.');
      if (r < 0 || r > 100) return calcError('Annual interest rate must be between 0% and 100%.');
      if (t <= 0 || t > 100) return calcError('Loan term must be between 0.1 and 100 years.');
      if (extra < 0 || fee < 0) return calcError('Extra payments and origination fees cannot be negative.');
      if (p > 0 && fee >= p) return calcError('Origination fee must be less than the loan principal.');

      const res = calculatePMT(p, r, t, freq);
      if (!res) return calcError('Calculated loan schedule exceeds floating-point precision range.');

      const totalPeriods = Math.max(1, Math.round(t * freq));
      let accelPeriods = totalPeriods;
      let accelInterest = res.totalInterest;

      if (extra > 0 && p > 0) {
        const periodicRate = r / 100 / freq;
        let bal = p;
        accelPeriods = 0;
        accelInterest = 0;
        while (bal > 0.005 && accelPeriods < totalPeriods + 1) {
          accelPeriods++;
          const interest = bal * periodicRate;
          let principalPaid = res.pmt - interest + extra;
          if (principalPaid > bal) principalPaid = bal;
          bal = Math.max(0, bal - principalPaid);
          accelInterest += interest;
        }
      }

      const freqUnit = freq === 26 ? '$ / 2 wks' : freq === 52 ? '$ / wk' : '$ / mo';
      const freqLabel = freq === 26 ? 'Bi-Weekly Payment' : freq === 52 ? 'Weekly Payment' : 'Monthly Payment';
      const effApr = estimateEffectiveApr(p, res.pmt, totalPeriods, freq, fee);

      const secondaryOutputs = [
        { label: 'Total Interest Paid', value: `$${accelInterest.toFixed(2)}` },
        { label: 'Total Repayment (incl. Fee)', value: `$${(p + accelInterest + fee).toFixed(2)}` },
        { label: 'Principal Loan Amount', value: `$${p.toFixed(2)}` },
      ];
      if (extra > 0 && accelPeriods < totalPeriods) {
        secondaryOutputs.push({
          label: 'Interest & Periods Saved',
          value: `$${Math.max(0, res.totalInterest - accelInterest).toFixed(2)} (${totalPeriods - accelPeriods} periods faster)`,
        });
      }
      if (effApr !== null && fee > 0) {
        secondaryOutputs.push({ label: 'Effective APR (with Fee)', value: `${effApr.toFixed(2)}%` });
      }

      return {
        primaryValue: parseFloat(res.pmt.toFixed(2)),
        primaryUnit: freqUnit,
        primaryLabel: freqLabel,
        secondaryOutputs,
        steps: [`Amortized over ${totalPeriods} ${freq === 26 ? 'bi-weekly' : freq === 52 ? 'weekly' : 'monthly'} payments at ${r}% APR.`],
        formulaUsed: 'Standard Loan Amortization Formula',
      };
    },
  },
  {
    slug: 'mortgage-calculator',
    title: 'Mortgage Calculator',
    category: 'finance',
    formulaDisplay: 'P&I = P · [r(1+r)^n] / [(1+r)^n - 1]',
    inputs: [
      { id: 'homePrice', label: 'Home Price ($)', defaultValue: 400000, type: 'number', min: 1, max: 1000000000, step: 5000, unit: '$' },
      { id: 'downPayment', label: 'Down Payment ($)', defaultValue: 80000, type: 'number', min: 0, max: 1000000000, step: 5000, unit: '$' },
      { id: 'rate', label: 'Interest Rate (%)', defaultValue: 6.75, type: 'number', min: 0, max: 50, step: 0.1, unit: '%' },
      { id: 'term', label: 'Term (Years)', defaultValue: 30, type: 'number', min: 1, max: 50, step: 5, unit: 'years' },
      { id: 'taxRate', label: 'Annual Property Tax Rate (%)', defaultValue: 1.2, type: 'number', min: 0, max: 25, step: 0.1, unit: '%' },
      { id: 'insurance', label: 'Annual Home Insurance ($)', defaultValue: 1200, type: 'number', min: 0, step: 100, unit: '$' },
      {
        id: 'pmiMode',
        label: 'PMI Handling (when Down < 20%)',
        type: 'select',
        defaultValue: 'auto',
        advanced: true,
        options: [
          { label: 'Auto 0.5% if LTV > 80%', value: 'auto' },
          { label: 'No PMI / Waived', value: 'none' },
        ],
      },
      { id: 'monthlyHoa', label: 'Monthly HOA / Condo Dues ($)', defaultValue: 0, type: 'number', min: 0, step: 25, unit: '$', advanced: true },
      { id: 'extraMonthly', label: 'Extra Monthly Principal ($)', defaultValue: 0, type: 'number', min: 0, step: 50, unit: '$', advanced: true },
    ],
    calculate: (v) => {
      const price = parseNum(v.homePrice);
      const down = parseNum(v.downPayment);
      const rate = parseNum(v.rate);
      const term = parseNum(v.term);
      const taxRate = parseNum(v.taxRate);
      const ins = parseNum(v.insurance);
      const hoa = v.monthlyHoa === undefined ? 0 : parseNum(v.monthlyHoa);
      const extra = v.extraMonthly === undefined ? 0 : parseNum(v.extraMonthly);
      const pmiMode = v.pmiMode === 'none' ? 'none' : 'auto';

      if ([price, down, rate, term, taxRate, ins, hoa, extra].some(isNaN)) {
        return calcError('Please enter valid numeric mortgage parameters.');
      }
      if (price <= 0 || price > 1e12 || down < 0 || down >= price) {
        return calcError('Home price must be > $0 (up to $1T) and down payment must be non-negative and less than home price.');
      }
      if (rate < 0 || rate > 50) return calcError('Interest rate must be between 0% and 50%.');
      if (term <= 0 || term > 50) return calcError('Mortgage term must be between 1 and 50 years.');
      if (taxRate < 0 || ins < 0 || hoa < 0 || extra < 0) return calcError('Taxes, insurance, HOA, and extra payments must be non-negative.');

      const annualTax = price * (taxRate / 100);
      const res = calculateMortgageSchedule({
        homePrice: price,
        downPayment: down,
        annualRatePct: rate,
        termYears: term,
        annualPropertyTax: annualTax,
        annualHomeInsurance: ins,
        monthlyHoa: hoa,
        pmiMode,
        extraMonthly: extra,
      });
      if ('error' in res) return calcError(res.error);

      const secondaryOutputs = [
        { label: 'Principal & Interest', value: `$${res.monthlyPI.toFixed(2)}` },
        { label: 'Property Tax (Est.)', value: `$${res.monthlyTax.toFixed(2)}` },
        { label: 'Homeowners Insurance', value: `$${res.monthlyIns.toFixed(2)}` },
        { label: 'Monthly PMI', value: `$${res.monthlyPmi.toFixed(2)}` },
        { label: '15-Year P&I Benchmark', value: `$${res.monthly15YrPI.toFixed(2)}` },
        { label: 'Total Loan Interest', value: `$${res.totalInterestWithExtra.toFixed(2)}` },
        { label: 'Loan-to-Value (LTV)', value: `${res.ltvPct.toFixed(1)}%` },
      ];
      if (res.monthlyHoa > 0) {
        secondaryOutputs.push({ label: 'Monthly HOA Dues', value: `$${res.monthlyHoa.toFixed(2)}` });
      }
      if (extra > 0 && res.monthsSaved > 0) {
        secondaryOutputs.push({
          label: 'Extra-Payment Savings',
          value: `$${res.interestSaved.toFixed(0)} (${res.monthsSaved} months faster)`,
        });
      }

      return {
        primaryValue: parseFloat(res.totalMonthly.toFixed(2)),
        primaryUnit: '$ / mo',
        primaryLabel: 'Total Monthly PITI Payment',
        secondaryOutputs,
        steps: [
          `Principal & Interest = $${res.monthlyPI.toFixed(2)}`,
          `Escrow Taxes, Insurance, PMI & HOA = $${(res.monthlyTax + res.monthlyIns + res.monthlyPmi + res.monthlyHoa).toFixed(2)}`,
        ],
        formulaUsed: 'PITI Mortgage Equation',
      };
    },
  },
  {
    slug: 'compound-interest-calculator',
    title: 'Compound Interest Calculator',
    category: 'finance',
    formulaDisplay: 'A = P(1 + r/n)^(nt) + PMT · [((1 + r_eff)^m - 1) / r_eff]',
    inputs: [
      { id: 'principal', label: 'Initial Principal ($)', defaultValue: 10000, type: 'number', min: 0, step: 500, unit: '$' },
      { id: 'monthly', label: 'Monthly Contribution ($)', defaultValue: 500, type: 'number', min: 0, step: 50, unit: '$' },
      { id: 'rate', label: 'Annual Interest Rate (%)', defaultValue: 8, type: 'number', min: 0, max: 100, step: 0.25, unit: '%' },
      { id: 'years', label: 'Investment Horizon (Years)', defaultValue: 20, type: 'number', min: 0.5, max: 100, step: 0.5, unit: 'years' },
      {
        id: 'compoundingFreq',
        label: 'Compounding Frequency',
        type: 'select',
        defaultValue: '12',
        advanced: true,
        options: [
          { label: 'Monthly (12/yr)', value: '12' },
          { label: 'Daily (365/yr)', value: '365' },
          { label: 'Quarterly (4/yr)', value: '4' },
          { label: 'Annually (1/yr)', value: '1' },
        ],
      },
      {
        id: 'timing',
        label: 'Contribution Timing',
        type: 'select',
        defaultValue: 'end',
        advanced: true,
        options: [
          { label: 'End of Month (Ordinary)', value: 'end' },
          { label: 'Beginning of Month (Annuity Due)', value: 'beginning' },
        ],
      },
      { id: 'inflationRate', label: 'Expected Inflation Rate (%)', defaultValue: 0, type: 'number', min: -20, max: 50, step: 0.25, unit: '%', advanced: true },
    ],
    calculate: (v) => {
      const p = parseNum(v.principal);
      const m = parseNum(v.monthly);
      const ratePct = parseNum(v.rate);
      const t = parseNum(v.years);
      const freqRaw = v.compoundingFreq === undefined ? 12 : parseNum(v.compoundingFreq);
      const n = [1, 4, 12, 365].includes(freqRaw) ? freqRaw : 12;
      const timing = v.timing === 'beginning' ? 'beginning' : 'end';
      const infPct = v.inflationRate === undefined ? 0 : parseNum(v.inflationRate);

      if ([p, m, ratePct, t, infPct].some(isNaN)) return calcError('Please enter valid numeric values.');
      const res = calculateCompoundInterest({
        principal: p,
        monthlyContribution: m,
        annualRatePct: ratePct,
        years: t,
        compoundingFreq: n,
        timing,
        inflationRatePct: infPct,
      });
      if ('error' in res) return calcError(res.error);
      if (!Number.isFinite(res.futureValue)) {
        return calcError('Projected balance exceeds IEEE 754 finite display limits.');
      }

      const secondaryOutputs = [
        { label: 'Total Interest Earned', value: `$${res.totalInterest.toFixed(2)}` },
        { label: 'Total Principal Invested', value: `$${res.totalPrincipal.toFixed(2)}` },
        { label: 'Effective Annual Yield (APY)', value: `${res.effectiveAnnualRatePct.toFixed(2)}%` },
        { label: 'Growth Multiplier', value: `${res.totalPrincipal > 0 ? (res.futureValue / res.totalPrincipal).toFixed(2) : '0.00'}x` },
      ];
      if (infPct !== 0) {
        secondaryOutputs.push({ label: 'Real Inflation-Adjusted Value', value: `$${res.realFutureValue.toFixed(2)}` });
      }

      return {
        primaryValue: parseFloat(res.futureValue.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: 'Future Portfolio Balance',
        secondaryOutputs,
        steps: [
          `Compounded ${n}x/year (APY = ${res.effectiveAnnualRatePct.toFixed(2)}%, ${timing}-of-month deposits).`,
          `Total Deposits = $${res.totalPrincipal.toFixed(2)}; Total Interest = $${res.totalInterest.toFixed(2)}`,
        ],
        formulaUsed: 'Compound Annuity Future Value',
      };
    },
  },
  {
    slug: 'investment-calculator',
    title: 'Investment Growth Calculator',
    category: 'finance',
    formulaDisplay: 'A = P(1+r)^t + PMT × [((1+r)^t - 1) / r]',
    inputs: [
      { id: 'starting', label: 'Starting Capital ($)', defaultValue: 25000, type: 'number', min: 0, step: 1000, unit: '$' },
      { id: 'annualAdd', label: 'Annual Addition ($)', defaultValue: 6000, type: 'number', min: 0, step: 500, unit: '$' },
      { id: 'returnRate', label: 'Expected Return (%)', defaultValue: 9, type: 'number', min: -99, max: 200, step: 0.5, unit: '%' },
      { id: 'years', label: 'Years to Grow', defaultValue: 15, type: 'number', min: 0, max: 150, step: 0.5, unit: 'years' },
      {
        id: 'timing',
        label: 'Contribution Timing',
        type: 'select',
        defaultValue: 'beginning',
        advanced: true,
        options: [
          { label: 'Beginning of Period', value: 'beginning' },
          { label: 'End of Period', value: 'end' },
        ],
      },
      { id: 'inflationRate', label: 'Assumed Inflation Rate (%)', defaultValue: 0, type: 'number', min: -20, max: 50, step: 0.25, unit: '%', advanced: true },
    ],
    calculate: (v) => {
      const p = parseNum(v.starting);
      const pmt = parseNum(v.annualAdd);
      const ratePct = parseNum(v.returnRate);
      const t = parseNum(v.years);
      const timing = v.timing === 'end' ? 'end' : 'beginning';
      const infPct = v.inflationRate === undefined ? 0 : parseNum(v.inflationRate);

      if ([p, pmt, ratePct, t, infPct].some(isNaN)) return calcError('Please enter valid numbers for all inputs.');
      if (p < 0 || pmt < 0) return calcError('Starting capital and annual addition must be non-negative.');
      if (ratePct < -99 || ratePct > 200) return calcError('Expected return rate must be between -99% and 200%.');
      if (t < 0 || t > 150) return calcError('Investment horizon must be between 0 and 150 years.');
      if (infPct < -20 || infPct > 50) return calcError('Inflation rate must be between -20% and 50%.');

      const r = ratePct / 100;
      const wholeYears = Math.floor(t);
      let bal = p;
      for (let i = 0; i < wholeYears; i++) {
        bal = timing === 'beginning' ? (bal + pmt) * (1 + r) : bal * (1 + r) + pmt;
      }
      const frac = t - wholeYears;
      if (frac > 0) {
        bal =
          timing === 'beginning'
            ? (bal + pmt * frac) * Math.pow(1 + r, frac)
            : bal * Math.pow(1 + r, frac) + pmt * frac;
      }
      if (!Number.isFinite(bal)) {
        return calcError('Projected value exceeds supported display precision limits.');
      }
      const totalContributed = p + pmt * t;
      const realValue = bal / Math.pow(1 + infPct / 100, t);

      const secondaryOutputs = [
        { label: 'Total Contributions', value: `$${totalContributed.toFixed(2)}` },
        { label: 'Total Capital Gains / Interest', value: `$${(bal - totalContributed).toFixed(2)}` },
      ];
      if (infPct !== 0) {
        secondaryOutputs.push({ label: 'Real Purchasing Power', value: `$${realValue.toFixed(2)}` });
      }

      return {
        primaryValue: parseFloat(bal.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: 'Projected Portfolio Value',
        secondaryOutputs,
        steps: [`Compounded annually at ${(r * 100).toFixed(1)}% (${timing} of period) with $${pmt} annual additions.`],
        formulaUsed: 'Annual Compounding with Regular Contributions',
      };
    },
  },
  {
    slug: 'retirement-calculator',
    title: 'Retirement Nest Egg Calculator',
    category: 'finance',
    formulaDisplay: 'Target = Annual Portfolio Draw ÷ Safe Withdrawal Rate',
    inputs: [
      { id: 'annualSpend', label: 'Desired Annual Spending in Retirement ($)', defaultValue: 60000, type: 'number', min: 0, step: 5000, unit: '$' },
      { id: 'socialSecurity', label: 'Expected Annual Pension / Social Security ($)', defaultValue: 20000, type: 'number', min: 0, step: 1000, unit: '$' },
      { id: 'currentSaved', label: 'Current Retirement Savings ($)', defaultValue: 150000, type: 'number', min: 0, step: 10000, unit: '$' },
      { id: 'yearsToRetire', label: 'Years Until Retirement', defaultValue: 20, type: 'number', min: 0, max: 100, step: 1, unit: 'years' },
      { id: 'expectedReturnPct', label: 'Expected Real/Annual Return (%)', defaultValue: 7, type: 'number', min: 0, max: 30, step: 0.5, unit: '%', advanced: true },
      { id: 'swrPct', label: 'Safe Withdrawal Rate (%)', defaultValue: 4, type: 'number', min: 1, max: 15, step: 0.25, unit: '%', advanced: true },
      { id: 'monthlyContrib', label: 'Planned Monthly Savings ($)', defaultValue: 0, type: 'number', min: 0, step: 100, unit: '$', advanced: true },
    ],
    calculate: (v) => {
      const spend = parseNum(v.annualSpend);
      const ss = parseNum(v.socialSecurity);
      const current = parseNum(v.currentSaved);
      const years = parseNum(v.yearsToRetire);
      const retPct = v.expectedReturnPct === undefined ? 7 : parseNum(v.expectedReturnPct);
      const swrPct = v.swrPct === undefined ? 4 : parseNum(v.swrPct);
      const monthlySave = v.monthlyContrib === undefined ? 0 : parseNum(v.monthlyContrib);

      if ([spend, ss, current, years, retPct, swrPct, monthlySave].some(isNaN)) {
        return calcError('Please enter valid numbers for all inputs.');
      }
      if (spend < 0 || ss < 0 || current < 0 || monthlySave < 0) return calcError('Monetary inputs must be non-negative.');
      if (years < 0 || years > 100) return calcError('Years until retirement must be between 0 and 100.');
      if (retPct < 0 || retPct > 30) return calcError('Expected return rate must be between 0% and 30%.');
      if (swrPct < 1 || swrPct > 15) return calcError('Safe withdrawal rate must be between 1% and 15%.');

      const netAnnual = Math.max(0, spend - ss);
      const targetNestEgg = netAnnual / (swrPct / 100);
      const rAnnual = retPct / 100;
      const rMo = rAnnual / 12;
      const months = Math.round(years * 12);
      const futureLump = current * Math.pow(1 + rAnnual, years);
      const futureContrib =
        months === 0
          ? 0
          : rMo === 0
          ? monthlySave * months
          : monthlySave * ((Math.pow(1 + rMo, months) - 1) / rMo);
      const futureProjected = futureLump + futureContrib;

      if (!Number.isFinite(futureProjected) || !Number.isFinite(targetNestEgg)) {
        return calcError('Projected retirement figure exceeds finite display range.');
      }
      const gap = Math.max(0, targetNestEgg - futureProjected);
      let reqMonthly = 0;
      if (gap > 0 && months > 0) {
        reqMonthly = rMo === 0 ? gap / months : (gap * rMo) / (Math.pow(1 + rMo, months) - 1);
      }

      return {
        primaryValue: parseFloat(targetNestEgg.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: `Target Retirement Nest Egg (${swrPct}% Rule)`,
        secondaryOutputs: [
          { label: 'Net Annual Portfolio Draw', value: `$${netAnnual.toLocaleString()}` },
          { label: `Projected Balance (at ${retPct}%)`, value: `$${futureProjected.toFixed(0)}` },
          { label: 'Remaining Gap Needed', value: `$${gap.toFixed(0)}` },
          {
            label: 'Additional Monthly Savings to Close Gap',
            value: gap === 0 ? '$0 (On Track)' : years === 0 ? 'Retiring Now' : `$${reqMonthly.toFixed(0)}/mo`,
          },
        ],
        steps: [
          `Net needed from portfolio = $${spend.toLocaleString()} - $${ss.toLocaleString()} = $${netAnnual.toLocaleString()}`,
          `Nest egg = $${netAnnual.toLocaleString()} ÷ ${swrPct}% = $${targetNestEgg.toLocaleString()}`,
        ],
        formulaUsed: 'Trinity Study Safe Withdrawal Rate (SWR)',
      };
    },
  },
  {
    slug: 'roi-calculator',
    title: 'ROI (Return on Investment) Calculator',
    category: 'finance',
    formulaDisplay: 'ROI = [(Final Value - Total Cost) / Total Cost] × 100',
    inputs: [
      { id: 'cost', label: 'Initial Investment Cost ($)', defaultValue: 10000, type: 'number', min: 0.01, step: 500, unit: '$' },
      { id: 'finalVal', label: 'Final Value / Revenue ($)', defaultValue: 14500, type: 'number', min: 0, step: 500, unit: '$' },
      { id: 'years', label: 'Holding Period (Years)', defaultValue: 3, type: 'number', min: 0.1, max: 150, step: 0.5, unit: 'years' },
      { id: 'additionalCosts', label: 'Fees / Additional Costs ($)', defaultValue: 0, type: 'number', min: 0, step: 100, unit: '$', advanced: true },
    ],
    calculate: (v) => {
      const cost = parseNum(v.cost);
      const finalVal = parseNum(v.finalVal);
      const t = parseNum(v.years);
      const extraCost = v.additionalCosts === undefined ? 0 : parseNum(v.additionalCosts);
      if ([cost, finalVal, t, extraCost].some(isNaN)) {
        return calcError('Please enter valid numbers for cost, final value, and holding period.');
      }
      if (cost <= 0) return calcError('Initial investment cost must be greater than zero.');
      if (finalVal < 0 || extraCost < 0) return calcError('Final value and additional costs cannot be negative.');
      if (t <= 0 || t > 150) return calcError('Holding period must be between 0.1 and 150 years.');

      const totalCost = cost + extraCost;
      const netProfit = finalVal - totalCost;
      const roi = (netProfit / totalCost) * 100;
      const annualized = finalVal === 0 ? -100 : (Math.pow(finalVal / totalCost, 1 / t) - 1) * 100;
      if (!Number.isFinite(roi) || !Number.isFinite(annualized)) {
        return calcError('Calculated ROI exceeds supported numerical range.');
      }
      return {
        primaryValue: parseFloat(roi.toFixed(2)),
        primaryUnit: '%',
        primaryLabel: 'Total Return on Investment (ROI)',
        secondaryOutputs: [
          { label: 'Net Profit ($)', value: `$${netProfit.toFixed(2)}` },
          { label: 'Annualized ROI (CAGR)', value: `${annualized.toFixed(2)}%` },
          { label: 'Investment Multiple (MOIC)', value: `${(finalVal / totalCost).toFixed(2)}x` },
          ...(extraCost > 0 ? [{ label: 'All-In Cost Basis', value: `$${totalCost.toFixed(2)}` }] : []),
        ],
        steps: [`Net Profit = $${finalVal} - $${totalCost} = $${netProfit}`, `ROI = ($${netProfit} / $${totalCost}) × 100 = ${roi.toFixed(2)}%`],
        formulaUsed: 'ROI = (Net Return / Total Cost) × 100',
      };
    },
  },
  {
    slug: 'currency-converter',
    title: 'Currency Converter',
    category: 'finance',
    formulaDisplay: 'Net Converted = Amount × Exchange Rate × (1 - Fee%)',
    inputs: [
      { id: 'amount', label: 'Amount', defaultValue: 100, type: 'number', min: 0, step: 10 },
      { id: 'rate', label: 'Exchange Rate (Source to Target)', defaultValue: 0.92, type: 'number', min: 0.000001, step: 0.001 },
      { id: 'symbol', label: 'Target Currency Code', defaultValue: 'EUR', type: 'text' },
      { id: 'feePct', label: 'Bank Spread / FX Fee (%)', defaultValue: 0, type: 'number', min: 0, max: 50, step: 0.25, unit: '%', advanced: true },
    ],
    calculate: (v) => {
      const amt = parseNum(v.amount);
      const r = parseNum(v.rate);
      const feePct = v.feePct === undefined ? 0 : parseNum(v.feePct);
      const sym = String(v.symbol || 'EUR').trim().toUpperCase() || 'CUR';
      if (isNaN(amt) || isNaN(r) || isNaN(feePct)) return calcError('Please enter valid numbers for amount, rate, and fee.');
      if (amt < 0) return calcError('Currency amount cannot be negative.');
      if (r <= 0) return calcError('Exchange rate must be greater than zero.');
      if (feePct < 0 || feePct > 50) return calcError('FX fee percentage must be between 0% and 50%.');

      const gross = amt * r;
      const feeTarget = gross * (feePct / 100);
      const net = gross - feeTarget;
      return {
        primaryValue: parseFloat(net.toFixed(2)),
        primaryUnit: sym,
        primaryLabel: feePct > 0 ? 'Net Converted Currency (After Fee)' : 'Converted Currency Value',
        secondaryOutputs: [
          { label: 'Inverse Rate (1 ' + sym + ' = Source)', value: parseFloat((1 / r).toFixed(4)) },
          ...(feePct > 0
            ? [
                { label: 'Mid-Market Gross Equivalent', value: `${gross.toFixed(2)} ${sym}` },
                { label: 'FX Fee Deducted', value: `${feeTarget.toFixed(2)} ${sym}` },
              ]
            : []),
        ],
        steps: [`${amt} × ${r}${feePct > 0 ? ` × (1 - ${feePct}%)` : ''} = ${net.toFixed(2)} ${sym}`],
        formulaUsed: 'Foreign Exchange Rate Conversion',
      };
    },
  },
  {
    slug: 'credit-card-payoff-calculator',
    title: 'Credit Card Payoff Calculator',
    category: 'finance',
    formulaDisplay: 'n = -ln(1 - (r·P / PMT)) / ln(1 + r)',
    inputs: [
      { id: 'balance', label: 'Credit Card Balance ($)', defaultValue: 6500, type: 'number', min: 0, step: 100, unit: '$' },
      { id: 'apr', label: 'Annual APR (%)', defaultValue: 22.4, type: 'number', min: 0, max: 200, step: 0.1, unit: '%' },
      { id: 'monthly', label: 'Monthly Payment ($)', defaultValue: 250, type: 'number', min: 1, step: 25, unit: '$' },
      { id: 'extraMonthly', label: 'Extra Monthly Payment ($)', defaultValue: 0, type: 'number', min: 0, step: 25, unit: '$', advanced: true },
    ],
    calculate: (v) => {
      const p = parseNum(v.balance);
      const apr = parseNum(v.apr);
      const basePmt = parseNum(v.monthly);
      const extra = v.extraMonthly === undefined ? 0 : parseNum(v.extraMonthly);
      if ([p, apr, basePmt, extra].some(isNaN)) return calcError('Please enter valid numeric values.');
      if (p < 0 || apr < 0 || apr > 200) return calcError('Balance and APR must be non-negative (APR ≤ 200%).');
      if (extra < 0) return calcError('Extra monthly payment cannot be negative.');
      if (p === 0) {
        return {
          primaryValue: 0,
          primaryUnit: 'months',
          primaryLabel: 'Payoff Time',
          secondaryOutputs: [
            { label: 'Total Interest Paid', value: '$0.00' },
            { label: 'Total Out-of-Pocket Cost', value: '$0.00' },
          ],
          steps: ['Balance is $0. No payoff payments required.'],
          formulaUsed: 'Card Repayment Logarithmic Formula',
        };
      }
      const pmt = basePmt + extra;
      if (basePmt <= 0 || pmt <= 0) return calcError('Monthly payment must be greater than zero.');
      const r = apr / 100 / 12;

      const simulate = (monthlyPay: number) => {
        if (r === 0) return { months: Math.ceil(p / monthlyPay), interest: 0, totalPaid: p };
        const nExact = -Math.log(1 - (r * p) / monthlyPay) / Math.log(1 + r);
        const months = Math.ceil(nExact);
        let rem = p;
        let totalPaid = 0;
        let safety = 0;
        while (rem > 0.005 && safety < 1200) {
          safety++;
          const interestCharge = rem * r;
          const pay = Math.min(rem + interestCharge, monthlyPay);
          rem = rem + interestCharge - pay;
          totalPaid += pay;
        }
        return { months, interest: Math.max(0, totalPaid - p), totalPaid };
      };

      if (r > 0 && p * r >= pmt) {
        return calcError(`Monthly payment must exceed first-month interest ($${(p * r).toFixed(2)}).`, 'Negative Amortization');
      }
      const actual = simulate(pmt);
      const secondaryOutputs = [
        { label: 'Total Interest Paid', value: `$${actual.interest.toFixed(2)}` },
        { label: 'Total Out-of-Pocket Cost', value: `$${actual.totalPaid.toFixed(2)}` },
      ];
      if (extra > 0 && (r === 0 || p * r < basePmt)) {
        const baseline = simulate(basePmt);
        secondaryOutputs.push({
          label: 'Savings from Extra Payment',
          value: `$${Math.max(0, baseline.interest - actual.interest).toFixed(2)} (${Math.max(0, baseline.months - actual.months)} mos faster)`,
        });
      }

      return {
        primaryValue: actual.months,
        primaryUnit: 'months',
        primaryLabel: 'Payoff Time',
        secondaryOutputs,
        steps: [`At $${pmt}/mo and ${apr}% APR, debt clears in ${actual.months} months (${(actual.months / 12).toFixed(1)} years).`],
        formulaUsed: 'Card Repayment Logarithmic Formula',
      };
    },
  },
  {
    slug: 'car-loan-calculator',
    title: 'Car Loan Calculator',
    category: 'finance',
    formulaDisplay: 'M = P · [r(1+r)^n] / [(1+r)^n - 1]',
    inputs: [
      { id: 'vehiclePrice', label: 'Vehicle Purchase Price ($)', defaultValue: 32000, type: 'number', min: 0, max: 10000000, step: 1000, unit: '$' },
      { id: 'downPayment', label: 'Cash Down Payment ($)', defaultValue: 6000, type: 'number', min: 0, step: 500, unit: '$' },
      { id: 'apr', label: 'Interest Rate (%)', defaultValue: 5.9, type: 'number', min: 0, max: 100, step: 0.1, unit: '%' },
      { id: 'termMonths', label: 'Loan Term (Months)', defaultValue: 60, type: 'number', min: 1, max: 240, step: 12, unit: 'mo' },
      { id: 'tradeInValue', label: 'Trade-In Allowance ($)', defaultValue: 0, type: 'number', min: 0, step: 500, unit: '$', advanced: true },
      { id: 'salesTaxPct', label: 'Auto Sales Tax Rate (%)', defaultValue: 0, type: 'number', min: 0, max: 25, step: 0.25, unit: '%', advanced: true },
      { id: 'dealerFees', label: 'Title, Doc & Dealer Fees ($)', defaultValue: 0, type: 'number', min: 0, step: 100, unit: '$', advanced: true },
    ],
    calculate: (v) => {
      const price = parseNum(v.vehiclePrice);
      const down = parseNum(v.downPayment);
      const apr = parseNum(v.apr);
      const months = parseNum(v.termMonths);
      const tradeIn = v.tradeInValue === undefined ? 0 : parseNum(v.tradeInValue);
      const taxPct = v.salesTaxPct === undefined ? 0 : parseNum(v.salesTaxPct);
      const fees = v.dealerFees === undefined ? 0 : parseNum(v.dealerFees);

      if ([price, down, apr, months, tradeIn, taxPct, fees].some(isNaN)) {
        return calcError('Please enter valid numbers for all vehicle loan inputs.');
      }
      if (price < 0 || price > 1e12 || down < 0 || tradeIn < 0 || fees < 0) {
        return calcError('Vehicle price, down payment, trade-in, and fees must be non-negative (up to $1T).');
      }
      if (apr < 0 || apr > 100) return calcError('APR must be between 0% and 100%.');
      if (months <= 0 || months > 240) return calcError('Auto loan term must be between 1 and 240 months.');
      if (taxPct < 0 || taxPct > 25) return calcError('Sales tax rate must be between 0% and 25%.');

      const taxableAmount = Math.max(0, price - tradeIn);
      const salesTax = taxableAmount * (taxPct / 100);
      const otdPrice = price + salesTax + fees;
      const loan = Math.max(0, otdPrice - down - tradeIn);
      const res = calculatePMT(loan, apr, months / 12, 12);
      if (!res) return calcError('Loan schedule exceeds numerical range.');

      return {
        primaryValue: parseFloat(res.pmt.toFixed(2)),
        primaryUnit: '$ / mo',
        primaryLabel: 'Estimated Auto Payment',
        secondaryOutputs: [
          { label: 'Amount Financed', value: `$${loan.toFixed(2)}` },
          { label: 'Total Interest Paid', value: `$${res.totalInterest.toFixed(2)}` },
          { label: 'Out-the-Door Price (w/ Tax & Fees)', value: `$${otdPrice.toFixed(2)}` },
          { label: 'Total Loan Payments', value: `$${res.totalPayment.toFixed(2)}` },
        ],
        steps: [`OTD = $${price} + $${salesTax.toFixed(2)} tax + $${fees} fees; Financing $${loan.toFixed(2)} over ${months} months at ${apr}% APR.`],
        formulaUsed: 'Vehicle Loan Amortization',
      };
    },
  },
  {
    slug: '401k-calculator',
    title: '401(k) Retirement Calculator with Employer Match',
    category: 'finance',
    formulaDisplay: 'Monthly Compounded Growth with Employer Match Cap & Salary Growth',
    inputs: [
      { id: 'salary', label: 'Annual Salary ($)', defaultValue: 85000, type: 'number', min: 0, step: 2500, unit: '$' },
      { id: 'contribPct', label: 'Your Contribution (%)', defaultValue: 8, type: 'number', min: 0, max: 100, step: 1, unit: '%' },
      { id: 'matchPct', label: 'Employer Match Rate (%)', defaultValue: 50, type: 'number', min: 0, max: 200, step: 5, unit: '%' },
      { id: 'matchLimit', label: 'Employer Match Cap on Salary (%)', defaultValue: 6, type: 'number', min: 0, max: 100, step: 1, unit: '%' },
      { id: 'currentBal', label: 'Current 401(k) Balance ($)', defaultValue: 45000, type: 'number', min: 0, step: 5000, unit: '$' },
      { id: 'years', label: 'Years to Retirement', defaultValue: 25, type: 'number', min: 0, max: 100, step: 0.5, unit: 'years' },
      { id: 'returnRate', label: 'Assumed Annual Return (%)', defaultValue: 7.5, type: 'number', min: -99, max: 100, step: 0.5, unit: '%' },
      { id: 'salaryGrowthPct', label: 'Expected Annual Raise (%)', defaultValue: 0, type: 'number', min: 0, max: 20, step: 0.5, unit: '%', advanced: true },
      {
        id: 'applyIrsCap',
        label: 'Apply 2025 IRS Elective Cap ($23,500/yr)',
        type: 'select',
        defaultValue: 'no',
        advanced: true,
        options: [
          { label: 'No (Uncapped Projection)', value: 'no' },
          { label: 'Yes (Cap Employee at $23,500/yr)', value: 'yes' },
        ],
      },
    ],
    calculate: (v) => {
      const sal = parseNum(v.salary);
      const contribPct = parseNum(v.contribPct);
      const matchPct = parseNum(v.matchPct);
      const matchLimit = parseNum(v.matchLimit);
      const returnRate = parseNum(v.returnRate);
      const years = parseNum(v.years);
      const startBal = parseNum(v.currentBal);
      const salGrowthPct = v.salaryGrowthPct === undefined ? 0 : parseNum(v.salaryGrowthPct);
      const capIrs = v.applyIrsCap === 'yes';

      if ([sal, contribPct, matchPct, matchLimit, returnRate, years, startBal, salGrowthPct].some(isNaN)) {
        return calcError('Please enter valid numbers for all 401(k) fields.');
      }
      if (sal < 0 || startBal < 0 || contribPct < 0 || matchPct < 0 || matchLimit < 0 || salGrowthPct < 0) {
        return calcError('Salary, balance, raise rate, and percentages cannot be negative.');
      }
      if (returnRate < -99 || returnRate > 100) return calcError('Assumed return rate must be between -99% and 100%.');
      if (years < 0 || years > 100) return calcError('Years to retirement must be between 0 and 100.');

      const userPct = contribPct / 100;
      const matchRate = matchPct / 100;
      const matchCap = matchLimit / 100;
      const rMo = returnRate / 100 / 12;
      const totalMonths = Math.round(years * 12);

      let bal = startBal;
      let totalUserContrib = 0;
      let totalMatchContrib = 0;
      const irs2025Cap = 23500;

      for (let m = 0; m < totalMonths; m++) {
        const yearIdx = Math.floor(m / 12);
        const curSalary = sal * Math.pow(1 + salGrowthPct / 100, yearIdx);
        const rawUserAnnual = curSalary * userPct;
        const userAnnualY = capIrs ? Math.min(rawUserAnnual, irs2025Cap) : rawUserAnnual;
        const effUserPct = curSalary > 0 ? userAnnualY / curSalary : 0;
        const matchAnnualY = curSalary * Math.min(effUserPct, matchCap) * matchRate;
        const monthlyUser = userAnnualY / 12;
        const monthlyMatch = matchAnnualY / 12;

        bal = bal * (1 + rMo) + monthlyUser + monthlyMatch;
        totalUserContrib += monthlyUser;
        totalMatchContrib += monthlyMatch;
      }

      if (!Number.isFinite(bal)) return calcError('Projected 401(k) balance exceeds finite display range.');

      const yr1User = capIrs ? Math.min(sal * userPct, irs2025Cap) : sal * userPct;
      const yr1EffPct = sal > 0 ? yr1User / sal : 0;
      const yr1Match = sal * Math.min(yr1EffPct, matchCap) * matchRate;

      return {
        primaryValue: parseFloat(bal.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: 'Estimated 401(k) Balance at Retirement',
        secondaryOutputs: [
          { label: 'Year 1 Employee Contribution', value: `$${yr1User.toFixed(2)}` },
          { label: 'Year 1 Employer Match (Free Money)', value: `$${yr1Match.toFixed(2)}` },
          { label: 'Cumulative Contributions + Match', value: `$${(totalUserContrib + totalMatchContrib).toFixed(2)}` },
          { label: 'Total Investment Growth', value: `$${Math.max(0, bal - startBal - totalUserContrib - totalMatchContrib).toFixed(2)}` },
        ],
        steps: [
          `Monthly compounding over ${totalMonths} months at ${returnRate}% APR${salGrowthPct > 0 ? ` with ${salGrowthPct}% annual raises` : ''}.`,
          `Year 1 addition: $${yr1User.toFixed(2)} employee + $${yr1Match.toFixed(2)} match = $${(yr1User + yr1Match).toFixed(2)}/yr.`,
        ],
        formulaUsed: '401(k) Monthly Compounding & Match Formula',
      };
    },
  },
  {
    slug: 'inflation-calculator',
    title: 'Inflation & Purchasing Power Calculator',
    category: 'finance',
    formulaDisplay: 'Future Cost = Cost × (1 + i)^t   |   Real Power = Amount / (1 + i)^t',
    inputs: [
      { id: 'amount', label: 'Amount ($)', defaultValue: 1000, type: 'number', min: 0, step: 100, unit: '$' },
      { id: 'inflationRate', label: 'Average Annual Inflation (%)', defaultValue: 3.2, type: 'number', min: -99, max: 200, step: 0.1, unit: '%' },
      { id: 'years', label: 'Years', defaultValue: 20, type: 'number', min: 0, max: 200, step: 1, unit: 'years' },
      {
        id: 'mode',
        label: 'Calculation Mode',
        type: 'select',
        defaultValue: 'future_cost',
        options: [
          { label: 'Future Cost of Goods Today', value: 'future_cost' },
          { label: 'Today Purchasing Power of Future Sum', value: 'purchasing_power' },
        ],
      },
    ],
    calculate: (v) => {
      const amt = parseNum(v.amount);
      const infPct = parseNum(v.inflationRate);
      const t = parseNum(v.years);
      const mode = v.mode === 'purchasing_power' ? 'purchasing_power' : 'future_cost';
      if ([amt, infPct, t].some(isNaN)) return calcError('Please enter valid numbers for amount, inflation rate, and years.');
      if (amt < 0) return calcError('Amount cannot be negative.');
      if (infPct < -99 || infPct > 200) return calcError('Annual inflation rate must be between -99% and 200%.');
      if (t < 0 || t > 200) return calcError('Years must be between 0 and 200.');
      const i = infPct / 100;
      const mult = Math.pow(1 + i, t);
      const futureCost = amt * mult;
      const futurePurchasingPower = mult > 0 ? amt / mult : 0;
      if (!Number.isFinite(futureCost) || !Number.isFinite(futurePurchasingPower)) {
        return calcError('Cumulative inflation factor exceeds finite floating-point limits.');
      }
      const primary = mode === 'purchasing_power' ? futurePurchasingPower : futureCost;
      return {
        primaryValue: parseFloat(primary.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: mode === 'purchasing_power' ? "Real Value in Today's Dollars" : 'Future Cost Equivalent',
        secondaryOutputs: [
          {
            label: mode === 'purchasing_power' ? 'Nominal Future Cost Equivalent' : "Future Purchasing Power of Today's $" + amt,
            value: `$${(mode === 'purchasing_power' ? futureCost : futurePurchasingPower).toFixed(2)}`,
          },
          { label: 'Cumulative Price Increase', value: `${((mult - 1) * 100).toFixed(1)}%` },
        ],
        steps: [`Inflation multiplier = (1 + ${i})^${t} = ${mult.toFixed(4)}`],
        formulaUsed: 'Compound Price Inflation Index',
      };
    },
  },
  {
    slug: 'student-loan-calculator',
    title: 'Student Loan Payoff Calculator',
    description: 'Calculate monthly payments, total interest paid, and payoff schedule for college student loans.',
    inputs: [
      { id: 'loan_balance', label: 'Total Student Loan Balance ($)', type: 'number', defaultValue: 32000, min: 0, max: 10000000, step: 500, unit: '$' },
      { id: 'interest_rate', label: 'Annual Interest Rate (%)', type: 'number', defaultValue: 5.5, min: 0, max: 100, step: 0.1, unit: '%' },
      { id: 'loan_term_years', label: 'Repayment Term (Years)', type: 'number', defaultValue: 10, min: 1, max: 50, step: 1, unit: 'years' },
      { id: 'extraMonthly', label: 'Extra Monthly Principal ($)', type: 'number', defaultValue: 0, min: 0, step: 25, unit: '$', advanced: true },
    ],
    calculate: (inputs) => {
      const P = parseNum(inputs.loan_balance);
      const ratePct = parseNum(inputs.interest_rate);
      const termYears = parseNum(inputs.loan_term_years);
      const extra = inputs.extraMonthly === undefined ? 0 : parseNum(inputs.extraMonthly);
      if ([P, ratePct, termYears, extra].some(isNaN)) {
        return calcError('Please enter valid numbers for student loan balance, rate, and term.');
      }
      if (P < 0 || P > 1e12) return calcError('Student loan balance must be between $0 and $1,000,000,000,000.');
      if (ratePct < 0 || ratePct > 100) return calcError('Interest rate must be between 0% and 100%.');
      if (termYears <= 0 || termYears > 50) return calcError('Repayment term must be between 1 and 50 years.');
      if (extra < 0) return calcError('Extra monthly payment cannot be negative.');

      const res = calculatePMT(P, ratePct, termYears, 12);
      if (!res) return calcError('Student loan calculation exceeds finite numerical range.');
      const n = Math.round(termYears * 12);

      let accelMonths = n;
      let accelInterest = res.totalInterest;
      if (extra > 0 && P > 0) {
        const rMo = ratePct / 100 / 12;
        let bal = P;
        accelMonths = 0;
        accelInterest = 0;
        while (bal > 0.005 && accelMonths < n + 1) {
          accelMonths++;
          const interest = bal * rMo;
          const payPrincipal = Math.min(bal, res.pmt - interest + extra);
          bal = Math.max(0, bal - payPrincipal);
          accelInterest += interest;
        }
      }

      const secondaryOutputs: Array<{ label: string; value: string | number; unit?: string }> = [
        { label: 'Total Repayment', value: parseFloat((P + accelInterest).toFixed(2)), unit: '$' },
        { label: 'Total Interest Paid', value: parseFloat(accelInterest.toFixed(2)), unit: '$' },
        { label: 'Payoff Duration', value: accelMonths, unit: 'months' },
      ];
      if (extra > 0 && accelMonths < n) {
        secondaryOutputs.push({
          label: 'Savings from Extra Payment',
          value: `$${Math.max(0, res.totalInterest - accelInterest).toFixed(2)} (${n - accelMonths} mos saved)`,
        });
      }

      return {
        primaryOutput: parseFloat(res.pmt.toFixed(2)),
        primaryUnit: '$/Month',
        secondaryOutputs,
        steps: [
          'Formula: M = P[r(1+r)^n] / [(1+r)^n - 1]',
          `Monthly payment for $${P.toLocaleString()} over ${termYears} years @ ${ratePct}%: $${res.pmt.toFixed(2)}`,
          `Total interest: $${accelInterest.toFixed(2)}`,
        ],
      };
    },
  },
  {
    slug: 'gross-margin-calculator',
    title: 'Gross Margin Calculator',
    category: 'business-tax',
    formulaDisplay: 'Gross Margin % = [(Revenue - COGS) / Revenue] × 100',
    inputs: [
      {
        id: 'mode',
        label: 'Calculation Mode',
        type: 'select',
        defaultValue: 'from_rev_cogs',
        options: [
          { label: 'Find Margin from Revenue & COGS', value: 'from_rev_cogs' },
          { label: 'Find Selling Price for Target Margin %', value: 'target_margin_price' },
        ],
      },
      { id: 'revenue', label: 'Total Revenue ($)', defaultValue: 100000, type: 'number', min: 0.01, step: 1000, unit: '$', visibleWhen: (v) => v.mode !== 'target_margin_price' },
      { id: 'cogs', label: 'Cost of Goods Sold (COGS) ($)', defaultValue: 60000, type: 'number', min: 0, step: 1000, unit: '$' },
      { id: 'targetMarginPct', label: 'Target Gross Margin (%)', defaultValue: 40, type: 'number', min: 0, max: 99.9, step: 1, unit: '%', visibleWhen: (v) => v.mode === 'target_margin_price' },
    ],
    calculate: (v) => {
      const mode = v.mode === 'target_margin_price' ? 'target_margin_price' : 'from_rev_cogs';
      const cogs = parseNum(v.cogs);
      if (isNaN(cogs) || cogs < 0) return calcError('Cost of Goods Sold (COGS) must be a non-negative number.');

      if (mode === 'target_margin_price') {
        const targetPct = parseNum(v.targetMarginPct);
        if (isNaN(targetPct) || targetPct < 0 || targetPct >= 100) {
          return calcError('Target gross margin must be between 0% and 99.9%.');
        }
        const price = cogs / (1 - targetPct / 100);
        const profit = price - cogs;
        const markup = cogs > 0 ? (profit / cogs) * 100 : 0;
        return {
          primaryValue: parseFloat(price.toFixed(2)),
          primaryUnit: '$',
          primaryLabel: `Required Selling Price (${targetPct}% Margin)`,
          secondaryOutputs: [
            { label: 'Gross Profit ($)', value: `$${profit.toFixed(2)}` },
            { label: 'Equivalent Markup on Cost', value: cogs > 0 ? `${markup.toFixed(2)}%` : 'N/A' },
          ],
          steps: [`Price = COGS / (1 - ${targetPct / 100}) = $${cogs} / ${(1 - targetPct / 100).toFixed(4)} = $${price.toFixed(2)}`],
          formulaUsed: 'Price = COGS / (1 - Target Margin)',
        };
      }

      const rev = parseNum(v.revenue);
      if (isNaN(rev) || rev <= 0) return calcError('Total revenue must be greater than zero.');
      const profit = rev - cogs;
      const margin = (profit / rev) * 100;
      const markup = cogs > 0 ? (profit / cogs) * 100 : 0;
      return {
        primaryValue: parseFloat(margin.toFixed(2)),
        primaryUnit: '%',
        primaryLabel: 'Gross Margin',
        secondaryOutputs: [
          { label: 'Gross Profit ($)', value: `$${profit.toFixed(2)}` },
          { label: 'Markup on Cost', value: cogs > 0 ? `${markup.toFixed(2)}%` : 'N/A (COGS = $0)' },
        ],
        steps: [`Gross Profit = $${rev} - $${cogs} = $${profit}`, `Margin = ($${profit} / $${rev}) × 100 = ${margin.toFixed(2)}%`],
        formulaUsed: 'Margin = (Gross Profit / Revenue) × 100',
      };
    },
  },
  {
    slug: 'income-tax-calculator',
    title: 'US Federal Income Tax Calculator (2024 / 2025)',
    category: 'business-tax',
    formulaDisplay: 'Progressive 2024 & 2025 IRS Federal Tax Brackets',
    inputs: [
      { id: 'grossIncome', label: 'Annual Gross Income ($)', defaultValue: 85000, type: 'number', min: 0, step: 2500, unit: '$' },
      {
        id: 'taxYear',
        label: 'Tax Year (IRS Rev. Proc.)',
        type: 'select',
        defaultValue: '2024',
        options: [
          { label: '2024 Tax Year (Rev. Proc. 2023-34)', value: '2024' },
          { label: '2025 Tax Year (Rev. Proc. 2024-40)', value: '2025' },
        ],
      },
      {
        id: 'filingStatus',
        label: 'Filing Status',
        type: 'select',
        defaultValue: 'single',
        options: [
          { label: 'Single', value: 'single' },
          { label: 'Married Filing Jointly (MFJ)', value: 'mfj' },
          { label: 'Head of Household (HOH)', value: 'hoh' },
        ],
      },
      { id: 'pretaxDeductions', label: 'Pre-Tax 401(k) / HSA Deductions ($/yr)', defaultValue: 0, type: 'number', min: 0, step: 500, unit: '$', advanced: true },
      { id: 'itemizedDeduction', label: 'Itemized Deductions (if > Std Ded, $)', defaultValue: 0, type: 'number', min: 0, step: 500, unit: '$', advanced: true },
    ],
    calculate: (v) => {
      const gross = parseNum(v.grossIncome);
      const pretax = v.pretaxDeductions === undefined ? 0 : parseNum(v.pretaxDeductions);
      const itemized = v.itemizedDeduction === undefined ? 0 : parseNum(v.itemizedDeduction);
      if ([gross, pretax, itemized].some(isNaN) || gross < 0 || pretax < 0 || itemized < 0) {
        return calcError('Gross income and deductions must be non-negative numbers.');
      }

      const year = v.taxYear === '2025' ? '2025' : '2024';
      const status = v.filingStatus === 'mfj' ? 'mfj' : v.filingStatus === 'hoh' ? 'hoh' : 'single';

      const stdDed =
        year === '2025'
          ? status === 'mfj' ? 30000 : status === 'hoh' ? 22500 : 15000
          : status === 'mfj' ? 29200 : status === 'hoh' ? 21900 : 14600;

      const agi = Math.max(0, gross - pretax);
      const claimedDed = Math.max(stdDed, itemized);
      const taxable = Math.max(0, agi - claimedDed);

      const brackets: [number, number][] =
        year === '2025'
          ? status === 'mfj'
            ? [[23850, 0.10], [96950, 0.12], [206700, 0.22], [394600, 0.24], [501050, 0.32], [751600, 0.35], [Infinity, 0.37]]
            : status === 'hoh'
            ? [[17000, 0.10], [64850, 0.12], [103350, 0.22], [197300, 0.24], [250500, 0.32], [626350, 0.35], [Infinity, 0.37]]
            : [[11925, 0.10], [48475, 0.12], [103350, 0.22], [197300, 0.24], [250525, 0.32], [626350, 0.35], [Infinity, 0.37]]
          : status === 'mfj'
          ? [[23200, 0.10], [94300, 0.12], [201050, 0.22], [383900, 0.24], [487450, 0.32], [731200, 0.35], [Infinity, 0.37]]
          : status === 'hoh'
          ? [[16550, 0.10], [63100, 0.12], [100500, 0.22], [191950, 0.24], [243700, 0.32], [609350, 0.35], [Infinity, 0.37]]
          : [[11600, 0.10], [47150, 0.12], [100525, 0.22], [191950, 0.24], [243725, 0.32], [609350, 0.35], [Infinity, 0.37]];

      let tax = 0;
      let prevLimit = 0;
      let marginalRate = 0.10;
      for (const [limit, rate] of brackets) {
        if (taxable > prevLimit) {
          const taxableInBracket = Math.min(taxable, limit) - prevLimit;
          tax += taxableInBracket * rate;
          marginalRate = rate;
          prevLimit = limit;
        } else break;
      }
      const effectiveRate = gross > 0 ? (tax / gross) * 100 : 0;
      return {
        primaryValue: parseFloat(tax.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: `Estimated ${year} Federal Income Tax`,
        secondaryOutputs: [
          { label: 'Effective Tax Rate', value: `${effectiveRate.toFixed(2)}%` },
          { label: 'Marginal Tax Bracket', value: `${taxable > 0 ? (marginalRate * 100).toFixed(0) : '0'}%` },
          { label: itemized > stdDed ? 'Itemized Deduction Claimed' : 'Standard Deduction Claimed', value: `$${claimedDed.toLocaleString()}` },
          { label: 'Taxable Income Base', value: `$${taxable.toLocaleString()}` },
        ],
        steps: [
          `${year} ${status.toUpperCase()} AGI = $${agi.toLocaleString()}; Deduction = $${claimedDed.toLocaleString()}`,
          `Taxable Income = $${taxable.toLocaleString()}`,
          `Progressive tax across ${year} IRS brackets = $${tax.toFixed(2)}`,
        ],
        formulaUsed: `${year} IRS Progressive Tax Brackets`,
      };
    },
  },
  {
    slug: 'sales-tax-calculator',
    title: 'Sales Tax & Total Price Calculator',
    category: 'business-tax',
    formulaDisplay: 'Total = Price × (1 + Rate)   |   Pre-Tax = Total ÷ (1 + Rate)',
    inputs: [
      {
        id: 'mode',
        label: 'Calculation Mode',
        type: 'select',
        defaultValue: 'add',
        options: [
          { label: 'Add Sales Tax to Pre-Tax Price', value: 'add' },
          { label: 'Extract Sales Tax from Receipt Total', value: 'extract' },
        ],
      },
      { id: 'price', label: 'Amount ($)', defaultValue: 150, type: 'number', min: 0, step: 5, unit: '$' },
      { id: 'rate', label: 'Sales Tax Rate (%)', defaultValue: 8.25, type: 'number', min: 0, max: 100, step: 0.25, unit: '%' },
    ],
    calculate: (v) => {
      const p = parseNum(v.price);
      const rPct = parseNum(v.rate);
      const mode = v.mode === 'extract' ? 'extract' : 'add';
      if (isNaN(p) || isNaN(rPct)) return calcError('Please enter valid numbers for price and sales tax rate.');
      if (p < 0 || rPct < 0 || rPct > 100) return calcError('Price must be ≥ 0 and sales tax rate between 0% and 100%.');
      const r = rPct / 100;

      if (mode === 'extract') {
        const preTax = p / (1 + r);
        const tax = p - preTax;
        return {
          primaryValue: parseFloat(preTax.toFixed(2)),
          primaryUnit: '$',
          primaryLabel: 'Pre-Tax Subtotal Extracted',
          secondaryOutputs: [
            { label: 'Sales Tax Included', value: `$${tax.toFixed(2)}` },
            { label: 'Receipt Total (Gross)', value: `$${p.toFixed(2)}` },
          ],
          steps: [`Pre-Tax = $${p} / (1 + ${rPct / 100}) = $${preTax.toFixed(2)}`, `Tax = $${tax.toFixed(2)}`],
          formulaUsed: 'Pre-Tax = Total / (1 + Rate)',
        };
      }

      const tax = p * r;
      const total = p + tax;
      return {
        primaryValue: parseFloat(total.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: 'Total Price (Including Tax)',
        secondaryOutputs: [
          { label: 'Sales Tax Amount', value: `$${tax.toFixed(2)}` },
          { label: 'Pre-Tax Subtotal', value: `$${p.toFixed(2)}` },
        ],
        steps: [`Tax = $${p} × ${rPct}% = $${tax.toFixed(2)}`, `Total = $${p} + $${tax.toFixed(2)} = $${total.toFixed(2)}`],
        formulaUsed: 'Tax = Price × Rate',
      };
    },
  },
  {
    slug: 'hourly-to-salary-calculator',
    title: 'Hourly to Salary Wage Calculator',
    category: 'business-tax',
    formulaDisplay: 'Annual = (Hourly × Regular + Overtime Pay) × Weeks/Year',
    inputs: [
      { id: 'hourly', label: 'Hourly Pay Rate ($)', defaultValue: 35, type: 'number', min: 0, step: 0.5, unit: '$/hr' },
      { id: 'hoursWeek', label: 'Regular Hours / Week', defaultValue: 40, type: 'number', min: 1, max: 168, step: 1, unit: 'hrs' },
      { id: 'weeksYear', label: 'Paid Weeks per Year', defaultValue: 52, type: 'number', min: 1, max: 52, step: 1, unit: 'weeks' },
      { id: 'overtimeHours', label: 'Weekly Overtime Hours', defaultValue: 0, type: 'number', min: 0, max: 80, step: 1, unit: 'hrs', advanced: true },
      { id: 'overtimeMult', label: 'Overtime Multiplier', defaultValue: 1.5, type: 'number', min: 1, max: 5, step: 0.25, unit: 'x', advanced: true },
    ],
    calculate: (v) => {
      const rate = parseNum(v.hourly);
      const hrs = parseNum(v.hoursWeek);
      const wks = parseNum(v.weeksYear);
      const otHrs = v.overtimeHours === undefined ? 0 : parseNum(v.overtimeHours);
      const otMult = v.overtimeMult === undefined ? 1.5 : parseNum(v.overtimeMult);

      if ([rate, hrs, wks, otHrs, otMult].some(isNaN)) return calcError('Please enter valid numeric values.');
      if (rate < 0 || hrs <= 0 || hrs > 168 || wks <= 0 || wks > 52 || otHrs < 0 || otMult < 1 || hrs + otHrs > 168) {
        return calcError('Hourly rate ≥ 0, total weekly hours 1–168, and paid weeks 1–52.');
      }
      const weeklyPay = rate * hrs + rate * otMult * otHrs;
      const annual = weeklyPay * wks;
      const monthly = annual / 12;
      const biweekly = annual / 26;
      return {
        primaryValue: parseFloat(annual.toFixed(2)),
        primaryUnit: '$ / yr',
        primaryLabel: 'Annual Salary Equivalent',
        secondaryOutputs: [
          { label: 'Monthly Equivalent', value: `$${monthly.toFixed(2)}` },
          { label: 'Bi-Weekly Paycheck', value: `$${biweekly.toFixed(2)}` },
          { label: 'Weekly Paycheck', value: `$${weeklyPay.toFixed(2)}` },
        ],
        steps: [`Weekly Pay = $${rate}×${hrs}${otHrs > 0 ? ` + $${rate}×${otMult}×${otHrs} OT` : ''} = $${weeklyPay.toFixed(2)}; Annual = $${annual.toFixed(2)}`],
        formulaUsed: 'Salary = Weekly Pay × Paid Weeks',
      };
    },
  },
  {
    slug: 'salary-to-hourly-calculator',
    title: 'Salary to Hourly Rate Calculator',
    category: 'business-tax',
    formulaDisplay: 'Hourly Rate = Annual Salary / (Hours/Week × Weeks/Year)',
    inputs: [
      { id: 'salary', label: 'Annual Salary ($)', defaultValue: 75000, type: 'number', min: 0, step: 2500, unit: '$' },
      { id: 'hoursWeek', label: 'Weekly Work Hours', defaultValue: 40, type: 'number', min: 1, max: 168, step: 1, unit: 'hrs' },
      { id: 'weeksYear', label: 'Weeks Worked per Year', defaultValue: 52, type: 'number', min: 1, max: 52, step: 1, unit: 'weeks', advanced: true },
    ],
    calculate: (v) => {
      const sal = parseNum(v.salary);
      const hrs = parseNum(v.hoursWeek);
      const wks = v.weeksYear === undefined ? 52 : parseNum(v.weeksYear);
      if ([sal, hrs, wks].some(isNaN)) return calcError('Please enter valid numeric salary, hours, and weeks.');
      if (sal < 0 || hrs <= 0 || hrs > 168 || wks <= 0 || wks > 52) {
        return calcError('Salary must be ≥ 0, weekly hours 1–168, and weeks 1–52.');
      }
      const totalHours = hrs * wks;
      const hourly = sal / totalHours;
      return {
        primaryValue: parseFloat(hourly.toFixed(2)),
        primaryUnit: '$/hr',
        primaryLabel: 'Equivalent Hourly Wage',
        secondaryOutputs: [
          { label: 'Daily Pay (8-hr day)', value: `$${(hourly * 8).toFixed(2)}` },
          { label: 'Monthly Gross Salary', value: `$${(sal / 12).toFixed(2)}` },
          { label: 'Annual Working Hours', value: totalHours },
        ],
        steps: [`Total hours = ${hrs} × ${wks} = ${totalHours}`, `Hourly = $${sal} / ${totalHours} = $${hourly.toFixed(2)}`],
        formulaUsed: 'Hourly = Salary / (Hours/Week × Weeks/Year)',
      };
    },
  },
  {
    slug: 'take-home-pay-calculator',
    title: 'Take-Home Pay (Net Paycheck) Calculator',
    category: 'business-tax',
    formulaDisplay: 'Net = Gross - (Gross - Pretax)·(Fed + State) - Gross·FICA - Pretax',
    inputs: [
      { id: 'grossAnnual', label: 'Gross Annual Pay ($)', defaultValue: 75000, type: 'number', min: 0, step: 2500, unit: '$' },
      { id: 'fedTaxPct', label: 'Est. Federal Tax (%)', defaultValue: 12, type: 'number', min: 0, max: 60, step: 0.5, unit: '%' },
      { id: 'stateTaxPct', label: 'Est. State Tax (%)', defaultValue: 5, type: 'number', min: 0, max: 30, step: 0.5, unit: '%' },
      { id: 'ficaPct', label: 'FICA (Social Security & Medicare) (%)', defaultValue: 7.65, type: 'number', min: 0, max: 20, step: 0.05, unit: '%' },
      { id: 'pretax', label: 'Monthly 401(k) / Healthcare ($)', defaultValue: 300, type: 'number', min: 0, step: 50, unit: '$' },
      {
        id: 'payFrequency',
        label: 'Paycheck Breakdown Frequency',
        type: 'select',
        defaultValue: 'biweekly',
        advanced: true,
        options: [
          { label: 'Bi-Weekly (26 paychecks/yr)', value: 'biweekly' },
          { label: 'Semi-Monthly (24 paychecks/yr)', value: 'semimonthly' },
          { label: 'Weekly (52 paychecks/yr)', value: 'weekly' },
        ],
      },
      { id: 'postTaxAnnual', label: 'Annual Post-Tax Deductions ($)', defaultValue: 0, type: 'number', min: 0, step: 250, unit: '$', advanced: true },
    ],
    calculate: (v) => {
      const gross = parseNum(v.grossAnnual);
      const fedPct = parseNum(v.fedTaxPct);
      const statePct = parseNum(v.stateTaxPct);
      const ficaPct = parseNum(v.ficaPct);
      const pretaxMo = parseNum(v.pretax);
      const postTaxAnn = v.postTaxAnnual === undefined ? 0 : parseNum(v.postTaxAnnual);
      const freq = ['weekly', 'semimonthly', 'biweekly'].includes(String(v.payFrequency)) ? String(v.payFrequency) : 'biweekly';

      if ([gross, fedPct, statePct, ficaPct, pretaxMo, postTaxAnn].some(isNaN)) {
        return calcError('Please enter valid numeric paycheck parameters.');
      }
      if (gross < 0 || fedPct < 0 || statePct < 0 || ficaPct < 0 || pretaxMo < 0 || postTaxAnn < 0) {
        return calcError('Gross pay, tax rates, and deductions must be non-negative.');
      }
      if (fedPct + statePct + ficaPct > 100) {
        return calcError('Combined tax withholding percentages cannot exceed 100%.');
      }

      const fed = fedPct / 100;
      const state = statePct / 100;
      const fica = ficaPct / 100;
      const pretaxAnnual = Math.min(gross, pretaxMo * 12);
      // Pre-tax deferrals shield Federal & State income taxes (IRS 401k / Sec 125)
      const taxableFedState = Math.max(0, gross - pretaxAnnual);
      const incomeTax = taxableFedState * (fed + state);
      const ficaTax = gross * fica;
      const totalTax = incomeTax + ficaTax;
      const netAnnual = Math.max(0, gross - totalTax - pretaxAnnual - postTaxAnn);
      const netMonthly = netAnnual / 12;

      const checksPerYr = freq === 'weekly' ? 52 : freq === 'semimonthly' ? 24 : 26;
      const perCheckLabel = freq === 'weekly' ? 'Weekly Paycheck' : freq === 'semimonthly' ? 'Semi-Monthly Paycheck' : 'Bi-Weekly Paycheck';

      return {
        primaryValue: parseFloat(netMonthly.toFixed(2)),
        primaryUnit: '$ / mo',
        primaryLabel: 'Estimated Net Monthly Take-Home Pay',
        secondaryOutputs: [
          { label: perCheckLabel, value: `$${(netAnnual / checksPerYr).toFixed(2)}` },
          { label: 'Annual Net Take-Home', value: `$${netAnnual.toFixed(2)}` },
          { label: 'Annual Taxes Paid (Fed/State/FICA)', value: `$${totalTax.toFixed(2)}` },
          { label: 'Take-Home Percentage', value: `${gross > 0 ? ((netAnnual / gross) * 100).toFixed(1) : '0.0'}%` },
        ],
        steps: [
          `Gross: $${gross.toLocaleString()}; Taxable for Fed/State (after $${pretaxAnnual.toFixed(0)} pre-tax): $${taxableFedState.toLocaleString()}`,
          `Taxes: $${incomeTax.toFixed(2)} (Fed/State) + $${ficaTax.toFixed(2)} (FICA) = $${totalTax.toFixed(2)}`,
          `Net Monthly Take-Home = $${netMonthly.toFixed(2)}`,
        ],
        formulaUsed: 'Pre-Tax Shielded Net Paycheck Model',
      };
    },
  },
  {
    slug: 'break-even-calculator',
    title: 'Break-Even Calculator',
    category: 'business-tax',
    formulaDisplay: 'Break-Even Units = Fixed Costs / (Price per Unit - Variable Cost)',
    inputs: [
      { id: 'fixed', label: 'Total Fixed Costs ($)', defaultValue: 24000, type: 'number', min: 0, step: 1000, unit: '$' },
      { id: 'price', label: 'Sales Price per Unit ($)', defaultValue: 80, type: 'number', min: 0.01, step: 1, unit: '$' },
      { id: 'varCost', label: 'Variable Cost per Unit ($)', defaultValue: 35, type: 'number', min: 0, step: 1, unit: '$' },
      { id: 'targetProfit', label: 'Target Net Profit Goal ($)', defaultValue: 0, type: 'number', min: 0, step: 1000, unit: '$', advanced: true },
    ],
    calculate: (v) => {
      const fixed = parseNum(v.fixed);
      const price = parseNum(v.price);
      const varCost = parseNum(v.varCost);
      const targetProfit = v.targetProfit === undefined ? 0 : parseNum(v.targetProfit);
      if ([fixed, price, varCost, targetProfit].some(isNaN)) return calcError('Please enter valid numeric values.');
      if (fixed < 0 || price <= 0 || varCost < 0 || targetProfit < 0) return calcError('Costs and profit target must be ≥ 0 and price must be > 0.');
      const cm = price - varCost;
      if (cm <= 0) return calcError('Sales price must exceed variable cost per unit.', 'Unprofitable Margin');
      const units = Math.ceil(fixed / cm);
      const revenue = units * price;
      const cmRatio = (cm / price) * 100;
      const targetUnits = Math.ceil((fixed + targetProfit) / cm);

      const secondaryOutputs = [
        { label: 'Break-Even Sales Revenue', value: `$${revenue.toFixed(2)}` },
        { label: 'Contribution Margin per Unit', value: `$${cm.toFixed(2)}` },
        { label: 'Contribution Margin Ratio', value: `${cmRatio.toFixed(1)}%` },
      ];
      if (targetProfit > 0) {
        secondaryOutputs.push({
          label: `Units for $${targetProfit.toLocaleString()} Profit`,
          value: `${targetUnits.toLocaleString()} units ($${(targetUnits * price).toFixed(2)} rev)`,
        });
      }

      return {
        primaryValue: units,
        primaryUnit: 'units',
        primaryLabel: 'Break-Even Unit Volume',
        secondaryOutputs,
        steps: [`Unit Contribution Margin = $${price} - $${varCost} = $${cm}`, `Break-Even = ceil($${fixed} / $${cm}) = ${units} units`],
        formulaUsed: 'Q_be = FC / (P - VC)',
      };
    },
  },
  {
    slug: 'vat-calculator',
    title: 'VAT (Value-Added Tax) Calculator',
    category: 'business-tax',
    formulaDisplay: 'Gross = Net × (1 + VAT Rate)   |   Net = Gross ÷ (1 + VAT Rate)',
    inputs: [
      {
        id: 'mode',
        label: 'Calculation Mode',
        type: 'select',
        defaultValue: 'add',
        options: [
          { label: 'Add VAT to Net Amount', value: 'add' },
          { label: 'Extract VAT from Gross Total', value: 'extract' },
        ],
      },
      { id: 'netPrice', label: 'Amount ($)', defaultValue: 200, type: 'number', min: 0, step: 10, unit: '$' },
      { id: 'vatRate', label: 'VAT Rate (%)', defaultValue: 20, type: 'number', min: 0, max: 100, step: 0.5, unit: '%' },
    ],
    calculate: (v) => {
      const amount = parseNum(v.netPrice);
      const rPct = parseNum(v.vatRate);
      const mode = v.mode === 'extract' ? 'extract' : 'add';
      if (isNaN(amount) || isNaN(rPct)) return calcError('Please enter valid numbers for amount and VAT rate.');
      if (amount < 0 || rPct < 0 || rPct > 100) return calcError('Amount must be ≥ 0 and VAT rate between 0% and 100%.');
      const r = rPct / 100;

      if (mode === 'extract') {
        const net = amount / (1 + r);
        const vat = amount - net;
        return {
          primaryValue: parseFloat(net.toFixed(2)),
          primaryUnit: '$',
          primaryLabel: 'Net Price Extracted (Excl. VAT)',
          secondaryOutputs: [
            { label: 'VAT Portion Included', value: `$${vat.toFixed(2)}` },
            { label: 'Gross Total (VAT Included)', value: `$${amount.toFixed(2)}` },
          ],
          steps: [`Net = $${amount} / (1 + ${rPct / 100}) = $${net.toFixed(2)}`, `VAT Extracted = $${vat.toFixed(2)}`],
          formulaUsed: 'Net = Gross / (1 + VAT)',
        };
      }

      const vat = amount * r;
      const gross = amount + vat;
      return {
        primaryValue: parseFloat(gross.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: 'Gross Price (VAT Included)',
        secondaryOutputs: [
          { label: 'VAT Amount', value: `$${vat.toFixed(2)}` },
          { label: 'Net Subtotal', value: `$${amount.toFixed(2)}` },
        ],
        steps: [`VAT = $${amount} × ${rPct}% = $${vat.toFixed(2)}`, `Total = $${amount} + $${vat.toFixed(2)} = $${gross.toFixed(2)}`],
        formulaUsed: 'Gross = Net × (1 + VAT)',
      };
    },
  },
];
