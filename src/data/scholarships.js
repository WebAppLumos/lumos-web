export const allScholarships = [
  {
    id: 1,
    name: '국가장학금 Ⅰ유형',
    provider: '한국장학재단',
    amount: '학기별 최대 260만원',
    tag: '소득연계',
    checkEligibility: (profile) => {
      const credits = parseInt(profile.credits) || 0
      const gpa = parseFloat(profile.gpa) || 0
      return credits >= 12 && gpa >= 2.51
    },
  },
  {
    id: 2,
    name: '성적우수 장학금',
    provider: '본교',
    amount: '등록금 전액',
    tag: '성적',
    checkEligibility: (profile) => {
      const credits = parseInt(profile.credits) || 0
      const gpa = parseFloat(profile.gpa) || 0
      return credits >= 15 && gpa >= 4.0
    },
  },
  {
    id: 3,
    name: '공인토익성적향상격려장학',
    provider: '본교',
    amount: '50만원',
    tag: '자기계발',
    checkEligibility: (profile) => {
      const currentToeic = parseInt(profile.toeic) || 0
      const prevToeic = parseInt(profile.prevToeic) || 0
      const isPrevInBracket = prevToeic >= 600 && prevToeic <= 699
      const isCurrentImproved = currentToeic >= 700 && currentToeic <= 990
      return isPrevInBracket && isCurrentImproved
    },
  },
  {
    id: 4,
    name: '자격증 취득 장학금 (A등급)',
    provider: '본교',
    amount: '50만원',
    tag: '자기계발',
    checkEligibility: (profile) => profile.certificates.some((cert) => cert.score >= 90),
  },
  {
    id: 5,
    name: '자격증 취득 장학금 (B등급)',
    provider: '본교',
    amount: '30만원',
    tag: '자기계발',
    checkEligibility: (profile) => profile.certificates.some((cert) => cert.score >= 70 && cert.score < 90),
  },
  {
    id: 6,
    name: '자격증 취득 장학금 (C등급)',
    provider: '본교',
    amount: '20만원',
    tag: '자기계발',
    checkEligibility: (profile) => profile.certificates.some((cert) => cert.score >= 60 && cert.score < 70),
  },
]
