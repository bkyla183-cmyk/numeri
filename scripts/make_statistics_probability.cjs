const fs = require('fs');

const code = `import { CalculatorSpec } from './types';

// Standard normal cumulative distribution approximation (Abramowitz & Stegun)
function normalCdf(z: number): number {
  const b1 = 0.319381530;
  const b2 = -0.356563782;
  const b3 = 1.781477937;
  const b4 = -1.821255978;
  const b5 = 1.330274429;
  const p = 0.2316419;
  const c = 0.39894228;
  if (z >= 0) {
    const t = 1.0 / (1.0 + p * z);
    return 1.0 - c * Math.exp(-z * z / 2.0) * t * (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1);
  } else {
    const t = 1.0 / (1.0 - p * z);
    return c * Math.exp(-z * z / 2.0) * t * (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1);
  }
}

function factorial(n: number): number {
  if (n <= 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

export const statisticsProbabilitySpecs: CalculatorSpec[] = [
  {
    slug: 'z-score-calculator',
    title: 'Z-Score (Standard Score) Calculator',
    category: 'statistics-probability',
    formulaDisplay: 'Z = (X - μ) / σ',
    inputs: [
      { id: 'rawScore', label: 'Raw Score (X)', defaultValue: 85, type: 'number', step: 'any' },
      { id: 'mean', label: 'Population Mean (μ)', defaultValue: 70, type: 'number', step: 'any' },
      { id: 'sd', label: 'Standard Deviation (σ)', defaultValue: 10, type: 'number', min: 0.0001, step: 'any' },
    ],
    calculate: (v) => {
      const x = Number(v.rawScore) || 0;
      const mu = Number(v.mean) || 0;
      const sd = Number(v.sd) || 1;
      const z = (x - mu) / sd;
      const pLower = normalCdf(z);
      const pUpper = 1 - pLower;
      return {
        primaryValue: parseFloat(z.toFixed(4)),
        primaryLabel: 'Z-Score (Standard Deviations)',
        secondaryOutputs: [
          { label: 'Percentile Rank (P(Z ≤ z))', value: \`\${(pLower * 100).toFixed(2)}th percentile\` },
          { label: 'P(Z > z) Upper Tail', value: pUpper.toFixed(4) },
        ],
        steps: [\`Z = (\${x} - \${mu}) / \${sd} = \${x - mu} / \${sd} = \${z.toFixed(4)}\`],
        formulaUsed: 'Z = (X - μ) / σ',
      };
    },
  },
  {
    slug: 'p-value-calculator',
    title: 'P-Value from Z-Score Calculator',
    category: 'statistics-probability',
    formulaDisplay: 'Two-Tailed p = 2 × (1 - Φ(|Z|))',
    inputs: [
      { id: 'zScore', label: 'Z-Score', defaultValue: 1.96, type: 'number', step: 'any' },
      {
        id: 'tail',
        label: 'Hypothesis Test Tails',
        type: 'select',
        defaultValue: 'two',
        options: [{ label: 'Two-Tailed (H₁: μ ≠ μ₀)', value: 'two' }, { label: 'Right-Tailed (H₁: μ > μ₀)', value: 'right' }, { label: 'Left-Tailed (H₁: μ < μ₀)', value: 'left' }],
      },
    ],
    calculate: (v) => {
      const z = Number(v.zScore) || 0;
      const tail = v.tail || 'two';
      const cdf = normalCdf(z);
      let pVal = 0;
      if (tail === 'two') {
        pVal = 2 * (1 - normalCdf(Math.abs(z)));
      } else if (tail === 'right') {
        pVal = 1 - cdf;
      } else {
        pVal = cdf;
      }
      return {
        primaryValue: parseFloat(pVal.toFixed(5)),
        primaryLabel: \`P-Value (\${tail === 'two' ? 'Two-Tailed' : 'One-Tailed'})\`,
        secondaryOutputs: [
          { label: 'Significance at α = 0.05', value: pVal < 0.05 ? 'Statistically Significant (Reject H₀)' : 'Not Significant (Fail to reject H₀)' },
          { label: 'Significance at α = 0.01', value: pVal < 0.01 ? 'Highly Significant (p < 0.01)' : 'Not Significant at α = 0.01' },
        ],
        steps: [\`Evaluated standard normal integral for Z = \${z} on \${tail} tails.\`],
        formulaUsed: 'Gaussian Cumulative Distribution Function',
      };
    },
  },
  {
    slug: 'confidence-interval-calculator',
    title: 'Confidence Interval (CI) for Mean Calculator',
    category: 'statistics-probability',
    formulaDisplay: 'CI = x̄ ± Z* × (s / √n)',
    inputs: [
      { id: 'mean', label: 'Sample Mean (x̄)', defaultValue: 50, type: 'number', step: 'any' },
      { id: 'sd', label: 'Sample Standard Deviation (s)', defaultValue: 8, type: 'number', min: 0.0001, step: 'any' },
      { id: 'n', label: 'Sample Size (n)', defaultValue: 64, type: 'number', min: 2, step: 1 },
      {
        id: 'level',
        label: 'Confidence Level',
        type: 'select',
        defaultValue: '95',
        options: [{ label: '90% (Z = 1.645)', value: '1.645' }, { label: '95% (Z = 1.960)', value: '1.960' }, { label: '99% (Z = 2.576)', value: '2.576' }],
      },
    ],
    calculate: (v) => {
      const mean = Number(v.mean) || 0;
      const sd = Number(v.sd) || 1;
      const n = Number(v.n) || 10;
      const z = Number(v.level) || 1.96;
      const se = sd / Math.sqrt(n);
      const me = z * se;
      const lower = mean - me;
      const upper = mean + me;
      return {
        primaryValue: \`[\${lower.toFixed(3)}, \${upper.toFixed(3)}]\`,
        primaryLabel: 'Confidence Interval Bounds',
        secondaryOutputs: [
          { label: 'Margin of Error (ME)', value: \`±\${me.toFixed(3)}\` },
          { label: 'Standard Error (SE)', value: se.toFixed(3) },
        ],
        steps: [\`SE = \${sd} / √\${n} = \${se.toFixed(3)}\`, \`ME = \${z} × \${se.toFixed(3)} = \${me.toFixed(3)}\`],
        formulaUsed: 'CI = x̄ ± Z* · (s/√n)',
      };
    },
  },
  {
    slug: 'standard-error-calculator',
    title: 'Standard Error of the Mean (SEM) Calculator',
    category: 'statistics-probability',
    formulaDisplay: 'SEM = s / √n',
    inputs: [
      { id: 'sd', label: 'Standard Deviation (s)', defaultValue: 12, type: 'number', min: 0.0001, step: 'any' },
      { id: 'n', label: 'Sample Size (n)', defaultValue: 100, type: 'number', min: 1, step: 1 },
    ],
    calculate: (v) => {
      const s = Number(v.sd) || 0;
      const n = Number(v.n) || 1;
      const sem = s / Math.sqrt(n);
      return {
        primaryValue: parseFloat(sem.toFixed(4)),
        primaryLabel: 'Standard Error of Mean (SEM)',
        secondaryOutputs: [
          { label: 'Sample Variance', value: (s * s).toFixed(4) },
          { label: 'Sample Size (n)', value: n },
        ],
        steps: [\`SEM = \${s} / √\${n} = \${s} / \${Math.sqrt(n).toFixed(2)} = \${sem.toFixed(4)}\`],
        formulaUsed: 'SEM = s / √n',
      };
    },
  },
  {
    slug: 'permutations-calculator',
    title: 'Permutations P(n, r) Calculator',
    category: 'statistics-probability',
    formulaDisplay: 'P(n, r) = n! / (n - r)! (Order Matters)',
    inputs: [
      { id: 'n', label: 'Total Items (n)', defaultValue: 8, type: 'number', min: 1, max: 20, step: 1 },
      { id: 'r', label: 'Items Chosen (r)', defaultValue: 3, type: 'number', min: 0, max: 20, step: 1 },
    ],
    calculate: (v) => {
      const n = Math.round(Number(v.n) || 1);
      const r = Math.round(Number(v.r) || 1);
      if (r > n) return { primaryValue: 'Error', primaryLabel: 'Invalid', error: 'r cannot be greater than n.' };
      let res = 1;
      for (let i = 0; i < r; i++) res *= (n - i);
      return {
        primaryValue: res,
        primaryLabel: \`P(\${n}, \${r})\`,
        secondaryOutputs: [
          { label: 'Formula Notation', value: \`\${n}! / (\${n} - \${r})!\` },
        ],
        steps: [\`P(\${n}, \${r}) = \${Array.from({ length: r }, (_, i) => n - i).join(' × ')} = \${res}\`],
        formulaUsed: 'P(n, r) = n! / (n - r)!',
      };
    },
  },
  {
    slug: 'combinations-calculator',
    title: 'Combinations C(n, r) / (n Choose r) Calculator',
    category: 'statistics-probability',
    formulaDisplay: 'C(n, r) = n! / [r! × (n - r)!] (Order Does Not Matter)',
    inputs: [
      { id: 'n', label: 'Total Items (n)', defaultValue: 10, type: 'number', min: 1, max: 30, step: 1 },
      { id: 'r', label: 'Items Chosen (r)', defaultValue: 4, type: 'number', min: 0, max: 30, step: 1 },
    ],
    calculate: (v) => {
      const n = Math.round(Number(v.n) || 1);
      const r = Math.round(Number(v.r) || 1);
      if (r > n) return { primaryValue: 'Error', primaryLabel: 'Invalid', error: 'r cannot be greater than n.' };
      let c = 1;
      for (let i = 1; i <= r; i++) c = (c * (n - (r - i))) / i;
      return {
        primaryValue: Math.round(c),
        primaryLabel: \`C(\${n}, \${r}) - "\${n} Choose \${r}"\`,
        secondaryOutputs: [
          { label: 'Permutations Equivalent', value: Math.round(c * factorial(r)) },
        ],
        steps: [\`C(\${n}, \${r}) = \${n}! / (\${r}! × \${n - r}!) = \${Math.round(c)}\`],
        formulaUsed: 'C(n, r) = n! / [r!(n-r)!]',
      };
    },
  },
  {
    slug: 'binomial-distribution-calculator',
    title: 'Binomial Probability Distribution Calculator',
    category: 'statistics-probability',
    formulaDisplay: 'P(X = k) = C(n, k) × p^k × (1-p)^(n-k)',
    inputs: [
      { id: 'n', label: 'Number of Trials (n)', defaultValue: 10, type: 'number', min: 1, max: 50, step: 1 },
      { id: 'k', label: 'Number of Successes (k)', defaultValue: 6, type: 'number', min: 0, max: 50, step: 1 },
      { id: 'p', label: 'Probability of Success (p)', defaultValue: 0.5, type: 'number', min: 0, max: 1, step: 0.05 },
    ],
    calculate: (v) => {
      const n = Math.round(Number(v.n) || 1);
      const k = Math.round(Number(v.k) || 0);
      const p = Math.max(0, Math.min(1, Number(v.p) || 0.5));
      if (k > n) return { primaryValue: '0.0000', primaryLabel: 'P(X = k)', error: 'k must be ≤ n.' };
      let c = 1;
      for (let i = 1; i <= k; i++) c = (c * (n - (k - i))) / i;
      const prob = c * Math.pow(p, k) * Math.pow(1 - p, n - k);
      const mean = n * p;
      const variance = n * p * (1 - p);
      return {
        primaryValue: parseFloat(prob.toFixed(5)),
        primaryLabel: \`Exact Probability P(X = \${k})\`,
        secondaryOutputs: [
          { label: 'As Percentage', value: \`\${(prob * 100).toFixed(3)}%\` },
          { label: 'Distribution Mean (E[X])', value: mean.toFixed(2) },
          { label: 'Standard Deviation (σ)', value: Math.sqrt(variance).toFixed(3) },
        ],
        steps: [\`C(\${n}, \${k}) × (\${p})^\${k} × (\${1 - p})^\${n - k} = \${prob.toFixed(5)}\`],
        formulaUsed: 'Binomial PMF Formula',
      };
    },
  },
  {
    slug: 'normal-distribution-calculator',
    title: 'Normal (Gaussian) Distribution Calculator',
    category: 'statistics-probability',
    formulaDisplay: 'f(x) = (1 / (σ √(2π))) × e^(-0.5 ((x - μ) / σ)²)',
    inputs: [
      { id: 'x', label: 'Value (X)', defaultValue: 115, type: 'number', step: 'any' },
      { id: 'mu', label: 'Mean (μ)', defaultValue: 100, type: 'number', step: 'any' },
      { id: 'sigma', label: 'Standard Deviation (σ)', defaultValue: 15, type: 'number', min: 0.0001, step: 'any' },
    ],
    calculate: (v) => {
      const x = Number(v.x) || 0;
      const mu = Number(v.mu) || 0;
      const sigma = Number(v.sigma) || 1;
      const z = (x - mu) / sigma;
      const cdf = normalCdf(z);
      const pdf = (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
      return {
        primaryValue: parseFloat(cdf.toFixed(4)),
        primaryLabel: 'Cumulative Probability P(X ≤ x)',
        secondaryOutputs: [
          { label: 'Probability Density f(x)', value: parseFloat(pdf.toFixed(5)) },
          { label: 'Z-Score Equivalent', value: parseFloat(z.toFixed(2)) },
          { label: 'Percentile Rank', value: \`\${(cdf * 100).toFixed(2)}%\` },
        ],
        steps: [\`Z = (\${x} - \${mu}) / \${sigma} = \${z.toFixed(2)}\`, \`Φ(\${z.toFixed(2)}) = \${cdf.toFixed(4)}\`],
        formulaUsed: 'Normal Distribution Probability Integral',
      };
    },
  },
  {
    slug: 'poisson-distribution-calculator',
    title: 'Poisson Distribution Calculator',
    category: 'statistics-probability',
    formulaDisplay: 'P(X = k) = (λ^k × e^(-λ)) / k!',
    inputs: [
      { id: 'lambda', label: 'Average Arrival Rate (λ)', defaultValue: 4.5, type: 'number', min: 0.001, step: 0.5 },
      { id: 'k', label: 'Observed Events (k)', defaultValue: 4, type: 'number', min: 0, max: 50, step: 1 },
    ],
    calculate: (v) => {
      const lam = Number(v.lambda) || 1;
      const k = Math.round(Number(v.k) || 0);
      const p = (Math.pow(lam, k) * Math.exp(-lam)) / factorial(k);
      return {
        primaryValue: parseFloat(p.toFixed(5)),
        primaryLabel: \`Poisson Probability P(X = \${k})\`,
        secondaryOutputs: [
          { label: 'As Percentage', value: \`\${(p * 100).toFixed(2)}%\` },
          { label: 'Expected Value (E[X] = λ)', value: lam },
          { label: 'Variance (Var[X] = λ)', value: lam },
        ],
        steps: [\`P = (\${lam}^\${k} × e^(-\${lam})) / \${k}! = \${p.toFixed(5)}\`],
        formulaUsed: 'Poisson Discrete Probability Mass Function',
      };
    },
  },
  {
    slug: 'chi-square-calculator',
    title: 'Chi-Square (χ²) Goodness of Fit Calculator',
    category: 'statistics-probability',
    formulaDisplay: 'χ² = Σ [(O - E)² / E]',
    inputs: [
      { id: 'observed', label: 'Observed Counts (O, comma-separated)', defaultValue: '25, 30, 45', type: 'text' },
      { id: 'expected', label: 'Expected Counts (E, comma-separated)', defaultValue: '33.33, 33.33, 33.33', type: 'text' },
    ],
    calculate: (v) => {
      const obs = String(v.observed || '').split(/[\s,]+/).map(Number).filter((n) => !isNaN(n));
      const exp = String(v.expected || '').split(/[\s,]+/).map(Number).filter((n) => !isNaN(n));
      if (obs.length !== exp.length || obs.length === 0) return { primaryValue: 'Error', primaryLabel: 'Mismatched length', error: 'Observed and expected must match.' };
      let chi = 0;
      for (let i = 0; i < obs.length; i++) {
        if (exp[i] > 0) chi += Math.pow(obs[i] - exp[i], 2) / exp[i];
      }
      const df = obs.length - 1;
      return {
        primaryValue: parseFloat(chi.toFixed(3)),
        primaryLabel: 'Chi-Square Test Statistic (χ²)',
        secondaryOutputs: [
          { label: 'Degrees of Freedom (df = k - 1)', value: df },
          { label: 'Categories Tested', value: obs.length },
        ],
        steps: [\`χ² = Σ [(O - E)² / E] = \${chi.toFixed(3)} with df = \${df}\`],
        formulaUsed: "Pearson's Chi-Square Test",
      };
    },
  },
  {
    slug: 'correlation-calculator',
    title: 'Pearson Correlation Coefficient (r) Calculator',
    category: 'statistics-probability',
    formulaDisplay: 'r = Σ[(x - x̄)(y - ȳ)] / [√(Σ(x - x̄)²) √(Σ(y - ȳ)²)]',
    inputs: [
      { id: 'xVals', label: 'X Variable Array (comma-separated)', defaultValue: '1, 2, 3, 4, 5, 6', type: 'text' },
      { id: 'yVals', label: 'Y Variable Array (comma-separated)', defaultValue: '2, 3, 5, 7, 11, 13', type: 'text' },
    ],
    calculate: (v) => {
      const x = String(v.xVals || '').split(/[\s,]+/).map(Number).filter((n) => !isNaN(n));
      const y = String(v.yVals || '').split(/[\s,]+/).map(Number).filter((n) => !isNaN(n));
      const n = Math.min(x.length, y.length);
      if (n < 2) return { primaryValue: 'Error', primaryLabel: 'Sample too small', error: 'Need at least 2 coordinate pairs.' };
      const mx = x.slice(0, n).reduce((a, b) => a + b, 0) / n;
      const my = y.slice(0, n).reduce((a, b) => a + b, 0) / n;
      let num = 0, denX = 0, denY = 0;
      for (let i = 0; i < n; i++) {
        const dx = x[i] - mx;
        const dy = y[i] - my;
        num += dx * dy;
        denX += dx * dx;
        denY += dy * dy;
      }
      const r = denX > 0 && denY > 0 ? num / Math.sqrt(denX * denY) : 0;
      const r2 = r * r;
      return {
        primaryValue: parseFloat(r.toFixed(4)),
        primaryLabel: 'Pearson Correlation (r)',
        secondaryOutputs: [
          { label: 'Coefficient of Determination (R²)', value: \`\${(r2 * 100).toFixed(2)}%\` },
          { label: 'Correlation Strength', value: Math.abs(r) > 0.8 ? 'Strong' : (Math.abs(r) > 0.5 ? 'Moderate' : 'Weak') },
        ],
        steps: [\`r = \${num.toFixed(2)} / √(\${denX.toFixed(2)} × \${denY.toFixed(2)}) = \${r.toFixed(4)}\`],
        formulaUsed: 'Pearson Product-Moment Correlation',
      };
    },
  },
  {
    slug: 'linear-regression-calculator',
    title: 'Simple Linear Regression (y = mx + b) Calculator',
    category: 'statistics-probability',
    formulaDisplay: 'Slope m = r(s_y / s_x), Intercept b = ȳ - m·x̄',
    inputs: [
      { id: 'xVals', label: 'Independent X Values', defaultValue: '2, 4, 6, 8, 10', type: 'text' },
      { id: 'yVals', label: 'Dependent Y Values', defaultValue: '5, 9, 13, 17, 21', type: 'text' },
    ],
    calculate: (v) => {
      const x = String(v.xVals || '').split(/[\s,]+/).map(Number).filter((n) => !isNaN(n));
      const y = String(v.yVals || '').split(/[\s,]+/).map(Number).filter((n) => !isNaN(n));
      const n = Math.min(x.length, y.length);
      if (n < 2) return { primaryValue: 'Error', primaryLabel: 'Sample too small', error: 'Need at least 2 pairs.' };
      const mx = x.slice(0, n).reduce((a, b) => a + b, 0) / n;
      const my = y.slice(0, n).reduce((a, b) => a + b, 0) / n;
      let num = 0, den = 0;
      for (let i = 0; i < n; i++) {
        num += (x[i] - mx) * (y[i] - my);
        den += Math.pow(x[i] - mx, 2);
      }
      const m = den !== 0 ? num / den : 0;
      const b = my - m * mx;
      return {
        primaryValue: \`y = \${m.toFixed(3)}x \${b >= 0 ? \`+ \${b.toFixed(3)}\` : \`- \${Math.abs(b).toFixed(3)}\`}\`,
        primaryLabel: 'Least-Squares Regression Line',
        secondaryOutputs: [
          { label: 'Slope (m)', value: parseFloat(m.toFixed(4)) },
          { label: 'Intercept (b)', value: parseFloat(b.toFixed(4)) },
        ],
        steps: [\`m = \${num.toFixed(2)} / \${den.toFixed(2)} = \${m.toFixed(3)}\`, \`b = \${my.toFixed(2)} - (\${m.toFixed(3)})(\${mx.toFixed(2)}) = \${b.toFixed(3)}\`],
        formulaUsed: 'Ordinary Least Squares (OLS) Linear Regression',
      };
    },
  },
  {
    slug: 'margin-of-error-calculator',
    title: 'Polling Margin of Error Calculator',
    category: 'statistics-probability',
    formulaDisplay: 'ME = Z × √[(p × (1 - p)) / n]',
    inputs: [
      { id: 'sampleSize', label: 'Sample Size (n)', defaultValue: 1000, type: 'number', min: 10, step: 50 },
      { id: 'proportion', label: 'Observed Proportion (p)', defaultValue: 0.5, type: 'number', min: 0.01, max: 0.99, step: 0.05 },
      { id: 'zLevel', label: 'Confidence Level (Z)', defaultValue: 1.96, type: 'number', step: 0.01 },
    ],
    calculate: (v) => {
      const n = Number(v.sampleSize) || 1000;
      const p = Number(v.proportion) || 0.5;
      const z = Number(v.zLevel) || 1.96;
      const me = z * Math.sqrt((p * (1 - p)) / n) * 100;
      return {
        primaryValue: parseFloat(me.toFixed(2)),
        primaryUnit: '%',
        primaryLabel: 'Margin of Error (ME)',
        secondaryOutputs: [
          { label: 'Confidence Interval for 50%', value: \`\${(50 - me).toFixed(1)}% to \${(50 + me).toFixed(1)}%\` },
        ],
        steps: [\`ME = \${z} × √[(\${p} × \${1 - p}) / \${n}] × 100 = ±\${me.toFixed(2)}%\`],
        formulaUsed: 'ME = Z · √(p(1-p)/n)',
      };
    },
  },
  {
    slug: 'sample-size-calculator',
    title: 'Sample Size (Cochran Formula) Calculator',
    category: 'statistics-probability',
    formulaDisplay: 'n = (Z² × p × (1 - p)) / e²',
    inputs: [
      { id: 'moe', label: 'Desired Margin of Error (e in %)', defaultValue: 3.0, type: 'number', min: 0.1, step: 0.5, unit: '%' },
      { id: 'z', label: 'Z-Score (1.96 for 95% Confidence)', defaultValue: 1.96, type: 'number', step: 0.01 },
      { id: 'popSize', label: 'Total Population (optional finite correction)', defaultValue: 1000000, type: 'number', step: 10000 },
    ],
    calculate: (v) => {
      const e = (Number(v.moe) || 3) / 100;
      const z = Number(v.z) || 1.96;
      const p = 0.5; // maximum variance
      const n0 = (z * z * p * (1 - p)) / (e * e);
      const N = Number(v.popSize) || 1000000;
      const nFinite = n0 / (1 + (n0 - 1) / N);
      return {
        primaryValue: Math.ceil(nFinite),
        primaryUnit: 'respondents',
        primaryLabel: 'Required Minimum Sample Size',
        secondaryOutputs: [
          { label: 'Unadjusted Infinite Sample Size', value: Math.ceil(n0) },
          { label: 'Assumed Conservative Variance (p)', value: '0.50 (50/50 split)' },
        ],
        steps: [\`n₀ = (\${z}² × 0.25) / \${e}² = \${Math.ceil(n0)}\`, \`Finite correction for population \${N}: \${Math.ceil(nFinite)}\`],
        formulaUsed: "Cochran's Sample Size Formulation",
      };
    },
  },
  {
    slug: 'outlier-calculator',
    title: 'Tukey IQR Statistical Outlier Calculator',
    category: 'statistics-probability',
    formulaDisplay: 'Outlier if x < Q₁ - 1.5×IQR or x > Q₃ + 1.5×IQR',
    inputs: [
      { id: 'data', label: 'Dataset (comma-separated)', defaultValue: '12, 14, 15, 18, 19, 21, 22, 23, 25, 68', type: 'text' },
    ],
    calculate: (v) => {
      const list = String(v.data || '').split(/[\s,]+/).map(Number).filter((n) => !isNaN(n)).sort((a, b) => a - b);
      if (list.length < 4) return { primaryValue: 'None', primaryLabel: 'Sample too small', error: 'Need at least 4 numbers.' };
      const q1 = list[Math.floor(list.length * 0.25)];
      const q3 = list[Math.floor(list.length * 0.75)];
      const iqr = q3 - q1;
      const lowerFence = q1 - 1.5 * iqr;
      const upperFence = q3 + 1.5 * iqr;
      const outliers = list.filter((x) => x < lowerFence || x > upperFence);
      return {
        primaryValue: outliers.length > 0 ? outliers.join(', ') : 'No Outliers Detected',
        primaryLabel: 'Detected Outliers',
        secondaryOutputs: [
          { label: 'Lower Fence (Q₁ - 1.5·IQR)', value: lowerFence },
          { label: 'Upper Fence (Q₃ + 1.5·IQR)', value: upperFence },
          { label: 'Interquartile Range (IQR)', value: iqr },
        ],
        steps: [\`Q₁ = \${q1}, Q₃ = \${q3}, IQR = \${iqr}\`, \`Acceptable range: [\${lowerFence}, \${upperFence}]\`],
        formulaUsed: "Tukey's Fences 1.5·IQR Rule",
      };
    },
  },
  {
    slug: 'geometric-mean-calculator',
    title: 'Geometric Mean Calculator',
    category: 'statistics-probability',
    formulaDisplay: 'GM = (Π x_i)^(1/n)',
    inputs: [
      { id: 'values', label: 'Positive Numbers (comma-separated)', defaultValue: '2, 8, 32', type: 'text' },
    ],
    calculate: (v) => {
      const list = String(v.values || '').split(/[\s,]+/).map(Number).filter((n) => !isNaN(n) && n > 0);
      if (list.length === 0) return { primaryValue: '0', primaryLabel: 'GM', error: 'Positive numbers required.' };
      const n = list.length;
      const logSum = list.reduce((acc, x) => acc + Math.log(x), 0);
      const gm = Math.exp(logSum / n);
      return {
        primaryValue: parseFloat(gm.toFixed(4)),
        primaryLabel: 'Geometric Mean',
        secondaryOutputs: [
          { label: 'Arithmetic Mean Benchmark', value: (list.reduce((a, b) => a + b, 0) / n).toFixed(4) },
          { label: 'Item Count (n)', value: n },
        ],
        steps: [\`GM = (\${list.join(' × ')})^(1/\${n}) = \${gm.toFixed(4)}\`],
        formulaUsed: 'GM = (Π x_i)^(1/n)',
      };
    },
  },
  {
    slug: 'harmonic-mean-calculator',
    title: 'Harmonic Mean Calculator',
    category: 'statistics-probability',
    formulaDisplay: 'HM = n / Σ(1 / x_i)',
    inputs: [
      { id: 'values', label: 'Positive Rates / Speeds (comma-separated)', defaultValue: '40, 60', type: 'text' },
    ],
    calculate: (v) => {
      const list = String(v.values || '').split(/[\s,]+/).map(Number).filter((n) => !isNaN(n) && n > 0);
      if (list.length === 0) return { primaryValue: '0', primaryLabel: 'HM', error: 'Positive numbers required.' };
      const n = list.length;
      const sumInv = list.reduce((acc, x) => acc + 1 / x, 0);
      const hm = n / sumInv;
      return {
        primaryValue: parseFloat(hm.toFixed(4)),
        primaryLabel: 'Harmonic Mean',
        secondaryOutputs: [
          { label: 'Arithmetic Mean (AM)', value: (list.reduce((a, b) => a + b, 0) / n).toFixed(4) },
        ],
        steps: [\`HM = \${n} / (\${list.map((x) => \`1/\${x}\`).join(' + ')}) = \${hm.toFixed(4)}\`],
        formulaUsed: 'HM = n / Σ(1/x)',
      };
    },
  },
  {
    slug: 'weighted-average-calculator',
    title: 'Weighted Average Calculator',
    category: 'statistics-probability',
    formulaDisplay: 'Weighted Mean = Σ(w_i × x_i) / Σw_i',
    inputs: [
      { id: 'values', label: 'Values (x, comma-separated)', defaultValue: '80, 90, 75', type: 'text' },
      { id: 'weights', label: 'Corresponding Weights (w, comma-separated)', defaultValue: '20, 30, 50', type: 'text' },
    ],
    calculate: (v) => {
      const vals = String(v.values || '').split(/[\s,]+/).map(Number).filter((n) => !isNaN(n));
      const weights = String(v.weights || '').split(/[\s,]+/).map(Number).filter((n) => !isNaN(n));
      const n = Math.min(vals.length, weights.length);
      if (n === 0) return { primaryValue: 'Error', primaryLabel: 'Invalid', error: 'Arrays cannot be empty.' };
      let sumProd = 0, sumW = 0;
      for (let i = 0; i < n; i++) {
        sumProd += vals[i] * weights[i];
        sumW += weights[i];
      }
      const wa = sumW > 0 ? sumProd / sumW : 0;
      return {
        primaryValue: parseFloat(wa.toFixed(3)),
        primaryLabel: 'Weighted Average',
        secondaryOutputs: [
          { label: 'Sum of Weights', value: sumW },
          { label: 'Unweighted Arithmetic Mean', value: (vals.slice(0, n).reduce((a, b) => a + b, 0) / n).toFixed(2) },
        ],
        steps: [\`Σ(w·x) = \${sumProd}, Σw = \${sumW} → Weighted Average = \${wa.toFixed(3)}\`],
        formulaUsed: 'x̄_w = Σ(w·x) / Σw',
      };
    },
  },
  {
    slug: 'bayes-theorem-calculator',
    title: "Bayes' Theorem Conditional Probability Calculator",
    category: 'statistics-probability',
    formulaDisplay: 'P(A|B) = [P(B|A) × P(A)] / P(B)',
    inputs: [
      { id: 'pA', label: 'Prior Probability P(A) (e.g. disease prevalence)', defaultValue: 0.01, type: 'number', min: 0, max: 1, step: 0.01 },
      { id: 'pBgivenA', label: 'Sensitivity P(B|A) (true positive rate)', defaultValue: 0.95, type: 'number', min: 0, max: 1, step: 0.01 },
      { id: 'pBgivenNotA', label: 'False Positive Rate P(B|¬A)', defaultValue: 0.05, type: 'number', min: 0, max: 1, step: 0.01 },
    ],
    calculate: (v) => {
      const pA = Number(v.pA) || 0.01;
      const pB_A = Number(v.pBgivenA) || 0.95;
      const pB_notA = Number(v.pBgivenNotA) || 0.05;
      const pNotA = 1 - pA;
      const pB = pB_A * pA + pB_notA * pNotA;
      const pA_B = pB > 0 ? (pB_A * pA) / pB : 0;
      return {
        primaryValue: parseFloat((pA_B * 100).toFixed(2)),
        primaryUnit: '%',
        primaryLabel: 'Posterior Probability P(A|B)',
        secondaryOutputs: [
          { label: 'Total Evidence P(B)', value: (pB * 100).toFixed(2) + '%' },
          { label: 'Prior P(A)', value: (pA * 100).toFixed(2) + '%' },
        ],
        steps: [\`Total P(B) = (\${pB_A} × \${pA}) + (\${pB_notA} × \${pNotA.toFixed(2)}) = \${pB.toFixed(4)}\`, \`P(A|B) = (\${pB_A} × \${pA}) / \${pB.toFixed(4)} = \${(pA_B * 100).toFixed(2)}%\`],
        formulaUsed: "Bayes' Law of Inverse Probability",
      };
    },
  },
  {
    slug: 'odds-ratio-calculator',
    title: 'Odds Ratio (OR) 2x2 Contingency Table Calculator',
    category: 'statistics-probability',
    formulaDisplay: 'OR = (a × d) / (b × c)',
    inputs: [
      { id: 'a', label: 'Exposed with Disease (a)', defaultValue: 40, type: 'number', min: 0, step: 1 },
      { id: 'b', label: 'Exposed without Disease (b)', defaultValue: 60, type: 'number', min: 1, step: 1 },
      { id: 'c', label: 'Unexposed with Disease (c)', defaultValue: 15, type: 'number', min: 1, step: 1 },
      { id: 'd', label: 'Unexposed without Disease (d)', defaultValue: 85, type: 'number', min: 0, step: 1 },
    ],
    calculate: (v) => {
      const a = Number(v.a) || 0;
      const b = Number(v.b) || 1;
      const c = Number(v.c) || 1;
      const d = Number(v.d) || 0;
      const or = (a * d) / (b * c);
      const logOr = Math.log(or);
      const seLogOr = Math.sqrt(1 / a + 1 / b + 1 / c + 1 / d);
      const ciLower = Math.exp(logOr - 1.96 * seLogOr);
      const ciUpper = Math.exp(logOr + 1.96 * seLogOr);
      return {
        primaryValue: parseFloat(or.toFixed(3)),
        primaryLabel: 'Odds Ratio (OR)',
        secondaryOutputs: [
          { label: '95% Confidence Interval', value: \`[\${ciLower.toFixed(2)}, \${ciUpper.toFixed(2)}]\` },
          { label: 'Relative Association', value: or > 1 ? 'Increased Odds' : (or < 1 ? 'Decreased Odds' : 'No Association') },
        ],
        steps: [\`OR = (\${a} × \${d}) / (\${b} × \${c}) = \${a * d} / \${b * c} = \${or.toFixed(3)}\`],
        formulaUsed: 'Epidemiological 2x2 Odds Ratio',
      };
    },
  },
];
`;

fs.writeFileSync('./src/data/calculatorRegistry/domainStatisticsProbability.ts', code);
console.log('Saved domainStatisticsProbability.ts');
