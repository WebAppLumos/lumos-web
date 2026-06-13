import { useState } from 'react'
import { GripVertical } from 'lucide-react'
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
  onAddTimetable,
  onDeleteTimetables,
  onReorderSemesters,
  onReorderTimetables,
}) {
  // 수업 선택 모달에 표시할 수업 정보 문구 생성
  const formatCourseOption = (course) => {
    const scheduleText = course.schedules
      .map((s) => `${DAYS[s.day]} ${s.startTime}-${s.endTime}`)
      .join(', ')
    const creditText = course.credit != null ? `${course.credit}학점` : null
    const locationText = course.isOnline ? '온라인' : course.room

    return [course.name, course.professor, locationText, creditText, scheduleText]
      .filter(Boolean)
      .join(' · ')
  }

  // 현재 모달에서 선택된 수업 정보
  const selectedCourse = availableCourses.find(
    (course) => Number(course.id) === Number(selectedCourseId),
  )
  const selectedSemester = mockSemesters.find((s) => s.id === semesterId)
  const selectedTimetable = semTimetables.find((t) => t.id === timetableId)
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false) // 수업 추가 모달 열림 여부
  const [selectorType, setSelectorType] = useState(null)
  const [renameType, setRenameType] = useState('semester')
  const [renamingId, setRenamingId] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const [selectedTimetableIds, setSelectedTimetableIds] = useState([])
  const [isAddTimetableOpen, setIsAddTimetableOpen] = useState(false)
  const [newTimetableName, setNewTimetableName] = useState('')
  const [dragItemId, setDragItemId] = useState(null)
  const [dragOverItemId, setDragOverItemId] = useState(null)

  const selectorItems = selectorType === 'semester' ? mockSemesters : semTimetables
  const canReorder = selectorType === 'semester' || selectorType === 'timetable'

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

  const toggleTimetableSelection = (targetTimetableId) => {
    setSelectedTimetableIds((prev) => (
      prev.includes(targetTimetableId)
        ? prev.filter((id) => id !== targetTimetableId)
        : [...prev, targetTimetableId]
    ))
  }

  const handleAddTimetable = () => {
    onAddTimetable(newTimetableName)
    setNewTimetableName('')
    setIsAddTimetableOpen(false)
    setSelectedTimetableIds([])
    closeSelectorModal()
  }

  const handleDeleteSelectedTimetables = () => {
    onDeleteTimetables(selectedTimetableIds)
    setSelectedTimetableIds([])
    cancelRename()
  }

  const closeSelectorModal = () => {
    setSelectorType(null)
    cancelRename()
    setSelectedTimetableIds([])
    setIsAddTimetableOpen(false)
    setNewTimetableName('')
    setDragItemId(null)
    setDragOverItemId(null)
  }

  const handleItemDragStart = (event, itemId) => {
    setDragItemId(itemId)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(itemId))
  }

  const handleItemDragOver = (event, itemId) => {
    event.preventDefault()
    if (itemId !== dragItemId) {
      setDragOverItemId(itemId)
    }
  }

  const handleItemDrop = (event, targetId) => {
    event.preventDefault()
    const sourceId = dragItemId
    setDragItemId(null)
    setDragOverItemId(null)

    if (!sourceId || sourceId === targetId) return

    const ids = selectorItems.map((item) => item.id)
    const fromIndex = ids.indexOf(sourceId)
    const toIndex = ids.indexOf(targetId)
    if (fromIndex < 0 || toIndex < 0) return

    const nextIds = [...ids]
    nextIds.splice(fromIndex, 1)
    nextIds.splice(toIndex, 0, sourceId)

    if (selectorType === 'semester') {
      onReorderSemesters(nextIds)
    } else {
      onReorderTimetables(nextIds)
    }
  }

  const clearItemDrag = () => {
    setDragItemId(null)
    setDragOverItemId(null)
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
            <div>
              <h2>{selectorType === 'semester' ? '학기 선택' : '시간표 선택'}</h2>
              {selectorType === 'semester' && (
                <p className="selectorModalSub">드래그하여 학기 순서를 변경할 수 있습니다.</p>
              )}
              {selectorType === 'timetable' && (
                <p className="selectorModalSub">드래그하여 순서를 변경하거나, 시간표를 추가·삭제할 수 있습니다.</p>
              )}
            </div>
            <div className="selectorHeadActions">
              {selectorType === 'timetable' && (
                <button
                  type="button"
                  className="btn-primary selectorAddToggle"
                  onClick={() => {
                    setIsAddTimetableOpen((prev) => !prev)
                    cancelRename()
                  }}
                >
                  시간표 추가
                </button>
              )}
              <button
                type="button"
                className="courseModalClose"
                onClick={closeSelectorModal}
                aria-label="닫기"
              >
                ×
              </button>
            </div>
          </div>

          <div className="courseModalBody selectorList">
            {selectorType === 'timetable' && (
              <div className="selectorToolbar">
                <span>{semTimetables.length}개의 시간표</span>
                <button
                  type="button"
                  className="selectorDeleteSelected"
                  onClick={handleDeleteSelectedTimetables}
                  disabled={selectedTimetableIds.length === 0}
                >
                  선택 삭제
                </button>
              </div>
            )}

            {selectorItems.map((item) => {
              const isSelected = selectorType === 'semester'
                ? item.id === semesterId
                : item.id === timetableId

              return (
                <div
                  key={item.id}
                  className={[
                    'selectorOption',
                    isSelected ? 'active' : '',
                    canReorder && dragOverItemId === item.id ? 'dragOver' : '',
                    canReorder && dragItemId === item.id ? 'dragging' : '',
                  ].filter(Boolean).join(' ')}
                  onDragOver={canReorder
                    ? (event) => handleItemDragOver(event, item.id)
                    : undefined}
                  onDrop={canReorder
                    ? (event) => handleItemDrop(event, item.id)
                    : undefined}
                >
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
                      {canReorder && (
                        <button
                          type="button"
                          className="selectorDragHandle"
                          draggable
                          onDragStart={(event) => handleItemDragStart(event, item.id)}
                          onDragEnd={clearItemDrag}
                          aria-label={`${item.name} 순서 변경`}
                        >
                          <GripVertical size={16} aria-hidden="true" />
                        </button>
                      )}
                      {selectorType === 'timetable' && (
                        <input
                          type="checkbox"
                          className="selectorCheck"
                          checked={selectedTimetableIds.includes(item.id)}
                          onChange={() => toggleTimetableSelection(item.id)}
                          aria-label={`${item.name} 선택`}
                        />
                      )}
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

            {selectorType === 'timetable' && semTimetables.length === 0 && (
              <div className="selectorEmpty">등록된 시간표가 없습니다.</div>
            )}

            {selectorType === 'timetable' && isAddTimetableOpen && (
              <div className="selectorAddPanel">
                <div className="selectorAddHead">시간표 추가</div>
                <input
                  type="text"
                  value={newTimetableName}
                  onChange={(e) => setNewTimetableName(e.target.value)}
                  placeholder="시간표 이름"
                  autoFocus
                />
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleAddTimetable}
                  disabled={!newTimetableName.trim()}
                >
                  저장
                </button>
              </div>
            )}
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
                    checked={Number(selectedCourseId) === Number(course.id)}
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
