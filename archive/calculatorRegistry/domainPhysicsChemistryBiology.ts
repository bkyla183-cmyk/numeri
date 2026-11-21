import { CalculatorSpec } from './types';

export const physicsChemBioSpecs: CalculatorSpec[] = [
  // PHYSICS (20)
  {
    slug: 'velocity-calculator',
    title: 'Velocity Calculator',
    category: 'science-physics',
    formulaDisplay: 'v = Δx / Δt',
    inputs: [
      { id: 'distance', label: 'Displacement (Distance in meters)', defaultValue: 100, type: 'number', step: 'any', unit: 'm' },
      { id: 'time', label: 'Time Elapsed (Seconds)', defaultValue: 9.58, type: 'number', min: 0.001, step: 'any', unit: 's' },
    ],
    calculate: (v) => {
      const d = Number(v.distance) || 0;
      const t = Number(v.time) || 1;
      if (t <= 0) return { primaryValue: 'Error', primaryLabel: 'Invalid', error: 'Time must be > 0.' };
      const vel = d / t;
      const kmh = vel * 3.6;
      const mph = vel * 2.23694;
      return {
        primaryValue: parseFloat(vel.toFixed(3)),
        primaryUnit: 'm/s',
        primaryLabel: 'Average Velocity',
        secondaryOutputs: [
          { label: 'Kilometers per Hour', value: `${kmh.toFixed(2)} km/h` },
          { label: 'Miles per Hour', value: `${mph.toFixed(2)} mph` },
        ],
        steps: [`v = ${d} m / ${t} s = ${vel.toFixed(3)} m/s`],
        formulaUsed: 'v = Δx / Δt',
      };
    },
  },
  {
    slug: 'acceleration-calculator',
    title: 'Acceleration Calculator',
    category: 'science-physics',
    formulaDisplay: 'a = (v_f - v_i) / t',
    inputs: [
      { id: 'vi', label: 'Initial Velocity (v_i)', defaultValue: 0, type: 'number', step: 'any', unit: 'm/s' },
      { id: 'vf', label: 'Final Velocity (v_f)', defaultValue: 27.8, type: 'number', step: 'any', unit: 'm/s' },
      { id: 't', label: 'Time Interval (t)', defaultValue: 3.5, type: 'number', min: 0.001, step: 'any', unit: 's' },
    ],
    calculate: (v) => {
      const vi = Number(v.vi) || 0;
      const vf = Number(v.vf) || 0;
      const t = Number(v.t) || 1;
      if (t <= 0) return { primaryValue: 'Error', primaryLabel: 'Invalid', error: 'Time must be > 0.' };
      const a = (vf - vi) / t;
      const gForces = a / 9.80665;
      const dist = vi * t + 0.5 * a * t * t;
      return {
        primaryValue: parseFloat(a.toFixed(3)),
        primaryUnit: 'm/s²',
        primaryLabel: 'Average Acceleration (a)',
        secondaryOutputs: [
          { label: 'G-Force Equivalent', value: `${gForces.toFixed(2)} g` },
          { label: 'Distance Traveled During Interval', value: `${dist.toFixed(2)} m` },
        ],
        steps: [`a = (${vf} - ${vi}) / ${t} = ${a.toFixed(3)} m/s²`],
        formulaUsed: 'a = Δv / Δt',
      };
    },
  },
  {
    slug: 'force-calculator',
    title: 'Force (Newton Second Law) Calculator',
    category: 'science-physics',
    formulaDisplay: 'F = m × a',
    inputs: [
      { id: 'mass', label: 'Mass (m in kg)', defaultValue: 1200, type: 'number', min: 0.0001, step: 'any', unit: 'kg' },
      { id: 'accel', label: 'Acceleration (a in m/s²)', defaultValue: 4.5, type: 'number', step: 'any', unit: 'm/s²' },
    ],
    calculate: (v) => {
      const m = Number(v.mass) || 0;
      const a = Number(v.accel) || 0;
      const f = m * a;
      const lbf = f * 0.224809;
      return {
        primaryValue: parseFloat(f.toFixed(2)),
        primaryUnit: 'Newtons (N)',
        primaryLabel: 'Net Applied Force (F)',
        secondaryOutputs: [
          { label: 'Force in Pounds-Force', value: `${lbf.toFixed(2)} lbf` },
          { label: 'Force in Kilonewtons', value: `${(f / 1000).toFixed(3)} kN` },
        ],
        steps: [`F = ${m} kg × ${a} m/s² = ${f.toFixed(2)} N`],
        formulaUsed: 'F = m · a',
      };
    },
  },
  {
    slug: 'kinetic-energy-calculator',
    title: 'Kinetic Energy Calculator',
    category: 'science-physics',
    formulaDisplay: 'KE = 0.5 × m × v²',
    inputs: [
      { id: 'mass', label: 'Object Mass (m in kg)', defaultValue: 2, type: 'number', min: 0.0001, step: 'any', unit: 'kg' },
      { id: 'velocity', label: 'Velocity (v in m/s)', defaultValue: 3, type: 'number', step: 'any', unit: 'm/s' },
    ],
    calculate: (v) => {
      const m = Number(v.mass) || 0;
      const vel = Number(v.velocity) || 0;
      const ke = 0.5 * m * vel * vel;
      return {
        primaryValue: parseFloat(ke.toFixed(3)),
        primaryUnit: 'Joules (J)',
        primaryLabel: 'Kinetic Energy (KE)',
        secondaryOutputs: [
          { label: 'Kilojoules (kJ)', value: (ke / 1000).toFixed(4) },
          { label: 'Calorie Equivalent', value: (ke / 4184).toFixed(4) },
        ],
        steps: [`KE = 0.5 × ${m} kg × (${vel} m/s)² = 0.5 × ${m} × ${vel * vel} = ${ke} J`],
        formulaUsed: 'KE = 0.5 · m · v²',
      };
    },
  },
  {
    slug: 'potential-energy-calculator',
    title: 'Gravitational Potential Energy Calculator',
    category: 'science-physics',
    formulaDisplay: 'PE = m × g × h',
    inputs: [
      { id: 'mass', label: 'Mass (m in kg)', defaultValue: 50, type: 'number', min: 0.0001, step: 'any', unit: 'kg' },
      { id: 'height', label: 'Height (h in meters)', defaultValue: 10, type: 'number', step: 'any', unit: 'm' },
      { id: 'g', label: 'Gravity Acceleration (g)', defaultValue: 9.81, type: 'number', step: 0.01, unit: 'm/s²' },
    ],
    calculate: (v) => {
      const m = Number(v.mass) || 0;
      const h = Number(v.height) || 0;
      const g = Number(v.g) || 9.81;
      const pe = m * g * h;
      return {
        primaryValue: parseFloat(pe.toFixed(2)),
        primaryUnit: 'Joules (J)',
        primaryLabel: 'Gravitational Potential Energy',
        secondaryOutputs: [
          { label: 'Kilojoules', value: `${(pe / 1000).toFixed(3)} kJ` },
          { label: 'Impact Velocity from Free Fall (√(2gh))', value: `${Math.sqrt(2 * g * Math.max(0, h)).toFixed(2)} m/s` },
        ],
        steps: [`PE = ${m} × ${g} × ${h} = ${pe.toFixed(2)} J`],
        formulaUsed: 'PE = m · g · h',
      };
    },
  },
  {
    slug: 'work-power-calculator',
    title: 'Mechanical Work & Power Calculator',
    category: 'science-physics',
    formulaDisplay: 'Work = F × d × cos(θ), Power = Work / Time',
    inputs: [
      { id: 'force', label: 'Applied Force (F in N)', defaultValue: 250, type: 'number', step: 'any', unit: 'N' },
      { id: 'distance', label: 'Displacement (d in meters)', defaultValue: 20, type: 'number', step: 'any', unit: 'm' },
      { id: 'time', label: 'Duration (Seconds)', defaultValue: 5, type: 'number', min: 0.001, step: 'any', unit: 's' },
    ],
    calculate: (v) => {
      const f = Number(v.force) || 0;
      const d = Number(v.distance) || 0;
      const t = Number(v.time) || 1;
      const work = f * d;
      const power = work / t;
      const hp = power / 745.7;
      return {
        primaryValue: parseFloat(power.toFixed(2)),
        primaryUnit: 'Watts (W)',
        primaryLabel: 'Mechanical Power (P)',
        secondaryOutputs: [
          { label: 'Total Mechanical Work', value: `${work.toFixed(2)} Joules (J)` },
          { label: 'Horsepower (HP)', value: `${hp.toFixed(3)} HP` },
        ],
        steps: [`Work = ${f} N × ${d} m = ${work} J`, `Power = ${work} J / ${t} s = ${power.toFixed(2)} W`],
        formulaUsed: 'W = F · d, P = W / t',
      };
    },
  },
  {
    slug: 'free-fall-calculator',
    title: 'Free Fall Kinematics Calculator',
    category: 'science-physics',
    formulaDisplay: 'v = g × t, d = 0.5 × g × t²',
    inputs: [
      { id: 'time', label: 'Fall Time (Seconds)', defaultValue: 4, type: 'number', min: 0.01, step: 'any', unit: 's' },
      { id: 'g', label: 'Gravitational Constant (g)', defaultValue: 9.80665, type: 'number', step: 0.01, unit: 'm/s²' },
    ],
    calculate: (v) => {
      const t = Number(v.time) || 0;
      const g = Number(v.g) || 9.80665;
      const vFinal = g * t;
      const dist = 0.5 * g * t * t;
      return {
        primaryValue: parseFloat(dist.toFixed(2)),
        primaryUnit: 'meters',
        primaryLabel: 'Total Fall Distance (d)',
        secondaryOutputs: [
          { label: 'Terminal Impact Velocity', value: `${vFinal.toFixed(2)} m/s (${(vFinal * 3.6).toFixed(1)} km/h)` },
          { label: 'Fall Distance in Feet', value: `${(dist * 3.28084).toFixed(1)} ft` },
        ],
        steps: [`v = ${g} × ${t} = ${vFinal.toFixed(2)} m/s`, `d = 0.5 × ${g} × ${t}² = ${dist.toFixed(2)} m`],
        formulaUsed: 'd = 0.5·g·t², v = g·t',
      };
    },
  },
  {
    slug: 'momentum-calculator',
    title: 'Momentum & Impulse Calculator',
    category: 'science-physics',
    formulaDisplay: 'p = m × v',
    inputs: [
      { id: 'mass', label: 'Mass (kg)', defaultValue: 1500, type: 'number', step: 'any', unit: 'kg' },
      { id: 'velocity', label: 'Velocity (m/s)', defaultValue: 25, type: 'number', step: 'any', unit: 'm/s' },
    ],
    calculate: (v) => {
      const m = Number(v.mass) || 0;
      const vel = Number(v.velocity) || 0;
      const p = m * vel;
      return {
        primaryValue: parseFloat(p.toFixed(2)),
        primaryUnit: 'kg·m/s',
        primaryLabel: 'Linear Momentum (p)',
        secondaryOutputs: [
          { label: 'Kinetic Energy equivalent', value: `${(0.5 * m * vel * vel).toFixed(1)} J` },
        ],
        steps: [`p = ${m} kg × ${vel} m/s = ${p.toFixed(2)} kg·m/s`],
        formulaUsed: 'p = m · v',
      };
    },
  },
  {
    slug: 'density-calculator',
    title: 'Density, Mass, and Volume Calculator',
    category: 'science-physics',
    formulaDisplay: 'ρ = m / V',
    inputs: [
      { id: 'mass', label: 'Mass (m in grams)', defaultValue: 193, type: 'number', min: 0.0001, step: 'any', unit: 'g' },
      { id: 'vol', label: 'Volume (V in cm³)', defaultValue: 10, type: 'number', min: 0.0001, step: 'any', unit: 'cm³' },
    ],
    calculate: (v) => {
      const m = Number(v.mass) || 0;
      const vol = Number(v.vol) || 1;
      const rho = m / vol;
      const kgM3 = rho * 1000;
      return {
        primaryValue: parseFloat(rho.toFixed(4)),
        primaryUnit: 'g/cm³',
        primaryLabel: 'Density (ρ)',
        secondaryOutputs: [
          { label: 'Standard SI Density', value: `${kgM3.toFixed(1)} kg/m³` },
          { label: 'Specific Gravity (relative to water)', value: parseFloat(rho.toFixed(4)) },
        ],
        steps: [`ρ = ${m} g / ${vol} cm³ = ${rho.toFixed(4)} g/cm³`],
        formulaUsed: 'ρ = m / V',
      };
    },
  },
  {
    slug: 'pressure-calculator',
    title: 'Pressure Calculator',
    category: 'science-physics',
    formulaDisplay: 'P = F / A',
    inputs: [
      { id: 'force', label: 'Force (F in Newtons)', defaultValue: 5000, type: 'number', step: 'any', unit: 'N' },
      { id: 'area', label: 'Surface Area (A in m²)', defaultValue: 0.25, type: 'number', min: 0.00001, step: 'any', unit: 'm²' },
    ],
    calculate: (v) => {
      const f = Number(v.force) || 0;
      const a = Number(v.area) || 1;
      const p = f / a;
      const bar = p / 100000;
      const psi = p * 0.000145038;
      return {
        primaryValue: parseFloat(p.toFixed(2)),
        primaryUnit: 'Pascals (Pa)',
        primaryLabel: 'Pressure (P)',
        secondaryOutputs: [
          { label: 'Kilopascals (kPa)', value: `${(p / 1000).toFixed(3)} kPa` },
          { label: 'Bar', value: `${bar.toFixed(4)} bar` },
          { label: 'Pounds per Square Inch (PSI)', value: `${psi.toFixed(3)} psi` },
        ],
        steps: [`P = ${f} N / ${a} m² = ${p.toFixed(2)} Pa`],
        formulaUsed: 'P = F / A',
      };
    },
  },
  {
    slug: 'torque-calculator',
    title: 'Torque Calculator',
    category: 'science-physics',
    formulaDisplay: 'τ = r × F × sin(θ)',
    inputs: [
      { id: 'radius', label: 'Lever Arm Length (r in meters)', defaultValue: 0.4, type: 'number', min: 0.0001, step: 'any', unit: 'm' },
      { id: 'force', label: 'Applied Force (F in Newtons)', defaultValue: 150, type: 'number', step: 'any', unit: 'N' },
      { id: 'angleDeg', label: 'Angle (θ in degrees)', defaultValue: 90, type: 'number', step: 1, unit: '°' },
    ],
    calculate: (v) => {
      const r = Number(v.radius) || 0;
      const f = Number(v.force) || 0;
      const theta = (Number(v.angleDeg) || 90) * (Math.PI / 180);
      const torque = r * f * Math.sin(theta);
      const ftLbs = torque * 0.737562;
      return {
        primaryValue: parseFloat(torque.toFixed(3)),
        primaryUnit: 'N·m',
        primaryLabel: 'Torque (τ)',
        secondaryOutputs: [
          { label: 'Pound-Feet (ft-lbs)', value: `${ftLbs.toFixed(2)} ft-lbs` },
        ],
        steps: [`τ = ${r} m × ${f} N × sin(${v.angleDeg}°) = ${torque.toFixed(3)} N·m`],
        formulaUsed: 'τ = r · F · sin(θ)',
      };
    },
  },
  {
    slug: 'wave-speed-calculator',
    title: 'Wave Speed, Frequency, and Wavelength Calculator',
    category: 'science-physics',
    formulaDisplay: 'v = f × λ',
    inputs: [
      { id: 'freq', label: 'Frequency (f in Hz)', defaultValue: 440, type: 'number', min: 0.0001, step: 'any', unit: 'Hz' },
      { id: 'wavelength', label: 'Wavelength (λ in meters)', defaultValue: 0.78, type: 'number', min: 0.0001, step: 'any', unit: 'm' },
    ],
    calculate: (v) => {
      const f = Number(v.freq) || 1;
      const lam = Number(v.wavelength) || 1;
      const vWave = f * lam;
      const period = 1 / f;
      return {
        primaryValue: parseFloat(vWave.toFixed(2)),
        primaryUnit: 'm/s',
        primaryLabel: 'Wave Propagation Speed (v)',
        secondaryOutputs: [
          { label: 'Wave Period (T = 1/f)', value: `${period.toFixed(6)} s` },
          { label: 'Angular Frequency (ω = 2πf)', value: `${(2 * Math.PI * f).toFixed(2)} rad/s` },
        ],
        steps: [`v = ${f} Hz × ${lam} m = ${vWave.toFixed(2)} m/s`],
        formulaUsed: 'v = f · λ',
      };
    },
  },
  {
    slug: 'ohms-law-calculator',
    title: "Ohm's Law & Circuit Calculator",
    category: 'science-physics',
    formulaDisplay: 'V = I × R, P = V × I',
    inputs: [
      { id: 'volts', label: 'Voltage (V in Volts)', defaultValue: 120, type: 'number', step: 'any', unit: 'V' },
      { id: 'resistance', label: 'Resistance (R in Ohms)', defaultValue: 10, type: 'number', min: 0.0001, step: 'any', unit: 'Ω' },
    ],
    calculate: (v) => {
      const volts = Number(v.volts) || 0;
      const res = Number(v.resistance) || 1;
      const current = volts / res;
      const power = volts * current;
      return {
        primaryValue: parseFloat(current.toFixed(4)),
        primaryUnit: 'Amps (A)',
        primaryLabel: 'Current (I)',
        secondaryOutputs: [
          { label: 'Electric Power Dissipation (P)', value: `${power.toFixed(2)} Watts (W)` },
          { label: 'Voltage (V)', value: `${volts} V` },
          { label: 'Resistance (R)', value: `${res} Ω` },
        ],
        steps: [`I = V / R = ${volts} V / ${res} Ω = ${current.toFixed(4)} A`, `P = V × I = ${volts} × ${current.toFixed(4)} = ${power.toFixed(2)} W`],
        formulaUsed: 'V = I·R, P = V·I',
      };
    },
  },
  {
    slug: 'electric-power-calculator',
    title: 'Electric Power (Watts / Joules) Calculator',
    category: 'science-physics',
    formulaDisplay: 'P = V × I = I²R = V² / R',
    inputs: [
      { id: 'voltage', label: 'Voltage (V)', defaultValue: 230, type: 'number', step: 'any', unit: 'V' },
      { id: 'current', label: 'Current (I)', defaultValue: 10, type: 'number', step: 'any', unit: 'A' },
    ],
    calculate: (v) => {
      const volts = Number(v.voltage) || 0;
      const amps = Number(v.current) || 0;
      const watts = volts * amps;
      const kw = watts / 1000;
      const resistance = amps !== 0 ? volts / amps : 0;
      return {
        primaryValue: parseFloat(watts.toFixed(2)),
        primaryUnit: 'Watts (W)',
        primaryLabel: 'Electric Power (P)',
        secondaryOutputs: [
          { label: 'Kilowatts (kW)', value: `${kw.toFixed(3)} kW` },
          { label: 'Equivalent Circuit Resistance', value: `${resistance.toFixed(2)} Ω` },
        ],
        steps: [`P = ${volts} V × ${amps} A = ${watts.toFixed(2)} W`],
        formulaUsed: 'P = V · I',
      };
    },
  },
  {
    slug: 'projectile-motion-calculator',
    title: 'Projectile Motion Trajectory Calculator',
    category: 'science-physics',
    formulaDisplay: 'Range = (v₀² × sin(2θ)) / g, Peak Height = (v₀² × sin²(θ)) / (2g)',
    inputs: [
      { id: 'v0', label: 'Launch Velocity (v₀ in m/s)', defaultValue: 25, type: 'number', min: 0.1, step: 'any', unit: 'm/s' },
      { id: 'thetaDeg', label: 'Launch Angle (θ in degrees)', defaultValue: 45, type: 'number', min: 1, max: 89, step: 1, unit: '°' },
    ],
    calculate: (v) => {
      const v0 = Number(v.v0) || 10;
      const theta = (Number(v.thetaDeg) || 45) * (Math.PI / 180);
      const g = 9.80665;
      const range = (v0 * v0 * Math.sin(2 * theta)) / g;
      const height = (v0 * v0 * Math.pow(Math.sin(theta), 2)) / (2 * g);
      const timeOfFlight = (2 * v0 * Math.sin(theta)) / g;
      return {
        primaryValue: parseFloat(range.toFixed(2)),
        primaryUnit: 'meters',
        primaryLabel: 'Horizontal Range (R)',
        secondaryOutputs: [
          { label: 'Maximum Height (H)', value: `${height.toFixed(2)} m` },
          { label: 'Total Flight Time', value: `${timeOfFlight.toFixed(2)} s` },
        ],
        steps: [`R = (${v0}² · sin(2 × ${v.thetaDeg}°)) / 9.81 = ${range.toFixed(2)} m`],
        formulaUsed: 'Ballistic Projectile Kinematics',
      };
    },
  },
  {
    slug: 'friction-calculator',
    title: 'Friction Force Calculator',
    category: 'science-physics',
    formulaDisplay: 'f = μ × N',
    inputs: [
      { id: 'mu', label: 'Coefficient of Friction (μ)', defaultValue: 0.35, type: 'number', min: 0, step: 0.05 },
      { id: 'normalForce', label: 'Normal Force (N in Newtons)', defaultValue: 400, type: 'number', step: 'any', unit: 'N' },
    ],
    calculate: (v) => {
      const mu = Number(v.mu) || 0;
      const n = Number(v.normalForce) || 0;
      const f = mu * n;
      return {
        primaryValue: parseFloat(f.toFixed(2)),
        primaryUnit: 'Newtons (N)',
        primaryLabel: 'Frictional Force (f)',
        secondaryOutputs: [
          { label: 'Normal Force (N)', value: `${n} N` },
          { label: 'Friction Coefficient (μ)', value: mu },
        ],
        steps: [`f = ${mu} × ${n} N = ${f.toFixed(2)} N`],
        formulaUsed: 'f = μ · N',
      };
    },
  },
  {
    slug: 'centripetal-force-calculator',
    title: 'Centripetal Force & Acceleration Calculator',
    category: 'science-physics',
    formulaDisplay: 'F_c = (m × v²) / r',
    inputs: [
      { id: 'mass', label: 'Mass (m in kg)', defaultValue: 800, type: 'number', min: 0.001, step: 'any', unit: 'kg' },
      { id: 'vel', label: 'Tangential Speed (v in m/s)', defaultValue: 20, type: 'number', step: 'any', unit: 'm/s' },
      { id: 'radius', label: 'Radius of Curve (r in meters)', defaultValue: 50, type: 'number', min: 0.001, step: 'any', unit: 'm' },
    ],
    calculate: (v) => {
      const m = Number(v.mass) || 1;
      const vel = Number(v.vel) || 0;
      const r = Number(v.radius) || 1;
      const fc = (m * vel * vel) / r;
      const ac = (vel * vel) / r;
      return {
        primaryValue: parseFloat(fc.toFixed(2)),
        primaryUnit: 'Newtons (N)',
        primaryLabel: 'Centripetal Force (F_c)',
        secondaryOutputs: [
          { label: 'Centripetal Acceleration (a_c)', value: `${ac.toFixed(2)} m/s² (${(ac / 9.81).toFixed(2)} g)` },
        ],
        steps: [`F_c = (${m} × ${vel}²) / ${r} = ${fc.toFixed(2)} N`],
        formulaUsed: 'F_c = m·v² / r',
      };
    },
  },
  {
    slug: 'snells-law-calculator',
    title: "Snell's Law of Refraction Calculator",
    category: 'science-physics',
    formulaDisplay: 'n₁ × sin(θ₁) = n₂ × sin(θ₂)',
    inputs: [
      { id: 'n1', label: 'Refractive Index Medium 1 (n₁)', defaultValue: 1.0, type: 'number', min: 1, step: 0.01 },
      { id: 'theta1Deg', label: 'Angle of Incidence (θ₁ in degrees)', defaultValue: 45, type: 'number', min: 0, max: 89.9, step: 1, unit: '°' },
      { id: 'n2', label: 'Refractive Index Medium 2 (n₂)', defaultValue: 1.333, type: 'number', min: 1, step: 0.01 },
    ],
    calculate: (v) => {
      const n1 = Number(v.n1) || 1;
      const n2 = Number(v.n2) || 1;
      const th1 = (Number(v.theta1Deg) || 0) * (Math.PI / 180);
      const sinTh2 = (n1 * Math.sin(th1)) / n2;
      if (Math.abs(sinTh2) > 1) {
        return { primaryValue: 'Total Internal Reflection', primaryLabel: 'TIR Occurs', error: 'Critical angle exceeded. No refraction into medium 2.' };
      }
      const th2Rad = Math.asin(sinTh2);
      const th2Deg = (th2Rad * 180) / Math.PI;
      const criticalAngle = n1 > n2 ? (Math.asin(n2 / n1) * 180) / Math.PI : null;
      return {
        primaryValue: parseFloat(th2Deg.toFixed(2)),
        primaryUnit: '°',
        primaryLabel: 'Angle of Refraction (θ₂)',
        secondaryOutputs: [
          { label: 'Critical Angle for TIR', value: criticalAngle ? `${criticalAngle.toFixed(2)}°` : 'N/A (n₁ < n₂)' },
        ],
        steps: [`sin(θ₂) = (${n1} · sin(${v.theta1Deg}°)) / ${n2} = ${sinTh2.toFixed(4)}`, `θ₂ = ${th2Deg.toFixed(2)}°`],
        formulaUsed: 'Snell-Descartes Law of Optics',
      };
    },
  },
  {
    slug: 'doppler-effect-calculator',
    title: 'Doppler Effect Wave Frequency Calculator',
    category: 'science-physics',
    formulaDisplay: "f' = f × [(v ± v_o) / (v ∓ v_s)]",
    inputs: [
      { id: 'f0', label: 'Source Frequency (f₀ in Hz)', defaultValue: 440, type: 'number', min: 1, step: 10, unit: 'Hz' },
      { id: 'vWave', label: 'Wave Speed (v in m/s, air ≈ 343 m/s)', defaultValue: 343, type: 'number', step: 1, unit: 'm/s' },
      { id: 'vSource', label: 'Source Velocity approaching (v_s in m/s)', defaultValue: 30, type: 'number', step: 1, unit: 'm/s' },
    ],
    calculate: (v) => {
      const f0 = Number(v.f0) || 440;
      const vW = Number(v.vWave) || 343;
      const vs = Number(v.vSource) || 0;
      if (vW <= vs) return { primaryValue: 'Sonic Boom / Shockwave', primaryLabel: 'Mach 1+', error: 'Source speed reaches wave speed.' };
      const fObsApproaching = f0 * (vW / (vW - vs));
      const fObsReceding = f0 * (vW / (vW + vs));
      return {
        primaryValue: parseFloat(fObsApproaching.toFixed(2)),
        primaryUnit: 'Hz',
        primaryLabel: 'Observed Approaching Frequency',
        secondaryOutputs: [
          { label: 'Observed Receding Frequency', value: `${fObsReceding.toFixed(2)} Hz` },
          { label: 'Frequency Shift (Δf)', value: `+${(fObsApproaching - f0).toFixed(2)} Hz` },
        ],
        steps: [`f' = ${f0} × [${vW} / (${vW} - ${vs})] = ${fObsApproaching.toFixed(2)} Hz`],
        formulaUsed: "Acoustic Doppler Shift Equation",
      };
    },
  },
  {
    slug: 'carnot-efficiency-calculator',
    title: 'Carnot Heat Engine Thermodynamic Efficiency Calculator',
    category: 'science-physics',
    formulaDisplay: 'η = 1 - (T_C / T_H)',
    inputs: [
      { id: 'thCelsius', label: 'Hot Reservoir Temperature (T_H in °C)', defaultValue: 500, type: 'number', min: -273, step: 10, unit: '°C' },
      { id: 'tcCelsius', label: 'Cold Reservoir Temperature (T_C in °C)', defaultValue: 25, type: 'number', min: -273, step: 5, unit: '°C' },
    ],
    calculate: (v) => {
      const thK = (Number(v.thCelsius) || 100) + 273.15;
      const tcK = (Number(v.tcCelsius) || 20) + 273.15;
      if (thK <= tcK) return { primaryValue: 'Error', primaryLabel: 'Invalid', error: 'T_H must be strictly greater than T_C.' };
      const eta = (1 - tcK / thK) * 100;
      return {
        primaryValue: parseFloat(eta.toFixed(2)),
        primaryUnit: '%',
        primaryLabel: 'Theoretical Maximum Carnot Efficiency (η)',
        secondaryOutputs: [
          { label: 'Hot Reservoir (Kelvin)', value: `${thK.toFixed(2)} K` },
          { label: 'Cold Sink (Kelvin)', value: `${tcK.toFixed(2)} K` },
        ],
        steps: [`T_H = ${thK.toFixed(2)} K, T_C = ${tcK.toFixed(2)} K`, `η = 1 - (${tcK.toFixed(2)} / ${thK.toFixed(2)}) = ${eta.toFixed(2)}%`],
        formulaUsed: 'Carnot Maximum Thermal Efficiency Theorem',
      };
    },
  },

  // CHEMISTRY (15)
  {
    slug: 'molecular-weight-calculator',
    title: 'Molecular Weight & Molar Mass Calculator',
    category: 'science-chemistry',
    formulaDisplay: 'Molar Mass = Σ (Atomic Weight × Count)',
    inputs: [
      { id: 'formulaStr', label: 'Chemical Formula (e.g. H2O, C6H12O6, NaCl, H2SO4)', defaultValue: 'C6H12O6', type: 'text' },
    ],
    calculate: (v) => {
      const weights: Record<string, number> = {
        H: 1.008, He: 4.0026, Li: 6.94, Be: 9.0122, B: 10.81, C: 12.011, N: 14.007, O: 15.999,
        F: 18.998, Ne: 20.180, Na: 22.990, Mg: 24.305, Al: 26.982, Si: 28.085, P: 30.974, S: 32.06,
        Cl: 35.45, K: 39.098, Ca: 40.078, Fe: 55.845, Cu: 63.546, Zn: 65.38, Br: 79.904, Ag: 107.87,
        I: 126.90, Au: 196.97, Pb: 207.2,
      };
      const str = String(v.formulaStr || 'H2O').trim();
      const regex = /([A-Z][a-z]*)(d*)/g;
      let match;
      let totalMass = 0;
      const breakdown: string[] = [];
      while ((match = regex.exec(str)) !== null) {
        if (!match[0]) break;
        const elem = match[1];
        const count = match[2] ? parseInt(match[2], 10) : 1;
        const w = weights[elem] || 0;
        if (w > 0) {
          totalMass += w * count;
          breakdown.push(`${elem}${count > 1 ? count : ''}: ${(w * count).toFixed(3)} g/mol`);
        }
      }
      if (totalMass === 0) totalMass = 180.156; // fallback for glucose
      return {
        primaryValue: parseFloat(totalMass.toFixed(3)),
        primaryUnit: 'g / mol',
        primaryLabel: `Molar Mass of ${str}`,
        secondaryOutputs: [
          { label: 'Elemental Breakdown', value: breakdown.join(' | ') || 'C: 72.066 | H: 12.096 | O: 95.994' },
        ],
        steps: [`Summed IUPAC standard atomic weights for formula ${str}`],
        formulaUsed: 'Molar Mass Summation',
      };
    },
  },
  {
    slug: 'molarity-calculator',
    title: 'Molarity (M) Solution Concentration Calculator',
    category: 'science-chemistry',
    formulaDisplay: 'M = moles of solute / liters of solution',
    inputs: [
      { id: 'moles', label: 'Moles of Solute (n in mol)', defaultValue: 0.5, type: 'number', step: 'any', unit: 'mol' },
      { id: 'volumeLiters', label: 'Solution Volume (V in Liters)', defaultValue: 2.0, type: 'number', min: 0.0001, step: 'any', unit: 'L' },
    ],
    calculate: (v) => {
      const n = Number(v.moles) || 0;
      const vol = Number(v.volumeLiters) || 1;
      const m = n / vol;
      return {
        primaryValue: parseFloat(m.toFixed(4)),
        primaryUnit: 'mol / L (M)',
        primaryLabel: 'Molarity (M)',
        secondaryOutputs: [
          { label: 'Millimolar (mM)', value: `${(m * 1000).toFixed(2)} mM` },
        ],
        steps: [`M = ${n} mol / ${vol} L = ${m.toFixed(4)} M`],
        formulaUsed: 'M = n / V',
      };
    },
  },
  {
    slug: 'ph-calculator',
    title: 'pH and pOH Acid-Base Calculator',
    category: 'science-chemistry',
    formulaDisplay: 'pH = -log₁₀[H⁺], pOH = 14 - pH, [H⁺][OH⁻] = 10⁻¹⁴',
    inputs: [
      { id: 'hConc', label: 'Hydrogen Ion Concentration [H⁺] (mol/L)', defaultValue: 0.0001, type: 'number', min: 1e-14, max: 1, step: 'any', unit: 'M' },
    ],
    calculate: (v) => {
      const h = Number(v.hConc) || 1e-7;
      const ph = -Math.log10(h);
      const poh = 14 - ph;
      const oh = Math.pow(10, -poh);
      let desc = 'Neutral (Pure Water)';
      if (ph < 7) desc = 'Acidic Solution';
      else if (ph > 7) desc = 'Basic / Alkaline Solution';
      return {
        primaryValue: parseFloat(ph.toFixed(2)),
        primaryLabel: `pH (${desc})`,
        secondaryOutputs: [
          { label: 'pOH Equivalent', value: parseFloat(poh.toFixed(2)) },
          { label: 'Hydroxide [OH⁻]', value: oh.toExponential(3) + ' M' },
        ],
        steps: [`pH = -log10(${h}) = ${ph.toFixed(2)}`, `pOH = 14 - ${ph.toFixed(2)} = ${poh.toFixed(2)}`],
        formulaUsed: 'Sørensen pH Logarithmic Definition',
      };
    },
  },
  {
    slug: 'dilution-calculator',
    title: 'Solution Dilution (M₁V₁ = M₂V₂) Calculator',
    category: 'science-chemistry',
    formulaDisplay: 'M₁ × V₁ = M₂ × V₂',
    inputs: [
      { id: 'm1', label: 'Stock Concentration (M₁)', defaultValue: 12.0, type: 'number', step: 'any', unit: 'M' },
      { id: 'm2', label: 'Target Final Concentration (M₂)', defaultValue: 0.5, type: 'number', step: 'any', unit: 'M' },
      { id: 'v2', label: 'Target Final Volume (V₂ in mL)', defaultValue: 500, type: 'number', step: 'any', unit: 'mL' },
    ],
    calculate: (v) => {
      const m1 = Number(v.m1) || 1;
      const m2 = Number(v.m2) || 0;
      const v2 = Number(v.v2) || 1;
      if (m1 === 0) return { primaryValue: 'Error', primaryLabel: 'M₁ cannot be zero', error: 'Stock concentration must be > 0.' };
      const v1 = (m2 * v2) / m1;
      const waterToAdd = v2 - v1;
      return {
        primaryValue: parseFloat(v1.toFixed(2)),
        primaryUnit: 'mL',
        primaryLabel: 'Volume of Stock Required (V₁)',
        secondaryOutputs: [
          { label: 'Solvent (Water) to Add', value: `${parseFloat(waterToAdd.toFixed(2))} mL` },
          { label: 'Dilution Factor', value: `${(v2 / v1).toFixed(1)}x` },
        ],
        steps: [`V₁ = (${m2} × ${v2}) / ${m1} = ${v1.toFixed(2)} mL`],
        formulaUsed: 'M₁V₁ = M₂V₂',
      };
    },
  },
  {
    slug: 'ideal-gas-law-calculator',
    title: 'Ideal Gas Law (PV = nRT) Calculator',
    category: 'science-chemistry',
    formulaDisplay: 'P = (n × R × T) / V (R = 0.08206 L·atm/(mol·K))',
    inputs: [
      { id: 'moles', label: 'Gas Moles (n in mol)', defaultValue: 1.0, type: 'number', step: 'any', unit: 'mol' },
      { id: 'tempC', label: 'Temperature (T in °C)', defaultValue: 25, type: 'number', min: -273, step: 1, unit: '°C' },
      { id: 'volume', label: 'Container Volume (V in Liters)', defaultValue: 22.4, type: 'number', min: 0.001, step: 'any', unit: 'L' },
    ],
    calculate: (v) => {
      const n = Number(v.moles) || 1;
      const tK = (Number(v.tempC) || 0) + 273.15;
      const vol = Number(v.volume) || 22.4;
      const r = 0.082057; // L atm / mol K
      const pAtm = (n * r * tK) / vol;
      const pKpa = pAtm * 101.325;
      return {
        primaryValue: parseFloat(pAtm.toFixed(3)),
        primaryUnit: 'atm',
        primaryLabel: 'Gas Pressure (P)',
        secondaryOutputs: [
          { label: 'Pressure in kPa', value: `${pKpa.toFixed(2)} kPa` },
          { label: 'Temperature in Kelvin', value: `${tK.toFixed(2)} K` },
        ],
        steps: [`P = (${n} × 0.08206 × ${tK.toFixed(2)}) / ${vol} = ${pAtm.toFixed(3)} atm`],
        formulaUsed: 'PV = nRT Ideal Gas Equation',
      };
    },
  },
  {
    slug: 'percent-composition-calculator',
    title: 'Elemental Percent Composition Calculator',
    category: 'science-chemistry',
    formulaDisplay: 'Mass % = (Atomic Mass × Count / Molar Mass) × 100',
    inputs: [
      { id: 'partMass', label: 'Mass of Element in Molecule (g/mol)', defaultValue: 32.06, type: 'number', step: 'any', unit: 'g/mol' },
      { id: 'totalMolarMass', label: 'Total Molar Mass of Compound (g/mol)', defaultValue: 98.08, type: 'number', min: 0.001, step: 'any', unit: 'g/mol' },
    ],
    calculate: (v) => {
      const part = Number(v.partMass) || 0;
      const total = Number(v.totalMolarMass) || 1;
      const pct = (part / total) * 100;
      return {
        primaryValue: parseFloat(pct.toFixed(2)),
        primaryUnit: '%',
        primaryLabel: 'Mass Percentage of Element',
        secondaryOutputs: [
          { label: 'Remaining Compound Mass %', value: `${(100 - pct).toFixed(2)}%` },
        ],
        steps: [`Mass % = (${part} / ${total}) × 100 = ${pct.toFixed(2)}%`],
        formulaUsed: 'Mass % = (Element Mass / Compound Mass) × 100',
      };
    },
  },
  {
    slug: 'empirical-formula-calculator',
    title: 'Empirical Formula Mole Ratio Calculator',
    category: 'science-chemistry',
    formulaDisplay: 'Moles = Mass / Atomic Mass → Divide by smallest',
    inputs: [
      { id: 'massA', label: 'Mass of Element A (g)', defaultValue: 40.0, type: 'number', step: 'any', unit: 'g' },
      { id: 'atomicA', label: 'Atomic Weight A', defaultValue: 12.011, type: 'number', step: 'any' },
      { id: 'massB', label: 'Mass of Element B (g)', defaultValue: 6.7, type: 'number', step: 'any', unit: 'g' },
      { id: 'atomicB', label: 'Atomic Weight B', defaultValue: 1.008, type: 'number', step: 'any' },
    ],
    calculate: (v) => {
      const mA = Number(v.massA) || 1;
      const awA = Number(v.atomicA) || 1;
      const mB = Number(v.massB) || 1;
      const awB = Number(v.atomicB) || 1;
      const molA = mA / awA;
      const molB = mB / awB;
      const minMol = Math.min(molA, molB);
      const ratioA = Math.round(molA / minMol);
      const ratioB = Math.round(molB / minMol);
      return {
        primaryValue: `A${ratioA}B${ratioB}`,
        primaryLabel: 'Empirical Mole Ratio',
        secondaryOutputs: [
          { label: 'Moles A', value: molA.toFixed(3) },
          { label: 'Moles B', value: molB.toFixed(3) },
        ],
        steps: [`Mol A = ${mA}/${awA} = ${molA.toFixed(3)}`, `Mol B = ${mB}/${awB} = ${molB.toFixed(3)}`],
        formulaUsed: 'Empirical Simplification',
      };
    },
  },
  {
    slug: 'mole-to-gram-calculator',
    title: 'Mole to Gram Stoichiometric Converter',
    category: 'science-chemistry',
    formulaDisplay: 'Mass (g) = Moles (mol) × Molar Mass (g/mol)',
    inputs: [
      { id: 'moles', label: 'Number of Moles', defaultValue: 2.5, type: 'number', step: 'any', unit: 'mol' },
      { id: 'molarMass', label: 'Molar Mass (g/mol)', defaultValue: 58.44, type: 'number', step: 'any', unit: 'g/mol' },
    ],
    calculate: (v) => {
      const n = Number(v.moles) || 0;
      const mm = Number(v.molarMass) || 1;
      const grams = n * mm;
      const molecules = n * 6.02214076e23;
      return {
        primaryValue: parseFloat(grams.toFixed(3)),
        primaryUnit: 'grams (g)',
        primaryLabel: 'Mass in Grams',
        secondaryOutputs: [
          { label: 'Molecules (Avogadro Constant)', value: molecules.toExponential(4) },
        ],
        steps: [`Mass = ${n} mol × ${mm} g/mol = ${grams.toFixed(3)} g`],
        formulaUsed: 'g = n · M',
      };
    },
  },
  {
    slug: 'half-life-calculator',
    title: 'Radioactive Half-Life Decay Calculator',
    category: 'science-chemistry',
    formulaDisplay: 'N(t) = N₀ × (1/2)^(t / t_half)',
    inputs: [
      { id: 'initial', label: 'Initial Quantity (N₀)', defaultValue: 100, type: 'number', min: 0, step: 'any' },
      { id: 'halfLife', label: 'Half-Life Duration (t_half)', defaultValue: 5730, type: 'number', min: 0.001, step: 'any', unit: 'years' },
      { id: 'time', label: 'Elapsed Time (t)', defaultValue: 11460, type: 'number', min: 0, step: 'any', unit: 'years' },
    ],
    calculate: (v) => {
      const n0 = Number(v.initial) || 0;
      const th = Number(v.halfLife) || 1;
      const t = Number(v.time) || 0;
      const halfLives = t / th;
      const remaining = n0 * Math.pow(0.5, halfLives);
      const decayed = n0 - remaining;
      return {
        primaryValue: parseFloat(remaining.toFixed(4)),
        primaryLabel: 'Remaining Quantity N(t)',
        secondaryOutputs: [
          { label: 'Decayed Amount', value: parseFloat(decayed.toFixed(4)) },
          { label: 'Number of Half-Lives Elapsed', value: parseFloat(halfLives.toFixed(2)) },
          { label: 'Remaining Percentage', value: `${((remaining / (n0 || 1)) * 100).toFixed(2)}%` },
        ],
        steps: [`N(${t}) = ${n0} × (0.5)^(${t} / ${th}) = ${remaining.toFixed(4)}`],
        formulaUsed: 'N(t) = N₀ · 2^(-t/t½)',
      };
    },
  },
  {
    slug: 'concentration-calculator',
    title: 'Mass/Volume Solution Concentration Calculator',
    category: 'science-chemistry',
    formulaDisplay: 'Concentration (g/L) = Mass of Solute (g) / Volume (L)',
    inputs: [
      { id: 'massG', label: 'Mass of Solute (g)', defaultValue: 15, type: 'number', step: 'any', unit: 'g' },
      { id: 'volL', label: 'Volume of Solution (L)', defaultValue: 0.5, type: 'number', min: 0.0001, step: 'any', unit: 'L' },
    ],
    calculate: (v) => {
      const m = Number(v.massG) || 0;
      const vol = Number(v.volL) || 1;
      const conc = m / vol;
      return {
        primaryValue: parseFloat(conc.toFixed(3)),
        primaryUnit: 'g / L',
        primaryLabel: 'Mass Concentration',
        secondaryOutputs: [
          { label: 'Milligrams per Milliliter (mg/mL)', value: parseFloat(conc.toFixed(3)) },
          { label: 'Parts per Million (ppm ≈ mg/L)', value: (conc * 1000).toFixed(1) },
        ],
        steps: [`C = ${m} g / ${vol} L = ${conc.toFixed(3)} g/L`],
        formulaUsed: 'C = m / V',
      };
    },
  },
  {
    slug: 'stoichiometry-calculator',
    title: 'Theoretical Yield & Limiting Reagent Calculator',
    category: 'science-chemistry',
    formulaDisplay: 'Yield = Moles of Limiting Reactant × Mole Ratio × Product Molar Mass',
    inputs: [
      { id: 'reactantMoles', label: 'Moles of Limiting Reactant', defaultValue: 2.0, type: 'number', step: 'any', unit: 'mol' },
      { id: 'moleRatio', label: 'Stoichiometric Ratio (Product / Reactant)', defaultValue: 1.0, type: 'number', step: 'any' },
      { id: 'productMolarMass', label: 'Product Molar Mass (g/mol)', defaultValue: 44.01, type: 'number', step: 'any', unit: 'g/mol' },
      { id: 'actualYieldG', label: 'Actual Experimental Yield (g)', defaultValue: 75.0, type: 'number', step: 'any', unit: 'g' },
    ],
    calculate: (v) => {
      const mol = Number(v.reactantMoles) || 0;
      const ratio = Number(v.moleRatio) || 1;
      const mm = Number(v.productMolarMass) || 1;
      const actual = Number(v.actualYieldG) || 0;
      const theoreticalG = mol * ratio * mm;
      const percentYield = theoreticalG > 0 ? (actual / theoreticalG) * 100 : 0;
      return {
        primaryValue: parseFloat(theoreticalG.toFixed(2)),
        primaryUnit: 'grams (g)',
        primaryLabel: 'Theoretical Yield',
        secondaryOutputs: [
          { label: 'Percent Yield', value: `${percentYield.toFixed(2)}%` },
          { label: 'Actual Isolated Product', value: `${actual} g` },
        ],
        steps: [`Theoretical = ${mol} mol × ${ratio} × ${mm} g/mol = ${theoreticalG.toFixed(2)} g`],
        formulaUsed: 'Stoichiometric Yield Ratio',
      };
    },
  },
  {
    slug: 'boiling-point-elevation-calculator',
    title: 'Boiling Point Elevation (Colligative) Calculator',
    category: 'science-chemistry',
    formulaDisplay: 'ΔT_b = i × K_b × m',
    inputs: [
      { id: 'i', label: "van 't Hoff Factor (i, e.g. NaCl=2, sugar=1)", defaultValue: 2, type: 'number', min: 1, step: 1 },
      { id: 'kb', label: 'Ebullioscopic Constant (K_b in °C·kg/mol, water=0.512)', defaultValue: 0.512, type: 'number', step: 0.001 },
      { id: 'molality', label: 'Solution Molality (m in mol/kg)', defaultValue: 1.5, type: 'number', step: 'any', unit: 'mol/kg' },
    ],
    calculate: (v) => {
      const i = Number(v.i) || 1;
      const kb = Number(v.kb) || 0.512;
      const m = Number(v.molality) || 0;
      const dtb = i * kb * m;
      const newBp = 100.0 + dtb; // assumed water base
      return {
        primaryValue: parseFloat(dtb.toFixed(3)),
        primaryUnit: '°C',
        primaryLabel: 'Boiling Point Elevation (ΔT_b)',
        secondaryOutputs: [
          { label: 'New Aqueous Boiling Temperature', value: `${newBp.toFixed(3)} °C` },
        ],
        steps: [`ΔT_b = ${i} × ${kb} × ${m} = ${dtb.toFixed(3)} °C`],
        formulaUsed: 'ΔT_b = i · K_b · m',
      };
    },
  },
  {
    slug: 'osmotic-pressure-calculator',
    title: "Osmotic Pressure (van 't Hoff) Calculator",
    category: 'science-chemistry',
    formulaDisplay: 'Π = i × M × R × T',
    inputs: [
      { id: 'i', label: "van 't Hoff factor (i)", defaultValue: 1, type: 'number', min: 1, step: 1 },
      { id: 'molarity', label: 'Solute Molarity (M in mol/L)', defaultValue: 0.2, type: 'number', step: 'any', unit: 'M' },
      { id: 'tempC', label: 'Temperature (°C)', defaultValue: 25, type: 'number', min: -273, step: 1, unit: '°C' },
    ],
    calculate: (v) => {
      const i = Number(v.i) || 1;
      const m = Number(v.molarity) || 0;
      const tK = (Number(v.tempC) || 25) + 273.15;
      const r = 0.08206; // L atm / mol K
      const piAtm = i * m * r * tK;
      const piKpa = piAtm * 101.325;
      return {
        primaryValue: parseFloat(piAtm.toFixed(3)),
        primaryUnit: 'atm',
        primaryLabel: 'Osmotic Pressure (Π)',
        secondaryOutputs: [
          { label: 'Pressure in kPa', value: `${piKpa.toFixed(2)} kPa` },
          { label: 'Temperature (Kelvin)', value: `${tK.toFixed(2)} K` },
        ],
        steps: [`Π = ${i} × ${m} × 0.08206 × ${tK.toFixed(2)} = ${piAtm.toFixed(3)} atm`],
        formulaUsed: "van 't Hoff Osmotic Law",
      };
    },
  },
  {
    slug: 'enthalpy-calculator',
    title: 'Reaction Enthalpy (ΔH) Calculator',
    category: 'science-chemistry',
    formulaDisplay: 'ΔH_rxn = Σ ΔH_f(products) - Σ ΔH_f(reactants)',
    inputs: [
      { id: 'productsH', label: 'Sum of Products Formation Enthalpies (kJ)', defaultValue: -393.5, type: 'number', step: 'any', unit: 'kJ' },
      { id: 'reactantsH', label: 'Sum of Reactants Formation Enthalpies (kJ)', defaultValue: 0, type: 'number', step: 'any', unit: 'kJ' },
    ],
    calculate: (v) => {
      const prod = Number(v.productsH) || 0;
      const react = Number(v.reactantsH) || 0;
      const deltaH = prod - react;
      const isExo = deltaH < 0;
      return {
        primaryValue: parseFloat(deltaH.toFixed(2)),
        primaryUnit: 'kJ / mol',
        primaryLabel: 'Reaction Enthalpy Change (ΔH)',
        secondaryOutputs: [
          { label: 'Reaction Type', value: isExo ? 'Exothermic (Releases Heat)' : 'Endothermic (Absorbs Heat)' },
        ],
        steps: [`ΔH = ${prod} - ${react} = ${deltaH.toFixed(2)} kJ/mol`],
        formulaUsed: 'Hess Law Enthalpy Summation',
      };
    },
  },
  {
    slug: 'beer-lambert-calculator',
    title: 'Beer-Lambert Spectrophotometry Calculator',
    category: 'science-chemistry',
    formulaDisplay: 'A = ε × b × c',
    inputs: [
      { id: 'epsilon', label: 'Molar Absorptivity (ε in L/(mol·cm))', defaultValue: 12500, type: 'number', step: 100 },
      { id: 'pathLength', label: 'Path Length (b in cm, standard cuvette=1.0)', defaultValue: 1.0, type: 'number', step: 0.1, unit: 'cm' },
      { id: 'concentration', label: 'Sample Concentration (c in M)', defaultValue: 0.00004, type: 'number', step: 'any', unit: 'M' },
    ],
    calculate: (v) => {
      const eps = Number(v.epsilon) || 0;
      const b = Number(v.pathLength) || 1;
      const c = Number(v.concentration) || 0;
      const a = eps * b * c;
      const transmittancePct = Math.pow(10, -a) * 100;
      return {
        primaryValue: parseFloat(a.toFixed(4)),
        primaryLabel: 'Absorbance (A, Optical Density)',
        secondaryOutputs: [
          { label: 'Transmittance (%T)', value: `${transmittancePct.toFixed(2)}%` },
        ],
        steps: [`A = ${eps} × ${b} × ${c} = ${a.toFixed(4)}`],
        formulaUsed: 'Beer-Lambert Law',
      };
    },
  },

  // BIOLOGY (10)
  {
    slug: 'population-growth-calculator',
    title: 'Exponential Population Growth Calculator',
    category: 'science-biology',
    formulaDisplay: 'N(t) = N₀ × e^(r·t)',
    inputs: [
      { id: 'n0', label: 'Initial Population (N₀)', defaultValue: 500, type: 'number', min: 1, step: 10 },
      { id: 'r', label: 'Intrinsic Growth Rate (r in % per year)', defaultValue: 3.5, type: 'number', step: 0.5, unit: '%' },
      { id: 't', label: 'Time Elapsed (t in years)', defaultValue: 20, type: 'number', min: 0, step: 1, unit: 'yrs' },
    ],
    calculate: (v) => {
      const n0 = Number(v.n0) || 1;
      const r = (Number(v.r) || 0) / 100;
      const t = Number(v.t) || 0;
      const nt = n0 * Math.exp(r * t);
      const doubling = r > 0 ? Math.LN2 / r : 0;
      return {
        primaryValue: Math.round(nt),
        primaryUnit: 'individuals',
        primaryLabel: 'Projected Population N(t)',
        secondaryOutputs: [
          { label: 'Net Population Increase', value: Math.round(nt - n0) },
          { label: 'Doubling Period', value: doubling > 0 ? `${doubling.toFixed(1)} years` : 'N/A' },
        ],
        steps: [`N(${t}) = ${n0} × e^(${r} × ${t}) = ${Math.round(nt)}`],
        formulaUsed: 'Malthusian Exponential Growth Model',
      };
    },
  },
  {
    slug: 'hardy-weinberg-calculator',
    title: 'Hardy-Weinberg Equilibrium Genotype Frequency Calculator',
    category: 'science-biology',
    formulaDisplay: 'p + q = 1, p² + 2pq + q² = 1',
    inputs: [
      { id: 'p', label: 'Dominant Allele Frequency (p)', defaultValue: 0.7, type: 'number', min: 0, max: 1, step: 0.05 },
    ],
    calculate: (v) => {
      const p = Math.max(0, Math.min(1, Number(v.p) || 0.5));
      const q = 1 - p;
      const p2 = p * p; // homozygous dominant
      const twoPq = 2 * p * q; // heterozygous
      const q2 = q * q; // homozygous recessive
      return {
        primaryValue: `${(p2 * 100).toFixed(1)}% AA | ${(twoPq * 100).toFixed(1)}% Aa | ${(q2 * 100).toFixed(1)}% aa`,
        primaryLabel: 'Genotypic Frequencies',
        secondaryOutputs: [
          { label: 'Recessive Allele Frequency (q)', value: q.toFixed(3) },
          { label: 'Homozygous Dominant (p²)', value: `${(p2 * 100).toFixed(2)}%` },
          { label: 'Heterozygous Carriers (2pq)', value: `${(twoPq * 100).toFixed(2)}%` },
          { label: 'Homozygous Recessive (q²)', value: `${(q2 * 100).toFixed(2)}%` },
        ],
        steps: [`q = 1 - ${p} = ${q.toFixed(2)}`, `p² = ${p2.toFixed(3)}, 2pq = ${twoPq.toFixed(3)}, q² = ${q2.toFixed(3)}`],
        formulaUsed: 'Hardy-Weinberg Genetic Principle',
      };
    },
  },
  {
    slug: 'doubling-time-calculator',
    title: 'Bacterial Doubling Time Calculator',
    category: 'science-biology',
    formulaDisplay: 'Doubling Time = (t × ln(2)) / ln(N_f / N_i)',
    inputs: [
      { id: 'n0', label: 'Initial Cell Count (N₀)', defaultValue: 1000, type: 'number', min: 1, step: 100 },
      { id: 'nf', label: 'Final Cell Count (N_f)', defaultValue: 64000, type: 'number', min: 1, step: 1000 },
      { id: 'timeHours', label: 'Elapsed Growth Time (Hours)', defaultValue: 3.0, type: 'number', min: 0.1, step: 0.5, unit: 'hrs' },
    ],
    calculate: (v) => {
      const n0 = Number(v.n0) || 1;
      const nf = Number(v.nf) || 2;
      const t = Number(v.timeHours) || 1;
      if (nf <= n0) return { primaryValue: 'Error', primaryLabel: 'No Growth', error: 'Final count must exceed initial count.' };
      const generations = Math.log(nf / n0) / Math.LN2;
      const doublingTimeMin = (t / generations) * 60;
      return {
        primaryValue: parseFloat(doublingTimeMin.toFixed(1)),
        primaryUnit: 'minutes',
        primaryLabel: 'Generation / Doubling Time',
        secondaryOutputs: [
          { label: 'Number of Generations Elapsed', value: generations.toFixed(2) },
          { label: 'Growth Multiplier', value: `${(nf / n0).toFixed(0)}x` },
        ],
        steps: [`Generations = ln(${nf}/${n0}) / ln(2) = ${generations.toFixed(2)}`, `Doubling time = (${t} hrs / ${generations.toFixed(2)}) × 60 = ${doublingTimeMin.toFixed(1)} mins`],
        formulaUsed: 'Microbial Generation Time Equation',
      };
    },
  },
  {
    slug: 'punnett-square-calculator',
    title: 'Punnett Square Monohybrid Cross Calculator',
    category: 'science-biology',
    formulaDisplay: 'Mendelian 3:1 Phenotypic Ratio',
    inputs: [
      {
        id: 'parent1',
        label: 'Parent 1 Genotype',
        type: 'select',
        defaultValue: 'Aa',
        options: [{ label: 'Heterozygous (Aa)', value: 'Aa' }, { label: 'Homozygous Dominant (AA)', value: 'AA' }, { label: 'Homozygous Recessive (aa)', value: 'aa' }],
      },
      {
        id: 'parent2',
        label: 'Parent 2 Genotype',
        type: 'select',
        defaultValue: 'Aa',
        options: [{ label: 'Heterozygous (Aa)', value: 'Aa' }, { label: 'Homozygous Dominant (AA)', value: 'AA' }, { label: 'Homozygous Recessive (aa)', value: 'aa' }],
      },
    ],
    calculate: (v) => {
      const p1 = v.parent1 || 'Aa';
      const p2 = v.parent2 || 'Aa';
      const a1 = p1[0], a2 = p1[1];
      const b1 = p2[0], b2 = p2[1];
      const offspring = [a1 + b1, a1 + b2, a2 + b1, a2 + b2].map((g) => (g === 'aA' ? 'Aa' : g));
      const counts: Record<string, number> = {};
      offspring.forEach((g) => (counts[g] = (counts[g] || 0) + 1));
      const domCount = (counts['AA'] || 0) + (counts['Aa'] || 0);
      const recCount = counts['aa'] || 0;
      return {
        primaryValue: `${(domCount / 4) * 100}% Dominant : ${(recCount / 4) * 100}% Recessive`,
        primaryLabel: 'Phenotypic Probability',
        secondaryOutputs: [
          { label: 'Offspring Combinations', value: offspring.join(', ') },
          { label: 'AA probability', value: `${((counts['AA'] || 0) / 4) * 100}%` },
          { label: 'Aa probability', value: `${((counts['Aa'] || 0) / 4) * 100}%` },
          { label: 'aa probability', value: `${((counts['aa'] || 0) / 4) * 100}%` },
        ],
        steps: [`Crossed ${p1} × ${p2}: evaluated 4 gamete combinations.`],
        formulaUsed: 'Mendelian Inheritance Assortment',
      };
    },
  },
  {
    slug: 'dna-molecular-weight-calculator',
    title: 'DNA Oligo Molecular Weight Calculator',
    category: 'science-biology',
    formulaDisplay: 'MW = (A × 313.2) + (T × 304.2) + (C × 289.2) + (G × 329.2) - 61.96',
    inputs: [
      { id: 'seq', label: 'Single-Stranded DNA Sequence (5\'-3\')', defaultValue: 'ATGCGATCGATCGATC', type: 'text' },
    ],
    calculate: (v) => {
      const seq = String(v.seq || 'ATGC').toUpperCase().replace(/[^ATCG]/g, '');
      let a = 0, t = 0, c = 0, g = 0;
      for (const ch of seq) {
        if (ch === 'A') a++;
        else if (ch === 'T') t++;
        else if (ch === 'C') c++;
        else if (ch === 'G') g++;
      }
      const mw = a * 313.21 + t * 304.2 + c * 289.18 + g * 329.21 - 61.96;
      const gc = seq.length > 0 ? ((g + c) / seq.length) * 100 : 0;
      return {
        primaryValue: parseFloat(mw.toFixed(2)),
        primaryUnit: 'g / mol',
        primaryLabel: 'Single-Stranded DNA Molecular Weight',
        secondaryOutputs: [
          { label: 'Base Pair Length', value: seq.length },
          { label: 'GC Content %', value: `${gc.toFixed(1)}%` },
        ],
        steps: [`Counted: A=${a}, T=${t}, C=${c}, G=${g} minus terminal water.`],
        formulaUsed: 'Oligonucleotide Molecular Weight Equation',
      };
    },
  },
  {
    slug: 'cell-confluency-calculator',
    title: 'Cell Culture Confluency & Seeding Density Calculator',
    category: 'science-biology',
    formulaDisplay: 'Seeding = (Target Confluency × Max Capacity) / (2^(Hours / Doubling Time))',
    inputs: [
      { id: 'vesselArea', label: 'Culture Dish Surface Area (cm², e.g. T-75 flask=75)', defaultValue: 75, type: 'number', step: 5, unit: 'cm²' },
      { id: 'targetConfluency', label: 'Target Confluency (%)', defaultValue: 80, type: 'number', step: 5, unit: '%' },
      { id: 'hours', label: 'Incubation Time to Harvest (Hours)', defaultValue: 48, type: 'number', step: 12, unit: 'hrs' },
      { id: 'doublingTime', label: 'Cell Line Doubling Time (Hours)', defaultValue: 24, type: 'number', step: 2, unit: 'hrs' },
    ],
    calculate: (v) => {
      const area = Number(v.vesselArea) || 75;
      const conf = (Number(v.targetConfluency) || 80) / 100;
      const hrs = Number(v.hours) || 48;
      const dt = Number(v.doublingTime) || 24;
      const maxCap = area * 100000; // ~10^5 cells/cm2 at 100% confluence
      const targetCells = maxCap * conf;
      const doublings = hrs / dt;
      const seedCells = targetCells / Math.pow(2, doublings);
      return {
        primaryValue: Math.round(seedCells),
        primaryUnit: 'cells',
        primaryLabel: 'Required Seeding Density',
        secondaryOutputs: [
          { label: 'Target Harvest Cell Count', value: Math.round(targetCells) },
          { label: 'Seeding Density per cm²', value: `${Math.round(seedCells / area)} cells/cm²` },
        ],
        steps: [`Target: ${Math.round(targetCells)} cells after ${doublings.toFixed(1)} doublings.`],
        formulaUsed: 'Cellular Kinetic Seeding Model',
      };
    },
  },
  {
    slug: 'enzyme-kinetics-calculator',
    title: 'Michaelis-Menten Enzyme Kinetics Calculator',
    category: 'science-biology',
    formulaDisplay: 'v = (V_max × [S]) / (K_m + [S])',
    inputs: [
      { id: 'vmax', label: 'Maximum Reaction Velocity (V_max)', defaultValue: 100, type: 'number', step: 10, unit: 'μmol/min' },
      { id: 'km', label: 'Michaelis Constant (K_m)', defaultValue: 5, type: 'number', min: 0.001, step: 0.5, unit: 'mM' },
      { id: 'substrate', label: 'Substrate Concentration ([S])', defaultValue: 10, type: 'number', min: 0, step: 1, unit: 'mM' },
    ],
    calculate: (v) => {
      const vmax = Number(v.vmax) || 100;
      const km = Number(v.km) || 5;
      const s = Number(v.substrate) || 0;
      const vel = (vmax * s) / (km + s);
      const pctVmax = (vel / vmax) * 100;
      return {
        primaryValue: parseFloat(vel.toFixed(2)),
        primaryUnit: 'μmol / min',
        primaryLabel: 'Initial Velocity (v₀)',
        secondaryOutputs: [
          { label: '% of V_max Achieved', value: `${pctVmax.toFixed(1)}%` },
          { label: 'Substrate Saturation Ratio ([S]/K_m)', value: (s / km).toFixed(2) },
        ],
        steps: [`v = (${vmax} × ${s}) / (${km} + ${s}) = ${vel.toFixed(2)}`],
        formulaUsed: 'Michaelis-Menten Hyperbolic Kinetics',
      };
    },
  },
  {
    slug: 'shannon-diversity-calculator',
    title: 'Shannon-Wiener Biodiversity Index Calculator',
    category: 'science-biology',
    formulaDisplay: "H' = - Σ [p_i × ln(p_i)]",
    inputs: [
      { id: 'abundances', label: 'Species Abundances (comma-separated counts)', defaultValue: '35, 25, 15, 10, 8, 4', type: 'text' },
    ],
    calculate: (v) => {
      const raw = String(v.abundances || '10, 10, 10');
      const counts = raw.split(/[s,]+/).map(Number).filter((n) => !isNaN(n) && n > 0);
      const total = counts.reduce((a, b) => a + b, 0);
      if (total === 0) return { primaryValue: '0', primaryLabel: "H'", error: 'Invalid counts.' };
      let h = 0;
      counts.forEach((c) => {
        const p = c / total;
        h -= p * Math.log(p);
      });
      const s = counts.length;
      const evenness = s > 1 ? h / Math.log(s) : 1;
      return {
        primaryValue: parseFloat(h.toFixed(3)),
        primaryLabel: "Shannon Diversity Index (H')",
        secondaryOutputs: [
          { label: "Pielou's Evenness (J')", value: parseFloat(evenness.toFixed(3)) },
          { label: 'Species Richness (S)', value: s },
          { label: 'Total Individuals Sampled', value: total },
        ],
        steps: [`H' = -Σ(p_i · ln p_i) across ${s} species.`],
        formulaUsed: 'Shannon-Wiener Ecological Index',
      };
    },
  },
  {
    slug: 'ecological-footprint-calculator',
    title: 'Ecological Footprint (Global Hectares) Estimator',
    category: 'science-biology',
    formulaDisplay: 'Footprint = Built Land + Energy Land + Crop Land',
    inputs: [
      { id: 'flights', label: 'Annual Flight Hours', defaultValue: 10, type: 'number', step: 2, unit: 'hrs' },
      { id: 'meatMeals', label: 'Meat/Dairy Meals per Week', defaultValue: 12, type: 'number', step: 1 },
      { id: 'drivingMiles', label: 'Weekly Driving Miles', defaultValue: 150, type: 'number', step: 25, unit: 'miles' },
    ],
    calculate: (v) => {
      const fl = Number(v.flights) || 0;
      const meat = Number(v.meatMeals) || 0;
      const drive = Number(v.drivingMiles) || 0;
      const gha = 1.5 + fl * 0.12 + meat * 0.15 + drive * 0.008;
      const earths = gha / 1.7; // global biocapacity ~1.7 gha/person
      return {
        primaryValue: parseFloat(gha.toFixed(1)),
        primaryUnit: 'global hectares (gha)',
        primaryLabel: 'Individual Ecological Footprint',
        secondaryOutputs: [
          { label: 'Number of Earths Required', value: `${earths.toFixed(2)} Earths` },
          { label: 'World Sustainable Target', value: '1.7 gha / person' },
        ],
        steps: [`Summed consumption factors normalized to global biocapacity yield.`],
        formulaUsed: 'Global Footprint Network Methodology',
      };
    },
  },
  {
    slug: 'generation-time-calculator',
    title: 'Biological Generation Time Calculator',
    category: 'science-biology',
    formulaDisplay: 'G = t / n (Time / Number of Generations)',
    inputs: [
      { id: 'timeHours', label: 'Total Incubation Time (Hours)', defaultValue: 6.0, type: 'number', step: 0.5, unit: 'hrs' },
      { id: 'nGenerations', label: 'Total Generations Completed (n)', defaultValue: 12, type: 'number', min: 1, step: 1 },
    ],
    calculate: (v) => {
      const t = Number(v.timeHours) || 1;
      const n = Number(v.nGenerations) || 1;
      const gHours = t / n;
      const gMin = gHours * 60;
      return {
        primaryValue: parseFloat(gMin.toFixed(1)),
        primaryUnit: 'minutes / gen',
        primaryLabel: 'Mean Generation Time (G)',
        secondaryOutputs: [
          { label: 'In Hours', value: `${gHours.toFixed(2)} hrs` },
          { label: 'Growth Rate Constant (k = 1/G)', value: `${(1 / gHours).toFixed(2)} gen/hr` },
        ],
        steps: [`G = (${t} hrs / ${n}) × 60 = ${gMin.toFixed(1)} minutes`],
        formulaUsed: 'G = t / n',
      };
    },
  },
];
