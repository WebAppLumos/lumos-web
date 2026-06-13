import { useCallback, useEffect, useMemo, useState } from 'react'

import { DAYS, TIME_SLOTS } from '../../lib/mock-data'
import {
  apiDayToUi,
  buildCoursesOnBoard,
  buildSchedulesFromEntries,
  createEntry,
  createNote,
  createTimetable,
  deleteEntry,
  deleteNote,
  deleteTimetable,
  fetchCourses,
  fetchEntries,
  fetchEntriesForSemester,
  fetchNotesForCourses,
  fetchSemesters,
  fetchTimetables,
  formatTime,
  mapCourse,
  mergeSchedulesByDay,
  slotStyleFromTimes,
  uiDayToApi,
  updateNote,
  updateSemester,
  updateTimetable,
} from '../../lib/timetableApi'

import TimetableCourseList from '../../components/Timetable/TimetableCourseList'
import TimetableControls from '../../components/Timetable/TimetableControls'
import TimetableGrid from '../../components/Timetable/TimetableGrid'
import TimetableHeader from '../../components/Timetable/TimetableHeader'
import TimetableTabs from '../../components/Timetable/TimetableTabs'
import DashboardNav from '../../components/Dashboard/DashboardNav'
import DashboardLoginCard from '../../components/Dashboard/DashboardLoginCard'

import '../Dashboard/Dashboard.css'
import './Timetable.css'

