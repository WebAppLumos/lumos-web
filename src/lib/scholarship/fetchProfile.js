import certificationsData from '../../data/certifications.json'
import { fetchSemesterGrades } from '../grades/api'
import { buildScholarshipAcademicFields } from '../grades/scholarshipProfile'
import { scholarshipApi } from '../scholarshipApi'
import { computeEligibleScholarships } from './eligibility'
import { createEmptyScholarshipProfile } from './emptyProfile'

function getCurrentSemesterLabel() {
  const month = new Date().getMonth() + 1
  return (month >= 3 && month <= 8) ? '1학기' : '2학기'
}

export function buildScholarshipSession(userProfile, curationCompleted = false) {
  return {
    userProfile,
    eligibleScholarships: computeEligibleScholarships(userProfile),
    curationCompleted: Boolean(curationCompleted),
  }
}

export function normalizeIncomeBracket(val) {
  if (val === undefined || val === null) return null
  const trimmed = String(val).trim()
  if (trimmed === '기초/차상위' || trimmed.endsWith('구간')) {
    return trimmed
  }
  if (/^\d+$/.test(trimmed)) {
    return `${trimmed}구간`
  }
  return trimmed
}

export function patchSessionWithUser(session, user) {
  if (!session || !user) {
    return session
  }

  const userProfile = {
    ...session.userProfile,
    major: user.major || user.department || session.userProfile.major,
    grade: user.grade ? `${user.grade}학년` : session.userProfile.grade,
    incomeBracket: normalizeIncomeBracket(user.incomeBracket) || session.userProfile.incomeBracket,
  }

  return buildScholarshipSession(
    userProfile,
    user.scholarshipCurationCompleted ?? session.curationCompleted,
  )
}

export async function fetchScholarshipProfile(user) {
  const uid = localStorage.getItem('lumos_uid')
  const baseProfile = createEmptyScholarshipProfile()

  try {
    const [gradeSummary, certRes, examRes] = await Promise.all([
      fetchSemesterGrades().catch(() => null),
      scholarshipApi.getCertifications(uid),
      scholarshipApi.getLanguageExams(uid),
    ])

    const academicFields = buildScholarshipAcademicFields(gradeSummary)

    const mappedCertificates = (certRes.data || []).map((dbCert) => {
      const certInfo = certificationsData.find((item) => item.name === dbCert.certName)
      return {
        certId: dbCert.certId,
        name: dbCert.certName,
        date: dbCert.issueDate,
        score: certInfo ? certInfo.score : 0,
      }
    })

    const exams = (examRes.data || []).sort((a, b) => b.examId - a.examId)
    const currentYear = new Date().getFullYear()
    const currentSemester = getCurrentSemesterLabel()

    const currentExam = exams.find(
      (exam) => exam.year === currentYear
        && exam.semester === currentSemester
        && exam.examCategory === 'TOEIC',
    )
    const prevExam = exams
      .filter(
        (exam) => !(exam.year === currentYear && exam.semester === currentSemester)
          && exam.examCategory === 'TOEIC',
      )
      .sort((a, b) => (b.year !== a.year ? b.year - a.year : b.semester.localeCompare(a.semester)))[0]

    let incomeBracket = baseProfile.incomeBracket
    try {
      const profileRes = await scholarshipApi.getUserProfile()
      if (profileRes.data?.incomeBracket !== undefined && profileRes.data?.incomeBracket !== null) {
        incomeBracket = normalizeIncomeBracket(profileRes.data.incomeBracket) || incomeBracket
      }
    } catch (err) {
      console.error('Failed to fetch user income bracket:', err)
    }

    const userProfile = {
      ...baseProfile,
      major: user.major || user.department || '',
      grade: user.grade ? `${user.grade}학년` : '',
      gpa: academicFields.gpa,
      credits: academicFields.credits,
      certificates: mappedCertificates,
      toeic: currentExam ? currentExam.score.toString() : '',
      prevToeic: prevExam ? prevExam.score.toString() : '',
      currentExamId: currentExam ? currentExam.examId : null,
      prevExamId: prevExam ? prevExam.examId : null,
      incomeBracket,
    }

    return buildScholarshipSession(userProfile, user.scholarshipCurationCompleted)
  } catch (error) {
    console.error('Failed to fetch scholarship profile:', error)

    const fallbackProfile = {
      ...baseProfile,
      major: user.major || user.department || '',
      grade: user.grade ? `${user.grade}학년` : '',
    }

    return buildScholarshipSession(fallbackProfile, user.scholarshipCurationCompleted)
  }
}
