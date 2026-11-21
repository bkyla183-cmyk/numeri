export type RoundingPrecision = 'auto' | 0 | 1 | 2 | 3 | 4 | 5;

export const ROUNDING_PRECISION_OPTIONS: readonly RoundingPrecision[] = [
  'auto',
  0,
  1,
  2,
  3,
  4,
  5,
];

export const ROUNDING_STORAGE_KEY = 'numeriq_rounding_precision';

export function parseRoundingPrecision(raw: string | null | undefined): RoundingPrecision {
  if (!raw || raw === 'auto') return 'auto';
  const num = Number(raw);
  if (Number.isInteger(num) && num >= 0 && num <= 5) {
    return num as 0 | 1 | 2 | 3 | 4 | 5;
  }
  return 'auto';
}

export function readStoredPrecision(): RoundingPrecision {
  if (typeof window === 'undefined') return 'auto';
  try {
    return parseRoundingPrecision(window.localStorage.getItem(ROUNDING_STORAGE_KEY));
  } catch {
    return 'auto';
  }
}

export function saveStoredPrecision(value: RoundingPrecision): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ROUNDING_STORAGE_KEY, String(value));
  } catch {
    // Ignore storage quota or private-browsing errors
  }
}

export interface AutoNumberFormatOptions {
  autoDecimals?: number;
  minAutoDecimals?: number;
  trimTrailingZeros?: boolean;
  useGrouping?: boolean;
}

/**
 * Formats a numeric result respecting global rounding precision (`'auto'` or `0`–`5` decimals).
 */
export function formatNumberWithPrecision(
  value: number,
  precision: RoundingPrecision,
  options: AutoNumberFormatOptions = {}
): string {
  if (!Number.isFinite(value)) return 'Out of Range';

  const {
    autoDecimals = 4,
    minAutoDecimals = 0,
    trimTrailingZeros = false,
    useGrouping = true,
  } = options;

  const cleanZero = (n: number) => (Object.is(n, -0) || n === 0 ? 0 : n);

  if (precision === 'auto') {
    const rounded = cleanZero(Number(value.toFixed(autoDecimals)));
    if (trimTrailingZeros) {
      return useGrouping
        ? rounded.toLocaleString('en-US', {
            minimumFractionDigits: minAutoDecimals,
            maximumFractionDigits: autoDecimals,
          })
        : String(rounded);
    }
    return rounded.toLocaleString('en-US', {
      minimumFractionDigits: minAutoDecimals,
      maximumFractionDigits: autoDecimals,
      useGrouping,
    });
  }

  const factor = Math.pow(10, precision);
  const rounded = cleanZero(Math.round((value + Number.EPSILON) * factor) / factor);
  return rounded.toLocaleString('en-US', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
    useGrouping,
  });
}

/**
 * Formats currency values with prefix symbol (`$`), comma grouping, and precision override.
 */
export function formatCurrencyWithPrecision(
  value: number,
  precision: RoundingPrecision,
  autoDecimals = 0,
  symbol = '$'
): string {
  if (!Number.isFinite(value)) return 'Out of Range';
  const decimals = precision === 'auto' ? autoDecimals : precision;
  const factor = Math.pow(10, decimals);
  const roundedAbs = Math.round((Math.abs(value) + Number.EPSILON) * factor) / factor;
  const formatted = roundedAbs.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return value < 0 && roundedAbs > 0 ? `-${symbol}${formatted}` : `${symbol}${formatted}`;
}

/**
 * Formats generic calculator string or numeric outputs (`GenericCalculatorEngine`) safely:
 * - Pure numbers: formatted with `precision` (or `maxAutoDecimals` when `'auto'`).
 * - Formatted scalar strings (`"$1,234.56"`, `"-$420/mo"`, `"45.67%"`): preserves prefix/suffix
 *   and re-formats the numeric core when `precision` is numeric (`0`–`5`).
 * - Dates, fractions (`3/4`), hex/binary, durations, and categorical labels are returned unchanged.
 */
export function formatGenericOutputWithPrecision(
  rawValue: string | number,
  precision: RoundingPrecision,
  maxAutoDecimals = 6
): string {
  if (typeof rawValue === 'number') {
    if (!Number.isFinite(rawValue)) return 'Overflow / Out of Range';
    return formatNumberWithPrecision(rawValue, precision, {
      autoDecimals: maxAutoDecimals,
      minAutoDecimals: 0,
      trimTrailingZeros: true,
    });
  }

  const str = String(rawValue ?? '');
  if (precision === 'auto') return str;

  const trimmed = str.trim();
  if (!trimmed) return str;

  // Never alter dates, ratios/fractions, hex/binary, durations, or categorical labels
  if (
    /^\d{4}-\d{2}-\d{2}/.test(trimmed) ||
    /^\s*[+-]?\d+\s*[:/]\s*\d+\s*$/.test(trimmed) ||
    /\b0[xb][0-9a-f]+\b/i.test(trimmed) ||
    /^\d+h\s+\d+m$/i.test(trimmed)
  ) {
    return str;
  }

  // Match optional sign + currency prefix + numeric value + optional percent or rate suffix
  const scalarMatch = trimmed.match(
    /^([+-]?)\s*([$€£¥]?)\s*([+-]?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?)\s*(%|\/\s*(?:mo|month|yr|year|day|wk|week|hr|h))?$/i
  );
  if (!scalarMatch) {
    return str;
  }

  const [, leadSign, currencySym, numToken, suffix] = scalarMatch;
  const parsed = Number(numToken.replace(/,/g, ''));
  if (!Number.isFinite(parsed)) return str;

  const signedNum = leadSign === '-' && parsed >= 0 ? -parsed : parsed;
  const formattedNum = formatNumberWithPrecision(Math.abs(signedNum), precision, {
    useGrouping: true,
  });
  const signOut = signedNum < 0 ? '-' : leadSign === '+' ? '+' : '';
  return `${signOut}${currencySym}${formattedNum}${suffix || ''}`;
}
