/** EDWARD 동기화 성적 요약 API (마이페이지 성적 탭) */
import api from '../api'

/** GET /api/users/me/semester-grades — 학기별 GPA·이수학점 요약 */
export async function fetchSemesterGrades() {
  const response = await api.get('/api/users/me/semester-grades')
  return response.data
}
