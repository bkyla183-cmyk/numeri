import type { FAQItem } from '../calculatorFaqs.ts';

export const batch3Faqs: Record<string, FAQItem[]> = {
  'corrected-calcium-calculator': [
    {
      question: 'Why do clinicians correct total serum calcium for low albumin?',
      answer: 'Approximately 40%–45% of blood calcium is bound to serum albumin, while only free ionized calcium (~50%) is physiologically active. When albumin drops below 4.0 g/dL (40 g/L), measured total calcium falls artificially even though ionized calcium may still be completely normal—Payne’s equation adjusts +0.8 mg/dL per 1.0 g/dL albumin deficit.',
    },
    {
      question: 'How do US Conventional units (mg/dL, g/dL) convert to UK/CA/AU SI units (mmol/L, g/L)?',
      answer: 'Switch the Laboratory Unit Standard dropdown between US and SI: 1 mmol/L calcium equals 4.008 mg/dL, and 1 g/dL albumin equals 10 g/L. The SI Payne formula adds 0.02 mmol/L for every 1 g/L drop below 40 g/L albumin.',
    },
    {
      question: 'When is the Payne calcium correction unreliable?',
      answer: 'In critically ill ICU patients, severe chronic kidney disease, acute acid-base shifts (alkalosis increases protein binding), or multiple myeloma, albumin-corrected formulas diverge from true free calcium. Order a direct blood-gas ionized calcium (Ca²⁺) test in those settings.',
    },
  ],
  'egfr-creatinine-clearance-calculator': [
    {
      question: 'What changed in the 2021 CKD-EPI Creatinine Equation?',
      answer: 'Endorsed by the National Kidney Foundation (NKF) and American Society of Nephrology (ASN), the 2021 CKD-EPI equation eliminated the legacy Black-race multiplier and recalibrated sex-specific spline constants (κ = 0.7 female / 0.9 male) so kidney staging applies equitably without race.',
    },
    {
      question: 'When should I use Cockcroft-Gault CrCl instead of 2021 CKD-EPI eGFR?',
      answer: '2021 CKD-EPI (in mL/min/1.73m²) is the gold standard for diagnosing and staging Chronic Kidney Disease (G1–G5), whereas hospital pharmacists and FDA drug labels frequently specify non-indexed Cockcroft-Gault Creatinine Clearance (mL/min using Ideal or Adjusted Body Weight) for renally cleared antibiotics and anticoagulants.',
    },
    {
      question: 'Can eGFR equations be used during Acute Kidney Injury (AKI)?',
      answer: 'No. Both CKD-EPI and Cockcroft-Gault assume stable, steady-state serum creatinine. When kidney function changes rapidly hour-by-hour in AKI, creatinine lags behind true filtration and clinical urine output or timed clearance is required.',
    },
  ],
  'race-time-predictor-calculator': [
    {
      question: 'How accurate is Riegel’s fatigue exponent (k = 1.06) for marathon prediction?',
      answer: 'Peter Riegel’s T₂ = T₁ × (D₂/D₁)^1.06 accurately predicts equivalent endurance capability when a runner trains specifically for the longer target race. High-mileage marathoners may achieve k = 1.04–1.05, whereas low-mileage runners stepping up from a 5K often slow closer to k = 1.08–1.10.',
    },
    {
      question: 'How does the Dave Cameron model differ from Riegel’s formula?',
      answer: 'Riegel uses a fixed power-law exponent across all distances, whereas Dave Cameron’s nonlinear mile regression slightly slows marathon projections relative to 5K/10K speeds, providing a useful conservative second check.',
    },
    {
      question: 'Should I adjust predicted marathon pace for race-day heat or hills?',
      answer: 'Yes. Both formulas assume flat, cool road-race conditions (~50°F / 10°C). Warmer temperatures, high humidity, headwinds, or significant elevation gain require slowing early splits appropriately.',
    },
  ],
  'vo2-max-calculator': [
    {
      question: 'Which VO2 Max field test should I choose: Cooper, Rockport, or Uth Heart Rate Ratio?',
      answer: 'Well-conditioned runners can run an all-out 12-minute Cooper track test for high correlation with lab testing. Beginners or older adults should pick the submaximal Rockport 1-Mile Fitness Walk, while anyone tracking morning resting pulse can use the non-exercise Uth–Sørensen HR Ratio.',
    },
    {
      question: 'What is a healthy VO2 Max and how do METs relate to it?',
      answer: 'Divide VO2 Max by 3.5 mL/kg/min to get Peak METs (Metabolic Equivalents). Reaching 10+ METs (≥35 mL/kg/min) is strongly linked by the AHA with lower cardiovascular mortality, while 45–55+ mL/kg/min represents strong endurance conditioning.',
    },
    {
      question: 'Why does this calculator use Tanaka (208 − 0.7×Age) instead of 220 − Age?',
      answer: 'Peer-reviewed studies demonstrate the traditional 220 − Age rule underestimates maximal heart rate in older adults and overestimates it in younger athletes. Tanaka’s 208 − 0.7×Age provides tighter population accuracy across ages 15–90.',
    },
  ],
  'bac-calculator': [
    {
      question: 'Why do US, Australia/NZ, and UK standard drinks give different BAC estimates?',
      answer: 'A US Standard Drink contains 14 grams of pure ethanol, an Australia/NZ Standard Drink contains 10 grams, and a UK Alcohol Unit contains 8 grams. Selecting your exact regional standard ensures 3 drinks aren’t miscounted by 40%–75%.',
    },
    {
      question: 'Why does the Widmark factor differ between biological males (0.68) and females (0.55)?',
      answer: 'Ethanol dissolves in total body water rather than body fat. Because average female physiology carries a slightly lower total-body-water fraction per kilogram, an identical dose of pure alcohol produces a higher blood concentration.',
    },
    {
      question: 'Can coffee, water, or exercise speed up alcohol elimination below 0.015%/hr?',
      answer: 'No. Caffeine masks drowsiness without lowering BAC; human liver ADH enzymes metabolize alcohol at a nearly fixed zero-order rate (~0.015%/hr), meaning only elapsed time restores sobriety.',
    },
  ],
  'waist-to-height-ratio-calculator': [
    {
      question: 'Why does UK NICE NG246 recommend keeping Waist-to-Height Ratio below 0.50?',
      answer: 'Keeping waist circumference under half your height (WHtR < 0.50) correlates more strongly with visceral organ fat, insulin resistance, and heart disease than BMI alone—and the 0.50 cutoff applies uniformly across men, women, and diverse ethnic backgrounds.',
    },
    {
      question: 'What is the difference between Waist-to-Height Ratio (WHtR) and Waist-to-Hip Ratio (WHR)?',
      answer: 'WHtR measures central abdominal fat relative to fixed skeletal height (NICE healthy 0.40–0.49), while WHR compares waist circumference to hip width (WHO elevated risk >0.90 men / >0.85 women) to distinguish apple- vs. pear-shaped fat distribution.',
    },
    {
      question: 'Where should I place the tape measure for an accurate reading?',
      answer: 'Stand relaxed without sucking in your stomach and measure horizontally at the end of a normal exhale—midway between your lowest palpable rib and the top of your hip bone (iliac crest), roughly level with the navel.',
    },
  ],
  'one-rep-max-calculator': [
    {
      question: 'Why does this calculator average Brzycki, Epley, and Lombardi instead of showing only one formula?',
      answer: 'Each formula behaves slightly differently across rep ranges: Epley tracks linearly, Brzycki steepens slightly past 8 reps, and Lombardi scales smoothly at low reps. Averaging all three cancels individual curve bias across 2–10 repetitions.',
    },
    {
      question: 'Why is the repetition input capped at 15 clean reps?',
      answer: 'Repetition-to-1RM prediction equations lose physiological validity beyond 12–15 reps because high-rep failure measures muscular glycogen endurance rather than peak maximal neural recruitment.',
    },
    {
      question: 'How do I use the 70%, 80%, and 90% training loads shown in the results?',
      answer: 'Use 85%–90%+ for low-rep maximal strength blocks (2–4 reps), 75%–82% for balanced power/hypertrophy sets (6–8 reps), and 65%–72% for higher-volume hypertrophy work (10–12 reps).',
    },
  ],
  'mean-arterial-pressure-calculator': [
    {
      question: 'Why is Mean Arterial Pressure (MAP) calculated as DBP + ⅓(SBP − DBP) instead of averaging SBP and DBP?',
      answer: 'At normal resting heart rates (~60–75 bpm), the heart spends roughly two-thirds of each heartbeat relaxing in diastole and only one-third contracting in systole, weighting perfusion pressure toward diastolic pressure.',
    },
    {
      question: 'What is the minimum healthy Mean Arterial Pressure for organ perfusion?',
      answer: 'Normal resting adult MAP typically ranges between 70 and 100 mmHg. In critical care, Surviving Sepsis guidelines target MAP ≥ 65 mmHg because dropping below 60 mmHg risks acute kidney, cerebral, and coronary hypoperfusion.',
    },
    {
      question: 'What does Razminia Heart-Rate-Adjusted MAP show in Advanced Inputs?',
      answer: 'During tachycardia (>100 bpm), diastole shortens relative to systole. Razminia’s equation replaces the fixed 0.33 systolic weight with (0.33 + 0.0012 × HeartRate), giving a closer match to invasive catheter MAP at fast heart rates.',
    },
  ],
  'pediatric-fluid-calculator': [
    {
      question: 'Why does 64 mL/hr × 24 hours (1,536 mL) differ slightly from 1,580 mL/day on a 24 kg child?',
      answer: 'This is a classic pediatric arithmetic distinction: Holliday-Segar’s daily 100-50-20 mL/kg rule rounds 4×24 = 96 up to 100, 2×24 = 48 up to 50, and 1×24 = 24 down to 20. Our calculator displays both the exact hourly 4-2-1 pump rate and the 100-50-20 daily total.',
    },
    {
      question: 'Can Holliday-Segar 4-2-1 be used for newborns under 28 days old?',
      answer: 'No. Preterm and term neonates (<28 days old) follow specialized day-of-life total fluid allowances (starting ~60–80 mL/kg/day on Day 1) rather than standard Holliday-Segar maintenance.',
    },
    {
      question: 'What type of IV fluid does the AAP recommend with Holliday-Segar rates?',
      answer: 'For pediatric patients aged 28 days to 18 years, the American Academy of Pediatrics recommends isotonic maintenance IV solutions (with appropriate potassium and dextrose) rather than hypotonic saline to prevent iatrogenic hyponatremia.',
    },
  ],
  'sleep-cycle-calculator': [
    {
      question: 'Why does aligning sleep with 90-minute cycles reduce morning grogginess?',
      answer: 'Each complete ~90-minute sleep cycle transitions from deep slow-wave NREM sleep into lighter REM and brief micro-arousal. Setting your alarm near the end of cycle 5 (7.5h) or cycle 6 (9.0h) avoids waking mid-deep-sleep (sleep inertia).',
    },
    {
      question: 'Why does the calculator subtract an extra 15 minutes for Sleep Onset Latency?',
      answer: 'Even good sleepers rarely fall into Stage 1 sleep the second they close their eyes—typically taking 10 to 20 minutes. Subtracting onset latency ensures you achieve five full cycles of actual sleep before your alarm.',
    },
    {
      question: 'Why is the recommended caffeine cut-off 8 hours before bedtime?',
      answer: 'Because caffeine’s average plasma half-life is 5–6 hours, an afternoon coffee still leaves ~25%–40% active adenosine receptor blockade at bedtime—fragmenting restorative deep N3 sleep even if you fall asleep normally.',
    },
  ],
  'btu-hvac-calculator': [
    {
      question: 'How many BTUs equal one Cooling Ton of central air conditioning?',
      answer: '1 Ton of cooling capacity equals exactly 12,000 BTU/hr (approx. 3.517 thermal kW)—so a 3.5-Ton system delivers 42,000 BTU/hr and a 4.0-Ton unit delivers 48,000 BTU/hr.',
    },
    {
      question: 'Why is oversizing an air conditioner counterproductive?',
      answer: 'An oversized AC chills indoor air quickly and shuts off in 5–7 minutes before air coils condense sufficient moisture, causing clammy indoor humidity, mold risk, and premature compressor burnout.',
    },
    {
      question: 'What is SEER2 and how does it estimate peak electrical draw?',
      answer: 'SEER2 (Seasonal Energy Efficiency Ratio 2) measures cooling BTU output divided by electrical Watt-hours consumed under 2023+ DOE static-pressure test rules. Dividing BTU/hr by SEER2 estimates peak electrical load in kW.',
    },
  ],
  'wire-size-voltage-drop-calculator': [
    {
      question: 'What is the maximum recommended NEC voltage drop for branch circuits?',
      answer: 'NFPA 70 (NEC) Article 210.19 Informational Note recommends limiting voltage drop to 3% or less on individual branch circuits (and ≤ 5% total combined across feeder plus branch) for efficiency and equipment protection.',
    },
    {
      question: 'Should I enter round-trip wire distance or one-way distance?',
      answer: 'Enter strictly the ONE-WAY cable run distance from panel to load in feet. Single-phase formulas automatically multiply by 2 (and three-phase by √3) to cover return path resistance.',
    },
    {
      question: 'Why is Copper K = 12.9 while Aluminum K = 21.2?',
      answer: 'Aluminum has roughly 61% the electrical conductivity of copper, yielding higher resistive loss (K = 21.2 vs. 12.9 Ω·CM/ft). As a rule of thumb, aluminum conductors typically step up two AWG gauge sizes compared to copper.',
    },
  ],
  'roof-pitch-rafter-calculator': [
    {
      question: 'What does a 6:12 roof pitch mean in degrees and slope factor?',
      answer: 'A 6:12 pitch rises 6 inches vertically for every 12 inches of horizontal run—producing a 26.57° angle (50% grade) and a Pythagorean slope multiplier of √(1 + 0.5²) = 1.1180.',
    },
    {
      question: 'How many bundles of asphalt shingles cover one Roofing Square?',
      answer: 'One Roofing Square equals 100 square feet of finished sloped roof surface, almost universally packaged as 3 bundles for standard architectural laminated shingles.',
    },
    {
      question: 'Why do eave overhangs add so much to total roof area?',
      answer: 'Adding 1.5-foot overhangs along both eaves and rake ends expands a 32×48 ft footprint (1,536 ft²) to a 35×51 ft projection before slope multiplication—accounting for ~230+ sq ft of perimeter sheathing and shingles.',
    },
  ],
  'stair-calculator': [
    {
      question: 'What are the IRC residential limits for stair riser height and tread depth?',
      answer: 'Under International Residential Code Section R311.7.5, maximum riser height is 7.75 inches (197 mm), minimum tread depth is 10.0 inches (254 mm), and step-to-step variance cannot exceed 3/8 inch.',
    },
    {
      question: 'Why does a staircase always have one fewer tread than risers?',
      answer: 'Because the finished upper floor landing itself forms the final horizontal stepping surface at the top riser, a flight with 15 equal risers requires exactly 14 treads.',
    },
    {
      question: 'What is Blondel’s 2R + T stair comfort rule?',
      answer: 'Formulated by architect François Blondel, keeping 2 × Riser + Tread between 24 and 25 inches (610–635 mm) aligns riser lift and horizontal stride naturally with human walking biomechanics.',
    },
  ],
  'tile-flooring-calculator': [
    {
      question: 'How much extra tile waste should I order for straight vs. diagonal layouts?',
      answer: 'Order +10% extra for clean rectangular straight-grid floors, +15% for 45° diagonal, staggered brick, or herringbone cuts, and +20% for rooms with angled walls, closets, or delicate mosaics.',
    },
    {
      question: 'Why does the calculator round full cartons upward?',
      answer: 'Tile retailers only sell sealed factory cartons, and ordering an extra full box avoids mid-project shutdowns or mismatched kiln dye lots if tiles chip during cutting.',
    },
    {
      question: 'How should I adjust grout joint width for rectified vs. standard ceramic tiles?',
      answer: 'Precision-cut rectified porcelain commonly uses narrow 1/8" (3 mm) sanded/polymer grout joints, whereas non-rectified ceramic or handmade tiles typically require 3/16"–1/4" joints to absorb slight dimensional variance.',
    },
  ],
  'gravel-mulch-calculator': [
    {
      question: 'How many 2-cubic-foot bags equal one bulk cubic yard?',
      answer: 'One cubic yard equals exactly 27 cubic feet—so 1 yd³ = 13.5 standard 2-cubic-foot bags (or 9 large 3-cubic-foot bags). Buying bulk delivery is usually much cheaper above 2–3 cubic yards.',
    },
    {
      question: 'How much does a cubic yard of crushed gravel weigh compared to mulch?',
      answer: 'Hardwood bark mulch averages ~800 lb/yd³, screened topsoil ~2,200 lb/yd³, and crushed gravel ~2,800 lb/yd³ (1.4 US Tons per yard). Always check pickup truck axle/payload ratings before loading stone in bulk.',
    },
    {
      question: 'How deep should I spread landscape mulch vs. driveway gravel?',
      answer: 'Spread garden mulch 2–3 inches deep for moisture retention without suffocating plant roots; base layers of crushed stone for patios or driveways typically run 3–6 inches compacted.',
    },
  ],
  'ev-charging-calculator': [
    {
      question: 'Why does the EV charger pull more kWh from the wall than gets stored in the battery?',
      answer: 'AC-to-DC onboard charger conversion, cable resistance, and battery thermal management create ~8%–12% overhead (modeled at 90% default efficiency). Storing 45 kWh into the pack draws ~50 kWh at your home utility meter.',
    },
    {
      question: 'Why is 20% to 80% the recommended daily EV charging window?',
      answer: 'Most lithium-ion NMC/NCA EVs charge fastest and minimize long-term cell voltage stress between 20% and 80% state of charge, reserving 100% charges mainly for immediate road-trip departures.',
    },
    {
      question: 'What kW charge speed do typical Level 1, Level 2, and DC fast chargers deliver?',
      answer: 'Standard 120V outlets (Level 1) deliver ~1.4 kW; dedicated 240V home wallboxes (Level 2) deliver 7.4–11.5 kW (32A–48A); commercial DC Fast Chargers span 50–350 kW (tapering above 70%–80% SoC).',
    },
  ],
  'ab-test-sample-size-calculator': [
    {
      question: 'What is Minimum Detectable Effect (MDE) and why does cutting it in half quadruple traffic needs?',
      answer: 'MDE is the smallest relative lift you want your test capable of reliably catching. Because sample size scales inversely with (p₂ − p₁)², halving MDE from 20% to 10% requires roughly 4× more users per variant.',
    },
    {
      question: 'Why shouldn’t I stop an A/B test early if Variant B hits 95% confidence after two days?',
      answer: 'Stopping early upon first crossing p < 0.05 ("peeking") inflates your false-positive risk from 5% up toward 30%+ and ignores day-of-week shopper mix bias. Always finish the planned sample size and full 7-day cycles.',
    },
    {
      question: 'What is the difference between Confidence (1 − α) and Statistical Power (1 − β)?',
      answer: 'Confidence (typically 95%) guards against False Positives (declaring a useless change a winner), while Power (typically 80%) guards against False Negatives (missing a real improvement that truly exists).',
    },
  ],
  'linear-regression-calculator': [
    {
      question: 'What is the difference between Pearson Correlation (r) and R²?',
      answer: 'Pearson r ranges from −1.0 to +1.0 showing linear direction and tightness, whereas R² (= r², between 0% and 100%) tells you what exact percentage of Y’s total variation is linearly explained by X.',
    },
    {
      question: 'What does Standard Error of Estimate (SEE) tell you alongside R²?',
      answer: 'While R² is a dimensionless percentage, SEE reports the typical vertical prediction error in original Y units (using n − 2 degrees of freedom)—making it straightforward to construct prediction bands around ŷ.',
    },
    {
      question: 'Can linear regression detect curved relationships or outlier distortion?',
      answer: 'Single-pass OLS fits a straight line even to curved U-shapes or datasets pulled by one rogue outlier. Always check residual scatter alongside r and R² before extrapolating.',
    },
  ],
  'bayes-theorem-calculator': [
    {
      question: 'How can a 95%-sensitive test produce only a 19.5% true-positive probability?',
      answer: 'When baseline prevalence is low (e.g., 2.0%), 98% of tested individuals do not have the condition. Even a small 8% false-positive rate across that huge healthy majority generates 784 false positives vs. 190 true positives per 10,000 tested.',
    },
    {
      question: 'What do Positive and Negative Likelihood Ratios (LR+ and LR−) measure?',
      answer: 'LR+ = Sensitivity ÷ (1 − Specificity) quantifies how much a positive result increases disease odds (LR+ > 10 is strong evidence), while LR− = (1 − Sensitivity) ÷ Specificity measures how strongly a negative test rules it out.',
    },
    {
      question: 'How do you apply Bayes’ Theorem when running a second confirmatory test?',
      answer: 'Take the Posterior Probability (PPV) from the first test—for example 19.51%—and enter it as the new Prior Prevalence P(A) for an independent second assay to find combined post-test certainty.',
    },
  ],
  'normal-distribution-calculator': [
    {
      question: 'What does a Z-score represent on any bell curve?',
      answer: 'Z = (X − μ) ÷ σ measures exactly how many standard deviations an observation sits above (+) or below (−) the population mean, normalizing any unit onto Standard Normal N(0, 1).',
    },
    {
      question: 'What is the difference between Left-Tail, Right-Tail, and Two-Tail probabilities?',
      answer: 'Left-tail P(X ≤ x) gives your percentile rank below cutoff X; Right-tail P(X > x) gives one-sided exceedance; Two-tail P(|Z| ≥ |z|) sums both outer extremes for symmetric hypothesis p-values.',
    },
    {
      question: 'How do I calculate the probability between two scores P(a ≤ X ≤ b)?',
      answer: 'Select "Range Interval P(a ≤ X ≤ b)" in the Probability Interval Mode dropdown and enter lower bound a and upper bound b to evaluate Φ(Z_b) − Φ(Z_a) directly.',
    },
  ],
  'matrix-calculator': [
    {
      question: 'What does it mean if a matrix Determinant det(A) equals zero?',
      answer: 'When det(A) = 0, the matrix is singular (linearly dependent rows or columns)—its geometric transformation collapses volume to zero, so no unique solution or inverse matrix A⁻¹ exists.',
    },
    {
      question: 'How does the calculator compute the inverse of a 3 × 3 matrix?',
      answer: 'It evaluates all nine signed 2 × 2 minor cofactors, transposes the cofactor matrix into the classical Adjugate adj(A), and divides every element by det(A).',
    },
    {
      question: 'What is the Matrix Trace tr(A)?',
      answer: 'The trace is the sum of main diagonal elements (a₁₁ + a₂₂ + a₃₃), which invariant-wise equals the sum of all eigenvalues of matrix A.',
    },
  ],
  'gcd-lcm-prime-calculator': [
    {
      question: 'Does the GCD × LCM = a × b shortcut work for 3 or more numbers?',
      answer: 'No! That famous identity applies strictly to pairs of two integers. For 3+ numbers (such as 24, 36, 60), this calculator iterates pairwise Euclidean GCD and overflow-guarded LCM = (runningLCM ÷ GCD) × nextNum.',
    },
    {
      question: 'What does it mean when a set of integers is Coprime?',
      answer: 'Numbers are coprime (relatively prime) when their Greatest Common Divisor equals 1—meaning they share no prime divisor greater than 1 even if the individual numbers themselves are composite (like 8 and 15).',
    },
    {
      question: 'How do prime factorizations instantly reveal GCD and LCM?',
      answer: 'GCD multiplies every shared prime raised to its MINIMUM exponent across the list, whereas LCM multiplies every prime appearing anywhere raised to its MAXIMUM exponent.',
    },
  ],
  'ideal-gas-law-calculator': [
    {
      question: 'Why must temperature be converted to Kelvin before using PV = nRT?',
      answer: 'Gas volume and pressure scale linearly with kinetic energy from absolute zero (−273.15 °C = 0 K). Plugging 0 °C directly would falsely predict zero pressure; adding 273.15 fixes the ratio proportionally.',
    },
    {
      question: 'Which value of the gas constant R does this calculator use?',
      answer: 'It uses the exact post-2019 SI CODATA molar gas constant R = 8.314462618 L·kPa·K⁻¹·mol⁻¹ (equivalent to 0.0820573 L·atm·K⁻¹·mol⁻¹) and reports Pressure in kPa, atm, and psi simultaneously.',
    },
    {
      question: 'When does a real gas deviate significantly from the Ideal Gas Law?',
      answer: 'PV = nRT holds within ~1% for common gases near room temperature and atmospheric pressure, but diverges at very high pressures (>20–50 atm) or cryogenic temperatures near liquefaction where molecular volume and attractions matter.',
    },
  ],
  'decibel-calculator': [
    {
      question: 'When should I use 10·log₁₀ (Power) versus 20·log₁₀ (Voltage / Sound Pressure)?',
      answer: 'Use 10·log₁₀ whenever comparing energy or power quantities (Watts, mW, acoustic intensity). Because power varies with the square of voltage or pressure (P ∝ V²), comparing RMS voltages or acoustic Pascals multiplies log₁₀ by 20.',
    },
    {
      question: 'What is the difference between dB and dBm?',
      answer: 'Plain dB is a purely relative gain/loss ratio between any two levels, whereas dBm is an absolute power measurement referenced specifically to 1 milliwatt (0.001 W = 0 dBm; 0.1 W = +20 dBm; 1 W = +30 dBm).',
    },
    {
      question: 'How fast does outdoor sound drop with distance in Free-Field Distance mode?',
      answer: 'Under the geometric inverse-square law (−20·log₁₀ r₂/r₁), doubling your distance from an outdoor point-source sound drops sound pressure level by exactly −6.02 dB (and 10× distance drops −20.00 dB).',
    },
  ],
};
