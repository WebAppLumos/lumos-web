import api from '../api'

export async function fetchSemesterGrades() {
  const response = await api.get('/api/users/me/semester-grades')
  return response.data
}
