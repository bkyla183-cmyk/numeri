import { CalculatorSpec } from './types';

export const domainEducationCookingMarketing: CalculatorSpec[] = [
  // ==========================================
  // EDUCATION (15)
  // ==========================================
  {
    slug: 'gpa-calculator',
    title: 'College GPA Calculator',
    description: 'Calculate semester or cumulative Grade Point Average (GPA) based on credit hours and grade points.',
    category: 'education',
    inputs: [
      { id: 'course1_credits', label: 'Course 1 Credits', type: 'number', defaultValue: 3, min: 0.5, max: 10, step: 0.5 },
      { id: 'course1_grade', label: 'Course 1 Grade Points (4.0 Scale)', type: 'number', defaultValue: 4.0, min: 0, max: 4.33, step: 0.1 },
      { id: 'course2_credits', label: 'Course 2 Credits', type: 'number', defaultValue: 4, min: 0.5, max: 10, step: 0.5 },
      { id: 'course2_grade', label: 'Course 2 Grade Points', type: 'number', defaultValue: 3.3, min: 0, max: 4.33, step: 0.1 },
      { id: 'course3_credits', label: 'Course 3 Credits', type: 'number', defaultValue: 3, min: 0.5, max: 10, step: 0.5 },
      { id: 'course3_grade', label: 'Course 3 Grade Points', type: 'number', defaultValue: 3.7, min: 0, max: 4.33, step: 0.1 },
      { id: 'prior_gpa', label: 'Prior Cumulative GPA (optional)', type: 'number', defaultValue: 3.4, min: 0, max: 4.0, step: 0.01 },
      { id: 'prior_credits', label: 'Prior Cumulative Credits', type: 'number', defaultValue: 30, min: 0, max: 200, step: 1 }
    ],
    calculate: (inputs) => {
      const c1 = inputs.course1_credits || 0;
      const g1 = inputs.course1_grade || 0;
      const c2 = inputs.course2_credits || 0;
      const g2 = inputs.course2_grade || 0;
      const c3 = inputs.course3_credits || 0;
      const g3 = inputs.course3_grade || 0;
      const priorGpa = inputs.prior_gpa || 0;
      const priorCredits = inputs.prior_credits || 0;

      const semCredits = c1 + c2 + c3;
      const semPoints = (c1 * g1) + (c2 * g2) + (c3 * g3);
      const semGpa = semCredits > 0 ? semPoints / semCredits : 0;

      const totalCredits = priorCredits + semCredits;
      const totalPoints = (priorGpa * priorCredits) + semPoints;
      const cumGpa = totalCredits > 0 ? totalPoints / totalCredits : semGpa;

      return {
        primaryOutput: parseFloat(cumGpa.toFixed(2)),
        primaryUnit: 'Cumulative GPA',
        secondaryOutputs: [
          { label: 'Semester GPA', value: parseFloat(semGpa.toFixed(2)) },
          { label: 'Semester Total Credits', value: semCredits, unit: 'hrs' },
          { label: 'Total Accumulated Credits', value: totalCredits, unit: 'hrs' }
        ],
        steps: [
          'Semester Points = (Credits × Grade Points)',
          'Semester GPA = Semester Points ÷ Semester Credits',
          'Cumulative GPA = (Total Grade Points) ÷ Total Credits'
        ]
      };
    }
  },
  {
    slug: 'high-school-gpa-calculator',
    title: 'High School Weighted GPA',
    description: 'Calculate weighted and unweighted high school GPA accounting for honors (+0.5) and AP/IB (+1.0) bonuses.',
    inputs: [
      { id: 'regular_credits', label: 'Regular Courses Credits (4.0 scale)', type: 'number', defaultValue: 12, min: 0, max: 40, step: 1 },
      { id: 'regular_avg_grade', label: 'Regular Courses Avg Grade (0-4)', type: 'number', defaultValue: 3.5, min: 0, max: 4.0, step: 0.1 },
      { id: 'honors_credits', label: 'Honors Credits (+0.5 weight)', type: 'number', defaultValue: 4, min: 0, max: 20, step: 1 },
      { id: 'honors_avg_grade', label: 'Honors Avg Grade (0-4)', type: 'number', defaultValue: 3.7, min: 0, max: 4.0, step: 0.1 },
      { id: 'ap_credits', label: 'AP / IB Credits (+1.0 weight)', type: 'number', defaultValue: 4, min: 0, max: 20, step: 1 },
      { id: 'ap_avg_grade', label: 'AP / IB Avg Grade (0-4)', type: 'number', defaultValue: 3.8, min: 0, max: 4.0, step: 0.1 }
    ],
    calculate: (inputs) => {
      const rc = inputs.regular_credits || 0;
      const rg = inputs.regular_avg_grade || 0;
      const hc = inputs.honors_credits || 0;
      const hg = inputs.honors_avg_grade || 0;
      const ac = inputs.ap_credits || 0;
      const ag = inputs.ap_avg_grade || 0;

      const totalCredits = rc + hc + ac;
      if (totalCredits <= 0) return { primaryOutput: 0, primaryUnit: 'GPA' };

      const unweightedPoints = (rc * rg) + (hc * hg) + (ac * ag);
      const unweightedGpa = unweightedPoints / totalCredits;

      const weightedPoints = (rc * rg) + (hc * (hg + 0.5)) + (ac * (ag + 1.0));
      const weightedGpa = weightedPoints / totalCredits;

      return {
        primaryOutput: parseFloat(weightedGpa.toFixed(2)),
        primaryUnit: 'Weighted GPA (5.0 max)',
        secondaryOutputs: [
          { label: 'Unweighted GPA (4.0 max)', value: parseFloat(unweightedGpa.toFixed(2)) },
          { label: 'Total Course Credits', value: totalCredits },
          { label: 'Weighted Bonus Points', value: parseFloat((weightedPoints - unweightedPoints).toFixed(1)) }
        ],
        steps: [
          'Unweighted GPA = (Grade Points × Credits) ÷ Total Credits',
          'Honors bonus adds +0.5 per grade point; AP/IB adds +1.0 per grade point',
          'Weighted GPA = Weighted Points ÷ Total Credits'
        ]
      };
    }
  },
  {
    slug: 'final-grade-calculator',
    title: 'Final Exam Grade Needed',
    description: 'Calculate the minimum score required on your final examination to earn your desired course grade.',
    inputs: [
      { id: 'current_grade', label: 'Current Grade in Class (%)', type: 'number', defaultValue: 84, min: 0, max: 100, step: 0.1, unit: '%' },
      { id: 'target_grade', label: 'Target Overall Grade (%)', type: 'number', defaultValue: 90, min: 0, max: 100, step: 0.1, unit: '%' },
      { id: 'final_weight', label: 'Final Exam Weight (%)', type: 'number', defaultValue: 25, min: 1, max: 100, step: 1, unit: '%' }
    ],
    calculate: (inputs) => {
      const current = inputs.current_grade ?? 84;
      const target = inputs.target_grade ?? 90;
      const wFinal = (inputs.final_weight || 25) / 100;
      const wCurrent = 1 - wFinal;

      const needed = (target - (current * wCurrent)) / wFinal;

      return {
        primaryOutput: parseFloat(needed.toFixed(1)),
        primaryUnit: '% Score Needed',
        secondaryOutputs: [
          { label: 'Target Grade', value: target, unit: '%' },
          { label: 'Current Standing', value: current, unit: '%' },
          { label: 'Final Weight Contribution', value: wFinal * 100, unit: '%' }
        ],
        steps: [
          `Current Weight = 100% - ${wFinal * 100}% = ${(wCurrent * 100).toFixed(0)}%`,
          `Points from Coursework = ${current}% × ${wCurrent.toFixed(2)} = ${(current * wCurrent).toFixed(2)}%`,
          `Score Needed = (Target - Current Contribution) ÷ Final Weight = ${needed.toFixed(1)}%`
        ]
      };
    }
  },
  {
    slug: 'grade-calculator',
    title: 'Grade Percentage to Letter',
    description: 'Convert percentage scores into letter grades, standard GPA points (4.0), and performance tier.',
    inputs: [
      { id: 'percentage', label: 'Overall Class Percentage (%)', type: 'number', defaultValue: 88.5, min: 0, max: 120, step: 0.1, unit: '%' }
    ],
    calculate: (inputs) => {
      const p = inputs.percentage ?? 88.5;
      let letter = 'F';
      let gpa = 0.0;
      let tier = 'Failing';

      if (p >= 93) { letter = 'A'; gpa = 4.0; tier = 'Excellent'; }
      else if (p >= 90) { letter = 'A-'; gpa = 3.7; tier = 'Excellent'; }
      else if (p >= 87) { letter = 'B+'; gpa = 3.3; tier = 'Above Average'; }
      else if (p >= 83) { letter = 'B'; gpa = 3.0; tier = 'Above Average'; }
      else if (p >= 80) { letter = 'B-'; gpa = 2.7; tier = 'Average'; }
      else if (p >= 77) { letter = 'C+'; gpa = 2.3; tier = 'Average'; }
      else if (p >= 73) { letter = 'C'; gpa = 2.0; tier = 'Average'; }
      else if (p >= 70) { letter = 'C-'; gpa = 1.7; tier = 'Below Average'; }
      else if (p >= 67) { letter = 'D+'; gpa = 1.3; tier = 'Passing Minimal'; }
      else if (p >= 60) { letter = 'D'; gpa = 1.0; tier = 'Passing Minimal'; }

      return {
        primaryOutput: gpa,
        primaryUnit: `Grade ${letter} (${p}%)`,
        secondaryOutputs: [
          { label: 'Letter Grade', value: letter },
          { label: 'Evaluation Tier', value: tier },
          { label: 'GPA Equivalent', value: gpa }
        ],
        steps: [
          `Input Percentage: ${p}%`,
          `Standard Scale Mapping: ${p}% corresponds to letter grade ${letter}`,
          `Grade Point Equivalent: ${gpa} on standard 4.0 scale`
        ]
      };
    }
  },
  {
    slug: 'test-percentage-calculator',
    title: 'Test Score Percentage',
    description: 'Calculate your test score percentage, questions missed, and pass/fail status.',
    inputs: [
      { id: 'correct', label: 'Number of Correct Answers', type: 'number', defaultValue: 42, min: 0, max: 1000, step: 1 },
      { id: 'total', label: 'Total Number of Questions', type: 'number', defaultValue: 50, min: 1, max: 1000, step: 1 },
      { id: 'passing_score', label: 'Passing Threshold (%)', type: 'number', defaultValue: 70, min: 0, max: 100, step: 1, unit: '%' }
    ],
    calculate: (inputs) => {
      const correct = inputs.correct || 0;
      const total = inputs.total || 1;
      const passMark = inputs.passing_score || 70;
      const pct = (correct / total) * 100;
      const missed = Math.max(0, total - correct);
      const isPassed = pct >= passMark;

      return {
        primaryOutput: parseFloat(pct.toFixed(1)),
        primaryUnit: '% Score',
        secondaryOutputs: [
          { label: 'Status', value: isPassed ? 'PASSED' : 'DID NOT PASS' },
          { label: 'Questions Missed', value: missed },
          { label: 'Passing Threshold', value: passMark, unit: '%' }
        ],
        steps: [
          `Score Percentage = (Correct / Total) × 100 = (${correct} / ${total}) × 100 = ${pct.toFixed(1)}%`,
          `Questions missed: ${total} - ${correct} = ${missed}`
        ]
      };
    }
  },
  {
    slug: 'reading-speed-calculator',
    title: 'Reading Speed (WPM)',
    description: 'Calculate your reading speed in Words Per Minute (WPM) and estimate reading time for books and articles.',
    inputs: [
      { id: 'words', label: 'Total Words Read', type: 'number', defaultValue: 750, min: 10, max: 100000, step: 10 },
      { id: 'minutes', label: 'Time Spent (Minutes)', type: 'number', defaultValue: 3, min: 0.1, max: 300, step: 0.1, unit: 'min' },
      { id: 'seconds', label: 'Additional Seconds', type: 'number', defaultValue: 0, min: 0, max: 59, step: 1, unit: 's' }
    ],
    calculate: (inputs) => {
      const w = inputs.words || 0;
      const totalMin = (inputs.minutes || 0) + (inputs.seconds || 0) / 60;
      const wpm = totalMin > 0 ? w / totalMin : 0;

      let speedTier = 'Average (200-250 WPM)';
      if (wpm < 150) speedTier = 'Deliberate / Technical';
      else if (wpm > 400) speedTier = 'Speed Reader';
      else if (wpm > 250) speedTier = 'Above Average';

      const avgBookWords = 70000;
      const hoursPerBook = wpm > 0 ? (avgBookWords / wpm) / 60 : 0;

      return {
        primaryOutput: Math.round(wpm),
        primaryUnit: 'Words Per Minute (WPM)',
        secondaryOutputs: [
          { label: 'Reader Category', value: speedTier },
          { label: 'Time per Standard Book (70k words)', value: parseFloat(hoursPerBook.toFixed(1)), unit: 'hours' },
          { label: 'Pages Per Hour (~250 words/page)', value: Math.round((wpm * 60) / 250), unit: 'pages' }
        ],
        steps: [
          `Elapsed Time = ${totalMin.toFixed(2)} minutes`,
          `WPM = Total Words ÷ Elapsed Minutes = ${w} ÷ ${totalMin.toFixed(2)} = ${Math.round(wpm)} WPM`
        ]
      };
    }
  },
  {
    slug: 'word-counter',
    title: 'Word & Character Counter',
    description: 'Analyze sample text metrics: word count, character count, sentence count, and reading duration.',
    inputs: [
      { id: 'word_count_input', label: 'Or Enter Known Word Count', type: 'number', defaultValue: 1250, min: 1, max: 500000, step: 10 }
    ],
    calculate: (inputs) => {
      const words = inputs.word_count_input || 1250;
      const charsWithSpaces = Math.round(words * 5.8);
      const charsNoSpaces = Math.round(words * 4.8);
      const sentences = Math.max(1, Math.round(words / 15));
      const readingMin = parseFloat((words / 230).toFixed(1));
      const speakingMin = parseFloat((words / 130).toFixed(1));

      return {
        primaryOutput: words,
        primaryUnit: 'Words',
        secondaryOutputs: [
          { label: 'Characters (with spaces)', value: charsWithSpaces },
          { label: 'Estimated Sentences', value: sentences },
          { label: 'Silent Reading Time', value: readingMin, unit: 'min' },
          { label: 'Speech Presentation Time', value: speakingMin, unit: 'min' }
        ],
        steps: [
          'Average word length: 4.8 to 5.8 characters',
          `Silent reading @ 230 WPM: ${readingMin} minutes`,
          `Speech presentation @ 130 WPM: ${speakingMin} minutes`
        ]
      };
    }
  },
  {
    slug: 'spaced-repetition-calculator',
    title: 'Flashcard Spaced Repetition',
    description: 'Calculate optimal flashcard review intervals using the SuperMemo SM-2 algorithm based on performance rating.',
    inputs: [
      { id: 'repetition_number', label: 'Current Repetition Count (n)', type: 'number', defaultValue: 3, min: 1, max: 30, step: 1 },
      { id: 'previous_interval', label: 'Previous Interval (Days)', type: 'number', defaultValue: 6, min: 1, max: 365, step: 1, unit: 'days' },
      { id: 'quality_rating', label: 'Recall Quality (0=blackout, 3=pass with effort, 5=perfect)', type: 'number', defaultValue: 4, min: 0, max: 5, step: 1 },
      { id: 'easiness_factor', label: 'Current Easiness Factor (EF)', type: 'number', defaultValue: 2.5, min: 1.3, max: 3.5, step: 0.1 }
    ],
    calculate: (inputs) => {
      const n = Math.max(1, Number(inputs.repetition_number) || 1);
      const prevI = Math.max(1, Number(inputs.previous_interval) || 1);
      const q = Math.max(0, Math.min(5, Number(inputs.quality_rating) ?? 4));
      let ef = Math.max(1.3, Number(inputs.easiness_factor) || 2.5);

      ef = ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
      if (ef < 1.3) ef = 1.3;

      let nextInterval = 1;
      let nextRepetition = 1;
      if (q < 3) {
        nextInterval = 1;
        nextRepetition = 1;
      } else {
        nextRepetition = n + 1;
        if (n === 1) nextInterval = 1;
        else if (n === 2) nextInterval = 6;
        else nextInterval = Math.max(prevI + 1, Math.round(prevI * ef));
      }

      return {
        primaryOutput: nextInterval,
        primaryUnit: 'Days Until Next Review',
        secondaryOutputs: [
          { label: 'Updated Easiness Factor (EF)', value: parseFloat(ef.toFixed(2)) },
          { label: 'Advancing Repetition Count (n)', value: nextRepetition },
          { label: 'Retention Status', value: q >= 3 ? 'Retained (Advancing)' : 'Lapsed (Reset to 1 day)' },
          { label: 'Algorithm Boundary Limit', value: 'Assumes isolated card review; not suitable for mass cramming' }
        ],
        steps: [
          `Recall Score: ${q}/5 | Current Stage: Repetition #${n}`,
          `EF updated to ${ef.toFixed(2)} based on recall quality.`,
          q >= 3
            ? `Card recalled successfully: advancing to interval of ${nextInterval} days (Repetition #${nextRepetition}).`
            : `Quality < 3 indicates memory lapse: repetition count and interval reset to 1 day for re-learning.`,
          'Assumption & Limitation: SM-2 models long-term memory consolidation for isolated flashcards. External cues or cramming sessions violate the model assumptions.'
        ]
      };
    }
  },
  {
    slug: 'homework-time-calculator',
    title: 'Homework Time Estimator',
    description: 'Estimate weekly out-of-class study and homework hours based on credit hours and course difficulty.',
    inputs: [
      { id: 'credit_hours', label: 'Total Enrolled Credit Hours', type: 'number', defaultValue: 15, min: 1, max: 30, step: 1, unit: 'credits' },
      { id: 'difficulty_multiplier', label: 'Course Rigor (2=Standard, 3=STEM/Intensive, 4=Grad)', type: 'number', defaultValue: 2, min: 1.5, max: 4, step: 0.5 }
    ],
    calculate: (inputs) => {
      const credits = inputs.credit_hours || 15;
      const mult = inputs.difficulty_multiplier || 2;
      const weeklyHours = credits * mult;
      const dailyHours = weeklyHours / 7;
      const weekdayHours = weeklyHours / 5;

      return {
        primaryOutput: weeklyHours,
        primaryUnit: 'Hours / Week of Study',
        secondaryOutputs: [
          { label: 'Daily Study (7 days/wk)', value: parseFloat(dailyHours.toFixed(1)), unit: 'hrs/day' },
          { label: 'Weekday Study (5 days/wk)', value: parseFloat(weekdayHours.toFixed(1)), unit: 'hrs/day' },
          { label: 'Total Weekly Academic Commitment (Class + Study)', value: credits + weeklyHours, unit: 'hrs/wk' }
        ],
        steps: [
          'Carnegie Rule standard: 2-3 hours of independent study per credit hour',
          `Weekly Study = ${credits} credits × ${mult} hrs/credit = ${weeklyHours} hours/week`
        ]
      };
    }
  },
  {
    slug: 'attendance-calculator',
    title: 'Class Attendance Rate',
    description: 'Calculate your attendance percentage, missed classes, and remaining absences permitted before penalty.',
    inputs: [
      { id: 'classes_attended', label: 'Classes Attended So Far', type: 'number', defaultValue: 27, min: 0, max: 200, step: 1 },
      { id: 'total_classes_held', label: 'Total Classes Held to Date', type: 'number', defaultValue: 30, min: 1, max: 200, step: 1 },
      { id: 'total_semester_classes', label: 'Total Classes in Full Semester', type: 'number', defaultValue: 45, min: 1, max: 200, step: 1 },
      { id: 'required_rate', label: 'Minimum Required Attendance (%)', type: 'number', defaultValue: 85, min: 50, max: 100, step: 1, unit: '%' }
    ],
    calculate: (inputs) => {
      const attended = inputs.classes_attended || 0;
      const held = inputs.total_classes_held || 1;
      const totalSem = inputs.total_semester_classes || held;
      const req = (inputs.required_rate || 85) / 100;

      const currentRate = (attended / held) * 100;
      const missed = Math.max(0, held - attended);

      const maxTotalAbsences = Math.floor(totalSem * (1 - req));
      const remainingAbsences = Math.max(0, maxTotalAbsences - missed);

      return {
        primaryOutput: parseFloat(currentRate.toFixed(1)),
        primaryUnit: '% Current Attendance',
        secondaryOutputs: [
          { label: 'Classes Missed to Date', value: missed },
          { label: 'Absences Still Allowed', value: remainingAbsences },
          { label: 'Max Total Absences for Semester', value: maxTotalAbsences }
        ],
        steps: [
          `Current Attendance Rate = (${attended} attended ÷ ${held} held) × 100 = ${currentRate.toFixed(1)}%`,
          `Max Allowed Absences for ${(req * 100).toFixed(0)}% attendance across ${totalSem} classes = ${maxTotalAbsences}`,
          `Remaining allowed absences = ${maxTotalAbsences} - ${missed} = ${remainingAbsences}`
        ]
      };
    }
  },
  {
    slug: 'study-planner-calculator',
    title: 'Study Schedule Planner',
    description: 'Break down total study chapters/pages and exam preparation time into structured daily study sessions.',
    inputs: [
      { id: 'total_pages', label: 'Total Pages or Topics to Cover', type: 'number', defaultValue: 240, min: 1, max: 5000, step: 5 },
      { id: 'days_until_exam', label: 'Days Until Exam / Deadline', type: 'number', defaultValue: 14, min: 1, max: 180, step: 1, unit: 'days' },
      { id: 'review_days', label: 'Days Reserved for Final Review', type: 'number', defaultValue: 2, min: 0, max: 30, step: 1, unit: 'days' },
      { id: 'reading_minutes_per_page', label: 'Minutes per Page / Topic', type: 'number', defaultValue: 5, min: 1, max: 60, step: 1, unit: 'min' }
    ],
    calculate: (inputs) => {
      const pages = inputs.total_pages || 100;
      const days = inputs.days_until_exam || 10;
      const reviewDays = Math.min(days - 1, inputs.review_days || 0);
      const studyDays = Math.max(1, days - reviewDays);
      const minPerPage = inputs.reading_minutes_per_page || 5;

      const pagesPerDay = Math.ceil(pages / studyDays);
      const dailyMinutes = pagesPerDay * minPerPage;
      const dailyHours = parseFloat((dailyMinutes / 60).toFixed(1));

      return {
        primaryOutput: pagesPerDay,
        primaryUnit: 'Pages / Topics per Day',
        secondaryOutputs: [
          { label: 'Daily Study Time', value: dailyHours, unit: 'hours/day' },
          { label: 'Active Learning Days', value: studyDays, unit: 'days' },
          { label: 'Dedicated Review Days', value: reviewDays, unit: 'days' }
        ],
        steps: [
          `Active learning window: ${days} total days - ${reviewDays} review days = ${studyDays} study days`,
          `Daily requirement = ${pages} pages ÷ ${studyDays} days = ${pagesPerDay} pages/day`,
          `Daily time = ${pagesPerDay} pages × ${minPerPage} min = ${dailyMinutes} min (${dailyHours} hrs)`
        ]
      };
    }
  },
  {
    slug: 'words-to-pages-calculator',
    title: 'Essay Words to Pages',
    description: 'Convert word count to pages based on font size, spacing (single vs double), and font family standards.',
    inputs: [
      { id: 'words', label: 'Total Word Count', type: 'number', defaultValue: 2500, min: 50, max: 100000, step: 50 },
      { id: 'spacing_mode', label: 'Line Spacing (1=Single, 1.5=1.5x, 2=Double)', type: 'number', defaultValue: 2, min: 1, max: 2, step: 0.5 },
      { id: 'font_size', label: 'Font Size (pt)', type: 'number', defaultValue: 12, min: 10, max: 14, step: 1, unit: 'pt' }
    ],
    calculate: (inputs) => {
      const words = inputs.words || 2500;
      const spacing = inputs.spacing_mode || 2;
      const fontSize = inputs.font_size || 12;

      let wordsPerPage = 250;
      if (spacing === 1) wordsPerPage = 500;
      else if (spacing === 1.5) wordsPerPage = 350;

      if (fontSize === 10) wordsPerPage = Math.round(wordsPerPage * 1.2);
      else if (fontSize === 11) wordsPerPage = Math.round(wordsPerPage * 1.1);
      else if (fontSize >= 13) wordsPerPage = Math.round(wordsPerPage * 0.85);

      const pages = parseFloat((words / wordsPerPage).toFixed(1));

      return {
        primaryOutput: pages,
        primaryUnit: 'Standard Pages',
        secondaryOutputs: [
          { label: 'Words per Page Standard', value: wordsPerPage },
          { label: 'Reading Time (approx)', value: Math.round(words / 230), unit: 'min' }
        ],
        steps: [
          `At ${fontSize}pt font with ${spacing}x spacing, an academic page averages ${wordsPerPage} words`,
          `Pages = ${words} words ÷ ${wordsPerPage} = ${pages} pages`
        ]
      };
    }
  },
  {
    slug: 'student-loan-calculator',
    title: 'Student Loan Payoff Calculator',
    description: 'Calculate monthly payments, total interest paid, and payoff schedule for college student loans.',
    inputs: [
      { id: 'loan_balance', label: 'Total Student Loan Balance ($)', type: 'number', defaultValue: 32000, min: 500, max: 300000, step: 500, unit: '$' },
      { id: 'interest_rate', label: 'Annual Interest Rate (%)', type: 'number', defaultValue: 5.5, min: 0.1, max: 20, step: 0.1, unit: '%' },
      { id: 'loan_term_years', label: 'Repayment Term (Years)', type: 'number', defaultValue: 10, min: 1, max: 30, step: 1, unit: 'years' }
    ],
    calculate: (inputs) => {
      const P = inputs.loan_balance || 32000;
      const r = (inputs.interest_rate || 5.5) / 100 / 12;
      const n = (inputs.loan_term_years || 10) * 12;

      let pmt = 0;
      if (r > 0) {
        pmt = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      } else {
        pmt = P / n;
      }

      const totalPaid = pmt * n;
      const totalInterest = totalPaid - P;

      return {
        primaryOutput: parseFloat(pmt.toFixed(2)),
        primaryUnit: '$/Month',
        secondaryOutputs: [
          { label: 'Total Repayment', value: parseFloat(totalPaid.toFixed(2)), unit: '$' },
          { label: 'Total Interest Paid', value: parseFloat(totalInterest.toFixed(2)), unit: '$' },
          { label: 'Number of Monthly Payments', value: n }
        ],
        steps: [
          'Formula: M = P[r(1+r)^n] / [(1+r)^n - 1]',
          `Monthly payment for $${P.toLocaleString()} over ${inputs.loan_term_years} years @ ${inputs.interest_rate}%: $${pmt.toFixed(2)}`,
          `Total interest: $${totalInterest.toFixed(2)}`
        ]
      };
    }
  },
  {
    slug: 'credit-load-calculator',
    title: 'Semester Credit Load Sizer',
    description: 'Calculate total academic commitment hours per week to maintain a balanced semester workload.',
    inputs: [
      { id: 'credits', label: 'Planned Semester Credit Hours', type: 'number', defaultValue: 16, min: 1, max: 25, step: 1, unit: 'credits' },
      { id: 'work_hours', label: 'Weekly Part-Time Work Hours', type: 'number', defaultValue: 15, min: 0, max: 60, step: 1, unit: 'hrs/wk' },
      { id: 'extracurricular_hours', label: 'Weekly Activities & Athletics', type: 'number', defaultValue: 8, min: 0, max: 40, step: 1, unit: 'hrs/wk' }
    ],
    calculate: (inputs) => {
      const credits = inputs.credits || 16;
      const work = inputs.work_hours || 0;
      const extra = inputs.extracurricular_hours || 0;

      const studyHours = credits * 2;
      const classHours = credits;
      const academicTotal = studyHours + classHours;
      const grandTotal = academicTotal + work + extra;

      let loadStatus = 'Manageable (Full-Time)';
      if (grandTotal > 60) loadStatus = 'Overload Risk (Burnout Alert)';
      else if (grandTotal > 45) loadStatus = 'Heavy Schedule';
      else if (grandTotal < 30) loadStatus = 'Light Load';

      return {
        primaryOutput: grandTotal,
        primaryUnit: 'Total Weekly Commitment Hours',
        secondaryOutputs: [
          { label: 'Academic Load (Class + Study)', value: academicTotal, unit: 'hrs' },
          { label: 'Study Time Needed', value: studyHours, unit: 'hrs' },
          { label: 'Workload Evaluation', value: loadStatus }
        ],
        steps: [
          `Classroom Time: ${classHours} hours/week`,
          `Independent Study: ${studyHours} hours/week (2:1 ratio)`,
          `Work & Activities: ${work + extra} hours/week`,
          `Total Weekly Hours: ${grandTotal} hours/week out of 168 available hours`
        ]
      };
    }
  },
  {
    slug: 'percentile-rank-calculator',
    title: 'Percentile Rank Calculator',
    description: 'Calculate the percentile ranking of a test score or measurement within an ordered distribution.',
    inputs: [
      { id: 'scores_below', label: 'Number of Scores Below Your Score', type: 'number', defaultValue: 78, min: 0, max: 100000, step: 1 },
      { id: 'scores_equal', label: 'Number of Scores Equal to Your Score', type: 'number', defaultValue: 4, min: 0, max: 100000, step: 1 },
      { id: 'total_scores', label: 'Total Number of Test Takers / Scores', type: 'number', defaultValue: 100, min: 1, max: 100000, step: 1 }
    ],
    calculate: (inputs) => {
      const below = inputs.scores_below || 0;
      const equal = inputs.scores_equal || 1;
      const total = inputs.total_scores || 100;

      const percentile = ((below + 0.5 * equal) / total) * 100;

      return {
        primaryOutput: parseFloat(percentile.toFixed(1)),
        primaryUnit: 'th Percentile',
        secondaryOutputs: [
          { label: 'Percentile Rank', value: `Top ${(100 - percentile).toFixed(1)}%` },
          { label: 'Scores Exceeded', value: below },
          { label: 'Cohort Size', value: total }
        ],
        steps: [
          'Formula: Percentile = [(Scores Below + 0.5 × Ties) ÷ Total Cohort] × 100',
          `Percentile = [(${below} + ${0.5 * equal}) ÷ ${total}] × 100 = ${percentile.toFixed(1)}th percentile`
        ]
      };
    }
  },

  // ==========================================
  // COOKING & NUTRITION (15)
  // ==========================================
  {
    slug: 'recipe-scale-calculator',
    title: 'Recipe Yield Scaler',
    description: 'Scale recipe ingredient quantities up or down based on desired servings or pan yield.',
    category: 'cooking-nutrition',
    inputs: [
      { id: 'original_servings', label: 'Original Servings / Yield', type: 'number', defaultValue: 4, min: 1, max: 500, step: 1 },
      { id: 'desired_servings', label: 'Desired Servings / Yield', type: 'number', defaultValue: 10, min: 1, max: 500, step: 1 },
      { id: 'ingredient_qty', label: 'Ingredient Quantity (e.g., cups, grams)', type: 'number', defaultValue: 2.5, min: 0.1, max: 10000, step: 0.25 }
    ],
    calculate: (inputs) => {
      const orig = inputs.original_servings || 1;
      const des = inputs.desired_servings || 1;
      const qty = inputs.ingredient_qty || 1;

      const scaleFactor = des / orig;
      const scaledQty = qty * scaleFactor;

      return {
        primaryOutput: parseFloat(scaledQty.toFixed(2)),
        primaryUnit: 'Scaled Quantity',
        secondaryOutputs: [
          { label: 'Scaling Multiplier Factor', value: parseFloat(scaleFactor.toFixed(3)), unit: 'x' },
          { label: 'Original Quantity', value: qty }
        ],
        steps: [
          `Scale Factor = Desired Servings ÷ Original Servings = ${des} ÷ ${orig} = ${scaleFactor.toFixed(3)}`,
          `Scaled Ingredient = ${qty} × ${scaleFactor.toFixed(3)} = ${scaledQty.toFixed(2)}`
        ]
      };
    }
  },
  {
    slug: 'butter-converter',
    title: 'Butter Converter',
    description: 'Convert butter between sticks, tablespoons, cups, grams, and ounces.',
    inputs: [
      { id: 'amount', label: 'Butter Amount', type: 'number', defaultValue: 2, min: 0.1, max: 100, step: 0.25 },
      { id: 'unit_type', label: 'Input Unit (1=Sticks, 2=Cups, 3=Tbsp, 4=Grams)', type: 'number', defaultValue: 1, min: 1, max: 4, step: 1 }
    ],
    calculate: (inputs) => {
      const amt = inputs.amount || 1;
      const unit = inputs.unit_type || 1;

      let sticks = amt;
      if (unit === 2) sticks = amt * 2;
      else if (unit === 3) sticks = amt / 8;
      else if (unit === 4) sticks = amt / 113.4;

      const cups = sticks * 0.5;
      const tbsp = sticks * 8;
      const grams = sticks * 113.398;
      const oz = sticks * 4;

      return {
        primaryOutput: parseFloat(grams.toFixed(1)),
        primaryUnit: 'Grams (g)',
        secondaryOutputs: [
          { label: 'US Butter Sticks', value: parseFloat(sticks.toFixed(2)), unit: 'sticks' },
          { label: 'Cups', value: parseFloat(cups.toFixed(2)), unit: 'cups' },
          { label: 'Tablespoons', value: parseFloat(tbsp.toFixed(1)), unit: 'tbsp' },
          { label: 'Ounces', value: parseFloat(oz.toFixed(2)), unit: 'oz' }
        ],
        steps: [
          'Standard US Butter Equivalents: 1 stick = 1/2 cup = 8 tbsp = 113.4g = 4 oz',
          `Calculated equivalent weight: ${grams.toFixed(1)} grams`
        ]
      };
    }
  },
  {
    slug: 'flour-converter',
    title: 'Flour Grams to Cups',
    description: 'Accurately convert flour between weight (grams/ounces) and volume (cups/tablespoons).',
    inputs: [
      { id: 'flour_cups', label: 'Flour in Cups (US Standard)', type: 'number', defaultValue: 2.5, min: 0.1, max: 50, step: 0.25, unit: 'cups' },
      { id: 'method_density', label: 'Flour Type / Method (120g=Aerated AP, 125g=Standard AP, 140g=Bread Flour)', type: 'number', defaultValue: 120, min: 100, max: 160, step: 5, unit: 'g/cup' }
    ],
    calculate: (inputs) => {
      const cups = inputs.flour_cups || 1;
      const density = inputs.method_density || 120;
      const grams = cups * density;
      const oz = grams / 28.3495;

      return {
        primaryOutput: parseFloat(grams.toFixed(1)),
        primaryUnit: 'Grams (g)',
        secondaryOutputs: [
          { label: 'Weight in Ounces', value: parseFloat(oz.toFixed(2)), unit: 'oz' },
          { label: 'Tablespoons', value: parseFloat((cups * 16).toFixed(1)), unit: 'tbsp' },
          { label: 'Density Standard Used', value: density, unit: 'g/cup' }
        ],
        steps: [
          `1 Cup of flour weighs ~ ${density}g (spooned & leveled method)`,
          `Total Grams = ${cups} cups × ${density} g/cup = ${grams.toFixed(1)} g`
        ]
      };
    }
  },
  {
    slug: 'sugar-converter',
    title: 'Sugar Grams to Cups',
    description: 'Convert granulated sugar, brown sugar, and powdered sugar between weight and volume.',
    inputs: [
      { id: 'cups', label: 'Sugar Quantity in Cups', type: 'number', defaultValue: 1.5, min: 0.1, max: 50, step: 0.25, unit: 'cups' },
      { id: 'sugar_type', label: 'Sugar Type (1=Granulated White 200g/cup, 2=Brown Packed 220g/cup, 3=Powdered Confectioners 120g/cup)', type: 'number', defaultValue: 1, min: 1, max: 3, step: 1 }
    ],
    calculate: (inputs) => {
      const cups = inputs.cups || 1;
      const type = inputs.sugar_type || 1;
      let density = 200;
      let typeName = 'Granulated White Sugar';
      if (type === 2) { density = 220; typeName = 'Packed Brown Sugar'; }
      else if (type === 3) { density = 120; typeName = 'Powdered Sugar (Icing)'; }

      const grams = cups * density;
      const oz = grams / 28.3495;

      return {
        primaryOutput: parseFloat(grams.toFixed(1)),
        primaryUnit: 'Grams (g)',
        secondaryOutputs: [
          { label: 'Weight in Ounces', value: parseFloat(oz.toFixed(2)), unit: 'oz' },
          { label: 'Sugar Type', value: typeName },
          { label: 'Density Standard', value: density, unit: 'g/cup' }
        ],
        steps: [
          `${typeName} standard density = ${density} grams per cup`,
          `Total weight = ${cups} cups × ${density} g/cup = ${grams.toFixed(1)} grams`
        ]
      };
    }
  },
  {
    slug: 'roasting-time-calculator',
    title: 'Meat Roasting Time per Pound',
    description: 'Calculate cooking time, oven temperature, and target internal temperature for roasting meats.',
    inputs: [
      { id: 'meat_weight_lbs', label: 'Meat Weight (lbs)', type: 'number', defaultValue: 5.5, min: 0.5, max: 30, step: 0.5, unit: 'lbs' },
      { id: 'roasting_min_per_lb', label: 'Cooking Rate (Minutes per Pound)', type: 'number', defaultValue: 20, min: 10, max: 50, step: 1, unit: 'min/lb' },
      { id: 'resting_time', label: 'Resting Time (Minutes)', type: 'number', defaultValue: 15, min: 5, max: 45, step: 5, unit: 'min' }
    ],
    calculate: (inputs) => {
      const weight = inputs.meat_weight_lbs || 5;
      const rate = inputs.roasting_min_per_lb || 20;
      const rest = inputs.resting_time || 15;

      const roastMin = weight * rate;
      const totalMin = roastMin + rest;
      const roastHours = Math.floor(roastMin / 60);
      const remainingMin = Math.round(roastMin % 60);

      return {
        primaryOutput: Math.round(roastMin),
        primaryUnit: 'Minutes Roasting',
        secondaryOutputs: [
          { label: 'Formatted Oven Time', value: `${roastHours}h ${remainingMin}m` },
          { label: 'Resting Time Needed', value: rest, unit: 'min' },
          { label: 'Total Schedule Time', value: Math.round(totalMin), unit: 'min' }
        ],
        steps: [
          `Roast Time = ${weight} lbs × ${rate} min/lb = ${roastMin} minutes`,
          `Allow ${rest} minutes for resting to redistribute juices before carving`
        ]
      };
    }
  },
  {
    slug: 'turkey-cooking-calculator',
    title: 'Turkey Thawing & Cooking',
    description: 'Calculate refrigerator thawing schedule, oven roasting time, and doneness temperatures for whole turkey.',
    inputs: [
      { id: 'turkey_weight_lbs', label: 'Whole Turkey Weight (lbs)', type: 'number', defaultValue: 16, min: 6, max: 35, step: 0.5, unit: 'lbs' },
      { id: 'is_stuffed', label: 'Is Turkey Stuffed? (0=Unstuffed 13 min/lb, 1=Stuffed 15 min/lb)', type: 'number', defaultValue: 0, min: 0, max: 1, step: 1 }
    ],
    calculate: (inputs) => {
      const weight = Math.max(1, inputs.turkey_weight_lbs || 16);
      const isStuffed = inputs.is_stuffed === 1;

      const thawDays = parseFloat((weight / 4).toFixed(1));
      const rate = isStuffed ? 15 : 13;
      const cookMin = weight * rate;
      const hours = Math.floor(cookMin / 60);
      const minutes = Math.round(cookMin % 60);

      return {
        primaryOutput: parseFloat((cookMin / 60).toFixed(1)),
        primaryUnit: 'Hours in Oven (@ 325°F / 163°C)',
        secondaryOutputs: [
          { label: 'Estimated Roasting Time', value: `${hours}h ${minutes}m` },
          { label: 'Refrigerator Thaw Time (at 40°F)', value: `${thawDays} days` },
          { label: 'USDA Safe Temp (Thigh/Breast/Stuffing)', value: '165°F (74°C)' },
          { label: 'Safety Limitation Notice', value: 'Time is an estimate; meat thermometer is mandatory for safety' }
        ],
        steps: [
          `USDA Thawing Standard: 24 hours of refrigerator thawing for every 4-5 lbs of turkey (${thawDays} days total).`,
          `Roasting Time at 325°F (${isStuffed ? 'Stuffed @ 15 min/lb' : 'Unstuffed @ 13 min/lb'}): ${weight} lbs × ${rate} min/lb = ${cookMin} min (${hours}h ${minutes}m).`,
          'CRITICAL SAFETY LIMITATION: Cooking times are estimates only. Oven calibration, turkey starting temperature, roasting pan material, and opening the oven door alter real cooking time. ALWAYS verify doneness by measuring 165°F (74°C) with a calibrated food thermometer in the innermost part of the thigh, wing, and thickest part of the breast.'
        ]
      };
    }
  },
  {
    slug: 'cooking-temperature-calculator',
    title: 'Cooking Temperature (F to C)',
    description: 'Convert kitchen oven temperatures between Fahrenheit, Celsius, and British Gas Mark scales.',
    inputs: [
      { id: 'temp_f', label: 'Oven Temperature (°F)', type: 'number', defaultValue: 350, min: 100, max: 550, step: 5, unit: '°F' }
    ],
    calculate: (inputs) => {
      const f = inputs.temp_f || 350;
      const c = (f - 32) * (5 / 9);

      let gasMark = '';
      if (f <= 225) gasMark = '1/4';
      else if (f <= 250) gasMark = '1/2';
      else {
        const gm = Math.round((f - 250) / 25);
        gasMark = gm > 0 && gm <= 10 ? String(gm) : 'N/A';
      }

      return {
        primaryOutput: Math.round(c),
        primaryUnit: '°C (Celsius)',
        secondaryOutputs: [
          { label: 'Fahrenheit', value: f, unit: '°F' },
          { label: 'Gas Mark Equivalent', value: gasMark },
          { label: 'Fan-Forced Oven Adj (-20°C)', value: Math.round(c - 20), unit: '°C' }
        ],
        steps: [
          `Formula: °C = (°F - 32) × 5/9 = (${f} - 32) × 5/9 = ${Math.round(c)}°C`,
          `Gas Mark equivalent for ${f}°F is Mark ${gasMark}`,
          `For convection/fan-assisted ovens, reduce by 20°C (25°F)`
        ]
      };
    }
  },
  {
    slug: 'sourdough-converter',
    title: 'Yeast to Sourdough Converter',
    description: 'Convert commercial baker yeast recipes into natural sourdough levain starter and adjust hydration.',
    inputs: [
      { id: 'total_flour_g', label: 'Total Flour in Recipe (g)', type: 'number', defaultValue: 500, min: 50, max: 5000, step: 25, unit: 'g' },
      { id: 'total_water_g', label: 'Total Liquid / Water in Recipe (g)', type: 'number', defaultValue: 350, min: 50, max: 4000, step: 10, unit: 'g' },
      { id: 'starter_percent', label: 'Levain Inoculation Rate (%)', type: 'number', defaultValue: 20, min: 5, max: 40, step: 1, unit: '%' }
    ],
    calculate: (inputs) => {
      const flour = inputs.total_flour_g || 500;
      const water = inputs.total_water_g || 350;
      const inoc = (inputs.starter_percent || 20) / 100;

      const starterWeight = flour * inoc;
      const starterFlour = starterWeight / 2;
      const starterWater = starterWeight / 2;

      const adjustedFlour = flour - starterFlour;
      const adjustedWater = water - starterWater;
      const hydration = (water / flour) * 100;

      return {
        primaryOutput: Math.round(starterWeight),
        primaryUnit: 'g Sourdough Starter (100% Hydration)',
        secondaryOutputs: [
          { label: 'Adjusted Flour to Add', value: Math.round(adjustedFlour), unit: 'g' },
          { label: 'Adjusted Water to Add', value: Math.round(adjustedWater), unit: 'g' },
          { label: 'Dough Hydration Rate', value: parseFloat(hydration.toFixed(1)), unit: '%' }
        ],
        steps: [
          `At ${(inoc * 100).toFixed(0)}% inoculation: Starter Needed = ${flour}g × ${inoc} = ${Math.round(starterWeight)}g`,
          `Starter contains ${Math.round(starterFlour)}g flour and ${Math.round(starterWater)}g water`,
          `Remaining flour to mix: ${flour}g - ${Math.round(starterFlour)}g = ${Math.round(adjustedFlour)}g`,
          `Remaining water to mix: ${water}g - ${Math.round(starterWater)}g = ${Math.round(adjustedWater)}g`
        ]
      };
    }
  },
  {
    slug: 'pan-size-calculator',
    title: 'Baking Pan Size Adjuster',
    description: 'Calculate scaling factors when baking a recipe in a different size or shape of baking pan.',
    inputs: [
      { id: 'source_shape', label: 'Original Pan Shape (1=Round, 2=Rectangular/Square)', type: 'number', defaultValue: 1, min: 1, max: 2, step: 1 },
      { id: 'source_dim1', label: 'Original Dim 1 (Diameter or Length)', type: 'number', defaultValue: 9, min: 3, max: 30, step: 0.5, unit: 'in' },
      { id: 'source_dim2', label: 'Original Dim 2 (Width if rectangular, 0 if round)', type: 'number', defaultValue: 0, min: 0, max: 30, step: 0.5, unit: 'in' },
      { id: 'target_shape', label: 'Target Pan Shape (1=Round, 2=Rectangular/Square)', type: 'number', defaultValue: 2, min: 1, max: 2, step: 1 },
      { id: 'target_dim1', label: 'Target Dim 1 (Diameter or Length)', type: 'number', defaultValue: 9, min: 3, max: 30, step: 0.5, unit: 'in' },
      { id: 'target_dim2', label: 'Target Dim 2 (Width if rectangular, 0 if round)', type: 'number', defaultValue: 13, min: 0, max: 30, step: 0.5, unit: 'in' }
    ],
    calculate: (inputs) => {
      const sShape = Number(inputs.source_shape) || 1;
      const s1 = Math.max(1, Number(inputs.source_dim1) || 9);
      const s2 = Math.max(0, Number(inputs.source_dim2) || 0);
      const tShape = Number(inputs.target_shape) || 2;
      const t1 = Math.max(1, Number(inputs.target_dim1) || 9);
      const t2 = Math.max(0, Number(inputs.target_dim2) || 13);

      const sourceArea = sShape === 1 ? Math.PI * Math.pow(s1 / 2, 2) : s1 * (s2 || s1);
      const targetArea = tShape === 1 ? Math.PI * Math.pow(t1 / 2, 2) : t1 * (t2 || t1);
      const ratio = targetArea / sourceArea;
      const pctDiff = ((ratio - 1) * 100);

      let bakingTimeAdvice = 'Maintain standard baking temperature and time';
      if (ratio > 1.25) {
        bakingTimeAdvice = 'Check baking 5-10 min early if batter is spread thinner, or add 10-15% time if depth increased';
      } else if (ratio < 0.75) {
        bakingTimeAdvice = 'Scale down ingredients; check crust 5-10 min earlier to prevent edge burning';
      }

      return {
        primaryOutput: parseFloat(ratio.toFixed(2)),
        primaryUnit: 'Recipe Scale Factor',
        secondaryOutputs: [
          { label: 'Original Pan Area', value: parseFloat(sourceArea.toFixed(1)), unit: 'sq in' },
          { label: 'Target Pan Area', value: parseFloat(targetArea.toFixed(1)), unit: 'sq in' },
          { label: 'Area Change', value: `${pctDiff >= 0 ? '+' : ''}${pctDiff.toFixed(0)}%` },
          { label: 'Baking Time Guidance', value: bakingTimeAdvice },
          { label: 'Depth Limitation Note', value: 'Assumes equal pan depth. Adjust baking time if batter thickness changes.' }
        ],
        steps: [
          `Original Pan (${sShape === 1 ? `Round ⌀${s1}″` : `Rectangular ${s1}″×${s2 || s1}″`}) Area = ${sourceArea.toFixed(1)} sq in.`,
          `Target Pan (${tShape === 1 ? `Round ⌀${t1}″` : `Rectangular ${t1}″×${t2 || t1}″`}) Area = ${targetArea.toFixed(1)} sq in.`,
          `Scaling Factor = Target Area ÷ Original Area = ${ratio.toFixed(2)}x.`,
          'SURFACE & DEPTH LIMITATION: This adjustment scales ingredient volume to match the 2D pan base area. If the target pan is shallower or deeper, batter depth will vary, directly affecting heat penetration. Check doneness with a toothpick 5-10 minutes earlier than normal.'
        ]
      };
    }
  },
  {
    slug: 'brine-calculator',
    title: 'Brine Salt Concentration',
    description: 'Calculate exact salt and water quantities for dry brining or wet brine solutions (e.g. 5% turkey brine).',
    inputs: [
      { id: 'water_volume_liters', label: 'Water Volume (Liters)', type: 'number', defaultValue: 4, min: 0.5, max: 50, step: 0.5, unit: 'L' },
      { id: 'target_salinity_pct', label: 'Target Salinity Concentration (%)', type: 'number', defaultValue: 5, min: 1, max: 20, step: 0.5, unit: '%' }
    ],
    calculate: (inputs) => {
      const liters = inputs.water_volume_liters || 4;
      const salinity = (inputs.target_salinity_pct || 5) / 100;

      const waterGrams = liters * 1000;
      const saltGrams = (salinity * waterGrams) / (1 - salinity);
      const saltCupsKosher = saltGrams / 240;

      return {
        primaryOutput: Math.round(saltGrams),
        primaryUnit: 'Grams Salt (g)',
        secondaryOutputs: [
          { label: 'Salt in Ounces', value: parseFloat((saltGrams / 28.35).toFixed(1)), unit: 'oz' },
          { label: 'Approx Kosher Salt', value: parseFloat(saltCupsKosher.toFixed(2)), unit: 'cups' },
          { label: 'Total Brine Weight', value: Math.round(waterGrams + saltGrams), unit: 'g' }
        ],
        steps: [
          `Water mass = ${waterGrams} g`,
          `Salt for ${(salinity * 100).toFixed(1)}% salinity: ${Math.round(saltGrams)} g`,
          'Dissolve completely in warm water before chilling and submerging meat'
        ]
      };
    }
  },
  {
    slug: 'coffee-ratio-calculator',
    title: 'Coffee Brewing Ratio (1:16)',
    description: 'Calculate coffee beans and water weights for French press, pour over, Chemex, and espresso brews.',
    inputs: [
      { id: 'coffee_beans_g', label: 'Coffee Beans (g) [or enter target output]', type: 'number', defaultValue: 25, min: 5, max: 200, step: 1, unit: 'g' },
      { id: 'brew_ratio', label: 'Brew Ratio (e.g., 15 for 1:15 strong, 16 for standard, 17 for light)', type: 'number', defaultValue: 16, min: 1, max: 20, step: 0.5 }
    ],
    calculate: (inputs) => {
      const beans = inputs.coffee_beans_g || 25;
      const ratio = inputs.brew_ratio || 16;
      const waterGrams = beans * ratio;
      const yieldOz = parseFloat((waterGrams * 0.033814).toFixed(1));
      const cups = parseFloat((yieldOz / 6).toFixed(1));

      return {
        primaryOutput: Math.round(waterGrams),
        primaryUnit: 'g (ml) Hot Water',
        secondaryOutputs: [
          { label: 'Liquid Yield (~88% retention)', value: parseFloat((yieldOz * 0.88).toFixed(1)), unit: 'fl oz' },
          { label: 'Coffee Cups (~6 oz)', value: cups, unit: 'cups' },
          { label: 'Ratio Selected', value: `1:${ratio}` }
        ],
        steps: [
          `Water Weight = Coffee Beans (${beans}g) × ${ratio} = ${Math.round(waterGrams)}g (ml)`,
          `Ground coffee absorbs ~2g water per 1g of coffee during extraction`
        ]
      };
    }
  },
  {
    slug: 'abv-calculator',
    title: 'Alcohol by Volume (ABV)',
    description: 'Calculate alcohol content (ABV %) and apparent attenuation from original and final gravity readings.',
    inputs: [
      { id: 'original_gravity', label: 'Original Gravity (OG)', type: 'number', defaultValue: 1.055, min: 1.000, max: 1.200, step: 0.001 },
      { id: 'final_gravity', label: 'Final Gravity (FG)', type: 'number', defaultValue: 1.012, min: 0.980, max: 1.100, step: 0.001 }
    ],
    calculate: (inputs) => {
      const og = inputs.original_gravity || 1.055;
      const fg = inputs.final_gravity || 1.012;

      const abv = Math.max(0, (og - fg) * 131.25);
      const abw = abv * 0.79336;
      const attenuation = ((og - fg) / (og - 1)) * 100;

      return {
        primaryOutput: parseFloat(abv.toFixed(2)),
        primaryUnit: '% ABV',
        secondaryOutputs: [
          { label: 'Alcohol by Weight (ABW)', value: parseFloat(abw.toFixed(2)), unit: '%' },
          { label: 'Apparent Attenuation', value: parseFloat(attenuation.toFixed(1)), unit: '%' },
          { label: 'Estimated Calories (12 oz)', value: Math.round((1881.22 * (og - fg) + 3550 * (fg - 1))) }
        ],
        steps: [
          'Standard Formula: ABV % = (Original Gravity - Final Gravity) × 131.25',
          `ABV = (${og.toFixed(3)} - ${fg.toFixed(3)}) × 131.25 = ${abv.toFixed(2)}%`,
          `Attenuation = [(${og.toFixed(3)} - ${fg.toFixed(3)}) ÷ (${(og - 1).toFixed(3)})] × 100 = ${attenuation.toFixed(1)}%`
        ]
      };
    }
  },
  {
    slug: 'recipe-calorie-calculator',
    title: 'Recipe Serving Calorie Sizer',
    description: 'Calculate calories and macronutrients per portion from whole recipe totals and number of servings.',
    inputs: [
      { id: 'total_calories', label: 'Total Recipe Calories', type: 'number', defaultValue: 2400, min: 100, max: 50000, step: 50, unit: 'kcal' },
      { id: 'total_protein_g', label: 'Total Protein (g)', type: 'number', defaultValue: 140, min: 0, max: 2000, step: 5, unit: 'g' },
      { id: 'total_carbs_g', label: 'Total Carbohydrates (g)', type: 'number', defaultValue: 280, min: 0, max: 3000, step: 5, unit: 'g' },
      { id: 'total_fat_g', label: 'Total Fat (g)', type: 'number', defaultValue: 80, min: 0, max: 1500, step: 5, unit: 'g' },
      { id: 'servings', label: 'Number of Portions / Servings', type: 'number', defaultValue: 6, min: 1, max: 50, step: 1 }
    ],
    calculate: (inputs) => {
      const cals = inputs.total_calories || 2400;
      const prot = inputs.total_protein_g || 0;
      const carb = inputs.total_carbs_g || 0;
      const fat = inputs.total_fat_g || 0;
      const s = inputs.servings || 1;

      const perCal = Math.round(cals / s);
      const perProt = parseFloat((prot / s).toFixed(1));
      const perCarb = parseFloat((carb / s).toFixed(1));
      const perFat = parseFloat((fat / s).toFixed(1));

      return {
        primaryOutput: perCal,
        primaryUnit: 'Calories / Serving',
        secondaryOutputs: [
          { label: 'Protein per Serving', value: perProt, unit: 'g' },
          { label: 'Carbs per Serving', value: perCarb, unit: 'g' },
          { label: 'Fat per Serving', value: perFat, unit: 'g' },
          { label: 'Total Batch Portions', value: s }
        ],
        steps: [
          `Calories per serving = ${cals} total kcal ÷ ${s} servings = ${perCal} kcal`,
          `Protein: ${perProt}g | Carbs: ${perCarb}g | Fat: ${perFat}g`
        ]
      };
    }
  },
  {
    slug: 'recipe-macro-calculator',
    title: 'Macronutrient Recipe Split',
    description: 'Calculate macronutrient calorie distribution and percentages (Protein, Carbohydrates, and Fats).',
    inputs: [
      { id: 'protein_g', label: 'Protein (g)', type: 'number', defaultValue: 35, min: 0, max: 500, step: 1, unit: 'g' },
      { id: 'carbs_g', label: 'Carbohydrates (g)', type: 'number', defaultValue: 50, min: 0, max: 800, step: 1, unit: 'g' },
      { id: 'fat_g', label: 'Fat (g)', type: 'number', defaultValue: 18, min: 0, max: 300, step: 1, unit: 'g' }
    ],
    calculate: (inputs) => {
      const p = inputs.protein_g || 0;
      const c = inputs.carbs_g || 0;
      const f = inputs.fat_g || 0;

      const pCal = p * 4;
      const cCal = c * 4;
      const fCal = f * 9;
      const totalCal = pCal + cCal + fCal;

      const pPct = totalCal > 0 ? (pCal / totalCal) * 100 : 0;
      const cPct = totalCal > 0 ? (cCal / totalCal) * 100 : 0;
      const fPct = totalCal > 0 ? (fCal / totalCal) * 100 : 0;

      return {
        primaryOutput: Math.round(totalCal),
        primaryUnit: 'Total Calories (kcal)',
        secondaryOutputs: [
          { label: 'Protein Calories', value: `${pCal} kcal (${pPct.toFixed(1)}%)` },
          { label: 'Carbohydrate Calories', value: `${cCal} kcal (${cPct.toFixed(1)}%)` },
          { label: 'Fat Calories', value: `${fCal} kcal (${fPct.toFixed(1)}%)` }
        ],
        steps: [
          'Energy density constants: Protein = 4 kcal/g, Carbs = 4 kcal/g, Fat = 9 kcal/g',
          `Total Energy = (${p}×4) + (${c}×4) + (${f}×9) = ${totalCal} kcal`
        ]
      };
    }
  },
  {
    slug: 'liquid-cooking-calculator',
    title: 'Liquid Cooking Measurement',
    description: 'Convert kitchen liquids between cups, fluid ounces, milliliters, tablespoons, and teaspoons.',
    inputs: [
      { id: 'volume', label: 'Liquid Volume', type: 'number', defaultValue: 1.5, min: 0.1, max: 1000, step: 0.25 },
      { id: 'unit_selector', label: 'Selected Unit (1=Cups, 2=Fluid Ounces, 3=Milliliters, 4=Tablespoons)', type: 'number', defaultValue: 1, min: 1, max: 4, step: 1 }
    ],
    calculate: (inputs) => {
      const vol = inputs.volume || 1;
      const u = inputs.unit_selector || 1;

      let ml = 0;
      if (u === 1) ml = vol * 236.588;
      else if (u === 2) ml = vol * 29.5735;
      else if (u === 3) ml = vol;
      else if (u === 4) ml = vol * 14.7868;

      const cups = ml / 236.588;
      const flOz = ml / 29.5735;
      const tbsp = ml / 14.7868;
      const tsp = tbsp * 3;

      return {
        primaryOutput: parseFloat(ml.toFixed(1)),
        primaryUnit: 'Milliliters (ml)',
        secondaryOutputs: [
          { label: 'Cups (US)', value: parseFloat(cups.toFixed(2)), unit: 'cups' },
          { label: 'Fluid Ounces', value: parseFloat(flOz.toFixed(2)), unit: 'fl oz' },
          { label: 'Tablespoons', value: parseFloat(tbsp.toFixed(1)), unit: 'tbsp' },
          { label: 'Teaspoons', value: parseFloat(tsp.toFixed(1)), unit: 'tsp' }
        ],
        steps: [
          'US Customary Liquid Conversions: 1 cup = 8 fl oz = 16 tbsp = 48 tsp ≈ 236.6 ml',
          `Converted Volume = ${ml.toFixed(1)} ml`
        ]
      };
    }
  },

  // ==========================================
  // MARKETING & BUSINESS (15)
  // ==========================================
  {
    slug: 'ctr-calculator',
    title: 'Click-Through Rate (CTR)',
    description: 'Calculate the click-through percentage of advertising impressions or email campaigns.',
    category: 'marketing-business',
    inputs: [
      { id: 'clicks', label: 'Total Clicks Recorded', type: 'number', defaultValue: 340, min: 0, max: 10000000, step: 1 },
      { id: 'impressions', label: 'Total Impressions Delivered', type: 'number', defaultValue: 12500, min: 1, max: 10000000, step: 100 }
    ],
    calculate: (inputs) => {
      const clicks = inputs.clicks || 0;
      const imp = inputs.impressions || 1;
      const ctr = (clicks / imp) * 100;

      return {
        primaryOutput: parseFloat(ctr.toFixed(2)),
        primaryUnit: '% CTR',
        secondaryOutputs: [
          { label: 'Total Clicks', value: clicks },
          { label: 'Total Impressions', value: imp },
          { label: 'Clicks per 1,000 Impressions', value: parseFloat(((clicks / imp) * 1000).toFixed(1)) }
        ],
        steps: [
          'Formula: CTR (%) = (Total Clicks ÷ Total Impressions) × 100',
          `CTR = (${clicks} ÷ ${imp}) × 100 = ${ctr.toFixed(2)}%`
        ]
      };
    }
  },
  {
    slug: 'cpc-calculator',
    title: 'Cost Per Click (CPC)',
    description: 'Calculate average cost per click from advertising budget and total clicks generated.',
    inputs: [
      { id: 'total_cost', label: 'Total Advertising Cost / Spend ($)', type: 'number', defaultValue: 1500, min: 1, max: 1000000, step: 10, unit: '$' },
      { id: 'clicks', label: 'Total Clicks Generated', type: 'number', defaultValue: 820, min: 1, max: 1000000, step: 1 }
    ],
    calculate: (inputs) => {
      const cost = inputs.total_cost || 0;
      const clicks = inputs.clicks || 1;
      const cpc = cost / clicks;

      return {
        primaryOutput: parseFloat(cpc.toFixed(2)),
        primaryUnit: '$ / Click',
        secondaryOutputs: [
          { label: 'Total Ad Spend', value: parseFloat(cost.toFixed(2)), unit: '$' },
          { label: 'Clicks Acquired', value: clicks },
          { label: 'Equivalent Cost for 1,000 Clicks', value: parseFloat((cpc * 1000).toFixed(2)), unit: '$' }
        ],
        steps: [
          'Formula: CPC = Total Campaign Cost ÷ Total Clicks',
          `CPC = $${cost} ÷ ${clicks} = $${cpc.toFixed(2)} per click`
        ]
      };
    }
  },
  {
    slug: 'cpm-calculator',
    title: 'Cost Per Mille (CPM)',
    description: 'Calculate the cost per 1,000 ad impressions delivered across display, video, or social media campaigns.',
    inputs: [
      { id: 'total_cost', label: 'Total Ad Spend ($)', type: 'number', defaultValue: 450, min: 1, max: 1000000, step: 10, unit: '$' },
      { id: 'impressions', label: 'Total Impressions', type: 'number', defaultValue: 75000, min: 100, max: 100000000, step: 500 }
    ],
    calculate: (inputs) => {
      const cost = inputs.total_cost || 0;
      const imp = inputs.impressions || 1000;
      const cpm = (cost / imp) * 1000;

      return {
        primaryOutput: parseFloat(cpm.toFixed(2)),
        primaryUnit: '$ CPM (Cost per 1,000 Impressions)',
        secondaryOutputs: [
          { label: 'Cost per Single Impression', value: parseFloat((cost / imp).toFixed(4)), unit: '$' },
          { label: 'Total Impressions', value: imp },
          { label: 'Total Ad Budget', value: cost, unit: '$' }
        ],
        steps: [
          'Formula: CPM = (Total Cost ÷ Total Impressions) × 1,000',
          `CPM = ($${cost} ÷ ${imp}) × 1,000 = $${cpm.toFixed(2)}`
        ]
      };
    }
  },
  {
    slug: 'roas-calculator',
    title: 'Return on Ad Spend (ROAS)',
    description: 'Calculate gross revenue generated per dollar spent on digital advertising campaigns.',
    inputs: [
      { id: 'ad_revenue', label: 'Total Revenue Generated from Ads ($)', type: 'number', defaultValue: 12500, min: 0, max: 10000000, step: 100, unit: '$' },
      { id: 'ad_spend', label: 'Total Advertising Spend ($)', type: 'number', defaultValue: 2500, min: 1, max: 10000000, step: 50, unit: '$' }
    ],
    calculate: (inputs) => {
      const rev = inputs.ad_revenue || 0;
      const spend = inputs.ad_spend || 1;
      const roasRatio = rev / spend;
      const roasPct = roasRatio * 100;
      const netProfit = rev - spend;

      return {
        primaryOutput: parseFloat(roasRatio.toFixed(2)),
        primaryUnit: 'x ROAS ($ Revenue / $ Spend)',
        secondaryOutputs: [
          { label: 'ROAS Percentage', value: parseFloat(roasPct.toFixed(1)), unit: '%' },
          { label: 'Net Profit from Campaign', value: parseFloat(netProfit.toFixed(2)), unit: '$' },
          { label: 'Profit ROI', value: parseFloat(((netProfit / spend) * 100).toFixed(1)), unit: '%' }
        ],
        steps: [
          'Formula: ROAS = Total Ad Revenue ÷ Total Ad Spend',
          `ROAS = $${rev.toLocaleString()} ÷ $${spend.toLocaleString()} = ${roasRatio.toFixed(2)}x (${roasPct.toFixed(1)}%)`,
          `Net Profit = $${rev} - $${spend} = $${netProfit.toFixed(2)}`
        ]
      };
    }
  },
  {
    slug: 'cpa-calculator',
    title: 'Cost Per Acquisition (CPA)',
    description: 'Calculate the marketing expenditure required to secure a paying customer or conversion.',
    inputs: [
      { id: 'campaign_spend', label: 'Total Campaign Cost ($)', type: 'number', defaultValue: 3200, min: 1, max: 10000000, step: 50, unit: '$' },
      { id: 'conversions', label: 'Total Conversions / Sales Acquired', type: 'number', defaultValue: 64, min: 1, max: 1000000, step: 1 }
    ],
    calculate: (inputs) => {
      const spend = inputs.campaign_spend || 0;
      const conv = inputs.conversions || 1;
      const cpa = spend / conv;

      return {
        primaryOutput: parseFloat(cpa.toFixed(2)),
        primaryUnit: '$ / Acquisition (CPA)',
        secondaryOutputs: [
          { label: 'Total Conversions', value: conv },
          { label: 'Total Spend', value: parseFloat(spend.toFixed(2)), unit: '$' }
        ],
        steps: [
          'Formula: CPA = Total Campaign Cost ÷ Total Conversions',
          `CPA = $${spend} ÷ ${conv} = $${cpa.toFixed(2)} per paying customer`
        ]
      };
    }
  },
  {
    slug: 'conversion-rate-calculator',
    title: 'Landing Page Conversion Rate',
    description: 'Calculate the conversion rate percentage of landing page visitors taking a desired action.',
    inputs: [
      { id: 'conversions', label: 'Total Conversions (Signups, Orders)', type: 'number', defaultValue: 145, min: 0, max: 1000000, step: 1 },
      { id: 'total_visitors', label: 'Total Unique Visitors / Sessions', type: 'number', defaultValue: 4800, min: 1, max: 10000000, step: 50 }
    ],
    calculate: (inputs) => {
      const conv = inputs.conversions || 0;
      const vis = inputs.total_visitors || 1;
      const cr = (conv / vis) * 100;

      return {
        primaryOutput: parseFloat(cr.toFixed(2)),
        primaryUnit: '% Conversion Rate',
        secondaryOutputs: [
          { label: 'Non-Converting Visitors', value: Math.max(0, vis - conv) },
          { label: 'Conversions per 1,000 Visitors', value: parseFloat(((conv / vis) * 1000).toFixed(1)) }
        ],
        steps: [
          'Formula: Conversion Rate % = (Conversions ÷ Total Visitors) × 100',
          `Conversion Rate = (${conv} ÷ ${vis}) × 100 = ${cr.toFixed(2)}%`
        ]
      };
    }
  },
  {
    slug: 'marketing-clv-calculator',
    title: 'Customer Lifetime Value (LTV)',
    description: 'Estimate customer lifetime value (CLV / LTV) and LTV:CAC marketing efficiency ratio.',
    inputs: [
      { id: 'avg_order_value', label: 'Average Order Value ($)', type: 'number', defaultValue: 85, min: 1, max: 100000, step: 5, unit: '$' },
      { id: 'purchase_frequency', label: 'Purchases per Year per Customer', type: 'number', defaultValue: 4.2, min: 0.1, max: 365, step: 0.1 },
      { id: 'customer_lifespan_years', label: 'Average Customer Lifespan (Years)', type: 'number', defaultValue: 3.5, min: 0.1, max: 50, step: 0.5, unit: 'years' },
      { id: 'gross_margin_pct', label: 'Gross Profit Margin (%)', type: 'number', defaultValue: 65, min: 1, max: 100, step: 1, unit: '%' }
    ],
    calculate: (inputs) => {
      const aov = inputs.avg_order_value || 85;
      const freq = inputs.purchase_frequency || 4;
      const life = inputs.customer_lifespan_years || 3;
      const margin = (inputs.gross_margin_pct || 65) / 100;

      const annualRevenue = aov * freq;
      const lifetimeRevenue = annualRevenue * life;
      const clv = lifetimeRevenue * margin;

      return {
        primaryOutput: parseFloat(clv.toFixed(2)),
        primaryUnit: '$ Margin Lifetime Value',
        secondaryOutputs: [
          { label: 'Gross Lifetime Revenue', value: parseFloat(lifetimeRevenue.toFixed(2)), unit: '$' },
          { label: 'Annual Revenue per Customer', value: parseFloat(annualRevenue.toFixed(2)), unit: '$/yr' },
          { label: 'Max Recommended CAC (3:1 LTV Ratio)', value: parseFloat((clv / 3).toFixed(2)), unit: '$' }
        ],
        steps: [
          `Annual Customer Revenue = $${aov} × ${freq} = $${annualRevenue.toFixed(2)}`,
          `Lifetime Gross Revenue = $${annualRevenue.toFixed(2)} × ${life} yrs = $${lifetimeRevenue.toFixed(2)}`,
          `Margin CLV = $${lifetimeRevenue.toFixed(2)} × ${(margin * 100).toFixed(0)}% = $${clv.toFixed(2)}`
        ]
      };
    }
  },
  {
    slug: 'email-marketing-calculator',
    title: 'Email Open & Click Rate',
    description: 'Calculate email deliverability, open rates, click-through rates, and click-to-open rates (CTOR).',
    inputs: [
      { id: 'emails_sent', label: 'Total Emails Sent', type: 'number', defaultValue: 10000, min: 10, max: 10000000, step: 100 },
      { id: 'bounced', label: 'Bounced Emails', type: 'number', defaultValue: 120, min: 0, max: 1000000, step: 10 },
      { id: 'unique_opens', label: 'Unique Opens', type: 'number', defaultValue: 2450, min: 0, max: 10000000, step: 10 },
      { id: 'unique_clicks', label: 'Unique Clicks', type: 'number', defaultValue: 390, min: 0, max: 10000000, step: 5 }
    ],
    calculate: (inputs) => {
      const sent = inputs.emails_sent || 1000;
      const bounced = inputs.bounced || 0;
      const opens = inputs.unique_opens || 0;
      const clicks = inputs.unique_clicks || 0;

      const delivered = Math.max(1, sent - bounced);
      const deliveryRate = (delivered / sent) * 100;
      const openRate = (opens / delivered) * 100;
      const ctr = (clicks / delivered) * 100;
      const ctor = opens > 0 ? (clicks / opens) * 100 : 0;

      return {
        primaryOutput: parseFloat(openRate.toFixed(2)),
        primaryUnit: '% Open Rate',
        secondaryOutputs: [
          { label: 'Click-to-Open Rate (CTOR)', value: parseFloat(ctor.toFixed(2)), unit: '%' },
          { label: 'Click-Through Rate (CTR)', value: parseFloat(ctr.toFixed(2)), unit: '%' },
          { label: 'Deliverability Rate', value: parseFloat(deliveryRate.toFixed(2)), unit: '%' }
        ],
        steps: [
          `Delivered Emails = ${sent} sent - ${bounced} bounced = ${delivered}`,
          `Open Rate = (${opens} opens ÷ ${delivered} delivered) × 100 = ${openRate.toFixed(2)}%`,
          `CTOR = (${clicks} clicks ÷ ${opens} opens) × 100 = ${ctor.toFixed(2)}%`
        ]
      };
    }
  },
  {
    slug: 'cpl-calculator',
    title: 'Cost Per Lead (CPL)',
    description: 'Calculate average marketing spend required to acquire a qualified sales or inbound lead.',
    inputs: [
      { id: 'marketing_spend', label: 'Total Marketing Spend ($)', type: 'number', defaultValue: 5000, min: 10, max: 1000000, step: 100, unit: '$' },
      { id: 'leads_generated', label: 'Total Leads Generated', type: 'number', defaultValue: 125, min: 1, max: 100000, step: 1 }
    ],
    calculate: (inputs) => {
      const spend = inputs.marketing_spend || 0;
      const leads = inputs.leads_generated || 1;
      const cpl = spend / leads;

      return {
        primaryOutput: parseFloat(cpl.toFixed(2)),
        primaryUnit: '$ / Lead',
        secondaryOutputs: [
          { label: 'Total Leads', value: leads },
          { label: 'Total Budget Expended', value: parseFloat(spend.toFixed(2)), unit: '$' }
        ],
        steps: [
          'Formula: CPL = Total Campaign Spend ÷ Total Leads Generated',
          `CPL = $${spend.toLocaleString()} ÷ ${leads} = $${cpl.toFixed(2)} per lead`
        ]
      };
    }
  },
  {
    slug: 'nps-calculator',
    title: 'Net Promoter Score (NPS)',
    description: 'Calculate customer loyalty NPS score from Promoters (9-10), Passives (7-8), and Detractors (0-6).',
    inputs: [
      { id: 'promoters', label: 'Promoters (Rated 9-10)', type: 'number', defaultValue: 320, min: 0, max: 1000000, step: 1 },
      { id: 'passives', label: 'Passives (Rated 7-8)', type: 'number', defaultValue: 110, min: 0, max: 1000000, step: 1 },
      { id: 'detractors', label: 'Detractors (Rated 0-6)', type: 'number', defaultValue: 45, min: 0, max: 1000000, step: 1 }
    ],
    calculate: (inputs) => {
      const prom = inputs.promoters || 0;
      const pass = inputs.passives || 0;
      const det = inputs.detractors || 0;
      const total = prom + pass + det;

      if (total <= 0) return { primaryOutput: 0, primaryUnit: 'NPS' };

      const pctProm = (prom / total) * 100;
      const pctDet = (det / total) * 100;
      const nps = pctProm - pctDet;

      let tier = 'Good (+0 to +30)';
      if (nps > 70) tier = 'World-Class / Exceptional';
      else if (nps > 30) tier = 'Great (+31 to +70)';
      else if (nps < 0) tier = 'Needs Immediate Attention (Negative)';

      return {
        primaryOutput: Math.round(nps),
        primaryUnit: 'NPS Score (-100 to +100)',
        secondaryOutputs: [
          { label: '% Promoters', value: parseFloat(pctProm.toFixed(1)), unit: '%' },
          { label: '% Detractors', value: parseFloat(pctDet.toFixed(1)), unit: '%' },
          { label: 'Benchmark Tier', value: tier }
        ],
        steps: [
          `Total Respondents = ${total}`,
          `Promoter % = (${prom} ÷ ${total}) × 100 = ${pctProm.toFixed(1)}%`,
          `Detractor % = (${det} ÷ ${total}) × 100 = ${pctDet.toFixed(1)}%`,
          `NPS = % Promoters - % Detractors = ${pctProm.toFixed(1)} - ${pctDet.toFixed(1)} = ${Math.round(nps)}`
        ]
      };
    }
  },
  {
    slug: 'viral-coefficient-calculator',
    title: 'Viral Coefficient (K-factor)',
    description: 'Calculate viral growth coefficient (K-factor) and determine exponential viral growth threshold.',
    inputs: [
      { id: 'invites_per_user', label: 'Average Invitations Sent per User (i)', type: 'number', defaultValue: 5, min: 0, max: 100, step: 0.1 },
      { id: 'conversion_pct', label: 'Acceptance & Conversion Rate (%) (c)', type: 'number', defaultValue: 25, min: 0, max: 100, step: 1, unit: '%' }
    ],
    calculate: (inputs) => {
      const i = inputs.invites_per_user || 0;
      const c = (inputs.conversion_pct || 0) / 100;
      const k = i * c;

      let viralStatus = 'Non-Viral (Linear Drop-off)';
      if (k > 1) viralStatus = 'Exponential Viral Growth (K > 1)';
      else if (k >= 0.8) viralStatus = 'High Viral Boost (K near 1)';

      return {
        primaryOutput: parseFloat(k.toFixed(2)),
        primaryUnit: 'Viral Coefficient (K)',
        secondaryOutputs: [
          { label: 'Growth Classification', value: viralStatus },
          { label: 'New Users from 1,000 Signups (Gen 1)', value: Math.round(1000 * k) },
          { label: 'Viral Threshold Satisfied?', value: k > 1 ? 'YES (Self-Sustaining)' : 'NO (Requires Paid/Organic Fuel)' }
        ],
        steps: [
          'Formula: K-factor = Average Invites Sent (i) × Conversion Rate (c)',
          `K = ${i} × ${(c * 100).toFixed(0)}% = ${k.toFixed(2)}`,
          k > 1 ? 'K > 1 means every user brings more than one new user, causing viral compounding.' : 'K < 1 indicates viral decay where growth eventually flattens without external acquisition.'
        ]
      };
    }
  },
  {
    slug: 'ad-budget-calculator',
    title: 'Ad Budget Estimator',
    description: 'Calculate required advertising budget to achieve specific sales volume and revenue targets.',
    inputs: [
      { id: 'target_orders', label: 'Target Number of Sales / Orders', type: 'number', defaultValue: 250, min: 1, max: 100000, step: 10 },
      { id: 'avg_order_value', label: 'Average Order Value ($)', type: 'number', defaultValue: 120, min: 1, max: 10000, step: 5, unit: '$' },
      { id: 'conversion_rate', label: 'Site Conversion Rate (%)', type: 'number', defaultValue: 2.5, min: 0.1, max: 50, step: 0.1, unit: '%' },
      { id: 'avg_cpc', label: 'Estimated Cost Per Click (CPC) ($)', type: 'number', defaultValue: 1.8, min: 0.05, max: 50, step: 0.05, unit: '$' }
    ],
    calculate: (inputs) => {
      const orders = inputs.target_orders || 100;
      const aov = inputs.avg_order_value || 100;
      const cr = (inputs.conversion_rate || 2) / 100;
      const cpc = inputs.avg_cpc || 1.5;

      const clicksNeeded = orders / cr;
      const budgetNeeded = clicksNeeded * cpc;
      const targetRevenue = orders * aov;
      const targetRoas = budgetNeeded > 0 ? targetRevenue / budgetNeeded : 0;

      return {
        primaryOutput: Math.round(budgetNeeded),
        primaryUnit: '$ Required Budget',
        secondaryOutputs: [
          { label: 'Target Gross Revenue', value: targetRevenue, unit: '$' },
          { label: 'Traffic Clicks Needed', value: Math.round(clicksNeeded) },
          { label: 'Expected ROAS', value: parseFloat(targetRoas.toFixed(2)), unit: 'x' }
        ],
        steps: [
          `Clicks needed for ${orders} orders @ ${(cr * 100).toFixed(1)}% CR = ${Math.round(clicksNeeded)} clicks`,
          `Ad Budget = ${Math.round(clicksNeeded)} clicks × $${cpc.toFixed(2)} = $${Math.round(budgetNeeded)}`,
          `Target Revenue = ${orders} × $${aov} = $${targetRevenue}`
        ]
      };
    }
  },
  {
    slug: 'ppc-roi-calculator',
    title: 'PPC Pay-Per-Click ROI',
    description: 'Calculate net return on investment (ROI %) from pay-per-click advertising considering product cost of goods.',
    inputs: [
      { id: 'ad_spend', label: 'Total PPC Ad Spend ($)', type: 'number', defaultValue: 4000, min: 10, max: 1000000, step: 100, unit: '$' },
      { id: 'gross_revenue', label: 'Gross Revenue from PPC ($)', type: 'number', defaultValue: 14000, min: 0, max: 10000000, step: 500, unit: '$' },
      { id: 'cogs_pct', label: 'Cost of Goods Sold (COGS) (%)', type: 'number', defaultValue: 40, min: 0, max: 95, step: 1, unit: '%' }
    ],
    calculate: (inputs) => {
      const spend = inputs.ad_spend || 1000;
      const rev = inputs.gross_revenue || 0;
      const cogsRate = (inputs.cogs_pct || 40) / 100;

      const cogs = rev * cogsRate;
      const grossProfit = rev - cogs;
      const netProfit = grossProfit - spend;
      const roi = (netProfit / spend) * 100;

      return {
        primaryOutput: parseFloat(roi.toFixed(1)),
        primaryUnit: '% PPC Net ROI',
        secondaryOutputs: [
          { label: 'Net Profit after COGS and Ads', value: parseFloat(netProfit.toFixed(2)), unit: '$' },
          { label: 'Gross Margin before Ads', value: parseFloat(grossProfit.toFixed(2)), unit: '$' },
          { label: 'Cost of Goods Sold (COGS)', value: parseFloat(cogs.toFixed(2)), unit: '$' }
        ],
        steps: [
          `Gross Profit = $${rev} revenue - ($${rev} × ${(cogsRate * 100).toFixed(0)}% COGS) = $${grossProfit.toFixed(2)}`,
          `Net Profit = $${grossProfit.toFixed(2)} - $${spend} ad spend = $${netProfit.toFixed(2)}`,
          `ROI = (Net Profit ÷ Ad Spend) × 100 = ${roi.toFixed(1)}%`
        ]
      };
    }
  },
  {
    slug: 'engagement-rate-calculator',
    title: 'Social Media Engagement Rate',
    description: 'Calculate engagement rate per post or campaign across Instagram, TikTok, LinkedIn, and YouTube.',
    inputs: [
      { id: 'total_engagements', label: 'Total Interactions (Likes + Comments + Shares + Saves)', type: 'number', defaultValue: 850, min: 0, max: 10000000, step: 10 },
      { id: 'follower_count', label: 'Total Followers (or Reach / Impressions)', type: 'number', defaultValue: 25000, min: 1, max: 100000000, step: 100 }
    ],
    calculate: (inputs) => {
      const eng = inputs.total_engagements || 0;
      const followers = inputs.follower_count || 1;
      const er = (eng / followers) * 100;

      let benchmark = 'Average (1% - 3%)';
      if (er > 6) benchmark = 'High Engagement (>6%)';
      else if (er > 3) benchmark = 'Good Engagement (3% - 6%)';
      else if (er < 1) benchmark = 'Low Engagement (<1%)';

      return {
        primaryOutput: parseFloat(er.toFixed(2)),
        primaryUnit: '% Engagement Rate',
        secondaryOutputs: [
          { label: 'Industry Benchmark', value: benchmark },
          { label: 'Interactions per 1,000 Followers', value: parseFloat(((eng / followers) * 1000).toFixed(1)) }
        ],
        steps: [
          'Formula: Engagement Rate % = (Total Engagements ÷ Followers) × 100',
          `ER = (${eng} ÷ ${followers}) × 100 = ${er.toFixed(2)}%`
        ]
      };
    }
  },
  {
    slug: 'bounce-rate-calculator',
    title: 'Website Bounce Rate',
    description: 'Calculate single-page session bounce rate and website user engagement percentage.',
    inputs: [
      { id: 'bounces', label: 'Single-Page Bounced Sessions', type: 'number', defaultValue: 2150, min: 0, max: 10000000, step: 50 },
      { id: 'total_sessions', label: 'Total Website Sessions', type: 'number', defaultValue: 5000, min: 1, max: 10000000, step: 50 }
    ],
    calculate: (inputs) => {
      const bounces = inputs.bounces || 0;
      const total = inputs.total_sessions || 1;
      const bounceRate = (bounces / total) * 100;
      const engagementRate = 100 - bounceRate;

      return {
        primaryOutput: parseFloat(bounceRate.toFixed(1)),
        primaryUnit: '% Bounce Rate',
        secondaryOutputs: [
          { label: 'Engagement Rate (Sessions > 1 page)', value: parseFloat(engagementRate.toFixed(1)), unit: '%' },
          { label: 'Engaged Sessions Count', value: Math.max(0, total - bounces) }
        ],
        steps: [
          'Formula: Bounce Rate % = (Single-Page Sessions ÷ Total Sessions) × 100',
          `Bounce Rate = (${bounces} ÷ ${total}) × 100 = ${bounceRate.toFixed(1)}%`,
          `User Engagement Rate = 100% - ${bounceRate.toFixed(1)}% = ${engagementRate.toFixed(1)}%`
        ]
      };
    }
  }
];
