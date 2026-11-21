import { CalculatorItem } from '../types';

export const CALC_USAGE_STORAGE_KEY = 'numeriq_calc_usage';

export interface CalcUsageRecord {
  count: number;
  lastUsedAt: number;
}

export type CalcUsageMap = Record<string, CalcUsageRecord>;

export interface FeaturedTrendingEntry {
  calculator: CalculatorItem;
  usageCount: number;
  lastUsedAt: number;
  source: 'trending' | 'featured';
}

export function getUsageStats(): CalcUsageMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(CALC_USAGE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};

    const sanitized: CalcUsageMap = {};
    for (const [slug, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (!slug) continue;
      if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
        sanitized[slug] = { count: Math.floor(value), lastUsedAt: 0 };
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        const record = value as { count?: unknown; lastUsedAt?: unknown };
        const count = typeof record.count === 'number' && Number.isFinite(record.count) ? Math.floor(record.count) : 0;
        const lastUsedAt =
          typeof record.lastUsedAt === 'number' && Number.isFinite(record.lastUsedAt) ? record.lastUsedAt : 0;
        if (count > 0) {
          sanitized[slug] = { count, lastUsedAt };
        }
      }
    }
    return sanitized;
  } catch {
    return {};
  }
}

export function recordCalculatorUsage(slug: string, currentStats?: CalcUsageMap): CalcUsageMap {
  const base = currentStats ?? getUsageStats();
  if (!slug) return base;

  const existing = base[slug];
  const updated: CalcUsageMap = {
    ...base,
    [slug]: {
      count: (existing?.count ?? 0) + 1,
      lastUsedAt: Date.now(),
    },
  };

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(CALC_USAGE_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore storage quota or private-browsing errors cleanly
    }
  }

  return updated;
}

export function clearUsageStats(): CalcUsageMap {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(CALC_USAGE_STORAGE_KEY);
    } catch {
      // Ignore storage errors cleanly
    }
  }
  return {};
}

export function getFeaturedAndTrendingEntries(
  calculators: CalculatorItem[],
  usageStats: CalcUsageMap,
  limit = 6
): {
  entries: FeaturedTrendingEntry[];
  trendingEntries: FeaturedTrendingEntry[];
  featuredEntries: FeaturedTrendingEntry[];
  totalUses: number;
} {
  const activeBySlug = new Map<string, CalculatorItem>();
  for (const calc of calculators) {
    activeBySlug.set(calc.slug, calc);
  }

  let totalUses = 0;
  const trendingEntries: FeaturedTrendingEntry[] = [];

  for (const [slug, stat] of Object.entries(usageStats)) {
    const calc = activeBySlug.get(slug);
    if (!calc || !stat || stat.count <= 0) continue;
    totalUses += stat.count;
    trendingEntries.push({
      calculator: calc,
      usageCount: stat.count,
      lastUsedAt: stat.lastUsedAt,
      source: 'trending',
    });
  }

  trendingEntries.sort((a, b) => {
    if (b.usageCount !== a.usageCount) return b.usageCount - a.usageCount;
    if (b.lastUsedAt !== a.lastUsedAt) return b.lastUsedAt - a.lastUsedAt;
    return a.calculator.name.localeCompare(b.calculator.name);
  });

  const featuredEntries: FeaturedTrendingEntry[] = calculators
    .filter((c) => c.is_featured)
    .map((calc) => ({
      calculator: calc,
      usageCount: usageStats[calc.slug]?.count ?? 0,
      lastUsedAt: usageStats[calc.slug]?.lastUsedAt ?? 0,
      source: 'featured' as const,
    }));

  const selectedSlugs = new Set<string>();
  const combined: FeaturedTrendingEntry[] = [];

  for (const entry of trendingEntries) {
    if (combined.length >= limit) break;
    selectedSlugs.add(entry.calculator.slug);
    combined.push(entry);
  }

  for (const entry of featuredEntries) {
    if (combined.length >= limit) break;
    if (selectedSlugs.has(entry.calculator.slug)) continue;
    selectedSlugs.add(entry.calculator.slug);
    combined.push(entry);
  }

  if (combined.length < limit) {
    for (const calc of calculators) {
      if (combined.length >= limit) break;
      if (selectedSlugs.has(calc.slug)) continue;
      selectedSlugs.add(calc.slug);
      combined.push({
        calculator: calc,
        usageCount: 0,
        lastUsedAt: 0,
        source: 'featured',
      });
    }
  }

  return {
    entries: combined,
    trendingEntries,
    featuredEntries,
    totalUses,
  };
}
