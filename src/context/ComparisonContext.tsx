import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { calculators } from '../data';
import { parseChartNumericValue } from '../utils/chartBuilder';

export type ComparisonPaneId = 'left' | 'right';

export interface ComparisonMetricItem {
  label: string;
  display: string;
  numeric: number | null;
}

export interface ComparisonPaneSnapshot {
  slug: string;
  name: string;
  categorySlug: string;
  primaryLabel: string;
  primaryDisplay: string;
  primaryNumeric: number | null;
  primaryUnit?: string;
  metrics: ComparisonMetricItem[];
}

export interface ComparisonPreset {
  id: string;
  label: string;
  badge: string;
  leftSlug: string;
  rightSlug: string;
  summary: string;
}

export const COMPARISON_PRESETS: ComparisonPreset[] = [
  {
    id: 'loan-vs-savings',
    label: 'Loan vs. Savings',
    badge: 'Featured Finance',
    leftSlug: 'loan-calculator',
    rightSlug: 'savings-goal-calculator',
    summary: 'Compare monthly debt repayment outflow against recurring savings deposits.',
  },
  {
    id: 'mortgage-vs-compound',
    label: 'Mortgage vs. Compound Growth',
    badge: 'Housing vs. Investing',
    leftSlug: 'mortgage-calculator',
    rightSlug: 'compound-interest-calculator',
    summary: 'Contrast monthly PITI housing obligations with long-term portfolio compounding.',
  },
  {
    id: 'loan-vs-compound',
    label: 'Loan Cost vs. Investment Return',
    badge: 'Debt vs. Wealth',
    leftSlug: 'loan-calculator',
    rightSlug: 'compound-interest-calculator',
    summary: 'Weigh borrowing interest cost against compounded investment earnings.',
  },
  {
    id: 'mortgage-vs-rent-buy',
    label: 'Mortgage vs. Rent vs. Buy',
    badge: 'Real Estate',
    leftSlug: 'mortgage-calculator',
    rightSlug: 'rent-vs-buy-calculator',
    summary: 'Pair exact PITI amortization with multi-year rent-versus-buy break-even analysis.',
  },
  {
    id: 'debt-vs-emergency',
    label: 'Credit Card Payoff vs. Emergency Fund',
    badge: 'Cash Flow',
    leftSlug: 'credit-card-payoff-calculator',
    rightSlug: 'emergency-fund-calculator',
    summary: 'Balance aggressive debt payoff timelines against cash reserve targets.',
  },
];

export function getDefaultComparePair(sourceSlug?: string): { leftSlug: string; rightSlug: string } {
  if (!sourceSlug || !calculators.some((c) => c.slug === sourceSlug)) {
    return { leftSlug: 'loan-calculator', rightSlug: 'savings-goal-calculator' };
  }

  const pairOverrides: Record<string, string> = {
    'loan-calculator': 'savings-goal-calculator',
    'savings-goal-calculator': 'loan-calculator',
    'mortgage-calculator': 'compound-interest-calculator',
    'compound-interest-calculator': 'mortgage-calculator',
    'car-loan-calculator': 'savings-goal-calculator',
    'student-loan-calculator': 'compound-interest-calculator',
    'credit-card-payoff-calculator': 'emergency-fund-calculator',
    'emergency-fund-calculator': 'credit-card-payoff-calculator',
    'rent-vs-buy-calculator': 'mortgage-calculator',
    'bmi-calculator': 'calorie-calculator',
    'calorie-calculator': 'bmi-calculator',
  };

  if (pairOverrides[sourceSlug] && calculators.some((c) => c.slug === pairOverrides[sourceSlug])) {
    return { leftSlug: sourceSlug, rightSlug: pairOverrides[sourceSlug] };
  }

  const source = calculators.find((c) => c.slug === sourceSlug);
  const peer =
    calculators.find((c) => c.category_slug === source?.category_slug && c.slug !== sourceSlug) ||
    calculators.find((c) => c.slug !== sourceSlug && c.slug === 'savings-goal-calculator') ||
    calculators.find((c) => c.slug !== sourceSlug);

  return {
    leftSlug: sourceSlug,
    rightSlug: peer?.slug || 'savings-goal-calculator',
  };
}

interface ComparisonHubContextValue {
  snapshots: Record<ComparisonPaneId, ComparisonPaneSnapshot | null>;
  reportSnapshot: (pane: ComparisonPaneId, snapshot: ComparisonPaneSnapshot | null) => void;
}

const ComparisonHubContext = createContext<ComparisonHubContextValue | null>(null);
const ComparisonPaneIdContext = createContext<ComparisonPaneId | null>(null);

export const ComparisonHubProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [snapshots, setSnapshots] = useState<Record<ComparisonPaneId, ComparisonPaneSnapshot | null>>({
    left: null,
    right: null,
  });

  const reportSnapshot = useCallback((pane: ComparisonPaneId, snapshot: ComparisonPaneSnapshot | null) => {
    setSnapshots((prev) => {
      const current = prev[pane];
      if (
        current &&
        snapshot &&
        current.slug === snapshot.slug &&
        current.primaryDisplay === snapshot.primaryDisplay &&
        current.primaryLabel === snapshot.primaryLabel &&
        current.metrics.length === snapshot.metrics.length &&
        current.metrics.every(
          (m, idx) => m.label === snapshot.metrics[idx]?.label && m.display === snapshot.metrics[idx]?.display
        )
      ) {
        return prev;
      }
      if (current === null && snapshot === null) return prev;
      return { ...prev, [pane]: snapshot };
    });
  }, []);

  const value = useMemo(() => ({ snapshots, reportSnapshot }), [snapshots, reportSnapshot]);

  return <ComparisonHubContext.Provider value={value}>{children}</ComparisonHubContext.Provider>;
};

export const ComparisonPaneScope: React.FC<{ pane: ComparisonPaneId; children: React.ReactNode }> = ({
  pane,
  children,
}) => {
  return <ComparisonPaneIdContext.Provider value={pane}>{children}</ComparisonPaneIdContext.Provider>;
};

export function useComparisonHub() {
  return useContext(ComparisonHubContext);
}

/**
 * Reports live calculation results when rendered inside a Side-by-Side Comparison pane.
 * Safe no-op on standalone calculator pages.
 */
export function useComparisonPaneReporter(
  snapshot: Omit<ComparisonPaneSnapshot, 'primaryNumeric'> | null
): void {
  const hub = useContext(ComparisonHubContext);
  const pane = useContext(ComparisonPaneIdContext);

  const serializedKey = snapshot
    ? JSON.stringify({
        slug: snapshot.slug,
        primaryLabel: snapshot.primaryLabel,
        primaryDisplay: snapshot.primaryDisplay,
        metrics: snapshot.metrics.map((m) => [m.label, m.display]),
      })
    : '';

  const latestRef = useRef(snapshot);
  latestRef.current = snapshot;

  useEffect(() => {
    if (!hub || !pane) return;
    const current = latestRef.current;
    if (!current) {
      hub.reportSnapshot(pane, null);
      return;
    }
    hub.reportSnapshot(pane, {
      ...current,
      primaryNumeric: parseChartNumericValue(current.primaryDisplay),
    });
  }, [hub, pane, serializedKey]);
}
