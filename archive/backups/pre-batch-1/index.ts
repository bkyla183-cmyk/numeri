import calcCategoriesRaw from './calcCategoriesData.json';
import allCalculatorsRaw from './allCalculatorsData.json';
import blogCategoriesRaw from './blogCategoriesData.json';
import postsRaw from './postsData.json';
import { BlogPost, BlogCategory, CalculatorCategory, CalculatorItem } from '../types';

// Active curated catalog of calculators across defined categories
export const calculators: CalculatorItem[] = allCalculatorsRaw.map((c: any) => ({
  id: c.id,
  name: c.name,
  slug: c.slug,
  description: c.description,
  category_slug: c.category_slug,
  formula: c.formula || '',
  is_featured: !!c.is_featured,
  is_popular: !!c.is_popular,
  sort_order: Number(c.sort_order) || 99,
  meta_title: c.meta_title || `${c.name} - Free Online Calculator`,
  meta_description: c.meta_description || c.description,
}));

const liveCategoryCounts: Record<string, number> = calculators.reduce((acc, calc) => {
  acc[calc.category_slug] = (acc[calc.category_slug] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

export const calcCategories: CalculatorCategory[] = calcCategoriesRaw.map((c) => ({
  id: c.id,
  name: c.name,
  slug: c.slug,
  description: c.description,
  icon: c.icon || '🔢',
  color: c.color || 'blue',
  calculator_count: liveCategoryCounts[c.slug] ?? (Number(c.calculator_count) || 0),
  sort_order: Number(c.sort_order) || 99,
}));

export const blogCategories: BlogCategory[] = blogCategoriesRaw.map((b) => ({
  id: b.id,
  name: b.name,
  slug: b.slug,
  description: b.description,
  image: b.image || '',
}));

export const posts: BlogPost[] = postsRaw.map((p) => ({
  id: p.id,
  title: p.title,
  slug: p.slug,
  content: p.content,
  excerpt: p.excerpt,
  featured_image: p.featured_image || '',
  images: p.images || '',
  author: p.author || 'Numeriq Editorial Team',
  author_avatar: p.author_avatar || '',
  created_at: p.created_at || '2024-11-15T10:00:00Z',
  published_at: p.published_at || '2024-11-15T10:00:00Z',
  updated_at: p.updated_at || '',
  tags: p.tags || '',
  categories: p.categories || 'Guides',
  read_time: Number(p.read_time) || 6,
  view_count: Number(p.view_count) || 1240,
  featured: p.featured === 'true',
  published: p.published !== 'false',
  meta_description: p.meta_description || p.excerpt,
  meta_keywords: p.meta_keywords || '',
}));

// Mapping helper from blog post slug / category to related calculator slug
export function getRelatedCalculatorForPost(postSlug: string): CalculatorItem | undefined {
  const mapping: Record<string, string> = {
    'how-to-calculate-bmi-complete-guide': 'bmi-calculator',
    'how-to-use-bmi-calculator': 'bmi-calculator',
    'compound-interest-explained-8th-wonder': 'compound-interest-calculator',
    'how-to-calculate-compound-interest-step-by-step': 'compound-interest-calculator',
    'compound-interest-explained': 'compound-interest-calculator',
    'how-to-calculate-tdee-for-weight-loss': 'calorie-calculator',
    'calorie-calculator-daily-needs': 'calorie-calculator',
    'calorie-deficit-calculator-weight-loss': 'calorie-calculator',
    'mortgage-calculator-guide-how-much-house': 'mortgage-calculator',
    'mortgage-calculator-monthly-payments': 'mortgage-calculator',
    'how-to-pay-off-mortgage-faster': 'mortgage-calculator',
    'gpa-calculator-how-to-calculate-grade-point-average': 'gpa-calculator',
    'gpa-calculator-guide': 'gpa-calculator',
    'how-to-raise-gpa-before-graduation': 'gpa-calculator',
    'understanding-percentage-calculations-daily-life': 'percentage-calculator',
    'percentage-calculator-guide': 'percentage-calculator',
    'how-to-use-loan-emi-calculator': 'loan-calculator',
    'loan-amortization-explained': 'loan-calculator',
    'loan-calculator-apr-interest': 'loan-calculator',
    'body-fat-percentage-what-it-means-how-to-calculate': 'body-fat-calculator',
    'body-fat-percentage-calculator-healthy-ranges': 'body-fat-calculator',
    'sales-tax-calculator-guide-all-50-us-states': 'sales-tax-calculator',
    'tax-calculator-guide': 'income-tax-calculator',
    'federal-income-tax-calculator-2024': 'income-tax-calculator',
    'target-heart-rate-calculator': 'target-heart-rate-calculator',
    'currency-converter-guide': 'currency-converter',
    'currency-converter-exchange-rates-guide-2024': 'currency-converter',
    'retirement-calculator-how-much-needed': 'retirement-calculator',
    'retirement-calculator-how-much-to-retire': 'retirement-calculator',
    'unit-converter-metric-imperial': 'unit-converter',
    'metric-to-imperial-unit-conversion-guide': 'unit-converter',
    'due-date-calculator-pregnancy-guide': 'due-date-calculator',
    'pregnancy-due-date-calculator-guide': 'due-date-calculator',
    'tip-calculator-how-much-to-tip': 'tip-calculator',
    'savings-account-interest-calculator-guide': 'compound-interest-calculator',
    'credit-card-payoff-calculator-debt-strategies': 'credit-card-payoff-calculator',
    'running-pace-calculator-training-guide': 'running-pace-calculator',
    'roi-calculator-investment-returns-guide': 'roi-calculator',
    'scientific-calculator-tips': 'scientific-calculator',
    'scientific-calculator-functions-guide': 'scientific-calculator',
    'water-intake-calculator-daily-hydration-guide': 'water-intake-calculator',
    'student-loan-calculator-payoff-strategies': 'student-loan-calculator',
    'ideal-weight-calculator-healthy-weight-guide': 'ideal-weight-calculator',
    'solar-panel-calculator-savings-guide': 'solar-panel-calculator',
    'standard-deviation-calculator-statistics-guide': 'standard-deviation-calculator',
  };

  const targetSlug = mapping[postSlug];
  if (targetSlug) {
    return calculators.find((c) => c.slug === targetSlug);
  }
  return undefined;
}

export function getRelatedPostsForCalculator(calculatorSlug: string): BlogPost[] {
  return posts.filter(p => {
    const relCalc = getRelatedCalculatorForPost(p.slug);
    return relCalc?.slug === calculatorSlug;
  });
}

/**
 * Returns all other calculators within the same category for deep contextual internal linking
 */
export function getCalculatorsInCategory(categorySlug: string, currentSlug?: string): CalculatorItem[] {
  return calculators.filter((c) => c.category_slug === categorySlug && c.slug !== currentSlug);
}

/**
 * Returns cross-category companion tools that complement the current calculator
 */
export function getCompanionCalculators(currentSlug: string, categorySlug: string, limit = 8): CalculatorItem[] {
  return calculators
    .filter((c) => c.slug !== currentSlug && c.category_slug !== categorySlug && (c.is_popular || c.is_featured))
    .slice(0, limit);
}

/**
 * Returns the top popular verified calculators across Numeriq
 */
export function getTopPopularCalculators(limit = 12): CalculatorItem[] {
  return calculators.filter((c) => c.is_popular).slice(0, limit);
}
