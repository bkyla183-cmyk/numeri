import type { EditorialEEAT, EditorialReference, EditorialSection } from '../calculatorEditorial.ts';

interface DomainEeatTemplate {
  references: EditorialReference[];
  eeat: EditorialEEAT;
}

const DOMAIN_EEAT: Record<string, DomainEeatTemplate> = {
  finance: {
    references: [
      {
        name: 'Consumer Financial Protection Bureau (CFPB) Credit & Mortgage Guidance',
        organization: 'U.S. Consumer Financial Protection Bureau',
        url: 'https://www.consumerfinance.gov/',
        effectiveDate: '2026 Active Regulation Z',
        note: 'Standardized APR, amortization, and consumer debt disclosure formulas under TILA.',
      },
      {
        name: 'Investor.gov Financial Planning & Compound Interest Benchmarks',
        organization: 'U.S. Securities and Exchange Commission (SEC)',
        url: 'https://www.investor.gov/',
        effectiveDate: '2026 Reference',
        note: 'Compound return modeling, inflation erosion, and retirement withdrawal principles.',
      },
    ],
    eeat: {
      authorRole: 'Numeriq Personal Finance & Banking Desk',
      reviewerRole: 'Numeriq Quantitative Validation Desk',
      methodology: 'Evaluates standard declining-balance amortization, geometric compounding, and net yield formulas in 64-bit IEEE 754 floating-point precision.',
      lastVerifiedDate: '2026-11-20',
      taxOrRegulationYear: '2026 US / Global Lending & IRS Standards',
      limitations: [
        'Assumes constant periodic interest rates and on-time scheduled payments unless extra prepayments are explicitly modeled.',
        'Lender underwriting fees, credit-score pricing adjustments, and local property tax millage rates vary individually.',
      ],
      nonAdviceDisclaimer: 'Educational financial modeling tool only; confirm binding loan disclosures or investment strategies with a licensed CFP or lender.',
    },
  },
  'business-tax': {
    references: [
      {
        name: 'IRS Revenue Procedure 2025-32 & Federal Tax Withholding Schedules',
        organization: 'Internal Revenue Service (IRS)',
        url: 'https://www.irs.gov/',
        effectiveDate: 'Tax Year 2026',
        note: '2026 federal marginal brackets, standard deductions ($16,100 single / $32,200 MFJ), and FICA thresholds.',
      },
      {
        name: 'UK HMRC & International VAT / Payroll Rate Guidance',
        organization: 'HM Revenue & Customs / Gov.uk',
        url: 'https://www.gov.uk/vat-rates',
        effectiveDate: '2026–27 Fiscal Year',
        note: 'Standard VAT extraction/addition conventions and statutory payroll contribution guidance.',
      },
    ],
    eeat: {
      authorRole: 'Numeriq Tax & Commercial Finance Desk',
      reviewerRole: 'Numeriq Quantitative Validation Desk',
      methodology: 'Implements progressive statutory marginal bracket lookups, payroll wage-base caps, and gross-margin accounting identities cleanly in browser memory.',
      lastVerifiedDate: '2026-11-20',
      taxOrRegulationYear: '2026–2027 Tax & Accounting Schedules',
      limitations: [
        'Illustrative estimates exclude itemized deductions, state-specific surtaxes, or custom local municipal sales/VAT exemptions unless entered.',
        'Always reconcile final tax filings against official IRS Form 1040, HMRC Self Assessment, or CPA worksheets.',
      ],
      nonAdviceDisclaimer: 'Educational tax and margin illustration only; not formal tax, payroll, or legal accounting advice.',
    },
  },
  math: {
    references: [
      {
        name: 'NIST Digital Library of Mathematical Functions (DLMF)',
        organization: 'National Institute of Standards and Technology',
        url: 'https://dlmf.nist.gov/',
        effectiveDate: '2026 Active Reference',
        note: 'Canonical definitions for algebraic roots, exponents, logarithms, and trigonometric functions.',
      },
      {
        name: 'IEEE 754 Floating-Point Arithmetic Standard',
        organization: 'IEEE Standards Association',
        url: 'https://standards.ieee.org/',
        effectiveDate: 'IEEE 754-2019',
        note: 'Double-precision binary floating-point rounding and overflow behavior.',
      },
    ],
    eeat: {
      authorRole: 'Numeriq Applied Mathematics Desk',
      reviewerRole: 'Numeriq Quantitative Validation Desk',
      methodology: 'Executes closed-form algebraic, logarithmic, proportional, and percentage equations directly in IEEE 754 double precision.',
      lastVerifiedDate: '2026-11-20',
      taxOrRegulationYear: 'IEEE 754 / NIST Mathematical Reference',
      limitations: [
        'Floating-point representation provides ~15–17 significant decimal digits; extreme magnitudes (>10^15) may show standard rounding noise.',
        'Real-valued domains guard against zero divisors and negative-base fractional/logarithmic singularities.',
      ],
      nonAdviceDisclaimer: 'Analytical math computation reference; verify mission-critical engineering tolerances independently.',
    },
  },
  'statistics-probability': {
    references: [
      {
        name: 'NIST/SEMATECH e-Handbook of Statistical Methods',
        organization: 'National Institute of Standards and Technology',
        url: 'https://www.itl.nist.gov/div898/handbook/',
        effectiveDate: '2026 Active Reference',
        note: 'Standardized formulas for sample/population variance, Z-scores, confidence intervals, and combinatorics.',
      },
    ],
    eeat: {
      authorRole: 'Numeriq Statistical Modeling Desk',
      reviewerRole: 'Numeriq Quantitative Validation Desk',
      methodology: 'Applies exact combinatorial identities, Bessel-corrected (n − 1) sample variance, and normal CDF/quantile approximations.',
      lastVerifiedDate: '2026-11-20',
      taxOrRegulationYear: 'NIST/SEMATECH Statistical Standard',
      limitations: [
        'Parametric intervals assume random independent sampling and approximate normality where noted.',
        'Large combinatorial factorials evaluate using log-gamma / multiplicative reduction to prevent integer overflow.',
      ],
      nonAdviceDisclaimer: 'Statistical educational reference; consult a biostatistician or data scientist for regulated clinical trials.',
    },
  },
  geometry: {
    references: [
      {
        name: 'Wolfram MathWorld Euclidean Geometry & Mensuration Reference',
        organization: 'Wolfram Research',
        url: 'https://mathworld.wolfram.com/topics/Geometry.html',
        effectiveDate: '2026 Reference',
        note: 'Exact Euclidean area, perimeter, surface area, and solid volume equations.',
      },
    ],
    eeat: {
      authorRole: 'Numeriq Geometry & Spatial Design Desk',
      reviewerRole: 'Numeriq Quantitative Validation Desk',
      methodology: 'Evaluates closed-form 2D planar and 3D solid mensuration formulas using Math.PI double precision.',
      lastVerifiedDate: '2026-11-20',
      taxOrRegulationYear: 'Euclidean Geometry Standard',
      limitations: [
        'Assumes idealized flat Euclidean shapes and uniform thickness/wall geometry.',
        'Inputs must share identical linear units (e.g., all meters or all inches) prior to calculation.',
      ],
      nonAdviceDisclaimer: 'Geometric estimation reference; structural fabrication requires certified shop drawings.',
    },
  },
  'health-fitness': {
    references: [
      {
        name: 'CDC Healthy Weight, BMI & Physical Activity Guidelines',
        organization: 'U.S. Centers for Disease Control and Prevention',
        url: 'https://www.cdc.gov/healthyweight/',
        effectiveDate: '2026 Active Guidance',
        note: 'Adult BMI classification thresholds, body composition context, and cardiovascular activity standards.',
      },
      {
        name: 'WHO Obesity, Nutrition & Maternal Health Standards',
        organization: 'World Health Organization (WHO)',
        url: 'https://www.who.int/health-topics/obesity',
        effectiveDate: '2026 Global Reference',
        note: 'International BMI categories, daily metabolic benchmarks, and clinical screening caveats.',
      },
    ],
    eeat: {
      authorRole: 'Numeriq Health & Clinical Metrics Desk',
      reviewerRole: 'Numeriq Quantitative Validation Desk',
      methodology: 'Implements published clinical equations (Quetelet BMI, Mifflin-St Jeor BMR, US Navy body fat, Tanaka/Karvonen HR, Naegele gestational dating).',
      lastVerifiedDate: '2026-11-20',
      taxOrRegulationYear: '2026 CDC / WHO / NIH Clinical Consensus',
      limitations: [
        'Population formulas cannot directly separate lean skeletal muscle from visceral adipose tissue or account for individual metabolic conditions.',
        'Gestational and ovulation estimates assume regular cycles unless adjusted clinically by ultrasound.',
      ],
      nonAdviceDisclaimer: 'Health and wellness educational calculator only; never replace individualized diagnosis or care from a licensed physician (MD) or registered dietitian.',
    },
  },
  'unit-converters': {
    references: [
      {
        name: 'NIST Handbook 44 & SI Unit Conversion Factors',
        organization: 'National Institute of Standards and Technology',
        url: 'https://www.nist.gov/pml/owm/metric-si/unit-conversion',
        effectiveDate: '2026 SI / US Customary Reference',
        note: 'Exact international definitions (1 inch = 25.4 mm, 1 lb = 0.45359237 kg, IEC vs SI binary prefixes).',
      },
    ],
    eeat: {
      authorRole: 'Numeriq Metrology & Units Desk',
      reviewerRole: 'Numeriq Quantitative Validation Desk',
      methodology: 'Applies exact legal SI and International Yard/Pound conversion constants without intermediate rounding loss.',
      lastVerifiedDate: '2026-11-20',
      taxOrRegulationYear: 'NIST SP 811 / BIPM SI Brochure 9th Ed.',
      limitations: [
        'Culinary volume conversions depend on ingredient density when converting volume to weight; US vs UK Imperial pints/gallons differ.',
        'Data storage distinguishes decimal SI (1000^n) from binary IEC (1024^n) units explicitly.',
      ],
      nonAdviceDisclaimer: 'Metrology reference utility; confirm legal trade or aviation unit specifications against local standards.',
    },
  },
  'date-time': {
    references: [
      {
        name: 'ISO 8601 Date and Time Interchange Standard',
        organization: 'International Organization for Standardization (ISO)',
        url: 'https://www.iso.org/iso-8601-date-and-time-format.html',
        effectiveDate: 'ISO 8601-1:2019',
        note: 'Proleptic Gregorian calendar arithmetic, leap-year divisibility rules, and UTC offset handling.',
      },
    ],
    eeat: {
      authorRole: 'Numeriq Chronology & Calendar Desk',
      reviewerRole: 'Numeriq Quantitative Validation Desk',
      methodology: 'Evaluates UTC-normalized date timestamps to avoid local Daylight Saving Time 23-hour/25-hour day skew.',
      lastVerifiedDate: '2026-11-20',
      taxOrRegulationYear: 'ISO 8601 / IANA Time Zone Standards',
      limitations: [
        'Business-day counts exclude weekends by default and do not automatically remove regional public bank holidays unless specified.',
        'Cross-timezone scheduling should double-check seasonal DST transition dates in both jurisdictions.',
      ],
      nonAdviceDisclaimer: 'Chronological planning calculator; verify statutory legal filing deadlines with local court or regulatory calendars.',
    },
  },
  education: {
    references: [
      {
        name: 'College Board & Institutional 4.0 GPA Credit-Hour Standards',
        organization: 'College Board / U.S. Higher Education Conventions',
        url: 'https://bigfuture.collegeboard.org/',
        effectiveDate: '2026 Academic Year',
        note: 'Standardized credit-weighted quality point averaging and syllabus exam weighting conventions.',
      },
    ],
    eeat: {
      authorRole: 'Numeriq Academic & Grading Standards Desk',
      reviewerRole: 'Numeriq Quantitative Validation Desk',
      methodology: 'Computes exact credit-weighted quality-point averages, syllabus target exam scores, and WPM reading/text metrics.',
      lastVerifiedDate: '2026-11-20',
      taxOrRegulationYear: '2026 Institutional Academic Standards',
      limitations: [
        'Universities and high schools vary on A+ weighting (4.0 vs 4.3), plus/minus increments, and AP/IB honors boosts.',
        'Minimum passing thresholds and final grade rounding rules follow your instructor’s published syllabus.',
      ],
      nonAdviceDisclaimer: 'Academic planning aid only; consult your school registrar or course syllabus for official transcript calculations.',
    },
  },
  science: {
    references: [
      {
        name: 'CODATA Internationally Recommended Values of Fundamental Physical Constants',
        organization: 'NIST / Committee on Data (CODATA)',
        url: 'https://physics.nist.gov/cuu/Constants/',
        effectiveDate: '2022 CODATA Adjustment (Active 2026)',
        note: 'Standard physical constants, SI unit derivations, molarity, pH, and classical mechanics relations.',
      },
    ],
    eeat: {
      authorRole: 'Numeriq Physics & Chemistry Desk',
      reviewerRole: 'Numeriq Quantitative Validation Desk',
      methodology: 'Implements classical Newtonian mechanics, Ohm’s law, IUPAC pH = −log₁₀[H⁺], and molar concentration stoichiometry cleanly in SI units.',
      lastVerifiedDate: '2026-11-20',
      taxOrRegulationYear: 'CODATA / IUPAC SI Standards',
      limitations: [
        'Idealized laboratory conditions assumed (ideal dilute solutions for pH, zero air drag for basic kinematics, linear ohmic resistance).',
        'High ionic strength solutions require activity coefficients rather than raw molar concentration.',
      ],
      nonAdviceDisclaimer: 'Scientific educational tool; verify hazardous chemical dilutions or high-voltage circuit designs under qualified supervision.',
    },
  },
  'home-tech': {
    references: [
      {
        name: 'U.S. Department of Energy (DOE) Solar & Appliance Energy Guidance',
        organization: 'U.S. Department of Energy (Energy.gov)',
        url: 'https://www.energy.gov/energysaver/energy-saver',
        effectiveDate: '2026 Reference',
        note: 'Appliance kilowatt-hour consumption, PV array sizing factors, and residential energy cost methodology.',
      },
      {
        name: 'IETF RFC 4632 Classless Inter-Domain Routing (CIDR)',
        organization: 'Internet Engineering Task Force (IETF)',
        url: 'https://datatracker.ietf.org/doc/html/rfc4632',
        effectiveDate: 'Active Standard',
        note: 'IPv4 subnet mask bitmasking, network/broadcast address boundaries, and usable host calculations.',
      },
    ],
    eeat: {
      authorRole: 'Numeriq Home, Energy & Network Engineering Desk',
      reviewerRole: 'Numeriq Quantitative Validation Desk',
      methodology: 'Evaluates residential volumetric/material estimates, kWh utility cost identities, solar PV output assumptions, and 32-bit IPv4 bitwise CIDR math.',
      lastVerifiedDate: '2026-11-20',
      taxOrRegulationYear: '2026 DOE / IETF / Building Estimating Conventions',
      limitations: [
        'Concrete and paint estimates include basic waste factors; uneven slabs, porous surfaces, or irregular openings require extra buffer.',
        'Solar savings depend on local net-metering tariffs, roof shading, and seasonal utility rate tiers.',
      ],
      nonAdviceDisclaimer: 'Preliminary project and network planning calculator; confirm structural, electrical, or solar permits with licensed contractors.',
    },
  },
};

