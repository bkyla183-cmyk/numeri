import { CalculatorSpec } from './types';

export const domainLifestyleMisc: CalculatorSpec[] = [
  // ==========================================
  // PREGNANCY & FAMILY (10)
  // ==========================================
  {
    slug: 'due-date-calculator',
    title: 'Pregnancy Due Date Calculator',
    description: 'Calculate your estimated date of delivery (EDD) using Naegele rule based on last menstrual period or conception date.',
    category: 'pregnancy-family',
    inputs: [
      { id: 'days_since_lmp', label: 'Days Elapsed Since First Day of Last Period (LMP)', type: 'number', defaultValue: 65, min: 0, max: 280, step: 1, unit: 'days' },
      { id: 'cycle_length', label: 'Average Menstrual Cycle Length (Days)', type: 'number', defaultValue: 28, min: 21, max: 40, step: 1, unit: 'days' }
    ],
    calculate: (inputs) => {
      const elapsed = inputs.days_since_lmp || 0;
      const cycle = inputs.cycle_length || 28;
      const cycleAdjustment = cycle - 28;

      const totalPregnancyDays = 280 + cycleAdjustment;
      const daysRemaining = Math.max(0, totalPregnancyDays - elapsed);
      const weeksElapsed = Math.floor(elapsed / 7);
      const daysExtra = elapsed % 7;

      let trimester = 'First Trimester (Weeks 1-12)';
      if (weeksElapsed >= 28) trimester = 'Third Trimester (Weeks 28-40)';
      else if (weeksElapsed >= 13) trimester = 'Second Trimester (Weeks 13-27)';

      return {
        primaryOutput: daysRemaining,
        primaryUnit: 'Days Until Estimated Due Date',
        secondaryOutputs: [
          { label: 'Current Gestational Age', value: `${weeksElapsed} weeks, ${daysExtra} days` },
          { label: 'Trimester', value: trimester },
          { label: 'Pregnancy Progress', value: parseFloat(((elapsed / totalPregnancyDays) * 100).toFixed(1)), unit: '%' }
        ],
        steps: [
          'Naegele rule: Estimated Due Date = LMP + 280 days + (Cycle Length - 28 days)',
          `Elapsed: ${weeksElapsed} weeks ${daysExtra} days (${elapsed} days)`,
          `Remaining until due date: ${daysRemaining} days`
        ]
      };
    }
  },
  {
    slug: 'ovulation-calculator',
    title: 'Ovulation & Fertility Window',
    description: 'Predict your most fertile days and estimated ovulation window based on cycle regularity.',
    inputs: [
      { id: 'cycle_length', label: 'Average Menstrual Cycle Length (Days)', type: 'number', defaultValue: 28, min: 21, max: 40, step: 1, unit: 'days' },
      { id: 'current_cycle_day', label: 'Current Day of Cycle (Day 1 = Period Starts)', type: 'number', defaultValue: 10, min: 1, max: 40, step: 1, unit: 'day' }
    ],
    calculate: (inputs) => {
      const cycle = inputs.cycle_length || 28;
      const current = inputs.current_cycle_day || 1;

      const ovulationDay = cycle - 14;
      const fertileStart = ovulationDay - 5;
      const fertileEnd = ovulationDay + 1;

      const daysToOvulation = ovulationDay - current;
      let status = 'Pre-Fertile Phase';
      if (current >= fertileStart && current <= fertileEnd) {
        status = current === ovulationDay ? 'PEAK FERTILITY (Ovulation Day)' : 'HIGH FERTILITY WINDOW';
      } else if (current > fertileEnd) {
        status = 'Post-Ovulatory / Luteal Phase';
      }

      return {
        primaryOutput: ovulationDay,
        primaryUnit: 'Cycle Day of Ovulation',
        secondaryOutputs: [
          { label: 'Fertile Window Span', value: `Days ${fertileStart} to ${fertileEnd}` },
          { label: 'Days Until Ovulation', value: daysToOvulation >= 0 ? daysToOvulation : 'Passed this cycle' },
          { label: 'Current Fertility Status', value: status }
        ],
        steps: [
          'Standard Luteal Phase = 14 days before next cycle',
          `Ovulation occurs on Cycle Day: ${cycle} - 14 = Day ${ovulationDay}`,
          `Fertile window opens 5 days prior (Day ${fertileStart}) through 1 day after (Day ${fertileEnd})`
        ]
      };
    }
  },
  {
    slug: 'chinese-gender-calculator',
    title: 'Chinese Gender Predictor',
    description: 'Traditional lunar calendar folklore simulation for baby gender curiosity (Entertainment only).',
    inputs: [
      { id: 'mother_age', label: 'Mother Age at Conception (Years)', type: 'number', defaultValue: 29, min: 18, max: 45, step: 1, unit: 'years' },
      { id: 'conception_month', label: 'Lunar Conception Month (1=Jan .. 12=Dec)', type: 'number', defaultValue: 6, min: 1, max: 12, step: 1 }
    ],
    calculate: (inputs) => {
      const age = inputs.mother_age || 25;
      const m = inputs.conception_month || 1;

      const parity = (age + m) % 2;
      const predicted = parity === 0 ? 'Girl' : 'Boy';

      return {
        primaryOutput: parity === 0 ? 0 : 1,
        primaryUnit: `Folklore Prediction: ${predicted}`,
        secondaryOutputs: [
          { label: 'Predicted Gender (Folklore Chart)', value: predicted },
          { label: 'Lunar Conception Month', value: m },
          { label: 'Medical & Scientific Disclaimer', value: 'Cultural folklore simulation only; biological sex is determined at conception with ~50/50 probability by paternal chromosome.' }
        ],
        steps: [
          'The Chinese Gender Chart is a traditional cultural folklore artifact dating back over 700 years.',
          `Folklore Calculation: Mother Age (${age}) + Lunar Conception Month (${m}) parity index = ${parity}`,
          'IMPORTANT DISCLAIMER: This tool is an educational and entertainment folklore simulation. It possesses no medical validity.'
        ]
      };
    }
  },
  {
    slug: 'child-height-calculator',
    title: 'Child Adult Height Predictor',
    description: 'Estimate child adult stature using the scientifically validated Mid-Parental (Tanner) height formula.',
    inputs: [
      { id: 'child_sex', label: 'Child Sex (1=Boy, 2=Girl)', type: 'number', defaultValue: 1, min: 1, max: 2, step: 1 },
      { id: 'father_height_in', label: 'Father Height (Inches)', type: 'number', defaultValue: 70, min: 48, max: 96, step: 0.5, unit: 'in' },
      { id: 'mother_height_in', label: 'Mother Height (Inches)', type: 'number', defaultValue: 64, min: 48, max: 96, step: 0.5, unit: 'in' }
    ],
    calculate: (inputs) => {
      const isBoy = (inputs.child_sex || 1) === 1;
      const f = inputs.father_height_in || 70;
      const m = inputs.mother_height_in || 64;

      const targetInches = isBoy ? (f + m + 5) / 2 : (f + m - 5) / 2;
      const targetCm = targetInches * 2.54;
      const feet = Math.floor(targetInches / 12);
      const remainingIn = Math.round(targetInches % 12);

      return {
        primaryOutput: parseFloat(targetInches.toFixed(1)),
        primaryUnit: `Inches (${feet}′ ${remainingIn}″)`,
        secondaryOutputs: [
          { label: 'Target Height in Centimeters', value: parseFloat(targetCm.toFixed(1)), unit: 'cm' },
          { label: 'Statistical 95% Confidence Range (±2″)', value: `${(targetInches - 2).toFixed(1)}″ to ${(targetInches + 2).toFixed(1)}″` },
          { label: 'Methodology', value: 'Khamis-Roche & Mid-Parental Tanner Standard' }
        ],
        steps: [
          isBoy
            ? `Mid-Parental formula for boys: (Father ${f}″ + Mother ${m}″ + 5″) ÷ 2 = ${targetInches.toFixed(1)}″`
            : `Mid-Parental formula for girls: (Father ${f}″ + Mother ${m}″ - 5″) ÷ 2 = ${targetInches.toFixed(1)}″`,
          `Projected Stature: ${feet} feet ${remainingIn} inches (${targetCm.toFixed(1)} cm)`
        ]
      };
    }
  },
  {
    slug: 'diaper-calculator',
    title: 'Diaper Need & Budget Estimator',
    description: 'Calculate daily and monthly diaper usage counts and estimated annual supply expenses by infant age.',
    inputs: [
      { id: 'baby_age_months', label: 'Baby Age (Months)', type: 'number', defaultValue: 3, min: 0, max: 36, step: 1, unit: 'months' },
      { id: 'cost_per_diaper', label: 'Average Cost per Diaper ($)', type: 'number', defaultValue: 0.32, min: 0.1, max: 1.0, step: 0.01, unit: '$' }
    ],
    calculate: (inputs) => {
      const age = inputs.baby_age_months || 0;
      const costPer = inputs.cost_per_diaper || 0.3;

      let dailyUsage = 10;
      let diaperSize = 'Newborn (NB)';
      if (age > 24) { dailyUsage = 4; diaperSize = 'Size 5/6 (Toddler/Pull-Ups)'; }
      else if (age > 12) { dailyUsage = 5; diaperSize = 'Size 4 (Cruiser)'; }
      else if (age > 6) { dailyUsage = 6; diaperSize = 'Size 3'; }
      else if (age > 2) { dailyUsage = 8; diaperSize = 'Size 2'; }
      else if (age >= 1) { dailyUsage = 9; diaperSize = 'Size 1'; }

      const monthlyDiapers = dailyUsage * 30.5;
      const monthlyCost = monthlyDiapers * costPer;
      const annualCost = monthlyCost * 12;

      return {
        primaryOutput: dailyUsage,
        primaryUnit: 'Diapers / Day',
        secondaryOutputs: [
          { label: 'Monthly Diapers Needed', value: Math.round(monthlyDiapers), unit: 'diapers' },
          { label: 'Estimated Monthly Diaper Budget', value: parseFloat(monthlyCost.toFixed(2)), unit: '$' },
          { label: 'Annual Expense Run-Rate', value: parseFloat(annualCost.toFixed(2)), unit: '$' },
          { label: 'Recommended Size', value: diaperSize }
        ],
        steps: [
          `At age ${age} months, infants average ${dailyUsage} diaper changes per 24 hours`,
          `Monthly volume: ${dailyUsage} diapers/day × 30.5 days = ${Math.round(monthlyDiapers)} diapers`,
          `Monthly expense: ${Math.round(monthlyDiapers)} × $${costPer.toFixed(2)} = $${monthlyCost.toFixed(2)}`
        ]
      };
    }
  },
  {
    slug: 'baby-growth-percentile-calculator',
    title: 'Baby Growth Percentile (WHO)',
    description: 'Calculate infant weight and length percentiles using World Health Organization (WHO) growth standards.',
    inputs: [
      { id: 'age_months', label: 'Infant Age (Months)', type: 'number', defaultValue: 6, min: 0, max: 24, step: 1, unit: 'months' },
      { id: 'sex', label: 'Infant Sex (1=Boy, 2=Girl)', type: 'number', defaultValue: 1, min: 1, max: 2, step: 1 },
      { id: 'weight_kg', label: 'Infant Weight (kg)', type: 'number', defaultValue: 7.9, min: 1.5, max: 25, step: 0.1, unit: 'kg' }
    ],
    calculate: (inputs) => {
      const age = inputs.age_months || 0;
      const isBoy = (inputs.sex || 1) === 1;
      const w = inputs.weight_kg || 7.5;

      const medianBoy = [3.3, 4.5, 5.6, 6.4, 7.0, 7.5, 7.9, 8.3, 8.6, 8.9, 9.2, 9.4, 9.6][Math.min(age, 12)] || (9.6 + (age - 12) * 0.2);
      const medianGirl = [3.2, 4.2, 5.1, 5.8, 6.4, 6.9, 7.3, 7.6, 7.9, 8.2, 8.5, 8.7, 8.9][Math.min(age, 12)] || (8.9 + (age - 12) * 0.2);
      const median = isBoy ? medianBoy : medianGirl;

      const z = (w - median) / (median * 0.12);
      const percentile = 100 / (1 + Math.exp(-1.6 * z));

      return {
        primaryOutput: parseFloat(percentile.toFixed(1)),
        primaryUnit: 'th Percentile Weight',
        secondaryOutputs: [
          { label: 'WHO 50th Percentile Weight for Age', value: parseFloat(median.toFixed(1)), unit: 'kg' },
          { label: 'Weight in Pounds', value: parseFloat((w * 2.20462).toFixed(1)), unit: 'lbs' },
          { label: 'Calculated Z-Score', value: parseFloat(z.toFixed(2)) }
        ],
        steps: [
          `WHO Standard: 50th percentile for a ${age}-month old ${isBoy ? 'boy' : 'girl'} is ${median.toFixed(1)} kg`,
          `Infant weight: ${w} kg corresponds to Z-score ${z.toFixed(2)}`,
          `Percentile: ${percentile.toFixed(1)}%`
        ]
      };
    }
  },
  {
    slug: 'college-savings-calculator',
    title: '529 College Savings Plan',
    description: 'Calculate required monthly 529 savings to cover future college tuition accounting for higher education inflation.',
    inputs: [
      { id: 'years_to_college', label: 'Years Until Child Enters College', type: 'number', defaultValue: 14, min: 1, max: 20, step: 1, unit: 'years' },
      { id: 'current_savings', label: 'Current 529 Balance / Starting Amount ($)', type: 'number', defaultValue: 5000, min: 0, max: 500000, step: 500, unit: '$' },
      { id: 'today_annual_cost', label: 'Current Annual College Cost ($)', type: 'number', defaultValue: 25000, min: 5000, max: 100000, step: 1000, unit: '$' },
      { id: 'annual_return_pct', label: 'Expected Investment Return (%)', type: 'number', defaultValue: 7, min: 1, max: 15, step: 0.5, unit: '%' },
      { id: 'tuition_inflation_pct', label: 'Tuition Inflation Rate (%)', type: 'number', defaultValue: 5, min: 1, max: 10, step: 0.5, unit: '%' }
    ],
    calculate: (inputs) => {
      const yrs = inputs.years_to_college || 10;
      const starting = inputs.current_savings || 0;
      const todayCost = inputs.today_annual_cost || 25000;
      const r = (inputs.annual_return_pct || 7) / 100 / 12;
      const tInf = (inputs.tuition_inflation_pct || 5) / 100;

      const futureYear1 = todayCost * Math.pow(1 + tInf, yrs);
      const totalFutureTuition = futureYear1 * (1 + (1 + tInf) + Math.pow(1 + tInf, 2) + Math.pow(1 + tInf, 3));

      const months = yrs * 12;
      const fvCurrent = starting * Math.pow(1 + r, months);
      const shortfall = Math.max(0, totalFutureTuition - fvCurrent);

      const pmt = r > 0 ? (shortfall * r) / (Math.pow(1 + r, months) - 1) : shortfall / months;

      return {
        primaryOutput: Math.round(pmt),
        primaryUnit: '$/Month to Save',
        secondaryOutputs: [
          { label: 'Total 4-Year Projected College Cost', value: Math.round(totalFutureTuition), unit: '$' },
          { label: 'Growth of Existing Savings', value: Math.round(fvCurrent), unit: '$' },
          { label: 'Savings Target Shortfall', value: Math.round(shortfall), unit: '$' }
        ],
        steps: [
          `4-Year Tuition inflated at ${(tInf * 100).toFixed(1)}% in ${yrs} years = $${Math.round(totalFutureTuition).toLocaleString()}`,
          `Starting $${starting.toLocaleString()} grows to $${Math.round(fvCurrent).toLocaleString()} @ ${(r * 1200).toFixed(1)}% return`,
          `Monthly 529 contribution needed = $${Math.round(pmt)}/month`
        ]
      };
    }
  },
  {
    slug: 'sibling-age-gap-calculator',
    title: 'Sibling Age Gap Calculator',
    description: 'Calculate exact chronological age gap between children in years, months, and days.',
    inputs: [
      { id: 'first_child_age_years', label: 'First Child Age (Years)', type: 'number', defaultValue: 4, min: 0, max: 50, step: 1, unit: 'years' },
      { id: 'first_child_extra_months', label: 'First Child Additional Months', type: 'number', defaultValue: 6, min: 0, max: 11, step: 1, unit: 'months' },
      { id: 'second_child_age_years', label: 'Second Child Age (Years)', type: 'number', defaultValue: 1, min: 0, max: 50, step: 1, unit: 'years' },
      { id: 'second_child_extra_months', label: 'Second Child Additional Months', type: 'number', defaultValue: 2, min: 0, max: 11, step: 1, unit: 'months' }
    ],
    calculate: (inputs) => {
      const c1Months = ((inputs.first_child_age_years || 0) * 12) + (inputs.first_child_extra_months || 0);
      const c2Months = ((inputs.second_child_age_years || 0) * 12) + (inputs.second_child_extra_months || 0);

      const diffMonths = Math.abs(c1Months - c2Months);
      const diffYears = Math.floor(diffMonths / 12);
      const remainingMonths = diffMonths % 12;
      const diffDays = Math.round(diffMonths * 30.4375);

      return {
        primaryOutput: parseFloat((diffMonths / 12).toFixed(1)),
        primaryUnit: `Years Gap (${diffYears}y ${remainingMonths}m)`,
        secondaryOutputs: [
          { label: 'Total Months Difference', value: diffMonths, unit: 'months' },
          { label: 'Approximate Days Difference', value: diffDays, unit: 'days' },
          { label: 'School Grade Difference (approx)', value: diffYears, unit: 'grades' }
        ],
        steps: [
          `Child 1: ${c1Months} total months; Child 2: ${c2Months} total months`,
          `Net Difference: ${diffMonths} months = ${diffYears} years and ${remainingMonths} months`
        ]
      };
    }
  },
  {
    slug: 'babysitter-pay-calculator',
    title: 'Nanny & Babysitter Pay Rate',
    description: 'Calculate fair babysitter or nanny compensation including hourly base, child surcharges, and tip.',
    inputs: [
      { id: 'base_hourly_rate', label: 'Base Hourly Rate for 1 Child ($/hr)', type: 'number', defaultValue: 18, min: 10, max: 60, step: 1, unit: '$/hr' },
      { id: 'num_children', label: 'Total Children Cared For', type: 'number', defaultValue: 2, min: 1, max: 10, step: 1 },
      { id: 'extra_child_fee', label: 'Additional Rate per Extra Child ($/hr)', type: 'number', defaultValue: 3, min: 0, max: 15, step: 0.5, unit: '$/hr' },
      { id: 'hours_worked', label: 'Total Hours Worked', type: 'number', defaultValue: 5.5, min: 0.5, max: 48, step: 0.5, unit: 'hours' },
      { id: 'tip_amount', label: 'Tip or Late Night Bonus ($)', type: 'number', defaultValue: 10, min: 0, max: 100, step: 5, unit: '$' }
    ],
    calculate: (inputs) => {
      const base = inputs.base_hourly_rate || 18;
      const children = inputs.num_children || 1;
      const extraPerChild = inputs.extra_child_fee || 3;
      const hours = inputs.hours_worked || 4;
      const tip = inputs.tip_amount || 0;

      const effectiveHourly = base + Math.max(0, children - 1) * extraPerChild;
      const basePay = effectiveHourly * hours;
      const totalPay = basePay + tip;

      return {
        primaryOutput: parseFloat(totalPay.toFixed(2)),
        primaryUnit: '$ Total Compensation',
        secondaryOutputs: [
          { label: 'Effective Hourly Rate', value: parseFloat(effectiveHourly.toFixed(2)), unit: '$/hr' },
          { label: 'Base Wages (before tip)', value: parseFloat(basePay.toFixed(2)), unit: '$' },
          { label: 'Added Tip / Bonus', value: tip, unit: '$' }
        ],
        steps: [
          `Effective Rate = $${base} base + (${children - 1} extra kids × $${extraPerChild}) = $${effectiveHourly.toFixed(2)}/hr`,
          `Base Pay = ${hours} hours × $${effectiveHourly.toFixed(2)} = $${basePay.toFixed(2)}`,
          `Total Pay = $${basePay.toFixed(2)} + $${tip} tip = $${totalPay.toFixed(2)}`
        ]
      };
    }
  },
  {
    slug: 'maternity-leave-calculator',
    title: 'Maternity Leave Days Sizer',
    description: 'Calculate maternity and paternity leave calendar duration, return-to-work dates, and paid vs unpaid weeks.',
    inputs: [
      { id: 'total_leave_weeks', label: 'Total Planned Leave Duration (Weeks)', type: 'number', defaultValue: 12, min: 1, max: 52, step: 1, unit: 'weeks' },
      { id: 'paid_weeks', label: 'Fully Paid Weeks Offered', type: 'number', defaultValue: 6, min: 0, max: 52, step: 1, unit: 'weeks' },
      { id: 'partial_pay_weeks', label: 'Partially Paid Weeks (e.g. Disability/State)', type: 'number', defaultValue: 4, min: 0, max: 52, step: 1, unit: 'weeks' },
      { id: 'partial_pay_pct', label: 'Partial Wage Replacement (%)', type: 'number', defaultValue: 60, min: 10, max: 100, step: 5, unit: '%' }
    ],
    calculate: (inputs) => {
      const total = inputs.total_leave_weeks || 12;
      const paid = Math.min(total, inputs.paid_weeks || 0);
      const partial = Math.min(total - paid, inputs.partial_pay_weeks || 0);
      const unpaid = Math.max(0, total - paid - partial);
      const replacementPct = (inputs.partial_pay_pct || 60) / 100;

      const calendarDays = total * 7;
      const workDays = total * 5;
      const effectiveFullPaidWeeks = paid + (partial * replacementPct);

      return {
        primaryOutput: calendarDays,
        primaryUnit: 'Calendar Days Off Work',
        secondaryOutputs: [
          { label: 'Working Business Days Off', value: workDays, unit: 'work days' },
          { label: 'Unpaid Leave Weeks', value: unpaid, unit: 'weeks' },
          { label: 'Equivalent 100% Paid Weeks', value: parseFloat(effectiveFullPaidWeeks.toFixed(1)), unit: 'weeks' }
        ],
        steps: [
          `Total duration = ${total} weeks = ${calendarDays} calendar days (${workDays} work days)`,
          `Leave Breakdown: ${paid}w fully paid, ${partial}w partially paid (@ ${(replacementPct * 100).toFixed(0)}%), ${unpaid}w unpaid`
        ]
      };
    }
  },

  // ==========================================
  // PERCENTAGE & DISCOUNT (10)
  // ==========================================
  {
    slug: 'discount-calculator',
    title: 'Discount & Sale Price Calculator',
    description: 'Calculate final discounted price and total money saved from retail sales and promotional offers.',
    category: 'percentage-discount',
    inputs: [
      { id: 'original_price', label: 'Original Price ($)', type: 'number', defaultValue: 89.99, min: 0.01, max: 1000000, step: 0.01, unit: '$' },
      { id: 'discount_pct', label: 'Discount Percentage (%)', type: 'number', defaultValue: 25, min: 0, max: 100, step: 0.5, unit: '%' }
    ],
    calculate: (inputs) => {
      const orig = inputs.original_price || 0;
      const pct = (inputs.discount_pct || 0) / 100;
      const savings = orig * pct;
      const finalPrice = Math.max(0, orig - savings);

      return {
        primaryOutput: parseFloat(finalPrice.toFixed(2)),
        primaryUnit: '$ Final Sale Price',
        secondaryOutputs: [
          { label: 'Total Money Saved', value: parseFloat(savings.toFixed(2)), unit: '$' },
          { label: 'Original Price', value: parseFloat(orig.toFixed(2)), unit: '$' },
          { label: 'Effective Savings Rate', value: inputs.discount_pct || 0, unit: '%' }
        ],
        steps: [
          `Savings = $${orig} × ${(pct * 100).toFixed(1)}% = $${savings.toFixed(2)}`,
          `Final Price = $${orig} - $${savings.toFixed(2)} = $${finalPrice.toFixed(2)}`
        ]
      };
    }
  },
  {
    slug: 'tip-calculator',
    title: 'Tip & Bill Split Calculator',
    description: 'Calculate restaurant tip, total bill with tax, and fair per-person bill split.',
    inputs: [
      { id: 'bill_amount', label: 'Subtotal Bill Amount ($)', type: 'number', defaultValue: 95, min: 1, max: 100000, step: 1, unit: '$' },
      { id: 'tip_pct', label: 'Tip Percentage (%)', type: 'number', defaultValue: 20, min: 0, max: 100, step: 1, unit: '%' },
      { id: 'num_guests', label: 'Number of People Splitting', type: 'number', defaultValue: 3, min: 1, max: 100, step: 1 }
    ],
    calculate: (inputs) => {
      const bill = inputs.bill_amount || 0;
      const tipRate = (inputs.tip_pct || 15) / 100;
      const guests = inputs.num_guests || 1;

      const tipTotal = bill * tipRate;
      const grandTotal = bill + tipTotal;
      const perPerson = grandTotal / guests;
      const tipPerPerson = tipTotal / guests;

      return {
        primaryOutput: parseFloat(perPerson.toFixed(2)),
        primaryUnit: '$/Person',
        secondaryOutputs: [
          { label: 'Total Bill with Tip', value: parseFloat(grandTotal.toFixed(2)), unit: '$' },
          { label: 'Total Tip Added', value: parseFloat(tipTotal.toFixed(2)), unit: '$' },
          { label: 'Tip Share per Person', value: parseFloat(tipPerPerson.toFixed(2)), unit: '$' }
        ],
        steps: [
          `Tip Amount = $${bill} × ${(tipRate * 100).toFixed(0)}% = $${tipTotal.toFixed(2)}`,
          `Grand Total = $${bill} + $${tipTotal.toFixed(2)} = $${grandTotal.toFixed(2)}`,
          `Per Person (${guests} ways) = $${grandTotal.toFixed(2)} ÷ ${guests} = $${perPerson.toFixed(2)}`
        ]
      };
    }
  },
  {
    slug: 'double-discount-calculator',
    title: 'Double Discount Calculator',
    description: 'Calculate compounded sale price when stacking multiple promotional discounts or coupons.',
    inputs: [
      { id: 'original_price', label: 'Original Price ($)', type: 'number', defaultValue: 120, min: 1, max: 100000, step: 1, unit: '$' },
      { id: 'first_discount_pct', label: 'First Discount (e.g. Store Sale %)', type: 'number', defaultValue: 30, min: 0, max: 100, step: 1, unit: '%' },
      { id: 'second_discount_pct', label: 'Second Discount (e.g. Coupon %)', type: 'number', defaultValue: 15, min: 0, max: 100, step: 1, unit: '%' }
    ],
    calculate: (inputs) => {
      const orig = inputs.original_price || 0;
      const d1 = (inputs.first_discount_pct || 0) / 100;
      const d2 = (inputs.second_discount_pct || 0) / 100;

      const priceAfterFirst = orig * (1 - d1);
      const finalPrice = priceAfterFirst * (1 - d2);
      const totalSavings = orig - finalPrice;
      const effectiveTotalPct = (totalSavings / orig) * 100;

      return {
        primaryOutput: parseFloat(finalPrice.toFixed(2)),
        primaryUnit: '$ Final Stacked Price',
        secondaryOutputs: [
          { label: 'Effective Overall Discount', value: parseFloat(effectiveTotalPct.toFixed(1)), unit: '%' },
          { label: 'Price after First Discount', value: parseFloat(priceAfterFirst.toFixed(2)), unit: '$' },
          { label: 'Total Dollar Savings', value: parseFloat(totalSavings.toFixed(2)), unit: '$' }
        ],
        steps: [
          `After First Discount (${(d1 * 100).toFixed(0)}%): $${orig} × ${(1 - d1).toFixed(2)} = $${priceAfterFirst.toFixed(2)}`,
          `After Second Coupon (${(d2 * 100).toFixed(0)}%): $${priceAfterFirst.toFixed(2)} × ${(1 - d2).toFixed(2)} = $${finalPrice.toFixed(2)}`,
          `Note: Discounts do not simply add up; stacked discount is ${effectiveTotalPct.toFixed(1)}%, not ${((d1 + d2) * 100).toFixed(0)}%`
        ]
      };
    }
  },
  {
    slug: 'percent-change-calculator',
    title: 'Percentage Increase / Decrease',
    description: 'Calculate percentage growth or reduction from an original baseline value to a new value.',
    inputs: [
      { id: 'initial_value', label: 'Initial / Baseline Value', type: 'number', defaultValue: 150, min: -10000000, max: 10000000, step: 1 },
      { id: 'final_value', label: 'New / Final Value', type: 'number', defaultValue: 210, min: -10000000, max: 10000000, step: 1 }
    ],
    calculate: (inputs) => {
      const v1 = inputs.initial_value || 1;
      const v2 = inputs.final_value || 0;

      const diff = v2 - v1;
      const pctChange = (diff / Math.abs(v1)) * 100;
      const changeType = pctChange >= 0 ? 'Increase' : 'Decrease';

      return {
        primaryOutput: parseFloat(pctChange.toFixed(2)),
        primaryUnit: `% ${changeType}`,
        secondaryOutputs: [
          { label: 'Absolute Change', value: parseFloat(diff.toFixed(2)) },
          { label: 'Growth Factor Multiplier', value: parseFloat((v2 / v1).toFixed(3)), unit: 'x' }
        ],
        steps: [
          'Formula: % Change = [(Final - Initial) ÷ |Initial|] × 100',
          `% Change = [(${v2} - ${v1}) ÷ |${v1}|] × 100 = ${pctChange.toFixed(2)}%`
        ]
      };
    }
  },
  {
    slug: 'percent-of-number-calculator',
    title: 'Percentage of a Number',
    description: 'Calculate what X percent of Y is, or what number represents a specific percentage share.',
    inputs: [
      { id: 'percentage', label: 'Percentage (%)', type: 'number', defaultValue: 35, min: 0, max: 10000, step: 0.5, unit: '%' },
      { id: 'number_val', label: 'Base Number (of)', type: 'number', defaultValue: 480, min: 0, max: 100000000, step: 1 }
    ],
    calculate: (inputs) => {
      const p = inputs.percentage || 0;
      const n = inputs.number_val || 0;
      const result = (p / 100) * n;

      return {
        primaryOutput: parseFloat(result.toFixed(2)),
        primaryUnit: `Result (${p}% of ${n})`,
        secondaryOutputs: [
          { label: 'Remaining Balance (100% - X%)', value: parseFloat((n - result).toFixed(2)) },
          { label: 'Fraction Equivalent', value: `${p}/100` }
        ],
        steps: [
          'Formula: Result = (Percentage ÷ 100) × Base Number',
          `Result = (${p} ÷ 100) × ${n} = ${result.toFixed(2)}`
        ]
      };
    }
  },
  {
    slug: 'markup-vs-margin-calculator',
    title: 'Markup vs Margin Percentage',
    description: 'Convert between markup on cost and profit margin on selling price.',
    inputs: [
      { id: 'cost_price', label: 'Product Cost ($)', type: 'number', defaultValue: 60, min: 0.01, max: 1000000, step: 1, unit: '$' },
      { id: 'selling_price', label: 'Selling Price ($)', type: 'number', defaultValue: 100, min: 0.01, max: 1000000, step: 1, unit: '$' }
    ],
    calculate: (inputs) => {
      const cost = inputs.cost_price || 1;
      const sell = inputs.selling_price || 1;

      const grossProfit = sell - cost;
      const margin = (grossProfit / sell) * 100;
      const markup = (grossProfit / cost) * 100;

      return {
        primaryOutput: parseFloat(margin.toFixed(2)),
        primaryUnit: '% Profit Margin',
        secondaryOutputs: [
          { label: 'Markup Percentage (on Cost)', value: parseFloat(markup.toFixed(2)), unit: '%' },
          { label: 'Gross Profit in Dollars', value: parseFloat(grossProfit.toFixed(2)), unit: '$' },
          { label: 'Cost-to-Price Ratio', value: parseFloat(((cost / sell) * 100).toFixed(1)), unit: '%' }
        ],
        steps: [
          `Gross Profit = $${sell} - $${cost} = $${grossProfit.toFixed(2)}`,
          `Margin % = (Gross Profit ÷ Selling Price) × 100 = ($${grossProfit.toFixed(2)} ÷ $${sell}) × 100 = ${margin.toFixed(2)}%`,
          `Markup % = (Gross Profit ÷ Cost) × 100 = ($${grossProfit.toFixed(2)} ÷ $${cost}) × 100 = ${markup.toFixed(2)}%`
        ]
      };
    }
  },
  {
    slug: 'percent-error-calculator',
    title: 'Percent Error Calculator',
    description: 'Calculate experimental percent error comparing measured lab data against accepted theoretical values.',
    inputs: [
      { id: 'experimental_val', label: 'Experimental / Measured Value', type: 'number', defaultValue: 9.62, min: -1000000, max: 1000000, step: 0.01 },
      { id: 'theoretical_val', label: 'Theoretical / Accepted Value', type: 'number', defaultValue: 9.80665, min: -1000000, max: 1000000, step: 0.01 }
    ],
    calculate: (inputs) => {
      const exp = inputs.experimental_val || 0;
      const theo = inputs.theoretical_val || 1;

      const absError = Math.abs(exp - theo);
      const pctError = (absError / Math.abs(theo)) * 100;

      return {
        primaryOutput: parseFloat(pctError.toFixed(3)),
        primaryUnit: '% Relative Error',
        secondaryOutputs: [
          { label: 'Absolute Discrepancy Error', value: parseFloat(absError.toFixed(4)) },
          { label: 'Signed Discrepancy', value: parseFloat((exp - theo).toFixed(4)) }
        ],
        steps: [
          'Formula: % Error = [|Experimental - Theoretical| ÷ |Theoretical|] × 100',
          `% Error = [|${exp} - ${theo}| ÷ |${theo}|] × 100 = ${pctError.toFixed(3)}%`
        ]
      };
    }
  },
  {
    slug: 'reverse-percentage-calculator',
    title: 'Reverse Percentage (Original Price)',
    description: 'Find the original pre-discount or pre-tax amount from the discounted final number.',
    inputs: [
      { id: 'final_amount', label: 'Final Value (after change) ($)', type: 'number', defaultValue: 120, min: 0.01, max: 1000000, step: 1, unit: '$' },
      { id: 'percentage_change', label: 'Percentage Change Applied (%)', type: 'number', defaultValue: -20, min: -99, max: 1000, step: 0.5, unit: '%' }
    ],
    calculate: (inputs) => {
      const finalVal = inputs.final_amount || 0;
      const rate = (inputs.percentage_change || 0) / 100;

      const original = finalVal / (1 + rate);
      const diff = finalVal - original;

      return {
        primaryOutput: parseFloat(original.toFixed(2)),
        primaryUnit: '$ Original Baseline Value',
        secondaryOutputs: [
          { label: 'Dollar Difference Added/Subtracted', value: parseFloat(diff.toFixed(2)), unit: '$' },
          { label: 'Applied Rate', value: inputs.percentage_change || 0, unit: '%' }
        ],
        steps: [
          'Formula: Original = Final ÷ (1 + % Change / 100)',
          `Original = $${finalVal} ÷ (1 + ${rate.toFixed(2)}) = $${original.toFixed(2)}`
        ]
      };
    }
  },
  {
    slug: 'fraction-to-percent-calculator',
    title: 'Fraction to Percentage',
    description: 'Convert any numerator and denominator fraction into an exact percentage and decimal equivalent.',
    inputs: [
      { id: 'numerator', label: 'Numerator (Top Number)', type: 'number', defaultValue: 5, min: -1000000, max: 1000000, step: 1 },
      { id: 'denominator', label: 'Denominator (Bottom Number)', type: 'number', defaultValue: 8, min: -1000000, max: 1000000, step: 1 }
    ],
    calculate: (inputs) => {
      const num = inputs.numerator || 0;
      const den = inputs.denominator || 1;

      const dec = num / den;
      const pct = dec * 100;

      return {
        primaryOutput: parseFloat(pct.toFixed(2)),
        primaryUnit: '% Percentage',
        secondaryOutputs: [
          { label: 'Decimal Representation', value: parseFloat(dec.toFixed(4)) },
          { label: 'Original Fraction', value: `${num} / ${den}` }
        ],
        steps: [
          'Formula: Percentage = (Numerator ÷ Denominator) × 100',
          `Percentage = (${num} ÷ ${den}) × 100 = ${pct.toFixed(2)}%`
        ]
      };
    }
  },
  {
    slug: 'ratio-to-percent-calculator',
    title: 'Ratio to Percentage Calculator',
    description: 'Convert part-to-part and part-to-whole ratios into proportional percentages.',
    inputs: [
      { id: 'ratio_a', label: 'Ratio Part A', type: 'number', defaultValue: 3, min: 0.1, max: 10000, step: 0.5 },
      { id: 'ratio_b', label: 'Ratio Part B', type: 'number', defaultValue: 5, min: 0.1, max: 10000, step: 0.5 }
    ],
    calculate: (inputs) => {
      const a = inputs.ratio_a || 1;
      const b = inputs.ratio_b || 1;
      const total = a + b;

      const pctA = (a / total) * 100;
      const pctB = (b / total) * 100;

      return {
        primaryOutput: parseFloat(pctA.toFixed(2)),
        primaryUnit: `% Share of Part A (${a}:${b})`,
        secondaryOutputs: [
          { label: 'Part B Share', value: parseFloat(pctB.toFixed(2)), unit: '%' },
          { label: 'Total Ratio Sum (A + B)', value: total },
          { label: 'Direct Ratio Form', value: `1 : ${(b / a).toFixed(2)}` }
        ],
        steps: [
          `Total Parts = ${a} + ${b} = ${total}`,
          `Part A % = (${a} ÷ ${total}) × 100 = ${pctA.toFixed(2)}%`,
          `Part B % = (${b} ÷ ${total}) × 100 = ${pctB.toFixed(2)}%`
        ]
      };
    }
  },

  // ==========================================
  // FUN & RANDOM (15)
  // ==========================================
  {
    slug: 'random-number-generator',
    title: 'Random Number Generator',
    description: 'Pseudo-random number generator (PRNG) simulation across user-defined lower and upper bounds.',
    category: 'fun-random',
    inputs: [
      { id: 'min_val', label: 'Minimum Range Bound (Min)', type: 'number', defaultValue: 1, min: -1000000, max: 1000000, step: 1 },
      { id: 'max_val', label: 'Maximum Range Bound (Max)', type: 'number', defaultValue: 100, min: -1000000, max: 1000000, step: 1 }
    ],
    calculate: (inputs) => {
      const min = Math.min(inputs.min_val ?? 1, inputs.max_val ?? 100);
      const max = Math.max(inputs.min_val ?? 1, inputs.max_val ?? 100);
      const span = max - min + 1;
      const rnd = Math.floor(Math.random() * span) + min;

      return {
        primaryOutput: rnd,
        primaryUnit: `Random Value between ${min} and ${max}`,
        secondaryOutputs: [
          { label: 'Lower Bound (Min)', value: min },
          { label: 'Upper Bound (Max)', value: max },
          { label: 'Total Numbers in Pool', value: span },
          { label: 'Statistical Model', value: 'Discrete Uniform PRNG Simulation' }
        ],
        steps: [
          `Uniform Random Simulation Formula: Math.floor(Math.random() × (${max} - ${min} + 1)) + ${min}`,
          `Selected Random Draw: ${rnd}`,
          'Note: Each execution yields an independent, pseudo-random integer with equal probability (1/N).'
        ]
      };
    }
  },
  {
    slug: 'dice-roller',
    title: 'Dice Roller (d6, d20, d100)',
    description: 'Monte Carlo tabletop polyhedral gaming dice roll simulation with modifiers.',
    inputs: [
      { id: 'dice_sides', label: 'Dice Sides (e.g. 6=d6, 20=d20, 100=d100)', type: 'number', defaultValue: 20, min: 2, max: 1000, step: 1 },
      { id: 'num_dice', label: 'Number of Dice to Roll', type: 'number', defaultValue: 2, min: 1, max: 50, step: 1 },
      { id: 'modifier', label: 'Roll Modifier (+ / -)', type: 'number', defaultValue: 3, min: -50, max: 50, step: 1 }
    ],
    calculate: (inputs) => {
      const sides = Math.max(2, inputs.dice_sides || 6);
      const count = Math.max(1, inputs.num_dice || 1);
      const mod = inputs.modifier || 0;

      let sum = 0;
      const rolls: number[] = [];
      for (let i = 0; i < count; i++) {
        const roll = Math.floor(Math.random() * sides) + 1;
        rolls.push(roll);
        sum += roll;
      }
      const total = sum + mod;
      const expectedMean = (count * (sides + 1) / 2) + mod;

      return {
        primaryOutput: total,
        primaryUnit: `Simulated Roll (${count}d${sides}${mod >= 0 ? '+' : ''}${mod})`,
        secondaryOutputs: [
          { label: 'Individual Dice Rolls', value: rolls.join(', ') },
          { label: 'Raw Sum', value: sum },
          { label: 'Expected Theoretical Mean', value: parseFloat(expectedMean.toFixed(1)) },
          { label: 'Simulation Nature', value: 'Stochastic Gaming Dice Simulation' }
        ],
        steps: [
          `Simulated ${count} independent rolls on d${sides}: [${rolls.join(', ')}]`,
          `Sum: ${sum} + modifier (${mod}) = ${total}`,
          'Note: Polyhedral rolls are stochastic simulations; long-run average approaches theoretical mean.'
        ]
      };
    }
  },
  {
    slug: 'coin-flip-calculator',
    title: 'Coin Flip Simulator',
    description: 'Empirical Bernoulli trial simulation of fair coin tosses analyzing binomial distribution.',
    inputs: [
      { id: 'flips', label: 'Number of Coin Flips to Simulate', type: 'number', defaultValue: 100, min: 1, max: 10000, step: 1 }
    ],
    calculate: (inputs) => {
      const n = Math.max(1, inputs.flips || 1);
      let heads = 0;
      for (let i = 0; i < n; i++) {
        if (Math.random() < 0.5) heads++;
      }
      const tails = n - heads;
      const headsPct = (heads / n) * 100;

      return {
        primaryOutput: heads,
        primaryUnit: `Heads Out of ${n} Flips (${headsPct.toFixed(1)}%)`,
        secondaryOutputs: [
          { label: 'Tails Count', value: tails },
          { label: 'Expected Mean (np)', value: parseFloat((n * 0.5).toFixed(1)) },
          { label: 'Standard Deviation (σ)', value: parseFloat(Math.sqrt(n * 0.25).toFixed(2)) },
          { label: 'Simulation Nature', value: 'Empirical Monte Carlo Bernoulli Experiment' }
        ],
        steps: [
          `Executed ${n} simulated independent Bernoulli trials with probability p = 0.5`,
          `Empirical Result: ${heads} Heads (${headsPct.toFixed(1)}%) and ${tails} Tails (${(100 - headsPct).toFixed(1)}%)`,
          'Statistical Note: By the Law of Large Numbers, empirical frequency converges to 50% as flip count increases.'
        ]
      };
    }
  },
  {
    slug: 'love-calculator',
    title: 'Love Compatibility Calculator',
    description: 'Recreational harmonic affinity test algorithm (Novelty & entertainment only).',
    inputs: [
      { id: 'name1_len', label: 'Partner 1 Name Character Length', type: 'number', defaultValue: 6, min: 1, max: 30, step: 1 },
      { id: 'name2_len', label: 'Partner 2 Name Character Length', type: 'number', defaultValue: 7, min: 1, max: 30, step: 1 }
    ],
    calculate: (inputs) => {
      const l1 = Math.max(1, inputs.name1_len || 5);
      const l2 = Math.max(1, inputs.name2_len || 5);

      const score = 50 + (((l1 * 13 + l2 * 17) % 50));

      return {
        primaryOutput: score,
        primaryUnit: '% Match Compatibility (Fun Score)',
        secondaryOutputs: [
          { label: 'Affinity Rating', value: score > 85 ? 'Soulmates' : score > 70 ? 'High Synergy' : 'Playful Spark' },
          { label: 'Tool Nature & Disclaimer', value: 'Recreational entertainment novelty; not a scientific or psychological indicator.' }
        ],
        steps: [
          'Calculated using name character length harmonic modulus algorithm.',
          `Harmonic Affinity Score: ${score}%`,
          'ENTERTAINMENT NOTICE: This tool is intended solely for casual amusement and possesses no empirical or relationship guidance validity.'
        ]
      };
    }
  },
  {
    slug: 'zodiac-calculator',
    title: 'Zodiac Sign & Astrology Finder',
    description: 'Find your Western astrological sun sign and element based on day and month of birth.',
    inputs: [
      { id: 'birth_month', label: 'Birth Month (1=Jan .. 12=Dec)', type: 'number', defaultValue: 7, min: 1, max: 12, step: 1 },
      { id: 'birth_day', label: 'Birth Day of Month', type: 'number', defaultValue: 25, min: 1, max: 31, step: 1 }
    ],
    calculate: (inputs) => {
      const m = inputs.birth_month || 1;
      const d = inputs.birth_day || 1;

      let sign = 'Capricorn';
      let element = 'Earth';
      if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) { sign = 'Aries'; element = 'Fire'; }
      else if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) { sign = 'Taurus'; element = 'Earth'; }
      else if ((m === 5 && d >= 21) || (m === 6 && d <= 20)) { sign = 'Gemini'; element = 'Air'; }
      else if ((m === 6 && d >= 21) || (m === 7 && d <= 22)) { sign = 'Cancer'; element = 'Water'; }
      else if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) { sign = 'Leo'; element = 'Fire'; }
      else if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) { sign = 'Virgo'; element = 'Earth'; }
      else if ((m === 9 && d >= 23) || (m === 10 && d <= 22)) { sign = 'Libra'; element = 'Air'; }
      else if ((m === 10 && d >= 23) || (m === 11 && d <= 21)) { sign = 'Scorpio'; element = 'Water'; }
      else if ((m === 11 && d >= 22) || (m === 12 && d <= 21)) { sign = 'Sagittarius'; element = 'Fire'; }
      else if ((m === 12 && d >= 22) || (m === 1 && d <= 19)) { sign = 'Capricorn'; element = 'Earth'; }
      else if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) { sign = 'Aquarius'; element = 'Air'; }
      else if ((m === 2 && d >= 19) || (m === 3 && d <= 20)) { sign = 'Pisces'; element = 'Water'; }

      return {
        primaryOutput: 1,
        primaryUnit: `Zodiac Sign: ${sign}`,
        secondaryOutputs: [
          { label: 'Astrological Sign', value: sign },
          { label: 'Natural Element', value: element },
          { label: 'Calendar Window', value: `Month ${m}, Day ${d}` }
        ],
        steps: [
          `Date: Month ${m}, Day ${d}`,
          `Sun is located in ${sign} constellation (${element} element)`
        ]
      };
    }
  },
  {
    slug: 'password-entropy-calculator',
    title: 'Password Strength & Entropy',
    description: 'Calculate cryptographic password entropy in bits and brute-force cracking resistance time.',
    inputs: [
      { id: 'password_length', label: 'Password Length (Characters)', type: 'number', defaultValue: 14, min: 4, max: 128, step: 1 },
      { id: 'has_lowercase', label: 'Includes Lowercase letters (a-z)? (1=Yes, 0=No)', type: 'number', defaultValue: 1, min: 0, max: 1, step: 1 },
      { id: 'has_uppercase', label: 'Includes Uppercase letters (A-Z)? (1=Yes, 0=No)', type: 'number', defaultValue: 1, min: 0, max: 1, step: 1 },
      { id: 'has_numbers', label: 'Includes Digits (0-9)? (1=Yes, 0=No)', type: 'number', defaultValue: 1, min: 0, max: 1, step: 1 },
      { id: 'has_symbols', label: 'Includes Symbols (@#$%...)? (1=Yes, 0=No)', type: 'number', defaultValue: 1, min: 0, max: 1, step: 1 }
    ],
    calculate: (inputs) => {
      const l = inputs.password_length || 8;
      let pool = 0;
      if (inputs.has_lowercase) pool += 26;
      if (inputs.has_uppercase) pool += 26;
      if (inputs.has_numbers) pool += 10;
      if (inputs.has_symbols) pool += 33;
      if (pool === 0) pool = 26;

      const entropy = l * (Math.log(pool) / Math.LN2);

      let strength = 'Weak (< 40 bits)';
      if (entropy > 80) strength = 'Very Strong / Uncrackable (> 80 bits)';
      else if (entropy >= 60) strength = 'Strong (60 - 80 bits)';
      else if (entropy >= 40) strength = 'Moderate (40 - 59 bits)';

      return {
        primaryOutput: parseFloat(entropy.toFixed(1)),
        primaryUnit: 'Bits of Entropy',
        secondaryOutputs: [
          { label: 'Security Evaluation', value: strength },
          { label: 'Character Pool Size', value: pool },
          { label: 'Total Combinations', value: `~2^${Math.round(entropy)}` }
        ],
        steps: [
          'Formula: Entropy = Length × log₂(Character Pool Size)',
          `Entropy = ${l} × log₂(${pool}) = ${entropy.toFixed(1)} bits`
        ]
      };
    }
  },
  {
    slug: 'cat-age-calculator',
    title: 'Cat Age to Human Years',
    description: 'Convert feline chronological age to equivalent human developmental years.',
    inputs: [
      { id: 'cat_age_years', label: 'Cat Age (Years)', type: 'number', defaultValue: 4, min: 0.1, max: 30, step: 0.5, unit: 'years' }
    ],
    calculate: (inputs) => {
      const age = inputs.cat_age_years || 1;
      let humanYears = 0;

      if (age <= 1) {
        humanYears = age * 15;
      } else if (age <= 2) {
        humanYears = 15 + (age - 1) * 9;
      } else {
        humanYears = 24 + (age - 2) * 4;
      }

      let felineLifeStage = 'Adult';
      if (age < 1) felineLifeStage = 'Kitten';
      else if (age <= 2) felineLifeStage = 'Junior';
      else if (age <= 6) felineLifeStage = 'Prime Adult';
      else if (age <= 10) felineLifeStage = 'Mature';
      else if (age <= 14) felineLifeStage = 'Senior';
      else felineLifeStage = 'Geriatric / Super Senior';

      return {
        primaryOutput: parseFloat(humanYears.toFixed(1)),
        primaryUnit: 'Human Years Equivalent',
        secondaryOutputs: [
          { label: 'Feline Life Stage', value: felineLifeStage },
          { label: 'Calendar Cat Age', value: age, unit: 'years' }
        ],
        steps: [
          'Veterinary standard: First year = 15 human yrs; Second year = +9 (24 total); Each additional year = +4 yrs',
          `Equivalent Human Age = ${humanYears.toFixed(1)} years`
        ]
      };
    }
  },
  {
    slug: 'dog-age-calculator',
    title: 'Dog Age to Human Years',
    description: 'Convert canine age using the UCSD epigenetic cellular aging formula (16 × ln(age) + 31).',
    inputs: [
      { id: 'dog_age_years', label: 'Dog Age in Calendar Years', type: 'number', defaultValue: 5, min: 0.1, max: 25, step: 0.5, unit: 'years' }
    ],
    calculate: (inputs) => {
      const age = Math.max(0.1, inputs.dog_age_years || 1);

      const humanYears = 16 * Math.log(age) + 31;

      return {
        primaryOutput: parseFloat(humanYears.toFixed(1)),
        primaryUnit: 'Human Years (DNA Epigenetic Clock)',
        secondaryOutputs: [
          { label: 'Traditional "Rule of 7" Estimate', value: Math.round(age * 7), unit: 'years' },
          { label: 'Research Formula Basis', value: 'UCSD Cell Methylation Study' }
        ],
        steps: [
          'Epigenetic Formula: Human Age = 16 × ln(Dog Age) + 31',
          `Human Age = 16 × ln(${age}) + 31 = ${humanYears.toFixed(1)} human years`
        ]
      };
    }
  },
  {
    slug: 'caffeine-halflife-calculator',
    title: 'Coffee Caffeine Halflife',
    description: 'Calculate remaining active caffeine in your bloodstream hours after drinking coffee or energy drinks.',
    inputs: [
      { id: 'caffeine_mg', label: 'Initial Caffeine Consumed (mg) (~95mg per 8oz cup)', type: 'number', defaultValue: 180, min: 10, max: 2000, step: 10, unit: 'mg' },
      { id: 'hours_elapsed', label: 'Hours Elapsed Since Drinking', type: 'number', defaultValue: 7, min: 0, max: 48, step: 0.5, unit: 'hours' },
      { id: 'halflife_hours', label: 'Biological Half-Life (Standard is 5.0 hours)', type: 'number', defaultValue: 5, min: 2, max: 10, step: 0.5, unit: 'hours' }
    ],
    calculate: (inputs) => {
      const c0 = inputs.caffeine_mg || 100;
      const t = inputs.hours_elapsed || 0;
      const tHalf = inputs.halflife_hours || 5;

      const remaining = c0 * Math.pow(0.5, t / tHalf);
      const clearedPct = ((c0 - remaining) / c0) * 100;

      return {
        primaryOutput: parseFloat(remaining.toFixed(1)),
        primaryUnit: 'mg Caffeine Remaining in Blood',
        secondaryOutputs: [
          { label: '% Caffeine Cleared by Liver', value: parseFloat(clearedPct.toFixed(1)), unit: '%' },
          { label: 'Time to 95% Clearance (~4.3 half-lives)', value: parseFloat((tHalf * 4.3).toFixed(1)), unit: 'hours' }
        ],
        steps: [
          'Pharmacokinetic formula: C(t) = C₀ × (0.5)^(hours ÷ half-life)',
          `Remaining = ${c0}mg × (0.5)^(${t} ÷ ${tHalf}) = ${remaining.toFixed(1)} mg`
        ]
      };
    }
  },
  {
    slug: 'lottery-odds-calculator',
    title: 'Lottery Odds Calculator',
    description: 'Calculate exact combinations and mathematical odds of winning lottery jackpot drawings (e.g. Powerball).',
    inputs: [
      { id: 'total_pool', label: 'Total White Balls Pool (e.g. 69 for Powerball)', type: 'number', defaultValue: 69, min: 10, max: 100, step: 1 },
      { id: 'balls_drawn', label: 'White Balls Picked (e.g. 5 for Powerball)', type: 'number', defaultValue: 5, min: 1, max: 10, step: 1 },
      { id: 'bonus_pool', label: 'Bonus Ball Pool (e.g. 26 for Powerball, 1 if none)', type: 'number', defaultValue: 26, min: 1, max: 100, step: 1 }
    ],
    calculate: (inputs) => {
      const n = inputs.total_pool || 69;
      const k = inputs.balls_drawn || 5;
      const bonus = inputs.bonus_pool || 1;

      let combinations = 1;
      for (let i = 0; i < k; i++) {
        combinations = (combinations * (n - i)) / (i + 1);
      }

      const totalOdds = Math.round(combinations * bonus);

      return {
        primaryOutput: totalOdds,
        primaryUnit: `1 in ${totalOdds.toLocaleString()} Odds`,
        secondaryOutputs: [
          { label: 'White Ball Combinations', value: Math.round(combinations).toLocaleString() },
          { label: 'Decimal Probability', value: parseFloat((1 / totalOdds).toExponential(4)) }
        ],
        steps: [
          `Combinations nCr(${n}, ${k}) = ${Math.round(combinations).toLocaleString()}`,
          `Total Jackpot Odds = ${Math.round(combinations).toLocaleString()} × ${bonus} bonus balls = 1 in ${totalOdds.toLocaleString()}`
        ]
      };
    }
  },
  {
    slug: 'caesar-cipher-calculator',
    title: 'Caesar Cipher Encryptor',
    description: 'Encrypt and decrypt text with classical Caesar substitution rotation shift cipher.',
    inputs: [
      { id: 'shift_key', label: 'Shift Key / Rotation Amount (1 to 25)', type: 'number', defaultValue: 3, min: 1, max: 25, step: 1 },
      { id: 'sample_char_code', label: 'Sample Letter Position (A=1, B=2, Z=26)', type: 'number', defaultValue: 1, min: 1, max: 26, step: 1 }
    ],
    calculate: (inputs) => {
      const shift = inputs.shift_key || 3;
      const letterPos = inputs.sample_char_code || 1;

      const newPos = ((letterPos - 1 + shift) % 26) + 1;
      const origChar = String.fromCharCode(64 + letterPos);
      const newChar = String.fromCharCode(64 + newPos);

      return {
        primaryOutput: newPos,
        primaryUnit: `Cipher Shift: ${origChar} ➔ ${newChar}`,
        secondaryOutputs: [
          { label: 'Rotated Position (1-26)', value: newPos },
          { label: 'Decrypt Shift Key', value: 26 - shift }
        ],
        steps: [
          'Formula: C = (P + Key - 1) mod 26 + 1',
          `Letter '${origChar}' (pos ${letterPos}) shifted by ${shift} becomes '${newChar}' (pos ${newPos})`
        ]
      };
    }
  },
  {
    slug: 'decision-maker-calculator',
    title: 'Random Decision Wheel',
    description: 'Recreational unbiased random choice selector simulation for tie-breaking and entertainment.',
    inputs: [
      { id: 'num_options', label: 'Number of Options to Choose Between', type: 'number', defaultValue: 4, min: 2, max: 20, step: 1 }
    ],
    calculate: (inputs) => {
      const n = Math.max(2, Math.min(20, Math.floor(inputs.num_options || 4)));
      const chosen = Math.floor(Math.random() * n) + 1;
      const prob = (1 / n) * 100;

      return {
        primaryOutput: chosen,
        primaryUnit: `Selected Choice #${chosen} of ${n}`,
        secondaryOutputs: [
          { label: 'Option Selected', value: `Choice #${chosen}` },
          { label: 'Equal Probability per Choice', value: parseFloat(prob.toFixed(2)), unit: '%' },
          { label: 'Nature of Tool', value: 'Recreational Random PRNG Simulation' }
        ],
        steps: [
          'Classification: Recreational / Unbiased Random Selection Simulation (PRNG).',
          `Selected choice index #${chosen} uniformly at random from ${n} equally probable candidates.`,
          `Probability for each individual option: 1/${n} = ${prob.toFixed(2)}%.`
        ]
      };
    }
  },
  {
    slug: 'days-lived-calculator',
    title: 'Days Lived Milestone Counter',
    description: 'Calculate total days, hours, and heartbeats lived from birth to current age milestones.',
    inputs: [
      { id: 'age_years', label: 'Age in Years', type: 'number', defaultValue: 28, min: 1, max: 120, step: 1, unit: 'years' },
      { id: 'extra_days', label: 'Additional Days Beyond Last Birthday', type: 'number', defaultValue: 150, min: 0, max: 365, step: 1, unit: 'days' }
    ],
    calculate: (inputs) => {
      const y = inputs.age_years || 20;
      const d = inputs.extra_days || 0;

      const totalDays = Math.round(y * 365.25 + d);
      const totalHours = totalDays * 24;
      const totalMinutes = totalHours * 60;
      const heartbeats = Math.round(totalMinutes * 72);

      return {
        primaryOutput: totalDays,
        primaryUnit: 'Days Lived',
        secondaryOutputs: [
          { label: 'Hours Lived', value: totalHours.toLocaleString(), unit: 'hours' },
          { label: 'Minutes Lived', value: totalMinutes.toLocaleString(), unit: 'min' },
          { label: 'Estimated Heartbeats (~72 bpm)', value: heartbeats.toLocaleString() }
        ],
        steps: [
          `Days = (${y} yrs × 365.25 days/yr) + ${d} days = ${totalDays.toLocaleString()} days`,
          `Total hours: ${totalHours.toLocaleString()} hours`
        ]
      };
    }
  },
  {
    slug: 'typing-speed-calculator',
    title: 'Typing Speed Test (WPM)',
    description: 'Calculate net typing speed in Words Per Minute (WPM) and accuracy percentage from character counts.',
    inputs: [
      { id: 'total_characters', label: 'Total Keystrokes / Characters Typed', type: 'number', defaultValue: 420, min: 10, max: 10000, step: 10 },
      { id: 'unfixed_errors', label: 'Unfixed Typo Errors', type: 'number', defaultValue: 3, min: 0, max: 500, step: 1 },
      { id: 'test_duration_minutes', label: 'Test Time in Minutes', type: 'number', defaultValue: 1.5, min: 0.1, max: 60, step: 0.5, unit: 'min' }
    ],
    calculate: (inputs) => {
      const chars = inputs.total_characters || 100;
      const errors = inputs.unfixed_errors || 0;
      const min = inputs.test_duration_minutes || 1;

      const grossWpm = (chars / 5) / min;
      const netWpm = Math.max(0, grossWpm - (errors / min));
      const accuracy = chars > 0 ? Math.max(0, ((chars - errors * 5) / chars) * 100) : 100;

      return {
        primaryOutput: Math.round(netWpm),
        primaryUnit: 'Net Words Per Minute (WPM)',
        secondaryOutputs: [
          { label: 'Gross WPM', value: Math.round(grossWpm), unit: 'WPM' },
          { label: 'Accuracy Percentage', value: parseFloat(accuracy.toFixed(1)), unit: '%' },
          { label: 'Total Keystrokes', value: chars }
        ],
        steps: [
          `Gross WPM = (${chars} chars ÷ 5) ÷ ${min} min = ${grossWpm.toFixed(1)} WPM`,
          `Net WPM = ${grossWpm.toFixed(1)} - (${errors} errors ÷ ${min}) = ${Math.round(netWpm)} WPM`,
          `Accuracy = ${accuracy.toFixed(1)}%`
        ]
      };
    }
  },
  {
    slug: 'color-palette-generator',
    title: 'Random Color Palette Generator',
    description: 'Generate harmonious color harmonies (complementary, analogous, triadic) using HSL color space.',
    inputs: [
      { id: 'base_hue', label: 'Base Hue Angle (0 to 360° on color wheel)', type: 'number', defaultValue: 210, min: 0, max: 360, step: 1, unit: '°' },
      { id: 'saturation', label: 'Saturation (%)', type: 'number', defaultValue: 75, min: 10, max: 100, step: 5, unit: '%' },
      { id: 'lightness', label: 'Lightness (%)', type: 'number', defaultValue: 50, min: 10, max: 90, step: 5, unit: '%' }
    ],
    calculate: (inputs) => {
      const h = (inputs.base_hue || 0) % 360;
      const s = inputs.saturation || 75;
      const l = inputs.lightness || 50;

      const compHue = (h + 180) % 360;
      const triad1 = (h + 120) % 360;
      const triad2 = (h + 240) % 360;
      const analog1 = (h + 30) % 360;
      const analog2 = (h + 330) % 360;

      return {
        primaryOutput: compHue,
        primaryUnit: `Complementary Hue: ${compHue}° (from ${h}°)`,
        secondaryOutputs: [
          { label: 'Base Color HSL', value: `hsl(${h}, ${s}%, ${l}%)` },
          { label: 'Complementary Color', value: `hsl(${compHue}, ${s}%, ${l}%)` },
          { label: 'Triadic Pair', value: `${triad1}° & ${triad2}°` },
          { label: 'Analogous Pair', value: `${analog1}° & ${analog2}°` }
        ],
        steps: [
          `Base Color: hsl(${h}, ${s}%, ${l}%)`,
          `Complementary (opposite 180°): ${compHue}°`,
          `Triadic harmonies (±120°): ${triad1}° and ${triad2}°`
        ]
      };
    }
  }
];
