import { allScholarships } from '../../data/scholarships'

export function computeEligibleScholarships(userProfile) {
  return allScholarships
    .filter((scholarship) => scholarship.checkEligibility(userProfile))
    .map((scholarship) => {
      if (scholarship.id === 1) { // 국가장학금 Ⅰ유형
        const bracketStr = userProfile.incomeBracket || ''

        let amountText = '학기별 최대 220만원' // default/fallback (5구간)
        if (['기초/차상위', '기초', '차상위'].includes(bracketStr)) {
          amountText = '등록금 전액'
        } else if (['1구간', '2구간', '3구간'].includes(bracketStr)) {
          amountText = '학기별 최대 300만원'
        } else if (['4구간', '5구간', '6구간'].includes(bracketStr)) {
          amountText = '학기별 최대 220만원'
        } else if (['7구간', '8구간'].includes(bracketStr)) {
          amountText = '학기별 최대 180만원'
        } else if (bracketStr === '9구간') {
          amountText = '학기별 최대 50만원'
        }

        return {
          ...scholarship,
          amount: amountText,
        }
      }
      return scholarship
    })
}
