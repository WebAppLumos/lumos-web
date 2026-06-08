import { useState } from 'react'
import './TimetableControls.css'

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
  onRenameSemester,
  onRenameTimetable,
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
  const selectedSemester = mockSemesters.find((s) => s.id === semesterId)
  const selectedTimetable = semTimetables.find((t) => t.id === timetableId)
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false) // 수업 추가 모달 열림 여부
  const [selectorType, setSelectorType] = useState(null)
  const [renameType, setRenameType] = useState('semester')
  const [renamingId, setRenamingId] = useState(null)
  const [renameValue, setRenameValue] = useState('')

  // 선택한 수업을 추가한 뒤 모달 닫기
  const handleAddCourse = () => {
    onAddCourse()
    setIsCourseModalOpen(false)
  }

  const openRenameEditor = (type, item) => {
    setRenameType(type)
    setRenamingId(item.id)
    setRenameValue(item.name)
  }

  const handleRename = () => {
    if (renameType === 'semester') {
      onRenameSemester(renamingId, renameValue)
    } else {
      onRenameTimetable(renamingId, renameValue)
    }
    setRenamingId(null)
    setRenameValue('')
  }

  const cancelRename = () => {
    setRenamingId(null)
    setRenameValue('')
  }

  const closeSelectorModal = () => {
    setSelectorType(null)
    cancelRename()
  }

  return (
    // 학기/시간표 선택과 수업 추가 버튼 영역
    <div className="controls">
      <button
        type="button"
        className="selectorTrigger"
        onClick={() => setSelectorType('semester')}
      >
        <span className="selectorLabel">학기</span>
        <span className="selectorValue">
          {selectedSemester?.name}
          {selectedSemester?.isActive ? ' (현재)' : ''}
        </span>
      </button>

      <button
        type="button"
        className="selectorTrigger"
        onClick={() => setSelectorType('timetable')}
      >
        <span className="selectorLabel">시간표</span>
        <span className="selectorValue">
          {selectedTimetable?.name}
          {selectedTimetable?.isDefault ? ' (기본)' : ''}
        </span>
      </button>

      <button
        type="button"
        className="btn-primary"
        // 수업 선택 모달 열기
        onClick={() => setIsCourseModalOpen(true)}
        disabled={availableCourses.length === 0}
      >
        + 수업 목록
      </button>

      <div
        className="courseModalOverlay"
        style={{ display: selectorType ? 'block' : 'none' }}
      >
        <form className="courseModal selectorModal" onSubmit={(e) => e.preventDefault()}>
          <div className="courseModalHead">
            <h2>{selectorType === 'semester' ? '학기 선택' : '시간표 선택'}</h2>
            <button
              type="button"
              className="courseModalClose"
              onClick={closeSelectorModal}
              aria-label="닫기"
            >
              ×
            </button>
          </div>

          <div className="courseModalBody selectorList">
            {(selectorType === 'semester' ? mockSemesters : semTimetables).map((item) => {
              const isSelected = selectorType === 'semester'
                ? item.id === semesterId
                : item.id === timetableId

              return (
                <div key={item.id} className={`selectorOption ${isSelected ? 'active' : ''}`}>
                  {renamingId === item.id ? (
                    <div className="selectorRenameRow">
                      <input
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        autoFocus
                      />
                      <button
                        type="button"
                        className="selectorSave"
                        onClick={handleRename}
                        disabled={!renameValue.trim()}
                      >
                        저장
                      </button>
                      <button
                        type="button"
                        className="selectorCancel"
                        onClick={cancelRename}
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="selectorSelect"
                        onClick={() => {
                          if (selectorType === 'semester') {
                            onChangeSemester(item.id)
                          } else {
                            onChangeTimetable(item.id)
                          }
                          closeSelectorModal()
                        }}
                      >
                        <span>{item.name}</span>
                        <small>
                          {selectorType === 'semester' && item.isActive ? '현재 학기' : ''}
                          {selectorType === 'timetable' && item.isDefault ? '기본 시간표' : ''}
                        </small>
                      </button>
                      <button
                        type="button"
                        className="selectorEdit"
                        onClick={() => openRenameEditor(selectorType, item)}
                        aria-label={`${item.name} 이름 수정`}
                      >
                        ✎
                      </button>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </form>
      </div>

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
