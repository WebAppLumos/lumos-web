import api from './api'

export const scholarshipApi = {
  // Certifications
  getCertifications: (userId) => api.get(`/api/users/${userId}/certifications`),
  addCertification: (userId, data) => api.post(`/api/users/${userId}/certifications`, data),
  updateCertification: (certId, data) => api.patch(`/api/certifications/${certId}`, data),
  deleteCertification: (certId) => api.delete(`/api/certifications/${certId}`),

  // Language Exams
  getLanguageExams: (userId) => api.get(`/api/users/${userId}/language-exams`),
  addLanguageExam: (userId, data) => api.post(`/api/users/${userId}/language-exams`, data),
  updateLanguageExam: (examId, data) => api.patch(`/api/language-exams/${examId}`, data),
  deleteLanguageExam: (examId) => api.delete(`/api/language-exams/${examId}`),

  // Previous Semester Scores
  getPreviousSemesterScores: (userId) => api.get(`/api/users/${userId}/previous-semester-scores`),
  addPreviousSemesterScore: (userId, data) => api.post(`/api/users/${userId}/previous-semester-scores`, data),
  updatePreviousSemesterScore: (scoreId, data) => api.patch(`/api/previous-semester-scores/${scoreId}`, data),
  deletePreviousSemesterScore: (scoreId) => api.delete(`/api/previous-semester-scores/${scoreId}`),

  // Recent Semester Credits
  getRecentSemesterCredits: () => api.get('/api/recent-semester/total-credits'),
}
