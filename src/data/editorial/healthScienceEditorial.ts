import type { EditorialSection } from '../calculatorEditorial.ts';

export const healthScienceEditorial: Record<string, EditorialSection> = {
  'bmi-calculator': {
    overview:
      'Body Mass Index (BMI) is a standardized population screening metric endorsed by the World Health Organization (WHO), US CDC, and UK NHS to evaluate body weight relative to height. It classifies adults into weight categories associated with population-level metabolic and cardiovascular risk.',
    detailedExplanation:
      'Because BMI uses height squared in the denominator, it approximates body frame scaling without requiring specialized imaging equipment. However, BMI does not distinguish lean skeletal muscle mass from adipose tissue, so muscular athletes or older adults with low muscle mass should interpret BMI alongside waist circumference and body-fat percentage.',
    formulaDisplay: {
      formula: 'BMI = weight (kg) / [height (m)]²   |   BMI = 703 × weight (lbs) / [height (in)]²',
      latex: 'BMI = \\frac{\\text{weight}_{\\text{kg}}}{(\\text{height}_{\\text{m}})^2}',
      variableDefinitions: [
        { symbol: 'weight', name: 'Body Mass', description: 'Measured morning body weight', unit: 'kg or lbs' },
        { symbol: 'height', name: 'Stature', description: 'Standing barefoot height', unit: 'm or in' },
      ],
    },
    workedExample: {
      scenario: 'Evaluating BMI for an adult weighing 72 kg at a standing height of 175 cm (1.75 m).',
      inputs: [
        { name: 'Weight', value: '72 kg' },
        { name: 'Height', value: '175 cm (1.75 m)' },
      ],
      steps: [
        'Convert height to meters squared: 1.75² = 3.0625 m².',
        'Divide weight by squared height: 72 / 3.0625 = 23.5102 -> 23.5 kg/m².',
      ],
      result: '23.5 kg/m² (Normal Weight)',
      interpretation: 'A BMI of 23.5 sits inside the standard WHO adult healthy range of 18.5 to 24.9 kg/m².',
    },
    regulatoryAndStandards: {
      title: 'WHO & CDC Adult BMI Classification Standards',
      description: 'Clinical screening cutoffs established for adults aged 20+:',
      points: [
        'Standard WHO Brackets: Underweight (< 18.5), Normal Weight (18.5–24.9), Overweight (25.0–29.9), Obesity Class I–III (≥ 30.0).',
        'Asian Risk Thresholds (WHO): Lower cutoffs of 23.0 (overweight) and 27.5 (obesity) apply where visceral adiposity presents earlier.',
        'Pediatric Limitation: Individuals aged 2–19 require CDC age-and-sex percentile charts rather than fixed adult cutoffs.',
      ],
    },
    commonMistakes: {
      title: 'Treating BMI as a Standalone Clinical Diagnosis',
      explanation: 'Evaluating BMI without checking waist circumference, blood pressure, or body composition can misclassify strength athletes or overlook visceral fat.',
    },
    proTips: [
      'Measure waist circumference alongside BMI: values over 40 in (men) or 35 in (women) flag visceral metabolic risk.',
      'Pair BMI checks with our Body Fat Calculator when strength-training regularly.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Health & Biometrics Desk',
      reviewDate: 'October 2026',
      accuracyStandard: 'Aligned with WHO Technical Report Series 894 and CDC adult BMI cutoffs.',
    },
  },

  'calorie-calculator': {
    overview:
      'A Calorie & TDEE (Total Daily Energy Expenditure) calculator estimates your daily caloric burn at rest (BMR) using the Mifflin-St Jeor equation and scales it by lifestyle activity level to guide maintenance, fat loss, or lean muscle gain targets.',
    detailedExplanation:
      'TDEE combines Basal Metabolic Rate (the energy needed for breathing, heartbeat, and cellular maintenance) with daily non-exercise movement (NEAT), exercise, and food thermogenesis. Establishing your maintenance baseline prevents counterproductive crash dieting by anchoring deficits above clinical minimums.',
    formulaDisplay: {
      formula: 'BMR = 10·W(kg) + 6.25·H(cm) - 5·A(yrs) + (+5 men / -161 women); TDEE = BMR × Activity',
      latex: '\\text{TDEE} = (10W + 6.25H - 5A + s) \\times k_{\\text{activity}}',
      variableDefinitions: [
        { symbol: 'W, H, A', name: 'Weight, Height, Age', description: 'Body weight (kg), height (cm), and age (years)', unit: 'kg, cm, yrs' },
        { symbol: 's', name: 'Sex Constant', description: '+5 for male; -161 for female', unit: 'kcal' },
        { symbol: 'k_activity', name: 'Activity Multiplier', description: '1.2 (sedentary) up to 1.9 (extra active)', unit: 'Factor' },
      ],
    },
    workedExample: {
      scenario: 'Estimating daily maintenance calories for a 30-year-old male weighing 75 kg at 178 cm with light activity (1.375).',
      inputs: [
        { name: 'Weight / Height / Age', value: '75 kg / 178 cm / 30 yrs' },
        { name: 'Biological Sex', value: 'Male (+5)' },
        { name: 'Activity Level', value: 'Lightly Active (1.375)' },
      ],
      steps: [
        'Compute BMR: (10 × 75) + (6.25 × 178) - (5 × 30) + 5 = 750 + 1,112.5 - 150 + 5 = 1,717.5 kcal.',
        'Multiply by activity factor: 1,717.5 × 1.375 = 2,361.56 -> 2,362 kcal/day.',
      ],
      result: '2,362 kcal / day Maintenance TDEE',
      interpretation: 'Consuming ~1,862 kcal/day yields a sustainable ~500 kcal daily deficit (~1 lb/week fat loss) safely above clinical floors.',
    },
    regulatoryAndStandards: {
      title: 'Clinical Nutrition & Minimum Safe Caloric Thresholds',
      description: 'Dietary guidelines governing sustainable caloric planning:',
      points: [
        'Mifflin-St Jeor Validation: Widely cited by the Academy of Nutrition and Dietetics as the most reliable general-population BMR equation.',
        'Minimum Caloric Safety Floors: Adult targets should stay above 1,500 kcal/day (men) and 1,200 kcal/day (women) unless medically supervised.',
        'Metabolic Adaptation: Recalculate TDEE every 10–15 lbs of weight change as total mass and energy expenditure shift.',
      ],
    },
    commonMistakes: {
      title: 'Over-Selecting Activity Multiplier Plus Adding Separate Workout Burn',
      explanation: 'Picking "Moderately Active (1.55)" already accounts for 3–5 workouts weekly—adding smartwatch exercise calories on top double-counts expenditure.',
    },
    proTips: [
      'Track rolling 7-day average scale weight rather than reacting to single-day hydration swings.',
      'Convert your calorie target directly into protein, carb, and fat grams with our Macronutrient Calculator.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Nutrition & Metabolic Physiology Desk',
      reviewDate: 'October 2026',
      accuracyStandard: 'Implements clinically validated Mifflin-St Jeor equations and USDA/NHS caloric floor guidance.',
    },
  },

  'body-fat-calculator': {
    overview:
      'A Body Fat Calculator estimates subcutaneous and total adiposity percentage using the US Navy anthropometric circumference equations from neck, waist, hip (for women), and standing height measurements.',
    detailedExplanation:
      'Unlike scale weight or BMI, tape-measure circumference models separate trunk fat changes from muscle gain. Measuring consistently at the same anatomical landmarks shows genuine fat loss even when strength training holds scale weight steady.',
    formulaDisplay: {
      formula: 'Men: 86.010·log₁₀(waist - neck) - 70.041·log₁₀(height) + 36.76   |   Women: 163.205·log₁₀(waist + hip - neck) - 97.684·log₁₀(height) - 78.387 (in)',
      latex: '\\%\\text{BF}_{\\text{men}} = 86.010\\log_{10}(w - n) - 70.041\\log_{10}(h) + 36.76',
      variableDefinitions: [
        { symbol: 'waist, neck, hip', name: 'Body Circumferences', description: 'Relaxed morning tape measurements', unit: 'cm or in' },
        { symbol: 'height', name: 'Standing Height', description: 'Barefoot standing height', unit: 'cm or in' },
      ],
    },
    workedExample: {
      scenario: 'Estimating body fat for a male measuring 178 cm tall, 84 cm waist, and 38 cm neck.',
      inputs: [
        { name: 'Sex', value: 'Male' },
        { name: 'Height / Waist / Neck', value: '178 cm / 84 cm / 38 cm' },
      ],
      steps: [
        'Convert cm to inches (÷ 2.54): height = 70.079", waist = 33.071", neck = 14.961".',
        'Compute log differences: 86.010 × log₁₀(18.110) - 70.041 × log₁₀(70.079) + 36.76.',
        'Evaluate result: 15.7% estimated body fat (Fitness category).',
      ],
      result: '15.7% Body Fat',
      interpretation: 'At 15.7%, an adult male falls squarely inside the ACE Fitness band (14%–17%), well below clinical obesity thresholds.',
    },
    regulatoryAndStandards: {
      title: 'US Navy Method & ACE Body Composition Categories',
      description: 'Reference anthropometric standards and body-fat strata:',
      points: [
        'Hodgdon & Beckett US Navy Equations: Developed by the Naval Health Research Center, accurate within ~3%–4% compared against hydrostatic weighing for average frames.',
        'ACE Classifications (Men / Women): Essential (2–5% / 10–13%), Athletes (6–13% / 14–20%), Fitness (14–17% / 21–24%), Average (18–24% / 25–31%).',
        'Domain Prerequisite: Waist circumference (plus hip for women) must exceed neck circumference so logarithmic terms stay defined.',
      ],
    },
    commonMistakes: {
      title: 'Pulling the Tape Tight or Sucking in Stomach',
      explanation: 'Compressing soft tissue under-reads waist circumference by 1–2 inches; lay the tape flat and relaxed after normal exhalation.',
    },
    proTips: [
      'Measure once every 2–4 weeks first thing in the morning before eating.',
      'For diagnostic medical precision, clinicians use DEXA imaging.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Health & Anthropometrics Desk',
      reviewDate: 'October 2026',
      accuracyStandard: 'Implements standard Hodgdon & Beckett US Navy circumference equations.',
    },
  },

  'target-heart-rate-calculator': {
    overview:
      'A Target Heart Rate Calculator computes five aerobic and anaerobic cardiovascular training zones using the Tanaka maximum heart rate formula paired with the Karvonen Heart Rate Reserve (HRR) method.',
    detailedExplanation:
      'Unlike basic age-only percentages, the Karvonen method accounts for your Resting Heart Rate—tailoring Zone 2 fat-burning and Zone 4 threshold intervals to your actual cardiovascular conditioning.',
    formulaDisplay: {
      formula: 'MHR (Tanaka) = 208 - 0.7 × Age   |   THR = RHR + (MHR - RHR) × Intensity%',
      latex: '\\text{THR} = \\text{RHR} + (\\text{MHR} - \\text{RHR}) \\cdot p',
      variableDefinitions: [
        { symbol: 'Age', name: 'Chronological Age', description: 'Years of age for Tanaka MHR estimation', unit: 'Years' },
        { symbol: 'RHR', name: 'Resting Heart Rate', description: 'Morning pulse measured at full rest', unit: 'bpm' },
        { symbol: 'Intensity%', name: 'Zone Effort Fraction', description: 'Target aerobic/anaerobic effort (e.g. 60%–70% Zone 2)', unit: '%' },
      ],
    },
    workedExample: {
      scenario: 'Calculating Zone 2–3 aerobic training pulse for a 30-year-old athlete with a resting heart rate of 65 bpm.',
      inputs: [
        { name: 'Age', value: '30 years' },
        { name: 'Resting Heart Rate', value: '65 bpm' },
      ],
      steps: [
        'Tanaka Max Heart Rate = 208 - (0.7 × 30) = 187 bpm.',
        'Heart Rate Reserve (HRR) = 187 - 65 = 122 bpm.',
        'Moderate Zone 2–3 (60%–70% HRR): Lower = 65 + (122 × 0.60) = 138 bpm; Upper = 65 + (122 × 0.70) = 150 bpm.',
      ],
      result: '138 – 150 bpm Aerobic Target Zone (Max HR ≈ 187 bpm)',
      interpretation: 'Training consistently around 138–150 bpm builds mitochondrial endurance efficiently without excessive recovery fatigue.',
    },
    regulatoryAndStandards: {
      title: 'ACSM Exercise Physiology & Tanaka MHR Conventions',
      description: 'Sports science frameworks behind heart-rate training zones:',
      points: [
        'Tanaka Formula (2001): Outperforms older "220 − age" estimates across healthy adults, reducing error for ages over 40.',
        'Karvonen Reserve Precision: Better aligns training load with fitter individuals who have lower resting pulses (45–55 bpm).',
        'Medical Clearance: Beta-blockers and certain cardiac medications suppress heart rate—use Rate of Perceived Exertion (RPE) if medicated.',
      ],
    },
    commonMistakes: {
      title: 'Measuring Resting Heart Rate Immediately After Coffee or Commuting',
      explanation: 'Take your RHR right after waking up before standing or consuming caffeine for an accurate baseline.',
    },
    proTips: [
      'Most endurance base mileage belongs in Zone 2 (conversational pace), saving Zones 4–5 for 1–2 focused sessions weekly.',
      'Pair heart-rate zones with pace targets using our Running Pace Calculator.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Exercise Physiology Desk',
      reviewDate: 'October 2026',
      accuracyStandard: 'Follows ACSM aerobic training guidelines using Tanaka MHR and Karvonen HRR equations.',
    },
  },

  'macronutrient-calculator': {
    overview:
      'A Macronutrient Calculator translates daily calorie goals into exact gram targets for protein, carbohydrates, and dietary fats based on standard Atwater caloric energy densities (4 / 4 / 9 kcal per gram).',
    detailedExplanation:
      'While total energy balance drives weight direction, macronutrient ratios determine satiety, muscle retention, hormone balance, and athletic glycogen recovery. Converting percentages cleanly into grams turns food-label tracking into actionable meal planning.',
    formulaDisplay: {
      formula: 'Protein (g) = (Calories × P%) / 4   |   Carbs (g) = (Calories × C%) / 4   |   Fats (g) = (Calories × F%) / 9',
      latex: 'g_P = \\frac{E \\cdot p_P}{4}, \\quad g_C = \\frac{E \\cdot p_C}{4}, \\quad g_F = \\frac{E \\cdot p_F}{9}',
      variableDefinitions: [
        { symbol: 'Calories', name: 'Daily Caloric Budget', description: 'Maintenance, deficit, or surplus kcal target', unit: 'kcal/day' },
        { symbol: 'P%, C%, F%', name: 'Macro Split %', description: 'Energy shares summing near 100%', unit: '%' },
      ],
    },
    workedExample: {
      scenario: 'Splitting a 2,200 kcal daily budget into 30% protein, 40% carbohydrates, and 30% fat.',
      inputs: [
        { name: 'Daily Calories', value: '2,200 kcal' },
        { name: 'Split (P / C / F)', value: '30% / 40% / 30%' },
      ],
      steps: [
        'Protein: (2,200 × 0.30) / 4 kcal/g = 660 / 4 = 165 g.',
        'Carbohydrates: (2,200 × 0.40) / 4 kcal/g = 880 / 4 = 220 g.',
        'Fats: (2,200 × 0.30) / 9 kcal/g = 660 / 9 = 73 g.',
      ],
      result: '165g Protein / 220g Carbs / 73g Fat',
      interpretation: 'Notice fat contains more than double the energy density per gram (9 kcal/g vs. 4 kcal/g), so 30% of calories equals 73g rather than 165g.',
    },
    regulatoryAndStandards: {
      title: 'Dietary Reference Intakes (AMDR) & Nutrition Labeling',
      description: 'Clinical nutritional frameworks governing macronutrient ranges:',
      points: [
        'Atwater Energy System: FDA and global nutrition labels compute calories using 4 kcal/g protein, 4 kcal/g carbs, and 9 kcal/g fats.',
        'NASEM Acceptable Macronutrient Ranges (AMDR): 10%–35% protein, 45%–65% carbohydrates, 20%–35% fats for general adult health.',
        'Minimum Dietary Fat: Keep fat intake roughly ≥ 0.3 g/lb body weight to support fat-soluble vitamins and steroid hormones.',
      ],
    },
    commonMistakes: {
      title: 'Setting Macro Percentages That Do Not Sum to 100%',
      explanation: 'Verify P% + C% + F% = 100% so calculated grams match your intended caloric ceiling.',
    },
    proTips: [
      'Determine your daily caloric target first with the Calorie & TDEE Calculator.',
      'Aim for ~25–40g of complete protein per meal to stimulate muscle protein synthesis evenly.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Nutrition & Dietetics Desk',
      reviewDate: 'October 2026',
      accuracyStandard: 'Follows FDA/Atwater caloric conversion factors and National Academies AMDR guidelines.',
    },
  },

  'running-pace-calculator': {
    overview:
      'A Running Pace Calculator computes per-kilometer and per-mile running pace, speed, and projected finish times across 5K, 10K, Half Marathon (21.0975 km), and Marathon (42.195 km) race distances.',
    detailedExplanation:
      'Holding an even pace prevents early glycogen burnout and helps runners calibrate GPS watches for race day. Dividing total duration cleanly by distance produces exact split targets you can monitor at every mile or kilometer marker.',
    formulaDisplay: {
      formula: 'Pace = Total Time / Distance   |   Projected Finish = Pace × Race Distance',
      latex: '\\text{Pace} = \\frac{T_{\\text{sec}}}{D}, \\quad T_{\\text{finish}} = \\text{Pace} \\times D_{\\text{race}}',
      variableDefinitions: [
        { symbol: 'Distance', name: 'Run Distance', description: 'Completed or target distance in kilometers', unit: 'km' },
        { symbol: 'Time', name: 'Elapsed Duration', description: 'Hours, minutes, and seconds run', unit: 'hh:mm:ss' },
      ],
    },
    workedExample: {
      scenario: 'Running a 10 km race in exactly 50 minutes (0h 50m 00s).',
      inputs: [
        { name: 'Distance', value: '10 km' },
        { name: 'Duration', value: '50:00' },
      ],
      steps: [
        'Total seconds: 50 × 60 = 3,000 seconds.',
        'Pace per km: 3,000 s / 10 km = 300 s/km = 5:00 min/km.',
        'Pace per mile: 300 × 1.609344 = 482.8 s/mi = 8:03 min/mi (Speed = 12.0 km/h).',
      ],
      result: '5:00 min / km (8:03 min / mile; 12.0 km/h)',
      interpretation: 'At an even 5:00/km rhythm, 5K splits hit 25:00 and a Half Marathon finishes near 1:45:29.',
    },
    regulatoryAndStandards: {
      title: 'World Athletics Certified Race Distances',
      description: 'Official standard road-racing distance conversions:',
      points: [
        'Official Road Distances: 5K (5.0 km / 3.107 mi), 10K (10.0 km / 6.214 mi), Half Marathon (21.0975 km / 13.109 mi), Marathon (42.195 km / 26.219 mi).',
        'Riegel Fatigue Reality: Real marathon times scale non-linearly relative to shorter 5K/10K efforts without endurance mileage.',
        'Negative Splits: Running the second half slightly faster than the first half is strongly associated with personal-best marathon pacing.',
      ],
    },
    commonMistakes: {
      title: 'Extrapolating a 5K Pace Directly Onto a Full Marathon',
      explanation: 'Sustaining 10K speed across 42.2 km overlooks aerobic drift and glycogen depletion; add conservative endurance buffers.',
    },
    proTips: [
      'Use our Target Heart Rate Calculator alongside pace splits when running in summer heat or hilly terrain.',
      'Aim for consistent kilometer or mile splits during the opening third of any race.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Endurance Sports Desk',
      reviewDate: 'October 2026',
      accuracyStandard: 'Verified against World Athletics standard race distance definitions.',
    },
  },

  'due-date-calculator': {
    overview:
      'A Pregnancy Due Date Calculator estimates Estimated Delivery Date (EDD), current gestational age in weeks and days, trimester progression, and key prenatal screening milestones from the first day of the Last Menstrual Period (LMP) adjusted for cycle length.',
    detailedExplanation:
      'Standard obstetric dating adds 280 days (40 weeks) to the first day of the last menstrual period for a classic 28-day cycle, shifting slightly earlier or later when ovulation occurs before or after day 14. First-trimester ultrasound crown-rump length remains the clinical gold standard for confirming dating.',
    formulaDisplay: {
      formula: 'EDD = LMP + 280 Days + (Cycle Length - 28) Days   (Naegele’s Rule)',
      latex: '\\text{EDD} = \\text{LMP} + 280 + (L_{\\text{cycle}} - 28)\\text{ days}',
      variableDefinitions: [
        { symbol: 'LMP', name: 'Last Menstrual Period', description: 'First day of last normal period', unit: 'Date / Days' },
        { symbol: 'L_cycle', name: 'Cycle Length', description: 'Typical menstrual cycle length (default 28 days)', unit: 'Days' },
      ],
    },
    workedExample: {
      scenario: 'Evaluating remaining days at 65 days elapsed since LMP on a standard 28-day cycle.',
      inputs: [
        { name: 'Days Since LMP', value: '65 days' },
        { name: 'Cycle Length', value: '28 days' },
      ],
      steps: [
        'Total standard gestational span = 280 days (40 weeks).',
        'Gestational age = 9 weeks and 2 days (First Trimester).',
        'Days remaining until EDD = 280 - 65 = 215 days.',
      ],
      result: '215 Days Until Estimated Due Date (9w 2d Gestational Age)',
      interpretation: 'Only ~4% of spontaneous births occur on the exact EDD; healthy full-term delivery spans weeks 39 through 40+6.',
    },
    regulatoryAndStandards: {
      title: 'ACOG Gestational Dating & Term Definitions',
      description: 'Clinical obstetric terminology endorsed by ACOG and SMFM:',
      points: [
        'Term Categories: Early Term (37w0d–38w6d), Full Term (39w0d–40w6d), Late Term (41w0d–41w6d), Post-Term (≥ 42w0d).',
        'Ultrasound Confirmation: First-trimester ultrasound crown-rump measurements supersede LMP dating if discrepancy exceeds 5–7 days.',
        'Medical Disclaimer: This calculator provides educational dating estimates and is not a substitute for prenatal clinical care.',
      ],
    },
    commonMistakes: {
      title: 'Using Cycle End Date or Conception Date Instead of LMP Day 1',
      explanation: 'Gestational weeks count from the very first day of your last menstrual bleeding—roughly two weeks prior to actual fertilization.',
    },
    proTips: [
      'Adjust cycle length if yours routinely runs shorter (24–25 days) or longer (32–35 days) than 28 days.',
      'Share both your LMP date and cycle regularity at your initial prenatal OB-GYN visit.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Maternal Health Reference Desk',
      reviewDate: 'October 2026',
      accuracyStandard: 'Follows Naegele’s obstetric rule and ACOG Committee Opinion No. 700 dating guidelines.',
    },
  },

  'ovulation-calculator': {
    overview:
      'An Ovulation & Fertility Window Calculator estimates expected ovulation day and the six-day fertile window within a menstrual cycle by subtracting a standard 14-day luteal phase from total cycle length.',
    detailedExplanation:
      'While the follicular phase before ovulation varies considerably between individuals and cycles, the luteal phase following egg release stays fairly steady around 12–16 days (average 14). Sperm survive up to 5 days in cervical mucus, creating a multi-day fertile window peaking just before ovulation.',
    formulaDisplay: {
      formula: 'Ovulation Cycle Day ≈ Cycle Length - 14   |   Fertile Window ≈ [Ovulation - 5, Ovulation + 1]',
      latex: 'D_{\\text{ov}} \\approx L_{\\text{cycle}} - 14',
      variableDefinitions: [
        { symbol: 'L_cycle', name: 'Cycle Length', description: 'Days from Period Day 1 to day before next period', unit: 'Days' },
        { symbol: 'Day', name: 'Current Cycle Day', description: 'Number of days elapsed since Period Day 1', unit: 'Day' },
      ],
    },
    workedExample: {
      scenario: 'Tracking a regular 28-day menstrual cycle currently on Cycle Day 10.',
      inputs: [
        { name: 'Average Cycle Length', value: '28 days' },
        { name: 'Current Cycle Day', value: 'Day 10' },
      ],
      steps: [
        'Subtract standard 14-day luteal phase: 28 - 14 = Cycle Day 14.',
        'Fertile window spans roughly Days 9 through 15.',
        'At Day 10, user is currently inside the fertile window (4 days before estimated ovulation).',
      ],
      result: 'Cycle Day 14 (Fertile Window: Days 9–15)',
      interpretation: 'If cycle length were 32 days instead of 28, estimated ovulation shifts forward to Cycle Day 18.',
    },
    regulatoryAndStandards: {
      title: 'Reproductive Calendar Methods & Clinical Limitations',
      description: 'Important biological and contraceptive cautions:',
      points: [
        'Luteal Variability: Individual luteal phases commonly vary between 11 and 17 days, shifting calendar predictions.',
        'Biomarker Confirmation: Urinary LH ovulation predictor kits (OPKs) and basal body temperature (BBT) confirm ovulation far more accurately than calendar math alone.',
        'Not Contraception: Calendar calculations alone should NOT be relied upon as primary birth control.',
      ],
    },
    commonMistakes: {
      title: 'Assuming Every Woman Ovulates on Day 14 Regardless of Cycle Length',
      explanation: 'A 34-day cycle typically ovulates near Day 20, not Day 14—because extra cycle length usually occurs before ovulation.',
    },
    proTips: [
      'Average your last 3 to 6 menstrual cycles before entering cycle length.',
      'Peak conception odds occur during the two days leading up to ovulation plus ovulation day.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Women’s Health Reference Desk',
      reviewDate: 'October 2026',
      accuracyStandard: 'Follows standard reproductive endocrinology luteal-offset estimation.',
    },
  },

  'ideal-weight-calculator': {
    overview:
      'An Ideal Body Weight (IBW) Calculator evaluates Devine, Robinson, Miller, and Hamwi clinical formulas based on height and biological sex alongside the healthy 18.5–24.9 BMI weight span.',
    detailedExplanation:
      'Originally created for pharmacological dosing in hospitals, classic IBW equations benchmark height above 5 feet (60 inches). Presenting the healthy BMI range alongside Devine’s equation highlights why healthy body mass spans a natural zone rather than a single rigid pound target.',
    formulaDisplay: {
      formula: 'Devine (Men): 50.0 + 2.3 × (Height_in - 60) kg   |   Devine (Women): 45.5 + 2.3 × (Height_in - 60) kg',
      latex: '\\text{IBW}_{\\text{men}} = 50 + 2.3(H_{\\text{in}} - 60)\\text{ kg}',
      variableDefinitions: [
        { symbol: 'Height', name: 'Standing Height', description: 'Stature in centimeters or feet/inches', unit: 'cm' },
        { symbol: 'Sex', name: 'Biological Sex', description: 'Determines 50.0 kg (male) vs. 45.5 kg (female) 5-ft base', unit: 'Option' },
      ],
    },
    workedExample: {
      scenario: 'Computing Devine Ideal Body Weight for a 175 cm (68.90 in) adult male.',
      inputs: [
        { name: 'Height', value: '175 cm (68.90 inches)' },
        { name: 'Biological Sex', value: 'Male' },
      ],
      steps: [
        'Inches over 5 feet (60 in): 68.898 - 60 = 8.898 inches.',
        'Add 2.3 kg per inch above 60 in: 50 + (2.3 × 8.898) = 50 + 20.46 = 70.5 kg (~155 lbs).',
      ],
      result: '70.5 kg (~155 lbs) Devine IBW',
      interpretation: 'Notice that at 175 cm, a healthy WHO BMI (18.5–24.9) spans ~56.7 kg to 76.3 kg, giving wide natural accommodation for frame size and muscle mass.',
    },
    regulatoryAndStandards: {
      title: 'Clinical Pharmacokinetic Origins vs. Fitness Goals',
      description: 'Context for interpreting IBW equations appropriately:',
      points: [
        'Devine (1974), Robinson (1983), Miller (1983), & Hamwi (1964): Historically derived to adjust renal clearance and drug dosing—not athletic aesthetics.',
        'Frame & Muscle Nuance: Strength athletes naturally sit comfortably above formula IBW due to denser lean muscle tissue.',
        'Short Stature (< 60 in): Linear equations below 5 feet require adjusted clinical pediatric/petite ranges.',
      ],
    },
    commonMistakes: {
      title: 'Treating a Single IBW Number as the Only Healthy Target',
      explanation: 'Treat IBW as the midpoint of a broader healthy range shaped by bone structure, genetics, and lean body mass.',
    },
    proTips: [
      'Compare Devine IBW against our BMI Calculator and Body Fat Calculator for complete context.',
      'Target body composition improvements alongside scale weight.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Health & Biometrics Desk',
      reviewDate: 'October 2026',
      accuracyStandard: 'Verified against clinical Devine/Robinson/Miller/Hamwi equations and WHO BMI bounds.',
    },
  },

  'water-intake-calculator': {
    overview:
      'A Daily Water Intake Calculator estimates personalized fluid needs in liters, milliliters, and fluid ounces using body mass combined with daily workout duration adjustments.',
    detailedExplanation:
      'Generic "8 glasses a day" rules treat a 52 kg office worker and a 95 kg marathon runner identically. Scaling baseline fluids (~35 mL/kg) and adding sweat replacement for active minutes provides a tailored hydration baseline.',
    formulaDisplay: {
      formula: 'Daily Water (L) = Weight (kg) × 0.035 + (Exercise Minutes / 30) × 0.35',
      latex: 'W_{\\text{L}} = 0.035 \\cdot m_{\\text{kg}} + 0.35 \\cdot \\frac{t_{\\text{ex}}}{30}',
      variableDefinitions: [
        { symbol: 'm_kg', name: 'Body Weight', description: 'Current body mass in kilograms', unit: 'kg' },
        { symbol: 't_ex', name: 'Daily Exercise', description: 'Minutes of moderate-to-vigorous sweating exercise', unit: 'minutes' },
      ],
    },
    workedExample: {
      scenario: 'Calculating daily fluid needs for a 75 kg person exercising 45 minutes today.',
      inputs: [
        { name: 'Body Weight', value: '75 kg' },
        { name: 'Daily Exercise', value: '45 minutes' },
      ],
      steps: [
        'Baseline body-mass fluids: 75 × 0.035 L = 2.625 L.',
        'Exercise sweat replacement: (45 / 30) × 0.35 L = 0.525 L.',
        'Sum total daily fluids: 2.625 + 0.525 = 3.15 liters (~106.5 fl oz).',
      ],
      result: '3.15 liters / day (~106.5 US fl oz)',
      interpretation: 'Roughly 20% of daily hydration typically comes from water-rich foods like fruits and vegetables, with the rest from beverages.',
    },
    regulatoryAndStandards: {
      title: 'National Academies Fluid Intake Guidelines & Medical Cautions',
      description: 'Reference hydration consensus and clinical boundaries:',
      points: [
        'National Academies Adequate Intake: ~3.7 L/day total fluids for men and ~2.7 L/day for women across all food and drink.',
        'Hyponatremia Precaution: Endurance athletes should avoid forcing excess plain water faster than sweat losses without electrolytes.',
        'Renal/Cardiac Care: Individuals on fluid-restricted medical regimens (heart or kidney failure) must follow physician limits.',
      ],
    },
    commonMistakes: {
      title: 'Chugging Large Volumes Late at Night',
      explanation: 'Spread fluid intake steadily from morning through early evening to maintain steady plasma hydration without disrupting sleep.',
    },
    proTips: [
      'Use pale straw urine color as an easy day-to-day hydration check.',
      'Add electrolytes during sessions exceeding 60 minutes in hot or humid weather.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Nutrition & Sports Hydration Desk',
      reviewDate: 'October 2026',
      accuracyStandard: 'Aligned with National Academies fluid reference guidelines.',
    },
  },

  'velocity-calculator': {
    overview:
      'A Velocity Calculator solves classical uniform kinematics v = Δx / Δt from displacement and elapsed time, outputting speed cleanly across meters per second (m/s), kilometers per hour (km/h), and miles per hour (mph).',
    detailedExplanation:
      'In physics and transportation engineering, average velocity equals net spatial displacement divided by elapsed time. Having m/s, km/h, and mph displayed together bridges laboratory SI equations with everyday roadway speeds.',
    formulaDisplay: {
      formula: 'v = Δx / Δt   |   1 m/s = 3.6 km/h = 2.23694 mph',
      latex: 'v = \\frac{\\Delta x}{\\Delta t}',
      variableDefinitions: [
        { symbol: 'Δx', name: 'Displacement', description: 'Straight-line spatial change in meters', unit: 'meters (m)' },
        { symbol: 'Δt', name: 'Time Interval', description: 'Positive elapsed time in seconds (Δt > 0)', unit: 'seconds (s)' },
        { symbol: 'v', name: 'Average Velocity', description: 'Displacement rate of change', unit: 'm/s, km/h, mph' },
      ],
    },
    workedExample: {
      scenario: 'Computing average velocity for a 100-meter world-class sprint completed in 9.58 seconds.',
      inputs: [
        { name: 'Displacement (Δx)', value: '100 m' },
        { name: 'Elapsed Time (Δt)', value: '9.58 s' },
      ],
      steps: [
        'Divide displacement by elapsed time: 100 m / 9.58 s = 10.4384 m/s.',
        'Convert to km/h (× 3.6): 10.4384 × 3.6 = 37.58 km/h.',
        'Convert to mph (× 2.23694): 23.35 mph.',
      ],
      result: '10.438 m/s (37.58 km/h / 23.35 mph)',
      interpretation: 'Average velocity across the full 100 m sprint reaches 37.58 km/h, though peak instantaneous mid-race speed tops 44 km/h.',
    },
    regulatoryAndStandards: {
      title: 'SI Kinematics & Vector vs. Scalar Conventions',
      description: 'ISO 80000 / SI physical mechanics principles:',
      points: [
        'Velocity vs. Speed: Velocity incorporates direction (displacement Δx can be signed), whereas speed measures scalar path length over time.',
        'SI Base Units: Derived SI unit of velocity is meters per second (m·s⁻¹), with exact conversion 1 m/s = 3.6 km/h.',
        'Non-Zero Time: Division requires elapsed time Δt > 0.',
      ],
    },
    commonMistakes: {
      title: 'Confusing Distance Traveled With Net Displacement',
      explanation: 'Running one full 400 m track lap returns you to the starting line (net displacement = 0 m), giving average speed > 0 but net displacement velocity = 0.',
    },
    proTips: [
      'Multiply velocity in m/s by 3.6 mentally to convert straight to km/h.',
      'Pair computed velocity with mass in our Kinetic Energy Calculator.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Physics & Mechanics Desk',
      reviewDate: 'October 2026',
      accuracyStandard: 'Follows SI/ISO 80000 classical kinematics definitions.',
    },
  },

  'ohms-law-calculator': {
    overview:
      'An Ohm’s Law Calculator solves DC/resistive electrical circuit current (I = V / R) and power dissipation (P = V × I) from voltage and electrical resistance in Ohms.',
    detailedExplanation:
      'Georg Ohm’s fundamental proportionality law underpins circuit sizing, resistor selection, fuse protection, and wattage load checks across electronics and household wiring. Computing wattage alongside amperage immediately checks component heat limits.',
    formulaDisplay: {
      formula: 'I = V / R   |   P = V × I = V² / R = I² R',
      latex: 'V = I \\cdot R, \\quad P = V \\cdot I',
      variableDefinitions: [
        { symbol: 'V', name: 'Voltage', description: 'Electrical potential difference across load', unit: 'Volts (V)' },
        { symbol: 'R', name: 'Resistance', description: 'Positive ohmic resistance (R > 0)', unit: 'Ohms (Ω)' },
        { symbol: 'I', name: 'Current', description: 'Electrical current flowing through circuit', unit: 'Amperes (A)' },
        { symbol: 'P', name: 'Power', description: 'Thermal/electrical power dissipated', unit: 'Watts (W)' },
      ],
    },
    workedExample: {
      scenario: 'Evaluating current draw and power on a 120 V household circuit connected to a 10 Ω resistive heating element.',
      inputs: [
        { name: 'Voltage (V)', value: '120 V' },
        { name: 'Resistance (R)', value: '10 Ω' },
      ],
      steps: [
        'Apply Ohm’s Law: I = V / R = 120 V / 10 Ω = 12.0 Amps.',
        'Compute power dissipation: P = V × I = 120 V × 12 A = 1,440 Watts (1.44 kW).',
      ],
      result: '12 Amps (1,440.00 Watts)',
      interpretation: 'A 1,440 W heater draws 12 A, fitting safely within an 80% continuous load cap on a standard 15 A (12 A max continuous) North American branch circuit.',
    },
    regulatoryAndStandards: {
      title: 'SI Electromagnetism & Ohmic Load Boundaries',
      description: 'Electrical engineering principles and limits:',
      points: [
        'SI Definitions: 1 Ohm = 1 Volt per Ampere; 1 Watt = 1 Joule per second = 1 Volt-Ampere (for purely resistive PF = 1.0 loads).',
        'Non-Linear Devices: Diodes, LEDs, and inductive AC motors do not follow constant linear R; AC motors also require Power Factor adjustment.',
        'NEC 80% Rule: Continuous household loads should generally stay ≤ 80% of circuit breaker amperage rating.',
      ],
    },
    commonMistakes: {
      title: 'Sizing Resistors Strictly by Ohms Without Checking Wattage Rating',
      explanation: 'A 10 Ω resistor rated for 0.25 W will burn out instantly if subjected to 1,440 W.',
    },
    proTips: [
      'Doubling voltage across a fixed resistor quadruples power dissipation (P = V²/R)—always check heat ratings when raising supply voltage.',
      'Estimate monthly appliance utility cost from Watts using our Electricity Cost Calculator.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Electrical Engineering Desk',
      reviewDate: 'October 2026',
      accuracyStandard: 'Follows SI/IEC electrical laws for linear resistive circuits.',
    },
  },

  'molarity-calculator': {
    overview:
      'A Molarity Calculator computes molar solution concentration M (mol/L) and millimolarity (mM) from solute moles and total solution volume in liters.',
    detailedExplanation:
      'Molarity expresses chemical concentration per liter of finished solution rather than per liter of added solvent—making reaction stoichiometry, titrations, and buffer recipes exact across analytical and biochemistry laboratories.',
    formulaDisplay: {
      formula: 'M = n / V   |   mM = M × 1,000',
      latex: 'M = \\frac{n_{\\text{solute}}}{V_{\\text{solution}}}\\text{ (mol/L)}',
      variableDefinitions: [
        { symbol: 'n', name: 'Moles of Solute', description: 'Amount of substance (mass ÷ molar mass)', unit: 'mol' },
        { symbol: 'V', name: 'Solution Volume', description: 'Final total mixed solution volume (V > 0)', unit: 'Liters (L)' },
      ],
    },
    workedExample: {
      scenario: 'Dissolving 0.50 moles of NaCl in water and diluting to a final flask volume of 2.00 liters.',
      inputs: [
        { name: 'Solute Moles (n)', value: '0.5 mol' },
        { name: 'Final Solution Volume (V)', value: '2.0 L' },
      ],
      steps: [
        'Divide moles by liters of finished solution: 0.5 mol / 2.0 L = 0.25 mol/L (0.25 M).',
        'Convert to millimolar: 0.25 × 1,000 = 250.00 mM.',
      ],
      result: '0.25 mol / L (250.00 mM)',
      interpretation: 'Every 100 mL aliquot drawn from this volumetric flask contains 0.025 moles of solute.',
    },
    regulatoryAndStandards: {
      title: 'IUPAC Stoichiometry & Volumetric Preparation Standards',
      description: 'Analytical chemistry conventions:',
      points: [
        'Solution Volume vs. Solvent Volume: Dissolve solute partially first, then bring final volume up to the 2.0 L volumetric mark so solute displacement is included.',
        'Molarity vs. Molality: Molarity (mol/L) varies slightly with thermal expansion of liquid volume, whereas molality (mol/kg solvent) is temperature-independent.',
        'Dilution Identity: C₁V₁ = C₂V₂ computes stock volumes needed for serial dilutions.',
      ],
    },
    commonMistakes: {
      title: 'Adding Solute to 2.0 L of Water Instead of Making Up to 2.0 L Total',
      explanation: 'Adding solid solute onto 2.0 L of solvent yields >2.0 L total volume, lowering final concentration below 0.25 M.',
    },
    proTips: [
      'Divide reagent mass in grams by molecular weight (g/mol) from the bottle label to get solute moles before entering here.',
      'For strong monoprotic acid molarity, check resulting acidity directly in our pH Calculator.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Analytical Chemistry Desk',
      reviewDate: 'October 2026',
      accuracyStandard: 'Aligned with IUPAC Green Book amount-of-substance concentration definitions.',
    },
  },

  'ph-calculator': {
    overview:
      'A pH and pOH Calculator determines aqueous solution acidity or alkalinity, pOH equivalent, and hydroxide ion concentration [OH⁻] from hydrogen ion concentration [H⁺] at 25 °C.',
    detailedExplanation:
      'Because hydrogen ion concentrations span over fourteen orders of magnitude in water, Sorensen’s logarithmic pH scale turns tiny scientific decimals (10⁻⁴ M) into intuitive numbers (pH 4). At standard 25 °C water auto-ionization, pH and pOH always sum to 14.0.',
    formulaDisplay: {
      formula: 'pH = -log₁₀[H⁺]   |   pOH = 14 - pH   |   [H⁺][OH⁻] = 10⁻¹⁴ M² (at 25 °C)',
      latex: '\\text{pH} = -\\log_{10}[\\text{H}^+], \\quad \\text{pH} + \\text{pOH} = 14',
      variableDefinitions: [
        { symbol: '[H⁺]', name: 'Hydronium Concentration', description: 'Strictly positive molarity of H⁺ ions', unit: 'mol/L (M)' },
        { symbol: 'pOH', name: 'Hydroxide Index', description: '14 - pH at standard 25 °C', unit: 'Log scale' },
      ],
    },
    workedExample: {
      scenario: 'Evaluating an acidic solution with [H⁺] = 0.0001 M (1.0 × 10⁻⁴ mol/L).',
      inputs: [
        { name: '[H⁺] Concentration', value: '0.0001 M (10⁻⁴ M)' },
      ],
      steps: [
        'Take base-10 logarithm: log₁₀(10⁻⁴) = -4.',
        'Negate: pH = -(-4) = 4.00 (Acidic).',
        'Solve pOH = 14 - 4 = 10.00 ⇒ [OH⁻] = 10⁻¹⁰ M.',
      ],
      result: 'pH 4.00 (Acidic; pOH = 10; [OH⁻] = 1.000e-10 M)',
      interpretation: 'Every 1-unit drop in pH represents a 10× jump in hydrogen ion acidity (pH 4 is 1,000× more acidic than neutral pH 7 water).',
    },
    regulatoryAndStandards: {
      title: 'IUPAC Aqueous Equilibrium & Temperature Conventions',
      description: 'Physical chemistry boundaries for pH calculations:',
      points: [
        'Neutral Water Reference (25 °C): Pure water has Kw = 1.0 × 10⁻¹⁴ so neutral pH equals 7.00; hot water shifts Kw slightly.',
        'Strong vs. Weak Acids: Strong acids (HCl, HNO₃) dissociate ~100% so [H⁺] ≈ initial acid molarity; weak acids (acetic acid) require Ka equilibrium.',
        'Positivity Guard: [H⁺] must remain strictly positive (> 0 M).',
      ],
    },
    commonMistakes: {
      title: 'Plugging Weak-Acid Molarity Directly Into -log₁₀ Without Ka',
      explanation: 'A 0.1 M vinegar solution is weak and only partially ionized (~pH 2.9), unlike strong 0.1 M HCl (pH 1.0).',
    },
    proTips: [
      'Remember that pH 7 is neutral, < 7 is acidic, and > 7 is basic/alkaline at 25 °C.',
      'Calculate stock solution concentration in mol/L first with our Molarity Calculator.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Analytical Chemistry Desk',
      reviewDate: 'October 2026',
      accuracyStandard: 'Follows IUPAC 25 °C aqueous auto-ionization equilibrium definitions.',
    },
  },

  'kinetic-energy-calculator': {
    overview:
      'A Kinetic Energy Calculator computes classical translational kinetic energy KE = ½mv² in Joules, kilojoules, and kilocalories from object mass (kg) and velocity (m/s).',
    detailedExplanation:
      'Because velocity enters quadratically (v²), doubling a vehicle or projectile’s speed increases kinetic impact energy fourfold—explaining why braking distances and collision forces escalate sharply with speed.',
    formulaDisplay: {
      formula: 'KE = 0.5 × m × v²',
      latex: 'KE = \\frac{1}{2} m v^2',
      variableDefinitions: [
        { symbol: 'm', name: 'Object Mass', description: 'Non-negative inertial mass', unit: 'Kilograms (kg)' },
        { symbol: 'v', name: 'Velocity', description: 'Speed in meters per second', unit: 'm/s' },
        { symbol: 'KE', name: 'Kinetic Energy', description: 'Translational energy of motion', unit: 'Joules (J)' },
      ],
    },
    workedExample: {
      scenario: 'Calculating the kinetic energy of a 2 kg object moving at 3 m/s.',
      inputs: [
        { name: 'Mass (m)', value: '2 kg' },
        { name: 'Velocity (v)', value: '3 m/s' },
      ],
      steps: [
        'Square the velocity: 3² = 9 m²/s².',
        'Multiply by 0.5 × mass: 0.5 × 2 × 9 = 9.0 Joules (0.0090 kJ / ~0.0022 kcal).',
      ],
      result: '9 Joules (0.0090 kJ)',
      interpretation: 'Raising the same 2 kg mass from 3 m/s to 6 m/s quadruples kinetic energy from 9 J to 36 J.',
    },
    regulatoryAndStandards: {
      title: 'SI Classical Mechanics & Relativistic Regime',
      description: 'Domain boundaries for Newtonian kinetic energy:',
      points: [
        'SI Energy Unit: 1 Joule = 1 kg·m²/s²; 1 kcal = 4,184 Joules.',
        'Newtonian Approximation: Valid for everyday velocities far below the speed of light (v ≪ c).',
        'Rotational vs. Translational: Rolling wheels or flywheels carry additional rotational energy ½Iω² beyond linear ½mv².',
      ],
    },
    commonMistakes: {
      title: 'Entering Speed in km/h or mph Directly Without Converting to m/s',
      explanation: 'Divide km/h by 3.6 (or check our Velocity Calculator) before plugging v into ½mv².',
    },
    proTips: [
      'Convert speed cleanly to m/s first using our Velocity Calculator.',
      'Check braking impact scaling: 60 mph holds 4× the kinetic energy of 30 mph.',
    ],
    editorialReview: {
      reviewedBy: 'Numeriq Physics & Mechanics Desk',
      reviewDate: 'October 2026',
      accuracyStandard: 'Follows SI/ISO 80000 classical Newtonian work-energy definitions.',
    },
  },
};
