import { allScholarships } from '../../data/scholarships'

export function computeEligibleScholarships(userProfile) {
  return allScholarships.filter((scholarship) => scholarship.checkEligibility(userProfile))
}
