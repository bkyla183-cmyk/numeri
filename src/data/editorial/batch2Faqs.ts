import type { FAQItem } from '../calculatorFaqs.ts';

export const batch2Faqs: Record<string, FAQItem[]> = {
  'debt-snowball-avalanche-calculator': [
    {
      question: 'Why does Debt Avalanche always pay equal or less total interest than Debt Snowball?',
      answer: 'Every extra dollar directed toward the debt with the highest Annual Percentage Rate (APR) eliminates the steepest monthly finance charge per dollar repaid. Debt Snowball pays off the smallest balance first for faster early momentum, which can slightly increase lifetime interest if low-balance accounts carry lower APRs.',
    },
    {
      question: 'What happens to minimum payments after a debt balance reaches zero?',
      answer: 'This calculator automatically models minimum-payment rollover: once any account is paid off, its former required minimum payment is added to your Extra Monthly Acceleration Budget so your combined monthly outflow stays constant until all debts hit $0.',
    },
    {
      question: 'Should low-rate student loans or 0% promotional balances be included in an Avalanche plan?',
      answer: 'You can enter any fixed or revolving debt here. Under Avalanche, low-APR debts (such as 4%–6% student loans) naturally fall to the end of the queue while high-APR credit cards (18%–28%) are cleared first, unless a deferred-interest 0% promotion carries a retroactive penalty deadline.',
    },
  ],
  'mortgage-refinance-calculator': [
    {
      question: 'How is the mortgage refinance break-even point calculated?',
      answer: 'Simple break-even divides upfront refinance closing costs and points by the monthly P&I payment savings (Closing Costs ÷ Monthly Savings). Our engine also calculates your Net Wealth Benefit over your expected years in the home by factoring in remaining principal balance differences at sale.',
    },
    {
      question: 'Does rolling closing costs into the new loan eliminate the break-even requirement?',
      answer: 'No. Rolling closing costs into the mortgage increases your new financed principal, which slightly lowers monthly cash savings and increases lifetime interest accrued on those rolled fees. Always compare your expected hold horizon against the break-even month.',
    },
    {
      question: 'Why does resetting to a fresh 30-year mortgage sometimes increase total lifetime interest?',
      answer: 'If you already paid down 5–10 years of your existing loan, stretching the remaining balance back out to 360 months adds extra years of interest compounding even at a lower rate. Testing a 15-year or 20-year refinance term—or paying extra principal—avoids resetting the amortization clock.',
    },
  ],
  'heloc-calculator': [
    {
      question: 'What causes the HELOC payment reset shock when the draw period ends?',
      answer: 'During a typical 10-year draw period, many Home Equity Lines of Credit only require interest-only payments (Balance × APR ÷ 12). When the 20-year repayment period begins, the line freezes and amortizes full principal plus interest, jumping monthly payments significantly.',
    },
    {
      question: 'How do lenders calculate Combined Loan-to-Value (CLTV) for HELOC approval?',
      answer: 'Lenders divide the sum of your existing first mortgage balance plus your requested HELOC credit limit by your appraised home value: CLTV = (Mortgage + HELOC) ÷ Home Value. Most US and Canadian lenders cap CLTV between 80% and 85%.',
    },
    {
      question: 'When is HELOC interest tax-deductible in the United States?',
      answer: 'Under IRC §163(h)(3) rules, HELOC interest is only deductible on Schedule A when funds are used to buy, build, or substantially improve the qualified residence securing the loan, subject to the overall mortgage debt limit—not when spent on debt consolidation or personal expenses.',
    },
  ],
  'mortgage-payoff-extra-payment-calculator': [
    {
      question: 'Why does a true bi-weekly mortgage schedule shave years off a 30-year loan?',
      answer: 'There are 52 weeks in a year, creating 26 bi-weekly half-payments—equivalent to 13 full monthly P&I payments per year instead of 12. That automatic 13th principal payment directly reduces compounding principal each year.',
    },
    {
      question: 'What is the difference between a true bi-weekly schedule and semi-monthly payments?',
      answer: 'Semi-monthly payments (24 half-payments on the 1st and 15th) total exactly 12 full payments per year and save almost no interest, whereas true bi-weekly payments (every 14 days = 26 half-payments) add one full extra payment annually.',
    },
    {
      question: 'Should extra mortgage payments be designated as principal-only with my servicer?',
      answer: 'Yes. Confirm with your mortgage servicer that recurring extra amounts, lump sums, or bi-weekly payments apply immediately to unpaid principal with zero prepayment penalty rather than sitting in suspense or advancing next month’s due date.',
    },
  ],
  'home-affordability-dti-calculator': [
    {
      question: 'What is the difference between Front-End DTI and Back-End DTI in mortgage underwriting?',
      answer: 'Front-End DTI measures proposed housing costs (PITI + HOA + PMI) as a share of gross monthly income (conventionally 28%), while Back-End DTI adds existing monthly auto, student loan, and minimum credit card obligations (conventionally capped at 36% for conservative planning, though QM loans may allow up to 43%–50%).',
    },
    {
      question: 'Why does the calculator check the 80% Loan-to-Value (LTV) PMI threshold?',
      answer: 'When down payment cash is under 20% of the purchase price (LTV > 80%), conventional loans require Private Mortgage Insurance (modeled at 0.55%/yr) or Australian LMI, which reduces purchasing power. Our piecewise solver avoids artificial 80% LTV cliff gaps.',
    },
    {
      question: 'Should I stretch to the absolute maximum lender pre-approval DTI limit?',
      answer: 'Gross-income DTI ratios ignore income taxes, retirement contributions, childcare, utilities, and home maintenance. Comparing your monthly PITI+HOA against after-tax net take-home pay keeps housing safely inside a sustainable household budget.',
    },
  ],
  'arm-mortgage-calculator': [
    {
      question: 'What do the three numbers in a 5/1 ARM cap structure like 2/2/5 mean?',
      answer: 'The first number (2%) is the Initial Reset Cap limiting the rate jump at Year 6; the second (2%) is the Periodic Annual Cap on later yearly resets; and the third (5%) is the Lifetime Cap above the initial teaser rate (so a 5.5% initial rate can never exceed 10.5%).',
    },
    {
      question: 'How is an Adjustable-Rate Mortgage reset rate determined after the fixed period?',
      answer: 'At each scheduled reset, the lender adds a fixed Margin (e.g., 2.75%) to a published benchmark Index (such as 30-Day Average SOFR in the US, Bank Rate / SONIA in the UK, or Prime in Canada), subject to the contract’s periodic and lifetime rate caps.',
    },
    {
      question: 'How does the calculator model worst-case ARM payment shock?',
      answer: 'Alongside the expected Indexed Rate trajectory, our engine simulates rates spiking to the maximum allowed step every reset until hitting the Lifetime Cap, showing both first-reset shock and maximum possible lifetime monthly P&I.',
    },
  ],
  'uk-stamp-duty-calculator': [
    {
      question: 'What UK Stamp Duty (SDLT) thresholds apply in England and Northern Ireland for 2026–27?',
      answer: 'Following the April 2025 threshold reversion active throughout 2026–27, standard buyers pay 0% up to £125,000, 2% on £125,001–£250,000, 5% on £250,001–£925,000, 10% on £925,001–£1.5M, and 12% above £1.5M.',
    },
    {
      question: 'What happens if a First-Time Buyer purchases a home for £500,001 instead of £500,000?',
      answer: 'UK First-Time Buyer Relief (0% up to £300,000 and 5% from £300,001 to £500,000) is subject to a strict £500,000 cliff edge. At £500,000, SDLT is £10,000; at £500,001, relief is forfeited entirely and standard bands apply (£15,000+).',
    },
    {
      question: 'How do the 5% Additional Property and 2% Non-UK Resident surcharges stack?',
      answer: 'Both surcharges are additive across every price slice (for purchases £40,000+): an overseas landlord buying a second home or Buy-to-Let property pays standard SDLT rates plus 7% (5% additional dwelling + 2% non-resident) on the entire price.',
    },
  ],
  'debt-consolidation-calculator': [
    {
      question: 'Why can a consolidation loan with a lower nominal interest rate still carry a higher Effective APR?',
      answer: 'Personal consolidation loans often charge 2%–8% upfront origination fees financed into the gross balance. Following Truth-in-Lending (Regulation Z) IRR math, solving payments against the net debt paid off reveals the true Effective APR including origination drag.',
    },
    {
      question: 'When does debt consolidation save money vs. merely lowering monthly payments?',
      answer: 'Consolidating lowers lifetime cost only when the new Effective APR is lower than your existing Weighted Average APR AND you do not stretch the repayment term so long that extra years of interest exceed the rate discount.',
    },
    {
      question: 'What is the biggest behavioral risk after paying off credit cards with a consolidation loan?',
      answer: 'Re-accumulating balances on newly zeroed credit cards ("double-dipping") leaves borrowers paying both the fixed installment loan and fresh revolving card interest simultaneously.',
    },
  ],
  'lease-vs-buy-car-calculator': [
    {
      question: 'How do you convert a car lease Money Factor into an approximate APR?',
      answer: 'Multiply the dealer’s Money Factor by 2,400. For example, a 0.0025 Money Factor equals 0.0025 × 2,400 = 6.00% equivalent annual financing rate applied to both the capitalized cost and residual value.',
    },
    {
      question: 'How does this calculator keep the 36-month Lease vs. Buy comparison apples-to-apples?',
      answer: 'Instead of penalizing the buyer for building ownership equity, the engine amortizes the auto loan over its full term, takes the exact remaining payoff balance at month 36, and credits Net Resale Equity (Market Value minus Loan Payoff) against total cash spent.',
    },
    {
      question: 'What hidden car lease costs can widen the gap beyond this model?',
      answer: 'Over-mileage penalties ($0.15–$0.30/mile above 10k–12k miles/yr), excess wear-and-tear charges at turn-in, and disposition fees increase net leasing costs if you drive heavily or keep vehicles beyond 3 years.',
    },
  ],
  'business-loan-calculator': [
    {
      question: 'How are SBA 7(a) guarantee and origination fees reflected in True Effective APR?',
      answer: 'When upfront guarantee, packaging, or origination fees are deducted from gross loan disbursement, your business receives smaller net proceeds while still paying scheduled principal and interest on the gross balance—raising the True Effective APR above the stated coupon.',
    },
    {
      question: 'What Debt Service Coverage Ratio (DSCR) do commercial and SBA lenders require?',
      answer: 'Most commercial banks and SBA lenders look for a minimum DSCR of 1.25x (Annual EBITDA ÷ Annual Debt Service ≥ 1.25), meaning operating cash flow provides at least a 25% safety cushion over loan payments.',
    },
    {
      question: 'Are business loan interest payments and SBA guarantee fees tax-deductible?',
      answer: 'Generally yes for operating businesses, subject to IRC §163(j) business interest limitations for larger firms. Upfront loan origination fees are typically amortized over the life of the loan rather than expensed immediately in full.',
    },
  ],
  'loan-apr-points-calculator': [
    {
      question: 'What is a mortgage discount point and how much does one point cost?',
      answer: 'One discount point equals 1% of the mortgage loan amount paid upfront at closing (e.g., $4,000 on a $400,000 loan) in exchange for a permanently reduced interest rate—typically 0.25% to 0.375% lower depending on lender pricing.',
    },
    {
      question: 'When does paying upfront mortgage points actually backfire?',
      answer: 'If you sell the home or refinance into lower rates before reaching your break-even month (Points Cost ÷ Monthly P&I Savings), your upfront cash outlay exceeds cumulative monthly savings, making the Effective APR higher than taking the zero-point par rate.',
    },
    {
      question: 'How does Regulation Z calculate Effective APR with discount points?',
      answer: 'Under federal Truth-in-Lending rules, discount points and prepaid lender origination charges are subtracted from the gross loan principal to determine the Net Amount Financed, and the IRR equating future monthly P&I payments to that net sum yields the Effective APR.',
    },
  ],
  'balloon-loan-calculator': [
    {
      question: 'Why do commercial real estate and bridge loans use a 30-year amortization with a 5-year balloon?',
      answer: 'Calculating monthly payments on a 30-year amortization schedule keeps early-year debt service low and maximizes DSCR coverage, while the 5-year or 7-year balloon maturity limits the lender’s long-term interest-rate risk.',
    },
    {
      question: 'How much principal is actually paid down during the first 5 years of a 30-year amortization?',
      answer: 'Because early mortgage payments are heavily front-loaded with interest, on a 6.75% 30-year schedule only about 6.1% of original principal is retired after 5 years—leaving roughly 93.9% due as a lump-sum balloon.',
    },
    {
      question: 'What risks arise when refinancing a balloon balance at maturity?',
      answer: 'Borrowers face both interest-rate risk (refinancing at higher prevailing rates) and valuation/DSCR risk (if property income drops or appraisal values fall below lender LTV caps at maturity).',
    },
  ],
  'capital-gains-tax-calculator': [
    {
      question: 'Why does the US Long-Term Capital Gains 0% bracket depend on my W-2 salary?',
      answer: 'Under IRS Rev. Proc. 2025-32 rules for 2026, Long-Term Capital Gains stack directly on top of your ordinary taxable income (salary plus short-term gains minus the $16,100 Single / $32,200 MFJ standard deduction). High wages consume the 0% tier ($49,450 Single / $98,900 MFJ), pushing gains into 15% or 20%.',
    },
    {
      question: 'When does the 3.8% Net Investment Income Tax (NIIT) apply?',
      answer: 'Under IRC §1411, the 3.8% NIIT applies to the lesser of your net investment income or the amount by which Modified Adjusted Gross Income (MAGI) exceeds unindexed statutory thresholds: $200,000 (Single/HOH), $250,000 (MFJ), or $125,000 (MFS).',
    },
    {
      question: 'How are short-term capital gains taxed compared to long-term gains?',
      answer: 'Assets held for 1 year or less are taxed at your marginal ordinary federal income tax rates (10% to 37% in 2026), whereas assets held for more than 1 year (366+ days) receive preferential 0% / 15% / 20% federal capital gains rates.',
    },
  ],
  'uk-take-home-pay-calculator': [
    {
      question: 'Why is the UK effective marginal tax rate 60% between £100,000 and £125,140?',
      answer: 'For every £2 of Adjusted Net Income above £100,000, HMRC withdraws £1 of the £12,570 Personal Allowance until it reaches £0 at £125,140. Combined with the 40% Higher Rate (or 42%–45% in Scotland) plus 2% Class 1 NI, earnings in this band suffer a 62%+ marginal deduction—making pension salary sacrifice highly effective.',
    },
    {
      question: 'What are the 2026–27 UK Student Loan thresholds modeled here?',
      answer: 'For 2026–27, repayments are 9% above £29,385 (Plan 2), £26,065 (Plan 1), £32,745 (Plan 4 Scotland), and £25,000 (Plan 5), plus 6% above £21,000 for Postgraduate Loans. Salary-sacrifice pension contributions reduce NI-able earnings on which loan deductions are calculated.',
    },
    {
      question: 'How do 2026–27 Scottish Income Tax rates differ from England, Wales, and Northern Ireland?',
      answer: 'Scotland applies a 6-band schedule (19% Starter, 20% Basic, 21% Intermediate, 42% Higher, 45% Advanced, and 48% Top), whereas England, Wales, and Northern Ireland use 3 main bands above the Personal Allowance (20%, 40%, and 45%).',
    },
  ],
  'canada-income-tax-calculator': [
    {
      question: 'What changed in CRA 2026 Federal income tax brackets and CPP/CPP2 caps?',
      answer: 'In 2026, Canada’s lowest federal bracket rate is 14.0% (up to C$58,523), the Basic Personal Amount is C$16,452 (phasing down above C$181,440), base CPP applies at 5.95% on C$3,500–C$74,600 (max C$4,230.45), and CPP2 adds 4.0% on C$74,600–C$85,000 (max C$416.00).',
    },
    {
      question: 'How does contributing to an RRSP save tax on this Canadian calculator?',
      answer: 'RRSP contributions deduct directly from your top marginal federal and provincial brackets (unlike non-refundable tax credits at 14%), lowering taxable income dollar-for-dollar while leaving CPP and EI payroll premiums unchanged.',
    },
    {
      question: 'Why does Quebec (QC) show a lower federal tax figure than Ontario or BC?',
      answer: 'Quebec residents receive a statutory 16.5% Quebec Federal Tax Abatement reducing their net federal tax payable because Quebec administers its own provincial programs (QPP, QPIP, and Revenu Québec returns) separately.',
    },
  ],
  'australia-income-tax-calculator': [
    {
      question: 'How does the ATO FY 2026–27 income tax rate cut affect take-home pay?',
      answer: 'Effective 1 July 2026 (FY 2026–27), the second Australian resident tax tier drops from 16% to 15% on taxable income between A$18,201 and A$45,000 (followed by 30% to A$135,000, 37% to A$190,000, and 45% above A$190,000), delivering additional tax relief alongside LITO.',
    },
    {
      question: 'How does the new FY 2026–27 marginal HECS-HELP repayment scale work?',
      answer: 'Replacing old cliff thresholds on total income, the reformed FY 2026–27 marginal system charges A$0 up to A$69,528, then 15c per dollar over A$69,528 (up to A$129,717), then A$9,028 + 17c per dollar above A$129,717 (up to A$186,050), and 10% of total income at A$186,051+.',
    },
    {
      question: 'Does Super salary sacrifice eliminate HECS-HELP or Medicare Levy Surcharge?',
      answer: 'No. While salary sacrifice lowers taxable income for ATO income tax and the 2% Medicare Levy, reportable employer super contributions are added back into Repayment Income when assessing HECS-HELP and the Medicare Levy Surcharge.',
    },
  ],
  'nz-paye-calculator': [
    {
      question: 'What are the 2026–27 New Zealand IRD PAYE income tax brackets and ACC levy?',
      answer: 'IRD PAYE tiers are 10.5% (≤NZ$15,600), 17.5% (to NZ$53,500), 30% (to NZ$78,100), 33% (to NZ$180,000), and 39% (>NZ$180,000). The 2026–27 ACC Earners’ Levy is 1.75% capped at NZ$156,641 maximum liable earnings (NZ$2,741.22 max).',
    },
    {
      question: 'How do KiwiSaver and the Independent Earner Tax Credit (IETC) work in this model?',
      answer: 'Employees choosing 3%, 4%, 6%, 8%, or 10% KiwiSaver see their deduction taken from after-tax pay (alongside a mandatory 3% employer contribution before ESCT). Earners between NZ$24,000 and NZ$70,000 also receive up to NZ$520/yr in IETC relief.',
    },
    {
      question: 'When does New Zealand Student Loan PAYE withholding apply?',
      answer: 'Borrowers on an SL tax code pay 12% on gross earnings exceeding the NZ$24,128 annual repayment threshold (NZ$464/week or NZ$928/fortnight), deducted automatically alongside PAYE and ACC.',
    },
  ],
  'self-employment-tax-calculator': [
    {
      question: 'Why does the IRS multiply Schedule C net profit by 92.35% before applying the 15.3% SE tax?',
      answer: 'W-2 employees do not pay FICA tax on the 7.65% half their employer pays. Multiplying net profit by (1 − 0.0765) = 0.9235 gives sole proprietors and LLCs parity before applying 12.4% Social Security (up to the 2026 $184,500 wage base) plus 2.9% Medicare.',
    },
    {
      question: 'How do existing W-2 wages interact with Self-Employment Social Security taxes?',
      answer: 'The 2026 $184,500 Social Security cap applies across combined W-2 and Schedule C earnings. Each dollar of W-2 salary reduces remaining room for the 12.4% SE Social Security tax, though the 2.9% Medicare tax (and 0.9% Additional Medicare over $200k/$250k) has no cap.',
    },
    {
      question: 'What are the four federal Form 1040-ES quarterly estimated tax deadlines?',
      answer: 'Quarterly federal payments are typically due April 15, June 15, September 15, and January 15 of the following year (shifted to the next business day on weekends/holidays) to avoid IRS underpayment penalties.',
    },
  ],
  'freelance-rate-calculator': [
    {
      question: 'Why should freelancers not divide target salary by 2,080 hours when setting an hourly rate?',
      answer: 'A W-2 2,080-hour year ignores paid vacation, sick days, health insurance, software/equipment overhead, self-employment tax, and the 25%–35% of workweeks spent on unpaid marketing, proposals, and admin. Dividing by actual billable hours avoids severe underpricing.',
    },
    {
      question: 'What is a realistic Billable Utilization percentage for solo consultants?',
      answer: 'Established independent consultants typically achieve 60%–75% billable utilization (around 1,200–1,450 paid hours per year). Retainer arrangements push utilization higher, whereas project-heavy solo practices sit closer to 55%–65%.',
    },
    {
      question: 'How do you convert the minimum hourly consulting rate into a day rate or project retainer?',
      answer: 'Multiply the required billable hourly rate by 8 hours for a standard full-day rate, or by realistic estimated scope hours plus a 15%–20% revision buffer for fixed-fee proposals.',
    },
  ],
  'overtime-bonus-paycheck-calculator': [
    {
      question: 'Why does my paycheck show 22% federal tax withheld on a bonus even if my tax bracket is 12% or 24%?',
      answer: 'Under IRS Publication 15 (Circular E), employers paying supplemental wages separately use the optional 22% flat federal withholding rate up to $1 million (and 37% above $1M). Any over- or under-withholding reconciles accurately when you file Form 1040.',
    },
    {
      question: 'How are US Fair Labor Standards Act (FLSA) overtime and double-time calculated?',
      answer: 'Non-exempt workers receive 1.5× their regular hourly rate for overtime hours (generally above 40 hours/week federally, or >8 hours/day in jurisdictions like California), and 2.0× regular rate for qualifying double-time holiday or extended shifts.',
    },
    {
      question: 'Are overtime and bonuses still subject to 7.65% FICA payroll taxes?',
      answer: 'Yes. Regular wages, overtime, and cash bonuses are all fully subject to 6.2% Social Security (until cumulative YTD wages pass $184,500 in 2026) and 1.45% Medicare taxes.',
    },
  ],
  'employer-payroll-cost-calculator': [
    {
      question: 'Why does an $80,000 employee typically cost a US business 1.20x to 1.30x base salary?',
      answer: 'Beyond gross wages, employers pay mandatory 2026 FICA (6.2% SS up to $184,500 + 1.45% Medicare), FUTA (0.6% up to $7,000), SUTA state unemployment, workers’ compensation insurance, health/dental premiums, and 401(k) matching.',
    },
    {
      question: 'What is the effective federal FUTA tax rate when state unemployment (SUTA) is paid on time?',
      answer: 'Although the statutory FUTA rate is 6.0% on the first $7,000 of each employee’s annual wages, employers paying timely SUTA receive a 5.4% credit, dropping net FUTA to 0.6% ($42.00 per employee per year in non-credit-reduction states).',
    },
    {
      question: 'How does dividing Total Employer Burdened Cost by 2,080 hours help agency and consulting pricing?',
      answer: 'True Hourly Cost reveals the baseline labor break-even rate before adding office overhead, non-billable bench time, and target profit margin—preventing agencies from bidding unprofitable client contracts.',
    },
  ],
  'saas-ltv-cac-calculator': [
    {
      question: 'Why must SaaS LTV multiply ARPA by Gross Margin % instead of raw subscription revenue?',
      answer: 'Comparing unadjusted revenue LTV against Customer Acquisition Cost (CAC) ignores hosting, third-party APIs, payment processing, and onboarding support costs. Gross-Margin LTV measures true contribution profit available to pay back CAC and fund R&D.',
    },
    {
      question: 'What LTV:CAC ratio and CAC Payback Period do SaaS investors target?',
      answer: 'Healthy B2B SaaS businesses target an LTV:CAC ratio of 3.0x or higher alongside a CAC Payback Period of 12 months or less. Ratios below 3x signal fragile unit economics, while ratios above 6x may indicate under-investing in sales growth.',
    },
    {
      question: 'What is the SaaS Rule of 40 and how is it calculated?',
      answer: 'Rule of 40 adds Annual Recurring Revenue (ARR) growth rate (%) plus Operating or Free Cash Flow margin (%). A combined score ≥40% signals balanced, sustainable efficiency across high-growth startups and mature profitable software companies.',
    },
  ],
  'npv-irr-calculator': [
    {
      question: 'When NPV and IRR disagree on mutually exclusive capital projects, which metric wins?',
      answer: 'Always follow Net Present Value (NPV). IRR assumes intermediate cash inflows reinvest at the project’s own IRR—which can exaggerate small, fast-payback projects—whereas NPV measures exact absolute dollar wealth created above your WACC hurdle rate.',
    },
    {
      question: 'Why does Discounted Payback Period take longer than Simple Payback Period?',
      answer: 'Simple Payback sums nominal future cash flows without discounting for time value of money. Discounted Payback shrinks each future year’s cash flow by (1 + WACC)^t before checking when initial capital I₀ is recovered.',
    },
    {
      question: 'How should I interpret Profitability Index (PI)?',
      answer: 'Profitability Index equals (NPV + Initial Investment) ÷ Initial Investment. Projects with PI > 1.0x create positive value above the hurdle rate, making PI ideal for ranking competing investments under tight capital budgets.',
    },
  ],
  'bond-yield-calculator': [
    {
      question: 'What is the difference between a bond’s Coupon Rate, Current Yield, and Yield to Maturity (YTM)?',
      answer: 'Coupon Rate is fixed interest relative to par ($1,000); Current Yield divides annual coupon dollars by current market price; and Yield to Maturity (YTM) solves the full annualized IRR capturing both coupons and any capital gain or loss from holding to maturity.',
    },
    {
      question: 'How does Modified Duration estimate bond price sensitivity to interest-rate shifts?',
      answer: 'Modified Duration approximates the percentage price move for a 1.00% (100 bps) shift in market yields: ΔPrice% ≈ −ModDur × ΔYield. A bond with 7.69% Modified Duration drops roughly 7.69% if yields jump +1.00%.',
    },
    {
      question: 'When is Municipal Tax-Equivalent Yield useful?',
      answer: 'Tax-Equivalent Yield [YTM ÷ (1 − Marginal Tax Rate)] converts tax-exempt municipal bond returns into the pre-tax yield a taxable corporate or Treasury bond must offer to leave an investor with the same after-tax income.',
    },
  ],
  'tax-loss-harvesting-calculator': [
    {
      question: 'In what mandatory IRS order do harvested capital losses offset gains and income?',
      answer: 'Under IRC §1211 and §1212, net capital losses first offset same-bucket gains and remaining capital gains dollar-for-dollar (offsetting high-taxed short-term gains before preferential long-term gains when net losses remain), then deduct up to $3,000/yr ($1,500 Married Filing Separately) against ordinary income, carrying excess indefinitely forward.',
    },
    {
      question: 'What is the 30-day IRS Wash-Sale Rule (61-day window) and how do investors avoid it?',
      answer: 'Under IRC §1091, you cannot deduct a harvested loss if you or a spouse/IRA buy the same or "substantially identical" security within 30 calendar days before OR 30 days after the loss sale (61 days total). Many investors temporarily rotate into a non-identical broad index or peer sector ETF during those 31 days.',
    },
    {
      question: 'Does tax-loss harvesting permanently erase taxes or defer them?',
      answer: 'Harvesting lowers your current-year tax bill immediately while resetting the cost basis of the replacement asset lower. Wealth benefits come from earning compounded returns on reinvested tax savings, shifting short-term gain offsets into future long-term rates, or receiving a stepped-up basis at estate transfer.',
    },
  ],
};
