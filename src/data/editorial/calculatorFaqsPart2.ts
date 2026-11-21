import type { FAQItem } from '../calculatorFaqs.ts';

export const calculatorFaqsPart2: Record<string, FAQItem[]> = {
  // ==========================================================
  // HEALTH & FITNESS (10)
  // ==========================================================
  'bmi-calculator': [
    {
      question: 'What are the standard WHO adult BMI weight categories?',
      answer: 'Under WHO and CDC adult guidelines, a BMI below 18.5 kg/m² is underweight, 18.5–24.9 is normal weight, 25.0–29.9 is overweight, and 30.0 or higher indicates obesity.',
    },
    {
      question: 'Why can athletic individuals score high on BMI despite low body fat?',
      answer: 'BMI uses total body weight divided by height squared without distinguishing lean muscle or bone mass from adipose tissue, so dense muscle mass elevates the score.',
    },
    {
      question: 'Are adult BMI cutoffs valid for children and teenagers?',
      answer: 'No. Pediatric BMI for ages 2 to 19 must be plotted on CDC age-and-sex percentile charts rather than evaluated against fixed adult thresholds.',
    },
  ],
  'calorie-calculator': [
    {
      question: 'What is the difference between BMR and TDEE?',
      answer: 'BMR (Basal Metabolic Rate) measures calories burned solely to keep vital organs functioning at complete rest, whereas TDEE (Total Daily Energy Expenditure) multiplies BMR by an activity factor covering daily movement and exercise.',
    },
    {
      question: 'Why does Numeriq use the Mifflin-St Jeor equation?',
      answer: 'Clinical validation studies (including American Dietetic Association reviews) rank Mifflin-St Jeor as the most consistently accurate predictive equation for modern non-athlete populations when lean mass is unknown.',
    },
    {
      question: 'How large should a sustainable daily calorie deficit be?',
      answer: 'A modest deficit of 300–500 kcal/day below TDEE typically targets gradual fat loss of roughly 0.5 to 1 lb (0.25–0.45 kg) per week while preserving muscle mass and energy.',
    },
  ],
  'body-fat-calculator': [
    {
      question: 'Where should you measure waist circumference for the US Navy formula?',
      answer: 'Under US Navy protocol, men measure horizontally around the navel (belly button) relaxed without sucking in, whereas women measure at the narrowest natural waist alongside hips at the widest gluteal circumference.',
    },
    {
      question: 'How accurate is the US Navy tape-measure method?',
      answer: 'When measured consistently in the morning before meals, the US Navy equation generally estimates body fat percentage within 3%–4% of hydrostatic or DEXA clinical scans—ideal for tracking trends over time.',
    },
    {
      question: 'What are typical essential body fat minimums for men and women?',
      answer: 'American Council on Exercise (ACE) classifications place essential physiological fat near 2%–5% for men and 10%–13% for women, with athletic ranges higher.',
    },
  ],
  'target-heart-rate-calculator': [
    {
      question: 'How does the Karvonen method differ from simple % of Max Heart Rate?',
      answer: 'Karvonen uses Heart Rate Reserve (HRR = Max HR − Resting HR), scaling workout intensity between your actual resting baseline and maximum ceiling rather than assuming everyone shares the same resting heart rate.',
    },
    {
      question: 'Why does the Tanaka formula (208 − 0.7 × Age) replace "220 − Age"?',
      answer: 'Meta-analyses by Hirofumi Tanaka showed the classic 220 − Age rule tends to overestimate maximum heart rate in younger adults and underestimate it in older adults.',
    },
    {
      question: 'Which heart rate zone targets aerobic endurance vs. peak anaerobic intervals?',
      answer: 'Zone 2 (60%–70% HRR) develops foundational aerobic capacity and mitochondrial endurance, while Zone 4–5 (80%–100% HRR) trains lactate threshold and maximal VO₂ capacity.',
    },
  ],
  'macronutrient-calculator': [
    {
      question: 'How many calories are in 1 gram of protein, carbohydrate, and fat?',
      answer: 'Protein and carbohydrates each provide roughly 4 kcal per gram, whereas dietary fat provides 9 kcal per gram (more than double the caloric density).',
    },
    {
      question: 'How much protein is recommended during muscle gain or fat loss?',
      answer: 'Sports nutrition consensus commonly recommends roughly 1.6–2.2 g of protein per kilogram of body weight (or roughly 25%–35% of total calories depending on target) to support muscle protein synthesis.',
    },
    {
      question: 'Why do low-fat diets still require a minimum fat floor?',
      answer: 'Dietary lipids are necessary for absorbing fat-soluble vitamins (A, D, E, and K) and synthesizing steroid hormones; dropping fat too low for extended periods can impair hormonal balance.',
    },
  ],
  'running-pace-calculator': [
    {
      question: 'How is running pace converted from minutes per kilometer to minutes per mile?',
      answer: 'Because 1 mile equals 1.60934 kilometers, multiply your min/km pace by 1.60934—for example, a 5:00/km pace equals roughly 8:03/mile.',
    },
    {
      question: 'What marathon finish time corresponds to an 8:00/mile pace?',
      answer: 'Multiplying 8 minutes/mile by 26.2188 miles yields approximately 3 hours, 29 minutes, and 45 seconds for a full marathon.',
    },
    {
      question: 'Why do runners track negative splits?',
      answer: 'A negative split—running the second half of a race slightly faster than the first—prevents early glycogen depletion and lactate buildup for stronger finish times.',
    },
  ],
  'due-date-calculator': [
    {
      question: 'What is Naegele’s Rule for estimating a pregnancy due date?',
      answer: 'Naegele’s Rule adds 280 days (40 weeks) to the first day of the Last Menstrual Period (LMP), adjusted by adding or subtracting days if your typical menstrual cycle differs from 28 days.',
    },
    {
      question: 'How accurate is an LMP-based Estimated Delivery Date?',
      answer: 'Only about 4%–5% of births occur on the exact EDD, though most spontaneous full-term deliveries happen between 37 and 42 weeks; first-trimester ultrasound measurements supersede LMP if dates differ significantly.',
    },
    {
      question: 'When do the three pregnancy trimesters begin and end?',
      answer: 'Clinically under ACOG conventions, Trimester 1 spans Weeks 0–13, Trimester 2 spans Weeks 14–27, and Trimester 3 runs from Week 28 until delivery.',
    },
  ],
  'ovulation-calculator': [
    {
      question: 'Why does the fertile window span 6 days if an egg lives only 24 hours?',
      answer: 'Human sperm can survive in fertile cervical mucus for up to 5 days, so intercourse during the 5 days leading up to ovulation plus ovulation day itself creates a 6-day conception window.',
    },
    {
      question: 'How does cycle length change ovulation timing?',
      answer: 'The post-ovulation luteal phase tends to stay relatively steady near 14 days, so ovulation typically shifts earlier or later along with overall cycle length (estimated around Cycle Length − 14 days).',
    },
    {
      question: 'Should this ovulation estimator be used as contraception?',
      answer: 'No. Cycle-length estimation is for educational fertility awareness and family planning tracking only, because stress, illness, and natural cycle variability can shift ovulation unpredictably.',
    },
  ],
  'ideal-weight-calculator': [
    {
      question: 'Why do Devine, Robinson, Miller, and Hamwi formulas give slightly different weights?',
      answer: 'Each clinical equation was fitted to different historical actuarial and clinical cohorts between the 1960s and 1980s, originally developed by physicians (such as B.J. Devine) for pharmacokinetic drug dosing rather than aesthetics.',
    },
    {
      question: 'Do ideal weight formulas apply below 5 feet (60 inches) in height?',
      answer: 'Traditional equations benchmark inches above 5 feet (60 inches); for statures under 5 feet, predictive accuracy drops and clinical assessment with BMI or body composition is preferable.',
    },
    {
      question: 'What is a healthy way to interpret Ideal Body Weight outputs?',
      answer: 'Treat the range across all four formulas alongside a healthy BMI interval as a general reference zone rather than a rigid target number, accounting for muscle mass and bone frame.',
    },
  ],
  'water-intake-calculator': [
    {
      question: 'How much extra water should you add for exercise?',
      answer: 'Hydration guidelines commonly add roughly 350–700 mL (12–24 oz) per hour of moderate-to-vigorous training—more in hot or humid environments where sweat loss spikes.',
    },
    {
      question: 'Do coffee, tea, and water-rich foods count toward daily hydration?',
      answer: 'Yes. Roughly 20% of daily fluid intake typically comes from water-rich fruits, vegetables, and soups, and moderate caffeinated coffee or tea still contributes positively to net hydration.',
    },
    {
      question: 'Can drinking excessive water too quickly be harmful?',
      answer: 'Yes. Consuming extreme volumes of plain water in a short time without electrolytes can dilute blood sodium levels (hyponatremia); listen to thirst and monitor pale-straw urine color.',
    },
  ],

  // ==========================================================
  // UNIT CONVERTERS (5)
  // ==========================================================
  'unit-converter': [
    {
      question: 'Why does 1 inch equal exactly 2.54 centimeters?',
      answer: 'Under the 1959 International Yard and Pound Agreement signed by six English-speaking nations, the international inch was standardized as exactly 25.4 millimeters (2.54 cm).',
    },
    {
      question: 'How do you convert Celsius to Fahrenheit accurately?',
      answer: 'Multiply Celsius by 9/5 (1.8) and add 32. Unlike length or mass units, temperature scales have different zero baselines (0 °C = 32 °F), so a simple proportional factor alone will not work.',
    },
    {
      question: 'What is the difference between a US liquid gallon and a UK Imperial gallon?',
      answer: 'A US liquid gallon equals 3.78541 liters (128 US fl oz), whereas a UK Imperial gallon is roughly 20% larger at 4.54609 liters.',
    },
  ],
  'energy-converter': [
    {
      question: 'What is the difference between a small calorie (cal) and a food Calorie (kcal)?',
      answer: 'One nutrition label "Calorie" (capital C) is actually 1 kilocalorie (1,000 thermochemical calories), equal to 4,184 Joules.',
    },
    {
      question: 'How many Joules are in 1 kilowatt-hour (kWh)?',
      answer: 'Because 1 Watt equals 1 Joule per second and 1 hour has 3,600 seconds, 1 kWh equals 1,000 × 3,600 = 3,600,000 Joules (3.6 MJ).',
    },
    {
      question: 'Why does electrical billing use kWh instead of Joules?',
      answer: 'Megajoules and Gigajoules produce large numbers for household appliance usage, whereas kWh scales cleanly for monthly utility metering.',
    },
  ],
  'fuel-economy-converter': [
    {
      question: 'Why is the relationship between MPG and L/100km inverse rather than linear?',
      answer: 'MPG measures distance per unit of fuel, whereas L/100km measures fuel per unit of distance. Converting between them uses L/100km = 235.215 ÷ US MPG.',
    },
    {
      question: 'Why does upgrading from 15 MPG to 20 MPG save more gas than upgrading from 40 MPG to 50 MPG?',
      answer: 'Over 10,000 miles, moving from 15 to 20 MPG cuts fuel used from 667 gallons to 500 gallons (saving 167 gallons), while 40 to 50 MPG drops fuel used from 250 to 200 gallons (saving 50 gallons).',
    },
    {
      question: 'Why are UK MPG figures roughly 20% higher than US MPG figures?',
      answer: 'The UK Imperial gallon contains 4.54609 liters compared with the smaller 3.78541-liter US gallon, so the exact same car travels about 20.1% farther per Imperial gallon.',
    },
  ],
  'data-storage-converter': [
    {
      question: 'Why does my 1 TB hard drive show only ~931 GB in Windows?',
      answer: 'Storage manufacturers advertise capacities in decimal SI units (1 TB = 10¹² bytes), while Windows reports GiB/TiB-sized binary powers of 1024 (2⁴⁰ bytes), making 1,000⁴ ÷ 1,024³ ≈ 931.32 GiB.',
    },
    {
      question: 'What is the difference between a bit and a byte?',
      answer: 'One byte equals 8 binary bits. Internet speeds are typically quoted in megabits per second (Mbps), while file sizes are measured in megabytes (MB)—so a 100 Mbps connection downloads at up to 12.5 MB/s.',
    },
    {
      question: 'What are IEC binary prefixes (KiB, MiB, GiB, TiB)?',
      answer: 'Defined by the IEC, kibibyte (KiB = 1024 B), mebibyte (MiB = 1024² B), and gibibyte (GiB = 1024³ B) eliminate ambiguity against decimal SI prefixes (1000, 1000², 1000³).',
    },
  ],
  'cooking-volume-converter': [
    {
      question: 'How many teaspoons and tablespoons are in 1 US cup?',
      answer: 'Under standard US culinary conversions, 1 cup = 16 tablespoons = 48 teaspoons = 8 US fluid ounces (approximately 236.59 mL).',
    },
    {
      question: 'Why is US metric tablespoon 15 mL while US customary is ~14.79 mL?',
      answer: 'Food nutrition labeling (FDA/USDA) defines a convenient 15 mL metric tablespoon and 240 mL cup, whereas US customary liquid volume derives 14.7868 mL and 236.588 mL from the 231-cubic-inch gallon.',
    },
    {
      question: 'Does weight in grams always convert identically for flour, sugar, and water?',
      answer: 'No. Milliliters measure volume while grams measure mass. Because 1 mL of water weighs 1 g while 1 cup of sifted flour weighs roughly 120–125 g vs. ~200 g for sugar, only convert density-specifically to weight.',
    },
  ],

  // ==========================================================
  // DATE & TIME (5)
  // ==========================================================
  'age-calculator': [
    {
      question: 'How does the Age Calculator handle differing month lengths and leap years?',
      answer: 'It calculates calendar years, exact remaining months based on the actual previous month length (28, 29, 30, or 31 days), and total elapsed days using UTC calendar timestamps so Daylight Saving shifts never distort the count.',
    },
    {
      question: 'When is February 29 birthday celebrated in non-leap years?',
      answer: 'Exact chronological day counts still track the precise elapsed days from birth, while legal age milestones generally advance on February 28 or March 1 depending on jurisdiction.',
    },
    {
      question: 'Does the calculator show how many total days and hours I have lived?',
      answer: 'Yes. Alongside years/months/days, it reports total days lived, total hours, and a countdown until your upcoming birthday.',
    },
  ],
  'days-between-dates-calculator': [
    {
      question: 'Does the day count exclude the start date or count both endpoints?',
      answer: 'Standard date subtraction counts elapsed calendar days between Start Date and End Date (for example, May 1 to May 2 equals 1 day elapsed).',
    },
    {
      question: 'How does Daylight Saving Time affect date differences?',
      answer: 'Evaluating UTC midnight calendar dates prevents 23-hour spring-forward or 25-hour fall-back transitions from causing fractional rounding errors of ±1 day.',
    },
    {
      question: 'Does the calculator also show business days and weekend days?',
      answer: 'Yes. It separates total calendar days into weekday business days (Monday–Friday) and Saturday/Sunday weekend days.',
    },
  ],
  'hours-calculator': [
    {
      question: 'Why do payroll systems require decimal hours instead of hours:minutes?',
      answer: 'You cannot multiply "8:45" directly by $25/hour—instead 45 minutes converts to 45 ÷ 60 = 0.75 hours, so 8.75 × $25 = $218.75.',
    },
    {
      question: 'How are unpaid meal breaks subtracted in the Time Card calculator?',
      answer: 'Enter shift length parameters and unpaid break minutes; the engine deducts break duration before computing daily net paid hours and weekly/gross wage totals.',
    },
    {
      question: 'Does the calculator handle overnight shifts that cross midnight?',
      answer: 'When clock-out is entered later on the same cycle or adjusted beyond clock-in, elapsed minutes accurately compute total shift duration without negative errors.',
    },
  ],
  'business-days-calculator': [
    {
      question: 'What is the difference between calendar days and business days?',
      answer: 'Calendar days count every day including Saturdays, Sundays, and public holidays, whereas business days count only Monday–Friday working days excluding listed public holidays.',
    },
    {
      question: 'Why are holidays subtracted after counting weekdays?',
      answer: 'If an observed public holiday falls on a weekday, it reduces net shipping or SLA working days by 1. Holidays falling on Saturday or Sunday are already excluded by weekend filtering.',
    },
    {
      question: 'Where are business-day calculations used most often?',
      answer: 'They govern ACH bank clearing windows, shipping transit SLAs, contract notice deadlines, and corporate PTO accrual planning.',
    },
  ],
  'time-zone-calculator': [
    {
      question: 'What is UTC (Coordinated Universal Time)?',
      answer: 'UTC is the primary global timekeeping standard from which all regional time zones are expressed as positive or negative hour offsets (such as UTC−5 for US Eastern Standard Time or UTC+4 for Gulf Standard Time).',
    },
    {
      question: 'Why does EST vs. EDT differ by one hour?',
      answer: 'EST (UTC−5) applies during winter Standard Time, whereas EDT (UTC−4) applies during Daylight Saving Time between March and November. Regions like Dubai (GST, UTC+4) do not observe DST, shifting relative differences seasonally.',
    },
    {
      question: 'How should international teams schedule recurring cross-timezone meetings?',
      answer: 'Anchor recurring calendars to the host city’s local IANA zone rather than a fixed UTC offset so Daylight Saving shifts propagate cleanly.',
    },
  ],

  // ==========================================================
  // EDUCATION (5)
  // ==========================================================
  'gpa-calculator': [
    {
      question: 'How is a weighted credit-hour GPA calculated?',
      answer: 'Multiply each course’s grade point value (on the 4.0 scale) by its credit hours to get quality points, sum all quality points, and divide by total attempted credit hours.',
    },
    {
      question: 'How do prior cumulative credits combine with this semester’s courses?',
      answer: 'Multiply your prior GPA by prior credits to find existing quality points, add this term’s new quality points, and divide by (Prior Credits + New Credits).',
    },
    {
      question: 'Why do high-credit lab or studio courses affect GPA more than 1-credit seminars?',
      answer: 'Because credit hours act as weights: a 4-credit science course carries four times the quality-point impact of a 1-credit elective.',
    },
  ],
  'final-grade-calculator': [
    {
      question: 'How do you calculate the score needed on a weighted final exam?',
      answer: 'Use Needed Final = [Target Grade − Current Grade × (1 − Final Weight)] ÷ Final Weight, where weights are expressed as decimals (e.g., 25% = 0.25).',
    },
    {
      question: 'What does it mean if my needed final exam score is above 100%?',
      answer: 'A required score exceeding 100% indicates the target grade is mathematically unreachable through a standard 100-point final exam unless the instructor offers extra credit or a curve.',
    },
    {
      question: 'What if the final exam needed score is negative?',
      answer: 'A negative required score means you have already secured enough weighted points during the semester to guarantee your target letter grade regardless of how low you score—though you should still check syllabus minimum-passing rules.',
    },
  ],
  'grade-calculator': [
    {
      question: 'How are percentage scores mapped to letter grades and 4.0 GPA points?',
      answer: 'Standard US academic grading typically maps 93%–100% to A (4.0), 90%–92.9% to A− (3.7), 87%–89.9% to B+ (3.3), 83%–86.9% to B (3.0), down to below 60% as F (0.0).',
    },
    {
      question: 'Do all schools use the exact same plus/minus grading cutoffs?',
      answer: 'No. Some universities omit plus/minus steps (using flat A=4.0, B=3.0) or treat A− as 3.67 instead of 3.7—always verify against your institution’s registrar syllabus.',
    },
    {
      question: 'How do I calculate my raw test percentage?',
      answer: 'Divide Points Earned by Total Possible Points and multiply by 100.',
    },
  ],
  'reading-speed-calculator': [
    {
      question: 'What is the average adult reading speed in Words Per Minute (WPM)?',
      answer: 'Most native adult readers read non-technical English prose silently at roughly 200 to 250 WPM, while dense academic or legal material slows comprehension to 100–150 WPM.',
    },
    {
      question: 'How do I estimate how long it will take to finish a book?',
      answer: 'Multiply total page count by average words per page (~250–300 words for standard trade paperbacks) and divide by your measured WPM.',
    },
    {
      question: 'Does skimming faster hurt reading comprehension?',
      answer: 'Research consistently shows reading speeds above 400–500 WPM shift into skimming rather than full word-by-word comprehension, lowering retention on unfamiliar or technical texts.',
    },
  ],
  'word-counter': [
    {
      question: 'How does the Word & Character Counter define a "word"?',
      answer: 'Text is split across whitespace boundaries after trimming leading/trailing spaces, avoiding inflating word counts on double spaces or blank lines.',
    },
    {
      question: 'What is the difference between characters with spaces vs. without spaces?',
      answer: 'Characters with spaces counts every character including spaces and punctuation (used by social media and SMS limits), while without-spaces counts only visible glyphs.',
    },
    {
      question: 'How is estimated reading time calculated from word count?',
      answer: 'Estimated reading time divides total words by standard adult reading speed (~200–225 words per minute) rounded nicely for blog and article planning.',
    },
  ],

  // ==========================================================
  // SCIENCE & ENGINEERING (5)
  // ==========================================================
  'velocity-calculator': [
    {
      question: 'What is the difference between speed and velocity?',
      answer: 'Speed is a scalar magnitude (e.g., 60 km/h), whereas velocity is a vector combining magnitude and direction (displacement ÷ elapsed time). If an object makes a round trip back to its starting point, net displacement—and average velocity—is zero.',
    },
    {
      question: 'How do you convert meters per second (m/s) to km/h and mph?',
      answer: 'Multiply m/s by 3.6 to get km/h, or multiply m/s by 2.23694 to convert to miles per hour (mph).',
    },
    {
      question: 'Does v = Δx / Δt assume constant velocity or average velocity?',
      answer: 'Dividing total displacement by total time always yields exact average velocity over that interval, which equals instantaneous velocity when motion is uniform.',
    },
  ],
  'ohms-law-calculator': [
    {
      question: 'What does Ohm’s Law state about voltage, current, and resistance?',
      answer: 'Ohm’s Law states that voltage V across an ohmic conductor equals current I multiplied by resistance R (V = I × R). Increasing resistance at fixed voltage reduces current proportionally.',
    },
    {
      question: 'How do you calculate electrical power (Watts) from Ohm’s Law?',
      answer: 'Power equals P = V × I, which also rearranges via substitution to P = I²R or P = V² / R.',
    },
    {
      question: 'Why does resistance close to zero cause dangerous short circuits?',
      answer: 'Because I = V / R, when resistance R drops near 0 Ω at constant mains or battery voltage, electrical current I spikes rapidly, generating intense I²R heat.',
    },
  ],
  'molarity-calculator': [
    {
      question: 'What is the difference between Molarity (M) and Molality (m)?',
      answer: 'Molarity equals moles of solute per liter of total solution (mol/L) and varies slightly with temperature as liquid volume expands. Molality equals moles of solute per kilogram of solvent and stays temperature-independent.',
    },
    {
      question: 'How do you prepare a 1 M solution properly in a lab?',
      answer: 'Dissolve 1 mole of solute in slightly less than 1 L of solvent inside a volumetric flask, then dilute carefully up to the 1.000 L calibration mark—do not simply add 1 L of water on top of solid solute.',
    },
    {
      question: 'How can I convert molarity back to grams of solute?',
      answer: 'Multiply Molarity (mol/L) × Volume (L) to obtain total moles, then multiply by the compound’s molar mass (g/mol).',
    },
  ],
  'ph-calculator': [
    {
      question: 'What does the pH scale measure?',
      answer: 'pH = −log₁₀[H⁺] measures hydrogen ion activity in aqueous solutions. At 25 °C, pH 7.0 is neutral, below 7 is acidic, and above 7 is basic/alkaline.',
    },
    {
      question: 'Why does a 1-unit drop in pH mean 10× higher acidity?',
      answer: 'Because the pH scale is base-10 logarithmic, moving from pH 5 to pH 4 increases hydrogen ion [H⁺] concentration tenfold, and moving to pH 3 increases it 100-fold.',
    },
    {
      question: 'Why do pH + pOH always sum to 14 at 25 °C?',
      answer: 'At 25 °C, the autoionization constant of pure water is Kw = [H⁺][OH⁻] = 1.0 × 10⁻¹⁴, so taking −log₁₀ of both sides yields pH + pOH = 14.',
    },
  ],
  'kinetic-energy-calculator': [
    {
      question: 'Why does doubling speed quadruple kinetic energy?',
      answer: 'In classical mechanics, KE = ½ m v² depends on velocity squared. Doubling velocity multiplies energy by 2² = 4×, which explains why highway braking distances grow dramatically faster than speed.',
    },
    {
      question: 'What units must be used in KE = ½ m v² to obtain Joules?',
      answer: 'Enter mass in kilograms (kg) and velocity in meters per second (m/s); because 1 J = 1 kg·m²/s², SI inputs produce Joules directly.',
    },
    {
      question: 'Can kinetic energy ever be negative?',
      answer: 'No. Because mass is positive and velocity squared (v²) is always ≥ 0, classical translational kinetic energy is always zero or positive.',
    },
  ],

  // ==========================================================
  // HOME & TECH (5)
  // ==========================================================
  'concrete-calculator': [
    {
      question: 'Why are concrete ready-mix trucks ordered in cubic yards instead of cubic feet?',
      answer: 'A cubic yard measures 3 ft × 3 ft × 3 ft = 27 cubic feet. Dividing (Length × Width × Thickness in feet) by 27 converts slab volume directly into standard North American ready-mix truck units.',
    },
    {
      question: 'How many 80-lb premix concrete bags make 1 cubic yard?',
      answer: 'One standard 80-lb concrete bag yields roughly 0.60 cubic feet, so 1 cubic yard (27 cu ft) requires 45 bags of 80-lb concrete (or about 60 bags of 60-lb mix).',
    },
    {
      question: 'Should I add a waste buffer before ordering concrete?',
      answer: 'Yes. Contractors routinely add 5%–10% extra concrete volume to cover uneven subgrade excavation, form deflection, and mixer chute leftovers.',
    },
  ],
  'paint-calculator': [
    {
      question: 'How much wall area does one gallon of interior paint typically cover?',
      answer: 'Standard smooth interior latex paint generally covers 350 to 400 square feet per gallon for one coat; textured drywall, bare plaster, or dramatic dark-to-light color changes often require primer plus two coats.',
    },
    {
      question: 'How are doors and windows subtracted cleanly?',
      answer: 'Measure wall perimeter × ceiling height for gross square footage, then subtract roughly 20–21 sq ft per standard door and 12–15 sq ft per standard window so you do not overbuy paint.',
    },
    {
      question: 'When should I buy an extra quart instead of rounding up to a full gallon?',
      answer: 'If your final two-coat requirement lands slightly above an exact gallon boundary (for instance 2.15 gallons), buying 2 gallons plus 1 quart avoids storing unused surplus paint.',
    },
  ],
  'solar-panel-calculator': [
    {
      question: 'What does "Peak Sun Hours" mean in solar sizing?',
      answer: 'Peak sun hours represent equivalent hours per day at full 1,000 W/m² noon irradiance—not total daylight hours. Most US locations average 3.5 to 5.5 peak sun hours per day annually.',
    },
    {
      question: 'Why does the solar generation equation include a 0.80 efficiency factor?',
      answer: 'Real photovoltaic systems lose roughly 15%–20% of nameplate DC output to inverter conversion, panel heat derating, wiring resistance, dust, and seasonal shading.',
    },
    {
      question: 'How does net metering improve residential solar payback?',
      answer: 'Net metering credits surplus midday solar kilowatt-hours sent back to the utility grid against evening electricity consumption, cutting payback time substantially.',
    },
  ],
  'electricity-cost-calculator': [
    {
      question: 'How do you convert appliance Watts to kilowatt-hours (kWh)?',
      answer: 'Divide nameplate power in Watts by 1,000 to get kilowatts (kW), multiply by daily operating hours, and multiply by your utility rate ($/kWh) to compute daily, monthly, and annual running cost.',
    },
    {
      question: 'Why does a 1,500 W space heater cost much more per month than a 150 W refrigerator?',
      answer: 'A 1,500 W heater running continuously consumes 1.5 kWh every hour (~$162/mo at $0.15/kWh for 24h), whereas a refrigerator compressor cycles on only part-time and draws far less average wattage.',
    },
    {
      question: 'Where do I find my utility electricity rate?',
      answer: 'Divide total electricity charges (energy + delivery per kWh fees, excluding fixed monthly meter charges) on your recent utility bill by total kWh consumed.',
    },
  ],
  'subnet-calculator': [
    {
      question: 'Why are 2 IP addresses subtracted in 2^(32 − CIDR) − 2?',
      answer: 'In standard IPv4 subnetting, the very first address identifies the network itself and the very last address serves as the subnet broadcast address, leaving 2^(32 − CIDR) − 2 usable host IPs.',
    },
    {
      question: 'What happens with /31 and /32 CIDR prefixes?',
      answer: 'A /32 represents a single host route (1 address), while RFC 3021 defines /31 point-to-point router links using both addresses without a separate network/broadcast address.',
    },
    {
      question: 'What is the subnet mask and usable host count for a /24 network?',
      answer: 'A /24 prefix sets 24 network bits (subnet mask 255.255.255.0) and leaves 8 host bits, yielding 2⁸ − 2 = 254 usable host addresses.',
    },
  ],
};
