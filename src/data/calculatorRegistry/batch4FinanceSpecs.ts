import { CalculatorSpec } from './types';
import { parseNum, calcError } from './validation';

const fmt = (n: number, d = 2): number => {
  if (!Number.isFinite(n)) return 0;
  const r = Number(n.toFixed(d));
  return Object.is(r, -0) ? 0 : r;
};

const money = (n: number): string => {
  const v = fmt(n, 2);
  return v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const batch4FinanceSpecs: CalculatorSpec[] = [
  // 551. Annuity Payout Calculator
  {
    slug: 'annuity-payout-calculator',
    title: 'Annuity Payout Calculator',
    category: 'finance',
    formulaDisplay: 'PMT = P × r / (1 − (1 + r)^−n)',
    inputs: [
      { id: 'principal', label: 'Starting Principal', type: 'number', prefix: '$', defaultValue: 500000, min: 0, max: 1e12, step: 1000 },
      { id: 'annualRate', label: 'Annual Interest / Return Rate', type: 'number', unit: '%', defaultValue: 5.5, min: 0, max: 50, step: 0.1 },
      { id: 'years', label: 'Payout Duration', type: 'number', unit: 'years', defaultValue: 20, min: 1, max: 60, step: 1 },
      {
        id: 'frequency',
        label: 'Payout Frequency',
        type: 'select',
        defaultValue: '12',
        options: [
          { label: 'Monthly (12/yr)', value: '12' },
          { label: 'Quarterly (4/yr)', value: '4' },
          { label: 'Annual (1/yr)', value: '1' },
        ],
      },
      {
        id: 'timing',
        label: 'Payment Timing',
        type: 'select',
        defaultValue: 'end',
        options: [
          { label: 'End of Period (Ordinary Annuity)', value: 'end' },
          { label: 'Start of Period (Annuity Due)', value: 'start' },
        ],
        advanced: true,
      },
    ],
    calculate: (v) => {
      const P = parseNum(v.principal);
      const rAnn = parseNum(v.annualRate);
      const yrs = parseNum(v.years);
      const freq = parseNum(v.frequency || 12);
      const timing = String(v.timing || 'end');
      if (Number.isNaN(P) || Number.isNaN(rAnn) || Number.isNaN(yrs) || Number.isNaN(freq)) return calcError('Enter valid numeric annuity inputs.');
      if (P < 0 || rAnn < 0 || yrs <= 0 || yrs > 100 || freq <= 0) return calcError('Principal and rate must be non-negative; years and frequency must be positive.');
      const n = Math.min(Math.round(yrs * freq), 1200);
      const r = rAnn / 100 / freq;
      let pmt = r === 0 ? P / n : (P * r) / (1 - Math.pow(1 + r, -n));
      if (timing === 'start' && r > 0) pmt = pmt / (1 + r);
      const totalPayout = pmt * n;
      const totalInterest = totalPayout - P;
      const annualIncome = pmt * freq;
      return {
        primaryValue: fmt(pmt, 2),
        primaryUnit: '$ / period',
        primaryLabel: 'Periodic Annuity Payout',
        secondaryOutputs: [
          { label: 'Annual Income', value: `$${money(annualIncome)}` },
          { label: 'Total Cumulative Payout', value: `$${money(totalPayout)}` },
          { label: 'Total Interest Earned', value: `$${money(totalInterest)}` },
          { label: 'Total Payout Periods', value: n },
        ],
        steps: [
          `Periods n = ${yrs} × ${freq} = ${n}; periodic rate r = ${fmt(r * 100, 5)}%.`,
          `Payout PMT = $${money(pmt)} per period (${timing === 'start' ? 'Annuity Due' : 'Ordinary Annuity'}).`,
          `Cumulative payout = $${money(totalPayout)} (Interest = $${money(totalInterest)}).`,
        ],
        formulaUsed: 'PMT = P × r / (1 − (1 + r)^−n)',
      };
    },
  },

  // 552. Rule of 72 Calculator
  {
    slug: 'rule-of-72-calculator',
    title: 'Rule of 72, 114 & 144 Doubling Time Calculator',
    category: 'finance',
    formulaDisplay: 'Rule of 72 ≈ 72 / r   |   Exact t = ln(k) / ln(1 + r)',
    inputs: [
      { id: 'annualRate', label: 'Annual Compound Rate', type: 'number', unit: '%', defaultValue: 8, min: 0.01, max: 200, step: 0.1 },
      { id: 'startingAmount', label: 'Starting Investment', type: 'number', prefix: '$', defaultValue: 10000, min: 0, max: 1e12, step: 500 },
      {
        id: 'targetMultiple',
        label: 'Target Multiple',
        type: 'select',
        defaultValue: '2',
        options: [
          { label: '2× (Double — Rule of 72)', value: '2' },
          { label: '3× (Triple — Rule of 114)', value: '3' },
          { label: '4× (Quadruple — Rule of 144)', value: '4' },
        ],
      },
    ],
    calculate: (v) => {
      const rPct = parseNum(v.annualRate);
      const P = parseNum(v.startingAmount ?? 10000);
      const mult = parseNum(v.targetMultiple || 2);
      if (Number.isNaN(rPct) || Number.isNaN(P) || Number.isNaN(mult)) return calcError('Enter valid numeric rate and principal.');
      if (rPct <= 0 || P < 0) return calcError('Annual growth rate must be positive and principal non-negative.');
      const r = rPct / 100;
      const ruleNumerator = mult === 3 ? 114 : mult === 4 ? 144 : 72;
      const approxYears = ruleNumerator / rPct;
      const exactYears = Math.log(mult) / Math.log(1 + r);
      const continuousYears = Math.log(mult) / r;
      return {
        primaryValue: fmt(exactYears, 2),
        primaryUnit: 'years',
        primaryLabel: `Exact Time to ${mult}× Money`,
        secondaryOutputs: [
          { label: `Rule of ${ruleNumerator} Estimate`, value: `${fmt(approxYears, 2)} yrs` },
          { label: 'Continuous Compounding Time', value: `${fmt(continuousYears, 2)} yrs` },
          { label: 'Target Portfolio Value', value: `$${money(P * mult)}` },
          { label: 'Approximation Variance', value: `${fmt(approxYears - exactYears, 2)} yrs` },
        ],
        steps: [
          `Rule of ${ruleNumerator}: ${ruleNumerator} / ${rPct}% = ${fmt(approxYears, 2)} years.`,
          `Exact discrete compounding: ln(${mult}) / ln(1 + ${r}) = ${fmt(exactYears, 2)} years.`,
        ],
        formulaUsed: 't_exact = ln(k) / ln(1 + r)',
      };
    },
  },

  // 553. APY to APR Converter
  {
    slug: 'apy-to-apr-calculator',
    title: 'APY to APR & Effective Rate Converter',
    category: 'finance',
    formulaDisplay: 'APY = (1 + APR / n)^n − 1   |   APR = n × ((1 + APY)^(1/n) − 1)',
    inputs: [
      {
        id: 'direction',
        label: 'Conversion Mode',
        type: 'select',
        defaultValue: 'apr_to_apy',
        options: [
          { label: 'Nominal APR → Effective APY', value: 'apr_to_apy' },
          { label: 'Effective APY → Nominal APR', value: 'apy_to_apr' },
        ],
      },
      { id: 'ratePct', label: 'Input Interest Rate', type: 'number', unit: '%', defaultValue: 6.0, min: 0, max: 200, step: 0.05 },
      {
        id: 'compounding',
        label: 'Compounding Frequency',
        type: 'select',
        defaultValue: '12',
        options: [
          { label: 'Daily (365)', value: '365' },
          { label: 'Monthly (12)', value: '12' },
          { label: 'Quarterly (4)', value: '4' },
          { label: 'Semiannual (2)', value: '2' },
          { label: 'Continuous', value: 'continuous' },
        ],
      },
    ],
    calculate: (v) => {
      const dir = String(v.direction || 'apr_to_apy');
      const ratePct = parseNum(v.ratePct);
      const comp = String(v.compounding || '12');
      if (Number.isNaN(ratePct) || ratePct < 0) return calcError('Enter a non-negative interest rate.');
      const r = ratePct / 100;
      let outPct = 0;
      let earDiff = 0;
      if (comp === 'continuous') {
        outPct = dir === 'apr_to_apy' ? (Math.exp(r) - 1) * 100 : Math.log(1 + r) * 100;
      } else {
        const n = parseNum(comp);
        if (Number.isNaN(n) || n <= 0) return calcError('Invalid compounding frequency.');
        outPct =
          dir === 'apr_to_apy'
            ? (Math.pow(1 + r / n, n) - 1) * 100
            : n * (Math.pow(1 + r, 1 / n) - 1) * 100;
      }
      earDiff = Math.abs(outPct - ratePct);
      const monthlyRate = (dir === 'apr_to_apy' ? ratePct : outPct) / 12;
      return {
        primaryValue: fmt(outPct, 4),
        primaryUnit: '%',
        primaryLabel: dir === 'apr_to_apy' ? 'Effective Annual Yield (APY)' : 'Nominal Annual Rate (APR)',
        secondaryOutputs: [
          { label: 'Compounding Spread', value: `${fmt(earDiff, 4)}%` },
          { label: 'Monthly Nominal Rate', value: `${fmt(monthlyRate, 4)}%` },
          { label: 'Growth on $10,000 / yr', value: `$${money(10000 * ((dir === 'apr_to_apy' ? outPct : ratePct) / 100))}` },
        ],
        steps: [
          `Input ${dir === 'apr_to_apy' ? 'APR' : 'APY'} = ${ratePct}% with ${comp === 'continuous' ? 'continuous' : comp + '×/yr'} compounding.`,
          `Converted ${dir === 'apr_to_apy' ? 'APY' : 'APR'} = ${fmt(outPct, 4)}%.`,
        ],
      };
    },
  },

  // 554. Dividend Yield & Payout Ratio Calculator
  {
    slug: 'dividend-yield-payout-calculator',
    title: 'Dividend Yield & Payout Ratio Calculator',
    category: 'finance',
    formulaDisplay: 'Yield = Annual Dividend / Share Price   |   Payout Ratio = DPS / EPS',
    inputs: [
      { id: 'sharePrice', label: 'Current Share Price', type: 'number', prefix: '$', defaultValue: 120, min: 0.01, max: 1e9, step: 0.5 },
      { id: 'dividendPerPayment', label: 'Dividend Per Payment', type: 'number', prefix: '$', defaultValue: 1.05, min: 0, max: 1e6, step: 0.01 },
      {
        id: 'paymentsPerYear',
        label: 'Payment Frequency',
        type: 'select',
        defaultValue: '4',
        options: [
          { label: 'Quarterly (4/yr)', value: '4' },
          { label: 'Monthly (12/yr)', value: '12' },
          { label: 'Semiannual (2/yr)', value: '2' },
          { label: 'Annual (1/yr)', value: '1' },
        ],
      },
      { id: 'sharesOwned', label: 'Shares Owned', type: 'number', defaultValue: 250, min: 0, max: 1e9, step: 1 },
      { id: 'eps', label: 'Trailing / Forward EPS', type: 'number', prefix: '$', defaultValue: 7.5, min: 0, max: 1e6, step: 0.1, advanced: true },
    ],
    calculate: (v) => {
      const price = parseNum(v.sharePrice);
      const dpp = parseNum(v.dividendPerPayment);
      const freq = parseNum(v.paymentsPerYear || 4);
      const shares = parseNum(v.sharesOwned ?? 0);
      const eps = parseNum(v.eps ?? 0);
      if (Number.isNaN(price) || Number.isNaN(dpp) || Number.isNaN(freq) || Number.isNaN(shares)) return calcError('Enter valid numeric dividend parameters.');
      if (price <= 0 || dpp < 0 || freq <= 0 || shares < 0) return calcError('Share price must be positive; dividend and shares cannot be negative.');
      const annualDps = dpp * freq;
      const yieldPct = (annualDps / price) * 100;
      const annualIncome = annualDps * shares;
      const payoutRatio = eps > 0 ? (annualDps / eps) * 100 : 0;
      const dividendCover = annualDps > 0 && eps > 0 ? eps / annualDps : 0;
      return {
        primaryValue: fmt(yieldPct, 2),
        primaryUnit: '%',
        primaryLabel: 'Annualized Dividend Yield',
        secondaryOutputs: [
          { label: 'Annual Dividend / Share', value: `$${money(annualDps)}` },
          { label: 'Annual Portfolio Income', value: `$${money(annualIncome)}` },
          { label: 'Monthly Avg Income', value: `$${money(annualIncome / 12)}` },
          { label: 'Earnings Payout Ratio', value: eps > 0 ? `${fmt(payoutRatio, 1)}% (${fmt(dividendCover, 2)}× cover)` : 'N/A' },
        ],
        steps: [
          `Annual DPS = $${money(dpp)} × ${freq} = $${money(annualDps)}.`,
          `Dividend Yield = $${money(annualDps)} ÷ $${money(price)} = ${fmt(yieldPct, 2)}%.`,
          `Total dividend income on ${shares} shares = $${money(annualIncome)}/yr.`,
        ],
      };
    },
  },

  // 555. Stock Options Intrinsic & Time Value Calculator
  {
    slug: 'stock-options-intrinsic-value-calculator',
    title: 'Stock Options Intrinsic Value & Breakeven Calculator',
    category: 'finance',
    formulaDisplay: 'Call Intrinsic = max(0, S − K)   |   Put Intrinsic = max(0, K − S)',
    inputs: [
      {
        id: 'optionType',
        label: 'Option Type',
        type: 'select',
        defaultValue: 'call',
        options: [
          { label: 'Call Option', value: 'call' },
          { label: 'Put Option', value: 'put' },
        ],
      },
      { id: 'stockPrice', label: 'Underlying Stock Price (S)', type: 'number', prefix: '$', defaultValue: 158, min: 0.01, max: 1e9, step: 0.5 },
      { id: 'strikePrice', label: 'Strike Price (K)', type: 'number', prefix: '$', defaultValue: 150, min: 0.01, max: 1e9, step: 0.5 },
      { id: 'optionPremium', label: 'Option Market Premium (per share)', type: 'number', prefix: '$', defaultValue: 11.4, min: 0, max: 1e6, step: 0.05 },
      { id: 'contracts', label: 'Number of Contracts (100 sh/contract)', type: 'number', defaultValue: 2, min: 1, max: 100000, step: 1 },
    ],
    calculate: (v) => {
      const type = String(v.optionType || 'call');
      const S = parseNum(v.stockPrice);
      const K = parseNum(v.strikePrice);
      const prem = parseNum(v.optionPremium);
      const contracts = parseNum(v.contracts || 1);
      if (Number.isNaN(S) || Number.isNaN(K) || Number.isNaN(prem) || Number.isNaN(contracts)) return calcError('Enter valid option parameters.');
      if (S <= 0 || K <= 0 || prem < 0 || contracts <= 0) return calcError('Prices and contract count must be positive.');
      const intrinsic = type === 'call' ? Math.max(0, S - K) : Math.max(0, K - S);
      const extrinsic = prem - intrinsic;
      const breakeven = type === 'call' ? K + prem : Math.max(0, K - prem);
      const moneyness = intrinsic > 0 ? 'In the Money (ITM)' : S === K ? 'At the Money (ATM)' : 'Out of the Money (OTM)';
      const totalContractCost = prem * 100 * contracts;
      return {
        primaryValue: fmt(intrinsic, 2),
        primaryUnit: '$ / share',
        primaryLabel: 'Intrinsic Value Per Share',
        secondaryOutputs: [
          { label: 'Extrinsic (Time) Value', value: `$${money(extrinsic)} / sh` },
          { label: 'Expiration Breakeven', value: `$${money(breakeven)}` },
          { label: 'Moneyness Status', value: moneyness },
          { label: 'Total Contract Cost', value: `$${money(totalContractCost)}` },
        ],
        steps: [
          `${type === 'call' ? 'Call' : 'Put'} intrinsic value = max(0, ${type === 'call' ? 'S − K' : 'K − S'}) = $${money(intrinsic)}.`,
          `Time/Extrinsic value = $${money(prem)} − $${money(intrinsic)} = $${money(extrinsic)}.`,
          `Breakeven at expiry = $${money(breakeven)} (${moneyness}).`,
        ],
      };
    },
  },

  // 556. Covered Call Yield Calculator
  {
    slug: 'covered-call-yield-calculator',
    title: 'Covered Call Yield & Max Return Calculator',
    category: 'finance',
    formulaDisplay: 'Static Return = Premium / (Stock − Premium)   |   If-Called = (K − Stock + Premium) / (Stock − Premium)',
    inputs: [
      { id: 'stockPrice', label: 'Stock Purchase Price', type: 'number', prefix: '$', defaultValue: 96, min: 0.01, max: 1e9, step: 0.5 },
      { id: 'strikePrice', label: 'Call Strike Price', type: 'number', prefix: '$', defaultValue: 100, min: 0.01, max: 1e9, step: 0.5 },
      { id: 'callPremium', label: 'Call Premium Received', type: 'number', prefix: '$', defaultValue: 2.8, min: 0, max: 1e6, step: 0.05 },
      { id: 'daysToExpiry', label: 'Days to Expiration (DTE)', type: 'number', unit: 'days', defaultValue: 30, min: 1, max: 1095, step: 1 },
      { id: 'contracts', label: 'Contracts (100 shares each)', type: 'number', defaultValue: 1, min: 1, max: 10000, step: 1 },
    ],
    calculate: (v) => {
      const S = parseNum(v.stockPrice);
      const K = parseNum(v.strikePrice);
      const prem = parseNum(v.callPremium);
      const dte = parseNum(v.daysToExpiry);
      const contracts = parseNum(v.contracts || 1);
      if (Number.isNaN(S) || Number.isNaN(K) || Number.isNaN(prem) || Number.isNaN(dte) || Number.isNaN(contracts)) return calcError('Enter valid numeric covered call inputs.');
      if (S <= 0 || K <= 0 || prem < 0 || dte <= 0 || contracts <= 0 || S <= prem) return calcError('Stock price must exceed option premium and DTE must be positive.');
      const netDebit = S - prem;
      const staticProfitPerShare = prem;
      const staticReturnPct = (staticProfitPerShare / netDebit) * 100;
      const annualizedStaticPct = staticReturnPct * (365 / dte);
      const maxProfitPerShare = K - S + prem;
      const maxReturnPct = (maxProfitPerShare / netDebit) * 100;
      const downsideProtectionPct = (prem / S) * 100;
      return {
        primaryValue: fmt(annualizedStaticPct, 2),
        primaryUnit: '% annualized',
        primaryLabel: 'Annualized Static Return',
        secondaryOutputs: [
          { label: 'Static Return (Unassigned)', value: `${fmt(staticReturnPct, 2)}% ($${money(prem * 100 * contracts)})` },
          { label: 'Max Return (If Called)', value: `${fmt(maxReturnPct, 2)}% ($${money(maxProfitPerShare * 100 * contracts)})` },
          { label: 'Breakeven Price', value: `$${money(netDebit)}` },
          { label: 'Downside Buffer', value: `${fmt(downsideProtectionPct, 2)}%` },
        ],
        steps: [
          `Net cost basis = $${money(S)} − $${money(prem)} = $${money(netDebit)}/sh.`,
          `Static return over ${dte} days = ${fmt(staticReturnPct, 2)}% (${fmt(annualizedStaticPct, 2)}% annualized).`,
          `If called at $${money(K)}, max profit = $${money(maxProfitPerShare)}/sh (${fmt(maxReturnPct, 2)}%).`,
        ],
      };
    },
  },

  // 557. Margin Call Price Calculator
  {
    slug: 'margin-call-calculator',
    title: 'Margin Call Price & Leverage Calculator',
    category: 'finance',
    formulaDisplay: 'Long Margin Call Price = Debt Per Share / (1 − Maintenance Margin)',
    inputs: [
      { id: 'sharePrice', label: 'Current / Purchase Share Price', type: 'number', prefix: '$', defaultValue: 100, min: 0.01, max: 1e9, step: 1 },
      { id: 'shares', label: 'Number of Shares', type: 'number', defaultValue: 200, min: 1, max: 1e9, step: 10 },
      { id: 'initialMarginPct', label: 'Initial Equity Margin', type: 'number', unit: '%', defaultValue: 50, min: 10, max: 99, step: 1 },
      { id: 'maintenanceMarginPct', label: 'Broker Maintenance Margin', type: 'number', unit: '%', defaultValue: 30, min: 5, max: 95, step: 1 },
    ],
    calculate: (v) => {
      const P0 = parseNum(v.sharePrice);
      const shares = parseNum(v.shares);
      const initM = parseNum(v.initialMarginPct) / 100;
      const maintM = parseNum(v.maintenanceMarginPct) / 100;
      if (Number.isNaN(P0) || Number.isNaN(shares) || Number.isNaN(initM) || Number.isNaN(maintM)) return calcError('Enter valid margin parameters.');
      if (P0 <= 0 || shares <= 0 || initM <= 0 || initM >= 1 || maintM <= 0 || maintM >= 1) return calcError('Margin percentages must be between 1% and 99%.');
      const totalPos = P0 * shares;
      const equity = totalPos * initM;
      const loan = totalPos - equity;
      const debtPerShare = loan / shares;
      const marginCallPrice = debtPerShare / (1 - maintM);
      const dropPct = ((P0 - marginCallPrice) / P0) * 100;
      return {
        primaryValue: fmt(marginCallPrice, 2),
        primaryUnit: '$ / share',
        primaryLabel: 'Margin Call Trigger Price',
        secondaryOutputs: [
          { label: 'Borrowed Margin Loan', value: `$${money(loan)}` },
          { label: 'Initial Equity Put Up', value: `$${money(equity)}` },
          { label: 'Drop Before Margin Call', value: `${fmt(dropPct, 2)}%` },
          { label: 'Leverage Ratio', value: `${fmt(1 / initM, 2)}×` },
        ],
        steps: [
          `Total position = $${money(totalPos)}; equity = $${money(equity)}; margin loan = $${money(loan)}.`,
          `Margin Call Price = $${money(debtPerShare)} ÷ (1 − ${fmt(maintM, 2)}) = $${money(marginCallPrice)} (${fmt(dropPct, 2)}% drop).`,
        ],
      };
    },
  },

  // 558. Sharpe Ratio Calculator
  {
    slug: 'sharpe-ratio-calculator',
    title: 'Portfolio Sharpe Ratio Calculator',
    category: 'finance',
    formulaDisplay: 'Sharpe = (Rp − Rf) / σp',
    inputs: [
      { id: 'portfolioReturnPct', label: 'Portfolio Annual Return (Rp)', type: 'number', unit: '%', defaultValue: 11.2, min: -100, max: 500, step: 0.1 },
      { id: 'riskFreeRatePct', label: 'Risk-Free Rate (Rf)', type: 'number', unit: '%', defaultValue: 4.1, min: -10, max: 50, step: 0.1 },
      { id: 'stdDevPct', label: 'Portfolio Std Deviation (σp)', type: 'number', unit: '%', defaultValue: 14.5, min: 0.01, max: 300, step: 0.1 },
    ],
    calculate: (v) => {
      const rp = parseNum(v.portfolioReturnPct);
      const rf = parseNum(v.riskFreeRatePct);
      const sd = parseNum(v.stdDevPct);
      if (Number.isNaN(rp) || Number.isNaN(rf) || Number.isNaN(sd)) return calcError('Enter valid numeric return and volatility figures.');
      if (sd <= 0) return calcError('Portfolio standard deviation must be greater than zero.');
      const excess = rp - rf;
      const sharpe = excess / sd;
      const rating = sharpe >= 2 ? 'Very Good / Institutional Grade' : sharpe >= 1 ? 'Good Risk-Adjusted Return' : sharpe >= 0 ? 'Sub-Optimal (<1.0)' : 'Negative Excess Return';
      return {
        primaryValue: fmt(sharpe, 3),
        primaryUnit: 'ratio',
        primaryLabel: 'Annualized Sharpe Ratio',
        secondaryOutputs: [
          { label: 'Excess Return (Rp − Rf)', value: `${fmt(excess, 2)}%` },
          { label: 'Unit Return / Risk', value: `${fmt(sharpe, 2)}% per 1% σ` },
          { label: 'Qualitative Grade', value: rating },
        ],
        steps: [
          `Excess return = ${rp}% − ${rf}% = ${fmt(excess, 2)}%.`,
          `Sharpe Ratio = ${fmt(excess, 2)}% ÷ ${sd}% = ${fmt(sharpe, 3)} (${rating}).`,
        ],
      };
    },
  },

  // 559. Sortino Ratio Calculator
  {
    slug: 'sortino-ratio-calculator',
    title: 'Portfolio Sortino Ratio Calculator',
    category: 'finance',
    formulaDisplay: 'Sortino = (Rp − MAR) / σ_downside',
    inputs: [
      { id: 'portfolioReturnPct', label: 'Portfolio Annual Return', type: 'number', unit: '%', defaultValue: 12.0, min: -100, max: 500, step: 0.1 },
      { id: 'marPct', label: 'Minimum Acceptable Return (MAR)', type: 'number', unit: '%', defaultValue: 4.0, min: -20, max: 100, step: 0.1 },
      { id: 'downsideDevPct', label: 'Downside Deviation (σd)', type: 'number', unit: '%', defaultValue: 8.5, min: 0.01, max: 300, step: 0.1 },
    ],
    calculate: (v) => {
      const rp = parseNum(v.portfolioReturnPct);
      const mar = parseNum(v.marPct);
      const dd = parseNum(v.downsideDevPct);
      if (Number.isNaN(rp) || Number.isNaN(mar) || Number.isNaN(dd)) return calcError('Enter valid numeric return and downside deviation inputs.');
      if (dd <= 0) return calcError('Downside deviation must be greater than zero.');
      const excess = rp - mar;
      const sortino = excess / dd;
      return {
        primaryValue: fmt(sortino, 3),
        primaryUnit: 'ratio',
        primaryLabel: 'Annualized Sortino Ratio',
        secondaryOutputs: [
          { label: 'Excess Return Over MAR', value: `${fmt(excess, 2)}%` },
          { label: 'Downside Risk Rating', value: sortino >= 2 ? 'Strong Asymmetric Upside' : sortino >= 1 ? 'Healthy' : 'Elevated Downside Risk' },
        ],
        steps: [
          `Excess over MAR = ${rp}% − ${mar}% = ${fmt(excess, 2)}%.`,
          `Sortino = ${fmt(excess, 2)}% ÷ ${dd}% = ${fmt(sortino, 3)}.`,
        ],
      };
    },
  },

  // 560. CAPM Expected Return Calculator
  {
    slug: 'capm-expected-return-calculator',
    title: 'CAPM Expected Return Calculator',
    category: 'finance',
    formulaDisplay: 'E(Ri) = Rf + βi × (E(Rm) − Rf)',
    inputs: [
      { id: 'riskFreePct', label: 'Risk-Free Rate (Rf)', type: 'number', unit: '%', defaultValue: 4.2, min: -5, max: 50, step: 0.1 },
      { id: 'beta', label: 'Asset Beta (β)', type: 'number', defaultValue: 1.25, min: -5, max: 10, step: 0.05 },
      { id: 'marketReturnPct', label: 'Expected Market Return E(Rm)', type: 'number', unit: '%', defaultValue: 9.5, min: -50, max: 100, step: 0.1 },
    ],
    calculate: (v) => {
      const rf = parseNum(v.riskFreePct);
      const beta = parseNum(v.beta);
      const rm = parseNum(v.marketReturnPct);
      if (Number.isNaN(rf) || Number.isNaN(beta) || Number.isNaN(rm)) return calcError('Enter valid CAPM inputs.');
      const mrp = rm - rf;
      const expected = rf + beta * mrp;
      const assetPremium = beta * mrp;
      return {
        primaryValue: fmt(expected, 2),
        primaryUnit: '%',
        primaryLabel: 'CAPM Expected Return E(Ri)',
        secondaryOutputs: [
          { label: 'Equity Market Risk Premium', value: `${fmt(mrp, 2)}%` },
          { label: 'Asset Beta Risk Premium', value: `${fmt(assetPremium, 2)}%` },
          { label: 'Beta Posture', value: beta > 1 ? 'Aggressive (>1.0)' : beta === 1 ? 'Market Neutral' : 'Defensive (<1.0)' },
        ],
        steps: [
          `Market Risk Premium = ${rm}% − ${rf}% = ${fmt(mrp, 2)}%.`,
          `E(Ri) = ${rf}% + ${beta} × ${fmt(mrp, 2)}% = ${fmt(expected, 2)}%.`,
        ],
      };
    },
  },

  // 561. Treynor Ratio Calculator
  {
    slug: 'treynor-ratio-calculator',
    title: 'Treynor Ratio Calculator',
    category: 'finance',
    formulaDisplay: 'Treynor = (Rp − Rf) / βp',
    inputs: [
      { id: 'portfolioReturnPct', label: 'Portfolio Annual Return (Rp)', type: 'number', unit: '%', defaultValue: 12.5, min: -100, max: 500, step: 0.1 },
      { id: 'riskFreePct', label: 'Risk-Free Rate (Rf)', type: 'number', unit: '%', defaultValue: 4.1, min: -5, max: 50, step: 0.1 },
      { id: 'beta', label: 'Portfolio Beta (β)', type: 'number', defaultValue: 1.15, min: -10, max: 10, step: 0.05 },
    ],
    calculate: (v) => {
      const rp = parseNum(v.portfolioReturnPct);
      const rf = parseNum(v.riskFreePct);
      const beta = parseNum(v.beta);
      if (Number.isNaN(rp) || Number.isNaN(rf) || Number.isNaN(beta)) return calcError('Enter valid numeric inputs.');
      if (beta === 0) return calcError('Portfolio beta cannot be zero for Treynor ratio.');
      const treynor = (rp - rf) / beta;
      return {
        primaryValue: fmt(treynor, 2),
        primaryUnit: '% per β',
        primaryLabel: 'Treynor Reward-to-Volatility',
        secondaryOutputs: [
          { label: 'Excess Portfolio Return', value: `${fmt(rp - rf, 2)}%` },
          { label: 'Decimal Treynor Ratio', value: fmt(treynor / 100, 4) },
        ],
        steps: [
          `Excess return = ${rp}% − ${rf}% = ${fmt(rp - rf, 2)}%.`,
          `Treynor Ratio = ${fmt(rp - rf, 2)}% ÷ ${beta} = ${fmt(treynor, 2)}% per unit β.`,
        ],
      };
    },
  },

  // 562. Weighted Portfolio Beta Calculator
  {
    slug: 'portfolio-beta-calculator',
    title: 'Weighted Portfolio Beta Calculator',
    category: 'finance',
    formulaDisplay: 'β_portfolio = Σ (w_i × β_i)',
    inputs: [
      { id: 'v1', label: 'Holding 1 Value (e.g., US Broad Equity)', type: 'number', prefix: '$', defaultValue: 50000, min: 0, max: 1e12, step: 1000 },
      { id: 'b1', label: 'Holding 1 Beta', type: 'number', defaultValue: 1.0, min: -5, max: 10, step: 0.05 },
      { id: 'v2', label: 'Holding 2 Value (e.g., Growth Tech)', type: 'number', prefix: '$', defaultValue: 30000, min: 0, max: 1e12, step: 1000 },
      { id: 'b2', label: 'Holding 2 Beta', type: 'number', defaultValue: 1.45, min: -5, max: 10, step: 0.05 },
      { id: 'v3', label: 'Holding 3 Value (e.g., Investment Grade Bonds)', type: 'number', prefix: '$', defaultValue: 20000, min: 0, max: 1e12, step: 1000 },
      { id: 'b3', label: 'Holding 3 Beta', type: 'number', defaultValue: 0.15, min: -5, max: 10, step: 0.05 },
      { id: 'v4', label: 'Holding 4 Value (Optional)', type: 'number', prefix: '$', defaultValue: 0, min: 0, max: 1e12, step: 1000, advanced: true },
      { id: 'b4', label: 'Holding 4 Beta', type: 'number', defaultValue: 0.8, min: -5, max: 10, step: 0.05, advanced: true },
    ],
    calculate: (v) => {
      const vals = [parseNum(v.v1), parseNum(v.v2), parseNum(v.v3), parseNum(v.v4 ?? 0)];
      const betas = [parseNum(v.b1), parseNum(v.b2), parseNum(v.b3), parseNum(v.b4 ?? 0)];
      if (vals.some(Number.isNaN) || betas.some(Number.isNaN)) return calcError('Enter valid numeric position values and betas.');
      if (vals.some((x) => x < 0)) return calcError('Position values cannot be negative.');
      const total = vals.reduce((a, b) => a + b, 0);
      if (total <= 0) return calcError('Total portfolio value must be greater than zero.');
      const weightedBeta = vals.reduce((acc, val, i) => acc + (val / total) * betas[i], 0);
      const tenPctShock = 10 * weightedBeta;
      return {
        primaryValue: fmt(weightedBeta, 3),
        primaryUnit: 'β',
        primaryLabel: 'Weighted Portfolio Beta',
        secondaryOutputs: [
          { label: 'Total Portfolio Value', value: `$${money(total)}` },
          { label: 'Est. Impact of +10% Market Move', value: `${tenPctShock >= 0 ? '+' : ''}${fmt(tenPctShock, 2)}%` },
          { label: 'Beta Risk Profile', value: weightedBeta > 1.1 ? 'High Systematic Sensitivity' : weightedBeta >= 0.8 ? 'Near-Market Risk' : 'Defensive' },
        ],
        steps: [
          `Total portfolio = $${money(total)}.`,
          `Weighted β = Σ(w_i × β_i) = ${fmt(weightedBeta, 3)}.`,
        ],
      };
    },
  },

  // 563. Stock Split & Cost Basis Calculator
  {
    slug: 'stock-split-cost-basis-calculator',
    title: 'Stock Split Adjusted Shares & Cost Basis Calculator',
    category: 'finance',
    formulaDisplay: 'New Shares = Old Shares × (New / Old)   |   New Cost = Old Cost × (Old / New)',
    inputs: [
      { id: 'oldShares', label: 'Current Shares Held', type: 'number', defaultValue: 120, min: 0.0001, max: 1e10, step: 1 },
      { id: 'oldCostBasis', label: 'Current Cost Basis / Share', type: 'number', prefix: '$', defaultValue: 480, min: 0, max: 1e9, step: 1 },
      { id: 'splitNew', label: 'Split Ratio Numerator (New Shares)', type: 'number', defaultValue: 10, min: 1, max: 1000, step: 1 },
      { id: 'splitOld', label: 'Split Ratio Denominator (Per Old Shares)', type: 'number', defaultValue: 1, min: 1, max: 1000, step: 1 },
      { id: 'currentMarketPrice', label: 'Pre-Split Market Price', type: 'number', prefix: '$', defaultValue: 620, min: 0, max: 1e9, step: 1 },
    ],
    calculate: (v) => {
      const sh = parseNum(v.oldShares);
      const cost = parseNum(v.oldCostBasis);
      const rNew = parseNum(v.splitNew);
      const rOld = parseNum(v.splitOld);
      const mkt = parseNum(v.currentMarketPrice ?? 0);
      if ([sh, cost, rNew, rOld, mkt].some(Number.isNaN)) return calcError('Enter valid numeric split values.');
      if (sh <= 0 || rNew <= 0 || rOld <= 0 || cost < 0 || mkt < 0) return calcError('Shares and split ratios must be positive.');
      const factor = rNew / rOld;
      const newShares = sh * factor;
      const newBasis = cost / factor;
      const newMkt = mkt / factor;
      const totalValue = newShares * newMkt;
      const totalBasis = sh * cost;
      return {
        primaryValue: fmt(newShares, 4),
        primaryUnit: 'shares',
        primaryLabel: `Post-${rNew}:${rOld} Split Shares`,
        secondaryOutputs: [
          { label: 'New Cost Basis / Share', value: `$${money(newBasis)}` },
          { label: 'Adjusted Market Price', value: `$${money(newMkt)}` },
          { label: 'Unchanged Position Value', value: `$${money(totalValue)}` },
          { label: 'Total Cost Basis', value: `$${money(totalBasis)}` },
        ],
        steps: [
          `Split multiplier = ${rNew} / ${rOld} = ${fmt(factor, 4)}× (${factor >= 1 ? 'Forward Split' : 'Reverse Split'}).`,
          `New shares = ${sh} × ${fmt(factor, 4)} = ${fmt(newShares, 4)}; adjusted cost basis = $${money(newBasis)}/sh.`,
        ],
      };
    },
  },

  // 564. Average Down Stock Cost Basis Calculator
  {
    slug: 'average-down-stock-calculator',
    title: 'Stock Average Cost Basis (Average Down) Calculator',
    category: 'finance',
    formulaDisplay: 'Avg Cost = (S1×P1 + S2×P2 + Fees) / (S1 + S2)',
    inputs: [
      { id: 'shares1', label: 'Existing Shares Held', type: 'number', defaultValue: 100, min: 0.0001, max: 1e10, step: 1 },
      { id: 'price1', label: 'Existing Avg Cost / Share', type: 'number', prefix: '$', defaultValue: 85, min: 0.0001, max: 1e9, step: 0.5 },
      { id: 'shares2', label: 'New Shares Purchased', type: 'number', defaultValue: 150, min: 0, max: 1e10, step: 1 },
      { id: 'price2', label: 'New Purchase Price / Share', type: 'number', prefix: '$', defaultValue: 55, min: 0.0001, max: 1e9, step: 0.5 },
      { id: 'fees', label: 'Total Commissions / Fees', type: 'number', prefix: '$', defaultValue: 0, min: 0, max: 1e6, step: 1, advanced: true },
    ],
    calculate: (v) => {
      const s1 = parseNum(v.shares1);
      const p1 = parseNum(v.price1);
      const s2 = parseNum(v.shares2);
      const p2 = parseNum(v.price2);
      const fees = parseNum(v.fees ?? 0);
      if ([s1, p1, s2, p2, fees].some(Number.isNaN)) return calcError('Enter valid numeric share and price values.');
      if (s1 <= 0 || p1 <= 0 || s2 < 0 || p2 <= 0 || fees < 0) return calcError('Existing shares and prices must be positive.');
      const totalShares = s1 + s2;
      const totalCost = s1 * p1 + s2 * p2 + fees;
      const newAvg = totalCost / totalShares;
      const currentVal = totalShares * p2;
      const unrealGain = currentVal - totalCost;
      const pctToBreakeven = p2 > 0 ? ((newAvg - p2) / p2) * 100 : 0;
      return {
        primaryValue: fmt(newAvg, 2),
        primaryUnit: '$ / share',
        primaryLabel: 'New Average Cost Basis',
        secondaryOutputs: [
          { label: 'Total Shares Held', value: fmt(totalShares, 4) },
          { label: 'Total Invested Capital', value: `$${money(totalCost)}` },
          { label: 'Gain Required to Breakeven', value: `${pctToBreakeven >= 0 ? '+' : ''}${fmt(pctToBreakeven, 2)}%` },
          { label: 'Unrealized P&L @ New Price', value: `${unrealGain >= 0 ? '+' : ''}$${money(unrealGain)}` },
        ],
        steps: [
          `Total invested = (${s1} × $${money(p1)}) + (${s2} × $${money(p2)}) + $${money(fees)} = $${money(totalCost)}.`,
          `New average basis = $${money(totalCost)} ÷ ${totalShares} shares = $${money(newAvg)}/sh.`,
        ],
      };
    },
  },

  // 565. Crypto Staking APY Calculator
  {
    slug: 'crypto-staking-apy-calculator',
    title: 'Crypto Staking APY & Compounding Rewards Calculator',
    category: 'finance',
    formulaDisplay: 'Tokens_final = Tokens_0 × (1 + APR/n)^(n×t)',
    inputs: [
      { id: 'tokens', label: 'Staked Token Amount', type: 'number', defaultValue: 10, min: 0, max: 1e12, step: 0.5 },
      { id: 'tokenPrice', label: 'Current Token Price', type: 'number', prefix: '$', defaultValue: 2500, min: 0, max: 1e9, step: 10 },
      { id: 'aprPct', label: 'Gross Validator APR', type: 'number', unit: '%', defaultValue: 4.5, min: 0, max: 500, step: 0.1 },
      { id: 'validatorFeePct', label: 'Validator Commission Fee', type: 'number', unit: '%', defaultValue: 5, min: 0, max: 99, step: 1 },
      { id: 'years', label: 'Staking Horizon', type: 'number', unit: 'years', defaultValue: 3, min: 0.1, max: 50, step: 0.5 },
      {
        id: 'restakeFreq',
        label: 'Restaking Compounding',
        type: 'select',
        defaultValue: '365',
        options: [
          { label: 'Daily Auto-Compound (365/yr)', value: '365' },
          { label: 'Weekly (52/yr)', value: '52' },
          { label: 'Monthly (12/yr)', value: '12' },
          { label: 'Simple Interest (No Restake)', value: '0' },
        ],
      },
    ],
    calculate: (v) => {
      const tok = parseNum(v.tokens);
      const px = parseNum(v.tokenPrice);
      const apr = parseNum(v.aprPct) / 100;
      const fee = parseNum(v.validatorFeePct) / 100;
      const yrs = parseNum(v.years);
      const freq = parseNum(v.restakeFreq ?? 365);
      if ([tok, px, apr, fee, yrs, freq].some(Number.isNaN)) return calcError('Enter valid numeric staking inputs.');
      if (tok < 0 || px < 0 || apr < 0 || fee < 0 || fee >= 1 || yrs <= 0) return calcError('Validator fee must be <100% and horizon positive.');
      const netApr = apr * (1 - fee);
      const finalTok = freq === 0 ? tok * (1 + netApr * yrs) : tok * Math.pow(1 + netApr / freq, freq * yrs);
      const earnedTok = finalTok - tok;
      const effectiveApy = freq === 0 ? netApr * 100 : (Math.pow(1 + netApr / freq, freq) - 1) * 100;
      return {
        primaryValue: fmt(finalTok, 4),
        primaryUnit: 'tokens',
        primaryLabel: `Projected Tokens (${yrs} yrs)`,
        secondaryOutputs: [
          { label: 'Net Effective APY', value: `${fmt(effectiveApy, 2)}%` },
          { label: 'Staking Rewards Earned', value: `${fmt(earnedTok, 4)} tokens` },
          { label: 'Reward Value @ Current Price', value: `$${money(earnedTok * px)}` },
          { label: 'Total Projected Value', value: `$${money(finalTok * px)}` },
        ],
        steps: [
          `Net APR after ${fmt(fee * 100, 1)}% validator commission = ${fmt(netApr * 100, 2)}% (APY = ${fmt(effectiveApy, 2)}%).`,
          `Projected balance after ${yrs} yrs = ${fmt(finalTok, 4)} tokens (+${fmt(earnedTok, 4)} earned).`,
        ],
      };
    },
  },

  // 566. US Social Security Breakeven Calculator (2026)
  {
    slug: 'social-security-breakeven-calculator',
    title: 'Social Security Claiming Age & Breakeven Calculator (2026)',
    category: 'finance',
    formulaDisplay: 'Benefit(age) = PIA × AdjustmentFactor(age vs FRA 67)',
    inputs: [
      { id: 'piaMonthly', label: 'Full Retirement Age (67) Benefit (PIA)', type: 'number', prefix: '$', defaultValue: 2600, min: 100, max: 10000, step: 50, helpText: '2026 SSA Full Retirement Age is 67 for anyone born 1960 or later.' },
      { id: 'earlyAge', label: 'Earlier Claiming Age', type: 'number', unit: 'yrs', defaultValue: 62, min: 62, max: 69, step: 1 },
      { id: 'lateAge', label: 'Later Claiming Age', type: 'number', unit: 'yrs', defaultValue: 70, min: 63, max: 70, step: 1 },
      { id: 'colaPct', label: 'Assumed Annual COLA', type: 'number', unit: '%', defaultValue: 2.5, min: 0, max: 10, step: 0.1 },
    ],
    calculate: (v) => {
      const pia = parseNum(v.piaMonthly);
      const a1 = Math.round(parseNum(v.earlyAge));
      const a2 = Math.round(parseNum(v.lateAge));
      const cola = parseNum(v.colaPct ?? 2.5) / 100;
      if ([pia, a1, a2, cola].some(Number.isNaN)) return calcError('Enter valid Social Security claiming ages and PIA.');
      if (pia <= 0 || a1 < 62 || a2 > 70 || a1 >= a2) return calcError('Claiming ages must be 62–70 with Early Age < Later Age.');

      const adjFactor = (age: number) => {
        const monthsDiff = (age - 67) * 12;
        if (monthsDiff === 0) return 1.0;
        if (monthsDiff > 0) return 1 + (monthsDiff * 8) / 1200; // +8%/yr delayed retirement credits
        const earlyMonths = Math.abs(monthsDiff);
        const first36 = Math.min(earlyMonths, 36);
        const beyond36 = Math.max(0, earlyMonths - 36);
        return 1 - first36 * (5 / 900) - beyond36 * (5 / 1200);
      };

      const m1 = pia * adjFactor(a1);
      const m2 = pia * adjFactor(a2);
      let cum1 = 0;
      let cum2 = 0;
      let breakevenAge = 100;
      let found = false;
      for (let m = 0; m <= (100 - a1) * 12; m++) {
        const curAge = a1 + m / 12;
        const yrFactor = Math.pow(1 + cola, Math.floor(m / 12));
        cum1 += m1 * yrFactor;
        if (curAge >= a2) cum2 += m2 * yrFactor;
        if (curAge > a2 && cum2 >= cum1 && !found) {
          breakevenAge = curAge;
          found = true;
          break;
        }
      }
      return {
        primaryValue: fmt(breakevenAge, 1),
        primaryUnit: 'years old',
        primaryLabel: `Breakeven Age (${a1} vs ${a2})`,
        secondaryOutputs: [
          { label: `Monthly @ Age ${a1}`, value: `$${money(m1)}` },
          { label: `Monthly @ Age ${a2}`, value: `$${money(m2)}` },
          { label: 'Monthly Boost from Waiting', value: `+${fmt(((m2 - m1) / m1) * 100, 1)}%` },
          { label: 'Cumulative @ Age 85 (Later)', value: `$${money(m2 * 12 * (85 - a2) * (cola > 0 ? 1.15 : 1))}` },
        ],
        steps: [
          `Age ${a1} SSA factor = ${fmt(adjFactor(a1) * 100, 2)}% → $${money(m1)}/mo.`,
          `Age ${a2} SSA factor = ${fmt(adjFactor(a2) * 100, 2)}% → $${money(m2)}/mo.`,
          `With ${fmt(cola * 100, 1)}% COLA, cumulative benefits equalize around age ${fmt(breakevenAge, 1)}.`,
        ],
      };
    },
  },

  // 567. HSA Triple-Tax-Advantage Calculator (2026 IRS Limits)
  {
    slug: 'hsa-triple-tax-savings-calculator',
    title: 'HSA Triple-Tax-Advantage Calculator (2026 Limits)',
    category: 'finance',
    formulaDisplay: 'Tax Savings + Compounded Tax-Free Growth',
    inputs: [
      {
        id: 'coverageType',
        label: 'HDHP Coverage Tier (2026 IRS)',
        type: 'select',
        defaultValue: 'individual',
        options: [
          { label: 'Self-Only ($4,400 max in 2026)', value: 'individual' },
          { label: 'Family ($8,750 max in 2026)', value: 'family' },
        ],
      },
      { id: 'annualContribution', label: 'Total Annual HSA Contribution', type: 'number', prefix: '$', defaultValue: 4400, min: 0, max: 15000, step: 100 },
      { id: 'age', label: 'Current Age (55+ adds $1,000 catch-up)', type: 'number', unit: 'yrs', defaultValue: 35, min: 18, max: 85, step: 1 },
      { id: 'yearsToInvest', label: 'Investment Horizon', type: 'number', unit: 'years', defaultValue: 25, min: 1, max: 60, step: 1 },
      { id: 'expectedReturnPct', label: 'Expected Annual Return', type: 'number', unit: '%', defaultValue: 7.0, min: 0, max: 25, step: 0.25 },
      { id: 'marginalTaxPct', label: 'Combined Marginal Income + FICA Tax', type: 'number', unit: '%', defaultValue: 29.65, min: 0, max: 65, step: 0.5, helpText: '22% Federal + 7.65% payroll FICA = 29.65%.' },
    ],
    calculate: (v) => {
      const cov = String(v.coverageType || 'individual');
      const age = parseNum(v.age);
      const yrs = parseNum(v.yearsToInvest);
      const ret = parseNum(v.expectedReturnPct) / 100;
      const tax = parseNum(v.marginalTaxPct) / 100;
      const contribInput = parseNum(v.annualContribution);
      if ([age, yrs, ret, tax, contribInput].some(Number.isNaN)) return calcError('Enter valid numeric HSA values.');
      if (age < 18 || yrs <= 0 || ret < 0 || tax < 0 || contribInput < 0) return calcError('Inputs must be non-negative and horizon positive.');
      const irsBase = cov === 'family' ? 8750 : 4400; // IRS Rev. Proc. 2025-19 for 2026
      const catchUp = age >= 55 ? 1000 : 0;
      const max2026 = irsBase + catchUp;
      const effectiveContrib = Math.min(contribInput, max2026);
      const fv = ret === 0 ? effectiveContrib * yrs : effectiveContrib * ((Math.pow(1 + ret, yrs) - 1) / ret);
      const totalContribs = effectiveContrib * yrs;
      const taxSavedUpfront = totalContribs * tax;
      return {
        primaryValue: fmt(fv, 2),
        primaryUnit: '$',
        primaryLabel: 'Projected Tax-Free HSA Balance',
        secondaryOutputs: [
          { label: '2026 IRS Contribution Cap Applied', value: `$${money(effectiveContrib)} (Max $${money(max2026)})` },
          { label: 'Total Direct Tax Savings (Fed+FICA)', value: `$${money(taxSavedUpfront)}` },
          { label: 'Tax-Free Compounded Earnings', value: `$${money(fv - totalContribs)}` },
          { label: '4% Annual Medical Drawdown', value: `$${money(fv * 0.04)}/yr` },
        ],
        steps: [
          `2026 IRS Rev. Proc. 2025-19 cap (${cov}${age >= 55 ? ' + $1,000 catch-up' : ''}) = $${money(max2026)}.`,
          `Capped annual contribution = $${money(effectiveContrib)} compounded for ${yrs} yrs @ ${fmt(ret * 100, 2)}% = $${money(fv)}.`,
          `Cumulative income + FICA tax saved on contributions = $${money(taxSavedUpfront)}.`,
        ],
      };
    },
  },

  // 568. 529 College Savings Plan Calculator
  {
    slug: '529-college-savings-calculator',
    title: '529 Education Savings Plan Calculator',
    category: 'finance',
    formulaDisplay: 'FV = P(1+r)^n + PMT × ((1+r)^n − 1) / r',
    inputs: [
      { id: 'currentBalance', label: 'Current 529 Balance', type: 'number', prefix: '$', defaultValue: 10000, min: 0, max: 1e9, step: 500 },
      { id: 'monthlyContribution', label: 'Monthly Contribution', type: 'number', prefix: '$', defaultValue: 350, min: 0, max: 1e7, step: 25 },
      { id: 'yearsToCollege', label: 'Years Until College', type: 'number', unit: 'yrs', defaultValue: 14, min: 1, max: 35, step: 1 },
      { id: 'annualReturnPct', label: 'Expected Investment Return', type: 'number', unit: '%', defaultValue: 6.5, min: 0, max: 25, step: 0.25 },
      { id: 'currentAnnualTuition', label: 'Today’s Annual College Cost', type: 'number', prefix: '$', defaultValue: 32000, min: 0, max: 500000, step: 1000 },
      { id: 'tuitionInflationPct', label: 'Annual Tuition Inflation', type: 'number', unit: '%', defaultValue: 4.0, min: 0, max: 15, step: 0.25 },
    ],
    calculate: (v) => {
      const bal = parseNum(v.currentBalance);
      const pmt = parseNum(v.monthlyContribution);
      const yrs = parseNum(v.yearsToCollege);
      const ret = parseNum(v.annualReturnPct) / 100;
      const cost0 = parseNum(v.currentAnnualTuition);
      const inf = parseNum(v.tuitionInflationPct) / 100;
      if ([bal, pmt, yrs, ret, cost0, inf].some(Number.isNaN)) return calcError('Enter valid numeric 529 plan assumptions.');
      if (bal < 0 || pmt < 0 || yrs <= 0 || ret < 0 || cost0 < 0 || inf < 0) return calcError('Values cannot be negative and years must be positive.');
      const n = Math.min(Math.round(yrs * 12), 600);
      const rm = ret / 12;
      const fv = rm === 0 ? bal + pmt * n : bal * Math.pow(1 + rm, n) + pmt * ((Math.pow(1 + rm, n) - 1) / rm);
      let fourYearCost = 0;
      for (let i = 0; i < 4; i++) fourYearCost += cost0 * Math.pow(1 + inf, yrs + i);
      const fundedPct = fourYearCost > 0 ? (fv / fourYearCost) * 100 : 100;
      return {
        primaryValue: fmt(fv, 2),
        primaryUnit: '$',
        primaryLabel: 'Projected 529 Balance at Enrollment',
        secondaryOutputs: [
          { label: 'Est. 4-Year Future Tuition Total', value: `$${money(fourYearCost)}` },
          { label: 'Projected Funding Coverage', value: `${fmt(fundedPct, 1)}%` },
          { label: 'Tuition Gap / Surplus', value: `${fv >= fourYearCost ? '+' : ''}$${money(fv - fourYearCost)}` },
          { label: 'Total Principal Contributed', value: `$${money(bal + pmt * n)}` },
        ],
        steps: [
          `529 savings grow over ${yrs} years (${n} months) at ${fmt(ret * 100, 2)}% → $${money(fv)}.`,
          `Projected 4-year college cost inflating at ${fmt(inf * 100, 2)}%/yr = $${money(fourYearCost)} (${fmt(fundedPct, 1)}% covered).`,
        ],
      };
    },
  },

  // 569. Coast FIRE Calculator
  {
    slug: 'coast-fire-calculator',
    title: 'Coast FIRE Target & Financial Independence Age Calculator',
    category: 'finance',
    formulaDisplay: 'Coast FIRE Number = (Annual Spend / SWR) / (1 + r_real)^Years',
    inputs: [
      { id: 'currentAge', label: 'Current Age', type: 'number', unit: 'yrs', defaultValue: 30, min: 18, max: 80, step: 1 },
      { id: 'retirementAge', label: 'Traditional Retirement Age', type: 'number', unit: 'yrs', defaultValue: 65, min: 30, max: 90, step: 1 },
      { id: 'currentInvested', label: 'Current Invested Portfolio', type: 'number', prefix: '$', defaultValue: 180000, min: 0, max: 1e12, step: 5000 },
      { id: 'annualSpend', label: 'Target Annual Retirement Spending', type: 'number', prefix: '$', defaultValue: 65000, min: 1000, max: 1e8, step: 2500 },
      { id: 'swrPct', label: 'Safe Withdrawal Rate', type: 'number', unit: '%', defaultValue: 4.0, min: 1, max: 10, step: 0.25 },
      { id: 'realReturnPct', label: 'Real Return (After Inflation)', type: 'number', unit: '%', defaultValue: 5.5, min: 0, max: 20, step: 0.25 },
    ],
    calculate: (v) => {
      const age = parseNum(v.currentAge);
      const retAge = parseNum(v.retirementAge);
      const cur = parseNum(v.currentInvested);
      const spend = parseNum(v.annualSpend);
      const swr = parseNum(v.swrPct) / 100;
      const r = parseNum(v.realReturnPct) / 100;
      if ([age, retAge, cur, spend, swr, r].some(Number.isNaN)) return calcError('Enter valid Coast FIRE parameters.');
      if (retAge <= age || cur < 0 || spend <= 0 || swr <= 0 || r < 0) return calcError('Retirement age must exceed current age.');
      const yrs = retAge - age;
      const fiTarget = spend / swr;
      const coastNumber = fiTarget / Math.pow(1 + r, yrs);
      const fvWithZeroSavings = cur * Math.pow(1 + r, yrs);
      const gap = coastNumber - cur;
      return {
        primaryValue: fmt(coastNumber, 2),
        primaryUnit: '$',
        primaryLabel: `Coast FIRE Number @ Age ${age}`,
        secondaryOutputs: [
          { label: 'Full FI Target (Today’s $)', value: `$${money(fiTarget)}` },
          { label: 'Status vs Coast Target', value: gap <= 0 ? 'Coast FIRE Reached!' : `$${money(gap)} remaining` },
          { label: `Projected Balance @ ${retAge} ($0 new savings)`, value: `$${money(fvWithZeroSavings)}` },
        ],
        steps: [
          `Full FI Target = $${money(spend)} ÷ ${fmt(swr * 100, 2)}% = $${money(fiTarget)}.`,
          `Discounted back ${yrs} yrs @ ${fmt(r * 100, 2)}% real = $${money(coastNumber)}.`,
        ],
      };
    },
  },

  // 570. 4% Rule & Safe Withdrawal Rate Calculator
  {
    slug: '4-percent-rule-safe-withdrawal-calculator',
    title: '4% Rule & Safe Withdrawal Rate (SWR) Calculator',
    category: 'finance',
    formulaDisplay: 'Year 1 Withdrawal = Portfolio × SWR   |   Required Nest Egg = Annual Spend / SWR',
    inputs: [
      { id: 'portfolio', label: 'Retirement Portfolio Balance', type: 'number', prefix: '$', defaultValue: 1250000, min: 0, max: 1e12, step: 10000 },
      { id: 'swrPct', label: 'Initial Withdrawal Rate', type: 'number', unit: '%', defaultValue: 4.0, min: 1, max: 12, step: 0.25 },
      { id: 'returnPct', label: 'Nominal Portfolio Return', type: 'number', unit: '%', defaultValue: 7.0, min: -10, max: 25, step: 0.25 },
      { id: 'inflationPct', label: 'Annual Inflation COLA', type: 'number', unit: '%', defaultValue: 2.5, min: 0, max: 15, step: 0.25 },
      { id: 'years', label: 'Retirement Duration', type: 'number', unit: 'years', defaultValue: 30, min: 5, max: 60, step: 1 },
    ],
    calculate: (v) => {
      const port0 = parseNum(v.portfolio);
      const swr = parseNum(v.swrPct) / 100;
      const ret = parseNum(v.returnPct) / 100;
      const inf = parseNum(v.inflationPct) / 100;
      const yrs = Math.min(Math.round(parseNum(v.years)), 60);
      if ([port0, swr, ret, inf, yrs].some(Number.isNaN)) return calcError('Enter valid SWR inputs.');
      if (port0 < 0 || swr <= 0 || yrs <= 0) return calcError('Portfolio must be non-negative and SWR/years positive.');
      const yr1Annual = port0 * swr;
      const yr1Monthly = yr1Annual / 12;
      let bal = port0;
      let depletedYear: number | null = null;
      for (let y = 1; y <= yrs; y++) {
        const wd = yr1Annual * Math.pow(1 + inf, y - 1);
        bal = bal * (1 + ret) - wd;
        if (bal <= 0 && depletedYear === null) {
          depletedYear = y;
          bal = 0;
        }
      }
      return {
        primaryValue: fmt(yr1Annual, 2),
        primaryUnit: '$ / year',
        primaryLabel: 'Year 1 Inflation-Adjusted Withdrawal',
        secondaryOutputs: [
          { label: 'Year 1 Monthly Income', value: `$${money(yr1Monthly)} / mo` },
          { label: `Ending Balance (Year ${yrs})`, value: `$${money(Math.max(0, bal))}` },
          { label: 'Sustainability Status', value: depletedYear ? `Depleted in Year ${depletedYear}` : `Sustained Full ${yrs} Years` },
        ],
        steps: [
          `Year 1 withdrawal = $${money(port0)} × ${fmt(swr * 100, 2)}% = $${money(yr1Annual)} ($${money(yr1Monthly)}/mo).`,
          `Compounding at ${fmt(ret * 100, 2)}% with ${fmt(inf * 100, 2)}% withdrawal inflation ends Year ${yrs} at $${money(Math.max(0, bal))}.`,
        ],
      };
    },
  },

  // 571. Biweekly Mortgage Savings Calculator
  {
    slug: 'biweekly-mortgage-savings-calculator',
    title: 'Biweekly Mortgage Payment & Interest Savings Calculator',
    category: 'finance',
    formulaDisplay: '26 Half-Payments/yr = 13 Full Monthly Payments/yr',
    inputs: [
      { id: 'loanAmount', label: 'Mortgage Principal Balance', type: 'number', prefix: '$', defaultValue: 400000, min: 1000, max: 1e10, step: 5000 },
      { id: 'aprPct', label: 'Mortgage Interest Rate', type: 'number', unit: '%', defaultValue: 6.25, min: 0.01, max: 30, step: 0.125 },
      { id: 'termYears', label: 'Remaining Loan Term', type: 'number', unit: 'years', defaultValue: 30, min: 1, max: 50, step: 1 },
    ],
    calculate: (v) => {
      const P = parseNum(v.loanAmount);
      const apr = parseNum(v.aprPct) / 100;
      const yrs = parseNum(v.termYears);
      if ([P, apr, yrs].some(Number.isNaN)) return calcError('Enter valid mortgage parameters.');
      if (P <= 0 || apr < 0 || yrs <= 0) return calcError('Loan amount and term must be positive.');
      const nMo = Math.min(Math.round(yrs * 12), 600);
      const rm = apr / 12;
      const monthlyPmt = rm === 0 ? P / nMo : (P * rm) / (1 - Math.pow(1 + rm, -nMo));
      const stdInterest = monthlyPmt * nMo - P;
      const biweeklyPmt = monthlyPmt / 2;

      let bal = P;
      let biweeklyPeriods = 0;
      let biweeklyInterest = 0;
      const rBw = apr / 26;
      while (bal > 0.01 && biweeklyPeriods < 1500) {
        const interest = bal * rBw;
        const principalPaid = Math.min(bal, biweeklyPmt - interest);
        if (principalPaid <= 0) break;
        bal -= principalPaid;
        biweeklyInterest += interest;
        biweeklyPeriods++;
      }
      const biweeklyYears = biweeklyPeriods / 26;
      const yearsSaved = Math.max(0, yrs - biweeklyYears);
      const interestSaved = Math.max(0, stdInterest - biweeklyInterest);
      return {
        primaryValue: fmt(interestSaved, 2),
        primaryUnit: '$',
        primaryLabel: 'Total Mortgage Interest Saved',
        secondaryOutputs: [
          { label: 'Time Shaved Off Mortgage', value: `${fmt(yearsSaved, 2)} years` },
          { label: 'Biweekly Payment (26/yr)', value: `$${money(biweeklyPmt)}` },
          { label: 'Standard Monthly Payment', value: `$${money(monthlyPmt)}` },
          { label: 'Payoff Timeline (Biweekly)', value: `${fmt(biweeklyYears, 2)} years` },
        ],
        steps: [
          `Standard monthly P&I = $${money(monthlyPmt)} (Total interest = $${money(stdInterest)}).`,
          `Paying $${money(biweeklyPmt)} every 2 weeks pays off in ${fmt(biweeklyYears, 2)} yrs, saving $${money(interestSaved)}.`,
        ],
      };
    },
  },

  // 572. PMI Removal LTV Calculator
  {
    slug: 'pmi-removal-ltv-calculator',
    title: 'Mortgage PMI Cost & 80% LTV Cancellation Calculator',
    category: 'finance',
    formulaDisplay: 'Target Balance = Current Home Value × 0.80',
    inputs: [
      { id: 'homeValue', label: 'Current Appraised / Purchase Value', type: 'number', prefix: '$', defaultValue: 450000, min: 10000, max: 1e10, step: 5000 },
      { id: 'loanBalance', label: 'Current Mortgage Balance', type: 'number', prefix: '$', defaultValue: 405000, min: 0, max: 1e10, step: 1000 },
      { id: 'aprPct', label: 'Mortgage Interest Rate', type: 'number', unit: '%', defaultValue: 6.5, min: 0.1, max: 25, step: 0.125 },
      { id: 'pmiRatePct', label: 'Annual PMI Rate', type: 'number', unit: '%', defaultValue: 0.65, min: 0.1, max: 3.0, step: 0.05 },
      { id: 'remainingYears', label: 'Remaining Term', type: 'number', unit: 'years', defaultValue: 29, min: 1, max: 40, step: 1 },
    ],
    calculate: (v) => {
      const val = parseNum(v.homeValue);
      const bal0 = parseNum(v.loanBalance);
      const apr = parseNum(v.aprPct) / 100;
      const pmiRate = parseNum(v.pmiRatePct) / 100;
      const yrs = parseNum(v.remainingYears);
      if ([val, bal0, apr, pmiRate, yrs].some(Number.isNaN)) return calcError('Enter valid numeric PMI inputs.');
      if (val <= 0 || bal0 < 0 || yrs <= 0) return calcError('Home value and term must be positive.');
      const currentLtv = (bal0 / val) * 100;
      const target80 = val * 0.8;
      const principalToDrop80 = Math.max(0, bal0 - target80);
      const monthlyPmi = (bal0 * pmiRate) / 12;
      const rm = apr / 12;
      const n = Math.min(Math.round(yrs * 12), 480);
      const pi = rm === 0 ? bal0 / n : (bal0 * rm) / (1 - Math.pow(1 + rm, -n));
      let b = bal0;
      let monthsTo80 = 0;
      while (b > target80 && monthsTo80 < 600) {
        const interest = b * rm;
        const pPaid = pi - interest;
        if (pPaid <= 0) break;
        b -= pPaid;
        monthsTo80++;
      }
      return {
        primaryValue: fmt(monthlyPmi, 2),
        primaryUnit: '$ / month',
        primaryLabel: currentLtv <= 80 ? 'Monthly PMI ($0 Eligible)' : 'Current Monthly PMI Cost',
        secondaryOutputs: [
          { label: 'Current LTV Ratio', value: `${fmt(currentLtv, 2)}%` },
          { label: '80% LTV Target Balance', value: `$${money(target80)}` },
          { label: 'Principal Needed to Drop PMI', value: `$${money(principalToDrop80)}` },
          { label: 'Months to 80% LTV (Scheduled)', value: currentLtv <= 80 ? '0 months (Eligible now)' : `${monthsTo80} mo (${fmt(monthsTo80 / 12, 1)} yrs)` },
        ],
        steps: [
          `Current LTV = $${money(bal0)} ÷ $${money(val)} = ${fmt(currentLtv, 2)}%.`,
          `Target 80% LTV balance = $${money(target80)} (Remaining paydown needed = $${money(principalToDrop80)}).`,
        ],
      };
    },
  },

  // 573. FHA Mortgage MIP Calculator
  {
    slug: 'fha-mortgage-mip-calculator',
    title: 'FHA Mortgage Payment & MIP Calculator',
    category: 'finance',
    formulaDisplay: 'Financed Base = Base Loan × 1.0175 (1.75% UFMIP)',
    inputs: [
      { id: 'homePrice', label: 'Home Purchase Price', type: 'number', prefix: '$', defaultValue: 380000, min: 10000, max: 1e9, step: 5000 },
      { id: 'downPaymentPct', label: 'Down Payment', type: 'number', unit: '%', defaultValue: 3.5, min: 3.5, max: 50, step: 0.5 },
      { id: 'aprPct', label: 'FHA Note Rate', type: 'number', unit: '%', defaultValue: 6.0, min: 0.1, max: 25, step: 0.125 },
      { id: 'termYears', label: 'Loan Term', type: 'number', unit: 'years', defaultValue: 30, min: 10, max: 30, step: 5 },
      { id: 'annualMipPct', label: 'Annual FHA MIP Rate', type: 'number', unit: '%', defaultValue: 0.55, min: 0.15, max: 1.05, step: 0.05, helpText: 'Standard 2026 HUD annual MIP is 0.55% for most >95% LTV 30-year loans.' },
    ],
    calculate: (v) => {
      const price = parseNum(v.homePrice);
      const dpPct = parseNum(v.downPaymentPct) / 100;
      const apr = parseNum(v.aprPct) / 100;
      const yrs = parseNum(v.termYears);
      const mipRate = parseNum(v.annualMipPct) / 100;
      if ([price, dpPct, apr, yrs, mipRate].some(Number.isNaN)) return calcError('Enter valid FHA loan parameters.');
      if (price <= 0 || dpPct < 0 || dpPct >= 1 || yrs <= 0) return calcError('Home price and term must be positive.');
      const baseLoan = price * (1 - dpPct);
      const ufmip = baseLoan * 0.0175;
      const financedLoan = baseLoan + ufmip;
      const rm = apr / 12;
      const n = Math.round(yrs * 12);
      const pi = rm === 0 ? financedLoan / n : (financedLoan * rm) / (1 - Math.pow(1 + rm, -n));
      const monthlyMip = (baseLoan * mipRate) / 12;
      const totalMonthly = pi + monthlyMip;
      return {
        primaryValue: fmt(totalMonthly, 2),
        primaryUnit: '$ / month',
        primaryLabel: 'Monthly FHA P&I + MIP',
        secondaryOutputs: [
          { label: 'Upfront FHA MIP (1.75%)', value: `$${money(ufmip)}` },
          { label: 'Total Financed Loan', value: `$${money(financedLoan)}` },
          { label: 'Monthly P&I Only', value: `$${money(pi)}` },
          { label: 'Monthly Annual MIP', value: `$${money(monthlyMip)}` },
        ],
        steps: [
          `Base loan = $${money(baseLoan)}; 1.75% UFMIP = $${money(ufmip)} → Financed = $${money(financedLoan)}.`,
          `Monthly P&I = $${money(pi)} + Monthly MIP ($${money(monthlyMip)}) = $${money(totalMonthly)}.`,
        ],
      };
    },
  },

  // 574. VA Loan Funding Fee Calculator
  {
    slug: 'va-loan-funding-fee-calculator',
    title: 'VA Mortgage Payment & Funding Fee Calculator (2026)',
    category: 'finance',
    formulaDisplay: 'Financed Loan = Base Loan × (1 + FundingFeeRate)',
    inputs: [
      { id: 'homePrice', label: 'Home Purchase Price', type: 'number', prefix: '$', defaultValue: 450000, min: 10000, max: 1e9, step: 5000 },
      { id: 'downPaymentPct', label: 'Down Payment', type: 'number', unit: '%', defaultValue: 0, min: 0, max: 50, step: 1 },
      {
        id: 'useHistory',
        label: 'VA Loan Entitlement Usage',
        type: 'select',
        defaultValue: 'first',
        options: [
          { label: 'First-Time VA Use (2.15% at <5% down)', value: 'first' },
          { label: 'Subsequent VA Use (3.30% at <5% down)', value: 'subsequent' },
          { label: 'Service-Connected Exempt (0.00%)', value: 'exempt' },
        ],
      },
      { id: 'aprPct', label: 'VA Note Rate', type: 'number', unit: '%', defaultValue: 5.75, min: 0.1, max: 25, step: 0.125 },
      { id: 'termYears', label: 'Loan Term', type: 'number', unit: 'years', defaultValue: 30, min: 10, max: 30, step: 5 },
    ],
    calculate: (v) => {
      const price = parseNum(v.homePrice);
      const dpPct = parseNum(v.downPaymentPct ?? 0);
      const use = String(v.useHistory || 'first');
      const apr = parseNum(v.aprPct) / 100;
      const yrs = parseNum(v.termYears);
      if ([price, dpPct, apr, yrs].some(Number.isNaN)) return calcError('Enter valid VA loan inputs.');
      if (price <= 0 || dpPct < 0 || dpPct >= 100 || yrs <= 0) return calcError('Home price and term must be positive.');
      let feeRate = 0;
      if (use !== 'exempt') {
        if (dpPct >= 10) feeRate = 0.0125;
        else if (dpPct >= 5) feeRate = 0.015;
        else feeRate = use === 'subsequent' ? 0.033 : 0.0215;
      }
      const baseLoan = price * (1 - dpPct / 100);
      const fundingFee = baseLoan * feeRate;
      const financed = baseLoan + fundingFee;
      const rm = apr / 12;
      const n = Math.round(yrs * 12);
      const pmt = rm === 0 ? financed / n : (financed * rm) / (1 - Math.pow(1 + rm, -n));
      return {
        primaryValue: fmt(pmt, 2),
        primaryUnit: '$ / month',
        primaryLabel: 'Monthly VA Principal & Interest',
        secondaryOutputs: [
          { label: 'Applied Funding Fee Rate', value: `${fmt(feeRate * 100, 2)}%` },
          { label: 'VA Funding Fee Amount', value: `$${money(fundingFee)}` },
          { label: 'Financed Loan Balance', value: `$${money(financed)}` },
          { label: 'Monthly PMI Required', value: '$0.00 (VA loans carry no PMI)' },
        ],
        steps: [
          `Base loan = $${money(baseLoan)}; 2026 VA Funding Fee (${fmt(feeRate * 100, 2)}%) = $${money(fundingFee)}.`,
          `Financed balance = $${money(financed)} → Monthly P&I = $${money(pmt)} with $0 monthly PMI.`,
        ],
      };
    },
  },

  // 575. Cap Rate Real Estate Calculator
  {
    slug: 'cap-rate-real-estate-calculator',
    title: 'Real Estate Cap Rate, NOI & GRM Calculator',
    category: 'finance',
    formulaDisplay: 'Cap Rate = NOI / Property Value   |   NOI = EGI − Operating Expenses',
    inputs: [
      { id: 'propertyPrice', label: 'Property Purchase Price / Value', type: 'number', prefix: '$', defaultValue: 650000, min: 1000, max: 1e11, step: 5000 },
      { id: 'grossAnnualRent', label: 'Gross Scheduled Annual Rent', type: 'number', prefix: '$', defaultValue: 66000, min: 0, max: 1e10, step: 1000 },
      { id: 'vacancyPct', label: 'Vacancy & Credit Loss', type: 'number', unit: '%', defaultValue: 5, min: 0, max: 90, step: 0.5 },
      { id: 'annualOpEx', label: 'Annual Operating Expenses (Excl. Debt)', type: 'number', prefix: '$', defaultValue: 18500, min: 0, max: 1e10, step: 500 },
    ],
    calculate: (v) => {
      const price = parseNum(v.propertyPrice);
      const rent = parseNum(v.grossAnnualRent);
      const vac = parseNum(v.vacancyPct) / 100;
      const opex = parseNum(v.annualOpEx);
      if ([price, rent, vac, opex].some(Number.isNaN)) return calcError('Enter valid property income and expense numbers.');
      if (price <= 0 || rent < 0 || vac < 0 || vac >= 1 || opex < 0) return calcError('Property price must be positive.');
      const egi = rent * (1 - vac);
      const noi = egi - opex;
      const capRate = (noi / price) * 100;
      const grm = rent > 0 ? price / rent : 0;
      const oer = egi > 0 ? (opex / egi) * 100 : 0;
      return {
        primaryValue: fmt(capRate, 2),
        primaryUnit: '%',
        primaryLabel: 'Property Capitalization Rate',
        secondaryOutputs: [
          { label: 'Net Operating Income (NOI)', value: `$${money(noi)} / yr` },
          { label: 'Effective Gross Income (EGI)', value: `$${money(egi)}` },
          { label: 'Gross Rent Multiplier (GRM)', value: `${fmt(grm, 2)}×` },
          { label: 'Operating Expense Ratio', value: `${fmt(oer, 1)}%` },
        ],
        steps: [
          `Effective Gross Income = $${money(rent)} × (1 − ${fmt(vac * 100, 1)}%) = $${money(egi)}.`,
          `NOI = $${money(egi)} − $${money(opex)} = $${money(noi)} → Cap Rate = ${fmt(capRate, 2)}%.`,
        ],
      };
    },
  },

  // 576. Cash-on-Cash Return Calculator
  {
    slug: 'cash-on-cash-return-calculator',
    title: 'Real Estate Cash-on-Cash Return Calculator',
    category: 'finance',
    formulaDisplay: 'CoC Return = Annual Pre-Tax Cash Flow / Total Cash Invested',
    inputs: [
      { id: 'totalCashInvested', label: 'Total Cash Invested (Down + Closing + Rehab)', type: 'number', prefix: '$', defaultValue: 95000, min: 1, max: 1e11, step: 1000 },
      { id: 'annualNoi', label: 'Annual Net Operating Income (NOI)', type: 'number', prefix: '$', defaultValue: 26400, min: -1e9, max: 1e10, step: 500 },
      { id: 'annualDebtService', label: 'Annual Mortgage Debt Service (P&I)', type: 'number', prefix: '$', defaultValue: 18600, min: 0, max: 1e10, step: 500 },
      { id: 'year1PrincipalPaydown', label: 'Year 1 Loan Principal Paydown', type: 'number', prefix: '$', defaultValue: 4100, min: 0, max: 1e9, step: 100, advanced: true },
    ],
    calculate: (v) => {
      const cash = parseNum(v.totalCashInvested);
      const noi = parseNum(v.annualNoi);
      const debt = parseNum(v.annualDebtService);
      const paydown = parseNum(v.year1PrincipalPaydown ?? 0);
      if ([cash, noi, debt, paydown].some(Number.isNaN)) return calcError('Enter valid cash-on-cash values.');
      if (cash <= 0 || debt < 0) return calcError('Total cash invested must be positive.');
      const cashFlow = noi - debt;
      const coc = (cashFlow / cash) * 100;
      const dscr = debt > 0 ? noi / debt : 99;
      const totalYear1Return = ((cashFlow + paydown) / cash) * 100;
      return {
        primaryValue: fmt(coc, 2),
        primaryUnit: '%',
        primaryLabel: 'Annual Cash-on-Cash Return',
        secondaryOutputs: [
          { label: 'Annual Pre-Tax Cash Flow', value: `$${money(cashFlow)}` },
          { label: 'Monthly Cash Flow', value: `$${money(cashFlow / 12)}` },
          { label: 'Debt Service Coverage (DSCR)', value: debt > 0 ? `${fmt(dscr, 2)}×` : 'Unlevered' },
          { label: 'Return Incl. Principal Paydown', value: `${fmt(totalYear1Return, 2)}%` },
        ],
        steps: [
          `Pre-tax cash flow = $${money(noi)} − $${money(debt)} = $${money(cashFlow)}/yr.`,
          `CoC Return = $${money(cashFlow)} ÷ $${money(cash)} = ${fmt(coc, 2)}%.`,
        ],
      };
    },
  },

  // 577. BRRRR Real Estate Calculator
  {
    slug: 'brrrr-real-estate-calculator',
    title: 'BRRRR Real Estate Refinance Calculator',
    category: 'finance',
    formulaDisplay: 'Cash Left = All-In Cost − (ARV × Refi LTV − Refi Closing Costs)',
    inputs: [
      { id: 'purchasePrice', label: 'Purchase Price', type: 'number', prefix: '$', defaultValue: 185000, min: 1000, max: 1e10, step: 5000 },
      { id: 'rehabCost', label: 'Rehab & Holding Budget', type: 'number', prefix: '$', defaultValue: 45000, min: 0, max: 1e10, step: 1000 },
      { id: 'closingBuy', label: 'Acquisition Closing Costs', type: 'number', prefix: '$', defaultValue: 5500, min: 0, max: 1e9, step: 500 },
      { id: 'arv', label: 'After-Repair Value (ARV)', type: 'number', prefix: '$', defaultValue: 310000, min: 1000, max: 1e10, step: 5000 },
      { id: 'refiLtvPct', label: 'Cash-Out Refinance LTV', type: 'number', unit: '%', defaultValue: 75, min: 20, max: 90, step: 5 },
      { id: 'refiCosts', label: 'Refinance Closing Costs', type: 'number', prefix: '$', defaultValue: 4500, min: 0, max: 1e9, step: 500 },
    ],
    calculate: (v) => {
      const p = parseNum(v.purchasePrice);
      const rehab = parseNum(v.rehabCost);
      const cb = parseNum(v.closingBuy);
      const arv = parseNum(v.arv);
      const ltv = parseNum(v.refiLtvPct) / 100;
      const rc = parseNum(v.refiCosts);
      if ([p, rehab, cb, arv, ltv, rc].some(Number.isNaN)) return calcError('Enter valid BRRRR deal values.');
      if (p <= 0 || arv <= 0 || ltv <= 0) return calcError('Purchase price, ARV, and LTV must be positive.');
      const allIn = p + rehab + cb;
      const newLoan = arv * ltv;
      const netRefiProceeds = newLoan - rc;
      const cashLeftInDeal = allIn - netRefiProceeds;
      const forcedEquity = arv - allIn;
      const pctCapitalRecycled = (netRefiProceeds / allIn) * 100;
      return {
        primaryValue: fmt(cashLeftInDeal, 2),
        primaryUnit: '$',
        primaryLabel: cashLeftInDeal <= 0 ? 'Cash-Out Surplus Beyond All-In' : 'Net Capital Left in Deal',
        secondaryOutputs: [
          { label: 'Total All-In Project Cost', value: `$${money(allIn)}` },
          { label: 'New Refinance Loan Amount', value: `$${money(newLoan)}` },
          { label: 'Forced Equity Created', value: `$${money(forcedEquity)}` },
          { label: 'Capital Recycled at Refi', value: `${fmt(pctCapitalRecycled, 1)}%` },
        ],
        steps: [
          `All-in cost = $${money(p)} + $${money(rehab)} + $${money(cb)} = $${money(allIn)}.`,
          `Net refi proceeds = ($${money(arv)} × ${fmt(ltv * 100, 0)}%) − $${money(rc)} = $${money(netRefiProceeds)}.`,
          `Net cash left in deal = $${money(cashLeftInDeal)} (Post-refi equity = $${money(arv - newLoan)}).`,
        ],
      };
    },
  },

  // 578. 1031 Exchange Equity Calculator
  {
    slug: '1031-exchange-equity-calculator',
    title: 'IRS Section 1031 Exchange Equity & Boot Calculator',
    category: 'finance',
    formulaDisplay: 'Full Deferral: Replacement Price >= Relinquished Net Sale & All Equity Reinvested',
    inputs: [
      { id: 'salePrice', label: 'Relinquished Property Sale Price', type: 'number', prefix: '$', defaultValue: 850000, min: 1000, max: 1e11, step: 10000 },
      { id: 'sellingCosts', label: 'Broker Commissions & Exchange Fees', type: 'number', prefix: '$', defaultValue: 48000, min: 0, max: 1e10, step: 1000 },
      { id: 'mortgagePayoff', label: 'Existing Mortgage Payoff', type: 'number', prefix: '$', defaultValue: 320000, min: 0, max: 1e11, step: 5000 },
      { id: 'replacementPrice', label: 'Replacement Property Price', type: 'number', prefix: '$', defaultValue: 920000, min: 0, max: 1e11, step: 10000 },
      { id: 'newMortgage', label: 'New Replacement Mortgage', type: 'number', prefix: '$', defaultValue: 420000, min: 0, max: 1e11, step: 5000 },
    ],
    calculate: (v) => {
      const sale = parseNum(v.salePrice);
      const fees = parseNum(v.sellingCosts);
      const oldDebt = parseNum(v.mortgagePayoff);
      const repPrice = parseNum(v.replacementPrice);
      const newDebt = parseNum(v.newMortgage);
      if ([sale, fees, oldDebt, repPrice, newDebt].some(Number.isNaN)) return calcError('Enter valid Section 1031 exchange amounts.');
      if (sale <= 0 || fees < 0 || oldDebt < 0 || repPrice < 0 || newDebt < 0) return calcError('Values cannot be negative.');
      const netSale = sale - fees;
      const netEquity = Math.max(0, netSale - oldDebt);
      const cashInvestedInNew = Math.max(0, repPrice - newDebt);
      const cashBoot = Math.max(0, netEquity - cashInvestedInNew);
      const mortgageBoot = Math.max(0, oldDebt - newDebt);
      const netTaxableBoot = Math.max(cashBoot, Math.max(0, netSale - repPrice));
      return {
        primaryValue: fmt(netEquity, 2),
        primaryUnit: '$',
        primaryLabel: 'Minimum Equity to Reinvest',
        secondaryOutputs: [
          { label: 'Net Relinquished Sale (Reinvest Target)', value: `$${money(netSale)}` },
          { label: 'Estimated Cash Boot', value: `$${money(cashBoot)}` },
          { label: 'Debt Relief (Mortgage Boot)', value: `$${money(mortgageBoot)}` },
          { label: 'Deferral Compliance', value: netTaxableBoot <= 0 ? '100% Qualified Tax Deferral' : `Taxable Boot Exposure: $${money(netTaxableBoot)}` },
        ],
        steps: [
          `Net relinquished sale = $${money(netSale)}; net equity = $${money(netEquity)}.`,
          `Replacement property ($${money(repPrice)}) with $${money(newDebt)} debt requires $${money(cashInvestedInNew)} cash → Taxable boot exposure = $${money(netTaxableBoot)}.`,
        ],
      };
    },
  },

  // 579. House Hacking Cash Flow Calculator
  {
    slug: 'house-hacking-cash-flow-calculator',
    title: 'House Hacking Multi-Unit Net Living Cost Calculator',
    category: 'finance',
    formulaDisplay: 'Net Housing Cost = PITI + Maintenance − Roommate/Unit Rent',
    inputs: [
      { id: 'monthlyPiti', label: 'Total Monthly Mortgage (PITI + HOA)', type: 'number', prefix: '$', defaultValue: 3150, min: 0, max: 1e8, step: 50 },
      { id: 'monthlyMaintenance', label: 'Monthly CapEx & Maintenance Reserve', type: 'number', prefix: '$', defaultValue: 300, min: 0, max: 1e7, step: 25 },
      { id: 'rentalIncome', label: 'Gross Monthly Rents from Other Units/Rooms', type: 'number', prefix: '$', defaultValue: 2450, min: 0, max: 1e8, step: 50 },
      { id: 'vacancyPct', label: 'Vacancy Allowance on Rented Units', type: 'number', unit: '%', defaultValue: 5, min: 0, max: 80, step: 1 },
      { id: 'marketRentEquivalent', label: 'Comparable Rent You Would Otherwise Pay', type: 'number', prefix: '$', defaultValue: 1850, min: 0, max: 1e7, step: 50 },
    ],
    calculate: (v) => {
      const piti = parseNum(v.monthlyPiti);
      const maint = parseNum(v.monthlyMaintenance);
      const rent = parseNum(v.rentalIncome);
      const vac = parseNum(v.vacancyPct) / 100;
      const altRent = parseNum(v.marketRentEquivalent);
      if ([piti, maint, rent, vac, altRent].some(Number.isNaN)) return calcError('Enter valid house hacking numbers.');
      if (piti < 0 || maint < 0 || rent < 0 || vac < 0 || vac >= 1) return calcError('Expenses and rent cannot be negative.');
      const effRent = rent * (1 - vac);
      const netCost = piti + maint - effRent;
      const monthlySavingsVsRenting = altRent - netCost;
      return {
        primaryValue: fmt(netCost, 2),
        primaryUnit: '$ / month',
        primaryLabel: netCost <= 0 ? 'Net Monthly Cash Profit' : 'Net Out-of-Pocket Housing Cost',
        secondaryOutputs: [
          { label: 'Effective Rental Offset', value: `$${money(effRent)} / mo` },
          { label: 'Monthly Savings vs Renting', value: `$${money(monthlySavingsVsRenting)} / mo` },
          { label: 'Annual Housing Savings', value: `$${money(monthlySavingsVsRenting * 12)} / yr` },
          { label: 'Expense Offset Ratio', value: piti + maint > 0 ? `${fmt((effRent / (piti + maint)) * 100, 1)}%` : '0%' },
        ],
        steps: [
          `Total housing outflow = $${money(piti + maint)}/mo; effective rental income = $${money(effRent)}/mo.`,
          `Net living cost = $${money(netCost)}/mo (vs $${money(altRent)}/mo market rent = $${money(monthlySavingsVsRenting)}/mo saved).`,
        ],
      };
    },
  },

  // 580. Home Closing Costs Estimator
  {
    slug: 'closing-costs-estimator-calculator',
    title: 'Home Buyer & Seller Closing Costs Estimator',
    category: 'finance',
    formulaDisplay: 'Buyer Cash = Down Payment + Loan/Title/Prepaid Costs   |   Seller Net = Price − Payoff − Commission − Closing',
    inputs: [
      {
        id: 'role',
        label: 'Transaction Role',
        type: 'select',
        defaultValue: 'buyer',
        options: [
          { label: 'Home Buyer Cash-to-Close', value: 'buyer' },
          { label: 'Home Seller Net Proceeds', value: 'seller' },
        ],
      },
      { id: 'homePrice', label: 'Property Contract Price', type: 'number', prefix: '$', defaultValue: 450000, min: 1000, max: 1e11, step: 5000 },
      { id: 'downPct', label: 'Down Payment %', type: 'number', unit: '%', defaultValue: 20, min: 0, max: 100, step: 1, visibleWhen: (v) => String(v.role || 'buyer') === 'buyer' },
      { id: 'buyerCostPct', label: 'Buyer Loan, Title & Escrow %', type: 'number', unit: '%', defaultValue: 3.2, min: 0, max: 15, step: 0.2, visibleWhen: (v) => String(v.role || 'buyer') === 'buyer' },
      { id: 'mortgagePayoff', label: 'Remaining Mortgage Payoff', type: 'number', prefix: '$', defaultValue: 210000, min: 0, max: 1e11, step: 5000, visibleWhen: (v) => String(v.role || 'buyer') === 'seller' },
      { id: 'agentCommissionPct', label: 'Total Agent Commission %', type: 'number', unit: '%', defaultValue: 5.0, min: 0, max: 15, step: 0.25, visibleWhen: (v) => String(v.role || 'buyer') === 'seller' },
      { id: 'sellerClosingPct', label: 'Transfer Tax, Title & Attorney %', type: 'number', unit: '%', defaultValue: 1.5, min: 0, max: 10, step: 0.1, visibleWhen: (v) => String(v.role || 'buyer') === 'seller' },
      { id: 'creditsOrConcessions', label: 'Seller Credit / Repair Concession', type: 'number', prefix: '$', defaultValue: 0, min: 0, max: 1e9, step: 500 },
    ],
    calculate: (v) => {
      const role = String(v.role || 'buyer');
      const price = parseNum(v.homePrice);
      const credits = parseNum(v.creditsOrConcessions ?? 0);
      if (Number.isNaN(price) || price <= 0 || Number.isNaN(credits) || credits < 0) return calcError('Enter valid property price and credits.');
      if (role === 'buyer') {
        const dpPct = parseNum(v.downPct ?? 20) / 100;
        const bcPct = parseNum(v.buyerCostPct ?? 3.2) / 100;
        if (Number.isNaN(dpPct) || Number.isNaN(bcPct) || dpPct < 0 || dpPct > 1 || bcPct < 0) return calcError('Invalid buyer percentages.');
        const dp = price * dpPct;
        const closing = price * bcPct;
        const cashToClose = Math.max(0, dp + closing - credits);
        return {
          primaryValue: fmt(cashToClose, 2),
          primaryUnit: '$',
          primaryLabel: 'Estimated Buyer Cash to Close',
          secondaryOutputs: [
            { label: 'Down Payment', value: `$${money(dp)}` },
            { label: 'Closing & Prepaid Costs', value: `$${money(closing)}` },
            { label: 'Loan Amount', value: `$${money(price - dp)}` },
          ],
          steps: [
            `Down payment = $${money(dp)}; closing/escrow (${fmt(bcPct * 100, 1)}%) = $${money(closing)}.`,
            `Net cash to close after $${money(credits)} credits = $${money(cashToClose)}.`,
          ],
        };
      }
      const payoff = parseNum(v.mortgagePayoff ?? 0);
      const commPct = parseNum(v.agentCommissionPct ?? 5) / 100;
      const scPct = parseNum(v.sellerClosingPct ?? 1.5) / 100;
      if ([payoff, commPct, scPct].some(Number.isNaN) || payoff < 0 || commPct < 0 || scPct < 0) return calcError('Invalid seller closing inputs.');
      const comm = price * commPct;
      const otherClosing = price * scPct;
      const netProceeds = price - payoff - comm - otherClosing - credits;
      return {
        primaryValue: fmt(netProceeds, 2),
        primaryUnit: '$',
        primaryLabel: 'Estimated Seller Net Proceeds',
        secondaryOutputs: [
          { label: 'Agent Commissions', value: `$${money(comm)}` },
          { label: 'Title, Transfer & Escrow Fees', value: `$${money(otherClosing)}` },
          { label: 'Mortgage Payoff', value: `$${money(payoff)}` },
        ],
        steps: [
          `Total selling costs = $${money(comm + otherClosing + credits)}; payoff = $${money(payoff)}.`,
          `Seller net proceeds = $${money(netProceeds)}.`,
        ],
      };
    },
  },

  // 581. HECM Reverse Mortgage Estimator
  {
    slug: 'reverse-mortgage-hecm-calculator',
    title: 'HECM Reverse Mortgage Principal Limit Calculator',
    category: 'finance',
    formulaDisplay: 'Net Proceeds = min(Value, FHA Limit) × PLF − Existing Mortgage − Closing Costs',
    inputs: [
      { id: 'homeValue', label: 'Appraised Home Value', type: 'number', prefix: '$', defaultValue: 550000, min: 50000, max: 1e10, step: 10000 },
      { id: 'youngestAge', label: 'Youngest Borrower Age (Min 62)', type: 'number', unit: 'yrs', defaultValue: 72, min: 62, max: 99, step: 1 },
      { id: 'existingMortgage', label: 'Existing Mortgage to Pay Off', type: 'number', prefix: '$', defaultValue: 85000, min: 0, max: 1e10, step: 5000 },
      { id: 'expectedRatePct', label: 'Expected HECM Interest Rate', type: 'number', unit: '%', defaultValue: 6.25, min: 3.0, max: 12.0, step: 0.25 },
      { id: 'upfrontFees', label: 'Initial 2% MIP + Origination/Closing', type: 'number', prefix: '$', defaultValue: 18500, min: 0, max: 200000, step: 500 },
    ],
    calculate: (v) => {
      const val = parseNum(v.homeValue);
      const age = parseNum(v.youngestAge);
      const debt = parseNum(v.existingMortgage);
      const rate = parseNum(v.expectedRatePct);
      const fees = parseNum(v.upfrontFees);
      if ([val, age, debt, rate, fees].some(Number.isNaN)) return calcError('Enter valid HECM reverse mortgage parameters.');
      if (age < 62 || val <= 0 || debt < 0 || fees < 0) return calcError('Youngest borrower must be at least 62 and values non-negative.');
      const fhaLimit2026 = 1209750; // 2025/2026 HUD HECM lending limit floor
      const maxClaim = Math.min(val, fhaLimit2026);
      const plf = Math.max(0.28, Math.min(0.75, 0.42 + (age - 62) * 0.0085 - (rate - 5.5) * 0.04));
      const principalLimit = maxClaim * plf;
      const netAvailable = Math.max(0, principalLimit - debt - fees);
      return {
        primaryValue: fmt(netAvailable, 2),
        primaryUnit: '$',
        primaryLabel: 'Estimated Net HECM Proceeds / Line',
        secondaryOutputs: [
          { label: 'Principal Limit Factor (Est. PLF)', value: `${fmt(plf * 100, 1)}%` },
          { label: 'Gross Principal Limit', value: `$${money(principalLimit)}` },
          { label: 'FHA Max Claim Amount Applied', value: `$${money(maxClaim)}` },
        ],
        steps: [
          `Max Claim Amount = min($${money(val)}, $${money(fhaLimit2026)}) = $${money(maxClaim)}.`,
          `Estimated PLF at age ${age} & ${rate}% = ${fmt(plf * 100, 1)}% → Gross Limit $${money(principalLimit)}; Net after payoff/fees = $${money(netAvailable)}.`,
        ],
      };
    },
  },

  // 582. Federal Student Loan IDR Payment Calculator
  {
    slug: 'student-loan-ibr-save-calculator',
    title: 'Student Loan Income-Driven Repayment (IDR) Calculator',
    category: 'finance',
    formulaDisplay: 'Monthly Payment = max(0, (AGI − 1.5 × Federal Poverty Line) × IDR% / 12)',
    inputs: [
      { id: 'agi', label: 'Household Adjusted Gross Income (AGI)', type: 'number', prefix: '$', defaultValue: 68000, min: 0, max: 1e9, step: 1000 },
      { id: 'familySize', label: 'Household Family Size', type: 'number', defaultValue: 1, min: 1, max: 15, step: 1 },
      { id: 'idrPercent', label: 'IDR Discretionary Income % (10% or 15%)', type: 'number', unit: '%', defaultValue: 10, min: 5, max: 20, step: 1 },
      { id: 'loanBalance', label: 'Federal Student Loan Balance', type: 'number', prefix: '$', defaultValue: 48000, min: 0, max: 1e8, step: 1000 },
      { id: 'aprPct', label: 'Weighted Average Loan APR', type: 'number', unit: '%', defaultValue: 6.0, min: 0, max: 20, step: 0.25 },
    ],
    calculate: (v) => {
      const agi = parseNum(v.agi);
      const fam = Math.round(parseNum(v.familySize));
      const pct = parseNum(v.idrPercent) / 100;
      const bal = parseNum(v.loanBalance);
      const apr = parseNum(v.aprPct) / 100;
      if ([agi, fam, pct, bal, apr].some(Number.isNaN)) return calcError('Enter valid numeric IDR inputs.');
      if (agi < 0 || fam < 1 || pct <= 0 || bal < 0) return calcError('Family size >= 1 and income/balance non-negative.');
      const fpl2026 = 15650 + (fam - 1) * 5500; // 2025/2026 contiguous US HHS Poverty Guideline
      const povertyShield = fpl2026 * 1.5;
      const discretionary = Math.max(0, agi - povertyShield);
      const idrMonthly = (discretionary * pct) / 12;
      const rm = apr / 12;
      const std10Yr = rm === 0 ? bal / 120 : (bal * rm) / (1 - Math.pow(1 + rm, -120));
      const monthlyInterest = (bal * apr) / 12;
      return {
        primaryValue: fmt(idrMonthly, 2),
        primaryUnit: '$ / month',
        primaryLabel: 'Estimated IDR Monthly Payment',
        secondaryOutputs: [
          { label: '150% Poverty Exclusion', value: `$${money(povertyShield)}` },
          { label: 'Discretionary Income', value: `$${money(discretionary)}` },
          { label: 'Standard 10-Yr Payment', value: `$${money(std10Yr)} / mo` },
          { label: 'Monthly Interest Accrual', value: `$${money(monthlyInterest)} / mo` },
        ],
        steps: [
          `150% HHS Poverty Guideline (family size ${fam}) = $${money(povertyShield)}.`,
          `Discretionary income = $${money(discretionary)} × ${fmt(pct * 100, 0)}% ÷ 12 = $${money(idrMonthly)}/mo.`,
        ],
      };
    },
  },

  // 583. Credit Utilization Ratio Calculator
  {
    slug: 'credit-utilization-ratio-calculator',
    title: 'Credit Utilization Ratio & Paydown Target Calculator',
    category: 'finance',
    formulaDisplay: 'Utilization % = Total Revolving Balances / Total Credit Limits',
    inputs: [
      { id: 'totalBalance', label: 'Current Total Credit Card Balances', type: 'number', prefix: '$', defaultValue: 6800, min: 0, max: 1e9, step: 100 },
      { id: 'totalLimit', label: 'Combined Revolving Credit Limits', type: 'number', prefix: '$', defaultValue: 20000, min: 1, max: 1e9, step: 500 },
      { id: 'targetPct', label: 'Target Utilization % (Recommended ≤10% or <30%)', type: 'number', unit: '%', defaultValue: 9.5, min: 0, max: 100, step: 0.5 },
    ],
    calculate: (v) => {
      const bal = parseNum(v.totalBalance);
      const lim = parseNum(v.totalLimit);
      const tgt = parseNum(v.targetPct) / 100;
      if ([bal, lim, tgt].some(Number.isNaN)) return calcError('Enter valid credit balance and limit.');
      if (bal < 0 || lim <= 0 || tgt < 0 || tgt > 1) return calcError('Credit limit must be positive.');
      const util = (bal / lim) * 100;
      const targetBal = lim * tgt;
      const paydownNeeded = Math.max(0, bal - targetBal);
      const band = util <= 10 ? 'Optimal (≤10% Peak Score Zone)' : util < 30 ? 'Good (<30%)' : util < 50 ? 'Elevated (Score Drag)' : 'High Utilization (>50%)';
      return {
        primaryValue: fmt(util, 2),
        primaryUnit: '%',
        primaryLabel: 'Current Credit Utilization',
        secondaryOutputs: [
          { label: 'Score Impact Tier', value: band },
          { label: `Paydown to Hit ${fmt(tgt * 100, 1)}%`, value: `$${money(paydownNeeded)}` },
          { label: 'Available Remaining Credit', value: `$${money(Math.max(0, lim - bal))}` },
        ],
        steps: [
          `Utilization = $${money(bal)} ÷ $${money(lim)} = ${fmt(util, 2)}% (${band}).`,
          `Target balance @ ${fmt(tgt * 100, 1)}% = $${money(targetBal)} → Paydown needed = $${money(paydownNeeded)}.`,
        ],
      };
    },
  },

  // 584. Credit Card Minimum Payment Trap Calculator
  {
    slug: 'minimum-payment-trap-calculator',
    title: 'Credit Card Minimum Payment Trap Calculator',
    category: 'finance',
    formulaDisplay: 'Min Payment = max(Floor $, Balance × Min% + Monthly Interest)',
    inputs: [
      { id: 'balance', label: 'Credit Card Balance', type: 'number', prefix: '$', defaultValue: 5500, min: 10, max: 1e8, step: 100 },
      { id: 'aprPct', label: 'Purchase APR', type: 'number', unit: '%', defaultValue: 22.99, min: 0, max: 60, step: 0.25 },
      { id: 'minPctOfBalance', label: 'Minimum Payment % of Balance', type: 'number', unit: '%', defaultValue: 2.0, min: 1.0, max: 10, step: 0.25 },
      { id: 'minDollarFloor', label: 'Minimum Dollar Floor', type: 'number', prefix: '$', defaultValue: 35, min: 10, max: 500, step: 5 },
    ],
    calculate: (v) => {
      const b0 = parseNum(v.balance);
      const apr = parseNum(v.aprPct) / 100;
      const minPct = parseNum(v.minPctOfBalance) / 100;
      const floor = parseNum(v.minDollarFloor);
      if ([b0, apr, minPct, floor].some(Number.isNaN)) return calcError('Enter valid credit card parameters.');
      if (b0 <= 0 || apr < 0 || minPct <= 0 || floor <= 0) return calcError('Balance, min %, and floor must be positive.');
      let bal = b0;
      let months = 0;
      let totalInterest = 0;
      const rm = apr / 12;
      const firstMin = Math.max(floor, Math.min(b0 + b0 * rm, b0 * minPct));
      while (bal > 0.01 && months < 1200) {
        const interest = bal * rm;
        const minDue = Math.max(floor, bal * minPct);
        const pay = Math.min(bal + interest, Math.max(minDue, interest + 1));
        bal = bal + interest - pay;
        totalInterest += interest;
        months++;
      }
      return {
        primaryValue: fmt(months / 12, 1),
        primaryUnit: 'years',
        primaryLabel: `Payoff Time (${months} months)`,
        secondaryOutputs: [
          { label: 'Total Interest Paid', value: `$${money(totalInterest)}` },
          { label: 'Total Out-of-Pocket Paid', value: `$${money(b0 + totalInterest)}` },
          { label: 'Month 1 Minimum Payment', value: `$${money(firstMin)}` },
        ],
        steps: [
          `Initial month minimum due = max($${money(floor)}, ${fmt(minPct * 100, 2)}% of $${money(b0)}) = $${money(firstMin)}.`,
          `Making minimums takes ${months} months (${fmt(months / 12, 1)} yrs) and costs $${money(totalInterest)} in interest.`,
        ],
      };
    },
  },

  // 585. Personal Loan Origination Fee & True APR Calculator
  {
    slug: 'personal-loan-origination-apr-calculator',
    title: 'Personal Loan Origination Fee & True APR Calculator',
    category: 'finance',
    formulaDisplay: 'Net Proceeds = Principal × (1 − Origination%) solved vs Monthly Payment',
    inputs: [
      { id: 'grossLoan', label: 'Gross Loan Face Amount', type: 'number', prefix: '$', defaultValue: 25000, min: 500, max: 1e8, step: 500 },
      { id: 'noteRatePct', label: 'Stated Note Interest Rate', type: 'number', unit: '%', defaultValue: 10.5, min: 0, max: 50, step: 0.25 },
      { id: 'originationFeePct', label: 'Upfront Origination Fee', type: 'number', unit: '%', defaultValue: 4.5, min: 0, max: 25, step: 0.25 },
      { id: 'termMonths', label: 'Loan Term', type: 'number', unit: 'months', defaultValue: 48, min: 3, max: 240, step: 6 },
    ],
    calculate: (v) => {
      const P = parseNum(v.grossLoan);
      const rNote = parseNum(v.noteRatePct) / 100;
      const origPct = parseNum(v.originationFeePct) / 100;
      const n = Math.min(Math.round(parseNum(v.termMonths)), 600);
      if ([P, rNote, origPct, n].some(Number.isNaN)) return calcError('Enter valid personal loan parameters.');
      if (P <= 0 || rNote < 0 || origPct < 0 || origPct >= 0.5 || n <= 0) return calcError('Origination fee must be <50% and loan positive.');
      const fee = P * origPct;
      const netCash = P - fee;
      const rm = rNote / 12;
      const pmt = rm === 0 ? P / n : (P * rm) / (1 - Math.pow(1 + rm, -n));

      // Solve true monthly IRR via binary search
      let lo = 0;
      let hi = 0.25;
      for (let i = 0; i < 60; i++) {
        const mid = (lo + hi) / 2;
        const pv = mid === 0 ? pmt * n : pmt * ((1 - Math.pow(1 + mid, -n)) / mid);
        if (pv > netCash) lo = mid;
        else hi = mid;
      }
      const trueApr = ((lo + hi) / 2) * 12 * 100;
      const totalFinanceCharge = pmt * n - netCash;
      return {
        primaryValue: fmt(trueApr, 2),
        primaryUnit: '% APR',
        primaryLabel: 'True Regulation Z APR',
        secondaryOutputs: [
          { label: 'Upfront Origination Fee', value: `$${money(fee)}` },
          { label: 'Net Cash Received', value: `$${money(netCash)}` },
          { label: 'Monthly Payment', value: `$${money(pmt)}` },
          { label: 'Total Cost of Borrowing', value: `$${money(totalFinanceCharge)}` },
        ],
        steps: [
          `Monthly P&I on $${money(P)} @ ${fmt(rNote * 100, 2)}% for ${n} mo = $${money(pmt)}.`,
          `Solving against $${money(netCash)} net disbursed yields True APR = ${fmt(trueApr, 2)}%.`,
        ],
      };
    },
  },

  // 586. Short-Term Fee / Payday Loan True APR Calculator
  {
    slug: 'payday-loan-apr-calculator',
    title: 'Short-Term Fee / Payday Loan True APR Calculator',
    category: 'finance',
    formulaDisplay: 'Nominal APR = (Finance Charge / Loan Amount) × (365 / Days)',
    inputs: [
      { id: 'loanAmount', label: 'Amount Borrowed', type: 'number', prefix: '$', defaultValue: 500, min: 10, max: 1e7, step: 50 },
      { id: 'feeAmount', label: 'Flat Fee / Finance Charge', type: 'number', prefix: '$', defaultValue: 75, min: 0, max: 1e7, step: 5 },
      { id: 'termDays', label: 'Repayment Term', type: 'number', unit: 'days', defaultValue: 14, min: 1, max: 365, step: 1 },
    ],
    calculate: (v) => {
      const amt = parseNum(v.loanAmount);
      const fee = parseNum(v.feeAmount);
      const days = parseNum(v.termDays);
      if ([amt, fee, days].some(Number.isNaN)) return calcError('Enter valid numeric loan and fee values.');
      if (amt <= 0 || fee < 0 || days <= 0) return calcError('Loan amount and days must be positive.');
      const periodRate = fee / amt;
      const apr = periodRate * (365 / days) * 100;
      const effectiveApy = (Math.pow(1 + periodRate, 365 / days) - 1) * 100;
      return {
        primaryValue: fmt(apr, 2),
        primaryUnit: '% APR',
        primaryLabel: 'Annualized Nominal APR',
        secondaryOutputs: [
          { label: 'Period Cost %', value: `${fmt(periodRate * 100, 2)}%` },
          { label: 'Total Repayment Due', value: `$${money(amt + fee)}` },
          { label: 'Compounded Effective APY', value: Number.isFinite(effectiveApy) && effectiveApy < 1e8 ? `${fmt(effectiveApy, 2)}%` : '>100,000,000%' },
        ],
        steps: [
          `Period rate = $${money(fee)} ÷ $${money(amt)} = ${fmt(periodRate * 100, 2)}% over ${days} days.`,
          `Annualized APR = ${fmt(periodRate * 100, 2)}% × (365 ÷ ${days}) = ${fmt(apr, 2)}%.`,
        ],
      };
    },
  },

  // 587. Car Depreciation Calculator
  {
    slug: 'car-depreciation-resale-calculator',
    title: 'Vehicle 5-Year Depreciation & Resale Value Calculator',
    category: 'finance',
    formulaDisplay: 'Value(t) = MSRP × (1 − Year1%) × (1 − Annual%)^(t − 1)',
    inputs: [
      { id: 'purchasePrice', label: 'Vehicle Purchase Price', type: 'number', prefix: '$', defaultValue: 42000, min: 500, max: 1e8, step: 1000 },
      { id: 'year1DropPct', label: 'First-Year Depreciation Drop', type: 'number', unit: '%', defaultValue: 20, min: 0, max: 60, step: 1 },
      { id: 'subsequentDropPct', label: 'Annual Drop (Years 2+)', type: 'number', unit: '%', defaultValue: 14, min: 0, max: 50, step: 1 },
      { id: 'yearsOwned', label: 'Ownership Horizon', type: 'number', unit: 'years', defaultValue: 5, min: 1, max: 25, step: 1 },
    ],
    calculate: (v) => {
      const p0 = parseNum(v.purchasePrice);
      const y1 = parseNum(v.year1DropPct) / 100;
      const ann = parseNum(v.subsequentDropPct) / 100;
      const yrs = Math.round(parseNum(v.yearsOwned));
      if ([p0, y1, ann, yrs].some(Number.isNaN)) return calcError('Enter valid vehicle depreciation values.');
      if (p0 <= 0 || y1 < 0 || ann < 0 || yrs < 1) return calcError('Price and years must be positive.');
      const valY1 = p0 * (1 - y1);
      const finalVal = valY1 * Math.pow(1 - ann, yrs - 1);
      const totalLoss = p0 - finalVal;
      return {
        primaryValue: fmt(finalVal, 2),
        primaryUnit: '$',
        primaryLabel: `Estimated Resale Value (Year ${yrs})`,
        secondaryOutputs: [
          { label: 'Cumulative Value Lost', value: `$${money(totalLoss)} (${fmt((totalLoss / p0) * 100, 1)}%)` },
          { label: 'Monthly Depreciation Cost', value: `$${money(totalLoss / (yrs * 12))} / mo` },
          { label: 'Value After Year 1', value: `$${money(valY1)}` },
        ],
        steps: [
          `Year 1 value = $${money(p0)} × (1 − ${fmt(y1 * 100, 0)}%) = $${money(valY1)}.`,
          `Year ${yrs} resale = $${money(valY1)} × (1 − ${fmt(ann * 100, 0)}%)^${yrs - 1} = $${money(finalVal)}.`,
        ],
      };
    },
  },

  // 588. Auto Lease Money Factor Calculator
  {
    slug: 'auto-lease-money-factor-calculator',
    title: 'Auto Lease Money Factor & Payment Calculator',
    category: 'finance',
    formulaDisplay: 'Monthly Lease = Depreciation + Rent Charge; APR ≈ Money Factor × 2400',
    inputs: [
      { id: 'msrp', label: 'Vehicle MSRP', type: 'number', prefix: '$', defaultValue: 45000, min: 1000, max: 1e8, step: 500 },
      { id: 'negotiatedCapCost', label: 'Negotiated Cap Cost (After Down/Rebates)', type: 'number', prefix: '$', defaultValue: 41500, min: 500, max: 1e8, step: 500 },
      { id: 'residualPct', label: 'Residual Value % of MSRP', type: 'number', unit: '%', defaultValue: 58, min: 10, max: 90, step: 1 },
      { id: 'moneyFactor', label: 'Lease Money Factor', type: 'number', defaultValue: 0.0025, min: 0, max: 0.05, step: 0.0001 },
      { id: 'termMonths', label: 'Lease Term', type: 'number', unit: 'months', defaultValue: 36, min: 12, max: 60, step: 3 },
      { id: 'salesTaxPct', label: 'Local Sales Tax %', type: 'number', unit: '%', defaultValue: 7.0, min: 0, max: 25, step: 0.25 },
    ],
    calculate: (v) => {
      const msrp = parseNum(v.msrp);
      const cap = parseNum(v.negotiatedCapCost);
      const resPct = parseNum(v.residualPct) / 100;
      const mf = parseNum(v.moneyFactor);
      const n = Math.round(parseNum(v.termMonths));
      const tax = parseNum(v.salesTaxPct ?? 0) / 100;
      if ([msrp, cap, resPct, mf, n, tax].some(Number.isNaN)) return calcError('Enter valid auto lease parameters.');
      if (msrp <= 0 || cap <= 0 || n <= 0 || mf < 0 || tax < 0) return calcError('MSRP, cap cost, and term must be positive.');
      const residual = msrp * resPct;
      const depreciation = (cap - residual) / n;
      const rentCharge = (cap + residual) * mf;
      const basePayment = depreciation + rentCharge;
      const totalPayment = basePayment * (1 + tax);
      const eqApr = mf * 2400;
      return {
        primaryValue: fmt(totalPayment, 2),
        primaryUnit: '$ / month',
        primaryLabel: 'Monthly Lease Payment (Incl. Tax)',
        secondaryOutputs: [
          { label: 'Pre-Tax Base Lease Payment', value: `$${money(basePayment)}` },
          { label: 'Equivalent Finance APR', value: `${fmt(eqApr, 2)}%` },
          { label: 'Monthly Depreciation Fee', value: `$${money(depreciation)}` },
          { label: 'Residual Buyout Value', value: `$${money(residual)}` },
        ],
        steps: [
          `Residual = $${money(msrp)} × ${fmt(resPct * 100, 0)}% = $${money(residual)}.`,
          `Depreciation = $${money(depreciation)}/mo; Rent charge = $${money(rentCharge)}/mo (APR ≈ ${fmt(eqApr, 2)}%).`,
          `With ${fmt(tax * 100, 2)}% tax → $${money(totalPayment)}/mo.`,
        ],
      };
    },
  },

  // 589. EV vs Gas Car Operating Cost Calculator
  {
    slug: 'ev-vs-gas-car-cost-calculator',
    title: 'EV vs Gas Car Fuel & Ownership Cost Calculator',
    category: 'finance',
    formulaDisplay: 'EV Annual Fuel = (Miles / mi_per_kWh) × $/kWh   |   Gas = (Miles / MPG) × $/gal',
    inputs: [
      { id: 'annualMiles', label: 'Annual Miles Driven', type: 'number', unit: 'mi', defaultValue: 13500, min: 100, max: 200000, step: 500 },
      { id: 'evEfficiency', label: 'EV Efficiency', type: 'number', unit: 'mi/kWh', defaultValue: 3.6, min: 0.5, max: 10, step: 0.1 },
      { id: 'electricityRate', label: 'Home Electricity Rate', type: 'number', prefix: '$', unit: '/kWh', defaultValue: 0.16, min: 0.01, max: 2, step: 0.01 },
      { id: 'gasMpg', label: 'Gas Car Fuel Economy', type: 'number', unit: 'MPG', defaultValue: 28, min: 5, max: 120, step: 1 },
      { id: 'gasPrice', label: 'Gasoline Price', type: 'number', prefix: '$', unit: '/gal', defaultValue: 3.6, min: 0.5, max: 20, step: 0.1 },
      { id: 'years', label: 'Comparison Horizon', type: 'number', unit: 'years', defaultValue: 5, min: 1, max: 20, step: 1 },
    ],
    calculate: (v) => {
      const mi = parseNum(v.annualMiles);
      const evEff = parseNum(v.evEfficiency);
      const elec = parseNum(v.electricityRate);
      const mpg = parseNum(v.gasMpg);
      const gas = parseNum(v.gasPrice);
      const yrs = parseNum(v.years);
      if ([mi, evEff, elec, mpg, gas, yrs].some(Number.isNaN)) return calcError('Enter valid EV vs gas comparison inputs.');
      if (mi <= 0 || evEff <= 0 || mpg <= 0 || yrs <= 0 || elec < 0 || gas < 0) return calcError('Mileage and efficiency figures must be positive.');
      const evAnnual = (mi / evEff) * elec;
      const gasAnnual = (mi / mpg) * gas;
      const annualSavings = gasAnnual - evAnnual;
      const multiYearSavings = annualSavings * yrs;
      return {
        primaryValue: fmt(multiYearSavings, 2),
        primaryUnit: '$',
        primaryLabel: `${yrs}-Year Fuel Cost Savings (EV vs Gas)`,
        secondaryOutputs: [
          { label: 'EV Annual Electricity Cost', value: `$${money(evAnnual)}/yr (${fmt((evAnnual / mi) * 100, 1)}¢/mi)` },
          { label: 'Gas Car Annual Fuel Cost', value: `$${money(gasAnnual)}/yr (${fmt((gasAnnual / mi) * 100, 1)}¢/mi)` },
          { label: 'Annual Fuel Savings', value: `$${money(annualSavings)}/yr` },
        ],
        steps: [
          `EV energy cost = (${mi} ÷ ${evEff}) × $${elec} = $${money(evAnnual)}/yr.`,
          `Gas fuel cost = (${mi} ÷ ${mpg}) × $${gas} = $${money(gasAnnual)}/yr → ${yrs}-yr savings = $${money(multiYearSavings)}.`,
        ],
      };
    },
  },

  // 590. UK ISA Savings Growth Calculator (£20k Limit)
  {
    slug: 'isa-uk-savings-growth-calculator',
    title: 'UK ISA Tax-Free Savings Growth Calculator (2026/27)',
    category: 'finance',
    formulaDisplay: '2026/27 UK Adult ISA Allowance = £20,000/yr Tax-Free Growth',
    inputs: [
      { id: 'initialIsa', label: 'Existing ISA Balance', type: 'number', prefix: '£', defaultValue: 25000, min: 0, max: 1e9, step: 1000 },
      { id: 'annualContrib', label: 'Annual ISA Contribution (Cap £20,000)', type: 'number', prefix: '£', defaultValue: 15000, min: 0, max: 20000, step: 500 },
      { id: 'years', label: 'Investment Horizon', type: 'number', unit: 'years', defaultValue: 15, min: 1, max: 60, step: 1 },
      { id: 'returnPct', label: 'Expected Annual Return', type: 'number', unit: '%', defaultValue: 6.5, min: 0, max: 25, step: 0.25 },
      { id: 'taxRatePct', label: 'Alternative Taxable Dividend/CGT Drag', type: 'number', unit: '%', defaultValue: 20, min: 0, max: 50, step: 1 },
    ],
    calculate: (v) => {
      const p0 = parseNum(v.initialIsa);
      const contrib = Math.min(parseNum(v.annualContrib), 20000);
      const yrs = parseNum(v.years);
      const r = parseNum(v.returnPct) / 100;
      const tax = parseNum(v.taxRatePct) / 100;
      if ([p0, contrib, yrs, r, tax].some(Number.isNaN)) return calcError('Enter valid UK ISA numbers.');
      if (p0 < 0 || contrib < 0 || yrs <= 0 || r < 0) return calcError('Balances cannot be negative and years must be positive.');
      const fvIsa = r === 0 ? p0 + contrib * yrs : p0 * Math.pow(1 + r, yrs) + contrib * ((Math.pow(1 + r, yrs) - 1) / r);
      const rNet = r * (1 - tax);
      const fvTaxable = rNet === 0 ? p0 + contrib * yrs : p0 * Math.pow(1 + rNet, yrs) + contrib * ((Math.pow(1 + rNet, yrs) - 1) / rNet);
      const taxShielded = fvIsa - fvTaxable;
      return {
        primaryValue: fmt(fvIsa, 2),
        primaryUnit: '£',
        primaryLabel: 'Projected Tax-Free UK ISA Pot',
        secondaryOutputs: [
          { label: 'Total Contributions Made', value: `£${money(p0 + contrib * yrs)}` },
          { label: 'Tax-Shield Advantage vs GIA', value: `£${money(taxShielded)}` },
          { label: 'Taxable Account Value', value: `£${money(fvTaxable)}` },
        ],
        steps: [
          `Capped at 2026/27 HMRC ISA limit (£20,000/yr): £${money(contrib)}/yr over ${yrs} yrs @ ${fmt(r * 100, 2)}% = £${money(fvIsa)}.`,
          `Tax shield relative to ${fmt(tax * 100, 0)}% drag = £${money(taxShielded)}.`,
        ],
      };
    },
  },

  // 591. UK Lifetime ISA (LISA) Bonus Calculator
  {
    slug: 'lifetime-isa-lisa-bonus-calculator',
    title: 'UK Lifetime ISA (LISA) 25% Bonus Calculator (2026/27)',
    category: 'finance',
    formulaDisplay: 'Govt Bonus = 25% of Contribution up to £1,000/yr (£4,000 cap)',
    inputs: [
      { id: 'currentBalance', label: 'Current LISA Balance', type: 'number', prefix: '£', defaultValue: 5000, min: 0, max: 1e8, step: 500 },
      { id: 'annualDeposit', label: 'Annual LISA Deposit (Max £4,000)', type: 'number', prefix: '£', defaultValue: 4000, min: 0, max: 4000, step: 100 },
      { id: 'years', label: 'Years Until Home Purchase / Age 60', type: 'number', unit: 'years', defaultValue: 5, min: 1, max: 42, step: 1 },
      { id: 'returnPct', label: 'Expected Annual Growth Rate', type: 'number', unit: '%', defaultValue: 4.5, min: 0, max: 20, step: 0.25 },
    ],
    calculate: (v) => {
      const p0 = parseNum(v.currentBalance);
      const dep = Math.min(4000, Math.max(0, parseNum(v.annualDeposit)));
      const yrs = parseNum(v.years);
      const r = parseNum(v.returnPct) / 100;
      if ([p0, dep, yrs, r].some(Number.isNaN)) return calcError('Enter valid LISA values.');
      if (p0 < 0 || yrs <= 0 || r < 0) return calcError('Balance cannot be negative and years positive.');
      const annualBonus = dep * 0.25;
      const annualTotalInflow = dep + annualBonus;
      const fv = r === 0 ? p0 + annualTotalInflow * yrs : p0 * Math.pow(1 + r, yrs) + annualTotalInflow * ((Math.pow(1 + r, yrs) - 1) / r);
      return {
        primaryValue: fmt(fv, 2),
        primaryUnit: '£',
        primaryLabel: 'Projected UK LISA Balance',
        secondaryOutputs: [
          { label: 'Annual 25% Govt Bonus', value: `£${money(annualBonus)}/yr` },
          { label: 'Cumulative Free Govt Bonus', value: `£${money(annualBonus * yrs)}` },
          { label: 'Your Cash Contributions', value: `£${money(p0 + dep * yrs)}` },
        ],
        steps: [
          `Deposit £${money(dep)}/yr earns 25% government bonus (£${money(annualBonus)}/yr) = £${money(annualTotalInflow)}/yr inflow.`,
          `Over ${yrs} years @ ${fmt(r * 100, 2)}% = £${money(fv)}. (First home cap £450,000 applies.)`,
        ],
      };
    },
  },

  // 592. Canada FHSA Calculator ($8,000/yr, $40,000 lifetime)
  {
    slug: 'fhsa-canada-first-home-calculator',
    title: 'Canada FHSA Tax Savings & First Home Calculator (2026)',
    category: 'finance',
    formulaDisplay: 'Max $8,000/yr & $40,000 Lifetime Contribution + Tax Refund',
    inputs: [
      { id: 'currentFhsa', label: 'Current FHSA Balance', type: 'number', prefix: 'C$', defaultValue: 8000, min: 0, max: 200000, step: 500 },
      { id: 'annualContrib', label: 'Annual Contribution (Max $8,000)', type: 'number', prefix: 'C$', defaultValue: 8000, min: 0, max: 8000, step: 500 },
      { id: 'years', label: 'Years to Home Purchase (Max 15 yrs)', type: 'number', unit: 'years', defaultValue: 5, min: 1, max: 15, step: 1 },
      { id: 'returnPct', label: 'Expected Investment Return', type: 'number', unit: '%', defaultValue: 5.0, min: 0, max: 20, step: 0.25 },
      { id: 'marginalTaxPct', label: 'Combined Fed + Prov Marginal Tax Rate', type: 'number', unit: '%', defaultValue: 31.5, min: 0, max: 60, step: 0.5 },
    ],
    calculate: (v) => {
      const p0 = parseNum(v.currentFhsa);
      const contrib = Math.min(8000, Math.max(0, parseNum(v.annualContrib)));
      const yrs = Math.min(15, Math.max(1, Math.round(parseNum(v.years))));
      const r = parseNum(v.returnPct) / 100;
      const tax = parseNum(v.marginalTaxPct) / 100;
      if ([p0, contrib, yrs, r, tax].some(Number.isNaN)) return calcError('Enter valid Canada FHSA inputs.');
      if (p0 < 0 || r < 0 || tax < 0) return calcError('Inputs cannot be negative.');
      let bal = p0;
      let cumContribs = p0;
      let totalTaxRefund = 0;
      for (let y = 1; y <= yrs; y++) {
        const room = Math.max(0, 40000 - cumContribs);
        const deposit = Math.min(contrib, room);
        bal = (bal + deposit) * (1 + r);
        cumContribs += deposit;
        totalTaxRefund += deposit * tax;
      }
      return {
        primaryValue: fmt(bal, 2),
        primaryUnit: 'C$',
        primaryLabel: 'Projected Tax-Free Home Down Payment',
        secondaryOutputs: [
          { label: 'Cumulative Tax Refund Generated', value: `C$${money(totalTaxRefund)}` },
          { label: 'Total Lifetime Contributed (vs $40k Cap)', value: `C$${money(cumContribs)}` },
          { label: 'Tax-Free Investment Growth', value: `C$${money(bal - cumContribs)}` },
        ],
        steps: [
          `CRA FHSA rules cap lifetime contributions at C$40,000 ($8,000/yr).`,
          `Compounded over ${yrs} yrs @ ${fmt(r * 100, 2)}% = C$${money(bal)} plus C$${money(totalTaxRefund)} in tax refunds.`,
        ],
      };
    },
  },

  // 593. Canada RESP & CESG Grant Calculator
  {
    slug: 'resp-canada-cesg-grant-calculator',
    title: 'Canada RESP & 20% CESG Grant Education Calculator',
    category: 'finance',
    formulaDisplay: 'CESG = 20% of first $2,500/yr ($500/yr up to $7,200 lifetime)',
    inputs: [
      { id: 'currentResp', label: 'Current RESP Balance', type: 'number', prefix: 'C$', defaultValue: 4000, min: 0, max: 100000, step: 500 },
      { id: 'annualContrib', label: 'Annual Family Contribution', type: 'number', prefix: 'C$', defaultValue: 2500, min: 0, max: 50000, step: 250 },
      { id: 'years', label: 'Years Until Post-Secondary', type: 'number', unit: 'years', defaultValue: 14, min: 1, max: 18, step: 1 },
      { id: 'returnPct', label: 'Expected Annual Return', type: 'number', unit: '%', defaultValue: 6.0, min: 0, max: 20, step: 0.25 },
    ],
    calculate: (v) => {
      const p0 = parseNum(v.currentResp);
      const contrib = parseNum(v.annualContrib);
      const yrs = Math.min(18, Math.max(1, Math.round(parseNum(v.years))));
      const r = parseNum(v.returnPct) / 100;
      if ([p0, contrib, yrs, r].some(Number.isNaN)) return calcError('Enter valid RESP inputs.');
      if (p0 < 0 || contrib < 0 || r < 0) return calcError('Inputs cannot be negative.');
      let bal = p0;
      let totalGrants = 0;
      let totalContribs = p0;
      for (let y = 1; y <= yrs; y++) {
        const capContrib = Math.min(contrib, Math.max(0, 50000 - totalContribs));
        const cesgRoom = Math.max(0, 7200 - totalGrants);
        const grant = Math.min(cesgRoom, Math.min(capContrib, 2500) * 0.2);
        bal = (bal + capContrib + grant) * (1 + r);
        totalContribs += capContrib;
        totalGrants += grant;
      }
      return {
        primaryValue: fmt(bal, 2),
        primaryUnit: 'C$',
        primaryLabel: 'Projected RESP Education Fund',
        secondaryOutputs: [
          { label: 'Total CESG Grants Received (Cap $7,200)', value: `C$${money(totalGrants)}` },
          { label: 'Family Contributions (Cap $50,000)', value: `C$${money(totalContribs)}` },
          { label: 'Compounded Growth', value: `C$${money(bal - totalContribs - totalGrants)}` },
        ],
        steps: [
          `CESG adds 20% on first $2,500/yr ($500/yr max up to $7,200 lifetime).`,
          `Projected RESP balance at enrollment = C$${money(bal)} (incl. C$${money(totalGrants)} CESG).`,
        ],
      };
    },
  },

  // 594. Australian FHSS Super Saver Calculator
  {
    slug: 'australian-fhss-super-calculator',
    title: 'Australia First Home Super Saver (FHSS) Calculator',
    category: 'finance',
    formulaDisplay: 'Max $15,000/yr ($50,000 total) taxed at 15% vs Marginal Tax Rate',
    inputs: [
      { id: 'annualVoluntaryContrib', label: 'Annual Concessional Super Sacrifice (Max A$15k)', type: 'number', prefix: 'A$', defaultValue: 15000, min: 0, max: 15000, step: 500 },
      { id: 'years', label: 'Contribution Years', type: 'number', unit: 'years', defaultValue: 3, min: 1, max: 10, step: 1 },
      { id: 'marginalRatePct', label: 'Personal Marginal Tax + 2% Medicare Levy', type: 'number', unit: '%', defaultValue: 32, min: 0, max: 47, step: 1, helpText: '2026-27 Stage 3 30% bracket + 2% Medicare Levy = 32%.' },
      { id: 'sicRatePct', label: 'ATO Shortfall Interest Charge (SIC) Deemed Rate', type: 'number', unit: '%', defaultValue: 7.1, min: 0, max: 15, step: 0.1 },
    ],
    calculate: (v) => {
      const c = Math.min(15000, Math.max(0, parseNum(v.annualVoluntaryContrib)));
      const yrs = Math.min(10, Math.max(1, Math.round(parseNum(v.years))));
      const mtr = parseNum(v.marginalRatePct) / 100;
      const sic = parseNum(v.sicRatePct) / 100;
      if ([c, yrs, mtr, sic].some(Number.isNaN)) return calcError('Enter valid FHSS inputs.');
      let eligible = 0;
      let totalGross = 0;
      for (let y = 1; y <= yrs; y++) {
        const capAdd = Math.min(c, Math.max(0, 50000 - totalGross));
        totalGross += capAdd;
        const after15 = capAdd * 0.85;
        eligible = (eligible + after15) * (1 + sic);
      }
      const withdrawalTaxRate = Math.max(0, mtr - 0.3); // 30% FHSS tax offset
      const netRelease = eligible * (1 - withdrawalTaxRate);
      const personalBankComparison = totalGross * (1 - mtr);
      const advantage = netRelease - personalBankComparison;
      return {
        primaryValue: fmt(netRelease, 2),
        primaryUnit: 'A$',
        primaryLabel: 'Net Estimated FHSS Deposit Released',
        secondaryOutputs: [
          { label: 'Tax Advantage vs Outside Super', value: `+A$${money(advantage)}` },
          { label: 'Gross Pre-Tax Contributions (Max $50k)', value: `A$${money(totalGross)}` },
          { label: 'Net Release Tax Rate (MTR − 30% Offset)', value: `${fmt(withdrawalTaxRate * 100, 1)}%` },
        ],
        steps: [
          `Concessional FHSS deposits pay 15% super contributions tax and earn ATO SIC deemed return (${fmt(sic * 100, 1)}%).`,
          `Release taxed at ${fmt(withdrawalTaxRate * 100, 1)}% yields A$${money(netRelease)} (+A$${money(advantage)} ahead of taxable savings).`,
        ],
      };
    },
  },

  // 595. KiwiSaver Retirement Projection Calculator
  {
    slug: 'kiwisaver-retirement-projection-calculator',
    title: 'New Zealand KiwiSaver Projection Calculator (2026)',
    category: 'finance',
    formulaDisplay: 'Annual Inflow = Employee + Employer (net ESCT) + Annual Govt Credit',
    inputs: [
      { id: 'currentBalance', label: 'Current KiwiSaver Balance', type: 'number', prefix: 'NZ$', defaultValue: 35000, min: 0, max: 1e9, step: 1000 },
      { id: 'salary', label: 'Gross Annual Salary', type: 'number', prefix: 'NZ$', defaultValue: 85000, min: 0, max: 1e8, step: 2000 },
      { id: 'employeeRatePct', label: 'Your Contribution Rate (3%–10%)', type: 'number', unit: '%', defaultValue: 4, min: 3, max: 10, step: 1 },
      { id: 'employerRatePct', label: 'Employer Match % (Min 3%, 3.5% April 2026)', type: 'number', unit: '%', defaultValue: 3.5, min: 0, max: 15, step: 0.5 },
      { id: 'years', label: 'Years to Age 65', type: 'number', unit: 'years', defaultValue: 25, min: 1, max: 50, step: 1 },
      { id: 'netReturnPct', label: 'Expected Net Return (After PIR & Fees)', type: 'number', unit: '%', defaultValue: 5.5, min: 0, max: 20, step: 0.25 },
    ],
    calculate: (v) => {
      const p0 = parseNum(v.currentBalance);
      const sal = parseNum(v.salary);
      const empRate = parseNum(v.employeeRatePct) / 100;
      const erRate = parseNum(v.employerRatePct) / 100;
      const yrs = parseNum(v.years);
      const r = parseNum(v.netReturnPct) / 100;
      if ([p0, sal, empRate, erRate, yrs, r].some(Number.isNaN)) return calcError('Enter valid KiwiSaver assumptions.');
      if (p0 < 0 || sal < 0 || yrs <= 0 || r < 0) return calcError('Inputs must be non-negative and years positive.');
      const empAnnual = sal * empRate;
      const erNetAnnual = sal * erRate * 0.825; // Approximate after 17.5% ESCT
      const govtContrib = sal <= 180000 ? Math.min(260.72, empAnnual * 0.25) : 0; // NZ 2025/26 Budget govt contribution cap $260.72 below $180k threshold
      const annualInflow = empAnnual + erNetAnnual + govtContrib;
      const fv = r === 0 ? p0 + annualInflow * yrs : p0 * Math.pow(1 + r, yrs) + annualInflow * ((Math.pow(1 + r, yrs) - 1) / r);
      return {
        primaryValue: fmt(fv, 2),
        primaryUnit: 'NZ$',
        primaryLabel: 'Projected KiwiSaver Balance @ 65',
        secondaryOutputs: [
          { label: 'Annual Combined Inflow', value: `NZ$${money(annualInflow)}/yr` },
          { label: 'Employer Net Match (After ESCT)', value: `NZ$${money(erNetAnnual)}/yr` },
          { label: 'Annual Govt Credit (2026 Rules)', value: `NZ$${money(govtContrib)}/yr` },
          { label: '4% Annual Retirement Drawdown', value: `NZ$${money(fv * 0.04)}/yr` },
        ],
        steps: [
          `Employee (NZ$${money(empAnnual)}) + Net Employer (NZ$${money(erNetAnnual)}) + Govt Credit (NZ$${money(govtContrib)}) = NZ$${money(annualInflow)}/yr.`,
          `Compounded over ${yrs} yrs @ ${fmt(r * 100, 2)}% = NZ$${money(fv)}.`,
        ],
      };
    },
  },

  // 596. Bond Duration & Convexity Sensitivity Calculator
  {
    slug: 'bond-duration-convexity-calculator',
    title: 'Bond Duration & Interest Rate Sensitivity Calculator',
    category: 'finance',
    formulaDisplay: 'Modified Duration = Macaulay / (1 + y/m)   |   ΔP/P ≈ −D_mod × Δy',
    inputs: [
      { id: 'faceValue', label: 'Bond Par Value', type: 'number', prefix: '$', defaultValue: 1000, min: 10, max: 1e9, step: 100 },
      { id: 'couponPct', label: 'Annual Coupon Rate', type: 'number', unit: '%', defaultValue: 5.0, min: 0, max: 30, step: 0.25 },
      { id: 'ytmPct', label: 'Current Yield to Maturity (YTM)', type: 'number', unit: '%', defaultValue: 6.0, min: 0.01, max: 30, step: 0.25 },
      { id: 'years', label: 'Years to Maturity', type: 'number', unit: 'years', defaultValue: 10, min: 0.5, max: 50, step: 0.5 },
      { id: 'rateShiftBps', label: 'Yield Shock Test (bps)', type: 'number', unit: 'bps', defaultValue: 100, min: -500, max: 500, step: 25 },
    ],
    calculate: (v) => {
      const fv = parseNum(v.faceValue);
      const cRate = parseNum(v.couponPct) / 100;
      const ytm = parseNum(v.ytmPct) / 100;
      const yrs = parseNum(v.years);
      const bps = parseNum(v.rateShiftBps ?? 100);
      if ([fv, cRate, ytm, yrs, bps].some(Number.isNaN)) return calcError('Enter valid bond duration parameters.');
      if (fv <= 0 || cRate < 0 || ytm <= 0 || yrs <= 0) return calcError('Face value, YTM, and years must be positive.');
      const n = Math.min(Math.round(yrs * 2), 120); // Semiannual standard
      const c = (fv * cRate) / 2;
      const r = ytm / 2;
      let pvSum = 0;
      let weightedSum = 0;
      for (let t = 1; t <= n; t++) {
        const cf = t === n ? c + fv : c;
        const pv = cf / Math.pow(1 + r, t);
        pvSum += pv;
        weightedSum += (t / 2) * pv;
      }
      const macDuration = weightedSum / pvSum;
      const modDuration = macDuration / (1 + r);
      const dy = bps / 10000;
      const estPctChange = -modDuration * dy * 100;
      return {
        primaryValue: fmt(modDuration, 3),
        primaryUnit: 'years',
        primaryLabel: 'Modified Duration',
        secondaryOutputs: [
          { label: 'Macaulay Duration', value: `${fmt(macDuration, 3)} yrs` },
          { label: 'Current Fair Bond Price', value: `$${money(pvSum)}` },
          { label: `Est. Price Move (+${bps} bps)`, value: `${estPctChange >= 0 ? '+' : ''}${fmt(estPctChange, 2)}%` },
        ],
        steps: [
          `Semiannual DCF price = $${money(pvSum)}; Macaulay Duration = ${fmt(macDuration, 3)} yrs.`,
          `Modified Duration = ${fmt(macDuration, 3)} ÷ (1 + ${fmt(r * 100, 2)}%) = ${fmt(modDuration, 3)} yrs.`,
        ],
      };
    },
  },

  // 597. US Treasury Bill Discount Yield Calculator
  {
    slug: 'treasury-bill-discount-yield-calculator',
    title: 'US Treasury Bill Discount & Investment Yield Calculator',
    category: 'finance',
    formulaDisplay: 'Discount Yield = ((Par − P)/Par) × (360/d)   |   BEY = ((Par − P)/P) × (365/d)',
    inputs: [
      { id: 'parValue', label: 'T-Bill Par (Maturity) Value', type: 'number', prefix: '$', defaultValue: 10000, min: 100, max: 1e10, step: 1000 },
      { id: 'purchasePrice', label: 'Purchase Price', type: 'number', prefix: '$', defaultValue: 9780, min: 1, max: 1e10, step: 10 },
      { id: 'daysToMaturity', label: 'Days to Maturity (e.g., 28, 91, 182, 364)', type: 'number', unit: 'days', defaultValue: 182, min: 1, max: 366, step: 1 },
    ],
    calculate: (v) => {
      const par = parseNum(v.parValue);
      const px = parseNum(v.purchasePrice);
      const d = parseNum(v.daysToMaturity);
      if ([par, px, d].some(Number.isNaN)) return calcError('Enter valid T-Bill values.');
      if (par <= 0 || px <= 0 || d <= 0) return calcError('All T-Bill fields must be positive.');
      const discount = par - px;
      const discountYield = (discount / par) * (360 / d) * 100;
      const bey = (discount / px) * (365 / d) * 100;
      const effectiveApy = (Math.pow(par / px, 365 / d) - 1) * 100;
      return {
        primaryValue: fmt(bey, 3),
        primaryUnit: '%',
        primaryLabel: 'Bond Equivalent Investment Yield (BEY)',
        secondaryOutputs: [
          { label: 'Bank Discount Yield (360-day)', value: `${fmt(discountYield, 3)}%` },
          { label: 'Effective Annualized Yield (APY)', value: `${fmt(effectiveApy, 3)}%` },
          { label: 'Dollar Interest Earned', value: `$${money(discount)}` },
        ],
        steps: [
          `Dollar discount = $${money(par)} − $${money(px)} = $${money(discount)} over ${d} days.`,
          `BEY (365-day) = (${fmt(discount / px, 5)}) × (365/${d}) = ${fmt(bey, 3)}% (Bank discount = ${fmt(discountYield, 3)}%).`,
        ],
      };
    },
  },
];
