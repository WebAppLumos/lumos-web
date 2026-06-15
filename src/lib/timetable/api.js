import api from '../api'
import { TIMETABLE_GRID_START_HOUR, TIMETABLE_HOUR_HEIGHT_REM } from './constants'

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

export function mapSemester(semester, index = 0) {
  const sortOrder = semester.sortOrder ?? index
  return {
    id: semester.id,
    name: semester.title,
    isActive: semester.isActive,
    startDate: semester.startDate,
    endDate: semester.endDate,
    sortOrder,
  }
}

export function mapTimetable(timetable, index = 0) {
  const sortOrder = timetable.sortOrder ?? index
  return {
    id: timetable.id,
    semesterId: timetable.semesterId,
    name: timetable.title,
    sortOrder,
    isDefault: sortOrder === 0,
  }
}

export function mapCourse(course) {
  return {
    id: course.id,
    semesterId: course.semesterId,
    name: course.title,
    professor: course.professor ?? '',
    room: course.classroom ?? '',
    credit: course.credit ?? null,
    isOnline: Boolean(course.isOnline),
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

      const schedules = buildSchedulesFromEntries(timetableEntries, courseId)

      return { ...course, schedules }
    })
    .filter(Boolean)
}

export function pruneNotesByEntries(notes, activeEntries) {
  const activeCourseIds = new Set(activeEntries.map((entry) => Number(entry.courseId)))
  return notes.filter((note) => activeCourseIds.has(Number(note.course_id)))
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


/** 시간표 그리드(9시 시작, 1시간=3.75rem)에 맞춰 블록 위치를 계산합니다. */
export function slotStyleFromTimes(start, end) {
  const topRem = (timeToNumber(start) - TIMETABLE_GRID_START_HOUR) * TIMETABLE_HOUR_HEIGHT_REM
  const heightRem = (timeToNumber(end) - timeToNumber(start)) * TIMETABLE_HOUR_HEIGHT_REM
  return {
    top: `${Math.max(topRem, 0)}rem`,
    height: `${Math.max(heightRem, 0.5)}rem`,
  }
}

/** Edward 등에서 같은 요일에 쪼개진 entry를 하나의 수업 시간으로 합칩니다. */
export function mergeSchedulesByDay(schedules) {
  const byDay = new Map()

  for (const schedule of schedules) {
    const existing = byDay.get(schedule.day)
    if (!existing) {
      byDay.set(schedule.day, { ...schedule })
      continue
    }

    if (timeToNumber(schedule.startTime) < timeToNumber(existing.startTime)) {
      existing.startTime = schedule.startTime
      if (schedule.entryId != null) existing.entryId = schedule.entryId
    }
    if (timeToNumber(schedule.endTime) > timeToNumber(existing.endTime)) {
      existing.endTime = schedule.endTime
    }
  }

  return [...byDay.values()].sort(
    (a, b) => a.day - b.day || timeToNumber(a.startTime) - timeToNumber(b.startTime),
  )
}

export function buildSchedulesFromEntries(entries, courseId) {
  const normalizedCourseId = Number(courseId)
  const schedules = entries
    .filter((entry) => Number(entry.courseId) === normalizedCourseId)
    .filter((entry) => Number(entry.dayOfWeek) >= 1 && Number(entry.dayOfWeek) <= 5)
    .map((entry) => ({
      entryId: entry.id,
      day: apiDayToUi(entry.dayOfWeek),
      startTime: formatTime(entry.startTime),
      endTime: formatTime(entry.endTime),
    }))

  return mergeSchedulesByDay(schedules)
}

export async function fetchSemesters() {
  const { data } = await api.get('/api/semesters')
  return data.map((semester, index) => mapSemester(semester, index))
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

/** 학기 수업 학점 합산 */
export function sumCourseCredits(courses) {
  return courses.reduce((total, course) => total + (Number(course?.credit) || 0), 0)
}

/** 시간표에 배치된 수업만 학점 합산 (DB에만 남은 수업 제외) */
export function sumRegisteredCredits(courses, entries) {
  const enrolledCourseIds = new Set(
    entries.map((entry) => Number(entry.courseId)).filter(Boolean),
  )
  const courseById = new Map(courses.map((course) => [Number(course.id), course]))

  return [...enrolledCourseIds].reduce((total, courseId) => {
    const course = courseById.get(courseId)
    return total + (Number(course?.credit) || 0)
  }, 0)
}

export async function fetchActiveSemesterCredits() {
  const semesters = await fetchSemesters()
  const activeSemester = pickDashboardSemester(semesters)
  if (!activeSemester) return 0

  const courses = await fetchCourses(activeSemester.id)
  return sumCourseCredits(courses)
}

export function buildTimetableSessionSnapshot({
  semesterId,
  timetableId,
  view = 'info',
  semesters,
  timetables,
  courses,
  entries,
  allSemesterEntries,
  notes,
  selectedCourseId = '',
}) {
  const semesterTimetables = timetables.filter((t) => t.semesterId === semesterId)
  const semesterCourses = courses.filter((c) => c.semesterId === semesterId)
  const dashboardTimetable = pickDashboardTimetable(semesterTimetables, allSemesterEntries)
  const todayCourses = dashboardTimetable
    ? getTodayCourses(semesterCourses, allSemesterEntries, dashboardTimetable.id)
    : []

  return {
    semesterId,
    timetableId,
    view,
    semesters,
    timetables,
    courses,
    entries,
    allSemesterEntries,
    notes,
    selectedCourseId,
    todayCourses,
    isWeekend: isWeekendToday(),
  }
}

export async function fetchInitialTimetableSession() {
  const semesters = await fetchSemesters()
  const activeSemester = semesters.find((s) => s.isActive) ?? semesters[0]

  if (!activeSemester) {
    return buildTimetableSessionSnapshot({
      semesterId: null,
      timetableId: null,
      semesters,
      timetables: [],
      courses: [],
      entries: [],
      allSemesterEntries: [],
      notes: [],
    })
  }

  const semesterId = activeSemester.id
  const [timetables, courses] = await Promise.all([
    fetchTimetables(semesterId),
    fetchCourses(semesterId),
  ])

  const timetableId = timetables[0]?.id ?? null
  let allSemesterEntries = []
  let entries = []
  let notes = []

  if (timetables.length > 0) {
    allSemesterEntries = await fetchEntriesForSemester(semesterId, timetables)

    if (timetableId) {
      entries = allSemesterEntries.filter((entry) => entry.timetableId === timetableId)
      const courseIds = [...new Set(entries.map((entry) => entry.courseId))]
      notes = await fetchNotesForCourses(courseIds)
    }
  }

  return buildTimetableSessionSnapshot({
    semesterId,
    timetableId,
    semesters,
    timetables,
    courses,
    entries,
    allSemesterEntries,
    notes,
  })
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

export async function reorderSemesters(semesterIds) {
  const { data } = await api.put('/api/semesters/reorder', { semesterIds })
  return data.map((semester, index) => mapSemester(semester, index))
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

export async function reorderTimetables(semesterId, timetableIds) {
  const { data } = await api.put(`/api/semesters/${semesterId}/timetables/reorder`, {
    timetableIds,
  })
  return data.map((timetable, index) => mapTimetable(timetable, index))
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
