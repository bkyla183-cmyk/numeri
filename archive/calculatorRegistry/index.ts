import { CalculatorSpec } from './types';
import { mathSpecs } from './domainMath';
import { geometryAlgebraSpecs } from './domainGeometryAlgebra';
import { financeInvestmentSpecs } from './domainFinanceInvestment';
import { businessTaxSalarySpecs } from './domainBusinessTaxSalary';
import { healthFitnessSportsSpecs } from './domainHealthFitnessSports';
import { physicsChemBioSpecs } from './domainPhysicsChemistryBiology';
import { statisticsProbabilitySpecs } from './domainStatisticsProbability';
import { engineeringConstructionSpecs } from './domainEngineeringConstruction';
import { automotiveEnergySpecs } from './domainAutomotiveEnergy';
import { computingProgrammingSpecs } from './domainComputingProgramming';
import { convertersDateTimeSpecs } from './domainConvertersDateTime';
import { domainEducationCookingMarketing } from './domainEducationCookingMarketing';
import { domainLifestyleMisc } from './domainLifestyleMisc';

export * from './types';

// Master unified array of all domain calculator specifications
export const allCalculatorSpecs: CalculatorSpec[] = [
  ...mathSpecs,
  ...geometryAlgebraSpecs,
  ...financeInvestmentSpecs,
  ...businessTaxSalarySpecs,
  ...healthFitnessSportsSpecs,
  ...physicsChemBioSpecs,
  ...statisticsProbabilitySpecs,
  ...engineeringConstructionSpecs,
  ...automotiveEnergySpecs,
  ...computingProgrammingSpecs,
  ...convertersDateTimeSpecs,
  ...domainEducationCookingMarketing,
  ...domainLifestyleMisc,
];

// O(1) slug lookup map
const specMap = new Map<string, CalculatorSpec>();
for (const spec of allCalculatorSpecs) {
  specMap.set(spec.slug, spec);
}

/**
 * Retrieves a custom calculation specification by calculator slug
 */
export function getCalculatorSpec(slug: string): CalculatorSpec | undefined {
  return specMap.get(slug);
}

/**
 * Returns all registered calculator specifications
 */
export function getAllCalculatorSpecs(): CalculatorSpec[] {
  return allCalculatorSpecs;
}
