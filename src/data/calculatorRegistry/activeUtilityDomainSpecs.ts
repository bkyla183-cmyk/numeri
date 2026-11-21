import { CalculatorSpec } from './types';
import { parseNum, calcError, parseLocalDate } from './validation';
import { analyzeTextStats } from '../../utils/calculatorFormulas';

export const activeUtilityDomainSpecs: CalculatorSpec[] = [
  {
    slug: 'unit-converter',
    title: 'General Unit Converter (Length, Weight, Temperature)',
    category: 'unit-converters',
    formulaDisplay: 'Exact SI Definitions: 1 in = 0.0254 m | 1 lb = 0.45359237 kg',
    inputs: [
      {
        id: 'category',
        label: 'Measurement Category',
        type: 'select',
        defaultValue: 'length',
        options: [
          { label: 'Length / Distance', value: 'length' },
          { label: 'Weight / Mass', value: 'weight' },
          { label: 'Temperature (°C, °F, K)', value: 'temperature' },
        ],
      },
      { id: 'val', label: 'Value to Convert', defaultValue: 10, type: 'number', step: 'any' },
      {
        id: 'unit',
        label: 'From Unit',
        type: 'select',
        defaultValue: 'm',
        visibleWhen: (v) => !v.category || v.category === 'length' || v.category === 'invalid_option',
        options: [
          { label: 'Meters (m)', value: 'm' },
          { label: 'Feet (ft)', value: 'ft' },
          { label: 'Inches (in)', value: 'in' },
          { label: 'Kilometers (km)', value: 'km' },
          { label: 'Miles (mi)', value: 'mi' },
        ],
      },
      {
        id: 'weightUnit',
        label: 'From Mass Unit',
        type: 'select',
        defaultValue: 'kg',
        visibleWhen: (v) => v.category === 'weight',
        options: [
          { label: 'Kilograms (kg)', value: 'kg' },
          { label: 'Pounds (lb)', value: 'lb' },
          { label: 'Ounces (oz)', value: 'oz' },
          { label: 'Grams (g)', value: 'g' },
          { label: 'US Short Tons (ton)', value: 'ton_us' },
        ],
      },
      {
        id: 'tempUnit',
        label: 'From Temperature Scale',
        type: 'select',
        defaultValue: 'c',
        visibleWhen: (v) => v.category === 'temperature',
        options: [
          { label: 'Celsius (°C)', value: 'c' },
          { label: 'Fahrenheit (°F)', value: 'f' },
          { label: 'Kelvin (K)', value: 'k' },
        ],
      },
    ],
    calculate: (v) => {
      const cat = v.category === 'weight' || v.category === 'temperature' ? v.category : 'length';
      const val = parseNum(v.val);
      if (isNaN(val)) return calcError('Please enter a valid number to convert.');

      if (cat === 'temperature') {
        const tu = v.tempUnit === 'f' || v.tempUnit === 'k' ? v.tempUnit : 'c';
        let c: number;
        if (tu === 'c') c = val;
        else if (tu === 'f') c = ((val - 32) * 5) / 9;
        else c = val - 273.15;

        if (c < -273.15 - 1e-6) {
          return calcError('Temperature cannot fall below Absolute Zero (-273.15 °C / -459.67 °F / 0 K).');
        }
        const f = (c * 9) / 5 + 32;
        const k = c + 273.15;
        return {
          primaryValue: parseFloat((tu === 'f' ? c : f).toFixed(2)),
          primaryUnit: tu === 'f' ? '°C (Celsius)' : '°F (Fahrenheit)',
          primaryLabel: tu === 'f' ? 'Converted to Celsius' : 'Converted to Fahrenheit',
          secondaryOutputs: [
            { label: 'Celsius (°C)', value: `${c.toFixed(2)} °C` },
            { label: 'Fahrenheit (°F)', value: `${f.toFixed(2)} °F` },
            { label: 'Kelvin (K)', value: `${k.toFixed(2)} K` },
          ],
          steps: [`Converted ${val} ${tu.toUpperCase()} across thermodynamic Celsius/Fahrenheit/Kelvin scales.`],
          formulaUsed: '°F = °C × 9/5 + 32 | K = °C + 273.15',
        };
      }

      if (cat === 'weight') {
        if (val < 0) return calcError('Mass value must be non-negative.');
        const wu = v.weightUnit || 'kg';
        const toKg: Record<string, number> = { kg: 1, g: 0.001, lb: 0.45359237, oz: 0.028349523125, ton_us: 907.18474 };
        const kg = val * (toKg[wu] || 1);
        return {
          primaryValue: parseFloat((kg / 0.45359237).toFixed(4)),
          primaryUnit: 'Pounds (lb)',
          primaryLabel: 'Converted to Pounds',
          secondaryOutputs: [
            { label: 'Kilograms', value: `${parseFloat(kg.toFixed(4))} kg` },
            { label: 'Grams', value: `${parseFloat((kg * 1000).toFixed(2))} g` },
            { label: 'Ounces', value: `${parseFloat((kg / 0.028349523125).toFixed(2))} oz` },
            { label: 'US Short Tons', value: `${parseFloat((kg / 907.18474).toFixed(5))} tons` },
          ],
          steps: [`Normalized ${val} ${wu} using exact avoirdupois pound (1 lb = 0.45359237 kg).`],
          formulaUsed: 'SI Mass Normalization',
        };
      }

      if (val < 0) return calcError('Length value must be a non-negative number.');
      const u = v.unit || 'm';
      const toMeters: Record<string, number> = { m: 1, ft: 0.3048, in: 0.0254, km: 1000, mi: 1609.344 };
      const m = val * (toMeters[u] || 1);
      return {
        primaryValue: parseFloat((m / 0.3048).toFixed(4)),
        primaryUnit: 'Feet (ft)',
        primaryLabel: 'Converted to Feet',
        secondaryOutputs: [
          { label: 'Meters', value: parseFloat(m.toFixed(4)) + ' m' },
          { label: 'Inches', value: parseFloat((m / 0.0254).toFixed(2)) + ' in' },
          { label: 'Kilometers', value: parseFloat((m / 1000).toFixed(6)) + ' km' },
          { label: 'Miles', value: parseFloat((m / 1609.344).toFixed(6)) + ' mi' },
        ],
        steps: [`Converted ${val} ${u} through exact international yard/pound SI definition (1 in = 0.0254 m).`],
        formulaUsed: 'SI Length Normalization',
      };
    },
  },
  {
    slug: 'energy-converter',
    title: 'Energy (Joules, Calories, kWh, BTU) Converter',
    category: 'unit-converters',
    formulaDisplay: '1 kWh = 3.6 × 10⁶ Joules = 3412.14 BTU = 860.42 kcal',
    inputs: [
      { id: 'val', label: 'Energy Amount', defaultValue: 1, type: 'number', min: 0, step: 'any' },
      {
        id: 'unit',
        label: 'From Unit',
        type: 'select',
        defaultValue: 'kwh',
        options: [
          { label: 'Kilowatt-Hours (kWh)', value: 'kwh' },
          { label: 'Watt-Hours (Wh)', value: 'wh' },
          { label: 'Joules (J)', value: 'j' },
          { label: 'Kilojoules (kJ)', value: 'kj' },
          { label: 'Megajoules (MJ)', value: 'mj' },
          { label: 'Kilocalories (Food kcal)', value: 'kcal' },
          { label: 'Small Calories (cal)', value: 'cal' },
          { label: 'British Thermal Units (BTU)', value: 'btu' },
        ],
      },
    ],
    calculate: (v) => {
      const val = parseNum(v.val);
      if (isNaN(val) || val < 0) return calcError('Energy amount must be a non-negative number.');
      const u = v.unit || 'kwh';
      const toJoules: Record<string, number> = {
        j: 1,
        kj: 1000,
        mj: 1e6,
        wh: 3600,
        kwh: 3.6e6,
        cal: 4.184,
        kcal: 4184,
        btu: 1055.05585,
      };
      const j = val * (toJoules[u] || 1);
      const kwh = j / 3.6e6;
      const wh = j / 3600;
      const btu = j / 1055.05585;
      const kcal = j / 4184;
      return {
        primaryValue: parseFloat(kwh.toFixed(6)),
        primaryUnit: 'kWh',
        primaryLabel: 'Kilowatt-Hours',
        secondaryOutputs: [
          { label: 'Joules (J) / kJ / MJ', value: `${j.toExponential(4)} J | ${(j / 1000).toFixed(2)} kJ | ${(j / 1e6).toFixed(4)} MJ` },
          { label: 'Watt-Hours (Wh)', value: parseFloat(wh.toFixed(2)) + ' Wh' },
          { label: 'BTUs', value: parseFloat(btu.toFixed(2)) + ' BTU' },
          { label: 'Food Kilocalories (kcal)', value: parseFloat(kcal.toFixed(2)) + ' kcal' },
        ],
        steps: [`${val} ${u} = ${j.toLocaleString()} Joules`],
        formulaUsed: 'Thermodynamic Energy Equivalence',
      };
    },
  },
  {
    slug: 'fuel-economy-converter',
    title: 'Fuel Economy (MPG ↔ L/100km ↔ km/L) Converter',
    category: 'unit-converters',
    formulaDisplay: 'L/100km = 235.214583 / MPG (US)',
    inputs: [
      {
        id: 'fromUnit',
        label: 'Input Economy Scale',
        type: 'select',
        defaultValue: 'mpg_us',
        options: [
          { label: 'US Miles per Gallon (MPG US)', value: 'mpg_us' },
          { label: 'UK Imperial MPG (MPG UK)', value: 'mpg_uk' },
          { label: 'Liters per 100 km (L/100km)', value: 'l_100km' },
          { label: 'Kilometers per Liter (km/L)', value: 'km_l' },
        ],
      },
      { id: 'val', label: 'Fuel Economy Value', defaultValue: 30, type: 'number', min: 0.1, step: 0.5 },
    ],
    calculate: (v) => {
      const rawVal = parseNum(v.val !== undefined ? v.val : v.mpg);
      if (isNaN(rawVal) || rawVal <= 0) return calcError('Fuel economy value must be greater than zero.');
      const unit = v.fromUnit === 'mpg_uk' || v.fromUnit === 'l_100km' || v.fromUnit === 'km_l' ? v.fromUnit : 'mpg_us';

      let usMpg: number;
      if (unit === 'mpg_us') usMpg = rawVal;
      else if (unit === 'mpg_uk') usMpg = rawVal / 1.20095;
      else if (unit === 'l_100km') usMpg = 235.214583 / rawVal;
      else usMpg = rawVal / 0.425144;

      const l100 = 235.214583 / usMpg;
      const imperialMpg = usMpg * 1.20095;
      const kmPerL = usMpg * 0.425144;

      const primary = unit === 'l_100km' ? usMpg : l100;
      return {
        primaryValue: parseFloat(primary.toFixed(2)),
        primaryUnit: unit === 'l_100km' ? 'MPG (US)' : 'L / 100km',
        primaryLabel: unit === 'l_100km' ? 'US Miles per Gallon' : 'Liters per 100 km',
        secondaryOutputs: [
          { label: 'US MPG', value: `${usMpg.toFixed(2)} MPG (US)` },
          { label: 'UK Imperial MPG', value: `${imperialMpg.toFixed(1)} MPG (UK)` },
          { label: 'Kilometers per Liter', value: `${kmPerL.toFixed(2)} km/L` },
          { label: 'Liters per 100 km', value: `${l100.toFixed(2)} L/100km` },
        ],
        steps: [`Normalized ${rawVal} (${unit}) → ${usMpg.toFixed(2)} US MPG = ${l100.toFixed(2)} L/100km`],
        formulaUsed: 'L/100km = 235.215 / MPG (US)',
      };
    },
  },
  {
    slug: 'data-storage-converter',
    title: 'Digital Data Storage (Bits, Bytes, KB–PB) Converter',
    category: 'unit-converters',
    formulaDisplay: 'IEC Binary (1024) vs SI Decimal (1000) Scaling',
    inputs: [
      { id: 'val', label: 'Data Value', defaultValue: 100, type: 'number', min: 0, step: 'any' },
      {
        id: 'unit',
        label: 'From Unit',
        type: 'select',
        defaultValue: 'gb',
        options: [
          { label: 'Bits (b)', value: 'bit' },
          { label: 'Bytes (B)', value: 'byte' },
          { label: 'Kilobytes (KB / KiB)', value: 'kb' },
          { label: 'Megabytes (MB / MiB)', value: 'mb' },
          { label: 'Gigabytes (GB / GiB)', value: 'gb' },
          { label: 'Terabytes (TB / TiB)', value: 'tb' },
          { label: 'Petabytes (PB / PiB)', value: 'pb' },
        ],
      },
      {
        id: 'standard',
        label: 'Prefix Standard',
        type: 'select',
        defaultValue: '1024',
        advanced: true,
        options: [
          { label: 'Binary IEC (1024-basis: OS / RAM)', value: '1024' },
          { label: 'Decimal SI (1000-basis: SSD / Drives)', value: '1000' },
        ],
      },
    ],
    calculate: (v) => {
      const val = parseNum(v.val);
      if (isNaN(val) || val < 0) return calcError('Data value must be a non-negative number.');
      const base = v.standard === '1000' ? 1000 : 1024;
      const u = v.unit || 'gb';

      const toBytes: Record<string, number> = {
        bit: 1 / 8,
        byte: 1,
        kb: base,
        mb: base * base,
        gb: Math.pow(base, 3),
        tb: Math.pow(base, 4),
        pb: Math.pow(base, 5),
      };
      const bytes = val * (toBytes[u] || Math.pow(base, 3));
      const mb = bytes / Math.pow(base, 2);
      const gb = bytes / Math.pow(base, 3);
      const tb = bytes / Math.pow(base, 4);
      const pb = bytes / Math.pow(base, 5);
      const bits = bytes * 8;

      return {
        primaryValue: parseFloat(mb.toFixed(2)),
        primaryUnit: base === 1024 ? 'MB (MiB)' : 'MB (SI)',
        primaryLabel: `Megabytes (${base}-Basis)`,
        secondaryOutputs: [
          { label: 'Gigabytes', value: `${parseFloat(gb.toFixed(4))} ${base === 1024 ? 'GiB' : 'GB'}` },
          { label: 'Terabytes / Petabytes', value: `${tb.toFixed(6)} TB | ${pb.toExponential(3)} PB` },
          { label: 'Bytes / Bits', value: `${Math.round(bytes).toLocaleString()} B | ${Math.round(bits).toLocaleString()} bits` },
        ],
        steps: [`Converted ${val} ${u} using ${base === 1024 ? 'binary 1,024' : 'decimal 1,000'} byte scaling.`],
        formulaUsed: `${base}-Basis Digital Storage Scaling`,
      };
    },
  },
  {
    slug: 'cooking-volume-converter',
    title: 'Kitchen Cooking Volume Converter',
    category: 'unit-converters',
    formulaDisplay: '1 US Cup = 16 Tbsp = 48 Tsp = 236.588 mL',
    inputs: [
      {
        id: 'fromUnit',
        label: 'From Culinary Unit',
        type: 'select',
        defaultValue: 'cups',
        options: [
          { label: 'US Cups', value: 'cups' },
          { label: 'Tablespoons (Tbsp)', value: 'tbsp' },
          { label: 'Teaspoons (Tsp)', value: 'tsp' },
          { label: 'Milliliters (mL)', value: 'ml' },
          { label: 'US Fluid Ounces (fl oz)', value: 'floz' },
          { label: 'Liters (L)', value: 'l' },
        ],
      },
      { id: 'val', label: 'Volume Amount', defaultValue: 1.5, type: 'number', min: 0, step: 0.25 },
    ],
    calculate: (v) => {
      const rawVal = parseNum(v.val !== undefined ? v.val : v.cups);
      if (isNaN(rawVal) || rawVal < 0) return calcError('Volume amount must be a non-negative number.');
      const unit = v.fromUnit || 'cups';
      const toCups: Record<string, number> = {
        cups: 1,
        tbsp: 1 / 16,
        tsp: 1 / 48,
        ml: 1 / 236.588,
        floz: 1 / 8,
        l: 1000 / 236.588,
      };
      const c = rawVal * (toCups[unit] || 1);
      const tbsp = c * 16;
      const tsp = c * 48;
      const ml = c * 236.588;
      const floz = c * 8;
      const primary = unit === 'tbsp' ? ml : tbsp;

      return {
        primaryValue: parseFloat(primary.toFixed(2)),
        primaryUnit: unit === 'tbsp' ? 'mL (Milliliters)' : 'Tablespoons',
        primaryLabel: unit === 'tbsp' ? 'Milliliters (mL)' : 'Tablespoons (Tbsp)',
        secondaryOutputs: [
          { label: 'US Cups', value: `${parseFloat(c.toFixed(3))} cups` },
          { label: 'Teaspoons (Tsp)', value: `${parseFloat(tsp.toFixed(2))} tsp` },
          { label: 'Milliliters (mL)', value: `${parseFloat(ml.toFixed(1))} mL` },
          { label: 'Fluid Ounces', value: `${parseFloat(floz.toFixed(2))} fl oz` },
        ],
        steps: [`${rawVal} ${unit} = ${c.toFixed(3)} US cups = ${tbsp.toFixed(1)} tbsp = ${ml.toFixed(1)} mL`],
        formulaUsed: 'US Culinary Volume Standards',
      };
    },
  },
  {
    slug: 'age-calculator',
    title: 'Exact Chronological Age Calculator',
    category: 'date-time',
    formulaDisplay: 'Exact difference in Years, Months, and Days',
    inputs: [
      { id: 'birthDate', label: 'Birthdate (YYYY-MM-DD)', defaultValue: '1995-06-15', type: 'date' },
      { id: 'asOfDate', label: 'Target "As-Of" Date (Optional)', defaultValue: '', type: 'date', advanced: true, helpText: 'Leave blank to measure as of today' },
    ],
    calculate: (v) => {
      const birth = parseLocalDate(v.birthDate || '1995-06-15');
      if (!birth) return calcError('Enter a valid birthdate in YYYY-MM-DD format.');

      let today: Date;
      const asOfRaw = String(v.asOfDate ?? '').trim();
      if (asOfRaw !== '') {
        const parsedAsOf = parseLocalDate(asOfRaw);
        if (!parsedAsOf) return calcError('Target "As-Of" date must be a valid YYYY-MM-DD date.');
        today = parsedAsOf;
      } else {
        const now = new Date();
        today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      }

      if (birth > today) return calcError('Birthdate cannot be after the target calculation date.');

      let years = today.getFullYear() - birth.getFullYear();
      let months = today.getMonth() - birth.getMonth();
      let days = today.getDate() - birth.getDate();

      if (days < 0) {
        months -= 1;
        const prevMonthDays = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
        days += prevMonthDays;
      }
      if (months < 0) {
        years -= 1;
        months += 12;
      }
      const totalDays = Math.round((today.getTime() - birth.getTime()) / 86400000);
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const bornDow = dayNames[birth.getDay()];

      let nextBday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
      if (nextBday <= today) {
        nextBday = new Date(today.getFullYear() + 1, birth.getMonth(), birth.getDate());
      }
      const daysUntilBday = Math.round((nextBday.getTime() - today.getTime()) / 86400000);

      return {
        primaryValue: `${years} Years, ${months} Months, ${days} Days`,
        primaryLabel: asOfRaw ? `Age on ${asOfRaw}` : 'Exact Age Today',
        secondaryOutputs: [
          { label: 'Total Days Lived', value: totalDays.toLocaleString() + ' days' },
          { label: 'Total Weeks Lived', value: Math.floor(totalDays / 7).toLocaleString() + ' weeks' },
          { label: 'Days Until Next Birthday', value: `${daysUntilBday} days` },
          { label: 'Day of Week Born', value: bornDow },
        ],
        steps: [`Exact elapsed Gregorian calendar horizon from ${v.birthDate} (${bornDow}) to ${asOfRaw || 'today'}.`],
        formulaUsed: 'Gregorian Chronological Difference',
      };
    },
  },
  {
    slug: 'days-between-dates-calculator',
    title: 'Days Between Two Dates Calculator',
    category: 'date-time',
    formulaDisplay: 'Δt = |Date 2 - Date 1| in Calendar & Weekday Days',
    inputs: [
      { id: 'date1', label: 'Start Date', defaultValue: '2024-01-01', type: 'date' },
      { id: 'date2', label: 'End Date', defaultValue: '2026-11-01', type: 'date' },
      {
        id: 'includeEndDate',
        label: 'Include End Date (+1 Day)?',
        type: 'select',
        defaultValue: 'no',
        advanced: true,
        options: [
          { label: 'No (Exclusive Difference)', value: 'no' },
          { label: 'Yes (Inclusive Span)', value: 'yes' },
        ],
      },
    ],
    calculate: (v) => {
      const d1 = parseLocalDate(v.date1 || '2024-01-01');
      const d2 = parseLocalDate(v.date2 || '2026-11-01');
      if (!d1 || !d2) return calcError('Please enter valid Start and End dates in YYYY-MM-DD format.');
      const start = d1 <= d2 ? d1 : d2;
      const end = d1 <= d2 ? d2 : d1;
      const utc1 = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
      const utc2 = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
      const inclusiveOffset = v.includeEndDate === 'yes' ? 1 : 0;
      const days = Math.round((utc2 - utc1) / 86400000) + inclusiveOffset;
      const weeks = (days / 7).toFixed(1);

      // O(1) weekday & weekend count across the exact span
      const fullWeeks = Math.floor(days / 7);
      const rem = days % 7;
      let weekdays = fullWeeks * 5;
      const startDow = start.getDay();
      for (let i = 0; i < rem; i++) {
        const dow = (startDow + i) % 7;
        if (dow !== 0 && dow !== 6) weekdays++;
      }
      const weekendDays = days - weekdays;

      // Exact Y/M/D span
      let yrs = end.getFullYear() - start.getFullYear();
      let mos = end.getMonth() - start.getMonth();
      let remDays = end.getDate() - start.getDate() + inclusiveOffset;
      if (remDays < 0) {
        mos -= 1;
        remDays += new Date(end.getFullYear(), end.getMonth(), 0).getDate();
      }
      if (mos < 0) {
        yrs -= 1;
        mos += 12;
      }

      return {
        primaryValue: days.toLocaleString(),
        primaryUnit: 'days',
        primaryLabel: inclusiveOffset ? 'Total Calendar Days (Inclusive)' : 'Total Calendar Days',
        secondaryOutputs: [
          { label: 'Calendar Breakdown', value: `${yrs}y ${mos}m ${remDays}d` },
          { label: 'In Weeks', value: `${weeks} weeks` },
          { label: 'Weekdays / Weekend Days', value: `${weekdays.toLocaleString()} weekdays / ${weekendDays.toLocaleString()} weekend days` },
        ],
        steps: [`Elapsed time: ${days} calendar days (${yrs}y ${mos}m ${remDays}d) between ${v.date1} and ${v.date2}`],
        formulaUsed: 'UTC Midnight Difference + Exact Gregorian Breakdown',
      };
    },
  },
  {
    slug: 'hours-calculator',
    title: 'Hours Between Two Clock Times Calculator',
    category: 'date-time',
    formulaDisplay: 'Hours = (End Time - Start Time - Unpaid Break)',
    inputs: [
      { id: 'start', label: 'Start Time (HH:MM)', defaultValue: '08:30', type: 'time' },
      { id: 'end', label: 'End Time (HH:MM)', defaultValue: '17:00', type: 'time' },
      { id: 'lunchMin', label: 'Unpaid Break (Minutes)', defaultValue: 45, type: 'number', min: 0, max: 720, step: 15, unit: 'min' },
      { id: 'hourlyRate', label: 'Hourly Pay Rate ($/hr, Optional)', defaultValue: 0, type: 'number', min: 0, step: 0.5, unit: '$', advanced: true },
    ],
    calculate: (v) => {
      const parseTime = (s: unknown): number | null => {
        if (typeof s !== 'string') return null;
        const m = s.trim().match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
        if (!m) return null;
        return Number(m[1]) * 60 + Number(m[2]);
      };
      const startMin = parseTime(v.start ?? '08:30');
      let endMin = parseTime(v.end ?? '17:00');
      const breakMin = parseNum(v.lunchMin);
      const rate = v.hourlyRate === undefined ? 0 : parseNum(v.hourlyRate);
      if (startMin === null || endMin === null) {
        return calcError('Enter valid 24-hour clock times in HH:MM format (e.g., 08:30 and 17:00).');
      }
      if (isNaN(breakMin) || breakMin < 0 || isNaN(rate) || rate < 0) {
        return calcError('Unpaid break duration and hourly pay rate cannot be negative.');
      }
      const isOvernight = endMin < startMin;
      if (isOvernight) endMin += 1440;
      const rawShift = endMin - startMin;
      if (breakMin > rawShift) return calcError('Unpaid break exceeds total shift length.');
      const totalMin = rawShift - breakMin;
      const hrs = totalMin / 60;
      const grossPay = hrs * rate;
      return {
        primaryValue: parseFloat(hrs.toFixed(2)),
        primaryUnit: 'hours',
        primaryLabel: 'Total Billable Hours',
        secondaryOutputs: [
          { label: 'Time in Hours & Minutes', value: `${Math.floor(totalMin / 60)} hrs ${Math.round(totalMin % 60)} mins` },
          { label: 'Shift Type', value: isOvernight ? 'Overnight (crosses midnight)' : 'Same Day' },
          ...(rate > 0 ? [{ label: 'Gross Shift Pay', value: `$${grossPay.toFixed(2)}` }] : []),
        ],
        steps: [`(${endMin} min - ${startMin} min) - ${breakMin} min break = ${totalMin} min = ${hrs.toFixed(2)} hrs`],
        formulaUsed: 'Timesheet Interval Calculation',
      };
    },
  },
  {
    slug: 'business-days-calculator',
    title: 'Business Working Days & Target Date Calculator',
    category: 'date-time',
    formulaDisplay: 'Working days excluding weekends & custom holidays',
    inputs: [
      {
        id: 'mode',
        label: 'Calculation Mode',
        type: 'select',
        defaultValue: 'count',
        options: [
          { label: 'Count Business Days Between Two Dates', value: 'count' },
          { label: 'Add / Subtract Business Days to Date', value: 'add_days' },
        ],
      },
      { id: 'startDate', label: 'Start Date', defaultValue: '2026-10-01', type: 'date' },
      {
        id: 'endDate',
        label: 'End Date',
        defaultValue: '2026-10-31',
        type: 'date',
        visibleWhen: (v) => !v.mode || v.mode === 'count' || v.mode === 'invalid_option',
      },
      {
        id: 'businessDaysToAdd',
        label: 'Business Days to Add (+ or -)',
        defaultValue: 10,
        type: 'number',
        step: 1,
        visibleWhen: (v) => v.mode === 'add_days',
      },
      {
        id: 'workweek',
        label: 'Workweek Schedule',
        type: 'select',
        defaultValue: 'mon_fri',
        advanced: true,
        options: [
          { label: 'Monday – Friday (Standard)', value: 'mon_fri' },
          { label: 'Sunday – Thursday (MENA / Custom)', value: 'sun_thu' },
        ],
      },
      {
        id: 'holidays',
        label: 'Custom Holidays (Comma YYYY-MM-DD)',
        defaultValue: '',
        type: 'text',
        advanced: true,
        placeholder: 'e.g., 2026-10-12, 2026-11-26',
        helpText: 'Optional comma-separated holiday dates excluded from working days',
      },
    ],
    calculate: (v) => {
      const start = parseLocalDate(v.startDate || '2026-10-01');
      if (!start) return calcError('Please enter a valid Start Date in YYYY-MM-DD format.');

      const isWeekend = (dow: number) =>
        v.workweek === 'sun_thu' ? dow === 5 || dow === 6 : dow === 0 || dow === 6;

      // Parse & validate optional holidays list
      const holidaySet = new Set<string>();
      const rawHols = String(v.holidays ?? '').trim();
      if (rawHols !== '') {
        const tokens = rawHols.split(/[\s,;]+/).filter(Boolean);
        for (const tok of tokens) {
          const parsed = parseLocalDate(tok);
          if (!parsed) {
            return calcError(`Invalid holiday date "${tok}". Use YYYY-MM-DD separated by commas.`);
          }
          const iso = `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
          holidaySet.add(iso);
        }
      }

      const fmtIso = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      if (v.mode === 'add_days') {
        const offsetRaw = parseNum(v.businessDaysToAdd);
        if (isNaN(offsetRaw)) return calcError('Enter a valid integer for business days to add or subtract.');
        const targetOffset = Math.round(offsetRaw);
        if (Math.abs(targetOffset) > 10000) {
          return calcError('Business day offset must be within ±10,000 working days.');
        }

        const dir = targetOffset >= 0 ? 1 : -1;
        let remaining = Math.abs(targetOffset);
        const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        let guard = 0;
        while (remaining > 0 && guard < 30000) {
          cur.setDate(cur.getDate() + dir);
          guard++;
          if (!isWeekend(cur.getDay()) && !holidaySet.has(fmtIso(cur))) {
            remaining--;
          }
        }
        const targetIso = fmtIso(cur);
        const calSpan = Math.round(Math.abs(cur.getTime() - start.getTime()) / 86400000);
        return {
          primaryValue: targetIso,
          primaryLabel: `Target Date (${targetOffset >= 0 ? '+' : ''}${targetOffset} Business Days)`,
          secondaryOutputs: [
            { label: 'Calendar Span', value: `${calSpan} calendar days` },
            { label: 'Workweek', value: v.workweek === 'sun_thu' ? 'Sun–Thu' : 'Mon–Fri' },
            { label: 'Holidays Excluded', value: `${holidaySet.size} specified` },
          ],
          steps: [`Started on ${v.startDate} and stepped ${targetOffset} working days (skipping weekends & holidays) to ${targetIso}.`],
          formulaUsed: 'Iterative Working-Day Date Projection',
        };
      }

      const end = parseLocalDate(v.endDate || '2026-10-31');
      if (!end) return calcError('Please enter valid Start and End dates in YYYY-MM-DD format.');
      if (start > end) return calcError('Start date must be on or before end date.');

      const utcStart = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
      const utcEnd = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
      const totalDaysInclusive = Math.round((utcEnd - utcStart) / 86400000) + 1;

      const fullWeeks = Math.floor(totalDaysInclusive / 7);
      const remainder = totalDaysInclusive % 7;
      let businessDays = fullWeeks * 5;
      const startDay = start.getDay();
      for (let i = 0; i < remainder; i++) {
        const dow = (startDay + i) % 7;
        if (!isWeekend(dow)) businessDays++;
      }

      let matchedHolidays = 0;
      for (const holIso of holidaySet) {
        const hd = parseLocalDate(holIso)!;
        const utcHd = Date.UTC(hd.getFullYear(), hd.getMonth(), hd.getDate());
        if (utcHd >= utcStart && utcHd <= utcEnd && !isWeekend(hd.getDay())) {
          matchedHolidays++;
        }
      }
      businessDays = Math.max(0, businessDays - matchedHolidays);

      return {
        primaryValue: businessDays,
        primaryUnit: 'Business Days',
        primaryLabel: 'Working Business Days',
        secondaryOutputs: [
          { label: 'Total Calendar Days (Inclusive)', value: totalDaysInclusive.toLocaleString() },
          { label: 'Working Hours (8 hr/day)', value: `${(businessDays * 8).toLocaleString()} hours` },
          { label: 'Holidays Deducted', value: `${matchedHolidays} weekdays` },
        ],
        steps: [
          `Counted ${fullWeeks} full weeks + ${remainder} remainder days under ${v.workweek === 'sun_thu' ? 'Sun–Thu' : 'Mon–Fri'} schedule.`,
          matchedHolidays > 0 ? `Subtracted ${matchedHolidays} weekday holidays = ${businessDays} net business days.` : `Net business days = ${businessDays}.`,
        ],
        formulaUsed: 'O(1) Workweek Day Count − Weekday Holidays',
      };
    },
  },
  {
    slug: 'time-zone-calculator',
    title: 'Time Zone & Meeting Offset Converter',
    category: 'date-time',
    formulaDisplay: 'Target Local = Source Time + (To UTC - From UTC)',
    inputs: [
      {
        id: 'mode',
        label: 'Conversion Mode',
        type: 'select',
        defaultValue: 'current',
        options: [
          { label: 'Current Live Clock at UTC Offset', value: 'current' },
          { label: 'Convert Specific Meeting Time Between Zones', value: 'convert_meeting' },
        ],
      },
      {
        id: 'hoursOffset',
        label: 'Offset from UTC (Hours, e.g. -5 EST, 0 GMT, +9 JST)',
        defaultValue: -5,
        type: 'number',
        min: -12,
        max: 14,
        step: 0.5,
        visibleWhen: (v) => !v.mode || v.mode === 'current' || v.mode === 'invalid_option',
      },
      {
        id: 'meetingTime',
        label: 'Source Meeting Time (HH:MM)',
        defaultValue: '09:00',
        type: 'time',
        visibleWhen: (v) => v.mode === 'convert_meeting',
      },
      {
        id: 'fromOffset',
        label: 'Source Zone UTC Offset (Hours)',
        defaultValue: -5,
        type: 'number',
        min: -12,
        max: 14,
        step: 0.5,
        visibleWhen: (v) => v.mode === 'convert_meeting',
      },
      {
        id: 'toOffset',
        label: 'Target Zone UTC Offset (Hours)',
        defaultValue: 1,
        type: 'number',
        min: -12,
        max: 14,
        step: 0.5,
        visibleWhen: (v) => v.mode === 'convert_meeting',
      },
    ],
    calculate: (v) => {
      if (v.mode === 'convert_meeting') {
        const m = String(v.meetingTime ?? '09:00').trim().match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
        if (!m) return calcError('Enter a valid 24-hour meeting time in HH:MM format.');
        const fromOff = parseNum(v.fromOffset);
        const toOff = parseNum(v.toOffset);
        if (isNaN(fromOff) || isNaN(toOff) || fromOff < -12 || fromOff > 14 || toOff < -12 || toOff > 14) {
          return calcError('Source and target UTC offsets must be between -12 and +14 hours.');
        }
        const srcMin = Number(m[1]) * 60 + Number(m[2]);
        const deltaMin = (toOff - fromOff) * 60;
        let dstMin = srcMin + deltaMin;
        let dayShift = 'Same day';
        if (dstMin >= 1440) {
          dstMin -= 1440;
          dayShift = '+1 day (Next Day)';
        } else if (dstMin < 0) {
          dstMin += 1440;
          dayShift = '-1 day (Previous Day)';
        }
        const hh = String(Math.floor(dstMin / 60)).padStart(2, '0');
        const mm = String(Math.round(dstMin % 60)).padStart(2, '0');
        return {
          primaryValue: `${hh}:${mm}`,
          primaryLabel: `Converted Time (UTC${toOff >= 0 ? '+' : ''}${toOff})`,
          secondaryOutputs: [
            { label: 'Calendar Day Shift', value: dayShift },
            { label: 'Time Difference', value: `${toOff - fromOff >= 0 ? '+' : ''}${toOff - fromOff} hours` },
          ],
          steps: [`Source ${v.meetingTime} (UTC${fromOff >= 0 ? '+' : ''}${fromOff}) + (${toOff - fromOff}h) = ${hh}:${mm} (${dayShift})`],
          formulaUsed: 'Cross-Timezone Meeting Shift',
        };
      }

      const off = parseNum(v.hoursOffset);
      if (isNaN(off) || off < -12 || off > 14) {
        return calcError('UTC offset must be between -12 and +14 hours.');
      }
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const targetTime = new Date(utc + 3600000 * off);
      const timeStr = targetTime.toTimeString().split(' ')[0];
      return {
        primaryValue: timeStr,
        primaryLabel: `Current Time at UTC${off >= 0 ? '+' : ''}${off}`,
        secondaryOutputs: [{ label: 'Date', value: targetTime.toDateString() }],
        steps: [`Converted current UTC timestamp by ${off >= 0 ? '+' : ''}${off} hours.`],
        formulaUsed: 'UTC Timezone Projection',
      };
    },
  },
  {
    slug: 'gpa-calculator',
    title: 'College GPA Calculator',
    description: 'Calculate semester or cumulative Grade Point Average (GPA) based on credit hours and grade points.',
    category: 'education',
    inputs: [
      { id: 'course1_credits', label: 'Course 1 Credits', type: 'number', defaultValue: 3, min: 0, max: 20, step: 0.5 },
      { id: 'course1_grade', label: 'Course 1 Grade Points (4.0 Scale)', type: 'number', defaultValue: 4.0, min: 0, max: 4.33, step: 0.1 },
      { id: 'course2_credits', label: 'Course 2 Credits', type: 'number', defaultValue: 4, min: 0, max: 20, step: 0.5 },
      { id: 'course2_grade', label: 'Course 2 Grade Points', type: 'number', defaultValue: 3.3, min: 0, max: 4.33, step: 0.1 },
      { id: 'course3_credits', label: 'Course 3 Credits', type: 'number', defaultValue: 3, min: 0, max: 20, step: 0.5 },
      { id: 'course3_grade', label: 'Course 3 Grade Points', type: 'number', defaultValue: 3.7, min: 0, max: 4.33, step: 0.1 },
      { id: 'prior_gpa', label: 'Prior Cumulative GPA (optional)', type: 'number', defaultValue: 3.4, min: 0, max: 4.33, step: 0.01 },
      { id: 'prior_credits', label: 'Prior Cumulative Credits', type: 'number', defaultValue: 30, min: 0, max: 300, step: 1 },
    ],
    calculate: (inputs) => {
      const c1 = parseNum(inputs.course1_credits);
      const g1 = parseNum(inputs.course1_grade);
      const c2 = parseNum(inputs.course2_credits);
      const g2 = parseNum(inputs.course2_grade);
      const c3 = parseNum(inputs.course3_credits);
      const g3 = parseNum(inputs.course3_grade);
      const priorGpa = parseNum(inputs.prior_gpa);
      const priorCredits = parseNum(inputs.prior_credits);
      if ([c1, g1, c2, g2, c3, g3, priorGpa, priorCredits].some(isNaN)) {
        return calcError('Please enter valid numeric credits and grade points.');
      }
      if ([c1, g1, c2, g2, c3, g3, priorGpa, priorCredits].some((x) => x < 0)) {
        return calcError('Credits and grade points cannot be negative.');
      }
      const semCredits = c1 + c2 + c3;
      const semPoints = c1 * g1 + c2 * g2 + c3 * g3;
      const totalCredits = priorCredits + semCredits;
      if (totalCredits <= 0) return calcError('Total credit hours must be greater than zero.');
      const semGpa = semCredits > 0 ? semPoints / semCredits : 0;
      const totalPoints = priorGpa * priorCredits + semPoints;
      const cumGpa = totalPoints / totalCredits;
      return {
        primaryOutput: parseFloat(cumGpa.toFixed(2)),
        primaryUnit: 'Cumulative GPA',
        secondaryOutputs: [
          { label: 'Semester GPA', value: parseFloat(semGpa.toFixed(2)) },
          { label: 'Semester Total Credits', value: semCredits, unit: 'hrs' },
          { label: 'Total Accumulated Credits', value: totalCredits, unit: 'hrs' },
        ],
        steps: [
          'Semester Points = Σ(Credits × Grade Points)',
          `Semester GPA = ${semPoints.toFixed(2)} ÷ ${semCredits} = ${semGpa.toFixed(2)}`,
          `Cumulative GPA = ${totalPoints.toFixed(2)} ÷ ${totalCredits} = ${cumGpa.toFixed(2)}`,
        ],
      };
    },
  },
  {
    slug: 'final-grade-calculator',
    title: 'Final Exam Grade Needed',
    description: 'Calculate the minimum score required on your final examination to earn your desired course grade.',
    inputs: [
      { id: 'current_grade', label: 'Current Grade in Class (%)', type: 'number', defaultValue: 84, min: 0, max: 150, step: 0.1, unit: '%' },
      { id: 'target_grade', label: 'Target Overall Grade (%)', type: 'number', defaultValue: 90, min: 0, max: 150, step: 0.1, unit: '%' },
      { id: 'final_weight', label: 'Final Exam Weight (%)', type: 'number', defaultValue: 25, min: 1, max: 100, step: 1, unit: '%' },
    ],
    calculate: (inputs) => {
      const current = parseNum(inputs.current_grade);
      const target = parseNum(inputs.target_grade);
      const finalWeightPct = parseNum(inputs.final_weight);
      if ([current, target, finalWeightPct].some(isNaN)) return calcError('Please enter valid numeric grade percentages.');
      if (current < 0 || target < 0) return calcError('Grade percentages cannot be negative.');
      if (finalWeightPct <= 0 || finalWeightPct > 100) return calcError('Final exam weight must be between 1% and 100%.');
      const wFinal = finalWeightPct / 100;
      const wCurrent = 1 - wFinal;
      const needed = (target - current * wCurrent) / wFinal;
      let feasibility = 'Achievable';
      if (needed > 100) feasibility = 'Requires Extra Credit (> 100%)';
      else if (needed <= 0) feasibility = 'Already Secured (≤ 0% needed)';
      return {
        primaryOutput: parseFloat(needed.toFixed(1)),
        primaryUnit: '% Score Needed',
        secondaryOutputs: [
          { label: 'Feasibility Status', value: feasibility },
          { label: 'Target Grade', value: target, unit: '%' },
          { label: 'Current Standing', value: current, unit: '%' },
          { label: 'Max Possible Course Grade (100% Final)', value: parseFloat((current * wCurrent + 100 * wFinal).toFixed(1)), unit: '%' },
        ],
        steps: [
          `Current Weight = 100% - ${finalWeightPct}% = ${(wCurrent * 100).toFixed(0)}%`,
          `Points from Coursework = ${current}% × ${wCurrent.toFixed(2)} = ${(current * wCurrent).toFixed(2)}%`,
          `Score Needed = (${target} - ${(current * wCurrent).toFixed(2)}) ÷ ${wFinal.toFixed(2)} = ${needed.toFixed(1)}% (${feasibility})`,
        ],
      };
    },
  },
  {
    slug: 'grade-calculator',
    title: 'Grade Percentage to Letter',
    description: 'Convert percentage scores or earned points into letter grades, standard 4.0 GPA points, and performance tier.',
    inputs: [
      {
        id: 'inputMode',
        label: 'Score Input Mode',
        type: 'select',
        defaultValue: 'percentage',
        options: [
          { label: 'Direct Percentage (%)', value: 'percentage' },
          { label: 'Points Earned / Total Points', value: 'points' },
        ],
      },
      {
        id: 'percentage',
        label: 'Overall Class Percentage (%)',
        type: 'number',
        defaultValue: 88.5,
        min: 0,
        max: 150,
        step: 0.1,
        unit: '%',
        visibleWhen: (v) => !v.inputMode || v.inputMode === 'percentage' || v.inputMode === 'invalid_option',
      },
      {
        id: 'pointsEarned',
        label: 'Points Earned',
        type: 'number',
        defaultValue: 177,
        min: 0,
        step: 0.5,
        visibleWhen: (v) => v.inputMode === 'points',
      },
      {
        id: 'pointsTotal',
        label: 'Maximum Possible Points',
        type: 'number',
        defaultValue: 200,
        min: 1,
        step: 1,
        visibleWhen: (v) => v.inputMode === 'points',
      },
      {
        id: 'scale',
        label: 'Grading Scale Format',
        type: 'select',
        defaultValue: 'plus_minus',
        advanced: true,
        options: [
          { label: 'Plus/Minus Scale (A, A-, B+...)', value: 'plus_minus' },
          { label: 'Flat 10-Point Scale (A/B/C/D/F)', value: 'flat' },
        ],
      },
    ],
    calculate: (inputs) => {
      let p: number;
      if (inputs.inputMode === 'points') {
        const earned = parseNum(inputs.pointsEarned);
        const total = parseNum(inputs.pointsTotal);
        if (isNaN(earned) || isNaN(total) || earned < 0 || total <= 0) {
          return calcError('Points earned must be ≥ 0 and total possible points must be > 0.');
        }
        p = (earned / total) * 100;
      } else {
        p = parseNum(inputs.percentage);
      }

      if (isNaN(p) || p < 0 || p > 150) return calcError('Percentage must be between 0% and 150%.');

      let letter = 'F';
      let gpa = 0.0;
      let tier = 'Failing';
      if (inputs.scale === 'flat') {
        if (p >= 90) { letter = 'A'; gpa = 4.0; tier = 'Excellent'; }
        else if (p >= 80) { letter = 'B'; gpa = 3.0; tier = 'Above Average'; }
        else if (p >= 70) { letter = 'C'; gpa = 2.0; tier = 'Average'; }
        else if (p >= 60) { letter = 'D'; gpa = 1.0; tier = 'Passing Minimal'; }
      } else {
        if (p >= 93) { letter = 'A'; gpa = 4.0; tier = 'Excellent'; }
        else if (p >= 90) { letter = 'A-'; gpa = 3.7; tier = 'Excellent'; }
        else if (p >= 87) { letter = 'B+'; gpa = 3.3; tier = 'Above Average'; }
        else if (p >= 83) { letter = 'B'; gpa = 3.0; tier = 'Above Average'; }
        else if (p >= 80) { letter = 'B-'; gpa = 2.7; tier = 'Average'; }
        else if (p >= 77) { letter = 'C+'; gpa = 2.3; tier = 'Average'; }
        else if (p >= 73) { letter = 'C'; gpa = 2.0; tier = 'Average'; }
        else if (p >= 70) { letter = 'C-'; gpa = 1.7; tier = 'Below Average'; }
        else if (p >= 67) { letter = 'D+'; gpa = 1.3; tier = 'Passing Minimal'; }
        else if (p >= 60) { letter = 'D'; gpa = 1.0; tier = 'Passing Minimal'; }
      }

      return {
        primaryOutput: gpa,
        primaryUnit: `Grade ${letter} (${p.toFixed(1)}%)`,
        secondaryOutputs: [
          { label: 'Letter Grade', value: letter },
          { label: 'Percentage Score', value: `${p.toFixed(2)}%` },
          { label: 'Evaluation Tier', value: tier },
        ],
        steps: [`Computed Percentage: ${p.toFixed(2)}%`, `Scale Mapping: ${p.toFixed(2)}% → ${letter} (${gpa} GPA)`],
      };
    },
  },
  {
    slug: 'reading-speed-calculator',
    title: 'Reading Speed (WPM)',
    description: 'Calculate your reading speed in Words Per Minute (WPM) and estimate reading time for books and articles.',
    inputs: [
      { id: 'words', label: 'Total Words Read', type: 'number', defaultValue: 750, min: 1, max: 500000, step: 10 },
      { id: 'minutes', label: 'Time Spent (Minutes)', type: 'number', defaultValue: 3, min: 0, max: 1440, step: 0.1, unit: 'min' },
      { id: 'seconds', label: 'Additional Seconds', type: 'number', defaultValue: 0, min: 0, max: 59, step: 1, unit: 's' },
      { id: 'targetWords', label: 'Target Document / Book Words', type: 'number', defaultValue: 70000, min: 100, max: 2000000, step: 1000, advanced: true },
    ],
    calculate: (inputs) => {
      const w = parseNum(inputs.words);
      const mins = parseNum(inputs.minutes);
      const secs = parseNum(inputs.seconds);
      const targetWords = inputs.targetWords === undefined ? 70000 : parseNum(inputs.targetWords);
      if ([w, mins, secs, targetWords].some(isNaN)) return calcError('Please enter valid numbers for words, minutes, and seconds.');
      if (w < 0 || mins < 0 || secs < 0 || targetWords <= 0) return calcError('Word counts and time spent must be valid positive values.');
      const totalMin = mins + secs / 60;
      if (totalMin <= 0) return calcError('Total reading time must be greater than zero.');
      const wpm = w / totalMin;
      let speedTier = 'Average (200-250 WPM)';
      if (wpm < 150) speedTier = 'Deliberate / Technical';
      else if (wpm > 400) speedTier = 'Speed Reader';
      else if (wpm > 250) speedTier = 'Above Average';
      const hoursPerBook = wpm > 0 ? targetWords / wpm / 60 : 0;
      return {
        primaryOutput: Math.round(wpm),
        primaryUnit: 'Words Per Minute (WPM)',
        secondaryOutputs: [
          { label: 'Reader Category', value: speedTier },
          { label: `Time per Target (${(targetWords / 1000).toFixed(0)}k words)`, value: parseFloat(hoursPerBook.toFixed(1)), unit: 'hours' },
          { label: 'Pages Per Hour (~250 words/page)', value: Math.round((wpm * 60) / 250), unit: 'pages' },
        ],
        steps: [
          `Elapsed Time = ${totalMin.toFixed(2)} minutes`,
          `WPM = ${w} ÷ ${totalMin.toFixed(2)} = ${Math.round(wpm)} WPM`,
        ],
      };
    },
  },
  {
    slug: 'word-counter',
    title: 'Word & Character Counter',
    description: 'Count exact words, characters (with and without spaces), sentences, paragraphs, unique words, and reading duration from real text.',
    inputs: [
      {
        id: 'text',
        label: 'Paste or Type Your Text',
        type: 'textarea',
        rows: 5,
        placeholder: 'Paste your essay, article, blog post, or speech script here...',
        defaultValue:
          'Accurate financial and scientific calculations rely on transparent formulas, clear units, and realistic boundary assumptions. Whether analyzing compound investment growth or evaluating statistical confidence intervals, inspecting intermediate steps helps verify every output before making important decisions.',
      },
    ],
    calculate: (inputs) => {
      if (inputs.text === undefined && inputs.word_count_input !== undefined) {
        const words = parseNum(inputs.word_count_input);
        if (isNaN(words) || words < 0) return calcError('Word count must be a non-negative integer.');
        const charsWithSpaces = Math.round(words * 5.8);
        return {
          primaryOutput: Math.round(words),
          primaryUnit: 'Words',
          secondaryOutputs: [
            { label: 'Est. Characters (with spaces)', value: charsWithSpaces },
            { label: 'Silent Reading Time (@ 225 WPM)', value: parseFloat((words / 225).toFixed(1)), unit: 'min' },
          ],
          steps: ['Legacy numeric word count mode.'],
        };
      }

      const rawText = String(inputs.text ?? '');
      const stats = analyzeTextStats(rawText);

      return {
        primaryOutput: stats.words,
        primaryUnit: stats.words === 1 ? 'Word' : 'Words',
        secondaryOutputs: [
          { label: 'Characters (with spaces)', value: stats.charsWithSpaces },
          { label: 'Characters (no spaces)', value: stats.charsNoSpaces },
          { label: 'Sentences / Paragraphs', value: `${stats.sentences} sentences / ${stats.paragraphs} paragraphs` },
          { label: 'Unique Words / Avg Length', value: `${stats.uniqueWords} unique | ${stats.avgWordLength.toFixed(1)} chars` },
          { label: 'Reading Time (225 WPM)', value: stats.readingMin < 1 && stats.words > 0 ? `${Math.round(stats.readingMin * 60)} sec` : `${stats.readingMin.toFixed(1)} min` },
          { label: 'Speaking Time (135 WPM)', value: stats.speakingMin < 1 && stats.words > 0 ? `${Math.round(stats.speakingMin * 60)} sec` : `${stats.speakingMin.toFixed(1)} min` },
        ],
        steps: [
          `Tokenized ${stats.words} words and ${stats.uniqueWords} unique normalized terms.`,
          `Measured ${stats.charsWithSpaces} total characters (${stats.charsNoSpaces} non-whitespace), ${stats.sentences} sentences, and ${stats.paragraphs} paragraphs.`,
          `Silent reading @ 225 WPM = ${stats.readingMin.toFixed(2)} min | Speech @ 135 WPM = ${stats.speakingMin.toFixed(2)} min.`,
        ],
        formulaUsed: 'Unicode Whitespace Word & Punctuation Sentence Tokenizer',
      };
    },
  },
  {
    slug: 'velocity-calculator',
    title: 'Velocity, Distance & Time Calculator',
    category: 'science',
    formulaDisplay: 'v = Δx / Δt | Δx = v × Δt | Δt = Δx / v',
    inputs: [
      {
        id: 'solveFor',
        label: 'Solve For',
        type: 'select',
        defaultValue: 'velocity',
        options: [
          { label: 'Average Velocity (v = Δx / Δt)', value: 'velocity' },
          { label: 'Distance (Δx = v × Δt)', value: 'distance' },
          { label: 'Time Elapsed (Δt = Δx / v)', value: 'time' },
        ],
      },
      {
        id: 'distance',
        label: 'Displacement (Distance in meters)',
        defaultValue: 100,
        type: 'number',
        step: 'any',
        unit: 'm',
        visibleWhen: (v) => v.solveFor !== 'distance',
      },
      {
        id: 'time',
        label: 'Time Elapsed (Seconds)',
        defaultValue: 9.58,
        type: 'number',
        min: 0.0001,
        step: 'any',
        unit: 's',
        visibleWhen: (v) => v.solveFor !== 'time',
      },
      {
        id: 'velocityInput',
        label: 'Velocity (v in m/s)',
        defaultValue: 10.44,
        type: 'number',
        step: 'any',
        unit: 'm/s',
        visibleWhen: (v) => v.solveFor === 'distance' || v.solveFor === 'time',
      },
    ],
    calculate: (v) => {
      const mode = v.solveFor === 'distance' || v.solveFor === 'time' ? v.solveFor : 'velocity';

      if (mode === 'distance') {
        const vel = parseNum(v.velocityInput);
        const t = parseNum(v.time);
        if (isNaN(vel) || isNaN(t)) return calcError('Enter valid numbers for velocity and time.');
        if (t <= 0) return calcError('Elapsed time must be greater than zero.');
        const d = vel * t;
        return {
          primaryValue: parseFloat(d.toFixed(3)),
          primaryUnit: 'meters (m)',
          primaryLabel: 'Displacement (Δx)',
          secondaryOutputs: [
            { label: 'Kilometers (km)', value: `${(d / 1000).toFixed(4)} km` },
            { label: 'Miles (mi)', value: `${(d / 1609.344).toFixed(4)} mi` },
          ],
          steps: [`Δx = ${vel} m/s × ${t} s = ${d.toFixed(3)} m`],
          formulaUsed: 'Δx = v × Δt',
        };
      }

      if (mode === 'time') {
        const d = parseNum(v.distance);
        const vel = parseNum(v.velocityInput);
        if (isNaN(d) || isNaN(vel)) return calcError('Enter valid numbers for distance and velocity.');
        if (vel === 0) return calcError('Velocity cannot be zero when solving for time.');
        const t = d / vel;
        if (t < 0) return calcError('Displacement and velocity must share the same sign so time is non-negative.');
        return {
          primaryValue: parseFloat(t.toFixed(3)),
          primaryUnit: 'seconds (s)',
          primaryLabel: 'Time Elapsed (Δt)',
          secondaryOutputs: [
            { label: 'Minutes', value: `${(t / 60).toFixed(2)} min` },
            { label: 'Hours', value: `${(t / 3600).toFixed(4)} hrs` },
          ],
          steps: [`Δt = ${d} m / ${vel} m/s = ${t.toFixed(3)} s`],
          formulaUsed: 'Δt = Δx / v',
        };
      }

      const d = parseNum(v.distance);
      const t = parseNum(v.time);
      if (isNaN(d) || isNaN(t)) return calcError('Please enter valid numbers for displacement and time.');
      if (t <= 0) return calcError('Elapsed time must be greater than zero.');
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
    slug: 'ohms-law-calculator',
    title: "Ohm's Law & Circuit Calculator",
    category: 'science',
    formulaDisplay: 'V = I × R, P = V × I = I²R = V²/R',
    inputs: [
      {
        id: 'solveMode',
        label: 'Known Pair of Variables',
        type: 'select',
        defaultValue: 'find_i_p_from_vr',
        options: [
          { label: 'Known: Voltage (V) & Resistance (R)', value: 'find_i_p_from_vr' },
          { label: 'Known: Current (I) & Resistance (R)', value: 'find_v_p_from_ir' },
          { label: 'Known: Voltage (V) & Current (I)', value: 'find_r_p_from_vi' },
        ],
      },
      {
        id: 'volts',
        label: 'Voltage (V in Volts)',
        defaultValue: 120,
        type: 'number',
        step: 'any',
        unit: 'V',
        visibleWhen: (v) => v.solveMode !== 'find_v_p_from_ir',
      },
      {
        id: 'currentInput',
        label: 'Current (I in Amps)',
        defaultValue: 12,
        type: 'number',
        step: 'any',
        unit: 'A',
        visibleWhen: (v) => v.solveMode === 'find_v_p_from_ir' || v.solveMode === 'find_r_p_from_vi',
      },
      {
        id: 'resistance',
        label: 'Resistance (R in Ohms)',
        defaultValue: 10,
        type: 'number',
        min: 0.0001,
        step: 'any',
        unit: 'Ω',
        visibleWhen: (v) => v.solveMode !== 'find_r_p_from_vi',
      },
    ],
    calculate: (v) => {
      const mode =
        v.solveMode === 'find_v_p_from_ir' || v.solveMode === 'find_r_p_from_vi'
          ? v.solveMode
          : 'find_i_p_from_vr';

      if (mode === 'find_v_p_from_ir') {
        const i = parseNum(v.currentInput);
        const r = parseNum(v.resistance);
        if (isNaN(i) || isNaN(r)) return calcError('Enter valid numbers for current and resistance.');
        if (r <= 0) return calcError('Resistance (R) must be greater than zero Ohms.');
        const volts = i * r;
        const power = volts * i;
        return {
          primaryValue: parseFloat(volts.toFixed(4)),
          primaryUnit: 'Volts (V)',
          primaryLabel: 'Voltage (V)',
          secondaryOutputs: [
            { label: 'Electric Power (P)', value: `${power.toFixed(2)} Watts (W)` },
            { label: 'Current (I)', value: `${i} A` },
            { label: 'Resistance (R)', value: `${r} Ω` },
          ],
          steps: [`V = I × R = ${i} A × ${r} Ω = ${volts.toFixed(4)} V`, `P = V × I = ${power.toFixed(2)} W`],
          formulaUsed: 'V = I·R, P = I²·R',
        };
      }

      if (mode === 'find_r_p_from_vi') {
        const volts = parseNum(v.volts);
        const i = parseNum(v.currentInput);
        if (isNaN(volts) || isNaN(i)) return calcError('Enter valid numbers for voltage and current.');
        if (i === 0) return calcError('Current (I) cannot be zero when solving for resistance.');
        const r = volts / i;
        if (r <= 0) return calcError('Voltage and current must yield positive resistance.');
        const power = volts * i;
        return {
          primaryValue: parseFloat(r.toFixed(4)),
          primaryUnit: 'Ohms (Ω)',
          primaryLabel: 'Resistance (R)',
          secondaryOutputs: [
            { label: 'Electric Power (P)', value: `${power.toFixed(2)} Watts (W)` },
            { label: 'Voltage (V)', value: `${volts} V` },
            { label: 'Current (I)', value: `${i} A` },
          ],
          steps: [`R = V / I = ${volts} V / ${i} A = ${r.toFixed(4)} Ω`, `P = V × I = ${power.toFixed(2)} W`],
          formulaUsed: 'R = V/I, P = V·I',
        };
      }

      const volts = parseNum(v.volts);
      const res = parseNum(v.resistance);
      if (isNaN(volts) || isNaN(res)) return calcError('Please enter valid numbers for voltage and resistance.');
      if (res <= 0) return calcError('Resistance (R) must be greater than zero Ohms.');
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
    slug: 'molarity-calculator',
    title: 'Molarity & Dilution (M₁V₁ = M₂V₂) Calculator',
    category: 'science',
    formulaDisplay: 'M = n / V | Mass mode: M = (g / MW) / V | Dilution: M₁V₁ = M₂V₂',
    inputs: [
      {
        id: 'mode',
        label: 'Calculation Mode',
        type: 'select',
        defaultValue: 'moles_vol',
        options: [
          { label: 'From Moles & Liters (M = n / V)', value: 'moles_vol' },
          { label: 'From Mass (g) & Molar Mass (g/mol)', value: 'mass_mw_vol' },
          { label: 'Stock Dilution (M₁V₁ = M₂V₂)', value: 'dilution' },
        ],
      },
      {
        id: 'moles',
        label: 'Moles of Solute (n in mol)',
        defaultValue: 0.5,
        type: 'number',
        min: 0,
        step: 'any',
        unit: 'mol',
        visibleWhen: (v) => !v.mode || v.mode === 'moles_vol' || v.mode === 'invalid_option',
      },
      {
        id: 'massG',
        label: 'Solute Mass (grams)',
        defaultValue: 29.22,
        type: 'number',
        min: 0,
        step: 'any',
        unit: 'g',
        visibleWhen: (v) => v.mode === 'mass_mw_vol',
      },
      {
        id: 'molarMass',
        label: 'Molar Mass (g/mol)',
        defaultValue: 58.44,
        type: 'number',
        min: 0.01,
        step: 'any',
        unit: 'g/mol',
        visibleWhen: (v) => v.mode === 'mass_mw_vol',
      },
      {
        id: 'volumeLiters',
        label: 'Solution Volume (V in Liters)',
        defaultValue: 2.0,
        type: 'number',
        min: 0.0001,
        step: 'any',
        unit: 'L',
        visibleWhen: (v) => v.mode !== 'dilution',
      },
      {
        id: 'm1',
        label: 'Stock Concentration (M₁)',
        defaultValue: 2.0,
        type: 'number',
        min: 0.0001,
        step: 'any',
        unit: 'M',
        visibleWhen: (v) => v.mode === 'dilution',
      },
      {
        id: 'm2',
        label: 'Target Concentration (M₂)',
        defaultValue: 0.25,
        type: 'number',
        min: 0,
        step: 'any',
        unit: 'M',
        visibleWhen: (v) => v.mode === 'dilution',
      },
      {
        id: 'v2Liters',
        label: 'Final Target Volume (V₂ in Liters)',
        defaultValue: 1.0,
        type: 'number',
        min: 0.0001,
        step: 'any',
        unit: 'L',
        visibleWhen: (v) => v.mode === 'dilution',
      },
    ],
    calculate: (v) => {
      if (v.mode === 'dilution') {
        const m1 = parseNum(v.m1);
        const m2 = parseNum(v.m2);
        const v2 = parseNum(v.v2Liters);
        if ([m1, m2, v2].some(isNaN) || m1 <= 0 || m2 < 0 || v2 <= 0) {
          return calcError('Stock molarity (M₁) and target volume (V₂) must be > 0, and target molarity ≥ 0.');
        }
        if (m2 > m1) return calcError('Target concentration M₂ cannot exceed stock concentration M₁ in a dilution.');
        const v1 = (m2 * v2) / m1;
        const solventToAdd = v2 - v1;
        return {
          primaryValue: parseFloat((v1 * 1000).toFixed(2)),
          primaryUnit: 'mL of Stock (V₁)',
          primaryLabel: 'Required Stock Volume (V₁)',
          secondaryOutputs: [
            { label: 'V₁ in Liters', value: `${v1.toFixed(4)} L` },
            { label: 'Solvent to Add', value: `${(solventToAdd * 1000).toFixed(2)} mL` },
          ],
          steps: [`V₁ = (${m2} M × ${v2} L) / ${m1} M = ${v1.toFixed(4)} L = ${(v1 * 1000).toFixed(2)} mL`],
          formulaUsed: 'M₁V₁ = M₂V₂',
        };
      }

      const vol = parseNum(v.volumeLiters);
      if (isNaN(vol) || vol <= 0) return calcError('Solution volume must be > 0 liters.');

      if (v.mode === 'mass_mw_vol') {
        const mass = parseNum(v.massG);
        const mw = parseNum(v.molarMass);
        if (isNaN(mass) || isNaN(mw) || mass < 0 || mw <= 0) {
          return calcError('Mass must be ≥ 0 and molar mass must be > 0 g/mol.');
        }
        const n = mass / mw;
        const m = n / vol;
        return {
          primaryValue: parseFloat(m.toFixed(4)),
          primaryUnit: 'mol / L (M)',
          primaryLabel: 'Molarity (M)',
          secondaryOutputs: [
            { label: 'Moles of Solute (n)', value: `${n.toFixed(4)} mol` },
            { label: 'Millimolar (mM)', value: `${(m * 1000).toFixed(2)} mM` },
          ],
          steps: [`n = ${mass} g / ${mw} g/mol = ${n.toFixed(4)} mol`, `M = ${n.toFixed(4)} / ${vol} L = ${m.toFixed(4)} M`],
          formulaUsed: 'M = (mass / MW) / V',
        };
      }

      const n = parseNum(v.moles);
      if (isNaN(n) || n < 0) return calcError('Moles must be ≥ 0.');
      const m = n / vol;
      return {
        primaryValue: parseFloat(m.toFixed(4)),
        primaryUnit: 'mol / L (M)',
        primaryLabel: 'Molarity (M)',
        secondaryOutputs: [
          { label: 'Millimolar (mM)', value: `${(m * 1000).toFixed(2)} mM` },
          { label: 'Micromolar (µM)', value: `${(m * 1e6).toFixed(0)} µM` },
        ],
        steps: [`M = ${n} mol / ${vol} L = ${m.toFixed(4)} M`],
        formulaUsed: 'M = n / V',
      };
    },
  },
  {
    slug: 'ph-calculator',
    title: 'pH, pOH, [H⁺] and [OH⁻] Calculator',
    category: 'science',
    formulaDisplay: 'pH = -log₁₀[H⁺], pOH = 14 - pH, [H⁺][OH⁻] = 10⁻¹⁴',
    inputs: [
      {
        id: 'inputMode',
        label: 'Known Parameter',
        type: 'select',
        defaultValue: 'h_conc',
        options: [
          { label: '[H⁺] Ion Concentration (mol/L)', value: 'h_conc' },
          { label: 'pH Value (-1 to 15)', value: 'ph' },
          { label: 'pOH Value (-1 to 15)', value: 'poh' },
          { label: '[OH⁻] Ion Concentration (mol/L)', value: 'oh_conc' },
        ],
      },
      {
        id: 'hConc',
        label: 'Hydrogen Ion Concentration [H⁺] (mol/L)',
        defaultValue: 0.0001,
        type: 'number',
        min: 1e-15,
        max: 20,
        step: 'any',
        unit: 'M',
        visibleWhen: (v) => !v.inputMode || v.inputMode === 'h_conc' || v.inputMode === 'invalid_option',
      },
      {
        id: 'phVal',
        label: 'pH Value',
        defaultValue: 4,
        type: 'number',
        min: -1,
        max: 15,
        step: 0.1,
        visibleWhen: (v) => v.inputMode === 'ph',
      },
      {
        id: 'pohVal',
        label: 'pOH Value',
        defaultValue: 10,
        type: 'number',
        min: -1,
        max: 15,
        step: 0.1,
        visibleWhen: (v) => v.inputMode === 'poh',
      },
      {
        id: 'ohConc',
        label: 'Hydroxide Concentration [OH⁻] (mol/L)',
        defaultValue: 1e-10,
        type: 'number',
        min: 1e-15,
        max: 20,
        step: 'any',
        unit: 'M',
        visibleWhen: (v) => v.inputMode === 'oh_conc',
      },
    ],
    calculate: (v) => {
      const mode =
        v.inputMode === 'ph' || v.inputMode === 'poh' || v.inputMode === 'oh_conc'
          ? v.inputMode
          : 'h_conc';

      let ph = 7;
      let poh = 7;
      let h = 1e-7;
      let oh = 1e-7;

      if (mode === 'h_conc') {
        h = parseNum(v.hConc);
        if (isNaN(h) || h <= 0) return calcError('Hydrogen ion concentration [H⁺] must be strictly positive (e.g., 1e-7 M).');
        ph = -Math.log10(h);
        if (ph < -1 || ph > 15) return calcError('Resulting pH falls outside concentrated aqueous range (-1 to 15).');
        poh = 14 - ph;
        oh = Math.pow(10, -poh);
      } else if (mode === 'ph') {
        ph = parseNum(v.phVal);
        if (isNaN(ph) || ph < -1 || ph > 15) return calcError('pH value must be between -1 and 15.');
        poh = 14 - ph;
        h = Math.pow(10, -ph);
        oh = Math.pow(10, -poh);
      } else if (mode === 'poh') {
        poh = parseNum(v.pohVal);
        if (isNaN(poh) || poh < -1 || poh > 15) return calcError('pOH value must be between -1 and 15.');
        ph = 14 - poh;
        h = Math.pow(10, -ph);
        oh = Math.pow(10, -poh);
      } else {
        oh = parseNum(v.ohConc);
        if (isNaN(oh) || oh <= 0) return calcError('Hydroxide concentration [OH⁻] must be strictly positive.');
        poh = -Math.log10(oh);
        if (poh < -1 || poh > 15) return calcError('Resulting pOH falls outside concentrated aqueous range (-1 to 15).');
        ph = 14 - poh;
        h = Math.pow(10, -ph);
      }

      let desc = 'Neutral (Pure Water)';
      if (ph < 6.99) desc = 'Acidic Solution';
      else if (ph > 7.01) desc = 'Basic / Alkaline Solution';
      return {
        primaryValue: parseFloat(ph.toFixed(2)),
        primaryLabel: `pH (${desc})`,
        secondaryOutputs: [
          { label: 'pOH Equivalent', value: parseFloat(poh.toFixed(2)) },
          { label: 'Hydrogen [H⁺]', value: Number.isFinite(h) ? h.toExponential(3) + ' M' : 'Out of Range' },
          { label: 'Hydroxide [OH⁻]', value: Number.isFinite(oh) ? oh.toExponential(3) + ' M' : 'Out of Range' },
        ],
        steps: [`pH = ${ph.toFixed(2)}, pOH = ${poh.toFixed(2)}`, `[H⁺] = ${h.toExponential(3)} M | [OH⁻] = ${oh.toExponential(3)} M`],
        formulaUsed: 'Sørensen pH & Water Autoionization Equilibrium',
      };
    },
  },
  {
    slug: 'kinetic-energy-calculator',
    title: 'Kinetic Energy Calculator',
    category: 'science',
    formulaDisplay: 'KE = 0.5 × m × v² | v = √(2·KE / m) | m = 2·KE / v²',
    inputs: [
      {
        id: 'solveFor',
        label: 'Solve For',
        type: 'select',
        defaultValue: 'ke',
        options: [
          { label: 'Kinetic Energy (KE = 0.5·m·v²)', value: 'ke' },
          { label: 'Velocity (v = √(2·KE / m))', value: 'velocity' },
          { label: 'Mass (m = 2·KE / v²)', value: 'mass' },
        ],
      },
      {
        id: 'keInput',
        label: 'Kinetic Energy (KE in Joules)',
        defaultValue: 9,
        type: 'number',
        min: 0,
        step: 'any',
        unit: 'J',
        visibleWhen: (v) => v.solveFor === 'velocity' || v.solveFor === 'mass',
      },
      {
        id: 'mass',
        label: 'Object Mass (m in kg)',
        defaultValue: 2,
        type: 'number',
        min: 0,
        step: 'any',
        unit: 'kg',
        visibleWhen: (v) => v.solveFor !== 'mass',
      },
      {
        id: 'velocity',
        label: 'Velocity (v in m/s)',
        defaultValue: 3,
        type: 'number',
        step: 'any',
        unit: 'm/s',
        visibleWhen: (v) => v.solveFor !== 'velocity',
      },
    ],
    calculate: (v) => {
      const mode = v.solveFor === 'velocity' || v.solveFor === 'mass' ? v.solveFor : 'ke';

      if (mode === 'velocity') {
        const ke = parseNum(v.keInput);
        const m = parseNum(v.mass);
        if (isNaN(ke) || isNaN(m) || ke < 0 || m <= 0) {
          return calcError('Kinetic energy must be ≥ 0 and mass must be > 0 kg.');
        }
        const vel = Math.sqrt((2 * ke) / m);
        const relNote = vel > 0.1 * 299792458 ? 'Exceeds 0.1c (relativistic effects apply)' : 'Classical Newtonian regime';
        return {
          primaryValue: parseFloat(vel.toFixed(3)),
          primaryUnit: 'm/s',
          primaryLabel: 'Object Velocity (v)',
          secondaryOutputs: [
            { label: 'km/h & mph', value: `${(vel * 3.6).toFixed(2)} km/h | ${(vel * 2.23694).toFixed(2)} mph` },
            { label: 'Physics Regime', value: relNote },
          ],
          steps: [`v = √(2 × ${ke} / ${m}) = ${vel.toFixed(3)} m/s`],
          formulaUsed: 'v = √(2·KE / m)',
        };
      }

      if (mode === 'mass') {
        const ke = parseNum(v.keInput);
        const vel = parseNum(v.velocity);
        if (isNaN(ke) || isNaN(vel) || ke < 0 || vel === 0) {
          return calcError('Kinetic energy must be ≥ 0 and velocity cannot be zero when solving for mass.');
        }
        const m = (2 * ke) / (vel * vel);
        return {
          primaryValue: parseFloat(m.toFixed(4)),
          primaryUnit: 'kg',
          primaryLabel: 'Object Mass (m)',
          secondaryOutputs: [{ label: 'Mass in Grams', value: `${(m * 1000).toFixed(2)} g` }],
          steps: [`m = (2 × ${ke}) / (${vel})² = ${m.toFixed(4)} kg`],
          formulaUsed: 'm = 2·KE / v²',
        };
      }

      const m = parseNum(v.mass);
      const vel = parseNum(v.velocity);
      if (isNaN(m) || isNaN(vel)) return calcError('Please enter valid numbers for mass and velocity.');
      if (m < 0) return calcError('Object mass cannot be negative.');
      const ke = 0.5 * m * vel * vel;
      if (!Number.isFinite(ke)) return calcError('Kinetic energy exceeds finite IEEE 754 precision limits.');
      const relWarning = Math.abs(vel) > 0.1 * 299792458 ? 'Relativistic regime (> 0.1c)' : 'Classical Newtonian';

      return {
        primaryValue: parseFloat(ke.toFixed(3)),
        primaryUnit: 'Joules (J)',
        primaryLabel: 'Kinetic Energy (KE)',
        secondaryOutputs: [
          { label: 'Kilojoules (kJ)', value: (ke / 1000).toFixed(4) },
          { label: 'Calorie Equivalent', value: (ke / 4184).toFixed(4) },
          { label: 'Momentum (p = m·v)', value: `${(m * vel).toFixed(2)} kg·m/s` },
          { label: 'Physics Regime', value: relWarning },
        ],
        steps: [`KE = 0.5 × ${m} kg × (${vel} m/s)² = 0.5 × ${m} × ${vel * vel} = ${ke} J`],
        formulaUsed: 'KE = 0.5 · m · v²',
      };
    },
  },
  {
    slug: 'concrete-calculator',
    title: 'Concrete Slab & Column Volume Calculator',
    category: 'home-tech',
    formulaDisplay: 'Slab: (L × W × D)/27 | Column: π·r²·H / 27',
    inputs: [
      {
        id: 'shape',
        label: 'Concrete Structure Type',
        type: 'select',
        defaultValue: 'slab',
        options: [
          { label: 'Rectangular Slab / Footing', value: 'slab' },
          { label: 'Cylindrical Sonotube / Column', value: 'column' },
        ],
      },
      {
        id: 'lengthFt',
        label: 'Length (Feet)',
        defaultValue: 20,
        type: 'number',
        min: 0.1,
        step: 0.5,
        unit: 'ft',
        visibleWhen: (v) => v.shape !== 'column',
      },
      {
        id: 'widthFt',
        label: 'Width (Feet)',
        defaultValue: 10,
        type: 'number',
        min: 0.1,
        step: 0.5,
        unit: 'ft',
        visibleWhen: (v) => v.shape !== 'column',
      },
      {
        id: 'depthIn',
        label: 'Thickness / Depth (Inches)',
        defaultValue: 4,
        type: 'number',
        min: 0.5,
        step: 0.5,
        unit: 'in',
        visibleWhen: (v) => v.shape !== 'column',
      },
      {
        id: 'diameterIn',
        label: 'Column Diameter (Inches)',
        defaultValue: 12,
        type: 'number',
        min: 1,
        step: 1,
        unit: 'in',
        visibleWhen: (v) => v.shape === 'column',
      },
      {
        id: 'heightFt',
        label: 'Column Height / Depth (Feet)',
        defaultValue: 4,
        type: 'number',
        min: 0.1,
        step: 0.5,
        unit: 'ft',
        visibleWhen: (v) => v.shape === 'column',
      },
      { id: 'quantity', label: 'Quantity / Pour Count', defaultValue: 1, type: 'number', min: 1, max: 500, step: 1, advanced: true },
      { id: 'wastePct', label: 'Spill & Overage Allowance (%)', defaultValue: 0, type: 'number', min: 0, max: 30, step: 5, unit: '%', advanced: true },
    ],
    calculate: (v) => {
      const qty = v.quantity === undefined ? 1 : parseNum(v.quantity);
      const waste = v.wastePct === undefined ? 0 : parseNum(v.wastePct);
      if (isNaN(qty) || isNaN(waste) || qty < 1 || waste < 0 || waste > 50) {
        return calcError('Quantity must be ≥ 1 and overage waste percentage between 0% and 50%.');
      }

      let singleCuFt: number;
      let stepDetail: string;

      if (v.shape === 'column') {
        const diaIn = parseNum(v.diameterIn);
        const hFt = parseNum(v.heightFt);
        if (isNaN(diaIn) || isNaN(hFt) || diaIn <= 0 || hFt <= 0) {
          return calcError('Column diameter and height must be positive numbers.');
        }
        const radiusFt = diaIn / 2 / 12;
        singleCuFt = Math.PI * radiusFt * radiusFt * hFt;
        stepDetail = `Column Vol = π × (${(diaIn / 2).toFixed(1)}/12)² × ${hFt} ft = ${singleCuFt.toFixed(2)} cu ft each`;
      } else {
        const l = parseNum(v.lengthFt);
        const w = parseNum(v.widthFt);
        const dIn = parseNum(v.depthIn);
        if ([l, w, dIn].some(isNaN) || l <= 0 || w <= 0 || dIn <= 0) {
          return calcError('Length, width, and thickness must be positive numbers.');
        }
        singleCuFt = l * w * (dIn / 12);
        stepDetail = `Slab Vol = ${l} × ${w} × (${dIn}/12) = ${singleCuFt.toFixed(1)} cu ft`;
      }

      const cuFt = singleCuFt * qty * (1 + waste / 100);
      const cuYards = cuFt / 27;
      const cuMeters = cuFt * 0.0283168;
      const bags60 = cuYards * 45;
      const bags80 = cuYards * 34;

      return {
        primaryValue: parseFloat(cuYards.toFixed(2)),
        primaryUnit: 'Cubic Yards',
        primaryLabel: waste > 0 ? `Concrete Volume (+${waste}% Overage)` : 'Concrete Volume Required',
        secondaryOutputs: [
          { label: 'Cubic Feet / Cubic Meters', value: `${cuFt.toFixed(1)} ft³ | ${cuMeters.toFixed(2)} m³` },
          { label: '60 lb Premix Bags (~0.60 ft³/bag)', value: `${Math.ceil(bags60)} bags` },
          { label: '80 lb Premix Bags (~0.80 ft³/bag)', value: `${Math.ceil(bags80)} bags` },
        ],
        steps: [stepDetail, `Total across ${qty} unit(s)${waste > 0 ? ` + ${waste}% overage` : ''} = ${cuYards.toFixed(2)} yd³`],
        formulaUsed: v.shape === 'column' ? 'Yards = (π·r²·H × Qty) / 27' : 'Yards = (L × W × D_ft × Qty) / 27',
      };
    },
  },
  {
    slug: 'paint-calculator',
    title: 'Paint Coverage & Gallons Calculator',
    category: 'home-tech',
    formulaDisplay: 'Gallons = (Total Wall Area - Openings) × Coats / Coverage Rate',
    inputs: [
      { id: 'lengthFt', label: 'Room Length (ft)', defaultValue: 14, type: 'number', min: 0.1, step: 1, unit: 'ft' },
      { id: 'widthFt', label: 'Room Width (ft)', defaultValue: 12, type: 'number', min: 0.1, step: 1, unit: 'ft' },
      { id: 'heightFt', label: 'Ceiling Height (ft)', defaultValue: 9, type: 'number', min: 0.1, step: 0.5, unit: 'ft' },
      { id: 'coats', label: 'Number of Coats', defaultValue: 2, type: 'number', min: 1, max: 10, step: 1 },
      { id: 'doorsWindows', label: 'Total Doors & Windows Area (sq ft)', defaultValue: 42, type: 'number', min: 0, step: 5, unit: 'sq ft' },
      { id: 'coveragePerGal', label: 'Coverage per Gallon (sq ft/gal)', defaultValue: 350, type: 'number', min: 50, max: 800, step: 25, unit: 'sq ft', advanced: true },
      {
        id: 'includeCeiling',
        label: 'Include Ceiling Surface?',
        type: 'select',
        defaultValue: 'no',
        advanced: true,
        options: [
          { label: 'Walls Only', value: 'no' },
          { label: 'Walls + Ceiling (Length × Width)', value: 'yes' },
        ],
      },
    ],
    calculate: (v) => {
      const l = parseNum(v.lengthFt);
      const w = parseNum(v.widthFt);
      const h = parseNum(v.heightFt);
      const coats = parseNum(v.coats);
      const openings = parseNum(v.doorsWindows);
      const cov = v.coveragePerGal === undefined ? 350 : parseNum(v.coveragePerGal);
      if ([l, w, h, coats, openings, cov].some(isNaN)) return calcError('Please enter valid room dimensions and coat count.');
      if (l <= 0 || w <= 0 || h <= 0 || coats < 1 || openings < 0 || cov <= 0) {
        return calcError('Dimensions must be > 0, coats ≥ 1, coverage > 0, and cutouts ≥ 0.');
      }
      const perim = 2 * (l + w);
      const ceilingArea = v.includeCeiling === 'yes' ? l * w : 0;
      const grossArea = perim * h + ceilingArea;
      const netArea = Math.max(0, grossArea - openings);
      const totalCoverage = netArea * coats;
      const exactGallons = totalCoverage / cov;
      const gallons = Math.ceil(exactGallons);
      return {
        primaryValue: gallons,
        primaryUnit: 'Gallons',
        primaryLabel: 'Paint Cans Needed (1 Gallon each)',
        secondaryOutputs: [
          { label: 'Exact Gallons / Liters', value: `${exactGallons.toFixed(2)} gal (${(exactGallons * 3.78541).toFixed(1)} L)` },
          { label: 'Net Paintable Area', value: `${netArea.toFixed(0)} sq ft` },
          { label: `Total Paint Surface (${coats} coats)`, value: `${totalCoverage.toFixed(0)} sq ft` },
        ],
        steps: [
          `Net surface = 2(${l}+${w}) × ${h}${ceilingArea > 0 ? ` + ${ceilingArea.toFixed(0)} ceiling` : ''} - ${openings} = ${netArea.toFixed(0)} sq ft`,
          `Total with ${coats} coats = ${totalCoverage.toFixed(0)} sq ft / ${cov} = ${exactGallons.toFixed(2)} → Buy ${gallons} gal`,
        ],
        formulaUsed: 'Gallons = (Net Sq Ft × Coats) / Coverage Rate',
      };
    },
  },
  {
    slug: 'solar-panel-calculator',
    title: 'Solar Panel System Size & Production Calculator',
    category: 'home-tech',
    formulaDisplay: 'System Size (kW) = (Annual kWh × Offset%) / (Sun Hours × 365 × Efficiency)',
    inputs: [
      { id: 'monthlyKwh', label: 'Average Monthly Electric Usage (kWh)', defaultValue: 950, type: 'number', min: 1, step: 50, unit: 'kWh' },
      { id: 'sunHours', label: 'Daily Peak Sun Hours', defaultValue: 4.5, type: 'number', min: 0.5, max: 12, step: 0.5, unit: 'hrs/day' },
      { id: 'costPerKwh', label: 'Utility Electricity Cost ($ / kWh)', defaultValue: 0.18, type: 'number', min: 0, step: 0.01, unit: '$/kWh' },
      { id: 'offsetPct', label: 'Target Bill Offset (%)', defaultValue: 100, type: 'number', min: 10, max: 150, step: 5, unit: '%', advanced: true },
      { id: 'panelWatts', label: 'Individual Panel Wattage (W)', defaultValue: 400, type: 'number', min: 100, max: 800, step: 25, unit: 'W', advanced: true },
      { id: 'efficiency', label: 'System Derate Efficiency (0.50–0.95)', defaultValue: 0.8, type: 'number', min: 0.5, max: 0.95, step: 0.02, advanced: true },
      { id: 'systemCostPerWatt', label: 'Installed Cost ($ / Watt, Optional)', defaultValue: 0, type: 'number', min: 0, max: 10, step: 0.1, unit: '$/W', advanced: true },
    ],
    calculate: (v) => {
      const monthlyKwh = parseNum(v.monthlyKwh);
      const sun = parseNum(v.sunHours);
      const rate = parseNum(v.costPerKwh);
      const offsetPct = v.offsetPct === undefined ? 100 : parseNum(v.offsetPct);
      const panelW = v.panelWatts === undefined ? 400 : parseNum(v.panelWatts);
      const eff = v.efficiency === undefined ? 0.8 : parseNum(v.efficiency);
      const costPerW = v.systemCostPerWatt === undefined ? 0 : parseNum(v.systemCostPerWatt);
      if ([monthlyKwh, sun, rate, offsetPct, panelW, eff, costPerW].some(isNaN)) {
        return calcError('Please enter valid numbers for electric usage, sun hours, and solar parameters.');
      }
      if (monthlyKwh <= 0 || sun <= 0 || rate < 0 || offsetPct <= 0 || panelW <= 0 || eff <= 0 || eff > 1 || costPerW < 0) {
        return calcError('Usage, sun hours, panel wattage, and efficiency must be positive (efficiency ≤ 1).');
      }
      const annualKwh = monthlyKwh * 12 * (offsetPct / 100);
      const systemKw = annualKwh / (sun * 365 * eff);
      const panelsCount = Math.ceil((systemKw * 1000) / panelW);
      const annualSavings = annualKwh * rate;
      const estCost = systemKw * 1000 * costPerW;
      const paybackYrs = costPerW > 0 && annualSavings > 0 ? estCost / annualSavings : 0;

      return {
        primaryValue: parseFloat(systemKw.toFixed(2)),
        primaryUnit: 'kW DC',
        primaryLabel: 'Recommended Solar System Size',
        secondaryOutputs: [
          { label: `${panelW}W Solar Panels Needed`, value: `${panelsCount} panels` },
          { label: 'Estimated Annual Utility Savings', value: `$${annualSavings.toFixed(2)}` },
          { label: 'Roof Area Required (~21 sq ft/panel)', value: `~${panelsCount * 21} sq ft` },
          ...(costPerW > 0 ? [{ label: 'Gross Cost / Simple Payback', value: `$${Math.round(estCost).toLocaleString()} (${paybackYrs.toFixed(1)} yrs)` }] : []),
        ],
        steps: [`Target Annual ${annualKwh.toFixed(0)} kWh / (${sun} hrs × 365 × ${eff}) = ${systemKw.toFixed(2)} kW`],
        formulaUsed: 'PVWatts Photovoltaic Sizing Model',
      };
    },
  },
  {
    slug: 'electricity-cost-calculator',
    title: 'Electricity Bill & kWh Appliance Cost Calculator',
    category: 'home-tech',
    formulaDisplay: 'Monthly Cost = (Watts × Hours / 1000) × Qty × Rate × Billing Days',
    inputs: [
      { id: 'watts', label: 'Appliance Power Rating', defaultValue: 1000, type: 'number', min: 0, step: 50 },
      {
        id: 'powerUnit',
        label: 'Power Rating Unit',
        type: 'select',
        defaultValue: 'W',
        advanced: true,
        options: [
          { label: 'Watts (W)', value: 'W' },
          { label: 'Kilowatts (kW)', value: 'kW' },
        ],
      },
      { id: 'hoursPerDay', label: 'Hours Used per Day', defaultValue: 5, type: 'number', min: 0, max: 24, step: 0.5, unit: 'hrs' },
      { id: 'rateKwh', label: 'Utility Rate ($ / kWh)', defaultValue: 0.15, type: 'number', min: 0, step: 0.01, unit: '$/kWh' },
      { id: 'daysInMonth', label: 'Billing Cycle (Days per Month)', defaultValue: 30, type: 'number', step: 1, min: 1, max: 31, unit: 'days' },
      { id: 'quantity', label: 'Number of Appliances', defaultValue: 1, type: 'number', min: 1, max: 1000, step: 1, advanced: true },
    ],
    calculate: (v) => {
      const rawP = parseNum(v.watts);
      const h = parseNum(v.hoursPerDay);
      const rate = parseNum(v.rateKwh);
      const days = parseNum(v.daysInMonth);
      const qty = v.quantity === undefined ? 1 : parseNum(v.quantity);
      if ([rawP, h, rate, days, qty].some(isNaN)) return calcError('Please enter valid numbers for power, hours, rate, and billing days.');
      if (rawP < 0 || h < 0 || h > 24 || rate < 0 || days < 1 || days > 31 || qty < 1) {
        return calcError('Power and rate must be ≥ 0, hours 0–24/day, quantity ≥ 1, and billing days 1–31.');
      }
      const w = v.powerUnit === 'kW' ? rawP * 1000 : rawP;
      const dailyKwh = ((w * h) / 1000) * qty;
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
          `Daily Consumption = (${w} W × ${h} hrs × ${qty}) / 1000 = ${dailyKwh.toFixed(2)} kWh/day.`,
          `Billing Cycle Cost (${days} days) = ${dailyKwh.toFixed(2)} kWh × ${days} days × $${rate}/kWh = $${monthlyCost.toFixed(2)}.`,
          `Annual Benchmark (365 days) = ${dailyKwh.toFixed(2)} kWh × 365 days × $${rate}/kWh = $${annualCost.toFixed(2)}.`,
        ],
        formulaUsed: 'Cost = (Power in kW × Daily Hours × Qty × Days) × Rate/kWh',
      };
    },
  },
  {
    slug: 'subnet-calculator',
    title: 'IPv4 Subnet & CIDR Mask Calculator',
    category: 'home-tech',
    formulaDisplay: 'Usable Hosts = 2^(32 - CIDR) - 2 (RFC 3021 /31 & /32 Supported)',
    inputs: [
      { id: 'ip', label: 'IPv4 Address', defaultValue: '192.168.1.50', type: 'text' },
      { id: 'cidr', label: 'Subnet Prefix (CIDR /0 to /32)', defaultValue: 24, type: 'number', min: 0, max: 32, step: 1 },
    ],
    calculate: (v) => {
      const ipStr = String(v.ip ?? '192.168.1.50').trim();
      const octets = ipStr.split('.');
      if (
        octets.length !== 4 ||
        octets.some((o) => !/^\d{1,3}$/.test(o) || Number(o) < 0 || Number(o) > 255)
      ) {
        return calcError('Enter a valid IPv4 address with 4 octets from 0 to 255 (e.g., 192.168.1.50).');
      }
      const cidrRaw = parseNum(v.cidr);
      if (isNaN(cidrRaw) || cidrRaw < 0 || cidrRaw > 32) {
        return calcError('CIDR prefix must be an integer between 0 and 32.');
      }
      const cidr = Math.round(cidrRaw);
      const ipInt =
        ((Number(octets[0]) << 24) |
          (Number(octets[1]) << 16) |
          (Number(octets[2]) << 8) |
          Number(octets[3])) >>>
        0;
      const hostBits = 32 - cidr;
      // Avoid JS (0xffffffff << 32) wrap-around bug when cidr === 0
      const maskInt = cidr === 0 ? 0 : (0xffffffff << hostBits) >>> 0;
      const wildcardInt = ~maskInt >>> 0;
      const networkInt = (ipInt & maskInt) >>> 0;
      const broadcastInt = (networkInt | wildcardInt) >>> 0;
      const toIp = (n: number) => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');

      const totalHosts = Math.pow(2, hostBits);
      let usableHosts: number;
      let broadcastDisplay: string;
      let usableRangeDisplay: string;

      if (cidr === 32) {
        usableHosts = 1;
        broadcastDisplay = 'N/A (/32 Host Route)';
        usableRangeDisplay = `${toIp(networkInt)} (Single Host)`;
      } else if (cidr === 31) {
        usableHosts = 2;
        broadcastDisplay = 'N/A (RFC 3021 P2P Link)';
        usableRangeDisplay = `${toIp(networkInt)} – ${toIp(broadcastInt)} (Point-to-Point)`;
      } else {
        usableHosts = totalHosts - 2;
        broadcastDisplay = toIp(broadcastInt);
        usableRangeDisplay = `${toIp((networkInt + 1) >>> 0)} – ${toIp((broadcastInt - 1) >>> 0)}`;
      }

      return {
        primaryValue: usableHosts.toLocaleString(),
        primaryUnit: cidr >= 31 ? (cidr === 32 ? 'Host Route IP' : 'P2P Host IPs') : 'Usable Host IPs',
        primaryLabel: `Usable Hosts on ${toIp(networkInt)}/${cidr}`,
        secondaryOutputs: [
          { label: 'Network Address', value: `${toIp(networkInt)}/${cidr}` },
          { label: 'Broadcast Address', value: broadcastDisplay },
          { label: 'Usable Host Range', value: usableRangeDisplay },
          { label: 'Subnet Mask', value: toIp(maskInt) },
          { label: 'Wildcard Mask', value: toIp(wildcardInt) },
          { label: 'Total Allocated IPs', value: totalHosts.toLocaleString() },
        ],
        steps: [
          `Parsed IPv4 ${ipStr} with CIDR /${cidr} (${hostBits} host bits).`,
          `Network = IP & ${toIp(maskInt)} = ${toIp(networkInt)}.`,
          cidr === 32
            ? 'CIDR /32 designates a single host route (1 usable IP).'
            : cidr === 31
            ? 'CIDR /31 follows RFC 3021 point-to-point addressing (2 usable host IPs, no broadcast).'
            : `Usable Hosts = 2^${hostBits} - 2 = ${usableHosts.toLocaleString()}.`,
        ],
        formulaUsed: 'RFC 1878 / RFC 3021 / RFC 4632 IPv4 Subnet Addressing',
      };
    },
  },
];
