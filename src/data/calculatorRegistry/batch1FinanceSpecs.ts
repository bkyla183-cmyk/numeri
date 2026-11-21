import { CalculatorSpec } from './types';
import { parseNum, calcError } from './validation';

const fmt = (n: number, d = 2): number => {
  if (!Number.isFinite(n)) return 0;
  const rounded = Number(n.toFixed(d));
  return Object.is(rounded, -0) ? 0 : rounded;
};

const fmtCurrency = (n: number, sym = '$'): string => {
  const abs = Math.abs(n).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return n < 0 ? `-${sym}${abs}` : `${sym}${abs}`;
};

// Complete IRS Publication 590-B Table III (Uniform Lifetime Table) for ages 72-120+
const IRS_UNIFORM_LIFETIME_TABLE: Record<number, number> = {
  72: 27.4, 73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9, 78: 22.0, 79: 21.1,
  80: 20.2, 81: 19.4, 82: 18.5, 83: 17.7, 84: 16.8, 85: 16.0, 86: 15.2, 87: 14.4,
  88: 13.7, 89: 12.9, 90: 12.2, 91: 11.5, 92: 10.8, 93: 10.1, 94: 9.5, 95: 8.9,
  96: 8.4, 97: 7.8, 98: 7.3, 99: 6.8, 100: 6.4, 101: 6.0, 102: 5.6, 103: 5.2,
  104: 4.9, 105: 4.6, 106: 4.3, 107: 4.1, 108: 3.9, 109: 3.7, 110: 3.5, 111: 3.4,
  112: 3.3, 113: 3.1, 114: 3.0, 115: 2.9, 116: 2.8, 117: 2.7, 118: 2.5, 119: 2.3,
  120: 2.0,
};

