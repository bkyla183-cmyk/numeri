import { CalculatorSpec } from './types';
import { activeFinanceBusinessSpecs } from './activeFinanceBusinessSpecs';
import { activeMathStatsGeoSpecs } from './activeMathStatsGeoSpecs';
import { activeHealthSpecs } from './activeHealthSpecs';
import { activeUtilityDomainSpecs } from './activeUtilityDomainSpecs';
import { batch1FinanceSpecs } from './batch1FinanceSpecs';
import { batch2DebtMortgageSpecs } from './batch2DebtMortgageSpecs';
import { batch2TaxBusinessSpecs } from './batch2TaxBusinessSpecs';
import { batch3HealthSpecs } from './batch3HealthSpecs';
import { batch3EngineeringStatsSpecs } from './batch3EngineeringStatsSpecs';
import { batch4FinanceSpecs } from './batch4FinanceSpecs';
import { batch4BusinessTaxSpecs } from './batch4BusinessTaxSpecs';
import { batch4MathSpecs } from './batch4MathSpecs';
import { batch4GeometrySpecs } from './batch4GeometrySpecs';
import { batch4StatsSpecs } from './batch4StatsSpecs';
import { batch4DateEduSpecs } from './batch4DateEduSpecs';
import { batch4HealthSpecs } from './batch4HealthSpecs';
import { batch4ScienceSpecs } from './batch4ScienceSpecs';
import { batch4UnitConverterSpecs } from './batch4UnitConverterSpecs';
import { batch4HomeTechSpecs } from './batch4HomeTechSpecs';

export * from './types';

export const allCalculatorSpecs: CalculatorSpec[] = [
  ...activeFinanceBusinessSpecs,
  ...batch1FinanceSpecs,
  ...batch2DebtMortgageSpecs,
  ...batch2TaxBusinessSpecs,
  ...batch4FinanceSpecs,
  ...batch4BusinessTaxSpecs,
  ...activeMathStatsGeoSpecs,
  ...batch3EngineeringStatsSpecs,
  ...batch4MathSpecs,
  ...batch4GeometrySpecs,
  ...batch4StatsSpecs,
  ...activeHealthSpecs,
  ...batch3HealthSpecs,
  ...batch4HealthSpecs,
  ...activeUtilityDomainSpecs,
  ...batch4DateEduSpecs,
  ...batch4ScienceSpecs,
  ...batch4UnitConverterSpecs,
  ...batch4HomeTechSpecs,
];

const specMap = new Map<string, CalculatorSpec>();
for (const spec of allCalculatorSpecs) {
  specMap.set(spec.slug, spec);
}

export function getCalculatorSpec(slug: string): CalculatorSpec | undefined {
  return specMap.get(slug);
}

export function getAllCalculatorSpecs(): CalculatorSpec[] {
  return allCalculatorSpecs;
}
