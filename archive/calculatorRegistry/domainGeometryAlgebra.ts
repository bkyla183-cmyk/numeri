import { CalculatorSpec } from './types';

export const geometryAlgebraSpecs: CalculatorSpec[] = [
  // GEOMETRY
  {
    slug: 'triangle-area-calculator',
    title: 'Triangle Area Calculator',
    category: 'geometry',
    formulaDisplay: 'Area = 0.5 × base × height',
    inputs: [
      { id: 'base', label: 'Base (b)', defaultValue: 10, type: 'number', min: 0.0001, step: 'any', unit: 'cm' },
      { id: 'height', label: 'Height (h)', defaultValue: 6, type: 'number', min: 0.0001, step: 'any', unit: 'cm' },
    ],
    calculate: (v) => {
      const b = Number(v.base) || 0;
      const h = Number(v.height) || 0;
      if (b <= 0 || h <= 0) return { primaryValue: 'Error', primaryLabel: 'Invalid Input', error: 'Base and height must be positive.' };
      const area = 0.5 * b * h;
      return {
        primaryValue: parseFloat(area.toFixed(4)),
        primaryUnit: 'sq units',
        primaryLabel: 'Triangle Area',
        secondaryOutputs: [
          { label: 'Base', value: b, unit: 'units' },
          { label: 'Height', value: h, unit: 'units' },
        ],
        steps: [`Area = 0.5 × ${b} × ${h} = ${area}`],
        formulaUsed: 'A = 0.5 · b · h',
      };
    },
  },
  {
    slug: 'circle-calculator',
    title: 'Circle Calculator',
    category: 'geometry',
    formulaDisplay: 'A = π r², C = 2 π r, d = 2 r',
    inputs: [
      { id: 'radius', label: 'Radius (r)', defaultValue: 7, type: 'number', min: 0.0001, step: 'any', unit: 'cm' },
    ],
    calculate: (v) => {
      const r = Number(v.radius) || 0;
      if (r <= 0) return { primaryValue: 'Error', primaryLabel: 'Invalid', error: 'Radius must be > 0.' };
      const area = Math.PI * r * r;
      const circ = 2 * Math.PI * r;
      const dia = 2 * r;
      return {
        primaryValue: parseFloat(area.toFixed(4)),
        primaryUnit: 'sq units',
        primaryLabel: 'Circle Area',
        secondaryOutputs: [
          { label: 'Circumference (Perimeter)', value: parseFloat(circ.toFixed(4)), unit: 'units' },
          { label: 'Diameter (d)', value: dia, unit: 'units' },
          { label: 'Radius (r)', value: r, unit: 'units' },
        ],
        steps: [`Area = π × ${r}² = ${area.toFixed(4)}`, `Circumference = 2 × π × ${r} = ${circ.toFixed(4)}`],
        formulaUsed: 'A = π·r², C = 2·π·r',
      };
    },
  },
  {
    slug: 'rectangle-calculator',
    title: 'Rectangle Calculator',
    category: 'geometry',
    formulaDisplay: 'A = L × W, P = 2(L + W), d = √(L² + W²)',
    inputs: [
      { id: 'length', label: 'Length (L)', defaultValue: 12, type: 'number', min: 0.0001, step: 'any', unit: 'm' },
      { id: 'width', label: 'Width (W)', defaultValue: 8, type: 'number', min: 0.0001, step: 'any', unit: 'm' },
    ],
    calculate: (v) => {
      const l = Number(v.length) || 0;
      const w = Number(v.width) || 0;
      if (l <= 0 || w <= 0) return { primaryValue: 'Error', primaryLabel: 'Invalid', error: 'Dimensions must be > 0.' };
      const area = l * w;
      const perim = 2 * (l + w);
      const diag = Math.sqrt(l * l + w * w);
      return {
        primaryValue: parseFloat(area.toFixed(4)),
        primaryUnit: 'sq units',
        primaryLabel: 'Rectangle Area',
        secondaryOutputs: [
          { label: 'Perimeter', value: parseFloat(perim.toFixed(4)), unit: 'units' },
          { label: 'Diagonal Length', value: parseFloat(diag.toFixed(4)), unit: 'units' },
        ],
        steps: [`Area = ${l} × ${w} = ${area}`, `Perimeter = 2 × (${l} + ${w}) = ${perim}`, `Diagonal = √(${l}² + ${w}²) = ${diag.toFixed(4)}`],
        formulaUsed: 'A = L·W, P = 2(L+W), d = √(L²+W²)',
      };
    },
  },
  {
    slug: 'trapezoid-calculator',
    title: 'Trapezoid Calculator',
    category: 'geometry',
    formulaDisplay: 'Area = 0.5 × (a + b) × h',
    inputs: [
      { id: 'baseA', label: 'Top Base (a)', defaultValue: 6, type: 'number', min: 0.0001, step: 'any' },
      { id: 'baseB', label: 'Bottom Base (b)', defaultValue: 10, type: 'number', min: 0.0001, step: 'any' },
      { id: 'height', label: 'Height (h)', defaultValue: 5, type: 'number', min: 0.0001, step: 'any' },
    ],
    calculate: (v) => {
      const a = Number(v.baseA) || 0;
      const b = Number(v.baseB) || 0;
      const h = Number(v.height) || 0;
      if (a <= 0 || b <= 0 || h <= 0) return { primaryValue: 'Error', primaryLabel: 'Invalid', error: 'All parameters must be > 0.' };
      const area = 0.5 * (a + b) * h;
      return {
        primaryValue: parseFloat(area.toFixed(4)),
        primaryUnit: 'sq units',
        primaryLabel: 'Trapezoid Area',
        secondaryOutputs: [
          { label: 'Average Base', value: ((a + b) / 2).toFixed(4) },
          { label: 'Base Sum', value: a + b },
        ],
        steps: [`Area = 0.5 × (${a} + ${b}) × ${h} = ${area}`],
        formulaUsed: 'A = ((a + b) / 2) · h',
      };
    },
  },
  {
    slug: 'parallelogram-calculator',
    title: 'Parallelogram Calculator',
    category: 'geometry',
    formulaDisplay: 'Area = b × h',
    inputs: [
      { id: 'base', label: 'Base (b)', defaultValue: 14, type: 'number', min: 0.0001, step: 'any' },
      { id: 'height', label: 'Height (h)', defaultValue: 7, type: 'number', min: 0.0001, step: 'any' },
      { id: 'side', label: 'Side (a, for perimeter)', defaultValue: 9, type: 'number', min: 0.0001, step: 'any' },
    ],
    calculate: (v) => {
      const b = Number(v.base) || 0;
      const h = Number(v.height) || 0;
      const a = Number(v.side) || 0;
      if (b <= 0 || h <= 0) return { primaryValue: 'Error', primaryLabel: 'Invalid', error: 'Base and height must be > 0.' };
      const area = b * h;
      const perim = a > 0 ? 2 * (a + b) : 0;
      return {
        primaryValue: parseFloat(area.toFixed(4)),
        primaryUnit: 'sq units',
        primaryLabel: 'Parallelogram Area',
        secondaryOutputs: [
          { label: 'Perimeter', value: perim > 0 ? perim.toFixed(4) : 'N/A', unit: 'units' },
        ],
        steps: [`Area = ${b} × ${h} = ${area}`],
        formulaUsed: 'A = b · h',
      };
    },
  },
  {
    slug: 'polygon-area-calculator',
    title: 'Regular Polygon Area Calculator',
    category: 'geometry',
    formulaDisplay: 'Area = (n × s²) / (4 × tan(π / n))',
    inputs: [
      { id: 'n', label: 'Number of Sides (n)', defaultValue: 6, type: 'number', min: 3, max: 100, step: 1 },
      { id: 's', label: 'Side Length (s)', defaultValue: 5, type: 'number', min: 0.0001, step: 'any' },
    ],
    calculate: (v) => {
      const n = Math.round(Number(v.n) || 3);
      const s = Number(v.s) || 0;
      if (n < 3 || s <= 0) return { primaryValue: 'Error', primaryLabel: 'Invalid', error: 'n ≥ 3 and s > 0 required.' };
      const area = (n * s * s) / (4 * Math.tan(Math.PI / n));
      const perim = n * s;
      const apothem = s / (2 * Math.tan(Math.PI / n));
      return {
        primaryValue: parseFloat(area.toFixed(4)),
        primaryUnit: 'sq units',
        primaryLabel: 'Polygon Area',
        secondaryOutputs: [
          { label: 'Perimeter', value: perim, unit: 'units' },
          { label: 'Apothem (Inradius)', value: parseFloat(apothem.toFixed(4)), unit: 'units' },
          { label: 'Interior Angle', value: parseFloat((((n - 2) * 180) / n).toFixed(2)), unit: '°' },
        ],
        steps: [`Perimeter = ${n} × ${s} = ${perim}`, `Apothem = ${s} / (2 · tan(π/${n})) = ${apothem.toFixed(4)}`, `Area = 0.5 × Perimeter × Apothem = ${area.toFixed(4)}`],
        formulaUsed: 'A = (n · s²) / (4 · tan(π/n))',
      };
    },
  },
  {
    slug: 'cylinder-calculator',
    title: 'Cylinder Calculator',
    category: 'geometry',
    formulaDisplay: 'V = π r² h, SA = 2 π r (r + h)',
    inputs: [
      { id: 'radius', label: 'Radius (r)', defaultValue: 4, type: 'number', min: 0.0001, step: 'any', unit: 'cm' },
      { id: 'height', label: 'Height (h)', defaultValue: 10, type: 'number', min: 0.0001, step: 'any', unit: 'cm' },
    ],
    calculate: (v) => {
      const r = Number(v.radius) || 0;
      const h = Number(v.height) || 0;
      if (r <= 0 || h <= 0) return { primaryValue: 'Error', primaryLabel: 'Invalid', error: 'Radius and height must be > 0.' };
      const vol = Math.PI * r * r * h;
      const sa = 2 * Math.PI * r * (r + h);
      const lateral = 2 * Math.PI * r * h;
      return {
        primaryValue: parseFloat(vol.toFixed(4)),
        primaryUnit: 'cubic units',
        primaryLabel: 'Cylinder Volume',
        secondaryOutputs: [
          { label: 'Total Surface Area', value: parseFloat(sa.toFixed(4)), unit: 'sq units' },
          { label: 'Lateral Surface Area', value: parseFloat(lateral.toFixed(4)), unit: 'sq units' },
          { label: 'Base Area', value: parseFloat((Math.PI * r * r).toFixed(4)), unit: 'sq units' },
        ],
        steps: [`Volume = π × ${r}² × ${h} = ${vol.toFixed(4)}`, `Surface Area = 2π·${r}(${r} + ${h}) = ${sa.toFixed(4)}`],
        formulaUsed: 'V = π·r²·h, SA = 2·π·r·(r+h)',
      };
    },
  },
  {
    slug: 'sphere-calculator',
    title: 'Sphere Calculator',
    category: 'geometry',
    formulaDisplay: 'V = (4/3) π r³, SA = 4 π r²',
    inputs: [
      { id: 'radius', label: 'Radius (r)', defaultValue: 5, type: 'number', min: 0.0001, step: 'any', unit: 'cm' },
    ],
    calculate: (v) => {
      const r = Number(v.radius) || 0;
      if (r <= 0) return { primaryValue: 'Error', primaryLabel: 'Invalid', error: 'Radius must be > 0.' };
      const vol = (4 / 3) * Math.PI * Math.pow(r, 3);
      const sa = 4 * Math.PI * r * r;
      return {
        primaryValue: parseFloat(vol.toFixed(4)),
        primaryUnit: 'cubic units',
        primaryLabel: 'Sphere Volume',
        secondaryOutputs: [
          { label: 'Surface Area', value: parseFloat(sa.toFixed(4)), unit: 'sq units' },
          { label: 'Diameter', value: 2 * r, unit: 'units' },
          { label: 'Circumference (Great Circle)', value: parseFloat((2 * Math.PI * r).toFixed(4)), unit: 'units' },
        ],
        steps: [`Volume = (4/3) × π × ${r}³ = ${vol.toFixed(4)}`, `Surface Area = 4 × π × ${r}² = ${sa.toFixed(4)}`],
        formulaUsed: 'V = (4/3)·π·r³, SA = 4·π·r²',
      };
    },
  },
  {
    slug: 'cone-calculator',
    title: 'Cone Calculator',
    category: 'geometry',
    formulaDisplay: 'V = (1/3) π r² h, SA = π r (r + √(h² + r²))',
    inputs: [
      { id: 'radius', label: 'Radius (r)', defaultValue: 3, type: 'number', min: 0.0001, step: 'any', unit: 'cm' },
      { id: 'height', label: 'Height (h)', defaultValue: 8, type: 'number', min: 0.0001, step: 'any', unit: 'cm' },
    ],
    calculate: (v) => {
      const r = Number(v.radius) || 0;
      const h = Number(v.height) || 0;
      if (r <= 0 || h <= 0) return { primaryValue: 'Error', primaryLabel: 'Invalid', error: 'Radius and height must be > 0.' };
      const slant = Math.sqrt(r * r + h * h);
      const vol = (1 / 3) * Math.PI * r * r * h;
      const sa = Math.PI * r * (r + slant);
      return {
        primaryValue: parseFloat(vol.toFixed(4)),
        primaryUnit: 'cubic units',
        primaryLabel: 'Cone Volume',
        secondaryOutputs: [
          { label: 'Total Surface Area', value: parseFloat(sa.toFixed(4)), unit: 'sq units' },
          { label: 'Slant Height (s)', value: parseFloat(slant.toFixed(4)), unit: 'units' },
          { label: 'Lateral Area', value: parseFloat((Math.PI * r * slant).toFixed(4)), unit: 'sq units' },
        ],
        steps: [`Slant height s = √(${r}² + ${h}²) = ${slant.toFixed(4)}`, `Volume = (1/3)π × ${r}² × ${h} = ${vol.toFixed(4)}`, `Surface Area = π·${r}(${r} + ${slant.toFixed(4)}) = ${sa.toFixed(4)}`],
        formulaUsed: 'V = (1/3)π·r²·h, SA = π·r(r + s)',
      };
    },
  },
  {
    slug: 'cube-calculator',
    title: 'Cube Calculator',
    category: 'geometry',
    formulaDisplay: 'V = s³, SA = 6 s², d = s √3',
    inputs: [
      { id: 'side', label: 'Edge Length (s)', defaultValue: 4, type: 'number', min: 0.0001, step: 'any', unit: 'cm' },
    ],
    calculate: (v) => {
      const s = Number(v.side) || 0;
      if (s <= 0) return { primaryValue: 'Error', primaryLabel: 'Invalid', error: 'Edge length must be > 0.' };
      const vol = Math.pow(s, 3);
      const sa = 6 * s * s;
      const spaceDiag = s * Math.sqrt(3);
      const faceDiag = s * Math.sqrt(2);
      return {
        primaryValue: parseFloat(vol.toFixed(4)),
        primaryUnit: 'cubic units',
        primaryLabel: 'Cube Volume',
        secondaryOutputs: [
          { label: 'Total Surface Area', value: parseFloat(sa.toFixed(4)), unit: 'sq units' },
          { label: 'Space Diagonal', value: parseFloat(spaceDiag.toFixed(4)), unit: 'units' },
          { label: 'Face Diagonal', value: parseFloat(faceDiag.toFixed(4)), unit: 'units' },
        ],
        steps: [`Volume = ${s}³ = ${vol}`, `Surface Area = 6 × ${s}² = ${sa}`, `Space Diagonal = ${s}√3 = ${spaceDiag.toFixed(4)}`],
        formulaUsed: 'V = s³, SA = 6s², d = s√3',
      };
    },
  },
  {
    slug: 'rectangular-prism-calculator',
    title: 'Rectangular Prism Calculator',
    category: 'geometry',
    formulaDisplay: 'V = L × W × H, SA = 2(LW + LH + WH)',
    inputs: [
      { id: 'l', label: 'Length (L)', defaultValue: 6, type: 'number', min: 0.0001, step: 'any' },
      { id: 'w', label: 'Width (W)', defaultValue: 4, type: 'number', min: 0.0001, step: 'any' },
      { id: 'h', label: 'Height (H)', defaultValue: 5, type: 'number', min: 0.0001, step: 'any' },
    ],
    calculate: (v) => {
      const l = Number(v.l) || 0;
      const w = Number(v.w) || 0;
      const h = Number(v.h) || 0;
      if (l <= 0 || w <= 0 || h <= 0) return { primaryValue: 'Error', primaryLabel: 'Invalid', error: 'All dimensions must be > 0.' };
      const vol = l * w * h;
      const sa = 2 * (l * w + l * h + w * h);
      const diag = Math.sqrt(l * l + w * w + h * h);
      return {
        primaryValue: parseFloat(vol.toFixed(4)),
        primaryUnit: 'cubic units',
        primaryLabel: 'Prism Volume',
        secondaryOutputs: [
          { label: 'Total Surface Area', value: parseFloat(sa.toFixed(4)), unit: 'sq units' },
          { label: 'Space Diagonal', value: parseFloat(diag.toFixed(4)), unit: 'units' },
        ],
        steps: [`Volume = ${l} × ${w} × ${h} = ${vol}`, `Surface Area = 2(${l * w} + ${l * h} + ${w * h}) = ${sa}`],
        formulaUsed: 'V = L·W·H, SA = 2(LW + LH + WH)',
      };
    },
  },
  {
    slug: 'pyramid-calculator',
    title: 'Pyramid Calculator',
    category: 'geometry',
    formulaDisplay: 'V = (1/3) × Base Area × Height',
    inputs: [
      { id: 'l', label: 'Base Length (l)', defaultValue: 8, type: 'number', min: 0.0001, step: 'any' },
      { id: 'w', label: 'Base Width (w)', defaultValue: 8, type: 'number', min: 0.0001, step: 'any' },
      { id: 'h', label: 'Height (h)', defaultValue: 9, type: 'number', min: 0.0001, step: 'any' },
    ],
    calculate: (v) => {
      const l = Number(v.l) || 0;
      const w = Number(v.w) || 0;
      const h = Number(v.h) || 0;
      if (l <= 0 || w <= 0 || h <= 0) return { primaryValue: 'Error', primaryLabel: 'Invalid', error: 'All dimensions must be > 0.' };
      const baseArea = l * w;
      const vol = (1 / 3) * baseArea * h;
      return {
        primaryValue: parseFloat(vol.toFixed(4)),
        primaryUnit: 'cubic units',
        primaryLabel: 'Pyramid Volume',
        secondaryOutputs: [
          { label: 'Base Area', value: baseArea, unit: 'sq units' },
        ],
        steps: [`Base Area = ${l} × ${w} = ${baseArea}`, `Volume = (1/3) × ${baseArea} × ${h} = ${vol.toFixed(4)}`],
        formulaUsed: 'V = (1/3)·B·h',
      };
    },
  },
  {
    slug: 'pythagorean-theorem-calculator',
    title: 'Pythagorean Theorem Calculator',
    category: 'geometry',
    formulaDisplay: 'a² + b² = c² → c = √(a² + b²)',
    inputs: [
      { id: 'a', label: 'Side a', defaultValue: 3, type: 'number', min: 0.0001, step: 'any' },
      { id: 'b', label: 'Side b', defaultValue: 4, type: 'number', min: 0.0001, step: 'any' },
    ],
    calculate: (v) => {
      const a = Number(v.a) || 0;
      const b = Number(v.b) || 0;
      if (a <= 0 || b <= 0) return { primaryValue: 'Error', primaryLabel: 'Invalid', error: 'Leg lengths must be > 0.' };
      const c = Math.sqrt(a * a + b * b);
      const area = 0.5 * a * b;
      const angleA = (Math.atan(a / b) * 180) / Math.PI;
      const angleB = 90 - angleA;
      return {
        primaryValue: parseFloat(c.toFixed(4)),
        primaryUnit: 'units',
        primaryLabel: 'Hypotenuse (c)',
        secondaryOutputs: [
          { label: 'Triangle Area', value: parseFloat(area.toFixed(4)), unit: 'sq units' },
          { label: 'Perimeter', value: parseFloat((a + b + c).toFixed(4)), unit: 'units' },
          { label: 'Angle α (opp a)', value: parseFloat(angleA.toFixed(2)), unit: '°' },
          { label: 'Angle β (opp b)', value: parseFloat(angleB.toFixed(2)), unit: '°' },
        ],
        steps: [`c² = ${a}² + ${b}² = ${a * a} + ${b * b} = ${a * a + b * b}`, `c = √${a * a + b * b} = ${c.toFixed(4)}`],
        formulaUsed: 'c = √(a² + b²)',
      };
    },
  },
  {
    slug: 'distance-formula-calculator',
    title: 'Distance Formula Calculator',
    category: 'geometry',
    formulaDisplay: 'd = √((x₂ - x₁)² + (y₂ - y₁)²)',
    inputs: [
      { id: 'x1', label: 'x₁', defaultValue: 1, type: 'number', step: 'any' },
      { id: 'y1', label: 'y₁', defaultValue: 2, type: 'number', step: 'any' },
      { id: 'x2', label: 'x₂', defaultValue: 5, type: 'number', step: 'any' },
      { id: 'y2', label: 'y₂', defaultValue: 5, type: 'number', step: 'any' },
    ],
    calculate: (v) => {
      const x1 = Number(v.x1) || 0;
      const y1 = Number(v.y1) || 0;
      const x2 = Number(v.x2) || 0;
      const y2 = Number(v.y2) || 0;
      const dx = x2 - x1;
      const dy = y2 - y1;
      const d = Math.sqrt(dx * dx + dy * dy);
      return {
        primaryValue: parseFloat(d.toFixed(4)),
        primaryLabel: 'Euclidean Distance (d)',
        secondaryOutputs: [
          { label: 'Δx', value: dx },
          { label: 'Δy', value: dy },
          { label: 'Midpoint', value: `((${(x1 + x2) / 2}, ${(y1 + y2) / 2})` },
        ],
        steps: [`Δx = ${x2} - ${x1} = ${dx}`, `Δy = ${y2} - ${y1} = ${dy}`, `d = √(${dx}² + ${dy}²) = √${dx * dx + dy * dy} = ${d.toFixed(4)}`],
        formulaUsed: 'd = √((Δx)² + (Δy)²)',
      };
    },
  },
  {
    slug: 'midpoint-calculator',
    title: 'Midpoint Calculator',
    category: 'geometry',
    formulaDisplay: 'M = ((x₁ + x₂) / 2, (y₁ + y₂) / 2)',
    inputs: [
      { id: 'x1', label: 'x₁', defaultValue: -2, type: 'number', step: 'any' },
      { id: 'y1', label: 'y₁', defaultValue: 4, type: 'number', step: 'any' },
      { id: 'x2', label: 'x₂', defaultValue: 6, type: 'number', step: 'any' },
      { id: 'y2', label: 'y₂', defaultValue: 10, type: 'number', step: 'any' },
    ],
    calculate: (v) => {
      const x1 = Number(v.x1) || 0;
      const y1 = Number(v.y1) || 0;
      const x2 = Number(v.x2) || 0;
      const y2 = Number(v.y2) || 0;
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      return {
        primaryValue: `(${mx}, ${my})`,
        primaryLabel: 'Midpoint Coordinates (M)',
        secondaryOutputs: [
          { label: 'Midpoint X', value: mx },
          { label: 'Midpoint Y', value: my },
        ],
        steps: [`x_m = (${x1} + ${x2}) / 2 = ${mx}`, `y_m = (${y1} + ${y2}) / 2 = ${my}`],
        formulaUsed: 'M = ((x₁+x₂)/2, (y₁+y₂)/2)',
      };
    },
  },
  {
    slug: 'slope-calculator',
    title: 'Slope Calculator',
    category: 'geometry',
    formulaDisplay: 'm = (y₂ - y₁) / (x₂ - x₁)',
    inputs: [
      { id: 'x1', label: 'x₁', defaultValue: 2, type: 'number', step: 'any' },
      { id: 'y1', label: 'y₁', defaultValue: 3, type: 'number', step: 'any' },
      { id: 'x2', label: 'x₂', defaultValue: 6, type: 'number', step: 'any' },
      { id: 'y2', label: 'y₂', defaultValue: 11, type: 'number', step: 'any' },
    ],
    calculate: (v) => {
      const x1 = Number(v.x1) || 0;
      const y1 = Number(v.y1) || 0;
      const x2 = Number(v.x2) || 0;
      const y2 = Number(v.y2) || 0;
      if (x2 === x1) {
        return { primaryValue: 'Undefined', primaryLabel: 'Slope (Vertical Line)', error: 'Vertical line (x₂ = x₁). Slope is undefined.' };
      }
      const m = (y2 - y1) / (x2 - x1);
      const angle = (Math.atan(m) * 180) / Math.PI;
      const yInt = y1 - m * x1;
      return {
        primaryValue: parseFloat(m.toFixed(4)),
        primaryLabel: 'Line Slope (m)',
        secondaryOutputs: [
          { label: 'Angle of Inclination', value: parseFloat(angle.toFixed(2)), unit: '°' },
          { label: 'Y-Intercept (b)', value: parseFloat(yInt.toFixed(4)) },
          { label: 'Equation (y = mx + b)', value: `y = ${m.toFixed(2)}x + ${yInt.toFixed(2)}` },
        ],
        steps: [`m = (${y2} - ${y1}) / (${x2} - ${x1}) = ${y2 - y1} / ${x2 - x1} = ${m.toFixed(4)}`],
        formulaUsed: 'm = Δy / Δx',
      };
    },
  },
  {
    slug: 'circle-sector-calculator',
    title: 'Circle Sector Calculator',
    category: 'geometry',
    formulaDisplay: 'Area = (θ / 360) × π r², Arc Length = (θ / 360) × 2 π r',
    inputs: [
      { id: 'r', label: 'Radius (r)', defaultValue: 6, type: 'number', min: 0.0001, step: 'any' },
      { id: 'theta', label: 'Central Angle (θ in degrees)', defaultValue: 60, type: 'number', min: 0.0001, max: 360, step: 'any' },
    ],
    calculate: (v) => {
      const r = Number(v.r) || 0;
      const theta = Number(v.theta) || 0;
      if (r <= 0 || theta <= 0) return { primaryValue: 'Error', primaryLabel: 'Invalid', error: 'Radius and angle must be > 0.' };
      const frac = theta / 360;
      const area = frac * Math.PI * r * r;
      const arc = frac * 2 * Math.PI * r;
      return {
        primaryValue: parseFloat(area.toFixed(4)),
        primaryUnit: 'sq units',
        primaryLabel: 'Sector Area',
        secondaryOutputs: [
          { label: 'Arc Length', value: parseFloat(arc.toFixed(4)), unit: 'units' },
          { label: 'Perimeter of Sector', value: parseFloat((arc + 2 * r).toFixed(4)), unit: 'units' },
        ],
        steps: [`Fraction of circle = ${theta} / 360 = ${frac.toFixed(4)}`, `Sector Area = ${frac.toFixed(4)} × π × ${r}² = ${area.toFixed(4)}`],
        formulaUsed: 'A = (θ/360)·π·r²',
      };
    },
  },
  {
    slug: 'ellipse-calculator',
    title: 'Ellipse Calculator',
    category: 'geometry',
    formulaDisplay: 'Area = π × a × b, Perimeter ≈ π[3(a+b) - √((3a+b)(a+3b))]',
    inputs: [
      { id: 'a', label: 'Semi-Major Axis (a)', defaultValue: 8, type: 'number', min: 0.0001, step: 'any' },
      { id: 'b', label: 'Semi-Minor Axis (b)', defaultValue: 5, type: 'number', min: 0.0001, step: 'any' },
    ],
    calculate: (v) => {
      const a = Number(v.a) || 0;
      const b = Number(v.b) || 0;
      if (a <= 0 || b <= 0) return { primaryValue: 'Error', primaryLabel: 'Invalid', error: 'Axes must be > 0.' };
      const area = Math.PI * a * b;
      const h = Math.pow(a - b, 2) / Math.pow(a + b, 2);
      const perim = Math.PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
      const ecc = Math.sqrt(1 - Math.pow(Math.min(a, b) / Math.max(a, b), 2));
      return {
        primaryValue: parseFloat(area.toFixed(4)),
        primaryUnit: 'sq units',
        primaryLabel: 'Ellipse Area',
        secondaryOutputs: [
          { label: 'Circumference (Ramanujan Approx)', value: parseFloat(perim.toFixed(4)), unit: 'units' },
          { label: 'Eccentricity (e)', value: parseFloat(ecc.toFixed(4)) },
        ],
        steps: [`Area = π × ${a} × ${b} = ${area.toFixed(4)}`, `Ramanujan Circumference = ${perim.toFixed(4)}`],
        formulaUsed: 'A = π·a·b',
      };
    },
  },
  {
    slug: 'torus-calculator',
    title: 'Torus Calculator',
    category: 'geometry',
    formulaDisplay: 'V = 2 π² R r², SA = 4 π² R r',
    inputs: [
      { id: 'R', label: 'Major Radius (R)', defaultValue: 10, type: 'number', min: 0.0001, step: 'any' },
      { id: 'r', label: 'Minor Radius (r)', defaultValue: 3, type: 'number', min: 0.0001, step: 'any' },
    ],
    calculate: (v) => {
      const R = Number(v.R) || 0;
      const r = Number(v.r) || 0;
      if (R <= r || r <= 0) return { primaryValue: 'Error', primaryLabel: 'Invalid', error: 'Major radius R must be greater than minor radius r > 0.' };
      const vol = 2 * Math.PI * Math.PI * R * r * r;
      const sa = 4 * Math.PI * Math.PI * R * r;
      return {
        primaryValue: parseFloat(vol.toFixed(4)),
        primaryUnit: 'cubic units',
        primaryLabel: 'Torus Volume',
        secondaryOutputs: [
          { label: 'Surface Area', value: parseFloat(sa.toFixed(4)), unit: 'sq units' },
        ],
        steps: [`Volume = 2 × π² × ${R} × ${r}² = ${vol.toFixed(4)}`, `Surface Area = 4 × π² × ${R} × ${r} = ${sa.toFixed(4)}`],
        formulaUsed: 'V = 2π²Rr², SA = 4π²Rr',
      };
    },
  },
  {
    slug: 'hexagon-calculator',
    title: 'Hexagon Calculator',
    category: 'geometry',
    formulaDisplay: 'Area = (3√3 / 2) × s², Perimeter = 6 × s',
    inputs: [
      { id: 's', label: 'Side Length (s)', defaultValue: 6, type: 'number', min: 0.0001, step: 'any' },
    ],
    calculate: (v) => {
      const s = Number(v.s) || 0;
      if (s <= 0) return { primaryValue: 'Error', primaryLabel: 'Invalid', error: 'Side must be > 0.' };
      const area = ((3 * Math.sqrt(3)) / 2) * s * s;
      const perim = 6 * s;
      const dLong = 2 * s;
      const dShort = s * Math.sqrt(3);
      return {
        primaryValue: parseFloat(area.toFixed(4)),
        primaryUnit: 'sq units',
        primaryLabel: 'Hexagon Area',
        secondaryOutputs: [
          { label: 'Perimeter', value: perim, unit: 'units' },
          { label: 'Max Diagonal (across corners)', value: dLong, unit: 'units' },
          { label: 'Min Diagonal (across flats)', value: parseFloat(dShort.toFixed(4)), unit: 'units' },
        ],
        steps: [`Area = (3√3 / 2) × ${s}² = ${area.toFixed(4)}`, `Perimeter = 6 × ${s} = ${perim}`],
        formulaUsed: 'A = (3√3/2)·s²',
      };
    },
  },

  // ALGEBRA
  {
    slug: 'quadratic-formula-calculator',
    title: 'Quadratic Formula Calculator',
    category: 'algebra',
    formulaDisplay: 'x = (-b ± √(b² - 4ac)) / (2a)',
    inputs: [
      { id: 'a', label: 'Coefficient a', defaultValue: 1, type: 'number', step: 'any' },
      { id: 'b', label: 'Coefficient b', defaultValue: -5, type: 'number', step: 'any' },
      { id: 'c', label: 'Coefficient c', defaultValue: 6, type: 'number', step: 'any' },
    ],
    calculate: (v) => {
      const a = Number(v.a) || 0;
      const b = Number(v.b) || 0;
      const c = Number(v.c) || 0;
      if (a === 0) return { primaryValue: 'Linear Equation', primaryLabel: 'a cannot be 0', error: 'Coefficient a cannot be 0 for quadratic.' };
      const disc = b * b - 4 * a * c;
      if (disc > 0) {
        const x1 = (-b + Math.sqrt(disc)) / (2 * a);
        const x2 = (-b - Math.sqrt(disc)) / (2 * a);
        return {
          primaryValue: `x₁ = ${x1}, x₂ = ${x2}`,
          primaryLabel: 'Two Real Roots',
          secondaryOutputs: [
            { label: 'Discriminant (Δ)', value: disc },
            { label: 'Vertex (h, k)', value: `(${(-b / (2 * a)).toFixed(2)}, ${(c - (b * b) / (4 * a)).toFixed(2)})` },
          ],
          steps: [`Discriminant Δ = ${b}² - 4(${a})(${c}) = ${disc} > 0`, `x₁ = (-${b} + √${disc}) / ${2 * a} = ${x1}`, `x₂ = (-${b} - √${disc}) / ${2 * a} = ${x2}`],
          formulaUsed: 'Quadratic Formula',
        };
      } else if (disc === 0) {
        const x = -b / (2 * a);
        return {
          primaryValue: `x = ${x}`,
          primaryLabel: 'One Repeated Real Root',
          secondaryOutputs: [{ label: 'Discriminant (Δ)', value: 0 }],
          steps: [`Δ = 0 → x = -${b} / ${2 * a} = ${x}`],
          formulaUsed: 'x = -b / 2a',
        };
      } else {
        const real = (-b / (2 * a)).toFixed(4);
        const imag = (Math.sqrt(-disc) / (2 * a)).toFixed(4);
        return {
          primaryValue: `${real} ± ${imag}i`,
          primaryLabel: 'Two Complex Roots',
          secondaryOutputs: [{ label: 'Discriminant (Δ)', value: disc }],
          steps: [`Δ = ${disc} < 0 → Complex conjugate roots`],
          formulaUsed: 'x = (-b ± i√|Δ|) / 2a',
        };
      }
    },
  },
  {
    slug: 'linear-equation-calculator',
    title: 'Linear Equation Calculator',
    category: 'algebra',
    formulaDisplay: 'ax + b = c → x = (c - b) / a',
    inputs: [
      { id: 'a', label: 'Coefficient a', defaultValue: 3, type: 'number', step: 'any' },
      { id: 'b', label: 'Constant b', defaultValue: 5, type: 'number', step: 'any' },
      { id: 'c', label: 'Right Hand Side c', defaultValue: 20, type: 'number', step: 'any' },
    ],
    calculate: (v) => {
      const a = Number(v.a) || 0;
      const b = Number(v.b) || 0;
      const c = Number(v.c) || 0;
      if (a === 0) return { primaryValue: 'Error', primaryLabel: 'No Solution / Infinite', error: 'a cannot be 0.' };
      const x = (c - b) / a;
      return {
        primaryValue: parseFloat(x.toFixed(4)),
        primaryLabel: 'Solution (x)',
        secondaryOutputs: [
          { label: 'Equation', value: `${a}x + ${b} = ${c}` },
          { label: 'Subtracted RHS (c - b)', value: c - b },
        ],
        steps: [`${a}x = ${c} - ${b} = ${c - b}`, `x = ${c - b} / ${a} = ${x.toFixed(4)}`],
        formulaUsed: 'x = (c - b) / a',
      };
    },
  },
  {
    slug: 'system-of-equations-calculator',
    title: '2x2 System of Equations Calculator',
    category: 'algebra',
    formulaDisplay: 'a₁x + b₁y = c₁, a₂x + b₂y = c₂ (Cramer Rule)',
    inputs: [
      { id: 'a1', label: 'a₁', defaultValue: 2, type: 'number', step: 'any' },
      { id: 'b1', label: 'b₁', defaultValue: 3, type: 'number', step: 'any' },
      { id: 'c1', label: 'c₁', defaultValue: 13, type: 'number', step: 'any' },
      { id: 'a2', label: 'a₂', defaultValue: 4, type: 'number', step: 'any' },
      { id: 'b2', label: 'b₂', defaultValue: -1, type: 'number', step: 'any' },
      { id: 'c2', label: 'c₂', defaultValue: 5, type: 'number', step: 'any' },
    ],
    calculate: (v) => {
      const a1 = Number(v.a1) || 0, b1 = Number(v.b1) || 0, c1 = Number(v.c1) || 0;
      const a2 = Number(v.a2) || 0, b2 = Number(v.b2) || 0, c2 = Number(v.c2) || 0;
      const det = a1 * b2 - a2 * b1;
      if (det === 0) return { primaryValue: 'Parallel / Dependent', primaryLabel: 'Determinant = 0', error: 'Lines are parallel or identical (no unique solution).' };
      const x = (c1 * b2 - c2 * b1) / det;
      const y = (a1 * c2 - a2 * c1) / det;
      return {
        primaryValue: `x = ${parseFloat(x.toFixed(4))}, y = ${parseFloat(y.toFixed(4))}`,
        primaryLabel: 'Intersection Solution',
        secondaryOutputs: [
          { label: 'x value', value: parseFloat(x.toFixed(4)) },
          { label: 'y value', value: parseFloat(y.toFixed(4)) },
          { label: 'System Determinant (D)', value: det },
        ],
        steps: [`Determinant D = (${a1})(${b2}) - (${a2})(${b1}) = ${det}`, `D_x = (${c1})(${b2}) - (${c2})(${b1}) = ${c1 * b2 - c2 * b1}`, `x = D_x / D = ${x.toFixed(4)}`, `y = D_y / D = ${y.toFixed(4)}`],
        formulaUsed: "Cramer's Rule for 2x2 Linear System",
      };
    },
  },
  {
    slug: 'polynomial-roots-calculator',
    title: 'Polynomial Roots Calculator',
    category: 'algebra',
    formulaDisplay: 'P(x) = ax² + bx + c = 0',
    inputs: [
      { id: 'a', label: 'Degree 2 (a)', defaultValue: 1, type: 'number', step: 'any' },
      { id: 'b', label: 'Degree 1 (b)', defaultValue: -7, type: 'number', step: 'any' },
      { id: 'c', label: 'Constant (c)', defaultValue: 12, type: 'number', step: 'any' },
    ],
    calculate: (v) => {
      const a = Number(v.a) || 1, b = Number(v.b) || 0, c = Number(v.c) || 0;
      const disc = b * b - 4 * a * c;
      if (disc >= 0) {
        const r1 = (-b + Math.sqrt(disc)) / (2 * a);
        const r2 = (-b - Math.sqrt(disc)) / (2 * a);
        return {
          primaryValue: `${r1}, ${r2}`,
          primaryLabel: 'Real Roots',
          secondaryOutputs: [{ label: 'Discriminant', value: disc }],
          steps: [`Roots solved via quadratic theorem: ${r1} and ${r2}`],
          formulaUsed: 'Fundamental Theorem of Algebra',
        };
      }
      return { primaryValue: 'Complex Roots', primaryLabel: 'Roots', steps: ['Negative discriminant generates complex root pair.'] };
    },
  },
  {
    slug: 'factoring-calculator',
    title: 'Factoring Calculator',
    category: 'algebra',
    formulaDisplay: 'ax² + bx + c = a(x - r₁)(x - r₂)',
    inputs: [
      { id: 'b', label: 'Linear term (b in x² + bx + c)', defaultValue: 5, type: 'number', step: 'any' },
      { id: 'c', label: 'Constant (c)', defaultValue: 6, type: 'number', step: 'any' },
    ],
    calculate: (v) => {
      const b = Number(v.b) || 0, c = Number(v.c) || 0;
      const disc = b * b - 4 * c;
      if (disc < 0) return { primaryValue: 'Prime over Reals', primaryLabel: 'Non-factorable', steps: ['Cannot be factored with real rational integers.'] };
      const r1 = (-b + Math.sqrt(disc)) / 2;
      const r2 = (-b - Math.sqrt(disc)) / 2;
      const p1 = -r1 >= 0 ? `+ ${-r1}` : `- ${Math.abs(-r1)}`;
      const p2 = -r2 >= 0 ? `+ ${-r2}` : `- ${Math.abs(-r2)}`;
      return {
        primaryValue: `(x ${p1})(x ${p2})`,
        primaryLabel: 'Factored Form',
        secondaryOutputs: [{ label: 'Root 1', value: r1 }, { label: 'Root 2', value: r2 }],
        steps: [`Found factors summing to ${b} and multiplying to ${c}: (x ${p1})(x ${p2})`],
        formulaUsed: '(x - r1)(x - r2)',
      };
    },
  },
  {
    slug: 'arithmetic-sequence-calculator',
    title: 'Arithmetic Sequence Calculator',
    category: 'algebra',
    formulaDisplay: 'a_n = a₁ + (n - 1)d, S_n = (n/2)(2a₁ + (n-1)d)',
    inputs: [
      { id: 'a1', label: 'First Term (a₁)', defaultValue: 3, type: 'number', step: 'any' },
      { id: 'd', label: 'Common Difference (d)', defaultValue: 4, type: 'number', step: 'any' },
      { id: 'n', label: 'Term Number (n)', defaultValue: 10, type: 'number', min: 1, step: 1 },
    ],
    calculate: (v) => {
      const a1 = Number(v.a1) || 0;
      const d = Number(v.d) || 0;
      const n = Math.max(1, Math.round(Number(v.n) || 1));
      const an = a1 + (n - 1) * d;
      const sum = (n / 2) * (a1 + an);
      return {
        primaryValue: an,
        primaryLabel: `${n}th Term (a_${n})`,
        secondaryOutputs: [
          { label: `Sum of first ${n} terms (S_${n})`, value: sum },
          { label: 'First 5 terms', value: Array.from({ length: 5 }, (_, i) => a1 + i * d).join(', ') },
        ],
        steps: [`a_${n} = ${a1} + (${n} - 1) × ${d} = ${an}`, `S_${n} = (${n}/2) × (${a1} + ${an}) = ${sum}`],
        formulaUsed: 'a_n = a₁ + (n-1)d',
      };
    },
  },
  {
    slug: 'geometric-sequence-calculator',
    title: 'Geometric Sequence Calculator',
    category: 'algebra',
    formulaDisplay: 'a_n = a₁ × r^(n-1), S_n = a₁(1 - r^n) / (1 - r)',
    inputs: [
      { id: 'a1', label: 'First Term (a₁)', defaultValue: 2, type: 'number', step: 'any' },
      { id: 'r', label: 'Common Ratio (r)', defaultValue: 3, type: 'number', step: 'any' },
      { id: 'n', label: 'Term Number (n)', defaultValue: 6, type: 'number', min: 1, step: 1 },
    ],
    calculate: (v) => {
      const a1 = Number(v.a1) || 0;
      const r = Number(v.r) || 0;
      const n = Math.max(1, Math.round(Number(v.n) || 1));
      const an = a1 * Math.pow(r, n - 1);
      const sum = r === 1 ? a1 * n : (a1 * (1 - Math.pow(r, n))) / (1 - r);
      return {
        primaryValue: an,
        primaryLabel: `${n}th Term (a_${n})`,
        secondaryOutputs: [
          { label: `Sum of first ${n} terms (S_${n})`, value: parseFloat(sum.toFixed(4)) },
        ],
        steps: [`a_${n} = ${a1} × ${r}^(${n}-1) = ${an}`, `Sum = ${sum.toFixed(4)}`],
        formulaUsed: 'a_n = a₁ · r^(n-1)',
      };
    },
  },
  {
    slug: 'matrix-determinant-calculator',
    title: '2x2 Matrix Determinant Calculator',
    category: 'algebra',
    formulaDisplay: 'det(A) = ad - bc',
    inputs: [
      { id: 'a', label: 'Row 1, Col 1 (a)', defaultValue: 4, type: 'number', step: 'any' },
      { id: 'b', label: 'Row 1, Col 2 (b)', defaultValue: 7, type: 'number', step: 'any' },
      { id: 'c', label: 'Row 2, Col 1 (c)', defaultValue: 2, type: 'number', step: 'any' },
      { id: 'd', label: 'Row 2, Col 2 (d)', defaultValue: 6, type: 'number', step: 'any' },
    ],
    calculate: (v) => {
      const a = Number(v.a) || 0, b = Number(v.b) || 0, c = Number(v.c) || 0, d = Number(v.d) || 0;
      const det = a * d - b * c;
      return {
        primaryValue: det,
        primaryLabel: 'Determinant det(A)',
        secondaryOutputs: [
          { label: 'Invertible?', value: det !== 0 ? 'Yes (det ≠ 0)' : 'No (Singular)' },
          { label: 'Trace (a + d)', value: a + d },
        ],
        steps: [`det(A) = (${a})(${d}) - (${b})(${c}) = ${a * d} - ${b * c} = ${det}`],
        formulaUsed: 'det = ad - bc',
      };
    },
  },
  {
    slug: 'matrix-multiplication-calculator',
    title: '2x2 Matrix Multiplication Calculator',
    category: 'algebra',
    formulaDisplay: 'C = A × B',
    inputs: [
      { id: 'a11', label: 'A[1,1]', defaultValue: 1, type: 'number', step: 'any' },
      { id: 'a12', label: 'A[1,2]', defaultValue: 2, type: 'number', step: 'any' },
      { id: 'a21', label: 'A[2,1]', defaultValue: 3, type: 'number', step: 'any' },
      { id: 'a22', label: 'A[2,2]', defaultValue: 4, type: 'number', step: 'any' },
      { id: 'b11', label: 'B[1,1]', defaultValue: 2, type: 'number', step: 'any' },
      { id: 'b12', label: 'B[1,2]', defaultValue: 0, type: 'number', step: 'any' },
      { id: 'b21', label: 'B[2,1]', defaultValue: 1, type: 'number', step: 'any' },
      { id: 'b22', label: 'B[2,2]', defaultValue: 2, type: 'number', step: 'any' },
    ],
    calculate: (v) => {
      const a11 = Number(v.a11) || 0, a12 = Number(v.a12) || 0, a21 = Number(v.a21) || 0, a22 = Number(v.a22) || 0;
      const b11 = Number(v.b11) || 0, b12 = Number(v.b12) || 0, b21 = Number(v.b21) || 0, b22 = Number(v.b22) || 0;
      const c11 = a11 * b11 + a12 * b21;
      const c12 = a11 * b12 + a12 * b22;
      const c21 = a21 * b11 + a22 * b21;
      const c22 = a21 * b12 + a22 * b22;
      return {
        primaryValue: `[[${c11}, ${c12}], [${c21}, ${c22}]]`,
        primaryLabel: 'Product Matrix C',
        secondaryOutputs: [
          { label: 'C[1,1]', value: c11 },
          { label: 'C[1,2]', value: c12 },
          { label: 'C[2,1]', value: c21 },
          { label: 'C[2,2]', value: c22 },
        ],
        steps: [`c11 = (${a11})(${b11}) + (${a12})(${b21}) = ${c11}`, `c12 = (${a11})(${b12}) + (${a12})(${b22}) = ${c12}`, `c21 = (${a21})(${b11}) + (${a22})(${b21}) = ${c21}`, `c22 = (${a21})(${b12}) + (${a22})(${b22}) = ${c22}`],
        formulaUsed: 'Matrix Dot Product Multiplication',
      };
    },
  },
  {
    slug: 'slope-intercept-calculator',
    title: 'Slope-Intercept Calculator',
    category: 'algebra',
    formulaDisplay: 'y = mx + b',
    inputs: [
      { id: 'm', label: 'Slope (m)', defaultValue: 2.5, type: 'number', step: 'any' },
      { id: 'b', label: 'Y-Intercept (b)', defaultValue: -4, type: 'number', step: 'any' },
    ],
    calculate: (v) => {
      const m = Number(v.m) || 0;
      const b = Number(v.b) || 0;
      const xInt = m !== 0 ? -b / m : 'None (Horizontal)';
      return {
        primaryValue: `y = ${m}x ${b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`}`,
        primaryLabel: 'Linear Equation',
        secondaryOutputs: [
          { label: 'Slope (m)', value: m },
          { label: 'Y-Intercept (0, b)', value: `(0, ${b})` },
          { label: 'X-Intercept', value: typeof xInt === 'number' ? `(${parseFloat(xInt.toFixed(4))}, 0)` : xInt },
        ],
        steps: [`At x = 0, y = ${b}`, `At y = 0, 0 = ${m}x + ${b} → x = ${xInt}`],
        formulaUsed: 'y = mx + b',
      };
    },
  },
  {
    slug: 'complex-number-calculator',
    title: 'Complex Number Calculator',
    category: 'algebra',
    formulaDisplay: '(a + bi) ± (c + di)',
    inputs: [
      { id: 'a', label: 'Real Part 1 (a)', defaultValue: 3, type: 'number', step: 'any' },
      { id: 'b', label: 'Imaginary Part 1 (b)', defaultValue: 4, type: 'number', step: 'any' },
      { id: 'c', label: 'Real Part 2 (c)', defaultValue: 1, type: 'number', step: 'any' },
      { id: 'd', label: 'Imaginary Part 2 (d)', defaultValue: -2, type: 'number', step: 'any' },
    ],
    calculate: (v) => {
      const a = Number(v.a) || 0, b = Number(v.b) || 0, c = Number(v.c) || 0, d = Number(v.d) || 0;
      const sumR = a + c;
      const sumI = b + d;
      const prodR = a * c - b * d;
      const prodI = a * d + b * c;
      const mag1 = Math.sqrt(a * a + b * b);
      return {
        primaryValue: `${sumR} ${sumI >= 0 ? `+ ${sumI}i` : `- ${Math.abs(sumI)}i`}`,
        primaryLabel: 'Sum (z₁ + z₂)',
        secondaryOutputs: [
          { label: 'Product (z₁ × z₂)', value: `${prodR} ${prodI >= 0 ? `+ ${prodI}i` : `- ${Math.abs(prodI)}i`}` },
          { label: '|z₁| Magnitude', value: parseFloat(mag1.toFixed(4)) },
        ],
        steps: [`Sum: (${a}+${c}) + (${b}+${d})i = ${sumR} + ${sumI}i`, `Product: (${a}·${c} - ${b}·${d}) + (${a}·${d} + ${b}·${c})i = ${prodR} + ${prodI}i`],
        formulaUsed: 'Complex Algebra',
      };
    },
  },
  {
    slug: 'exponential-growth-calculator',
    title: 'Exponential Growth Calculator',
    category: 'algebra',
    formulaDisplay: 'N(t) = N₀ × (1 + r)^t',
    inputs: [
      { id: 'n0', label: 'Initial Amount (N₀)', defaultValue: 1000, type: 'number', min: 0, step: 'any' },
      { id: 'r', label: 'Growth Rate (r in %)', defaultValue: 7, type: 'number', step: 'any' },
      { id: 't', label: 'Time Periods (t)', defaultValue: 10, type: 'number', min: 0, step: 'any' },
    ],
    calculate: (v) => {
      const n0 = Number(v.n0) || 0;
      const r = (Number(v.r) || 0) / 100;
      const t = Number(v.t) || 0;
      const res = n0 * Math.pow(1 + r, t);
      const doubling = r > 0 ? Math.log(2) / Math.log(1 + r) : 0;
      return {
        primaryValue: parseFloat(res.toFixed(4)),
        primaryLabel: 'Final Amount N(t)',
        secondaryOutputs: [
          { label: 'Absolute Growth', value: parseFloat((res - n0).toFixed(4)) },
          { label: 'Doubling Time', value: doubling > 0 ? `${doubling.toFixed(2)} periods` : 'N/A' },
        ],
        steps: [`Factor: (1 + ${r})^${t} = ${Math.pow(1 + r, t).toFixed(4)}`, `N(${t}) = ${n0} × ${Math.pow(1 + r, t).toFixed(4)} = ${res.toFixed(4)}`],
        formulaUsed: 'N(t) = N₀(1 + r)^t',
      };
    },
  },
  {
    slug: 'foil-calculator',
    title: 'FOIL Binomial Multiplier',
    category: 'algebra',
    formulaDisplay: '(ax + b)(cx + d) = ac·x² + (ad + bc)x + bd',
    inputs: [
      { id: 'a', label: 'a (in ax + b)', defaultValue: 2, type: 'number', step: 'any' },
      { id: 'b', label: 'b', defaultValue: 3, type: 'number', step: 'any' },
      { id: 'c', label: 'c (in cx + d)', defaultValue: 4, type: 'number', step: 'any' },
      { id: 'd', label: 'd', defaultValue: -5, type: 'number', step: 'any' },
    ],
    calculate: (v) => {
      const a = Number(v.a) || 0, b = Number(v.b) || 0, c = Number(v.c) || 0, d = Number(v.d) || 0;
      const first = a * c;
      const outer = a * d;
      const inner = b * c;
      const last = b * d;
      const middle = outer + inner;
      return {
        primaryValue: `${first}x² ${middle >= 0 ? `+ ${middle}x` : `- ${Math.abs(middle)}x`} ${last >= 0 ? `+ ${last}` : `- ${Math.abs(last)}`}`,
        primaryLabel: 'Expanded Polynomial',
        secondaryOutputs: [
          { label: 'First (ac)', value: first },
          { label: 'Outer (ad)', value: outer },
          { label: 'Inner (bc)', value: inner },
          { label: 'Last (bd)', value: last },
        ],
        steps: [`First: ${a} · ${c} = ${first}x²`, `Outer + Inner: ${outer}x + ${inner}x = ${middle}x`, `Last: ${b} · ${d} = ${last}`],
        formulaUsed: 'FOIL Method',
      };
    },
  },
  {
    slug: 'synthetic-division-calculator',
    title: 'Synthetic Division Calculator',
    category: 'algebra',
    formulaDisplay: 'P(x) ÷ (x - c)',
    inputs: [
      { id: 'c', label: 'Root c (in divisor x - c)', defaultValue: 2, type: 'number', step: 'any' },
      { id: 'coeffs', label: 'Dividend Coefficients (comma-separated)', defaultValue: '1, -4, 5, -2', type: 'text' },
    ],
    calculate: (v) => {
      const c = Number(v.c) || 0;
      const raw = String(v.coeffs || '');
      const coeffs = raw.split(/[s,]+/).map(Number).filter((n) => !isNaN(n));
      if (coeffs.length < 2) return { primaryValue: 'Error', primaryLabel: 'Invalid', error: 'At least 2 coefficients required.' };
      const res = [coeffs[0]];
      for (let i = 1; i < coeffs.length; i++) {
        res.push(coeffs[i] + res[i - 1] * c);
      }
      const remainder = res.pop()!;
      return {
        primaryValue: `Quotient: [${res.join(', ')}], Remainder: ${remainder}`,
        primaryLabel: 'Synthetic Division Result',
        secondaryOutputs: [
          { label: 'Remainder P(c)', value: remainder },
          { label: 'Is (x - c) a factor?', value: remainder === 0 ? 'Yes' : 'No' },
        ],
        steps: [`Evaluated polynomial at root ${c} via Horner-Ruffini synthetic scheme. Remainder = ${remainder}`],
        formulaUsed: 'Ruffini-Horner Synthetic Algorithm',
      };
    },
  },
  {
    slug: 'binomial-expansion-calculator',
    title: 'Binomial Expansion Calculator',
    category: 'algebra',
    formulaDisplay: '(a + b)^n = Σ (n choose k) a^(n-k) b^k',
    inputs: [
      { id: 'n', label: 'Power (n)', defaultValue: 4, type: 'number', min: 0, max: 15, step: 1 },
    ],
    calculate: (v) => {
      const n = Math.max(0, Math.min(15, Math.round(Number(v.n) || 0)));
      const comb = (n: number, k: number): number => {
        if (k < 0 || k > n) return 0;
        let c = 1;
        for (let i = 1; i <= k; i++) c = (c * (n - (k - i))) / i;
        return Math.round(c);
      };
      const terms: string[] = [];
      for (let k = 0; k <= n; k++) {
        const c = comb(n, k);
        const aPow = n - k;
        const bPow = k;
        let t = `${c > 1 ? c : ''}`;
        if (aPow > 0) t += `a${aPow > 1 ? `^${aPow}` : ''}`;
        if (bPow > 0) t += `b${bPow > 1 ? `^${bPow}` : ''}`;
        if (!t) t = '1';
        terms.push(t);
      }
      return {
        primaryValue: terms.join(' + '),
        primaryLabel: `(a + b)^${n} Expansion`,
        secondaryOutputs: [
          { label: 'Number of terms', value: n + 1 },
          { label: 'Binomial Coefficients', value: Array.from({ length: n + 1 }, (_, k) => comb(n, k)).join(', ') },
        ],
        steps: [`Pascal triangle row for n = ${n}`],
        formulaUsed: 'Binomial Theorem',
      };
    },
  },
];
