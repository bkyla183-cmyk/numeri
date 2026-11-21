import { CalculatorSpec } from './types';
import { parseNum, calcError } from './validation';

const fmt = (n: number, d = 4): number => {
  if (!Number.isFinite(n)) return 0;
  const r = Number(n.toFixed(d));
  return Object.is(r, -0) ? 0 : r;
};

const parseNumList = (raw: unknown): number[] => {
  if (typeof raw !== 'string') return [];
  return raw
    .split(/[\s,;]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map(Number)
    .filter(Number.isFinite);
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

const logGamma = (z: number): number => {
  const c = [
    76.18009172947146, -86.50532032941677, 24.01409824083091,
    -1.231739572450155, 0.001208650973866179, -0.000005395239384953,
  ];
  let x = z;
  let y = z;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j <= 5; j++) ser += c[j] / ++y;
  return -tmp + Math.log((2.5066282746310005 * ser) / x);
};

// Regularized incomplete beta I_x(a, b) using continued fraction
const betacf = (a: number, b: number, x: number): number => {
  const fpmin = 1e-30;
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < fpmin) d = fpmin;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= 120; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < fpmin) d = fpmin;
    c = 1 + aa / c;
    if (Math.abs(c) < fpmin) c = fpmin;
    d = 1 / d;
    h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < fpmin) d = fpmin;
    c = 1 + aa / c;
    if (Math.abs(c) < fpmin) c = fpmin;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 1e-10) break;
  }
  return h;
};

const betaInc = (a: number, b: number, x: number): number => {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  if (x < (a + 1) / (a + b + 2)) return (bt * betacf(a, b, x)) / a;
  return 1 - (bt * betacf(b, a, 1 - x)) / b;
};

const tTwoSidedP = (t: number, df: number): number => {
  if (df <= 0 || !Number.isFinite(t)) return 1;
  const x = df / (df + t * t);
  return Math.min(1, Math.max(0, betaInc(df / 2, 0.5, x)));
};

const gammaUpperReg = (a: number, x: number): number => {
  if (x <= 0) return 1;
  if (x < a + 1) {
    let ap = a;
    let sum = 1 / a;
    let del = sum;
    for (let n = 1; n <= 120; n++) {
      ap += 1;
      del *= x / ap;
      sum += del;
      if (Math.abs(del) < Math.abs(sum) * 1e-10) break;
    }
    return 1 - sum * Math.exp(-x + a * Math.log(x) - logGamma(a));
  }
  let b = x + 1 - a;
  let c = 1 / 1e-30;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i <= 120; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = b + an / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 1e-10) break;
  }
  return Math.exp(-x + a * Math.log(x) - logGamma(a)) * h;
};

const logComb = (n: number, k: number): number => {
  if (k < 0 || k > n) return -Infinity;
  return logGamma(n + 1) - logGamma(k + 1) - logGamma(n - k + 1);
};

