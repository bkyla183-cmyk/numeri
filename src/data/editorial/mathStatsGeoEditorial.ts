import type { EditorialSection } from '../calculatorEditorial.ts';

export const mathStatsGeoEditorial: Record<string, EditorialSection> = {
  'scientific-calculator': {
    overview:
      'An online scientific calculator evaluates multi-operator algebraic expressions, trigonometric functions in degrees or radians, common and natural logarithms, roots, powers, factorials, and memory register operations with IEEE 754 double precision.',
    detailedExplanation:
      'Evaluating complex expressions safely requires strict operator precedence (parentheses, exponents, multiplication/division, addition/subtraction) paired with explicit angle-mode awareness. Toggling DEG vs. RAD adjusts trigonometric inputs cleanly while tape history preserves every prior answer (`Ans`) for multi-step STEM verification.',
    formulaDisplay: {
      formula: 'sin(θ), cos(θ), tan(θ), log₁₀(x), ln(x), x^y, √x, n!   (2π rad = 360°)',
      latex: '\\theta_{\\text{rad}} = \\theta_{\\text{deg}} \\cdot \\frac{\\pi}{180}, \\quad n! = \\prod_{k=1}^{n} k',
      variableDefinitions: [
        { symbol: 'θ', name: 'Angle Input', description: 'Evaluated in Degrees (DEG) or Radians (RAD)', unit: 'deg or rad' },
        { symbol: 'log₁₀ / ln', name: 'Logarithms', description: 'Base-10 common log or base-e natural log (x > 0)', unit: 'Numeric' },
        { symbol: 'Ans', name: 'Previous Result', description: 'Last evaluated expression stored in working memory', unit: 'Numeric' },
      ],
    },
    workedExample: {
      scenario: 'Evaluating 45² alongside a trigonometric check sin(30°) in DEG mode.',
      inputs: [
        { name: 'Base (x)', value: '45' },
        { name: 'Exponent (y)', value: '2' },
        { name: 'Angle Mode Check', value: 'sin(30) in DEG' },
      ],
      steps: [
        'Compute power: 45^2 = 45 × 45 = 2,025.',
        'Convert 30° to radians internally: 30 × (π / 180) = π/6 rad.',
        'Evaluate sine: sin(π/6) = 0.500000.',
      ],
      result: '2,025 (and sin(30°) = 0.5)',
      interpretation: 'Keeping DEG active for triangle geometry prevents the most common trigonometry error—evaluating sin(30 rad) = -0.988 instead of 0.5.',
    },
    regulatoryAndStandards: {
      title: 'Numerical Evaluation & Mathematical Conventions',
      description: 'Mathematical guarantees built into the Numeriq scientific parser:',
      points: [
        'PEMDAS / BODMAS Precedence: Recursive-descent parsing evaluates parentheses and right-associative exponentiation strictly before multiplication and addition.',
        'Domain Guards: Undefined singularities such as tan(90°), √(-1), log₁₀(0), or factorials above 170! return clear error alerts instead of silent bad values.',
        'IEEE 754 Double Precision: Delivers ~15–17 significant decimal digits of floating-point accuracy.',
      ],
    },
    commonMistakes: {
      title: 'Forgetting Active DEG vs. RAD Angle Mode',
      explanation: 'Switching between physics/calculus (RAD) and surveying/trigonometry (DEG) without verifying the mode indicator reverses trigonometric signs and magnitudes.',
    },
    proTips: [
      'Always check the DEG/RAD toggle badge in the display bar before computing sin, cos, tan, or inverse trig.',
      'Use `Ans` or click any past tape history row to reuse multi-digit intermediate outputs without retyping.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Applied Mathematics Desk',
      reviewDate: 'October 2026',
      accuracyStandard: 'Verified against IEEE 754 floating-point arithmetic and exact trigonometric boundary identities.',
    },
  },

  'percentage-calculator': {
    overview:
      'A percentage calculator solves the three core ratio problems of everyday math: finding a percentage of a number, determining what percentage one value is of another, and computing relative percentage increase or decrease.',
    detailedExplanation:
      'Percentages express ratios standardized out of 100, making disparate scales immediately comparable across discounts, test grades, margins, and economic growth rates. Remembering which value serves as the denominator baseline keeps relative changes mathematically consistent.',
    formulaDisplay: {
      formula: 'P% of Y = (P / 100) × Y   |   X as % of Y = (X / Y) × 100   |   Change % = [(New - Old) / |Old|] × 100',
      latex: '\\text{Share\\%} = \\frac{X}{Y} \\times 100, \\quad \\Delta\\% = \\frac{V_2 - V_1}{|V_1|} \\times 100',
      variableDefinitions: [
        { symbol: 'Part (X)', name: 'Partial Quantity', description: 'Subset or numerator quantity under comparison', unit: 'Numeric' },
        { symbol: 'Whole (Y)', name: 'Reference Total', description: 'Non-zero baseline denominator', unit: 'Numeric' },
        { symbol: 'Δ%', name: 'Percentage Change', description: 'Relative gain (+) or reduction (−) from baseline', unit: '%' },
      ],
    },
    workedExample: {
      scenario: 'Finding what percentage 25 is of 200.',
      inputs: [
        { name: 'Part (X)', value: '25' },
        { name: 'Whole (Y)', value: '200' },
      ],
      steps: [
        'Divide part by whole: 25 ÷ 200 = 0.125.',
        'Multiply decimal by 100: 0.125 × 100 = 12.5%.',
      ],
      result: '12.5%',
      interpretation: '25 represents one-eighth (12.5%) of a total baseline of 200.',
    },
    regulatoryAndStandards: {
      title: 'Percentage vs. Percentage-Point Reporting Standards',
      description: 'Key quantitative distinctions for accurate interpretation:',
      points: [
        'Non-Symmetry of % Change: A 50% decrease from 100 to 50 requires a 100% increase (50 -> 100) to recover the starting value.',
        'Percentage Points (pp): Moving an interest rate from 4.0% to 5.0% is +1.0 percentage point, which equals a +25% relative increase.',
        'Zero-Denominator Guard: Percentage shares and changes require a non-zero reference base.',
      ],
    },
    commonMistakes: {
      title: 'Adding Sequential Percentages Together Directly',
      explanation: 'Applying a 20% discount followed by another 20% off yields a 36% total discount (0.8 × 0.8 = 0.64), not 40%.',
    },
    proTips: [
      'Use the 10% shift trick (move decimal left one digit) for fast mental checks on tips and sales discounts.',
      'Always verify whether your denominator is the initial value (change %) or the final selling price (gross margin %).',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Quantitative Logic Desk',
      reviewDate: 'October 2026',
      accuracyStandard: 'Verified against exact rational proportion arithmetic.',
    },
  },

  'fraction-calculator': {
    overview:
      'A fraction calculator adds, subtracts, multiplies, and divides rational fractions exactly, reducing every result by the Greatest Common Divisor (GCD) and displaying simplified improper fractions, mixed numbers, and decimals.',
    detailedExplanation:
      'Rational arithmetic preserves exact precision where decimal rounding (such as 1/3 ≈ 0.333) loses accuracy across repeated carpentry, baking, or algebra steps. Reducing numerators and denominators via Euclid’s GCD algorithm guarantees lowest-terms output.',
    formulaDisplay: {
      formula: 'a/b ± c/d = (ad ± bc) / (bd)   |   (a/b) × (c/d) = (ac)/(bd)   |   (a/b) ÷ (c/d) = (ad)/(bc)',
      latex: '\\frac{a}{b} \\pm \\frac{c}{d} = \\frac{ad \\pm bc}{bd}',
      variableDefinitions: [
        { symbol: 'a, c', name: 'Numerators', description: 'Whole integers in top positions', unit: 'Integer' },
        { symbol: 'b, d', name: 'Denominators', description: 'Non-zero whole integers in bottom positions', unit: 'Integer ≠ 0' },
      ],
    },
    workedExample: {
      scenario: 'Adding 1/2 + 1/3 and simplifying to lowest terms.',
      inputs: [
        { name: 'Fraction 1', value: '1 / 2' },
        { name: 'Operation', value: 'Addition (+)' },
        { name: 'Fraction 2', value: '1 / 3' },
      ],
      steps: [
        'Find common denominator: 2 × 3 = 6.',
        'Scale numerators: (1 × 3) + (1 × 2) = 3 + 2 = 5.',
        'Check GCD(5, 6) = 1 -> 5/6 is already in simplest form (≈ 0.8333).',
      ],
      result: '5/6 (0.833333)',
      interpretation: 'Exact fraction arithmetic avoids compounding rounding drift across multi-step measurements.',
    },
    regulatoryAndStandards: {
      title: 'Euclidean Reduction & Integer Input Conventions',
      description: 'Core mathematical principles governing rational fractions:',
      points: [
        'Non-Zero Denominators: Division by zero is undefined in rational arithmetic; both denominators and divisor numerators must be non-zero.',
        'Euclidean GCD Reduction: Automatically divides numerator and denominator by GCD(|n|, |d|) to eliminate common factors.',
        'Mixed-Number Formatting: Improper fractions (|n| > d) convert cleanly into whole number plus proper remainder.',
      ],
    },
    commonMistakes: {
      title: 'Adding Numerators and Denominators Straight Across',
      explanation: 'Adding 1/2 + 1/3 as 2/5 is invalid; you must convert both fractions to a common denominator (3/6 + 2/6 = 5/6) first.',
    },
    proTips: [
      'When dividing fractions, remember "Keep, Change, Flip": multiply the first fraction by the reciprocal of the second.',
      'For woodworking or recipe scaling, check the decimal readout alongside the reduced fraction.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Pure & Applied Math Desk',
      reviewDate: 'October 2026',
      accuracyStandard: 'Uses exact integer cross-multiplication and Euclidean GCD reduction.',
    },
  },

  'exponent-calculator': {
    overview:
      'An exponent calculator computes powers x^y for positive, negative, zero, and fractional exponents—making exponential growth, scientific scaling, and fractional root evaluations immediate.',
    detailedExplanation:
      'Exponentiation extends repeated multiplication across all real numbers: negative exponents invert bases (x^(-n) = 1 / x^n), zero exponents equal 1 (for x ≠ 0), and fractional exponents express roots such as x^(1/2) = √x.',
    formulaDisplay: {
      formula: 'x^y   |   x^(-y) = 1 / x^y   |   x^(p/q) = (q√x)^p',
      latex: 'x^{-y} = \\frac{1}{x^y}, \\quad x^{1/n} = \\sqrt[n]{x}',
      variableDefinitions: [
        { symbol: 'x', name: 'Base', description: 'Number raised to power y', unit: 'Real' },
        { symbol: 'y', name: 'Exponent', description: 'Power or fractional root index', unit: 'Real' },
      ],
    },
    workedExample: {
      scenario: 'Computing 2 raised to the 10th power (common binary computing kilobyte factor).',
      inputs: [
        { name: 'Base (x)', value: '2' },
        { name: 'Exponent (y)', value: '10' },
      ],
      steps: [
        'Multiply 2 by itself 10 times: 2 × 2 × 2 × 2 × 2 × 2 × 2 × 2 × 2 × 2.',
        'Evaluate result: 1,024.',
      ],
      result: '1,024',
      interpretation: '2^10 = 1,024 underpins binary kibibyte/mebibyte capacity scaling in computer science.',
    },
    regulatoryAndStandards: {
      title: 'Laws of Exponents & Real-Domain Constraints',
      description: 'Standard algebraic exponent identities:',
      points: [
        'Product & Quotient Laws: x^a · x^b = x^(a+b) and (x^a)^b = x^(a·b).',
        'Fractional Exponent Roots: Fractional powers of negative bases are not real numbers when the reduced denominator is even (e.g. (-4)^0.5).',
        'IEEE 754 Overflow Ceiling: Real exponents exceeding roughly 10^308 surpass double-precision finite limits.',
      ],
    },
    commonMistakes: {
      title: 'Confusing -2^2 With (-2)^2',
      explanation: 'Standard operator precedence evaluates -2^2 as -(2^2) = -4, whereas (-2)^2 = +4.',
    },
    proTips: [
      'Compute cube roots or nth roots quickly by entering fractional decimals (e.g., 0.333333 or 0.5) or using powers of 1/n.',
      'For inverse power problems solving for y when x^y = k, switch to our Logarithm Calculator.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Algebra & STEM Desk',
      reviewDate: 'October 2026',
      accuracyStandard: 'Verified against IEEE 754 `Math.pow` real-number exponentiation conventions.',
    },
  },

  'logarithm-calculator': {
    overview:
      'A logarithm calculator evaluates log_b(x) for any positive base b ≠ 1 and positive argument x, including common base-10 logarithms (decibels, pH, Richter scale) and base-e natural logarithms (continuous compounding and decay).',
    detailedExplanation:
      'Logarithms answer the inverse question of exponentiation: "To what power must base b be raised to produce x?" Using the Change-of-Base identity log_b(x) = ln(x) / ln(b), any logarithmic base reduces cleanly to natural logarithms.',
    formulaDisplay: {
      formula: 'log_b(x) = ln(x) / ln(b)   (for x > 0, b > 0, b ≠ 1)',
      latex: '\\log_b(x) = \\frac{\\ln(x)}{\\ln(b)} \\iff b^y = x',
      variableDefinitions: [
        { symbol: 'x', name: 'Argument', description: 'Strictly positive target value (x > 0)', unit: 'Real > 0' },
        { symbol: 'b', name: 'Logarithm Base', description: 'Positive base not equal to 1 (e.g. 10, 2, e)', unit: 'Real > 0, ≠ 1' },
      ],
    },
    workedExample: {
      scenario: 'Evaluating log₁₀(100) — common base-10 logarithm of 100.',
      inputs: [
        { name: 'Value (x)', value: '100' },
        { name: 'Base (b)', value: '10' },
      ],
      steps: [
        'Apply definition: 10^y = 100.',
        'Change-of-base check: ln(100) / ln(10) = 4.60517 / 2.302585 = 2.',
      ],
      result: '2 (because 10² = 100)',
      interpretation: 'Every +1 increase on a base-10 log scale represents a 10× jump in underlying magnitude.',
    },
    regulatoryAndStandards: {
      title: 'Logarithmic Identities & Scientific Scales',
      description: 'Core laws and real-world logarithmic applications:',
      points: [
        'Strict Domain: Real logarithms are undefined for zero or negative arguments (x ≤ 0) and for base b = 1 or b ≤ 0.',
        'Product & Power Rules: log(AB) = log(A) + log(B) and log(A^k) = k·log(A) turn multiplications into additions.',
        'Science Applications: pH = -log₁₀[H⁺], decibels = 10·log₁₀(P/P₀), and binary algorithm depth = log₂(N).',
      ],
    },
    commonMistakes: {
      title: 'Mixing Up log (Base 10) and ln (Base e)',
      explanation: 'Calculator `log` keys compute base 10 in engineering, while higher-level math textbooks sometimes write `log(x)` for base e—always confirm base explicitly.',
    },
    proTips: [
      'Enter base `2` to compute information-theory bits or binary tree search steps.',
      'Check pH chemistry solutions directly alongside our dedicated pH Calculator.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Applied Mathematics Desk',
      reviewDate: 'October 2026',
      accuracyStandard: 'Verified against real-domain change-of-base identities.',
    },
  },

  'quadratic-formula-calculator': {
    overview:
      'A quadratic formula solver computes exact real or complex conjugate roots for any second-degree polynomial equation ax² + bx + c = 0, analyzing the discriminant Δ = b² − 4ac and finding the parabola vertex.',
    detailedExplanation:
      'The sign of the discriminant immediately determines solution geometry: Δ > 0 produces two distinct x-intercepts, Δ = 0 touches the x-axis at a single repeated root, and Δ < 0 yields two complex conjugate roots with real and imaginary components.',
    formulaDisplay: {
      formula: 'x = (-b ± √(b² - 4ac)) / (2a)   |   Δ = b² - 4ac',
      latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
      variableDefinitions: [
        { symbol: 'a', name: 'Quadratic Coefficient', description: 'Leading non-zero coefficient of x²', unit: 'a ≠ 0' },
        { symbol: 'b, c', name: 'Linear & Constant Terms', description: 'Coefficients of x and constant intercept', unit: 'Real' },
        { symbol: 'Δ', name: 'Discriminant', description: 'Determines two real, one repeated, or two complex roots', unit: 'b² - 4ac' },
      ],
    },
    workedExample: {
      scenario: 'Solving x² - 5x + 6 = 0 where a = 1, b = -5, c = 6.',
      inputs: [
        { name: 'a (x² term)', value: '1' },
        { name: 'b (x term)', value: '-5' },
        { name: 'c (constant)', value: '6' },
      ],
      steps: [
        'Compute discriminant: Δ = (-5)² - 4(1)(6) = 25 - 24 = 1 (> 0, two real roots).',
        'Apply quadratic formula: x = (5 ± √1) / 2 = (5 ± 1) / 2.',
        'Roots: x₁ = 6 / 2 = 3 and x₂ = 4 / 2 = 2.',
      ],
      result: 'x₁ = 3, x₂ = 2 (Two Real Roots)',
      interpretation: 'Both values satisfy the original equation: 3² - 5(3) + 6 = 0 and 2² - 5(2) + 6 = 0.',
    },
    regulatoryAndStandards: {
      title: 'Algebraic Polynomial Root & Numerical Stability Rules',
      description: 'Fundamental principles of quadratic equation solving:',
      points: [
        'Degenerate Case (a = 0): When a = 0, the equation ceases to be quadratic and reduces to linear bx + c = 0.',
        'Fundamental Theorem of Algebra: Every non-degenerate quadratic has exactly two roots over the complex plane.',
        'Vertex Coordinates: The parabola extrema always lies midway between the roots at x_v = -b / (2a).',
      ],
    },
    commonMistakes: {
      title: 'Dropping Negative Signs on b or Dividing Only √Δ by 2a',
      explanation: 'Remember that the entire numerator (-b ± √Δ) must be divided by 2a, and -b becomes positive when b itself is negative.',
    },
    proTips: [
      'Rearrange equations into standard form (= 0) before reading off a, b, and c.',
      'Check simple integer solutions quickly by verifying that x₁ + x₂ = -b/a and x₁·x₂ = c/a (Vieta formulas).',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Algebra & STEM Desk',
      reviewDate: 'October 2026',
      accuracyStandard: 'Verified against exact discriminant classification and complex-root algebra.',
    },
  },

  'discount-calculator': {
    overview:
      'A discount and sale price calculator computes the exact markdown dollar savings and final checkout price from any original list price and percentage discount.',
    detailedExplanation:
      'Instead of multiplying twice to subtract a discount, multiplying original price by the complement factor (1 − Discount%/100) produces the sale price in one step while clarifying exact dollars saved before sales tax.',
    formulaDisplay: {
      formula: 'Savings = Original × (Discount% / 100)   |   Sale Price = Original - Savings',
      latex: 'P_{\\text{sale}} = P_0 \\left(1 - \\frac{d}{100}\\right)',
      variableDefinitions: [
        { symbol: 'P₀', name: 'Original Price', description: 'Pre-discount retail sticker price', unit: 'Currency' },
        { symbol: 'd', name: 'Discount %', description: 'Promotional markdown percentage (0–100%)', unit: '%' },
      ],
    },
    workedExample: {
      scenario: 'Buying an $89.99 jacket during a 25% off store promotion.',
      inputs: [
        { name: 'Original Price', value: '$89.99' },
        { name: 'Discount Percentage', value: '25%' },
      ],
      steps: [
        'Compute discount savings: $89.99 × 0.25 = $22.4975 -> $22.50 saved.',
        'Subtract savings from sticker price: $89.99 - $22.50 = $67.49.',
      ],
      result: '$67.49 Final Sale Price ($22.50 saved)',
      interpretation: 'You pay 75% of the sticker price ($67.49) prior to local sales tax.',
    },
    regulatoryAndStandards: {
      title: 'Retail Markdown & Stacked-Coupon Conventions',
      description: 'Practical consumer pricing mechanics:',
      points: [
        'Pre-Tax Calculation: Percentage store coupons generally apply to the merchandise subtotal before sales tax is added.',
        'Stacked Discounts Compound Multiplicatively: A 20% clearance reduction plus an extra 15% promo code multiplies to 0.80 × 0.85 = 0.68 (32% total off, not 35%).',
        'Reverse Discount Math: To find the pre-discount price from a 25%-off tag of $67.49, divide by 0.75 ($89.99).',
      ],
    },
    commonMistakes: {
      title: 'Adding Multiple Promotional Percentages Together',
      explanation: 'Applying "25% off plus an extra 10% off" yields 32.5% total off rather than 35% because the second markdown applies to the already-reduced price.',
    },
    proTips: [
      'Compare unit prices per ounce or count alongside sale percentages to verify genuine savings.',
      'Pair the final sale price with our Sales Tax Calculator to preview exact register total.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Everyday Math Desk',
      reviewDate: 'October 2026',
      accuracyStandard: 'Verified against standard retail cent-rounded pricing arithmetic.',
    },
  },

  'tip-calculator': {
    overview:
      'A tip and bill split calculator computes exact gratuity amounts, grand totals, and equal per-person shares for restaurants, cafes, deliveries, and group dining.',
    detailedExplanation:
      'Splitting checks fairly at group dinners prevents guesswork around rounding and tip percentages. Computing tip on the pre-tax or post-tax bill and dividing cleanly by guest count ensures everyone pays an accurate share.',
    formulaDisplay: {
      formula: 'Tip = Bill × (Tip% / 100)   |   Per Person = (Bill + Tip) / Guests',
      latex: 'T = B \\cdot \\frac{p}{100}, \\quad \\text{Share} = \\frac{B + T}{N}',
      variableDefinitions: [
        { symbol: 'B', name: 'Bill Subtotal', description: 'Check total before tip', unit: 'Currency' },
        { symbol: 'p', name: 'Tip %', description: 'Selected gratuity rate (e.g. 15%, 18%, 20%)', unit: '%' },
        { symbol: 'N', name: 'Number of Guests', description: 'Diners splitting the total check evenly', unit: 'People' },
      ],
    },
    workedExample: {
      scenario: 'Three friends splitting a $95.00 restaurant bill with a 20% gratuity.',
      inputs: [
        { name: 'Bill Amount', value: '$95.00' },
        { name: 'Tip Percentage', value: '20%' },
        { name: 'Number of Guests', value: '3' },
      ],
      steps: [
        'Calculate total gratuity: $95.00 × 0.20 = $19.00.',
        'Compute grand total: $95.00 + $19.00 = $114.00.',
        'Divide evenly among 3 guests: $114.00 / 3 = $38.00 per person.',
      ],
      result: '$38.00 / Person ($114.00 total check; $19.00 tip)',
      interpretation: 'Each diner contributes $31.67 toward the check plus $6.33 toward gratuity.',
    },
    regulatoryAndStandards: {
      title: 'Regional Service Charge & Tipping Norms',
      description: 'Practical dining etiquette benchmarks across major regions:',
      points: [
        'US & Canada Norms: Standard sit-down dining gratuity generally ranges from 15%–20% of the pre-tax subtotal.',
        'UK & Europe Service Charges: Many restaurants include an optional 10%–12.5% service charge on the check; verify the receipt before double-tipping.',
        'Large-Party Auto-Gratuity: Parties of 6 or more frequently carry a mandatory 18%–20% automatic service line.',
      ],
    },
    commonMistakes: {
      title: 'Accidentally Tipping Twice When Auto-Gratuity Is Included',
      explanation: 'Always check whether an automatic service charge or large-party gratuity already appears on the itemized receipt.',
    },
    proTips: [
      'In the US, standard tipping etiquette applies to the pre-tax food and drink subtotal rather than sales tax.',
      'For fast mental estimation of 15%, compute 10% and add half of it.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Everyday Math Desk',
      reviewDate: 'October 2026',
      accuracyStandard: 'Verified against standard proportional bill-splitting arithmetic.',
    },
  },

  'linear-equation-calculator': {
    overview:
      'A linear equation solver isolates the unknown variable x in first-degree algebraic equations of the form ax + b = c, verifying unique solutions and flagging parallel or identity equations cleanly.',
    detailedExplanation:
      'First-degree linear equations model constant-rate relationships across break-even analysis, unit pricing, kinematics, and proportional scaling. Isolating x reverses addition/subtraction of b before dividing by the slope coefficient a.',
    formulaDisplay: {
      formula: 'ax + b = c  ⇒  x = (c - b) / a   (for a ≠ 0)',
      latex: 'x = \\frac{c - b}{a}',
      variableDefinitions: [
        { symbol: 'a', name: 'Variable Coefficient', description: 'Non-zero slope multiplying x', unit: 'Real ≠ 0' },
        { symbol: 'b, c', name: 'Constants', description: 'Offset term b and target constant c', unit: 'Real' },
      ],
    },
    workedExample: {
      scenario: 'Solving 3x + 5 = 20 for x.',
      inputs: [
        { name: 'a (coefficient)', value: '3' },
        { name: 'b (constant)', value: '5' },
        { name: 'c (right-hand side)', value: '20' },
      ],
      steps: [
        'Subtract 5 from both sides: 3x = 20 - 5 = 15.',
        'Divide both sides by 3: x = 15 / 3 = 5.',
        'Verify substitution: 3(5) + 5 = 15 + 5 = 20.',
      ],
      result: 'x = 5',
      interpretation: 'Every valid non-zero slope a yields exactly one unique point where the line y = ax + b crosses y = c.',
    },
    regulatoryAndStandards: {
      title: 'Linear Algebra Identity & Boundary Conditions',
      description: 'Exhaustive classification of first-degree equations:',
      points: [
        'Unique Solution (a ≠ 0): Line crosses target level exactly once at x = (c - b) / a.',
        'No Solution (a = 0, b ≠ c): Constant inequality (e.g. 5 = 20) represents parallel horizontal lines that never meet.',
        'Infinite Solutions (a = 0, b = c): Identity statement satisfied by every real number.',
      ],
    },
    commonMistakes: {
      title: 'Dividing by a Before Subtracting b From c',
      explanation: 'Dividing 20 by 3 before subtracting 5 breaks equality unless b is also divided by 3.',
    },
    proTips: [
      'Always plug your calculated x back into ax + b to confirm it reproduces c.',
      'To solve two coupled linear equations in x and y simultaneously, use the System of 2 Equations Calculator.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Algebra & STEM Desk',
      reviewDate: 'October 2026',
      accuracyStandard: 'Verified against exact first-degree algebraic axioms.',
    },
  },

  'system-of-equations-calculator': {
    overview:
      'A 2×2 system of linear equations solver computes the exact (x, y) intersection of two lines a₁x + b₁y = c₁ and a₂x + b₂y = c₂ using Cramer’s determinant rule.',
    detailedExplanation:
      'Linear systems model supply-demand equilibrium, mixture constraints, circuit mesh currents, and break-even intersections. Evaluating the 2×2 matrix determinant D = a₁b₂ − a₂b₁ immediately indicates whether the two lines cross at one point, run parallel, or overlap identically.',
    formulaDisplay: {
      formula: 'D = a₁b₂ - a₂b₁   |   x = (c₁b₂ - c₂b₁) / D,   y = (a₁c₂ - a₂c₁) / D',
      latex: 'x = \\frac{c_1 b_2 - c_2 b_1}{a_1 b_2 - a_2 b_1}, \\quad y = \\frac{a_1 c_2 - a_2 c_1}{a_1 b_2 - a_2 b_1}',
      variableDefinitions: [
        { symbol: 'a₁, b₁, c₁', name: 'Equation 1', description: 'Coefficients of a₁x + b₁y = c₁', unit: 'Real' },
        { symbol: 'a₂, b₂, c₂', name: 'Equation 2', description: 'Coefficients of a₂x + b₂y = c₂', unit: 'Real' },
        { symbol: 'D', name: 'System Determinant', description: 'Non-zero determinant confirms unique intersection', unit: 'Real' },
      ],
    },
    workedExample: {
      scenario: 'Solving 2x + 3y = 13 and 4x - y = 5 simultaneously.',
      inputs: [
        { name: 'Equation 1', value: '2x + 3y = 13' },
        { name: 'Equation 2', value: '4x - 1y = 5' },
      ],
      steps: [
        'Compute determinant D = (2)(-1) - (4)(3) = -2 - 12 = -14.',
        'Compute Dx = (13)(-1) - (5)(3) = -13 - 15 = -28 ⇒ x = -28 / -14 = 2.',
        'Compute Dy = (2)(5) - (4)(13) = 10 - 52 = -42 ⇒ y = -42 / -14 = 3.',
      ],
      result: 'x = 2, y = 3',
      interpretation: 'Plugging (2, 3) back confirms 2(2)+3(3)=13 and 4(2)-3=5—meaning both lines intersect uniquely at (2, 3).',
    },
    regulatoryAndStandards: {
      title: 'Cramer’s Rule & Determinant Singularity Cases',
      description: 'Matrix rank conditions for 2-variable linear systems:',
      points: [
        'Unique Intersection (D ≠ 0): Lines have distinct slopes and cross at one coordinate pair.',
        'Parallel Lines (D = 0, Dx ≠ 0 or Dy ≠ 0): System is inconsistent with zero solutions.',
        'Coincident Lines (D = Dx = Dy = 0): Both equations describe the same line with infinitely many solutions.',
      ],
    },
    commonMistakes: {
      title: 'Swapping Equation Signs When Moving Constants Across "="',
      explanation: 'Cramer’s rule expects constants c₁ and c₂ on the right-hand side (ax + by = c), not added on the left.',
    },
    proTips: [
      'Always rewrite both equations in standard ax + by = c form before entering coefficients.',
      'Check small determinants near zero carefully, as nearly parallel lines amplify floating-point sensitivity.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Algebra & Linear Systems Desk',
      reviewDate: 'October 2026',
      accuracyStandard: 'Verified against Cramer’s determinant rule and linear independence theory.',
    },
  },

  'standard-deviation-calculator': {
    overview:
      'A standard deviation calculator quantifies dataset spread around the arithmetic mean, computing both sample standard deviation (s, using N − 1 Bessel’s correction) and population standard deviation (σ, using N), along with variance, sum, median, and per-item squared deviations.',
    detailedExplanation:
      'Mean alone hides volatility: two portfolios or classrooms can average 80 while one clusters tightly around 78–82 and the other swings from 40 to 120. Showing every item deviation (x − μ) and squared deviation makes statistical dispersion intuitive.',
    formulaDisplay: {
      formula: 's = √[ Σ(xᵢ - x̄)² / (N - 1) ]   |   σ = √[ Σ(xᵢ - μ)² / N ]',
      latex: 's = \\sqrt{\\frac{\\sum (x_i - \\bar{x})^2}{N - 1}}, \\quad \\sigma = \\sqrt{\\frac{\\sum (x_i - \\mu)^2}{N}}',
      variableDefinitions: [
        { symbol: 'x̄ / μ', name: 'Mean', description: 'Arithmetic average of all numeric items', unit: 'Data unit' },
        { symbol: 's / σ', name: 'Sample / Pop SD', description: 'Dispersion using N − 1 or N divisor', unit: 'Data unit' },
        { symbol: 's² / σ²', name: 'Variance', description: 'Average squared deviation prior to square root', unit: 'Unit²' },
      ],
    },
    workedExample: {
      scenario: 'Evaluating Sample Standard Deviation for dataset [10, 12, 23, 23, 16, 23, 21, 16].',
      inputs: [
        { name: 'Dataset (N = 8)', value: '10, 12, 23, 23, 16, 23, 21, 16' },
      ],
      steps: [
        'Compute mean x̄ = (10 + 12 + 23 + 23 + 16 + 23 + 21 + 16) / 8 = 144 / 8 = 18.0.',
        'Sum squared deviations Σ(x - 18)² = 64 + 36 + 25 + 25 + 4 + 25 + 9 + 4 = 192.',
        'Divide by N - 1 = 7 to get sample variance: 192 / 7 = 27.4286.',
        'Take square root: s = √27.4286 = 5.2372.',
      ],
      result: 's = 5.2372 (Mean = 18; Sample Variance = 27.4286; Population σ = 4.8990)',
      interpretation: 'Typical observations fall roughly ±5.24 units around the average of 18.',
    },
    regulatoryAndStandards: {
      title: 'Bessel’s Correction (N − 1) vs. Population (N)',
      description: 'Core statistical inference standards:',
      points: [
        'Sample Mode (N - 1): Standard default in experiments and polling when estimating an unknown population from a subset; corrects downward variance bias.',
        'Population Mode (N): Appropriate only when your list includes every single member of the entire target group.',
        'Minimum Count: Sample standard deviation requires N ≥ 2 observations to avoid division by zero.',
      ],
    },
    commonMistakes: {
      title: 'Using Population Divisor N on Small Sample Data',
      explanation: 'Applying N instead of N − 1 on small experimental samples systematically underestimates true population variability.',
    },
    proTips: [
      'Use Sample SD (N - 1) unless you explicitly possess 100% of the population records.',
      'Pair your computed mean and SD with our Z-Score Calculator to measure outlier distance.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Statistics & Data Science Desk',
      reviewDate: 'October 2026',
      accuracyStandard: 'Verified against standard sample/population variance and Bessel correction benchmarks.',
    },
  },

  'z-score-calculator': {
    overview:
      'A Z-score calculator converts any raw observation into standard deviation units relative to a population mean and standard deviation, helping identify statistical outliers and normal-distribution percentiles.',
    detailedExplanation:
      'Standardizing scores onto a zero-mean, unit-variance Z scale lets analysts compare measurements from completely different tests or units—such as an SAT reading score against an ACT math score or quality-control tolerances across factories.',
    formulaDisplay: {
      formula: 'Z = (X - μ) / σ',
      latex: 'Z = \\frac{X - \\mu}{\\sigma}',
      variableDefinitions: [
        { symbol: 'X', name: 'Raw Score', description: 'Observed individual data value', unit: 'Data unit' },
        { symbol: 'μ', name: 'Population Mean', description: 'Center average of the reference distribution', unit: 'Data unit' },
        { symbol: 'σ', name: 'Standard Deviation', description: 'Positive spread of reference distribution (σ > 0)', unit: 'Data unit' },
      ],
    },
    workedExample: {
      scenario: 'A student scores X = 85 on an exam with class mean μ = 70 and standard deviation σ = 10.',
      inputs: [
        { name: 'Raw Score (X)', value: '85' },
        { name: 'Mean (μ)', value: '70' },
        { name: 'Standard Deviation (σ)', value: '10' },
      ],
      steps: [
        'Find distance from mean: 85 - 70 = +15 points above average.',
        'Divide by standard deviation: +15 / 10 = +1.50.',
      ],
      result: 'Z = +1.50 Standard Deviations',
      interpretation: 'Under a normal bell curve, Z = +1.50 places the score near the 93.3rd percentile—higher than roughly 93% of peers.',
    },
    regulatoryAndStandards: {
      title: 'Normal Distribution Empirical Rule (68–95–99.7)',
      description: 'Standard benchmark thresholds on the Z-scale:',
      points: [
        '|Z| ≤ 1: Roughly 68.27% of normal observations lie within 1 standard deviation of μ.',
        '|Z| ≤ 2: Roughly 95.45% lie within 2 standard deviations; values past |Z| > 2 warrant outlier inspection.',
        'Positive vs. Negative Sign: Positive Z lies above mean; negative Z lies below mean.',
      ],
    },
    commonMistakes: {
      title: 'Applying Normal Percentile Rules to Heavily Skewed Data',
      explanation: 'While Z = (X − μ)/σ can be computed for any distribution, bell-curve percentile lookups assume approximate normality.',
    },
    proTips: [
      'Compute μ and σ cleanly first with the Standard Deviation Calculator when starting from raw sample lists.',
      'Watch for |Z| ≥ 3 as a classic three-sigma statistical anomaly indicator.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Statistics & Data Science Desk',
      reviewDate: 'October 2026',
      accuracyStandard: 'Verified against standard normal standardization and empirical probability thresholds.',
    },
  },

  'confidence-interval-calculator': {
    overview:
      'A confidence interval calculator computes exact lower and upper bounds at 90%, 95%, 99%, or 99.9% confidence for population means using Student’s t* (when sample SD s is observed) or Normal Z* (when σ is known), as well as sample proportions (Wald & Wilson Score).',
    detailedExplanation:
      'Because sample averages fluctuate from draw to draw, reporting a single point estimate hides sampling uncertainty. Dividing standard deviation by √n produces the Standard Error, and scaling by Student’s t*(df = n − 1) properly accounts for extra variance estimation uncertainty before multiplying.',
    formulaDisplay: {
      formula: 'Mean CI = x̄ ± t*(df) · (s / √n)   |   Known σ: x̄ ± Z* · (σ / √n)   |   Proportion: p̂ ± Z* · √[p̂(1-p̂)/n]',
      latex: '\\text{CI} = \\bar{x} \\pm t^*_{n-1} \\frac{s}{\\sqrt{n}}',
      variableDefinitions: [
        { symbol: 'x̄', name: 'Sample Mean', description: 'Observed average from the sample', unit: 'Data unit' },
        { symbol: 's, σ', name: 'Standard Deviation', description: 'Sample SD (uses Student t*) or Population SD (uses Normal Z*)', unit: 'Data unit' },
        { symbol: 'n', name: 'Sample Size', description: 'Number of independent observations (n ≥ 2)', unit: 'Count' },
        { symbol: 't*, Z*', name: 'Critical Value', description: 'Exact Student t*(df = n−1) or Z* (1.645, 1.960, 2.576, 3.291)', unit: 'Multiplier' },
      ],
    },
    workedExample: {
      scenario: 'Constructing a 95% confidence interval for sample mean 50, sample SD s = 8, and sample size n = 64 (df = 63).',
      inputs: [
        { name: 'Sample Mean (x̄)', value: '50' },
        { name: 'Sample SD (s)', value: '8 (Sample SD basis)' },
        { name: 'Sample Size (n)', value: '64 (df = 63)' },
        { name: 'Confidence Level', value: '95% (t* = 1.9983)' },
      ],
      steps: [
        'Compute Standard Error: SE = 8 / √64 = 8 / 8 = 1.000.',
        'Look up Student’s t* for df = 63 at 95% confidence: t* = 1.9983 (vs. Z* = 1.960 if σ were known).',
        'Compute Margin of Error & Bounds: ME = 1.9983 × 1.000 = ±1.998 ⇒ [48.002, 51.998].',
      ],
      result: '[48.002, 51.998] (Student t* = 1.9983, Margin of Error = ±1.998)',
      interpretation: 'Using Student’s t* captures added uncertainty from estimating σ via sample s; switching Basis to Population σ (Z* = 1.960) narrows the interval slightly to [48.040, 51.960].',
    },
    regulatoryAndStandards: {
      title: 'Inferential Statistics: Student’s t, Z* & Wilson Score Conventions',
      description: 'Key statistical standards implemented in this tool:',
      points: [
        'Student t* vs. Normal Z*: Student’s t*(df = n − 1) is the textbook choice whenever only sample SD s is measured, converging naturally toward Z* as n grows large.',
        'Wilson Score for Proportions: In proportion mode, both classic Wald bounds and superior Wilson Score bounds are reported for small n or extreme proportions.',
        'Independent Random Sampling: Interval accuracy assumes unbiased, independent sample draws.',
      ],
    },
    commonMistakes: {
      title: 'Forgetting to Divide Standard Deviation by √n',
      explanation: 'Multiplying Z* directly by raw s instead of the standard error s/√n computes a sample tolerance range rather than a confidence interval for the mean.',
    },
    proTips: [
      'To halve your survey margin of error at the same confidence level, plan for 4× as many respondents.',
      'Check whether 0 or a benchmark target falls inside the interval to assess statistical significance quickly.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Statistics & Survey Science Desk',
      reviewDate: 'October 2026',
      accuracyStandard: 'Verified against standard Central Limit Theorem confidence interval bounds.',
    },
  },

  'permutations-calculator': {
    overview:
      'A permutations calculator computes P(n, r)—the exact number of ordered arrangements of r items chosen from n distinct items when selection sequence matters.',
    detailedExplanation:
      'Whenever order changes the outcome—such as race podium rankings (Gold/Silver/Bronze), PIN passcodes without repetition, or job scheduling—permutations multiply downward from n across r steps.',
    formulaDisplay: {
      formula: 'P(n, r) = n! / (n - r)!   (for integers 0 ≤ r ≤ n)',
      latex: 'P(n, r) = \\frac{n!}{(n - r)!}',
      variableDefinitions: [
        { symbol: 'n', name: 'Total Pool Size', description: 'Number of distinct available items', unit: 'Integer ≥ 0' },
        { symbol: 'r', name: 'Selected Positions', description: 'Number of ordered slots filled (r ≤ n)', unit: 'Integer ≥ 0' },
      ],
    },
    workedExample: {
      scenario: 'Awarding 1st, 2nd, and 3rd place medals (r = 3) among n = 8 sprinters.',
      inputs: [
        { name: 'Total Pool (n)', value: '8' },
        { name: 'Ordered Positions (r)', value: '3' },
      ],
      steps: [
        'Apply falling factorial: P(8, 3) = 8! / (8 - 3)! = 8! / 5!.',
        'Cancel common factors: 8 × 7 × 6 = 336 distinct podium outcomes.',
      ],
      result: '336 Permutations',
      interpretation: 'Because 1st-2nd-3rd matters, the same three athletes can occupy 6 different podium orders.',
    },
    regulatoryAndStandards: {
      title: 'Combinatorics & Overflow Safeguards',
      description: 'Discrete mathematics conventions:',
      points: [
        'Integer Domain: Both n and r must be non-negative whole integers satisfying r ≤ n.',
        'Order Sensitivity: Changing (A, B) to (B, A) counts as two distinct permutations; use Combinations when order does not matter.',
        'Factorial Growth Limit: Computing iteratively avoids intermediate factorial overflow for moderate n.',
      ],
    },
    commonMistakes: {
      title: 'Using Permutations When Group Order Is Irrelevant',
      explanation: 'Choosing a 3-person committee where roles are identical is a combination problem C(n, r), not a permutation P(n, r).',
    },
    proTips: [
      'Remember P(n, r) = C(n, r) × r!—every combination of size r expands into r! ordered permutations.',
      'Switch to Combinations (nCr) if members of the chosen subset are interchangeable.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Discrete Mathematics Desk',
      reviewDate: 'October 2026',
      accuracyStandard: 'Verified against exact falling-factorial combinatorial identities.',
    },
  },

  'combinations-calculator': {
    overview:
      'A combinations calculator computes C(n, r) ("n choose r")—the count of unique subsets of size r drawn from n distinct items where selection order does not matter.',
    detailedExplanation:
      'Combinations underlie lottery odds, card hands, committee selection, and experimental sampling. Dividing P(n, r) by r! removes redundant orderings of the exact same group.',
    formulaDisplay: {
      formula: 'C(n, r) = n! / [r! × (n - r)!]   (for integers 0 ≤ r ≤ n)',
      latex: '\\binom{n}{r} = \\frac{n!}{r!(n - r)!}',
      variableDefinitions: [
        { symbol: 'n', name: 'Total Items', description: 'Size of distinct available set', unit: 'Integer ≥ 0' },
        { symbol: 'r', name: 'Subset Size', description: 'Items chosen per unordered group (r ≤ n)', unit: 'Integer ≥ 0' },
      ],
    },
    workedExample: {
      scenario: 'Selecting a 4-person project committee (r = 4) from n = 10 team members.',
      inputs: [
        { name: 'Pool Size (n)', value: '10' },
        { name: 'Committee Size (r)', value: '4' },
      ],
      steps: [
        'Apply binomial coefficient: C(10, 4) = 10! / (4! × 6!).',
        'Simplify numerator and denominator: (10 × 9 × 8 × 7) / (4 × 3 × 2 × 1) = 5,040 / 24 = 210.',
      ],
      result: '210 Unique Combinations',
      interpretation: 'Notice symmetry: choosing 4 members to include equals choosing 6 to leave out, so C(10, 4) = C(10, 6) = 210.',
    },
    regulatoryAndStandards: {
      title: 'Binomial Coefficients & Pascal Symmetry',
      description: 'Key combinatorial identities:',
      points: [
        'Symmetry Identity: C(n, r) = C(n, n - r), which speeds computation by always iterating over min(r, n - r).',
        'Edge Cases: C(n, 0) = 1 and C(n, n) = 1 (one way to choose nothing or everything).',
        'Iterative Multiplication: Computing numerator/denominator stepwise keeps intermediate integers small without 170! overflow.',
      ],
    },
    commonMistakes: {
      title: 'Entering r Greater Than n',
      explanation: 'You cannot select more distinct items without replacement than exist in the pool; valid inputs satisfy 0 ≤ r ≤ n.',
    },
    proTips: [
      'Use symmetry C(100, 98) = C(100, 2) = 4,950 for quick mental checks.',
      'Use Permutations (nPr) instead when rankings or position order differentiates outcomes.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Discrete Mathematics Desk',
      reviewDate: 'October 2026',
      accuracyStandard: 'Verified against Pascal triangle binomial coefficient identities.',
    },
  },

  'triangle-area-calculator': {
    overview:
      'A triangle area calculator computes planar triangular area using Heron’s three-side formula (default), Base × Perpendicular Height, or Side-Angle-Side (SAS) trigonometry.',
    detailedExplanation:
      'Whether surveying an irregular land parcel with three tape-measured sides (Heron’s formula), framing a roof gable from base and altitude (0.5 × b × h), or measuring two beams meeting at a known angle (0.5 × a × b × sin γ), selecting the matching geometry mode yields exact area without manual altitude conversions.',
    formulaDisplay: {
      formula: 'Heron: √[s(s - a)(s - b)(s - c)]   |   Base×Height: 0.5 × b × h   |   SAS: 0.5 × a × b × sin(γ)',
      latex: 'A = \\sqrt{s(s-a)(s-b)(s-c)} = \\frac{1}{2}bh = \\frac{1}{2}ab\\sin(\\gamma)',
      variableDefinitions: [
        { symbol: 'a, b, c', name: 'Three Sides (Heron)', description: 'Triangle side lengths satisfying triangle inequality; s = (a+b+c)/2', unit: 'Length unit' },
        { symbol: 'b, h', name: 'Base & Height', description: 'Reference base and 90° perpendicular altitude', unit: 'Length unit' },
        { symbol: 'γ', name: 'Included Angle (SAS)', description: 'Angle strictly between 0° and 180° joining sides a and b', unit: 'Degrees' },
      ],
    },
    workedExample: {
      scenario: 'Calculating the area, perimeter, and classification of a scalene triangle with sides 5 cm, 6 cm, and 7 cm via Heron’s Formula.',
      inputs: [
        { name: 'Method', value: "3 Sides (Heron's Formula)" },
        { name: 'Sides a, b, c', value: '5 cm, 6 cm, 7 cm' },
      ],
      steps: [
        'Compute semi-perimeter s = (5 + 6 + 7) / 2 = 9 cm (Perimeter = 18 cm).',
        'Apply Heron’s Formula: Area = √[9 × (9 - 5) × (9 - 6) × (9 - 7)] = √[9 × 4 × 3 × 2] = √216.',
        'Evaluate √216 = 14.6969 sq units (Scalene triangle). By comparison, Base 10 × Height 6 mode gives 0.5 × 10 × 6 = 30 sq units.',
      ],
      result: '14.6969 sq units (Perimeter = 18 cm; Scalene)',
      interpretation: 'Heron’s formula avoids needing to measure vertical altitude, while Base × Height and SAS modes handle architectural and trigonometric layouts directly.',
    },
    regulatoryAndStandards: {
      title: 'Euclidean Plane Geometry Conventions',
      description: 'Core geometric definitions:',
      points: [
        'Perpendicular Altitude: Height h must stand perpendicular to the base line, not along a slanted edge.',
        'Unit Consistency: Both base and height must share identical linear units (e.g., cm, ft, m) so area outputs in squared units.',
        'Triangle Inequality (Three Sides): If modeling side lengths a, b, c directly, every pair must sum strictly above the third side.',
      ],
    },
    commonMistakes: {
      title: 'Substituting Slant Side Length for Perpendicular Height',
      explanation: 'Using a slanted side instead of true vertical height overestimates triangular area on non-right triangles.',
    },
    proTips: [
      'For right triangles, either leg serves as base and the other leg serves directly as height.',
      'Use the Pythagorean Theorem Calculator first if you need to recover vertical height from a slanted edge.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Geometry & Surveying Desk',
      reviewDate: 'October 2026',
      accuracyStandard: 'Follows exact Euclidean planar area geometry.',
    },
  },

  'circle-calculator': {
    overview:
      'A circle calculator computes exact area, circumference, and diameter from any positive circle radius using IEEE 754 double-precision π.',
    detailedExplanation:
      'Because circle area grows with the square of radius while circumference grows linearly, doubling a pizza, pipe, or garden bed radius doubles its perimeter yet quadruples its total area and material coverage.',
    formulaDisplay: {
      formula: 'Area = π r²   |   Circumference = 2 π r   |   Diameter = 2 r',
      latex: 'A = \\pi r^2, \\quad C = 2\\pi r, \\quad d = 2r',
      variableDefinitions: [
        { symbol: 'r', name: 'Radius', description: 'Distance from circle center to rim', unit: 'Length unit' },
        { symbol: 'A', name: 'Area', description: 'Enclosed planar surface area', unit: 'Unit²' },
        { symbol: 'C', name: 'Circumference', description: 'Total perimeter length around rim', unit: 'Length unit' },
      ],
    },
    workedExample: {
      scenario: 'Finding area, circumference, and diameter for a circle of radius 7 cm.',
      inputs: [
        { name: 'Radius (r)', value: '7 cm' },
      ],
      steps: [
        'Compute diameter: d = 2 × 7 = 14 cm.',
        'Compute circumference: C = 2 × π × 7 = 43.9823 cm.',
        'Compute area: A = π × 7² = 49π = 153.9380 cm².',
      ],
      result: 'Area = 153.938 sq units (Circumference = 43.982; Diameter = 14)',
      interpretation: 'Using full floating-point π avoids the ~0.04% error of rough 3.14 approximations.',
    },
    regulatoryAndStandards: {
      title: 'Euclidean Circle Geometry Constants',
      description: 'Standard precision conventions for circular measurement:',
      points: [
        'Machine π Precision: Uses `Math.PI` (3.141592653589793) rather than truncated 3.14 or 22/7.',
        'Diameter-to-Radius Input: If measuring across a pipe or wheel rim (diameter), halve the measurement before entering radius.',
        'Area Scaling Law: Multiplying radius by k multiplies area by k².',
      ],
    },
    commonMistakes: {
      title: 'Entering Diameter Into a Radius Field',
      explanation: 'Plugging full diameter into a radius input quadruples calculated circle area and doubles circumference.',
    },
    proTips: [
      'Remember 2πr for circumference (linear units) and πr² for area (square units).',
      'Extend circular bases into 3D volume quickly using our Cylinder Calculator.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Geometry & CAD Desk',
      reviewDate: 'October 2026',
      accuracyStandard: 'Verified against IEEE 754 circular constants.',
    },
  },

  'pythagorean-theorem-calculator': {
    overview:
      'A Pythagorean theorem calculator solves for the hypotenuse c (or verifies right-triangle leg relationships, area, and perimeter) given perpendicular legs a and b.',
    detailedExplanation:
      'In construction framing, roof pitches, ladder placement, and coordinate distance calculations, the 90° right-triangle rule a² + b² = c² converts two orthogonal measurements directly into the diagonal span.',
    formulaDisplay: {
      formula: 'a² + b² = c²  ⇒  c = √(a² + b²)',
      latex: 'c = \\sqrt{a^2 + b^2}',
      variableDefinitions: [
        { symbol: 'a, b', name: 'Triangle Legs', description: 'Two sides forming the 90° right angle', unit: 'Length unit' },
        { symbol: 'c', name: 'Hypotenuse', description: 'Longest diagonal side opposite the 90° angle', unit: 'Length unit' },
      ],
    },
    workedExample: {
      scenario: 'Checking squaring on a foundation corner with legs a = 3 ft and b = 4 ft.',
      inputs: [
        { name: 'Side a', value: '3' },
        { name: 'Side b', value: '4' },
      ],
      steps: [
        'Square each leg: 3² = 9 and 4² = 16.',
        'Sum squares: 9 + 16 = 25.',
        'Take principal square root: c = √25 = 5 units.',
      ],
      result: 'Hypotenuse c = 5 units (3-4-5 Right Triangle)',
      interpretation: 'Classic Pythagorean triples (3-4-5, 5-12-13, 8-15-17) give carpenters exact 90° corners using only a tape measure.',
    },
    regulatoryAndStandards: {
      title: 'Right-Triangle Constraints & Construction Checks',
      description: 'Core geometric rules of Euclidean right triangles:',
      points: [
        'Strict Right-Angle Requirement: Applies exclusively when the angle between legs a and b is 90°; oblique triangles require the Law of Cosines.',
        'Hypotenuse Dominance: Hypotenuse c is always strictly longer than either individual leg and strictly shorter than a + b.',
        'Positivity Domain: Valid physical triangles require positive side lengths a > 0 and b > 0.',
      ],
    },
    commonMistakes: {
      title: 'Adding a + b Instead of Squaring First',
      explanation: 'Remember that √(a² + b²) is always smaller than a + b because squaring is non-linear.',
    },
    proTips: [
      'Scale the 3-4-5 rule up (e.g., 6-8-10 or 9-12-15 ft) to square patios, decks, and concrete forms.',
      'To recover a missing leg b when c and a are known, evaluate √(c² − a²).',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Geometry & Surveying Desk',
      reviewDate: 'October 2026',
      accuracyStandard: 'Follows exact Euclidean right-triangle distance identities.',
    },
  },

  'cylinder-calculator': {
    overview:
      'A cylinder volume and surface area calculator computes internal cubic capacity, lateral wall area, and total surface area (including both circular end caps) from radius and height.',
    detailedExplanation:
      'Cylindrical tanks, pipes, concrete pier tubes, and drums share one universal cross-sectional geometry: circular base area πr² extruded linearly along height h. Calculating both lateral surface and end-cap area aids coating, insulation, and volume estimation.',
    formulaDisplay: {
      formula: 'V = π r² h   |   Total Surface Area = 2πrh + 2πr² = 2πr(r + h)',
      latex: 'V = \\pi r^2 h, \\quad \\text{SA} = 2\\pi r(r + h)',
      variableDefinitions: [
        { symbol: 'r', name: 'Base Radius', description: 'Half of cylinder diameter', unit: 'Length unit' },
        { symbol: 'h', name: 'Height / Length', description: 'Perpendicular cylinder length', unit: 'Length unit' },
        { symbol: 'V', name: 'Cubic Volume', description: 'Internal cylindrical capacity', unit: 'Unit³' },
      ],
    },
    workedExample: {
      scenario: 'Finding volume and total surface area for a cylindrical canister with radius 4 cm and height 10 cm.',
      inputs: [
        { name: 'Radius (r)', value: '4 cm' },
        { name: 'Height (h)', value: '10 cm' },
      ],
      steps: [
        'Base area: π × 4² = 16π = 50.2655 cm².',
        'Volume: 50.2655 × 10 = 502.6548 cm³.',
        'Total surface area: 2π(4)(4 + 10) = 112π = 351.8584 cm².',
      ],
      result: 'Volume = 502.6548 cubic units (Surface Area = 351.8584 sq units)',
      interpretation: '502.65 cm³ equals ~0.503 liters of liquid capacity (1,000 cm³ = 1 liter).',
    },
    regulatoryAndStandards: {
      title: 'Solid Geometry & Volumetric Unit Conversions',
      description: 'Engineering conventions for cylindrical vessels:',
      points: [
        'Inner vs. Outer Radius: Use internal radius when computing tank fluid capacity; use outer radius when ordering exterior wrap or paint.',
        'Open-Top Containers: Subtract one circular cap area (πr²) when coating open tanks or silos.',
        'Dimensional Matching: Keep radius and height in identical units before converting cubic inches/feet to gallons or liters.',
      ],
    },
    commonMistakes: {
      title: 'Confusing Diameter With Radius in Tank Specs',
      explanation: 'Cylindrical drums are commonly specified by diameter (e.g., 24" culvert); forgetting to divide diameter by 2 makes computed volume 4× too large.',
    },
    proTips: [
      '1 cubic meter = 1,000 liters; 1 cubic foot = 7.4805 US gallons.',
      'For round concrete pier footings, divide cubic feet volume by 27 to get cubic yards for our Concrete Calculator.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Engineering Geometry Desk',
      reviewDate: 'October 2026',
      accuracyStandard: 'Verified against exact Euclidean solid mensuration formulas.',
    },
  },

  'sphere-calculator': {
    overview:
      'A sphere calculator computes exact 3D cubic volume, spherical shell surface area, diameter, and great-circle circumference from radius using double-precision π.',
    detailedExplanation:
      'A sphere packs the largest possible volume inside the smallest enclosing surface area of any 3D shape. Because volume scales with r³ while surface area scales with r², doubling sphere radius increases surface area 4× and internal volume 8×.',
    formulaDisplay: {
      formula: 'V = (4/3) π r³   |   Surface Area = 4 π r²',
      latex: 'V = \\frac{4}{3}\\pi r^3, \\quad \\text{SA} = 4\\pi r^2',
      variableDefinitions: [
        { symbol: 'r', name: 'Sphere Radius', description: 'Distance from sphere center to outer surface', unit: 'Length unit' },
        { symbol: 'V', name: 'Cubic Volume', description: 'Total enclosed 3D space', unit: 'Unit³' },
        { symbol: 'SA', name: 'Surface Area', description: 'Outer spherical shell area', unit: 'Unit²' },
      ],
    },
    workedExample: {
      scenario: 'Computing volume and surface area of a sphere with radius r = 5 cm.',
      inputs: [
        { name: 'Radius (r)', value: '5 cm' },
      ],
      steps: [
        'Cube the radius: 5³ = 125 cm³.',
        'Volume: (4/3) × π × 125 = 523.5988 cm³.',
        'Surface area: 4 × π × 5² = 100π = 314.1593 cm².',
      ],
      result: 'Volume = 523.5988 cubic units (Surface Area = 314.1593 sq units)',
      interpretation: 'Notice that the sphere surface area (314.16) equals exactly four times the flat area of its equatorial circle (78.54).',
    },
    regulatoryAndStandards: {
      title: 'Archimedean Solid Geometry Identities',
      description: 'Fundamental spherical mensuration relationships:',
      points: [
        'Archimedes Sphere-Cylinder Ratio: A sphere holds exact 2/3 the volume and 2/3 the total surface area of its circumscribing cylinder.',
        'Great Circle Bounds: Circumference around the equator equals 2πr.',
        'Strict Positivity: Physical spheres require positive radius r > 0.',
      ],
    },
    commonMistakes: {
      title: 'Using r² Instead of r³ Inside the Volume Formula',
      explanation: 'Remember volume requires cubed radius (4/3 πr³) for cubic dimensions, whereas surface area uses squared radius (4πr²).',
    },
    proTips: [
      'Divide measured ball circumference by 2π to recover radius accurately without slicing.',
      'Multiply computed sphere volume by material density to estimate weight of ball bearings or tanks.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Engineering Geometry Desk',
      reviewDate: 'October 2026',
      accuracyStandard: 'Verified against Archimedean solid geometry formulas.',
    },
  },
};
