import React, { useState } from 'react';
import { Plus, Trash2, RotateCcw, Copy, Check } from 'lucide-react';
import { FormulaHoverHighlight } from './FormulaHoverHighlight';
import { useRoundingPrecision } from '../../context/RoundingPrecisionContext';
import { formatNumberWithPrecision } from '../../utils/roundingPrecision';

interface CourseRow {
  id: string;
  name: string;
  credits: number;
  grade: string;
  courseType: 'regular' | 'honors' | 'ap';
}

const GRADE_POINTS: Record<string, number> = {
  'A+': 4.0,
  'A': 4.0,
  'A-': 3.7,
  'B+': 3.3,
  'B': 3.0,
  'B-': 2.7,
  'C+': 2.3,
  'C': 2.0,
  'C-': 1.7,
  'D+': 1.3,
  'D': 1.0,
  'D-': 0.7,
  'F': 0.0,
};

const INITIAL_COURSES: CourseRow[] = [
  { id: '1', name: 'Biology & Lab', credits: 4, grade: 'A', courseType: 'regular' },
  { id: '2', name: 'English Literature', credits: 3, grade: 'B+', courseType: 'regular' },
  { id: '3', name: 'Calculus I', credits: 4, grade: 'A-', courseType: 'ap' },
  { id: '4', name: 'Economics', credits: 3, grade: 'B', courseType: 'honors' },
];

