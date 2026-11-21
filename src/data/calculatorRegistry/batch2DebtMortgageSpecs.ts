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

const calcPmt = (principal: number, annualRatePct: number, months: number): number => {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  if (r === 0) return principal / months;
  const f = Math.pow(1 + r, months);
  if (!Number.isFinite(f)) return principal * r;
  return (principal * (r * f)) / (f - 1);
};

// Solve monthly rate r_m such that PV = sum_{k=1..n} pmt / (1 + r_m)^k -> returns Annual APR (%)
const solveEffectiveApr = (netProceeds: number, monthlyPayment: number, months: number): number => {
  if (netProceeds <= 0 || monthlyPayment <= 0 || months <= 0) return 0;
  if (monthlyPayment * months <= netProceeds) return 0;
  let lo = 0;
  let hi = 0.25; // up to 300% APR
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    const pv = mid === 0 ? monthlyPayment * months : monthlyPayment * ((1 - Math.pow(1 + mid, -months)) / mid);
    if (pv > netProceeds) lo = mid;
    else hi = mid;
  }
  return ((lo + hi) / 2) * 12 * 100;
};

interface DebtItem {
  name: string;
  bal: number;
  apr: number;
  minPay: number;
}

const simulateDebtPlan = (
  items: DebtItem[],
  extraMonthly: number,
  strategy: 'avalanche' | 'snowball' | 'minimums'
): { months: number; totalInterest: number; totalPaid: number; order: string[] } => {
  const debts = items
    .filter((d) => d.bal > 0)
    .map((d) => ({ ...d, paidOff: false }));
  if (debts.length === 0) return { months: 0, totalInterest: 0, totalPaid: 0, order: [] };

  let month = 0;
  let totalInterest = 0;
  let totalPaid = 0;
  const order: string[] = [];

  while (debts.some((d) => d.bal > 0.005) && month < 1200) {
    month++;
    let pool = strategy === 'minimums' ? 0 : extraMonthly;

    // 1. Accrue monthly interest
    for (const d of debts) {
      if (d.bal <= 0) continue;
      const interest = d.bal * (d.apr / 100 / 12);
      d.bal += interest;
      totalInterest += interest;
    }

    // 2. Pay required minimums; rollover freed minimums if avalanche/snowball
    for (const d of debts) {
      if (d.bal <= 0) {
        if (strategy !== 'minimums') pool += d.minPay;
        continue;
      }
      const pmt = Math.min(d.bal, d.minPay);
      d.bal -= pmt;
      totalPaid += pmt;
      if (d.bal <= 0.005) {
        if (strategy !== 'minimums') pool += d.minPay - pmt;
        d.bal = 0;
        if (!d.paidOff) {
          d.paidOff = true;
          order.push(d.name);
        }
      }
    }

    // 3. Apply snowball/avalanche surplus to priority target(s)
    if (strategy !== 'minimums' && pool > 0) {
      const active = debts.filter((d) => d.bal > 0.005);
      active.sort((a, b) =>
        strategy === 'avalanche'
          ? b.apr - a.apr || a.bal - b.bal
          : a.bal - b.bal || b.apr - a.apr
      );
      for (const target of active) {
        if (pool <= 0.0001) break;
        const apply = Math.min(target.bal, pool);
        target.bal -= apply;
        totalPaid += apply;
        pool -= apply;
        if (target.bal <= 0.005) {
          target.bal = 0;
          if (!target.paidOff) {
            target.paidOff = true;
            order.push(target.name);
          }
        }
      }
    }
  }

  return { months: month, totalInterest, totalPaid, order };
};

