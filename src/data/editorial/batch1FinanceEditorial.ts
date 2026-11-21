import type { EditorialSection } from '../calculatorEditorial.ts';
import { batch1FinanceEditorialPart1 } from './batch1FinanceEditorialPart1.ts';
import { batch1FinanceEditorialPart2 } from './batch1FinanceEditorialPart2.ts';

export const batch1FinanceEditorial: Record<string, EditorialSection> = {
  ...batch1FinanceEditorialPart1,
  ...batch1FinanceEditorialPart2,
};
