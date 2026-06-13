import api from './api'

const COURSE_COLORS = [
  '#6366f1',
  '#10b981',
  '#f59e0b',
  '#ec4899',
  '#8b5cf6',
  '#14b8a6',
  '#f97316',
  '#3b82f6',
]

export function formatTime(time) {
  if (!time) return ''
  return String(time).slice(0, 5)
}

export function apiDayToUi(dayOfWeek) {
  return Number(dayOfWeek) - 1
}

export function uiDayToApi(day) {
  return day + 1
}

export function getTodayApiDayOfWeek() {
  const jsDay = new Date().getDay()
  return jsDay === 0 ? 7 : jsDay
}

export function isWeekendToday() {
  return getTodayApiDayOfWeek() > 5
}

export const EDWARD_TIMETABLE_TITLE = 'EDWARD 동기화'

export function pickDashboardTimetable(timetables, entries) {
  if (!timetables.length) return null

  const entryCountByTimetable = new Map(
    timetables.map((timetable) => [
      timetable.id,
      entries.filter((entry) => (entry.timetableId ?? timetable.id) === timetable.id).length,
    ]),
  )

  const edwardTimetable = timetables.find(
    (timetable) => timetable.name === EDWARD_TIMETABLE_TITLE
      && (entryCountByTimetable.get(timetable.id) ?? 0) > 0,
  )
  if (edwardTimetable) return edwardTimetable

  const withEntries = timetables
    .filter((timetable) => (entryCountByTimetable.get(timetable.id) ?? 0) > 0)
    .sort((a, b) => (entryCountByTimetable.get(b.id) ?? 0) - (entryCountByTimetable.get(a.id) ?? 0))

  return withEntries[0] ?? timetables.find((timetable) => timetable.isDefault) ?? timetables[0]
}

export function pickDashboardSemester(semesters) {
  if (!semesters.length) return null
  return semesters.find((semester) => semester.isActive) ?? semesters[semesters.length - 1]
}

export function colorForCourseId(id) {
  return COURSE_COLORS[Number(id) % COURSE_COLORS.length]
}

export function mapSemester(semester) {
  return {
    id: semester.id,
    name: semester.title,
    isActive: semester.isActive,
    startDate: semester.startDate,
    endDate: semester.endDate,
  }
}

export function mapTimetable(timetable, index = 0) {
  return {
    id: timetable.id,
    semesterId: timetable.semesterId,
    name: timetable.title,
    isDefault: index === 0,
  }
}

export function mapCourse(course) {
  return {
    id: course.id,
    semesterId: course.semesterId,
    name: course.title,
    professor: course.professor ?? '',
    room: course.classroom ?? '',
    difficulty: course.difficultyLevel ?? 3,
    color: colorForCourseId(course.id),
    schedules: [],
  }
}

export function mapNote(note) {
  return {
    note_id: note.id,
    course_id: note.courseId,
    title: note.title,
    content: note.content ?? '',
    is_pinned: note.isPinned ?? false,
    created_at: note.createdAt,
    updated_at: note.updatedAt,
  }
}

export function buildCoursesOnBoard(courses, entries, timetableId) {
  const timetableEntries = entries.filter(
    (entry) => (entry.timetableId ?? timetableId) === timetableId,
  )
  const courseIds = [...new Set(timetableEntries.map((entry) => entry.courseId))]
  const courseById = new Map(courses.map((course) => [course.id, mapCourse(course)]))

  return courseIds
    .map((courseId) => {
      const course = courseById.get(courseId)
      if (!course) return null

      const schedules = timetableEntries
        .filter((entry) => entry.courseId === courseId)
        .filter((entry) => entry.dayOfWeek >= 1 && entry.dayOfWeek <= 5)
        .map((entry) => ({
          entryId: entry.id,
          day: apiDayToUi(entry.dayOfWeek),
          startTime: formatTime(entry.startTime),
          endTime: formatTime(entry.endTime),
        }))

      return { ...course, schedules }
    })
    .filter(Boolean)
}

