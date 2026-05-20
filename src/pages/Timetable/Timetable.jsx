import { useMemo, useState } from 'react'
import {
  DAYS,
  TIME_SLOTS,
  mockCourses,
  mockSemesters,
  mockTimetableEntries,
  mockTimetables,
} from '../../lib/mock-data'
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
  const [semesterId, setSemesterId] = useState( // 학기 ID 가져오기
    mockSemesters.find((s) => s.isActive)?.id ?? mockSemesters[0].id,
  )
  const [timetableId, setTimetableId] = useState(mockTimetables[0].id) // 시간표 ID 가져오기
  const [view, setView] = useState('info') // view 설정 (수업 정보, 노트, 난이도)

  // 현재 시간표에 배치된 수업 목록 계산
  const coursesOnBoard = useMemo(() => {
    const ids = mockTimetableEntries
      .filter((e) => e.timetableId === timetableId)
      .map((e) => e.courseId)
    return mockCourses.filter(
      (c) => c.semesterId === semesterId && ids.includes(c.id),
    )
  }, [semesterId, timetableId])

  // view data
  const semester = mockSemesters.find((s) => s.id === semesterId)
  const timetable = mockTimetables.find((t) => t.id === timetableId)
  const semTimetables = mockTimetables.filter((t) => t.semesterId === semesterId)

  return (
    <div className="Timetable">
      <div className="Timetable-head">
        <h1 className="Timetable-title">시간표 & 일정 관리</h1>
        <p className="Timetable-desc">학기별 시간표와 수업을 관리합니다</p>
      </div>

      {/* 학기, 시간표 선택 및 수업 추가버튼 */}
      <div className="Timetable-controls">
        <select
          className="Timetable-select"
          value={semesterId}
          // 학기 변경 시: 해당 학기의 첫 번째 시간표로 자동 선택
          onChange={(e) => {
            setSemesterId(e.target.value)
            const first = mockTimetables.find((t) => t.semesterId === e.target.value)
            if (first) setTimetableId(first.id)
          }}
        >
          {mockSemesters.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
              {s.isActive ? ' (현재)' : ''}
            </option>
          ))}
        </select>

        <select
          className="Timetable-select"
          value={timetableId}
          onChange={(e) => setTimetableId(e.target.value)}
        >
          {semTimetables.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
              {t.isDefault ? ' (기본)' : ''}
            </option>
          ))}
        </select>

        <button type="button" className="Timetable-btn-primary">
          + 수업 추가
        </button>
      </div>
      {/* ================================================ */}


      {/* 시간표 View 설정(수업 정보, 노트, 난이도) */}
      <div className="Timetable-tabs">
        <button
          type="button"
          className={view === 'info' ? 'active' : ''}
          onClick={() => setView('info')}
        >
          수업 정보
        </button>
        <button
          type="button"
          className={view === 'note' ? 'active' : ''}
          onClick={() => setView('note')}
        >
          노트
        </button>
        <button
          type="button"
          className={view === 'difficulty' ? 'active' : ''}
          onClick={() => setView('difficulty')}
        >
          난이도
        </button>
      </div>
      {/* ================================================ */}


      {/* 시간표 출력 */}
      <div className="Timetable-card">
        <div className="Timetable-cardHead">
          <span className="Timetable-cardTitle">
            {semester?.name} - {timetable?.name}
          </span>
          <span className="Timetable-cardSub">
            ({semTimetables.length}개의 시간표)
          </span>
        </div>
        <div className="Timetable-gridWrap">
          <div className="Timetable-grid">
            <div className="Timetable-gridHeader">
              <div className="Timetable-timeColLabel" />
              {DAYS.map((d) => (
                <div key={d} className="Timetable-day">
                  {d}
                </div>
              ))}
            </div>
            <div className="Timetable-gridBody">
              <div className="Timetable-timeLabels">
                {TIME_SLOTS.map((t) => (
                  <div key={t} className="Timetable-timeRow">
                    {t}
                  </div>
                ))}
              </div>
              {DAYS.map((_, dayIndex) => (
                <div key={dayIndex} className="Timetable-dayCol">
                  {TIME_SLOTS.map((t) => (
                    <div key={t} className="Timetable-slot" />
                  ))}
                  {coursesOnBoard
                    .filter((c) => c.schedules.some((s) => s.day === dayIndex))
                    .map((course) => {
                      const sc = course.schedules.find((s) => s.day === dayIndex)
                      if (!sc) return null
                      const st = slotStyle(sc.startTime, sc.endTime)
                      return (
                        <div
                          key={`${course.id}-${dayIndex}`}
                          className="Timetable-block"
                          style={{
                            ...st,
                            backgroundColor: course.color,
                          }}
                        >
                          <div className="Timetable-blockName">{course.name}</div>
                          {view === 'info' && (
                            <>
                              <div className="Timetable-blockMeta">{course.room}</div>
                              <div className="Timetable-blockMeta">
                                {sc.startTime} - {sc.endTime}
                              </div>
                            </>
                          )}
                          {view === 'note' && (
                            <div className="Timetable-blockMeta">{course.note}</div>
                          )}
                          {view === 'difficulty' && (
                            <div className="Timetable-stars">
                              {'★'.repeat(course.difficulty)}
                              {'☆'.repeat(5 - course.difficulty)}
                            </div>
                          )}
                        </div>
                      )
                    })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* ================================================ */}


      {/* 시간표 정보를 카드 형태로 출력 */}
      <div className="Timetable-card">
        <div className="Timetable-cardHead">
          <span className="Timetable-cardTitle">
            {view === 'info' && '수업 정보'}
            {view === 'note' && '수업 노트'}
            {view === 'difficulty' && '과목별 난이도'}
          </span>
        </div>
        <div className="Timetable-list">
          {coursesOnBoard.map((c) => (
            <div key={c.id} className="Timetable-listItem">
              <span
                className="Timetable-dot"
                style={{ background: c.color }}
              />
              <div className="Timetable-listBody">
                <div className="Timetable-listName">{c.name}</div>
                {view === 'info' && (
                  <div className="Timetable-listMeta">
                    {c.professor} · {c.room}
                    <br />
                    {c.schedules
                      .map((s) => `${DAYS[s.day]} ${s.startTime}-${s.endTime}`)
                      .join(', ')}
                  </div>
                )}
                {view === 'note' && (
                  <div className="Timetable-listMeta">{c.note}</div>
                )}
                {view === 'difficulty' && (
                  <div className="Timetable-listMeta">
                    {'★'.repeat(c.difficulty)}
                    {'☆'.repeat(5 - c.difficulty)} ({c.difficulty}/5)
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* ================================================ */}
    </div>
  )
}
