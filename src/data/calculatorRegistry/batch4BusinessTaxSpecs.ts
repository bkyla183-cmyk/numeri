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

const normalCdf = (z: number): number => {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989422804014327 * Math.exp(-0.5 * z * z);
  const p =
    d *
    t *
    (0.31938153 +
      t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return z >= 0 ? 1 - p : p;
};

const invNormal = (p: number): number => {
  if (p <= 0 || p >= 1) return 1.645;
  // Beasley-Springer approximation for standard quantiles
  if (Math.abs(p - 0.95) < 0.002) return 1.6449;
  if (Math.abs(p - 0.99) < 0.002) return 2.3263;
  if (Math.abs(p - 0.9) < 0.002) return 1.2816;
  let lo = -4;
  let hi = 4;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (normalCdf(mid) < p) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
};

export const batch4BusinessTaxSpecs: CalculatorSpec[] = [
  // 598. WACC Calculator
  {
    slug: 'wacc-cost-of-capital-calculator',
    title: 'WACC (Weighted Average Cost of Capital) Calculator',
    category: 'business-tax',
    formulaDisplay: 'WACC = (E/V)×Re + (D/V)×Rd×(1 − Tax)',
    inputs: [
      { id: 'equityValue', label: 'Market Value of Equity (E)', type: 'number', prefix: '$', defaultValue: 8000000, min: 0, max: 1e14, step: 100000 },
      { id: 'debtValue', label: 'Market Value of Debt (D)', type: 'number', prefix: '$', defaultValue: 2000000, min: 0, max: 1e14, step: 100000 },
      { id: 'costOfEquityPct', label: 'Cost of Equity (Re)', type: 'number', unit: '%', defaultValue: 10.5, min: 0, max: 50, step: 0.25 },
      { id: 'costOfDebtPct', label: 'Pre-Tax Cost of Debt (Rd)', type: 'number', unit: '%', defaultValue: 6.0, min: 0, max: 50, step: 0.25 },
      { id: 'taxRatePct', label: 'Corporate Tax Rate (Tc)', type: 'number', unit: '%', defaultValue: 21.0, min: 0, max: 60, step: 0.5 },
    ],
    calculate: (v) => {
      const E = parseNum(v.equityValue);
      const D = parseNum(v.debtValue);
      const re = parseNum(v.costOfEquityPct) / 100;
      const rd = parseNum(v.costOfDebtPct) / 100;
      const tc = parseNum(v.taxRatePct) / 100;
      if ([E, D, re, rd, tc].some(Number.isNaN)) return calcError('Enter valid corporate capital inputs.');
      if (E < 0 || D < 0 || re < 0 || rd < 0 || tc < 0 || tc >= 1) return calcError('Capital values must be non-negative and tax rate <100%.');
      const V = E + D;
      if (V <= 0) return calcError('Total capital (E + D) must be positive.');
      const afterTaxRd = rd * (1 - tc);
      const wacc = ((E / V) * re + (D / V) * afterTaxRd) * 100;
      return {
        primaryValue: fmt(wacc, 2),
        primaryUnit: '%',
        primaryLabel: 'Weighted Average Cost of Capital (WACC)',
        secondaryOutputs: [
          { label: 'Equity Weight (E / V)', value: `${fmt((E / V) * 100, 1)}%` },
          { label: 'Debt Weight (D / V)', value: `${fmt((D / V) * 100, 1)}%` },
          { label: 'After-Tax Cost of Debt', value: `${fmt(afterTaxRd * 100, 2)}%` },
        ],
        steps: [
          `Total capital V = $${money(V)} (${fmt((E / V) * 100, 1)}% equity / ${fmt((D / V) * 100, 1)}% debt).`,
          `After-tax Rd = ${fmt(rd * 100, 2)}% × (1 − ${fmt(tc * 100, 1)}%) = ${fmt(afterTaxRd * 100, 2)}% → WACC = ${fmt(wacc, 2)}%.`,
        ],
      };
    },
  },

  // 599. EBITDA Margin & EV/EBITDA Valuation Calculator
  {
    slug: 'ebitda-margin-valuation-calculator',
    title: 'EBITDA Margin & Enterprise Valuation Calculator',
    category: 'business-tax',
    formulaDisplay: 'EBITDA = Operating Income (EBIT) + D&A   |   EV = EBITDA × Multiple',
    inputs: [
      { id: 'revenue', label: 'Annual Revenue', type: 'number', prefix: '$', defaultValue: 5000000, min: 1, max: 1e14, step: 50000 },
      { id: 'ebit', label: 'Operating Income (EBIT)', type: 'number', prefix: '$', defaultValue: 850000, min: -1e13, max: 1e14, step: 10000 },
      { id: 'da', label: 'Depreciation & Amortization (D&A)', type: 'number', prefix: '$', defaultValue: 250000, min: 0, max: 1e13, step: 10000 },
      { id: 'evMultiple', label: 'EV / EBITDA Multiple', type: 'number', unit: '×', defaultValue: 8.5, min: 0, max: 100, step: 0.5 },
      { id: 'netDebt', label: 'Net Debt (Total Debt − Cash)', type: 'number', prefix: '$', defaultValue: 600000, min: -1e13, max: 1e13, step: 25000 },
    ],
    calculate: (v) => {
      const rev = parseNum(v.revenue);
      const ebit = parseNum(v.ebit);
      const da = parseNum(v.da);
      const mult = parseNum(v.evMultiple);
      const netDebt = parseNum(v.netDebt);
      if ([rev, ebit, da, mult, netDebt].some(Number.isNaN)) return calcError('Enter valid financial statement inputs.');
      if (rev <= 0 || da < 0 || mult < 0) return calcError('Revenue must be positive and D&A/multiple non-negative.');
      const ebitda = ebit + da;
      const ebitdaMargin = (ebitda / rev) * 100;
      const ev = ebitda * mult;
      const impliedEquity = ev - netDebt;
      return {
        primaryValue: fmt(ebitda, 2),
        primaryUnit: '$',
        primaryLabel: 'Annual EBITDA',
        secondaryOutputs: [
          { label: 'EBITDA Margin %', value: `${fmt(ebitdaMargin, 2)}%` },
          { label: `Implied Enterprise Value (${mult}×)`, value: `$${money(ev)}` },
          { label: 'Implied Equity Value', value: `$${money(impliedEquity)}` },
        ],
        steps: [
          `EBITDA = $${money(ebit)} + $${money(da)} = $${money(ebitda)} (${fmt(ebitdaMargin, 2)}% of revenue).`,
          `EV = $${money(ebitda)} × ${mult} = $${money(ev)} → Equity = $${money(impliedEquity)}.`,
        ],
      };
    },
  },

  // 600. Free Cash Flow (FCF) Calculator
  {
    slug: 'free-cash-flow-fcf-calculator',
    title: 'Free Cash Flow (FCF) & FCFF Calculator',
    category: 'business-tax',
    formulaDisplay: 'FCF = Operating Cash Flow − CapEx   |   FCFF = EBIT(1−T) + D&A − CapEx − ΔNWC',
    inputs: [
      { id: 'operatingCashFlow', label: 'Cash Flow from Operations (CFO)', type: 'number', prefix: '$', defaultValue: 1450000, min: -1e13, max: 1e14, step: 25000 },
      { id: 'capex', label: 'Capital Expenditures (CapEx)', type: 'number', prefix: '$', defaultValue: 380000, min: 0, max: 1e13, step: 10000 },
      { id: 'revenue', label: 'Annual Revenue (for FCF Margin)', type: 'number', prefix: '$', defaultValue: 8000000, min: 1, max: 1e14, step: 50000 },
      { id: 'netDebtChange', label: 'Net Debt Issued / (Repaid)', type: 'number', prefix: '$', defaultValue: -100000, min: -1e13, max: 1e13, step: 10000, advanced: true },
    ],
    calculate: (v) => {
      const cfo = parseNum(v.operatingCashFlow);
      const capex = parseNum(v.capex);
      const rev = parseNum(v.revenue);
      const debtChg = parseNum(v.netDebtChange ?? 0);
      if ([cfo, capex, rev, debtChg].some(Number.isNaN)) return calcError('Enter valid cash flow values.');
      if (capex < 0 || rev <= 0) return calcError('CapEx must be non-negative and revenue positive.');
      const fcf = cfo - capex;
      const fcfe = fcf + debtChg;
      const fcfMargin = (fcf / rev) * 100;
      return {
        primaryValue: fmt(fcf, 2),
        primaryUnit: '$',
        primaryLabel: 'Unlevered / Levered FCF (CFO − CapEx)',
        secondaryOutputs: [
          { label: 'FCF Margin (% of Revenue)', value: `${fmt(fcfMargin, 2)}%` },
          { label: 'Free Cash Flow to Equity (FCFE)', value: `$${money(fcfe)}` },
          { label: 'CapEx Reinvestment Ratio', value: cfo > 0 ? `${fmt((capex / cfo) * 100, 1)}%` : 'N/A' },
        ],
        steps: [
          `FCF = $${money(cfo)} − $${money(capex)} = $${money(fcf)}.`,
          `FCF margin = ${fmt(fcfMargin, 2)}% of $${money(rev)} revenue.`,
        ],
      };
    },
  },

  // 601. Discounted Cash Flow (DCF) Valuation Calculator
  {
    slug: 'dcf-intrinsic-value-calculator',
    title: 'Discounted Cash Flow (DCF) Intrinsic Value Calculator',
    category: 'business-tax',
    formulaDisplay: 'EV = Σ FCF_t/(1+r)^t + TV/(1+r)^N,  TV = FCF_N(1+g)/(r−g)',
    inputs: [
      { id: 'fcfYear0', label: 'Current Annual Free Cash Flow (FCF₀)', type: 'number', prefix: '$', defaultValue: 5000000, min: 0, max: 1e14, step: 100000 },
      { id: 'fcfGrowthPct', label: '5-Year Annual FCF Growth Rate', type: 'number', unit: '%', defaultValue: 10.0, min: -20, max: 100, step: 0.5 },
      { id: 'waccPct', label: 'Discount Rate (WACC)', type: 'number', unit: '%', defaultValue: 9.5, min: 1, max: 40, step: 0.25 },
      { id: 'terminalGrowthPct', label: 'Perpetual Terminal Growth (g < WACC)', type: 'number', unit: '%', defaultValue: 2.5, min: 0, max: 10, step: 0.25 },
      { id: 'cashMinusDebt', label: 'Net Cash (Cash − Total Debt)', type: 'number', prefix: '$', defaultValue: 4000000, min: -1e13, max: 1e13, step: 250000 },
      { id: 'shares', label: 'Diluted Shares Outstanding', type: 'number', defaultValue: 1000000, min: 1, max: 1e12, step: 10000 },
    ],
    calculate: (v) => {
      const fcf0 = parseNum(v.fcfYear0);
      const g5 = parseNum(v.fcfGrowthPct) / 100;
      const r = parseNum(v.waccPct) / 100;
      const tg = parseNum(v.terminalGrowthPct) / 100;
      const netCash = parseNum(v.cashMinusDebt);
      const shares = parseNum(v.shares);
      if ([fcf0, g5, r, tg, netCash, shares].some(Number.isNaN)) return calcError('Enter valid DCF assumptions.');
      if (fcf0 < 0 || shares <= 0 || r <= tg) return calcError('WACC must strictly exceed terminal growth rate and shares must be positive.');
      let pvSum = 0;
      let curFcf = fcf0;
      for (let t = 1; t <= 5; t++) {
        curFcf *= 1 + g5;
        pvSum += curFcf / Math.pow(1 + r, t);
      }
      const terminalValue = (curFcf * (1 + tg)) / (r - tg);
      const pvTerminal = terminalValue / Math.pow(1 + r, 5);
      const enterpriseValue = pvSum + pvTerminal;
      const equityValue = enterpriseValue + netCash;
      const perShare = equityValue / shares;
      return {
        primaryValue: fmt(perShare, 2),
        primaryUnit: '$ / share',
        primaryLabel: 'Intrinsic Equity Value Per Share',
        secondaryOutputs: [
          { label: 'Total Implied Equity Value', value: `$${money(equityValue)}` },
          { label: 'Enterprise Value (PV Stage + TV)', value: `$${money(enterpriseValue)}` },
          { label: 'PV of 5-Year Cash Flows', value: `$${money(pvSum)}` },
          { label: 'PV of Terminal Value', value: `$${money(pvTerminal)} (${fmt((pvTerminal / enterpriseValue) * 100, 1)}%)` },
        ],
        steps: [
          `Year 5 FCF = $${money(curFcf)}; 5-year discounted PV = $${money(pvSum)}.`,
          `Gordon Growth Terminal Value = $${money(terminalValue)} (PV = $${money(pvTerminal)}).`,
          `Equity Value = $${money(equityValue)} ÷ ${shares.toLocaleString()} shares = $${money(perShare)}/sh.`,
        ],
      };
    },
  },

  // 602. Working Capital & Liquidity Ratios Calculator
  {
    slug: 'working-capital-ratio-calculator',
    title: 'Working Capital, Current & Quick Ratio Calculator',
    category: 'business-tax',
    formulaDisplay: 'NWC = Current Assets − Current Liabilities   |   Quick = (CA − Inventory) / CL',
    inputs: [
      { id: 'cashAndEquiv', label: 'Cash & Marketable Securities', type: 'number', prefix: '$', defaultValue: 320000, min: 0, max: 1e13, step: 5000 },
      { id: 'accountsReceivable', label: 'Accounts Receivable', type: 'number', prefix: '$', defaultValue: 280000, min: 0, max: 1e13, step: 5000 },
      { id: 'inventory', label: 'Inventory & Prepaids', type: 'number', prefix: '$', defaultValue: 250000, min: 0, max: 1e13, step: 5000 },
      { id: 'currentLiabilities', label: 'Total Current Liabilities', type: 'number', prefix: '$', defaultValue: 400000, min: 1, max: 1e13, step: 5000 },
    ],
    calculate: (v) => {
      const cash = parseNum(v.cashAndEquiv);
      const ar = parseNum(v.accountsReceivable);
      const inv = parseNum(v.inventory);
      const cl = parseNum(v.currentLiabilities);
      if ([cash, ar, inv, cl].some(Number.isNaN)) return calcError('Enter valid balance sheet figures.');
      if (cash < 0 || ar < 0 || inv < 0 || cl <= 0) return calcError('Assets must be non-negative and current liabilities positive.');
      const ca = cash + ar + inv;
      const nwc = ca - cl;
      const currentRatio = ca / cl;
      const quickRatio = (cash + ar) / cl;
      const cashRatio = cash / cl;
      return {
        primaryValue: fmt(currentRatio, 2),
        primaryUnit: '×',
        primaryLabel: 'Current Liquidity Ratio',
        secondaryOutputs: [
          { label: 'Net Working Capital (NWC)', value: `$${money(nwc)}` },
          { label: 'Quick (Acid-Test) Ratio', value: `${fmt(quickRatio, 2)}×` },
          { label: 'Cash Ratio', value: `${fmt(cashRatio, 2)}×` },
        ],
        steps: [
          `Total Current Assets = $${money(ca)} vs Current Liabilities = $${money(cl)} → NWC = $${money(nwc)}.`,
          `Current Ratio = ${fmt(currentRatio, 2)}×; Quick Ratio (excl. inventory) = ${fmt(quickRatio, 2)}×.`,
        ],
      };
    },
  },

  // 603. Cash Conversion Cycle (CCC) Calculator
  {
    slug: 'cash-conversion-cycle-calculator',
    title: 'Cash Conversion Cycle (CCC = DIO + DSO − DPO) Calculator',
    category: 'business-tax',
    formulaDisplay: 'CCC = DIO + DSO − DPO',
    inputs: [
      { id: 'dio', label: 'Days Inventory Outstanding (DIO)', type: 'number', unit: 'days', defaultValue: 55, min: 0, max: 1000, step: 1 },
      { id: 'dso', label: 'Days Sales Outstanding (DSO)', type: 'number', unit: 'days', defaultValue: 42, min: 0, max: 1000, step: 1 },
      { id: 'dpo', label: 'Days Payable Outstanding (DPO)', type: 'number', unit: 'days', defaultValue: 38, min: 0, max: 1000, step: 1 },
    ],
    calculate: (v) => {
      const dio = parseNum(v.dio);
      const dso = parseNum(v.dso);
      const dpo = parseNum(v.dpo);
      if ([dio, dso, dpo].some(Number.isNaN)) return calcError('Enter valid day counts.');
      if (dio < 0 || dso < 0 || dpo < 0) return calcError('Day metrics cannot be negative.');
      const ccc = dio + dso - dpo;
      const opCycle = dio + dso;
      return {
        primaryValue: fmt(ccc, 1),
        primaryUnit: 'days',
        primaryLabel: 'Net Cash Conversion Cycle',
        secondaryOutputs: [
          { label: 'Operating Cycle (DIO + DSO)', value: `${fmt(opCycle, 1)} days` },
          { label: 'Working Capital Profile', value: ccc < 0 ? 'Negative CCC (Supplier-Funded Growth!)' : ccc <= 30 ? 'Fast Cash Conversion' : 'Cash-Tied Working Capital' },
        ],
        steps: [
          `Operating Cycle = ${dio} + ${dso} = ${fmt(opCycle, 1)} days.`,
          `CCC = ${fmt(opCycle, 1)} − ${dpo} = ${fmt(ccc, 1)} days.`,
        ],
      };
    },
  },

  // 604. Inventory Turnover & DSI Calculator
  {
    slug: 'inventory-turnover-days-calculator',
    title: 'Inventory Turnover Ratio & Days Sales of Inventory Calculator',
    category: 'business-tax',
    formulaDisplay: 'Turnover = COGS / Avg Inventory   |   DSI = 365 / Turnover',
    inputs: [
      { id: 'cogs', label: 'Annual Cost of Goods Sold (COGS)', type: 'number', prefix: '$', defaultValue: 1800000, min: 0, max: 1e14, step: 10000 },
      { id: 'begInventory', label: 'Beginning Inventory', type: 'number', prefix: '$', defaultValue: 260000, min: 0, max: 1e13, step: 5000 },
      { id: 'endInventory', label: 'Ending Inventory', type: 'number', prefix: '$', defaultValue: 340000, min: 0, max: 1e13, step: 5000 },
    ],
    calculate: (v) => {
      const cogs = parseNum(v.cogs);
      const b = parseNum(v.begInventory);
      const e = parseNum(v.endInventory);
      if ([cogs, b, e].some(Number.isNaN)) return calcError('Enter valid COGS and inventory amounts.');
      if (cogs < 0 || b < 0 || e < 0) return calcError('COGS and inventory cannot be negative.');
      const avgInv = (b + e) / 2;
      if (avgInv <= 0) return calcError('Average inventory must be greater than zero.');
      const turnover = cogs / avgInv;
      const dsi = turnover > 0 ? 365 / turnover : 0;
      return {
        primaryValue: fmt(turnover, 2),
        primaryUnit: 'turns / yr',
        primaryLabel: 'Annual Inventory Turnover',
        secondaryOutputs: [
          { label: 'Days Sales of Inventory (DSI)', value: turnover > 0 ? `${fmt(dsi, 1)} days` : 'N/A' },
          { label: 'Average Inventory Value', value: `$${money(avgInv)}` },
        ],
        steps: [
          `Average Inventory = ($${money(b)} + $${money(e)}) ÷ 2 = $${money(avgInv)}.`,
          `Turnover = $${money(cogs)} ÷ $${money(avgInv)} = ${fmt(turnover, 2)}× (DSI = ${fmt(dsi, 1)} days).`,
        ],
      };
    },
  },

  // 605. Economic Order Quantity (EOQ) Calculator
  {
    slug: 'eoq-economic-order-quantity-calculator',
    title: 'Economic Order Quantity (EOQ) & Reorder Calculator',
    category: 'business-tax',
    formulaDisplay: 'EOQ = √(2 × D × S / H)',
    inputs: [
      { id: 'annualDemand', label: 'Annual Unit Demand (D)', type: 'number', unit: 'units', defaultValue: 12000, min: 1, max: 1e11, step: 100 },
      { id: 'orderingCost', label: 'Fixed Order / Setup Cost (S)', type: 'number', prefix: '$', defaultValue: 125, min: 0, max: 1e8, step: 5 },
      { id: 'holdingCost', label: 'Annual Holding Cost / Unit (H)', type: 'number', prefix: '$', defaultValue: 4.5, min: 0.01, max: 1e7, step: 0.25 },
      { id: 'leadTimeDays', label: 'Supplier Lead Time', type: 'number', unit: 'days', defaultValue: 10, min: 0, max: 365, step: 1 },
    ],
    calculate: (v) => {
      const D = parseNum(v.annualDemand);
      const S = parseNum(v.orderingCost);
      const H = parseNum(v.holdingCost);
      const lead = parseNum(v.leadTimeDays ?? 0);
      if ([D, S, H, lead].some(Number.isNaN)) return calcError('Enter valid numeric EOQ values.');
      if (D <= 0 || S < 0 || H <= 0 || lead < 0) return calcError('Demand and holding cost must be positive.');
      const eoq = Math.sqrt((2 * D * S) / H);
      const ordersPerYr = eoq > 0 ? D / eoq : 0;
      const totalAnnualInvCost = ordersPerYr * S + (eoq / 2) * H;
      const rop = (D / 365) * lead;
      return {
        primaryValue: Math.round(eoq),
        primaryUnit: 'units / order',
        primaryLabel: 'Optimal Order Quantity (EOQ)',
        secondaryOutputs: [
          { label: 'Orders Placed Per Year', value: fmt(ordersPerYr, 1) },
          { label: 'Minimum Annual Order + Holding Cost', value: `$${money(totalAnnualInvCost)}` },
          { label: 'Reorder Point (Zero Safety Stock)', value: `${Math.ceil(rop)} units` },
        ],
        steps: [
          `EOQ = √((2 × ${D} × $${money(S)}) ÷ $${money(H)}) = ${fmt(eoq, 1)} → ${Math.round(eoq)} units.`,
          `Orders/yr = ${fmt(ordersPerYr, 1)}; Reorder Point (@ ${lead}d lead) = ${Math.ceil(rop)} units.`,
        ],
      };
    },
  },

  // 606. Safety Stock & Service Level Calculator
  {
    slug: 'safety-stock-reorder-calculator',
    title: 'Supply Chain Safety Stock & Service Level Calculator',
    category: 'business-tax',
    formulaDisplay: 'SS = Z × √(L × σ_D² + D̄² × σ_L²)',
    inputs: [
      { id: 'avgDailyDemand', label: 'Average Daily Demand (D̄)', type: 'number', unit: 'units/day', defaultValue: 85, min: 0, max: 1e8, step: 5 },
      { id: 'sdDemand', label: 'Daily Demand Std Dev (σ_D)', type: 'number', unit: 'units/day', defaultValue: 18, min: 0, max: 1e7, step: 1 },
      { id: 'avgLeadDays', label: 'Average Lead Time (L)', type: 'number', unit: 'days', defaultValue: 12, min: 0.1, max: 365, step: 1 },
      { id: 'sdLeadDays', label: 'Lead Time Std Dev (σ_L)', type: 'number', unit: 'days', defaultValue: 2.5, min: 0, max: 180, step: 0.5 },
      { id: 'serviceLevelPct', label: 'Target Cycle Service Level', type: 'number', unit: '%', defaultValue: 95, min: 50, max: 99.9, step: 0.5 },
    ],
    calculate: (v) => {
      const D = parseNum(v.avgDailyDemand);
      const sdD = parseNum(v.sdDemand);
      const L = parseNum(v.avgLeadDays);
      const sdL = parseNum(v.sdLeadDays);
      const sl = parseNum(v.serviceLevelPct) / 100;
      if ([D, sdD, L, sdL, sl].some(Number.isNaN)) return calcError('Enter valid safety stock inputs.');
      if (D < 0 || sdD < 0 || L <= 0 || sdL < 0 || sl <= 0.5 || sl >= 1) return calcError('Service level must be between 50.1% and 99.9%.');
      const z = invNormal(sl);
      const ss = z * Math.sqrt(L * sdD * sdD + D * D * sdL * sdL);
      const rop = D * L + ss;
      return {
        primaryValue: Math.ceil(ss),
        primaryUnit: 'units',
        primaryLabel: `Recommended Safety Stock (${fmt(sl * 100, 1)}% Service)`,
        secondaryOutputs: [
          { label: 'Reorder Point (ROP)', value: `${Math.ceil(rop)} units` },
          { label: 'Expected Lead-Time Demand', value: `${Math.round(D * L)} units` },
          { label: 'Service Z-Score', value: fmt(z, 3) },
        ],
        steps: [
          `Z(${fmt(sl * 100, 1)}%) = ${fmt(z, 3)}.`,
          `Combined uncertainty √(${L}×${sdD}² + ${D}²×${sdL}²) = ${fmt(ss / z, 2)} → Safety Stock = ${Math.ceil(ss)} units; ROP = ${Math.ceil(rop)}.`,
        ],
      };
    },
  },

  // 607. Digital Marketing ROAS / CPA / CPC Calculator
  {
    slug: 'cpm-cpc-roas-ad-calculator',
    title: 'ROAS, CPA, CPC & CPM Digital Ad Calculator',
    category: 'business-tax',
    formulaDisplay: 'ROAS = Revenue / Spend   |   CPA = Spend / Conversions',
    inputs: [
      { id: 'adSpend', label: 'Total Ad Spend', type: 'number', prefix: '$', defaultValue: 5000, min: 1, max: 1e11, step: 100 },
      { id: 'impressions', label: 'Total Impressions', type: 'number', defaultValue: 250000, min: 1, max: 1e12, step: 1000 },
      { id: 'clicks', label: 'Total Ad Clicks', type: 'number', defaultValue: 4500, min: 0, max: 1e11, step: 50 },
      { id: 'conversions', label: 'Total Conversions / Orders', type: 'number', defaultValue: 180, min: 0, max: 1e10, step: 5 },
      { id: 'attributedRevenue', label: 'Attributed Revenue', type: 'number', prefix: '$', defaultValue: 21600, min: 0, max: 1e12, step: 100 },
    ],
    calculate: (v) => {
      const spend = parseNum(v.adSpend);
      const imp = parseNum(v.impressions);
      const clicks = parseNum(v.clicks);
      const conv = parseNum(v.conversions);
      const rev = parseNum(v.attributedRevenue);
      if ([spend, imp, clicks, conv, rev].some(Number.isNaN)) return calcError('Enter valid campaign numbers.');
      if (spend <= 0 || imp <= 0 || clicks < 0 || conv < 0 || rev < 0) return calcError('Ad spend and impressions must be positive.');
      const roas = rev / spend;
      const cpm = (spend / imp) * 1000;
      const ctr = (clicks / imp) * 100;
      const cpc = clicks > 0 ? spend / clicks : 0;
      const cvr = clicks > 0 ? (conv / clicks) * 100 : 0;
      const cpa = conv > 0 ? spend / conv : 0;
      return {
        primaryValue: fmt(roas, 2),
        primaryUnit: '× ROAS',
        primaryLabel: `Return on Ad Spend (${fmt(roas * 100, 0)}%)`,
        secondaryOutputs: [
          { label: 'Cost Per Acquisition (CPA)', value: conv > 0 ? `$${money(cpa)}` : 'N/A' },
          { label: 'Cost Per Click (CPC)', value: clicks > 0 ? `$${money(cpc)}` : 'N/A' },
          { label: 'Cost Per Mille (CPM)', value: `$${money(cpm)}` },
          { label: 'CTR / Conversion Rate', value: `${fmt(ctr, 2)}% CTR · ${fmt(cvr, 2)}% CVR` },
        ],
        steps: [
          `ROAS = $${money(rev)} ÷ $${money(spend)} = ${fmt(roas, 2)}× (${fmt(roas * 100, 0)}%).`,
          `CPM = $${money(cpm)}; CPC = $${money(cpc)}; CPA = $${money(cpa)}.`,
        ],
      };
    },
  },

  // 608. SaaS MRR, ARR & Net Retention Calculator
  {
    slug: 'saas-mrr-arr-churn-calculator',
    title: 'SaaS MRR, ARR, NRR & Monthly Churn Calculator',
    category: 'business-tax',
    formulaDisplay: 'ARR = MRR × 12   |   NRR = (Start + Expansion − Churn) / Start',
    inputs: [
      { id: 'startingMrr', label: 'Starting Monthly Recurring Revenue (MRR)', type: 'number', prefix: '$', defaultValue: 120000, min: 1, max: 1e12, step: 1000 },
      { id: 'newMrr', label: 'New Logo MRR Added', type: 'number', prefix: '$', defaultValue: 14000, min: 0, max: 1e11, step: 500 },
      { id: 'expansionMrr', label: 'Expansion / Upsell MRR', type: 'number', prefix: '$', defaultValue: 5500, min: 0, max: 1e11, step: 500 },
      { id: 'churnedMrr', label: 'Churned + Contraction MRR', type: 'number', prefix: '$', defaultValue: 3200, min: 0, max: 1e12, step: 250 },
    ],
    calculate: (v) => {
      const start = parseNum(v.startingMrr);
      const add = parseNum(v.newMrr);
      const exp = parseNum(v.expansionMrr);
      const churn = parseNum(v.churnedMrr);
      if ([start, add, exp, churn].some(Number.isNaN)) return calcError('Enter valid SaaS MRR inputs.');
      if (start <= 0 || add < 0 || exp < 0 || churn < 0) return calcError('Starting MRR must be positive.');
      const netNewMrr = add + exp - churn;
      const endMrr = Math.max(0, start + netNewMrr);
      const endArr = endMrr * 12;
      const grossChurnPct = (churn / start) * 100;
      const monthlyNrrPct = ((start + exp - churn) / start) * 100;
      const annualNrrPct = Math.pow(monthlyNrrPct / 100, 12) * 100;
      return {
        primaryValue: fmt(endArr, 2),
        primaryUnit: '$ ARR',
        primaryLabel: 'Ending Annual Recurring Revenue (ARR)',
        secondaryOutputs: [
          { label: 'Ending MRR', value: `$${money(endMrr)}` },
          { label: 'Net New MRR', value: `${netNewMrr >= 0 ? '+' : ''}$${money(netNewMrr)}` },
          { label: 'Gross Monthly Revenue Churn', value: `${fmt(grossChurnPct, 2)}%` },
          { label: 'Annualized Net Dollar Retention (NRR)', value: `${fmt(annualNrrPct, 1)}%` },
        ],
        steps: [
          `Ending MRR = $${money(start)} + $${money(add)} + $${money(exp)} − $${money(churn)} = $${money(endMrr)}.`,
          `ARR = $${money(endArr)}; Monthly Net Retention = ${fmt(monthlyNrrPct, 2)}% (~${fmt(annualNrrPct, 1)}% annualized).`,
        ],
      };
    },
  },

  // 609. SaaS Rule of 40 & Magic Number Calculator
  {
    slug: 'saas-rule-of-40-calculator',
    title: 'SaaS Rule of 40 & Magic Number Calculator',
    category: 'business-tax',
    formulaDisplay: 'Rule of 40 = YoY ARR Growth % + FCF / EBITDA Margin %',
    inputs: [
      { id: 'priorQuarterArr', label: 'Prior Year ARR', type: 'number', prefix: '$', defaultValue: 8000000, min: 1, max: 1e14, step: 100000 },
      { id: 'currentArr', label: 'Current ARR', type: 'number', prefix: '$', defaultValue: 11200000, min: 0, max: 1e14, step: 100000 },
      { id: 'fcfMarginPct', label: 'Free Cash Flow (or EBITDA) Margin %', type: 'number', unit: '%', defaultValue: 6.0, min: -200, max: 100, step: 0.5 },
      { id: 'priorQuarterSmSpend', label: 'Annualized Sales & Marketing Spend (for Magic #)', type: 'number', prefix: '$', defaultValue: 3200000, min: 1, max: 1e13, step: 50000 },
    ],
    calculate: (v) => {
      const pArr = parseNum(v.priorQuarterArr);
      const cArr = parseNum(v.currentArr);
      const margin = parseNum(v.fcfMarginPct);
      const sm = parseNum(v.priorQuarterSmSpend);
      if ([pArr, cArr, margin, sm].some(Number.isNaN)) return calcError('Enter valid SaaS growth & margin metrics.');
      if (pArr <= 0 || cArr < 0 || sm <= 0) return calcError('ARR and S&M spend must be positive.');
      const growthPct = ((cArr - pArr) / pArr) * 100;
      const rule40 = growthPct + margin;
      const magicNumber = (cArr - pArr) / sm;
      return {
        primaryValue: fmt(rule40, 1),
        primaryUnit: '%',
        primaryLabel: rule40 >= 40 ? 'Rule of 40 Score (Passes ≥40%)' : 'Rule of 40 Score (<40%)',
        secondaryOutputs: [
          { label: 'YoY ARR Growth Rate', value: `${fmt(growthPct, 1)}%` },
          { label: 'SaaS Magic Number', value: `${fmt(magicNumber, 2)}×` },
          { label: 'S&M Efficiency Rating', value: magicNumber >= 1.0 ? 'High Efficiency (≥1.0)' : magicNumber >= 0.75 ? 'Healthy (0.75–1.0)' : 'Needs Payback Optimization' },
        ],
        steps: [
          `YoY ARR Growth = ${fmt(growthPct, 1)}% + ${fmt(margin, 1)}% Margin = ${fmt(rule40, 1)}% Rule of 40.`,
          `Magic Number = Net New ARR ($${money(cArr - pArr)}) ÷ S&M ($${money(sm)}) = ${fmt(magicNumber, 2)}×.`,
        ],
      };
    },
  },

  // 610. Startup Burn Rate & Runway Calculator
  {
    slug: 'startup-burn-rate-runway-calculator',
    title: 'Startup Burn Rate & Cash Runway Calculator',
    category: 'business-tax',
    formulaDisplay: 'Net Burn = Monthly OpEx − Monthly Gross Profit   |   Runway = Cash / Net Burn',
    inputs: [
      { id: 'cashBalance', label: 'Cash in Bank', type: 'number', prefix: '$', defaultValue: 1800000, min: 0, max: 1e14, step: 25000 },
      { id: 'monthlyRevenue', label: 'Monthly Collected Revenue', type: 'number', prefix: '$', defaultValue: 65000, min: 0, max: 1e12, step: 2500 },
      { id: 'monthlyExpenses', label: 'Total Monthly Operating Burn (Gross)', type: 'number', prefix: '$', defaultValue: 185000, min: 1, max: 1e12, step: 2500 },
    ],
    calculate: (v) => {
      const cash = parseNum(v.cashBalance);
      const rev = parseNum(v.monthlyRevenue);
      const exp = parseNum(v.monthlyExpenses);
      if ([cash, rev, exp].some(Number.isNaN)) return calcError('Enter valid startup cash and burn inputs.');
      if (cash < 0 || rev < 0 || exp <= 0) return calcError('Cash and revenue must be non-negative and expenses positive.');
      const netBurn = exp - rev;
      const runwayMonths = netBurn > 0 ? cash / netBurn : 999;
      const defaultAlive = netBurn <= 0;
      return {
        primaryValue: defaultAlive ? 999 : fmt(runwayMonths, 1),
        primaryUnit: defaultAlive ? 'Cash-Flow Positive' : 'months',
        primaryLabel: defaultAlive ? 'Default Alive (Self-Sustaining)' : 'Remaining Cash Runway',
        secondaryOutputs: [
          { label: 'Monthly Net Burn', value: netBurn > 0 ? `$${money(netBurn)}/mo` : `+$${money(-netBurn)}/mo surplus` },
          { label: 'Gross Burn Rate', value: `$${money(exp)}/mo` },
          { label: 'Burn Multiple / Runway Status', value: defaultAlive ? 'Infinite Runway' : runwayMonths >= 18 ? 'Strong (≥18 mo)' : 'Raise / Cut Window (<18 mo)' },
        ],
        steps: [
          `Monthly Net Burn = $${money(exp)} − $${money(rev)} = $${money(netBurn)}/mo.`,
          defaultAlive ? 'Revenue exceeds gross expenses (Cash-Flow Positive).' : `Runway = $${money(cash)} ÷ $${money(netBurn)} = ${fmt(runwayMonths, 1)} months.`,
        ],
      };
    },
  },

  // 611. Startup Equity Dilution Calculator
  {
    slug: 'startup-equity-dilution-calculator',
    title: 'Startup Funding Round Valuation & Equity Dilution Calculator',
    category: 'business-tax',
    formulaDisplay: 'Post-Money = Pre-Money + New Cash   |   Investor % = New Cash / Post-Money',
    inputs: [
      { id: 'preMoneyValuation', label: 'Pre-Money Valuation', type: 'number', prefix: '$', defaultValue: 12000000, min: 1000, max: 1e14, step: 250000 },
      { id: 'newInvestment', label: 'New Equity Cash Raised', type: 'number', prefix: '$', defaultValue: 3000000, min: 1, max: 1e13, step: 100000 },
      { id: 'currentOwnershipPct', label: 'Your Pre-Round Ownership %', type: 'number', unit: '%', defaultValue: 40, min: 0.01, max: 100, step: 1 },
      { id: 'optionPoolTopUpPct', label: 'New Post-Money Option Pool Expansion', type: 'number', unit: '%', defaultValue: 5, min: 0, max: 35, step: 1 },
    ],
    calculate: (v) => {
      const pre = parseNum(v.preMoneyValuation);
      const raise = parseNum(v.newInvestment);
      const curPct = parseNum(v.currentOwnershipPct);
      const poolPct = parseNum(v.optionPoolTopUpPct ?? 0);
      if ([pre, raise, curPct, poolPct].some(Number.isNaN)) return calcError('Enter valid fundraising terms.');
      if (pre <= 0 || raise <= 0 || curPct <= 0 || curPct > 100 || poolPct < 0 || poolPct >= 50) return calcError('Valuation and cash raised must be positive.');
      const post = pre + raise;
      const investorPct = (raise / post) * 100;
      const remainingFounderFactor = Math.max(0, 1 - raise / post - poolPct / 100);
      const postOwnership = curPct * remainingFounderFactor;
      const dilutionPct = ((curPct - postOwnership) / curPct) * 100;
      const stakeValue = post * (postOwnership / 100);
      return {
        primaryValue: fmt(postOwnership, 2),
        primaryUnit: '%',
        primaryLabel: 'Post-Round Ownership Stake',
        secondaryOutputs: [
          { label: 'Post-Money Valuation', value: `$${money(post)}` },
          { label: 'New Investor Equity %', value: `${fmt(investorPct, 2)}%` },
          { label: 'Relative Stake Dilution', value: `${fmt(dilutionPct, 2)}%` },
          { label: 'Implied Value of Your Stake', value: `$${money(stakeValue)}` },
        ],
        steps: [
          `Post-money = $${money(pre)} + $${money(raise)} = $${money(post)}; Investor receives ${fmt(investorPct, 2)}%.`,
          `Existing holders keep ${fmt(remainingFounderFactor * 100, 2)}% of prior equity → ${fmt(postOwnership, 2)}% ($${money(stakeValue)}).`,
        ],
      };
    },
  },

  // 612. Contribution Margin & Unit Economics Calculator
  {
    slug: 'contribution-margin-unit-economics-calculator',
    title: 'Contribution Margin & Unit Economics Calculator',
    category: 'business-tax',
    formulaDisplay: 'CM = Price − Variable Cost   |   CM Ratio = CM / Price',
    inputs: [
      { id: 'sellingPrice', label: 'Unit Selling Price', type: 'number', prefix: '$', defaultValue: 95, min: 0.01, max: 1e9, step: 1 },
      { id: 'variableCogs', label: 'Variable Product / COGS / Unit', type: 'number', prefix: '$', defaultValue: 32, min: 0, max: 1e9, step: 1 },
      { id: 'variableShippingFee', label: 'Shipping, Payment & Fulfillment / Unit', type: 'number', prefix: '$', defaultValue: 11, min: 0, max: 1e9, step: 0.5 },
      { id: 'unitsSold', label: 'Monthly Units Sold', type: 'number', defaultValue: 1200, min: 0, max: 1e10, step: 50 },
    ],
    calculate: (v) => {
      const px = parseNum(v.sellingPrice);
      const vc1 = parseNum(v.variableCogs);
      const vc2 = parseNum(v.variableShippingFee);
      const units = parseNum(v.unitsSold ?? 1);
      if ([px, vc1, vc2, units].some(Number.isNaN)) return calcError('Enter valid unit pricing and costs.');
      if (px <= 0 || vc1 < 0 || vc2 < 0 || units < 0) return calcError('Selling price must be positive.');
      const totalVar = vc1 + vc2;
      const cmPerUnit = px - totalVar;
      const cmRatio = (cmPerUnit / px) * 100;
      const totalCm = cmPerUnit * units;
      return {
        primaryValue: fmt(cmRatio, 2),
        primaryUnit: '%',
        primaryLabel: 'Contribution Margin Ratio',
        secondaryOutputs: [
          { label: 'Unit Contribution Margin', value: `$${money(cmPerUnit)} / unit` },
          { label: 'Total Variable Cost / Unit', value: `$${money(totalVar)}` },
          { label: 'Total Monthly Contribution', value: `$${money(totalCm)}` },
        ],
        steps: [
          `Variable cost/unit = $${money(vc1)} + $${money(vc2)} = $${money(totalVar)}.`,
          `Unit CM = $${money(px)} − $${money(totalVar)} = $${money(cmPerUnit)} (${fmt(cmRatio, 2)}%).`,
        ],
      };
    },
  },

  // 613. Degree of Operating Leverage (DOL) Calculator
  {
    slug: 'operating-leverage-dol-calculator',
    title: 'Degree of Operating Leverage (DOL) Calculator',
    category: 'business-tax',
    formulaDisplay: 'DOL = Contribution Margin / Operating Income (EBIT)',
    inputs: [
      { id: 'contributionMargin', label: 'Total Contribution Margin (Rev − Variable Costs)', type: 'number', prefix: '$', defaultValue: 1200000, min: 1, max: 1e14, step: 25000 },
      { id: 'fixedCosts', label: 'Total Fixed Operating Costs', type: 'number', prefix: '$', defaultValue: 800000, min: 0, max: 1e14, step: 10000 },
      { id: 'salesChangePct', label: 'Projected Revenue Change %', type: 'number', unit: '%', defaultValue: 15, min: -99, max: 500, step: 1 },
    ],
    calculate: (v) => {
      const cm = parseNum(v.contributionMargin);
      const fc = parseNum(v.fixedCosts);
      const dSales = parseNum(v.salesChangePct);
      if ([cm, fc, dSales].some(Number.isNaN)) return calcError('Enter valid operating cost figures.');
      if (cm <= 0 || fc < 0) return calcError('Contribution margin must be positive.');
      const ebit = cm - fc;
      if (ebit === 0) return calcError('EBIT cannot be zero when computing Degree of Operating Leverage.');
      const dol = cm / ebit;
      const ebitChangePct = dol * dSales;
      const newEbit = ebit * (1 + ebitChangePct / 100);
      return {
        primaryValue: fmt(dol, 2),
        primaryUnit: '×',
        primaryLabel: 'Degree of Operating Leverage (DOL)',
        secondaryOutputs: [
          { label: 'Baseline Operating Income (EBIT)', value: `$${money(ebit)}` },
          { label: `EBIT Impact of ${dSales >= 0 ? '+' : ''}${dSales}% Sales`, value: `${ebitChangePct >= 0 ? '+' : ''}${fmt(ebitChangePct, 1)}%` },
          { label: 'Projected New EBIT', value: `$${money(newEbit)}` },
        ],
        steps: [
          `EBIT = $${money(cm)} − $${money(fc)} = $${money(ebit)}.`,
          `DOL = $${money(cm)} ÷ $${money(ebit)} = ${fmt(dol, 2)}× → a ${dSales}% sales change moves EBIT by ${fmt(ebitChangePct, 1)}%.`,
        ],
      };
    },
  },

  // 614. DuPont ROE Analysis Calculator
  {
    slug: 'dupont-roe-analysis-calculator',
    title: '3-Step DuPont ROE & ROA Decomposition Calculator',
    category: 'business-tax',
    formulaDisplay: 'ROE = Net Profit Margin × Asset Turnover × Equity Multiplier',
    inputs: [
      { id: 'netIncome', label: 'Annual Net Income', type: 'number', prefix: '$', defaultValue: 450000, min: -1e13, max: 1e14, step: 10000 },
      { id: 'revenue', label: 'Annual Revenue', type: 'number', prefix: '$', defaultValue: 4500000, min: 1, max: 1e14, step: 50000 },
      { id: 'totalAssets', label: 'Average Total Assets', type: 'number', prefix: '$', defaultValue: 3000000, min: 1, max: 1e14, step: 50000 },
      { id: 'shareholdersEquity', label: 'Average Shareholders’ Equity', type: 'number', prefix: '$', defaultValue: 1800000, min: 1, max: 1e14, step: 50000 },
    ],
    calculate: (v) => {
      const ni = parseNum(v.netIncome);
      const rev = parseNum(v.revenue);
      const assets = parseNum(v.totalAssets);
      const eq = parseNum(v.shareholdersEquity);
      if ([ni, rev, assets, eq].some(Number.isNaN)) return calcError('Enter valid financial figures.');
      if (rev <= 0 || assets <= 0 || eq <= 0) return calcError('Revenue, assets, and equity must be positive.');
      const npm = ni / rev;
      const ato = rev / assets;
      const em = assets / eq;
      const roe = npm * ato * em * 100;
      const roa = npm * ato * 100;
      return {
        primaryValue: fmt(roe, 2),
        primaryUnit: '% ROE',
        primaryLabel: 'DuPont Return on Equity (ROE)',
        secondaryOutputs: [
          { label: 'Net Profit Margin', value: `${fmt(npm * 100, 2)}%` },
          { label: 'Asset Turnover', value: `${fmt(ato, 2)}×` },
          { label: 'Equity Multiplier (Leverage)', value: `${fmt(em, 2)}×` },
          { label: 'Return on Assets (ROA)', value: `${fmt(roa, 2)}%` },
        ],
        steps: [
          `Margin = ${fmt(npm * 100, 2)}% × Asset Turnover = ${fmt(ato, 2)}× → ROA = ${fmt(roa, 2)}%.`,
          `ROE = ${fmt(roa, 2)}% × ${fmt(em, 2)}× Equity Multiplier = ${fmt(roe, 2)}%.`,
        ],
      };
    },
  },

  // 615. Altman Z-Score Bankruptcy Risk Calculator
  {
    slug: 'altman-z-score-bankruptcy-calculator',
    title: 'Altman Z-Score Corporate Financial Distress Calculator',
    category: 'business-tax',
    formulaDisplay: 'Z = 1.2X₁ + 1.4X₂ + 3.3X₃ + 0.6X₄ + 1.0X₅',
    inputs: [
      { id: 'workingCapital', label: 'Working Capital', type: 'number', prefix: '$', defaultValue: 600000, min: -1e13, max: 1e14, step: 25000 },
      { id: 'retainedEarnings', label: 'Retained Earnings', type: 'number', prefix: '$', defaultValue: 900000, min: -1e13, max: 1e14, step: 25000 },
      { id: 'ebit', label: 'Operating Income (EBIT)', type: 'number', prefix: '$', defaultValue: 450000, min: -1e13, max: 1e14, step: 25000 },
      { id: 'marketValueEquity', label: 'Market Value of Equity', type: 'number', prefix: '$', defaultValue: 3200000, min: 0, max: 1e14, step: 50000 },
      { id: 'revenue', label: 'Annual Sales Revenue', type: 'number', prefix: '$', defaultValue: 4800000, min: 0, max: 1e14, step: 50000 },
      { id: 'totalAssets', label: 'Total Assets', type: 'number', prefix: '$', defaultValue: 3000000, min: 1, max: 1e14, step: 50000 },
      { id: 'totalLiabilities', label: 'Total Liabilities', type: 'number', prefix: '$', defaultValue: 1400000, min: 1, max: 1e14, step: 50000 },
    ],
    calculate: (v) => {
      const wc = parseNum(v.workingCapital);
      const re = parseNum(v.retainedEarnings);
      const ebit = parseNum(v.ebit);
      const mve = parseNum(v.marketValueEquity);
      const sales = parseNum(v.revenue);
      const ta = parseNum(v.totalAssets);
      const tl = parseNum(v.totalLiabilities);
      if ([wc, re, ebit, mve, sales, ta, tl].some(Number.isNaN)) return calcError('Enter valid balance sheet metrics.');
      if (ta <= 0 || tl <= 0 || mve < 0 || sales < 0) return calcError('Total assets and liabilities must be positive.');
      const x1 = wc / ta;
      const x2 = re / ta;
      const x3 = ebit / ta;
      const x4 = mve / tl;
      const x5 = sales / ta;
      const z = 1.2 * x1 + 1.4 * x2 + 3.3 * x3 + 0.6 * x4 + 1.0 * x5;
      const zone = z > 2.99 ? 'Safe Zone (> 2.99)' : z >= 1.81 ? 'Grey Caution Zone (1.81–2.99)' : 'Distress Zone (< 1.81)';
      return {
        primaryValue: fmt(z, 2),
        primaryUnit: 'Z-Score',
        primaryLabel: zone,
        secondaryOutputs: [
          { label: 'Liquidity Weight (1.2×WC/TA)', value: fmt(1.2 * x1, 3) },
          { label: 'Profitability Weight (3.3×EBIT/TA)', value: fmt(3.3 * x3, 3) },
          { label: 'Solvency Weight (0.6×MVE/TL)', value: fmt(0.6 * x4, 3) },
        ],
        steps: [
          `X1=${fmt(x1, 3)}, X2=${fmt(x2, 3)}, X3=${fmt(x3, 3)}, X4=${fmt(x4, 3)}, X5=${fmt(x5, 3)}.`,
          `Z = 1.2(X1)+1.4(X2)+3.3(X3)+0.6(X4)+1.0(X5) = ${fmt(z, 2)} → ${zone}.`,
        ],
      };
    },
  },

  // 616. P/E & PEG Stock Valuation Calculator
  {
    slug: 'pe-peg-valuation-ratio-calculator',
    title: 'P/E, Earnings Yield & PEG Stock Valuation Calculator',
    category: 'business-tax',
    formulaDisplay: 'P/E = Price / EPS   |   PEG = (P/E) / EPS Growth %',
    inputs: [
      { id: 'sharePrice', label: 'Stock Share Price', type: 'number', prefix: '$', defaultValue: 180, min: 0.01, max: 1e9, step: 1 },
      { id: 'eps', label: 'Trailing or Forward EPS', type: 'number', prefix: '$', defaultValue: 7.2, min: 0.01, max: 1e6, step: 0.1 },
      { id: 'epsGrowthPct', label: 'Expected 5-Yr Annual EPS Growth', type: 'number', unit: '%', defaultValue: 18, min: 0.1, max: 200, step: 0.5 },
      { id: 'dividendYieldPct', label: 'Annual Dividend Yield (for PEGY)', type: 'number', unit: '%', defaultValue: 1.5, min: 0, max: 25, step: 0.25 },
    ],
    calculate: (v) => {
      const px = parseNum(v.sharePrice);
      const eps = parseNum(v.eps);
      const g = parseNum(v.epsGrowthPct);
      const div = parseNum(v.dividendYieldPct ?? 0);
      if ([px, eps, g, div].some(Number.isNaN)) return calcError('Enter valid P/E and EPS growth numbers.');
      if (px <= 0 || eps <= 0 || g <= 0 || div < 0) return calcError('Share price, EPS, and growth must be positive.');
      const pe = px / eps;
      const peg = pe / g;
      const pegy = pe / (g + div);
      const earningsYield = (eps / px) * 100;
      return {
        primaryValue: fmt(peg, 2),
        primaryUnit: 'PEG Ratio',
        primaryLabel: peg < 1 ? 'Growth-Adjusted Undervalued (<1.0)' : peg <= 1.5 ? 'Fairly Valued (1.0–1.5)' : 'Premium Growth Valuation (>1.5)',
        secondaryOutputs: [
          { label: 'Price-to-Earnings (P/E)', value: `${fmt(pe, 2)}×` },
          { label: 'Earnings Yield (E/P)', value: `${fmt(earningsYield, 2)}%` },
          { label: 'Dividend-Adjusted PEGY', value: fmt(pegy, 2) },
        ],
        steps: [
          `P/E = $${money(px)} ÷ $${money(eps)} = ${fmt(pe, 2)}× (Earnings yield = ${fmt(earningsYield, 2)}%).`,
          `PEG = ${fmt(pe, 2)} ÷ ${g}% = ${fmt(peg, 2)} (PEGY = ${fmt(pegy, 2)}).`,
        ],
      };
    },
  },

  // 617. Price Elasticity of Demand Calculator
  {
    slug: 'price-elasticity-demand-calculator',
    title: 'Price Elasticity of Demand (Midpoint Arc) Calculator',
    category: 'business-tax',
    formulaDisplay: 'PED = [(Q₂ − Q₁)/((Q₁+Q₂)/2)] ÷ [(P₂ − P₁)/((P₁+P₂)/2)]',
    inputs: [
      { id: 'price1', label: 'Initial Price (P₁)', type: 'number', prefix: '$', defaultValue: 50, min: 0.01, max: 1e9, step: 1 },
      { id: 'qty1', label: 'Initial Quantity Demanded (Q₁)', type: 'number', defaultValue: 1000, min: 1, max: 1e11, step: 25 },
      { id: 'price2', label: 'New Price (P₂)', type: 'number', prefix: '$', defaultValue: 60, min: 0.01, max: 1e9, step: 1 },
      { id: 'qty2', label: 'New Quantity Demanded (Q₂)', type: 'number', defaultValue: 820, min: 0, max: 1e11, step: 25 },
    ],
    calculate: (v) => {
      const p1 = parseNum(v.price1);
      const q1 = parseNum(v.qty1);
      const p2 = parseNum(v.price2);
      const q2 = parseNum(v.qty2);
      if ([p1, q1, p2, q2].some(Number.isNaN)) return calcError('Enter valid price and quantity pairs.');
      if (p1 <= 0 || p2 <= 0 || q1 <= 0 || q2 < 0 || p1 === p2) return calcError('Prices must differ and remain positive.');
      const pctQ = (q2 - q1) / ((q1 + q2) / 2);
      const pctP = (p2 - p1) / ((p1 + p2) / 2);
      const ped = pctQ / pctP;
      const rev1 = p1 * q1;
      const rev2 = p2 * q2;
      const absPed = Math.abs(ped);
      const regime = absPed > 1 ? 'Elastic (|PED| > 1)' : absPed === 1 ? 'Unit Elastic (|PED| = 1)' : 'Inelastic (|PED| < 1)';
      return {
        primaryValue: fmt(ped, 3),
        primaryUnit: 'PED',
        primaryLabel: `Arc Elasticity — ${regime}`,
        secondaryOutputs: [
          { label: 'Initial Total Revenue', value: `$${money(rev1)}` },
          { label: 'New Total Revenue', value: `$${money(rev2)}` },
          { label: 'Net Revenue Change', value: `${rev2 >= rev1 ? '+' : ''}$${money(rev2 - rev1)} (${fmt(((rev2 - rev1) / rev1) * 100, 1)}%)` },
        ],
        steps: [
          `Arc %ΔQ = ${fmt(pctQ * 100, 2)}%; Arc %ΔP = ${fmt(pctP * 100, 2)}%.`,
          `PED = ${fmt(ped, 3)} (${regime}). Revenue moves from $${money(rev1)} to $${money(rev2)}.`,
        ],
      };
    },
  },

  // 618. Stripe / PayPal Merchant Processing Fee Calculator
  {
    slug: 'paypal-stripe-merchant-fee-calculator',
    title: 'Stripe & PayPal Payment Processing Fee Calculator',
    category: 'business-tax',
    formulaDisplay: 'Fee = Amount × Rate% + Fixed   |   Gross-Up Ask = (Target + Fixed) / (1 − Rate%)',
    inputs: [
      { id: 'amount', label: 'Invoice / Target Payout Amount', type: 'number', prefix: '$', defaultValue: 1000, min: 1, max: 1e10, step: 10 },
      { id: 'ratePct', label: 'Processor Percentage Fee', type: 'number', unit: '%', defaultValue: 2.9, min: 0, max: 20, step: 0.1 },
      { id: 'fixedFee', label: 'Fixed Per-Transaction Fee', type: 'number', prefix: '$', defaultValue: 0.3, min: 0, max: 100, step: 0.05 },
      {
        id: 'mode',
        label: 'Calculation Direction',
        type: 'select',
        defaultValue: 'deduct',
        options: [
          { label: 'Net Payout After Fee Deducted', value: 'deduct' },
          { label: 'Gross-Up Invoice to Receive Exact Net', value: 'grossup' },
        ],
      },
    ],
    calculate: (v) => {
      const amt = parseNum(v.amount);
      const r = parseNum(v.ratePct) / 100;
      const fix = parseNum(v.fixedFee);
      const mode = String(v.mode || 'deduct');
      if ([amt, r, fix].some(Number.isNaN)) return calcError('Enter valid merchant fee values.');
      if (amt <= 0 || r < 0 || r >= 0.5 || fix < 0) return calcError('Amount must be positive and fee rate <50%.');
      if (mode === 'grossup') {
        const invoiceGross = (amt + fix) / (1 - r);
        const fee = invoiceGross - amt;
        return {
          primaryValue: fmt(invoiceGross, 2),
          primaryUnit: '$',
          primaryLabel: `Gross Invoice to Net $${money(amt)}`,
          secondaryOutputs: [
            { label: 'Processing Fee Charged', value: `$${money(fee)}` },
            { label: 'Effective Fee %', value: `${fmt((fee / invoiceGross) * 100, 2)}%` },
          ],
          steps: [
            `Gross = ($${money(amt)} + $${money(fix)}) ÷ (1 − ${fmt(r * 100, 2)}%) = $${money(invoiceGross)}.`,
            `Processor retains $${money(fee)}, leaving you exact $${money(amt)}.`,
          ],
        };
      }
      const fee = amt * r + fix;
      const net = amt - fee;
      return {
        primaryValue: fmt(net, 2),
        primaryUnit: '$',
        primaryLabel: 'Net Payout Received',
        secondaryOutputs: [
          { label: 'Total Processing Fee', value: `$${money(fee)}` },
          { label: 'Effective Fee %', value: `${fmt((fee / amt) * 100, 2)}%` },
        ],
        steps: [
          `Fee = $${money(amt)} × ${fmt(r * 100, 2)}% + $${money(fix)} = $${money(fee)}.`,
          `Net deposit = $${money(net)}.`,
        ],
      };
    },
  },

  // 619. Amazon FBA & E-Commerce Unit Profit Calculator
  {
    slug: 'amazon-fba-profit-fee-calculator',
    title: 'Amazon FBA & E-Commerce Net Profit Calculator',
    category: 'business-tax',
    formulaDisplay: 'Net Profit = Sale Price − Landed COGS − Referral% − Fulfillment − Ad/Return Cost',
    inputs: [
      { id: 'salePrice', label: 'Product Retail Price', type: 'number', prefix: '$', defaultValue: 39.99, min: 0.5, max: 1e6, step: 1 },
      { id: 'landedCogs', label: 'Landed Manufacturing + Freight Cost', type: 'number', prefix: '$', defaultValue: 9.5, min: 0, max: 1e6, step: 0.5 },
      { id: 'referralPct', label: 'Marketplace Referral Fee %', type: 'number', unit: '%', defaultValue: 15, min: 0, max: 50, step: 0.5 },
      { id: 'fbaFee', label: 'Pick, Pack & Shipping Fulfillment Fee', type: 'number', prefix: '$', defaultValue: 5.4, min: 0, max: 1000, step: 0.25 },
      { id: 'adCostPerUnit', label: 'PPC Ad Spend + Storage / Unit', type: 'number', prefix: '$', defaultValue: 4.5, min: 0, max: 10000, step: 0.25 },
    ],
    calculate: (v) => {
      const px = parseNum(v.salePrice);
      const cogs = parseNum(v.landedCogs);
      const refPct = parseNum(v.referralPct) / 100;
      const fba = parseNum(v.fbaFee);
      const ads = parseNum(v.adCostPerUnit);
      if ([px, cogs, refPct, fba, ads].some(Number.isNaN)) return calcError('Enter valid e-commerce unit costs.');
      if (px <= 0 || cogs < 0 || refPct < 0 || fba < 0 || ads < 0) return calcError('Price must be positive and costs non-negative.');
      const refFee = px * refPct;
      const totalFeesAndCosts = cogs + refFee + fba + ads;
      const netProfit = px - totalFeesAndCosts;
      const marginPct = (netProfit / px) * 100;
      const roiPct = cogs > 0 ? (netProfit / cogs) * 100 : 0;
      return {
        primaryValue: fmt(netProfit, 2),
        primaryUnit: '$ / unit',
        primaryLabel: 'Net Unit Profit After All Fees',
        secondaryOutputs: [
          { label: 'Net Profit Margin', value: `${fmt(marginPct, 2)}%` },
          { label: 'ROI on Landed Inventory Cost', value: cogs > 0 ? `${fmt(roiPct, 1)}%` : 'N/A' },
          { label: 'Marketplace Referral + FBA Fee', value: `$${money(refFee + fba)}` },
        ],
        steps: [
          `Referral fee = $${money(refFee)} + Fulfillment = $${money(fba)} + COGS = $${money(cogs)} + Ads = $${money(ads)}.`,
          `Net profit = $${money(netProfit)}/unit (${fmt(marginPct, 2)}% net margin).`,
        ],
      };
    },
  },

  // 620. Wholesale to Retail Keystone Pricing Calculator
  {
    slug: 'wholesale-retail-keystone-pricing-calculator',
    title: 'Wholesale, Distributor & Retail Keystone Pricing Calculator',
    category: 'business-tax',
    formulaDisplay: 'Price = Cost / (1 − Target Margin%)',
    inputs: [
      { id: 'unitCost', label: 'Unit Manufacturing / Landed Cost', type: 'number', prefix: '$', defaultValue: 18.0, min: 0.01, max: 1e8, step: 0.5 },
      { id: 'wholesaleMarginPct', label: 'Your Wholesale Gross Margin', type: 'number', unit: '%', defaultValue: 40, min: 1, max: 95, step: 1 },
      { id: 'retailMarginPct', label: 'Retailer Margin (Keystone = 50%)', type: 'number', unit: '%', defaultValue: 50, min: 1, max: 95, step: 1 },
    ],
    calculate: (v) => {
      const cost = parseNum(v.unitCost);
      const wm = parseNum(v.wholesaleMarginPct) / 100;
      const rm = parseNum(v.retailMarginPct) / 100;
      if ([cost, wm, rm].some(Number.isNaN)) return calcError('Enter valid pricing margins.');
      if (cost <= 0 || wm <= 0 || wm >= 0.99 || rm <= 0 || rm >= 0.99) return calcError('Margins must be between 1% and 98%.');
      const wholesalePrice = cost / (1 - wm);
      const msrp = wholesalePrice / (1 - rm);
      return {
        primaryValue: fmt(msrp, 2),
        primaryUnit: '$ MSRP',
        primaryLabel: 'Suggested Retail Price (MSRP)',
        secondaryOutputs: [
          { label: 'Wholesale Trade Price', value: `$${money(wholesalePrice)}` },
          { label: 'Your Wholesale Profit / Unit', value: `$${money(wholesalePrice - cost)}` },
          { label: 'Retailer Profit / Unit', value: `$${money(msrp - wholesalePrice)}` },
          { label: 'Total Cost-to-MSRP Multiplier', value: `${fmt(msrp / cost, 2)}×` },
        ],
        steps: [
          `Wholesale Price = $${money(cost)} ÷ (1 − ${fmt(wm * 100, 0)}%) = $${money(wholesalePrice)}.`,
          `Retail MSRP = $${money(wholesalePrice)} ÷ (1 − ${fmt(rm * 100, 0)}%) = $${money(msrp)}.`,
        ],
      };
    },
  },

  // 621. GST / HST Multi-Country Calculator (CA, AU, NZ, SG)
  {
    slug: 'gst-hst-canada-australia-nz-calculator',
    title: 'GST / HST Tax Calculator (Canada, Australia, NZ & Singapore)',
    category: 'business-tax',
    formulaDisplay: 'Add Tax: Total = Net × (1+r)   |   Extract Tax: Net = Gross / (1+r)',
    inputs: [
      {
        id: 'jurisdiction',
        label: 'Country / Tax Rate Preset (2026)',
        type: 'select',
        defaultValue: '13',
        options: [
          { label: 'Canada — Ontario HST (13%)', value: '13' },
          { label: 'Canada — Federal GST Only (5%)', value: '5' },
          { label: 'Canada — Atlantic HST (15%)', value: '15' },
          { label: 'Canada — BC GST+PST Combined (12%)', value: '12' },
          { label: 'Canada — Quebec GST+QST (14.975%)', value: '14.975' },
          { label: 'Australia — GST (10%)', value: '10' },
          { label: 'New Zealand — GST (15%)', value: '15.0' },
          { label: 'Singapore — GST (9%)', value: '9' },
        ],
      },
      {
        id: 'mode',
        label: 'Tax Mode',
        type: 'select',
        defaultValue: 'add',
        options: [
          { label: 'Add GST/HST to Net Price', value: 'add' },
          { label: 'Extract GST/HST from Tax-Inclusive Gross', value: 'extract' },
        ],
      },
      { id: 'amount', label: 'Invoice Amount', type: 'number', prefix: '$', defaultValue: 1000, min: 0, max: 1e12, step: 10 },
    ],
    calculate: (v) => {
      const ratePct = parseNum(v.jurisdiction);
      const mode = String(v.mode || 'add');
      const amt = parseNum(v.amount);
      if (Number.isNaN(ratePct) || Number.isNaN(amt) || amt < 0 || ratePct < 0) return calcError('Enter valid non-negative amount.');
      const r = ratePct / 100;
      const net = mode === 'add' ? amt : amt / (1 + r);
      const gross = mode === 'add' ? amt * (1 + r) : amt;
      const tax = gross - net;
      return {
        primaryValue: fmt(mode === 'add' ? gross : net, 2),
        primaryUnit: '$',
        primaryLabel: mode === 'add' ? 'Tax-Inclusive Gross Total' : 'Pre-Tax Net Amount',
        secondaryOutputs: [
          { label: `GST/HST Component (${ratePct}%)`, value: `$${money(tax)}` },
          { label: mode === 'add' ? 'Net Pre-Tax Base' : 'Gross Amount Entered', value: `$${money(mode === 'add' ? net : gross)}` },
        ],
        steps: [
          mode === 'add'
            ? `Tax = $${money(net)} × ${ratePct}% = $${money(tax)} → Gross Total = $${money(gross)}.`
            : `Pre-tax Net = $${money(gross)} ÷ (1 + ${r}) = $${money(net)} (Tax = $${money(tax)}).`,
        ],
      };
    },
  },

  // 622. UK Corporation Tax & Marginal Relief Calculator (2026/27)
  {
    slug: 'uk-corporation-tax-marginal-relief-calculator',
    title: 'UK Corporation Tax & Marginal Relief Calculator (2026/27)',
    category: 'business-tax',
    formulaDisplay: '19% ≤ £50k | Marginal Relief £50k–£250k (3/200) | 25% > £250k',
    inputs: [
      { id: 'taxableProfit', label: 'Augmented / Taxable Company Profit', type: 'number', prefix: '£', defaultValue: 120000, min: 0, max: 1e12, step: 5000 },
      { id: 'associatedCompanies', label: 'Total Associated Companies (Incl. Yours)', type: 'number', defaultValue: 1, min: 1, max: 50, step: 1 },
      { id: 'monthsInPeriod', label: 'Accounting Period Length (Months)', type: 'number', unit: 'mo', defaultValue: 12, min: 1, max: 12, step: 1 },
    ],
    calculate: (v) => {
      const p = parseNum(v.taxableProfit);
      const assoc = Math.max(1, Math.round(parseNum(v.associatedCompanies || 1)));
      const mo = Math.min(12, Math.max(1, parseNum(v.monthsInPeriod || 12)));
      if ([p, assoc, mo].some(Number.isNaN) || p < 0) return calcError('Enter valid UK taxable profit.');
      const lower = (50000 / assoc) * (mo / 12);
      const upper = (250000 / assoc) * (mo / 12);
      let tax = 0;
      let marginalRelief = 0;
      if (p <= lower) {
        tax = p * 0.19;
      } else if (p >= upper) {
        tax = p * 0.25;
      } else {
        marginalRelief = (upper - p) * (3 / 200);
        tax = p * 0.25 - marginalRelief;
      }
      const effRate = p > 0 ? (tax / p) * 100 : 0;
      const marginalBracketRate = p <= lower ? 19 : p >= upper ? 25 : 26.5;
      return {
        primaryValue: fmt(tax, 2),
        primaryUnit: '£',
        primaryLabel: 'UK Corporation Tax Due (2026/27)',
        secondaryOutputs: [
          { label: 'Effective Corporation Tax Rate', value: `${fmt(effRate, 2)}%` },
          { label: 'Marginal Relief Deducted', value: `£${money(marginalRelief)}` },
          { label: 'Post-Tax Retained Profit', value: `£${money(p - tax)}` },
          { label: 'Marginal Tax Rate on Next £1', value: `${marginalBracketRate}%` },
        ],
        steps: [
          `Adjusted HMRC thresholds: Lower £${money(lower)}, Upper £${money(upper)}.`,
          marginalRelief > 0
            ? `25% main tax (£${money(p * 0.25)}) − Marginal Relief (3/200 × (£${money(upper)} − £${money(p)}) = £${money(marginalRelief)}) = £${money(tax)}.`
            : `Flat rate applied → UK Corporation Tax = £${money(tax)} (${fmt(effRate, 2)}% effective).`,
        ],
      };
    },
  },

  // 623. UK Director Salary vs Dividend Tax Calculator (2026/27)
  {
    slug: 'uk-dividend-vs-salary-tax-calculator',
    title: 'UK Director Salary vs Dividend Tax Calculator (2026/27)',
    category: 'business-tax',
    formulaDisplay: '2026/27 UK Dividend Rates: 10.75% Basic / 35.75% Higher / 39.35% Additional (incl. +2% April 2026 increase)',
    inputs: [
      { id: 'companyProfitBeforeSalary', label: 'Pre-Tax Company Profit (Before Salary)', type: 'number', prefix: '£', defaultValue: 90000, min: 0, max: 1e10, step: 2500 },
      { id: 'directorSalary', label: 'Director Gross Annual Salary', type: 'number', prefix: '£', defaultValue: 12570, min: 0, max: 500000, step: 500 },
      { id: 'extractAllAfterTaxProfit', label: 'Extract Remaining After-Tax Profit as Dividends', type: 'select', defaultValue: 'yes', options: [{ label: 'Yes — Full Extraction', value: 'yes' }, { label: 'No — Custom Dividend', value: 'no' }] },
      { id: 'customDividend', label: 'Dividend Taken', type: 'number', prefix: '£', defaultValue: 40000, min: 0, max: 1e9, step: 1000, visibleWhen: (v) => String(v.extractAllAfterTaxProfit || 'yes') === 'no' },
    ],
    calculate: (v) => {
      const prof0 = parseNum(v.companyProfitBeforeSalary);
      const sal = parseNum(v.directorSalary);
      const fullExtract = String(v.extractAllAfterTaxProfit || 'yes') === 'yes';
      if ([prof0, sal].some(Number.isNaN) || prof0 < 0 || sal < 0) return calcError('Enter valid company profit and director salary.');
      // 2026/27 UK Employer NI: 15% above £5,000 Secondary Threshold
      const employerNi = Math.max(0, sal - 5000) * 0.15;
      const taxableProfit = Math.max(0, prof0 - sal - employerNi);
      let corpTax = 0;
      if (taxableProfit <= 50000) corpTax = taxableProfit * 0.19;
      else if (taxableProfit >= 250000) corpTax = taxableProfit * 0.25;
      else corpTax = taxableProfit * 0.25 - (250000 - taxableProfit) * (3 / 200);
      const postTaxProfit = Math.max(0, taxableProfit - corpTax);
      const div = fullExtract ? postTaxProfit : Math.min(postTaxProfit, Math.max(0, parseNum(v.customDividend ?? 0)));

      // Personal tax: Personal Allowance £12,570 (tapers £1 per £2 over £100k)
      const totalPersonal = sal + div;
      const pa = Math.max(0, 12570 - Math.max(0, totalPersonal - 100000) / 2);
      const employeeNi = Math.max(0, Math.min(sal, 50270) - 12570) * 0.08 + Math.max(0, sal - 50270) * 0.02;
      const salTaxable = Math.max(0, sal - pa);
      const basicBandWidth = 37700;
      const salIncomeTax = Math.min(salTaxable, basicBandWidth) * 0.2 + Math.max(0, salTaxable - basicBandWidth) * 0.4;

      const unusedPaForDiv = Math.max(0, pa - sal);
      const taxableDiv = Math.max(0, div - unusedPaForDiv - 500); // £500 UK dividend allowance
      const remBasic = Math.max(0, 50270 - pa - salTaxable);
      const divInBasic = Math.min(taxableDiv, remBasic);
      const remHigher = Math.max(0, 125140 - Math.max(sal + unusedPaForDiv + 500 + divInBasic, pa + basicBandWidth));
      const divInHigher = Math.min(Math.max(0, taxableDiv - divInBasic), remHigher);
      const divInAdd = Math.max(0, taxableDiv - divInBasic - divInHigher);
      // April 2026 UK Budget dividend rate increases: 10.75% basic, 35.75% higher, 39.35% additional
      const divTax = divInBasic * 0.1075 + divInHigher * 0.3575 + divInAdd * 0.3935;

      const totalPersonalTakeHome = sal + div - employeeNi - salIncomeTax - divTax;
      const totalTaxBurden = employerNi + corpTax + employeeNi + salIncomeTax + divTax;
      return {
        primaryValue: fmt(totalPersonalTakeHome, 2),
        primaryUnit: '£',
        primaryLabel: 'Director Net Personal Take-Home (2026/27)',
        secondaryOutputs: [
          { label: 'Employer NI (15% > £5,000)', value: `£${money(employerNi)}` },
          { label: 'Corporation Tax', value: `£${money(corpTax)}` },
          { label: 'Personal Dividend + Income Tax + NI', value: `£${money(employeeNi + salIncomeTax + divTax)}` },
          { label: 'Combined Effective Extraction Rate', value: prof0 > 0 ? `${fmt((totalTaxBurden / prof0) * 100, 1)}%` : '0%' },
        ],
        steps: [
          `Employer NI (15% over £5k) = £${money(employerNi)}; Corp Tax = £${money(corpTax)} → Max dividend = £${money(postTaxProfit)}.`,
          `2026/27 Personal Dividend Tax (10.75%/35.75%/39.35% after £500 allowance) = £${money(divTax)} → Net Cash = £${money(totalPersonalTakeHome)}.`,
        ],
      };
    },
  },

  // 624. UK VAT Flat Rate Scheme Calculator
  {
    slug: 'uk-vat-flat-rate-scheme-calculator',
    title: 'UK VAT Flat Rate vs Standard Scheme Calculator',
    category: 'business-tax',
    formulaDisplay: 'FRS VAT = Gross VAT-Inclusive Turnover × Sector Flat Rate%',
    inputs: [
      { id: 'netSales', label: 'Annual Ex-VAT Taxable Sales', type: 'number', prefix: '£', defaultValue: 95000, min: 0, max: 150000, step: 2500 },
      { id: 'vatablePurchasesNet', label: 'Annual Ex-VAT Purchases & Expenses', type: 'number', prefix: '£', defaultValue: 18000, min: 0, max: 150000, step: 1000 },
      { id: 'flatRatePct', label: 'HMRC Sector Flat Rate % (16.5% Limited Cost Trader)', type: 'number', unit: '%', defaultValue: 14.5, min: 4, max: 16.5, step: 0.5 },
      {
        id: 'firstYearDiscount',
        label: 'First Year of VAT Registration (-1% discount)?',
        type: 'select',
        defaultValue: 'no',
        options: [
          { label: 'No — Standard Sector %', value: 'no' },
          { label: 'Yes — First-Year 1% Discount', value: 'yes' },
        ],
      },
    ],
    calculate: (v) => {
      const sales = parseNum(v.netSales);
      const purch = parseNum(v.vatablePurchasesNet);
      const frsBase = parseNum(v.flatRatePct);
      const disc = String(v.firstYearDiscount || 'no') === 'yes' ? 1 : 0;
      if ([sales, purch, frsBase].some(Number.isNaN) || sales < 0 || purch < 0) return calcError('Enter valid UK VAT sales and purchase figures.');
      const grossSales = sales * 1.2;
      const frsRate = Math.max(0, frsBase - disc) / 100;
      const frsVatPayable = grossSales * frsRate;
      const standardVatPayable = sales * 0.2 - purch * 0.2;
      const savings = standardVatPayable - frsVatPayable;
      return {
        primaryValue: fmt(frsVatPayable, 2),
        primaryUnit: '£',
        primaryLabel: 'Annual VAT Due Under Flat Rate Scheme',
        secondaryOutputs: [
          { label: 'Standard 20% VAT Accounting Due', value: `£${money(standardVatPayable)}` },
          { label: 'Net Advantage of Flat Rate Scheme', value: `${savings >= 0 ? '+' : ''}£${money(savings)}/yr` },
          { label: 'VAT-Inclusive Turnover (Cap £230k exit)', value: `£${money(grossSales)}` },
        ],
        steps: [
          `VAT-inclusive turnover = £${money(sales)} × 1.20 = £${money(grossSales)} × ${fmt(frsRate * 100, 1)}% = £${money(frsVatPayable)}.`,
          `Standard accounting = £${money(standardVatPayable)} → Flat Rate difference = ${savings >= 0 ? 'saves' : 'costs'} £${money(Math.abs(savings))}/yr.`,
        ],
      };
    },
  },

  // 625. US Form 1040-ES Quarterly Estimated Tax Calculator (2026)
  {
    slug: 'us-quarterly-estimated-tax-calculator',
    title: 'US IRS Form 1040-ES Quarterly Estimated Tax Calculator (2026)',
    category: 'business-tax',
    formulaDisplay: 'Quarterly Installment = (Expected Tax − Withholding) / 4; Safe Harbor = min(90% Current, 100%/110% Prior)',
    inputs: [
      { id: 'expectedTotalTax', label: 'Projected 2026 Total Federal Tax (Income + SE)', type: 'number', prefix: '$', defaultValue: 26000, min: 0, max: 1e9, step: 500 },
      { id: 'w2Withholding', label: 'Expected W-2 Federal Withholding', type: 'number', prefix: '$', defaultValue: 6000, min: 0, max: 1e9, step: 500 },
      { id: 'priorYearTax', label: 'Prior Year (2025) Total Tax Liability', type: 'number', prefix: '$', defaultValue: 22000, min: 0, max: 1e9, step: 500 },
      {
        id: 'priorAgiOver150k',
        label: 'Was Prior Year AGI > $150,000 ($75k MFS)?',
        type: 'select',
        defaultValue: 'no',
        options: [
          { label: 'No — 100% Prior Tax Safe Harbor', value: 'no' },
          { label: 'Yes — 110% Prior Tax Safe Harbor', value: 'yes' },
        ],
      },
    ],
    calculate: (v) => {
      const curTax = parseNum(v.expectedTotalTax);
      const wh = parseNum(v.w2Withholding);
      const priorTax = parseNum(v.priorYearTax);
      const over150 = String(v.priorAgiOver150k || 'no') === 'yes';
      if ([curTax, wh, priorTax].some(Number.isNaN) || curTax < 0 || wh < 0 || priorTax < 0) return calcError('Enter valid federal tax amounts.');
      const safePrior = priorTax * (over150 ? 1.1 : 1.0);
      const safeCurrent = curTax * 0.9;
      const requiredAnnual = curTax - wh < 1000 ? 0 : Math.min(safeCurrent, safePrior);
      const netEstSafeHarbor = Math.max(0, requiredAnnual - wh);
      const fullQuarter = Math.max(0, (curTax - wh) / 4);
      const safeHarborQuarter = netEstSafeHarbor / 4;
      return {
        primaryValue: fmt(safeHarborQuarter, 2),
        primaryUnit: '$ / quarter',
        primaryLabel: 'Minimum Quarterly Safe Harbor Payment',
        secondaryOutputs: [
          { label: 'Full 100% Pay-As-You-Go Quarter', value: `$${money(fullQuarter)}` },
          { label: 'Annual Safe Harbor Target (IRS)', value: `$${money(requiredAnnual)}` },
          { label: '2026 Form 1040-ES Deadlines', value: 'Apr 15 · Jun 15 · Sep 15 · Jan 15' },
        ],
        steps: [
          `Safe harbor target = min(90% current = $${money(safeCurrent)}, ${over150 ? '110%' : '100%'} prior = $${money(safePrior)}) = $${money(requiredAnnual)}.`,
          `After $${money(wh)} W-2 withholding, quarterly safe harbor = $${money(safeHarborQuarter)}.`,
        ],
      };
    },
  },

  // 626. US 2026 Federal Effective vs Marginal Tax Bracket Calculator
  {
    slug: 'us-effective-vs-marginal-tax-rate-calculator',
    title: 'US 2026 Federal Effective vs Marginal Tax Rate Calculator',
    category: 'business-tax',
    formulaDisplay: '2026 IRS Rev. Proc. 2025-32 OBBBA Brackets & Standard Deductions',
    inputs: [
      { id: 'grossIncome', label: 'Gross Annual Income', type: 'number', prefix: '$', defaultValue: 135000, min: 0, max: 1e10, step: 2500 },
      {
        id: 'filingStatus',
        label: '2026 Filing Status',
        type: 'select',
        defaultValue: 'single',
        options: [
          { label: 'Single ($16,100 Std Ded)', value: 'single' },
          { label: 'Married Filing Jointly ($32,200 Std Ded)', value: 'mfj' },
        ],
      },
      { id: 'pretaxDeductions', label: '401(k) / HSA Pre-Tax Deductions', type: 'number', prefix: '$', defaultValue: 8000, min: 0, max: 200000, step: 500 },
    ],
    calculate: (v) => {
      const gross = parseNum(v.grossIncome);
      const status = String(v.filingStatus || 'single');
      const pretax = parseNum(v.pretaxDeductions ?? 0);
      if ([gross, pretax].some(Number.isNaN) || gross < 0 || pretax < 0) return calcError('Enter valid non-negative income.');
      // 2026 IRS Rev. Proc. 2025-32 (including OBBBA standard deduction updates)
      const stdDed = status === 'mfj' ? 32200 : 16100;
      const taxable = Math.max(0, gross - pretax - stdDed);
      const brackets =
        status === 'mfj'
          ? [
              { upTo: 24800, rate: 0.1 },
              { upTo: 100800, rate: 0.12 },
              { upTo: 211400, rate: 0.22 },
              { upTo: 403550, rate: 0.24 },
              { upTo: 512450, rate: 0.32 },
              { upTo: 768700, rate: 0.35 },
              { upTo: Infinity, rate: 0.37 },
            ]
          : [
              { upTo: 12400, rate: 0.1 },
              { upTo: 50400, rate: 0.12 },
              { upTo: 105700, rate: 0.22 },
              { upTo: 201775, rate: 0.24 },
              { upTo: 256225, rate: 0.32 },
              { upTo: 640600, rate: 0.35 },
              { upTo: Infinity, rate: 0.37 },
            ];
      let rem = taxable;
      let prev = 0;
      let tax = 0;
      let marginalRate = 0.1;
      for (const b of brackets) {
        if (taxable > prev) marginalRate = b.rate;
        const slice = Math.max(0, Math.min(rem, b.upTo - prev));
        tax += slice * b.rate;
        rem -= slice;
        prev = b.upTo;
      }
      const effOnGross = gross > 0 ? (tax / gross) * 100 : 0;
      return {
        primaryValue: fmt(effOnGross, 2),
        primaryUnit: '% effective',
        primaryLabel: `Effective Federal Rate (Top Bracket: ${fmt(marginalRate * 100, 0)}%)`,
        secondaryOutputs: [
          { label: '2026 Federal Income Tax', value: `$${money(tax)}` },
          { label: '2026 Taxable Income', value: `$${money(taxable)}` },
          { label: 'Top Marginal Tax Bracket', value: `${fmt(marginalRate * 100, 0)}%` },
          { label: 'Effective Rate on Taxable Income', value: taxable > 0 ? `${fmt((tax / taxable) * 100, 2)}%` : '0%' },
        ],
        steps: [
          `2026 Standard Deduction (${status === 'mfj' ? 'MFJ $32,200' : 'Single $16,100'}) + $${money(pretax)} pre-tax → Taxable = $${money(taxable)}.`,
          `Progressive tax = $${money(tax)} (${fmt(effOnGross, 2)}% effective vs ${fmt(marginalRate * 100, 0)}% marginal).`,
        ],
      };
    },
  },

  // 627. S-Corp vs Sole Proprietor FICA Tax Savings Calculator (2026)
  {
    slug: 'us-s-corp-reasonable-salary-tax-calculator',
    title: 'S-Corp vs Sole Proprietor Self-Employment Tax Savings Calculator (2026)',
    category: 'business-tax',
    formulaDisplay: '2026 SS Wage Base = $184,500 (12.4%) + 2.9% Medicare on 92.35% SE vs W-2 Salary',
    inputs: [
      { id: 'netBusinessProfit', label: 'Net Business Profit (Schedule C / Before Owner Salary)', type: 'number', prefix: '$', defaultValue: 180000, min: 0, max: 1e9, step: 5000 },
      { id: 'reasonableSalary', label: 'IRS Reasonable W-2 S-Corp Salary', type: 'number', prefix: '$', defaultValue: 80000, min: 0, max: 1e9, step: 2500 },
      { id: 'scorpAdminCost', label: 'Added S-Corp Payroll & Tax Return Cost', type: 'number', prefix: '$', defaultValue: 2500, min: 0, max: 50000, step: 250 },
    ],
    calculate: (v) => {
      const prof = parseNum(v.netBusinessProfit);
      const sal = Math.min(prof, Math.max(0, parseNum(v.reasonableSalary)));
      const admin = parseNum(v.scorpAdminCost);
      if ([prof, sal, admin].some(Number.isNaN) || prof < 0) return calcError('Enter valid business profit and salary figures.');
      const ssCap2026 = 184500; // 2026 SSA Taxable Maximum
      const seBase = prof * 0.9235;
      const solePropFica = Math.min(seBase, ssCap2026) * 0.124 + seBase * 0.029;
      const sCorpFica = Math.min(sal, ssCap2026) * 0.124 + sal * 0.029;
      const grossSavings = solePropFica - sCorpFica;
      const netSavings = grossSavings - admin;
      const k1Dist = Math.max(0, prof - sal - sCorpFica * 0.5);
      return {
        primaryValue: fmt(netSavings, 2),
        primaryUnit: '$ / year',
        primaryLabel: 'Net Annual FICA Tax Savings (S-Corp)',
        secondaryOutputs: [
          { label: 'Sole Proprietor Self-Employment Tax', value: `$${money(solePropFica)}` },
          { label: 'S-Corp Combined W-2 Payroll FICA', value: `$${money(sCorpFica)}` },
          { label: 'Est. FICA-Free K-1 Distribution', value: `$${money(k1Dist)}` },
        ],
        steps: [
          `Sole Prop SE tax (15.3% up to 2026 SS cap $184,500) = $${money(solePropFica)}.`,
          `S-Corp FICA on $${money(sal)} W-2 salary = $${money(sCorpFica)} → Net after $${money(admin)} admin = $${money(netSavings)}.`,
        ],
      };
    },
  },

  // 628. IRS Section 179 & Bonus Depreciation Calculator (2026)
  {
    slug: 'section-179-bonus-depreciation-calculator',
    title: 'IRS Section 179 & Bonus Depreciation Calculator (2026)',
    category: 'business-tax',
    formulaDisplay: 'OBBBA Restored 100% Bonus Depreciation & $2.5M+ Section 179 Deduction (2026)',
    inputs: [
      { id: 'assetCost', label: 'Qualified Equipment / Asset Cost', type: 'number', prefix: '$', defaultValue: 180000, min: 100, max: 1e9, step: 5000 },
      { id: 'businessUsePct', label: 'Qualified Business Use % (Min >50%)', type: 'number', unit: '%', defaultValue: 100, min: 51, max: 100, step: 5 },
      { id: 'bonusPct', label: 'Bonus Depreciation Rate (100% in 2026 under OBBBA)', type: 'number', unit: '%', defaultValue: 100, min: 0, max: 100, step: 20 },
      { id: 'marginalTaxPct', label: 'Combined Marginal Tax Rate', type: 'number', unit: '%', defaultValue: 30, min: 0, max: 60, step: 1 },
    ],
    calculate: (v) => {
      const cost = parseNum(v.assetCost);
      const usePct = parseNum(v.businessUsePct) / 100;
      const bonus = parseNum(v.bonusPct) / 100;
      const tax = parseNum(v.marginalTaxPct) / 100;
      if ([cost, usePct, bonus, tax].some(Number.isNaN)) return calcError('Enter valid Section 179 asset inputs.');
      if (cost <= 0 || usePct <= 0.5 || usePct > 1) return calcError('Business use must exceed 50% for Section 179/Bonus.');
      const basis = cost * usePct;
      const sec179Cap2026 = 2560000;
      const sec179Deduction = Math.min(basis, sec179Cap2026);
      const rem = basis - sec179Deduction;
      const bonusDeduction = rem * bonus;
      const yr1Total = sec179Deduction + bonusDeduction;
      const taxSavings = yr1Total * tax;
      return {
        primaryValue: fmt(yr1Total, 2),
        primaryUnit: '$ deduction',
        primaryLabel: 'Year 1 Total Depreciation Write-Off',
        secondaryOutputs: [
          { label: 'Estimated Year 1 Tax Cash Savings', value: `$${money(taxSavings)}` },
          { label: 'Net Effective After-Tax Asset Cost', value: `$${money(basis - taxSavings)}` },
          { label: 'Eligible Business Basis', value: `$${money(basis)}` },
        ],
        steps: [
          `Eligible depreciable basis = $${money(cost)} × ${fmt(usePct * 100, 0)}% = $${money(basis)}.`,
          `Year 1 Section 179 + ${fmt(bonus * 100, 0)}% Bonus Deduction = $${money(yr1Total)} → $${money(taxSavings)} tax savings.`,
        ],
      };
    },
  },

  // 629. Straight-Line vs Double Declining Depreciation Calculator
  {
    slug: 'straight-line-ddb-depreciation-calculator',
    title: 'Straight-Line vs Double Declining Balance Depreciation Calculator',
    category: 'business-tax',
    formulaDisplay: 'SL = (Cost − Salvage)/Life   |   DDB Year 1 = Cost × (2 / Life)',
    inputs: [
      { id: 'cost', label: 'Asset Acquisition Cost', type: 'number', prefix: '$', defaultValue: 60000, min: 1, max: 1e11, step: 1000 },
      { id: 'salvage', label: 'Estimated Salvage Value', type: 'number', prefix: '$', defaultValue: 6000, min: 0, max: 1e11, step: 500 },
      { id: 'usefulLife', label: 'Useful Life', type: 'number', unit: 'years', defaultValue: 5, min: 1, max: 50, step: 1 },
    ],
    calculate: (v) => {
      const c = parseNum(v.cost);
      const s = parseNum(v.salvage);
      const n = Math.round(parseNum(v.usefulLife));
      if ([c, s, n].some(Number.isNaN)) return calcError('Enter valid asset depreciation parameters.');
      if (c <= 0 || s < 0 || s >= c || n < 1) return calcError('Cost must exceed salvage value and life >= 1.');
      const depreciableBase = c - s;
      const slAnnual = depreciableBase / n;
      const ddbRate = 2 / n;
      const ddbYr1 = Math.min(depreciableBase, c * ddbRate);
      const ddbYr2 = Math.min(Math.max(0, c - ddbYr1 - s), (c - ddbYr1) * ddbRate);
      return {
        primaryValue: fmt(slAnnual, 2),
        primaryUnit: '$ / year',
        primaryLabel: 'Annual Straight-Line Depreciation',
        secondaryOutputs: [
          { label: 'Double Declining Year 1', value: `$${money(ddbYr1)}` },
          { label: 'Double Declining Year 2', value: `$${money(ddbYr2)}` },
          { label: 'Total Depreciable Base', value: `$${money(depreciableBase)}` },
        ],
        steps: [
          `Straight-Line = ($${money(c)} − $${money(s)}) ÷ ${n} yrs = $${money(slAnnual)}/yr.`,
          `DDB Year 1 (${fmt(ddbRate * 100, 1)}% rate) = $${money(ddbYr1)}; Year 2 = $${money(ddbYr2)}.`,
        ],
      };
    },
  },

  // 630. Tiered Sales Commission Calculator
  {
    slug: 'commission-tiered-payout-calculator',
    title: 'Tiered Sales Commission & Accelerator Payout Calculator',
    category: 'business-tax',
    formulaDisplay: 'Commission = Base Tier + Accelerator Above 100% Quota',
    inputs: [
      { id: 'quota', label: 'Monthly / Quarterly Sales Quota', type: 'number', prefix: '$', defaultValue: 100000, min: 1, max: 1e11, step: 5000 },
      { id: 'closedRevenue', label: 'Closed Revenue Achieved', type: 'number', prefix: '$', defaultValue: 130000, min: 0, max: 1e11, step: 5000 },
      { id: 'baseRatePct', label: 'Base Commission Rate (Up to Quota)', type: 'number', unit: '%', defaultValue: 8.0, min: 0, max: 50, step: 0.5 },
      { id: 'acceleratorRatePct', label: 'Accelerator Rate (Above Quota)', type: 'number', unit: '%', defaultValue: 12.0, min: 0, max: 60, step: 0.5 },
      { id: 'baseSalary', label: 'Period Base Salary (Optional)', type: 'number', prefix: '$', defaultValue: 5000, min: 0, max: 1e8, step: 500 },
    ],
    calculate: (v) => {
      const q = parseNum(v.quota);
      const rev = parseNum(v.closedRevenue);
      const rBase = parseNum(v.baseRatePct) / 100;
      const rAcc = parseNum(v.acceleratorRatePct) / 100;
      const sal = parseNum(v.baseSalary ?? 0);
      if ([q, rev, rBase, rAcc, sal].some(Number.isNaN)) return calcError('Enter valid sales quota and rates.');
      if (q <= 0 || rev < 0 || rBase < 0 || rAcc < 0 || sal < 0) return calcError('Quota must be positive.');
      const baseSales = Math.min(rev, q);
      const overSales = Math.max(0, rev - q);
      const commBase = baseSales * rBase;
      const commOver = overSales * rAcc;
      const totalComm = commBase + commOver;
      const totalComp = totalComm + sal;
      const attainment = (rev / q) * 100;
      return {
        primaryValue: fmt(totalComm, 2),
        primaryUnit: '$',
        primaryLabel: `Total Commission Earned (${fmt(attainment, 1)}% Attainment)`,
        secondaryOutputs: [
          { label: 'Total Period Compensation', value: `$${money(totalComp)}` },
          { label: 'Base Tier Commission', value: `$${money(commBase)}` },
          { label: 'Accelerator Bonus Commission', value: `$${money(commOver)}` },
        ],
        steps: [
          `Attainment = ${fmt(attainment, 1)}% ($${money(baseSales)} @ ${fmt(rBase * 100, 1)}% + $${money(overSales)} @ ${fmt(rAcc * 100, 1)}%).`,
          `Total Commission = $${money(totalComm)} → Total Pay = $${money(totalComp)}.`,
        ],
      };
    },
  },

  // 631. PTO Vacation Accrual & Cash Value Calculator
  {
    slug: 'pto-vacation-accrual-calculator',
    title: 'Employee PTO Accrual & Unused Balance Cash Value Calculator',
    category: 'business-tax',
    formulaDisplay: 'Accrual/Paycheck = Annual PTO Hours / Pay Periods',
    inputs: [
      { id: 'annualPtoDays', label: 'Annual Paid Time Off Allowance', type: 'number', unit: 'days', defaultValue: 18, min: 0, max: 120, step: 1 },
      { id: 'hoursPerDay', label: 'Standard Workday Hours', type: 'number', unit: 'hrs', defaultValue: 8, min: 1, max: 16, step: 0.5 },
      {
        id: 'payPeriods',
        label: 'Pay Frequency',
        type: 'select',
        defaultValue: '26',
        options: [
          { label: 'Biweekly (26 pay periods/yr)', value: '26' },
          { label: 'Semi-Monthly (24/yr)', value: '24' },
          { label: 'Weekly (52/yr)', value: '52' },
          { label: 'Monthly (12/yr)', value: '12' },
        ],
      },
      { id: 'hourlyEquivalent', label: 'Hourly Wage Equivalent (Optional)', type: 'number', prefix: '$', defaultValue: 42, min: 0, max: 10000, step: 1 },
    ],
    calculate: (v) => {
      const days = parseNum(v.annualPtoDays);
      const hpd = parseNum(v.hoursPerDay);
      const periods = parseNum(v.payPeriods || 26);
      const wage = parseNum(v.hourlyEquivalent ?? 0);
      if ([days, hpd, periods, wage].some(Number.isNaN)) return calcError('Enter valid PTO policy values.');
      if (days < 0 || hpd <= 0 || periods <= 0 || wage < 0) return calcError('Workday hours and pay periods must be positive.');
      const totalHours = days * hpd;
      const hoursPerPeriod = totalHours / periods;
      const hoursPerWorkHour = totalHours / 2080;
      const cashValue = totalHours * wage;
      return {
        primaryValue: fmt(hoursPerPeriod, 2),
        primaryUnit: 'hrs / paycheck',
        primaryLabel: 'PTO Earned Per Paycheck',
        secondaryOutputs: [
          { label: 'Total Annual PTO Bank', value: `${fmt(totalHours, 1)} hrs (${days} days)` },
          { label: 'Accrual Rate per Hour Worked', value: `${fmt(hoursPerWorkHour, 4)} hrs` },
          { label: 'Total Cash Value of PTO', value: `$${money(cashValue)}` },
        ],
        steps: [
          `Total PTO bank = ${days} days × ${hpd} hrs = ${fmt(totalHours, 1)} hrs/yr.`,
          `Per paycheck (${periods}/yr) = ${fmt(hoursPerPeriod, 2)} hrs (Cash value = $${money(cashValue)}).`,
        ],
      };
    },
  },

  // 632. Shift Differential & Blended Wage Calculator
  {
    slug: 'shift-differential-night-pay-calculator',
    title: 'Shift Differential & Weekend Premium Pay Calculator',
    category: 'business-tax',
    formulaDisplay: 'Shift Rate = Base × (1 + Premium%) + Flat Add-On',
    inputs: [
      { id: 'baseHourly', label: 'Base Hourly Wage', type: 'number', prefix: '$', defaultValue: 28.0, min: 1, max: 10000, step: 0.5 },
      { id: 'dayHours', label: 'Standard Base Hours / Week', type: 'number', unit: 'hrs', defaultValue: 16, min: 0, max: 120, step: 1 },
      { id: 'shiftHours', label: 'Night / Weekend Differential Hours / Week', type: 'number', unit: 'hrs', defaultValue: 24, min: 0, max: 120, step: 1 },
      { id: 'diffPct', label: 'Percentage Shift Differential', type: 'number', unit: '%', defaultValue: 15, min: 0, max: 200, step: 1 },
      { id: 'flatAddPerHr', label: 'Flat Hourly Differential Add-On', type: 'number', prefix: '$', defaultValue: 2.0, min: 0, max: 500, step: 0.5 },
    ],
    calculate: (v) => {
      const base = parseNum(v.baseHourly);
      const h1 = parseNum(v.dayHours);
      const h2 = parseNum(v.shiftHours);
      const pct = parseNum(v.diffPct) / 100;
      const flat = parseNum(v.flatAddPerHr);
      if ([base, h1, h2, pct, flat].some(Number.isNaN)) return calcError('Enter valid shift pay parameters.');
      if (base <= 0 || h1 < 0 || h2 < 0 || h1 + h2 <= 0) return calcError('Total weekly hours must be positive.');
      const shiftRate = base * (1 + pct) + flat;
      const weeklyGross = h1 * base + h2 * shiftRate;
      const blendedRate = weeklyGross / (h1 + h2);
      const annualShiftLift = (shiftRate - base) * h2 * 52;
      return {
        primaryValue: fmt(weeklyGross, 2),
        primaryUnit: '$ / week',
        primaryLabel: 'Total Weekly Gross Shift Pay',
        secondaryOutputs: [
          { label: 'Differential Shift Hourly Rate', value: `$${money(shiftRate)}/hr` },
          { label: 'Blended Effective Hourly Rate', value: `$${money(blendedRate)}/hr` },
          { label: 'Annual Extra Earnings vs Base', value: `+$${money(annualShiftLift)}/yr` },
        ],
        steps: [
          `Shift differential rate = $${money(base)} × (1 + ${fmt(pct * 100, 0)}%) + $${money(flat)} = $${money(shiftRate)}/hr.`,
          `Weekly total = (${h1} × $${money(base)}) + (${h2} × $${money(shiftRate)}) = $${money(weeklyGross)}.`,
        ],
      };
    },
  },

  // 633. Agency Billable Utilization & Realization Rate Calculator
  {
    slug: 'billable-utilization-rate-calculator',
    title: 'Consulting Billable Utilization & Realization Calculator',
    category: 'business-tax',
    formulaDisplay: 'Utilization % = Billable Hours / Available Capacity Hours',
    inputs: [
      { id: 'availableHours', label: 'Available Work Capacity Hours / Year', type: 'number', unit: 'hrs', defaultValue: 1840, min: 1, max: 5000, step: 20, helpText: '2,080 hrs minus ~240 hrs PTO & holidays = 1,840 capacity hours.' },
      { id: 'billableHours', label: 'Logged Billable Client Hours', type: 'number', unit: 'hrs', defaultValue: 1472, min: 0, max: 5000, step: 20 },
      { id: 'standardBillRate', label: 'Standard Hourly Billing Rate', type: 'number', prefix: '$', defaultValue: 185, min: 1, max: 10000, step: 5 },
      { id: 'collectedRevenue', label: 'Actual Collected Invoice Revenue', type: 'number', prefix: '$', defaultValue: 258000, min: 0, max: 1e10, step: 5000 },
    ],
    calculate: (v) => {
      const cap = parseNum(v.availableHours);
      const bill = parseNum(v.billableHours);
      const rate = parseNum(v.standardBillRate);
      const coll = parseNum(v.collectedRevenue);
      if ([cap, bill, rate, coll].some(Number.isNaN)) return calcError('Enter valid agency utilization values.');
      if (cap <= 0 || bill < 0 || rate <= 0 || coll < 0) return calcError('Capacity and billing rate must be positive.');
      const utilPct = (bill / cap) * 100;
      const billedStandard = bill * rate;
      const realizationPct = billedStandard > 0 ? (coll / billedStandard) * 100 : 0;
      const effectiveRate = bill > 0 ? coll / bill : 0;
      return {
        primaryValue: fmt(utilPct, 1),
        primaryUnit: '%',
        primaryLabel: 'Billable Utilization Rate',
        secondaryOutputs: [
          { label: 'Fee Realization Rate', value: `${fmt(realizationPct, 1)}%` },
          { label: 'Effective Realized Hourly Rate', value: `$${money(effectiveRate)}/hr` },
          { label: 'Potential Value at 100% Util.', value: `$${money(cap * rate)}` },
        ],
        steps: [
          `Utilization = ${bill} ÷ ${cap} = ${fmt(utilPct, 1)}%.`,
          `Collected $${money(coll)} vs $${money(billedStandard)} standard fees = ${fmt(realizationPct, 1)}% realization.`,
        ],
      };
    },
  },

  // 634. 1099 Contractor vs W-2 Employee Rate Calculator
  {
    slug: 'contractor-vs-w2-employee-rate-calculator',
    title: '1099 Contractor vs W-2 Employee Equivalent Rate Calculator',
    category: 'business-tax',
    formulaDisplay: '1099 Equivalent = (W2 Salary + Benefits + Employer FICA) / (Billable Hrs × (1 − NonBillable))',
    inputs: [
      { id: 'w2Salary', label: 'Target W-2 Annual Base Salary', type: 'number', prefix: '$', defaultValue: 110000, min: 1000, max: 1e8, step: 2500 },
      { id: 'annualBenefits', label: 'Health Insurance, 401(k) Match & Perks Value', type: 'number', prefix: '$', defaultValue: 18000, min: 0, max: 500000, step: 1000 },
      { id: 'paidDaysOff', label: 'Paid Vacation + Holiday Days Lost as 1099', type: 'number', unit: 'days', defaultValue: 25, min: 0, max: 100, step: 1 },
      { id: 'overheadAnnual', label: 'Contractor Software, Liability & Admin Overhead', type: 'number', prefix: '$', defaultValue: 3500, min: 0, max: 200000, step: 500 },
    ],
    calculate: (v) => {
      const sal = parseNum(v.w2Salary);
      const ben = parseNum(v.annualBenefits);
      const ptoDays = parseNum(v.paidDaysOff);
      const ovh = parseNum(v.overheadAnnual);
      if ([sal, ben, ptoDays, ovh].some(Number.isNaN)) return calcError('Enter valid contractor vs W-2 assumptions.');
      if (sal <= 0 || ben < 0 || ptoDays < 0 || ptoDays > 250 || ovh < 0) return calcError('Salary must be positive and PTO <= 250 days.');
      const employerFica = Math.min(sal, 184500) * 0.062 + sal * 0.0145;
      const totalRequiredGross = sal + ben + employerFica + ovh;
      const workingHours = Math.max(100, (260 - ptoDays) * 8);
      const reqHourly1099 = totalRequiredGross / workingHours;
      const w2NominalHourly = sal / 2080;
      const markupRatio = reqHourly1099 / w2NominalHourly;
      return {
        primaryValue: fmt(reqHourly1099, 2),
        primaryUnit: '$ / hr (1099)',
        primaryLabel: 'Required 1099 Hourly Equivalent',
        secondaryOutputs: [
          { label: 'Nominal W-2 Hourly Base (2,080h)', value: `$${money(w2NominalHourly)}/hr` },
          { label: 'Equivalent Multiplier', value: `${fmt(markupRatio, 2)}× W-2 hourly` },
          { label: 'Employer FICA + Benefits + Overhead', value: `$${money(ben + employerFica + ovh)}` },
          { label: 'Net Billable Working Hours / Yr', value: `${workingHours} hrs` },
        ],
        steps: [
          `Total compensation burden = $${money(sal)} + $${money(ben)} benefits + $${money(employerFica)} FICA + $${money(ovh)} overhead = $${money(totalRequiredGross)}.`,
          `Dividing across ${workingHours} un-paid-off billable hours = $${money(reqHourly1099)}/hr (${fmt(markupRatio, 2)}× W-2 rate).`,
        ],
      };
    },
  },

  // 635. Australia BAS GST & PAYG Installment Calculator (2026-27)
  {
    slug: 'australia-payg-withholding-bas-calculator',
    title: 'Australia BAS Net GST & PAYG Installment Calculator (2026-27)',
    category: 'business-tax',
    formulaDisplay: 'Net BAS = (GST Collected − GST Paid Credits) + PAYG Installment + PAYG Withheld',
    inputs: [
      { id: 'taxableSalesInclGst', label: 'Quarterly GST-Inclusive Sales (G1)', type: 'number', prefix: 'A$', defaultValue: 88000, min: 0, max: 1e11, step: 1000 },
      { id: 'purchasesInclGst', label: 'Quarterly GST-Inclusive Business Purchases', type: 'number', prefix: 'A$', defaultValue: 33000, min: 0, max: 1e11, step: 1000 },
      { id: 'paygWithheldWages', label: 'Staff PAYG Withholding (W2)', type: 'number', prefix: 'A$', defaultValue: 4200, min: 0, max: 1e10, step: 250 },
      { id: 'paygInstallmentRatePct', label: 'ATO PAYG Business Installment Rate (T2)', type: 'number', unit: '%', defaultValue: 6.5, min: 0, max: 45, step: 0.5 },
    ],
    calculate: (v) => {
      const sales = parseNum(v.taxableSalesInclGst);
      const purch = parseNum(v.purchasesInclGst);
      const w2 = parseNum(v.paygWithheldWages);
      const rate = parseNum(v.paygInstallmentRatePct) / 100;
      if ([sales, purch, w2, rate].some(Number.isNaN) || sales < 0 || purch < 0 || w2 < 0 || rate < 0) return calcError('Enter valid quarterly BAS amounts.');
      const gst1A = sales / 11;
      const gst1B = purch / 11;
      const netGst = gst1A - gst1B;
      const exGstIncome = sales - gst1A;
      const paygInst = exGstIncome * rate;
      const totalBas = netGst + w2 + paygInst;
      return {
        primaryValue: fmt(totalBas, 2),
        primaryUnit: 'A$',
        primaryLabel: totalBas >= 0 ? 'Net Quarterly ATO BAS Payment' : 'Net ATO BAS Refund',
        secondaryOutputs: [
          { label: '1A GST on Sales (÷11)', value: `A$${money(gst1A)}` },
          { label: '1B GST Credits on Purchases', value: `A$${money(gst1B)}` },
          { label: 'Net GST Liability (1A − 1B)', value: `A$${money(netGst)}` },
          { label: 'PAYG Installment (Ex-GST × Rate)', value: `A$${money(paygInst)}` },
        ],
        steps: [
          `Net GST = A$${money(gst1A)} (1A) − A$${money(gst1B)} (1B) = A$${money(netGst)}.`,
          `Total BAS = A$${money(netGst)} + A$${money(w2)} PAYG W2 + A$${money(paygInst)} PAYG Inst. = A$${money(totalBas)}.`,
        ],
      };
    },
  },

  // 636. Canada CPP, CPP2 & EI Payroll Deductions Calculator (2026)
  {
    slug: 'canada-cpp-ei-payroll-deductions-calculator',
    title: 'Canada CPP, CPP2 & EI Payroll Contributions Calculator (2026)',
    category: 'business-tax',
    formulaDisplay: '2026 CRA: CPP 5.95% ($3.5k–$74.6k) + CPP2 4% ($74.6k–$85k) + EI 1.63% (≤$68.9k)',
    inputs: [
      { id: 'grossSalary', label: 'Annual Pensionable / Insurable Employment Salary', type: 'number', prefix: 'C$', defaultValue: 82000, min: 0, max: 1e9, step: 1000 },
      {
        id: 'province',
        label: 'Payroll Jurisdiction (2026)',
        type: 'select',
        defaultValue: 'fed',
        options: [
          { label: 'Rest of Canada (CRA CPP + Federal EI)', value: 'fed' },
          { label: 'Quebec (QPP + Reduced Federal EI 1.30%)', value: 'qc' },
        ],
      },
    ],
    calculate: (v) => {
      const sal = parseNum(v.grossSalary);
      const isQc = String(v.province || 'fed') === 'qc';
      if (Number.isNaN(sal) || sal < 0) return calcError('Enter a non-negative salary.');
      // 2026 CRA / Revenu Québec official payroll thresholds
      const ympe2026 = 74600;
      const yampe2026 = 85000;
      const basicExemption = 3500;
      const cppRate = isQc ? 0.063 : 0.0595; // QPP 6.30% vs CPP 5.95%
      const cpp1 = Math.max(0, Math.min(sal, ympe2026) - basicExemption) * cppRate;
      const cpp2 = Math.max(0, Math.min(sal, yampe2026) - ympe2026) * 0.04;
      const eiMax2026 = 68900;
      const eiRate = isQc ? 0.013 : 0.0163;
      const eiEmp = Math.min(sal, eiMax2026) * eiRate;
      const totalEmp = cpp1 + cpp2 + eiEmp;
      const employerMatch = cpp1 + cpp2 + eiEmp * 1.4;
      return {
        primaryValue: fmt(totalEmp, 2),
        primaryUnit: 'C$ / year',
        primaryLabel: `Total 2026 Employee ${isQc ? 'QPP' : 'CPP'} + EI`,
        secondaryOutputs: [
          { label: `${isQc ? 'QPP' : 'CPP'} Tier 1 Contribution`, value: `C$${money(cpp1)}` },
          { label: 'CPP2 / QPP2 Second Ceiling Tier', value: `C$${money(cpp2)}` },
          { label: 'Employee EI Premium (2026)', value: `C$${money(eiEmp)}` },
          { label: 'Employer Matching Cost (incl 1.4× EI)', value: `C$${money(employerMatch)}` },
        ],
        steps: [
          `2026 CRA ceilings: YMPE C$74,600, YAMPE C$85,000, EI Max Insurable C$68,900.`,
          `Tier 1 = C$${money(cpp1)}; CPP2 = C$${money(cpp2)}; EI = C$${money(eiEmp)} → Total = C$${money(totalEmp)}/yr.`,
        ],
      };
    },
  },
];
