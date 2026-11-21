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

type FilingStatus = 'single' | 'mfj' | 'hoh' | 'mfs';

const IRS_2026_STD_DEDUCTION: Record<FilingStatus, number> = {
  single: 16100,
  mfj: 32200,
  hoh: 24150,
  mfs: 16100,
};

const IRS_2026_ORDINARY_BRACKETS: Record<FilingStatus, { max: number; rate: number }[]> = {
  single: [
    { max: 12400, rate: 0.1 },
    { max: 50400, rate: 0.12 },
    { max: 105700, rate: 0.22 },
    { max: 201775, rate: 0.24 },
    { max: 256225, rate: 0.32 },
    { max: 640600, rate: 0.35 },
    { max: Infinity, rate: 0.37 },
  ],
  mfj: [
    { max: 24800, rate: 0.1 },
    { max: 100800, rate: 0.12 },
    { max: 211400, rate: 0.22 },
    { max: 403550, rate: 0.24 },
    { max: 512450, rate: 0.32 },
    { max: 768700, rate: 0.35 },
    { max: Infinity, rate: 0.37 },
  ],
  hoh: [
    { max: 17700, rate: 0.1 },
    { max: 67450, rate: 0.12 },
    { max: 105700, rate: 0.22 },
    { max: 201750, rate: 0.24 },
    { max: 256200, rate: 0.32 },
    { max: 640600, rate: 0.35 },
    { max: Infinity, rate: 0.37 },
  ],
  mfs: [
    { max: 12400, rate: 0.1 },
    { max: 50400, rate: 0.12 },
    { max: 105700, rate: 0.22 },
    { max: 201775, rate: 0.24 },
    { max: 256225, rate: 0.32 },
    { max: 384350, rate: 0.35 },
    { max: Infinity, rate: 0.37 },
  ],
};

const IRS_2026_LTCG_BRACKETS: Record<FilingStatus, { max: number; rate: number }[]> = {
  single: [
    { max: 49450, rate: 0.0 },
    { max: 545500, rate: 0.15 },
    { max: Infinity, rate: 0.2 },
  ],
  mfj: [
    { max: 98900, rate: 0.0 },
    { max: 613700, rate: 0.15 },
    { max: Infinity, rate: 0.2 },
  ],
  hoh: [
    { max: 66200, rate: 0.0 },
    { max: 579600, rate: 0.15 },
    { max: Infinity, rate: 0.2 },
  ],
  mfs: [
    { max: 49450, rate: 0.0 },
    { max: 306850, rate: 0.15 },
    { max: Infinity, rate: 0.2 },
  ],
};

const calcProgressiveTax = (taxable: number, brackets: { max: number; rate: number }[]): number => {
  if (taxable <= 0) return 0;
  let prev = 0;
  let tax = 0;
  for (const b of brackets) {
    if (taxable <= prev) break;
    const slice = Math.min(taxable, b.max) - prev;
    tax += slice * b.rate;
    prev = b.max;
  }
  return tax;
};

// Solve IRR per period for CF_0 (negative outlay) and CF_1..CF_n
const solveIrrPct = (cashFlows: number[]): number | null => {
  const hasPos = cashFlows.some((c) => c > 0);
  const hasNeg = cashFlows.some((c) => c < 0);
  if (!hasPos || !hasNeg) return null;

  const npvAt = (r: number): number => {
    let total = 0;
    for (let t = 0; t < cashFlows.length; t++) {
      total += cashFlows[t] / Math.pow(1 + r, t);
    }
    return total;
  };

  let lo = -0.95;
  let hi = 5.0; // up to 500% IRR
  const fLo = npvAt(lo);
  const fHi = npvAt(hi);
  if (fLo * fHi > 0) return null;

  for (let i = 0; i < 90; i++) {
    const mid = (lo + hi) / 2;
    const fMid = npvAt(mid);
    if (Math.abs(fMid) < 1e-7) return mid * 100;
    if (fLo * fMid <= 0) {
      hi = mid;
    } else {
      lo = mid;
    }
  }
  return ((lo + hi) / 2) * 100;
};

