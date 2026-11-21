import { EditorialSection } from '../calculatorEditorial.ts';

export const batch3EngineeringStatsEditorial: Record<string, EditorialSection> = {
  'btu-hvac-calculator': {
    overview:
      'The HVAC Cooling Load & BTU Size Calculator estimates residential and commercial air-conditioning capacity in BTU/hr, Cooling Tons (12,000 BTU/hr per ton), Thermal Kilowatts (kW), and SEER2 peak electrical draw using conditioned area, ceiling height, climate zone, insulation grade, occupancy, and kitchen load.',
    detailedExplanation:
      'Oversizing an air conditioner is just as problematic as undersizing it: an oversized unit short-cycles off before removing indoor latent humidity, leaving rooms cold and clammy while accelerating compressor wear. Starting from the ENERGY STAR / ASHRAE residential baseline (20 BTU per sq ft at an 8-foot ceiling), this calculator scales linearly for higher ceilings, applies regional solar/humidity climate and envelope insulation multipliers, and adds internal heat gains from extra occupants and kitchen appliances.',
    formulaDisplay: {
      formula: 'BTU/hr = (Area_ft² × 20 × (Ceil_ft ÷ 8) × Climate × Insulation) + 600·max(0, Occ−2) + Kitchen',
      variableDefinitions: [
        { symbol: 'Area_ft²', name: 'Conditioned Floor Area', description: 'Square feet (or m² × 10.76391) of cooled space', unit: 'ft²' },
        { symbol: 'Climate / Insul', name: 'Envelope Multipliers', description: '0.90–1.20 climate factor × 0.88–1.18 building tightness factor', unit: 'Multiplier' },
        { symbol: 'Tons', name: 'Nominal AC Tonnage', description: '1 Cooling Ton = 12,000 BTU/hr (~3.517 kW thermal)', unit: 'Tons' },
      ],
    },
    workedExample: {
      scenario: 'A 1,800 sq ft warm-humid home with 9-foot ceilings, standard insulation, 3 regular occupants, full kitchen, and a SEER2 16 condenser.',
      inputs: [
        { name: 'Floor Area / Ceiling Height', value: '1,800 ft² / 9 ft' },
        { name: 'Climate / Insulation', value: 'Warm Humid (1.05×) / Standard (1.0×)' },
        { name: 'Occupants / Kitchen / SEER2', value: '3 people (+600 BTU) / Yes (+4,000 BTU) / 16' },
      ],
      steps: [
        'Base Envelope Load: 1,800 × 20 × (9 ÷ 8) × 1.05 × 1.0 = 42,525 BTU/hr.',
        'Add Internal Gains: Occupant (1 × 600 = 600 BTU/hr) + Kitchen (+4,000 BTU/hr) = 47,125 BTU/hr total cooling load.',
        'Convert to Equipment Units: 47,125 ÷ 12,000 = 3.93 Tons → 4.0-Ton standard condenser (13.81 kW thermal; ~2.95 kW electrical draw at SEER2 16).',
      ],
      result: '47,125 BTU/hr Recommended Capacity (3.93 Tons · 4.0-Ton Standard Unit · 13.81 kW)',
      interpretation: 'At 3.93 calculated tons, stepping cleanly to a 4.0-Ton variable-speed condenser avoids short-cycling while covering peak afternoon kitchen and humidity loads.',
    },
    regulatoryAndStandards: {
      title: 'ACCA Manual J, DOE SEER2 (2023+) & ENERGY STAR Sizing Standards',
      description: 'Connects preliminary BTU estimation with formal mechanical HVAC engineering:',
      points: [
        '1 Ton of Refrigeration = 12,000 BTU/hr (thermal energy required to melt 2,000 lb of ice over 24 hours).',
        'DOE SEER2 Standard: Modern US regional minimum efficiency standards use M1 external static pressure testing (13.4–14.3 SEER2+).',
        'Manual J Requirement: Prior to permitting or purchasing new central ductwork, contractors perform a room-by-room ACCA Manual J heat-gain survey accounting for window orientation and duct leakage.',
      ],
    },
    countryContext: {
      summary: 'Converts instantaneously between North American BTU/Tons and UK/CA/AU/NZ Kilowatt thermal capacity:',
      markets: [
        { region: 'United States & Canada', standard: 'Units sized in BTU/hr and 0.5-Ton increments (1.5T–5.0T) rated under SEER2.', unitsOrCurrency: 'BTU/hr & Tons', effectiveDate: '2026 DOE SEER2' },
        { region: 'UK / Australia / New Zealand', standard: 'Split-system heat pumps and ducted AC sized in thermal Kilowatts (kW, 1 kW ≈ 3,412 BTU/hr).', unitsOrCurrency: 'kW Thermal', effectiveDate: '2026 MEPS' },
      ],
    },
    references: [
      { name: 'Room Air Conditioner Sizing Guidelines', organization: 'US EPA / ENERGY STAR', url: 'https://www.energystar.gov/products/heating_cooling/air_conditioning_central', effectiveDate: '2026', note: 'Baseline 20 BTU/sq ft cooling load factors and occupancy/kitchen adjustments.' },
      { name: 'Central Air Conditioning Efficiency & SEER2 Standards', organization: 'U.S. Department of Energy (DOE)', url: 'https://www.energy.gov/energysaver/central-air-conditioning', effectiveDate: '2026', note: 'Residential sizing principles and modern SEER2 electrical efficiency ratios.' },
    ],
    commonMistakes: {
      title: 'Sizing by Outdated "400 Sq Ft Per Ton" Rules Ignoring Ceiling Height and Glazing',
      explanation: 'High 10–12 foot ceilings increase conditioned air volume by 25%–50%, while tight modern double-pane homes need significantly less capacity per sq ft than leaky 1970s envelopes.',
    },
    proTips: [
      'Estimate seasonal operating costs by taking peak running kW and multiplying in our Electricity Cost Calculator.',
      'For rooms near a half-ton boundary (e.g., 3.1 Tons), consider two-stage or inverter heat pumps that modulate down to 40% capacity on mild days.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Mechanical & Energy Engineering Desk',
      reviewDate: 'November 2026',
      accuracyStandard: 'Verified against ENERGY STAR BTU envelope factors and exact 12,000 BTU/Ton and 3,412.142 BTU/kW thermal conversions.',
    },
    eeat: {
      authorRole: 'Numeriq Building Systems & HVAC Editorial Team',
      reviewerRole: 'Numeriq Quantitative Validation Desk',
      methodology: 'Combines 20 BTU/ft² conditioned baseline with volumetric ceiling scaling, climate/envelope multipliers, internal gains, and SEER2 peak electrical power.',
      lastVerifiedDate: '2026-11-20',
      taxOrRegulationYear: '2026 DOE SEER2 / ASHRAE Conventions',
      limitations: [
        'Preliminary sizing rule of thumb; does not replace full ACCA Manual J window-azimuth and infiltration blower-door testing.',
        'Assumes typical 8–12 ft residential solar exposure without massive west-facing glass walls.',
      ],
      nonAdviceDisclaimer: 'Preliminary engineering estimator only; obtain a licensed HVAC contractor Manual J load calculation before finalizing equipment purchase.',
    },
    relatedCalculatorSlugs: ['electricity-cost-calculator', 'solar-panel-calculator', 'ev-charging-calculator', 'unit-converter'],
  },

  'wire-size-voltage-drop-calculator': {
    overview:
      'The Wire Size (AWG / mm²) & Voltage Drop Calculator calculates exact DC/AC circuit voltage drop in Volts and Percentage, load-end voltage, I²R conductor heat loss in Watts, and the minimum NEC Chapter 9 Table 8 wire gauge required to satisfy the 3% NEC 210.19 branch-circuit limit.',
    detailedExplanation:
      'Long electrical cable runs add resistance proportional to wire length and inversely proportional to conductor cross-sectional area (Circular Mils). Excessive voltage drop wastes energy as heat inside conduit, dims lighting, and causes motors or EV chargers to overheat and trip under-voltage protection. Using National Electrical Code (NEC) resistivity constants (K = 12.9 for Copper, 21.2 for Aluminum) and Chapter 9 Table 8 Circular Mils from 14 AWG through 4/0 AWG, this engine evaluates both Single-Phase (2×) and Three-Phase (√3×) circuits.',
    formulaDisplay: {
      formula: '1Φ Vd = (2 × K × I × L) ÷ CM   |   3Φ Vd = (√3 × K × I × L) ÷ CM   (K_Cu = 12.9, K_Al = 21.2)',
      variableDefinitions: [
        { symbol: 'K', name: 'Conductor Resistivity Constant', description: '12.9 Ω·CM/ft (Copper) or 21.2 Ω·CM/ft (Aluminum) at ~75°C', unit: 'Ω·CM/ft' },
        { symbol: 'I, L', name: 'Load Current & One-Way Length', description: 'Circuit load amperes and single-direction cable run feet', unit: 'A, ft' },
        { symbol: 'CM', name: 'Circular Mil Area', description: 'Cross-sectional area from NEC Chapter 9 Table 8 (14 AWG–4/0)', unit: 'CM' },
      ],
    },
    workedExample: {
      scenario: 'A 240V single-phase 32A continuous EV Level 2 charger fed 120 feet one-way from the main panel using 10 AWG copper conductors.',
      inputs: [
        { name: 'Conductor / Phase', value: 'Copper (K = 12.9) / Single-Phase (2×)' },
        { name: 'Voltage / Current / Length', value: '240 V / 32 A / 120 ft one-way' },
        { name: 'Wire Gauge Selected', value: '10 AWG (10,380 CM · 5.26 mm²)' },
      ],
      steps: [
        'Compute Voltage Drop: (2 × 12.9 × 32 × 120) ÷ 10,380 = 99,072 ÷ 10,380 = 9.54 V.',
        'Percentage Drop & End Voltage: (9.54 ÷ 240) × 100 = 3.98% drop (Load Voltage = 230.46 V; Line Heat Loss = 305.4 W).',
        'NEC 210.19 ≤ 3.0% Check: CAUTION (exceeds 3.0% branch recommendation). Required CM = 99,072 ÷ (240 × 0.03) = 13,760 CM → Upgrade to 8 AWG Copper (16,510 CM / 8.37 mm²).',
      ],
      result: '3.98% Voltage Drop (9.54 V lost · Upgrade to 8 AWG Copper for ≤ 3%)',
      interpretation: 'At 120 feet, 10 AWG copper loses nearly 4% voltage and dissipates 305W in the wall—upsizing to 8 AWG brings drop safely below 3%.',
    },
    regulatoryAndStandards: {
      title: 'NFPA 70 (NEC) Article 210.19, 215.2 & Chapter 9 Table 8',
      description: 'Checks installations against widely adopted North American electrical benchmarks:',
      points: [
        'NEC 3% / 5% Rule of Thumb: Article 210.19(A) Informational Note recommends ≤ 3% voltage drop on individual branch circuits and ≤ 5% combined (feeder + branch).',
        'Circular Mil Basis: Uses exact NEC Chapter 9 Table 8 uncoated conductor areas from 14 AWG (4,110 CM) through 4/0 AWG (211,600 CM).',
        'Ampacity First: Voltage-drop sizing never overrides conductor thermal ampacity limits (NEC Table 310.16) or the 125% continuous-load breaker rule.',
      ],
    },
    countryContext: {
      summary: 'Displays both North American AWG (Circular Mils) and international IEC metric equivalents (mm² & meters):',
      markets: [
        { region: 'United States & Canada', standard: 'NEC / CEC AWG wire gauges with 120V/240V single-phase and 208V/480V three-phase voltage drop checks.', unitsOrCurrency: 'AWG, ft & V', effectiveDate: '2026 NEC' },
        { region: 'UK / Australia / NZ', standard: 'BS 7671 & AS/NZS 3000 IEC metric cross-sections (2.5–107 mm²) and 230V/400V supply drops.', unitsOrCurrency: 'mm², m & V', effectiveDate: '2026 BS/AS' },
      ],
    },
    references: [
      { name: 'NFPA 70: National Electrical Code (NEC)', organization: 'National Fire Protection Association (NFPA)', url: 'https://www.nfpa.org/codes-and-standards/nfpa-70-standard-development/70', effectiveDate: 'Active Standard', note: 'Chapter 9 Table 8 conductor dimensions and Articles 210.19/215.2 voltage drop recommendations.' },
      { name: 'Ohm’s Law & Electrical Conductor Sizing Fundamentals', organization: 'NIST / Engineering Reference', url: 'https://www.nist.gov/', effectiveDate: '2026', note: 'Resistive voltage drop and I²R Joule heating loss principles.' },
    ],
    commonMistakes: {
      title: 'Entering Round-Trip Wire Length (240 ft) When Formula Already Doubles One-Way Distance',
      explanation: 'For single-phase circuits, the 2× multiplier already counts hot and neutral return paths. Enter strictly the one-way distance from breaker panel to load.',
    },
    proTips: [
      'Always size the wire to the LARGER gauge between thermal ampacity (NEC 310.16) and voltage-drop compliance (≤ 3%).',
      'Planning a detached garage EV charger? Cross-check charging hours and utility rate with our EV Charging Calculator.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Electrical Engineering Desk',
      reviewDate: 'November 2026',
      accuracyStandard: 'Verified against NEC Chapter 9 Table 8 Circular Mils and standard 1Φ/3Φ DC-resistance formulas.',
    },
    eeat: {
      authorRole: 'Numeriq Electrical & Power Systems Team',
      reviewerRole: 'Numeriq Quantitative Validation Desk',
      methodology: 'Evaluates Vd = (mult × K × I × L) ÷ CM with 2× (single-phase) or √3× (three-phase) geometry and solves minimum required Circular Mils for 3% drop.',
      lastVerifiedDate: '2026-11-20',
      taxOrRegulationYear: 'NFPA 70 NEC Chapter 9 Standards',
      limitations: [
        'Uses DC resistance (K = 12.9 Cu / 21.2 Al) without AC conduit reactance correction—accurate for residential 14–2 AWG and power-factor ~1 loads; inductive large feeders (>2/0 AWG) require NEC Table 9 impedance.',
        'Does not enforce local breaker thermal derating for >3 current-carrying conductors or >30°C ambient conduit temperatures.',
      ],
      nonAdviceDisclaimer: 'Electrical design reference only; high-voltage wiring must be permitted, inspected, and installed by a licensed electrician per local electrical code.',
    },
    relatedCalculatorSlugs: ['ev-charging-calculator', 'ohms-law-calculator', 'electricity-cost-calculator', 'solar-panel-calculator'],
  },

  'roof-pitch-rafter-calculator': {
    overview:
      'The Roof Pitch, Rafter Length & Shingle Area Calculator converts X:12 roof pitch into exact pitch angle (degrees), grade percentage, slope multiplier factor, common rafter length (including eave overhang), total gable roof area, Roofing Squares (100 ft²), and 3-bundle asphalt shingle count.',
    detailedExplanation:
      'Builders measure roof steepness as "rise over 12 inches of horizontal run" (such as 6:12 or 8:12). Because rafters slope diagonally across space, flat building footprints dramatically underestimate true roof decking and shingle area. Multiplying half the building span (plus horizontal overhang) by the Pythagorean slope factor √(1 + (Pitch÷12)²) produces exact rafter cutting lengths and true sloped square footage.',
    formulaDisplay: {
      formula: 'SlopeFactor = √(1 + (Pitch ÷ 12)²)   |   Rafter = (Width÷2 + Overhang) × SlopeFactor',
      variableDefinitions: [
        { symbol: 'Pitch', name: 'Roof Rise per 12" Run', description: 'Vertical inches risen per 12 horizontal inches (e.g., 6 for 6:12)', unit: 'in/ft' },
        { symbol: 'SlopeFactor', name: 'Hypotenuse Multiplier', description: 'Ratio of sloped rafter length to flat horizontal run', unit: 'Multiplier' },
        { symbol: 'Squares', name: 'Roofing Squares', description: 'Industry roof area unit equal to 100 sq ft (3 bundles shingles)', unit: 'Squares' },
      ],
    },
    workedExample: {
      scenario: 'A 32 ft × 48 ft gable house with a 6:12 roof pitch, 1.5 ft eave overhangs, and a 10% shingle cutting waste allowance.',
      inputs: [
        { name: 'Roof Pitch / Building Span × Length', value: '6:12 Pitch / 32 ft × 48 ft' },
        { name: 'Overhang / Cutting Waste', value: '1.5 ft eave / 10% waste' },
      ],
      steps: [
        'Pitch Angle = arctan(6 ÷ 12) = 26.57° (50.0% grade); Slope Multiplier = √(1 + 0.5²) = 1.1180.',
        'Horizontal Run = (32 ÷ 2) + 1.5 = 17.5 ft → Common Rafter Length = 17.5 × 1.1180 = 19.57 ft (Ridge Rise = 8.00 ft).',
        'Total Sloped Roof Area (both planes + end overhangs) = 2 × 19.57 × (48 + 3) = 1,996 ft²; adding 10% waste = 2,195 ft² → 21.95 Roofing Squares (66 shingle bundles).',
      ],
      result: '19.57 ft Common Rafter Length (26.57° · 1,996 ft² · 21.95 Squares · 66 Bundles)',
      interpretation: 'Ordering off the 1,536 ft² floor footprint would fall nearly 660 ft² short once roof slope, overhangs, and 10% starter/ridge waste are included.',
    },
    regulatoryAndStandards: {
      title: 'IRC Chapter 9 Roof Assemblies & Architectural Shingle Standards',
      description: 'Aligns framing geometry with International Residential Code (IRC) roofing cutoffs:',
      points: [
        'Minimum Shingle Slope (IRC R905.2.2): Standard asphalt shingles require a ≥ 2:12 slope (with double underlayment required on low slopes between 2:12 and 4:12).',
        'Roofing Square Definition: 1 Roofing Square = 100 sq ft of finished sloped roof plane, typically packaged as 3 bundles for standard architectural laminates.',
        'Cutting Waste Tiers: Simple gables require ~10% waste (starter strips, ridge caps); hip roofs and dormers typically need 15%–20%.',
      ],
    },
    countryContext: {
      summary: 'Converts North American X:12 rafter pitch directly into metric degrees, percentages, and square meters:',
      markets: [
        { region: 'United States & Canada', standard: 'Framing uses X:12 pitch, common rafters in feet, and 100 ft² Roofing Squares (3 bundles/square).', unitsOrCurrency: 'ft, in/12 & Squares', effectiveDate: '2026 IRC' },
        { region: 'UK / Australia / NZ', standard: 'Roof framing specified directly by pitch angle in degrees (e.g., 26.57°) and m² roofing coverage.', unitsOrCurrency: 'Degrees & m²', effectiveDate: '2026 BS/NCC' },
      ],
    },
    references: [
      { name: 'International Residential Code (IRC) Chapter 8 & 9 — Roof-Ceiling & Roof Assemblies', organization: 'International Code Council (ICC)', url: 'https://codes.iccsafe.org/', effectiveDate: '2024/2026 IRC', note: 'Governs roof pitch minimums, shingle underlayment rules, and rafter spans.' },
      { name: 'NIST Engineering Weights & Measures Handbook', organization: 'National Institute of Standards and Technology (NIST)', url: 'https://www.nist.gov/pml/owm', effectiveDate: '2026', note: 'Exact US Survey/International foot-to-meter area conversions.' },
    ],
    commonMistakes: {
      title: 'Measuring Flat Attic Floor Area Instead of True Sloped Roof Area',
      explanation: 'At a steep 12:12 pitch (45°), sloped roof area is 41.4% larger than flat attic area—forgetting the slope factor causes severe material shortages mid-tearoff.',
    },
    proTips: [
      'Remember to add separate hip/valley/ridge cap shingle bundles and ice-and-water shield perimeter rolls on cold-climate roofs.',
      'Check solar panel tilt angle optimization (equal to ~latitude) using degrees output here alongside our Solar Panel Calculator.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Construction & Framing Desk',
      reviewDate: 'November 2026',
      accuracyStandard: 'Verified against exact Pythagorean rafter trigonometry and 100 ft² roofing square bundling.',
    },
    eeat: {
      authorRole: 'Numeriq Structural & Construction Framing Team',
      reviewerRole: 'Numeriq Quantitative Validation Desk',
      methodology: 'Evaluates arctan pitch angles, Pythagorean slope multipliers, two-plane sloped area including eave overhangs, and ceiling-rounded 3-bundle shingle packs.',
      lastVerifiedDate: '2026-11-20',
      taxOrRegulationYear: '2024/2026 IRC Framing Standards',
      limitations: [
        'Models symmetric dual-slope gable roofs; complex multi-valley, hip, or gambrel roofs require adding individual plane geometries.',
        'Rafter lumber depth/spacing (e.g., 2×8 @ 16" OC) depends on local snow/wind load tables.',
      ],
      nonAdviceDisclaimer: 'Construction estimation tool only; verify structural rafter sizing and snow-load engineering with local building inspectors.',
    },
    relatedCalculatorSlugs: ['stair-calculator', 'concrete-calculator', 'tile-flooring-calculator', 'solar-panel-calculator'],
  },

  'stair-calculator': {
    overview:
      'The Stair Stringer & Step Geometry Calculator solves exact equal riser heights, step counts, tread run length, cut stringer diagonal length, staircase angle, and the 2R+T Blondel comfort rule—automatically checking compliance with US International Residential Code (IRC R311.7.5).',
    detailedExplanation:
      'Every staircase has one non-negotiable safety rule: every step from bottom to top must have the exact same vertical riser height (code tolerances allow barely 3/8 inch variance across an entire flight). You never build a staircase to an arbitrary riser height and leave an awkward fractional step at the top—instead, divide Total Finished Floor-to-Floor Rise by your target riser (~7.25"), round to the nearest integer number of risers, and recompute the exact equal riser height.',
    formulaDisplay: {
      formula: 'Risers = round(TotalRise ÷ TargetR)   |   R_exact = TotalRise ÷ Risers   |   Stringer = √(Rise² + Run²)',
      variableDefinitions: [
        { symbol: 'TotalRise', name: 'Finished Floor-to-Floor Height', description: 'Vertical distance from finished lower floor to upper landing', unit: 'in' },
        { symbol: 'Risers / Treads', name: 'Step Geometry', description: 'Total Risers N; Treads = N − 1 (top floor surface acts as final step)', unit: 'steps' },
        { symbol: '2R + T', name: 'Blondel Comfort Rule', description: 'Ideal ergonomic stride rule targeting 24"–25" (610–635 mm)', unit: 'in' },
      ],
    },
    workedExample: {
      scenario: 'Framing an interior basement/main-floor staircase spanning 108 inches (9 ft) finished floor-to-floor rise targeting ~7.25" risers and 10.5" treads.',
      inputs: [
        { name: 'Total Floor-to-Floor Rise', value: '108 inches (9.0 ft)' },
        { name: 'Target Riser / Tread Depth', value: '7.25 in / 10.5 in' },
      ],
      steps: [
        'Integer Risers: round(108 ÷ 7.25) = round(14.90) = 15 equal risers (creating 14 treads).',
        'Exact Equal Riser: 108 ÷ 15 = 7.200 inches (183 mm) — safely under the 7.75" IRC maximum.',
        'Total Horizontal Run = 14 × 10.5 = 147.0 inches (12.25 ft); Cut Stringer Diagonal = √(108² + 147²) = 182.4 inches (15.20 ft @ 34.4°; Blondel 2R+T = 24.90").',
      ],
      result: '7.200 in Exact Riser (15 Risers · 14 Treads · 182.4 in Stringer · IRC Compliant)',
      interpretation: 'All dimensions satisfy both IRC residential limits (R ≤ 7.75", T ≥ 10") and the classical 24"–25" Blondel walking cadence formula.',
    },
    regulatoryAndStandards: {
      title: 'IRC R311.7.5 Residential Stairway Code & UK/AU/CA Equivalents',
      description: 'Validates stair geometry against international building safety rules:',
      points: [
        'IRC R311.7.5 (US): Maximum riser height 7.75 inches (197 mm); minimum tread depth 10.0 inches (254 mm); uniform tolerance ≤ 3/8 inch.',
        'Blondel Ergonomic Law (1675): 2 × Riser + Tread should sit comfortably between 24" and 25" (600–640 mm) for natural stride cadence.',
        'Stringer Stock Sizing: Notice an 182.4" diagonal requires a 16-foot 2×12 structural stringer board (leaving at least 3.5"–5" solid throat depth uncut).',
      ],
    },
    countryContext: {
      summary: 'Outputs exact US/Canadian inches alongside millimeter (mm) R × T equivalents for UK, Australia, and NZ builders:',
      markets: [
        { region: 'United States (IRC)', standard: 'Max 7.75" (197 mm) riser, min 10" (254 mm) tread, min 6\'8" headroom clearance.', unitsOrCurrency: 'Inches & Feet', effectiveDate: '2024/2026 IRC' },
        { region: 'UK (Part K) / AU (NCC) / CA (NBC)', standard: 'UK Part K private stairs allow up to 220 mm riser / min 220 mm going (42° max pitch); NCC AU 190 mm max riser / 240 mm min going.', unitsOrCurrency: 'mm & Degrees', effectiveDate: '2026 Codes' },
      ],
    },
    references: [
      { name: 'International Residential Code Section R311.7 — Stairways', organization: 'International Code Council (ICC)', url: 'https://codes.iccsafe.org/', effectiveDate: '2024/2026 IRC', note: 'Statutory 7.75" max riser, 10" min tread, and headroom/uniformity requirements.' },
      { name: 'UK Building Regulations Approved Document K (Stairs, Ladders & Ramps)', organization: 'UK Government / GOV.UK', url: 'https://www.gov.uk/government/publications/protection-from-falling-collision-and-impact-approved-document-k', effectiveDate: 'Active UK Code', note: 'Metric rise, going, and maximum 42° private pitch standards.' },
    ],
    commonMistakes: {
      title: 'Forgetting to Subtract the Bottom Tread Thickness / Upper Floor Finish When Cutting the First & Last Plumb Cuts',
      explanation: 'Carpenters "drop the bottom riser" by the thickness of one tread board (typically 1" or 1.5" deck board) so the finished step height matches every upper riser uniformly.',
    },
    proTips: [
      'Measure strictly from FINISHED lower flooring to FINISHED upper landing—subfloor-only measurements shift bottom/top step height dangerously.',
      'Cross-check diagonal framing right triangles cleanly with our Pythagorean Theorem Calculator.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Carpentry & Code Desk',
      reviewDate: 'November 2026',
      accuracyStandard: 'Verified against IRC R311.7.5 thresholds and exact right-triangle stringer trigonometry.',
    },
    eeat: {
      authorRole: 'Numeriq Residential Construction & Framing Team',
      reviewerRole: 'Numeriq Quantitative Validation Desk',
      methodology: 'Divides total floor-to-floor rise into N equal integer risers, computes N−1 treads, evaluates hypotenuse diagonal and pitch angle, and tests IRC R311.7.5 + Blondel 2R+T.',
      lastVerifiedDate: '2026-11-20',
      taxOrRegulationYear: '2024/2026 IRC R311.7.5 Standards',
      limitations: [
        'Models straight-run staircases (top tread flush with upper landing); curved, winder, or L-shaped landings require landing run deductions.',
        'Local municipal amendments (e.g., some states enforcing 7.5" max riser or 11" tread) supersede generic IRC defaults.',
      ],
      nonAdviceDisclaimer: 'Framing geometry estimator only; verify staircase plans and structural stringer spans with local building officials.',
    },
    relatedCalculatorSlugs: ['roof-pitch-rafter-calculator', 'pythagorean-theorem-calculator', 'concrete-calculator', 'tile-flooring-calculator'],
  },

  'tile-flooring-calculator': {
    overview:
      'The Tile, Flooring & Grout Coverage Calculator computes net and gross floor area, exact whole tiles to order, carton/box counts (rounded up), layout waste factors (10% straight, 15% diagonal/herringbone, 20% complex), and estimated sanded/unsanded grout weight.',
    detailedExplanation:
      'Running short by three tiles on installation day often means dye-lot shading mismatches because ceramic and porcelain batches vary slightly between kiln runs. This planner scales net room area by layout complexity (10%–20% cut waste), rounds both total tiles and full boxes safely upward, and estimates grout pounds using tile perimeter ratio, joint width, and 3/8-inch standard tile depth.',
    formulaDisplay: {
      formula: 'OrderArea = L×W × (1 + Waste%)   |   Boxes = ceil(OrderArea ÷ BoxSqFt)',
      variableDefinitions: [
        { symbol: 'L × W', name: 'Net Floor Dimensions', description: 'Room length and width in feet', unit: 'ft' },
        { symbol: 'Waste%', name: 'Pattern Cut Waste', description: '10% grid, 15% diagonal/herringbone, 20% tight alcoves', unit: '%' },
        { symbol: 'Grout_lb', name: 'Estimated Grout Weight', description: 'Derived from perimeter joint length, joint width, and 3/8" thickness', unit: 'lb / kg' },
      ],
    },
    workedExample: {
      scenario: 'Tiling a 16 ft × 12 ft kitchen floor with 24" × 12" large-format porcelain tiles (15 ft² per carton) in a straight grid (+10% waste) using 1/8" (0.125") grout lines.',
      inputs: [
        { name: 'Room Size / Tile Size', value: '16 ft × 12 ft / 24" × 12" (2.0 ft²/tile)' },
        { name: 'Waste / Box / Joint Width', value: '10% Grid / 15 ft²/box / 0.125 in' },
      ],
      steps: [
        'Net Area = 16 × 12 = 192.0 ft² (17.8 m²); add 10% cut waste = 211.2 ft² gross order area.',
        'Tile Count = ceil(211.2 ÷ 2.0) = 106 tiles; Cartons Needed = ceil(211.2 ÷ 15) = 15 full boxes.',
        'Grout Joint Estimate at 0.125" width × 3/8" tile depth = 11.3 lb (5.1 kg) grout (one standard 25 lb bag covers comfortably).',
      ],
      result: '15 Boxes Needed (106 Tiles · 211.2 ft² w/ 10% Waste · ~11.3 lb Grout)',
      interpretation: 'Ordering 15 full boxes (225 ft² boxed) guarantees matching kiln dye lots plus spare attic tiles for future plumbing repairs.',
    },
    regulatoryAndStandards: {
      title: 'TCNA Handbook & ANSI A108 Grout/Tile Installation Standards',
      description: 'Follows Tile Council of North America (TCNA) estimating practices:',
      points: [
        'Grout Joint Selection (TCNA): Rectified large-format porcelain uses 1/8" (3 mm) sanded or high-performance polymer grout; pressed/handmade tiles require wider 3/16"+ joints.',
        'Thin-Set Mortar Coverage: One 50 lb bag of mortar typically covers ~60–75 ft² with a 1/4"×3/8" notched trowel, or ~40–50 ft² with a 1/2"×1/2" trowel for 24" tiles.',
        'Spare Tile Buffer: Always store 4–6 leftover whole tiles from the same dye lot for future repairs.',
      ],
    },
    countryContext: {
      summary: 'Provides simultaneous square feet / pounds and metric square meters / kilograms for contractors:',
      markets: [
        { region: 'United States & Canada', standard: 'Sold per sq ft carton (~12–16 ft²/box), 25 lb grout bags, and imperial inches.', unitsOrCurrency: 'ft², in & lb', effectiveDate: '2026 TCNA' },
        { region: 'UK / Australia / NZ', standard: 'Metric m² carton coverage, 3 mm / 5 mm grout spacers, and 5 kg / 20 kg grout sacks.', unitsOrCurrency: 'm², mm & kg', effectiveDate: '2026 BS/AS' },
      ],
    },
    references: [
      { name: 'TCNA Handbook for Ceramic, Glass, and Stone Tile Installation', organization: 'Tile Council of North America (TCNA)', url: 'https://tcnatile.com/', effectiveDate: '2026', note: 'Industry guidelines for waste allowances, grout joint widths, and lippage tolerances.' },
      { name: 'National Tile Contractors Association Reference', organization: 'NTCA', url: 'https://www.tile-assn.com/', effectiveDate: '2026', note: 'Best practices for large-format tile layout and thin-set mortar selection.' },
    ],
    commonMistakes: {
      title: 'Rounding Down Partial Cartons or Neglecting 15%–20% Waste on Diagonal & Herringbone Patterns',
      explanation: '45° diagonal perimeter triangles cannot always be reused cleanly if pattern grain runs one direction—use at least 15% waste for angled layouts.',
    },
    proTips: [
      'Check the actual printed "coverage per box" on the carton label inside Advanced Inputs, as 24"×24" or 12"×24" boxes commonly vary between 13.5 and 16.0 ft².',
      'Use our Concrete Volume Calculator to figure self-leveling underlayment or mortar bed thickness beforehand.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Home Renovation & Finishes Desk',
      reviewDate: 'November 2026',
      accuracyStandard: 'Verified against standard TCNA waste multipliers, ceiling box math, and joint-volume grout equations.',
    },
    eeat: {
      authorRole: 'Numeriq Remodeling & Quantity Surveying Team',
      reviewerRole: 'Numeriq Quantitative Validation Desk',
      methodology: 'Multiplies net room footprint by pattern waste factor, computes ceiling tile and carton counts, and evaluates tile-perimeter grout volume at 100 lb/ft³ density.',
      lastVerifiedDate: '2026-11-20',
      taxOrRegulationYear: '2026 TCNA Estimating Conventions',
      limitations: [
        'Thick slate/natural stone (>3/8") or wide (>1/4") joints consume proportionally more grout than nominal 3/8" porcelain.',
        'Does not subtract fixed kitchen islands unless excluded from net room dimensions.',
      ],
      nonAdviceDisclaimer: 'Material estimating aid only; always confirm exact manufacturer carton yields and batch dye-lot codes at checkout.',
    },
    relatedCalculatorSlugs: ['paint-calculator', 'concrete-calculator', 'gravel-mulch-calculator', 'roof-pitch-rafter-calculator'],
  },

  'gravel-mulch-calculator': {
    overview:
      'The Mulch, Soil & Gravel Volume Calculator computes exact bulk Cubic Yards (yd³), Metric Cubic Meters (m³), Cubic Feet, US Short Tons, Metric Tonnes, and bagged equivalents (e.g., 2 ft³ bags) across hardwood mulch, screened topsoil, crushed gravel, and masonry sand.',
    detailedExplanation:
      'Landscape supply yards sell bulk materials by the Cubic Yard (27 cubic feet) or by weight (US Tons), whereas garden centers sell bags by the Cubic Foot (commonly 1.5, 2.0, or 3.0 ft³). A single cubic yard equals 13.5 standard 2-cubic-foot bags—making bulk delivery dramatically cheaper above 2–3 yards, provided you verify payload weight limits for pickup trucks or dump trailers.',
    formulaDisplay: {
      formula: 'Cubic Yards = (Area_ft² × Depth_in ÷ 12) ÷ 27   |   Tons = yd³ × MaterialDensity ÷ 2,000',
      variableDefinitions: [
        { symbol: 'Area_ft²', name: 'Bed / Driveway Area', description: 'Surface square footage to cover', unit: 'ft²' },
        { symbol: 'Depth_in', name: 'Spread Depth', description: '2–3 in standard mulch; 3–4 in driveway gravel base', unit: 'inches' },
        { symbol: 'Density', name: 'Material Weight Factor', description: 'Mulch ~800 lb/yd³; Topsoil ~2,200; Gravel ~2,800; Sand ~2,700', unit: 'lb/yd³' },
      ],
    },
    workedExample: {
      scenario: 'Top-dressing a 600 sq ft garden bed with 3 inches of shredded hardwood bark mulch (~800 lb/yd³), comparing bulk delivery against 2 ft³ bags.',
      inputs: [
        { name: 'Area / Depth', value: '600 ft² / 3 inches' },
        { name: 'Material / Bag Size', value: 'Hardwood Mulch (~800 lb/yd³) / 2.0 ft³/bag' },
      ],
      steps: [
        'Cubic Feet = 600 × (3 ÷ 12) = 150.0 ft³.',
        'Bulk Volume = 150.0 ÷ 27 = 5.56 cubic yards (4.25 m³).',
        'Weight & Bags: 5.56 × 800 = 4,444 lb (2.22 US Tons / 2.02 metric tonnes); Bagged Alternative = ceil(150 ÷ 2.0) = 75 bags.',
      ],
      result: '5.56 Cubic Yards Bulk Volume (2.22 US Tons · 4.25 m³ · 75 Bags)',
      interpretation: 'Buying 5.56 yd³ in bulk saves hauling 75 plastic bags and usually cuts material cost by 40%–60%, though a 2.22-ton load exceeds a half-ton pickup’s single-trip payload.',
    },
    regulatoryAndStandards: {
      title: 'US Mulch & Soil Council (MSC) & DOT Vehicle Payload Safety',
      description: 'Connects material volume math with safe hauling weights:',
      points: [
        '1 Cubic Yard = 27 Cubic Feet = 0.764555 Cubic Meters.',
        'Compaction & Settling Factor: Loose topsoil and crushed stone settle roughly 10%–15% after watering or plate compaction—round bulk orders up to the next half-yard.',
        'Half-Ton Pickup Limit: A single cubic yard of damp crushed stone (~2,800 lb) or topsoil (~2,200 lb) often exceeds a standard F-150/1500 payload rating (~1,500–1,900 lb).',
      ],
    },
    countryContext: {
      summary: 'Provides bulk cubic yards / US short tons alongside metric cubic meters (m³) and tonnes (t):',
      markets: [
        { region: 'United States & Canada', standard: 'Sold in cubic yards (yd³), 2–3 ft³ retail bags, and US Short Tons (2,000 lb).', unitsOrCurrency: 'yd³ & Short Tons', effectiveDate: '2026 MSC' },
        { region: 'UK / Australia / New Zealand', standard: 'Landscape quarries sell in cubic meters (m³), 850 kg dumpy bags, and metric tonnes (1,000 kg).', unitsOrCurrency: 'm³ & Tonnes', effectiveDate: '2026' },
      ],
    },
    references: [
      { name: 'Volumetric Unit Conversions (Handbook 44)', organization: 'National Institute of Standards and Technology (NIST)', url: 'https://www.nist.gov/pml/owm/metric-si/unit-conversion', effectiveDate: '2026', note: 'Exact conversion factors between cubic yards, cubic feet, cubic meters, and tons.' },
      { name: 'Mulch & Soil Consumer Product Standards', organization: 'Mulch & Soil Council (MSC)', url: 'https://mulchandsoilcouncil.org/', effectiveDate: '2026', note: 'Volumetric bag labeling and bulk density conventions.' },
    ],
    commonMistakes: {
      title: 'Confusing Square Feet With Cubic Yards or Overloading Pickup Axles With Wet Gravel',
      explanation: 'Always check weight before picking up bulk rock or wet soil yourself: 2 yards of crushed limestone weighs ~5,600 lb and requires a tandem dump trailer or yard delivery.',
    },
    proTips: [
      'Spread mulch 2–3 inches thick—piling >4 inches ("mulch volcanoes") suffocates tree root flares and invites rot.',
      'Use our Concrete Calculator when pouring patio slabs over your compacted crushed-stone sub-base.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Landscaping & Civil Materials Desk',
      reviewDate: 'November 2026',
      accuracyStandard: 'Verified against exact 27 ft³/yd³ geometry and standard bulk aggregate/mulch densities.',
    },
    eeat: {
      authorRole: 'Numeriq Site Work & Materials Estimating Team',
      reviewerRole: 'Numeriq Quantitative Validation Desk',
      methodology: 'Converts area × depth inches into cubic feet, cubic yards, cubic meters, bulk short tons / metric tonnes by material density, and ceiling-rounded bags.',
      lastVerifiedDate: '2026-11-20',
      taxOrRegulationYear: 'NIST Volumetric & MSC Standards',
      limitations: [
        'Material bulk density varies ±15%–25% with moisture content (rain-soaked mulch or sand weighs significantly more than kiln-dried stock).',
        'Does not add extra compaction allowance automatically for vibratory-tamped gravel.',
      ],
      nonAdviceDisclaimer: 'Material quantity estimator only; confirm exact moisture weight and truck payload ratings with your landscape supplier.',
    },
    relatedCalculatorSlugs: ['concrete-calculator', 'tile-flooring-calculator', 'roof-pitch-rafter-calculator', 'unit-converter'],
  },

  'ev-charging-calculator': {
    overview:
      'The Electric Vehicle (EV) Charging Time & Cost Calculator determines charging duration (hours & minutes), wall-to-battery energy drawn (accounting for ~90% charger conversion efficiency), session electricity cost, miles/km of range added, and energy cost per 100 miles.',
    detailedExplanation:
      'Charging an EV is never 100% lossless: roughly 8%–12% of alternating-current wall electricity dissipates as heat in the onboard AC-to-DC rectifier, battery thermal conditioning, and cooling fans. Measuring Grid kWh = Net Battery kWh ÷ Efficiency% ensures both your charging duration and electric bill projection reflect real-world smart-meter usage—and lets you instantly compare home Level 2 charging ($0.12–$0.18/kWh) against pricey DC fast-charging corridors ($0.45–$0.65/kWh).',
    formulaDisplay: {
      formula: 'Grid_kWh = [Capacity × (Target% − Start%)] ÷ η   |   Time_hrs = Grid_kWh ÷ Charger_kW',
      variableDefinitions: [
        { symbol: 'Capacity', name: 'Usable Battery Pack', description: 'Usable kWh capacity (typically ~75 kWh midsize EV)', unit: 'kWh' },
        { symbol: 'η', name: 'Charging Efficiency', description: 'Grid-to-battery efficiency (default 90% Level 2; ~82% Level 1)', unit: '%' },
        { symbol: 'Charger_kW', name: 'EVSE Charge Rate', description: 'Level 1 (~1.4 kW), Level 2 (7.4–11.5 kW), DC Fast (50–350 kW)', unit: 'kW' },
      ],
    },
    workedExample: {
      scenario: 'Overnight Level 2 home charging of a 75 kWh EV from 20% to 80% SoC on a 9.6 kW (40A @ 240V) wallbox at $0.16/kWh utility rate.',
      inputs: [
        { name: 'Battery / Target Window', value: '75 kWh usable / 20% → 80% (+60%)' },
        { name: 'Charger Power / Electricity Rate', value: '9.6 kW / $0.16/kWh' },
        { name: 'Efficiency / Vehicle Economy', value: '90% wall-to-pack / 3.5 mi/kWh' },
      ],
      steps: [
        'Net Battery Energy Stored: 75 × (80% − 20%) = 45.00 kWh.',
        'Wall / Grid Energy Drawn (÷ 0.90 efficiency): 45.00 ÷ 0.90 = 50.00 kWh → Session Cost = 50.00 × $0.16 = $8.00.',
        'Charge Time = 50.00 kWh ÷ 9.6 kW = 5.21 hours (5h 13m); Range Added = 45 × 3.5 = 158 miles (Cost = $5.08 per 100 miles).',
      ],
      result: '5.21 Hours (5h 13m · $8.00 Session Cost · 158 Miles Added · $5.08/100 mi)',
      interpretation: 'Recharging 158 miles of driving costs just $8.00 ($5.08 per 100 miles)—roughly one-third to one-quarter the fuel cost of a comparable gasoline vehicle.',
    },
    regulatoryAndStandards: {
      title: 'SAE J1772, NACS (J3400) & EPA MPGe Energy Benchmarks',
      description: 'Models real-world home Level 2 and commercial charging physics:',
      points: [
        '80% Continuous Circuit Rule (NEC 625): A 50A breaker supplies up to 40A continuous (40A × 240V = 9.6 kW); a 60A breaker supplies 48A (11.52 kW).',
        'DC Fast Taper Curve: Notice DC fast chargers sustain 150–250 kW only up to ~50%–65% SoC before throttling sharply above 80% to protect lithium-ion plating.',
        'Level 1 Losses: Standard 120V/12A (1.4 kW) trickle charging takes ~36+ hours for 45 kWh and loses slightly more energy (~15%–18%) to vehicle awake-overhead.',
      ],
    },
    countryContext: {
      summary: 'Works globally using kW power and local utility tariffs across North America, UK, Europe, and ANZ:',
      markets: [
        { region: 'United States & Canada', standard: '240V split-phase J1772 / NACS Level 2 home chargers (7.2–11.5 kW) and Time-of-Use (TOU) overnight kWh plans.', unitsOrCurrency: 'kWh, mi & $/kWh', effectiveDate: '2026 NEC/SAE' },
        { region: 'UK / Australia / NZ', standard: '230V single-phase (7.4 kW) or 3-phase (11–22 kW) Type 2 wallboxes with off-peak EV tariffs.', unitsOrCurrency: 'kWh, km & £/A$/NZ$', effectiveDate: '2026' },
      ],
    },
    references: [
      { name: 'Alternative Fuels Data Center — Electricity Laws & Charging Infrastructure', organization: 'U.S. Department of Energy (AFDC)', url: 'https://afdc.energy.gov/fuels/electricity-charging-home', effectiveDate: '2026', note: 'Level 1, Level 2, and DC Fast Charging power and conversion benchmarks.' },
      { name: 'FuelEconomy.gov EV Comparison & Cost Tool', organization: 'U.S. EPA / DOE', url: 'https://www.fueleconomy.gov/feg/evtech.shtml', effectiveDate: '2026', note: 'EPA vehicle mi/kWh efficiency ratings and 33.7 kWh/gallon equivalence.' },
    ],
    commonMistakes: {
      title: 'Forgetting Onboard Charger Efficiency Losses and Cold-Weather Battery Heating',
      explanation: 'Measuring only battery kWh ignores the ~10% wall-to-pack conversion overhead, while winter temperatures (<0°C / 32°F) draw extra wall power pre-heating the pack.',
    },
    proTips: [
      'Check if installing a 48A charger needs panel/wire sizing first with our Wire Size & Voltage Drop Calculator.',
      'Compare EV energy costs against solar generation savings in our Solar Panel Calculator and Electricity Cost Calculator.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq EV & Energy Systems Desk',
      reviewDate: 'November 2026',
      accuracyStandard: 'Verified against SAE J1772/NACS power math and wall-to-pack efficiency modeling.',
    },
    eeat: {
      authorRole: 'Numeriq Electrification & Utility Economics Team',
      reviewerRole: 'Numeriq Quantitative Validation Desk',
      methodology: 'Divides net SoC delta kWh by grid-to-battery efficiency to compute utility kWh drawn, session cost, constant-power charge duration, and range/cost per 100 miles.',
      lastVerifiedDate: '2026-11-20',
      taxOrRegulationYear: '2026 DOE AFDC / NEC 625 Conventions',
      limitations: [
        'Assumes constant average charger power; DC fast charging above 70%–80% SoC tapers substantially depending on vehicle BMS.',
        'Real-world driving range fluctuates with highway speed, elevation, cabin HVAC load, and ambient cold.',
      ],
      nonAdviceDisclaimer: 'Charging cost and timing estimator only; verify utility off-peak tariff tiers and EVSE breaker capacity with your electrician.',
    },
    relatedCalculatorSlugs: ['wire-size-voltage-drop-calculator', 'electricity-cost-calculator', 'solar-panel-calculator', 'fuel-economy-converter'],
  },

  'ab-test-sample-size-calculator': {
    overview:
      'The A/B Test Sample Size & Statistical Power Calculator solves the exact two-proportion Z-test sample size per variant, total required traffic across A & B, target lift rate, and estimated test duration in days using Acklam’s high-precision inverse Normal CDF.',
    detailedExplanation:
      'Peeking at an A/B experiment after 3 days and stopping the moment p < 0.05 creates massive false-positive rates ("winner’s curse"). Pre-registering a statistically powered sample size anchored on your Baseline Conversion Rate (p₁), Minimum Detectable Effect (relative lift), Significance Level (1 − α, typically 95%), and Statistical Power (1 − β, typically 80%) guarantees your experiment can reliably detect real product gains without hallucinating random noise.',
    formulaDisplay: {
      formula: 'n = [Z_(1−α/2)·√(2·p̄·q̄) + Z_(1−β)·√(p₁q₁ + p₂q₂)]² ÷ (p₂ − p₁)²',
      variableDefinitions: [
        { symbol: 'p₁, p₂', name: 'Control & Variant Rates', description: 'Baseline rate p₁ and target treatment rate p₂ = p₁ × (1 + MDE%)', unit: 'Proportion' },
        { symbol: 'Z_α/2', name: 'Two-Tailed Critical Z', description: '1.960 for 95% confidence (α = 0.05); 2.576 for 99%', unit: 'Z-Score' },
        { symbol: 'Z_β', name: 'Power Critical Z', description: '0.842 for 80% statistical power (β = 0.20)', unit: 'Z-Score' },
      ],
    },
    workedExample: {
      scenario: 'An e-commerce checkout page converts at 4.0% baseline and wants 80% power at 95% two-tailed confidence to detect a +15% relative lift (4.0% → 4.6%) given 2,500 daily visitors.',
      inputs: [
        { name: 'Baseline Rate / Relative MDE Lift', value: '4.0% / +15% (Target 4.60%)' },
        { name: 'Confidence / Power / Daily Traffic', value: '95% / 80% / 2,500 users/day' },
      ],
      steps: [
        'Rates: p₁ = 0.040, p₂ = 0.046 (pooled mean p̄ = 0.043; Δ = 0.006).',
        'Z-Criticals via Acklam inverse Normal CDF: Z_α/2 = 1.960 (α = 0.05), Z_β = 0.842 (β = 0.20).',
        'Evaluate pooled-null / unpooled-alt variance formula → n = 17,943 users per variant (35,886 total users A+B; ~15 days at 2,500/day).',
      ],
      result: '17,943 Users Per Variant (35,886 Total · 15 Days Estimated Runtime)',
      interpretation: 'Testing a modest 0.6 percentage-point shift (4.0% to 4.6%) requires nearly 36,000 total visitors (~15 days); calling a winner after 2 days risks severe false positives.',
    },
    regulatoryAndStandards: {
      title: 'Two-Proportion Z-Test (Fleiss / Kohavi Experimentation Standard)',
      description: 'Implements gold-standard experimentation sample sizing:',
      points: [
        'Pooled Null + Unpooled Alt Formula: Matches rigorous biostatistics (Casagrande/Fleiss normal approximation without continuity correction) and enterprise A/B engines.',
        'Weekly Cycle Rule: Even if sample size completes in 4 days, product experimentation best practices recommend running full 7- or 14-day increments to avoid weekday/weekend bias.',
        'Relative vs. Absolute Lift: A "+15% relative lift" on 4.0% equals +0.60 percentage points (4.6%), NOT 19.0%.',
      ],
    },
    countryContext: {
      summary: 'Applies universal frequentist experimentation statistics across global SaaS, fintech, and e-commerce analytics teams:',
      markets: [
        { region: 'Global Experimentation / CRO', standard: 'Standard 95% two-tailed confidence (α = 0.05) and 80% power (β = 0.20) frequentist horizon planning.', unitsOrCurrency: 'Users & Days', effectiveDate: '2026' },
      ],
    },
    references: [
      { name: 'NIST/SEMATECH e-Handbook of Statistical Methods — Sample Size for Proportions', organization: 'National Institute of Standards and Technology (NIST)', url: 'https://www.itl.nist.gov/div898/handbook/prc/section2/prc24.htm', effectiveDate: 'Active Reference', note: 'Statistical methodology for two-sample binomial hypothesis testing and power.' },
      { name: 'Trustworthy Online Controlled Experiments (Kohavi, Tang, Xu)', organization: 'Cambridge University Press / Experimentation Guide', url: 'https://experimentguide.com/', effectiveDate: '2020 / Industry Standard', note: 'Covers MDE sizing, novelty effects, peeking pitfalls, and full-week cycle rules.' },
    ],
    commonMistakes: {
      title: 'Peeking Daily and Stopping Early the Moment a Test Hits 95% Significance',
      explanation: 'Repeated significance peeking inflates your true false-positive rate from 5% to 25%–40%. Commit to running until the pre-calculated 35,886 sample size completes.',
    },
    proTips: [
      'Lower-traffic sites cannot reliably detect tiny 3%–5% lifts—either focus on bold changes with ≥15%–25% MDE or test higher-funnel metrics.',
      'Pair A/B experimentation with our Confidence Interval Calculator and Bayes’ Theorem Calculator to evaluate prior probabilities.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Experimentation & Statistics Desk',
      reviewDate: 'November 2026',
      accuracyStandard: 'Verified against Acklam (<1.15e-9 error) normal quantiles and two-proportion power formulas.',
    },
    eeat: {
      authorRole: 'Numeriq Product Analytics & Statistics Team',
      reviewerRole: 'Numeriq Quantitative Validation Desk',
      methodology: 'Solves two-tailed normal-approximation binomial sample size using pooled null standard error and unpooled treatment standard error under Acklam inverse normal CDF.',
      lastVerifiedDate: '2026-11-20',
      taxOrRegulationYear: 'NIST Two-Proportion Frequentist Standard',
      limitations: [
        'Assumes 50/50 equal traffic split between Control A and Variant B and stationary conversion rates.',
        'Very rare conversion events (<0.2%) or small counts should verify normal-approximation validity via Fisher’s exact test.',
      ],
      nonAdviceDisclaimer: 'Statistical planning estimator only; account for multiple testing (Bonferroni/FDR) when running simultaneous A/B/C/D variants.',
    },
    relatedCalculatorSlugs: ['confidence-interval-calculator', 'bayes-theorem-calculator', 'normal-distribution-calculator', 'saas-ltv-cac-calculator'],
  },

  'linear-regression-calculator': {
    overview:
      'The Pearson Correlation & Linear Regression Calculator fits the Ordinary Least Squares (OLS) best-fit line (ŷ = b₁x + b₀) to any paired dataset—computing Slope, Y-Intercept, Pearson Correlation (r), Coefficient of Determination (R²), Standard Error of Estimate (SEE), and predicted ŷ at a new X value.',
    detailedExplanation:
      'Ordinary Least Squares finds the unique straight line minimizing the sum of squared vertical residuals Σ(yᵢ − ŷᵢ)² across all observed data points. Coefficient of Determination (R² = r²) reveals what percentage of total Y variation is linearly explained by X, while the Standard Error of Estimate (SEE) quantifies the typical prediction error margin in original Y units.',
    formulaDisplay: {
      formula: 'b₁ = Σ(x−x̄)(y−ȳ) ÷ Σ(x−x̄)²   |   b₀ = ȳ − b₁x̄   |   r = Sxy ÷ √(Sxx·Syy)',
      variableDefinitions: [
        { symbol: 'b₁, b₀', name: 'OLS Slope & Intercept', description: 'Rate of change in Y per +1 unit X, and line intercept at X=0', unit: 'Y/X, Y' },
        { symbol: 'r, R²', name: 'Correlation & Explained Variance', description: 'Pearson r ∈ [−1, +1] and R² = r² ∈ [0, 1]', unit: 'Dimensionless' },
        { symbol: 'SEE', name: 'Standard Error of Estimate', description: '√[Σ(yᵢ − ŷᵢ)² ÷ (n − 2)] residual scatter', unit: 'Y units' },
      ],
    },
    workedExample: {
      scenario: 'Fitting a linear trend across six paired observations X = [1, 2, 3, 4, 5, 6] and Y = [2.1, 3.9, 6.2, 7.8, 10.1, 11.9], then predicting ŷ at X = 7.',
      inputs: [
        { name: 'X Observations', value: '1, 2, 3, 4, 5, 6 (x̄ = 3.5)' },
        { name: 'Y Observations / Predict X', value: '2.1, 3.9, 6.2, 7.8, 10.1, 11.9 (ȳ = 7.0) / X = 7' },
      ],
      steps: [
        'Sums of Squares: Sxx = 17.5, Syy = 68.52, Sxy = 34.60.',
        'Slope b₁ = 34.60 ÷ 17.5 = 1.9771; Intercept b₀ = 7.0 − 1.9771 × 3.5 = 0.0800 (ŷ = 1.9771x + 0.08).',
        'Correlation r = 0.9992 → R² = 0.9984 (99.84% explained); SEE = 0.1665; Forecast at X=7 → ŷ = 13.9200.',
      ],
      result: 'R² = 0.9984 (r = 0.9992 · ŷ = 1.9771x + 0.08 · ŷ(7) = 13.92)',
      interpretation: 'An R² of 99.84% and residual SEE of 0.1665 demonstrate a tight linear relationship across the observed range.',
    },
    regulatoryAndStandards: {
      title: 'Gauss-Markov OLS Assumptions & Numerical Precision',
      description: 'Computes centered sums of squares to preserve double-precision stability:',
      points: [
        'Centered Variance Formula: Computing Σ(x−x̄)² instead of Σx² − (Σx)²/n prevents catastrophic floating-point cancellation on large-offset X/Y datasets.',
        'Degrees of Freedom (n − 2): Standard Error of Estimate divides residual sum of squares by (n − 2) to reflect two estimated line parameters (slope and intercept).',
        'Correlation vs. Causation: Even r = 0.999 cannot prove X causes Y without controlled randomization or theoretical mechanism.',
      ],
    },
    countryContext: {
      summary: 'Follows international biostatistics, econometrics, and AP/IB/University linear regression notation:',
      markets: [
        { region: 'Global Academic & Analytics', standard: 'Standard OLS notation (ŷ = b₁x + b₀, Pearson r, R², residual SEE with df = n − 2).', unitsOrCurrency: 'Dimensionless', effectiveDate: '2026 ISO' },
      ],
    },
    references: [
      { name: 'NIST/SEMATECH e-Handbook of Statistical Methods — Linear Least Squares Regression', organization: 'National Institute of Standards and Technology (NIST)', url: 'https://www.itl.nist.gov/div898/handbook/pmd/section1/pmd141.htm', effectiveDate: 'Active NIST Standard', note: 'Covers OLS slope/intercept equations, R², and residual diagnostic assumptions.' },
      { name: 'Khan Academy / OpenStax Introductory Statistics — Linear Regression', organization: 'OpenStax / Rice University', url: 'https://openstax.org/details/books/introductory-statistics', effectiveDate: '2026', note: 'Open textbook reference for Pearson correlation and regression prediction.' },
    ],
    commonMistakes: {
      title: 'Blindly Extrapolating Predictions Far Outside the Observed X Domain',
      explanation: 'Linear trends often break down at extreme boundaries (saturation, biological limits, or exponential effects); predicting far past your largest observed X carries growing model risk.',
    },
    proTips: [
      'Always plot or inspect residuals visually if R² looks high—Anscombe’s Quartet proves curved relationships or one extreme outlier can mimic r = 0.82+.',
      'Pair regression analysis with our Standard Deviation Calculator and Z-Score Normal Distribution Calculator.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Applied Statistics Desk',
      reviewDate: 'November 2026',
      accuracyStandard: 'Verified against centered-moment NIST OLS sums of squares (Sxx, Syy, Sxy) and n−2 SEE.',
    },
    eeat: {
      authorRole: 'Numeriq Quantitative Statistics Team',
      reviewerRole: 'Numeriq Quantitative Validation Desk',
      methodology: 'Evaluates centered sample means, sums of squares Sxx/Syy/Sxy, OLS parameters b₁/b₀, Pearson r, R², residual SSE/(n−2) standard error, and point prediction.',
      lastVerifiedDate: '2026-11-20',
      taxOrRegulationYear: 'NIST Linear Regression Standards',
      limitations: [
        'Sensitive to extreme leverage outliers; assumes linear relationship, homoscedastic residuals, and independent observations.',
        'Requires equal-length lists of at least 2 distinct X observations.',
      ],
      nonAdviceDisclaimer: 'Statistical modeling tool only; verify residual assumptions and avoid blind out-of-sample extrapolation.',
    },
    relatedCalculatorSlugs: ['standard-deviation-calculator', 'ab-test-sample-size-calculator', 'normal-distribution-calculator', 'z-score-calculator'],
  },

  'bayes-theorem-calculator': {
    overview:
      'The Bayes’ Theorem & Diagnostic Probability Calculator computes exact Posterior Probability P(A|B) (Positive Predictive Value), Negative Predictive Value (NPV), False Positive Rate, and Positive/Negative Likelihood Ratios (LR+, LR−) from base prevalence, sensitivity, and specificity.',
    detailedExplanation:
      'Human intuition notoriously commits the "base-rate fallacy": if a screening test is 95% accurate (95% sensitivity, 92% specificity), most people assume a positive result means a ~95% chance the condition is present. In reality, when the underlying condition is rare (say 2% prevalence), false positives drawn from the 98% healthy majority outnumber true positives 4-to-1—leaving the true posterior probability at just 19.51%.',
    formulaDisplay: {
      formula: 'P(A|B) = [P(B|A)·P(A)] ÷ [P(B|A)·P(A) + P(B|¬A)·(1 − P(A))]',
      variableDefinitions: [
        { symbol: 'P(A)', name: 'Prior Prevalence', description: 'Baseline probability before observing test/signal', unit: '%' },
        { symbol: 'P(B|A)', name: 'Sensitivity (TPR)', description: 'Probability test signals positive when condition is truly present', unit: '%' },
        { symbol: 'P(¬B|¬A)', name: 'Specificity (TNR)', description: 'Probability test signals negative when condition is truly absent', unit: '%' },
      ],
    },
    workedExample: {
      scenario: 'A screening assay with 95% sensitivity and 92% specificity (8% false-positive rate) is applied to a population with 2.0% baseline prevalence.',
      inputs: [
        { name: 'Prior Prevalence P(A)', value: '2.0%' },
        { name: 'Sensitivity / Specificity', value: '95.0% / 92.0%' },
      ],
      steps: [
        'True Positives per 10,000 people: 200 affected × 95% = 190 True Positives (1.90%).',
        'False Positives per 10,000 people: 9,800 unaffected × (1 − 92%) = 784 False Positives (7.84%).',
        'Posterior Positive Predictive Value: 190 ÷ (190 + 784) = 19.51% (NPV = 99.89%; LR+ = 11.88, LR− = 0.054).',
      ],
      result: '19.51% Posterior Probability (PPV) · 99.89% NPV (190 TP vs 784 FP per 10k)',
      interpretation: 'Despite 95% sensitivity and 92% specificity, over 4 in 5 positive screening results are false alarms because only 2% of the population had the condition.',
    },
    regulatoryAndStandards: {
      title: 'Evidence-Based Medicine (EBM) Likelihood Ratios & STARD Terminology',
      description: 'Connects clinical biostatistics with Bayesian updating:',
      points: [
        'Positive Likelihood Ratio (LR+ = Sensitivity ÷ (1 − Specificity)): LR+ > 10 produces large shifts toward confirming disease; LR− < 0.1 strongly helps rule out disease.',
        'Natural Frequency Framing: Expressing probabilities out of 10,000 tested people (190 TP / 784 FP) eliminates cognitive confusion.',
        'Sequential Bayesian Updating: Your 19.51% posterior from Test 1 becomes the new prior P(A) when running an independent confirmatory Test 2.',
      ],
    },
    countryContext: {
      summary: 'Applies universal Bayesian inference conventions used in clinical diagnostics, spam filtering, fraud risk, and QA engineering:',
      markets: [
        { region: 'Global Clinical & Data Science', standard: 'Standard STARD PPV/NPV, LR+/LR−, and exact conditional probability calculus.', unitsOrCurrency: '% & Ratios', effectiveDate: '2026' },
      ],
    },
    references: [
      { name: 'An Essay Towards Solving a Problem in the Doctrine of Chances (Bayes / Price)', organization: 'Stanford Encyclopedia of Philosophy — Bayes’ Theorem', url: 'https://plato.stanford.edu/entries/bayes-theorem/', effectiveDate: '2026 Reference', note: 'Formal foundations of conditional updating, base rates, and likelihood ratios.' },
      { name: 'Diagnostic Test Accuracy: Sensitivity, Specificity, PPV and NPV', organization: 'Centre for Evidence-Based Medicine (Oxford CEBM)', url: 'https://www.cebm.ox.ac.uk/resources/ebm-tools/likelihood-ratios', effectiveDate: 'Active CEBM Tool', note: 'Likelihood ratio (LR+ / LR−) interpretation in diagnostic screening.' },
    ],
    commonMistakes: {
      title: 'Confusing Sensitivity P(Positive | Disease) With Positive Predictive Value P(Disease | Positive)',
      explanation: 'P(B|A) and P(A|B) are transposed conditionals—confusing them ignores base prevalence and wildly overstates confidence on rare events.',
    },
    proTips: [
      'Notice how feeding Test 1’s 19.51% PPV as the new Prior into an independent second test quickly boosts posterior certainty above 74%+.',
      'Use alongside our Normal Distribution Calculator and A/B Test Sample Size Calculator for statistical decision design.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Biostatistics & Decision Science Desk',
      reviewDate: 'November 2026',
      accuracyStandard: 'Verified against exact Bayes conditional law, NPV, LR+/LR−, and 10k frequency counts.',
    },
    eeat: {
      authorRole: 'Numeriq Biostatistics & Bayesian Inference Team',
      reviewerRole: 'Numeriq Quantitative Validation Desk',
      methodology: 'Evaluates joint true-positive and false-positive probabilities across prior prevalence, computing PPV, NPV, LR+, LR−, and expected TP/FP per 10,000.',
      lastVerifiedDate: '2026-11-20',
      taxOrRegulationYear: 'Oxford CEBM / STARD Statistical Conventions',
      limitations: [
        'Sequential updating assumes conditional independence between multiple tests given true state A.',
        'Real-world screening prevalence varies heavily across risk-stratified clinical cohorts vs. general populations.',
      ],
      nonAdviceDisclaimer: 'Statistical probability teaching and planning tool only; interpret diagnostic laboratory tests exclusively with your physician.',
    },
    relatedCalculatorSlugs: ['ab-test-sample-size-calculator', 'normal-distribution-calculator', 'binomial-distribution-probability-calculator', 'confidence-interval-calculator'],
  },

  'normal-distribution-calculator': {
    overview:
      'The Normal Distribution Probability & Z-Score Calculator evaluates cumulative left-tail percentiles P(X ≤ x), right-tail exceedance P(X > x), symmetric two-tail P-values P(|Z| ≥ |z|), and interval probabilities P(a ≤ X ≤ b) for any Gaussian distribution N(μ, σ²) using Abramowitz & Stegun’s high-precision error function.',
    detailedExplanation:
      'The Gaussian bell curve underpins IQ norms, manufacturing six-sigma quality tolerances, laboratory biomarker Z-scores, and finance/statistics hypothesis p-values. Standardizing any measurement X into Z = (X − μ) ÷ σ maps it onto the universal Standard Normal distribution N(0, 1), where cumulative areas follow the Empirical Rule (68.27% within ±1σ, 95.45% within ±2σ, 99.73% within ±3σ).',
    formulaDisplay: {
      formula: 'Z = (X − μ) ÷ σ   |   Φ(Z) = ½ · [1 + erf(Z ÷ √2)]',
      variableDefinitions: [
        { symbol: 'μ, σ', name: 'Mean & Standard Deviation', description: 'Center μ and spread σ (> 0) of normal distribution', unit: 'Data units' },
        { symbol: 'Z', name: 'Standardized Z-Score', description: 'Number of standard deviations X sits above or below μ', unit: 'σ units' },
        { symbol: 'Φ(Z)', name: 'Cumulative Normal CDF', description: 'Area under bell curve to the left of cutoff X', unit: '% or [0,1]' },
      ],
    },
    workedExample: {
      scenario: 'On a standardized cognitive scale modeled as Normal(μ = 100, σ = 15), compute the percentile rank and tail p-values for an observed score of X = 120.',
      inputs: [
        { name: 'Population Mean (μ) / SD (σ)', value: '100 / 15' },
        { name: 'Mode / Observed Value X', value: 'Single Cutoff / X = 120' },
      ],
      steps: [
        'Standardize cutoff: Z = (120 − 100) ÷ 15 = 20 ÷ 15 = +1.3333.',
        'Evaluate Abramowitz & Stegun Normal CDF Φ(1.3333): Left-tail P(X ≤ 120) = 90.8789% (~90.9th percentile).',
        'Derive complementary tails: Right-tail P(X > 120) = 9.1211%; Two-tailed P(|Z| ≥ 1.3333) = 18.2423%.',
      ],
      result: '90.879% Cumulative Percentile (Z = +1.3333 · Right Tail = 9.1211%)',
      interpretation: 'A score of 120 sits 1.33 standard deviations above the mean—higher than 90.88% of the reference population, with only 9.12% scoring higher.',
    },
    regulatoryAndStandards: {
      title: 'Abramowitz & Stegun 7.1.26 Numerical CDF Accuracy (< 1.5 × 10⁻⁷)',
      description: 'Implements deterministic analytical bell-curve integration without lookup tables:',
      points: [
        'High-Precision erf Approximation: Uses Abramowitz & Stegun equation 7.1.26 rational polynomial approximation, accurate to better than 1.5 parts in 10 million.',
        'Range Interval Mode: Switch "Probability Interval Mode" to compute exact between-bounds probability P(a ≤ X ≤ b) = Φ(Z_b) − Φ(Z_a).',
        'Two-Tailed p-Value: Reports 2 × min(Left, Right) automatically for standard two-sided Z hypothesis tests.',
      ],
    },
    countryContext: {
      summary: 'Follows universal ISO/NIST statistical probability and Z-score notation:',
      markets: [
        { region: 'Global Academic & Quality', standard: 'Standard Gaussian CDF Φ(z) used in Six Sigma tolerances, clinical Z-scores, and AP/University statistics.', unitsOrCurrency: '% & Z-Score', effectiveDate: '2026' },
      ],
    },
    references: [
      { name: 'NIST Digital Library of Mathematical Functions — Error Function (erf)', organization: 'National Institute of Standards and Technology (NIST)', url: 'https://dlmf.nist.gov/7.2', effectiveDate: '2026', note: 'Mathematical definition of erf and cumulative normal distribution.' },
      { name: 'NIST Handbook — Normal Distribution', organization: 'NIST / SEMATECH', url: 'https://www.itl.nist.gov/div898/handbook/eda/section3/eda3661.htm', effectiveDate: 'Active NIST Standard', note: 'Normal probability density, CDF properties, and empirical rules.' },
    ],
    commonMistakes: {
      title: 'Using Population Variance (σ²) Directly in the SD Box Without Taking the Square Root',
      explanation: 'Notice σ is Standard Deviation, not Variance σ². Entering Variance = 225 instead of σ = √225 = 15 will severely distort Z-scores.',
    },
    proTips: [
      'Toggle to "Range Interval P(a ≤ X ≤ b)" to verify the Empirical Rule cleanly (try a=85, b=115 on μ=100, σ=15 → 68.269%).',
      'First compute sample Mean and SD from raw lists using our Standard Deviation Calculator, then evaluate tail probabilities here.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Mathematical Statistics Desk',
      reviewDate: 'November 2026',
      accuracyStandard: 'Verified against Abramowitz & Stegun 7.1.26 rational polynomial (<1.5e-7 error).',
    },
    eeat: {
      authorRole: 'Numeriq Applied Probability & Statistics Team',
      reviewerRole: 'Numeriq Quantitative Validation Desk',
      methodology: 'Standardizes single or bounded X values into Z-scores and integrates the Standard Normal CDF via Abramowitz & Stegun 7.1.26.',
      lastVerifiedDate: '2026-11-20',
      taxOrRegulationYear: 'NIST Normal CDF Reference Standard',
      limitations: [
        'Appropriate for normally distributed data or large-sample means (via Central Limit Theorem); skewed small samples require t or non-parametric distributions.',
      ],
      nonAdviceDisclaimer: 'Statistical computation tool only; verify normality assumptions and degrees of freedom in formal scientific studies.',
    },
    relatedCalculatorSlugs: ['z-score-calculator', 'standard-deviation-calculator', 'confidence-interval-calculator', 'ab-test-sample-size-calculator'],
  },

  'matrix-calculator': {
    overview:
      'The Matrix Determinant & Inverse Calculator solves the exact Determinant det(A), Matrix Trace tr(A), and full Multiplicative Inverse Matrix A⁻¹ (or 2×2 Adjugate) for both 2 × 2 and 3 × 3 square real matrices.',
    detailedExplanation:
      'A square linear system Ax = b has a unique solution x = A⁻¹b if and only if its determinant det(A) is non-zero. Geometrically, |det(A)| equals the area (in 2D) or volume (in 3D) scaling factor of the linear transformation. When det(A) = 0, the transformation collapses space onto a lower dimension—making the matrix singular with no inverse. This tool switches dynamically between 4-cell 2×2 mode and 9-cell 3×3 cofactor expansion mode.',
    formulaDisplay: {
      formula: 'A⁻¹ = (1 ÷ det(A)) × adj(A)   |   Invertible iff det(A) ≠ 0',
      variableDefinitions: [
        { symbol: 'det(A)', name: 'Matrix Determinant', description: '2×2: ad − bc; 3×3: cofactor expansion along Row 1', unit: 'Scalar' },
        { symbol: 'adj(A)', name: 'Adjugate Matrix', description: 'Transpose of the 3×3 cofactor sign-matrix Cᵀ', unit: 'Matrix' },
        { symbol: 'tr(A)', name: 'Matrix Trace', description: 'Sum of main diagonal elements a₁₁ + a₂₂ (+ a₃₃)', unit: 'Scalar' },
      ],
    },
    workedExample: {
      scenario: 'Finding the determinant, trace, and inverse A⁻¹ of the 3 × 3 matrix with rows [4, 7, 2], [2, 6, 1], and [1, 0, 3].',
      inputs: [
        { name: 'Dimension / Row 1', value: '3 × 3 / [4, 7, 2]' },
        { name: 'Row 2 / Row 3', value: '[2, 6, 1] / [1, 0, 3]' },
      ],
      steps: [
        'Evaluate Row 1 cofactors: C₁₁ = 6(3)−1(0) = 18; C₁₂ = −(2(3)−1(1)) = −5; C₁₃ = 2(0)−6(1) = −6.',
        'Compute Determinant: det(A) = 4(18) + 7(−5) + 2(−6) = 72 − 35 − 12 = 25 (Invertible; Trace = 4 + 6 + 3 = 13).',
        'Transpose full cofactor matrix and divide by 25 → A⁻¹ = [0.72, −0.84, −0.2] | [−0.2, 0.4, 0] | [−0.24, 0.28, 0.4].',
      ],
      result: 'det(A) = 25 (Invertible · tr(A) = 13 · Exact A⁻¹ Computed)',
      interpretation: 'Multiplying original matrix A by A⁻¹ reconstructs the 3 × 3 identity matrix I₃ exactly (e.g., Row 1 · Col 1 = 4(0.72) + 7(−0.2) + 2(−0.24) = 1.00).',
    },
    regulatoryAndStandards: {
      title: 'Exact Cofactor Adjugate Linear Algebra Verification',
      description: 'Guarantees algebraically clean 2×2 and 3×3 results:',
      points: [
        'Singularity Threshold: Protects against division by zero whenever |det(A)| ≤ 10⁻¹² and clearly labels singular non-invertible matrices.',
        'Dynamic Dimension Switcher: Selecting "2 × 2 Matrix" cleanly hides unused Row 3 / Column 3 inputs.',
        'Identity Verification: Notice A·A⁻¹ = I across every invertible matrix.',
      ],
    },
    countryContext: {
      summary: 'Follows standard international linear algebra row-column (a_ij) indexing conventions:',
      markets: [
        { region: 'Global STEM & Engineering', standard: 'Standard row-major matrix indexing (a_row,col) taught in university Linear Algebra, Robotics, and FEA courses.', unitsOrCurrency: 'Dimensionless', effectiveDate: '2026' },
      ],
    },
    references: [
      { name: 'MIT OpenCourseWare 18.06 — Linear Algebra (Determinants & Inverses)', organization: 'Massachusetts Institute of Technology (MIT)', url: 'https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/', effectiveDate: 'Open STEM Standard', note: 'Definitive course reference on cofactors, adjugates, and invertible matrices.' },
      { name: 'NIST Digital Library — Matrices and Linear Systems', organization: 'NIST', url: 'https://math.nist.gov/', effectiveDate: '2026', note: 'Numerical stability and linear system conditioning standards.' },
    ],
    commonMistakes: {
      title: 'Forgetting the Transpose Step When Forming the Adjugate Matrix From Cofactors',
      explanation: 'Dividing the raw cofactor matrix by det(A) without transposing rows and columns produces (A⁻¹)ᵀ instead of A⁻¹ on non-symmetric matrices.',
    },
    proTips: [
      'Watch out for ill-conditioned matrices where det(A) is tiny relative to entry magnitudes (e.g., 10⁻⁹)—numerical roundoff sensitivity rises sharply.',
      'Pair linear system work with our Quadratic Formula Calculator and Linear Regression Calculator.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Linear Algebra & STEM Desk',
      reviewDate: 'November 2026',
      accuracyStandard: 'Verified against exact analytical 2×2 and 3×3 Laplace cofactor expansions.',
    },
    eeat: {
      authorRole: 'Numeriq Computational Mathematics Team',
      reviewerRole: 'Numeriq Quantitative Validation Desk',
      methodology: 'Evaluates exact analytical 2×2 determinant/adjugate and 3×3 cofactor matrix transpose with strict singularity guarding (|det| ≤ 1e-12).',
      lastVerifiedDate: '2026-11-20',
      taxOrRegulationYear: 'ISO/MIT Linear Algebra Standards',
      limitations: [
        'Supports square 2 × 2 and 3 × 3 real matrices; rectangular or 4×4+ matrices require LU/QR decomposition.',
      ],
      nonAdviceDisclaimer: 'Educational and engineering computation tool only.',
    },
    relatedCalculatorSlugs: ['linear-regression-calculator', 'quadratic-formula-calculator', 'scientific-calculator', 'gcd-lcm-prime-calculator'],
  },

  'gcd-lcm-prime-calculator': {
    overview:
      'The GCD, LCM & Prime Factorization Calculator computes the Greatest Common Divisor (GCD), Least Common Multiple (LCM), coprime status, and canonical prime-power factorizations for two or more positive integers up to 10¹² using Euclid’s algorithm.',
    detailedExplanation:
      'Any integer greater than 1 decomposes uniquely into a product of prime powers (the Fundamental Theorem of Arithmetic). Computing GCD via Euclid’s repeated remainder division takes logarithmic steps—instantly simplifying fractions, synchronizing periodic gears/schedules via LCM = (a ÷ GCD) × b, and decomposing numbers into canonical prime exponents.',
    formulaDisplay: {
      formula: 'GCD(a, b) = GCD(b, a mod b)   |   LCM(a, b) = (a ÷ GCD(a, b)) × b',
      variableDefinitions: [
        { symbol: 'GCD', name: 'Greatest Common Divisor', description: 'Largest integer dividing every number in the set evenly', unit: 'Integer' },
        { symbol: 'LCM', name: 'Least Common Multiple', description: 'Smallest positive integer divisible by every input integer', unit: 'Integer' },
        { symbol: 'Coprime', name: 'Relatively Prime Check', description: 'True when the set shares no common prime factor > 1 (GCD = 1)', unit: 'Boolean' },
      ],
    },
    workedExample: {
      scenario: 'Finding GCD, LCM, and prime-power factorizations for the integer set 24, 36, and 60.',
      inputs: [
        { name: 'Positive Integers List', value: '24, 36, 60' },
      ],
      steps: [
        'Prime Factorizations: 24 = 2³ × 3; 36 = 2² × 3²; 60 = 2² × 3 × 5.',
        'Pairwise Euclidean GCD: GCD(24, 36) = 12 → GCD(12, 60) = 12 (2² × 3, intersecting minimum prime exponents).',
        'Pairwise Overflow-Safe LCM: LCM(24, 36) = (24 ÷ 12) × 36 = 72 → LCM(72, 60) = (72 ÷ 12) × 60 = 360 (taking maximum prime exponents 2³ × 3² × 5).',
      ],
      result: 'GCD = 12 (2² × 3) · LCM = 360 (Not Coprime)',
      interpretation: 'All three numbers reduce cleanly by 12, and repeating cycles of 24, 36, and 60 align simultaneously every 360 steps.',
    },
    regulatoryAndStandards: {
      title: 'Euclidean Algorithm & Overflow-Safe Pairwise LCM',
      description: 'Implements mathematically rigorous number-theory conventions:',
      points: [
        'Divide-Before-Multiply Guard: Computing (a ÷ GCD) × b prevents premature integer overflow on large multi-number inputs.',
        'Bounded Factorization Safety: Restricts inputs to positive integers ≤ 10¹² so √n ≤ 10⁶ executes instantaneously without hanging browser threads.',
        'Multi-Number Generalization: Works seamlessly across 2, 3, 4, or more comma- or space-separated integers.',
      ],
    },
    countryContext: {
      summary: 'Follows universal K–12, Olympiad, and University discrete mathematics notation:',
      markets: [
        { region: 'Global Mathematics Education', standard: 'Standard US/UK/Commonwealth HCF/GCD and LCM prime-exponent notation.', unitsOrCurrency: 'Exact Integers', effectiveDate: '2026' },
      ],
    },
    references: [
      { name: 'NIST Dictionary of Algorithms — Euclidean Algorithm', organization: 'National Institute of Standards and Technology (NIST)', url: 'https://xlinux.nist.gov/dads/HTML/euclidAlgo.html', effectiveDate: '2026', note: 'Reference specification for iterative Greatest Common Divisor computation.' },
      { name: 'Fundamental Theorem of Arithmetic & Prime Factorization', organization: 'OpenStax / Wolfram MathWorld Standard', url: 'https://openstax.org/', effectiveDate: '2026', note: 'Unique prime decomposition properties governing GCD and LCM.' },
    ],
    commonMistakes: {
      title: 'Computing GCD × LCM = a × b Across Three Numbers Instead of Strictly Two',
      explanation: 'The identity a × b = GCD(a,b) × LCM(a,b) holds ONLY for two numbers—for three numbers (24, 36, 60), 12 × 360 = 4,320 whereas 24 × 36 × 60 = 51,840.',
    },
    proTips: [
      'Check if gear tooth counts or cyclical maintenance schedules share a common factor—making counts coprime (GCD = 1) evenly distributes wear.',
      'Pair integer factoring with our Fraction Calculator and Percentage Calculator.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Number Theory & STEM Desk',
      reviewDate: 'November 2026',
      accuracyStandard: 'Verified against iterative Euclidean remainder division and bounded prime trial division.',
    },
    eeat: {
      authorRole: 'Numeriq Discrete Mathematics Team',
      reviewerRole: 'Numeriq Quantitative Validation Desk',
      methodology: 'Iterates pairwise Euclidean GCD and overflow-guarded LCM across positive integers ≤ 10¹², emitting prime-power decompositions.',
      lastVerifiedDate: '2026-11-20',
      taxOrRegulationYear: 'NIST Euclidean Number Theory Standards',
      limitations: [
        'Accepts positive integers between 1 and 1,000,000,000,000 (10¹²); decimals and negatives are rejected cleanly.',
      ],
      nonAdviceDisclaimer: 'Mathematical computation tool only.',
    },
    relatedCalculatorSlugs: ['fraction-calculator', 'matrix-calculator', 'scientific-calculator', 'quadratic-formula-calculator'],
  },

  'ideal-gas-law-calculator': {
    overview:
      'The Ideal Gas Law (PV = nRT) Calculator solves any missing state variable—Pressure (kPa / atm / psi), Volume (L / m³ / gal), Moles (mol), or Temperature (°C / K / °F)—using the exact CODATA SI molar gas constant R = 8.3144626 L·kPa·K⁻¹·mol⁻¹.',
    detailedExplanation:
      'Combining Boyle’s, Charles’s, Avogadro’s, and Gay-Lussac’s laws into one equation of state (PV = nRT), the Ideal Gas Law links gas pressure, container volume, chemical amount, and absolute Kelvin temperature. Selecting which variable to solve dynamically hides that field and converts Celsius smoothly to absolute Kelvin (+273.15 K) so stoichiometric chemistry and engineering thermodynamics stay dimensionally exact.',
    formulaDisplay: {
      formula: 'P·V = n·R·T   (R = 8.314462618 L·kPa·K⁻¹·mol⁻¹ · T_K = T_°C + 273.15)',
      variableDefinitions: [
        { symbol: 'P, V', name: 'Pressure & Volume', description: 'Absolute pressure in kPa and container volume in Liters', unit: 'kPa, L' },
        { symbol: 'n', name: 'Chemical Amount', description: 'Number of moles of gas molecules (1 mol ≈ 6.022×10²³ molecules)', unit: 'mol' },
        { symbol: 'T', name: 'Absolute Temperature', description: 'Celsius + 273.15 Kelvin (must exceed absolute zero 0 K)', unit: 'K (°C)' },
      ],
    },
    workedExample: {
      scenario: 'Solving absolute gas pressure when 1.0 mole of an ideal gas occupies 22.414 Liters at 25.0 °C (standard laboratory room temperature).',
      inputs: [
        { name: 'Solve For / Amount / Volume', value: 'Pressure (P) / 1.0 mol / 22.414 L' },
        { name: 'Temperature', value: '25.0 °C (298.15 K)' },
      ],
      steps: [
        'Convert to Absolute Kelvin: 25.0 + 273.15 = 298.15 K.',
        'Solve P = (n · R · T) ÷ V = (1.0 × 8.3144626 × 298.15) ÷ 22.414 = 2,478.957 ÷ 22.414 = 110.599 kPa.',
        'Convert Pressure Units: 110.599 ÷ 101.325 = 1.0915 atm (16.04 psi).',
      ],
      result: '110.599 kPa Absolute Pressure (1.0915 atm · 16.04 psi · 298.15 K)',
      interpretation: 'Because 22.414 L is the molar volume at 0 °C (273.15 K, 1 atm), warming the rigid cylinder from 0 °C to 25 °C increases pressure proportionally by 9.15% to 1.0915 atm.',
    },
    regulatoryAndStandards: {
      title: '2019 SI Redefinition CODATA Molar Gas Constant & IUPAC STP',
      description: 'Built on exact international metrological constants:',
      points: [
        'Exact CODATA R Constant: Following the 2019 SI redefinition of the Boltzmann constant k_B and Avogadro constant N_A, R = N_A × k_B = 8.31446261815324 J·mol⁻¹·K⁻¹ exactly.',
        'IUPAC STP vs. Classical STP: Classical STP (0 °C, 101.325 kPa) yields 22.414 L/mol; modern IUPAC STP (0 °C, 100.000 kPa bar) yields 22.711 L/mol.',
        'Absolute Pressure Check: Enter absolute pressure (gauge pressure + 101.325 kPa atmospheric baseline), not raw tire-gauge pressure.',
      ],
    },
    countryContext: {
      summary: 'Follows global IUPAC SI chemistry standards while translating results to imperial psi, °F, and US gallons:',
      markets: [
        { region: 'Global Chemistry & Engineering', standard: 'Exact CODATA SI R constant (kPa·L·mol⁻¹·K⁻¹) plus automated atm and US psi/gallon conversions.', unitsOrCurrency: 'kPa, atm, psi, L & K', effectiveDate: '2019–2026 CODATA' },
      ],
    },
    references: [
      { name: 'CODATA Value: Molar Gas Constant R', organization: 'National Institute of Standards and Technology (NIST)', url: 'https://physics.nist.gov/cgi-bin/cuu/Value?r', effectiveDate: '2018/2026 CODATA', note: 'Exact SI value 8.314 462 618 J mol⁻¹ K⁻¹.' },
      { name: 'IUPAC Compendium of Chemical Terminology (Gold Book) — Ideal Gas & STP', organization: 'International Union of Pure and Applied Chemistry (IUPAC)', url: 'https://goldbook.iupac.org/', effectiveDate: '2026', note: 'Standard pressure/temperature definitions and equation of state limits.' },
    ],
    commonMistakes: {
      title: 'Plugging Celsius (°C) or Fahrenheit Directly Into PV = nRT Without Converting to Kelvin',
      explanation: 'At 0 °C, failing to add 273.15 evaluates P = 0 instead of 1 atm! Always use absolute Kelvin temperatures on thermodynamic gas ratios.',
    },
    proTips: [
      'Switch the dropdown to solve Volume, Moles, or Temperature cleanly without rewriting algebra.',
      'Combine stoichiometric gas mole counts with solution concentrations using our Molarity Calculator and pH Calculator.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Chemistry & Thermodynamics Desk',
      reviewDate: 'November 2026',
      accuracyStandard: 'Verified against exact CODATA R = 8.314462618 J/(mol·K) and IUPAC conversions.',
    },
    eeat: {
      authorRole: 'Numeriq Physical Chemistry & Engineering Team',
      reviewerRole: 'Numeriq Quantitative Validation Desk',
      methodology: 'Solves any one of four state variables in PV = nRT using exact CODATA R, Kelvin offset (+273.15), and multi-unit engineering conversions.',
      lastVerifiedDate: '2026-11-20',
      taxOrRegulationYear: '2019–2026 CODATA / IUPAC SI Standard',
      limitations: [
        'Assumes ideal non-interacting point-particle gas; high pressures (>20–50 atm) or near-condensation temperatures deviate per the Van der Waals / compressibility factor Z.',
      ],
      nonAdviceDisclaimer: 'Scientific and educational equation solver only; high-pressure vessel design requires real-gas equations of state and ASME safety factors.',
    },
    relatedCalculatorSlugs: ['molarity-calculator', 'ph-calculator', 'kinetic-energy-calculator', 'unit-converter'],
  },

  'decibel-calculator': {
    overview:
      'The Decibel (dB), dBm & Sound Attenuation Calculator computes logarithmic Power Gain/Loss (10·log₁₀ P₂/P₁ + dBm), Voltage / Sound Pressure Amplitude Ratios (20·log₁₀ V₂/V₁), and Free-Field Acoustic Inverse-Square Distance Drop (−20·log₁₀ r₂/r₁).',
    detailedExplanation:
      'Because human hearing and RF signal links span orders of magnitude—from microWatts to kilowatts, or faint leaves (20 dB SPL) to jet engines (130 dB SPL)—engineers compress multiplicative ratios onto the logarithmic decibel scale. Crucially, Power ratios multiply log₁₀ by 10 (doubling power ≈ +3.01 dB), whereas root-power field quantities like Voltage or Sound Pressure multiply log₁₀ by 20 (doubling amplitude ≈ +6.02 dB).',
    formulaDisplay: {
      formula: 'Power: 10·log₁₀(P₂/P₁)   |   Voltage/SPL: 20·log₁₀(V₂/V₁)   |   Distance: SPL₁ − 20·log₁₀(r₂/r₁)',
      variableDefinitions: [
        { symbol: 'P₁, P₂', name: 'Input & Output Power', description: 'Power in Watts; dBm = 10·log₁₀(P₂ × 1,000) re 1 mW', unit: 'W / dBm' },
        { symbol: 'V₁, V₂', name: 'Amplitude / Pressure', description: 'RMS voltage or sound pressure amplitude ratio', unit: 'V or Pa' },
        { symbol: 'r₁, r₂', name: 'Acoustic Distances', description: 'Free-field inverse-square −6.02 dB per doubling of distance', unit: 'meters' },
      ],
    },
    workedExample: {
      scenario: 'Comparing a 0.001 W (1 mW) RF input signal amplified to 0.1 W (100 mW) output in Power Gain mode.',
      inputs: [
        { name: 'Mode / Reference P₁', value: 'Power Ratio Gain / 0.001 W (1 mW)' },
        { name: 'Measured Output P₂', value: '0.1 W (100 mW)' },
      ],
      steps: [
        'Compute Power Ratio: P₂ ÷ P₁ = 0.1 ÷ 0.001 = 100× linear gain.',
        'Evaluate Logarithmic Gain: 10 × log₁₀(100) = 10 × 2 = +20.00 dB.',
        'Compute Absolute dBm Level: 10 × log₁₀(0.1 × 1,000 mW) = +20.00 dBm (re 1 mW).',
      ],
      result: '+20.00 dB Power Gain (100x Ratio · +20.00 dBm)',
      interpretation: 'Every +10 dB multiplies power by 10× (+20 dB = 100×, +30 dB = 1,000×); in acoustic Distance Drop mode, stepping from 2m to 20m drops free-field noise by −20.00 dB.',
    },
    regulatoryAndStandards: {
      title: 'ANSI/ASA Acoustics, IEEE RF Power & NIOSH Noise Exposure Benchmarks',
      description: 'Connects engineering decibel formulas with workplace and RF standards:',
      points: [
        '10× vs. 20× Law: Power ∝ Amplitude², so log₁₀(P₂/P₁) = log₁₀((V₂/V₁)²) = 2·log₁₀(V₂/V₁)—accounting for the factor of 20 on voltage and sound pressure.',
        'Free-Field −6 dB Rule: Doubling distance from an outdoor point-source speaker reduces SPL by −20·log₁₀(2) = −6.02 dB (ignoring room reflections).',
        'NIOSH Noise Limit: 85 dBA is the 8-hour recommended exposure limit, with allowed duration halving every +3 dB increase (equal-energy rule).',
      ],
    },
    countryContext: {
      summary: 'Applies universal SI logarithmic decibel conventions across telecom RF, live audio, and occupational acoustics:',
      markets: [
        { region: 'Global RF & Acoustics', standard: 'ANSI/IEC 61672 SPL weighting, 1 mW RF dBm reference, and OSHA/NIOSH industrial sound limits.', unitsOrCurrency: 'dB, dBm & dB SPL', effectiveDate: '2026 ANSI/IEC' },
      ],
    },
    references: [
      { name: 'Noise and Occupational Hearing Loss Prevention', organization: 'CDC / NIOSH', url: 'https://www.cdc.gov/niosh/topics/noise/', effectiveDate: '2026', note: 'Covers the 85 dBA 8-hour REL and 3 dB exchange rate physics.' },
      { name: 'NIST Units & Logarithmic Quantities', organization: 'NIST', url: 'https://physics.nist.gov/cuu/Units/', effectiveDate: '2026', note: 'International definitions of dimensionless logarithmic ratios (bel/decibel).' },
    ],
    commonMistakes: {
      title: 'Adding Two 80 dB Sound Sources Together as "160 dB"',
      explanation: 'Decibels add logarithmically, not linearly! Two identical uncorrelated 80 dB machines double acoustic power (+3.01 dB), yielding 83.0 dB—not 160 dB.',
    },
    proTips: [
      'Switch to "Free-Field Acoustic Distance Drop" to plan PA speaker coverage or estimate neighborhood noise falloff by distance.',
      'Remember +3 dB ≈ 2× power, +6 dB ≈ 2× voltage/pressure, and +10 dB ≈ 10× power (roughly perceived as twice as loud by human ears).',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Acoustics & RF Engineering Desk',
      reviewDate: 'November 2026',
      accuracyStandard: 'Verified against IEEE/IEC 10·log₁₀ power, 20·log₁₀ field, and inverse-square SPL equations.',
    },
    eeat: {
      authorRole: 'Numeriq Signals & Acoustics Engineering Team',
      reviewerRole: 'Numeriq Quantitative Validation Desk',
      methodology: 'Branches across power-ratio dB/dBm, field-amplitude 20·log₁₀ dB, and free-field −20·log₁₀(r₂/r₁) geometric spreading attenuation.',
      lastVerifiedDate: '2026-11-20',
      taxOrRegulationYear: 'IEC 61672 / IEEE RF Decibel Standards',
      limitations: [
        'Free-field distance attenuation neglects indoor room reverberation, ground absorption, wind refraction, and barrier diffraction.',
        'dBm assumes consistent impedance across compared nodes.',
      ],
      nonAdviceDisclaimer: 'Acoustics and signal engineering calculator only; measure workplace sound exposure with a calibrated Class 1/2 SPL meter.',
    },
    relatedCalculatorSlugs: ['ohms-law-calculator', 'logarithm-calculator', 'velocity-calculator', 'scientific-calculator'],
  },
};
