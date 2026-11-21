import { EditorialSection } from '../calculatorEditorial.ts';
import { batch4FinanceBusinessEditorial } from './batch4FinanceBusinessEditorial.ts';
import { batch4MathStatsGeoEduDateEditorial } from './batch4MathStatsGeoEduDateEditorial.ts';
import { batch4HealthScienceConvHomeEditorial } from './batch4HealthScienceConvHomeEditorial.ts';

export const batch4Editorial: Record<string, EditorialSection> = {
  ...batch4FinanceBusinessEditorial,
  ...batch4MathStatsGeoEduDateEditorial,
  ...batch4HealthScienceConvHomeEditorial,
};