export const batch4StatsSpecs: CalculatorSpec[] = [
  // 700. Mean, Median, Mode, Range & MAD
  {
    slug: 'mean-median-mode-range-calculator',
    title: 'Mean, Median, Mode, Range & MAD Calculator',
    category: 'statistics-probability',
    formulaDisplay: 'x̄ = (Σx_i)/n   |   MAD = (1/n)Σ|x_i − x̄|',
    inputs: [
      { id: 'dataset', label: 'Comma / Space-Separated Data Values', type: 'textarea', rows: 2, defaultValue: '12, 15, 18, 18, 22, 27, 30' },
    ],
    calculate: (v) => {
      const nums = parseNumList(v.dataset);
      if (nums.length === 0) return calcError('Enter at least one finite numeric value.');
      const sorted = [...nums].sort((a, b) => a - b);
      const n = sorted.length;
      const sum = sorted.reduce((a, b) => a + b, 0);
      const mean = sum / n;
      const median = n % 2 === 1 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
      const freq = new Map<number, number>();
      let maxF = 0;
      for (const x of sorted) {
        const f = (freq.get(x) || 0) + 1;
        freq.set(x, f);
        if (f > maxF) maxF = f;
      }
      const modes = [...freq.entries()].filter(([, f]) => f === maxF && maxF > 1).map(([k]) => k);
      const mad = sorted.reduce((acc, x) => acc + Math.abs(x - mean), 0) / n;
      return {
        primaryValue: fmt(mean, 4),
        primaryUnit: 'mean (x̄)',
        primaryLabel: `Arithmetic Mean (n = ${n})`,
        secondaryOutputs: [
          { label: 'Median', value: fmt(median, 4) },
          { label: 'Mode(s)', value: modes.length ? modes.join(', ') : 'No unique mode' },
          { label: 'Range (Max − Min)', value: `${fmt(sorted[n - 1] - sorted[0], 4)} [${sorted[0]} .. ${sorted[n - 1]}]` },
          { label: 'Mean Absolute Deviation (MAD)', value: fmt(mad, 4) },
        ],
        steps: [`Sorted n=${n}: sum=${fmt(sum, 4)}, mean=${fmt(mean, 4)}, median=${fmt(median, 4)}.`],
      };
    },
  },

  // 701. Weighted Mean & Pooled Two-Group SD
  {
    slug: 'weighted-mean-pooled-sd-calculator',
    title: 'Weighted Mean & Pooled Standard Deviation Calculator',
    category: 'statistics-probability',
    formulaDisplay: 'x̄_w = Σ(w_i x_i) / Σw_i   |   s_p = √(((n₁−1)s₁² + (n₂−1)s₂²) / (n₁ + n₂ − 2))',
    inputs: [
      { id: 'n1', label: 'Group 1 Count / Weight (n₁)', type: 'number', defaultValue: 30, min: 2, max: 1e8, step: 1 },
      { id: 'm1', label: 'Group 1 Mean (x̄₁)', type: 'number', defaultValue: 82.5, min: -1e9, max: 1e9, step: 0.5 },
      { id: 's1', label: 'Group 1 Sample SD (s₁)', type: 'number', defaultValue: 6.4, min: 0, max: 1e8, step: 0.1 },
      { id: 'n2', label: 'Group 2 Count / Weight (n₂)', type: 'number', defaultValue: 45, min: 2, max: 1e8, step: 1 },
      { id: 'm2', label: 'Group 2 Mean (x̄₂)', type: 'number', defaultValue: 76.0, min: -1e9, max: 1e9, step: 0.5 },
      { id: 's2', label: 'Group 2 Sample SD (s₂)', type: 'number', defaultValue: 7.2, min: 0, max: 1e8, step: 0.1 },
    ],
    calculate: (v) => {
      const [n1, m1, s1, n2, m2, s2] = [v.n1, v.m1, v.s1, v.n2, v.m2, v.s2].map(parseNum);
      if ([n1, m1, s1, n2, m2, s2].some(Number.isNaN) || n1 < 2 || n2 < 2 || s1 < 0 || s2 < 0) return calcError('Sample sizes must be >= 2 and SDs non-negative.');
      const wMean = (n1 * m1 + n2 * m2) / (n1 + n2);
      const sp = Math.sqrt(((n1 - 1) * s1 * s1 + (n2 - 1) * s2 * s2) / (n1 + n2 - 2));
      const hedgesG = sp > 0 ? Math.abs(m1 - m2) / sp : 0;
      return {
        primaryValue: fmt(wMean, 4),
        primaryUnit: 'weighted mean',
        primaryLabel: 'Combined Weighted Mean',
        secondaryOutputs: [
          { label: 'Pooled Within-Group SD (s_p)', value: fmt(sp, 4) },
          { label: 'Standardized Effect (Cohen d)', value: fmt(hedgesG, 3) },
        ],
        steps: [`Weighted mean = (${n1}×${m1} + ${n2}×${m2}) ÷ ${n1 + n2} = ${fmt(wMean, 4)}; Pooled SD = ${fmt(sp, 4)}.`],
      };
    },
  },

  // 702. Geometric, Harmonic & RMS Mean Calculator
  {
    slug: 'geometric-harmonic-mean-calculator',
    title: 'Arithmetic, Geometric, Harmonic & RMS Mean Calculator',
    category: 'statistics-probability',
    formulaDisplay: 'HM ≤ GM ≤ AM ≤ RMS (for positive real numbers)',
    inputs: [
      { id: 'dataset', label: 'Positive Comma-Separated Numbers', type: 'textarea', rows: 2, defaultValue: '2, 8, 18, 32' },
    ],
    calculate: (v) => {
      const nums = parseNumList(v.dataset);
      if (nums.length === 0 || nums.some((x) => x <= 0)) return calcError('Enter at least one strictly positive number.');
      const n = nums.length;
      const am = nums.reduce((a, b) => a + b, 0) / n;
      const gm = Math.exp(nums.reduce((a, b) => a + Math.log(b), 0) / n);
      const hm = n / nums.reduce((a, b) => a + 1 / b, 0);
      const rms = Math.sqrt(nums.reduce((a, b) => a + b * b, 0) / n);
      return {
        primaryValue: fmt(gm, 4),
        primaryUnit: 'geometric mean',
        primaryLabel: `Geometric Mean (n = ${n})`,
        secondaryOutputs: [
          { label: 'Harmonic Mean (HM)', value: fmt(hm, 4) },
          { label: 'Arithmetic Mean (AM)', value: fmt(am, 4) },
          { label: 'Quadratic / RMS Mean', value: fmt(rms, 4) },
        ],
        steps: [`HM (${fmt(hm, 3)}) ≤ GM (${fmt(gm, 3)}) ≤ AM (${fmt(am, 3)}) ≤ RMS (${fmt(rms, 3)}).`],
      };
    },
  },

  // 703. Five-Number Summary, IQR & Outlier Fences
  {
    slug: 'quartiles-iqr-outlier-fence-calculator',
    title: 'Quartiles (Q1, Q2, Q3), IQR & Tukey Outlier Calculator',
    category: 'statistics-probability',
    formulaDisplay: 'IQR = Q3 − Q1   |   Fences = [Q1 − 1.5·IQR, Q3 + 1.5·IQR]',
    inputs: [
      { id: 'dataset', label: 'Comma-Separated Sample Values', type: 'textarea', rows: 2, defaultValue: '4, 7, 9, 11, 12, 14, 15, 18, 21, 42' },
    ],
    calculate: (v) => {
      const nums = parseNumList(v.dataset).sort((a, b) => a - b);
      if (nums.length < 4) return calcError('Enter at least 4 numeric observations.');
      const quant = (arr: number[], p: number) => {
        const pos = (arr.length - 1) * p;
        const lo = Math.floor(pos);
        const hi = Math.ceil(pos);
        return arr[lo] + (arr[hi] - arr[lo]) * (pos - lo);
      };
      const q1 = quant(nums, 0.25);
      const q2 = quant(nums, 0.5);
      const q3 = quant(nums, 0.75);
      const iqr = q3 - q1;
      const lowerFence = q1 - 1.5 * iqr;
      const upperFence = q3 + 1.5 * iqr;
      const outliers = nums.filter((x) => x < lowerFence || x > upperFence);
      return {
        primaryValue: fmt(iqr, 4),
        primaryUnit: 'IQR',
        primaryLabel: 'Interquartile Range (Q3 − Q1)',
        secondaryOutputs: [
          { label: 'Five-Number Summary', value: `${nums[0]} | ${fmt(q1, 2)} | ${fmt(q2, 2)} | ${fmt(q3, 2)} | ${nums[nums.length - 1]}` },
          { label: 'Tukey 1.5×IQR Fences', value: `[${fmt(lowerFence, 2)}, ${fmt(upperFence, 2)}]` },
          { label: 'Detected Outliers', value: outliers.length ? outliers.join(', ') : 'None' },
        ],
        steps: [`Q1=${fmt(q1, 2)}, Median=${fmt(q2, 2)}, Q3=${fmt(q3, 2)} → IQR=${fmt(iqr, 2)}.`],
      };
    },
  },

  // 704. Percentile Rank & Quantile Calculator
  {
    slug: 'percentile-rank-interpolated-calculator',
    title: 'Percentile Rank & Interpolated P_k Quantile Calculator',
    category: 'statistics-probability',
    formulaDisplay: 'NIST / R-7 Linear Interpolation Quantile at k%',
    inputs: [
      { id: 'dataset', label: 'Comma-Separated Values', type: 'textarea', rows: 2, defaultValue: '55, 62, 68, 74, 79, 83, 88, 91, 95, 99' },
      { id: 'percentileK', label: 'Target Percentile (0–100)', type: 'number', unit: '%', defaultValue: 90, min: 0, max: 100, step: 5 },
    ],
    calculate: (v) => {
      const nums = parseNumList(v.dataset).sort((a, b) => a - b);
      const k = parseNum(v.percentileK);
      if (nums.length < 2 || Number.isNaN(k) || k < 0 || k > 100) return calcError('Enter >= 2 numbers and percentile 0–100.');
      const pos = (nums.length - 1) * (k / 100);
      const lo = Math.floor(pos);
      const hi = Math.ceil(pos);
      const val = nums[lo] + (nums[hi] - nums[lo]) * (pos - lo);
      return {
        primaryValue: fmt(val, 4),
        primaryUnit: `P_${k}`,
        primaryLabel: `${k}th Percentile Value`,
        secondaryOutputs: [
          { label: 'Sample Count (n)', value: nums.length },
          { label: 'Interpolated Index (0-based)', value: fmt(pos, 2) },
        ],
        steps: [`Sorted n=${nums.length}; index = ${fmt(pos, 2)} → P_${k} = ${fmt(val, 4)}.`],
      };
    },
  },

  // 705. Independent Two-Sample Welch t-Test Calculator
  {
    slug: 't-test-two-sample-pvalue-calculator',
    title: 'Independent Two-Sample Welch t-Test & p-Value Calculator',
    category: 'statistics-probability',
    formulaDisplay: 't = (x̄₁ − x̄₂) / √(s₁²/n₁ + s₂²/n₂)',
    inputs: [
      { id: 'm1', label: 'Sample 1 Mean (x̄₁)', type: 'number', defaultValue: 108.5, min: -1e9, max: 1e9, step: 0.5 },
      { id: 's1', label: 'Sample 1 SD (s₁)', type: 'number', defaultValue: 12.0, min: 0.001, max: 1e8, step: 0.5 },
      { id: 'n1', label: 'Sample 1 Size (n₁ ≥ 2)', type: 'number', defaultValue: 25, min: 2, max: 1e8, step: 1 },
      { id: 'm2', label: 'Sample 2 Mean (x̄₂)', type: 'number', defaultValue: 100.0, min: -1e9, max: 1e9, step: 0.5 },
      { id: 's2', label: 'Sample 2 SD (s₂)', type: 'number', defaultValue: 11.0, min: 0.001, max: 1e8, step: 0.5 },
      { id: 'n2', label: 'Sample 2 Size (n₂ ≥ 2)', type: 'number', defaultValue: 25, min: 2, max: 1e8, step: 1 },
    ],
    calculate: (v) => {
      const [m1, s1, n1, m2, s2, n2] = [v.m1, v.s1, v.n1, v.m2, v.s2, v.n2].map(parseNum);
      if ([m1, s1, n1, m2, s2, n2].some(Number.isNaN) || n1 < 2 || n2 < 2 || s1 <= 0 || s2 <= 0) return calcError('Sample sizes must be >= 2 and SDs positive.');
      const v1 = (s1 * s1) / n1;
      const v2 = (s2 * s2) / n2;
      const se = Math.sqrt(v1 + v2);
      const t = (m1 - m2) / se;
      const df = (v1 + v2) ** 2 / ((v1 * v1) / (n1 - 1) + (v2 * v2) / (n2 - 1));
      const pVal = tTwoSidedP(t, df);
      return {
        primaryValue: fmt(t, 4),
        primaryUnit: `t (df = ${fmt(df, 1)})`,
        primaryLabel: pVal < 0.05 ? 'Statistically Significant (p < 0.05)' : 'Not Significant at α = 0.05',
        secondaryOutputs: [
          { label: 'Two-Tailed p-Value', value: pVal < 0.0001 ? pVal.toExponential(3) : fmt(pVal, 5) },
          { label: 'Mean Difference (x̄₁ − x̄₂)', value: fmt(m1 - m2, 4) },
          { label: 'Standard Error of Difference', value: fmt(se, 4) },
        ],
        steps: [`Welch SE = ${fmt(se, 4)} → t = ${fmt(t, 4)} with df = ${fmt(df, 1)} → p = ${pVal < 0.0001 ? pVal.toExponential(3) : fmt(pVal, 5)}.`],
      };
    },
  },

  // 706. Paired t-Test & Cohen's d Calculator
  {
    slug: 'paired-t-test-effect-size-calculator',
    title: 'Paired Samples t-Test & Cohen’s d Effect Size Calculator',
    category: 'statistics-probability',
    formulaDisplay: 't = d̄ / (s_d / √n)   |   Cohen d_z = d̄ / s_d',
    inputs: [
      { id: 'meanDiff', label: 'Mean of Paired Differences (d̄)', type: 'number', defaultValue: 4.8, min: -1e9, max: 1e9, step: 0.2 },
      { id: 'sdDiff', label: 'SD of Paired Differences (s_d)', type: 'number', defaultValue: 7.5, min: 0.001, max: 1e8, step: 0.2 },
      { id: 'pairsN', label: 'Number of Matched Pairs (n ≥ 2)', type: 'number', defaultValue: 20, min: 2, max: 1e7, step: 1 },
    ],
    calculate: (v) => {
      const dBar = parseNum(v.meanDiff);
      const sd = parseNum(v.sdDiff);
      const n = Math.round(parseNum(v.pairsN));
      if ([dBar, sd, n].some(Number.isNaN) || sd <= 0 || n < 2) return calcError('Pairs must be >= 2 and SD positive.');
      const se = sd / Math.sqrt(n);
      const t = dBar / se;
      const pVal = tTwoSidedP(t, n - 1);
      const cohenDz = Math.abs(dBar / sd);
      return {
        primaryValue: fmt(t, 4),
        primaryUnit: `t (df = ${n - 1})`,
        primaryLabel: pVal < 0.05 ? 'Paired Difference Significant (p < 0.05)' : 'Paired Difference Not Significant (α=0.05)',
        secondaryOutputs: [
          { label: 'Two-Tailed p-Value', value: pVal < 0.0001 ? pVal.toExponential(3) : fmt(pVal, 5) },
          { label: 'Cohen’s d_z Effect Size', value: `${fmt(cohenDz, 3)} (${cohenDz >= 0.8 ? 'Large' : cohenDz >= 0.5 ? 'Medium' : 'Small'})` },
        ],
        steps: [`SE = ${sd}/√${n} = ${fmt(se, 4)}; t = ${fmt(t, 4)}; p = ${pVal < 0.0001 ? pVal.toExponential(3) : fmt(pVal, 5)}.`],
      };
    },
  },

  // 707. 2x2 Chi-Square Independence Test
  {
    slug: 'chi-square-goodness-independence-calculator',
    title: '2×2 Chi-Square (χ²) Independence & p-Value Calculator',
    category: 'statistics-probability',
    formulaDisplay: 'χ² = Σ (Observed − Expected)² / Expected  (df = 1)',
    inputs: [
      { id: 'a', label: 'Row 1 / Col 1 Count (a)', type: 'number', defaultValue: 45, min: 0, max: 1e9, step: 1 },
      { id: 'b', label: 'Row 1 / Col 2 Count (b)', type: 'number', defaultValue: 15, min: 0, max: 1e9, step: 1 },
      { id: 'c', label: 'Row 2 / Col 1 Count (c)', type: 'number', defaultValue: 25, min: 0, max: 1e9, step: 1 },
      { id: 'd', label: 'Row 2 / Col 2 Count (d)', type: 'number', defaultValue: 35, min: 0, max: 1e9, step: 1 },
    ],
    calculate: (v) => {
      const [a, b, c, d] = [v.a, v.b, v.c, v.d].map(parseNum);
      if ([a, b, c, d].some(Number.isNaN) || a < 0 || b < 0 || c < 0 || d < 0) return calcError('Cell counts must be non-negative.');
      const N = a + b + c + d;
      const r1 = a + b, r2 = c + d, c1 = a + c, c2 = b + d;
      if (N <= 0 || r1 === 0 || r2 === 0 || c1 === 0 || c2 === 0) return calcError('Row and column totals must be positive.');
      const chi2 = (N * (a * d - b * c) ** 2) / (r1 * r2 * c1 * c2);
      const pVal = gammaUpperReg(0.5, chi2 / 2);
      const phi = Math.sqrt(chi2 / N);
      return {
        primaryValue: fmt(chi2, 4),
        primaryUnit: 'χ² (df = 1)',
        primaryLabel: pVal < 0.05 ? 'Significant Association (p < 0.05)' : 'Independent (p ≥ 0.05)',
        secondaryOutputs: [
          { label: 'Pearson p-Value', value: pVal < 0.0001 ? pVal.toExponential(3) : fmt(pVal, 5) },
          { label: 'Phi Effect Coefficient (φ)', value: fmt(phi, 4) },
        ],
        steps: [`N=${N}; χ² = ${fmt(chi2, 4)}, p = ${pVal < 0.0001 ? pVal.toExponential(3) : fmt(pVal, 5)}.`],
      };
    },
  },

  // 708. One-Way ANOVA (3 Groups Summary) F-Test
  {
    slug: 'one-way-anova-f-test-calculator',
    title: 'One-Way ANOVA F-Statistic & p-Value Calculator',
    category: 'statistics-probability',
    formulaDisplay: 'F = MS_between / MS_within',
    inputs: [
      { id: 'n1', label: 'Group 1 n₁', type: 'number', defaultValue: 10, min: 2, max: 1e6, step: 1 },
      { id: 'm1', label: 'Group 1 Mean', type: 'number', defaultValue: 84, min: -1e7, max: 1e7, step: 0.5 },
      { id: 's1', label: 'Group 1 SD', type: 'number', defaultValue: 6, min: 0.001, max: 1e6, step: 0.5 },
      { id: 'n2', label: 'Group 2 n₂', type: 'number', defaultValue: 10, min: 2, max: 1e6, step: 1 },
      { id: 'm2', label: 'Group 2 Mean', type: 'number', defaultValue: 78, min: -1e7, max: 1e7, step: 0.5 },
      { id: 's2', label: 'Group 2 SD', type: 'number', defaultValue: 6.5, min: 0.001, max: 1e6, step: 0.5 },
      { id: 'n3', label: 'Group 3 n₃', type: 'number', defaultValue: 10, min: 2, max: 1e6, step: 1 },
      { id: 'm3', label: 'Group 3 Mean', type: 'number', defaultValue: 91, min: -1e7, max: 1e7, step: 0.5 },
      { id: 's3', label: 'Group 3 SD', type: 'number', defaultValue: 5.5, min: 0.001, max: 1e6, step: 0.5 },
    ],
    calculate: (v) => {
      const n = [v.n1, v.n2, v.n3].map(parseNum);
      const m = [v.m1, v.m2, v.m3].map(parseNum);
      const s = [v.s1, v.s2, v.s3].map(parseNum);
      if ([...n, ...m, ...s].some(Number.isNaN) || n.some((x) => x < 2) || s.some((x) => x <= 0)) return calcError('All groups require n >= 2 and positive SD.');
      const N = n[0] + n[1] + n[2];
      const grandMean = (n[0] * m[0] + n[1] * m[1] + n[2] * m[2]) / N;
      const ssBetween = n.reduce((acc, ni, i) => acc + ni * (m[i] - grandMean) ** 2, 0);
      const ssWithin = n.reduce((acc, ni, i) => acc + (ni - 1) * s[i] * s[i], 0);
      const df1 = 2;
      const df2 = N - 3;
      const msB = ssBetween / df1;
      const msW = ssWithin / df2;
      const F = msB / msW;
      const x = df2 / (df2 + df1 * F);
      const pVal = betaInc(df2 / 2, df1 / 2, x);
      const etaSq = ssBetween / (ssBetween + ssWithin);
      return {
        primaryValue: fmt(F, 4),
        primaryUnit: `F(${df1}, ${df2})`,
        primaryLabel: pVal < 0.05 ? 'Significant Group Difference (p < 0.05)' : 'No Significant Difference (α = 0.05)',
        secondaryOutputs: [
          { label: 'ANOVA p-Value', value: pVal < 0.0001 ? pVal.toExponential(3) : fmt(pVal, 5) },
          { label: 'Effect Size Eta-Squared (η²)', value: fmt(etaSq, 4) },
          { label: 'SS_between / SS_within', value: `${fmt(ssBetween, 2)} / ${fmt(ssWithin, 2)}` },
        ],
        steps: [`MS_between=${fmt(msB, 3)}, MS_within=${fmt(msW, 3)} → F=${fmt(F, 4)}, p=${pVal < 0.0001 ? pVal.toExponential(3) : fmt(pVal, 5)}.`],
      };
    },
  },

  // 709. Binomial Distribution Probability Calculator
  {
    slug: 'binomial-distribution-probability-calculator',
    title: 'Binomial Distribution P(X=k) & P(X≤k) Calculator',
    category: 'statistics-probability',
    formulaDisplay: 'P(X = k) = C(n, k) · p^k · (1 − p)^(n − k)',
    inputs: [
      { id: 'trialsN', label: 'Number of Trials (n)', type: 'number', defaultValue: 20, min: 1, max: 1000, step: 1 },
      { id: 'successK', label: 'Target Successes (0 ≤ k ≤ n)', type: 'number', defaultValue: 6, min: 0, max: 1000, step: 1 },
      { id: 'probP', label: 'Single-Trial Success Probability (p)', type: 'number', defaultValue: 0.25, min: 0, max: 1, step: 0.05 },
    ],
    calculate: (v) => {
      const n = Math.min(1000, Math.round(parseNum(v.trialsN)));
      const k = Math.round(parseNum(v.successK));
      const p = parseNum(v.probP);
      if ([n, k, p].some(Number.isNaN) || n < 1 || k < 0 || k > n || p < 0 || p > 1) return calcError('Require n >= 1, 0 <= k <= n, and 0 <= p <= 1.');
      const pmf = (x: number) => {
        if (p === 0) return x === 0 ? 1 : 0;
        if (p === 1) return x === n ? 1 : 0;
        return Math.exp(logComb(n, x) + x * Math.log(p) + (n - x) * Math.log(1 - p));
      };
      const exactP = pmf(k);
      let cdfP = 0;
      for (let i = 0; i <= k; i++) cdfP += pmf(i);
      return {
        primaryValue: fmt(exactP * 100, 4),
        primaryUnit: '%',
        primaryLabel: `Exact Binomial Probability P(X = ${k})`,
        secondaryOutputs: [
          { label: `Cumulative P(X ≤ ${k})`, value: `${fmt(Math.min(1, cdfP) * 100, 4)}%` },
          { label: `Upper Tail P(X ≥ ${k})`, value: `${fmt(Math.min(1, 1 - cdfP + exactP) * 100, 4)}%` },
          { label: 'Mean & Standard Deviation', value: `μ = ${fmt(n * p, 2)}, σ = ${fmt(Math.sqrt(n * p * (1 - p)), 3)}` },
        ],
        steps: [`P(X=${k}) = C(${n},${k})×${p}^${k}×${fmt(1 - p, 4)}^${n - k} = ${fmt(exactP, 6)}.`],
      };
    },
  },

  // 710. Poisson Distribution Calculator
  {
    slug: 'poisson-distribution-events-calculator',
    title: 'Poisson Distribution P(X=k) & Cumulative Events Calculator',
    category: 'statistics-probability',
    formulaDisplay: 'P(X = k) = (λ^k · e^−λ) / k!',
    inputs: [
      { id: 'lambda', label: 'Mean Event Rate (λ > 0)', type: 'number', defaultValue: 4.5, min: 0.001, max: 500, step: 0.5 },
      { id: 'k', label: 'Observed Event Count (k ≥ 0)', type: 'number', defaultValue: 6, min: 0, max: 500, step: 1 },
    ],
    calculate: (v) => {
      const lam = parseNum(v.lambda);
      const k = Math.min(500, Math.round(parseNum(v.k)));
      if (Number.isNaN(lam) || Number.isNaN(k) || lam <= 0 || lam > 500 || k < 0) return calcError('Enter 0 < λ <= 500 and integer k >= 0.');
      const pmf = (x: number) => Math.exp(x * Math.log(lam) - lam - logGamma(x + 1));
      const exactP = pmf(k);
      let cdf = 0;
      for (let i = 0; i <= k; i++) cdf += pmf(i);
      return {
        primaryValue: fmt(exactP * 100, 4),
        primaryUnit: '%',
        primaryLabel: `Poisson P(X = ${k} | λ = ${lam})`,
        secondaryOutputs: [
          { label: `Cumulative P(X ≤ ${k})`, value: `${fmt(Math.min(1, cdf) * 100, 4)}%` },
          { label: `Upper Tail P(X > ${k})`, value: `${fmt(Math.max(0, 1 - cdf) * 100, 4)}%` },
          { label: 'Std Deviation (√λ)', value: fmt(Math.sqrt(lam), 4) },
        ],
        steps: [`P(X=${k}) = ${lam}^${k}·e^−${lam}/${k}! = ${fmt(exactP, 6)}.`],
      };
    },
  },

  // 711. Hypergeometric Distribution Calculator
  {
    slug: 'hypergeometric-sampling-probability-calculator',
    title: 'Hypergeometric Sampling Without Replacement Calculator',
    category: 'statistics-probability',
    formulaDisplay: 'P(X = k) = C(K, k) · C(N − K, n − k) / C(N, n)',
    inputs: [
      { id: 'popN', label: 'Population Size (N)', type: 'number', defaultValue: 52, min: 1, max: 10000, step: 1 },
      { id: 'successPopK', label: 'Success States in Population (K)', type: 'number', defaultValue: 13, min: 0, max: 10000, step: 1 },
      { id: 'drawsN', label: 'Sample Draws (n)', type: 'number', defaultValue: 5, min: 1, max: 1000, step: 1 },
      { id: 'targetK', label: 'Target Successes in Sample (k)', type: 'number', defaultValue: 2, min: 0, max: 1000, step: 1 },
    ],
    calculate: (v) => {
      const [N, K, n, k] = [v.popN, v.successPopK, v.drawsN, v.targetK].map((x) => Math.round(parseNum(x)));
      if ([N, K, n, k].some(Number.isNaN) || N < 1 || K < 0 || K > N || n < 1 || n > N || k < 0 || k > Math.min(n, K) || n - k > N - K) {
        return calcError('Require 0 ≤ K ≤ N, 1 ≤ n ≤ N, and valid sample successes k.');
      }
      const p = Math.exp(logComb(K, k) + logComb(N - K, n - k) - logComb(N, n));
      const mean = (n * K) / N;
      return {
        primaryValue: fmt(p * 100, 4),
        primaryUnit: '%',
        primaryLabel: `Exact Draw Probability P(X = ${k})`,
        secondaryOutputs: [
          { label: 'Expected Successes in Draw', value: fmt(mean, 3) },
          { label: 'Odds Against (1 in X)', value: p > 0 ? `1 in ${fmt(1 / p, 2)}` : 'Impossible' },
        ],
        steps: [`C(${K},${k})·C(${N - K},${n - k}) ÷ C(${N},${n}) = ${fmt(p, 6)} (${fmt(p * 100, 4)}%).`],
      };
    },
  },

  // 712. Geometric Distribution Calculator
  {
    slug: 'geometric-negative-binomial-calculator',
    title: 'Geometric Distribution (First Success Trial) Calculator',
    category: 'statistics-probability',
    formulaDisplay: 'P(X = k) = (1 − p)^(k − 1) · p   |   P(X ≤ k) = 1 − (1 − p)^k',
    inputs: [
      { id: 'probP', label: 'Success Probability Per Trial (0 < p ≤ 1)', type: 'number', defaultValue: 0.2, min: 0.0001, max: 1, step: 0.05 },
      { id: 'trialK', label: 'Trial Number of First Success (k ≥ 1)', type: 'number', defaultValue: 4, min: 1, max: 10000, step: 1 },
    ],
    calculate: (v) => {
      const p = parseNum(v.probP);
      const k = Math.round(parseNum(v.trialK));
      if (Number.isNaN(p) || Number.isNaN(k) || p <= 0 || p > 1 || k < 1) return calcError('Require 0 < p <= 1 and integer k >= 1.');
      const exact = Math.pow(1 - p, k - 1) * p;
      const cdf = 1 - Math.pow(1 - p, k);
      const mean = 1 / p;
      return {
        primaryValue: fmt(exact * 100, 4),
        primaryUnit: '%',
        primaryLabel: `First Success on Trial #${k}`,
        secondaryOutputs: [
          { label: `At Least One Success Within ${k} Trials`, value: `${fmt(cdf * 100, 4)}%` },
          { label: 'Expected Trials Until First Success (1/p)', value: fmt(mean, 2) },
        ],
        steps: [`P(X=${k}) = (1−${p})^${k - 1}×${p} = ${fmt(exact * 100, 4)}%; P(X≤${k}) = ${fmt(cdf * 100, 4)}%.`],
      };
    },
  },

  // 713. Exponential Inter-Arrival Waiting Time Calculator
  {
    slug: 'exponential-waiting-time-calculator',
    title: 'Exponential Distribution Waiting Time & Survival Calculator',
    category: 'statistics-probability',
    formulaDisplay: 'P(T ≤ t) = 1 − e^(−λt),  Mean = 1 / λ',
    inputs: [
      { id: 'rateLambda', label: 'Arrival / Hazard Rate (λ events/unit time)', type: 'number', defaultValue: 0.25, min: 0.0001, max: 1e6, step: 0.05 },
      { id: 'timeT', label: 'Target Time Threshold (t ≥ 0)', type: 'number', defaultValue: 5, min: 0, max: 1e6, step: 0.5 },
    ],
    calculate: (v) => {
      const lam = parseNum(v.rateLambda);
      const t = parseNum(v.timeT);
      if (Number.isNaN(lam) || Number.isNaN(t) || lam <= 0 || t < 0) return calcError('Rate λ must be positive and time t >= 0.');
      const cdf = 1 - Math.exp(-lam * t);
      const survival = 1 - cdf;
      const meanTime = 1 / lam;
      return {
        primaryValue: fmt(cdf * 100, 4),
        primaryUnit: '%',
        primaryLabel: `Event Occurs Within t ≤ ${t}`,
        secondaryOutputs: [
          { label: `Survival Probability P(T > ${t})`, value: `${fmt(survival * 100, 4)}%` },
          { label: 'Mean Time Between Events (1/λ)', value: fmt(meanTime, 4) },
          { label: 'Median Waiting Time (ln 2 / λ)', value: fmt(Math.LN2 / lam, 4) },
        ],
        steps: [`CDF = 1 − exp(−${lam}×${t}) = ${fmt(cdf * 100, 4)}%.`],
      };
    },
  },

  // 714. Survey Sample Size & Margin of Error
  {
    slug: 'margin-of-error-survey-size-calculator',
    title: 'Survey Sample Size & Finite-Population Margin of Error Calculator',
    category: 'statistics-probability',
    formulaDisplay: 'n₀ = Z²·p(1−p) / E²   |   n_adj = n₀ / (1 + (n₀ − 1)/N)',
    inputs: [
      { id: 'marginPct', label: 'Desired Margin of Error (±%)', type: 'number', unit: '%', defaultValue: 3.0, min: 0.1, max: 45, step: 0.5 },
      {
        id: 'confidenceZ',
        label: 'Confidence Level',
        type: 'select',
        defaultValue: '1.96',
        options: [
          { label: '90% (Z = 1.645)', value: '1.6449' },
          { label: '95% (Z = 1.960)', value: '1.96' },
          { label: '99% (Z = 2.576)', value: '2.5758' },
        ],
      },
      { id: 'propP', label: 'Expected Proportion (0.50 = Conservative Max)', type: 'number', defaultValue: 0.5, min: 0.01, max: 0.99, step: 0.05 },
      { id: 'popSize', label: 'Total Population Size (0 = Infinite)', type: 'number', defaultValue: 0, min: 0, max: 1e10, step: 1000 },
    ],
    calculate: (v) => {
      const moe = parseNum(v.marginPct) / 100;
      const z = parseNum(v.confidenceZ || 1.96);
      const p = parseNum(v.propP);
      const N = parseNum(v.popSize ?? 0);
      if ([moe, z, p, N].some(Number.isNaN) || moe <= 0 || z <= 0 || p <= 0 || p >= 1 || N < 0) return calcError('Enter valid positive margin of error and proportion 0 < p < 1.');
      const n0 = (z * z * p * (1 - p)) / (moe * moe);
      const nFinal = N > 0 ? n0 / (1 + (n0 - 1) / N) : n0;
      return {
        primaryValue: Math.ceil(nFinal),
        primaryUnit: 'respondents',
        primaryLabel: 'Required Minimum Sample Size',
        secondaryOutputs: [
          { label: 'Uncorrected Infinite Sample Size (n₀)', value: Math.ceil(n0) },
          { label: 'Population Correction Applied', value: N > 0 ? `Yes (N = ${N.toLocaleString()})` : 'Infinite Population' },
        ],
        steps: [`n₀ = (${z}² × ${p} × ${fmt(1 - p, 2)}) ÷ (${moe}²) = ${fmt(n0, 1)} → ${Math.ceil(nFinal)} respondents.`],
      };
    },
  },

  // 715. Pearson Correlation r & Fisher 95% CI
  {
    slug: 'pearson-spearman-correlation-calculator',
    title: 'Pearson Correlation (r), Covariance & 95% CI Calculator',
    category: 'statistics-probability',
    formulaDisplay: 'r = Σ(x−x̄)(y−ȳ) / √(Σ(x−x̄)² · Σ(y−ȳ)²)',
    inputs: [
      { id: 'xVals', label: 'X Values (comma-separated)', type: 'text', defaultValue: '10, 20, 30, 40, 50, 60' },
      { id: 'yVals', label: 'Y Values (comma-separated, equal count)', type: 'text', defaultValue: '14, 23, 35, 42, 56, 61' },
    ],
    calculate: (v) => {
      const x = parseNumList(v.xVals);
      const y = parseNumList(v.yVals);
      if (x.length < 3 || x.length !== y.length) return calcError('Enter equal-length X and Y vectors with at least 3 points.');
      const n = x.length;
      const mx = x.reduce((a, b) => a + b, 0) / n;
      const my = y.reduce((a, b) => a + b, 0) / n;
      let sxx = 0, syy = 0, sxy = 0;
      for (let i = 0; i < n; i++) {
        sxx += (x[i] - mx) ** 2;
        syy += (y[i] - my) ** 2;
        sxy += (x[i] - mx) * (y[i] - my);
      }
      if (sxx <= 0 || syy <= 0) return calcError('Variables must have non-zero variance.');
      const r = Math.max(-1, Math.min(1, sxy / Math.sqrt(sxx * syy)));
      const t = Math.abs(r) < 1 ? (r * Math.sqrt(n - 2)) / Math.sqrt(1 - r * r) : Infinity;
      const pVal = Number.isFinite(t) ? tTwoSidedP(t, n - 2) : 0;
      return {
        primaryValue: fmt(r, 4),
        primaryUnit: 'Pearson r',
        primaryLabel: `Correlation Coefficient (R² = ${fmt(r * r, 4)})`,
        secondaryOutputs: [
          { label: 'Sample Covariance Cov(X, Y)', value: fmt(sxy / (n - 1), 4) },
          { label: 'Two-Tailed p-Value (H₀: ρ = 0)', value: pVal < 0.0001 ? pVal.toExponential(3) : fmt(pVal, 5) },
        ],
        steps: [`n=${n}: Pearson r = ${fmt(r, 4)}, R² = ${fmt(r * r, 4)}, t(${n - 2}) = ${fmt(t, 3)}.`],
      };
    },
  },

  // 716. Clinical Odds Ratio, Relative Risk & NNT
  {
    slug: 'odds-ratio-relative-risk-calculator',
    title: 'Clinical 2×2 Odds Ratio, Relative Risk & NNT Calculator',
    category: 'statistics-probability',
    formulaDisplay: 'OR = (a·d)/(b·c)   |   RR = [a/(a+b)] / [c/(c+d)]   |   NNT = 1 / ARR',
    inputs: [
      { id: 'treatEvent', label: 'Treatment Group: Events (a)', type: 'number', defaultValue: 18, min: 0, max: 1e8, step: 1 },
      { id: 'treatNoEvent', label: 'Treatment Group: Non-Events (b)', type: 'number', defaultValue: 182, min: 0, max: 1e8, step: 1 },
      { id: 'ctrlEvent', label: 'Control Group: Events (c)', type: 'number', defaultValue: 36, min: 0, max: 1e8, step: 1 },
      { id: 'ctrlNoEvent', label: 'Control Group: Non-Events (d)', type: 'number', defaultValue: 164, min: 0, max: 1e8, step: 1 },
    ],
    calculate: (v) => {
      const [a, b, c, d] = [v.treatEvent, v.treatNoEvent, v.ctrlEvent, v.ctrlNoEvent].map(parseNum);
      if ([a, b, c, d].some(Number.isNaN) || a < 0 || b < 0 || c < 0 || d < 0 || a + b <= 0 || c + d <= 0) return calcError('Enter non-negative counts with positive group totals.');
      const eer = a / (a + b);
      const cer = c / (c + d);
      const rr = cer > 0 ? eer / cer : 0;
      const or = b > 0 && c > 0 ? (a * d) / (b * c) : 0;
      const arr = cer - eer;
      const nnt = Math.abs(arr) > 1e-9 ? 1 / arr : Infinity;
      const seLnOr = a > 0 && b > 0 && c > 0 && d > 0 ? Math.sqrt(1 / a + 1 / b + 1 / c + 1 / d) : 0;
      const orLo = or > 0 ? Math.exp(Math.log(or) - 1.96 * seLnOr) : 0;
      const orHi = or > 0 ? Math.exp(Math.log(or) + 1.96 * seLnOr) : 0;
      return {
        primaryValue: fmt(or, 3),
        primaryUnit: 'Odds Ratio',
        primaryLabel: `Odds Ratio (95% CI: ${fmt(orLo, 2)}–${fmt(orHi, 2)})`,
        secondaryOutputs: [
          { label: 'Relative Risk (RR)', value: fmt(rr, 3) },
          { label: 'Absolute Risk Reduction (ARR)', value: `${fmt(arr * 100, 2)}%` },
          { label: arr > 0 ? 'Number Needed to Treat (NNT)' : 'Number Needed to Harm (NNH)', value: Number.isFinite(nnt) ? fmt(Math.abs(nnt), 1) : '∞' },
        ],
        steps: [`EER=${fmt(eer * 100, 1)}% vs CER=${fmt(cer * 100, 1)}% → RR=${fmt(rr, 3)}, OR=${fmt(or, 3)}, NNT=${fmt(Math.abs(nnt), 1)}.`],
      };
    },
  },

  // 717. Diagnostic Sensitivity, Specificity, F1 & LR
  {
    slug: 'sensitivity-specificity-roc-calculator',
    title: 'Diagnostic Test Sensitivity, Specificity, F1 & Likelihood Ratio Calculator',
    category: 'statistics-probability',
    formulaDisplay: 'Sens = TP/(TP+FN)   |   Spec = TN/(TN+FP)   |   LR+ = Sens/(1−Spec)',
    inputs: [
      { id: 'tp', label: 'True Positives (TP)', type: 'number', defaultValue: 92, min: 0, max: 1e8, step: 1 },
      { id: 'fn', label: 'False Negatives (FN)', type: 'number', defaultValue: 8, min: 0, max: 1e8, step: 1 },
      { id: 'fp', label: 'False Positives (FP)', type: 'number', defaultValue: 15, min: 0, max: 1e8, step: 1 },
      { id: 'tn', label: 'True Negatives (TN)', type: 'number', defaultValue: 185, min: 0, max: 1e8, step: 1 },
    ],
    calculate: (v) => {
      const [tp, fn, fp, tn] = [v.tp, v.fn, v.fp, v.tn].map(parseNum);
      if ([tp, fn, fp, tn].some(Number.isNaN) || tp < 0 || fn < 0 || fp < 0 || tn < 0 || tp + fn <= 0 || tn + fp <= 0) {
        return calcError('Require non-negative counts with positive disease and non-disease totals.');
      }
      const sens = tp / (tp + fn);
      const spec = tn / (tn + fp);
      const ppv = tp + fp > 0 ? tp / (tp + fp) : 0;
      const npv = tn + fn > 0 ? tn / (tn + fn) : 0;
      const f1 = (2 * tp) / (2 * tp + fp + fn);
      const lrPos = spec < 1 ? sens / (1 - spec) : Infinity;
      const lrNeg = spec > 0 ? (1 - sens) / spec : Infinity;
      return {
        primaryValue: fmt(sens * 100, 2),
        primaryUnit: '% Sensitivity',
        primaryLabel: `Sensitivity ${fmt(sens * 100, 1)}% / Specificity ${fmt(spec * 100, 1)}%`,
        secondaryOutputs: [
          { label: 'Specificity (TNR)', value: `${fmt(spec * 100, 2)}%` },
          { label: 'PPV (Precision) / NPV', value: `${fmt(ppv * 100, 1)}% / ${fmt(npv * 100, 1)}%` },
          { label: 'F1 Score / LR+ / LR−', value: `F1=${fmt(f1, 3)} | LR+=${Number.isFinite(lrPos) ? fmt(lrPos, 2) : '∞'} | LR−=${fmt(lrNeg, 3)}` },
        ],
        steps: [`TP=${tp}, FN=${fn}, FP=${fp}, TN=${tn} → Sens=${fmt(sens * 100, 2)}%, Spec=${fmt(spec * 100, 2)}%, F1=${fmt(f1, 3)}.`],
      };
    },
  },

  // 718. Cohen's Kappa Inter-Rater Agreement
  {
    slug: 'cohens-kappa-interrater-calculator',
    title: 'Cohen’s Kappa (κ) Inter-Rater Reliability Calculator',
    category: 'statistics-probability',
    formulaDisplay: 'κ = (P_o − P_e) / (1 − P_e)',
    inputs: [
      { id: 'bothYes', label: 'Both Raters Say YES (a)', type: 'number', defaultValue: 40, min: 0, max: 1e8, step: 1 },
      { id: 'r1YesR2No', label: 'Rater 1 YES / Rater 2 NO (b)', type: 'number', defaultValue: 6, min: 0, max: 1e8, step: 1 },
      { id: 'r1NoR2Yes', label: 'Rater 1 NO / Rater 2 YES (c)', type: 'number', defaultValue: 4, min: 0, max: 1e8, step: 1 },
      { id: 'bothNo', label: 'Both Raters Say NO (d)', type: 'number', defaultValue: 50, min: 0, max: 1e8, step: 1 },
    ],
    calculate: (v) => {
      const [a, b, c, d] = [v.bothYes, v.r1YesR2No, v.r1NoR2Yes, v.bothNo].map(parseNum);
      if ([a, b, c, d].some(Number.isNaN) || a < 0 || b < 0 || c < 0 || d < 0) return calcError('Counts must be non-negative.');
      const N = a + b + c + d;
      if (N <= 0) return calcError('Total observations must be positive.');
      const po = (a + d) / N;
      const pe = (((a + b) * (a + c)) + ((c + d) * (b + d))) / (N * N);
      if (pe >= 1) return calcError('Expected chance agreement equals 1; Kappa undefined.');
      const kappa = (po - pe) / (1 - pe);
      const tier = kappa > 0.8 ? 'Almost Perfect' : kappa > 0.6 ? 'Substantial' : kappa > 0.4 ? 'Moderate' : 'Fair/Poor';
      return {
        primaryValue: fmt(kappa, 4),
        primaryUnit: 'κ',
        primaryLabel: `Cohen’s Kappa (${tier} Agreement)`,
        secondaryOutputs: [
          { label: 'Observed Agreement (P_o)', value: `${fmt(po * 100, 2)}%` },
          { label: 'Chance-Expected Agreement (P_e)', value: `${fmt(pe * 100, 2)}%` },
        ],
        steps: [`P_o=${fmt(po, 4)}, P_e=${fmt(pe, 4)} → κ = (${fmt(po, 4)}−${fmt(pe, 4)})/(1−${fmt(pe, 4)}) = ${fmt(kappa, 4)}.`],
      };
    },
  },

  // 719. Six Sigma Cpk, Cp & DPMO Calculator
  {
    slug: 'six-sigma-dpmo-cpk-calculator',
    title: 'Six Sigma Process Capability (Cp, Cpk) & DPMO Calculator',
    category: 'statistics-probability',
    formulaDisplay: 'Cpk = min((USL − μ)/(3σ), (μ − LSL)/(3σ))',
    inputs: [
      { id: 'usl', label: 'Upper Specification Limit (USL)', type: 'number', defaultValue: 10.5, min: -1e7, max: 1e7, step: 0.1 },
      { id: 'lsl', label: 'Lower Specification Limit (LSL)', type: 'number', defaultValue: 9.5, min: -1e7, max: 1e7, step: 0.1 },
      { id: 'mean', label: 'Process Mean (μ)', type: 'number', defaultValue: 10.05, min: -1e7, max: 1e7, step: 0.05 },
      { id: 'sd', label: 'Within-Process Std Dev (σ > 0)', type: 'number', defaultValue: 0.1, min: 0.0001, max: 1e6, step: 0.01 },
    ],
    calculate: (v) => {
      const [usl, lsl, mu, sd] = [v.usl, v.lsl, v.mean, v.sd].map(parseNum);
      if ([usl, lsl, mu, sd].some(Number.isNaN) || usl <= lsl || sd <= 0) return calcError('Require USL > LSL and positive SD.');
      const cp = (usl - lsl) / (6 * sd);
      const cpu = (usl - mu) / (3 * sd);
      const cpl = (mu - lsl) / (3 * sd);
      const cpk = Math.min(cpu, cpl);
      const pDefect = (1 - normalCdf((usl - mu) / sd)) + normalCdf((lsl - mu) / sd);
      const dpmo = pDefect * 1_000_000;
      const sigmaLevel = 3 * cpk;
      return {
        primaryValue: fmt(cpk, 3),
        primaryUnit: 'Cpk',
        primaryLabel: cpk >= 1.33 ? 'Capable Process (Cpk ≥ 1.33)' : 'Below 1.33 Target Capability',
        secondaryOutputs: [
          { label: 'Potential Capability (Cp)', value: fmt(cp, 3) },
          { label: 'Expected Defects Per Million (DPMO)', value: Math.round(dpmo).toLocaleString() },
          { label: 'Short-Term Sigma Level (Z)', value: `${fmt(sigmaLevel, 2)}σ` },
        ],
        steps: [`Cpu=${fmt(cpu, 3)}, Cpl=${fmt(cpl, 3)} → Cpk=${fmt(cpk, 3)}, DPMO=${Math.round(dpmo).toLocaleString()}.`],
      };
    },
  },

  // 720. Pareto 80/20 Concentration Calculator
  {
    slug: 'pareto-80-20-concentration-calculator',
    title: 'Pareto 80/20 Concentration & Gini Inequality Calculator',
    category: 'statistics-probability',
    formulaDisplay: 'Cumulative Share of Sorted Descending Contributions & Gini Index',
    inputs: [
      { id: 'valuesList', label: 'Comma-Separated Segment Totals (Revenue / Defects)', type: 'textarea', rows: 2, defaultValue: '420, 260, 120, 80, 45, 30, 20, 15, 6, 4' },
    ],
    calculate: (v) => {
      const nums = parseNumList(v.valuesList).filter((x) => x >= 0).sort((a, b) => b - a);
      if (nums.length < 2) return calcError('Enter at least 2 non-negative values.');
      const total = nums.reduce((a, b) => a + b, 0);
      if (total <= 0) return calcError('Total sum must be positive.');
      const top20Count = Math.max(1, Math.round(nums.length * 0.2));
      const top20Sum = nums.slice(0, top20Count).reduce((a, b) => a + b, 0);
      const top20Pct = (top20Sum / total) * 100;
      // Gini
      const asc = [...nums].reverse();
      let numGini = 0;
      for (let i = 0; i < asc.length; i++) numGini += (2 * (i + 1) - asc.length - 1) * asc[i];
      const gini = numGini / (asc.length * total);
      return {
        primaryValue: fmt(top20Pct, 1),
        primaryUnit: '% from top 20%',
        primaryLabel: `Top ${top20Count} of ${nums.length} Items Drive ${fmt(top20Pct, 1)}%`,
        secondaryOutputs: [
          { label: 'Gini Concentration Coefficient', value: fmt(gini, 3) },
          { label: 'Total Pooled Sum', value: fmt(total, 2) },
        ],
        steps: [`Top ${top20Count} entries account for ${fmt(top20Sum, 2)} of ${fmt(total, 2)} (${fmt(top20Pct, 1)}%); Gini = ${fmt(gini, 3)}.`],
      };
    },
  },

  // 721. Sample Skewness & Excess Kurtosis Calculator
  {
    slug: 'skewness-kurtosis-moments-calculator',
    title: 'Sample Skewness & Excess Kurtosis Moments Calculator',
    category: 'statistics-probability',
    formulaDisplay: 'Adjusted Fisher-Pearson Skewness (G₁) & Sample Excess Kurtosis (G₂)',
    inputs: [
      { id: 'dataset', label: 'Comma-Separated Values (n ≥ 4)', type: 'textarea', rows: 2, defaultValue: '10, 12, 13, 14, 14, 15, 16, 18, 28' },
    ],
    calculate: (v) => {
      const nums = parseNumList(v.dataset);
      const n = nums.length;
      if (n < 4) return calcError('Enter at least 4 numbers to compute sample skewness and kurtosis.');
      const mean = nums.reduce((a, b) => a + b, 0) / n;
      const m2 = nums.reduce((a, x) => a + (x - mean) ** 2, 0) / n;
      if (m2 <= 0) return calcError('Dataset variance must be positive.');
      const m3 = nums.reduce((a, x) => a + (x - mean) ** 3, 0) / n;
      const m4 = nums.reduce((a, x) => a + (x - mean) ** 4, 0) / n;
      const g1Pop = m3 / Math.pow(m2, 1.5);
      const skewSample = (Math.sqrt(n * (n - 1)) / (n - 2)) * g1Pop;
      const kurtPopExcess = m4 / (m2 * m2) - 3;
      const kurtSample = ((n - 1) / ((n - 2) * (n - 3))) * ((n + 1) * kurtPopExcess + 6);
      return {
        primaryValue: fmt(skewSample, 4),
        primaryUnit: 'G₁ skewness',
        primaryLabel: skewSample > 0.5 ? 'Right-Skewed (Positive Tail)' : skewSample < -0.5 ? 'Left-Skewed (Negative Tail)' : 'Approximately Symmetric',
        secondaryOutputs: [
          { label: 'Sample Excess Kurtosis (G₂)', value: fmt(kurtSample, 4) },
          { label: 'Tail Shape', value: kurtSample > 1 ? 'Leptokurtic (Heavy Tails)' : kurtSample < -1 ? 'Platykurtic (Light Tails)' : 'Mesokurtic (~Normal)' },
        ],
        steps: [`n=${n}: Adjusted G₁ = ${fmt(skewSample, 4)}, Sample Excess Kurtosis G₂ = ${fmt(kurtSample, 4)}.`],
      };
    },
  },

  // 722. Discrete Expected Value & Variance
  {
    slug: 'expected-value-variance-discrete-calculator',
    title: 'Discrete Random Variable E[X] & Variance Calculator',
    category: 'statistics-probability',
    formulaDisplay: 'E[X] = Σ x_i·p_i   |   Var(X) = Σ (x_i − E[X])²·p_i',
    inputs: [
      { id: 'outcomes', label: 'Outcomes x_i (comma-separated)', type: 'text', defaultValue: '0, 10, 50, 200' },
      { id: 'probs', label: 'Probabilities p_i (sum = 1)', type: 'text', defaultValue: '0.70, 0.20, 0.08, 0.02' },
    ],
    calculate: (v) => {
      const xs = parseNumList(v.outcomes);
      const ps = parseNumList(v.probs);
      if (xs.length === 0 || xs.length !== ps.length || ps.some((p) => p < 0)) return calcError('Provide equal-length outcomes and non-negative probabilities.');
      const pSum = ps.reduce((a, b) => a + b, 0);
      if (Math.abs(pSum - 1) > 0.01) return calcError(`Probabilities must sum to 1.0 (currently ${fmt(pSum, 4)}).`);
      const ev = xs.reduce((a, x, i) => a + x * (ps[i] / pSum), 0);
      const vari = xs.reduce((a, x, i) => a + (x - ev) ** 2 * (ps[i] / pSum), 0);
      return {
        primaryValue: fmt(ev, 4),
        primaryUnit: 'E[X]',
        primaryLabel: 'Expected Value',
        secondaryOutputs: [
          { label: 'Variance Var(X)', value: fmt(vari, 4) },
          { label: 'Standard Deviation σ', value: fmt(Math.sqrt(vari), 4) },
        ],
        steps: [`E[X] = ${fmt(ev, 4)}; Var(X) = ${fmt(vari, 4)}; σ = ${fmt(Math.sqrt(vari), 4)}.`],
      };
    },
  },

  // 723. Multi-Die Sum Odds & Exact Probability
  {
    slug: 'dice-card-odds-probability-calculator',
    title: 'Multi-Die Sum Probability & Fair Odds Calculator',
    category: 'statistics-probability',
    formulaDisplay: 'Exact Generating-Function Enumeration for n d-Sided Dice',
    inputs: [
      { id: 'numDice', label: 'Number of Dice (1–8)', type: 'number', defaultValue: 2, min: 1, max: 8, step: 1 },
      { id: 'sides', label: 'Sides per Die (4–20)', type: 'number', defaultValue: 6, min: 2, max: 20, step: 1 },
      { id: 'targetSum', label: 'Target Sum Value', type: 'number', defaultValue: 7, min: 1, max: 160, step: 1 },
    ],
    calculate: (v) => {
      const n = Math.min(8, Math.max(1, Math.round(parseNum(v.numDice))));
      const s = Math.min(20, Math.max(2, Math.round(parseNum(v.sides))));
      const target = Math.round(parseNum(v.targetSum));
      if ([n, s, target].some(Number.isNaN) || target < n || target > n * s) return calcError(`Target sum must be between ${n} and ${n * s}.`);
      let dp = new Map<number, number>([[0, 1]]);
      for (let d = 0; d < n; d++) {
        const nxt = new Map<number, number>();
        for (const [sum, cnt] of dp.entries()) {
          for (let face = 1; face <= s; face++) {
            nxt.set(sum + face, (nxt.get(sum + face) || 0) + cnt);
          }
        }
        dp = nxt;
      }
      const totalWays = Math.pow(s, n);
      const exactWays = dp.get(target) || 0;
      let atLeastWays = 0;
      for (const [sum, cnt] of dp.entries()) if (sum >= target) atLeastWays += cnt;
      const pExact = exactWays / totalWays;
      const pAtLeast = atLeastWays / totalWays;
      return {
        primaryValue: fmt(pExact * 100, 3),
        primaryUnit: '%',
        primaryLabel: `Exact Probability P(Sum = ${target}) on ${n}d${s}`,
        secondaryOutputs: [
          { label: `At Least ${target} P(Sum ≥ ${target})`, value: `${fmt(pAtLeast * 100, 3)}%` },
          { label: 'Matching / Total Outcomes', value: `${exactWays.toLocaleString()} / ${totalWays.toLocaleString()}` },
          { label: 'Expected Mean Sum', value: fmt((n * (s + 1)) / 2, 2) },
        ],
        steps: [`${exactWays} of ${totalWays} permutations equal ${target} → ${fmt(pExact * 100, 3)}%.`],
      };
    },
  },

  // 724. Cronbach's Alpha Internal Consistency Calculator
  {
    slug: 'cronbach-alpha-reliability-calculator',
    title: 'Cronbach’s Alpha (α) & Spearman-Brown Reliability Calculator',
    category: 'statistics-probability',
    formulaDisplay: 'α = (k / (k − 1)) × (1 − Σσ_i² / σ_total²)',
    inputs: [
      { id: 'numItems', label: 'Number of Scale Items (k ≥ 2)', type: 'number', defaultValue: 10, min: 2, max: 500, step: 1 },
      { id: 'avgItemVar', label: 'Average Single-Item Variance (σ̄_i²)', type: 'number', defaultValue: 1.2, min: 0.001, max: 1e6, step: 0.1 },
      { id: 'totalScoreVar', label: 'Total Composite Scale Variance (σ_total²)', type: 'number', defaultValue: 48, min: 0.001, max: 1e8, step: 1 },
    ],
    calculate: (v) => {
      const k = Math.round(parseNum(v.numItems));
      const iv = parseNum(v.avgItemVar);
      const tv = parseNum(v.totalScoreVar);
      if ([k, iv, tv].some(Number.isNaN) || k < 2 || iv <= 0 || tv <= 0) return calcError('Require k >= 2 items and positive variances.');
      const sumItemVars = k * iv;
      const alpha = (k / (k - 1)) * (1 - sumItemVars / tv);
      const avgCov = (tv - sumItemVars) / (k * (k - 1));
      return {
        primaryValue: fmt(alpha, 4),
        primaryUnit: 'α',
        primaryLabel: alpha >= 0.9 ? 'Excellent Reliability' : alpha >= 0.8 ? 'Good Reliability' : alpha >= 0.7 ? 'Acceptable Reliability' : 'Questionable / Low (<0.70)',
        secondaryOutputs: [
          { label: 'Sum of Item Variances', value: fmt(sumItemVars, 3) },
          { label: 'Mean Inter-Item Covariance', value: fmt(avgCov, 4) },
        ],
        steps: [`α = (${k}/${k - 1})×(1 − ${fmt(sumItemVars, 2)}/${tv}) = ${fmt(alpha, 4)}.`],
      };
    },
  },

  // 725. Wilson Score Binomial Proportion 95% CI
  {
    slug: 'wilson-score-proportion-ci-calculator',
    title: 'Wilson Score Proportion Confidence Interval Calculator',
    category: 'statistics-probability',
    formulaDisplay: '(p̂ + z²/2n ± z√(p̂(1−p̂)/n + z²/4n²)) / (1 + z²/n)',
    inputs: [
      { id: 'successes', label: 'Successes / Upvotes (x)', type: 'number', defaultValue: 42, min: 0, max: 1e9, step: 1 },
      { id: 'trials', label: 'Total Trials (n ≥ 1)', type: 'number', defaultValue: 50, min: 1, max: 1e9, step: 1 },
      {
        id: 'zScore',
        label: 'Confidence Level',
        type: 'select',
        defaultValue: '1.96',
        options: [
          { label: '90% (Z = 1.645)', value: '1.6449' },
          { label: '95% (Z = 1.960)', value: '1.96' },
          { label: '99% (Z = 2.576)', value: '2.5758' },
        ],
      },
    ],
    calculate: (v) => {
      const x = parseNum(v.successes);
      const n = parseNum(v.trials);
      const z = parseNum(v.zScore || 1.96);
      if ([x, n, z].some(Number.isNaN) || n < 1 || x < 0 || x > n) return calcError('Require 0 <= x <= n and n >= 1.');
      const p = x / n;
      const denom = 1 + (z * z) / n;
      const center = (p + (z * z) / (2 * n)) / denom;
      const half = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / denom;
      const lo = Math.max(0, center - half);
      const hi = Math.min(1, center + half);
      return {
        primaryValue: `${fmt(lo * 100, 2)}% – ${fmt(hi * 100, 2)}%`,
        primaryUnit: 'Wilson CI',
        primaryLabel: `Wilson Lower Bound: ${fmt(lo * 100, 2)}%`,
        secondaryOutputs: [
          { label: 'Sample Proportion (p̂)', value: `${fmt(p * 100, 2)}%` },
          { label: 'Wilson Adjusted Center', value: `${fmt(center * 100, 2)}%` },
        ],
        steps: [`Observed ${x}/${n} (${fmt(p * 100, 2)}%) → Wilson CI = [${fmt(lo * 100, 2)}%, ${fmt(hi * 100, 2)}%].`],
      };
    },
  },
];
