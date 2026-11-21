import fs from 'fs';
import path from 'path';

// Helper to write a registry file
export function writeRegistryFile(filename, specsName, specs) {
  const content = `import { CalculatorSpec } from './types';

export const ${specsName}: CalculatorSpec[] = ${JSON.stringify(specs, (key, value) => {
    if (typeof value === 'function') {
      return value.toString();
    }
    return value;
  }, 2)};
`;
}
