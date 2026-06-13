import { useCallback, useEffect, useMemo, useState } from 'react'

import { useStoredUser } from '../../lib/useStoredUser'
import { DAYS, TIME_SLOTS } from '../../lib/timetable/constants'
import {
  apiDayToUi,
  buildCoursesOnBoard,
  buildSchedulesFromEntries,
  buildTimetableSessionSnapshot,
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
  fetchTimetables,
  formatTime,
  mapCourse,
  mergeSchedulesByDay,
  pruneNotesByEntries,
  reorderSemesters,
  reorderTimetables,
  slotStyleFromTimes,
  uiDayToApi,
  updateNote,
  updateSemester,
  updateTimetable,
} from '../../lib/timetable/api'
import {
  clearTimetableSession,
  ensureTimetableSession,
  getTimetableSession,
  setTimetableSession,
} from '../../lib/timetable/session'

import TimetableCourseList from '../../components/Timetable/TimetableCourseList'
import TimetableControls from '../../components/Timetable/TimetableControls'
import TimetableGrid from '../../components/Timetable/TimetableGrid'
import TimetableHeader from '../../components/Timetable/TimetableHeader'
import TimetableOnlineCourses from '../../components/Timetable/TimetableOnlineCourses'
import TimetableTabs from '../../components/Timetable/TimetableTabs'
import DashboardNav from '../../components/Dashboard/DashboardNav'
import DashboardLoginCard from '../../components/Dashboard/DashboardLoginCard'

import '../Dashboard/Dashboard.css'
import './Timetable.css'

