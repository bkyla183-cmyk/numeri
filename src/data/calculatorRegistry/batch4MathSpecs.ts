import { CalculatorSpec } from './types';
import { parseNum, calcError } from './validation';

const fmt = (n: number, d = 4): number => {
  if (!Number.isFinite(n)) return 0;
  const r = Number(n.toFixed(d));
  return Object.is(r, -0) ? 0 : r;
};

export const batch4MathSpecs: CalculatorSpec[] = [
  // 637. Two-Point Slope, Distance & Midpoint Calculator
  {
    slug: 'slope-intercept-distance-calculator',
    title: 'Two-Point Slope, Distance & Line Equation Calculator',
    category: 'math',
    formulaDisplay: 'm = (y₂ − y₁)/(x₂ − x₁)   |   d = √((x₂ − x₁)² + (y₂ − y₁)²)',
    inputs: [
      { id: 'x1', label: 'Point 1 (x₁)', type: 'number', defaultValue: 2, min: -1e9, max: 1e9, step: 0.5 },
      { id: 'y1', label: 'Point 1 (y₁)', type: 'number', defaultValue: 3, min: -1e9, max: 1e9, step: 0.5 },
      { id: 'x2', label: 'Point 2 (x₂)', type: 'number', defaultValue: 8, min: -1e9, max: 1e9, step: 0.5 },
      { id: 'y2', label: 'Point 2 (y₂)', type: 'number', defaultValue: 15, min: -1e9, max: 1e9, step: 0.5 },
    ],
    calculate: (v) => {
      const x1 = parseNum(v.x1);
      const y1 = parseNum(v.y1);
      const x2 = parseNum(v.x2);
      const y2 = parseNum(v.y2);
      if ([x1, y1, x2, y2].some(Number.isNaN)) return calcError('Enter valid numeric coordinates.');
      const dx = x2 - x1;
      const dy = y2 - y1;
      const dist = Math.hypot(dx, dy);
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      if (dx === 0) {
        return {
          primaryValue: fmt(dist, 4),
          primaryUnit: 'units',
          primaryLabel: 'Euclidean Distance (Vertical Line)',
          secondaryOutputs: [
            { label: 'Slope (m)', value: 'Undefined (Vertical)' },
            { label: 'Line Equation', value: `x = ${fmt(x1, 4)}` },
            { label: 'Midpoint', value: `(${fmt(mx, 3)}, ${fmt(my, 3)})` },
          ],
          steps: [`dx = 0 → Vertical line x = ${x1}; Distance = |${dy}| = ${fmt(dist, 4)}.`],
        };
      }
      const m = dy / dx;
      const b = y1 - m * x1;
      const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
      return {
        primaryValue: fmt(m, 4),
        primaryUnit: 'slope (m)',
        primaryLabel: `Line y = ${fmt(m, 3)}x ${b >= 0 ? '+' : '−'} ${fmt(Math.abs(b), 3)}`,
        secondaryOutputs: [
          { label: 'Euclidean Distance (d)', value: fmt(dist, 4) },
          { label: 'Y-Intercept (b)', value: fmt(b, 4) },
          { label: 'Midpoint (M)', value: `(${fmt(mx, 3)}, ${fmt(my, 3)})` },
          { label: 'Inclination Angle', value: `${fmt(angleDeg, 2)}°` },
        ],
        steps: [
          `m = (${y2} − ${y1}) ÷ (${x2} − ${x1}) = ${fmt(m, 4)}.`,
          `Distance = √(${dx}² + ${dy}²) = ${fmt(dist, 4)}; Midpoint = (${fmt(mx, 2)}, ${fmt(my, 2)}).`,
        ],
      };
    },
  },

  // 638. Quadratic Vertex, Focus & Discriminant Calculator
  {
    slug: 'quadratic-vertex-discriminant-calculator',
    title: 'Parabola Vertex, Focus & Completing-the-Square Calculator',
    category: 'math',
    formulaDisplay: 'y = ax² + bx + c = a(x − h)² + k,  h = −b/(2a)',
    inputs: [
      { id: 'a', label: 'Coefficient a (≠ 0)', type: 'number', defaultValue: 2, min: -1e6, max: 1e6, step: 0.5 },
      { id: 'b', label: 'Coefficient b', type: 'number', defaultValue: -8, min: -1e6, max: 1e6, step: 0.5 },
      { id: 'c', label: 'Constant c', type: 'number', defaultValue: 5, min: -1e6, max: 1e6, step: 0.5 },
    ],
    calculate: (v) => {
      const a = parseNum(v.a);
      const b = parseNum(v.b);
      const c = parseNum(v.c);
      if ([a, b, c].some(Number.isNaN)) return calcError('Enter valid coefficients a, b, c.');
      if (a === 0) return calcError('Coefficient a must be non-zero for a parabola.');
      const h = -b / (2 * a);
      const k = a * h * h + b * h + c;
      const disc = b * b - 4 * a * c;
      const p = 1 / (4 * a);
      const focusY = k + p;
      const directrixY = k - p;
      return {
        primaryValue: `(${fmt(h, 4)}, ${fmt(k, 4)})`,
        primaryUnit: 'vertex',
        primaryLabel: `Vertex Form: ${fmt(a, 2)}(x ${h >= 0 ? '−' : '+'} ${fmt(Math.abs(h), 2)})² ${k >= 0 ? '+' : '−'} ${fmt(Math.abs(k), 2)}`,
        secondaryOutputs: [
          { label: 'Discriminant (b² − 4ac)', value: fmt(disc, 4) },
          { label: 'Focus Point', value: `(${fmt(h, 4)}, ${fmt(focusY, 4)})` },
          { label: 'Directrix Line', value: `y = ${fmt(directrixY, 4)}` },
          { label: 'Axis of Symmetry', value: `x = ${fmt(h, 4)}` },
        ],
        steps: [
          `h = −(${b}) ÷ (2×${a}) = ${fmt(h, 4)}; k = f(${fmt(h, 4)}) = ${fmt(k, 4)}.`,
          `Focal distance p = 1/(4a) = ${fmt(p, 4)} → Focus (${fmt(h, 3)}, ${fmt(focusY, 3)}).`,
        ],
      };
    },
  },

  // 639. Cubic Equation Solver
  {
    slug: 'cubic-equation-solver-calculator',
    title: 'Cubic Equation (ax³ + bx² + cx + d = 0) Solver',
    category: 'math',
    formulaDisplay: 'Depressed Cubic t³ + pt + q = 0 via Cardano / Trigonometric Method',
    inputs: [
      { id: 'a', label: 'a (x³)', type: 'number', defaultValue: 1, min: -1e6, max: 1e6, step: 1 },
      { id: 'b', label: 'b (x²)', type: 'number', defaultValue: -6, min: -1e6, max: 1e6, step: 1 },
      { id: 'c', label: 'c (x)', type: 'number', defaultValue: 11, min: -1e6, max: 1e6, step: 1 },
      { id: 'd', label: 'd (constant)', type: 'number', defaultValue: -6, min: -1e6, max: 1e6, step: 1 },
    ],
    calculate: (v) => {
      const a = parseNum(v.a);
      const b = parseNum(v.b);
      const c = parseNum(v.c);
      const d = parseNum(v.d);
      if ([a, b, c, d].some(Number.isNaN)) return calcError('Enter valid cubic coefficients.');
      if (a === 0) return calcError('Coefficient a must be non-zero for a cubic equation.');
      const B = b / a;
      const C = c / a;
      const D = d / a;
      const p = C - (B * B) / 3;
      const q = (2 * B * B * B) / 27 - (B * C) / 3 + D;
      const disc = (q * q) / 4 + (p * p * p) / 27;
      const shift = -B / 3;
      if (disc > 1e-12) {
        const s = Math.sqrt(disc);
        const u = Math.cbrt(-q / 2 + s);
        const w = Math.cbrt(-q / 2 - s);
        const x1 = u + w + shift;
        const realPart = -(u + w) / 2 + shift;
        const imagPart = (Math.sqrt(3) / 2) * Math.abs(u - w);
        return {
          primaryValue: fmt(x1, 4),
          primaryUnit: 'real root',
          primaryLabel: '1 Real + 2 Complex Conjugate Roots',
          secondaryOutputs: [
            { label: 'Real Root (x₁)', value: fmt(x1, 5) },
            { label: 'Complex Roots (x₂, x₃)', value: `${fmt(realPart, 4)} ± ${fmt(imagPart, 4)}i` },
            { label: 'Cubic Discriminant Δ', value: fmt(disc, 5) },
          ],
          steps: [`p=${fmt(p, 4)}, q=${fmt(q, 4)}, Δ=${fmt(disc, 5)} > 0 → 1 real root x₁ = ${fmt(x1, 4)}.`],
        };
      }
      if (Math.abs(disc) <= 1e-12) {
        const u = Math.cbrt(-q / 2);
        const x1 = 2 * u + shift;
        const x2 = -u + shift;
        return {
          primaryValue: fmt(x1, 4),
          primaryUnit: 'roots',
          primaryLabel: 'Repeated Real Roots',
          secondaryOutputs: [
            { label: 'Root x₁', value: fmt(x1, 5) },
            { label: 'Double Root x₂ = x₃', value: fmt(x2, 5) },
          ],
          steps: [`Δ ≈ 0 → Real roots x₁ = ${fmt(x1, 4)}, x₂ = x₃ = ${fmt(x2, 4)}.`],
        };
      }
      const r = 2 * Math.sqrt(-p / 3);
      const phi = Math.acos(Math.max(-1, Math.min(1, (-q / 2) / Math.sqrt((-p / 3) ** 3))));
      const roots = [0, 1, 2].map((k) => r * Math.cos((phi + 2 * Math.PI * k) / 3) + shift).sort((m, n) => m - n);
      return {
        primaryValue: fmt(roots[0], 4),
        primaryUnit: 'roots',
        primaryLabel: `3 Distinct Real Roots: ${roots.map((x) => fmt(x, 3)).join(', ')}`,
        secondaryOutputs: [
          { label: 'Root x₁', value: fmt(roots[0], 5) },
          { label: 'Root x₂', value: fmt(roots[1], 5) },
          { label: 'Root x₃', value: fmt(roots[2], 5) },
        ],
        steps: [`Δ < 0 (Casus Irreducibilis): Viète trigonometric roots = ${roots.map((x) => fmt(x, 4)).join(', ')}.`],
      };
    },
  },

  // 640. Arithmetic Sequence & Series Calculator
  {
    slug: 'arithmetic-sequence-series-calculator',
    title: 'Arithmetic Sequence & Partial Sum Calculator',
    category: 'math',
    formulaDisplay: 'a_n = a₁ + (n − 1)d   |   S_n = n(a₁ + a_n) / 2',
    inputs: [
      { id: 'a1', label: 'First Term (a₁)', type: 'number', defaultValue: 5, min: -1e9, max: 1e9, step: 1 },
      { id: 'd', label: 'Common Difference (d)', type: 'number', defaultValue: 3, min: -1e9, max: 1e9, step: 1 },
      { id: 'n', label: 'Term Index (n)', type: 'number', defaultValue: 20, min: 1, max: 1e6, step: 1 },
    ],
    calculate: (v) => {
      const a1 = parseNum(v.a1);
      const d = parseNum(v.d);
      const n = Math.round(parseNum(v.n));
      if ([a1, d, n].some(Number.isNaN) || n < 1) return calcError('Enter valid numeric sequence inputs (n >= 1).');
      const an = a1 + (n - 1) * d;
      const sn = (n * (a1 + an)) / 2;
      return {
        primaryValue: fmt(an, 4),
        primaryUnit: `a_${n}`,
        primaryLabel: `${n}-th Term of Sequence`,
        secondaryOutputs: [
          { label: `Sum of First ${n} Terms (S_n)`, value: fmt(sn, 4) },
          { label: 'Average Term Value', value: fmt((a1 + an) / 2, 4) },
        ],
        steps: [
          `a_${n} = ${a1} + (${n} − 1)×${d} = ${fmt(an, 4)}.`,
          `S_${n} = ${n} × (${a1} + ${fmt(an, 4)}) ÷ 2 = ${fmt(sn, 4)}.`,
        ],
      };
    },
  },

  // 641. Geometric Sequence & Infinite Series Calculator
  {
    slug: 'geometric-sequence-series-calculator',
    title: 'Geometric Sequence, Finite Sum & Infinite Convergence Calculator',
    category: 'math',
    formulaDisplay: 'a_n = a₁·r^(n−1)   |   S_∞ = a₁/(1 − r) for |r| < 1',
    inputs: [
      { id: 'a1', label: 'First Term (a₁)', type: 'number', defaultValue: 12, min: -1e9, max: 1e9, step: 1 },
      { id: 'r', label: 'Common Ratio (r)', type: 'number', defaultValue: 0.5, min: -100, max: 100, step: 0.1 },
      { id: 'n', label: 'Number of Terms (n)', type: 'number', defaultValue: 10, min: 1, max: 200, step: 1 },
    ],
    calculate: (v) => {
      const a1 = parseNum(v.a1);
      const r = parseNum(v.r);
      const n = Math.min(200, Math.round(parseNum(v.n)));
      if ([a1, r, n].some(Number.isNaN) || n < 1) return calcError('Enter valid geometric ratio and n >= 1.');
      const an = a1 * Math.pow(r, n - 1);
      const sn = Math.abs(r - 1) < 1e-12 ? a1 * n : (a1 * (1 - Math.pow(r, n))) / (1 - r);
      const sinf = Math.abs(r) < 1 ? a1 / (1 - r) : null;
      return {
        primaryValue: fmt(sn, 6),
        primaryUnit: `S_${n}`,
        primaryLabel: `Finite Geometric Sum (First ${n} Terms)`,
        secondaryOutputs: [
          { label: `${n}-th Term (a_${n})`, value: fmt(an, 6) },
          { label: 'Infinite Series Sum (S_∞)', value: sinf !== null ? fmt(sinf, 6) : 'Diverges (|r| ≥ 1)' },
        ],
        steps: [
          `a_${n} = ${a1} × (${r})^${n - 1} = ${fmt(an, 6)}.`,
          `S_${n} = ${fmt(sn, 6)}${sinf !== null ? `; S_∞ = ${a1}/(1 − ${r}) = ${fmt(sinf, 6)}.` : ' (Infinite series diverges).' }`,
        ],
      };
    },
  },

  // 642. Fibonacci & Golden Ratio Calculator
  {
    slug: 'fibonacci-golden-ratio-calculator',
    title: 'Fibonacci Number & Golden Ratio (φ) Calculator',
    category: 'math',
    formulaDisplay: 'F_n = F_{n−1} + F_{n−2}   |   φ = (1 + √5) / 2 ≈ 1.618034',
    inputs: [
      { id: 'n', label: 'Fibonacci Index n (0 to 70)', type: 'number', defaultValue: 15, min: 0, max: 70, step: 1 },
    ],
    calculate: (v) => {
      const n = Math.round(parseNum(v.n));
      if (Number.isNaN(n) || n < 0 || n > 70) return calcError('Enter an integer n between 0 and 70.');
      let a = 0;
      let b = 1;
      for (let i = 0; i < n; i++) {
        const next = a + b;
        a = b;
        b = next;
      }
      const phi = (1 + Math.sqrt(5)) / 2;
      const ratio = n >= 2 ? b / a : phi;
      return {
        primaryValue: a,
        primaryUnit: `F_${n}`,
        primaryLabel: `${n}-th Fibonacci Number`,
        secondaryOutputs: [
          { label: `Next Fibonacci F_${n + 1}`, value: b },
          { label: `Cumulative Sum Σ F_0..F_${n}`, value: b + a - 1 },
          { label: 'Convergence Ratio F_{n+1}/F_n', value: fmt(ratio, 8) },
        ],
        steps: [`Iterative Fibonacci yields F_${n} = ${a.toLocaleString()} (Next F_${n + 1} = ${b.toLocaleString()}, φ ≈ ${fmt(phi, 6)}).`],
      };
    },
  },

  // 643. Complex Number Polar & Arithmetic Calculator
  {
    slug: 'complex-number-polar-calculator',
    title: 'Complex Number Arithmetic & Polar Form Calculator',
    category: 'math',
    formulaDisplay: 'z = a + bi = r(cosθ + i·sinθ),  r = √(a² + b²)',
    inputs: [
      { id: 'a1', label: 'z₁ Real Part (a₁)', type: 'number', defaultValue: 3, min: -1e8, max: 1e8, step: 0.5 },
      { id: 'b1', label: 'z₁ Imaginary Part (b₁)', type: 'number', defaultValue: 4, min: -1e8, max: 1e8, step: 0.5 },
      { id: 'a2', label: 'z₂ Real Part (a₂)', type: 'number', defaultValue: 1, min: -1e8, max: 1e8, step: 0.5 },
      { id: 'b2', label: 'z₂ Imaginary Part (b₂)', type: 'number', defaultValue: -2, min: -1e8, max: 1e8, step: 0.5 },
    ],
    calculate: (v) => {
      const a1 = parseNum(v.a1);
      const b1 = parseNum(v.b1);
      const a2 = parseNum(v.a2);
      const b2 = parseNum(v.b2);
      if ([a1, b1, a2, b2].some(Number.isNaN)) return calcError('Enter valid complex components.');
      const mod1 = Math.hypot(a1, b1);
      const arg1Deg = (Math.atan2(b1, a1) * 180) / Math.PI;
      const prodR = a1 * a2 - b1 * b2;
      const prodI = a1 * b2 + b1 * a2;
      const denom = a2 * a2 + b2 * b2;
      const divStr =
        denom > 0
          ? `${fmt((a1 * a2 + b1 * b2) / denom, 3)} ${b1 * a2 - a1 * b2 >= 0 ? '+' : '−'} ${fmt(Math.abs((b1 * a2 - a1 * b2) / denom), 3)}i`
          : 'Undefined (z₂ = 0)';
      return {
        primaryValue: `${fmt(mod1, 4)} ∠ ${fmt(arg1Deg, 2)}°`,
        primaryUnit: 'Polar z₁',
        primaryLabel: `Polar Form of z₁ = ${a1} ${b1 >= 0 ? '+' : '−'} ${Math.abs(b1)}i`,
        secondaryOutputs: [
          { label: 'z₁ + z₂', value: `${fmt(a1 + a2, 3)} ${b1 + b2 >= 0 ? '+' : '−'} ${fmt(Math.abs(b1 + b2), 3)}i` },
          { label: 'z₁ × z₂', value: `${fmt(prodR, 3)} ${prodI >= 0 ? '+' : '−'} ${fmt(Math.abs(prodI), 3)}i` },
          { label: 'z₁ ÷ z₂', value: divStr },
        ],
        steps: [
          `|z₁| = √(${a1}² + ${b1}²) = ${fmt(mod1, 4)}; Arg(z₁) = ${fmt(arg1Deg, 2)}°.`,
          `Product z₁·z₂ = ${fmt(prodR, 3)} + ${fmt(prodI, 3)}i.`,
        ],
      };
    },
  },

  // 644. 3D Vector Dot & Cross Product Calculator
  {
    slug: 'vector-dot-cross-product-calculator',
    title: '3D Vector Dot Product, Cross Product & Angle Calculator',
    category: 'math',
    formulaDisplay: 'A · B = |A||B|cosθ   |   A × B = (AyBz − AzBy, AzBx − AxBz, AxBy − AyBx)',
    inputs: [
      { id: 'ax', label: 'Vector A_x', type: 'number', defaultValue: 3, min: -1e7, max: 1e7, step: 1 },
      { id: 'ay', label: 'Vector A_y', type: 'number', defaultValue: 4, min: -1e7, max: 1e7, step: 1 },
      { id: 'az', label: 'Vector A_z', type: 'number', defaultValue: 0, min: -1e7, max: 1e7, step: 1 },
      { id: 'bx', label: 'Vector B_x', type: 'number', defaultValue: 4, min: -1e7, max: 1e7, step: 1 },
      { id: 'by', label: 'Vector B_y', type: 'number', defaultValue: -3, min: -1e7, max: 1e7, step: 1 },
      { id: 'bz', label: 'Vector B_z', type: 'number', defaultValue: 5, min: -1e7, max: 1e7, step: 1 },
    ],
    calculate: (v) => {
      const [ax, ay, az, bx, by, bz] = [v.ax, v.ay, v.az, v.bx, v.by, v.bz].map(parseNum);
      if ([ax, ay, az, bx, by, bz].some(Number.isNaN)) return calcError('Enter valid 3D vector components.');
      const dot = ax * bx + ay * by + az * bz;
      const magA = Math.hypot(ax, ay, az);
      const magB = Math.hypot(bx, by, bz);
      const cx = ay * bz - az * by;
      const cy = az * bx - ax * bz;
      const cz = ax * by - ay * bx;
      const magCross = Math.hypot(cx, cy, cz);
      const angleDeg = magA > 0 && magB > 0 ? (Math.acos(Math.max(-1, Math.min(1, dot / (magA * magB)))) * 180) / Math.PI : 0;
      return {
        primaryValue: fmt(dot, 4),
        primaryUnit: 'A · B',
        primaryLabel: 'Scalar Dot Product',
        secondaryOutputs: [
          { label: 'Cross Product (A × B)', value: `(${fmt(cx, 2)}, ${fmt(cy, 2)}, ${fmt(cz, 2)})` },
          { label: '|A × B| (Parallelogram Area)', value: fmt(magCross, 4) },
          { label: 'Angle θ Between Vectors', value: `${fmt(angleDeg, 2)}°` },
          { label: '|A| and |B| Magnitudes', value: `${fmt(magA, 3)} & ${fmt(magB, 3)}` },
        ],
        steps: [
          `Dot product A·B = (${ax})(${bx}) + (${ay})(${by}) + (${az})(${bz}) = ${fmt(dot, 4)}.`,
          `Cross product = (${fmt(cx, 2)}, ${fmt(cy, 2)}, ${fmt(cz, 2)}); θ = ${fmt(angleDeg, 2)}°.`,
        ],
      };
    },
  },

  // 645. 2x2 Matrix Eigenvalues Calculator
  {
    slug: 'eigenvalue-2x2-matrix-calculator',
    title: '2×2 Matrix Eigenvalues, Trace & Determinant Calculator',
    category: 'math',
    formulaDisplay: 'λ = (Tr ± √(Tr² − 4·Det)) / 2',
    inputs: [
      { id: 'a11', label: 'a₁₁ (Row 1, Col 1)', type: 'number', defaultValue: 4, min: -1e7, max: 1e7, step: 0.5 },
      { id: 'a12', label: 'a₁₂ (Row 1, Col 2)', type: 'number', defaultValue: 1, min: -1e7, max: 1e7, step: 0.5 },
      { id: 'a21', label: 'a₂₁ (Row 2, Col 1)', type: 'number', defaultValue: 2, min: -1e7, max: 1e7, step: 0.5 },
      { id: 'a22', label: 'a₂₂ (Row 2, Col 2)', type: 'number', defaultValue: 3, min: -1e7, max: 1e7, step: 0.5 },
    ],
    calculate: (v) => {
      const [a, b, c, d] = [v.a11, v.a12, v.a21, v.a22].map(parseNum);
      if ([a, b, c, d].some(Number.isNaN)) return calcError('Enter valid numeric matrix entries.');
      const tr = a + d;
      const det = a * d - b * c;
      const disc = tr * tr - 4 * det;
      if (disc >= 0) {
        const s = Math.sqrt(disc);
        const l1 = (tr + s) / 2;
        const l2 = (tr - s) / 2;
        return {
          primaryValue: `${fmt(l1, 4)}, ${fmt(l2, 4)}`,
          primaryUnit: 'λ₁, λ₂',
          primaryLabel: 'Real Eigenvalues',
          secondaryOutputs: [
            { label: 'Matrix Trace (λ₁ + λ₂)', value: fmt(tr, 4) },
            { label: 'Matrix Determinant (λ₁ · λ₂)', value: fmt(det, 4) },
            { label: 'Characteristic Polynomial', value: `λ² − (${fmt(tr, 2)})λ + (${fmt(det, 2)}) = 0` },
          ],
          steps: [`λ = (${fmt(tr, 3)} ± √${fmt(disc, 3)}) ÷ 2 → λ₁ = ${fmt(l1, 4)}, λ₂ = ${fmt(l2, 4)}.`],
        };
      }
      const re = tr / 2;
      const im = Math.sqrt(-disc) / 2;
      return {
        primaryValue: `${fmt(re, 3)} ± ${fmt(im, 3)}i`,
        primaryUnit: 'complex λ',
        primaryLabel: 'Complex Conjugate Eigenvalues',
        secondaryOutputs: [
          { label: 'Matrix Trace', value: fmt(tr, 4) },
          { label: 'Matrix Determinant', value: fmt(det, 4) },
        ],
        steps: [`Discriminant ${fmt(disc, 3)} < 0 → Complex eigenvalues ${fmt(re, 3)} ± ${fmt(im, 3)}i.`],
      };
    },
  },

  // 646. Binary / Hex / Octal Base Converter
  {
    slug: 'binary-hex-octal-base-converter',
    title: 'Binary, Octal, Decimal & Hexadecimal Base Converter',
    category: 'math',
    formulaDisplay: 'Unsigned Integer Base Conversion (Radix 2, 8, 10, 16)',
    inputs: [
      { id: 'valueStr', label: 'Input Number String', type: 'text', defaultValue: '255', placeholder: 'e.g. 255, FF, 11111111' },
      {
        id: 'fromBase',
        label: 'Input Number Base',
        type: 'select',
        defaultValue: '10',
        options: [
          { label: 'Decimal (Base 10)', value: '10' },
          { label: 'Binary (Base 2)', value: '2' },
          { label: 'Hexadecimal (Base 16)', value: '16' },
          { label: 'Octal (Base 8)', value: '8' },
        ],
      },
    ],
    calculate: (v) => {
      const raw = String(v.valueStr ?? '').trim().replace(/^0[xXbBoO]/, '');
      const base = parseInt(String(v.fromBase || '10'), 10);
      if (!raw) return calcError('Enter a non-empty number to convert.');
      const validators: Record<number, RegExp> = {
        2: /^[01]+$/,
        8: /^[0-7]+$/,
        10: /^[0-9]+$/,
        16: /^[0-9a-fA-F]+$/,
      };
      if (!validators[base]?.test(raw)) return calcError(`Invalid digits for base ${base}.`);
      const dec = parseInt(raw, base);
      if (!Number.isSafeInteger(dec) || dec > 9007199254740991) return calcError('Value exceeds 53-bit JavaScript safe integer range.');
      return {
        primaryValue: dec,
        primaryUnit: 'Base 10',
        primaryLabel: 'Decimal Value',
        secondaryOutputs: [
          { label: 'Binary (Base 2)', value: dec.toString(2) },
          { label: 'Hexadecimal (Base 16)', value: `0x${dec.toString(16).toUpperCase()}` },
          { label: 'Octal (Base 8)', value: `0o${dec.toString(8)}` },
        ],
        steps: [`Parsed "${raw}" in base ${base} → Decimal ${dec} = 0b${dec.toString(2)} = 0x${dec.toString(16).toUpperCase()}.`],
      };
    },
  },

  // 647. Roman Numeral Converter
  {
    slug: 'roman-numeral-converter-calculator',
    title: 'Roman Numeral to Integer Converter',
    category: 'math',
    formulaDisplay: 'Standard Additive/Subtractive Notation (1 to 3,999)',
    inputs: [
      {
        id: 'mode',
        label: 'Direction',
        type: 'select',
        defaultValue: 'to_roman',
        options: [
          { label: 'Integer → Roman Numeral', value: 'to_roman' },
          { label: 'Roman Numeral → Integer', value: 'to_int' },
        ],
      },
      { id: 'intVal', label: 'Integer (1 to 3999)', type: 'number', defaultValue: 2026, min: 1, max: 3999, step: 1, visibleWhen: (v) => String(v.mode || 'to_roman') === 'to_roman' },
      { id: 'romanVal', label: 'Roman Numeral String', type: 'text', defaultValue: 'MMXXVI', visibleWhen: (v) => String(v.mode || 'to_roman') === 'to_int' },
    ],
    calculate: (v) => {
      const mode = String(v.mode || 'to_roman');
      const table: [number, string][] = [
        [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
        [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
        [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
      ];
      if (mode === 'to_roman') {
        const n = Math.round(parseNum(v.intVal));
        if (Number.isNaN(n) || n < 1 || n > 3999) return calcError('Enter an integer from 1 to 3,999.');
        let rem = n;
        let out = '';
        for (const [val, sym] of table) {
          while (rem >= val) {
            out += sym;
            rem -= val;
          }
        }
        return {
          primaryValue: out,
          primaryUnit: 'Roman',
          primaryLabel: `${n} in Roman Numerals`,
          secondaryOutputs: [{ label: 'Decimal Verification', value: n }],
          steps: [`Decomposed ${n} using greedy subtractive Roman symbols → ${out}.`],
        };
      }
      const str = String(v.romanVal ?? '').trim().toUpperCase();
      if (!/^[IVXLCDM]+$/.test(str)) return calcError('Enter valid Roman characters (I, V, X, L, C, D, M).');
      const map: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
      let total = 0;
      for (let i = 0; i < str.length; i++) {
        const cur = map[str[i]];
        const nxt = i + 1 < str.length ? map[str[i + 1]] : 0;
        total += cur < nxt ? -cur : cur;
      }
      return {
        primaryValue: total,
        primaryUnit: 'decimal',
        primaryLabel: `Integer Value of ${str}`,
        secondaryOutputs: [{ label: 'Input Symbol', value: str }],
        steps: [`Evaluated additive/subtractive tokens of "${str}" = ${total}.`],
      };
    },
  },

  // 648. Modulo & Modular Inverse Calculator
  {
    slug: 'modulo-modular-inverse-calculator',
    title: 'Modulo Remainder, Power Mod & Modular Inverse Calculator',
    category: 'math',
    formulaDisplay: 'a mod m   |   a⁻¹ mod m via Extended Euclidean Algorithm (gcd(a,m)=1)',
    inputs: [
      { id: 'a', label: 'Dividend / Base (a)', type: 'number', defaultValue: 17, min: -1e9, max: 1e9, step: 1 },
      { id: 'm', label: 'Modulus (m > 0)', type: 'number', defaultValue: 43, min: 1, max: 1e9, step: 1 },
      { id: 'exp', label: 'Exponent b for (a^b mod m)', type: 'number', defaultValue: 3, min: 0, max: 100000, step: 1 },
    ],
    calculate: (v) => {
      const a = Math.round(parseNum(v.a));
      const m = Math.round(parseNum(v.m));
      const exp = Math.round(parseNum(v.exp ?? 1));
      if ([a, m, exp].some(Number.isNaN) || m <= 0 || exp < 0) return calcError('Enter integers with m > 0 and exponent >= 0.');
      const modPos = ((a % m) + m) % m;
      // Extended GCD for inverse
      let t = 0, newt = 1, r = m, newr = modPos;
      while (newr !== 0) {
        const q = Math.floor(r / newr);
        [t, newt] = [newt, t - q * newt];
        [r, newr] = [newr, r - q * newr];
      }
      const inv = r === 1 ? ((t % m) + m) % m : null;
      // Fast modular exponentiation
      let resPow = 1 % m;
      let base = modPos;
      let e = exp;
      while (e > 0) {
        if (e % 2 === 1) resPow = (resPow * base) % m;
        base = (base * base) % m;
        e = Math.floor(e / 2);
      }
      return {
        primaryValue: modPos,
        primaryUnit: `mod ${m}`,
        primaryLabel: `${a} mod ${m}`,
        secondaryOutputs: [
          { label: `Modular Inverse (${a}⁻¹ mod ${m})`, value: inv !== null ? inv : 'Does Not Exist (gcd ≠ 1)' },
          { label: `Modular Power (${a}^${exp} mod ${m})`, value: resPow },
        ],
        steps: [
          `Canonical positive remainder: ${a} ≡ ${modPos} (mod ${m}).`,
          inv !== null ? `Extended GCD yields multiplicative inverse ${inv} (${modPos}×${inv} ≡ 1 mod ${m}).` : `gcd(${a},${m}) ≠ 1 so no inverse exists.`,
        ],
      };
    },
  },

  // 649. Factorial & Double Factorial Calculator
  {
    slug: 'factorial-double-factorial-calculator',
    title: 'Factorial (n!), Double Factorial (n!!) & Trailing Zeros Calculator',
    category: 'math',
    formulaDisplay: 'n! = n×(n−1)…1   |   Zeros(n!) = Σ floor(n / 5^k)',
    inputs: [
      { id: 'n', label: 'Non-Negative Integer n (0 to 170)', type: 'number', defaultValue: 10, min: 0, max: 170, step: 1 },
    ],
    calculate: (v) => {
      const n = Math.round(parseNum(v.n));
      if (Number.isNaN(n) || n < 0 || n > 170) return calcError('Enter an integer n between 0 and 170.');
      let fact = 1;
      for (let i = 2; i <= n; i++) fact *= i;
      let dfact = 1;
      for (let i = n; i >= 2; i -= 2) dfact *= i;
      let zeros = 0;
      for (let p = 5; p <= n; p *= 5) zeros += Math.floor(n / p);
      return {
        primaryValue: n <= 20 ? fact : fact.toExponential(6),
        primaryUnit: `${n}!`,
        primaryLabel: `Factorial ${n}!`,
        secondaryOutputs: [
          { label: `Double Factorial (${n}!!)`, value: dfact <= 1e15 ? dfact : dfact.toExponential(6) },
          { label: 'Trailing Zeros in n!', value: zeros },
        ],
        steps: [
          `${n}! = ${n <= 20 ? fact.toLocaleString() : fact.toExponential(6)}.`,
          `Trailing zeros = Σ ⌊${n}/5^k⌋ = ${zeros}.`,
        ],
      };
    },
  },

  // 650. Proportion Cross-Multiply Solver
  {
    slug: 'proportion-cross-multiply-calculator',
    title: 'Ratio & Proportion Cross-Multiplication Solver (A : B = C : x)',
    category: 'math',
    formulaDisplay: 'A / B = C / x  ⟹  x = (B × C) / A',
    inputs: [
      { id: 'a', label: 'Value A', type: 'number', defaultValue: 12, min: -1e10, max: 1e10, step: 1 },
      { id: 'b', label: 'Value B', type: 'number', defaultValue: 18, min: -1e10, max: 1e10, step: 1 },
      { id: 'c', label: 'Value C', type: 'number', defaultValue: 30, min: -1e10, max: 1e10, step: 1 },
    ],
    calculate: (v) => {
      const [a, b, c] = [v.a, v.b, v.c].map(parseNum);
      if ([a, b, c].some(Number.isNaN)) return calcError('Enter valid numeric proportion values.');
      if (a === 0) return calcError('Value A cannot be zero (division by zero).');
      const x = (b * c) / a;
      return {
        primaryValue: fmt(x, 6),
        primaryUnit: 'x',
        primaryLabel: `Solved Unknown (${a} : ${b} = ${c} : ${fmt(x, 4)})`,
        secondaryOutputs: [
          { label: 'Scale Factor (C / A)', value: `${fmt(c / a, 4)}×` },
          { label: 'Cross Product (B × C)', value: fmt(b * c, 4) },
        ],
        steps: [`Cross-multiply: ${a}·x = ${b}·${c} = ${fmt(b * c, 4)} → x = ${fmt(x, 6)}.`],
      };
    },
  },

  // 651. Multi-Part Ratio Simplifier & Allocation Calculator
  {
    slug: 'ratio-simplifier-scaler-calculator',
    title: 'Ratio Simplifier & Proportional Sharing Calculator',
    category: 'math',
    formulaDisplay: 'Simplified = (A, B, C) ÷ GCD(A, B, C)',
    inputs: [
      { id: 'partA', label: 'Part A Weight', type: 'number', defaultValue: 24, min: 0, max: 1e9, step: 1 },
      { id: 'partB', label: 'Part B Weight', type: 'number', defaultValue: 36, min: 0, max: 1e9, step: 1 },
      { id: 'partC', label: 'Part C Weight (0 to omit)', type: 'number', defaultValue: 60, min: 0, max: 1e9, step: 1 },
      { id: 'totalPool', label: 'Total Quantity / Budget to Allocate', type: 'number', defaultValue: 1000, min: 0, max: 1e12, step: 50 },
    ],
    calculate: (v) => {
      const a = Math.round(parseNum(v.partA));
      const b = Math.round(parseNum(v.partB));
      const c = Math.round(parseNum(v.partC ?? 0));
      const pool = parseNum(v.totalPool ?? 0);
      if ([a, b, c, pool].some(Number.isNaN) || a < 0 || b < 0 || c < 0 || pool < 0 || a + b + c <= 0) return calcError('Enter non-negative weights with positive sum.');
      const gcd2 = (x: number, y: number): number => (y === 0 ? x : gcd2(y, x % y));
      const g = c > 0 ? gcd2(gcd2(a, b), c) : gcd2(a, b);
      const sum = a + b + c;
      const sA = a / g, sB = b / g, sC = c / g;
      const ratioStr = c > 0 ? `${sA} : ${sB} : ${sC}` : `${sA} : ${sB}`;
      return {
        primaryValue: ratioStr,
        primaryUnit: 'simplified',
        primaryLabel: 'Lowest-Terms Integer Ratio',
        secondaryOutputs: [
          { label: 'Share A Allocation', value: `${fmt((a / sum) * pool, 2)} (${fmt((a / sum) * 100, 1)}%)` },
          { label: 'Share B Allocation', value: `${fmt((b / sum) * pool, 2)} (${fmt((b / sum) * 100, 1)}%)` },
          { label: 'Share C Allocation', value: c > 0 ? `${fmt((c / sum) * pool, 2)} (${fmt((c / sum) * 100, 1)}%)` : 'Omitted' },
        ],
        steps: [`GCD = ${g} → Simplified ratio = ${ratioStr}. Total parts = ${sum}.`],
      };
    },
  },

  // 652. Percent Error & Percent Difference Calculator
  {
    slug: 'percentage-error-difference-calculator',
    title: 'Percent Error & Relative Percent Difference Calculator',
    category: 'math',
    formulaDisplay: '% Error = |Observed − Accepted| / |Accepted| × 100%',
    inputs: [
      { id: 'observed', label: 'Measured / Experimental Value', type: 'number', defaultValue: 9.65, min: -1e12, max: 1e12, step: 0.1 },
      { id: 'accepted', label: 'Accepted / Theoretical Value', type: 'number', defaultValue: 9.81, min: -1e12, max: 1e12, step: 0.1 },
    ],
    calculate: (v) => {
      const obs = parseNum(v.observed);
      const acc = parseNum(v.accepted);
      if (Number.isNaN(obs) || Number.isNaN(acc)) return calcError('Enter valid numeric measurements.');
      if (acc === 0) return calcError('Accepted true value cannot be zero for % error.');
      const absErr = Math.abs(obs - acc);
      const pctErr = (absErr / Math.abs(acc)) * 100;
      const avgAbs = (Math.abs(obs) + Math.abs(acc)) / 2;
      const pctDiff = avgAbs > 0 ? (absErr / avgAbs) * 100 : 0;
      return {
        primaryValue: fmt(pctErr, 3),
        primaryUnit: '%',
        primaryLabel: 'Percent Error',
        secondaryOutputs: [
          { label: 'Absolute Error', value: fmt(absErr, 5) },
          { label: 'Signed Bias (Obs − True)', value: `${obs - acc >= 0 ? '+' : ''}${fmt(obs - acc, 5)}` },
          { label: 'Symmetric % Difference', value: `${fmt(pctDiff, 3)}%` },
        ],
        steps: [`|${obs} − ${acc}| ÷ |${acc}| × 100% = ${fmt(pctErr, 3)}%.`],
      };
    },
  },

  // 653. Mixed Number & Improper Fraction Converter
  {
    slug: 'mixed-number-improper-fraction-calculator',
    title: 'Mixed Number to Improper Fraction & Decimal Converter',
    category: 'math',
    formulaDisplay: 'w n/d = (w·d + n) / d',
    inputs: [
      { id: 'whole', label: 'Whole Number Part (0 if improper fraction)', type: 'number', defaultValue: 3, min: -1e6, max: 1e6, step: 1 },
      { id: 'num', label: 'Numerator', type: 'number', defaultValue: 4, min: -1e9, max: 1e9, step: 1 },
      { id: 'den', label: 'Denominator (≠ 0)', type: 'number', defaultValue: 12, min: 1, max: 1e9, step: 1 },
    ],
    calculate: (v) => {
      const w = Math.trunc(parseNum(v.whole ?? 0));
      const n = Math.trunc(parseNum(v.num));
      const d = Math.trunc(parseNum(v.den));
      if ([w, n, d].some(Number.isNaN) || d === 0) return calcError('Enter valid integers with non-zero denominator.');
      const sign = w < 0 || (w === 0 && n < 0) ? -1 : 1;
      const totalNumAbs = Math.abs(w) * Math.abs(d) + Math.abs(n);
      const totalDenAbs = Math.abs(d);
      const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
      const g = gcd(totalNumAbs, totalDenAbs);
      const simpNum = sign * (totalNumAbs / g);
      const simpDen = totalDenAbs / g;
      const mixedWhole = Math.trunc(simpNum / simpDen);
      const mixedRem = Math.abs(simpNum % simpDen);
      return {
        primaryValue: `${simpNum}/${simpDen}`,
        primaryUnit: 'reduced improper',
        primaryLabel: 'Reduced Improper Fraction',
        secondaryOutputs: [
          { label: 'Reduced Mixed Number', value: mixedRem === 0 ? `${mixedWhole}` : `${mixedWhole} ${mixedRem}/${simpDen}` },
          { label: 'Exact Decimal Value', value: fmt(simpNum / simpDen, 6) },
          { label: 'Percentage', value: `${fmt((simpNum / simpDen) * 100, 2)}%` },
        ],
        steps: [`Reduced by GCD=${g}: ${simpNum}/${simpDen} = ${fmt(simpNum / simpDen, 6)}.`],
      };
    },
  },

  // 654. Cube Root & N-th Root Calculator
  {
    slug: 'cube-root-nth-root-calculator',
    title: 'Cube Root & Principal n-th Root Calculator',
    category: 'math',
    formulaDisplay: 'ⁿ√x = x^(1/n)',
    inputs: [
      { id: 'x', label: 'Radicand (x)', type: 'number', defaultValue: 125, min: -1e15, max: 1e15, step: 1 },
      { id: 'n', label: 'Root Index (n ≥ 2)', type: 'number', defaultValue: 3, min: 2, max: 100, step: 1 },
    ],
    calculate: (v) => {
      const x = parseNum(v.x);
      const n = Math.round(parseNum(v.n));
      if (Number.isNaN(x) || Number.isNaN(n) || n < 2) return calcError('Enter valid radicand and integer root n >= 2.');
      if (x < 0 && n % 2 === 0) return calcError('Even root of a negative number is not a real number.');
      const res = x < 0 ? -Math.pow(-x, 1 / n) : Math.pow(x, 1 / n);
      return {
        primaryValue: fmt(res, 6),
        primaryUnit: `${n}th root`,
        primaryLabel: `Real Principal Root (${n}√${x})`,
        secondaryOutputs: [
          { label: 'Cube Root (³√x)', value: fmt(Math.cbrt(x), 6) },
          { label: 'Verification (root^n)', value: fmt(Math.pow(res, n), 4) },
        ],
        steps: [`${n}√(${x}) = (${x})^(1/${n}) = ${fmt(res, 6)}.`],
      };
    },
  },

  // 655. Scientific Notation & Sig-Fig Calculator
  {
    slug: 'scientific-notation-sig-fig-calculator',
    title: 'Scientific Notation & Significant Figures Calculator',
    category: 'math',
    formulaDisplay: 'N = m × 10^k,  1 ≤ |m| < 10',
    inputs: [
      { id: 'numberInput', label: 'Decimal Number', type: 'number', defaultValue: 0.00045678, min: -1e15, max: 1e15, step: 0.0001 },
      { id: 'sigFigs', label: 'Significant Figures (1–10)', type: 'number', defaultValue: 3, min: 1, max: 10, step: 1 },
    ],
    calculate: (v) => {
      const val = parseNum(v.numberInput);
      const sf = Math.min(10, Math.max(1, Math.round(parseNum(v.sigFigs || 3))));
      if (Number.isNaN(val)) return calcError('Enter a valid numeric value.');
      const roundedStr = val.toPrecision(sf);
      const expStr = val.toExponential(sf - 1);
      const [mant, expPart] = expStr.split('e');
      const expNum = Number(expPart);
      return {
        primaryValue: `${mant} × 10^${expNum}`,
        primaryUnit: `${sf} sig figs`,
        primaryLabel: 'Normalized Scientific Notation',
        secondaryOutputs: [
          { label: `Rounded (${sf} Sig Figs)`, value: Number(roundedStr).toString() },
          { label: 'E-Notation', value: expStr },
          { label: 'Order of Magnitude', value: val === 0 ? 0 : Math.floor(Math.log10(Math.abs(val))) },
        ],
        steps: [`Normalized ${val} to ${sf} significant figures → ${mant} × 10^${expNum}.`],
      };
    },
  },

  // 656. Trigonometry Sin/Cos/Tan Solver
  {
    slug: 'trigonometry-sin-cos-tan-calculator',
    title: 'Trigonometry (sin, cos, tan, csc, sec, cot) Calculator',
    category: 'math',
    formulaDisplay: 'sin²θ + cos²θ = 1',
    inputs: [
      { id: 'angle', label: 'Angle Value (θ)', type: 'number', defaultValue: 30, min: -1e6, max: 1e6, step: 1 },
      {
        id: 'unit',
        label: 'Angle Unit',
        type: 'select',
        defaultValue: 'deg',
        options: [
          { label: 'Degrees (°)', value: 'deg' },
          { label: 'Radians (rad)', value: 'rad' },
        ],
      },
    ],
    calculate: (v) => {
      const a = parseNum(v.angle);
      const unit = String(v.unit || 'deg');
      if (Number.isNaN(a)) return calcError('Enter a valid angle.');
      const rad = unit === 'deg' ? (a * Math.PI) / 180 : a;
      const deg = unit === 'deg' ? a : (a * 180) / Math.PI;
      const s = Math.sin(rad);
      const c = Math.cos(rad);
      const tanVal = Math.abs(c) < 1e-12 ? 'Undefined' : fmt(s / c, 6);
      const cscVal = Math.abs(s) < 1e-12 ? 'Undefined' : fmt(1 / s, 6);
      const secVal = Math.abs(c) < 1e-12 ? 'Undefined' : fmt(1 / c, 6);
      return {
        primaryValue: fmt(s, 6),
        primaryUnit: 'sin(θ)',
        primaryLabel: `Trig Ratios @ ${fmt(deg, 3)}° (${fmt(rad, 5)} rad)`,
        secondaryOutputs: [
          { label: 'cos(θ)', value: fmt(c, 6) },
          { label: 'tan(θ)', value: tanVal },
          { label: 'csc(θ) / sec(θ)', value: `${cscVal} / ${secVal}` },
        ],
        steps: [`θ = ${fmt(deg, 3)}° = ${fmt(rad, 5)} rad → sin = ${fmt(s, 6)}, cos = ${fmt(c, 6)}, tan = ${tanVal}.`],
      };
    },
  },

  // 657. Inverse Trigonometry Calculator
  {
    slug: 'inverse-trig-arcsin-arccos-calculator',
    title: 'Inverse Trigonometry (arcsin, arccos, arctan) Calculator',
    category: 'math',
    formulaDisplay: 'θ = arcsin(x), arccos(x), or arctan(x)',
    inputs: [
      {
        id: 'func',
        label: 'Inverse Function',
        type: 'select',
        defaultValue: 'arcsin',
        options: [
          { label: 'arcsin(x)  [domain −1 to 1]', value: 'arcsin' },
          { label: 'arccos(x)  [domain −1 to 1]', value: 'arccos' },
          { label: 'arctan(x)  [all real numbers]', value: 'arctan' },
        ],
      },
      { id: 'x', label: 'Ratio Input (x)', type: 'number', defaultValue: 0.5, min: -1e9, max: 1e9, step: 0.05 },
    ],
    calculate: (v) => {
      const fn = String(v.func || 'arcsin');
      const x = parseNum(v.x);
      if (Number.isNaN(x)) return calcError('Enter a valid numeric input x.');
      if ((fn === 'arcsin' || fn === 'arccos') && (x < -1 || x > 1)) return calcError('Domain for arcsin and arccos requires −1 ≤ x ≤ 1.');
      const rad = fn === 'arcsin' ? Math.asin(x) : fn === 'arccos' ? Math.acos(x) : Math.atan(x);
      const deg = (rad * 180) / Math.PI;
      return {
        primaryValue: fmt(deg, 4),
        primaryUnit: 'degrees (°)',
        primaryLabel: `${fn}(${x})`,
        secondaryOutputs: [
          { label: 'Radians', value: `${fmt(rad, 6)} rad` },
          { label: 'Multiples of π', value: `${fmt(rad / Math.PI, 4)}π rad` },
        ],
        steps: [`${fn}(${x}) = ${fmt(deg, 4)}° (${fmt(rad, 6)} rad).`],
      };
    },
  },

  // 658. Hyperbolic Functions Calculator
  {
    slug: 'hyperbolic-sinh-cosh-tanh-calculator',
    title: 'Hyperbolic Functions (sinh, cosh, tanh) Calculator',
    category: 'math',
    formulaDisplay: 'cosh²(x) − sinh²(x) = 1',
    inputs: [
      { id: 'x', label: 'Hyperbolic Argument (x)', type: 'number', defaultValue: 1.0, min: -500, max: 500, step: 0.25 },
    ],
    calculate: (v) => {
      const x = parseNum(v.x);
      if (Number.isNaN(x) || Math.abs(x) > 500) return calcError('Enter x between −500 and 500.');
      const sh = Math.sinh(x);
      const ch = Math.cosh(x);
      const th = Math.tanh(x);
      return {
        primaryValue: fmt(sh, 6),
        primaryUnit: 'sinh(x)',
        primaryLabel: `Hyperbolic Values at x = ${x}`,
        secondaryOutputs: [
          { label: 'cosh(x)', value: fmt(ch, 6) },
          { label: 'tanh(x)', value: fmt(th, 6) },
        ],
        steps: [`sinh(${x}) = ${fmt(sh, 6)}; cosh(${x}) = ${fmt(ch, 6)}; tanh(${x}) = ${fmt(th, 6)}.`],
      };
    },
  },

  // 659. Polar ↔ Cartesian Coordinate Converter
  {
    slug: 'polar-cartesian-coordinate-converter',
    title: 'Polar (r, θ) ↔ Cartesian (x, y) Coordinate Converter',
    category: 'math',
    formulaDisplay: 'x = r·cosθ, y = r·sinθ   |   r = √(x² + y²), θ = atan2(y, x)',
    inputs: [
      {
        id: 'mode',
        label: 'Conversion Mode',
        type: 'select',
        defaultValue: 'cart_to_polar',
        options: [
          { label: 'Cartesian (x, y) → Polar (r, θ°)', value: 'cart_to_polar' },
          { label: 'Polar (r, θ°) → Cartesian (x, y)', value: 'polar_to_cart' },
        ],
      },
      { id: 'x', label: 'x Coordinate', type: 'number', defaultValue: 3, min: -1e9, max: 1e9, step: 0.5, visibleWhen: (v) => String(v.mode || 'cart_to_polar') === 'cart_to_polar' },
      { id: 'y', label: 'y Coordinate', type: 'number', defaultValue: 4, min: -1e9, max: 1e9, step: 0.5, visibleWhen: (v) => String(v.mode || 'cart_to_polar') === 'cart_to_polar' },
      { id: 'r', label: 'Radius (r)', type: 'number', defaultValue: 5, min: 0, max: 1e9, step: 0.5, visibleWhen: (v) => String(v.mode || 'cart_to_polar') === 'polar_to_cart' },
      { id: 'thetaDeg', label: 'Angle θ (Degrees)', type: 'number', defaultValue: 53.13, min: -3600, max: 3600, step: 1, visibleWhen: (v) => String(v.mode || 'cart_to_polar') === 'polar_to_cart' },
    ],
    calculate: (v) => {
      const mode = String(v.mode || 'cart_to_polar');
      if (mode === 'cart_to_polar') {
        const x = parseNum(v.x);
        const y = parseNum(v.y);
        if (Number.isNaN(x) || Number.isNaN(y)) return calcError('Enter valid (x, y) coordinates.');
        const r = Math.hypot(x, y);
        const rad = Math.atan2(y, x);
        const deg = (rad * 180) / Math.PI;
        return {
          primaryValue: `(${fmt(r, 4)}, ${fmt(deg, 2)}°)`,
          primaryUnit: '(r, θ)',
          primaryLabel: 'Polar Coordinates',
          secondaryOutputs: [
            { label: 'Radius (r)', value: fmt(r, 5) },
            { label: 'Angle θ (Radians)', value: `${fmt(rad, 5)} rad` },
          ],
          steps: [`r = √(${x}² + ${y}²) = ${fmt(r, 4)}; θ = atan2(${y}, ${x}) = ${fmt(deg, 2)}°.`],
        };
      }
      const r = parseNum(v.r);
      const deg = parseNum(v.thetaDeg);
      if (Number.isNaN(r) || Number.isNaN(deg)) return calcError('Enter valid polar coordinates.');
      const rad = (deg * Math.PI) / 180;
      const x = r * Math.cos(rad);
      const y = r * Math.sin(rad);
      return {
        primaryValue: `(${fmt(x, 4)}, ${fmt(y, 4)})`,
        primaryUnit: '(x, y)',
        primaryLabel: 'Cartesian Coordinates',
        secondaryOutputs: [
          { label: 'x = r·cos(θ)', value: fmt(x, 5) },
          { label: 'y = r·sin(θ)', value: fmt(y, 5) },
        ],
        steps: [`x = ${r}·cos(${deg}°) = ${fmt(x, 4)}, y = ${r}·sin(${deg}°) = ${fmt(y, 4)}.`],
      };
    },
  },

  // 660. 3D Spherical & Cylindrical Coordinate Converter
  {
    slug: 'spherical-cylindrical-coordinate-converter',
    title: '3D Cartesian ↔ Cylindrical ↔ Spherical Coordinate Converter',
    category: 'math',
    formulaDisplay: 'ρ = √(x²+y²+z²),  r_cyl = √(x²+y²),  φ = arccos(z/ρ)',
    inputs: [
      { id: 'x', label: 'Cartesian x', type: 'number', defaultValue: 3, min: -1e8, max: 1e8, step: 0.5 },
      { id: 'y', label: 'Cartesian y', type: 'number', defaultValue: 4, min: -1e8, max: 1e8, step: 0.5 },
      { id: 'z', label: 'Cartesian z', type: 'number', defaultValue: 12, min: -1e8, max: 1e8, step: 0.5 },
    ],
    calculate: (v) => {
      const [x, y, z] = [v.x, v.y, v.z].map(parseNum);
      if ([x, y, z].some(Number.isNaN)) return calcError('Enter valid 3D Cartesian coordinates.');
      const rCyl = Math.hypot(x, y);
      const rho = Math.hypot(x, y, z);
      const thetaDeg = (Math.atan2(y, x) * 180) / Math.PI;
      const phiDeg = rho > 0 ? (Math.acos(Math.max(-1, Math.min(1, z / rho))) * 180) / Math.PI : 0;
      return {
        primaryValue: `(${fmt(rho, 4)}, ${fmt(thetaDeg, 2)}°, ${fmt(phiDeg, 2)}°)`,
        primaryUnit: 'Spherical (ρ, θ, φ)',
        primaryLabel: 'ISO/Physics Spherical Coordinates',
        secondaryOutputs: [
          { label: 'Cylindrical (r, θ, z)', value: `(${fmt(rCyl, 4)}, ${fmt(thetaDeg, 2)}°, ${fmt(z, 2)})` },
          { label: 'Radial Distance ρ', value: fmt(rho, 5) },
        ],
        steps: [`r_cyl = ${fmt(rCyl, 4)}; ρ = ${fmt(rho, 4)}; Azimuth θ = ${fmt(thetaDeg, 2)}°, Polar φ = ${fmt(phiDeg, 2)}°.`],
      };
    },
  },

  // 661. Polynomial Numerical Derivative & Tangent Slope Calculator
  {
    slug: 'numerical-derivative-slope-calculator',
    title: 'Cubic Polynomial Derivative & Tangent Line Calculator',
    category: 'math',
    formulaDisplay: "f(x) = ax³ + bx² + cx + d  ⟹  f'(x) = 3ax² + 2bx + c",
    inputs: [
      { id: 'a', label: 'a (x³)', type: 'number', defaultValue: 1, min: -1e6, max: 1e6, step: 0.5 },
      { id: 'b', label: 'b (x²)', type: 'number', defaultValue: -3, min: -1e6, max: 1e6, step: 0.5 },
      { id: 'c', label: 'c (x)', type: 'number', defaultValue: 2, min: -1e6, max: 1e6, step: 0.5 },
      { id: 'd', label: 'd (const)', type: 'number', defaultValue: 4, min: -1e6, max: 1e6, step: 0.5 },
      { id: 'x0', label: 'Evaluate Tangent at x₀', type: 'number', defaultValue: 2, min: -1e6, max: 1e6, step: 0.5 },
    ],
    calculate: (v) => {
      const [a, b, c, d, x0] = [v.a, v.b, v.c, v.d, v.x0].map(parseNum);
      if ([a, b, c, d, x0].some(Number.isNaN)) return calcError('Enter valid numeric polynomial coefficients.');
      const fx = a * x0 ** 3 + b * x0 ** 2 + c * x0 + d;
      const slope = 3 * a * x0 ** 2 + 2 * b * x0 + c;
      const d2 = 6 * a * x0 + 2 * b;
      const intercept = fx - slope * x0;
      return {
        primaryValue: fmt(slope, 4),
        primaryUnit: `f'(${x0})`,
        primaryLabel: `Instantaneous Derivative at x = ${x0}`,
        secondaryOutputs: [
          { label: `Function Value f(${x0})`, value: fmt(fx, 4) },
          { label: `Second Derivative f''(${x0})`, value: `${fmt(d2, 4)} (${d2 > 0 ? 'Concave Up' : d2 < 0 ? 'Concave Down' : 'Inflection'})` },
          { label: 'Tangent Line Equation', value: `y = ${fmt(slope, 3)}x ${intercept >= 0 ? '+' : '−'} ${fmt(Math.abs(intercept), 3)}` },
        ],
        steps: [`f(${x0}) = ${fmt(fx, 4)}; f'(${x0}) = ${fmt(slope, 4)}; f''(${x0}) = ${fmt(d2, 4)}.`],
      };
    },
  },

  // 662. Simpson's Rule Definite Integral Calculator
  {
    slug: 'simpsons-rule-definite-integral-calculator',
    title: 'Polynomial Definite Integral & Simpson’s Rule Calculator',
    category: 'math',
    formulaDisplay: '∫_a^b (px³ + qx² + rx + s) dx  Exact Antiderivative vs Trapezoidal',
    inputs: [
      { id: 'p', label: 'p (x³)', type: 'number', defaultValue: 0, min: -1e5, max: 1e5, step: 0.5 },
      { id: 'q', label: 'q (x²)', type: 'number', defaultValue: 3, min: -1e5, max: 1e5, step: 0.5 },
      { id: 'r', label: 'r (x)', type: 'number', defaultValue: 2, min: -1e5, max: 1e5, step: 0.5 },
      { id: 's', label: 's (const)', type: 'number', defaultValue: 1, min: -1e5, max: 1e5, step: 0.5 },
      { id: 'lowerA', label: 'Lower Limit (a)', type: 'number', defaultValue: 0, min: -1000, max: 1000, step: 0.5 },
      { id: 'upperB', label: 'Upper Limit (b)', type: 'number', defaultValue: 4, min: -1000, max: 1000, step: 0.5 },
    ],
    calculate: (v) => {
      const [p, q, r, s, a, b] = [v.p, v.q, v.r, v.s, v.lowerA, v.upperB].map(parseNum);
      if ([p, q, r, s, a, b].some(Number.isNaN)) return calcError('Enter valid polynomial integral bounds.');
      const F = (x: number) => (p / 4) * x ** 4 + (q / 3) * x ** 3 + (r / 2) * x ** 2 + s * x;
      const f = (x: number) => p * x ** 3 + q * x ** 2 + r * x + s;
      const exact = F(b) - F(a);
      const simpson = ((b - a) / 6) * (f(a) + 4 * f((a + b) / 2) + f(b));
      const avgVal = b !== a ? exact / (b - a) : f(a);
      return {
        primaryValue: fmt(exact, 5),
        primaryUnit: '∫ f(x)dx',
        primaryLabel: `Exact Definite Integral [${a}, ${b}]`,
        secondaryOutputs: [
          { label: 'Single-Interval Simpson’s Rule', value: fmt(simpson, 5) },
          { label: 'Mean Value on [a, b]', value: fmt(avgVal, 5) },
        ],
        steps: [`F(${b}) − F(${a}) = ${fmt(exact, 5)}; Simpson’s 1/3 estimate = ${fmt(simpson, 5)} (exact for degree ≤ 3).`],
      };
    },
  },

  // 663. 3x3 Linear System (Cramer's Rule) Solver
  {
    slug: 'partial-fraction-linear-solver',
    title: '3×3 Linear System Solver (Cramer’s Rule)',
    category: 'math',
    formulaDisplay: 'Ax = b  ⟹  x_i = det(A_i) / det(A)',
    inputs: [
      { id: 'a1', label: 'Eq1: x coeff', type: 'number', defaultValue: 2, min: -1e5, max: 1e5, step: 1 },
      { id: 'b1', label: 'Eq1: y coeff', type: 'number', defaultValue: 1, min: -1e5, max: 1e5, step: 1 },
      { id: 'c1', label: 'Eq1: z coeff', type: 'number', defaultValue: -1, min: -1e5, max: 1e5, step: 1 },
      { id: 'd1', label: 'Eq1: = RHS', type: 'number', defaultValue: 8, min: -1e6, max: 1e6, step: 1 },
      { id: 'a2', label: 'Eq2: x coeff', type: 'number', defaultValue: -3, min: -1e5, max: 1e5, step: 1 },
      { id: 'b2', label: 'Eq2: y coeff', type: 'number', defaultValue: -1, min: -1e5, max: 1e5, step: 1 },
      { id: 'c2', label: 'Eq2: z coeff', type: 'number', defaultValue: 2, min: -1e5, max: 1e5, step: 1 },
      { id: 'd2', label: 'Eq2: = RHS', type: 'number', defaultValue: -11, min: -1e6, max: 1e6, step: 1 },
      { id: 'a3', label: 'Eq3: x coeff', type: 'number', defaultValue: -2, min: -1e5, max: 1e5, step: 1 },
      { id: 'b3', label: 'Eq3: y coeff', type: 'number', defaultValue: 1, min: -1e5, max: 1e5, step: 1 },
      { id: 'c3', label: 'Eq3: z coeff', type: 'number', defaultValue: 2, min: -1e5, max: 1e5, step: 1 },
      { id: 'd3', label: 'Eq3: = RHS', type: 'number', defaultValue: -3, min: -1e6, max: 1e6, step: 1 },
    ],
    calculate: (v) => {
      const nums = [v.a1, v.b1, v.c1, v.d1, v.a2, v.b2, v.c2, v.d2, v.a3, v.b3, v.c3, v.d3].map(parseNum);
      if (nums.some(Number.isNaN)) return calcError('Enter valid numeric 3×3 matrix coefficients.');
      const [a1, b1, c1, d1, a2, b2, c2, d2, a3, b3, c3, d3] = nums;
      const det3 = (x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, x3: number, y3: number, z3: number) =>
        x1 * (y2 * z3 - z2 * y3) - y1 * (x2 * z3 - z2 * x3) + z1 * (x2 * y3 - y2 * x3);
      const D = det3(a1, b1, c1, a2, b2, c2, a3, b3, c3);
      if (Math.abs(D) < 1e-12) return calcError('System determinant is zero (parallel or dependent equations; no unique solution).');
      const x = det3(d1, b1, c1, d2, b2, c2, d3, b3, c3) / D;
      const y = det3(a1, d1, c1, a2, d2, c2, a3, d3, c3) / D;
      const z = det3(a1, b1, d1, a2, b2, d2, a3, b3, d3) / D;
      return {
        primaryValue: `(${fmt(x, 4)}, ${fmt(y, 4)}, ${fmt(z, 4)})`,
        primaryUnit: '(x, y, z)',
        primaryLabel: 'Unique 3×3 Solution Vector',
        secondaryOutputs: [
          { label: 'x', value: fmt(x, 5) },
          { label: 'y', value: fmt(y, 5) },
          { label: 'z', value: fmt(z, 5) },
          { label: 'System Determinant det(A)', value: fmt(D, 4) },
        ],
        steps: [`det(A) = ${fmt(D, 4)} → (x, y, z) = (${fmt(x, 4)}, ${fmt(y, 4)}, ${fmt(z, 4)}).`],
      };
    },
  },

  // 664. Bitwise Logic & Shift Calculator
  {
    slug: 'bitwise-xor-shift-calculator',
    title: 'Bitwise AND, OR, XOR & Bit-Shift Calculator',
    category: 'math',
    formulaDisplay: '32-bit Signed/Unsigned Integer Bitwise Operations',
    inputs: [
      { id: 'a', label: 'Integer A', type: 'number', defaultValue: 42, min: 0, max: 2147483647, step: 1 },
      { id: 'b', label: 'Integer B (or Shift Count)', type: 'number', defaultValue: 15, min: 0, max: 2147483647, step: 1 },
    ],
    calculate: (v) => {
      const a = Math.trunc(parseNum(v.a));
      const b = Math.trunc(parseNum(v.b));
      if (Number.isNaN(a) || Number.isNaN(b) || a < 0 || b < 0) return calcError('Enter non-negative 32-bit integers.');
      const andVal = (a & b) >>> 0;
      const orVal = (a | b) >>> 0;
      const xorVal = (a ^ b) >>> 0;
      const sh = b % 32;
      const lshift = (a << sh) >>> 0;
      return {
        primaryValue: xorVal,
        primaryUnit: `0b${xorVal.toString(2)}`,
        primaryLabel: 'Bitwise XOR (A ^ B)',
        secondaryOutputs: [
          { label: 'Bitwise AND (A & B)', value: `${andVal} (0b${andVal.toString(2)})` },
          { label: 'Bitwise OR (A | B)', value: `${orVal} (0b${orVal.toString(2)})` },
          { label: `Left Shift (A << ${sh})`, value: `${lshift} (0x${lshift.toString(16).toUpperCase()})` },
        ],
        steps: [`A=0b${(a >>> 0).toString(2)}, B=0b${(b >>> 0).toString(2)} → XOR=${xorVal}, AND=${andVal}, OR=${orVal}.`],
      };
    },
  },

  // 665. Two's Complement Signed Binary Converter
  {
    slug: 'twos-complement-signed-binary-calculator',
    title: 'Two’s Complement Signed Binary Converter (8/16/32-Bit)',
    category: 'math',
    formulaDisplay: 'Signed Negative Binary = Invert Bits + 1',
    inputs: [
      { id: 'intVal', label: 'Signed Decimal Integer', type: 'number', defaultValue: -42, min: -2147483648, max: 2147483647, step: 1 },
      {
        id: 'bits',
        label: 'Register Bit Width',
        type: 'select',
        defaultValue: '8',
        options: [
          { label: '8-bit (−128 to +127)', value: '8' },
          { label: '16-bit (−32,768 to +32,767)', value: '16' },
          { label: '32-bit', value: '32' },
        ],
      },
    ],
    calculate: (v) => {
      const n = Math.trunc(parseNum(v.intVal));
      const bits = parseInt(String(v.bits || '8'), 10);
      if (Number.isNaN(n) || ![8, 16, 32].includes(bits)) return calcError('Enter valid signed integer and bit width.');
      const minV = -(2 ** (bits - 1));
      const maxV = 2 ** (bits - 1) - 1;
      if (n < minV || n > maxV) return calcError(`${bits}-bit two’s complement range is ${minV} to ${maxV}.`);
      const unsigned = n < 0 ? 2 ** bits + n : n;
      const bin = unsigned.toString(2).padStart(bits, '0');
      const hex = unsigned.toString(16).toUpperCase().padStart(bits / 4, '0');
      return {
        primaryValue: bin,
        primaryUnit: `${bits}-bit`,
        primaryLabel: `Two’s Complement of ${n}`,
        secondaryOutputs: [
          { label: 'Hexadecimal Word', value: `0x${hex}` },
          { label: 'Unsigned Bit Interpretation', value: unsigned },
        ],
        steps: [`${n} encoded in ${bits}-bit two's complement = 0b${bin} (0x${hex}).`],
      };
    },
  },

  // 666. IEEE 754 Single-Precision Float32 Decoder
  {
    slug: 'ieee754-float32-hex-calculator',
    title: 'IEEE 754 Float32 Single-Precision Binary & Hex Decoder',
    category: 'math',
    formulaDisplay: '(−1)^S × 1.Mantissa × 2^(Exponent − 127)',
    inputs: [
      { id: 'value', label: 'Floating-Point Decimal Number', type: 'number', defaultValue: 3.1415927, min: -3.4e38, max: 3.4e38, step: 0.1 },
    ],
    calculate: (v) => {
      const num = parseNum(v.value);
      if (Number.isNaN(num)) return calcError('Enter a valid finite floating-point number.');
      const buf = new ArrayBuffer(4);
      const view = new DataView(buf);
      view.setFloat32(0, num, false);
      const u32 = view.getUint32(0, false);
      const storedFloat = view.getFloat32(0, false);
      const bin32 = u32.toString(2).padStart(32, '0');
      const sign = bin32[0];
      const expBits = bin32.slice(1, 9);
      const mantBits = bin32.slice(9);
      const hex = '0x' + u32.toString(16).toUpperCase().padStart(8, '0');
      return {
        primaryValue: hex,
        primaryUnit: 'IEEE 754',
        primaryLabel: '32-Bit Big-Endian Hex Encoding',
        secondaryOutputs: [
          { label: 'Sign | Exponent | Mantissa', value: `${sign} | ${expBits} (exp=${parseInt(expBits, 2) - 127}) | ${mantBits}` },
          { label: 'Exact Stored Float32 Value', value: storedFloat },
        ],
        steps: [`Float32 binary: ${sign} ${expBits} ${mantBits} (${hex}).`],
      };
    },
  },

  // 667. Floor, Ceiling & Banker's Rounding Calculator
  {
    slug: 'floor-ceiling-round-half-calculator',
    title: 'Floor, Ceiling, Truncate & Banker’s Rounding Calculator',
    category: 'math',
    formulaDisplay: 'floor(x), ceil(x), trunc(x), and IEEE Half-to-Even',
    inputs: [
      { id: 'x', label: 'Input Value (x)', type: 'number', defaultValue: 2.5, min: -1e12, max: 1e12, step: 0.25 },
    ],
    calculate: (v) => {
      const x = parseNum(v.x);
      if (Number.isNaN(x)) return calcError('Enter a valid real number.');
      const fl = Math.floor(x);
      const ce = Math.ceil(x);
      const tr = Math.trunc(x);
      const halfUp = x >= 0 ? Math.floor(x + 0.5) : -Math.floor(-x + 0.5);
      const frac = Math.abs(x - tr);
      let halfEven = Math.round(x);
      if (Math.abs(frac - 0.5) < 1e-12) {
        halfEven = Math.abs(tr) % 2 === 0 ? tr : tr + (x >= 0 ? 1 : -1);
      }
      return {
        primaryValue: halfEven,
        primaryUnit: 'round-half-even',
        primaryLabel: `Banker’s Round (Half-to-Even) of ${x}`,
        secondaryOutputs: [
          { label: 'Floor ⌊x⌋ (Toward −∞)', value: fl },
          { label: 'Ceiling ⌈x⌉ (Toward +∞)', value: ce },
          { label: 'Truncate (Toward 0)', value: tr },
          { label: 'Half Away From Zero', value: halfUp },
        ],
        steps: [`For ${x}: Floor=${fl}, Ceiling=${ce}, Trunc=${tr}, Banker's Half-Even=${halfEven}.`],
      };
    },
  },

  // 668. Linear Interpolation (LERP) Calculator
  {
    slug: 'linear-interpolation-lerp-calculator',
    title: 'Linear Interpolation (LERP) Calculator',
    category: 'math',
    formulaDisplay: 'y = y₁ + ((x − x₁) / (x₂ − x₁)) × (y₂ − y₁)',
    inputs: [
      { id: 'x1', label: 'x₁', type: 'number', defaultValue: 10, min: -1e10, max: 1e10, step: 1 },
      { id: 'y1', label: 'y₁', type: 'number', defaultValue: 100, min: -1e10, max: 1e10, step: 5 },
      { id: 'x2', label: 'x₂', type: 'number', defaultValue: 20, min: -1e10, max: 1e10, step: 1 },
      { id: 'y2', label: 'y₂', type: 'number', defaultValue: 250, min: -1e10, max: 1e10, step: 5 },
      { id: 'xTarget', label: 'Target x', type: 'number', defaultValue: 14, min: -1e10, max: 1e10, step: 0.5 },
    ],
    calculate: (v) => {
      const [x1, y1, x2, y2, xt] = [v.x1, v.y1, v.x2, v.y2, v.xTarget].map(parseNum);
      if ([x1, y1, x2, y2, xt].some(Number.isNaN)) return calcError('Enter valid numeric interpolation points.');
      if (x1 === x2) return calcError('x₁ and x₂ must differ for interpolation.');
      const t = (xt - x1) / (x2 - x1);
      const yt = y1 + t * (y2 - y1);
      return {
        primaryValue: fmt(yt, 5),
        primaryUnit: `y(${xt})`,
        primaryLabel: t >= 0 && t <= 1 ? 'Linearly Interpolated Value' : 'Linearly Extrapolated Value',
        secondaryOutputs: [
          { label: 'Blend Parameter (t)', value: fmt(t, 4) },
          { label: 'Segment Slope (Δy/Δx)', value: fmt((y2 - y1) / (x2 - x1), 5) },
        ],
        steps: [`t = (${xt} − ${x1}) ÷ (${x2} − ${x1}) = ${fmt(t, 4)} → y = ${fmt(yt, 5)}.`],
      };
    },
  },

  // 669. Exponential Growth & Decay Calculator
  {
    slug: 'exponential-growth-decay-calculator',
    title: 'Exponential Growth, Decay & Doubling/Half-Life Calculator',
    category: 'math',
    formulaDisplay: 'N(t) = N₀ × (1 + r)^t   or   N₀ × e^(kt)',
    inputs: [
      { id: 'n0', label: 'Initial Quantity (N₀)', type: 'number', defaultValue: 1000, min: 0.0001, max: 1e14, step: 50 },
      { id: 'ratePct', label: 'Rate per Period (+Growth / −Decay)', type: 'number', unit: '%', defaultValue: 12, min: -99.9, max: 1000, step: 1 },
      { id: 't', label: 'Elapsed Time Periods (t)', type: 'number', defaultValue: 8, min: 0, max: 1000, step: 1 },
    ],
    calculate: (v) => {
      const n0 = parseNum(v.n0);
      const r = parseNum(v.ratePct) / 100;
      const t = parseNum(v.t);
      if ([n0, r, t].some(Number.isNaN) || n0 <= 0 || r <= -1 || t < 0) return calcError('Enter N₀ > 0, rate > −100%, and t >= 0.');
      const discrete = n0 * Math.pow(1 + r, t);
      const continuous = n0 * Math.exp(r * t);
      const charTime = r === 0 ? 'Infinite' : r > 0 ? `${fmt(Math.log(2) / Math.log(1 + r), 2)} periods (Doubling)` : `${fmt(Math.log(0.5) / Math.log(1 + r), 2)} periods (Half-Life)`;
      return {
        primaryValue: fmt(discrete, 4),
        primaryUnit: 'N(t)',
        primaryLabel: 'Discrete Exponential Value',
        secondaryOutputs: [
          { label: 'Continuous Growth Value (e^rt)', value: fmt(continuous, 4) },
          { label: 'Doubling / Half-Life Time', value: charTime },
        ],
        steps: [`N(${t}) = ${n0} × (1 + ${r})^${t} = ${fmt(discrete, 4)} (Continuous e^rt = ${fmt(continuous, 4)}).`],
      };
    },
  },

  // 670. Deterministic Primality Tester & Divisors Calculator
  {
    slug: 'prime-number-checker-nth-prime-calculator',
    title: 'Prime Number Checker, Divisors & Next Prime Calculator',
    category: 'math',
    formulaDisplay: '6k ± 1 Deterministic Trial Division up to √n',
    inputs: [
      { id: 'n', label: 'Positive Integer (2 to 10¹²)', type: 'number', defaultValue: 2027, min: 2, max: 1e12, step: 1 },
    ],
    calculate: (v) => {
      const n = Math.trunc(parseNum(v.n));
      if (Number.isNaN(n) || n < 2 || n > 1e12) return calcError('Enter an integer between 2 and 10¹².');
      const isPrimeFn = (x: number) => {
        if (x < 2) return false;
        if (x === 2 || x === 3) return true;
        if (x % 2 === 0 || x % 3 === 0) return false;
        for (let i = 5; i * i <= x; i += 6) {
          if (x % i === 0 || x % (i + 2) === 0) return false;
        }
        return true;
      };
      const prime = isPrimeFn(n);
      let smallestFactor = n;
      if (!prime) {
        if (n % 2 === 0) smallestFactor = 2;
        else if (n % 3 === 0) smallestFactor = 3;
        else {
          for (let i = 5; i * i <= n; i += 6) {
            if (n % i === 0) { smallestFactor = i; break; }
            if (n % (i + 2) === 0) { smallestFactor = i + 2; break; }
          }
        }
      }
      let nextP = n + 1;
      let guard = 0;
      while (!isPrimeFn(nextP) && guard < 1000) { nextP++; guard++; }
      return {
        primaryValue: prime ? 'PRIME' : 'COMPOSITE',
        primaryUnit: `${n}`,
        primaryLabel: prime ? `${n} is a Prime Number` : `${n} is Composite (Divisible by ${smallestFactor})`,
        secondaryOutputs: [
          { label: 'Smallest Prime Factor', value: smallestFactor },
          { label: 'Next Prime > n', value: nextP },
        ],
        steps: [prime ? `Tested all factors ≤ √${n} (${Math.floor(Math.sqrt(n))}): zero divisors found.` : `First prime divisor found: ${smallestFactor} (${n} = ${smallestFactor} × ${n / smallestFactor}).`],
      };
    },
  },

  // 671. Chinese Remainder Theorem (2 Congruences) Solver
  {
    slug: 'chinese-remainder-congruence-calculator',
    title: 'Chinese Remainder Theorem (CRT) Congruence Solver',
    category: 'math',
    formulaDisplay: 'x ≡ a₁ (mod m₁)  and  x ≡ a₂ (mod m₂)',
    inputs: [
      { id: 'a1', label: 'Remainder a₁', type: 'number', defaultValue: 2, min: -1e7, max: 1e7, step: 1 },
      { id: 'm1', label: 'Modulus m₁', type: 'number', defaultValue: 5, min: 1, max: 1e7, step: 1 },
      { id: 'a2', label: 'Remainder a₂', type: 'number', defaultValue: 3, min: -1e7, max: 1e7, step: 1 },
      { id: 'm2', label: 'Modulus m₂ (Coprime with m₁)', type: 'number', defaultValue: 7, min: 1, max: 1e7, step: 1 },
    ],
    calculate: (v) => {
      const [a1, m1, a2, m2] = [v.a1, v.m1, v.a2, v.m2].map((x) => Math.trunc(parseNum(x)));
      if ([a1, m1, a2, m2].some(Number.isNaN) || m1 <= 0 || m2 <= 0) return calcError('Enter integers with positive moduli.');
      let t = 0, newt = 1, r = m2, newr = m1;
      while (newr !== 0) {
        const q = Math.floor(r / newr);
        [t, newt] = [newt, t - q * newt];
        [r, newr] = [newr, r - q * newr];
      }
      if (r !== 1) return calcError(`Moduli ${m1} and ${m2} must be coprime (gcd = ${r}).`);
      const m1Inv = ((t % m2) + m2) % m2;
      const M = m1 * m2;
      const k = (((a2 - a1) * m1Inv) % m2 + m2) % m2;
      const x = (a1 + m1 * k) % M;
      const xPos = ((x % M) + M) % M;
      return {
        primaryValue: xPos,
        primaryUnit: `mod ${M}`,
        primaryLabel: `Unique Solution x ≡ ${xPos} (mod ${M})`,
        secondaryOutputs: [
          { label: 'Combined Modulus (m₁ × m₂)', value: M },
          { label: 'Verification', value: `${xPos % m1} ≡ ${((a1 % m1) + m1) % m1} (mod ${m1}); ${xPos % m2} ≡ ${((a2 % m2) + m2) % m2} (mod ${m2})` },
        ],
        steps: [`m₁⁻¹ mod m₂ = ${m1Inv} → Unique x = ${xPos} + ${M}k.`],
      };
    },
  },

  // 672. BOGO & Multi-Tier Bundle Discount Calculator
  {
    slug: 'roman-discount-markup-bundle-calculator',
    title: 'BOGO & Multi-Tier Bundle Discount Calculator',
    category: 'math',
    formulaDisplay: 'Effective Discount % = (Regular Total − Bundle Paid) / Regular Total',
    inputs: [
      { id: 'unitPrice', label: 'Regular Single Item Price', type: 'number', prefix: '$', defaultValue: 40, min: 0.01, max: 1e9, step: 1 },
      { id: 'buyQty', label: 'Buy Quantity (e.g., 2 in Buy 2 Get 1)', type: 'number', defaultValue: 2, min: 1, max: 1000, step: 1 },
      { id: 'getQty', label: 'Discounted Additional Quantity', type: 'number', defaultValue: 1, min: 1, max: 1000, step: 1 },
      { id: 'getDiscountPct', label: 'Discount % on Additional Item(s) (100% = Free)', type: 'number', unit: '%', defaultValue: 100, min: 0, max: 100, step: 10 },
    ],
    calculate: (v) => {
      const px = parseNum(v.unitPrice);
      const buy = Math.round(parseNum(v.buyQty));
      const get = Math.round(parseNum(v.getQty));
      const disc = parseNum(v.getDiscountPct) / 100;
      if ([px, buy, get, disc].some(Number.isNaN) || px <= 0 || buy < 1 || get < 1 || disc < 0 || disc > 1) return calcError('Enter valid BOGO quantities and discount %.');
      const totalItems = buy + get;
      const regTotal = totalItems * px;
      const paidTotal = buy * px + get * px * (1 - disc);
      const effDiscPct = ((regTotal - paidTotal) / regTotal) * 100;
      return {
        primaryValue: fmt(effDiscPct, 2),
        primaryUnit: '% off',
        primaryLabel: 'True Effective Bundle Discount',
        secondaryOutputs: [
          { label: 'Bundle Total Paid', value: `$${fmt(paidTotal, 2)} (vs $${fmt(regTotal, 2)})` },
          { label: 'Effective Price Per Item', value: `$${fmt(paidTotal / totalItems, 2)}` },
          { label: 'Total Dollar Savings', value: `$${fmt(regTotal - paidTotal, 2)}` },
        ],
        steps: [`Buy ${buy} + Get ${get} @ ${fmt(disc * 100, 0)}% off → Pay $${fmt(paidTotal, 2)} instead of $${fmt(regTotal, 2)} (${fmt(effDiscPct, 2)}% effective discount).`],
      };
    },
  },

  // 673. Group Restaurant Bill Splitter (Pre-Tax Tip)
  {
    slug: 'restaurant-split-bill-tax-tip-calculator',
    title: 'Group Restaurant Bill Splitter (Pre-Tax Tip & Equal/Custom Shares)',
    category: 'math',
    formulaDisplay: 'Tip Calculated on Pre-Tax Subtotal + Tax Added ÷ Diners',
    inputs: [
      { id: 'subtotal', label: 'Food & Drink Subtotal (Pre-Tax)', type: 'number', prefix: '$', defaultValue: 180, min: 0, max: 1e7, step: 5 },
      { id: 'taxPct', label: 'Restaurant Sales Tax %', type: 'number', unit: '%', defaultValue: 8.5, min: 0, max: 35, step: 0.25 },
      { id: 'tipPct', label: 'Tip % (Applied Pre-Tax)', type: 'number', unit: '%', defaultValue: 20, min: 0, max: 100, step: 1 },
      { id: 'diners', label: 'Number of Diners Splitting', type: 'number', defaultValue: 4, min: 1, max: 100, step: 1 },
    ],
    calculate: (v) => {
      const sub = parseNum(v.subtotal);
      const taxR = parseNum(v.taxPct) / 100;
      const tipR = parseNum(v.tipPct) / 100;
      const diners = Math.round(parseNum(v.diners));
      if ([sub, taxR, tipR, diners].some(Number.isNaN) || sub < 0 || taxR < 0 || tipR < 0 || diners < 1) return calcError('Enter valid positive bill and diner count.');
      const tax = sub * taxR;
      const tip = sub * tipR;
      const grandTotal = sub + tax + tip;
      const perPerson = grandTotal / diners;
      return {
        primaryValue: fmt(perPerson, 2),
        primaryUnit: '$ / person',
        primaryLabel: `Split Total Across ${diners} Diners`,
        secondaryOutputs: [
          { label: 'Grand Total (Subtotal + Tax + Tip)', value: `$${fmt(grandTotal, 2)}` },
          { label: 'Pre-Tax Tip Amount', value: `$${fmt(tip, 2)}` },
          { label: 'Sales Tax', value: `$${fmt(tax, 2)}` },
        ],
        steps: [`Subtotal $${fmt(sub, 2)} + Tax $${fmt(tax, 2)} + Tip $${fmt(tip, 2)} = $${fmt(grandTotal, 2)} ÷ ${diners} = $${fmt(perPerson, 2)} each.`],
      };
    },
  },

  // 674. Grocery Unit Price Comparator
  {
    slug: 'unit-price-comparison-calculator',
    title: 'Grocery & Bulk Unit Price Value Comparator',
    category: 'math',
    formulaDisplay: 'Unit Price = Package Price / Total Net Quantity',
    inputs: [
      { id: 'priceA', label: 'Option A Package Price', type: 'number', prefix: '$', defaultValue: 5.49, min: 0.01, max: 1e7, step: 0.25 },
      { id: 'qtyA', label: 'Option A Quantity (oz / g / ct)', type: 'number', defaultValue: 16, min: 0.01, max: 1e7, step: 1 },
      { id: 'priceB', label: 'Option B Package Price', type: 'number', prefix: '$', defaultValue: 8.99, min: 0.01, max: 1e7, step: 0.25 },
      { id: 'qtyB', label: 'Option B Quantity (oz / g / ct)', type: 'number', defaultValue: 32, min: 0.01, max: 1e7, step: 1 },
    ],
    calculate: (v) => {
      const [pA, qA, pB, qB] = [v.priceA, v.qtyA, v.priceB, v.qtyB].map(parseNum);
      if ([pA, qA, pB, qB].some(Number.isNaN) || pA <= 0 || qA <= 0 || pB <= 0 || qB <= 0) return calcError('Enter positive prices and quantities for both options.');
      const uA = pA / qA;
      const uB = pB / qB;
      const better = uA < uB ? 'Option A' : uB < uA ? 'Option B' : 'Tie';
      const savingsPct = Math.abs(uA - uB) / Math.max(uA, uB) * 100;
      return {
        primaryValue: better,
        primaryUnit: `${fmt(savingsPct, 1)}% cheaper/unit`,
        primaryLabel: better === 'Tie' ? 'Identical Unit Price' : `${better} Is Better Value`,
        secondaryOutputs: [
          { label: 'Option A Unit Price', value: `$${fmt(uA, 4)} / unit` },
          { label: 'Option B Unit Price', value: `$${fmt(uB, 4)} / unit` },
        ],
        steps: [`Option A = $${fmt(uA, 4)}/unit vs Option B = $${fmt(uB, 4)}/unit → ${better} saves ${fmt(savingsPct, 1)}%.`],
      };
    },
  },
];
