import { useState } from 'react'

export default function TimetableControls({
  DAYS,
  semesterId,
  timetableId,
  mockSemesters,
  semTimetables,
  availableCourses,
  selectedCourseId,
  onChangeSemester,
  onChangeTimetable,
  onChangeCourse,
  onAddCourse,
}) {
  // 수업 선택 모달에 표시할 수업 정보 문구 생성
  const formatCourseOption = (course) => {
    const scheduleText = course.schedules
      .map((s) => `${DAYS[s.day]} ${s.startTime}-${s.endTime}`)
      .join(', ')

    return `${course.name} · ${course.room} · ${scheduleText}`
  }

  // 현재 모달에서 선택된 수업 정보
  const selectedCourse = availableCourses.find(
    (course) => course.id === selectedCourseId,
  )
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false) // 수업 추가 모달 열림 여부

  // 선택한 수업을 추가한 뒤 모달 닫기
  const handleAddCourse = () => {
    onAddCourse()
    setIsCourseModalOpen(false)
  }

  return (
    // 학기/시간표 선택과 수업 추가 버튼 영역
    <div className="controls">
      <select
        className="select"
        value={semesterId}
        // 학기 변경 시: 해당 학기의 첫 번째 시간표로 자동 선택
        onChange={onChangeSemester}
      >
        {mockSemesters.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
            {s.isActive ? ' (현재)' : ''}
          </option>
        ))}
      </select>

      <select
        className="select"
        value={timetableId}
        // 시간표 변경 시: 선택한 시간표에 포함된 수업만 다시 표시
        onChange={onChangeTimetable}
      >
        {semTimetables.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
            {t.isDefault ? ' (기본)' : ''}
          </option>
        ))}
      </select>

      <button
        type="button"
        className="btn-primary"
        // 수업 선택 모달 열기
        onClick={() => setIsCourseModalOpen(true)}
        disabled={availableCourses.length === 0}
      >
        + 수업 목록에서 추가
      </button>

      <div
        className="courseModalOverlay"
        // 모달 상태에 따라 페이지 위에 오버레이 표시/숨김
        style={{ display: isCourseModalOpen ? 'block' : 'none' }}
      >
        {/* 수업 목록을 페이지 위 모달로 표시 */}
        <form className="courseModal" onSubmit={(e) => e.preventDefault()}>
          <div className="courseModalHead">
            <h2>수업 추가</h2>
            <button
              type="button"
              className="courseModalClose"
              // 수업 추가 없이 모달 닫기
              onClick={() => setIsCourseModalOpen(false)}
              aria-label="닫기"
            >
              ×
            </button>
          </div>

          <div className="courseModalBody">
            {availableCourses.length === 0 ? (
              <div className="courseEmpty">추가할 수업 없음</div>
            ) : (
              // 아직 시간표에 추가되지 않은 수업 목록 표시
              availableCourses.map((course) => (
                <label key={course.id} className="courseOption">
                  <input
                    type="radio"
                    name="course"
                    value={course.id}
                    checked={selectedCourseId === course.id}
                    // 현재 시간표에 추가할 수업 선택
                    onChange={onChangeCourse}
                  />
                  <span>{formatCourseOption(course)}</span>
                </label>
              ))
            )}
          </div>

          <div className="courseModalFoot">
            {/* 현재 선택된 수업을 하단에 다시 표시 */}
            <span className="courseSelected">
              {selectedCourse ? formatCourseOption(selectedCourse) : '선택된 수업 없음'}
            </span>
            <button
              type="button"
              className="btn-primary"
              onClick={handleAddCourse}
              disabled={availableCourses.length === 0}
            >
              수업 추가
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
