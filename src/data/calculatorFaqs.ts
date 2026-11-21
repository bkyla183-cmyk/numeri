import { getCalculatorSpec } from './calculatorRegistry/index.ts';
import { calculatorFaqsPart1 } from './editorial/calculatorFaqsPart1.ts';
import { calculatorFaqsPart2 } from './editorial/calculatorFaqsPart2.ts';
import { batch1FinanceFaqs } from './editorial/batch1FinanceFaqs.ts';
import { batch2Faqs } from './editorial/batch2Faqs.ts';
import { batch3Faqs } from './editorial/batch3Faqs.ts';
import { batch4Faqs } from './editorial/batch4Faqs.ts';

export interface FAQItem {
  question: string;
  answer: string;
}

export const bespokeCalculatorFaqs: Record<string, FAQItem[]> = {
  ...calculatorFaqsPart1,
  ...calculatorFaqsPart2,
  ...batch1FinanceFaqs,
  ...batch2Faqs,
  ...batch3Faqs,
  ...batch4Faqs,
};

export function getFaqsForCalculator(slug: string, name: string, _category: string, formula?: string): FAQItem[] {
  if (bespokeCalculatorFaqs[slug]) {
    return bespokeCalculatorFaqs[slug];
  }

  const spec = getCalculatorSpec(slug);
  const cleanName = name.replace(/\s+Calculator$/i, '');
  const effectiveFormula = spec?.formulaDisplay || formula || 'standard analytical formulas';

  return [
    {
      question: `How does the ${name} compute its result?`,
      answer: `The ${name} applies ${effectiveFormula} client-side in your browser using IEEE 754 double-precision math.`,
    },
    {
      question: `What should I check before relying on ${cleanName} figures?`,
      answer: `Confirm that every input uses consistent units and review any jurisdiction-specific rules applicable to your situation.`,
    },
  ];
}
