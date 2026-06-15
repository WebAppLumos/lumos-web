const TERM_SORT = {
  1: 1,
  3: 2,
  2: 3,
  4: 4,
};

export function getCurrentSemesterContext() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  if (month >= 3 && month <= 8) {
    return { academicYear: year, termCode: '1' };
  }

  if (month >= 9) {
    return { academicYear: year, termCode: '2' };
  }

  return { academicYear: year - 1, termCode: '2' };
}

export function getPreviousSemesterContext() {
  const current = getCurrentSemesterContext();

  if (current.termCode === '1') {
    return { academicYear: current.academicYear - 1, termCode: '2' };
  }

  return { academicYear: current.academicYear, termCode: '1' };
}

function compareSemestersDesc(a, b) {
  if (a.academicYear !== b.academicYear) {
    return b.academicYear - a.academicYear;
  }

  return (TERM_SORT[b.termCode] || 0) - (TERM_SORT[a.termCode] || 0);
}

export function pickPreviousSemesterGrade(semesters = []) {
  if (!semesters.length) {
    return null;
  }

  const previous = getPreviousSemesterContext();
  const exact = semesters.find(
    (semester) => semester.academicYear === previous.academicYear
      && semester.termCode === previous.termCode,
  );

  if (exact) {
    return exact;
  }

  return [...semesters].sort(compareSemestersDesc)[0];
}

export function buildScholarshipAcademicFields(gradeSummary) {
  const previousSemester = pickPreviousSemesterGrade(gradeSummary?.semesters);

  return {
    gpa: previousSemester?.gpa != null ? String(previousSemester.gpa) : '',
    credits: previousSemester?.completedCredits != null
      ? String(previousSemester.completedCredits)
      : '',
  };
}
