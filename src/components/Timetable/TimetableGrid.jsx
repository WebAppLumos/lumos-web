import { useMemo, useState } from 'react'
import './TimetableGrid.css'

export default function TimetableGrid({
  DAYS,
  TIME_SLOTS,
  semester,
  timetable,
  semTimetables,
  coursesOnBoard,
  notes,
  view,
  slotStyle,
  onDeleteCourse,
  onAddNote,
  onDeleteNotes,
  onUpdateNote,
}) {
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [selectedNoteIds, setSelectedNoteIds] = useState([])
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false)
  const [editingNoteId, setEditingNoteId] = useState(null)
  const [editNoteTitle, setEditNoteTitle] = useState('')
  const [editNoteContent, setEditNoteContent] = useState('')
  const [editNotePinned, setEditNotePinned] = useState(false)
  const [newNoteTitle, setNewNoteTitle] = useState('')
  const [newNoteContent, setNewNoteContent] = useState('')
  const [newNotePinned, setNewNotePinned] = useState(false)

  const notesByCourse = useMemo(() => {
    return notes.reduce((acc, note) => {
      acc[note.course_id] = [...(acc[note.course_id] ?? []), note]
      return acc
    }, {})
  }, [notes])

  const sortNotes = (items) => [...items].sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1
    return new Date(b.updated_at) - new Date(a.updated_at)
  })

  const modalNotes = selectedCourse
    ? sortNotes(notesByCourse[selectedCourse.id] ?? [])
    : []

  const openNoteModal = (course) => {
    if (view !== 'note') return
    setSelectedCourse(course)
    setSelectedNoteIds([])
  }

  const closeNoteModal = () => {
    setSelectedCourse(null)
    setSelectedNoteIds([])
    setIsAddNoteOpen(false)
    setEditingNoteId(null)
    setNewNoteTitle('')
    setNewNoteContent('')
    setNewNotePinned(false)
  }

  const toggleNoteSelection = (noteId) => {
    setSelectedNoteIds((prev) => (
      prev.includes(noteId)
        ? prev.filter((id) => id !== noteId)
        : [...prev, noteId]
    ))
  }

  const handleAddNote = () => {
    if (!selectedCourse || !newNoteTitle.trim()) return

    onAddNote(selectedCourse.id, {
      title: newNoteTitle.trim(),
      content: newNoteContent.trim(),
      is_pinned: newNotePinned,
    })
    setNewNoteTitle('')
    setNewNoteContent('')
    setNewNotePinned(false)
    setIsAddNoteOpen(false)
  }

  const handleDeleteSelectedNotes = () => {
    onDeleteNotes(selectedNoteIds)
    setSelectedNoteIds([])
  }

  const startEditNote = (note) => {
    setIsAddNoteOpen(false)
    setEditingNoteId(note.note_id)
    setEditNoteTitle(note.title)
    setEditNoteContent(note.content)
    setEditNotePinned(note.is_pinned)
  }

  const cancelEditNote = () => {
    setEditingNoteId(null)
    setEditNoteTitle('')
    setEditNoteContent('')
    setEditNotePinned(false)
  }

  const handleUpdateNote = () => {
    if (!editingNoteId || !editNoteTitle.trim()) return

    onUpdateNote(editingNoteId, {
      title: editNoteTitle.trim(),
      content: editNoteContent.trim(),
      is_pinned: editNotePinned,
    })
    cancelEditNote()
  }

  return (
    // 요일/시간 슬롯 기준으로 수업 블록을 배치하는 시간표 영역
    <div className="card">
      <div className="cardHead">
        <span className="cardTitle">
          {semester?.name} - {timetable?.name}
        </span>
        <span className="cardSub">
          ({semTimetables.length}개의 시간표)
        </span>
      </div>
      <div className="gridWrap">
        <div className="grid">
          <div className="gridHeader">
            <div className="timeColLabel" />
            {DAYS.map((d) => (
              <div key={d} className="day">
                {d}
              </div>
            ))}
          </div>
          <div className="gridBody">
            <div className="timeLabels">
              {TIME_SLOTS.map((t) => (
                <div key={t} className="timeRow">
                  {t}
                </div>
              ))}
            </div>
            {DAYS.map((_, dayIndex) => (
              <div key={dayIndex} className="dayCol">
                {TIME_SLOTS.map((t) => (
                  <div key={t} className="slot" />
                ))}
                {/* 현재 요일에 수업이 있는 과목만 블록으로 표시 */}
                {coursesOnBoard
                  .filter((c) => c.schedules.some((s) => s.day === dayIndex))
                  .map((course) => {
                    const sc = course.schedules.find((s) => s.day === dayIndex)
                    if (!sc) return null
                    // 시작/종료 시간을 CSS top/height 값으로 변환
                    const st = slotStyle(sc.startTime, sc.endTime)
                    return (
                      <div
                        key={`${course.id}-${dayIndex}`}
                        className={`block ${view === 'note' ? 'blockClickable' : ''}`}
                        style={{
                          ...st,
                          backgroundColor: course.color,
                        }}
                        onClick={() => openNoteModal(course)}
                        >
                        <button
                          type="button"
                          className="blockDelete"
                          // 현재 시간표에서 해당 수업 삭제
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteCourse(course.id)
                          }}
                          aria-label={`${course.name} 삭제`}
                        >
                          ×
                        </button>
                        <div className="blockName">{course.name}</div>
                        {/* 선택된 탭에 따라 블록 안의 부가 정보 변경 */}
                        { // view를 수업 정보로 변경
                          view === 'info' && (
                            <>
                              <div className="blockMeta">{course.room}</div>
                              <div className="blockMeta">
                                {sc.startTime} - {sc.endTime}
                              </div>
                            </>
                        )}
                        { // view를 노트로 변경
                          view === 'note' && (
                            <div className="noteTitleList">
                              {sortNotes(notesByCourse[course.id] ?? []).length > 0 ? (
                                sortNotes(notesByCourse[course.id] ?? []).slice(0, 3).map((note) => (
                                  <div key={note.note_id} className="noteTitleItem">
                                    {note.is_pinned && <span className="pin">★</span>}
                                    {note.title}
                                  </div>
                                ))
                              ) : (
                                <div className="noteTitleItem empty">노트 없음</div>
                              )}
                            </div>
                        )}
                        { // view를 난이도로 변경
                          view === 'difficulty' && (
                            <div className="stars">
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
      <div
        className="courseModalOverlay"
        style={{ display: selectedCourse ? 'block' : 'none' }}
      >
        <form className="courseModal noteModal" onSubmit={(e) => e.preventDefault()}>
          <div className="courseModalHead">
            <div>
              <h2>{selectedCourse?.name} 노트</h2>
              <p className="noteModalSub">고정된 노트가 목록 상단에 표시됩니다.</p>
            </div>
            <div className="noteModalHeadActions">
              <button
                type="button"
                className="btn-primary noteAddToggle"
                onClick={() => setIsAddNoteOpen((prev) => !prev)}
              >
                노트 추가
              </button>
              <button
                type="button"
                className="courseModalClose"
                onClick={closeNoteModal}
                aria-label="닫기"
              >
                ×
              </button>
            </div>
          </div>

          <div className="noteModalBody">
            <div className="noteModalToolbar">
              <span>{modalNotes.length}개의 노트</span>
              <button
                type="button"
                className="noteDeleteSelected"
                onClick={handleDeleteSelectedNotes}
                disabled={selectedNoteIds.length === 0}
              >
                선택 삭제
              </button>
            </div>

            <div className="noteList">
              {modalNotes.length > 0 ? (
                modalNotes.map((note) => (
                  <div key={note.note_id} className="noteItem">
                    {editingNoteId === note.note_id ? (
                      <div className="noteEditPanel">
                        <input
                          type="text"
                          value={editNoteTitle}
                          onChange={(e) => setEditNoteTitle(e.target.value)}
                          placeholder="노트 제목"
                        />
                        <textarea
                          value={editNoteContent}
                          onChange={(e) => setEditNoteContent(e.target.value)}
                          placeholder="간단한 내용"
                          rows="3"
                        />
                        <label className="notePinField">
                          <input
                            type="checkbox"
                            checked={editNotePinned}
                            onChange={(e) => setEditNotePinned(e.target.checked)}
                          />
                          상단에 고정
                        </label>
                        <div className="noteEditActions">
                          <button
                            type="button"
                            className="noteEditSave"
                            onClick={handleUpdateNote}
                            disabled={!editNoteTitle.trim()}
                          >
                            저장
                          </button>
                          <button
                            type="button"
                            className="noteEditCancel"
                            onClick={cancelEditNote}
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <input
                          type="checkbox"
                          checked={selectedNoteIds.includes(note.note_id)}
                          onChange={() => toggleNoteSelection(note.note_id)}
                          aria-label={`${note.title} 선택`}
                        />
                        <div className="noteItemBody">
                          <div className="noteItemTitle">
                            {note.is_pinned && <span className="pin">★</span>}
                            {note.title}
                          </div>
                          <div className="noteItemContent">
                            {note.content || '내용 없음'}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="noteEditButton"
                          onClick={() => startEditNote(note)}
                          aria-label={`${note.title} 수정`}
                        >
                          ✎
                        </button>
                      </>
                    )}
                  </div>
                ))
              ) : (
                <div className="noteEmpty">등록된 노트가 없습니다.</div>
              )}
            </div>

            {isAddNoteOpen && (
              <div className="noteAddPanel">
                <div className="noteAddHead">노트 추가</div>
                <input
                  type="text"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  placeholder="노트 제목"
                />
                <textarea
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="간단한 내용"
                  rows="3"
                />
                <label className="notePinField">
                  <input
                    type="checkbox"
                    checked={newNotePinned}
                    onChange={(e) => setNewNotePinned(e.target.checked)}
                  />
                  상단에 고정
                </label>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleAddNote}
                  disabled={!newNoteTitle.trim()}
                >
                  저장
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
