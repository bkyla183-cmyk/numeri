import type { FAQItem } from '../calculatorFaqs.ts';

export const batch1FinanceFaqs: Record<string, FAQItem[]> = {
  'budget-50-30-20-calculator': [
    {
      question: 'Should the 50/30/20 budget percentages apply to gross pay or take-home net income?',
      answer: 'Apply 50/30/20 to your net after-tax take-home pay—or net take-home pay plus voluntary payroll-deducted retirement savings (like 401(k) or salary sacrifice)—so payroll taxes never distort available spending limits.',
    },
    {
      question: 'Where do minimum debt payments vs. extra principal payments belong?',
      answer: 'Contractual minimum debt payments belong in Needs (because missing them harms credit or triggers default), while extra principal repayments belong inside the 20% Savings & Debt Payoff category.',
    },
    {
      question: 'What if fixed rent and childcare push my Needs over 50%?',
      answer: 'In high-cost metros like New York, London, Toronto, or Sydney, adjust targets to 60/20/20 or 55/25/20—this calculator lets you customize all three sliders while enforcing an exact 100% total.',
    },
  ],
  'emergency-fund-calculator': [
    {
      question: 'Why does this calculator multiply months by essential expenses instead of gross salary?',
      answer: 'During a job loss or medical pause, discretionary dining, vacations, and retirement savings can pause temporarily. Sizing your 3–12 month safety net on bare-bones Needs prevents holding excessive low-yield cash.',
    },
    {
      question: 'How many months of emergency savings do financial planners recommend?',
      answer: 'Most planners target 3 months for stable dual-income salaried households, 6 months for single-earner households or mortgages, and 9–12 months for self-employed, commission, or seasonal workers.',
    },
    {
      question: 'Where should I keep an emergency fund so it stays protected yet earns yield?',
      answer: 'Hold cash in liquid high-yield savings accounts or instant-access wrappers insured by FDIC ($250k US), FSCS (£85k UK), CDIC (C$100k Canada), or FCS (A$250k Australia)—or inside a flexible Australian/UK mortgage offset account.',
    },
  ],
  'net-worth-calculator': [
    {
      question: 'What is the difference between Total Net Worth and Liquid Net Worth?',
      answer: 'Total Net Worth counts all assets (including home equity and illiquid possessions) minus all debts, whereas Liquid Net Worth isolates Cash + Investments minus non-mortgage debt to reveal true cash flexibility.',
    },
    {
      question: 'Should retirement accounts like 401(k)s, RRSPs, or Super be listed pre-tax?',
      answer: 'Yes, consumer balance-sheet standards (including Federal Reserve SCF) record retirement and brokerage balances at current statement market value while keeping in mind that pre-tax wrappers incur ordinary tax at withdrawal.',
    },
    {
      question: 'Why does SEC Accredited Investor status exclude primary home equity?',
      answer: 'Under US SEC rules, the $1M net worth test excludes primary residence equity (and treats excess mortgage debt above fair market value as a liability) so retirees are not qualified solely on illiquid housing appreciation.',
    },
  ],
  'savings-goal-calculator': [
    {
      question: 'Why are Deposit Frequency and Account Compounding Frequency separate inputs?',
      answer: 'Many savers transfer money bi-weekly (26/yr) on payday into high-yield accounts that compound daily (365/yr) or monthly (12/yr). Separating both lets the engine compute the exact effective periodic rate rather than an approximation.',
    },
    {
      question: 'What happens if my starting deposit alone grows past the target goal?',
      answer: 'If P₀(1 + r_p)^N already meets or exceeds your target within the chosen horizon, the calculator detects the surplus and cleanly sets required ongoing deposits to $0.00.',
    },
    {
      question: 'Should I adjust the interest rate downward for taxes?',
      answer: 'Yes, for savings held in a taxable non-registered account, multiplying the bank APR by (1 − marginal tax rate) shows the higher monthly deposit needed to meet your goal net of annual interest taxes.',
    },
  ],
  'cd-term-deposit-calculator': [
    {
      question: 'What is the difference between Compound Interest CDs and Simple Interest Term Deposits?',
      answer: 'Compound CDs keep earned interest inside the certificate where it earns interest-on-interest up to APY/AER; simple-interest deposits pay coupon interest out to checking periodically so principal stays flat.',
    },
    {
      question: 'When is CD or Term Deposit interest actually taxed?',
      answer: 'Outside tax shelters (IRA, Cash ISA, TFSA), multi-year bank CDs in the US and GICs in Canada typically trigger annual income tax on interest accrued or credited each calendar year via 1099-INT or T5—not all in the maturity year.',
    },
    {
      question: 'What does APY or AER mean versus stated nominal rate?',
      answer: 'Stated nominal APR is the annualized coupon rate before intra-year compounding; APY (US) and AER (UK) reflect your true 12-month compound yield (e.g., 4.80% APR compounded monthly = 4.907% APY/AER).',
    },
  ],
  'house-deposit-savings-calculator': [
    {
      question: 'Why add 3% or more for closing costs and Stamp Duty on top of the down payment?',
      answer: 'Buyer origination, appraisal, title, conveyancing, and regional transfer taxes (UK SDLT, Australian Stamp Duty, Canadian Land Transfer Tax) require hard cash at closing alongside your deposit.',
    },
    {
      question: 'Why is 20% down payment a major mortgage threshold?',
      answer: 'Putting less than 20% down pushes Loan-to-Value (LTV/LVR) above 80%, generally triggering Private Mortgage Insurance (US PMI), Lenders Mortgage Insurance (Australia LMI), or CMHC default insurance (Canada).',
    },
    {
      question: 'Should I invest a 2-year house deposit in index stocks to save faster?',
      answer: 'No. Because a 20%–35% equity drawdown shortly before closing can derail a home purchase, 1–3 year house funds belong in FDIC/FSCS/CDIC-insured high-yield savings, GICs/CDs, T-bills, or Cash LISAs.',
    },
  ],
  'rent-vs-buy-calculator': [
    {
      question: 'How does this calculator compare Day-0 down payment money fairly?',
      answer: 'The simulation credits the exact cash a buyer locks up on Day 0 (down payment + buying closing costs) directly into the Renter Investment Portfolio at the start of Month 1, and invests or withdraws the exact monthly cash-flow delta each month.',
    },
    {
      question: 'Why can renting win at Year 7 even when monthly rent nearly matches mortgage P&I?',
      answer: 'Buyers pay ~3% buying closing costs upfront, ~6% selling agent fees at exit, property taxes, homeowners insurance, and ~1%/yr maintenance—which often take 7 to 11 years of appreciation and loan paydown to overcome.',
    },
    {
      question: 'Which assumptions move the Buy vs. Rent break-even most?',
      answer: 'Holding horizon, mortgage interest rate, local home appreciation vs. investment return spread, and transaction costs (such as Australian/UK Stamp Duty) dominate the final wealth difference.',
    },
  ],
  'cost-of-living-comparison-calculator': [
    {
      question: 'Why is a weighted category basket more accurate than a headline city cost index?',
      answer: 'Housing varies far more between cities than groceries or utilities. If housing consumes 40%–45% of your personal budget, weighting Housing directly avoids understating the raise needed when moving to high-rent hubs.',
    },
    {
      question: 'Does this account for state, provincial, or national income tax changes?',
      answer: 'The primary calculation outputs gross salary equivalent; always pair it with our Income Tax or Take-Home Pay Calculator if moving between low-tax and high-tax jurisdictions.',
    },
    {
      question: 'What if I only have one overall index number for each city?',
      answer: 'Switch the Comparison Methodology dropdown to "Single Headline City Index Ratio" to convert your salary directly using any official regional parity or city index score.',
    },
  ],
  'subscription-audit-calculator': [
    {
      question: 'How does the Subscription Audit normalize weekly, monthly, and annual charges?',
      answer: 'Every recurring charge converts to a true monthly equivalent—Monthly + (Annual ÷ 12) + (Weekly × 52 ÷ 12)—eliminating seasonal renewal blind spots.',
    },
    {
      question: 'Why display a 5-year compounded opportunity cost?',
      answer: 'Showing what your ongoing monthly subscription drain (and planned cancellations) would grow into over 5 years at market return helps prioritize high-value plans over forgotten renewals.',
    },
    {
      question: 'Which recurring charges are most commonly missed during audits?',
      answer: 'Annual cloud backups, domain/software renewals, wholesale clubs, unused secondary streaming tiers, and auto-converting trial mobile app subscriptions.',
    },
  ],
  'sinking-fund-calculator': [
    {
      question: 'How is a sinking fund different from an emergency fund?',
      answer: 'Emergency funds guard against unknown financial shocks like job loss or medical bills; sinking funds pre-save predictably for known non-monthly costs like holiday gifts, car repairs, home upkeep, and annual insurance.',
    },
    {
      question: 'How is Existing Saved Cash allocated across the four sinking buckets?',
      answer: 'The calculator allocates any current sinking-fund savings proportionally to each goal’s target size, then computes individual end-of-month deposits with or without interest so every bucket matures on time.',
    },
    {
      question: 'Do I need four separate bank accounts for four sinking goals?',
      answer: 'No. Many online banks offer single high-yield buckets/pots inside one master account—transfer the combined monthly allocation automatically on payday.',
    },
  ],
  'childcare-cost-impact-calculator': [
    {
      question: 'Why measure after-tax salary and commuting costs against net childcare?',
      answer: 'Comparing gross paycheck against tuition hides marginal taxes, FICA/NI/CPP payroll deductions, commuting costs, and available subsidies (Dependent Care FSA, UK Tax-Free Childcare, Australian CCS)—yielding your true net cash gain.',
    },
    {
      question: 'If Year-1 net cash flow looks small, does continuing to work still pay off?',
      answer: 'Usually yes: staying employed preserves employer 401(k)/Super/pension matching, health benefits, Social Security/State Pension qualifying credits, and 3%–4%/yr cumulative career wage growth—which is why this tool also models multi-year cumulative impact.',
    },
    {
      question: 'How should I enter UK Tax-Free Childcare or US Dependent Care FSA benefits?',
      answer: 'Enter the annual cash value of UK government top-up (up to £2,000/child), Australian Child Care Subsidy, or your estimated FSA tax savings inside the "Tax Credit, FSA Benefit or Gov Subsidy" field.',
    },
  ],
  'wedding-budget-calculator': [
    {
      question: 'Why must all six wedding category percentages add up to 100%?',
      answer: 'Requiring weights to sum cleanly to 100%—including a dedicated Contingency Buffer—ensures expanding one tier like Venue & Catering explicitly trades off against another without hidden budget creep.',
    },
    {
      question: 'Do catering quotes already include tax and service charges?',
      answer: 'In the US and Canada, catering contracts typically exclude 18%–22% mandatory service charges plus local sales/HST tax. Allocate your 45% Venue & Catering share based on final all-in invoice estimates.',
    },
    {
      question: 'How does guest count drive wedding affordability?',
      answer: 'Catering, open bar, rentals, stationery, and favors scale per head—so trimming 20 attendees at $266.67/guest reduces total spend by over $5,300 at the default $32,000 / 120-guest benchmark.',
    },
  ],
  'roth-ira-vs-traditional-ira-calculator': [
    {
      question: 'Can I contribute $7,500 to a Roth IRA and another $7,500 to a Traditional IRA in 2026?',
      answer: 'No. Under IRS Notice 2025-67 / IR-2025-111 for 2026, the $7,500 annual ceiling ($8,600 for ages 50+) is a SINGLE combined limit across ALL Traditional and Roth IRAs you own, capped at your taxable earned income.',
    },
    {
      question: 'What are the 2026 IRS MAGI phase-out bands for Roth IRA and Traditional deductibility?',
      answer: 'For 2026: Direct Roth phases out at $153k–$168k (Single/HOH), $242k–$252k (MFJ), and $0–$10k (MFS). If covered by a workplace plan, Traditional deductibility phases out at $81k–$91k (Single) or $129k–$149k (MFJ).',
    },
    {
      question: 'Why does reinvesting the Traditional IRA tax refund flip the winner?',
      answer: 'If you contribute $7,500 to a Traditional IRA and spend the upfront tax deduction, you effectively funded less net retirement capital than putting $7,500 post-tax into a Roth. Reinvesting that tax savings into a brokerage side account restores an apples-to-apples comparison.',
    },
  ],
  'fire-retirement-calculator': [
    {
      question: 'What is the 4% Rule and is it safe for early retirees?',
      answer: 'Derived from the Bengen and Trinity studies over 30-year rolling retirements, 4% (25× annual spending) assumes historic balanced stock/bond portfolios. Early retirees facing 40–50 year horizons frequently stress-test 3.25%–3.50% SWR (~28.6×–30.8× expenses).',
    },
    {
      question: 'Why does this calculator convert returns via the Fisher Equation?',
      answer: 'Computing exact net real return (1 + r_nom − drag)/(1 + inflation) − 1 keeps your target FIRE Number, Lean/Fat FIRE bands, and Coast FIRE milestones anchored in today’s familiar purchasing power.',
    },
    {
      question: 'What is Coast FIRE?',
      answer: 'Coast FIRE is the portfolio value needed today such that, without adding another dollar of future savings, real compound growth alone reaches your full FIRE target by traditional retirement age (such as 65).',
    },
  ],
  'superannuation-calculator': [
    {
      question: 'What official ATO FY 2026–27 superannuation thresholds are built into this calculator?',
      answer: 'It incorporates the 12.00% Employer Super Guarantee (SG), FY 2026–27 Concessional Cap of A$32,500, Non-Concessional Cap of A$130,000, Maximum Super Contribution Base of A$270,830/yr, 15% contributions tax, and Division 293 (A$250,000).',
    },
    {
      question: 'How does Division 293 extra 15% Super tax work?',
      answer: 'When your combined income + reportable super contributions exceed A$250,000, ATO levies an extra 15% tax on the portion of concessional contributions above the A$250,000 threshold (bringing total super contribution tax to 30% on that slice).',
    },
    {
      question: 'Why output Today’s Purchasing Power alongside Nominal Age-67 Balance?',
      answer: 'Because 30+ years of inflation roughly halves real currency value, showing A$1.07M in today’s dollars alongside A$2.35M nominal prevents overestimating retirement lifestyle affordability.',
    },
  ],
  'uk-pension-drawdown-calculator': [
    {
      question: 'How does HMRC’s £268,275 Lump Sum Allowance (LSA) cap my tax-free cash?',
      answer: 'Replacing the old Lifetime Allowance, the 2026–27 Lump Sum Allowance caps cumulative 25% tax-free Pension Commencement Lump Sums (PCLS) across all your UK pensions at £268,275 (meaning 25% works in full on pots up to £1,073,100).',
    },
    {
      question: 'Can I edit the UK State Pension amount for incomplete NI records?',
      answer: 'Yes. The advanced State Pension field defaults to the full 2026–27 new State Pension of £12,547.60/yr (£241.30/week, requiring 35 qualifying NI years; min 10 yrs), and remains editable so you can enter your personal GOV.UK forecast.',
    },
    {
      question: 'Why does the calculator report both Gross Withdrawal Target and Estimated After-Tax Income?',
      answer: 'Beyond your 25% tax-free cash, flexi-access drawdown and State Pension count as taxable income under HMRC rules—meaning Income Tax above the £12,570 Personal Allowance lowers actual net spendable cash.',
    },
  ],
  'canada-rrsp-tfsa-calculator': [
    {
      question: 'What are CRA’s 2026 contribution caps for RRSP and TFSA?',
      answer: 'For 2026, new RRSP room accrues at 18% of 2025 earned income up to C$33,810 (plus unused carry-forward room); the 2026 TFSA annual dollar limit is C$7,000 (C$109,000 cumulative for Canadian residents aged 18+ since 2009).',
    },
    {
      question: 'How do OAS Recovery Tax thresholds interact with RRSP/RRIF withdrawals?',
      answer: 'Unlike tax-free TFSA withdrawals, every dollar withdrawn from an RRSP/RRIF adds to taxable net income. Service Canada applies a 15% OAS clawback when 2025 income exceeds C$93,454 (Jul 2026–Jun 2027 payments) or 2026 income exceeds C$95,323 (Jul 2027–Jun 2028 payments).',
    },
    {
      question: 'Why does spending the RRSP tax refund make TFSA beat RRSP even when tax rates drop?',
      answer: 'Spending the tax rebate shrinks your working investment to net after-tax dollars inside a tax-deferred wrapper that will still be taxed upon withdrawal—reducing growth identically to getting taxed at entry AND exit.',
    },
  ],
  'cagr-calculator': [
    {
      question: 'How does this CAGR calculator deduct an annual AUM or fund expense ratio?',
      answer: 'Using standard multiplicative compounding: Ending Value After Fee = V_f × (1 − f)^n, which matches Net-of-Fee CAGR = (1 + Gross CAGR)(1 − f) − 1 identically to the cent.',
    },
    {
      question: 'Why is CAGR always equal to or lower than simple arithmetic average return?',
      answer: 'Compounded wealth suffers asymmetric volatility drag (e.g., +50% followed by −50% leaves you at 75%, giving 0% arithmetic mean but −13.4% CAGR). CAGR measures exact geometric compounded performance.',
    },
    {
      question: 'Is CAGR suitable if I added or withdrew cash mid-horizon?',
      answer: 'Basic CAGR assumes no mid-period cash flows between Day 0 and Year n. If making recurring monthly contributions, use our Dollar-Cost Averaging or DRIP calculators instead.',
    },
  ],
  'dividend-reinvestment-drip-calculator': [
    {
      question: 'Does this DRIP calculator align monthly contributions with quarterly dividends?',
      answer: 'Yes. It simulates month-by-month share purchases at compounding share prices and distributes quarterly dividends every 3rd month, reinvesting net-of-tax dividends into fractional shares under the DRIP path.',
    },
    {
      question: 'Are automatically reinvested dividends still taxed in a non-retirement account?',
      answer: 'Yes. In taxable US/UK/CA/AU brokerage accounts, reinvested dividends are generally taxable in the calendar year distributed—set Dividend Tax Rate to 0% when modeling a Roth IRA, ISA, or TFSA.',
    },
    {
      question: 'How is the DRIP Compounding Advantage calculated?',
      answer: 'It compares total DRIP portfolio value (including all reinvested shares) minus the No-DRIP baseline (original + monthly purchased shares plus cumulative after-tax cash dividends received).',
    },
  ],
  'dollar-cost-averaging-calculator': [
    {
      question: 'How does this DCA calculator handle negative return stress tests?',
      answer: 'It safely converts net effective annual return (including −10% or −20% stress tests) using (1 + r_net)^(1/k) − 1 and solves the negative-rate annuity without division-by-zero errors.',
    },
    {
      question: 'Why does buying fixed dollars during price dips lower average cost per share?',
      answer: 'Investing fixed dollars purchases more units when prices drop and fewer when prices spike—achieving the harmonic mean cost ($97.96 across [$100, $80, $100, $120]) rather than the $100.00 arithmetic mean price.',
    },
    {
      question: 'How do Bi-Weekly and Weekly cadences compare to Monthly DCA?',
      answer: 'Because the calculator converts effective annual return cleanly across 12, 26, or 52 intervals per year, all frequencies stay mathematically comparable while aligning purchases to your real paycheck schedule.',
    },
  ],
  'stock-position-size-risk-calculator': [
    {
      question: 'How do separate Entry and Exit broker commissions affect position sizing?',
      answer: 'Both Entry and Exit fees are subtracted directly from your maximum trade risk budget BEFORE dividing by |Entry − StopLoss| and rounding down via floor()—preventing fees from accidentally pushing trade risk over your % rule.',
    },
    {
      question: 'What is the R-Multiple convention shown in the results?',
      answer: '1R equals your initial per-share risk distance |Entry − StopLoss|. Reaching a target price 3× further from entry than your stop equals a 3.00R winner ($2,205.50 net profit after $10 round-trip commissions in the worked example).',
    },
    {
      question: 'Can a stock gap past my stop-loss and cause larger losses than modeled?',
      answer: 'Yes. Stop-market orders do not guarantee fill price during earnings surprises, market halts, or overnight gaps—always monitor Account Allocation % alongside stop risk.',
    },
  ],
  'real-rate-of-return-calculator': [
    {
      question: 'Why does Annual Tax Drag lose purchasing power vs. Deferred Realization Tax at the same tax rate?',
      answer: 'Annual taxation (CDs/HYSAs/bonds) siphons off 22% of returns every year, curbing future compounding. Deferring tax until Year 10 allows the entire gross return to compound uninterrupted before paying exit capital gains once.',
    },
    {
      question: 'Why not just subtract inflation and taxes directly (Nominal − Inflation)?',
      answer: 'Simple subtraction ignores how inflation erodes investment gains as well as principal. Dividing via Irving Fisher’s equation (1 + r)/(1 + i) − 1 captures both effects accurately.',
    },
    {
      question: 'What happens when inflation exceeds after-tax nominal yield?',
      answer: 'Your Real Rate of Return turns negative—meaning even though your bank dollar balance increases every year, your real ability to buy groceries, rent, or energy shrinks.',
    },
  ],
  'rmd-calculator': [
    {
      question: 'At what age do RMDs begin under SECURE 2.0 in 2026?',
      answer: 'Owners born in 1950 or earlier began at 72 (or 70½ prior); owners born 1951–1959 begin at Age 73; owners born 1960 or later begin at Age 75.',
    },
    {
      question: 'Do Designated Roth 401(k) or Roth 403(b) accounts still have RMDs?',
      answer: 'No. Under SECURE 2.0 rules effective from 2024 onward, BOTH Roth IRAs and Designated Roth 401(k)/403(b) plans have $0 Required Minimum Distributions during the original owner’s lifetime.',
    },
    {
      question: 'What is the penalty for missing an RMD deadline?',
      answer: 'Missing your December 31 deadline triggers a 25% IRS excise tax on the un-withdrawn shortfall—reduced to 10% if corrected promptly within the IRS correction window.',
    },
  ],
  'rental-property-cash-flow-calculator': [
    {
      question: 'Why does the calculator separate CapEx Reserve from annual Repairs & Maintenance?',
      answer: 'Routine maintenance fixes minor leaks and painting each year, whereas Capital Expenditures (CapEx) accrue reserves for heavy multi-decade replacements like roofs, HVAC compressors, and driveways.',
    },
    {
      question: 'What does a DSCR below 1.0x mean?',
      answer: 'A Debt Service Coverage Ratio under 1.0x (such as 0.91x in our default leveraged example) means property Net Operating Income does not cover annual mortgage P&I payments—requiring monthly cash subsidies and failing typical DSCR investment loan thresholds (1.20x–1.25x).',
    },
    {
      question: 'How does Cap Rate differ from Cash-on-Cash Return?',
      answer: 'Cap Rate (NOI ÷ Price) evaluates unlevered property operating yield independent of mortgage debt, while Cash-on-Cash Return (Pre-Tax Cash Flow ÷ Total Cash Invested) measures actual leveraged annual cash yield on your down payment + closing/rehab cash.',
    },
  ],
};
