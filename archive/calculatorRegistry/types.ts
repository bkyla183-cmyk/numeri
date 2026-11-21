export type InputType = 'number' | 'select' | 'text' | 'date';

export interface SelectOption {
  label: string;
  value: string;
}

export interface InputDef {
  id: string;
  label: string;
  type?: InputType;
  unit?: string;
  defaultValue: string | number;
  min?: number;
  max?: number;
  step?: string | number;
  options?: SelectOption[];
  placeholder?: string;
  helpText?: string;
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
