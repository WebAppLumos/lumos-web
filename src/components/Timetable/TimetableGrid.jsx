export default function TimetableGrid({
  DAYS,
  TIME_SLOTS,
  semester,
  timetable,
  semTimetables,
  coursesOnBoard,
  view,
  slotStyle,
  onDeleteCourse,
}) {
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
                        className="block"
                        style={{
                          ...st,
                          backgroundColor: course.color,
                        }}
                        >
                        <button
                          type="button"
                          className="blockDelete"
                          // 현재 시간표에서 해당 수업 삭제
                          onClick={() => onDeleteCourse(course.id)}
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
                            <div className="blockMeta">{course.note}</div>
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
    </div>
  )
}