export const batch2DebtMortgageSpecs: CalculatorSpec[] = [
  // 501. Debt Snowball vs Avalanche Calculator
  {
    slug: 'debt-snowball-avalanche-calculator',
    title: 'Debt Snowball vs Avalanche Calculator',
    category: 'finance',
    formulaDisplay: 'Avalanche: Sort APR ↓ (Min Interest)  |  Snowball: Sort Balance ↑ (Fastest First Win) + Minimum Rollover',
    inputs: [
      { id: 'debt1Balance', label: 'Debt 1 Balance (Credit Card A)', defaultValue: 4500, type: 'number', min: 0, max: 10000000, step: 100, unit: '$' },
      { id: 'debt1Apr', label: 'Debt 1 APR (%)', defaultValue: 22.9, type: 'number', min: 0, max: 60, step: 0.1, unit: '%' },
      { id: 'debt1Min', label: 'Debt 1 Minimum Payment', defaultValue: 135, type: 'number', min: 0, max: 1000000, step: 10, unit: '$' },
      { id: 'debt2Balance', label: 'Debt 2 Balance (Personal Loan)', defaultValue: 8200, type: 'number', min: 0, max: 10000000, step: 100, unit: '$' },
      { id: 'debt2Apr', label: 'Debt 2 APR (%)', defaultValue: 11.5, type: 'number', min: 0, max: 60, step: 0.1, unit: '%' },
      { id: 'debt2Min', label: 'Debt 2 Minimum Payment', defaultValue: 220, type: 'number', min: 0, max: 1000000, step: 10, unit: '$' },
      { id: 'debt3Balance', label: 'Debt 3 Balance (Auto / Store Card)', defaultValue: 2100, type: 'number', min: 0, max: 10000000, step: 100, unit: '$' },
      { id: 'debt3Apr', label: 'Debt 3 APR (%)', defaultValue: 16.5, type: 'number', min: 0, max: 60, step: 0.1, unit: '%' },
      { id: 'debt3Min', label: 'Debt 3 Minimum Payment', defaultValue: 75, type: 'number', min: 0, max: 1000000, step: 10, unit: '$' },
      { id: 'debt4Balance', label: 'Debt 4 Balance (Student / Other)', defaultValue: 12000, type: 'number', min: 0, max: 10000000, step: 100, unit: '$', advanced: true },
      { id: 'debt4Apr', label: 'Debt 4 APR (%)', defaultValue: 6.2, type: 'number', min: 0, max: 60, step: 0.1, unit: '%', advanced: true },
      { id: 'debt4Min', label: 'Debt 4 Minimum Payment', defaultValue: 170, type: 'number', min: 0, max: 1000000, step: 10, unit: '$', advanced: true },
      { id: 'extraMonthlyPayment', label: 'Extra Monthly Acceleration Budget', defaultValue: 300, type: 'number', min: 0, max: 1000000, step: 25, unit: '$', helpText: 'Additional monthly cash above minimum payments rolled across eliminated debts.' },
    ],
    calculate: (v) => {
      const b1 = parseNum(v.debt1Balance), a1 = parseNum(v.debt1Apr), m1 = parseNum(v.debt1Min);
      const b2 = parseNum(v.debt2Balance), a2 = parseNum(v.debt2Apr), m2 = parseNum(v.debt2Min);
      const b3 = parseNum(v.debt3Balance), a3 = parseNum(v.debt3Apr), m3 = parseNum(v.debt3Min);
      const b4 = v.debt4Balance === undefined ? 12000 : parseNum(v.debt4Balance);
      const a4 = v.debt4Apr === undefined ? 6.2 : parseNum(v.debt4Apr);
      const m4 = v.debt4Min === undefined ? 170 : parseNum(v.debt4Min);
      const extra = parseNum(v.extraMonthlyPayment);

      if ([b1, a1, m1, b2, a2, m2, b3, a3, m3, b4, a4, m4, extra].some(isNaN)) {
        return calcError('Please enter valid numeric balances, APRs, minimum payments, and extra budget.');
      }
      if ([b1, a1, m1, b2, a2, m2, b3, a3, m3, b4, a4, m4, extra].some((x) => x < 0)) {
        return calcError('Balances, APRs, minimum payments, and extra budget cannot be negative.');
      }
      if ([a1, a2, a3, a4].some((a) => a > 100)) {
        return calcError('Debt APRs cannot exceed 100%.');
      }

      const items: DebtItem[] = [
        { name: 'Debt 1 (Card A)', bal: b1, apr: a1, minPay: m1 },
        { name: 'Debt 2 (Loan)', bal: b2, apr: a2, minPay: m2 },
        { name: 'Debt 3 (Store/Auto)', bal: b3, apr: a3, minPay: m3 },
        { name: 'Debt 4 (Student/Other)', bal: b4, apr: a4, minPay: m4 },
      ].filter((d) => d.bal > 0);

      if (items.length === 0) {
        return calcError('At least one debt must have a balance greater than $0.');
      }
      for (const d of items) {
        const moInt = d.bal * (d.apr / 100 / 12);
        if (d.minPay === 0 && extra === 0) {
          return calcError(`${d.name} has $0 minimum payment and $0 extra budget; balance cannot amortize.`);
        }
        if (d.minPay <= moInt && extra === 0 && items.length === 1) {
          return calcError(`${d.name} minimum payment ($${fmt(d.minPay)}) does not exceed first-month interest ($${fmt(moInt)}).`);
        }
      }

      const totalDebt = items.reduce((s, d) => s + d.bal, 0);
      const totalMin = items.reduce((s, d) => s + d.minPay, 0);
      const av = simulateDebtPlan(items, extra, 'avalanche');
      const sb = simulateDebtPlan(items, extra, 'snowball');
      const minOnly = simulateDebtPlan(items, 0, 'minimums');

      const avalancheSavingsVsSnowball = sb.totalInterest - av.totalInterest;
      const avalancheSavingsVsMins = minOnly.totalInterest - av.totalInterest;
      const monthsSavedVsMins = minOnly.months - av.months;

      return {
        primaryValue: fmt(avalancheSavingsVsMins, 2),
        primaryUnit: '$ Interest Saved via Avalanche vs Minimums Only',
        secondaryOutputs: [
          { label: 'Total Combined Debt', value: fmtCurrency(totalDebt) },
          { label: 'Total Monthly Outflow', value: fmtCurrency(totalMin + extra), unit: '/mo' },
          { label: 'Avalanche Payoff Time', value: `${av.months} mos`, unit: `(${fmt(av.months / 12, 1)} yrs)` },
          { label: 'Avalanche Total Interest', value: fmtCurrency(av.totalInterest) },
          { label: 'Snowball Payoff Time', value: `${sb.months} mos`, unit: `(${fmt(sb.months / 12, 1)} yrs)` },
          { label: 'Snowball Total Interest', value: fmtCurrency(sb.totalInterest) },
          { label: 'Avalanche Edge Over Snowball', value: fmtCurrency(avalancheSavingsVsSnowball) },
          { label: 'Minimums-Only Payoff Time', value: minOnly.months >= 1200 ? '100+ yrs (Never)' : `${minOnly.months} mos` },
        ],
        steps: [
          `Total starting principal across ${items.length} debts = ${fmtCurrency(totalDebt)} with ${fmtCurrency(totalMin)}/mo base minimums + ${fmtCurrency(extra)}/mo extra acceleration.`,
          `Debt Avalanche (Priority: ${av.order.join(' → ')}) clears all balances in ${av.months} months with ${fmtCurrency(av.totalInterest)} total interest.`,
          `Debt Snowball (Priority: ${sb.order.join(' → ')}) clears all balances in ${sb.months} months with ${fmtCurrency(sb.totalInterest)} total interest.`,
          `Compared to paying minimums only (${minOnly.months} mos, ${fmtCurrency(minOnly.totalInterest)} interest), Avalanche saves ${fmtCurrency(avalancheSavingsVsMins)} and cuts ${monthsSavedVsMins} months.`,
        ],
      };
    },
  },

  // 502. Mortgage Refinance Calculator
  {
    slug: 'mortgage-refinance-calculator',
    title: 'Mortgage Refinance Calculator',
    category: 'finance',
    formulaDisplay: 'Break-Even Month = Closing Costs ÷ Monthly Savings  |  Net Savings = ΔInterest − Closing Costs',
    inputs: [
      { id: 'currentBalance', label: 'Current Mortgage Principal Balance', defaultValue: 320000, type: 'number', min: 1000, max: 50000000, step: 2500, unit: '$' },
      { id: 'currentRate', label: 'Current Interest Rate (APR %)', defaultValue: 7.125, type: 'number', min: 0, max: 25, step: 0.125, unit: '%' },
      { id: 'remainingMonths', label: 'Remaining Months on Current Loan', defaultValue: 324, type: 'number', min: 1, max: 480, step: 12, unit: 'mo', helpText: 'e.g., 27 years remaining = 324 months.' },
      { id: 'newRate', label: 'New Refinance Rate (APR %)', defaultValue: 5.75, type: 'number', min: 0, max: 25, step: 0.125, unit: '%' },
      { id: 'newTermYears', label: 'New Loan Term (Years)', defaultValue: 30, type: 'number', min: 5, max: 40, step: 5, unit: 'yrs' },
      { id: 'closingCosts', label: 'Total Refinance Closing Costs & Points', defaultValue: 6400, type: 'number', min: 0, max: 500000, step: 200, unit: '$' },
      {
        id: 'rollClosingCosts',
        label: 'Closing Costs Funding Method',
        type: 'select',
        defaultValue: 'upfront',
        options: [
          { label: 'Pay Closing Costs Cash Upfront', value: 'upfront' },
          { label: 'Roll Closing Costs into New Loan Principal', value: 'roll' },
        ],
      },
      { id: 'expectedHoldYears', label: 'Expected Years Remaining in Home', defaultValue: 7, type: 'number', min: 1, max: 40, step: 1, unit: 'yrs', advanced: true },
    ],
    calculate: (v) => {
      const bal = parseNum(v.currentBalance);
      const rOld = parseNum(v.currentRate);
      const remMo = parseNum(v.remainingMonths);
      const rNew = parseNum(v.newRate);
      const newYrs = parseNum(v.newTermYears);
      const costs = parseNum(v.closingCosts);
      const roll = String(v.rollClosingCosts || 'upfront') === 'roll';
      const holdYrs = v.expectedHoldYears === undefined ? 7 : parseNum(v.expectedHoldYears);

      if ([bal, rOld, remMo, rNew, newYrs, costs, holdYrs].some(isNaN)) {
        return calcError('Please enter valid numeric balances, rates, loan terms, and closing costs.');
      }
      if (bal <= 0 || remMo < 1 || remMo > 600 || newYrs < 1 || newYrs > 50 || holdYrs < 1 || holdYrs > 50 || rOld < 0 || rOld > 100 || rNew < 0 || rNew > 100 || costs < 0) {
        return calcError('Loan terms must be 1–50 years (≤600 mos), rates 0–100%, and balances positive.');
      }

      const oldPmt = calcPmt(bal, rOld, remMo);
      const newPrincipal = roll ? bal + costs : bal;
      const newMonths = Math.round(newYrs * 12);
      const newPmt = calcPmt(newPrincipal, rNew, newMonths);

      const monthlySavings = oldPmt - newPmt;
      const breakEvenMonths = monthlySavings > 0 ? costs / monthlySavings : Infinity;

      const oldTotalInt = oldPmt * remMo - bal;
      const newTotalInt = newPmt * newMonths - newPrincipal;
      const lifetimeNetSavings = (oldPmt * remMo) - (newPmt * newMonths + (roll ? 0 : costs));

      // Compare total wealth position at expectedHoldYears (Cash Flow Saved - Ending Loan Balance Diff - Upfront Cost)
      const holdMo = Math.min(Math.round(holdYrs * 12), remMo, newMonths);
      const simRemBal = (p0: number, apr: number, pmt: number, m: number) => {
        let b = p0;
        const rm = apr / 100 / 12;
        for (let i = 0; i < m; i++) {
          b = b * (1 + rm) - pmt;
        }
        return Math.max(0, b);
      };
      const oldBalAtHold = simRemBal(bal, rOld, oldPmt, holdMo);
      const newBalAtHold = simRemBal(newPrincipal, rNew, newPmt, holdMo);
      const holdNetBenefit = monthlySavings * holdMo + (oldBalAtHold - newBalAtHold) - (roll ? 0 : costs);

      return {
        primaryValue: fmt(monthlySavings, 2),
        primaryUnit: '$ / month P&I Payment Savings',
        secondaryOutputs: [
          { label: 'Current Monthly P&I', value: fmtCurrency(oldPmt) },
          { label: 'New Refinanced P&I', value: fmtCurrency(newPmt) },
          { label: 'Break-Even Point', value: Number.isFinite(breakEvenMonths) ? `${Math.ceil(breakEvenMonths)} mos (${fmt(breakEvenMonths / 12, 1)} yrs)` : 'Never (Higher Pmt)' },
          { label: `${holdYrs}-Yr Net Wealth Benefit`, value: fmtCurrency(holdNetBenefit) },
          { label: 'Lifetime Interest Delta', value: fmtCurrency(oldTotalInt - newTotalInt) },
          { label: 'Lifetime Net Cash Savings', value: fmtCurrency(lifetimeNetSavings) },
          { label: 'New Financed Principal', value: fmtCurrency(newPrincipal) },
        ],
        steps: [
          `Current P&I (${fmtCurrency(bal)} @ ${rOld}% over ${remMo} mos) = ${fmtCurrency(oldPmt)}/mo (remaining interest: ${fmtCurrency(oldTotalInt)}).`,
          `New P&I (${fmtCurrency(newPrincipal)} @ ${rNew}% over ${newMonths} mos) = ${fmtCurrency(newPmt)}/mo → Monthly payment change = ${monthlySavings >= 0 ? '+' : ''}${fmtCurrency(monthlySavings)}/mo.`,
          `Simple Break-Even = ${fmtCurrency(costs)} ÷ ${fmtCurrency(Math.max(0.01, monthlySavings))} = ${Number.isFinite(breakEvenMonths) ? `${fmt(breakEvenMonths, 1)} months` : 'N/A (no monthly savings)'}.`,
          `Over a ${holdYrs}-year stay (${holdMo} mos), combining cash-flow savings, closing costs, and remaining principal delta yields net wealth impact of ${fmtCurrency(holdNetBenefit)}.`,
        ],
      };
    },
  },

  // 503. HELOC Payment & Draw Calculator
  {
    slug: 'heloc-calculator',
    title: 'HELOC Payment & Equity Calculator',
    category: 'finance',
    formulaDisplay: 'Draw Pmt = Bal × (APR/12)  |  Repay P&I = Bal × [r(1+r)^n ÷ ((1+r)^n − 1)]  |  CLTV = (Mtg + HELOC) ÷ Value',
    inputs: [
      { id: 'homeValue', label: 'Estimated Home Market Value', defaultValue: 550000, type: 'number', min: 10000, max: 50000000, step: 5000, unit: '$' },
      { id: 'existingMortgageBalance', label: 'Existing First Mortgage Balance', defaultValue: 290000, type: 'number', min: 0, max: 50000000, step: 5000, unit: '$' },
      { id: 'helocDrawAmount', label: 'Planned HELOC Credit Draw Amount', defaultValue: 85000, type: 'number', min: 1000, max: 10000000, step: 1000, unit: '$' },
      { id: 'helocApr', label: 'HELOC Variable Interest Rate (APR %)', defaultValue: 8.25, type: 'number', min: 0, max: 30, step: 0.125, unit: '%' },
      { id: 'drawPeriodYears', label: 'Interest-Only Draw Period (Years)', defaultValue: 10, type: 'number', min: 1, max: 15, step: 1, unit: 'yrs' },
      { id: 'repaymentPeriodYears', label: 'Amortizing Repayment Period (Years)', defaultValue: 20, type: 'number', min: 1, max: 30, step: 1, unit: 'yrs' },
      { id: 'maxLenderCltvPct', label: 'Lender Max CLTV Cap (%)', defaultValue: 85, type: 'number', min: 50, max: 95, step: 5, unit: '%', advanced: true },
    ],
    calculate: (v) => {
      const hv = parseNum(v.homeValue);
      const mtg = parseNum(v.existingMortgageBalance);
      const draw = parseNum(v.helocDrawAmount);
      const apr = parseNum(v.helocApr);
      const drawYrs = parseNum(v.drawPeriodYears);
      const repayYrs = parseNum(v.repaymentPeriodYears);
      const maxCltv = v.maxLenderCltvPct === undefined ? 85 : parseNum(v.maxLenderCltvPct);

      if ([hv, mtg, draw, apr, drawYrs, repayYrs, maxCltv].some(isNaN)) {
        return calcError('Please enter valid numeric values for home value, mortgage balance, HELOC draw, rate, and terms.');
      }
      if (hv <= 0 || draw <= 0 || drawYrs < 1 || drawYrs > 30 || repayYrs < 1 || repayYrs > 50 || mtg < 0 || apr < 0 || apr > 100 || maxCltv <= 0 || maxCltv > 100) {
        return calcError('Home value and draw must be positive, terms 1–50 yrs, and rates/CLTV within 0–100%.');
      }

      const drawMonths = Math.round(drawYrs * 12);
      const repayMonths = Math.round(repayYrs * 12);
      const interestOnlyMonthly = draw * (apr / 100 / 12);
      const repayMonthly = calcPmt(draw, apr, repayMonths);

      const drawTotalInterest = interestOnlyMonthly * drawMonths;
      const repayTotalInterest = repayMonthly * repayMonths - draw;
      const totalLifetimeInterest = drawTotalInterest + repayTotalInterest;

      const cltvPct = ((mtg + draw) / hv) * 100;
      const maxCreditLine = Math.max(0, hv * (maxCltv / 100) - mtg);
      const equityStatus = cltvPct <= maxCltv ? `Eligible (≤ ${maxCltv}% CLTV)` : `Exceeds ${maxCltv}% Limit`;

      return {
        primaryValue: fmt(repayMonthly, 2),
        primaryUnit: '$ / month Repayment Period P&I',
        secondaryOutputs: [
          { label: `Draw Period Interest-Only (${drawYrs}y)`, value: fmtCurrency(interestOnlyMonthly), unit: '/mo' },
          { label: 'Payment Reset Shock', value: `+${fmtCurrency(repayMonthly - interestOnlyMonthly)}`, unit: '/mo jump' },
          { label: 'Combined LTV (CLTV)', value: fmt(cltvPct, 2), unit: '%' },
          { label: `Max Borrowing Power (${maxCltv}%)`, value: fmtCurrency(maxCreditLine) },
          { label: 'Lender CLTV Check', value: equityStatus },
          { label: 'Total Lifetime Interest', value: fmtCurrency(totalLifetimeInterest) },
          { label: 'Total Principal + Interest', value: fmtCurrency(draw + totalLifetimeInterest) },
        ],
        steps: [
          `Equity Check: (${fmtCurrency(mtg)} mortgage + ${fmtCurrency(draw)} HELOC) ÷ ${fmtCurrency(hv)} = ${fmt(cltvPct, 2)}% CLTV (Max capacity at ${maxCltv}% CLTV = ${fmtCurrency(maxCreditLine)}).`,
          `Phase 1 — Interest-Only Draw (${drawYrs} yrs / ${drawMonths} mos): ${fmtCurrency(draw)} × (${apr}% ÷ 12) = ${fmtCurrency(interestOnlyMonthly)}/mo (${fmtCurrency(drawTotalInterest)} interest).`,
          `Phase 2 — Amortizing Repayment (${repayYrs} yrs / ${repayMonths} mos): Full P&I jumps to ${fmtCurrency(repayMonthly)}/mo (+${fmtCurrency(repayMonthly - interestOnlyMonthly)}/mo payment shock).`,
          `Combined lifetime HELOC interest across both phases = ${fmtCurrency(totalLifetimeInterest)}.`,
        ],
      };
    },
  },

  // 504. Mortgage Payoff & Extra Payment Calculator
  {
    slug: 'mortgage-payoff-extra-payment-calculator',
    title: 'Mortgage Payoff & Extra Payment Calculator',
    category: 'finance',
    formulaDisplay: 'Bi-Weekly = 26 × (P&I ÷ 2)  |  Interest Saved = Baseline Total Interest − Accelerated Interest',
    inputs: [
      { id: 'loanBalance', label: 'Current Mortgage Principal Balance', defaultValue: 350000, type: 'number', min: 1000, max: 50000000, step: 2500, unit: '$' },
      { id: 'interestRate', label: 'Mortgage Interest Rate (APR %)', defaultValue: 6.5, type: 'number', min: 0, max: 25, step: 0.125, unit: '%' },
      { id: 'remainingYears', label: 'Remaining Loan Term (Years)', defaultValue: 25, type: 'number', min: 1, max: 40, step: 1, unit: 'yrs' },
      { id: 'extraMonthly', label: 'Extra Monthly Principal Payment', defaultValue: 350, type: 'number', min: 0, max: 500000, step: 50, unit: '$' },
      { id: 'annualLumpSum', label: 'Extra Annual Lump Sum (Once/Yr)', defaultValue: 0, type: 'number', min: 0, max: 5000000, step: 250, unit: '$' },
      { id: 'oneTimeLumpSum', label: 'Immediate One-Time Principal Payment', defaultValue: 0, type: 'number', min: 0, max: 50000000, step: 500, unit: '$', advanced: true },
      {
        id: 'biweeklyMode',
        label: 'Enable True Bi-Weekly Schedule?',
        type: 'select',
        defaultValue: 'no',
        options: [
          { label: 'No — Standard 12 Monthly Payments/Yr', value: 'no' },
          { label: 'Yes — Bi-Weekly Equivalent (13 Payments/Yr)', value: 'yes' },
        ],
      },
    ],
    calculate: (v) => {
      const bal0 = parseNum(v.loanBalance);
      const apr = parseNum(v.interestRate);
      const remYrs = parseNum(v.remainingYears);
      const extraMo = parseNum(v.extraMonthly);
      const extraYr = parseNum(v.annualLumpSum);
      const oneTime = v.oneTimeLumpSum === undefined ? 0 : parseNum(v.oneTimeLumpSum);
      const biweekly = String(v.biweeklyMode || 'no') === 'yes';

      if ([bal0, apr, remYrs, extraMo, extraYr, oneTime].some(isNaN)) {
        return calcError('Please enter valid numeric mortgage balance, rate, remaining term, and extra payments.');
      }
      if (bal0 <= 0 || remYrs <= 0 || remYrs > 50 || apr < 0 || apr > 100 || extraMo < 0 || extraYr < 0 || oneTime < 0) {
        return calcError('Loan term must be 1–50 years, rate 0–100%, and balance positive.');
      }

      const baseMonths = Math.round(remYrs * 12);
      const basePmt = calcPmt(bal0, apr, baseMonths);
      const baseTotalInterest = basePmt * baseMonths - bal0;

      // Equivalent 13th payment spread monthly when bi-weekly selected (26 half-payments = 13 full monthly P&I)
      const biweeklyExtraMo = biweekly ? basePmt / 12 : 0;
      const rm = apr / 100 / 12;

      let bal = Math.max(0, bal0 - oneTime);
      let accelMonths = 0;
      let accelInterest = 0;

      while (bal > 0.005 && accelMonths < baseMonths + 12) {
        accelMonths++;
        const intMo = bal * rm;
        accelInterest += intMo;
        let sched = basePmt + extraMo + biweeklyExtraMo;
        if (accelMonths % 12 === 0) sched += extraYr;
        const pay = Math.min(bal + intMo, sched);
        bal = Math.max(0, bal + intMo - pay);
      }

      const interestSaved = Math.max(0, baseTotalInterest - accelInterest);
      const monthsSaved = Math.max(0, baseMonths - accelMonths);

      return {
        primaryValue: fmt(interestSaved, 2),
        primaryUnit: `$ Total Interest Saved (${monthsSaved} Months Shaved)`,
        secondaryOutputs: [
          { label: 'Scheduled Base Monthly P&I', value: fmtCurrency(basePmt) },
          { label: 'Effective Monthly Outflow', value: fmtCurrency(basePmt + extraMo + biweeklyExtraMo) },
          { label: 'Baseline Payoff Horizon', value: `${baseMonths} mos`, unit: `(${fmt(baseMonths / 12, 1)} yrs)` },
          { label: 'Accelerated Payoff Horizon', value: `${accelMonths} mos`, unit: `(${fmt(accelMonths / 12, 1)} yrs)` },
          { label: 'Time Shaved Off Mortgage', value: `${Math.floor(monthsSaved / 12)}y ${monthsSaved % 12}m` },
          { label: 'Baseline Total Interest', value: fmtCurrency(baseTotalInterest) },
          { label: 'Accelerated Total Interest', value: fmtCurrency(accelInterest) },
        ],
        steps: [
          `Baseline Schedule (${fmtCurrency(bal0)} @ ${apr}% over ${baseMonths} mos): Monthly P&I = ${fmtCurrency(basePmt)}; Baseline Interest = ${fmtCurrency(baseTotalInterest)}.`,
          `Acceleration Strategy: +${fmtCurrency(extraMo)}/mo extra${biweekly ? ` + ${fmtCurrency(biweeklyExtraMo)}/mo bi-weekly equiv.` : ''}${extraYr > 0 ? ` + ${fmtCurrency(extraYr)}/yr lump sum` : ''}${oneTime > 0 ? ` + ${fmtCurrency(oneTime)} upfront` : ''}.`,
          `Loan retires in ${accelMonths} months (${fmt(accelMonths / 12, 2)} yrs), shaving ${Math.floor(monthsSaved / 12)} years ${monthsSaved % 12} months and eliminating ${fmtCurrency(interestSaved)} of interest.`,
        ],
      };
    },
  },

  // 505. Home Affordability & DTI Calculator
  {
    slug: 'home-affordability-dti-calculator',
    title: 'Home Affordability & DTI Calculator',
    category: 'finance',
    formulaDisplay: 'Max Housing PITI = min(GrossMo × FrontDTI, GrossMo × BackDTI − MonthlyDebts)',
    inputs: [
      { id: 'annualGrossIncome', label: 'Gross Annual Household Income', defaultValue: 135000, type: 'number', min: 1000, max: 50000000, step: 2500, unit: '$' },
      { id: 'monthlyDebts', label: 'Existing Monthly Non-Housing Debt Payments', defaultValue: 650, type: 'number', min: 0, max: 1000000, step: 50, unit: '$', helpText: 'Car loans, minimum credit cards, student loans, alimony/child support.' },
      { id: 'downPaymentCash', label: 'Available Down Payment Cash', defaultValue: 90000, type: 'number', min: 0, max: 50000000, step: 5000, unit: '$' },
      { id: 'mortgageRate', label: 'Estimated Mortgage Rate (APR %)', defaultValue: 6.5, type: 'number', min: 0, max: 25, step: 0.125, unit: '%' },
      { id: 'loanTermYears', label: 'Mortgage Term (Years)', defaultValue: 30, type: 'number', min: 10, max: 40, step: 5, unit: 'yrs' },
      { id: 'propertyTaxRate', label: 'Annual Property Tax Rate (% of Price)', defaultValue: 1.2, type: 'number', min: 0, max: 10, step: 0.1, unit: '%', advanced: true },
      { id: 'homeInsuranceAnnual', label: 'Annual Homeowner Insurance', defaultValue: 1800, type: 'number', min: 0, max: 100000, step: 100, unit: '$', advanced: true },
      { id: 'hoaMonthly', label: 'Monthly HOA / Condo Dues', defaultValue: 150, type: 'number', min: 0, max: 50000, step: 25, unit: '$', advanced: true },
      { id: 'frontDtiPct', label: 'Front-End Housing DTI Cap (%)', defaultValue: 28, type: 'number', min: 15, max: 50, step: 1, unit: '%', advanced: true },
      { id: 'backDtiPct', label: 'Back-End Total DTI Cap (%)', defaultValue: 36, type: 'number', min: 20, max: 55, step: 1, unit: '%', advanced: true },
    ],
    calculate: (v) => {
      const inc = parseNum(v.annualGrossIncome);
      const debts = parseNum(v.monthlyDebts);
      const dp = parseNum(v.downPaymentCash);
      const apr = parseNum(v.mortgageRate);
      const yrs = parseNum(v.loanTermYears);
      const taxPct = v.propertyTaxRate === undefined ? 1.2 : parseNum(v.propertyTaxRate);
      const insYr = v.homeInsuranceAnnual === undefined ? 1800 : parseNum(v.homeInsuranceAnnual);
      const hoa = v.hoaMonthly === undefined ? 150 : parseNum(v.hoaMonthly);
      const frontCap = v.frontDtiPct === undefined ? 28 : parseNum(v.frontDtiPct);
      const backCap = v.backDtiPct === undefined ? 36 : parseNum(v.backDtiPct);

      if ([inc, debts, dp, apr, yrs, taxPct, insYr, hoa, frontCap, backCap].some(isNaN)) {
        return calcError('Please enter valid numeric values for income, debts, down payment, rate, and DTI ratios.');
      }
      if (inc <= 0 || yrs < 1 || [debts, dp, apr, taxPct, insYr, hoa].some((x) => x < 0)) {
        return calcError('Income and term must be positive; debts, down payment, and rates cannot be negative.');
      }

      const moGross = inc / 12;
      const frontLimit = moGross * (frontCap / 100);
      const backLimit = Math.max(0, moGross * (backCap / 100) - debts);
      const maxHousingBudget = Math.max(0, Math.min(frontLimit, backLimit));
      const bindingRule = backLimit < frontLimit ? `Back-End DTI (${backCap}%)` : `Front-End DTI (${frontCap}%)`;

      const months = Math.round(yrs * 12);
      const rm = apr / 100 / 12;
      const piPerDollar = rm === 0 ? 1 / months : (rm * Math.pow(1 + rm, months)) / (Math.pow(1 + rm, months) - 1);
      const monthlyTaxFactor = taxPct / 100 / 12;
      const fixedInsHoa = insYr / 12 + hoa;

      // Piecewise LTV solver: no PMI if Price <= 5 * dp (<= 80% LTV); apply 0.55% PMI if above 80% LTV
      const noPmiPrice = Math.max(
        0,
        (maxHousingBudget - fixedInsHoa + dp * piPerDollar) / (piPerDollar + monthlyTaxFactor)
      );
      let maxPrice = noPmiPrice;
      let pmiMonthly = 0;

      if (dp > 0 && noPmiPrice > dp * 5) {
        const pmiRateMo = 0.0055 / 12;
        const withPmiPrice = Math.max(
          0,
          (maxHousingBudget - fixedInsHoa + dp * (piPerDollar + pmiRateMo)) /
            (piPerDollar + monthlyTaxFactor + pmiRateMo)
        );
        if (withPmiPrice > dp * 5) {
          maxPrice = withPmiPrice;
          pmiMonthly = (maxPrice - dp) * pmiRateMo;
        } else {
          // Exact 80% LTV boundary avoids PMI cliff while maximizing home price
          maxPrice = dp * 5;
          pmiMonthly = 0;
        }
      } else if (dp === 0 && noPmiPrice > 0) {
        const pmiRateMo = 0.0055 / 12;
        maxPrice = Math.max(0, (maxHousingBudget - fixedInsHoa) / (piPerDollar + monthlyTaxFactor + pmiRateMo));
        pmiMonthly = maxPrice * pmiRateMo;
      }

      const maxLoan = Math.max(0, maxPrice - dp);
      const piMonthly = maxLoan * piPerDollar;
      const taxMonthly = maxPrice * monthlyTaxFactor;
      const actualHousingOutflow = piMonthly + taxMonthly + fixedInsHoa + pmiMonthly;
      const ltv = maxPrice > 0 ? (maxLoan / maxPrice) * 100 : 0;

      return {
        primaryValue: fmt(maxPrice, 2),
        primaryUnit: '$ Maximum Affordable Home Price',
        secondaryOutputs: [
          { label: 'Max Mortgage Loan Amount', value: fmtCurrency(maxLoan) },
          { label: 'Est. Monthly Housing (PITI+HOA)', value: fmtCurrency(actualHousingOutflow) },
          { label: 'Monthly P&I Portion', value: fmtCurrency(piMonthly) },
          { label: 'Property Tax + Ins + HOA + PMI', value: fmtCurrency(taxMonthly + fixedInsHoa + pmiMonthly) },
          { label: 'Binding DTI Constraint', value: bindingRule },
          { label: 'Estimated LTV Ratio', value: fmt(ltv, 1), unit: '%' },
          { label: 'Post-Purchase Back-End DTI', value: fmt(((actualHousingOutflow + debts) / moGross) * 100, 1), unit: '%' },
        ],
        steps: [
          `Monthly Gross Income = ${fmtCurrency(moGross)}. Front-End (${frontCap}%) cap = ${fmtCurrency(frontLimit)}/mo; Back-End (${backCap}% − ${fmtCurrency(debts)} debts) = ${fmtCurrency(backLimit)}/mo.`,
          `Binding Budget Ceiling = ${fmtCurrency(maxHousingBudget)}/mo (${bindingRule}).`,
          `Subtracting property tax (${fmtCurrency(taxMonthly)}), insurance (${fmtCurrency(insYr / 12)}), HOA (${fmtCurrency(hoa)})${pmiMonthly > 0 ? `, and PMI (${fmtCurrency(pmiMonthly)})` : ''} leaves ${fmtCurrency(piMonthly)}/mo for P&I → Max Loan ${fmtCurrency(maxLoan)} + ${fmtCurrency(dp)} down = ${fmtCurrency(maxPrice)}.`,
        ],
      };
    },
  },

  // 506. Adjustable-Rate Mortgage (ARM) Calculator
  {
    slug: 'arm-mortgage-calculator',
    title: 'Adjustable-Rate Mortgage (ARM) Calculator',
    category: 'finance',
    formulaDisplay: 'Reset Rate = clamp(Index + Margin, prev ± PeriodicCap, [Floor, Initial + LifeCap])',
    inputs: [
      { id: 'loanAmount', label: 'Mortgage Loan Principal', defaultValue: 400000, type: 'number', min: 1000, max: 50000000, step: 5000, unit: '$' },
      { id: 'loanTermYears', label: 'Amortization Term (Years)', defaultValue: 30, type: 'number', min: 10, max: 40, step: 5, unit: 'yrs' },
      { id: 'initialFixedYears', label: 'Initial Fixed Period (Years, e.g. 5/1 ARM)', defaultValue: 5, type: 'number', min: 1, max: 15, step: 1, unit: 'yrs' },
      { id: 'initialRate', label: 'Initial Teaser Rate (APR %)', defaultValue: 5.5, type: 'number', min: 0.1, max: 20, step: 0.125, unit: '%' },
      { id: 'expectedIndexPlusMargin', label: 'Expected Indexed Rate (Index + Margin %)', defaultValue: 7.25, type: 'number', min: 0.1, max: 25, step: 0.125, unit: '%', helpText: 'e.g., 30-Day SOFR (4.50%) + Margin (2.75%) = 7.25%.' },
      { id: 'initialResetCap', label: 'Initial Adjustment Cap (Max First Jump %)', defaultValue: 2.0, type: 'number', min: 0.25, max: 10, step: 0.25, unit: '%' },
      { id: 'periodicCap', label: 'Periodic Annual Cap (% / yr)', defaultValue: 2.0, type: 'number', min: 0.25, max: 10, step: 0.25, unit: '%', advanced: true },
      { id: 'lifetimeCap', label: 'Lifetime Rate Cap (+% Above Initial)', defaultValue: 5.0, type: 'number', min: 0.5, max: 12, step: 0.25, unit: '%', advanced: true },
    ],
    calculate: (v) => {
      const loan = parseNum(v.loanAmount);
      const yrs = parseNum(v.loanTermYears);
      const fixedYrs = parseNum(v.initialFixedYears);
      const rInit = parseNum(v.initialRate);
      const targetIdx = parseNum(v.expectedIndexPlusMargin);
      const capInit = parseNum(v.initialResetCap);
      const capPer = v.periodicCap === undefined ? 2.0 : parseNum(v.periodicCap);
      const capLife = v.lifetimeCap === undefined ? 5.0 : parseNum(v.lifetimeCap);

      if ([loan, yrs, fixedYrs, rInit, targetIdx, capInit, capPer, capLife].some(isNaN)) {
        return calcError('Please enter valid numbers for loan amount, ARM terms, initial rate, and caps.');
      }
      if (loan <= 0 || yrs < 5 || yrs > 50 || fixedYrs < 1 || fixedYrs >= yrs || rInit <= 0 || rInit > 100 || targetIdx <= 0 || targetIdx > 100 || capInit < 0 || capPer < 0 || capLife < 0) {
        return calcError('Loan term must be 5–50 years, fixed period shorter than total term, and rates within 0–100%.');
      }

      const maxLifeRate = rInit + capLife;
      const totalMonths = Math.round(yrs * 12);
      const initPmt = calcPmt(loan, rInit, totalMonths);

      // Run expected scenario + worst-case cap trajectory year by year
      const simulateArm = (worstCase: boolean) => {
        let bal = loan;
        let curRate = rInit;
        let totalInterest = 0;
        let firstResetPmt = initPmt;
        let maxPmt = initPmt;

        for (let y = 1; y <= yrs; y++) {
          if (y > fixedYrs) {
            const desired = worstCase ? maxLifeRate : targetIdx;
            const stepCap = y === fixedYrs + 1 ? capInit : capPer;
            const delta = desired - curRate;
            const clampedDelta = Math.max(-stepCap, Math.min(stepCap, delta));
            curRate = Math.min(maxLifeRate, Math.max(0.1, curRate + clampedDelta));
          }
          const remMonths = totalMonths - (y - 1) * 12;
          const pmt = calcPmt(bal, curRate, remMonths);
          if (y === fixedYrs + 1) firstResetPmt = pmt;
          if (pmt > maxPmt) maxPmt = pmt;

          const rm = curRate / 100 / 12;
          for (let m = 0; m < 12; m++) {
            const intMo = bal * rm;
            totalInterest += intMo;
            bal = Math.max(0, bal + intMo - pmt);
          }
        }
        return { firstResetPmt, maxPmt, totalInterest, finalRate: curRate };
      };

      const exp = simulateArm(false);
      const worst = simulateArm(true);

      return {
        primaryValue: fmt(initPmt, 2),
        primaryUnit: `$ / month Initial P&I (${fixedYrs} Yrs Fixed)`,
        secondaryOutputs: [
          { label: `Yr ${fixedYrs + 1} Expected Reset P&I`, value: fmtCurrency(exp.firstResetPmt) },
          { label: 'Expected Indexed Rate', value: fmt(exp.finalRate, 3), unit: '%' },
          { label: `Worst-Case Yr ${fixedYrs + 1} P&I`, value: fmtCurrency(worst.firstResetPmt) },
          { label: 'Worst-Case Max Possible P&I', value: fmtCurrency(worst.maxPmt) },
          { label: 'Lifetime Rate Ceiling', value: fmt(maxLifeRate, 3), unit: '%' },
          { label: 'Expected Total Interest', value: fmtCurrency(exp.totalInterest) },
          { label: 'Worst-Case Total Interest', value: fmtCurrency(worst.totalInterest) },
        ],
        steps: [
          `Initial ${fixedYrs}-year fixed phase (${fmtCurrency(loan)} @ ${rInit}% over ${totalMonths} mos): Monthly P&I = ${fmtCurrency(initPmt)}/mo.`,
          `At Year ${fixedYrs + 1} reset under expected ${targetIdx}% rate (subject to ${capInit}% initial / ${capPer}% periodic / ${maxLifeRate}% life cap): payment adjusts to ${fmtCurrency(exp.firstResetPmt)}/mo.`,
          `Under a maximum worst-case rate spike up to ${maxLifeRate}% ceiling: first reset hits ${fmtCurrency(worst.firstResetPmt)}/mo and peaks at ${fmtCurrency(worst.maxPmt)}/mo.`,
        ],
      };
    },
  },

  // 507. UK Stamp Duty Land Tax (SDLT) Calculator (2026–27 England & NI)
  {
    slug: 'uk-stamp-duty-calculator',
    title: 'UK Stamp Duty (SDLT) Calculator',
    category: 'finance',
    formulaDisplay: 'SDLT = Σ Slice_i × (BaseRate_i + AdditionalProperty5% + NonResident2%)',
    inputs: [
      { id: 'propertyPrice', label: 'Property Purchase Price (£)', defaultValue: 425000, type: 'number', min: 0, max: 100000000, step: 5000, unit: '£' },
      {
        id: 'buyerType',
        label: '2026–27 HMRC Buyer Classification',
        type: 'select',
        defaultValue: 'standard',
        options: [
          { label: 'Standard Home Mover (Main Residence)', value: 'standard' },
          { label: 'First-Time Buyer (Relief up to £500k)', value: 'ftb' },
          { label: 'Additional Property / Buy-to-Let (+5% Surcharge)', value: 'additional' },
        ],
      },
      {
        id: 'nonUkResident',
        label: 'Non-UK Resident Surcharge (+2%)?',
        type: 'select',
        defaultValue: 'no',
        options: [
          { label: 'No — UK Tax Resident', value: 'no' },
          { label: 'Yes — Non-UK Resident (+2% Surcharge)', value: 'yes' },
        ],
      },
    ],
    calculate: (v) => {
      const price = parseNum(v.propertyPrice);
      const buyer = String(v.buyerType || 'standard');
      const nonRes = String(v.nonUkResident || 'no') === 'yes';

      if (isNaN(price) || price < 0) {
        return calcError('Please enter a valid non-negative property purchase price in GBP.');
      }

      const surAdd = buyer === 'additional' ? 0.05 : 0;
      const surNonRes = nonRes ? 0.02 : 0;
      const extraRate = surAdd + surNonRes;

      // Post-April 2025 (2026-27) England & Northern Ireland SDLT bands
      let tax = 0;
      let ruleApplied = 'Standard Residential Bands';
      const calcSlices = (bands: { max: number; rate: number }[]): number => {
        let prev = 0;
        let sum = 0;
        for (const b of bands) {
          if (price <= prev) break;
          const slice = Math.min(price, b.max) - prev;
          sum += slice * (b.rate + extraRate);
          prev = b.max;
        }
        return sum;
      };

      const standardBands = [
        { max: 125000, rate: 0.0 },
        { max: 250000, rate: 0.02 },
        { max: 925000, rate: 0.05 },
        { max: 1500000, rate: 0.1 },
        { max: Infinity, rate: 0.12 },
      ];

      if (buyer === 'ftb' && price <= 500000) {
        ruleApplied = 'First-Time Buyer Relief (0% to £300k, 5% £300k–£500k)';
        tax = calcSlices([
          { max: 300000, rate: 0.0 },
          { max: 500000, rate: 0.05 },
        ]);
      } else {
        if (buyer === 'ftb' && price > 500000) {
          ruleApplied = 'Standard Rates (Price > £500k Ineligible for FTB Relief)';
        } else if (buyer === 'additional') {
          ruleApplied = 'Higher Rates (+5% Additional Property Surcharge)';
        }
        tax = calcSlices(standardBands);
      }

      // Note: properties under £40k exempt from +5% additional surcharge
      if (buyer === 'additional' && price < 40000) {
        tax = 0;
        ruleApplied = 'Exempt (< £40,000 threshold)';
      }

      const effRate = price > 0 ? (tax / price) * 100 : 0;

      // Also compute standard vs FTB saving if eligible
      const stdTax = calcSlices(standardBands);
      const ftbSavings = buyer === 'ftb' && price <= 500000 ? Math.max(0, stdTax - tax) : 0;

      return {
        primaryValue: fmt(tax, 2),
        primaryUnit: '£ England & NI SDLT Payable (2026–27)',
        secondaryOutputs: [
          { label: 'Effective SDLT Tax Rate', value: fmt(effRate, 2), unit: '%' },
          { label: 'Total Cash Req (Price + SDLT)', value: fmtCurrency(price + tax, '£') },
          { label: 'Applied HMRC Regime', value: ruleApplied },
          { label: 'First-Time Buyer Relief Saved', value: fmtCurrency(ftbSavings, '£') },
          { label: 'Non-Resident Surcharge', value: nonRes ? '+2% Applied' : '0% (UK Resident)' },
        ],
        steps: [
          `Purchase Price: ${fmtCurrency(price, '£')} | Regime: ${ruleApplied}${nonRes ? ' + 2% Non-UK Resident' : ''}.`,
          buyer === 'ftb' && price <= 500000
            ? `FTB Bands: 0% on first £300,000 + 5% on ${fmtCurrency(Math.max(0, price - 300000), '£')} = ${fmtCurrency(tax, '£')} (saves ${fmtCurrency(ftbSavings, '£')} vs. standard).`
            : `Standard Bands (post-April 2025 active in 2026–27): 0% up to £125k, 2% (£125k–£250k), 5% (£250k–£925k), 10% (£925k–£1.5M), 12% (>£1.5M)${extraRate > 0 ? ` + ${(extraRate * 100).toFixed(0)}% surcharge` : ''} → ${fmtCurrency(tax, '£')}.`,
          `Effective SDLT burden = ${fmt(effRate, 2)}% of property value.`,
        ],
      };
    },
  },

  // 508. Debt Consolidation & Effective APR Calculator
  {
    slug: 'debt-consolidation-calculator',
    title: 'Debt Consolidation & Effective APR Calculator',
    category: 'finance',
    formulaDisplay: 'Effective APR = IRR(Net Proceeds = Σ PMT/(1+r)^k)  |  Weighted APR = Σ(Bal_i × APR_i) ÷ Σ Bal_i',
    inputs: [
      { id: 'debt1Balance', label: 'Existing Debt 1 Balance', defaultValue: 9500, type: 'number', min: 0, max: 10000000, step: 250, unit: '$' },
      { id: 'debt1Apr', label: 'Existing Debt 1 APR (%)', defaultValue: 23.9, type: 'number', min: 0, max: 60, step: 0.1, unit: '%' },
      { id: 'debt1Monthly', label: 'Current Debt 1 Monthly Payment', defaultValue: 295, type: 'number', min: 0, max: 1000000, step: 10, unit: '$' },
      { id: 'debt2Balance', label: 'Existing Debt 2 Balance', defaultValue: 6500, type: 'number', min: 0, max: 10000000, step: 250, unit: '$' },
      { id: 'debt2Apr', label: 'Existing Debt 2 APR (%)', defaultValue: 19.5, type: 'number', min: 0, max: 60, step: 0.1, unit: '%' },
      { id: 'debt2Monthly', label: 'Current Debt 2 Monthly Payment', defaultValue: 190, type: 'number', min: 0, max: 1000000, step: 10, unit: '$' },
      { id: 'debt3Balance', label: 'Existing Debt 3 Balance', defaultValue: 4000, type: 'number', min: 0, max: 10000000, step: 250, unit: '$', advanced: true },
      { id: 'debt3Apr', label: 'Existing Debt 3 APR (%)', defaultValue: 14.0, type: 'number', min: 0, max: 60, step: 0.1, unit: '%', advanced: true },
      { id: 'debt3Monthly', label: 'Current Debt 3 Monthly Payment', defaultValue: 115, type: 'number', min: 0, max: 1000000, step: 10, unit: '$', advanced: true },
      { id: 'newLoanApr', label: 'New Consolidation Loan Nominal Rate (%)', defaultValue: 10.5, type: 'number', min: 0, max: 45, step: 0.25, unit: '%' },
      { id: 'newLoanTermMonths', label: 'New Loan Repayment Term (Months)', defaultValue: 48, type: 'number', min: 6, max: 120, step: 6, unit: 'mo' },
      { id: 'originationFeePct', label: 'Upfront Origination Fee (% of Loan)', defaultValue: 4.0, type: 'number', min: 0, max: 15, step: 0.25, unit: '%' },
    ],
    calculate: (v) => {
      const b1 = parseNum(v.debt1Balance), a1 = parseNum(v.debt1Apr), p1 = parseNum(v.debt1Monthly);
      const b2 = parseNum(v.debt2Balance), a2 = parseNum(v.debt2Apr), p2 = parseNum(v.debt2Monthly);
      const b3 = v.debt3Balance === undefined ? 4000 : parseNum(v.debt3Balance);
      const a3 = v.debt3Apr === undefined ? 14.0 : parseNum(v.debt3Apr);
      const p3 = v.debt3Monthly === undefined ? 115 : parseNum(v.debt3Monthly);
      const newApr = parseNum(v.newLoanApr);
      const newTerm = parseNum(v.newLoanTermMonths);
      const origPct = parseNum(v.originationFeePct);

      if ([b1, a1, p1, b2, a2, p2, b3, a3, p3, newApr, newTerm, origPct].some(isNaN)) {
        return calcError('Please enter valid numbers for balances, APRs, payments, and consolidation loan terms.');
      }
      if ([b1, a1, p1, b2, a2, p2, b3, a3, p3, newApr, origPct].some((x) => x < 0) || newTerm < 1 || newTerm > 600 || newApr > 100 || origPct >= 100) {
        return calcError('New loan term must be 1–600 months, origination fee <100%, and values non-negative.');
      }

      const totalDebt = b1 + b2 + b3;
      if (totalDebt <= 0) return calcError('Total consolidated debt balance must exceed $0.');

      const weightedApr = (b1 * a1 + b2 * a2 + b3 * a3) / totalDebt;
      const curTotalMonthly = p1 + p2 + p3;

      // Simulate existing debts at their stated current payments
      let existingTotalInterest = 0;
      let existingMaxMonths = 0;
      for (const d of [
        { bal: b1, apr: a1, pmt: p1 },
        { bal: b2, apr: a2, pmt: p2 },
        { bal: b3, apr: a3, pmt: p3 },
      ]) {
        if (d.bal <= 0) continue;
        let b = d.bal;
        let m = 0;
        const rm = d.apr / 100 / 12;
        if (d.pmt <= b * rm) {
          existingTotalInterest = Infinity;
          existingMaxMonths = 1200;
          break;
        }
        while (b > 0.005 && m < 1200) {
          m++;
          const i = b * rm;
          existingTotalInterest += i;
          b = Math.max(0, b + i - d.pmt);
        }
        if (m > existingMaxMonths) existingMaxMonths = m;
      }

      // Lender grosses up loan so borrower receives exact totalDebt net of origination fee
      // Or fee is taken from loan: GrossLoan = totalDebt / (1 - origPct/100)
      const grossLoan = origPct >= 100 ? totalDebt : totalDebt / (1 - origPct / 100);
      const feeDollars = grossLoan - totalDebt;
      const newMonthly = calcPmt(grossLoan, newApr, newTerm);
      const newTotalPaid = newMonthly * newTerm;
      const newTotalCost = newTotalPaid - totalDebt; // includes interest + financed origination fee
      const effectiveApr = solveEffectiveApr(totalDebt, newMonthly, newTerm);
      const monthlyCashRelief = curTotalMonthly - newMonthly;
      const netSavings = Number.isFinite(existingTotalInterest) ? existingTotalInterest - newTotalCost : NaN;

      return {
        primaryValue: fmt(newMonthly, 2),
        primaryUnit: '$ / month New Consolidated Payment',
        secondaryOutputs: [
          { label: 'Total Debt Consolidated', value: fmtCurrency(totalDebt) },
          { label: 'True Effective APR (w/ Fee)', value: fmt(effectiveApr, 2), unit: '%' },
          { label: 'Prior Weighted Avg APR', value: fmt(weightedApr, 2), unit: '%' },
          { label: 'Origination Fee Financed', value: fmtCurrency(feeDollars) },
          { label: 'Monthly Cash-Flow Relief', value: `${monthlyCashRelief >= 0 ? '+' : ''}${fmtCurrency(monthlyCashRelief)}`, unit: '/mo' },
          { label: 'New Total Interest + Fee Cost', value: fmtCurrency(newTotalCost) },
          { label: 'Net Savings vs Existing Path', value: Number.isFinite(netSavings) ? fmtCurrency(netSavings) : 'Existing Does Not Amortize' },
        ],
        steps: [
          `Existing Blended Debt: ${fmtCurrency(totalDebt)} across ${fmt(weightedApr, 2)}% weighted APR requiring ${fmtCurrency(curTotalMonthly)}/mo${Number.isFinite(existingTotalInterest) ? ` (${existingMaxMonths} mos, ${fmtCurrency(existingTotalInterest)} interest)` : ''}.`,
          `To clear ${fmtCurrency(totalDebt)} net after a ${origPct}% origination fee, gross loan = ${fmtCurrency(grossLoan)} (fee: ${fmtCurrency(feeDollars)}).`,
          `At ${newApr}% nominal over ${newTerm} months, payment = ${fmtCurrency(newMonthly)}/mo → True Effective APR (TILA method) = ${fmt(effectiveApr, 2)}%.`,
          `Total borrowing cost (interest + fee) = ${fmtCurrency(newTotalCost)}${Number.isFinite(netSavings) ? ` → Net lifetime savings = ${fmtCurrency(netSavings)}` : ''}.`,
        ],
      };
    },
  },

  // 509. Lease vs Buy Car Calculator
  {
    slug: 'lease-vs-buy-car-calculator',
    title: 'Lease vs Buy Car Calculator',
    category: 'finance',
    formulaDisplay: 'Net Cost = Upfront + Total Payments + Fees + Sales Tax − Residual Resale Equity',
    inputs: [
      { id: 'vehiclePrice', label: 'Negotiated Vehicle Price (Cap Cost)', defaultValue: 40000, type: 'number', min: 1000, max: 2000000, step: 1000, unit: '$' },
      { id: 'horizonMonths', label: 'Comparison Horizon / Lease Term (Months)', defaultValue: 36, type: 'number', min: 12, max: 84, step: 12, unit: 'mo' },
      { id: 'salesTaxRate', label: 'Sales / VAT Vehicle Tax Rate (%)', defaultValue: 7.0, type: 'number', min: 0, max: 25, step: 0.5, unit: '%' },
      { id: 'residualPercent', label: 'Expected Value at Term End (% of Price)', defaultValue: 58, type: 'number', min: 10, max: 90, step: 1, unit: '%', helpText: 'Used both as Lease Residual Value and Buy Resale Market Value.' },
      { id: 'leaseDownPayment', label: 'Lease Cap Cost Reduction (Down)', defaultValue: 2500, type: 'number', min: 0, max: 500000, step: 500, unit: '$' },
      { id: 'leaseMoneyFactor', label: 'Lease Money Factor (e.g. 0.0025)', defaultValue: 0.0025, type: 'number', min: 0, max: 0.02, step: 0.0001, helpText: 'Multiply Money Factor × 2,400 to check implied APR (0.0025 × 2400 = 6.0%).' },
      { id: 'leaseFeesTotal', label: 'Lease Acquisition + Disposition Fees', defaultValue: 1095, type: 'number', min: 0, max: 20000, step: 50, unit: '$', advanced: true },
      { id: 'buyDownPayment', label: 'Purchase Cash Down Payment', defaultValue: 5000, type: 'number', min: 0, max: 1000000, step: 500, unit: '$' },
      { id: 'buyLoanApr', label: 'Auto Loan Interest Rate (APR %)', defaultValue: 6.25, type: 'number', min: 0, max: 30, step: 0.25, unit: '%' },
      { id: 'buyLoanTermMonths', label: 'Auto Loan Term (Months)', defaultValue: 60, type: 'number', min: 12, max: 84, step: 12, unit: 'mo' },
    ],
    calculate: (v) => {
      const price = parseNum(v.vehiclePrice);
      const hor = parseNum(v.horizonMonths);
      const taxPct = parseNum(v.salesTaxRate);
      const resPct = parseNum(v.residualPercent);
      const lDown = parseNum(v.leaseDownPayment);
      const mf = parseNum(v.leaseMoneyFactor);
      const lFees = v.leaseFeesTotal === undefined ? 1095 : parseNum(v.leaseFeesTotal);
      const bDown = parseNum(v.buyDownPayment);
      const bApr = parseNum(v.buyLoanApr);
      const bTerm = parseNum(v.buyLoanTermMonths);

      if ([price, hor, taxPct, resPct, lDown, mf, lFees, bDown, bApr, bTerm].some(isNaN)) {
        return calcError('Please enter valid numbers for vehicle price, lease money factor, and purchase loan terms.');
      }
      if (price <= 0 || hor < 1 || hor > 120 || bTerm < 1 || bTerm > 120 || [taxPct, resPct, lDown, mf, lFees, bDown, bApr].some((x) => x < 0) || resPct > 100 || taxPct > 50 || bApr > 100 || mf > 0.1) {
        return calcError('Vehicle terms must be 1–120 months, residual ≤100%, and rates within realistic bounds.');
      }

      const residualVal = price * (resPct / 100);
      const leaseEquivApr = mf * 2400;

      // Standard US lease formula: Adjusted Cap = price - lDown; Deprec = (AdjCap - residual)/hor; Finance = (AdjCap + residual)*mf
      const adjCap = Math.max(0, price - lDown);
      const depFee = (adjCap - residualVal) / hor;
      const finFee = (adjCap + residualVal) * mf;
      const leasePreTaxMonthly = Math.max(0, depFee + finFee);
      const leaseMonthlyWithTax = leasePreTaxMonthly * (1 + taxPct / 100);
      const leaseNetCost = lDown * (1 + taxPct / 100) + leaseMonthlyWithTax * hor + lFees;

      // Buy scenario over exact same horizon `hor`
      const buyTax = price * (taxPct / 100);
      const buyFinanced = Math.max(0, price + buyTax - bDown);
      const buyMonthly = calcPmt(buyFinanced, bApr, bTerm);

      // Remaining loan balance at month `hor`
      let remBal = buyFinanced;
      const rm = bApr / 100 / 12;
      const monthsPaid = Math.min(hor, bTerm);
      for (let i = 0; i < monthsPaid; i++) {
        remBal = remBal * (1 + rm) - buyMonthly;
      }
      remBal = Math.max(0, remBal);
      const buyResaleEquity = residualVal - remBal;
      const buyTotalOutflow = bDown + buyMonthly * monthsPaid;
      const buyNetCost = buyTotalOutflow - buyResaleEquity;

      const netDiff = leaseNetCost - buyNetCost; // positive = Buying saves money

      return {
        primaryValue: fmt(buyNetCost, 2),
        primaryUnit: `$ Net ${hor}-Mo Cost to Buy (vs ${fmtCurrency(leaseNetCost)} Lease)`,
        secondaryOutputs: [
          { label: 'Lease Monthly (incl. Tax)', value: fmtCurrency(leaseMonthlyWithTax) },
          { label: 'Buy Loan Monthly P&I', value: fmtCurrency(buyMonthly) },
          { label: 'Implied Lease APR (MF×2400)', value: fmt(leaseEquivApr, 2), unit: '%' },
          { label: `Total ${hor}-Mo Lease Cost`, value: fmtCurrency(leaseNetCost) },
          { label: `Resale Value at Mo ${hor}`, value: fmtCurrency(residualVal) },
          { label: `Loan Payoff Remaining Mo ${hor}`, value: fmtCurrency(remBal) },
          { label: netDiff >= 0 ? 'Buying Advantage' : 'Leasing Advantage', value: fmtCurrency(Math.abs(netDiff)) },
        ],
        steps: [
          `Vehicle Price ${fmtCurrency(price)} | End-of-Term (${hor} mos) Market/Residual Value (${resPct}%) = ${fmtCurrency(residualVal)}.`,
          `Lease: Equiv APR = ${mf} × 2,400 = ${fmt(leaseEquivApr, 2)}%; Monthly w/ ${taxPct}% tax = ${fmtCurrency(leaseMonthlyWithTax)}/mo → ${hor}-Mo Net Out-of-Pocket = ${fmtCurrency(leaseNetCost)}.`,
          `Buy: Financing ${fmtCurrency(buyFinanced)} @ ${bApr}% (${bTerm} mos) = ${fmtCurrency(buyMonthly)}/mo; after ${monthsPaid} mos, equity = ${fmtCurrency(residualVal)} − ${fmtCurrency(remBal)} payoff = ${fmtCurrency(buyResaleEquity)} → Net Cost = ${fmtCurrency(buyNetCost)}.`,
          `${netDiff >= 0 ? 'Buying beats Leasing' : 'Leasing beats Buying'} by ${fmtCurrency(Math.abs(netDiff))} over ${hor} months.`,
        ],
      };
    },
  },

  // 510. Business Loan & SBA Payment Calculator
  {
    slug: 'business-loan-calculator',
    title: 'Business Loan & SBA Financing Calculator',
    category: 'finance',
    formulaDisplay: 'Net Proceeds = Principal − SBA/Origination Fees  |  DSCR = Annual EBITDA ÷ Annual Debt Service',
    inputs: [
      { id: 'loanAmount', label: 'Gross Business / SBA Loan Principal', defaultValue: 250000, type: 'number', min: 1000, max: 50000000, step: 5000, unit: '$' },
      { id: 'interestRate', label: 'Nominal Annual Interest Rate (APR %)', defaultValue: 8.75, type: 'number', min: 0, max: 40, step: 0.25, unit: '%' },
      { id: 'loanTermMonths', label: 'Loan Repayment Term (Months)', defaultValue: 120, type: 'number', min: 3, max: 300, step: 12, unit: 'mo' },
      { id: 'originationGuaranteeFeePct', label: 'Origination / SBA Guarantee Fee (%)', defaultValue: 2.5, type: 'number', min: 0, max: 15, step: 0.25, unit: '%' },
      { id: 'flatClosingFees', label: 'Flat Legal, Appraisal & Packaging Fees', defaultValue: 1500, type: 'number', min: 0, max: 500000, step: 250, unit: '$' },
      { id: 'annualEbitda', label: 'Annual Business EBITDA / Cash Flow (DSCR)', defaultValue: 95000, type: 'number', min: 0, max: 100000000, step: 2500, unit: '$', advanced: true },
    ],
    calculate: (v) => {
      const principal = parseNum(v.loanAmount);
      const apr = parseNum(v.interestRate);
      const months = parseNum(v.loanTermMonths);
      const feePct = parseNum(v.originationGuaranteeFeePct);
      const flatFee = parseNum(v.flatClosingFees);
      const ebitda = v.annualEbitda === undefined ? 95000 : parseNum(v.annualEbitda);

      if ([principal, apr, months, feePct, flatFee, ebitda].some(isNaN)) {
        return calcError('Please enter valid numbers for business loan principal, interest rate, term, and fees.');
      }
      if (principal <= 0 || months < 1 || months > 600 || apr < 0 || apr > 100 || feePct < 0 || feePct >= 50 || flatFee < 0 || ebitda < 0) {
        return calcError('Principal must be positive, term 1–600 months, APR 0–100%, and fees <50%.');
      }

      const pctFeeDollars = principal * (feePct / 100);
      const totalUpfrontFees = pctFeeDollars + flatFee;
      const netProceeds = principal - totalUpfrontFees;
      if (netProceeds <= 0) {
        return calcError('Upfront fees cannot equal or exceed gross loan principal.');
      }

      const monthlyPmt = calcPmt(principal, apr, months);
      const annualDebtService = monthlyPmt * 12;
      const totalInterest = monthlyPmt * months - principal;
      const totalCostOfCapital = totalInterest + totalUpfrontFees;
      const effectiveApr = solveEffectiveApr(netProceeds, monthlyPmt, months);
      const dscr = annualDebtService > 0 ? ebitda / annualDebtService : 0;

      return {
        primaryValue: fmt(monthlyPmt, 2),
        primaryUnit: '$ / month Business Loan Payment',
        secondaryOutputs: [
          { label: 'Net Loan Proceeds Received', value: fmtCurrency(netProceeds) },
          { label: 'True Effective APR (incl. Fees)', value: fmt(effectiveApr, 2), unit: '%' },
          { label: 'Upfront Fees Deducted', value: fmtCurrency(totalUpfrontFees) },
          { label: 'Total Interest Paid', value: fmtCurrency(totalInterest) },
          { label: 'Total Cost of Financing', value: fmtCurrency(totalCostOfCapital) },
          { label: 'Annual Debt Service (ADS)', value: fmtCurrency(annualDebtService) },
          { label: 'Lender DSCR Coverage', value: `${fmt(dscr, 2)}x`, unit: dscr >= 1.25 ? 'Meets ≥1.25x SBA Std' : 'Below 1.25x SBA Min' },
        ],
        steps: [
          `Gross Loan ${fmtCurrency(principal)} − (${feePct}% fee ${fmtCurrency(pctFeeDollars)} + ${fmtCurrency(flatFee)} flat) = ${fmtCurrency(netProceeds)} net business cash received.`,
          `Scheduled Payment (${apr}% over ${months} mos) = ${fmtCurrency(monthlyPmt)}/mo (${fmtCurrency(annualDebtService)}/yr ADS).`,
          `Discounting ${months} payments of ${fmtCurrency(monthlyPmt)} back to net proceeds (${fmtCurrency(netProceeds)}) yields True Effective APR = ${fmt(effectiveApr, 2)}%.`,
          `DSCR = ${fmtCurrency(ebitda)} EBITDA ÷ ${fmtCurrency(annualDebtService)} ADS = ${fmt(dscr, 2)}x.`,
        ],
      };
    },
  },

  // 511. Mortgage Points & Effective APR Calculator
  {
    slug: 'loan-apr-points-calculator',
    title: 'Mortgage Points & Effective APR Calculator',
    category: 'finance',
    formulaDisplay: 'Points Cost = Loan × (Points ÷ 100)  |  Effective APR = TILA IRR(Loan − Points − Fees)',
    inputs: [
      { id: 'loanAmount', label: 'Mortgage / Loan Principal', defaultValue: 400000, type: 'number', min: 1000, max: 50000000, step: 5000, unit: '$' },
      { id: 'loanTermYears', label: 'Loan Term (Years)', defaultValue: 30, type: 'number', min: 5, max: 40, step: 5, unit: 'yrs' },
      { id: 'baseInterestRate', label: 'Par Rate Without Points (%)', defaultValue: 6.75, type: 'number', min: 0.1, max: 25, step: 0.125, unit: '%' },
      { id: 'buydownRate', label: 'Reduced Rate With Points (%)', defaultValue: 6.125, type: 'number', min: 0.1, max: 25, step: 0.125, unit: '%' },
      { id: 'discountPoints', label: 'Discount Points Paid (% of Loan)', defaultValue: 2.0, type: 'number', min: 0, max: 10, step: 0.25, unit: 'pts', helpText: '1 discount point = 1% of the loan principal paid at closing.' },
      { id: 'lenderOriginationFees', label: 'Other APR-Included Lender Fees', defaultValue: 1800, type: 'number', min: 0, max: 100000, step: 100, unit: '$', advanced: true },
    ],
    calculate: (v) => {
      const loan = parseNum(v.loanAmount);
      const yrs = parseNum(v.loanTermYears);
      const rBase = parseNum(v.baseInterestRate);
      const rBuy = parseNum(v.buydownRate);
      const pts = parseNum(v.discountPoints);
      const fees = v.lenderOriginationFees === undefined ? 1800 : parseNum(v.lenderOriginationFees);

      if ([loan, yrs, rBase, rBuy, pts, fees].some(isNaN)) {
        return calcError('Please enter valid numeric values for loan amount, term, rates, points, and fees.');
      }
      if (loan <= 0 || yrs < 1 || yrs > 50 || rBase < 0 || rBase > 100 || rBuy < 0 || rBuy > 100 || pts < 0 || pts > 50 || fees < 0) {
        return calcError('Loan term must be 1–50 years, points ≤50, and rates within 0–100%.');
      }

      const months = Math.round(yrs * 12);
      const pointsCost = loan * (pts / 100);
      const totalPrepaidFinanceCharge = pointsCost + fees;
      const amountFinancedTila = loan - totalPrepaidFinanceCharge;
      if (amountFinancedTila <= 0) {
        return calcError('Discount points and lender fees cannot exceed loan principal.');
      }

      const pmtBase = calcPmt(loan, rBase, months);
      const pmtBuy = calcPmt(loan, rBuy, months);
      const monthlySavings = pmtBase - pmtBuy;
      const breakEvenMonths = monthlySavings > 0 ? pointsCost / monthlySavings : Infinity;

      const aprWithPoints = solveEffectiveApr(amountFinancedTila, pmtBuy, months);
      const aprBase = solveEffectiveApr(loan - fees, pmtBase, months);
      const lifetimeNetSavings = (pmtBase - pmtBuy) * months - pointsCost;

      return {
        primaryValue: fmt(aprWithPoints, 3),
        primaryUnit: '% True TILA Effective APR (With Points & Fees)',
        secondaryOutputs: [
          { label: 'Par Rate Effective APR (w/ Fees)', value: fmt(aprBase, 3), unit: '%' },
          { label: 'Upfront Discount Points Cost', value: fmtCurrency(pointsCost) },
          { label: 'Par Monthly P&I', value: fmtCurrency(pmtBase) },
          { label: 'Bought-Down Monthly P&I', value: fmtCurrency(pmtBuy) },
          { label: 'Monthly P&I Reduction', value: fmtCurrency(monthlySavings) },
          { label: 'Points Break-Even Horizon', value: Number.isFinite(breakEvenMonths) ? `${Math.ceil(breakEvenMonths)} mos (${fmt(breakEvenMonths / 12, 1)} yrs)` : 'No Rate Savings' },
          { label: 'Full-Term Net Dollar Gain', value: fmtCurrency(lifetimeNetSavings) },
        ],
        steps: [
          `Discount Points Cost = ${fmtCurrency(loan)} × ${pts}% = ${fmtCurrency(pointsCost)} (+ ${fmtCurrency(fees)} lender fees = ${fmtCurrency(totalPrepaidFinanceCharge)} Finance Charge; TILA Amount Financed = ${fmtCurrency(amountFinancedTila)}).`,
          `Monthly P&I drops from ${fmtCurrency(pmtBase)} (${rBase}%) to ${fmtCurrency(pmtBuy)} (${rBuy}%), saving ${fmtCurrency(monthlySavings)}/mo.`,
          `Simple Break-Even = ${fmtCurrency(pointsCost)} ÷ ${fmtCurrency(Math.max(0.01, monthlySavings))} = ${Number.isFinite(breakEvenMonths) ? `${fmt(breakEvenMonths, 1)} months` : 'N/A'}.`,
          `Truth-in-Lending (TILA) Effective APR with Points = ${fmt(aprWithPoints, 3)}% vs. Par APR = ${fmt(aprBase, 3)}%.`,
        ],
      };
    },
  },

  // 512. Balloon Loan Calculator
  {
    slug: 'balloon-loan-calculator',
    title: 'Balloon Loan Payment & Final Payoff Calculator',
    category: 'finance',
    formulaDisplay: 'PMT based on Amortization N_amort  |  Balloon = PV(1+r)^k − PMT[(1+r)^k − 1]/r',
    inputs: [
      { id: 'loanAmount', label: 'Loan Principal Amount', defaultValue: 300000, type: 'number', min: 1000, max: 100000000, step: 5000, unit: '$' },
      { id: 'interestRate', label: 'Annual Interest Rate (APR %)', defaultValue: 6.75, type: 'number', min: 0, max: 35, step: 0.125, unit: '%' },
      { id: 'amortizationYears', label: 'Amortization Schedule Basis (Years)', defaultValue: 30, type: 'number', min: 5, max: 40, step: 5, unit: 'yrs', helpText: 'Longer amortization used solely to size regular monthly payments.' },
      { id: 'balloonDueYears', label: 'Balloon Maturity Due Date (Years)', defaultValue: 5, type: 'number', min: 1, max: 30, step: 1, unit: 'yrs', helpText: 'Year when full unpaid principal balance comes due.' },
      { id: 'refinanceRateAssume', label: 'Assumed Refinance Rate at Balloon (%)', defaultValue: 7.5, type: 'number', min: 0, max: 30, step: 0.25, unit: '%', advanced: true },
    ],
    calculate: (v) => {
      const p = parseNum(v.loanAmount);
      const apr = parseNum(v.interestRate);
      const amortYrs = parseNum(v.amortizationYears);
      const balYrs = parseNum(v.balloonDueYears);
      const refiRate = v.refinanceRateAssume === undefined ? 7.5 : parseNum(v.refinanceRateAssume);

      if ([p, apr, amortYrs, balYrs, refiRate].some(isNaN)) {
        return calcError('Please enter valid numbers for loan principal, interest rate, amortization basis, and balloon year.');
      }
      if (p <= 0 || amortYrs < 1 || amortYrs > 50 || balYrs < 1 || balYrs > amortYrs || apr < 0 || apr > 100 || refiRate < 0 || refiRate > 100) {
        return calcError('Amortization must be 1–50 years, balloon maturity ≤ amortization, and rates within 0–100%.');
      }

      const amortMonths = Math.round(amortYrs * 12);
      const balloonMonths = Math.round(balYrs * 12);
      const monthlyPmt = calcPmt(p, apr, amortMonths);
      const rm = apr / 100 / 12;

      let bal = p;
      let interestPaidBeforeBalloon = 0;
      for (let m = 0; m < balloonMonths; m++) {
        const i = bal * rm;
        interestPaidBeforeBalloon += i;
        bal = Math.max(0, bal + i - monthlyPmt);
      }

      const principalPaidDown = p - bal;
      const pctPaidDown = (principalPaidDown / p) * 100;
      const refiMonths = Math.max(12, amortMonths - balloonMonths);
      const estRefiMonthly = calcPmt(bal, refiRate, refiMonths);

      return {
        primaryValue: fmt(bal, 2),
        primaryUnit: `$ Balloon Lump-Sum Due at Year ${balYrs}`,
        secondaryOutputs: [
          { label: `Monthly P&I (${amortYrs}y Basis)`, value: fmtCurrency(monthlyPmt) },
          { label: `Principal Paid in ${balYrs} Yrs`, value: fmtCurrency(principalPaidDown), unit: `(${fmt(pctPaidDown, 1)}%)` },
          { label: `Interest Paid Prior to Balloon`, value: fmtCurrency(interestPaidBeforeBalloon) },
          { label: 'Total Cash Outflow w/ Balloon', value: fmtCurrency(monthlyPmt * balloonMonths + bal) },
          { label: `Est. Refi Payment (${refiRate}% / ${fmt(refiMonths / 12, 0)}y)`, value: fmtCurrency(estRefiMonthly), unit: '/mo' },
        ],
        steps: [
          `Monthly P&I based on ${amortYrs}-year amortization (${amortMonths} mos) @ ${apr}% = ${fmtCurrency(monthlyPmt)}/mo.`,
          `Over ${balloonMonths} payments (${balYrs} yrs), you pay ${fmtCurrency(monthlyPmt * balloonMonths)} total (${fmtCurrency(interestPaidBeforeBalloon)} interest + ${fmtCurrency(principalPaidDown)} principal reduction).`,
          `Remaining Balloon Balance Due in Full at Month ${balloonMonths} = ${fmtCurrency(bal)} (${fmt(100 - pctPaidDown, 1)}% of original loan).`,
          `If refinanced at ${refiRate}% over remaining ${refiMonths} months, new P&I = ${fmtCurrency(estRefiMonthly)}/mo.`,
        ],
      };
    },
  },
];
