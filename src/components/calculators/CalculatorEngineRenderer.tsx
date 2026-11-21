import React from 'react';
import { CalculatorItem } from '../../types';
import { GenericCalculatorEngine } from './GenericCalculatorEngine';

const PercentageCalculator = React.lazy(() =>
  import('./PercentageCalculator').then((m) => ({ default: m.PercentageCalculator }))
);
const BMICalculator = React.lazy(() =>
  import('./BMICalculator').then((m) => ({ default: m.BMICalculator }))
);
const MortgageCalculator = React.lazy(() =>
  import('./MortgageCalculator').then((m) => ({ default: m.MortgageCalculator }))
);
const CompoundInterestCalculator = React.lazy(() =>
  import('./CompoundInterestCalculator').then((m) => ({ default: m.CompoundInterestCalculator }))
);
const CalorieTDEECalculator = React.lazy(() =>
  import('./CalorieTDEECalculator').then((m) => ({ default: m.CalorieTDEECalculator }))
);
const ScientificCalculator = React.lazy(() =>
  import('./ScientificCalculator').then((m) => ({ default: m.ScientificCalculator }))
);
const GPACalculator = React.lazy(() =>
  import('./GPACalculator').then((m) => ({ default: m.GPACalculator }))
);
const FractionCalculator = React.lazy(() =>
  import('./FractionCalculator').then((m) => ({ default: m.FractionCalculator }))
);
const StandardDeviationCalculator = React.lazy(() =>
  import('./StandardDeviationCalculator').then((m) => ({ default: m.StandardDeviationCalculator }))
);
const BodyFatCalculator = React.lazy(() =>
  import('./BodyFatCalculator').then((m) => ({ default: m.BodyFatCalculator }))
);
const DueDateCalculator = React.lazy(() =>
  import('./DueDateCalculator').then((m) => ({ default: m.DueDateCalculator }))
);
const UnitConverterCalculator = React.lazy(() =>
  import('./UnitConverterCalculator').then((m) => ({ default: m.UnitConverterCalculator }))
);

interface Props {
  calculator: CalculatorItem;
}

export const CalculatorEngineRenderer: React.FC<Props> = ({ calculator }) => {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Loading calculation engine...</div>}>
      {(() => {
        switch (calculator.slug) {
          case 'percentage-calculator':
            return <PercentageCalculator />;
          case 'bmi-calculator':
            return <BMICalculator />;
          case 'mortgage-calculator':
            return <MortgageCalculator />;
          case 'compound-interest-calculator':
            return <CompoundInterestCalculator />;
          case 'calorie-calculator':
            return <CalorieTDEECalculator />;
          case 'scientific-calculator':
            return <ScientificCalculator />;
          case 'gpa-calculator':
            return <GPACalculator />;
          case 'fraction-calculator':
            return <FractionCalculator />;
          case 'standard-deviation-calculator':
            return <StandardDeviationCalculator />;
          case 'body-fat-calculator':
            return <BodyFatCalculator />;
          case 'due-date-calculator':
            return <DueDateCalculator />;
          case 'unit-converter':
            return <UnitConverterCalculator />;
          default:
            return <GenericCalculatorEngine calculator={calculator} />;
        }
      })()}
    </React.Suspense>
  );
};