export const GPACalculator: React.FC = () => {
  const [courses, setCourses] = useState<CourseRow[]>(INITIAL_COURSES);
  const [priorCredits, setPriorCredits] = useState<string>('30');
  const [priorGPA, setPriorGPA] = useState<string>('3.40');
  const [copied, setCopied] = useState<boolean>(false);
  const { precision } = useRoundingPrecision();

  const addCourse = () => {
    const newId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setCourses((prev) => [
      ...prev,
      {
        id: newId,
        name: `Course ${prev.length + 1}`,
        credits: 3,
        grade: 'A',
        courseType: 'regular',
      },
    ]);
  };

  const removeCourse = (id: string) => {
    if (courses.length > 1) {
      setCourses((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const updateCourse = (id: string, updates: Partial<CourseRow>) => {
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const calc = (() => {
    let totalCredits = 0;
    let totalUnweightedPoints = 0;
    let totalWeightedPoints = 0;

    for (const c of courses) {
      const basePoints = GRADE_POINTS[c.grade] ?? 0;
      let weightBonus = 0;
      if (c.courseType === 'honors') weightBonus = 0.5;
      if (c.courseType === 'ap') weightBonus = 1.0;

      totalCredits += c.credits;
      totalUnweightedPoints += basePoints * c.credits;
      totalWeightedPoints += (basePoints + weightBonus) * c.credits;
    }

    const unweightedGPA = totalCredits > 0 ? totalUnweightedPoints / totalCredits : 0;
    const weightedGPA = totalCredits > 0 ? totalWeightedPoints / totalCredits : 0;

    const rawPCreds = priorCredits.trim() === '' ? 0 : parseFloat(priorCredits);
    const rawPGPA = priorGPA.trim() === '' ? 0 : parseFloat(priorGPA);
    const validPrior =
      Number.isFinite(rawPCreds) && rawPCreds >= 0 && Number.isFinite(rawPGPA) && rawPGPA >= 0 && rawPGPA <= 5.0;

    const pCreds = validPrior ? rawPCreds : 0;
    const pGPA = validPrior ? rawPGPA : 0;
    const priorPoints = pCreds * pGPA;
    const newTotalCredits = pCreds + totalCredits;
    const cumulativeGPA =
      newTotalCredits > 0 ? (priorPoints + totalUnweightedPoints) / newTotalCredits : unweightedGPA;

    return {
      totalCredits,
      totalPoints: totalUnweightedPoints,
      unweightedGPA,
      weightedGPA,
      cumulativeGPA,
      newTotalCredits,
      priorError: !validPrior
        ? 'Prior credits must be >= 0 and prior GPA must be between 0.00 and 5.00.'
        : null,
    };
  })();

  const fmtGpa = (v: number) =>
    formatNumberWithPrecision(v, precision, { autoDecimals: 2, minAutoDecimals: 2, useGrouping: false });
  const fmtPts = (v: number) =>
    formatNumberWithPrecision(v, precision, { autoDecimals: 1, minAutoDecimals: 1 });

  const handleCopy = () => {
    navigator.clipboard?.writeText(
      `Semester GPA: ${fmtGpa(calc.unweightedGPA)} (Weighted: ${fmtGpa(calc.weightedGPA)}, Cumulative: ${fmtGpa(calc.cumulativeGPA)})`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setCourses(INITIAL_COURSES);
    setPriorCredits('30');
    setPriorGPA('3.40');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">
          Course Grades &amp; Credit Hours (4.0 Scale)
        </h2>
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div className="space-y-3">
          {courses.map((course, idx) => (
            <div
              key={course.id}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 grid grid-cols-12 gap-2 items-center"
            >
              <div className="col-span-12 sm:col-span-4">
                <input
                  type="text"
                  value={course.name}
                  onChange={(e) => updateCourse(course.id, { name: e.target.value })}
                  aria-label={`Course ${idx + 1} name`}
                  placeholder={`Course ${idx + 1}`}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div className="col-span-4 sm:col-span-2">
                <select
                  value={course.credits}
                  onChange={(e) => updateCourse(course.id, { credits: Number(e.target.value) })}
                  aria-label={`Course ${idx + 1} credits`}
                  className="w-full px-2 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  title="Credit Hours"
                >
                  {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6].map((cr) => (
                    <option key={cr} value={cr}>
                      {cr} {cr === 1 ? 'Credit' : 'Credits'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-4 sm:col-span-2">
                <select
                  value={course.grade}
                  onChange={(e) => updateCourse(course.id, { grade: e.target.value })}
                  aria-label={`Course ${idx + 1} letter grade`}
                  className="w-full px-2 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono font-bold"
                  title="Letter Grade"
                >
                  {Object.keys(GRADE_POINTS).map((g) => (
                    <option key={g} value={g}>
                      {g} ({GRADE_POINTS[g].toFixed(1)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-3 sm:col-span-3">
                <select
                  value={course.courseType}
                  onChange={(e) =>
                    updateCourse(course.id, {
                      courseType: e.target.value as 'regular' | 'honors' | 'ap',
                    })
                  }
                  aria-label={`Course ${idx + 1} weighting`}
                  className="w-full px-2 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  title="Course Rigor"
                >
                  <option value="regular">Standard (4.0)</option>
                  <option value="honors">Honors (+0.5)</option>
                  <option value="ap">AP / IB (+1.0)</option>
                </select>
              </div>

              <div className="col-span-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeCourse(course.id)}
                  disabled={courses.length <= 1}
                  aria-label={`Remove course ${idx + 1}`}
                  className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30 transition-colors cursor-pointer"
                  title="Delete row"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addCourse}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer w-full justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add Another Course</span>
        </button>

        <FormulaHoverHighlight
          accent="indigo"
          formulaLabel="Weighted Credit-Hour Mean (4.0 Scale)"
          formula="GPA = Σ(c × g) / Σ(c)"
          variables={[
            { symbol: 'Σ(c × g)', name: 'Total Quality Points', value: fmtPts(calc.totalPoints), unit: 'pts' },
            { symbol: 'Σ(c)', name: 'Total Credit Hours', value: calc.totalCredits, unit: 'credits' },
            { symbol: 'g', name: 'Active Courses', value: courses.length, unit: 'courses' },
          ]}
          activeStep={`${fmtPts(calc.totalPoints)} quality pts ÷ ${calc.totalCredits} credits = ${fmtGpa(calc.unweightedGPA)} unweighted (Weighted: ${fmtGpa(calc.weightedGPA)})`}
        >
          <div className="p-6 rounded-2xl bg-indigo-950 text-white dark:border dark:border-indigo-900/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 shadow-md">
            <div>
              <span className="text-xs uppercase tracking-wider text-indigo-300 block mb-1">
                Semester GPA (Unweighted 4.0 Scale)
              </span>
              <div className="flex items-baseline gap-4">
                <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white tabular-nums">
                  {fmtGpa(calc.unweightedGPA)}
                </span>
                <span className="text-sm text-indigo-200">
                  Weighted GPA: <strong className="text-white font-mono">{fmtGpa(calc.weightedGPA)}</strong>
                </span>
              </div>
              <span className="text-xs text-indigo-300 block mt-1">
                Total Credits: {calc.totalCredits} · Unweighted Quality Points: {fmtPts(calc.totalPoints)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors cursor-pointer self-start sm:self-center"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy GPA'}</span>
            </button>
          </div>
        </FormulaHoverHighlight>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Cumulative GPA Projection (Unweighted Prior History)
            </h4>
            <span className="text-[11px] text-slate-400">Uses unweighted 4.0 semester points</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="gpa-prior-credits" className="block text-xs text-slate-500 mb-1">
                Prior Completed Credits
              </label>
              <input
                id="gpa-prior-credits"
                type="number"
                min="0"
                step="0.5"
                value={priorCredits}
                onChange={(e) => setPriorCredits(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                placeholder="e.g. 30"
              />
            </div>
            <div>
              <label htmlFor="gpa-prior-gpa" className="block text-xs text-slate-500 mb-1">
                Prior Cumulative GPA (4.0 Scale)
              </label>
              <input
                id="gpa-prior-gpa"
                type="number"
                step="0.01"
                min="0"
                max="5.0"
                value={priorGPA}
                onChange={(e) => setPriorGPA(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                placeholder="e.g. 3.40"
              />
            </div>
          </div>
          {calc.priorError ? (
            <div role="alert" className="text-xs text-rose-600 dark:text-rose-400 font-medium">
              {calc.priorError}
            </div>
          ) : (
            <div className="pt-2 text-xs text-slate-600 dark:text-slate-400">
              Projected New Cumulative GPA:{' '}
              <strong className="text-indigo-600 dark:text-indigo-400 font-mono text-sm">
                {fmtGpa(calc.cumulativeGPA)}
              </strong>{' '}
              across {calc.newTotalCredits} total credits.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