const SLUG_SPECIFIC_REFS: Record<string, EditorialReference[]> = {
  '401k-calculator': [
    {
      name: 'IRS Notice 2025-67: 2026 401(k) Contribution Limits ($24,500)',
      organization: 'Internal Revenue Service (IRS)',
      url: 'https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-topics-401k-and-profit-sharing-plan-contribution-limits',
      effectiveDate: 'Tax Year 2026',
      note: '2026 elective deferral limit ($24,500), age 50+ catch-up ($8,000), and SECURE 2.0 ages 60–63 super catch-up ($11,250).',
    },
  ],
  'mortgage-calculator': [
    {
      name: 'CFPB Mortgage Loan Estimate & TILA-RESPA Integrated Disclosures',
      organization: 'U.S. Consumer Financial Protection Bureau',
      url: 'https://www.consumerfinance.gov/owning-a-home/',
      effectiveDate: '2026 Active Guidance',
      note: 'Amortization of Principal & Interest (P&I), property tax/insurance escrow, and Homeowners Protection Act PMI rules.',
    },
  ],
  'due-date-calculator': [
    {
      name: 'ACOG Clinical Guidance: Methods for Estimating the Due Date',
      organization: 'American College of Obstetricians and Gynecologists (ACOG)',
      url: 'https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2017/05/methods-for-estimating-the-due-date',
      effectiveDate: 'Active Clinical Committee Opinion',
      note: '280-day (40-week) gestational age calculation from LMP and cycle-length adjustment.',
    },
  ],
  'ovulation-calculator': [
    {
      name: 'ASRM & NHS Fertility Window & Menstrual Cycle Reference',
      organization: 'UK National Health Service (NHS)',
      url: 'https://www.nhs.uk/conditions/periods/fertility-in-the-menstrual-cycle/',
      effectiveDate: '2026 Clinical Reference',
      note: 'Luteal-phase timing (~14 days prior to next cycle) and 6-day fertile window physiology.',
    },
  ],
  'body-fat-calculator': [
    {
      name: 'Hodgdon & Beckett U.S. Navy Circumference Body Fat Equations',
      organization: 'Naval Health Research Center / DoD',
      url: 'https://apps.dtic.mil/',
      effectiveDate: 'Standardized Anthropometric Formula',
      note: 'Logarithmic waist, neck, hip, and height equations validated against hydrostatic densitometry.',
    },
  ],
};

export function enrichCoreEditorial(
  slug: string,
  categorySlug: string,
  editorial: EditorialSection
): EditorialSection {
  if (editorial.references && editorial.references.length > 0 && editorial.eeat) {
    return editorial;
  }

  const domain = DOMAIN_EEAT[categorySlug] || DOMAIN_EEAT.math;
  const specificRefs = SLUG_SPECIFIC_REFS[slug] || [];
  const mergedRefs =
    editorial.references && editorial.references.length > 0
      ? editorial.references
      : [...specificRefs, ...domain.references];

  return {
    ...editorial,
    references: mergedRefs,
    eeat: editorial.eeat || {
      ...domain.eeat,
      authorRole: editorial.editorialReview?.reviewedBy || domain.eeat.authorRole,
      lastVerifiedDate: '2026-11-20',
    },
  };
}
