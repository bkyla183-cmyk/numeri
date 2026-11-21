import { CalculatorSpec } from './types';
import { parseNum, calcError } from './validation';

const fmt = (n: number, d = 4): number => {
  if (!Number.isFinite(n)) return 0;
  const r = Number(n.toFixed(d));
  return Object.is(r, -0) ? 0 : r;
};

const sci = (n: number): string => {
  if (!Number.isFinite(n)) return '0';
  if (n === 0) return '0';
  return Math.abs(n) >= 1e6 || Math.abs(n) < 1e-3 ? n.toExponential(4) : String(fmt(n, 5));
};

export const batch4ScienceSpecs: CalculatorSpec[] = [
  // 806. Newton's Second Law (F = ma)
  {
    slug: 'newtons-second-law-force-calculator',
    title: 'Newton’s Second Law (F = ma) Force & Weight Calculator',
    category: 'science',
    formulaDisplay: 'F = m × a   |   Weight = m × 9.80665 m/s²',
    inputs: [
      { id: 'massKg', label: 'Object Mass (m)', type: 'number', unit: 'kg', defaultValue: 25, min: 0.0001, max: 1e12, step: 1 },
      { id: 'accel', label: 'Net Acceleration (a)', type: 'number', unit: 'm/s²', defaultValue: 4.5, min: -1e9, max: 1e9, step: 0.5 },
    ],
    calculate: (v) => {
      const m = parseNum(v.massKg);
      const a = parseNum(v.accel);
      if (Number.isNaN(m) || Number.isNaN(a) || m <= 0) return calcError('Mass must be positive.');
      const f = m * a;
      const weightN = m * 9.80665;
      return {
        primaryValue: fmt(f, 3),
        primaryUnit: 'Newtons (N)',
        primaryLabel: 'Net Applied Force',
        secondaryOutputs: [
          { label: 'Pound-Force Equivalent', value: `${fmt(f * 0.224809, 3)} lbf` },
          { label: 'Earth Surface Gravitational Weight', value: `${fmt(weightN, 2)} N` },
        ],
        steps: [`F = ${m} kg × ${a} m/s² = ${fmt(f, 3)} N.`],
      };
    },
  },

  // 807. 2D Projectile Motion Calculator
  {
    slug: 'projectile-motion-trajectory-calculator',
    title: '2D Projectile Motion Range, Height & Time of Flight Calculator',
    category: 'science',
    formulaDisplay: 'H_max = h₀ + (v₀sinθ)²/(2g)   |   t = [v₀sinθ + √((v₀sinθ)² + 2gh₀)] / g',
    inputs: [
      { id: 'v0', label: 'Initial Launch Speed (v₀)', type: 'number', unit: 'm/s', defaultValue: 30, min: 0.01, max: 1e6, step: 1 },
      { id: 'angleDeg', label: 'Launch Angle (θ)', type: 'number', unit: '°', defaultValue: 45, min: 0, max: 90, step: 1 },
      { id: 'h0', label: 'Initial Launch Height (h₀)', type: 'number', unit: 'm', defaultValue: 1.5, min: 0, max: 1e6, step: 0.5 },
    ],
    calculate: (v) => {
      const [v0, ang, h0] = [v.v0, v.angleDeg, v.h0].map(parseNum);
      if ([v0, ang, h0].some(Number.isNaN) || v0 <= 0 || ang < 0 || ang > 90 || h0 < 0) return calcError('Launch speed > 0, angle 0–90°, and height >= 0.');
      const g = 9.80665;
      const rad = (ang * Math.PI) / 180;
      const vx = v0 * Math.cos(rad);
      const vy = v0 * Math.sin(rad);
      const tFlight = (vy + Math.sqrt(vy * vy + 2 * g * h0)) / g;
      const range = vx * tFlight;
      const maxHeight = h0 + (vy * vy) / (2 * g);
      return {
        primaryValue: fmt(range, 2),
        primaryUnit: 'meters',
        primaryLabel: 'Horizontal Projectile Range',
        secondaryOutputs: [
          { label: 'Maximum Trajectory Height', value: `${fmt(maxHeight, 2)} m` },
          { label: 'Total Time of Flight', value: `${fmt(tFlight, 3)} s` },
          { label: 'Impact Speed', value: `${fmt(Math.hypot(vx, vy - g * tFlight), 2)} m/s` },
        ],
        steps: [`vx=${fmt(vx, 2)} m/s, vy=${fmt(vy, 2)} m/s → Flight ${fmt(tFlight, 3)}s, Range ${fmt(range, 2)} m.`],
      };
    },
  },

  // 808. Universal Gravitation & Orbital Velocity
  {
    slug: 'gravitational-force-orbital-velocity-calculator',
    title: 'Newton’s Gravitation, Orbital & Escape Velocity Calculator',
    category: 'science',
    formulaDisplay: 'F = G·M·m / r²   |   v_orb = √(GM / r)   |   v_esc = √(2GM / r)',
    inputs: [
      { id: 'centralMassKg', label: 'Central Body Mass (Earth = 5.9722e24 kg)', type: 'number', unit: 'kg', defaultValue: 5.9722e24, min: 1, max: 1e40, step: 1e22 },
      { id: 'radiusKm', label: 'Orbital Radius from Center (Earth Surface+400km = 6,771)', type: 'number', unit: 'km', defaultValue: 6771, min: 0.1, max: 1e12, step: 100 },
      { id: 'satMassKg', label: 'Orbiting Object Mass (m)', type: 'number', unit: 'kg', defaultValue: 500, min: 0.001, max: 1e30, step: 50 },
    ],
    calculate: (v) => {
      const [M, rKm, m] = [v.centralMassKg, v.radiusKm, v.satMassKg].map(parseNum);
      if ([M, rKm, m].some(Number.isNaN) || M <= 0 || rKm <= 0 || m <= 0) return calcError('All masses and radius must be positive.');
      const G = 6.6743e-11;
      const r = rKm * 1000;
      const force = (G * M * m) / (r * r);
      const vOrb = Math.sqrt((G * M) / r);
      const vEsc = Math.SQRT2 * vOrb;
      const periodMin = (2 * Math.PI * r) / vOrb / 60;
      return {
        primaryValue: fmt(vOrb / 1000, 3),
        primaryUnit: 'km/s',
        primaryLabel: 'Circular Orbital Velocity',
        secondaryOutputs: [
          { label: 'Local Escape Velocity', value: `${fmt(vEsc / 1000, 3)} km/s` },
          { label: 'Orbital Period', value: `${fmt(periodMin, 1)} min` },
          { label: 'Gravitational Force (F)', value: `${sci(force)} N` },
        ],
        steps: [`G=6.6743e-11 → v_orb=${fmt(vOrb, 1)} m/s (${fmt(vOrb / 1000, 3)} km/s), period=${fmt(periodMin, 1)} min.`],
      };
    },
  },

  // 809. Centripetal Force & Acceleration
  {
    slug: 'centripetal-force-acceleration-calculator',
    title: 'Centripetal Force, Acceleration & G-Force Calculator',
    category: 'science',
    formulaDisplay: 'a_c = v² / r   |   F_c = m·v² / r',
    inputs: [
      { id: 'massKg', label: 'Object Mass (m)', type: 'number', unit: 'kg', defaultValue: 1500, min: 0.001, max: 1e10, step: 50 },
      { id: 'speedMs', label: 'Tangential Speed (v)', type: 'number', unit: 'm/s', defaultValue: 25, min: 0, max: 1e6, step: 1 },
      { id: 'radiusM', label: 'Turn Radius (r)', type: 'number', unit: 'm', defaultValue: 50, min: 0.01, max: 1e9, step: 5 },
    ],
    calculate: (v) => {
      const [m, vel, r] = [v.massKg, v.speedMs, v.radiusM].map(parseNum);
      if ([m, vel, r].some(Number.isNaN) || m <= 0 || vel < 0 || r <= 0) return calcError('Mass and radius must be positive.');
      const ac = (vel * vel) / r;
      const fc = m * ac;
      const gs = ac / 9.80665;
      return {
        primaryValue: fmt(fc, 2),
        primaryUnit: 'Newtons (N)',
        primaryLabel: 'Centripetal Force',
        secondaryOutputs: [
          { label: 'Centripetal Acceleration (a_c)', value: `${fmt(ac, 3)} m/s²` },
          { label: 'Lateral G-Force', value: `${fmt(gs, 3)} g` },
        ],
        steps: [`a_c = ${vel}² ÷ ${r} = ${fmt(ac, 3)} m/s² (${fmt(gs, 2)} g) → F_c = ${fmt(fc, 2)} N.`],
      };
    },
  },

  // 810. 1D Momentum & Elastic Collision
  {
    slug: 'momentum-elastic-collision-calculator',
    title: '1D Momentum & Perfectly Elastic Collision Calculator',
    category: 'science',
    formulaDisplay: 'v₁′ = ((m₁−m₂)v₁ + 2m₂v₂)/(m₁+m₂)',
    inputs: [
      { id: 'm1', label: 'Object 1 Mass (m₁)', type: 'number', unit: 'kg', defaultValue: 4, min: 0.001, max: 1e9, step: 0.5 },
      { id: 'v1', label: 'Object 1 Initial Velocity (v₁)', type: 'number', unit: 'm/s', defaultValue: 6, min: -1e6, max: 1e6, step: 1 },
      { id: 'm2', label: 'Object 2 Mass (m₂)', type: 'number', unit: 'kg', defaultValue: 2, min: 0.001, max: 1e9, step: 0.5 },
      { id: 'v2', label: 'Object 2 Initial Velocity (v₂)', type: 'number', unit: 'm/s', defaultValue: -3, min: -1e6, max: 1e6, step: 1 },
    ],
    calculate: (v) => {
      const [m1, v1, m2, v2] = [v.m1, v.v1, v.m2, v.v2].map(parseNum);
      if ([m1, v1, m2, v2].some(Number.isNaN) || m1 <= 0 || m2 <= 0) return calcError('Masses must be positive.');
      const totP = m1 * v1 + m2 * v2;
      const v1f = ((m1 - m2) * v1 + 2 * m2 * v2) / (m1 + m2);
      const v2f = (2 * m1 * v1 + (m2 - m1) * v2) / (m1 + m2);
      const vInelastic = totP / (m1 + m2);
      return {
        primaryValue: fmt(v1f, 3),
        primaryUnit: 'm/s (v₁′)',
        primaryLabel: `Post-Collision Velocities: v₁′=${fmt(v1f, 2)}, v₂′=${fmt(v2f, 2)} m/s`,
        secondaryOutputs: [
          { label: 'Object 2 Final Velocity (Elastic v₂′)', value: `${fmt(v2f, 3)} m/s` },
          { label: 'Perfectly Inelastic Sticking Velocity', value: `${fmt(vInelastic, 3)} m/s` },
          { label: 'Conserved Total Momentum', value: `${fmt(totP, 3)} kg·m/s` },
        ],
        steps: [`Total p = ${fmt(totP, 2)} kg·m/s → Elastic v₁′=${fmt(v1f, 3)} m/s, v₂′=${fmt(v2f, 3)} m/s.`],
      };
    },
  },

  // 811. Hooke's Law & Spring Potential Energy
  {
    slug: 'potential-energy-spring-hookes-law-calculator',
    title: 'Hooke’s Law & Elastic Spring Potential Energy Calculator',
    category: 'science',
    formulaDisplay: 'F_s = −k·x   |   PE_elastic = ½·k·x²',
    inputs: [
      { id: 'springK', label: 'Spring Stiffness Constant (k)', type: 'number', unit: 'N/m', defaultValue: 400, min: 0.001, max: 1e9, step: 10 },
      { id: 'displacementM', label: 'Displacement from Equilibrium (x)', type: 'number', unit: 'm', defaultValue: 0.25, min: 0, max: 1000, step: 0.05 },
    ],
    calculate: (v) => {
      const k = parseNum(v.springK);
      const x = parseNum(v.displacementM);
      if (Number.isNaN(k) || Number.isNaN(x) || k <= 0 || x < 0) return calcError('Spring constant must be positive.');
      const force = k * x;
      const pe = 0.5 * k * x * x;
      return {
        primaryValue: fmt(pe, 4),
        primaryUnit: 'Joules (J)',
        primaryLabel: 'Stored Elastic Potential Energy',
        secondaryOutputs: [{ label: 'Restoring Force Magnitude |F|', value: `${fmt(force, 2)} N` }],
        steps: [`PE = 0.5 × ${k} × ${x}² = ${fmt(pe, 4)} J; Force = ${fmt(force, 2)} N.`],
      };
    },
  },

  // 812. Mechanical Work, Torque & Shaft Horsepower
  {
    slug: 'work-mechanical-power-torque-calculator',
    title: 'Mechanical Torque, Angular RPM & Shaft Power Calculator',
    category: 'science',
    formulaDisplay: 'P (Watts) = τ (N·m) × ω (rad/s)   |   HP = (τ_lb·ft × RPM) / 5252',
    inputs: [
      { id: 'torqueNm', label: 'Shaft Torque (τ)', type: 'number', unit: 'N·m', defaultValue: 180, min: 0, max: 1e8, step: 10 },
      { id: 'rpm', label: 'Rotational Speed', type: 'number', unit: 'RPM', defaultValue: 3000, min: 0, max: 1e6, step: 100 },
    ],
    calculate: (v) => {
      const tau = parseNum(v.torqueNm);
      const rpm = parseNum(v.rpm);
      if (Number.isNaN(tau) || Number.isNaN(rpm) || tau < 0 || rpm < 0) return calcError('Torque and RPM must be non-negative.');
      const omega = (2 * Math.PI * rpm) / 60;
      const watts = tau * omega;
      const hp = watts / 745.69987;
      return {
        primaryValue: fmt(watts / 1000, 3),
        primaryUnit: 'kW',
        primaryLabel: `Mechanical Shaft Power (${fmt(hp, 2)} HP)`,
        secondaryOutputs: [
          { label: 'Imperial Horsepower (HP)', value: `${fmt(hp, 2)} hp` },
          { label: 'Torque in Foot-Pounds', value: `${fmt(tau * 0.737562, 2)} lb·ft` },
          { label: 'Angular Velocity (ω)', value: `${fmt(omega, 2)} rad/s` },
        ],
        steps: [`ω = ${fmt(omega, 2)} rad/s → Power = ${tau} × ${fmt(omega, 2)} = ${fmt(watts / 1000, 3)} kW (${fmt(hp, 2)} hp).`],
      };
    },
  },

  // 813. Simple Pendulum Period & Frequency
  {
    slug: 'pendulum-period-frequency-calculator',
    title: 'Simple Pendulum Period, Frequency & Gravity Calculator',
    category: 'science',
    formulaDisplay: 'T = 2π √(L / g)',
    inputs: [
      { id: 'lengthM', label: 'Pendulum String Length (L)', type: 'number', unit: 'm', defaultValue: 1.0, min: 0.001, max: 1e6, step: 0.1 },
      { id: 'gravity', label: 'Gravitational Acceleration (g)', type: 'number', unit: 'm/s²', defaultValue: 9.80665, min: 0.1, max: 1000, step: 0.1 },
    ],
    calculate: (v) => {
      const L = parseNum(v.lengthM);
      const g = parseNum(v.gravity);
      if (Number.isNaN(L) || Number.isNaN(g) || L <= 0 || g <= 0) return calcError('Length and gravity must be positive.');
      const T = 2 * Math.PI * Math.sqrt(L / g);
      const f = 1 / T;
      return {
        primaryValue: fmt(T, 4),
        primaryUnit: 'seconds',
        primaryLabel: 'Full Oscillation Period (T)',
        secondaryOutputs: [
          { label: 'Frequency (f = 1/T)', value: `${fmt(f, 4)} Hz` },
          { label: 'Beats Per Minute (Half-Swings)', value: `${fmt(120 / T, 1)} bpm` },
        ],
        steps: [`T = 2π·√(${L} ÷ ${g}) = ${fmt(T, 4)} s (f = ${fmt(f, 4)} Hz).`],
      };
    },
  },

  // 814. Snell's Law Refraction & Critical Angle
  {
    slug: 'snells-law-refraction-critical-angle-calculator',
    title: 'Snell’s Law Refraction & Critical Angle Calculator',
    category: 'science',
    formulaDisplay: 'n₁·sin(θ₁) = n₂·sin(θ₂)   |   θ_c = arcsin(n₂ / n₁)',
    inputs: [
      { id: 'n1', label: 'Incident Medium Index (n₁)', type: 'number', defaultValue: 1.5, min: 1.0, max: 5.0, step: 0.05 },
      { id: 'n2', label: 'Transmitted Medium Index (n₂)', type: 'number', defaultValue: 1.0, min: 1.0, max: 5.0, step: 0.05 },
      { id: 'theta1Deg', label: 'Incident Angle (θ₁ from Normal)', type: 'number', unit: '°', defaultValue: 30, min: 0, max: 89.9, step: 1 },
    ],
    calculate: (v) => {
      const [n1, n2, t1] = [v.n1, v.n2, v.theta1Deg].map(parseNum);
      if ([n1, n2, t1].some(Number.isNaN) || n1 < 1 || n2 < 1 || t1 < 0 || t1 >= 90) return calcError('Refractive indices >= 1.0 and 0 <= θ₁ < 90°.');
      const sinT2 = (n1 / n2) * Math.sin((t1 * Math.PI) / 180);
      const crit = n1 > n2 ? `${fmt((Math.asin(n2 / n1) * 180) / Math.PI, 2)}°` : 'None (n₁ ≤ n₂)';
      if (sinT2 > 1) {
        return {
          primaryValue: 'Total Internal Reflection',
          primaryUnit: `θ_c = ${crit}`,
          primaryLabel: `No Refracted Ray (θ₁ > Critical Angle ${crit})`,
          secondaryOutputs: [{ label: 'Critical Angle (θ_c)', value: crit }],
          steps: [`(n₁/n₂)sin(${t1}°) = ${fmt(sinT2, 3)} > 1 → Total internal reflection occurs.`],
        };
      }
      const t2 = (Math.asin(sinT2) * 180) / Math.PI;
      return {
        primaryValue: fmt(t2, 3),
        primaryUnit: 'degrees (°)',
        primaryLabel: 'Refracted Angle (θ₂)',
        secondaryOutputs: [{ label: 'Critical Angle (θ_c)', value: crit }],
        steps: [`θ₂ = arcsin((${n1}/${n2})·sin(${t1}°)) = ${fmt(t2, 3)}°.`],
      };
    },
  },

  // 815. Thin Lens & Mirror Equation
  {
    slug: 'thin-lens-mirror-focal-equation-calculator',
    title: 'Thin Lens & Mirror Equation (1/f = 1/d_o + 1/d_i) Calculator',
    category: 'science',
    formulaDisplay: '1/f = 1/d_o + 1/d_i   |   M = −d_i / d_o',
    inputs: [
      { id: 'focalLengthCm', label: 'Focal Length f (+Converging / −Diverging)', type: 'number', unit: 'cm', defaultValue: 15, min: -1e5, max: 1e5, step: 1 },
      { id: 'objectDistCm', label: 'Object Distance (d_o > 0)', type: 'number', unit: 'cm', defaultValue: 40, min: 0.01, max: 1e6, step: 1 },
    ],
    calculate: (v) => {
      const f = parseNum(v.focalLengthCm);
      const doDist = parseNum(v.objectDistCm);
      if (Number.isNaN(f) || Number.isNaN(doDist) || f === 0 || doDist <= 0) return calcError('Focal length non-zero and object distance positive.');
      if (Math.abs(f - doDist) < 1e-6) return calcError('Object sits directly at focal point (image formed at infinity).');
      const di = 1 / (1 / f - 1 / doDist);
      const mag = -di / doDist;
      return {
        primaryValue: fmt(di, 3),
        primaryUnit: 'cm (d_i)',
        primaryLabel: di > 0 ? 'Real Inverted Image' : 'Virtual Upright Image',
        secondaryOutputs: [
          { label: 'Lateral Magnification (M)', value: `${fmt(mag, 3)}×` },
          { label: 'Optical Lens Power', value: `${fmt(100 / f, 2)} Diopters` },
        ],
        steps: [`d_i = 1/(1/${f} − 1/${doDist}) = ${fmt(di, 3)} cm; M = ${fmt(mag, 3)}×.`],
      };
    },
  },

  // 816. EM Wavelength, Frequency & Photon Energy
  {
    slug: 'wavelength-frequency-photon-energy-calculator',
    title: 'Electromagnetic Wavelength, Frequency & Photon Energy Calculator',
    category: 'science',
    formulaDisplay: 'c = λ·f   |   E = h·f = h·c / λ',
    inputs: [
      { id: 'wavelengthNm', label: 'Wavelength λ (Nanometers; 550 nm = Green)', type: 'number', unit: 'nm', defaultValue: 532, min: 0.001, max: 1e12, step: 10 },
    ],
    calculate: (v) => {
      const nm = parseNum(v.wavelengthNm);
      if (Number.isNaN(nm) || nm <= 0) return calcError('Wavelength must be positive.');
      const c = 299792458;
      const h = 6.62607015e-34;
      const lamM = nm * 1e-9;
      const freqHz = c / lamM;
      const energyJ = h * freqHz;
      const energyEv = energyJ / 1.602176634e-19;
      return {
        primaryValue: fmt(energyEv, 4),
        primaryUnit: 'eV',
        primaryLabel: 'Photon Energy (Electron-Volts)',
        secondaryOutputs: [
          { label: 'Frequency (f)', value: `${sci(freqHz)} Hz (${fmt(freqHz / 1e12, 2)} THz)` },
          { label: 'Photon Energy (Joules)', value: `${sci(energyJ)} J` },
        ],
        steps: [`f = c/λ = ${sci(freqHz)} Hz → E = hf = ${fmt(energyEv, 4)} eV.`],
      };
    },
  },

  // 817. Acoustic Doppler Effect Shift
  {
    slug: 'doppler-effect-sound-frequency-calculator',
    title: 'Acoustic Doppler Shift Observed Frequency Calculator',
    category: 'science',
    formulaDisplay: 'f_obs = f₀ × (c + v_obs) / (c − v_src)',
    inputs: [
      { id: 'sourceFreqHz', label: 'Emitted Source Frequency (f₀)', type: 'number', unit: 'Hz', defaultValue: 700, min: 1, max: 1e7, step: 25 },
      { id: 'soundSpeedMs', label: 'Speed of Sound (c; 343 m/s @ 20°C)', type: 'number', unit: 'm/s', defaultValue: 343, min: 50, max: 5000, step: 1 },
      { id: 'observerVelMs', label: 'Observer Speed (+Toward Source / −Away)', type: 'number', unit: 'm/s', defaultValue: 0, min: -1000, max: 1000, step: 5 },
      { id: 'sourceVelMs', label: 'Source Speed (+Toward Observer / −Away)', type: 'number', unit: 'm/s', defaultValue: 30, min: -1000, max: 1000, step: 5 },
    ],
    calculate: (v) => {
      const [f0, c, vo, vs] = [v.sourceFreqHz, v.soundSpeedMs, v.observerVelMs, v.sourceVelMs].map(parseNum);
      if ([f0, c, vo, vs].some(Number.isNaN) || f0 <= 0 || c <= 0 || vs >= c) return calcError('Require subsonic source velocity v_s < c and positive frequency.');
      const fObs = f0 * ((c + vo) / (c - vs));
      return {
        primaryValue: fmt(fObs, 2),
        primaryUnit: 'Hz',
        primaryLabel: 'Observed Doppler Shifted Frequency',
        secondaryOutputs: [
          { label: 'Frequency Shift (Δf)', value: `${fObs - f0 >= 0 ? '+' : ''}${fmt(fObs - f0, 2)} Hz` },
          { label: 'Source Mach Number', value: `Mach ${fmt(Math.abs(vs) / c, 3)}` },
        ],
        steps: [`f_obs = ${f0} × (${c}+${vo})/(${c}−${vs}) = ${fmt(fObs, 2)} Hz.`],
      };
    },
  },

  // 818. RC & RL Circuit Time Constant & -3dB Cutoff
  {
    slug: 'rc-rl-time-constant-cutoff-calculator',
    title: 'RC Circuit Time Constant (τ = RC) & Cutoff Frequency Calculator',
    category: 'science',
    formulaDisplay: 'τ = R × C   |   f_c = 1 / (2πRC)',
    inputs: [
      { id: 'resistanceOhms', label: 'Resistance (R)', type: 'number', unit: 'Ω', defaultValue: 10000, min: 0.01, max: 1e12, step: 100 },
      { id: 'capacitanceUf', label: 'Capacitance (C in µF)', type: 'number', unit: 'µF', defaultValue: 4.7, min: 0.0001, max: 1e8, step: 0.5 },
    ],
    calculate: (v) => {
      const R = parseNum(v.resistanceOhms);
      const C = parseNum(v.capacitanceUf) * 1e-6;
      if (Number.isNaN(R) || Number.isNaN(C) || R <= 0 || C <= 0) return calcError('R and C must be positive.');
      const tau = R * C;
      const fc = 1 / (2 * Math.PI * tau);
      return {
        primaryValue: fmt(tau * 1000, 3),
        primaryUnit: 'ms (τ = RC)',
        primaryLabel: 'RC Time Constant (63.2% Charge)',
        secondaryOutputs: [
          { label: '−3 dB Cutoff Frequency (f_c)', value: fc >= 1000 ? `${fmt(fc / 1000, 3)} kHz` : `${fmt(fc, 2)} Hz` },
          { label: '99.3% Settling Time (5τ)', value: `${fmt(tau * 5000, 2)} ms` },
        ],
        steps: [`τ = ${R} Ω × ${v.capacitanceUf} µF = ${fmt(tau * 1000, 3)} ms; f_c = ${fmt(fc, 2)} Hz.`],
      };
    },
  },

  // 819. Series & Parallel Equivalent Resistor Network
  {
    slug: 'resistor-color-code-series-parallel-calculator',
    title: 'Series & Parallel Resistor Network Equivalent Calculator',
    category: 'science',
    formulaDisplay: 'R_series = Σ R_i   |   1 / R_parallel = Σ (1 / R_i)',
    inputs: [
      { id: 'resistorsList', label: 'Resistor Values in Ohms (comma-separated)', type: 'text', defaultValue: '100, 220, 470, 1000' },
    ],
    calculate: (v) => {
      const list = String(v.resistorsList ?? '').split(/[\s,;]+/).map(Number).filter((x) => Number.isFinite(x) && x > 0);
      if (list.length < 2) return calcError('Enter at least 2 positive resistor values.');
      const rSer = list.reduce((a, b) => a + b, 0);
      const rPar = 1 / list.reduce((a, r) => a + 1 / r, 0);
      return {
        primaryValue: fmt(rPar, 3),
        primaryUnit: 'Ω (Parallel)',
        primaryLabel: 'Parallel Equivalent Resistance',
        secondaryOutputs: [
          { label: 'Series Equivalent Resistance', value: `${fmt(rSer, 2)} Ω` },
          { label: 'Resistor Count', value: list.length },
        ],
        steps: [`R_parallel = ${fmt(rPar, 3)} Ω; R_series = ${fmt(rSer, 2)} Ω across [${list.join(', ')}] Ω.`],
      };
    },
  },

  // 820. Loaded Resistive Voltage Divider
  {
    slug: 'voltage-divider-thevenin-calculator',
    title: 'Resistive Voltage Divider & Power Dissipation Calculator',
    category: 'science',
    formulaDisplay: 'V_out = V_in × R₂ / (R₁ + R₂)',
    inputs: [
      { id: 'vIn', label: 'Input Supply Voltage (V_in)', type: 'number', unit: 'V', defaultValue: 12, min: 0.01, max: 1e6, step: 0.5 },
      { id: 'r1', label: 'Top Resistor (R₁)', type: 'number', unit: 'Ω', defaultValue: 10000, min: 1, max: 1e10, step: 500 },
      { id: 'r2', label: 'Bottom Resistor (R₂)', type: 'number', unit: 'Ω', defaultValue: 4700, min: 1, max: 1e10, step: 500 },
    ],
    calculate: (v) => {
      const [vin, r1, r2] = [v.vIn, v.r1, v.r2].map(parseNum);
      if ([vin, r1, r2].some(Number.isNaN) || vin <= 0 || r1 <= 0 || r2 <= 0) return calcError('Enter positive voltage and resistances.');
      const vOut = vin * (r2 / (r1 + r2));
      const iMa = (vin / (r1 + r2)) * 1000;
      const rThev = (r1 * r2) / (r1 + r2);
      return {
        primaryValue: fmt(vOut, 4),
        primaryUnit: 'Volts (V_out)',
        primaryLabel: 'Unloaded Divider Output Voltage',
        secondaryOutputs: [
          { label: 'Divider Quiescent Current', value: `${fmt(iMa, 3)} mA` },
          { label: 'Thévenin Output Resistance', value: `${fmt(rThev, 1)} Ω` },
        ],
        steps: [`V_out = ${vin} × ${r2}/(${r1}+${r2}) = ${fmt(vOut, 4)} V.`],
      };
    },
  },

  // 821. Ideal AC Transformer Turns & Impedance Ratio
  {
    slug: 'transformer-turns-ratio-impedance-calculator',
    title: 'Ideal AC Transformer Voltage, Current & Impedance Calculator',
    category: 'science',
    formulaDisplay: 'V₁/V₂ = N₁/N₂ = I₂/I₁   |   Z₁ = (N₁/N₂)²·Z₂',
    inputs: [
      { id: 'vPrimary', label: 'Primary AC Voltage (V₁)', type: 'number', unit: 'V', defaultValue: 120, min: 0.1, max: 1e6, step: 5 },
      { id: 'nPrimary', label: 'Primary Turns (N₁)', type: 'number', defaultValue: 1000, min: 1, max: 1e7, step: 50 },
      { id: 'nSecondary', label: 'Secondary Turns (N₂)', type: 'number', defaultValue: 100, min: 1, max: 1e7, step: 10 },
      { id: 'loadOhms', label: 'Secondary Load Impedance (Z_L)', type: 'number', unit: 'Ω', defaultValue: 8, min: 0.01, max: 1e8, step: 1 },
    ],
    calculate: (v) => {
      const [v1, n1, n2, zL] = [v.vPrimary, v.nPrimary, v.nSecondary, v.loadOhms].map(parseNum);
      if ([v1, n1, n2, zL].some(Number.isNaN) || [v1, n1, n2, zL].some((x) => x <= 0)) return calcError('All transformer inputs must be positive.');
      const a = n1 / n2;
      const v2 = v1 / a;
      const i2 = v2 / zL;
      const i1 = i2 / a;
      const zReflected = a * a * zL;
      return {
        primaryValue: fmt(v2, 3),
        primaryUnit: 'V (Secondary)',
        primaryLabel: `Secondary Voltage (${fmt(a, 2)}:1 ${a >= 1 ? 'Step-Down' : 'Step-Up'})`,
        secondaryOutputs: [
          { label: 'Primary / Secondary Current', value: `${fmt(i1, 3)} A / ${fmt(i2, 3)} A` },
          { label: 'Reflected Primary Impedance', value: `${fmt(zReflected, 1)} Ω` },
        ],
        steps: [`Turns ratio ${fmt(a, 2)}:1 → V₂ = ${fmt(v2, 3)} V, I₂ = ${fmt(i2, 3)} A, Z₁ = ${fmt(zReflected, 1)} Ω.`],
      };
    },
  },

  // 822. Coulomb's Law Electrostatic Force
  {
    slug: 'coulombs-law-electrostatic-force-calculator',
    title: 'Coulomb’s Law Electrostatic Force & E-Field Calculator',
    category: 'science',
    formulaDisplay: 'F = k_e · |q₁·q₂| / r²,  k_e = 8.98755×10⁹ N·m²/C²',
    inputs: [
      { id: 'q1Uc', label: 'Charge q₁ (µC)', type: 'number', unit: 'µC', defaultValue: 5.0, min: -1e6, max: 1e6, step: 0.5 },
      { id: 'q2Uc', label: 'Charge q₂ (µC)', type: 'number', unit: 'µC', defaultValue: -3.0, min: -1e6, max: 1e6, step: 0.5 },
      { id: 'distanceM', label: 'Separation Distance (r)', type: 'number', unit: 'm', defaultValue: 0.2, min: 0.0001, max: 1e9, step: 0.05 },
    ],
    calculate: (v) => {
      const q1 = parseNum(v.q1Uc) * 1e-6;
      const q2 = parseNum(v.q2Uc) * 1e-6;
      const r = parseNum(v.distanceM);
      if ([q1, q2, r].some(Number.isNaN) || r <= 0) return calcError('Separation distance must be positive.');
      const ke = 8.9875517923e9;
      const force = (ke * Math.abs(q1 * q2)) / (r * r);
      const nature = q1 * q2 === 0 ? 'Zero Net Force' : q1 * q2 < 0 ? 'Attractive Force' : 'Repulsive Force';
      return {
        primaryValue: fmt(force, 4),
        primaryUnit: 'Newtons (N)',
        primaryLabel: nature,
        secondaryOutputs: [{ label: 'Field from q₁ at Distance r', value: `${sci((ke * Math.abs(q1)) / (r * r))} N/C` }],
        steps: [`F = k_e·|q₁q₂|/r² = ${fmt(force, 4)} N (${nature}).`],
      };
    },
  },

  // 823. Fluid Pipe Flow & Reynolds Number Calculator
  {
    slug: 'bernoulli-fluid-reynolds-number-calculator',
    title: 'Pipe Flow Velocity, Reynolds Number (Re) & Flow Regime Calculator',
    category: 'science',
    formulaDisplay: 'Re = (ρ · v · D) / μ   |   q = ½ · ρ · v²',
    inputs: [
      { id: 'diameterMm', label: 'Pipe Inner Diameter (D)', type: 'number', unit: 'mm', defaultValue: 50, min: 0.1, max: 10000, step: 5 },
      { id: 'velocityMs', label: 'Fluid Mean Velocity (v)', type: 'number', unit: 'm/s', defaultValue: 1.5, min: 0, max: 500, step: 0.2 },
      { id: 'densityKgM3', label: 'Fluid Density ρ (Water = 998 kg/m³)', type: 'number', unit: 'kg/m³', defaultValue: 998, min: 0.1, max: 25000, step: 10 },
      { id: 'viscosityPaS', label: 'Dynamic Viscosity μ (Water = 0.001 Pa·s)', type: 'number', unit: 'Pa·s', defaultValue: 0.001, min: 1e-7, max: 1000, step: 0.0005 },
    ],
    calculate: (v) => {
      const [dMm, vel, rho, mu] = [v.diameterMm, v.velocityMs, v.densityKgM3, v.viscosityPaS].map(parseNum);
      if ([dMm, vel, rho, mu].some(Number.isNaN) || dMm <= 0 || vel < 0 || rho <= 0 || mu <= 0) return calcError('Enter positive diameter, density, and viscosity.');
      const D = dMm / 1000;
      const re = (rho * vel * D) / mu;
      const regime = re < 2300 ? 'Laminar Flow (Re < 2,300)' : re <= 4000 ? 'Transitional Flow (2,300–4,000)' : 'Turbulent Flow (Re > 4,000)';
      const qLpm = Math.PI * (D / 2) ** 2 * vel * 60000;
      const dynP = 0.5 * rho * vel * vel;
      return {
        primaryValue: Math.round(re),
        primaryUnit: 'Re',
        primaryLabel: regime,
        secondaryOutputs: [
          { label: 'Volumetric Flow Rate', value: `${fmt(qLpm, 2)} L/min` },
          { label: 'Bernoulli Dynamic Pressure (½ρv²)', value: `${fmt(dynP, 1)} Pa` },
        ],
        steps: [`Re = (${rho}×${vel}×${D})÷${mu} = ${Math.round(re).toLocaleString()} (${regime}).`],
      };
    },
  },

  // 824. Archimedes Buoyancy & Submerged Fraction
  {
    slug: 'buoyancy-archimedes-upthrust-calculator',
    title: 'Archimedes Buoyancy Upthrust & Floating Depth Calculator',
    category: 'science',
    formulaDisplay: 'F_b = ρ_fluid · V_displaced · g',
    inputs: [
      { id: 'objectMassKg', label: 'Object Mass', type: 'number', unit: 'kg', defaultValue: 600, min: 0.001, max: 1e12, step: 10 },
      { id: 'objectVolM3', label: 'Total Object Volume', type: 'number', unit: 'm³', defaultValue: 0.8, min: 0.0001, max: 1e9, step: 0.1 },
      { id: 'fluidDensity', label: 'Fluid Density (Seawater = 1,025 kg/m³)', type: 'number', unit: 'kg/m³', defaultValue: 1000, min: 0.1, max: 25000, step: 25 },
    ],
    calculate: (v) => {
      const [m, vol, rhoF] = [v.objectMassKg, v.objectVolM3, v.fluidDensity].map(parseNum);
      if ([m, vol, rhoF].some(Number.isNaN) || m <= 0 || vol <= 0 || rhoF <= 0) return calcError('Mass, volume, and fluid density must be positive.');
      const rhoObj = m / vol;
      const g = 9.80665;
      const weightN = m * g;
      const maxBuoyantN = rhoF * vol * g;
      const floats = rhoObj <= rhoF;
      const subPct = Math.min(100, (rhoObj / rhoF) * 100);
      return {
        primaryValue: fmt(maxBuoyantN, 1),
        primaryUnit: 'N (Max Upthrust)',
        primaryLabel: floats ? `Floats (${fmt(subPct, 1)}% Submerged)` : 'Sinks (Object Denser Than Fluid)',
        secondaryOutputs: [
          { label: 'Object Density', value: `${fmt(rhoObj, 1)} kg/m³` },
          { label: 'Apparent Weight in Fluid', value: floats ? '0 N (Floating Equilibrium)' : `${fmt(weightN - maxBuoyantN, 1)} N` },
        ],
        steps: [`ρ_obj=${fmt(rhoObj, 1)} vs ρ_fluid=${rhoF} kg/m³ → ${floats ? 'Floats at ' + fmt(subPct, 1) + '% submerged' : 'Sinks'}.`],
      };
    },
  },

  // 825. Specific Heat Calorimetry (Q = mcΔT)
  {
    slug: 'heat-transfer-specific-heat-calorimetry-calculator',
    title: 'Specific Heat Calorimetry (Q = m·c·ΔT) Energy Calculator',
    category: 'science',
    formulaDisplay: 'Q = m · c · (T_final − T_initial)',
    inputs: [
      { id: 'massKg', label: 'Substance Mass (m)', type: 'number', unit: 'kg', defaultValue: 2.5, min: 0.001, max: 1e9, step: 0.5 },
      { id: 'specificHeat', label: 'Specific Heat Capacity c (Water = 4,184 J/kg·K)', type: 'number', unit: 'J/(kg·K)', defaultValue: 4184, min: 1, max: 50000, step: 50 },
      { id: 'deltaTempC', label: 'Temperature Change ΔT (°C or K)', type: 'number', unit: '°C', defaultValue: 45, min: -1000, max: 5000, step: 5 },
    ],
    calculate: (v) => {
      const [m, c, dT] = [v.massKg, v.specificHeat, v.deltaTempC].map(parseNum);
      if ([m, c, dT].some(Number.isNaN) || m <= 0 || c <= 0) return calcError('Mass and specific heat must be positive.');
      const Q = m * c * dT;
      return {
        primaryValue: fmt(Q / 1000, 2),
        primaryUnit: 'kJ',
        primaryLabel: 'Thermal Energy Transferred (Q)',
        secondaryOutputs: [
          { label: 'Kilocalories (Food kcal)', value: `${fmt(Q / 4184, 2)} kcal` },
          { label: 'BTU Equivalent', value: `${fmt(Q / 1055.06, 2)} BTU` },
          { label: 'Kilowatt-Hours (kWh)', value: `${fmt(Q / 3.6e6, 4)} kWh` },
        ],
        steps: [`Q = ${m} × ${c} × ${dT} = ${fmt(Q / 1000, 2)} kJ.`],
      };
    },
  },

  // 826. Carnot Heat Engine & Refrigerator Efficiency
  {
    slug: 'carnot-thermal-efficiency-calculator',
    title: 'Carnot Heat Engine Maximum Efficiency & COP Calculator',
    category: 'science',
    formulaDisplay: 'η_max = 1 − T_cold(K) / T_hot(K)',
    inputs: [
      { id: 'tHotC', label: 'Hot Reservoir Temp (°C)', type: 'number', unit: '°C', defaultValue: 500, min: -270, max: 10000, step: 25 },
      { id: 'tColdC', label: 'Cold Sink Temp (°C)', type: 'number', unit: '°C', defaultValue: 25, min: -272, max: 5000, step: 5 },
    ],
    calculate: (v) => {
      const [thC, tcC] = [v.tHotC, v.tColdC].map(parseNum);
      if (Number.isNaN(thC) || Number.isNaN(tcC)) return calcError('Enter valid Celsius temperatures.');
      const thK = thC + 273.15;
      const tcK = tcC + 273.15;
      if (tcK <= 0 || thK <= tcK) return calcError('Require absolute Kelvin T_hot > T_cold > 0 K.');
      const eta = (1 - tcK / thK) * 100;
      const copHeatPump = thK / (thK - tcK);
      const copFridge = tcK / (thK - tcK);
      return {
        primaryValue: fmt(eta, 2),
        primaryUnit: '%',
        primaryLabel: 'Carnot Maximum Heat Engine Efficiency',
        secondaryOutputs: [
          { label: 'Kelvin Temperatures (T_H / T_C)', value: `${fmt(thK, 2)} K / ${fmt(tcK, 2)} K` },
          { label: 'Ideal Heat Pump / Fridge COP', value: `${fmt(copHeatPump, 2)} / ${fmt(copFridge, 2)}` },
        ],
        steps: [`η = (1 − ${fmt(tcK, 2)}/${fmt(thK, 2)}) × 100 = ${fmt(eta, 2)}%.`],
      };
    },
  },

  // 827. Stefan-Boltzmann Blackbody Radiation & Wien's Law
  {
    slug: 'stefan-boltzmann-blackbody-radiation-calculator',
    title: 'Stefan-Boltzmann Blackbody Power & Wien’s Peak Wavelength Calculator',
    category: 'science',
    formulaDisplay: 'P = ε·σ·A·T⁴   |   λ_peak = 2.8978×10⁻³ / T(K)',
    inputs: [
      { id: 'tempK', label: 'Absolute Surface Temperature (K)', type: 'number', unit: 'K', defaultValue: 5778, min: 1, max: 1e7, step: 50 },
      { id: 'areaM2', label: 'Radiating Surface Area (A)', type: 'number', unit: 'm²', defaultValue: 1, min: 1e-6, max: 1e25, step: 0.5 },
      { id: 'emissivity', label: 'Emissivity (0 < ε ≤ 1)', type: 'number', defaultValue: 1.0, min: 0.01, max: 1.0, step: 0.05 },
    ],
    calculate: (v) => {
      const [T, A, eps] = [v.tempK, v.areaM2, v.emissivity].map(parseNum);
      if ([T, A, eps].some(Number.isNaN) || T <= 0 || A <= 0 || eps <= 0 || eps > 1) return calcError('Temperature/area positive and 0 < ε <= 1.');
      const sigma = 5.670374419e-8;
      const flux = eps * sigma * Math.pow(T, 4);
      const powerW = flux * A;
      const wienNm = (2.897771955e-3 / T) * 1e9;
      return {
        primaryValue: sci(powerW),
        primaryUnit: 'Watts',
        primaryLabel: 'Total Radiated Thermal Power',
        secondaryOutputs: [
          { label: 'Surface Radiant Exitance (W/m²)', value: `${sci(flux)} W/m²` },
          { label: 'Wien Peak Wavelength (λ_max)', value: `${fmt(wienNm, 1)} nm` },
        ],
        steps: [`P = ${eps}·σ·${A}·${T}⁴ = ${sci(powerW)} W; Wien λ_max = ${fmt(wienNm, 1)} nm.`],
      };
    },
  },

  // 828. Solution Dilution C1V1 = C2V2 Calculator
  {
    slug: 'dilution-c1v1-c2v2-solution-calculator',
    title: 'Laboratory Solution Dilution (C₁V₁ = C₂V₂) Calculator',
    category: 'science',
    formulaDisplay: 'V₁ = (C₂ × V₂) / C₁   |   Solvent Added = V₂ − V₁',
    inputs: [
      { id: 'c1', label: 'Stock Concentration (C₁)', type: 'number', unit: 'M or %', defaultValue: 10, min: 0.0001, max: 1e6, step: 0.5 },
      { id: 'c2', label: 'Desired Target Concentration (C₂ ≤ C₁)', type: 'number', unit: 'M or %', defaultValue: 2, min: 0.0001, max: 1e6, step: 0.25 },
      { id: 'v2', label: 'Desired Final Volume (V₂)', type: 'number', unit: 'mL', defaultValue: 500, min: 0.01, max: 1e7, step: 25 },
    ],
    calculate: (v) => {
      const [c1, c2, v2] = [v.c1, v.c2, v.v2].map(parseNum);
      if ([c1, c2, v2].some(Number.isNaN) || c1 <= 0 || c2 <= 0 || v2 <= 0 || c2 > c1) return calcError('Require C₁ >= C₂ > 0 and positive final volume.');
      const v1 = (c2 * v2) / c1;
      const solvent = v2 - v1;
      return {
        primaryValue: fmt(v1, 3),
        primaryUnit: 'mL stock (V₁)',
        primaryLabel: 'Required Stock Volume to Pipette',
        secondaryOutputs: [
          { label: 'Diluent / Water Volume Added', value: `${fmt(solvent, 3)} mL` },
          { label: 'Dilution Factor', value: `${fmt(c1 / c2, 2)}×` },
        ],
        steps: [`V₁ = (${c2} × ${v2}) ÷ ${c1} = ${fmt(v1, 3)} mL stock + ${fmt(solvent, 3)} mL diluent.`],
      };
    },
  },

  // 829. Grams to Moles & Avogadro Stoichiometry
  {
    slug: 'molecular-weight-molar-mass-stoichiometry-calculator',
    title: 'Grams to Moles & Avogadro Molecule Count Calculator',
    category: 'science',
    formulaDisplay: 'Moles (n) = Mass (g) / Molar Mass (g/mol)   |   N = n × N_A',
    inputs: [
      { id: 'massGrams', label: 'Sample Mass', type: 'number', unit: 'g', defaultValue: 36.03, min: 0, max: 1e12, step: 1 },
      { id: 'molarMass', label: 'Molar Mass (e.g., H₂O = 18.015)', type: 'number', unit: 'g/mol', defaultValue: 18.015, min: 1.0, max: 1e6, step: 0.5 },
    ],
    calculate: (v) => {
      const [m, mm] = [v.massGrams, v.molarMass].map(parseNum);
      if (Number.isNaN(m) || Number.isNaN(mm) || m < 0 || mm <= 0) return calcError('Mass must be non-negative and molar mass positive.');
      const moles = m / mm;
      const particles = moles * 6.02214076e23;
      return {
        primaryValue: fmt(moles, 5),
        primaryUnit: 'mol',
        primaryLabel: 'Amount of Substance',
        secondaryOutputs: [{ label: 'Avogadro Molecule / Atom Count', value: sci(particles) }],
        steps: [`n = ${m} g ÷ ${mm} g/mol = ${fmt(moles, 5)} mol (${sci(particles)} particles).`],
      };
    },
  },

  // 830. Henderson-Hasselbalch Buffer pH Calculator
  {
    slug: 'henderson-hasselbalch-buffer-ph-calculator',
    title: 'Henderson-Hasselbalch Weak Acid Buffer pH Calculator',
    category: 'science',
    formulaDisplay: 'pH = pK_a + log₁₀([A⁻] / [HA])',
    inputs: [
      { id: 'pka', label: 'Acid Dissociation Constant (pK_a)', type: 'number', defaultValue: 4.76, min: -2, max: 16, step: 0.1 },
      { id: 'concBase', label: 'Conjugate Base [A⁻]', type: 'number', unit: 'M', defaultValue: 0.15, min: 1e-6, max: 20, step: 0.05 },
      { id: 'concAcid', label: 'Weak Acid [HA]', type: 'number', unit: 'M', defaultValue: 0.1, min: 1e-6, max: 20, step: 0.05 },
    ],
    calculate: (v) => {
      const [pka, base, acid] = [v.pka, v.concBase, v.concAcid].map(parseNum);
      if ([pka, base, acid].some(Number.isNaN) || base <= 0 || acid <= 0) return calcError('Concentrations must be positive.');
      const ph = pka + Math.log10(base / acid);
      return {
        primaryValue: fmt(ph, 3),
        primaryUnit: 'pH',
        primaryLabel: 'Calculated Buffer Solution pH',
        secondaryOutputs: [
          { label: 'pOH (@ 25°C)', value: fmt(14 - ph, 3) },
          { label: 'Effective Buffer Range', value: `${fmt(pka - 1, 2)} – ${fmt(pka + 1, 2)}` },
        ],
        steps: [`pH = ${pka} + log₁₀(${base}/${acid}) = ${fmt(ph, 3)}.`],
      };
    },
  },

  // 831. Electrochemical Nernst Equation Calculator
  {
    slug: 'nernst-equation-cell-potential-calculator',
    title: 'Electrochemical Nernst Equation Cell Potential (E_cell) Calculator',
    category: 'science',
    formulaDisplay: 'E = E° − (RT / nF)·ln(Q)   |   @ 298.15K: E = E° − (0.05916/n)·log₁₀(Q)',
    inputs: [
      { id: 'eStandard', label: 'Standard Cell Potential (E°)', type: 'number', unit: 'V', defaultValue: 1.1, min: -10, max: 10, step: 0.05 },
      { id: 'electronsN', label: 'Electrons Transferred (n)', type: 'number', defaultValue: 2, min: 1, max: 12, step: 1 },
      { id: 'reactionQ', label: 'Reaction Quotient (Q = [Products]/[Reactants])', type: 'number', defaultValue: 0.1, min: 1e-12, max: 1e12, step: 0.1 },
      { id: 'tempC', label: 'Temperature (°C)', type: 'number', unit: '°C', defaultValue: 25, min: -100, max: 500, step: 5 },
    ],
    calculate: (v) => {
      const [e0, n, Q, tc] = [v.eStandard, v.electronsN, v.reactionQ, v.tempC].map(parseNum);
      if ([e0, n, Q, tc].some(Number.isNaN) || n < 1 || Q <= 0 || tc < -273) return calcError('Require n >= 1 and reaction quotient Q > 0.');
      const T = tc + 273.15;
      const R = 8.314462618;
      const F = 96485.33212;
      const E = e0 - ((R * T) / (n * F)) * Math.log(Q);
      const dG = -n * F * E / 1000;
      return {
        primaryValue: fmt(E, 4),
        primaryUnit: 'Volts (E_cell)',
        primaryLabel: E > 0 ? 'Spontaneous Galvanic Cell (ΔG < 0)' : 'Non-Spontaneous (Electrolytic)',
        secondaryOutputs: [{ label: 'Gibbs Free Energy (ΔG)', value: `${fmt(dG, 2)} kJ/mol` }],
        steps: [`E = ${e0} − (RT/${n}F)·ln(${Q}) = ${fmt(E, 4)} V (ΔG = ${fmt(dG, 2)} kJ/mol).`],
      };
    },
  },

  // 832. Arrhenius Reaction Rate Constant Ratio
  {
    slug: 'arrhenius-activation-energy-rate-calculator',
    title: 'Arrhenius Equation Temperature Rate Multiplier Calculator',
    category: 'science',
    formulaDisplay: 'ln(k₂ / k₁) = (E_a / R) × (1/T₁ − 1/T₂)',
    inputs: [
      { id: 'eaKj', label: 'Activation Energy (E_a)', type: 'number', unit: 'kJ/mol', defaultValue: 55, min: 0.1, max: 1000, step: 5 },
      { id: 't1C', label: 'Baseline Temperature T₁ (°C)', type: 'number', unit: '°C', defaultValue: 25, min: -200, max: 2000, step: 5 },
      { id: 't2C', label: 'Elevated Temperature T₂ (°C)', type: 'number', unit: '°C', defaultValue: 35, min: -200, max: 2000, step: 5 },
    ],
    calculate: (v) => {
      const [ea, t1c, t2c] = [v.eaKj, v.t1C, v.t2C].map(parseNum);
      if ([ea, t1c, t2c].some(Number.isNaN) || ea <= 0 || t1c <= -273 || t2c <= -273) return calcError('Enter positive Ea and valid temperatures > −273°C.');
      const T1 = t1c + 273.15;
      const T2 = t2c + 273.15;
      const ratio = Math.exp(((ea * 1000) / 8.314462618) * (1 / T1 - 1 / T2));
      return {
        primaryValue: fmt(ratio, 3),
        primaryUnit: '× (k₂ / k₁)',
        primaryLabel: 'Reaction Rate Multiplier',
        secondaryOutputs: [{ label: 'Percent Speedup', value: `${ratio >= 1 ? '+' : ''}${fmt((ratio - 1) * 100, 1)}%` }],
        steps: [`k₂/k₁ = exp((${ea}000/R)·(1/${fmt(T1, 2)} − 1/${fmt(T2, 2)})) = ${fmt(ratio, 3)}×.`],
      };
    },
  },

  // 833. Radioactive Decay & Half-Life Calculator
  {
    slug: 'radioactive-decay-half-life-dating-calculator',
    title: 'Radioactive Decay, Half-Life & Radiocarbon Dating Calculator',
    category: 'science',
    formulaDisplay: 'N(t) = N₀ · (0.5)^(t / t_1/2)',
    inputs: [
      { id: 'n0', label: 'Initial Activity / Mass (N₀)', type: 'number', defaultValue: 100, min: 0.001, max: 1e15, step: 10 },
      { id: 'halfLife', label: 'Isotope Half-Life (t_1/2; C-14 = 5,730 yrs)', type: 'number', defaultValue: 5730, min: 0.0001, max: 1e12, step: 100 },
      { id: 'elapsed', label: 'Elapsed Time (matching unit)', type: 'number', defaultValue: 11460, min: 0, max: 1e12, step: 100 },
    ],
    calculate: (v) => {
      const [n0, hl, t] = [v.n0, v.halfLife, v.elapsed].map(parseNum);
      if ([n0, hl, t].some(Number.isNaN) || n0 <= 0 || hl <= 0 || t < 0) return calcError('Initial quantity and half-life must be positive.');
      const nT = n0 * Math.pow(0.5, t / hl);
      const lam = Math.LN2 / hl;
      return {
        primaryValue: fmt(nT, 4),
        primaryUnit: 'remaining',
        primaryLabel: `Remaining After ${fmt(t / hl, 2)} Half-Lives`,
        secondaryOutputs: [
          { label: 'Fraction Remaining', value: `${fmt((nT / n0) * 100, 2)}%` },
          { label: 'Decay Constant (λ)', value: sci(lam) },
        ],
        steps: [`N(${t}) = ${n0} × (0.5)^(${t}/${hl}) = ${fmt(nT, 4)}.`],
      };
    },
  },

  // 834. Beer-Lambert Law Spectrophotometry
  {
    slug: 'beer-lambert-absorbance-spectrophotometry-calculator',
    title: 'Beer-Lambert Law (A = ε·l·c) Absorbance & Transmittance Calculator',
    category: 'science',
    formulaDisplay: 'A = ε · l · c = −log₁₀(%T / 100)',
    inputs: [
      { id: 'eps', label: 'Molar Absorptivity ε', type: 'number', unit: 'L/(mol·cm)', defaultValue: 14900, min: 0.01, max: 1e8, step: 500 },
      { id: 'pathCm', label: 'Cuvette Path Length (l)', type: 'number', unit: 'cm', defaultValue: 1.0, min: 0.01, max: 100, step: 0.5 },
      { id: 'concM', label: 'Solution Molarity (c in mol/L)', type: 'number', unit: 'M', defaultValue: 0.00004, min: 1e-10, max: 50, step: 0.00001 },
    ],
    calculate: (v) => {
      const [e, l, c] = [v.eps, v.pathCm, v.concM].map(parseNum);
      if ([e, l, c].some(Number.isNaN) || e <= 0 || l <= 0 || c <= 0) return calcError('ε, path length, and concentration must be positive.');
      const A = e * l * c;
      const pctT = Math.pow(10, -A) * 100;
      return {
        primaryValue: fmt(A, 4),
        primaryUnit: 'AU (Absorbance)',
        primaryLabel: 'UV-Vis Optical Absorbance (A)',
        secondaryOutputs: [{ label: 'Light Transmittance (%T)', value: `${fmt(pctT, 2)}%` }],
        steps: [`A = ${e} × ${l} × ${c} = ${fmt(A, 4)} → Transmittance = ${fmt(pctT, 2)}%.`],
      };
    },
  },

  // 835. Special Relativity Lorentz Factor & Time Dilation
  {
    slug: 'schwarzschild-radius-relativistic-gamma-calculator',
    title: 'Special Relativity Lorentz Gamma (γ) & Time Dilation Calculator',
    category: 'science',
    formulaDisplay: 'γ = 1 / √(1 − β²),  β = v/c   |   Δt_obs = γ · Δt₀',
    inputs: [
      { id: 'betaPct', label: 'Speed as % of Speed of Light (0–99.999%)', type: 'number', unit: '% c', defaultValue: 80, min: 0, max: 99.999999, step: 5 },
      { id: 'properYears', label: 'Ship Proper Time Elapsed (Δt₀)', type: 'number', unit: 'years', defaultValue: 5, min: 0, max: 1e6, step: 1 },
    ],
    calculate: (v) => {
      const beta = parseNum(v.betaPct) / 100;
      const dt0 = parseNum(v.properYears);
      if (Number.isNaN(beta) || Number.isNaN(dt0) || beta < 0 || beta >= 1 || dt0 < 0) return calcError('Speed must satisfy 0% <= v < 100% c.');
      const gamma = 1 / Math.sqrt(1 - beta * beta);
      const earthYrs = dt0 * gamma;
      return {
        primaryValue: fmt(gamma, 5),
        primaryUnit: 'γ Lorentz factor',
        primaryLabel: `Time Dilation & Length Contraction Factor (${fmt(100 / gamma, 2)}% length)`,
        secondaryOutputs: [
          { label: 'Stationary Observer Time Elapsed', value: `${fmt(earthYrs, 3)} years` },
          { label: 'Speed in km/s', value: `${Math.round(beta * 299792.458).toLocaleString()} km/s` },
        ],
        steps: [`β = ${fmt(beta, 5)} → γ = ${fmt(gamma, 5)} → ${dt0} ship yrs = ${fmt(earthYrs, 3)} Earth yrs.`],
      };
    },
  },

  // 836. Aerodynamic Terminal Velocity & Free Fall
  {
    slug: 'free-fall-terminal-velocity-calculator',
    title: 'Aerodynamic Terminal Velocity & Vacuum Free-Fall Calculator',
    category: 'science',
    formulaDisplay: 'v_t = √(2mg / (ρ·A·C_d))',
    inputs: [
      { id: 'massKg', label: 'Falling Object Mass (m)', type: 'number', unit: 'kg', defaultValue: 80, min: 0.001, max: 1e9, step: 5 },
      { id: 'areaM2', label: 'Projected Cross-Sectional Area (A)', type: 'number', unit: 'm²', defaultValue: 0.7, min: 0.0001, max: 1e5, step: 0.1 },
      { id: 'dragCd', label: 'Drag Coefficient (Skydiver ~1.0; Sphere 0.47)', type: 'number', defaultValue: 1.0, min: 0.01, max: 5, step: 0.1 },
      { id: 'airDensity', label: 'Air Density ρ (Sea Level = 1.225 kg/m³)', type: 'number', unit: 'kg/m³', defaultValue: 1.225, min: 0.001, max: 100, step: 0.1 },
    ],
    calculate: (v) => {
      const [m, A, cd, rho] = [v.massKg, v.areaM2, v.dragCd, v.airDensity].map(parseNum);
      if ([m, A, cd, rho].some(Number.isNaN) || [m, A, cd, rho].some((x) => x <= 0)) return calcError('All aerodynamic inputs must be positive.');
      const vt = Math.sqrt((2 * m * 9.80665) / (rho * A * cd));
      return {
        primaryValue: fmt(vt, 2),
        primaryUnit: 'm/s',
        primaryLabel: `Terminal Velocity (${fmt(vt * 3.6, 1)} km/h · ${fmt(vt * 2.23694, 1)} mph)`,
        secondaryOutputs: [{ label: 'Gravity Weight Balancing Drag', value: `${fmt(m * 9.80665, 1)} N` }],
        steps: [`v_t = √(2·${m}·g / (${rho}·${A}·${cd})) = ${fmt(vt, 2)} m/s.`],
      };
    },
  },

  // 837. Van 't Hoff Osmotic Pressure
  {
    slug: 'osmotic-pressure-van-t-hoff-calculator',
    title: 'Van ’t Hoff Solution Osmotic Pressure (Π = iMRT) Calculator',
    category: 'science',
    formulaDisplay: 'Π (atm) = i × M × 0.082057 × T(K)',
    inputs: [
      { id: 'vantHoffI', label: 'van ’t Hoff Factor (i; NaCl ≈ 1.9–2.0, Glucose = 1)', type: 'number', defaultValue: 2.0, min: 0.5, max: 10, step: 0.5 },
      { id: 'molarityM', label: 'Solution Molarity (M)', type: 'number', unit: 'mol/L', defaultValue: 0.15, min: 0, max: 30, step: 0.05 },
      { id: 'tempC', label: 'Solution Temperature', type: 'number', unit: '°C', defaultValue: 37, min: -50, max: 200, step: 1 },
    ],
    calculate: (v) => {
      const [i, M, tc] = [v.vantHoffI, v.molarityM, v.tempC].map(parseNum);
      if ([i, M, tc].some(Number.isNaN) || i <= 0 || M < 0 || tc <= -273) return calcError('Enter positive i and non-negative molarity.');
      const T = tc + 273.15;
      const piAtm = i * M * 0.082057366 * T;
      return {
        primaryValue: fmt(piAtm, 3),
        primaryUnit: 'atm',
        primaryLabel: 'Osmotic Pressure (Π)',
        secondaryOutputs: [
          { label: 'Osmotic Pressure (kPa)', value: `${fmt(piAtm * 101.325, 1)} kPa` },
          { label: 'Osmolarity (i × M)', value: `${fmt(i * M * 1000, 0)} mOsm/L` },
        ],
        steps: [`Π = ${i} × ${M} × 0.082057 × ${fmt(T, 2)} K = ${fmt(piAtm, 3)} atm.`],
      };
    },
  },

  // 838. Boiling Point Elevation & Freezing Point Depression
  {
    slug: 'boiling-point-elevation-freezing-depression-calculator',
    title: 'Boiling Point Elevation & Freezing Point Depression Calculator',
    category: 'science',
    formulaDisplay: 'ΔT_b = i·K_b·m   |   ΔT_f = i·K_f·m (Aqueous: Kb=0.512, Kf=1.86 °C/m)',
    inputs: [
      { id: 'vantHoffI', label: 'van ’t Hoff Dissociation Factor (i)', type: 'number', defaultValue: 2, min: 1, max: 6, step: 0.5 },
      { id: 'molality', label: 'Solution Molality (moles solute / kg solvent)', type: 'number', unit: 'mol/kg', defaultValue: 1.5, min: 0, max: 30, step: 0.25 },
      { id: 'kb', label: 'Ebullioscopic K_b (Water = 0.512)', type: 'number', unit: '°C/m', defaultValue: 0.512, min: 0.01, max: 20, step: 0.1 },
      { id: 'kf', label: 'Cryoscopic K_f (Water = 1.86)', type: 'number', unit: '°C/m', defaultValue: 1.86, min: 0.01, max: 50, step: 0.1 },
    ],
    calculate: (v) => {
      const [i, m, kb, kf] = [v.vantHoffI, v.molality, v.kb, v.kf].map(parseNum);
      if ([i, m, kb, kf].some(Number.isNaN) || i <= 0 || m < 0 || kb <= 0 || kf <= 0) return calcError('Enter positive constants and non-negative molality.');
      const dTb = i * kb * m;
      const dTf = i * kf * m;
      return {
        primaryValue: fmt(0 - dTf, 2),
        primaryUnit: '°C (Water Freezing)',
        primaryLabel: `Freezing Point Depression (−${fmt(dTf, 2)} °C)`,
        secondaryOutputs: [
          { label: 'New Aqueous Boiling Point', value: `${fmt(100 + dTb, 2)} °C (+${fmt(dTb, 2)} °C)` },
        ],
        steps: [`ΔT_f = ${i}×${kf}×${m} = ${fmt(dTf, 2)} °C; ΔT_b = ${fmt(dTb, 2)} °C.`],
      };
    },
  },
];
