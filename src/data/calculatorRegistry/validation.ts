import { CalculationResult } from './types';

export function parseNum(val: unknown): number {
  if (val === '' || val === null || val === undefined || typeof val === 'boolean') {
    return NaN;
  }
  const n = Number(val);
  return Number.isFinite(n) ? n : NaN;
}

export function calcError(message: string, label = 'Invalid Input'): CalculationResult {
  return {
    primaryValue: 'Error',
    primaryLabel: label,
    error: message,
    steps: [message],
  };
}

export function parseLocalDate(str: unknown): Date | null {
  if (typeof str !== 'string') return null;
  const match = str.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  const dt = new Date(y, m - 1, d);
  if (
    dt.getFullYear() !== y ||
    dt.getMonth() !== m - 1 ||
    dt.getDate() !== d
  ) {
    return null;
  }
  return dt;
}
