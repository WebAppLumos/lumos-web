import './TimetableCourseList.css'

export default function TimetableCourseList({
  DAYS,
  coursesOnBoard,
  notes,
  view,
  onDeleteCourse,
}) {
  const notesForCourse = (courseId) => notes
    .filter((note) => note.course_id === courseId)
    .sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1
      return new Date(b.updated_at) - new Date(a.updated_at)
    })

  return (
    // 시간표 아래에 선택된 view에 맞는 수업 상세 정보를 목록으로 표시
    <div className="card">
      <div className="cardHead">
        <span className="cardTitle">
          {view === 'info' && '수업 정보'}
          {view === 'note' && '수업 노트'}
          {view === 'difficulty' && '과목별 난이도'}
        </span>
      </div>
      <div className="list">
        {/* 시간표에 포함된 수업을 카드형 목록으로 출력 */}
        {coursesOnBoard.map((c) => (
          <div key={c.id} className="listItem">
            <span className="dot" style={{ background: c.color }} />
            <div className="listBody">
              <div className="listName">{c.name}</div>
              { // view를 수업 정보로 변경
                view === 'info' && (
                  <div className="listMeta">
                    {c.professor} · {c.room}
                    <br />
                    {c.schedules
                      .map((s) => `${DAYS[s.day]} ${s.startTime}-${s.endTime}`)
                      .join(', ')}
                  </div>
              )}

              { // view를 노트로 변경
                view === 'note' && (
                  <div className="listMeta">
                    {notesForCourse(c.id).length > 0
                      ? notesForCourse(c.id).map((note) => (
                        <div key={note.note_id}>
                          {note.is_pinned && '★ '}
                          {note.title}
                        </div>
                      ))
                      : '노트 없음'}
                  </div>
              )}

              { // view를 난이도로 변경
                view === 'difficulty' && (
                  <div className="listMeta">
                    {'★'.repeat(c.difficulty)}
                    {'☆'.repeat(5 - c.difficulty)} ({c.difficulty}/5)
                  </div>
              )}
            </div>
            <button
              type="button"
              className="btn-delete"
              // 현재 시간표에서 해당 수업 삭제
              onClick={() => onDeleteCourse(c.id)}
            >
              삭제
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
