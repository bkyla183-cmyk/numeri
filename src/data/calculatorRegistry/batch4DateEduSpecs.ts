import { CalculatorSpec } from './types';
import { parseNum, calcError, parseLocalDate } from './validation';

const fmt = (n: number, d = 2): number => {
  if (!Number.isFinite(n)) return 0;
  const r = Number(n.toFixed(d));
  return Object.is(r, -0) ? 0 : r;
};

const formatDateIso = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const batch4DateEduSpecs: CalculatorSpec[] = [
  // ==========================================
  // DATE & TIME (20 Calculators: 726–745)
  // ==========================================

  // 726. Date Add / Subtract Days, Weeks, Months, Years
  {
    slug: 'add-subtract-days-weeks-date-calculator',
    title: 'Date Add & Subtract Days, Weeks, Months & Years Calculator',
    category: 'date-time',
    formulaDisplay: 'Target Date = Start Date ± (Years, Months, Weeks, Days)',
    inputs: [
      { id: 'startDate', label: 'Start Date', type: 'date', defaultValue: '2026-11-20' },
      {
        id: 'operation',
        label: 'Operation',
        type: 'select',
        defaultValue: 'add',
        options: [
          { label: 'Add (+)', value: 'add' },
          { label: 'Subtract (−)', value: 'sub' },
        ],
      },
      { id: 'years', label: 'Years', type: 'number', defaultValue: 0, min: 0, max: 200, step: 1 },
      { id: 'months', label: 'Months', type: 'number', defaultValue: 3, min: 0, max: 2400, step: 1 },
      { id: 'weeks', label: 'Weeks', type: 'number', defaultValue: 0, min: 0, max: 5000, step: 1 },
      { id: 'days', label: 'Days', type: 'number', defaultValue: 15, min: 0, max: 50000, step: 1 },
    ],
    calculate: (v) => {
      const dt = parseLocalDate(v.startDate);
      if (!dt) return calcError('Enter a valid start date (YYYY-MM-DD).');
      const sign = String(v.operation || 'add') === 'sub' ? -1 : 1;
      const [y, m, w, d] = [v.years, v.months, v.weeks, v.days].map((x) => Math.trunc(parseNum(x ?? 0)));
      if ([y, m, w, d].some(Number.isNaN) || y < 0 || m < 0 || w < 0 || d < 0) return calcError('Offsets must be non-negative integers.');
      if (y > 5000 || m > 60000 || w > 250000 || d > 2000000) return calcError('Date offset exceeds supported calendar range.');
      const res = new Date(dt.getFullYear() + sign * y, dt.getMonth() + sign * m, dt.getDate() + sign * (w * 7 + d));
      if (!Number.isFinite(res.getTime())) return calcError('Resulting date is outside valid calendar bounds.');
      const diffDays = Math.round((res.getTime() - dt.getTime()) / 86400000);
      return {
        primaryValue: formatDateIso(res),
        primaryUnit: WEEKDAYS[res.getDay()],
        primaryLabel: 'Resulting Calendar Date',
        secondaryOutputs: [
          { label: 'Total Elapsed Calendar Days', value: `${Math.abs(diffDays)} days` },
          { label: 'Start Weekday', value: WEEKDAYS[dt.getDay()] },
        ],
        steps: [`Shifted ${formatDateIso(dt)} by ${sign > 0 ? '+' : '−'}(${y}y, ${m}m, ${w}w, ${d}d) → ${formatDateIso(res)} (${WEEKDAYS[res.getDay()]}).`],
      };
    },
  },

  // 727. HH:MM:SS Time Duration Adder & Subtractor
  {
    slug: 'time-duration-hms-calculator',
    title: 'Time Duration (HH:MM:SS) Adder & Subtractor Calculator',
    category: 'date-time',
    formulaDisplay: 'Total Seconds = (h₁±h₂)×3600 + (m₁±m₂)×60 + (s₁±s₂)',
    inputs: [
      { id: 'h1', label: 'Time 1 Hours', type: 'number', defaultValue: 2, min: 0, max: 10000, step: 1 },
      { id: 'm1', label: 'Time 1 Minutes', type: 'number', defaultValue: 45, min: 0, max: 59, step: 1 },
      { id: 's1', label: 'Time 1 Seconds', type: 'number', defaultValue: 30, min: 0, max: 59, step: 1 },
      {
        id: 'op',
        label: 'Operation',
        type: 'select',
        defaultValue: 'add',
        options: [
          { label: 'Add (+)', value: 'add' },
          { label: 'Subtract (−)', value: 'sub' },
        ],
      },
      { id: 'h2', label: 'Time 2 Hours', type: 'number', defaultValue: 1, min: 0, max: 10000, step: 1 },
      { id: 'm2', label: 'Time 2 Minutes', type: 'number', defaultValue: 35, min: 0, max: 59, step: 1 },
      { id: 's2', label: 'Time 2 Seconds', type: 'number', defaultValue: 45, min: 0, max: 59, step: 1 },
    ],
    calculate: (v) => {
      const vals = [v.h1, v.m1, v.s1, v.h2, v.m2, v.s2].map((x) => Math.trunc(parseNum(x ?? 0)));
      if (vals.some(Number.isNaN) || vals.some((x) => x < 0)) return calcError('Enter non-negative hours, minutes, and seconds.');
      const [h1, m1, s1, h2, m2, s2] = vals;
      const t1 = h1 * 3600 + m1 * 60 + s1;
      const t2 = h2 * 3600 + m2 * 60 + s2;
      const signOp = String(v.op || 'add') === 'sub' ? -1 : 1;
      const tot = t1 + signOp * t2;
      const neg = tot < 0 ? '−' : '';
      const absTot = Math.abs(tot);
      const hh = Math.floor(absTot / 3600);
      const mm = Math.floor((absTot % 3600) / 60);
      const ss = absTot % 60;
      const formatted = `${neg}${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
      return {
        primaryValue: formatted,
        primaryUnit: 'HH:MM:SS',
        primaryLabel: 'Net Time Duration',
        secondaryOutputs: [
          { label: 'Decimal Hours', value: fmt(tot / 3600, 4) },
          { label: 'Total Minutes', value: fmt(tot / 60, 2) },
          { label: 'Total Seconds', value: tot },
        ],
        steps: [`${t1}s ${signOp > 0 ? '+' : '−'} ${t2}s = ${tot}s = ${formatted}.`],
      };
    },
  },

  // 728. Unix Epoch Timestamp Converter
  {
    slug: 'unix-epoch-timestamp-converter',
    title: 'Unix Epoch Timestamp (Seconds / ms) to UTC Converter',
    category: 'date-time',
    formulaDisplay: 'Seconds since 1970-01-01T00:00:00Z (UTC)',
    inputs: [
      { id: 'unixTs', label: 'Unix Timestamp (Seconds or Milliseconds)', type: 'number', defaultValue: 1795132800, min: -62135596800, max: 253402300799000, step: 60 },
    ],
    calculate: (v) => {
      const ts = parseNum(v.unixTs);
      if (Number.isNaN(ts)) return calcError('Enter a valid numeric Unix epoch timestamp.');
      const isMs = Math.abs(ts) >= 1e11;
      const ms = isMs ? ts : ts * 1000;
      const dt = new Date(ms);
      if (Number.isNaN(dt.getTime())) return calcError('Timestamp outside valid JavaScript Date range.');
      return {
        primaryValue: dt.toISOString(),
        primaryUnit: 'ISO-8601 UTC',
        primaryLabel: isMs ? 'Parsed Millisecond Epoch' : 'Parsed Second Epoch',
        secondaryOutputs: [
          { label: 'Unix Seconds', value: Math.floor(ms / 1000) },
          { label: 'Unix Milliseconds', value: Math.round(ms) },
          { label: 'RFC 2822 UTC String', value: dt.toUTCString() },
        ],
        steps: [`Epoch ${ts} (${isMs ? 'ms' : 's'}) = ${dt.toUTCString()}.`],
      };
    },
  },

  // 729. ISO Week Number & Day of Year
  {
    slug: 'iso-week-number-day-of-year-calculator',
    title: 'ISO-8601 Week Number, Day of Year & Leap Year Calculator',
    category: 'date-time',
    formulaDisplay: 'ISO Week 1 = First Week Containing January 4th (Mon–Sun)',
    inputs: [
      { id: 'date', label: 'Calendar Date', type: 'date', defaultValue: '2026-11-20' },
    ],
    calculate: (v) => {
      const dt = parseLocalDate(v.date);
      if (!dt) return calcError('Enter a valid YYYY-MM-DD date.');
      const y = dt.getFullYear();
      const isLeap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
      const startOfYear = new Date(y, 0, 1);
      const doy = Math.floor((dt.getTime() - startOfYear.getTime()) / 86400000) + 1;
      const totalDays = isLeap ? 366 : 365;
      // ISO Week
      const utc = new Date(Date.UTC(y, dt.getMonth(), dt.getDate()));
      const dayNum = utc.getUTCDay() || 7;
      utc.setUTCDate(utc.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
      const isoWeek = Math.ceil((((utc.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
      return {
        primaryValue: `Week ${isoWeek}`,
        primaryUnit: `ISO ${utc.getUTCFullYear()}`,
        primaryLabel: `ISO-8601 Week Number`,
        secondaryOutputs: [
          { label: 'Day of Year (Ordinal)', value: `${doy} of ${totalDays} (${totalDays - doy} left)` },
          { label: 'Weekday & Quarter', value: `${WEEKDAYS[dt.getDay()]} · Q${Math.floor(dt.getMonth() / 3) + 1}` },
          { label: `${y} Leap Year Status`, value: isLeap ? 'Yes (366 days)' : 'No (365 days)' },
        ],
        steps: [`${formatDateIso(dt)} is ISO Week ${isoWeek} (${utc.getUTCFullYear()}), Day ${doy} of ${totalDays}.`],
      };
    },
  },

  // 730. Decimal Hours Timesheet Converter
  {
    slug: 'decimal-hours-timesheet-converter',
    title: 'Payroll Timesheet HH:MM to Decimal Hours Converter',
    category: 'date-time',
    formulaDisplay: 'Decimal Hours = Hours + Minutes / 60',
    inputs: [
      { id: 'hours', label: 'Whole Hours', type: 'number', defaultValue: 38, min: 0, max: 1000, step: 1 },
      { id: 'minutes', label: 'Minutes (0–59)', type: 'number', defaultValue: 45, min: 0, max: 59, step: 1 },
      { id: 'hourlyRate', label: 'Hourly Pay / Billing Rate', type: 'number', prefix: '$', defaultValue: 40, min: 0, max: 100000, step: 1 },
    ],
    calculate: (v) => {
      const h = Math.trunc(parseNum(v.hours));
      const m = Math.trunc(parseNum(v.minutes));
      const rate = parseNum(v.hourlyRate ?? 0);
      if ([h, m, rate].some(Number.isNaN) || h < 0 || m < 0 || m >= 60 || rate < 0) return calcError('Enter valid hours and minutes (0–59).');
      const dec = h + m / 60;
      const pay = dec * rate;
      return {
        primaryValue: fmt(dec, 4),
        primaryUnit: 'decimal hrs',
        primaryLabel: `${h}h ${m}m in Decimal Payroll Hours`,
        secondaryOutputs: [
          { label: 'Gross Pay / Billing Total', value: `$${fmt(pay, 2)}` },
          { label: 'Total Minutes', value: h * 60 + m },
        ],
        steps: [`${h} + ${m}/60 = ${fmt(dec, 4)} hrs × $${rate}/hr = $${fmt(pay, 2)}.`],
      };
    },
  },

  // 731. Weekly Shift Log & Break Deduction Timesheet
  {
    slug: 'weekly-timesheet-overtime-hours-calculator',
    title: 'Weekly Shift Log & Unpaid Break Timesheet Calculator',
    category: 'date-time',
    formulaDisplay: 'Net Weekly Hours = (Shift Hours − Daily Unpaid Break) × Days Worked',
    inputs: [
      { id: 'dailyStartHour', label: 'Daily Clock-In (24h, e.g., 8.5 = 8:30 AM)', type: 'number', defaultValue: 8.5, min: 0, max: 23.9, step: 0.5 },
      { id: 'dailyEndHour', label: 'Daily Clock-Out (24h, e.g., 17.5 = 5:30 PM)', type: 'number', defaultValue: 17.5, min: 0.5, max: 24, step: 0.5 },
      { id: 'unpaidBreakMin', label: 'Unpaid Meal Break / Day', type: 'number', unit: 'min', defaultValue: 30, min: 0, max: 180, step: 15 },
      { id: 'daysWorked', label: 'Days Worked / Week', type: 'number', defaultValue: 5, min: 1, max: 7, step: 1 },
      { id: 'hourlyWage', label: 'Hourly Wage', type: 'number', prefix: '$', defaultValue: 32, min: 0, max: 10000, step: 1 },
    ],
    calculate: (v) => {
      const [s, e, brk, days, wage] = [v.dailyStartHour, v.dailyEndHour, v.unpaidBreakMin, v.daysWorked, v.hourlyWage].map(parseNum);
      if ([s, e, brk, days, wage].some(Number.isNaN) || e <= s || brk < 0 || days < 1 || days > 7 || wage < 0) return calcError('Clock-out must follow clock-in and days 1–7.');
      const netDaily = Math.max(0, e - s - brk / 60);
      const totalWeekly = netDaily * days;
      const regHours = Math.min(40, totalWeekly);
      const otHours = Math.max(0, totalWeekly - 40);
      const grossPay = regHours * wage + otHours * wage * 1.5;
      return {
        primaryValue: fmt(totalWeekly, 2),
        primaryUnit: 'hrs / week',
        primaryLabel: 'Net Weekly Payable Hours',
        secondaryOutputs: [
          { label: 'Regular vs 1.5× Overtime Hours', value: `${fmt(regHours, 2)} reg / ${fmt(otHours, 2)} OT` },
          { label: 'Weekly Gross Pay (FLSA 1.5× >40h)', value: `$${fmt(grossPay, 2)}` },
          { label: 'Net Paid Hours / Day', value: `${fmt(netDaily, 2)} hrs` },
        ],
        steps: [`Daily net = (${e}−${s}) − ${brk}/60 = ${fmt(netDaily, 2)}h × ${days}d = ${fmt(totalWeekly, 2)}h.`],
      };
    },
  },

  // 732. Travel ETA & Speed Calculator
  {
    slug: 'pace-eta-arrival-time-calculator',
    title: 'Travel Distance, Average Speed & Arrival ETA Calculator',
    category: 'date-time',
    formulaDisplay: 'Drive Time = Distance / Speed + Rest Stops',
    inputs: [
      { id: 'distance', label: 'Trip Distance', type: 'number', unit: 'mi / km', defaultValue: 325, min: 0.1, max: 50000, step: 10 },
      { id: 'avgSpeed', label: 'Average Cruising Speed', type: 'number', unit: 'mph / km/h', defaultValue: 65, min: 1, max: 1000, step: 5 },
      { id: 'stopMinutes', label: 'Rest / Fuel / Charging Stops', type: 'number', unit: 'min', defaultValue: 20, min: 0, max: 1440, step: 5 },
      { id: 'departTime', label: 'Departure Time (24h HH:MM)', type: 'time', defaultValue: '08:30' },
    ],
    calculate: (v) => {
      const d = parseNum(v.distance);
      const spd = parseNum(v.avgSpeed);
      const stop = parseNum(v.stopMinutes ?? 0);
      const tStr = String(v.departTime || '08:30');
      const m = tStr.match(/^(\d{1,2}):(\d{2})$/);
      if ([d, spd, stop].some(Number.isNaN) || d <= 0 || spd <= 0 || stop < 0 || !m) return calcError('Enter positive distance, speed, and valid HH:MM departure.');
      const driveMin = (d / spd) * 60 + stop;
      const depMin = Number(m[1]) * 60 + Number(m[2]);
      const arrTot = depMin + Math.round(driveMin);
      const daysLater = Math.floor(arrTot / 1440);
      const arrMod = ((arrTot % 1440) + 1440) % 1440;
      const arrH = String(Math.floor(arrMod / 60)).padStart(2, '0');
      const arrM = String(arrMod % 60).padStart(2, '0');
      return {
        primaryValue: `${arrH}:${arrM}${daysLater > 0 ? ` (+${daysLater}d)` : ''}`,
        primaryUnit: '24h ETA',
        primaryLabel: 'Estimated Arrival Time',
        secondaryOutputs: [
          { label: 'Total Elapsed Trip Time', value: `${Math.floor(driveMin / 60)}h ${Math.round(driveMin % 60)}m` },
          { label: 'Pure Driving Time (Excl. Stops)', value: `${fmt(d / spd, 2)} hrs` },
        ],
        steps: [`Driving ${d}/${spd} = ${fmt(d / spd, 2)}h + ${stop}m stops = ${Math.round(driveMin)}m → ETA ${arrH}:${arrM}.`],
      };
    },
  },

  // 733. Leap Year Checker & Feb-29 Occurrences
  {
    slug: 'leap-year-calendar-occurrences-calculator',
    title: 'Gregorian Leap Year Checker & Feb 29 Occurrences Calculator',
    category: 'date-time',
    formulaDisplay: 'Leap if (Y % 4 === 0 && Y % 100 !== 0) || Y % 400 === 0',
    inputs: [
      { id: 'startYear', label: 'Start Year', type: 'number', defaultValue: 2000, min: 1582, max: 3000, step: 1 },
      { id: 'endYear', label: 'End Year', type: 'number', defaultValue: 2030, min: 1582, max: 3000, step: 1 },
    ],
    calculate: (v) => {
      const y1 = Math.trunc(parseNum(v.startYear));
      const y2 = Math.trunc(parseNum(v.endYear));
      if (Number.isNaN(y1) || Number.isNaN(y2) || y1 < 1582 || y2 > 3000 || y1 > y2) return calcError('Enter Gregorian years 1582–3000 with Start <= End.');
      const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
      const leaps: number[] = [];
      for (let y = y1; y <= y2; y++) if (isLeap(y)) leaps.push(y);
      return {
        primaryValue: leaps.length,
        primaryUnit: 'leap years',
        primaryLabel: `Leap Years From ${y1} to ${y2}`,
        secondaryOutputs: [
          { label: `${y1} / ${y2} Leap Status`, value: `${isLeap(y1) ? 'Leap' : 'Common'} / ${isLeap(y2) ? 'Leap' : 'Common'}` },
          { label: 'Matching Years', value: leaps.slice(0, 12).join(', ') + (leaps.length > 12 ? ` ... (+${leaps.length - 12} more)` : '') || 'None' },
        ],
        steps: [`Applied Gregorian 4/100/400 rule across [${y1}, ${y2}]: found ${leaps.length} leap years.`],
      };
    },
  },

  // 734. Event Countdown Milestones
  {
    slug: 'countdown-event-milestones-calculator',
    title: 'Event Countdown & Business Days Remaining Calculator',
    category: 'date-time',
    formulaDisplay: 'Delta = Target Date − Reference Date (Calendar, Weeks & Weekdays)',
    inputs: [
      { id: 'fromDate', label: 'Reference / Today Date', type: 'date', defaultValue: '2026-11-20' },
      { id: 'targetDate', label: 'Target Event Date', type: 'date', defaultValue: '2027-06-15' },
    ],
    calculate: (v) => {
      const d1 = parseLocalDate(v.fromDate);
      const d2 = parseLocalDate(v.targetDate);
      if (!d1 || !d2) return calcError('Enter valid YYYY-MM-DD dates.');
      const diffDays = Math.round((d2.getTime() - d1.getTime()) / 86400000);
      const start = diffDays >= 0 ? d1 : d2;
      const end = diffDays >= 0 ? d2 : d1;
      const absDays = Math.min(Math.abs(diffDays), 36500);
      let weekdays = 0;
      const cur = new Date(start.getTime());
      for (let i = 0; i < absDays; i++) {
        cur.setDate(cur.getDate() + 1);
        const wd = cur.getDay();
        if (wd !== 0 && wd !== 6) weekdays++;
      }
      return {
        primaryValue: Math.abs(diffDays),
        primaryUnit: diffDays >= 0 ? 'days remaining' : 'days ago',
        primaryLabel: diffDays >= 0 ? 'Days Until Event' : 'Days Since Event',
        secondaryOutputs: [
          { label: 'Full Weeks + Remainder Days', value: `${Math.floor(Math.abs(diffDays) / 7)} wks, ${Math.abs(diffDays) % 7} d` },
          { label: 'Mon–Fri Workdays', value: weekdays },
          { label: 'Target Weekday', value: WEEKDAYS[d2.getDay()] },
        ],
        steps: [`${formatDateIso(start)} → ${formatDateIso(end)} = ${Math.abs(diffDays)} calendar days (${weekdays} weekdays).`],
      };
    },
  },

  // 735. Epigenetic Dog & Cat Age Calculator
  {
    slug: 'dog-cat-pet-age-human-years-calculator',
    title: 'Dog & Cat Age in Human Years (UCSD Epigenetic Formula) Calculator',
    category: 'date-time',
    formulaDisplay: 'Dog (UCSD 2020) = 16·ln(age) + 31   |   Cat = 15 (yr1) + 9 (yr2) + 4/yr',
    inputs: [
      {
        id: 'species',
        label: 'Pet Species',
        type: 'select',
        defaultValue: 'dog',
        options: [
          { label: 'Dog (UCSD Epigenetic Formula)', value: 'dog' },
          { label: 'Cat (AAFP / AAHA Life Stage)', value: 'cat' },
        ],
      },
      { id: 'petAgeYears', label: 'Pet Chronological Age', type: 'number', unit: 'years', defaultValue: 5, min: 0.25, max: 35, step: 0.5 },
    ],
    calculate: (v) => {
      const sp = String(v.species || 'dog');
      const age = parseNum(v.petAgeYears);
      if (Number.isNaN(age) || age <= 0 || age > 40) return calcError('Enter pet age between 0.1 and 40 years.');
      let humanAge = 0;
      if (sp === 'dog') {
        humanAge = age >= 1 ? 16 * Math.log(age) + 31 : age * 31;
      } else {
        if (age <= 1) humanAge = age * 15;
        else if (age <= 2) humanAge = 15 + (age - 1) * 9;
        else humanAge = 24 + (age - 2) * 4;
      }
      return {
        primaryValue: fmt(humanAge, 1),
        primaryUnit: 'human years',
        primaryLabel: `Equivalent Human Age (${sp === 'dog' ? 'Dog' : 'Cat'})`,
        secondaryOutputs: [
          { label: 'Formula Standard', value: sp === 'dog' ? 'Wang et al. (2020) 16·ln(Age)+31' : 'AAHA/AAFP Feline Standard' },
          { label: 'Linear Traditional Estimate', value: `${fmt(age * 7, 1)} yrs (legacy 7× myth)` },
        ],
        steps: [sp === 'dog' ? `16 × ln(${age}) + 31 = ${fmt(humanAge, 1)} human years.` : `AAHA feline stage curve at ${age} yrs = ${fmt(humanAge, 1)} human years.`],
      };
    },
  },

  // 736. Pomodoro Study & Focus Blocks Planner
  {
    slug: 'pomodoro-study-work-blocks-calculator',
    title: 'Pomodoro Focus Sessions & Completion Time Calculator',
    category: 'date-time',
    formulaDisplay: 'Sessions = Total Study Minutes / Focus Block; Long Break Every 4 Cycles',
    inputs: [
      { id: 'totalFocusMinutes', label: 'Target Deep-Work Minutes', type: 'number', unit: 'min', defaultValue: 150, min: 15, max: 1440, step: 25 },
      { id: 'focusBlockMin', label: 'Focus Session Length', type: 'number', unit: 'min', defaultValue: 25, min: 10, max: 120, step: 5 },
      { id: 'shortBreakMin', label: 'Short Break Length', type: 'number', unit: 'min', defaultValue: 5, min: 1, max: 30, step: 1 },
      { id: 'longBreakMin', label: 'Long Break Every 4 Sessions', type: 'number', unit: 'min', defaultValue: 15, min: 5, max: 60, step: 5 },
      { id: 'startTime', label: 'Session Start Time (HH:MM)', type: 'time', defaultValue: '09:00' },
    ],
    calculate: (v) => {
      const [tot, blk, sh, lg] = [v.totalFocusMinutes, v.focusBlockMin, v.shortBreakMin, v.longBreakMin].map(parseNum);
      const m = String(v.startTime || '09:00').match(/^(\d{1,2}):(\d{2})$/);
      if ([tot, blk, sh, lg].some(Number.isNaN) || tot <= 0 || blk <= 0 || sh < 0 || lg < 0 || !m) return calcError('Enter valid positive Pomodoro durations.');
      const sessions = Math.ceil(tot / blk);
      const longBreaks = Math.floor((sessions - 1) / 4);
      const shortBreaks = Math.max(0, sessions - 1 - longBreaks);
      const totalElapsed = sessions * blk + shortBreaks * sh + longBreaks * lg;
      const finishMin = (Number(m[1]) * 60 + Number(m[2]) + totalElapsed) % 1440;
      const finishStr = `${String(Math.floor(finishMin / 60)).padStart(2, '0')}:${String(finishMin % 60).padStart(2, '0')}`;
      return {
        primaryValue: finishStr,
        primaryUnit: `${sessions} cycles`,
        primaryLabel: 'Estimated Completion Time',
        secondaryOutputs: [
          { label: 'Total Wall-Clock Duration', value: `${Math.floor(totalElapsed / 60)}h ${totalElapsed % 60}m` },
          { label: 'Breaks Scheduled', value: `${shortBreaks} short + ${longBreaks} long` },
        ],
        steps: [`${sessions} × ${blk}m focus + ${shortBreaks}×${sh}m + ${longBreaks}×${lg}m = ${totalElapsed}m → Finish at ${finishStr}.`],
      };
    },
  },

  // 737. Multi-City Global Team Business Hour Overlap
  {
    slug: 'meeting-time-overlap-global-teams-calculator',
    title: 'Global Team Meeting Time Overlap Calculator (UTC Offsets)',
    category: 'date-time',
    formulaDisplay: 'Intersect [09:00–17:00] Local Working Windows Converted to UTC',
    inputs: [
      { id: 'offsetA', label: 'City A UTC Offset (e.g., NYC EST = −5)', type: 'number', unit: 'UTC hrs', defaultValue: -5, min: -12, max: 14, step: 0.5 },
      { id: 'offsetB', label: 'City B UTC Offset (e.g., London GMT = 0)', type: 'number', unit: 'UTC hrs', defaultValue: 0, min: -12, max: 14, step: 0.5 },
      { id: 'offsetC', label: 'City C UTC Offset (e.g., Berlin CET = +1)', type: 'number', unit: 'UTC hrs', defaultValue: 1, min: -12, max: 14, step: 0.5 },
    ],
    calculate: (v) => {
      const [oA, oB, oC] = [v.offsetA, v.offsetB, v.offsetC].map(parseNum);
      if ([oA, oB, oC].some(Number.isNaN) || [oA, oB, oC].some((o) => o < -12 || o > 14)) return calcError('UTC offsets must be between −12 and +14.');
      const win = (off: number): [number, number] => [9 - off, 17 - off];
      const [sA, eA] = win(oA);
      const [sB, eB] = win(oB);
      const [sC, eC] = win(oC);
      const maxS = Math.max(sA, sB, sC);
      const minE = Math.min(eA, eB, eC);
      const overlapHrs = Math.max(0, minE - maxS);
      const fmtHr = (h: number) => {
        const mod = ((h % 24) + 24) % 24;
        const hh = Math.floor(mod);
        const mm = Math.round((mod - hh) * 60);
        return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
      };
      return {
        primaryValue: fmt(overlapHrs, 1),
        primaryUnit: 'hrs overlap',
        primaryLabel: overlapHrs > 0 ? 'Shared 9–5 Business Window' : 'No Shared 9–5 Overlap',
        secondaryOutputs: [
          { label: 'Optimal UTC Window', value: overlapHrs > 0 ? `${fmtHr(maxS)} – ${fmtHr(minE)} UTC` : 'None' },
          { label: 'City A Local Window', value: overlapHrs > 0 ? `${fmtHr(maxS + oA)} – ${fmtHr(minE + oA)}` : 'Flex Hours Needed' },
        ],
        steps: [`9–17 local converted to UTC intersects across all 3 zones for ${fmt(overlapHrs, 1)} hrs (${overlapHrs > 0 ? fmtHr(maxS) + '–' + fmtHr(minE) + ' UTC' : 'no 9–5 overlap'}).`],
      };
    },
  },

  // 738. Astronomical Daylight Length Estimator
  {
    slug: 'sunrise-solar-noon-daylight-calculator',
    title: 'Solar Day Length & Declination Estimator by Latitude & Date',
    category: 'date-time',
    formulaDisplay: 'Daylight = (24 / π) × arccos(−tan(φ) · tan(δ))',
    inputs: [
      { id: 'latitude', label: 'Observer Latitude (° North +, South −)', type: 'number', unit: '°', defaultValue: 40.7, min: -89, max: 89, step: 0.5 },
      { id: 'date', label: 'Calendar Date', type: 'date', defaultValue: '2026-06-21' },
    ],
    calculate: (v) => {
      const lat = parseNum(v.latitude);
      const dt = parseLocalDate(v.date);
      if (Number.isNaN(lat) || Math.abs(lat) > 89 || !dt) return calcError('Enter latitude between −89° and +89° and a valid date.');
      const start = new Date(dt.getFullYear(), 0, 1);
      const doy = Math.floor((dt.getTime() - start.getTime()) / 86400000) + 1;
      const declDeg = 23.44 * Math.sin(((2 * Math.PI) / 365) * (doy - 81));
      const declRad = (declDeg * Math.PI) / 180;
      const latRad = (lat * Math.PI) / 180;
      const cosH0 = -Math.tan(latRad) * Math.tan(declRad);
      let dayHrs = 12;
      if (cosH0 <= -1) dayHrs = 24;
      else if (cosH0 >= 1) dayHrs = 0;
      else dayHrs = (24 / Math.PI) * Math.acos(cosH0);
      const hh = Math.floor(dayHrs);
      const mm = Math.round((dayHrs - hh) * 60);
      return {
        primaryValue: `${hh}h ${String(mm).padStart(2, '0')}m`,
        primaryUnit: 'daylight',
        primaryLabel: `Estimated Photoperiod at ${lat}°`,
        secondaryOutputs: [
          { label: 'Decimal Daylight Hours', value: fmt(dayHrs, 2) },
          { label: 'Solar Declination (δ)', value: `${fmt(declDeg, 2)}°` },
        ],
        steps: [`Day ${doy} declination δ = ${fmt(declDeg, 2)}° → Photoperiod = ${fmt(dayHrs, 2)} hrs.`],
      };
    },
  },

  // 739. Legal 6-Minute Billing Increment Converter
  {
    slug: 'billable-stopwatch-minutes-cost-calculator',
    title: '6-Minute Legal Billing Increment & Stopwatch Fee Calculator',
    category: 'date-time',
    formulaDisplay: '0.1 hr = 6 min; Total Fee = ceil(Minutes / 6) × 0.1 × Hourly Rate',
    inputs: [
      { id: 'minutesWorked', label: 'Actual Elapsed Minutes', type: 'number', unit: 'min', defaultValue: 38, min: 1, max: 10000, step: 1 },
      { id: 'hourlyRate', label: 'Hourly Billing Rate', type: 'number', prefix: '$', defaultValue: 350, min: 1, max: 100000, step: 10 },
    ],
    calculate: (v) => {
      const mins = parseNum(v.minutesWorked);
      const rate = parseNum(v.hourlyRate);
      if (Number.isNaN(mins) || Number.isNaN(rate) || mins <= 0 || rate <= 0) return calcError('Minutes and rate must be positive.');
      const units = Math.ceil(mins / 6);
      const billableHours = units * 0.1;
      const fee = billableHours * rate;
      return {
        primaryValue: fmt(billableHours, 1),
        primaryUnit: 'billable hrs',
        primaryLabel: `${units} Six-Minute Billing Tenths`,
        secondaryOutputs: [
          { label: 'Total Invoice Amount', value: `$${fmt(fee, 2)}` },
          { label: 'Exact Unrounded Hours', value: fmt(mins / 60, 4) },
        ],
        steps: [`ceil(${mins} ÷ 6) = ${units} increments = ${fmt(billableHours, 1)} hrs × $${rate} = $${fmt(fee, 2)}.`],
      };
    },
  },

  // 740. Calendar & Fiscal Quarter Progress Calculator
  {
    slug: 'quarter-fiscal-year-date-calculator',
    title: 'Calendar & Fiscal Quarter Progress & Days Remaining Calculator',
    category: 'date-time',
    formulaDisplay: 'Quarter Boundaries & Elapsed % for Any Date',
    inputs: [
      { id: 'date', label: 'Reference Date', type: 'date', defaultValue: '2026-11-20' },
    ],
    calculate: (v) => {
      const dt = parseLocalDate(v.date);
      if (!dt) return calcError('Enter a valid date (YYYY-MM-DD).');
      const q = Math.floor(dt.getMonth() / 3) + 1;
      const qStart = new Date(dt.getFullYear(), (q - 1) * 3, 1);
      const qEnd = new Date(dt.getFullYear(), q * 3, 0);
      const totalQDays = Math.round((qEnd.getTime() - qStart.getTime()) / 86400000) + 1;
      const elapsed = Math.round((dt.getTime() - qStart.getTime()) / 86400000) + 1;
      const remaining = totalQDays - elapsed;
      const pct = (elapsed / totalQDays) * 100;
      return {
        primaryValue: `Q${q} ${dt.getFullYear()}`,
        primaryUnit: `${fmt(pct, 1)}% elapsed`,
        primaryLabel: `${remaining} Days Remaining in Quarter`,
        secondaryOutputs: [
          { label: 'Quarter Date Span', value: `${formatDateIso(qStart)} → ${formatDateIso(qEnd)}` },
          { label: 'Day of Quarter', value: `${elapsed} of ${totalQDays}` },
        ],
        steps: [`${formatDateIso(dt)} falls in Q${q} (${formatDateIso(qStart)} to ${formatDateIso(qEnd)}): ${remaining} days left.`],
      };
    },
  },

  // 741. Annual Working Hours & FTE Capacity Calculator
  {
    slug: 'working-hours-per-year-fte-calculator',
    title: 'Annual Working Hours, Holidays & FTE Capacity Calculator',
    category: 'date-time',
    formulaDisplay: 'Net Capacity = (Workdays − Holidays − PTO) × Daily Hours',
    inputs: [
      { id: 'weekdaysPerYear', label: 'Calendar Weekdays (260–262)', type: 'number', defaultValue: 261, min: 200, max: 262, step: 1 },
      { id: 'publicHolidays', label: 'Paid Public Holidays', type: 'number', unit: 'days', defaultValue: 11, min: 0, max: 40, step: 1 },
      { id: 'ptoDays', label: 'Employee PTO / Vacation Days', type: 'number', unit: 'days', defaultValue: 15, min: 0, max: 80, step: 1 },
      { id: 'hoursPerDay', label: 'Paid Hours Per Shift', type: 'number', unit: 'hrs', defaultValue: 8, min: 1, max: 16, step: 0.5 },
    ],
    calculate: (v) => {
      const [wd, hol, pto, hpd] = [v.weekdaysPerYear, v.publicHolidays, v.ptoDays, v.hoursPerDay].map(parseNum);
      if ([wd, hol, pto, hpd].some(Number.isNaN) || wd < hol + pto || hpd <= 0) return calcError('Total holidays + PTO cannot exceed annual weekdays.');
      const grossHrs = wd * hpd;
      const netDays = wd - hol - pto;
      const netHrs = netDays * hpd;
      return {
        primaryValue: Math.round(netHrs),
        primaryUnit: 'net hrs / yr',
        primaryLabel: `1.0 FTE Productive Annual Hours (${netDays} days)`,
        secondaryOutputs: [
          { label: 'Gross Payroll Hours (2,080 Std)', value: Math.round(grossHrs) },
          { label: 'Net Productive % of Gross', value: `${fmt((netHrs / grossHrs) * 100, 1)}%` },
        ],
        steps: [`(${wd} − ${hol} − ${pto}) × ${hpd} = ${Math.round(netHrs)} net hours.`],
      };
    },
  },

  // 742. Video / Audio Playback Speed Time Calculator
  {
    slug: 'video-audio-playback-speed-time-calculator',
    title: 'Video & Lecture Playback Speed Time-Savings Calculator',
    category: 'date-time',
    formulaDisplay: 'Actual Watch Time = Original Minutes / Speed Multiplier',
    inputs: [
      { id: 'origHours', label: 'Original Runtime Hours', type: 'number', defaultValue: 3, min: 0, max: 1000, step: 1 },
      { id: 'origMinutes', label: 'Original Runtime Minutes', type: 'number', defaultValue: 20, min: 0, max: 59, step: 5 },
      { id: 'speed', label: 'Playback Speed Multiplier', type: 'number', unit: '×', defaultValue: 1.5, min: 0.25, max: 4.0, step: 0.25 },
    ],
    calculate: (v) => {
      const h = parseNum(v.origHours);
      const m = parseNum(v.origMinutes);
      const spd = parseNum(v.speed);
      if ([h, m, spd].some(Number.isNaN) || h < 0 || m < 0 || h + m <= 0 || spd <= 0) return calcError('Enter positive runtime and speed multiplier.');
      const totalMin = h * 60 + m;
      const watchMin = totalMin / spd;
      const savedMin = totalMin - watchMin;
      const fmtMin = (x: number) => `${Math.floor(Math.abs(x) / 60)}h ${Math.round(Math.abs(x) % 60)}m`;
      return {
        primaryValue: fmtMin(watchMin),
        primaryUnit: `@ ${spd}×`,
        primaryLabel: 'Adjusted Watch Time',
        secondaryOutputs: [
          { label: savedMin >= 0 ? 'Time Saved' : 'Extra Time Added', value: fmtMin(savedMin) },
          { label: 'Original Duration', value: fmtMin(totalMin) },
        ],
        steps: [`${totalMin} min ÷ ${spd}× = ${fmt(watchMin, 1)} min (${fmtMin(watchMin)}).`],
      };
    },
  },

  // 743. IT SLA Uptime "Nines" Allowed Downtime
  {
    slug: 'sla-uptime-downtime-nines-calculator',
    title: 'SLA Uptime "Nines" & Allowed Downtime Calculator',
    category: 'date-time',
    formulaDisplay: 'Downtime = Total Seconds in Period × (1 − Uptime%)',
    inputs: [
      { id: 'uptimePct', label: 'SLA Uptime Target (e.g., 99.9, 99.95, 99.99)', type: 'number', unit: '%', defaultValue: 99.95, min: 50, max: 99.99999, step: 0.01 },
    ],
    calculate: (v) => {
      const u = parseNum(v.uptimePct);
      if (Number.isNaN(u) || u <= 0 || u >= 100) return calcError('Enter SLA uptime strictly between 0% and 100%.');
      const downFrac = 1 - u / 100;
      const yrSec = 365 * 86400 * downFrac;
      const moSec = 30 * 86400 * downFrac;
      const wkSec = 7 * 86400 * downFrac;
      const fmtSec = (s: number) => s >= 3600 ? `${fmt(s / 3600, 2)} hrs` : s >= 60 ? `${fmt(s / 60, 2)} min` : `${fmt(s, 1)} sec`;
      return {
        primaryValue: fmtSec(yrSec),
        primaryUnit: 'per year',
        primaryLabel: `Max Allowed Annual Downtime (${u}% SLA)`,
        secondaryOutputs: [
          { label: 'Monthly Error Budget (30d)', value: fmtSec(moSec) },
          { label: 'Weekly Error Budget', value: fmtSec(wkSec) },
        ],
        steps: [`At ${u}% availability, allowed unavailability = ${fmt(downFrac * 100, 4)}% → ${fmtSec(yrSec)}/yr (${fmtSec(moSec)}/mo).`],
      };
    },
  },

  // 744. Pediatric & Legal Exact Age Precision
  {
    slug: 'chronological-age-month-day-precision-calculator',
    title: 'Exact Chronological Age (Years, Months, Days & Total Months)',
    category: 'date-time',
    formulaDisplay: 'Calendar Year/Month/Day Exact Delta',
    inputs: [
      { id: 'birthDate', label: 'Date of Birth', type: 'date', defaultValue: '2024-03-15' },
      { id: 'asOfDate', label: 'Assessment / As-Of Date', type: 'date', defaultValue: '2026-11-20' },
    ],
    calculate: (v) => {
      const dob = parseLocalDate(v.birthDate);
      const ref = parseLocalDate(v.asOfDate);
      if (!dob || !ref || ref < dob) return calcError('Assessment date must follow date of birth.');
      let yrs = ref.getFullYear() - dob.getFullYear();
      let mos = ref.getMonth() - dob.getMonth();
      let days = ref.getDate() - dob.getDate();
      if (days < 0) {
        mos -= 1;
        const prevMonthEnd = new Date(ref.getFullYear(), ref.getMonth(), 0).getDate();
        days += prevMonthEnd;
      }
      if (mos < 0) {
        yrs -= 1;
        mos += 12;
      }
      const totalMonths = yrs * 12 + mos;
      const totalDays = Math.round((ref.getTime() - dob.getTime()) / 86400000);
      return {
        primaryValue: `${yrs}y ${mos}m ${days}d`,
        primaryUnit: 'exact age',
        primaryLabel: 'Exact Chronological Age',
        secondaryOutputs: [
          { label: 'Completed Months (Pediatric)', value: `${totalMonths} months, ${days} days` },
          { label: 'Total Weeks / Total Days', value: `${Math.floor(totalDays / 7)} wks / ${totalDays.toLocaleString()} days` },
        ],
        steps: [`DOB ${formatDateIso(dob)} → As-of ${formatDateIso(ref)} = ${yrs} yrs, ${mos} mos, ${days} days.`],
      };
    },
  },

  // 745. Retirement Countdown & Remaining Paychecks
  {
    slug: 'retirement-countdown-paychecks-calculator',
    title: 'Retirement Date Countdown & Remaining Paychecks Calculator',
    category: 'date-time',
    formulaDisplay: 'Paychecks Remaining = floor(Days Remaining / Pay Period Days)',
    inputs: [
      { id: 'todayDate', label: 'Current Date', type: 'date', defaultValue: '2026-11-20' },
      { id: 'retireDate', label: 'Target Retirement Date', type: 'date', defaultValue: '2035-07-01' },
      {
        id: 'payPeriodDays',
        label: 'Pay Cycle',
        type: 'select',
        defaultValue: '14',
        options: [
          { label: 'Biweekly (Every 14 Days)', value: '14' },
          { label: 'Weekly (Every 7 Days)', value: '7' },
          { label: 'Semi-Monthly (~15.22 Days)', value: '15.21875' },
          { label: 'Monthly (~30.44 Days)', value: '30.4375' },
        ],
      },
    ],
    calculate: (v) => {
      const d1 = parseLocalDate(v.todayDate);
      const d2 = parseLocalDate(v.retireDate);
      const cycle = parseNum(v.payPeriodDays || 14);
      if (!d1 || !d2 || d2 <= d1 || Number.isNaN(cycle) || cycle <= 0) return calcError('Retirement date must be in the future.');
      const days = Math.round((d2.getTime() - d1.getTime()) / 86400000);
      const paychecks = Math.floor(days / cycle);
      return {
        primaryValue: days.toLocaleString(),
        primaryUnit: 'days',
        primaryLabel: `Countdown to Retirement (${fmt(days / 365.25, 2)} yrs)`,
        secondaryOutputs: [
          { label: 'Estimated Remaining Paychecks', value: paychecks.toLocaleString() },
          { label: 'Weeks Remaining', value: Math.floor(days / 7).toLocaleString() },
        ],
        steps: [`${days} calendar days ÷ ${fmt(cycle, 2)} days/cycle ≈ ${paychecks} paychecks remaining.`],
      };
    },
  },

  // ==========================================
  // EDUCATION (20 Calculators: 746–765)
  // ==========================================

  // 746. Weighted College Course Syllabus Grade Calculator
  {
    slug: 'weighted-college-course-grade-calculator',
    title: 'Weighted Syllabus Course Grade Calculator',
    category: 'education',
    formulaDisplay: 'Grade = Σ(Category Score × Weight) / Σ(Completed Weights)',
    inputs: [
      { id: 's1', label: 'Homework / Labs Avg (%)', type: 'number', unit: '%', defaultValue: 92, min: 0, max: 150, step: 1 },
      { id: 'w1', label: 'Homework Weight (%)', type: 'number', unit: '%', defaultValue: 25, min: 0, max: 100, step: 5 },
      { id: 's2', label: 'Midterm Exams Avg (%)', type: 'number', unit: '%', defaultValue: 84, min: 0, max: 150, step: 1 },
      { id: 'w2', label: 'Midterms Weight (%)', type: 'number', unit: '%', defaultValue: 35, min: 0, max: 100, step: 5 },
      { id: 's3', label: 'Projects / Participation (%)', type: 'number', unit: '%', defaultValue: 90, min: 0, max: 150, step: 1 },
      { id: 'w3', label: 'Projects Weight (%)', type: 'number', unit: '%', defaultValue: 15, min: 0, max: 100, step: 5 },
      { id: 'targetCourse', label: 'Target Overall Course Grade (%)', type: 'number', unit: '%', defaultValue: 90, min: 0, max: 100, step: 1 },
    ],
    calculate: (v) => {
      const [s1, w1, s2, w2, s3, w3, tgt] = [v.s1, v.w1, v.s2, v.w2, v.s3, v.w3, v.targetCourse].map(parseNum);
      if ([s1, w1, s2, w2, s3, w3, tgt].some(Number.isNaN) || w1 + w2 + w3 <= 0 || w1 + w2 + w3 > 100) return calcError('Completed syllabus weights must be > 0% and ≤ 100%.');
      const earnedPts = (s1 * w1 + s2 * w2 + s3 * w3) / 100;
      const completedW = w1 + w2 + w3;
      const curAvg = (earnedPts / completedW) * 100;
      const remW = 100 - completedW;
      const neededOnFinal = remW > 0 ? ((tgt - earnedPts) / remW) * 100 : null;
      return {
        primaryValue: fmt(curAvg, 2),
        primaryUnit: '%',
        primaryLabel: 'Current Weighted Standing',
        secondaryOutputs: [
          { label: 'Course Points Locked In', value: `${fmt(earnedPts, 2)} / ${completedW} pts` },
          { label: `Score Needed on Remaining ${remW}%`, value: neededOnFinal !== null ? `${fmt(neededOnFinal, 2)}%` : '100% Completed' },
        ],
        steps: [`Earned ${fmt(earnedPts, 2)} weighted points out of ${completedW}% → Current = ${fmt(curAvg, 2)}%.`],
      };
    },
  },

  // 747. Cumulative GPA Semester Impact Planner
  {
    slug: 'cumulative-gpa-semester-planner-calculator',
    title: 'Cumulative GPA Impact & Semester Planner Calculator',
    category: 'education',
    formulaDisplay: 'New Cum GPA = (Prior GPA × Prior Credits + Sem GPA × Sem Credits) / Total Credits',
    inputs: [
      { id: 'priorGpa', label: 'Current Cumulative GPA (0–4.0)', type: 'number', defaultValue: 3.35, min: 0, max: 4.5, step: 0.05 },
      { id: 'priorCredits', label: 'Completed Graded Credits', type: 'number', defaultValue: 60, min: 0, max: 300, step: 3 },
      { id: 'semGpa', label: 'Projected Current Semester GPA', type: 'number', defaultValue: 3.8, min: 0, max: 4.5, step: 0.05 },
      { id: 'semCredits', label: 'Current Semester Credits', type: 'number', defaultValue: 15, min: 1, max: 40, step: 1 },
    ],
    calculate: (v) => {
      const [g0, c0, gs, cs] = [v.priorGpa, v.priorCredits, v.semGpa, v.semCredits].map(parseNum);
      if ([g0, c0, gs, cs].some(Number.isNaN) || c0 < 0 || cs <= 0 || g0 < 0 || gs < 0) return calcError('Enter valid non-negative GPAs and credits.');
      const totCred = c0 + cs;
      const newGpa = (g0 * c0 + gs * cs) / totCred;
      return {
        primaryValue: fmt(newGpa, 3),
        primaryUnit: 'GPA',
        primaryLabel: 'Projected New Cumulative GPA',
        secondaryOutputs: [
          { label: 'GPA Delta', value: `${newGpa - g0 >= 0 ? '+' : ''}${fmt(newGpa - g0, 3)}` },
          { label: 'Total Cumulative Credits', value: totCred },
        ],
        steps: [`(${g0}×${c0} + ${gs}×${cs}) ÷ ${totCred} = ${fmt(newGpa, 3)} GPA.`],
      };
    },
  },

  // 748. Percentage to 4.0 GPA & International Scale Converter
  {
    slug: 'percentage-to-4-0-gpa-scale-converter',
    title: 'Percentage to 4.0 GPA, Letter Grade & UK Honours Converter',
    category: 'education',
    formulaDisplay: 'Standard US College 4.0 Tiered & Linear Equivalence',
    inputs: [
      { id: 'percentScore', label: 'Numeric Percentage Grade (0–100)', type: 'number', unit: '%', defaultValue: 88, min: 0, max: 100, step: 1 },
    ],
    calculate: (v) => {
      const p = parseNum(v.percentScore);
      if (Number.isNaN(p) || p < 0 || p > 100) return calcError('Enter percentage score between 0 and 100.');
      const scale: [number, string, number][] = [
        [93, 'A', 4.0], [90, 'A−', 3.7], [87, 'B+', 3.3], [83, 'B', 3.0],
        [80, 'B−', 2.7], [77, 'C+', 2.3], [73, 'C', 2.0], [70, 'C−', 1.7],
        [67, 'D+', 1.3], [63, 'D', 1.0], [60, 'D−', 0.7], [0, 'F', 0.0],
      ];
      const match = scale.find(([min]) => p >= min) || [0, 'F', 0.0];
      const ukClass = p >= 70 ? 'First-Class Honours (1st)' : p >= 60 ? 'Upper Second (2:1)' : p >= 50 ? 'Lower Second (2:2)' : 'Third / Fail';
      return {
        primaryValue: fmt(match[2], 1),
        primaryUnit: `4.0 Scale (${match[1]})`,
        primaryLabel: 'US 4.0 Grade Point Equivalent',
        secondaryOutputs: [
          { label: 'Standard Letter Grade', value: match[1] },
          { label: 'UK University Classification (UK scale)', value: ukClass },
        ],
        steps: [`${p}% maps to US Letter ${match[1]} (${fmt(match[2], 1)} / 4.0).`],
      };
    },
  },

  // 749. Test Score Percentage & Square-Root Curve Calculator
  {
    slug: 'test-score-percentage-curve-calculator',
    title: 'Test Score Percentage & Square-Root Curve Calculator',
    category: 'education',
    formulaDisplay: 'Raw % = Correct/Total   |   Sqrt Curve = 10 × √(Raw%)',
    inputs: [
      { id: 'correct', label: 'Correct Answers / Earned Points', type: 'number', defaultValue: 38, min: 0, max: 10000, step: 1 },
      { id: 'total', label: 'Total Questions / Max Points', type: 'number', defaultValue: 50, min: 1, max: 10000, step: 1 },
      { id: 'flatBonusPts', label: 'Optional Flat Points Curve', type: 'number', defaultValue: 0, min: 0, max: 100, step: 1 },
    ],
    calculate: (v) => {
      const c = parseNum(v.correct);
      const t = parseNum(v.total);
      const bonus = parseNum(v.flatBonusPts ?? 0);
      if ([c, t, bonus].some(Number.isNaN) || c < 0 || t <= 0 || bonus < 0) return calcError('Total questions must be positive.');
      const rawPct = Math.min(100, (c / t) * 100);
      const sqrtCurve = Math.min(100, 10 * Math.sqrt(rawPct));
      const flatCurved = Math.min(100, rawPct + bonus);
      return {
        primaryValue: fmt(rawPct, 2),
        primaryUnit: '%',
        primaryLabel: `Raw Score (${c} / ${t})`,
        secondaryOutputs: [
          { label: 'Missed Points / Questions', value: fmt(Math.max(0, t - c), 1) },
          { label: 'Square-Root Curved Score (10√%)', value: `${fmt(sqrtCurve, 2)}%` },
          { label: 'Flat Bonus Adjusted Score', value: `${fmt(flatCurved, 2)}%` },
        ],
        steps: [`Raw = ${c}/${t} = ${fmt(rawPct, 2)}%; 10·√(${fmt(rawPct, 2)}) = ${fmt(sqrtCurve, 2)}%.`],
      };
    },
  },

  // 750. Official ACT ↔ SAT Concordance Converter
  {
    slug: 'sat-act-concordance-score-converter',
    title: 'ACT to SAT Official Concordance Score Converter',
    category: 'education',
    formulaDisplay: 'College Board & ACT Official Concordance Table (ACT 9–36 ↔ SAT 590–1600)',
    inputs: [
      { id: 'actComposite', label: 'ACT Composite Score (9–36)', type: 'number', defaultValue: 30, min: 9, max: 36, step: 1 },
    ],
    calculate: (v) => {
      const act = Math.round(parseNum(v.actComposite));
      if (Number.isNaN(act) || act < 9 || act > 36) return calcError('Enter an ACT composite integer from 9 to 36.');
      const satMap: Record<number, number> = {
        36: 1590, 35: 1540, 34: 1500, 33: 1460, 32: 1430, 31: 1400, 30: 1370, 29: 1340,
        28: 1310, 27: 1280, 26: 1240, 25: 1210, 24: 1180, 23: 1140, 22: 1110, 21: 1080,
        20: 1040, 19: 1010, 18: 970, 17: 930, 16: 890, 15: 850, 14: 800, 13: 750,
        12: 710, 11: 670, 10: 630, 9: 590,
      };
      const sat = satMap[act] ?? 1000;
      const pctEst = act >= 34 ? '99th' : act >= 30 ? '93rd–94th' : act >= 26 ? '82nd' : act >= 21 ? '59th' : '<50th';
      return {
        primaryValue: sat,
        primaryUnit: 'SAT Total',
        primaryLabel: `Equivalent SAT Score (for ACT ${act})`,
        secondaryOutputs: [
          { label: 'National Percentile Band (Approx)', value: `${pctEst} percentile` },
          { label: 'SAT Range Midpoint Tier', value: `${sat - 20} – ${Math.min(1600, sat + 20)}` },
        ],
        steps: [`ACT ${act} concords to SAT ${sat} per official ACT/College Board concordance tables.`],
      };
    },
  },

  // 751. Carnegie Credit Hour Study Load Planner
  {
    slug: 'study-hours-credit-load-calculator',
    title: 'College Credit Hour Weekly Study Workload Calculator',
    category: 'education',
    formulaDisplay: 'Carnegie Standard: 1 Credit = 1h Class + 2–3h Outside Study/Week',
    inputs: [
      { id: 'creditHours', label: 'Enrolled Semester Credit Hours', type: 'number', defaultValue: 15, min: 1, max: 30, step: 1 },
      { id: 'studyRatio', label: 'Outside Study Hours per Credit (2 = Avg, 3 = STEM)', type: 'number', defaultValue: 2.5, min: 1, max: 5, step: 0.5 },
      { id: 'partTimeWorkHours', label: 'Weekly Part-Time Job Hours', type: 'number', defaultValue: 10, min: 0, max: 60, step: 2 },
    ],
    calculate: (v) => {
      const [cr, ratio, job] = [v.creditHours, v.studyRatio, v.partTimeWorkHours].map(parseNum);
      if ([cr, ratio, job].some(Number.isNaN) || cr <= 0 || ratio <= 0 || job < 0) return calcError('Credits and study ratio must be positive.');
      const classHrs = cr;
      const studyHrs = cr * ratio;
      const academicTotal = classHrs + studyHrs;
      const combinedCommit = academicTotal + job;
      return {
        primaryValue: fmt(academicTotal, 1),
        primaryUnit: 'hrs / week',
        primaryLabel: 'Total Weekly Academic Commitment',
        secondaryOutputs: [
          { label: 'Recommended Outside Study Hours', value: `${fmt(studyHrs, 1)} hrs/wk` },
          { label: 'Combined School + Work Hours', value: `${fmt(combinedCommit, 1)} hrs/wk` },
        ],
        steps: [`${cr}h lecture + (${cr}×${ratio}=${fmt(studyHrs, 1)}h study) = ${fmt(academicTotal, 1)} hrs/wk.`],
      };
    },
  },

  // 752. Spaced Repetition Flashcard Pace Planner
  {
    slug: 'flashcard-spaced-repetition-pace-calculator',
    title: 'Anki & Spaced-Repetition Flashcard Deck Pace Calculator',
    category: 'education',
    formulaDisplay: 'New Cards/Day = ceil(Total Deck / Target Days)',
    inputs: [
      { id: 'totalCards', label: 'Total Unseen Cards in Deck', type: 'number', defaultValue: 1800, min: 1, max: 500000, step: 50 },
      { id: 'daysAvailable', label: 'Days Until Exam (Excl. Final Review Buffer)', type: 'number', defaultValue: 45, min: 1, max: 1000, step: 1 },
      { id: 'secondsPerCard', label: 'Average Time Per Review Card', type: 'number', unit: 'sec', defaultValue: 12, min: 2, max: 120, step: 2 },
    ],
    calculate: (v) => {
      const [cards, days, sec] = [v.totalCards, v.daysAvailable, v.secondsPerCard].map(parseNum);
      if ([cards, days, sec].some(Number.isNaN) || cards < 1 || days < 1 || sec <= 0) return calcError('Enter positive card count, days, and review speed.');
      const newPerDay = Math.ceil(cards / days);
      const steadyReviewsPerDay = Math.round(newPerDay * 5.5); // Typical Anki mature/learning steady ratio ~5.5x new
      const estDailyMinutes = ((newPerDay + steadyReviewsPerDay) * sec) / 60;
      return {
        primaryValue: newPerDay,
        primaryUnit: 'new cards / day',
        primaryLabel: 'Required New Card Daily Quota',
        secondaryOutputs: [
          { label: 'Est. Peak Daily Reviews (~5.5× New)', value: `${steadyReviewsPerDay} reviews/day` },
          { label: 'Est. Daily Study Time at Peak', value: `${Math.round(estDailyMinutes)} min/day` },
        ],
        steps: [`${cards} cards ÷ ${days} days = ${newPerDay} new cards/day (~${Math.round(estDailyMinutes)} min/day at steady state).`],
      };
    },
  },

  // 753. Typing WPM & Net Speed Calculator
  {
    slug: 'typing-wpm-accuracy-net-speed-calculator',
    title: 'Gross WPM, Net WPM & Typing Accuracy Calculator',
    category: 'education',
    formulaDisplay: 'Gross WPM = (Characters / 5) / Minutes   |   Net WPM = Gross − (Errors / Minutes)',
    inputs: [
      { id: 'charactersTyped', label: 'Total Keystrokes / Characters Typed', type: 'number', defaultValue: 1650, min: 1, max: 1e7, step: 25 },
      { id: 'uncorrectedErrors', label: 'Uncorrected Word Errors', type: 'number', defaultValue: 8, min: 0, max: 100000, step: 1 },
      { id: 'minutes', label: 'Test Duration', type: 'number', unit: 'min', defaultValue: 5, min: 0.1, max: 600, step: 0.5 },
    ],
    calculate: (v) => {
      const [chars, errs, mins] = [v.charactersTyped, v.uncorrectedErrors, v.minutes].map(parseNum);
      if ([chars, errs, mins].some(Number.isNaN) || chars < 1 || errs < 0 || mins <= 0) return calcError('Enter positive characters and test duration.');
      const words = chars / 5;
      const grossWpm = words / mins;
      const netWpm = Math.max(0, grossWpm - errs / mins);
      const accuracy = words > 0 ? Math.max(0, ((words - errs) / words) * 100) : 0;
      return {
        primaryValue: fmt(netWpm, 1),
        primaryUnit: 'Net WPM',
        primaryLabel: 'Net Adjusted Typing Speed',
        secondaryOutputs: [
          { label: 'Gross WPM (5 chars = 1 word)', value: fmt(grossWpm, 1) },
          { label: 'Typing Accuracy', value: `${fmt(accuracy, 1)}%` },
        ],
        steps: [`(${chars}/5)/${mins} = ${fmt(grossWpm, 1)} Gross WPM − ${fmt(errs / mins, 1)} penalty = ${fmt(netWpm, 1)} Net WPM.`],
      };
    },
  },

  // 754. Flesch-Kincaid Readability Calculator
  {
    slug: 'readability-flesch-kincaid-grade-calculator',
    title: 'Flesch Reading Ease & Flesch-Kincaid Grade Level Calculator',
    category: 'education',
    formulaDisplay: 'FRE = 206.835 − 1.015(W/S) − 84.6(Syl/W)',
    inputs: [
      { id: 'totalWords', label: 'Total Words (W)', type: 'number', defaultValue: 500, min: 1, max: 1e7, step: 25 },
      { id: 'totalSentences', label: 'Total Sentences (S)', type: 'number', defaultValue: 28, min: 1, max: 1e6, step: 1 },
      { id: 'totalSyllables', label: 'Total Syllables (Syl)', type: 'number', defaultValue: 740, min: 1, max: 1e8, step: 25 },
    ],
    calculate: (v) => {
      const [w, s, syl] = [v.totalWords, v.totalSentences, v.totalSyllables].map(parseNum);
      if ([w, s, syl].some(Number.isNaN) || w < 1 || s < 1 || syl < 1) return calcError('Word, sentence, and syllable counts must be positive.');
      const wps = w / s;
      const spw = syl / w;
      const fre = 206.835 - 1.015 * wps - 84.6 * spw;
      const fkGrade = 0.39 * wps + 11.8 * spw - 15.59;
      return {
        primaryValue: fmt(fkGrade, 1),
        primaryUnit: 'US Grade Level',
        primaryLabel: 'Flesch-Kincaid Grade Level',
        secondaryOutputs: [
          { label: 'Flesch Reading Ease (0–100)', value: fmt(fre, 1) },
          { label: 'Avg Words/Sentence & Syllables/Word', value: `${fmt(wps, 1)} w/s · ${fmt(spw, 2)} syl/w` },
        ],
        steps: [`FK Grade = 0.39(${fmt(wps, 2)}) + 11.8(${fmt(spw, 2)}) − 15.59 = ${fmt(fkGrade, 1)}; Reading Ease = ${fmt(fre, 1)}.`],
      };
    },
  },

  // 755. Essay Page Count to Word Count Estimator
  {
    slug: 'essay-page-count-word-estimator',
    title: 'Essay Page Count to Word Count Estimator',
    category: 'education',
    formulaDisplay: 'Words/Page ≈ 250–275 (Double-Spaced 12pt) | 500–550 (Single-Spaced)',
    inputs: [
      { id: 'wordCount', label: 'Essay Word Count', type: 'number', defaultValue: 2500, min: 50, max: 500000, step: 100 },
      {
        id: 'spacing',
        label: 'Line Spacing & Font (12pt Times / Arial)',
        type: 'select',
        defaultValue: '250',
        options: [
          { label: 'Double-Spaced 12pt Times (~250 words/page)', value: '250' },
          { label: '1.5-Spaced 12pt (~350 words/page)', value: '350' },
          { label: 'Single-Spaced 12pt (~500 words/page)', value: '500' },
        ],
      },
    ],
    calculate: (v) => {
      const words = parseNum(v.wordCount);
      const wpp = parseNum(v.spacing || 250);
      if (Number.isNaN(words) || words <= 0 || Number.isNaN(wpp) || wpp <= 0) return calcError('Word count must be positive.');
      const pages = words / wpp;
      return {
        primaryValue: fmt(pages, 1),
        primaryUnit: 'pages',
        primaryLabel: 'Estimated Formatted Page Count',
        secondaryOutputs: [
          { label: 'Rounded Double-Spaced Sheets', value: Math.ceil(words / 250) },
          { label: 'Est. Oral Reading Time (@135 wpm)', value: `${Math.ceil(words / 135)} min` },
        ],
        steps: [`${words} words ÷ ${wpp} words/page = ${fmt(pages, 1)} pages.`],
      };
    },
  },

  // 756. Presentation Speech Word Count to Minutes
  {
    slug: 'citation-density-speech-duration-calculator',
    title: 'Speech & Presentation Duration Calculator (Word Count to Minutes)',
    category: 'education',
    formulaDisplay: 'Minutes = Total Script Words / Speaking Rate (WPM)',
    inputs: [
      { id: 'scriptWords', label: 'Speech Script Word Count', type: 'number', defaultValue: 1300, min: 10, max: 100000, step: 50 },
      {
        id: 'paceWpm',
        label: 'Delivery Pace',
        type: 'select',
        defaultValue: '130',
        options: [
          { label: 'Slow / Formal Keynote (110 WPM)', value: '110' },
          { label: 'Conversational Presentation (130 WPM)', value: '130' },
          { label: 'Brisk / TED-Style (155 WPM)', value: '155' },
        ],
      },
    ],
    calculate: (v) => {
      const words = parseNum(v.scriptWords);
      const wpm = parseNum(v.paceWpm || 130);
      if (Number.isNaN(words) || Number.isNaN(wpm) || words <= 0 || wpm <= 0) return calcError('Enter positive word count.');
      const totSec = (words / wpm) * 60;
      const mins = Math.floor(totSec / 60);
      const secs = Math.round(totSec % 60);
      return {
        primaryValue: `${mins}m ${String(secs).padStart(2, '0')}s`,
        primaryUnit: `@ ${wpm} WPM`,
        primaryLabel: 'Estimated Speaking Runtime',
        secondaryOutputs: [
          { label: 'Decimal Minutes', value: fmt(words / wpm, 2) },
          { label: 'Target Words for 5-Min Pitch', value: 5 * wpm },
        ],
        steps: [`${words} words ÷ ${wpm} WPM = ${fmt(words / wpm, 2)} min (${mins}m ${secs}s).`],
      };
    },
  },

  // 757. School Attendance Rate & Allowed Absences
  {
    slug: 'attendance-rate-classes-remaining-calculator',
    title: 'Class Attendance Percentage & Allowed Absences Calculator',
    category: 'education',
    formulaDisplay: 'Attendance % = Attended / Held So Far   |   Max Absences = floor(Total × (1 − Target%))',
    inputs: [
      { id: 'totalSessions', label: 'Total Semester Classes', type: 'number', defaultValue: 42, min: 1, max: 500, step: 1 },
      { id: 'heldSoFar', label: 'Classes Held So Far', type: 'number', defaultValue: 28, min: 1, max: 500, step: 1 },
      { id: 'missedSoFar', label: 'Classes Missed So Far', type: 'number', defaultValue: 3, min: 0, max: 500, step: 1 },
      { id: 'minRequiredPct', label: 'Minimum Attendance Policy %', type: 'number', unit: '%', defaultValue: 85, min: 1, max: 100, step: 1 },
    ],
    calculate: (v) => {
      const [tot, held, missed, req] = [v.totalSessions, v.heldSoFar, v.missedSoFar, v.minRequiredPct].map(parseNum);
      if ([tot, held, missed, req].some(Number.isNaN) || tot < 1 || held < 1 || held > tot || missed < 0 || missed > held) {
        return calcError('Held classes must be <= total sessions and missed <= held.');
      }
      const curRate = ((held - missed) / held) * 100;
      const maxAllowedAbsences = Math.floor(tot * (1 - req / 100));
      const absencesLeft = maxAllowedAbsences - missed;
      const maxPossibleFinal = ((tot - missed) / tot) * 100;
      return {
        primaryValue: fmt(curRate, 1),
        primaryUnit: '%',
        primaryLabel: 'Current Attendance Rate',
        secondaryOutputs: [
          { label: `Safe Absences Remaining (for ${req}%)`, value: absencesLeft >= 0 ? `${absencesLeft} classes` : `Exceeds policy by ${-absencesLeft}` },
          { label: 'Max Possible Final Attendance', value: `${fmt(maxPossibleFinal, 1)}%` },
        ],
        steps: [`Attended ${held - missed}/${held} = ${fmt(curRate, 1)}%; Policy allows max ${maxAllowedAbsences} total absences (${absencesLeft} left).`],
      };
    },
  },

  // 758. Cost Per College Credit & Class Session
  {
    slug: 'cost-per-college-credit-class-calculator',
    title: 'Tuition Cost Per College Credit & Per Lecture Session Calculator',
    category: 'education',
    formulaDisplay: 'Cost/Session = Course Tuition / Total Scheduled Meetings',
    inputs: [
      { id: 'semesterTuition', label: 'Net Semester Tuition (After Grants)', type: 'number', prefix: '$', defaultValue: 6400, min: 0, max: 200000, step: 100 },
      { id: 'credits', label: 'Enrolled Credits', type: 'number', defaultValue: 15, min: 1, max: 30, step: 1 },
      { id: 'weeks', label: 'Instruction Weeks / Semester', type: 'number', defaultValue: 15, min: 1, max: 52, step: 1 },
    ],
    calculate: (v) => {
      const [tuit, cr, wks] = [v.semesterTuition, v.credits, v.weeks].map(parseNum);
      if ([tuit, cr, wks].some(Number.isNaN) || tuit < 0 || cr <= 0 || wks <= 0) return calcError('Enter positive credits and weeks.');
      const perCredit = tuit / cr;
      const perThreeCreditCourse = perCredit * 3;
      const perClassHour = tuit / (cr * wks);
      return {
        primaryValue: fmt(perCredit, 2),
        primaryUnit: '$ / credit',
        primaryLabel: 'Net Tuition Per Credit Hour',
        secondaryOutputs: [
          { label: 'Cost of a 3-Credit Course', value: `$${fmt(perThreeCreditCourse, 2)}` },
          { label: 'Cost Per 50-Min Class Hour', value: `$${fmt(perClassHour, 2)}` },
        ],
        steps: [`$${tuit} ÷ ${cr} credits = $${fmt(perCredit, 2)}/credit ($${fmt(perClassHour, 2)} per lecture hour).`],
      };
    },
  },

  // 759. Student Degree ROI & Payback Calculator
  {
    slug: 'student-scholarship-roi-payback-calculator',
    title: 'College Degree & Graduate School ROI Payback Calculator',
    category: 'education',
    formulaDisplay: 'Payback Years = Total Cost (Tuition + Opportunity) / Annual Post-Tax Earnings Lift',
    inputs: [
      { id: 'totalOutOfPocket', label: 'Total Degree Tuition + Fees Paid', type: 'number', prefix: '$', defaultValue: 55000, min: 0, max: 1e7, step: 2500 },
      { id: 'foregoneIncome', label: 'Net Foregone Salary While Studying', type: 'number', prefix: '$', defaultValue: 25000, min: 0, max: 1e7, step: 2500 },
      { id: 'annualSalaryBoost', label: 'Expected Net Annual After-Tax Earnings Boost', type: 'number', prefix: '$', defaultValue: 16000, min: 100, max: 1e7, step: 1000 },
      { id: 'careerYears', label: 'Post-Graduation Working Years', type: 'number', unit: 'years', defaultValue: 30, min: 1, max: 50, step: 1 },
    ],
    calculate: (v) => {
      const [tuition, opp, boost, yrs] = [v.totalOutOfPocket, v.foregoneIncome, v.annualSalaryBoost, v.careerYears].map(parseNum);
      if ([tuition, opp, boost, yrs].some(Number.isNaN) || boost <= 0 || yrs <= 0) return calcError('Annual earnings boost and career years must be positive.');
      const totalCost = tuition + opp;
      const paybackYrs = totalCost / boost;
      const netLifetimeGain = boost * yrs - totalCost;
      const roiPct = totalCost > 0 ? (netLifetimeGain / totalCost) * 100 : 100;
      return {
        primaryValue: fmt(paybackYrs, 2),
        primaryUnit: 'years',
        primaryLabel: 'Breakeven Education Payback Time',
        secondaryOutputs: [
          { label: `${yrs}-Year Net Cumulative Gain`, value: `$${Math.round(netLifetimeGain).toLocaleString()}` },
          { label: 'Total Investment (Direct + Opportunity)', value: `$${Math.round(totalCost).toLocaleString()}` },
          { label: 'Simple Career ROI %', value: `${fmt(roiPct, 0)}%` },
        ],
        steps: [`Total cost $${totalCost.toLocaleString()} ÷ $${boost.toLocaleString()}/yr lift = ${fmt(paybackYrs, 2)} years payback.`],
      };
    },
  },

  // 760. Multiple-Choice Exam Guessing Expected Value
  {
    slug: 'multiple-choice-guessing-penalty-calculator',
    title: 'Multiple-Choice Exam Guessing Expected Value Calculator',
    category: 'education',
    formulaDisplay: 'E[Score] = (1 / Remaining Choices) × 1 − ((Choices − 1)/Choices) × Penalty',
    inputs: [
      { id: 'remainingChoices', label: 'Plausible Choices Left After Elimination', type: 'number', defaultValue: 3, min: 2, max: 10, step: 1 },
      { id: 'wrongPenalty', label: 'Wrong Answer Point Deduction (0 = No Penalty)', type: 'number', defaultValue: 0.25, min: 0, max: 2, step: 0.05 },
    ],
    calculate: (v) => {
      const k = Math.round(parseNum(v.remainingChoices));
      const pen = parseNum(v.wrongPenalty);
      if (Number.isNaN(k) || Number.isNaN(pen) || k < 2 || pen < 0) return calcError('Choices must be >= 2 and penalty non-negative.');
      const pCorrect = 1 / k;
      const ev = pCorrect * 1 - (1 - pCorrect) * pen;
      return {
        primaryValue: fmt(ev, 4),
        primaryUnit: 'pts / guess',
        primaryLabel: ev > 0 ? 'Statistically Advantageous to Guess' : ev === 0 ? 'Neutral Break-Even Guess' : 'Do Not Guess Randomly',
        secondaryOutputs: [
          { label: 'Probability of Guessing Correctly', value: `${fmt(pCorrect * 100, 1)}%` },
        ],
        steps: [`E[V] = (1/${k}) − (${k - 1}/${k})×${pen} = ${fmt(ev, 4)} pts.`],
      };
    },
  },

  // 761. Latin Honors Remaining GPA Target Calculator
  {
    slug: 'latin-honors-gpa-threshold-calculator',
    title: 'Latin Honors (Cum Laude) Remaining Credits GPA Calculator',
    category: 'education',
    formulaDisplay: 'Req Remaining GPA = (Target × Total − Current × Completed) / Remaining',
    inputs: [
      { id: 'currentGpa', label: 'Current GPA', type: 'number', defaultValue: 3.45, min: 0, max: 4.5, step: 0.05 },
      { id: 'completedCredits', label: 'Completed Credits', type: 'number', defaultValue: 90, min: 1, max: 300, step: 3 },
      { id: 'remainingCredits', label: 'Remaining Degree Credits', type: 'number', defaultValue: 30, min: 1, max: 200, step: 3 },
      { id: 'targetHonorsGpa', label: 'Target Honors GPA Cutoff (e.g., 3.50 / 3.70 / 3.90)', type: 'number', defaultValue: 3.60, min: 1, max: 4.0, step: 0.05 },
    ],
    calculate: (v) => {
      const [gCur, cComp, cRem, tgt] = [v.currentGpa, v.completedCredits, v.remainingCredits, v.targetHonorsGpa].map(parseNum);
      if ([gCur, cComp, cRem, tgt].some(Number.isNaN) || cComp <= 0 || cRem <= 0) return calcError('Completed and remaining credits must be positive.');
      const tot = cComp + cRem;
      const reqGpa = (tgt * tot - gCur * cComp) / cRem;
      const maxAchievable = (gCur * cComp + 4.0 * cRem) / tot;
      return {
        primaryValue: fmt(reqGpa, 3),
        primaryUnit: 'required GPA',
        primaryLabel: reqGpa <= 4.0 ? `Achievable With ${fmt(reqGpa, 2)} Average` : 'Exceeds 4.00 Max Scale',
        secondaryOutputs: [
          { label: 'Max Achievable Final GPA (All 4.0s)', value: fmt(maxAchievable, 3) },
        ],
        steps: [`Need ${fmt(reqGpa, 3)} across final ${cRem} credits to graduate at ${tgt} (4.0 cap = ${fmt(maxAchievable, 3)}).`],
      };
    },
  },

  // 762. Chemistry Lab Percent Yield Calculator
  {
    slug: 'lab-percent-yield-recovery-calculator',
    title: 'Chemistry Teaching Lab Theoretical & Percent Yield Calculator',
    category: 'education',
    formulaDisplay: '% Yield = (Actual Product Mass / Theoretical Yield) × 100%',
    inputs: [
      { id: 'actualYield', label: 'Actual Isolated Product Mass', type: 'number', unit: 'g', defaultValue: 18.4, min: 0, max: 1e7, step: 0.2 },
      { id: 'theoreticalYield', label: 'Stoichiometric Theoretical Yield', type: 'number', unit: 'g', defaultValue: 22.0, min: 0.001, max: 1e7, step: 0.2 },
    ],
    calculate: (v) => {
      const act = parseNum(v.actualYield);
      const theo = parseNum(v.theoreticalYield);
      if (Number.isNaN(act) || Number.isNaN(theo) || act < 0 || theo <= 0) return calcError('Theoretical yield must be positive.');
      const pct = (act / theo) * 100;
      return {
        primaryValue: fmt(pct, 2),
        primaryUnit: '% yield',
        primaryLabel: pct > 100 ? 'Over 100% (Check Residual Solvent/Impurity)' : 'Reaction Percent Yield',
        secondaryOutputs: [
          { label: 'Unrecovered Mass Loss', value: `${fmt(Math.max(0, theo - act), 3)} g` },
        ],
        steps: [`% Yield = (${act} ÷ ${theo}) × 100% = ${fmt(pct, 2)}%.`],
      };
    },
  },

  // 763. Weighted 5.0 Honors / AP / IB GPA Calculator
  {
    slug: 'grade-point-average-5-0-honors-calculator',
    title: 'Weighted 5.0 High School GPA (AP / IB / Honors) Calculator',
    category: 'education',
    formulaDisplay: 'Weighted GPA = Unweighted + (0.5×Honors_ratio + 1.0×AP_ratio)',
    inputs: [
      { id: 'unweightedGpa', label: 'Base Unweighted GPA (0–4.0)', type: 'number', defaultValue: 3.75, min: 0, max: 4.0, step: 0.05 },
      { id: 'regularCourses', label: 'Regular Courses Count', type: 'number', defaultValue: 12, min: 0, max: 100, step: 1 },
      { id: 'honorsCourses', label: 'Honors Courses (+0.5 Weight)', type: 'number', defaultValue: 6, min: 0, max: 100, step: 1 },
      { id: 'apIbCourses', label: 'AP / IB / Dual-Enrollment (+1.0 Weight)', type: 'number', defaultValue: 6, min: 0, max: 100, step: 1 },
    ],
    calculate: (v) => {
      const [uw, reg, hon, ap] = [v.unweightedGpa, v.regularCourses, v.honorsCourses, v.apIbCourses].map(parseNum);
      if ([uw, reg, hon, ap].some(Number.isNaN) || uw < 0 || uw > 4 || reg < 0 || hon < 0 || ap < 0 || reg + hon + ap <= 0) {
        return calcError('Total courses must be positive and unweighted GPA 0–4.0.');
      }
      const tot = reg + hon + ap;
      const bump = (hon * 0.5 + ap * 1.0) / tot;
      const weighted = uw + bump;
      return {
        primaryValue: fmt(weighted, 3),
        primaryUnit: 'Weighted GPA',
        primaryLabel: '5.0-Scale Weighted High School GPA',
        secondaryOutputs: [
          { label: 'Course Rigor Weight Bump', value: `+${fmt(bump, 3)}` },
          { label: 'Total Transcript Courses', value: tot },
        ],
        steps: [`Unweighted ${uw} + Rigor Bump ((${hon}×0.5 + ${ap}×1.0)/${tot} = +${fmt(bump, 3)}) = ${fmt(weighted, 3)}.`],
      };
    },
  },

  // 764. Thesis & Book Daily Writing Quota Calculator
  {
    slug: 'dissertation-daily-writing-target-calculator',
    title: 'Thesis & Book Manuscript Daily Word Quota Calculator',
    category: 'education',
    formulaDisplay: 'Daily Target = Remaining Words / Writing Days',
    inputs: [
      { id: 'targetWords', label: 'Target Final Word Count', type: 'number', defaultValue: 50000, min: 500, max: 2e6, step: 1000 },
      { id: 'writtenWords', label: 'Words Already Drafted', type: 'number', defaultValue: 12000, min: 0, max: 2e6, step: 500 },
      { id: 'daysLeft', label: 'Writing Days Remaining', type: 'number', defaultValue: 60, min: 1, max: 2000, step: 1 },
      { id: 'restDaysPerWeek', label: 'Off-Days Per Week (0–3)', type: 'number', defaultValue: 1, min: 0, max: 3, step: 1 },
    ],
    calculate: (v) => {
      const [tgt, done, days, off] = [v.targetWords, v.writtenWords, v.daysLeft, v.restDaysPerWeek].map(parseNum);
      if ([tgt, done, days, off].some(Number.isNaN) || tgt <= 0 || done < 0 || days < 1 || off < 0 || off > 6) return calcError('Enter positive word target and deadline days.');
      const rem = Math.max(0, tgt - done);
      const activeDays = Math.max(1, Math.round(days * ((7 - off) / 7)));
      const perDay = Math.ceil(rem / activeDays);
      return {
        primaryValue: perDay,
        primaryUnit: 'words / writing day',
        primaryLabel: 'Daily Writing Quota',
        secondaryOutputs: [
          { label: 'Words Remaining', value: rem.toLocaleString() },
          { label: 'Active Writing Days', value: activeDays },
          { label: 'Completion Progress', value: `${fmt(Math.min(100, (done / tgt) * 100), 1)}%` },
        ],
        steps: [`${rem.toLocaleString()} words left ÷ ${activeDays} active days = ${perDay.toLocaleString()} words/day.`],
      };
    },
  },

  // 765. Exam Week Study Hours Allocator
  {
    slug: 'stem-semester-study-pomodoro-allocator',
    title: 'Finals Week Study Time Allocator Across 3 Courses',
    category: 'education',
    formulaDisplay: 'Course Hours = Total Hours × (Course Weight_i / Σ Weights)',
    inputs: [
      { id: 'totalStudyHours', label: 'Total Available Finals Study Hours', type: 'number', unit: 'hrs', defaultValue: 40, min: 1, max: 300, step: 2 },
      { id: 'w1', label: 'Course 1 Exam Difficulty/Weight (1–10)', type: 'number', defaultValue: 8, min: 1, max: 10, step: 1 },
      { id: 'w2', label: 'Course 2 Exam Difficulty/Weight (1–10)', type: 'number', defaultValue: 5, min: 1, max: 10, step: 1 },
      { id: 'w3', label: 'Course 3 Exam Difficulty/Weight (1–10)', type: 'number', defaultValue: 3, min: 1, max: 10, step: 1 },
    ],
    calculate: (v) => {
      const [tot, w1, w2, w3] = [v.totalStudyHours, v.w1, v.w2, v.w3].map(parseNum);
      if ([tot, w1, w2, w3].some(Number.isNaN) || tot <= 0 || w1 <= 0 || w2 <= 0 || w3 <= 0) return calcError('All course weights and study hours must be positive.');
      const sumW = w1 + w2 + w3;
      const h1 = (w1 / sumW) * tot;
      const h2 = (w2 / sumW) * tot;
      const h3 = (w3 / sumW) * tot;
      return {
        primaryValue: fmt(h1, 1),
        primaryUnit: 'hrs (Top Priority)',
        primaryLabel: 'Course 1 Allocated Study Hours',
        secondaryOutputs: [
          { label: 'Course 2 Allocated Hours', value: `${fmt(h2, 1)} hrs (${fmt((w2 / sumW) * 100, 0)}%)` },
          { label: 'Course 3 Allocated Hours', value: `${fmt(h3, 1)} hrs (${fmt((w3 / sumW) * 100, 0)}%)` },
        ],
        steps: [`Allocated ${tot}h proportionally across weights ${w1}:${w2}:${w3} → ${fmt(h1, 1)}h / ${fmt(h2, 1)}h / ${fmt(h3, 1)}h.`],
      };
    },
  },
];
