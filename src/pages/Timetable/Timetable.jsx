import { useMemo, useState } from 'react'

import { DAYS, TIME_SLOTS, mockCourses, mockNotes, mockSemesters,
  mockTimetableEntries, mockTimetables, } from '../../lib/mock-data'

import TimetableCourseList from '../../components/Timetable/TimetableCourseList'
import TimetableControls from '../../components/Timetable/TimetableControls'
import TimetableGrid from '../../components/Timetable/TimetableGrid'
import TimetableHeader from '../../components/Timetable/TimetableHeader'
import TimetableTabs from '../../components/Timetable/TimetableTabs'
import DashboardNav from '../../components/Dashboard/DashboardNav'

import '../Dashboard/Dashboard.css'
import './Timetable.css'

// Time을 숫자로 변환 (예: "09:00" -> 9, "13:30" -> 13.5)
function timeToNumber(t) {
  const [h, m] = t.split(':').map(Number)
  return h + m / 60
}

// 시간표 블록 위치/높이 계산
function slotStyle(start, end) {
  const top = (timeToNumber(start) - 9) * 60
  const height = (timeToNumber(end) - timeToNumber(start)) * 60
  return { top: `${top}px`, height: `${height}px` }
}

export default function Timetable() {
  const [user, setUser] = useState(() => {
    // 원본 파일처럼 앱 로그인 상태는 localStorage의 사용자 정보로 판단
    const storedUser = localStorage.getItem('unidash_user')
    return storedUser ? JSON.parse(storedUser) : null
  })
  const [semesterId, setSemesterId] = useState( // 학기 ID 가져오기
    mockSemesters.find((s) => s.isActive)?.id ?? mockSemesters[0].id,
  )
  const [timetableId, setTimetableId] = useState(mockTimetables[0].id) // 시간표 ID 가져오기
  const [view, setView] = useState('info') // view 설정 (수업 정보, 노트, 난이도)
  const [semesters, setSemesters] = useState(mockSemesters)
  const [timetables, setTimetables] = useState(mockTimetables)
  const [entries, setEntries] = useState(mockTimetableEntries) // 시간표-수업 매핑
  const [notes, setNotes] = useState(mockNotes)
  const [selectedCourseId, setSelectedCourseId] = useState('') // 추가할 수업 ID

  // 현재 선택된 학기/시간표에 표시할 수업만 추려냄
  const coursesOnBoard = useMemo(() => {
    const ids = entries
      .filter((e) => e.timetableId === timetableId)
      .map((e) => e.courseId)
    return mockCourses.filter(
      (c) => c.semesterId === semesterId && ids.includes(c.id),
    )
  }, [entries, semesterId, timetableId])

  // 현재 시간표에 아직 추가되지 않은 수업 목록
  const availableCourses = useMemo(() => {
    const ids = entries
      .filter((e) => e.timetableId === timetableId)
      .map((e) => e.courseId)
    return mockCourses.filter(
      (c) => c.semesterId === semesterId && !ids.includes(c.id),
    )
  }, [entries, semesterId, timetableId])

  // 화면 표시용 선택 데이터
  const semester = semesters.find((s) => s.id === semesterId)
  const timetable = timetables.find((t) => t.id === timetableId)
  const semTimetables = timetables.filter((t) => t.semesterId === semesterId)
  const selectedAvailableCourseId = availableCourses.some((c) => c.id === selectedCourseId)
    ? selectedCourseId
    : availableCourses[0]?.id ?? ''

  // 학기를 바꾸면 해당 학기의 첫 번째 시간표를 자동 선택
  const onChangeSemester = (nextSemesterId) => {
    setSemesterId(nextSemesterId)
    const first = timetables.find((t) => t.semesterId === nextSemesterId)
    if (first) setTimetableId(first.id)
  }

  const onRenameSemester = (targetSemesterId, name) => {
    const nextName = name.trim()
    if (!nextName) return

    setSemesters((prev) => prev.map((s) => (
      s.id === targetSemesterId ? { ...s, name: nextName } : s
    )))
  }

  const onRenameTimetable = (targetTimetableId, name) => {
    const nextName = name.trim()
    if (!nextName) return

    setTimetables((prev) => prev.map((t) => (
      t.id === targetTimetableId ? { ...t, name: nextName } : t
    )))
  }

  // 사용자가 선택한 수업을 현재 시간표에 추가
  const onAddCourse = () => {
    const course = availableCourses.find((c) => c.id === selectedAvailableCourseId)
    if (!course) {
      window.alert('추가할 수업이 없습니다.')
      return
    }

    setEntries([
      ...entries,
      {
        timetableId,
        courseId: course.id,
      },
    ])
  }

  // 선택한 수업을 현재 시간표에서 제거
  const onDeleteCourse = (courseId) => {
    setEntries(entries.filter(
      (e) => !(e.timetableId === timetableId && e.courseId === courseId),
    ))
  }

  const onAddNote = (courseId, note) => {
    const now = new Date().toISOString()

    setNotes((prev) => [
      ...prev,
      {
        note_id: `note-${Date.now()}`,
        course_id: courseId,
        title: note.title,
        content: note.content,
        is_pinned: note.is_pinned,
        created_at: now,
        updated_at: now,
      },
    ])
  }

  const onDeleteNotes = (noteIds) => {
    setNotes((prev) => prev.filter((note) => !noteIds.includes(note.note_id)))
  }

  const onUpdateNote = (noteId, updates) => {
    const now = new Date().toISOString()

    setNotes((prev) => prev.map((note) => (
      note.note_id === noteId
        ? { ...note, ...updates, updated_at: now }
        : note
    )))
  }

  return (
    <div className="dashboardPage">
      <DashboardNav user={user} onLogout={() => setUser(null)} />
      <main className="dashboardMain">
        <div className="Timetable">
          <TimetableHeader />

          {/* 학기, 시간표 선택 및 수업 추가버튼 */}
          <TimetableControls
        DAYS={DAYS}
        semesterId={semesterId}
        timetableId={timetableId}
        mockSemesters={semesters}
        semTimetables={semTimetables}
        availableCourses={availableCourses}
        selectedCourseId={selectedAvailableCourseId}
        onChangeSemester={onChangeSemester}
        onChangeTimetable={setTimetableId}
        onChangeCourse={(e) => setSelectedCourseId(e.target.value)}
        onAddCourse={onAddCourse}
        onRenameSemester={onRenameSemester}
        onRenameTimetable={onRenameTimetable}
          />

          {/* 시간표 View 설정(수업 정보, 노트, 난이도) */}
          <TimetableTabs view={view} setView={setView} />

          {/* 시간표 출력 */}
          <TimetableGrid
        DAYS={DAYS}
        TIME_SLOTS={TIME_SLOTS}
        semester={semester}
        timetable={timetable}
        semTimetables={semTimetables}
        coursesOnBoard={coursesOnBoard}
        notes={notes}
        view={view}
        slotStyle={slotStyle}
        onDeleteCourse={onDeleteCourse}
        onAddNote={onAddNote}
        onDeleteNotes={onDeleteNotes}
        onUpdateNote={onUpdateNote}
          />

          {/* 시간표 정보를 카드 형태로 출력 */}
          <TimetableCourseList
        DAYS={DAYS}
        coursesOnBoard={coursesOnBoard}
        notes={notes}
        view={view}
        onDeleteCourse={onDeleteCourse}
          />
        </div>
      </main>
    </div>
  )
}