export default function Timetable() {
  const session = getTimetableSession()

  const [user, setUser] = useStoredUser()
  const [loading, setLoading] = useState(() => !session)
  const [error, setError] = useState('')
  const [semesterId, setSemesterId] = useState(() => session?.semesterId ?? null)
  const [timetableId, setTimetableId] = useState(() => session?.timetableId ?? null)
  const [view, setView] = useState(() => session?.view ?? 'info')
  const [semesters, setSemesters] = useState(() => session?.semesters ?? [])
  const [timetables, setTimetables] = useState(() => session?.timetables ?? [])
  const [courses, setCourses] = useState(() => session?.courses ?? [])
  const [entries, setEntries] = useState(() => session?.entries ?? [])
  const [allSemesterEntries, setAllSemesterEntries] = useState(() => session?.allSemesterEntries ?? [])
  const [notes, setNotes] = useState(() => session?.notes ?? [])
  const [selectedCourseId, setSelectedCourseId] = useState(() => session?.selectedCourseId ?? '')

  const applySession = useCallback((nextSession) => {
    setSemesters(nextSession.semesters)
    setSemesterId(nextSession.semesterId)
    setTimetableId(nextSession.timetableId)
    setView(nextSession.view ?? 'info')
    setTimetables(nextSession.timetables)
    setCourses(nextSession.courses)
    setEntries(nextSession.entries)
    setAllSemesterEntries(nextSession.allSemesterEntries)
    setNotes(nextSession.notes)
    setSelectedCourseId(nextSession.selectedCourseId ?? '')
  }, [])

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
        const mergedEntries = semesterEntries
        const pruned = pruneNotesByEntries(prev, mergedEntries)
        const kept = pruned.filter((note) => !courseIds.includes(note.course_id))
        return [...kept, ...nextNotes]
      })
    }
  }, [])

  useEffect(() => {
    if (!user) {
      clearTimetableSession()
      setLoading(false)
      return
    }

    const cached = getTimetableSession()
    if (cached) {
      applySession(cached)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError('')

    ensureTimetableSession()
      .then((nextSession) => {
        if (cancelled) return
        applySession(nextSession)
      })
      .catch((err) => {
        console.error(err)
        if (!cancelled) {
          setError('시간표 데이터를 불러오지 못했습니다.')
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [user, applySession])

  useEffect(() => {
    if (!user || loading) return

    setTimetableSession(buildTimetableSessionSnapshot({
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
    }))
  }, [
    user,
    loading,
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
  ])

  const reloadTimetableEntries = useCallback(async (targetTimetableId) => {
    const timetableEntries = await fetchEntries(targetTimetableId)
    const courseIds = [...new Set(timetableEntries.map((entry) => entry.courseId))]
    const fetchedNotes = courseIds.length > 0 ? await fetchNotesForCourses(courseIds) : []

    setEntries((prev) => {
      const others = prev.filter((entry) => entry.timetableId !== targetTimetableId)
      return [...others, ...timetableEntries]
    })

    setAllSemesterEntries((prev) => {
      const others = prev.filter((entry) => entry.timetableId !== targetTimetableId)
      const merged = [...others, ...timetableEntries]

      setNotes((prevNotes) => {
        const pruned = pruneNotesByEntries(prevNotes, merged)
        const kept = pruned.filter((note) => !courseIds.includes(note.course_id))
        return [...kept, ...fetchedNotes]
      })

      return merged
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

  const onlineCourses = useMemo(
    () => coursesOnBoard.filter((course) => course.isOnline),
    [coursesOnBoard],
  )

  const inPersonCourses = useMemo(
    () => coursesOnBoard.filter((course) => !course.isOnline),
    [coursesOnBoard],
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

  const sortedSemesters = useMemo(
    () => [...semesters].sort((a, b) => a.sortOrder - b.sortOrder),
    [semesters],
  )

  const semester = sortedSemesters.find((s) => s.id === semesterId)
  const timetable = timetables.find((t) => t.id === timetableId)
  const semTimetables = timetables
    .filter((t) => t.semesterId === semesterId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
  const selectedAvailableCourseId = availableCourses.some(
    (course) => Number(course.id) === Number(selectedCourseId),
  )
    ? Number(selectedCourseId)
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

  const onReorderSemesters = async (orderedIds) => {
    if (orderedIds.length === 0) return

    const previous = [...semesters]
    const optimistic = orderedIds
      .map((id, index) => {
        const semesterItem = previous.find((s) => s.id === id)
        return semesterItem ? { ...semesterItem, sortOrder: index } : null
      })
      .filter(Boolean)

    setSemesters(optimistic)

    try {
      const reordered = await reorderSemesters(orderedIds)
      setSemesters(reordered)
    } catch (err) {
      console.error(err)
      setSemesters(previous)
      window.alert('학기 순서를 변경하지 못했습니다.')
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

  const onReorderTimetables = async (orderedIds) => {
    if (orderedIds.length === 0) return

    const previous = timetables.filter((t) => t.semesterId === semesterId)
    const optimistic = orderedIds
      .map((id, index) => {
        const timetable = previous.find((t) => t.id === id)
        return timetable ? { ...timetable, sortOrder: index, isDefault: index === 0 } : null
      })
      .filter(Boolean)

    setTimetables((prev) => {
      const others = prev.filter((t) => t.semesterId !== semesterId)
      return [...others, ...optimistic]
    })

    try {
      const reordered = await reorderTimetables(semesterId, orderedIds)
      setTimetables((prev) => {
        const others = prev.filter((t) => t.semesterId !== semesterId)
        return [...others, ...reordered]
      })
    } catch (err) {
      console.error(err)
      setTimetables((prev) => {
        const others = prev.filter((t) => t.semesterId !== semesterId)
        return [...others, ...previous]
      })
      window.alert('시간표 순서를 변경하지 못했습니다.')
    }
  }

  const onDeleteTimetables = async (targetTimetableIds) => {
    if (targetTimetableIds.length === 0) return

    try {
      await Promise.all(targetTimetableIds.map((id) => deleteTimetable(id)))

      const remaining = timetables.filter((t) => !targetTimetableIds.includes(t.id))
      const nextAllSemesterEntries = allSemesterEntries.filter(
        (entry) => !targetTimetableIds.includes(entry.timetableId),
      )

      setTimetables(remaining)
      setEntries((prev) => prev.filter((entry) => !targetTimetableIds.includes(entry.timetableId)))
      setAllSemesterEntries(nextAllSemesterEntries)
      setNotes((prev) => pruneNotesByEntries(prev, nextAllSemesterEntries))

      if (targetTimetableIds.includes(timetableId)) {
        const nextSelected = remaining.find((t) => t.semesterId === semesterId)
        setTimetableId(nextSelected?.id ?? null)
        if (nextSelected?.id) {
          await reloadTimetableEntries(nextSelected.id)
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
      const nextEntries = entries.filter((entry) => !targetIds.has(entry.id))
      const nextAllSemesterEntries = allSemesterEntries.filter((entry) => !targetIds.has(entry.id))

      setEntries(nextEntries)
      setAllSemesterEntries(nextAllSemesterEntries)
      setNotes((prev) => pruneNotesByEntries(prev, nextAllSemesterEntries))
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
          <div className="Dashboard">
            <div className="dashboardHeader">
              <div>
                <h1 className="dashboardTitle">시간표 관리</h1>
                <p className="dashboardSubtitle">학기별 시간표와 수업을 관리합니다</p>
              </div>
            </div>
            <DashboardLoginCard description="시간표와 수업 일정을 확인하려면 로그인해주세요." />
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

          {loading && (
            <div className="timetableStatus timetableStatus--loading" aria-live="polite" aria-busy="true">
              <span className="timetableStatusSpinner" aria-hidden="true" />
              <span>시간표를 불러오는 중...</span>
            </div>
          )}
          {!loading && error && <p className="timetableStatus timetableStatus--error">{error}</p>}
          {!loading && !error && semesters.length === 0 && (
            <p className="timetableStatus timetableStatus--empty">등록된 학기가 없습니다. EDWARD 동기화 후 다시 확인해주세요.</p>
          )}

          {!loading && !error && semesters.length > 0 && (
            <>
              <TimetableControls
                DAYS={DAYS}
                semesterId={semesterId}
                timetableId={timetableId}
                semesters={sortedSemesters}
                semTimetables={semTimetables}
                availableCourses={availableCourses}
                selectedCourseId={selectedAvailableCourseId}
                onChangeSemester={onChangeSemester}
                onChangeTimetable={onChangeTimetable}
                onChangeCourse={(e) => setSelectedCourseId(Number(e.target.value))}
                onAddCourse={onAddCourse}
                onRenameSemester={onRenameSemester}
                onRenameTimetable={onRenameTimetable}
                onAddTimetable={onAddTimetable}
                onDeleteTimetables={onDeleteTimetables}
                onReorderSemesters={onReorderSemesters}
                onReorderTimetables={onReorderTimetables}
              />

              <TimetableTabs view={view} setView={setView} />

              <TimetableGrid
                DAYS={DAYS}
                TIME_SLOTS={TIME_SLOTS}
                semester={semester}
                timetable={timetable}
                semTimetables={semTimetables}
                coursesOnBoard={inPersonCourses}
                notes={notes}
                view={view}
                slotStyle={slotStyleFromTimes}
                onDeleteCourse={onDeleteCourse}
                onAddNote={onAddNote}
                onDeleteNotes={onDeleteNotes}
                onUpdateNote={onUpdateNote}
              />

              <TimetableOnlineCourses
                onlineCourses={onlineCourses}
                onDeleteCourse={onDeleteCourse}
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