export const batch1FinanceSpecs: CalculatorSpec[] = [
  // 1. 50/30/20 Budget Calculator
  {
    slug: 'budget-50-30-20-calculator',
    title: '50/30/20 Budget Calculator',
    category: 'finance',
    formulaDisplay: 'Target = Net Income × (Target % ÷ 100)  |  Gap = Actual Spend − Target',
    inputs: [
      { id: 'monthlyNetIncome', label: 'Monthly Net Income (After Tax)', defaultValue: 6000, type: 'number', min: 0, max: 100000000, step: 100, unit: '$', helpText: 'Monthly take-home pay after taxes and payroll deductions.' },
      { id: 'needsPercent', label: 'Needs Target Allocation (%)', defaultValue: 50, type: 'number', min: 0, max: 100, step: 1, unit: '%' },
      { id: 'wantsPercent', label: 'Wants Target Allocation (%)', defaultValue: 30, type: 'number', min: 0, max: 100, step: 1, unit: '%' },
      { id: 'savingsPercent', label: 'Savings & Debt Payoff Target (%)', defaultValue: 20, type: 'number', min: 0, max: 100, step: 1, unit: '%' },
      { id: 'actualNeeds', label: 'Actual Monthly Needs Spend', defaultValue: 3200, type: 'number', min: 0, max: 100000000, step: 50, unit: '$', advanced: true, helpText: 'Housing, groceries, utilities, healthcare, transport, minimum debt.' },
      { id: 'actualWants', label: 'Actual Monthly Wants Spend', defaultValue: 1650, type: 'number', min: 0, max: 100000000, step: 50, unit: '$', advanced: true, helpText: 'Dining out, subscriptions, travel, hobbies, discretionary upgrades.' },
      { id: 'actualSavings', label: 'Actual Monthly Savings / Extra Debt', defaultValue: 1150, type: 'number', min: 0, max: 100000000, step: 50, unit: '$', advanced: true, helpText: 'Emergency fund, retirement contributions, investments, extra principal.' },
    ],
    calculate: (v) => {
      const inc = parseNum(v.monthlyNetIncome);
      const pn = parseNum(v.needsPercent);
      const pw = parseNum(v.wantsPercent);
      const ps = parseNum(v.savingsPercent);
      const an = v.actualNeeds === undefined ? 3200 : parseNum(v.actualNeeds);
      const aw = v.actualWants === undefined ? 1650 : parseNum(v.actualWants);
      const asv = v.actualSavings === undefined ? 1150 : parseNum(v.actualSavings);

      if ([inc, pn, pw, ps, an, aw, asv].some(isNaN)) {
        return calcError('Please enter valid numeric values for income, allocation percentages, and actual spending.');
      }
      if (inc < 0 || inc > 1e10 || [an, aw, asv].some((x) => x < 0 || x > 1e10)) {
        return calcError('Income and spending figures cannot be negative or exceed $10 billion.');
      }
      if ([pn, pw, ps].some((p) => p < 0 || p > 100)) {
        return calcError('Allocation percentages must each lie between 0% and 100%.');
      }
      const totalPct = pn + pw + ps;
      if (Math.abs(totalPct - 100) > 0.01) {
        return calcError(`Needs + Wants + Savings percentages currently sum to ${fmt(totalPct, 2)}%. Please adjust them to total exactly 100%.`);
      }

      const targetNeeds = inc * (pn / 100);
      const targetWants = inc * (pw / 100);
      const targetSavings = inc * (ps / 100);
      const needsGap = an - targetNeeds;
      const wantsGap = aw - targetWants;
      const savingsGap = asv - targetSavings;
      const totalActual = an + aw + asv;
      const unallocated = inc - totalActual;
      const actualSavingsPct = inc > 0 ? (asv / inc) * 100 : 0;

      return {
        primaryValue: fmt(targetSavings, 2),
        primaryUnit: '$ / month Recommended Savings Target',
        secondaryOutputs: [
          { label: `Needs Target (${fmt(pn, 0)}%)`, value: fmtCurrency(targetNeeds) },
          { label: `Wants Target (${fmt(pw, 0)}%)`, value: fmtCurrency(targetWants) },
          { label: 'Needs Variance', value: `${needsGap >= 0 ? '+' : ''}${fmtCurrency(needsGap)}` },
          { label: 'Wants Variance', value: `${wantsGap >= 0 ? '+' : ''}${fmtCurrency(wantsGap)}` },
          { label: 'Savings Variance', value: `${savingsGap >= 0 ? '+' : ''}${fmtCurrency(savingsGap)}` },
          { label: 'Actual Savings Rate', value: fmt(actualSavingsPct, 2), unit: '%' },
          { label: 'Annual Target Savings', value: fmtCurrency(targetSavings * 12) },
          { label: 'Unallocated / Cash Cushion', value: fmtCurrency(unallocated) },
        ],
        steps: [
          `Target Needs (${pn}%): ${fmtCurrency(inc)} × ${pn / 100} = ${fmtCurrency(targetNeeds)} (Actual: ${fmtCurrency(an)}, Variance: ${needsGap >= 0 ? '+' : ''}${fmtCurrency(needsGap)}).`,
          `Target Wants (${pw}%): ${fmtCurrency(inc)} × ${pw / 100} = ${fmtCurrency(targetWants)} (Actual: ${fmtCurrency(aw)}, Variance: ${wantsGap >= 0 ? '+' : ''}${fmtCurrency(wantsGap)}).`,
          `Target Savings (${ps}%): ${fmtCurrency(inc)} × ${ps / 100} = ${fmtCurrency(targetSavings)}/mo (${fmtCurrency(targetSavings * 12)}/yr).`,
          `Actual total tracked outflow = ${fmtCurrency(totalActual)}; Remaining unallocated cash flow = ${fmtCurrency(unallocated)}.`,
        ],
      };
    },
  },

  // 2. Emergency Fund Calculator
  {
    slug: 'emergency-fund-calculator',
    title: 'Emergency Fund Calculator',
    category: 'finance',
    formulaDisplay: 'Target = Monthly Essentials × Months  |  B_n = B_(n−1) × (1 + r/12) + C',
    inputs: [
      { id: 'monthlyEssentialExpenses', label: 'Monthly Essential Living Expenses', defaultValue: 3500, type: 'number', min: 1, max: 10000000, step: 100, unit: '$', helpText: 'Include rent/mortgage, groceries, utilities, insurance, and minimum debt only.' },
      { id: 'targetMonths', label: 'Target Coverage Buffer (Months)', defaultValue: 6, type: 'number', min: 1, max: 36, step: 1, unit: 'mo', helpText: 'Standard range: 3–6 months for dual-income/salaried; 6–12 months for variable income.' },
      { id: 'currentSavings', label: 'Current Liquid Emergency Cash', defaultValue: 7000, type: 'number', min: 0, max: 100000000, step: 500, unit: '$' },
      { id: 'monthlyContribution', label: 'Monthly Deposit Toward Fund', defaultValue: 600, type: 'number', min: 0, max: 10000000, step: 50, unit: '$' },
      { id: 'annualApy', label: 'Savings Account Interest Rate (Nominal APR)', defaultValue: 4.0, type: 'number', min: 0, max: 25, step: 0.1, unit: '%', advanced: true, helpText: 'Compounded monthly using end-of-month deposits.' },
    ],
    calculate: (v) => {
      const exp = parseNum(v.monthlyEssentialExpenses);
      const targetMo = parseNum(v.targetMonths);
      const cur = parseNum(v.currentSavings);
      const pmt = parseNum(v.monthlyContribution);
      const apy = v.annualApy === undefined ? 4.0 : parseNum(v.annualApy);

      if ([exp, targetMo, cur, pmt, apy].some(isNaN)) {
        return calcError('Please enter valid numbers for all emergency fund parameters.');
      }
      if (exp <= 0 || exp > 1e8) return calcError('Monthly essential expenses must be greater than $0 and up to $100M.');
      if (targetMo < 1 || targetMo > 36) return calcError('Target coverage months must be between 1 and 36 months.');
      if (cur < 0 || cur > 1e10 || pmt < 0 || pmt > 1e8) return calcError('Current savings and monthly contribution cannot be negative.');
      if (apy < 0 || apy > 25) return calcError('Annual interest rate must be between 0% and 25%.');

      const targetFund = exp * targetMo;
      const gap = Math.max(0, targetFund - cur);
      const monthsCoveredNow = cur / exp;

      if (cur >= targetFund) {
        return {
          primaryValue: fmt(targetFund, 2),
          primaryUnit: '$ Target Fund (Already Funded)',
          secondaryOutputs: [
            { label: 'Target Fund Goal', value: fmtCurrency(targetFund) },
            { label: 'Surplus Above Target', value: fmtCurrency(cur - targetFund) },
            { label: 'Months Currently Covered', value: fmt(monthsCoveredNow, 1), unit: 'mo' },
            { label: 'Time Remaining', value: 0, unit: 'months' },
          ],
          steps: [
            `Target Fund = ${fmtCurrency(exp)} × ${targetMo} months = ${fmtCurrency(targetFund)}.`,
            `Current savings of ${fmtCurrency(cur)} already cover ${fmt(monthsCoveredNow, 1)} months (surplus: ${fmtCurrency(cur - targetFund)}).`,
          ],
        };
      }

      if (pmt === 0 && apy === 0) {
        return calcError('Target cannot be reached with $0 monthly contribution and 0% interest rate.');
      }

      const r = apy / 100 / 12;
      let bal = cur;
      let months = 0;
      const maxMonths = 1200;
      while (bal < targetFund && months < maxMonths) {
        bal = bal * (1 + r) + pmt;
        months++;
      }

      const totalDeposited = cur + pmt * months;
      const interestEarned = Math.max(0, bal - totalDeposited);
      const monthsNoInterest = pmt > 0 ? Math.ceil(gap / pmt) : 0;

      return {
        primaryValue: fmt(targetFund, 2),
        primaryUnit: `$ Target Fund (${months >= maxMonths && bal < targetFund ? '>100 yrs' : `${months} Months to Reach`})`,
        secondaryOutputs: [
          { label: 'Remaining Funding Gap', value: fmtCurrency(gap) },
          { label: 'Months to Goal (With Interest)', value: months >= maxMonths && bal < targetFund ? '>1200' : months, unit: 'mo' },
          { label: 'Months Without Interest', value: pmt > 0 ? monthsNoInterest : 'N/A', unit: pmt > 0 ? 'mo' : '' },
          { label: 'Months Covered Today', value: fmt(monthsCoveredNow, 2), unit: 'mo' },
          { label: 'Projected Balance at Goal', value: fmtCurrency(bal) },
          { label: 'Interest Earned Along Way', value: fmtCurrency(interestEarned) },
        ],
        steps: [
          `Target Fund = ${fmtCurrency(exp)} × ${targetMo} months = ${fmtCurrency(targetFund)}.`,
          `Initial Funding Gap = ${fmtCurrency(targetFund)} − ${fmtCurrency(cur)} = ${fmtCurrency(gap)} (${fmt(monthsCoveredNow, 2)} months funded today).`,
          `Compounding monthly at ${apy}% (${fmt(r * 100, 4)}%/mo) with ${fmtCurrency(pmt)} end-of-month contributions reaches ${fmtCurrency(bal)} in ${months} months.`,
          pmt > 0 ? `Interest saves ${Math.max(0, monthsNoInterest - months)} month(s) compared to 0% cash hoarding (${monthsNoInterest} mo).` : 'Funded solely via interest accrual.',
        ],
      };
    },
  },

  // 3. Net Worth Calculator
  {
    slug: 'net-worth-calculator',
    title: 'Net Worth Calculator',
    category: 'finance',
    formulaDisplay: 'Net Worth = Total Assets − Total Liabilities  |  Liquid NW = Liquid Assets − Non-Mortgage Debt',
    inputs: [
      { id: 'cashAndSavings', label: 'Cash, Checking & High-Yield Savings', defaultValue: 18000, type: 'number', min: 0, max: 10000000000, step: 500, unit: '$' },
      { id: 'investmentsAndRetirement', label: 'Brokerage & Retirement Accounts', defaultValue: 145000, type: 'number', min: 0, max: 10000000000, step: 1000, unit: '$' },
      { id: 'realEstateValue', label: 'Real Estate Current Market Value', defaultValue: 420000, type: 'number', min: 0, max: 10000000000, step: 5000, unit: '$' },
      { id: 'otherAssets', label: 'Vehicles, Business Equity & Other Assets', defaultValue: 17000, type: 'number', min: 0, max: 10000000000, step: 500, unit: '$', advanced: true },
      { id: 'mortgageBalance', label: 'Mortgage Payoff Balance', defaultValue: 285000, type: 'number', min: 0, max: 10000000000, step: 1000, unit: '$' },
      { id: 'autoLoans', label: 'Auto & Personal Loans', defaultValue: 18000, type: 'number', min: 0, max: 10000000000, step: 500, unit: '$' },
      { id: 'studentLoans', label: 'Student Loan Balance', defaultValue: 12000, type: 'number', min: 0, max: 10000000000, step: 500, unit: '$', advanced: true },
      { id: 'creditCardsAndOtherDebt', label: 'Credit Cards & Other Liabilities', defaultValue: 5000, type: 'number', min: 0, max: 10000000000, step: 250, unit: '$', advanced: true },
    ],
    calculate: (v) => {
      const cash = parseNum(v.cashAndSavings);
      const inv = parseNum(v.investmentsAndRetirement);
      const re = parseNum(v.realEstateValue);
      const otherA = v.otherAssets === undefined ? 17000 : parseNum(v.otherAssets);
      const mort = parseNum(v.mortgageBalance);
      const auto = parseNum(v.autoLoans);
      const stud = v.studentLoans === undefined ? 12000 : parseNum(v.studentLoans);
      const cc = v.creditCardsAndOtherDebt === undefined ? 5000 : parseNum(v.creditCardsAndOtherDebt);

      const vals = [cash, inv, re, otherA, mort, auto, stud, cc];
      if (vals.some(isNaN)) return calcError('Please enter valid numeric balances for all asset and liability fields.');
      if (vals.some((x) => x < 0 || x > 1e11)) return calcError('Asset and liability balances cannot be negative.');

      const totalAssets = cash + inv + re + otherA;
      const totalLiabilities = mort + auto + stud + cc;
      const netWorth = totalAssets - totalLiabilities;
      const liquidAssets = cash + inv;
      const nonMortgageDebt = auto + stud + cc;
      const liquidNetWorth = liquidAssets - nonMortgageDebt;
      const debtToAssetPct = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : null;
      const homeEquity = Math.max(0, re - mort);

      return {
        primaryValue: fmt(netWorth, 2),
        primaryUnit: '$ Total Net Worth',
        secondaryOutputs: [
          { label: 'Total Assets', value: fmtCurrency(totalAssets) },
          { label: 'Total Liabilities', value: fmtCurrency(totalLiabilities) },
          { label: 'Liquid Assets (Cash + Inv)', value: fmtCurrency(liquidAssets) },
          { label: 'Liquid Net Worth', value: fmtCurrency(liquidNetWorth) },
          { label: 'Net Home Equity', value: fmtCurrency(homeEquity) },
          { label: 'Debt-to-Asset Ratio', value: debtToAssetPct === null ? 'N/A (0 Assets)' : fmt(debtToAssetPct, 2), unit: debtToAssetPct === null ? '' : '%' },
        ],
        steps: [
          `Total Assets = ${fmtCurrency(cash)} + ${fmtCurrency(inv)} + ${fmtCurrency(re)} + ${fmtCurrency(otherA)} = ${fmtCurrency(totalAssets)}.`,
          `Total Liabilities = ${fmtCurrency(mort)} + ${fmtCurrency(auto)} + ${fmtCurrency(stud)} + ${fmtCurrency(cc)} = ${fmtCurrency(totalLiabilities)}.`,
          `Total Net Worth = ${fmtCurrency(totalAssets)} − ${fmtCurrency(totalLiabilities)} = ${fmtCurrency(netWorth)}.`,
          `Liquid Net Worth = ${fmtCurrency(liquidAssets)} (Liquid Assets) − ${fmtCurrency(nonMortgageDebt)} (Non-Mortgage Debt) = ${fmtCurrency(liquidNetWorth)}.`,
        ],
      };
    },
  },

  // 4. Savings Goal Calculator
  {
    slug: 'savings-goal-calculator',
    title: 'Savings Goal Calculator',
    category: 'finance',
    formulaDisplay: 'PMT = [Target − P₀(1 + r_p)^N] × r_p / [(1 + r_p)^N − 1]',
    inputs: [
      { id: 'targetAmount', label: 'Target Savings Goal Amount', defaultValue: 50000, type: 'number', min: 1, max: 1000000000, step: 500, unit: '$' },
      { id: 'initialDeposit', label: 'Initial Starting Deposit (P₀)', defaultValue: 8000, type: 'number', min: 0, max: 1000000000, step: 500, unit: '$' },
      { id: 'years', label: 'Time Horizon (Years)', defaultValue: 5, type: 'number', min: 0.25, max: 60, step: 0.5, unit: 'yrs' },
      { id: 'annualRate', label: 'Nominal Annual Interest Rate (APR)', defaultValue: 4.5, type: 'number', min: 0, max: 30, step: 0.1, unit: '%' },
      {
        id: 'contributionFrequency',
        label: 'Deposit Frequency',
        type: 'select',
        defaultValue: '12',
        advanced: true,
        options: [
          { label: 'Monthly (12/yr)', value: '12' },
          { label: 'Bi-Weekly (26/yr)', value: '26' },
          { label: 'Weekly (52/yr)', value: '52' },
          { label: 'Quarterly (4/yr)', value: '4' },
        ],
      },
      {
        id: 'compoundingFrequency',
        label: 'Account Compounding Frequency',
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
    ],
    calculate: (v) => {
      const target = parseNum(v.targetAmount);
      const init = parseNum(v.initialDeposit);
      const yrs = parseNum(v.years);
      const rate = parseNum(v.annualRate);
      const fc = v.contributionFrequency === undefined ? 12 : parseNum(v.contributionFrequency);
      const m = v.compoundingFrequency === undefined ? 12 : parseNum(v.compoundingFrequency);

      if ([target, init, yrs, rate, fc, m].some(isNaN)) {
        return calcError('Please enter valid numbers for savings target, initial deposit, horizon, and interest rate.');
      }
      if (target <= 0 || target > 1e11) return calcError('Target goal must be greater than $0.');
      if (init < 0 || init > 1e11) return calcError('Initial deposit cannot be negative.');
      if (yrs <= 0 || yrs > 100) return calcError('Time horizon must be between 0.1 and 100 years.');
      if (rate < 0 || rate > 30) return calcError('Annual interest rate must be between 0% and 30%.');
      if (![4, 12, 26, 52].includes(fc) || ![1, 4, 12, 365].includes(m)) {
        return calcError('Invalid compounding or deposit frequency selected.');
      }

      const N = Math.max(1, Math.round(yrs * fc));
      const rp = rate === 0 ? 0 : Math.pow(1 + rate / 100 / m, m / fc) - 1;
      const fvInit = init * Math.pow(1 + rp, N);

      let pmt = 0;
      if (fvInit < target) {
        pmt = rp === 0 ? (target - fvInit) / N : ((target - fvInit) * rp) / (Math.pow(1 + rp, N) - 1);
      }

      const totalPeriodicAdded = pmt * N;
      const totalContributed = init + totalPeriodicAdded;
      const projectedEnd = fvInit + (pmt === 0 ? 0 : target - fvInit);
      const totalInterest = Math.max(0, projectedEnd - totalContributed);
      const freqLabel = fc === 12 ? 'month' : fc === 26 ? 'bi-week' : fc === 52 ? 'week' : 'quarter';

      return {
        primaryValue: fmt(pmt, 2),
        primaryUnit: `$ / ${freqLabel} Required Savings`,
        secondaryOutputs: [
          { label: 'Target Savings Goal', value: fmtCurrency(target) },
          { label: 'Future Value of Initial P₀', value: fmtCurrency(fvInit) },
          { label: 'Total Principal Contributed', value: fmtCurrency(totalContributed) },
          { label: 'Total Interest Earned', value: fmtCurrency(totalInterest) },
          { label: 'Total Deposit Periods (N)', value: N },
          { label: 'Effective Rate / Period', value: fmt(rp * 100, 4), unit: '%' },
        ],
        steps: [
          `Effective rate per deposit period: r_p = (1 + ${rate / 100} ÷ ${m})^(${m} ÷ ${fc}) − 1 = ${fmt(rp * 100, 5)}% across N = ${N} periods.`,
          `Initial deposit ${fmtCurrency(init)} grows to ${fmtCurrency(fvInit)} over ${yrs} years.`,
          fvInit >= target
            ? `Initial deposit already exceeds target (${fmtCurrency(fvInit)} ≥ ${fmtCurrency(target)}); required contribution = $0.00.`
            : `Required end-of-period deposit = ${fmtCurrency(pmt)}/${freqLabel}; Total Principal = ${fmtCurrency(totalContributed)}, Total Interest = ${fmtCurrency(totalInterest)}.`,
        ],
      };
    },
  },

  // 5. CD & Term Deposit Calculator
  {
    slug: 'cd-term-deposit-calculator',
    title: 'CD & Term Deposit Calculator',
    category: 'finance',
    formulaDisplay: 'Compound: FV = P(1 + r/m)^(mt), APY = (1 + r/m)^m − 1  |  Simple: FV = P(1 + r·t)',
    inputs: [
      { id: 'principal', label: 'Deposit Principal (P)', defaultValue: 25000, type: 'number', min: 1, max: 100000000, step: 1000, unit: '$' },
      { id: 'nominalRate', label: 'Stated Nominal Rate (p.a. / APR)', defaultValue: 4.8, type: 'number', min: 0, max: 25, step: 0.05, unit: '%' },
      { id: 'termMonths', label: 'Deposit Term Length', defaultValue: 24, type: 'number', min: 1, max: 360, step: 1, unit: 'mo' },
      {
        id: 'interestMethod',
        label: 'Interest Calculation Method',
        type: 'select',
        defaultValue: 'compound',
        options: [
          { label: 'Compound Interest (Reinvested in CD)', value: 'compound' },
          { label: 'Simple Interest (Paid Out Periodically)', value: 'simple' },
        ],
        helpText: 'Distinguishes compounding certificates from non-compounding coupon payouts.',
      },
      {
        id: 'compoundingFrequency',
        label: 'Compounding Frequency',
        type: 'select',
        defaultValue: '12',
        visibleWhen: (vals) => (vals.interestMethod ?? 'compound') === 'compound',
        options: [
          { label: 'Monthly (12/yr)', value: '12' },
          { label: 'Daily (365/yr)', value: '365' },
          { label: 'Quarterly (4/yr)', value: '4' },
          { label: 'Semi-Annually (2/yr)', value: '2' },
          { label: 'Annually (1/yr)', value: '1' },
        ],
      },
      { id: 'marginalTaxRate', label: 'Estimated Interest Tax Rate', defaultValue: 22, type: 'number', min: 0, max: 65, step: 1, unit: '%', advanced: true, helpText: 'Applied to earned interest to illustrate net after-tax maturity value.' },
    ],
    calculate: (v) => {
      const P = parseNum(v.principal);
      const rPct = parseNum(v.nominalRate);
      const months = parseNum(v.termMonths);
      const method = String(v.interestMethod || 'compound') === 'simple' ? 'simple' : 'compound';
      const m = v.compoundingFrequency === undefined ? 12 : parseNum(v.compoundingFrequency);
      const taxPct = v.marginalTaxRate === undefined ? 22 : parseNum(v.marginalTaxRate);

      if ([P, rPct, months, m, taxPct].some(isNaN)) return calcError('Please enter valid numbers for principal, rate, term, and tax rate.');
      if (P <= 0 || P > 1e10) return calcError('Principal must be greater than $0.');
      if (rPct < 0 || rPct > 25) return calcError('Nominal rate must be between 0% and 25%.');
      if (months <= 0 || months > 600) return calcError('Term length must be between 1 and 600 months.');
      if (taxPct < 0 || taxPct > 65) return calcError('Marginal tax rate must be between 0% and 65%.');
      if (![1, 2, 4, 12, 365].includes(m)) return calcError('Invalid compounding frequency.');

      const t = months / 12;
      const r = rPct / 100;
      const fvCompound = P * Math.pow(1 + r / m, m * t);
      const fvSimple = P * (1 + r * t);
      const apyCompound = (Math.pow(1 + r / m, m) - 1) * 100;

      const selectedFv = method === 'compound' ? fvCompound : fvSimple;
      const grossInterest = selectedFv - P;
      const afterTaxInterest = grossInterest * (1 - taxPct / 100);
      const afterTaxFv = P + afterTaxInterest;
      const taxAmount = grossInterest - afterTaxInterest;
      const effectiveYieldPct = method === 'compound' ? apyCompound : (Math.pow(fvSimple / P, 1 / t) - 1) * 100;

      return {
        primaryValue: fmt(selectedFv, 2),
        primaryUnit: `$ Gross Maturity Balance (${method === 'compound' ? 'Compound' : 'Simple'})`,
        secondaryOutputs: [
          { label: 'Gross Interest Earned', value: fmtCurrency(grossInterest) },
          { label: 'Effective Annual Yield (APY/AER)', value: fmt(effectiveYieldPct, 4), unit: '%' },
          { label: 'After-Tax Interest', value: fmtCurrency(afterTaxInterest) },
          { label: 'After-Tax Maturity Balance', value: fmtCurrency(afterTaxFv) },
          { label: method === 'compound' ? 'Simple Interest Reference' : 'Compound Reference', value: fmtCurrency(method === 'compound' ? fvSimple : fvCompound) },
          { label: 'Compound vs. Simple Diff', value: fmtCurrency(fvCompound - fvSimple) },
        ],
        steps: [
          `Term t = ${months} / 12 = ${fmt(t, 4)} years; Nominal APR = ${rPct}%.`,
          `Compound APY/AER = (1 + ${r} / ${m})^${m} − 1 = ${fmt(apyCompound, 4)}% → Maturity = ${fmtCurrency(fvCompound)}.`,
          `Simple Interest Maturity = ${fmtCurrency(P)} × (1 + ${r} × ${fmt(t, 4)}) = ${fmtCurrency(fvSimple)}.`,
          `Selected ${method} method yields ${fmtCurrency(grossInterest)} gross interest; after ${taxPct}% tax (${fmtCurrency(taxAmount)}), net maturity = ${fmtCurrency(afterTaxFv)}.`,
        ],
      };
    },
  },

  // 6. House Deposit Savings Calculator
  {
    slug: 'house-deposit-savings-calculator',
    title: 'House Deposit Savings Calculator',
    category: 'finance',
    formulaDisplay: 'Cash Needed = Price × (Deposit% + Closing%)  |  B_n = B_(n−1)(1 + r/12) + Monthly Deposit',
    inputs: [
      { id: 'homePrice', label: 'Target Home Purchase Price', defaultValue: 500000, type: 'number', min: 10000, max: 50000000, step: 5000, unit: '$' },
      { id: 'depositPercent', label: 'Target Down Payment / Deposit (%)', defaultValue: 20, type: 'number', min: 0, max: 100, step: 1, unit: '%' },
      { id: 'closingCostPercent', label: 'Closing Costs / Stamp Duty Buffer (%)', defaultValue: 3.0, type: 'number', min: 0, max: 20, step: 0.5, unit: '%', helpText: 'Covers legal, valuation, loan origination, and Stamp Duty/Land Transfer Tax.' },
      { id: 'currentSavings', label: 'Current House Deposit Saved', defaultValue: 35000, type: 'number', min: 0, max: 50000000, step: 1000, unit: '$' },
      { id: 'monthlyContribution', label: 'Monthly Deposit Addition', defaultValue: 2000, type: 'number', min: 0, max: 5000000, step: 100, unit: '$' },
      { id: 'annualRate', label: 'Savings Interest Rate (Nominal APR)', defaultValue: 4.2, type: 'number', min: 0, max: 25, step: 0.1, unit: '%', advanced: true },
    ],
    calculate: (v) => {
      const price = parseNum(v.homePrice);
      const depPct = parseNum(v.depositPercent);
      const closePct = parseNum(v.closingCostPercent);
      const cur = parseNum(v.currentSavings);
      const pmt = parseNum(v.monthlyContribution);
      const rate = v.annualRate === undefined ? 4.2 : parseNum(v.annualRate);

      if ([price, depPct, closePct, cur, pmt, rate].some(isNaN)) {
        return calcError('Please enter valid numbers for purchase price, deposit %, closing %, and savings.');
      }
      if (price <= 0 || price > 1e9) return calcError('Home purchase price must be greater than $0.');
      if (depPct < 0 || depPct > 100 || closePct < 0 || closePct > 25) return calcError('Deposit and closing percentages must be within valid ranges.');
      if (cur < 0 || pmt < 0 || rate < 0 || rate > 25) return calcError('Savings, monthly additions, and rates cannot be negative.');

      const depositAmt = price * (depPct / 100);
      const closingAmt = price * (closePct / 100);
      const totalCashNeeded = depositAmt + closingAmt;
      const gap = Math.max(0, totalCashNeeded - cur);
      const ltv = 100 - depPct;
      const pmiNotice = depPct < 20 ? 'Yes (LTV > 80%: Expect PMI/LMI/CMHC)' : 'No (20%+ Equity)';

      if (cur >= totalCashNeeded) {
        return {
          primaryValue: fmt(totalCashNeeded, 2),
          primaryUnit: '$ Total Cash Needed (Target Met)',
          secondaryOutputs: [
            { label: 'Down Payment / Deposit', value: fmtCurrency(depositAmt) },
            { label: 'Closing / Duty Buffer', value: fmtCurrency(closingAmt) },
            { label: 'Surplus Ready', value: fmtCurrency(cur - totalCashNeeded) },
            { label: 'Loan-to-Value (LTV)', value: fmt(ltv, 1), unit: '%' },
            { label: 'Mortgage Insurance Likely?', value: pmiNotice },
            { label: 'Months Remaining', value: 0, unit: 'mo' },
          ],
          steps: [
            `Deposit (${depPct}%) = ${fmtCurrency(depositAmt)}; Closing/Duty (${closePct}%) = ${fmtCurrency(closingAmt)}; Total Needed = ${fmtCurrency(totalCashNeeded)}.`,
            `Current savings (${fmtCurrency(cur)}) meet or exceed cash target. Surplus: ${fmtCurrency(cur - totalCashNeeded)}.`,
          ],
        };
      }

      if (pmt === 0 && rate === 0) {
        return calcError('Cannot reach house deposit goal with $0 monthly savings and 0% interest.');
      }

      const r = rate / 100 / 12;
      let bal = cur;
      let months = 0;
      const maxMo = 1200;
      while (bal < totalCashNeeded && months < maxMo) {
        bal = bal * (1 + r) + pmt;
        months++;
      }

      return {
        primaryValue: fmt(totalCashNeeded, 2),
        primaryUnit: `$ Total Cash Needed (${months >= maxMo && bal < totalCashNeeded ? '>100 yrs' : `${months} Months`})`,
        secondaryOutputs: [
          { label: 'Down Payment / Deposit', value: fmtCurrency(depositAmt) },
          { label: 'Closing / Duty Buffer', value: fmtCurrency(closingAmt) },
          { label: 'Remaining Cash Gap', value: fmtCurrency(gap) },
          { label: 'Time to Target', value: `${months} mo (${fmt(months / 12, 1)} yrs)` },
          { label: 'Projected Balance at Goal', value: fmtCurrency(bal) },
          { label: 'Mortgage Insurance Likely?', value: pmiNotice },
        ],
        steps: [
          `Deposit = ${fmtCurrency(depositAmt)}, Closing/Stamp Duty Buffer = ${fmtCurrency(closingAmt)} → Total Cash Target = ${fmtCurrency(totalCashNeeded)}.`,
          `Initial Gap = ${fmtCurrency(totalCashNeeded)} − ${fmtCurrency(cur)} = ${fmtCurrency(gap)}.`,
          `Saving ${fmtCurrency(pmt)}/mo at ${rate}% APR (compounded monthly) reaches ${fmtCurrency(bal)} in ${months} months (${fmt(months / 12, 2)} years).`,
        ],
      };
    },
  },

  // 7. Rent vs Buy Calculator
  {
    slug: 'rent-vs-buy-calculator',
    title: 'Rent vs Buy Calculator',
    category: 'finance',
    formulaDisplay: 'Net Equity = HomeValue_Y(1 − Sell%) − RemLoan_Y  vs.  RenterPortfolio_Y(Day0 + Monthly Delta)',
    inputs: [
      { id: 'homePrice', label: 'Home Purchase Price', defaultValue: 450000, type: 'number', min: 10000, max: 50000000, step: 5000, unit: '$' },
      { id: 'downPaymentPercent', label: 'Down Payment (%)', defaultValue: 20, type: 'number', min: 0, max: 100, step: 1, unit: '%' },
      { id: 'mortgageRate', label: 'Mortgage Interest Rate (APR)', defaultValue: 6.25, type: 'number', min: 0, max: 25, step: 0.125, unit: '%' },
      { id: 'loanTermYears', label: 'Mortgage Term (Years)', defaultValue: 30, type: 'number', min: 5, max: 40, step: 5, unit: 'yrs' },
      { id: 'monthlyRent', label: 'Comparable Monthly Rent', defaultValue: 2400, type: 'number', min: 0, max: 100000, step: 50, unit: '$' },
      { id: 'horizonYears', label: 'Comparison Holding Horizon', defaultValue: 7, type: 'number', min: 1, max: 40, step: 1, unit: 'yrs' },
      { id: 'investmentReturnRate', label: 'Renter Investment Return (APR)', defaultValue: 6.5, type: 'number', min: 0, max: 25, step: 0.25, unit: '%', helpText: 'Assumed return on Day-0 down payment/closing cash + monthly cash-flow savings.' },
      { id: 'homeAppreciationRate', label: 'Annual Home Appreciation Rate', defaultValue: 3.5, type: 'number', min: -10, max: 20, step: 0.25, unit: '%', advanced: true },
      { id: 'rentGrowthRate', label: 'Annual Rent Growth Rate', defaultValue: 3.0, type: 'number', min: 0, max: 20, step: 0.25, unit: '%', advanced: true },
      { id: 'propertyTaxRate', label: 'Annual Property Tax Rate (%)', defaultValue: 1.2, type: 'number', min: 0, max: 10, step: 0.1, unit: '%', advanced: true },
      { id: 'maintenanceRate', label: 'Annual Maintenance Rate (%)', defaultValue: 1.0, type: 'number', min: 0, max: 10, step: 0.1, unit: '%', advanced: true },
      { id: 'homeInsuranceAnnual', label: 'Homeowners Insurance ($/yr)', defaultValue: 1800, type: 'number', min: 0, max: 100000, step: 100, unit: '$', advanced: true },
      { id: 'rentersInsuranceAnnual', label: "Renter's Insurance ($/yr)", defaultValue: 240, type: 'number', min: 0, max: 50000, step: 20, unit: '$', advanced: true },
      { id: 'buyingClosingPercent', label: 'Buying Closing Costs (%)', defaultValue: 3.0, type: 'number', min: 0, max: 15, step: 0.5, unit: '%', advanced: true },
      { id: 'sellingCostPercent', label: 'Selling Agent & Exit Costs (%)', defaultValue: 6.0, type: 'number', min: 0, max: 15, step: 0.5, unit: '%', advanced: true },
    ],
    calculate: (v) => {
      const price = parseNum(v.homePrice);
      const dpPct = parseNum(v.downPaymentPercent);
      const mortRate = parseNum(v.mortgageRate);
      const loanYrs = parseNum(v.loanTermYears);
      const rent0 = parseNum(v.monthlyRent);
      const horizon = parseNum(v.horizonYears);
      const invRate = parseNum(v.investmentReturnRate);

      const appRate = v.homeAppreciationRate === undefined ? 3.5 : parseNum(v.homeAppreciationRate);
      const rentGrow = v.rentGrowthRate === undefined ? 3.0 : parseNum(v.rentGrowthRate);
      const taxPct = v.propertyTaxRate === undefined ? 1.2 : parseNum(v.propertyTaxRate);
      const maintPct = v.maintenanceRate === undefined ? 1.0 : parseNum(v.maintenanceRate);
      const homeIns = v.homeInsuranceAnnual === undefined ? 1800 : parseNum(v.homeInsuranceAnnual);
      const rentIns = v.rentersInsuranceAnnual === undefined ? 240 : parseNum(v.rentersInsuranceAnnual);
      const buyClosePct = v.buyingClosingPercent === undefined ? 3.0 : parseNum(v.buyingClosingPercent);
      const sellPct = v.sellingCostPercent === undefined ? 6.0 : parseNum(v.sellingCostPercent);

      const allNums = [price, dpPct, mortRate, loanYrs, rent0, horizon, invRate, appRate, rentGrow, taxPct, maintPct, homeIns, rentIns, buyClosePct, sellPct];
      if (allNums.some(isNaN)) return calcError('Please enter valid numbers for all Rent vs. Buy assumptions.');
      if (price <= 0 || loanYrs <= 0 || horizon <= 0 || horizon > 40) return calcError('Home price, loan term, and holding horizon must be positive.');
      if (dpPct < 0 || dpPct > 100 || mortRate < 0 || rent0 < 0 || invRate < 0) return calcError('Percentages and rent cannot be negative.');

      const downAmt = price * (dpPct / 100);
      const buyCloseAmt = price * (buyClosePct / 100);
      const loan = price - downAmt;
      const totalLoanMonths = Math.round(loanYrs * 12);
      const mr = mortRate / 100 / 12;
      const monthlyPI = loan === 0
        ? 0
        : mr === 0
          ? loan / totalLoanMonths
          : (loan * mr * Math.pow(1 + mr, totalLoanMonths)) / (Math.pow(1 + mr, totalLoanMonths) - 1);

      const invR = invRate / 100 / 12;
      let renterPortfolio = downAmt + buyCloseAmt;
      let remLoan = loan;
      let curHomeVal = price;
      let curRent = rent0;
      let cumBuyCash = downAmt + buyCloseAmt;
      let cumRentCash = 0;

      const simYears = Math.round(horizon);
      for (let yr = 1; yr <= simYears; yr++) {
        const moPropTax = (curHomeVal * (taxPct / 100)) / 12;
        const moMaint = (curHomeVal * (maintPct / 100)) / 12;
        const moHomeIns = homeIns / 12;
        const moRentIns = rentIns / 12;

        for (let mo = 1; mo <= 12; mo++) {
          const monthsElapsed = (yr - 1) * 12 + mo;
          const activePI = monthsElapsed <= totalLoanMonths && remLoan > 0 ? monthlyPI : 0;
          if (activePI > 0) {
            remLoan = Math.max(0, remLoan * (1 + mr) - activePI);
          }
          const buyMoOutflow = activePI + moPropTax + moMaint + moHomeIns;
          const rentMoOutflow = curRent + moRentIns;
          cumBuyCash += buyMoOutflow;
          cumRentCash += rentMoOutflow;
          renterPortfolio = renterPortfolio * (1 + invR) + (buyMoOutflow - rentMoOutflow);
        }

        curHomeVal *= 1 + appRate / 100;
        curRent *= 1 + rentGrow / 100;
      }

      const netSaleEquity = curHomeVal * (1 - sellPct / 100) - remLoan;
      const buyAdvantage = netSaleEquity - renterPortfolio;
      const winnerLabel = buyAdvantage >= 0 ? 'Buying Leads' : 'Renting + Investing Leads';

      return {
        primaryValue: fmt(buyAdvantage, 2),
        primaryUnit: `$ Net Wealth Advantage at Year ${simYears} (${winnerLabel})`,
        secondaryOutputs: [
          { label: 'Buyer Net Sale Equity', value: fmtCurrency(netSaleEquity) },
          { label: 'Renter Investment Portfolio', value: fmtCurrency(renterPortfolio) },
          { label: 'Monthly Mortgage (P&I)', value: fmtCurrency(monthlyPI) },
          { label: `Projected Home Value (Yr ${simYears})`, value: fmtCurrency(curHomeVal) },
          { label: `Remaining Loan (Yr ${simYears})`, value: fmtCurrency(remLoan) },
          { label: 'Cumulative Cash Paid (Buy)', value: fmtCurrency(cumBuyCash) },
          { label: 'Cumulative Cash Paid (Rent)', value: fmtCurrency(cumRentCash) },
          { label: 'Decision Verdict', value: winnerLabel },
        ],
        steps: [
          `Initial capital: Down payment (${fmtCurrency(downAmt)}) + Buying closing (${fmtCurrency(buyCloseAmt)}) = ${fmtCurrency(downAmt + buyCloseAmt)} seeded into Renter portfolio on Day 0.`,
          `Monthly Mortgage P&I on ${fmtCurrency(loan)} @ ${mortRate}% = ${fmtCurrency(monthlyPI)}/mo. After ${simYears} yrs, remaining loan = ${fmtCurrency(remLoan)}.`,
          `Projected home value = ${fmtCurrency(curHomeVal)}; Net sale proceeds after ${sellPct}% selling costs & mortgage payoff = ${fmtCurrency(netSaleEquity)}.`,
          `Renter invests/withdraws exact monthly cost delta at ${invRate}%/yr → Portfolio = ${fmtCurrency(renterPortfolio)}. Net Buy Advantage = ${fmtCurrency(buyAdvantage)} (${winnerLabel}).`,
        ],
      };
    },
  },

  // 8. Cost of Living Comparison Calculator
  {
    slug: 'cost-of-living-comparison-calculator',
    title: 'Cost of Living Comparison Calculator',
    category: 'finance',
    formulaDisplay: 'Composite Index = Σ(Weight_j × Ratio_j)  |  Equivalent Salary = Salary × (Composite ÷ 100)',
    inputs: [
      { id: 'currentSalary', label: 'Current Annual Income / Salary', defaultValue: 85000, type: 'number', min: 0, max: 100000000, step: 1000, unit: '$' },
      {
        id: 'comparisonMode',
        label: 'Comparison Methodology',
        type: 'select',
        defaultValue: 'weighted_categories',
        options: [
          { label: 'Weighted Expense Basket (Recommended)', value: 'weighted_categories' },
          { label: 'Single Headline City Index Ratio', value: 'headline_index' },
        ],
      },
      { id: 'currentOverallIndex', label: 'Current City Index (Baseline = 100)', defaultValue: 100, type: 'number', min: 10, max: 500, step: 1, visibleWhen: (v) => v.comparisonMode === 'headline_index' },
      { id: 'targetOverallIndex', label: 'Target City Index (Relative to Baseline)', defaultValue: 128, type: 'number', min: 10, max: 500, step: 1, visibleWhen: (v) => v.comparisonMode === 'headline_index' },
      { id: 'housingIndex', label: 'Housing Cost Index vs. Current (100 = Same)', defaultValue: 145, type: 'number', min: 10, max: 500, step: 5, visibleWhen: (v) => (v.comparisonMode ?? 'weighted_categories') === 'weighted_categories' },
      { id: 'groceriesIndex', label: 'Groceries & Food Index (100 = Same)', defaultValue: 120, type: 'number', min: 10, max: 500, step: 5, visibleWhen: (v) => (v.comparisonMode ?? 'weighted_categories') === 'weighted_categories' },
      { id: 'transportIndex', label: 'Transport & Transit Index (100 = Same)', defaultValue: 115, type: 'number', min: 10, max: 500, step: 5, visibleWhen: (v) => (v.comparisonMode ?? 'weighted_categories') === 'weighted_categories' },
      { id: 'utilitiesIndex', label: 'Utilities & Healthcare Index (100 = Same)', defaultValue: 110, type: 'number', min: 10, max: 500, step: 5, visibleWhen: (v) => (v.comparisonMode ?? 'weighted_categories') === 'weighted_categories' },
      { id: 'otherIndex', label: 'Discretionary & Other Index (100 = Same)', defaultValue: 115, type: 'number', min: 10, max: 500, step: 5, visibleWhen: (v) => (v.comparisonMode ?? 'weighted_categories') === 'weighted_categories' },
      { id: 'housingWeight', label: 'Household Budget Share: Housing (%)', defaultValue: 35, type: 'number', min: 0, max: 100, step: 1, unit: '%', advanced: true },
      { id: 'groceriesWeight', label: 'Budget Share: Groceries (%)', defaultValue: 15, type: 'number', min: 0, max: 100, step: 1, unit: '%', advanced: true },
      { id: 'transportWeight', label: 'Budget Share: Transport (%)', defaultValue: 15, type: 'number', min: 0, max: 100, step: 1, unit: '%', advanced: true },
      { id: 'utilitiesWeight', label: 'Budget Share: Utilities (%)', defaultValue: 10, type: 'number', min: 0, max: 100, step: 1, unit: '%', advanced: true },
      { id: 'otherWeight', label: 'Budget Share: Other (%)', defaultValue: 25, type: 'number', min: 0, max: 100, step: 1, unit: '%', advanced: true },
    ],
    calculate: (v) => {
      const sal = parseNum(v.currentSalary);
      const mode = String(v.comparisonMode || 'weighted_categories') === 'headline_index' ? 'headline_index' : 'weighted_categories';

      if (isNaN(sal) || sal < 0 || sal > 1e10) return calcError('Please enter a valid non-negative salary.');

      if (mode === 'headline_index') {
        const i1 = parseNum(v.currentOverallIndex);
        const i2 = parseNum(v.targetOverallIndex);
        if (isNaN(i1) || isNaN(i2) || i1 <= 0 || i2 <= 0) return calcError('City indices must both be greater than 0.');
        const ratio = i2 / i1;
        const eqSal = sal * ratio;
        const pctDiff = (ratio - 1) * 100;
        return {
          primaryValue: fmt(eqSal, 2),
          primaryUnit: '$ Equivalent Purchasing-Power Salary',
          secondaryOutputs: [
            { label: 'Relative Cost Ratio', value: fmt(ratio * 100, 2), unit: '%' },
            { label: 'Cost Difference', value: `${pctDiff >= 0 ? '+' : ''}${fmt(pctDiff, 2)}`, unit: '%' },
            { label: 'Salary Adjustment Needed', value: `${eqSal - sal >= 0 ? '+' : ''}${fmtCurrency(eqSal - sal)}` },
            { label: 'Monthly Gross Equivalent', value: fmtCurrency(eqSal / 12) },
          ],
          steps: [
            `Target City Index (${i2}) ÷ Current City Index (${i1}) = ${fmt(ratio, 4)} (${pctDiff >= 0 ? '+' : ''}${fmt(pctDiff, 2)}%).`,
            `Equivalent Salary = ${fmtCurrency(sal)} × ${fmt(ratio, 4)} = ${fmtCurrency(eqSal)}.`,
          ],
        };
      }

      const hi = parseNum(v.housingIndex);
      const gi = parseNum(v.groceriesIndex);
      const ti = parseNum(v.transportIndex);
      const ui = parseNum(v.utilitiesIndex);
      const oi = parseNum(v.otherIndex);

      const hw = v.housingWeight === undefined ? 35 : parseNum(v.housingWeight);
      const gw = v.groceriesWeight === undefined ? 15 : parseNum(v.groceriesWeight);
      const tw = v.transportWeight === undefined ? 15 : parseNum(v.transportWeight);
      const uw = v.utilitiesWeight === undefined ? 10 : parseNum(v.utilitiesWeight);
      const ow = v.otherWeight === undefined ? 25 : parseNum(v.otherWeight);

      if ([hi, gi, ti, ui, oi, hw, gw, tw, uw, ow].some(isNaN)) {
        return calcError('Please enter valid category indices and budget weights.');
      }
      if ([hi, gi, ti, ui, oi].some((x) => x <= 0) || [hw, gw, tw, uw, ow].some((w) => w < 0)) {
        return calcError('Category indices must be positive and weights cannot be negative.');
      }
      const wSum = hw + gw + tw + uw + ow;
      if (wSum <= 0) return calcError('Sum of category budget weights must exceed 0%.');

      const compositeIdx = (hw * hi + gw * gi + tw * ti + uw * ui + ow * oi) / wSum;
      const eqSalary = sal * (compositeIdx / 100);
      const pctChange = compositeIdx - 100;

      return {
        primaryValue: fmt(eqSalary, 2),
        primaryUnit: '$ Weighted Equivalent Salary',
        secondaryOutputs: [
          { label: 'Composite Cost Index', value: fmt(compositeIdx, 2) },
          { label: 'Net Cost Change', value: `${pctChange >= 0 ? '+' : ''}${fmt(pctChange, 2)}`, unit: '%' },
          { label: 'Required Salary Delta', value: `${eqSalary - sal >= 0 ? '+' : ''}${fmtCurrency(eqSalary - sal)}` },
          { label: 'Monthly Gross Equivalent', value: fmtCurrency(eqSalary / 12) },
        ],
        steps: [
          `Composite Index = (${hw}×${hi} + ${gw}×${gi} + ${tw}×${ti} + ${uw}×${ui} + ${ow}×${oi}) ÷ ${wSum} = ${fmt(compositeIdx, 2)}.`,
          `Equivalent Target Salary = ${fmtCurrency(sal)} × (${fmt(compositeIdx, 2)} ÷ 100) = ${fmtCurrency(eqSalary)} (${pctChange >= 0 ? '+' : ''}${fmt(pctChange, 2)}%).`,
        ],
      };
    },
  },

  // 9. Subscription Audit Calculator
  {
    slug: 'subscription-audit-calculator',
    title: 'Subscription Audit Calculator',
    category: 'finance',
    formulaDisplay: 'Monthly Total = Σ(Monthly) + Σ(Annual ÷ 12) + Σ(Weekly × 52 ÷ 12)  |  FV = Monthly × [(1+r)^n − 1]/r',
    inputs: [
      { id: 'streamingMonthly', label: 'Video & TV Streaming ($/mo)', defaultValue: 15.49, type: 'number', min: 0, max: 100000, step: 1, unit: '$' },
      { id: 'musicMonthly', label: 'Music & Audio Plans ($/mo)', defaultValue: 11.99, type: 'number', min: 0, max: 100000, step: 1, unit: '$' },
      { id: 'gymMonthly', label: 'Gym, Fitness & Wellness ($/mo)', defaultValue: 45.0, type: 'number', min: 0, max: 100000, step: 1, unit: '$' },
      { id: 'cloudMonthly', label: 'Cloud Storage & News ($/mo)', defaultValue: 9.99, type: 'number', min: 0, max: 100000, step: 1, unit: '$' },
      { id: 'annualSubscriptionsTotal', label: 'Annual Memberships Combined ($/yr)', defaultValue: 238, type: 'number', min: 0, max: 1000000, step: 10, unit: '$/yr', helpText: 'Default $238 = Prime ($139/yr) + Annual Software ($99/yr).' },
      { id: 'weeklySubscriptionsTotal', label: 'Weekly Recurring Charges ($/wk)', defaultValue: 0, type: 'number', min: 0, max: 50000, step: 5, unit: '$/wk', advanced: true },
      { id: 'plannedMonthlyCuts', label: 'Planned Cancellations ($/mo Savings)', defaultValue: 25, type: 'number', min: 0, max: 100000, step: 5, unit: '$', advanced: true },
      { id: 'opportunityReturnRate', label: 'Opportunity Return Rate (APR)', defaultValue: 7.0, type: 'number', min: 0, max: 25, step: 0.25, unit: '%', advanced: true },
      { id: 'horizonYears', label: 'Opportunity Cost Horizon (Years)', defaultValue: 5, type: 'number', min: 1, max: 40, step: 1, unit: 'yrs', advanced: true },
    ],
    calculate: (v) => {
      const s = parseNum(v.streamingMonthly);
      const m = parseNum(v.musicMonthly);
      const g = parseNum(v.gymMonthly);
      const c = parseNum(v.cloudMonthly);
      const ann = parseNum(v.annualSubscriptionsTotal);
      const wk = v.weeklySubscriptionsTotal === undefined ? 0 : parseNum(v.weeklySubscriptionsTotal);
      const cuts = v.plannedMonthlyCuts === undefined ? 25 : parseNum(v.plannedMonthlyCuts);
      const rAnn = v.opportunityReturnRate === undefined ? 7.0 : parseNum(v.opportunityReturnRate);
      const yrs = v.horizonYears === undefined ? 5 : parseNum(v.horizonYears);

      if ([s, m, g, c, ann, wk, cuts, rAnn, yrs].some(isNaN)) {
        return calcError('Please enter valid numbers for all subscription charges and return inputs.');
      }
      if ([s, m, g, c, ann, wk, cuts, rAnn].some((x) => x < 0) || yrs <= 0 || yrs > 50) {
        return calcError('Charges and return rate cannot be negative, and horizon must be 1–50 years.');
      }

      const monthlyEq = s + m + g + c + ann / 12 + (wk * 52) / 12;
      const annualTotal = monthlyEq * 12;
      const rm = rAnn / 100 / 12;
      const n = Math.round(yrs * 12);
      const oppCost = rm === 0 ? monthlyEq * n : monthlyEq * ((Math.pow(1 + rm, n) - 1) / rm);
      const effectiveCut = Math.min(cuts, monthlyEq);
      const cutOppCost = rm === 0 ? effectiveCut * n : effectiveCut * ((Math.pow(1 + rm, n) - 1) / rm);

      return {
        primaryValue: fmt(annualTotal, 2),
        primaryUnit: '$ Total Annual Subscription Spend',
        secondaryOutputs: [
          { label: 'Monthly Equivalent Spend', value: fmtCurrency(monthlyEq) },
          { label: 'Daily Equivalent Burn', value: fmtCurrency(annualTotal / 365) },
          { label: `${yrs}-Yr Opportunity Cost (${rAnn}%)`, value: fmtCurrency(oppCost) },
          { label: 'Annual Savings From Cuts', value: fmtCurrency(effectiveCut * 12) },
          { label: `${yrs}-Yr Wealth Saved by Cuts`, value: fmtCurrency(cutOppCost) },
        ],
        steps: [
          `Monthly sum = ${fmtCurrency(s)} + ${fmtCurrency(m)} + ${fmtCurrency(g)} + ${fmtCurrency(c)} + (${fmtCurrency(ann)} ÷ 12) + (${fmtCurrency(wk)} × 52 ÷ 12) = ${fmtCurrency(monthlyEq)}/mo.`,
          `Annual Total = ${fmtCurrency(monthlyEq)} × 12 = ${fmtCurrency(annualTotal)}/yr.`,
          `Investing ${fmtCurrency(monthlyEq)}/mo at ${rAnn}% APR (compounded monthly) for ${yrs} yrs grows to ${fmtCurrency(oppCost)}.`,
        ],
      };
    },
  },

  // 10. Sinking Fund Calculator
  {
    slug: 'sinking-fund-calculator',
    title: 'Sinking Fund Calculator',
    category: 'finance',
    formulaDisplay: 'PMT_k = [(T_k − S_k(1+r_m)^n) × r_m] ÷ [(1+r_m)^n − 1]  |  Total = Σ PMT_k',
    inputs: [
      { id: 'fund1Target', label: 'Goal 1 Target (Auto Maintenance)', defaultValue: 1200, type: 'number', min: 0, max: 10000000, step: 100, unit: '$' },
      { id: 'fund1Months', label: 'Goal 1 Months Until Due', defaultValue: 8, type: 'number', min: 1, max: 240, step: 1, unit: 'mo' },
      { id: 'fund2Target', label: 'Goal 2 Target (Holiday / Travel)', defaultValue: 1800, type: 'number', min: 0, max: 10000000, step: 100, unit: '$' },
      { id: 'fund2Months', label: 'Goal 2 Months Until Due', defaultValue: 10, type: 'number', min: 1, max: 240, step: 1, unit: 'mo' },
      { id: 'fund3Target', label: 'Goal 3 Target (Annual Insurance)', defaultValue: 1500, type: 'number', min: 0, max: 10000000, step: 100, unit: '$' },
      { id: 'fund3Months', label: 'Goal 3 Months Until Due', defaultValue: 6, type: 'number', min: 1, max: 240, step: 1, unit: 'mo' },
      { id: 'fund4Target', label: 'Goal 4 Target (Home Repair Reserve)', defaultValue: 3000, type: 'number', min: 0, max: 10000000, step: 100, unit: '$' },
      { id: 'fund4Months', label: 'Goal 4 Months Until Due', defaultValue: 12, type: 'number', min: 1, max: 240, step: 1, unit: 'mo' },
      { id: 'totalCurrentSaved', label: 'Total Cash Already Set Aside Across Goals', defaultValue: 0, type: 'number', min: 0, max: 50000000, step: 100, unit: '$', advanced: true },
      { id: 'annualApy', label: 'Savings Account Interest Rate (APR)', defaultValue: 4.0, type: 'number', min: 0, max: 25, step: 0.1, unit: '%', advanced: true },
    ],
    calculate: (v) => {
      const f1t = parseNum(v.fund1Target), f1m = parseNum(v.fund1Months);
      const f2t = parseNum(v.fund2Target), f2m = parseNum(v.fund2Months);
      const f3t = parseNum(v.fund3Target), f3m = parseNum(v.fund3Months);
      const f4t = parseNum(v.fund4Target), f4m = parseNum(v.fund4Months);
      const savedTotal = v.totalCurrentSaved === undefined ? 0 : parseNum(v.totalCurrentSaved);
      const apy = v.annualApy === undefined ? 4.0 : parseNum(v.annualApy);

      if ([f1t, f1m, f2t, f2m, f3t, f3m, f4t, f4m, savedTotal, apy].some(isNaN)) {
        return calcError('Please enter valid numeric targets, month horizons, and savings rate.');
      }
      if ([f1t, f2t, f3t, f4t, savedTotal, apy].some((x) => x < 0)) {
        return calcError('Targets, existing savings, and interest rate cannot be negative.');
      }
      if ([f1m, f2m, f3m, f4m].some((m) => m < 1 || m > 600)) {
        return calcError('Months until due must be between 1 and 600 for each goal.');
      }

      const rawTargets = [
        { name: 'Goal 1', t: f1t, m: Math.round(f1m) },
        { name: 'Goal 2', t: f2t, m: Math.round(f2m) },
        { name: 'Goal 3', t: f3t, m: Math.round(f3m) },
        { name: 'Goal 4', t: f4t, m: Math.round(f4m) },
      ];
      const sumTargets = rawTargets.reduce((s, x) => s + x.t, 0);

      // Allocate existing saved cash proportionally across non-zero buckets
      const rm = apy / 100 / 12;
      let totalPmtWithInt = 0;
      let totalPmtNoInt = 0;
      const perGoal: number[] = [];

      for (const item of rawTargets) {
        const initShare = sumTargets > 0 ? Math.min(item.t, savedTotal * (item.t / sumTargets)) : 0;
        const fvInit = initShare * Math.pow(1 + rm, item.m);
        const pmtInt = fvInit >= item.t ? 0 : rm === 0 ? (item.t - initShare) / item.m : ((item.t - fvInit) * rm) / (Math.pow(1 + rm, item.m) - 1);
        const pmtNoInt = initShare >= item.t ? 0 : (item.t - initShare) / item.m;
        totalPmtWithInt += pmtInt;
        totalPmtNoInt += pmtNoInt;
        perGoal.push(pmtInt);
      }

      return {
        primaryValue: fmt(totalPmtWithInt, 2),
        primaryUnit: '$ / month Total Sinking Fund Allocation',
        secondaryOutputs: [
          { label: 'Combined Target Amount', value: fmtCurrency(sumTargets) },
          { label: 'Monthly Req (0% Interest)', value: fmtCurrency(totalPmtNoInt) },
          { label: 'Goal 1 Monthly', value: fmtCurrency(perGoal[0]) },
          { label: 'Goal 2 Monthly', value: fmtCurrency(perGoal[1]) },
          { label: 'Goal 3 Monthly', value: fmtCurrency(perGoal[2]) },
          { label: 'Goal 4 Monthly', value: fmtCurrency(perGoal[3]) },
        ],
        steps: [
          `Total sinking fund targets = ${fmtCurrency(f1t)} + ${fmtCurrency(f2t)} + ${fmtCurrency(f3t)} + ${fmtCurrency(f4t)} = ${fmtCurrency(sumTargets)}.`,
          `At 0% interest: ${fmtCurrency(totalPmtNoInt)}/mo required across the four deadlines.`,
          `At ${apy}% APR (compounded monthly): Goal 1 ${fmtCurrency(perGoal[0])} + Goal 2 ${fmtCurrency(perGoal[1])} + Goal 3 ${fmtCurrency(perGoal[2])} + Goal 4 ${fmtCurrency(perGoal[3])} = ${fmtCurrency(totalPmtWithInt)}/mo.`,
        ],
      };
    },
  },

  // 11. Childcare Cost Impact Calculator
  {
    slug: 'childcare-cost-impact-calculator',
    title: 'Childcare Cost Impact Calculator',
    category: 'finance',
    formulaDisplay: 'Net Annual Cash Gain = [Salary(1 − Tax%) − Work Costs] − max(0, Childcare − Subsidy)',
    inputs: [
      { id: 'grossSalary', label: "Working Parent's Gross Annual Salary", defaultValue: 62000, type: 'number', min: 0, max: 10000000, step: 1000, unit: '$' },
      { id: 'effectiveTaxAndPayrollRate', label: 'Combined Marginal Income & Payroll Tax', defaultValue: 24, type: 'number', min: 0, max: 65, step: 1, unit: '%', helpText: 'Effective combined marginal tax rate on the secondary/assessed earner.' },
      { id: 'annualWorkExpenses', label: 'Annual Commuting & Work Expenses', defaultValue: 3600, type: 'number', min: 0, max: 500000, step: 200, unit: '$' },
      { id: 'annualChildcareCost', label: 'Gross Annual Childcare Cost', defaultValue: 18000, type: 'number', min: 0, max: 500000, step: 500, unit: '$' },
      { id: 'annualChildcareSubsidyOrCredit', label: 'Tax Credit, FSA Benefit or Gov Subsidy', defaultValue: 2000, type: 'number', min: 0, max: 500000, step: 250, unit: '$' },
      { id: 'hoursWorkedPerYear', label: 'Annual Paid Working Hours', defaultValue: 2000, type: 'number', min: 1, max: 4000, step: 40, unit: 'hrs', advanced: true },
      { id: 'yearsInCare', label: 'Years Until School Care Ends', defaultValue: 4, type: 'number', min: 1, max: 15, step: 1, unit: 'yrs', advanced: true },
      { id: 'annualWageGrowthRate', label: 'Expected Annual Wage Growth (%)', defaultValue: 3.5, type: 'number', min: 0, max: 15, step: 0.25, unit: '%', advanced: true },
    ],
    calculate: (v) => {
      const gross = parseNum(v.grossSalary);
      const taxPct = parseNum(v.effectiveTaxAndPayrollRate);
      const workExp = parseNum(v.annualWorkExpenses);
      const careCost = parseNum(v.annualChildcareCost);
      const subsidy = parseNum(v.annualChildcareSubsidyOrCredit);
      const hrs = v.hoursWorkedPerYear === undefined ? 2000 : parseNum(v.hoursWorkedPerYear);
      const yrs = v.yearsInCare === undefined ? 4 : parseNum(v.yearsInCare);
      const wageG = v.annualWageGrowthRate === undefined ? 3.5 : parseNum(v.annualWageGrowthRate);

      if ([gross, taxPct, workExp, careCost, subsidy, hrs, yrs, wageG].some(isNaN)) {
        return calcError('Please enter valid numeric values for salary, taxes, childcare costs, and hours.');
      }
      if ([gross, workExp, careCost, subsidy, wageG].some((x) => x < 0) || taxPct < 0 || taxPct > 65 || hrs <= 0 || yrs < 1 || yrs > 15) {
        return calcError('Verify non-negative cash amounts, tax 0–65%, hours > 0, and years 1–15.');
      }

      const afterTaxSalary = gross * (1 - taxPct / 100);
      const netTakeHomeAfterWork = afterTaxSalary - workExp;
      const netChildcare = Math.max(0, careCost - subsidy);
      const annualNetImpact = netTakeHomeAfterWork - netChildcare;
      const effectiveHourly = annualNetImpact / hrs;

      let cumulativeMultiYear = 0;
      const careYears = Math.round(yrs);
      for (let y = 0; y < careYears; y++) {
        const yrGross = gross * Math.pow(1 + wageG / 100, y);
        cumulativeMultiYear += yrGross * (1 - taxPct / 100) - workExp - netChildcare;
      }

      return {
        primaryValue: fmt(annualNetImpact, 2),
        primaryUnit: '$ / year Net Financial Cash Impact',
        secondaryOutputs: [
          { label: 'After-Tax Salary', value: fmtCurrency(afterTaxSalary) },
          { label: 'Net Pay After Work Costs', value: fmtCurrency(netTakeHomeAfterWork) },
          { label: 'Net Annual Childcare Cost', value: fmtCurrency(netChildcare) },
          { label: 'Monthly Cash Flow Impact', value: fmtCurrency(annualNetImpact / 12) },
          { label: 'Effective Hourly Wage', value: fmtCurrency(effectiveHourly), unit: '/hr' },
          { label: `${careYears}-Yr Cumulative Impact`, value: fmtCurrency(cumulativeMultiYear) },
        ],
        steps: [
          `After-Tax Salary = ${fmtCurrency(gross)} × (1 − ${taxPct}%) = ${fmtCurrency(afterTaxSalary)}. Less work costs (${fmtCurrency(workExp)}) = ${fmtCurrency(netTakeHomeAfterWork)}.`,
          `Net Childcare Cost = max(0, ${fmtCurrency(careCost)} − ${fmtCurrency(subsidy)}) = ${fmtCurrency(netChildcare)}/yr.`,
          `Annual Net Cash Impact = ${fmtCurrency(netTakeHomeAfterWork)} − ${fmtCurrency(netChildcare)} = ${fmtCurrency(annualNetImpact)} (${fmtCurrency(effectiveHourly)}/hr across ${hrs} hrs).`,
          `Note: Even near cash break-even, remaining employed preserves workplace retirement match, health coverage, and ${wageG}%/yr career compounding.`,
        ],
      };
    },
  },

  // 12. Wedding Budget Calculator
  {
    slug: 'wedding-budget-calculator',
    title: 'Wedding Budget Calculator',
    category: 'finance',
    formulaDisplay: 'Cost/Guest = Total ÷ Guests  |  Monthly Savings = max(0, Total − Saved − Family) ÷ Months',
    inputs: [
      { id: 'totalBudget', label: 'Total Target Wedding Budget', defaultValue: 32000, type: 'number', min: 100, max: 10000000, step: 500, unit: '$' },
      { id: 'guestCount', label: 'Estimated Guest Count', defaultValue: 120, type: 'number', min: 1, max: 5000, step: 5, unit: 'guests' },
      { id: 'currentSavings', label: 'Current Wedding Cash Saved', defaultValue: 12000, type: 'number', min: 0, max: 10000000, step: 500, unit: '$' },
      { id: 'familyContribution', label: 'Family / Partner Contributions', defaultValue: 6000, type: 'number', min: 0, max: 10000000, step: 500, unit: '$' },
      { id: 'monthsUntilWedding', label: 'Months Until Wedding Date', defaultValue: 14, type: 'number', min: 1, max: 120, step: 1, unit: 'mo' },
      { id: 'venueCateringPct', label: 'Venue & Catering Share (%)', defaultValue: 45, type: 'number', min: 0, max: 100, step: 1, unit: '%', advanced: true },
      { id: 'photoVideoPct', label: 'Photography & Video Share (%)', defaultValue: 12, type: 'number', min: 0, max: 100, step: 1, unit: '%', advanced: true },
      { id: 'attireBeautyPct', label: 'Attire & Beauty Share (%)', defaultValue: 8, type: 'number', min: 0, max: 100, step: 1, unit: '%', advanced: true },
      { id: 'musicDecorPct', label: 'Music, Florals & Decor Share (%)', defaultValue: 15, type: 'number', min: 0, max: 100, step: 1, unit: '%', advanced: true },
      { id: 'miscPct', label: 'Stationery, Favors & Misc (%)', defaultValue: 10, type: 'number', min: 0, max: 100, step: 1, unit: '%', advanced: true },
      { id: 'contingencyPct', label: 'Contingency Buffer (%)', defaultValue: 10, type: 'number', min: 0, max: 100, step: 1, unit: '%', advanced: true },
    ],
    calculate: (v) => {
      const total = parseNum(v.totalBudget);
      const guests = parseNum(v.guestCount);
      const saved = parseNum(v.currentSavings);
      const fam = parseNum(v.familyContribution);
      const months = parseNum(v.monthsUntilWedding);

      const p1 = v.venueCateringPct === undefined ? 45 : parseNum(v.venueCateringPct);
      const p2 = v.photoVideoPct === undefined ? 12 : parseNum(v.photoVideoPct);
      const p3 = v.attireBeautyPct === undefined ? 8 : parseNum(v.attireBeautyPct);
      const p4 = v.musicDecorPct === undefined ? 15 : parseNum(v.musicDecorPct);
      const p5 = v.miscPct === undefined ? 10 : parseNum(v.miscPct);
      const p6 = v.contingencyPct === undefined ? 10 : parseNum(v.contingencyPct);

      if ([total, guests, saved, fam, months, p1, p2, p3, p4, p5, p6].some(isNaN)) {
        return calcError('Please enter valid numbers for wedding budget, guests, savings, and timeline.');
      }
      if (total <= 0 || guests <= 0 || months <= 0 || saved < 0 || fam < 0) {
        return calcError('Total budget, guest count, and months must be positive.');
      }
      if ([p1, p2, p3, p4, p5, p6].some((p) => p < 0 || p > 100)) {
        return calcError('Category percentage shares must each lie between 0% and 100%.');
      }
      const pctSum = p1 + p2 + p3 + p4 + p5 + p6;
      if (Math.abs(pctSum - 100) > 0.01) {
        return calcError(`Category budget shares sum to ${fmt(pctSum, 2)}%. Adjust percentages to equal 100%.`);
      }

      const costPerGuest = total / guests;
      const gapToSave = Math.max(0, total - saved - fam);
      const monthlyRequired = gapToSave / months;

      return {
        primaryValue: fmt(monthlyRequired, 2),
        primaryUnit: '$ / month Savings Required',
        secondaryOutputs: [
          { label: 'Total Remaining Gap', value: fmtCurrency(gapToSave) },
          { label: 'Cost Per Guest', value: fmtCurrency(costPerGuest) },
          { label: `Venue & Catering (${p1}%)`, value: fmtCurrency(total * (p1 / 100)) },
          { label: `Music & Decor (${p4}%)`, value: fmtCurrency(total * (p4 / 100)) },
          { label: `Photo & Video (${p2}%)`, value: fmtCurrency(total * (p2 / 100)) },
          { label: `Contingency Buffer (${p6}%)`, value: fmtCurrency(total * (p6 / 100)) },
        ],
        steps: [
          `Cost per guest = ${fmtCurrency(total)} ÷ ${guests} guests = ${fmtCurrency(costPerGuest)}/guest.`,
          `Total funding already secured = ${fmtCurrency(saved)} + ${fmtCurrency(fam)} = ${fmtCurrency(saved + fam)}.`,
          `Remaining gap = max(0, ${fmtCurrency(total)} − ${fmtCurrency(saved + fam)}) = ${fmtCurrency(gapToSave)}, requiring ${fmtCurrency(monthlyRequired)}/mo over ${months} months.`,
        ],
      };
    },
  },

  // 13. Roth IRA vs Traditional IRA Calculator (IRS 2026 Rules)
  {
    slug: 'roth-ira-vs-traditional-ira-calculator',
    title: 'Roth IRA vs Traditional IRA Calculator',
    category: 'finance',
    formulaDisplay: '2026 Combined Cap = min($7,500 or $8,600 [50+], Earned Income)  |  Roth vs Trad + Reinvested Tax Savings',
    inputs: [
      { id: 'age', label: 'Current Age (Determines Catch-Up)', defaultValue: 35, type: 'number', min: 18, max: 85, step: 1, unit: 'yrs', helpText: '2026 combined IRA limit: $7,500 (<50) or $8,600 (50+).' },
      { id: 'retirementAge', label: 'Target Retirement Age', defaultValue: 65, type: 'number', min: 25, max: 95, step: 1, unit: 'yrs' },
      {
        id: 'filingStatus',
        label: '2026 IRS Filing Status',
        type: 'select',
        defaultValue: 'single',
        options: [
          { label: 'Single / Head of Household', value: 'single' },
          { label: 'Married Filing Jointly (MFJ)', value: 'mfj' },
          { label: 'Married Filing Separately (Lived w/ Spouse)', value: 'mfs' },
        ],
      },
      { id: 'magi', label: 'Modified Adjusted Gross Income (2026 MAGI)', defaultValue: 110000, type: 'number', min: 0, max: 10000000, step: 2500, unit: '$' },
      { id: 'earnedIncome', label: 'Taxable Earned Compensation', defaultValue: 110000, type: 'number', min: 0, max: 10000000, step: 2500, unit: '$', helpText: 'IRA contributions cannot exceed taxable earned compensation (Spousal IRA exceptions apply for MFJ).' },
      { id: 'requestedContribution', label: 'Planned Annual IRA Contribution', defaultValue: 7500, type: 'number', min: 0, max: 8600, step: 250, unit: '$', helpText: 'Enforces combined 2026 limit across Roth + Traditional IRAs.' },
      { id: 'splitToRothAdditional', label: 'Optional: Also Allocate to Other IRA ($/yr)', defaultValue: 0, type: 'number', min: 0, max: 8600, step: 250, unit: '$', advanced: true, helpText: 'Tests combined cap enforcement if splitting dollars between Roth & Traditional.' },
      {
        id: 'workplacePlan',
        label: 'Covered by Workplace Plan (401k/403b)?',
        type: 'select',
        defaultValue: 'none',
        options: [
          { label: 'Neither Spouse Covered', value: 'none' },
          { label: 'Covered by Workplace Plan', value: 'covered' },
          { label: 'Not Covered, Spouse Is Covered (MFJ)', value: 'spouse_covered' },
        ],
      },
      { id: 'expectedReturnRate', label: 'Expected Annual Investment Return', defaultValue: 7.0, type: 'number', min: 0, max: 20, step: 0.25, unit: '%' },
      { id: 'currentMarginalTaxRate', label: 'Current Marginal Income Tax Rate', defaultValue: 22, type: 'number', min: 0, max: 50, step: 1, unit: '%' },
      { id: 'retirementTaxRate', label: 'Expected Retirement Tax Rate', defaultValue: 15, type: 'number', min: 0, max: 50, step: 1, unit: '%' },
      {
        id: 'reinvestTaxSavings',
        label: 'Reinvest Traditional IRA Tax Refund?',
        type: 'select',
        defaultValue: 'yes',
        advanced: true,
        options: [
          { label: 'Yes — Invest Tax Savings in Taxable Side Account', value: 'yes' },
          { label: 'No — Spend Tax Refund Instead', value: 'no' },
        ],
      },
      { id: 'sideAccountCapGainsRate', label: 'Taxable Side-Account Capital Gains Rate', defaultValue: 15, type: 'number', min: 0, max: 35, step: 1, unit: '%', advanced: true },
    ],
    calculate: (v) => {
      const age = parseNum(v.age);
      const retAge = parseNum(v.retirementAge);
      const status = ['single', 'mfj', 'mfs'].includes(String(v.filingStatus)) ? String(v.filingStatus) : 'single';
      const magi = parseNum(v.magi);
      const earned = parseNum(v.earnedIncome);
      const reqContrib = parseNum(v.requestedContribution);
      const splitOther = v.splitToRothAdditional === undefined ? 0 : parseNum(v.splitToRothAdditional);
      const workplace = String(v.workplacePlan || 'none');
      const retRate = parseNum(v.expectedReturnRate);
      const taxNow = parseNum(v.currentMarginalTaxRate);
      const taxRet = parseNum(v.retirementTaxRate);
      const reinv = String(v.reinvestTaxSavings || 'yes') !== 'no';
      const cgRate = v.sideAccountCapGainsRate === undefined ? 15 : parseNum(v.sideAccountCapGainsRate);

      if ([age, retAge, magi, earned, reqContrib, splitOther, retRate, taxNow, taxRet, cgRate].some(isNaN)) {
        return calcError('Please enter valid numbers for age, MAGI, contribution, returns, and tax rates.');
      }
      if (age < 18 || age > 90 || retAge <= age || retAge > 100) {
        return calcError('Current age must be 18–90 and retirement age must exceed current age.');
      }
      if ([magi, earned, reqContrib, splitOther, retRate, taxNow, taxRet, cgRate].some((x) => x < 0)) {
        return calcError('Income, contributions, returns, and tax rates cannot be negative.');
      }

      // 2026 IRS Statutory Combined Limit (Notice 2025-67 / IR-2025-111)
      const statutory2026Limit = age >= 50 ? 8600 : 7500;
      const combinedCap2026 = Math.min(statutory2026Limit, earned);

      // 2026 Roth MAGI Phase-out limits
      const rothRange = status === 'single' ? [153000, 168000] : status === 'mfj' ? [242000, 252000] : [0, 10000];
      let rothMaxAllowed = combinedCap2026;
      if (magi >= rothRange[1]) {
        rothMaxAllowed = 0;
      } else if (magi > rothRange[0]) {
        const fractionUnused = (rothRange[1] - magi) / (rothRange[1] - rothRange[0]);
        const rawRothCap = combinedCap2026 * fractionUnused;
        // IRS $10 upward rounding with $200 floor while inside phase-out range
        rothMaxAllowed = Math.min(combinedCap2026, Math.max(200, Math.ceil(rawRothCap / 10) * 10));
      }

      // 2026 Traditional IRA Deductibility Phase-out
      let tradDeductibleFactor = 1.0;
      if (workplace !== 'none') {
        const tradRange =
          status === 'mfs'
            ? [0, 10000]
            : workplace === 'spouse_covered' && status === 'mfj'
              ? [242000, 252000]
              : status === 'mfj'
                ? [129000, 149000]
                : [81000, 91000];
        if (magi >= tradRange[1]) tradDeductibleFactor = 0;
        else if (magi > tradRange[0]) tradDeductibleFactor = (tradRange[1] - magi) / (tradRange[1] - tradRange[0]);
      }

      // Enforce single combined cap across both accounts
      const effectivePlannedTotal = Math.min(reqContrib, combinedCap2026);
      const effectiveRothCompare = Math.min(effectivePlannedTotal, rothMaxAllowed);
      const remainingIfSplit = Math.max(0, combinedCap2026 - Math.min(splitOther, combinedCap2026));
      const tradDeductibleAmount = effectivePlannedTotal * tradDeductibleFactor;

      const n = retAge - age;
      const r = retRate / 100;
      const fvFactor = r === 0 ? n : (Math.pow(1 + r, n) - 1) / r;

      const rothAfterTax = effectiveRothCompare * fvFactor;
      const tradGross = effectivePlannedTotal * fvFactor;
      const totalContributedTrad = effectivePlannedTotal * n;
      // Non-deductible basis in Traditional is withdrawn tax-free; growth & deductible basis taxed at retirement
      const nonDeductibleBasis = (effectivePlannedTotal - tradDeductibleAmount) * n;
      const tradTaxableAtExit = Math.max(0, tradGross - nonDeductibleBasis);
      const tradAfterTaxOnly = tradGross - tradTaxableAtExit * (taxRet / 100);

      const annualTaxSavings = tradDeductibleAmount * (taxNow / 100);
      let sideAccountAfterTax = 0;
      if (reinv && annualTaxSavings > 0) {
        const sideGross = annualTaxSavings * fvFactor;
        const sideBasis = annualTaxSavings * n;
        const sideGain = Math.max(0, sideGross - sideBasis);
        sideAccountAfterTax = sideGross - sideGain * (cgRate / 100);
      }

      const tradTotalStrategy = tradAfterTaxOnly + sideAccountAfterTax;
      const netAdvantage = rothAfterTax - tradTotalStrategy;
      const winner =
        earned === 0
          ? 'Ineligible ($0 Earned Income)'
          : rothMaxAllowed === 0
            ? 'Traditional Only (Roth Phased Out — Consider Backdoor Check)'
            : netAdvantage >= 0
              ? 'Roth IRA Leads'
              : 'Traditional IRA + Side Account Leads';

      return {
        primaryValue: fmt(Math.max(rothAfterTax, tradTotalStrategy), 2),
        primaryUnit: `$ Projected After-Tax Retirement Value (${winner})`,
        secondaryOutputs: [
          { label: '2026 Combined IRA Cap', value: fmtCurrency(combinedCap2026) },
          { label: 'Roth IRA After-Tax Value', value: fmtCurrency(rothAfterTax) },
          { label: 'Traditional + Side Value', value: fmtCurrency(tradTotalStrategy) },
          { label: 'Traditional IRA Net (Alone)', value: fmtCurrency(tradAfterTaxOnly) },
          { label: 'Tax-Savings Side Account', value: fmtCurrency(sideAccountAfterTax) },
          { label: 'Net Roth Advantage', value: `${netAdvantage >= 0 ? '+' : ''}${fmtCurrency(netAdvantage)}` },
          { label: '2026 Direct Roth Cap Allowed', value: fmtCurrency(rothMaxAllowed) },
          { label: 'Traditional Deductibility', value: `${fmt(tradDeductibleFactor * 100, 0)}% (${fmtCurrency(tradDeductibleAmount)}/yr)` },
        ],
        steps: [
          `IRS 2026 combined Traditional + Roth cap for age ${age} = ${fmtCurrency(statutory2026Limit)}; capped by earned income (${fmtCurrency(earned)}) → ${fmtCurrency(combinedCap2026)} combined max${splitOther > 0 ? ` (after $${splitOther} in other IRA: $${remainingIfSplit} remains)` : ''}.`,
          `2026 Roth MAGI eligibility (${status}, MAGI ${fmtCurrency(magi)}): direct limit = ${fmtCurrency(rothMaxAllowed)}. Traditional deductibility = ${fmt(tradDeductibleFactor * 100, 1)}%.`,
          `Over ${n} yrs at ${retRate}% (factor ${fmt(fvFactor, 4)}): Roth = ${fmtCurrency(rothAfterTax)} tax-free. Traditional Gross = ${fmtCurrency(tradGross)} → Net after ${taxRet}% tax = ${fmtCurrency(tradAfterTaxOnly)}.`,
          `Annual tax savings (${fmtCurrency(annualTaxSavings)}/yr)${reinv ? ` reinvested at ${cgRate}% cap gains adds ${fmtCurrency(sideAccountAfterTax)} → Combined = ${fmtCurrency(tradTotalStrategy)}.` : ' spent rather than reinvested → Combined = ' + fmtCurrency(tradTotalStrategy)}.`,
        ],
      };
    },
  },

  // 14. FIRE Retirement Calculator
  {
    slug: 'fire-retirement-calculator',
    title: 'FIRE Retirement Calculator',
    category: 'finance',
    formulaDisplay: 'FIRE Target = Annual Expenses ÷ SWR  |  r_real = [(1 + r_nom − drag) ÷ (1 + i)] − 1',
    inputs: [
      { id: 'currentAge', label: 'Current Age', defaultValue: 32, type: 'number', min: 18, max: 85, step: 1, unit: 'yrs' },
      { id: 'currentPortfolio', label: 'Current Invested Portfolio', defaultValue: 120000, type: 'number', min: 0, max: 100000000, step: 5000, unit: '$' },
      { id: 'annualExpenses', label: "Expected Annual Retirement Expenses (Today's $)", defaultValue: 55000, type: 'number', min: 1000, max: 20000000, step: 1000, unit: '$' },
      { id: 'monthlySavings', label: 'Monthly Investment Contributions', defaultValue: 2500, type: 'number', min: 0, max: 5000000, step: 100, unit: '$' },
      { id: 'nominalReturnRate', label: 'Expected Nominal Return (%)', defaultValue: 8.0, type: 'number', min: -10, max: 25, step: 0.25, unit: '%', helpText: 'Illustrative long-term market assumption (non-guaranteed).' },
      { id: 'feeAndTaxDragRate', label: 'Annual Fund Fee & Tax Drag (%)', defaultValue: 0.5, type: 'number', min: 0, max: 10, step: 0.1, unit: '%', advanced: true },
      { id: 'inflationRate', label: 'Expected Annual Inflation (%)', defaultValue: 2.5, type: 'number', min: 0, max: 15, step: 0.1, unit: '%', advanced: true },
      { id: 'safeWithdrawalRate', label: 'Safe Withdrawal Rate (SWR %)', defaultValue: 4.0, type: 'number', min: 1.5, max: 10, step: 0.25, unit: '%', advanced: true, helpText: '3.25%–3.5% often modeled for 40+ yr early retirements; 4.0% for ~30 yrs.' },
      { id: 'coastTargetAge', label: 'Target Age for Coast FIRE Check', defaultValue: 65, type: 'number', min: 30, max: 90, step: 1, unit: 'yrs', advanced: true },
    ],
    calculate: (v) => {
      const age = parseNum(v.currentAge);
      const port = parseNum(v.currentPortfolio);
      const exp = parseNum(v.annualExpenses);
      const moSav = parseNum(v.monthlySavings);
      const rNom = parseNum(v.nominalReturnRate);
      const drag = v.feeAndTaxDragRate === undefined ? 0.5 : parseNum(v.feeAndTaxDragRate);
      const inf = v.inflationRate === undefined ? 2.5 : parseNum(v.inflationRate);
      const swr = v.safeWithdrawalRate === undefined ? 4.0 : parseNum(v.safeWithdrawalRate);
      const coastAge = v.coastTargetAge === undefined ? 65 : parseNum(v.coastTargetAge);

      if ([age, port, exp, moSav, rNom, drag, inf, swr, coastAge].some(isNaN)) {
        return calcError('Please enter valid numeric parameters for your FIRE projection.');
      }
      if (age < 18 || age > 85) return calcError('Current age must be between 18 and 85.');
      if (port < 0 || exp <= 0 || moSav < 0 || drag < 0 || inf <= -100 || swr <= 0 || swr > 15) {
        return calcError('Expenses and SWR must be positive; portfolio, savings, drag, and inflation cannot cause invalid bounds.');
      }

      const fireTarget = exp / (swr / 100);
      const leanFire = (exp * 0.75) / (swr / 100);
      const fatFire = (exp * 1.5) / (swr / 100);
      const rReal = (1 + (rNom - drag) / 100) / (1 + inf / 100) - 1;
      const annSav = moSav * 12;
      const coastYears = Math.max(0, coastAge - age);
      const coastFireNumber = rReal > -0.99 ? fireTarget / Math.pow(1 + rReal, coastYears) : fireTarget;

      if (port >= fireTarget) {
        return {
          primaryValue: fmt(fireTarget, 2),
          primaryUnit: '$ FIRE Target Number (Already Achieved)',
          secondaryOutputs: [
            { label: 'Years to FIRE', value: 0, unit: 'yrs' },
            { label: 'Net Real Annual Return', value: fmt(rReal * 100, 3), unit: '%' },
            { label: 'Lean FIRE (75% Spend)', value: fmtCurrency(leanFire) },
            { label: 'Fat FIRE (150% Spend)', value: fmtCurrency(fatFire) },
            { label: `Coast FIRE (@ Age ${coastAge})`, value: fmtCurrency(coastFireNumber) },
            { label: 'Estimated Monthly Safe Draw', value: fmtCurrency((port * (swr / 100)) / 12) },
          ],
          steps: [
            `FIRE Target = ${fmtCurrency(exp)} ÷ ${swr}% = ${fmtCurrency(fireTarget)}.`,
            `Current portfolio (${fmtCurrency(port)}) already meets or exceeds FIRE target! Real net return = ${fmt(rReal * 100, 3)}%/yr.`,
          ],
        };
      }

      let yearsToFire: number | null = null;
      if (Math.abs(rReal) < 1e-9) {
        yearsToFire = annSav > 0 ? (fireTarget - port) / annSav : null;
      } else {
        const num = fireTarget * rReal + annSav;
        const den = port * rReal + annSav;
        if (num > 0 && den > 0 && num / den > 0 && 1 + rReal > 0) {
          const rawY = Math.log(num / den) / Math.log(1 + rReal);
          if (Number.isFinite(rawY) && rawY >= 0 && rawY <= 120) yearsToFire = rawY;
        }
      }

      if (yearsToFire === null) {
        return {
          primaryValue: fmt(fireTarget, 2),
          primaryUnit: '$ FIRE Target (Unreachable Under Current Real Return)',
          secondaryOutputs: [
            { label: 'Net Real Annual Return', value: fmt(rReal * 100, 3), unit: '%' },
            { label: 'Years to FIRE', value: 'Unreachable' },
            { label: 'Lean FIRE (75% Spend)', value: fmtCurrency(leanFire) },
            { label: 'Fat FIRE (150% Spend)', value: fmtCurrency(fatFire) },
          ],
          steps: [
            `FIRE Target = ${fmtCurrency(fireTarget)}. Net real return = ${fmt(rReal * 100, 3)}%/yr.`,
            `With annual savings of ${fmtCurrency(annSav)} and non-positive real portfolio growth, the portfolio erodes relative to expenses.`,
          ],
        };
      }

      return {
        primaryValue: fmt(fireTarget, 2),
        primaryUnit: `$ FIRE Target (${fmt(yearsToFire, 2)} Yrs · Age ${fmt(age + yearsToFire, 1)})`,
        secondaryOutputs: [
          { label: 'Years to FIRE', value: fmt(yearsToFire, 2), unit: 'yrs' },
          { label: 'Projected FIRE Age', value: fmt(age + yearsToFire, 1), unit: 'yrs' },
          { label: 'Net Real Return (Fisher)', value: fmt(rReal * 100, 3), unit: '%' },
          { label: 'Lean FIRE (75% Spend)', value: fmtCurrency(leanFire) },
          { label: 'Fat FIRE (150% Spend)', value: fmtCurrency(fatFire) },
          { label: `Coast FIRE (@ Age ${coastAge})`, value: fmtCurrency(coastFireNumber) },
        ],
        steps: [
          `FIRE Target = ${fmtCurrency(exp)} ÷ ${swr}% = ${fmtCurrency(fireTarget)} (Lean: ${fmtCurrency(leanFire)}; Fat: ${fmtCurrency(fatFire)}).`,
          `Net Nominal = ${rNom}% − ${drag}% = ${fmt(rNom - drag, 2)}%. Fisher Net Real Return = (1 + ${fmt((rNom - drag) / 100, 4)}) ÷ (1 + ${inf / 100}) − 1 = ${fmt(rReal * 100, 4)}%/yr.`,
          `At ${fmtCurrency(annSav)}/yr real savings, portfolio reaches ${fmtCurrency(fireTarget)} in ${fmt(yearsToFire, 2)} years (Age ${fmt(age + yearsToFire, 2)}).`,
          `Coast FIRE needed today for Age ${coastAge}: ${fmtCurrency(coastFireNumber)}. Note: Deterministic average return model; does not guarantee returns or sequence-of-returns immunity.`,
        ],
      };
    },
  },

  // 15. Australian Superannuation Calculator (ATO FY 2026-27)
  {
    slug: 'superannuation-calculator',
    title: 'Australian Superannuation Calculator',
    category: 'finance',
    formulaDisplay: 'B_y = B_(y−1)(1 + r_gross − f%) + [0.85(SG + Sac) − Div293] + AfterTax − AdminFee',
    inputs: [
      { id: 'currentAge', label: 'Current Age', defaultValue: 35, type: 'number', min: 18, max: 80, step: 1, unit: 'yrs' },
      { id: 'retirementAge', label: 'Target Preservation / Retirement Age', defaultValue: 67, type: 'number', min: 55, max: 85, step: 1, unit: 'yrs' },
      { id: 'currentBalance', label: 'Current Super Balance (A$)', defaultValue: 85000, type: 'number', min: 0, max: 50000000, step: 5000, unit: 'A$' },
      { id: 'annualSalary', label: 'Annual Ordinary Time Earnings (A$)', defaultValue: 110000, type: 'number', min: 0, max: 5000000, step: 2500, unit: 'A$' },
      { id: 'sgRate', label: 'Employer SG Rate (FY 2026–27: 12%)', defaultValue: 12.0, type: 'number', min: 0, max: 25, step: 0.5, unit: '%' },
      { id: 'salarySacrificeAnnual', label: 'Annual Salary Sacrifice (Before Tax)', defaultValue: 5000, type: 'number', min: 0, max: 200000, step: 500, unit: 'A$', helpText: 'FY 2026–27 ATO concessional cap is A$32,500 combined (SG + Salary Sacrifice + deductible).' },
      { id: 'afterTaxContribution', label: 'Annual Non-Concessional (After Tax)', defaultValue: 0, type: 'number', min: 0, max: 500000, step: 1000, unit: 'A$', advanced: true, helpText: 'FY 2026–27 ATO non-concessional cap is A$130,000/yr.' },
      { id: 'grossReturnRate', label: 'Expected Investment Return (Post-Fund Tax)', defaultValue: 7.5, type: 'number', min: 0, max: 20, step: 0.25, unit: '%', advanced: true },
      { id: 'investmentFeePercent', label: 'Annual % Investment & ICR Fee', defaultValue: 0.65, type: 'number', min: 0, max: 5, step: 0.05, unit: '%', advanced: true },
      { id: 'adminFeeFixed', label: 'Fixed Annual Admin Fee (A$/yr)', defaultValue: 120, type: 'number', min: 0, max: 5000, step: 20, unit: 'A$', advanced: true },
      { id: 'inflationRate', label: 'Expected CPI Inflation (%)', defaultValue: 2.5, type: 'number', min: 0, max: 12, step: 0.1, unit: '%', advanced: true },
      {
        id: 'applyMaxContribBase',
        label: 'Enforce ATO Max Super Contribution Base (A$270,830)?',
        type: 'select',
        defaultValue: 'yes',
        advanced: true,
        options: [
          { label: 'Yes — Cap SG at FY 2026–27 Base ($270,830)', value: 'yes' },
          { label: 'No — Employer Pays SG on Full Salary', value: 'no' },
        ],
      },
    ],
    calculate: (v) => {
      const age = parseNum(v.currentAge);
      const retAge = parseNum(v.retirementAge);
      const bal0 = parseNum(v.currentBalance);
      const sal = parseNum(v.annualSalary);
      const sgPct = parseNum(v.sgRate);
      const sac = parseNum(v.salarySacrificeAnnual);
      const afterTax = v.afterTaxContribution === undefined ? 0 : parseNum(v.afterTaxContribution);
      const rGross = v.grossReturnRate === undefined ? 7.5 : parseNum(v.grossReturnRate);
      const feePct = v.investmentFeePercent === undefined ? 0.65 : parseNum(v.investmentFeePercent);
      const feeFixed = v.adminFeeFixed === undefined ? 120 : parseNum(v.adminFeeFixed);
      const cpi = v.inflationRate === undefined ? 2.5 : parseNum(v.inflationRate);
      const useMaxBase = String(v.applyMaxContribBase || 'yes') !== 'no';

      if ([age, retAge, bal0, sal, sgPct, sac, afterTax, rGross, feePct, feeFixed, cpi].some(isNaN)) {
        return calcError('Please enter valid numbers for age, salary, contributions, returns, and fees.');
      }
      if (age < 18 || age > 80 || retAge <= age || retAge > 95) {
        return calcError('Current age must be 18–80 and retirement age must be greater than current age.');
      }
      if ([bal0, sal, sgPct, sac, afterTax, rGross, feePct, feeFixed, cpi].some((x) => x < 0)) {
        return calcError('Balance, salary, contribution amounts, fees, and rates cannot be negative.');
      }

      const FY2627_MAX_BASE = 270830;
      const FY2627_CONC_CAP = 32500;
      const FY2627_NON_CONC_CAP = 130000;
      const DIV293_THRESHOLD = 250000;

      const sgEligibleSalary = useMaxBase ? Math.min(sal, FY2627_MAX_BASE) : sal;
      const sgAnnual = sgEligibleSalary * (sgPct / 100);
      const totalConcessional = sgAnnual + sac;
      const excessConcessional = Math.max(0, totalConcessional - FY2627_CONC_CAP);
      const excessNonConcessional = Math.max(0, afterTax - FY2627_NON_CONC_CAP);

      const standardTax15 = totalConcessional * 0.15;
      const div293Income = sal + totalConcessional;
      const div293Tax = div293Income > DIV293_THRESHOLD ? 0.15 * Math.min(totalConcessional, div293Income - DIV293_THRESHOLD) : 0;

      const netAnnualContrib = Math.max(0, totalConcessional - standardTax15 - div293Tax) + afterTax;
      const netNomReturn = (rGross - feePct) / 100;
      const years = retAge - age;

      let balNom = bal0;
      for (let y = 0; y < years; y++) {
        balNom = Math.max(0, balNom * (1 + netNomReturn) + netAnnualContrib - feeFixed);
      }
      const balReal = balNom / Math.pow(1 + cpi / 100, years);

      const capNotice =
        excessConcessional > 0
          ? `Exceeds FY26-27 A$32,500 cap by A$${fmt(excessConcessional, 0)} (Check 5-yr carry-forward if TSB < A$500k)`
          : `Within A$32,500 cap (${fmtCurrency(FY2627_CONC_CAP - totalConcessional, 'A$')} headroom)`;

      return {
        primaryValue: fmt(balReal, 2),
        primaryUnit: `A$ Projected Balance at Age ${retAge} (Today's Purchasing Power)`,
        secondaryOutputs: [
          { label: `Nominal Balance (Age ${retAge})`, value: fmtCurrency(balNom, 'A$') },
          { label: 'Annual Employer SG', value: fmtCurrency(sgAnnual, 'A$') },
          { label: 'Total Concessional/yr', value: fmtCurrency(totalConcessional, 'A$') },
          { label: '15% Super Contrib Tax', value: fmtCurrency(standardTax15, 'A$') },
          { label: 'Division 293 Tax (15% >$250k)', value: fmtCurrency(div293Tax, 'A$') },
          { label: 'FY 2026–27 Cap Status', value: capNotice },
          { label: 'Non-Concessional Cap Status', value: excessNonConcessional > 0 ? `Over A$130k cap` : 'Within A$130k cap' },
          { label: 'Net Invested Rate', value: fmt(netNomReturn * 100, 2), unit: '%' },
        ],
        steps: [
          `ATO FY 2026–27 SG Base = ${fmtCurrency(sgEligibleSalary, 'A$')} → Employer SG (${sgPct}%) = ${fmtCurrency(sgAnnual, 'A$')} + Salary Sacrifice (${fmtCurrency(sac, 'A$')}) = ${fmtCurrency(totalConcessional, 'A$')} total concessional.`,
          `ATO Cap Check: ${capNotice}. Standard 15% tax = ${fmtCurrency(standardTax15, 'A$')}; Div 293 extra 15% tax = ${fmtCurrency(div293Tax, 'A$')} → Net added/yr = ${fmtCurrency(netAnnualContrib, 'A$')}.`,
          `Compounded for ${years} yrs at net return ${fmt(netNomReturn * 100, 2)}% (less A$${feeFixed}/yr admin fee) → Nominal = ${fmtCurrency(balNom, 'A$')}, Today's Dollars (${cpi}% CPI) = ${fmtCurrency(balReal, 'A$')}.`,
          `Disclaimer: Illustrative projection using constant return assumptions—not an individualized ATO personal tax assessment.`,
        ],
      };
    },
  },

  // 16. UK Pension Drawdown Calculator (HMRC 2026-27)
  {
    slug: 'uk-pension-drawdown-calculator',
    title: 'UK Pension Drawdown Calculator',
    category: 'finance',
    formulaDisplay: 'PCLS = min(25% × Pot, £268,275 LSA)  |  Annual Draw = max(0, Target − State Pension)',
    inputs: [
      { id: 'currentAge', label: 'Current Age', defaultValue: 55, type: 'number', min: 18, max: 85, step: 1, unit: 'yrs' },
      { id: 'retirementAge', label: 'Target Drawdown Start Age', defaultValue: 65, type: 'number', min: 55, max: 85, step: 1, unit: 'yrs', helpText: 'Normal Minimum Pension Age (NMPA) is 55 (rising to 57 from April 2028).' },
      { id: 'currentPot', label: 'Current Private Pension Pot (£)', defaultValue: 280000, type: 'number', min: 0, max: 50000000, step: 5000, unit: '£' },
      { id: 'annualContribution', label: 'Annual Pension Contribution (£)', defaultValue: 12000, type: 'number', min: 0, max: 500000, step: 500, unit: '£', helpText: 'HMRC 2026–27 Standard Annual Allowance is £60,000.' },
      { id: 'preRetirementReturn', label: 'Pre-Retirement Annual Return (%)', defaultValue: 6.0, type: 'number', min: 0, max: 15, step: 0.25, unit: '%' },
      { id: 'postRetirementReturn', label: 'Post-Retirement Drawdown Return (%)', defaultValue: 4.5, type: 'number', min: 0, max: 15, step: 0.25, unit: '%' },
      {
        id: 'takeTaxFreeLumpSum',
        label: 'Take 25% Tax-Free PCLS at Retirement?',
        type: 'select',
        defaultValue: 'yes',
        options: [
          { label: 'Yes — Withdraw 25% PCLS (Capped at £268,275 LSA)', value: 'yes' },
          { label: 'No — Leave Entire Pot in Flexi-Access Drawdown', value: 'no' },
        ],
      },
      { id: 'annualSpendingTarget', label: 'Target Gross Retirement Income (£/yr)', defaultValue: 26000, type: 'number', min: 0, max: 1000000, step: 1000, unit: '£', helpText: 'Pre-tax gross target income from Pension Drawdown + State Pension.' },
      { id: 'annualStatePension', label: 'Editable State Pension (£/yr, 2026–27 Full: £12,547.60)', defaultValue: 12547.6, type: 'number', min: 0, max: 30000, step: 100, unit: '£', advanced: true, helpText: '2026–27 full rate is £241.30/wk (£12,547.60/yr) with 35 qualifying NI years (min 10 yrs).' },
      { id: 'statePensionAge', label: 'State Pension Age (SPA)', defaultValue: 67, type: 'number', min: 66, max: 70, step: 1, unit: 'yrs', advanced: true },
    ],
    calculate: (v) => {
      const age = parseNum(v.currentAge);
      const retAge = parseNum(v.retirementAge);
      const pot0 = parseNum(v.currentPot);
      const contrib = parseNum(v.annualContribution);
      const rPre = parseNum(v.preRetirementReturn);
      const rPost = parseNum(v.postRetirementReturn);
      const takePcls = String(v.takeTaxFreeLumpSum || 'yes') !== 'no';
      const spendTarget = parseNum(v.annualSpendingTarget);
      const statePension = v.annualStatePension === undefined ? 12547.6 : parseNum(v.annualStatePension);
      const spa = v.statePensionAge === undefined ? 67 : parseNum(v.statePensionAge);

      if ([age, retAge, pot0, contrib, rPre, rPost, spendTarget, statePension, spa].some(isNaN)) {
        return calcError('Please enter valid numbers for age, pension pot, contributions, return rates, and spending target.');
      }
      if (age < 18 || age > 85 || retAge < age || retAge > 90) {
        return calcError('Current age must be 18–85 and drawdown start age cannot be less than current age.');
      }
      if ([pot0, contrib, rPre, rPost, spendTarget, statePension].some((x) => x < 0)) {
        return calcError('Monetary values and returns cannot be negative.');
      }

      const HMRC_2627_LSA = 268275;
      const HMRC_2627_AA = 60000;
      const UK_PA_2627 = 12570;

      const yrsPre = retAge - age;
      let potAtRet = pot0;
      for (let y = 0; y < yrsPre; y++) {
        potAtRet = potAtRet * (1 + rPre / 100) + contrib;
      }

      const pcls = takePcls ? Math.min(potAtRet * 0.25, HMRC_2627_LSA) : 0;
      let ddPot = potAtRet - pcls;

      let age80Bal = 0;
      let age90Bal = 0;
      let depletedAge: number | null = null;
      let simPot = ddPot;

      for (let a = retAge; a <= 100; a++) {
        const spInc = a >= spa ? statePension : 0;
        const neededFromPot = Math.max(0, spendTarget - spInc);
        simPot = (simPot - neededFromPot) * (1 + rPost / 100);
        if (simPot <= 0 && depletedAge === null) {
          depletedAge = a + 1;
          simPot = 0;
        }
        if (a + 1 === 80) age80Bal = simPot;
        if (a + 1 === 90) age90Bal = simPot;
      }

      // Simplified England/Wales/NI 2026-27 Income Tax illustration on total taxable income (assuming PA £12,570, 20% to £50,270, 40% to £125,140)
      const calcUkTax = (taxableInc: number): number => {
        if (taxableInc <= UK_PA_2627) return 0;
        const pa = taxableInc > 100000 ? Math.max(0, UK_PA_2627 - (taxableInc - 100000) / 2) : UK_PA_2627;
        const basicSlice = Math.max(0, Math.min(taxableInc, 50270) - pa);
        const higherSlice = Math.max(0, Math.min(taxableInc, 125140) - 50270);
        const addSlice = Math.max(0, taxableInc - 125140);
        return basicSlice * 0.2 + higherSlice * 0.4 + addSlice * 0.45;
      };

      const taxableGross = spendTarget;
      const estIncomeTax = calcUkTax(taxableGross);
      const estAfterTaxIncome = taxableGross - estIncomeTax;
      const netDrawAtSPA = Math.max(0, spendTarget - statePension);

      return {
        primaryValue: fmt(ddPot, 2),
        primaryUnit: `£ Remaining Drawdown Pot at Age ${retAge}`,
        secondaryOutputs: [
          { label: `Total Pot at Age ${retAge}`, value: fmtCurrency(potAtRet, '£') },
          { label: '25% Tax-Free PCLS Taken', value: fmtCurrency(pcls, '£') },
          { label: 'Pot Longevity', value: depletedAge ? `Depletes Age ${depletedAge}` : 'Lasts Past Age 100' },
          { label: 'Drawdown Required (Age ≥ SPA)', value: fmtCurrency(netDrawAtSPA, '£'), unit: '/yr' },
          { label: 'Est. After-Tax Income (E/W/NI)', value: fmtCurrency(estAfterTaxIncome, '£'), unit: '/yr' },
          { label: 'Est. UK Income Tax on Gross', value: fmtCurrency(estIncomeTax, '£'), unit: '/yr' },
          { label: 'Projected Pot at Age 80', value: fmtCurrency(age80Bal, '£') },
          { label: 'HMRC AA (£60k) Status', value: contrib > HMRC_2627_AA ? 'Over £60k AA' : 'Within £60k AA' },
        ],
        steps: [
          `Accumulation (${yrsPre} yrs @ ${rPre}% with ${fmtCurrency(contrib, '£')}/yr): Total Pot at ${retAge} = ${fmtCurrency(potAtRet, '£')}.`,
          `HMRC 2026–27 PCLS: ${takePcls ? `min(25%, £268,275 LSA) = ${fmtCurrency(pcls, '£')} tax-free` : '£0 skipped'} → Remaining Flexi-Access Pot = ${fmtCurrency(ddPot, '£')}.`,
          `Drawdown: ${fmtCurrency(spendTarget, '£')}/yr before State Pension (Age ${spa}), dropping to ${fmtCurrency(netDrawAtSPA, '£')}/yr once editable State Pension (${fmtCurrency(statePension, '£')}/yr) starts.`,
          `Gross vs. Net Income Distinction: On ${fmtCurrency(spendTarget, '£')}/yr taxable pension income, estimated 2026–27 UK tax (above £12,570 PA) ≈ ${fmtCurrency(estIncomeTax, '£')}/yr → ~${fmtCurrency(estAfterTaxIncome, '£')}/yr net.`,
        ],
      };
    },
  },

  // 17. Canada RRSP vs TFSA Calculator (CRA 2026)
  {
    slug: 'canada-rrsp-tfsa-calculator',
    title: 'Canada RRSP vs TFSA Calculator',
    category: 'finance',
    formulaDisplay: 'TFSA = B(1 − t₀)(1+r)^n  |  RRSP(reinvested) = B(1+r)^n(1 − t_r)  |  RRSP(spent refund) = B(1 − t₀)(1+r)^n(1 − t_r)',
    inputs: [
      { id: 'preTaxAllocation', label: 'Pre-Tax Income Allocated to Investing (C$)', defaultValue: 10000, type: 'number', min: 100, max: 500000, step: 500, unit: 'C$', helpText: 'Pre-tax dollars before current income tax deduction (2026 CRA caps: RRSP C$33,810 | TFSA C$7,000).' },
      { id: 'years', label: 'Investment Horizon (Years)', defaultValue: 25, type: 'number', min: 1, max: 60, step: 1, unit: 'yrs' },
      { id: 'annualReturnRate', label: 'Expected Annual Investment Return (%)', defaultValue: 6.5, type: 'number', min: 0, max: 20, step: 0.25, unit: '%' },
      { id: 'currentMarginalTaxRate', label: 'Current Combined Federal/Provincial Tax (%)', defaultValue: 40, type: 'number', min: 0, max: 60, step: 1, unit: '%' },
      { id: 'retirementMarginalTaxRate', label: 'Expected Retirement Marginal Tax (%)', defaultValue: 25, type: 'number', min: 0, max: 60, step: 1, unit: '%', helpText: 'Include OAS clawback effect if income exceeds C$93,454 (2025 inc / Jul 26–Jun 27) or C$95,323 (2026 inc / Jul 27–Jun 28).' },
      {
        id: 'reinvestRrspRefund',
        label: 'Reinvest RRSP Tax Refund?',
        type: 'select',
        defaultValue: 'yes',
        options: [
          { label: 'Yes — Reinvest/Gross-Up Full Pre-Tax Value', value: 'yes' },
          { label: 'No — Spend Tax Refund (Net After-Tax Deposit Only)', value: 'no' },
        ],
      },
      { id: 'priorYearEarnedIncome', label: '2025 Earned Income (Optional 18% Cap Check)', defaultValue: 100000, type: 'number', min: 0, max: 5000000, step: 5000, unit: 'C$', advanced: true },
    ],
    calculate: (v) => {
      const B = parseNum(v.preTaxAllocation);
      const yrs = parseNum(v.years);
      const rPct = parseNum(v.annualReturnRate);
      const tNow = parseNum(v.currentMarginalTaxRate);
      const tRet = parseNum(v.retirementMarginalTaxRate);
      const reinv = String(v.reinvestRrspRefund || 'yes') !== 'no';
      const priorEarn = v.priorYearEarnedIncome === undefined ? 100000 : parseNum(v.priorYearEarnedIncome);

      if ([B, yrs, rPct, tNow, tRet, priorEarn].some(isNaN)) {
        return calcError('Please enter valid numbers for allocation, horizon, return, and tax rates.');
      }
      if (B <= 0 || yrs <= 0 || yrs > 70 || rPct < 0 || tNow < 0 || tNow > 60 || tRet < 0 || tRet > 60 || priorEarn < 0) {
        return calcError('Check that investment allocation and years are positive and tax rates are 0–60%.');
      }

      const growth = Math.pow(1 + rPct / 100, yrs);
      const afterTaxSeed = B * (1 - tNow / 100);
      const tfsaFinal = afterTaxSeed * growth;

      const rrspReinvestFinal = B * growth * (1 - tRet / 100);
      const rrspSpentRefundFinal = afterTaxSeed * growth * (1 - tRet / 100);
      const selectedRrspFinal = reinv ? rrspReinvestFinal : rrspSpentRefundFinal;

      const diff = selectedRrspFinal - tfsaFinal;
      const new2026RrspRoom = Math.min(33810, priorEarn * 0.18);
      const winner =
        Math.abs(diff) < 0.01 ? 'Exact Mathematical Tie' : diff > 0 ? 'RRSP Leads' : 'TFSA Leads';

      return {
        primaryValue: fmt(Math.max(selectedRrspFinal, tfsaFinal), 2),
        primaryUnit: `C$ Projected After-Tax Value (${winner})`,
        secondaryOutputs: [
          { label: 'TFSA After-Tax Final', value: fmtCurrency(tfsaFinal, 'C$') },
          { label: 'RRSP After-Tax Final', value: fmtCurrency(selectedRrspFinal, 'C$') },
          { label: 'Net RRSP vs TFSA Diff', value: `${diff >= 0 ? '+' : ''}${fmtCurrency(diff, 'C$')}` },
          { label: 'TFSA Out-of-Pocket Deposit', value: fmtCurrency(afterTaxSeed, 'C$') },
          { label: '2026 New RRSP Room (18% / $33.81k)', value: fmtCurrency(new2026RrspRoom, 'C$') },
          { label: '2026 TFSA Annual Limit', value: 'C$7,000 (C$109k cum.)' },
        ],
        steps: [
          `From ${fmtCurrency(B, 'C$')} pre-tax earnings at ${tNow}% marginal tax, after-tax deposit capacity = ${fmtCurrency(afterTaxSeed, 'C$')}.`,
          `TFSA compounds ${fmtCurrency(afterTaxSeed, 'C$')} × (1 + ${rPct}%)^${yrs} = ${fmtCurrency(tfsaFinal, 'C$')} (100% tax-free withdrawal; zero OAS clawback).`,
          reinv
            ? `RRSP (tax refund reinvested) compounds full ${fmtCurrency(B, 'C$')} × ${fmt(growth, 4)} × (1 − ${tRet}%) = ${fmtCurrency(rrspReinvestFinal, 'C$')}.`
            : `RRSP (tax refund spent) compounds only ${fmtCurrency(afterTaxSeed, 'C$')} × ${fmt(growth, 4)} × (1 − ${tRet}%) = ${fmtCurrency(rrspSpentRefundFinal, 'C$')}.`,
          `2026 OAS Recovery Context: 2025 net income > C$93,454 triggers 15% OAS clawback in Jul 2026–Jun 2027 (rising to C$95,323 on 2026 income for Jul 2027–Jun 2028).`,
        ],
      };
    },
  },

  // 18. CAGR Calculator (Multiplicative Annual Fee Convention)
  {
    slug: 'cagr-calculator',
    title: 'CAGR Calculator',
    category: 'finance',
    formulaDisplay: 'Gross CAGR = (Vf ÷ V0)^(1/n) − 1  |  V_after_fee = Vf(1 − f)^n  |  Net CAGR = (1+CAGR_g)(1−f) − 1',
    inputs: [
      { id: 'initialValue', label: 'Starting Investment Value (V₀)', defaultValue: 10000, type: 'number', min: 0.01, max: 1000000000, step: 500, unit: '$' },
      { id: 'finalValue', label: 'Ending Gross Investment Value (V_f)', defaultValue: 24500, type: 'number', min: 0.01, max: 1000000000, step: 500, unit: '$' },
      { id: 'years', label: 'Holding Period (n Years)', defaultValue: 8, type: 'number', min: 0.1, max: 100, step: 0.5, unit: 'yrs' },
      { id: 'annualFeePercent', label: 'Annual Expense Ratio / AUM Fee (%)', defaultValue: 0.75, type: 'number', min: 0, max: 20, step: 0.05, unit: '%', advanced: true, helpText: 'Compounded multiplicatively against annual NAV: V_net = V_f × (1 − f)^n.' },
      { id: 'capitalGainsTaxRate', label: 'Exit Capital Gains Tax Rate (%)', defaultValue: 15, type: 'number', min: 0, max: 60, step: 1, unit: '%', advanced: true, helpText: 'Applied solely on positive realized gain upon exit.' },
    ],
    calculate: (v) => {
      const v0 = parseNum(v.initialValue);
      const vf = parseNum(v.finalValue);
      const n = parseNum(v.years);
      const feePct = v.annualFeePercent === undefined ? 0.75 : parseNum(v.annualFeePercent);
      const taxPct = v.capitalGainsTaxRate === undefined ? 15 : parseNum(v.capitalGainsTaxRate);

      if ([v0, vf, n, feePct, taxPct].some(isNaN)) return calcError('Please enter valid positive values for initial value, final value, and years.');
      if (v0 <= 0 || vf <= 0 || n <= 0) return calcError('Initial value, final value, and holding period must all be strictly greater than 0.');
      if (feePct < 0 || feePct >= 100 || taxPct < 0 || taxPct > 65) return calcError('Annual fee must be 0–99.9% and tax rate 0–65%.');

      const cagrGross = Math.pow(vf / v0, 1 / n) - 1;
      const f = feePct / 100;
      const valAfterFee = vf * Math.pow(1 - f, n);
      const cagrNetFee = (1 + cagrGross) * (1 - f) - 1;

      const positiveGain = Math.max(0, valAfterFee - v0);
      const taxPaid = positiveGain * (taxPct / 100);
      const valAfterFeeAndTax = valAfterFee - taxPaid;
      const cagrNetAll = Math.pow(valAfterFeeAndTax / v0, 1 / n) - 1;
      const totalGrossReturnPct = ((vf - v0) / v0) * 100;

      return {
        primaryValue: fmt(cagrGross * 100, 4),
        primaryUnit: '% Gross CAGR (Annualized)',
        secondaryOutputs: [
          { label: 'Net CAGR (After Annual Fee)', value: fmt(cagrNetFee * 100, 4), unit: '%' },
          { label: 'Net CAGR (After Fee & Tax)', value: fmt(cagrNetAll * 100, 4), unit: '%' },
          { label: 'Total Cumulative Gross Return', value: fmt(totalGrossReturnPct, 2), unit: '%' },
          { label: 'Ending Value (After Fee)', value: fmtCurrency(valAfterFee) },
          { label: 'Ending Value (After Fee & Tax)', value: fmtCurrency(valAfterFeeAndTax) },
          { label: 'Estimated Fee + Tax Drag', value: fmtCurrency(vf - valAfterFeeAndTax) },
        ],
        steps: [
          `Gross CAGR = (${fmtCurrency(vf)} ÷ ${fmtCurrency(v0)})^(1 ÷ ${n}) − 1 = ${fmt(cagrGross * 100, 4)}%.`,
          `Multiplicative AUM Fee (${feePct}%/yr): Ending Value After Fee = ${fmtCurrency(vf)} × (1 − ${f})^${n} = ${fmtCurrency(valAfterFee)} (Net Fee CAGR = ${fmt(cagrNetFee * 100, 4)}%).`,
          `Exit Tax (${taxPct}% on positive gain ${fmtCurrency(positiveGain)}) = ${fmtCurrency(taxPaid)} → Net Final = ${fmtCurrency(valAfterFeeAndTax)} (Net-of-All CAGR = ${fmt(cagrNetAll * 100, 4)}%).`,
          `Disclosure: Historical/modeled CAGR smooths annual volatility and does not guarantee future returns.`,
        ],
      };
    },
  },

  // 19. Dividend Reinvestment (DRIP) Calculator (Monthly Purchase Aligned + Quarterly Dividends)
  {
    slug: 'dividend-reinvestment-drip-calculator',
    title: 'Dividend Reinvestment (DRIP) Calculator',
    category: 'finance',
    formulaDisplay: 'Monthly Share Buy + Quarterly Reinvested Dividend  |  g_mo = [(1 + g_price)(1 − f)]^(1/12) − 1',
    inputs: [
      { id: 'initialShares', label: 'Initial Shares Owned', defaultValue: 200, type: 'number', min: 0, max: 10000000, step: 10, unit: 'shares' },
      { id: 'sharePrice', label: 'Starting Share Price', defaultValue: 50, type: 'number', min: 0.01, max: 100000, step: 1, unit: '$' },
      { id: 'monthlyContribution', label: 'Monthly Investment Contribution', defaultValue: 250, type: 'number', min: 0, max: 1000000, step: 25, unit: '$', helpText: 'Purchases fractional shares monthly; dividends are paid & reinvested quarterly.' },
      { id: 'annualDividendYield', label: 'Annual Dividend Yield (%)', defaultValue: 3.6, type: 'number', min: 0, max: 25, step: 0.1, unit: '%' },
      { id: 'sharePriceGrowthRate', label: 'Expected Share Price Appreciation (%/yr)', defaultValue: 5.0, type: 'number', min: -15, max: 25, step: 0.25, unit: '%', advanced: true },
      { id: 'expenseRatio', label: 'Annual Fund Expense Ratio (%)', defaultValue: 0.2, type: 'number', min: 0, max: 5, step: 0.05, unit: '%', advanced: true },
      { id: 'dividendTaxRate', label: 'Dividend Tax Rate (0% inside IRA/ISA/TFSA)', defaultValue: 15, type: 'number', min: 0, max: 55, step: 1, unit: '%', advanced: true },
      { id: 'years', label: 'Investment Horizon (Years)', defaultValue: 15, type: 'number', min: 1, max: 50, step: 1, unit: 'yrs' },
    ],
    calculate: (v) => {
      const sh0 = parseNum(v.initialShares);
      const p0 = parseNum(v.sharePrice);
      const moC = parseNum(v.monthlyContribution);
      const divYld = parseNum(v.annualDividendYield);
      const pGrow = v.sharePriceGrowthRate === undefined ? 5.0 : parseNum(v.sharePriceGrowthRate);
      const fee = v.expenseRatio === undefined ? 0.2 : parseNum(v.expenseRatio);
      const divTax = v.dividendTaxRate === undefined ? 15 : parseNum(v.dividendTaxRate);
      const yrs = parseNum(v.years);

      if ([sh0, p0, moC, divYld, pGrow, fee, divTax, yrs].some(isNaN)) {
        return calcError('Please enter valid numbers for shares, share price, yield, growth, and years.');
      }
      if (sh0 < 0 || p0 <= 0 || moC < 0 || divYld < 0 || fee < 0 || fee >= 100 || divTax < 0 || divTax > 60 || yrs < 1 || yrs > 60) {
        return calcError('Share price and years must be positive; contributions, fees, and yields cannot be negative.');
      }

      const netFactor = (1 + pGrow / 100) * (1 - fee / 100);
      if (netFactor <= 0) return calcError('Combined share decline and fee rate cannot reduce annual price below zero.');
      const gMonthly = Math.pow(netFactor, 1 / 12) - 1;

      const totalMonths = Math.round(yrs * 12);
      let price = p0;
      let sharesDrip = sh0;
      let sharesNoDrip = sh0;
      let totalPrincipal = sh0 * p0;
      let grossDivDrip = 0;
      let netDivReinvested = 0;
      let cashDivNoDrip = 0;

      for (let m = 1; m <= totalMonths; m++) {
        price *= 1 + gMonthly;
        if (moC > 0) {
          sharesDrip += moC / price;
          sharesNoDrip += moC / price;
          totalPrincipal += moC;
        }
        if (m % 3 === 0) {
          const qDivPerShare = price * (divYld / 100 / 4);
          const grossD = sharesDrip * qDivPerShare;
          const netD = grossD * (1 - divTax / 100);
          grossDivDrip += grossD;
          netDivReinvested += netD;
          sharesDrip += netD / price;

          cashDivNoDrip += sharesNoDrip * qDivPerShare * (1 - divTax / 100);
        }
      }

      const valDrip = sharesDrip * price;
      const valNoDrip = sharesNoDrip * price + cashDivNoDrip;
      const dripBoost = valDrip - valNoDrip;
      const annualDivIncomeAtEnd = sharesDrip * price * (divYld / 100);

      return {
        primaryValue: fmt(valDrip, 2),
        primaryUnit: '$ Projected Ending Value (With DRIP)',
        secondaryOutputs: [
          { label: 'Ending Value (No DRIP)', value: fmtCurrency(valNoDrip) },
          { label: 'DRIP Compounding Advantage', value: `+${fmtCurrency(dripBoost)}` },
          { label: 'Final Shares Held (DRIP)', value: fmt(sharesDrip, 3), unit: 'shares' },
          { label: 'Total Principal Contributed', value: fmtCurrency(totalPrincipal) },
          { label: 'Net Dividends Reinvested', value: fmtCurrency(netDivReinvested) },
          { label: 'Ending Share Price (Net Fee)', value: fmtCurrency(price) },
          { label: 'Year-End Gross Dividend Income', value: fmtCurrency(annualDivIncomeAtEnd), unit: '/yr' },
          { label: 'Dividend Tax Paid (Est.)', value: fmtCurrency(grossDivDrip - netDivReinvested) },
        ],
        steps: [
          `Monthly price growth (net of ${fee}% fee): g_mo = [(1 + ${pGrow / 100})(1 − ${fee / 100})]^(1/12) − 1 = ${fmt(gMonthly * 100, 4)}%/mo → End price = ${fmtCurrency(price)}.`,
          `Monthly purchases (${fmtCurrency(moC)}/mo) across ${totalMonths} months invest ${fmtCurrency(totalPrincipal)} total principal.`,
          `Quarterly dividends (${divYld}%/yr ÷ 4, less ${divTax}% dividend tax) add ${fmtCurrency(netDivReinvested)} in reinvested shares → ${fmt(sharesDrip, 3)} shares = ${fmtCurrency(valDrip)}.`,
          `Compared to taking ${fmtCurrency(cashDivNoDrip)} in cash dividends (${fmtCurrency(valNoDrip)} total), DRIP generates +${fmtCurrency(dripBoost)}. (Illustrative projection; dividends are not guaranteed.)`,
        ],
      };
    },
  },

  // 20. Dollar-Cost Averaging (DCA) Calculator
  {
    slug: 'dollar-cost-averaging-calculator',
    title: 'Dollar-Cost Averaging (DCA) Calculator',
    category: 'finance',
    formulaDisplay: 'r_net = (1 + r)(1 − f) − 1,  r_p = (1 + r_net)^(1/k) − 1  |  FV = C[(1+r_p)^N − 1]/r_p',
    inputs: [
      { id: 'periodicAmount', label: 'Fixed Periodic Investment Amount', defaultValue: 500, type: 'number', min: 1, max: 5000000, step: 25, unit: '$' },
      {
        id: 'frequency',
        label: 'Investment Cadence',
        type: 'select',
        defaultValue: '12',
        options: [
          { label: 'Monthly (12/yr)', value: '12' },
          { label: 'Bi-Weekly (26/yr)', value: '26' },
          { label: 'Weekly (52/yr)', value: '52' },
        ],
      },
      { id: 'months', label: 'Investment Duration (Months)', defaultValue: 24, type: 'number', min: 1, max: 600, step: 1, unit: 'mo' },
      { id: 'expectedAnnualReturn', label: 'Expected Effective Annual Return (%)', defaultValue: 8.0, type: 'number', min: -30, max: 35, step: 0.25, unit: '%', helpText: 'Converted from effective annual net return to periodic effective rate.' },
      { id: 'annualFeePercent', label: 'Annual Fund Expense Ratio (%)', defaultValue: 0.25, type: 'number', min: 0, max: 5, step: 0.05, unit: '%', advanced: true },
      { id: 'capitalGainsTaxRate', label: 'Exit Capital Gains Tax Rate (%)', defaultValue: 15, type: 'number', min: 0, max: 55, step: 1, unit: '%', advanced: true },
    ],
    calculate: (v) => {
      const C = parseNum(v.periodicAmount);
      const k = v.frequency === undefined ? 12 : parseNum(v.frequency);
      const months = parseNum(v.months);
      const rAnnPct = parseNum(v.expectedAnnualReturn);
      const feePct = v.annualFeePercent === undefined ? 0.25 : parseNum(v.annualFeePercent);
      const taxPct = v.capitalGainsTaxRate === undefined ? 15 : parseNum(v.capitalGainsTaxRate);

      if ([C, k, months, rAnnPct, feePct, taxPct].some(isNaN)) {
        return calcError('Please enter valid numeric parameters for periodic amount, duration, return, and fees.');
      }
      if (C <= 0 || months < 1 || months > 600 || feePct < 0 || feePct >= 100 || taxPct < 0 || taxPct > 60 || ![12, 26, 52].includes(k)) {
        return calcError('Periodic amount and months must be positive, and fee/tax rates must be within valid limits.');
      }

      const netAnnual = (1 + rAnnPct / 100) * (1 - feePct / 100) - 1;
      if (netAnnual <= -1) return calcError('Combined return loss and fee cannot reach −100% annual loss.');

      const N = Math.max(1, Math.round((months / 12) * k));
      const rp = Math.pow(1 + netAnnual, 1 / k) - 1;
      const totalContributed = C * N;
      const fvGross = Math.abs(rp) < 1e-10 ? totalContributed : C * ((Math.pow(1 + rp, N) - 1) / rp);
      const netGain = fvGross - totalContributed;
      const taxOwed = Math.max(0, netGain) * (taxPct / 100);
      const fvAfterTax = fvGross - taxOwed;

      // Illustrative 4-period volatile price benchmark: [100, 80, 100, 120]
      const dipShares = C / 100 + C / 80 + C / 100 + C / 120;
      const avgDcaCost = (4 * C) / dipShares;

      return {
        primaryValue: fmt(fvGross, 2),
        primaryUnit: '$ Projected Value (Before Exit Tax)',
        secondaryOutputs: [
          { label: 'Net Value After Cap-Gains Tax', value: fmtCurrency(fvAfterTax) },
          { label: 'Total Principal Invested', value: fmtCurrency(totalContributed) },
          { label: 'Net Investment Gain / (Loss)', value: fmtCurrency(netGain) },
          { label: 'Net Annual Effective Return', value: fmt(netAnnual * 100, 2), unit: '%' },
          { label: 'Total Purchase Periods (N)', value: N },
          { label: 'Volatility Proof ($100→$80→$100→$120)', value: `${fmtCurrency(avgDcaCost)} avg vs $100 market` },
        ],
        steps: [
          `Net effective annual return (after ${feePct}% multiplicative fee) = (1 + ${rAnnPct / 100})(1 − ${feePct / 100}) − 1 = ${fmt(netAnnual * 100, 3)}% → Periodic rate r_p = ${fmt(rp * 100, 5)}%.`,
          `Investing ${fmtCurrency(C)} across ${N} periods contributes ${fmtCurrency(totalContributed)} total principal.`,
          `Ending value before tax = ${fmtCurrency(fvGross)}; positive gain taxed at ${taxPct}% (${fmtCurrency(taxOwed)}) → After-tax net = ${fmtCurrency(fvAfterTax)}.`,
          `Volatility Demo: Buying ${fmtCurrency(C)} across [$100, $80, $100, $120] accumulates ${fmt(dipShares, 4)} units at harmonic mean cost ${fmtCurrency(avgDcaCost)} (< $100.00 average price).`,
        ],
      };
    },
  },

  // 21. Stock Position Size & Risk Calculator
  {
    slug: 'stock-position-size-risk-calculator',
    title: 'Stock Position Size & Risk Calculator',
    category: 'finance',
    formulaDisplay: 'Max Shares = floor[(Balance × Risk% − Comm_in − Comm_out) ÷ |Entry − Stop|]',
    inputs: [
      { id: 'accountBalance', label: 'Trading Account Equity', defaultValue: 50000, type: 'number', min: 100, max: 1000000000, step: 1000, unit: '$' },
      { id: 'riskPercent', label: 'Maximum Account Risk per Trade (%)', defaultValue: 1.5, type: 'number', min: 0.05, max: 25, step: 0.25, unit: '%', helpText: 'Standard disciplined position risk: 0.5%–2.0% per trade.' },
      { id: 'entryPrice', label: 'Planned Entry Price ($)', defaultValue: 48.0, type: 'number', min: 0.01, max: 1000000, step: 0.5, unit: '$' },
      { id: 'stopLossPrice', label: 'Planned Stop-Loss Price ($)', defaultValue: 44.5, type: 'number', min: 0.01, max: 1000000, step: 0.5, unit: '$', helpText: 'Supports both Long (stop < entry) and Short (stop > entry) positions.' },
      { id: 'targetPrice', label: 'Target Exit Price (For R-Multiple)', defaultValue: 58.5, type: 'number', min: 0, max: 1000000, step: 0.5, unit: '$' },
      { id: 'entryCommission', label: 'Entry Commission / Fees ($)', defaultValue: 5, type: 'number', min: 0, max: 10000, step: 1, unit: '$', advanced: true },
      { id: 'exitCommission', label: 'Exit Commission / Fees ($)', defaultValue: 5, type: 'number', min: 0, max: 10000, step: 1, unit: '$', advanced: true },
    ],
    calculate: (v) => {
      const bal = parseNum(v.accountBalance);
      const riskPct = parseNum(v.riskPercent);
      const entry = parseNum(v.entryPrice);
      const stop = parseNum(v.stopLossPrice);
      const target = v.targetPrice === undefined ? 58.5 : parseNum(v.targetPrice);
      const cIn = v.entryCommission === undefined ? 5 : parseNum(v.entryCommission);
      const cOut = v.exitCommission === undefined ? 5 : parseNum(v.exitCommission);

      if ([bal, riskPct, entry, stop, target, cIn, cOut].some(isNaN)) {
        return calcError('Please enter valid numbers for account equity, risk %, entry, stop, and commissions.');
      }
      if (bal <= 0 || riskPct <= 0 || riskPct > 50 || entry <= 0 || stop <= 0 || target < 0 || cIn < 0 || cOut < 0) {
        return calcError('Account equity, risk %, entry, and stop-loss prices must be strictly positive.');
      }
      if (Math.abs(entry - stop) < 1e-9) {
        return calcError('Stop-loss price cannot equal entry price (risk per share would be $0.00).');
      }

      const direction = entry > stop ? 'Long' : 'Short';
      const maxRiskBudget = bal * (riskPct / 100);
      const totalComm = cIn + cOut;
      const riskPerShare = Math.abs(entry - stop);
      const shares = maxRiskBudget > totalComm ? Math.floor((maxRiskBudget - totalComm) / riskPerShare) : 0;

      const positionValue = shares * entry;
      const portfolioAllocPct = (positionValue / bal) * 100;
      const plannedDollarRisk = shares > 0 ? shares * riskPerShare + totalComm : 0;
      const rewardPerShare = Math.abs(target - entry);
      const rMultiple = rewardPerShare / riskPerShare;
      const targetFavorable = direction === 'Long' ? target > entry : target < entry;
      const netProfitAtTarget = targetFavorable ? shares * rewardPerShare - totalComm : -shares * rewardPerShare - totalComm;

      return {
        primaryValue: shares,
        primaryUnit: `shares Maximum Position Size (${direction})`,
        secondaryOutputs: [
          { label: 'Total Position Value', value: fmtCurrency(positionValue) },
          { label: 'Account Allocation (%)', value: fmt(portfolioAllocPct, 2), unit: portfolioAllocPct > 100 ? '% (Margin!)' : '%' },
          { label: 'Max Risk Budget', value: fmtCurrency(maxRiskBudget) },
          { label: 'Planned Dollar Risk (Incl. Fees)', value: fmtCurrency(plannedDollarRisk) },
          { label: 'Stop Distance (1R/Share)', value: fmtCurrency(riskPerShare) },
          { label: 'Reward-to-Risk Ratio', value: targetFavorable ? `${fmt(rMultiple, 2)}R` : 'Adverse Target' },
          { label: 'Net Profit at Target', value: fmtCurrency(netProfitAtTarget) },
          { label: 'Round-Trip Commissions', value: fmtCurrency(totalComm) },
        ],
        steps: [
          `Max Risk Budget = ${fmtCurrency(bal)} × ${riskPct}% = ${fmtCurrency(maxRiskBudget)}. Less entry (${fmtCurrency(cIn)}) + exit (${fmtCurrency(cOut)}) fees = ${fmtCurrency(Math.max(0, maxRiskBudget - totalComm))} net price risk.`,
          `${direction} 1R Stop Distance = |${fmtCurrency(entry)} − ${fmtCurrency(stop)}| = ${fmtCurrency(riskPerShare)}/share.`,
          `Whole Shares = floor((${fmtCurrency(maxRiskBudget)} − ${fmtCurrency(totalComm)}) ÷ ${fmtCurrency(riskPerShare)}) = ${shares} shares (Position Value = ${fmtCurrency(positionValue)}, ${fmt(portfolioAllocPct, 2)}% of equity).`,
          `R-Multiple Convention (1R = ${fmtCurrency(riskPerShare)}/sh): Target ${fmtCurrency(target)} = ${fmt(rMultiple, 2)}R. Execution Disclaimer: Overnight price gaps & slippage can cause actual loss to exceed planned stop-loss risk.`,
        ],
      };
    },
  },

  // 22. Real Rate of Return Calculator
  {
    slug: 'real-rate-of-return-calculator',
    title: 'Real Rate of Return Calculator',
    category: 'finance',
    formulaDisplay: 'Fisher Pre-Tax: r_real = (1+r_nom)/(1+i) − 1  |  Annual Tax Drag vs. Realization Exit Tax',
    inputs: [
      { id: 'nominalReturnRate', label: 'Nominal Annual Return (%)', defaultValue: 8.0, type: 'number', min: -50, max: 100, step: 0.25, unit: '%' },
      { id: 'inflationRate', label: 'Annual Inflation Rate (CPI %)', defaultValue: 3.2, type: 'number', min: -10, max: 100, step: 0.1, unit: '%' },
      { id: 'taxRate', label: 'Simplified Applicable Tax Rate (%)', defaultValue: 22, type: 'number', min: 0, max: 65, step: 1, unit: '%' },
      {
        id: 'taxTimingMode',
        label: 'Tax Timing Assumption',
        type: 'select',
        defaultValue: 'annual_drag',
        options: [
          { label: 'Annual Tax Drag (Savings / CDs / Interest / Dividends)', value: 'annual_drag' },
          { label: 'Deferred Realization Tax (Equities / Long-Term Cap Gains)', value: 'realization_exit' },
        ],
        helpText: 'Distinguishes yearly income taxation from tax deferred until sale.',
      },
      { id: 'investmentAmount', label: 'Initial Investment Principal', defaultValue: 50000, type: 'number', min: 0, max: 1000000000, step: 1000, unit: '$' },
      { id: 'years', label: 'Investment Horizon (Years)', defaultValue: 10, type: 'number', min: 1, max: 60, step: 1, unit: 'yrs' },
    ],
    calculate: (v) => {
      const rNomPct = parseNum(v.nominalReturnRate);
      const infPct = parseNum(v.inflationRate);
      const taxPct = parseNum(v.taxRate);
      const mode = String(v.taxTimingMode || 'annual_drag') === 'realization_exit' ? 'realization_exit' : 'annual_drag';
      const amt = parseNum(v.investmentAmount);
      const yrs = parseNum(v.years);

      if ([rNomPct, infPct, taxPct, amt, yrs].some(isNaN)) return calcError('Please enter valid numbers for nominal return, inflation, tax rate, principal, and years.');
      if (infPct <= -99.9 || rNomPct <= -99.9 || taxPct < 0 || taxPct > 65 || amt < 0 || yrs < 1 || yrs > 100) {
        return calcError('Inflation and nominal return must exceed −99.9%; tax 0–65%; years 1–100.');
      }

      const rNom = rNomPct / 100;
      const inf = infPct / 100;
      const tax = taxPct / 100;

      const grossReal = (1 + rNom) / (1 + inf) - 1;
      // Mode A: Annual tax drag each year
      const rNomAfterAnnualTax = rNom > 0 ? rNom * (1 - tax) : rNom;
      const realAnnualDrag = (1 + rNomAfterAnnualTax) / (1 + inf) - 1;
      const finalRealAnnualDrag = amt * Math.pow(1 + realAnnualDrag, yrs);

      // Mode B: Deferred tax only upon realization at exit
      const nomEnd = amt * Math.pow(1 + rNom, yrs);
      const positiveNomGain = Math.max(0, nomEnd - amt);
      const afterTaxNomEnd = nomEnd - positiveNomGain * tax;
      const finalRealRealization = afterTaxNomEnd / Math.pow(1 + inf, yrs);
      const realCagrRealization = amt > 0 ? Math.pow(finalRealRealization / amt, 1 / yrs) - 1 : grossReal;

      const activeRealRate = mode === 'annual_drag' ? realAnnualDrag : realCagrRealization;
      const activeRealValue = mode === 'annual_drag' ? finalRealAnnualDrag : finalRealRealization;
      const naiveApprox = rNomPct * (1 - tax) - infPct;

      return {
        primaryValue: fmt(activeRealRate * 100, 4),
        primaryUnit: `% Real After-Tax Return (${mode === 'annual_drag' ? 'Annual Drag' : 'Exit Realization'})`,
        secondaryOutputs: [
          { label: 'Pre-Tax Real Return (Fisher)', value: fmt(grossReal * 100, 4), unit: '%' },
          { label: `Real Purchasing Power (${yrs}y)`, value: fmtCurrency(activeRealValue) },
          { label: 'Annual-Drag Real Rate / Value', value: `${fmt(realAnnualDrag * 100, 3)}% (${fmtCurrency(finalRealAnnualDrag)})` },
          { label: 'Deferred-Exit Real Rate / Value', value: `${fmt(realCagrRealization * 100, 3)}% (${fmtCurrency(finalRealRealization)})` },
          { label: 'Nominal Balance Before Inflation', value: fmtCurrency(mode === 'annual_drag' ? amt * Math.pow(1 + rNomAfterAnnualTax, yrs) : afterTaxNomEnd) },
          { label: 'Naive Subtraction (r−i) Error', value: fmt(naiveApprox - realAnnualDrag * 100, 3), unit: '%' },
        ],
        steps: [
          `Fisher Pre-Tax Real Return = (1 + ${rNom}) ÷ (1 + ${inf}) − 1 = ${fmt(grossReal * 100, 4)}%/yr.`,
          `Mode A (Annual Tax Drag): Nominal after ${taxPct}% yearly tax = ${fmt(rNomAfterAnnualTax * 100, 2)}% → Real = ${fmt(realAnnualDrag * 100, 4)}%/yr (${fmtCurrency(finalRealAnnualDrag)} purchasing power).`,
          `Mode B (Tax Upon Exit): Nominal ${fmtCurrency(nomEnd)} less ${taxPct}% tax on gains → ${fmtCurrency(afterTaxNomEnd)} ÷ (1+${inf})^${yrs} = ${fmtCurrency(finalRealRealization)} (${fmt(realCagrRealization * 100, 4)}% real CAGR).`,
          `Simplified Assumption Note: Applies flat uniform tax rate to nominal gains without bracket shifts or basis inflation adjustments.`,
        ],
      };
    },
  },

  // 23. RMD Calculator (IRS Pub 590-B SECURE 2.0)
  {
    slug: 'rmd-calculator',
    title: 'RMD Calculator (Required Minimum Distribution)',
    category: 'finance',
    formulaDisplay: 'RMD = Prior Year Dec 31 Balance ÷ IRS Pub 590-B Distribution Period (Age)',
    inputs: [
      { id: 'priorYearEndBalance', label: 'Account Balance as of Dec 31 (Prior Year)', defaultValue: 650000, type: 'number', min: 0, max: 100000000, step: 5000, unit: '$' },
      { id: 'birthYear', label: 'Account Owner Birth Year', defaultValue: 1952, type: 'number', min: 1900, max: 2010, step: 1, unit: 'year' },
      { id: 'distributionYear', label: 'RMD Distribution Tax Year', defaultValue: 2026, type: 'number', min: 2024, max: 2090, step: 1, unit: 'year' },
      {
        id: 'accountType',
        label: 'Retirement Account Type',
        type: 'select',
        defaultValue: 'traditional',
        options: [
          { label: 'Traditional IRA / 401(k) / 403(b) / SEP / SIMPLE', value: 'traditional' },
          { label: 'Roth IRA (Exempt During Owner Lifetime)', value: 'roth_ira' },
          { label: 'Designated Roth 401(k) / 403(b) (Exempt Since 2024)', value: 'roth_401k' },
        ],
      },
      {
        id: 'spouseSoleBeneficiaryYounger',
        label: 'Sole Beneficiary Spouse >10 Years Younger?',
        type: 'select',
        defaultValue: 'no',
        advanced: true,
        options: [
          { label: 'No — Use IRS Uniform Lifetime Table (Table III)', value: 'no' },
          { label: 'Yes — Joint Life Table II Applies (Lower RMD)', value: 'yes' },
        ],
      },
    ],
    calculate: (v) => {
      const bal = parseNum(v.priorYearEndBalance);
      const birthYr = parseNum(v.birthYear);
      const distYr = parseNum(v.distributionYear);
      const accType = String(v.accountType || 'traditional');
      const spouseYounger = String(v.spouseSoleBeneficiaryYounger || 'no') === 'yes';

      if ([bal, birthYr, distYr].some(isNaN)) return calcError('Please enter valid numbers for balance, birth year, and distribution year.');
      if (bal < 0 || bal > 1e10) return calcError('Account balance cannot be negative.');
      if (birthYr < 1900 || birthYr > 2010 || distYr < birthYr || distYr > 2100) {
        return calcError('Birth year (1900–2010) and distribution year must be chronologically valid.');
      }

      const ageInDistYear = Math.round(distYr - birthYr);
      const rmdStartAge = birthYr <= 1950 ? 72 : birthYr <= 1959 ? 73 : 75;
      const firstRmdYear = birthYr + rmdStartAge;

      if (accType === 'roth_ira' || accType === 'roth_401k') {
        return {
          primaryValue: 0,
          primaryUnit: '$ Required Minimum Distribution (Lifetime Exempt)',
          secondaryOutputs: [
            { label: 'Owner Age in Tax Year', value: ageInDistYear, unit: 'yrs' },
            { label: 'SECURE 2.0 Exemption', value: 'Exempt During Owner Lifetime' },
            { label: 'Account Balance Kept Invested', value: fmtCurrency(bal) },
          ],
          steps: [
            `Roth IRAs and Designated Roth 401(k)/403(b) accounts (under SECURE 2.0 effective 2024+) have $0 RMD during the original owner's lifetime.`,
            `Note: Inherited Roth accounts remain subject to beneficiary distribution rules.`,
          ],
        };
      }

      if (ageInDistYear < rmdStartAge) {
        return {
          primaryValue: 0,
          primaryUnit: `$ No RMD Required Yet (Starts Age ${rmdStartAge} in ${firstRmdYear})`,
          secondaryOutputs: [
            { label: `Owner Age in ${distYr}`, value: ageInDistYear, unit: 'yrs' },
            { label: 'SECURE 2.0 Start Age', value: rmdStartAge, unit: 'yrs' },
            { label: 'First RMD Tax Year', value: firstRmdYear },
            { label: 'First-Year Delay Deadline', value: `April 1, ${firstRmdYear + 1}` },
          ],
          steps: [
            `Birth year ${birthYr} → SECURE 2.0 RMD starting age = ${rmdStartAge} (first RMD tax year: ${firstRmdYear}).`,
            `At age ${ageInDistYear} in ${distYr}, your required distribution is $0.00.`,
          ],
        };
      }

      const lookupAge = Math.min(120, Math.max(72, ageInDistYear));
      const factor = IRS_UNIFORM_LIFETIME_TABLE[lookupAge] ?? 2.0;
      const rmdAmount = bal / factor;
      const pctWithdraw = bal > 0 ? (100 / factor) : 0;

      return {
        primaryValue: fmt(rmdAmount, 2),
        primaryUnit: `$ Required Minimum Distribution for ${distYr}`,
        secondaryOutputs: [
          { label: `Owner Age (${distYr})`, value: ageInDistYear, unit: 'yrs' },
          { label: 'IRS Uniform Table III Factor', value: factor },
          { label: 'RMD % of Dec 31 Balance', value: fmt(pctWithdraw, 4), unit: '%' },
          { label: 'Monthly Equivalent', value: fmtCurrency(rmdAmount / 12) },
          { label: 'SECURE 2.0 Start Age', value: rmdStartAge, unit: 'yrs' },
          { label: 'Table Notice', value: spouseYounger ? 'Joint Table II Lower RMD' : 'Table III Uniform' },
        ],
        steps: [
          `Birth year ${birthYr} sets SECURE 2.0 RMD start age = ${rmdStartAge}. Age in ${distYr} = ${ageInDistYear}.`,
          `IRS Publication 590-B Table III (Uniform Lifetime Table) distribution period for age ${lookupAge} = ${factor}.`,
          `RMD = ${fmtCurrency(bal)} ÷ ${factor} = ${fmtCurrency(rmdAmount)} (${fmt(pctWithdraw, 4)}% of Dec 31 balance; ${fmtCurrency(rmdAmount / 12)}/mo equivalent).`,
          spouseYounger
            ? `Note: Because your sole beneficiary spouse is >10 years younger, IRS Table II yields a larger divisor (and smaller RMD) than Table III. Withdrawal Deadline: Dec 31, ${distYr}.`
            : distYr === firstRmdYear
              ? `Withdrawal Deadline: Dec 31, ${distYr} (or Apr 1, ${firstRmdYear + 1} for your first RMD year, which causes two RMDs in ${firstRmdYear + 1}). Missed RMD excise tax is 25% (10% if timely corrected).`
              : `Withdrawal Deadline: Dec 31, ${distYr} (Apr 1 delay applied only to your first RMD year ${firstRmdYear}). Missed RMD excise tax is 25% (10% if timely corrected).`,
        ],
      };
    },
  },

  // 24. Rental Property Cash Flow Calculator
  {
    slug: 'rental-property-cash-flow-calculator',
    title: 'Rental Property Cash Flow Calculator',
    category: 'finance',
    formulaDisplay: 'NOI = EGI − OpEx  |  Cash Flow = NOI − Annual Debt Service  |  DSCR = NOI ÷ ADS',
    inputs: [
      { id: 'purchasePrice', label: 'Property Purchase Price', defaultValue: 360000, type: 'number', min: 10000, max: 100000000, step: 5000, unit: '$' },
      { id: 'downPaymentPercent', label: 'Down Payment (%)', defaultValue: 20, type: 'number', min: 0, max: 100, step: 5, unit: '%' },
      { id: 'closingAndRehabCosts', label: 'Closing + Initial Rehab Outlay', defaultValue: 10800, type: 'number', min: 0, max: 50000000, step: 500, unit: '$' },
      { id: 'mortgageRate', label: 'Investment Mortgage Interest Rate (APR)', defaultValue: 6.5, type: 'number', min: 0, max: 25, step: 0.125, unit: '%' },
      { id: 'loanTermYears', label: 'Mortgage Loan Term', defaultValue: 30, type: 'number', min: 1, max: 40, step: 5, unit: 'yrs' },
      { id: 'monthlyGrossRent', label: 'Gross Scheduled Monthly Rent', defaultValue: 2850, type: 'number', min: 0, max: 1000000, step: 50, unit: '$' },
      { id: 'vacancyRate', label: 'Vacancy & Credit Loss Allowance (%)', defaultValue: 5, type: 'number', min: 0, max: 50, step: 1, unit: '%', advanced: true },
      { id: 'annualPropertyTax', label: 'Annual Property Taxes', defaultValue: 4200, type: 'number', min: 0, max: 500000, step: 100, unit: '$', advanced: true },
      { id: 'annualInsurance', label: 'Annual Landlord Insurance', defaultValue: 1600, type: 'number', min: 0, max: 200000, step: 100, unit: '$', advanced: true },
      { id: 'annualMaintenance', label: 'Annual Repairs & Maintenance', defaultValue: 2400, type: 'number', min: 0, max: 500000, step: 100, unit: '$', advanced: true },
      { id: 'managementFeePercent', label: 'Property Management Fee (% of EGI)', defaultValue: 8, type: 'number', min: 0, max: 30, step: 1, unit: '%', advanced: true },
      { id: 'annualCapExReserve', label: 'Annual CapEx Reserve (Roof/HVAC)', defaultValue: 1800, type: 'number', min: 0, max: 500000, step: 100, unit: '$', advanced: true },
    ],
    calculate: (v) => {
      const price = parseNum(v.purchasePrice);
      const dpPct = parseNum(v.downPaymentPercent);
      const closeRehab = parseNum(v.closingAndRehabCosts);
      const rate = parseNum(v.mortgageRate);
      const term = parseNum(v.loanTermYears);
      const moRent = parseNum(v.monthlyGrossRent);
      const vac = v.vacancyRate === undefined ? 5 : parseNum(v.vacancyRate);
      const pTax = v.annualPropertyTax === undefined ? 4200 : parseNum(v.annualPropertyTax);
      const ins = v.annualInsurance === undefined ? 1600 : parseNum(v.annualInsurance);
      const maint = v.annualMaintenance === undefined ? 2400 : parseNum(v.annualMaintenance);
      const mgmt = v.managementFeePercent === undefined ? 8 : parseNum(v.managementFeePercent);
      const capex = v.annualCapExReserve === undefined ? 1800 : parseNum(v.annualCapExReserve);

      const vals = [price, dpPct, closeRehab, rate, term, moRent, vac, pTax, ins, maint, mgmt, capex];
      if (vals.some(isNaN)) return calcError('Please enter valid numeric parameters for property, loan, rent, and expenses.');
      if (price <= 0 || dpPct < 0 || dpPct > 100 || closeRehab < 0 || rate < 0 || term <= 0 || moRent < 0 || vac < 0 || vac >= 100 || [pTax, ins, maint, mgmt, capex].some((x) => x < 0)) {
        return calcError('Check that purchase price and loan term are positive and expense percentages are valid.');
      }

      const grossAnnualRent = moRent * 12;
      const egi = grossAnnualRent * (1 - vac / 100);
      const mgmtAmt = egi * (mgmt / 100);
      const totalOpEx = pTax + ins + maint + mgmtAmt + capex;
      const noi = egi - totalOpEx;
      const capRate = (noi / price) * 100;

      const loan = price * (1 - dpPct / 100);
      const mr = rate / 100 / 12;
      const n = Math.round(term * 12);
      const monthlyPI = loan === 0 ? 0 : mr === 0 ? loan / n : (loan * mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1);
      const annualDebtService = monthlyPI * 12;

      const annualCashFlow = noi - annualDebtService;
      const monthlyCashFlow = annualCashFlow / 12;
      const totalCashInvested = price * (dpPct / 100) + closeRehab;
      const cocPct = totalCashInvested > 0 ? (annualCashFlow / totalCashInvested) * 100 : null;
      const dscr = annualDebtService > 0 ? noi / annualDebtService : null;

      return {
        primaryValue: fmt(monthlyCashFlow, 2),
        primaryUnit: '$ / month Pre-Tax Cash Flow',
        secondaryOutputs: [
          { label: 'Annual Pre-Tax Cash Flow', value: fmtCurrency(annualCashFlow) },
          { label: 'Net Operating Income (NOI)', value: fmtCurrency(noi) },
          { label: 'Capitalization Rate (Cap Rate)', value: fmt(capRate, 2), unit: '%' },
          { label: 'Cash-on-Cash Return', value: cocPct === null ? 'N/A (0 Cash In)' : fmt(cocPct, 2), unit: cocPct === null ? '' : '%' },
          { label: 'DSCR (Debt Coverage)', value: dscr === null ? 'N/A (No Debt)' : `${fmt(dscr, 2)}x` },
          { label: 'Effective Gross Income (EGI)', value: fmtCurrency(egi) },
          { label: 'Annual Operating Expenses', value: fmtCurrency(totalOpEx) },
          { label: 'Monthly Mortgage (P&I)', value: fmtCurrency(monthlyPI) },
        ],
        steps: [
          `Effective Gross Income (EGI) = ${fmtCurrency(grossAnnualRent)} × (1 − ${vac}% vacancy) = ${fmtCurrency(egi)}.`,
          `Operating Expenses (OpEx) = Tax ${fmtCurrency(pTax)} + Ins ${fmtCurrency(ins)} + Maint ${fmtCurrency(maint)} + Mgmt ${fmtCurrency(mgmtAmt)} + CapEx ${fmtCurrency(capex)} = ${fmtCurrency(totalOpEx)}.`,
          `NOI = ${fmtCurrency(egi)} − ${fmtCurrency(totalOpEx)} = ${fmtCurrency(noi)} (Cap Rate = ${fmt(capRate, 2)}%).`,
          `Annual Debt Service on ${fmtCurrency(loan)} (${monthlyPI > 0 ? fmtCurrency(monthlyPI) + '/mo' : '$0 debt'}) = ${fmtCurrency(annualDebtService)} → Cash Flow = ${fmtCurrency(annualCashFlow)}/yr (${fmtCurrency(monthlyCashFlow)}/mo)${dscr !== null ? `; DSCR = ${fmt(dscr, 2)}x` : ''}.`,
        ],
      };
    },
  },
];
