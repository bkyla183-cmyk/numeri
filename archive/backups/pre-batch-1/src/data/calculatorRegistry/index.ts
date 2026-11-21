import { CalculatorSpec } from './types';
import { activeFinanceBusinessSpecs } from './activeFinanceBusinessSpecs';
import { activeMathStatsGeoSpecs } from './activeMathStatsGeoSpecs';
import { activeHealthSpecs } from './activeHealthSpecs';
import { activeUtilityDomainSpecs } from './activeUtilityDomainSpecs';

export * from './types';

export const allCalculatorSpecs: CalculatorSpec[] = [
  ...activeFinanceBusinessSpecs,
  ...activeMathStatsGeoSpecs,
  ...activeHealthSpecs,
  ...activeUtilityDomainSpecs,
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
