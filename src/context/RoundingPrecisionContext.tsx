import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  RoundingPrecision,
  ROUNDING_STORAGE_KEY,
  parseRoundingPrecision,
  readStoredPrecision,
  saveStoredPrecision,
} from '../utils/roundingPrecision';

interface RoundingPrecisionContextValue {
  precision: RoundingPrecision;
  setPrecision: (value: RoundingPrecision) => void;
  resetPrecision: () => void;
}

const RoundingPrecisionContext = createContext<RoundingPrecisionContextValue>({
  precision: 'auto',
  setPrecision: () => {},
  resetPrecision: () => {},
});

export const RoundingPrecisionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [precision, setPrecisionState] = useState<RoundingPrecision>(() => readStoredPrecision());

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === ROUNDING_STORAGE_KEY) {
        setPrecisionState(parseRoundingPrecision(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const setPrecision = useCallback((value: RoundingPrecision) => {
    setPrecisionState(value);
    saveStoredPrecision(value);
  }, []);

  const resetPrecision = useCallback(() => {
    setPrecisionState('auto');
    saveStoredPrecision('auto');
  }, []);

  return (
    <RoundingPrecisionContext.Provider value={{ precision, setPrecision, resetPrecision }}>
      {children}
    </RoundingPrecisionContext.Provider>
  );
};

export function useRoundingPrecision(): RoundingPrecisionContextValue {
  return useContext(RoundingPrecisionContext);
}
