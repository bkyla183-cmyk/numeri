import { EditorialSection } from '../calculatorEditorial.ts';

export const batch2TaxBusinessEditorial: Record<string, EditorialSection> = {
  'capital-gains-tax-calculator': {
    overview:
      'The US Capital Gains Tax & NIIT Calculator computes exact 2026 federal tax on stacked Long-Term Capital Gains (0% / 15% / 20%) and Short-Term Capital Gains (ordinary brackets) using official IRS Rev. Proc. 2025-32 thresholds, plus the 3.8% Net Investment Income Tax (NIIT) and optional state capital gains tax.',
    detailedExplanation:
      'A common misconception is that all long-term capital gains are taxed flatly at 15% regardless of wages. Under US tax law, long-term gains stack ON TOP of your ordinary taxable income (after subtracting the 2026 standard deduction: $16,100 Single / $32,200 MFJ / $24,150 HOH), filling remaining room in the 0% tier before crossing into 15% and 20%—and triggering the 3.8% IRC §1411 NIIT surtax once MAGI exceeds $200,000 ($250,000 MFJ).',
    formulaDisplay: {
      formula: 'LTCG_Tax = Tax_LT(Base + LTCG) − Tax_LT(Base)   |   NIIT = 3.8% × min(NII, max(0, MAGI − Threshold))',
      variableDefinitions: [
        { symbol: 'Base', name: 'Ordinary + STG Taxable Income', description: 'W-2/ordinary + short-term gain minus 2026 standard deduction', unit: '$' },
        { symbol: 'LTCG', name: 'Long-Term Capital Gains', description: 'Assets held > 1 year (stacked into 0% / 15% / 20% 2026 tiers)', unit: '$' },
        { symbol: 'NIIT', name: 'Net Investment Income Tax', description: '3.8% surtax above $200k (Single/HOH) or $250k (MFJ) MAGI', unit: '$' },
      ],
    },
    workedExample: {
      scenario: 'Single filer in 2026 earning $95,000 W-2 income, realizing $5,000 short-term gain and $65,000 long-term gain in a 5.0% capital-gains tax state.',
      inputs: [
        { name: 'Ordinary Income / Filing Status', value: '$95,000 / Single ($16,100 Std Ded)' },
        { name: 'Short-Term / Long-Term Gain', value: '$5,000 STG / $65,000 LTCG' },
        { name: 'State Capital Gains Rate', value: '5.0%' },
      ],
      steps: [
        'Ordinary Taxable Income = $95,000 − $16,100 = $78,900; adding $5,000 STG brings base to $83,900 (22% marginal tier) → STG Federal Tax = $1,100.00.',
        'Long-Term Gain ($65,000) stacks from $83,900 to $148,900—entirely inside Single 2026 15% LTCG bracket ($49,451–$545,500) → LTCG Tax = $9,750.00.',
        'MAGI = $165,000 (< $200,000 NIIT threshold) → NIIT = $0.00; State Tax (5% × $70,000) = $3,500.00.',
      ],
      result: '$14,350.00 Total Capital Gains Tax (20.50% Effective Rate; $55,650.00 Net)',
      interpretation: 'Even though ordinary + LTCG stayed within the 15% federal LTCG bracket without hitting the 3.8% NIIT, short-term gains (22%) and 5% state tax lift total gain taxes to 20.50%.',
    },
    regulatoryAndStandards: {
      title: 'IRS Rev. Proc. 2025-32 (Tax Year 2026) Brackets & NIIT',
      description: 'Implements exact statutory 2026 US capital-gains thresholds and deduction ceilings:',
      points: [
        '2026 Standard Deductions: $16,100 (Single/MFS), $32,200 (MFJ), $24,150 (HOH).',
        '2026 0% LTCG Ceiling: Up to $49,450 (Single/MFS), $98,900 (MFJ), $66,200 (HOH); 20% kicks in above $545,500 (Single) / $613,700 (MFJ).',
        '3.8% NIIT (IRC §1411): Unindexed statutory MAGI thresholds remain $200,000 (Single/HOH), $250,000 (MFJ), and $125,000 (MFS).',
      ],
    },
    countryContext: {
      summary: 'Built for US 2026 federal + state capital gains; key international CGT distinctions:',
      markets: [
        { region: 'United States', standard: 'Rev. Proc. 2025-32 2026 0%/15%/20% LTCG tiers + 3.8% NIIT + ordinary STG stacking.', unitsOrCurrency: 'USD ($)', effectiveDate: 'Tax Year 2026' },
        { region: 'UK / Canada / Australia', standard: 'UK charges 18%/24% CGT above £3,000 allowance; Canada includes 50% of gains at marginal rate; Australia discounts held >12m assets by 50%.', unitsOrCurrency: 'GBP / CAD / AUD', effectiveDate: '2026' },
      ],
    },
    references: [
      { name: 'IRS Revenue Procedure 2025-32 — 2026 Inflation Adjustments', organization: 'Internal Revenue Service (IRS)', url: 'https://www.irs.gov/pub/irs-drop/rp-25-32.pdf', effectiveDate: 'Tax Year 2026', note: 'Official 2026 ordinary brackets, standard deductions, and 0%/15%/20% LTCG thresholds.' },
      { name: 'Topic No. 409: Capital Gains and Losses & NIIT', organization: 'IRS', url: 'https://www.irs.gov/taxtopics/tc409', effectiveDate: '2026', note: 'Holding period (>1 year) rules and Net Investment Income Tax overview.' },
    ],
    commonMistakes: {
      title: 'Selling 11 Months After Purchase Instead of Waiting Past 366 Days',
      explanation: 'Selling even one day short of 1 year reclassifies gains from 0%/15% LTCG into 22%–37% ordinary income—costing 7–22 percentage points extra tax.',
    },
    proTips: [
      'Harvest unrealized losses before December 31 using our Tax-Loss Harvesting Calculator to neutralize higher-taxed short-term gains first.',
      'Retirees with low W-2 income can intentionally realize gains up to the 2026 0% LTCG ceiling ($98,900 MFJ / $49,450 Single taxable) tax-free.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq US Tax & Wealth Desk',
      reviewDate: 'November 2026',
      accuracyStandard: 'Verified against IRS Rev. Proc. 2025-32 2026 statutory ordinary, LTCG, and §1411 NIIT stacking math.',
    },
    eeat: {
      authorRole: 'Numeriq US Tax Editorial Team',
      reviewerRole: 'Numeriq Quantitative Validation Desk',
      methodology: 'Deducts 2026 IRS standard deduction from ordinary+STG income, computes incremental ordinary tax on STG, stacks LTCG over the ordinary base across 2026 LTCG brackets, and evaluates §1411 NIIT.',
      lastVerifiedDate: '2026-11-19',
      taxOrRegulationYear: 'US IRS Tax Year 2026 (Rev. Proc. 2025-32)',
      limitations: [
        'Does not model 28% collectibles rates, 25% unrecaptured §1250 real-estate depreciation, or AMT/ISO preferences.',
        'Assumes standard deduction rather than itemized Schedule A deductions.',
      ],
      nonAdviceDisclaimer: 'Educational US federal/state capital gains tax estimator only; consult a licensed CPA before executing large liquidations.',
    },
    relatedCalculatorSlugs: ['tax-loss-harvesting-calculator', 'income-tax-calculator', 'cagr-calculator', 'real-rate-of-return-calculator'],
  },

  'uk-take-home-pay-calculator': {
    overview:
      'The UK Take-Home Pay Calculator (2026–27) translates gross annual salary into exact annual, monthly, and weekly net pay across England/Wales/NI and Scotland—incorporating HMRC 2026–27 PAYE bands, the £100k–£125,140 Personal Allowance taper, Class 1 Employee National Insurance (8%/2%), pension salary sacrifice, and Student Loan Plans 1–5 & Postgraduate.',
    detailedExplanation:
      'Crossing £100,000 in the UK triggers an effective 60% marginal Income Tax band between £100,000 and £125,140 because every £2 of income strips £1 of your £12,570 tax-free Personal Allowance. Pension salary sacrifice reduces Adjusted Net Income below £100k while saving both 40%–60% tax and 2%–8% National Insurance simultaneously.',
    formulaDisplay: {
      formula: 'PA = max(0, 12,570 − max(0, AdjInc − 100,000)÷2)   |   NI = 8%(£12,570–£50,270) + 2%(>£50,270)',
      variableDefinitions: [
        { symbol: 'PA', name: 'Tapered Personal Allowance', description: '£12,570 base allowance tapering to £0 at £125,140 income', unit: '£' },
        { symbol: 'Class 1 NI', name: 'Employee National Insurance', description: '8% main rate (£12,570–£50,270) + 2% above £50,270', unit: '£/yr' },
        { symbol: 'Plan 2 SL', name: 'Student Loan Repayment', description: '9% above £29,385 (2026–27 statutory Plan 2 threshold)', unit: '£/yr' },
      ],
    },
    workedExample: {
      scenario: 'A £55,000 employee in England with 5% pension salary sacrifice and a Plan 2 Student Loan in tax year 2026–27.',
      inputs: [
        { name: 'Gross Salary / UK Region', value: '£55,000 / England, Wales & NI' },
        { name: 'Pension Salary Sacrifice / Student Loan', value: '5% (£2,750/yr) / Plan 2 (£29,385)' },
      ],
      steps: [
        'Salary-Sacrificed Income = £55,000 − £2,750 = £52,250 (full £12,570 PA retained).',
        '2026–27 Income Tax: 20% on £37,700 (£7,540) + 40% on £1,980 above £50,270 (£792) = £8,332.00/yr.',
        'Class 1 Employee NI: 8% on (£50,270 − £12,570) = £3,016 + 2% on (£52,250 − £50,270) = £39.60 → £3,055.60/yr.',
        'Plan 2 Student Loan: 9% × (£52,250 − £29,385) = £2,057.85/yr → Net Pay = £38,804.55/yr (£3,233.71/mo).',
      ],
      result: '£3,233.71/month Net UK Take-Home Pay (£38,804.55/yr)',
      interpretation: 'Notice how 5% pension sacrifice drops taxable earnings from £55,000 toward £52,250, avoiding the 40% rate on most of the pension contribution.',
    },
    regulatoryAndStandards: {
      title: 'HMRC 2026–27 PAYE, Class 1 NI & SLC Student Loan Thresholds',
      description: 'Uses official UK statutory payroll rates for 6 April 2026 – 5 April 2027:',
      points: [
        'England/Wales/NI Income Tax: £12,570 PA, 20% Basic (£12,571–£50,270), 40% Higher (£50,271–£125,140), 45% Additional (>£125,140), with 19%–48% Scottish bands supported.',
        'Class 1 Employee NI: 8% between £12,570 PT and £50,270 UEL; 2% above £50,270.',
        '2026–27 Student Loans: Plan 1 (£26,065 @ 9%), Plan 2 (£29,385 @ 9%), Plan 4 (£32,745 @ 9%), Plan 5 (£25,000 @ 9%), Postgraduate (£21,000 @ 6%).',
      ],
    },
    countryContext: {
      summary: 'Covers all four UK nations (England, Wales, NI, and Scotland) alongside Numeriq’s US/CA/AU/NZ payroll peers:',
      markets: [
        { region: 'England / Wales / NI', standard: 'HMRC 3-rate structure (20%/40%/45%) above £12,570 Personal Allowance.', unitsOrCurrency: 'GBP (£)', effectiveDate: '2026–27' },
        { region: 'Scotland', standard: '6-tier Scottish Income Tax (19%, 20%, 21%, 42%, 45%, 48%) with identical £12,570 PA and UK NI/SLC rules.', unitsOrCurrency: 'GBP (£)', effectiveDate: '2026–27' },
      ],
    },
    references: [
      { name: 'Income Tax Rates and Personal Allowances', organization: 'HM Revenue & Customs (GOV.UK)', url: 'https://www.gov.uk/income-tax-rates', effectiveDate: '2026–27', note: 'Official PA £12,570, £100k taper rule, and 20%/40%/45% bands.' },
      { name: 'National Insurance Rates and Thresholds', organization: 'GOV.UK / HMRC', url: 'https://www.gov.uk/national-insurance-rates-letters', effectiveDate: '2026–27', note: 'Category A Employee 8% / 2% rates and PT/UEL thresholds.' },
      { name: 'Repaying Your Student Loan: Thresholds', organization: 'Student Loans Company / GOV.UK', url: 'https://www.gov.uk/repaying-your-student-loan/what-you-pay', effectiveDate: '2026–27', note: '2026–27 repayment thresholds across Plans 1, 2, 4, 5, and Postgraduate.' },
    ],
    commonMistakes: {
      title: 'Entering the 60% Effective Marginal Trap Above £100,000 Without Checking Salary Sacrifice',
      explanation: 'Earning £115,000 costs 40% income tax + 20% PA withdrawal = 60% tax plus 2% NI on £100k–£115k. Contributing £15,000 to a pension via salary sacrifice costs well under £5,700 in net pay.',
    },
    proTips: [
      'Remember UK pension Annual Allowance is £60,000; salary sacrifice saves both Income Tax and Employee NI (unlike Relief-at-Source).',
      'Check your exact tax code (standard 1257L) on your payslip if you receive taxable Benefits in Kind (BIK).',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq UK Payroll & Tax Desk',
      reviewDate: 'November 2026',
      accuracyStandard: 'Verified against HMRC 2026–27 England/Wales/NI and Scottish tax bands, NI 8%/2%, and Plan 2 £29,385 SLC threshold.',
    },
    eeat: {
      authorRole: 'Numeriq UK Tax Editorial Team',
      reviewerRole: 'Numeriq Quantitative Validation Desk',
      methodology: 'Deducts pension salary sacrifice before applying PA taper, HMRC England/Wales/NI or Scottish progressive bands, Class 1 NI, and SLC student loan thresholds.',
      lastVerifiedDate: '2026-11-19',
      taxOrRegulationYear: 'UK HMRC 2026–27 Tax Year',
      limitations: [
        'Models pension contributions as Salary Sacrifice (reducing NI and student loan base) rather than Relief-at-Source.',
        'Assumes standard 1257L tax code without Marriage Allowance transfers or taxable Benefits in Kind.',
      ],
      nonAdviceDisclaimer: 'Educational UK PAYE estimate only; consult HMRC or a UK chartered accountant for exact payroll coding or £100k+ tax-free childcare cliff planning.',
    },
    relatedCalculatorSlugs: ['uk-pension-drawdown-calculator', 'uk-stamp-duty-calculator', 'take-home-pay-calculator', 'canada-income-tax-calculator'],
  },

  'canada-income-tax-calculator': {
    overview:
      'The Canada Income Tax & Payroll Calculator (2026) computes net after-tax take-home pay across Ontario, British Columbia, Alberta, and Quebec—integrating CRA 2026 Federal Tax brackets (14.0% lowest tier), the phased 2026 Basic Personal Amount (C$16,452 → C$14,829), 2026 CPP + CPP2 (C$74,600 / C$85,000 ceilings), and 2026 EI (1.63% up to C$68,900).',
    detailedExplanation:
      'Canadian payroll combines federal progressive tax, provincial income tax, non-refundable tax credits, and two-tier Canada Pension Plan deductions. Notice two important 2026 updates: the lowest federal rate stands at 14.0%, CPP covers earnings from C$3,500 to C$74,600 (5.95%), and CPP2 adds 4.0% between C$74,600 and C$85,000 as an income tax deduction rather than a credit.',
    formulaDisplay: {
      formula: 'Net = Gross − RRSP − NetFedTax − ProvTax − [5.95% CPP + 4% CPP2 + 1.63% EI]',
      variableDefinitions: [
        { symbol: 'Fed BPA', name: '2026 Basic Personal Amount', description: 'C$16,452 phasing down to C$14,829 between C$181,440 and C$258,482', unit: 'CAD' },
        { symbol: 'CPP / CPP2', name: '2026 Pension Plan Tiers', description: '5.95% ($3.5k–$74.6k, max $4,230.45) + 4% CPP2 ($74.6k–$85k, max $416)', unit: 'CAD' },
        { symbol: 'EI', name: '2026 Employment Insurance', description: '1.63% up to C$68,900 Maximum Insurable Earnings (max C$1,123.07)', unit: 'CAD' },
      ],
    },
    workedExample: {
      scenario: 'Ontario employee earning C$95,000 in 2026 with a C$5,000 RRSP contribution.',
      inputs: [
        { name: 'Gross Income / Province / RRSP', value: 'C$95,000 / Ontario (ON) / C$5,000' },
      ],
      steps: [
        '2026 CPP = (C$74,600 − C$3,500) × 5.95% = C$4,230.45; CPP2 = (C$85,000 − C$74,600) × 4.0% = C$416.00 (Total C$4,646.45). EI = C$68,900 × 1.63% = C$1,123.07.',
        'Net Federal Taxable Income = C$95,000 − C$5,000 RRSP − C$416 CPP2 = C$89,584.00 → Gross Fed Tax = C$14,560.72 less 14% credits on (C$16,452 BPA + C$4,230.45 CPP + C$1,123.07 EI + C$1,501 Emp Amt) = C$11,297.81.',
        'Ontario Provincial Tax (net of ON BPA/CPP/EI 5.05% credits) = C$5,061.11 → Net Cash Take-Home = C$67,871.56/yr (C$5,655.96/mo).',
      ],
      result: 'C$67,871.56/yr Net Canadian Take-Home Pay (C$5,655.96/mo)',
      interpretation: 'RRSP deductions reduce BOTH federal and Ontario income tax at your combined marginal bracket (~31.48%), turning a C$5,000 contribution into ~C$1,574 of immediate tax relief.',
    },
    regulatoryAndStandards: {
      title: 'CRA 2026 Statutory Tax Brackets, CPP/CPP2 & EI Limits',
      description: 'Aligned with official 2026 Canada Revenue Agency indexation and payroll ceilings:',
      points: [
        '2026 Federal Brackets: 14.0% (to C$58,523), 20.5% (to C$117,045), 26.0% (to C$181,440), 29.0% (to C$258,482), 33.0% (>C$258,482).',
        '2026 CPP & CPP2 Ceilings: YMPE = C$74,600 (max C$4,230.45); YAMPE = C$85,000 (max C$416.00); EI MIE = C$68,900 (1.63%, max C$1,123.07).',
      ],
    },
    countryContext: {
      summary: 'Models Ontario, British Columbia, Alberta, and Quebec (including the 16.5% federal Quebec Abatement):',
      markets: [
        { region: 'Ontario / BC / Alberta', standard: 'CRA 2026 federal tax + representative provincial brackets and credits.', unitsOrCurrency: 'CAD (C$)', effectiveDate: 'CRA 2026' },
        { region: 'Quebec', standard: 'Includes the 16.5% federal Quebec Tax Abatement alongside Quebec provincial brackets (QPP/QPIP variances noted).', unitsOrCurrency: 'CAD (C$)', effectiveDate: 'CRA 2026' },
      ],
    },
    references: [
      { name: 'Tax Rates and Income Brackets for Individuals (2026)', organization: 'Canada Revenue Agency (CRA)', url: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/frequently-asked-questions-individuals/canadian-income-tax-rates-individuals-current-previous-years.html', effectiveDate: '2026', note: 'Official CRA federal and provincial tax brackets and Basic Personal Amount.' },
      { name: 'CPP Contribution Rates, Maximums and Exemptions', organization: 'CRA', url: 'https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/payroll-deductions-contributions/canada-pension-plan-cpp/cpp-contribution-rates-maximums-exemptions.html', effectiveDate: '2026', note: '2026 YMPE C$74,600, YAMPE C$85,000, and 5.95%/4.0% statutory rates.' },
    ],
    commonMistakes: {
      title: 'Forgetting That CPP2 Applies Only Between C$74,600 and C$85,000',
      explanation: 'Earnings below C$74,600 pay zero CPP2; only dollars in the C$10,400 second-ceiling band incur the 4.0% CPP2 deduction (capped at C$416/yr).',
    },
    proTips: [
      'Pair this calculator with our Canada RRSP vs TFSA Calculator to compare whether taking the RRSP deduction or funding a TFSA maximizes retirement wealth.',
      'Ontario high-earners should note additional Ontario Health Premium (up to C$900/yr) and provincial surtaxes on higher brackets.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Canada Payroll & Tax Desk',
      reviewDate: 'November 2026',
      accuracyStandard: 'Verified against 2026 CRA 14%/20.5%/26%/29%/33% federal brackets, phased BPA, CPP/CPP2 (C$74.6k/C$85k), and EI (C$68.9k).',
    },
    eeat: {
      authorRole: 'Numeriq Canada Tax Editorial Team',
      reviewerRole: 'Numeriq Quantitative Validation Desk',
      methodology: 'Deducts RRSP and CPP2 from gross income, applies 2026 CRA federal/provincial progressive tiers less lowest-bracket non-refundable credits, and subtracts CPP, CPP2, and EI payroll deductions.',
      lastVerifiedDate: '2026-11-19',
      taxOrRegulationYear: 'Canada CRA 2026 Tax Year',
      limitations: [
        'Does not model Ontario Surtax, Ontario Health Premium, or Quebec QPP/QPIP vs. Federal CPP/EI slight rate differences.',
        'Assumes standard employment income (T4) rather than self-employed double CPP contributions.',
      ],
      nonAdviceDisclaimer: 'Educational Canadian payroll illustration only; review your CRA Notice of Assessment and Revenu Québec filings for exact balances.',
    },
    relatedCalculatorSlugs: ['canada-rrsp-tfsa-calculator', 'uk-take-home-pay-calculator', 'australia-income-tax-calculator', 'income-tax-calculator'],
  },

  'australia-income-tax-calculator': {
    overview:
      'The Australia Income Tax & HECS-HELP Calculator computes FY 2026–27 resident take-home pay using ATO’s reduced 15% tax bracket (1 July 2026), Low Income Tax Offset (LITO), 2% Medicare Levy (+ MLS check), and ATO’s new marginal HECS-HELP repayment tiers.',
    detailedExplanation:
      'Beginning 1 July 2026 (FY 2026–27), Australia lowers the second tax bracket rate from 16% to 15% (A$18,201–A$45,000) while applying a marginal HECS-HELP repayment scale above A$69,528—eliminating the old sudden "cliff jumps" across middle incomes. Meanwhile, mandatory employer 12% Superannuation Guarantee sits on top of base salary.',
    formulaDisplay: {
      formula: 'Net = Taxable − [ATO_Tax − LITO] − 2% Medicare − MLS − MarginalHELP(RepayInc)',
      variableDefinitions: [
        { symbol: 'Taxable', name: 'Assessable Taxable Income', description: 'Gross salary minus pre-tax Super salary sacrifice', unit: 'A$' },
        { symbol: 'RepayInc', name: 'HELP Repayment Income', description: 'Taxable income plus added-back reportable Super salary sacrifice', unit: 'A$' },
        { symbol: 'HELP 26-27', name: 'Marginal HELP Schedule', description: '0% ≤A$69,528; 15c/$1 to A$129,717; A$9,028 + 17c/$1 to A$186,050; 10% total ≥A$186,051', unit: 'A$/yr' },
      ],
    },
    workedExample: {
      scenario: 'Australian resident earning A$115,000 gross in FY 2026–27 with HECS-HELP debt, private hospital cover, and $0 salary sacrifice.',
      inputs: [
        { name: 'Gross Salary / Salary Sacrifice', value: 'A$115,000 / A$0' },
        { name: 'HECS-HELP / Private Hospital Cover', value: 'Yes (Marginal Scale) / Yes (No MLS)' },
      ],
      steps: [
        'FY 2026–27 ATO Tax: 0% to A$18.2k + 15% (A$18.2k–A$45k = A$4,020) + 30% (A$45k–A$115k = A$21,000) = A$25,020.00 (LITO = $0).',
        '2% Medicare Levy = A$115,000 × 2% = A$2,300.00.',
        'FY 2026–27 Marginal HECS-HELP = (A$115,000 − A$69,528) × 15% = A$6,820.80.',
        'Annual Net Take-Home = A$80,859.20 (A$6,738.27/mo or A$3,109.97/fortnight), plus A$13,800.00 employer 12% SG Super.',
      ],
      result: 'A$80,859.20/yr Net Australian Take-Home (A$3,109.97/fortnight)',
      interpretation: 'Notice how the FY 2026–27 marginal HELP formula taxes only the A$45,472 slice above A$69,528 at 15% (A$6,820.80) rather than charging a flat percentage against all A$115,000.',
    },
    regulatoryAndStandards: {
      title: 'ATO FY 2026–27 Individual Income Tax & Marginal HELP Repayment Tiers',
      description: 'Reflects official Australian Taxation Office statutory schedules effective 1 July 2026:',
      points: [
        'FY 2026–27 Resident Brackets: $0–$18,200 (0%), $18,201–$45,000 (15%), $45,001–$135,000 (30%), $135,001–$190,000 (37%), >$190,000 (45%).',
        'Medicare Levy (2%) & MLS: Standard 2% levy applies above low-income thresholds; singles above A$101k without private hospital cover incur 1%–1.5% Medicare Levy Surcharge.',
        'Marginal HECS-HELP (FY 2026–27): Nil ≤A$69,528; 15c/$1 (A$69,529–A$129,717); A$9,028 + 17c/$1 (A$129,718–A$186,050); 10% total ≥A$186,051.',
      ],
    },
    countryContext: {
      summary: 'Tailored for Australian tax residents alongside our ATO Superannuation calculator and NZ/CA/UK/US peers:',
      markets: [
        { region: 'Australia', standard: 'Exact FY 2026–27 15% second bracket, LITO, 2% Medicare, MLS, and marginal HELP schedule.', unitsOrCurrency: 'AUD (A$)', effectiveDate: 'FY 2026–27 (1 Jul 2026)' },
        { region: 'New Zealand', standard: 'Use our New Zealand PAYE Calculator for IRD 2026–27 brackets, ACC 1.75%, and KiwiSaver.', unitsOrCurrency: 'NZD (NZ$)', effectiveDate: '2026–27' },
      ],
    },
    references: [
      { name: 'Individual Income Tax Rates (2026–27)', organization: 'Australian Taxation Office (ATO)', url: 'https://www.ato.gov.au/tax-rates-and-codes/tax-rates-australian-residents', effectiveDate: 'FY 2026–27', note: 'Statutory 15%/30%/37%/45% resident income tax thresholds effective 1 July 2026.' },
      { name: 'Study and Training Support Loans Repayment Thresholds & Rates', organization: 'ATO', url: 'https://www.ato.gov.au/tax-rates-and-codes/study-and-training-support-loans-repayment-thresholds-and-rates', effectiveDate: 'FY 2026–27', note: 'Official marginal HECS-HELP repayment brackets above A$69,528.' },
    ],
    commonMistakes: {
      title: 'Thinking Super Salary Sacrifice Lowers Mandatory HECS-HELP Repayments',
      explanation: 'ATO adds Reportable Employer Super Contributions right back into your Repayment Income—so salary sacrificing reduces income tax but does NOT reduce your HELP repayment.',
    },
    proTips: [
      'Check if your total concessional Super (12% SG + salary sacrifice) fits within the FY 2026–27 A$32,500 cap using our Australian Superannuation Calculator.',
      'Singles earning just over A$101,000 frequently pay less for basic private hospital cover than the 1%–1.5% Medicare Levy Surcharge.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Australia Tax & Super Desk',
      reviewDate: 'November 2026',
      accuracyStandard: 'Verified against ATO FY 2026–27 15% bracket cut, LITO phase-out, 2% Medicare Levy, and marginal HECS-HELP thresholds.',
    },
    eeat: {
      authorRole: 'Numeriq Australia Tax Editorial Team',
      reviewerRole: 'Numeriq Quantitative Validation Desk',
      methodology: 'Deducts Super salary sacrifice for income tax and Medicare Levy while adding it back to Repayment Income for MLS and FY 2026–27 marginal HELP calculations.',
      lastVerifiedDate: '2026-11-19',
      taxOrRegulationYear: 'Australia ATO FY 2026–27 (1 Jul 2026 – 30 Jun 2027)',
      limitations: [
        'Applies single taxpayer Medicare Levy Surcharge threshold (A$101k) without family dependent adjustments.',
        'Assumes full-year Australian tax residency and no HELP balance cap check.',
      ],
      nonAdviceDisclaimer: 'Educational Australian PAYG estimate only; verify exact tax and HELP balances via your myGov ATO portal.',
    },
    relatedCalculatorSlugs: ['superannuation-calculator', 'nz-paye-calculator', 'uk-take-home-pay-calculator', 'canada-income-tax-calculator'],
  },

  'nz-paye-calculator': {
    overview:
      'The New Zealand PAYE & KiwiSaver Calculator computes 2026–27 net take-home pay using Inland Revenue (IRD) income tax brackets, the 1.75% ACC Earners’ Levy (capped at NZ$156,641 liable earnings), Independent Earner Tax Credit (IETC), KiwiSaver deductions, and the 12% NZ Student Loan threshold (NZ$24,128).',
    detailedExplanation:
      'New Zealand deducts progressive PAYE income tax across five bands (10.5% to 39%), a flat 1.75% ACC Earners’ Levy up to NZ$156,641 (NZ$2,741.22 max in 2026–27), employee KiwiSaver savings (minimum 3%), and 12% Student Loan repayments on every dollar above NZ$24,128.',
    formulaDisplay: {
      formula: 'Net = Gross − PAYE(10.5%–39%) + IETC − min(Gross, 156,641)×1.75% − KiwiSaver − 12%×max(0, Gross−24,128)',
      variableDefinitions: [
        { symbol: 'PAYE', name: 'IRD 2026–27 Income Tax', description: 'Progressive tiers: 10.5% (to $15.6k), 17.5% ($53.5k), 30% ($78.1k), 33% ($180k), 39% (>$180k)', unit: 'NZ$/yr' },
        { symbol: 'ACC', name: '2026–27 ACC Earners Levy', description: '1.75% ($1.75 per $100) capped at NZ$156,641 earnings (max NZ$2,741.22)', unit: 'NZ$/yr' },
        { symbol: 'SL 12%', name: 'Student Loan Deduction', description: '12% of annual income above NZ$24,128 threshold', unit: 'NZ$/yr' },
      ],
    },
    workedExample: {
      scenario: 'New Zealand employee earning NZ$85,000/yr in 2026–27 with 3% KiwiSaver and an active NZ Student Loan (SL tax code).',
      inputs: [
        { name: 'Gross Salary / KiwiSaver / Student Loan', value: 'NZ$85,000 / 3% / Yes (12% > NZ$24,128)' },
      ],
      steps: [
        'IRD 2026–27 PAYE: 10.5% ($15.6k = $1,638) + 17.5% ($37.9k = $6,632.50) + 30% ($24.6k = $7,380) + 33% ($6.9k = $2,277) = NZ$17,927.50.',
        '2026–27 ACC Earners’ Levy: NZ$85,000 × 1.75% = NZ$1,487.50.',
        'KiwiSaver (3%) = NZ$2,550.00/yr; Student Loan: (NZ$85,000 − NZ$24,128) × 12% = NZ$7,304.64/yr.',
        'Annual Net Pay = NZ$55,730.36/yr (NZ$2,143.48/fortnight | NZ$4,644.20/mo).',
      ],
      result: 'NZ$55,730.36/yr Net Take-Home Pay (NZ$2,143.48/fortnight)',
      interpretation: 'On NZ$85,000, IRD PAYE and ACC take 22.84% while KiwiSaver (3%) and the 12% student loan obligation account for another NZ$9,854.64 in payroll deductions.',
    },
    regulatoryAndStandards: {
      title: 'IRD & ACC 2026–27 New Zealand Statutory Payroll Parameters',
      description: 'Follows Inland Revenue and ACC rules for 1 April 2026 – 31 March 2027:',
      points: [
        '2026–27 IRD Brackets: NZ$0–NZ$15,600 (10.5%), NZ$15,601–NZ$53,500 (17.5%), NZ$53,501–NZ$78,100 (30.0%), NZ$78,101–NZ$180,000 (33.0%), >NZ$180,000 (39.0%).',
        '2026–27 ACC Earners’ Levy: NZ$1.75 per NZ$100 (1.75%) up to NZ$156,641 maximum liable earnings.',
        'Student Loan & IETC: 12% deduction above NZ$24,128; IETC NZ$520 credit applies between NZ$24,000 and NZ$66,000 (abating to NZ$70,000).',
      ],
    },
    countryContext: {
      summary: 'Dedicated to New Zealand M / M SL PAYE taxpayers alongside Australian, UK, Canadian, and US calculators:',
      markets: [
        { region: 'New Zealand', standard: 'Exact IRD 2026–27 brackets, ACC 1.75% cap, IETC, KiwiSaver, and NZ$24,128 Student Loan rules.', unitsOrCurrency: 'NZD (NZ$)', effectiveDate: '2026–27 (Apr 2026)' },
        { region: 'Australia', standard: 'Use our Australia Income Tax Calculator for ATO FY 2026–27 15% bracket, Medicare Levy, and HELP.', unitsOrCurrency: 'AUD (A$)', effectiveDate: 'FY 2026–27' },
      ],
    },
    references: [
      { name: 'Tax Rates for Individuals (PAYE)', organization: 'Inland Revenue (IRD NZ)', url: 'https://www.ird.govt.nz/income-tax/income-tax-for-individuals/tax-codes-and-tax-rates-for-individuals/tax-rates-for-individuals', effectiveDate: '2026–27', note: 'Statutory 10.5%–39.0% New Zealand individual tax brackets.' },
      { name: 'Earners’ Levy & Student Loan Thresholds', organization: 'ACC New Zealand & IRD', url: 'https://www.ird.govt.nz/student-loans/living-or-working-in-new-zealand/repaying-my-student-loan-when-i-earn-salary-or-wages', effectiveDate: '2026–27', note: 'NZ$24,128 annual / NZ$464 weekly Student Loan threshold and 12% deduction.' },
    ],
    commonMistakes: {
      title: 'Ignoring Employer ESCT Tax When Checking Total KiwiSaver Growth',
      explanation: 'Your 3% employee KiwiSaver comes out of after-tax net pay, whereas your employer’s matching 3% contribution incurs Employer Superannuation Contribution Tax (ESCT) before entering your account.',
    },
    proTips: [
      'Contribute at least 3% to KiwiSaver to receive both the mandatory 3% employer match and the annual NZ Government contribution top-up.',
      'Remember ACC levy stops applying to every dollar earned above NZ$156,641 in 2026–27.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq ANZ Payroll & Tax Desk',
      reviewDate: 'November 2026',
      accuracyStandard: 'Verified against IRD 2026–27 brackets, NZ$156,641 ACC cap @ 1.75%, and NZ$24,128 Student Loan threshold.',
    },
    eeat: {
      authorRole: 'Numeriq ANZ Tax Editorial Team',
      reviewerRole: 'Numeriq Quantitative Validation Desk',
      methodology: 'Integrates gross NZ salary across IRD 2026–27 tiers, adjusts for IETC, caps ACC at NZ$156,641, and deducts employee KiwiSaver + 12% SL above NZ$24,128.',
      lastVerifiedDate: '2026-11-19',
      taxOrRegulationYear: 'New Zealand IRD 2026–27 Tax Year (1 Apr 2026 – 31 Mar 2027)',
      limitations: [
        'Assumes standard M / M SL primary-employment tax code with no secondary income or Working for Families tax credits.',
        'Does not calculate employer KiwiSaver match or ESCT.',
      ],
      nonAdviceDisclaimer: 'Educational New Zealand PAYE estimate only; verify your exact PAYE code and student loan balance inside myIR.',
    },
    relatedCalculatorSlugs: ['australia-income-tax-calculator', 'uk-take-home-pay-calculator', 'canada-income-tax-calculator', 'take-home-pay-calculator'],
  },

  'self-employment-tax-calculator': {
    overview:
      'The Self-Employment & Quarterly Tax Calculator estimates 2026 Schedule C / 1099 Self-Employment Tax (12.4% Social Security up to the $184,500 wage cap + 2.9% Medicare on 92.35% of net profit), 50% SE tax deduction, 20% §199A QBI deduction, federal/state income tax, and exact Form 1040-ES quarterly installment payments.',
    detailedExplanation:
      'Independent contractors and sole proprietors pay BOTH the employee and employer halves of FICA (15.3%), calculated on 92.35% of net profit rather than 100%. You then deduct half of your Self-Employment tax above the line plus the 2026 Standard Deduction and up to 20% Qualified Business Income (§199A) before applying 2026 federal tax brackets—and coordinate any W-2 wages against the $184,500 Social Security ceiling.',
    formulaDisplay: {
      formula: 'SE_Base = Profit × 0.9235   |   SE_Tax = 12.4%·min(SE_Base, max(0, 184,500 − W2)) + 2.9%·SE_Base',
      variableDefinitions: [
        { symbol: '92.35%', name: 'IRS Schedule SE Multiplier', description: 'Statutory 7.65% adjustment equivalent to employer-half FICA deductibility', unit: 'Ratio' },
        { symbol: '$184,500', name: '2026 Social Security Cap', description: 'Maximum combined W-2 + 92.35% SE profit subject to 12.4% OASDI', unit: '$/yr' },
        { symbol: 'Form 1040-ES', name: 'Quarterly Payment', description: 'Total annual SE + Federal + State tax divided into 4 installments', unit: '$/qtr' },
      ],
    },
    workedExample: {
      scenario: 'Single freelancer in 2026 earning $110,000 net Schedule C profit ($0 W-2), claiming QBI 20% and 2026 $16,100 standard deduction in a 4.5% income tax state.',
      inputs: [
        { name: 'Schedule C Net Profit / W-2', value: '$110,000 / $0' },
        { name: 'Filing Status / QBI / State Rate', value: 'Single ($16,100 Std Ded) / Yes / 4.5%' },
      ],
      steps: [
        'Statutory SE Base = $110,000 × 92.35% = $101,585.00 → Social Security (12.4%) = $12,596.54 + Medicare (2.9%) = $2,945.97 → SE Tax = $15,542.51.',
        '50% SE Tax Deduction = $7,771.25; AGI = $102,228.75; Less $16,100 std ded = $86,128.75 pre-QBI taxable.',
        '20% QBI Deduction (§199A) = min(20%×$102,228.75, 20%×$86,128.75) = $17,225.75 → Federal Taxable = $68,903.00 → Federal Income Tax = $9,870.66.',
        'State Tax (4.5% × $102,228.75) = $4,600.29 → Total Annual Tax = $30,013.46 (27.28%) → $7,503.36 / quarter.',
      ],
      result: '$7,503.36 / Quarter Estimated Tax ($30,013.46 Annual; 27.28% Effective)',
      interpretation: 'Setting aside roughly 27.3% of net profit covers SE Tax, federal income tax, and 4.5% state tax across April, June, September, and January Form 1040-ES vouchers.',
    },
    regulatoryAndStandards: {
      title: 'IRS 2026 Schedule SE, Social Security $184,500 Cap & Safe Harbor Rules',
      description: 'Follows official IRS 2026 payroll and estimated tax regulations:',
      points: [
        '2026 OASDI Wage Cap: $184,500 maximum earnings subject to Social Security (coordinated first with any W-2 wages).',
        '0.9% Additional Medicare: Applies to combined earned income exceeding $200,000 (Single) or $250,000 (MFJ).',
        'Form 1040-ES Safe Harbor: Pay at least 90% of current-year tax OR 100% (110% if prior AGI > $150,000) of prior-year total tax to avoid underpayment penalties.',
      ],
    },
    countryContext: {
      summary: 'Engineered for US Schedule C / 1099 filers; international self-employed equivalents noted:',
      markets: [
        { region: 'United States', standard: 'Exact 92.35% Schedule SE, 2026 $184,500 SS base, §199A 20% QBI, and Rev. Proc. 2025-32 income brackets.', unitsOrCurrency: 'USD ($)', effectiveDate: 'Tax Year 2026' },
        { region: 'UK / Canada', standard: 'UK Sole Traders pay Class 4 NI (6%/2%) + Income Tax via Self Assessment; Canadians pay double CPP (11.9%) + federal/provincial tax.', unitsOrCurrency: 'GBP / CAD', effectiveDate: '2026' },
      ],
    },
    references: [
      { name: 'Self-Employment Tax (Social Security and Medicare Taxes)', organization: 'IRS', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/self-employment-tax-social-security-and-medicare-taxes', effectiveDate: '2026', note: 'Official 15.3% SE tax formula, 92.35% net earnings rule, and 50% deduction.' },
      { name: '2026 OASDI Contribution and Benefit Base ($184,500)', organization: 'Social Security Administration (SSA)', url: 'https://www.ssa.gov/oact/cola/cbb.html', effectiveDate: '2026', note: 'Statutory 2026 maximum taxable wage base.' },
    ],
    commonMistakes: {
      title: 'Forgetting Form 1040-ES Deadlines Are Uneven (April, June, September, January)',
      explanation: 'IRS Q2 estimated payment is due June 15—only two months after April 15, NOT three months—catching many new 1099 freelancers off guard.',
    },
    proTips: [
      'Contribute to a Solo 401(k) or SEP IRA to reduce taxable income dollar-for-dollar (note: retirement contributions lower income tax, not SE tax).',
      'Automate transferring 28%–30% of every paid client invoice into a separate high-yield tax reserve sub-account.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Self-Employed & Business Tax Desk',
      reviewDate: 'November 2026',
      accuracyStandard: 'Verified 2026 $184,500 SS cap coordination with W-2 wages, 92.35% SE multiplier, §199A QBI cap, and 1040-ES quarterly split.',
    },
    eeat: {
      authorRole: 'Numeriq US Tax Editorial Team',
      reviewerRole: 'Numeriq Quantitative Validation Desk',
      methodology: 'Computes SE tax on 92.35% net profit above $400 up to $184,500 remaining SS cap, deducts 50% SE tax + 2026 std deduction + 20% QBI, and taxes incremental SE profit across 2026 brackets.',
      lastVerifiedDate: '2026-11-19',
      taxOrRegulationYear: 'US IRS Tax Year 2026 (Rev. Proc. 2025-32 & SSA 2026)',
      limitations: [
        'Applies a simplified 20% QBI check without SSTB high-income phase-out calculations or W-2/UBIA wage limitations above phase-in thresholds.',
        'Assumes standard deduction and single-state flat effective tax rate.',
      ],
      nonAdviceDisclaimer: 'Educational 1099/Schedule C tax estimate only; consult a CPA to evaluate S-Corp election savings or itemized business deductions.',
    },
    relatedCalculatorSlugs: ['freelance-rate-calculator', 'income-tax-calculator', 'capital-gains-tax-calculator', 'employer-payroll-cost-calculator'],
  },

  'freelance-rate-calculator': {
    overview:
      'The Freelance & Consulting Hourly Rate Calculator reverses your target net annual take-home pay, overhead, health insurance, tax reserve, vacation weeks, and realistic billable utilization (%) into your exact minimum hourly and 8-hour daily client billing rate.',
    detailedExplanation:
      'Dividing a $90,000 W-2 salary by 2,080 hours ($43.27/hr) underprices freelance consulting by more than 50%. Independent contractors receive no paid PTO, pay 15.3% SE taxes + health premiums + software overhead, and typically spend 25%–35% of workweeks on non-billable sales, invoicing, and admin—meaning 1,344 billable hours must fund the entire year.',
    formulaDisplay: {
      formula: 'Rate = [(TargetNet ÷ (1 − TaxReserve%)) + Overhead] ÷ [(52 − WeeksOff) × Hrs/Wk × Utilization%]',
      variableDefinitions: [
        { symbol: 'TargetNet', name: 'Desired Annual Net Pay', description: 'After-tax personal cash flow remaining after taxes and expenses', unit: '$/yr' },
        { symbol: 'Utilization%', name: 'Billable Client Share', description: 'Fraction of working hours actually invoiced to clients (typically 65–75%)', unit: '%' },
        { symbol: 'Day Rate', name: '8-Hour Consulting Day', description: 'Minimum hourly billing rate multiplied by 8 billable hours', unit: '$/day' },
      ],
    },
    workedExample: {
      scenario: 'Consultant targeting $90,000 net pay after $14,000 expenses/health insurance and 28% effective tax reserve, taking 4 weeks off and billing 70% of a 40-hour week.',
      inputs: [
        { name: 'Target Net / Overhead / Tax Reserve', value: '$90,000 / $14,000 / 28%' },
        { name: 'Weeks Off / Hours per Week / Utilization', value: '4 wks / 40 hrs / 70% billable' },
      ],
      steps: [
        'Annual Billable Hours = (52 − 4) × 40 × 70% = 48 × 40 × 0.70 = 1,344 billable hours/yr.',
        'Pre-Tax Profit Needed for $90,000 net @ 28% tax = $90,000 ÷ (1 − 0.28) = $125,000.00 ($35,000.00 tax reserve).',
        'Required Gross Revenue = $125,000 + $14,000 overhead = $139,000.00/yr.',
        'Minimum Hourly Rate = $139,000 ÷ 1,344 = $103.42/hr (Full 8-hr Day Rate = $827.38/day).',
      ],
      result: '$103.42 / billable hour ($827.38 / Day Rate; $139,000 Gross Revenue)',
      interpretation: 'Even to match a modest $90,000 net lifestyle (~$113k W-2 salary), you must bill at least $103.42/hr across realistic 70% utilization.',
    },
    regulatoryAndStandards: {
      title: 'US/UK/CA Consulting Utilization & Independent Contractor Benchmarks',
      description: 'Reflects standard professional services utilization and independent tax accounting:',
      points: [
        '65%–75% Utilization Ceiling: Even full-time solo consultants spend 10–14 hours/week on marketing, proposals, admin, and unpaid training.',
        'W-2 Equivalence Rule: A freelance hourly rate typically needs to run 1.8x–2.3x an equivalent W-2 base hourly wage to cover benefits, PTO, and employer taxes.',
      ],
    },
    countryContext: {
      summary: 'Currency-agnostic revenue model suitable for US 1099 consultants, UK Ltd/Sole Traders, and Canadian/AU/NZ contractors:',
      markets: [
        { region: 'US / Canada / AU / NZ', standard: 'Include full SE tax/CPP/ACC + private health/super allowances in Overhead and Tax Reserve %.', unitsOrCurrency: 'USD / CAD / AUD / NZD', effectiveDate: '2026' },
        { region: 'United Kingdom', standard: 'Outside-IR35 contractors should benchmark day rates factoring Corporation Tax, dividend tax, and NI.', unitsOrCurrency: 'GBP (£)', effectiveDate: '2026–27' },
      ],
    },
    references: [
      { name: 'Self-Employed Individuals Tax Center', organization: 'Internal Revenue Service (IRS)', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/self-employed-individuals-tax-center', effectiveDate: '2026', note: 'Deductions, quarterly tax obligations, and business overhead reporting.' },
    ],
    commonMistakes: {
      title: 'Pricing Using 2,080 Hours/Year (100% Billable Assumption)',
      explanation: 'Assuming you can bill 40 hours every single week for 52 weeks guarantees either chronic burnout or a 30% income shortfall below target.',
    },
    proTips: [
      'Use your calculated Day Rate ($827+) to quote fixed-scope project retainers rather than hourly time sheets wherever client ROI justifies value pricing.',
      'Cross-check your Tax Reserve % directly inside our Self-Employment Tax Calculator.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Freelance & Small Business Desk',
      reviewDate: 'November 2026',
      accuracyStandard: 'Verified bottom-up revenue, utilization-hour denominator, and tax-gross-up math.',
    },
    eeat: {
      authorRole: 'Numeriq Business & Tax Editorial Team',
      reviewerRole: 'Numeriq Quantitative Validation Desk',
      methodology: 'Grosses up desired net income for taxes, adds fixed business overhead, and divides by exact annual billable hours net of PTO and utilization loss.',
      lastVerifiedDate: '2026-11-19',
      taxOrRegulationYear: '2026 Independent Consulting Standards',
      limitations: [
        'Applies a flat user-supplied Tax Reserve % rather than progressive marginal brackets dynamically.',
        'Assumes consistent revenue collection with zero bad-debt write-offs.',
      ],
      nonAdviceDisclaimer: 'Educational pricing calculator only; market rates also depend on specialty demand, client sector, and contract terms.',
    },
    relatedCalculatorSlugs: ['self-employment-tax-calculator', 'hourly-to-salary-calculator', 'employer-payroll-cost-calculator', 'gross-margin-calculator'],
  },

  'overtime-bonus-paycheck-calculator': {
    overview:
      'The Overtime & Bonus Paycheck Calculator separates Regular Pay, Time-and-a-Half Overtime (1.5×), Double-Time (2.0×), and Cash Bonuses—applying IRS Publication 15’s statutory 22% flat supplemental withholding rate (37% above $1M) alongside regular tax withholding, 7.65% FICA, and state payroll taxes.',
    detailedExplanation:
      'Employees often think bonuses are "taxed at a higher rate" because employers withhold a mandatory 22% federal flat rate on supplemental cash bonuses (per IRS Publication 15) rather than your lower effective W-4 rate. Remember: withholding is only a prepayment—any excess withheld on a bonus is refunded when you file your annual return.',
    formulaDisplay: {
      formula: 'Gross = Hrs·Rate + 1.5·OT·Rate + 2.0·DT·Rate + Bonus   |   BonusFed = 22%·Bonus (37% >$1M)',
      variableDefinitions: [
        { symbol: '1.5× OT / 2.0× DT', name: 'FLSA Overtime Multipliers', description: 'Time-and-a-half and double-time hourly multipliers', unit: '$/hr' },
        { symbol: '22% Supplemental', name: 'IRS Pub 15 Flat Withholding', description: 'Federal supplemental withholding rate on bonuses up to $1M/yr', unit: '%' },
        { symbol: '7.65% FICA', name: 'Payroll Tax Rate', description: '6.2% Social Security + 1.45% Medicare employee withholding', unit: '%' },
      ],
    },
    workedExample: {
      scenario: 'Biweekly paycheck at $36/hr for 80 regular hours + 12 overtime hours (1.5×) + $1,500 cash bonus (15% regular Fed rate, 4.5% state rate).',
      inputs: [
        { name: 'Wage / Regular / Overtime Hrs', value: '$36/hr / 80 reg / 12 OT (1.5×)' },
        { name: 'Supplemental Bonus / Fed / State', value: '$1,500 / 15% Reg Fed / 4.5% State' },
      ],
      steps: [
        'Regular Pay = 80 × $36 = $2,880.00; Overtime Pay = 12 × $54 = $648.00; Bonus = $1,500.00 → Total Gross = $5,028.00.',
        'Federal Withholding: Regular Wages ($3,528 × 15%) = $529.20; Bonus (IRS 22% flat) = $330.00.',
        'FICA (7.65% × $5,028) = $384.64; State Tax (4.5% × $5,028) = $226.26 → Total Withheld = $1,470.10.',
      ],
      result: '$3,557.90 Net Take-Home Paycheck (Out of $5,028.00 Gross)',
      interpretation: 'Even though the $1,500 bonus has $330 (22%) withheld for federal taxes upfront, your true tax owed depends on annual total taxable income at filing.',
    },
    regulatoryAndStandards: {
      title: 'US FLSA Overtime & IRS Publication 15 Supplemental Pay Rules',
      description: 'Reflects statutory overtime multipliers and federal payroll withholding methods:',
      points: [
        'FLSA Overtime Standard: Non-exempt US employees earn at least 1.5× regular rate for hours worked beyond 40 in a workweek (double-time applies under state rules such as California or union contracts).',
        'IRS Pub 15 Supplemental Rate: Optional flat 22% withholding applies to bonuses/commissions up to $1,000,000 YTD; mandatory 37% applies above $1,000,000.',
      ],
    },
    countryContext: {
      summary: 'Follows US FLSA & IRS Pub 15 withholding, adaptable to UK/CA/AU overtime pay multipliers:',
      markets: [
        { region: 'United States', standard: 'FLSA 1.5×/2.0× multipliers + IRS Pub 15 22%/37% supplemental withholding + 7.65% FICA.', unitsOrCurrency: 'USD ($)', effectiveDate: '2026' },
        { region: 'Australia / Canada / UK', standard: 'Supports 1.5× / 2.0× penalty/overtime pay gross math; use domestic PAYE calculators for local tax schedules.', unitsOrCurrency: 'AUD / CAD / GBP', effectiveDate: '2026' },
      ],
    },
    references: [
      { name: 'Publication 15 (Circular E): Employer’s Tax Guide — Supplemental Wages', organization: 'Internal Revenue Service (IRS)', url: 'https://www.irs.gov/publications/p15', effectiveDate: '2026', note: 'Statutory 22% and 37% supplemental bonus withholding rules.' },
      { name: 'Overtime Pay Under the Fair Labor Standards Act (FLSA)', organization: 'U.S. Department of Labor', url: 'https://www.dol.gov/agencies/whd/overtime', effectiveDate: '2026', note: 'Federal 1.5× overtime pay rules for non-exempt workers.' },
    ],
    commonMistakes: {
      title: 'Assuming the 22% Bonus Withholding Rate Is Your Final Tax Rate',
      explanation: 'Your bonus is taxed identically to regular salary on Form 1040. If your true marginal tax bracket is 12%, you receive the extra 10% back as a tax refund.',
    },
    proTips: [
      'If your regular payroll software uses the "aggregate" withholding method instead of 22% flat, one huge overtime+bonus paycheck can temporarily over-withhold at 32%–35% until year-end.',
      'Confirm whether your 401(k) deferral percentage applies to bonuses—some plans withhold 401(k) on supplemental pay while others exclude bonuses.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Payroll & Compensation Desk',
      reviewDate: 'November 2026',
      accuracyStandard: 'Verified FLSA 1.5x/2.0x gross math, IRS Pub 15 22%/37% supplemental withholding split, and 7.65% FICA.',
    },
    eeat: {
      authorRole: 'Numeriq Payroll & Tax Editorial Team',
      reviewerRole: 'Numeriq Quantitative Validation Desk',
      methodology: 'Separates wage gross from supplemental bonus, applies user regular federal % to wages and IRS 22%/37% flat withholding to bonuses, plus 7.65% FICA and state tax.',
      lastVerifiedDate: '2026-11-19',
      taxOrRegulationYear: 'US IRS Pub 15 & DOL FLSA 2026 Rules',
      limitations: [
        'Does not account for YTD earnings crossing the $184,500 Social Security cap within a single pay period.',
        'Assumes pre-tax 401(k)/health premiums are omitted or already factored into regular Fed tax %.',
      ],
      nonAdviceDisclaimer: 'Educational paycheck estimator only; payroll software varies between Percentage/Flat 22% vs. Aggregate bonus withholding methods.',
    },
    relatedCalculatorSlugs: ['take-home-pay-calculator', 'hourly-to-salary-calculator', 'salary-to-hourly-calculator', 'employer-payroll-cost-calculator'],
  },

  'employer-payroll-cost-calculator': {
    overview:
      'The Employer Payroll Cost & Burden Calculator reveals the true all-in cost of hiring a full-time employee beyond base salary—adding 2026 Employer FICA (6.2% SS up to $184,500 + 1.45% Medicare), FUTA (0.6% on $7,000), State SUTA unemployment taxes, 401(k) matching, health benefits, and workers’ compensation.',
    detailedExplanation:
      'Founders and hiring managers who budget strictly for a "$80,000 salary" regularly underestimate real headcount cost by 20%–35%. Mandatory employer payroll taxes, health insurance premiums, retirement matching, and workers’ compensation turn an $80,000 offer into nearly $98,140/yr ($47.18/hr across 2,080 hours), or roughly a 1.23x burden multiplier.',
    formulaDisplay: {
      formula: 'TotalCost = Sal + 6.2%·min(Sal, 184.5k) + 1.45%·Sal + FUTA + SUTA + Match + Health + WC',
      variableDefinitions: [
        { symbol: 'Emp FICA', name: 'Employer Payroll Taxes (2026)', description: '6.2% SS up to $184,500 + 1.45% uncapped Medicare', unit: '$/yr' },
        { symbol: 'FUTA / SUTA', name: 'Unemployment Taxes', description: '0.6% effective FUTA on first $7,000 + state SUTA % up to wage base', unit: '$/yr' },
        { symbol: 'Multiplier', name: 'Burden Multiplier', description: 'All-in employer headcount cost divided by base annual salary', unit: 'x' },
      ],
    },
    workedExample: {
      scenario: 'Hiring a US employee at $80,000 base salary with 4% 401(k) match, $7,200/yr employer health benefits, 2.7% SUTA on a $14,000 base, and 1.5% Workers Comp/payroll admin.',
      inputs: [
        { name: 'Base Salary / 401(k) Match / Health', value: '$80,000 / 4.0% / $7,200/yr' },
        { name: 'SUTA Rate & Base / Workers Comp', value: '2.7% on $14,000 / 1.5%' },
      ],
      steps: [
        'Employer FICA (2026): 6.2% × $80,000 = $4,960.00 SS + 1.45% × $80,000 = $1,160.00 Med = $6,120.00.',
        'FUTA (0.6% × $7,000) = $42.00; SUTA (2.7% × $14,000) = $378.00 → Total Mandatory Taxes = $6,540.00.',
        'Benefits & Admin: 4% match ($3,200) + Health ($7,200) + Workers Comp/Admin ($1,200) = $11,600.00.',
        'Total Employer Cost = $80,000 + $18,140 = $98,140.00/yr (1.227x multiplier; $47.18/hr; $8,178.33/mo budget).',
      ],
      result: '$98,140.00/yr Total Employer Cost (1.227x Burden Multiplier; +22.7%)',
      interpretation: 'Every $80,000 hire requires reserving $8,178.33/month in operating cash flow—22.7% above headline salary before factoring laptops, software, or office space.',
    },
    regulatoryAndStandards: {
      title: '2026 IRS FUTA, Employer FICA ($184,500 Cap) & Global Employer On-Costs',
      description: 'Reflects statutory 2026 US payroll burdens and international employer equivalents:',
      points: [
        'FUTA Net 0.6% Rate: Statutory 6.0% FUTA drops to 0.6% ($42 max per employee) when state SUTA taxes are paid timely.',
        'International Employer Burdens: UK Employer Class 1 NI (15% above £5,000 secondary threshold) + 3% auto-enrolment; Australia 12% SG Super + payroll tax; Canada Employer CPP/CPP2 + 1.4× EI.',
      ],
    },
    countryContext: {
      summary: 'Built on US 2026 FICA/FUTA/SUTA burdens while guiding UK, Canadian, and Australian headcount budgets:',
      markets: [
        { region: 'United States', standard: 'Exact 2026 6.2% SS ($184.5k cap), 1.45% Med, 0.6% FUTA ($7k cap), and configurable SUTA + benefits.', unitsOrCurrency: 'USD ($)', effectiveDate: '2026' },
        { region: 'UK / Australia / Canada', standard: 'Account for 15% UK Employer NI + 3% pension, 12% AU Super + WorkCover, or CA Employer CPP + 2.282% EI.', unitsOrCurrency: 'GBP / AUD / CAD', effectiveDate: '2026' },
      ],
    },
    references: [
      { name: 'Topic No. 751 & 759: Social Security, Medicare & FUTA Employer Taxes', organization: 'IRS', url: 'https://www.irs.gov/taxtopics/tc759', effectiveDate: '2026', note: 'Employer 6.2% SS, 1.45% Medicare, and 0.6% FUTA ($7,000 wage base) rules.' },
    ],
    commonMistakes: {
      title: 'Comparing W-2 Employee Base Salary Directly Against 1099 Contractor Rates',
      explanation: 'Comparing a $50/hr contractor against a $50/hr employee ignores the employee’s ~23%–30% tax/benefit/PTO burden ($62+/hr loaded cost).',
    },
    proTips: [
      'Remember paid vacation, sick days, and 10 holidays reduce productive hours per year from 2,080 down toward ~1,900 hours, lifting effective productive hourly cost.',
      'Check if your state carries a FUTA credit reduction or Paid Family Medical Leave (PFML) employer assessment.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Corporate Finance & HR Desk',
      reviewDate: 'November 2026',
      accuracyStandard: 'Verified against 2026 IRS $184,500 SS wage base, $7,000 FUTA cap, and loaded multiplier math.',
    },
    eeat: {
      authorRole: 'Numeriq Business & Finance Editorial Team',
      reviewerRole: 'Numeriq Quantitative Validation Desk',
      methodology: 'Sums base salary, capped 6.2% SS + uncapped 1.45% Medicare, FUTA ($7k base), SUTA, 401(k) match, health benefits, and workers’ comp/admin percentage.',
      lastVerifiedDate: '2026-11-19',
      taxOrRegulationYear: 'US IRS / SSA 2026 Employer Payroll Rules',
      limitations: [
        'Assumes employer qualifies for full 5.4% FUTA credit (0.6% effective FUTA rate).',
        'Does not separate equipment/onboarding costs or state PFML employer payroll levies.',
      ],
      nonAdviceDisclaimer: 'Educational headcount budgeting estimate only; verify exact SUTA experience rates with your payroll provider.',
    },
    relatedCalculatorSlugs: ['freelance-rate-calculator', 'take-home-pay-calculator', 'overtime-bonus-paycheck-calculator', 'saas-ltv-cac-calculator'],
  },

  'saas-ltv-cac-calculator': {
    overview:
      'The SaaS Unit Economics (LTV, CAC, Churn & Payback) Calculator evaluates B2B/B2C subscription health—calculating Gross-Margin-Adjusted Customer Lifetime Value (LTV), LTV:CAC efficiency ratio, CAC Payback Months, annualized churn compounding, and Rule of 40 score.',
    detailedExplanation:
      'Calculating SaaS LTV using raw revenue instead of Gross Profit severely overstates acquisition capacity whenever cloud hosting, AI inference, or customer success costs consume 15%–30% of ARPA. Institutional SaaS investors benchmark healthy growth at LTV:CAC ≥ 3.0x, CAC Payback ≤ 12 months, and ARR Growth + Operating/FCF Margin (Rule of 40) ≥ 40%.',
    formulaDisplay: {
      formula: 'LTV = (ARPA × GrossMargin%) ÷ MonthlyChurn%   |   Payback = CAC ÷ (ARPA × GrossMargin%)',
      variableDefinitions: [
        { symbol: 'LTV', name: 'Gross-Margin Lifetime Value', description: 'Total lifetime gross profit generated per acquired customer', unit: '$' },
        { symbol: 'LTV:CAC', name: 'Unit Efficiency Multiple', description: 'Ratio of customer gross-profit LTV to acquisition cost (Target ≥ 3.0x)', unit: 'x' },
        { symbol: 'Payback', name: 'CAC Recovery Horizon', description: 'Months of gross profit needed to recover upfront CAC (Target ≤ 12 mos)', unit: 'Months' },
      ],
    },
    workedExample: {
      scenario: 'B2B SaaS platform with $250/mo ARPA, 80% gross margin, 2.5% monthly logo churn, $1,800 CAC, 35% YoY ARR growth, and 10% operating FCF margin.',
      inputs: [
        { name: 'ARPA / Gross Margin / Monthly Churn', value: '$250/mo / 80% / 2.5%' },
        { name: 'CAC / ARR Growth / FCF Margin', value: '$1,800 / 35% / 10%' },
      ],
      steps: [
        'Monthly Gross Profit per Account = $250 × 80% = $200.00/mo.',
        'Average Customer Lifespan = 1 ÷ 2.5% = 40.0 months (26.2% compounded annual churn) → Gross-Margin LTV = $200 × 40 = $8,000.00.',
        'LTV:CAC Ratio = $8,000 ÷ $1,800 = 4.44x; CAC Payback Period = $1,800 ÷ $200 = 9.0 months.',
        'Rule of 40 Score = 35% ARR Growth + 10% Margin = 45% (Passes ≥40% elite benchmark).',
      ],
      result: '4.44x LTV:CAC Ratio ($8,000 LTV | 9.0-Month CAC Payback | Rule of 40: 45%)',
      interpretation: 'Recovering CAC inside 9 months with 4.44x gross-margin LTV demonstrates capital-efficient growth well above institutional 3.0x / 12-month hurdles.',
    },
    regulatoryAndStandards: {
      title: 'Institutional B2B SaaS Benchmarking Standards',
      description: 'Follows GAAP-aligned gross-profit SaaS cohort valuation conventions:',
      points: [
        'Gross-Margin LTV Discipline: Always multiply ARPA by SaaS Gross Margin % (excluding only true COGS: cloud infrastructure, third-party APIs, payment fees, and Tier-1 support).',
        '3.0x Ratio / 12-Mo Payback: Below 3.0x implies inefficient customer acquisition; above 6.0x with slow growth may signal under-investing in sales and marketing.',
      ],
    },
    countryContext: {
      summary: 'Currency-universal SaaS financial modeling used across US, UK, Canadian, European, and ANZ venture markets:',
      markets: [
        { region: 'Global Venture / SaaS', standard: 'Standard institutional B2B/B2C cohort metrics (Gross-Margin LTV, CAC Payback, Compounded Churn, Rule of 40).', unitsOrCurrency: 'USD / GBP / EUR / AUD', effectiveDate: '2026' },
      ],
    },
    references: [
      { name: 'Rule of 40 & SaaS Financial Metrics Primer', organization: 'Corporate Finance Institute (CFI)', url: 'https://corporatefinanceinstitute.com/resources/valuation/saas-metrics/', effectiveDate: '2026', note: 'Standard gross-margin LTV, CAC payback, and SaaS churn definitions.' },
    ],
    commonMistakes: {
      title: 'Confusing Monthly Churn (2.5%) With Annual Churn (26.2%)',
      explanation: 'Losing 2.5% of logos per month compounds to 1 − (0.975)^12 = 26.2% annual churn—meaning more than a quarter of your customer base churns every year.',
    },
    proTips: [
      'Include fully loaded Sales & Marketing payroll, ad spend, and agency fees inside CAC—never just raw paid ad clicks.',
      'Track Net Dollar Retention (NDR) separately; expansion upsells from existing cohorts can offset logo churn completely.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq SaaS & Corporate Finance Desk',
      reviewDate: 'November 2026',
      accuracyStandard: 'Verified Gross-Margin LTV, CAC Payback, geometric annual churn compounding, and Rule of 40 math.',
    },
    eeat: {
      authorRole: 'Numeriq Corporate Finance Editorial Team',
      reviewerRole: 'Numeriq Quantitative Validation Desk',
      methodology: 'Derives monthly gross profit (ARPA × Margin%), steady-state lifetime (1/churn), LTV, LTV:CAC, Payback months, annual compounded churn, and Rule of 40 sum.',
      lastVerifiedDate: '2026-11-19',
      taxOrRegulationYear: '2026 Institutional SaaS Financial Metrics',
      limitations: [
        'Uses constant steady-state churn (1 ÷ churn) without discounting future cash flows (WACC) or modeling expansion revenue (Net Dollar Retention).',
        'Assumes zero seasonal cohort acceleration in payback.',
      ],
      nonAdviceDisclaimer: 'Educational SaaS financial modeling tool only; audited unit economics require cohort-level gross retention accounting.',
    },
    relatedCalculatorSlugs: ['npv-irr-calculator', 'break-even-calculator', 'gross-margin-calculator', 'cagr-calculator'],
  },

  'npv-irr-calculator': {
    overview:
      'The NPV, IRR & Payback Period Calculator evaluates 5-year capital budgeting projects—computing Net Present Value (NPV), Internal Rate of Return (IRR via numerical root-finding), Profitability Index (PI), Simple Payback, and Discounted Payback against your WACC hurdle rate.',
    detailedExplanation:
      'Net Present Value (NPV) measures absolute dollar wealth created above your cost of capital (WACC), whereas Internal Rate of Return (IRR) finds the exact discount rate where NPV equals zero. Using both alongside Profitability Index and Discounted Payback prevents misranking mutually exclusive projects of different scales.',
    formulaDisplay: {
      formula: 'NPV = −I₀ + Σ CF_t ÷ (1 + r)^t   |   NPV(IRR) = 0   |   PI = PV(Inflows) ÷ I₀',
      variableDefinitions: [
        { symbol: 'I₀', name: 'Initial Year-0 Outlay', description: 'Upfront capital expenditure required at t = 0', unit: '$' },
        { symbol: 'r', name: 'Discount Rate / WACC', description: 'Weighted Average Cost of Capital or minimum acceptable hurdle rate', unit: '%' },
        { symbol: 'PI', name: 'Profitability Index', description: 'Present value generated per $1.00 invested (>1.00x creates value)', unit: 'x' },
      ],
    },
    workedExample: {
      scenario: 'Evaluating a $100,000 capital investment at a 10.0% WACC hurdle generating Years 1–5 cash flows of $28,000, $34,000, $38,000, $40,000, and $42,000.',
      inputs: [
        { name: 'Initial Outlay (I₀) / WACC Discount Rate', value: '$100,000 / 10.0%' },
        { name: 'Cash Flows (Years 1–5)', value: '$28k, $34k, $38k, $40k, $42k' },
      ],
      steps: [
        'PV of Inflows @ 10%: $25,454.55 + $28,099.17 + $28,549.96 + $27,320.54 + $26,078.70 = $135,502.92.',
        'Net Present Value (NPV) = $135,502.92 − $100,000.00 = +$35,502.92 (Profitability Index = 1.355x → Accept).',
        'Solving NPV(r) = 0 gives IRR = 22.14% (+12.14% spread above the 10% hurdle).',
        'Simple Payback = 3.00 years ($28k + $34k + $38k = $100k); Discounted Payback = 3.66 years.',
      ],
      result: '+$35,502.92 NPV | 22.14% IRR | 1.355x PI (Accept Project)',
      interpretation: 'The investment generates $35,502.92 of economic value above a 10% cost of capital, returning invested capital in 3.66 discounted years.',
    },
    regulatoryAndStandards: {
      title: 'CFA Corporate Finance & Capital Budgeting Decision Rules',
      description: 'Follows foundational corporate valuation decision criteria:',
      points: [
        'NPV Precedence Rule: When NPV and IRR disagree on mutually exclusive projects of different scale or timing, always choose the highest positive NPV.',
        'Reinvestment Assumption: Standard IRR assumes interim cash flows reinvest at IRR itself, whereas NPV assumes realistic reinvestment at WACC.',
      ],
    },
    countryContext: {
      summary: 'Currency-universal corporate finance and project-investment valuation standard:',
      markets: [
        { region: 'Global Corporate Finance', standard: 'CFA/GAAP discounted cash flow (DCF), NPV, IRR, Profitability Index, and Discounted Payback.', unitsOrCurrency: 'USD / GBP / CAD / AUD', effectiveDate: '2026' },
      ],
    },
    references: [
      { name: 'Net Present Value (NPV) & IRR Capital Budgeting', organization: 'Corporate Finance Institute (CFI)', url: 'https://corporatefinanceinstitute.com/resources/valuation/net-present-value-npv/', effectiveDate: '2026', note: 'DCF discounting, NPV > 0 rule, and IRR pitfalls.' },
    ],
    commonMistakes: {
      title: 'Using Simple Payback Period Without Time-Value Discounting',
      explanation: 'Simple payback treats $40,000 received in Year 4 identically to $40,000 received today; always check NPV and Discounted Payback.',
    },
    proTips: [
      'Include expected equipment salvage or working-capital release inside Year 5 cash flow for complete lifecycle accuracy.',
      'Test sensitivity by raising your WACC hurdle by +2%–3% to verify the project remains NPV-positive under tighter credit conditions.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Corporate Valuation Desk',
      reviewDate: 'November 2026',
      accuracyStandard: 'Verified exact multi-period DCF discounting, 90-step IRR bisection solver, and simple/discounted payback interpolation.',
    },
    eeat: {
      authorRole: 'Numeriq Corporate Finance Editorial Team',
      reviewerRole: 'Numeriq Quantitative Validation Desk',
      methodology: 'Discounts discrete end-of-year cash flows CF₁..CF₅ at WACC, solves IRR where NPV(r) = 0 across [-95%, +500%], and interpolates exact simple and discounted payback years.',
      lastVerifiedDate: '2026-11-19',
      taxOrRegulationYear: '2026 Corporate Finance DCF Standards',
      limitations: [
        'Supports up to 5 discrete annual periods (CF₁–CF₅); projects with multiple sign flips can exhibit multiple IRRs (none returned if unbracketed).',
        'Assumes end-of-year cash flow timing and constant WACC across all 5 years.',
      ],
      nonAdviceDisclaimer: 'Educational capital-budgeting model only; commercial investments require sensitivity, tax-depreciation, and risk-adjusted WACC analysis.',
    },
    relatedCalculatorSlugs: ['business-loan-calculator', 'roi-calculator', 'saas-ltv-cac-calculator', 'cagr-calculator'],
  },

  'bond-yield-calculator': {
    overview:
      'The Bond Yield to Maturity (YTM) & Duration Calculator solves exact annualized Yield to Maturity, Current Yield, Effective Annual Yield (EAY), Macaulay Duration, Modified Duration interest-rate sensitivity, and Tax-Equivalent Municipal Yield across Semi-Annual, Annual, and Quarterly coupon bonds.',
    detailedExplanation:
      'Buying a $1,000 par bond with a 5.0% coupon at a discount price of $940 earns MORE than its 5.319% Current Yield because you also collect a $60 capital gain upon maturity. Discounting all 20 semi-annual coupons plus the $1,000 redemption value back to $940 solves exact YTM (5.799%) and quantifies Modified Duration (7.69% price drop per +1% yield jump).',
    formulaDisplay: {
      formula: 'Price = Σ [C/m ÷ (1 + YTM/m)^t] + Face ÷ (1 + YTM/m)^N   |   ModDur = MacDur ÷ (1 + YTM/m)',
      variableDefinitions: [
        { symbol: 'YTM', name: 'Yield to Maturity', description: 'Internal rate of return assuming bond is held to maturity and coupons reinvest at YTM', unit: '%' },
        { symbol: 'MacDur', name: 'Macaulay Duration', description: 'PV-weighted average time to receive bond cash flows', unit: 'Years' },
        { symbol: 'ModDur', name: 'Modified Duration', description: 'Approximate % price change for a -100 bps (+1% drop) shift in yield', unit: '%' },
      ],
    },
    workedExample: {
      scenario: 'A 10-year $1,000 par Treasury/corporate bond paying a 5.0% semi-annual coupon ($25 every 6 mos) currently trading at $940.00 (Discount Bond; 24% marginal tax rate).',
      inputs: [
        { name: 'Par / Price / Coupon / Maturity', value: '$1,000 / $940 / 5.0% / 10 yrs' },
        { name: 'Coupon Frequency / Marginal Tax', value: 'Semi-Annual (2×/yr) / 24%' },
      ],
      steps: [
        'Semi-annual coupon = ($1,000 × 5%) ÷ 2 = $25.00 across 20 periods. Current Yield = $50 ÷ $940 = 5.319%.',
        'Solving exact price equation at $940 yields r_per = 2.8997% per 6 months → Bond-Equivalent YTM = 5.799% (5.883% Effective Annual Yield).',
        'PV-weighted cash-flow timing yields Macaulay Duration = 7.91 years → Modified Duration = 7.91 ÷ 1.029 = 7.69% (+1% yield jump ≈ -7.69% bond price drop).',
      ],
      result: '5.799% Annualized YTM | 5.319% Current Yield | 7.69% Modified Duration',
      interpretation: 'Because the bond trades below par ($940 < $1,000), YTM (5.799%) exceeds both the coupon rate (5.00%) and Current Yield (5.319%).',
    },
    regulatoryAndStandards: {
      title: 'US SEC / FINRA Bond-Equivalent YTM & Duration Conventions',
      description: 'Follows standard fixed-income quoting and risk metrics:',
      points: [
        'Bond-Equivalent Yield (BEY): Semi-annual US Treasury and corporate bonds quote nominal YTM = 2 × r_6mo, whereas Effective Annual Yield accounts for intra-year compounding.',
        'Municipal Tax-Equivalent Yield: Compares tax-free muni yields against taxable corporate bonds via YTM ÷ (1 − MarginalTaxRate).',
      ],
    },
    countryContext: {
      summary: 'Supports US semi-annual Treasuries/Munis/Corporates, UK Gilts, Australian semi-annual bonds, and annual Eurobonds:',
      markets: [
        { region: 'US / UK / AU / CA', standard: 'Standard semi-annual (2×/yr) discounting and Macaulay/Modified duration conventions.', unitsOrCurrency: 'USD / GBP / AUD / CAD', effectiveDate: '2026' },
        { region: 'European Bonds', standard: 'Select Annual (1×/yr) frequency to match standard annual-coupon Eurobond YTM quoting.', unitsOrCurrency: 'EUR / USD', effectiveDate: '2026' },
      ],
    },
    references: [
      { name: 'Understanding Bond Yield and Return', organization: 'FINRA', url: 'https://www.finra.org/investors/investing/investment-products/bonds', effectiveDate: '2026', note: 'Coupon rate vs. current yield vs. YTM and interest-rate duration risk.' },
      { name: 'Yield to Maturity & Duration Guide', organization: 'U.S. Securities and Exchange Commission (Investor.gov)', url: 'https://www.investor.gov/introduction-investing/investing-basics/investment-products/bonds-or-fixed-income-products/bonds', effectiveDate: '2026', note: 'Official fixed-income inverse price/yield sensitivity guidance.' },
    ],
    commonMistakes: {
      title: 'Confusing Current Yield With Yield to Maturity on Premium Bonds',
      explanation: 'A high-coupon bond trading at $1,120 can advertise a tempting Current Yield while delivering a much lower YTM once the $120 capital loss at maturity is factored in.',
    },
    proTips: [
      'Multiply Modified Duration by expected interest-rate move (e.g., 7.69 × 1.0% = -7.69%) to stress-test bond portfolio volatility before buying long-dated bonds.',
      'Hold individual bonds to maturity to immunize interim mark-to-market price swings (assuming zero issuer default).',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Fixed Income & Markets Desk',
      reviewDate: 'November 2026',
      accuracyStandard: 'Verified 90-step bond-pricing YTM solver alongside exact Macaulay and Modified Duration equations.',
    },
    eeat: {
      authorRole: 'Numeriq Investment & Markets Editorial Team',
      reviewerRole: 'Numeriq Quantitative Validation Desk',
      methodology: 'Solves per-period discount yield matching exact PV of coupons and face value to market price via bisection, then computes BEY, EAY, Macaulay Duration, and Modified Duration.',
      lastVerifiedDate: '2026-11-19',
      taxOrRegulationYear: '2026 FINRA / SEC Fixed-Income Conventions',
      limitations: [
        'Models non-callable fixed-coupon bonds purchased on a coupon date (dirty price = clean price; no accrued interest or call convexity adjustment).',
        'Duration is a linear first-order approximation accurate for small yield shifts (±100 bps).',
      ],
      nonAdviceDisclaimer: 'Educational fixed-income valuation tool only; verify call provisions, credit ratings, and accrued interest on your brokerage trade ticket.',
    },
    relatedCalculatorSlugs: ['npv-irr-calculator', 'cd-term-deposit-calculator', 'real-rate-of-return-calculator', 'cagr-calculator'],
  },

  'tax-loss-harvesting-calculator': {
    overview:
      'The Tax-Loss Harvesting Savings Calculator computes immediate current-year tax savings from selling unrealized loss positions under IRS IRC §1211/§1212 netting rules—offsetting Short-Term Gains first, then Long-Term Gains, then up to $3,000 ($1,500 MFS) of ordinary income, and projecting indefinite loss carryforwards.',
    detailedExplanation:
      'Tax-loss harvesting turns temporary portfolio pullbacks into immediate tax alpha by offsetting high-taxed short-term gains (taxed up to 37% ordinary rates) and up to $3,000 of W-2 wages each year while carrying remaining losses forward indefinitely. To preserve the deduction, investors must avoid the 61-day Wash-Sale window (±30 days around the loss sale).',
    formulaDisplay: {
      formula: 'Savings = Offset_STG×OrdRate + Offset_LTCG×LTCG_Rate + min(RemLoss, $3,000)×OrdRate',
      variableDefinitions: [
        { symbol: 'Offset_STG', name: 'Short-Term Gain Offset', description: 'Losses first shelter short-term gains taxed at higher ordinary rates', unit: '$' },
        { symbol: '$3,000 Cap', name: 'Ordinary Income Deduction', description: 'IRC §1211(b) limit ($1,500 if MFS) deducted against W-2/ordinary pay per year', unit: '$/yr' },
        { symbol: 'Carryforward', name: 'Unused Loss Bank', description: 'Excess harvested losses carried forward indefinitely across future tax years', unit: '$' },
      ],
    },
    workedExample: {
      scenario: 'Harvesting an $18,000 unrealized capital loss in a year with $6,000 short-term gains (24% rate) and $5,000 long-term gains (15% rate) as a Single/MFJ filer ($3,000 ordinary cap).',
      inputs: [
        { name: 'Harvested Loss / STG / LTCG', value: '$18,000 Loss / $6,000 STG / $5,000 LTCG' },
        { name: 'Ordinary Rate / LTCG Rate / Status', value: '24% / 15% / Single or MFJ ($3,000 cap)' },
      ],
      steps: [
        'Step 1 — Offset Short-Term Gains: $6,000 × 24% = $1,440.00 saved ($12,000 loss remaining).',
        'Step 2 — Offset Long-Term Gains: $5,000 × 15% = $750.00 saved ($7,000 loss remaining).',
        'Step 3 — Ordinary Income Offset (IRC §1211(b) cap): $3,000 × 24% = $720.00 saved ($4,000 carryforward left).',
        'Total Immediate Tax Savings = $1,440 + $750 + $720 = $2,910.00 + $4,000 indefinite loss carryforward (~$600 future shield at 15%).',
      ],
      result: '$2,910.00 Current-Year Federal Tax Savings + $4,000.00 Carryforward',
      interpretation: 'Harvesting $18,000 trims this year’s IRS bill by $2,910 immediately while banking $4,000 of tax losses for next year—just avoid buying a substantially identical security within ±30 days.',
    },
    regulatoryAndStandards: {
      title: 'US IRC §1211, §1212 & §1091 Wash-Sale Rules (2026)',
      description: 'Implements statutory federal capital-loss netting and carryover order:',
      points: [
        'Mandatory Netting Sequence: Short-term losses offset short-term gains first (or vice versa in net totals), net losses offset remaining capital gains, then up to $3,000 ($1,500 MFS) offsets ordinary income.',
        'IRC §1091 Wash-Sale Rule: Disallows any tax loss if you—or your spouse/IRA—purchase a "substantially identical" security within 30 days before OR 30 days after the sale (61-day window).',
      ],
    },
    countryContext: {
      summary: 'Built on US IRC §1211/§1091 rules; international wash-sale / superficial-loss peers noted:',
      markets: [
        { region: 'United States', standard: 'Exact $3,000 ($1,500 MFS) ordinary offset cap, indefinite carryforward, and 30-day Wash-Sale window.', unitsOrCurrency: 'USD ($)', effectiveDate: 'Tax Year 2026' },
        { region: 'Canada / UK / Australia', standard: 'Canada enforces 30-day Superficial Loss rules; UK has 30-day Bed-and-Breakfasting; Australia prohibits wash sales—all three offset capital gains only (no ordinary wage offset).', unitsOrCurrency: 'CAD / GBP / AUD', effectiveDate: '2026' },
      ],
    },
    references: [
      { name: 'Topic No. 409: Capital Gains, Losses & $3,000 Limit', organization: 'Internal Revenue Service (IRS)', url: 'https://www.irs.gov/taxtopics/tc409', effectiveDate: '2026', note: 'Statutory $3,000 ($1,500 MFS) ordinary income cap and indefinite capital loss carryforward.' },
      { name: 'Publication 550: Investment Income and Expenses (Wash Sales)', organization: 'IRS', url: 'https://www.irs.gov/publications/p550', effectiveDate: '2026', note: 'IRC §1091 30-day substantially identical security wash-sale definition.' },
    ],
    commonMistakes: {
      title: 'Rebuying an Identical ETF or Stock Inside Your IRA Within 30 Days',
      explanation: 'Under IRS Revenue Ruling 2008-5, selling a stock at a loss in a taxable brokerage account and buying the same stock inside a Traditional or Roth IRA within 30 days triggers a permanent Wash Sale disallowance.',
    },
    proTips: [
      'Instead of sitting in cash during the 30-day Wash-Sale window, immediately rotate into a non-identical broad market ETF (e.g., S&P 500 → Russell 1000 or Total Market tracking a different index) to stay invested.',
      'Harvesting merely defers tax by lowering your new cost basis—its highest permanent alpha comes from offsetting 24%–37% ordinary income or donating appreciated replacement shares later.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq US Investment Tax Desk',
      reviewDate: 'November 2026',
      accuracyStandard: 'Verified IRC §1211/§1212 netting waterfall ($3,000 / $1,500 MFS cap) and carryforward tracking.',
    },
    eeat: {
      authorRole: 'Numeriq US Tax Editorial Team',
      reviewerRole: 'Numeriq Quantitative Validation Desk',
      methodology: 'Allocates harvested losses sequentially to short-term gains (ordinary rate), long-term gains (LTCG rate), up to $3,000 ($1,500 MFS) ordinary pay, and indefinite carryforward.',
      lastVerifiedDate: '2026-11-19',
      taxOrRegulationYear: 'US IRS IRC §1211 / §1091 (2026)',
      limitations: [
        'Assumes all gains and losses originate in the same tax year without pre-existing long-term/short-term cross-character carryforwards.',
        'Does not calculate future reduced cost-basis exit taxes on replacement shares.',
      ],
      nonAdviceDisclaimer: 'Educational tax-loss harvesting estimator only; consult your tax advisor and avoid §1091 wash sales across household and IRA accounts.',
    },
    relatedCalculatorSlugs: ['capital-gains-tax-calculator', 'cagr-calculator', 'real-rate-of-return-calculator', 'income-tax-calculator'],
  },
};
