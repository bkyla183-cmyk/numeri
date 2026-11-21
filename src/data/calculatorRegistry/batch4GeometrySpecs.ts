import { CalculatorSpec } from './types';
import { parseNum, calcError } from './validation';

const fmt = (n: number, d = 4): number => {
  if (!Number.isFinite(n)) return 0;
  const r = Number(n.toFixed(d));
  return Object.is(r, -0) ? 0 : r;
};

export const batch4GeometrySpecs: CalculatorSpec[] = [
  // 675. Rectangle Area, Perimeter & Diagonal
  {
    slug: 'rectangle-perimeter-diagonal-calculator',
    title: 'Rectangle Area, Perimeter & Diagonal Calculator',
    category: 'geometry',
    formulaDisplay: 'A = L·W   |   P = 2(L+W)   |   d = √(L² + W²)',
    inputs: [
      { id: 'length', label: 'Length (L)', type: 'number', defaultValue: 12, min: 0.001, max: 1e9, step: 0.5 },
      { id: 'width', label: 'Width (W)', type: 'number', defaultValue: 5, min: 0.001, max: 1e9, step: 0.5 },
    ],
    calculate: (v) => {
      const l = parseNum(v.length);
      const w = parseNum(v.width);
      if (Number.isNaN(l) || Number.isNaN(w) || l <= 0 || w <= 0) return calcError('Enter positive length and width.');
      return {
        primaryValue: fmt(l * w, 4),
        primaryUnit: 'sq units',
        primaryLabel: 'Rectangle Area',
        secondaryOutputs: [
          { label: 'Perimeter (P)', value: fmt(2 * (l + w), 4) },
          { label: 'Diagonal (d)', value: fmt(Math.hypot(l, w), 4) },
          { label: 'Aspect Ratio (L:W)', value: fmt(l / w, 3) },
        ],
        steps: [`Area = ${l}×${w} = ${fmt(l * w, 4)}; Diagonal = √(${l}²+${w}²) = ${fmt(Math.hypot(l, w), 4)}.`],
      };
    },
  },

  // 676. Trapezoid Area & Median
  {
    slug: 'trapezoid-area-median-calculator',
    title: 'Trapezoid Area & Midsegment Median Calculator',
    category: 'geometry',
    formulaDisplay: 'A = ((a + b) / 2) × h',
    inputs: [
      { id: 'baseA', label: 'Top Parallel Base (a)', type: 'number', defaultValue: 8, min: 0.001, max: 1e9, step: 0.5 },
      { id: 'baseB', label: 'Bottom Parallel Base (b)', type: 'number', defaultValue: 14, min: 0.001, max: 1e9, step: 0.5 },
      { id: 'height', label: 'Perpendicular Height (h)', type: 'number', defaultValue: 6, min: 0.001, max: 1e9, step: 0.5 },
    ],
    calculate: (v) => {
      const [a, b, h] = [v.baseA, v.baseB, v.height].map(parseNum);
      if ([a, b, h].some(Number.isNaN) || a <= 0 || b <= 0 || h <= 0) return calcError('Enter positive bases and height.');
      const median = (a + b) / 2;
      const area = median * h;
      const isoLeg = Math.hypot((b - a) / 2, h);
      return {
        primaryValue: fmt(area, 4),
        primaryUnit: 'sq units',
        primaryLabel: 'Trapezoid Area',
        secondaryOutputs: [
          { label: 'Midsegment / Median (m)', value: fmt(median, 4) },
          { label: 'Isosceles Leg Length (if symmetric)', value: fmt(isoLeg, 4) },
        ],
        steps: [`Median = (${a}+${b})/2 = ${fmt(median, 4)}; Area = ${fmt(median, 4)} × ${h} = ${fmt(area, 4)}.`],
      };
    },
  },

  // 677. Parallelogram & Rhombus
  {
    slug: 'parallelogram-rhombus-calculator',
    title: 'Parallelogram & Rhombus Area and Diagonals Calculator',
    category: 'geometry',
    formulaDisplay: 'Parallelogram: A = b·h = a·b·sin(θ)   |   Rhombus: A = (p·q)/2',
    inputs: [
      { id: 'sideA', label: 'Side a', type: 'number', defaultValue: 10, min: 0.001, max: 1e9, step: 0.5 },
      { id: 'baseB', label: 'Base b', type: 'number', defaultValue: 14, min: 0.001, max: 1e9, step: 0.5 },
      { id: 'angleDeg', label: 'Interior Angle θ (Degrees)', type: 'number', unit: '°', defaultValue: 60, min: 0.1, max: 179.9, step: 1 },
    ],
    calculate: (v) => {
      const [a, b, ang] = [v.sideA, v.baseB, v.angleDeg].map(parseNum);
      if ([a, b, ang].some(Number.isNaN) || a <= 0 || b <= 0 || ang <= 0 || ang >= 180) return calcError('Sides must be positive and angle strictly between 0° and 180°.');
      const rad = (ang * Math.PI) / 180;
      const h = a * Math.sin(rad);
      const area = b * h;
      const p = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(rad));
      const q = Math.sqrt(a * a + b * b + 2 * a * b * Math.cos(rad));
      return {
        primaryValue: fmt(area, 4),
        primaryUnit: 'sq units',
        primaryLabel: 'Parallelogram Area',
        secondaryOutputs: [
          { label: 'Perpendicular Height (h)', value: fmt(h, 4) },
          { label: 'Perimeter', value: fmt(2 * (a + b), 4) },
          { label: 'Diagonals (p, q)', value: `${fmt(p, 3)}, ${fmt(q, 3)}` },
        ],
        steps: [`h = ${a}·sin(${ang}°) = ${fmt(h, 4)}; Area = ${b} × ${fmt(h, 4)} = ${fmt(area, 4)}.`],
      };
    },
  },

  // 678. Regular Polygon Apothem & Area
  {
    slug: 'regular-polygon-apothem-calculator',
    title: 'Regular n-Gon Area, Apothem & Interior Angle Calculator',
    category: 'geometry',
    formulaDisplay: 'Apothem r = s / (2·tan(π/n))   |   Area = (n·s²) / (4·tan(π/n))',
    inputs: [
      { id: 'sides', label: 'Number of Sides (n ≥ 3)', type: 'number', defaultValue: 6, min: 3, max: 1000, step: 1 },
      { id: 'sideLength', label: 'Side Length (s)', type: 'number', defaultValue: 10, min: 0.001, max: 1e9, step: 0.5 },
    ],
    calculate: (v) => {
      const n = Math.round(parseNum(v.sides));
      const s = parseNum(v.sideLength);
      if (Number.isNaN(n) || Number.isNaN(s) || n < 3 || s <= 0) return calcError('Enter n >= 3 sides and positive side length.');
      const apothem = s / (2 * Math.tan(Math.PI / n));
      const area = (n * s * apothem) / 2;
      const circumradius = s / (2 * Math.sin(Math.PI / n));
      const interiorDeg = ((n - 2) * 180) / n;
      return {
        primaryValue: fmt(area, 4),
        primaryUnit: 'sq units',
        primaryLabel: `Regular ${n}-Gon Area`,
        secondaryOutputs: [
          { label: 'Apothem (Inradius)', value: fmt(apothem, 4) },
          { label: 'Circumradius', value: fmt(circumradius, 4) },
          { label: 'Interior / Exterior Angle', value: `${fmt(interiorDeg, 2)}° / ${fmt(360 / n, 2)}°` },
        ],
        steps: [`Apothem = ${s}/(2·tan(π/${n})) = ${fmt(apothem, 4)}; Area = ${fmt(area, 4)}.`],
      };
    },
  },

  // 679. Ellipse Area & Ramanujan Perimeter
  {
    slug: 'ellipse-area-circumference-calculator',
    title: 'Ellipse Area, Eccentricity & Perimeter Calculator',
    category: 'geometry',
    formulaDisplay: 'Area = π·a·b   |   C ≈ π(a+b)[1 + 3h/(10 + √(4 − 3h))]',
    inputs: [
      { id: 'semiMajor', label: 'Semi-Major Axis (a)', type: 'number', defaultValue: 10, min: 0.001, max: 1e9, step: 0.5 },
      { id: 'semiMinor', label: 'Semi-Minor Axis (b)', type: 'number', defaultValue: 6, min: 0.001, max: 1e9, step: 0.5 },
    ],
    calculate: (v) => {
      const a = parseNum(v.semiMajor);
      const b = parseNum(v.semiMinor);
      if (Number.isNaN(a) || Number.isNaN(b) || a <= 0 || b <= 0) return calcError('Enter positive semi-axes a and b.');
      const big = Math.max(a, b);
      const small = Math.min(a, b);
      const area = Math.PI * a * b;
      const h = ((big - small) / (big + small)) ** 2;
      const perim = Math.PI * (big + small) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
      const ecc = Math.sqrt(1 - (small * small) / (big * big));
      return {
        primaryValue: fmt(area, 4),
        primaryUnit: 'sq units',
        primaryLabel: 'Ellipse Area',
        secondaryOutputs: [
          { label: 'Circumference (Ramanujan II)', value: fmt(perim, 4) },
          { label: 'Linear Eccentricity (e)', value: fmt(ecc, 5) },
          { label: 'Focal Distance (c)', value: fmt(Math.sqrt(big * big - small * small), 4) },
        ],
        steps: [`Area = π×${a}×${b} = ${fmt(area, 4)}; Circumference ≈ ${fmt(perim, 4)}.`],
      };
    },
  },

  // 680. Circle Sector, Arc Length & Segment Calculator
  {
    slug: 'sector-arc-length-chord-calculator',
    title: 'Circle Sector Area, Arc Length & Chord Calculator',
    category: 'geometry',
    formulaDisplay: 'Arc = r·θ_rad   |   Sector Area = ½·r²·θ_rad   |   Chord = 2r·sin(θ/2)',
    inputs: [
      { id: 'radius', label: 'Circle Radius (r)', type: 'number', defaultValue: 10, min: 0.001, max: 1e9, step: 0.5 },
      { id: 'angleDeg', label: 'Central Angle θ (Degrees)', type: 'number', unit: '°', defaultValue: 90, min: 0.01, max: 360, step: 5 },
    ],
    calculate: (v) => {
      const r = parseNum(v.radius);
      const deg = parseNum(v.angleDeg);
      if (Number.isNaN(r) || Number.isNaN(deg) || r <= 0 || deg <= 0 || deg > 360) return calcError('Radius must be positive and angle between 0° and 360°.');
      const rad = (deg * Math.PI) / 180;
      const arc = r * rad;
      const sectorArea = 0.5 * r * r * rad;
      const chord = 2 * r * Math.sin(rad / 2);
      const segmentArea = 0.5 * r * r * (rad - Math.sin(rad));
      return {
        primaryValue: fmt(sectorArea, 4),
        primaryUnit: 'sq units',
        primaryLabel: 'Circular Sector Area',
        secondaryOutputs: [
          { label: 'Arc Length (s)', value: fmt(arc, 4) },
          { label: 'Chord Length (c)', value: fmt(chord, 4) },
          { label: 'Circular Segment Area', value: fmt(segmentArea, 4) },
        ],
        steps: [`θ = ${fmt(rad, 5)} rad → Arc = ${fmt(arc, 4)}; Sector Area = ${fmt(sectorArea, 4)}.`],
      };
    },
  },

  // 681. Annulus Ring Area Calculator
  {
    slug: 'annulus-ring-area-calculator',
    title: 'Annulus Ring Area & Pipe Cross-Section Calculator',
    category: 'geometry',
    formulaDisplay: 'Area = π × (R² − r²)',
    inputs: [
      { id: 'outerR', label: 'Outer Radius (R)', type: 'number', defaultValue: 10, min: 0.002, max: 1e9, step: 0.5 },
      { id: 'innerR', label: 'Inner Hole Radius (r < R)', type: 'number', defaultValue: 6, min: 0, max: 1e9, step: 0.5 },
    ],
    calculate: (v) => {
      const R = parseNum(v.outerR);
      const r = parseNum(v.innerR);
      if (Number.isNaN(R) || Number.isNaN(r) || R <= 0 || r < 0 || r >= R) return calcError('Outer radius R must strictly exceed inner radius r >= 0.');
      const area = Math.PI * (R * R - r * r);
      return {
        primaryValue: fmt(area, 4),
        primaryUnit: 'sq units',
        primaryLabel: 'Annulus Ring Area',
        secondaryOutputs: [
          { label: 'Wall Thickness (R − r)', value: fmt(R - r, 4) },
          { label: 'Total Perimeter (Outer + Inner)', value: fmt(2 * Math.PI * (R + r), 4) },
        ],
        steps: [`Area = π × (${R}² − ${r}²) = ${fmt(area, 4)}.`],
      };
    },
  },

  // 682. Right Circular Cone Calculator
  {
    slug: 'cone-volume-slant-area-calculator',
    title: 'Right Circular Cone Volume & Surface Area Calculator',
    category: 'geometry',
    formulaDisplay: 'V = (1/3)πr²h   |   Slant l = √(r² + h²)   |   A_total = πr(r + l)',
    inputs: [
      { id: 'radius', label: 'Base Radius (r)', type: 'number', defaultValue: 5, min: 0.001, max: 1e9, step: 0.5 },
      { id: 'height', label: 'Vertical Height (h)', type: 'number', defaultValue: 12, min: 0.001, max: 1e9, step: 0.5 },
    ],
    calculate: (v) => {
      const r = parseNum(v.radius);
      const h = parseNum(v.height);
      if (Number.isNaN(r) || Number.isNaN(h) || r <= 0 || h <= 0) return calcError('Enter positive cone radius and height.');
      const l = Math.hypot(r, h);
      const vol = (Math.PI * r * r * h) / 3;
      const latArea = Math.PI * r * l;
      const totArea = Math.PI * r * (r + l);
      return {
        primaryValue: fmt(vol, 4),
        primaryUnit: 'cubic units',
        primaryLabel: 'Cone Volume',
        secondaryOutputs: [
          { label: 'Total Surface Area', value: fmt(totArea, 4) },
          { label: 'Lateral Surface Area', value: fmt(latArea, 4) },
          { label: 'Slant Height (l)', value: fmt(l, 4) },
        ],
        steps: [`Slant height l = √(${r}²+${h}²) = ${fmt(l, 4)}; Volume = ${fmt(vol, 4)}.`],
      };
    },
  },

  // 683. Truncated Cone (Frustum) Calculator
  {
    slug: 'frustum-truncated-cone-calculator',
    title: 'Truncated Cone (Frustum) Volume & Surface Area Calculator',
    category: 'geometry',
    formulaDisplay: 'V = (πh/3)(R² + Rr + r²)',
    inputs: [
      { id: 'rBottom', label: 'Bottom Radius (R)', type: 'number', defaultValue: 8, min: 0.001, max: 1e9, step: 0.5 },
      { id: 'rTop', label: 'Top Radius (r)', type: 'number', defaultValue: 4, min: 0, max: 1e9, step: 0.5 },
      { id: 'height', label: 'Frustum Height (h)', type: 'number', defaultValue: 10, min: 0.001, max: 1e9, step: 0.5 },
    ],
    calculate: (v) => {
      const [R, r, h] = [v.rBottom, v.rTop, v.height].map(parseNum);
      if ([R, r, h].some(Number.isNaN) || R <= 0 || r < 0 || h <= 0) return calcError('Enter valid positive radii and height.');
      const vol = (Math.PI * h * (R * R + R * r + r * r)) / 3;
      const slant = Math.hypot(R - r, h);
      const latArea = Math.PI * (R + r) * slant;
      const totArea = latArea + Math.PI * (R * R + r * r);
      return {
        primaryValue: fmt(vol, 4),
        primaryUnit: 'cubic units',
        primaryLabel: 'Frustum Volume',
        secondaryOutputs: [
          { label: 'Total Surface Area', value: fmt(totArea, 4) },
          { label: 'Lateral Area', value: fmt(latArea, 4) },
          { label: 'Slant Height', value: fmt(slant, 4) },
        ],
        steps: [`V = (π×${h}/3)×(${R}² + ${R}×${r} + ${r}²) = ${fmt(vol, 4)}.`],
      };
    },
  },

  // 684. Square & Rectangular Pyramid Calculator
  {
    slug: 'square-pyramid-volume-calculator',
    title: 'Square & Rectangular Pyramid Volume & Surface Area Calculator',
    category: 'geometry',
    formulaDisplay: 'V = (1/3)·L·W·h',
    inputs: [
      { id: 'baseLength', label: 'Base Length (L)', type: 'number', defaultValue: 10, min: 0.001, max: 1e9, step: 0.5 },
      { id: 'baseWidth', label: 'Base Width (W)', type: 'number', defaultValue: 10, min: 0.001, max: 1e9, step: 0.5 },
      { id: 'height', label: 'Vertical Height (h)', type: 'number', defaultValue: 12, min: 0.001, max: 1e9, step: 0.5 },
    ],
    calculate: (v) => {
      const [L, W, h] = [v.baseLength, v.baseWidth, v.height].map(parseNum);
      if ([L, W, h].some(Number.isNaN) || L <= 0 || W <= 0 || h <= 0) return calcError('Enter positive pyramid dimensions.');
      const vol = (L * W * h) / 3;
      const lat = L * Math.hypot(W / 2, h) + W * Math.hypot(L / 2, h);
      const tot = L * W + lat;
      return {
        primaryValue: fmt(vol, 4),
        primaryUnit: 'cubic units',
        primaryLabel: 'Pyramid Volume',
        secondaryOutputs: [
          { label: 'Total Surface Area', value: fmt(tot, 4) },
          { label: 'Lateral Face Area', value: fmt(lat, 4) },
        ],
        steps: [`V = (${L}×${W}×${h})/3 = ${fmt(vol, 4)}; Total Area = ${fmt(tot, 4)}.`],
      };
    },
  },

  // 685. Triangular Prism Calculator
  {
    slug: 'triangular-prism-volume-calculator',
    title: 'Triangular Prism Volume & Surface Area Calculator',
    category: 'geometry',
    formulaDisplay: 'V = A_triangle × Length',
    inputs: [
      { id: 'base', label: 'Triangle Base (b)', type: 'number', defaultValue: 6, min: 0.001, max: 1e9, step: 0.5 },
      { id: 'triHeight', label: 'Triangle Height (h)', type: 'number', defaultValue: 4, min: 0.001, max: 1e9, step: 0.5 },
      { id: 'prismLength', label: 'Prism Length (L)', type: 'number', defaultValue: 15, min: 0.001, max: 1e9, step: 0.5 },
    ],
    calculate: (v) => {
      const [b, h, l] = [v.base, v.triHeight, v.prismLength].map(parseNum);
      if ([b, h, l].some(Number.isNaN) || b <= 0 || h <= 0 || l <= 0) return calcError('Enter positive dimensions.');
      const triArea = 0.5 * b * h;
      const vol = triArea * l;
      const isoSide = Math.hypot(b / 2, h);
      const surfaceIso = 2 * triArea + (b + 2 * isoSide) * l;
      return {
        primaryValue: fmt(vol, 4),
        primaryUnit: 'cubic units',
        primaryLabel: 'Triangular Prism Volume',
        secondaryOutputs: [
          { label: 'Cross-Section Triangle Area', value: fmt(triArea, 4) },
          { label: 'Surface Area (Isosceles Base)', value: fmt(surfaceIso, 4) },
        ],
        steps: [`Triangle Area = 0.5×${b}×${h} = ${fmt(triArea, 4)} × ${l} = ${fmt(vol, 4)}.`],
      };
    },
  },

  // 686. Rectangular Box / Cuboid Calculator
  {
    slug: 'rectangular-box-cube-volume-calculator',
    title: 'Rectangular Box (Cuboid) Volume, Surface & Space Diagonal Calculator',
    category: 'geometry',
    formulaDisplay: 'V = L·W·H   |   SA = 2(LW + LH + WH)   |   D = √(L² + W² + H²)',
    inputs: [
      { id: 'length', label: 'Length (L)', type: 'number', defaultValue: 10, min: 0.001, max: 1e9, step: 0.5 },
      { id: 'width', label: 'Width (W)', type: 'number', defaultValue: 6, min: 0.001, max: 1e9, step: 0.5 },
      { id: 'height', label: 'Height (H)', type: 'number', defaultValue: 4, min: 0.001, max: 1e9, step: 0.5 },
    ],
    calculate: (v) => {
      const [l, w, h] = [v.length, v.width, v.height].map(parseNum);
      if ([l, w, h].some(Number.isNaN) || l <= 0 || w <= 0 || h <= 0) return calcError('Enter positive box dimensions.');
      const vol = l * w * h;
      const sa = 2 * (l * w + l * h + w * h);
      const diag = Math.hypot(l, w, h);
      return {
        primaryValue: fmt(vol, 4),
        primaryUnit: 'cubic units',
        primaryLabel: 'Cuboid Volume',
        secondaryOutputs: [
          { label: 'Total Surface Area', value: fmt(sa, 4) },
          { label: '3D Space Diagonal', value: fmt(diag, 4) },
          { label: 'Total Edge Length', value: fmt(4 * (l + w + h), 4) },
        ],
        steps: [`V = ${l}×${w}×${h} = ${fmt(vol, 4)}; SA = ${fmt(sa, 4)}; 3D Diagonal = ${fmt(diag, 4)}.`],
      };
    },
  },

  // 687. Torus (Donut) Volume & Surface Area
  {
    slug: 'torus-donut-volume-area-calculator',
    title: 'Torus (Ring) Volume & Surface Area Calculator',
    category: 'geometry',
    formulaDisplay: 'V = 2π²·R·r²   |   SA = 4π²·R·r',
    inputs: [
      { id: 'majorR', label: 'Major Radius R (Center to Tube Center)', type: 'number', defaultValue: 10, min: 0.001, max: 1e9, step: 0.5 },
      { id: 'minorR', label: 'Minor Tube Radius r', type: 'number', defaultValue: 3, min: 0.001, max: 1e9, step: 0.5 },
    ],
    calculate: (v) => {
      const R = parseNum(v.majorR);
      const r = parseNum(v.minorR);
      if (Number.isNaN(R) || Number.isNaN(r) || R <= 0 || r <= 0 || r > R) return calcError('Require R >= r > 0 for a ring torus.');
      const vol = 2 * Math.PI * Math.PI * R * r * r;
      const sa = 4 * Math.PI * Math.PI * R * r;
      return {
        primaryValue: fmt(vol, 4),
        primaryUnit: 'cubic units',
        primaryLabel: 'Torus Volume',
        secondaryOutputs: [{ label: 'Torus Surface Area', value: fmt(sa, 4) }],
        steps: [`V = 2π²(${R})(${r}²) = ${fmt(vol, 4)}; SA = 4π²(${R})(${r}) = ${fmt(sa, 4)}.`],
      };
    },
  },

  // 688. Triaxial Ellipsoid Calculator
  {
    slug: 'ellipsoid-volume-surface-calculator',
    title: 'Triaxial Ellipsoid Volume & Surface Area Calculator',
    category: 'geometry',
    formulaDisplay: 'V = (4/3)π·a·b·c   |   SA ≈ 4π((a^p·b^p + a^p·c^p + b^p·c^p)/3)^(1/p)',
    inputs: [
      { id: 'a', label: 'Semi-Axis a', type: 'number', defaultValue: 6, min: 0.001, max: 1e9, step: 0.5 },
      { id: 'b', label: 'Semi-Axis b', type: 'number', defaultValue: 4, min: 0.001, max: 1e9, step: 0.5 },
      { id: 'c', label: 'Semi-Axis c', type: 'number', defaultValue: 3, min: 0.001, max: 1e9, step: 0.5 },
    ],
    calculate: (v) => {
      const [a, b, c] = [v.a, v.b, v.c].map(parseNum);
      if ([a, b, c].some(Number.isNaN) || a <= 0 || b <= 0 || c <= 0) return calcError('Enter positive semi-axes a, b, c.');
      const vol = (4 / 3) * Math.PI * a * b * c;
      const p = 1.6075;
      const sa = 4 * Math.PI * Math.pow((Math.pow(a * b, p) + Math.pow(a * c, p) + Math.pow(b * c, p)) / 3, 1 / p);
      return {
        primaryValue: fmt(vol, 4),
        primaryUnit: 'cubic units',
        primaryLabel: 'Ellipsoid Volume',
        secondaryOutputs: [{ label: 'Knud Thomsen Surface Area', value: fmt(sa, 4) }],
        steps: [`V = (4/3)π×${a}×${b}×${c} = ${fmt(vol, 4)}; SA ≈ ${fmt(sa, 4)}.`],
      };
    },
  },

  // 689. Law of Cosines Oblique Triangle Solver (SSS)
  {
    slug: 'law-of-cosines-triangle-solver',
    title: 'Oblique Triangle Solver (Law of Cosines & Sines)',
    category: 'geometry',
    formulaDisplay: 'cos(C) = (a² + b² − c²) / (2ab)',
    inputs: [
      { id: 'a', label: 'Side a', type: 'number', defaultValue: 7, min: 0.001, max: 1e9, step: 0.5 },
      { id: 'b', label: 'Side b', type: 'number', defaultValue: 9, min: 0.001, max: 1e9, step: 0.5 },
      { id: 'c', label: 'Side c', type: 'number', defaultValue: 12, min: 0.001, max: 1e9, step: 0.5 },
    ],
    calculate: (v) => {
      const [a, b, c] = [v.a, v.b, v.c].map(parseNum);
      if ([a, b, c].some(Number.isNaN) || a <= 0 || b <= 0 || c <= 0) return calcError('Enter positive triangle side lengths.');
      if (a + b <= c || a + c <= b || b + c <= a) return calcError('Triangle inequality violated: sum of any two sides must exceed third.');
      const deg = (rad: number) => (rad * 180) / Math.PI;
      const A = deg(Math.acos(Math.max(-1, Math.min(1, (b * b + c * c - a * a) / (2 * b * c)))));
      const B = deg(Math.acos(Math.max(-1, Math.min(1, (a * a + c * c - b * b) / (2 * a * c)))));
      const C = 180 - A - B;
      const s = (a + b + c) / 2;
      const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
      return {
        primaryValue: `${fmt(A, 2)}°, ${fmt(B, 2)}°, ${fmt(C, 2)}°`,
        primaryUnit: 'angles',
        primaryLabel: 'Solved Interior Angles (A, B, C)',
        secondaryOutputs: [
          { label: 'Triangle Area (Heron)', value: fmt(area, 4) },
          { label: 'Perimeter', value: fmt(a + b + c, 4) },
        ],
        steps: [`Law of Cosines yields A=${fmt(A, 2)}°, B=${fmt(B, 2)}°, C=${fmt(C, 2)}°; Area=${fmt(area, 4)}.`],
      };
    },
  },

  // 690. Right Triangle SOHCAHTOA Solver
  {
    slug: 'right-triangle-sohcahtoa-calculator',
    title: 'Right Triangle SOHCAHTOA Legs, Angles & Area Solver',
    category: 'geometry',
    formulaDisplay: 'c = a / cos(α)   |   b = a · tan(α)',
    inputs: [
      { id: 'adjLeg', label: 'Adjacent Side (a)', type: 'number', defaultValue: 10, min: 0.001, max: 1e9, step: 0.5 },
      { id: 'angleAlphaDeg', label: 'Acute Angle α (Degrees)', type: 'number', unit: '°', defaultValue: 35, min: 0.1, max: 89.9, step: 1 },
    ],
    calculate: (v) => {
      const a = parseNum(v.adjLeg);
      const alpha = parseNum(v.angleAlphaDeg);
      if (Number.isNaN(a) || Number.isNaN(alpha) || a <= 0 || alpha <= 0 || alpha >= 90) return calcError('Adjacent leg must be positive and acute angle strictly 0° < α < 90°.');
      const rad = (alpha * Math.PI) / 180;
      const b = a * Math.tan(rad);
      const c = a / Math.cos(rad);
      const area = 0.5 * a * b;
      return {
        primaryValue: fmt(c, 4),
        primaryUnit: 'hypotenuse (c)',
        primaryLabel: 'Solved Right Triangle Hypotenuse',
        secondaryOutputs: [
          { label: 'Opposite Leg (b)', value: fmt(b, 4) },
          { label: 'Complementary Angle β', value: `${fmt(90 - alpha, 2)}°` },
          { label: 'Triangle Area', value: fmt(area, 4) },
        ],
        steps: [`Opposite b = ${a}·tan(${alpha}°) = ${fmt(b, 4)}; Hypotenuse c = ${fmt(c, 4)}.`],
      };
    },
  },

  // 691. Equilateral Triangle Calculator
  {
    slug: 'equilateral-triangle-properties-calculator',
    title: 'Equilateral Triangle Area, Height & Circle Radii Calculator',
    category: 'geometry',
    formulaDisplay: 'A = (√3 / 4)·s²   |   h = (√3 / 2)·s',
    inputs: [
      { id: 'side', label: 'Side Length (s)', type: 'number', defaultValue: 10, min: 0.001, max: 1e9, step: 0.5 },
    ],
    calculate: (v) => {
      const s = parseNum(v.side);
      if (Number.isNaN(s) || s <= 0) return calcError('Side length must be positive.');
      const h = (Math.sqrt(3) / 2) * s;
      const area = (Math.sqrt(3) / 4) * s * s;
      const inR = h / 3;
      const circumR = (2 * h) / 3;
      return {
        primaryValue: fmt(area, 4),
        primaryUnit: 'sq units',
        primaryLabel: 'Equilateral Triangle Area',
        secondaryOutputs: [
          { label: 'Altitude Height (h)', value: fmt(h, 4) },
          { label: 'Incircle Radius (r)', value: fmt(inR, 4) },
          { label: 'Circumcircle Radius (R)', value: fmt(circumR, 4) },
        ],
        steps: [`h = ${fmt(h, 4)}; Area = (√3/4)×${s}² = ${fmt(area, 4)}.`],
      };
    },
  },

  // 692. Triangle Vertex Centroid & Shoelace Area Calculator
  {
    slug: 'centroid-triangle-coordinates-calculator',
    title: '2D Triangle Vertex Centroid & Coordinate Area Calculator',
    category: 'geometry',
    formulaDisplay: 'Centroid = ((x₁+x₂+x₃)/3, (y₁+y₂+y₃)/3)   |   Area = ½|x₁(y₂−y₃)+x₂(y₃−y₁)+x₃(y₁−y₂)|',
    inputs: [
      { id: 'x1', label: 'Vertex A (x₁)', type: 'number', defaultValue: 0, min: -1e7, max: 1e7, step: 1 },
      { id: 'y1', label: 'Vertex A (y₁)', type: 'number', defaultValue: 0, min: -1e7, max: 1e7, step: 1 },
      { id: 'x2', label: 'Vertex B (x₂)', type: 'number', defaultValue: 6, min: -1e7, max: 1e7, step: 1 },
      { id: 'y2', label: 'Vertex B (y₂)', type: 'number', defaultValue: 0, min: -1e7, max: 1e7, step: 1 },
      { id: 'x3', label: 'Vertex C (x₃)', type: 'number', defaultValue: 3, min: -1e7, max: 1e7, step: 1 },
      { id: 'y3', label: 'Vertex C (y₃)', type: 'number', defaultValue: 6, min: -1e7, max: 1e7, step: 1 },
    ],
    calculate: (v) => {
      const [x1, y1, x2, y2, x3, y3] = [v.x1, v.y1, v.x2, v.y2, v.x3, v.y3].map(parseNum);
      if ([x1, y1, x2, y2, x3, y3].some(Number.isNaN)) return calcError('Enter valid vertex coordinates.');
      const cx = (x1 + x2 + x3) / 3;
      const cy = (y1 + y2 + y3) / 3;
      const area = 0.5 * Math.abs(x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2));
      const perim = Math.hypot(x2 - x1, y2 - y1) + Math.hypot(x3 - x2, y3 - y2) + Math.hypot(x1 - x3, y1 - y3);
      return {
        primaryValue: `(${fmt(cx, 3)}, ${fmt(cy, 3)})`,
        primaryUnit: 'centroid',
        primaryLabel: 'Triangle Centroid (Center of Mass)',
        secondaryOutputs: [
          { label: 'Coordinate Area (Shoelace)', value: fmt(area, 4) },
          { label: 'Perimeter', value: fmt(perim, 4) },
        ],
        steps: [`Centroid = (${fmt(cx, 3)}, ${fmt(cy, 3)}); Shoelace Area = ${fmt(area, 4)}.`],
      };
    },
  },

  // 693. Circle Equation & Point Containment
  {
    slug: 'circle-equation-tangent-calculator',
    title: 'Standard Circle Equation & Point Distance Calculator',
    category: 'geometry',
    formulaDisplay: '(x − h)² + (y − k)² = r²',
    inputs: [
      { id: 'h', label: 'Center h (x₀)', type: 'number', defaultValue: 2, min: -1e7, max: 1e7, step: 0.5 },
      { id: 'k', label: 'Center k (y₀)', type: 'number', defaultValue: -3, min: -1e7, max: 1e7, step: 0.5 },
      { id: 'r', label: 'Radius (r)', type: 'number', defaultValue: 5, min: 0.001, max: 1e7, step: 0.5 },
      { id: 'px', label: 'Test Point P(x)', type: 'number', defaultValue: 5, min: -1e7, max: 1e7, step: 0.5 },
      { id: 'py', label: 'Test Point P(y)', type: 'number', defaultValue: 1, min: -1e7, max: 1e7, step: 0.5 },
    ],
    calculate: (v) => {
      const [h, k, r, px, py] = [v.h, v.k, v.r, v.px, v.py].map(parseNum);
      if ([h, k, r, px, py].some(Number.isNaN) || r <= 0) return calcError('Radius must be positive.');
      const dist = Math.hypot(px - h, py - k);
      const status = Math.abs(dist - r) < 1e-6 ? 'On the Circle Boundary' : dist < r ? 'Strictly Inside Circle' : 'Outside Circle';
      return {
        primaryValue: status,
        primaryUnit: `d = ${fmt(dist, 4)} vs r = ${r}`,
        primaryLabel: `(x ${h >= 0 ? '−' : '+'} ${Math.abs(h)})² + (y ${k >= 0 ? '−' : '+'} ${Math.abs(k)})² = ${fmt(r * r, 3)}`,
        secondaryOutputs: [
          { label: 'Distance from Center to P', value: fmt(dist, 4) },
          { label: 'General Form Coefficients', value: `x² + y² + (${fmt(-2 * h, 2)})x + (${fmt(-2 * k, 2)})y + (${fmt(h * h + k * k - r * r, 2)}) = 0` },
        ],
        steps: [`Distance from (${h},${k}) to (${px},${py}) = ${fmt(dist, 4)} vs radius ${r} → ${status}.`],
      };
    },
  },

  // 694. Great-Circle Haversine Distance & Bearing
  {
    slug: 'great-circle-haversine-distance-calculator',
    title: 'Earth Great-Circle Haversine Distance & Bearing Calculator',
    category: 'geometry',
    formulaDisplay: 'd = 2R · arcsin(√(sin²(Δφ/2) + cosφ₁·cosφ₂·sin²(Δλ/2))),  R = 6,371 km',
    inputs: [
      { id: 'lat1', label: 'Origin Latitude (°)', type: 'number', unit: '°', defaultValue: 40.7128, min: -90, max: 90, step: 0.1 },
      { id: 'lon1', label: 'Origin Longitude (°)', type: 'number', unit: '°', defaultValue: -74.006, min: -180, max: 180, step: 0.1 },
      { id: 'lat2', label: 'Destination Latitude (°)', type: 'number', unit: '°', defaultValue: 51.5074, min: -90, max: 90, step: 0.1 },
      { id: 'lon2', label: 'Destination Longitude (°)', type: 'number', unit: '°', defaultValue: -0.1278, min: -180, max: 180, step: 0.1 },
    ],
    calculate: (v) => {
      const [lat1, lon1, lat2, lon2] = [v.lat1, v.lon1, v.lat2, v.lon2].map(parseNum);
      if ([lat1, lon1, lat2, lon2].some(Number.isNaN) || Math.abs(lat1) > 90 || Math.abs(lat2) > 90 || Math.abs(lon1) > 180 || Math.abs(lon2) > 180) {
        return calcError('Latitudes must be ±90° and longitudes ±180°.');
      }
      const rad = (d: number) => (d * Math.PI) / 180;
      const dLat = rad(lat2 - lat1);
      const dLon = rad(lon2 - lon1);
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
      const distKm = 2 * 6371 * Math.asin(Math.sqrt(a));
      const y = Math.sin(dLon) * Math.cos(rad(lat2));
      const x = Math.cos(rad(lat1)) * Math.sin(rad(lat2)) - Math.sin(rad(lat1)) * Math.cos(rad(lat2)) * Math.cos(dLon);
      const bearing = (((Math.atan2(y, x) * 180) / Math.PI) + 360) % 360;
      return {
        primaryValue: fmt(distKm, 2),
        primaryUnit: 'km',
        primaryLabel: 'Great-Circle Geodesic Distance',
        secondaryOutputs: [
          { label: 'Statute Miles', value: `${fmt(distKm * 0.621371, 2)} mi` },
          { label: 'Nautical Miles', value: `${fmt(distKm / 1.852, 2)} NM` },
          { label: 'Initial Forward Azimuth Bearing', value: `${fmt(bearing, 1)}°` },
        ],
        steps: [`Haversine central angle using mean Earth radius 6,371 km yields ${fmt(distKm, 2)} km (Bearing ${fmt(bearing, 1)}°).`],
      };
    },
  },

  // 695. Scale Factor Area & Volume Multiplier
  {
    slug: 'scale-factor-similar-shapes-calculator',
    title: 'Geometric Scale Factor (k, k², k³) Calculator',
    category: 'geometry',
    formulaDisplay: 'Area Ratio = k²   |   Volume Ratio = k³',
    inputs: [
      { id: 'linearDim1', label: 'Original Linear Dimension (L₁)', type: 'number', defaultValue: 4, min: 0.001, max: 1e9, step: 0.5 },
      { id: 'linearDim2', label: 'Scaled Linear Dimension (L₂)', type: 'number', defaultValue: 10, min: 0.001, max: 1e9, step: 0.5 },
    ],
    calculate: (v) => {
      const l1 = parseNum(v.linearDim1);
      const l2 = parseNum(v.linearDim2);
      if (Number.isNaN(l1) || Number.isNaN(l2) || l1 <= 0 || l2 <= 0) return calcError('Dimensions must be positive.');
      const k = l2 / l1;
      return {
        primaryValue: fmt(k, 4),
        primaryUnit: '× linear (k)',
        primaryLabel: 'Linear Scale Factor (L₂ / L₁)',
        secondaryOutputs: [
          { label: 'Area Scale Factor (k²)', value: `${fmt(k * k, 4)}×` },
          { label: 'Volume / Mass Scale Factor (k³)', value: `${fmt(k * k * k, 4)}×` },
        ],
        steps: [`k = ${l2}/${l1} = ${fmt(k, 4)} → Area scales ${fmt(k * k, 4)}×; Volume scales ${fmt(k * k * k, 4)}×.`],
      };
    },
  },

  // 696. Golden Rectangle Calculator
  {
    slug: 'golden-rectangle-dimensions-calculator',
    title: 'Golden Ratio (φ) Rectangle & Aspect Dimensions Calculator',
    category: 'geometry',
    formulaDisplay: 'L = W × φ,  φ = (1 + √5) / 2 ≈ 1.6180339887',
    inputs: [
      { id: 'shortSide', label: 'Shorter Side Width (a)', type: 'number', defaultValue: 10, min: 0.001, max: 1e9, step: 0.5 },
    ],
    calculate: (v) => {
      const a = parseNum(v.shortSide);
      if (Number.isNaN(a) || a <= 0) return calcError('Enter positive shorter side length.');
      const phi = (1 + Math.sqrt(5)) / 2;
      const longSide = a * phi;
      return {
        primaryValue: fmt(longSide, 4),
        primaryUnit: 'long side',
        primaryLabel: 'Golden Rectangle Long Side (a·φ)',
        secondaryOutputs: [
          { label: 'Golden Ratio (φ)', value: fmt(phi, 6) },
          { label: 'Rectangle Area', value: fmt(a * longSide, 4) },
          { label: 'Sum (a + b)', value: fmt(a + longSide, 4) },
        ],
        steps: [`Long side = ${a} × 1.618034 = ${fmt(longSide, 4)}.`],
      };
    },
  },

  // 697. Regular Hexagon Dimensions & Area
  {
    slug: 'hexagon-honeycomb-area-calculator',
    title: 'Regular Hexagon Area, Flat-to-Flat & Span Calculator',
    category: 'geometry',
    formulaDisplay: 'A = (3√3 / 2)·s²   |   Flat-to-Flat = √3·s   |   Point-to-Point = 2s',
    inputs: [
      { id: 'side', label: 'Hexagon Side Length (s)', type: 'number', defaultValue: 8, min: 0.001, max: 1e9, step: 0.5 },
    ],
    calculate: (v) => {
      const s = parseNum(v.side);
      if (Number.isNaN(s) || s <= 0) return calcError('Enter a positive side length.');
      const area = ((3 * Math.sqrt(3)) / 2) * s * s;
      return {
        primaryValue: fmt(area, 4),
        primaryUnit: 'sq units',
        primaryLabel: 'Regular Hexagon Area',
        secondaryOutputs: [
          { label: 'Flat-to-Flat Wrench Width (√3·s)', value: fmt(Math.sqrt(3) * s, 4) },
          { label: 'Corner-to-Corner Span (2s)', value: fmt(2 * s, 4) },
          { label: 'Perimeter (6s)', value: fmt(6 * s, 4) },
        ],
        steps: [`Area = (3√3/2)×${s}² = ${fmt(area, 4)}; Flat-to-Flat = ${fmt(Math.sqrt(3) * s, 4)}.`],
      };
    },
  },

  // 698. Regular Octagon Gazebo Dimensions
  {
    slug: 'octagon-gazebo-dimensions-calculator',
    title: 'Regular Octagon Area, Span & Miter Angle Calculator',
    category: 'geometry',
    formulaDisplay: 'A = 2(1 + √2)s²   |   Flat-to-Flat = (1 + √2)s',
    inputs: [
      { id: 'side', label: 'Octagon Side Length (s)', type: 'number', defaultValue: 6, min: 0.001, max: 1e9, step: 0.5 },
    ],
    calculate: (v) => {
      const s = parseNum(v.side);
      if (Number.isNaN(s) || s <= 0) return calcError('Enter a positive octagon side.');
      const k = 1 + Math.SQRT2;
      const area = 2 * k * s * s;
      const flatToFlat = k * s;
      const longDiag = s * Math.sqrt(4 + 2 * Math.SQRT2);
      return {
        primaryValue: fmt(area, 4),
        primaryUnit: 'sq units',
        primaryLabel: 'Regular Octagon Area',
        secondaryOutputs: [
          { label: 'Flat-to-Flat Span', value: fmt(flatToFlat, 4) },
          { label: 'Point-to-Point Long Diagonal', value: fmt(longDiag, 4) },
          { label: 'Saw Miter Angle (Each Side)', value: '22.5° (135° Interior)' },
        ],
        steps: [`Area = 2(1+√2)×${s}² = ${fmt(area, 4)}; Flat span = ${fmt(flatToFlat, 4)}.`],
      };
    },
  },

  // 699. Spherical Cap (Dome) Volume & Area
  {
    slug: 'spherical-cap-dome-volume-calculator',
    title: 'Spherical Cap (Dome / Tank Head) Volume & Area Calculator',
    category: 'geometry',
    formulaDisplay: 'V = (πh²/3)(3R − h)   |   Curved Area = 2πRh',
    inputs: [
      { id: 'sphereRadius', label: 'Sphere Radius (R)', type: 'number', defaultValue: 10, min: 0.001, max: 1e9, step: 0.5 },
      { id: 'capHeight', label: 'Cap Height (0 < h ≤ 2R)', type: 'number', defaultValue: 4, min: 0.001, max: 2e9, step: 0.5 },
    ],
    calculate: (v) => {
      const R = parseNum(v.sphereRadius);
      const h = parseNum(v.capHeight);
      if (Number.isNaN(R) || Number.isNaN(h) || R <= 0 || h <= 0 || h > 2 * R) return calcError('Require 0 < h <= 2R.');
      const vol = (Math.PI * h * h * (3 * R - h)) / 3;
      const curvedArea = 2 * Math.PI * R * h;
      const baseRadius = Math.sqrt(h * (2 * R - h));
      return {
        primaryValue: fmt(vol, 4),
        primaryUnit: 'cubic units',
        primaryLabel: 'Spherical Cap Volume',
        secondaryOutputs: [
          { label: 'Curved Dome Surface Area', value: fmt(curvedArea, 4) },
          { label: 'Cap Base Radius (a)', value: fmt(baseRadius, 4) },
        ],
        steps: [`V = (π×${h}²/3)×(3×${R} − ${h}) = ${fmt(vol, 4)}; Dome area = ${fmt(curvedArea, 4)}.`],
      };
    },
  },
];
