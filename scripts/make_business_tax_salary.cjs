const fs = require('fs');

const code = `import { CalculatorSpec } from './types';

export const businessTaxSalarySpecs: CalculatorSpec[] = [
  // BUSINESS & ACCOUNTING
  {
    slug: 'gross-margin-calculator',
    title: 'Gross Margin Calculator',
    category: 'business-accounting',
    formulaDisplay: 'Gross Margin % = [(Revenue - COGS) / Revenue] × 100',
    inputs: [
      { id: 'revenue', label: 'Total Revenue ($)', defaultValue: 100000, type: 'number', step: 1000, unit: '$' },
      { id: 'cogs', label: 'Cost of Goods Sold (COGS) ($)', defaultValue: 60000, type: 'number', step: 1000, unit: '$' },
    ],
    calculate: (v) => {
      const rev = Number(v.revenue) || 0;
      const cogs = Number(v.cogs) || 0;
      if (rev <= 0) return { primaryValue: 'Error', primaryLabel: 'Invalid', error: 'Revenue must be > 0.' };
      const profit = rev - cogs;
      const margin = (profit / rev) * 100;
      const markup = cogs > 0 ? (profit / cogs) * 100 : 0;
      return {
        primaryValue: parseFloat(margin.toFixed(2)),
        primaryUnit: '%',
        primaryLabel: 'Gross Margin',
        secondaryOutputs: [
          { label: 'Gross Profit ($)', value: \`$\${profit.toFixed(2)}\` },
          { label: 'Markup on Cost', value: \`\${markup.toFixed(2)}%\` },
        ],
        steps: [\`Gross Profit = $\${rev} - $\${cogs} = $\${profit}\`, \`Margin = ($\${profit} / $\${rev}) × 100 = \${margin.toFixed(2)}%\`],
        formulaUsed: 'Margin = (Gross Profit / Revenue) × 100',
      };
    },
  },
  {
    slug: 'markup-calculator',
    title: 'Markup Calculator',
    category: 'business-accounting',
    formulaDisplay: 'Selling Price = Cost × (1 + Markup %)',
    inputs: [
      { id: 'cost', label: 'Product Cost ($)', defaultValue: 50, type: 'number', min: 0.01, step: 1, unit: '$' },
      { id: 'markup', label: 'Markup Percentage (%)', defaultValue: 60, type: 'number', step: 1, unit: '%' },
    ],
    calculate: (v) => {
      const cost = Number(v.cost) || 0;
      const markup = (Number(v.markup) || 0) / 100;
      const profit = cost * markup;
      const price = cost + profit;
      const margin = price > 0 ? (profit / price) * 100 : 0;
      return {
        primaryValue: parseFloat(price.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: 'Recommended Retail Price',
        secondaryOutputs: [
          { label: 'Gross Profit per Unit', value: \`$\${profit.toFixed(2)}\` },
          { label: 'Equivalent Gross Margin', value: \`\${margin.toFixed(2)}%\` },
        ],
        steps: [\`Profit = $\${cost} × \${markup * 100}% = $\${profit.toFixed(2)}\`, \`Price = $\${cost} + $\${profit.toFixed(2)} = $\${price.toFixed(2)}\`],
        formulaUsed: 'Price = Cost × (1 + Markup)',
      };
    },
  },
  {
    slug: 'net-profit-margin-calculator',
    title: 'Net Profit Margin Calculator',
    category: 'business-accounting',
    formulaDisplay: 'Net Margin = (Net Income / Total Revenue) × 100',
    inputs: [
      { id: 'revenue', label: 'Total Revenue ($)', defaultValue: 250000, type: 'number', step: 5000, unit: '$' },
      { id: 'expenses', label: 'Total All Expenses ($)', defaultValue: 210000, type: 'number', step: 5000, unit: '$' },
    ],
    calculate: (v) => {
      const rev = Number(v.revenue) || 1;
      const exp = Number(v.expenses) || 0;
      const netIncome = rev - exp;
      const netMargin = (netIncome / rev) * 100;
      return {
        primaryValue: parseFloat(netMargin.toFixed(2)),
        primaryUnit: '%',
        primaryLabel: 'Net Profit Margin',
        secondaryOutputs: [
          { label: 'Net Income (Bottom Line)', value: \`$\${netIncome.toFixed(2)}\` },
          { label: 'Expense Ratio', value: \`\${((exp / rev) * 100).toFixed(1)}%\` },
        ],
        steps: [\`Net Income = $\${rev} - $\${exp} = $\${netIncome}\`, \`Margin = ($\${netIncome} / $\${rev}) × 100 = \${netMargin.toFixed(2)}%\`],
        formulaUsed: 'Net Margin = (Net Profit / Revenue) × 100',
      };
    },
  },
  {
    slug: 'operating-cash-flow-calculator',
    title: 'Operating Cash Flow (OCF) Calculator',
    category: 'business-accounting',
    formulaDisplay: 'OCF = Net Income + D&A - ΔNWC',
    inputs: [
      { id: 'netIncome', label: 'Net Income ($)', defaultValue: 120000, type: 'number', step: 5000, unit: '$' },
      { id: 'deprec', label: 'Depreciation & Amortization ($)', defaultValue: 30000, type: 'number', step: 2000, unit: '$' },
      { id: 'nwcChange', label: 'Change in Net Working Capital ($)', defaultValue: -10000, type: 'number', step: 1000, unit: '$' },
    ],
    calculate: (v) => {
      const ni = Number(v.netIncome) || 0;
      const da = Number(v.deprec) || 0;
      const nwc = Number(v.nwcChange) || 0;
      const ocf = ni + da - nwc;
      return {
        primaryValue: parseFloat(ocf.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: 'Operating Cash Flow',
        secondaryOutputs: [
          { label: 'Non-Cash Addbacks (D&A)', value: \`$\${da.toFixed(2)}\` },
          { label: 'Working Capital Impact', value: \`$\${(-nwc).toFixed(2)}\` },
        ],
        steps: [\`OCF = $\${ni} + $\${da} - ($\${nwc}) = $\${ocf.toFixed(2)}\`],
        formulaUsed: 'OCF = Net Income + D&A - ΔNWC',
      };
    },
  },
  {
    slug: 'receivables-turnover-calculator',
    title: 'Accounts Receivable Turnover Calculator',
    category: 'business-accounting',
    formulaDisplay: 'Turnover = Net Credit Sales / Average Accounts Receivable',
    inputs: [
      { id: 'sales', label: 'Net Annual Credit Sales ($)', defaultValue: 800000, type: 'number', step: 10000, unit: '$' },
      { id: 'ar', label: 'Average Accounts Receivable ($)', defaultValue: 100000, type: 'number', min: 1, step: 2500, unit: '$' },
    ],
    calculate: (v) => {
      const sales = Number(v.sales) || 0;
      const ar = Number(v.ar) || 1;
      const turnover = sales / ar;
      const dso = 365 / turnover;
      return {
        primaryValue: parseFloat(turnover.toFixed(2)),
        primaryUnit: 'x',
        primaryLabel: 'Receivables Turnover Ratio',
        secondaryOutputs: [
          { label: 'Days Sales Outstanding (DSO)', value: parseFloat(dso.toFixed(1)) + ' days' },
        ],
        steps: [\`Turnover = $\${sales} / $\${ar} = \${turnover.toFixed(2)}x\`, \`Collection Period = 365 / \${turnover.toFixed(2)} = \${dso.toFixed(1)} days\`],
        formulaUsed: 'Turnover = Sales / Average AR, DSO = 365 / Turnover',
      };
    },
  },
  {
    slug: 'inventory-turnover-calculator',
    title: 'Inventory Turnover Ratio Calculator',
    category: 'business-accounting',
    formulaDisplay: 'Turnover = COGS / Average Inventory',
    inputs: [
      { id: 'cogs', label: 'Cost of Goods Sold (COGS) ($)', defaultValue: 450000, type: 'number', step: 10000, unit: '$' },
      { id: 'inv', label: 'Average Inventory ($)', defaultValue: 75000, type: 'number', min: 1, step: 2500, unit: '$' },
    ],
    calculate: (v) => {
      const cogs = Number(v.cogs) || 0;
      const inv = Number(v.inv) || 1;
      const turnover = cogs / inv;
      const dio = 365 / turnover;
      return {
        primaryValue: parseFloat(turnover.toFixed(2)),
        primaryUnit: 'x',
        primaryLabel: 'Inventory Turnover Ratio',
        secondaryOutputs: [
          { label: 'Days Inventory Outstanding (DIO)', value: parseFloat(dio.toFixed(1)) + ' days' },
        ],
        steps: [\`Turnover = $\${cogs} / $\${inv} = \${turnover.toFixed(2)} times/year\`],
        formulaUsed: 'Inventory Turnover = COGS / Average Inventory',
      };
    },
  },
  {
    slug: 'current-ratio-calculator',
    title: 'Current Ratio (Liquidity) Calculator',
    category: 'business-accounting',
    formulaDisplay: 'Current Ratio = Current Assets / Current Liabilities',
    inputs: [
      { id: 'assets', label: 'Current Assets ($)', defaultValue: 250000, type: 'number', step: 5000, unit: '$' },
      { id: 'liabs', label: 'Current Liabilities ($)', defaultValue: 125000, type: 'number', min: 1, step: 5000, unit: '$' },
    ],
    calculate: (v) => {
      const a = Number(v.assets) || 0;
      const l = Number(v.liabs) || 1;
      const cr = a / l;
      return {
        primaryValue: parseFloat(cr.toFixed(2)),
        primaryUnit: ': 1',
        primaryLabel: 'Current Ratio',
        secondaryOutputs: [
          { label: 'Working Capital', value: \`$\${(a - l).toFixed(2)}\` },
          { label: 'Benchmark Status', value: cr >= 2.0 ? 'Strong Liquidity' : (cr >= 1.0 ? 'Adequate' : 'Liquidity Risk') },
        ],
        steps: [\`Current Ratio = $\${a} / $\${l} = \${cr.toFixed(2)}\`],
        formulaUsed: 'CR = Current Assets / Current Liabilities',
      };
    },
  },
  {
    slug: 'quick-ratio-calculator',
    title: 'Quick Ratio (Acid-Test) Calculator',
    category: 'business-accounting',
    formulaDisplay: 'Quick Ratio = (Cash + Marketable Securities + Receivables) / Current Liabilities',
    inputs: [
      { id: 'cash', label: 'Cash & Equivalents ($)', defaultValue: 60000, type: 'number', step: 2500, unit: '$' },
      { id: 'ar', label: 'Accounts Receivable ($)', defaultValue: 50000, type: 'number', step: 2500, unit: '$' },
      { id: 'liabs', label: 'Current Liabilities ($)', defaultValue: 90000, type: 'number', min: 1, step: 2500, unit: '$' },
    ],
    calculate: (v) => {
      const cash = Number(v.cash) || 0;
      const ar = Number(v.ar) || 0;
      const l = Number(v.liabs) || 1;
      const qr = (cash + ar) / l;
      return {
        primaryValue: parseFloat(qr.toFixed(2)),
        primaryUnit: ': 1',
        primaryLabel: 'Acid-Test / Quick Ratio',
        secondaryOutputs: [
          { label: 'Liquid Buffer', value: \`$\${(cash + ar).toFixed(2)}\` },
          { label: 'Benchmark', value: qr >= 1.0 ? 'Healthy (≥ 1.0)' : 'Tight Acid-Test' },
        ],
        steps: [\`Quick Assets = $\${cash} + $\${ar} = $\${cash + ar}\`, \`Quick Ratio = $\${cash + ar} / $\${l} = \${qr.toFixed(2)}\`],
        formulaUsed: 'QR = (Cash + Marketable Sec + AR) / CL',
      };
    },
  },
  {
    slug: 'debt-to-equity-calculator',
    title: 'Debt-to-Equity (D/E) Ratio Calculator',
    category: 'business-accounting',
    formulaDisplay: 'D/E = Total Liabilities / Total Shareholders Equity',
    inputs: [
      { id: 'debt', label: 'Total Debt / Liabilities ($)', defaultValue: 400000, type: 'number', step: 10000, unit: '$' },
      { id: 'equity', label: 'Total Shareholder Equity ($)', defaultValue: 250000, type: 'number', min: 1, step: 10000, unit: '$' },
    ],
    calculate: (v) => {
      const d = Number(v.debt) || 0;
      const e = Number(v.equity) || 1;
      const de = d / e;
      return {
        primaryValue: parseFloat(de.toFixed(2)),
        primaryUnit: 'x',
        primaryLabel: 'Debt-to-Equity Ratio',
        secondaryOutputs: [
          { label: 'Financial Leverage Status', value: de > 2.0 ? 'High Leverage' : 'Moderate / Conservative' },
          { label: 'Total Assets (Debt + Equity)', value: \`$\${(d + e).toFixed(2)}\` },
        ],
        steps: [\`D/E = $\${d} / $\${e} = \${de.toFixed(2)}\`],
        formulaUsed: 'D/E = Total Liabilities / Total Equity',
      };
    },
  },
  {
    slug: 'break-even-sales-calculator',
    title: 'Break-Even Sales Revenue Calculator',
    category: 'business-accounting',
    formulaDisplay: 'Sales = Fixed Costs / Contribution Margin Ratio',
    inputs: [
      { id: 'fixed', label: 'Fixed Costs ($)', defaultValue: 60000, type: 'number', step: 2500, unit: '$' },
      { id: 'cmRatio', label: 'Contribution Margin Ratio (%)', defaultValue: 40, type: 'number', min: 1, step: 1, unit: '%' },
    ],
    calculate: (v) => {
      const fc = Number(v.fixed) || 0;
      const cmr = (Number(v.cmRatio) || 1) / 100;
      const sales = fc / cmr;
      return {
        primaryValue: parseFloat(sales.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: 'Break-Even Sales Revenue',
        secondaryOutputs: [
          { label: 'Fixed Overhead', value: \`$\${fc.toFixed(2)}\` },
          { label: 'Variable Cost Ratio', value: \`\${((1 - cmr) * 100).toFixed(1)}%\` },
        ],
        steps: [\`Break-Even Sales = $\${fc} / \${cmr} = $\${sales.toFixed(2)}\`],
        formulaUsed: 'BEP = Fixed Costs / CM Ratio',
      };
    },
  },
  {
    slug: 'roa-calculator',
    title: 'ROA (Return on Assets) Calculator',
    category: 'business-accounting',
    formulaDisplay: 'ROA = (Net Income / Total Assets) × 100',
    inputs: [
      { id: 'income', label: 'Annual Net Income ($)', defaultValue: 75000, type: 'number', step: 2500, unit: '$' },
      { id: 'assets', label: 'Average Total Assets ($)', defaultValue: 650000, type: 'number', min: 1, step: 10000, unit: '$' },
    ],
    calculate: (v) => {
      const ni = Number(v.income) || 0;
      const a = Number(v.assets) || 1;
      const roa = (ni / a) * 100;
      return {
        primaryValue: parseFloat(roa.toFixed(2)),
        primaryUnit: '%',
        primaryLabel: 'Return on Assets (ROA)',
        secondaryOutputs: [
          { label: 'Net Income', value: \`$\${ni.toFixed(2)}\` },
          { label: 'Asset Base', value: \`$\${a.toFixed(2)}\` },
        ],
        steps: [\`ROA = ($\${ni} / $\${a}) × 100 = \${roa.toFixed(2)}%\`],
        formulaUsed: 'ROA = Net Income / Total Assets',
      };
    },
  },
  {
    slug: 'roe-calculator',
    title: 'ROE (Return on Equity) Calculator',
    category: 'business-accounting',
    formulaDisplay: 'ROE = (Net Income / Shareholders Equity) × 100',
    inputs: [
      { id: 'income', label: 'Annual Net Income ($)', defaultValue: 90000, type: 'number', step: 2500, unit: '$' },
      { id: 'equity', label: 'Average Shareholders Equity ($)', defaultValue: 450000, type: 'number', min: 1, step: 10000, unit: '$' },
    ],
    calculate: (v) => {
      const ni = Number(v.income) || 0;
      const eq = Number(v.equity) || 1;
      const roe = (ni / eq) * 100;
      return {
        primaryValue: parseFloat(roe.toFixed(2)),
        primaryUnit: '%',
        primaryLabel: 'Return on Equity (ROE)',
        secondaryOutputs: [
          { label: 'DuPont Benchmark', value: roe > 15 ? 'Above Market Average' : 'Moderate ROE' },
        ],
        steps: [\`ROE = ($\${ni} / $\${eq}) × 100 = \${roe.toFixed(2)}%\`],
        formulaUsed: 'ROE = Net Income / Equity',
      };
    },
  },
  {
    slug: 'customer-lifetime-value-calculator',
    title: 'Customer Lifetime Value (LTV / CLV) Calculator',
    category: 'business-accounting',
    formulaDisplay: 'CLV = Average Purchase Value × Frequency × Customer Lifespan',
    inputs: [
      { id: 'avgOrder', label: 'Average Order Value ($)', defaultValue: 75, type: 'number', step: 5, unit: '$' },
      { id: 'freq', label: 'Annual Purchase Frequency (orders/yr)', defaultValue: 4, type: 'number', step: 0.5 },
      { id: 'lifespan', label: 'Average Customer Lifespan (Years)', defaultValue: 3.5, type: 'number', step: 0.5, unit: 'years' },
      { id: 'margin', label: 'Gross Margin %', defaultValue: 65, type: 'number', step: 1, unit: '%' },
    ],
    calculate: (v) => {
      const aov = Number(v.avgOrder) || 0;
      const f = Number(v.freq) || 1;
      const t = Number(v.lifespan) || 1;
      const m = (Number(v.margin) || 100) / 100;
      const grossClv = aov * f * t;
      const netClv = grossClv * m;
      return {
        primaryValue: parseFloat(netClv.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: 'Net Customer Lifetime Value (CLV)',
        secondaryOutputs: [
          { label: 'Gross Revenue per Customer', value: \`$\${grossClv.toFixed(2)}\` },
          { label: 'Annual Revenue per Customer', value: \`$\${(aov * f).toFixed(2)}\` },
        ],
        steps: [\`Gross CLV = $\${aov} × \${f} orders × \${t} years = $\${grossClv.toFixed(2)}\`, \`Net CLV (at \${m * 100}% margin) = $\${netClv.toFixed(2)}\`],
        formulaUsed: 'CLV = AOV × Frequency × Lifespan × Margin',
      };
    },
  },
  {
    slug: 'cac-calculator',
    title: 'Customer Acquisition Cost (CAC) Calculator',
    category: 'business-accounting',
    formulaDisplay: 'CAC = Total Sales & Marketing Spend / Customers Acquired',
    inputs: [
      { id: 'spend', label: 'Total Marketing & Sales Spend ($)', defaultValue: 45000, type: 'number', step: 1000, unit: '$' },
      { id: 'customers', label: 'New Customers Acquired', defaultValue: 300, type: 'number', min: 1, step: 10 },
    ],
    calculate: (v) => {
      const spend = Number(v.spend) || 0;
      const cust = Number(v.customers) || 1;
      const cac = spend / cust;
      return {
        primaryValue: parseFloat(cac.toFixed(2)),
        primaryUnit: '$ / customer',
        primaryLabel: 'Blended CAC',
        secondaryOutputs: [
          { label: 'Total Growth Spend', value: \`$\${spend.toFixed(2)}\` },
          { label: 'New Customer Volume', value: cust },
        ],
        steps: [\`CAC = $\${spend} / \${cust} = $\${cac.toFixed(2)}\`],
        formulaUsed: 'CAC = Acquisition Budget / New Customers',
      };
    },
  },
  {
    slug: 'churn-rate-calculator',
    title: 'Customer Churn Rate Calculator',
    category: 'business-accounting',
    formulaDisplay: 'Churn Rate = (Customers Lost / Starting Customers) × 100',
    inputs: [
      { id: 'startCust', label: 'Customers at Start of Period', defaultValue: 1200, type: 'number', min: 1, step: 25 },
      { id: 'lostCust', label: 'Customers Churned / Cancelled', defaultValue: 48, type: 'number', min: 0, step: 1 },
    ],
    calculate: (v) => {
      const start = Number(v.startCust) || 1;
      const lost = Number(v.lostCust) || 0;
      const churn = (lost / start) * 100;
      const retention = 100 - churn;
      const avgLifespanMonths = churn > 0 ? (1 / (churn / 100)) : 0;
      return {
        primaryValue: parseFloat(churn.toFixed(2)),
        primaryUnit: '%',
        primaryLabel: 'Periodic Churn Rate',
        secondaryOutputs: [
          { label: 'Retention Rate', value: \`\${retention.toFixed(2)}%\` },
          { label: 'Implied Customer Lifespan', value: avgLifespanMonths > 0 ? \`\${avgLifespanMonths.toFixed(1)} periods\` : 'Infinite' },
        ],
        steps: [\`Churn % = (\${lost} / \${start}) × 100 = \${churn.toFixed(2)}%\`],
        formulaUsed: 'Churn = (Lost / Starting) × 100',
      };
    },
  },
  {
    slug: 'ebitda-calculator',
    title: 'EBITDA Calculator',
    category: 'business-accounting',
    formulaDisplay: 'EBITDA = Operating Profit + Depreciation + Amortization',
    inputs: [
      { id: 'ebit', label: 'Operating Income / EBIT ($)', defaultValue: 180000, type: 'number', step: 5000, unit: '$' },
      { id: 'deprec', label: 'Depreciation Expense ($)', defaultValue: 25000, type: 'number', step: 1000, unit: '$' },
      { id: 'amort', label: 'Amortization Expense ($)', defaultValue: 15000, type: 'number', step: 1000, unit: '$' },
    ],
    calculate: (v) => {
      const ebit = Number(v.ebit) || 0;
      const dep = Number(v.deprec) || 0;
      const amort = Number(v.amort) || 0;
      const ebitda = ebit + dep + amort;
      return {
        primaryValue: parseFloat(ebitda.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: 'EBITDA',
        secondaryOutputs: [
          { label: 'EBIT (Operating Profit)', value: \`$\${ebit.toFixed(2)}\` },
          { label: 'Total Non-Cash D&A', value: \`$\${(dep + amort).toFixed(2)}\` },
        ],
        steps: [\`EBITDA = $\${ebit} + $\${dep} + $\${amort} = $\${ebitda.toFixed(2)}\`],
        formulaUsed: 'EBITDA = EBIT + D&A',
      };
    },
  },
  {
    slug: 'depreciation-calculator',
    title: 'Straight-Line Depreciation Calculator',
    category: 'business-accounting',
    formulaDisplay: 'Annual Depreciation = (Cost - Salvage Value) / Useful Life',
    inputs: [
      { id: 'cost', label: 'Asset Purchase Cost ($)', defaultValue: 40000, type: 'number', step: 1000, unit: '$' },
      { id: 'salvage', label: 'Estimated Salvage Value ($)', defaultValue: 5000, type: 'number', step: 500, unit: '$' },
      { id: 'life', label: 'Useful Life (Years)', defaultValue: 7, type: 'number', min: 1, step: 1, unit: 'years' },
    ],
    calculate: (v) => {
      const cost = Number(v.cost) || 0;
      const salvage = Number(v.salvage) || 0;
      const life = Number(v.life) || 1;
      const depreciableBase = Math.max(0, cost - salvage);
      const annualDep = depreciableBase / life;
      const monthlyDep = annualDep / 12;
      return {
        primaryValue: parseFloat(annualDep.toFixed(2)),
        primaryUnit: '$ / year',
        primaryLabel: 'Annual Depreciation',
        secondaryOutputs: [
          { label: 'Monthly Depreciation', value: \`$\${monthlyDep.toFixed(2)}\` },
          { label: 'Depreciable Cost Basis', value: \`$\${depreciableBase.toFixed(2)}\` },
          { label: 'Depreciation Rate', value: \`\${((1 / life) * 100).toFixed(1)}% per year\` },
        ],
        steps: [\`Depreciation = ($\${cost} - $\${salvage}) / \${life} = $\${annualDep.toFixed(2)}/yr\`],
        formulaUsed: 'SL Depreciation = (Cost - Salvage) / Life',
      };
    },
  },
  {
    slug: 'dcf-calculator',
    title: 'DCF (Discounted Cash Flow) Valuation Calculator',
    category: 'business-accounting',
    formulaDisplay: 'Enterprise Value = Σ [FCF_t / (1+WACC)^t] + Terminal Value',
    inputs: [
      { id: 'year1Fcf', label: 'Year 1 Free Cash Flow ($)', defaultValue: 100000, type: 'number', step: 5000, unit: '$' },
      { id: 'growthRate', label: '5-Year FCF Growth Rate (%)', defaultValue: 8, type: 'number', step: 0.5, unit: '%' },
      { id: 'wacc', label: 'Discount Rate / WACC (%)', defaultValue: 10, type: 'number', step: 0.5, unit: '%' },
      { id: 'terminalGrowth', label: 'Terminal Perpetuity Growth (%)', defaultValue: 2.5, type: 'number', step: 0.25, unit: '%' },
    ],
    calculate: (v) => {
      const fcf1 = Number(v.year1Fcf) || 100000;
      const g = (Number(v.growthRate) || 0) / 100;
      const wacc = (Number(v.wacc) || 10) / 100;
      const tg = (Number(v.terminalGrowth) || 2.5) / 100;
      if (wacc <= tg) return { primaryValue: 'Error', primaryLabel: 'WACC must exceed Terminal Growth', error: 'WACC must be > Terminal Growth.' };
      let pvFcf = 0;
      let currFcf = fcf1;
      for (let t = 1; t <= 5; t++) {
        if (t > 1) currFcf *= (1 + g);
        pvFcf += currFcf / Math.pow(1 + wacc, t);
      }
      const terminalVal = (currFcf * (1 + tg)) / (wacc - tg);
      const pvTerminal = terminalVal / Math.pow(1 + wacc, 5);
      const enterpriseVal = pvFcf + pvTerminal;
      return {
        primaryValue: parseFloat(enterpriseVal.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: 'Estimated DCF Fair Value',
        secondaryOutputs: [
          { label: 'PV of 5-Year Cashflows', value: \`$\${pvFcf.toFixed(2)}\` },
          { label: 'PV of Terminal Value', value: \`$\${pvTerminal.toFixed(2)}\` },
          { label: 'Terminal Value % of Total', value: \`\${((pvTerminal / enterpriseVal) * 100).toFixed(1)}%\` },
        ],
        steps: [\`Summed 5-year explicit cashflows + Gordon Growth Terminal Value discounted at \${wacc * 100}% WACC.\`],
        formulaUsed: 'Discounted Cash Flow Two-Stage Model',
      };
    },
  },
  {
    slug: 'eoq-calculator',
    title: 'EOQ (Economic Order Quantity) Calculator',
    category: 'business-accounting',
    formulaDisplay: 'EOQ = √[(2 × D × S) / H]',
    inputs: [
      { id: 'demand', label: 'Annual Demand in Units (D)', defaultValue: 10000, type: 'number', min: 1, step: 100 },
      { id: 'orderCost', label: 'Fixed Order / Setup Cost (S) ($)', defaultValue: 50, type: 'number', min: 0.1, step: 5, unit: '$' },
      { id: 'holdingCost', label: 'Annual Holding Cost per Unit (H) ($)', defaultValue: 4, type: 'number', min: 0.01, step: 0.5, unit: '$' },
    ],
    calculate: (v) => {
      const d = Number(v.demand) || 1;
      const s = Number(v.orderCost) || 1;
      const h = Number(v.holdingCost) || 1;
      const eoq = Math.sqrt((2 * d * s) / h);
      const ordersPerYear = d / eoq;
      const totalInventoryCost = (d / eoq) * s + (eoq / 2) * h;
      return {
        primaryValue: Math.round(eoq),
        primaryUnit: 'units per order',
        primaryLabel: 'Optimal Economic Order Quantity',
        secondaryOutputs: [
          { label: 'Annual Orders Placed', value: parseFloat(ordersPerYear.toFixed(1)) },
          { label: 'Total Annual Inventory Carrying Cost', value: \`$\${totalInventoryCost.toFixed(2)}\` },
        ],
        steps: [\`EOQ = √[(2 × \${d} × \${s}) / \${h}] = \${Math.round(eoq)} units\`],
        formulaUsed: 'Ford W. Harris EOQ Optimization',
      };
    },
  },
  {
    slug: 'working-capital-calculator',
    title: 'Net Working Capital (NWC) Calculator',
    category: 'business-accounting',
    formulaDisplay: 'NWC = Current Assets - Current Liabilities',
    inputs: [
      { id: 'assets', label: 'Current Assets ($)', defaultValue: 320000, type: 'number', step: 10000, unit: '$' },
      { id: 'liabilities', label: 'Current Liabilities ($)', defaultValue: 190000, type: 'number', step: 10000, unit: '$' },
    ],
    calculate: (v) => {
      const a = Number(v.assets) || 0;
      const l = Number(v.liabilities) || 0;
      const nwc = a - l;
      const cr = l > 0 ? (a / l).toFixed(2) : 'N/A';
      return {
        primaryValue: parseFloat(nwc.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: 'Net Working Capital (NWC)',
        secondaryOutputs: [
          { label: 'Current Ratio Equivalent', value: \`\${cr} : 1\` },
          { label: 'Net Working Capital Buffer', value: nwc > 0 ? 'Positive Liquidity' : 'Working Capital Deficit' },
        ],
        steps: [\`NWC = $\${a} - $\${l} = $\${nwc}\`],
        formulaUsed: 'NWC = Current Assets - Current Liabilities',
      };
    },
  },

  // TAX
  {
    slug: 'income-tax-calculator',
    title: 'US Federal Income Tax Calculator (2024)',
    category: 'tax',
    formulaDisplay: 'Progressive US Federal Brackets (10%, 12%, 22%, 24%, 32%, 35%, 37%)',
    inputs: [
      { id: 'grossIncome', label: 'Annual Gross Income ($)', defaultValue: 85000, type: 'number', step: 2500, unit: '$' },
      {
        id: 'filingStatus',
        label: 'Filing Status',
        type: 'select',
        defaultValue: 'single',
        options: [
          { label: 'Single ($14,600 Standard Deduction)', value: 'single' },
          { label: 'Married Filing Jointly ($29,200 Std Deduction)', value: 'mfj' },
          { label: 'Head of Household ($21,900 Std Deduction)', value: 'hoh' },
        ],
      },
    ],
    calculate: (v) => {
      const gross = Number(v.grossIncome) || 0;
      const status = v.filingStatus || 'single';
      const stdDed = status === 'mfj' ? 29200 : (status === 'hoh' ? 21900 : 14600);
      const taxable = Math.max(0, gross - stdDed);
      // Single tax brackets 2024
      const brackets = status === 'mfj'
        ? [[23200, 0.10], [94300, 0.12], [201050, 0.22], [383900, 0.24], [487450, 0.32], [731200, 0.35], [Infinity, 0.37]]
        : [[11600, 0.10], [47150, 0.12], [100525, 0.22], [191950, 0.24], [243725, 0.32], [609350, 0.35], [Infinity, 0.37]];
      let tax = 0;
      let prevLimit = 0;
      for (const [limit, rate] of brackets) {
        if (taxable > prevLimit) {
          const taxableInBracket = Math.min(taxable, limit) - prevLimit;
          tax += taxableInBracket * rate;
          prevLimit = limit;
        } else break;
      }
      const effectiveRate = gross > 0 ? (tax / gross) * 100 : 0;
      return {
        primaryValue: parseFloat(tax.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: 'Estimated Federal Income Tax',
        secondaryOutputs: [
          { label: 'Effective Tax Rate', value: \`\${effectiveRate.toFixed(2)}%\` },
          { label: 'Standard Deduction Claimed', value: \`$\${stdDed.toLocaleString()}\` },
          { label: 'Taxable Income Base', value: \`$\${taxable.toLocaleString()}\` },
        ],
        steps: [\`Taxable = Gross $\${gross} - Standard Deduction $\${stdDed} = $\${taxable}\`, \`Calculated across progressive brackets.\`],
        formulaUsed: '2024 IRS Progressive Tax Brackets',
      };
    },
  },
  {
    slug: 'sales-tax-calculator',
    title: 'Sales Tax & Total Price Calculator',
    category: 'tax',
    formulaDisplay: 'Tax Amount = Price × (Tax Rate / 100), Total = Price + Tax',
    inputs: [
      { id: 'price', label: 'Item / Subtotal Price ($)', defaultValue: 150, type: 'number', step: 5, unit: '$' },
      { id: 'rate', label: 'Sales Tax Rate (%)', defaultValue: 8.25, type: 'number', step: 0.25, unit: '%' },
    ],
    calculate: (v) => {
      const p = Number(v.price) || 0;
      const r = (Number(v.rate) || 0) / 100;
      const tax = p * r;
      const total = p + tax;
      return {
        primaryValue: parseFloat(total.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: 'Total Price (Including Tax)',
        secondaryOutputs: [
          { label: 'Sales Tax Amount', value: \`$\${tax.toFixed(2)}\` },
          { label: 'Pre-Tax Subtotal', value: \`$\${p.toFixed(2)}\` },
        ],
        steps: [\`Tax = $\${p} × \${r * 100}% = $\${tax.toFixed(2)}\`, \`Total = $\${p} + $\${tax.toFixed(2)} = $\${total.toFixed(2)}\`],
        formulaUsed: 'Tax = Price × Rate',
      };
    },
  },
  {
    slug: 'capital-gains-tax-calculator',
    title: 'Capital Gains Tax Calculator',
    category: 'tax',
    formulaDisplay: 'Tax = Capital Gain × Applicable Bracket (0%, 15%, 20%)',
    inputs: [
      { id: 'gain', label: 'Net Capital Gain ($)', defaultValue: 35000, type: 'number', step: 1000, unit: '$' },
      {
        id: 'term',
        label: 'Holding Horizon',
        type: 'select',
        defaultValue: 'long',
        options: [
          { label: 'Long-Term (> 1 year, 15% standard rate)', value: 'long' },
          { label: 'Short-Term (≤ 1 year, Ordinary income ~24%)', value: 'short' },
        ],
      },
      { id: 'otherIncome', label: 'Other Annual Income ($)', defaultValue: 75000, type: 'number', step: 5000, unit: '$' },
    ],
    calculate: (v) => {
      const gain = Number(v.gain) || 0;
      const isLong = v.term === 'long';
      const taxRate = isLong ? 0.15 : 0.24;
      const tax = gain * taxRate;
      return {
        primaryValue: parseFloat(tax.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: 'Estimated Capital Gains Tax',
        secondaryOutputs: [
          { label: 'Effective Tax Rate on Gain', value: \`\${(taxRate * 100).toFixed(0)}%\` },
          { label: 'After-Tax Net Gain', value: \`$\${(gain - tax).toFixed(2)}\` },
        ],
        steps: [\`\${isLong ? 'Long-term' : 'Short-term'} rate of \${taxRate * 100}% applied to $\${gain} gain.\`],
        formulaUsed: 'IRS Capital Gains Rates',
      };
    },
  },
  {
    slug: 'self-employment-tax-calculator',
    title: 'Self-Employment Tax (SECA) Calculator',
    category: 'tax',
    formulaDisplay: 'SE Tax = Net Earnings × 92.35% × 15.3%',
    inputs: [
      { id: 'netEarnings', label: 'Net Self-Employment Business Income ($)', defaultValue: 80000, type: 'number', step: 2500, unit: '$' },
    ],
    calculate: (v) => {
      const net = Number(v.netEarnings) || 0;
      const taxableBase = net * 0.9235;
      const ssCap = 168600; // 2024 Social security wage base
      const ssTax = Math.min(taxableBase, ssCap) * 0.124; // 12.4% Social Security
      const medTax = taxableBase * 0.029; // 2.9% Medicare
      const totalSeTax = ssTax + medTax;
      const deductibleHalf = totalSeTax / 2;
      return {
        primaryValue: parseFloat(totalSeTax.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: 'Total Self-Employment Tax',
        secondaryOutputs: [
          { label: '12.4% Social Security Portion', value: \`$\${ssTax.toFixed(2)}\` },
          { label: '2.9% Medicare Portion', value: \`$\${medTax.toFixed(2)}\` },
          { label: 'Above-the-Line 50% Tax Deduction', value: \`$\${deductibleHalf.toFixed(2)}\` },
        ],
        steps: [\`Adjusted base = $\${net} × 92.35% = $\${taxableBase.toFixed(2)}\`, \`SE Tax = 15.3% on adjusted earnings\`],
        formulaUsed: 'SECA 15.3% Self-Employment Tax',
      };
    },
  },
  {
    slug: 'fica-tax-calculator',
    title: 'FICA Payroll Tax Calculator',
    category: 'tax',
    formulaDisplay: 'FICA = 6.2% Social Security + 1.45% Medicare',
    inputs: [
      { id: 'grossWages', label: 'Annual Gross Wages ($)', defaultValue: 95000, type: 'number', step: 2500, unit: '$' },
    ],
    calculate: (v) => {
      const gross = Number(v.grossWages) || 0;
      const ss = Math.min(gross, 168600) * 0.062;
      const med = gross * 0.0145;
      const addMed = gross > 200000 ? (gross - 200000) * 0.009 : 0;
      const totalFica = ss + med + addMed;
      return {
        primaryValue: parseFloat(totalFica.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: 'Employee FICA Tax Withheld',
        secondaryOutputs: [
          { label: 'Social Security (6.2%)', value: \`$\${ss.toFixed(2)}\` },
          { label: 'Medicare (1.45%)', value: \`$\${med.toFixed(2)}\` },
        ],
        steps: [\`Social Security: 6.2% up to $168,600 wage base\`, \`Medicare: 1.45% un-capped\`],
        formulaUsed: 'FICA Federal Insurance Contributions Act',
      };
    },
  },
  {
    slug: 'property-tax-calculator',
    title: 'Property Tax & Millage Rate Calculator',
    category: 'tax',
    formulaDisplay: 'Tax = (Assessed Value × Millage Rate) / 1000',
    inputs: [
      { id: 'assessedVal', label: 'Assessed Property Value ($)', defaultValue: 380000, type: 'number', step: 5000, unit: '$' },
      { id: 'taxRatePct', label: 'Annual Property Tax Rate (%)', defaultValue: 1.25, type: 'number', step: 0.05, unit: '%' },
    ],
    calculate: (v) => {
      const val = Number(v.assessedVal) || 0;
      const r = (Number(v.taxRatePct) || 0) / 100;
      const annual = val * r;
      const monthly = annual / 12;
      return {
        primaryValue: parseFloat(annual.toFixed(2)),
        primaryUnit: '$ / yr',
        primaryLabel: 'Annual Property Tax',
        secondaryOutputs: [
          { label: 'Monthly Escrow Property Tax', value: \`$\${monthly.toFixed(2)}\` },
          { label: 'Millage Rate Equivalent', value: parseFloat((r * 1000).toFixed(2)) + ' mills' },
        ],
        steps: [\`Annual Tax = $\${val} × \${r * 100}% = $\${annual.toFixed(2)}\`],
        formulaUsed: 'Tax = Assessed Value × Millage Rate',
      };
    },
  },
  {
    slug: 'vat-calculator',
    title: 'VAT (Value-Added Tax) Calculator',
    category: 'tax',
    formulaDisplay: 'Gross = Net × (1 + VAT Rate)',
    inputs: [
      { id: 'netPrice', label: 'Net Amount (Excluding VAT) ($)', defaultValue: 200, type: 'number', step: 10, unit: '$' },
      { id: 'vatRate', label: 'VAT Rate (%)', defaultValue: 20, type: 'number', step: 0.5, unit: '%' },
    ],
    calculate: (v) => {
      const net = Number(v.netPrice) || 0;
      const r = (Number(v.vatRate) || 0) / 100;
      const vat = net * r;
      const gross = net + vat;
      return {
        primaryValue: parseFloat(gross.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: 'Gross Price (VAT Included)',
        secondaryOutputs: [
          { label: 'VAT Amount', value: \`$\${vat.toFixed(2)}\` },
          { label: 'Net Subtotal', value: \`$\${net.toFixed(2)}\` },
        ],
        steps: [\`VAT = $\${net} × \${r * 100}% = $\${vat.toFixed(2)}\`, \`Total = $\${net} + $\${vat.toFixed(2)} = $\${gross.toFixed(2)}\`],
        formulaUsed: 'Gross = Net × (1 + VAT)',
      };
    },
  },
  {
    slug: 'reverse-vat-calculator',
    title: 'Reverse VAT (Extract Net from Gross) Calculator',
    category: 'tax',
    formulaDisplay: 'Net = Gross / (1 + VAT Rate)',
    inputs: [
      { id: 'grossPrice', label: 'Gross Amount (VAT Included) ($)', defaultValue: 240, type: 'number', step: 10, unit: '$' },
      { id: 'vatRate', label: 'VAT Rate (%)', defaultValue: 20, type: 'number', step: 0.5, unit: '%' },
    ],
    calculate: (v) => {
      const gross = Number(v.grossPrice) || 0;
      const r = (Number(v.vatRate) || 0) / 100;
      const net = gross / (1 + r);
      const vat = gross - net;
      return {
        primaryValue: parseFloat(net.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: 'Net Amount (Pre-VAT)',
        secondaryOutputs: [
          { label: 'Extracted VAT Amount', value: \`$\${vat.toFixed(2)}\` },
        ],
        steps: [\`Net = $\${gross} / (1 + \${r}) = $\${net.toFixed(2)}\`, \`VAT portion = $\${gross} - $\${net.toFixed(2)} = $\${vat.toFixed(2)}\`],
        formulaUsed: 'Net = Gross / (1 + r)',
      };
    },
  },
  {
    slug: 'corporate-tax-calculator',
    title: 'Corporate Income Tax Calculator',
    category: 'tax',
    formulaDisplay: 'Corporate Tax = Taxable Net Profit × 21% (US Flat Rate)',
    inputs: [
      { id: 'taxableProfit', label: 'Taxable Corporate Net Profit ($)', defaultValue: 500000, type: 'number', step: 25000, unit: '$' },
      { id: 'stateRate', label: 'State Corporate Tax Rate (%)', defaultValue: 6.5, type: 'number', step: 0.5, unit: '%' },
    ],
    calculate: (v) => {
      const profit = Number(v.taxableProfit) || 0;
      const fedRate = 0.21; // US TCJA flat corporate rate
      const stateRate = (Number(v.stateRate) || 0) / 100;
      const fedTax = profit * fedRate;
      const stateTax = profit * stateRate;
      const totalTax = fedTax + stateTax;
      return {
        primaryValue: parseFloat(totalTax.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: 'Total Corporate Tax Liability',
        secondaryOutputs: [
          { label: 'Federal Corporate Tax (21%)', value: \`$\${fedTax.toFixed(2)}\` },
          { label: 'State Corporate Tax', value: \`$\${stateTax.toFixed(2)}\` },
          { label: 'After-Tax Net Retained Earnings', value: \`$\${(profit - totalTax).toFixed(2)}\` },
        ],
        steps: [\`Federal (21%) = $\${fedTax.toFixed(2)}\`, \`State (\${stateRate * 100}%) = $\${stateTax.toFixed(2)}\`],
        formulaUsed: 'Corporate Tax = Profit × (Federal + State)',
      };
    },
  },
  {
    slug: 'estate-tax-calculator',
    title: 'Estate Tax Exemption Calculator',
    category: 'tax',
    formulaDisplay: 'Tax = (Estate - Exemption Limit) × 40%',
    inputs: [
      { id: 'estateVal', label: 'Gross Estate Fair Market Value ($)', defaultValue: 15000000, type: 'number', step: 250000, unit: '$' },
      { id: 'exemption', label: 'Estate Tax Lifetime Exemption ($)', defaultValue: 13610000, type: 'number', step: 100000, unit: '$' },
    ],
    calculate: (v) => {
      const estate = Number(v.estateVal) || 0;
      const ex = Number(v.exemption) || 13610000;
      const taxable = Math.max(0, estate - ex);
      const tax = taxable * 0.40;
      return {
        primaryValue: parseFloat(tax.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: 'Estimated Federal Estate Tax',
        secondaryOutputs: [
          { label: 'Taxable Excess Over Exemption', value: \`$\${taxable.toLocaleString()}\` },
          { label: 'Statutory Rate', value: '40% Top Marginal Bracket' },
        ],
        steps: [\`Taxable = $\${estate.toLocaleString()} - $\${ex.toLocaleString()} = $\${taxable.toLocaleString()}\`],
        formulaUsed: 'Federal Estate Tax Exemption Bracket',
      };
    },
  },
  {
    slug: 'deduction-comparison-calculator',
    title: 'Standard vs Itemized Deductions Comparison',
    category: 'tax',
    formulaDisplay: 'Optimal Deduction = max(Standard, Itemized Total)',
    inputs: [
      { id: 'standard', label: 'Standard Deduction Allowed ($)', defaultValue: 14600, type: 'number', step: 500, unit: '$' },
      { id: 'mortgageInterest', label: 'Mortgage Interest ($)', defaultValue: 8500, type: 'number', step: 500, unit: '$' },
      { id: 'salt', label: 'State & Local Taxes (SALT capped at $10k) ($)', defaultValue: 10000, type: 'number', max: 10000, step: 500, unit: '$' },
      { id: 'charity', label: 'Charitable Contributions ($)', defaultValue: 3000, type: 'number', step: 500, unit: '$' },
    ],
    calculate: (v) => {
      const std = Number(v.standard) || 14600;
      const mort = Number(v.mortgageInterest) || 0;
      const salt = Math.min(10000, Number(v.salt) || 0);
      const charity = Number(v.charity) || 0;
      const itemized = mort + salt + charity;
      const winner = itemized > std ? 'Itemized Deductions' : 'Standard Deduction';
      const maxDed = Math.max(std, itemized);
      return {
        primaryValue: parseFloat(maxDed.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: \`Optimal Deduction Choice (\${winner})\`,
        secondaryOutputs: [
          { label: 'Total Itemized Deductions', value: \`$\${itemized.toFixed(2)}\` },
          { label: 'Standard Deduction Benchmark', value: \`$\${std.toFixed(2)}\` },
          { label: 'Tax Shield Advantage', value: \`+$\${Math.abs(itemized - std).toFixed(2)}\` },
        ],
        steps: [\`Itemized = $\${mort} + $\${salt} + $\${charity} = $\${itemized}\`, \`Selected larger amount: $\${maxDed}\`],
        formulaUsed: 'Max(Standard Deduction, Itemized Deductions)',
      };
    },
  },
  {
    slug: 'tax-refund-calculator',
    title: 'Tax Refund / Balance Due Estimator',
    category: 'tax',
    formulaDisplay: 'Refund = Total Taxes Withheld - Total Tax Liability',
    inputs: [
      { id: 'withheld', label: 'Total Federal Taxes Withheld on W-2 ($)', defaultValue: 14500, type: 'number', step: 500, unit: '$' },
      { id: 'liability', label: 'Actual Final Tax Liability ($)', defaultValue: 12200, type: 'number', step: 500, unit: '$' },
    ],
    calculate: (v) => {
      const w = Number(v.withheld) || 0;
      const l = Number(v.liability) || 0;
      const diff = w - l;
      return {
        primaryValue: parseFloat(Math.abs(diff).toFixed(2)),
        primaryUnit: '$',
        primaryLabel: diff >= 0 ? 'Expected Tax Refund' : 'Tax Balance Owed to IRS',
        secondaryOutputs: [
          { label: 'Status', value: diff >= 0 ? 'Tax Refund Due to You' : 'Underpayment Penalty / Tax Due' },
          { label: 'Total Withholdings', value: \`$\${w.toFixed(2)}\` },
          { label: 'Total Calculated Tax', value: \`$\${l.toFixed(2)}\` },
        ],
        steps: [\`$\${w} withheld - $\${l} liability = $\${diff.toFixed(2)}\`],
        formulaUsed: 'Refund = Withholding - Liability',
      };
    },
  },
  {
    slug: 'state-tax-calculator',
    title: 'State Income Tax Estimator',
    category: 'tax',
    formulaDisplay: 'Tax = Taxable Income × State Marginal Rate',
    inputs: [
      { id: 'taxable', label: 'State Taxable Income ($)', defaultValue: 75000, type: 'number', step: 2500, unit: '$' },
      { id: 'rate', label: 'Average State Tax Rate (%)', defaultValue: 5.25, type: 'number', step: 0.25, unit: '%' },
    ],
    calculate: (v) => {
      const inc = Number(v.taxable) || 0;
      const r = (Number(v.rate) || 0) / 100;
      const tax = inc * r;
      return {
        primaryValue: parseFloat(tax.toFixed(2)),
        primaryUnit: '$ / yr',
        primaryLabel: 'Estimated State Income Tax',
        secondaryOutputs: [
          { label: 'Monthly State Tax', value: \`$\${(tax / 12).toFixed(2)}\` },
          { label: 'Effective Rate', value: \`\${(r * 100).toFixed(2)}%\` },
        ],
        steps: [\`State Tax = $\${inc} × \${r * 100}% = $\${tax.toFixed(2)}\`],
        formulaUsed: 'Tax = Income × Rate',
      };
    },
  },
  {
    slug: 'quarterly-tax-calculator',
    title: 'Quarterly Estimated Taxes (1040-ES) Calculator',
    category: 'tax',
    formulaDisplay: 'Quarterly Payment = Annual Estimated Tax / 4',
    inputs: [
      { id: 'annualExpectedTax', label: 'Total Estimated Annual Tax Liability ($)', defaultValue: 24000, type: 'number', step: 1000, unit: '$' },
      { id: 'w2Withholding', label: 'Any W-2 Employer Withholdings ($)', defaultValue: 4000, type: 'number', step: 500, unit: '$' },
    ],
    calculate: (v) => {
      const tax = Number(v.annualExpectedTax) || 0;
      const w2 = Number(v.w2Withholding) || 0;
      const remaining = Math.max(0, tax - w2);
      const quarterly = remaining / 4;
      return {
        primaryValue: parseFloat(quarterly.toFixed(2)),
        primaryUnit: '$ / quarter',
        primaryLabel: 'Quarterly Estimated Tax Payment',
        secondaryOutputs: [
          { label: 'Q1 Due Date: April 15', value: \`$\${quarterly.toFixed(2)}\` },
          { label: 'Q2 Due Date: June 15', value: \`$\${quarterly.toFixed(2)}\` },
          { label: 'Q3 Due Date: September 15', value: \`$\${quarterly.toFixed(2)}\` },
          { label: 'Q4 Due Date: January 15', value: \`$\${quarterly.toFixed(2)}\` },
        ],
        steps: [\`Remaining tax = $\${tax} - $\${w2} = $\${remaining}\`, \`Quarterly = $\${remaining} / 4 = $\${quarterly.toFixed(2)}\`],
        formulaUsed: 'Quarterly Payment = (Estimated Tax - W2) / 4',
      };
    },
  },
  {
    slug: 'taxable-income-calculator',
    title: 'Taxable Income Calculator',
    category: 'tax',
    formulaDisplay: 'Taxable Income = Gross Income - Pre-Tax Deductions - Standard/Itemized Deduction',
    inputs: [
      { id: 'gross', label: 'Gross Annual Salary ($)', defaultValue: 90000, type: 'number', step: 2500, unit: '$' },
      { id: 'hsa401k', label: 'Pre-Tax 401(k) / HSA / Health Deductions ($)', defaultValue: 8000, type: 'number', step: 500, unit: '$' },
      { id: 'stdDed', label: 'Standard Deduction ($)', defaultValue: 14600, type: 'number', step: 500, unit: '$' },
    ],
    calculate: (v) => {
      const gross = Number(v.gross) || 0;
      const pretax = Number(v.hsa401k) || 0;
      const ded = Number(v.stdDed) || 14600;
      const agi = Math.max(0, gross - pretax);
      const taxable = Math.max(0, agi - ded);
      return {
        primaryValue: parseFloat(taxable.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: 'Federal Taxable Income Base',
        secondaryOutputs: [
          { label: 'Adjusted Gross Income (AGI)', value: \`$\${agi.toFixed(2)}\` },
          { label: 'Total Pre-Tax Shield', value: \`$\${(pretax + ded).toFixed(2)}\` },
        ],
        steps: [\`AGI = $\${gross} - $\${pretax} = $\${agi}\`, \`Taxable = $\${agi} - $\${ded} = $\${taxable}\`],
        formulaUsed: 'Taxable Income = Gross - AboveLine - BelowLine',
      };
    },
  },

  // SALARY & WAGES
  {
    slug: 'hourly-to-salary-calculator',
    title: 'Hourly to Salary Wage Calculator',
    category: 'salary-wages',
    formulaDisplay: 'Annual Salary = Hourly Rate × Hours/Week × 52 Weeks',
    inputs: [
      { id: 'hourly', label: 'Hourly Pay Rate ($)', defaultValue: 35, type: 'number', step: 0.5, unit: '$/hr' },
      { id: 'hoursWeek', label: 'Hours Worked per Week', defaultValue: 40, type: 'number', step: 1, unit: 'hrs' },
      { id: 'weeksYear', label: 'Paid Weeks per Year', defaultValue: 52, type: 'number', step: 1, unit: 'weeks' },
    ],
    calculate: (v) => {
      const rate = Number(v.hourly) || 0;
      const hrs = Number(v.hoursWeek) || 40;
      const wks = Number(v.weeksYear) || 52;
      const annual = rate * hrs * wks;
      const monthly = annual / 12;
      const biweekly = annual / 26;
      return {
        primaryValue: parseFloat(annual.toFixed(2)),
        primaryUnit: '$ / yr',
        primaryLabel: 'Annual Salary Equivalent',
        secondaryOutputs: [
          { label: 'Monthly Equivalent', value: \`$\${monthly.toFixed(2)}\` },
          { label: 'Bi-Weekly Paycheck', value: \`$\${biweekly.toFixed(2)}\` },
          { label: 'Weekly Paycheck', value: \`$\${(rate * hrs).toFixed(2)}\` },
        ],
        steps: [\`Annual = $\${rate} × \${hrs} hrs × \${wks} weeks = $\${annual.toFixed(2)}\`],
        formulaUsed: 'Salary = Hourly × Hours/Week × Weeks',
      };
    },
  },
  {
    slug: 'salary-to-hourly-calculator',
    title: 'Salary to Hourly Rate Calculator',
    category: 'salary-wages',
    formulaDisplay: 'Hourly Rate = Annual Salary / (Hours/Week × 52)',
    inputs: [
      { id: 'salary', label: 'Annual Salary ($)', defaultValue: 75000, type: 'number', step: 2500, unit: '$' },
      { id: 'hoursWeek', label: 'Weekly Work Hours', defaultValue: 40, type: 'number', step: 1, unit: 'hrs' },
    ],
    calculate: (v) => {
      const sal = Number(v.salary) || 0;
      const hrs = Number(v.hoursWeek) || 40;
      const totalHours = hrs * 52;
      const hourly = totalHours > 0 ? sal / totalHours : 0;
      return {
        primaryValue: parseFloat(hourly.toFixed(2)),
        primaryUnit: '$/hr',
        primaryLabel: 'Equivalent Hourly Wage',
        secondaryOutputs: [
          { label: 'Daily Pay (8-hr day)', value: \`$\${(hourly * 8).toFixed(2)}\` },
          { label: 'Annual Working Hours', value: totalHours },
        ],
        steps: [\`Total hours = \${hrs} × 52 = \${totalHours}\`, \`Hourly = $\${sal} / \${totalHours} = $\${hourly.toFixed(2)}\`],
        formulaUsed: 'Hourly = Salary / 2080',
      };
    },
  },
  {
    slug: 'overtime-calculator',
    title: 'Overtime Pay (Time-and-a-Half) Calculator',
    category: 'salary-wages',
    formulaDisplay: 'Total Pay = (Reg Hours × Rate) + (OT Hours × Rate × 1.5)',
    inputs: [
      { id: 'baseRate', label: 'Base Hourly Rate ($)', defaultValue: 25, type: 'number', step: 0.5, unit: '$/hr' },
      { id: 'regHours', label: 'Regular Hours Worked', defaultValue: 40, type: 'number', step: 1, unit: 'hrs' },
      { id: 'otHours', label: 'Overtime Hours Worked', defaultValue: 12, type: 'number', step: 1, unit: 'hrs' },
      { id: 'otMultiplier', label: 'Overtime Multiplier', defaultValue: 1.5, type: 'number', step: 0.5, unit: 'x' },
    ],
    calculate: (v) => {
      const rate = Number(v.baseRate) || 0;
      const reg = Number(v.regHours) || 0;
      const ot = Number(v.otHours) || 0;
      const mult = Number(v.otMultiplier) || 1.5;
      const regPay = reg * rate;
      const otRate = rate * mult;
      const otPay = ot * otRate;
      const total = regPay + otPay;
      return {
        primaryValue: parseFloat(total.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: 'Total Gross Paycheck',
        secondaryOutputs: [
          { label: 'Regular Pay', value: \`$\${regPay.toFixed(2)}\` },
          { label: 'Overtime Pay Portion', value: \`$\${otPay.toFixed(2)}\` },
          { label: 'Overtime Hourly Rate', value: \`$\${otRate.toFixed(2)}/hr\` },
        ],
        steps: [\`Regular: \${reg} × $\${rate} = $\${regPay}\`, \`Overtime: \${ot} × $\${otRate.toFixed(2)} = $\${otPay.toFixed(2)}\`],
        formulaUsed: 'FLSA Standard 1.5x Overtime Rate',
      };
    },
  },
  {
    slug: 'paycheck-frequency-calculator',
    title: 'Paycheck Frequency Converter',
    category: 'salary-wages',
    formulaDisplay: 'Periodic Gross Pay = Annual / Frequency Cycles',
    inputs: [
      { id: 'annual', label: 'Annual Salary ($)', defaultValue: 80000, type: 'number', step: 2500, unit: '$' },
    ],
    calculate: (v) => {
      const a = Number(v.annual) || 0;
      return {
        primaryValue: parseFloat((a / 26).toFixed(2)),
        primaryUnit: '$ / check',
        primaryLabel: 'Bi-Weekly Paycheck (26 checks/yr)',
        secondaryOutputs: [
          { label: 'Semi-Monthly (24 checks/yr)', value: \`$\${(a / 24).toFixed(2)}\` },
          { label: 'Monthly (12 checks/yr)', value: \`$\${(a / 12).toFixed(2)}\` },
          { label: 'Weekly (52 checks/yr)', value: \`$\${(a / 52).toFixed(2)}\` },
        ],
        steps: [\`Bi-weekly = $\${a} / 26 = $\${(a / 26).toFixed(2)}\`, \`Semi-monthly = $\${a} / 24 = $\${(a / 24).toFixed(2)}\`],
        formulaUsed: 'Pay Period Cycle Allocations',
      };
    },
  },
  {
    slug: 'take-home-pay-calculator',
    title: 'Take-Home Pay (Net Paycheck) Calculator',
    category: 'salary-wages',
    formulaDisplay: 'Take Home = Gross Pay - Taxes - Deductions',
    inputs: [
      { id: 'grossAnnual', label: 'Gross Annual Pay ($)', defaultValue: 75000, type: 'number', step: 2500, unit: '$' },
      { id: 'fedTaxPct', label: 'Est. Federal Tax (%)', defaultValue: 12, type: 'number', step: 0.5, unit: '%' },
      { id: 'stateTaxPct', label: 'Est. State Tax (%)', defaultValue: 5, type: 'number', step: 0.5, unit: '%' },
      { id: 'ficaPct', label: 'FICA (Social Security & Medicare) (%)', defaultValue: 7.65, type: 'number', step: 0.05, unit: '%' },
      { id: 'pretax', label: 'Monthly 401(k) / Healthcare ($)', defaultValue: 300, type: 'number', step: 50, unit: '$' },
    ],
    calculate: (v) => {
      const gross = Number(v.grossAnnual) || 0;
      const fed = (Number(v.fedTaxPct) || 0) / 100;
      const state = (Number(v.stateTaxPct) || 0) / 100;
      const fica = (Number(v.ficaPct) || 7.65) / 100;
      const pretaxAnnual = (Number(v.pretax) || 0) * 12;
      const totalTax = gross * (fed + state + fica);
      const netAnnual = Math.max(0, gross - totalTax - pretaxAnnual);
      const netMonthly = netAnnual / 12;
      return {
        primaryValue: parseFloat(netMonthly.toFixed(2)),
        primaryUnit: '$ / mo',
        primaryLabel: 'Estimated Net Monthly Take-Home Pay',
        secondaryOutputs: [
          { label: 'Annual Net Take-Home', value: \`$\${netAnnual.toFixed(2)}\` },
          { label: 'Annual Taxes Paid', value: \`$\${totalTax.toFixed(2)}\` },
          { label: 'Take-Home Percentage', value: \`\${((netAnnual / (gross || 1)) * 100).toFixed(1)}%\` },
        ],
        steps: [\`Gross: $\${gross}\`, \`Taxes: $\${totalTax.toFixed(2)}\`, \`Pre-tax deductions: $\${pretaxAnnual}\`],
        formulaUsed: 'Net Pay = Gross - Taxes - Withholdings',
      };
    },
  },
  {
    slug: 'commission-calculator',
    title: 'Sales Commission Calculator',
    category: 'salary-wages',
    formulaDisplay: 'Commission = Sales Volume × Commission %',
    inputs: [
      { id: 'salesVolume', label: 'Total Sales Volume ($)', defaultValue: 125000, type: 'number', step: 5000, unit: '$' },
      { id: 'commissionRate', label: 'Commission Rate (%)', defaultValue: 8, type: 'number', step: 0.5, unit: '%' },
      { id: 'baseSalary', label: 'Base Salary ($)', defaultValue: 3000, type: 'number', step: 250, unit: '$' },
    ],
    calculate: (v) => {
      const vol = Number(v.salesVolume) || 0;
      const rate = (Number(v.commissionRate) || 0) / 100;
      const base = Number(v.baseSalary) || 0;
      const commission = vol * rate;
      const totalComp = base + commission;
      return {
        primaryValue: parseFloat(commission.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: 'Earned Commission',
        secondaryOutputs: [
          { label: 'Total Compensation (Base + Commission)', value: \`$\${totalComp.toFixed(2)}\` },
          { label: 'Base Pay Portion', value: \`$\${base.toFixed(2)}\` },
        ],
        steps: [\`Commission = $\${vol} × \${rate * 100}% = $\${commission.toFixed(2)}\`],
        formulaUsed: 'Commission = Sales × Rate',
      };
    },
  },
  {
    slug: 'bonus-tax-calculator',
    title: 'Supplemental Bonus Tax (22% Flat) Calculator',
    category: 'salary-wages',
    formulaDisplay: 'Federal Flat Supplemental Rate: 22% + FICA 7.65%',
    inputs: [
      { id: 'bonusAmount', label: 'Gross Bonus Amount ($)', defaultValue: 10000, type: 'number', step: 500, unit: '$' },
      { id: 'stateTaxRate', label: 'State Bonus Tax Rate (%)', defaultValue: 6.0, type: 'number', step: 0.5, unit: '%' },
    ],
    calculate: (v) => {
      const b = Number(v.bonusAmount) || 0;
      const fed = b * 0.22; // 22% flat federal withholding
      const fica = b * 0.0765; // 7.65% FICA
      const state = b * ((Number(v.stateTaxRate) || 0) / 100);
      const totalWithheld = fed + fica + state;
      const netBonus = Math.max(0, b - totalWithheld);
      return {
        primaryValue: parseFloat(netBonus.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: 'Net Bonus Paycheck',
        secondaryOutputs: [
          { label: 'Federal Flat Withholding (22%)', value: \`$\${fed.toFixed(2)}\` },
          { label: 'FICA Payroll Taxes (7.65%)', value: \`$\${fica.toFixed(2)}\` },
          { label: 'State Tax Portion', value: \`$\${state.toFixed(2)}\` },
        ],
        steps: [\`IRS Statutory 22% supplemental withholding on bonuses below $1 million.\`],
        formulaUsed: 'IRS Supplemental Wage Withholding Rule',
      };
    },
  },
  {
    slug: 'per-diem-calculator',
    title: 'Business Travel Per Diem Calculator',
    category: 'salary-wages',
    formulaDisplay: 'Reimbursement = (Daily Lodging Rate + M&IE Rate) × Days',
    inputs: [
      { id: 'days', label: 'Travel Days', defaultValue: 5, type: 'number', min: 1, step: 1, unit: 'days' },
      { id: 'lodging', label: 'Daily Lodging Allowance ($)', defaultValue: 165, type: 'number', step: 5, unit: '$/day' },
      { id: 'meals', label: 'Meals & Incidentals (M&IE) ($)', defaultValue: 79, type: 'number', step: 5, unit: '$/day' },
    ],
    calculate: (v) => {
      const d = Number(v.days) || 1;
      const lodge = Number(v.lodging) || 0;
      const mie = Number(v.meals) || 0;
      const daily = lodge + mie;
      const total = daily * d;
      return {
        primaryValue: parseFloat(total.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: 'Total Per Diem Travel Allowance',
        secondaryOutputs: [
          { label: 'Total Lodging Allowance', value: \`$\${(lodge * d).toFixed(2)}\` },
          { label: 'Total Meals & Incidentals Allowance', value: \`$\${(mie * d).toFixed(2)}\` },
          { label: 'Daily Total Rate', value: \`$\${daily.toFixed(2)}/day\` },
        ],
        steps: [\`Total = (\$\${lodge} + $\${mie}) × \${d} days = $\${total.toFixed(2)}\`],
        formulaUsed: 'GSA Per Diem Travel Schedule',
      };
    },
  },
  {
    slug: 'pay-raise-calculator',
    title: 'Pay Raise & Salary Increase Calculator',
    category: 'salary-wages',
    formulaDisplay: 'New Salary = Current Salary × (1 + Raise %)',
    inputs: [
      { id: 'currentSalary', label: 'Current Annual Salary ($)', defaultValue: 65000, type: 'number', step: 2500, unit: '$' },
      { id: 'raisePct', label: 'Salary Raise Percentage (%)', defaultValue: 6.5, type: 'number', step: 0.5, unit: '%' },
    ],
    calculate: (v) => {
      const cur = Number(v.currentSalary) || 0;
      const pct = (Number(v.raisePct) || 0) / 100;
      const raiseDollar = cur * pct;
      const newSalary = cur + raiseDollar;
      return {
        primaryValue: parseFloat(newSalary.toFixed(2)),
        primaryUnit: '$ / yr',
        primaryLabel: 'New Annual Salary',
        secondaryOutputs: [
          { label: 'Annual Increase', value: \`+$\${raiseDollar.toFixed(2)}\` },
          { label: 'Monthly Increase', value: \`+$\${(raiseDollar / 12).toFixed(2)}\` },
          { label: 'Hourly Increase (40 hrs/wk)', value: \`+$\${(raiseDollar / 2080).toFixed(2)}/hr\` },
        ],
        steps: [\`Raise = $\${cur} × \${pct * 100}% = $\${raiseDollar.toFixed(2)}\`, \`New = $\${cur} + $\${raiseDollar.toFixed(2)} = $\${newSalary.toFixed(2)}\`],
        formulaUsed: 'New Salary = Current × (1 + Raise %)',
      };
    },
  },
  {
    slug: 'minimum-wage-calculator',
    title: 'Minimum Wage Earnings Calculator',
    category: 'salary-wages',
    formulaDisplay: 'Earnings = Minimum Wage Rate × Hours',
    inputs: [
      { id: 'wage', label: 'Statutory Minimum Wage ($/hr)', defaultValue: 16.50, type: 'number', step: 0.25, unit: '$/hr' },
      { id: 'hoursWeek', label: 'Weekly Hours', defaultValue: 35, type: 'number', step: 1, unit: 'hrs' },
    ],
    calculate: (v) => {
      const w = Number(v.wage) || 7.25;
      const hrs = Number(v.hoursWeek) || 0;
      const weekly = w * hrs;
      const annual = weekly * 52;
      return {
        primaryValue: parseFloat(annual.toFixed(2)),
        primaryUnit: '$ / yr',
        primaryLabel: 'Annual Minimum Wage Gross Pay',
        secondaryOutputs: [
          { label: 'Weekly Earnings', value: \`$\${weekly.toFixed(2)}\` },
          { label: 'Monthly Equivalent', value: \`$\${(annual / 12).toFixed(2)}\` },
        ],
        steps: [\`Weekly = $\${w} × \${hrs} hrs = $\${weekly.toFixed(2)}\`],
        formulaUsed: 'Earnings = Hourly × Hours',
      };
    },
  },
];
`;

fs.writeFileSync('./src/data/calculatorRegistry/domainBusinessTaxSalary.ts', code);
console.log('Saved domainBusinessTaxSalary.ts');
