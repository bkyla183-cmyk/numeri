import { CalculatorSpec, InputDef } from '../data/calculatorRegistry/types';
import { AngleMode, evaluateScientificExpression } from './scientificParser';

export function isChartEligibleCalculator(slug: string, categorySlug: string): boolean {
  return (
    categorySlug === 'finance' ||
    categorySlug === 'business-tax' ||
    categorySlug === 'science' ||
    slug.toLowerCase().includes('scientific')
  );
}

/**
 * Parses a numeric value from a registry primary/secondary output string or number.
 * Rejects dates, ratios/fractions, durations, and hex/binary tokens.
 */
export function parseChartNumericValue(raw: string | number | undefined | null): number | null {
  if (raw === undefined || raw === null) return null;
  if (typeof raw === 'number') {
    return Number.isFinite(raw) ? raw : null;
  }

  const trimmed = String(raw).trim();
  if (!trimmed) return null;
  if (
    /^\d{4}-\d{2}-\d{2}/.test(trimmed) ||
    /^\s*[+-]?\d+\s*[:/]\s*\d+\s*$/.test(trimmed) ||
    /\b0[xb][0-9a-f]+\b/i.test(trimmed) ||
    /^\d+h\s+\d+m$/i.test(trimmed)
  ) {
    return null;
  }

  const match = trimmed.match(
    /^([+-]?)\s*([$€£¥]?)\s*([+-]?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?(?:e[+-]?\d+)?)/i
  );
  if (!match) return null;

  const [, leadSign, , numToken] = match;
  const parsed = Number(numToken.replace(/,/g, ''));
  if (!Number.isFinite(parsed)) return null;
  return leadSign === '-' && parsed >= 0 ? -parsed : parsed;
}

export interface SensitivityPoint {
  x: number;
  xLabel: string;
  y: number;
  isCurrent: boolean;
}

export interface SensitivitySeriesResult {
  points: SensitivityPoint[];
  input: InputDef;
  currentX: number;
  currentY: number;
  yLabel: string;
}

function formatAxisTick(val: number): string {
  if (!Number.isFinite(val)) return '0';
  const abs = Math.abs(val);
  if (abs === 0) return '0';
  if (abs >= 1_000_000) return `${(val / 1_000_000).toFixed(2)}M`;
  if (abs >= 10_000) return `${(val / 1_000).toFixed(1)}k`;
  if (abs < 0.01) return val.toExponential(2);
  return Number(val.toFixed(2)).toString();
}

export function buildSpecSensitivitySeries(
  spec: CalculatorSpec,
  inputs: Record<string, unknown>,
  targetInputId?: string
): SensitivitySeriesResult | null {
  const numericInputs = spec.inputs.filter((inp) => {
    if (inp.type !== 'number') return false;
    if (inp.visibleWhen && !inp.visibleWhen(inputs)) return false;
    const raw = inputs[inp.id] !== undefined ? inputs[inp.id] : inp.defaultValue;
    return Number.isFinite(Number(raw));
  });

  if (numericInputs.length === 0) return null;

  const activeInput =
    (targetInputId && numericInputs.find((i) => i.id === targetInputId)) ||
    numericInputs[0];

  const rawCurrent = inputs[activeInput.id] !== undefined ? inputs[activeInput.id] : activeInput.defaultValue;
  const currentX = Number(rawCurrent);
  if (!Number.isFinite(currentX)) return null;

  const currentRes = spec.calculate(inputs);
  if (currentRes.error) return null;
  const currentY = parseChartNumericValue(currentRes.primaryOutput ?? currentRes.primaryValue);
  if (currentY === null) return null;

  const stepCount = 12;
  const minLimit = activeInput.min !== undefined ? activeInput.min : -Infinity;
  const maxLimit = activeInput.max !== undefined ? activeInput.max : Infinity;
  const numericStep = activeInput.step !== undefined ? Number(activeInput.step) : NaN;

  let low: number;
  let high: number;

  if (Math.abs(currentX) < 1e-9) {
    const stepBase = Number.isFinite(numericStep) && numericStep > 0 ? numericStep * 5 : 10;
    low = Math.max(minLimit, minLimit >= 0 ? minLimit : -stepBase);
    high = Math.min(maxLimit, stepBase);
  } else if (currentX > 0) {
    low = Math.max(minLimit, currentX * 0.4);
    high = Math.min(maxLimit, currentX * 1.6);
  } else {
    low = Math.max(minLimit, currentX * 1.6);
    high = Math.min(maxLimit, currentX * 0.4);
  }

  if (low >= high) {
    low = Math.max(minLimit, currentX - 10);
    high = Math.min(maxLimit, currentX + 10);
  }
  if (low >= high) return null;

  const rawSamples: number[] = [];
  for (let i = 0; i <= stepCount; i++) {
    const sample = low + ((high - low) * i) / stepCount;
    rawSamples.push(sample);
  }

  // Ensure exact currentX is present as one plotted point
  let closestIdx = 0;
  let minDist = Infinity;
  rawSamples.forEach((v, idx) => {
    const d = Math.abs(v - currentX);
    if (d < minDist) {
      minDist = d;
      closestIdx = idx;
    }
  });
  rawSamples[closestIdx] = currentX;

  const points: SensitivityPoint[] = [];
  for (let i = 0; i < rawSamples.length; i++) {
    const sampleX = rawSamples[i];
    const roundedX =
      Number.isFinite(numericStep) && numericStep >= 1
        ? i === closestIdx
          ? currentX
          : Math.round(sampleX)
        : Number(sampleX.toFixed(6));

    try {
      const simRes = spec.calculate({ ...inputs, [activeInput.id]: roundedX });
      if (simRes.error) continue;
      const yVal = parseChartNumericValue(simRes.primaryOutput ?? simRes.primaryValue);
      if (yVal === null || !Number.isFinite(yVal)) continue;

      points.push({
        x: roundedX,
        xLabel: formatAxisTick(roundedX),
        y: yVal,
        isCurrent: i === closestIdx,
      });
    } catch {
      // Skip domain boundary errors cleanly
    }
  }

  if (points.length < 2) return null;

  return {
    points,
    input: activeInput,
    currentX,
    currentY,
    yLabel: currentRes.primaryUnit || currentRes.primaryLabel || 'Output',
  };
}

