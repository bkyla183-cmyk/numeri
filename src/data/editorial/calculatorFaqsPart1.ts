import type { FAQItem } from '../calculatorFaqs.ts';

export const calculatorFaqsPart1: Record<string, FAQItem[]> = {
  // ==========================================================
  // FINANCE (12)
  // ==========================================================
  'loan-calculator': [
    {
      question: 'How is a fixed monthly loan payment calculated?',
      answer: 'Fixed installment loans use the standard amortization formula M = P × [r(1 + r)^n] / [(1 + r)^n − 1], where P is principal, r is the monthly interest rate (APR ÷ 12), and n is the total number of monthly payments.',
    },
    {
      question: 'Why does most of my early loan payment go toward interest?',
      answer: 'Monthly interest is charged on your remaining principal balance. In month one, the balance is at its peak, so interest consumes the largest share of your payment. As principal drops each month, progressively more of the same fixed payment goes toward principal.',
    },
    {
      question: 'Does making extra principal payments shorten my loan term?',
      answer: 'Yes. Applying additional funds directly to principal reduces the remaining balance immediately, which lowers subsequent monthly interest charges and accelerates your final payoff date—provided your lender does not charge a prepayment penalty.',
    },
  ],
  'mortgage-calculator': [
    {
      question: 'What does PITI stand for in a monthly mortgage payment?',
      answer: 'PITI stands for Principal (paying down loan debt), Interest (borrowing cost), Taxes (local property taxes held in escrow), and Insurance (homeowners hazard coverage plus Private Mortgage Insurance if your down payment is below 20%).',
    },
    {
      question: 'How does a 15-year fixed mortgage compare with a 30-year mortgage?',
      answer: 'A 15-year mortgage typically carries a slightly lower interest rate and eliminates half the repayment timeline, saving well over half of total lifetime interest, at the trade-off of higher required monthly cash flow.',
    },
    {
      question: 'How can I avoid paying Private Mortgage Insurance (PMI)?',
      answer: 'Conventional US loans waive PMI when you put at least 20% down (an 80% Loan-to-Value ratio or lower). Once equity reaches 20% through scheduled amortization or extra payments, borrowers can generally request PMI cancellation.',
    },
  ],
  'compound-interest-calculator': [
    {
      question: 'What is the difference between simple interest and compound interest?',
      answer: 'Simple interest applies only to your original deposit balance. Compound interest calculates returns on both your initial principal and all previously earned interest, creating exponential growth over long horizons.',
    },
    {
      question: 'How does the Rule of 72 estimate doubling time?',
      answer: 'Divide 72 by your expected annual percentage return to estimate how many years it takes an investment to double. For example, an 8% annual return doubles capital roughly every 72 ÷ 8 = 9 years.',
    },
    {
      question: 'What is the difference between APR and APY?',
      answer: 'APR reflects the stated nominal annual interest rate without intra-year compounding, whereas APY (Annual Percentage Yield) captures the true effective annual return after compounding frequency (monthly, quarterly, or daily) is factored in.',
    },
  ],
  'investment-calculator': [
    {
      question: 'When should I use annual additions vs. monthly compounding?',
      answer: 'Annual additions fit scenarios like yearly bonus contributions, annual IRA funding, or yearly pension top-ups, while monthly compounding models regular paycheck-based investing.',
    },
    {
      question: 'What long-term return rate should I enter for diversified equities?',
      answer: 'While historical US stock market nominal returns have averaged near 9%–10% over multi-decade spans, many planners model 6%–7% real returns to account for long-term inflation and market volatility.',
    },
    {
      question: 'Why does sequence of returns matter when retiring?',
      answer: 'Smooth fixed-rate projections do not reflect market downturns. Experiencing sharp losses early in retirement while drawing withdrawals depletes capital faster than identical average returns earned smoothly.',
    },
  ],
  'retirement-calculator': [
    {
      question: 'What is the 4% Rule for retirement planning?',
      answer: 'Based on the Trinity Study, the 4% Rule suggests withdrawing 4% of your starting portfolio in year one of retirement (adjusted annually for inflation) has historically sustained balanced stock/bond portfolios over 30-year horizons. That implies a target nest egg of 25× annual portfolio withdrawals.',
    },
    {
      question: 'How do pensions and Social Security affect my target nest egg?',
      answer: 'Guaranteed lifetime income directly reduces how much your portfolio must supply. Subtracting $20,000/year of Social Security from $60,000/year in expenses cuts the required nest egg under the 4% rule from $1.5M down to $1.0M.',
    },
    {
      question: 'Should early retirees still use a 4% withdrawal rate?',
      answer: 'For retirement horizons exceeding 35–45 years, many financial planners tighten the initial safe withdrawal rate to 3.25%–3.5% (roughly 28×–31× annual spending) for added longevity safety.',
    },
  ],
  'roi-calculator': [
    {
      question: 'Why does annualized ROI (CAGR) matter more than raw total ROI?',
      answer: 'Total ROI ignores how long money was locked up. A 40% total gain over 8 years represents 4.30% annualized growth, whereas a 40% gain over 2 years represents 18.32% annualized growth.',
    },
    {
      question: 'Which costs should be included in the initial investment basis?',
      answer: 'Include every cash outlay required to acquire and prepare the asset—brokerage commissions, closing costs, legal fees, renovation expenses, or shipping—so net ROI reflects true realized profitability.',
    },
    {
      question: 'Can Return on Investment be negative?',
      answer: 'Yes. If your ending proceeds are lower than your initial capital outlay, net profit is negative and ROI drops below 0%, reaching −100% on a complete loss of unleveraged principal.',
    },
  ],
  'currency-converter': [
    {
      question: 'Why does this currency converter ask me to enter the exchange rate?',
      answer: 'Using a custom input rate lets you plug in the exact quote offered by your bank, card issuer, broker, or mid-market feed without stale server guesses—including any spread your provider charges—completely client-side.',
    },
    {
      question: 'What is the inverse exchange rate?',
      answer: 'The inverse rate equals 1 ÷ Exchange Rate. For instance, if 1 USD = 0.92 EUR, then 1 EUR = 1 ÷ 0.92 ≈ 1.0870 USD.',
    },
    {
      question: 'Why does my bank quote differ from the mid-market rate?',
      answer: 'Banks, airports, and payment processors routinely add a 1% to 5% FX markup or hidden spread on top of the interbank mid-market spot rate, especially on weekends when currency markets are closed.',
    },
  ],
  'credit-card-payoff-calculator': [
    {
      question: 'Why can paying only the minimum keep credit card debt alive for decades?',
      answer: 'Credit card interest compounds monthly at high APRs (often 18%–29%). If your payment barely exceeds monthly accrued interest, almost nothing touches principal—and paying less than monthly interest causes negative amortization where the balance actually grows.',
    },
    {
      question: 'What happens when I enter a 0% promotional APR?',
      answer: 'At 0% APR, 100% of every payment goes directly to principal, so payoff time equals your balance divided by your monthly payment rounded up to whole months.',
    },
    {
      question: 'What is the difference between the Debt Avalanche and Debt Snowball methods?',
      answer: 'The Debt Avalanche prioritizes paying off the card with the highest APR first (minimizing total interest paid), while the Debt Snowball targets the smallest balance first to generate quick psychological wins.',
    },
  ],
  'car-loan-calculator': [
    {
      question: 'Does a trade-in reduce sales tax on a car purchase?',
      answer: 'In many US states, sales tax is assessed only on the net difference between the vehicle price and your trade-in allowance, though several states tax the full purchase price—check your local DMV rules when budgeting.',
    },
    {
      question: 'What is a sensible auto loan term length?',
      answer: 'Shorter 36- to 48-month terms minimize interest and help prevent owing more than the car is worth (negative equity) as the vehicle depreciates, whereas 72- to 84-month loans lower monthly payments at steep total interest cost.',
    },
    {
      question: 'How does down payment size change my monthly auto payment?',
      answer: 'Every extra dollar put down up front reduces your financed loan principal dollar-for-dollar, lowering both monthly payments and cumulative interest paid over the loan term.',
    },
  ],
  '401k-calculator': [
    {
      question: 'How does an employer 401(k) match work?',
      answer: 'Most employers match a percentage of your salary deferral up to a cap—for example, a 50% match up to 6% of salary means contributing 6% unlocks a free 3% employer contribution, while contributing 8% still caps the employer match at 3% of salary.',
    },
    {
      question: 'Should I always contribute enough to get the full employer match?',
      answer: 'Yes. Employer matching acts as an immediate 50% to 100% guaranteed return on those matched dollars before any market growth occurs.',
    },
    {
      question: 'What is vesting in a workplace 401(k)?',
      answer: 'Your own paycheck contributions are always 100% yours immediately, whereas employer matching contributions may follow a cliff or graded vesting schedule requiring 2 to 6 years of service before full ownership.',
    },
  ],
  'inflation-calculator': [
    {
      question: 'How does inflation erode purchasing power over time?',
      answer: 'When prices rise at rate i annually, an item costing P today costs P(1 + i)^t in t years, meaning today’s dollar buys only P / (1 + i)^t worth of goods in future constant dollars.',
    },
    {
      question: 'Which inflation rate benchmark is typically used for US long-term planning?',
      answer: 'Historically, US Consumer Price Index (CPI-U) inflation has averaged roughly 3.0%–3.3% over the past century, while Federal Reserve policy targets 2.0% long-run PCE inflation.',
    },
    {
      question: 'Why must investment returns beat inflation to create real wealth?',
      answer: 'If a savings account earns 2% while inflation runs at 3.2%, your nominal account balance rises, but your real purchasing power shrinks by roughly 1.2% per year.',
    },
  ],
  'student-loan-calculator': [
    {
      question: 'How does student loan interest accrue during repayment?',
      answer: 'Most student loans calculate interest daily based on outstanding principal balance and annual rate, while monthly amortized payments first pay accrued interest and apply the remainder to principal.',
    },
    {
      question: 'How much interest do I save by choosing a 10-year vs. 20-year student loan plan?',
      answer: 'Cutting a standard $32,000 balance at 5.5% APR from 20 years down to 10 years eliminates an entire decade of interest accrual, often saving nearly $10,000 or more over the repayment cycle.',
    },
    {
      question: 'What happens if I pay extra each month toward a student loan?',
      answer: 'Instructing your loan servicer to apply overpayments directly to principal—rather than advancing future due dates—shrinks principal immediately and cuts total lifetime interest.',
    },
  ],

  // ==========================================================
  // BUSINESS & TAX (8)
  // ==========================================================
  'gross-margin-calculator': [
    {
      question: 'What is the difference between gross margin and markup?',
      answer: 'Gross margin divides gross profit by selling revenue ((Revenue − COGS) ÷ Revenue), so margin can never reach 100% if COGS is positive. Markup divides gross profit by cost ((Revenue − COGS) ÷ COGS) and can easily exceed 100%.',
    },
    {
      question: 'What counts toward Cost of Goods Sold (COGS)?',
      answer: 'COGS includes direct raw materials, manufacturing labor, packaging, and inbound freight directly tied to producing goods sold—not overhead like office rent, marketing, or software subscriptions.',
    },
    {
      question: 'What is considered a healthy gross margin?',
      answer: 'Target margins vary widely by industry: grocery and retail often run 20%–35%, manufacturing 30%–45%, and software/SaaS products commonly exceed 70%–85% due to low per-unit delivery costs.',
    },
  ],
  'income-tax-calculator': [
    {
      question: 'Does moving into a higher tax bracket tax all of my income at the higher rate?',
      answer: 'No. US federal income tax is progressive: only the dollars earned inside each upper bracket are taxed at that marginal rate. Lower slices of your taxable income continue to be taxed at 10%, 12%, and 22%.',
    },
    {
      question: 'What is the difference between effective tax rate and marginal tax rate?',
      answer: 'Your marginal rate is the percentage applied to your very next dollar of taxable income. Your effective tax rate equals Total Income Tax ÷ Total Gross Income, representing your true blended average tax burden.',
    },
    {
      question: 'How does the standard deduction affect taxable income?',
      answer: 'The IRS subtracts the standard deduction from gross income before applying brackets: $14,600 Single, $21,900 HOH, and $29,200 MFJ in 2024—increasing to $15,000 Single, $22,500 HOH, and $30,000 MFJ for 2025.',
    },
  ],
  'sales-tax-calculator': [
    {
      question: 'How do you calculate total price after sales tax?',
      answer: 'Multiply the pre-tax item price by (1 + Tax Rate ÷ 100). For example, a $150 item with 8.25% sales tax produces $12.38 in tax and a total checkout price of $162.38.',
    },
    {
      question: 'How do I reverse-calculate the pre-tax price from a tax-inclusive receipt?',
      answer: 'Divide the total receipt amount by (1 + Tax Rate ÷ 100)—never simply subtract the percentage from the total, because sales tax was originally applied to the smaller pre-tax base.',
    },
    {
      question: 'Do sales tax rates include state, county, and city taxes?',
      answer: 'Yes. In the United States, combined checkout rates frequently stack state sales tax with county, municipal, and special transit district levies.',
    },
  ],
  'hourly-to-salary-calculator': [
    {
      question: 'Why is 2,080 hours used as the standard full-time year?',
      answer: 'A standard full-time US work schedule consists of 40 hours per week multiplied by 52 weeks per year, which equals 2,080 paid hours annually.',
    },
    {
      question: 'How do I convert an hourly rate to a quick annual salary estimate?',
      answer: 'As a quick mental rule of thumb for 40 hours/week across 52 weeks, double your hourly rate and add three zeros—for instance, $35/hour × 2 = $70,000 (~$72,800 exact).',
    },
    {
      question: 'Should I reduce paid weeks if I take unpaid time off?',
      answer: 'Yes. Freelancers and contractors who take 2 to 4 unpaid weeks off for vacation or holidays should adjust Paid Weeks per Year to 48–50 for an accurate gross annual projection.',
    },
  ],
  'salary-to-hourly-calculator': [
    {
      question: 'How do you convert an annual salary into an hourly wage?',
      answer: 'Divide your annual salary by (Weekly Work Hours × 52). At a 40-hour week (2,080 hours/year), a $75,000 salary equates to $36.06 per hour.',
    },
    {
      question: 'How does working 50 hours a week affect an exempt salary hourly equivalent?',
      answer: 'Exempt salaried roles do not pay overtime. Increasing actual hours worked from 40 to 50 hours per week lowers the effective hourly rate of a $75,000 salary from $36.06/hr down to $28.85/hr.',
    },
    {
      question: 'Is this calculation gross pay or net after-tax pay?',
      answer: 'Salary-to-hourly conversions compute gross pre-tax wages. Use the Take-Home Pay Estimator to model federal, state, and FICA payroll deductions.',
    },
  ],
  'take-home-pay-calculator': [
    {
      question: 'What is included in standard FICA payroll taxes?',
      answer: 'FICA combines 6.2% Social Security tax (up to the annual IRS wage base limit) and 1.45% Medicare tax, totaling 7.65% deducted from employee W-2 wages in addition to federal and state income tax.',
    },
    {
      question: 'How do pre-tax 401(k) and HSA/healthcare deductions affect my paycheck?',
      answer: 'Pre-tax benefit contributions lower your taxable paycheck dollar-for-dollar before federal and most state income taxes are withheld, reducing out-of-pocket paycheck shrinkage compared to post-tax savings.',
    },
    {
      question: 'Why does my actual paycheck differ slightly from a flat-percentage estimator?',
      answer: 'This estimator applies user-specified federal, state, FICA, and pre-tax inputs; real payroll checks may also adjust for local municipal taxes, post-tax disability insurance, or graduated tax withholding tables.',
    },
  ],
  'break-even-calculator': [
    {
      question: 'What is unit contribution margin in break-even analysis?',
      answer: 'Contribution margin per unit equals Selling Price minus Variable Cost per unit. Every unit sold contributes that amount toward paying down fixed overhead costs until total fixed costs are covered.',
    },
    {
      question: 'Why does the break-even calculator round units up to the next whole number?',
      answer: 'You cannot typically sell a fraction of a finished physical product. If fixed costs require 533.33 units to break even, selling 533 still leaves a small net loss, so 534 units is the true break-even threshold.',
    },
    {
      question: 'What happens if variable cost exceeds the selling price?',
      answer: 'Unit contribution margin turns negative, meaning each unit sold loses money and the business can never reach break-even by increasing sales volume alone without raising price or cutting unit costs.',
    },
  ],
  'vat-calculator': [
    {
      question: 'How do I add VAT to a net price vs. extract VAT from a gross invoice?',
      answer: 'To add VAT, multiply Net × (1 + VAT%). To reverse-extract VAT from a gross total, divide Gross ÷ (1 + VAT%) to find the net subtotal—do not multiply Gross directly by the VAT rate.',
    },
    {
      question: 'What are standard VAT rates in the UK and EU?',
      answer: 'The UK standard VAT rate is 20% (with reduced 5% and 0% tiers for essentials), while European Union standard VAT rates generally range from 17% to 27% depending on the member state.',
    },
    {
      question: 'What is the difference between US sales tax and Value-Added Tax (VAT)?',
      answer: 'US sales tax is typically added at the final retail point of sale on top of sticker prices, whereas VAT is collected at each production stage and generally included directly in displayed European retail prices.',
    },
  ],

  // ==========================================================
  // MATHEMATICS & ALGEBRA (10)
  // ==========================================================
  'scientific-calculator': [
    {
      question: 'When should I switch between DEG and RAD mode?',
      answer: 'Use DEG (Degrees) for everyday geometry, navigation, and basic right triangles (90° right angle, 360° circle). Switch to RAD (Radians) for calculus, physics waves, and engineering equations (2π radians per circle).',
    },
    {
      question: 'What is the difference between log and ln?',
      answer: 'The log button computes the common base-10 logarithm (log₁₀), while ln computes the natural logarithm using Euler’s number e ≈ 2.71828.',
    },
    {
      question: 'How does operator precedence work in scientific expressions?',
      answer: 'This parser evaluates parentheses first, then functions and right-associative exponents (^), followed by multiplication/division/modulo, and finally addition/subtraction—without using unsafe code evaluation.',
    },
  ],
  'percentage-calculator': [
    {
      question: 'How do you find what percentage one number is of another?',
      answer: 'Divide the part by the whole and multiply by 100. For example, 25 out of 200 equals (25 ÷ 200) × 100 = 12.5%.',
    },
    {
      question: 'Why does a 20% decrease followed by a 20% increase not return to 100%?',
      answer: 'Percentages always apply to the current baseline. Decreasing 100 by 20% yields 80, and increasing 80 by 20% adds only 16—landing at 96 rather than 100.',
    },
    {
      question: 'What is the difference between percent and percentage points?',
      answer: 'An interest rate rising from 4.0% to 5.0% increases by 1.0 percentage point in absolute terms, which represents a 25% relative increase.',
    },
  ],
  'fraction-calculator': [
    {
      question: 'How do you add or subtract fractions with unlike denominators?',
      answer: 'Find a common denominator—multiply each fraction top and bottom so both share the same bottom number (Least Common Multiple or cross-product), add or subtract the numerators, and simplify using the Greatest Common Divisor (GCD).',
    },
    {
      question: 'How does fraction division work ("Keep, Change, Flip")?',
      answer: 'To divide a/b by c/d, keep the first fraction a/b, change division to multiplication, and flip the second fraction to its reciprocal d/c, yielding (a × d) / (b × c).',
    },
    {
      question: 'Can this calculator convert improper fractions to mixed numbers?',
      answer: 'Yes. Whenever the reduced numerator exceeds the denominator, results display the simplified improper fraction alongside the whole-number plus remainder mixed number and decimal equivalent.',
    },
  ],
  'exponent-calculator': [
    {
      question: 'What does a negative exponent mean?',
      answer: 'A negative exponent denotes the reciprocal of the positive power: x^(−n) = 1 / x^n for non-zero x. For example, 2^(−3) = 1 / 2³ = 1/8 = 0.125.',
    },
    {
      question: 'Why does any non-zero number raised to the 0 power equal 1?',
      answer: 'By the quotient rule x^a ÷ x^a = x^(a−a) = x⁰, and any non-zero quantity divided by itself equals 1.',
    },
    {
      question: 'Can fractional exponents compute roots?',
      answer: 'Yes. Raising a positive base to 1/n computes its n-th root—for instance, 16^0.5 equals √16 = 4, and 27^(1/3) equals ∛27 = 3.',
    },
  ],
  'logarithm-calculator': [
    {
      question: 'How can you calculate a logarithm in any custom base?',
      answer: 'Using the change-of-base identity log_b(x) = ln(x) / ln(b), any positive base b ≠ 1 and positive argument x can be evaluated accurately in standard floating-point math.',
    },
    {
      question: 'Why are logarithms undefined for zero or negative numbers in real numbers?',
      answer: 'Raising a positive base b > 0 to any real exponent always produces a strictly positive number, so there is no real power y satisfying b^y ≤ 0.',
    },
    {
      question: 'Where are logarithms most commonly used?',
      answer: 'Logarithms underpin decibel sound levels, Richter earthquake scales, chemical pH acidity, algorithmic Big-O complexity (log₂ n), and continuous compound growth calculations.',
    },
  ],
  'quadratic-formula-calculator': [
    {
      question: 'What does the discriminant (b² − 4ac) tell us about the roots?',
      answer: 'If b² − 4ac > 0, the parabola crosses the x-axis twice (two distinct real roots). If it equals 0, there is one repeated real root at the vertex. If it is negative, the equation yields two complex conjugate roots involving imaginary i.',
    },
    {
      question: 'What happens if coefficient a equals 0?',
      answer: 'When a = 0, the x² term vanishes and the equation reduces to a straight line bx + c = 0 rather than a quadratic equation.',
    },
    {
      question: 'How do I find the vertex of the parabola from a, b, and c?',
      answer: 'The axis of symmetry lies at x = −b / (2a), which also sits halfway between the two roots of the quadratic equation.',
    },
  ],
  'discount-calculator': [
    {
      question: 'How do you stack two sequential store discounts like 20% off plus an extra 15%?',
      answer: 'Sequential discounts multiply rather than add: remaining price equals Original × (1 − 0.20) × (1 − 0.15) = 0.68 × Original, which is a 32% total discount rather than 35%.',
    },
    {
      question: 'Should discounts be applied before or after sales tax?',
      answer: 'In standard US/UK retail pricing, percentage store discounts apply to the pre-tax price first, and sales tax is calculated afterward on the lower discounted price.',
    },
    {
      question: 'How do you calculate the amount saved on a sale item?',
      answer: 'Multiply Original Price × (Discount % ÷ 100) to find dollars saved, then subtract that figure from the original price.',
    },
  ],
  'tip-calculator': [
    {
      question: 'How should restaurant tips be calculated—before or after sales tax?',
      answer: 'Etiquette guides generally recommend tipping on the pre-tax food and beverage subtotal, though calculating on the total receipt yields only a slightly higher dollar tip.',
    },
    {
      question: 'How do you quickly split a dinner bill plus tip evenly?',
      answer: 'Compute Total = Bill × (1 + Tip % ÷ 100) and divide by the number of guests. Everyone pays an identical share of both the meal and gratuity.',
    },
    {
      question: 'What are typical gratuity percentages for US dining?',
      answer: 'Standard table service tips in the US commonly range from 15% to 20% (with 18%–20% common for solid service), while delivery or takeout tips vary more widely.',
    },
  ],
  'linear-equation-calculator': [
    {
      question: 'How do you solve an equation in the form ax + b = c?',
      answer: 'Subtract constant b from both sides to isolate ax = c − b, then divide by non-zero coefficient a to obtain x = (c − b) / a.',
    },
    {
      question: 'What happens if coefficient a equals 0?',
      answer: 'If a = 0 and b = c, every real number x is a solution (identity). If a = 0 and b ≠ c, there is no solution (contradiction).',
    },
    {
      question: 'How can I verify my linear equation solution?',
      answer: 'Plug the calculated x value back into a·x + b and confirm it exactly equals c.',
    },
  ],
  'system-of-equations-calculator': [
    {
      question: 'How does Cramer’s Rule solve a 2×2 system of linear equations?',
      answer: 'For a₁x + b₁y = c₁ and a₂x + b₂y = c₂, compute the main determinant D = a₁b₂ − a₂b₁. Whenever D ≠ 0, the unique intersection is x = (c₁b₂ − c₂b₁) / D and y = (a₁c₂ − a₂c₁) / D.',
    },
    {
      question: 'What does a zero determinant (D = 0) mean geometrically?',
      answer: 'It means the two equations have the same slope—either they are distinct parallel lines that never intersect (no solution) or they represent the exact same line (infinitely many solutions).',
    },
    {
      question: 'When are systems of 2 equations useful in real life?',
      answer: 'They solve classic break-even comparisons between two pricing plans, mixture/concentration problems, and circuit Kirchhoff current/voltage equations.',
    },
  ],

  // ==========================================================
  // STATISTICS & PROBABILITY (5)
  // ==========================================================
  'standard-deviation-calculator': [
    {
      question: 'Should I use sample (N − 1) or population (N) standard deviation?',
      answer: 'Use sample standard deviation (dividing by N − 1, Bessel’s correction) when your dataset is a subset drawn from a larger group. Use population standard deviation (dividing by N) only when you possess measurements for every member of the entire group.',
    },
    {
      question: 'What is the relationship between variance and standard deviation?',
      answer: 'Standard deviation is simply the positive square root of variance. Because variance is in squared units (like dollars² or inches²), taking the square root brings standard deviation back into the same unit as your original data.',
    },
    {
      question: 'Can standard deviation ever be negative?',
      answer: 'No. Because squared deviations from the mean are always non-negative, standard deviation is always ≥ 0—and equals 0 only when every data value is identical.',
    },
  ],
  'z-score-calculator': [
    {
      question: 'What does a Z-score tell you?',
      answer: 'A Z-score measures exactly how many standard deviations a raw observation X sits above (positive Z) or below (negative Z) the population mean μ.',
    },
    {
      question: 'How are Z-scores used to compare scores from different exams?',
      answer: 'By standardizing two different tests (like SAT vs. ACT or physics vs. chemistry) onto a mean-0, SD-1 scale, Z-scores let you directly see which score outperformed the class distribution more strongly.',
    },
    {
      question: 'What Z-scores correspond to the 68-95-99.7 empirical rule?',
      answer: 'In a normal bell-curve distribution, roughly 68.3% of observations fall within Z ∈ [−1, +1], 95.4% within [−2, +2], and 99.7% within [−3, +3].',
    },
  ],
  'confidence-interval-calculator': [
    {
      question: 'Does a 95% confidence interval mean there is a 95% chance the true mean is inside this specific interval?',
      answer: 'Strictly in frequentist statistics, the true population mean is fixed: 95% confidence means that if you repeated the same random sampling procedure many times, 95% of the resulting intervals would capture the true population mean.',
    },
    {
      question: 'How do you cut a poll’s margin of error in half?',
      answer: 'Because margin of error scales with 1/√n, cutting the margin of error in half requires multiplying your sample size n by four (4×), assuming the same confidence level and variance.',
    },
    {
      question: 'Why does a 99% confidence interval look wider than a 90% interval—and when does Student t* apply?',
      answer: 'Higher confidence requires a larger critical value (e.g., Z* = 2.576 vs. 1.645, or 3.291 at 99.9%), widening the interval. When only the sample standard deviation s is known, the calculator uses Student’s t*(df = n − 1), which is slightly wider than Z* for small or moderate samples.',
    },
  ],
  'permutations-calculator': [
    {
      question: 'What is the main difference between permutations (nPr) and combinations (nCr)?',
      answer: 'Order matters in permutations (e.g., finishing 1st, 2nd, 3rd or setting a PIN code), whereas order does not matter in combinations (e.g., picking a committee of 3 people).',
    },
    {
      question: 'Why does 0! (zero factorial) equal 1 in nPr formulas?',
      answer: 'There is exactly 1 way to arrange zero items, and defining 0! = 1 preserves the identity nPn = n! / (n − n)! = n! / 0! = n!.',
    },
    {
      question: 'Why do calculator factorials stop or lose exact integer precision above n = 170?',
      answer: '170! is approximately 7.26 × 10^306, whereas standard IEEE 754 64-bit floating-point numbers overflow above 1.797 × 10^308 at 171!.',
    },
  ],
  'combinations-calculator': [
    {
      question: 'Why is nCr always smaller than or equal to nPr for the same n and r?',
      answer: 'Combinations divide permutations by r! (nCr = nPr / r!) because all r! reorderings of the same selected items count as a single subset.',
    },
    {
      question: 'Why is C(n, r) always equal to C(n, n − r)?',
      answer: 'Choosing r items to include in a group automatically leaves behind a unique set of n − r excluded items—known as Pascal’s symmetry identity.',
    },
    {
      question: 'Where are combinations used in everyday probability?',
      answer: 'Combinations determine lottery ticket odds (such as choosing 6 numbers from 49), poker hand counts, and quality-control random sampling subsets.',
    },
  ],

  // ==========================================================
  // GEOMETRY (5)
  // ==========================================================
  'triangle-area-calculator': [
    {
      question: 'When should you use Heron’s formula instead of ½ × base × height?',
      answer: 'Heron’s formula Area = √[s(s − a)(s − b)(s − c)] lets you find the exact area of any triangle knowing only its three side lengths a, b, and c—without measuring its perpendicular altitude.',
    },
    {
      question: 'What is the triangle inequality condition?',
      answer: 'For three side lengths to form a valid closed triangle, the sum of any two sides must strictly exceed the third side (a + b > c, a + c > b, b + c > a).',
    },
    {
      question: 'What does semi-perimeter s represent in Heron’s formula?',
      answer: 'Semi-perimeter s equals half the triangle’s perimeter: s = (a + b + c) / 2.',
    },
  ],
  'circle-calculator': [
    {
      question: 'How does doubling a circle’s radius affect its circumference vs. area?',
      answer: 'Doubling the radius doubles the circumference (2πr), because circumference scales linearly—but it quadruples (4×) the area (πr²), because area scales with radius squared.',
    },
    {
      question: 'How do you find radius if you only know the circle’s circumference?',
      answer: 'Divide the circumference by 2π: r = C / (2π), and diameter d = C / π.',
    },
    {
      question: 'Is π exact in digital circle calculators?',
      answer: 'Digital calculators use IEEE 754 double precision for π (≈ 3.141592653589793), providing 15–17 significant digits of accuracy for practical engineering and geometry.',
    },
  ],
  'pythagorean-theorem-calculator': [
    {
      question: 'Which side is always c in a² + b² = c²?',
      answer: 'Side c must always be the hypotenuse—the longest side located opposite the 90-degree right angle.',
    },
    {
      question: 'How do I solve for a missing leg instead of the hypotenuse?',
      answer: 'Rearrange the formula to solve for leg b = √(c² − a²), provided hypotenuse c is strictly longer than known leg a.',
    },
    {
      question: 'What is the 3-4-5 rule used for in construction?',
      answer: 'Because 3² + 4² = 5² (9 + 16 = 25), builders measure 3 ft along one wall, 4 ft along the perpendicular line, and adjust until the diagonal measures exactly 5 ft to confirm a true 90° square corner.',
    },
  ],
  'cylinder-calculator': [
    {
      question: 'What is the difference between lateral surface area and total surface area of a cylinder?',
      answer: 'Lateral surface area (2πrh) measures only the curved side wrapper around the cylinder, while total surface area (2πrh + 2πr²) adds the flat circular top and bottom caps.',
    },
    {
      question: 'Can this volume formula calculate liquid tank capacity?',
      answer: 'Yes. Compute cubic volume V = πr²h in meters³ or feet³, then multiply meters³ by 1,000 for liters or feet³ by 7.48052 for US gallons.',
    },
    {
      question: 'Should I enter diameter or radius into cylinder formulas?',
      answer: 'Always use radius (half of diameter). Entering diameter instead of radius produces 4× too much volume.',
    },
  ],
  'sphere-calculator': [
    {
      question: 'Why does a sphere minimize surface area for a given volume?',
      answer: 'Among all 3D shapes, a sphere encloses the greatest volume inside the smallest possible outer surface area—which is why soap bubbles, raindrops in zero gravity, and planets naturally form spheres.',
    },
    {
      question: 'What is the ratio of sphere surface area to great-circle area?',
      answer: 'A sphere’s surface area (4πr²) equals exactly four times the area of a flat circle (πr²) sharing the same radius.',
    },
    {
      question: 'How does tripling a sphere’s radius affect its volume?',
      answer: 'Because volume depends on r³ (V = 4/3 πr³), tripling the radius multiplies the enclosed volume by 3³ = 27 times.',
    },
  ],
};