export function getTodayCourses(courses, entries, timetableId) {
  const today = getTodayApiDayOfWeek()
  if (today > 5) return []

  const uiDay = today - 1
  return buildCoursesOnBoard(courses, entries, timetableId)
    .map((course) => ({
      ...course,
      schedules: course.schedules.filter((schedule) => schedule.day === uiDay),
    }))
    .filter((course) => course.schedules.length > 0)
    .sort(
      (a, b) =>
        timeToNumber(a.schedules[0].startTime) - timeToNumber(b.schedules[0].startTime),
    )
}

function timeToNumber(time) {
  const [hours, minutes] = time.split(':').map(Number)
  return hours + minutes / 60
}

export async function fetchSemesters() {
  const { data } = await api.get('/api/semesters')
  return data.map(mapSemester)
}

export async function fetchTimetables(semesterId) {
  const { data } = await api.get(`/api/semesters/${semesterId}/timetables`)
  return data.map((timetable, index) => mapTimetable(timetable, index))
}

export async function fetchCourses(semesterId) {
  const { data } = await api.get(`/api/semesters/${semesterId}/courses`)
  return data
}

export async function fetchEntries(timetableId) {
  const { data } = await api.get(`/api/timetables/${timetableId}/entries`)
  return data
}

export async function fetchEntriesForSemester(semesterId, timetables) {
  if (timetables.length === 0) return []

  const results = await Promise.all(
    timetables.map(async (timetable) => {
      const entries = await fetchEntries(timetable.id)
      return entries.map((entry) => ({ ...entry, timetableId: entry.timetableId ?? timetable.id }))
    }),
  )
  return results.flat()
}

export async function fetchDashboardTimetableData() {
  const semesters = await fetchSemesters()
  const semester = pickDashboardSemester(semesters)
  if (!semester) {
    return { courses: [], entries: [], timetableId: null, isWeekend: isWeekendToday() }
  }

  const timetables = await fetchTimetables(semester.id)
  const [courses, entries] = await Promise.all([
    fetchCourses(semester.id),
    fetchEntriesForSemester(semester.id, timetables),
  ])

  const timetable = pickDashboardTimetable(timetables, entries)
  return {
    courses,
    entries,
    timetableId: timetable?.id ?? null,
    isWeekend: isWeekendToday(),
  }
}

export async function fetchNotesForCourses(courseIds) {
  if (courseIds.length === 0) return []

  const results = await Promise.all(
    courseIds.map(async (courseId) => {
      const { data } = await api.get(`/api/courses/${courseId}/notes`)
      return data.map(mapNote)
    }),
  )
  return results.flat()
}

export async function updateSemester(semesterId, title) {
  const { data } = await api.patch(`/api/semesters/${semesterId}`, { title })
  return mapSemester(data)
}

export async function updateTimetable(timetableId, title) {
  const { data } = await api.patch(`/api/timetables/${timetableId}`, { title })
  return mapTimetable(data)
}

export async function createTimetable(semesterId, title) {
  const { data } = await api.post(`/api/semesters/${semesterId}/timetables`, { title })
  return mapTimetable(data)
}

export async function deleteTimetable(timetableId) {
  await api.delete(`/api/timetables/${timetableId}`)
}

export async function createEntry(timetableId, { courseId, dayOfWeek, startTime, endTime }) {
  const { data } = await api.post(`/api/timetables/${timetableId}/entries`, {
    courseId,
    dayOfWeek,
    startTime,
    endTime,
  })
  return data
}

export async function deleteEntry(entryId) {
  await api.delete(`/api/entries/${entryId}`)
}

export async function createNote(courseId, { title, content, is_pinned: isPinned }) {
  const { data } = await api.post(`/api/courses/${courseId}/notes`, { title, content })
  if (isPinned) {
    const pinned = await api.patch(`/api/notes/${data.id}/pin`, { isPinned: true })
    return mapNote(pinned.data)
  }
  return mapNote(data)
}

export async function updateNote(noteId, { title, content, is_pinned: isPinned }, previousPinned) {
  const { data } = await api.patch(`/api/notes/${noteId}`, { title, content })
  if (isPinned !== previousPinned) {
    const pinned = await api.patch(`/api/notes/${noteId}/pin`, { isPinned })
    return mapNote(pinned.data)
  }
  return mapNote(data)
}

export async function deleteNote(noteId) {
  await api.delete(`/api/notes/${noteId}`)
}

export async function syncTimetableFromEdward(credentials) {
  const { data } = await api.post('/api/sync/timetable', credentials)
  return data
}
