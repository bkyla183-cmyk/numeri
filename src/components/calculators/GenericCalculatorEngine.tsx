import React, { useState, useEffect, useMemo, useId } from 'react';
import { Copy, Check, RotateCcw, Calculator, CheckCircle2, AlertTriangle, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { CalculatorItem } from '../../types';
import { getCalculatorSpec, CalculatorSpec, CalculationResult, InputDef } from '../../data/calculatorRegistry';
import { getCalculatorEditorial } from '../../data/calculatorEditorial';
import { FormulaHoverHighlight, FormulaVariableChip } from './FormulaHoverHighlight';
import { AutoUnitConversionSuggestions } from './AutoUnitConversionSuggestions';
import { AutoDetectCandidate } from '../../utils/unitAutoDetector';
import { useRoundingPrecision } from '../../context/RoundingPrecisionContext';
import { formatGenericOutputWithPrecision } from '../../utils/roundingPrecision';
import { ResultViewToggle, ResultViewMode } from './ResultViewToggle';
import { GenericInteractiveChart } from './GenericInteractiveChart';
import { isChartEligibleCalculator, parseChartNumericValue } from '../../utils/chartBuilder';
import { useComparisonPaneReporter } from '../../context/ComparisonContext';

interface Props {
  calculator: CalculatorItem;
}

export const GenericCalculatorEngine: React.FC<Props> = ({ calculator }) => {
  const instanceUid = useId();
  const { precision } = useRoundingPrecision();
  const [copied, setCopied] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [hoveredMetricIdx, setHoveredMetricIdx] = useState<number | null>(null);
  const [resultViewMode, setResultViewMode] = useState<ResultViewMode>('text');
  const isChartEligible = isChartEligibleCalculator(calculator.slug, calculator.category_slug);
  const spec: CalculatorSpec | undefined = useMemo(() => getCalculatorSpec(calculator.slug), [calculator.slug]);
  const editorial = useMemo(
    () => getCalculatorEditorial(calculator.slug, calculator.name, calculator.category_slug, calculator.formula),
    [calculator.slug, calculator.name, calculator.category_slug, calculator.formula]
  );

  const defaultValues = useMemo(() => {
    if (!spec) return { val1: 10, val2: 5 };
    const initial: Record<string, any> = {};
    for (const input of spec.inputs) {
      initial[input.id] = input.defaultValue;
    }
    return initial;
  }, [spec]);

  const [inputs, setInputs] = useState<Record<string, any>>(defaultValues);

  useEffect(() => {
    setInputs(defaultValues);
    setShowAdvanced(false);
    setResultViewMode('text');
  }, [defaultValues]);

  const handleInputChange = (id: string, value: any, type: string) => {
    setInputs((prev) => ({
      ...prev,
      [id]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  const handleReset = () => {
    setInputs(defaultValues);
  };

  const copyResult = (text: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const calculation: CalculationResult = useMemo(() => {
    if (!spec) {
      const v1 = Number(inputs.val1) || 0;
      const v2 = Number(inputs.val2) || 0;
      return {
        primaryOutput: parseFloat((v1 + v2).toFixed(2)),
        primaryUnit: 'Result',
        steps: [`Calculation: ${v1} + ${v2} = ${v1 + v2}`],
      };
    }

    try {
      return spec.calculate(inputs);
    } catch {
      return {
        primaryOutput: 'Error',
        primaryUnit: 'Invalid Input',
        error: 'Please enter valid input values within domain limits.',
        steps: ['Please enter valid input values within domain limits.'],
      };
    }
  }, [spec, inputs]);

  const { primaryInputs, advancedInputs } = useMemo(() => {
    const all = spec?.inputs || [];
    const mergedValues = { ...defaultValues, ...inputs };
    const visible = all.filter((inp) => (!inp.visibleWhen ? true : inp.visibleWhen(mergedValues)));
    return {
      primaryInputs: visible.filter((inp) => !inp.advanced),
      advancedInputs: visible.filter((inp) => Boolean(inp.advanced)),
    };
  }, [spec, defaultValues, inputs]);

  useComparisonPaneReporter(
    calculation.error
      ? null
      : {
          slug: calculator.slug,
          name: calculator.name,
          categorySlug: calculator.category_slug,
          primaryLabel: calculation.primaryLabel || calculation.primaryUnit || 'Result',
          primaryDisplay: formatGenericOutputWithPrecision(
            calculation.primaryOutput ?? calculation.primaryValue ?? '',
            precision,
            4
          ),
          primaryUnit: calculation.primaryUnit,
          metrics: (calculation.secondaryOutputs || []).slice(0, 4).map((m) => {
            const display = `${formatGenericOutputWithPrecision(m.value, precision, 4)}${
              m.unit ? ` ${m.unit}` : ''
            }`;
            return {
              label: m.label,
              display,
              numeric: parseChartNumericValue(m.value),
            };
          }),
        }
  );

  const renderInputField = (input: InputDef) => {
    const fieldId = `${instanceUid}-${input.id}`;
    const val = inputs[input.id] !== undefined ? inputs[input.id] : input.defaultValue;
    const unitLen = input.unit ? input.unit.length : 0;
    const unitPadClass =
      unitLen === 0 ? 'pr-4' : unitLen <= 3 ? 'pr-12' : unitLen <= 6 ? 'pr-16' : 'pr-24';
    const prefixPadClass = input.prefix ? 'pl-8' : 'pl-4';
    const isFullWidth = input.type === 'textarea';

    return (
      <div key={input.id} className={`space-y-1.5 ${isFullWidth ? 'md:col-span-2' : ''}`}>
        <div className="flex items-center justify-between text-xs gap-2">
          <label htmlFor={fieldId} className="font-semibold text-slate-700 dark:text-slate-300">
            {input.label}
          </label>
          {input.unit && (
            <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 uppercase shrink-0">
              {input.unit}
            </span>
          )}
        </div>

        {input.type === 'select' ? (
          <select
            id={fieldId}
            value={val}
            onChange={(e) => handleInputChange(input.id, e.target.value, 'select')}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          >
            {input.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : input.type === 'textarea' ? (
          <textarea
            id={fieldId}
            rows={input.rows || 4}
            value={val}
            placeholder={input.placeholder}
            onChange={(e) => handleInputChange(input.id, e.target.value, 'textarea')}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-y"
          />
        ) : input.type === 'date' ? (
          <input
            id={fieldId}
            type="date"
            value={val}
            onChange={(e) => handleInputChange(input.id, e.target.value, 'date')}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        ) : input.type === 'time' ? (
          <input
            id={fieldId}
            type="time"
            value={val}
            onChange={(e) => handleInputChange(input.id, e.target.value, 'time')}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        ) : input.type === 'text' ? (
          <input
            id={fieldId}
            type="text"
            value={val}
            placeholder={input.placeholder}
            onChange={(e) => handleInputChange(input.id, e.target.value, 'text')}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        ) : (
          <div className="relative">
            {input.prefix && (
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 dark:text-slate-500 pointer-events-none">
                {input.prefix}
              </span>
            )}
            <input
              id={fieldId}
              type="number"
              step={input.step || 'any'}
              min={input.min}
              max={input.max}
              value={val}
              placeholder={input.placeholder}
              onChange={(e) => handleInputChange(input.id, e.target.value, 'number')}
              className={`w-full ${prefixPadClass} ${unitPadClass} py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/40 tabular-nums`}
            />
            {input.unit && (
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 dark:text-slate-500 pointer-events-none">
                {input.unit}
              </span>
            )}
          </div>
        )}

        {input.helpText && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
            {input.helpText}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        {/* Header toolbar */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-semibold text-sm">
            <Calculator className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Interactive Calculation Engine</span>
          </div>
          <button
            onClick={handleReset}
            type="button"
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer font-medium"
            title="Reset to default benchmark values"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Inputs</span>
          </button>
        </div>

        {/* Dynamic Inputs Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {primaryInputs.map(renderInputField)}
        </div>

        {/* Collapsible Advanced Inputs */}
        {advancedInputs.length > 0 && (
          <div className="border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              aria-expanded={showAdvanced}
              className="w-full px-4 py-3 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Advanced Options ({advancedInputs.length})</span>
              </span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
              />
            </button>
            {showAdvanced && (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-5 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800">
                {advancedInputs.map(renderInputField)}
              </div>
            )}
          </div>
        )}

        {/* Inline Validation / Domain Error Banner */}
        {calculation.error && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/70 flex items-start gap-3 text-xs text-rose-800 dark:text-rose-200"
          >
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block">Input Validation Notice</strong>
              <span>{calculation.error}</span>
            </div>
          </div>
        )}

        {/* Result View Mode Toggle (Financial & Scientific Calculators) */}
        {isChartEligible && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Result Representation
            </span>
            <ResultViewToggle mode={resultViewMode} onChange={setResultViewMode} />
          </div>
        )}

        {/* Primary Output Display or Live Interactive Chart */}
        {(() => {
          const displayValue = calculation.primaryOutput ?? calculation.primaryValue ?? 0;
          const displayUnit = calculation.primaryUnit ?? calculation.primaryLabel ?? 'Calculated Result';
          const formattedValue = formatGenericOutputWithPrecision(displayValue, precision, 6);

          if (isChartEligible && resultViewMode === 'chart') {
            return (
              <GenericInteractiveChart
                spec={spec}
                inputs={inputs}
                calculation={calculation}
                calculatorName={calculator.name}
                formattedPrimaryValue={formattedValue}
                primaryUnitLabel={displayUnit}
              />
            );
          }

          const activeFormula =
            calculation.formulaUsed ||
            spec?.formulaDisplay ||
            editorial.formulaDisplay.formula ||
            calculator.formula ||
            '';

          const allVisibleInputs = [...primaryInputs, ...advancedInputs];
          const varDefs = editorial.formulaDisplay.variableDefinitions || [];
          const formulaVariables: FormulaVariableChip[] =
            varDefs.length > 0
              ? varDefs.slice(0, 6).map((vd, i) => {
                  const matchedInput =
                    allVisibleInputs.find((inp) => {
                      const lbl = inp.label.toLowerCase();
                      const nm = vd.name.toLowerCase();
                      return (
                        lbl === nm ||
                        lbl.includes(nm) ||
                        nm.includes(lbl.split('(')[0].trim())
                      );
                    }) || allVisibleInputs[i];
                  const val = matchedInput
                    ? inputs[matchedInput.id] !== undefined
                      ? inputs[matchedInput.id]
                      : matchedInput.defaultValue
                    : undefined;
                  return {
                    symbol: vd.symbol,
                    name: vd.name,
                    value: val,
                    unit: vd.unit || matchedInput?.unit,
                  };
                })
              : allVisibleInputs.slice(0, 5).map((inp) => ({
                  symbol: inp.label.split('(')[0].trim(),
                  name: inp.label,
                  value: inputs[inp.id] !== undefined ? inputs[inp.id] : inp.defaultValue,
                  unit: inp.unit,
                }));

          const hoveredMetric =
            hoveredMetricIdx !== null && calculation.secondaryOutputs
              ? calculation.secondaryOutputs[hoveredMetricIdx]
              : undefined;

          const matchedMetricStep =
            hoveredMetric && calculation.steps && calculation.steps.length > 0
              ? calculation.steps.find((st) => {
                  const words = hoveredMetric.label
                    .toLowerCase()
                    .split(/[^a-z0-9]+/)
                    .filter((w) => w.length >= 3);
                  return words.some((w) => st.toLowerCase().includes(w));
                })
              : undefined;

          return (
            <FormulaHoverHighlight
              formula={activeFormula}
              formulaLabel={
                hoveredMetric
                  ? `${hoveredMetric.label} Derivation`
                  : `${calculator.name.replace(/\s+Calculator$/i, '')} Formula`
              }
              variables={formulaVariables}
              activeStep={matchedMetricStep || calculation.steps?.[0]}
              accent="teal"
            >
              <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-sky-50 dark:from-slate-800/90 dark:via-slate-800/70 dark:to-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 block mb-1">
                    {displayUnit}
                  </span>
                  <div className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums tracking-tight">
                    {formattedValue}
                  </div>
                </div>

                {!calculation.error && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => copyResult(String(formattedValue))}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs cursor-pointer transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Result</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </FormulaHoverHighlight>
          );
        })()}

        {/* Secondary Detailed Outputs */}
        {!(isChartEligible && resultViewMode === 'chart') &&
          !calculation.error &&
          calculation.secondaryOutputs &&
          calculation.secondaryOutputs.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Detailed Metrics Breakdown
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {calculation.secondaryOutputs.map((item, idx) => {
                const isMetricHovered = hoveredMetricIdx === idx;
                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredMetricIdx(idx)}
                    onMouseLeave={() => setHoveredMetricIdx(null)}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between transition-colors duration-150 ${
                      isMetricHovered
                        ? 'bg-teal-50/70 dark:bg-teal-950/30 border-teal-400 dark:border-teal-600'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/70 dark:border-slate-700/60'
                    }`}
                  >
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mb-1">
                      {item.label}
                    </span>
                    <div className="text-sm font-bold font-mono text-slate-800 dark:text-slate-100 tabular-nums">
                      {formatGenericOutputWithPrecision(item.value, precision, 4)}
                      {item.unit ? ` ${item.unit}` : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Auto-Detected Unit Conversion Suggestions */}
        {!calculation.error && (() => {
          const allVisibleInputs = [...primaryInputs, ...advancedInputs];
          const primaryRawValue = calculation.primaryOutput ?? calculation.primaryValue;
          const primaryRawUnit = calculation.primaryUnit ?? calculation.primaryLabel ?? '';
          const candidates: AutoDetectCandidate[] = [];

          if (primaryRawValue !== undefined && primaryRawValue !== null) {
            candidates.push({
              source: 'output',
              label: primaryRawUnit || 'Primary Result',
              value: primaryRawValue,
              unit: primaryRawUnit,
            });
          }

          if (calculation.secondaryOutputs) {
            for (const sec of calculation.secondaryOutputs) {
              candidates.push({
                source: 'output',
                label: sec.label,
                value: sec.value,
                unit: sec.unit,
              });
            }
          }

          for (const inp of allVisibleInputs) {
            if (inp.type === 'date' || inp.type === 'time' || inp.type === 'textarea') continue;
            const rawVal = inputs[inp.id] !== undefined ? inputs[inp.id] : inp.defaultValue;
            candidates.push({
              source: 'input',
              label: inp.label,
              value: rawVal,
              unit: inp.unit,
              prefix: inp.prefix,
            });
          }

          return <AutoUnitConversionSuggestions candidates={candidates} />;
        })()}

        {/* Mathematical Step-by-Step Derivation */}
        {!(isChartEligible && resultViewMode === 'chart') &&
          calculation.steps &&
          calculation.steps.length > 0 && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>Step-by-Step Solution Breakdown</span>
            </div>
            <ol className="space-y-2 text-xs font-mono text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800">
              {calculation.steps.map((step, idx) => {
                const hoveredMetric =
                  hoveredMetricIdx !== null && calculation.secondaryOutputs
                    ? calculation.secondaryOutputs[hoveredMetricIdx]
                    : undefined;
                const isStepHighlighted =
                  hoveredMetric &&
                  hoveredMetric.label
                    .toLowerCase()
                    .split(/[^a-z0-9]+/)
                    .filter((w) => w.length >= 3)
                    .some((w) => step.toLowerCase().includes(w));

                return (
                  <li
                    key={idx}
                    className={`flex items-start gap-2 rounded-md px-2 py-1 transition-colors duration-150 ${
                      isStepHighlighted
                        ? 'bg-teal-100/80 dark:bg-teal-900/40 text-slate-900 dark:text-white'
                        : hoveredMetric
                          ? 'opacity-60'
                          : ''
                    }`}
                  >
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 shrink-0">{idx + 1}.</span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};
