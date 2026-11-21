export type InputType = 'number' | 'select' | 'text' | 'date' | 'textarea' | 'time';

export interface SelectOption {
  label: string;
  value: string;
}

export interface InputDef {
  id: string;
  label: string;
  type?: InputType;
  unit?: string;
  prefix?: string;
  defaultValue: string | number;
  min?: number;
  max?: number;
  step?: string | number;
  options?: SelectOption[];
  placeholder?: string;
  helpText?: string;
  rows?: number;
  advanced?: boolean;
  visibleWhen?: (values: Record<string, any>) => boolean;
}

export interface SecondaryOutput {
  label: string;
  value: string | number;
  unit?: string;
  description?: string;
}

export interface CalculationResult {
  primaryValue?: string | number;
  primaryOutput?: string | number;
  primaryUnit?: string;
  primaryLabel?: string;
  secondaryOutputs?: SecondaryOutput[];
  steps?: string[];
  formulaUsed?: string;
  notes?: string;
  isError?: boolean;
  error?: string;
  errorMessage?: string;
}

export interface CalculatorSpec {
  slug: string;
  title?: string;
  description?: string;
  category?: string;
  formulaDisplay?: string;
  inputs: InputDef[];
  calculate: (values: Record<string, any>) => CalculationResult;
}