export default function Timetable() {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('lumos_user_info')
    return storedUser ? JSON.parse(storedUser) : null
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [semesterId, setSemesterId] = useState(null)
  const [timetableId, setTimetableId] = useState(null)
  const [view, setView] = useState('info')
  const [semesters, setSemesters] = useState([])
  const [timetables, setTimetables] = useState([])
  const [courses, setCourses] = useState([])
  const [entries, setEntries] = useState([])
  const [allSemesterEntries, setAllSemesterEntries] = useState([])
  const [notes, setNotes] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState('')

  const loadSemesterData = useCallback(async (nextSemesterId, preferredTimetableId) => {
    const [nextTimetables, nextCourses] = await Promise.all([
      fetchTimetables(nextSemesterId),
      fetchCourses(nextSemesterId),
    ])

    setTimetables((prev) => {
      const others = prev.filter((t) => t.semesterId !== nextSemesterId)
      return [...others, ...nextTimetables]
    })
    setCourses((prev) => {
      const others = prev.filter((c) => c.semesterId !== nextSemesterId)
      return [...others, ...nextCourses]
    })

    const nextTimetableId = preferredTimetableId
      && nextTimetables.some((t) => t.id === preferredTimetableId)
      ? preferredTimetableId
      : nextTimetables[0]?.id ?? null

    setTimetableId(nextTimetableId)

    if (nextTimetables.length === 0) {
      setEntries([])
      setAllSemesterEntries([])
      setNotes([])
      return
    }

    const semesterEntries = await fetchEntriesForSemester(nextSemesterId, nextTimetables)
    setAllSemesterEntries((prev) => {
      const others = prev.filter((entry) => !nextTimetables.some((t) => t.id === entry.timetableId))
      return [...others, ...semesterEntries]
    })

    if (nextTimetableId) {
      const timetableEntries = semesterEntries.filter((entry) => entry.timetableId === nextTimetableId)
      setEntries((prev) => {
        const others = prev.filter((entry) => entry.timetableId !== nextTimetableId)
        return [...others, ...timetableEntries]
      })

      const courseIds = [...new Set(timetableEntries.map((entry) => entry.courseId))]
      const nextNotes = await fetchNotesForCourses(courseIds)
      setNotes((prev) => {
        const others = prev.filter((note) => !courseIds.includes(note.course_id))
        return [...others, ...nextNotes]
      })
    }
  }, [])

  const loadInitialData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const nextSemesters = await fetchSemesters()
      setSemesters(nextSemesters)

      const activeSemester = nextSemesters.find((s) => s.isActive) ?? nextSemesters[0]
      if (!activeSemester) {
        setSemesterId(null)
        setTimetableId(null)
        return
      }

      setSemesterId(activeSemester.id)
      await loadSemesterData(activeSemester.id)
    } catch (err) {
      console.error(err)
      setError('시간표 데이터를 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }, [loadSemesterData])

  useEffect(() => {
    if (user) {
      loadInitialData()
    } else {
      setLoading(false)
    }
  }, [user, loadInitialData])

  const reloadTimetableEntries = useCallback(async (targetTimetableId) => {
    const timetableEntries = await fetchEntries(targetTimetableId)
    setEntries((prev) => {
      const others = prev.filter((entry) => entry.timetableId !== targetTimetableId)
      return [...others, ...timetableEntries]
    })
    setAllSemesterEntries((prev) => {
      const others = prev.filter((entry) => entry.timetableId !== targetTimetableId)
      return [...others, ...timetableEntries]
    })

    const courseIds = [...new Set(timetableEntries.map((entry) => entry.courseId))]
    const nextNotes = await fetchNotesForCourses(courseIds)
    setNotes((prev) => {
      const others = prev.filter((note) => !courseIds.includes(note.course_id))
      return [...others, ...nextNotes]
    })
  }, [])

  const semesterCourses = useMemo(
    () => courses.filter((course) => course.semesterId === semesterId),
    [courses, semesterId],
  )

  const coursesOnBoard = useMemo(
    () => buildCoursesOnBoard(semesterCourses, entries, timetableId),
    [semesterCourses, entries, timetableId],
  )

  const availableCourses = useMemo(() => {
    const onBoardIds = new Set(
      entries
        .filter((entry) => entry.timetableId === timetableId)
        .map((entry) => entry.courseId),
    )

    return semesterCourses
      .filter((course) => !onBoardIds.has(course.id))
      .map((course) => {
        const mapped = mapCourse(course)
        const schedules = buildSchedulesFromEntries(allSemesterEntries, course.id)
        return { ...mapped, schedules }
      })
  }, [semesterCourses, entries, timetableId, allSemesterEntries])

  const semester = semesters.find((s) => s.id === semesterId)
  const timetable = timetables.find((t) => t.id === timetableId)
  const semTimetables = timetables.filter((t) => t.semesterId === semesterId)
  const selectedAvailableCourseId = availableCourses.some((c) => c.id === selectedCourseId)
    ? selectedCourseId
    : availableCourses[0]?.id ?? ''

  const onChangeSemester = async (nextSemesterId) => {
    setSemesterId(nextSemesterId)
    try {
      await loadSemesterData(nextSemesterId)
    } catch (err) {
      console.error(err)
      window.alert('학기 데이터를 불러오지 못했습니다.')
    }
  }

  const onChangeTimetable = async (nextTimetableId) => {
    setTimetableId(nextTimetableId)
    try {
      await reloadTimetableEntries(nextTimetableId)
    } catch (err) {
      console.error(err)
      window.alert('시간표 데이터를 불러오지 못했습니다.')
    }
  }

  const onRenameSemester = async (targetSemesterId, name) => {
    const nextName = name.trim()
    if (!nextName) return

    try {
      const updated = await updateSemester(targetSemesterId, nextName)
      setSemesters((prev) => prev.map((s) => (s.id === targetSemesterId ? updated : s)))
    } catch (err) {
      console.error(err)
      window.alert('학기 이름을 변경하지 못했습니다.')
    }
  }

  const onRenameTimetable = async (targetTimetableId, name) => {
    const nextName = name.trim()
    if (!nextName) return

    try {
      const updated = await updateTimetable(targetTimetableId, nextName)
      setTimetables((prev) => prev.map((t) => (t.id === targetTimetableId ? updated : t)))
    } catch (err) {
      console.error(err)
      window.alert('시간표 이름을 변경하지 못했습니다.')
    }
  }

  const onAddTimetable = async (name) => {
    const nextName = name.trim()
    if (!nextName) return

    try {
      const created = await createTimetable(semesterId, nextName)
      setTimetables((prev) => [...prev, created])
      setTimetableId(created.id)
      setEntries((prev) => prev.filter((entry) => entry.timetableId !== created.id))
      setNotes([])
    } catch (err) {
      console.error(err)
      window.alert('시간표를 추가하지 못했습니다.')
    }
  }

  const onDeleteTimetables = async (targetTimetableIds) => {
    if (targetTimetableIds.length === 0) return

    try {
      await Promise.all(targetTimetableIds.map((id) => deleteTimetable(id)))

      const remaining = timetables.filter((t) => !targetTimetableIds.includes(t.id))
      setTimetables(remaining)
      setEntries((prev) => prev.filter((entry) => !targetTimetableIds.includes(entry.timetableId)))
      setAllSemesterEntries((prev) => prev.filter((entry) => !targetTimetableIds.includes(entry.timetableId)))

      if (targetTimetableIds.includes(timetableId)) {
        const nextSelected = remaining.find((t) => t.semesterId === semesterId)
        setTimetableId(nextSelected?.id ?? null)
        if (nextSelected?.id) {
          await reloadTimetableEntries(nextSelected.id)
        } else {
          setNotes([])
        }
      }
    } catch (err) {
      console.error(err)
      window.alert('시간표를 삭제하지 못했습니다.')
    }
  }

  const onAddCourse = async () => {
    const course = availableCourses.find((c) => c.id === selectedAvailableCourseId)
    if (!course) {
      window.alert('추가할 수업이 없습니다.')
      return
    }

    const templates = allSemesterEntries
      .filter((entry) => Number(entry.courseId) === Number(course.id))
      .filter((entry) => Number(entry.dayOfWeek) >= 1 && Number(entry.dayOfWeek) <= 5)

    const slots = templates.length > 0
      ? mergeSchedulesByDay(templates.map((entry) => ({
          day: apiDayToUi(entry.dayOfWeek),
          startTime: formatTime(entry.startTime),
          endTime: formatTime(entry.endTime),
        }))).map((schedule) => ({
          dayOfWeek: uiDayToApi(schedule.day),
          startTime: schedule.startTime,
          endTime: schedule.endTime,
        }))
      : [{ dayOfWeek: uiDayToApi(0), startTime: '09:00', endTime: '10:30' }]

    try {
      const created = await Promise.all(
        slots.map((slot) => createEntry(timetableId, {
          courseId: course.id,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
        })),
      )
      setEntries((prev) => [...prev, ...created])
      setAllSemesterEntries((prev) => [...prev, ...created])

      const existingNotes = notes.filter((note) => note.course_id === course.id)
      if (existingNotes.length === 0) {
        const courseNotes = await fetchNotesForCourses([course.id])
        setNotes((prev) => [...prev, ...courseNotes])
      }
    } catch (err) {
      console.error(err)
      window.alert('수업을 시간표에 추가하지 못했습니다.')
    }
  }

  const onDeleteCourse = async (courseId) => {
    const targetEntries = entries.filter(
      (entry) => entry.timetableId === timetableId && entry.courseId === courseId,
    )
    if (targetEntries.length === 0) return

    try {
      await Promise.all(targetEntries.map((entry) => deleteEntry(entry.id)))
      const targetIds = new Set(targetEntries.map((entry) => entry.id))
      setEntries((prev) => prev.filter((entry) => !targetIds.has(entry.id)))
      setAllSemesterEntries((prev) => prev.filter((entry) => !targetIds.has(entry.id)))
    } catch (err) {
      console.error(err)
      window.alert('수업을 시간표에서 제거하지 못했습니다.')
    }
  }

  const onAddNote = async (courseId, note) => {
    try {
      const created = await createNote(courseId, note)
      setNotes((prev) => [...prev, created])
    } catch (err) {
      console.error(err)
      window.alert('노트를 추가하지 못했습니다.')
    }
  }

  const onDeleteNotes = async (noteIds) => {
    try {
      await Promise.all(noteIds.map((noteId) => deleteNote(noteId)))
      setNotes((prev) => prev.filter((note) => !noteIds.includes(note.note_id)))
    } catch (err) {
      console.error(err)
      window.alert('노트를 삭제하지 못했습니다.')
    }
  }

  const onUpdateNote = async (noteId, updates) => {
    const previous = notes.find((note) => note.note_id === noteId)
    if (!previous) return

    try {
      const updated = await updateNote(noteId, updates, previous.is_pinned)
      setNotes((prev) => prev.map((note) => (note.note_id === noteId ? updated : note)))
    } catch (err) {
      console.error(err)
      window.alert('노트를 수정하지 못했습니다.')
    }
  }

  if (!user) {
    return (
      <div className="dashboardPage">
        <DashboardNav user={user} />
        <main className="dashboardMain">
          <div className="Timetable">
            <TimetableHeader />
            <DashboardLoginCard />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="dashboardPage">
      <DashboardNav user={user} onLogout={() => setUser(null)} />
      <main className="dashboardMain">
        <div className="Timetable">
          <TimetableHeader />

          {loading && <p className="timetableStatus">시간표를 불러오는 중...</p>}
          {!loading && error && <p className="timetableStatus">{error}</p>}
          {!loading && !error && semesters.length === 0 && (
            <p className="timetableStatus">등록된 학기가 없습니다. EDWARD 동기화 후 다시 확인해주세요.</p>
          )}

          {!loading && !error && semesters.length > 0 && (
            <>
              <TimetableControls
                DAYS={DAYS}
                semesterId={semesterId}
                timetableId={timetableId}
                mockSemesters={semesters}
                semTimetables={semTimetables}
                availableCourses={availableCourses}
                selectedCourseId={selectedAvailableCourseId}
                onChangeSemester={onChangeSemester}
                onChangeTimetable={onChangeTimetable}
                onChangeCourse={(e) => setSelectedCourseId(e.target.value)}
                onAddCourse={onAddCourse}
                onRenameSemester={onRenameSemester}
                onRenameTimetable={onRenameTimetable}
                onAddTimetable={onAddTimetable}
                onDeleteTimetables={onDeleteTimetables}
              />

              <TimetableTabs view={view} setView={setView} />

              <TimetableGrid
                DAYS={DAYS}
                TIME_SLOTS={TIME_SLOTS}
                semester={semester}
                timetable={timetable}
                semTimetables={semTimetables}
                coursesOnBoard={coursesOnBoard}
                notes={notes}
                view={view}
                slotStyle={slotStyleFromTimes}
                onDeleteCourse={onDeleteCourse}
                onAddNote={onAddNote}
                onDeleteNotes={onDeleteNotes}
                onUpdateNote={onUpdateNote}
              />

              <TimetableCourseList
                DAYS={DAYS}
                coursesOnBoard={coursesOnBoard}
                notes={notes}
                view={view}
                onDeleteCourse={onDeleteCourse}
              />
            </>
          )}
        </div>
      </main>
    </div>
  )
}
