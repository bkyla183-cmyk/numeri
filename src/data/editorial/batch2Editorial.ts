import { EditorialSection } from '../calculatorEditorial.ts';
import { batch2DebtMortgageEditorial } from './batch2DebtMortgageEditorial.ts';
import { batch2TaxBusinessEditorial } from './batch2TaxBusinessEditorial.ts';

export const batch2Editorial: Record<string, EditorialSection> = {
  ...batch2DebtMortgageEditorial,
  ...batch2TaxBusinessEditorial,
};
