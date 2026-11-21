import { EditorialSection } from '../calculatorEditorial.ts';
import { batch3HealthEditorial } from './batch3HealthEditorial.ts';
import { batch3EngineeringStatsEditorial } from './batch3EngineeringStatsEditorial.ts';

export const batch3Editorial: Record<string, EditorialSection> = {
  ...batch3HealthEditorial,
  ...batch3EngineeringStatsEditorial,
};
