import { CalculatorSpec } from './types';

export const automotiveEnergySpecs: CalculatorSpec[] = [
  // AUTOMOTIVE (15)
  {
    slug: 'fuel-cost-calculator',
    title: 'Trip Fuel Cost & Gas Mileage Calculator',
    category: 'automotive',
    formulaDisplay: 'Trip Cost = (Miles / MPG) × Fuel Price per Gallon',
    inputs: [
      { id: 'distance', label: 'Trip Distance (Miles)', defaultValue: 350, type: 'number', step: 10, unit: 'miles' },
      { id: 'mpg', label: 'Vehicle Fuel Economy (MPG)', defaultValue: 28, type: 'number', min: 1, step: 1, unit: 'MPG' },
      { id: 'pricePerGal', label: 'Gas Price ($ / Gallon)', defaultValue: 3.65, type: 'number', step: 0.05, unit: '$/gal' },
    ],
    calculate: (v) => {
      const d = Number(v.distance) || 0;
      const mpg = Number(v.mpg) || 25;
      const price = Number(v.pricePerGal) || 3.5;
      const gallons = d / mpg;
      const cost = gallons * price;
      const costPerMile = cost / (d || 1);
      return {
        primaryValue: parseFloat(cost.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: 'Total Trip Fuel Cost',
        secondaryOutputs: [
          { label: 'Gallons of Fuel Required', value: `${gallons.toFixed(1)} gal` },
          { label: 'Cost per Mile', value: `$${costPerMile.toFixed(3)} / mi` },
        ],
        steps: [`Gallons = ${d} mi / ${mpg} MPG = ${gallons.toFixed(2)} gal`, `Total Cost = ${gallons.toFixed(2)} × $${price} = $${cost.toFixed(2)}`],
        formulaUsed: 'Cost = (Distance / MPG) × Price',
      };
    },
  },
  {
    slug: 'mpg-calculator',
    title: 'Actual Gas Mileage (MPG) Calculator',
    category: 'automotive',
    formulaDisplay: 'MPG = Miles Driven / Gallons Filled',
    inputs: [
      { id: 'miles', label: 'Odometer Trip Miles', defaultValue: 380, type: 'number', step: 5, unit: 'miles' },
      { id: 'gallons', label: 'Gallons to Refill Tank', defaultValue: 13.2, type: 'number', min: 0.1, step: 0.1, unit: 'gal' },
    ],
    calculate: (v) => {
      const m = Number(v.miles) || 0;
      const g = Number(v.gallons) || 1;
      const mpg = m / g;
      const l100km = 235.214583 / mpg;
      return {
        primaryValue: parseFloat(mpg.toFixed(1)),
        primaryUnit: 'MPG',
        primaryLabel: 'Fuel Economy (Miles per Gallon)',
        secondaryOutputs: [
          { label: 'Metric Liters per 100 km (L/100km)', value: `${l100km.toFixed(2)} L/100km` },
          { label: 'Kilometers per Liter', value: `${(mpg * 0.425144).toFixed(2)} km/L` },
        ],
        steps: [`MPG = ${m} miles / ${g} gallons = ${mpg.toFixed(2)} MPG`],
        formulaUsed: 'MPG = Miles / Gallons',
      };
    },
  },
  {
    slug: 'gas-vs-ev-calculator',
    title: 'Gas vs Electric Vehicle (EV) Fuel Savings Calculator',
    category: 'automotive',
    formulaDisplay: 'Annual EV Savings = Gas Annual Cost - Electricity Annual Cost',
    inputs: [
      { id: 'annualMiles', label: 'Annual Driving Distance (Miles)', defaultValue: 14000, type: 'number', step: 1000, unit: 'miles' },
      { id: 'gasMpg', label: 'Gas Car MPG', defaultValue: 26, type: 'number', step: 1, unit: 'MPG' },
      { id: 'gasPrice', label: 'Gas Price ($/gal)', defaultValue: 3.70, type: 'number', step: 0.1, unit: '$/gal' },
      { id: 'evEfficiency', label: 'EV Consumption (kWh / 100 miles)', defaultValue: 30, type: 'number', step: 1, unit: 'kWh/100mi' },
      { id: 'electricRate', label: 'Electricity Cost ($ / kWh)', defaultValue: 0.16, type: 'number', step: 0.01, unit: '$/kWh' },
    ],
    calculate: (v) => {
      const mi = Number(v.annualMiles) || 12000;
      const mpg = Number(v.gasMpg) || 25;
      const gPrice = Number(v.gasPrice) || 3.5;
      const evEff = Number(v.evEfficiency) || 30;
      const eRate = Number(v.electricRate) || 0.15;
      const annualGasCost = (mi / mpg) * gPrice;
      const annualEvCost = (mi / 100) * evEff * eRate;
      const savings = annualGasCost - annualEvCost;
      return {
        primaryValue: parseFloat(savings.toFixed(2)),
        primaryUnit: '$ / year',
        primaryLabel: 'Annual Fuel Savings with EV',
        secondaryOutputs: [
          { label: 'Annual Gas Vehicle Cost', value: `$${annualGasCost.toFixed(2)}` },
          { label: 'Annual Electric Vehicle Cost', value: `$${annualEvCost.toFixed(2)}` },
          { label: '5-Year Cumulative Savings', value: `$${(savings * 5).toFixed(2)}` },
        ],
        steps: [`Gas cost: $${annualGasCost.toFixed(0)} - EV cost: $${annualEvCost.toFixed(0)} = $${savings.toFixed(0)} annual savings`],
        formulaUsed: 'Annual Savings = Gas Expense - EV Energy Expense',
      };
    },
  },
  {
    slug: 'auto-loan-calculator',
    title: 'Auto Loan Financing Calculator',
    category: 'automotive',
    formulaDisplay: 'Payment = P · [r(1+r)^n] / [(1+r)^n - 1]',
    inputs: [
      { id: 'price', label: 'Car Price ($)', defaultValue: 35000, type: 'number', step: 1000, unit: '$' },
      { id: 'down', label: 'Down Payment & Trade ($)', defaultValue: 7000, type: 'number', step: 500, unit: '$' },
      { id: 'apr', label: 'Interest Rate (%)', defaultValue: 6.2, type: 'number', step: 0.1, unit: '%' },
      { id: 'months', label: 'Term (Months)', defaultValue: 60, type: 'number', step: 12, unit: 'mo' },
    ],
    calculate: (v) => {
      const p = Math.max(0, (Number(v.price) || 0) - (Number(v.down) || 0));
      const apr = Number(v.apr) || 0;
      const n = Number(v.months) || 60;
      const r = apr / 100 / 12;
      const pmt = r > 0 ? (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : p / n;
      const totalCost = pmt * n;
      const interest = totalCost - p;
      return {
        primaryValue: parseFloat(pmt.toFixed(2)),
        primaryUnit: '$ / mo',
        primaryLabel: 'Monthly Car Payment',
        secondaryOutputs: [
          { label: 'Total Loan Interest', value: `$${interest.toFixed(2)}` },
          { label: 'Total Principal Financed', value: `$${p.toFixed(2)}` },
        ],
        steps: [`Amortized $${p} over ${n} monthly installments at ${apr}% APR.`],
        formulaUsed: 'Standard Auto Loan Amortization',
      };
    },
  },
  {
    slug: 'car-lease-vs-buy-calculator',
    title: 'Car Lease vs Buy Financial Comparison',
    category: 'automotive',
    formulaDisplay: 'Net Total Outlay: Lease vs Purchase Ownership',
    inputs: [
      { id: 'carPrice', label: 'Car Price ($)', defaultValue: 42000, type: 'number', step: 1000, unit: '$' },
      { id: 'leaseMonthly', label: 'Monthly Lease Payment ($)', defaultValue: 480, type: 'number', step: 20, unit: '$' },
      { id: 'buyMonthly', label: 'Monthly Loan Payment ($)', defaultValue: 720, type: 'number', step: 20, unit: '$' },
      { id: 'residualVal', label: 'Residual Car Resale Value after 3 Years ($)', defaultValue: 25000, type: 'number', step: 1000, unit: '$' },
    ],
    calculate: (v) => {
      const price = Math.max(0, Number(v.carPrice) || 42000);
      const lMonthly = Math.max(0, Number(v.leaseMonthly) || 480);
      const bMonthly = Math.max(0, Number(v.buyMonthly) || 720);
      const residual = Math.max(0, Number(v.residualVal) || 25000);

      const leaseCost3Yr = lMonthly * 36;
      const buyPaid3Yr = bMonthly * 36;
      const depreciation3Yr = Math.max(0, price - residual);
      const netBuyCost3Yr = buyPaid3Yr - residual;
      const savings = Math.abs(leaseCost3Yr - netBuyCost3Yr);
      const buyIsBetter = netBuyCost3Yr < leaseCost3Yr;

      return {
        primaryValue: parseFloat(leaseCost3Yr.toFixed(2)),
        primaryUnit: '$ Total 3-Yr Lease Payments',
        primaryLabel: '3-Year Total Lease Outlay',
        secondaryOutputs: [
          { label: '3-Year Net Buying Cost (Payments - Equity)', value: `$${netBuyCost3Yr.toFixed(2)}` },
          { label: '3-Year Vehicle Depreciation', value: `$${depreciation3Yr.toFixed(2)}` },
          { label: 'Vehicle Resale Equity Value', value: `$${residual.toFixed(2)}` },
          { label: 'Financial Advantage', value: buyIsBetter ? `Buying saves $${savings.toFixed(2)}` : `Leasing saves $${savings.toFixed(2)}` },
        ],
        steps: [
          `3-Year Lease Outlay = $${lMonthly} × 36 months = $${leaseCost3Yr.toFixed(2)} (leaves $0 equity).`,
          `3-Year Purchase Outlay = $${bMonthly} × 36 months = $${buyPaid3Yr.toFixed(2)}, retaining $${residual.toFixed(2)} resale value.`,
          `Vehicle Depreciation = Car Price ($${price.toLocaleString()}) - Residual ($${residual.toLocaleString()}) = $${depreciation3Yr.toFixed(2)}.`,
          `Net Buying Cost = $${buyPaid3Yr.toFixed(2)} - $${residual.toFixed(2)} equity = $${netBuyCost3Yr.toFixed(2)}.`,
          buyIsBetter ? `Buying is more economical by $${savings.toFixed(2)} after 3 years.` : `Leasing has a lower net cash cost by $${savings.toFixed(2)}.`
        ],
        formulaUsed: 'Net Cost of Ownership Horizon Analysis',
      };
    },
  },
  {
    slug: 'tire-size-calculator',
    title: 'Tire Size Comparison & Diameter Calculator',
    category: 'automotive',
    formulaDisplay: 'Tire Diameter = 2 × (Width × Aspect Ratio) + Wheel Rim Diameter',
    inputs: [
      { id: 'widthMm', label: 'Tire Width (mm, e.g. 225)', defaultValue: 225, type: 'number', step: 10, unit: 'mm' },
      { id: 'aspect', label: 'Aspect Ratio (e.g. 50 for 50%)', defaultValue: 50, type: 'number', step: 5, unit: '%' },
      { id: 'rimIn', label: 'Wheel Rim Diameter (inches, e.g. 17)', defaultValue: 17, type: 'number', step: 1, unit: 'in' },
    ],
    calculate: (v) => {
      const w = Number(v.widthMm) || 205;
      const ar = (Number(v.aspect) || 55) / 100;
      const rim = Number(v.rimIn) || 16;
      const sidewallIn = (w * ar) / 25.4;
      const totalDia = 2 * sidewallIn + rim;
      const circ = Math.PI * totalDia;
      const revsPerMile = 63360 / circ;
      return {
        primaryValue: parseFloat(totalDia.toFixed(2)),
        primaryUnit: 'inches',
        primaryLabel: 'Total Overall Tire Diameter',
        secondaryOutputs: [
          { label: 'Sidewall Height', value: `${sidewallIn.toFixed(2)} in (${(w * ar).toFixed(1)} mm)` },
          { label: 'Circumference', value: `${circ.toFixed(2)} inches` },
          { label: 'Revolutions per Mile', value: Math.round(revsPerMile) },
        ],
        steps: [`Sidewall = (${w} × ${ar}) / 25.4 = ${sidewallIn.toFixed(2)}" × 2 + ${rim}" = ${totalDia.toFixed(2)}"`],
        formulaUsed: 'Overall Diameter = 2(W·AR) + Rim',
      };
    },
  },
  {
    slug: 'horsepower-calculator',
    title: 'Engine Horsepower & Torque (RPM) Calculator',
    category: 'automotive',
    formulaDisplay: 'Horsepower = (Torque ft-lbs × RPM) / 5252',
    inputs: [
      { id: 'torqueFtLbs', label: 'Engine Torque (ft-lbs)', defaultValue: 350, type: 'number', step: 10, unit: 'ft-lbs' },
      { id: 'rpm', label: 'Engine Speed (RPM)', defaultValue: 5500, type: 'number', step: 250, unit: 'RPM' },
    ],
    calculate: (v) => {
      const t = Number(v.torqueFtLbs) || 0;
      const rpm = Number(v.rpm) || 0;
      const hp = (t * rpm) / 5252;
      const kw = hp * 0.7457;
      return {
        primaryValue: Math.round(hp),
        primaryUnit: 'HP',
        primaryLabel: 'Engine Brake Horsepower',
        secondaryOutputs: [
          { label: 'Kilowatt (kW) Power', value: `${Math.round(kw)} kW` },
          { label: 'Cross-over Constant Fact', value: 'HP and Torque are always equal at 5,252 RPM' },
        ],
        steps: [`HP = (${t} ft-lbs × ${rpm} RPM) / 5252 = ${Math.round(hp)} HP`],
        formulaUsed: 'HP = (Torque · RPM) / 5252',
      };
    },
  },
  {
    slug: 'engine-displacement-calculator',
    title: 'Engine Displacement (CC / Liters) Calculator',
    category: 'automotive',
    formulaDisplay: 'Displacement = (π / 4) × Bore² × Stroke × Cylinders',
    inputs: [
      { id: 'boreMm', label: 'Cylinder Bore (mm)', defaultValue: 82.5, type: 'number', step: 0.5, unit: 'mm' },
      { id: 'strokeMm', label: 'Piston Stroke (mm)', defaultValue: 92.8, type: 'number', step: 0.5, unit: 'mm' },
      { id: 'cylinders', label: 'Number of Cylinders', defaultValue: 4, type: 'number', min: 1, step: 1 },
    ],
    calculate: (v) => {
      const b = (Number(v.boreMm) || 80) / 10; // cm
      const s = (Number(v.strokeMm) || 90) / 10; // cm
      const cyl = Number(v.cylinders) || 4;
      const singleCc = (Math.PI / 4) * b * b * s;
      const totalCc = singleCc * cyl;
      const liters = totalCc / 1000;
      const cubicInches = totalCc / 16.387;
      return {
        primaryValue: parseFloat(liters.toFixed(2)),
        primaryUnit: 'Liters (L)',
        primaryLabel: 'Engine Displacement',
        secondaryOutputs: [
          { label: 'Cubic Centimeters (cc)', value: `${Math.round(totalCc)} cc` },
          { label: 'Cubic Inches (CID)', value: `${cubicInches.toFixed(1)} ci` },
        ],
        steps: [`Single cylinder: ${singleCc.toFixed(1)} cc × ${cyl} = ${Math.round(totalCc)} cc = ${liters.toFixed(2)}L`],
        formulaUsed: 'V = (π/4) · Bore² · Stroke · Cylinders',
      };
    },
  },
  {
    slug: 'quarter-mile-calculator',
    title: 'Quarter-Mile ET & Trap Speed Calculator',
    category: 'automotive',
    formulaDisplay: 'ET = 5.825 × (Weight / HP)^(1/3)',
    inputs: [
      { id: 'weightLbs', label: 'Vehicle Curb Weight + Driver (lbs)', defaultValue: 3400, type: 'number', step: 50, unit: 'lbs' },
      { id: 'hp', label: 'Flywheel Horsepower (HP)', defaultValue: 400, type: 'number', min: 50, step: 10, unit: 'HP' },
    ],
    calculate: (v) => {
      const w = Number(v.weightLbs) || 3000;
      const hp = Number(v.hp) || 300;
      const ratio = w / hp;
      const et = 5.825 * Math.cbrt(ratio);
      const trapSpeed = 234 * Math.cbrt(hp / w);
      return {
        primaryValue: parseFloat(et.toFixed(2)),
        primaryUnit: 'seconds',
        primaryLabel: 'Quarter-Mile Elapsed Time (ET)',
        secondaryOutputs: [
          { label: 'Quarter-Mile Trap Speed', value: `${trapSpeed.toFixed(1)} mph` },
          { label: 'Power-to-Weight Ratio', value: `${ratio.toFixed(2)} lbs / HP` },
        ],
        steps: [`ET = 5.825 × (${w} / ${hp})^(1/3) = ${et.toFixed(2)} s`],
        formulaUsed: 'Roger Huntington Drag Racing Quarter-Mile Equations',
      };
    },
  },
  {
    slug: 'oil-change-calculator',
    title: 'Engine Oil Change Interval & Days Calculator',
    category: 'automotive',
    formulaDisplay: 'Days to Next Oil Change = Remaining Miles / (Annual Miles / 365)',
    inputs: [
      { id: 'currentMiles', label: 'Current Odometer (Miles)', defaultValue: 62500, type: 'number', step: 500, unit: 'miles' },
      { id: 'lastOilMiles', label: 'Odometer at Last Oil Change', defaultValue: 58000, type: 'number', step: 500, unit: 'miles' },
      { id: 'intervalMiles', label: 'Recommended Oil Change Interval', defaultValue: 7500, type: 'number', step: 500, unit: 'miles' },
      { id: 'annualMiles', label: 'Your Annual Driving Miles', defaultValue: 12000, type: 'number', step: 1000, unit: 'miles' },
    ],
    calculate: (v) => {
      const cur = Number(v.currentMiles) || 0;
      const last = Number(v.lastOilMiles) || 0;
      const interval = Number(v.intervalMiles) || 5000;
      const annual = Number(v.annualMiles) || 12000;
      const driven = Math.max(0, cur - last);
      const remaining = Math.max(0, interval - driven);
      const dailyMiles = annual / 365;
      const daysRemaining = dailyMiles > 0 ? Math.round(remaining / dailyMiles) : 0;
      return {
        primaryValue: remaining,
        primaryUnit: 'miles',
        primaryLabel: 'Miles Remaining Until Oil Change',
        secondaryOutputs: [
          { label: 'Estimated Days Remaining', value: `~${daysRemaining} days` },
          { label: 'Miles Driven on Current Oil', value: `${driven} miles` },
        ],
        steps: [`Remaining = ${interval} - (${cur} - ${last}) = ${remaining} miles`],
        formulaUsed: 'Remaining = Interval - Elapsed Mileage',
      };
    },
  },
  {
    slug: 'stopping-distance-calculator',
    title: 'Vehicle Stopping Distance & Reaction Calculator',
    category: 'automotive',
    formulaDisplay: 'Total Distance = Reaction Distance + Braking Distance',
    inputs: [
      { id: 'speedMph', label: 'Vehicle Speed (MPH)', defaultValue: 60, type: 'number', min: 5, step: 5, unit: 'MPH' },
      { id: 'reactionSec', label: 'Driver Reaction Time (Seconds)', defaultValue: 1.5, type: 'number', step: 0.1, unit: 's' },
      { id: 'frictionCoeff', label: 'Road Friction Coefficient (Dry Asphalt ≈ 0.75, Wet ≈ 0.40)', defaultValue: 0.75, type: 'number', step: 0.05 },
    ],
    calculate: (v) => {
      const mph = Number(v.speedMph) || 60;
      const vFps = mph * 1.46667; // feet per second
      const reactionT = Number(v.reactionSec) || 1.5;
      const mu = Number(v.frictionCoeff) || 0.75;
      const gFps2 = 32.174; // gravity in ft/s2
      const reactionDist = vFps * reactionT;
      const brakingDist = (vFps * vFps) / (2 * mu * gFps2);
      const totalDist = reactionDist + brakingDist;
      return {
        primaryValue: Math.round(totalDist),
        primaryUnit: 'feet',
        primaryLabel: 'Total Stopping Distance',
        secondaryOutputs: [
          { label: 'Perception-Reaction Distance', value: `${Math.round(reactionDist)} ft` },
          { label: 'Physical Braking Distance', value: `${Math.round(brakingDist)} ft` },
          { label: 'Car Lengths (~15 ft each)', value: `~${Math.round(totalDist / 15)} car lengths` },
        ],
        steps: [`Reaction: ${vFps.toFixed(1)} ft/s × ${reactionT}s = ${Math.round(reactionDist)} ft`, `Braking: ${vFps.toFixed(1)}² / (2 × ${mu} × 32.2) = ${Math.round(brakingDist)} ft`],
        formulaUsed: 'd_total = v·t_r + v²/(2μg)',
      };
    },
  },
  {
    slug: 'car-depreciation-calculator',
    title: 'Car Depreciation Value Curve Calculator',
    category: 'automotive',
    formulaDisplay: 'Value(t) = Purchase Price × (1 - r)^t',
    inputs: [
      { id: 'price', label: 'New Vehicle MSRP ($)', defaultValue: 38000, type: 'number', step: 1000, unit: '$' },
      { id: 'years', label: 'Age of Vehicle (Years)', defaultValue: 5, type: 'number', min: 1, max: 15, step: 1, unit: 'years' },
    ],
    calculate: (v) => {
      const p = Number(v.price) || 30000;
      const t = Number(v.years) || 5;
      // Typical depreciation schedule: 20% year 1, 15% thereafter
      let val = p * 0.80; // year 1
      for (let i = 2; i <= t; i++) {
        val *= 0.85;
      }
      const lost = p - val;
      return {
        primaryValue: parseFloat(val.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: 'Estimated Residual Resale Value',
        secondaryOutputs: [
          { label: 'Total Value Lost to Depreciation', value: `-$${lost.toFixed(2)}` },
          { label: 'Retained Value %', value: `${((val / p) * 100).toFixed(1)}%` },
        ],
        steps: [`Standard automotive industry depreciation curve factored over ${t} years.`],
        formulaUsed: 'Automotive Exponential Decay Schedule',
      };
    },
  },
  {
    slug: 'car-trade-in-calculator',
    title: 'Car Trade-In Net Equity Calculator',
    category: 'automotive',
    formulaDisplay: 'Net Equity = Trade-in Offer - Remaining Auto Loan Balance',
    inputs: [
      { id: 'dealerOffer', label: 'Dealer Trade-In Appraisal Offer ($)', defaultValue: 18500, type: 'number', step: 500, unit: '$' },
      { id: 'loanPayoff', label: 'Remaining Auto Loan Payoff Balance ($)', defaultValue: 14200, type: 'number', step: 500, unit: '$' },
      { id: 'salesTaxRate', label: 'State Sales Tax Rate (Trade-In Tax Credit %) (%)', defaultValue: 7.0, type: 'number', step: 0.5, unit: '%' },
    ],
    calculate: (v) => {
      const offer = Number(v.dealerOffer) || 0;
      const loan = Number(v.loanPayoff) || 0;
      const taxRate = (Number(v.salesTaxRate) || 0) / 100;
      const equity = offer - loan;
      const taxCreditSavings = offer * taxRate;
      return {
        primaryValue: parseFloat(equity.toFixed(2)),
        primaryUnit: '$',
        primaryLabel: equity >= 0 ? 'Positive Trade-In Equity' : 'Negative Equity (Underwater)',
        secondaryOutputs: [
          { label: 'Sales Tax Credit Saved on Next Car', value: `+$${taxCreditSavings.toFixed(2)}` },
          { label: 'Effective Trade Value Benefit', value: `$${(offer + taxCreditSavings).toFixed(2)}` },
        ],
        steps: [`Equity = $${offer} offer - $${loan} loan = $${equity.toFixed(2)}`],
        formulaUsed: 'Equity = Trade Valuation - Loan Payoff',
      };
    },
  },
  {
    slug: 'towing-capacity-calculator',
    title: 'Vehicle Towing Capacity & Payload Safety Calculator',
    category: 'automotive',
    formulaDisplay: 'Safe Towing = Vehicle Tow Capacity - (Cargo + Passengers)',
    inputs: [
      { id: 'towRating', label: 'Max Manufacturer Tow Rating (lbs)', defaultValue: 7500, type: 'number', step: 500, unit: 'lbs' },
      { id: 'trailerWeight', label: 'Gross Trailer Weight Loaded (GTW in lbs)', defaultValue: 5200, type: 'number', step: 250, unit: 'lbs' },
    ],
    calculate: (v) => {
      const maxTow = Number(v.towRating) || 5000;
      const trailer = Number(v.trailerWeight) || 0;
      const tongueWeight = trailer * 0.12; // 10-15% tongue weight recommended
      const safeTowLimit = maxTow * 0.85; // 85% rule of thumb
      const margin = maxTow - trailer;
      return {
        primaryValue: margin >= 0 ? `+${margin} lbs safe margin` : `${margin} lbs EXCEEDED`,
        primaryLabel: 'Towing Capacity Margin',
        secondaryOutputs: [
          { label: 'Recommended Tongue Weight (12%)', value: `${Math.round(tongueWeight)} lbs` },
          { label: '85% Safe Towing Comfort Ceiling', value: `${Math.round(safeTowLimit)} lbs` },
          { label: 'Status', value: trailer <= safeTowLimit ? 'Safe Towing Buffer' : (trailer <= maxTow ? 'Close to Limit' : 'OVERLOAD RISK') },
        ],
        steps: [`Margin = ${maxTow} lbs max - ${trailer} lbs trailer = ${margin} lbs`],
        formulaUsed: 'SAE J2807 Towing Standard Guidelines',
      };
    },
  },
  {
    slug: 'differential-gear-calculator',
    title: 'Differential Ring & Pinion Gear Ratio Calculator',
    category: 'automotive',
    formulaDisplay: 'Axle Ratio = Ring Gear Teeth / Pinion Gear Teeth',
    inputs: [
      { id: 'ringTeeth', label: 'Ring Gear Teeth Count', defaultValue: 41, type: 'number', min: 10, step: 1 },
      { id: 'pinionTeeth', label: 'Pinion Gear Teeth Count', defaultValue: 10, type: 'number', min: 5, step: 1 },
    ],
    calculate: (v) => {
      const ring = Number(v.ringTeeth) || 41;
      const pin = Number(v.pinionTeeth) || 10;
      const ratio = ring / pin;
      return {
        primaryValue: parseFloat(ratio.toFixed(2)),
        primaryUnit: ': 1',
        primaryLabel: 'Differential Final Drive Ratio',
        secondaryOutputs: [
          { label: 'Gearing Profile', value: ratio > 3.73 ? 'Short Gearing (High Acceleration / Towing)' : 'Tall Gearing (Highway Fuel Economy)' },
        ],
        steps: [`Ratio = ${ring} ring teeth / ${pin} pinion teeth = ${ratio.toFixed(2)}:1`],
        formulaUsed: 'Ratio = Ring Teeth / Pinion Teeth',
      };
    },
  },

  // ENERGY & SOLAR (15)
  {
    slug: 'solar-panel-calculator',
    title: 'Solar Panel System Size & Production Calculator',
    category: 'energy-solar',
    formulaDisplay: 'System Size (kW) = Annual kWh / (Sun Hours × 365 × Efficiency Factor)',
    inputs: [
      { id: 'monthlyKwh', label: 'Average Monthly Electric Usage (kWh)', defaultValue: 950, type: 'number', step: 50, unit: 'kWh' },
      { id: 'sunHours', label: 'Daily Peak Sun Hours', defaultValue: 4.5, type: 'number', step: 0.5, unit: 'hrs/day' },
      { id: 'costPerKwh', label: 'Utility Electricity Cost ($ / kWh)', defaultValue: 0.18, type: 'number', step: 0.01, unit: '$/kWh' },
    ],
    calculate: (v) => {
      const monthlyKwh = Number(v.monthlyKwh) || 900;
      const sun = Number(v.sunHours) || 4.5;
      const rate = Number(v.costPerKwh) || 0.16;
      const annualKwh = monthlyKwh * 12;
      const systemKw = annualKwh / (sun * 365 * 0.80); // 80% derate factor
      const panelsCount = Math.ceil((systemKw * 1000) / 400); // 400W modern panels
      const annualSavings = annualKwh * rate;
      return {
        primaryValue: parseFloat(systemKw.toFixed(2)),
        primaryUnit: 'kW DC',
        primaryLabel: 'Recommended Solar System Size',
        secondaryOutputs: [
          { label: '400W Solar Panels Needed', value: `${panelsCount} panels` },
          { label: 'Estimated Annual Utility Savings', value: `$${annualSavings.toFixed(2)}` },
          { label: 'Roof Area Required (~21 sq ft/panel)', value: `~${panelsCount * 21} sq ft` },
        ],
        steps: [`Annual ${annualKwh} kWh / (${sun} hrs × 365 × 0.8) = ${systemKw.toFixed(2)} kW`],
        formulaUsed: 'PVWatts Photovoltaic Sizing Model',
      };
    },
  },
  {
    slug: 'electricity-cost-calculator',
    title: 'Electricity Bill & kWh Appliance Cost Calculator',
    category: 'energy-solar',
    formulaDisplay: 'Monthly Cost = (Watts × Hours / 1000) × Rate × Billing Days',
    inputs: [
      { id: 'watts', label: 'Appliance Power Rating (Watts)', defaultValue: 1000, type: 'number', step: 50, unit: 'W' },
      { id: 'hoursPerDay', label: 'Hours Used per Day', defaultValue: 5, type: 'number', step: 0.5, unit: 'hrs' },
      { id: 'rateKwh', label: 'Utility Rate ($ / kWh)', defaultValue: 0.15, type: 'number', step: 0.01, unit: '$/kWh' },
      { id: 'daysInMonth', label: 'Billing Cycle (Days per Month)', defaultValue: 30, type: 'number', step: 1, min: 1, max: 31, unit: 'days' },
    ],
    calculate: (v) => {
      const w = Number(v.watts) || 0;
      const h = Number(v.hoursPerDay) || 0;
      const rate = Number(v.rateKwh) || 0.15;
      const days = Number(v.daysInMonth) || 30;
      const dailyKwh = (w * h) / 1000;
      const monthlyKwh = dailyKwh * days;
      const monthlyCost = monthlyKwh * rate;
      const annualKwh = dailyKwh * 365;
      const annualCost = annualKwh * rate;
      const avgCalendarMonthCost = annualCost / 12;
      return {
        primaryValue: parseFloat(monthlyCost.toFixed(2)),
        primaryUnit: '$ / month',
        primaryLabel: `Electricity Cost (${days}-Day Billing Cycle)`,
        secondaryOutputs: [
          { label: 'Energy Consumed in Billing Cycle', value: `${monthlyKwh.toFixed(1)} kWh` },
          { label: 'Average Calendar Month (30.42 days)', value: `$${avgCalendarMonthCost.toFixed(2)}` },
          { label: 'Annual Electricity Cost (365 days)', value: `$${annualCost.toFixed(2)}` },
          { label: 'Daily Energy Consumption', value: `${dailyKwh.toFixed(2)} kWh / day` },
        ],
        steps: [
          `Daily Consumption = (${w} W × ${h} hrs) / 1000 = ${dailyKwh.toFixed(2)} kWh/day.`,
          `Billing Cycle Cost (${days} days) = ${dailyKwh.toFixed(2)} kWh × ${days} days × $${rate}/kWh = $${monthlyCost.toFixed(2)}.`,
          `Annual Benchmark (365 days) = ${dailyKwh.toFixed(2)} kWh × 365 days × $${rate}/kWh = $${annualCost.toFixed(2)} ($${avgCalendarMonthCost.toFixed(2)} / calendar month average).`,
        ],
        formulaUsed: 'Cost = (Power in kW × Daily Hours × Days) × Rate/kWh',
      };
    },
  },
  {
    slug: 'appliance-power-calculator',
    title: 'Home Appliance Power Consumption Calculator',
    category: 'energy-solar',
    formulaDisplay: 'Daily kWh = (Wattage × Hours) / 1000',
    inputs: [
      { id: 'watts', label: 'Appliance Rated Wattage (W)', defaultValue: 800, type: 'number', step: 50, unit: 'W' },
      { id: 'hours', label: 'Operating Hours per Day', defaultValue: 6, type: 'number', step: 1, unit: 'hrs' },
    ],
    calculate: (v) => {
      const w = Number(v.watts) || 0;
      const h = Number(v.hours) || 0;
      const dailyKwh = (w * h) / 1000;
      const annualKwh = dailyKwh * 365;
      return {
        primaryValue: parseFloat(dailyKwh.toFixed(2)),
        primaryUnit: 'kWh / day',
        primaryLabel: 'Daily Energy Consumption',
        secondaryOutputs: [
          { label: 'Annual Energy Consumption', value: `${annualKwh.toFixed(1)} kWh / yr` },
        ],
        steps: [`(${w} W × ${h} hrs) / 1000 = ${dailyKwh.toFixed(2)} kWh`],
        formulaUsed: 'kWh = (Watts · Hours) / 1000',
      };
    },
  },
  {
    slug: 'solar-battery-calculator',
    title: 'Solar Battery Storage (kWh) Sizing Calculator',
    category: 'energy-solar',
    formulaDisplay: 'Battery Capacity = (Daily Critical Load × Days of Autonomy) / DoD',
    inputs: [
      { id: 'criticalKwh', label: 'Essential Daily Electric Load (kWh/day)', defaultValue: 15, type: 'number', step: 1, unit: 'kWh' },
      { id: 'autonomyDays', label: 'Backup Autonomy Days (Days without sun)', defaultValue: 1.5, type: 'number', step: 0.5, unit: 'days' },
      { id: 'dodPct', label: 'Usable Depth of Discharge (DoD %)', defaultValue: 90, type: 'number', step: 5, unit: '%' },
    ],
    calculate: (v) => {
      const kwh = Number(v.criticalKwh) || 10;
      const days = Number(v.autonomyDays) || 1;
      const dod = (Number(v.dodPct) || 90) / 100;
      const batteryKwh = (kwh * days) / dod;
      const teslaPowerwalls = Math.ceil(batteryKwh / 13.5); // 13.5 kWh each
      return {
        primaryValue: parseFloat(batteryKwh.toFixed(1)),
        primaryUnit: 'kWh',
        primaryLabel: 'Required Battery Energy Storage',
        secondaryOutputs: [
          { label: 'Equivalent Home Batteries (13.5 kWh each)', value: `${teslaPowerwalls} units` },
        ],
        steps: [`Storage = (${kwh} kWh × ${days} days) / ${dod} DoD = ${batteryKwh.toFixed(1)} kWh`],
        formulaUsed: 'Capacity = (Load × Autonomy) / DoD',
      };
    },
  },
  {
    slug: 'peak-sun-hours-calculator',
    title: 'Solar Insolation & Peak Sun Hours Calculator',
    category: 'energy-solar',
    formulaDisplay: 'Daily Solar Yield = System kW × Peak Sun Hours × Derate Factor (0.80)',
    inputs: [
      { id: 'systemKw', label: 'Solar Array Capacity (kW)', defaultValue: 8.0, type: 'number', step: 0.5, unit: 'kW' },
      { id: 'sunHours', label: 'Location Peak Sun Hours (Psh)', defaultValue: 4.8, type: 'number', step: 0.2, unit: 'Psh' },
    ],
    calculate: (v) => {
      const kw = Number(v.systemKw) || 5;
      const psh = Number(v.sunHours) || 4;
      const dailyYield = kw * psh * 0.80;
      const annualYield = dailyYield * 365;
      return {
        primaryValue: parseFloat(dailyYield.toFixed(1)),
        primaryUnit: 'kWh / day',
        primaryLabel: 'Expected Daily Generation',
        secondaryOutputs: [
          { label: 'Annual Electricity Output', value: `${Math.round(annualYield).toLocaleString()} kWh / yr` },
        ],
        steps: [`${kw} kW × ${psh} Psh × 0.80 derate = ${dailyYield.toFixed(1)} kWh/day`],
        formulaUsed: 'Yield = Capacity × Psh × 0.8',
      };
    },
  },
  {
    slug: 'carbon-footprint-calculator',
    title: 'Household Carbon Footprint (CO₂e) Calculator',
    category: 'energy-solar',
    formulaDisplay: 'Annual Metric Tons CO₂e = Electricity + Natural Gas + Driving',
    inputs: [
      { id: 'kwhMonthly', label: 'Monthly Electricity Usage (kWh)', defaultValue: 900, type: 'number', step: 50, unit: 'kWh' },
      { id: 'milesAnnual', label: 'Annual Vehicle Miles Driven', defaultValue: 13000, type: 'number', step: 1000, unit: 'miles' },
      { id: 'gasMpg', label: 'Vehicle Average MPG', defaultValue: 26, type: 'number', step: 1, unit: 'MPG' },
    ],
    calculate: (v) => {
      const kwh = Number(v.kwhMonthly) || 0;
      const miles = Number(v.milesAnnual) || 0;
      const mpg = Number(v.gasMpg) || 25;
      const electricCo2Tons = (kwh * 12 * 0.85) / 2204.62; // ~0.85 lbs CO2/kWh
      const drivingCo2Tons = ((miles / mpg) * 19.6) / 2204.62; // ~19.6 lbs CO2/gallon
      const totalCo2Tons = electricCo2Tons + drivingCo2Tons;
      return {
        primaryValue: parseFloat(totalCo2Tons.toFixed(2)),
        primaryUnit: 'Metric Tons CO₂e / yr',
        primaryLabel: 'Annual Household Carbon Footprint',
        secondaryOutputs: [
          { label: 'Electricity Emissions', value: `${electricCo2Tons.toFixed(2)} tons` },
          { label: 'Vehicle Transportation Emissions', value: `${drivingCo2Tons.toFixed(2)} tons` },
        ],
        steps: [`Electricity: ${electricCo2Tons.toFixed(2)} t + Driving: ${drivingCo2Tons.toFixed(2)} t = ${totalCo2Tons.toFixed(2)} tons CO₂e`],
        formulaUsed: 'EPA Greenhouse Gas Equivalencies',
      };
    },
  },
  {
    slug: 'heat-pump-savings-calculator',
    title: 'Heat Pump vs Gas Furnace Savings Calculator',
    category: 'energy-solar',
    formulaDisplay: 'COP Efficiency Delta Comparison',
    inputs: [
      { id: 'annualHeatingBtu', label: 'Annual Heating Load (Million BTUs)', defaultValue: 65, type: 'number', step: 5, unit: 'MMBtu' },
      { id: 'electricKwhRate', label: 'Electricity Rate ($/kWh)', defaultValue: 0.16, type: 'number', step: 0.01, unit: '$/kWh' },
      { id: 'gasThermRate', label: 'Natural Gas Rate ($/Therm)', defaultValue: 1.45, type: 'number', step: 0.05, unit: '$/therm' },
    ],
    calculate: (v) => {
      const mmbtu = Number(v.annualHeatingBtu) || 50;
      const eRate = Number(v.electricKwhRate) || 0.15;
      const gRate = Number(v.gasThermRate) || 1.30;
      const heatPumpKwh = (mmbtu * 1e6) / (3412 * 3.0); // COP = 3.0
      const heatPumpCost = heatPumpKwh * eRate;
      const gasTherms = (mmbtu * 1e6) / (100000 * 0.85); // 85% furnace
      const gasCost = gasTherms * gRate;
      const delta = gasCost - heatPumpCost;
      return {
        primaryValue: parseFloat(Math.abs(delta).toFixed(2)),
        primaryUnit: '$ / year',
        primaryLabel: delta >= 0 ? 'Annual Heat Pump Savings' : 'Gas Furnace Cheaper by',
        secondaryOutputs: [
          { label: 'Heat Pump Annual Cost (COP 3.0)', value: `$${heatPumpCost.toFixed(2)}` },
          { label: 'Gas Furnace Annual Cost (85% AFUE)', value: `$${gasCost.toFixed(2)}` },
        ],
        steps: [`Heat Pump: $${heatPumpCost.toFixed(0)} vs Gas: $${gasCost.toFixed(0)}`],
        formulaUsed: 'COP Heat Pump Energy Balance Model',
      };
    },
  },
  {
    slug: 'led-savings-calculator',
    title: 'LED Lighting Upgrade Energy Savings Calculator',
    category: 'energy-solar',
    formulaDisplay: 'Savings = Bulbs × (Old Watts - LED Watts) / 1000 × Hours × Rate',
    inputs: [
      { id: 'bulbs', label: 'Number of Bulbs Replaced', defaultValue: 30, type: 'number', step: 5 },
      { id: 'oldWatts', label: 'Incandescent Bulb Wattage (W)', defaultValue: 60, type: 'number', step: 10, unit: 'W' },
      { id: 'ledWatts', label: 'LED Equivalent Wattage (W)', defaultValue: 9, type: 'number', step: 1, unit: 'W' },
      { id: 'hoursPerDay', label: 'Daily Burning Hours', defaultValue: 4, type: 'number', step: 0.5, unit: 'hrs' },
      { id: 'rate', label: 'Electricity Rate ($/kWh)', defaultValue: 0.16, type: 'number', step: 0.01, unit: '$/kWh' },
    ],
    calculate: (v) => {
      const n = Number(v.bulbs) || 10;
      const oldW = Number(v.oldWatts) || 60;
      const ledW = Number(v.ledWatts) || 9;
      const hrs = Number(v.hoursPerDay) || 4;
      const rate = Number(v.rate) || 0.15;
      const savedWattsPerBulb = oldW - ledW;
      const annualKwhSaved = (n * savedWattsPerBulb * hrs * 365) / 1000;
      const annualDollarSavings = annualKwhSaved * rate;
      return {
        primaryValue: parseFloat(annualDollarSavings.toFixed(2)),
        primaryUnit: '$ / year',
        primaryLabel: 'Annual Electricity Bill Savings',
        secondaryOutputs: [
          { label: 'Annual Energy Conserved', value: `${Math.round(annualKwhSaved)} kWh / yr` },
          { label: 'Energy Reduction', value: `${(((oldW - ledW) / oldW) * 100).toFixed(0)}% less power` },
        ],
        steps: [`Saved ${n} × ${savedWattsPerBulb}W × ${hrs}h × 365 = ${annualKwhSaved.toFixed(0)} kWh = $${annualDollarSavings.toFixed(2)}`],
        formulaUsed: 'Savings = ΔkW · Hours · Rate',
      };
    },
  },
  {
    slug: 'ev-charging-calculator',
    title: 'Electric Vehicle (EV) Charging Time & Cost Calculator',
    category: 'energy-solar',
    formulaDisplay: 'Hours = Battery kWh / Charger kW, Cost = Battery kWh × Rate',
    inputs: [
      { id: 'batteryKwh', label: 'Battery Usable Capacity (kWh)', defaultValue: 75, type: 'number', step: 5, unit: 'kWh' },
      { id: 'currentPct', label: 'Current Battery Level (%)', defaultValue: 20, type: 'number', step: 5, unit: '%' },
      { id: 'targetPct', label: 'Target Battery Level (%)', defaultValue: 80, type: 'number', step: 5, unit: '%' },
      { id: 'chargerKw', label: 'Charger Power Rating (e.g. 9.6 kW Level 2, 150 kW DC Fast)', defaultValue: 9.6, type: 'number', step: 1, unit: 'kW' },
      { id: 'kwhRate', label: 'Electricity Rate ($/kWh)', defaultValue: 0.16, type: 'number', step: 0.01, unit: '$/kWh' },
    ],
    calculate: (v) => {
      const cap = Number(v.batteryKwh) || 60;
      const cur = Number(v.currentPct) || 20;
      const tgt = Number(v.targetPct) || 80;
      const kw = Number(v.chargerKw) || 9.6;
      const rate = Number(v.kwhRate) || 0.15;
      const neededKwh = cap * ((tgt - cur) / 100);
      const hours = neededKwh / kw;
      const cost = neededKwh * rate;
      return {
        primaryValue: parseFloat(hours.toFixed(1)),
        primaryUnit: 'hours',
        primaryLabel: 'Estimated Charging Time',
        secondaryOutputs: [
          { label: 'Session Energy Added', value: `${neededKwh.toFixed(1)} kWh` },
          { label: 'Total Session Cost', value: `$${cost.toFixed(2)}` },
        ],
        steps: [`Added ${neededKwh.toFixed(1)} kWh at ${kw} kW = ${hours.toFixed(1)} hours`],
        formulaUsed: 'Time = Energy (kWh) / Power (kW)',
      };
    },
  },
  {
    slug: 'generator-sizing-calculator',
    title: 'Home Standby Generator Sizing Calculator',
    category: 'energy-solar',
    formulaDisplay: 'Generator Watts = Running Watts Sum + Peak Surge Watts',
    inputs: [
      { id: 'refrig', label: 'Refrigerator / Freezer (Watts)', defaultValue: 800, type: 'number', step: 50, unit: 'W' },
      { id: 'acUnit', label: 'HVAC / Central AC (Watts)', defaultValue: 3500, type: 'number', step: 250, unit: 'W' },
      { id: 'waterHeater', label: 'Water Pump / Well (Watts)', defaultValue: 1200, type: 'number', step: 100, unit: 'W' },
      { id: 'lightsEtc', label: 'Lighting, WiFi & Electronics (Watts)', defaultValue: 1000, type: 'number', step: 100, unit: 'W' },
    ],
    calculate: (v) => {
      const w1 = Number(v.refrig) || 0;
      const w2 = Number(v.acUnit) || 0;
      const w3 = Number(v.waterHeater) || 0;
      const w4 = Number(v.lightsEtc) || 0;
      const totalRunning = w1 + w2 + w3 + w4;
      const surgeAllowance = Math.max(w1, w2, w3) * 1.5; // largest motor starting surge
      const recommendedKw = ((totalRunning + surgeAllowance) * 1.2) / 1000; // 20% safety margin
      return {
        primaryValue: parseFloat(recommendedKw.toFixed(1)),
        primaryUnit: 'kW Generator',
        primaryLabel: 'Recommended Generator Size',
        secondaryOutputs: [
          { label: 'Total Continuous Running Watts', value: `${totalRunning} W` },
          { label: 'Starting Surge Headroom', value: `${Math.round(surgeAllowance)} W` },
        ],
        steps: [`Running ${totalRunning}W + Surge ${Math.round(surgeAllowance)}W + 20% buffer = ${recommendedKw.toFixed(1)} kW`],
        formulaUsed: 'Generator Capacity Sizing Model',
      };
    },
  },
  {
    slug: 'wind-turbine-calculator',
    title: 'Small Wind Turbine Energy Output Calculator',
    category: 'energy-solar',
    formulaDisplay: 'P = 0.5 × ρ × A × v³ × Cp (Betz Limit Cp ≈ 0.35)',
    inputs: [
      { id: 'rotorDiaM', label: 'Rotor Diameter (meters)', defaultValue: 3.0, type: 'number', min: 0.5, step: 0.5, unit: 'm' },
      { id: 'windSpeedMs', label: 'Average Wind Speed (m/s)', defaultValue: 6.0, type: 'number', min: 1, step: 0.5, unit: 'm/s' },
    ],
    calculate: (v) => {
      const d = Number(v.rotorDiaM) || 3;
      const vWind = Number(v.windSpeedMs) || 5;
      const area = Math.PI * Math.pow(d / 2, 2);
      const rho = 1.225; // air density
      const cp = 0.35; // typical small turbine efficiency
      const powerWatts = 0.5 * rho * area * Math.pow(vWind, 3) * cp;
      const annualKwh = (powerWatts * 8760) / 1000;
      return {
        primaryValue: Math.round(powerWatts),
        primaryUnit: 'Watts',
        primaryLabel: 'Power Output at Rated Wind',
        secondaryOutputs: [
          { label: 'Annual Electricity Produced', value: `${Math.round(annualKwh).toLocaleString()} kWh / yr` },
          { label: 'Rotor Swept Area', value: `${area.toFixed(2)} m²` },
        ],
        steps: [`P = 0.5 × 1.225 × ${area.toFixed(1)} m² × ${vWind}³ × 0.35 = ${Math.round(powerWatts)} W`],
        formulaUsed: 'Wind Power Aerodynamic Equation',
      };
    },
  },
  {
    slug: 'home-energy-calculator',
    title: 'Whole Home Energy Audit Calculator',
    category: 'energy-solar',
    formulaDisplay: 'Total Annual Energy = Electric kWh + Fuel MMBtu',
    inputs: [
      { id: 'sqFt', label: 'Home Heated Area (sq ft)', defaultValue: 2200, type: 'number', step: 100, unit: 'sq ft' },
      { id: 'annualKwh', label: 'Annual Electric Consumption (kWh)', defaultValue: 11000, type: 'number', step: 500, unit: 'kWh' },
    ],
    calculate: (v) => {
      const sqFt = Number(v.sqFt) || 2000;
      const kwh = Number(v.annualKwh) || 10000;
      const eui = (kwh * 3.412) / sqFt; // kBTU / sq ft EUI
      return {
        primaryValue: parseFloat(eui.toFixed(1)),
        primaryUnit: 'kBTU / sq ft / yr',
        primaryLabel: 'Energy Use Intensity (EUI)',
        secondaryOutputs: [
          { label: 'Benchmarking Status', value: eui < 35 ? 'Highly Energy-Efficient' : 'Average Residential EUI' },
        ],
        steps: [`EUI = (${kwh} kWh × 3.412) / ${sqFt} sq ft = ${eui.toFixed(1)} kBTU/sq ft`],
        formulaUsed: 'Energy Star EUI Intensity Model',
      };
    },
  },
  {
    slug: 'heating-cost-comparison-calculator',
    title: 'Home Heating Fuel Cost Comparison',
    category: 'energy-solar',
    formulaDisplay: 'Cost per 1 Million BTU Useful Heat',
    inputs: [
      { id: 'gasPrice', label: 'Natural Gas ($ / Therm)', defaultValue: 1.35, type: 'number', step: 0.05, unit: '$/therm' },
      { id: 'electricPrice', label: 'Electricity ($ / kWh)', defaultValue: 0.16, type: 'number', step: 0.01, unit: '$/kWh' },
      { id: 'oilPrice', label: 'Heating Oil ($ / Gallon)', defaultValue: 3.80, type: 'number', step: 0.10, unit: '$/gal' },
    ],
    calculate: (v) => {
      const g = Number(v.gasPrice) || 1.3;
      const e = Number(v.electricPrice) || 0.15;
      const o = Number(v.oilPrice) || 3.5;
      const gasPerMmbtu = (g / 100000) * 1e6 / 0.85; // 85% eff
      const electricPerMmbtu = (e / 3412) * 1e6; // baseboard 100%
      const heatPumpPerMmbtu = electricPerMmbtu / 3.0; // COP 3.0
      const oilPerMmbtu = (o / 138500) * 1e6 / 0.82; // 82% eff
      return {
        primaryValue: parseFloat(gasPerMmbtu.toFixed(2)),
        primaryUnit: '$ / MMBtu (Gas)',
        primaryLabel: 'Natural Gas Cost per MMBtu',
        secondaryOutputs: [
          { label: 'Heat Pump (COP 3.0)', value: `$${heatPumpPerMmbtu.toFixed(2)} / MMBtu` },
          { label: 'Electric Resistance Heat', value: `$${electricPerMmbtu.toFixed(2)} / MMBtu` },
          { label: 'Heating Oil Cost', value: `$${oilPerMmbtu.toFixed(2)} / MMBtu` },
        ],
        steps: [`Ranked heating energy cost per useful million BTUs.`],
        formulaUsed: 'DOE Equivalent Delivered Heat Cost Model',
      };
    },
  },
  {
    slug: 'vampire-power-calculator',
    title: 'Vampire / Standby Phantom Load Calculator',
    category: 'energy-solar',
    formulaDisplay: 'Annual Phantom Cost = (Standby Watts × 8760 / 1000) × Electricity Rate',
    inputs: [
      { id: 'standbyWatts', label: 'Total Idle Standby Watts in Home (TVs, chargers, microwaves)', defaultValue: 65, type: 'number', step: 5, unit: 'W' },
      { id: 'rate', label: 'Electricity Rate ($/kWh)', defaultValue: 0.16, type: 'number', step: 0.01, unit: '$/kWh' },
    ],
    calculate: (v) => {
      const w = Number(v.standbyWatts) || 50;
      const r = Number(v.rate) || 0.15;
      const kwh = (w * 8760) / 1000;
      const cost = kwh * r;
      return {
        primaryValue: parseFloat(cost.toFixed(2)),
        primaryUnit: '$ / year',
        primaryLabel: 'Annual Phantom Load Cost',
        secondaryOutputs: [
          { label: 'Energy Wasted Annually', value: `${Math.round(kwh)} kWh` },
        ],
        steps: [`${w}W × 8,760 hours/yr = ${kwh.toFixed(1)} kWh × $${r} = $${cost.toFixed(2)}`],
        formulaUsed: 'Phantom Load = W_idle · 8760 · Rate',
      };
    },
  },
  {
    slug: 'pool-heating-calculator',
    title: 'Swimming Pool Heating Energy & Cost Calculator',
    category: 'energy-solar',
    formulaDisplay: 'BTU = Gallons × 8.33 × Temp Rise (°F)',
    inputs: [
      { id: 'gallons', label: 'Pool Volume (Gallons)', defaultValue: 18000, type: 'number', step: 1000, unit: 'gal' },
      { id: 'tempRise', label: 'Desired Temperature Rise (°F)', defaultValue: 10, type: 'number', step: 1, unit: '°F' },
    ],
    calculate: (v) => {
      const gal = Number(v.gallons) || 15000;
      const dt = Number(v.tempRise) || 10;
      const btu = gal * 8.33 * dt;
      const gasTherms = btu / 100000 / 0.82;
      const cost = gasTherms * 1.35;
      return {
        primaryValue: Math.round(btu),
        primaryUnit: 'BTUs',
        primaryLabel: 'Thermal Energy Required',
        secondaryOutputs: [
          { label: 'Estimated Natural Gas Cost', value: `$${cost.toFixed(2)}` },
          { label: 'Natural Gas Therms', value: `${gasTherms.toFixed(1)} therms` },
        ],
        steps: [`${gal} gal × 8.33 lbs/gal × ${dt}°F = ${Math.round(btu)} BTUs`],
        formulaUsed: 'BTU = Gallons · 8.33 · ΔT',
      };
    },
  },
];
