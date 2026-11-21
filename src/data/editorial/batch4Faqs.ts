import type { FAQItem } from '../calculatorFaqs.ts';
import { batch4FaqsPart1 } from './batch4FaqsPart1.ts';
import { batch4FaqsPart2 } from './batch4FaqsPart2.ts';
import { batch4FaqsPart3 } from './batch4FaqsPart3.ts';

export const batch4Faqs: Record<string, FAQItem[]> = {
  ...batch4FaqsPart1,
  ...batch4FaqsPart2,
  ...batch4FaqsPart3,
};