export interface ScientificPlotPoint {
  x: number;
  xLabel: string;
  y: number;
  isCurrent: boolean;
}

export interface ScientificPlotResult {
  points: ScientificPlotPoint[];
  sweepLabel: string;
  sweptExprTemplate: string;
  currentX: number;
  currentY: number;
}

/**
 * Inspects a scientific expression (e.g., "sin(45)", "2*sqrt(16)", "log(100)")
 * and varies the primary numeric operand across a smooth mathematical domain
 * so the chart updates dynamically with the user's expression and angle mode.
 */
export function buildScientificPlotSeries(
  expression: string,
  angleMode: AngleMode,
  ans: number
): ScientificPlotResult | null {
  const trimmed = expression.trim();
  if (!trimmed) return null;

  const currentY = evaluateScientificExpression(trimmed, angleMode, ans);
  if (!Number.isFinite(currentY)) return null;

  // Prefer the number inside a function call like sin(45), otherwise the first numeric literal
  const fnArgMatch = trimmed.match(/\b(a?sinh?|a?cosh?|a?tanh?|log|ln|exp|sqrt|cbrt|abs)\(\s*([+-]?(?:\d+\.?\d*|\.\d+))/i);
  const firstNumMatch = trimmed.match(/([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)/i);

  let targetStart: number;
  let targetLength: number;
  let currentX: number;
  let fnName = '';

  if (fnArgMatch && fnArgMatch.index !== undefined) {
    fnName = fnArgMatch[1].toLowerCase();
    const numStr = fnArgMatch[2];
    targetStart = fnArgMatch.index + fnArgMatch[0].indexOf(numStr);
    targetLength = numStr.length;
    currentX = Number(numStr);
  } else if (firstNumMatch && firstNumMatch.index !== undefined) {
    const numStr = firstNumMatch[1];
    targetStart = firstNumMatch.index;
    targetLength = numStr.length;
    currentX = Number(numStr);
  } else {
    return null;
  }

  if (!Number.isFinite(currentX)) return null;

  const prefix = trimmed.slice(0, targetStart);
  const suffix = trimmed.slice(targetStart + targetLength);
  const sweptExprTemplate = `${prefix}x${suffix}`;

  let minX: number;
  let maxX: number;
  const totalSamples = 40;

  if (fnName === 'sin' || fnName === 'cos' || fnName === 'tan') {
    const halfSpan = angleMode === 'deg' ? 180 : Math.PI;
    minX = currentX - halfSpan;
    maxX = currentX + halfSpan;
  } else if (fnName === 'asin' || fnName === 'acos') {
    minX = -1;
    maxX = 1;
  } else if (fnName === 'log' || fnName === 'ln' || fnName === 'sqrt') {
    const upper = currentX > 0 ? Math.max(10, currentX * 2) : 10;
    minX = upper / totalSamples;
    maxX = upper;
  } else if (Math.abs(currentX) < 1e-9) {
    minX = -10;
    maxX = 10;
  } else {
    const span = Math.max(5, Math.abs(currentX) * 0.75);
    minX = currentX - span;
    maxX = currentX + span;
  }

  const samples: number[] = [];
  for (let i = 0; i <= totalSamples; i++) {
    samples.push(minX + ((maxX - minX) * i) / totalSamples);
  }

  // Snap closest sample to exact currentX
  let closestIdx = 0;
  let bestDiff = Infinity;
  samples.forEach((v, idx) => {
    const d = Math.abs(v - currentX);
    if (d < bestDiff) {
      bestDiff = d;
      closestIdx = idx;
    }
  });
  samples[closestIdx] = currentX;

  const points: ScientificPlotPoint[] = [];
  for (let i = 0; i < samples.length; i++) {
    const xVal = samples[i];
    const exprWithSample = `${prefix}(${Number(xVal.toFixed(6))})${suffix}`;
    try {
      const yVal = evaluateScientificExpression(exprWithSample, angleMode, ans);
      // Clip tan() asymptotes cleanly
      if (!Number.isFinite(yVal) || Math.abs(yVal) > 1e6) continue;
      points.push({
        x: xVal,
        xLabel: formatAxisTick(xVal),
        y: yVal,
        isCurrent: i === closestIdx,
      });
    } catch {
      // Skip invalid domain samples
    }
  }

  if (points.length < 3) return null;

  return {
    points,
    sweepLabel: fnName ? `${fnName}(x) sweep` : 'Expression curve (x)',
    sweptExprTemplate,
    currentX,
    currentY,
  };
}
