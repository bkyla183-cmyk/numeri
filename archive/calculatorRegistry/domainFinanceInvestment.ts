import { CalculatorSpec } from './types';

// Standard PMT formula: P * [r(1+r)^n] / [(1+r)^n - 1]
function calculatePMT(principal: number, annualRatePct: number, years: number, paymentsPerYear = 12): { pmt: number; totalPayment: number; totalInterest: number } {
  const p = Math.max(0, principal);
  const r = annualRatePct / 100 / paymentsPerYear;
  const n = years * paymentsPerYear;
  if (r === 0) {
    const pmt = p / (n || 1);
    return { pmt, totalPayment: p, totalInterest: 0 };
  }
  const factor = Math.pow(1 + r, n);
  const pmt = (p * r * factor) / (factor - 1);
  const totalPayment = pmt * n;
  const totalInterest = totalPayment - p;
  return { pmt, totalPayment, totalInterest };
}

export const financeInvestmentSpecs: CalculatorSpec[] = [
  // FINANCE
  {
    slug: 'loan-calculator',
    title: 'Loan Payment Calculator',
    category: 'finance',
    formulaDisplay: 'M = P · [r(1+r)^n] / [(1+r)^n - 1]',
    inputs: [
      { id: 'principal', label: 'Loan Amount ($)', defaultValue: 25000, type: 'number', min: 100, step: 500, unit: '$' },
      { id: 'rate', label: 'Annual Interest Rate (%)', defaultValue: 6.5, type: 'number', min: 0, step: 0.1, unit: '%' },
      { id: 'term', label: 'Loan Term (Years)', defaultValue: 5, type: 'number', min: 0.5, step: 0.5, unit: 'years' },
    ],
    calculate: (v) => {
      const p = Number(v.principal) || 0;
      const r = Number(v.rate) || 0;
      const t = Number(v.term) || 1;
      const res = calculatePMT(p, r, t, 12);
      return {
        primaryValue: parseFloat(res.pmt.toFixed(2)),
        primaryUnit: '$ / mo',
        primaryLabel: 'Monthly Payment',
        secondaryOutputs: [
          { label: 'Total Interest Paid', value: `$${res.totalInterest.toFixed(2)}` },
          { label: 'Total Repayment', value: `$${res.totalPayment.toFixed(2)}` },
          { label: 'Principal Loan Amount', value: `$${p.toFixed(2)}` },
        ],
        steps: [`Amortized over ${t * 12} monthly payments at ${r}% APR.`],
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
      { id: 'homePrice', label: 'Home Price ($)', defaultValue: 400000, type: 'number', step: 5000, unit: '$' },
      { id: 'downPayment', label: 'Down Payment ($)', defaultValue: 80000, type: 'number', step: 5000, unit: '$' },
      { id: 'rate', label: 'Interest Rate (%)', defaultValue: 6.75, type: 'number', step: 0.1, unit: '%' },
      { id: 'term', label: 'Term (Years)', defaultValue: 30, type: 'number', step: 5, unit: 'years' },
      { id: 'taxRate', label: 'Annual Property Tax Rate (%)', defaultValue: 1.2, type: 'number', step: 0.1, unit: '%' },
      { id: 'insurance', label: 'Annual Home Insurance ($)', defaultValue: 1200, type: 'number', step: 100, unit: '$' },
    ],
    calculate: (v) => {
      const price = Number(v.homePrice) || 0;
      const down = Number(v.downPayment) || 0;
      const loan = Math.max(0, price - down);
      const rate = Number(v.rate) || 0;
      const term = Number(v.term) || 30;
      const taxRate = Number(v.taxRate) || 0;
      const ins = Number(v.insurance) || 0;
      const pi = calculatePMT(loan, rate, term, 12);
      const monthlyTax = (price * (taxRate / 100)) / 12;
      const monthlyIns = ins / 12;
      const totalMonthly = pi.pmt + monthlyTax + monthlyIns;
      return {
        primaryValue: parseFloat(totalMonthly.toFixed(2)),
        primaryUnit: '$ / mo',
        primaryLabel: 'Total Monthly PITI Payment',
        secondaryOutputs: [
          { label: 'Principal & Interest', value: `$${pi.pmt.toFixed(2)}` },
          { label: 'Property Tax (Est.)', value: `$${monthlyTax.toFixed(2)}` },
          { label: 'Homeowners Insurance', value: `$${monthlyIns.toFixed(2)}` },
          { label: 'Total Loan Interest', value: `$${pi.totalInterest.toFixed(2)}` },
          { label: 'Loan-to-Value (LTV)', value: `${((loan / (price || 1)) * 100).toFixed(1)}%` },
        ],
        steps: [`Principal & Interest = $${pi.pmt.toFixed(2)}`, `Escrow Taxes & Insurance = $${(monthlyTax + monthlyIns).toFixed(2)}`],
        formulaUsed: 'PITI Mortgage Equation',
      };
    },
  },
  {
    slug: 'compound-interest-calculator',
    title: 'Compound Interest Calculator',
    category: 'finance',
    formulaDisplay: 'A = P(1 + r/n)^(nt) + PMT · [((1 + r/n)^(nt) - 1) / (r/n)]',
    inputs: [
      { id: 'principal', label: 'Initial Principal ($)', defaultValue: 10000, type: 'number', step: 500, unit: '$' },
      { id: 'monthly', label: 'Monthly Contribution ($)', defaultValue: 500, type: 'number', step: 50, unit: '$' },
      { id: 'rate', label: 'Annual Interest Rate (%)', defaultValue: 8, type: 'number', step: 0.25, unit: '%' },
      { id: 'years', label: 'Investment Horizon (Years)', defaultValue: 20, type: 'number', min: 1, step: 1, unit: 'years' },
    ],
    calculate: (v) => {
      const p = Number(v.principal) || 0;
      const m = Number(v.monthly) || 0;
      const r = (Number(v.rate) || 0) / 100;
      const t = Number(v.years) || 1;
      const n = 12;
      const r_n = r / n;
      const periods = n * t;
      const pGrowth = p * Math.pow(1 + r_n, periods);
      const mGrowth = r_n > 0 ? m * ((Math.pow(1 + r_n, periods) - 1) / r_n) : m * periods;
      const totalBalance = pGrowth + mGrowth;
      const totalDeposits = p + m * periods;
      const totalInterest = totalBalance - totalDeposits;
      return {
        primaryValue: parseFloat(totalBalance.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: 'Future Portfolio Balance',
        secondaryOutputs: [
          { label: 'Total Interest Earned', value: `$${totalInterest.toFixed(2)}` },
          { label: 'Total Principal Invested', value: `$${totalDeposits.toFixed(2)}` },
          { label: 'Growth Multiplier', value: `${(totalBalance / (totalDeposits || 1)).toFixed(2)}x` },
        ],
        steps: [`Principal grew to $${pGrowth.toFixed(2)}`, `Contributions grew to $${mGrowth.toFixed(2)}`],
        formulaUsed: 'Compound Annuity Future Value',
      };
    },
  },
  {
    slug: 'simple-interest-calculator',
    title: 'Simple Interest Calculator',
    category: 'finance',
    formulaDisplay: 'I = P × r × t',
    inputs: [
      { id: 'principal', label: 'Principal (P)', defaultValue: 5000, type: 'number', step: 100, unit: '$' },
      { id: 'rate', label: 'Annual Rate (r in %)', defaultValue: 5, type: 'number', step: 0.1, unit: '%' },
      { id: 'time', label: 'Time (t in Years)', defaultValue: 3, type: 'number', step: 0.5, unit: 'years' },
    ],
    calculate: (v) => {
      const p = Number(v.principal) || 0;
      const r = (Number(v.rate) || 0) / 100;
      const t = Number(v.time) || 0;
      const interest = p * r * t;
      const total = p + interest;
      return {
        primaryValue: parseFloat(interest.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: 'Total Simple Interest',
        secondaryOutputs: [
          { label: 'Total Balance (P + I)', value: `$${total.toFixed(2)}` },
          { label: 'Annual Interest', value: `$${(p * r).toFixed(2)}` },
        ],
        steps: [`I = ${p} × ${r} × ${t} = ${interest.toFixed(2)}`],
        formulaUsed: 'I = P · r · t',
      };
    },
  },
  {
    slug: 'emi-calculator',
    title: 'EMI Calculator',
    category: 'finance',
    formulaDisplay: 'EMI = P · r · (1+r)^n / ((1+r)^n - 1)',
    inputs: [
      { id: 'p', label: 'Principal Borrowed', defaultValue: 100000, type: 'number', step: 1000, unit: '$' },
      { id: 'r', label: 'Annual Interest Rate (%)', defaultValue: 8.5, type: 'number', step: 0.1, unit: '%' },
      { id: 'n', label: 'Tenure (Months)', defaultValue: 60, type: 'number', min: 1, step: 1, unit: 'mo' },
    ],
    calculate: (v) => {
      const p = Number(v.p) || 0;
      const r = Number(v.r) || 0;
      const n = Number(v.n) || 12;
      const res = calculatePMT(p, r, n / 12, 12);
      return {
        primaryValue: parseFloat(res.pmt.toFixed(2)),
        primaryUnit: '$ / mo',
        primaryLabel: 'Equated Monthly Installment (EMI)',
        secondaryOutputs: [
          { label: 'Total Interest', value: `$${res.totalInterest.toFixed(2)}` },
          { label: 'Total Amount Payable', value: `$${res.totalPayment.toFixed(2)}` },
        ],
        steps: [`Monthly payment calculated for ${n} installments.`],
        formulaUsed: 'Equated Monthly Installment Standard',
      };
    },
  },
  {
    slug: 'investment-calculator',
    title: 'Investment Growth Calculator',
    category: 'finance',
    formulaDisplay: 'A = P(1+r)^t + PMT × ((1+r)^t - 1) / r',
    inputs: [
      { id: 'starting', label: 'Starting Capital ($)', defaultValue: 25000, type: 'number', step: 1000, unit: '$' },
      { id: 'annualAdd', label: 'Annual Addition ($)', defaultValue: 6000, type: 'number', step: 500, unit: '$' },
      { id: 'returnRate', label: 'Expected Return (%)', defaultValue: 9, type: 'number', step: 0.5, unit: '%' },
      { id: 'years', label: 'Years to Grow', defaultValue: 15, type: 'number', min: 1, step: 1, unit: 'years' },
    ],
    calculate: (v) => {
      const p = Number(v.starting) || 0;
      const pmt = Number(v.annualAdd) || 0;
      const r = (Number(v.returnRate) || 0) / 100;
      const t = Number(v.years) || 1;
      let bal = p;
      for (let i = 0; i < t; i++) {
        bal = (bal + pmt) * (1 + r);
      }
      const totalContributed = p + pmt * t;
      return {
        primaryValue: parseFloat(bal.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: 'Projected Portfolio Value',
        secondaryOutputs: [
          { label: 'Total Contributions', value: `$${totalContributed.toFixed(2)}` },
          { label: 'Total Capital Gains / Interest', value: `$${(bal - totalContributed).toFixed(2)}` },
        ],
        steps: [`Compounded annually at ${(r * 100).toFixed(1)}% with $${pmt} annual additions.`],
        formulaUsed: 'Annual Compounding with Regular Contributions',
      };
    },
  },
  {
    slug: 'savings-calculator',
    title: 'High-Yield Savings Calculator',
    category: 'finance',
    formulaDisplay: 'FV = P(1 + r/12)^(12t)',
    inputs: [
      { id: 'p', label: 'Initial Deposit ($)', defaultValue: 5000, type: 'number', step: 100, unit: '$' },
      { id: 'monthly', label: 'Monthly Deposit ($)', defaultValue: 300, type: 'number', step: 50, unit: '$' },
      { id: 'apy', label: 'Annual APY (%)', defaultValue: 4.5, type: 'number', step: 0.1, unit: '%' },
      { id: 'years', label: 'Years', defaultValue: 5, type: 'number', min: 1, step: 1, unit: 'years' },
    ],
    calculate: (v) => {
      const p = Number(v.p) || 0;
      const m = Number(v.monthly) || 0;
      const r = (Number(v.apy) || 0) / 100 / 12;
      const months = (Number(v.years) || 1) * 12;
      let bal = p;
      for (let i = 0; i < months; i++) {
        bal = (bal + m) * (1 + r);
      }
      const deposited = p + m * months;
      return {
        primaryValue: parseFloat(bal.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: 'Total Savings Balance',
        secondaryOutputs: [
          { label: 'Total Interest Earned', value: `$${(bal - deposited).toFixed(2)}` },
          { label: 'Total Amount Deposited', value: `$${deposited.toFixed(2)}` },
        ],
        steps: [`Calculated at ${((r * 12) * 100).toFixed(2)}% APY monthly compounding.`],
        formulaUsed: 'Monthly Compounding Savings Equation',
      };
    },
  },
  {
    slug: 'retirement-calculator',
    title: 'Retirement Nest Egg Calculator',
    category: 'finance',
    formulaDisplay: 'Target = Annual Expenses × 25 (4% Safe Withdrawal)',
    inputs: [
      { id: 'annualSpend', label: 'Desired Annual Spending in Retirement ($)', defaultValue: 60000, type: 'number', step: 5000, unit: '$' },
      { id: 'socialSecurity', label: 'Expected Annual Pension / Social Security ($)', defaultValue: 20000, type: 'number', step: 1000, unit: '$' },
      { id: 'currentSaved', label: 'Current Retirement Savings ($)', defaultValue: 150000, type: 'number', step: 10000, unit: '$' },
      { id: 'yearsToRetire', label: 'Years Until Retirement', defaultValue: 20, type: 'number', step: 1, unit: 'years' },
    ],
    calculate: (v) => {
      const spend = Number(v.annualSpend) || 60000;
      const ss = Number(v.socialSecurity) || 0;
      const current = Number(v.currentSaved) || 0;
      const netAnnual = Math.max(0, spend - ss);
      const targetNestEgg = netAnnual * 25; // 4% rule
      const years = Number(v.yearsToRetire) || 20;
      const futureCurrent = current * Math.pow(1.07, years); // assumed 7% real
      const gap = Math.max(0, targetNestEgg - futureCurrent);
      return {
        primaryValue: parseFloat(targetNestEgg.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: 'Target Retirement Nest Egg (4% Rule)',
        secondaryOutputs: [
          { label: 'Net Annual Portfolio Draw', value: `$${netAnnual.toLocaleString()}` },
          { label: 'Current Savings Grew to (at 7% real)', value: `$${futureCurrent.toFixed(0)}` },
          { label: 'Remaining Gap Needed', value: `$${gap.toFixed(0)}` },
        ],
        steps: [`Net needed from portfolio = $${spend} - $${ss} = $${netAnnual}`, `Nest egg = $${netAnnual} × 25 = $${targetNestEgg}`],
        formulaUsed: 'Trinity Study 4% Safe Withdrawal Rate (SWR)',
      };
    },
  },
  {
    slug: 'roi-calculator',
    title: 'ROI (Return on Investment) Calculator',
    category: 'finance',
    formulaDisplay: 'ROI = [(Gain from Investment - Cost) / Cost] × 100',
    inputs: [
      { id: 'cost', label: 'Initial Investment Cost ($)', defaultValue: 10000, type: 'number', min: 1, step: 500, unit: '$' },
      { id: 'finalVal', label: 'Final Value / Revenue ($)', defaultValue: 14500, type: 'number', step: 500, unit: '$' },
      { id: 'years', label: 'Holding Period (Years)', defaultValue: 3, type: 'number', min: 0.1, step: 0.5, unit: 'years' },
    ],
    calculate: (v) => {
      const cost = Number(v.cost) || 1;
      const finalVal = Number(v.finalVal) || 0;
      const t = Number(v.years) || 1;
      const netProfit = finalVal - cost;
      const roi = (netProfit / cost) * 100;
      const annualized = (Math.pow(finalVal / cost, 1 / t) - 1) * 100;
      return {
        primaryValue: parseFloat(roi.toFixed(2)),
        primaryUnit: '%',
        primaryLabel: 'Total Return on Investment (ROI)',
        secondaryOutputs: [
          { label: 'Net Profit ($)', value: `$${netProfit.toFixed(2)}` },
          { label: 'Annualized ROI (CAGR)', value: `${annualized.toFixed(2)}%` },
          { label: 'Investment Multiple (MOIC)', value: `${(finalVal / cost).toFixed(2)}x` },
        ],
        steps: [`Net Profit = $${finalVal} - $${cost} = $${netProfit}`, `ROI = ($${netProfit} / $${cost}) × 100 = ${roi.toFixed(2)}%`],
        formulaUsed: 'ROI = (Net Return / Cost) × 100',
      };
    },
  },
  {
    slug: 'profit-margin-calculator',
    title: 'Profit Margin Calculator',
    category: 'finance',
    formulaDisplay: 'Margin % = [(Revenue - Cost) / Revenue] × 100',
    inputs: [
      { id: 'rev', label: 'Revenue ($)', defaultValue: 150000, type: 'number', min: 0, step: 1000, unit: '$' },
      { id: 'cost', label: 'Cost of Goods / Expenses ($)', defaultValue: 95000, type: 'number', min: 0, step: 1000, unit: '$' },
    ],
    calculate: (v) => {
      const rev = Number(v.rev) || 0;
      const cost = Number(v.cost) || 0;
      if (rev === 0) return { primaryValue: 'Error', primaryLabel: 'Undefined', error: 'Revenue must be > 0.' };
      const profit = rev - cost;
      const margin = (profit / rev) * 100;
      const markup = cost > 0 ? (profit / cost) * 100 : 0;
      return {
        primaryValue: parseFloat(margin.toFixed(2)),
        primaryUnit: '%',
        primaryLabel: 'Profit Margin',
        secondaryOutputs: [
          { label: 'Net Profit ($)', value: `$${profit.toFixed(2)}` },
          { label: 'Equivalent Markup %', value: `${markup.toFixed(2)}%` },
        ],
        steps: [`Profit = $${rev} - $${cost} = $${profit}`, `Margin = ($${profit} / $${rev}) × 100 = ${margin.toFixed(2)}%`],
        formulaUsed: 'Margin = (Gross Profit / Revenue) × 100',
      };
    },
  },
  {
    slug: 'break-even-calculator',
    title: 'Break-Even Calculator',
    category: 'finance',
    formulaDisplay: 'Break-Even Units = Fixed Costs / (Price per Unit - Variable Cost)',
    inputs: [
      { id: 'fixed', label: 'Total Fixed Costs ($)', defaultValue: 24000, type: 'number', step: 1000, unit: '$' },
      { id: 'price', label: 'Sales Price per Unit ($)', defaultValue: 80, type: 'number', min: 0.01, step: 1, unit: '$' },
      { id: 'varCost', label: 'Variable Cost per Unit ($)', defaultValue: 35, type: 'number', min: 0, step: 1, unit: '$' },
    ],
    calculate: (v) => {
      const fixed = Number(v.fixed) || 0;
      const price = Number(v.price) || 0;
      const varCost = Number(v.varCost) || 0;
      const cm = price - varCost;
      if (cm <= 0) return { primaryValue: 'Error', primaryLabel: 'Unprofitable', error: 'Price must exceed variable cost.' };
      const units = Math.ceil(fixed / cm);
      const revenue = units * price;
      const cmRatio = (cm / price) * 100;
      return {
        primaryValue: units,
        primaryUnit: 'units',
        primaryLabel: 'Break-Even Unit Volume',
        secondaryOutputs: [
          { label: 'Break-Even Sales Revenue', value: `$${revenue.toFixed(2)}` },
          { label: 'Contribution Margin per Unit', value: `$${cm.toFixed(2)}` },
          { label: 'Contribution Margin Ratio', value: `${cmRatio.toFixed(1)}%` },
        ],
        steps: [`Unit Contribution Margin = $${price} - $${varCost} = $${cm}`, `Break-Even = $${fixed} / $${cm} = ${units} units`],
        formulaUsed: 'Q_be = FC / (P - VC)',
      };
    },
  },
  {
    slug: 'net-present-value-calculator',
    title: 'NPV (Net Present Value) Calculator',
    category: 'finance',
    formulaDisplay: 'NPV = Σ [CF_t / (1 + r)^t] - Initial Investment',
    inputs: [
      { id: 'initial', label: 'Initial Outlay / Investment ($)', defaultValue: 50000, type: 'number', step: 5000, unit: '$' },
      { id: 'discountRate', label: 'Discount Rate (%)', defaultValue: 10, type: 'number', step: 0.5, unit: '%' },
      { id: 'cashflows', label: 'Annual Cash Flows (comma-separated)', defaultValue: '15000, 20000, 25000, 30000', type: 'text' },
    ],
    calculate: (v) => {
      const initial = Number(v.initial) || 0;
      const r = (Number(v.discountRate) || 0) / 100;
      const cfs = String(v.cashflows || '').split(/[s,]+/).map(Number).filter((n) => !isNaN(n));
      let npv = -initial;
      cfs.forEach((cf, t) => {
        npv += cf / Math.pow(1 + r, t + 1);
      });
      return {
        primaryValue: parseFloat(npv.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: 'Net Present Value (NPV)',
        secondaryOutputs: [
          { label: 'Investment Viability', value: npv > 0 ? 'Accept (Positive NPV)' : 'Reject (Negative NPV)' },
          { label: 'Sum of Undiscounted Cashflows', value: `$${cfs.reduce((a, b) => a + b, 0).toFixed(2)}` },
        ],
        steps: [`Discounted ${cfs.length} cash flows at ${(r * 100).toFixed(1)}% minus initial $${initial}`],
        formulaUsed: 'NPV = Σ CF_t / (1+r)^t - I₀',
      };
    },
  },
  {
    slug: 'future-value-calculator',
    title: 'Future Value (FV) Calculator',
    category: 'finance',
    formulaDisplay: 'FV = PV(1 + r)^n',
    inputs: [
      { id: 'pv', label: 'Present Value (PV)', defaultValue: 10000, type: 'number', step: 500, unit: '$' },
      { id: 'rate', label: 'Interest Rate per Period (%)', defaultValue: 7, type: 'number', step: 0.1, unit: '%' },
      { id: 'periods', label: 'Number of Periods (n)', defaultValue: 10, type: 'number', min: 1, step: 1 },
    ],
    calculate: (v) => {
      const pv = Number(v.pv) || 0;
      const r = (Number(v.rate) || 0) / 100;
      const n = Number(v.periods) || 1;
      const fv = pv * Math.pow(1 + r, n);
      return {
        primaryValue: parseFloat(fv.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: 'Future Value (FV)',
        secondaryOutputs: [
          { label: 'Total Growth ($)', value: `$${(fv - pv).toFixed(2)}` },
          { label: 'Compound Factor', value: parseFloat(Math.pow(1 + r, n).toFixed(4)) },
        ],
        steps: [`FV = $${pv} × (1 + ${r})^${n} = $${fv.toFixed(2)}`],
        formulaUsed: 'FV = PV(1 + r)^n',
      };
    },
  },
  {
    slug: 'present-value-calculator',
    title: 'Present Value (PV) Calculator',
    category: 'finance',
    formulaDisplay: 'PV = FV / (1 + r)^n',
    inputs: [
      { id: 'fv', label: 'Future Value (FV)', defaultValue: 25000, type: 'number', step: 1000, unit: '$' },
      { id: 'rate', label: 'Discount Rate (%)', defaultValue: 6, type: 'number', step: 0.1, unit: '%' },
      { id: 'periods', label: 'Periods (n)', defaultValue: 8, type: 'number', min: 1, step: 1 },
    ],
    calculate: (v) => {
      const fv = Number(v.fv) || 0;
      const r = (Number(v.rate) || 0) / 100;
      const n = Number(v.periods) || 1;
      const pv = fv / Math.pow(1 + r, n);
      return {
        primaryValue: parseFloat(pv.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: 'Present Value (PV)',
        secondaryOutputs: [
          { label: 'Discount Amount ($)', value: `$${(fv - pv).toFixed(2)}` },
          { label: 'Discount Factor', value: parseFloat((1 / Math.pow(1 + r, n)).toFixed(4)) },
        ],
        steps: [`PV = $${fv} / (1 + ${r})^${n} = $${pv.toFixed(2)}`],
        formulaUsed: 'PV = FV / (1 + r)^n',
      };
    },
  },
  {
    slug: 'annuity-calculator',
    title: 'Ordinary Annuity Calculator',
    category: 'finance',
    formulaDisplay: 'FV = PMT · [((1 + r)^n - 1) / r]',
    inputs: [
      { id: 'pmt', label: 'Payment per Period ($)', defaultValue: 1000, type: 'number', step: 100, unit: '$' },
      { id: 'rate', label: 'Periodic Interest Rate (%)', defaultValue: 5, type: 'number', step: 0.1, unit: '%' },
      { id: 'n', label: 'Number of Periods', defaultValue: 10, type: 'number', min: 1, step: 1 },
    ],
    calculate: (v) => {
      const pmt = Number(v.pmt) || 0;
      const r = (Number(v.rate) || 0) / 100;
      const n = Number(v.n) || 1;
      const fv = r > 0 ? pmt * ((Math.pow(1 + r, n) - 1) / r) : pmt * n;
      const pv = r > 0 ? pmt * ((1 - Math.pow(1 + r, -n)) / r) : pmt * n;
      return {
        primaryValue: parseFloat(fv.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: 'Future Value of Annuity',
        secondaryOutputs: [
          { label: 'Present Value of Annuity', value: `$${pv.toFixed(2)}` },
          { label: 'Total Cash Invested', value: `$${(pmt * n).toFixed(2)}` },
        ],
        steps: [`FV = $${pmt} × [((1+${r})^${n} - 1)/${r}] = $${fv.toFixed(2)}`],
        formulaUsed: 'Annuity Cash Flow Equations',
      };
    },
  },
  {
    slug: 'bond-calculator',
    title: 'Bond Price & Yield Calculator',
    category: 'finance',
    formulaDisplay: 'P = Σ [C / (1+y)^t] + [Face / (1+y)^n]',
    inputs: [
      { id: 'face', label: 'Face / Par Value ($)', defaultValue: 1000, type: 'number', step: 100, unit: '$' },
      { id: 'couponRate', label: 'Annual Coupon Rate (%)', defaultValue: 5, type: 'number', step: 0.1, unit: '%' },
      { id: 'ytm', label: 'Yield to Maturity (YTM %)', defaultValue: 4.5, type: 'number', step: 0.1, unit: '%' },
      { id: 'years', label: 'Years to Maturity', defaultValue: 10, type: 'number', step: 1, unit: 'years' },
    ],
    calculate: (v) => {
      const face = Number(v.face) || 1000;
      const cRate = (Number(v.couponRate) || 0) / 100;
      const ytm = (Number(v.ytm) || 0) / 100 / 2; // semiannual
      const n = (Number(v.years) || 1) * 2;
      const c = (face * cRate) / 2;
      let price = 0;
      for (let t = 1; t <= n; t++) {
        price += c / Math.pow(1 + ytm, t);
      }
      price += face / Math.pow(1 + ytm, n);
      return {
        primaryValue: parseFloat(price.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: 'Bond Current Fair Price',
        secondaryOutputs: [
          { label: 'Annual Coupon Payment', value: `$${(face * cRate).toFixed(2)}` },
          { label: 'Status', value: price > face ? 'Trading at Premium' : (price < face ? 'Trading at Discount' : 'At Par') },
        ],
        steps: [`Discounted ${n} semi-annual coupon payments of $${c} plus face value return.`],
        formulaUsed: 'Bond Valuation Present Value',
      };
    },
  },
  {
    slug: 'stock-return-calculator',
    title: 'Stock Return Calculator',
    category: 'finance',
    formulaDisplay: 'Total Return = (Ending Price - Buy Price + Dividends) / Buy Price',
    inputs: [
      { id: 'buyPrice', label: 'Buy Price ($)', defaultValue: 150, type: 'number', step: 5, unit: '$' },
      { id: 'sellPrice', label: 'Sell / Current Price ($)', defaultValue: 210, type: 'number', step: 5, unit: '$' },
      { id: 'shares', label: 'Number of Shares', defaultValue: 50, type: 'number', step: 1 },
      { id: 'divs', label: 'Total Dividends Received per Share ($)', defaultValue: 6.5, type: 'number', step: 0.5, unit: '$' },
    ],
    calculate: (v) => {
      const buy = Number(v.buyPrice) || 1;
      const sell = Number(v.sellPrice) || 0;
      const shares = Number(v.shares) || 1;
      const divPerShare = Number(v.divs) || 0;
      const totalCost = buy * shares;
      const capitalGains = (sell - buy) * shares;
      const totalDivs = divPerShare * shares;
      const totalGain = capitalGains + totalDivs;
      const returnPct = (totalGain / totalCost) * 100;
      return {
        primaryValue: parseFloat(returnPct.toFixed(2)),
        primaryUnit: '%',
        primaryLabel: 'Total Return',
        secondaryOutputs: [
          { label: 'Total Net Profit ($)', value: `$${totalGain.toFixed(2)}` },
          { label: 'Capital Gain ($)', value: `$${capitalGains.toFixed(2)}` },
          { label: 'Dividends Income ($)', value: `$${totalDivs.toFixed(2)}` },
        ],
        steps: [`Total Gain = Capital Gain ($${capitalGains}) + Dividends ($${totalDivs}) = $${totalGain}`, `Return % = ($${totalGain} / $${totalCost}) × 100`],
        formulaUsed: 'Total Shareholder Return (TSR)',
      };
    },
  },
  {
    slug: 'dividend-calculator',
    title: 'Dividend Yield & Income Calculator',
    category: 'finance',
    formulaDisplay: 'Yield = Annual Dividend / Stock Price',
    inputs: [
      { id: 'price', label: 'Stock Price ($)', defaultValue: 80, type: 'number', step: 1, unit: '$' },
      { id: 'annualDiv', label: 'Annual Dividend per Share ($)', defaultValue: 3.2, type: 'number', step: 0.1, unit: '$' },
      { id: 'shares', label: 'Total Shares Owned', defaultValue: 250, type: 'number', step: 10 },
    ],
    calculate: (v) => {
      const p = Number(v.price) || 1;
      const div = Number(v.annualDiv) || 0;
      const shares = Number(v.shares) || 0;
      const yieldPct = (div / p) * 100;
      const annualIncome = div * shares;
      const monthlyIncome = annualIncome / 12;
      return {
        primaryValue: parseFloat(yieldPct.toFixed(2)),
        primaryUnit: '%',
        primaryLabel: 'Dividend Yield',
        secondaryOutputs: [
          { label: 'Annual Dividend Income', value: `$${annualIncome.toFixed(2)}` },
          { label: 'Monthly Equivalent', value: `$${monthlyIncome.toFixed(2)}` },
          { label: 'Total Portfolio Investment', value: `$${(p * shares).toFixed(2)}` },
        ],
        steps: [`Yield = ($${div} / $${p}) × 100 = ${yieldPct.toFixed(2)}%`, `Annual Income = ${shares} shares × $${div} = $${annualIncome.toFixed(2)}`],
        formulaUsed: 'Dividend Yield = DPS / Price',
      };
    },
  },
  {
    slug: 'inflation-calculator',
    title: 'Inflation & Purchasing Power Calculator',
    category: 'finance',
    formulaDisplay: 'Future Cost = Cost × (1 + i)^t',
    inputs: [
      { id: 'amount', label: 'Current Amount ($)', defaultValue: 1000, type: 'number', step: 100, unit: '$' },
      { id: 'inflationRate', label: 'Average Annual Inflation (%)', defaultValue: 3.2, type: 'number', step: 0.1, unit: '%' },
      { id: 'years', label: 'Years into Future', defaultValue: 20, type: 'number', min: 1, step: 1, unit: 'years' },
    ],
    calculate: (v) => {
      const amt = Number(v.amount) || 0;
      const i = (Number(v.inflationRate) || 0) / 100;
      const t = Number(v.years) || 1;
      const futureCost = amt * Math.pow(1 + i, t);
      const futurePurchasingPower = amt / Math.pow(1 + i, t);
      return {
        primaryValue: parseFloat(futureCost.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: 'Future Cost Equivalent',
        secondaryOutputs: [
          { label: 'Future Purchasing Power of Today\'s $' + amt, value: `$${futurePurchasingPower.toFixed(2)}` },
          { label: 'Cumulative Price Increase', value: `${((Math.pow(1 + i, t) - 1) * 100).toFixed(1)}%` },
        ],
        steps: [`Cost multiplied by (1 + ${i})^${t} = ${Math.pow(1 + i, t).toFixed(4)}`],
        formulaUsed: 'Compound Price Inflation Index',
      };
    },
  },
  {
    slug: 'currency-converter',
    title: 'Currency Converter',
    category: 'finance',
    formulaDisplay: 'Converted = Amount × Exchange Rate',
    inputs: [
      { id: 'amount', label: 'Amount', defaultValue: 100, type: 'number', step: 10 },
      { id: 'rate', label: 'Exchange Rate (USD to Target)', defaultValue: 0.92, type: 'number', step: 0.001 },
      { id: 'symbol', label: 'Target Currency Code', defaultValue: 'EUR', type: 'text' },
    ],
    calculate: (v) => {
      const amt = Number(v.amount) || 0;
      const r = Number(v.rate) || 1;
      const sym = String(v.symbol || 'EUR').toUpperCase();
      const res = amt * r;
      return {
        primaryValue: parseFloat(res.toFixed(2)),
        primaryUnit: sym,
        primaryLabel: 'Converted Currency Value',
        secondaryOutputs: [
          { label: 'Inverse Rate (1 ' + sym + ' = USD)', value: parseFloat((1 / r).toFixed(4)) },
        ],
        steps: [`${amt} × ${r} = ${res.toFixed(2)} ${sym}`],
        formulaUsed: 'Foreign Exchange Rate Conversion',
      };
    },
  },
  {
    slug: 'exchange-rate-calculator',
    title: 'Exchange Rate Cross-Rate Calculator',
    category: 'finance',
    formulaDisplay: 'Base / Quote Cross Rate',
    inputs: [
      { id: 'amt', label: 'Base Currency Units', defaultValue: 500, type: 'number', step: 50 },
      { id: 'rate', label: 'Exchange Cross Rate', defaultValue: 1.28, type: 'number', step: 0.01 },
    ],
    calculate: (v) => {
      const amt = Number(v.amt) || 0;
      const rate = Number(v.rate) || 1;
      const converted = amt * rate;
      return {
        primaryValue: parseFloat(converted.toFixed(2)),
        primaryLabel: 'Target Converted Total',
        secondaryOutputs: [
          { label: 'Inverse Rate', value: (1 / rate).toFixed(4) },
        ],
        steps: [`${amt} × ${rate} = ${converted.toFixed(2)}`],
        formulaUsed: 'Cross Exchange Ratio',
      };
    },
  },
  {
    slug: 'budget-calculator',
    title: '50/30/20 Budgeting Rule Calculator',
    category: 'finance',
    formulaDisplay: 'Needs (50%), Wants (30%), Savings (20%)',
    inputs: [
      { id: 'netIncome', label: 'Monthly Take-Home Pay ($)', defaultValue: 5000, type: 'number', step: 100, unit: '$' },
    ],
    calculate: (v) => {
      const income = Number(v.netIncome) || 0;
      const needs = income * 0.5;
      const wants = income * 0.3;
      const savings = income * 0.2;
      return {
        primaryValue: `Needs: $${needs}, Wants: $${wants}, Savings: $${savings}`,
        primaryLabel: '50/30/20 Allocation',
        secondaryOutputs: [
          { label: '50% Essential Needs (Housing, Food, Utilities)', value: `$${needs.toFixed(2)}` },
          { label: '30% Lifestyle & Wants (Dining, Travel)', value: `$${wants.toFixed(2)}` },
          { label: '20% Savings & Debt Paydown', value: `$${savings.toFixed(2)}` },
        ],
        steps: [`Needs: $${income} × 50% = $${needs}`, `Wants: $${income} × 30% = $${wants}`, `Savings: $${income} × 20% = $${savings}`],
        formulaUsed: 'Warren-Tyagi 50/30/20 Budgeting Rule',
      };
    },
  },
  {
    slug: 'debt-payoff-calculator',
    title: 'Debt Payoff Acceleration Calculator',
    category: 'finance',
    formulaDisplay: 'Months to Freedom with Extra Principal',
    inputs: [
      { id: 'balance', label: 'Total Outstanding Debt ($)', defaultValue: 18000, type: 'number', step: 500, unit: '$' },
      { id: 'apr', label: 'Average APR (%)', defaultValue: 18.9, type: 'number', step: 0.5, unit: '%' },
      { id: 'minPayment', label: 'Minimum Monthly Payment ($)', defaultValue: 450, type: 'number', step: 50, unit: '$' },
      { id: 'extraPayment', label: 'Extra Monthly Payment ($)', defaultValue: 200, type: 'number', step: 50, unit: '$' },
    ],
    calculate: (v) => {
      const bal = Math.max(0, Number(v.balance) || 0);
      const aprVal = Math.max(0, Number(v.apr) || 0);
      const r = aprVal / 100 / 12;
      const minP = Math.max(0, Number(v.minPayment) || 0);
      const extra = Math.max(0, Number(v.extraPayment) || 0);
      const totalP = minP + extra;

      if (bal === 0) {
        return {
          primaryValue: 0,
          primaryUnit: 'months',
          primaryLabel: 'Debt-Free (Zero Balance)',
          secondaryOutputs: [
            { label: 'Years to Payoff', value: '0 years' },
            { label: 'Total Interest Due', value: '$0.00' }
          ],
          steps: ['Outstanding debt balance is $0; account is already completely debt-free.']
        };
      }

      if (totalP <= 0) {
        return {
          primaryValue: 0,
          primaryUnit: 'months',
          primaryLabel: 'No Payment Specified',
          secondaryOutputs: [
            { label: 'Status', value: 'Requires monthly payment > $0' }
          ],
          steps: ['Please enter a monthly payment amount greater than $0 to calculate payoff duration.']
        };
      }

      if (r === 0) {
        const nAcc = Math.ceil(bal / totalP);
        const nMin = minP > 0 ? Math.ceil(bal / minP) : nAcc;
        const monthsSaved = Math.max(0, nMin - nAcc);
        return {
          primaryValue: nAcc,
          primaryUnit: 'months',
          primaryLabel: 'Months to Debt-Free (0% APR)',
          secondaryOutputs: [
            { label: 'Years to Payoff', value: (nAcc / 12).toFixed(1) + ' years' },
            { label: 'Months Saved by Extra Payments', value: monthsSaved + ' months' },
            { label: 'Total Interest Paid', value: '$0.00' }
          ],
          steps: [
            `At 0% APR: Payoff Months = Balance ($${bal}) ÷ Monthly Payment ($${totalP}) = ${nAcc} months`,
            `Extra payment of $${extra}/mo saves ${monthsSaved} months.`
          ]
        };
      }

      const monthlyInterest = bal * r;
      if (monthlyInterest >= totalP) {
        return {
          primaryValue: 'Payment too low',
          primaryUnit: 'Warning',
          primaryLabel: 'Infinite Debt (Negative Amortization)',
          secondaryOutputs: [
            { label: 'Monthly Interest Accruing', value: `$${monthlyInterest.toFixed(2)}` },
            { label: 'Total Payment Provided', value: `$${totalP.toFixed(2)}` },
            { label: 'Minimum Required to Amortize', value: `> $${monthlyInterest.toFixed(2)}/mo` }
          ],
          steps: [
            `Monthly interest alone is $${monthlyInterest.toFixed(2)} ($${bal} × ${(r * 100).toFixed(2)}%).`,
            `Your payment of $${totalP} does not cover monthly interest, causing debt to grow indefinitely.`
          ]
        };
      }

      const nMin = minP > monthlyInterest
        ? Math.log(minP / (minP - monthlyInterest)) / Math.log(1 + r)
        : 9999;
      const nAccelerated = Math.log(totalP / (totalP - monthlyInterest)) / Math.log(1 + r);
      const monthsSaved = Math.max(0, Math.ceil(nMin) - Math.ceil(nAccelerated));

      return {
        primaryValue: Math.ceil(nAccelerated),
        primaryUnit: 'months',
        primaryLabel: 'Months to Debt-Free (Accelerated)',
        secondaryOutputs: [
          { label: 'Years to Payoff', value: (nAccelerated / 12).toFixed(1) + ' years' },
          { label: 'Months Saved by Extra Payments', value: monthsSaved + ' months' },
          { label: 'Monthly Interest Charge', value: `$${monthlyInterest.toFixed(2)}` }
        ],
        steps: [
          `Formula: N = -ln(1 - (Balance × r) / Payment) / ln(1 + r)`,
          `At $${totalP}/month, debt is eliminated in ${Math.ceil(nAccelerated)} months (${(nAccelerated / 12).toFixed(1)} years).`,
          `Extra $${extra}/mo payment saves ${monthsSaved} months.`
        ],
        formulaUsed: 'Debt Amortization with Extra Principal'
      };
    },
  },
  {
    slug: 'credit-card-payoff-calculator',
    title: 'Credit Card Payoff Calculator',
    category: 'finance',
    formulaDisplay: 'n = -ln(1 - (r·P / PMT)) / ln(1 + r)',
    inputs: [
      { id: 'balance', label: 'Credit Card Balance ($)', defaultValue: 6500, type: 'number', step: 100, unit: '$' },
      { id: 'apr', label: 'Annual APR (%)', defaultValue: 22.4, type: 'number', step: 0.1, unit: '%' },
      { id: 'monthly', label: 'Monthly Payment ($)', defaultValue: 250, type: 'number', step: 25, unit: '$' },
    ],
    calculate: (v) => {
      const p = Number(v.balance) || 0;
      const r = (Number(v.apr) || 0) / 100 / 12;
      const pmt = Number(v.monthly) || 0;
      if (p * r >= pmt) return { primaryValue: 'Negative Amortization', primaryLabel: 'Interest exceeds payment', error: 'Payment must be > $' + (p * r).toFixed(2) };
      const n = -Math.log(1 - (r * p) / pmt) / Math.log(1 + r);
      const months = Math.ceil(n);
      const totalPaid = pmt * months;
      const interest = totalPaid - p;
      return {
        primaryValue: months,
        primaryUnit: 'months',
        primaryLabel: 'Payoff Time',
        secondaryOutputs: [
          { label: 'Total Interest Paid', value: `$${interest.toFixed(2)}` },
          { label: 'Total Out-of-Pocket Cost', value: `$${totalPaid.toFixed(2)}` },
        ],
        steps: [`At $${pmt}/mo, debt cleared in ${months} months (${(months / 12).toFixed(1)} years).`],
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
      { id: 'vehiclePrice', label: 'Vehicle Purchase Price ($)', defaultValue: 32000, type: 'number', step: 1000, unit: '$' },
      { id: 'downPayment', label: 'Down Payment & Trade-In ($)', defaultValue: 6000, type: 'number', step: 500, unit: '$' },
      { id: 'apr', label: 'Interest Rate (%)', defaultValue: 5.9, type: 'number', step: 0.1, unit: '%' },
      { id: 'termMonths', label: 'Loan Term (Months)', defaultValue: 60, type: 'number', step: 12, unit: 'mo' },
    ],
    calculate: (v) => {
      const price = Number(v.vehiclePrice) || 0;
      const down = Number(v.downPayment) || 0;
      const loan = Math.max(0, price - down);
      const apr = Number(v.apr) || 0;
      const months = Number(v.termMonths) || 60;
      const res = calculatePMT(loan, apr, months / 12, 12);
      return {
        primaryValue: parseFloat(res.pmt.toFixed(2)),
        primaryUnit: '$ / mo',
        primaryLabel: 'Estimated Auto Payment',
        secondaryOutputs: [
          { label: 'Amount Financed', value: `$${loan.toFixed(2)}` },
          { label: 'Total Interest Paid', value: `$${res.totalInterest.toFixed(2)}` },
          { label: 'Total Loan Cost', value: `$${res.totalPayment.toFixed(2)}` },
        ],
        steps: [`Financing $${loan} over ${months} months at ${apr}% APR.`],
        formulaUsed: 'Vehicle Loan Amortization',
      };
    },
  },
  {
    slug: 'apr-to-apy-converter',
    title: 'APR to APY Converter',
    category: 'finance',
    formulaDisplay: 'APY = (1 + APR / n)^n - 1',
    inputs: [
      { id: 'apr', label: 'Nominal APR (%)', defaultValue: 5.0, type: 'number', step: 0.1, unit: '%' },
      {
        id: 'compounding',
        label: 'Compounding Frequency',
        type: 'select',
        defaultValue: '12',
        options: [
          { label: 'Daily (365 times/year)', value: '365' },
          { label: 'Monthly (12 times/year)', value: '12' },
          { label: 'Quarterly (4 times/year)', value: '4' },
          { label: 'Semi-Annually (2 times/year)', value: '2' },
        ],
      },
    ],
    calculate: (v) => {
      const apr = (Number(v.apr) || 0) / 100;
      const n = Number(v.compounding) || 12;
      const apy = (Math.pow(1 + apr / n, n) - 1) * 100;
      return {
        primaryValue: parseFloat(apy.toFixed(4)),
        primaryUnit: '%',
        primaryLabel: 'Effective Annual Yield (APY)',
        secondaryOutputs: [
          { label: 'Nominal APR', value: `${(apr * 100).toFixed(2)}%` },
          { label: 'Compound Periods per Year', value: n },
        ],
        steps: [`APY = (1 + ${apr} / ${n})^${n} - 1 = ${apy.toFixed(4)}%`],
        formulaUsed: 'APY = (1 + r/n)^n - 1',
      };
    },
  },
  {
    slug: 'amortization-calculator',
    title: 'Loan Amortization Breakdown Calculator',
    category: 'finance',
    formulaDisplay: 'Principal and Interest Breakdown per Period',
    inputs: [
      { id: 'p', label: 'Principal Amount ($)', defaultValue: 100000, type: 'number', step: 5000, unit: '$' },
      { id: 'rate', label: 'Annual Rate (%)', defaultValue: 6.0, type: 'number', step: 0.1, unit: '%' },
      { id: 'years', label: 'Loan Term (Years)', defaultValue: 15, type: 'number', step: 1, unit: 'years' },
    ],
    calculate: (v) => {
      const p = Number(v.p) || 0;
      const r = Number(v.rate) || 0;
      const t = Number(v.years) || 15;
      const res = calculatePMT(p, r, t, 12);
      const firstMonthInterest = (p * (r / 100)) / 12;
      const firstMonthPrincipal = res.pmt - firstMonthInterest;
      return {
        primaryValue: parseFloat(res.pmt.toFixed(2)),
        primaryUnit: '$ / mo',
        primaryLabel: 'Monthly Amortized Payment',
        secondaryOutputs: [
          { label: 'Month 1 Principal Portion', value: `$${firstMonthPrincipal.toFixed(2)}` },
          { label: 'Month 1 Interest Portion', value: `$${firstMonthInterest.toFixed(2)}` },
          { label: 'Total Lifetime Interest', value: `$${res.totalInterest.toFixed(2)}` },
        ],
        steps: [`Total of ${t * 12} level payments.`],
        formulaUsed: 'Standard Amortization Schedule Formula',
      };
    },
  },
  {
    slug: 'down-payment-calculator',
    title: 'Down Payment Savings Calculator',
    category: 'finance',
    formulaDisplay: 'Target = Home Price × Down Payment %',
    inputs: [
      { id: 'price', label: 'Target Home Price ($)', defaultValue: 450000, type: 'number', step: 10000, unit: '$' },
      { id: 'pct', label: 'Target Down Payment (%)', defaultValue: 20, type: 'number', step: 1, unit: '%' },
      { id: 'current', label: 'Current Savings ($)', defaultValue: 25000, type: 'number', step: 2500, unit: '$' },
      { id: 'monthly', label: 'Monthly Savings Rate ($)', defaultValue: 1200, type: 'number', step: 100, unit: '$' },
    ],
    calculate: (v) => {
      const price = Number(v.price) || 0;
      const pct = (Number(v.pct) || 20) / 100;
      const target = price * pct;
      const current = Number(v.current) || 0;
      const monthly = Number(v.monthly) || 1;
      const remaining = Math.max(0, target - current);
      const months = Math.ceil(remaining / monthly);
      return {
        primaryValue: parseFloat(target.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: 'Total Down Payment Needed',
        secondaryOutputs: [
          { label: 'Remaining Savings Needed', value: `$${remaining.toFixed(2)}` },
          { label: 'Months to Reach Goal', value: `${months} months (${(months / 12).toFixed(1)} years)` },
        ],
        steps: [`Down payment target = $${price} × ${pct * 100}% = $${target}`],
        formulaUsed: 'Target = Purchase Price × Target Ratio',
      };
    },
  },
  {
    slug: 'home-equity-calculator',
    title: 'Home Equity & LTV Calculator',
    category: 'finance',
    formulaDisplay: 'Equity = Market Value - Mortgage Balance',
    inputs: [
      { id: 'marketVal', label: 'Current Home Market Value ($)', defaultValue: 520000, type: 'number', step: 10000, unit: '$' },
      { id: 'loanBal', label: 'Remaining Mortgage Balance ($)', defaultValue: 310000, type: 'number', step: 5000, unit: '$' },
    ],
    calculate: (v) => {
      const val = Number(v.marketVal) || 0;
      const bal = Number(v.loanBal) || 0;
      const equity = Math.max(0, val - bal);
      const ltv = val > 0 ? (bal / val) * 100 : 0;
      const maxHeloc = val * 0.8 - bal; // 80% LTV HELOC limit
      return {
        primaryValue: parseFloat(equity.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: 'Total Home Equity',
        secondaryOutputs: [
          { label: 'Loan-to-Value (LTV)', value: `${ltv.toFixed(1)}%` },
          { label: 'Equity Ownership %', value: `${(100 - ltv).toFixed(1)}%` },
          { label: 'Max Borrowable at 80% LTV (HELOC)', value: `$${Math.max(0, maxHeloc).toFixed(2)}` },
        ],
        steps: [`Equity = $${val} - $${bal} = $${equity}`],
        formulaUsed: 'Equity = Valuation - Debt Liabilities',
      };
    },
  },
  {
    slug: 'refinance-calculator',
    title: 'Mortgage Refinance Break-Even Calculator',
    category: 'finance',
    formulaDisplay: 'Break-Even Months = Closing Costs / Monthly Savings',
    inputs: [
      { id: 'balance', label: 'Current Loan Balance ($)', defaultValue: 350000, type: 'number', step: 5000, unit: '$' },
      { id: 'currRate', label: 'Current Interest Rate (%)', defaultValue: 7.25, type: 'number', step: 0.1, unit: '%' },
      { id: 'newRate', label: 'New Refinance Rate (%)', defaultValue: 5.75, type: 'number', step: 0.1, unit: '%' },
      { id: 'closingCosts', label: 'Refinance Closing Costs ($)', defaultValue: 5500, type: 'number', step: 250, unit: '$' },
      { id: 'term', label: 'Term (Years)', defaultValue: 30, type: 'number', step: 5, unit: 'years' },
    ],
    calculate: (v) => {
      const b = Number(v.balance) || 0;
      const rOld = Number(v.currRate) || 0;
      const rNew = Number(v.newRate) || 0;
      const costs = Number(v.closingCosts) || 0;
      const term = Number(v.term) || 30;
      const oldPmt = calculatePMT(b, rOld, term, 12).pmt;
      const newPmt = calculatePMT(b, rNew, term, 12).pmt;
      const savings = oldPmt - newPmt;
      const breakEvenMonths = savings > 0 ? Math.ceil(costs / savings) : 0;
      return {
        primaryValue: parseFloat(savings.toFixed(2)),
        primaryUnit: '$ / mo',
        primaryLabel: 'Monthly Payment Savings',
        secondaryOutputs: [
          { label: 'Break-Even Horizon', value: savings > 0 ? `${breakEvenMonths} months (${(breakEvenMonths / 12).toFixed(1)} yrs)` : 'No Savings' },
          { label: 'Old Payment', value: `$${oldPmt.toFixed(2)}` },
          { label: 'New Payment', value: `$${newPmt.toFixed(2)}` },
        ],
        steps: [`Monthly payment drops from $${oldPmt.toFixed(2)} to $${newPmt.toFixed(2)}`, `Break-even = $${costs} / $${savings.toFixed(2)} = ${breakEvenMonths} months`],
        formulaUsed: 'Refinance Delta and Payback Period',
      };
    },
  },

  // INVESTMENT & SAVINGS
  {
    slug: '401k-calculator',
    title: '401(k) Retirement Calculator with Employer Match',
    category: 'investment-savings',
    formulaDisplay: 'Future Value with Employer Matching & Salary Growth',
    inputs: [
      { id: 'salary', label: 'Annual Salary ($)', defaultValue: 85000, type: 'number', step: 2500, unit: '$' },
      { id: 'contribPct', label: 'Your Contribution (%)', defaultValue: 8, type: 'number', step: 1, unit: '%' },
      { id: 'matchPct', label: 'Employer Match Rate (%)', defaultValue: 50, type: 'number', step: 5, unit: '%' },
      { id: 'matchLimit', label: 'Employer Match Cap on Salary (%)', defaultValue: 6, type: 'number', step: 1, unit: '%' },
      { id: 'currentBal', label: 'Current 401(k) Balance ($)', defaultValue: 45000, type: 'number', step: 5000, unit: '$' },
      { id: 'years', label: 'Years to Retirement', defaultValue: 25, type: 'number', step: 1, unit: 'years' },
      { id: 'returnRate', label: 'Assumed Annual Return (%)', defaultValue: 7.5, type: 'number', step: 0.5, unit: '%' },
    ],
    calculate: (v) => {
      const sal = Number(v.salary) || 0;
      const userPct = (Number(v.contribPct) || 0) / 100;
      const matchRate = (Number(v.matchPct) || 0) / 100;
      const matchCap = (Number(v.matchLimit) || 0) / 100;
      const r = (Number(v.returnRate) || 0) / 100;
      const years = Number(v.years) || 1;
      let bal = Number(v.currentBal) || 0;
      const userAnnual = sal * userPct;
      const matchAnnual = sal * Math.min(userPct, matchCap) * matchRate;
      const totalAnnual = userAnnual + matchAnnual;
      for (let i = 0; i < years; i++) {
        bal = (bal + totalAnnual) * (1 + r);
      }
      return {
        primaryValue: parseFloat(bal.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: 'Estimated 401(k) Balance at Retirement',
        secondaryOutputs: [
          { label: 'Annual Employee Contribution', value: `$${userAnnual.toFixed(2)}` },
          { label: 'Annual Employer Match (Free Money)', value: `$${matchAnnual.toFixed(2)}` },
          { label: 'Total Annual Addition', value: `$${totalAnnual.toFixed(2)}` },
        ],
        steps: [`Compound growth calculated over ${years} years with $${matchAnnual.toFixed(2)} annual employer match.`],
        formulaUsed: '401(k) Match & Compounding Horizon',
      };
    },
  },
  {
    slug: 'roth-ira-calculator',
    title: 'Roth IRA Tax-Free Growth Calculator',
    category: 'investment-savings',
    formulaDisplay: 'FV = PMT · [((1+r)^t - 1) / r] (100% Tax-Free Qualified Distributions)',
    inputs: [
      { id: 'annualDeposit', label: 'Annual Contribution ($)', defaultValue: 7000, type: 'number', max: 8000, step: 500, unit: '$' },
      { id: 'currentBal', label: 'Current Roth IRA Balance ($)', defaultValue: 12000, type: 'number', step: 1000, unit: '$' },
      { id: 'years', label: 'Years to Grow', defaultValue: 30, type: 'number', step: 1, unit: 'years' },
      { id: 'returnRate', label: 'Expected Annual Return (%)', defaultValue: 8, type: 'number', step: 0.5, unit: '%' },
    ],
    calculate: (v) => {
      const pmt = Number(v.annualDeposit) || 0;
      let bal = Number(v.currentBal) || 0;
      const t = Number(v.years) || 1;
      const r = (Number(v.returnRate) || 0) / 100;
      for (let i = 0; i < t; i++) {
        bal = (bal + pmt) * (1 + r);
      }
      const totalContributed = Number(v.currentBal) + pmt * t;
      const taxFreeGain = bal - totalContributed;
      return {
        primaryValue: parseFloat(bal.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: 'Tax-Free Roth IRA Portfolio',
        secondaryOutputs: [
          { label: 'Tax-Free Capital Gains', value: `$${taxFreeGain.toFixed(2)}` },
          { label: 'Total Contributions', value: `$${totalContributed.toFixed(2)}` },
        ],
        steps: [`$${pmt}/year compounded tax-free for ${t} years at ${(r * 100).toFixed(1)}%.`],
        formulaUsed: 'Roth IRA Compound Tax-Exempt Equation',
      };
    },
  },
  {
    slug: 'hysa-calculator',
    title: 'HYSA (High-Yield Savings Account) Calculator',
    category: 'investment-savings',
    formulaDisplay: 'A = P(1 + r/365)^(365·t)',
    inputs: [
      { id: 'p', label: 'Deposit Principal ($)', defaultValue: 20000, type: 'number', step: 1000, unit: '$' },
      { id: 'apy', label: 'Annual Percentage Yield (APY %)', defaultValue: 4.75, type: 'number', step: 0.05, unit: '%' },
      { id: 'years', label: 'Duration (Years)', defaultValue: 3, type: 'number', step: 0.5, unit: 'years' },
    ],
    calculate: (v) => {
      const p = Number(v.p) || 0;
      const apy = (Number(v.apy) || 0) / 100;
      const t = Number(v.years) || 1;
      const finalBal = p * Math.pow(1 + apy, t);
      const interest = finalBal - p;
      return {
        primaryValue: parseFloat(finalBal.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: 'Final HYSA Balance',
        secondaryOutputs: [
          { label: 'Total Interest Earned', value: `$${interest.toFixed(2)}` },
          { label: 'First Year Interest', value: `$${(p * apy).toFixed(2)}` },
        ],
        steps: [`Balance = $${p} × (1 + ${apy})^${t} = $${finalBal.toFixed(2)}`],
        formulaUsed: 'Daily Compound APY Yield',
      };
    },
  },
  {
    slug: 'cd-ladder-calculator',
    title: 'CD Ladder Strategy Calculator',
    category: 'investment-savings',
    formulaDisplay: 'Equal tranche allocation across staggered maturity horizons',
    inputs: [
      { id: 'totalCapital', label: 'Total Investment Capital ($)', defaultValue: 25000, type: 'number', step: 2500, unit: '$' },
      { id: 'avgApy', label: 'Average CD APY (%)', defaultValue: 4.8, type: 'number', step: 0.1, unit: '%' },
      { id: 'tranches', label: 'Number of CD Rungs', defaultValue: 5, type: 'number', min: 2, max: 10, step: 1 },
    ],
    calculate: (v) => {
      const total = Number(v.totalCapital) || 0;
      const apy = (Number(v.avgApy) || 0) / 100;
      const rungs = Number(v.tranches) || 5;
      const perRung = total / rungs;
      const annualIncome = total * apy;
      return {
        primaryValue: parseFloat(annualIncome.toFixed(2)),
        primaryUnit: '$ / year',
        primaryLabel: 'Annual Interest Income',
        secondaryOutputs: [
          { label: 'Capital per Rung', value: `$${perRung.toFixed(2)}` },
          { label: 'Maturity Liquidity Flow', value: `$${perRung.toFixed(2)} every ${(12 / rungs).toFixed(0)} months` },
        ],
        steps: [`Allocated $${total} across ${rungs} staggered maturities generating continuous liquidity.`],
        formulaUsed: 'Staggered Fixed-Income CD Laddering',
      };
    },
  },
  {
    slug: 'crypto-profit-calculator',
    title: 'Crypto Profit & ROI Calculator',
    category: 'investment-savings',
    formulaDisplay: 'Profit = (Sell Price - Buy Price) × Coins - Fees',
    inputs: [
      { id: 'buyPrice', label: 'Buy Price per Coin ($)', defaultValue: 45000, type: 'number', step: 500, unit: '$' },
      { id: 'sellPrice', label: 'Sell Price per Coin ($)', defaultValue: 68000, type: 'number', step: 500, unit: '$' },
      { id: 'coins', label: 'Coins Quantity', defaultValue: 0.5, type: 'number', step: 0.05 },
      { id: 'feePct', label: 'Exchange Trading Fee (%)', defaultValue: 0.2, type: 'number', step: 0.05, unit: '%' },
    ],
    calculate: (v) => {
      const buyP = Number(v.buyPrice) || 0;
      const sellP = Number(v.sellPrice) || 0;
      const coins = Number(v.coins) || 0;
      const fee = (Number(v.feePct) || 0) / 100;
      const grossBuy = buyP * coins;
      const grossSell = sellP * coins;
      const totalFees = (grossBuy + grossSell) * fee;
      const netProfit = grossSell - grossBuy - totalFees;
      const roi = grossBuy > 0 ? (netProfit / grossBuy) * 100 : 0;
      return {
        primaryValue: parseFloat(netProfit.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: 'Net Profit After Fees',
        secondaryOutputs: [
          { label: 'Return on Investment (ROI)', value: `${roi.toFixed(2)}%` },
          { label: 'Total Transaction Fees', value: `$${totalFees.toFixed(2)}` },
          { label: 'Total Exit Value', value: `$${grossSell.toFixed(2)}` },
        ],
        steps: [`Gross Proceeds = $${grossSell.toFixed(2)}`, `Fees Paid = $${totalFees.toFixed(2)}`, `Net Profit = $${netProfit.toFixed(2)}`],
        formulaUsed: 'Cryptocurrency Net Yield Formula',
      };
    },
  },
  {
    slug: 'dca-calculator',
    title: 'Dollar Cost Averaging (DCA) Calculator',
    category: 'investment-savings',
    formulaDisplay: 'Average Cost per Unit = Total Invested / Total Units Purchased',
    inputs: [
      { id: 'monthly', label: 'Monthly Recurring Investment ($)', defaultValue: 500, type: 'number', step: 50, unit: '$' },
      { id: 'months', label: 'Total Duration (Months)', defaultValue: 36, type: 'number', step: 6, unit: 'mo' },
      { id: 'expectedCagr', label: 'Expected Asset CAGR (%)', defaultValue: 10, type: 'number', step: 0.5, unit: '%' },
    ],
    calculate: (v) => {
      const m = Number(v.monthly) || 0;
      const months = Number(v.months) || 12;
      const r = (Number(v.expectedCagr) || 0) / 100 / 12;
      let bal = 0;
      for (let i = 0; i < months; i++) {
        bal = (bal + m) * (1 + r);
      }
      const invested = m * months;
      return {
        primaryValue: parseFloat(bal.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: 'Estimated Portfolio Value',
        secondaryOutputs: [
          { label: 'Total Capital Invested', value: `$${invested.toFixed(2)}` },
          { label: 'Total Gains', value: `$${(bal - invested).toFixed(2)}` },
        ],
        steps: [`DCA investment disciplined across ${months} months smoothing entry volatility.`],
        formulaUsed: 'DCA Compounding Accumulation',
      };
    },
  },
  {
    slug: 'fire-calculator',
    title: 'FIRE (Financial Independence, Retire Early) Calculator',
    category: 'investment-savings',
    formulaDisplay: 'FIRE Number = Annual Spending ÷ SWR',
    inputs: [
      { id: 'annualExpenses', label: 'Annual Living Expenses ($)', defaultValue: 50000, type: 'number', step: 2500, unit: '$' },
      { id: 'swr', label: 'Safe Withdrawal Rate (%)', defaultValue: 4.0, type: 'number', step: 0.25, unit: '%' },
      { id: 'netWorth', label: 'Current Invested Net Worth ($)', defaultValue: 120000, type: 'number', step: 10000, unit: '$' },
      { id: 'annualSavings', label: 'Annual Savings Capacity ($)', defaultValue: 25000, type: 'number', step: 1000, unit: '$' },
      { id: 'growthRate', label: 'Real Portfolio Return (%)', defaultValue: 6.0, type: 'number', step: 0.5, unit: '%' },
    ],
    calculate: (v) => {
      const exp = Number(v.annualExpenses) || 50000;
      const swr = (Number(v.swr) || 4.0) / 100;
      const fireTarget = exp / swr;
      let nw = Number(v.netWorth) || 0;
      const sav = Number(v.annualSavings) || 1;
      const r = (Number(v.growthRate) || 6.0) / 100;
      let years = 0;
      while (nw < fireTarget && years < 60) {
        nw = (nw + sav) * (1 + r);
        years++;
      }
      return {
        primaryValue: parseFloat(fireTarget.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: 'FIRE Number (Target Net Worth)',
        secondaryOutputs: [
          { label: 'Years to Financial Independence', value: `${years} years` },
          { label: 'Monthly Retirement Allowance', value: `$${(exp / 12).toFixed(2)}` },
        ],
        steps: [`FIRE Target = $${exp} / ${swr} = $${fireTarget.toLocaleString()}`, `With current savings velocity, FIRE reached in ${years} years.`],
        formulaUsed: 'FIRE Number = Annual Spend / SWR',
      };
    },
  },
  {
    slug: 'drip-calculator',
    title: 'DRIP (Dividend Reinvestment Plan) Calculator',
    category: 'investment-savings',
    formulaDisplay: 'Compound share accumulation through automatic reinvestment',
    inputs: [
      { id: 'startingShares', label: 'Initial Shares', defaultValue: 100, type: 'number', step: 10 },
      { id: 'sharePrice', label: 'Share Price ($)', defaultValue: 60, type: 'number', step: 5, unit: '$' },
      { id: 'divYield', label: 'Dividend Yield (%)', defaultValue: 4.5, type: 'number', step: 0.1, unit: '%' },
      { id: 'years', label: 'Holding Period (Years)', defaultValue: 15, type: 'number', step: 1, unit: 'years' },
    ],
    calculate: (v) => {
      let shares = Number(v.startingShares) || 100;
      const price = Number(v.sharePrice) || 60;
      const y = (Number(v.divYield) || 4.5) / 100;
      const t = Number(v.years) || 10;
      for (let i = 0; i < t; i++) {
        const annualDiv = shares * (price * y);
        const newShares = annualDiv / price;
        shares += newShares;
      }
      const finalVal = shares * price;
      return {
        primaryValue: parseFloat(finalVal.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: 'Portfolio Value with DRIP',
        secondaryOutputs: [
          { label: 'Total Shares Accumulated', value: parseFloat(shares.toFixed(2)) },
          { label: 'New Shares from Reinvestment', value: parseFloat((shares - Number(v.startingShares)).toFixed(2)) },
        ],
        steps: [`Dividend income continuously buys incremental shares, compounding both share count and dividend payouts.`],
        formulaUsed: 'DRIP Geometric Share Compounding',
      };
    },
  },
  {
    slug: 'emergency-fund-calculator',
    title: 'Emergency Fund Calculator',
    category: 'investment-savings',
    formulaDisplay: 'Target = Monthly Essential Expenses × Months Cushion',
    inputs: [
      { id: 'rent', label: 'Housing / Rent / Mortgage ($)', defaultValue: 1800, type: 'number', step: 100, unit: '$' },
      { id: 'utilities', label: 'Utilities & Bills ($)', defaultValue: 350, type: 'number', step: 50, unit: '$' },
      { id: 'food', label: 'Groceries & Necessities ($)', defaultValue: 600, type: 'number', step: 50, unit: '$' },
      { id: 'insurance', label: 'Health, Auto, Home Insurance ($)', defaultValue: 450, type: 'number', step: 50, unit: '$' },
      { id: 'months', label: 'Desired Safety Cushion (Months)', defaultValue: 6, type: 'number', min: 3, max: 12, step: 1, unit: 'mo' },
    ],
    calculate: (v) => {
      const rent = Number(v.rent) || 0;
      const util = Number(v.utilities) || 0;
      const food = Number(v.food) || 0;
      const ins = Number(v.insurance) || 0;
      const months = Number(v.months) || 6;
      const monthlyEssential = rent + util + food + ins;
      const emergencyTarget = monthlyEssential * months;
      return {
        primaryValue: parseFloat(emergencyTarget.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: 'Recommended Emergency Fund',
        secondaryOutputs: [
          { label: 'Total Monthly Essential Spend', value: `$${monthlyEssential.toFixed(2)}` },
          { label: '3-Month Minimum Reserve', value: `$${(monthlyEssential * 3).toFixed(2)}` },
        ],
        steps: [`Monthly essentials: $${monthlyEssential}`, `${months}-month buffer = $${monthlyEssential} × ${months} = $${emergencyTarget}`],
        formulaUsed: 'Emergency Reserve = Essential Monthly Spend × Months',
      };
    },
  },
  {
    slug: 'rule-of-72-calculator',
    title: 'Rule of 72 Doubling Time Calculator',
    category: 'investment-savings',
    formulaDisplay: 'Years to Double ≈ 72 / Interest Rate (%)',
    inputs: [
      { id: 'rate', label: 'Annual Compound Interest Rate (%)', defaultValue: 8, type: 'number', min: 0.1, step: 0.25, unit: '%' },
    ],
    calculate: (v) => {
      const r = Number(v.rate) || 1;
      const approx = 72 / r;
      const exact = Math.log(2) / Math.log(1 + r / 100);
      return {
        primaryValue: parseFloat(approx.toFixed(2)),
        primaryUnit: 'years',
        primaryLabel: 'Estimated Years to Double Money',
        secondaryOutputs: [
          { label: 'Exact Formula Doubling Time', value: parseFloat(exact.toFixed(3)) + ' years' },
          { label: 'Rule of 72 Accuracy Error', value: parseFloat((Math.abs(approx - exact) / exact * 100).toFixed(2)) + '%' },
        ],
        steps: [`Rule of 72: 72 / ${r}% = ${approx.toFixed(2)} years`, `Exact ln(2) / ln(1 + ${r/100}) = ${exact.toFixed(3)} years`],
        formulaUsed: 'T_double ≈ 72 / r',
      };
    },
  },
  {
    slug: 'cap-rate-calculator',
    title: 'Cap Rate (Capitalization Rate) Calculator',
    category: 'investment-savings',
    formulaDisplay: 'Cap Rate = (Net Operating Income / Property Value) × 100',
    inputs: [
      { id: 'grossIncome', label: 'Annual Gross Rental Income ($)', defaultValue: 48000, type: 'number', step: 2000, unit: '$' },
      { id: 'expenses', label: 'Annual Operating Expenses ($)', defaultValue: 16000, type: 'number', step: 1000, unit: '$' },
      { id: 'propValue', label: 'Property Acquisition Value ($)', defaultValue: 500000, type: 'number', step: 10000, unit: '$' },
    ],
    calculate: (v) => {
      const gross = Number(v.grossIncome) || 0;
      const exp = Number(v.expenses) || 0;
      const val = Number(v.propValue) || 1;
      const noi = gross - exp;
      const capRate = (noi / val) * 100;
      return {
        primaryValue: parseFloat(capRate.toFixed(2)),
        primaryUnit: '%',
        primaryLabel: 'Capitalization Rate (Cap Rate)',
        secondaryOutputs: [
          { label: 'Net Operating Income (NOI)', value: `$${noi.toFixed(2)}` },
          { label: 'Expense Ratio', value: `${((exp / (gross || 1)) * 100).toFixed(1)}%` },
        ],
        steps: [`NOI = $${gross} - $${exp} = $${noi}`, `Cap Rate = ($${noi} / $${val}) × 100 = ${capRate.toFixed(2)}%`],
        formulaUsed: 'Cap Rate = NOI / Market Value',
      };
    },
  },
  {
    slug: 'rental-cash-flow-calculator',
    title: 'Rental Property Cash Flow Calculator',
    category: 'investment-savings',
    formulaDisplay: 'Cash Flow = Rental Revenue - (Mortgage + Taxes + Insurance + Maintenance)',
    inputs: [
      { id: 'monthlyRent', label: 'Monthly Rent Collected ($)', defaultValue: 2400, type: 'number', step: 100, unit: '$' },
      { id: 'mortgagePmt', label: 'Monthly Mortgage Payment ($)', defaultValue: 1450, type: 'number', step: 50, unit: '$' },
      { id: 'taxesIns', label: 'Monthly Taxes & Insurance ($)', defaultValue: 350, type: 'number', step: 25, unit: '$' },
      { id: 'maintenance', label: 'Maintenance & Vacancy Reserve ($)', defaultValue: 250, type: 'number', step: 25, unit: '$' },
    ],
    calculate: (v) => {
      const rent = Number(v.monthlyRent) || 0;
      const pmt = Number(v.mortgagePmt) || 0;
      const ti = Number(v.taxesIns) || 0;
      const maint = Number(v.maintenance) || 0;
      const totalOutflows = pmt + ti + maint;
      const monthlyCashFlow = rent - totalOutflows;
      const annualCashFlow = monthlyCashFlow * 12;
      return {
        primaryValue: parseFloat(monthlyCashFlow.toFixed(2)),
        primaryUnit: '$ / mo',
        primaryLabel: 'Net Monthly Cash Flow',
        secondaryOutputs: [
          { label: 'Annual Cash Flow', value: `$${annualCashFlow.toFixed(2)}` },
          { label: 'Total Monthly Expenses', value: `$${totalOutflows.toFixed(2)}` },
        ],
        steps: [`Net Cash Flow = $${rent} - ($${pmt} + $${ti} + $${maint}) = $${monthlyCashFlow.toFixed(2)}`],
        formulaUsed: 'Net Cash Flow = Gross Inflow - Total Outflows',
      };
    },
  },
  {
    slug: 'sp500-return-calculator',
    title: 'S&P 500 Historical Return Benchmark Calculator',
    category: 'investment-savings',
    formulaDisplay: 'S&P 500 Historical Real Return ~ 7% (10% nominal)',
    inputs: [
      { id: 'starting', label: 'Initial Index Investment ($)', defaultValue: 10000, type: 'number', step: 1000, unit: '$' },
      { id: 'monthly', label: 'Monthly Addition ($)', defaultValue: 400, type: 'number', step: 50, unit: '$' },
      { id: 'years', label: 'Years Invested', defaultValue: 25, type: 'number', step: 1, unit: 'years' },
    ],
    calculate: (v) => {
      const p = Number(v.starting) || 0;
      const m = Number(v.monthly) || 0;
      const t = Number(v.years) || 1;
      const r = 0.10 / 12; // 10% nominal CAGR historical average
      let bal = p;
      for (let i = 0; i < t * 12; i++) {
        bal = (bal + m) * (1 + r);
      }
      return {
        primaryValue: parseFloat(bal.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: 'Projected S&P 500 Portfolio Value',
        secondaryOutputs: [
          { label: 'Historical Benchmark CAGR', value: '10.0% nominal' },
          { label: 'Total Invested Capital', value: `$${(p + m * t * 12).toFixed(2)}` },
        ],
        steps: [`Historical ~10% long-run total return with reinvested dividends.`],
        formulaUsed: 'S&P 500 Historical Compounding',
      };
    },
  },
  {
    slug: 'tax-equivalent-yield-calculator',
    title: 'Tax-Equivalent Yield (TEY) Calculator',
    category: 'investment-savings',
    formulaDisplay: 'TEY = Tax-Free Muni Yield / (1 - Marginal Tax Bracket)',
    inputs: [
      { id: 'muniYield', label: 'Tax-Free Municipal Bond Yield (%)', defaultValue: 3.8, type: 'number', step: 0.1, unit: '%' },
      { id: 'taxBracket', label: 'Federal Marginal Tax Bracket (%)', defaultValue: 32, type: 'number', step: 1, unit: '%' },
    ],
    calculate: (v) => {
      const y = Number(v.muniYield) || 0;
      const t = (Number(v.taxBracket) || 0) / 100;
      if (t >= 1) return { primaryValue: 'Error', primaryLabel: 'Invalid Tax', error: 'Tax bracket must be < 100%.' };
      const tey = y / (1 - t);
      return {
        primaryValue: parseFloat(tey.toFixed(2)),
        primaryUnit: '%',
        primaryLabel: 'Tax-Equivalent Taxable Yield',
        secondaryOutputs: [
          { label: 'Tax-Free Yield', value: `${y.toFixed(2)}%` },
          { label: 'Tax Advantage Spread', value: `+${(tey - y).toFixed(2)}%` },
        ],
        steps: [`TEY = ${y}% / (1 - ${t}) = ${tey.toFixed(2)}%`],
        formulaUsed: 'TEY = Muni Yield / (1 - Marginal Rate)',
      };
    },
  },
  {
    slug: 'real-return-calculator',
    title: 'Real Return (Fisher Equation) Calculator',
    category: 'investment-savings',
    formulaDisplay: 'Real Rate = [(1 + Nominal Rate) / (1 + Inflation Rate)] - 1',
    inputs: [
      { id: 'nominal', label: 'Nominal Investment Return (%)', defaultValue: 9.5, type: 'number', step: 0.1, unit: '%' },
      { id: 'inflation', label: 'Annual Inflation Rate (%)', defaultValue: 3.2, type: 'number', step: 0.1, unit: '%' },
    ],
    calculate: (v) => {
      const n = (Number(v.nominal) || 0) / 100;
      const i = (Number(v.inflation) || 0) / 100;
      const real = ((1 + n) / (1 + i) - 1) * 100;
      const simpleApprox = (n - i) * 100;
      return {
        primaryValue: parseFloat(real.toFixed(2)),
        primaryUnit: '%',
        primaryLabel: 'Real Return After Inflation',
        secondaryOutputs: [
          { label: 'Simple Approximation (Nominal - Inflation)', value: `${simpleApprox.toFixed(2)}%` },
          { label: 'Fisher Effect Spread', value: `${(real - simpleApprox).toFixed(3)}%` },
        ],
        steps: [`Fisher Equation: ((1 + ${n}) / (1 + ${i}) - 1) × 100 = ${real.toFixed(2)}%`],
        formulaUsed: 'Fisher Equation of Real Yield',
      };
    },
  },
];