export const batch2TaxBusinessSpecs: CalculatorSpec[] = [
  // 513. US Capital Gains Tax & NIIT Calculator (2026 IRS Rev. Proc. 2025-32)
  {
    slug: 'capital-gains-tax-calculator',
    title: 'US Capital Gains Tax & NIIT Calculator',
    category: 'business-tax',
    formulaDisplay: 'LTCG Stacked Above Ordinary Taxable Inc (0% / 15% / 20%) + 3.8% NIIT (> $200k/$250k MAGI)',
    inputs: [
      { id: 'ordinaryIncome', label: 'Other Gross Ordinary Income (W-2/Interest)', defaultValue: 95000, type: 'number', min: 0, max: 100000000, step: 2500, unit: '$' },
      { id: 'shortTermGain', label: 'Net Short-Term Capital Gain (≤ 1 Yr)', defaultValue: 5000, type: 'number', min: 0, max: 100000000, step: 1000, unit: '$' },
      { id: 'longTermGain', label: 'Net Long-Term Capital Gain (> 1 Yr)', defaultValue: 65000, type: 'number', min: 0, max: 100000000, step: 1000, unit: '$' },
      {
        id: 'filingStatus',
        label: '2026 IRS Filing Status',
        type: 'select',
        defaultValue: 'single',
        options: [
          { label: 'Single ($16,100 Std Ded)', value: 'single' },
          { label: 'Married Filing Jointly ($32,200 Std Ded)', value: 'mfj' },
          { label: 'Head of Household ($24,150 Std Ded)', value: 'hoh' },
          { label: 'Married Filing Separately ($16,100 Std Ded)', value: 'mfs' },
        ],
      },
      { id: 'stateCapGainsRate', label: 'State Capital Gains Tax Rate (%)', defaultValue: 5.0, type: 'number', min: 0, max: 15, step: 0.25, unit: '%', advanced: true },
    ],
    calculate: (v) => {
      const ord = parseNum(v.ordinaryIncome);
      const stg = parseNum(v.shortTermGain);
      const ltg = parseNum(v.longTermGain);
      const fs = (String(v.filingStatus || 'single') as FilingStatus) || 'single';
      const statePct = v.stateCapGainsRate === undefined ? 5.0 : parseNum(v.stateCapGainsRate);

      if ([ord, stg, ltg, statePct].some(isNaN) || !IRS_2026_STD_DEDUCTION[fs]) {
        return calcError('Please enter valid numeric income and capital gains amounts.');
      }
      if ([ord, stg, ltg, statePct].some((x) => x < 0) || statePct > 20) {
        return calcError('Income and capital gains cannot be negative.');
      }

      const stdDed = IRS_2026_STD_DEDUCTION[fs];
      const totalGrossOrd = ord + stg;
      const ordTaxableBase = Math.max(0, ord - stdDed);
      const ordPlusStgTaxable = Math.max(0, totalGrossOrd - stdDed);

      // Marginal ordinary tax caused by short-term gains
      const baseOrdTax = calcProgressiveTax(ordTaxableBase, IRS_2026_ORDINARY_BRACKETS[fs]);
      const withStgTax = calcProgressiveTax(ordPlusStgTaxable, IRS_2026_ORDINARY_BRACKETS[fs]);
      const stgFedTax = withStgTax - baseOrdTax;

      // Stack LTCG on top of (ordinary + short-term taxable income), reduced by any unused deduction
      const unusedDed = Math.max(0, stdDed - totalGrossOrd);
      const taxableLtg = Math.max(0, ltg - unusedDed);
      const stackFloor = ordPlusStgTaxable;
      const stackCeiling = stackFloor + taxableLtg;
      const ltgFedTax =
        calcProgressiveTax(stackCeiling, IRS_2026_LTCG_BRACKETS[fs]) -
        calcProgressiveTax(stackFloor, IRS_2026_LTCG_BRACKETS[fs]);

      // 3.8% NIIT on lesser of net investment income (stg + ltg) or (MAGI - threshold)
      const magi = ord + stg + ltg;
      const niitThresh = fs === 'mfj' ? 250000 : fs === 'mfs' ? 125000 : 200000;
      const nii = stg + ltg;
      const niitTax = magi > niitThresh ? Math.min(nii, magi - niitThresh) * 0.038 : 0;

      const stateTax = nii * (statePct / 100);
      const totalCapGainsTax = stgFedTax + ltgFedTax + niitTax + stateTax;
      const netProceedsAfterTax = nii - totalCapGainsTax;
      const effCapGainsRate = nii > 0 ? (totalCapGainsTax / nii) * 100 : 0;

      return {
        primaryValue: fmt(totalCapGainsTax, 2),
        primaryUnit: '$ Total Tax on Capital Gains (2026 IRS + State)',
        secondaryOutputs: [
          { label: 'Net Gain After All Taxes', value: fmtCurrency(netProceedsAfterTax) },
          { label: 'Effective Rate on Gains', value: fmt(effCapGainsRate, 2), unit: '%' },
          { label: 'Federal Long-Term Gains Tax', value: fmtCurrency(ltgFedTax) },
          { label: 'Federal Short-Term Gains Tax', value: fmtCurrency(stgFedTax) },
          { label: '3.8% NIIT Surtax (IRC §1411)', value: fmtCurrency(niitTax) },
          { label: `State Tax (${statePct}%)`, value: fmtCurrency(stateTax) },
          { label: '2026 Standard Deduction Used', value: fmtCurrency(stdDed) },
        ],
        steps: [
          `2026 IRS Ordinary + STG Taxable Base = max(0, ${fmtCurrency(ord + stg)} − ${fmtCurrency(stdDed)} std ded) = ${fmtCurrency(ordPlusStgTaxable)} → Short-Term Gain tax = ${fmtCurrency(stgFedTax)}.`,
          `Long-Term Gains (${fmtCurrency(taxableLtg)} taxable) stack from ${fmtCurrency(stackFloor)} to ${fmtCurrency(stackCeiling)} across 2026 LTCG tiers (0%/15%/20%) → LTCG Tax = ${fmtCurrency(ltgFedTax)}.`,
          `MAGI = ${fmtCurrency(magi)} vs. NIIT threshold (${fmtCurrency(niitThresh)}) → 3.8% NIIT = ${fmtCurrency(niitTax)}; State tax (${statePct}%) = ${fmtCurrency(stateTax)}.`,
          `Total Tax Attributable to Capital Gains = ${fmtCurrency(totalCapGainsTax)} (${fmt(effCapGainsRate, 2)}% effective rate), leaving ${fmtCurrency(netProceedsAfterTax)} net.`,
        ],
      };
    },
  },

  // 514. UK Take-Home Pay Calculator (2026–27 HMRC)
  {
    slug: 'uk-take-home-pay-calculator',
    title: 'UK Take-Home Pay Calculator (2026–27)',
    category: 'business-tax',
    formulaDisplay: 'Net Pay = Gross − Pension − Income Tax (PA Taper >£100k) − Class 1 NI (8%/2%) − Student Loan',
    inputs: [
      { id: 'grossAnnualSalary', label: 'Gross Annual Salary (£)', defaultValue: 55000, type: 'number', min: 0, max: 10000000, step: 1000, unit: '£' },
      {
        id: 'ukRegion',
        label: '2026–27 UK Tax Jurisdiction',
        type: 'select',
        defaultValue: 'ewni',
        options: [
          { label: 'England, Wales & Northern Ireland', value: 'ewni' },
          { label: 'Scotland (6-Band Scottish Income Tax)', value: 'scotland' },
        ],
      },
      { id: 'pensionContribPct', label: 'Employee Pension Salary Sacrifice (%)', defaultValue: 5, type: 'number', min: 0, max: 60, step: 1, unit: '%' },
      {
        id: 'studentLoanPlan',
        label: '2026–27 Student Loan Plan',
        type: 'select',
        defaultValue: 'plan2',
        options: [
          { label: 'None', value: 'none' },
          { label: 'Plan 2 (£29,385 threshold @ 9%)', value: 'plan2' },
          { label: 'Plan 1 (£26,065 threshold @ 9%)', value: 'plan1' },
          { label: 'Plan 4 Scotland (£32,745 threshold @ 9%)', value: 'plan4' },
          { label: 'Plan 5 (£25,000 threshold @ 9%)', value: 'plan5' },
          { label: 'Postgraduate Loan (£21,000 threshold @ 6%)', value: 'pg' },
        ],
      },
    ],
    calculate: (v) => {
      const gross = parseNum(v.grossAnnualSalary);
      const region = String(v.ukRegion || 'ewni');
      const penPct = parseNum(v.pensionContribPct);
      const slPlan = String(v.studentLoanPlan || 'plan2');

      if ([gross, penPct].some(isNaN) || gross < 0 || penPct < 0 || penPct > 80) {
        return calcError('Please enter a valid non-negative salary and pension percentage (0–80%).');
      }

      const pensionSacrifice = gross * (penPct / 100);
      const adjIncome = Math.max(0, gross - pensionSacrifice);

      // Personal Allowance £12,570 tapered £1 per £2 above £100,000 (hits £0 at £125,140)
      const basePa = 12570;
      const pa = adjIncome > 100000 ? Math.max(0, basePa - (adjIncome - 100000) / 2) : basePa;
      const taxableAbovePa = Math.max(0, adjIncome - pa);

      let incomeTax = 0;
      if (region === 'scotland') {
        // 2026-27 Scottish Income Tax widths above PA
        const scotBands = [
          { max: 2827, rate: 0.19 }, // Starter 19%
          { max: 14921, rate: 0.2 }, // Basic 20%
          { max: 31092, rate: 0.21 }, // Intermediate 21%
          { max: 62430, rate: 0.42 }, // Higher 42%
          { max: 125140 - pa, rate: 0.45 }, // Advanced 45% up to £125,140 total
          { max: Infinity, rate: 0.48 }, // Top 48%
        ];
        incomeTax = calcProgressiveTax(taxableAbovePa, scotBands);
      } else {
        // England, Wales & NI 2026-27 bands (width above PA: Basic £37,700; Higher up to £125,140 total)
        const ewniBands = [
          { max: 37700, rate: 0.2 },
          { max: Math.max(37700, 125140 - pa), rate: 0.4 },
          { max: Infinity, rate: 0.45 },
        ];
        incomeTax = calcProgressiveTax(taxableAbovePa, ewniBands);
      }

      // Class 1 Employee NI (2026-27): 8% between £12,570 and £50,270; 2% above £50,270
      const niMain = Math.max(0, Math.min(adjIncome, 50270) - 12570) * 0.08;
      const niUpper = Math.max(0, adjIncome - 50270) * 0.02;
      const employeeNi = niMain + niUpper;

      // Student loan (on salary-sacrificed NI-able earnings)
      const slConfigs: Record<string, { thresh: number; rate: number }> = {
        none: { thresh: Infinity, rate: 0 },
        plan1: { thresh: 26065, rate: 0.09 },
        plan2: { thresh: 29385, rate: 0.09 },
        plan4: { thresh: 32745, rate: 0.09 },
        plan5: { thresh: 25000, rate: 0.09 },
        pg: { thresh: 21000, rate: 0.06 },
      };
      const slCfg = slConfigs[slPlan] || slConfigs.none;
      const studentLoan = adjIncome > slCfg.thresh ? (adjIncome - slCfg.thresh) * slCfg.rate : 0;

      const totalDeductions = pensionSacrifice + incomeTax + employeeNi + studentLoan;
      const annualNet = gross - totalDeductions;
      const monthlyNet = annualNet / 12;
      const effTaxNiPct = gross > 0 ? ((incomeTax + employeeNi) / gross) * 100 : 0;

      return {
        primaryValue: fmt(monthlyNet, 2),
        primaryUnit: '£ / month Net UK Take-Home Pay (2026–27)',
        secondaryOutputs: [
          { label: 'Annual Net Take-Home', value: fmtCurrency(annualNet, '£') },
          { label: 'Weekly Net Take-Home', value: fmtCurrency(annualNet / 52, '£') },
          { label: 'UK Income Tax (PAYE)', value: fmtCurrency(incomeTax, '£'), unit: '/yr' },
          { label: 'Employee National Insurance', value: fmtCurrency(employeeNi, '£'), unit: '/yr' },
          { label: 'Student Loan Deduction', value: fmtCurrency(studentLoan, '£'), unit: '/yr' },
          { label: 'Employee Pension Sacrifice', value: fmtCurrency(pensionSacrifice, '£'), unit: '/yr' },
          { label: 'Personal Allowance Retained', value: fmtCurrency(pa, '£') },
          { label: 'Effective Tax + NI Burden', value: fmt(effTaxNiPct, 2), unit: '%' },
        ],
        steps: [
          `Gross Salary ${fmtCurrency(gross, '£')} − ${penPct}% Pension Sacrifice (${fmtCurrency(pensionSacrifice, '£')}) = ${fmtCurrency(adjIncome, '£')} Adjusted Net Income (PA = ${fmtCurrency(pa, '£')}).`,
          `2026–27 ${region === 'scotland' ? 'Scottish' : 'England/Wales/NI'} Income Tax = ${fmtCurrency(incomeTax, '£')}/yr.`,
          `Class 1 Employee NI (8% on £12,570–£50,270; 2% above) = ${fmtCurrency(employeeNi, '£')}/yr; Student Loan = ${fmtCurrency(studentLoan, '£')}/yr.`,
          `Net Take-Home Pay = ${fmtCurrency(annualNet, '£')}/yr (${fmtCurrency(monthlyNet, '£')}/mo).`,
        ],
      };
    },
  },

  // 515. Canada Income Tax & Take-Home Pay Calculator (2026 CRA)
  {
    slug: 'canada-income-tax-calculator',
    title: 'Canada Income Tax & Payroll Calculator (2026)',
    category: 'business-tax',
    formulaDisplay: 'Net = Gross − RRSP − Net Fed Tax (14%–33%) − Provincial Tax − CPP/CPP2 (5.95%/4%) − EI (1.63%)',
    inputs: [
      { id: 'grossAnnualIncome', label: 'Gross Annual Employment Income (C$)', defaultValue: 95000, type: 'number', min: 0, max: 20000000, step: 2500, unit: 'C$' },
      {
        id: 'province',
        label: 'Province / Territory (2026)',
        type: 'select',
        defaultValue: 'ON',
        options: [
          { label: 'Ontario (ON)', value: 'ON' },
          { label: 'British Columbia (BC)', value: 'BC' },
          { label: 'Alberta (AB)', value: 'AB' },
          { label: 'Quebec (QC — w/ Abatement)', value: 'QC' },
        ],
      },
      { id: 'rrspContribution', label: 'Annual RRSP Pre-Tax Deduction (C$)', defaultValue: 5000, type: 'number', min: 0, max: 33810, step: 500, unit: 'C$', helpText: '2026 CRA RRSP statutory maximum dollar limit is C$33,810.' },
    ],
    calculate: (v) => {
      const gross = parseNum(v.grossAnnualIncome);
      const prov = String(v.province || 'ON');
      const rrsp = parseNum(v.rrspContribution);

      if ([gross, rrsp].some(isNaN) || gross < 0 || rrsp < 0) {
        return calcError('Please enter valid non-negative employment income and RRSP contribution.');
      }

      const taxableIncome = Math.max(0, gross - rrsp);

      // 2026 CRA CPP & EI (based on gross pensionable/insurable income)
      const cppBase = Math.max(0, Math.min(gross, 74600) - 3500) * 0.0595; // Max C$4,230.45
      const cpp2 = Math.max(0, Math.min(gross, 85000) - 74600) * 0.04; // Max C$416.00
      const totalCpp = cppBase + cpp2;
      const ei = Math.min(gross, 68900) * 0.0163; // Max C$1,123.07

      // 2026 CRA Federal BPA: C$16,452 phased down to C$14,829 between 181,440 and 258,482
      let bpa = 16452;
      if (taxableIncome > 181440) {
        const ratio = Math.min(1, (taxableIncome - 181440) / (258482 - 181440));
        bpa = 16452 - ratio * (16452 - 14829);
      }

      // 2026 CRA Federal brackets: 14%, 20.5%, 26%, 29%, 33%
      const fedBrackets = [
        { max: 58523, rate: 0.14 },
        { max: 117045, rate: 0.205 },
        { max: 181440, rate: 0.26 },
        { max: 258482, rate: 0.29 },
        { max: Infinity, rate: 0.33 },
      ];
      // CPP2 is a deduction; base CPP + EI + Employment Amount (C$1,501) + BPA receive 14% lowest bracket credit
      const netFedTaxable = Math.max(0, taxableIncome - cpp2);
      const grossFedTax = calcProgressiveTax(netFedTaxable, fedBrackets);
      const fedCredits = (bpa + cppBase + ei + Math.min(gross, 1501)) * 0.14;
      let netFedTax = Math.max(0, grossFedTax - fedCredits);
      if (prov === 'QC') {
        netFedTax = netFedTax * (1 - 0.165); // 16.5% Quebec Abatement
      }

      // 2026 Representative Provincial brackets
      const provConfigs: Record<string, { bpa: number; brackets: { max: number; rate: number }[]; creditRate: number }> = {
        ON: {
          bpa: 12989,
          creditRate: 0.0505,
          brackets: [
            { max: 53891, rate: 0.0505 },
            { max: 107785, rate: 0.0915 },
            { max: 150000, rate: 0.1116 },
            { max: 220000, rate: 0.1216 },
            { max: Infinity, rate: 0.1316 },
          ],
        },
        BC: {
          bpa: 13216,
          creditRate: 0.0506,
          brackets: [
            { max: 50363, rate: 0.0506 },
            { max: 100728, rate: 0.077 },
            { max: 115648, rate: 0.105 },
            { max: 140430, rate: 0.1229 },
            { max: 190405, rate: 0.147 },
            { max: 265545, rate: 0.168 },
            { max: Infinity, rate: 0.205 },
          ],
        },
        AB: {
          bpa: 22769,
          creditRate: 0.08,
          brackets: [
            { max: 61200, rate: 0.08 },
            { max: 154259, rate: 0.1 },
            { max: 185111, rate: 0.12 },
            { max: 246813, rate: 0.13 },
            { max: 370220, rate: 0.14 },
            { max: Infinity, rate: 0.15 },
          ],
        },
        QC: {
          bpa: 18952,
          creditRate: 0.14,
          brackets: [
            { max: 54345, rate: 0.14 },
            { max: 108680, rate: 0.19 },
            { max: 132245, rate: 0.24 },
            { max: Infinity, rate: 0.2575 },
          ],
        },
      };
      const pc = provConfigs[prov] || provConfigs.ON;
      const provGross = calcProgressiveTax(netFedTaxable, pc.brackets);
      const provNetTax = Math.max(0, provGross - (pc.bpa + cppBase + ei) * pc.creditRate);

      const totalTaxPayroll = netFedTax + provNetTax + totalCpp + ei;
      const annualTakeHome = gross - rrsp - totalTaxPayroll;
      const avgTaxRate = gross > 0 ? ((netFedTax + provNetTax) / gross) * 100 : 0;

      return {
        primaryValue: fmt(annualTakeHome, 2),
        primaryUnit: `C$ / year Net Canadian Take-Home (${prov} 2026)`,
        secondaryOutputs: [
          { label: 'Monthly Net Take-Home', value: fmtCurrency(annualTakeHome / 12, 'C$') },
          { label: 'Federal Income Tax (CRA 2026)', value: fmtCurrency(netFedTax, 'C$') },
          { label: `Provincial Income Tax (${prov})`, value: fmtCurrency(provNetTax, 'C$') },
          { label: 'CPP + CPP2 Contributions', value: fmtCurrency(totalCpp, 'C$') },
          { label: 'Employment Insurance (EI)', value: fmtCurrency(ei, 'C$') },
          { label: '2026 Federal BPA Applied', value: fmtCurrency(bpa, 'C$') },
          { label: 'Average Income Tax Rate', value: fmt(avgTaxRate, 2), unit: '%' },
        ],
        steps: [
          `Taxable Income after ${fmtCurrency(rrsp, 'C$')} RRSP & ${fmtCurrency(cpp2, 'C$')} CPP2 deduction = ${fmtCurrency(netFedTaxable, 'C$')}.`,
          `2026 CRA Federal Tax (14%–33% tiers less 14% BPA/CPP/EI credits) = ${fmtCurrency(netFedTax, 'C$')}; ${prov} Provincial Tax = ${fmtCurrency(provNetTax, 'C$')}.`,
          `2026 Payroll Deductions: CPP (5.95% on $3.5k–$74.6k) + CPP2 (4% to $85k) = ${fmtCurrency(totalCpp, 'C$')}; EI (1.63% up to $68.9k) = ${fmtCurrency(ei, 'C$')}.`,
          `Net Disposable Cash Pay (after RRSP) = ${fmtCurrency(annualTakeHome, 'C$')}/yr (${fmtCurrency(annualTakeHome / 12, 'C$')}/mo).`,
        ],
      };
    },
  },

  // 516. Australia Income Tax & Take-Home Pay Calculator (ATO FY 2026–27)
  {
    slug: 'australia-income-tax-calculator',
    title: 'Australia Income Tax & HECS-HELP Calculator',
    category: 'business-tax',
    formulaDisplay: 'Net = Gross − SalSac − Income Tax (FY26-27 15% Tier) + LITO − 2% Medicare − Marginal HELP',
    inputs: [
      { id: 'grossAnnualSalary', label: 'Gross Annual Salary (A$, excl. Super)', defaultValue: 115000, type: 'number', min: 0, max: 20000000, step: 2500, unit: 'A$' },
      { id: 'salarySacrificeSuper', label: 'Annual Super Salary Sacrifice (A$)', defaultValue: 0, type: 'number', min: 0, max: 32500, step: 500, unit: 'A$', helpText: 'FY 2026–27 total Concessional Super Cap (SG 12% + Sacrifice) is A$32,500.' },
      {
        id: 'hasHelpDebt',
        label: 'Has HECS-HELP / Study Loan?',
        type: 'select',
        defaultValue: 'yes',
        options: [
          { label: 'Yes — Apply FY 2026–27 Marginal HELP Scale', value: 'yes' },
          { label: 'No HECS-HELP Loan', value: 'no' },
        ],
      },
      {
        id: 'privateHospitalCover',
        label: 'Private Hospital Insurance (MLS Exemption)?',
        type: 'select',
        defaultValue: 'yes',
        options: [
          { label: 'Yes — Exempt from Medicare Levy Surcharge', value: 'yes' },
          { label: 'No — Check Medicare Levy Surcharge (>A$101k)', value: 'no' },
        ],
      },
    ],
    calculate: (v) => {
      const gross = parseNum(v.grossAnnualSalary);
      const salSac = parseNum(v.salarySacrificeSuper);
      const hasHelp = String(v.hasHelpDebt || 'yes') === 'yes';
      const hasCover = String(v.privateHospitalCover || 'yes') === 'yes';

      if ([gross, salSac].some(isNaN) || gross < 0 || salSac < 0 || salSac > gross) {
        return calcError('Please enter valid non-negative salary and salary sacrifice (≤ gross salary).');
      }

      const taxableIncome = Math.max(0, gross - salSac);
      // FY 2026-27 ATO Resident Tax Brackets (15% bracket active from 1 Jul 2026)
      const atoBrackets = [
        { max: 18200, rate: 0.0 },
        { max: 45000, rate: 0.15 },
        { max: 135000, rate: 0.3 },
        { max: 190000, rate: 0.37 },
        { max: Infinity, rate: 0.45 },
      ];
      const baseTax = calcProgressiveTax(taxableIncome, atoBrackets);

      // Low Income Tax Offset (LITO): max $700 up to $37,500; -5c/$1 to $45,000 ($325); -1.5c/$1 to $66,667
      let lito = 0;
      if (taxableIncome <= 37500) lito = 700;
      else if (taxableIncome <= 45000) lito = 700 - (taxableIncome - 37500) * 0.05;
      else if (taxableIncome <= 66667) lito = Math.max(0, 325 - (taxableIncome - 45000) * 0.015);
      const incomeTax = Math.max(0, baseTax - lito);

      // 2% Medicare Levy (with simplified low-income shade-in below $34,027; standard 2% above)
      const medicareLevy = taxableIncome <= 27222 ? 0 : taxableIncome * 0.02;

      // Repayment Income for HELP & MLS adds back reportable super salary sacrifice
      const repaymentIncome = taxableIncome + salSac;
      let mls = 0;
      if (!hasCover && repaymentIncome > 101000) {
        if (repaymentIncome <= 118000) mls = repaymentIncome * 0.01;
        else if (repaymentIncome <= 158000) mls = repaymentIncome * 0.0125;
        else mls = repaymentIncome * 0.015;
      }

      // ATO FY 2026-27 Marginal HECS-HELP repayment brackets:
      // $0 - $69,528: Nil; $69,529 - $129,717: 15c per $1 over $69,528;
      // $129,718 - $186,050: $9,028 + 17c per $1 over $129,717; $186,051+: 10% of total repayment income
      let helpRepayment = 0;
      if (hasHelp && repaymentIncome > 69528) {
        if (repaymentIncome <= 129717) {
          helpRepayment = (repaymentIncome - 69528) * 0.15;
        } else if (repaymentIncome <= 186050) {
          helpRepayment = 9028 + (repaymentIncome - 129717) * 0.17;
        } else {
          helpRepayment = repaymentIncome * 0.1;
        }
      }

      const employerSg12 = gross * 0.12;
      const totalWithheld = incomeTax + medicareLevy + mls + helpRepayment;
      const netAnnual = taxableIncome - totalWithheld;
      const effTaxPct = gross > 0 ? (totalWithheld / gross) * 100 : 0;

      return {
        primaryValue: fmt(netAnnual, 2),
        primaryUnit: 'A$ / year Net Australian Take-Home (FY 2026–27)',
        secondaryOutputs: [
          { label: 'Monthly Net Take-Home', value: fmtCurrency(netAnnual / 12, 'A$') },
          { label: 'Fortnightly Net Take-Home', value: fmtCurrency(netAnnual / 26, 'A$') },
          { label: 'ATO Income Tax (Net of LITO)', value: fmtCurrency(incomeTax, 'A$') },
          { label: '2% Medicare Levy (+ MLS)', value: fmtCurrency(medicareLevy + mls, 'A$') },
          { label: 'FY 2026–27 Marginal HECS-HELP', value: fmtCurrency(helpRepayment, 'A$') },
          { label: 'Employer 12% SG Super Added', value: fmtCurrency(employerSg12, 'A$') },
          { label: 'Effective Tax & Levy Rate', value: fmt(effTaxPct, 2), unit: '%' },
        ],
        steps: [
          `Taxable Income = ${fmtCurrency(gross, 'A$')} − ${fmtCurrency(salSac, 'A$')} super sacrifice = ${fmtCurrency(taxableIncome, 'A$')}.`,
          `FY 2026–27 ATO Tax (15% / 30% / 37% / 45% tiers) less ${fmtCurrency(lito, 'A$')} LITO = ${fmtCurrency(incomeTax, 'A$')}; 2% Medicare Levy${mls > 0 ? ` + MLS ${fmtCurrency(mls, 'A$')}` : ''} = ${fmtCurrency(medicareLevy + mls, 'A$')}.`,
          hasHelp
            ? `FY 2026–27 Marginal HECS-HELP on ${fmtCurrency(repaymentIncome, 'A$')} (above A$69,528 threshold) = ${fmtCurrency(helpRepayment, 'A$')}.`
            : 'HECS-HELP excluded ($0.00).',
          `Annual Net Pay = ${fmtCurrency(netAnnual, 'A$')} (${fmtCurrency(netAnnual / 26, 'A$')}/fortnight), plus ${fmtCurrency(employerSg12, 'A$')} mandatory 12% employer Super.`,
        ],
      };
    },
  },

  // 517. New Zealand PAYE, ACC & KiwiSaver Calculator (2026–27 IRD)
  {
    slug: 'nz-paye-calculator',
    title: 'New Zealand PAYE & KiwiSaver Calculator',
    category: 'business-tax',
    formulaDisplay: 'Net = Gross − IRD PAYE (10.5%–39%) − ACC Levy (1.75% up to NZ$156,641) − KiwiSaver − SL (12%)',
    inputs: [
      { id: 'grossAnnualSalary', label: 'Gross Annual Salary (NZ$)', defaultValue: 85000, type: 'number', min: 0, max: 20000000, step: 2500, unit: 'NZ$' },
      {
        id: 'kiwisaverRate',
        label: 'Employee KiwiSaver Rate',
        type: 'select',
        defaultValue: '3',
        options: [
          { label: '0% (Opted Out / Holiday)', value: '0' },
          { label: '3% Employee (+ 3% Employer)', value: '3' },
          { label: '4% Employee', value: '4' },
          { label: '6% Employee', value: '6' },
          { label: '8% Employee', value: '8' },
          { label: '10% Employee', value: '10' },
        ],
      },
      {
        id: 'hasStudentLoan',
        label: 'NZ Student Loan (SL Tax Code)?',
        type: 'select',
        defaultValue: 'yes',
        options: [
          { label: 'Yes — 12% Above NZ$24,128 Threshold', value: 'yes' },
          { label: 'No Student Loan', value: 'no' },
        ],
      },
    ],
    calculate: (v) => {
      const gross = parseNum(v.grossAnnualSalary);
      const ksPct = parseNum(v.kiwisaverRate);
      const hasSl = String(v.hasStudentLoan || 'yes') === 'yes';

      if ([gross, ksPct].some(isNaN) || gross < 0 || ksPct < 0) {
        return calcError('Please enter valid non-negative NZ salary and KiwiSaver rate.');
      }

      // IRD 2026-27 PAYE Income Tax Brackets
      const nzBrackets = [
        { max: 15600, rate: 0.105 },
        { max: 53500, rate: 0.175 },
        { max: 78100, rate: 0.3 },
        { max: 180000, rate: 0.33 },
        { max: Infinity, rate: 0.39 },
      ];
      const payeTax = calcProgressiveTax(gross, nzBrackets);

      // ACC Earners' Levy 2026-27: 1.75% up to max liable earnings NZ$156,641 (Max NZ$2,741.22)
      const accLevy = Math.min(gross, 156641) * 0.0175;

      // Independent Earner Tax Credit (IETC): NZ$520 if income NZ$24,000–NZ$66,000; phases out 13c/$1 to NZ$70,000
      let ietc = 0;
      if (gross >= 24000 && gross <= 66000) ietc = 520;
      else if (gross > 66000 && gross < 70000) ietc = Math.max(0, 520 - (gross - 66000) * 0.13);

      const kiwiSaver = gross * (ksPct / 100);
      const studentLoan = hasSl && gross > 24128 ? (gross - 24128) * 0.12 : 0;

      const netAnnual = gross - payeTax + ietc - accLevy - kiwiSaver - studentLoan;
      const effTaxAccPct = gross > 0 ? ((payeTax - ietc + accLevy) / gross) * 100 : 0;

      return {
        primaryValue: fmt(netAnnual, 2),
        primaryUnit: 'NZ$ / year Net Take-Home Pay (2026–27 IRD)',
        secondaryOutputs: [
          { label: 'Fortnightly Net Pay', value: fmtCurrency(netAnnual / 26, 'NZ$') },
          { label: 'Monthly Net Pay', value: fmtCurrency(netAnnual / 12, 'NZ$') },
          { label: 'IRD PAYE Income Tax', value: fmtCurrency(payeTax - ietc, 'NZ$') },
          { label: '2026–27 ACC Levy (1.75%)', value: fmtCurrency(accLevy, 'NZ$') },
          { label: `KiwiSaver Employee (${ksPct}%)`, value: fmtCurrency(kiwiSaver, 'NZ$') },
          { label: 'NZ Student Loan (12% >$24,128)', value: fmtCurrency(studentLoan, 'NZ$') },
          { label: 'Effective Tax + ACC Burden', value: fmt(effTaxAccPct, 2), unit: '%' },
        ],
        steps: [
          `IRD 2026–27 PAYE Tax (10.5% / 17.5% / 30% / 33% / 39% brackets) = ${fmtCurrency(payeTax, 'NZ$')}${ietc > 0 ? ` less ${fmtCurrency(ietc, 'NZ$')} IETC` : ''}.`,
          `2026–27 ACC Earners' Levy: min(${fmtCurrency(gross, 'NZ$')}, NZ$156,641) × 1.75% = ${fmtCurrency(accLevy, 'NZ$')}.`,
          `KiwiSaver (${ksPct}%) = ${fmtCurrency(kiwiSaver, 'NZ$')}/yr; Student Loan (12% above NZ$24,128) = ${fmtCurrency(studentLoan, 'NZ$')}/yr.`,
          `Annual Net Take-Home = ${fmtCurrency(netAnnual, 'NZ$')} (${fmtCurrency(netAnnual / 26, 'NZ$')}/fortnight).`,
        ],
      };
    },
  },

  // 518. Self-Employment & Quarterly Estimated Tax Calculator (2026 IRS)
  {
    slug: 'self-employment-tax-calculator',
    title: 'Self-Employment & Quarterly Tax Calculator',
    category: 'business-tax',
    formulaDisplay: 'SE Base = Net Profit × 0.9235  |  SE Tax = 12.4% SS (≤$184,500) + 2.9% Med  |  Qtr = Total ÷ 4',
    inputs: [
      { id: 'netBusinessProfit', label: 'Annual Schedule C / 1099 Net Profit', defaultValue: 110000, type: 'number', min: 0, max: 50000000, step: 2500, unit: '$' },
      { id: 'w2Wages', label: 'Other W-2 Wages (Reduces SS Cap Room)', defaultValue: 0, type: 'number', min: 0, max: 10000000, step: 2500, unit: '$', advanced: true },
      {
        id: 'filingStatus',
        label: '2026 IRS Filing Status',
        type: 'select',
        defaultValue: 'single',
        options: [
          { label: 'Single ($16,100 Std Ded)', value: 'single' },
          { label: 'Married Filing Jointly ($32,200 Std Ded)', value: 'mfj' },
          { label: 'Head of Household ($24,150 Std Ded)', value: 'hoh' },
          { label: 'Married Filing Separately ($16,100 Std Ded)', value: 'mfs' },
        ],
      },
      {
        id: 'qbiEligible',
        label: 'Apply 20% QBI Deduction (§199A)?',
        type: 'select',
        defaultValue: 'yes',
        options: [
          { label: 'Yes — Qualified Business Income (20%)', value: 'yes' },
          { label: 'No — Disqualified / SSTB Over Phase-Out', value: 'no' },
        ],
      },
      { id: 'stateTaxRate', label: 'Effective State Income Tax Rate (%)', defaultValue: 4.5, type: 'number', min: 0, max: 15, step: 0.25, unit: '%' },
    ],
    calculate: (v) => {
      const profit = parseNum(v.netBusinessProfit);
      const w2 = v.w2Wages === undefined ? 0 : parseNum(v.w2Wages);
      const fs = (String(v.filingStatus || 'single') as FilingStatus) || 'single';
      const useQbi = String(v.qbiEligible || 'yes') === 'yes';
      const statePct = parseNum(v.stateTaxRate);

      if ([profit, w2, statePct].some(isNaN) || !IRS_2026_STD_DEDUCTION[fs]) {
        return calcError('Please enter valid numeric net profit, W-2 wages, and state tax rate.');
      }
      if (profit < 0 || w2 < 0 || statePct < 0 || statePct > 20) {
        return calcError('Profit, W-2 wages, and state tax rate cannot be negative.');
      }

      const seNetEarnings = profit >= 400 ? profit * 0.9235 : 0;
      const ssCap2026 = 184500;
      const ssRemainingCap = Math.max(0, ssCap2026 - w2);
      const ssTaxable = Math.min(seNetEarnings, ssRemainingCap);
      const ssTax = ssTaxable * 0.124;
      const medicareTax = seNetEarnings * 0.029;
      const totalSeTax = ssTax + medicareTax;

      const halfSeDed = totalSeTax * 0.5;
      const addMedThresh = fs === 'mfj' ? 250000 : fs === 'mfs' ? 125000 : 200000;
      const combinedEarned = w2 + seNetEarnings;
      const addMedTax =
        combinedEarned > addMedThresh
          ? Math.min(seNetEarnings, combinedEarned - addMedThresh) * 0.009
          : 0;

      const agi = profit + w2 - halfSeDed;
      const stdDed = IRS_2026_STD_DEDUCTION[fs];
      const preQbiTaxable = Math.max(0, agi - stdDed);
      const qbiDed = useQbi ? Math.min(Math.max(0, (profit - halfSeDed) * 0.2), preQbiTaxable * 0.2) : 0;
      const fedTaxable = Math.max(0, preQbiTaxable - qbiDed);

      // Compute marginal tax attributable to SE income if W-2 wages exist
      const w2OnlyTaxable = Math.max(0, w2 - stdDed);
      const fullFedIncomeTax = calcProgressiveTax(fedTaxable, IRS_2026_ORDINARY_BRACKETS[fs]);
      const w2OnlyFedTax = calcProgressiveTax(w2OnlyTaxable, IRS_2026_ORDINARY_BRACKETS[fs]);
      const seFedIncomeTax = Math.max(0, fullFedIncomeTax - w2OnlyFedTax);

      const stateTax = Math.max(0, profit - halfSeDed) * (statePct / 100);
      const totalSelfEmployedTaxBill = totalSeTax + addMedTax + seFedIncomeTax + stateTax;
      const quarterlyPayment = totalSelfEmployedTaxBill / 4;
      const effTotalPct = profit > 0 ? (totalSelfEmployedTaxBill / profit) * 100 : 0;

      return {
        primaryValue: fmt(quarterlyPayment, 2),
        primaryUnit: '$ / Quarter Estimated Tax Payment (Form 1040-ES)',
        secondaryOutputs: [
          { label: 'Total Annual SE + Income Tax', value: fmtCurrency(totalSelfEmployedTaxBill) },
          { label: 'Net Income Kept After Tax', value: fmtCurrency(profit - totalSelfEmployedTaxBill) },
          { label: 'Self-Employment Tax (15.3%)', value: fmtCurrency(totalSeTax + addMedTax) },
          { label: '50% SE Tax Deduction', value: fmtCurrency(halfSeDed) },
          { label: '20% QBI Deduction (§199A)', value: fmtCurrency(qbiDed) },
          { label: 'Federal Income Tax on SE', value: fmtCurrency(seFedIncomeTax) },
          { label: `State Tax (${statePct}%)`, value: fmtCurrency(stateTax) },
          { label: 'Effective Combined Rate', value: fmt(effTotalPct, 2), unit: '%' },
        ],
        steps: [
          `Statutory SE Base = ${fmtCurrency(profit)} × 92.35% = ${fmtCurrency(seNetEarnings)} → 12.4% SS (up to 2026 $184,500 cap) = ${fmtCurrency(ssTax)} + 2.9% Medicare = ${fmtCurrency(medicareTax)} (Total SE Tax = ${fmtCurrency(totalSeTax)}).`,
          `Deductions: 50% SE Tax Deduction (${fmtCurrency(halfSeDed)}) + 2026 Std Deduction (${fmtCurrency(stdDed)}) + QBI 20% (${fmtCurrency(qbiDed)}).`,
          `Federal Income Tax on SE profit = ${fmtCurrency(seFedIncomeTax)}; State Tax = ${fmtCurrency(stateTax)}.`,
          `Total Annual Tax = ${fmtCurrency(totalSelfEmployedTaxBill)} (${fmt(effTotalPct, 2)}%) → Four Quarterly Installments of ${fmtCurrency(quarterlyPayment)} each.`,
        ],
      };
    },
  },

  // 519. Freelance & Consulting Rate Calculator
  {
    slug: 'freelance-rate-calculator',
    title: 'Freelance & Consulting Hourly Rate Calculator',
    category: 'business-tax',
    formulaDisplay: 'Hourly Rate = [(Target Net ÷ (1 − Tax%)) + Overhead] ÷ [(52 − PTO) × Hrs/Wk × Billable%]',
    inputs: [
      { id: 'targetNetIncome', label: 'Desired Annual Net Take-Home Pay', defaultValue: 90000, type: 'number', min: 1000, max: 50000000, step: 2500, unit: '$' },
      { id: 'annualOverhead', label: 'Annual Business Expenses & Health Ins', defaultValue: 14000, type: 'number', min: 0, max: 5000000, step: 500, unit: '$' },
      { id: 'effectiveTaxReservePct', label: 'Total Tax Reserve Rate (SE + Income %)', defaultValue: 28, type: 'number', min: 0, max: 60, step: 1, unit: '%' },
      { id: 'weeksOffPerYear', label: 'Vacation, Holidays & Sick Weeks Off', defaultValue: 4, type: 'number', min: 0, max: 40, step: 1, unit: 'wks' },
      { id: 'hoursPerWeek', label: 'Total Working Hours / Week', defaultValue: 40, type: 'number', min: 5, max: 80, step: 2, unit: 'hrs' },
      { id: 'billableUtilizationPct', label: 'Billable Utilization (% Paid Client Time)', defaultValue: 70, type: 'number', min: 10, max: 100, step: 5, unit: '%', helpText: 'Accounts for non-billable admin, sales, proposals, and invoicing (typically 60–75%).' },
    ],
    calculate: (v) => {
      const targetNet = parseNum(v.targetNetIncome);
      const overhead = parseNum(v.annualOverhead);
      const taxPct = parseNum(v.effectiveTaxReservePct);
      const wksOff = parseNum(v.weeksOffPerYear);
      const hrsWk = parseNum(v.hoursPerWeek);
      const utilPct = parseNum(v.billableUtilizationPct);

      if ([targetNet, overhead, taxPct, wksOff, hrsWk, utilPct].some(isNaN)) {
        return calcError('Please enter valid numbers for target income, overhead, tax %, and working hours.');
      }
      if (targetNet <= 0 || overhead < 0 || taxPct < 0 || taxPct >= 75 || wksOff < 0 || wksOff >= 52 || hrsWk <= 0 || utilPct <= 0 || utilPct > 100) {
        return calcError('Check that target income, hours, and utilization (>0%) are positive and weeks off < 52.');
      }

      const workingWeeks = 52 - wksOff;
      const billableHoursPerYear = workingWeeks * hrsWk * (utilPct / 100);
      const preTaxProfitNeeded = targetNet / (1 - taxPct / 100);
      const requiredAnnualRevenue = preTaxProfitNeeded + overhead;
      const minHourlyRate = requiredAnnualRevenue / billableHoursPerYear;
      const dayRate8hr = minHourlyRate * 8;
      const w2EquivSalary = targetNet / (1 - Math.max(0, taxPct - 7.65) / 100);

      return {
        primaryValue: fmt(minHourlyRate, 2),
        primaryUnit: '$ / billable hour Minimum Consulting Rate',
        secondaryOutputs: [
          { label: 'Full Day Rate (8 Billable Hrs)', value: fmtCurrency(dayRate8hr) },
          { label: 'Required Gross Revenue / Yr', value: fmtCurrency(requiredAnnualRevenue) },
          { label: 'Annual Billable Hours', value: `${Math.round(billableHoursPerYear).toLocaleString()} hrs`, unit: `/ ${workingWeeks} wks` },
          { label: 'Tax Reserve Set Aside / Yr', value: fmtCurrency(preTaxProfitNeeded - targetNet) },
          { label: 'Weekly Gross Revenue Target', value: fmtCurrency(requiredAnnualRevenue / workingWeeks) },
          { label: 'Comparable W-2 Salary', value: fmtCurrency(w2EquivSalary) },
        ],
        steps: [
          `Working Schedule: ${52} − ${wksOff} weeks off = ${workingWeeks} active weeks × ${hrsWk} hrs × ${utilPct}% billable = ${fmt(billableHoursPerYear, 0)} billable hours/year.`,
          `Pre-Tax Profit Needed for ${fmtCurrency(targetNet)} net @ ${taxPct}% tax reserve = ${fmtCurrency(preTaxProfitNeeded)}.`,
          `Total Revenue Required = ${fmtCurrency(preTaxProfitNeeded)} + ${fmtCurrency(overhead)} expenses = ${fmtCurrency(requiredAnnualRevenue)}/yr.`,
          `Minimum Hourly Rate = ${fmtCurrency(requiredAnnualRevenue)} ÷ ${fmt(billableHoursPerYear, 0)} hrs = ${fmtCurrency(minHourlyRate)}/hr (${fmtCurrency(dayRate8hr)}/day).`,
        ],
      };
    },
  },

  // 520. Overtime & Bonus Paycheck Calculator
  {
    slug: 'overtime-bonus-paycheck-calculator',
    title: 'Overtime & Bonus Paycheck Calculator',
    category: 'business-tax',
    formulaDisplay: 'Gross = RegPay + 1.5×OT + 2.0×DT + Bonus  |  Bonus Withholding = 22% IRS Flat (37% >$1M)',
    inputs: [
      { id: 'hourlyRate', label: 'Base Regular Hourly Wage ($)', defaultValue: 36, type: 'number', min: 1, max: 5000, step: 1, unit: '$' },
      { id: 'regularHours', label: 'Regular Hours in Pay Period', defaultValue: 80, type: 'number', min: 0, max: 350, step: 1, unit: 'hrs' },
      { id: 'overtimeHours15x', label: 'Overtime Hours (1.5× Time-and-a-Half)', defaultValue: 12, type: 'number', min: 0, max: 200, step: 1, unit: 'hrs' },
      { id: 'doubleTimeHours2x', label: 'Double-Time Hours (2.0× Holiday/Ext)', defaultValue: 0, type: 'number', min: 0, max: 200, step: 1, unit: 'hrs', advanced: true },
      { id: 'cashBonus', label: 'Supplemental Cash Bonus / Commission ($)', defaultValue: 1500, type: 'number', min: 0, max: 10000000, step: 100, unit: '$' },
      { id: 'fedRegularTaxPct', label: 'Effective Federal Tax on Regular Pay (%)', defaultValue: 15, type: 'number', min: 0, max: 45, step: 1, unit: '%' },
      { id: 'stateLocalTaxPct', label: 'State / Local Tax Rate (%)', defaultValue: 4.5, type: 'number', min: 0, max: 15, step: 0.25, unit: '%' },
    ],
    calculate: (v) => {
      const rate = parseNum(v.hourlyRate);
      const regHrs = parseNum(v.regularHours);
      const otHrs = parseNum(v.overtimeHours15x);
      const dtHrs = v.doubleTimeHours2x === undefined ? 0 : parseNum(v.doubleTimeHours2x);
      const bonus = parseNum(v.cashBonus);
      const fedRegPct = parseNum(v.fedRegularTaxPct);
      const statePct = parseNum(v.stateLocalTaxPct);

      if ([rate, regHrs, otHrs, dtHrs, bonus, fedRegPct, statePct].some(isNaN)) {
        return calcError('Please enter valid numeric wage, hours, bonus, and tax percentages.');
      }
      if (rate <= 0 || [regHrs, otHrs, dtHrs, bonus, fedRegPct, statePct].some((x) => x < 0)) {
        return calcError('Hourly rate must be positive; hours, bonus, and tax percentages cannot be negative.');
      }

      const regularPay = rate * regHrs;
      const overtimePay = rate * 1.5 * otHrs;
      const doubleTimePay = rate * 2.0 * dtHrs;
      const wageGross = regularPay + overtimePay + doubleTimePay;
      const totalGross = wageGross + bonus;

      const fedTaxWages = wageGross * (fedRegPct / 100);
      // IRS Pub 15 (Circular E) Supplemental Flat Withholding: 22% up to $1M, 37% above $1M
      const bonusFedTax =
        bonus <= 1000000 ? bonus * 0.22 : 1000000 * 0.22 + (bonus - 1000000) * 0.37;
      const ficaTax = totalGross * 0.0765; // 6.2% SS + 1.45% Medicare
      const stateTax = totalGross * (statePct / 100);

      const totalWithheld = fedTaxWages + bonusFedTax + ficaTax + stateTax;
      const netPaycheck = totalGross - totalWithheld;

      return {
        primaryValue: fmt(netPaycheck, 2),
        primaryUnit: '$ Net Take-Home Paycheck',
        secondaryOutputs: [
          { label: 'Total Gross Paycheck', value: fmtCurrency(totalGross) },
          { label: 'Regular Earnings', value: fmtCurrency(regularPay) },
          { label: 'Overtime + Double-Time Pay', value: fmtCurrency(overtimePay + doubleTimePay) },
          { label: 'IRS 22% Bonus Withholding', value: fmtCurrency(bonusFedTax) },
          { label: 'Regular Wages Federal Tax', value: fmtCurrency(fedTaxWages) },
          { label: 'FICA (7.65% SS + Med)', value: fmtCurrency(ficaTax) },
          { label: `State Tax (${statePct}%)`, value: fmtCurrency(stateTax) },
        ],
        steps: [
          `Gross Pay = (${regHrs}×${fmtCurrency(rate)} = ${fmtCurrency(regularPay)}) + (${otHrs}×${fmtCurrency(rate * 1.5)} OT = ${fmtCurrency(overtimePay)})${dtHrs > 0 ? ` + (${dtHrs}×${fmtCurrency(rate * 2)} DT = ${fmtCurrency(doubleTimePay)})` : ''} + ${fmtCurrency(bonus)} bonus = ${fmtCurrency(totalGross)}.`,
          `Withholding: Regular Fed (${fedRegPct}%) = ${fmtCurrency(fedTaxWages)}; Bonus (IRS 22% Pub 15 flat rule) = ${fmtCurrency(bonusFedTax)}; FICA (7.65%) = ${fmtCurrency(ficaTax)}; State (${statePct}%) = ${fmtCurrency(stateTax)}.`,
          `Net Paycheck Deposited = ${fmtCurrency(netPaycheck)}.`,
        ],
      };
    },
  },

  // 521. Employer Payroll Cost & True Burden Calculator
  {
    slug: 'employer-payroll-cost-calculator',
    title: 'Employer Payroll Cost & Burden Calculator',
    category: 'business-tax',
    formulaDisplay: 'Total Cost = Salary + Employer FICA (6.2% ≤$184.5k + 1.45%) + FUTA/SUTA + Match + Benefits',
    inputs: [
      { id: 'baseAnnualSalary', label: 'Employee Base Annual Salary ($)', defaultValue: 80000, type: 'number', min: 1000, max: 50000000, step: 2500, unit: '$' },
      { id: 'employerMatchPct', label: 'Employer 401(k) / Pension Match (%)', defaultValue: 4.0, type: 'number', min: 0, max: 25, step: 0.5, unit: '%' },
      { id: 'healthBenefitsAnnual', label: 'Employer Health/Dental Insurance Cost', defaultValue: 7200, type: 'number', min: 0, max: 100000, step: 300, unit: '$' },
      { id: 'sutaRatePct', label: 'State Unemployment (SUTA) Rate (%)', defaultValue: 2.7, type: 'number', min: 0, max: 15, step: 0.1, unit: '%' },
      { id: 'sutaWageBase', label: 'State SUTA Wage Base ($)', defaultValue: 14000, type: 'number', min: 0, max: 200000, step: 1000, unit: '$', advanced: true },
      { id: 'workersCompAndOtherPct', label: 'Workers Comp & Payroll Admin (% of Sal)', defaultValue: 1.5, type: 'number', min: 0, max: 25, step: 0.25, unit: '%', advanced: true },
    ],
    calculate: (v) => {
      const sal = parseNum(v.baseAnnualSalary);
      const matchPct = parseNum(v.employerMatchPct);
      const health = parseNum(v.healthBenefitsAnnual);
      const sutaRate = parseNum(v.sutaRatePct);
      const sutaBase = v.sutaWageBase === undefined ? 14000 : parseNum(v.sutaWageBase);
      const wcPct = v.workersCompAndOtherPct === undefined ? 1.5 : parseNum(v.workersCompAndOtherPct);

      if ([sal, matchPct, health, sutaRate, sutaBase, wcPct].some(isNaN)) {
        return calcError('Please enter valid numeric salary, benefits, match %, and tax rates.');
      }
      if (sal <= 0 || [matchPct, health, sutaRate, sutaBase, wcPct].some((x) => x < 0)) {
        return calcError('Salary must be positive; percentages, benefits, and wage bases cannot be negative.');
      }

      // 2026 Employer FICA: 6.2% SS up to $184,500 + 1.45% Medicare (uncapped)
      const empSs = Math.min(sal, 184500) * 0.062;
      const empMed = sal * 0.0145;
      // FUTA: 0.6% effective rate (after 5.4% SUTA credit) on first $7,000
      const futa = Math.min(sal, 7000) * 0.006;
      const suta = Math.min(sal, sutaBase) * (sutaRate / 100);
      const retirementMatch = sal * (matchPct / 100);
      const wcOverhead = sal * (wcPct / 100);

      const mandatoryTaxes = empSs + empMed + futa + suta;
      const totalBurden = mandatoryTaxes + retirementMatch + health + wcOverhead;
      const totalEmployerCost = sal + totalBurden;
      const burdenMultiplier = totalEmployerCost / sal;
      const hourlyTrueCost = totalEmployerCost / 2080;

      return {
        primaryValue: fmt(totalEmployerCost, 2),
        primaryUnit: `$ / year Total Employer Burdened Cost (${fmt(burdenMultiplier, 2)}x)`,
        secondaryOutputs: [
          { label: 'Total Burden Above Base', value: fmtCurrency(totalBurden), unit: `(+${fmt((totalBurden / sal) * 100, 1)}%)` },
          { label: 'Burden Multiplier', value: `${fmt(burdenMultiplier, 3)}x` },
          { label: 'True Hourly Cost (2,080h)', value: fmtCurrency(hourlyTrueCost), unit: '/hr' },
          { label: 'Employer FICA (2026 Cap $184.5k)', value: fmtCurrency(empSs + empMed) },
          { label: 'FUTA + SUTA Unemployment', value: fmtCurrency(futa + suta) },
          { label: '401(k) Match + Health Ins', value: fmtCurrency(retirementMatch + health) },
          { label: 'Monthly Employer Budget', value: fmtCurrency(totalEmployerCost / 12) },
        ],
        steps: [
          `Mandatory Payroll Taxes: 6.2% SS (${fmtCurrency(empSs)}) + 1.45% Med (${fmtCurrency(empMed)}) + FUTA 0.6%≤$7k (${fmtCurrency(futa)}) + SUTA (${fmtCurrency(suta)}) = ${fmtCurrency(mandatoryTaxes)}.`,
          `Benefits & Risk Overhead: ${matchPct}% match (${fmtCurrency(retirementMatch)}) + Health (${fmtCurrency(health)}) + Workers Comp/Admin (${fmtCurrency(wcOverhead)}) = ${fmtCurrency(retirementMatch + health + wcOverhead)}.`,
          `All-In Employer Cost = ${fmtCurrency(sal)} + ${fmtCurrency(totalBurden)} = ${fmtCurrency(totalEmployerCost)}/yr (${fmt(burdenMultiplier, 2)}x base salary, or ${fmtCurrency(hourlyTrueCost)}/hr).`,
        ],
      };
    },
  },

  // 522. SaaS Unit Economics (LTV, CAC, Churn & Payback) Calculator
  {
    slug: 'saas-ltv-cac-calculator',
    title: 'SaaS Unit Economics (LTV & CAC) Calculator',
    category: 'business-tax',
    formulaDisplay: 'LTV = (ARPA × GrossMargin%) ÷ MonthlyChurn%  |  Payback = CAC ÷ (ARPA × GrossMargin%)',
    inputs: [
      { id: 'arpaMonthly', label: 'Average Monthly Revenue Per Account (ARPA)', defaultValue: 250, type: 'number', min: 1, max: 1000000, step: 25, unit: '$' },
      { id: 'grossMarginPct', label: 'SaaS Gross Margin (%)', defaultValue: 80, type: 'number', min: 1, max: 100, step: 1, unit: '%', helpText: 'Revenue less hosting, COGS, and customer support costs (typically 70–85%).' },
      { id: 'monthlyChurnPct', label: 'Monthly Logo Churn Rate (%)', defaultValue: 2.5, type: 'number', min: 0.05, max: 50, step: 0.1, unit: '%' },
      { id: 'cac', label: 'Customer Acquisition Cost (CAC)', defaultValue: 1800, type: 'number', min: 1, max: 1000000, step: 50, unit: '$' },
      { id: 'revenueGrowthYoY', label: 'Annual ARR Growth Rate (Rule of 40)', defaultValue: 35, type: 'number', min: -50, max: 500, step: 5, unit: '%', advanced: true },
      { id: 'ebitdaMarginPct', label: 'Operating / FCF Margin (Rule of 40)', defaultValue: 10, type: 'number', min: -100, max: 80, step: 2, unit: '%', advanced: true },
    ],
    calculate: (v) => {
      const arpa = parseNum(v.arpaMonthly);
      const gmPct = parseNum(v.grossMarginPct);
      const churnPct = parseNum(v.monthlyChurnPct);
      const cac = parseNum(v.cac);
      const growth = v.revenueGrowthYoY === undefined ? 35 : parseNum(v.revenueGrowthYoY);
      const ebitdaPct = v.ebitdaMarginPct === undefined ? 10 : parseNum(v.ebitdaMarginPct);

      if ([arpa, gmPct, churnPct, cac, growth, ebitdaPct].some(isNaN)) {
        return calcError('Please enter valid numbers for ARPA, gross margin, monthly churn, and CAC.');
      }
      if (arpa <= 0 || gmPct <= 0 || gmPct > 100 || churnPct <= 0 || churnPct > 100 || cac <= 0) {
        return calcError('ARPA, gross margin (1–100%), monthly churn (>0–100%), and CAC must be positive.');
      }

      const monthlyGrossProfit = arpa * (gmPct / 100);
      const avgLifetimeMonths = 1 / (churnPct / 100);
      const ltv = monthlyGrossProfit * avgLifetimeMonths;
      const ltvCacRatio = ltv / cac;
      const cacPaybackMonths = cac / monthlyGrossProfit;
      const annualChurnEquiv = (1 - Math.pow(1 - churnPct / 100, 12)) * 100;
      const ruleOf40 = growth + ebitdaPct;

      const healthLabel =
        ltvCacRatio >= 3 && cacPaybackMonths <= 12
          ? 'Elite SaaS Economics (≥3x & ≤12m)'
          : ltvCacRatio >= 3
          ? 'Healthy LTV:CAC (Watch Payback)'
          : 'Needs Optimization (<3x LTV:CAC)';

      return {
        primaryValue: fmt(ltvCacRatio, 2),
        primaryUnit: `x LTV:CAC Ratio (${healthLabel})`,
        secondaryOutputs: [
          { label: 'Gross-Margin Customer LTV', value: fmtCurrency(ltv) },
          { label: 'CAC Payback Period', value: fmt(cacPaybackMonths, 1), unit: 'months' },
          { label: 'Monthly Gross Profit / Acct', value: fmtCurrency(monthlyGrossProfit) },
          { label: 'Avg Customer Lifespan', value: fmt(avgLifetimeMonths, 1), unit: 'months' },
          { label: 'Compounded Annual Logo Churn', value: fmt(annualChurnEquiv, 1), unit: '%' },
          { label: 'Rule of 40 Score', value: `${fmt(ruleOf40, 0)}%`, unit: ruleOf40 >= 40 ? 'Passes ≥40%' : 'Below 40%' },
        ],
        steps: [
          `Monthly Gross Profit per Customer = ${fmtCurrency(arpa)} × ${gmPct}% = ${fmtCurrency(monthlyGrossProfit)}/mo.`,
          `Average Customer Lifetime = 1 ÷ ${churnPct}% = ${fmt(avgLifetimeMonths, 1)} months → LTV = ${fmtCurrency(monthlyGrossProfit)} × ${fmt(avgLifetimeMonths, 1)} = ${fmtCurrency(ltv)}.`,
          `LTV:CAC Ratio = ${fmtCurrency(ltv)} ÷ ${fmtCurrency(cac)} = ${fmt(ltvCacRatio, 2)}x; CAC Payback = ${fmtCurrency(cac)} ÷ ${fmtCurrency(monthlyGrossProfit)} = ${fmt(cacPaybackMonths, 1)} months.`,
          `Rule of 40 = ${growth}% ARR growth + ${ebitdaPct}% margin = ${fmt(ruleOf40, 0)}%.`,
        ],
      };
    },
  },

  // 523. NPV, IRR & Payback Period Calculator
  {
    slug: 'npv-irr-calculator',
    title: 'NPV, IRR & Payback Period Calculator',
    category: 'business-tax',
    formulaDisplay: 'NPV = −I₀ + Σ CF_t ÷ (1 + r)^t  |  IRR: NPV(IRR) = 0  |  PI = (NPV + I₀) ÷ I₀',
    inputs: [
      { id: 'initialInvestment', label: 'Initial Outlay at Year 0 (I₀, positive $)', defaultValue: 100000, type: 'number', min: 1, max: 1000000000, step: 2500, unit: '$' },
      { id: 'discountRatePct', label: 'Discount Rate / WACC Hurdle (%)', defaultValue: 10.0, type: 'number', min: 0, max: 60, step: 0.5, unit: '%' },
      { id: 'cf1', label: 'Year 1 Net Cash Flow', defaultValue: 28000, type: 'number', min: -100000000, max: 1000000000, step: 1000, unit: '$' },
      { id: 'cf2', label: 'Year 2 Net Cash Flow', defaultValue: 34000, type: 'number', min: -100000000, max: 1000000000, step: 1000, unit: '$' },
      { id: 'cf3', label: 'Year 3 Net Cash Flow', defaultValue: 38000, type: 'number', min: -100000000, max: 1000000000, step: 1000, unit: '$' },
      { id: 'cf4', label: 'Year 4 Net Cash Flow', defaultValue: 40000, type: 'number', min: -100000000, max: 1000000000, step: 1000, unit: '$' },
      { id: 'cf5', label: 'Year 5 Net Cash Flow (incl. Salvage)', defaultValue: 42000, type: 'number', min: -100000000, max: 1000000000, step: 1000, unit: '$' },
    ],
    calculate: (v) => {
      const i0 = parseNum(v.initialInvestment);
      const rPct = parseNum(v.discountRatePct);
      const cf1 = parseNum(v.cf1);
      const cf2 = parseNum(v.cf2);
      const cf3 = parseNum(v.cf3);
      const cf4 = parseNum(v.cf4);
      const cf5 = parseNum(v.cf5);

      if ([i0, rPct, cf1, cf2, cf3, cf4, cf5].some(isNaN)) {
        return calcError('Please enter valid numeric initial investment, discount rate, and annual cash flows.');
      }
      if (i0 <= 0 || rPct < 0) {
        return calcError('Initial investment must be positive and discount rate cannot be negative.');
      }

      const cfs = [cf1, cf2, cf3, cf4, cf5];
      const r = rPct / 100;
      let pvInflows = 0;
      let simpleCum = -i0;
      let discCum = -i0;
      let simplePayback: number | null = null;
      let discPayback: number | null = null;

      for (let t = 1; t <= cfs.length; t++) {
        const cf = cfs[t - 1];
        const pv = cf / Math.pow(1 + r, t);
        pvInflows += pv;

        const prevSimp = simpleCum;
        simpleCum += cf;
        if (simplePayback === null && simpleCum >= 0 && cf > 0) {
          simplePayback = t - 1 + Math.abs(prevSimp) / cf;
        }

        const prevDisc = discCum;
        discCum += pv;
        if (discPayback === null && discCum >= 0 && pv > 0) {
          discPayback = t - 1 + Math.abs(prevDisc) / pv;
        }
      }

      const npv = pvInflows - i0;
      const pi = pvInflows / i0;
      const irr = solveIrrPct([-i0, ...cfs]);
      const decision = npv >= 0 ? 'Accept (NPV ≥ $0)' : 'Reject (NPV < $0)';

      return {
        primaryValue: fmt(npv, 2),
        primaryUnit: `$ Net Present Value (${decision})`,
        secondaryOutputs: [
          { label: 'Internal Rate of Return (IRR)', value: irr !== null ? fmt(irr, 2) : 'No Real IRR', unit: irr !== null ? '%' : '' },
          { label: 'Profitability Index (PI)', value: `${fmt(pi, 3)}x` },
          { label: 'Present Value of Cash Inflows', value: fmtCurrency(pvInflows) },
          { label: 'Simple Payback Period', value: simplePayback !== null ? `${fmt(simplePayback, 2)} yrs` : '> 5 Years' },
          { label: 'Discounted Payback Period', value: discPayback !== null ? `${fmt(discPayback, 2)} yrs` : '> 5 Years' },
          { label: 'IRR Spread Over Hurdle', value: irr !== null ? `${irr - rPct >= 0 ? '+' : ''}${fmt(irr - rPct, 2)}%` : 'N/A' },
        ],
        steps: [
          `Discounting CF₁..CF₅ (${cfs.map((c) => fmtCurrency(c)).join(', ')}) at ${rPct}% WACC gives PV of Inflows = ${fmtCurrency(pvInflows)}.`,
          `NPV = ${fmtCurrency(pvInflows)} − ${fmtCurrency(i0)} = ${fmtCurrency(npv)} (Profitability Index = ${fmt(pi, 3)}x → ${decision}).`,
          `Solving NPV(r) = 0 yields IRR = ${irr !== null ? `${fmt(irr, 2)}%` : 'Undefined'} (${irr !== null ? (irr >= rPct ? 'exceeds' : 'below') : ''} ${rPct}% hurdle).`,
          `Payback: Simple = ${simplePayback !== null ? `${fmt(simplePayback, 2)} yrs` : '>5 yrs'}; Discounted = ${discPayback !== null ? `${fmt(discPayback, 2)} yrs` : '>5 yrs'}.`,
        ],
      };
    },
  },

  // 524. Bond Yield to Maturity (YTM) & Duration Calculator
  {
    slug: 'bond-yield-calculator',
    title: 'Bond Yield to Maturity (YTM) & Duration Calculator',
    category: 'business-tax',
    formulaDisplay: 'Price = Σ [C/m ÷ (1 + YTM/m)^t] + Face ÷ (1 + YTM/m)^N  |  ModDur = MacDur ÷ (1 + YTM/m)',
    inputs: [
      { id: 'faceValue', label: 'Bond Par / Face Value ($)', defaultValue: 1000, type: 'number', min: 100, max: 10000000, step: 100, unit: '$' },
      { id: 'currentPrice', label: 'Current Market Price ($)', defaultValue: 940, type: 'number', min: 10, max: 10000000, step: 5, unit: '$' },
      { id: 'couponRatePct', label: 'Annual Coupon Rate (%)', defaultValue: 5.0, type: 'number', min: 0, max: 30, step: 0.125, unit: '%' },
      { id: 'yearsToMaturity', label: 'Years Remaining to Maturity', defaultValue: 10, type: 'number', min: 0.5, max: 100, step: 0.5, unit: 'yrs' },
      {
        id: 'couponFrequency',
        label: 'Coupon Payment Frequency',
        type: 'select',
        defaultValue: '2',
        options: [
          { label: 'Semi-Annual (2/yr — Standard US Treasury/Corp)', value: '2' },
          { label: 'Annual (1/yr)', value: '1' },
          { label: 'Quarterly (4/yr)', value: '4' },
        ],
      },
      { id: 'marginalTaxRatePct', label: 'Marginal Tax Rate (Tax-Equiv Yield %)', defaultValue: 24, type: 'number', min: 0, max: 55, step: 1, unit: '%', advanced: true },
    ],
    calculate: (v) => {
      const face = parseNum(v.faceValue);
      const price = parseNum(v.currentPrice);
      const couponPct = parseNum(v.couponRatePct);
      const yrs = parseNum(v.yearsToMaturity);
      const m = parseNum(v.couponFrequency || 2);
      const taxPct = v.marginalTaxRatePct === undefined ? 24 : parseNum(v.marginalTaxRatePct);

      if ([face, price, couponPct, yrs, m, taxPct].some(isNaN)) {
        return calcError('Please enter valid numbers for bond par value, market price, coupon %, and years to maturity.');
      }
      if (face <= 0 || price <= 0 || yrs <= 0 || yrs > 100 || couponPct < 0 || couponPct > 100 || taxPct < 0 || taxPct >= 90 || ![1, 2, 4].includes(m)) {
        return calcError('Bond maturity must be between 0.5 and 100 years, coupon 0–100%, and face/price positive.');
      }

      const nPeriods = Math.max(1, Math.round(yrs * m));
      const couponPerPeriod = (face * (couponPct / 100)) / m;

      const bondPriceAtPerRate = (rPer: number): number => {
        if (rPer <= -0.99) return 1e12;
        if (Math.abs(rPer) < 1e-10) return couponPerPeriod * nPeriods + face;
        let pv = 0;
        for (let t = 1; t <= nPeriods; t++) {
          pv += couponPerPeriod / Math.pow(1 + rPer, t);
        }
        pv += face / Math.pow(1 + rPer, nPeriods);
        return pv;
      };

      // Bisection solve for per-period yield rPer
      let lo = -0.05;
      let hi = 0.5;
      for (let i = 0; i < 90; i++) {
        const mid = (lo + hi) / 2;
        if (bondPriceAtPerRate(mid) > price) lo = mid;
        else hi = mid;
      }
      const rPer = (lo + hi) / 2;
      const ytmPct = rPer * m * 100;
      const currentYieldPct = ((face * (couponPct / 100)) / price) * 100;
      const effectiveAnnualYieldPct = (Math.pow(1 + rPer, m) - 1) * 100;

      // Macaulay Duration (in years) & Modified Duration
      let weightedPvSum = 0;
      for (let t = 1; t <= nPeriods; t++) {
        const cf = t === nPeriods ? couponPerPeriod + face : couponPerPeriod;
        const pvCf = cf / Math.pow(1 + rPer, t);
        weightedPvSum += (t / m) * pvCf;
      }
      const macDuration = weightedPvSum / price;
      const modDuration = macDuration / (1 + rPer);
      const taxEquivYieldPct = ytmPct / (1 - taxPct / 100);
      const priceStatus = Math.abs(price - face) < 0.01 ? 'Par Bond' : price < face ? 'Discount Bond' : 'Premium Bond';

      return {
        primaryValue: fmt(ytmPct, 3),
        primaryUnit: `% Annualized Yield to Maturity (${priceStatus})`,
        secondaryOutputs: [
          { label: 'Current Yield', value: fmt(currentYieldPct, 3), unit: '%' },
          { label: 'Effective Annual Yield (EAY)', value: fmt(effectiveAnnualYieldPct, 3), unit: '%' },
          { label: 'Macaulay Duration', value: fmt(macDuration, 2), unit: 'years' },
          { label: 'Modified Duration (-ΔP / +1% YTM)', value: `${fmt(modDuration, 2)}%` },
          { label: 'Muni Tax-Equivalent Yield', value: fmt(taxEquivYieldPct, 2), unit: '%' },
          { label: 'Periodic Coupon Cash Flow', value: fmtCurrency(couponPerPeriod), unit: `(${m}×/yr)` },
        ],
        steps: [
          `${priceStatus}: Paying ${fmtCurrency(price)} for a ${fmtCurrency(face)} par bond paying ${fmtCurrency(couponPerPeriod)} × ${nPeriods} periods (${yrs} yrs).`,
          `Discounting future coupons + par value to equal ${fmtCurrency(price)} solves to Yield to Maturity = ${fmt(ytmPct, 3)}% nominal (${fmt(effectiveAnnualYieldPct, 3)}% EAY) vs. Current Yield = ${fmt(currentYieldPct, 3)}%.`,
          `Macaulay Duration = ${fmt(macDuration, 2)} yrs → Modified Duration = ${fmt(modDuration, 2)} (a +1.00% yield jump implies roughly a -${fmt(modDuration, 2)}% price drop).`,
        ],
      };
    },
  },

  // 525. Tax-Loss Harvesting Calculator
  {
    slug: 'tax-loss-harvesting-calculator',
    title: 'Tax-Loss Harvesting Savings Calculator',
    category: 'business-tax',
    formulaDisplay: 'Offset Order: 1) ST Gains → 2) LT Gains → 3) Up to $3,000 ($1.5k MFS) Ordinary Income → Carryforward',
    inputs: [
      { id: 'harvestedLoss', label: 'Realized Unrealized Capital Loss to Harvest ($)', defaultValue: 18000, type: 'number', min: 1, max: 100000000, step: 500, unit: '$' },
      { id: 'shortTermGains', label: 'Realized Short-Term Capital Gains ($)', defaultValue: 6000, type: 'number', min: 0, max: 100000000, step: 500, unit: '$' },
      { id: 'longTermGains', label: 'Realized Long-Term Capital Gains ($)', defaultValue: 5000, type: 'number', min: 0, max: 100000000, step: 500, unit: '$' },
      { id: 'ordinaryMarginalRate', label: 'Ordinary / STG Marginal Tax Rate (%)', defaultValue: 24, type: 'number', min: 0, max: 50, step: 1, unit: '%' },
      { id: 'ltcgTaxRate', label: 'Long-Term Capital Gains Tax Rate (%)', defaultValue: 15, type: 'number', min: 0, max: 30, step: 1, unit: '%' },
      {
        id: 'isMarriedSeparate',
        label: 'Married Filing Separately ($1,500 Cap)?',
        type: 'select',
        defaultValue: 'no',
        options: [
          { label: 'No — Single / MFJ / HOH ($3,000 Ordinary Offset Cap)', value: 'no' },
          { label: 'Yes — MFS ($1,500 Ordinary Offset Cap)', value: 'yes' },
        ],
        advanced: true,
      },
    ],
    calculate: (v) => {
      const loss = parseNum(v.harvestedLoss);
      const stg = parseNum(v.shortTermGains);
      const ltg = parseNum(v.longTermGains);
      const ordPct = parseNum(v.ordinaryMarginalRate);
      const ltPct = parseNum(v.ltcgTaxRate);
      const mfs = String(v.isMarriedSeparate || 'no') === 'yes';

      if ([loss, stg, ltg, ordPct, ltPct].some(isNaN)) {
        return calcError('Please enter valid numeric capital loss, gain amounts, and tax rates.');
      }
      if (loss <= 0 || stg < 0 || ltg < 0 || ordPct < 0 || ordPct > 55 || ltPct < 0 || ltPct > 35) {
        return calcError('Harvested loss must be positive; gains and tax rates cannot be negative.');
      }

      // IRS IRC §1211 / §1212 ordering: ST gains, then LT gains, then up to $3,000 ($1,500 MFS) ordinary income
      let remLoss = loss;
      const stgOffset = Math.min(remLoss, stg);
      remLoss -= stgOffset;

      const ltgOffset = Math.min(remLoss, ltg);
      remLoss -= ltgOffset;

      const ordCap = mfs ? 1500 : 3000;
      const ordOffset = Math.min(remLoss, ordCap);
      remLoss -= ordOffset;

      const carryforward = Math.max(0, remLoss);

      const stgTaxSaved = stgOffset * (ordPct / 100);
      const ltgTaxSaved = ltgOffset * (ltPct / 100);
      const ordTaxSaved = ordOffset * (ordPct / 100);
      const totalCurrentYearTaxSaved = stgTaxSaved + ltgTaxSaved + ordTaxSaved;
      const estFutureCarryforwardValue = carryforward * (ltPct / 100);

      return {
        primaryValue: fmt(totalCurrentYearTaxSaved, 2),
        primaryUnit: '$ Current-Year Federal Tax Savings (IRC §1211)',
        secondaryOutputs: [
          { label: 'Short-Term Gains Offset', value: fmtCurrency(stgOffset), unit: `(${fmtCurrency(stgTaxSaved)} saved)` },
          { label: 'Long-Term Gains Offset', value: fmtCurrency(ltgOffset), unit: `(${fmtCurrency(ltgTaxSaved)} saved)` },
          { label: `Ordinary Income Offset (≤$${ordCap.toLocaleString()})`, value: fmtCurrency(ordOffset), unit: `(${fmtCurrency(ordTaxSaved)} saved)` },
          { label: 'Loss Carryforward to Future Yrs', value: fmtCurrency(carryforward) },
          { label: 'Est. Carryforward Shield (@ LTCG%)', value: fmtCurrency(estFutureCarryforwardValue) },
          { label: 'Wash-Sale Exclusion Window', value: '±30 Days (61-Day Span)' },
        ],
        steps: [
          `Step 1 — Offset Short-Term Gains (${ordPct}% rate): ${fmtCurrency(stgOffset)} offset saves ${fmtCurrency(stgTaxSaved)}.`,
          `Step 2 — Offset Long-Term Gains (${ltPct}% rate): ${fmtCurrency(ltgOffset)} offset saves ${fmtCurrency(ltgTaxSaved)}.`,
          `Step 3 — Ordinary Income Deduction (IRC §1211(b) cap ${fmtCurrency(ordCap)}): ${fmtCurrency(ordOffset)} offset saves ${fmtCurrency(ordTaxSaved)}.`,
          `Total Immediate Year Tax Reduction = ${fmtCurrency(totalCurrentYearTaxSaved)}; Indefinite Carryforward Remaining = ${fmtCurrency(carryforward)}. Observe the IRS 30-day Wash-Sale Rule before/after sale.`,
        ],
      };
    },
  },
];
